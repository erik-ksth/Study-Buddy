---
name: Study Buddy
description: A tactile, themed study workspace designed to protect student focus.
colors:
  cream-canvas: "#f3f2ef"
  cream-surface: "#faf8f5"
  cream-ink: "#4e1700"
  cream-accent: "#e3d6c5"
  cream-muted: "#9b624b"
  cream-strong: "#6e2700"
  midnight-canvas: "#1b1e2b"
  midnight-surface: "#242838"
  midnight-ink: "#e8e1d3"
  midnight-gold: "#c9a876"
  forest-ink: "#244c53"
  ocean-ink: "#1f4d79"
  sakura-ink: "#5f203d"
  sakura-blossom: "#f3ccd5"
typography:
  display:
    fontFamily: "Rochester, cursive"
    fontSize: "2.5rem"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "2px"
  title:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "1px"
  body:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "0.7rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.25px"
  label:
    fontFamily: "Roboto Slab, Georgia, serif"
    fontSize: "0.58rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.5px"
rounded:
  control-sm: "7px"
  control: "8px"
  inset: "10px"
  panel: "12px"
  popover: "14px"
  pill: "999px"
spacing:
  xs: "5px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  section: "28px"
components:
  button-primary:
    backgroundColor: "{colors.cream-ink}"
    textColor: "{colors.cream-canvas}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "10px 16px"
  button-secondary:
    backgroundColor: "{colors.cream-surface}"
    textColor: "{colors.cream-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "7px 10px"
  panel:
    backgroundColor: "{colors.cream-canvas}"
    textColor: "{colors.cream-ink}"
    rounded: "{rounded.panel}"
    padding: "20px"
  text-field:
    backgroundColor: "{colors.cream-surface}"
    textColor: "{colors.cream-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "12px 13px"
---

# Design System: Study Buddy

## Overview

**Creative North Star: "The Quiet Study Desk"**

Study Buddy should feel like a carefully arranged personal desk: useful objects are close at hand, each tool has a clear place, and the atmosphere supports concentration. The interface is cozy and tactile rather than sterile, with themed scenery, stationery-like surfaces, framed utilities, and compact controls that feel physical without becoming toy-like.

Visual character must always serve focus. Decorative theme art belongs behind the work surface; content stays legible and interaction paths stay familiar. The system explicitly rejects cluttered, distracting, awkward, and visually generic interfaces, including recognizable generic-AI dashboard patterns.

**Key Characteristics:**

- Five cohesive environments built from the same semantic color roles.
- Crisp outlines and offset shadows that make tools feel like desk objects.
- Rochester used sparingly for identity; Roboto Slab carries the working interface.
- Compact, direct controls with visible hover, active, focus, loading, error, and empty states.
- Responsive composition that stacks tools instead of shrinking them into unreadable miniatures.

## Colors

Each theme remaps the same semantic roles: canvas, surface, ink, border, soft accent, muted accent, strong accent, icon foreground, and error. Components must consume the CSS variables rather than hard-coded theme colors.

### Cream — Warm Notebook

- **Canvas** (`#f3f2ef`) and **Surface** (`#faf8f5`): the default paper layers.
- **Espresso Ink** (`#4e1700`): text, primary outlines, and strong controls.
- **Oat Accent** (`#e3d6c5`): selected rows and quiet emphasis.
- **Clay Muted** (`#9b624b`): secondary copy and inactive controls.
- **Burnt Umber** (`#6e2700`): focus rings and high-emphasis status.
- **Error** (`#8a1c0e`): validation and failure states only.

### Midnight — Midnight Library

- **Canvas** (`#1b1e2b`) and **Surface** (`#242838`): warm navy layers, never generic blue-black.
- **Parchment Ink** (`#e8e1d3`): primary text and borders.
- **Slate Accent** (`#343a4d`) and **Muted Periwinkle** (`#9098b0`): quiet surfaces and secondary text.
- **Reading-Lamp Gold** (`#c9a876`): focus and high-emphasis status.
- **Error** (`#ffb4ab`): readable warm error text.

### Forest — Forest Slate

- **Canvas** (`#f1f2f4`) and **Surface** (`#f7f8f9`): pale, neutral ground.
- **Deep Teal Ink** (`#244c53`): primary text, borders, focus, and identity.
- **Moss Gray** (`#6f7f7d`) and **Mist Accent** (`#d8dedf`): secondary information and selected surfaces.
- **Error** (`#7f231b`): restrained dark red.

### Ocean — Ocean Notebook

- **Canvas** (`#f7fbf9`) and **Surface** (`#ffffff`): airy, high-legibility ground.
- **Harbor Ink** (`#1f4d79`) and **Sea-Glass Border** (`#82bbdc`): primary structure.
- **Pale Tide** (`#d7edf8`), **Horizon Blue** (`#5f90af`), and **Deep Water** (`#1d5c84`): state hierarchy.
- **Error** (`#9b1c1f`): high-contrast red.

### Sakura — Sakura Study

- **Canvas** (`#fff5f5`) and **Surface** (`#fffafa`): blossom-tinted paper.
- **Plum Ink** (`#5f203d`) and **Berry Border** (`#8f3e5c`): primary structure.
- **Blossom Accent** (`#f3ccd5`), **Rose Muted** (`#95516b`), and **Deep Berry** (`#8b3155`): selected, secondary, and focus states.
- **Error** (`#9b1c3b`): deep rose-red.

**The Semantic Theme Rule.** New components use the existing `--color-*` roles so every interaction remains coherent across all five environments. Never design a component for Cream and patch the other themes afterward.

**The Focus Color Rule.** Strong accents indicate selection, focus, status, or a primary action. They are not ambient decoration.

## Typography

