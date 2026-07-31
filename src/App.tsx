import { lazy, Suspense, useEffect, useState } from 'react'
import { BRAND } from './brand'
import { FLAGS, SETTINGS } from './settings'
import { useTimer } from './useTimer'
import { FocusScreen } from './ui/FocusScreen'
import { Wordmark } from './ui/Wordmark'

const InsightsScreen = lazy(() =>
  import('./ui/InsightsScreen').then((m) => ({ default: m.InsightsScreen })),
)

type Tab = 'focus' | 'insights'
type ThemeChoice = 'dark' | 'paper'

const THEME_KEY = `${BRAND.name}-theme`

function initialTheme(): ThemeChoice {
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'dark' || saved === 'paper') return saved
  } catch {
    /* fall through to system preference */
  }
  return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'paper' : 'dark'
}

export default function App() {
  const timer = useTimer()
  const [tab, setTab] = useState<Tab>('focus')
  const [theme, setTheme] = useState<ThemeChoice>(initialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(THEME_KEY, theme)
    } catch {
      /* preference just won't persist */
    }
  }, [theme])

  if (!timer.ready) {
    return (
      <div className="splash">
        <Wordmark idle />
        <span className="splash-tagline">{BRAND.tagline}</span>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="topbar">
        <Wordmark idle={!timer.running} />
        <div className="topbar-meta">
          <span className="session-count">
            session {timer.sessionNumber} of {SETTINGS.sessionsPerCycle}
          </span>
          <button
            type="button"
            className="theme-btn"
            onClick={() => setTheme(theme === 'dark' ? 'paper' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to paper mode' : 'Switch to dark mode'}
          >
            ◐
          </button>
        </div>
      </header>

      {FLAGS.insights && (
        <nav className="tabs" role="tablist" aria-label="Screens">
          <button
            type="button"
            role="tab"
            className="tab"
            aria-selected={tab === 'focus'}
            onClick={() => setTab('focus')}
          >
            focus
          </button>
          <button
            type="button"
            role="tab"
            className="tab"
            aria-selected={tab === 'insights'}
            onClick={() => setTab('insights')}
          >
            insights
          </button>
        </nav>
      )}

      {tab === 'focus' || !FLAGS.insights ? (
        <FocusScreen timer={timer} />
      ) : (
        <Suspense fallback={null}>
          <InsightsScreen refreshKey={timer.todayCompleted} />
        </Suspense>
      )}
    </div>
  )
}
