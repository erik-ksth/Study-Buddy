import { useEffect, useRef, useState } from "react";
import { COMMUNITY_INVITE_COPY, DISCORD_INVITE_URL } from "../../config/community";

function CommunityLink() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") setIsOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="community-invite" ref={rootRef}>
      <button
        className="top-left-action community-launcher"
        type="button"
        aria-label="Community"
        aria-expanded={isOpen}
        aria-controls="community-invite-panel"
        onClick={() => setIsOpen((current) => !current)}
      >
        <i className="fab fa-discord" aria-hidden="true" />
        <span>Community</span>
      </button>

      {isOpen && (
        <aside
          className="community-invite-popover"
          id="community-invite-panel"
          aria-labelledby="community-invite-title"
        >
          <h2 id="community-invite-title">{COMMUNITY_INVITE_COPY.title}</h2>
          <p>{COMMUNITY_INVITE_COPY.thanks}</p>
          <p>{COMMUNITY_INVITE_COPY.invitation}</p>

          <div className="community-invite-actions">
            <a
              className="community-invite-join"
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
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
