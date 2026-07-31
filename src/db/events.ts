import { getDb } from './db'
import { SETTINGS, type Phase } from '../settings'
import packageJson from '../../package.json'

/* Everything the app ever writes goes through appendEvent. Times are the
   ISO-8601 UTC instant plus the device's UTC offset at that moment — the
   pair the schema's "user's day" analysis is built on. */

export type EventType = 'start' | 'pause' | 'resume' | 'complete' | 'abandon'

export function tzOffsetMinutes(at: Date): number {
  // JS getTimezoneOffset() is minutes to add to local to reach UTC
  // (BST → -60); the schema stores the opposite sign (BST → +60).
  return -at.getTimezoneOffset()
}

export async function appendEvent(
  sessionUuid: string,
  type: EventType,
  at: Date,
  startFields?: { kind: Phase; plannedMinutes: number; taskLabel: string | null },
): Promise<void> {
  const db = await getDb()
  await db.run(
    `INSERT INTO events
       (session_uuid, event_type, occurred_at, tz_offset_min,
        session_kind, planned_minutes, task_label, app_version)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      sessionUuid,
      type,
      at.toISOString(),
      tzOffsetMinutes(at),
      startFields?.kind ?? null,
      startFields?.plannedMinutes ?? null,
      startFields?.taskLabel ?? null,
      startFields ? packageJson.version : null,
    ],
  )
}

/* — open-session recovery — */

export type OpenSession = {
  sessionUuid: string
  kind: Phase
  plannedMinutes: number
  taskLabel: string | null
  startedAtMs: number
  /** completed pause time so far */
  pausedMsBefore: number
  /** set when the session is currently paused */
  pausedSinceMs: number | null
}

type EventRow = {
  session_uuid: string
  event_type: EventType
  occurred_at: string
  session_kind: Phase | null
  planned_minutes: number | null
  task_label: string | null
}

/** The at-most-one session with a `start` but no terminal event, replayed
    into timestamps the engine can resume from. */
export async function findOpenSession(): Promise<OpenSession | null> {
  const db = await getDb()
  const open = await db.query<{ session_uuid: string }>(
    `SELECT session_uuid
     FROM events
     GROUP BY session_uuid
     HAVING SUM(event_type IN ('complete','abandon')) = 0
     ORDER BY MAX(occurred_at) DESC
     LIMIT 1`,
  )
  if (open.length === 0) return null

  const rows = await db.query<EventRow>(
    `SELECT session_uuid, event_type, occurred_at, session_kind, planned_minutes, task_label
     FROM events WHERE session_uuid = ? ORDER BY occurred_at, event_id`,
    [open[0].session_uuid],
  )
  const start = rows.find((r) => r.event_type === 'start')
  if (!start || !start.session_kind || start.planned_minutes === null) return null

  let pausedMsBefore = 0
  let pausedSinceMs: number | null = null
  for (const row of rows) {
    const at = Date.parse(row.occurred_at)
    if (row.event_type === 'pause') pausedSinceMs = at
    if (row.event_type === 'resume' && pausedSinceMs !== null) {
      pausedMsBefore += at - pausedSinceMs
      pausedSinceMs = null
    }
  }

  return {
    sessionUuid: start.session_uuid,
    kind: start.session_kind,
    plannedMinutes: start.planned_minutes,
    taskLabel: start.task_label,
    startedAtMs: Date.parse(start.occurred_at),
    pausedMsBefore,
    pausedSinceMs,
  }
}

/** Launch janitor: in-progress sessions older than the cutoff get an
    `abandon` appended (the schema's views then close them out). */
export async function abandonStaleSessions(now = new Date()): Promise<void> {
  const db = await getDb()
  const cutoffMs = now.getTime() - SETTINGS.abandonAfterHours * 3_600_000
  const stale = await db.query<{ session_uuid: string }>(
    `SELECT session_uuid
     FROM events
     GROUP BY session_uuid
     HAVING SUM(event_type IN ('complete','abandon')) = 0
        AND MAX(occurred_at) < ?`,
    [new Date(cutoffMs).toISOString()],
  )
  for (const row of stale) {
    await appendEvent(row.session_uuid, 'abandon', now)
  }
}

/** JSON export = the events table. The event log is the backup format. */
export async function exportEvents(): Promise<string> {
  const db = await getDb()
  const rows = await db.query('SELECT * FROM events ORDER BY event_id')
  return JSON.stringify(rows, null, 2)
}
