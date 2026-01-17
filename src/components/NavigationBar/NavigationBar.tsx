import { AppBar, Toolbar, Typography, Button, Box } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import "./NavigationBar.css";
import textLogo from "@/assets/text.png";

const NavigationBar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { openAuthModal } = useAuthModal();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <AppBar position="static" className="navBar">
      <Toolbar className="navToolbar">
        <img src={textLogo} alt="BitWin Logo" className="navLogo" />
        <Box className="navActions">
          {isAuthenticated ? (
            <>
              <Typography variant="body1" className="navUsername">
                {user?.email || "User"}
              </Typography>
              <Button
                color="inherit"
                onClick={handleLogout}
                className="navButton"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button
              color="inherit"
              onClick={openAuthModal}
              className="navButton"
            >
              Sign In / Sign Up
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
