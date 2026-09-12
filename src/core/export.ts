import { strToU8, zipSync } from 'fflate'
import { designSystems } from './systems'
import type { ProjectDocument } from './model'
import projectCss from '../project.css?raw'
import utils from '../lib/utils.ts?raw'
import portal from '../lib/portal.tsx?raw'
import licenses from '../../public/THIRD_PARTY_LICENSES.txt?raw'
import projectLicense from '../../LICENSE?raw'
import projectNotice from '../../NOTICE?raw'
import versions from './export-versions.json'
const modules = import.meta.glob('../components/ui/*.tsx', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
const sources = Object.fromEntries(
  Object.entries(modules).map(([path, content]) => [
    path.split('/').at(-1)!.replace('.tsx', ''),
    content,
  ]),
)
const supportModules = import.meta.glob(['../hooks/**/*.{ts,tsx}', '../lib/**/*.{ts,tsx}'], {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>
const supportFiles = Object.fromEntries(
  Object.entries(supportModules).map(([path, source]) => [path.replace('../', 'src/'), source]),
)
export function downloadFile(
  name: string,
  contents: string | Uint8Array,
  mime = 'application/octet-stream',
) {
  const blob =
    typeof contents === 'string'
      ? new Blob([contents], { type: mime })
      : new Blob([new Uint8Array(contents)], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name.replace(/[\\/:*?"<>|]/g, '-')
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
export async function exportProject(doc: ProjectDocument) {
  const files = designSystems[doc.system].export(doc, {
    sources,
    supportFiles,
    projectCss,
    utils,
    portal,
    licenses,
    projectLicense,
    projectNotice,
    versions,
  })
  const zip = zipSync(
    Object.fromEntries(Object.entries(files).map(([path, content]) => [path, strToU8(content)])),
  )
  downloadFile(`${doc.name}.zip`, zip, 'application/zip')
}
