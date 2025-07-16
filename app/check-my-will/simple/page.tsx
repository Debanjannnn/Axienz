"use client"

import type React from "react"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useSmartWill } from "@/context/SmartWillContext"
import { Loader2, PlusCircle, Clock, Wallet, AlertCircle, User, FileText, Calendar, Coins, Shield, History } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion, AnimatePresence } from "framer-motion"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DotBackground } from "@/components/animateddots"

interface Will {
  beneficiary: string
  amount: bigint
  lastPingTime: bigint
  claimWaitTime: bigint
  description: string
  isClaimed: boolean
  creationTime: bigint
}

const CheckMyWill = () => {
  const [willDetails, setWillDetails] = useState<Will | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [depositAmount, setDepositAmount] = useState("")
  const [timeRemaining, setTimeRemaining] = useState("")
  const [timeProgress, setTimeProgress] = useState(0)
  const [isDepositing, setIsDepositing] = useState(false)
  const [isPinging, setIsPinging] = useState(false)
  const [lastPingTimeAgo, setLastPingTimeAgo] = useState("")
  const [withdrawalAvailable, setWithdrawalAvailable] = useState(false)

  const { account, connectWallet, getNormalWill, ping, depositNormalWill, withdrawNormalWill, hasCreatedWill } = useSmartWill()
  const router = useRouter()

  const fetchWillDetails = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const details = await getNormalWill(account)
      setWillDetails(details)
      checkWithdrawalEligibility(details.creationTime)
    } catch (err) {
      setError("Unable to fetch will details. Please try again.")
      setWillDetails(null)
    } finally {
      setLoading(false)
    }
  }, [account, getNormalWill])

  const checkWithdrawalEligibility = (creationTime: bigint) => {
    const oneYearInSeconds = BigInt(365 * 24 * 60 * 60)
    const now = BigInt(Math.floor(Date.now() / 1000))
    setWithdrawalAvailable(now >= creationTime + oneYearInSeconds)
  }

  useEffect(() => {
    async function checkAndFetchWill() {
      if (!account) {
        connectWallet()
        return
      }
      const hasWill = await hasCreatedWill(account)

      if (!hasWill) {
        // Redirect to create will page if the user has not created a will
        router.push("/create-will/simple")
      } else {
        fetchWillDetails()
      }
    }
    checkAndFetchWill()
  }, [account, connectWallet, fetchWillDetails, hasCreatedWill, router])

  // New effect for updating the countdown timer using the latest willDetails data.
  useEffect(() => {
    if (!willDetails) return

    const { lastPingTime, claimWaitTime } = willDetails

    const updateCounter = () => {
      const now = BigInt(Math.floor(Date.now() / 1000))
      const remainingTime = lastPingTime + claimWaitTime - now
      const totalTime = claimWaitTime

      // Calculate progress percentage.
      const elapsed = Number(claimWaitTime - remainingTime)
      const progress = Math.min(100, (elapsed / Number(totalTime)) * 100)
      setTimeProgress(progress)

      // Calculate time since last ping.
      const timeSinceLastPing = now - lastPingTime
      const daysAgo = Number(timeSinceLastPing / BigInt(24 * 60 * 60))
      setLastPingTimeAgo(
        daysAgo === 0
          ? "Today"
          : daysAgo === 1
            ? "Yesterday"
            : `${daysAgo} days ago`
      )

      if (remainingTime <= BigInt(0)) {
        setTimeRemaining("Beneficiary can claim")
      } else {
        const days = Number(remainingTime / BigInt(24 * 60 * 60))
        const hours = Number((remainingTime % BigInt(24 * 60 * 60)) / BigInt(60 * 60))
        const minutes = Number((remainingTime % BigInt(60 * 60)) / BigInt(60))
        const seconds = Number(remainingTime % BigInt(60))
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`)
      }
    }

    // Initialize and update every second.
    updateCounter()
    const interval = setInterval(updateCounter, 1000)
    return () => clearInterval(interval)
  }, [willDetails?.lastPingTime, willDetails?.claimWaitTime])

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError("Please enter a valid amount to deposit.")
      return
    }

    setIsDepositing(true)
    setError(null)
    try {
      await depositNormalWill(depositAmount)
      await fetchWillDetails()
      setDepositAmount("")
    } catch (err) {
      setError("Failed to deposit funds. Please try again.")
    } finally {
      setIsDepositing(false)
    }
  }

  const handlePing = async () => {
    setIsPinging(true)
    setError(null)
    try {
      await ping()
      await fetchWillDetails()
    } catch (err) {
      setError("Failed to confirm activity. Please try again.")
    } finally {
      setIsPinging(false)
    }
  }

  const handleWithdraw = async () => {
    if (!willDetails) return
    try {
      await withdrawNormalWill(willDetails.amount.toString())
      await fetchWillDetails()
    } catch (err) {
      setError("Failed to withdraw funds. Please try again.")
    }
  }

  // Show loader if wallet is not connected.
  if (!account) {
    return (
      <DotBackground>
        <div className="flex items-center justify-center bg-transparent min-h-screen">
          <Card className="w-full flex flex-col justify-center items-center max-w-md bg-transparent backdrop-blur-sm text-center p-6 pb-9">
            <p className="pb-7">Hang Tight While We Connect Your Wallet!</p>
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </Card>
        </div>
      </DotBackground>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // If no will details are found after wallet connection, show "No Will Found" screen.
  if (!willDetails) {
    return (
      <DotBackground>
        <div className="flex flex-col items-center justify-center bg-transparent min-h-screen p-4">
          <Card className="w-full max-w-md bg-transparent backdrop-blur-sm text-center">
            <CardHeader>
              <CardTitle>No Will Found</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6">
                Redirecting you to create a digital will to secure your assets for your beneficiaries.
              </p>
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </CardContent>
          </Card>
        </div>
      </DotBackground>
    )
  }

  const getStatusInfo = () => {
    if (willDetails.isClaimed) return { color: "text-red-500", text: "Claimed" }
    const now = BigInt(Math.floor(Date.now() / 1000))
    const remainingTime = willDetails.lastPingTime + willDetails.claimWaitTime - now
    if (remainingTime <= BigInt(0)) return { color: "text-red-500", text: "Claimable" }
    if (remainingTime <= willDetails.claimWaitTime / BigInt(10)) return { color: "text-yellow-500", text: "Action Needed" }
    return { color: "text-green-500", text: "Active" }
  }

  const status = getStatusInfo()

  return (
    <DotBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="max-w-4xl mx-auto overflow-hidden bg-transparent backdrop-blur-sm">
              <CardHeader className="bg-transparent text-primary-foreground">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-3xl font-semibold">Digital Will Dashboard</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className={`flex items-center gap-2 ${status.color}`}>
                          <Shield className="w-6 h-6" />
                          <span className="text-sm font-semibold">{status.text}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Last activity: {lastPingTimeAgo}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <InfoCard icon={User} title="Beneficiary" content={willDetails.beneficiary} />
                  <InfoCard
                    icon={Coins}
                    title="Amount Secured"
                    content={`${Number(willDetails.amount) / 1e18} BNB`}
                  />
                  <InfoCard
                    icon={Calendar}
                    title="Created On"
                    content={new Date(Number(willDetails.creationTime) * 1000).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  />
                  <InfoCard
                    icon={History}
                    title="Last Activity"
                    content={`${lastPingTimeAgo} (${new Date(Number(willDetails.lastPingTime) * 1000).toLocaleString()})`}
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Time Until Claim
                  </h3>
                  <div className="bg-secondary p-4 rounded-lg">
                    <p className="text-4xl font-mono mb-2">{timeRemaining}</p>
                    <Progress value={timeProgress} className="h-2" />
                  </div>
                </div>

                <div className="bg-secondary rounded-lg p-4">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Will Description
                  </h3>
                  <p className="text-sm">{willDetails.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <form onSubmit={handleDeposit} className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          step="0.000000000000000001"
                          min="0"
                          placeholder="Amount in BNB"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="flex-grow"
                        />
                        <Button
                          type="submit"
                          disabled={isDepositing || !depositAmount || parseFloat(depositAmount) <= 0}
                          className="whitespace-nowrap"
                        >
                          {isDepositing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Wallet className="w-4 h-4 mr-2" />
                              Add Funds
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                    {withdrawalAvailable && (
                      <Button onClick={handleWithdraw} variant="outline" className="w-full">
                        Withdraw Funds
                      </Button>
                    )}
                  </div>
                  <Button
                    onClick={handlePing}
                    disabled={isPinging || willDetails.isClaimed}
                    variant="secondary"
                    className="w-full h-full"
                  >
                    {isPinging ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Confirm Activity
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </DotBackground>
  )
}

const InfoCard = ({ icon: Icon, title, content, highlight = false, className = "" }) => (
  <div className={`p-4 rounded-lg ${highlight ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
    <h3 className="font-semibold mb-2 flex items-center gap-2">
      <Icon className="w-5 h-5" />
      {title}
    </h3>
    <p className={`${highlight ? "text-4xl font-mono" : "text-sm"} break-all ${className}`}>{content}</p>
  </div>
)

export default CheckMyWill
