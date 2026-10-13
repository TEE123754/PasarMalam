import { lazy, Suspense, useState } from 'react'
import { useDiscovery } from '../discovery/useDiscovery'
import { eligibleOffers } from '../discovery/engine'
import { DiscoveryPage, DiscoveryDetail, SavedPage, useNow } from '../discovery/DiscoveryPage'
import * as Dialog from '@radix-ui/react-dialog'
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Bell, Clock3, Compass, Heart, LayoutDashboard,
  Menu, ShieldCheck, Sparkles, Store,
  Tag, UserRound, Volume2, X,
} from 'lucide-react'
import { ui } from '../locales/phrases'
import { changeLocale } from '../locales/i18n'
import { selectedMode } from './config'
import { nativeDemoBuild } from '../native/policy'
import { fixtureGateway } from '../data/fixture'
import { connectedGateway } from '../data/connected'
import MarketProfile from './MarketProfile'
import PartnerOverview from '../partners/PartnerOverview'
import CommunityImpact from '../impact/CommunityImpact'
import { BatchFreshness, malaysiaTime } from '../discovery/BatchFreshness'
import { AuthCard } from '../auth/AuthCard'
import { useAuth } from '../auth/context'
import type { DataGateway, DiscoverySnapshot, PersonaRole } from '../data/types'

import { event as impactEvent } from '../impact/gateway'
import { demoPerson } from '../community/gateway'
import { DemoDialog, DemoSplash } from './DemoDialog'
import './night-theme.css'
import { FreshPage, DemoAdmin, NearbyConsent } from '../freshness/FreshPage'
import { DemoImage } from '../components/DemoImage'
import { BatchPhoto } from '../components/BatchPhoto'
import { foodImage } from '../components/demo-images'
import { VendorPage } from '../vendor/VendorPage'

const PresentationPage=lazy(()=>import('../presentation/PresentationPage'))
const AdvancedPage=lazy(()=>import('../advanced/AdvancedPage'))
const PartnerPage=lazy(()=>import('../partners/PartnerPage'))
const CommercePage=lazy(()=>import('../commerce/CommercePage'))
const PassportPage=lazy(()=>import('../passports/PassportPage'))
const PlanningPage=lazy(()=>import('../planning/PlanningPage'))
const ImpactPage=lazy(()=>import('../impact/ImpactPage'))
const AccountingPage=lazy(()=>import('../accounting/AccountingPage'))
const HandlingPage=lazy(()=>import('../passports/HandlingPage'))
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
  const { t, i18n } = useTranslation(), now = useNow(gateway)
  const {actor}=useAuth()
  return <><PageIntro eyebrow="LESS WASTE. MORE GOOD FOOD." title={t('offersTitle')} body="Small batches, evening specials and surplus meals. Reserve while the advisory window is open; pay when you collect."/><NavLink className="button secondary" to="/commerce">Reservations & order history</NavLink><Content gateway={gateway}>{data => <div className="clearance-grid">{eligibleOffers(data,now).length ? eligibleOffers(data,now).map(offer => {
    const stall = data.stalls.find(s => s.id === offer.stallId), food=data.menu.find(f=>f.id===offer.foodItemId), batch=data.batches.find(b=>b.id===offer.batchId), discount=offer.originalPriceSen?Math.round((1-offer.priceSen/offer.originalPriceSen)*100):0
    return <article className="clearance-card panel" key={offer.id}><NavLink to={`/stalls/${offer.stallId}`} className="clearance-image">{batch?<BatchPhoto food={food?.name??stall?.specialty??offer.title} number={batch.batchNumber} foodId={batch.foodItemId} batchId={batch.id} photo={batch.photoUrl}/>:<DemoImage image={foodImage(food?.name??stall?.specialty??'')} description={food?.name??stall?.specialty??offer.title}/>}<span className="offer-ribbon">{offer.priceSen===0?'Share a meal':`${discount}% off`}</span></NavLink><div className="clearance-copy"><span className="eyebrow">{stall?.name}</span><h2>{offer.title}</h2><div className="clearance-price"><strong>RM {(offer.priceSen/100).toFixed(2)}</strong><s>RM {(offer.originalPriceSen/100).toFixed(2)}</s></div>{batch&&<BatchFreshness batch={batch} now={now}/>}<p className="small muted"><Clock3 size={14}/> Offer ends {malaysiaTime(offer.endsAt,i18n.language)}</p><NavLink className="button primary" to={`/commerce?offer=${encodeURIComponent(offer.id)}`} onClick={()=>void impactEvent(gateway.mode,gateway.mode==='fixture'?demoPerson():{id:actor?.id??'',name:'',verified:actor?.verified??false,role:'customer'},offer.stallId,'offer-engagement',offer.id)}>Reserve & collect</NavLink><NavLink className="back-link" to={`/stalls/${offer.stallId}`}>View stall & preparation history</NavLink></div></article>
  }) : <EmptyState/>}</div>}</Content></>
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

