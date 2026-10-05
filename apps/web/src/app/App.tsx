import { lazy, Suspense, useState } from 'react'
import { useDiscovery } from '../discovery/useDiscovery'
import { eligibleOffers } from '../discovery/engine'
import { DiscoveryPage, DiscoveryDetail, SavedPage, useNow } from '../discovery/DiscoveryPage'
import * as Dialog from '@radix-ui/react-dialog'
import { NavLink, Navigate, Route, Routes, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Bell, Clock3, Compass, Heart, LayoutDashboard,
  Menu, Moon, ShieldCheck, Sparkles, Store,
  Tag, UserRound, Volume2, X,
} from 'lucide-react'
import { ui } from '../locales/phrases'
import { changeLocale } from '../locales/i18n'
import { selectedMode, openDemo } from './config'
import { fixtureGateway } from '../data/fixture'
import { connectedGateway } from '../data/connected'
import { ScenarioControls } from '../integrations/ScenarioControls'
import { AuthCard } from '../auth/AuthCard'
import { useAuth } from '../auth/context'
import type { DataGateway, DemoOffer, DiscoverySnapshot, PersonaRole } from '../data/types'

import { DemoDialog } from './DemoDialog'
import { FreshPage, DemoAdmin, NearbyConsent } from '../freshness/FreshPage'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
import { VendorPage } from '../vendor/VendorPage'

const PresentationPage=lazy(()=>import('../presentation/PresentationPage'))
const AdvancedPage=lazy(()=>import('../advanced/AdvancedPage'))
const PartnerPage=lazy(()=>import('../partners/PartnerPage'))
const CommercePage=lazy(()=>import('../commerce/CommercePage'))
const VoicePage=lazy(()=>import('../voice/VoicePage'))
const EvaluationPage=lazy(()=>import('../voice/EvaluationPage'))
const CommunityPage=lazy(()=>import('../community/CommunityPage'))
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
  if (query.isError) return <div className="panel state-panel" role="alert"><span className="state-icon">!</span><h2>{t('errorTitle')}</h2><p>{t(gateway.mode === 'connected' ? 'connectedUnavailable' : 'requestUnavailable')}</p><div className="button-row"><button className="button secondary" onClick={() => void query.refetch()}>{t('tryAgain')}</button>{gateway.mode === 'connected' && <DemoDialog/>}</div></div>
  return <>{children(query.data)}</>
}

function EmptyState() {
  const { t } = useTranslation()
  return <div className="panel state-panel"><h3>{t('noMatches')}</h3><p>{t('relaxFilters')}</p></div>
}

function Offers({ gateway }: { gateway: DataGateway }) {
  const { t } = useTranslation()
  const now = useNow(gateway)
  return <><NavLink className="button secondary" to="/commerce">Reserve clearance / order history</NavLink><PageIntro eyebrow={t('offers')} title={t('offersTitle')} body={t('offersBody')}/><Content gateway={gateway}>{data => <div className="offer-grid">{eligibleOffers(data,now).length ? eligibleOffers(data,now).map((offer: DemoOffer) => { const stall = data.stalls.find(s => s.id === offer.stallId); return <NavLink className="offer-card card-link" to={`/stalls/${offer.stallId}`} key={offer.id}><ImagePlaceholder description={`${stall?.specialty ?? 'Clearance food'} at ${stall?.name ?? 'market stall'}`}/><div><span className="eyebrow">{stall?.name}</span><h3>{offer.title}</h3><p className="muted"><Clock3 size={14}/> {offer.endsAt}</p></div><div className="offer-price"><strong>RM {(offer.priceSen/100).toFixed(2)}</strong><s>RM {(offer.originalPriceSen/100).toFixed(2)}</s></div></NavLink> }) : <EmptyState/>}</div>}</Content></>
}

function PageIntro({ eyebrow, title, body }: { eyebrow: string; title: string; body: string }) {
  return <header className="page-intro"><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{body}</p></header>
}

