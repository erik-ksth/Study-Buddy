import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import CalculatorApp from "./CalculatorApp";
import FlashcardsApp from "./FlashcardsApp";
import NotesApp from "./NotesApp";
import DraggableWindow from "./DraggableWindow";
import { useAuth } from "../../context/authState";
import { trackAppOpened, trackEvent } from "../../analytics";

const APPS = [
  { id: "calculator", label: "Calculator", icon: "calculator", width: 460, Component: CalculatorApp },
  { id: "notes", label: "Notes", icon: "quick-notes", width: 560, Component: NotesApp },
  { id: "flashcards", label: "Flashcards", icon: "flashcards", width: 500, Component: FlashcardsApp },
];

function initialPosition(index, preferredWidth) {
  const width = Math.min(preferredWidth, window.innerWidth - 24);
  const x = Math.max(12, Math.round((window.innerWidth - width) / 2 + index * 24 - 36));
  const y = Math.max(82, Math.round(window.innerHeight * 0.18 + index * 22));
  return { x, y };
}

function AppsSection() {
  const { user, requestSignIn } = useAuth();
  const [openApps, setOpenApps] = useState([]);
  const topZ = useRef(920);

  function nextZIndex() {
    topZ.current += 1;
    return topZ.current;
  }

  function launch(app, index) {
    if (!user) {
      trackEvent("app_access_blocked", {
        app_name: app.id,
        reason: "sign_in_required",
      });
      requestSignIn("Study apps");
      return;
    }

    const isAlreadyOpen = openApps.some((item) => item.id === app.id);
    if (isAlreadyOpen) {
      trackEvent("app_focused", { app_name: app.id, source: "launcher" });
    } else {
      trackAppOpened(app.id);
    }

    const nextZ = nextZIndex();
    setOpenApps((current) => {
      const open = current.find((item) => item.id === app.id);
      if (open) {
        return current.map((item) => (item.id === app.id ? { ...item, zIndex: nextZ } : item));
      }

      return [...current, { ...app, position: initialPosition(index, app.width), zIndex: nextZ }];
    });
  }

  function closeApp(id) {
    setOpenApps((current) => current.filter((app) => app.id !== id));
  }

  function focusApp(id) {
    const nextZ = nextZIndex();
    setOpenApps((current) =>
      current.map((app) => (app.id === id ? { ...app, zIndex: nextZ } : app)),
    );
  }

  function moveApp(id, position) {
    setOpenApps((current) =>
      current.map((app) => (app.id === id ? { ...app, position } : app)),
    );
  }

  useEffect(() => {
    function handleEscape(event) {
      if (event.key !== "Escape") return;
      setOpenApps((current) => {
        if (!current.length) return current;
        const top = current.reduce((highest, app) =>
          app.zIndex > highest.zIndex ? app : highest,
        );
        return current.filter((app) => app.id !== top.id);
      });
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, []);

  useEffect(() => {
    if (!user) setOpenApps([]);
  }, [user]);

  return (
    <>
      <section className="apps-panel" aria-labelledby="apps-title">
        <div className="apps-panel-heading">
          <h2 id="apps-title">Study apps</h2>
        </div>

        <div className="app-launcher-grid">
          {APPS.map((app, index) => {
            const isOpen = openApps.some((item) => item.id === app.id);
            return (
              <button
                className={`app-launcher${isOpen ? " app-launcher-open" : ""}${!user ? " app-launcher-locked" : ""}`}
                type="button"
                key={app.id}
                onClick={() => launch(app, index)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                aria-label={!user ? `Sign in to use ${app.label}` : app.label}
              >
                <span className="app-icon" aria-hidden="true">
                  <img
                    src={`/img/app-icons/${app.icon}.png`}
                    alt=""
                    draggable="false"
                    decoding="async"
                  />
                </span>
                <span>{app.label}</span>
                {!user && (
                  <span className="app-lock-badge" aria-hidden="true">
                    <i className="fas fa-lock" />
                  </span>
                )}
                {isOpen && <span className="app-open-dot" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>

      {createPortal(
        openApps.map(({ id, label, Component, position, zIndex }) => (
          <DraggableWindow
            key={id}
            appId={id}
            title={label}
            position={position}
            zIndex={zIndex}
            onClose={() => closeApp(id)}
            onFocus={() => focusApp(id)}
            onMove={(nextPosition) => moveApp(id, nextPosition)}
          >
            <Component />
          </DraggableWindow>
        )),
        document.body,
      )}
    </>
  );
}

export default AppsSection;
