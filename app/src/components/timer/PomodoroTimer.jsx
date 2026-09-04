import { useRef, useState } from "react";
import CardChrome from "../layout/CardChrome";
import TimerSettingsPopover from "./TimerSettingsPopover";
import TimerCompleteToast from "./TimerCompleteToast";
import { usePomodoro } from "../../hooks/usePomodoro";
import { useStudyStats } from "../../context/StudyStatsContext";
import { useNotifications } from "../../context/NotificationContext";

const TABS = [
  { id: "pomodoro", label: "pomodoro" },
  { id: "shortBreak", label: "short break" },
  { id: "longBreak", label: "long break" },
];

function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}

function PomodoroTimer() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastIdRef = useRef(0);
  const notiSoundRef = useRef(null);
  const { recordPomodoroComplete } = useStudyStats();
  const { addNotification, preferences, sendDesktopNotification } = useNotifications();

  const { activeTab, isRunning, remaining, holdDisplay, lengths, selectTab, start, restart, applySettings } =
    usePomodoro({
      onComplete: (message, title, tab, minutes) => {
        if (preferences.sounds) {
          try {
            const playPromise = notiSoundRef.current?.play();
            playPromise?.catch(() => {});
          } catch {
            // Audio alerts are best-effort because browsers can block autoplay.
          }
        }

        toastIdRef.current += 1;
        setToast({ message, id: toastIdRef.current });
        if (preferences.timerAlerts) addNotification({ title, message, type: "timer" });
        sendDesktopNotification(title, message);

        if (tab === "pomodoro") {
          recordPomodoroComplete(minutes);
        }
      },
    });

  const secondsDisplay = holdDisplay ? "00" : pad(remaining.seconds);

  return (
    <div className="pop-up-box timer-card">
      <div className="box-banner">
        <h3>Timer</h3>
        <CardChrome />
      </div>

      <button
        className={`setting-btn${settingsOpen ? " setting-activated" : ""}`}
        onClick={() => setSettingsOpen((v) => !v)}
      >
        <i className="fa-solid fa-gear" />
      </button>

      <div className="timer-container">
        <span className="timer-clock">
          <span>{pad(remaining.minutes)}</span>:<span>{secondsDisplay}</span>
        </span>
        <div className="timer-btn-container">
          <button className={`start-btn${isRunning ? " pause-btn" : ""}`} onClick={start}>
            {isRunning ? "pause" : "start"}
          </button>
          <div className="reset-wrapper">
            <button className="redo-btn" onClick={restart}>
              <i className="fas fa-redo" />
            </button>
          </div>
        </div>
      </div>

      <div className="tabs-container">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn${activeTab === tab.id ? " tab-selected" : ""}`}
            onClick={() => selectTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {settingsOpen && (
        <TimerSettingsPopover
          lengths={lengths}
          onApply={applySettings}
          onClose={() => setSettingsOpen(false)}
        />
      )}

      <audio ref={notiSoundRef}>
        <source src="/music/notificationSound.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      <TimerCompleteToast toast={toast} />
    </div>
  );
}

export default PomodoroTimer;
