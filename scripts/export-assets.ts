import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import type { ExportAssets } from '../src/core/generate'
export function exportAssets(): ExportAssets {
  const root = resolve(import.meta.dirname, '..')
  const read = (path: string) => readFileSync(resolve(root, path), 'utf8')
  const lock = JSON.parse(read('package-lock.json'))
  const versions = Object.fromEntries(
    Object.entries(lock.packages as Record<string, { version: string }>)
      .filter(
        ([name]) => name.startsWith('node_modules/') && !name.slice(13).includes('node_modules/'),
      )
      .map(([name, pkg]) => [name.slice(13), pkg.version]),
  )
  const supportFiles: Record<string, string> = {}
  for (const directory of ['src/hooks', 'src/lib']) {
    if (!existsSync(resolve(root, directory))) continue
    for (const name of readdirSync(resolve(root, directory), { recursive: true })) {
      if (/\.tsx?$/.test(String(name)))
        supportFiles[`${directory}/${name}`] = read(`${directory}/${name}`)
    }
  }
  return {
    supportFiles,
    sources: Object.fromEntries(
      readdirSync(resolve(root, 'src/components/ui'))
        .filter((n) => n.endsWith('.tsx'))
        .map((name) => [name.replace('.tsx', ''), read(`src/components/ui/${name}`)]),
    ),
    projectCss: read('src/project.css'),
    utils: read('src/lib/utils.ts'),
    portal: read('src/lib/portal.tsx'),
    licenses: read('public/THIRD_PARTY_LICENSES.txt'),
    projectLicense: read('LICENSE'),
    projectNotice: read('NOTICE'),
    versions,
  }
}
