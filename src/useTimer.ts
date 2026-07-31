import { useEffect, useReducer, useRef } from 'react'
import { SETTINGS, phaseDurationMs, type Phase } from './settings'
import { LOG_LIMIT, loadState, saveState, type LogEntry } from './storage'
import { useTick } from './useTick'

/* The timer never accumulates ticks. A running phase is one timestamp —
   `endAt` — and everything else derives from `Date.now()` against it, so a
   throttled tab, a dropped frame or a suspended page cannot drift the
   countdown. Focus time is likewise derived from segment timestamps. */

export type TimerSnapshot = {
  phase: Phase
  running: boolean
  /** ms remaining in the current phase */
  leftMs: number
  /** full duration of the current phase in ms */
  totalMs: number
  /** focus sessions completed today */
  completed: number
  /** whole seconds focused today */
  focusSeconds: number
  log: LogEntry[]
  /** completion halo flash is active */
  flash: boolean
  toggle: () => void
  reset: () => void
  skip: () => void
  pick: (phase: Phase) => void
}

type EngineState = {
  phase: Phase
  /** wall-clock ms when the running phase ends; null while paused */
  endAt: number | null
  /** ms remaining while paused */
  pausedLeftMs: number
  completed: number
  /** ms focused today, folded from finished segments */
  focusMsBase: number
  /** wall-clock start of the live focus segment; null unless running focus */
  segmentStart: number | null
  log: LogEntry[]
  /** wall-clock ms until which the completion flash shows */
  flashUntil: number
}

