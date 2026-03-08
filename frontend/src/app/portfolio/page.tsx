"use client";

import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Fingerprint,
  Shield,
  ArrowDownToLine,
  ArrowUpFromLine,
  ExternalLink,
  Clock,
  CheckCircle2,
} from "lucide-react";
import {
  mockUserScore,
  mockLoan,
  mockDeposit,
  getLTVForScore,
} from "@/lib/mock-data";
import { formatEther } from "viem";

export default function PortfolioPage() {
  const { isConnected, address } = useAccount();
  const user = mockUserScore;
  const tier = getLTVForScore(user.score);
  const loan = mockLoan;
  const deposit = mockDeposit;

  const loanAge = Math.floor(
    Date.now() / 1000 - Number(loan.startTime)
  );
  const loanDays = Math.floor(loanAge / 86400);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Portfolio</h1>
        <p className="mt-1 text-zinc-400">
          Your reputation NFT, active loans, and deposit positions
        </p>
      </div>

      {!isConnected ? (
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Shield className="mb-4 h-12 w-12 text-zinc-700" />
            <p className="text-lg font-medium text-zinc-400">
              Connect your wallet to view your portfolio
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Soulbound NFT Card */}
          <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-black to-black">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-500/10 blur-3xl" />
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-500/20 text-emerald-400">
                  Soulbound NFT
                </Badge>
                <Fingerprint className="h-5 w-5 text-emerald-400" />
              </div>
              <CardTitle className="mt-4 text-white">
                CreditX Reputation
              </CardTitle>
              <CardDescription>
                Non-transferable on-chain identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score Display */}
              <div className="flex flex-col items-center">
                <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-emerald-500/30 bg-emerald-500/5">
                  <div className="text-center">
                    <span className="text-3xl font-bold text-emerald-400">
                      {user.score}
                    </span>
                    <p className="text-xs text-zinc-400">/1000</p>
                  </div>
                </div>
                <Badge className="mt-3 bg-emerald-500/20 text-emerald-400">
                  {tier.label} Tier
                </Badge>
              </div>

              <Separator className="bg-white/5" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Token ID</span>
                  <span className="text-white">#1</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Standard</span>
                  <span className="text-white">ERC-721 (Soulbound)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Verified Proofs</span>
                  <span className="text-emerald-400">{user.proofCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Total Loans</span>
                  <span className="text-white">{user.totalLoans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Repaid</span>
                  <span className="text-emerald-400">{user.repaidLoans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">LTV Unlock</span>
                  <span className="text-emerald-400">{tier.ltv}%</span>
                </div>
              </div>

              <a
                href={`https://creditcoin-testnet.blockscout.com/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                View on Blockscout <ExternalLink className="h-3 w-3" />
              </a>
            </CardContent>
          </Card>

          {/* Active Loans */}
          <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ArrowDownToLine className="h-5 w-5 text-blue-400" />
                Active Loans
              </CardTitle>
              <CardDescription>Your current borrowing positions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loan.active ? (
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <Badge className="bg-blue-500/20 text-blue-400">
                        Active
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Clock className="h-3 w-3" />
                        {loanDays} days ago
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Borrowed</span>
                        <span className="font-medium text-white">
                          {parseFloat(
                            formatEther(loan.borrowed)
                          ).toLocaleString()}{" "}
                          CTC
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Collateral</span>
                        <span className="text-white">
                          {parseFloat(
                            formatEther(loan.collateral)
                          ).toLocaleString()}{" "}
                          CTC
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Interest Rate</span>
                        <span className="text-white">
                          {loan.interestRate / 100}% APR
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">LTV Ratio</span>
                        <span className="text-white">
                          {Number(loan.requiredLTV) / 100}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Health Factor</span>
                        <span className="font-medium text-emerald-400">
                          1.87
                        </span>
                      </div>
                    </div>
                  </div>

                  <a
                    href="/borrow"
                    className="flex items-center justify-center gap-2 rounded-lg bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
                  >
                    Repay Loan
                  </a>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="mb-2 h-8 w-8 text-zinc-700" />
                  <p className="text-sm text-zinc-500">No active loans</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deposit Positions */}
          <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ArrowUpFromLine className="h-5 w-5 text-emerald-400" />
                Deposit Position
              </CardTitle>
              <CardDescription>Your lending pool deposits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <Badge className="bg-emerald-500/20 text-emerald-400">
                    Earning
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="h-3 w-3" />
                    {Math.floor(
                      (Date.now() / 1000 - Number(deposit.timestamp)) / 86400
                    )}{" "}
                    days
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Deposited</span>
                    <span className="font-medium text-white">
                      {parseFloat(
                        formatEther(deposit.amount)
                      ).toLocaleString()}{" "}
                      CTC
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Estimated Earnings</span>
                    <span className="text-emerald-400">+24.6 CTC</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Current APY</span>
                    <span className="text-white">8.5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Pool Share</span>
                    <span className="text-white">0.41%</span>
                  </div>
                </div>
              </div>

              <a
                href="/lend"
                className="flex items-center justify-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2.5 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/20"
              >
                Manage Position
              </a>

              <Separator className="bg-white/5" />

              {/* Verified Sources Summary */}
              <div>
                <p className="mb-2 text-sm font-medium text-zinc-400">
                  Verified Sources
                </p>
                <div className="space-y-2">
                  {user.verifiedSources.map((source, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="text-zinc-400">{source.type}</span>
                      <span className="text-emerald-400">
                        {source.events} events
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
