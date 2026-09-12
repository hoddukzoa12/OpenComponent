import { catalog, type ComponentDefinition } from './catalog'
import { themeVariables, type Design, type ProjectDocument } from './model'
import { generateProject, type ExportAssets } from './generate'

/** A system owns its component catalog, theme mapping and standalone output. */
export interface DesignSystemAdapter {
  id: ProjectDocument['system']
  label: string
  components: ComponentDefinition[]
  theme: (design: Design) => Record<string, string>
  export: (project: ProjectDocument, assets: ExportAssets) => Record<string, string>
}
export const shadcnAdapter: DesignSystemAdapter = {
  id: 'shadcn-radix',
  label: 'shadcn / Radix',
  components: catalog,
  theme: themeVariables,
  export: generateProject,
}
export const designSystems: Record<ProjectDocument['system'], DesignSystemAdapter> = {
  'shadcn-radix': shadcnAdapter,
}
