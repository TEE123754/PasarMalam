import { useState, type FormEvent } from 'react'
import type { Actor } from '../data/api-contract'
import { changeLocale } from '../locales/i18n'
import { ui } from '../locales/phrases'
import { useAuth } from './context'

export function ProfileEditor({ actor }: { actor: Actor }) {
  const auth = useAuth()
  const [name, setName] = useState(actor.display_name)
  const [locale, setLocale] = useState<'en' | 'ms'>(actor.locale)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  async function save(event: FormEvent) {
    event.preventDefault()
    const trimmed = name.trim()
    if (trimmed.length < 2 || trimmed.length > 80) { setMessage('Enter a display name of 2 to 80 characters.'); return }
    setBusy(true); setMessage('')
    const saved = await auth.updateProfile(trimmed, locale)
    if (saved) {
      setName(trimmed)
      await changeLocale(locale)
    }
    setBusy(false)
    setMessage(saved ? 'Profile saved.' : 'Unable to save your profile. Sign in again or retry.')
  }
  return <details><summary>{ui('Edit profile')}</summary>
    <form className="auth-form" onSubmit={event => void save(event)}>
      <label htmlFor="profile-display-name">{ui('Display name')}</label>
      <input id="profile-display-name" autoComplete="nickname" required minLength={2} maxLength={80} disabled={busy} value={name} onChange={event => setName(event.target.value)}/>
      <label htmlFor="profile-language">{ui('Preferred language')}</label>
      <select id="profile-language" disabled={busy} value={locale} onChange={event => setLocale(event.target.value as 'en' | 'ms')}><option value="en">English</option><option value="ms">Bahasa Melayu</option></select>
      <p className="small">{ui('Your profile cannot change your assigned account roles.')}</p>
      <p role="status">{ui(message)}</p>
      <button className="button primary" disabled={busy}>{ui(busy ? 'Saving…' : 'Save profile')}</button>
    </form>
  </details>
}
