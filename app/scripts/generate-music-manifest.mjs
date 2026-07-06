#!/usr/bin/env node
// Scans public/music/<genre>/ and writes public/music/manifest.json.
// Playlists are always derived from files actually on disk (extension always
// stripped by this script, never hand-typed), so a filename typo or a stray
// extension baked into a playlist string can't happen — add music by dropping
// an mp3 in the right genre folder and re-running this (or `npm run dev`/`build`,
// which do it automatically).
import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const musicDir = join(__dirname, "..", "public", "music");
const manifestPath = join(musicDir, "manifest.json");

// The only hand-maintained piece: metadata the filesystem can't infer. A
// mistake here only affects a label/icon, never playback.
const GENRE_META = [
  { dir: "lofi", id: "lofi", label: "lo-fi", icon: "lofi" },
  { dir: "jazz", id: "jazz", label: "jazz", icon: "jazz" },
  { dir: "piano", id: "piano", label: "piano", icon: "piano" },
  { dir: "classical", id: "classical", label: "classical", icon: "classical" },
  { dir: "acoustic", id: "acoustic", label: "acoustic", icon: "acoustic" },
  { dir: "kalimba", id: "kalimba", label: "kalimba", icon: "kalimba" },
  { dir: "k-pop", id: "k-pop", label: "k-pop", icon: "k-pop" },
  { dir: "cafe", id: "cafe", label: "cafe", icon: "cafe" },
  { dir: "library", id: "library", label: "library", icon: "library" },
  { dir: "nature", id: "nature", label: "nature", icon: "nature" },
];

function findMp3sRecursive(dir) {
  return readdirSync(dir, { recursive: true })
    .filter((entry) => extname(entry).toLowerCase() === ".mp3")
    .filter((entry) => statSync(join(dir, entry)).isFile())
    .sort();
}

function stripExtension(entry) {
  return entry.slice(0, entry.length - extname(entry).length);
}

const genres = GENRE_META.map((meta) => {
  const genreDir = join(musicDir, meta.dir);
  const playlist = findMp3sRecursive(genreDir).map(stripExtension);
  return { ...meta, playlist };
});

const manifest = { generatedAt: new Date().toISOString(), genres };
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const totalTracks = genres.reduce((sum, g) => sum + g.playlist.length, 0);
console.log(`Generated music/manifest.json: ${genres.length} genres, ${totalTracks} tracks.`);
