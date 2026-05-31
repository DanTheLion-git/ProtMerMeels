# Pròt mèr Mééls

A touch-table language trainer that teaches the **Mééls** dialect (the dialect of
Meijel), Dutch → Mééls, Duolingo-style. Built as a Windows desktop app for the
central touch-screen table at the **Medelo Museum** in Meijel, in partnership with
*Heemkundevereniging Medelo* and the *Pròt mèr Mééls* foundation.

A museum visitor can drop in, play a short self-contained lesson for a few minutes,
chase a high score, and wander off again. No login, no accounts, big tap targets, and
it returns to the attract screen automatically when left idle. Styled to match the
museum house style (white + heather-purple) of the "De geschiedenis van Meijel"
timeline wall.

> **Status:** working prototype. All Mééls translations are **best-effort and flagged
> for review** — a Meijel native speaker must approve them (see
> [`CONTENT_REVIEW.md`](CONTENT_REVIEW.md)) and record the voice-acting before the
> table goes public.

---

## Quick start (development)

Requires [Node.js](https://nodejs.org/) (18+).

```sh
npm install
npm start          # windowed dev mode
npm run kiosk      # fullscreen kiosk mode, like the real table
```

## Build the Windows app

```sh
npm run build:win
```

Produces a self-contained folder `release/ProtMerMeels-win32-x64/` — copy it to the
museum PC and run **`ProtMerMeels.exe`** (launches fullscreen kiosk).

> **Why not a single-file installer?** The usual `electron-builder` packager
> (`npm run dist`) needs Windows symlink privilege to unpack its code-signing helper,
> which fails unless *Developer Mode* (or admin) is enabled. `build:win`
> (electron-packager) avoids that and starts faster — better for a kiosk anyway.

---

## What's in it

**Four subjects, four short lessons each (16 total):**

| Subject | Teaches |
|---|---|
| **Goojendaag — begroeten** | Greetings & courtesy |
| **De Méélse -j (mouillering)** | The signature feature: the *-j* after *ei/ij/ui* (*husj*, *titj*, *géétj*) — all 16 documented forms |
| **Femilie en mènse** | Family & people |
| **In ’t dörp** | Village & everyday life |

**Exercise types** (all tap-only — no keyboard needed): multiple choice, match pairs,
listen-and-pick, word bank, and the mouillering spelling picker. Because Mééls is close
to Dutch, multiple-choice options are deliberately confusable — the correct word, two
*similar real* words, and one *plausible-but-fake* form.

**Relaxed museum mode:** wrong answers never end a lesson — the visitor just tries again.

### High scores

Each lesson run is scored on **accuracy + speed**. A great run makes the subject's
**top-5 leaderboard**; the visitor enters three initials on an on-screen keypad.
Leaderboards are stored on the machine (localStorage in the app's userData) and **persist
across visitors and restarts** — only the per-visitor session resets on idle. Each home
panel shows that subject's best score.

---

## Editing the content

All lesson content lives in **[`content/course.json`](content/course.json)** — one file,
no code. The `vocab` block is the shared word bank; `units → lessons → exercises`
reference vocab by id.

```json
"huis": { "nl": "huis", "meels": "husj", "audio": null, "status": "review",
          "distractors": ["huis","husje"], "near": ["huusj"] }
```

- `distractors` — wrong options for the **mouillering** exercise.
- `near` — a plausible-but-fake form used as the trap option in **multiple choice**.

After editing, sanity-check it:

```sh
node -e "JSON.parse(require('fs').readFileSync('content/course.json','utf8'));console.log('OK')"
```

### Native-speaker review workflow

1. A Meijel speaker works through [`CONTENT_REVIEW.md`](CONTENT_REVIEW.md) and corrects
   each proposed Mééls word.
2. Apply corrections in `content/course.json` and change that entry's
   `"status": "review"` → `"approved"`.

In development a small red banner shows how many terms still need review. It is hidden
automatically in the packaged kiosk build.

### Adding voice-acting audio

When clips are recorded, save each as an `.mp3` in `assets/audio/` and set the entry's
`audio` field (e.g. `"audio": "husj.mp3"`). No code changes. Until then, listen-exercises
fall back gracefully (they reveal the written Mééls word).

---

## Images (placeholders to replace)

Drop-in art lives in `assets/img/`. The committed files are **labeled placeholders** —
replace them with the real artwork at the same paths/sizes:

| File | Size | Used for |
|---|---|---|
| `assets/img/subjects/greetings.png` | 1080×720 (3:2) | subject card (home panel); mostly white with a drawing — title + score overlay on top |
| `assets/img/subjects/mouillering.png` | 1080×720 | subject card |
| `assets/img/subjects/family.png` | 1080×720 | subject card |
| `assets/img/subjects/village.png` | 1080×720 | subject card |
| `assets/img/turfsteker.png` | 720×1500 | the **Turfsteker** mascot (right of the menu) |
| `assets/img/background.png` *(optional)* | full-screen | menu background; if absent, the background is white (house style) |

The Turfsteker is an animated viseme-talking drawing — once added, the mascot slot can
later be wired to `audio.js` so he speaks the sentences.

---

## Running on the museum table

- **Auto-start:** put a shortcut to `ProtMerMeels.exe` in `shell:startup`. The app
  starts fullscreen, hides chrome, and only one copy runs at a time.
- **Staff exit:** press and hold the **top-left corner for 3 seconds**.
- **Idle reset:** after 75 s without a touch, returns to the attract screen and resets
  the visitor's progress (not the leaderboards). Adjust `IDLE_MS` in `src/renderer/js/app.js`.
- **Deep-links (optional, e.g. for an attract loop):**
  `#subject=<unitId>` opens a subject; `#go=<unitId>/<lessonId>` opens a lesson.
- **Dev/QA env flags** (never set in production): `PMM_DEV_SCORES=1` seeds a demo
  leaderboard; `PMM_DEV_CLEAR=1` wipes all stored scores; `PMM_HASH=...` sets a deep-link;
  `PMM_KIOSK`/`--kiosk` force kiosk mode in dev.

---

## Project layout

```
src/main/        Electron main process (kiosk window, logging, crash-recovery)
src/renderer/    The app UI
  js/app.js          router + session state + idle + exit gesture + bg probe
  js/engine.js       builds each lesson's exercise queue (incl. confusable distractors)
  js/highscore.js    localStorage top-5 leaderboard per subject
  js/leaderboard.js  shared leaderboard widget
  js/util.js         DOM helpers + word-similarity (Levenshtein) + nearMiss
  js/exercises/      the five tap-only exercise types
  js/screens/        home (subject grid), subject (lessons + leaderboard), lesson, complete
  css/styles.css     museum house-style theme
content/course.json  ← all editable lesson content
assets/img/          ← subject heroes, mascot, optional background
assets/audio/        ← drop voice-acting .mp3s here
```

Built with [Electron](https://www.electronjs.org/). Plain ES-module JS/HTML/CSS — no UI build step.

---

*The Lions Alliance · Experiences pillar · Museum Medelo, Meijel*
