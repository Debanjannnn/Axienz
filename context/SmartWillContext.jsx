"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS } from "../utils";
import CONTRACT_ABI from "@/abi";

const SmartWillContext = createContext();

// BNB Chain Testnet Configuration
const BNB_CHAIN_CONFIG = {
  chainId: "0x61", // 97 in hex (BSC Testnet)
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
  const [balance, setBalance] = useState("0");
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

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          // User disconnected
          setAccount(null);
          setIsConnected(false);
          setBalance("0");
        } else {
          // User switched accounts
          setAccount(accounts[0]);
          updateBalance(accounts[0]);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("chainChanged");
        window.ethereum.removeAllListeners("accountsChanged");
      }
    };
  }, []);

  // Update balance
  const updateBalance = async (address) => {
    try {
      if (window.ethereum && address) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(address);
        setBalance(ethers.formatEther(balance));
      }
    } catch (error) {
      console.error("Error updating balance:", error);
    }
  };

  // Switch to BNB Chain Testnet
  async function switchToBNBChain() {
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
        const switched = await switchToBNBChain();
        if (!switched) {
          throw new Error("Failed to switch to BNB Chain");
        }

        const provider = new ethers.BrowserProvider(window.ethereum);

        // Get accounts and chain ID
        const [accounts, network] = await Promise.all([
          provider.send("eth_requestAccounts", []),
          provider.getNetwork(),
        ]);

        // Verify we're on the correct network
        if (
          network.chainId !== BigInt(parseInt(BNB_CHAIN_CONFIG.chainId, 16))
        ) {
          throw new Error("Please switch to BNB Chain Testnet");
        }

        const balance = await provider.getBalance(accounts[0]);

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

  // Create normal will - matches ABI: createNormalWill(address payable _beneficiary, string _description, uint256 _claimWaitTime)
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
        await switchToBNBChain();
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

      // Update balance after transaction
      await updateBalance(account);

      return true;
    } catch (error) {
      console.error("Error creating normal will:", error);
      setError(error.message || "Error creating will. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Get normal will by owner address - matches ABI: normalWills(address)
  async function getNormalWill(ownerAddress) {
    try {
      if (!ownerAddress) {
        throw new Error("Owner address is required");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider,
      );

      const will = await contract.normalWills(ownerAddress);
      return {
        beneficiary: will.beneficiary,
        amount: will.amount,
        lastPingTime: will.lastPingTime,
        claimWaitTime: will.claimWaitTime,
        creationTime: will.creationTime,
        description: will.description,
        isClaimed: will.isClaimed,
      };
    } catch (error) {
      console.error("Error fetching normal will:", error);
      throw new Error("Error fetching will details. Please try again.");
    }
  }

  // Check if address has created a will - matches ABI: hasNormalWill(address)
  async function hasCreatedWill(address) {
    try {
      const targetAddress = address || account;
      if (!targetAddress) return false;

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider,
      );

      return await contract.hasNormalWill(targetAddress);
    } catch (error) {
      console.error("Error checking will existence:", error);
      return false;
    }
  }

  // Ping the contract to show activity - matches ABI: ping()
  async function ping() {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToBNBChain();
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

      // Update balance after transaction
      await updateBalance(account);

      return true;
    } catch (error) {
      console.error("Error pinging contract:", error);
      setError(
        error.message || "Error updating activity status. Please try again.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Deposit more to existing will - matches ABI: deposit()
  async function depositNormalWill(amount) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToBNBChain();
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

      // Update balance after transaction
      await updateBalance(account);

      return true;
    } catch (error) {
      console.error("Error depositing to will:", error);
      setError(error.message || "Error making deposit. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Withdraw from normal will - matches ABI: withdrawNormalWill(uint256 amount)
  async function withdrawNormalWill(amount) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToBNBChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const amountInWei = ethers.parseEther(amount.toString());
      const tx = await contract.withdrawNormalWill(amountInWei);
      await tx.wait();

      // Update balance after transaction
      await updateBalance(account);

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

  // Get wills where the connected account is a beneficiary - matches ABI: getNormalWillAsBeneficiary(address)
  async function getNormalWillsAsBeneficiary(beneficiaryAddress) {
    try {
      const targetAddress = beneficiaryAddress || account;
      if (!targetAddress) {
        throw new Error("Please connect your wallet first");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider,
      );

      const [owners, amounts] =
        await contract.getNormalWillAsBeneficiary(targetAddress);
      console.log("OWNERS: ", owners, " \n", "AMOUNTS: ", amounts);

      return owners.map((owner, index) => ({
        owner,
        amount: ethers.formatEther(amounts[index]),
      }));
    } catch (error) {
      console.error("Error fetching beneficiary wills:", error);
      setError("Error fetching will details. Please try again.");
      return [];
    }
  }

  // Get milestone wills where the connected account is a beneficiary - matches ABI: getMilestoneWillsAsBeneficiary(address)
  async function getMilestoneWillsAsBeneficiary(beneficiaryAddress) {
    try {
      const targetAddress = beneficiaryAddress || account;
      if (!targetAddress) {
        throw new Error("Please connect your wallet first");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider,
      );

      const [owners, willIndexes, releaseIndexes, releaseAmounts] =
        await contract.getMilestoneWillsAsBeneficiary(targetAddress);

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
    }
  }

  // Claim a normal will as a beneficiary - matches ABI: claimNormalWill(address _owner)
  async function claimNormalWill(ownerAddress) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToBNBChain();
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

      // Update balance after transaction
      await updateBalance(account);

      return true;
    } catch (error) {
      console.error("Error claiming will:", error);
      setError(error.message || "Error claiming will. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Claim a milestone will as a beneficiary - matches ABI: claimMilestoneWill(address _owner, uint256 willIndex, uint256 releaseIndex)
  async function claimMilestoneWill(ownerAddress, willIndex, releaseIndex) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToBNBChain();
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

      // Update balance after transaction
      await updateBalance(account);

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

  // Get contract balance by reading all wills (helper function)
  async function getContractBalance() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(CONTRACT_ADDRESS);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error("Error fetching contract balance:", error);
      return "0";
    }
  }

  // Get platform fee percentage - matches ABI: platformFeePercentage()
  async function getPlatformFeePercentage() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider,
      );

      const feePercentage = await contract.platformFeePercentage();
      return Number(feePercentage);
    } catch (error) {
      console.error("Error fetching platform fee:", error);
      return 0;
    }
  }

  // Get platform wallet - matches ABI: platformWallet()
  async function getPlatformWallet() {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        provider,
      );

      return await contract.platformWallet();
    } catch (error) {
      console.error("Error fetching platform wallet:", error);
      return null;
    }
  }

  // Create milestone will - matches ABI: createMilestoneWill(address[] _beneficiaries, uint256[] _releaseTimes, uint256[] _releasePercentages, string[] _descriptions)
  async function createMilestoneWill(
    beneficiaries,
    releaseTimes,
    releasePercentages,
    descriptions,
    totalAmount,
  ) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToBNBChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const value = ethers.parseEther(totalAmount.toString());
      const tx = await contract.createMilestoneWill(
        beneficiaries,
        releaseTimes,
        releasePercentages,
        descriptions,
        { value },
      );

      await tx.wait();

      // Update balance after transaction
      await updateBalance(account);

      return true;
    } catch (error) {
      console.error("Error creating milestone will:", error);
      setError(
        error.message || "Error creating milestone will. Please try again.",
      );
      return false;
    } finally {
      setLoading(false);
    }
  }

  // Update recipient - matches ABI: updateRecipient(address newRecipient)
  async function updateRecipient(newRecipient) {
    try {
      setLoading(true);
      setError(null);

      if (!account) {
        throw new Error("Please connect your wallet first");
      }

      // Verify network before proceeding
      if (chainId !== BNB_CHAIN_CONFIG.chainId) {
        await switchToBNBChain();
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer,
      );

      const tx = await contract.updateRecipient(newRecipient);
      await tx.wait();

      return true;
    } catch (error) {
      console.error("Error updating recipient:", error);
      setError(error.message || "Error updating recipient. Please try again.");
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
    switchToBNBChain,
    getNormalWillsAsBeneficiary,
    getMilestoneWillsAsBeneficiary,
    claimNormalWill,
    claimMilestoneWill,
    getContractBalance,
    getPlatformFeePercentage,
    getPlatformWallet,
    createMilestoneWill,
    updateRecipient,
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
