"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../utils";
import CONTRACT_ABI from "@/abi";

const SmartWillContext = createContext();

// BNB Chain Testnet Configuration
const BNB_CHAIN_CONFIG = {
  chainId: "0x61", // 656476 in hex
  chainName: "BNB Smart Chain Testnet",
  nativeCurrency: {
    name: "Test BNB",
    symbol: "tBNB",
    decimals: 18,
  },
  rpcUrls: ["https://bsc-testnet-rpc.publicnode.com"],
  blockExplorerUrls: ["https://testnet.bscscan.com/"],
};

export function SmartWillProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chainId, setChainId] = useState(null);

  // Listen for chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", (newChainId) => {
        setChainId(newChainId);
        // Refresh the page when chain changes to prevent any state inconsistencies
        window.location.reload();
      });
    }
  }, []);

  // Switch to BNB Chain Testnet
  async function switchToEDUChain() {
    if (!window.ethereum) return false;

    try {
      // Try to switch to the BNB Chain
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: BNB_CHAIN_CONFIG.chainId }],
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [BNB_CHAIN_CONFIG],
          });
          return true;
        } catch (addError) {
          console.error("Error adding BNB Chain:", addError);
          setError("Failed to add BNB Chain to MetaMask. Please try again.");
          return false;
        }
      }
      console.error("Error switching to BNB Chain:", switchError);
      setError("Failed to switch to BNB Chain. Please try again.");
      return false;
    }
  }

  // Connect to MetaMask and retrieve account info
  async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
      try {
        setLoading(true);
        setError(null);

        // First, try to switch to BNB Chain
        const switched = await switchToEDUChain();
        if (!switched) {
          throw new Error("Failed to switch to BNB Chain");
        }

        const providerInstance = new ethers.BrowserProvider(window.ethereum);

        // Get accounts and chain ID
        const [accounts, network] = await Promise.all([
          providerInstance.send("eth_requestAccounts", []),
          providerInstance.getNetwork(),
        ]);

        // Verify we're on the correct network
        if (network.chainId !== BigInt(BNB_CHAIN_CONFIG.chainId)) {
          throw new Error("Please switch to BNB Chain Testnet");
        }

        const balance = await providerInstance.getBalance(accounts[0]);

        setAccount(accounts[0]);
        setBalance(ethers.formatEther(balance));
        setChainId(network.chainId.toString());
        setIsConnected(true);
      } catch (error) {
        console.error("Error connecting to wallet: ", error);
        setError(
          error.message || "Error connecting to wallet. Please try again.",
        );
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    } else {
      setError("MetaMask is required to use this app.");
      window.open("https://metamask.io/download.html", "_blank");
    }
  }

  // Create normal will
  async function createNormalWill(
    beneficiary,
    description,
    amount,
    claimWaitTime,
    onHashGenerated,
  ) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToEDUChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const value = ethers.parseEther(amount.toString());
      const tx = await contract.createNormalWill(
        beneficiary,
        description,
        claimWaitTime,
        { value },
      );

      // Call the callback with the transaction hash
      if (onHashGenerated) {
        onHashGenerated(tx.hash);
      }

      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error creating normal will:", error);
      setError(error.message || "Error creating will. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Get normal will by owner address
  async function getNormalWill(ownerAddress) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToEDUChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const will = await contract.normalWills(ownerAddress);
      return will;
    } catch (error) {
      console.error("Error fetching normal will:", error);
      setError("Error fetching will details. Please try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Check if address has created a will
  async function hasCreatedWill() {
    try {
      if (!account) return false;

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToEDUChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      return await contract.hasNormalWill(account);
    } catch (error) {
      console.error("Error checking will existence:", error);
      return false;
    }
  }

  // Ping the contract to show activity
  async function ping() {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToEDUChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const tx = await contract.ping();
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error pinging contract:", error);
      setError("Error updating activity status. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Deposit more to existing will
  async function depositNormalWill(amount) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToEDUChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await contract.deposit({ value: amountInWei });
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error depositing to will:", error);
      setError("Error making deposit. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Get wills where the connected account is a beneficiary
  async function getNormalWillsAsBeneficiary() {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToEDUChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const [owners, amounts] =
        await contract.getNormalWillAsBeneficiary(account);
      console.log("OWNERS: ", owners, " \n", "BENEFICARIES: ", amounts);
      return owners.map((owner, index) => ({
        owner,
        amount: ethers.formatEther(amounts[index]),
      }));
    } catch (error) {
      console.error("Error fetching beneficiary wills:", error);
      setError("Error fetching will details. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  }

  // Get milestone wills where the connected account is a beneficiary
  async function getMilestoneWillsAsBeneficiary() {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToEDUChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const [owners, willIndexes, releaseIndexes, releaseAmounts] =
        await contract.getMilestoneWillsAsBeneficiary(account);

      return owners.map((owner, index) => ({
        owner,
        willIndex: willIndexes[index],
        releaseIndex: releaseIndexes[index],
        amount: ethers.formatEther(releaseAmounts[index]),
      }));
    } catch (error) {
      console.error("Error fetching milestone wills:", error);
      setError("Error fetching milestone will details. Please try again.");
      return [];
    } finally {
      setLoading(false);
    }
  }

  // Claim a normal will as a beneficiary
  async function claimNormalWill(ownerAddress) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToEDUChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const tx = await contract.claimNormalWill(ownerAddress);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error claiming will:", error);
      setError(error.message || "Error claiming will. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Claim a milestone will as a beneficiary
  async function claimMilestoneWill(ownerAddress, willIndex, releaseIndex) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToEDUChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const tx = await contract.claimMilestoneWill(
        ownerAddress,
        willIndex,
        releaseIndex,
      );
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error claiming milestone will:", error);
      setError(
        error.message || "Error claiming milestone will. Please try again.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Get user activity
  async function getUserActivity(userAddress, offset = 0, limit = 10) {
    try {
      const targetAddress = userAddress || account;
      if (!targetAddress) {
        throw new Error("No address provided");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider,
      );

      const result = await contract.getUserActivity(
        targetAddress,
        offset,
        limit,
      );

      return {
        activities: result[0].map((activity) => ({
          timestamp: Number(activity.timestamp),
          activityType: activity.activityType,
          amount: activity.amount.toString(),
          relatedAddress: activity.relatedAddress,
          description: activity.description,
        })),
        totalActivities: Number(result[1]),
        lastActivityTime: Number(result[2]),
        hasMore: result[3],
      };
    } catch (error) {
      console.error("Error fetching user activity:", error);
      return {
        activities: [],
        totalActivities: 0,
        lastActivityTime: 0,
        hasMore: false,
      };
    }
  }

  // Get user activity summary
  async function getUserActivitySummary(userAddress) {
    try {
      const targetAddress = userAddress || account;
      if (!targetAddress) {
        throw new Error("No address provided");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider,
      );

      const result = await contract.getUserActivitySummary(targetAddress);

      return {
        totalActivities: Number(result[0]),
        lastActivityTime: Number(result[1]),
        hasActivity: result[2],
        lastActivityType: result[3],
      };
    } catch (error) {
      console.error("Error fetching activity summary:", error);
      return {
        totalActivities: 0,
        lastActivityTime: 0,
        hasActivity: false,
        lastActivityType: "",
      };
    }
  }

  // Get activities by type
  async function getUserActivitiesByType(activityType, userAddress) {
    try {
      const targetAddress = userAddress || account;
      if (!targetAddress) {
        throw new Error("No address provided");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider,
      );

      const activities = await contract.getUserActivitiesByType(
        targetAddress,
        activityType,
      );

      return activities.map((activity) => ({
        timestamp: Number(activity.timestamp),
        activityType: activity.activityType,
        amount: activity.amount.toString(),
        relatedAddress: activity.relatedAddress,
        description: activity.description,
      }));
    } catch (error) {
      console.error("Error fetching activities by type:", error);
      return [];
    }
  }

  // Get contract balance
  async function getContractBalance() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider,
      );

      const balance = await contract.getBalance();
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error fetching contract balance:", error);
      return "0";
    }
  }

  // Withdraw from normal will (1 year cooldown)
  async function withdrawNormalWill(amount) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToEDUChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await contract.withdraw(amountInWei);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error withdrawing from will:", error);
      setError(
        error.message || "Error withdrawing from will. Please try again.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  const value = {
    account,
    balance,
    isConnected,
    loading,
    error,
    chainId,
    connectWallet,
    createNormalWill,
    getNormalWill,
    hasCreatedWill,
    ping,
    depositNormalWill,
    withdrawNormalWill,
    switchToEDUChain,
    getNormalWillsAsBeneficiary,
    getMilestoneWillsAsBeneficiary,
    claimNormalWill,
    claimMilestoneWill,
    getUserActivity,
    getUserActivitySummary,
    getUserActivitiesByType,
    getContractBalance,
  };

  return (
    <SmartWillContext.Provider value={value}>
      {children}
    </SmartWillContext.Provider>
  );
}

export function useSmartWill() {
  const context = useContext(SmartWillContext);
  if (!context) {
    throw new Error("useSmartWill must be used within a SmartWillProvider");
  }
  return context;
}
