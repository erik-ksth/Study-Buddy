#!/usr/bin/env node
// Regenerates public/img/cursor/<theme>/*.png from the base cursor artwork,
// tinted to each theme's ink color. Rerun this after adding a new theme (add
// its ink color to THEME_INK below) or after editing the base cursor art in
// public/img/cursor/cream/ (the source of truth — it's also just the Cream
// theme's own copy, since Cream needs no recoloring).
import { readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const cursorDir = join(__dirname, "..", "public", "img", "cursor");
const sourceDir = join(cursorDir, "cream");

// Keep in sync with the --color-icon value for each theme in src/styles/themes.css.
const THEME_INK = {
  midnight: [232, 225, 211],
  forest: [47, 74, 47],
  ocean: [31, 61, 74],
};

async function recolor(inputPath, outputPath, [r, g, b]) {
  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] > 0) {
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
    }
  }

  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toFile(outputPath);
}

const states = readdirSync(sourceDir).filter((f) => f.endsWith(".png"));

for (const [theme, color] of Object.entries(THEME_INK)) {
  for (const state of states) {
    await recolor(join(sourceDir, state), join(cursorDir, theme, state), color);
  }
}

console.log(
  `Generated ${states.length} cursor(s) x ${Object.keys(THEME_INK).length} theme(s) in ${cursorDir}`,
);