**Display Font:** Rochester (cursive fallback)

**Body Font:** Roboto Slab (Georgia, serif fallback)

**Character:** Rochester gives Study Buddy its handwritten signature; Roboto Slab gives the working interface a calm, notebook-like texture with enough structure for dense controls.

### Hierarchy

- **Display** (400, `2.5rem`, 1.1): the Study Buddy identity only. Do not use it inside tools, dialogs, or forms.
- **Title** (600, `1rem`, 1.2): major tool and section headings.
- **Component heading** (600–700, `0.72rem–0.9rem`, 1.2–1.35): window titles, dialogs, and panels.
- **Body** (400, `0.64rem–0.7rem`, 1.45–1.5): instructions, notes, and supporting content; long prose stays within 65–75 characters per line.
- **Label** (600–700, `0.5rem–0.6rem`, 0.2–0.8px tracking): compact actions and metadata. Uppercase is reserved for framed window titles and timer modes.

**The One Signature Rule.** Rochester appears only where the brand is speaking. Every task-oriented control uses Roboto Slab.

## Elevation

Study Buddy uses a hybrid depth system. Persistent tools rely on dark, crisp offset shadows that resemble raised stationery or small desktop windows. Temporary panels use smaller offset or restrained soft shadows so their transient nature is clear. Tonal surface changes handle selected and hover states; elevation does not decorate inactive content.

### Shadow Vocabulary

- **Desktop panel** (`5px 6px 0 rgba(var(--color-shadow-rgb), 0.9)`): Apps and other persistent framed tools.
- **Floating window** (`6px 7px 0 rgba(var(--color-shadow-rgb), 0.9)`): draggable app windows.
- **Control lift** (`3px 3px 0 rgba(var(--color-shadow-rgb), 0.82)`): app icons and compact tactile actions.
- **Popover ambient** (`0 10px 24px rgba(var(--color-shadow-rgb), 0.2)`): time picker and similar lightweight overlays.
- **Notification panel** (`5px 5px 0 rgba(var(--color-shadow-rgb), 0.75)`): anchored utility panels.

**The Physical Hierarchy Rule.** Crisp offset shadows belong to persistent desk objects; soft shadows belong to temporary overlays. Never combine a wide decorative blur with an outlined card.

## Components

### Buttons

- **Shape:** compact rounded rectangle (`7–8px`); icon-only utility controls remain square, not pill-shaped.
- **Primary:** theme ink background, theme canvas text, `10px 16px` padding, and a strong label weight.
- **Secondary / quiet:** transparent or surface background with ink or muted text and a `7px 10px` compact footprint.
- **Hover / Focus / Active:** hover changes the tonal layer; focus uses a `3px` strong-accent outline; active motion is a `1–2px` physical press or a restrained `0.96–0.97` scale.
- **Disabled / Loading:** preserve labels, lower opacity, disable physical motion, and show an appropriate cursor.

### Cards / Containers

- **Corner Style:** `12px` for app panels and windows; `14px` only for compact popovers.
- **Background:** theme canvas for working surfaces and alternate surface for nested input areas.
- **Shadow Strategy:** use the named physical hierarchy; nested cards are avoided.
- **Border:** `1.5–2px` in the theme border role.
- **Internal Padding:** typically `18–24px`; dense toolbars use `7–14px`.

### Inputs / Fields

- **Style:** alternate surface, `1.5px` border, `8px` radius, Roboto Slab body text, and placeholders derived from theme ink rather than low-contrast gray.
- **Focus:** visible `3px` strong-accent outline or a clear border-color shift when the surrounding control supplies focus context.
- **Error / Disabled:** use the theme error role and supporting text; never rely on color alone.

### Navigation and Utility Controls

- Top-level utilities use compact framed buttons and collapse labels on small screens while preserving accessible names.
- Theme choices are circular swatches with a visible selected check and pressed state.
- Popovers anchor to their trigger, escape clipping with a portal, dismiss predictably, and keep explicit commit actions for destructive or data-changing choices.

### Framed Tool Windows

- App windows use a `12px` frame, semantic theme border, crisp offset shadow, and a themed title bar.
- Title bars may be draggable on pointer devices but must retain normal close and keyboard behavior.
- Windows open with a 150–220ms state transition using opacity and transform. Under reduced motion they appear without movement.
- On narrow screens, windows stay within a 12px viewport gutter and content stacks instead of compressing.

## Do's and Don'ts

### Do:

- **Do** protect the Timer and To-do list as the primary visual hierarchy; account and Apps surfaces remain supporting tools.
- **Do** use semantic `--color-*`, `--font-*`, and transition variables so components work across every theme.
- **Do** use `7–12px` radii for controls and persistent panels, with full pills only for badges, progress tracks, and switches.
- **Do** make keyboard focus visible with a `3px` strong-accent outline.
- **Do** keep common state transitions between 150ms and 220ms and respect `prefers-reduced-motion`.
- **Do** make locked, saving, saved, offline, loading, empty, and error states understandable without relying on color alone.
- **Do** preserve the tactile stationery and desktop-window motifs when adding authentication and synchronization UI.

### Don't:

- **Don't** make Study Buddy feel cluttered, distracting, awkward to use, or visually generic.
- **Don't** introduce generic-AI patterns such as gradient text, glass cards, decorative metric grids, oversized radii, or purple-blue SaaS gradients.
- **Don't** let theme art reduce contrast or compete with the active study task.
- **Don't** use Rochester for buttons, form fields, body copy, or application data.
- **Don't** hide keyboard focus or make functionality depend on hover, dragging, or animation.
- **Don't** stack card inside card; use spacing, dividers, and tonal surfaces to structure dense tools.
- **Don't** add decorative motion. Animation must explain state, location, or feedback.
