import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

const TABS = {
  pomodoro: "pomodoro",
  shortBreak: "shortBreak",
  longBreak: "longBreak",
};

function getNotificationMessage(tab, roundCount) {
  if (tab === TABS.pomodoro) {
    return roundCount < 4
      ? "Short break time! Take a walk, stretch, and hydrate."
      : "Long break time! Step away, relax, and reset your mind.";
  }
  if (tab === TABS.shortBreak) return "Break’s over. Let’s get back to focus.";
  if (tab === TABS.longBreak) return "Hope you recharged! Ready for a new focus session?";
  return "Time's up!";
}

function getNotificationTitle(tab) {
  if (tab === TABS.pomodoro) return "Focus session complete!";
  if (tab === TABS.shortBreak) return "Short break over!";
  if (tab === TABS.longBreak) return "Long break over!";
  return "Time's up!";
}

export function usePomodoro({ onComplete }) {
  const [pomodoroLength, setPomodoroLength] = useLocalStorage("pomodoro", 25);
  const [shortBreakLength, setShortBreakLength] = useLocalStorage("shortBreak", 5);
  const [longBreakLength, setLongBreakLength] = useLocalStorage("longBreak", 15);

  const lengths = {
    pomodoro: pomodoroLength,
    shortBreak: shortBreakLength,
    longBreak: longBreakLength,
  };

  const [activeTab, setActiveTab] = useState(TABS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [remaining, setRemaining] = useState({ minutes: pomodoroLength, seconds: 0 });
  // Mirrors the original's first-secs/secs swap: hold the display at :00 for a
  // beat after Start, then reveal the live ticking value.
  const [holdDisplay, setHoldDisplay] = useState(true);
  const [roundCount, setRoundCount] = useState(1);

  const intervalRef = useRef(null);
  const holdTimeoutRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const stopTicking = useCallback(() => {
    clearInterval(intervalRef.current);
    clearTimeout(holdTimeoutRef.current);
  }, []);

  const resetDisplay = useCallback(
    (tab) => {
      stopTicking();
      setIsRunning(false);
      setHoldDisplay(true);
      setRemaining({ minutes: lengths[tab], seconds: 0 });
    },
    // lengths values are read fresh each call via closure; only re-created
    // when one of the three actually changes.
    [stopTicking, pomodoroLength, shortBreakLength, longBreakLength],
  );

  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  function selectTab(tab) {
    setActiveTab(tab);
    resetDisplay(tab);
  }

  function restart() {
    resetDisplay(activeTab);
  }

  function pause() {
    stopTicking();
    setIsRunning(false);
  }

  function start() {
    if (isRunning) {
      pause();
      return;
    }

    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }

    const totalSeconds = remaining.minutes * 60 + remaining.seconds;
    const endTime = Date.now() + totalSeconds * 1000;

    stopTicking();
    holdTimeoutRef.current = setTimeout(() => setHoldDisplay(false), 1000);
    intervalRef.current = setInterval(() => {
      const distance = endTime - Date.now();
      const remainingSeconds = Math.ceil(distance / 1000);

      if (remainingSeconds <= 0) {
        clearInterval(intervalRef.current);
        const message = getNotificationMessage(activeTab, roundCount);
        const title = getNotificationTitle(activeTab);
        onCompleteRef.current?.(message, title, activeTab, lengths[activeTab]);
        resetDisplay(activeTab);

        if (activeTab === TABS.pomodoro) {
          setRoundCount((prev) => (prev >= 4 ? 1 : prev + 1));
        }
        return;
      }

      setRemaining({
        minutes: Math.floor(remainingSeconds / 60),
        seconds: remainingSeconds % 60,
      });
    }, 100);

    setIsRunning(true);
  }

  function applySettings({ pomodoro, shortBreak, longBreak }) {
    const clampedShortBreak = Math.min(15, Math.max(1, shortBreak));
    const clampedLongBreak = Math.min(30, Math.max(15, longBreak));

    setPomodoroLength(pomodoro);
    setShortBreakLength(clampedShortBreak);
    setLongBreakLength(clampedLongBreak);

    resetDisplay(activeTab === TABS.pomodoro ? TABS.pomodoro : activeTab);
    // Reflect the just-applied length immediately if it's the active tab.
    setRemaining({
      minutes:
        activeTab === TABS.pomodoro
          ? pomodoro
          : activeTab === TABS.shortBreak
            ? clampedShortBreak
            : clampedLongBreak,
      seconds: 0,
    });

    return { pomodoro, shortBreak: clampedShortBreak, longBreak: clampedLongBreak };
  }

  useEffect(() => stopTicking, [stopTicking]);

  return {
    activeTab,
    isRunning,
    remaining,
    holdDisplay,
    roundCount,
    lengths,
    selectTab,
    start,
    restart,
    applySettings,
  };
}
