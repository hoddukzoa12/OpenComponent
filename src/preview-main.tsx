import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { NodeView } from './renderer'
import {
  getActiveScreen,
  themeVariables,
  validateProject,
  type ProjectDocument,
} from './core/model'
import { useEditor } from './core/store'
import { ProjectViewport } from './lib/portal'
import './project.css'
import './preview.css'

useEditor.getState().setReadOnly(true)
function PreviewFrame() {
  const [snapshot, setSnapshot] = useState<{ document: ProjectDocument; screenId: string } | null>(
    null,
  )
  const [width, setWidth] = useState(innerWidth)
  useEffect(() => {
    const notify = (message: object) => parent.postMessage(message, location.origin)
    const receive = (event: MessageEvent) => {
      if (
        event.origin !== location.origin ||
        event.source !== parent ||
        event.data?.type !== 'opencomponent:preview:document'
      )
        return
      try {
        const doc = validateProject(event.data.document)
        const screenId = getActiveScreen(doc, event.data.screenId).id
        Object.entries(themeVariables(doc.design)).forEach(([key, value]) =>
          document.body.style.setProperty(key, value),
        )
        document.body.className = `render-surface ${doc.design.mode === 'dark' ? 'dark' : ''}`
        document.title = `${doc.name} · ${getActiveScreen(doc, screenId).name}`
        setSnapshot({ document: doc, screenId })
      } catch {
        /* Keep the last valid snapshot. */
      }
    }
    const resize = () => {
      setWidth(innerWidth)
      notify({ type: 'opencomponent:preview:viewport', width: innerWidth })
    }
    const keys = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.key === 'Escape') notify({ type: 'opencomponent:preview:close' })
      const editable = (event.target as HTMLElement)?.closest(
        'input,textarea,select,[contenteditable="true"]',
      )
      if (
        (!editable && ['Backspace', 'Delete'].includes(event.key)) ||
        ((event.metaKey || event.ctrlKey) && ['d', 's'].includes(event.key.toLowerCase()))
      )
        event.preventDefault()
    }
    window.addEventListener('message', receive)
    window.addEventListener('resize', resize)
    window.addEventListener('keydown', keys)
    notify({ type: 'opencomponent:preview:ready' })
    resize()
    return () => {
      window.removeEventListener('message', receive)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', keys)
    }
  }, [])
  if (!snapshot) return <p className="preview-loading">Loading preview…</p>
  const screen = getActiveScreen(snapshot.document, snapshot.screenId)
  return (
    <ProjectViewport.Provider value={width}>
      <NodeView key={screen.id} node={screen.root} width={width} preview root />
    </ProjectViewport.Provider>
  )
}
createRoot(document.getElementById('root')!).render(<PreviewFrame />)
