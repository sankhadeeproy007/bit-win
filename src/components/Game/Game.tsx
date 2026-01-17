import { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Snackbar,
} from "@mui/material";
import { useBitcoinPrice } from "@/hooks/useBitcoinPrice";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { usePlayerScore } from "@/hooks/usePlayerScore";
import { useGuess } from "@/hooks/useGuess";
import { DirectionGuessDialog } from "../DirectionGuessDialog/DirectionGuessDialog";
import logo from "@/assets/logo.png";
import "./Game.css";

const Game = () => {
  const { price, loading, error } = useBitcoinPrice();
  const { isAuthenticated, user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const {
    score,
    loading: scoreLoading,
    error: scoreError,
  } = usePlayerScore(user?.userId ?? null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const {
    directionDialogOpen,
    setDirectionDialogOpen,
    timer,
    handleDirectionSelect,
    placingGuess,
  } = useGuess({
    userId: user?.userId ?? null,
    onSuccess: ({ direction, priceAtGuess }) => {
      setSnackbarMessage(
        `Guess placed! Direction: ${direction.toUpperCase()}, Price: $${priceAtGuess.toFixed(2)}. Time left: 60 seconds.`
      );
      setSnackbarOpen(true);
    },
    onError: (error) => {
      setSnackbarMessage(`Failed to place guess: ${error}`);
      setSnackbarOpen(true);
    },
  });

  const handlePlaceGuess = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setDirectionDialogOpen(true);
  };

  return (
    <Container maxWidth="md">
      <Box className="homePageContainer">
        <img src={logo} alt="BitWin Logo" className="bitwinLogo" />

        <PriceCard
          price={price}
          loading={loading}
          error={error}
          onPlaceGuess={handlePlaceGuess}
          timer={timer}
          disabled={placingGuess || timer !== null}
        />

        {isAuthenticated && (
          <ScoreCard score={score} loading={scoreLoading} error={scoreError} />
        )}
      </Box>

      <DirectionGuessDialog
        open={directionDialogOpen}
        onClose={() => setDirectionDialogOpen(false)}
        onDirectionSelect={handleDirectionSelect}
        loading={placingGuess}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Container>
  );
};

interface PriceCardProps {
  price: string | null;
  loading: boolean;
  error: string | null;
  onPlaceGuess: () => void;
  timer: number | null;
  disabled: boolean;
}

const PriceCard = ({
  price,
  loading,
  error,
  onPlaceGuess,
  timer,
  disabled,
}: PriceCardProps) => {
  const getButtonText = () => {
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
        <Box className="loadingContainer">
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" className="errorAlert">
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

interface ScoreCardProps {
  score: number | null;
  loading: boolean;
  error: string | null;
}

const ScoreCard = ({ score, loading, error }: ScoreCardProps) => {
  return (
    <Paper elevation={3} className="scoreCard">
      <Typography variant="h6" color="primary" gutterBottom>
        Your Score
      </Typography>

      {loading && (
        <Box className="loadingContainer">
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Alert severity="error" className="errorAlert">
          {error}
        </Alert>
      )}

      {!loading && !error && score !== null && (
        <Typography variant="h3" color="primary" className="scoreDisplay">
          {score}
        </Typography>
      )}
    </Paper>
  );
};

export default Game;
