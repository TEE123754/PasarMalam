import { useState, type FormEvent } from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { LockKeyhole } from 'lucide-react'
import { useAuth } from './context'
import { RegistrationPanel } from './RegistrationPanel'
import { getAuthClient } from './client'
import { appPath } from '../app/config'
import { ui } from '../locales/phrases'
import { ProfileEditor } from './ProfileEditor'

export function AuthCard() {
  const { t } = useTranslation()
  const auth = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [resetNotice, setResetNotice] = useState('')
  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setFailed(false)
    try { setFailed(!await auth.signIn(email, password)); setPassword('') }
    catch { setFailed(true) }
    finally { setBusy(false) }
  }
  async function resetPassword() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setResetNotice(ui('Enter your email above, then choose Forgot password.')); return }
    setBusy(true); setResetNotice('')
    try {
      const client = getAuthClient(); if (!client) throw new Error('Unavailable')
      const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}${appPath('/profile')}` })
      if (error) { setResetNotice(ui(error.code === 'over_email_send_rate_limit' ? 'Too many emails requested. Try again later.' : 'Unable to send the password reset email. Try again later.')); return }
      setResetNotice(ui('If this email has an account, a password reset link is on its way. Click the button in that email.'))
    } catch { setResetNotice(ui('Unable to send the password reset email. Try again later.')) }
    finally { setBusy(false) }
  }
  return <section className="panel setting-card">
    <div className="feature-icon"><LockKeyhole size={24}/></div><h2>{t('account')}</h2>
    {auth.notice && <p role="alert">{t(auth.notice === 'expired' ? 'sessionExpired' : 'accountUnavailable')}</p>}
    {auth.actor ? <><p>{auth.actor.display_name}</p><p>{t('accountRoles')}: {auth.actor.roles.map(role => t(`role_${role}`)).join(', ')}</p>
      <ProfileEditor key={auth.actor.id} actor={auth.actor}/>
      <button className="button secondary" onClick={() => void auth.signOut()}>{t('signOut')}</button>
      {auth.actor.roles.includes('admin') && <NavLink className="button secondary" to="/admin">{t('admin')}</NavLink>}</>
      : !auth.configured ? <p>{t('authConfiguration')}</p>
      : <form className="auth-form" onSubmit={event => void submit(event)}>
        <p>{ui('Sign in, or create a customer account below.')}</p>
        <label htmlFor="auth-email">{t('email')}</label><input id="auth-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)}/>
        <label htmlFor="auth-password">{t('password')}</label><input id="auth-password" type="password" autoComplete="current-password" required minLength={12} value={password} onChange={event => setPassword(event.target.value)}/>
        {failed && <p role="alert">{t('signInFailed')}</p>}
        <button className="button primary" disabled={busy || auth.status === 'loading'}>{t(busy ? 'signingIn' : 'signIn')}</button>
        <button type="button" className="button secondary" disabled={busy} onClick={() => void resetPassword()}>{ui('Forgot password')}</button>
        {resetNotice && <p role="status">{resetNotice}</p>}
      </form>}
    {(!auth.actor || auth.recovery) && auth.configured && <RegistrationPanel/>}
  </section>
}

export function RoleGate({ required, children }: { required: 'vendor' | 'admin'; children: React.ReactNode }) {
  const { t } = useTranslation()
  const auth = useAuth()
  if (auth.status === 'loading') return <div className="panel state-panel" role="status">{t('loading')}</div>
  if (!auth.actor || !auth.actor.roles.includes(required)) return <div className="panel state-panel">
    <LockKeyhole/><h2>{t('accessDenied')}</h2><p>{t('trustedRoleOnly')}</p>
    <NavLink className="button primary" to="/profile">{t('profile')}</NavLink>
  </div>
  return <>{children}</>
}
