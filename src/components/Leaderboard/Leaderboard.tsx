import {
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import "./Leaderboard.css";

interface LeaderboardProps {
  isAuthenticated: boolean;
  onSignInClick: () => void;
  currentUserId?: string | null;
}

const DUMMY_LEADERBOARD = [
  { id: "1", email: "s***r@gmail.com", score: 42, rank: 1 },
  { id: "2", email: "b***n@yahoo.com", score: 38, rank: 2 },
  { id: "3", email: "c***o@outlook.com", score: 35, rank: 3 },
  { id: "4", email: "m***x@gmail.com", score: 31, rank: 4 },
  { id: "5", email: "j***e@proton.me", score: 28, rank: 5 },
  { id: "6", email: "a***n@gmail.com", score: 24, rank: 6 },
  { id: "7", email: "t***r@yahoo.com", score: 21, rank: 7 },
];
const maskEmail = (email: string): string => {
  const [localPart, domain] = email.split("@");
  if (!domain) return "***";
  const maskedLocal =
    localPart.length > 2
      ? localPart[0] + "***" + localPart[localPart.length - 1]
      : "***";
  return `${maskedLocal}@${domain}`;
};

export const Leaderboard = ({
  isAuthenticated,
  onSignInClick,
  currentUserId,
}: LeaderboardProps) => {
  const { leaderboard, loading, error, refetch } = useLeaderboard({
    enabled: isAuthenticated,
  });

  const displayData = isAuthenticated ? leaderboard : DUMMY_LEADERBOARD;

  return (
    <Paper elevation={3} className="leaderboardCard">
      <Box className="leaderboardHeader">
        <Typography variant="h6" color="primary">
          Leaderboard
        </Typography>
        {isAuthenticated && (
          <Tooltip title="Refresh leaderboard">
            <IconButton
              size="small"
              onClick={refetch}
              disabled={loading}
              className="refreshButton"
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box
        className={`leaderboardContent ${!isAuthenticated ? "blurred" : ""}`}
      >
        {loading && (
          <Box className="loadingContainer">
            <CircularProgress size={24} />
          </Box>
        )}

        {error && (
          <Alert severity="error" className="errorAlert">
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <List dense className="leaderboardList">
            {displayData.map((entry) => (
              <ListItem
                key={entry.id}
                className={`leaderboardItem ${entry.id === currentUserId ? "currentUser" : ""}`}
              >
                <Typography className="rank" color="primary">
                  #{entry.rank}
                </Typography>
                <ListItemText
                  primary={
                    isAuthenticated ? maskEmail(entry.email) : entry.email
                  }
                  className="playerEmail"
                />
                <Typography className="score" color="primary">
                  {entry.score}
                </Typography>
              </ListItem>
            ))}
            {displayData.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
              >
                No players yet
              </Typography>
            )}
          </List>
        )}
      </Box>

      {!isAuthenticated && (
        <Box className="signInOverlay">
          <Typography variant="body1" gutterBottom>
            Sign in to view the leaderboard
          </Typography>
          <Button variant="contained" onClick={onSignInClick}>
            Sign In
          </Button>
        </Box>
      )}
    </Paper>
  );
};
