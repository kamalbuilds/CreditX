// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./CreditReputation.sol";
import "./UniversalVerifier.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CreditXLendingPool
 * @notice Dynamic undercollateralized lending pool powered by credit reputation scores
 * @dev LTV ratios adjust from 50-150% based on the borrower's soulbound credit NFT score
 */
contract CreditXLendingPool is Ownable, ReentrancyGuard {
    CreditReputation public reputation;
    UniversalVerifier public verifier;

    // Pool state
    uint256 public totalDeposited;
    uint256 public totalBorrowed;

    // Interest rates (annual, in basis points)
    uint256 public constant BASE_RATE = 1000;    // 10% base
    uint256 public constant MIN_RATE = 200;       // 2% for top scores
    uint256 public constant MAX_RATE = 2500;      // 25% for lowest scores
    uint256 public constant LIQUIDATION_BONUS = 500; // 5% bonus for liquidators

    struct Deposit {
        uint256 amount;
        uint256 timestamp;
    }

    struct Loan {
        uint256 borrowed;
        uint256 collateral;
        uint256 interestRate;  // annual rate in bps
        uint256 startTime;
        uint256 requiredLTV;   // in bps
        bool active;
    }

    mapping(address => Deposit) public deposits;
    mapping(address => Loan) public loans;

    // Protocol stats
    uint256 public totalLoansIssued;
    uint256 public totalRepaid;
    uint256 public totalLiquidated;

    event Deposited(address indexed lender, uint256 amount);
    event Withdrawn(address indexed lender, uint256 amount);
    event LoanCreated(
        address indexed borrower,
        uint256 borrowed,
        uint256 collateral,
        uint256 interestRate,
        uint256 requiredLTV,
        uint256 creditScore
    );
    event LoanRepaid(address indexed borrower, uint256 amount, uint256 interest);
    event Liquidated(
        address indexed borrower,
        address indexed liquidator,
        uint256 collateralSeized,
        uint256 debtRepaid
    );

    constructor(address _reputation, address _verifier) Ownable(msg.sender) {
        reputation = CreditReputation(_reputation);
        verifier = UniversalVerifier(_verifier);
    }

    // === LENDER FUNCTIONS ===

    /**
     * @notice Deposit CTC into the lending pool to earn interest
     */
    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Must deposit something");

        deposits[msg.sender].amount += msg.value;
        deposits[msg.sender].timestamp = block.timestamp;
        totalDeposited += msg.value;

        emit Deposited(msg.sender, msg.value);
    }

    /**
     * @notice Withdraw deposited CTC from the lending pool
     */
    function withdraw(uint256 amount) external nonReentrant {
        require(deposits[msg.sender].amount >= amount, "Insufficient deposit");
        require(address(this).balance >= amount, "Insufficient pool liquidity");

        deposits[msg.sender].amount -= amount;
        totalDeposited -= amount;

        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    // === BORROWER FUNCTIONS ===

    /**
     * @notice Borrow CTC with dynamic collateral based on credit score
     * @param borrowAmount Amount of CTC to borrow
     */
    function borrow(uint256 borrowAmount) external payable nonReentrant {
        require(!loans[msg.sender].active, "Existing loan must be repaid first");
        require(borrowAmount > 0, "Must borrow something");
        require(address(this).balance >= borrowAmount, "Insufficient pool liquidity");

        // Get credit score and calculate required collateral
        uint256 score = reputation.getScore(msg.sender);
        uint256 requiredLTV = verifier.getLTVForScore(score);
        uint256 requiredCollateral = (borrowAmount * requiredLTV) / 10000;

        require(msg.value >= requiredCollateral, "Insufficient collateral");

        // Calculate interest rate (inverse to score)
        uint256 interestRate = _getInterestRate(score);

        // Create loan
        loans[msg.sender] = Loan({
            borrowed: borrowAmount,
            collateral: msg.value,
            interestRate: interestRate,
            startTime: block.timestamp,
            requiredLTV: requiredLTV,
            active: true
        });

        totalBorrowed += borrowAmount;
        totalLoansIssued++;

        // Transfer borrowed amount to user
        (bool success,) = msg.sender.call{value: borrowAmount}("");
        require(success, "Transfer failed");

        emit LoanCreated(
            msg.sender,
            borrowAmount,
            msg.value,
            interestRate,
            requiredLTV,
            score
        );
    }

    /**
     * @notice Repay loan and get collateral back
     */
    function repay() external payable nonReentrant {
        Loan storage loan = loans[msg.sender];
        require(loan.active, "No active loan");

        uint256 interest = _calculateInterest(msg.sender);
        uint256 totalOwed = loan.borrowed + interest;
        require(msg.value >= totalOwed, "Must repay full amount + interest");

        uint256 collateralReturn = loan.collateral;
        loan.active = false;
        totalBorrowed -= loan.borrowed;
        totalRepaid++;

        // Return collateral + any excess payment
        uint256 refund = collateralReturn + (msg.value - totalOwed);
        (bool success,) = msg.sender.call{value: refund}("");
        require(success, "Transfer failed");

        emit LoanRepaid(msg.sender, loan.borrowed, interest);
    }

    /**
     * @notice Liquidate an unhealthy loan (health factor < 1)
     * @param borrower The borrower to liquidate
     */
    function liquidate(address borrower) external nonReentrant {
        Loan storage loan = loans[borrower];
        require(loan.active, "No active loan");
        require(getHealthFactor(borrower) < 100, "Loan is healthy");

        uint256 collateral = loan.collateral;
        uint256 debt = loan.borrowed + _calculateInterest(borrower);

        loan.active = false;
        totalBorrowed -= loan.borrowed;
        totalLiquidated++;

        // Liquidator gets collateral minus debt (with bonus)
        uint256 liquidatorReward = (collateral * (10000 + LIQUIDATION_BONUS)) / 10000;
        if (liquidatorReward > collateral) liquidatorReward = collateral;

        (bool success,) = msg.sender.call{value: liquidatorReward}("");
        require(success, "Transfer failed");

        // Return remaining to borrower (if any)
        if (collateral > liquidatorReward) {
            (bool s2,) = borrower.call{value: collateral - liquidatorReward}("");
            require(s2, "Transfer failed");
        }

        emit Liquidated(borrower, msg.sender, collateral, debt);
    }

    // === VIEW FUNCTIONS ===

    /**
     * @notice Get health factor of a loan (100 = healthy, <100 = liquidatable)
     */
    function getHealthFactor(address borrower) public view returns (uint256) {
        Loan storage loan = loans[borrower];
        if (!loan.active) return type(uint256).max;

        uint256 totalDebt = loan.borrowed + _calculateInterest(borrower);
        if (totalDebt == 0) return type(uint256).max;

        // health = (collateral * 10000) / (debt * requiredLTV / 10000)
        return (loan.collateral * 10000 * 100) / (totalDebt * loan.requiredLTV);
    }

    /**
     * @notice Preview borrowing terms for a user
     */
    function previewBorrow(address user, uint256 borrowAmount) external view returns (
        uint256 requiredCollateral,
        uint256 interestRateBps,
        uint256 creditScore,
        uint256 ltvBps
    ) {
        creditScore = reputation.getScore(user);
        ltvBps = verifier.getLTVForScore(creditScore);
        requiredCollateral = (borrowAmount * ltvBps) / 10000;
        interestRateBps = _getInterestRate(creditScore);
    }

    /**
     * @notice Get pool utilization rate
     */
    function getUtilization() external view returns (uint256) {
        if (totalDeposited == 0) return 0;
        return (totalBorrowed * 10000) / totalDeposited;
    }

    /**
     * @notice Get current interest owed on a loan
     */
    function getInterestOwed(address borrower) external view returns (uint256) {
        return _calculateInterest(borrower);
    }

    // === INTERNAL ===

    function _getInterestRate(uint256 score) internal pure returns (uint256) {
        if (score >= 900) return MIN_RATE;      // 2%
        if (score >= 750) return 500;            // 5%
        if (score >= 500) return BASE_RATE;      // 10%
        if (score >= 200) return 1500;           // 15%
        return MAX_RATE;                          // 25%
    }

    function _calculateInterest(address borrower) internal view returns (uint256) {
        Loan storage loan = loans[borrower];
        if (!loan.active) return 0;

        uint256 elapsed = block.timestamp - loan.startTime;
        // Simple interest: principal * rate * time / (365 days * 10000)
        return (loan.borrowed * loan.interestRate * elapsed) / (365 days * 10000);
    }

    receive() external payable {}
}
