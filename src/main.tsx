import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";

import "./index.css";
import App from "./App.tsx";
import { CustomThemeProvider } from "./theme";

Amplify.configure(outputs);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CustomThemeProvider>
      <App />
    </CustomThemeProvider>
  </StrictMode>
);
