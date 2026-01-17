import {
  Paper,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import "./PriceCard.css";

interface PriceCardProps {
  price: string | null;
  loading: boolean;
  error: string | null;
  onPlaceGuess: () => void;
  timer: number | null;
  disabled: boolean;
  resolvingGuess: boolean;
}

export const PriceCard = ({
  price,
  loading,
  error,
  onPlaceGuess,
  timer,
  disabled,
  resolvingGuess,
}: PriceCardProps) => {
  const getButtonText = () => {
    if (resolvingGuess) {
      return "Resolving...";
    }
    if (timer !== null) {
      return `Wait ${timer}s`;
    }
    return "Place Guess";
  };

  return (
    <Paper elevation={3} className="priceCard">
      <Typography variant="h6" color="primary" gutterBottom>
        Current Bitcoin Price (BTC/USD)
      </Typography>

      {loading && (
        <Box className="priceCardLoading">
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" className="priceCardError">
          {error}
        </Alert>
      )}

      {price && !loading && (
        <Typography variant="h2" color="primary" className="priceDisplay">
          {price}
        </Typography>
      )}

      <Button
        variant="contained"
        size="large"
        fullWidth
        onClick={onPlaceGuess}
        disabled={loading || !!error || disabled}
      >
        {getButtonText()}
      </Button>
    </Paper>
  );
};
