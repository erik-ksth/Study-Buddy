function VolumeControl({ volume, isPlaying, onChangeVolume, onToggleMute, onPlay, onPause }) {
  return (
    <div className="volume-slider-container">
      <i
        className={`fas ${volume === 0 ? "fa-volume-mute" : "fa-volume-up"} volumeIcon audioIcon`}
        onClick={onToggleMute}
      />
      <input
        id="volumeSlider"
        type="range"
        min="0"
        max="100"
        value={volume}
        onChange={(e) => onChangeVolume(Number(e.target.value))}
      />
      <div className="playPauseBtn">
        <i
          className="fas fa-pause audioIcon"
          style={{ display: isPlaying ? "inline" : "none" }}
          onClick={onPause}
        />
        <i
          className="fas fa-play audioIcon"
          style={{ display: isPlaying ? "none" : "inline" }}
          onClick={onPlay}
        />
      </div>
    </div>
  );
}

export default VolumeControl;
