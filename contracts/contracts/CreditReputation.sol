// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CreditReputation
 * @notice Soulbound NFT representing a user's universal credit score (0-1000)
 * @dev Non-transferable ERC721. Score is updated by the UniversalVerifier contract.
 */
contract CreditReputation is ERC721, Ownable {
    struct ReputationData {
        uint256 score;           // 0-1000
        uint256 totalLoans;      // total verified loans
        uint256 repaidLoans;     // successfully repaid
        uint256 defaultedLoans;  // defaulted
        uint256 lastUpdated;     // timestamp
        bytes32[] proofHashes;   // verification proof hashes
    }

    mapping(address => ReputationData) public reputations;
    mapping(uint256 => address) private _tokenOwners;

    address public verifier; // UniversalVerifier contract
    uint256 private _nextTokenId;

    event ReputationMinted(address indexed user, uint256 tokenId, uint256 initialScore);
    event ScoreUpdated(address indexed user, uint256 oldScore, uint256 newScore, string reason);
    event VerifierUpdated(address indexed oldVerifier, address indexed newVerifier);

    modifier onlyVerifier() {
        require(msg.sender == verifier, "Only verifier can update scores");
        _;
    }

    constructor() ERC721("CreditX Reputation", "CXREP") Ownable(msg.sender) {
        _nextTokenId = 1;
    }

    function setVerifier(address _verifier) external onlyOwner {
        address old = verifier;
        verifier = _verifier;
        emit VerifierUpdated(old, _verifier);
    }

    /**
     * @notice Mint a soulbound reputation NFT for a new user
     * @param user The address to mint the reputation for
     * @param initialScore Initial credit score (typically 300 for new users)
     */
    function mintReputation(address user, uint256 initialScore) external onlyVerifier {
        require(balanceOf(user) == 0, "User already has reputation");
        require(initialScore <= 1000, "Score cannot exceed 1000");

        uint256 tokenId = _nextTokenId++;
        _mint(user, tokenId);
        _tokenOwners[tokenId] = user;

        reputations[user] = ReputationData({
            score: initialScore,
            totalLoans: 0,
            repaidLoans: 0,
            defaultedLoans: 0,
            lastUpdated: block.timestamp,
            proofHashes: new bytes32[](0)
        });

        emit ReputationMinted(user, tokenId, initialScore);
    }

    /**
     * @notice Update user's credit score based on verified loan events
     * @param user The user whose score to update
     * @param newScore The new score value
     * @param proofHash Hash of the verification proof
     * @param isRepayment True if loan was repaid, false if defaulted
     * @param reason Description of the update
     */
    function updateScore(
        address user,
        uint256 newScore,
        bytes32 proofHash,
        bool isRepayment,
        string calldata reason
    ) external onlyVerifier {
        require(balanceOf(user) > 0, "User has no reputation");
        require(newScore <= 1000, "Score cannot exceed 1000");

        ReputationData storage rep = reputations[user];
        uint256 oldScore = rep.score;

        rep.score = newScore;
        rep.totalLoans++;
        rep.lastUpdated = block.timestamp;
        rep.proofHashes.push(proofHash);

        if (isRepayment) {
            rep.repaidLoans++;
        } else {
            rep.defaultedLoans++;
        }

        emit ScoreUpdated(user, oldScore, newScore, reason);
    }

    /**
     * @notice Get a user's credit score
     */
    function getScore(address user) external view returns (uint256) {
        return reputations[user].score;
    }

    /**
     * @notice Get full reputation data for a user
     */
    function getReputation(address user) external view returns (
        uint256 score,
        uint256 totalLoans,
        uint256 repaidLoans,
        uint256 defaultedLoans,
        uint256 lastUpdated,
        uint256 proofCount
    ) {
        ReputationData storage rep = reputations[user];
        return (
            rep.score,
            rep.totalLoans,
            rep.repaidLoans,
            rep.defaultedLoans,
            rep.lastUpdated,
            rep.proofHashes.length
        );
    }

    /**
     * @notice Check if a user has a reputation NFT
     */
    function hasReputation(address user) external view returns (bool) {
        return balanceOf(user) > 0;
    }

    // === SOULBOUND: Disable all transfers ===

    function transferFrom(address, address, uint256) public pure override {
        revert("Soulbound: transfers disabled");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Soulbound: transfers disabled");
    }

    function approve(address, uint256) public pure override {
        revert("Soulbound: approvals disabled");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("Soulbound: approvals disabled");
    }
}
