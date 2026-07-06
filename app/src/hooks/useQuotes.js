import { useCallback, useEffect, useMemo, useState } from "react";
import bundledQuotes from "../data/quotes.json";
import { useLocalStorage } from "./useLocalStorage";

const API_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

// Re-rolls once (not looped) if the pick matches what's excluded, so refreshing
// rarely repeats without any unbounded-loop risk on a small pool.
function pickRandom(pool, exclude) {
  const first = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length <= 1 || first !== exclude) return first;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function useQuotes() {
  const [apiQuotes, setApiQuotes] = useLocalStorage("apiQuotes", []);
  const [apiQuotesFetchedAt, setApiQuotesFetchedAt] = useLocalStorage(
    "apiQuotesFetchedAt",
    null,
  );

  // Bundled quotes ship with the app and are always available offline; API
  // quotes only ever add to that guaranteed baseline, never replace it.
  const pool = useMemo(() => [...bundledQuotes, ...apiQuotes], [apiQuotes]);

  const [current, setCurrent] = useState(() => pickRandom(bundledQuotes));

  const refreshQuote = useCallback(() => {
    setCurrent((prev) => pickRandom(pool, prev));
  }, [pool]);

  useEffect(() => {
    const isStale =
      !apiQuotesFetchedAt || Date.now() - apiQuotesFetchedAt > API_CACHE_TTL_MS;
    if (!isStale) return;

    let cancelled = false;
    fetch("/api/quotes")
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(`status ${res.status}`)),
      )
      .then((data) => {
        if (cancelled || !Array.isArray(data.quotes)) return;
        setApiQuotes(data.quotes);
        setApiQuotesFetchedAt(Date.now());
      })
      .catch((err) => {
        // Fail silently to the user — bundled quotes still work fully offline,
        // exactly like before this feature existed.
        console.warn("Quote API unavailable, using bundled quotes only:", err);
      });

    return () => {
      cancelled = true;
    };
    // Intentionally only re-checks staleness on mount, not on every pool change.
  }, []);

  return { current, refreshQuote };
}
