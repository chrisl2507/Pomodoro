-- ============================================================
-- Span — local-first session store (SQLite)
-- Design principle: immutable event grain. Every state change is
-- an appended row; nothing is ever updated or deleted. All
-- sessions, stats and insights are derived by query.
-- ============================================================

-- ------------------------------------------------------------
-- 1. THE ONLY TABLE YOU WRITE TO
-- ------------------------------------------------------------
-- Times are stored as ISO-8601 UTC plus the device's local UTC
-- offset at the moment of the event. That pair makes "9am for
-- the user" analysis correct across travel and DST without ever
-- needing a timezone library at query time.

CREATE TABLE events (
    event_id        INTEGER PRIMARY KEY,
    session_uuid    TEXT    NOT NULL,               -- groups events into one session
    event_type      TEXT    NOT NULL
                    CHECK (event_type IN ('start','pause','resume','complete','abandon')),
    occurred_at     TEXT    NOT NULL,               -- ISO-8601 UTC, e.g. 2026-07-31T08:00:00Z
    tz_offset_min   INTEGER NOT NULL,               -- e.g. 60 for BST, 0 for GMT
    -- The following are populated on the 'start' event only:
    session_kind    TEXT    CHECK (session_kind IN ('focus','short_break','long_break')),
    planned_minutes INTEGER,
    task_label      TEXT,                           -- optional, user-entered
    app_version     TEXT
);

CREATE INDEX idx_events_session ON events(session_uuid);
CREATE INDEX idx_events_time    ON events(occurred_at);

-- ------------------------------------------------------------
-- 2. DERIVED SESSION VIEWS (never stored, always consistent)
-- ------------------------------------------------------------

-- Paused seconds per session: pair each 'pause' with the next
-- 'resume' (or the session end, if the user ended while paused).
CREATE VIEW session_pauses AS
SELECT
    session_uuid,
    SUM(
        (julianday(COALESCE(next_ts, occurred_at)) - julianday(occurred_at)) * 86400.0
    ) AS paused_seconds
FROM (
    SELECT
        session_uuid,
        event_type,
        occurred_at,
        LEAD(occurred_at) OVER (
            PARTITION BY session_uuid ORDER BY occurred_at
        ) AS next_ts
    FROM events
)
WHERE event_type = 'pause'
GROUP BY session_uuid;

-- One row per session, with local start time and net focus minutes.
CREATE VIEW sessions AS
SELECT
    e.session_uuid,
    MAX(CASE WHEN e.event_type = 'start' THEN e.occurred_at END)      AS started_utc,
    MAX(CASE WHEN e.event_type = 'start' THEN e.tz_offset_min END)    AS tz_offset_min,
    -- Local wall-clock start, the grain all "your day" insights use:
    datetime(
        MAX(CASE WHEN e.event_type = 'start' THEN e.occurred_at END),
        (MAX(CASE WHEN e.event_type = 'start' THEN e.tz_offset_min END)) || ' minutes'
    )                                                                 AS started_local,
    MAX(CASE WHEN e.event_type IN ('complete','abandon')
             THEN e.occurred_at END)                                  AS ended_utc,
    MAX(CASE WHEN e.event_type = 'start' THEN e.session_kind END)     AS session_kind,
    MAX(CASE WHEN e.event_type = 'start' THEN e.planned_minutes END)  AS planned_minutes,
    MAX(CASE WHEN e.event_type = 'start' THEN e.task_label END)       AS task_label,
    MAX(e.event_type = 'complete')                                    AS completed,
    ROUND(
        ( (julianday(MAX(CASE WHEN e.event_type IN ('complete','abandon')
                              THEN e.occurred_at END))
         - julianday(MAX(CASE WHEN e.event_type = 'start'
                              THEN e.occurred_at END))) * 1440.0
        ) - COALESCE(p.paused_seconds, 0) / 60.0
    , 1)                                                              AS focus_minutes
FROM events e
LEFT JOIN session_pauses p USING (session_uuid)
GROUP BY e.session_uuid;

-- ------------------------------------------------------------
-- 3. INSIGHT QUERIES
-- Each is annotated with the plain-English sentence it powers.
-- All filter to session_kind = 'focus' and ignore breaks.
-- ------------------------------------------------------------

