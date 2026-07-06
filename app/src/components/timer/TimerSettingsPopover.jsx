import { useState } from "react";
import CardChrome from "../layout/CardChrome";

function TimerSettingsPopover({ lengths, onApply, onClose }) {
  const [pomodoro, setPomodoro] = useState(lengths.pomodoro);
  const [shortBreak, setShortBreak] = useState(lengths.shortBreak);
  const [longBreak, setLongBreak] = useState(lengths.longBreak);

  function handleApply() {
    onApply({
      pomodoro: Number(pomodoro) || 1,
      shortBreak: Number(shortBreak) || 1,
      longBreak: Number(longBreak) || 15,
    });
    onClose();
  }

  return (
    <div className="timer-setting-overlay" onClick={onClose}>
      <div
        className="pop-up-box timer-setting-box opened-timer-setting"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="box-banner">
          <h3>Timer Settings</h3>
          <CardChrome showMinMax={false} onClose={onClose} />
        </div>
        <div className="timer-setting-body">
          <div className="timer-setting-list">
            <span>pomodoro</span>
            <div>
              <input
                type="number"
                min="1"
                value={pomodoro}
                onChange={(e) => setPomodoro(e.target.value)}
              />
              <span> min</span>
            </div>
          </div>
          <div className="timer-setting-list">
            <span>Short Break</span>
            <div>
              <input
                type="number"
                min="1"
                max="15"
                value={shortBreak}
                onChange={(e) => setShortBreak(e.target.value)}
              />
              <span> min</span>
            </div>
          </div>
          <div className="timer-setting-list">
            <span>Long Break</span>
            <div>
              <input
                type="number"
                min="15"
                max="30"
                value={longBreak}
                onChange={(e) => setLongBreak(e.target.value)}
              />
              <span> min</span>
            </div>
          </div>

          <div className="apply-btn-container">
            <button id="apply-btn" onClick={handleApply}>
              apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimerSettingsPopover;