function PrivacyDialog() {
  const { t } = useTranslation()
  const choicePrefix=`pasarmalam:${selectedMode() === 'fixture' ? 'demo' : 'real'}`
  const [location, setLocation] = useState(localStorage.getItem(`${choicePrefix}:location-choice`) === 'yes')
  const [microphone, setMicrophone] = useState(localStorage.getItem(`${choicePrefix}:microphone-choice`) === 'yes')
  function choose(key: string, value: boolean) { localStorage.setItem(`${choicePrefix}:${key}-choice`, value ? 'yes' : 'no'); if (key === 'location') setLocation(value); else setMicrophone(value) }
  return <Dialog.Root><Dialog.Trigger className="button secondary"><ShieldCheck size={18}/>{t('privacy')}</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Close className="dialog-close" aria-label={t('close')}><X size={22}/></Dialog.Close><Dialog.Title>{t('privacy')}</Dialog.Title><Dialog.Description>{t('privacyBody')}</Dialog.Description><label className="choice-row"><span>{t('locationChoice')}</span><input type="checkbox" checked={location} onChange={e => choose('location',e.target.checked)}/></label><label className="choice-row"><span>{t('microphoneChoice')}</span><input type="checkbox" checked={microphone} onChange={e => choose('microphone',e.target.checked)}/></label><p className="muted small">{t('settingSaved')}</p></Dialog.Content></Dialog.Portal></Dialog.Root>
}

function resetDemo() {
  for (const store of [localStorage,sessionStorage]) for (const key of Object.keys(store)) if (key.startsWith('pasarmalam:demo:') || key.startsWith('pasarmalam:fixture-') || key === 'pasarmalam:scenario-clock') store.removeItem(key)
  openDemo()
}

function Profile({ mode }: { mode: 'fixture' | 'connected' }) {
  const { t, i18n } = useTranslation()
  function readAloud() { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(t('profileBody')); speech.lang = i18n.language === 'ms' ? 'ms-MY' : 'en-MY'; window.speechSynthesis.speak(speech) } }
  return <><PageIntro eyebrow={t('profile')} title={t('profileTitle')} body={t('profileBody')}/><div className="settings-grid">{mode === 'connected' && <AuthCard/>}<div className="panel setting-card"><div className="feature-icon"><UserRound size={24}/></div><h2>{t('language')}</h2><div className="segmented" role="group" aria-label={t('language')}><button className={i18n.language === 'en' ? 'active' : ''} onClick={() => void changeLocale('en')}>English</button><button className={i18n.language === 'ms' ? 'active' : ''} onClick={() => void changeLocale('ms')}>Bahasa Melayu</button></div></div><div className="panel setting-card"><div className="feature-icon"><ShieldCheck size={24}/></div><h2>{t('privacy')}</h2><p>{t('privacyBody')}</p><PrivacyDialog/></div><div className="panel setting-card"><div className="feature-icon"><Volume2 size={24}/></div><h2>{t('readAloud')}</h2><button className="button secondary" onClick={readAloud}><Volume2 size={17}/>{t('readAloud')}</button></div><NavLink className="button secondary" to="/community">{ui("Community & moderation")}</NavLink><NavLink className="button secondary" to="/commerce">Commerce & sponsored demo</NavLink><NavLink className="button secondary" to="/partners">Fictional partner workspaces</NavLink><NavLink className="button secondary" to="/advanced">Notifications, forecast & advanced previews</NavLink><NavLink className="button secondary" to="/presentation">Full demo studio & pilot</NavLink><NearbyConsent mode={mode}/>{mode === 'fixture' && <><ScenarioControls/><NavLink className="button secondary" to="/admin">{ui('Demo administrator controls')}</NavLink><section className="panel setting-card"><h2>{ui('Reset demo')}</h2><p>{ui('Restore fictional prefilled records on this device. Real accounts and data are unaffected.')}</p><button className="button secondary" onClick={resetDemo}>{ui('Restore prefilled demo')}</button></section></>}</div></>
}

