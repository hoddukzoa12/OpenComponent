import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
  pointerWithin,
  MeasuringStrategy,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  Boxes,
  Layers,
  Palette,
  Settings2,
  Plus,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Undo2,
  Redo2,
  Play,
  Download,
  Monitor,
  Tablet,
  Smartphone,
  X,
  Check,
  FolderOpen,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  FileCode2,
  ExternalLink,
  Grip,
  Sun,
  Moon,
  SlidersHorizontal,
  LayoutTemplate,
  Info,
  PanelLeftClose,
  Maximize2,
  HelpCircle,
} from 'lucide-react'
import { useEditor } from './core/store'
import { fitCanvasScale } from './core/canvas-fit'
import {
  DEFAULT_PANEL_SIZES,
  PANEL_SIZE_STORAGE_KEY,
  panelLayout,
  parsePanelSizes,
  type PanelSide,
} from './core/panel-sizes'
import { catalog, type ComponentDefinition } from './core/catalog'
import { extendedPropFields, type ExtendedComponentType } from './core/extended-catalog'
import {
  normalizedLines,
  resolveLayout,
  getActiveScreen,
  canContain,
  createProject,
  findNode,
  findParent,
  makeNode,
  parseProject,
  parseDesignMarkdown,
  toDesignMarkdown,
  readableError,
  themeVariables,
  colorNames,
  type CanvasNode,
  type ComponentType,
  type Design,
  type Layout,
  type ProjectDocument,
} from './core/model'
import {
  listProjects,
  saveProject,
  removeProject,
  lastProjectId,
  storageWarnings,
} from './core/storage'
import { exportProject, downloadFile } from './core/export'
import { NodeView, DropSlot } from './renderer'
import { Preview } from './Preview'
import { ExtendedThumbnail } from './components/ExtendedThumbnail'
import { PanelResizeHandle } from './components/PanelResizeHandle'
import { ProjectPortal, ProjectViewport } from './lib/portal'

