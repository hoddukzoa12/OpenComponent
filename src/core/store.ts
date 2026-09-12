import { create } from 'zustand'
import {
  createProject,
  createScreen,
  getActiveScreen,
  findNode,
  findParent,
  makeNode,
  canContain,
  moveNode,
  cloneNode,
  validateProject,
  type ProjectDocument,
  type ComponentType,
  type CanvasNode,
} from './model'
interface Snapshot {
  doc: ProjectDocument
  activeScreenId: string
}
interface HistoryEntry {
  before: Snapshot
  after: Snapshot
}
interface EditorState {
  doc: ProjectDocument
  activeScreenId: string
  selected: string | null
  readOnly: boolean
  past: HistoryEntry[]
  future: HistoryEntry[]
  load: (doc: ProjectDocument) => void
  select: (id: string | null) => void
  setReadOnly: (readOnly: boolean) => void
  selectScreen: (id: string) => void
  addScreen: (name?: string) => void
  duplicateScreen: (id: string) => void
  renameScreen: (id: string, name: string) => void
  removeScreen: (id: string) => void
  edit: (fn: (doc: ProjectDocument) => void) => void
  undo: () => void
  redo: () => void
  add: (type: ComponentType, parentId?: string, index?: number, slot?: string) => void
  remove: (id: string) => void
  duplicate: (id: string) => void
  move: (id: string, parent: string, index: number, slot?: string) => void
  updateNode: (id: string, fn: (node: CanvasNode) => void) => void
}
const initial = createProject('Workspace settings', true)
export const useEditor = create<EditorState>((set, get) => {
  // History carries both focus states, so a later screen switch cannot redirect redo.
  function commit(fn: (doc: ProjectDocument) => void, nextScreenId?: string) {
    const s = get()
    if (s.readOnly) return false
    let doc = structuredClone(s.doc)
    fn(doc)
    if (JSON.stringify(doc) === JSON.stringify(s.doc)) return false
    doc.updatedAt = new Date().toISOString()
    doc = validateProject(doc)
    const activeScreenId = getActiveScreen(doc, nextScreenId || s.activeScreenId).id
    const selected =
      s.selected &&
      activeScreenId === s.activeScreenId &&
      findNode(getActiveScreen(doc, activeScreenId).root, s.selected)
        ? s.selected
        : null
    const entry: HistoryEntry = {
      before: { doc: s.doc, activeScreenId: s.activeScreenId },
      after: { doc, activeScreenId },
    }
    set({ doc, activeScreenId, selected, past: [...s.past.slice(-49), entry], future: [] })
    return true
  }
  return {
    doc: initial,
    activeScreenId: initial.screens[0].id,
    selected: null,
    readOnly: false,
    past: [],
    future: [],
    load: (input) => {
      const doc = validateProject(input)
      set({
        doc,
        activeScreenId: doc.screens[0].id,
        selected: null,
        readOnly: false,
        past: [],
        future: [],
      })
    },
    select: (id) =>
      set({
        selected:
          id && findNode(getActiveScreen(get().doc, get().activeScreenId).root, id) ? id : null,
      }),
    setReadOnly: (readOnly) => set({ readOnly }),
    selectScreen: (id) => {
      if (get().doc.screens.some((screen) => screen.id === id))
        set({ activeScreenId: id, selected: null })
    },
    addScreen: (name) => {
      if (get().readOnly) return
      let number = 1
      const defaultName = () => `Screen ${String(number).padStart(2, '0')}`
      while (get().doc.screens.some((screen) => screen.name === defaultName())) number++
      const screen = createScreen(name?.trim() || defaultName())
      commit((doc) => {
        doc.screens.push(screen)
      }, screen.id)
    },
    duplicateScreen: (id) => {
      const source = get().doc.screens.find((screen) => screen.id === id)
      if (!source || get().readOnly) return
      const copy = {
        ...source,
        id: crypto.randomUUID(),
        name: `${source.name.slice(0, 95)} copy`,
        root: cloneNode(source.root),
      }
      commit((doc) => {
        doc.screens.splice(doc.screens.findIndex((screen) => screen.id === id) + 1, 0, copy)
      }, copy.id)
    },
    renameScreen: (id, name) => {
      const trimmed = name.trim()
      if (!trimmed) return
      commit((doc) => {
        const screen = doc.screens.find((screen) => screen.id === id)
        if (screen) screen.name = trimmed
      })
    },
    removeScreen: (id) => {
      const s = get(),
        index = s.doc.screens.findIndex((screen) => screen.id === id)
      if (s.doc.screens.length === 1 || index < 0) return
      const next =
        s.activeScreenId === id ? s.doc.screens[index > 0 ? index - 1 : 1].id : s.activeScreenId
      commit((doc) => {
        doc.screens = doc.screens.filter((screen) => screen.id !== id)
      }, next)
    },
    edit: (fn) => {
      commit(fn)
    },
    undo: () => {
      const s = get(),
        entry = s.past.at(-1)
      if (s.readOnly || !entry) return
      const doc = structuredClone(entry.before.doc)
      doc.updatedAt = new Date().toISOString()
      set({
        doc,
        activeScreenId: entry.before.activeScreenId,
        past: s.past.slice(0, -1),
        future: [entry, ...s.future],
        selected: null,
      })
    },
    redo: () => {
      const s = get(),
        entry = s.future[0]
      if (s.readOnly || !entry) return
      const doc = structuredClone(entry.after.doc)
      doc.updatedAt = new Date().toISOString()
      set({
        doc,
        activeScreenId: entry.after.activeScreenId,
        past: [...s.past, entry],
        future: s.future.slice(1),
        selected: null,
      })
    },
    add: (type, parentId, index, slot) => {
      const s = get()
      if (s.readOnly) return
      const node = makeNode(type)
      const changed = commit((doc) => {
        const root = getActiveScreen(doc, s.activeScreenId).root
        const selected = findNode(root, parentId || s.selected || root.id)
        if (parentId && !selected) return
        const parent =
          selected && canContain(selected)
            ? selected
            : selected
              ? findParent(root, selected.id) || root
              : root
        node.slot = parent.type === 'tabs' ? slot || String(parent.props.active) : undefined
        parent.children.splice(index ?? parent.children.length, 0, node)
      })
      if (changed) set({ selected: node.id })
    },
    remove: (id) => {
      commit((doc) => {
        const parent = findParent(getActiveScreen(doc, get().activeScreenId).root, id)
        if (parent) parent.children = parent.children.filter((node) => node.id !== id)
      })
    },
    duplicate: (id) => {
      let next: string | null = null
      const changed = commit((doc) => {
        const root = getActiveScreen(doc, get().activeScreenId).root
        const node = findNode(root, id),
          parent = findParent(root, id)
        if (node && parent) {
          const copy = cloneNode(node)
          copy.name = `${copy.name.slice(0, 95)} copy`
          next = copy.id
          parent.children.splice(parent.children.indexOf(node) + 1, 0, copy)
        }
      })
      if (changed && next) set({ selected: next })
    },
    move: (id, parent, index, slot) => {
      commit((doc) => {
        moveNode(getActiveScreen(doc, get().activeScreenId).root, id, parent, index, slot)
      })
    },
    updateNode: (id, fn) => {
      commit((doc) => {
        const node = findNode(getActiveScreen(doc, get().activeScreenId).root, id)
        if (node) fn(node)
      })
    },
  }
})
