import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { StudyStatsProvider } from "./context/StudyStatsContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { DataSyncProvider } from "./context/DataSyncContext.jsx";
import { initAnalytics } from "./analytics.js";

initAnalytics();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <DataSyncProvider>
        <ThemeProvider>
          <NotificationProvider>
            <StudyStatsProvider>
              <App />
            </StudyStatsProvider>
          </NotificationProvider>
        </ThemeProvider>
      </DataSyncProvider>
    </AuthProvider>
  </StrictMode>,
);
