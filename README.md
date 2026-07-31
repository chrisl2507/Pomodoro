# span_

trace your attention

A Pomodoro timer for Google Play and the App Store, positioned as
observability for your attention: the timer is the data-collection
instrument; the insights are the product. Spec and data model live in
`docs/span/` — `span-design-spec.md` and `span-schema-and-insights.sql`
(the source of truth for the schema and the seven insight queries).

Stack: Vite + React + TypeScript, wrapped with Capacitor for the store
builds. Local-first — on-device SQLite, no backend, no accounts, no
network calls.

## Develop (browser)

```sh
npm install
npm run dev        # http://localhost:5173 — sql.js/IndexedDB data layer
npm run build      # type-check + production build
npm run preview    # serve the production build
```

`node scripts/verify-span.mjs <url>` runs 12 functional checks (engine,
event log, relaunch recovery, SQL views) against a served build using the
preinstalled Chromium.

## Native builds

Requires Android Studio and/or Xcode on the building machine:

```sh
npm run android    # build web, cap sync, open Android Studio
npm run ios        # build web, cap sync, open Xcode
```

On device the app uses `@capacitor-community/sqlite` for storage and
`@capacitor/local-notifications` for completion alerts: a notification is
OS-scheduled for `endAt` the moment a session starts (cancelled on pause),
so completion fires even if the app is suspended or killed. On relaunch
the engine replays the open session's events and resumes — or completes —
exactly where the wall clock says. Known v1 quirk: on Android, finishing a
session with the app foregrounded shows the scheduled notification too.

Backup is platform-native (Android Auto Backup via `allowBackup`; iOS
device backup covers the app container), and the Insights screen exports
the events table to the clipboard as JSON or CSV — the event log is the
backup format. The app requests no `INTERNET` permission on Android:
local-first is verifiable at install time. Exact-alarm permissions
(`USE_EXACT_ALARM` for 14+, `SCHEDULE_EXACT_ALARM` for 12–13) keep
completion notifications on time.

App icons and splash screens are generated from `assets/` (the spec's
`s_` monogram on the accent tile) via `npx capacitor-assets generate`.
They're programmatic renders of JetBrains Mono — good enough to ship a
beta; the spec ultimately wants optically corrected outlines from design.
The iOS alternate icon (paid-tier perk) is not yet implemented.

## Architecture

- `src/db/schema.ts` — runtime copy of the handoff schema. Append-only
  `events` table is the only thing written; sessions, stats and insights
  derive by query (`sessions` / `session_pauses` views).
- `src/db/db.ts` — the `SpanDb` seam: sql.js persisted to IndexedDB on
  web, the Capacitor SQLite plugin on device.
- `src/db/queries.ts` — the seven insight queries, verbatim, typed.
- `src/useTimer.ts` — the engine. A running phase is one `endAt`
  timestamp; remaining time derives from `Date.now()` against it (no
  accumulated ticks, no drift). A launch janitor appends `abandon` to
  stale in-progress sessions.
- `src/ui/` — Focus and Insights screens. Insights sit behind
  `FLAGS.insights` (`src/settings.ts`) — the intended paid boundary, not
  yet finalised. Insight sentences render only past their n ≥ 5 floor.
- `src/brand.ts` + `capacitor.config.ts` — the only two files a rename
  touches (trademark checks pending).
- Design rules (`src/styles/span.css`): dark-first with paper mode,
  mono for every numeral, two weights, accent reserved for live data,
  green for positive stat arrows only, no exclamation marks in copy.

## Repo history

The repo previously held a Nocturne-branded web pomodoro (see git
history); its design handoff remains in `design_handoff/`. Span reuses
its engine discipline and replaces the UI and persistence per the spec.
