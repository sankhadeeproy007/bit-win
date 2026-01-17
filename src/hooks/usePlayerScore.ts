import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

export const usePlayerScore = (userId: string | null) => {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setScore(null);
      setLoading(false);
      setError(null);
      return;
    }

    const client = generateClient<Schema>();

    const fetchScore = async () => {
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
    };

    fetchScore();
  }, [userId]);

  return { score, loading, error };
};
