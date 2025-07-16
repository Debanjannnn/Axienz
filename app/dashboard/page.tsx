"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { useSmartWill } from "@/context/SmartWillContext";
import {
  getBNBPrice,
  convertBNBToUSD,
  formatUSD,
  formatBNB,
} from "@/utils/usdConversion";
import {
  Wallet,
  Activity,
  TrendingUp,
  RefreshCw,
  Shield,
  FileText,
  Users,
  Settings,
  DollarSign,
  Clock,
  AlertCircle,
  Plus,
} from "lucide-react";

interface BNBPrice {
  price: number;
  cached: boolean;
  timestamp: number;
  error?: string;
}

export default function DashboardPage() {
  const {
    account,
    balance,
    isConnected,
    connectWallet,
    loading: walletLoading,
    error: walletError,
    getContractBalance,
    getNormalWill,
    hasCreatedWill,
    getNormalWillsAsBeneficiary,
  } = useSmartWill();

  const [bnbPrice, setBnbPrice] = useState<BNBPrice | null>(null);
  const [contractBalance, setContractBalance] = useState("0");
  const [userWillData, setUserWillData] = useState<any>(null);
  const [claimableWills, setClaimableWills] = useState<any[]>([]);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingWillData, setLoadingWillData] = useState(false);
  const [loadingClaimables, setLoadingClaimables] = useState(false);
  const [balanceUSD, setBalanceUSD] = useState(0);
  const [contractBalanceUSD, setContractBalanceUSD] = useState(0);
  const [userWillAmountUSD, setUserWillAmountUSD] = useState(0);

  const fetchBNBPrice = async () => {
    setLoadingPrice(true);
    try {
      const price = await getBNBPrice();
      setBnbPrice({
        price,
        cached: false,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("Error fetching BNB price:", error);
    } finally {
      setLoadingPrice(false);
    }
  };

  const fetchWillData = useCallback(async () => {
    if (!account) return;

    setLoadingWillData(true);
    try {
      const [hasWill, contractBal] = await Promise.all([
        hasCreatedWill(account),
        getContractBalance(),
      ]);

      let willData = null;
      if (hasWill) {
        willData = await getNormalWill(account);
      }

      setUserWillData(hasWill ? willData : null);
      setContractBalance(contractBal);

      // Convert contract balance to USD
      if (bnbPrice) {
        const contractUSD = await convertBNBToUSD(contractBal);
        setContractBalanceUSD(contractUSD);

        // Convert user will amount to USD
        if (willData && willData.amount) {
          const willAmountBNB = parseFloat(willData.amount.toString()) / 1e18;
          const willAmountUSD = await convertBNBToUSD(willAmountBNB);
          setUserWillAmountUSD(willAmountUSD);
        }
      }
    } catch (error) {
      console.error("Error fetching will data:", error);
    } finally {
      setLoadingWillData(false);
    }
  }, [account, hasCreatedWill, getNormalWill, getContractBalance, bnbPrice]);

  const fetchClaimableWills = useCallback(async () => {
    if (!account) return;

    setLoadingClaimables(true);
    try {
      const claimables = await getNormalWillsAsBeneficiary(account);
      setClaimableWills(claimables || []);
    } catch (error) {
      console.error("Error fetching claimable wills:", error);
      setClaimableWills([]);
    } finally {
      setLoadingClaimables(false);
    }
  }, [account, getNormalWillsAsBeneficiary]);

  const updateBalanceUSD = useCallback(async () => {
    if (balance && bnbPrice) {
      const usd = await convertBNBToUSD(balance);
      setBalanceUSD(usd);
    }
  }, [balance, bnbPrice]);

  useEffect(() => {
    fetchBNBPrice();
  }, []);

  useEffect(() => {
    if (isConnected && account) {
      fetchWillData();
      fetchClaimableWills();
    }
  }, [isConnected, account, fetchWillData, fetchClaimableWills]);

  useEffect(() => {
    updateBalanceUSD();
  }, [updateBalanceUSD]);

  useEffect(() => {
    // Auto refresh data every 30 seconds
    const interval = setInterval(() => {
      if (isConnected && account) {
        fetchBNBPrice();
        fetchWillData();
        fetchClaimableWills();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, account, fetchWillData, fetchClaimableWills]);

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getWillStatus = () => {
    if (!userWillData) return { color: "text-gray-400", text: "No Will" };
    if (userWillData.isClaimed)
      return { color: "text-red-500", text: "Claimed" };

    const now = Math.floor(Date.now() / 1000);
    const lastPing = Number(userWillData.lastPingTime);
    const waitTime = Number(userWillData.claimWaitTime);
    const timeUntilClaimable = lastPing + waitTime - now;

    if (timeUntilClaimable <= 0)
      return { color: "text-red-500", text: "Claimable" };
    if (timeUntilClaimable <= waitTime * 0.1)
      return { color: "text-yellow-500", text: "Action Needed" };
    return { color: "text-green-500", text: "Active" };
  };

  const formatTimeUntilClaimable = () => {
    if (!userWillData) return "N/A";

    const now = Math.floor(Date.now() / 1000);
    const lastPing = Number(userWillData.lastPingTime);
    const waitTime = Number(userWillData.claimWaitTime);
    const timeUntilClaimable = lastPing + waitTime - now;

    if (timeUntilClaimable <= 0) return "Claimable now";

    const days = Math.floor(timeUntilClaimable / (24 * 60 * 60));
    const hours = Math.floor((timeUntilClaimable % (24 * 60 * 60)) / (60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  if (!isConnected) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center text-white">
          <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border-white/20 shadow-xl rounded-2xl">
            <CardHeader className="text-center">
              <h3 className="text-lg font-semibold">Connect Wallet</h3>
              <p className="text-gray-400">
                Please connect your wallet to view dashboard
              </p>
            </CardHeader>
            <CardContent className="p-4 flex justify-center">
              <Button
                onClick={connectWallet}
                disabled={walletLoading}
                className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded transition-colors"
              >
                {walletLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const willStatus = getWillStatus();

  return (
    <DashboardLayout>
      <div className="min-h-screen text-white p-6">
        {/* Error Display */}
        {walletError && (
          <div className="mb-6">
            <Card className="bg-red-900/20 border-red-500/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">{walletError}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Wallet Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-amber-500 to-orange-600 border-0 text-white relative overflow-hidden shadow-xl shadow-amber-500/20">
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">
                    WALLET BALANCE
                  </span>
                </div>
                <div className="text-xs opacity-70">BNB NETWORK</div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{formatBNB(balance)}</div>
                  <div className="text-sm opacity-80">
                    {formatUSD(balanceUSD)}
                  </div>
                  <div className="text-xs opacity-70">ACCOUNT</div>
                  <div className="text-xs font-mono opacity-80">
                    {formatAddress(account)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contract Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-amber-400" />
                    Contract TVL
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchWillData}
                    disabled={loadingWillData}
                    className="text-gray-400 hover:text-amber-400 p-1"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loadingWillData ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-amber-400">
                    {formatBNB(contractBalance)}
                  </div>
                  <div className="text-sm text-gray-300">
                    {formatUSD(contractBalanceUSD)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Total Value Locked
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* BNB Price */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    BNB Price
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchBNBPrice}
                    disabled={loadingPrice}
                    className="text-gray-400 hover:text-amber-400 p-1"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loadingPrice ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">
                    ${bnbPrice?.price.toFixed(2) || "---"}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      Live
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-400">
                    Updated:{" "}
                    {bnbPrice
                      ? new Date(bnbPrice.timestamp).toLocaleTimeString()
                      : "Never"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Will Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Will Status
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className={`text-2xl font-bold ${willStatus.color}`}>
                    {willStatus.text}
                  </div>
                  <div className="text-sm text-gray-300">
                    {userWillData
                      ? formatTimeUntilClaimable()
                      : "No will created"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {userWillData
                      ? `Created ${new Date(Number(userWillData.creationTime) * 1000).toLocaleDateString()}`
                      : "Create your first will"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Your Will Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" />
                    Your Will
                  </h3>
                  {userWillData && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => (window.location.href = "/check-my-will")}
                      className="text-gray-400 hover:text-amber-400 text-sm"
                    >
                      Manage →
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {userWillData ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Amount Secured:</span>
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {formatBNB(
                            parseFloat(userWillData.amount?.toString() || "0") /
                              1e18,
                          )}
                        </div>
                        <div className="text-sm text-gray-400">
                          {formatUSD(userWillAmountUSD)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Beneficiary:</span>
                      <span className="text-white font-mono text-sm">
                        {formatAddress(userWillData.beneficiary)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Status:</span>
                      <Badge
                        className={
                          willStatus.color === "text-green-500"
                            ? "bg-green-500/20 text-green-400 border-green-500/30"
                            : willStatus.color === "text-yellow-500"
                              ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                              : "bg-red-500/20 text-red-400 border-red-500/30"
                        }
                      >
                        {willStatus.text}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Last Activity:</span>
                      <span className="text-white text-sm">
                        {new Date(
                          Number(userWillData.lastPingTime) * 1000,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <Button
                        className="w-full bg-amber-500 hover:bg-amber-600 text-black font-medium transition-colors"
                        onClick={() =>
                          (window.location.href = "/check-my-will")
                        }
                      >
                        Manage Will
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 mb-4">No will created yet</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Secure your digital assets for your loved ones
                    </p>
                    <Button
                      className="bg-amber-500 hover:bg-amber-600 text-black font-medium transition-colors"
                      onClick={() => (window.location.href = "/create-will")}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your Will
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Claimable Assets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Users className="w-5 h-5 text-amber-400" />
                    Claimable Assets
                  </h3>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {claimableWills.length}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchClaimableWills}
                      disabled={loadingClaimables}
                      className="text-gray-400 hover:text-amber-400 p-1"
                    >
                      <RefreshCw
                        className={`w-4 h-4 ${loadingClaimables ? "animate-spin" : ""}`}
                      />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {claimableWills.length > 0 ? (
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {claimableWills.map((will, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <div>
                          <div className="text-sm text-white font-medium">
                            From: {formatAddress(will.owner)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Inheritance available
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-amber-400 font-medium">
                            {formatBNB(will.amount)}
                          </div>
                          <div className="text-xs text-gray-400">
                            Click to claim
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <Button
                        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium transition-colors"
                        onClick={() => (window.location.href = "/claimables")}
                      >
                        View All Claimables
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400 mb-2">No claimable assets</p>
                    <p className="text-sm text-gray-500">
                      Assets you can inherit will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl mt-6">
            <CardHeader className="pb-4">
              <h3 className="text-white font-semibold">Quick Actions</h3>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/5 backdrop-blur border-white/20 hover:bg-white/10 hover:border-amber-400/50 transition-all"
                  onClick={() => (window.location.href = "/create-will")}
                >
                  <FileText className="w-6 h-6 text-amber-400" />
                  <span className="text-sm">Create Will</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/5 backdrop-blur border-white/20 hover:bg-white/10 hover:border-amber-400/50 transition-all"
                  onClick={() => (window.location.href = "/check-my-will")}
                >
                  <Settings className="w-6 h-6 text-amber-400" />
                  <span className="text-sm">Manage Will</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/5 backdrop-blur border-white/20 hover:bg-white/10 hover:border-amber-400/50 transition-all"
                  onClick={() => (window.location.href = "/claimables")}
                >
                  <Users className="w-6 h-6 text-amber-400" />
                  <span className="text-sm">Claim Assets</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/5 backdrop-blur border-white/20 hover:bg-white/10 hover:border-amber-400/50 transition-all"
                  onClick={() => {
                    fetchBNBPrice();
                    fetchWillData();
                    fetchClaimableWills();
                  }}
                >
                  <RefreshCw className="w-6 h-6 text-amber-400" />
                  <span className="text-sm">Refresh Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
