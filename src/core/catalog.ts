import type { ComponentType } from './model'
import { extendedInfo } from './extended-catalog'
export interface ComponentDefinition {
  id: ComponentType
  label: string
  category: 'Layout' | 'Content' | 'Forms' | 'Display' | 'Interaction'
  source: 'OpenComponent' | 'shadcn/ui' | 'Magic UI'
  description: string
  tags: string
  license: 'MIT' | 'Apache-2.0'
  revision: string
  url: string
}
const info: [ComponentType, string, ComponentDefinition['category'], string, string][] = [
  ['stack', 'Stack', 'Layout', 'Arrange items vertically or horizontally.', 'row column flex'],
  ['grid', 'Grid', 'Layout', 'A responsive grid with up to four columns.', 'columns responsive'],
  ['heading', 'Heading', 'Content', 'A title using your heading typography.', 'title text'],
  ['text', 'Text', 'Content', 'Body copy with semantic color.', 'paragraph description'],
  ['button', 'Button', 'Forms', 'An action with six visual variants.', 'action submit'],
  ['input', 'Input', 'Forms', 'A labeled single-line text field.', 'email name field'],
  ['textarea', 'Textarea', 'Forms', 'A labeled field for longer text.', 'bio description field'],
  ['label', 'Label', 'Forms', 'A standalone text label.', 'caption'],
  ['checkbox', 'Checkbox', 'Forms', 'A labeled multiple-choice control.', 'check consent'],
  ['switch', 'Switch', 'Forms', 'A labeled toggle for preferences.', 'toggle settings'],
  ['select', 'Select', 'Forms', 'Choose an option from a dropdown.', 'dropdown options'],
  ['card', 'Card', 'Layout', 'Group related content with a title.', 'panel container'],
  ['tabs', 'Tabs', 'Interaction', 'Organize content into named tabs.', 'navigation panels'],
  [
    'dialog',
    'Dialog',
    'Interaction',
    'A trigger and accessible modal content.',
    'modal popup confirm',
  ],
  ['badge', 'Badge', 'Display', 'A compact status label.', 'tag status'],
  ['separator', 'Separator', 'Layout', 'A subtle divider between sections.', 'line divider'],
  ['table', 'Table', 'Display', 'A simple data table with editable rows.', 'data members records'],
  ['progress', 'Progress', 'Display', 'A labeled progress indicator.', 'usage bar'],
  [
    'number-ticker',
    'Number Ticker',
    'Display',
    'An animated number for metrics.',
    'stats counter magic',
  ],
  [
    'animated-circular-progress-bar',
    'Circular Progress',
    'Display',
    'A percentage gauge for usage metrics.',
    'ring gauge magic',
  ],
]
export const catalog: ComponentDefinition[] = info.map(
  ([id, label, category, description, tags], i) => ({
    id,
    label,
    category,
    description,
    tags,
    source: i < 4 ? 'OpenComponent' : i >= 18 ? 'Magic UI' : 'shadcn/ui',
    license: i < 4 ? 'Apache-2.0' : 'MIT',
    revision:
      i < 4
        ? '0.1.0'
        : i >= 18
          ? 'ec1cce6c4192c0aaac279dd7e53537ccd5c99d44'
          : '3ba91b1cc83e1bbe4ab35a422ff2a694849c5048',
    url:
      i < 4
        ? ''
        : i >= 18
          ? `https://magicui.design/docs/components/${id}`
          : `https://ui.shadcn.com/docs/components/${id}`,
  }),
)

catalog.push(
  ...extendedInfo.map((info) => ({
    ...info,
    source: info.id === 'footer' ? ('OpenComponent' as const) : ('shadcn/ui' as const),
    license: info.id === 'footer' ? ('Apache-2.0' as const) : ('MIT' as const),
    revision: info.id === 'footer' ? '0.1.0' : '3ba91b1cc83e1bbe4ab35a422ff2a694849c5048',
    url:
      info.id === 'footer'
        ? ''
        : info.id === 'form'
          ? 'https://ui.shadcn.com/docs/forms/react-hook-form'
          : `https://ui.shadcn.com/docs/components/radix/${info.id}`,
  })),
)
