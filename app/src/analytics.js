const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";
const PRIVATE_REPLAY_CONTENT = [
  ".task-input",
  ".mini-app-window-notes",
  ".mini-app-window-flashcards",
  "[data-analytics-sensitive]",
].join(", ");

let posthogClient = null;
let posthogLoadPromise = null;

function cleanParameters(parameters) {
  return Object.fromEntries(
    Object.entries(parameters).filter(
      ([, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
}

function getSessionBucket(completedSessions) {
  const count = Number(completedSessions) || 0;
  if (count <= 2) return String(count);
  if (count <= 4) return "3-4";
  if (count <= 9) return "5-9";
  return "10+";
}

export function initAnalytics() {
  if (typeof window === "undefined" || import.meta.env.DEV || posthogLoadPromise) return;

  const projectKey = import.meta.env.VITE_POSTHOG_KEY?.trim();
  if (!projectKey) return;

  posthogLoadPromise = import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(projectKey, {
        api_host: import.meta.env.VITE_POSTHOG_HOST?.trim() || DEFAULT_POSTHOG_HOST,
        defaults: "2026-05-30",
        autocapture: true,
        capture_pageview: "history_change",
        capture_pageleave: "if_capture_pageview",
        person_profiles: "identified_only",
        respect_dnt: true,
        ip: false,
        enable_recording_console_log: false,
        session_recording: {
          maskAllInputs: true,
          maskTextSelector: PRIVATE_REPLAY_CONTENT,
        },
      });
      posthogClient = posthog;
      return posthog;
    })
    .catch(() => null);
}

export function trackEvent(eventName, parameters = {}) {
  if (typeof window === "undefined" || import.meta.env.DEV) return;

  const cleanedParameters = cleanParameters(parameters);
  if (cleanedParameters.completed_sessions !== undefined) {
    cleanedParameters.session_bucket = getSessionBucket(cleanedParameters.completed_sessions);
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, cleanedParameters);
  }

  if (posthogClient) {
    posthogClient.capture(eventName, cleanedParameters);
  } else if (posthogLoadPromise) {
    posthogLoadPromise.then((posthog) => posthog?.capture(eventName, cleanedParameters));
  }
}

function normalizeAppId(appId) {
  return String(appId)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function trackAppOpened(appId) {
  const normalizedAppId = normalizeAppId(appId);
  if (!normalizedAppId) return;

  const parameters = { app_name: normalizedAppId };
  trackEvent("app_opened", parameters);
  trackEvent(`${normalizedAppId}_opened`, parameters);
}
