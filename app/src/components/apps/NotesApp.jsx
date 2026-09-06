import { useEffect, useMemo, useState } from "react";
import { HYDRATE_DATA_EVENT, signalLocalChange } from "../../lib/localData";

const STORAGE_KEY = "studyBuddyNotes";
const LEGACY_STORAGE_KEY = "studyBuddyQuickNotes";

function makeNote(body = "") {
  const createdAt = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    body,
    createdAt,
    updatedAt: createdAt,
    deletedAt: null,
  };
}

function loadNotes() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (Array.isArray(saved) && saved.length) {
      return saved.map((note) => ({ ...makeNote(), ...note, id: note.id || crypto.randomUUID() }));
    }
  } catch {
    // Fall through to the legacy single-note migration.
  }

  let legacyBody = "";
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        legacyBody = typeof parsed === "string" ? parsed : parsed?.body || "";
      } catch {
        legacyBody = raw;
      }
    }
  } catch {
    // Start with an empty note if browser storage is unavailable.
  }
  return [makeNote(legacyBody)];
}

function noteTitle(note) {
  const firstLine = note.body.split("\n").find((line) => line.trim())?.trim();
  return firstLine ? firstLine.slice(0, 34) : "Untitled note";
}

function NotesApp() {
  const [notes, setNotes] = useState(loadNotes);
  const visibleNotes = useMemo(() => notes.filter((note) => !note.deletedAt), [notes]);
  const [activeId, setActiveId] = useState(() => notes.find((note) => !note.deletedAt)?.id);
  const activeNote = visibleNotes.find((note) => note.id === activeId) || visibleNotes[0];

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    signalLocalChange("notes");
  }, [notes]);

  useEffect(() => {
    function handleHydration(event) {
      if (event.detail?.namespace !== "notes") return;
      const storedNotes = event.detail.value || [];
      const nextNotes = storedNotes.some((note) => !note.deletedAt)
        ? storedNotes
        : [...storedNotes, makeNote()];
      setNotes(nextNotes);
      setActiveId(nextNotes.find((note) => !note.deletedAt)?.id);
    }
    window.addEventListener(HYDRATE_DATA_EVENT, handleHydration);
    return () => window.removeEventListener(HYDRATE_DATA_EVENT, handleHydration);
  }, []);

  const wordCount = useMemo(() => {
    const words = activeNote?.body.trim().match(/\S+/g);
    return words?.length || 0;
  }, [activeNote?.body]);

  function addNote() {
    const note = makeNote();
    setNotes((current) => [...current, note]);
    setActiveId(note.id);
  }

  function updateNote(body) {
    if (!activeNote) return;
    setNotes((current) =>
      current.map((note) =>
        note.id === activeNote.id
          ? { ...note, body, updatedAt: new Date().toISOString() }
          : note,
      ),
    );
  }

  function removeNote() {
    if (!activeNote) return;
    const updatedAt = new Date().toISOString();
    const remaining = visibleNotes.filter((note) => note.id !== activeNote.id);
    const replacement = remaining[0] || makeNote();
    setNotes((current) => {
      const removed = current.map((note) =>
        note.id === activeNote.id ? { ...note, deletedAt: updatedAt, updatedAt } : note,
      );
      return remaining.length ? removed : [...removed, replacement];
    });
    setActiveId(replacement.id);
  }

  return (
    <article className="notes-app">
      <aside className="notes-index" aria-label="Your notes">
        <button className="notes-new-button" type="button" onClick={addNote}>
          <i className="fas fa-plus" aria-hidden="true" /> New note
        </button>
        <div className="notes-list" role="list">
          {visibleNotes.map((note) => (
            <button
              className={`notes-list-item${note.id === activeNote?.id ? " notes-list-item-active" : ""}`}
              type="button"
              role="listitem"
              key={note.id}
              onClick={() => setActiveId(note.id)}
              aria-current={note.id === activeNote?.id ? "true" : undefined}
            >
              <strong>{noteTitle(note)}</strong>
              <span>{new Date(note.updatedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            </button>
          ))}
        </div>
      </aside>

      <div className="notes-editor">
        <div className="note-sheet">
          <textarea
            className="note-body"
            value={activeNote?.body || ""}
            onChange={(event) => updateNote(event.target.value)}
            placeholder="Capture a thought, formula, or question…"
            aria-label="Note body"
            autoFocus
          />
        </div>

        <footer className="notes-footer">
          <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
          <button type="button" onClick={removeNote} aria-label="Delete current note">
            <i className="fas fa-trash" aria-hidden="true" />
          </button>
        </footer>
      </div>
    </article>
  );
}

export default NotesApp;
