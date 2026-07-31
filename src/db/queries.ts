import { getDb } from './db'

/* The insight queries from docs/span/span-schema-and-insights.sql,
   verbatim, each typed and annotated with the sentence it powers.
   Sentences render only when the backing query passes MIN_SAMPLE. */

export const MIN_SAMPLE = 5

// (a) Best-hours heatmap — powers the 12-cell grid and "Peak focus: 9-11am."
export type HourBucket = {
  local_hour: number
  sessions_started: number
  sessions_completed: number
  completion_pct: number
  focused_minutes: number | null
}
export async function bestHours(): Promise<HourBucket[]> {
  const db = await getDb()
  return db.query<HourBucket>(`
    SELECT
        CAST(strftime('%H', started_local) AS INTEGER)   AS local_hour,
        COUNT(*)                                          AS sessions_started,
        SUM(completed)                                    AS sessions_completed,
        ROUND(100.0 * SUM(completed) / COUNT(*), 0)       AS completion_pct,
        ROUND(SUM(CASE WHEN completed THEN focus_minutes END), 0) AS focused_minutes
    FROM sessions
    WHERE session_kind = 'focus' AND ended_utc IS NOT NULL
    GROUP BY local_hour
    ORDER BY local_hour`)
}

// (b) Morning multiplier — "You complete 2.3x more sessions before noon."
export async function morningMultiplier(): Promise<number | null> {
  const db = await getDb()
  const rows = await db.query<{ morning_vs_afternoon_ratio: number | null }>(`
    SELECT
        ROUND(
            1.0 * SUM(CASE WHEN CAST(strftime('%H', started_local) AS INTEGER) < 12
                           THEN completed END)
          / NULLIF(SUM(CASE WHEN CAST(strftime('%H', started_local) AS INTEGER) >= 12
                            THEN completed END), 0)
        , 1) AS morning_vs_afternoon_ratio
    FROM sessions
    WHERE session_kind = 'focus'`)
  return rows[0]?.morning_vs_afternoon_ratio ?? null
}

// (c) 14-day focus trend — the sparkline
export type TrendDay = {
  local_day: string
  focused_minutes: number | null
  completed_sessions: number
}
export async function focusTrend14d(): Promise<TrendDay[]> {
  const db = await getDb()
  return db.query<TrendDay>(`
    SELECT
        date(started_local)                                     AS local_day,
        ROUND(SUM(CASE WHEN completed THEN focus_minutes END),0) AS focused_minutes,
        SUM(completed)                                           AS completed_sessions
    FROM sessions
    WHERE session_kind = 'focus'
      AND date(started_local) >= date('now', '-14 days')
    GROUP BY local_day
    ORDER BY local_day`)
}

// (d) Current streak — consecutive days with a completed focus session
export async function currentStreakDays(): Promise<number> {
  const db = await getDb()
  const rows = await db.query<{ current_streak_days: number }>(`
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
    WHERE d = date('now', 'localtime', '-' || (rn - 1) || ' days')`)
  return rows[0]?.current_streak_days ?? 0
}

// (e) Fatigue curve — "Your 5th session of the day is 40% less likely to finish."
export type FatigueRow = { session_no: number; attempts: number; completion_pct: number }
export async function fatigueCurve(): Promise<FatigueRow[]> {
  const db = await getDb()
  return db.query<FatigueRow>(`
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
    HAVING attempts >= ${MIN_SAMPLE}
    ORDER BY session_no`)
}

// (f) Task-label effect — "You abandon 'email' sessions twice as often…"
export type TaskLabelRow = {
  task_label: string
  attempts: number
  completion_pct: number
  avg_focus_minutes: number | null
}
export async function taskLabelEffect(): Promise<TaskLabelRow[]> {
  const db = await getDb()
  return db.query<TaskLabelRow>(`
    SELECT
        COALESCE(task_label, '(unlabelled)')        AS task_label,
        COUNT(*)                                    AS attempts,
        ROUND(100.0 * AVG(completed), 0)            AS completion_pct,
        ROUND(AVG(CASE WHEN completed THEN focus_minutes END), 1) AS avg_focus_minutes
    FROM sessions
    WHERE session_kind = 'focus' AND ended_utc IS NOT NULL
    GROUP BY 1
    HAVING attempts >= ${MIN_SAMPLE}
    ORDER BY completion_pct DESC`)
}

// (g) Headline stats for the metric cards
export type Headline = { total_hours_14d: number | null; completion_pct_14d: number | null }
export async function headline14d(): Promise<Headline> {
  const db = await getDb()
  const rows = await db.query<Headline>(`
    SELECT
        ROUND(SUM(CASE WHEN completed THEN focus_minutes END) / 60.0, 1) AS total_hours_14d,
        ROUND(100.0 * AVG(completed), 0)                                 AS completion_pct_14d
    FROM sessions
    WHERE session_kind = 'focus'
      AND ended_utc IS NOT NULL
      AND date(started_local) >= date('now', '-14 days')`)
  return rows[0] ?? { total_hours_14d: null, completion_pct_14d: null }
}

/* Same headline for the *previous* 14-day window — powers the deltas on
   the metric cards (not in the handoff file; composed from the same view). */
export async function headlinePrev14d(): Promise<Headline> {
  const db = await getDb()
  const rows = await db.query<Headline>(`
    SELECT
        ROUND(SUM(CASE WHEN completed THEN focus_minutes END) / 60.0, 1) AS total_hours_14d,
        ROUND(100.0 * AVG(completed), 0)                                 AS completion_pct_14d
    FROM sessions
    WHERE session_kind = 'focus'
      AND ended_utc IS NOT NULL
      AND date(started_local) >= date('now', '-28 days')
      AND date(started_local) <  date('now', '-14 days')`)
  return rows[0] ?? { total_hours_14d: null, completion_pct_14d: null }
}

/* Focus-screen chips (composed from the sessions view, not in the handoff
   file): minutes focused today, and sessions completed today. */
export async function todayStats(): Promise<{ focusedMinutes: number; completedSessions: number }> {
  const db = await getDb()
  const rows = await db.query<{ m: number | null; c: number | null }>(`
    SELECT ROUND(SUM(CASE WHEN completed THEN focus_minutes END), 0) AS m,
           SUM(completed)                                            AS c
    FROM sessions
    WHERE session_kind = 'focus'
      AND date(started_local) = date('now', 'localtime')`)
  return { focusedMinutes: rows[0]?.m ?? 0, completedSessions: rows[0]?.c ?? 0 }
}
