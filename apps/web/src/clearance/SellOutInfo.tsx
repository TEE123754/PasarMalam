import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { CircleHelp, Clock3 } from 'lucide-react'
import { ui } from '../locales/phrases'
import { formatSellOutWindow, type ClearancePrediction } from './prediction'
import './SellOutInfo.css'

const GAP = 8, EDGE = 12, WIDTH = 288

// "?" beside the sell-out time. The bubble is portalled to <body> and positioned from the button's
// rectangle, so neither a card's overflow nor a scrolling row can clip it, and it is clamped on screen.
// Opens on mouse hover and keyboard focus, toggles on tap; Escape or a tap outside closes it.
export function SellOutHelp() {
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)
  const bubble = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const id = useId()

  const place = useCallback(() => {
    const trigger = button.current, node = bubble.current
    if (!trigger || !node) return
    const rect = trigger.getBoundingClientRect()
    const viewportWidth = document.documentElement.clientWidth
    const width = Math.min(WIDTH, viewportWidth - EDGE * 2)
    node.style.width = `${width}px`
    const height = node.offsetHeight
    const left = Math.max(EDGE, Math.min(rect.left + rect.width / 2 - width / 2, viewportWidth - EDGE - width))
    const above = rect.top - GAP - height >= EDGE
    const top = Math.max(EDGE, Math.min(above ? rect.top - GAP - height : rect.bottom + GAP, window.innerHeight - EDGE - height))
    node.style.left = `${left}px`
    node.style.top = `${top}px`
    node.style.visibility = 'visible'
  }, [])

  useLayoutEffect(() => {
    if (!open) return
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => { window.removeEventListener('scroll', place, true); window.removeEventListener('resize', place) }
  }, [open, place])

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      const target = event.target as Node
      if (!button.current?.contains(target) && !bubble.current?.contains(target)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', escape)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape) }
  }, [open])

  useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  const hover = (event: ReactPointerEvent) => {
    if (event.pointerType !== 'mouse') return
    window.clearTimeout(closeTimer.current)
    setOpen(true)
  }
  // A short grace period lets the pointer cross the gap between the icon and the bubble
  const leave = (event: ReactPointerEvent) => {
    if (event.pointerType !== 'mouse') return
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => { if (!button.current?.matches(':focus-visible')) setOpen(false) }, 150)
  }

  return <>
    <button type="button" ref={button} className="sellout-help" aria-label={ui('About this sell-out estimate')} aria-expanded={open} aria-describedby={open ? id : undefined}
      onPointerEnter={hover} onPointerLeave={leave}
      onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setOpen(true) }}
      onBlur={event => { if (!bubble.current?.contains(event.relatedTarget as Node | null)) setOpen(false) }}
      onClick={event => { const mouse = (event.nativeEvent as PointerEvent).pointerType === 'mouse'; setOpen(current => mouse ? true : !current) }}>
      <CircleHelp size={20} aria-hidden="true"/>
    </button>
    {open && createPortal(
      <div ref={bubble} id={id} role="tooltip" className="sellout-bubble" style={{ visibility: 'hidden' }} onPointerEnter={hover} onPointerLeave={leave}>
        <strong>{ui('Selling fast tonight')}</strong>
        <span>{ui('Estimated based on today’s stock. Full menu price.')}</span>
      </div>, document.body)}
  </>
}

// The one place a card shows an estimate: a label (not a link) holding the real window, plus the "?".
// Each time keeps its AM/PM attached, so a narrow card wraps at the dash, never inside a time.
export function SellOutPill({ prediction, locale }: { prediction: ClearancePrediction; locale: string }) {
  return <span className="sellout-line"><span className="sellout-pill"><Clock3 size={16} aria-hidden="true"/><span>{ui('Estimated sell-out: {time}', { time: formatSellOutWindow(prediction.windowStart, locale).replace(/ (AM|PM|PG|PTG)/g, '\u00a0$1') })}</span></span><SellOutHelp/></span>
}
