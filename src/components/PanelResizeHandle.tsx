import { useRef, useState } from 'react'
import { clampPanelWidth, type PanelSide } from '../core/panel-sizes'

export function PanelResizeHandle({
  side,
  width,
  min,
  max,
  onResize,
  onReset,
}: {
  side: PanelSide
  width: number
  min: number
  max: number
  onResize: (width: number) => void
  onReset: () => void
}) {
  const drag = useRef<{ pointerId: number; x: number; width: number } | null>(null)
  const [resizing, setResizing] = useState(false)
  const direction = side === 'left' ? 1 : -1
  const label = side === 'left' ? 'Resize library panel' : 'Resize properties panel'
  const finishDrag = () => {
    drag.current = null
    setResizing(false)
  }
  return (
    <div
      className={`panel-resizer panel-resizer-${side}`}
      role="separator"
      tabIndex={0}
      aria-label={label}
      aria-orientation="vertical"
      aria-controls={`${side}-panel`}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={width}
      aria-valuetext={`${width} pixels wide`}
      title={`${label} · Drag or use arrow keys · Double-click to reset`}
      data-resizing={resizing || undefined}
      onPointerDown={(event) => {
        if (event.button !== 0 || !event.isPrimary) return
        event.preventDefault()
        event.stopPropagation()
        event.currentTarget.focus()
        event.currentTarget.setPointerCapture(event.pointerId)
        drag.current = { pointerId: event.pointerId, x: event.clientX, width }
        setResizing(true)
      }}
      onPointerMove={(event) => {
        const active = drag.current
        if (!active || active.pointerId !== event.pointerId) return
        onResize(clampPanelWidth(active.width + (event.clientX - active.x) * direction, min, max))
      }}
      onPointerUp={(event) => {
        if (drag.current?.pointerId !== event.pointerId) return
        finishDrag()
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId)
      }}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onDoubleClick={onReset}
      onKeyDown={(event) => {
        let next: number
        if (event.key === 'Home') next = min
        else if (event.key === 'End') next = max
        else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight')
          next =
            width + (event.key === 'ArrowRight' ? 1 : -1) * direction * (event.shiftKey ? 40 : 10)
        else return
        event.preventDefault()
        event.stopPropagation()
        onResize(clampPanelWidth(next, min, max))
      }}
    />
  )
}
