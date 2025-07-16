import { NextResponse } from "next/server";
import { ethers } from "ethers";

// Mock activity data for now - in production this would query blockchain events
const generateMockActivity = (address: string) => {
  const activities = [
    {
      id: "1",
      type: "Will Creation",
      description: "Simple will created",
      amount: "0.5",
      hash: "0x1234...5678",
      timestamp: Date.now() - 86400000, // 1 day ago
      status: "Completed",
    },
    {
      id: "2",
      type: "Asset Distribution",
      description: "Beneficiary added",
      amount: "2.0",
      hash: "0xabcd...efgh",
      timestamp: Date.now() - 172800000, // 2 days ago
      status: "Completed",
    },
    {
      id: "3",
      type: "Smart Contract Update",
      description: "Will terms updated",
      amount: "0.1",
      hash: "0x9876...5432",
      timestamp: Date.now() - 259200000, // 3 days ago
      status: "Completed",
    },
    {
      id: "4",
      type: "Legacy Verification",
      description: "Identity verified",
      amount: "0.05",
      hash: "0xfedc...ba98",
      timestamp: Date.now() - 345600000, // 4 days ago
      status: "Completed",
    },
  ];

  return activities;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 },
      );
    }

    // Validate address format
    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 },
      );
    }

    // Generate mock activity for now
    const activities = generateMockActivity(address);

    return NextResponse.json({
      address,
      activities,
      total: activities.length,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Error fetching dashboard activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity data" },
      { status: 500 },
    );
  }
}
