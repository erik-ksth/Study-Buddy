import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("theme") || "cream";
    } catch {
      return "cream";
    }
  });

  // Redundant with the early inline script in index.html on first paint, but
  // keeps <html data-theme> in sync as the user switches themes afterward.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  function setTheme(next) {
    setThemeState(next);
    try {
      localStorage.setItem("theme", next);
    } catch {
      // ignore — theme just won't persist across reloads
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
