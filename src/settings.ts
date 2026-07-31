/* Session behavior and feature flags in one place — no literals in views. */

export type Phase = 'focus' | 'short_break' | 'long_break'

export const SETTINGS = {
  /** Minutes per phase. */
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  /** Focus sessions per cycle — a long break follows the last. */
  sessionsPerCycle: 4,
  /** Start the next phase automatically when one completes. Off: Span's
      Focus screen has a single deliberate start/pause control. */
  autoContinue: false,
  /** Default label shown for a focus session. */
  sessionLabel: 'deep work',
  /** In-progress sessions older than this get an `abandon` appended by the
      launch janitor. */
  abandonAfterHours: 24,
} as const

export const FLAGS = {
  /** The intended paid-tier boundary. The free/paid split is not final —
      everything Insights renders is gated on this single flag. */
  insights: true,
} as const

export function phaseDurationMs(phase: Phase): number {
  const minutes =
    phase === 'focus'
      ? SETTINGS.focusMinutes
      : phase === 'short_break'
        ? SETTINGS.shortBreakMinutes
        : SETTINGS.longBreakMinutes
  return Math.round(minutes * 60_000)
}

export function phaseName(phase: Phase): string {
  return phase === 'focus' ? SETTINGS.sessionLabel : phase === 'short_break' ? 'short break' : 'long break'
}
