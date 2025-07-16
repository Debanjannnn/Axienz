"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSmartWill } from "@/context/SmartWillContext";
import {
  getBNBPrice,
  convertBNBToUSD,
  formatUSD,
  formatBNB,
} from "@/utils/usdConversion";
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
import { Badge } from "@/components/ui/badge";
import {
  ScrollText,
  AlertCircle,
  Clock,
  Check,
  Loader2,
  FileText,
  Coins,
  User,
  RefreshCw,
  Activity,
  DollarSign,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { isAddress, ethers } from "ethers";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { motion } from "framer-motion";

interface Claimable {
  owner: string;
  amount: string;
  description: string;
  lastActiveTime: number;
  claimWaitTime: number;
  beneficiary: string;
  amountUSD: number;
  creationTime?: number;
  isClaimed?: boolean;
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
  const [bnbPrice, setBnbPrice] = useState<number | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch BNB price
  const fetchBNBPrice = useCallback(async () => {
    setLoadingPrice(true);
    try {
      const price = await getBNBPrice();
      setBnbPrice(price);
    } catch (error) {
      console.error("Error fetching BNB price:", error);
    } finally {
      setLoadingPrice(false);
    }
  }, []);

  // Load claimables with USD conversion
  const loadClaimables = useCallback(async () => {
    if (!account) return;

    setLoading(true);
    setError(null);
    try {
      const wills = await getNormalWillsAsBeneficiary();
      console.log("Fetched wills:", wills);

      if (!wills || wills.length === 0) {
        setClaimables([]);
        return;
      }

      const detailedClaimables = await Promise.all(
        wills.map(async (will: any) => {
          try {
            const willDetails = await getNormalWill(will.owner);
            console.log("Will details for", will.owner, ":", willDetails);

            const bnbAmount = parseFloat(will.amount);
            const usdAmount = bnbPrice ? await convertBNBToUSD(bnbAmount) : 0;

            return {
              ...will,
              description: willDetails
                ? willDetails.description
                : "No description available",
              lastActiveTime: willDetails
                ? Number(willDetails.lastPingTime) * 1000
                : Date.now(),
              claimWaitTime: willDetails
                ? Number(willDetails.claimWaitTime)
                : 31536000, // 1 year default
              beneficiary: willDetails
                ? willDetails.beneficiary
                : will.beneficiary || account,
              amountUSD: usdAmount,
              creationTime: willDetails
                ? Number(willDetails.creationTime) * 1000
                : undefined,
              isClaimed: willDetails ? willDetails.isClaimed : false,
            };
          } catch (err) {
            console.error(
              "Error fetching details for will from",
              will.owner,
              ":",
              err,
            );
            const bnbAmount = parseFloat(will.amount);
            const usdAmount = bnbPrice ? await convertBNBToUSD(bnbAmount) : 0;

            return {
              ...will,
              description: "Error loading description",
              lastActiveTime: Date.now(),
              claimWaitTime: 31536000,
              beneficiary: account,
              amountUSD: usdAmount,
              isClaimed: false,
            };
          }
        }),
      );

      setClaimables(detailedClaimables || []);
    } catch (err: any) {
      console.error("Error fetching claimables:", err);
      setError(err.message || "Failed to fetch claimables.");
    } finally {
      setLoading(false);
    }
  }, [account, getNormalWillsAsBeneficiary, getNormalWill, bnbPrice]);

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchBNBPrice(), loadClaimables()]);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBNBPrice();
  }, [fetchBNBPrice]);

  useEffect(() => {
    if (isConnected && account && bnbPrice !== null) {
      loadClaimables();
    }
  }, [isConnected, account, bnbPrice, loadClaimables]);

  const handleClaim = async (owner: string) => {
    if (!owner || !isAddress(owner)) {
      setError("Invalid owner address.");
      return;
    }

    try {
      setClaiming(true);
      setError(null);

      const success = await claimNormalWill(owner);
      if (success) {
        // Refresh claimables after successful claim
        await loadClaimables();
        setError(null);
      } else {
        setError("Failed to claim will. Please try again.");
      }
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

    if (Date.now() >= endTime) {
      return "Available now";
    }

    return formatDistanceToNow(endTime, { addSuffix: true });
  };

  const getClaimableStatus = (claimable: Claimable) => {
    if (claimable.isClaimed) {
      return {
        status: "Claimed",
        color: "bg-red-500/20 text-red-400 border-red-500/30",
        canClaim: false,
      };
    }

    const canClaim = isClaimable(
      claimable.lastActiveTime,
      claimable.claimWaitTime,
    );
    if (canClaim) {
      return {
        status: "Claimable",
        color: "bg-green-500/20 text-green-400 border-green-500/30",
        canClaim: true,
      };
    }

    return {
      status: "Locked",
      color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      canClaim: false,
    };
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
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-4" />
                <p className="text-white">Loading claimable assets...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen text-white py-6">
        <div className="container mx-auto p-6 max-w-6xl space-y-6">
          {/* Header */}
          <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-3xl font-display bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                    Your Claimable Assets
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    View and claim digital inheritances designated to you
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  {/* BNB Price Display */}
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      <span className="text-sm text-gray-400">BNB:</span>
                      <span className="text-white font-medium">
                        ${bnbPrice ? bnbPrice.toFixed(2) : "---"}
                      </span>
                    </div>
                  </div>

                  {/* Refresh Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshData}
                    disabled={refreshing}
                    className="text-gray-400 hover:text-amber-400"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Error Display */}
          {(error || walletError) && (
            <Alert
              variant="destructive"
              className="bg-red-800/80 backdrop-blur-md border-red-600/50"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || walletError}</AlertDescription>
            </Alert>
          )}

          {/* Claimables Grid */}
          {claimables.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl rounded-lg">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  No Claimable Assets Found
                </h3>
                <p className="text-gray-400 mb-6">
                  You don&apos;t have any digital inheritances available for
                  claiming at this time.
                </p>
                <Button
                  onClick={() => router.push("/create-will")}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-medium"
                >
                  Create Your Own Will
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {claimables.map((claimable, index) => {
                const statusInfo = getClaimableStatus(claimable);
                const timeRemaining = getTimeRemaining(
                  claimable.lastActiveTime,
                  claimable.claimWaitTime,
                );

                return (
                  <motion.div
                    key={`${claimable.owner}-${index}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl rounded-lg hover:shadow-2xl transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl font-semibold text-white">
                              {claimable.description || "Digital Legacy"}
                            </CardTitle>
                            <CardDescription className="text-gray-400 flex items-center gap-2 mt-1">
                              <FileText className="h-4 w-4 text-amber-400" />
                              Legacy from: {claimable.owner.slice(0, 10)}...
                              {claimable.owner.slice(-8)}
                            </CardDescription>
                          </div>
                          <Badge className={statusInfo.color}>
                            {statusInfo.status}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        {/* Amount Display */}
                        <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur rounded-lg border border-white/10">
                          <div>
                            <p className="text-sm text-gray-400">
                              Inheritance Amount
                            </p>
                            <p className="text-2xl font-bold text-amber-400">
                              {formatBNB(claimable.amount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">USD Value</p>
                            <p className="text-xl font-semibold text-white">
                              {formatUSD(claimable.amountUSD)}
                            </p>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-amber-400" />
                              <span className="text-sm text-gray-400">
                                Beneficiary (You):
                              </span>
                            </div>
                            <p className="text-sm text-white font-mono">
                              {claimable.beneficiary.slice(0, 10)}...
                              {claimable.beneficiary.slice(-8)}
                            </p>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-400" />
                              <span className="text-sm text-gray-400">
                                Claim Status:
                              </span>
                            </div>
                            <p className="text-sm text-white">
                              {statusInfo.canClaim
                                ? "Ready to claim!"
                                : timeRemaining}
                            </p>
                          </div>

                          {claimable.creationTime && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-amber-400" />
                                <span className="text-sm text-gray-400">
                                  Created:
                                </span>
                              </div>
                              <p className="text-sm text-white">
                                {new Date(
                                  claimable.creationTime,
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}

                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-400" />
                              <span className="text-sm text-gray-400">
                                Last Activity:
                              </span>
                            </div>
                            <p className="text-sm text-white">
                              {formatDistanceToNow(claimable.lastActiveTime, {
                                addSuffix: true,
                              })}
                            </p>
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter>
                        <Button
                          onClick={() => handleClaim(claimable.owner)}
                          disabled={
                            claiming ||
                            !statusInfo.canClaim ||
                            claimable.isClaimed
                          }
                          className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {claiming ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Claiming...
                            </>
                          ) : claimable.isClaimed ? (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              Already Claimed
                            </>
                          ) : statusInfo.canClaim ? (
                            <>
                              <Coins className="mr-2 h-4 w-4" />
                              Claim Inheritance
                            </>
                          ) : (
                            <>
                              <Clock className="mr-2 h-4 w-4" />
                              Not Yet Claimable
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Info Section */}
          <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl rounded-lg">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-amber-400" />
                Important Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                <p>
                  You can only claim inheritances after the specified waiting
                  period following the testator&apos;s last activity.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                <p>
                  Once claimed, the inheritance will be transferred to your
                  wallet immediately.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                <p>
                  Claiming requires a network transaction fee (gas fee) which
                  you&apos;ll need to pay.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
                <p>
                  All transactions are recorded on the blockchain and cannot be
                  reversed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
