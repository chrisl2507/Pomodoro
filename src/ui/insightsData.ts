import {
  bestHours,
  fatigueCurve,
  focusTrend14d,
  headline14d,
  headlinePrev14d,
  MIN_SAMPLE,
  morningMultiplier,
  taskLabelEffect,
  type Headline,
  type HourBucket,
  type TrendDay,
} from '../db/queries'

/* Assembles everything the Insights screen renders. Sentences follow the
   spec's rule: each renders only when its backing query passes MIN_SAMPLE —
   a 100% completion rate from two sessions is noise, not insight. */

export type InsightsData = {
  headline: Headline
  prev: Headline
  trend: TrendDay[]
  hours: HourBucket[]
  totalFinished: number
  sentences: string[]
}

function hourLabel(h: number): string {
  const twelve = h % 12 === 0 ? 12 : h % 12
  return `${twelve}${h < 12 ? 'am' : 'pm'}`
}

function rangeLabel(startHour: number, endHour: number): string {
  const sameMeridiem = startHour < 12 === endHour < 12
  const start = sameMeridiem
    ? String(startHour % 12 === 0 ? 12 : startHour % 12)
    : hourLabel(startHour)
  return `${start}–${hourLabel(endHour)}`
}

function peakSentence(hours: HourBucket[], totalFinished: number): string | null {
  if (totalFinished < MIN_SAMPLE) return null
  let best: { start: number; completed: number } | null = null
  for (const a of hours) {
    const b = hours.find((x) => x.local_hour === a.local_hour + 1)
    const completed = a.sessions_completed + (b?.sessions_completed ?? 0)
    if (completed > 0 && (!best || completed > best.completed)) {
      best = { start: a.local_hour, completed }
    }
  }
  if (!best) return null
  return `Peak focus: ${rangeLabel(best.start, best.start + 2)}.`
}

function multiplierSentence(
  ratio: number | null,
  hours: HourBucket[],
  totalFinished: number,
): string | null {
  if (ratio === null || totalFinished < MIN_SAMPLE) return null
  const morning = hours
    .filter((h) => h.local_hour < 12)
    .reduce((n, h) => n + h.sessions_completed, 0)
  const afternoon = hours
    .filter((h) => h.local_hour >= 12)
    .reduce((n, h) => n + h.sessions_completed, 0)
  if (morning === 0 || afternoon === 0) return null
  if (ratio >= 1.1) return `You complete ${ratio}× more sessions before noon.`
  if (ratio > 0 && ratio <= 0.9) {
    return `You complete ${Math.round((1 / ratio) * 10) / 10}× more sessions after noon.`
  }
  return null
}

async function fatigueSentence(): Promise<string | null> {
  const rows = await fatigueCurve() // each row already carries n >= MIN_SAMPLE
  if (rows.length < 2) return null
  const first = rows[0]
  if (first.completion_pct <= 0) return null
  const worst = rows
    .slice(1)
    .filter((r) => r.session_no >= 3)
    .sort((a, b) => a.completion_pct - b.completion_pct)[0]
  if (!worst) return null
  const drop = Math.round(100 * (1 - worst.completion_pct / first.completion_pct))
  if (drop < 20) return null
  const ordinal =
    worst.session_no === 1 ? '1st' : worst.session_no === 2 ? '2nd' : worst.session_no === 3 ? '3rd' : `${worst.session_no}th`
  return `Your ${ordinal} session of the day is ${drop}% less likely to finish.`
}

async function taskSentence(): Promise<string | null> {
  const rows = await taskLabelEffect() // rows already carry n >= MIN_SAMPLE
  if (rows.length < 2) return null
  const best = rows[0]
  const worst = rows[rows.length - 1]
  const bestAbandon = 100 - best.completion_pct
  const worstAbandon = 100 - worst.completion_pct
  if (worstAbandon <= 0 || bestAbandon <= 0) return null
  const factor = Math.round((worstAbandon / bestAbandon) * 10) / 10
  if (factor < 1.5) return null
  return `You abandon '${worst.task_label}' sessions ${factor}× as often as '${best.task_label}'.`
}

export async function loadInsights(): Promise<InsightsData> {
  const [headline, prev, trend, hours, ratio] = await Promise.all([
    headline14d(),
    headlinePrev14d(),
    focusTrend14d(),
    bestHours(),
    morningMultiplier(),
  ])
  const totalFinished = hours.reduce((n, h) => n + h.sessions_started, 0)

  const sentences: string[] = []
  const peak = peakSentence(hours, totalFinished)
  if (peak) sentences.push(peak)
  const mult = multiplierSentence(ratio, hours, totalFinished)
  if (mult) sentences.push(mult)
  const fatigue = await fatigueSentence()
  if (fatigue) sentences.push(fatigue)
  const task = await taskSentence()
  if (task) sentences.push(task)

  return { headline, prev, trend, hours, totalFinished, sentences }
}
