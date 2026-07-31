/* The Span data model, from docs/span/span-schema-and-insights.sql — that
   file is the source of truth; this module is its runtime copy with
   IF NOT EXISTS added so init is idempotent. Append-only event grain:
   `events` is the only thing written, everything else is a view. */

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS events (
    event_id        INTEGER PRIMARY KEY,
    session_uuid    TEXT    NOT NULL,
    event_type      TEXT    NOT NULL
                    CHECK (event_type IN ('start','pause','resume','complete','abandon')),
    occurred_at     TEXT    NOT NULL,
    tz_offset_min   INTEGER NOT NULL,
    session_kind    TEXT    CHECK (session_kind IN ('focus','short_break','long_break')),
    planned_minutes INTEGER,
    task_label      TEXT,
    app_version     TEXT
);

CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_uuid);
CREATE INDEX IF NOT EXISTS idx_events_time    ON events(occurred_at);

CREATE VIEW IF NOT EXISTS session_pauses AS
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

CREATE VIEW IF NOT EXISTS sessions AS
SELECT
    e.session_uuid,
    MAX(CASE WHEN e.event_type = 'start' THEN e.occurred_at END)      AS started_utc,
    MAX(CASE WHEN e.event_type = 'start' THEN e.tz_offset_min END)    AS tz_offset_min,
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
`