function IconButton({
  label,
  onClick,
  children,
  disabled = false,
  active = false,
}: {
  label: string
  onClick: () => void
  children: ReactNode
  disabled?: boolean
  active?: boolean
}) {
  return (
    <button
      className={`icon-button ${active ? 'active' : ''}`}
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    ref.current?.showModal()
    return () => ref.current?.close()
  }, [])
  return (
    <dialog
      className={`app-modal ${wide ? 'wide' : ''}`}
      ref={ref}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      <div className="modal-heading">
        <h2>{title}</h2>
        <IconButton label="Close" onClick={onClose}>
          <X size={18} />
        </IconButton>
      </div>
      {children}
    </dialog>
  )
}
function PaletteItem({ entry, onInspect }: { entry: ComponentDefinition; onInspect: () => void }) {
  const add = useEditor((s) => s.add)
  const node = useMemo(() => makeNode(entry.id), [entry.id])
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette:${entry.id}`,
    data: { type: entry.id },
  })
  return (
    <div className={`component-tile ${isDragging ? 'dragging' : ''}`}>
      <div
        className="tile-insert"
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        onClick={() => add(entry.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            add(entry.id)
          }
        }}
        aria-label={`Add ${entry.label}`}
        title={`Add ${entry.label}`}
      >
        <div className="tile-preview" aria-hidden="true" inert>
          <div className="tile-render">
            {extendedPropFields[entry.id as ExtendedComponentType] ? (
              <ExtendedThumbnail type={entry.id} />
            ) : (
              <NodeView node={node} width={300} preview />
            )}
          </div>
        </div>
        <div className="tile-label">
          {entry.label}
          <Plus size={12} />
        </div>
      </div>
      <button
        className="tile-info"
        title={`${entry.label} details`}
        aria-label={`${entry.label} details`}
        onClick={onInspect}
      >
        <Info size={12} />
      </button>
    </div>
  )
}
function LayerTree({
  node,
  depth = 0,
  parent,
  index = 0,
}: {
  node: CanvasNode
  depth?: number
  parent?: CanvasNode
  index?: number
}) {
  const s = useEditor()
  const [open, setOpen] = useState(true)
  const drag = useDraggable({
    id: `layer:${node.id}`,
    data: { nodeId: node.id, screenId: s.activeScreenId },
    disabled: !parent,
  })
  const inside = useDroppable({
    id: `layer-inside:${node.id}`,
    data: {
      parent: node.id,
      index: node.children.length,
      slot: node.type === 'tabs' ? String(node.props.active) : undefined,
    },
    disabled: !canContain(node),
  })
  return (
    <div className="layer-branch">
      {parent && <DropSlot parent={parent.id} index={index} slot={node.slot} surface="layer" />}
      <div
        ref={drag.setNodeRef}
        data-layer-id={node.id}
        className={`layer-row ${s.selected === node.id ? 'chosen' : ''} ${drag.isDragging ? 'dragging' : ''}`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        {canContain(node) ? (
          <button
            onClick={() => setOpen(!open)}
            aria-label={`${open ? 'Collapse' : 'Expand'} ${node.name}`}
            className="layer-chevron"
          >
            {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="layer-chevron" />
        )}
        {parent && (
          <button
            className="layer-grip"
            {...drag.attributes}
            {...drag.listeners}
            aria-label={`Move layer ${node.name}`}
          >
            <Grip size={14} />
          </button>
        )}
        <button
          ref={inside.setNodeRef}
          onClick={() => s.select(node.id)}
          className={`layer-name ${inside.isOver ? 'drop-inside' : ''}`}
        >
          <span>{node.name}</span>
          {inside.isOver && <small>Move inside</small>}
          {node.slot && <small>{node.slot}</small>}
        </button>
      </div>
      {open &&
        node.children.map((child, i) => (
          <LayerTree key={child.id} node={child} depth={depth + 1} parent={node} index={i} />
        ))}
      {canContain(node) && open && (
        <DropSlot parent={node.id} index={node.children.length} surface="layer" />
      )}
    </div>
  )
}
function ScreenList() {
  const s = useEditor()
  const [expanded, setExpanded] = useState(true)
  const [renaming, setRenaming] = useState<string | null>(null)
  return (
    <section className="screen-list" aria-label="Screens">
      <div className="screen-list-heading">
        <button onClick={() => setExpanded(!expanded)} aria-expanded={expanded}>
          <ChevronDown size={14} />
          Screens <span>{s.doc.screens.length}</span>
        </button>
        <IconButton
          label="Add screen"
          onClick={() => {
            s.addScreen()
            setExpanded(true)
          }}
        >
          <Plus size={16} />
        </IconButton>
      </div>
      {expanded && (
        <div className="screen-list-items">
          {s.doc.screens.map((screen) => (
            <div
              key={screen.id}
              className={`screen-row ${s.activeScreenId === screen.id ? 'active' : ''}`}
            >
              {renaming === screen.id ? (
                <input
                  autoFocus
                  aria-label="Screen name"
                  defaultValue={screen.name}
                  maxLength={100}
                  onFocus={(e) => e.target.select()}
                  onBlur={(e) => {
                    s.renameScreen(screen.id, e.target.value.trim() || screen.name)
                    setRenaming(null)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') {
                      setRenaming(null)
                      e.stopPropagation()
                    }
                  }}
                />
              ) : (
                <button
                  className="screen-select"
                  onClick={() => s.selectScreen(screen.id)}
                  onDoubleClick={() => setRenaming(screen.id)}
                  aria-current={s.activeScreenId === screen.id ? 'page' : undefined}
                >
                  <LayoutTemplate size={14} />
                  <span>{screen.name}</span>
                </button>
              )}
              <button
                className="screen-action"
                aria-label={`Rename screen ${screen.name}`}
                onClick={() => setRenaming(screen.id)}
              >
                <Settings2 size={13} />
              </button>
              <button
                className="screen-action"
                aria-label={`Duplicate screen ${screen.name}`}
                onClick={() => s.duplicateScreen(screen.id)}
              >
                <Copy size={13} />
              </button>
              <button
                className="screen-action"
                aria-label={`Delete screen ${screen.name}`}
                disabled={s.doc.screens.length === 1}
                onClick={() => {
                  if (confirm(`Delete “${screen.name}”? You can restore it with Undo.`))
                    s.removeScreen(screen.id)
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="property-field">
      <span>{label}</span>
      {children}
    </label>
  )
}
function TextSetting({
  value,
  onCommit,
  multiline = false,
  ...rest
}: {
  value: string
  onCommit: (v: string) => void
  multiline?: boolean
  'aria-label'?: string
  placeholder?: string
}) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  const props = {
    ...rest,
    value: draft,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setDraft(e.target.value),
    onBlur: () => {
      if (draft !== value) onCommit(draft)
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !multiline) (e.target as HTMLElement).blur()
    },
  }
  return multiline ? <textarea rows={3} {...props} /> : <input {...props} />
}
function Inspector() {
  const s = useEditor()
  const root = getActiveScreen(s.doc, s.activeScreenId).root
  const node = s.selected ? findNode(root, s.selected) : undefined
  const [breakpoint, setBreakpoint] = useState<'base' | 'tablet' | 'desktop'>('base')
  if (!node)
    return (
      <div className="inspector-empty">
        <div className="empty-icon">
          <SlidersHorizontal size={25} />
        </div>
        <h3>A place for the details</h3>
        <p>Select a component to edit its properties, content, and layout.</p>
        <div className="empty-shortcuts">
          <span>
            Undo <kbd>⌘ Z</kbd>
          </span>
          <span>
            Duplicate <kbd>⌘ D</kbd>
          </span>
          <span>
            Delete <kbd>⌫</kbd>
          </span>
        </div>
        <div className="inspector-tip">
          <span>PROJECT FOUNDATION</span>
          <strong>shadcn / Radix</strong>
          <p>Compatible components, one design system.</p>
        </div>
      </div>
    )
  const entry = catalog.find((c) => c.id === node.type)!
  const parent = findParent(root, node.id)
  const update = (fn: (n: CanvasNode) => void) => s.updateNode(node.id, fn)
  const setProp = (key: string, value: string | number | boolean) =>
    update((n) => {
      n.props[key] = value
      if (key === 'labels') {
        const labels = normalizedLines(value)
        if (!labels.length) labels.push('General')
        n.props.labels = labels.join('\n')
        if (!labels.includes(String(n.props.active))) n.props.active = labels[0]
        for (const child of n.children)
          if (!labels.includes(child.slot || '')) child.slot = labels[0]
      }
      if (
        key === 'options' &&
        'value' in n.props &&
        !String(value).split('\n').includes(String(n.props.value))
      )
        n.props.value = String(value).split('\n')[0] || ''
    })
  const selectedLayout = resolveLayout(
    node.layout,
    breakpoint === 'base' ? 375 : breakpoint === 'tablet' ? 768 : 1024,
  )
  const layoutLabel = (key: keyof Layout) =>
    `${key}${breakpoint !== 'base' && !Object.hasOwn(node.layout[breakpoint] || {}, key) ? ' · inherited' : ''}`
  const setLayout = (key: string, value: unknown) =>
    update((n) => {
      if (breakpoint === 'base') n.layout = { ...n.layout, [key]: value }
      else n.layout[breakpoint] = { ...n.layout[breakpoint], [key]: value }
    })
  return (
    <>
      <div className="inspector-title">
        <div>
          <strong>{entry.label}</strong>
          <span>{entry.source}</span>
        </div>
        <div className="badge-small">Component</div>
      </div>
      <section className="property-section">
        <h3>Layer</h3>
        <FieldRow label="Name">
          <TextSetting
            value={node.name}
            onCommit={(v) =>
              update((n) => {
                n.name = v.slice(0, 100)
              })
            }
          />
        </FieldRow>
        {parent && (
          <div className="layer-actions">
            <IconButton
              label="Move up"
              onClick={() =>
                s.move(
                  node.id,
                  parent.id,
                  Math.max(0, parent.children.indexOf(node) - 1),
                  node.slot,
                )
              }
            >
              <ArrowUp size={15} />
            </IconButton>
            <IconButton
              label="Move down"
              onClick={() =>
                s.move(node.id, parent.id, parent.children.indexOf(node) + 2, node.slot)
              }
            >
              <ArrowDown size={15} />
            </IconButton>
            <IconButton label="Duplicate component" onClick={() => s.duplicate(node.id)}>
              <Copy size={15} />
            </IconButton>
            <IconButton label="Delete component" onClick={() => s.remove(node.id)}>
              <Trash2 size={15} />
            </IconButton>
          </div>
        )}
        {parent?.type === 'tabs' && (
          <FieldRow label="Tab">
            <select
              value={node.slot}
              onChange={(e) =>
                update((n) => {
                  n.slot = e.target.value
                })
              }
            >
              {String(parent.props.labels)
                .split('\n')
                .map((v) => (
                  <option key={v}>{v}</option>
                ))}
            </select>
          </FieldRow>
        )}
      </section>
      {Object.keys(node.props).length > 0 && (
        <section className="property-section">
          <h3>Content & properties</h3>
          {Object.entries(node.props)
            .filter(([key]) => key !== 'level')
            .map(([key, value]) => {
              const field = extendedPropFields[node.type as ExtendedComponentType]?.find(
                (item) => item.key === key,
              )
              const options =
                field?.options ??
                (key === 'variant'
                  ? node.type === 'badge'
                    ? ['default', 'secondary', 'outline', 'destructive']
                    : ['default', 'secondary', 'outline', 'ghost', 'link', 'destructive']
                  : key === 'size'
                    ? ['sm', 'default', 'lg']
                    : key === 'tone'
                      ? ['default', 'muted']
                      : key === 'active'
                        ? String(node.props.labels).split('\n')
                        : null)
              const label =
                field?.label ??
                (key === 'rows'
                  ? 'Rows (comma-separated)'
                  : key === 'headers'
                    ? 'Headers (comma-separated)'
                    : key === 'options' || key === 'labels'
                      ? `${key} (one per line)`
                      : key)
              return (
                <FieldRow key={key} label={label}>
                  {typeof value === 'boolean' ? (
                    <input
                      className="native-toggle"
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setProp(key, e.target.checked)}
                    />
                  ) : options ? (
                    <select value={String(value)} onChange={(e) => setProp(key, e.target.value)}>
                      {options.map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  ) : typeof value === 'number' ? (
                    <input
                      type="number"
                      min={field?.min ?? 0}
                      max={field?.max ?? (node.type === 'number-ticker' ? 100000000 : 100)}
                      step={field?.step ?? 1}
                      value={value}
                      onChange={(e) =>
                        setProp(
                          key,
                          Math.max(
                            field?.min ?? 0,
                            Math.min(
                              field?.max ?? (node.type === 'number-ticker' ? 100000000 : 100),
                              Number(e.target.value),
                            ),
                          ),
                        )
                      }
                    />
                  ) : (
                    <TextSetting
                      value={String(value)}
                      multiline={
                        field?.kind === 'textarea' ||
                        ['rows', 'headers', 'text', 'description', 'labels', 'options'].includes(
                          key,
                        )
                      }
                      onCommit={(v) => setProp(key, v)}
                    />
                  )}
                  {field?.help && <small className="field-help">{field.help}</small>}
                </FieldRow>
              )
            })}
        </section>
      )}
      {['stack', 'grid', 'card'].includes(node.type) && (
        <section className="property-section">
          <h3>Layout overrides</h3>
          <p className="field-help">
            Editing rules for this breakpoint. Canvas width is controlled above the screen.
          </p>
          <div className="segmented compact">
            {(['base', 'tablet', 'desktop'] as const).map((v) => (
              <button
                key={v}
                className={breakpoint === v ? 'selected' : ''}
                onClick={() => setBreakpoint(v)}
              >
                {v === 'base' ? 'Base' : v === 'tablet' ? '≥768px' : '≥1024px'}
              </button>
            ))}
          </div>
          {breakpoint !== 'base' && (
            <p className="field-help">Unset values inherit from smaller breakpoints.</p>
          )}
          {node.type === 'stack' && (
            <FieldRow label={layoutLabel('direction')}>
              <select
                value={selectedLayout.direction ?? node.layout.direction ?? 'column'}
                onChange={(e) => setLayout('direction', e.target.value)}
              >
                <option value="column">Vertical</option>
                <option value="row">Horizontal</option>
              </select>
            </FieldRow>
          )}
          {node.type === 'grid' && (
            <FieldRow label={layoutLabel('columns')}>
              <input
                type="number"
                min={1}
                max={4}
                value={selectedLayout.columns ?? node.layout.columns ?? 1}
                onChange={(e) =>
                  setLayout('columns', Math.max(1, Math.min(4, Number(e.target.value))))
                }
              />
            </FieldRow>
          )}
          {(['gap', 'padding'] as const).map((k) => (
            <FieldRow key={k} label={`${layoutLabel(k)} · spacing units`}>
              <input
                type="number"
                min={0}
                max={k === 'gap' ? 16 : 20}
                value={selectedLayout[k] ?? node.layout[k] ?? (k === 'gap' ? 4 : 0)}
                onChange={(e) =>
                  setLayout(k, Math.max(0, Math.min(k === 'gap' ? 16 : 20, Number(e.target.value))))
                }
              />
            </FieldRow>
          ))}
          <FieldRow label={layoutLabel('align')}>
            <select
              value={selectedLayout.align ?? 'stretch'}
              onChange={(e) => setLayout('align', e.target.value)}
            >
              {['stretch', 'start', 'center', 'end'].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </FieldRow>
          {breakpoint !== 'base' && (
            <button
              className="text-button"
              onClick={() =>
                update((n) => {
                  delete n.layout[breakpoint]
                })
              }
            >
              Reset overrides
            </button>
          )}
        </section>
      )}
      <section className="property-section">
        <h3>Design connection</h3>
        <p className="field-help">
          Colors and typography follow your project tokens. Edit them in Design.
        </p>
        <div className="token-chips">
          <span>◈ primary</span>
          <span>◈ foreground</span>
          <span>◈ radius</span>
        </div>
      </section>
    </>
  )
}
function DesignPanel({
  openFileEditor,
  notice,
}: {
  openFileEditor: () => void
  notice: (s: string) => void
}) {
  const { doc, edit } = useEditor()
  const d = doc.design
  const update = (fn: (d: Design) => void) => {
    try {
      edit((p) => fn(p.design))
    } catch (e) {
      notice(readableError(e))
    }
  }
  const important = [
    'background',
    'foreground',
    'primary',
    'primaryForeground',
    'muted',
    'mutedForeground',
    'border',
    'ring',
  ] as const
  const [all, setAll] = useState(false)
  return (
    <div className="design-panel">
      <div className="panel-heading">
        <h2>Design system</h2>
        <span className="badge-small">Project</span>
      </div>
      <p className="panel-description">One set of rules. Every component.</p>
      <button className="file-card" onClick={openFileEditor}>
        <FileCode2 size={19} />
        <span>
          <strong>Design.md</strong>
          <small>Edit or import your tokens</small>
        </span>
        <ChevronRight size={15} />
      </button>
      <section className="property-section">
        <h3>Appearance</h3>
        <div className="segmented">
          {(['light', 'dark'] as const).map((mode) => (
            <button
              className={d.mode === mode ? 'selected' : ''}
              key={mode}
              onClick={() =>
                update((v) => {
                  v.mode = mode
                })
              }
            >
              {mode === 'light' ? <Sun size={14} /> : <Moon size={14} />}{' '}
              {mode[0].toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </section>
      <section className="property-section">
        <h3>
          Colors <span>{d.mode}</span>
        </h3>
        {(all ? colorNames : important).map((key) => (
          <div className="color-row" key={key}>
            <input
              aria-label={`${key} color`}
              type="color"
              value={d[d.mode][key]}
              onChange={(e) =>
                update((v) => {
                  v[v.mode][key] = e.target.value
                })
              }
            />
            <label>{key}</label>
            <TextSetting
              aria-label={`${key} hex`}
              value={d[d.mode][key]}
              onCommit={(v) =>
                update((t) => {
                  t[t.mode][key] = v
                })
              }
            />
          </div>
        ))}
        <button className="text-button" onClick={() => setAll(!all)}>
          {all ? 'Show essential tokens' : 'Show all color tokens'}
        </button>
      </section>
      <section className="property-section">
        <h3>Typography</h3>
        {(['fontHeading', 'fontBody'] as const).map((k) => (
          <FieldRow key={k} label={k === 'fontBody' ? 'Body font' : 'Heading font'}>
            <TextSetting
              value={d[k]}
              onCommit={(v) =>
                update((t) => {
                  t[k] = v
                })
              }
            />
          </FieldRow>
        ))}
        <p className="field-help">
          Uses fonts installed on this device. Include your font files when publishing the exported
          app.
        </p>
        {(['fontSize', 'headingSize', 'bodyWeight', 'headingWeight'] as const).map((k) => (
          <FieldRow key={k} label={k}>
            <input
              type="number"
              value={d[k]}
              min={k.includes('Weight') ? 300 : k === 'fontSize' ? 12 : 16}
              max={k.includes('Weight') ? 800 : k === 'fontSize' ? 24 : 64}
              step={k.includes('Weight') ? 100 : 1}
              onChange={(e) =>
                update((t) => {
                  t[k] = Number(e.target.value)
                })
              }
            />
          </FieldRow>
        ))}
      </section>
      <section className="property-section">
        <h3>Shape & spacing</h3>
        {(['radius', 'spacing'] as const).map((k) => (
          <FieldRow key={k} label={`${k} · px`}>
            <input
              type="number"
              min={k === 'radius' ? 0 : 2}
              max={k === 'radius' ? 32 : 12}
              value={d[k]}
              onChange={(e) =>
                update((t) => {
                  t[k] = Number(e.target.value)
                })
              }
            />
          </FieldRow>
        ))}
        <FieldRow label="Shadow">
          <select
            value={d.shadow}
            onChange={(e) =>
              update((t) => {
                t.shadow = e.target.value as Design['shadow']
              })
            }
          >
            {['none', 'soft', 'strong'].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </FieldRow>
      </section>
    </div>
  )
}

export default function App() {
  const s = useEditor(),
    { doc } = s
  const screen = getActiveScreen(doc, s.activeScreenId)
  const root = screen.root
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(false)
  const [panelWidths, setPanelWidths] = useState(() => {
    try {
      return parsePanelSizes(localStorage.getItem(PANEL_SIZE_STORAGE_KEY))
    } catch {
      return { ...DEFAULT_PANEL_SIZES }
    }
  })
  const [windowWidth, setWindowWidth] = useState(() => window.innerWidth)
  const panels = panelLayout(panelWidths, windowWidth, leftOpen)
  const resizePanel = (side: PanelSide, value: number) =>
    setPanelWidths((current) =>
      current[side] === value
        ? current
        : { ...panelLayout(current, windowWidth, leftOpen).sizes, [side]: value },
    )
  useEffect(() => {
    const resize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(PANEL_SIZE_STORAGE_KEY, JSON.stringify(panelWidths))
    } catch {
      // Resizing remains usable when this browser disallows persistent UI settings.
    }
  }, [panelWidths])
  const [previewDocument, setPreviewDocument] = useState<ProjectDocument | null>(null)
  const previewButton = useRef<HTMLButtonElement>(null)
  const dragScreen = useRef<string | null>(null)
  const [panel, setPanel] = useState<'components' | 'layers' | 'design'>('components'),
    [query, setQuery] = useState(''),
    [source, setSource] = useState('All sources'),
    [category, setCategory] = useState('All')
  const [width, setWidth] = useState(768),
    [preview, setPreview] = useState(false),
    [available, setAvailable] = useState({ width: 900, height: 600 }),
    [frameHeight, setFrameHeight] = useState(700),
    [zoom, setZoom] = useState<number | 'fit'>('fit')
  const [ready, setReady] = useState(false),
    [saveState, setSaveState] = useState('Loading'),
    [toast, setToast] = useState(''),
    [projects, setProjects] = useState<ProjectDocument[]>([]),
    [showProjects, setShowProjects] = useState(false),
    [showNew, setShowNew] = useState(false),
    [newName, setNewName] = useState('My project'),
    [newExample, setNewExample] = useState(true)
  const [inspecting, setInspecting] = useState<ComponentDefinition | null>(null),
    [designOpen, setDesignOpen] = useState(false),
    [designDraft, setDesignDraft] = useState(''),
    [designError, setDesignError] = useState(''),
    [exporting, setExporting] = useState(false),
    [exportMenu, setExportMenu] = useState(false),
    [activeDrag, setActiveDrag] = useState<string | null>(null),
    [help, setHelp] = useState(false)
  const [portal, setPortal] = useState<HTMLDivElement | null>(null)
  const canvasArea = useRef<HTMLDivElement>(null),
    canvasFrame = useRef<HTMLDivElement>(null),
    projectInput = useRef<HTMLInputElement>(null),
    designInput = useRef<HTMLInputElement>(null),
    saveRevision = useRef(0)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )
  const notice = (message: string) => setToast(message)
  useEffect(() => {
    if (s.selected) {
      setRightOpen(true)
      requestAnimationFrame(() => {
        const node = canvasArea.current?.querySelector(
          `[data-node-id="${CSS.escape(s.selected!)}"]`,
        )
        node?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      })
    }
  }, [s.selected])
  useEffect(() => () => useEditor.getState().setReadOnly(false), [])
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const list = await listProjects(),
          last = await lastProjectId()
        if (!alive) return
        setProjects(list)
        if (storageWarnings.length)
          notice(
            `Could not read ${storageWarnings.length} stored project(s). Their data has been preserved.`,
          )
        if (list.length) s.load(list.find((d) => d.id === last) || list[0])
        setSaveState('Unsaved')
      } catch (e) {
        if (alive) {
          setSaveState('Save unavailable')
          notice('Browser storage is unavailable. Export a project file to keep your work.')
        }
      } finally {
        if (alive) setReady(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [])
  useEffect(() => {
    if (!ready) return
    const revision = ++saveRevision.current
    setSaveState('Saving')
    const timer = setTimeout(() => {
      saveProject(doc)
        .then(() => {
          if (revision === saveRevision.current) setSaveState('Saved locally')
        })
        .catch(() => {
          if (revision === saveRevision.current) {
            setSaveState('Save failed')
            notice('Could not save locally. Download a project backup from Export.')
          }
        })
    }, 500)
    return () => clearTimeout(timer)
  }, [doc, ready])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 6500)
    return () => clearTimeout(timer)
  }, [toast])
  useEffect(() => {
    const el = canvasArea.current,
      frame = canvasFrame.current
    if (!el || !frame) return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width <= 0 || entry.contentRect.height <= 0) continue
        if (entry.target === el) {
          const { width, height } = entry.contentRect
          setAvailable((current) =>
            current.width === width && current.height === height ? current : { width, height },
          )
        } else {
          // offsetHeight stays in screen CSS pixels regardless of editor zoom.
          setFrameHeight(frame.offsetHeight)
        }
      }
    })
    ro.observe(el)
    ro.observe(frame)
    return () => ro.disconnect()
  }, [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const editable = (e.target as HTMLElement).closest(
        'input,textarea,select,[contenteditable="true"]',
      )
      if (preview) {
        if (e.key === 'Escape') closePreview()
        if (
          !editable &&
          (['Backspace', 'Delete'].includes(e.key) ||
            ((e.metaKey || e.ctrlKey) && ['d', 'z', 's'].includes(e.key.toLowerCase())))
        )
          e.preventDefault()
        return
      }
      if (e.key === 'Escape') {
        setRightOpen(false)
        s.select(null)
      }
      if (editable || document.querySelector('dialog[open]')) return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        e.shiftKey ? s.redo() : s.undo()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd' && s.selected) {
        e.preventDefault()
        s.duplicate(s.selected)
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveProject(s.doc)
          .then(() => notice('Saved locally'))
          .catch(() => notice('Save failed. Download a project backup.'))
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && s.selected && s.selected !== root.id) {
        e.preventDefault()
        s.remove(s.selected)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [s, preview])
  const closePreview = () => {
    s.setReadOnly(false)
    setPreview(false)
    setPreviewDocument(null)
    requestAnimationFrame(() => previewButton.current?.focus())
  }
  const openPreview = () => {
    setPreviewDocument(structuredClone(doc))
    s.setReadOnly(true)
    setPreview(true)
    setExportMenu(false)
  }
  const openProjects = async () => {
    try {
      await saveProject(doc)
      setProjects(await listProjects())
      setShowProjects(true)
    } catch {
      notice('Could not open browser storage. Download your project as a backup.')
    }
  }
  const openDesign = () => {
    setDesignDraft(toDesignMarkdown(doc.design))
    setDesignError('')
    setDesignOpen(true)
  }
  const onDragEnd = (event: DragEndEvent) => {
    setActiveDrag(null)
    const target = event.over?.data.current
    if (!target?.parent || preview || dragScreen.current !== s.activeScreenId) return
    try {
      const type = event.active.data.current?.type as ComponentType | undefined
      if (type) s.add(type, target.parent, target.index, target.slot)
      else
        s.move(
          String(event.active.data.current?.nodeId || event.active.id),
          target.parent,
          target.index,
          target.slot,
        )
    } catch (e) {
      notice(readableError(e))
    }
  }
  const visible = catalog.filter(
    (c) =>
      (source === 'All sources' || c.source === source) &&
      (category === 'All' || c.category === category) &&
      `${c.label} ${c.tags} ${c.description}`.toLowerCase().includes(query.toLowerCase()),
  )
  const scale = zoom === 'fit' ? fitCanvasScale(available, { width, height: frameHeight }) : zoom
  const fitScreen = () => {
    setZoom('fit')
    // Repeated Fit clicks must also restore a screen that was scrolled away.
    canvasArea.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }
  useLayoutEffect(() => {
    if (zoom === 'fit') canvasArea.current?.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [zoom, scale, width, available.width, available.height, screen.id, doc.id])
  const theme = themeVariables(doc.design) as CSSProperties
  const downloadZip = async () => {
    setExportMenu(false)
    setExporting(true)
    try {
      await exportProject(doc)
      notice('React project exported. Unzip, run npm install, then npm run dev.')
    } catch (e) {
      notice(readableError(e))
    } finally {
      setExporting(false)
    }
  }
  return (
    <DndContext
      sensors={sensors}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      collisionDetection={(args) => {
        const moving = findNode(root, String(args.active.data.current?.nodeId || args.active.id))
        const eligible = args.droppableContainers.filter((container) => {
          const parentId = container.data.current?.parent
          return parentId && (!moving || !findNode(moving, parentId))
        })
        const filtered = { ...args, droppableContainers: eligible }
        if (!args.pointerCoordinates) return closestCenter(filtered).slice(0, 1)
        const hits = pointerWithin(filtered)
        return hits
          .sort((a, b) => {
            const ra = args.droppableRects.get(a.id),
              rb = args.droppableRects.get(b.id)
            return (ra ? ra.width * ra.height : Infinity) - (rb ? rb.width * rb.height : Infinity)
          })
          .slice(0, 1)
      }}
      onDragStart={(e) => {
        dragScreen.current = s.activeScreenId
        setActiveDrag(
          e.active.data.current?.type ||
            findNode(root, String(e.active.data.current?.nodeId || e.active.id))?.name ||
            'Component',
        )
      }}
      onDragCancel={() => setActiveDrag(null)}
      onDragEnd={onDragEnd}
    >
      <div
        className={`app-shell ${leftOpen ? '' : 'left-collapsed'} ${rightOpen ? 'inspector-open' : ''}`}
        inert={preview ? true : undefined}
        style={
          {
            display: preview ? 'none' : undefined,
            '--left-panel-width': `${panels.sizes.left}px`,
            '--right-panel-width': `${panels.sizes.right}px`,
          } as CSSProperties
        }
      >
        <header className="topbar">
          <button className="wordmark" onClick={() => void openProjects()}>
            <span className="logo-mark">
              <Boxes size={21} />
            </span>
            <span>
              Open<span className="brand-light">Component</span>
            </span>
            <span className="beta">BETA</span>
          </button>
          <div className="project-crumb">
            <span className="slash">/</span>
            <button onClick={() => void openProjects()}>
              {doc.name}
              <ChevronDown size={13} />
            </button>
            <span className="save-indicator">
              {saveState === 'Saved locally' ? <Check size={12} /> : null}
              {saveState}
            </span>
          </div>
          <div className="top-actions">
            <IconButton label="Undo" onClick={s.undo} disabled={!s.past.length}>
              <Undo2 size={17} />
            </IconButton>
            <IconButton label="Redo" onClick={s.redo} disabled={!s.future.length}>
              <Redo2 size={17} />
            </IconButton>
            <span className="toolbar-divider" />
            <button ref={previewButton} className="button subtle" onClick={openPreview}>
              {preview ? <ChevronLeft size={15} /> : <Play size={14} />}{' '}
              {preview ? 'Back to editor' : 'Preview'}
            </button>
            <div className="export-wrap">
              <button
                className="button primary"
                onClick={() => setExportMenu(!exportMenu)}
                disabled={exporting}
              >
                <Download size={15} />
                {exporting ? 'Exporting…' : 'Export'}
                <ChevronDown size={12} />
              </button>
              {exportMenu && (
                <div className="dropdown">
                  <button onClick={() => void downloadZip()}>
                    <FileCode2 size={16} />
                    React project .zip
                  </button>
                  <button
                    onClick={() => {
                      downloadFile(
                        `${doc.name}.opencomponent.json`,
                        JSON.stringify(doc, null, 2),
                        'application/json',
                      )
                      setExportMenu(false)
                    }}
                  >
                    <Download size={16} />
                    Project backup .json
                  </button>
                  <button
                    onClick={() => {
                      downloadFile('Design.md', toDesignMarkdown(doc.design), 'text/markdown')
                      setExportMenu(false)
                    }}
                  >
                    <Palette size={16} />
                    Design.md
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <nav className="rail" aria-label="Workspace panels">
          {(
            [
              { id: 'components', label: 'Components', icon: Boxes },
              { id: 'layers', label: 'Layers', icon: Layers },
              { id: 'design', label: 'Design', icon: Palette },
            ] as const
          ).map((v) => (
            <button
              key={v.id}
              title={v.label}
              aria-label={v.label}
              aria-current={panel === v.id ? 'page' : undefined}
              className={panel === v.id ? 'active' : ''}
              onClick={() => {
                if (panel === v.id) setLeftOpen(!leftOpen)
                else {
                  setPanel(v.id)
                  setLeftOpen(true)
                }
              }}
            >
              <v.icon size={21} />
              <span>{v.label}</span>
            </button>
          ))}
          <div className="rail-bottom">
            <button title="Projects" aria-label="Projects" onClick={() => void openProjects()}>
              <FolderOpen size={20} />
            </button>
            <button title="Help" aria-label="Help" onClick={() => setHelp(true)}>
              <HelpCircle size={20} />
            </button>
            <span className="user-avatar">OC</span>
          </div>
        </nav>
        <aside className="left-panel" id="left-panel">
          <PanelResizeHandle
            side="left"
            width={panels.sizes.left}
            {...panels.limits.left}
            onResize={(value) => resizePanel('left', value)}
            onReset={() => resizePanel('left', DEFAULT_PANEL_SIZES.left)}
          />
          <ScreenList />
          {panel === 'components' ? (
            <>
              <div className="panel-heading">
                <h2>Components</h2>
                <span
                  className="count"
                  title={`Showing ${visible.length} of ${catalog.length} components`}
                >
                  {visible.length} shown
                </span>
              </div>
              <div className="catalog-search">
                <Search size={15} />
                <input
                  placeholder="Search components…"
                  aria-label="Search components"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <kbd>⌕</kbd>
              </div>
              <div className="source-select">
                <span className="source-mark">
                  <Boxes size={14} />
                </span>
                <select
                  aria-label="Component source"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                >
                  {['All sources', 'shadcn/ui', 'Magic UI', 'OpenComponent'].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </div>
              <div className="category-tabs">
                {['All', 'Layout', 'Forms', 'Display', 'Content', 'Interaction'].map((v) => (
                  <button
                    className={category === v ? 'active' : ''}
                    key={v}
                    onClick={() => setCategory(v)}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <div className="catalog-scroll">
                <div className="catalog-section-title">
                  <span>{category === 'All' ? 'ALL COMPONENTS' : category.toUpperCase()}</span>
                  <span>{visible.length}</span>
                </div>
                <div
                  className={`component-grid render-surface ${doc.design.mode === 'dark' ? 'dark' : ''}`}
                  style={theme}
                >
                  {visible.map((c) => (
                    <PaletteItem key={c.id} entry={c} onInspect={() => setInspecting(c)} />
                  ))}
                </div>
                {!visible.length && (
                  <div className="search-empty">
                    <Search size={23} />
                    <strong>No components found</strong>
                    <p>Try another name or source.</p>
                    <button
                      className="text-button"
                      onClick={() => {
                        setQuery('')
                        setCategory('All')
                        setSource('All sources')
                      }}
                    >
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
              <div className="library-footer">
                <span className="compatible-dot" />
                Curated for shadcn / Radix<small>Click to add · drag to place</small>
              </div>
            </>
          ) : panel === 'layers' ? (
            <>
              <div className="panel-heading">
                <h2>Layers</h2>
                <Layers size={16} />
              </div>
              <div className="page-title">
                <LayoutTemplate size={15} />
                {screen.name}
                <span>SCREEN</span>
              </div>
              <div className="layers-scroll">
                <LayerTree node={root} />
              </div>
              <div className="library-footer">
                Drag the grip to move. Drop on a container to nest.
              </div>
            </>
          ) : (
            <DesignPanel openFileEditor={openDesign} notice={notice} />
          )}
        </aside>
        <main className={`workspace ${preview ? 'preview-mode' : ''}`}>
          <div className="canvas-toolbar">
            <div className="screen-breadcrumb">
              <LayoutTemplate size={15} />
              <select
                aria-label="Active screen"
                value={s.activeScreenId}
                onChange={(e) => s.selectScreen(e.target.value)}
              >
                {doc.screens.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <IconButton label="Add screen to project" onClick={() => s.addScreen()}>
                <Plus size={14} />
              </IconButton>
              <ChevronRight size={12} />
              <strong>{preview ? 'Preview' : 'Editor'}</strong>
            </div>
            <div
              className="viewport-controls"
              title="Canvas width — use Layout overrides to edit breakpoint rules"
            >
              {[
                { w: 375, icon: Smartphone, label: 'Mobile' },
                { w: 768, icon: Tablet, label: 'Tablet' },
                { w: 1280, icon: Monitor, label: 'Desktop' },
              ].map((v) => (
                <IconButton
                  key={v.w}
                  label={`${v.label} ${v.w}px`}
                  active={width === v.w}
                  onClick={() => setWidth(v.w)}
                >
                  <v.icon size={16} />
                </IconButton>
              ))}
              <input
                type="number"
                aria-label="Viewport width"
                min={320}
                max={1600}
                value={width}
                onChange={(e) =>
                  setWidth(Math.max(320, Math.min(1600, Number(e.target.value) || 320)))
                }
              />
              <span>px</span>
              <IconButton
                label="Toggle properties"
                onClick={() => setRightOpen(!rightOpen)}
                active={rightOpen}
              >
                <Settings2 size={16} />
              </IconButton>
            </div>
          </div>
          <div className="canvas-scroll" ref={canvasArea} onClick={() => s.select(null)}>
            <div
              className="canvas-frame-wrap"
              style={{
                width: width * scale + 2,
                minHeight: 700 * scale,
                marginTop:
                  zoom === 'fit' ? Math.max(0, (available.height - frameHeight * scale) / 2) : 0,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="frame-label">
                <span>{doc.name}</span>
                <span>{width} × Auto</span>
              </div>
              <div
                className="canvas-frame"
                ref={canvasFrame}
                style={
                  {
                    width,
                    zoom: scale,
                    '--editor-scale': scale,
                    '--inverse-scale': 1 / scale,
                  } as CSSProperties
                }
              >
                <div
                  className={`render-surface ${doc.design.mode === 'dark' ? 'dark' : ''}`}
                  style={theme}
                >
                  <ProjectPortal.Provider value={portal ?? undefined}>
                    <ProjectViewport.Provider value={width}>
                      <NodeView
                        key={doc.id + screen.id}
                        node={root}
                        width={width}
                        preview={false}
                        root
                      />
                    </ProjectViewport.Provider>
                  </ProjectPortal.Provider>
                </div>
              </div>
            </div>
          </div>
          <footer className="workspace-footer">
            <span>
              <span className="compatible-dot" />
              {preview ? 'Interactive preview' : 'Local workspace'}
            </span>
            <span className="workspace-hint">
              {preview
                ? 'Try your components as they will behave in React'
                : 'Select to edit. Drag to arrange.'}
            </span>
            <div className="zoom-control">
              <IconButton label="Fit screen" onClick={fitScreen}>
                <Maximize2 size={13} />
              </IconButton>
              <select
                aria-label="Zoom"
                value={zoom}
                onChange={(e) =>
                  e.target.value === 'fit' ? fitScreen() : setZoom(Number(e.target.value))
                }
              >
                <option value="fit">Fit · {Math.round(scale * 100)}%</option>
                <option value="0.5">50%</option>
                <option value="0.75">75%</option>
                <option value="1">100%</option>
              </select>
            </div>
          </footer>
        </main>
        <aside className="right-panel" id="right-panel">
          <PanelResizeHandle
            side="right"
            width={panels.sizes.right}
            {...panels.limits.right}
            onResize={(value) => resizePanel('right', value)}
            onReset={() => resizePanel('right', DEFAULT_PANEL_SIZES.right)}
          />
          <div className="right-panel-tabs">
            <button className="active">
              <Settings2 size={14} />
              Properties
            </button>
            <IconButton label="Close properties" onClick={() => setRightOpen(false)}>
              <X size={16} />
            </IconButton>
          </div>
          <div className="inspector-scroll">
            <Inspector />
          </div>
        </aside>
      </div>
      <div
        ref={setPortal}
        className={`render-surface portal-theme ${doc.design.mode === 'dark' ? 'dark' : ''}`}
        style={theme}
      />
      {preview && previewDocument && (
        <Preview document={previewDocument} screenId={s.activeScreenId} onClose={closePreview} />
      )}
      <DragOverlay>
        {activeDrag ? (
          <div className="drag-overlay">
            <Boxes size={16} />
            {catalog.find((c) => c.id === activeDrag)?.label || activeDrag}
          </div>
        ) : null}
      </DragOverlay>
      {toast && (
        <div className="toast" role="status">
          <Info size={16} />
          <span>{toast}</span>
          <button onClick={() => setToast('')} aria-label="Dismiss notification">
            <X size={15} />
          </button>
        </div>
      )}
      <input
        ref={projectInput}
        type="file"
        accept=".json"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file)
            try {
              const next = parseProject(await file.text())
              next.id = crypto.randomUUID()
              next.name = `${next.name} (imported)`.slice(0, 100)
              await saveProject(doc)
              s.load(next)
              setShowProjects(false)
              notice('Project imported.')
            } catch (err) {
              notice(readableError(err))
            }
          e.target.value = ''
        }}
      />
      <input
        ref={designInput}
        type="file"
        accept=".md,.markdown"
        hidden
        onChange={async (e) => {
          const file = e.target.files?.[0]
          if (file)
            try {
              const text = await file.text()
              parseDesignMarkdown(text)
              setDesignDraft(text)
              setDesignError('')
            } catch (err) {
              setDesignError(readableError(err))
            }
          e.target.value = ''
        }}
      />
      {showProjects && (
        <Modal title="Your projects" onClose={() => setShowProjects(false)}>
          <p className="modal-description">
            Saved on this browser. Export a backup to take your work elsewhere.
          </p>
          <div className="project-list">
            {projects.map((p) => (
              <div className="project-list-row" key={p.id}>
                <button
                  onClick={() => {
                    s.load(p)
                    setShowProjects(false)
                  }}
                >
                  <span className="project-icon">
                    <LayoutTemplate size={20} />
                  </span>
                  <span>
                    <strong>{p.name}</strong>
                    <small>{new Date(p.updatedAt).toLocaleDateString()} · shadcn / Radix</small>
                  </span>
                  {p.id === doc.id && <span className="badge-small">Current</span>}
                </button>
                <IconButton
                  label={`Delete ${p.name}`}
                  onClick={() => {
                    if (confirm(`Delete “${p.name}” from this browser?`))
                      removeProject(p.id)
                        .then(async () => {
                          const list = await listProjects()
                          setProjects(list)
                          if (p.id === doc.id) s.load(list[0] || createProject())
                        })
                        .catch(() => notice('Could not delete project.'))
                  }}
                >
                  <Trash2 size={15} />
                </IconButton>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button className="button secondary" onClick={() => projectInput.current?.click()}>
              <Upload size={15} />
              Import project
            </button>
            <button
              className="button primary"
              onClick={() => {
                setShowProjects(false)
                setShowNew(true)
              }}
            >
              <Plus size={15} />
              New project
            </button>
          </div>
          <FieldRow label="Rename current project">
            <TextSetting
              value={doc.name}
              onCommit={(v) => {
                if (v.trim())
                  s.edit((p) => {
                    p.name = v.trim().slice(0, 100)
                  })
              }}
            />
          </FieldRow>
        </Modal>
      )}
      {showNew && (
        <Modal title="Create a project" onClose={() => setShowNew(false)}>
          <FieldRow label="Project name">
            <input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              maxLength={100}
            />
          </FieldRow>
          <FieldRow label="Design system">
            <select disabled>
              <option>shadcn / Radix</option>
            </select>
          </FieldRow>
          <p className="field-help">Astryx is planned as a separate design system.</p>
          <div className="starter-options">
            <button className={newExample ? 'chosen' : ''} onClick={() => setNewExample(true)}>
              <LayoutTemplate size={24} />
              <strong>Settings starter</strong>
              <span>A working screen to make your own</span>
            </button>
            <button className={!newExample ? 'chosen' : ''} onClick={() => setNewExample(false)}>
              <Plus size={24} />
              <strong>Blank screen</strong>
              <span>Start with an empty canvas</span>
            </button>
          </div>
          <div className="modal-actions">
            <button
              className="button primary"
              disabled={!newName.trim()}
              onClick={async () => {
                try {
                  await saveProject(doc)
                  s.load(createProject(newName.trim(), newExample))
                  setShowNew(false)
                } catch {
                  notice('Save your current work as a file before creating a project.')
                }
              }}
            >
              Create project
              <ChevronRight size={15} />
            </button>
          </div>
        </Modal>
      )}
      {designOpen && (
        <Modal title="Design.md" onClose={() => setDesignOpen(false)} wide>
          <p className="modal-description">
            Structured tokens power the canvas. The Markdown below the token block is preserved as
            your design guidance.
          </p>
          <textarea
            className="code-editor"
            aria-label="Design.md editor"
            value={designDraft}
            onChange={(e) => setDesignDraft(e.target.value)}
            spellCheck={false}
          />
          {designError && (
            <div className="error-message" role="alert">
              {designError}
            </div>
          )}
          <div className="modal-actions">
            <button className="button secondary" onClick={() => designInput.current?.click()}>
              <Upload size={15} />
              Import .md
            </button>
            <button
              className="button secondary"
              onClick={() => downloadFile('Design.md', designDraft, 'text/markdown')}
            >
              <Download size={15} />
              Download
            </button>
            <button
              className="button primary"
              onClick={() => {
                try {
                  const design = parseDesignMarkdown(designDraft)
                  s.edit((p) => {
                    p.design = design
                  })
                  setDesignOpen(false)
                  notice('Design tokens applied to every component.')
                } catch (e) {
                  setDesignError(readableError(e))
                }
              }}
            >
              Apply design
            </button>
          </div>
        </Modal>
      )}
      {inspecting && (
        <Modal title={inspecting.label} onClose={() => setInspecting(null)}>
          <div
            className={`component-detail-preview render-surface ${doc.design.mode === 'dark' ? 'dark' : ''}`}
            style={theme}
          >
            <ProjectPortal.Provider value={portal ?? undefined}>
              <NodeView key={inspecting.id} node={makeNode(inspecting.id)} width={480} preview />
            </ProjectPortal.Provider>
          </div>
          <p className="modal-description">{inspecting.description}</p>
          <dl className="source-details">
            <dt>Source</dt>
            <dd>{inspecting.source}</dd>
            <dt>License</dt>
            <dd>{inspecting.license}</dd>
            <dt>Compatibility</dt>
            <dd>Curated for this project</dd>
            <dt>Revision</dt>
            <dd>
              <code>{inspecting.revision.slice(0, 12)}</code>
            </dd>
          </dl>
          <div className="modal-actions">
            {inspecting.url && (
              <a
                className="button secondary"
                href={inspecting.url}
                target="_blank"
                rel="noreferrer"
              >
                Source docs
                <ExternalLink size={14} />
              </a>
            )}
            <button
              className="button primary"
              onClick={() => {
                s.add(inspecting.id)
                setInspecting(null)
              }}
            >
              <Plus size={15} />
              Add to screen
            </button>
          </div>
        </Modal>
      )}
      {help && (
        <Modal title="Make the workspace yours" onClose={() => setHelp(false)}>
          <div className="help-content">
            <p>
              <strong>1. Find a component.</strong> Search the curated library, then click to add or
              drag to an insertion point.
            </p>
            <p>
              <strong>2. Set your design.</strong> Open Design to change colors, fonts, and spacing
              or bring your own Design.md.
            </p>
            <p>
              <strong>3. Compose your screen.</strong> Use Stack and Grid to arrange components. The
              Layers panel and arrow buttons are a keyboard-friendly alternative to dragging.
            </p>
            <p>
              <strong>4. Take the code.</strong> Preview interactions, then export a React project.
              Extract the ZIP, run <code>npm install</code>, then <code>npm run dev</code>.
            </p>
            <p>Everything stays on this browser. Use a project backup to move between devices.</p>
          </div>
        </Modal>
      )}
    </DndContext>
  )
}
