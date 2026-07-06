import { useLayoutEffect, useRef, useState } from "react";

function TimerCompleteToast({ toast }) {
  const containerRef = useRef(null);
  const [top, setTop] = useState(-9999);
  const message = toast?.message ?? "";

  useLayoutEffect(() => {
    if (!toast) return undefined;
    const el = containerRef.current;
    setTop(-(el.offsetHeight + 100));

    const showTimer = setTimeout(() => setTop(0), 100);
    const hideTimer = setTimeout(() => setTop(-(el.offsetHeight + 100)), 3000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [toast]);

  return (
    <div className="toast-container" ref={containerRef} style={{ top }}>
      {message && (
        <div className="bannerAndBody">
          <div className="toast-banner">
            <span>MESSAGE</span>
            <span>now</span>
          </div>
          <div className="toast-parent">
            <div className="toast-alert-text">&quot;{message}&quot;</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TimerCompleteToast;
