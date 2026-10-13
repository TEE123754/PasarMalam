import { useEffect, type ElementType } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { Sparkles, Mic, MapPin, Clock3, Leaf } from 'lucide-react'
import { ui } from '../locales/phrases'
import { openDemo } from './config'
import './DemoDialog.css'

const features = [
  { Icon: Mic,   title: 'Just say it',    body: 'List food by voice in BM, English or Manglish.' },
  { Icon: MapPin, title: 'Find your market', body: 'Discover markets and food stalls on the map.' },
  { Icon: Clock3, title: 'Know your batch', body: 'See preparation times and advisory countdowns.' },
  { Icon: Leaf,  title: 'Save a meal',    body: 'Reserve surplus food before its advisory window ends.' },
]

// Shared splash markup; Radix Title/Description only work inside a Dialog, so the standalone page uses plain elements
function Splash({ standalone = false }: { standalone?: boolean }) {
  const Title: ElementType = standalone ? 'h1' : Dialog.Title
  const Description: ElementType = standalone ? 'p' : Dialog.Description

  // Back/forward cache can restore this page mid-fade; drop the exit class so it is visible again
  useEffect(() => {
    const restore = (e: PageTransitionEvent) => { if (e.persisted) document.documentElement.classList.remove('demo-leaving') }
    window.addEventListener('pageshow', restore)
    return () => window.removeEventListener('pageshow', restore)
  }, [])

  function handleDemo() {
    document.documentElement.classList.add('demo-leaving')
    setTimeout(openDemo, 300) // match the .3s html.demo-leaving fade
  }

  return (
    <>
      <Description className="demo-entry-strip">
        {ui("MADE FOR MALAYSIA'S MARKET COMMUNITIES")}
      </Description>

      <div className="demo-entry-stage">
        <Title className="demo-entry-title">
          Pasar<span>Malam</span>
        </Title>

        <button className="button primary demo-entry-cta" onClick={handleDemo}>
          <Sparkles size={18}/>{ui('Try demo')}
        </button>

        <div className="demo-entry-features">
          {features.map(({ Icon, title, body }) => (
            <article className="demo-entry-card" key={title}>
              <Icon size={16}/>
              <h2>{ui(title)}</h2>
              <p>{ui(body)}</p>
            </article>
          ))}
        </div>
      </div>
    </>
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
