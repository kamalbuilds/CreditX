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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  Globe,
  Link2,
  Fingerprint,
  ArrowRight,
} from "lucide-react";
import { mockUserScore } from "@/lib/mock-data";

type VerificationStep =
  | "idle"
  | "connecting"
  | "scanning"
  | "verifying"
  | "minting"
  | "complete";

const steps = [
  { id: "connecting", label: "Connecting to chains", duration: 1500 },
  { id: "scanning", label: "Scanning loan history", duration: 2000 },
  { id: "verifying", label: "USC verification via 0x0FD2", duration: 2500 },
  { id: "minting", label: "Minting Soulbound NFT", duration: 1500 },
];

export default function VerifyPage() {
  const { isConnected, address } = useAccount();
  const [step, setStep] = useState<VerificationStep>("idle");
  const [progress, setProgress] = useState(0);
  const [isVerified, setIsVerified] = useState(false);

  const runVerification = async () => {
    setStep("connecting");
    setProgress(0);

    for (let i = 0; i < steps.length; i++) {
      setStep(steps[i].id as VerificationStep);
      setProgress(((i + 1) / steps.length) * 100);
      await new Promise((r) => setTimeout(r, steps[i].duration));
    }

    setStep("complete");
    setProgress(100);
    setIsVerified(true);
  };

  const user = mockUserScore;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Verify Your Credit History
        </h1>
        <p className="mt-1 text-zinc-400">
          Connect your wallets and let USC verify your cross-chain repayment
          history
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Verification Flow */}
        <div className="space-y-6">
          {/* Wallet Connection Status */}
          <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Link2 className="h-5 w-5 text-emerald-400" />
                Wallet Connection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10">
                    <Globe className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Creditcoin Testnet
                    </p>
                    <p className="text-xs text-zinc-400">
                      {isConnected
                        ? `${address?.slice(0, 6)}...${address?.slice(-4)}`
                        : "Not connected"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    isConnected
                      ? "border-emerald-500/30 text-emerald-400"
                      : "border-zinc-700 text-zinc-500"
                  }
                >
                  {isConnected ? "Connected" : "Disconnected"}
                </Badge>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                    <Globe className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">
                      Ethereum (Source)
                    </p>
                    <p className="text-xs text-zinc-400">
                      {isConnected
                        ? "Same address detected"
                        : "Connect Creditcoin first"}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    isConnected
                      ? "border-blue-500/30 text-blue-400"
                      : "border-zinc-700 text-zinc-500"
                  }
                >
                  {isConnected ? "Detected" : "Waiting"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Verification Action */}
          <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                USC Verification
              </CardTitle>
              <CardDescription>
                Universal Smart Contracts verify your cross-chain history via the
                NativeQueryVerifier precompile at 0x0FD2
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {step !== "idle" && step !== "complete" && (
                <div className="space-y-3">
                  <Progress value={progress} className="h-2" />
                  <div className="space-y-2">
                    {steps.map((s, i) => {
                      const stepProgress = ((i + 1) / steps.length) * 100;
                      const isDone = progress >= stepProgress;
                      const isCurrent =
                        progress < stepProgress &&
                        progress >= (i / steps.length) * 100;
                      return (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 text-sm"
                        >
                          {isDone ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : isCurrent ? (
                            <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-zinc-700" />
                          )}
                          <span
                            className={
                              isDone
                                ? "text-emerald-400"
                                : isCurrent
                                  ? "text-white"
                                  : "text-zinc-500"
                            }
                          >
                            {s.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === "complete" && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                  <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
                  <p className="font-medium text-emerald-400">
                    Verification Complete!
                  </p>
                  <p className="mt-1 text-sm text-zinc-400">
                    Your Soulbound Credit NFT has been minted/updated
                  </p>
                </div>
              )}

              <Button
                onClick={runVerification}
                disabled={!isConnected || (step !== "idle" && step !== "complete")}
                className="w-full bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50"
                size="lg"
              >
                {step === "idle" || step === "complete" ? (
                  <>
                    <Fingerprint className="mr-2 h-5 w-5" />
                    {isVerified ? "Re-verify History" : "Verify My History"}
                  </>
                ) : (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Verifying...
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="space-y-6">
          <Card className="border-white/5 bg-white/[0.02]">
            <CardHeader>
              <CardTitle className="text-white">Verified Sources</CardTitle>
              <CardDescription>
                {isVerified
                  ? `${user.verifiedSources.length} sources verified across ${new Set(user.verifiedSources.map((s) => s.chain)).size} chains`
                  : "Run verification to discover your credit history"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isVerified ? (
                <div className="space-y-3">
                  {user.verifiedSources.map((source, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            source.chain === "Ethereum"
                              ? "bg-blue-500/10"
                              : "bg-emerald-500/10"
                          }`}
                        >
                          <Globe
                            className={`h-5 w-5 ${
                              source.chain === "Ethereum"
                                ? "text-blue-400"
                                : "text-emerald-400"
                            }`}
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">
                            {source.type}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {source.chain}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-emerald-400">
                          {source.events} events
                        </p>
                        <p className="text-xs text-zinc-500">Verified</p>
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 rounded-lg bg-emerald-500/5 p-4 text-center">
                    <p className="text-sm text-zinc-400">Total Verified Events</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      {user.verifiedSources.reduce(
                        (sum, s) => sum + s.events,
                        0
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ShieldCheck className="mb-4 h-12 w-12 text-zinc-700" />
                  <p className="text-zinc-500">
                    Connect your wallet and verify to see your cross-chain
                    credit history
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {isVerified && (
            <Card className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <p className="text-sm text-zinc-400">Your Credit Score</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {user.score}/1000
                  </p>
                  <p className="text-xs text-zinc-500">
                    Unlocks 75% collateral ratio
                  </p>
                </div>
                <a
                  href="/borrow"
                  className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600"
                >
                  Borrow Now <ArrowRight className="h-4 w-4" />
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
