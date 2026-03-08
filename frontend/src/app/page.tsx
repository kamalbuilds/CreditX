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
import {
  TrendingUp,
  Users,
  Shield,
  Zap,
  ArrowRight,
  Globe,
  Lock,
  Star,
} from "lucide-react";
import { mockProtocolStats, mockUserScore, getLTVForScore } from "@/lib/mock-data";
import Link from "next/link";

function ScoreRing({ score }: { score: number }) {
  const percentage = (score / 1000) * 100;
  const circumference = 2 * Math.PI * 80;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const tier = getLTVForScore(score);

  return (
    <div className="relative flex items-center justify-center">
      <svg width="200" height="200" className="-rotate-90">
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />
        <circle
          cx="100"
          cy="100"
          r="80"
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-sm text-zinc-400">/1000</span>
        <Badge
          variant="outline"
          className="mt-1 border-emerald-500/30 text-emerald-400"
        >
          {tier.label}
        </Badge>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  subtitle,
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  subtitle?: string;
}) {
  return (
    <Card className="border-white/5 bg-white/[0.02] backdrop-blur">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
          <Icon className="h-6 w-6 text-emerald-400" />
        </div>
        <div>
          <p className="text-sm text-zinc-400">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { isConnected } = useAccount();
  const stats = mockProtocolStats;
  const user = mockUserScore;

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-emerald-500/10 via-black to-black p-8 md:p-12">
        <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-emerald-500/5 blur-3xl" />

        <div className="relative flex flex-col items-center gap-8 md:flex-row md:justify-between">
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-400"
            >
              Built on Creditcoin
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
              The Universal DeFi
              <br />
              <span className="text-emerald-400">Credit Layer</span>
            </h1>
            <p className="max-w-md text-zinc-400">
              Trustless cross-chain reputation lending. Verify your history from
              any chain, unlock better rates with your Universal Credit Score.
            </p>
            {!isConnected ? (
              <p className="text-sm text-zinc-500">
                Connect your wallet to get started
              </p>
            ) : (
              <div className="flex gap-3">
                <Link
                  href="/verify"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                >
                  Verify My History <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/borrow"
                  className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                  Borrow Now
                </Link>
              </div>
            )}
          </div>

          {isConnected && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-sm text-zinc-400">Your Universal Score</p>
              <ScoreRing score={user.score} />
              <p className="text-xs text-zinc-500">
                {user.proofCount} verified proofs
              </p>
            </div>
          )}

          {!isConnected && (
            <div className="flex flex-col items-center gap-2 opacity-50">
              <p className="text-sm text-zinc-400">Universal Score</p>
              <ScoreRing score={847} />
              <p className="text-xs text-zinc-500">Demo preview</p>
            </div>
          )}
        </div>
      </div>

      {/* Protocol Stats */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">
          Protocol Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Value Locked"
            value={`$${(stats.tvl / 1_000_000).toFixed(2)}M`}
            icon={Lock}
            subtitle="+12.5% this week"
          />
          <StatCard
            title="Active Loans"
            value={stats.activeLoans.toLocaleString()}
            icon={TrendingUp}
            subtitle={`${stats.utilization.toFixed(1)}% utilization`}
          />
          <StatCard
            title="Avg Credit Score"
            value={stats.avgCreditScore.toString()}
            icon={Star}
            subtitle="Out of 1000"
          />
          <StatCard
            title="Total Users"
            value="2,340"
            icon={Users}
            subtitle="Across all chains"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">
          How CreditX Works
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Globe className="h-5 w-5 text-emerald-400" />
              </div>
              <CardTitle className="text-base text-white">
                Cross-Chain Verification
              </CardTitle>
              <CardDescription>
                USC precompile verifies your Ethereum repayment history on
                Creditcoin in ~15 seconds. No oracles needed.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Shield className="h-5 w-5 text-emerald-400" />
              </div>
              <CardTitle className="text-base text-white">
                Soulbound Credit NFT
              </CardTitle>
              <CardDescription>
                Your Universal Credit Score (0-1000) is minted as a
                non-transferable NFT, portable across all Creditcoin dApps.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <Zap className="h-5 w-5 text-emerald-400" />
              </div>
              <CardTitle className="text-base text-white">
                Dynamic Lending
              </CardTitle>
              <CardDescription>
                Better score = lower collateral. Unlock LTV as low as 50% vs
                industry 150%+ standard. Save capital, borrow more.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* LTV Tiers Table */}
      <Card className="border-white/5 bg-white/[0.02]">
        <CardHeader>
          <CardTitle className="text-white">Credit Score Tiers</CardTitle>
          <CardDescription>
            Your credit score determines your collateral requirements and
            interest rates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-zinc-400">
                  <th className="pb-3 font-medium">Score Range</th>
                  <th className="pb-3 font-medium">Tier</th>
                  <th className="pb-3 font-medium">Collateral Required</th>
                  <th className="pb-3 font-medium">Interest Rate</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-b border-white/5">
                  <td className="py-3">900 - 1000</td>
                  <td>
                    <Badge className="bg-emerald-500/20 text-emerald-400">
                      Elite
                    </Badge>
                  </td>
                  <td className="text-emerald-400">50%</td>
                  <td>2%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">750 - 899</td>
                  <td>
                    <Badge className="bg-blue-500/20 text-blue-400">
                      Excellent
                    </Badge>
                  </td>
                  <td className="text-blue-400">75%</td>
                  <td>5%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">500 - 749</td>
                  <td>
                    <Badge className="bg-yellow-500/20 text-yellow-400">
                      Good
                    </Badge>
                  </td>
                  <td className="text-yellow-400">100%</td>
                  <td>10%</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">200 - 499</td>
                  <td>
                    <Badge className="bg-orange-500/20 text-orange-400">
                      Fair
                    </Badge>
                  </td>
                  <td className="text-orange-400">120%</td>
                  <td>15%</td>
                </tr>
                <tr>
                  <td className="py-3">0 - 199</td>
                  <td>
                    <Badge className="bg-red-500/20 text-red-400">
                      Standard
                    </Badge>
                  </td>
                  <td className="text-red-400">150%</td>
                  <td>25%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
