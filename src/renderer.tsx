import { useState, type ReactNode, type CSSProperties } from 'react'
import { useDraggable, useDroppable, useDndContext } from '@dnd-kit/core'
import { GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { NumberTicker } from '@/components/ui/number-ticker'
import { AnimatedCircularProgressBar } from '@/components/ui/animated-circular-progress-bar'
import {
  resolveLayout,
  findNode,
  getActiveScreen,
  canContain,
  normalizedLines,
  type CanvasNode,
} from './core/model'
import { useEditor } from './core/store'
import { ExtendedNode } from './components/ui/extended-node'
import { Footer } from './components/ui/footer'

export const lines = normalizedLines
export const bounded = (value: unknown, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Number(value) || 0))
export function nodeStyle(node: CanvasNode, width: number): CSSProperties {
  const l = resolveLayout(node.layout, width)
  return {
    '--row-child-flex': l.direction === 'row' ? '1' : 'initial',
    gap: `calc(var(--oc-space) * ${l.gap ?? 4})`,
    padding: l.padding !== undefined ? `calc(var(--oc-space) * ${l.padding})` : undefined,
    alignItems:
      l.align === 'start' ? 'flex-start' : l.align === 'end' ? 'flex-end' : (l.align ?? 'stretch'),
    alignSelf: l.width === 'auto' ? 'flex-start' : undefined,
    flexDirection: l.direction ?? 'column',
    gridTemplateColumns: `repeat(${l.columns ?? 1}, minmax(0,1fr))`,
  } as CSSProperties
}
export function DropSlot({
  parent,
  index,
  slot,
  empty = false,
  surface = 'canvas',
}: {
  parent: string
  index: number
  slot?: string
  empty?: boolean
  surface?: 'canvas' | 'layer'
}) {
  const { active } = useDndContext()
  const root = useEditor((s) => getActiveScreen(s.doc, s.activeScreenId).root)
  const moving = active
    ? findNode(root, String(active.data.current?.nodeId || active.id))
    : undefined
  const invalid = Boolean(moving && findNode(moving, parent))
  const { setNodeRef, isOver } = useDroppable({
    id: `${surface}:drop:${parent}:${slot ?? ''}:${index}`,
    data: { parent, index, slot },
    disabled: invalid,
  })
  const parentNode = findNode(root, parent)
  const name = parentNode?.props.title
    ? `${parentNode.name}: ${parentNode.props.title}`
    : parentNode?.name || 'container'
  return (
    <div
      ref={setNodeRef}
      data-drop-parent={parent}
      data-drop-index={index}
      className={`drop-slot ${surface === 'layer' ? 'layer-slot' : ''} ${empty ? 'empty-slot' : ''} ${isOver && !invalid ? 'over' : ''} ${active && !invalid ? 'drag-active' : ''}`}
      data-valid={!invalid}
      aria-label="Drop component here"
    >
      {isOver && !invalid ? (
        <span className="drop-label">
          {name} · position {index + 1}
          {slot ? ` · ${slot}` : ''}
        </span>
      ) : (
        empty && <span>Drop a component here</span>
      )}
    </div>
  )
}
export function NodeView({
  node,
  width,
  preview = false,
  root = false,
}: {
  node: CanvasNode
  width: number
  preview?: boolean
  root?: boolean
}) {
  const selected = useEditor((s) => s.selected),
    select = useEditor((s) => s.select)
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: node.id,
    data: { nodeId: node.id },
    disabled: preview || root,
  })
  const renderChildren = (slot?: string): ReactNode => {
    const children = node.children.filter((n) => node.type !== 'tabs' || n.slot === slot)
    return (
      <>
        {!preview && (
          <DropSlot
            parent={node.id}
            index={children.length ? node.children.indexOf(children[0]) : node.children.length}
            slot={slot}
            empty={!children.length}
          />
        )}{' '}
        {children.map((child) => (
          <div className="child-flow" key={child.id}>
            <NodeView node={child} width={width} preview={preview} />
            {!preview && (
              <DropSlot parent={node.id} index={node.children.indexOf(child) + 1} slot={slot} />
            )}
          </div>
        ))}
      </>
    )
  }
  return (
    <div
      ref={setNodeRef}
      data-node-id={node.id}
      className={`canvas-node ${node.type === 'stack' || node.type === 'grid' ? 'layout-node' : ''} ${selected === node.id && !preview ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${root ? 'page-node' : ''}`}
      onClick={(e) => {
        if (!preview) {
          e.stopPropagation()
          select(node.id)
        }
      }}
    >
      {!preview && selected === node.id && !root && (
        <div className="node-tag">
          <button {...attributes} {...listeners} aria-label={`Drag ${node.name}`}>
            <GripVertical size={16} />
          </button>
          {node.name}
        </div>
      )}
      <div
        className="node-content"
        inert={!preview && !canContain(node) ? true : undefined}
        onClickCapture={(e) => {
          if (!preview) e.preventDefault()
        }}
      >
        <NodeContent node={node} width={width} preview={preview} renderChildren={renderChildren} />
      </div>
    </div>
  )
}
function Field({ id, label, children }: { id: string; label: unknown; children: ReactNode }) {
  return (
    <div className="oc-field">
      <Label htmlFor={id}>{String(label ?? '')}</Label>
      {children}
    </div>
  )
}
function ToggleField({ node, kind }: { node: CanvasNode; kind: 'checkbox' | 'switch' }) {
  const [checked, setChecked] = useState(Boolean(node.props.checked))
  const Control = kind === 'checkbox' ? Checkbox : Switch
  return (
    <div className={`oc-toggle ${kind}`}>
      <Control
        id={node.id}
        checked={checked}
        onCheckedChange={(v) => setChecked(Boolean(v))}
        disabled={Boolean(node.props.disabled)}
      />
      <Label htmlFor={node.id}>{String(node.props.label)}</Label>
    </div>
  )
}
function NodeContent({
  node,
  width,
  preview,
  renderChildren,
}: {
  node: CanvasNode
  width: number
  preview: boolean
  renderChildren: (slot?: string) => ReactNode
}) {
  const selected = useEditor((s) => s.selected)
  const updateNode = useEditor((s) => s.updateNode)
  const showDialogContent = Boolean(selected && findNode(node, selected))
  const p = node.props,
    style = nodeStyle(node, width),
    disabled = Boolean(p.disabled)
  switch (node.type) {
    case 'footer':
      return (
        <Footer
          brand={String(p.brand ?? '')}
          description={String(p.description ?? '')}
          links={String(p.links ?? '')}
          copyright={String(p.copyright ?? '')}
        />
      )
    case 'stack':
      return (
        <div className="oc-stack" style={style}>
          {renderChildren()}
        </div>
      )
    case 'grid':
      return (
        <div className="oc-grid" style={style}>
          {renderChildren()}
        </div>
      )
    case 'heading':
      return (
        <h2 className="oc-heading" style={style}>
          {String(p.text)}
        </h2>
      )
    case 'text':
      return (
        <p className={`oc-text ${p.tone === 'muted' ? 'text-muted-foreground' : ''}`} style={style}>
          {String(p.text)}
        </p>
      )
    case 'button':
      return (
        <Button
          style={style}
          variant={
            ['default', 'secondary', 'outline', 'ghost', 'link', 'destructive'].includes(
              String(p.variant),
            )
              ? (p.variant as 'default')
              : 'default'
          }
          size={
            ['default', 'sm', 'lg'].includes(String(p.size)) ? (p.size as 'default') : 'default'
          }
          disabled={disabled}
        >
          {String(p.text)}
        </Button>
      )
    case 'input':
      return (
        <Field id={node.id} label={p.label}>
          <Input
            key={String(p.value) + preview}
            id={node.id}
            placeholder={String(p.placeholder)}
            defaultValue={String(p.value)}
            disabled={disabled}
            readOnly={!preview}
          />
        </Field>
      )
    case 'textarea':
      return (
        <Field id={node.id} label={p.label}>
          <Textarea
            key={String(p.value) + preview}
            id={node.id}
            placeholder={String(p.placeholder)}
            defaultValue={String(p.value)}
            disabled={disabled}
            readOnly={!preview}
          />
        </Field>
      )
    case 'label':
      return <Label>{String(p.text)}</Label>
    case 'checkbox':
    case 'switch':
      return <ToggleField key={String(p.checked) + preview} node={node} kind={node.type} />
    case 'select':
      return (
        <Field id={node.id} label={p.label}>
          <Select
            key={String(p.value) + String(p.options) + preview}
            defaultValue={String(p.value)}
            disabled={disabled}
          >
            <SelectTrigger id={node.id} className="w-full">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {lines(p.options).map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )
    case 'card':
      return (
        <Card>
          <CardHeader>
            <CardTitle>{String(p.title)}</CardTitle>
            <CardDescription>{String(p.description)}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="oc-stack" style={style}>
              {renderChildren()}
            </div>
          </CardContent>
        </Card>
      )
    case 'tabs':
      return (
        <Tabs
          key={String(p.labels) + (preview ? String(p.active) : 'edit') + preview}
          value={preview ? undefined : String(p.active)}
          onValueChange={
            preview
              ? undefined
              : (value) =>
                  updateNode(node.id, (n) => {
                    n.props.active = value
                  })
          }
          defaultValue={
            lines(p.labels).includes(String(p.active)) ? String(p.active) : lines(p.labels)[0]
          }
        >
          <TabsList>
            {lines(p.labels).map((v) => (
              <TabsTrigger key={v} value={v}>
                {v}
              </TabsTrigger>
            ))}
          </TabsList>
          {lines(p.labels).map((v) => (
            <TabsContent value={v} key={v}>
              <div className="oc-stack" style={style}>
                {renderChildren(v)}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )
    case 'dialog':
      return preview ? (
        <Dialog>
          <DialogTrigger asChild>
            <Button>{String(p.trigger)}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{String(p.title)}</DialogTitle>
              <DialogDescription>{String(p.description)}</DialogDescription>
            </DialogHeader>
            <div className="oc-stack" style={style}>
              {renderChildren()}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <div className="oc-dialog-edit">
          <Button>{String(p.trigger)}</Button>
          {showDialogContent && (
            <div className="oc-dialog-outline">
              <div className="oc-dialog-label">DIALOG CONTENT · PREVIEW TO OPEN</div>
              <strong>{String(p.title)}</strong>
              <p className="text-muted-foreground">{String(p.description)}</p>
              <div className="oc-stack" style={style}>
                {renderChildren()}
              </div>
            </div>
          )}
        </div>
      )
    case 'badge':
      return (
        <Badge
          variant={
            ['default', 'secondary', 'outline', 'destructive'].includes(String(p.variant))
              ? (p.variant as 'default')
              : 'secondary'
          }
        >
          {String(p.text)}
        </Badge>
      )
    case 'separator':
      return <Separator />
    case 'table':
      return (
        <Table>
          <TableHeader>
            <TableRow>
              {String(p.headers)
                .split(',')
                .map((v, i) => (
                  <TableHead key={i}>{v.trim()}</TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {String(p.rows)
              .split('\n')
              .filter(Boolean)
              .map((row, i) => (
                <TableRow key={i}>
                  {row.split(',').map((cell, j) => (
                    <TableCell key={j}>{cell.trim()}</TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      )
    case 'progress':
      return (
        <div className="oc-field">
          <div className="oc-metric-label">
            {String(p.label)}
            <span>{bounded(p.value)}%</span>
          </div>
          <Progress value={bounded(p.value)} aria-label={String(p.label)} />
        </div>
      )
    case 'number-ticker':
      return (
        <div className="oc-metric">
          <span className="text-muted-foreground">{String(p.label)}</span>
          <NumberTicker
            key={String(p.value)}
            value={bounded(p.value, 0, 100000000)}
            className="text-3xl font-semibold"
          />
        </div>
      )
    case 'animated-circular-progress-bar':
      return (
        <div className="oc-metric">
          <span className="text-muted-foreground">{String(p.label)}</span>
          <AnimatedCircularProgressBar
            value={bounded(p.value)}
            gaugePrimaryColor="var(--primary)"
            gaugeSecondaryColor="var(--muted)"
          />
        </div>
      )
    default:
      return (
        <ExtendedNode
          key={JSON.stringify(node.props)}
          type={node.type}
          props={node.props}
          id={node.id}
        />
      )
  }
}
