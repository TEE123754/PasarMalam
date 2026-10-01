import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDiscovery } from '../discovery/useDiscovery'
import { eligibleOffers } from '../discovery/engine'
import { DiscoveryPage, DiscoveryDetail, SavedPage, useNow } from '../discovery/DiscoveryPage'
import * as Dialog from '@radix-ui/react-dialog'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Bell, Clock3, Compass, Heart, LayoutDashboard,
  Menu, Mic2, Moon, ShieldCheck, Sparkles, Store,
  Tag, UserRound, Volume2, X,
} from 'lucide-react'
import { changeLocale } from '../locales/i18n'
import { selectedMode, useSampleMode } from './config'
import { closingScenarioTimestamp, fixtureClock, systemClock } from './clock'
import { fixtureGateway } from '../data/fixture'
import { connectedGateway } from '../data/connected'
import { ScenarioControls } from '../integrations/ScenarioControls'
import { AuthCard, RoleGate } from '../auth/AuthCard'
import { useAuth } from '../auth/context'
import type { DataGateway, DemoOffer, DiscoverySnapshot, PersonaRole } from '../data/types'

const customerLinks = [
  { to: '/discover', label: 'discover', icon: Compass },
  { to: '/offers', label: 'offers', icon: Tag },
  { to: '/saved', label: 'saved', icon: Heart },
  { to: '/profile', label: 'profile', icon: UserRound },
] as const
const hawkerLinks = [
  { to: '/hawker/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { to: '/hawker/stall', label: 'stall', icon: Store },
  { to: '/hawker/batches', label: 'batches', icon: Menu },
  { to: '/hawker/promotions', label: 'promotions', icon: Tag },
  { to: '/hawker/alerts', label: 'alerts', icon: Bell },
] as const

function Content({ gateway, children }: { gateway: DataGateway; children: (data: DiscoverySnapshot) => React.ReactNode }) {
  const { t } = useTranslation()
  const query = useDiscovery(gateway)
  if (query.isPending) return <div className="panel state-panel" role="status"><Sparkles /><p>{t('loading')}</p></div>
  if (query.isError) return <div className="panel state-panel" role="alert"><span className="state-icon">!</span><h2>{t('errorTitle')}</h2><p>{t(gateway.mode === 'connected' ? 'connectedUnavailable' : 'requestUnavailable')}</p><div className="button-row"><button className="button secondary" onClick={() => void query.refetch()}>{t('tryAgain')}</button>{gateway.mode === 'connected' && <button className="button primary" onClick={useSampleMode}>{t('openSample')}</button>}</div></div>
  return <>{children(query.data)}</>
}

function EmptyState() {
  const { t } = useTranslation()
  return <div className="panel state-panel"><h3>{t('noMatches')}</h3><p>{t('relaxFilters')}</p></div>
}

function Offers({ gateway }: { gateway: DataGateway }) {
  const { t } = useTranslation()
  const now = useNow(gateway)
  return <><PageIntro eyebrow={t('offers')} title={t('offersTitle')} body={t('offersBody')}/><Content gateway={gateway}>{data => <div className="offer-grid">{eligibleOffers(data,now).length ? eligibleOffers(data,now).map((offer: DemoOffer) => { const stall = data.stalls.find(s => s.id === offer.stallId); return <NavLink className="offer-card card-link" to={`/stalls/${offer.stallId}`} key={offer.id}><div className="offer-icon">{stall?.image || '🍴'}</div><div><span className="eyebrow">{stall?.name}</span><h3>{offer.title}</h3><p className="muted"><Clock3 size={14}/> {offer.endsAt}</p></div><div className="offer-price"><strong>RM {(offer.priceSen/100).toFixed(2)}</strong><s>RM {(offer.originalPriceSen/100).toFixed(2)}</s></div></NavLink> }) : <EmptyState/>}</div>}</Content></>
}

function PageIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <header className="page-intro"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{body}</p></header>
}

function InfoPage({ label, title, body, icon: Icon }: { label: string; title: string; body: string; icon: typeof Store }) {
  const { t } = useTranslation()
  return <><PageIntro eyebrow={label} title={title} body={body}/><div className="info-grid"><div className="panel info-panel"><div className="feature-icon"><Icon size={28}/></div><h2>{t('availableSoon')}</h2><p>{body}</p></div><div className="panel values-panel"><div className="mini-label">PASARMALAM</div><h2>{t('basicFree')}</h2><p>{t('noLocation')}</p><div className="decorative-line" /></div></div></>
}

