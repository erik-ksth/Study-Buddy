import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./authState";
import { HYDRATE_DATA_EVENT, writeLocalValue } from "../lib/localData";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { user } = useAuth();
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem("theme") || "cream";
      return saved === "sakura" ? "cream" : saved;
    } catch {
      return "cream";
    }
  });

  // Redundant with the early inline script in index.html on first paint, but
  // keeps <html data-theme> in sync as the user switches themes afterward.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    if (!user && theme === "sakura") setThemeState("cream");
  }, [theme, user]);

  useEffect(() => {
    function handleHydration(event) {
      if (event.detail?.namespace !== "theme") return;
      const nextTheme = event.detail.value;
      setThemeState(!user && nextTheme === "sakura" ? "cream" : nextTheme);
    }

    window.addEventListener(HYDRATE_DATA_EVENT, handleHydration);
    return () => window.removeEventListener(HYDRATE_DATA_EVENT, handleHydration);
  }, [user]);

  function setTheme(next) {
    if (!user && next === "sakura") return;
    setThemeState(next);
    writeLocalValue("theme", next);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
}
