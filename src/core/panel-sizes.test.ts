import { describe, expect, it } from 'vitest'
import { DEFAULT_PANEL_SIZES, panelLayout, parsePanelSizes } from './panel-sizes'

describe('editor panel width preferences', () => {
  it('ignores corrupt preferences and constrains saved widths', () => {
    expect(parsePanelSizes('broken')).toEqual(DEFAULT_PANEL_SIZES)
    expect(parsePanelSizes('{"left":null,"right":"300"}')).toEqual(DEFAULT_PANEL_SIZES)
    expect(parsePanelSizes('{"left":-100,"right":10000}')).toEqual({ left: 200, right: 480 })
  })

  it('keeps at least 360 pixels for the desktop canvas when both panels are wide', () => {
    for (const viewport of [1151, 1280, 1440]) {
      const { sizes, limits } = panelLayout({ left: 480, right: 480 }, viewport, true)
      expect(viewport - 54 - sizes.left - sizes.right).toBeGreaterThanOrEqual(360)
      expect(sizes.left).toBeGreaterThanOrEqual(limits.left.min)
      expect(sizes.right).toBeLessThanOrEqual(limits.right.max)
    }
  })

  it('retains preferences when the viewport temporarily limits the displayed widths', () => {
    const preferred = { left: 410, right: 400 }
    expect(panelLayout(preferred, 701, true).sizes.left).toBe(291)
    expect(panelLayout(preferred, 1600, true).sizes).toEqual(preferred)
    expect(preferred).toEqual({ left: 410, right: 400 })
  })

  it('bounds overlay panels on a narrow screen without consuming its canvas grid', () => {
    const { sizes, limits } = panelLayout({ left: 480, right: 480 }, 375, true)
    expect(sizes).toEqual({ left: 281, right: 281 })
    expect(limits.left.max).toBe(281)
    expect(limits.right.max).toBe(281)
    expect(panelLayout(DEFAULT_PANEL_SIZES, 260, true).sizes).toEqual({ left: 166, right: 166 })
  })
})
