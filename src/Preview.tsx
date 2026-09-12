import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Monitor, Smartphone, Tablet } from 'lucide-react'
import { getActiveScreen, type ProjectDocument } from './core/model'

/** The iframe owns its React/DOM runtime. Only a snapshot crosses the boundary. */
export function Preview({
  document: doc,
  screenId,
  onClose,
}: {
  document: ProjectDocument
  screenId: string
  onClose: () => void
}) {
  const [active, setActive] = useState(screenId)
  const [width, setWidth] = useState<number | 'auto'>('auto')
  const [viewport, setViewport] = useState(0)
  const [ready, setReady] = useState(false)
  const iframe = useRef<HTMLIFrameElement>(null)
  const back = useRef<HTMLButtonElement>(null)
  const screen = getActiveScreen(doc, active)
  const send = useCallback(
    () =>
      iframe.current?.contentWindow?.postMessage(
        { type: 'opencomponent:preview:document', document: doc, screenId: screen.id },
        location.origin,
      ),
    [doc, screen.id],
  )
  useEffect(() => {
    back.current?.focus()
  }, [])
  useEffect(() => {
    const receive = (event: MessageEvent) => {
      if (event.origin !== location.origin || event.source !== iframe.current?.contentWindow) return
      if (event.data?.type === 'opencomponent:preview:ready') {
        setReady(true)
        send()
      }
      if (event.data?.type === 'opencomponent:preview:viewport') setViewport(event.data.width)
      if (event.data?.type === 'opencomponent:preview:close') onClose()
    }
    window.addEventListener('message', receive)
    return () => window.removeEventListener('message', receive)
  }, [send, onClose])
  useEffect(() => {
    if (ready) send()
  }, [ready, send])
  return (
    <section className="preview-window" aria-label="Project preview">
      <header className="preview-toolbar">
        <button ref={back} className="button subtle" onClick={onClose}>
          <ArrowLeft size={16} />
          Back to editor
        </button>
        <select
          aria-label="Preview screen"
          value={screen.id}
          onChange={(e) => setActive(e.target.value)}
        >
          {doc.screens.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
        <span
          className="preview-label"
          title="Interactions are temporary. Saved screen properties stay unchanged."
        >
          Preview · {doc.design.mode === 'dark' ? 'Dark' : 'Light'} · {viewport}px
        </span>
        <div className="preview-sizes" aria-label="Preview viewport">
          <button aria-pressed={width === 'auto'} onClick={() => setWidth('auto')}>
            Auto
          </button>
          {[
            { width: 375, Icon: Smartphone },
            { width: 768, Icon: Tablet },
            { width: 1280, Icon: Monitor },
          ].map((item) => (
            <button
              key={item.width}
              aria-label={`Preview ${item.width}px`}
              aria-pressed={width === item.width}
              onClick={() => setWidth(item.width)}
            >
              <item.Icon size={15} />
              {item.width}
            </button>
          ))}
        </div>
      </header>
      <div className="preview-stage">
        <iframe
          ref={iframe}
          title="Interactive screen preview"
          src={`${import.meta.env.BASE_URL}preview.html`}
          onLoad={send}
          style={{ width: width === 'auto' ? '100%' : width }}
        />
      </div>
    </section>
  )
}
