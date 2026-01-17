import { useState, useEffect } from "react";
import { usePlaceGuess } from "./usePlaceGuess";

interface UseGuessOptions {
  userId: string | null;
  onSuccess?: (result: {
    direction: "up" | "down";
    priceAtGuess: number;
  }) => void;
  onError?: (error: string) => void;
}

const TIMER_DURATION = 60;

export const useGuess = ({ userId, onSuccess, onError }: UseGuessOptions) => {
  const [directionDialogOpen, setDirectionDialogOpen] = useState(false);
  const [timer, setTimer] = useState<number | null>(null);
  const {
    placeGuess,
    loading: placingGuess,
    error: placeGuessError,
  } = usePlaceGuess();

  useEffect(() => {
    if (timer === null || timer <= 0) {
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev === null || prev <= 1) {
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleDirectionSelect = async (direction: "up" | "down") => {
    setDirectionDialogOpen(false);
    if (!userId) return;

    const result = await placeGuess(userId, direction);
    console.log("result", result);
    if (result) {
      const { activeGuess } = result.type;
      setTimer(TIMER_DURATION);
      onSuccess?.({
        direction: activeGuess?.direction as "up" | "down",
        priceAtGuess: activeGuess?.priceAtGuess as number,
      });
    } else if (placeGuessError) {
      onError?.(placeGuessError);
    }
  };

  return {
    directionDialogOpen,
    setDirectionDialogOpen,
    timer,
    handleDirectionSelect,
    placingGuess,
    placeGuessError,
  };
};
