import { memo } from 'react'
import type { CSSProperties } from 'react'
import type { BackdropId } from './settings'

/* Scene particle data mirrors the prototype element-for-element: position,
   size, ramp step, glow, duration and delay. */

const mix = (color: string, pct: number) => `color-mix(in srgb, ${color} ${pct}%, transparent)`
const ACCENT = 'var(--color-accent)'

const EMBERS: Array<{
  left: string
  size: number
  color: string
  glow?: { radius: number; alpha: number }
  blur?: number
  anim: string
}> = [
  { left: '14%', size: 3, color: 'var(--color-accent-300)', glow: { radius: 8, alpha: 80 }, anim: 'noc-float-up 15s linear infinite' },
  { left: '27%', size: 2, color: 'var(--color-accent-400)', anim: 'noc-float-up-b 21s linear infinite 2s' },
  { left: '38%', size: 4, color: 'var(--color-accent-400)', blur: 0.4, glow: { radius: 10, alpha: 70 }, anim: 'noc-float-up 18s linear infinite 5s' },
  { left: '52%', size: 2, color: 'var(--color-accent-200)', anim: 'noc-float-up-b 26s linear infinite 8s' },
  { left: '63%', size: 3, color: 'var(--color-accent-500)', glow: { radius: 9, alpha: 60 }, anim: 'noc-float-up 17s linear infinite 3s' },
  { left: '74%', size: 2, color: 'var(--color-accent-300)', anim: 'noc-float-up-b 23s linear infinite 12s' },
  { left: '86%', size: 3, color: 'var(--color-accent-400)', blur: 0.5, anim: 'noc-float-up 20s linear infinite 6s' },
  { left: '94%', size: 2, color: 'var(--color-accent-200)', anim: 'noc-float-up-b 29s linear infinite 15s' },
]

const NEUTRAL_300 = 'var(--color-neutral-300)'
const NEUTRAL_400 = 'var(--color-neutral-400)'

const RAINDROPS: Array<{
  left: string
  width: number
  height: number
  color: string
  alpha: number
  anim: string
}> = [
  { left: '4%', width: 1.5, height: 64, color: NEUTRAL_300, alpha: 42, anim: 'noc-drop 1.5s linear infinite' },
  { left: '11%', width: 1, height: 46, color: NEUTRAL_400, alpha: 34, anim: 'noc-drop 2.1s linear infinite 0.5s' },
  { left: '18%', width: 1.5, height: 82, color: NEUTRAL_300, alpha: 36, anim: 'noc-drop 1.2s linear infinite 0.9s' },
  { left: '26%', width: 1, height: 54, color: ACCENT, alpha: 40, anim: 'noc-drop 1.8s linear infinite 0.2s' },
  { left: '33%', width: 1.5, height: 70, color: NEUTRAL_400, alpha: 30, anim: 'noc-drop 1.35s linear infinite 1.1s' },
  { left: '41%', width: 1, height: 40, color: NEUTRAL_300, alpha: 30, anim: 'noc-drop 2.4s linear infinite 0.3s' },
  { left: '48%', width: 1.5, height: 90, color: NEUTRAL_300, alpha: 40, anim: 'noc-drop 1.15s linear infinite 0.7s' },
  { left: '56%', width: 1, height: 58, color: NEUTRAL_400, alpha: 32, anim: 'noc-drop 1.95s linear infinite 1.4s' },
  { left: '63%', width: 1.5, height: 66, color: ACCENT, alpha: 36, anim: 'noc-drop 1.55s linear infinite 0.1s' },
  { left: '71%', width: 1, height: 48, color: NEUTRAL_300, alpha: 28, anim: 'noc-drop 2.2s linear infinite 0.8s' },
  { left: '78%', width: 1.5, height: 76, color: NEUTRAL_400, alpha: 34, anim: 'noc-drop 1.3s linear infinite 1.6s' },
  { left: '86%', width: 1, height: 52, color: NEUTRAL_300, alpha: 32, anim: 'noc-drop 1.75s linear infinite 0.45s' },
  { left: '93%', width: 1.5, height: 62, color: ACCENT, alpha: 34, anim: 'noc-drop 1.45s linear infinite 1.2s' },
]

function emberStyle(e: (typeof EMBERS)[number]): CSSProperties {
  return {
    left: e.left,
    width: e.size,
    height: e.size,
    background: e.color,
    boxShadow: e.glow ? `0 0 ${e.glow.radius}px ${mix(ACCENT, e.glow.alpha)}` : undefined,
    filter: e.blur ? `blur(${e.blur}px)` : undefined,
    animation: e.anim,
  }
}

function dropStyle(d: (typeof RAINDROPS)[number]): CSSProperties {
  return {
    left: d.left,
    width: d.width,
    height: d.height,
    background: `linear-gradient(to bottom, transparent, ${mix(d.color, d.alpha)})`,
    animation: d.anim,
  }
}

export const Backdrop = memo(function Backdrop({ id }: { id: BackdropId }) {
  return (
    <div className="backdrop" aria-hidden="true">
      {id === 'aurora' && (
        <>
          <div className="backdrop-layer aurora-sky" />
          <div className="aurora-curtain aurora-curtain--a" />
          <div className="aurora-curtain aurora-curtain--b" />
          <div className="aurora-ground" />
          <div className="backdrop-layer aurora-scrim" />
        </>
      )}
      {id === 'stars' && (
        <>
          <div className="backdrop-layer stars-nebula" />
          <div className="stars-field stars-field--near" />
          <div className="stars-field stars-field--mid" />
          <div className="stars-field stars-field--far" />
          <div className="stars-shooting stars-shooting--a" />
          <div className="stars-shooting stars-shooting--b" />
          <div className="backdrop-layer stars-scrim" />
        </>
      )}
      {id === 'grid' && (
        <>
          <div className="grid-sky" />
          <div className="grid-horizon-glow" />
          <div className="grid-perspective">
            <div className="grid-plane" />
          </div>
          <div className="grid-horizon-line" />
          <div className="backdrop-layer grid-scrim" />
        </>
      )}
      {id === 'ember' && (
        <>
          <div className="backdrop-layer ember-glow" />
          {EMBERS.map((e, i) => (
            <span key={i} className="ember" style={emberStyle(e)} />
          ))}
        </>
      )}
      {id === 'rain' && (
        <>
          <div className="backdrop-layer rain-sky" />
          <div className="rain-tilt">
            {RAINDROPS.map((d, i) => (
              <span key={i} className="rain-drop" style={dropStyle(d)} />
            ))}
          </div>
          <div className="backdrop-layer rain-scrim" />
        </>
      )}
      {id === 'rings' && (
        <>
          <div className="backdrop-layer rings-ground" />
          <div className="rings-ring" />
          <div className="rings-ring rings-ring--b" />
          <div className="rings-ring rings-ring--c" />
          <div className="rings-core" />
        </>
      )}
    </div>
  )
})
