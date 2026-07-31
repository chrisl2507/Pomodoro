/* Functional checks for the Span engine + event store against a served build. */
import { chromium } from 'playwright-core'

const url = process.argv[2] || 'http://localhost:4173/'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 402, height: 874 } })

const results = []
const check = (name, ok, detail = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)

const countdown = () => page.locator('.countdown').innerText()
const events = () =>
  page.evaluate(async () => {
    const db = await window.__span.getDb()
    return db.query('SELECT event_type, session_kind, planned_minutes, task_label FROM events ORDER BY event_id')
  })

await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => indexedDB.deleteDatabase('span-db'))
await page.reload({ waitUntil: 'networkidle' })
await page.waitForSelector('.countdown', { timeout: 10000 })

check('initial countdown', (await countdown()) === '25:00', await countdown())

// Start with a task label → a start event with the label
await page.getByPlaceholder('add a label').fill('deep work spec')
await page.getByRole('button', { name: 'start' }).click()
await page.waitForTimeout(3200)
const running = await countdown()
check('ticks while running', ['24:57', '24:56'].includes(running), running)

let ev = await events()
check(
  'start event written',
  ev.length === 1 &&
    ev[0].event_type === 'start' &&
    ev[0].session_kind === 'focus' &&
    ev[0].planned_minutes === 25 &&
    ev[0].task_label === 'deep work spec',
  JSON.stringify(ev),
)

// Pause → pause event, countdown frozen
await page.getByRole('button', { name: 'pause' }).click()
await page.waitForTimeout(300)
const paused = await countdown()
await page.waitForTimeout(1500)
check('pause freezes countdown', (await countdown()) === paused, `${paused} → ${await countdown()}`)
ev = await events()
check('pause event written', ev.length === 2 && ev[1].event_type === 'pause', JSON.stringify(ev.map((e) => e.event_type)))

// Reload while paused → session reconstructed from the event log
await page.reload({ waitUntil: 'networkidle' })
await page.waitForSelector('.countdown', { timeout: 10000 })
check('paused session survives relaunch', (await countdown()) === paused, `${paused} → ${await countdown()}`)
check('resume offered', (await page.getByRole('button', { name: 'resume' }).count()) === 1)

// Resume → resume event, ticking again
await page.getByRole('button', { name: 'resume' }).click()
await page.waitForTimeout(2200)
ev = await events()
check('resume event written', ev[2]?.event_type === 'resume', JSON.stringify(ev.map((e) => e.event_type)))
check('ticks after resume', (await countdown()) < paused, `${paused} → ${await countdown()}`)

// Reload while running → still running, remaining time derived from endAt
await page.reload({ waitUntil: 'networkidle' })
await page.waitForSelector('.countdown', { timeout: 10000 })
check('running session survives relaunch', (await page.getByRole('button', { name: 'pause' }).count()) === 1)

// Seed a completed session through the same append path and confirm the
// sessions view + chips see it.
await page.evaluate(async () => {
  const uuid = crypto.randomUUID()
  const start = new Date(Date.now() - 30 * 60000)
  const end = new Date(Date.now() - 5 * 60000)
  await window.__span.appendEvent(uuid, 'start', start, {
    kind: 'focus',
    plannedMinutes: 25,
    taskLabel: 'seeded',
  })
  await window.__span.appendEvent(uuid, 'complete', end)
})
await page.waitForTimeout(700) // let the debounced IndexedDB persist land
await page.reload({ waitUntil: 'networkidle' })
await page.waitForSelector('.chip-value', { timeout: 10000 })
// Chips fill in asynchronously once the stats queries return.
let chip = ''
for (let i = 0; i < 20 && chip !== '25m'; i++) {
  chip = await page.locator('.chip-value').first().innerText()
  if (chip !== '25m') await page.waitForTimeout(250)
}
check('sessions view feeds chips', chip === '25m', chip)
const streak = await page.locator('.chip-value').nth(1).innerText()
check('streak query runs', streak === '1 day', streak)

await browser.close()
console.log(results.join('\n'))
process.exitCode = results.some((r) => r.startsWith('FAIL')) ? 1 : 0