function ProtectedInfoPage({ required, ...props }: React.ComponentProps<typeof InfoPage> & { required: 'vendor' | 'admin' }) {
  const { t } = useTranslation()
  if (selectedMode() === 'fixture') return <InfoPage {...props}/>
  const content = required === 'admin' ? { ...props, title: t('adminWorkspaceTitle'), body: t('adminWorkspaceBody') } : props
  return <RoleGate required={required}><InfoPage {...content}/></RoleGate>
}

function PrivacyDialog() {
  const { t } = useTranslation()
  const [location, setLocation] = useState(localStorage.getItem('pasarmalam:location-choice') === 'yes')
  const [microphone, setMicrophone] = useState(localStorage.getItem('pasarmalam:microphone-choice') === 'yes')
  function choose(key: string, value: boolean) { localStorage.setItem(`pasarmalam:${key}-choice`, value ? 'yes' : 'no'); if (key === 'location') setLocation(value); else setMicrophone(value) }
  return <Dialog.Root><Dialog.Trigger className="button secondary"><ShieldCheck size={18}/>{t('privacy')}</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Close className="dialog-close" aria-label={t('close')}><X size={22}/></Dialog.Close><Dialog.Title>{t('privacy')}</Dialog.Title><Dialog.Description>{t('privacyBody')}</Dialog.Description><label className="choice-row"><span>{t('locationChoice')}</span><input type="checkbox" checked={location} onChange={e => choose('location',e.target.checked)}/></label><label className="choice-row"><span>{t('microphoneChoice')}</span><input type="checkbox" checked={microphone} onChange={e => choose('microphone',e.target.checked)}/></label><p className="muted small">{t('settingSaved')}</p></Dialog.Content></Dialog.Portal></Dialog.Root>
}

