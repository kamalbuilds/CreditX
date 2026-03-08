# CreditX v2: Universal Reputation Lending
**Product Requirements Document (PRD)**
**Hackathon Project for BUIDL CTC 2026**
**Version:** 1.0
**Date:** March 8, 2026
**Team:** CreditX Labs
**Track:** DeFi
**Status:** MVP-ready for hackathon submission

---

## 1. Executive Summary

**CreditX** is a **trustless, cross-chain undercollateralized lending protocol** built natively on Creditcoin.

It uses Creditcoin's flagship **Universal Smart Contracts (USC)** + Native Query Verifier precompile (`0x0FD2`) to create the world's first **portable, on-chain Universal Credit Reputation** that aggregates verified repayment history from Ethereum (and any chain) + Creditcoin's legacy 3M+ credit transactions.

This reputation is minted as a **soulbound NFT** (non-transferable) that dynamically unlocks LTV ratios as low as **50%** (vs industry 150%+ standard) and better interest rates.

**Why it wins the hackathon & CEIP fast-track:**
- Perfect manifestation of Creditcoin's entire thesis (credit as the bridge between off-chain reality and DeFi).
- Heavy USC showcase (the feature the Creditcoin team highlights in every doc).
- Real-world financial inclusion impact for underbanked users.
- Zero direct competition on DoraHacks.

**MVP Scope:** Fully functional on Creditcoin EVM Testnet in <48 hours.
**Prize Target:** Grand Prize ($10k) + CEIP fast-track.

---

## 2. Problem Statement

Current DeFi lending is broken for real users:
- Over-collateralization (150-300% LTV) locks out 99% of emerging-market borrowers.
- Credit scores are siloed per chain or centralized (not verifiable).
- No way to bring proven repayment history from Ethereum, legacy Creditcoin, or real-world credit into one protocol.
- Result: $3T+ global undercollateralized lending gap remains unsolved.

Creditcoin was literally built to solve this but no dApp has weaponized USC + legacy data into a production-grade lending engine yet.

---

## 3. Solution & Value Proposition

**CreditX = Universal Reputation -> Dynamic Lending**

1. User connects any wallet (Ethereum + Creditcoin).
2. USC verifies repayment events cross-chain in ~15 seconds (Merkle + continuity proofs).
3. Smart contract mints/updates **Soulbound Credit Reputation NFT** (score 0-1000).
4. Lending pool reads score on-chain -> auto-adjusts LTV (50-150%) + interest rate.
5. Borrow / Repay / Liquidate all on Creditcoin with CTC as gas.

**Unique Moats**
- Aggregates **Creditcoin legacy 3M+ transactions** (via direct contract read on same chain).
- Trustless (no oracles, no centralized API).
- Portable soulbound NFT usable across future Creditcoin dApps.
- AI risk engine (off-chain scoring model for MVP, on-chain later).

**Target Users**
- DeFi power users with Ethereum history who want better rates.
- Emerging-market borrowers/SMEs with Creditcoin credit history.
- Institutions looking for verified cross-chain credit primitives.

---

## 4. Key Features (MVP vs Future)

### MVP (Hackathon Deliverable - 100% feasible)
| Feature | Description | Priority |
|---------|-------------|----------|
| Cross-Chain Verification Engine | USC precompile `0x0FD2` verifies Ethereum loan repayment events | Must-have |
| Legacy Creditcoin History Import | Direct read of on-chain credit events (same chain) | Must-have |
| Soulbound Reputation NFT | ERC-721 soulbound (no transfer) with metadata score + proof hash | Must-have |
| Dynamic Lending Pool | LTV 50-150% + interest tiers based on score (0-1000) | Must-have |
| Borrow/Repay UI | Simple Next.js + wagmi + RainbowKit frontend | Must-have |
| Dashboard | "Your Universal Score: 847/1000" + verified sources | Must-have |
| Testnet Deployment | Full deployment on Creditcoin EVM Testnet (Chain ID 102031) | Must-have |

### Post-Hackathon (Phase 2 - CEIP roadmap)
- AI risk engine (on-chain via precompile or off-chain oracle)
- Multi-chain support (Bitcoin, BSC, etc.)
- Credit-backed stablecoin collateral
- Institutional KYC-gated pools
- ZK-proof privacy layer for score sharing

---

## 5. User Flows

**Flow 1: Onboard & Get Scored (Primary)**
1. Connect Ethereum + Creditcoin wallet
2. Click "Verify My History"
3. USC worker submits proofs -> precompile `0x0FD2` verifies
4. Mint/Update Soulbound NFT (gas ~0.01 CTC)
5. Dashboard shows score + breakdown

