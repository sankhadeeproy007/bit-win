import { useErrorBoundary } from "react-use-error-boundary";
import { Box, Typography, Button, Paper } from "@mui/material";
import { ReactNode } from "react";
import "./ErrorBoundary.css";

interface ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  const [error, resetError] = useErrorBoundary();

  if (error) {
    return (
      <Box className="errorBoundaryContainer">
        <Paper elevation={3} className="errorBoundaryCard">
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            An unexpected error occurred
          </Typography>
          <Button variant="contained" onClick={resetError}>
            Try Again
          </Button>
        </Paper>
      </Box>
    );
  }

  return <>{children}</>;
};
