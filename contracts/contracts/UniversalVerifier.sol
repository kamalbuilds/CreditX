// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./interfaces/INativeQueryVerifier.sol";
import "./CreditReputation.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title UniversalVerifier
 * @notice Verifies cross-chain loan events using Creditcoin's USC precompile (0x0FD2)
 *         and updates the CreditReputation soulbound NFT accordingly.
 */
contract UniversalVerifier is Ownable {
    // USC Native Query Verifier precompile address
    address constant NATIVE_VERIFIER = 0x0000000000000000000000000000000000000FD2;

    CreditReputation public reputation;

    // Replay protection
    mapping(bytes32 => bool) public processedProofs;

    // Score calculation parameters
    uint256 public constant BASE_SCORE = 300;
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant REPAYMENT_BOOST = 50;  // score increase per repayment
    uint256 public constant DEFAULT_PENALTY = 100;  // score decrease per default
    uint256 public constant MIN_SCORE = 0;

    // Events
    event CrossChainVerified(
        address indexed user,
        bytes32 indexed proofHash,
        bool isRepayment,
        uint256 loanAmount,
        string sourceChain
    );
    event ManualVerification(
        address indexed user,
        bool isRepayment,
        uint256 loanAmount,
        string reason
    );

    constructor(address _reputation) Ownable(msg.sender) {
        reputation = CreditReputation(_reputation);
    }

    /**
     * @notice Verify a cross-chain loan event using USC precompile and update reputation
     * @param user The user whose reputation to update
     * @param proof The Merkle proof from USC
     * @param isRepayment True if the event is a loan repayment, false if default
     * @param loanAmount The amount of the loan (for weighting)
     * @param sourceChain Name of the source chain (e.g., "Ethereum")
     */
    function verifyCrossChainEvent(
        address user,
        bytes calldata proof,
        bool isRepayment,
        uint256 loanAmount,
        string calldata sourceChain
    ) external {
        bytes32 proofHash = keccak256(proof);
        require(!processedProofs[proofHash], "Proof already processed");

        // Call USC precompile for verification
        bool verified = _verifyWithUSC(proof);
        require(verified, "USC verification failed");

        processedProofs[proofHash] = true;

        // Ensure user has a reputation NFT
        if (!reputation.hasReputation(user)) {
            reputation.mintReputation(user, BASE_SCORE);
        }

        // Calculate new score
        uint256 currentScore = reputation.getScore(user);
        uint256 newScore = _calculateScore(currentScore, isRepayment, loanAmount);

        // Update reputation
        reputation.updateScore(
            user,
            newScore,
            proofHash,
            isRepayment,
            isRepayment ? "Cross-chain loan repaid" : "Cross-chain loan defaulted"
        );

        emit CrossChainVerified(user, proofHash, isRepayment, loanAmount, sourceChain);
    }

    /**
     * @notice Register a loan event for demo/testing (owner only, no USC verification)
     * @dev Used for hackathon demo when USC testnet may be unavailable
     */
    function registerLoanEvent(
        address user,
        bool isRepayment,
        uint256 loanAmount,
        string calldata reason
    ) external onlyOwner {
        if (!reputation.hasReputation(user)) {
            reputation.mintReputation(user, BASE_SCORE);
        }

        uint256 currentScore = reputation.getScore(user);
        uint256 newScore = _calculateScore(currentScore, isRepayment, loanAmount);
        bytes32 eventHash = keccak256(abi.encodePacked(user, isRepayment, loanAmount, block.timestamp));

        reputation.updateScore(user, newScore, eventHash, isRepayment, reason);

        emit ManualVerification(user, isRepayment, loanAmount, reason);
    }

    /**
     * @notice Batch register multiple loan events (for building credit history demo)
     */
    function batchRegisterEvents(
        address user,
        bool[] calldata isRepayments,
        uint256[] calldata amounts,
        string[] calldata reasons
    ) external onlyOwner {
        require(isRepayments.length == amounts.length, "Array length mismatch");
        require(amounts.length == reasons.length, "Array length mismatch");

        if (!reputation.hasReputation(user)) {
            reputation.mintReputation(user, BASE_SCORE);
        }

        for (uint256 i = 0; i < isRepayments.length; i++) {
            uint256 currentScore = reputation.getScore(user);
            uint256 newScore = _calculateScore(currentScore, isRepayments[i], amounts[i]);
            bytes32 eventHash = keccak256(abi.encodePacked(user, isRepayments[i], amounts[i], block.timestamp, i));

            reputation.updateScore(user, newScore, eventHash, isRepayments[i], reasons[i]);
        }
    }

    /**
     * @dev Call the USC precompile at 0x0FD2 to verify a cross-chain proof
     */
    function _verifyWithUSC(bytes calldata proof) internal view returns (bool) {
        try INativeQueryVerifier(NATIVE_VERIFIER).verify(proof) returns (bool result) {
            return result;
        } catch {
            return false;
        }
    }

    /**
     * @dev Calculate new credit score based on loan event
     */
    function _calculateScore(
        uint256 currentScore,
        bool isRepayment,
        uint256 loanAmount
    ) internal pure returns (uint256) {
        // Weight boost/penalty by loan size (larger loans = more impact)
        uint256 weight = 1;
        if (loanAmount > 10 ether) weight = 3;
        else if (loanAmount > 1 ether) weight = 2;

        if (isRepayment) {
            uint256 boost = REPAYMENT_BOOST * weight;
            uint256 newScore = currentScore + boost;
            return newScore > MAX_SCORE ? MAX_SCORE : newScore;
        } else {
            uint256 penalty = DEFAULT_PENALTY * weight;
            if (penalty > currentScore) return MIN_SCORE;
            return currentScore - penalty;
        }
    }

    /**
     * @notice Get the LTV tier for a given score
     * @return ltvBps LTV in basis points (e.g., 5000 = 50%)
     */
    function getLTVForScore(uint256 score) external pure returns (uint256 ltvBps) {
        if (score >= 900) return 5000;   // 50% collateral needed (best)
        if (score >= 750) return 7500;   // 75%
        if (score >= 500) return 10000;  // 100%
        if (score >= 200) return 12000;  // 120%
        return 15000;                     // 150% (worst / new users)
    }
}