function Profile({ mode }: { mode: 'fixture' | 'connected' }) {
  const { t, i18n } = useTranslation()
  function readAloud() { if ('speechSynthesis' in window) { window.speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(t('profileBody')); speech.lang = i18n.language === 'ms' ? 'ms-MY' : 'en-MY'; window.speechSynthesis.speak(speech) } }
  if (mode === 'fixture') return <MarketProfile/>
  return <><PageIntro eyebrow={t('profile')} title={t('profileTitle')} body={t('profileBody')}/><div className="settings-grid">{mode === 'connected' ? <AuthCard/> : <section className="panel setting-card"><h2>{ui('New account or invitation')}</h2><p>{ui('The demo uses fictional accounts on this device. It does not register a real account.')}</p></section>}<div className="panel setting-card"><div className="feature-icon"><UserRound size={24}/></div><h2>{t('language')}</h2><div className="segmented" role="group" aria-label={t('language')}><button className={i18n.language === 'en' ? 'active' : ''} onClick={() => void changeLocale('en')}>English</button><button className={i18n.language === 'ms' ? 'active' : ''} onClick={() => void changeLocale('ms')}>Bahasa Melayu</button></div></div><div className="panel setting-card"><div className="feature-icon"><ShieldCheck size={24}/></div><h2>{t('privacy')}</h2><p>{t('privacyBody')}</p><PrivacyDialog/></div><div className="panel setting-card"><div className="feature-icon"><Volume2 size={24}/></div><h2>{t('readAloud')}</h2><button className="button secondary" onClick={readAloud}><Volume2 size={17}/>{t('readAloud')}</button></div><NavLink className="button secondary" to="/community">{ui("Community & moderation")}</NavLink><NavLink className="button secondary" to="/commerce">Reservations & advertising</NavLink><NavLink className="button secondary" to="/partners">Community partners</NavLink><NavLink className="button secondary" to="/advanced">Notifications & market insights</NavLink><NavLink className="button secondary" to="/presentation">Market presentation & pilot</NavLink><NearbyConsent mode={mode}/></div></>
}

// Customer pages (and stall/market detail) share the dark night-market theme (night-theme.css) and the hawker CTA in the navbar
const customerPaths = ['/discover', '/offers', '/saved', '/profile']
function NightPage({ page, children }: { page: string; children: React.ReactNode }) {
  return <div className={`night-page content-page ${page}-page`}>{children}</div>
}

