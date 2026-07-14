import { useEffect, useRef, useState, type ReactNode } from 'react'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ModalProps } from '@/types/design-system'

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export function Modal({ open, onClose, title, children, footer }: ModalProps & { footer?: ReactNode }) {
  const [render, setRender] = useState(open)
  const [closing, setClosing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  // Mount/unmount with close animation
  useEffect(() => {
    if (open) {
      setRender(true)
      setClosing(false)
    } else if (render) {
      setClosing(true)
      const t = setTimeout(() => setRender(false), 200)
      return () => clearTimeout(t)
    }
  }, [open, render])

  // Escape to close + body scroll lock
  useEffect(() => {
    if (!render) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [render, onClose])

  // Focus trap: focus first field on open, keep Tab focus inside the panel
  useEffect(() => {
    if (!render || closing) return
    const panel = panelRef.current
    const body = bodyRef.current
    if (!panel || !body) return

    const getFocusable = (root: ParentNode) =>
      Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)

    // Focus the first focusable element inside the body (skips the header close button)
    const bodyEls = getFocusable(body)
    bodyEls[0]?.focus()

    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const list = getFocusable(panel)
      if (list.length === 0) return
      const first = list[0]
      const last = list[list.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    panel.addEventListener('keydown', onTab)
    return () => panel.removeEventListener('keydown', onTab)
  }, [render, closing])

  if (!render) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
          closing ? 'opacity-0' : 'opacity-100',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={panelRef}
        className={cn(
          'relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden glass-strong rounded-radius-xl',
          'shadow-2xl transition-all duration-200',
          closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100 animate-in fade-in zoom-in-95',
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex flex-shrink-0 items-center justify-between border-b border-outline-variant/30 px-6 py-4">
            <h2 className="text-headline-md text-on-surface">{title}</h2>
            <button
              onClick={onClose}
              className="rounded-radius p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/40"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Scrollable Body */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* Sticky Footer */}
        {footer && (
          <div className="flex flex-shrink-0 items-center justify-end gap-3 border-t border-outline-variant/30 bg-surface-container-low/60 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
