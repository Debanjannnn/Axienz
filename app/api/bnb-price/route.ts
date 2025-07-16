import { NextResponse } from "next/server";

let priceCache: { price: number; timestamp: number } | null = null;
const CACHE_DURATION = 60000; // 1 minute cache

export async function GET() {
  try {
    // Check if we have valid cached data
    if (priceCache && Date.now() - priceCache.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        price: priceCache.price,
        cached: true,
        timestamp: priceCache.timestamp,
      });
    }

    // Fetch fresh data from CoinGecko
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=binancecoin&vs_currencies=usd",
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const price = data.binancecoin?.usd;

    if (!price) {
      throw new Error("Invalid price data received");
    }

    // Update cache
    priceCache = {
      price,
      timestamp: Date.now(),
    };

    return NextResponse.json({
      price,
      cached: false,
      timestamp: priceCache.timestamp,
    });
  } catch (error) {
    console.error("Error fetching BNB price:", error);

    // Return cached data if available, even if expired
    if (priceCache) {
      return NextResponse.json({
        price: priceCache.price,
        cached: true,
        error: "Failed to fetch fresh data, returning cached price",
        timestamp: priceCache.timestamp,
      });
    }

    return NextResponse.json(
      { error: "Failed to fetch BNB price" },
      { status: 500 },
    );
  }
}
