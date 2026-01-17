import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export interface LeaderboardEntry {
  id: string;
  email: string;
  score: number;
  rank: number;
}

export const getLeaderboard = async (
  limit: number = 10
): Promise<LeaderboardEntry[]> => {
  const { data: players, errors } =
    await client.models.Player.listPlayerByLeaderboardGroupAndScore(
      { leaderboardGroup: "GLOBAL" },
      {
        authMode: "apiKey",
        sortDirection: "DESC",
        limit,
      }
    );

  if (errors) {
    throw new Error("Failed to fetch leaderboard");
  }

  return (players ?? []).map(
    (
      player: { id: string; email: string | null; score: number | null },
      index: number
    ) => ({
      id: player.id,
      email: player.email ?? "Anonymous",
      score: player.score ?? 0,
      rank: index + 1,
    })
  );
};
