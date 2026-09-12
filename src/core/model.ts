import { z } from 'zod'
import { parseDocument, stringify } from 'yaml'
import { extendedComponentTypes, extendedDefaults } from './extended-catalog'

export const componentTypes = [
  'stack',
  'grid',
  'heading',
  'text',
  'button',
  'input',
  'textarea',
  'label',
  'checkbox',
  'switch',
  'select',
  'card',
  'tabs',
  'dialog',
  'badge',
  'separator',
  'table',
  'progress',
  'number-ticker',
  'animated-circular-progress-bar',
  ...extendedComponentTypes,
] as const
export type ComponentType = (typeof componentTypes)[number]
export type PropValue = string | number | boolean
export type Layout = {
  direction?: 'column' | 'row'
  columns?: number
  gap?: number
  padding?: number
  align?: 'stretch' | 'start' | 'center' | 'end'
  width?: 'fill' | 'auto'
  tablet?: Omit<Layout, 'tablet' | 'desktop'>
  desktop?: Omit<Layout, 'tablet' | 'desktop'>
}
export interface CanvasNode {
  id: string
  type: ComponentType
  name: string
  props: Record<string, PropValue>
  children: CanvasNode[]
  layout: Layout
  slot?: string
}
const extendedColorNames = [
  'chart1',
  'chart2',
  'chart3',
  'chart4',
  'chart5',
  'sidebar',
  'sidebarForeground',
  'sidebarPrimary',
  'sidebarPrimaryForeground',
  'sidebarAccent',
  'sidebarAccentForeground',
  'sidebarBorder',
  'sidebarRing',
] as const
export const colorNames = [
  'background',
  'foreground',
  'card',
  'cardForeground',
  'primary',
  'primaryForeground',
  'secondary',
  'secondaryForeground',
  'muted',
  'mutedForeground',
  'accent',
  'accentForeground',
  'destructive',
  'destructiveForeground',
  'border',
  'input',
  'ring',
  ...extendedColorNames,
] as const
export type Colors = Record<(typeof colorNames)[number], string>
export interface Design {
  mode: 'light' | 'dark'
  light: Colors
  dark: Colors
  fontBody: string
  fontHeading: string
  fontSize: number
  headingSize: number
  bodyWeight: number
  headingWeight: number
  radius: number
  spacing: number
  shadow: 'none' | 'soft' | 'strong'
  guidelines: string
}
export interface CanvasScreen {
  id: string
  name: string
  root: CanvasNode
}
export interface ProjectDocument {
  version: 2
  id: string
  name: string
  system: 'shadcn-radix'
  screens: CanvasScreen[]
  design: Design
  updatedAt: string
}
export const uid = () => crypto.randomUUID()
export const normalizedLines = (v: unknown) => [
  ...new Set(
    String(v ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
  ),
]
const light: Colors = {
  background: '#ffffff',
  foreground: '#24242b',
  card: '#ffffff',
  cardForeground: '#24242b',
  primary: '#6754cc',
  primaryForeground: '#ffffff',
  secondary: '#f0edf9',
  secondaryForeground: '#514596',
  muted: '#f4f4f6',
  mutedForeground: '#747480',
  accent: '#f0edf9',
  accentForeground: '#514596',
  destructive: '#d63f51',
  destructiveForeground: '#ffffff',
  border: '#e7e7ec',
  input: '#dfdfe6',
  ring: '#8d7de1',
  chart1: '#6754cc',
  chart2: '#2a9d8f',
  chart3: '#e9c46a',
  chart4: '#e76f51',
  chart5: '#457b9d',
  sidebar: '#f4f4f6',
  sidebarForeground: '#24242b',
  sidebarPrimary: '#6754cc',
  sidebarPrimaryForeground: '#ffffff',
  sidebarAccent: '#f0edf9',
  sidebarAccentForeground: '#514596',
  sidebarBorder: '#e7e7ec',
  sidebarRing: '#8d7de1',
}
const dark: Colors = {
  background: '#17171d',
  foreground: '#efeff5',
  card: '#22222b',
  cardForeground: '#efeff5',
  primary: '#ab9cf5',
  primaryForeground: '#211b3b',
  secondary: '#30303b',
  secondaryForeground: '#e9e6f8',
  muted: '#2a2a34',
  mutedForeground: '#a2a2b2',
  accent: '#383149',
  accentForeground: '#efebff',
  destructive: '#f07181',
  destructiveForeground: '#17171d',
  border: '#393943',
  input: '#444450',
  ring: '#ab9cf5',
  chart1: '#ab9cf5',
  chart2: '#5ec4b6',
  chart3: '#f1d182',
  chart4: '#f39b84',
  chart5: '#78aec7',
  sidebar: '#2a2a34',
  sidebarForeground: '#efeff5',
  sidebarPrimary: '#ab9cf5',
  sidebarPrimaryForeground: '#211b3b',
  sidebarAccent: '#383149',
  sidebarAccentForeground: '#efebff',
  sidebarBorder: '#393943',
  sidebarRing: '#ab9cf5',
}
export const defaultDesign = (): Design => ({
  mode: 'light',
  light: { ...light },
  dark: { ...dark },
  fontBody: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontHeading: 'Inter, ui-sans-serif, system-ui, sans-serif',
  fontSize: 14,
  headingSize: 28,
  bodyWeight: 400,
  headingWeight: 600,
  radius: 10,
  spacing: 4,
  shadow: 'soft',
  guidelines:
    'Use clear labels and comfortable spacing. Reserve the primary color for the main action.',
})

const props: Record<ComponentType, Record<string, PropValue>> = {
  ...extendedDefaults,
  stack: {},
  grid: {},
  heading: { text: 'Section heading', level: 2 },
  text: { text: 'Add a little context for this section.', tone: 'muted' },
  button: { text: 'Continue', variant: 'default', size: 'default', disabled: false },
  input: { label: 'Email address', placeholder: 'you@example.com', value: '', disabled: false },
  textarea: {
    label: 'About',
    placeholder: 'Tell us a little about yourself',
    value: '',
    disabled: false,
  },
  label: { text: 'Label' },
  checkbox: { label: 'Send me product updates', checked: true, disabled: false },
  switch: { label: 'Email notifications', checked: true, disabled: false },
  select: {
    label: 'Role',
    options: 'Designer\nDeveloper\nProduct manager',
    value: 'Designer',
    disabled: false,
  },
  card: { title: 'Card title', description: 'A little context goes a long way.' },
  tabs: { labels: 'General\nNotifications', active: 'General' },
  dialog: {
    trigger: 'Open dialog',
    title: 'Confirm changes',
    description: 'Review your changes before continuing.',
  },
  badge: { text: 'Active', variant: 'secondary' },
  separator: {},
  table: {
    headers: 'Name,Role,Status',
    rows: 'Alex Morgan,Designer,Active\nJordan Lee,Developer,Active',
  },
  progress: { value: 64, label: 'Storage used' },
  'number-ticker': { value: 1248, label: 'Active members' },
  'animated-circular-progress-bar': { value: 72, label: 'Monthly usage' },
}
export function makeNode(type: ComponentType): CanvasNode {
  return {
    id: uid(),
    type,
    name: type
      .split('-')
      .map((t) => t[0].toUpperCase() + t.slice(1))
      .join(' '),
    props: { ...props[type] },
    layout:
      type === 'stack'
        ? { direction: 'column', gap: 4 }
        : type === 'grid'
          ? { columns: 1, gap: 4, tablet: { columns: 2 } }
          : {},
    children: [],
  }
}
export function createScreen(name = 'Screen 01'): CanvasScreen {
  const root = makeNode('stack')
  root.name = 'Page'
  root.layout = { direction: 'column', gap: 6, padding: 8 }
  return { id: uid(), name, root }
}
export function getActiveScreen(doc: ProjectDocument, id?: string): CanvasScreen {
  return doc.screens.find((screen) => screen.id === id) || doc.screens[0]
}
export function createProject(name = 'Untitled project', example = false): ProjectDocument {
  const screen = createScreen()
  const root = screen.root
  const doc: ProjectDocument = {
    version: 2,
    id: uid(),
    name,
    system: 'shadcn-radix',
    screens: [screen],
    design: defaultDesign(),
    updatedAt: new Date().toISOString(),
  }
  if (example) {
    const h = makeNode('heading')
    h.props.text = 'Workspace settings'
    const sub = makeNode('text')
    sub.props.text = 'Manage your profile and workspace preferences.'
    const card = makeNode('card')
    card.props.title = 'Personal information'
    card.props.description = 'Your details are visible to people in your workspace.'
    const grid = makeNode('grid')
    const first = makeNode('input')
    first.props.label = 'Full name'
    first.props.value = 'Alex Morgan'
    first.props.placeholder = 'Your name'
    const email = makeNode('input')
    email.props.value = 'alex@studio.co'
    grid.children = [first, email]
    const role = makeNode('select')
    const bio = makeNode('textarea')
    bio.props.value = 'Building thoughtful things, one component at a time.'
    const row = makeNode('stack')
    row.layout = { direction: 'row', gap: 3 }
    const save = makeNode('dialog')
    save.props = {
      trigger: 'Save changes',
      title: 'Changes ready',
      description: 'This is a local preview. Connect your own API after exporting.',
    }
    const cancel = makeNode('button')
    cancel.props = { text: 'Cancel', variant: 'outline', size: 'default', disabled: false }
    row.children = [save, cancel]
    card.children = [grid, role, bio, row]
    const preferences = makeNode('card')
    preferences.props = {
      title: 'Preferences',
      description: 'Make this workspace feel like yours.',
    }
    preferences.children = [makeNode('switch'), makeNode('checkbox')]
    root.children = [h, sub, card, preferences]
  }
  return doc
}
export function findNode(root: CanvasNode, id: string): CanvasNode | undefined {
  if (root.id === id) return root
  for (const child of root.children) {
    const found = findNode(child, id)
    if (found) return found
  }
}
export function findParent(root: CanvasNode, id: string): CanvasNode | undefined {
  if (root.children.some((n) => n.id === id)) return root
  for (const child of root.children) {
    const found = findParent(child, id)
    if (found) return found
  }
}
export const canContain = (n: CanvasNode) =>
  ['stack', 'grid', 'card', 'tabs', 'dialog'].includes(n.type)
export function moveNode(
  root: CanvasNode,
  id: string,
  parentId: string,
  index: number,
  slot?: string,
): boolean {
  const node = findNode(root, id),
    parent = findNode(root, parentId),
    old = findParent(root, id)
  if (!node || !parent || !old || !canContain(parent) || findNode(node, parentId)) return false
  const oldIndex = old.children.findIndex((n) => n.id === id)
  old.children.splice(oldIndex, 1)
  if (old.id === parent.id && oldIndex < index) index--
  node.slot = parent.type === 'tabs' ? slot || String(parent.props.active) : undefined
  parent.children.splice(Math.max(0, Math.min(index, parent.children.length)), 0, node)
  return true
}
export function cloneNode(node: CanvasNode): CanvasNode {
  return { ...structuredClone(node), id: uid(), children: node.children.map(cloneNode) }
}
export function resolveLayout(layout: Layout, width: number) {
  return {
    ...layout,
    ...(width >= 768 ? layout.tablet : {}),
    ...(width >= 1024 ? layout.desktop : {}),
  }
}

const color = z.string().regex(/^#[0-9a-f]{6}$/i, 'Use a six-digit hex color, such as #6754cc')
const colors = (defaults: Colors) =>
  z.object(
    Object.fromEntries(
      colorNames.map((key) => [
        key,
        (extendedColorNames as readonly string[]).includes(key)
          ? color.default(defaults[key])
          : color,
      ]),
    ) as Record<(typeof colorNames)[number], typeof color | z.ZodDefault<typeof color>>,
  )
const font = z
  .string()
  .min(1)
  .max(200)
  .refine((v) => !/[\r\n]/.test(v), 'Use a single-line font family list')
  .refine(
    (v) =>
      v
        .split(',')
        .every((part) =>
          /^\s*(?:"[\p{L}\p{N}\s_-]+"|'[\p{L}\p{N}\s_-]+'|[\p{L}\p{N}_-][\p{L}\p{N}\s_-]*)\s*$/u.test(
            part,
          ),
        ),
    'Use comma-separated font names with balanced quotes',
  )
export const designSchema = z.object({
  mode: z.enum(['light', 'dark']),
  light: colors(light),
  dark: colors(dark),
  fontBody: font,
  fontHeading: font,
  fontSize: z.number().min(12).max(24),
  headingSize: z.number().min(16).max(64),
  bodyWeight: z.number().min(300).max(800),
  headingWeight: z.number().min(300).max(800),
  radius: z.number().min(0).max(32),
  spacing: z.number().min(2).max(12),
  shadow: z.enum(['none', 'soft', 'strong']),
  guidelines: z.string().max(30000),
})
const layoutBase = z.object({
  direction: z.enum(['column', 'row']).optional(),
  columns: z.number().int().min(1).max(4).optional(),
  gap: z.number().min(0).max(16).optional(),
  padding: z.number().min(0).max(20).optional(),
  align: z.enum(['stretch', 'start', 'center', 'end']).optional(),
  width: z.enum(['fill', 'auto']).optional(),
})
const layoutSchema = layoutBase.extend({
  tablet: layoutBase.optional(),
  desktop: layoutBase.optional(),
})
const nodeSchema: z.ZodType<CanvasNode> = z.lazy(() =>
  z.object({
    id: z.string().min(1).max(100),
    type: z.enum(componentTypes),
    name: z.string().max(100),
    props: z.record(
      z.string().max(100),
      z.union([
        z.string().max(10000),
        z.number().finite().min(-100000000).max(100000000),
        z.boolean(),
      ]),
    ),
    children: z.array(nodeSchema).max(200),
    layout: layoutSchema,
    slot: z.string().max(100).optional(),
  }),
)
const projectBase = z.object({
  id: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  system: z.literal('shadcn-radix'),
  design: designSchema,
  updatedAt: z.string(),
})
const legacyProjectSchema = projectBase.extend({ version: z.literal(1), root: nodeSchema })
const projectSchema = projectBase.extend({
  version: z.literal(2),
  screens: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        name: z.string().trim().min(1).max(100),
        root: nodeSchema,
      }),
    )
    .min(1)
    .max(50),
})
export function validateProject(value: unknown): ProjectDocument {
  let input = value
  if (value && typeof value === 'object' && 'version' in value && value.version === 1) {
    const { root, ...legacy } = legacyProjectSchema.parse(value)
    input = { ...legacy, version: 2, screens: [{ id: root.id, name: 'Screen 01', root }] }
  }
  const doc = projectSchema.parse(input)
  const ids = new Set<string>()
  let count = 0
  function walk(n: CanvasNode, depth: number) {
    if (depth > 20 || ++count > 500)
      throw new Error('Project is limited to 500 components and 20 nesting levels.')
    if (ids.has(n.id)) throw new Error('Duplicate component ID.')
    ids.add(n.id)
    if (!canContain(n) && n.children.length) throw new Error(`${n.type} cannot contain children.`)
    const defaults = props[n.type]
    for (const [key, value] of Object.entries(n.props))
      if (!(key in defaults) || typeof value !== typeof defaults[key])
        throw new Error(`${n.type}.${key} has an unsupported property type.`)
    n.props = { ...defaults, ...n.props }
    if (n.type === 'tabs') {
      n.props.labels = normalizedLines(n.props.labels).join('\n')
      if (!n.props.labels) throw new Error('Tabs need at least one label.')
      if (!normalizedLines(n.props.labels).includes(String(n.props.active)))
        n.props.active = normalizedLines(n.props.labels)[0]
    }
    for (const child of n.children) {
      if (n.type === 'tabs') {
        child.slot = child.slot?.trim()
        if (!normalizedLines(n.props.labels).includes(child.slot || ''))
          throw new Error('A tab child references a missing tab.')
      }
      walk(child, depth + 1)
    }
  }
  const screenIds = new Set<string>()
  for (const screen of doc.screens) {
    if (screenIds.has(screen.id)) throw new Error('Duplicate screen ID.')
    screenIds.add(screen.id)
    walk(screen.root, 0)
    if (screen.root.type !== 'stack') throw new Error('The page must be a Stack.')
  }
  return doc
}
export function parseProject(text: string) {
  if (text.length > 2_000_000) throw new Error('Project file is too large.')
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    throw new Error('Project file must contain valid JSON.')
  }
  return validateProject(raw)
}
export function toDesignMarkdown(design: Design): string {
  const { guidelines, ...tokens } = design
  return `---\n${stringify({ version: 1, ...tokens })}---\n${guidelines}`
}
export function parseDesignMarkdown(text: string): Design {
  if (text.length > 100000) throw new Error('Design.md is too large.')
  const match = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---(?:\n|$)([\s\S]*)$/)
  if (!match)
    throw new Error(
      'Start with a YAML token block between --- lines. Export a Design.md to see the format.',
    )
  const yaml = parseDocument(match[1])
  if (yaml.errors.length) throw new Error(yaml.errors[0].message)
  const data = yaml.toJS({ maxAliasCount: 0 })
  if (data?.version !== 1) throw new Error('Unsupported Design.md version. Expected version 1.')
  return designSchema.parse({ ...data, guidelines: match[2] })
}
export function readableError(e: unknown): string {
  if (e instanceof z.ZodError) {
    const issue = e.issues[0]
    return `${issue.path.join('.')}: ${issue.message}`
  }
  return e instanceof Error ? e.message : 'Something went wrong.'
}
export const kebab = (name: string) =>
  name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase()).replace(/([a-z])(\d)/g, '$1-$2')
export function themeVariables(d: Design): Record<string, string> {
  return {
    ...Object.fromEntries(Object.entries(d[d.mode]).map(([k, v]) => ['--' + kebab(k), v])),
    '--radius': d.radius + 'px',
    '--oc-space': d.spacing + 'px',
    '--font-body': d.fontBody,
    '--font-heading': d.fontHeading,
    '--font-size': d.fontSize + 'px',
    '--heading-size': d.headingSize + 'px',
    '--body-weight': String(d.bodyWeight),
    '--heading-weight': String(d.headingWeight),
    '--project-shadow':
      d.shadow === 'none'
        ? 'none'
        : d.shadow === 'soft'
          ? '0 2px 8px #00000006'
          : '0 8px 28px #00000018',
  }
}
