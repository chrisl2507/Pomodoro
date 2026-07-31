import type { BackdropId } from './settings'
import { SETTINGS } from './settings'

export type LogEntry = { label: string; at: string }

export type PersistedState = {
  /** Focus sessions completed today. */
  completed: number
  /** Whole seconds focused today (folded, timestamp-derived). */
  focusSeconds: number
  /** Most recent completions, newest first, capped at LOG_LIMIT. */
  log: LogEntry[]
  backdrop: BackdropId
  /** Local YYYY-MM-DD the daily counters belong to. */
  day: string
}

export const LOG_LIMIT = 12

const KEY = 'noc-focus-v1'

export function todayKey(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function defaults(): PersistedState {
  return {
    completed: 0,
    focusSeconds: 0,
    log: [],
    backdrop: SETTINGS.defaultBackdrop,
    day: todayKey(),
  }
}

export function loadState(): PersistedState {
  let raw: unknown = null
  try {
    raw = JSON.parse(localStorage.getItem(KEY) ?? 'null')
  } catch {
    /* corrupt or unavailable storage falls back to defaults */
  }
  const base = defaults()
  if (raw && typeof raw === 'object') {
    const r = raw as Partial<PersistedState>
    if (typeof r.completed === 'number') base.completed = r.completed
    if (typeof r.focusSeconds === 'number') base.focusSeconds = r.focusSeconds
    if (Array.isArray(r.log)) base.log = r.log.slice(0, LOG_LIMIT)
    if (typeof r.backdrop === 'string') base.backdrop = r.backdrop as BackdropId
    if (typeof r.day === 'string') base.day = r.day
  }
  // Daily counters reset when the stored day is not today; the log and
  // chosen backdrop carry across days.
  if (base.day !== todayKey()) {
    base.completed = 0
    base.focusSeconds = 0
    base.day = todayKey()
  }
  return base
}

export function saveState(patch: Partial<PersistedState>): void {
  const merged = { ...loadState(), ...patch, day: todayKey() }
  merged.log = merged.log.slice(0, LOG_LIMIT)
  try {
    localStorage.setItem(KEY, JSON.stringify(merged))
  } catch {
    /* storage full or unavailable — the app keeps running from memory */
  }
}
