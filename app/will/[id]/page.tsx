"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useSmartWill } from "@/context/SmartWillContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollText, AlertCircle, Clock, Check, Lock, Loader2, Info, Shield } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Will {
  id: string
  testator: string
  assets: string
  amount: string
  createdAt: number
  claimWaitTime: number
  claimed: boolean
}

export default function WillDetails() {
  const params = useParams()
  const { id } = params
  const { account, connectWallet, loading: walletLoading, error: walletError, isConnected } = useSmartWill()
  const [will, setWill] = useState<Will | null>(null)
  const [loading, setLoading] = useState(true)
  const [claiming, setClaiming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected) {
      connectWallet()
    } else {
      fetchWillDetails()
    }
  }, [isConnected, id, connectWallet]) // Added connectWallet to dependencies

  const fetchWillDetails = async () => {
    try {
      setLoading(true)
      // This would be replaced with actual contract call
      const mockWill: Will = {
        id: id as string,
        testator: "0x1234...5678",
        assets: "Research papers and academic credentials",
        amount: "100",
        createdAt: Date.now() - 86400000 * 365 * 11, // 11 years ago
        claimWaitTime: 60 * 60 * 24 * 365 * 10, // 10 years in seconds
        claimed: false,
      }
      setWill(mockWill)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch will details")
    } finally {
      setLoading(false)
    }
  }

  const handleClaim = async () => {
    try {
      setClaiming(true)
      // This would be replaced with actual contract call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      // Update local state after successful claim
      setWill((prev) => (prev ? { ...prev, claimed: true } : null))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to claim will")
    } finally {
      setClaiming(false)
    }
  }

  const isClaimable = (createdAt: number, claimWaitTime: number) => {
    const waitTimeMs = claimWaitTime * 1000
    return Date.now() - createdAt >= waitTimeMs
  }

  const getTimeRemaining = (createdAt: number, claimWaitTime: number) => {
    const waitTimeMs = claimWaitTime * 1000
    const endTime = createdAt + waitTimeMs
    return formatDistanceToNow(endTime, { addSuffix: true })
  }

  if (!isConnected || loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!will) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">Will not found</CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {(error || walletError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || walletError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-display">Academic Legacy Details</CardTitle>
          <CardDescription>View and claim your designated academic assets</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Testator</div>
                <div className="font-medium">{will.testator}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{will.amount} BNB</div>
                <div className="text-sm text-muted-foreground">Token Amount</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Assets Description</div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start gap-2">
                  <ScrollText className="h-4 w-4 mt-1" />
                  <div>{will.assets}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="text-sm text-muted-foreground">Timeline</div>
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <div>Created {formatDistanceToNow(will.createdAt, { addSuffix: true })}</div>
                </div>
                <div className="flex items-center gap-2">
                  {isClaimable(will.createdAt, will.claimWaitTime) ? (
                    <>
                      <Check className="h-4 w-4 text-green-500" />
                      <div className="text-green-500">Claim period has started</div>
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      <div>Claimable {getTimeRemaining(will.createdAt, will.claimWaitTime)}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-4 rounded-lg w-full">
            <Info className="h-4 w-4 mt-1" />
            <div>
              This academic legacy can only be claimed by the designated beneficiary address. Ensure you are connected
              with the correct wallet before claiming.
            </div>
          </div>
          <Button
            className="w-full"
            size="lg"
            onClick={handleClaim}
            disabled={!isClaimable(will.createdAt, will.claimWaitTime) || claiming || will.claimed}
          >
            {claiming ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Claiming...
              </>
            ) : will.claimed ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Already Claimed
              </>
            ) : !isClaimable(will.createdAt, will.claimWaitTime) ? (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Not Yet Claimable
              </>
            ) : (
              <>
                <Shield className="mr-2 h-4 w-4" />
                Claim Academic Legacy
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

