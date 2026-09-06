import { createContext, useContext, useEffect } from "react";
import { trackEvent } from "../analytics";
import { useLocalStorage } from "../hooks/useLocalStorage";

const StudyStatsContext = createContext(null);

const STORAGE_KEY = "studyStats";

const DEFAULT_STATS = {
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

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// Whole-day difference between two "YYYY-MM-DD" keys, via UTC epoch so it's
// immune to local DST shifts.
function daysBetween(a, b) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

// Resets the "today" counters when the calendar day has turned over, and
// breaks the streak if a whole day was skipped with no activity at all.
function rollDay(stats, today) {
  if (stats.date === today) return stats;
  const streakBroken = stats.lastActiveDate && daysBetween(stats.lastActiveDate, today) > 1;
  return {
    ...stats,
    date: today,
    focusMinutesToday: 0,
    pomodorosToday: 0,
    tasksDoneToday: 0,
    streak: streakBroken ? 0 : stats.streak,
    updatedAt: new Date().toISOString(),
  };
}

// Bumps the streak the first time (and only the first time) activity happens
// on a given day — just opening the app doesn't extend it.
function markActiveToday(stats, today) {
  if (stats.lastActiveDate === today) return stats;
  const gap = stats.lastActiveDate ? daysBetween(stats.lastActiveDate, today) : null;
  const streak = gap === 1 ? stats.streak + 1 : 1;
  return {
    ...stats,
    lastActiveDate: today,
    streak,
    bestStreak: Math.max(stats.bestStreak, streak),
    updatedAt: new Date().toISOString(),
  };
}

export function StudyStatsProvider({ children }) {
  const [stats, setStats] = useLocalStorage(STORAGE_KEY, DEFAULT_STATS);

  // Catches "reopened the app after a gap, haven't done anything yet today" —
  // without this the stale day/streak would only correct on the next
  // completed pomodoro or task.
  useEffect(() => {
    setStats((prev) => rollDay(prev, todayKey()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function recordPomodoroComplete(minutes) {
    trackEvent("sb_focus_session_complete", {
      completed_sessions: (Number(stats.totalPomodoros) || 0) + 1,
      focus_minutes: minutes,
    });

    setStats((prev) => {
      const today = todayKey();
      const active = markActiveToday(rollDay(prev, today), today);
      return {
        ...active,
        focusMinutesToday: active.focusMinutesToday + minutes,
        pomodorosToday: active.pomodorosToday + 1,
        totalFocusMinutes: active.totalFocusMinutes + minutes,
        totalPomodoros: active.totalPomodoros + 1,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  function recordTaskToggled(nowChecked) {
    setStats((prev) => {
      const today = todayKey();
      const rolled = rollDay(prev, today);
      const base = nowChecked ? markActiveToday(rolled, today) : rolled;
      const delta = nowChecked ? 1 : -1;
      return {
        ...base,
        tasksDoneToday: Math.max(0, base.tasksDoneToday + delta),
        totalTasksDone: Math.max(0, base.totalTasksDone + delta),
        updatedAt: new Date().toISOString(),
      };
    });
  }

  return (
    <StudyStatsContext.Provider value={{ stats, recordPomodoroComplete, recordTaskToggled }}>
      {children}
    </StudyStatsContext.Provider>
  );
}

export function useStudyStats() {
  const ctx = useContext(StudyStatsContext);
  if (!ctx) throw new Error("useStudyStats must be used within a StudyStatsProvider");
  return ctx;
}
