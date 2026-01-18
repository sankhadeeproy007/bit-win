import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { fetchBitcoinPrice } from "./bitcoinPrice";
import { GUESS_DURATION_MS } from "../constants/game";

const client = generateClient<Schema>();

export const placeGuess = async (userId: string, direction: "up" | "down") => {
  const { data: playerData, errors } = await client.models.Player.get(
    { id: userId },
    { authMode: "apiKey" }
  );

  if (errors) {
    throw new Error("Failed to fetch player data");
  }

  if (!playerData) {
    throw new Error("Player not found");
  }

  if (playerData.activeGuess) {
    throw new Error("User has already placed a guess");
  }

  const priceAtGuess = Math.round((await fetchBitcoinPrice()) * 100) / 100; // round to 2 decimal places

  const guessedAt = new Date().toISOString();

  const { errors: updateErrors } = await client.models.Player.update(
    {
      id: userId,
      activeGuess: JSON.stringify({
        direction,
        priceAtGuess,
        guessedAt,
      }),
    },
    { authMode: "apiKey" }
  );

  if (updateErrors) {
    console.log(updateErrors);
    throw new Error("Failed to place guess");
  }

  return {
    direction,
    priceAtGuess,
    guessedAt,
  };
};

export interface ResolveGuessResult {
  resolved: boolean;
  isCorrect?: boolean;
  timerRestarted?: boolean;
}

export const resolveGuess = async (
  userId: string
): Promise<ResolveGuessResult> => {
  const { data: playerData } = await client.models.Player.get(
    { id: userId },
    { authMode: "apiKey" }
  );

  const activeGuess = playerData?.activeGuess;
  if (!activeGuess) {
    throw new Error("No active guess found");
  }

  const activeGuessData = JSON.parse(activeGuess as string);

  // Check if the guess duration has passed since the guess was placed
  const timeSinceGuess =
    new Date().getTime() - new Date(activeGuessData.guessedAt).getTime();
  if (timeSinceGuess < GUESS_DURATION_MS) {
    throw new Error("Guess is not old enough to be resolved");
  }

  const currentPrice = Math.round((await fetchBitcoinPrice()) * 100) / 100; // round to 2 decimal places

  // If price hasn't changed, restart the timer
  if (currentPrice === activeGuessData.priceAtGuess) {
    const newGuessedAt = new Date().toISOString();
    const { errors: updateErrors } = await client.models.Player.update(
      {
        id: userId,
        activeGuess: JSON.stringify({
          ...activeGuessData,
          guessedAt: newGuessedAt,
        }),
      },
      { authMode: "apiKey" }
    );

    if (updateErrors) {
      console.log(updateErrors);
      throw new Error("Failed to restart timer");
    }

    return {
      resolved: false,
      timerRestarted: true,
    };
  }

  const isCorrect =
    activeGuessData.direction === "up"
      ? currentPrice > activeGuessData.priceAtGuess
      : currentPrice < activeGuessData.priceAtGuess;

  const { errors: updateErrors } = await client.models.Player.update(
    {
      id: userId,
      score: (playerData?.score ?? 0) + (isCorrect ? 1 : -1),
      activeGuess: null,
    },
    { authMode: "apiKey" }
  );

  if (updateErrors) {
    console.log(updateErrors);
    throw new Error("Failed to resolve guess");
  }

  return {
    resolved: true,
    isCorrect,
  };
};

export interface ActiveGuessStatus {
  hasActiveGuess: boolean;
  canBeResolved: boolean;
  remainingSeconds: number | null;
}

export const getActiveGuessStatus = async (
  userId: string
): Promise<ActiveGuessStatus> => {
  const { data: playerData, errors } = await client.models.Player.get(
    { id: userId },
    { authMode: "apiKey" }
  );

  if (errors || !playerData?.activeGuess) {
    return {
      hasActiveGuess: false,
      canBeResolved: false,
      remainingSeconds: null,
    };
  }

  const activeGuessData = JSON.parse(playerData.activeGuess as string);
  const guessedAtTime = new Date(activeGuessData.guessedAt).getTime();
  const timeSinceGuess = new Date().getTime() - guessedAtTime;

  if (timeSinceGuess >= GUESS_DURATION_MS) {
    return {
      hasActiveGuess: true,
      canBeResolved: true,
      remainingSeconds: null,
    };
  }

  const remainingMs = GUESS_DURATION_MS - timeSinceGuess;
  const remainingSeconds = Math.ceil(remainingMs / 1000);

  return { hasActiveGuess: true, canBeResolved: false, remainingSeconds };
};
