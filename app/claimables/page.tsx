"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSmartWill } from "@/context/SmartWillContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ScrollText,
  AlertCircle,
  Clock,
  Check,
  Lock,
  Loader2,
  FileText,
  Coins,
  User,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { isAddress, ethers } from "ethers";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";

interface Claimable {
  owner: string;
  amount: string;
  description: string;
  lastActiveTime: number;
  claimWaitTime: number;
  beneficiary: string;
}

export default function Claimables() {
  const router = useRouter();
  const {
    account,
    connectWallet,
    loading: walletLoading,
    error: walletError,
    isConnected,
    getNormalWillsAsBeneficiary,
    claimNormalWill,
    getNormalWill,
  } = useSmartWill();

  const [claimables, setClaimables] = useState<Claimable[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadClaimables = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!account) {
          setError("No account connected.");
          return;
        }

        const wills = await getNormalWillsAsBeneficiary();
        console.log("Fetched wills:", wills);

        const detailedClaimables = await Promise.all(
          wills.map(async (will: any) => {
            const willDetails = await getNormalWill(will.owner);
            console.log(willDetails);
            return {
              ...will,
              description: willDetails
                ? willDetails.description
                : "No description",
              lastActiveTime: Number(willDetails.lastPingTime) * 1000, // Last Ping Time
              claimWaitTime: Number(willDetails.claimWaitTime),
              beneficiary: willDetails.beneficiary,
            };
          }),
        );
        setClaimables(detailedClaimables || []);
      } catch (err: any) {
        console.error("Error fetching claimables:", err);
        setError(err.message || "Failed to fetch claimables.");
      } finally {
        setLoading(false);
      }
    };

    loadClaimables();
  }, [isConnected, account]);

  const handleClaim = async (owner: string) => {
    if (!owner || !isAddress(owner)) {
      setError("Invalid owner address.");
      return;
    }

    try {
      setClaiming(true);
      setError(null);
    } catch (err: any) {
      console.error("Error during claim:", err);
      setError(err.message || "Failed to claim.");
    } finally {
      setClaiming(false);
    }
  };

  const isClaimable = (lastActiveTime: number, claimWaitTime: number) => {
    const waitTimeMs = claimWaitTime * 1000;
    return Date.now() >= lastActiveTime + waitTimeMs;
  };

  const getTimeRemaining = (lastActiveTime: number, claimWaitTime: number) => {
    const endTime = lastActiveTime + claimWaitTime * 1000;
    if (isNaN(endTime)) {
      return "Invalid Date";
    }
    return formatDistanceToNow(endTime, { addSuffix: true });
  };

  if (!isConnected) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center text-white">
          <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border-white/20 shadow-xl rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-lg font-semibold">
                Connect Wallet
              </CardTitle>
              <CardDescription className="text-gray-400">
                Please connect your wallet to view claimables
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 flex justify-center">
              <Button
                onClick={connectWallet}
                disabled={walletLoading}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded transition-colors"
              >
                {walletLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  "Connect Wallet"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border-white/20 shadow-xl rounded-lg">
            <CardContent className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen text-white py-6">
        <div className="container mx-auto p-6 max-w-4xl space-y-6">
          {(error || walletError) && (
            <Alert
              variant="destructive"
              className="bg-red-800/80 backdrop-blur-md border-red-600/50 text-white rounded-md shadow-md"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || walletError}</AlertDescription>
            </Alert>
          )}

          <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-display bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                Your Claimable Assets
              </CardTitle>
              <CardDescription className="text-gray-400">
                View and manage academic assets designated to you
              </CardDescription>
            </CardHeader>
          </Card>

          {claimables.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl rounded-lg">
              <CardContent className="p-6 text-center text-gray-400">
                No claimable assets found for your address
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {claimables.map((claimable, index) => {
                const isReadyToClaim = isClaimable(
                  claimable.lastActiveTime,
                  claimable.claimWaitTime,
                );
                const timeRemaining = getTimeRemaining(
                  claimable.lastActiveTime,
                  claimable.claimWaitTime,
                );

                return (
                  <Card
                    key={`${claimable.owner}-${index}`}
                    className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl font-semibold">
                          {claimable.description || "Academic Legacy"}
                        </CardTitle>
                        <CardDescription className="text-gray-400 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-amber-400" />
                          Legacy from: {claimable.owner}
                        </CardDescription>
                        <CardDescription className="text-gray-400 flex items-center gap-2">
                          <User className="h-4 w-4 text-amber-400" />
                          Beneficiary: {claimable.beneficiary}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg text-amber-400">
                          {claimable.amount} BNB
                        </div>
                        <CardDescription className="text-gray-400">
                          Token Amount
                        </CardDescription>
                      </div>
                    </div>
                    <CardContent className="mt-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-400" />
                        Claim Available:{" "}
                        {isReadyToClaim ? (
                          <span className="text-green-500 font-semibold">
                            Now!
                          </span>
                        ) : (
                          <span className="text-yellow-500 font-semibold">
                            {timeRemaining}
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="mt-4">
                      <Button
                        onClick={() => handleClaim(claimable.owner)}
                        disabled={claiming || !isReadyToClaim}
                        className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded transition-colors"
                      >
                        {claiming ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Claiming...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Claim
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
