import { describe, it, expect, beforeEach } from 'vitest'
import { useEditor } from './store'
import { createProject } from './model'
describe('history', () => {
  beforeEach(() => useEditor.getState().load(createProject()))
  it('undoes and redoes an atomic insertion and clears redo on new edits', () => {
    useEditor.getState().add('input')
    expect(useEditor.getState().doc.screens[0].root.children).toHaveLength(1)
    useEditor.getState().undo()
    expect(useEditor.getState().doc.screens[0].root.children).toHaveLength(0)
    useEditor.getState().redo()
    expect(useEditor.getState().doc.screens[0].root.children).toHaveLength(1)
    useEditor.getState().undo()
    useEditor.getState().add('button')
    expect(useEditor.getState().future).toHaveLength(0)
  })
  it('does not commit invalid edits', () => {
    const before = useEditor.getState().doc
    expect(() =>
      useEditor.getState().edit((p) => {
        p.design.spacing = 0
      }),
    ).toThrow()
    expect(useEditor.getState().doc).toBe(before)
    expect(useEditor.getState().past).toHaveLength(0)
  })
})

it('preserves redo after invalid moves and unchanged edits', () => {
  useEditor.getState().load(createProject())
  useEditor.getState().add('input')
  useEditor.getState().undo()
  const before = useEditor.getState()
  before.move(before.doc.screens[0].root.id, before.doc.screens[0].root.id, 0)
  before.updateNode(before.doc.screens[0].root.id, (node) => {
    node.name = node.name
  })
  expect(useEditor.getState().doc).toBe(before.doc)
  expect(useEditor.getState().future).toBe(before.future)
  useEditor.getState().redo()
  expect(useEditor.getState().doc.screens[0].root.children[0].type).toBe('input')
})

it('keeps screens independent and restores the edited screen across undo and redo', () => {
  const editor = useEditor.getState()
  editor.load(createProject())
  const firstId = useEditor.getState().activeScreenId
  editor.add('input')
  editor.addScreen('Details')
  const secondId = useEditor.getState().activeScreenId
  editor.add('button')
  expect(useEditor.getState().doc.screens[0].root.children[0].type).toBe('input')
  expect(useEditor.getState().doc.screens[1].root.children[0].type).toBe('button')
  const historyLength = useEditor.getState().past.length
  editor.selectScreen(firstId)
  expect(useEditor.getState().past).toHaveLength(historyLength)
  editor.undo()
  expect(useEditor.getState().activeScreenId).toBe(secondId)
  expect(useEditor.getState().doc.screens[1].root.children).toHaveLength(0)
  editor.selectScreen(firstId)
  editor.redo()
  expect(useEditor.getState().activeScreenId).toBe(secondId)
  expect(useEditor.getState().doc.screens[1].root.children[0].type).toBe('button')
})

it('duplicates with fresh IDs, renames, deletes, restores and retains the last screen', () => {
  const editor = useEditor.getState()
  editor.load(createProject('Screens', true))
  const original = useEditor.getState().doc.screens[0]
  editor.duplicateScreen(original.id)
  const duplicate = useEditor.getState().doc.screens[1]
  expect(duplicate.id).not.toBe(original.id)
  expect(duplicate.root.id).not.toBe(original.root.id)
  expect(duplicate.root.children[2].children[0].id).not.toBe(
    original.root.children[2].children[0].id,
  )
  editor.updateNode(duplicate.root.children[0].id, (node) => {
    node.props.text = 'Independent'
  })
  expect(useEditor.getState().doc.screens[0].root.children[0].props.text).toBe('Workspace settings')
  editor.renameScreen(duplicate.id, 'Profile')
  expect(useEditor.getState().doc.screens[1].name).toBe('Profile')
  editor.removeScreen(duplicate.id)
  expect(useEditor.getState().activeScreenId).toBe(original.id)
  expect(useEditor.getState().selected).toBeNull()
  editor.undo()
  expect(useEditor.getState().activeScreenId).toBe(duplicate.id)
  expect(useEditor.getState().doc.screens[1].name).toBe('Profile')
  editor.redo()
  const before = useEditor.getState().doc
  editor.removeScreen(original.id)
  expect(useEditor.getState().doc).toBe(before)
})

it('rejects every document command while Preview is read-only', () => {
  const editor = useEditor.getState()
  editor.load(createProject('Protected', true))
  editor.add('input')
  editor.addScreen('Second')
  editor.add('button')
  editor.undo()
  editor.selectScreen(useEditor.getState().doc.screens[0].id)
  const state = useEditor.getState()
  const screen = state.doc.screens[0],
    node = screen.root.children[0]
  editor.select(node.id)
  editor.setReadOnly(true)
  const before = useEditor.getState()
  editor.edit((doc) => {
    doc.name = 'Changed'
  })
  editor.undo()
  editor.redo()
  editor.add('button')
  editor.remove(node.id)
  editor.duplicate(node.id)
  editor.updateNode(node.id, (n) => {
    n.name = 'Changed'
  })
  editor.move(node.id, screen.root.id, 5)
  editor.addScreen()
  editor.duplicateScreen(screen.id)
  editor.renameScreen(screen.id, 'Changed')
  editor.removeScreen(screen.id)
  expect(useEditor.getState().doc).toBe(before.doc)
  expect(useEditor.getState().past).toBe(before.past)
  expect(useEditor.getState().future).toBe(before.future)
  expect(useEditor.getState().selected).toBe(node.id)
  editor.setReadOnly(false)
  editor.remove(node.id)
  expect(useEditor.getState().doc).not.toBe(before.doc)
})