export default function App() {
  const { t } = useTranslation()
  const mode = selectedMode()
  const gateway = mode === 'fixture' ? fixtureGateway : connectedGateway
  const navigate = useNavigate()
  const [fixtureRole, setRole] = useState<PersonaRole>(() => mode === 'fixture' && localStorage.getItem('pasarmalam:demo:role') === 'hawker' ? 'hawker' : 'customer')
  const { actor } = useAuth()
  const role = mode === 'fixture' ? fixtureRole : actor?.roles.includes('vendor') ? 'hawker' : 'customer'
  const links = role === 'customer' ? customerLinks : hawkerLinks
  function changeRole(next: PersonaRole) { if (mode !== 'fixture') return; localStorage.setItem('pasarmalam:demo:role', next); setRole(next); navigate(next === 'customer' ? '/discover' : '/hawker/dashboard') }
  return <div className="app-shell"><div className={`mode-banner ${mode}`}><Sparkles size={14}/>{mode === 'fixture' ? t('demoBanner') : (/^\/sandbox(?:\/|$)/.test(window.location.pathname) ? ui('Connected sandbox · Fictional data · Permissions enforced') : ui('PasarMalam · Real app'))}</div><header className="site-header"><NavLink className="brand" to="/discover"><span className="brand-mark"><Moon size={20}/></span><span>Pasar<span>Malam</span><small>{t('tagline')}</small></span></NavLink><nav className="desktop-nav" aria-label={t('mainNavigation')}>{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/>{t(label)}</NavLink>)}</nav><div className="header-actions">{mode === 'connected' ? <DemoDialog/> : <a className="button secondary" href="/discover"><X size={18}/>{ui('Exit demo')}</a>}{mode === 'connected' && <NavLink className="button secondary" to="/profile"><UserRound size={18}/>{t('profile')}</NavLink>}{mode === 'fixture' && <div className="role-switch" role="group" aria-label={t('demoRole')}><button className={role==='customer'?'active':''} onClick={() => changeRole('customer')} disabled={mode !== 'fixture'}>{t('customer')}</button><button className={role==='hawker'?'active':''} onClick={() => changeRole('hawker')} disabled={mode !== 'fixture'}>{t('hawker')}</button></div>}</div></header><main id="main" className="main-content"><Routes><Route path="/" element={<Navigate to="/discover" replace/>}/><Route path="/discover" element={<DiscoveryPage gateway={gateway}/>}/><Route path="/markets/:id" element={<DiscoveryDetail gateway={gateway} kind="market"/>}/><Route path="/stalls/:id" element={<DiscoveryDetail gateway={gateway} kind="stall"/>}/><Route path="/presentation" element={<Suspense fallback={<p>Loading…</p>}><PresentationPage/></Suspense>}/><Route path="/advanced" element={<Suspense fallback={<p>Loading…</p>}><AdvancedPage/></Suspense>}/><Route path="/partners" element={<Suspense fallback={<p>Loading…</p>}><PartnerPage/></Suspense>}/><Route path="/commerce" element={<Suspense fallback={<p>Loading…</p>}><CommercePage/></Suspense>}/><Route path="/offers" element={<Offers gateway={gateway}/>}/><Route path="/saved" element={<SavedPage gateway={gateway}/>}/><Route path="/profile" element={<Profile mode={mode}/>}/><Route path="/hawker/voice" element={<Suspense fallback={<p>{ui('Loading…')}</p>}><VoicePage mode={mode}/></Suspense>}/><Route path="/evaluation" element={<Suspense fallback={<p>{ui('Loading…')}</p>}><EvaluationPage/></Suspense>}/><Route path="/hawker/dashboard" element={<VendorPage mode={mode} view="dashboard"/>}/><Route path="/hawker/stall" element={<VendorPage mode={mode} view="stall"/>}/><Route path="/hawker/batches" element={<VendorPage mode={mode} view="batches"/>}/><Route path="/hawker/promotions" element={<FreshPage mode={mode}/>}/><Route path="/hawker/alerts" element={<FreshPage mode={mode}/>}/><Route path="/community" element={<Suspense fallback={<p>Loading…</p>}><CommunityPage key={mode==='fixture'?'fixture':actor?.id??'guest'}/></Suspense>}/><Route path="/community/:id" element={<Suspense fallback={<p>Loading…</p>}><CommunityPage key={mode==='fixture'?'fixture':actor?.id??'guest'}/></Suspense>}/><Route path="/admin/*" element={<DemoAdmin mode={mode}/>}/><Route path="*" element={<EmptyState/>}/></Routes></main><footer className="site-footer"><span>✳ PasarMalam</span><span>{mode === 'fixture' ? t('demoOnly') : ui('Community markets · Basic tier free')}</span></footer><nav className="mobile-nav" aria-label={t('mobileNavigation')}>{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} className={({isActive}) => `mobile-link ${isActive?'active':''}`}><Icon size={21}/><span>{t(label)}</span></NavLink>)}</nav></div>
}
