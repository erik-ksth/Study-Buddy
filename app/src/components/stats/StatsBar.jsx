import { Fragment } from "react";
import { useStudyStats } from "../../context/StudyStatsContext";
import { formatFocusTime } from "./formatFocusTime";

const STAT_ITEMS = [
  { key: "focus", icon: "far fa-clock", label: "Focus Time", sub: "Today" },
  { key: "pomodoros", icon: "svg-tomato", label: "Pomodoros", sub: "Today" },
  { key: "tasks", icon: "far fa-square-check", label: "Tasks Done", sub: "Today" },
  { key: "streak", icon: "fas fa-fire", label: "Streak", sub: "Days" },
];

function TomatoIcon() {
  return (
    <svg
      className="stat-icon"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      role="img"
    >
      <path
        d="M12 3.35c.28 0 .54.11.73.31l1.1 1.13 1.1-1.13a1 1 0 0 1 1.42 1.41l-1.5 1.53c.71-.21 1.48-.32 2.27-.32 3.05 0 5.53 2.45 5.53 5.47v.83H16.9V11.5a.72.72 0 0 0-1.44 0v1.08h-2.74V10.7a.72.72 0 0 0-1.44 0v1.88H8.54V11.5a.72.72 0 0 0-1.44 0v1.08H1.35v-.83c0-3.02 2.48-5.47 5.53-5.47.79 0 1.56.11 2.27.32l-1.5-1.53a1 1 0 0 1 1.42-1.41l1.1 1.13 1.1-1.13c.19-.2.45-.31.73-.31ZM1.35 14.02h21.3v1.03c0 3.34-2.72 6.05-6.08 6.05H7.43c-3.36 0-6.08-2.71-6.08-6.05v-1.03Z"
        fill="currentColor"
      />
    </svg>
  );
}

function StatsBar() {
  const { stats } = useStudyStats();

  const values = {
    focus: formatFocusTime(stats.focusMinutesToday),
    pomodoros: stats.pomodorosToday,
    tasks: stats.tasksDoneToday,
    streak: stats.streak,
  };

  return (
    <div className="stats-bar">
      {STAT_ITEMS.map((item, i) => (
        <Fragment key={item.key}>
          {i > 0 && <div className="stat-divider" />}
          <div className="stat-item">
            {item.icon === "svg-tomato" ? <TomatoIcon /> : <i className={`${item.icon} stat-icon`} />}
            <div className="stat-text">
              <span className="stat-label">{item.label}</span>
              <span className="stat-value">{values[item.key]}</span>
              <span className="stat-sub">{item.sub}</span>
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export default StatsBar;
