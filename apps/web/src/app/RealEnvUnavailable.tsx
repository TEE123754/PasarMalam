import { ArrowRight, Sparkles } from 'lucide-react'
import { ui } from '../locales/phrases'
import './RealEnvUnavailable.css'

// Shown on normal (non-demo) routes when no verified real data environment is reachable,
// e.g. a frontend-only deployment. Points visitors at the matching side of the demo.
export function RealEnvUnavailable({ hawker }: { hawker: boolean }) {
  const primary = hawker ? '/demo/hawker/dashboard' : '/demo/discover'
  const secondary = hawker ? { to: '/demo/discover', label: ui('Customer demo') } : { to: '/demo/hawker/login', label: ui('Hawker demo') }
  return <section className="real-env-card" aria-labelledby="real-env-title">
    <span className="real-env-mark" aria-hidden="true"><img src="/brand/pasarmalam-mark.png" alt="" width="52" height="52"/></span>
    <h1 id="real-env-title">{ui('The live app isn’t connected here yet')}</h1>
    <p>{ui('This deployment runs without its backend, so real accounts and live market data aren’t available. The full product is ready to try in the demo.')}</p>
    <div className="real-env-actions">
      <a className="button primary" href={primary}><Sparkles size={18}/>{ui('Open the live demo')}<ArrowRight size={18}/></a>
      <a className="button secondary" href={secondary.to}>{secondary.label}</a>
    </div>
    <p className="real-env-note">{ui('Demo mode uses fictional, browser-local data.')}</p>
  </section>
}
