import type { AppSyncResolverHandler } from "aws-lambda";
import { Amplify } from "aws-amplify";
import { generateClient } from "aws-amplify/data";
import { getAmplifyDataClientConfig } from "@aws-amplify/backend/function/runtime";
import { env } from "$amplify/env/place-guess";
import type { Schema } from "../../data/resource";

const BITCOIN_API_URL = "https://api.coinbase.com/v2/prices/BTC-USD/spot";

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

type PlaceGuessArguments = {
  playerId: string;
  direction: "up" | "down";
};

type PlaceGuessResult = {
  direction: string;
  priceAtGuess: number;
  guessedAt: string;
};

export const handler: AppSyncResolverHandler<
  PlaceGuessArguments,
  PlaceGuessResult
> = async (event) => {
  const { playerId, direction } = event.arguments;

  const { data: playerData, errors } = await client.models.Player.get({
    id: playerId,
  });

  if (errors) {
    throw new Error("Failed to fetch player data");
  }

  if (!playerData) {
    throw new Error("Player not found");
  }

  if (playerData.activeGuess) {
    throw new Error("User has already placed a guess");
  }

  const priceAtGuess = Math.round((await fetchBitcoinPrice()) * 100) / 100;

  const guessedAt = new Date().toISOString();

  const { errors: updateErrors } = await client.models.Player.update({
    id: playerId,
    activeGuess: JSON.stringify({
      direction,
      priceAtGuess,
      guessedAt,
    }),
  });

  if (updateErrors) {
    throw new Error("Failed to place guess");
  }

  return {
    direction,
    priceAtGuess,
    guessedAt,
  };
};
