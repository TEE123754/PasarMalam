import { useState, type FormEvent } from 'react'
import { NavLink } from 'react-router'
import { ArrowLeft, LogIn, UserPlus } from 'lucide-react'
import { ui } from '../locales/phrases'
import './HawkerLogin.css'

// Fictional gate between the customer and hawker sides. Nothing typed here is read, checked,
// sent or stored: any submit simply continues into the demo hawker workspace.
export function HawkerLogin({ onEnter }: { onEnter: () => void }) {
  const [tab, setTab] = useState<'login' | 'signup'>('login')
  function submit(event: FormEvent) { event.preventDefault(); onEnter() }
  return <div className="hawker-login">
    <section className="hawker-login-card" aria-labelledby="hawker-login-title">
      <span className="hawker-login-mark" aria-hidden="true"><img src="/brand/pasarmalam-mark.png" alt="" width="52" height="52"/></span>
      <h1 id="hawker-login-title">{ui('Hawker workspace')}</h1>
      <p className="hawker-login-lead">{ui('Log in or create a stall account to manage batches, offers and alerts.')}</p>
      <div className="hawker-login-tabs" role="tablist" aria-label={ui('Account')}>
        <button type="button" role="tab" id="hawker-tab-login" aria-selected={tab === 'login'} aria-controls="hawker-login-form" className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>{ui('Log in')}</button>
        <button type="button" role="tab" id="hawker-tab-signup" aria-selected={tab === 'signup'} aria-controls="hawker-login-form" className={tab === 'signup' ? 'active' : ''} onClick={() => setTab('signup')}>{ui('Sign up')}</button>
      </div>
      {/* autoComplete off: a fake form should never prompt the browser to save a password */}
      <form id="hawker-login-form" role="tabpanel" aria-labelledby={tab === 'login' ? 'hawker-tab-login' : 'hawker-tab-signup'} className="hawker-login-form" autoComplete="off" onSubmit={submit} key={tab}>
        {tab === 'signup' && <label>{ui('Stall or hawker name')}<input type="text" autoComplete="off" placeholder={ui('e.g. Bara Senja')}/></label>}
        <label>{ui('Email or phone')}<input type="text" autoComplete="off" inputMode="email" placeholder={ui('you@example.com or 012-345 6789')}/></label>
        <label>{ui('Password')}<input type="password" autoComplete="off" placeholder={ui('Any value works in the demo')}/></label>
        <button type="submit" className="button primary">{tab === 'login' ? <><LogIn size={18}/>{ui('Log in')}</> : <><UserPlus size={18}/>{ui('Create account')}</>}</button>
      </form>
      <p className="hawker-login-disclaimer">{ui('Demo only — no real account is created, no credentials are checked or stored. Don’t enter a real password.')}</p>
      <NavLink className="hawker-login-back" to="/discover"><ArrowLeft size={16}/>{ui('Back to customer side')}</NavLink>
    </section>
  </div>
}
