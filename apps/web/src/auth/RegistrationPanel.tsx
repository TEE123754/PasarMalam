import { useState, type FormEvent } from 'react'
import { ui } from '../locales/phrases'
import { connectedRequest, getAuthClient } from './client'
import { publicRegistrationAllowed, registerCustomer, registrationSchema, verifyRegistration, type RegistrationResult } from './registration'

const messages: Record<RegistrationResult, string> = {
  email: 'Check your email, or sign in if you already have an account. Confirmation is required.',
  verified: 'Email verified. Complete your customer profile below.',
  expired: 'This invitation or confirmation expired. Ask the organiser for a new invitation.',
  failed: 'Unable to verify or complete registration. Check your details and try again.',
  disabled: 'Public registration is disabled. Ask the organiser for an invitation.',
}
export function RegistrationPanel() {
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [name, setName] = useState('')
  const [locale, setLocale] = useState<'en' | 'ms'>('en'), [accepted, setAccepted] = useState(false)
  const [token, setToken] = useState(''), [kind, setKind] = useState<'invite' | 'signup'>('invite')
  const [verified, setVerified] = useState(false), [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string>('')
  const publicFlag = import.meta.env.VITE_ENABLE_PUBLIC_REGISTRATION === 'true'
  async function configuration() {
    const base = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
    const response = await fetch(`${base}/api/v1/config`)
    if (!response.ok) throw new Error('Configuration unavailable')
    const config = await response.json() as { data_environment?: string; registration_policy?: string }
    const sandbox = /^\/sandbox(?:\/|$)/.test(window.location.pathname)
    if (config.data_environment !== (sandbox ? 'disposable-demo' : 'production')) throw new Error('Wrong account environment')
    return config
  }
  async function verify(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      await configuration()
      const client = getAuthClient(); if (!client) throw new Error('Unavailable')
      const result = await verifyRegistration(client.auth, token, kind)
      setToken(''); setVerified(result === 'verified'); setMessage(ui(messages[result]))
    } catch { setMessage(ui(messages.failed)) } finally { setBusy(false) }
  }
  async function complete(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      const config = await configuration(), client = getAuthClient()
      if (!client) throw new Error('Unavailable')
      const value = registrationSchema.parse({ email: verified ? 'invited@pasarmalam.invalid' : email, password, display_name: name, locale, accepted })
      if (!verified) {
        const result = await registerCustomer(client.auth, value, publicRegistrationAllowed(window.location.pathname, publicFlag, config))
        setPassword(''); setMessage(ui(messages[result])); return
      }
      const response = await connectedRequest('/api/v1/me/onboard', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ display_name: value.display_name, locale: value.locale, accepted: true }) })
      if (!response.ok) throw new Error('Profile unavailable')
      const { error } = await client.auth.updateUser({ password: value.password })
      if (error) throw new Error('Password unavailable')
      setPassword(''); await client.auth.signOut({ scope: 'local' }); setVerified(false)
      setMessage(ui('Customer profile created. Sign in with your confirmed email and password. Vendor access requires approval.'))
    } catch { setPassword(''); setMessage(ui(messages.failed)) } finally { setBusy(false) }
  }
  return <details className="registration-panel"><summary>{ui('New account or invitation')}</summary><p>{ui(messages.disabled)}</p><p className="small muted">{ui('Accounts start as customers. Switching the interface cannot grant vendor or organiser access.')}</p>
    {message && <p role="status">{message}</p>}
    {!verified && <form className="auth-form" onSubmit={event => void verify(event)}><label>{ui('Email link type')}<select value={kind} onChange={event => setKind(event.target.value as 'invite' | 'signup')}><option value="invite">{ui('Invitation')}</option><option value="signup">{ui('Registration confirmation')}</option></select></label><label>{ui('Confirmation token from your email')}<input required autoComplete="off" value={token} onChange={event => setToken(event.target.value)} minLength={32} maxLength={2048}/></label><p className="small">{ui('Use the token_hash value from the email link. It stays in memory and is cleared after verification; never share it.')}</p><button className="button secondary" disabled={busy}>{ui('Verify email link')}</button></form>}
    {(verified || publicFlag) && <form className="auth-form" onSubmit={event => void complete(event)}>{!verified && <label>{ui('Email')}<input type="email" required value={email} onChange={event => setEmail(event.target.value)}/></label>}<label>{ui('Display name')}<input required minLength={2} maxLength={80} value={name} onChange={event => setName(event.target.value)}/></label><label>{ui('Language')}<select value={locale} onChange={event => setLocale(event.target.value as 'en' | 'ms')}><option value="en">English</option><option value="ms">Bahasa Melayu</option></select></label><label>{ui('Password (at least 12 characters)')}<input required type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={event => setPassword(event.target.value)}/></label><details><summary>{ui('Registration privacy notice')}</summary><p>{ui('Supabase processes account and listing data. Only confirmed transcripts are retained for up to 30 days; audio is deleted after transcription. Morpheus receives redacted text only after separate consent. Public stall declarations are voluntary and removable. Shopper location is opt-in and coarse. This fictional sandbox is not approved for real participant data.')}</p></details><label className="choice-row"><input type="checkbox" required checked={accepted} onChange={event => setAccepted(event.target.checked)}/>{ui('I reviewed the privacy notice')}</label><button className="button primary" disabled={busy}>{ui(verified ? 'Complete customer profile' : 'Create customer account')}</button></form>}
  </details>
}
