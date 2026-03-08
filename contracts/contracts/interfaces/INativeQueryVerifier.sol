// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/**
 * @title INativeQueryVerifier
 * @notice Interface for Creditcoin's USC Native Query Verifier precompile at 0x0FD2
 */
interface INativeQueryVerifier {
    function verify(bytes calldata proof) external view returns (bool);
    function verifyAndEmit(bytes calldata proof) external returns (bool);
}
