import { useEffect, useLayoutEffect, useRef, useState } from 'react'

export type PagePhase = '' | 'slide-out-up' | 'slide-in-up'

const OUT_MS = 200 // route changes mid-way through the 0.35s exit
const IN_MS = 450

const reducedMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * Slide-up page transitions for in-app navigation.
 * - Internal link clicks inside the app shell are held back, the current page slides out,
 *   then the same click is replayed so React Router (and any onClick) handles it exactly once.
 * - Every pathname change (links, buttons that call navigate(), back/forward) slides the new page in.
 */
export function usePageTransition(pathname: string): PagePhase {
  const [phase, setPhase] = useState<PagePhase>('')
  const replaying = useRef(false)
  const leaving = useRef(false)
  const first = useRef(true)

  // Exit: intercept internal link clicks in capture phase, before React or the router sees them
  useEffect(() => {
    function onClick(event: MouseEvent) {
      if (replaying.current || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const anchor = (event.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!anchor || !anchor.closest('.app-shell') || anchor.target && anchor.target !== '_self' || anchor.hasAttribute('download')) return
      const url = new URL(anchor.href, location.href)
      if (url.origin !== location.origin || url.pathname === location.pathname || reducedMotion()) return
      event.preventDefault()
      event.stopPropagation()
      if (leaving.current) return // ignore rapid repeat clicks while a transition is running
      leaving.current = true
      setPhase('slide-out-up')
      setTimeout(() => {
        replaying.current = true
        try { anchor.click() } finally { replaying.current = false }
        // If the route didn't change (e.g. the link was removed), bring the page back
        setTimeout(() => { if (leaving.current) { leaving.current = false; setPhase('') } }, 60)
      }, OUT_MS)
    }
    window.addEventListener('click', onClick, true)
    return () => window.removeEventListener('click', onClick, true)
  }, [])

  // Enter: every route change slides the new page up into place, then cleans up.
  // Layout effect so the new page never paints a frame with the exit class still on it.
  useLayoutEffect(() => {
    if (first.current) { first.current = false; return }
    leaving.current = false
    if (reducedMotion()) { setPhase(''); return }
    setPhase('slide-in-up')
    const done = setTimeout(() => setPhase(''), IN_MS)
    return () => clearTimeout(done)
  }, [pathname])

  return phase
}