export default function App() {
  const { t } = useTranslation()
  const mode = selectedMode()
  const gateway = mode === 'fixture' ? fixtureGateway : connectedGateway
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [fixtureRole, setRole] = useState<PersonaRole>(() => mode === 'fixture' && localStorage.getItem('pasarmalam:demo:role') === 'hawker' ? 'hawker' : 'customer')
  const { actor } = useAuth()
  const role = mode === 'fixture' ? fixtureRole : actor?.roles.includes('vendor') ? 'hawker' : 'customer'
  const links = role === 'customer' ? customerLinks : hawkerLinks
  function changeRole(next: PersonaRole) { if (mode !== 'fixture') return; localStorage.setItem('pasarmalam:demo:role', next); localStorage.setItem('pasarmalam:demo:community-person', next==='hawker'?'vendor-a':'customer-a'); setRole(next); navigate(next === 'customer' ? '/discover' : '/hawker/dashboard') }
  // The root route is the full-screen demo splash, shown without the app shell's banner/header/footer
  if (mode !== 'fixture' && pathname === '/') return <DemoSplash/>
  return <div className="app-shell">{mode === 'connected' && <div className={`mode-banner ${mode}`}><Sparkles size={14}/>{(/^\/sandbox(?:\/|$)/.test(window.location.pathname) ? ui('Connected sandbox · Fictional data · Permissions enforced') : ui('PasarMalam · Community markets'))}</div>}<header className="site-header"><NavLink className="brand" to="/discover"><span className="brand-mark"><Store size={27} strokeWidth={2.2}/></span><span>Pasar<span>Malam</span><small>{t('tagline')}</small></span></NavLink><nav className="desktop-nav" aria-label={t('mainNavigation')}>{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} className={({isActive}) => `nav-link ${isActive ? 'active' : ''}`}><Icon size={18}/>{t(label)}</NavLink>)}</nav><div className="header-actions">{mode === 'connected' ? <DemoDialog/> : !nativeDemoBuild() && <a className="button secondary" href="/"><Store size={18}/>{ui('Home')}</a>}{mode === 'connected' && <NavLink className="button secondary" to="/profile"><UserRound size={18}/>{t('profile')}</NavLink>}{mode === 'fixture' && (role === 'customer' && (customerPaths.includes(pathname) || /^\/(?:stalls|markets)\//.test(pathname)) ? <button className="button primary hawker-pill" onClick={() => changeRole('hawker')}>{ui('Are you a hawker?')}</button> : <div className="role-switch" role="group" aria-label={ui('Switch workspace')}><button className={role==='customer'?'active':''} onClick={() => changeRole('customer')} disabled={mode !== 'fixture'}>{t('customer')}</button><button className={role==='hawker'?'active':''} onClick={() => changeRole('hawker')} disabled={mode !== 'fixture'}>{t('hawker')}</button></div>)}</div></header><main id="main" className="main-content"><Routes><Route path="/" element={mode==='fixture'?<Navigate to="/discover" replace/>:<DemoSplash/>}/><Route path="/discover" element={<DiscoveryPage gateway={gateway}/>}/><Route path="/markets/:id" element={<NightPage page="market"><DiscoveryDetail gateway={gateway} kind="market"/></NightPage>}/><Route path="/stalls/:id" element={<NightPage page="stall"><DiscoveryDetail gateway={gateway} kind="stall"/></NightPage>}/><Route path="/presentation" element={<Suspense fallback={<p>Loading…</p>}><PresentationPage/></Suspense>}/><Route path="/advanced" element={<Suspense fallback={<p>Loading…</p>}><AdvancedPage/></Suspense>}/><Route path="/partners" element={mode==='fixture'?<PartnerOverview/>:<Suspense fallback={<p>Loading…</p>}><PartnerPage/></Suspense>}/><Route path="/partners/workspace" element={<Suspense fallback={<p>Loading…</p>}><PartnerPage/></Suspense>}/><Route path="/commerce" element={<Suspense fallback={<p>Loading…</p>}><CommercePage/></Suspense>}/><Route path="/offers" element={<NightPage page="offers"><Offers gateway={gateway}/></NightPage>}/><Route path="/saved" element={<NightPage page="saved"><SavedPage gateway={gateway}/></NightPage>}/><Route path="/profile" element={<NightPage page="profile"><Profile mode={mode}/></NightPage>}/><Route path="/passports/:id" element={<Suspense fallback={<p>Loading…</p>}><PassportPage mode={mode}/></Suspense>}/><Route path="/impact" element={mode==='fixture'?<CommunityImpact/>:<Suspense fallback={<p>Loading…</p>}><ImpactPage/></Suspense>}/><Route path="/hawker/accounting" element={<Suspense fallback={<p>Loading…</p>}><AccountingPage mode={mode}/></Suspense>}/><Route path="/hawker/handling/:id" element={<Suspense fallback={<p>Loading…</p>}><HandlingPage mode={mode}/></Suspense>}/><Route path="/hawker/voice" element={<Suspense fallback={<p>{ui('Loading…')}</p>}><VoicePage mode={mode}/></Suspense>}/><Route path="/hawker/planning" element={<Suspense fallback={<p>Loading…</p>}><PlanningPage/></Suspense>}/><Route path="/evaluation" element={<Suspense fallback={<p>{ui('Loading…')}</p>}><EvaluationPage/></Suspense>}/><Route path="/hawker/dashboard" element={<VendorPage mode={mode} view="dashboard"/>}/><Route path="/hawker/stall" element={<VendorPage mode={mode} view="stall"/>}/><Route path="/hawker/batches" element={<VendorPage mode={mode} view="batches"/>}/><Route path="/hawker/promotions" element={<FreshPage mode={mode}/>}/><Route path="/hawker/alerts" element={<FreshPage mode={mode}/>}/><Route path="/community" element={<Suspense fallback={<p>Loading…</p>}><CommunityPage key={mode==='fixture'?'fixture':actor?.id??'guest'}/></Suspense>}/><Route path="/community/:id" element={<Suspense fallback={<p>Loading…</p>}><CommunityPage key={mode==='fixture'?'fixture':actor?.id??'guest'}/></Suspense>}/><Route path="/admin/*" element={<DemoAdmin mode={mode}/>}/><Route path="*" element={<EmptyState/>}/></Routes></main><footer className="site-footer"><span>✳ PasarMalam</span><span>{ui('Community markets · Basic tier free')}</span></footer><nav className="mobile-nav" aria-label={t('mobileNavigation')}>{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} className={({isActive}) => `mobile-link ${isActive?'active':''}`}><Icon size={21}/><span>{t(label)}</span></NavLink>)}</nav></div>
}
