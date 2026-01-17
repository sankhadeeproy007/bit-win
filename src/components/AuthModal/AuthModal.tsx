import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useAuthForm } from "@/hooks/useAuthForm";
import "./AuthModal.css";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AuthModal = ({ open, onClose, onSuccess }: AuthModalProps) => {
  const {
    isSignIn,
    formData,
    error,
    loading,
    setFormData,
    handleSubmit,
    switchToSignUp,
    switchToSignIn,
  } = useAuthForm({ onSuccess, onClose });

  const submitButtonDisabled =
    loading ||
    !formData.password ||
    !formData.email ||
    (!isSignIn && !formData.confirmPassword);

  const authSwitchText = isSignIn ? "New user? " : "Already have an account? ";
  const authSwitchLinkText = isSignIn ? "Sign up" : "Sign in";
  const authSwitchLinkOnClick = isSignIn ? switchToSignUp : switchToSignIn;
  const submitButtonText = isSignIn ? "Sign In" : "Sign Up";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle className="authModalTitle">Welcome to BitWin!</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" className="authError">
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} className="authForm">
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData("email", e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          <TextField
            label="Password"
            placeholder="Minimum 6 characters"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData("password", e.target.value)}
            fullWidth
            required
            margin="normal"
          />
          {!isSignIn && (
            <TextField
              label="Confirm Password"
              placeholder="Minimum 6 characters"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData("confirmPassword", e.target.value)}
              fullWidth
              required
              margin="normal"
            />
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={submitButtonDisabled}
            className="authButton"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              submitButtonText
            )}
          </Button>
          <Typography variant="body2" className="authSwitchText">
            <>
              {authSwitchText}
              <span className="authSwitchLink" onClick={authSwitchLinkOnClick}>
                {authSwitchLinkText}
              </span>
            </>
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
