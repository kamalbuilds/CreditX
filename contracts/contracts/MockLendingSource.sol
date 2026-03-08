// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title MockLendingSource
 * @notice Simulates an Ethereum lending protocol that emits loan events
 * @dev Used for hackathon demo to show USC cross-chain verification flow
 */
contract MockLendingSource {
    struct MockLoan {
        address borrower;
        uint256 amount;
        uint256 createdAt;
        bool repaid;
        bool defaulted;
    }

    mapping(uint256 => MockLoan) public mockLoans;
    uint256 public nextLoanId;

    event LoanCreated(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 timestamp
    );

    event LoanRepaid(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 timestamp
    );

    event LoanDefaulted(
        uint256 indexed loanId,
        address indexed borrower,
        uint256 amount,
        uint256 timestamp
    );

    /**
     * @notice Simulate creating a loan on "Ethereum"
     */
    function createLoan(uint256 amount) external {
        uint256 loanId = nextLoanId++;
        mockLoans[loanId] = MockLoan({
            borrower: msg.sender,
            amount: amount,
            createdAt: block.timestamp,
            repaid: false,
            defaulted: false
        });

        emit LoanCreated(loanId, msg.sender, amount, block.timestamp);
    }

    /**
     * @notice Simulate repaying a loan
     */
    function repayLoan(uint256 loanId) external {
        MockLoan storage loan = mockLoans[loanId];
        require(loan.borrower == msg.sender, "Not your loan");
        require(!loan.repaid && !loan.defaulted, "Loan already settled");

        loan.repaid = true;
        emit LoanRepaid(loanId, msg.sender, loan.amount, block.timestamp);
    }

    /**
     * @notice Simulate a loan default
     */
    function defaultLoan(uint256 loanId) external {
        MockLoan storage loan = mockLoans[loanId];
        require(!loan.repaid && !loan.defaulted, "Loan already settled");

        loan.defaulted = true;
        emit LoanDefaulted(loanId, loan.borrower, loan.amount, block.timestamp);
    }
}
