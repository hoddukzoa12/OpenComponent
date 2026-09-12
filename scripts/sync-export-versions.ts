import { writeFileSync } from 'node:fs'
import { exportAssets } from './export-assets'
const { versions } = exportAssets()
writeFileSync(
  new URL('../src/core/export-versions.json', import.meta.url),
  JSON.stringify(versions, null, 2) + '\n',
)
