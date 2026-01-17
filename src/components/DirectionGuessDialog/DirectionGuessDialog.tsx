import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface DirectionGuessDialogProps {
  open: boolean;
  onClose: () => void;
  onDirectionSelect: (direction: "up" | "down") => void;
  loading: boolean;
}

export const DirectionGuessDialog = ({
  open,
  onClose,
  onDirectionSelect,
  loading,
}: DirectionGuessDialogProps) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>So, what do you think?</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Choose your side: To the moon or to the depths of hell?
        </Typography>
      </DialogContent>
      <DialogActions sx={{ padding: "20px" }}>
        <Button
          onClick={() => onDirectionSelect("up")}
          variant="contained"
          color="success"
          disabled={loading}
        >
          Going UP
        </Button>
        <Button
          onClick={() => onDirectionSelect("down")}
          variant="contained"
          color="error"
          disabled={loading}
        >
          Going DOWN
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
