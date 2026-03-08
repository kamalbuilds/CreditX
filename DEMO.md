# CreditX v2 - Demo Walkthrough
## 2-Minute Video Script

> Target: Concise, high-energy walkthrough showing the full CreditX flow on Creditcoin Testnet.

---

## Pre-Recording Setup

- [ ] Contracts deployed to Creditcoin Testnet (Chain ID: 102031)
- [ ] Frontend running on Vercel or localhost
- [ ] Demo wallet loaded with tCTC from faucet
- [ ] Lending pool pre-funded with tCTC deposits
- [ ] Screen recording tool ready (Loom / OBS)
- [ ] Browser with MetaMask configured for Creditcoin Testnet

---

## Script

### [0:00 - 0:15] Hook + Problem Statement

**[Screen: CreditX landing page]**

> "What if your DeFi credit score followed you across every chain?"
>
> "Right now, DeFi lending requires 150% or more collateral. You need $1,500 locked up just to borrow $1,000. Your repayment history on Ethereum? Worthless the moment you move to a new chain."
>
> "CreditX fixes this."

---

### [0:15 - 0:30] What CreditX Is

**[Screen: Architecture diagram or animated flow graphic]**

> "CreditX is a universal reputation lending protocol on Creditcoin. We use Creditcoin's USC precompile to trustlessly verify your loan history from Ethereum and mint a soulbound credit NFT, a score from 0 to 1000 that unlocks better borrowing terms."
>
> "No oracles. No centralized APIs. Pure on-chain verification."

---

### [0:30 - 0:55] Live Demo: Verify Credit History

**[Screen: CreditX Dashboard - Connect Wallet]**

> "Let me show you. I'm connecting my wallet to CreditX on Creditcoin Testnet."

**[Action: Click Connect Wallet, MetaMask popup, approve]**

> "I have loan history on Ethereum. Watch what happens when I click 'Verify My History.'"

**[Action: Click Verify button]**

> "Behind the scenes, the UniversalVerifier contract is calling Creditcoin's USC precompile at address 0x0FD2. It's verifying my Ethereum repayment events using Merkle proofs. No trust required."

**[Screen: Transaction confirming on Blockscout]**

> "And there it is. My soulbound Credit Reputation NFT has been minted."

---

### [0:55 - 1:15] Live Demo: Credit Score Dashboard

**[Screen: Dashboard showing score]**

> "My Universal Credit Score: 847 out of 1000. The dashboard breaks it down: 12 verified loans, 11 repaid, 1 default. Each one verified cross-chain through USC."
>
> "This score is on-chain, in a soulbound NFT that can't be transferred or gamed. And because it's on Creditcoin, any future dApp can read it."

**[Screen: Highlight the LTV tier table]**

> "With an 847 score, I'm in the 75% collateral tier. I only need $750 to borrow $1,000, instead of $1,500. My interest rate drops to 5% APR instead of the standard 25%."

---

### [1:15 - 1:40] Live Demo: Borrow with Reduced Collateral

**[Screen: Borrow interface]**

> "Let's borrow. I want 1 CTC."

**[Action: Enter borrow amount, show the dynamic collateral calculation]**

> "The pool calculates my required collateral based on my score. 0.75 CTC instead of 1.5. That's the power of cross-chain credit reputation."

**[Action: Click Borrow, approve transaction]**

> "Transaction confirmed. I've borrowed 1 CTC with only 75% collateral. That's half what a new user would need."

**[Screen: Show loan details on dashboard - borrowed amount, collateral, interest rate, health factor]**

---

### [1:40 - 1:55] USC + Technical Depth

**[Screen: Blockscout showing contract interactions or code snippet]**

> "What makes this special is the USC integration. Our UniversalVerifier contract calls Creditcoin's NativeQueryVerifier precompile directly. This is Creditcoin's native cross-chain verification, the technology the chain was built around."
>
> "Every proof is replay-protected. Every score update is fully on-chain. The soulbound NFT can't be transferred, sold, or faked."

---

### [1:55 - 2:00] Close + Vision

**[Screen: CreditX logo + tagline]**

> "CreditX: Your credit should follow you, not the other way around."
>
> "The universal DeFi credit layer, built on Creditcoin, powered by USC."

---

## Key Points to Hit

1. **USC is central** - Emphasize that CreditX uses the NativeQueryVerifier precompile (0x0FD2). This is the differentiator.
2. **Show real transactions** - Every action should produce a visible transaction on Blockscout.
3. **Numbers matter** - Show the concrete collateral savings (75% vs 150%).
4. **Soulbound = credible** - Emphasize non-transferability. You earn your score, you can't buy it.
5. **Speed** - Keep the energy high. No dead air. Every second counts in a 2-minute video.

## Recording Tips

- Use a clean browser profile (no extra tabs/bookmarks visible)
- Zoom to 110-125% so text is readable on small screens
- Pre-load MetaMask with the right network to avoid fumbling
- Practice the flow 2-3 times before recording
- Have a backup recording in case of testnet issues
- Add subtle background music (royalty-free, low volume)
