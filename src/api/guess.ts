import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { GUESS_DURATION_MS } from "../constants/game";

const client = generateClient<Schema>();

export const placeGuess = async (userId: string, direction: "up" | "down") => {
  const { data, errors } = await client.mutations.placeGuess(
    {
      playerId: userId,
      direction,
    },
    { authMode: "apiKey" }
  );

  if (errors || !data) {
    throw new Error(errors?.[0]?.message ?? "Failed to place guess");
  }

  return {
    direction: data.direction as "up" | "down",
    priceAtGuess: data.priceAtGuess,
    guessedAt: data.guessedAt,
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
  const { data, errors } = await client.mutations.resolveGuess(
    {
      playerId: userId,
    },
    { authMode: "apiKey" }
  );

  if (errors || !data) {
    throw new Error(errors?.[0]?.message ?? "Failed to resolve guess");
  }

  return {
    resolved: data.resolved,
    isCorrect: data.isCorrect ?? undefined,
    timerRestarted: data.timerRestarted,
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
