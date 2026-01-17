import { useState } from "react";
// import type { Schema } from "../../amplify/data/resource";
// import { generateClient } from "aws-amplify/api";

export const usePlaceGuess = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // const client = generateClient<Schema>();

  const placeGuess = async () // userId: string,
  // guess: "up" | "down"
  : Promise<void> => {
    setLoading(true);
    setError(null);

    // try {
    //   const response = await client.mutations.placeGuess({
    //     userId,
    //     guess,
    //   });
    //   console.log("response", response);
    //   return response.data as Schema["PlaceGuessResponse"];
    // } catch (error) {
    //   console.error("Error in placeGuess:", error);
    //   setError("Failed to place guess");
    //   return null;
    // } finally {
    //   setLoading(false);
    // }
  };

  return { placeGuess, loading, error };
};
