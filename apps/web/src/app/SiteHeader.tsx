import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Store, UserRound, type LucideIcon } from 'lucide-react'
import type { AppMode, PersonaRole } from '../data/types'
import { ui } from '../locales/phrases'
import { nativeDemoBuild } from '../native/policy'
import { DemoDialog } from './DemoDialog'

export type NavItem = { readonly to: string; readonly label: string; readonly icon: LucideIcon }

// One header for both sides of the app: the customer and hawker views differ only in their links
// and in which side the primary button switches to, so the two can't drift apart.
// hideRoleSwitch: on the hawker login gate the switch would only point back at the page itself
export function SiteHeader({ mode, role, links, onCustomerRoute, onRole, hideRoleSwitch = false }: { mode: AppMode; role: PersonaRole; links: readonly NavItem[]; onCustomerRoute: boolean; onRole: (next: PersonaRole) => void; hideRoleSwitch?: boolean }) {
  const { t } = useTranslation()
  return <header className="site-header">
    <NavLink className="brand" to="/discover"><span className="brand-mark"><img src="/brand/pasarmalam-mark.png" alt="" width="45" height="45"/></span><span>Pasar<span>Malam</span><small>{t('tagline')}</small></span></NavLink>
    <nav className="desktop-nav" aria-label={t('mainNavigation')}>{links.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/>{t(label)}</NavLink>)}</nav>
    <div className="header-actions">
      {mode === 'connected' ? <DemoDialog/> : !nativeDemoBuild() && <a className="button secondary" href="/"><Store size={18}/>{ui('Home')}</a>}
      {mode === 'connected' && <NavLink className="button secondary" to="/profile"><UserRound size={18}/>{t('profile')}</NavLink>}
      {mode === 'fixture' && !hideRoleSwitch && (role === 'hawker'
        ? <button className="button primary hawker-pill" onClick={() => onRole('customer')}>{ui('Are you a customer?')}</button>
        : onCustomerRoute
          ? <button className="button primary hawker-pill" onClick={() => onRole('hawker')}>{ui('Are you a hawker?')}</button>
          : <div className="role-switch" role="group" aria-label={ui('Switch workspace')}><button className="active" onClick={() => onRole('customer')}><UserRound size={15}/>{t('customer')}</button><button onClick={() => onRole('hawker')}><Store size={15}/>{t('hawker')}</button></div>)}
    </div>
  </header>
}
