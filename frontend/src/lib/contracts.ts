// Contract addresses - will be updated once titan deploys
export const CONTRACTS = {
  CreditReputation: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  UniversalVerifier: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  CreditXLendingPool: "0x0000000000000000000000000000000000000000" as `0x${string}`,
  MockLendingSource: "0x0000000000000000000000000000000000000000" as `0x${string}`,
};

export const CreditReputationABI = [
  { inputs: [{ name: "user", type: "address" }], name: "getReputation", outputs: [{ name: "score", type: "uint256" }, { name: "totalLoans", type: "uint256" }, { name: "repaidLoans", type: "uint256" }, { name: "defaultedLoans", type: "uint256" }, { name: "lastUpdated", type: "uint256" }, { name: "proofCount", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "getScore", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "user", type: "address" }], name: "hasReputation", outputs: [{ name: "", type: "bool" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "owner", type: "address" }], name: "balanceOf", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "tokenId", type: "uint256" }], name: "tokenURI", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "name", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], stateMutability: "view", type: "function" },
] as const;

export const UniversalVerifierABI = [
  { inputs: [{ name: "user", type: "address" }, { name: "isRepayment", type: "bool" }, { name: "loanAmount", type: "uint256" }, { name: "reason", type: "string" }], name: "registerLoanEvent", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "user", type: "address" }, { name: "proof", type: "bytes" }, { name: "isRepayment", type: "bool" }, { name: "loanAmount", type: "uint256" }, { name: "sourceChain", type: "string" }], name: "verifyCrossChainEvent", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "score", type: "uint256" }], name: "getLTVForScore", outputs: [{ name: "ltvBps", type: "uint256" }], stateMutability: "pure", type: "function" },
  { inputs: [], name: "reputation", outputs: [{ name: "", type: "address" }], stateMutability: "view", type: "function" },
] as const;

export const CreditXLendingPoolABI = [
  { inputs: [], name: "deposit", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "amount", type: "uint256" }], name: "withdraw", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "borrowAmount", type: "uint256" }], name: "borrow", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [], name: "repay", outputs: [], stateMutability: "payable", type: "function" },
  { inputs: [{ name: "borrower", type: "address" }], name: "liquidate", outputs: [], stateMutability: "nonpayable", type: "function" },
  { inputs: [{ name: "user", type: "address" }, { name: "borrowAmount", type: "uint256" }], name: "previewBorrow", outputs: [{ name: "requiredCollateral", type: "uint256" }, { name: "interestRateBps", type: "uint256" }, { name: "creditScore", type: "uint256" }, { name: "ltvBps", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "borrower", type: "address" }], name: "getHealthFactor", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "borrower", type: "address" }], name: "getInterestOwed", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "getUtilization", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalDeposited", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalBorrowed", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalLoansIssued", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalRepaid", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [], name: "totalLiquidated", outputs: [{ name: "", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "address" }], name: "deposits", outputs: [{ name: "amount", type: "uint256" }, { name: "timestamp", type: "uint256" }], stateMutability: "view", type: "function" },
  { inputs: [{ name: "", type: "address" }], name: "loans", outputs: [{ name: "borrowed", type: "uint256" }, { name: "collateral", type: "uint256" }, { name: "interestRate", type: "uint256" }, { name: "startTime", type: "uint256" }, { name: "requiredLTV", type: "uint256" }, { name: "active", type: "bool" }], stateMutability: "view", type: "function" },
] as const;
