import { useState, useEffect } from "react";
import { placeGuess, getActiveGuessStatus, resolveGuess } from "../api/guess";
import { GUESS_DURATION_SECONDS } from "../constants/game";

interface UseGuessOptions {
  userId: string | null;
  onSuccess?: (result: {
    direction: "up" | "down";
    priceAtGuess: number;
  }) => void;
  onResolve?: (result: { isCorrect: boolean }) => void;
  onError?: (error: string) => void;
}

export const useGuess = ({
  userId,
  onSuccess,
  onResolve,
  onError,
}: UseGuessOptions) => {
  const [directionDialogOpen, setDirectionDialogOpen] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const [placingGuess, setPlacingGuess] = useState(false);
  const [canBeResolved, setCanBeResolved] = useState(false);

  // Check active guess status on mount
  useEffect(() => {
    if (!userId) return;
    const checkActiveGuessStatus = async () => {
      const status = await getActiveGuessStatus(userId);
      if (status.hasActiveGuess) {
        if (status.canBeResolved) {
          setCanBeResolved(true);
        } else if (status.remainingSeconds !== null) {
          setTimer(status.remainingSeconds);
        }
      }
    };
    checkActiveGuessStatus();
  }, [userId]);

  useEffect(() => {
    if (timer === null || timer <= 0) {
      if (timer === 0) {
        setCanBeResolved(true);
        setTimer(null);
      }
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === null || prev <= 1) {
          return 0; // Will trigger canBeResolved on next render
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

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
      setTimer(GUESS_DURATION_SECONDS);
    } catch (error) {
      onError?.(error as string);
    } finally {
      setPlacingGuess(false);
    }
  };

  const handleResolveGuess = async () => {
    if (!userId) return;
    try {
      const result = await resolveGuess(userId);
      onResolve?.(result);
    } catch (error) {
      onError?.(error as string);
    } finally {
      setCanBeResolved(false);
    }
  };

  return {
    directionDialogOpen,
    setDirectionDialogOpen,
    timer,
    handleGuessSubmit,
    placingGuess,
    handleResolveGuess,
    hasActiveGuessTobeResolved: canBeResolved,
  };
};
