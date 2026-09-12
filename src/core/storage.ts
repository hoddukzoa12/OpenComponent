import { openDB } from 'idb'
import { validateProject, type ProjectDocument } from './model'
let connection: ReturnType<typeof openDB> | undefined
const db = () =>
  (connection ??= openDB('opencomponent', 1, {
    upgrade(database) {
      database.createObjectStore('projects', { keyPath: 'id' })
      database.createObjectStore('preferences')
    },
  }))
export const storageWarnings: string[] = []
export async function listProjects(): Promise<ProjectDocument[]> {
  const tx = (await db()).transaction('projects', 'readwrite')
  const all = await tx.store.getAll()
  storageWarnings.length = 0
  const valid: ProjectDocument[] = []
  for (const raw of all) {
    try {
      const doc = validateProject(raw)
      valid.push(doc)
      if (raw.version === 1) await tx.store.put(doc)
    } catch {
      storageWarnings.push(String(raw?.name || 'Unknown project'))
    }
  }
  await tx.done
  return valid.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}
export async function saveProject(doc: ProjectDocument) {
  const tx = (await db()).transaction(['projects', 'preferences'], 'readwrite')
  await tx.objectStore('projects').put(validateProject(doc))
  await tx.objectStore('preferences').put(doc.id, 'lastProject')
  await tx.done
}
export async function removeProject(id: string) {
  await (await db()).delete('projects', id)
}
export async function lastProjectId() {
  return (await (await db()).get('preferences', 'lastProject')) as string | undefined
}
