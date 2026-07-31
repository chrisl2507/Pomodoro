/* Quick functional check of the timer engine against the built app. */
import { chromium } from 'playwright-core'

const url = process.argv[2] || 'http://localhost:4173/'
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: 402, height: 874 } })

const timeText = () => page.locator('.time').innerText()
const results = []
const check = (name, ok, detail = '') =>
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`)

await page.goto(url, { waitUntil: 'networkidle' })

check('initial countdown', (await timeText()) === '25:00', await timeText())

// Start, wait ~3.2s, remaining should be 24:57 or 24:56 (derived, not accumulated)
await page.getByRole('button', { name: 'Start focus' }).click()
await page.waitForTimeout(3200)
const running = await timeText()
check('ticks while running', ['24:57', '24:56'].includes(running), running)

// Pause holds the value
await page.getByRole('button', { name: 'Pause' }).click()
const paused = await timeText()
await page.waitForTimeout(1500)
check('pause freezes countdown', (await timeText()) === paused, `${paused} → ${await timeText()}`)

// Skip completes the focus phase: short break, one dot filled, 1 session
await page.getByRole('button', { name: 'Skip →' }).click()
await page.waitForTimeout(300)
check('skip → short break', (await page.locator('.phase-label').innerText()) === 'SHORT BREAK')
check('dot filled', (await page.locator('.cycle-dot--filled').count()) === 1)
check(
  'session counted',
  (await page.locator('.stats').innerText()).includes('1 / 8'),
  await page.locator('.stats').innerText(),
)

// Backdrop choice + counters survive reload
await page.getByRole('button', { name: 'Rain' }).click()
await page.reload({ waitUntil: 'networkidle' })
check(
  'backdrop persists',
  (await page.locator('.picker-btn[aria-pressed="true"]').innerText()) === 'Rain',
)
check('sessions persist', (await page.locator('.stats').innerText()).includes('1 / 8'))

// endAt-derived: a running timer jumped forward by fake clock isn't testable
// headlessly without mocking; instead verify state shape in localStorage.
const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('noc-focus-v1')))
check(
  'persisted shape',
  typeof stored.completed === 'number' &&
    typeof stored.focusSeconds === 'number' &&
    Array.isArray(stored.log) &&
    stored.log.length >= 1 &&
    typeof stored.day === 'string',
  JSON.stringify(stored),
)

await browser.close()
console.log(results.join('\n'))
process.exitCode = results.some((r) => r.startsWith('FAIL')) ? 1 : 0
