import 'fake-indexeddb/auto'
import { it, expect } from 'vitest'
import { createProject } from './model'
import { saveProject, listProjects, removeProject, lastProjectId } from './storage'
it('persists, selects, reloads and removes independent projects', async () => {
  const a = createProject('Alpha'),
    b = createProject('Beta')
  await saveProject(a)
  await saveProject(b)
  expect(await lastProjectId()).toBe(b.id)
  expect((await listProjects()).map((p) => p.name)).toEqual(
    expect.arrayContaining(['Alpha', 'Beta']),
  )
  await removeProject(a.id)
  expect((await listProjects()).some((p) => p.id === a.id)).toBe(false)
})

it('reads and upgrades legacy IndexedDB records and persists all screens', async () => {
  const { openDB } = await import('idb')
  const database = await openDB('opencomponent', 1)
  const legacySource = createProject('Legacy stored project', true)
  const { screens, ...fields } = legacySource
  await database.put('projects', { ...fields, version: 1, root: screens[0].root })
  const loaded = (await listProjects()).find((doc) => doc.id === legacySource.id)!
  expect(loaded.version).toBe(2)
  expect(loaded.screens[0].root).toEqual(screens[0].root)
  expect(await database.get('projects', loaded.id)).not.toHaveProperty('root')
  const second = createProject('Another screen').screens[0]
  loaded.screens.push(second)
  await saveProject(loaded)
  expect((await listProjects()).find((doc) => doc.id === loaded.id)?.screens).toEqual(
    loaded.screens,
  )
  database.close()
})
