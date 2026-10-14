import { useEffect, type ElementType } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ArrowRight, Sparkles, Mic, MapPin, Clock3, Leaf, Store } from 'lucide-react'
import { ui } from '../locales/phrases'
import { openDemo } from './config'
import './DemoDialog.css'

// Each card is a shortcut into the matching part of the demo
const features = [
  { Icon: Mic,    title: 'Just say it',      body: 'List food by voice in BM, English or Manglish.',        path: '/demo/hawker/login', role: 'customer' },
  { Icon: MapPin, title: 'Find your market', body: 'Discover markets and food stalls on the map.',          path: '/demo/discover',     role: 'customer' },
  { Icon: Clock3, title: 'Know your batch',  body: 'See preparation times and advisory countdowns.',        path: '/demo/discover',     role: 'customer' },
  { Icon: Leaf,   title: 'Save a meal',      body: 'Reserve surplus food before its advisory window ends.', path: '/demo/offers',       role: 'customer' },
] as const

const SLIDE_MS = 650 // matches the .65s html.demo-leaving slide-up

// Shared splash markup; Radix Title/Description only work inside a Dialog, so the standalone page uses plain elements
function Splash({ standalone = false }: { standalone?: boolean }) {
  const Title: ElementType = standalone ? 'h1' : Dialog.Title
  const Description: ElementType = standalone ? 'p' : Dialog.Description

  // Back/forward cache can restore this page mid-slide; drop the exit class so it is visible again
  useEffect(() => {
    const restore = (e: PageTransitionEvent) => { if (e.persisted) document.documentElement.classList.remove('demo-leaving') }
    window.addEventListener('pageshow', restore)
    return () => window.removeEventListener('pageshow', restore)
  }, [])

  // Splash sweeps up and off screen, then the demo page rises in (see .arriving in discovery.css)
  function enter(path = '/demo/discover', role: 'customer' | 'hawker' = 'customer') {
    if (document.documentElement.classList.contains('demo-leaving')) return
    document.documentElement.classList.add('demo-leaving')
    // Only Discover plays the rise-in, so only flag the arrival when that is where we're going
    if (path === '/demo/discover') try { sessionStorage.setItem('pasarmalam:arrive-from-landing', 'yes') } catch { /* entrance animation is optional */ }
    setTimeout(() => openDemo(path, role), SLIDE_MS)
  }

  return (
    <div className="splash-stage">
      <div className="splash-hero">
        <Description className="splash-tagline">— {ui("MADE FOR MALAYSIA'S MARKET COMMUNITIES")} —</Description>
        <Title className="splash-title">
          <span className="title-pasar">PASAR</span><span className="title-malam">MALAM</span>
        </Title>
        <div className="splash-entry-actions">
          <button type="button" className="button primary try-demo-btn" onClick={() => enter()}>
            <Sparkles size={18}/>{ui('Explore as customer')}<ArrowRight size={18}/>
          </button>
          <button type="button" className="button secondary splash-hawker-btn" onClick={() => enter('/demo/hawker/login')}>
            <Store size={18}/>{ui('Are you a hawker?')}
          </button>
        </div>
      </div>

      <nav className="splash-features" aria-label={ui('Explore the demo')}>
        {features.map(({ Icon, title, body, path, role }) => (
          <button type="button" className="splash-card" key={title} onClick={() => enter(path, role)}>
            <span className="splash-card-top"><span className="splash-icon"><Icon size={20}/></span><ArrowRight className="splash-arrow" size={18} aria-hidden="true"/></span>
            <span className="splash-card-title">{ui(title)}</span>
            <span className="splash-card-body">{ui(body)}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

/** Root-route splash: the same screen as the dialog, always visible, no trigger or overlay */
export function DemoSplash() {
  return <main className="demo-entry demo-entry-page"><Splash standalone/></main>
}

export function DemoDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="button primary">
        <Sparkles size={17}/>{ui('Try demo')}
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content demo-entry">
          <Splash/>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
