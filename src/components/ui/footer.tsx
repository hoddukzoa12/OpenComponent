// OpenComponent's local footer block. Shared by the editor, Preview, and export.
// This is an original composition, not an upstream shadcn/ui primitive.
// Uses the project's utility stylesheet and shared theme variables.
type FooterProps = {
  brand?: string
  description?: string
  // One Label | URL per line. Absolute HTTP(S) URLs open in a separate tab.
  links?: string
  copyright?: string
}

function footerLinks(value: string) {
  return value
    .split('\n')
    .map((line) => {
      const divider = line.indexOf('|')
      const label = (divider < 0 ? line : line.slice(0, divider)).trim()
      const url = divider < 0 ? '' : line.slice(divider + 1).trim()
      // Only supported navigation destinations become links; other labels remain readable.
      const href =
        !/[\u0000-\u0020\u007f]/.test(url) &&
        /^(https?:\/\/|mailto:|tel:|#|\/(?!\/)|\.{1,2}\/)/i.test(url)
          ? url
          : undefined
      return { label, href }
    })
    .filter(({ label }) => label)
}

export function Footer({ brand = '', description = '', links = '', copyright = '' }: FooterProps) {
  const navigation = footerLinks(links)
  return (
    <footer
      data-slot="footer"
      className="w-full min-w-0 border-t border-border text-foreground"
      style={{ paddingBlock: 'calc(var(--oc-space, 4px) * 8)', overflowWrap: 'anywhere' }}
    >
      <div className="flex flex-wrap items-start" style={{ gap: 'calc(var(--oc-space, 4px) * 8)' }}>
        {(brand || description) && (
          <div className="min-w-0" style={{ flex: '1 1 14rem' }}>
            {brand && (
              <p
                className="m-0 text-xl"
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 'var(--heading-weight, 600)',
                }}
              >
                {brand}
              </p>
            )}
            {description && (
              <p className="mt-3 mb-0 max-w-sm whitespace-pre-wrap text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
        {navigation.length > 0 && (
          <nav aria-label="Footer navigation" className="min-w-0" style={{ flex: '1 1 12rem' }}>
            <ul
              className="m-0 grid list-none gap-3 p-0 text-sm"
              style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 8rem), 1fr))' }}
            >
              {navigation.map(({ label, href }, index) => (
                <li key={index} className="min-w-0">
                  {href ? (
                    <a
                      href={href}
                      target={/^https?:\/\//i.test(href) ? '_blank' : undefined}
                      rel={/^https?:\/\//i.test(href) ? 'noopener noreferrer' : undefined}
                      className="inline-block rounded-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
                    >
                      {label}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">{label}</span>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
      {copyright && (
        <p
          className="mb-0 border-t border-border text-xs text-muted-foreground"
          style={{
            marginTop: 'calc(var(--oc-space, 4px) * 8)',
            paddingTop: 'calc(var(--oc-space, 4px) * 5)',
          }}
        >
          {copyright}
        </p>
      )}
    </footer>
  )
}
