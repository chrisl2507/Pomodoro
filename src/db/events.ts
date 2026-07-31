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

async function replaySession(sessionUuid: string): Promise<OpenSession | null> {
  const db = await getDb()
  const rows = await db.query<EventRow>(
    `SELECT session_uuid, event_type, occurred_at, session_kind, planned_minutes, task_label
     FROM events WHERE session_uuid = ? ORDER BY occurred_at, event_id`,
    [sessionUuid],
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

async function openSessionUuids(olderThan?: string): Promise<string[]> {
  const db = await getDb()
  const rows = await db.query<{ session_uuid: string }>(
    `SELECT session_uuid
     FROM events
     GROUP BY session_uuid
     HAVING SUM(event_type IN ('complete','abandon')) = 0
        ${olderThan ? 'AND MAX(occurred_at) < ?' : ''}
     ORDER BY MAX(occurred_at) DESC`,
    olderThan ? [olderThan] : [],
  )
  return rows.map((r) => r.session_uuid)
}

/** The at-most-one session with a `start` but no terminal event, replayed
    into timestamps the engine can resume from. */
export async function findOpenSession(): Promise<OpenSession | null> {
  const open = await openSessionUuids()
  if (open.length === 0) return null
  return replaySession(open[0])
}

/** Launch janitor: in-progress sessions older than the cutoff get an
    `abandon` appended. The abandon is timestamped at the moment the
    session effectively died — when it was paused, or when its timer would
    have run out — never at janitor-run time, so the derived focus_minutes
    stays truthful for any future consumer of non-completed rows. */
export async function abandonStaleSessions(now = new Date()): Promise<void> {
  const cutoffMs = now.getTime() - SETTINGS.abandonAfterHours * 3_600_000
  const stale = await openSessionUuids(new Date(cutoffMs).toISOString())
  for (const uuid of stale) {
    const replay = await replaySession(uuid)
    let abandonedAtMs = now.getTime()
    if (replay) {
      const wouldHaveEnded =
        replay.startedAtMs + replay.plannedMinutes * 60_000 + replay.pausedMsBefore
      abandonedAtMs = replay.pausedSinceMs ?? wouldHaveEnded
      abandonedAtMs = Math.min(Math.max(abandonedAtMs, replay.startedAtMs), now.getTime())
    }
    await appendEvent(uuid, 'abandon', new Date(abandonedAtMs))
  }
}

/** JSON export = the events table. The event log is the backup format. */
export async function exportEvents(): Promise<string> {
  const db = await getDb()
  const rows = await db.query('SELECT * FROM events ORDER BY event_id')
  return JSON.stringify(rows, null, 2)
}

/** CSV flavour of the same export. */
export async function exportEventsCsv(): Promise<string> {
  const db = await getDb()
  const rows = await db.query<Record<string, string | number | null>>(
    'SELECT * FROM events ORDER BY event_id',
  )
  const columns = [
    'event_id',
    'session_uuid',
    'event_type',
    'occurred_at',
    'tz_offset_min',
    'session_kind',
    'planned_minutes',
    'task_label',
    'app_version',
  ]
  const cell = (v: string | number | null) => {
    if (v === null || v === undefined) return ''
    const s = String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const lines = [columns.join(',')]
  for (const row of rows) {
    lines.push(columns.map((c) => cell(row[c] ?? null)).join(','))
  }
  return lines.join('\n')
}
