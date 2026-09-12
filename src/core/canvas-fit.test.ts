import { describe, expect, it } from 'vitest'
import { fitCanvasScale } from './canvas-fit'

describe('fit the entire screen', () => {
  it('fits the height even when the width already fits', () => {
    const scale = fitCanvasScale({ width: 824, height: 577 }, { width: 768, height: 700 })
    expect(768 * scale).toBeLessThanOrEqual(822)
    expect(700 * scale).toBeLessThanOrEqual(575)
    expect(700 * scale).toBeGreaterThan(574)
  })

  it('fits a wide screen without enlarging smaller screens', () => {
    expect(fitCanvasScale({ width: 602, height: 802 }, { width: 1200, height: 700 })).toBe(0.5)
    expect(fitCanvasScale({ width: 1000, height: 1000 }, { width: 375, height: 700 })).toBe(1)
  })

  it('can fit a long page below ten percent', () => {
    const scale = fitCanvasScale({ width: 824, height: 577 }, { width: 768, height: 12000 })
    expect(scale).toBeLessThan(0.1)
    expect(12000 * scale).toBeLessThanOrEqual(575)
    expect(scale).toBeGreaterThan(0)
    expect(
      fitCanvasScale({ width: 824, height: 3 }, { width: 768, height: 1000.0000000000002 }),
    ).toBeGreaterThan(0)
  })

  it('settles when subpixel wrapping alternates between nearby heights', () => {
    const area = { width: 824, height: 577 }
    expect(fitCanvasScale(area, { width: 768, height: 8399 })).toBe(
      fitCanvasScale(area, { width: 768, height: 8418 }),
    )
  })
})
