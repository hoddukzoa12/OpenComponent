import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { ExtendedNode } from '../components/ui/extended-node'
import { extendedDefaults } from './extended-catalog'
import { Footer } from '../components/ui/footer'

describe('bundled component compositions', () => {
  it('renders every added composition through its shared components', () => {
    // This catches required provider/API regressions (including MessageScroller),
    // which a successful JSX export or a type check alone cannot detect.
    for (const [type, props] of Object.entries(extendedDefaults)) {
      expect(
        renderToStaticMarkup(createElement(ExtendedNode, { type, props, id: `qa-${type}` })),
        type,
      ).not.toBe('')
    }
  })
  it('keeps identical records when rendering a data table', () => {
    const html = renderToStaticMarkup(
      createElement(ExtendedNode, {
        type: 'data-table',
        props: {
          ...extendedDefaults['data-table'],
          headers: 'Name',
          rows: 'Repeated record\nRepeated record',
        },
      }),
    )
    expect(html.match(/Repeated record/g)).toHaveLength(2)
  })
  it('clamps the slider readout to its minimum on first render', () => {
    const html = renderToStaticMarkup(
      createElement(ExtendedNode, {
        type: 'slider',
        props: { ...extendedDefaults.slider, min: 50, value: 20 },
      }),
    )
    expect(html).toContain('aria-valuemin="50"')
    expect(html).toMatch(/<output[^>]*>50<\/output>/)
  })
  it('normalizes fractional page input to a real selected page', () => {
    const html = renderToStaticMarkup(
      createElement(ExtendedNode, {
        type: 'pagination',
        props: { ...extendedDefaults.pagination, pages: 3.5, page: 2.8 },
      }),
    )
    expect(html).toMatch(/aria-current="page"[^>]*>2<\/a>/)
  })
  it('renders configured footer destinations and preserves labels without supported URLs', () => {
    const html = renderToStaticMarkup(
      createElement(Footer, {
        brand: 'Example studio',
        description: 'Made for people',
        links:
          'Docs | https://example.com/docs\nContact | mailto:hello@example.com\nNext screen | #/screen/details\nSoon\nUnsupported | invalid:destination\n | /hidden',
        copyright: '© Example studio',
      }),
    )
    expect(html).toContain('<footer')
    expect(html).toContain('aria-label="Footer navigation"')
    expect(html).toContain(
      'href="https://example.com/docs" target="_blank" rel="noopener noreferrer"',
    )
    expect(html).toContain('href="mailto:hello@example.com"')
    expect(html).toContain('href="#/screen/details"')
    expect(html).toContain('Soon</span>')
    expect(html).toContain('Unsupported</span>')
    expect(html).not.toContain('invalid:destination')
    expect(html).not.toContain('/hidden')
  })
})
