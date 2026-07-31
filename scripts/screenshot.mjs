import { chromium } from 'playwright-core'

const url = process.argv[2] || 'http://localhost:4173/'
const out = process.argv[3] || 'shot.png'
const wait = Number(process.argv[4] || 1500)

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({
  viewport: { width: 402, height: 874 },
  deviceScaleFactor: 2,
})
await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(wait)
await page.screenshot({ path: out })
await browser.close()
