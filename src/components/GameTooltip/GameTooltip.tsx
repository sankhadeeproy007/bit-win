import { Box, Typography } from "@mui/material";

export const GameTooltip = () => {
  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={600} gutterBottom>
        How to Play:
      </Typography>
      <Typography variant="body2">
        1. Click "Place Guess" to predict if Bitcoin's price will go UP or DOWN
      </Typography>
      <Typography variant="body2">
        2. Wait 60 seconds for your guess to be resolved
      </Typography>
      <Typography variant="body2">
        3. If you're right, you earn +1 point. If wrong, you lose -1 point
      </Typography>
      <Typography variant="body2">
        4. Climb the leaderboard and compete with other players!
      </Typography>
    </Box>
  );
};
