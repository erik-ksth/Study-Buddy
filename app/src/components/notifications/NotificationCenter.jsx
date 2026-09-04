import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../../context/NotificationContext";

const DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
});

function formatNotificationTime(value) {
  const date = new Date(value);
  const today = new Date();
  const sameDay = date.toDateString() === today.toDateString();

  if (sameDay) {
    return new Intl.DateTimeFormat(undefined, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }
  return DATE_FORMATTER.format(date);
}

function PreferenceSwitch({ checked, disabled = false, label, description, onChange }) {
  return (
    <label className={`notification-setting${disabled ? " notification-setting-disabled" : ""}`}>
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="notification-switch" aria-hidden="true" />
    </label>
  );
}

function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState("");
  const rootRef = useRef(null);
  const {
    items,
    unreadCount,
    preferences,
    desktopSupport,
    desktopPermission,
    markAsRead,
    markAllAsRead,
    updatePreference,
    requestDesktopAlerts,
  } = useNotifications();

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  async function handleDesktopAlerts(nextChecked) {
    setPermissionMessage("");
    if (!nextChecked) {
      updatePreference("desktopAlerts", false);
      return;
    }

    const result = await requestDesktopAlerts();
    if (result === "denied") {
      setPermissionMessage("Desktop alerts are blocked in your browser settings.");
    } else if (result === "unsupported") {
      setPermissionMessage("This browser doesn’t support desktop alerts.");
    }
  }

  const desktopDescription =
    desktopPermission === "denied"
      ? "Blocked in browser settings"
      : "Show timer updates outside this tab";

  return (
    <div className="notification-center" ref={rootRef}>
      <button
        className="top-left-action notification-trigger"
        type="button"
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-controls="notification-panel"
        onClick={() => setOpen((current) => !current)}
      >
        <i className="fa-regular fa-bell" aria-hidden="true" />
        <span className="top-left-action-label">Updates</span>
        {unreadCount > 0 && (
          <span className="notification-badge" aria-hidden="true">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <section
          className="notification-panel"
          id="notification-panel"
          aria-label="Notifications"
        >
          <header className="notification-panel-header">
            <div>
              <h2>Notifications</h2>
              <p>{unreadCount ? `${unreadCount} unread` : "You’re all caught up"}</p>
            </div>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </header>

          <div className="notification-list" aria-live="polite">
            {items.length === 0 ? (
              <div className="notification-empty">
                <i className="fa-regular fa-bell-slash" aria-hidden="true" />
                <strong>Nothing new yet</strong>
                <span>Timer updates and Study Buddy news will appear here.</span>
              </div>
            ) : (
              items.map((item) => (
                <button
                  className={`notification-item${item.read ? "" : " notification-item-unread"}`}
                  key={item.id}
                  type="button"
                  onClick={() => markAsRead(item.id)}
                >
                  <span className={`notification-type-icon notification-type-${item.type}`}>
                    <i
                      className={item.type === "timer" ? "fa-regular fa-clock" : "fa-solid fa-bullhorn"}
                      aria-hidden="true"
                    />
                  </span>
                  <span className="notification-copy">
                    <span className="notification-item-heading">
                      <strong>{item.title}</strong>
                      <time dateTime={item.publishedAt}>{formatNotificationTime(item.publishedAt)}</time>
                    </span>
                    <span>{item.message}</span>
                  </span>
                  {!item.read && <span className="notification-unread-dot" aria-label="Unread" />}
                </button>
              ))
            )}
          </div>

          <div className="notification-preferences">
            <h3>Alert preferences</h3>
            <PreferenceSwitch
              label="Desktop alerts"
              description={desktopDescription}
              checked={preferences.desktopAlerts && desktopPermission === "granted"}
              disabled={!desktopSupport || desktopPermission === "denied"}
              onChange={handleDesktopAlerts}
            />
            <PreferenceSwitch
              label="Timer updates"
              description="Save completed sessions in this inbox"
              checked={preferences.timerAlerts}
              onChange={(value) => updatePreference("timerAlerts", value)}
            />
            <PreferenceSwitch
              label="Completion sound"
              description="Play a sound when a timer ends"
              checked={preferences.sounds}
              onChange={(value) => updatePreference("sounds", value)}
            />
            {permissionMessage && <p className="notification-permission-note">{permissionMessage}</p>}
          </div>
        </section>
      )}
    </div>
  );
}

export default NotificationCenter;
