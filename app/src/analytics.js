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

export function trackEvent(eventName, parameters = {}) {
  if (typeof window === "undefined" || import.meta.env.DEV) return;
  if (typeof window.gtag !== "function") return;

  const cleanedParameters = cleanParameters(parameters);
  if (cleanedParameters.completed_sessions !== undefined) {
    cleanedParameters.session_bucket = getSessionBucket(cleanedParameters.completed_sessions);
  }

  window.gtag("event", eventName, cleanedParameters);
}
