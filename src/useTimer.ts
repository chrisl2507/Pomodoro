import { useEffect, useReducer, useRef } from 'react'
import { SETTINGS, phaseDurationMs, type Phase } from './settings'
import { abandonStaleSessions, appendEvent, findOpenSession } from './db/events'
import { currentStreakDays, todayStats } from './db/queries'
import {
  cancelScheduled,
  fireNow,
  requestNotificationPermission,
  scheduleCompletion,
} from './notifications'
import { useTick } from './useTick'

/* The engine keeps the previous app's rule — a running phase is one endAt
   timestamp and everything derives from Date.now() against it — but its
   persistence is the append-only events table. Relaunch replays the open
   session's events back into timestamps, so a killed app resumes (or
   completes) exactly where the wall clock says it should. */

export type TimerSnapshot = {
  ready: boolean
  phase: Phase
  running: boolean
  /** a session exists for the current phase (running or paused mid-way) */
  inSession: boolean
  leftMs: number
  totalMs: number
  /** 1-based focus-session number within the current cycle */
  sessionNumber: number
  taskLabel: string
  todayFocusedMinutes: number
  todayCompleted: number
  streakDays: number
  toggle: () => void
  setTaskLabel: (label: string) => void
}

type EngineState = {
  ready: boolean
  phase: Phase
  sessionUuid: string | null
  taskLabel: string
  endAt: number | null
  pausedLeftMs: number
  todayFocusedMinutes: number
  todayCompleted: number
  streakDays: number
}

function completionBody(finished: Phase): string {
  return finished === 'focus' ? 'Session complete' : 'Break over'
}

function nextPhase(finished: Phase, todayCompletedAfter: number): Phase {
  if (finished !== 'focus') return 'focus'
  return todayCompletedAfter % SETTINGS.sessionsPerCycle === 0 ? 'long_break' : 'short_break'
}

export function useTimer(): TimerSnapshot {
  const engine = useRef<EngineState>({
    ready: false,
    phase: 'focus',
    sessionUuid: null,
    taskLabel: '',
    endAt: null,
    pausedLeftMs: phaseDurationMs('focus'),
    todayFocusedMinutes: 0,
    todayCompleted: 0,
    streakDays: 0,
  })
  const [, rerender] = useReducer((n: number) => n + 1, 0)
  const busy = useRef(false)
  const lastShownSecond = useRef(-1)

  const commit = (patch: Partial<EngineState>) => {
    engine.current = { ...engine.current, ...patch }
    rerender()
  }

  const refreshStats = async () => {
    const [today, streak] = await Promise.all([todayStats(), currentStreakDays()])
    commit({
      todayFocusedMinutes: today.focusedMinutes,
      todayCompleted: today.completedSessions,
      streakDays: streak,
    })
  }

  const completePhase = async (endedAtMs: number) => {
    const s = engine.current
    if (!s.sessionUuid) return
    const finished = s.phase
    await appendEvent(s.sessionUuid, 'complete', new Date(endedAtMs))
    fireNow(completionBody(finished))
    const completedAfter = finished === 'focus' ? s.todayCompleted + 1 : s.todayCompleted
    const phase = nextPhase(finished, completedAfter)
    commit({
      phase,
      sessionUuid: null,
      endAt: null,
      pausedLeftMs: phaseDurationMs(phase),
      taskLabel: finished === 'focus' ? '' : s.taskLabel,
    })
    await refreshStats()
  }

  // — init: janitor, then adopt any open session from the event log —
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      await abandonStaleSessions()
      const open = await findOpenSession()
      if (cancelled) return
      if (open) {
        const plannedMs = open.plannedMinutes * 60_000
        if (open.pausedSinceMs !== null) {
          const usedMs = open.pausedSinceMs - open.startedAtMs - open.pausedMsBefore
          commit({
            ready: true,
            phase: open.kind,
            sessionUuid: open.sessionUuid,
            taskLabel: open.taskLabel ?? '',
            endAt: null,
            pausedLeftMs: Math.max(0, plannedMs - usedMs),
          })
        } else {
          const endAt = open.startedAtMs + plannedMs + open.pausedMsBefore
          commit({
            ready: true,
            phase: open.kind,
            sessionUuid: open.sessionUuid,
            taskLabel: open.taskLabel ?? '',
            endAt,
            pausedLeftMs: plannedMs,
          })
          if (endAt <= Date.now()) await completePhase(endAt)
        }
      } else {
        commit({ ready: true })
      }
      await refreshStats()
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useTick((now) => {
    const s = engine.current
    if (!s.ready) return
    if (s.endAt !== null && s.endAt <= now) {
      if (busy.current) return
      busy.current = true
      completePhase(s.endAt).finally(() => {
        busy.current = false
      })
      return
    }
    const leftMs = s.endAt !== null ? s.endAt - now : s.pausedLeftMs
    const second = Math.ceil(leftMs / 1000)
    if (second !== lastShownSecond.current) {
      lastShownSecond.current = second
      rerender()
    }
  })

  const s = engine.current
  const now = Date.now()
  const running = s.endAt !== null
  const totalMs = phaseDurationMs(s.phase)
  const leftMs = Math.max(0, running ? s.endAt! - now : s.pausedLeftMs)

  return {
    ready: s.ready,
    phase: s.phase,
    running,
    inSession: s.sessionUuid !== null,
    leftMs,
    totalMs,
    sessionNumber: (s.todayCompleted % SETTINGS.sessionsPerCycle) + 1,
    taskLabel: s.taskLabel,
    todayFocusedMinutes: s.todayFocusedMinutes,
    todayCompleted: s.todayCompleted,
    streakDays: s.streakDays,

    toggle: () => {
      if (busy.current || !s.ready) return
      busy.current = true
      ;(async () => {
        const t = Date.now()
        const cur = engine.current
        if (cur.endAt !== null) {
          // pause
          await appendEvent(cur.sessionUuid!, 'pause', new Date(t))
          await cancelScheduled()
          commit({ endAt: null, pausedLeftMs: Math.max(0, cur.endAt - t) })
        } else if (cur.sessionUuid !== null) {
          // resume
          await appendEvent(cur.sessionUuid, 'resume', new Date(t))
          const endAt = t + cur.pausedLeftMs
          await scheduleCompletion(endAt, completionBody(cur.phase))
          commit({ endAt })
        } else {
          // start a fresh session
          await requestNotificationPermission()
          const sessionUuid = crypto.randomUUID()
          const label = cur.phase === 'focus' && cur.taskLabel.trim() ? cur.taskLabel.trim() : null
          await appendEvent(sessionUuid, 'start', new Date(t), {
            kind: cur.phase,
            plannedMinutes: Math.round(phaseDurationMs(cur.phase) / 60_000),
            taskLabel: label,
          })
          const endAt = t + phaseDurationMs(cur.phase)
          await scheduleCompletion(endAt, completionBody(cur.phase))
          commit({ sessionUuid, endAt })
        }
      })().finally(() => {
        busy.current = false
      })
    },

    setTaskLabel: (label: string) => commit({ taskLabel: label }),
  }
}
