import { useState, useEffect, useCallback } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export const usePlayerScore = (userId: string | null) => {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchScore = useCallback(async () => {
    if (!userId) {
      setScore(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { data: playerData, errors } = await client.models.Player.get(
        { id: userId },
        { authMode: "apiKey" }
      );

      if (errors) {
        setError("Failed to fetch player score");
        setScore(null);
      } else if (playerData) {
        setScore(playerData.score ?? 0);
      } else {
        setScore(0);
      }
    } catch {
      setError("Failed to fetch player score");
      setScore(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchScore();
  }, [fetchScore]);

  return { score, loading, error, refetchScore: fetchScore };
};
