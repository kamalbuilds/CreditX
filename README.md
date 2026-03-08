<p align="center">
  <h1 align="center">CreditX v2</h1>
  <h3 align="center">Universal Reputation Lending on Creditcoin</h3>
  <p align="center">
    The first portable cross-chain credit reputation protocol. Borrow with less collateral. Build credit across chains.
  </p>
  <p align="center">
    <a href="#how-it-works">How It Works</a> |
    <a href="#architecture">Architecture</a> |
    <a href="#usc-integration">USC Integration</a> |
    <a href="#contracts">Contracts</a> |
    <a href="#getting-started">Get Started</a>
  </p>
</p>

---

## The Problem

DeFi lending is broken for real people.

Every major lending protocol (Aave, Compound, MakerDAO) requires **150-300% overcollateralization**. To borrow $1,000, you need to lock up $1,500-$3,000 first.

This creates a **$3 trillion+ global undercollateralized lending gap**:

- **1.4 billion adults** remain unbanked worldwide
- **Emerging-market SMEs** can't access DeFi capital despite proven repayment track records
- **Cross-chain users** with years of perfect loan history on Ethereum get zero credit when they move to a new chain
- Your credit reputation **dies at every chain boundary**

The fundamental problem: **DeFi has no memory.** Every chain, every protocol treats you as a stranger.

## The Solution

**CreditX** creates a **Universal Credit Reputation** that follows you across chains.

We use Creditcoin's **Universal Smart Contracts (USC)** to trustlessly verify your loan history from Ethereum (and any supported chain), aggregate it with Creditcoin's own 3M+ legacy credit transactions, and mint a **soulbound NFT** that represents your on-chain credit score (0-1000).

This score directly unlocks **better borrowing terms**: lower collateral requirements (as low as 50%) and lower interest rates (as low as 2% APR).

**No oracles. No centralized APIs. Pure on-chain verification via USC.**

## How It Works

```
 1. CONNECT             2. VERIFY               3. SCORE              4. BORROW
 +-----------+        +---------------+       +--------------+      +-------------+
 | Connect   |  --->  | USC Precompile|  ---> | Soulbound    | ---> | Dynamic LTV |
 | Ethereum  |        | (0x0FD2)      |       | Credit NFT   |      | Lending Pool|
 | + CTC     |        | Verifies Loan |       | Score: 847   |      | 50-150%     |
 | Wallets   |        | History       |       | /1000        |      | Collateral  |
 +-----------+        +---------------+       +--------------+      +-------------+
                             |                       |
                      Cross-chain Merkle      Score increases
                      + Continuity Proofs     with each repayment
```

**Step 1: Connect** - Link your Ethereum wallet alongside your Creditcoin wallet

**Step 2: Verify** - USC's NativeQueryVerifier precompile (`0x0FD2`) trustlessly verifies your cross-chain loan repayment events using Merkle and continuity proofs. No oracles needed.

**Step 3: Score** - A soulbound (non-transferable) ERC-721 NFT is minted with your Universal Credit Score (0-1000). The score aggregates verified repayments from Ethereum + Creditcoin's legacy 3M+ credit transactions. Each verified repayment increases your score; defaults decrease it.

**Step 4: Borrow** - The lending pool reads your on-chain score and dynamically adjusts your terms:

| Credit Score | Collateral Required | Interest Rate | Profile |
|:---:|:---:|:---:|:---|
| 900-1000 | **50%** | 2% APR | Excellent credit history |
| 750-899 | 75% | 5% APR | Strong track record |
| 500-749 | 100% | 10% APR | Moderate history |
| 200-499 | 120% | 15% APR | Limited history |
| 0-199 | 150% | 25% APR | New / poor history |

A user with a score of 900+ can borrow **$1,000 with only $500 collateral** instead of the standard $1,500.

## Architecture

```
+----------------------------------------------------------+
|                    CREDITCOIN EVM TESTNET                 |
|                     (Chain ID: 102031)                    |
|                                                          |
|  +------------------+     +------------------------+     |
|  | CreditReputation |<----| UniversalVerifier      |     |
|  | (Soulbound NFT)  |     |                        |     |
|  |                  |     |  Calls USC Precompile   |     |
|  | - Score 0-1000   |     |  at 0x0FD2 to verify   |     |
|  | - Proof hashes   |     |  cross-chain proofs    |     |
|  | - Loan history   |     |                        |     |
|  +--------+---------+     +-----------+------------+     |
|           |                           |                  |
|           v                           |                  |
|  +------------------+     +----------v-----------+       |
|  | CreditXLendingPool|     | NativeQueryVerifier  |       |
|  |                  |     | (Precompile 0x0FD2)  |       |
|  | - Dynamic LTV    |     | [CREDITCOIN NATIVE]  |       |
|  | - Deposit/Borrow |     +----------+-----------+       |
|  | - Repay/Liquidate|                |                   |
|  | - Health factor  |                |                   |
|  +------------------+     +----------v-----------+       |
|                           | Cross-chain Proofs   |       |
|                           | (Merkle + Continuity)|       |
+---------------------------|----------------------+-------+
                            |
               +------------v-------------+
               |       ETHEREUM            |
               |  (Source Chain)            |
               |                           |
               |  +---------------------+  |
               |  | MockLendingSource   |  |
               |  | (Aave/Compound sim) |  |
               |  |                     |  |
               |  | LoanCreated events  |  |
               |  | LoanRepaid events   |  |
               |  | LoanDefaulted events|  |
               |  +---------------------+  |
               +---------------------------+
```

