import { useEffect, useRef, useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

// Picks a random track index, re-rolling once (not looped) if it matches the
// one just played — same pattern as the quotes pool, so repeats stay rare
// without any unbounded-loop risk on a short playlist.
function pickRandomIndex(length, exclude) {
  const first = Math.floor(Math.random() * length);
  if (length <= 1 || first !== exclude) return first;
  return Math.floor(Math.random() * length);
}

export function useMusicPlayer() {
  const [manifest, setManifest] = useState(null);
  const [selectedGenreId, setSelectedGenreId] = useState(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useLocalStorage("volumeSlider", 60);
  const [muted, setMuted] = useState(false);

  const audioRef = useRef(null);

  useEffect(() => {
    fetch("/music/manifest.json")
      .then((res) => res.json())
      .then(setManifest)
      .catch((err) => console.warn("Could not load music manifest:", err));
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = (muted ? 0 : volume) / 100;
    }
  }, [volume, muted]);

  function genreById(id) {
    return manifest?.genres.find((g) => g.id === id);
  }

  function playTrack(genre, index) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = `/music/${genre.dir}/${genre.playlist[index]}.mp3`;
    audio.play();
    setIsPlaying(true);
  }

  function selectMood(genreId) {
    const genre = genreById(genreId);
    if (!genre || genre.playlist.length === 0) return;

    if (genreId === selectedGenreId) {
      const nextIndex = pickRandomIndex(genre.playlist.length, trackIndex);
      setTrackIndex(nextIndex);
      playTrack(genre, nextIndex);
    } else {
      const startIndex = pickRandomIndex(genre.playlist.length);
      setSelectedGenreId(genreId);
      setTrackIndex(startIndex);
      playTrack(genre, startIndex);
    }
  }

  function handleEnded() {
    const genre = genreById(selectedGenreId);
    if (!genre) return;
    const nextIndex = pickRandomIndex(genre.playlist.length, trackIndex);
    setTrackIndex(nextIndex);
    playTrack(genre, nextIndex);
  }

  function play() {
    audioRef.current?.play();
    setIsPlaying(true);
  }

  function pause() {
    audioRef.current?.pause();
    setIsPlaying(false);
  }

  const effectiveVolume = muted ? 0 : volume;

  // The original has no real "muted" flag — it just checks whether the slider
  // is currently at 0 and toggles accordingly. Mirrored here: toggling looks
  // at the *effective* (displayed) volume, not the muted flag alone, so a
  // slider manually dragged to 0 behaves the same as clicking mute.
  function toggleMute() {
    if (effectiveVolume > 0) {
      setMuted(true);
    } else {
      setMuted(false);
      if (volume < 5) setVolume(10);
    }
  }

  function changeVolume(nextVolume) {
    setMuted(false);
    setVolume(nextVolume);
  }

  return {
    genres: manifest?.genres ?? [],
    selectedGenreId,
    isPlaying,
    volume: effectiveVolume,
    audioRef,
    selectMood,
    handleEnded,
    play,
    pause,
    changeVolume,
    toggleMute,
  };
}
