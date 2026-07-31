# Span — design spec

Product: a Pomodoro timer for Google Play and the App Store, positioned as
"observability for your attention." The timer is the data-collection
instrument; the insights are the product. Working repo:
github.com/chrisl2507/Pomodoro (existing code may be reused or replaced —
assess before assuming either).

## Brand

- **Name:** Span (double meaning: attention span / tracing span).
  Availability checks (App Store, Play, UK IPO trademark, domain) are still
  pending — keep the name easily replaceable (one config constant, no
  hardcoded strings scattered through the app).
- **Tagline:** "trace your attention"
- **Wordmark:** lowercase `span_` in the app's monospace font, with the
  trailing underscore in the accent colour. The underscore may blink
  (cursor-style) on the splash screen and in idle states.
- **App icon:** `s_` monogram. Glyph set in the chosen mono font, converted
  to outlines and optically corrected (not live text). Ship variant: dark
  glyph `s` + light underscore on a solid accent-purple tile. Alternate
  icon (iOS `alternateIconName`): light glyph + purple underscore on the
  dark tile — reserved as a paid-tier perk.

## Visual language

- **Aesthetic:** modern dev-tool (Linear / Grafana register). Dark-first;
  a light "paper mode" must exist with the same rules inverted.
- **Palette (dark mode):**
  - Canvas: `#131219`
  - Raised surface / cards: `#1c1a26`
  - Hairlines / inactive track: `#2a2836`
  - Primary text: `#efeef6`
  - Secondary text: `#8b87a3`
  - Accent (one only): purple `#7F77DD`, with darker steps `#544c94`,
    `#3d3760` for heatmap ramps
  - Positive delta green (stats arrows only): `#5dca8f`
  - Rule: accent is reserved for live data — progress bars, sparklines,
    heatmap cells, the cursor. Chrome and controls stay in the greys.
- **Typography:** sans (Inter/Geist class) for labels and copy; monospace
  (JetBrains Mono or IBM Plex Mono — open licences) for every numeral:
  timers, durations, stats, percentages. Two weights only.
- **Copy tone:** calm, technical, dry. "Session complete", never
  "Amazing job! 🎉". No exclamation marks in system copy. Sentence case.

## Screens (v1)

1. **Focus** — session label ("deep work"), large mono countdown, optional
   task label beneath, thin accent progress bar, two small stat chips
   (today's focused time, current streak), single pause/start control,
   "session N of M" in the header.
2. **Insights** — 14-day scope: two metric cards (focus time with delta,
   completion % with delta), focus-trend sparkline, "your best hours"
   hour-of-day heatmap (12 cells, 6am–6pm axis), and a plain-English
   insight sentence beneath the heatmap (e.g. "Peak focus: 9–11am. You
   complete 2.3× more sessions before noon."). Insight sentences render
   only when the backing query meets its minimum sample size (n ≥ 5).

The insight sentences are the hero feature and the intended paid-tier
boundary: timer free forever, insights paid. The exact free/paid split is
NOT yet finalised — build insights behind a single feature flag so the
line can move.

## Data layer

Local-first. On-device SQLite, no backend, no accounts, no network calls
in v1. Full schema, derived views, and the seven insight queries are in
`span-schema-and-insights.sql` (same handoff as this spec) — treat that
file as the source of truth for the data model. Key principles it encodes:

- Append-only `events` table is the only thing written; sessions, stats
  and insights are derived by query. No stored aggregates.
- Every event stores UTC timestamp + local UTC-offset minutes; all
  "user's day" analysis uses the derived local wall-clock time.
- Backup: platform-native (iCloud container / Android Auto Backup) plus a
  user-facing JSON/CSV export that is simply the events table.
- Orphaned in-progress sessions older than a day get an appended
  `abandon` event on app launch.

## Out of scope for v1

Cloud sync, accounts, web dashboard, widgets/watch, social features,
gamification, sounds/themes marketplace. Sync ("Span Cloud") is
deliberately deferred until revenue justifies a backend.

## Open questions for the build

1. Client stack: inspect the existing repo first — if it is a web app,
   decide between Capacitor wrapping vs a React Native/Flutter rebuild,
   and recommend before scaffolding.
2. Name availability outcome may force a rename — see Brand note above.
3. Free/paid split — flag-gated, decision deferred.
