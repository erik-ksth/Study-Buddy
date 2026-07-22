import { useCallback, useEffect, useState } from "react";

// Re-rolls once (not looped) if the pick matches what's excluded, so refreshing
// rarely repeats without any unbounded-loop risk on a small pool.
function pickRandom(pool, exclude) {
  if (pool.length === 0) return null;
  const first = pool[Math.floor(Math.random() * pool.length)];
  if (pool.length <= 1 || first !== exclude) return first;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function useQuotes() {
  const [quotes, setQuotes] = useState([]);
  const [current, setCurrent] = useState(null);
  const [status, setStatus] = useState("loading");

  const refreshQuote = useCallback(() => {
    setCurrent((prev) => pickRandom(quotes, prev));
  }, [quotes]);

  const loadQuotes = useCallback(async (signal) => {
    setStatus("loading");

    try {
      const res = await fetch("/api/quotes", { signal });
      if (!res.ok) throw new Error(`status ${res.status}`);

      const data = await res.json();
      if (!Array.isArray(data.quotes) || data.quotes.length === 0) {
        throw new Error("empty quote response");
      }

      setQuotes(data.quotes);
      setCurrent((prev) => pickRandom(data.quotes, prev));
      setStatus("ready");
    } catch (err) {
      if (err.name === "AbortError") return;
      console.warn("Quote API unavailable:", err);
      setCurrent(null);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadQuotes(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadQuotes]);

  const retryQuotes = useCallback(() => loadQuotes(), [loadQuotes]);

  return { current, refreshQuote, retryQuotes, status };
}
