# CreditX: The Universal DeFi Credit Layer

> Your credit reputation should follow you everywhere. Now it does.

---

## One-Liner

**CreditX** uses Creditcoin's USC precompile to create the world's first portable, cross-chain credit reputation that unlocks undercollateralized DeFi lending.

---

## The Problem: $3 Trillion Locked Out

DeFi lending today has a brutal gatekeeping problem:

- **150-300% overcollateralization** is the industry standard. To borrow $1K, lock up $1.5K-$3K first.
- **1.4 billion unbanked adults** globally have no on-chain history to leverage.
- **Cross-chain users** with perfect Ethereum repayment records get **zero credit** on any new chain.
- **$3T+ in undercollateralized lending demand** has no DeFi solution.

The root cause: **DeFi has no portable credit memory.** Your reputation dies at every chain boundary.

Creditcoin was literally built to solve this problem. Its tagline is "The Credit Network." Yet no one has built the credit layer that makes good on that promise.

**Until now.**

---

## Why Creditcoin + USC = The Perfect Stack

Creditcoin's **Universal Smart Contracts (USC)** precompile is the missing piece:

| Capability | What It Enables for CreditX |
|:---|:---|
| **NativeQueryVerifier (0x0FD2)** | Trustlessly verify Ethereum loan events on Creditcoin without oracles |
| **Merkle + Continuity Proofs** | Cryptographic proof that a user repaid a loan on another chain |
| **~15 second verification** | Real-time credit updates, not batch processing |
| **Any-chain extensibility** | Every new USC-supported chain adds to your credit score |

CreditX isn't just "built on Creditcoin." It's built **because of USC**. Without USC, this protocol requires oracles, centralized APIs, and trust assumptions. With USC, it's fully trustless and on-chain.

---

## What We Built

### Smart Contracts (Solidity 0.8.28, deployed on Creditcoin EVM Testnet)

1. **CreditReputation.sol** - Soulbound ERC-721 NFT
   - Score: 0-1000 (dynamic, on-chain)
   - Tracks total loans, repayments, defaults, proof hashes
   - Non-transferable (disabled `transferFrom`, `approve`, `setApprovalForAll`)

2. **UniversalVerifier.sol** - USC Integration
   - Calls `NativeQueryVerifier` at `0x0FD2` for cross-chain proof verification
   - Replay protection via processed proof mapping
   - Score calculation: +50 per repayment, -100 per default (weighted by loan size)

3. **CreditXLendingPool.sol** - Dynamic Lending
   - LTV tiers: 50% (score 900+) to 150% (score <200)
   - Interest tiers: 2% APR (top) to 25% APR (bottom)
   - Full lifecycle: deposit, borrow, repay, liquidate
   - Health factor monitoring for liquidation protection

4. **MockLendingSource.sol** - Demo Simulation
   - Simulates Ethereum Aave/Compound loan events
   - Emits LoanCreated, LoanRepaid, LoanDefaulted events

### The Flow

```
Connect Wallets -> USC Verifies History -> Mint Soulbound NFT -> Borrow at Better Rates
      |                    |                      |                       |
  ETH + CTC         Precompile 0x0FD2      Score: 847/1000         50% collateral
                   (trustless, ~15s)        (on-chain, portable)    (vs 150% standard)
```

---

## Market Opportunity

| Metric | Value |
|:---|:---|
| Global undercollateralized lending gap | **$3T+** |
| Unbanked adults worldwide | **1.4B** |
| DeFi TVL (total addressable) | **$50B+** |
| Creditcoin legacy credit transactions | **3M+** |
| Current solutions doing this on Creditcoin | **0** |

CreditX sits at the intersection of DeFi lending and real-world credit. This is the exact thesis Creditcoin was founded on.

---

## Competitive Landscape

| Project | Chain | Cross-chain? | USC? | Soulbound? | Dynamic LTV? |
|:---|:---|:---:|:---:|:---:|:---:|
| Aave/Compound | Multi | No | No | No | No |
| Spectral Finance | Ethereum | No | No | No | No |
| Masa Finance | Multi | Partial | No | No | No |
| Arcx | Ethereum | No | No | Yes | Limited |
| **CreditX** | **Creditcoin** | **Yes** | **Yes** | **Yes** | **Yes** |

CreditX is the only project combining **USC cross-chain verification** + **soulbound reputation** + **dynamic undercollateralized lending** in a single protocol.

---

## Differentiation from Other Hackathon Submissions

~25% of BUIDL CTC submissions attempt basic credit scoring. Here's why CreditX is different:

1. **We USE USC** - Most submissions mention Creditcoin but don't use its flagship feature. We call `0x0FD2` directly.
2. **Cross-chain, not single-chain** - We aggregate history from Ethereum, not just Creditcoin.
3. **Working lending pool** - Not just a score. We built the full lending lifecycle with dynamic LTV.
4. **Soulbound** - The NFT is non-transferable. Your reputation can't be bought or sold.

---

## CEIP Roadmap Vision

CreditX is built for the long game. Here's the path from hackathon MVP to CEIP-funded protocol:

**Phase 1 (Q2 2026)** - AI Risk Engine
- On-chain or oracle-based ML model for dynamic score weighting
- Factor in loan amounts, repayment speed, default patterns

**Phase 2 (Q3 2026)** - Multi-Chain Expansion
- Add Bitcoin, BSC, Polygon, Arbitrum via USC
- Every chain becomes a credit data source

**Phase 3 (Q4 2026)** - Institutional Features
- KYC-gated institutional lending pools
- Credit-backed stablecoin collateral
- Compliance framework for regulated lenders

**Phase 4 (2027)** - Privacy & Scale
- ZK-proof layer for selective score sharing
- Cross-protocol reputation API
- Governance token for pool parameters

**CEIP Ask**: $25K-$250K to fund Phase 1-2 development, security audit, and mainnet deployment.

---

## The Bottom Line

Creditcoin's thesis is that **credit is the bridge between real-world financial activity and DeFi.** CreditX is the first protocol to actually build that bridge using Creditcoin's own USC technology.

- **For users**: Better borrowing terms based on your actual track record
- **For Creditcoin**: The killer dApp that showcases why USC matters
- **For DeFi**: The beginning of portable, trustless credit reputation

**CreditX: Because your credit should follow you, not the other way around.**
