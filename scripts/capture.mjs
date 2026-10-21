import { createRequire } from 'node:module'
import { existsSync, mkdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = dirname(fileURLToPath(import.meta.url))
const projectDir = resolve(scriptDir, '..')
const url = process.env.CAPTURE_URL
const outputDir = process.env.CAPTURE_DIR ? resolve(process.env.CAPTURE_DIR) : ''

if (!url || !/^https?:\/\//i.test(url)) {
    console.error('[capture] CAPTURE_URL must be an absolute http(s) URL.')
    process.exit(1)
}
if (!outputDir) {
    console.error('[capture] CAPTURE_DIR must be set.')
    process.exit(1)
}
if (outputDir === projectDir || outputDir.startsWith(projectDir + sep)) {
    console.error(`[capture] CAPTURE_DIR must stay outside the source tree: ${outputDir}`)
    process.exit(1)
}

const playwrightRoot = process.env.PLAYWRIGHT_RUNTIME || join(process.env.HOME || '', '.local/share/omgithub-playwright')
const require = createRequire(import.meta.url)
let chromium
try {
    ({ chromium } = require(join(playwrightRoot, 'node_modules/playwright')))
} catch (error) {
    console.error(`[capture] Unable to load Playwright from ${playwrightRoot}: ${error.message}`)
    process.exit(1)
}

const fail = (message, exitCode = 1) => Object.assign(new Error(message), { exitCode })
const transient = (message, cause) => fail(message, 75, cause)
const asTransient = error => error?.exitCode ? error : Object.assign(new Error(error?.message || String(error), { cause: error }), { exitCode: 75 })

async function step(label, action) {
    const started = Date.now()
    try {
        const result = await action()
        console.log(`[timing] ${label}: ${Date.now() - started}ms`)
        return result
    } catch (error) {
        console.log(`[timing] ${label}: ${Date.now() - started}ms (failed)`)
        throw error
    }
}

function pngDimensions(buffer) {
    if (buffer.length < 24 || buffer.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') return null
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }
}

const targets = [
    ['desktop', 1440, 900],
    ['mobile', 390, 844]
]
let browser
let exitCode = 0

try {
    mkdirSync(outputDir, { recursive: true })

    browser = await step('launch browser', () =>
        chromium.launch({
            executablePath: existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined,
            headless: true,
            args: ['--no-sandbox', '--disable-dev-shm-usage']
        })
    ).catch(error => { throw asTransient(error) })

    for (const [name, width, height] of targets) {
        const page = await step(`open ${name} page`, () =>
            browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
        ).catch(error => { throw asTransient(error) })

        page.setDefaultTimeout(20000)
        const pageErrors = []
        page.on('pageerror', error => pageErrors.push(error.message))

        let response
        try {
            response = await step(`navigate ${name}`, () =>
                page.goto(url, { waitUntil: 'load', timeout: 45000 })
            )
        } catch (error) {
            throw asTransient(error)
        }

        if (!response) throw transient(`No response received while loading ${url}`)
        const status = response.status()
        if (status < 200 || status >= 400) {
            const transientStatus = [408, 425, 429, 500, 502, 503, 504].includes(status)
            throw fail(`HTTP ${status} while loading ${url}`, transientStatus ? 75 : 1)
        }

        try {
            await step(`wait for app shell (${name})`, () =>
                page.locator('.app-shell').waitFor({ state: 'visible', timeout: 15000 })
            )
        } catch (error) {
            const info = await page.evaluate(() => ({
                title: document.title,
                text: (document.body?.innerText || '').slice(0, 400)
            })).catch(() => ({ title: '', text: '' }))
            if (info.title.includes('Mobius') || info.text.includes('Mobius')) {
                throw fail(`The Mobius app shell did not render: ${error.message}`, 1)
            }
            throw transient(`The page did not render the Mobius app (title: ${JSON.stringify(info.title)}).`, error)
        }

        try {
            await step(`wait for player controls (${name})`, () =>
                page.locator('#btn-play').waitFor({ state: 'visible', timeout: 15000 })
            )
        } catch (error) {
            throw fail(`Player controls did not render: ${error.message}`, 1)
        }

        await step(`wait for fonts (${name})`, async () => {
            try {
                await page.waitForFunction(() => document.fonts?.status === 'loaded', null, { timeout: 10000 })
            } catch {
                console.warn(`[capture] Fonts did not settle for ${name}; continuing with rendered UI.`)
            }
        })
        await step(`settle ${name}`, () => page.waitForTimeout(1000))

        if (pageErrors.length) {
            throw fail(`Page errors while rendering ${name}: ${pageErrors.join(' | ')}`, 1)
        }

        const rendered = await step(`verify ${name} UI`, () =>
            page.evaluate(() => {
                const shell = document.querySelector('.app-shell')
                const shellRect = shell?.getBoundingClientRect()
                const play = document.querySelector('#btn-play')
                const playRect = play?.getBoundingClientRect()
                return {
                    title: document.title,
                    shellVisible: Boolean(shellRect && shellRect.width > 300 && shellRect.height > 300),
                    playVisible: Boolean(playRect && playRect.width > 20 && playRect.height > 20),
                    hasLibrary: Boolean(document.querySelector('#library-list'))
                }
            })
        ).catch(error => { throw fail(`Could not verify ${name} UI: ${error.message}`, 1) })

        if (rendered.title !== 'Mobius Media' || !rendered.shellVisible || !rendered.playVisible || !rendered.hasLibrary) {
            throw fail(`Rendered ${name} UI failed validation: ${JSON.stringify(rendered)}`, 1)
        }

        const screenshotPath = join(outputDir, `final-${name}.png`)
        try {
            await step(`screenshot ${name}`, () =>
                page.screenshot({ path: screenshotPath, fullPage: false, animations: 'disabled', timeout: 30000 })
            )
        } catch (error) {
            if (error.name === 'TimeoutError' || !browser.isConnected()) throw asTransient(error)
            throw fail(`Screenshot failed for ${name}: ${error.message}`, 1)
        }

        const bytes = readFileSync(screenshotPath)
        const dimensions = pngDimensions(bytes)
        if (!dimensions || bytes.length < 5000 || dimensions.width !== width || dimensions.height !== height) {
            throw fail(`Invalid ${name} screenshot: ${bytes.length} bytes, ${JSON.stringify(dimensions)}`, 1)
        }
        console.log(`[capture] ${name}: ${screenshotPath} (${dimensions.width}x${dimensions.height}, ${bytes.length} bytes)`)
        await page.close().catch(() => {})
    }
} catch (error) {
    exitCode = error.exitCode || 1
    console.error(`[capture] ${error.message}`)
} finally {
    if (browser) {
        await step('close browser', () => browser.close()).catch(error => {
            if (!exitCode) exitCode = 75
            console.error(`[capture] Browser close failed: ${error.message}`)
        })
    }
}

process.exit(exitCode)
