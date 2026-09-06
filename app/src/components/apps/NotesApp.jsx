import { useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "studyBuddyQuickNotes";

function loadNote() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return "";
  try {
    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === "object") {
      return parsed.body || "";
    }
  } catch {
    // Previous versions stored the note as plain text.
  }
  return saved;
}

function NotesApp() {
  const [note, setNote] = useState(loadNote);
  const lastStoredValue = useRef(note);

  const wordCount = useMemo(() => {
    const words = note.trim().match(/\S+/g);
    return words?.length || 0;
  }, [note]);

  useEffect(() => {
    if (note === lastStoredValue.current) return;
    lastStoredValue.current = note;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ body: note }));
  }, [note]);

  return (
    <article className="notes-app">
      <div className="note-sheet">
        <textarea
          className="note-body"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Capture a thought, formula, or question…"
          aria-label="Note body"
          autoFocus
        />
      </div>

      <footer className="notes-footer">
        <span>{wordCount} {wordCount === 1 ? "word" : "words"}</span>
        <span>{note.length} characters</span>
      </footer>
    </article>
  );
}

export default NotesApp;
