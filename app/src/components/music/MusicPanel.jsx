import MoodIcon from "./MoodIcon";
import VolumeControl from "./VolumeControl";
import { useMusicPlayer } from "../../hooks/useMusicPlayer";

function MusicPanel() {
  const {
    genres,
    selectedGenreId,
    isPlaying,
    volume,
    audioRef,
    selectMood,
    handleEnded,
    play,
    pause,
    changeVolume,
    toggleMute,
  } = useMusicPlayer();

  return (
    <div className="music-row">
      <div className="main-mood-container">
        {genres.map((genre) => (
          <MoodIcon
            key={genre.id}
            genre={genre}
            isSelected={genre.id === selectedGenreId}
            onClick={() => selectMood(genre.id)}
          />
        ))}
        <audio ref={audioRef} onEnded={handleEnded} className="audioSource">
          Your browser does not support the audio element.
        </audio>
      </div>

      <VolumeControl
        volume={volume}
        isPlaying={isPlaying}
        onChangeVolume={changeVolume}
        onToggleMute={toggleMute}
        onPlay={play}
        onPause={pause}
      />
    </div>
  );
}

export default MusicPanel;
