"use client";

import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useSmartWill } from "@/context/SmartWillContext";
import {
  getBNBPrice,
  convertBNBToUSD,
  formatUSD,
  formatBNB,
} from "@/utils/usdConversion";
import {
  Loader2,
  PlusCircle,
  Clock,
  Wallet,
  AlertCircle,
  User,
  FileText,
  Calendar,
  Coins,
  Shield,
  History,
  RefreshCw,
  Activity,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";

interface Will {
  beneficiary: string;
  amount: bigint;
  lastPingTime: bigint;
  claimWaitTime: bigint;
  description: string;
  isClaimed: boolean;
  creationTime: bigint;
}

const CheckMyWill = () => {
  const [willDetails, setWillDetails] = useState<Will | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState("");
  const [timeRemaining, setTimeRemaining] = useState("");
  const [timeProgress, setTimeProgress] = useState(0);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isPinging, setIsPinging] = useState(false);
  const [lastPingTimeAgo, setLastPingTimeAgo] = useState("");
  const [withdrawalAvailable, setWithdrawalAvailable] = useState(false);
  const [bnbPrice, setBnbPrice] = useState<number | null>(null);
  const [amountUSD, setAmountUSD] = useState(0);
  const [depositAmountUSD, setDepositAmountUSD] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const {
    account,
    connectWallet,
    getNormalWill,
    ping,
    depositNormalWill,
    withdrawNormalWill,
    hasCreatedWill,
    loading: contextLoading,
    error: contextError,
  } = useSmartWill();

  const router = useRouter();

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

  // Calculate USD values
  const calculateUSDValues = useCallback(async () => {
    if (bnbPrice) {
      if (willDetails) {
        const bnbAmount = Number(willDetails.amount) / 1e18;
        const usd = await convertBNBToUSD(bnbAmount);
        setAmountUSD(usd);
      }

      if (depositAmount) {
        const depositUsd = await convertBNBToUSD(depositAmount);
        setDepositAmountUSD(depositUsd);
      } else {
        setDepositAmountUSD(0);
      }
    }
  }, [bnbPrice, willDetails, depositAmount]);

  const fetchWillDetails = useCallback(async () => {
    if (!account) return;

    setLoading(true);
    setError(null);
    try {
      const details = await getNormalWill(account);
      setWillDetails(details);
      checkWithdrawalEligibility(details.creationTime);
    } catch (err: any) {
      setError("Unable to fetch will details. Please try again.");
      setWillDetails(null);
    } finally {
      setLoading(false);
    }
  }, [account, getNormalWill]);

  const checkWithdrawalEligibility = (creationTime: bigint) => {
    const oneYearInSeconds = BigInt(365 * 24 * 60 * 60);
    const now = BigInt(Math.floor(Date.now() / 1000));
    setWithdrawalAvailable(now >= creationTime + oneYearInSeconds);
  };

  useEffect(() => {
    fetchBNBPrice();
  }, [fetchBNBPrice]);

  useEffect(() => {
    calculateUSDValues();
  }, [calculateUSDValues]);

  useEffect(() => {
    async function checkAndFetchWill() {
      if (!account) {
        connectWallet();
        return;
      }

      try {
        const hasWill = await hasCreatedWill(account);

        if (!hasWill) {
          router.push("/create-will/simple");
        } else {
          fetchWillDetails();
        }
      } catch (error) {
        console.error("Error checking will status:", error);
        setError("Error checking will status. Please try again.");
      }
    }
    checkAndFetchWill();
  }, [account, connectWallet, fetchWillDetails, hasCreatedWill, router]);

  // Update countdown timer
  useEffect(() => {
    if (!willDetails) return;

    const { lastPingTime, claimWaitTime } = willDetails;

    const updateCounter = () => {
      const now = BigInt(Math.floor(Date.now() / 1000));
      const remainingTime = lastPingTime + claimWaitTime - now;
      const totalTime = claimWaitTime;

      const elapsed = Number(claimWaitTime - remainingTime);
      const progress = Math.min(
        100,
        Math.max(0, (elapsed / Number(totalTime)) * 100),
      );
      setTimeProgress(progress);

      const timeSinceLastPing = now - lastPingTime;
      const daysAgo = Number(timeSinceLastPing / BigInt(24 * 60 * 60));
      setLastPingTimeAgo(
        daysAgo === 0
          ? "Today"
          : daysAgo === 1
            ? "Yesterday"
            : `${daysAgo} days ago`,
      );

      if (remainingTime <= BigInt(0)) {
        setTimeRemaining("Beneficiary can claim");
      } else {
        const days = Number(remainingTime / BigInt(24 * 60 * 60));
        const hours = Number(
          (remainingTime % BigInt(24 * 60 * 60)) / BigInt(60 * 60),
        );
        const minutes = Number((remainingTime % BigInt(60 * 60)) / BigInt(60));
        const seconds = Number(remainingTime % BigInt(60));
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      }
    };

    updateCounter();
    const interval = setInterval(updateCounter, 1000);
    return () => clearInterval(interval);
  }, [willDetails]);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError("Please enter a valid amount to deposit.");
      return;
    }

    setIsDepositing(true);
    setError(null);
    try {
      const success = await depositNormalWill(depositAmount);
      if (success) {
        await fetchWillDetails();
        setDepositAmount("");
      } else {
        setError("Failed to deposit funds. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to deposit funds. Please try again.");
    } finally {
      setIsDepositing(false);
    }
  };

  const handlePing = async () => {
    setIsPinging(true);
    setError(null);
    try {
      const success = await ping();
      if (success) {
        await fetchWillDetails();
      } else {
        setError("Failed to confirm activity. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to confirm activity. Please try again.");
    } finally {
      setIsPinging(false);
    }
  };

  const handleWithdraw = async () => {
    if (!willDetails) return;
    try {
      const amountBNB = Number(willDetails.amount) / 1e18;
      const success = await withdrawNormalWill(amountBNB.toString());
      if (success) {
        await fetchWillDetails();
      } else {
        setError("Failed to withdraw funds. Please try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to withdraw funds. Please try again.");
    }
  };

  // Show loader if wallet is not connected
  if (!account) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center bg-transparent min-h-screen">
          <Card className="w-full flex flex-col justify-center items-center max-w-md bg-black/40 backdrop-blur-md border-white/20 text-center p-6 pb-9 shadow-xl">
            <p className="pb-7 text-white">
              Hang Tight While We Connect Your Wallet!
            </p>
            <Loader2 className="w-12 h-12 animate-spin text-amber-400" />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !willDetails) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen p-4">
          <Alert
            variant="destructive"
            className="max-w-2xl bg-red-900/20 border-red-500/50"
          >
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  // If no will details are found after wallet connection
  if (!willDetails && !loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center bg-transparent min-h-screen p-4">
          <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border-white/20 text-center shadow-xl">
            <CardHeader>
              <CardTitle className="text-white">No Will Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-gray-300">
                Redirecting you to create a digital will to secure your assets
                for your beneficiaries.
              </p>
              <Loader2 className="w-12 h-12 animate-spin text-amber-400" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (loading || contextLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center bg-transparent min-h-screen">
          <Card className="w-full flex flex-col justify-center items-center max-w-md bg-black/40 backdrop-blur-md border-white/20 text-center p-6 pb-9 shadow-xl">
            <p className="pb-7 text-white">Loading Will Details...</p>
            <Loader2 className="w-12 h-12 animate-spin text-amber-400" />
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusInfo = () => {
    if (!willDetails) return { color: "text-gray-400", text: "Unknown" };
    if (willDetails.isClaimed)
      return { color: "text-red-500", text: "Claimed" };
    const now = BigInt(Math.floor(Date.now() / 1000));
    const remainingTime =
      willDetails.lastPingTime + willDetails.claimWaitTime - now;
    if (remainingTime <= BigInt(0))
      return { color: "text-red-500", text: "Claimable" };
    if (remainingTime <= willDetails.claimWaitTime / BigInt(10))
      return { color: "text-yellow-500", text: "Action Needed" };
    return { color: "text-green-500", text: "Active" };
  };

  const status = getStatusInfo();

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            {/* Header Card */}
            <Card className="mb-6 bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-3xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-orange-500">
                      Digital Will Dashboard
                    </CardTitle>
                    <p className="text-gray-400 mt-1">
                      Manage your blockchain-secured digital will
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <div
                            className={`flex items-center gap-2 ${status.color}`}
                          >
                            <Shield className="w-6 h-6" />
                            <span className="text-sm font-semibold">
                              {status.text}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-800 border-white/20">
                          <p>Last activity: {lastPingTimeAgo}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        fetchWillDetails();
                        fetchBNBPrice();
                      }}
                      disabled={loading || loadingPrice}
                      className="text-gray-400 hover:text-amber-400"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${loading || loadingPrice ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Will Information */}
              <div className="lg:col-span-2 space-y-6">
                {/* Will Details */}
                <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-400" />
                      Will Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <InfoCard
                        icon={User}
                        title="Beneficiary"
                        content={willDetails?.beneficiary || "N/A"}
                      />
                      <InfoCard
                        icon={Coins}
                        title="Amount Secured"
                        content={
                          <div>
                            <div className="text-lg font-semibold">
                              {formatBNB(
                                Number(willDetails?.amount || 0) / 1e18,
                              )}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatUSD(amountUSD)}
                            </div>
                          </div>
                        }
                      />
                      <InfoCard
                        icon={Calendar}
                        title="Created On"
                        content={
                          willDetails
                            ? new Date(
                                Number(willDetails.creationTime) * 1000,
                              ).toLocaleDateString(undefined, {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "N/A"
                        }
                      />
                      <InfoCard
                        icon={History}
                        title="Last Activity"
                        content={
                          willDetails
                            ? `${lastPingTimeAgo} (${new Date(Number(willDetails.lastPingTime) * 1000).toLocaleString()})`
                            : "N/A"
                        }
                      />
                    </div>

                    {/* Time Until Claim */}
                    <div className="space-y-3">
                      <h3 className="font-semibold flex items-center gap-2 text-white">
                        <Clock className="w-5 h-5 text-amber-400" />
                        Time Until Claim
                      </h3>
                      <div className="bg-white/5 backdrop-blur border border-white/10 p-4 rounded-lg">
                        <p className="text-3xl font-mono mb-3 text-white">
                          {timeRemaining}
                        </p>
                        <Progress
                          value={timeProgress}
                          className="h-2 bg-gray-700"
                        />
                      </div>
                    </div>

                    {/* Will Description */}
                    <div className="bg-white/5 backdrop-blur border border-white/10 rounded-lg p-4">
                      <h3 className="font-semibold mb-2 flex items-center gap-2 text-white">
                        <FileText className="w-5 h-5 text-amber-400" />
                        Will Description
                      </h3>
                      <p className="text-sm text-gray-300">
                        {willDetails?.description || "No description provided"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-amber-400" />
                      Manage Will
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Deposit */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-white">Add Funds</h3>
                        <form onSubmit={handleDeposit} className="space-y-3">
                          <div className="space-y-2">
                            <Input
                              type="number"
                              step="0.000000000000000001"
                              min="0"
                              placeholder="Amount in BNB"
                              value={depositAmount}
                              onChange={(e) => setDepositAmount(e.target.value)}
                              className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                            />
                            {depositAmount && bnbPrice && (
                              <p className="text-sm text-gray-400">
                                ≈ {formatUSD(depositAmountUSD)}
                              </p>
                            )}
                          </div>
                          <Button
                            type="submit"
                            disabled={
                              isDepositing ||
                              !depositAmount ||
                              parseFloat(depositAmount) <= 0
                            }
                            className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium"
                          >
                            {isDepositing ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Adding Funds...
                              </>
                            ) : (
                              <>
                                <Wallet className="w-4 h-4 mr-2" />
                                Add Funds
                              </>
                            )}
                          </Button>
                        </form>

                        {withdrawalAvailable && (
                          <Button
                            onClick={handleWithdraw}
                            variant="outline"
                            className="w-full border-white/20 text-white hover:bg-white/10"
                          >
                            Withdraw Funds
                          </Button>
                        )}
                      </div>

                      {/* Activity Ping */}
                      <div className="space-y-4">
                        <h3 className="font-medium text-white">
                          Confirm Activity
                        </h3>
                        <div className="space-y-3">
                          <p className="text-sm text-gray-400">
                            Regular activity prevents your beneficiary from
                            claiming early. Ping to reset the timer.
                          </p>
                          <Button
                            onClick={handlePing}
                            disabled={isPinging || willDetails?.isClaimed}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            {isPinging ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Confirming...
                              </>
                            ) : (
                              <>
                                <Activity className="w-4 h-4 mr-2" />
                                Confirm Activity
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {(error || contextError) && (
                      <Alert
                        variant="destructive"
                        className="mt-4 bg-red-900/20 border-red-500/50"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {error || contextError}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* BNB Price */}
                <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Coins className="w-5 h-5 text-amber-400" />
                      BNB Price
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white mb-2">
                      ${bnbPrice ? bnbPrice.toFixed(2) : "Loading..."}
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Live
                    </Badge>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2 text-lg">
                      <Activity className="w-5 h-5 text-amber-400" />
                      Quick Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Wait Time:</span>
                      <span className="text-white">
                        {willDetails
                          ? `${Number(willDetails.claimWaitTime) / (24 * 60 * 60)} days`
                          : "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Can Withdraw:</span>
                      <span
                        className={
                          withdrawalAvailable
                            ? "text-green-400"
                            : "text-red-400"
                        }
                      >
                        {withdrawalAvailable ? "Yes" : "No"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={status.color}>{status.text}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

const InfoCard = ({
  icon: Icon,
  title,
  content,
  highlight = false,
  className = "",
}) => (
  <div
    className={`p-4 rounded-lg border border-white/10 ${highlight ? "bg-amber-500/20 text-amber-100" : "bg-white/5"}`}
  >
    <h3 className="font-semibold mb-2 flex items-center gap-2 text-white">
      <Icon className="w-4 h-4 text-amber-400" />
      {title}
    </h3>
    <div
      className={`${highlight ? "text-2xl font-mono" : "text-sm"} break-all ${className} text-white`}
    >
      {content}
    </div>
  </div>
);

export default CheckMyWill;
