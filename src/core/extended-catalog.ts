// Editable composition recipes; catalog.ts assigns each recipe's provenance.
// Keep their serializable defaults and inspector schema together.
export const extendedDefaults = {
  footer: {
    brand: 'OpenComponent',
    description: 'Build thoughtful products with components that feel like you.',
    links:
      'Product | #product\nResources | #resources\nAbout | #about\nContact | mailto:hello@example.com',
    copyright: '© 2026 OpenComponent. All rights reserved.',
  },
  accordion: {
    items:
      'Can I customize this? | Yes. Change the content and your shared design tokens.\nIs it accessible? | Keyboard navigation is provided by Radix.',
    multiple: false,
  },
  alert: {
    title: 'Heads up',
    description: 'You can update these settings at any time.',
    variant: 'default',
  },
  'alert-dialog': {
    trigger: 'Confirm action',
    title: 'Are you sure?',
    description: 'Review the action before continuing.',
    confirm: 'Continue',
    cancel: 'Cancel',
  },
  'aspect-ratio': { ratio: 1.7778, text: '16:9 media', image: '' },
  attachment: { title: 'Project brief.pdf', description: 'PDF · 2.4 MB', state: 'done' },
  avatar: { fallback: 'AM', image: '', label: 'Alex Morgan' },
  breadcrumb: { items: 'Home\nProjects\nCurrent project' },
  bubble: { text: 'Thanks for the update!', variant: 'secondary', align: 'start' },
  'button-group': { items: 'Previous\nNext', variant: 'outline' },
  calendar: { date: '2026-09-12', disabled: false },
  carousel: { items: 'First slide\nSecond slide\nThird slide' },
  chart: {
    title: 'Monthly activity',
    data: 'Jan,186\nFeb,305\nMar,237\nApr,273\nMay,209',
    chartType: 'bar',
    series: 'Visitors',
  },
  collapsible: {
    title: 'Project details',
    text: 'Keep supporting information within reach.',
    open: false,
  },
  combobox: {
    label: 'Framework',
    placeholder: 'Select a framework',
    options: 'React\nVue\nSvelte\nAngular',
    value: 'React',
    disabled: false,
  },
  command: {
    placeholder: 'Search actions…',
    items: 'Calendar\nSearch documents\nSettings\nProfile',
  },
  'context-menu': { trigger: 'Right-click this area', items: 'Back\nForward\nReload\nSave as…' },
  'data-table': {
    headers: 'Name,Email,Status',
    rows: 'Alex Morgan,alex@example.com,Active\nJordan Lee,jordan@example.com,Pending\nTaylor Kim,taylor@example.com,Active',
    pageSize: 5,
    filterPlaceholder: 'Filter rows…',
  },
  'date-picker': { label: 'Date', placeholder: 'Pick a date', date: '2026-09-12', disabled: false },
  direction: { text: 'A direction-aware content region', direction: 'ltr' },
  drawer: {
    trigger: 'Open drawer',
    title: 'Edit details',
    description: 'Update your preferences.',
    text: 'Add helpful content here.',
    action: 'Done',
  },
  'dropdown-menu': { trigger: 'Options', items: 'Profile\nBilling\nSettings\nSign out' },
  empty: {
    title: 'No projects yet',
    description: 'Create your first project to get started.',
    action: 'Create project',
  },
  field: {
    label: 'Display name',
    description: 'This name is visible to your team.',
    placeholder: 'Your name',
    value: '',
    error: '',
    disabled: false,
  },
  form: {
    label: 'Username',
    placeholder: 'Your username',
    description: 'Enter at least two characters.',
    submit: 'Submit',
    success: 'Form submitted locally.',
  },
  'hover-card': {
    trigger: '@opencomponent',
    title: 'OpenComponent',
    description: 'Build screens from open source components.',
  },
  'input-group': {
    label: 'Website',
    prefix: 'https://',
    placeholder: 'example.com',
    suffix: '.com',
    disabled: false,
  },
  'input-otp': { label: 'Verification code', length: 6, value: '', disabled: false },
  item: {
    title: 'Project settings',
    description: 'Manage your project preferences.',
    action: 'Open',
    variant: 'outline',
  },
  kbd: { keys: '⌘\nK' },
  marker: { text: 'Today', variant: 'separator' },
  menubar: { menus: 'File\nEdit\nView', items: 'New\nOpen\nSave' },
  message: {
    author: 'Alex Morgan',
    text: 'The updated design is ready for review.',
    time: '10:42 AM',
    align: 'start',
  },
  'message-scroller': {
    messages:
      'Alex: Welcome to the project.\nJordan: The components look great.\nAlex: Let’s review the latest changes.\nJordan: Ready when you are.',
    height: 240,
  },
  'native-select': {
    label: 'Role',
    options: 'Designer\nDeveloper\nProduct manager',
    value: 'Designer',
    disabled: false,
  },
  'navigation-menu': {
    items: 'Overview\nComponents\nDocumentation',
    description: 'Explore this section.',
  },
  pagination: { pages: 5, page: 1 },
  popover: {
    trigger: 'Open popover',
    title: 'Dimensions',
    description: 'Set the dimensions for this element.',
  },
  questionnaire: {
    title: 'What would you like to build?',
    description: 'Choose the direction for your project.',
    options: 'Dashboard\nLanding page\nSettings screen',
    submit: 'Save answer',
  },
  'radio-group': {
    label: 'Plan',
    options: 'Starter\nProfessional\nEnterprise',
    value: 'Starter',
    disabled: false,
  },
  resizable: { first: 'Navigation', second: 'Content', orientation: 'horizontal', firstSize: 35 },
  'scroll-area': {
    items:
      'Overview\nGetting started\nInstallation\nComponents\nThemes\nTypography\nExamples\nResources\nChangelog\nContributing',
    height: 200,
  },
  sheet: {
    trigger: 'Open sheet',
    title: 'Edit profile',
    description: 'Update your profile details.',
    text: 'Your changes stay local to this preview.',
    side: 'right',
  },
  sidebar: {
    title: 'Workspace',
    items: 'Overview\nProjects\nTeam\nSettings',
    content: 'Select a section to explore.',
  },
  skeleton: { lines: 3, avatar: true },
  slider: { label: 'Volume', value: 50, min: 0, max: 100, step: 1, disabled: false },
  sonner: {
    trigger: 'Show notification',
    title: 'Changes saved',
    description: 'Your preferences have been updated.',
    kind: 'success',
  },
  spinner: { label: 'Loading…' },
  toast: {
    trigger: 'Show toast',
    title: 'Changes saved',
    description: 'Your preferences have been updated.',
    kind: 'success',
  },
  toggle: { text: 'Bold', pressed: false, variant: 'outline', disabled: false },
  'toggle-group': {
    items: 'Left\nCenter\nRight',
    value: 'Left',
    variant: 'outline',
    disabled: false,
  },
  tooltip: { trigger: 'Hover for help', text: 'Helpful context for this action.', side: 'top' },
  typography: { text: 'Good design makes the next action clear.', variant: 'h2' },
} satisfies Record<string, Record<string, string | number | boolean>>
export type ExtendedComponentType = keyof typeof extendedDefaults
export const extendedComponentTypes = Object.keys(extendedDefaults) as [
  ExtendedComponentType,
  ...ExtendedComponentType[],
]
export interface ExtendedPropField {
  key: string
  label: string
  kind: 'text' | 'textarea' | 'number' | 'boolean' | 'select'
  options?: string[]
  min?: number
  max?: number
  step?: number
  help?: string
}
const choices: Record<string, Record<string, string[]>> = {
  alert: { variant: ['default', 'destructive'] },
  bubble: {
    variant: ['default', 'secondary', 'muted', 'outline', 'ghost', 'destructive'],
    align: ['start', 'end'],
  },
  'button-group': { variant: ['outline', 'default', 'secondary', 'ghost'] },
  chart: { chartType: ['bar', 'line', 'area'] },
  direction: { direction: ['ltr', 'rtl'] },
  item: { variant: ['default', 'outline', 'muted'] },
  marker: { variant: ['default', 'separator', 'border'] },
  message: { align: ['start', 'end'] },
  resizable: { orientation: ['horizontal', 'vertical'] },
  sheet: { side: ['right', 'left', 'top', 'bottom'] },
  attachment: { state: ['idle', 'uploading', 'processing', 'done', 'error'] },
  sonner: { kind: ['success', 'info', 'warning', 'error'] },
  toast: { kind: ['success', 'info', 'warning', 'error'] },
  toggle: { variant: ['default', 'outline'] },
  'toggle-group': { variant: ['default', 'outline'] },
  tooltip: { side: ['top', 'bottom', 'left', 'right'] },
  typography: {
    variant: ['h1', 'h2', 'h3', 'h4', 'p', 'lead', 'large', 'small', 'muted', 'blockquote', 'code'],
  },
}
const bounds: Record<string, [number, number, number?]> = {
  ratio: [0.2, 5, 0.1],
  height: [80, 800],
  length: [4, 8],
  lines: [1, 12],
  pages: [1, 20],
  page: [1, 20],
  pageSize: [1, 50],
  firstSize: [10, 90],
  value: [0, 100],
  min: [0, 10000],
  max: [1, 10000],
  step: [1, 1000],
}
const help: Record<string, string> = {
  links:
    'One Label | URL per line. Use https://, /path, #section, mailto: or tel:. A blank or unsupported URL shows the label as text.',
  items: 'One item per line. Accordion uses “Title | Content”.',
  options: 'One option per line.',
  rows: 'One row per line; separate columns with commas.',
  headers: 'Separate column names with commas.',
  data: 'One label,value pair per line.',
  messages: 'One message per line.',
  date: 'YYYY-MM-DD',
  image: 'Image URL (https://) or a bundled data image.',
  keys: 'One key per line.',
}
export const extendedPropFields = Object.fromEntries(
  Object.entries(extendedDefaults).map(([type, props]) => [
    type,
    Object.entries(props).map(([key, value]): ExtendedPropField => ({
      key,
      label: key
        .replace(/[A-Z]/g, (c) => ' ' + c.toLowerCase())
        .replace(/^./, (c) => c.toUpperCase()),
      kind: choices[type]?.[key]
        ? 'select'
        : typeof value === 'boolean'
          ? 'boolean'
          : typeof value === 'number'
            ? 'number'
            : [
                  'items',
                  'options',
                  'rows',
                  'data',
                  'messages',
                  'text',
                  'description',
                  'links',
                ].includes(key)
              ? 'textarea'
              : 'text',
      options: choices[type]?.[key],
      ...(typeof value === 'number' && bounds[key]
        ? { min: bounds[key][0], max: bounds[key][1], step: bounds[key][2] ?? 1 }
        : {}),
      help: help[key],
    })),
  ]),
) as Record<ExtendedComponentType, ExtendedPropField[]>
export const extendedInfo = extendedComponentTypes.map((id) => ({
  id,
  label: id
    .split('-')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ')
    .replace('Otp', 'OTP')
    .replace('Kbd', 'Keyboard Shortcut'),
  category: ([
    'form',
    'field',
    'radio-group',
    'native-select',
    'combobox',
    'input-group',
    'input-otp',
    'slider',
    'toggle',
    'toggle-group',
    'date-picker',
    'calendar',
    'questionnaire',
    'button-group',
  ].includes(id)
    ? 'Forms'
    : ['aspect-ratio', 'direction', 'resizable', 'scroll-area', 'sidebar', 'footer'].includes(id)
      ? 'Layout'
      : ['typography', 'message', 'bubble', 'marker'].includes(id)
        ? 'Content'
        : [
              'alert',
              'avatar',
              'attachment',
              'chart',
              'data-table',
              'empty',
              'item',
              'kbd',
              'skeleton',
              'spinner',
            ].includes(id)
          ? 'Display'
          : 'Interaction') as 'Forms' | 'Layout' | 'Content' | 'Display' | 'Interaction',
  description:
    id === 'footer'
      ? 'An OpenComponent footer block with branding, navigation links, and copyright.'
      : id === 'toast'
        ? 'Deprecated Toast entry, using the recommended Sonner replacement.'
        : id === 'direction'
          ? 'A content region with explicit text direction.'
          : id === 'data-table'
            ? 'Filter, sort, and paginate editable table data.'
            : id === 'chart'
              ? 'Bar, line, or area chart using editable data.'
              : `An editable ${id.replaceAll('-', ' ')} composition.`,
  tags:
    id === 'footer'
      ? 'footer site bottom copyright brand navigation links local block'
      : `${id.replaceAll('-', ' ')} shadcn ${['data-table', 'date-picker', 'typography', 'questionnaire', 'toast'].includes(id) ? 'recipe' : ''}`,
}))
