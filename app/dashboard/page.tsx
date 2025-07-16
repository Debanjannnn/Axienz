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
  getDualDisplay,
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
} from "lucide-react";

interface BNBPrice {
  price: number;
  cached: boolean;
  timestamp: number;
  error?: string;
}

interface ActivityDisplay {
  id: string;
  title: string;
  description: string;
  timestamp: number;
  activityType: string;
  amount: string;
  amountUSD: string;
  status: string;
  icon: any;
}

export default function DashboardPage() {
  const {
    account,
    balance,
    isConnected,
    connectWallet,
    loading: walletLoading,
    error: walletError,
    getUserActivity,
    getUserActivitySummary,
    getContractBalance,
    getNormalWill,
    hasCreatedWill,
  } = useSmartWill();

  const [bnbPrice, setBnbPrice] = useState<BNBPrice | null>(null);
  const [activities, setActivities] = useState<ActivityDisplay[]>([]);
  const [activitySummary, setActivitySummary] = useState<any>(null);
  const [contractBalance, setContractBalance] = useState("0");
  const [userWillData, setUserWillData] = useState<any>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingWillData, setLoadingWillData] = useState(false);
  const [balanceUSD, setBalanceUSD] = useState(0);
  const [contractBalanceUSD, setContractBalanceUSD] = useState(0);

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

  const fetchUserActivity = useCallback(async () => {
    if (!account) return;

    setLoadingActivity(true);
    try {
      const [activityData, summary] = await Promise.all([
        getUserActivity(account, 0, 10),
        getUserActivitySummary(account),
      ]);

      // Convert activities to display format
      const formattedActivities = await Promise.all(
        activityData.activities.map(async (activity: any, index: number) => {
          const amountBNB = parseFloat(activity.amount) / 1e18;
          const amountUSD = await convertBNBToUSD(amountBNB);

          let icon = Activity;
          let status = "Completed";
          let title = activity.activityType;

          switch (activity.activityType) {
            case "WILL_CREATED":
              icon = FileText;
              title = "Will Created";
              status = "Completed";
              break;
            case "DEPOSIT":
              icon = TrendingUp;
              title = "Deposit Made";
              status = "Completed";
              break;
            case "PING":
              icon = Activity;
              title = "Activity Confirmed";
              status = "Completed";
              break;
            case "CLAIM":
              icon = Users;
              title = "Will Claimed";
              status = "Executed";
              break;
            case "WITHDRAWAL":
              icon = Wallet;
              title = "Withdrawal";
              status = "Completed";
              break;
            default:
              icon = Activity;
              title = activity.activityType.replace("_", " ");
          }

          return {
            id: `${activity.timestamp}-${index}`,
            title,
            description: activity.description || `${title} transaction`,
            timestamp: activity.timestamp * 1000,
            activityType: activity.activityType,
            amount: formatBNB(amountBNB),
            amountUSD: formatUSD(amountUSD),
            status,
            icon,
          };
        }),
      );

      setActivities(formattedActivities);
      setActivitySummary(summary);
    } catch (error) {
      console.error("Error fetching user activity:", error);
    } finally {
      setLoadingActivity(false);
    }
  }, [account, getUserActivity, getUserActivitySummary]);

  const fetchWillData = useCallback(async () => {
    if (!account) return;

    setLoadingWillData(true);
    try {
      const [hasWill, willData, contractBal] = await Promise.all([
        hasCreatedWill(),
        hasCreatedWill().then(async (has) => {
          if (has) {
            return await getNormalWill(account);
          }
          return null;
        }),
        getContractBalance(),
      ]);

      setUserWillData(hasWill ? willData : null);
      setContractBalance(contractBal);

      // Convert contract balance to USD
      const contractUSD = await convertBNBToUSD(contractBal);
      setContractBalanceUSD(contractUSD);
    } catch (error) {
      console.error("Error fetching will data:", error);
    } finally {
      setLoadingWillData(false);
    }
  }, [account, hasCreatedWill, getNormalWill, getContractBalance]);

  const updateBalanceUSD = useCallback(async () => {
    if (balance && bnbPrice) {
      const usd = await convertBNBToUSD(balance);
      setBalanceUSD(usd);
    }
  }, [balance, bnbPrice]);

  useEffect(() => {
    if (isConnected && account) {
      fetchBNBPrice();
      fetchUserActivity();
      fetchWillData();
    }
  }, [isConnected, account, fetchUserActivity, fetchWillData]);

  useEffect(() => {
    updateBalanceUSD();
  }, [updateBalanceUSD]);

  useEffect(() => {
    // Auto refresh data every 30 seconds
    const interval = setInterval(() => {
      if (isConnected && account) {
        fetchBNBPrice();
        fetchUserActivity();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, account, fetchUserActivity]);

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
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

  return (
    <DashboardLayout>
      <div className="min-h-screen text-white p-6">
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
                    {bnbPrice ? formatTime(bnbPrice.timestamp) : "Never"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activity Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Activity
                </h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">
                    {activitySummary?.totalActivities || 0}
                  </div>
                  <div className="text-sm text-gray-300">
                    {activitySummary?.hasActivity ? "Active" : "No Activity"}
                  </div>
                  <div className="text-xs text-gray-400">
                    {activitySummary?.lastActivityTime
                      ? `Last: ${formatTime(activitySummary.lastActivityTime * 1000)}`
                      : "No recent activity"}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <Activity className="w-5 h-5 text-amber-400" />
                    Recent Activity
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchUserActivity}
                    disabled={loadingActivity}
                    className="text-gray-400 hover:text-amber-400 p-1"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${loadingActivity ? "animate-spin" : ""}`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {activities.length > 0 ? (
                    activities.map((activity) => (
                      <ActivityRow
                        key={activity.id}
                        icon={activity.icon}
                        title={activity.title}
                        description={activity.description}
                        time={formatTime(activity.timestamp)}
                        amount={activity.amount}
                        amountUSD={activity.amountUSD}
                        status={activity.status}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-400">No recent activity</p>
                      <p className="text-sm text-gray-500">
                        Start by creating a will or making transactions
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Will Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader className="pb-4">
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" />
                  Your Will Status
                </h3>
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
                          {/* Will calculate USD value */}
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
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        Active
                      </Badge>
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
                    <Button
                      className="bg-amber-500 hover:bg-amber-600 text-black font-medium transition-colors"
                      onClick={() => (window.location.href = "/create-will")}
                    >
                      Create Your Will
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function ActivityRow({
  icon: Icon,
  title,
  description,
  time,
  amount,
  amountUSD,
  status,
}: {
  icon: any;
  title: string;
  description: string;
  time: string;
  amount: string;
  amountUSD: string;
  status: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-b-0">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-white/10 backdrop-blur border border-white/20 rounded-full flex items-center justify-center">
          <Icon className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="text-sm text-white font-medium">{title}</div>
          <div className="text-xs text-gray-400">{description}</div>
          <div className="text-xs text-gray-500">{time}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm text-white font-medium">{amount}</div>
        <div className="text-xs text-gray-400">{amountUSD}</div>
        <div className="text-xs text-green-500">{status}</div>
      </div>
    </div>
  );
}
