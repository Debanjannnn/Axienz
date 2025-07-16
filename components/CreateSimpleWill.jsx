"use client";

import { useEffect, useState, useCallback } from "react";
import { isAddress } from "ethers";
import { useSmartWill } from "@/context/SmartWillContext";
import {
  getBNBPrice,
  convertBNBToUSD,
  formatUSD,
  formatBNB,
} from "@/utils/usdConversion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ScrollText,
  AlertCircle,
  Info,
  Clock,
  Loader2,
  Wallet,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from "next/navigation";
import { IconArrowLeft } from "@tabler/icons-react";

export default function CreateSimpleWill() {
  const router = useRouter();
  const {
    account,
    isConnected,
    connectWallet,
    createNormalWill,
    hasCreatedWill,
    loading: contextLoading,
    error: contextError,
  } = useSmartWill();

  const [formData, setFormData] = useState({
    beneficiary: "",
    assets: "",
    amount: "",
    claimWaitTime: "31536000", // 1 year in seconds
  });

  const [validationError, setValidationError] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [checkingWill, setCheckingWill] = useState(true);
  const [hasWill, setHasWill] = useState(false);
  const [transactionHash, setTransactionHash] = useState("");
  const [creatingWill, setCreatingWill] = useState(false);
  const [waitingForSignature, setWaitingForSignature] = useState(false);
  const [bnbPrice, setBnbPrice] = useState(null);
  const [amountUSD, setAmountUSD] = useState(0);
  const [loadingPrice, setLoadingPrice] = useState(false);

  const [confirmationChecks, setConfirmationChecks] = useState({
    termsAccepted: false,
    understandInactivity: false,
    understandFees: false,
    confirmBeneficiary: false,
    createBackup: false,
  });

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

  // Calculate USD value when amount changes
  const calculateUSDValue = useCallback(async () => {
    if (formData.amount && bnbPrice) {
      try {
        const usdValue = await convertBNBToUSD(formData.amount);
        setAmountUSD(usdValue);
      } catch (error) {
        console.error("Error calculating USD value:", error);
        setAmountUSD(0);
      }
    } else {
      setAmountUSD(0);
    }
  }, [formData.amount, bnbPrice]);

  // Check if user already has a will
  const checkWillStatus = useCallback(async () => {
    if (account && isConnected) {
      try {
        setCheckingWill(true);
        const willExists = await hasCreatedWill();
        setHasWill(willExists);

        if (willExists) {
          // Redirect to check will page if they already have one
          router.push("/check-my-will");
        }
      } catch (error) {
        console.error("Error checking will status:", error);
      } finally {
        setCheckingWill(false);
      }
    }
  }, [account, isConnected, hasCreatedWill, router]);

  useEffect(() => {
    fetchBNBPrice();
  }, [fetchBNBPrice]);

  useEffect(() => {
    calculateUSDValue();
  }, [calculateUSDValue]);

  useEffect(() => {
    if (isConnected && account) {
      checkWillStatus();
    } else {
      setCheckingWill(false);
    }
  }, [isConnected, account, checkWillStatus]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setValidationError("");
  };

  const handleCheckboxChange = (field) => {
    setConfirmationChecks((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const validateForm = () => {
    if (!formData.beneficiary.trim()) {
      setValidationError("Beneficiary address is required");
      return false;
    }

    if (!isAddress(formData.beneficiary)) {
      setValidationError("Please enter a valid Ethereum address");
      return false;
    }

    if (formData.beneficiary.toLowerCase() === account?.toLowerCase()) {
      setValidationError(
        "Beneficiary cannot be the same as your wallet address",
      );
      return false;
    }

    if (!formData.assets.trim()) {
      setValidationError("Asset description is required");
      return false;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setValidationError("Please enter a valid amount greater than 0");
      return false;
    }

    if (parseFloat(formData.amount) > 1000) {
      setValidationError("Amount cannot exceed 1000 BNB for security reasons");
      return false;
    }

    return true;
  };

  const validateConfirmations = () => {
    const allChecked = Object.values(confirmationChecks).every(
      (checked) => checked,
    );
    if (!allChecked) {
      setValidationError("Please confirm all requirements before proceeding");
      return false;
    }
    return true;
  };

  const handleCreateWill = async () => {
    if (!validateForm() || !validateConfirmations()) {
      return;
    }

    try {
      setCreatingWill(true);
      setWaitingForSignature(true);
      setValidationError("");

      const success = await createNormalWill(
        formData.beneficiary,
        formData.assets,
        formData.amount,
        parseInt(formData.claimWaitTime),
        (hash) => {
          setTransactionHash(hash);
          setWaitingForSignature(false);
        },
      );

      if (success) {
        // Redirect to check-my-will page after successful creation
        setTimeout(() => {
          router.push("/check-my-will");
        }, 2000);
      } else {
        setValidationError("Failed to create will. Please try again.");
      }
    } catch (error) {
      console.error("Error creating will:", error);
      setValidationError(
        error.message || "Failed to create will. Please try again.",
      );
    } finally {
      setCreatingWill(false);
      setWaitingForSignature(false);
    }
  };

  // Show connect wallet if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">
              Connect Your Wallet
            </CardTitle>
            <CardDescription className="text-gray-400">
              Please connect your wallet to create a digital will
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button
              onClick={connectWallet}
              disabled={contextLoading}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-6 rounded transition-colors"
            >
              {contextLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet className="mr-2 h-4 w-4" />
                  Connect Wallet
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while checking will status
  if (checkingWill) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto mb-4" />
              <p className="text-white">Checking your will status...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4 text-gray-400 hover:text-white"
          >
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-white mb-2">
            Create Simple Will
          </h1>
          <p className="text-gray-400">
            Secure your digital assets with our blockchain-based will system
          </p>
        </div>

        {/* Main Form */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <ScrollText className="w-5 h-5 text-amber-400" />
                Will Details
              </CardTitle>
              <CardDescription className="text-gray-400">
                Enter the details for your digital will
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Beneficiary */}
              <div className="space-y-2">
                <Label htmlFor="beneficiary" className="text-white">
                  Beneficiary Address *
                </Label>
                <Input
                  id="beneficiary"
                  placeholder="0x..."
                  value={formData.beneficiary}
                  onChange={(e) =>
                    handleInputChange("beneficiary", e.target.value)
                  }
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500"
                />
                <p className="text-xs text-gray-400">
                  The wallet address that will inherit your assets
                </p>
              </div>

              {/* Asset Description */}
              <div className="space-y-2">
                <Label htmlFor="assets" className="text-white">
                  Asset Description *
                </Label>
                <Textarea
                  id="assets"
                  placeholder="Describe the assets to be inherited..."
                  value={formData.assets}
                  onChange={(e) => handleInputChange("assets", e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 min-h-[100px]"
                />
                <p className="text-xs text-gray-400">
                  Detailed description of what will be inherited
                </p>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-white">
                  Amount (BNB) *
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    step="0.0001"
                    min="0"
                    max="1000"
                    placeholder="0.0"
                    value={formData.amount}
                    onChange={(e) =>
                      handleInputChange("amount", e.target.value)
                    }
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-500 pr-20"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 font-medium">
                    BNB
                  </div>
                </div>
                {formData.amount && bnbPrice && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">USD Value:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {formatUSD(amountUSD)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={fetchBNBPrice}
                        disabled={loadingPrice}
                        className="p-1 h-auto text-gray-400 hover:text-amber-400"
                      >
                        <RefreshCw
                          className={`w-3 h-3 ${loadingPrice ? "animate-spin" : ""}`}
                        />
                      </Button>
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  Amount to be locked and inherited (max 1000 BNB)
                </p>
              </div>

              {/* Wait Time */}
              <div className="space-y-2">
                <Label htmlFor="waitTime" className="text-white">
                  Claim Wait Time
                </Label>
                <select
                  id="waitTime"
                  value={formData.claimWaitTime}
                  onChange={(e) =>
                    handleInputChange("claimWaitTime", e.target.value)
                  }
                  className="w-full bg-white/5 border border-white/20 text-white rounded-md px-3 py-2"
                >
                  <option value="2592000">1 Month</option>
                  <option value="7776000">3 Months</option>
                  <option value="15552000">6 Months</option>
                  <option value="31536000">1 Year (Recommended)</option>
                  <option value="63072000">2 Years</option>
                </select>
                <p className="text-xs text-gray-400">
                  Time before beneficiary can claim after your last activity
                </p>
              </div>

              {/* Error Display */}
              {(validationError || contextError) && (
                <Alert
                  variant="destructive"
                  className="bg-red-900/20 border-red-500/50"
                >
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {validationError || contextError}
                  </AlertDescription>
                </Alert>
              )}

              {/* Create Button */}
              <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      if (validateForm()) {
                        setOpenDialog(true);
                      }
                    }}
                    disabled={
                      creatingWill ||
                      !formData.beneficiary ||
                      !formData.assets ||
                      !formData.amount
                    }
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 transition-colors"
                  >
                    {creatingWill ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {waitingForSignature
                          ? "Waiting for signature..."
                          : "Creating Will..."}
                      </>
                    ) : (
                      "Create Will"
                    )}
                  </Button>
                </DialogTrigger>

                {/* Confirmation Dialog */}
                <DialogContent className="bg-gray-900 border border-white/20 text-white max-w-md">
                  <DialogTitle>Confirm Will Creation</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Please review and confirm the following before creating your
                    will:
                  </DialogDescription>

                  <div className="space-y-4 py-4">
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={confirmationChecks.termsAccepted}
                          onCheckedChange={() =>
                            handleCheckboxChange("termsAccepted")
                          }
                        />
                        <label className="text-sm">
                          I understand this will is immutable once created
                        </label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={confirmationChecks.understandInactivity}
                          onCheckedChange={() =>
                            handleCheckboxChange("understandInactivity")
                          }
                        />
                        <label className="text-sm">
                          I understand the beneficiary can claim after{" "}
                          {formData.claimWaitTime === "31536000"
                            ? "1 year"
                            : formData.claimWaitTime === "2592000"
                              ? "1 month"
                              : formData.claimWaitTime === "7776000"
                                ? "3 months"
                                : formData.claimWaitTime === "15552000"
                                  ? "6 months"
                                  : "2 years"}{" "}
                          of inactivity
                        </label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={confirmationChecks.confirmBeneficiary}
                          onCheckedChange={() =>
                            handleCheckboxChange("confirmBeneficiary")
                          }
                        />
                        <label className="text-sm">
                          I have verified the beneficiary address is correct
                        </label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={confirmationChecks.understandFees}
                          onCheckedChange={() =>
                            handleCheckboxChange("understandFees")
                          }
                        />
                        <label className="text-sm">
                          I understand network fees will apply for this
                          transaction
                        </label>
                      </div>

                      <div className="flex items-start space-x-3">
                        <Checkbox
                          checked={confirmationChecks.createBackup}
                          onCheckedChange={() =>
                            handleCheckboxChange("createBackup")
                          }
                        />
                        <label className="text-sm">
                          I will save the beneficiary address and will details
                          securely
                        </label>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="border-t border-white/20 pt-4 space-y-2">
                      <h4 className="font-medium">Will Summary:</h4>
                      <div className="text-sm text-gray-400 space-y-1">
                        <p>
                          Amount: {formatBNB(formData.amount)} (
                          {formatUSD(amountUSD)})
                        </p>
                        <p>
                          Beneficiary: {formData.beneficiary.slice(0, 10)}...
                        </p>
                        <p>
                          Wait Time:{" "}
                          {formData.claimWaitTime === "31536000"
                            ? "1 year"
                            : formData.claimWaitTime === "2592000"
                              ? "1 month"
                              : formData.claimWaitTime === "7776000"
                                ? "3 months"
                                : formData.claimWaitTime === "15552000"
                                  ? "6 months"
                                  : "2 years"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setOpenDialog(false)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateWill}
                      disabled={
                        !Object.values(confirmationChecks).every(
                          (checked) => checked,
                        ) || creatingWill
                      }
                      className="bg-amber-500 hover:bg-amber-600 text-black"
                    >
                      {creatingWill ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Will"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Transaction Hash Display */}
              {transactionHash && (
                <Alert className="bg-blue-900/20 border-blue-500/50">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>Transaction submitted!</p>
                      <p className="text-sm font-mono break-all">
                        {transactionHash}
                      </p>
                      <p className="text-xs">
                        Your will is being created on the blockchain...
                      </p>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Info Section */}
          <div className="space-y-6">
            {/* BNB Price Info */}
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                  Current BNB Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-2">
                  ${bnbPrice ? bnbPrice.toFixed(2) : "Loading..."}
                </div>
                <p className="text-sm text-gray-400">
                  Live price used for USD calculations
                </p>
              </CardContent>
            </Card>

            {/* How it Works */}
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-400" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      1
                    </div>
                    <p>
                      Lock your BNB in a secure smart contract with your chosen
                      beneficiary
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      2
                    </div>
                    <p>
                      Stay active by pinging the contract or making transactions
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-amber-500 text-black rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      3
                    </div>
                    <p>
                      If inactive for the set period, your beneficiary can claim
                      the assets
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Features */}
            <Card className="bg-black/40 backdrop-blur-md border-white/20 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Security Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Immutable once created</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Blockchain verified transactions</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Time-locked security</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>1-year withdrawal cooldown</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
