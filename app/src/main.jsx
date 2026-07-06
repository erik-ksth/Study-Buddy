import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { StudyStatsProvider } from "./context/StudyStatsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <StudyStatsProvider>
        <App />
      </StudyStatsProvider>
    </ThemeProvider>
  </StrictMode>,
);
