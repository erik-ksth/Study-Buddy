import { useCallback, useEffect, useState } from "react";
import { HYDRATE_DATA_EVENT, signalLocalChange, STORAGE_KEYS } from "../lib/localData";

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? next(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
          const namespace = Object.entries(STORAGE_KEYS).find(([, storageKey]) => storageKey === key)?.[0];
          if (namespace) signalLocalChange(namespace);
        } catch {
          // localStorage unavailable (private browsing quota, etc.) — keep in-memory only
        }
        return resolved;
      });
    },
    [key],
  );

  useEffect(() => {
    function handleHydration(event) {
      if (event.detail?.key === key) setValue(event.detail.value);
    }

    window.addEventListener(HYDRATE_DATA_EVENT, handleHydration);
    return () => window.removeEventListener(HYDRATE_DATA_EVENT, handleHydration);
  }, [key]);

  return [value, setStoredValue];
}
