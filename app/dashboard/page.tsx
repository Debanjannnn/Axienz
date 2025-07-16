"use client"

import { useEffect, useState, useCallback } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wallet,
  Activity,
  TrendingUp,
  RefreshCw,
  BarChart3,
  Zap,
  Shield,
  FileText,
  Users,
  Settings,
} from "lucide-react"

interface BNBPrice {
  price: number
  cached: boolean
  timestamp: number
  error?: string
}

interface ActivityItem {
  id: string
  type: string
  description: string
  amount: string
  hash: string
  timestamp: number
  status: string
}

interface DashboardActivity {
  address: string
  activities: ActivityItem[]
  total: number
  timestamp: number
}

export default function DashboardPage() {
  const [account, setAccount] = useState<string>("0xdc5...c52e")
  const [balance, setBalance] = useState<string>("0.0000")
  const [isConnected, setIsConnected] = useState(true)
  const [bnbPrice, setBnbPrice] = useState<BNBPrice | null>(null)
  const [activity, setActivity] = useState<DashboardActivity | null>(null)
  const [loadingPrice, setLoadingPrice] = useState(false)
  const [loadingActivity, setLoadingActivity] = useState(false)

  const fetchBNBPrice = async () => {
    setLoadingPrice(true)
    try {
      const response = await fetch("/api/bnb-price")
      const data = await response.json()
      setBnbPrice(data)
    } catch (error) {
      console.error("Error fetching BNB price:", error)
    } finally {
      setLoadingPrice(false)
    }
  }

  const fetchActivity = useCallback(async () => {
    if (!account) return

    setLoadingActivity(true)
    try {
      const response = await fetch(`/api/dashboard/activity?address=${account}`)
      const data = await response.json()
      setActivity(data)
    } catch (error) {
      console.error("Error fetching activity:", error)
    } finally {
      setLoadingActivity(false)
    }
  }, [account])

  useEffect(() => {
    fetchBNBPrice()
    fetchActivity()
    const priceInterval = setInterval(fetchBNBPrice, 60000)
    return () => clearInterval(priceInterval)
  }, [fetchActivity])

  const formatAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatTime = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return "Just now"
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0a0a0a] border-r border-gray-800 p-4">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">Axienz</h1>
        </div>

        <nav className="space-y-2">
          <NavItem icon={BarChart3} label="Dashboard" active />
          <NavItem icon={FileText} label="Create Will" />
          <NavItem icon={Users} label="Claim Will" />
          <NavItem icon={Activity} label="Ping Will" />
        </nav>

        
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {/* BNB Wallet Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-orange-500 to-red-600 border-0 text-white relative overflow-hidden">
              <div className="absolute top-2 right-2">
                <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center space-x-2">
                  <Wallet className="w-5 h-5" />
                  <span className="text-sm font-medium opacity-90">BNB WALLET</span>
                </div>
                <div className="text-xs opacity-70">BNB NETWORK</div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{balance} BNB</div>
                  <div className="text-sm opacity-80">0</div>
                  <div className="text-xs opacity-70">CARDHOLDER</div>
                  <div className="text-xs font-mono opacity-80">{formatAddress(account)}</div>
                  <div className="text-xs opacity-60">@binance</div>
                  <div className="flex justify-between items-center mt-4">
                    <div className="text-xs opacity-70">{formatAddress("0xdce5...e52e")}</div>
                    <div className="text-right">
                      <div className="text-xs opacity-70">9/8</div>
                      <div className="text-xs opacity-70">CVC</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Asset Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <h3 className="text-white font-semibold">Asset Distribution</h3>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center mb-6">
                  <div className="relative w-32 h-32">
                    <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-gray-700"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="35"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={`${73 * 2.2} ${100 * 2.2}`}
                        className="text-white"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">73%</span>
                      <span className="text-xs text-gray-400">Allocated</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="text-gray-300">Digital Assets</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white">45% • $3,780</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-gray-300">Smart Contracts</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white">28% • $2,350</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                      <span className="text-gray-300">Reserved</span>
                    </div>
                    <div className="text-right">
                      <div className="text-white">27% • $2,270</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* BNB Price */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">BNB Price</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchBNBPrice}
                    disabled={loadingPrice}
                    className="text-gray-400 hover:text-white p-1"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingPrice ? "animate-spin" : ""}`} />
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">7d: +15.85%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-white mb-1">${bnbPrice?.price.toFixed(2) || "5.15"}</div>
                    <div className="flex justify-between text-sm text-gray-400">
                      <span>24h High: ${bnbPrice ? (bnbPrice.price * 1.02).toFixed(2) : "5.16"}</span>
                      <span>24h Low: ${bnbPrice ? (bnbPrice.price * 0.98).toFixed(2) : "4.81"}</span>
                    </div>
                  </div>

                  <div className="text-right text-sm text-gray-400 space-y-1">
                    <div>Market Cap: $3.39B</div>
                    <div>Volume: $293.0M</div>
                    <div>Last updated: 10:37:44</div>
                  </div>

                  {/* Simple Chart Representation */}
                  <div className="h-16 bg-gray-800 rounded flex items-end justify-center p-2">
                    <div className="flex items-end space-x-1 h-full">
                      {Array.from({ length: 20 }, (_, i) => (
                        <div
                          key={i}
                          className="bg-gray-600 w-2 rounded-t"
                          style={{
                            height: `${Math.random() * 80 + 20}%`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-gray-400" />
                  <h3 className="text-white font-semibold">Recent Activity</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ActivityRow
                    icon={FileText}
                    title="Will Creation"
                    time="Dec 15, 2:30 PM"
                    amount="-$0.01"
                    status="Completed"
                  />
                  <ActivityRow
                    icon={TrendingUp}
                    title="Asset Distribution"
                    time="Dec 12, 10:15 AM"
                    amount="+$2,500.00"
                    status="Executed"
                    positive
                  />
                  <ActivityRow
                    icon={Settings}
                    title="Smart Contract Update"
                    time="Dec 10, 4:45 PM"
                    amount="-$0.01"
                    status="Completed"
                  />
                  <ActivityRow
                    icon={Shield}
                    title="Legacy Verification"
                    time="Dec 8, 9:20 AM"
                    amount="-$0.01"
                    status="Verified"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Additional Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="pb-4">
                <h3 className="text-white font-semibold">Quick Actions</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                  >
                    <FileText className="w-6 h-6" />
                    <span className="text-sm">Create Will</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                  >
                    <Users className="w-6 h-6" />
                    <span className="text-sm">Claim Will</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                  >
                    <Activity className="w-6 h-6" />
                    <span className="text-sm">Ping Will</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 bg-transparent"
                  >
                    <Settings className="w-6 h-6" />
                    <span className="text-sm">Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function NavItem({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center space-x-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        active ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800/50"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </div>
  )
}

function ActivityRow({
  icon: Icon,
  title,
  time,
  amount,
  status,
  positive = false,
}: {
  icon: any
  title: string
  time: string
  amount: string
  status: string
  positive?: boolean
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <div className="text-sm text-white">{title}</div>
          <div className="text-xs text-gray-400">{time}</div>
        </div>
      </div>
      <div className="text-right">
        <div className={`text-sm ${positive ? "text-green-500" : "text-white"}`}>{amount}</div>
        <div className="text-xs text-green-500">{status}</div>
      </div>
    </div>
  )
}
