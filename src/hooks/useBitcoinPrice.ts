import { useState, useEffect, useMemo } from "react";
import { fetchBitcoinPrice, formatPrice } from "../api/bitcoinPrice";

const PRICE_UPDATE_INTERVAL = 5000;

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

    updatePrice();

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
