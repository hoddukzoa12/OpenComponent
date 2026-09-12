// Palette artwork is intentionally static: it must never mount a form, portal,
// scroll controller or other component with effects inside a draggable tile.
export function ExtendedThumbnail({ type }: { type: string }) {
  const fg = 'var(--foreground, #554768)',
    muted = 'var(--muted, #e7e0f0)',
    primary = 'var(--primary, #8b70b2)',
    bg = 'var(--card, white)',
    border = 'var(--border, #d5cbdf)'
  const line = (x: number, y: number, width: number, key?: number) => (
    <rect key={key} x={x} y={y} width={width} height={5} rx={2.5} fill={muted} />
  )
  const box = (x: number, y: number, w: number, h: number) => (
    <rect x={x} y={y} width={w} height={h} rx={5} fill={bg} stroke={border} />
  )
  let content
  if (type === 'footer')
    content = (
      <>
        <path d="M8 16H162M8 81H162" stroke={border} />
        <rect x="8" y="29" width="55" height="9" rx="3" fill={primary} />
        {line(8, 48, 67)}
        {line(8, 59, 52)}
        {[30, 45, 60].map((y, i) => (
          <g key={y}>
            {line(96, y, 23)}
            {line(132, y, 28, i)}
          </g>
        ))}
        {line(8, 92, 83)}
      </>
    )
  else if (['calendar', 'date-picker'].includes(type))
    content = (
      <>
        {box(30, 8, 110, 94)}
        <rect x="30" y="8" width="110" height="21" rx="5" fill={primary} />
        {Array.from({ length: 28 }, (_, i) => (
          <rect
            key={i}
            x={40 + (i % 7) * 13}
            y={38 + Math.floor(i / 7) * 15}
            width="7"
            height="7"
            rx="2"
            fill={i === 11 ? primary : muted}
          />
        ))}
      </>
    )
  else if (type === 'chart')
    content = (
      <>
        <path d="M20 16V92H153" stroke={border} fill="none" />
        {[42, 67, 51, 76, 60].map((h, i) => (
          <rect
            key={i}
            x={30 + i * 24}
            y={92 - h}
            width="15"
            height={h}
            rx="3"
            fill={primary}
            opacity={0.55 + i * 0.1}
          />
        ))}
      </>
    )
  else if (['data-table', 'table'].includes(type))
    content = (
      <>
        {box(5, 12, 160, 88)}
        <rect x="6" y="13" width="158" height="19" rx="4" fill={muted} />
        {[42, 60, 78].map((y) => (
          <g key={y}>
            {line(15, y, 45)}
            {line(74, y, 27)}
            {line(118, y, 33)}
          </g>
        ))}
        <path d="M7 51H164M7 69H164M64 32V99M110 32V99" stroke={border} />
      </>
    )
  else if (type === 'sidebar')
    content = (
      <>
        {box(5, 5, 160, 100)}
        <rect x="6" y="6" width="48" height="98" rx="4" fill={muted} />
        <rect x="13" y="20" width="33" height="8" rx="3" fill={primary} />
        {[42, 57, 72].map((y, i) => line(13, y, 28, i))}
        {line(68, 22, 72)}
        {line(68, 39, 52)}
        {box(68, 56, 82, 33)}
      </>
    )
  else if (['message', 'message-scroller', 'bubble'].includes(type))
    content = (
      <>
        <rect x="8" y="14" width="114" height="33" rx="12" fill={muted} />
        {line(20, 28, 81)}
        <rect x="52" y="59" width="110" height="33" rx="12" fill={primary} opacity=".8" />
        <path d="M65 75H144" stroke={bg} strokeWidth="5" strokeLinecap="round" />
      </>
    )
  else if (['avatar', 'spinner'].includes(type))
    content =
      type === 'avatar' ? (
        <>
          <circle cx="85" cy="55" r="35" fill={muted} />
          <text x="85" y="63" fill={fg} textAnchor="middle" fontSize="24" fontWeight="600">
            AM
          </text>
        </>
      ) : (
        <circle
          cx="85"
          cy="55"
          r="24"
          fill="none"
          stroke={primary}
          strokeWidth="6"
          strokeDasharray="106 45"
          strokeLinecap="round"
        />
      )
  else if (
    [
      'tooltip',
      'popover',
      'hover-card',
      'dialog',
      'alert-dialog',
      'drawer',
      'sheet',
      'dropdown-menu',
      'context-menu',
      'command',
      'menubar',
      'navigation-menu',
    ].includes(type)
  )
    content = (
      <>
        <rect x="26" y="8" width="84" height="22" rx="5" fill={primary} />
        {box(type === 'sheet' ? 65 : 40, 37, type === 'sheet' ? 70 : 120, 65)}
        {line(type === 'sheet' ? 74 : 50, 48, 56)}
        {line(type === 'sheet' ? 74 : 50, 65, 48)}
        {line(type === 'sheet' ? 74 : 50, 82, 40)}
      </>
    )
  else if (['accordion', 'collapsible', 'scroll-area', 'resizable'].includes(type))
    content = (
      <>
        {box(8, 8, 154, 95)}
        {[23, 50, 77].map((y, i) => (
          <g key={y}>
            {line(20, y, 90)}
            <path d={`M140 ${y}l4 4 4-4`} fill="none" stroke={fg} />
            {i < 2 && <path d={`M10 ${y + 16}H159`} stroke={border} />}
          </g>
        ))}
      </>
    )
  else if (['slider', 'progress'].includes(type))
    content = (
      <>
        <rect x="12" y="51" width="146" height="8" rx="4" fill={muted} />
        <rect x="12" y="51" width="87" height="8" rx="4" fill={primary} />
        <circle cx="99" cy="55" r="10" fill={bg} stroke={primary} strokeWidth="2" />
      </>
    )
  else if (['radio-group', 'questionnaire'].includes(type))
    content = (
      <>
        {[22, 49, 76].map((y, i) => (
          <g key={y}>
            <circle
              cx="23"
              cy={y + 3}
              r="7"
              fill={bg}
              stroke={i === 0 ? primary : border}
              strokeWidth="2"
            />
            {i === 0 && <circle cx="23" cy={y + 3} r="3" fill={primary} />} {line(42, y, 103)}
          </g>
        ))}
      </>
    )
  else if (['input-otp', 'kbd', 'button-group', 'toggle-group', 'pagination'].includes(type))
    content = (
      <>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect
              x={9 + i * 41}
              y="36"
              width="30"
              height="37"
              rx="5"
              fill={i === 0 ? primary : bg}
              stroke={border}
            />
            <text x={24 + i * 41} y="59" fill={i === 0 ? bg : fg} fontSize="16" textAnchor="middle">
              {type === 'kbd' ? ['⌘', '⇧', 'K', '↵'][i] : i + 1}
            </text>
          </g>
        ))}
      </>
    )
  else if (['typography', 'marker', 'direction'].includes(type))
    content = (
      <>
        <text x="12" y="44" fill={fg} fontSize="27" fontWeight="600">
          Aa
        </text>
        {line(12, 61, 145)}
        {line(12, 77, 112)}
        {line(12, 93, 132)}
      </>
    )
  else if (['alert', 'attachment', 'empty', 'item'].includes(type))
    content = (
      <>
        {box(5, 24, 160, 62)}
        <circle cx="29" cy="55" r="13" fill={muted} />
        {line(53, 43, 94)}
        {line(53, 60, 72)}
      </>
    )
  else if (type === 'skeleton')
    content = (
      <>
        <circle cx="29" cy="54" r="21" fill={muted} />
        {[33, 52, 71].map((y, i) => line(65, y, 95 - i * 13, i))}
      </>
    )
  else if (type === 'aspect-ratio' || type === 'carousel')
    content = (
      <>
        {box(5, 12, 160, 90)}
        <path d="M10 94l43-45 34 30 22-24 50 39" fill={muted} />
        <circle cx="123" cy="35" r="10" fill={primary} />
      </>
    )
  else if (type === 'breadcrumb')
    content = (
      <>
        <text x="8" y="60" fill={fg} fontSize="15">
          Home › Docs › Page
        </text>
      </>
    )
  else if (['sonner', 'toast', 'toggle'].includes(type))
    content = (
      <>
        <rect x="25" y="36" width="120" height="37" rx="6" fill={primary} />
        <path d="M47 55h76" stroke={bg} strokeWidth="5" strokeLinecap="round" />
      </>
    )
  else
    content = (
      <>
        {line(12, 13, 67)}
        {box(12, 29, 146, 29)}
        {line(21, 41, 102)}
        {line(12, 71, 89)}
        <rect x="12" y="88" width="62" height="17" rx="4" fill={primary} />
      </>
    )
  return (
    <svg viewBox="0 0 170 110" width="170" height="110" aria-hidden="true" focusable="false">
      {content}
    </svg>
  )
}
