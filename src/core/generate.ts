import {
  themeVariables,
  toDesignMarkdown,
  validateProject,
  type CanvasNode,
  type Layout,
  type ProjectDocument,
} from './model'

export interface ExportAssets {
  sources: Record<string, string>
  supportFiles?: Record<string, string>
  projectCss: string
  utils: string
  portal: string
  licenses: string
  projectLicense: string
  projectNotice: string
  versions: Record<string, string>
}
const q = (value: unknown) => JSON.stringify(String(value ?? ''))
const text = (value: unknown) => `{${q(value)}}`
const attr = (key: string, value: unknown) =>
  `${key}={${typeof value === 'boolean' || typeof value === 'number' ? JSON.stringify(value) : q(value)}}`
const uniqueLines = (v: unknown) => [
  ...new Set(
    String(v ?? '')
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
  ),
]
const bounded = (v: unknown, min = 0, max = 100) => Math.max(min, Math.min(max, Number(v) || 0))
export function generateProject(
  input: ProjectDocument,
  assets: ExportAssets,
): Record<string, string> {
  const doc = validateProject(input),
    imports = new Map<string, Set<string>>(),
    styles: string[] = [],
    used = new Set<string>()
  function use(file: string, ...names: string[]) {
    used.add(file)
    const set = imports.get(file) || new Set()
    names.forEach((n) => set.add(n))
    imports.set(file, set)
  }
  function layoutCss(l: Layout) {
    return Object.entries({
      display: undefined,
      gap: `calc(var(--oc-space) * ${l.gap ?? 4})`,
      padding: l.padding !== undefined ? `calc(var(--oc-space) * ${l.padding})` : undefined,
      'align-items':
        l.align === 'start'
          ? 'flex-start'
          : l.align === 'end'
            ? 'flex-end'
            : (l.align ?? 'stretch'),
      'align-self': l.width === 'auto' ? 'flex-start' : undefined,
      '--row-child-flex': l.direction === 'row' ? '1' : 'initial',
      'flex-direction': l.direction ?? 'column',
      'grid-template-columns': `repeat(${l.columns ?? 1}, minmax(0,1fr))`,
    })
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => `${k}:${v}`)
      .join(';')
  }
  let count = 0
  function render(node: CanvasNode): string {
    const p = node.props,
      id = `oc-${++count}`,
      className = `layout-${count}`
    styles.push(`.${className}{${layoutCss(node.layout)}}`)
    if (node.layout.tablet)
      styles.push(
        `@media(min-width:768px){.${className}{${layoutCss({ ...node.layout, ...node.layout.tablet })}}}`,
      )
    if (node.layout.desktop)
      styles.push(
        `@media(min-width:1024px){.${className}{${layoutCss({ ...node.layout, ...node.layout.tablet, ...node.layout.desktop })}}}`,
      )
    const children = (slot?: string) =>
      node.children
        .filter((n) => node.type !== 'tabs' || n.slot === slot)
        .map((n) => `<div className="child-flow">${render(n)}</div>`)
        .join('\n')
    const field = (child: string) => {
      use('label', 'Label')
      return `<div className="oc-field"><Label htmlFor="${id}">${text(p.label)}</Label>${child}</div>`
    }
    switch (node.type) {
      case 'footer':
        use('footer', 'Footer')
        return `<Footer ${['brand', 'description', 'links', 'copyright'].map((key) => attr(key, String(p[key] ?? ''))).join(' ')}/>`
      case 'stack':
        return `<div className="oc-stack ${className}">${children()}</div>`
      case 'grid':
        return `<div className="oc-grid ${className}">${children()}</div>`
      case 'heading':
        return `<h2 className="oc-heading ${className}">${text(p.text)}</h2>`
      case 'text':
        return `<p className="oc-text ${p.tone === 'muted' ? 'text-muted-foreground' : ''} ${className}">${text(p.text)}</p>`
      case 'button':
        use('button', 'Button')
        return `<Button className="${className}" ${attr('variant', ['default', 'secondary', 'outline', 'ghost', 'link', 'destructive'].includes(String(p.variant)) ? p.variant : 'default')} ${attr('size', ['default', 'sm', 'lg'].includes(String(p.size)) ? p.size : 'default')} ${attr('disabled', Boolean(p.disabled))}>${text(p.text)}</Button>`
      case 'input':
        use('input', 'Input')
        return field(
          `<Input id="${id}" ${attr('placeholder', p.placeholder)} ${attr('defaultValue', p.value)} ${attr('disabled', Boolean(p.disabled))}/>`,
        )
      case 'textarea':
        use('textarea', 'Textarea')
        return field(
          `<Textarea id="${id}" ${attr('placeholder', p.placeholder)} ${attr('defaultValue', p.value)} ${attr('disabled', Boolean(p.disabled))}/>`,
        )
      case 'label':
        use('label', 'Label')
        return `<Label>${text(p.text)}</Label>`
      case 'checkbox':
      case 'switch': {
        const name = node.type === 'checkbox' ? 'Checkbox' : 'Switch'
        use(node.type, name)
        use('label', 'Label')
        return `<div className="oc-toggle ${node.type}"><${name} id="${id}" ${attr('defaultChecked', Boolean(p.checked))} ${attr('disabled', Boolean(p.disabled))}/><Label htmlFor="${id}">${text(p.label)}</Label></div>`
      }
      case 'select':
        use('select', 'Select', 'SelectTrigger', 'SelectValue', 'SelectContent', 'SelectItem')
        return field(
          `<Select ${attr('defaultValue', p.value)} ${attr('disabled', Boolean(p.disabled))}><SelectTrigger id="${id}" className="w-full"><SelectValue placeholder="Select an option"/></SelectTrigger><SelectContent>${uniqueLines(
            p.options,
          )
            .map((v) => `<SelectItem ${attr('value', v)}>${text(v)}</SelectItem>`)
            .join('')}</SelectContent></Select>`,
        )
      case 'card':
        use('card', 'Card', 'CardHeader', 'CardTitle', 'CardDescription', 'CardContent')
        return `<Card><CardHeader><CardTitle>${text(p.title)}</CardTitle><CardDescription>${text(p.description)}</CardDescription></CardHeader><CardContent><div className="oc-stack ${className}">${children()}</div></CardContent></Card>`
      case 'tabs':
        use('tabs', 'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent')
        return `<Tabs ${attr('defaultValue', uniqueLines(p.labels).includes(String(p.active)) ? p.active : uniqueLines(p.labels)[0])}><TabsList>${uniqueLines(
          p.labels,
        )
          .map((v) => `<TabsTrigger ${attr('value', v)}>${text(v)}</TabsTrigger>`)
          .join('')}</TabsList>${uniqueLines(p.labels)
          .map(
            (v) =>
              `<TabsContent ${attr('value', v)}><div className="oc-stack ${className}">${children(v)}</div></TabsContent>`,
          )
          .join('')}</Tabs>`
      case 'dialog':
        use(
          'dialog',
          'Dialog',
          'DialogTrigger',
          'DialogContent',
          'DialogHeader',
          'DialogTitle',
          'DialogDescription',
          'DialogFooter',
          'DialogClose',
        )
        use('button', 'Button')
        return `<Dialog><DialogTrigger asChild><Button>${text(p.trigger)}</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>${text(p.title)}</DialogTitle><DialogDescription>${text(p.description)}</DialogDescription></DialogHeader><div className="oc-stack ${className}">${children()}</div><DialogFooter><DialogClose asChild><Button>Done</Button></DialogClose></DialogFooter></DialogContent></Dialog>`
      case 'badge':
        use('badge', 'Badge')
        return `<Badge ${attr('variant', ['default', 'secondary', 'outline', 'destructive'].includes(String(p.variant)) ? p.variant : 'secondary')}>${text(p.text)}</Badge>`
      case 'separator':
        use('separator', 'Separator')
        return '<Separator/>'
      case 'table':
        use('table', 'Table', 'TableHeader', 'TableRow', 'TableHead', 'TableBody', 'TableCell')
        return `<Table><TableHeader><TableRow>${String(p.headers)
          .split(',')
          .map((v) => `<TableHead>${text(v.trim())}</TableHead>`)
          .join('')}</TableRow></TableHeader><TableBody>${String(p.rows)
          .split('\n')
          .filter(Boolean)
          .map(
            (row) =>
              `<TableRow>${row
                .split(',')
                .map((v) => `<TableCell>${text(v.trim())}</TableCell>`)
                .join('')}</TableRow>`,
          )
          .join('')}</TableBody></Table>`
      case 'progress':
        use('progress', 'Progress')
        return `<div className="oc-field"><div className="oc-metric-label">${text(p.label)}<span>${bounded(p.value)}%</span></div><Progress value={${bounded(p.value)}} ${attr('aria-label', p.label)}/></div>`
      case 'number-ticker':
        use('number-ticker', 'NumberTicker')
        return `<div className="oc-metric"><span className="text-muted-foreground">${text(p.label)}</span><NumberTicker value={${bounded(p.value, 0, 100000000)}} className="text-3xl font-semibold"/></div>`
      case 'animated-circular-progress-bar':
        use('animated-circular-progress-bar', 'AnimatedCircularProgressBar')
        return `<div className="oc-metric"><span className="text-muted-foreground">${text(p.label)}</span><AnimatedCircularProgressBar value={${bounded(p.value)}} gaugePrimaryColor="var(--primary)" gaugeSecondaryColor="var(--muted)"/></div>`
      default:
        use('extended-node', 'ExtendedNode')
        return `<ExtendedNode type={${q(node.type)}} props={${JSON.stringify(p)}} id={${q(id)}}/>`
    }
  }
  const files: Record<string, string> = {}
  const screens = doc.screens.map((screen, index) => {
    imports.clear()
    const body = render(screen.root)
    const name = `Screen${index + 1}`
    files[`src/screens/${name}.tsx`] =
      `${[...imports].map(([file, names]) => `import { ${[...names].join(', ')} } from '../components/ui/${file}'`).join('\n')}\n\nexport default function ${name}(){return ${body}}\n`
    return { id: screen.id, name: screen.name, component: name }
  })
  const app = `import { useEffect, useState } from 'react'\nimport { ProjectPortal } from './lib/portal'\n${screens.map((screen) => `import ${screen.component} from './screens/${screen.component}'`).join('\n')}\n
const screens = [${screens.map((screen) => `{id:${q(screen.id)}, Component:${screen.component}}`).join(',')}]\n
function readRoute(){try{return decodeURIComponent(window.location.hash.replace(/^#\\/screen\\//,''))}catch{return ''}}\n
export default function App(){
const [screenId,setScreenId]=useState(readRoute)
const [portal,setPortal]=useState<HTMLDivElement|null>(null)
useEffect(()=>{const update=()=>setScreenId(readRoute());window.addEventListener('hashchange',update);return ()=>window.removeEventListener('hashchange',update)},[])
const Screen=(screens.find(screen=>screen.id===screenId)||screens[0]).Component
return <div className="render-surface ${doc.design.mode === 'dark' ? 'dark' : ''}"><ProjectPortal.Provider value={portal??undefined}><Screen key={screenId}/></ProjectPortal.Provider><div ref={setPortal} style={{minHeight:0}}/></div>
}\n`
  const deps = new Set([
    'react',
    'react-dom',
    'clsx',
    'tailwind-merge',
    'tailwindcss',
    'tw-animate-css',
  ])
  const bundled: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(assets.sources).map(([name, source]) => [
        `src/components/ui/${name}.tsx`,
        source,
      ]),
    ),
    'src/lib/utils.ts': assets.utils,
    'src/lib/portal.tsx': assets.portal,
    ...assets.supportFiles,
  }
  const normalize = (path: string) => {
    const parts: string[] = []
    for (const part of path.split('/')) {
      if (part === '..') parts.pop()
      else if (part && part !== '.') parts.push(part)
    }
    return parts.join('/')
  }
  function include(path: string) {
    if (files[path]) return
    const source = bundled[path]
    if (source === undefined) throw new Error(`Missing bundled source: ${path}`)
    files[path] = source
    const importPattern = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s*)["']([^"']+)["']/g
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1]
      if (specifier.startsWith('@/') || specifier.startsWith('.')) {
        const base = normalize(
          specifier.startsWith('@/')
            ? `src/${specifier.slice(2)}`
            : `${path.slice(0, path.lastIndexOf('/'))}/${specifier}`,
        )
        const target = [
          base,
          `${base}.tsx`,
          `${base}.ts`,
          `${base}/index.tsx`,
          `${base}/index.ts`,
        ].find((candidate) => candidate in bundled)
        if (!target) throw new Error(`Missing local dependency: ${specifier} imported by ${path}`)
        include(target)
      } else if (!specifier.startsWith('node:')) {
        const parts = specifier.split('/')
        deps.add(specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0])
      }
    }
  }
  for (const name of used) include(`src/components/ui/${name}.tsx`)
  const dev = [
    'typescript',
    'vite',
    '@vitejs/plugin-react',
    '@tailwindcss/vite',
    '@types/react',
    '@types/react-dom',
    '@types/node',
  ]
  const versions = (names: Iterable<string>) =>
    Object.fromEntries(
      [...names].map((n) => {
        if (!assets.versions[n]) throw new Error(`Missing locked version: ${n}`)
        return [n, assets.versions[n]]
      }),
    )
  Object.assign(files, {
    'package.json': JSON.stringify(
      {
        name: 'opencomponent-export',
        version: '1.0.0',
        private: true,
        type: 'module',
        scripts: {
          dev: 'vite --host 127.0.0.1',
          build: 'tsc --noEmit && vite build',
          preview: 'vite preview --host 127.0.0.1',
        },
        dependencies: versions(deps),
        devDependencies: versions(dev),
      },
      null,
      2,
    ),
    'index.html': `<!doctype html><html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${doc.name.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;' })[c]!)}</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>`,
    'src/App.tsx': app,
    'src/main.tsx': `import {createRoot} from 'react-dom/client'\nimport App from './App'\nimport './styles.css'\ncreateRoot(document.getElementById('root')!).render(<App/>)\n`,
    'src/styles.css': `${assets.projectCss}\n:root{${Object.entries(themeVariables(doc.design))
      .map(([k, v]) => `${k}:${v}`)
      .join(
        ';',
      )}}\nbody{margin:0} .render-surface{min-height:100vh} .oc-stack>.child-flow{min-width:0} .oc-stack{flex-direction:column}\n${styles.join('\n')}\n`,
    'src/lib/utils.ts': assets.utils,
    'src/lib/portal.tsx': assets.portal,
    'tsconfig.json': JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2022',
          lib: ['ES2022', 'DOM', 'DOM.Iterable'],
          module: 'ESNext',
          moduleResolution: 'Bundler',
          jsx: 'react-jsx',
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          esModuleInterop: true,
          baseUrl: '.',
          paths: { '@/*': ['src/*'] },
        },
        include: ['src', 'vite.config.ts'],
      },
      null,
      2,
    ),
    'vite.config.ts': `import {defineConfig} from 'vite'\nimport react from '@vitejs/plugin-react'\nimport tailwindcss from '@tailwindcss/vite'\nimport {fileURLToPath,URL} from 'node:url'\nexport default defineConfig({plugins:[react(),tailwindcss()],resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}}})\n`,
    'Design.md': toDesignMarkdown(doc.design),
    'project.opencomponent.json': JSON.stringify(doc, null, 2),
    'THIRD_PARTY_LICENSES.txt': assets.licenses,
    LICENSE: assets.projectLicense,
    NOTICE: assets.projectNotice,
    'README.md': `# ${doc.name.replace(/[\r\n]/g, ' ')}\n\nReact screens exported from OpenComponent.\n\n## Run\n\nUse Node.js 22 or later. Run \`npm install\`, then \`npm run dev\`. Run \`npm run build\` to validate and build.\n\nEach screen is ordinary JSX in src/screens/. src/App.tsx selects screens using the URL hash; no navigation is inserted into your design.\n\n${screens.map((screen) => `- ${screen.name.replace(/[\r\n]/g, ' ')}: \`#/screen/${encodeURIComponent(screen.id)}\` (src/screens/${screen.component}.tsx)`).join('\n')}\n\nLocal interactions are included; connect your own APIs for persistence. Components and theme CSS are included. There is no OpenComponent runtime dependency.\n\nDesign.md records the design settings at export. Edit src/styles.css to change the running app, or re-import project.opencomponent.json into OpenComponent and export again. Design.md is not a live compiler in the exported app.\n\nFont names use the device's installed fonts; bundle font assets for consistent deployment.\n\nSee LICENSE and NOTICE for OpenComponent-supplied code, and THIRD_PARTY_LICENSES.txt for upstream component notices. These files do not assign a license to your own content or assets. Retain applicable notices when distributing the included code.\n`,
    '.gitignore': 'node_modules/\ndist/\n',
  })
  return files
}