**Flow 2: Borrow (Core)**
1. Connect wallet
2. Score auto-loaded from NFT
3. Select amount & collateral (ERC-20 or native CTC)
4. Smart contract calculates dynamic LTV -> approve & borrow
5. Repay later -> score auto-increases

**Flow 3: Liquidation**
- Standard over-collateralization protection (health factor <1)
- Liquidators get bonus; borrower score slightly penalized

---

## 6. Technical Architecture

**Chain:** Creditcoin EVM Testnet
- **Chain ID:** 102031
- **RPC:** `https://rpc.cc3-testnet.creditcoin.network`
- **Explorer:** https://creditcoin-testnet.blockscout.com
- **USC Testnet (for verification):** RPC `https://rpc.usc-testnet2.creditcoin.network` / Chain ID 102036

**Core Contracts (Solidity 0.8.24)**
1. `CreditReputation.sol` - Soulbound NFT + score logic
2. `UniversalVerifier.sol` - Calls precompile `0x0FD2` (NativeQueryVerifier)
3. `CreditXLendingPool.sol` - Dynamic LTV logic, borrow/repay
4. `OracleWorker` (off-chain, Node.js) - Listens to Ethereum events, submits proofs (fork official gluwa example)

**Precompile Usage (from official docs)**
```solidity
interface NativeQueryVerifier {
    function verify(bytes memory proof) external view returns (bool);
}

contract UniversalVerifier {
    address constant VERIFIER = 0x0000000000000000000000000000000000000FD2;

    function verifyCrossChain(bytes memory proof, bytes memory txData) external {
        bool valid = NativeQueryVerifier(VERIFIER).verify(proof);
        require(valid, "USC verification failed");
        // decode & update reputation
    }
}
```

**Frontend:** Next.js 15 + Tailwind + wagmi/viem + RainbowKit + Blockscout API

**Backend/Worker:** Simple Node.js + ethers.js

**Storage:** On-chain only (no IPFS needed for MVP)

**Security:**
- All verification on-chain via USC
- ReentrancyGuard + access control
- Auditable in 1 day (small codebase)

---

## 7. Hackathon Deliverables (Submission Checklist)

- [ ] GitHub repo (public, with README + detailed README.md)
- [ ] Deployed contracts on Creditcoin Testnet (verified on Blockscout)
- [ ] Live frontend (Vercel deployment)
- [ ] 2-minute demo video (Loom)
- [ ] Pitch deck (10 slides - problem, solution, USC demo, traction potential)
- [ ] USC integration proof (screenshots of precompile calls)
- [ ] Testnet faucet tCTC used & documented

---

## 8. Success Metrics (for Judging & CEIP)

- **Technical:** 100% USC usage demonstrated
- **Innovation:** First portable cross-chain credit NFT on Creditcoin
- **Impact:** "This is exactly why we built USC" narrative
- **Feasibility:** MVP live before deadline
- **Post-hack:** Ready for $25k-$250k CEIP investment

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| USC testnet instability | Use official examples + fallback to mock verifier |
| Time pressure | MVP-first (lending without AI first) |
| No legacy data contract | Query Creditcoin events directly (team can provide address if needed) |
| Frontend polish | Use shadcn/ui + existing templates |

---

## 10. Smart Contract Architecture

### CreditReputation.sol (Soulbound NFT)
- ERC-721 with transfer disabled (soulbound)
- Score: uint256 (0-1000)
- Metadata: verified sources count, last update timestamp, proof hashes
- Functions: `mintReputation()`, `updateScore()`, `getScore()`
- Only callable by UniversalVerifier contract

### UniversalVerifier.sol
- Interfaces with NativeQueryVerifier at `0x0FD2`
- Decodes cross-chain transaction data
- Validates loan events (creation, repayment, default)
- Calculates score delta based on event type
- Replay protection via `mapping(bytes32 => bool)`

### CreditXLendingPool.sol
- Accepts CTC as collateral
- Reads score from CreditReputation NFT
- Dynamic LTV calculation:
  - Score 0-200: 150% collateral required
  - Score 200-500: 120% collateral
  - Score 500-750: 100% collateral
  - Score 750-900: 75% collateral
  - Score 900-1000: 50% collateral
- Interest rate tiers (inverse to score)
- Borrow, repay, liquidate functions
- Health factor monitoring

### MockLendingSource.sol (for demo)
- Simulates Ethereum lending events
- Emits `LoanCreated`, `LoanRepaid`, `LoanDefaulted` events
- Used to demonstrate USC verification flow

---

## 11. Next Steps (Immediate)

1. Fork `gluwa/usc-testnet-bridge-examples`
2. Deploy Reputation + Lending contracts via Hardhat
3. Spin up off-chain worker
4. Build dashboard frontend
5. Record demo & submit
