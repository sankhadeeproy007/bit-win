const BITCOIN_API_URL = "https://api.coinbase.com/v2/prices/BTC-USD/spot";

export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export const fetchBitcoinPrice = async () => {
  const response = await fetch(BITCOIN_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Bitcoin price: ${response.statusText}`);
  }
  const data = await response.json();
  return parseFloat(data.data.amount);
};
