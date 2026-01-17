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
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select Direction</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Choose whether you think the Bitcoin price will go up or down:
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => onDirectionSelect("up")}
          variant="contained"
          color="success"
          disabled={loading}
        >
          UP
        </Button>
        <Button
          onClick={() => onDirectionSelect("down")}
          variant="contained"
          color="error"
          disabled={loading}
        >
          DOWN
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};
