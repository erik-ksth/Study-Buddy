import { supabase } from "./supabase";

const now = () => new Date().toISOString();

function timestamp(value) {
  const parsed = Date.parse(value || "");
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function normalizeWorkspace(workspace) {
  const legacyNote = (() => {
    try {
      const raw = localStorage.getItem("studyBuddyQuickNotes");
      if (!raw) return "";
      try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "string" ? parsed : parsed?.body || "";
      } catch {
        return raw;
      }
    } catch {
      return "";
    }
  })();

  let notes = Array.isArray(workspace.notes) ? workspace.notes : [];
  if (!notes.length && legacyNote.trim()) {
    const createdAt = now();
    notes = [
      {
        id: crypto.randomUUID(),
        body: legacyNote,
        createdAt,
        updatedAt: createdAt,
        deletedAt: null,
      },
    ];
  }

  return {
    todos: (Array.isArray(workspace.todos) ? workspace.todos : []).map((task) => ({
      ...task,
      id: task.id || crypto.randomUUID(),
      createdAt: task.createdAt || task.updatedAt || now(),
      updatedAt: task.updatedAt || now(),
      deletedAt: task.deletedAt || null,
    })),
    notes: notes.map((note) => ({
      ...note,
      id: note.id || crypto.randomUUID(),
      body: note.body || "",
      createdAt: note.createdAt || note.updatedAt || now(),
      updatedAt: note.updatedAt || now(),
      deletedAt: note.deletedAt || null,
    })),
    flashcards: (Array.isArray(workspace.flashcards) ? workspace.flashcards : []).map((card) => ({
      ...card,
      id: card.id || crypto.randomUUID(),
      createdAt: card.createdAt || card.updatedAt || now(),
      updatedAt: card.updatedAt || now(),
      deletedAt: card.deletedAt || null,
    })),
    stats: { ...(workspace.stats || {}), updatedAt: workspace.stats?.updatedAt || now() },
    theme: workspace.theme || "cream",
  };
}

function mergeRecords(local = [], remote = []) {
  const records = new Map();
  [...local, ...remote].forEach((record) => {
    const current = records.get(record.id);
    if (!current || timestamp(record.updatedAt) >= timestamp(current.updatedAt)) {
      records.set(record.id, record);
    }
  });
  return [...records.values()].sort((a, b) => timestamp(a.createdAt) - timestamp(b.createdAt));
}

export function mergeWorkspaces(local, remote) {
  const normalizedLocal = normalizeWorkspace(local);
  return {
    todos: mergeRecords(normalizedLocal.todos, remote.todos),
    notes: mergeRecords(normalizedLocal.notes, remote.notes),
    flashcards: mergeRecords(normalizedLocal.flashcards, remote.flashcards),
    stats:
      timestamp(remote.stats?.updatedAt) > timestamp(normalizedLocal.stats?.updatedAt)
        ? remote.stats
        : normalizedLocal.stats,
    theme: remote.theme || normalizedLocal.theme,
  };
}

function throwOnError(result) {
  if (result.error) throw result.error;
  return result.data;
}

export async function uploadNamespace(namespace, value, userId) {
  if (!supabase) return;
  const workspace = normalizeWorkspace({ [namespace]: value });

  if (namespace === "todos") {
    const rows = workspace.todos.map((task, position) => ({
      id: task.id,
      user_id: userId,
      text: task.text || "",
      is_completed: Boolean(task.checked),
      due_time: task.time || "--:-- --",
      position,
      created_at: task.createdAt,
      updated_at: task.updatedAt,
      deleted_at: task.deletedAt,
    }));
    if (rows.length) throwOnError(await supabase.from("todos").upsert(rows, { onConflict: "id" }));
    return;
  }

  if (namespace === "notes") {
    const rows = workspace.notes.map((note, position) => ({
      id: note.id,
      user_id: userId,
      body: note.body || "",
      position,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
      deleted_at: note.deletedAt,
    }));
    if (rows.length) throwOnError(await supabase.from("notes").upsert(rows, { onConflict: "id" }));
    return;
  }

  if (namespace === "flashcards") {
    const rows = workspace.flashcards.map((card, position) => ({
      id: card.id,
      user_id: userId,
      front: card.front || "",
      back: card.back || "",
      position,
      created_at: card.createdAt,
      updated_at: card.updatedAt,
      deleted_at: card.deletedAt,
    }));
    if (rows.length) {
      throwOnError(await supabase.from("flashcards").upsert(rows, { onConflict: "id" }));
    }
    return;
  }

  if (namespace === "stats") {
    const stats = { ...(value || {}), updatedAt: value?.updatedAt || now() };
    throwOnError(
      await supabase.from("study_stats").upsert(
        { user_id: userId, data: stats, updated_at: stats.updatedAt },
        { onConflict: "user_id" },
      ),
    );
    return;
  }

  if (namespace === "theme") {
    throwOnError(
      await supabase.from("user_preferences").upsert(
        { user_id: userId, theme: value || "cream", updated_at: now() },
        { onConflict: "user_id" },
      ),
    );
  }
}

export async function uploadWorkspace(workspace, userId) {
  const normalized = normalizeWorkspace(workspace);
  await Promise.all(
    Object.entries(normalized).map(([namespace, value]) =>
      uploadNamespace(namespace, value, userId),
    ),
  );
  return normalized;
}

export async function fetchWorkspace(userId) {
  if (!supabase) return null;
  const [todosResult, notesResult, cardsResult, statsResult, preferencesResult] = await Promise.all([
    supabase.from("todos").select("*").eq("user_id", userId).order("position"),
    supabase.from("notes").select("*").eq("user_id", userId).order("position"),
    supabase.from("flashcards").select("*").eq("user_id", userId).order("position"),
    supabase.from("study_stats").select("data, updated_at").eq("user_id", userId).maybeSingle(),
    supabase.from("user_preferences").select("theme").eq("user_id", userId).maybeSingle(),
  ]);

  [todosResult, notesResult, cardsResult, statsResult, preferencesResult].forEach(throwOnError);

  return {
    todos: todosResult.data.map((task) => ({
      id: task.id,
      text: task.text,
      checked: task.is_completed,
      time: task.due_time,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
      deletedAt: task.deleted_at,
    })),
    notes: notesResult.data.map((note) => ({
      id: note.id,
      body: note.body,
      createdAt: note.created_at,
      updatedAt: note.updated_at,
      deletedAt: note.deleted_at,
    })),
    flashcards: cardsResult.data.map((card) => ({
      id: card.id,
      front: card.front,
      back: card.back,
      createdAt: card.created_at,
      updatedAt: card.updated_at,
      deletedAt: card.deleted_at,
    })),
    stats: statsResult.data
      ? { ...statsResult.data.data, updatedAt: statsResult.data.updated_at }
      : null,
    theme: preferencesResult.data?.theme || null,
  };
}
