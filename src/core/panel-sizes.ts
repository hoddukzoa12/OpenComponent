export type PanelSide = 'left' | 'right'
export type PanelSizes = Record<PanelSide, number>

export const PANEL_SIZE_STORAGE_KEY = 'opencomponent.panel-widths.v1'
export const DEFAULT_PANEL_SIZES: PanelSizes = { left: 250, right: 268 }
const MIN_PANEL_SIZES: PanelSizes = { left: 200, right: 240 }
const MAX_PANEL_SIZE = 480
const MIN_CANVAS_WIDTH = 360

export const clampPanelWidth = (width: number, min: number, max: number) =>
  Math.round(Math.min(max, Math.max(min, width)))

export function parsePanelSizes(value: string | null): PanelSizes {
  try {
    const parsed: unknown = JSON.parse(value || 'null')
    if (!parsed || typeof parsed !== 'object') return { ...DEFAULT_PANEL_SIZES }
    const sizes = { ...DEFAULT_PANEL_SIZES }
    for (const side of ['left', 'right'] as const) {
      const width = (parsed as Record<string, unknown>)[side]
      if (typeof width === 'number' && Number.isFinite(width))
        sizes[side] = clampPanelWidth(width, MIN_PANEL_SIZES[side], MAX_PANEL_SIZE)
    }
    return sizes
  } catch {
    return { ...DEFAULT_PANEL_SIZES }
  }
}

/** Clamp the displayed widths without replacing the user's saved preferences. */
export function panelLayout(preferred: PanelSizes, viewport: number, leftOpen: boolean) {
  const desktop = viewport > 1150
  const mobile = viewport <= 700
  const rail = desktop ? 54 : mobile ? 46 : 50
  const budget = viewport - rail - MIN_CANVAS_WIDTH
  const overlayMax = Math.max(0, Math.min(MAX_PANEL_SIZE, viewport - rail - 48))
  const leftMin = Math.min(MIN_PANEL_SIZES.left, overlayMax)
  const rightMin = Math.min(MIN_PANEL_SIZES.right, overlayMax)
  const rightLimit = desktop
    ? Math.min(MAX_PANEL_SIZE, budget - (leftOpen ? leftMin : 0))
    : overlayMax
  const right = clampPanelWidth(preferred.right, rightMin, rightLimit)
  const leftLimit = mobile ? overlayMax : Math.min(MAX_PANEL_SIZE, budget - (desktop ? right : 0))
  const left = clampPanelWidth(preferred.left, leftMin, leftLimit)
  return {
    sizes: { left, right },
    limits: {
      left: { min: leftMin, max: leftLimit },
      right: {
        min: rightMin,
        max: desktop ? Math.min(MAX_PANEL_SIZE, budget - (leftOpen ? left : 0)) : overlayMax,
      },
    },
  }
}
