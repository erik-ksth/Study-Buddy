import { createContext, useCallback, useContext, useMemo } from "react";
import { PRODUCT_ANNOUNCEMENTS } from "../data/notifications";
import { useLocalStorage } from "../hooks/useLocalStorage";

const NotificationContext = createContext(null);

const DEFAULT_PREFERENCES = {
  desktopAlerts: false,
  timerAlerts: true,
  sounds: true,
};

function supportsDesktopNotifications() {
  return typeof window !== "undefined" && "Notification" in window;
}

function makeNotificationId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `notification-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function mergeAnnouncements(savedItems) {
  const savedById = new Map(savedItems.map((item) => [item.id, item]));
  const announcements = PRODUCT_ANNOUNCEMENTS.map((announcement) => ({
    ...announcement,
    read: savedById.get(announcement.id)?.read ?? false,
  }));
  const announcementIds = new Set(PRODUCT_ANNOUNCEMENTS.map(({ id }) => id));
  const personalItems = savedItems.filter((item) => !announcementIds.has(item.id));

  return [...personalItems, ...announcements]
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
    .slice(0, 40);
}

export function NotificationProvider({ children }) {
  const [storedItems, setStoredItems] = useLocalStorage("studyBuddyNotifications", []);
  const [preferences, setPreferences] = useLocalStorage(
    "studyBuddyNotificationPreferences",
    DEFAULT_PREFERENCES,
  );
  const items = useMemo(() => mergeAnnouncements(storedItems), [storedItems]);

  const addNotification = useCallback(
    ({ title, message, type = "timer" }) => {
      const nextItem = {
        id: makeNotificationId(),
        title,
        message,
        type,
        publishedAt: new Date().toISOString(),
        read: false,
      };
      setStoredItems((current) => mergeAnnouncements([nextItem, ...current]));
      return nextItem;
    },
    [setStoredItems],
  );

  const markAsRead = useCallback(
    (id) => {
      setStoredItems((current) =>
        mergeAnnouncements(current).map((item) =>
          item.id === id ? { ...item, read: true } : item,
        ),
      );
    },
    [setStoredItems],
  );

  const markAllAsRead = useCallback(() => {
    setStoredItems((current) =>
      mergeAnnouncements(current).map((item) => ({ ...item, read: true })),
    );
  }, [setStoredItems]);

  const updatePreference = useCallback(
    (key, value) => {
      setPreferences((current) => ({ ...DEFAULT_PREFERENCES, ...current, [key]: value }));
    },
    [setPreferences],
  );

  const requestDesktopAlerts = useCallback(async () => {
    if (!supportsDesktopNotifications()) return "unsupported";

    const permission = await Notification.requestPermission();
    updatePreference("desktopAlerts", permission === "granted");
    return permission;
  }, [updatePreference]);

  const sendDesktopNotification = useCallback(
    (title, message) => {
      if (
        preferences.desktopAlerts &&
        supportsDesktopNotifications() &&
        Notification.permission === "granted"
      ) {
        new Notification(title, {
          body: message,
          icon: "/img/lamp.svg",
          tag: "study-buddy-timer",
        });
      }
    },
    [preferences.desktopAlerts],
  );

  const value = useMemo(
    () => ({
      items,
      unreadCount: items.filter((item) => !item.read).length,
      preferences: { ...DEFAULT_PREFERENCES, ...preferences },
      desktopSupport: supportsDesktopNotifications(),
      desktopPermission: supportsDesktopNotifications() ? Notification.permission : "unsupported",
      addNotification,
      markAsRead,
      markAllAsRead,
      updatePreference,
      requestDesktopAlerts,
      sendDesktopNotification,
    }),
    [
      items,
      preferences,
      addNotification,
      markAsRead,
      markAllAsRead,
      updatePreference,
      requestDesktopAlerts,
      sendDesktopNotification,
    ],
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotifications must be used within NotificationProvider");
  return context;
}
