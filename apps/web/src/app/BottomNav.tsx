import { NavLink, useLocation } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Bell, FileText, Home, UserRound } from 'lucide-react'
import type { PersonaRole } from '../data/types'

const customerItems = [
  { to: '/discover', label: 'discover', icon: Home },
  { to: '/saved', label: 'saved', icon: FileText },
  { to: '/offers', label: 'offers', icon: Bell },
  { to: '/profile', label: 'profile', icon: UserRound },
] as const
const hawkerItems = [
  { to: '/hawker/dashboard', label: 'dashboard', icon: Home },
  { to: '/hawker/batches', label: 'batches', icon: FileText },
  { to: '/hawker/alerts', label: 'alerts', icon: Bell },
  { to: '/profile', label: 'profile', icon: UserRound },
] as const

export function BottomNav({ role }: { role: PersonaRole }) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const items = role === 'customer' ? customerItems : hawkerItems
  const activeIndex = items.findIndex(({ to }) => pathname === to || pathname.startsWith(`${to}/`))
  return <nav className="bottom-nav" data-active={activeIndex < 0 ? 'none' : activeIndex} aria-label={t('mainNavigation')}>
    <div className="bottom-nav-surface"/>
    {items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `bottom-nav-link ${isActive ? 'active' : ''}`}>
      <Icon size={21} aria-hidden="true"/>
      <span>{t(label)}</span>
    </NavLink>)}
  </nav>
}
