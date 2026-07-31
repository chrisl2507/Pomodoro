import { useEffect, useRef } from 'react'

/* A 200ms heartbeat from a dedicated worker. Page timers are throttled to
   ~1/min in hidden tabs, which would delay phase completion; worker timers
   are not. Falls back to a page interval where workers are unavailable.
   visibility/pageshow re-fire the callback immediately so a suspended page
   catches up the moment it returns. */
export function useTick(onTick: (now: number) => void): void {
  const handler = useRef(onTick)
  handler.current = onTick

  useEffect(() => {
    const step = () => handler.current(Date.now())
    let stop: () => void
    try {
      const src = 'setInterval(function(){postMessage(0)},200)'
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }))
      const worker = new Worker(url)
      worker.onmessage = step
      stop = () => {
        worker.terminate()
        URL.revokeObjectURL(url)
      }
    } catch {
      const id = setInterval(step, 200)
      stop = () => clearInterval(id)
    }
    document.addEventListener('visibilitychange', step)
    window.addEventListener('pageshow', step)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', step)
      window.removeEventListener('pageshow', step)
    }
  }, [])
}
