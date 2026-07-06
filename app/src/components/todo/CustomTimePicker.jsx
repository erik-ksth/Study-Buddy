import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const AMPM = ["AM", "PM"];

export function parseTimeValue(currentText) {
  if (!currentText || currentText.includes("--")) {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    return {
      hour: String(h).padStart(2, "0"),
      minute: String(m).padStart(2, "0"),
      ampm,
    };
  }
  const parts = currentText.trim().split(/[:\s]+/);
  if (parts.length >= 3) {
    return { hour: parts[0], minute: parts[1], ampm: parts[2] };
  }
  return { hour: "12", minute: "00", ampm: "PM" };
}

function highlightCenter(col) {
  if (!col) return null;
  const centerY = col.scrollTop + col.offsetHeight / 2;
  const items = col.querySelectorAll(".picker-item[data-val]");
  let closest = null;
  let minDiff = Infinity;
  items.forEach((item) => {
    const itemCenter = item.offsetTop + item.offsetHeight / 2;
    const diff = Math.abs(centerY - itemCenter);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
    item.classList.remove("selected");
  });
  if (closest) closest.classList.add("selected");
  return closest;
}

function scrollToVal(col, val) {
  const items = col.querySelectorAll(".picker-item[data-val]");
  for (const item of items) {
    if (item.getAttribute("data-val") === val) {
      col.scrollTop = item.offsetTop - col.offsetHeight / 2 + item.offsetHeight / 2;
      break;
    }
  }
}

const CustomTimePicker = forwardRef(function CustomTimePicker(
  { anchorEl, initialTime, onCommit },
  ref,
) {
  const rootRef = useRef(null);
  const hourColRef = useRef(null);
  const minuteColRef = useRef(null);
  const ampmColRef = useRef(null);

  function readSelected() {
    const hour = hourColRef.current.querySelector(".selected")?.getAttribute("data-val") || "12";
    const minute =
      minuteColRef.current.querySelector(".selected")?.getAttribute("data-val") || "00";
    const ampm = ampmColRef.current.querySelector(".selected")?.getAttribute("data-val") || "AM";
    return { hour, minute, ampm };
  }

  function confirmAndClose() {
    onCommit(readSelected());
  }

  useImperativeHandle(ref, () => ({ confirmAndClose }));

  // Position next to the button that opened this, and scroll each column to
  // the task's current value — both one-time, matching the original's
  // open-time getBoundingClientRect + scrollToVal.
  useLayoutEffect(() => {
    if (anchorEl && rootRef.current) {
      const rect = anchorEl.getBoundingClientRect();
      rootRef.current.style.top = `${rect.bottom + window.scrollY + 5}px`;
      rootRef.current.style.left = `${rect.left + window.scrollX}px`;
    }
    scrollToVal(hourColRef.current, initialTime.hour);
    scrollToVal(minuteColRef.current, initialTime.minute);
    scrollToVal(ampmColRef.current, initialTime.ampm);
    highlightCenter(hourColRef.current);
    highlightCenter(minuteColRef.current);
    highlightCenter(ampmColRef.current);
    // Deliberately one-time: this mirrors the original picker, which only
    // positions/scrolls-to-value when it opens, not on every prop change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useLayoutEffect(() => {
    function handleWindowClick(e) {
      if (
        rootRef.current &&
        !rootRef.current.contains(e.target) &&
        anchorEl &&
        !anchorEl.contains(e.target)
      ) {
        confirmAndClose();
      }
    }
    function handleKeydown(e) {
      if (e.key === "Enter") confirmAndClose();
    }
    window.addEventListener("click", handleWindowClick);
    document.addEventListener("keydown", handleKeydown);
    return () => {
      window.removeEventListener("click", handleWindowClick);
      document.removeEventListener("keydown", handleKeydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handlePickerClick(e) {
    if (e.target.classList.contains("picker-item") && e.target.classList.contains("selected")) {
      confirmAndClose();
    }
  }

  // Rendered via a portal straight onto <body>: the trigger button can be
  // nested inside position:relative/overflow:hidden ancestors (e.g. the
  // scrollable to-do card), and this dropdown's top/left are computed as
  // viewport/document coordinates — a portal keeps its containing block the
  // document itself instead of whatever positioned ancestor it'd otherwise
  // inherit, and keeps it from being clipped by a scrolling card.
  return createPortal(
    <div
      ref={rootRef}
      className="time-picker-dropdown"
      style={{ display: "block" }}
      onClick={handlePickerClick}
    >
      <div className="time-picker-body">
        <div
          className="picker-column hour-column"
          ref={hourColRef}
          onScroll={() => highlightCenter(hourColRef.current)}
        >
          <div className="picker-item" style={{ height: 55, pointerEvents: "none" }} />
          {HOURS.map((h) => (
            <div key={h} className="picker-item" data-val={h}>
              {h}
            </div>
          ))}
          <div className="picker-item" style={{ height: 55, pointerEvents: "none" }} />
        </div>
        <div
          className="picker-column minute-column"
          ref={minuteColRef}
          onScroll={() => highlightCenter(minuteColRef.current)}
        >
          <div className="picker-item" style={{ height: 55, pointerEvents: "none" }} />
          {MINUTES.map((m) => (
            <div key={m} className="picker-item" data-val={m}>
              {m}
            </div>
          ))}
          <div className="picker-item" style={{ height: 55, pointerEvents: "none" }} />
        </div>
        <div
          className="picker-column ampm-column"
          ref={ampmColRef}
          onScroll={() => highlightCenter(ampmColRef.current)}
        >
          <div className="picker-item" style={{ height: 55, pointerEvents: "none" }} />
          {AMPM.map((ap) => (
            <div key={ap} className="picker-item" data-val={ap}>
              {ap}
            </div>
          ))}
          <div className="picker-item" style={{ height: 55, pointerEvents: "none" }} />
        </div>
        <div className="picker-highlight" />
      </div>
    </div>,
    document.body,
  );
});

export default CustomTimePicker;
