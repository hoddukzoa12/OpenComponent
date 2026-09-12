type Size = { width: number; height: number }

// Sizes are the available content box and the unscaled screen bounds.
// Keep two pixels for the frame outline; padding is already excluded.
export function fitCanvasScale(available: Size, screen: Size) {
  const scale = Math.min(
    1,
    Math.max(1, available.width - 2) / Math.max(1, screen.width),
    Math.max(1, available.height - 2) / Math.max(1, screen.height),
  )
  // CSS zoom can change text wrapping by a fraction of a physical pixel.
  // Round down to 0.1% steps so measuring the fitted page settles instead of
  // alternating between adjacent layout heights. Keep very long pages nonzero.
  const step = Math.min(0.001, 10 ** Math.floor(Math.log10(scale)))
  const rounded = Math.floor(scale / step) * step
  return rounded > 0 ? Math.min(scale, rounded) : scale
}
