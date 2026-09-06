import { useEffect, useRef, useState } from "react";
import { fetchWorkspace, mergeWorkspaces, normalizeWorkspace, uploadNamespace, uploadWorkspace } from "../lib/cloudData";
import {
  captureWorkspace,
  hasMeaningfulGuestData,
  hydrateWorkspace,
  LOCAL_DATA_EVENT,
  readLocalValue,
  STORAGE_KEYS,
} from "../lib/localData";
import { useAuth } from "./authState";
import { DataSyncContext } from "./dataSyncState";
const OWNER_KEY = "studyBuddy:localWorkspaceOwner";
const GUEST_SNAPSHOT_KEY = "studyBuddy:guestWorkspace";
const EMPTY_STATS = {
  date: null,
  focusMinutesToday: 0,
  pomodorosToday: 0,
  tasksDoneToday: 0,
  lastActiveDate: null,
  streak: 0,
  bestStreak: 0,
  totalFocusMinutes: 0,
  totalPomodoros: 0,
  totalTasksDone: 0,
  updatedAt: null,
};

function readGuestSnapshot() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_SNAPSHOT_KEY)) || null;
  } catch {
    return null;
  }
}

function saveGuestSnapshot(workspace) {
  try {
    localStorage.setItem(GUEST_SNAPSHOT_KEY, JSON.stringify(workspace));
  } catch {
    // The current workspace remains intact if browser storage is unavailable.
  }
}

export function DataSyncProvider({ children }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [status, setStatus] = useState("local");
  const [error, setError] = useState("");
  const previousUserId = useRef(null);
  const activeUserId = useRef(null);
  const isHydrating = useRef(false);
  const timers = useRef(new Map());

  useEffect(() => {
    if (isAuthLoading) return undefined;
    let cancelled = false;

    async function prepareWorkspace() {
      const nextUserId = user?.id || null;
      const priorUserId = previousUserId.current;

      if (!nextUserId) {
        const storedOwner = localStorage.getItem(OWNER_KEY);
        activeUserId.current = null;
        setStatus("local");
        if (priorUserId || storedOwner) {
          const guest = readGuestSnapshot();
          if (guest) hydrateWorkspace(guest);
          localStorage.removeItem(OWNER_KEY);
        }
        previousUserId.current = null;
        return;
      }

      previousUserId.current = nextUserId;
      const owner = localStorage.getItem(OWNER_KEY);
      const current = captureWorkspace();
      const shouldMergeLocalData = !owner && hasMeaningfulGuestData();
      if (!owner) saveGuestSnapshot(current);

      setStatus("syncing");
      setError("");
      try {
        let cloud;
        let next;

        if (shouldMergeLocalData) {
          const local = normalizeWorkspace(current);
          await uploadWorkspace(local, nextUserId);
          cloud = await fetchWorkspace(nextUserId);
          next = mergeWorkspaces(local, cloud);
        } else {
          cloud = await fetchWorkspace(nextUserId);
          next = owner === nextUserId ? mergeWorkspaces(current, cloud) : cloud;
        }

        if (cancelled) return;
        isHydrating.current = true;
        hydrateWorkspace({
          todos: next.todos || [],
          notes: next.notes || [],
          flashcards: next.flashcards || [],
          stats: next.stats || EMPTY_STATS,
          theme: next.theme || "cream",
        });
        isHydrating.current = false;
        localStorage.setItem(OWNER_KEY, nextUserId);
        activeUserId.current = nextUserId;
        setStatus("synced");
      } catch (syncError) {
        if (cancelled) return;
        activeUserId.current = nextUserId;
        setError(syncError.message || "Could not reach cloud storage.");
        setStatus("error");
      }
    }

    prepareWorkspace();
    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, user?.id]);

  useEffect(() => {
    function handleLocalChange(event) {
      const namespace = event.detail?.namespace;
      const userId = activeUserId.current;
      if (!namespace || !userId || isHydrating.current) return;

      window.clearTimeout(timers.current.get(namespace));
      timers.current.set(
        namespace,
        window.setTimeout(async () => {
          setStatus("syncing");
          setError("");
          try {
            const key = STORAGE_KEYS[namespace];
            const value = readLocalValue(
              key,
              namespace === "theme" ? "cream" : namespace === "stats" ? {} : [],
            );
            await uploadNamespace(namespace, value, userId);
            setStatus("synced");
          } catch (syncError) {
            setError(syncError.message || "Changes are safe on this device. Edit again after reconnecting to retry.");
            setStatus("error");
          }
        },
        650,
      ));
    }

    window.addEventListener(LOCAL_DATA_EVENT, handleLocalChange);
    const scheduledTimers = timers.current;
    return () => {
      window.removeEventListener(LOCAL_DATA_EVENT, handleLocalChange);
      scheduledTimers.forEach((timer) => window.clearTimeout(timer));
      scheduledTimers.clear();
    };
  }, []);

  return (
    <DataSyncContext.Provider value={{ status, error }}>
      {children}
    </DataSyncContext.Provider>
  );
}
