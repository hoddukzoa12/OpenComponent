// Editable compositions of the bundled primitives and OpenComponent blocks.
// Shared by the canvas, Preview and standalone export; no editor state dependency.
import { Fragment, useId, useMemo, useState, type CSSProperties } from 'react'
import { Check, FileText, Info, Search, CalendarIcon, ArrowUpDown } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { Bar, BarChart, Line, LineChart, Area, AreaChart, CartesianGrid, XAxis } from 'recharts'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Footer } from './footer'
import * as Accordion from './accordion'
import * as Alert from './alert'
import * as AlertDialog from './alert-dialog'
import { AspectRatio } from './aspect-ratio'
import * as Attachment from './attachment'
import * as Avatar from './avatar'
import * as Breadcrumb from './breadcrumb'
import * as Bubble from './bubble'
import { ButtonGroup } from './button-group'
import { Calendar } from './calendar'
import * as Carousel from './carousel'
import * as Chart from './chart'
import * as Collapsible from './collapsible'
import * as Combobox from './combobox'
import * as Command from './command'
import * as ContextMenu from './context-menu'
import { DirectionProvider } from './direction'
import * as Drawer from './drawer'
import * as DropdownMenu from './dropdown-menu'
import * as Empty from './empty'
import * as Field from './field'
import * as Form from './form'
import * as HoverCard from './hover-card'
import * as InputGroup from './input-group'
import * as InputOTP from './input-otp'
import * as Item from './item'
import { Kbd, KbdGroup } from './kbd'
import * as Marker from './marker'
import * as Menubar from './menubar'
import * as Message from './message'
import * as MessageScroller from './message-scroller'
import * as NativeSelect from './native-select'
import * as NavigationMenu from './navigation-menu'
import * as Pagination from './pagination'
import * as Popover from './popover'
import * as Questionnaire from './questionnaire'
import * as RadioGroup from './radio-group'
import * as Resizable from './resizable'
import { ScrollArea } from './scroll-area'
import * as Sheet from './sheet'
import * as Sidebar from './sidebar'
import { Skeleton } from './skeleton'
import { Slider } from './slider'
import { Toaster } from './sonner'
import { Spinner } from './spinner'
import * as Table from './table'
import { Toggle } from './toggle'
import { ToggleGroup, ToggleGroupItem } from './toggle-group'
import * as Tooltip from './tooltip'

type Props = Record<string, string | number | boolean>
const str = (v: unknown) => String(v ?? '')
const lines = (v: unknown) => [
  ...new Set(
    str(v)
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean),
  ),
]
const num = (v: unknown, min: number, max: number, fallback = min) =>
  Math.max(min, Math.min(max, Number(v) || fallback))
function dateValue(v: unknown) {
  const text = str(v)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return undefined
  const [y, m, d] = text.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d
    ? date
    : undefined
}
function safeImage(v: unknown) {
  const s = str(v)
  return /^https:\/\//i.test(s) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(s)
    ? s
    : undefined
}
const variant = (v: unknown, allowed: string[], fallback: string) =>
  allowed.includes(str(v)) ? str(v) : fallback
