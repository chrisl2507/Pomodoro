import { phaseName } from '../settings'
import type { TimerSnapshot } from '../useTimer'

function formatCountdown(ms: number): string {
  const clamped = Math.max(0, ms)
  const mins = Math.floor(clamped / 60_000)
  const secs = Math.floor((clamped % 60_000) / 1000)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
}

export function FocusScreen({ timer }: { timer: TimerSnapshot }) {
  const progress = timer.totalMs > 0 ? 1 - timer.leftMs / timer.totalMs : 0
  const controlLabel = timer.running ? 'pause' : timer.inSession ? 'resume' : 'start'

  return (
    <main className="focus-screen">
      <div className="session-label">{phaseName(timer.phase)}</div>

      <div className="countdown" role="timer" aria-live="off">
        {formatCountdown(timer.leftMs)}
      </div>

      {timer.phase === 'focus' ? (
        timer.inSession ? (
          <div className="task-static">{timer.taskLabel || ' '}</div>
        ) : (
          <input
            className="task-input"
            type="text"
            value={timer.taskLabel}
            onChange={(e) => timer.setTaskLabel(e.target.value)}
            placeholder="add a label"
            maxLength={60}
            aria-label="Task label"
          />
        )
      ) : (
        <div className="task-static">&nbsp;</div>
      )}

      <div className="progress" aria-hidden="true">
        <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="chips">
        <div className="chip">
          <span className="chip-value">{formatDuration(timer.todayFocusedMinutes)}</span>
          <span className="chip-label">focused today</span>
        </div>
        <div className="chip">
          <span className="chip-value">
            {timer.streakDays} {timer.streakDays === 1 ? 'day' : 'days'}
          </span>
          <span className="chip-label">streak</span>
        </div>
      </div>

      <button type="button" className="control" onClick={timer.toggle} disabled={!timer.ready}>
        {controlLabel}
      </button>
    </main>
  )
}