function timeLabel(atMs: number): string {
  return new Date(atMs).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function nextPhaseAfter(phase: Phase, completed: number): Phase {
  if (phase !== 'focus') return 'focus'
  return completed % SETTINGS.sessionsPerCycle === 0 ? 'long' : 'short'
}

/** Fold the live focus segment into the base up to `now`. */
function fold(s: EngineState, now: number): EngineState {
  if (s.segmentStart === null) return s
  const upTo = s.endAt !== null ? Math.min(now, s.endAt) : now
  return {
    ...s,
    focusMsBase: s.focusMsBase + Math.max(0, upTo - s.segmentStart),
    segmentStart: s.segmentStart === null ? null : upTo,
  }
}

/** Complete one phase that ended at `endedAt` and enter the next. */
function completeOne(s: EngineState, endedAt: number, keepRunning: boolean): EngineState {
  const wasFocus = s.phase === 'focus'
  let focusMsBase = s.focusMsBase
  if (wasFocus && s.segmentStart !== null) {
    focusMsBase += Math.max(0, endedAt - s.segmentStart)
  }
  const completed = wasFocus ? s.completed + 1 : s.completed
  const entry: LogEntry = {
    label: wasFocus ? `Focus · ${SETTINGS.focusMinutes}m` : 'Break',
    at: timeLabel(endedAt),
  }
  const phase = nextPhaseAfter(s.phase, completed)
  const duration = phaseDurationMs(phase)
  const run = keepRunning && SETTINGS.autoContinue
  return {
    ...s,
    phase,
    completed,
    focusMsBase,
    log: [entry, ...s.log].slice(0, LOG_LIMIT),
    // The next phase chains from the previous phase's end timestamp, so
    // back-to-back phases carry no scheduling drift.
    endAt: run ? endedAt + duration : null,
    segmentStart: run && phase === 'focus' ? endedAt : null,
    pausedLeftMs: duration,
    flashUntil: Date.now() + 900,
  }
}

/** Apply every completion whose endAt has already passed (page may have
    been suspended across several phases). */
function advance(s: EngineState, now: number): { state: EngineState; completions: number } {
  let state = s
  let completions = 0
  while (state.endAt !== null && state.endAt <= now) {
    state = completeOne(state, state.endAt, true)
    completions++
    if (completions > 64) break // safety valve against a corrupted endAt
  }
  return { state, completions }
}

function notifyPhaseChange(s: EngineState): void {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  if (typeof document !== 'undefined' && document.hasFocus()) return
  const body =
    s.phase === 'focus'
      ? 'Break over — back to focus.'
      : s.phase === 'short'
        ? 'Focus complete — take a short break.'
        : 'Focus complete — take a long break.'
  try {
    new Notification('Nocturne — Focus', { body, tag: 'noc-focus-phase' })
  } catch {
    /* some platforms only allow notifications from service workers */
  }
}

export function useTimer(): TimerSnapshot {
  const engine = useRef<EngineState | null>(null)
  if (engine.current === null) {
    const saved = loadState()
    engine.current = {
      phase: 'focus',
      endAt: null,
      pausedLeftMs: phaseDurationMs('focus'),
      completed: saved.completed,
      focusMsBase: saved.focusSeconds * 1000,
      segmentStart: null,
      log: saved.log,
      flashUntil: 0,
    }
  }
  const [, rerender] = useReducer((n: number) => n + 1, 0)
  const lastShownSecond = useRef(-1)

  const persist = (s: EngineState) => {
    saveState({
      completed: s.completed,
      focusSeconds: Math.floor(s.focusMsBase / 1000),
      log: s.log,
    })
  }

  const commit = (s: EngineState, save = true) => {
    engine.current = s
    if (save) persist(s)
    rerender()
  }

  useTick((now) => {
    const s = engine.current!
    if (s.endAt !== null && s.endAt <= now) {
      const { state } = advance(s, now)
      commit(state)
      notifyPhaseChange(state)
      return
    }
    const leftMs = s.endAt !== null ? s.endAt - now : s.pausedLeftMs
    const second = Math.ceil(leftMs / 1000)
    const flashing = now < s.flashUntil + 250
    if (second !== lastShownSecond.current || flashing) {
      lastShownSecond.current = second
      rerender()
    }
  })

  // A page being closed or backgrounded folds the live focus segment so the
  // seconds already focused survive a relaunch.
  useEffect(() => {
    const flush = () => {
      const s = engine.current!
      if (s.segmentStart !== null) {
        const folded = fold(s, Date.now())
        engine.current = folded
        persist(folded)
      }
    }
    window.addEventListener('pagehide', flush)
    document.addEventListener('visibilitychange', flush)
    return () => {
      window.removeEventListener('pagehide', flush)
      document.removeEventListener('visibilitychange', flush)
    }
  }, [])

  const s = engine.current
  const now = Date.now()
  const running = s.endAt !== null
  const totalMs = phaseDurationMs(s.phase)
  const leftMs = Math.max(0, running ? s.endAt! - now : s.pausedLeftMs)
  const liveSegmentMs =
    s.segmentStart !== null ? Math.max(0, Math.min(now, s.endAt ?? now) - s.segmentStart) : 0

  return {
    phase: s.phase,
    running,
    leftMs,
    totalMs,
    completed: s.completed,
    focusSeconds: Math.floor((s.focusMsBase + liveSegmentMs) / 1000),
    log: s.log,
    flash: now < s.flashUntil,

    toggle: () => {
      const t = Date.now()
      const cur = engine.current!
      if (cur.endAt !== null) {
        const folded = fold(cur, t)
        commit({
          ...folded,
          endAt: null,
          segmentStart: null,
          pausedLeftMs: Math.max(0, cur.endAt - t),
        })
      } else {
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
          Notification.requestPermission().catch(() => {})
        }
        commit(
          {
            ...cur,
            endAt: t + cur.pausedLeftMs,
            segmentStart: cur.phase === 'focus' ? t : null,
          },
          false,
        )
      }
    },

    reset: () => {
      const t = Date.now()
      const cur = fold(engine.current!, t)
      commit({
        ...cur,
        endAt: null,
        segmentStart: null,
        pausedLeftMs: phaseDurationMs(cur.phase),
      })
    },

    skip: () => {
      const t = Date.now()
      const cur = engine.current!
      commit(completeOne(cur, Math.min(t, cur.endAt ?? t), true))
    },

    pick: (phase: Phase) => {
      const t = Date.now()
      const cur = fold(engine.current!, t)
      commit({
        ...cur,
        phase,
        endAt: null,
        segmentStart: null,
        pausedLeftMs: phaseDurationMs(phase),
      })
    },
  }
}
