import { createTheme, ThemeProvider } from "@mui/material/styles";
import { useMemo } from "react";
import type { ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";

interface CustomThemeProviderProps {
  children: ReactNode;
}

export const CustomThemeProvider = ({ children }: CustomThemeProviderProps) => {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: "dark",
          primary: {
            main: "#f7931a", // Bitcoin orange
          },
        },
        typography: {
          fontFamily:
            '"Quicksand", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontWeightRegular: 500,
          fontWeightMedium: 600,
          fontWeightBold: 700,
        },
      }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};
