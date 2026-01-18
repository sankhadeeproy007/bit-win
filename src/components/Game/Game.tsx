import { useState, ReactNode, useCallback } from "react";
import {
  Container,
  Box,
  Snackbar,
  Slide,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { HelpOutline as HelpOutlineIcon } from "@mui/icons-material";
import { useBitcoinPrice } from "@/hooks/useBitcoinPrice";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { usePlayerScore } from "@/hooks/usePlayerScore";
import { useGuess } from "@/hooks/useGuess";
import { DirectionGuessDialog } from "../DirectionGuessDialog/DirectionGuessDialog";
import { Leaderboard } from "../Leaderboard/Leaderboard";
import { PriceCard } from "../PriceCard/PriceCard";
import { ScoreCard } from "../ScoreCard/ScoreCard";
import { GameTooltip } from "../GameTooltip/GameTooltip";
import logo from "@/assets/logo.png";
import "./Game.css";

const SNACKBAR_MESSAGE_DURATION = 6000;

const Game = () => {
  const theme = useTheme();
  const { price, loading, error } = useBitcoinPrice();
  const { isAuthenticated, user } = useAuth();
  const { openAuthModal } = useAuthModal();
  const {
    score,
    loading: scoreLoading,
    error: scoreError,
    refetchScore,
  } = usePlayerScore(user?.userId ?? null);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<ReactNode>("");

  const successColor = theme.palette.success.main;
  const errorColor = theme.palette.error.main;

  const handleGuessSuccess = useCallback(
    ({
      direction,
      priceAtGuess,
    }: {
      direction: "up" | "down";
      priceAtGuess: number;
    }) => {
      const isUp = direction === "up";
      setSnackbarMessage(
        <span>
          Guess placed! Price: <strong>${priceAtGuess}</strong>. Direction:{" "}
          <strong style={{ color: isUp ? successColor : errorColor }}>
            {direction.toUpperCase()}
          </strong>
        </span>
      );
      setSnackbarOpen(true);
    },
    [successColor, errorColor]
  );

  const handleGuessResolve = useCallback(
    ({ isCorrect }: { isCorrect: boolean }) => {
      refetchScore();
      setSnackbarMessage(
        isCorrect ? (
          <span>
            <strong style={{ color: successColor }}>Great guess!</strong> You
            earned a point!
          </span>
        ) : (
          <span>
            <strong style={{ color: errorColor }}>Wrong guess!</strong> You lost
            a point.
          </span>
        )
      );
      setSnackbarOpen(true);
    },
    [successColor, errorColor, refetchScore]
  );

  const handleGuessError = useCallback((error: string) => {
    setSnackbarMessage(`Failed to resolve guess: ${error}`);
    setSnackbarOpen(true);
  }, []);

  const handleTimerRestart = useCallback(() => {
    setSnackbarMessage(
      "Price hasn't changed yet. Timer restarted for another 60 seconds."
    );
    setSnackbarOpen(true);
  }, []);

  const {
    directionDialogOpen,
    setDirectionDialogOpen,
    timer,
    handleGuessSubmit,
    placingGuess,
    resolvingGuess,
  } = useGuess({
    userId: user?.userId ?? null,
    onSuccess: handleGuessSuccess,
    onResolve: handleGuessResolve,
    onTimerRestart: handleTimerRestart,
    onError: handleGuessError,
  });

  const handlePlaceGuess = () => {
    if (!isAuthenticated) {
      openAuthModal();
      return;
    }
    setDirectionDialogOpen(true);
  };

  return (
    <Container maxWidth="lg">
      <Box className="mainContent">
        <Box className="gameArea">
          <Box className="logoContainer">
            <img src={logo} alt="BitWin Logo" className="bitwinLogo" />
            <Tooltip title={<GameTooltip />} arrow placement="bottom">
              <IconButton className="helpButton" size="small">
                <HelpOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>

          <PriceCard
            price={price}
            loading={loading}
            error={error}
            onPlaceGuess={handlePlaceGuess}
            timer={timer}
            disabled={placingGuess || timer !== null || resolvingGuess}
            resolvingGuess={resolvingGuess}
          />

          {isAuthenticated && (
            <ScoreCard
              score={score}
              loading={scoreLoading}
              error={scoreError}
            />
          )}
        </Box>

        <Box className="leaderboardArea">
          <Leaderboard
            isAuthenticated={isAuthenticated}
            onSignInClick={openAuthModal}
            currentUserId={user?.userId}
          />
        </Box>
      </Box>

      <DirectionGuessDialog
        open={directionDialogOpen}
        onClose={() => setDirectionDialogOpen(false)}
        onDirectionSelect={handleGuessSubmit}
        loading={placingGuess}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={SNACKBAR_MESSAGE_DURATION}
        onClose={() => setSnackbarOpen(false)}
        slots={{
          transition: Slide,
        }}
        message={snackbarMessage}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      />
    </Container>
  );
};

export default Game;
