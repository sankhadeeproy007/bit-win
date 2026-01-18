import type { AppSyncResolverHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/resolve-guess";
import type { Schema } from "../../data/resource";

const BITCOIN_API_URL = "https://api.coinbase.com/v2/prices/BTC-USD/spot";
const GUESS_DURATION_MS = 60 * 1000; // 60 seconds

// Configure Amplify for server-side usage
const { resourceConfig, libraryOptions } =
  await getAmplifyDataClientConfig(env);
Amplify.configure(resourceConfig, libraryOptions);

const client = generateClient<Schema>();

const fetchBitcoinPrice = async (): Promise<number> => {
  const response = await fetch(BITCOIN_API_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch Bitcoin price: ${response.statusText}`);
  }
  const data = await response.json();
  return parseFloat(data.data.amount);
};

type ResolveGuessArguments = {
  playerId: string;
};

type ResolveGuessResult = {
  resolved: boolean;
  isCorrect: boolean | null;
  timerRestarted: boolean;
};

export const handler: AppSyncResolverHandler<
  ResolveGuessArguments,
  ResolveGuessResult
> = async (event) => {
  const { playerId } = event.arguments;

  // Get the player data
  const { data: playerData, errors } = await client.models.Player.get({
    id: playerId,
  });

  if (errors) {
    throw new Error("Failed to fetch player data");
  }

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

  const currentPrice = Math.round((await fetchBitcoinPrice()) * 100) / 100;

  // If price hasn't changed, restart the timer
  if (currentPrice === activeGuessData.priceAtGuess) {
    const newGuessedAt = new Date().toISOString();
    const { errors: updateErrors } = await client.models.Player.update({
      id: playerId,
      activeGuess: JSON.stringify({
        ...activeGuessData,
        guessedAt: newGuessedAt,
      }),
    });

    if (updateErrors) {
      throw new Error("Failed to restart timer");
    }

    return {
      resolved: false,
      isCorrect: null,
      timerRestarted: true,
    };
  }

  const isCorrect =
    activeGuessData.direction === "up"
      ? currentPrice > activeGuessData.priceAtGuess
      : currentPrice < activeGuessData.priceAtGuess;

  // Update the player score and clear active guess
  const { errors: updateErrors } = await client.models.Player.update({
    id: playerId,
    score: (playerData?.score ?? 0) + (isCorrect ? 1 : -1),
    activeGuess: null,
  });

  if (updateErrors) {
    throw new Error("Failed to resolve guess");
  }

  return {
    resolved: true,
    isCorrect,
    timerRestarted: false,
  };
};
