import { useEffect, useRef, useState } from "react";
import CardChrome from "../layout/CardChrome";
import TodoItem from "./TodoItem";
import { useSortableList } from "../../hooks/useSortableList";
import { useStudyStats } from "../../context/StudyStatsContext";

function makeTask(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    text: "",
    checked: false,
    time: "--:-- --",
    ...overrides,
  };
}

function loadInitialTasks() {
  try {
    const saved = localStorage.getItem("todoList");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((t) =>
          makeTask({
            text: t.text || "",
            checked: !!t.checked,
            time: t.time || "--:-- --",
          }),
        );
      }
    }
  } catch {
    // corrupt localStorage — fall through to a single empty task, same as
    // the original's "no saved tasks" path
  }
  return [makeTask()];
}

function TodoList() {
  const [tasks, setTasks] = useState(loadInitialTasks);
  const [openPickerTaskId, setOpenPickerTaskId] = useState(null);
  const [focusTaskId, setFocusTaskId] = useState(null);
  const taskRefs = useRef(new Map());
  const { recordTaskToggled } = useStudyStats();

  useEffect(() => {
    const serializable = tasks.map(({ text, checked, time }) => ({ text, checked, time }));
    localStorage.setItem("todoList", JSON.stringify(serializable));
  }, [tasks]);

  useEffect(() => {
    if (focusTaskId) {
      taskRefs.current.get(focusTaskId)?.focus();
      setFocusTaskId(null);
    }
  }, [focusTaskId, tasks]);

  const containerRef = useSortableList(".drag-handle", (oldIndex, newIndex) => {
    setTasks((prev) => {
      const next = [...prev];
      const [moved] = next.splice(oldIndex, 1);
      next.splice(newIndex, 0, moved);
      return next;
    });
  });

  function addTask() {
    const task = makeTask();
    setTasks((prev) => [...prev, task]);
    setFocusTaskId(task.id);
  }

  function updateText(id, text) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, text } : t)));
  }

  function toggleChecked(id) {
    // Recorded here, outside the setTasks updater, so StrictMode's
    // double-invoke-to-detect-impurity behavior on updater functions can't
    // double-count the stats side effect.
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    recordTaskToggled(!task.checked);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, checked: !t.checked } : t)));
  }

  function removeTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    taskRefs.current.delete(id);
  }

  function updateTime(id, time) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, time } : t)));
  }

  return (
    <div className="pop-up-box todo-card">
      <div className="box-banner">
        <h3>To-do-list</h3>
        <CardChrome />
      </div>

      <div className="to-do-list-content">
        <ul className="list-container" ref={containerRef}>
          {tasks.map((task) => (
            <TodoItem
              key={task.id}
              task={task}
              onUpdateText={updateText}
              onToggleChecked={toggleChecked}
              onRemove={removeTask}
              onEnterKey={addTask}
              onUpdateTime={updateTime}
              isPickerOpen={openPickerTaskId === task.id}
              onOpenPicker={() => setOpenPickerTaskId(task.id)}
              onClosePicker={() => setOpenPickerTaskId(null)}
              textareaRef={(el) => {
                if (el) taskRefs.current.set(task.id, el);
              }}
            />
          ))}
        </ul>
      </div>

      <button className="plus-btn" onClick={addTask}>
        <i className="fa-solid fa-plus" />
      </button>
    </div>
  );
}

export default TodoList;
