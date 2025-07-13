"use client"

import { useEffect, useState, useCallback } from "react"  // Added useCallback
import { isAddress } from "ethers"
import { useSmartWill } from "@/context/SmartWillContext"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { ScrollText, AlertCircle, Info, Clock, GraduationCap, BookOpen, Loader2, Wallet } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { AnimatedShinyText } from "./magicui/animated-shiny-text"
import { IconArrowLeft } from "@tabler/icons-react"
import { DotBackground } from "./animateddots"

export default function CreateSimpleWill() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    beneficiary: "",
    assets: "",
    amount: "",
    claimWaitTime: "",
  })
  const [validationError, setValidationError] = useState("")
  const [openDialog, setOpenDialog] = useState(false)
  const [checkingWill, setCheckingWill] = useState(true)
  const [hasWill, setHasWill] = useState(false)

  // Add this near the other state declarations at the top
  const [transactionHash, setTransactionHash] = useState("")
  const [creatingWill, setCreatingWill] = useState(false)
  const [waitingForSignature, setWaitingForSignature] = useState(false)

  const [confirmationChecks, setConfirmationChecks] = useState({
    termsAccepted: false,
    understandInactivity: false,
    understandFees: false,
    confirmBeneficiary: false,
    createBackup: false,
    allowDistribution: false,
    understandLock: false,
    acceptRisks: false,
  })

  const {
    account,
    balance,
    connectWallet,
    createNormalWill,
    loading,
    error,
    isConnected,
    hasCreatedWill,
    chainId,
  } = useSmartWill()

  useEffect(() => {
    if (!isConnected) {
      connectWallet()
    }
  }, [isConnected])

  // Check Will Status Effect - Moved to useCallback for correct memoization
  const checkWillStatus = useCallback(async () => {
    if (account && isConnected) {
      setCheckingWill(true)
      try {
        const willExists = await hasCreatedWill(account)
        setHasWill(willExists)
        if (willExists) {
          router.push('/check-my-will/simple')
        }
      } catch (error) {
        console.error("Error checking will status:", error)
      } finally {
        setCheckingWill(false)
      }
    } else {
      setCheckingWill(false)
    }
  }, [account, isConnected, router, hasCreatedWill])

  useEffect(() => {
    checkWillStatus()  // Call the memoized function
  }, [])

  // Handle Submit Effect
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isConnected) {
      await connectWallet()
      return
    }
    if (!validateForm()) return

    try {
      setCreatingWill(true)
      setWaitingForSignature(true)
      setTransactionHash("") // Reset transaction hash before starting

      // Add balance check
      const requiredAmount = Number(formData.amount)
      if (Number(balance) < requiredAmount) {
        throw new Error(`Insufficient balance. You need ${requiredAmount} EDU but have ${Number(balance).toFixed(4)} EDU`)
      }

      const success = await createNormalWill(
        formData.beneficiary,
        formData.assets,
        formData.amount,
        formData.claimWaitTime,
        (hash) => {
          setTransactionHash(hash)
          setWaitingForSignature(false)
        }
      )

      if (success) {
        setFormData({ beneficiary: "", assets: "", amount: "", claimWaitTime: "" })
        setOpenDialog(false)
        setConfirmationChecks(Object.keys(confirmationChecks).reduce((acc, key) => ({ ...acc, [key]: false }), {}))
        // Maybe add a success notification here
      }
    } catch (err) {
      console.error("Error submitting will:", err)
      setError(err.message || "Failed to create will. Please try again.")
    } finally {
      setCreatingWill(false)
      setWaitingForSignature(false)
    }
}


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setValidationError("")
  }

  const handleCheckboxChange = (name) => {
    setConfirmationChecks((prev) => ({ ...prev, [name]: !prev[name] }))
  }

  const getConfirmationLabel = (key) => {
    const labels = {
      termsAccepted: "Accept Terms and Conditions",
      understandInactivity: "Understand Inactivity Period",
      understandFees: "Acknowledge Service Fee",
      confirmBeneficiary: "Confirm Beneficiary",
      createBackup: "Create Backup",
      allowDistribution: "Allow Distribution",
      understandLock: "Understand Asset Lock",
      acceptRisks: "Accept Risks",
    }
    return labels[key] || key
  }

  const getConfirmationDescription = (key) => {
    const descriptions = {
      termsAccepted: "I accept the terms and conditions of the Educational Smart Will service",
      understandInactivity: "My academic beneficiary can only claim after 10 years of account inactivity",
      understandFees: "A 2% service fee in EDU tokens will support the Open Campus ecosystem",
      confirmBeneficiary: "The beneficiary address belongs to my chosen academic successor",
      createBackup: "I have securely backed up my wallet credentials and academic documentation",
      allowDistribution: "If unclaimed, I allow distribution to the Open Campus scholarship fund",
      understandLock: "Academic assets will be locked for minimum 1 year after creation",
      acceptRisks: "I understand and accept all risks associated with blockchain-based academic asset transfer",
    }
    return descriptions[key] || ""
  }

  const ConfirmationCheckboxes = () => (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
      {Object.entries(confirmationChecks).map(([key, value]) => (
        <div
          key={key}
          className="flex items-start space-x-3 p-3 rounded-lg bg-secondary/20 hover:bg-secondary/30 transition-colors"
        >
          <Checkbox id={key} checked={value} onCheckedChange={() => handleCheckboxChange(key)} className="mt-1" />
          <div className="space-y-1">
            <Label htmlFor={key} className="text-sm font-medium leading-none cursor-pointer">
              {getConfirmationLabel(key)}
            </Label>
            <p className="text-xs text-muted-foreground">{getConfirmationDescription(key)}</p>
          </div>
        </div>
      ))}
    </div>
  )

  if (creatingWill) {
    return (
      <DotBackground>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-6">
              <Loader2 className="h-12 w-12 animate-spin text-primary stroke-[3px]" />

              <div className="text-center space-y-2">
                <h3 className="text-xl font-semibold">
                  {waitingForSignature
                    ? "Please Confirm Transaction"
                    : "Creating Your Academic Will"}
                </h3>

                <p className="text-muted-foreground">
                  {waitingForSignature ? (
                    <>
                      Please accept the MetaMask request and confirm the transaction<br />
                      <span className="font-medium">Amount to deposit: {formData.amount} EDU</span>
                    </>
                  ) : (
                    "Waiting for the transaction to be mined..."
                  )}
                </p>
              </div>

              {transactionHash && (
                <div className="w-full space-y-2">
                  <p className="text-sm text-muted-foreground text-center">Transaction Hash:</p>
                  <a
                    href={`${process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL}/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:text-primary/80 break-all text-center block"
                  >
                    {transactionHash}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      </DotBackground>
    )
  }

  if (loading || checkingWill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-transparent backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary stroke-[3px]" />
              <p className="text-lg font-medium text-center">
                {checkingWill
                  ? "Checking your will status..."
                  : "Switching your network to EDU Chain Testnet and connecting EDU Legacy with it. Please accept the connection request in your wallet."}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                This process may take a few seconds. Please be patient.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (hasWill) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md bg-transparent backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary stroke-[3px]" />
              <p className="text-lg font-medium text-center">
                You already have an existing will. Redirecting you to the management page...
              </p>
              <p className="text-sm text-muted-foreground text-center">
                Please wait a moment.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Wallet Info Component
  const WalletInfo = () => {
    if (!account) return null

    return (
      <Card className="mb-8 bg-transparent backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Wallet className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Connected Wallet</p>
                <p className="font-medium">
                  {account.slice(0, 6)}...{account.slice(-4)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balance</p>
              <p className="font-medium">{Number(balance).toFixed(4)} EDU</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const validateForm = () => {
    if (formData.assets.length < 50) {
      setValidationError("Description must be at least 50 characters long")
      return false
    }
    if (!formData.amount || Number.parseFloat(formData.amount) <= 0) {
      setValidationError("Initial deposit amount is required")
      return false
    }
    if (!isAddress(formData.beneficiary)) {
      setValidationError("Invalid beneficiary address")
      return false
    }

    if (!formData.claimWaitTime || Number.parseInt(formData.claimWaitTime) < 60) {
      setValidationError("Claim wait time must be at least 60 seconds")
      return false
    }

    if (!Object.values(confirmationChecks).every(Boolean)) {
      setValidationError("Please confirm all conditions before proceeding")
      return false
    }
    setValidationError("")
    return true
  }

  const goHome = () => {
    router.push("/")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-8">
      <Button onClick={goHome} variant="outline" className="absolute top-4 left-4 flex items-center hover:bg-transparent rounded-full bg-transparent backdrop-blur-sm">
      <AnimatedShinyText className="text-sm">Back to Home</AnimatedShinyText>
      </Button>
      <WalletInfo />

      {(error || validationError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || validationError}</AlertDescription>
        </Alert>
      )}

      <Card className="border bg-transparent backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-display text-center text-gray-200">Create Your Academic Legacy</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Secure your educational assets and intellectual property on Open Campus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <Label htmlFor="beneficiary" className="text-lg text-foreground flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Academic Beneficiary Address
                </Label>
                <Input
                  type="text"
                  id="beneficiary"
                  name="beneficiary"
                  value={formData.beneficiary}
                  onChange={handleChange}
                  className="bg-input border-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring placeholder:text-muted-foreground mt-2"
                  placeholder="0x..."
                  required
                />
              </div>

              <div className="relative">
                <Label htmlFor="amount" className="text-lg text-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Initial EDU Token Deposit
                </Label>
                <Input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="bg-input border-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring placeholder:text-muted-foreground mt-2"
                  placeholder="100"
                  step="0.000001"
                  min="0"
                  required
                />
                {formData.amount && (
                  <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Final deposit: {(Number(formData.amount) * 0.98).toFixed(6)} EDU (2% supports EDU Legacy Scholarship)
                  </div>
                )}
              </div>

              <div className="relative">
                <Label htmlFor="assets" className="text-lg text-foreground flex items-center gap-2">
                  <ScrollText className="w-4 h-4" /> Academic Assets Description
                </Label>
                <Textarea
                  id="assets"
                  name="assets"
                  value={formData.assets}
                  onChange={handleChange}
                  className="bg-input border-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring placeholder:text-muted-foreground mt-2 min-h-[120px]"
                  placeholder="Describe your academic assets (research papers, intellectual property, educational resources)..."
                  required
                />
                <div className="mt-1 text-sm text-muted-foreground">{formData.assets.length}/50 characters</div>
              </div>

                {/* Custom Claim Wait Time Section */}
              <div className="relative">
                <Label htmlFor="claimWaitTime" className="text-lg text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Custom Claim Wait Time (only on Testnet)
                </Label>
                <div className="mt-2 p-4 rounded-lg bg-secondary/20 border border-secondary/30">
                  <Input
                    type="number"
                    id="claimWaitTime"
                    name="claimWaitTime"
                    value={formData.claimWaitTime}
                    onChange={handleChange}
                    className="bg-input border-input text-foreground focus:ring-2 focus:ring-ring focus:border-ring placeholder:text-muted-foreground"
                    placeholder="60"
                    min="60"
                    required
                  />
                  <div className="mt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 mt-1 text-primary" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-primary mb-1">Testnet Configuration</p>
                        <p>For testing purposes, you can set a custom wait time (minimum 60 seconds). This allows you to experience the full functionality without waiting for extended periods.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      <Clock className="w-4 h-4 mt-1 text-primary" />
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-primary mb-1">Mainnet Behavior</p>
                        <p>On mainnet, the wait time is automatically set to 10 years to ensure proper academic legacy protection. We value your feedback for potential improvements to this timeframe.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* End Custom Claim Wait Time Section */}
            </div>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  className="w-full bg-transparent backdrop-blur-sm hover:dark:bg-white/10 hover:dark:text-black border rounded-full px-6 py-6"
                >
                  <AnimatedShinyText className="text-lg">Secure Academic Legacy</AnimatedShinyText>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-transparent backdrop-blur-xl rounded-2xl">
                <DialogTitle>Confirm Academic Will Creation</DialogTitle>
                <DialogDescription>
                  Please review and confirm the following conditions for your educational legacy
                </DialogDescription>

                <div className="my-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion Progress</span>
                    <span>
                      {Object.values(confirmationChecks).filter(Boolean).length} /{" "}
                      {Object.keys(confirmationChecks).length}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                      style={{
                        width: `${(Object.values(confirmationChecks).filter(Boolean).length / Object.keys(confirmationChecks).length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>

                <ConfirmationCheckboxes />

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setOpenDialog(false)} className="mr-2">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !Object.values(confirmationChecks).every(Boolean)}
                    className="bg-primary text-primary-foreground"
                  >
                    {loading ? "Creating..." : "Secure Academic Legacy"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}