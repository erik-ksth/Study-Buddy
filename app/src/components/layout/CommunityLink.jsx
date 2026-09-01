import { useEffect, useState } from "react";
import { COMMUNITY_INVITE_COPY, DISCORD_INVITE_URL } from "../../config/community";
import { useStudyStats } from "../../context/StudyStatsContext";

const COMMUNITY_INVITE_SEEN_KEY = "studyBuddy:discord-invite:v1:seen";
const REQUIRED_SESSIONS = 3;

function hasSeenCommunityInvite() {
  try {
    return Boolean(localStorage.getItem(COMMUNITY_INVITE_SEEN_KEY));
  } catch {
    return false;
  }
}

function markCommunityInviteSeen(completedSessions) {
  try {
    localStorage.setItem(
      COMMUNITY_INVITE_SEEN_KEY,
      JSON.stringify({ shownAt: new Date().toISOString(), completedSessions }),
    );
  } catch {
    // If storage is unavailable, keep the invite dismissible for this visit.
  }
}

function CommunityLink() {
  const { stats } = useStudyStats();
  const [isOpen, setIsOpen] = useState(false);
  // Taking this snapshot on mount ensures session three never interrupts the
  // current study visit. The invitation can appear when the user comes back.
  const [wasEligibleOnArrival] = useState(
    () => (Number(stats.totalPomodoros) || 0) >= REQUIRED_SESSIONS,
  );
  const isForcedPreview =
    import.meta.env.DEV && new URLSearchParams(window.location.search).has("communityInvitePreview");

  useEffect(() => {
    if ((!wasEligibleOnArrival && !isForcedPreview) || (!isForcedPreview && hasSeenCommunityInvite())) {
      return undefined;
    }

    const openTimer = window.setTimeout(
      () => {
        // Give onboarding and post-session feedback priority. If either is
        // active, try the community invitation again on a future visit.
        if (document.visibilityState !== "visible" || document.querySelector("dialog[open]")) {
          return;
        }

        // Hovering or focusing the Community button may have shown the message
        // before this timer finished. In that case, do not reopen it.
        if (!isForcedPreview && hasSeenCommunityInvite()) return;

        if (!isForcedPreview) {
          markCommunityInviteSeen(Number(stats.totalPomodoros) || 0);
        }
        setIsOpen(true);
      },
      isForcedPreview ? 250 : 2800,
    );

    return () => window.clearTimeout(openTimer);
  }, [isForcedPreview, stats.totalPomodoros, wasEligibleOnArrival]);

  function showCommunityInvite() {
    if (!isForcedPreview && !hasSeenCommunityInvite()) {
      markCommunityInviteSeen(Number(stats.totalPomodoros) || 0);
    }
    setIsOpen(true);
  }

  return (
    <div
      className="community-invite"
      onMouseEnter={showCommunityInvite}
      onFocusCapture={showCommunityInvite}
    >
      <a
        className="top-left-action community-launcher"
        href={DISCORD_INVITE_URL}
        target="_blank"
        rel="noreferrer"
        aria-label="Join the Study Buddy Discord community"
        aria-expanded={isOpen}
        title="Join the Study Buddy Discord"
      >
        <i className="fab fa-discord" aria-hidden="true" />
        <span>Community</span>
      </a>

      {isOpen && (
        <aside
          className="community-invite-popover"
          aria-labelledby="community-invite-title"
          aria-live="polite"
        >
          <button
            className="community-invite-close"
            type="button"
            aria-label="Dismiss Discord invitation"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>

          <h2 id="community-invite-title">{COMMUNITY_INVITE_COPY.title}</h2>
          <p>{COMMUNITY_INVITE_COPY.thanks}</p>
          <p>{COMMUNITY_INVITE_COPY.invitation}</p>

          <div className="community-invite-actions">
            <a
              className="community-invite-join"
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fab fa-discord" aria-hidden="true" />
              Join the Discord
            </a>
          </div>
        </aside>
      )}
    </div>
  );
}

export default CommunityLink;
