# Nocturne — Focus

A one-screen pomodoro timer built to the Nocturne design system: a quiet
dark ground, Inter with a weight-300 countdown, outlined buttons, and six
procedural animated backdrops — no image assets.

Built with Vite + React + TypeScript.

## Run

```sh
npm install
npm run dev        # dev server
npm run build      # type-check + production build to dist/
npm run preview    # serve the production build
```

`node scripts/verify-timer.mjs <url>` runs functional checks against a
served build (uses the preinstalled Chromium via playwright-core).

## How the timer works

The engine never accumulates ticks. A running phase is a single `endAt`
timestamp; remaining time, ring progress and focus-seconds all derive from
`Date.now()` against it, so tab throttling, dropped frames or a suspended
page cannot drift the countdown. A dedicated-worker heartbeat keeps
completion firing in hidden tabs (worker timers aren't throttled), pages
returning from suspension catch up by chaining completions from the stored
`endAt`, and completion posts a Notification when the app isn't focused.

Sessions completed, seconds focused today (reset on day change), the last
12 log entries and the chosen backdrop persist in `localStorage`.

Configurable values (focus 25 / short 5 / long 15 / auto-continue / glow /
daily goal 8) live in `src/settings.ts`, not in the views.

Keyboard: `Space` start/pause · `R` reset · `S` skip.

## Design handoff files

The handoff arrived at the repo root with scrambled file names. The actual
contents:

| File | Actual content |
| --- | --- |
| `support.js` | the HTML design prototype ("Focus Timer.dc.html") |
| `1-aurora.png` | the Nocturne design-system guide (markdown) |
| `2-stars.png` | the Nocturne design-system token sheet (CSS) |
| `README (1).md`, `ios-frame.jsx`, `Focus Timer.dc.html`, `4-embers.png`, `5-rain.png`, `6-ripple.png` | the six screen screenshots (JPEG) |
| `styles.css` | an empty design-tool bundle stub |

The tokens are ported to `src/styles/nocturne.css`; the prototype's
measurements, gradients and keyframe timings are reproduced in
`src/styles/app.css` and `src/styles/backdrops.css`.
