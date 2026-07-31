import { useEffect, useState } from 'react'
import { BACKDROPS } from './backdrops'
import { SETTINGS, phaseDurationMs, type BackdropId, type Phase } from './settings'

const RING_RADIUS = 172
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS // 1080.7

const PHASE_NAMES: Record<Phase, string> = {
  focus: 'Focus',
  short: 'Short break',
  long: 'Long break',
}

function formatTime(ms: number): string {
  const clamped = Math.max(0, ms)
  const mins = Math.floor(clamped / 60_000)
  const secs = Math.floor((clamped % 60_000) / 1000)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function formatClock(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function useWallClock(): string {
  const [text, setText] = useState(() => formatClock(new Date()))
  useEffect(() => {
    const id = setInterval(() => setText(formatClock(new Date())), 1000)
    return () => clearInterval(id)
  }, [])
  return text
}

export default function App() {
  const clockText = useWallClock()
  const [phase, setPhase] = useState<Phase>('focus')
  const [backdrop, setBackdrop] = useState<BackdropId>(SETTINGS.defaultBackdrop)

  // Stage 1: static screen — the timer engine lands in stage 2.
  const totalMs = phaseDurationMs(phase)
  const leftMs = totalMs
  const running = false
  const completed = 0
  const focusMinutesDone = 0

  const progress = 1 - leftMs / totalMs
  const dashOffset = RING_CIRCUMFERENCE * (1 - progress)

  const filledDots =
    completed > 0 && completed % SETTINGS.sessionsPerCycle === 0
      ? SETTINGS.sessionsPerCycle
      : completed % SETTINGS.sessionsPerCycle
  const cycleNumber = Math.floor(completed / SETTINGS.sessionsPerCycle) + 1
  const nextUp =
    phase === 'focus'
      ? (completed + 1) % SETTINGS.sessionsPerCycle === 0
        ? 'long break'
        : 'short break'
      : 'focus'

  return (
    <div className="screen">
      <div className="screen-content">
        <header className="header">
          <div className="brand">
            <span className="brand-name">Nocturne</span>
            <span className="brand-dash" aria-hidden="true" />
            <span className="brand-app">Focus</span>
          </div>
          <span className="clock">{clockText}</span>
        </header>

        <div className="mode-switch" role="group" aria-label="Timer phase">
          {(['focus', 'short', 'long'] as const).map((p) => (
            <button
              key={p}
              type="button"
              className="mode-btn"
              aria-pressed={phase === p}
              onClick={() => setPhase(p)}
            >
              {p === 'focus' ? 'Focus' : p === 'short' ? 'Short' : 'Long'}
              {phase === p && <span className="mode-underline" aria-hidden="true" />}
            </button>
          ))}
        </div>

        <main className="main">
          <div className="dial">
            <div className="halo" aria-hidden="true" />
            <svg className="dial-svg" viewBox="0 0 392 392" aria-hidden="true">
              <circle className="dial-track" cx="196" cy="196" r={RING_RADIUS} />
              <circle
                className="dial-progress"
                cx="196"
                cy="196"
                r={RING_RADIUS}
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
              />
            </svg>
            <div className="dial-center">
              <div className="phase-label">
                <span
                  className={`phase-dot ${running ? 'phase-dot--running' : 'phase-dot--paused'}`}
                  aria-hidden="true"
                />
                {PHASE_NAMES[phase]}
              </div>
              <div className="time" role="timer" aria-live="off">
                {formatTime(leftMs)}
              </div>
              <div className="time-sub">
                {phase === 'focus'
                  ? `of ${Math.round(totalMs / 60_000)} minutes`
                  : 'step away from the screen'}
              </div>
            </div>
          </div>

          <div className="cycle">
            {Array.from({ length: SETTINGS.sessionsPerCycle }, (_, i) => (
              <span
                key={i}
                className={`cycle-dot ${i < filledDots ? 'cycle-dot--filled' : ''}`}
                aria-hidden="true"
              />
            ))}
            <span className="cycle-meta">
              Cycle {cycleNumber} · next {nextUp}
            </span>
          </div>

          <div className="actions">
            <button type="button" className="btn btn-primary actions-primary">
              Start focus
            </button>
            <div className="actions-row">
              <button type="button" className="btn btn-ghost actions-secondary">
                Reset
              </button>
              <button type="button" className="btn btn-ghost actions-secondary">
                Skip →
              </button>
            </div>
          </div>
        </main>

        <footer className="footer">
          <div className="stats">
            <div className="stats-left">
              <span className="stats-minutes">{focusMinutesDone}</span>
              <span className="stats-caption">min focused today</span>
            </div>
            <span className="stats-caption">
              {completed} / {SETTINGS.dailyGoal} sessions
            </span>
          </div>
          <div className="picker" role="group" aria-label="Backdrop">
            {BACKDROPS.map((b) => (
              <button
                key={b.id}
                type="button"
                className="picker-btn"
                aria-pressed={backdrop === b.id}
                onClick={() => setBackdrop(b.id)}
              >
                <span className={`picker-swatch swatch--${b.id}`} aria-hidden="true" />
                <span className="picker-label">{b.label}</span>
              </button>
            ))}
          </div>
        </footer>
      </div>
    </div>
  )
}
