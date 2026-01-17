import { useState, useEffect, useMemo } from "react";

const BITCOIN_API_URL = "https://api.coinbase.com/v2/prices/BTC-USD/spot";

const PRICE_UPDATE_INTERVAL = 5000;

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

const fetchBitcoinPrice = async (): Promise<number> => {
  const response = await fetch(BITCOIN_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Bitcoin price: ${response.statusText}`);
  }
  const data = await response.json();
  return parseFloat(data.data.amount);
};

export const useBitcoinPrice = () => {
  const [price, setPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formattedPrice = useMemo(() => {
    return price !== null ? formatPrice(price) : null;
  }, [price]);

  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout | null = null;

    const updatePrice = async () => {
      try {
        const newPrice = await fetchBitcoinPrice();
        if (!isMounted) return;
        setPrice(newPrice);
        setLoading(false);
        setError(null);
      } catch {
        if (!isMounted) return;
        setError("Failed to fetch Bitcoin price");
        setLoading(false);
      }
    };

    // Fetch immediately
    updatePrice();

    // Then fetch every 5 seconds
    intervalId = setInterval(updatePrice, PRICE_UPDATE_INTERVAL);

    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, []);

  return { price: formattedPrice, loading, error };
};
