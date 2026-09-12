import { describe, it, expect } from 'vitest'
import {
  createProject,
  makeNode,
  parseProject,
  parseDesignMarkdown,
  toDesignMarkdown,
  validateProject,
  moveNode,
  cloneNode,
  defaultDesign,
  resolveLayout,
} from './model'
describe('portable documents', () => {
  it('round trips project and Design.md including Korean guidance', () => {
    const doc = createProject('내 프로젝트', true)
    doc.design.guidelines = '## 원칙\n선명하고 일관되게.\n'
    expect(parseProject(JSON.stringify(doc))).toEqual(doc)
    expect(parseDesignMarkdown(toDesignMarkdown(doc.design))).toEqual(doc.design)
  })
  it('rejects unknown versions, systems, duplicate IDs and invalid nesting', () => {
    const p = createProject()
    expect(() => parseProject(JSON.stringify({ ...p, version: 3 }))).toThrow()
    expect(() => validateProject({ ...p, system: 'astryx' })).toThrow()
    p.screens[0].root.children = [makeNode('button')]
    p.screens[0].root.children[0].id = p.screens[0].root.id
    expect(() => validateProject(p)).toThrow('Duplicate')
    p.screens[0].root.children = [makeNode('input')]
    p.screens[0].root.children[0].children = [makeNode('text')]
    expect(() => validateProject(p)).toThrow('cannot contain')
  })
  it('rejects malformed themes without affecting the original', () => {
    const d = defaultDesign(),
      before = structuredClone(d)
    expect(() => parseDesignMarkdown('colors: purple')).toThrow()
    expect(() =>
      parseDesignMarkdown(
        toDesignMarkdown({ ...d, light: { ...d.light, primary: 'red;display:none' } }),
      ),
    ).toThrow()
    expect(d).toEqual(before)
  })
  it('rejects children referencing missing tabs', () => {
    const p = createProject()
    const tabs = makeNode('tabs')
    tabs.children = [makeNode('text')]
    p.screens[0].root.children = [tabs]
    expect(() => validateProject(p)).toThrow('missing tab')
  })
})
describe('tree operations', () => {
  it('moves nodes across parents and rejects cycles', () => {
    const p = createProject()
    const a = makeNode('stack'),
      b = makeNode('card'),
      c = makeNode('input')
    a.children = [c]
    p.screens[0].root.children = [a, b]
    expect(moveNode(p.screens[0].root, a.id, c.id, 0)).toBe(false)
    expect(moveNode(p.screens[0].root, c.id, b.id, 0)).toBe(true)
    expect(a.children).toHaveLength(0)
    expect(b.children[0].id).toBe(c.id)
  })
  it('reorders a sibling forward and backward exactly once', () => {
    const p = createProject()
    const a = makeNode('text'),
      b = makeNode('text'),
      c = makeNode('text')
    p.screens[0].root.children = [a, b, c]
    moveNode(p.screens[0].root, a.id, p.screens[0].root.id, 3)
    expect(p.screens[0].root.children.map((n) => n.id)).toEqual([b.id, c.id, a.id])
    moveNode(p.screens[0].root, a.id, p.screens[0].root.id, 0)
    expect(p.screens[0].root.children.map((n) => n.id)).toEqual([a.id, b.id, c.id])
  })
  it('duplicates descendants with independent IDs', () => {
    const a = makeNode('card')
    a.children = [makeNode('input')]
    const b = cloneNode(a)
    expect(b.id).not.toBe(a.id)
    expect(b.children[0].id).not.toBe(a.children[0].id)
    b.children[0].props.label = 'Different'
    expect(a.children[0].props.label).toBe('Email address')
  })
  it('inherits mobile layout at each breakpoint', () => {
    const l = { gap: 4, columns: 1, tablet: { columns: 2 }, desktop: { columns: 3 } }
    expect(resolveLayout(l, 375).columns).toBe(1)
    expect(resolveLayout(l, 768).columns).toBe(2)
    expect(resolveLayout(l, 1280).columns).toBe(3)
  })
})

it('normalizes imported tab labels and slots and rejects invalid property/font types', () => {
  const doc = createProject()
  const tabs = makeNode('tabs'),
    child = makeNode('input')
  tabs.props.labels = ' General \nNotifications\nGeneral'
  tabs.props.active = ' General '
  child.slot = ' General '
  tabs.children = [child]
  doc.screens[0].root.children = [tabs]
  const parsed = validateProject(doc)
  expect(parsed.screens[0].root.children[0].props.labels).toBe('General\nNotifications')
  expect(parsed.screens[0].root.children[0].children[0].slot).toBe('General')
  child.props.value = 42
  expect(() => validateProject(doc)).toThrow()
  for (const font of ['"Unclosed', '"Foo\nBar"', '"Foo\rBar"']) {
    const d = defaultDesign()
    d.fontBody = font
    expect(() => parseDesignMarkdown(toDesignMarkdown(d))).toThrow()
  }
})

it('migrates version 1 without replacing project IDs, node IDs, theme or contents', () => {
  const current = createProject('Legacy settings', true)
  const { screens, ...fields } = current
  const legacy = { ...fields, version: 1, root: screens[0].root }
  const migrated = parseProject(JSON.stringify(legacy))
  expect(migrated.version).toBe(2)
  expect(migrated.id).toBe(legacy.id)
  expect(migrated.screens).toHaveLength(1)
  expect(migrated.screens[0].root).toEqual(legacy.root)
  expect(migrated.design).toEqual(legacy.design)
  expect(migrated.updatedAt).toBe(legacy.updatedAt)
  expect(migrated).not.toHaveProperty('root')
  expect(validateProject(legacy).screens[0].id).toBe(migrated.screens[0].id)
})

it('rejects zero screens and component IDs duplicated across screens', () => {
  const doc = createProject()
  expect(() => validateProject({ ...doc, screens: [] })).toThrow()
  const screen = structuredClone(doc.screens[0])
  screen.id = crypto.randomUUID()
  doc.screens.push(screen)
  expect(() => validateProject(doc)).toThrow('Duplicate component ID')
})

it('fills newly supported chart and sidebar tokens in legacy themes', () => {
  const design = defaultDesign()
  const raw = JSON.parse(JSON.stringify(design))
  for (const mode of ['light', 'dark'])
    for (const key of Object.keys(raw[mode]))
      if (key.startsWith('chart') || key.startsWith('sidebar')) delete raw[mode][key]
  const migrated = parseDesignMarkdown(toDesignMarkdown(raw))
  expect(migrated.light.primary).toBe(design.light.primary)
  expect(migrated.light.chart1).toBe(design.light.chart1)
  expect(migrated.dark.sidebar).toBe(design.dark.sidebar)
})
