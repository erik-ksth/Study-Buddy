export const LOCAL_DATA_EVENT = "studybuddy:local-data-changed";
export const HYDRATE_DATA_EVENT = "studybuddy:hydrate-data";

export const STORAGE_KEYS = {
  todos: "todoList",
  notes: "studyBuddyNotes",
  flashcards: "studyBuddyFlashcards",
  stats: "studyStats",
  theme: "theme",
};

export function readLocalValue(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    if (key === STORAGE_KEYS.theme) return raw;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeLocalValue(namespace, value, { hydrate = false } = {}) {
  const key = STORAGE_KEYS[namespace];
  if (!key) return;

  try {
    localStorage.setItem(key, namespace === "theme" ? value : JSON.stringify(value));
  } catch {
    // Keep the current in-memory UI usable when storage is unavailable.
  }

  window.dispatchEvent(
    new CustomEvent(hydrate ? HYDRATE_DATA_EVENT : LOCAL_DATA_EVENT, {
      detail: { key, namespace, value },
    }),
  );
}

export function signalLocalChange(namespace) {
  window.dispatchEvent(new CustomEvent(LOCAL_DATA_EVENT, { detail: { namespace } }));
}

export function hasMeaningfulGuestData() {
  const todos = readLocalValue(STORAGE_KEYS.todos, []);
  const notes = readLocalValue(STORAGE_KEYS.notes, []);
  const legacyNote = readLocalValue("studyBuddyQuickNotes", "");
  const flashcards = readLocalValue(STORAGE_KEYS.flashcards, []);
  const stats = readLocalValue(STORAGE_KEYS.stats, {});

  return Boolean(
    todos?.some?.((task) => task?.text?.trim()) ||
      notes?.some?.((note) => note?.body?.trim()) ||
      (typeof legacyNote === "string" ? legacyNote.trim() : legacyNote?.body?.trim()) ||
      flashcards?.some?.((card) => card?.front?.trim() || card?.back?.trim()) ||
      Number(stats?.totalPomodoros) ||
      Number(stats?.totalTasksDone) ||
      Number(stats?.totalFocusMinutes),
  );
}

export function captureWorkspace() {
  return Object.fromEntries(
    Object.entries(STORAGE_KEYS).map(([namespace, key]) => [
      namespace,
      readLocalValue(key, namespace === "theme" ? "cream" : namespace === "stats" ? {} : []),
    ]),
  );
}

export function hydrateWorkspace(workspace) {
  Object.entries(workspace).forEach(([namespace, value]) => {
    if (namespace in STORAGE_KEYS) writeLocalValue(namespace, value, { hydrate: true });
  });
}