function Profile({ mode }: { mode: 'fixture' | 'connected' }) {
  const { t, i18n } = useTranslation()
  const cache = useQueryClient()
  const [scenario, setScenario] = useState(fixtureClock.scenario())
  const clock = mode === 'fixture' ? fixtureClock : systemClock
  function updateClock(value: string) { const next = value === 'closing' ? closingScenarioTimestamp() : null; clock.setScenario(next); setScenario(next); void cache.invalidateQueries({queryKey:['discovery','fixture']}) }
  function readAloud() { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(t('profileBody')); speech.lang = i18n.language === 'ms' ? 'ms-MY' : 'en-MY'; window.speechSynthesis.speak(speech) } }
  return <><PageIntro eyebrow={t('profile')} title={t('profileTitle')} body={t('profileBody')}/><div className="settings-grid">{mode === 'connected' && <AuthCard/>}<div className="panel setting-card"><div className="feature-icon"><UserRound size={24}/></div><h2>{t('language')}</h2><div className="segmented" role="group" aria-label={t('language')}><button className={i18n.language === 'en' ? 'active' : ''} onClick={() => void changeLocale('en')}>English</button><button className={i18n.language === 'ms' ? 'active' : ''} onClick={() => void changeLocale('ms')}>Bahasa Melayu</button></div></div><div className="panel setting-card"><div className="feature-icon"><ShieldCheck size={24}/></div><h2>{t('privacy')}</h2><p>{t('privacyBody')}</p><PrivacyDialog/></div><div className="panel setting-card"><div className="feature-icon"><Volume2 size={24}/></div><h2>{t('readAloud')}</h2><button className="button secondary" onClick={readAloud}><Volume2 size={17}/>{t('readAloud')}</button></div>{mode === 'fixture' && <div className="panel setting-card"><div className="feature-icon"><Clock3 size={24}/></div><h2>{t('scenarioTime')}</h2><p>{new Intl.DateTimeFormat(i18n.language === 'ms' ? 'ms-MY' : 'en-MY',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kuala_Lumpur'}).format(clock.now())}</p><div className="segmented" role="group" aria-label={t('scenarioTime')}><button className={!scenario ? 'active' : ''} onClick={() => updateClock('current')}>{t('useCurrentTime')}</button><button className={scenario ? 'active' : ''} onClick={() => updateClock('closing')}>{t('useClosingTime')}</button></div></div>}{mode === 'fixture' && <ScenarioControls/>}</div></>
}

export default function App() {
  const { t } = useTranslation()
  const mode = selectedMode()
  const gateway = mode === 'fixture' ? fixtureGateway : connectedGateway
  const navigate = useNavigate()
  const [fixtureRole, setRole] = useState<PersonaRole>(() => mode === 'fixture' && localStorage.getItem('pasarmalam:role') === 'hawker' ? 'hawker' : 'customer')
  const { actor } = useAuth()
  const role = mode === 'fixture' ? fixtureRole : actor?.roles.includes('vendor') ? 'hawker' : 'customer'
  const links = role === 'customer' ? customerLinks : hawkerLinks
  function changeRole(next: PersonaRole) { if (mode !== 'fixture') return; localStorage.setItem('pasarmalam:role', next); setRole(next); navigate(next === 'customer' ? '/discover' : '/hawker/dashboard') }
  return <div className="app-shell"><div className={`mode-banner ${mode}`}><Sparkles size={14}/>{t(mode === 'fixture' ? 'demoBanner' : 'connectedBanner')}</div><header className="site-header"><NavLink className="brand" to="/discover"><span className="brand-mark"><Moon size={20}/></span><span>Pasar<span>Malam</span><small>{t('tagline')}</small></span></NavLink><nav className="desktop-nav" aria-label={t('mainNavigation')}>{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/>{t(label)}</NavLink>)}</nav><div className="header-actions">{mode === 'connected' && <NavLink className="button secondary" to="/profile"><UserRound size={18}/>{t('profile')}</NavLink>}<div className="role-switch" role="group" aria-label={t('demoRole')}><button className={role==='customer'?'active':''} onClick={() => changeRole('customer')} disabled={mode !== 'fixture'}>{t('customer')}</button><button className={role==='hawker'?'active':''} onClick={() => changeRole('hawker')} disabled={mode !== 'fixture'}>{t('hawker')}</button></div></div></header><main id="main" className="main-content"><Routes><Route path="/" element={<Navigate to="/discover" replace/>}/><Route path="/discover" element={<DiscoveryPage gateway={gateway}/>}/><Route path="/markets/:id" element={<DiscoveryDetail gateway={gateway} kind="market"/>}/><Route path="/stalls/:id" element={<DiscoveryDetail gateway={gateway} kind="stall"/>}/><Route path="/offers" element={<Offers gateway={gateway}/>}/><Route path="/saved" element={<SavedPage gateway={gateway}/>}/><Route path="/profile" element={<Profile mode={mode}/>}/><Route path="/hawker/dashboard" element={<ProtectedInfoPage required="vendor" label={t('dashboard')} title={t('dashboardTitle')} body={t('dashboardBody')} icon={LayoutDashboard}/>}/><Route path="/hawker/stall" element={<ProtectedInfoPage required="vendor" label={t('stall')} title={t('stallTitle')} body={t('stallBody')} icon={Store}/>}/><Route path="/hawker/batches" element={<ProtectedInfoPage required="vendor" label={t('batches')} title={t('batchesTitle')} body={t('batchesBody')} icon={Mic2}/>}/><Route path="/hawker/promotions" element={<ProtectedInfoPage required="vendor" label={t('promotions')} title={t('promotionsTitle')} body={t('promotionsBody')} icon={Tag}/>}/><Route path="/hawker/alerts" element={<ProtectedInfoPage required="vendor" label={t('alerts')} title={t('alertsTitle')} body={t('alertsBody')} icon={Bell}/>}/><Route path="/admin/*" element={<ProtectedInfoPage required="admin" label={t('admin')} title={t('adminTitle')} body={t('adminBody')} icon={ShieldCheck}/>}/><Route path="*" element={<EmptyState/>}/></Routes></main><footer className="site-footer"><span>✳ PasarMalam</span><span>{t('demoOnly')}</span></footer><nav className="mobile-nav" aria-label={t('mobileNavigation')}>{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} className={({isActive}) => `mobile-link ${isActive?'active':''}`}><Icon size={21}/><span>{t(label)}</span></NavLink>)}</nav></div>
}
