import { Paper, Typography, Box, CircularProgress, Alert } from "@mui/material";
import "./ScoreCard.css";

interface ScoreCardProps {
  score: number | null;
  loading: boolean;
  error: string | null;
}

export const ScoreCard = ({ score, loading, error }: ScoreCardProps) => {
  return (
    <Paper elevation={3} className="scoreCard">
      <Typography variant="h6" color="primary" gutterBottom>
        Your Score
      </Typography>

      {loading && (
        <Box className="scoreCardLoading">
          <CircularProgress size={24} />
        </Box>
      )}

      {error && (
        <Alert severity="error" className="scoreCardError">
          {error}
        </Alert>
      )}

      {!loading && !error && score !== null && (
        <Typography variant="h3" color="primary" className="scoreDisplay">
          {score}
        </Typography>
      )}
    </Paper>
  );
};