export function ExtendedNode({ type, props, id }: { type: string; props: Props; id?: string }) {
  return <Recipe key={type + JSON.stringify(props)} type={type} p={props} id={id} />
}
function Recipe({ type, p, id: providedId }: { type: string; p: Props; id?: string }) {
  const generatedId = useId(),
    id = providedId ?? generatedId
  const [value, setValue] = useState(str(p.value))
  const [selectedDate, setDate] = useState<Date | undefined>(() => dateValue(p.date))
  const [open, setOpen] = useState(Boolean(p.open))
  const [page, setPage] = useState(Math.floor(num(p.page, 1, Math.floor(num(p.pages, 1, 20)))))
  const [active, setActive] = useState('')
  const [complete, setComplete] = useState(false)
  const opts = lines(p.options),
    items = lines(p.items)
  const side = variant(p.side, ['top', 'bottom', 'left', 'right'], 'right') as
    'top' | 'bottom' | 'left' | 'right'
  const label = (content: React.ReactNode) => (
    <div className="oc-field">
      <Label htmlFor={id}>{str(p.label)}</Label>
      {content}
    </div>
  )
  switch (type) {
    case 'footer':
      return (
        <Footer
          brand={str(p.brand)}
          description={str(p.description)}
          links={str(p.links)}
          copyright={str(p.copyright)}
        />
      )
    case 'accordion': {
      const entries = items.map((x) => {
        const i = x.indexOf('|')
        return { title: i < 0 ? x : x.slice(0, i).trim(), body: i < 0 ? '' : x.slice(i + 1).trim() }
      })
      const contents = entries.map((e, i) => (
        <Accordion.AccordionItem key={i} value={String(i)}>
          <Accordion.AccordionTrigger>{e.title}</Accordion.AccordionTrigger>
          <Accordion.AccordionContent>{e.body}</Accordion.AccordionContent>
        </Accordion.AccordionItem>
      ))
      return p.multiple ? (
        <Accordion.Accordion type="multiple">{contents}</Accordion.Accordion>
      ) : (
        <Accordion.Accordion type="single" collapsible>
          {contents}
        </Accordion.Accordion>
      )
    }
    case 'alert':
      return (
        <Alert.Alert variant={p.variant === 'destructive' ? 'destructive' : 'default'}>
          <Info />
          <Alert.AlertTitle>{str(p.title)}</Alert.AlertTitle>
          <Alert.AlertDescription>{str(p.description)}</Alert.AlertDescription>
        </Alert.Alert>
      )
    case 'alert-dialog':
      return (
        <AlertDialog.AlertDialog>
          <AlertDialog.AlertDialogTrigger asChild>
            <Button>{str(p.trigger)}</Button>
          </AlertDialog.AlertDialogTrigger>
          <AlertDialog.AlertDialogContent>
            <AlertDialog.AlertDialogHeader>
              <AlertDialog.AlertDialogTitle>{str(p.title)}</AlertDialog.AlertDialogTitle>
              <AlertDialog.AlertDialogDescription>
                {str(p.description)}
              </AlertDialog.AlertDialogDescription>
            </AlertDialog.AlertDialogHeader>
            <AlertDialog.AlertDialogFooter>
              <AlertDialog.AlertDialogCancel>{str(p.cancel)}</AlertDialog.AlertDialogCancel>
              <AlertDialog.AlertDialogAction>{str(p.confirm)}</AlertDialog.AlertDialogAction>
            </AlertDialog.AlertDialogFooter>
          </AlertDialog.AlertDialogContent>
        </AlertDialog.AlertDialog>
      )
    case 'aspect-ratio':
      return (
        <AspectRatio
          ratio={num(p.ratio, 0.2, 5, 16 / 9)}
          className="overflow-hidden rounded-md bg-muted"
        >
          {safeImage(p.image) ? (
            <img src={safeImage(p.image)} alt={str(p.text)} className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              {str(p.text)}
            </div>
          )}
        </AspectRatio>
      )
    case 'attachment':
      return (
        <Attachment.Attachment
          state={
            variant(p.state, ['idle', 'uploading', 'processing', 'done', 'error'], 'done') as 'done'
          }
        >
          <Attachment.AttachmentMedia>
            <FileText />
          </Attachment.AttachmentMedia>
          <Attachment.AttachmentContent>
            <Attachment.AttachmentTitle>{str(p.title)}</Attachment.AttachmentTitle>
            <Attachment.AttachmentDescription>
              {str(p.description)}
            </Attachment.AttachmentDescription>
          </Attachment.AttachmentContent>
        </Attachment.Attachment>
      )
    case 'avatar':
      return (
        <Avatar.Avatar aria-label={str(p.label)} className="size-12">
          <Avatar.AvatarImage src={safeImage(p.image)} alt={str(p.label)} />
          <Avatar.AvatarFallback>{str(p.fallback).slice(0, 4)}</Avatar.AvatarFallback>
        </Avatar.Avatar>
      )
    case 'breadcrumb':
      return (
        <Breadcrumb.Breadcrumb>
          <Breadcrumb.BreadcrumbList>
            {items.map((item, i) => (
              <Fragment key={item}>
                {i > 0 && <Breadcrumb.BreadcrumbSeparator />}
                <Breadcrumb.BreadcrumbItem>
                  {i === items.length - 1 ? (
                    <Breadcrumb.BreadcrumbPage>{item}</Breadcrumb.BreadcrumbPage>
                  ) : (
                    <Breadcrumb.BreadcrumbLink asChild>
                      <button
                        type="button"
                        onClick={() => setActive(item)}
                        aria-current={active === item ? 'page' : undefined}
                      >
                        {item}
                      </button>
                    </Breadcrumb.BreadcrumbLink>
                  )}
                </Breadcrumb.BreadcrumbItem>
              </Fragment>
            ))}
          </Breadcrumb.BreadcrumbList>
        </Breadcrumb.Breadcrumb>
      )
    case 'bubble':
      return (
        <Bubble.Bubble
          variant={
            variant(
              p.variant,
              ['default', 'secondary', 'muted', 'outline', 'ghost', 'destructive'],
              'secondary',
            ) as 'secondary'
          }
          align={p.align === 'end' ? 'end' : 'start'}
        >
          <Bubble.BubbleContent>{str(p.text)}</Bubble.BubbleContent>
        </Bubble.Bubble>
      )
    case 'button-group':
      return (
        <ButtonGroup>
          {items.map((x) => (
            <Button
              key={x}
              variant={
                variant(
                  p.variant,
                  ['outline', 'default', 'secondary', 'ghost'],
                  'outline',
                ) as 'outline'
              }
              onClick={() => setActive(x)}
              aria-pressed={active === x}
            >
              {x}
            </Button>
          ))}
        </ButtonGroup>
      )
    case 'calendar':
      return (
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setDate}
          defaultMonth={selectedDate}
          disabled={Boolean(p.disabled)}
          className="rounded-md border"
        />
      )
    case 'carousel':
      return (
        <div className="px-12">
          <Carousel.Carousel className="w-full">
            <Carousel.CarouselContent>
              {items.map((x, i) => (
                <Carousel.CarouselItem key={i}>
                  <div className="flex aspect-video items-center justify-center rounded-md border bg-muted p-6 text-xl font-semibold">
                    {x}
                  </div>
                </Carousel.CarouselItem>
              ))}
            </Carousel.CarouselContent>
            <Carousel.CarouselPrevious />
            <Carousel.CarouselNext />
          </Carousel.Carousel>
        </div>
      )
    case 'chart':
      return <ChartRecipe p={p} />
    case 'collapsible':
      return (
        <Collapsible.Collapsible open={open} onOpenChange={setOpen}>
          <Collapsible.CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {str(p.title)}
              <span aria-hidden>{open ? '−' : '+'}</span>
            </Button>
          </Collapsible.CollapsibleTrigger>
          <Collapsible.CollapsibleContent className="rounded-md border p-4 mt-2">
            {str(p.text)}
          </Collapsible.CollapsibleContent>
        </Collapsible.Collapsible>
      )
    case 'combobox':
      return label(
        <Combobox.Combobox
          items={opts}
          value={value || null}
          onValueChange={(v) => setValue(v ?? '')}
          disabled={Boolean(p.disabled)}
        >
          <Combobox.ComboboxInput
            id={id}
            placeholder={str(p.placeholder)}
            disabled={Boolean(p.disabled)}
          />
          <Combobox.ComboboxContent>
            <Combobox.ComboboxEmpty>No options found.</Combobox.ComboboxEmpty>
            <Combobox.ComboboxList>
              {(item: string) => (
                <Combobox.ComboboxItem key={item} value={item}>
                  {item}
                </Combobox.ComboboxItem>
              )}
            </Combobox.ComboboxList>
          </Combobox.ComboboxContent>
        </Combobox.Combobox>,
      )
    case 'command':
      return (
        <Command.Command className="rounded-md border" defaultValue="__oc-command-idle__" loop>
          {/* A nonmatching initial value avoids cmdk selecting and scrolling an
              offscreen item on mount. Search and arrow keys select normally. */}
          <Command.CommandInput placeholder={str(p.placeholder)} />
          <Command.CommandList>
            <Command.CommandEmpty>No results found.</Command.CommandEmpty>
            <Command.CommandGroup heading="Actions">
              {items.map((x, index) => (
                <Command.CommandItem
                  key={x}
                  value={`command-item-${index}`}
                  keywords={[x]}
                  onSelect={() => setActive(x)}
                >
                  <Search />
                  {x}
                  {active === x && <Check className="ml-auto" />}
                </Command.CommandItem>
              ))}
            </Command.CommandGroup>
          </Command.CommandList>
        </Command.Command>
      )
    case 'context-menu':
      return (
        <ContextMenu.ContextMenu>
          <ContextMenu.ContextMenuTrigger className="flex h-32 items-center justify-center rounded-md border border-dashed">
            {str(p.trigger)}
          </ContextMenu.ContextMenuTrigger>
          <ContextMenu.ContextMenuContent>
            <ContextMenu.ContextMenuRadioGroup value={active} onValueChange={setActive}>
              {items.map((x) => (
                <ContextMenu.ContextMenuRadioItem key={x} value={x}>
                  {x}
                </ContextMenu.ContextMenuRadioItem>
              ))}
            </ContextMenu.ContextMenuRadioGroup>
          </ContextMenu.ContextMenuContent>
        </ContextMenu.ContextMenu>
      )
    case 'data-table':
      return <DataTableRecipe p={p} />
    case 'date-picker':
      return label(
        <Popover.Popover open={open} onOpenChange={setOpen}>
          <Popover.PopoverTrigger asChild>
            <Button
              id={id}
              variant="outline"
              className="justify-start"
              disabled={Boolean(p.disabled)}
            >
              <CalendarIcon />
              {selectedDate ? selectedDate.toLocaleDateString() : str(p.placeholder)}
            </Button>
          </Popover.PopoverTrigger>
          <Popover.PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setDate(date)
                setOpen(false)
              }}
              defaultMonth={selectedDate}
            />
          </Popover.PopoverContent>
        </Popover.Popover>,
      )
    case 'direction': {
      const dir = p.direction === 'rtl' ? 'rtl' : 'ltr'
      return (
        <DirectionProvider dir={dir}>
          <div dir={dir} className="rounded-md border p-4">
            {str(p.text)}
          </div>
        </DirectionProvider>
      )
    }
    case 'drawer':
      return (
        <Drawer.Drawer>
          <Drawer.DrawerTrigger asChild>
            <Button variant="outline">{str(p.trigger)}</Button>
          </Drawer.DrawerTrigger>
          <Drawer.DrawerContent>
            <div className="mx-auto w-full max-w-lg">
              <Drawer.DrawerHeader>
                <Drawer.DrawerTitle>{str(p.title)}</Drawer.DrawerTitle>
                <Drawer.DrawerDescription>{str(p.description)}</Drawer.DrawerDescription>
              </Drawer.DrawerHeader>
              <div className="p-4">{str(p.text)}</div>
              <Drawer.DrawerFooter>
                <Drawer.DrawerClose asChild>
                  <Button>{str(p.action)}</Button>
                </Drawer.DrawerClose>
              </Drawer.DrawerFooter>
            </div>
          </Drawer.DrawerContent>
        </Drawer.Drawer>
      )
    case 'dropdown-menu':
      return (
        <DropdownMenu.DropdownMenu>
          <DropdownMenu.DropdownMenuTrigger asChild>
            <Button variant="outline">{str(p.trigger)}</Button>
          </DropdownMenu.DropdownMenuTrigger>
          <DropdownMenu.DropdownMenuContent>
            <DropdownMenu.DropdownMenuRadioGroup value={active} onValueChange={setActive}>
              {items.map((x) => (
                <DropdownMenu.DropdownMenuRadioItem key={x} value={x}>
                  {x}
                </DropdownMenu.DropdownMenuRadioItem>
              ))}
            </DropdownMenu.DropdownMenuRadioGroup>
          </DropdownMenu.DropdownMenuContent>
        </DropdownMenu.DropdownMenu>
      )
    case 'empty':
      return (
        <Empty.Empty className="border border-dashed">
          <Empty.EmptyHeader>
            <Empty.EmptyMedia variant="icon">
              <FileText />
            </Empty.EmptyMedia>
            <Empty.EmptyTitle>{str(p.title)}</Empty.EmptyTitle>
            <Empty.EmptyDescription>{str(p.description)}</Empty.EmptyDescription>
          </Empty.EmptyHeader>
          <Empty.EmptyContent>
            <Button onClick={() => setComplete(true)}>{str(p.action)}</Button>
            {complete && <p role="status">Action selected.</p>}
          </Empty.EmptyContent>
        </Empty.Empty>
      )
    case 'field':
      return (
        <Field.Field data-invalid={Boolean(p.error)}>
          <Field.FieldLabel htmlFor={id}>{str(p.label)}</Field.FieldLabel>
          <Input
            id={id}
            defaultValue={str(p.value)}
            placeholder={str(p.placeholder)}
            disabled={Boolean(p.disabled)}
            aria-invalid={Boolean(p.error)}
            aria-describedby={id + '-description'}
          />
          <Field.FieldDescription id={id + '-description'}>
            {str(p.description)}
          </Field.FieldDescription>
          {Boolean(p.error) && <Field.FieldError>{str(p.error)}</Field.FieldError>}
        </Field.Field>
      )
    case 'form':
      return <FormRecipe p={p} />
    case 'hover-card':
      return (
        <HoverCard.HoverCard>
          <HoverCard.HoverCardTrigger asChild>
            <Button variant="link">{str(p.trigger)}</Button>
          </HoverCard.HoverCardTrigger>
          <HoverCard.HoverCardContent>
            <strong>{str(p.title)}</strong>
            <p className="mt-2 text-sm text-muted-foreground">{str(p.description)}</p>
          </HoverCard.HoverCardContent>
        </HoverCard.HoverCard>
      )
    case 'input-group':
      return label(
        <InputGroup.InputGroup>
          <InputGroup.InputGroupAddon>
            <InputGroup.InputGroupText>{str(p.prefix)}</InputGroup.InputGroupText>
          </InputGroup.InputGroupAddon>
          <InputGroup.InputGroupInput
            id={id}
            placeholder={str(p.placeholder)}
            disabled={Boolean(p.disabled)}
          />
          <InputGroup.InputGroupAddon align="inline-end">
            <InputGroup.InputGroupText>{str(p.suffix)}</InputGroup.InputGroupText>
          </InputGroup.InputGroupAddon>
        </InputGroup.InputGroup>,
      )
    case 'input-otp': {
      const length = Math.round(num(p.length, 4, 8, 6))
      return label(
        <InputOTP.InputOTP
          id={id}
          maxLength={length}
          value={value}
          onChange={setValue}
          disabled={Boolean(p.disabled)}
        >
          <InputOTP.InputOTPGroup>
            {Array.from({ length }, (_, i) => (
              <InputOTP.InputOTPSlot key={i} index={i} />
            ))}
          </InputOTP.InputOTPGroup>
        </InputOTP.InputOTP>,
      )
    }
    case 'item':
      return (
        <Item.Item
          variant={variant(p.variant, ['default', 'outline', 'muted'], 'outline') as 'outline'}
        >
          <Item.ItemMedia variant="icon">
            <FileText />
          </Item.ItemMedia>
          <Item.ItemContent>
            <Item.ItemTitle>{str(p.title)}</Item.ItemTitle>
            <Item.ItemDescription>{str(p.description)}</Item.ItemDescription>
          </Item.ItemContent>
          <Item.ItemActions>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setComplete(!complete)}
              aria-pressed={complete}
            >
              {str(p.action)}
            </Button>
          </Item.ItemActions>
        </Item.Item>
      )
    case 'kbd':
      return (
        <KbdGroup>
          {lines(p.keys).map((x) => (
            <Kbd key={x}>{x}</Kbd>
          ))}
        </KbdGroup>
      )
    case 'marker':
      return (
        <Marker.Marker
          variant={
            variant(p.variant, ['default', 'separator', 'border'], 'separator') as 'separator'
          }
        >
          <Marker.MarkerContent>{str(p.text)}</Marker.MarkerContent>
        </Marker.Marker>
      )
    case 'menubar':
      return (
        <Menubar.Menubar>
          {lines(p.menus).map((menu) => (
            <Menubar.MenubarMenu key={menu}>
              <Menubar.MenubarTrigger>{menu}</Menubar.MenubarTrigger>
              <Menubar.MenubarContent>
                <Menubar.MenubarRadioGroup value={active} onValueChange={setActive}>
                  {items.map((x) => (
                    <Menubar.MenubarRadioItem key={x} value={menu + x}>
                      {x}
                    </Menubar.MenubarRadioItem>
                  ))}
                </Menubar.MenubarRadioGroup>
              </Menubar.MenubarContent>
            </Menubar.MenubarMenu>
          ))}
        </Menubar.Menubar>
      )
    case 'message':
      return (
        <Message.Message align={p.align === 'end' ? 'end' : 'start'}>
          <Message.MessageContent>
            <Message.MessageHeader>{str(p.author)}</Message.MessageHeader>
            <Bubble.Bubble variant="secondary">
              <Bubble.BubbleContent>{str(p.text)}</Bubble.BubbleContent>
            </Bubble.Bubble>
            <Message.MessageFooter>{str(p.time)}</Message.MessageFooter>
          </Message.MessageContent>
        </Message.Message>
      )
    case 'message-scroller':
      return (
        <div style={{ height: num(p.height, 80, 800, 240) }} className="rounded-md border">
          <MessageScroller.MessageScrollerProvider>
            <MessageScroller.MessageScroller>
              <MessageScroller.MessageScrollerViewport>
                <MessageScroller.MessageScrollerContent className="p-4">
                  {str(p.messages)
                    .split('\n')
                    .filter((x) => x.trim())
                    .map((x, i) => (
                      <MessageScroller.MessageScrollerItem key={i}>
                        <Bubble.Bubble
                          variant={i % 2 ? 'secondary' : 'muted'}
                          align={i % 2 ? 'end' : 'start'}
                        >
                          <Bubble.BubbleContent>{x}</Bubble.BubbleContent>
                        </Bubble.Bubble>
                      </MessageScroller.MessageScrollerItem>
                    ))}
                </MessageScroller.MessageScrollerContent>
              </MessageScroller.MessageScrollerViewport>
              <MessageScroller.MessageScrollerButton />
            </MessageScroller.MessageScroller>
          </MessageScroller.MessageScrollerProvider>
        </div>
      )
    case 'native-select':
      return label(
        <NativeSelect.NativeSelect
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={Boolean(p.disabled)}
          className="w-full"
        >
          {opts.map((x) => (
            <NativeSelect.NativeSelectOption key={x} value={x}>
              {x}
            </NativeSelect.NativeSelectOption>
          ))}
        </NativeSelect.NativeSelect>,
      )
    case 'navigation-menu':
      return (
        <NavigationMenu.NavigationMenu>
          <NavigationMenu.NavigationMenuList className="flex-wrap">
            {items.map((x) => (
              <NavigationMenu.NavigationMenuItem key={x}>
                <NavigationMenu.NavigationMenuTrigger>{x}</NavigationMenu.NavigationMenuTrigger>
                <NavigationMenu.NavigationMenuContent>
                  <div className="w-60 p-4">
                    <strong>{x}</strong>
                    <p className="mt-2 text-sm text-muted-foreground">{str(p.description)}</p>
                  </div>
                </NavigationMenu.NavigationMenuContent>
              </NavigationMenu.NavigationMenuItem>
            ))}
          </NavigationMenu.NavigationMenuList>
        </NavigationMenu.NavigationMenu>
      )
    case 'pagination': {
      const total = Math.floor(num(p.pages, 1, 20))
      return (
        <Pagination.Pagination>
          <Pagination.PaginationContent>
            <Pagination.PaginationItem>
              <Pagination.PaginationPrevious
                href="#"
                aria-disabled={page === 1}
                onClick={(e) => {
                  e.preventDefault()
                  setPage(Math.max(1, page - 1))
                }}
              />
            </Pagination.PaginationItem>
            {Array.from({ length: total }, (_, i) => (
              <Pagination.PaginationItem key={i}>
                <Pagination.PaginationLink
                  href="#"
                  isActive={page === i + 1}
                  onClick={(e) => {
                    e.preventDefault()
                    setPage(i + 1)
                  }}
                >
                  {i + 1}
                </Pagination.PaginationLink>
              </Pagination.PaginationItem>
            ))}
            <Pagination.PaginationItem>
              <Pagination.PaginationNext
                href="#"
                aria-disabled={page === total}
                onClick={(e) => {
                  e.preventDefault()
                  setPage(Math.min(total, page + 1))
                }}
              />
            </Pagination.PaginationItem>
          </Pagination.PaginationContent>
        </Pagination.Pagination>
      )
    }
    case 'popover':
      return (
        <Popover.Popover>
          <Popover.PopoverTrigger asChild>
            <Button variant="outline">{str(p.trigger)}</Button>
          </Popover.PopoverTrigger>
          <Popover.PopoverContent>
            <strong>{str(p.title)}</strong>
            <p className="mt-2 text-sm text-muted-foreground">{str(p.description)}</p>
          </Popover.PopoverContent>
        </Popover.Popover>
      )
    case 'questionnaire': {
      const questions = [
        {
          name: 'answer',
          required: true,
          prompt: str(p.title),
          choices: opts.map((x) => ({ value: x, label: x })),
        },
      ]
      return (
        <Questionnaire.Questionnaire
          items={questions}
          onSubmit={(e) => {
            e.preventDefault()
            setComplete(true)
          }}
        >
          <Questionnaire.QuestionnaireProgress />
          <Questionnaire.QuestionnaireItem name="answer" required>
            <Questionnaire.QuestionnaireTitle>{str(p.title)}</Questionnaire.QuestionnaireTitle>
            <Questionnaire.QuestionnaireDescription>
              {str(p.description)}
            </Questionnaire.QuestionnaireDescription>
            <Questionnaire.QuestionnaireChoices>
              {opts.map((x) => (
                <Questionnaire.QuestionnaireChoice key={x} value={x}>
                  {x}
                </Questionnaire.QuestionnaireChoice>
              ))}
            </Questionnaire.QuestionnaireChoices>
            <Questionnaire.QuestionnaireError />
          </Questionnaire.QuestionnaireItem>
          <Questionnaire.QuestionnaireActions>
            <Questionnaire.QuestionnaireSubmit>{str(p.submit)}</Questionnaire.QuestionnaireSubmit>
          </Questionnaire.QuestionnaireActions>
          {complete && <p role="status">Answer saved locally.</p>}
        </Questionnaire.Questionnaire>
      )
    }
    case 'radio-group':
      return (
        <fieldset className="oc-field">
          <legend className="mb-2 text-sm font-medium">{str(p.label)}</legend>
          <RadioGroup.RadioGroup
            value={value}
            onValueChange={setValue}
            disabled={Boolean(p.disabled)}
          >
            {opts.map((x, i) => (
              <div key={x} className="flex items-center gap-2">
                <RadioGroup.RadioGroupItem value={x} id={id + '-' + i} />
                <Label htmlFor={id + '-' + i}>{x}</Label>
              </div>
            ))}
          </RadioGroup.RadioGroup>
        </fieldset>
      )
    case 'resizable':
      return (
        <Resizable.ResizablePanelGroup
          orientation={p.orientation === 'vertical' ? 'vertical' : 'horizontal'}
          className="min-h-[200px] rounded-md border"
        >
          <Resizable.ResizablePanel defaultSize={`${num(p.firstSize, 10, 90, 35)}%`} minSize="10%">
            <div className="flex h-full min-h-20 items-center justify-center p-4">
              {str(p.first)}
            </div>
          </Resizable.ResizablePanel>
          <Resizable.ResizableHandle withHandle />
          <Resizable.ResizablePanel minSize="10%">
            <div className="flex h-full min-h-20 items-center justify-center p-4">
              {str(p.second)}
            </div>
          </Resizable.ResizablePanel>
        </Resizable.ResizablePanelGroup>
      )
    case 'scroll-area':
      return (
        <ScrollArea style={{ height: num(p.height, 80, 800, 200) }} className="rounded-md border">
          <div className="p-4">
            {items.map((x) => (
              <div key={x} className="border-b py-3 last:border-0">
                {x}
              </div>
            ))}
          </div>
        </ScrollArea>
      )
    case 'sheet':
      return (
        <Sheet.Sheet>
          <Sheet.SheetTrigger asChild>
            <Button variant="outline">{str(p.trigger)}</Button>
          </Sheet.SheetTrigger>
          <Sheet.SheetContent side={side}>
            <Sheet.SheetHeader>
              <Sheet.SheetTitle>{str(p.title)}</Sheet.SheetTitle>
              <Sheet.SheetDescription>{str(p.description)}</Sheet.SheetDescription>
            </Sheet.SheetHeader>
            <div className="p-4">{str(p.text)}</div>
          </Sheet.SheetContent>
        </Sheet.Sheet>
      )
    case 'sidebar':
      return (
        <Sidebar.SidebarProvider
          className="min-h-[260px] overflow-hidden rounded-md border"
          style={{ '--sidebar-width': '12rem' } as CSSProperties}
        >
          <Sidebar.Sidebar collapsible="none">
            <Sidebar.SidebarHeader className="p-4 font-semibold">
              {str(p.title)}
            </Sidebar.SidebarHeader>
            <Sidebar.SidebarContent>
              <Sidebar.SidebarGroup>
                <Sidebar.SidebarMenu>
                  {items.map((x) => (
                    <Sidebar.SidebarMenuItem key={x}>
                      <Sidebar.SidebarMenuButton
                        isActive={(active || items[0]) === x}
                        onClick={() => setActive(x)}
                      >
                        {x}
                      </Sidebar.SidebarMenuButton>
                    </Sidebar.SidebarMenuItem>
                  ))}
                </Sidebar.SidebarMenu>
              </Sidebar.SidebarGroup>
            </Sidebar.SidebarContent>
          </Sidebar.Sidebar>
          <main className="min-w-0 flex-1 p-5">
            <strong>{active || items[0]}</strong>
            <p className="mt-2 text-sm text-muted-foreground">{str(p.content)}</p>
          </main>
        </Sidebar.SidebarProvider>
      )
    case 'skeleton':
      return (
        <div className="flex items-center gap-4">
          {p.avatar && <Skeleton className="size-12 shrink-0 rounded-full" />}
          <div className="flex flex-1 flex-col gap-3">
            {Array.from({ length: num(p.lines, 1, 12, 3) }, (_, i) => (
              <Skeleton key={i} className={i % 2 ? 'h-4 w-3/4' : 'h-4 w-full'} />
            ))}
          </div>
        </div>
      )
    case 'slider': {
      const minimum = num(p.min, 0, 10000),
        maximum = Math.max(minimum + 1, num(p.max, 1, 10000, 100))
      return label(
        <>
          <Slider
            id={id}
            aria-label={str(p.label)}
            defaultValue={[num(p.value, minimum, maximum, minimum)]}
            min={minimum}
            max={maximum}
            step={num(p.step, 1, 1000, 1)}
            disabled={Boolean(p.disabled)}
            onValueChange={(v) => setValue(String(v[0]))}
          />
          <output className="text-sm text-muted-foreground">
            {num(value, minimum, maximum, minimum)}
          </output>
        </>,
      )
    }
    case 'sonner':
    case 'toast':
      return (
        <>
          <Button
            variant="outline"
            onClick={() => {
              const kind = variant(
                p.kind,
                ['success', 'info', 'warning', 'error'],
                'success',
              ) as 'success'
              toast[kind](str(p.title), { description: str(p.description), toasterId: id })
            }}
          >
            {str(p.trigger)}
          </Button>
          <Toaster id={id} />
        </>
      )
    case 'spinner':
      return (
        <div role="status" className="flex items-center gap-2">
          <Spinner />
          <span>{str(p.label)}</span>
        </div>
      )
    case 'toggle':
      return (
        <Toggle
          defaultPressed={Boolean(p.pressed)}
          variant={p.variant === 'outline' ? 'outline' : 'default'}
          disabled={Boolean(p.disabled)}
          aria-label={str(p.text)}
        >
          {str(p.text)}
        </Toggle>
      )
    case 'toggle-group':
      return (
        <ToggleGroup
          type="single"
          value={value}
          onValueChange={setValue}
          variant={p.variant === 'outline' ? 'outline' : 'default'}
          disabled={Boolean(p.disabled)}
        >
          {items.map((x) => (
            <ToggleGroupItem key={x} value={x} aria-label={x}>
              {x}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      )
    case 'tooltip':
      return (
        <Tooltip.TooltipProvider>
          <Tooltip.Tooltip>
            <Tooltip.TooltipTrigger asChild>
              <Button variant="outline">{str(p.trigger)}</Button>
            </Tooltip.TooltipTrigger>
            <Tooltip.TooltipContent side={side}>{str(p.text)}</Tooltip.TooltipContent>
          </Tooltip.Tooltip>
        </Tooltip.TooltipProvider>
      )
    case 'typography': {
      const text = str(p.text)
      switch (p.variant) {
        case 'h1':
          return <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight">{text}</h1>
        case 'h2':
          return (
            <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight">
              {text}
            </h2>
          )
        case 'h3':
          return <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">{text}</h3>
        case 'h4':
          return <h4 className="scroll-m-20 text-xl font-semibold tracking-tight">{text}</h4>
        case 'blockquote':
          return <blockquote className="border-l-2 pl-6 italic">{text}</blockquote>
        case 'code':
          return (
            <code className="relative rounded bg-muted px-1.5 py-1 font-mono text-sm font-semibold">
              {text}
            </code>
          )
        case 'lead':
          return <p className="text-xl text-muted-foreground">{text}</p>
        case 'large':
          return <p className="text-lg font-semibold">{text}</p>
        case 'small':
          return <small className="text-sm leading-none font-medium">{text}</small>
        case 'muted':
          return <p className="text-sm text-muted-foreground">{text}</p>
        default:
          return <p className="leading-7">{text}</p>
      }
    }
    default:
      return null
  }
}

function ChartRecipe({ p }: { p: Props }) {
  // Editor layout updates must not repeatedly clear and re-register chart data.
  const data = useMemo(
    () =>
      str(p.data)
        .split('\n')
        .filter((x) => x.trim())
        .map((x) => {
          const parts = x.split(',')
          const value = Number(parts[1])
          return { name: parts[0], value: Number.isFinite(value) ? value : 0 }
        }),
    [p.data],
  )
  const config = useMemo(
    () => ({ value: { label: str(p.series), color: 'var(--chart-1)' } }),
    [p.series],
  )
  const common = (
    <>
      <CartesianGrid vertical={false} />
      <XAxis dataKey="name" tickLine={false} axisLine={false} />
      <Chart.ChartTooltip content={<Chart.ChartTooltipContent />} />
    </>
  )
  return (
    <div className="oc-field">
      <strong>{str(p.title)}</strong>
      <Chart.ChartContainer config={config} className="h-[240px] w-full min-w-0">
        {p.chartType === 'line' ? (
          <LineChart data={data}>
            {common}
            <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} />
          </LineChart>
        ) : p.chartType === 'area' ? (
          <AreaChart data={data}>
            {common}
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--color-value)"
              fill="var(--color-value)"
              fillOpacity={0.25}
            />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            {common}
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        )}
      </Chart.ChartContainer>
    </div>
  )
}

