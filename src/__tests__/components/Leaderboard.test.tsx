import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { Leaderboard } from "../../components/Leaderboard/Leaderboard";
import { useLeaderboard } from "../../hooks/useLeaderboard";

const mockOnSignInClick = vi.fn();
const mockRefetch = vi.fn();

vi.mock("../../hooks/useLeaderboard", () => ({
  useLeaderboard: vi.fn(),
}));

const MOCK_REAL_LEADERBOARD = [
  { id: "user-1", email: "alice@gmail.com", score: 100, rank: 1 },
  { id: "user-2", email: "bob@yahoo.com", score: 85, rank: 2 },
  { id: "user-3", email: "charlie@outlook.com", score: 70, rank: 3 },
];

describe("Leaderboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useLeaderboard).mockReturnValue({
      leaderboard: [],
      loading: false,
      error: null,
      refetch: mockRefetch,
    });
  });

  it("shows dummy data when user is not authenticated", () => {
    render(
      <Leaderboard
        isAuthenticated={false}
        onSignInClick={mockOnSignInClick}
        currentUserId={null}
      />
    );

    expect(screen.getByText("s***r@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("b***n@yahoo.com")).toBeInTheDocument();

    expect(
      screen.getByText("Sign in to view the leaderboard")
    ).toBeInTheDocument();
  });

  it("shows real leaderboard data when user is authenticated", () => {
    vi.mocked(useLeaderboard).mockReturnValue({
      leaderboard: MOCK_REAL_LEADERBOARD,
      loading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(
      <Leaderboard
        isAuthenticated={true}
        onSignInClick={mockOnSignInClick}
        currentUserId="user-1"
      />
    );

    // Should show masked real emails
    expect(screen.getByText("a***e@gmail.com")).toBeInTheDocument();
    expect(screen.getByText("b***b@yahoo.com")).toBeInTheDocument();
    expect(screen.getByText("c***e@outlook.com")).toBeInTheDocument();
  });
});
