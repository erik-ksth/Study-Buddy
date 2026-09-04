import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { StudyStatsProvider } from "./context/StudyStatsContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <NotificationProvider>
        <StudyStatsProvider>
          <App />
        </StudyStatsProvider>
      </NotificationProvider>
    </ThemeProvider>
  </StrictMode>,
);