## USC Integration

CreditX is built around Creditcoin's **Universal Smart Contracts (USC)** precompile, the chain's flagship cross-chain verification feature.

### How We Use USC

The `UniversalVerifier` contract calls the **NativeQueryVerifier** precompile at address `0x0000000000000000000000000000000000000FD2`:

```solidity
interface NativeQueryVerifier {
    function verify(bytes memory proof) external view returns (bool);
}

contract UniversalVerifier {
    address constant NATIVE_VERIFIER = 0x0000000000000000000000000000000000000FD2;

    function verifyCrossChainEvent(
        address user,
        bytes calldata proof,
        bool isRepayment,
        uint256 loanAmount,
        string calldata sourceChain
    ) external {
        // Verify cross-chain proof via USC precompile
        bool verified = INativeQueryVerifier(NATIVE_VERIFIER).verify(proof);
        require(verified, "USC verification failed");

        // Update user's soulbound credit reputation
        // ...
    }
}
```

### Why USC Matters Here

| Without USC | With USC (CreditX) |
|:---|:---|
| Need trusted oracles for cross-chain data | Trustless on-chain verification |
| Centralized API for credit history | Decentralized proof verification |
| Credit score locked to one chain | Portable across all USC-supported chains |
| Days to verify history | ~15 seconds per proof |

USC makes CreditX possible without any centralized intermediary. This is exactly the use case Creditcoin was built for.

## Tech Stack

| Layer | Technology |
|:---|:---|
| **Chain** | Creditcoin EVM Testnet (Chain ID: 102031) |
| **Contracts** | Solidity 0.8.28, Hardhat, OpenZeppelin 5.x |
| **Cross-chain** | USC NativeQueryVerifier Precompile (0x0FD2) |
| **Frontend** | Next.js 15, Tailwind CSS, wagmi/viem, RainbowKit |
| **Token Standard** | ERC-721 (Soulbound, non-transferable) |
| **Security** | ReentrancyGuard, Ownable, replay protection |

## Contracts

### Smart Contract Overview

| Contract | Purpose |
|:---|:---|
| `CreditReputation.sol` | Soulbound ERC-721 NFT storing credit scores (0-1000) with full loan history tracking |
| `UniversalVerifier.sol` | USC precompile integration for trustless cross-chain proof verification + score calculation |
| `CreditXLendingPool.sol` | Dynamic lending pool with score-based LTV (50-150%) and tiered interest rates (2-25%) |
| `MockLendingSource.sol` | Simulates Ethereum lending events for demo (LoanCreated, LoanRepaid, LoanDefaulted) |

### Deployed Contracts (Creditcoin Testnet)

| Contract | Address |
|:---|:---|
| CreditReputation | `TBD` |
| UniversalVerifier | `TBD` |
| CreditXLendingPool | `TBD` |
| MockLendingSource | `TBD` |

> Verify on [Creditcoin Testnet Blockscout](https://creditcoin-testnet.blockscout.com)

## Getting Started

### Prerequisites

- Node.js 18+
- A wallet with tCTC (testnet CTC) from the [Creditcoin Testnet Faucet](https://faucet.cc3-testnet.creditcoin.network)

### Install & Build Contracts

```bash
cd contracts
npm install
npx hardhat compile
```

### Deploy to Creditcoin Testnet

```bash
# Set your private key
cp .env.example .env
# Edit .env with your PRIVATE_KEY

# Deploy
npx hardhat run scripts/deploy.js --network creditcoinTestnet
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Network Configuration

| Parameter | Value |
|:---|:---|
| Network Name | Creditcoin Testnet |
| RPC URL | `https://rpc.cc3-testnet.creditcoin.network` |
| Chain ID | `102031` |
| Currency | CTC |
| Explorer | `https://creditcoin-testnet.blockscout.com` |

## Hackathon

**BUIDL CTC 2026** | DeFi Track

### Why CreditX Wins

1. **Perfect USC Showcase** - Heavy, meaningful use of Creditcoin's flagship cross-chain feature
2. **First of Its Kind** - No other project creates portable cross-chain credit reputation NFTs on Creditcoin
3. **Real-World Impact** - Directly addresses the $3T+ undercollateralized lending gap and financial inclusion
4. **Production Path** - Clear CEIP roadmap from hackathon MVP to mainnet protocol

### CEIP Roadmap (Post-Hackathon)

- **Phase 1**: AI risk engine for dynamic score weighting
- **Phase 2**: Multi-chain support (Bitcoin, BSC, Polygon via USC)
- **Phase 3**: Credit-backed stablecoin collateral
- **Phase 4**: Institutional KYC-gated pools
- **Phase 5**: ZK-proof privacy layer for selective score sharing

## Team

**CreditX Labs**

---

<p align="center">
  Built on <a href="https://creditcoin.org">Creditcoin</a> | Powered by USC
</p>
