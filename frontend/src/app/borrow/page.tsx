"use client";

import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowDownToLine,
  Calculator,
  Shield,
  AlertTriangle,
} from "lucide-react";
import {
  mockUserScore,
  getLTVForScore,
  getInterestForScore,
} from "@/lib/mock-data";

export default function BorrowPage() {
  const { isConnected } = useAccount();
  const [borrowAmount, setBorrowAmount] = useState("");

  const score = mockUserScore.score;
  const tier = getLTVForScore(score);
  const interestRate = getInterestForScore(score);
  const amount = parseFloat(borrowAmount) || 0;

  const calculations = useMemo(() => {
    if (amount <= 0) return null;
    const collateralRequired = (amount * tier.ltv) / 100;
    const annualInterest = (amount * interestRate) / 100;
    const healthFactor = collateralRequired > 0 ? (collateralRequired / amount) * 1.5 : 0;
    return {
      collateralRequired,
      annualInterest,
      monthlyInterest: annualInterest / 12,
      healthFactor,
      savingsVsStandard: ((150 - tier.ltv) / 100) * amount,
    };
  }, [amount, tier.ltv, interestRate]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Borrow CTC</h1>
        <p className="mt-1 text-zinc-400">
          Leverage your Universal Credit Score for better borrowing terms
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Score Summary */}
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="h-5 w-5 text-emerald-400" />
              Your Credit Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-zinc-400">Universal Credit Score</p>
              <p className="text-5xl font-bold text-emerald-400">{score}</p>
              <Badge className="mt-2 bg-emerald-500/20 text-emerald-400">
                {tier.label} Tier
              </Badge>
            </div>

            <Separator className="bg-white/5" />

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Collateral Ratio</span>
                <span className="font-medium text-emerald-400">
                  {tier.ltv}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Interest Rate</span>
                <span className="font-medium text-white">{interestRate}% APR</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Total Loans</span>
                <span className="text-white">{mockUserScore.totalLoans}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Repaid</span>
                <span className="text-emerald-400">
                  {mockUserScore.repaidLoans}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Defaulted</span>
                <span className="text-white">
                  {mockUserScore.defaultedLoans}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-500/5 p-3 text-center text-xs text-emerald-400">
              You save {150 - tier.ltv}% collateral vs standard DeFi lending
            </div>
          </CardContent>
        </Card>

        {/* Center: Borrow Form */}
        <Card className="border-white/5 bg-white/[0.02] lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <ArrowDownToLine className="h-5 w-5 text-emerald-400" />
              Borrow Amount
            </CardTitle>
            <CardDescription>
              Enter the amount of CTC you want to borrow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm text-zinc-400">Amount (CTC)</label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  className="h-14 border-white/10 bg-white/[0.02] pr-16 text-2xl text-white placeholder:text-zinc-600"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-zinc-400">
                  CTC
                </span>
              </div>
              <div className="flex gap-2">
                {[100, 500, 1000, 5000].map((preset) => (
                  <button
                    key={preset}
                    onClick={() => setBorrowAmount(preset.toString())}
                    className="rounded-md border border-white/10 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
                  >
                    {preset.toLocaleString()} CTC
                  </button>
                ))}
              </div>
            </div>

            {calculations && (
              <>
                <Separator className="bg-white/5" />

                {/* Collateral Calculator */}
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-white">
                    <Calculator className="h-4 w-4 text-emerald-400" />
                    Loan Details
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-xs text-zinc-400">
                        Required Collateral
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {calculations.collateralRequired.toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 }
                        )}{" "}
                        <span className="text-sm text-zinc-400">CTC</span>
                      </p>
                      <p className="text-xs text-emerald-400">
                        {tier.ltv}% collateral ratio
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-xs text-zinc-400">Annual Interest</p>
                      <p className="text-2xl font-bold text-white">
                        {calculations.annualInterest.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}{" "}
                        <span className="text-sm text-zinc-400">CTC</span>
                      </p>
                      <p className="text-xs text-zinc-500">
                        ~{calculations.monthlyInterest.toFixed(2)} CTC/month
                      </p>
                    </div>

                    <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                      <p className="text-xs text-zinc-400">Health Factor</p>
                      <p
                        className={`text-2xl font-bold ${
                          calculations.healthFactor >= 1.5
                            ? "text-emerald-400"
                            : calculations.healthFactor >= 1
                              ? "text-yellow-400"
                              : "text-red-400"
                        }`}
                      >
                        {calculations.healthFactor.toFixed(2)}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {calculations.healthFactor >= 1.5
                          ? "Healthy"
                          : "At risk"}
                      </p>
                    </div>

                    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                      <p className="text-xs text-emerald-400/70">
                        You Save vs Standard
                      </p>
                      <p className="text-2xl font-bold text-emerald-400">
                        {calculations.savingsVsStandard.toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 }
                        )}{" "}
                        <span className="text-sm">CTC</span>
                      </p>
                      <p className="text-xs text-emerald-400/50">
                        In reduced collateral
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                {/* Summary */}
                <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">You borrow</span>
                      <span className="font-medium text-white">
                        {amount.toLocaleString()} CTC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">You deposit (collateral)</span>
                      <span className="font-medium text-white">
                        {calculations.collateralRequired.toLocaleString(
                          undefined,
                          { maximumFractionDigits: 2 }
                        )}{" "}
                        CTC
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Interest rate</span>
                      <span className="text-white">{interestRate}% APR</span>
                    </div>
                    <Separator className="bg-white/5" />
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Net received</span>
                      <span className="font-medium text-emerald-400">
                        {amount.toLocaleString()} CTC
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}

            <Button
              disabled={!isConnected || amount <= 0}
              className="w-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
              size="lg"
            >
              {!isConnected
                ? "Connect Wallet to Borrow"
                : amount <= 0
                  ? "Enter Borrow Amount"
                  : `Borrow ${amount.toLocaleString()} CTC`}
            </Button>

            {amount > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-yellow-400" />
                <p className="text-xs text-yellow-400/80">
                  Loans are subject to liquidation if your health factor drops
                  below 1.0. Repay promptly to improve your credit score.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
