const DISCORD_INVITE_URL = "https://discord.gg/ZDgQbqMCxA";

function CommunityLink() {
  return (
    <a
      className="top-left-action community-launcher"
      href={DISCORD_INVITE_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Join the Study Buddy Discord community"
      title="Join the Study Buddy Discord"
    >
      <i className="fab fa-discord" aria-hidden="true" />
      <span>Community</span>
    </a>
  );
}

export default CommunityLink;
