import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { execFileSync } from 'node:child_process'
import { generateProject } from '../src/core/generate'
import {
  createProject,
  createScreen,
  makeNode,
  componentTypes,
  type CanvasNode,
} from '../src/core/model'
import { exportAssets } from './export-assets'
const doc = createProject('Export verification', true)
doc.screens[0].id = 'export-screen-one'
const present = new Set<string>()
const walk = (n: CanvasNode) => {
  present.add(n.type)
  n.children.forEach(walk)
}
walk(doc.screens[0].root)
for (const type of componentTypes)
  if (!present.has(type)) {
    const node = makeNode(type)
    if (type === 'tabs') {
      const child = makeNode('text')
      child.slot = 'General'
      child.props.text = 'Content of General tab'
      const second = makeNode('button')
      second.slot = 'Notifications'
      second.props.text = 'Notification settings'
      node.children = [child, second]
    }
    doc.screens[0].root.children.push(node)
  }
const second = createScreen('Second screen')
second.id = 'export-screen-two'
const title = makeNode('heading')
title.props.text = 'Second screen export verified'
second.root.children = [title, makeNode('input')]
doc.screens.push(second)
doc.design.fontHeading = 'Georgia, serif'
const files = generateProject(doc, exportAssets())
const out = resolve('/private/tmp/opencomponent-export-verify-multiscreen')
for (const [path, source] of Object.entries(files)) {
  const target = resolve(out, path)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, source)
}
console.log(`Exported ${Object.keys(files).length} files to ${out}`)
execFileSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: out, stdio: 'inherit' })
execFileSync('npm', ['run', 'build'], { cwd: out, stdio: 'inherit' })
console.log('Export installs, type-checks, and builds independently.')
