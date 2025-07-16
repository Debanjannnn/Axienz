// USD Conversion utility

let bnbPriceCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// Get BNB price in USD
export async function getBNBPrice() {
  // Check if we have a valid cached price
  if (
    bnbPriceCache &&
    cacheTimestamp &&
    Date.now() - cacheTimestamp < CACHE_DURATION
  ) {
    return bnbPriceCache;
  }

  try {
    const response = await fetch("/api/bnb-price");
    const data = await response.json();

    if (data.price) {
      bnbPriceCache = data.price;
      cacheTimestamp = Date.now();
      return data.price;
    }

    // Fallback price if API fails
    return 635.5;
  } catch (error) {
    console.error("Error fetching BNB price:", error);
    // Return fallback price
    return 635.5;
  }
}

// Convert BNB amount to USD
export async function convertBNBToUSD(bnbAmount) {
  try {
    const price = await getBNBPrice();
    const usdValue = parseFloat(bnbAmount) * price;
    return usdValue;
  } catch (error) {
    console.error("Error converting BNB to USD:", error);
    return 0;
  }
}

// Format USD amount with proper currency formatting
export function formatUSD(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Format BNB amount with proper decimal places
export function formatBNB(amount) {
  const numAmount = parseFloat(amount);
  if (numAmount === 0) return "0 BNB";
  if (numAmount < 0.001) {
    return `${numAmount.toFixed(8)} BNB`;
  }
  return `${numAmount.toFixed(4)} BNB`;
}

// Get dual display (BNB + USD)
export async function getDualDisplay(bnbAmount) {
  const usdAmount = await convertBNBToUSD(bnbAmount);
  return {
    bnb: formatBNB(bnbAmount),
    usd: formatUSD(usdAmount),
    bnbValue: parseFloat(bnbAmount),
    usdValue: usdAmount,
  };
}
