import { gzipSync } from 'node:zlib'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

const assetsDir = join(process.cwd(), 'dist', 'assets')
if (!existsSync(assetsDir)) {
  console.error('[bundle-size] Missing dist/assets.')
  console.error('[bundle-size] Run `npm run build` before `npm run size:check`.')
  process.exit(1)
}

const files = readdirSync(assetsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name)

const jsFiles = files.filter((name) => name.endsWith('.js'))
const cssFiles = files.filter((name) => name.endsWith('.css'))

if (jsFiles.length === 0 || cssFiles.length === 0) {
  console.error('[bundle-size] Expected built JS and CSS assets in dist/assets.')
  console.error('[bundle-size] Run `npm run build` before `npm run size:check`.')
  process.exit(1)
}

const summarize = (assetFiles) =>
  assetFiles.reduce(
    (summary, file) => {
      const content = readFileSync(join(assetsDir, file))
      summary.raw += content.byteLength
      summary.gzip += gzipSync(content).byteLength
      return summary
    },
    { raw: 0, gzip: 0 },
  )

const js = summarize(jsFiles)
const css = summarize(cssFiles)

const limits = {
  jsRaw: 260 * 1024,
  jsGzip: 82 * 1024,
  cssRaw: 24 * 1024,
  cssGzip: 7 * 1024,
}

const checks = [
  { label: 'JS raw', actual: js.raw, limit: limits.jsRaw },
  { label: 'JS gzip', actual: js.gzip, limit: limits.jsGzip },
  { label: 'CSS raw', actual: css.raw, limit: limits.cssRaw },
  { label: 'CSS gzip', actual: css.gzip, limit: limits.cssGzip },
]

let hasFailure = false
for (const check of checks) {
  const pass = check.actual <= check.limit
  const actualKiB = (check.actual / 1024).toFixed(2)
  const limitKiB = (check.limit / 1024).toFixed(2)
  console.log(`[bundle-size] ${check.label}: ${actualKiB} KiB / ${limitKiB} KiB`)
  if (!pass) {
    hasFailure = true
    console.error(`[bundle-size] ${check.label} exceeds budget`)
  }
}

if (hasFailure) {
  process.exit(1)
}

console.log('[bundle-size] Budgets passed')
