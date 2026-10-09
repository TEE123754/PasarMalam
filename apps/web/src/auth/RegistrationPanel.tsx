import { useState, type FormEvent } from 'react'
import { ui } from '../locales/phrases'
import { appPath } from '../app/config'
import { getAuthClient } from './client'
import { useAuth } from './context'
import { publicRegistrationAllowed, registerCustomer, registrationSchema, verifyRegistration, type ConfirmationType } from './registration'

export function RegistrationPanel() {
  const auth = useAuth()
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [confirmPassword, setConfirmPassword] = useState(''), [name, setName] = useState('')
  const [locale, setLocale] = useState<'en' | 'ms'>('en'), [accepted, setAccepted] = useState(false)
  const [token, setToken] = useState(''), [busy, setBusy] = useState(false), [message, setMessage] = useState('')
  const publicFlag = import.meta.env.VITE_ENABLE_PUBLIC_REGISTRATION === 'true'

  async function signup(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    try {
      const base = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
      const response = await fetch(`${base}/api/v1/config`)
      if (!response.ok) throw new Error('Configuration unavailable')
      const config = await response.json() as { data_environment?: string; registration_policy?: string }
      const client = getAuthClient(); if (!client) throw new Error('Unavailable')
      const value = registrationSchema.parse({ email, password, display_name: name, locale, accepted })
      const result = await registerCustomer(client.auth, value, publicRegistrationAllowed(window.location.pathname, publicFlag, config), `${window.location.origin}${appPath('/profile')}`)
      setPassword('')
      setMessage(ui(result === 'signed-in' ? 'Account created. Signing you in.' : result === 'email' ? 'Check your email and click Confirm email. The link brings you back here. Already registered? Sign in or use Forgot password.' : result === 'disabled' ? 'Account signup is unavailable on this page.' : 'Unable to create an account. Check your details or try again later.'))
    } catch { setPassword(''); setMessage(ui('Unable to create an account. Check your details or try again later.')) }
    finally { setBusy(false) }
  }

  async function savePassword(event: FormEvent) {
    event.preventDefault(); setMessage('')
    if (password.length < 12 || password !== confirmPassword) { setMessage(ui('Use at least 12 characters and enter the same password twice.')); return }
    setBusy(true)
    try {
      const client = getAuthClient(); if (!client) throw new Error('Unavailable')
      const { error } = await client.auth.updateUser({ password })
      if (error) throw new Error('Password unavailable')
      setPassword(''); setConfirmPassword(''); await auth.signOut()
      setMessage(ui('Password saved. Sign in with your email and new password.'))
    } catch { setPassword(''); setConfirmPassword(''); setMessage(ui('Unable to save your password. Request a new password reset email and try again.')) }
    finally { setBusy(false) }
  }

  async function verify(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage('')
    const link = token; setToken('')
    try {
      const client = getAuthClient(); if (!client) throw new Error('Unavailable')
      const type = new URL(link).searchParams.get('type')
      if (!['invite', 'signup', 'recovery'].includes(type ?? '')) throw new Error('Invalid link')
      const result = await verifyRegistration(client.auth, link, type as ConfirmationType, import.meta.env.VITE_SUPABASE_URL)
      if (result !== 'verified') setMessage(ui('This email link expired or was already used. Use Forgot password to request a fresh link.'))
    } catch { setMessage(ui('Unable to verify this email link. Request a fresh link and try again.')) }
    finally { setBusy(false) }
  }

  if (auth.recovery) return <section className="registration-panel"><h3>{ui('Set your password')}</h3><p>{ui('Choose a password, then sign in. Your email is already confirmed.')}</p>{message && <p role="status">{message}</p>}<form className="auth-form" onSubmit={event => void savePassword(event)}><label htmlFor="recovery-password">{ui('Password (at least 12 characters)')}</label><input id="recovery-password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={password} onChange={event => setPassword(event.target.value)}/><label htmlFor="recovery-confirm">{ui('Confirm password')}</label><input id="recovery-confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={128} value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)}/><button className="button primary" disabled={busy}>{ui('Save password')}</button></form></section>

  return <section className="registration-panel">{message && <p role="status">{message}</p>}
    {publicFlag && <details><summary>{ui('Create account')}</summary><p>{ui('Create a customer account. Confirm your email to get started.')}</p><form className="auth-form" onSubmit={event => void signup(event)}><label htmlFor="signup-email">{ui('Email')}</label><input id="signup-email" type="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)}/><label htmlFor="signup-name">{ui('Display name')}</label><input id="signup-name" autoComplete="nickname" required minLength={2} maxLength={80} value={name} onChange={event => setName(event.target.value)}/><label htmlFor="signup-locale">{ui('Language')}</label><select id="signup-locale" value={locale} onChange={event => setLocale(event.target.value as 'en' | 'ms')}><option value="en">English</option><option value="ms">Bahasa Melayu</option></select><label htmlFor="signup-password">{ui('Password (at least 12 characters)')}</label><input id="signup-password" required type="password" autoComplete="new-password" minLength={12} maxLength={128} value={password} onChange={event => setPassword(event.target.value)}/><details><summary>{ui('Registration privacy notice')}</summary><p>{ui('This app currently uses a test environment. Supabase processes account information. Use a fictional display name for testing. Location and microphone access are optional.')}</p></details><label className="choice-row"><input type="checkbox" required checked={accepted} onChange={event => setAccepted(event.target.checked)}/>{ui('I reviewed the privacy notice')}</label><button className="button primary" disabled={busy}>{ui('Create account')}</button></form></details>}
    <details><summary>{ui('Already have an email link?')}</summary><p>{ui('Usually, clicking the button in your email is enough. You can also paste its link here.')}</p><form className="auth-form" onSubmit={event => void verify(event)}><label htmlFor="email-link">{ui('Email confirmation or password reset link')}</label><input id="email-link" required type="url" autoComplete="off" maxLength={2048} value={token} onChange={event => setToken(event.target.value)}/><button className="button secondary" disabled={busy}>{ui('Continue')}</button></form></details>
  </section>
}
