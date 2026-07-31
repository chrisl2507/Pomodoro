/* Session behavior in one place — the values the design exposes as its
   configurable props. Change these, not literals in the views. */

export type Phase = 'focus' | 'short' | 'long'

export const SETTINGS = {
  /** Minutes per phase. */
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  /** Start the next phase immediately when one completes. */
  autoContinue: true,
  /** Breathing halo behind the ring while running. */
  glow: true,
  /** Sessions per day the stats row counts toward. */
  dailyGoal: 8,
  /** Focus sessions per cycle — a long break follows the fourth. */
  sessionsPerCycle: 4,
  /** Backdrop shown before the user picks one. */
  defaultBackdrop: 'aurora' as BackdropId,
} as const

export type BackdropId = 'aurora' | 'stars' | 'grid' | 'ember' | 'rain' | 'rings'

export function phaseDurationMs(phase: Phase): number {
  const minutes =
    phase === 'focus'
      ? SETTINGS.focusMinutes
      : phase === 'short'
        ? SETTINGS.shortBreakMinutes
        : SETTINGS.longBreakMinutes
  return Math.round(minutes * 60_000)
}
