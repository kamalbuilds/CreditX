export const mockProtocolStats = {
  tvl: 2_450_000,
  activeLoans: 847,
  avgCreditScore: 682,
  totalBorrowed: 1_850_000,
  totalRepaid: 1_200_000,
  totalLiquidated: 45_000,
  utilization: 75.5,
};

export const mockUserScore = {
  score: 847,
  totalLoans: 12,
  repaidLoans: 11,
  defaultedLoans: 0,
  lastUpdated: Date.now() / 1000,
  proofCount: 15,
  verifiedSources: [
    { chain: "Ethereum", events: 8, type: "Aave v3 Repayments" },
    { chain: "Creditcoin", events: 4, type: "Legacy Credit History" },
    { chain: "Ethereum", events: 3, type: "Compound v3 Loans" },
  ],
};

export const mockLoan = {
  borrowed: 5_000n * 10n ** 18n,
  collateral: 4_000n * 10n ** 18n,
  interestRate: 500,
  startTime: BigInt(Math.floor(Date.now() / 1000) - 86400 * 7),
  requiredLTV: 7500,
  active: true,
};

export const mockDeposit = {
  amount: 10_000n * 10n ** 18n,
  timestamp: BigInt(Math.floor(Date.now() / 1000) - 86400 * 14),
};

export const ltvTiers = [
  { minScore: 900, maxScore: 1000, ltv: 50, label: "Elite" },
  { minScore: 750, maxScore: 899, ltv: 75, label: "Excellent" },
  { minScore: 500, maxScore: 749, ltv: 100, label: "Good" },
  { minScore: 200, maxScore: 499, ltv: 120, label: "Fair" },
  { minScore: 0, maxScore: 199, ltv: 150, label: "Standard" },
];

export function getLTVForScore(score: number) {
  for (const tier of ltvTiers) {
    if (score >= tier.minScore && score <= tier.maxScore) return tier;
  }
  return ltvTiers[ltvTiers.length - 1];
}

export function getInterestForScore(score: number): number {
  if (score >= 900) return 2;
  if (score >= 750) return 5;
  if (score >= 500) return 10;
  if (score >= 200) return 15;
  return 25;
}
