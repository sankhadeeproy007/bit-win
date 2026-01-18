import { useState, useEffect, useCallback } from "react";
import { placeGuess, getActiveGuessStatus, resolveGuess } from "../api/guess";
import { GUESS_DURATION_MS } from "../constants/game";

interface UseGuessOptions {
  userId: string | null;
  onSuccess?: (result: {
    direction: "up" | "down";
    priceAtGuess: number;
  }) => void;
  onResolve?: (result: { isCorrect: boolean }) => void;
  onTimerRestart?: () => void;
  onError?: (error: string) => void;
}

const getRemainingSeconds = (endTime: number): number => {
  return Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
};

export const useGuess = ({
  userId,
  onSuccess,
  onResolve,
  onTimerRestart,
  onError,
}: UseGuessOptions) => {
  const [directionDialogOpen, setDirectionDialogOpen] = useState(false);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [placingGuess, setPlacingGuess] = useState(false);
  const [resolvingGuess, setResolvingGuess] = useState(false);

  const handleResolveGuess = useCallback(async () => {
    if (!userId || resolvingGuess) return; // Guard against concurrent resolves
    setResolvingGuess(true);
    try {
      const result = await resolveGuess(userId);

      if (result.timerRestarted) {
        // Price didn't change, restart the timer
        setEndTime(Date.now() + GUESS_DURATION_MS);
        onTimerRestart?.();
      } else if (result.resolved && result.isCorrect !== undefined) {
        // Guess was resolved
        setEndTime(null);
        setTimer(null);
        onResolve?.({ isCorrect: result.isCorrect });
      }
    } catch (error) {
      setEndTime(null);
      setTimer(null);
      onError?.(error as string);
    } finally {
      setResolvingGuess(false);
    }
  }, [userId, onResolve, onTimerRestart, onError, resolvingGuess]);

  // Check active guess status on mount and auto-resolve if eligible
  useEffect(() => {
    if (!userId) return;
    const checkActiveGuessStatus = async () => {
      const status = await getActiveGuessStatus(userId);
      if (!status.hasActiveGuess) return;

      if (status.canBeResolved) {
        handleResolveGuess();
      } else if (status.remainingSeconds !== null) {
        setEndTime(Date.now() + status.remainingSeconds * 1000);
        setTimer(status.remainingSeconds);
      }
    };
    checkActiveGuessStatus();
  }, [userId, handleResolveGuess]);

  // Timer using real timestamps to avoid browser throttling issues
  useEffect(() => {
    if (endTime === null) return;

    const updateTimer = () => {
      const remaining = getRemainingSeconds(endTime);
      setTimer(remaining);

      if (remaining <= 0) {
        handleResolveGuess();
      }
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    // Recalculate when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateTimer();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [endTime, handleResolveGuess]);

  const handleGuessSubmit = async (direction: "up" | "down") => {
    setDirectionDialogOpen(false);
    if (!userId) return;
    setPlacingGuess(true);
    try {
      const result = await placeGuess(userId, direction);
      onSuccess?.({
        direction: result.direction,
        priceAtGuess: result.priceAtGuess,
      });
      setEndTime(Date.now() + GUESS_DURATION_MS);
    } catch (error) {
      onError?.(error as string);
    } finally {
      setPlacingGuess(false);
    }
  };

  return {
    directionDialogOpen,
    setDirectionDialogOpen,
    timer,
    handleGuessSubmit,
    placingGuess,
    resolvingGuess,
  };
};