function FormRecipe({ p }: { p: Props }) {
  const form = useForm<{ username: string }>({ defaultValues: { username: '' } }),
    [submitted, setSubmitted] = useState(false)
  return (
    <Form.Form {...form}>
      <form onSubmit={form.handleSubmit(() => setSubmitted(true))} className="space-y-4">
        <Form.FormField
          control={form.control}
          name="username"
          rules={{
            required: 'Enter a value.',
            minLength: { value: 2, message: 'Enter at least two characters.' },
          }}
          render={({ field }) => (
            <Form.FormItem>
              <Form.FormLabel>{str(p.label)}</Form.FormLabel>
              <Form.FormControl>
                <Input placeholder={str(p.placeholder)} {...field} />
              </Form.FormControl>
              <Form.FormDescription>{str(p.description)}</Form.FormDescription>
              <Form.FormMessage />
            </Form.FormItem>
          )}
        />
        <Button type="submit">{str(p.submit)}</Button>
        {submitted && <p role="status">{str(p.success)}</p>}
      </form>
    </Form.Form>
  )
}
function DataTableRecipe({ p }: { p: Props }) {
  const [sorting, setSorting] = useState<SortingState>([]),
    [filter, setFilter] = useState('')
  const headers = useMemo(
      () =>
        str(p.headers)
          .split(',')
          .map((x) => x.trim()),
      [p.headers],
    ),
    data = useMemo(
      () =>
        str(p.rows)
          .split('\n')
          .filter((x) => x.trim())
          .map((x) => x.split(',').map((x) => x.trim())),
      [p.rows],
    )
  const columns = useMemo<ColumnDef<string[]>[]>(
    () =>
      headers.map((header, index) => ({
        id: String(index),
        accessorFn: (row) => row[index] ?? '',
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            {header}
            <ArrowUpDown />
          </Button>
        ),
      })),
    [headers],
  )
  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter: filter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: Math.floor(num(p.pageSize, 1, 50, 5)) } },
  })
  return (
    <div className="oc-field">
      <Input
        aria-label="Filter table"
        placeholder={str(p.filterPlaceholder)}
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <div className="rounded-md border">
        <Table.Table>
          <Table.TableHeader>
            {table.getHeaderGroups().map((g) => (
              <Table.TableRow key={g.id}>
                {g.headers.map((h) => (
                  <Table.TableHead key={h.id}>
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                  </Table.TableHead>
                ))}
              </Table.TableRow>
            ))}
          </Table.TableHeader>
          <Table.TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <Table.TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.TableCell>
                  ))}
                </Table.TableRow>
              ))
            ) : (
              <Table.TableRow>
                <Table.TableCell colSpan={headers.length} className="h-20 text-center">
                  No results.
                </Table.TableCell>
              </Table.TableRow>
            )}
          </Table.TableBody>
        </Table.Table>
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} rows · Page{' '}
          {table.getState().pagination.pageIndex + 1} of {Math.max(1, table.getPageCount())}
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
