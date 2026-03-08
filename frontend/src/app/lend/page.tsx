"use client";

import { useState } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpFromLine,
  ArrowDownToLine,
  TrendingUp,
  Percent,
  Shield,
  Wallet,
} from "lucide-react";
import { mockProtocolStats, mockDeposit } from "@/lib/mock-data";
import { formatEther } from "viem";

export default function LendPage() {
  const { isConnected } = useAccount();
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const stats = mockProtocolStats;
  const hasDeposit = true; // mock
  const depositDisplay = formatEther(mockDeposit.amount);
  const depositAge = Math.floor(
    (Date.now() / 1000 - Number(mockDeposit.timestamp)) / 86400
  );
  const estimatedAPY = stats.utilization > 50 ? 8.5 : 4.2;
  const estimatedEarnings =
    (parseFloat(depositDisplay) * estimatedAPY * depositAge) / 365 / 100;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Lend CTC</h1>
        <p className="mt-1 text-zinc-400">
          Deposit CTC into the lending pool to earn yield from borrower interest
        </p>
      </div>

      {/* Pool Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Pool APY</p>
                <p className="text-xl font-bold text-emerald-400">
                  {estimatedAPY}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Wallet className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Total Deposited</p>
                <p className="text-xl font-bold text-white">
                  ${(stats.tvl / 1_000_000).toFixed(1)}M
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Percent className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Utilization</p>
                <p className="text-xl font-bold text-white">
                  {stats.utilization.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-white/5 bg-white/[0.02]">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Shield className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-zinc-400">Active Loans</p>
                <p className="text-xl font-bold text-white">
                  {stats.activeLoans.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Deposit / Withdraw */}
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-white">Manage Position</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="deposit" className="space-y-4">
              <TabsList className="w-full bg-white/5">
                <TabsTrigger value="deposit" className="flex-1">
                  <ArrowUpFromLine className="mr-2 h-4 w-4" />
                  Deposit
                </TabsTrigger>
                <TabsTrigger value="withdraw" className="flex-1">
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Withdraw
                </TabsTrigger>
              </TabsList>

              <TabsContent value="deposit" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">
                    Deposit Amount (CTC)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="h-12 border-white/10 bg-white/[0.02] text-lg text-white placeholder:text-zinc-600"
                  />
                  <div className="flex gap-2">
                    {[100, 500, 1000, 5000].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setDepositAmount(preset.toString())}
                        className="rounded-md border border-white/10 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-emerald-500/30 hover:text-emerald-400"
                      >
                        {preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {parseFloat(depositAmount) > 0 && (
                  <div className="rounded-lg border border-white/5 bg-white/[0.02] p-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Estimated APY</span>
                        <span className="text-emerald-400">{estimatedAPY}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-400">
                          Annual Earnings (est.)
                        </span>
                        <span className="text-white">
                          {(
                            (parseFloat(depositAmount) * estimatedAPY) /
                            100
                          ).toFixed(2)}{" "}
                          CTC
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  disabled={!isConnected || parseFloat(depositAmount) <= 0}
                  className="w-full bg-emerald-500 text-white hover:bg-emerald-600"
                  size="lg"
                >
                  {!isConnected
                    ? "Connect Wallet"
                    : `Deposit ${depositAmount || "0"} CTC`}
                </Button>
              </TabsContent>

              <TabsContent value="withdraw" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-400">
                    Withdraw Amount (CTC)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="h-12 border-white/10 bg-white/[0.02] text-lg text-white placeholder:text-zinc-600"
                  />
                  <button
                    onClick={() => setWithdrawAmount(depositDisplay)}
                    className="text-xs text-emerald-400 hover:text-emerald-300"
                  >
                    Max: {parseFloat(depositDisplay).toLocaleString()} CTC
                  </button>
                </div>

                <Button
                  disabled={!isConnected || parseFloat(withdrawAmount) <= 0}
                  variant="outline"
                  className="w-full border-white/10 text-white hover:bg-white/5"
                  size="lg"
                >
                  {!isConnected
                    ? "Connect Wallet"
                    : `Withdraw ${withdrawAmount || "0"} CTC`}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Your Position */}
        <Card className="border-white/5 bg-white/[0.02]">
          <CardHeader>
            <CardTitle className="text-white">Your Position</CardTitle>
            <CardDescription>
              {hasDeposit
                ? "Your active lending position"
                : "No active deposits"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasDeposit ? (
              <>
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
                  <p className="text-sm text-zinc-400">Total Deposited</p>
                  <p className="text-3xl font-bold text-white">
                    {parseFloat(depositDisplay).toLocaleString()}{" "}
                    <span className="text-sm text-zinc-400">CTC</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Estimated Earnings</span>
                    <span className="font-medium text-emerald-400">
                      +{estimatedEarnings.toFixed(2)} CTC
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Current APY</span>
                    <span className="text-white">{estimatedAPY}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Deposit Age</span>
                    <span className="text-white">{depositAge} days</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400">Pool Share</span>
                    <span className="text-white">0.41%</span>
                  </div>
                </div>

                <Separator className="bg-white/5" />

                <div className="rounded-lg bg-white/[0.02] p-3 text-xs text-zinc-500">
                  Earnings are calculated based on borrower interest and pool
                  utilization rate. APY is variable and updates each block.
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Wallet className="mb-4 h-12 w-12 text-zinc-700" />
                <p className="text-zinc-500">
                  Deposit CTC to start earning yield
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
