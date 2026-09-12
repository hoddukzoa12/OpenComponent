import { it, expect } from 'vitest'
import { createProject, makeNode, validateProject } from './model'
import { generateProject } from './generate'
import { exportAssets } from '../../scripts/export-assets'
it('exports plain React with locked dependencies, local sources and notices', () => {
  const doc = createProject('My workspace', true)
  doc.screens[0].root.children.push(makeNode('number-ticker'))
  const files = generateProject(doc, exportAssets())
  const pkg = JSON.parse(files['package.json'])
  expect(pkg.dependencies.motion).toBeTruthy()
  expect(pkg.dependencies.zustand).toBeUndefined()
  expect(files['src/App.tsx']).not.toContain('ProjectDocument')
  expect(files['src/components/ui/button.tsx']).toContain('@/lib/utils')
  expect(files['THIRD_PARTY_LICENSES.txt']).toContain('Magic UI')
  expect(files.LICENSE).toContain('Apache License')
  expect(files.NOTICE).toContain('does not assign a license to user-authored content')
  expect(files['Design.md']).toContain('version: 1')
  expect(files['project.opencomponent.json']).toContain(doc.id)
})
it('encodes user text instead of treating it as JSX or HTML', () => {
  const doc = createProject('<script>alert(1)</script>')
  const t = makeNode('text')
  t.props.text = '</p><script>alert(1)</script>{expression}'
  doc.screens[0].root.children = [t]
  const files = generateProject(doc, exportAssets())
  expect(files['index.html']).toContain('&lt;script&gt;')
  expect(files['src/screens/Screen1.tsx']).toContain(
    '{"</p><script>alert(1)</script>{expression}"}',
  )
})

it('inherits tablet columns at desktop and keeps row sizing and card child layouts', () => {
  const doc = createProject()
  const grid = makeNode('grid'),
    card = makeNode('card')
  grid.layout = { columns: 1, tablet: { columns: 2 }, desktop: { padding: 8 } }
  card.layout = { direction: 'row', gap: 6 }
  card.children = [makeNode('input'), makeNode('button')]
  grid.children = [card]
  doc.screens[0].root.children = [grid]
  const files = generateProject(doc, exportAssets())
  expect(files['src/styles.css']).toMatch(
    /@media\(min-width:1024px\)\{\.layout-2\{[^}]*grid-template-columns:repeat\(2,/,
  )
  expect(files['src/styles.css']).toContain('--row-child-flex:1')
  expect(files['src/styles.css']).toContain('flex: var(--row-child-flex, initial)')
  expect(files['src/screens/Screen1.tsx']).toContain(
    '<CardContent><div className="oc-stack layout-3">',
  )
})

it('exports separate screens, stable routes, shared theme and a version 2 backup', () => {
  const doc = createProject('Two screens')
  const second = createProject().screens[0]
  second.name = 'Details'
  const firstHeading = makeNode('heading'),
    secondHeading = makeNode('heading')
  firstHeading.props.text = 'First screen content'
  secondHeading.props.text = 'Second screen content'
  doc.screens[0].root.children = [firstHeading]
  second.root.children = [secondHeading]
  doc.screens.push(second)
  const files = generateProject(doc, exportAssets())
  expect(files['src/screens/Screen1.tsx']).toContain('First screen content')
  expect(files['src/screens/Screen1.tsx']).not.toContain('Second screen content')
  expect(files['src/screens/Screen2.tsx']).toContain('Second screen content')
  expect(files['src/App.tsx']).toContain(second.id)
  expect(files['README.md']).toContain(`#/screen/${second.id}`)
  expect(files['src/styles.css']).toContain(`--primary:${doc.design.light.primary}`)
  expect(JSON.parse(files['project.opencomponent.json'])).toEqual(doc)
})

it('recursively includes component helpers and external packages', () => {
  const doc = createProject()
  doc.screens[0].root.children = [makeNode('button')]
  const assets = exportAssets()
  assets.sources.button =
    "import { helper } from '@/hooks/test-helper'\nexport function Button(){return helper()}"
  assets.supportFiles = {
    'src/hooks/test-helper.ts': "import { clsx } from 'clsx'; export const helper=()=>clsx('ok')",
  }
  const files = generateProject(doc, assets)
  expect(files['src/hooks/test-helper.ts']).toBe(assets.supportFiles['src/hooks/test-helper.ts'])
  expect(JSON.parse(files['package.json']).dependencies.clsx).toBe(assets.versions.clsx)
})

it('round-trips an editable footer and exports its own lightweight shared source', () => {
  const doc = createProject('Footer screen')
  const footer = makeNode('footer')
  footer.props.brand = 'My studio'
  footer.props.links = 'About | #about\nEmail | mailto:hello@example.com'
  doc.screens[0].root.children = [footer]
  const files = generateProject(doc, exportAssets())
  expect(validateProject(JSON.parse(files['project.opencomponent.json']))).toEqual(doc)
  expect(files['src/screens/Screen1.tsx']).toContain('import { Footer }')
  expect(files['src/screens/Screen1.tsx']).toContain('My studio')
  expect(files['src/components/ui/footer.tsx']).toContain('aria-label="Footer navigation"')
  expect(files['src/components/ui/extended-node.tsx']).toBeUndefined()
  expect(JSON.parse(files['package.json']).dependencies.recharts).toBeUndefined()
})