-- (a) Best-hours heatmap
-- Powers the 12-cell grid and: "Peak focus: 9-11am."
SELECT
    CAST(strftime('%H', started_local) AS INTEGER)   AS local_hour,
    COUNT(*)                                          AS sessions_started,
    SUM(completed)                                    AS sessions_completed,
    ROUND(100.0 * SUM(completed) / COUNT(*), 0)       AS completion_pct,
    ROUND(SUM(CASE WHEN completed THEN focus_minutes END), 0) AS focused_minutes
FROM sessions
WHERE session_kind = 'focus' AND ended_utc IS NOT NULL
GROUP BY local_hour
ORDER BY local_hour;

-- (b) Morning multiplier
-- Powers: "You complete 2.3x more sessions before noon."
SELECT
    ROUND(
        1.0 * SUM(CASE WHEN CAST(strftime('%H', started_local) AS INTEGER) < 12
                       THEN completed END)
      / NULLIF(SUM(CASE WHEN CAST(strftime('%H', started_local) AS INTEGER) >= 12
                        THEN completed END), 0)
    , 1) AS morning_vs_afternoon_ratio
FROM sessions
WHERE session_kind = 'focus';

-- (c) 14-day focus trend (the sparkline)
SELECT
    date(started_local)                                     AS local_day,
    ROUND(SUM(CASE WHEN completed THEN focus_minutes END),0) AS focused_minutes,
    SUM(completed)                                           AS completed_sessions
FROM sessions
WHERE session_kind = 'focus'
  AND date(started_local) >= date('now', '-14 days')
GROUP BY local_day
ORDER BY local_day;

-- (d) Current streak (consecutive days ending today/yesterday
--     with at least one completed focus session)
WITH active_days AS (
    SELECT DISTINCT date(started_local) AS d
    FROM sessions
    WHERE session_kind = 'focus' AND completed = 1
),
numbered AS (
    SELECT d,
           ROW_NUMBER() OVER (ORDER BY d DESC) AS rn
    FROM active_days
)
SELECT COUNT(*) AS current_streak_days
FROM numbered
WHERE d = date('now', 'localtime', '-' || (rn - 1) || ' days');

-- (e) Fatigue curve: completion rate by session number within the day
-- Powers: "Your 5th session of the day is 40% less likely to finish."
WITH ordered AS (
    SELECT
        completed,
        ROW_NUMBER() OVER (
            PARTITION BY date(started_local) ORDER BY started_local
        ) AS session_no
    FROM sessions
    WHERE session_kind = 'focus' AND ended_utc IS NOT NULL
)
SELECT
    session_no,
    COUNT(*)                                    AS attempts,
    ROUND(100.0 * AVG(completed), 0)            AS completion_pct
FROM ordered
GROUP BY session_no
HAVING attempts >= 5           -- don't report on thin data
ORDER BY session_no;

-- (f) Task-label effect
-- Powers: "You abandon 'email' sessions twice as often as 'deep work'."
SELECT
    COALESCE(task_label, '(unlabelled)')        AS task_label,
    COUNT(*)                                    AS attempts,
    ROUND(100.0 * AVG(completed), 0)            AS completion_pct,
    ROUND(AVG(CASE WHEN completed THEN focus_minutes END), 1) AS avg_focus_minutes
FROM sessions
WHERE session_kind = 'focus' AND ended_utc IS NOT NULL
GROUP BY 1
HAVING attempts >= 5
ORDER BY completion_pct DESC;

-- (g) Headline stats for the metric cards
SELECT
    ROUND(SUM(CASE WHEN completed THEN focus_minutes END) / 60.0, 1) AS total_hours_14d,
    ROUND(100.0 * AVG(completed), 0)                                 AS completion_pct_14d
FROM sessions
WHERE session_kind = 'focus'
  AND ended_utc IS NOT NULL
  AND date(started_local) >= date('now', '-14 days');

-- ------------------------------------------------------------
-- Notes
-- * Requires SQLite 3.25+ (window functions) — fine on any
--   remotely current iOS/Android runtime.
-- * A session with a 'start' but no terminal event is in
--   progress (or the app died); the views naturally exclude it
--   via ended_utc IS NOT NULL. A janitor on app launch can
--   append an 'abandon' for stale orphans older than a day.
-- * Insight sentences should only render once attempts pass a
--   minimum-n threshold (>= 5 used above) — a 100% completion
--   rate from two sessions is noise, not insight.
-- * JSON/CSV export = SELECT * FROM events. The event log IS
--   the backup format.
