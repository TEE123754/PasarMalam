import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Globe, Lock, Mic } from 'lucide-react'
import { changeLocale } from '../locales/i18n'
import { ui } from '../locales/phrases'
import { selectedMode } from '../app/config'
import './HawkerSettings.css'

// Hawker-side language & privacy (linked from My stall). Mirrors what the voice and batch flows
// already do; it doesn't add new data handling.
export function HawkerSettings() {
  const { i18n } = useTranslation()
  const ms = i18n.language.startsWith('ms')
  return <div className="hawker-settings">
    <header className="hawker-settings-hero">
      <span className="eyebrow">{ui('HAWKER WORKSPACE')}</span>
      <h1>{ui('Language & privacy')}</h1>
      <p>{ui('Choose the language for your workspace and see how your voice notes and batch records are handled.')}</p>
    </header>
    <section className="hawker-settings-card" aria-labelledby="hawker-settings-language">
      <h2 id="hawker-settings-language"><Globe size={20}/>{ui('Language')}</h2>
      <p>{ui('Applies to menus, alerts and the voice workflow on this device.')}</p>
      <div className="hawker-settings-segmented" role="group" aria-label={ui('Language')}>
        <button type="button" aria-pressed={!ms} className={!ms ? 'active' : ''} onClick={() => void changeLocale('en')}>English</button>
        <button type="button" aria-pressed={ms} className={ms ? 'active' : ''} onClick={() => void changeLocale('ms')}>Bahasa Melayu</button>
      </div>
    </section>
    <section className="hawker-settings-card" aria-labelledby="hawker-settings-privacy">
      <h2 id="hawker-settings-privacy"><Lock size={20}/>{ui('Privacy')}</h2>
      <ul>
        <li>{ui('Voice notes are deleted after transcription. Keep only the reviewed transcript and confirmed listing details.')}</li>
        <li>{ui('Only a redacted transcript is shared, and only after you agree.')}</li>
        <li>{ui('Every batch keeps its preparation photo and original timestamps in the audit trail.')}</li>
        {selectedMode() === 'fixture' && <li>{ui('In this demo, your changes are saved only in this browser on this device.')}</li>}
      </ul>
      <NavLink className="button secondary" to="/hawker/voice"><Mic size={17}/>{ui('Voice & quick entry')}</NavLink>
    </section>
    <NavLink className="hawker-settings-back" to="/hawker/stall"><ArrowLeft size={16}/>{ui('Back to My stall')}</NavLink>
  </div>
}
