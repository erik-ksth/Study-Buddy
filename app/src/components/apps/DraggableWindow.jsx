import { useEffect, useRef } from "react";

const VIEWPORT_PADDING = 12;

function clampPosition(position, element) {
  if (!element) return position;
  const maxX = Math.max(VIEWPORT_PADDING, window.innerWidth - element.offsetWidth - VIEWPORT_PADDING);
  const maxY = Math.max(VIEWPORT_PADDING, window.innerHeight - 54);
  return {
    x: Math.min(Math.max(VIEWPORT_PADDING, position.x), maxX),
    y: Math.min(Math.max(VIEWPORT_PADDING, position.y), maxY),
  };
}

function DraggableWindow({ appId, title, position, zIndex, onClose, onFocus, onMove, children }) {
  const windowRef = useRef(null);
  const dragRef = useRef(null);
  const titleId = `${appId}-window-title`;

  useEffect(() => {
    if (!windowRef.current?.contains(document.activeElement)) {
      windowRef.current?.focus({ preventScroll: true });
    }
  }, []);

  useEffect(() => {
    function keepInViewport() {
      onMove(clampPosition(position, windowRef.current));
    }

    window.addEventListener("resize", keepInViewport);
    return () => window.removeEventListener("resize", keepInViewport);
  }, [onMove, position]);

  function startDrag(event) {
    if (event.button !== 0) return;
    event.stopPropagation();
    onFocus();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      originX: event.clientX,
      originY: event.clientY,
      startX: position.x,
      startY: position.y,
    };
  }

  function drag(event) {
    const activeDrag = dragRef.current;
    if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
    const next = {
      x: activeDrag.startX + event.clientX - activeDrag.originX,
      y: activeDrag.startY + event.clientY - activeDrag.originY,
    };
    onMove(clampPosition(next, windowRef.current));
  }

  function stopDrag(event) {
    if (dragRef.current?.pointerId === event.pointerId) dragRef.current = null;
  }

  return (
    <section
      className={`mini-app-window mini-app-window-${appId}`}
      ref={windowRef}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      style={{ left: position.x, top: position.y, zIndex }}
      onPointerDown={onFocus}
    >
      <header
        className="mini-app-titlebar"
        onPointerDown={startDrag}
        onPointerMove={drag}
        onPointerUp={stopDrag}
        onPointerCancel={stopDrag}
      >
        <h2 id={titleId}>{title}</h2>
        <button
          className="mini-app-close"
          type="button"
          aria-label={`Close ${title}`}
          title={`Close ${title}`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
      </header>
      <div className="mini-app-body">{children}</div>
    </section>
  );
}

export default DraggableWindow;
