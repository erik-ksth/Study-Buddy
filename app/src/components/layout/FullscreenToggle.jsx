import { useFullscreen } from "../../hooks/useFullscreen";

function FullscreenToggle() {
  const { isFullscreen, enterFullscreen, exitFullscreen } = useFullscreen();

  if (isFullscreen) {
    return (
      <button className="exit-full-screen-btn" onClick={exitFullscreen} title="Exit">
        <i className="fas fa-compress-alt" />
      </button>
    );
  }

  return (
    <button className="full-screen-btn" onClick={enterFullscreen} title="Expand">
      <i className="fas fa-expand-alt" />
    </button>
  );
}

export default FullscreenToggle;
