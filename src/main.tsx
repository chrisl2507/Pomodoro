import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BRAND } from './brand'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'
import './styles/span.css'

function isCapacitorNative(): boolean {
  const w = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }
  return Boolean(w.Capacitor?.isNativePlatform?.())
}

/* Debug/scripting hook — dev and local test builds only. Capacitor shells
   also serve from a "localhost" origin, so the native check comes first;
   store builds never expose it. */
if (!isCapacitorNative() && (import.meta.env.DEV || location.hostname === 'localhost')) {
  Promise.all([import('./db/db'), import('./db/events')]).then(([db, events]) => {
    ;(window as unknown as Record<string, unknown>).__span = {
      getDb: db.getDb,
      appendEvent: events.appendEvent,
      exportEvents: events.exportEvents,
    }
  })
}

/* Two web tabs would each hold an in-memory copy of the database and
   clobber each other's IndexedDB image — the first tab takes a Web Lock
   for the page's lifetime and later tabs stand down. Native shells are
   single-instance and always acquire it. */
let lockPromise: Promise<boolean> | null = null

function acquireSingleInstanceLock(): Promise<boolean> {
  if (lockPromise) return lockPromise // StrictMode mounts twice; one lock
  lockPromise = requestLock()
  return lockPromise
}

function requestLock(): Promise<boolean> {
  if (!('locks' in navigator)) return Promise.resolve(true)
  return new Promise((resolve) => {
    navigator.locks
      .request(`${BRAND.name}-db`, { ifAvailable: true }, (lock) => {
        if (!lock) {
          resolve(false)
          return
        }
        resolve(true)
        return new Promise<void>(() => {}) // hold until the page goes away
      })
      .catch(() => resolve(true))
  })
}

function Root() {
  const [lockState, setLockState] = useState<'pending' | 'granted' | 'blocked'>('pending')

  useEffect(() => {
    let cancelled = false
    acquireSingleInstanceLock().then((granted) => {
      if (!cancelled) setLockState(granted ? 'granted' : 'blocked')
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (lockState === 'pending') return null
  if (lockState === 'blocked') {
    return (
      <div className="splash">
        <span className="wordmark">
          {BRAND.name}
          <span className="wordmark-cursor">{BRAND.cursor}</span>
        </span>
        <span className="splash-tagline">already open in another tab</span>
      </div>
    )
  }
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
