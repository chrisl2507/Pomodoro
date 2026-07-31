import { useEffect, useState } from 'react'
import { exportEvents, exportEventsCsv } from '../db/events'
import { loadInsights, type InsightsData } from './insightsData'
import type { TrendDay, HourBucket } from '../db/queries'

/* Insights — 14-day scope. Accent appears only on data marks (sparkline,
   heatmap); the delta arrows are the palette's one green, positive only. */

function MetricCard({
  value,
  label,
  current,
  previous,
  higherIsBetter = true,
}: {
  value: string
  label: string
  current: number | null
  previous: number | null
  higherIsBetter?: boolean
}) {
  let delta: { pct: number; up: boolean; good: boolean } | null = null
  if (current !== null && previous !== null && previous > 0) {
    const pct = Math.round(((current - previous) / previous) * 100)
    if (pct !== 0) delta = { pct: Math.abs(pct), up: pct > 0, good: pct > 0 === higherIsBetter }
  }
  return (
    <div className="metric-card">
      <div className="metric-value">{value}</div>
      <div className="metric-foot">
        <span className="metric-label">{label}</span>
        {delta && (
          <span className={`metric-delta ${delta.good ? 'metric-delta--good' : ''}`}>
            {delta.up ? '↑' : '↓'} {delta.pct}%
          </span>
        )}
      </div>
    </div>
  )
}

function Sparkline({ trend }: { trend: TrendDay[] }) {
  const days: number[] = []
  const labels: string[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const row = trend.find((t) => t.local_day === key)
    days.push(row?.focused_minutes ?? 0)
    labels.push(key)
  }
  const w = 320
  const h = 56
  const pad = 4
  const max = Math.max(...days, 1)
  const x = (i: number) => pad + (i * (w - 2 * pad)) / 13
  const y = (v: number) => h - pad - (v / max) * (h - 2 * pad)
  const points = days.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
  const last = days.length - 1
  return (
    <svg
      className="sparkline"
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`Focused minutes per day, last 14 days. Today: ${days[last]} minutes.`}
    >
      <line className="sparkline-base" x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} />
      <polyline className="sparkline-line" points={points} />
      <circle className="sparkline-dot" cx={x(last)} cy={y(days[last])} r="3.5" />
      {days.map((v, i) => (
        <rect key={i} x={x(i) - w / 28} y={0} width={w / 14} height={h} fill="transparent">
          <title>{`${labels[i]} — ${v} min`}</title>
        </rect>
      ))}
    </svg>
  )
}

const HEAT_START_HOUR = 6 // the spec's 6am–6pm axis
const HEAT_CELLS = 12

function Heatmap({ hours }: { hours: HourBucket[] }) {
  const cells = Array.from({ length: HEAT_CELLS }, (_, i) => {
    const hour = HEAT_START_HOUR + i
    const row = hours.find((h) => h.local_hour === hour)
    return { hour, minutes: row?.focused_minutes ?? 0, sessions: row?.sessions_completed ?? 0 }
  })
  const max = Math.max(...cells.map((c) => c.minutes), 1)
  const level = (m: number) => (m <= 0 ? 0 : m <= max / 3 ? 1 : m <= (2 * max) / 3 ? 2 : 3)
  const hourText = (h: number) => `${h % 12 === 0 ? 12 : h % 12}${h < 12 ? 'am' : 'pm'}`
  return (
    <div>
      <div className="heatmap-row">
        {cells.map((c) => (
          <div
            key={c.hour}
            className={`heat-cell heat-cell--${level(c.minutes)}`}
            role="img"
            aria-label={`${hourText(c.hour)} — ${c.minutes} minutes, ${c.sessions} sessions`}
            title={`${hourText(c.hour)} — ${c.minutes} min · ${c.sessions} sessions`}
          />
        ))}
      </div>
      <div className="heat-axis">
        <span>6am</span>
        <span>12pm</span>
        <span>6pm</span>
      </div>
    </div>
  )
}

/* The user-facing backup: the events table itself, copied to the
   clipboard as JSON or CSV — works identically in browsers and WebViews. */
function ExportRow() {
  const [copied, setCopied] = useState<'json' | 'csv' | null>(null)

  const copy = (kind: 'json' | 'csv') => async () => {
    try {
      const text = kind === 'json' ? await exportEvents() : await exportEventsCsv()
      await navigator.clipboard.writeText(text)
      setCopied(kind)
      setTimeout(() => setCopied(null), 1600)
    } catch {
      /* clipboard denied — nothing to report beyond the unchanged label */
    }
  }

  return (
    <div className="export-row">
      <span className="export-label">export data</span>
      <button type="button" className="export-btn" onClick={copy('json')}>
        {copied === 'json' ? 'copied' : 'json'}
      </button>
      <button type="button" className="export-btn" onClick={copy('csv')}>
        {copied === 'csv' ? 'copied' : 'csv'}
      </button>
    </div>
  )
}

export function InsightsScreen({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<InsightsData | null>(null)

  useEffect(() => {
    let cancelled = false
    loadInsights().then((d) => {
      if (!cancelled) setData(d)
    })
    return () => {
      cancelled = true
    }
  }, [refreshKey])

  if (!data) return <main className="insights" />

  if (data.totalFinished === 0) {
    return (
      <main className="insights">
        <p className="insights-empty">No sessions yet. Insights build as you focus.</p>
        <ExportRow />
      </main>
    )
  }

  const hours = data.headline.total_hours_14d ?? 0
  const completion = data.headline.completion_pct_14d ?? 0

  return (
    <main className="insights">
      <div className="insights-scope">last 14 days</div>

      <div className="metric-row">
        <MetricCard
          value={`${hours}h`}
          label="focused"
          current={hours}
          previous={data.prev.total_hours_14d}
        />
        <MetricCard
          value={`${completion}%`}
          label="completion"
          current={completion}
          previous={data.prev.completion_pct_14d}
        />
      </div>

      <section className="panel">
        <h2 className="panel-title">focus trend</h2>
        <Sparkline trend={data.trend} />
      </section>

      <section className="panel">
        <h2 className="panel-title">your best hours</h2>
        <Heatmap hours={data.hours} />
      </section>

      {data.sentences.length > 0 && (
        <section className="sentences" aria-label="Insights">
          {data.sentences.map((s) => (
            <p key={s} className="sentence">
              {s}
            </p>
          ))}
        </section>
      )}

      <ExportRow />
    </main>
  )
}
