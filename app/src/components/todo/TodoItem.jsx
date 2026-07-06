import { useLayoutEffect, useRef } from "react";
import CustomTimePicker, { parseTimeValue } from "./CustomTimePicker";

function TodoItem({
  task,
  onUpdateText,
  onToggleChecked,
  onRemove,
  onEnterKey,
  onUpdateTime,
  isPickerOpen,
  onOpenPicker,
  onClosePicker,
  textareaRef,
}) {
  const timeBtnRef = useRef(null);
  const pickerRef = useRef(null);
  const localTextareaRef = useRef(null);

  useLayoutEffect(() => {
    const el = localTextareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [task.text]);

  const hasChecked = task.checked && task.text.trim().length > 0;
  const hasTime = task.time !== "--:-- --";

  function handleTimeBtnClick(e) {
    e.stopPropagation();
    if (isPickerOpen) {
      pickerRef.current?.confirmAndClose();
    } else {
      onOpenPicker();
    }
  }

  function handleContainerClick(e) {
    if (!e.target.closest(".remove-btn") && !e.target.closest(".time-display-btn")) {
      if (isPickerOpen) {
        pickerRef.current?.confirmAndClose();
      } else {
        onOpenPicker();
      }
    }
  }

  return (
    <li className="task-list">
      <i className="fas fa-grip-vertical drag-handle" />
      <input type="checkbox" checked={task.checked} onChange={() => onToggleChecked(task.id)} />
      <div className="task-lable-container">
        <textarea
          className={`task-input${hasChecked ? " hasChecked" : ""}`}
          placeholder="Task"
          rows={1}
          value={task.text}
          ref={(el) => {
            localTextareaRef.current = el;
            textareaRef(el);
          }}
          onChange={(e) => onUpdateText(task.id, e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onEnterKey();
            }
          }}
        />
        <div className="task-btns-container" onClick={handleContainerClick}>
          <button
            ref={timeBtnRef}
            className={`time-display-btn${hasTime ? " time-display-btn-set" : ""}`}
            onClick={handleTimeBtnClick}
          >
            <i className="far fa-clock" />
            <span>{hasTime ? task.time : "set"}</span>
          </button>
          <i
            className="far fa-trash-alt remove-btn"
            onClick={() => onRemove(task.id)}
          />
        </div>
      </div>

      {isPickerOpen && (
        <CustomTimePicker
          ref={pickerRef}
          anchorEl={timeBtnRef.current}
          initialTime={parseTimeValue(task.time)}
          onCommit={({ hour, minute, ampm }) => {
            onUpdateTime(task.id, `${hour}:${minute} ${ampm}`);
            onClosePicker();
          }}
        />
      )}
    </li>
  );
}

export default TodoItem;
