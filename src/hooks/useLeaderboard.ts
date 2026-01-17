import { useState, useEffect, useCallback } from "react";
import { getLeaderboard, LeaderboardEntry } from "../api/leaderboard";

interface UseLeaderboardOptions {
  enabled?: boolean;
  limit?: number;
}

interface UseLeaderboardResult {
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useLeaderboard = ({
  enabled = true,
  limit = 10,
}: UseLeaderboardOptions = {}): UseLeaderboardResult => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getLeaderboard(limit);
      setLeaderboard(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load leaderboard"
      );
    } finally {
      setLoading(false);
    }
  }, [enabled, limit]);

  useEffect(() => {
    if (enabled) {
      fetchLeaderboard();
    }
  }, [enabled, fetchLeaderboard]);

  return {
    leaderboard,
    loading,
    error,
    refetch: fetchLeaderboard,
  };
};
