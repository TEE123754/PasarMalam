import { lazy, Suspense, useCallback, useState } from 'react'
import { useDiscovery } from '../discovery/useDiscovery'
import { eligibleOffers } from '../discovery/engine'
import { DiscoveryPage, DiscoveryDetail, useNow } from '../discovery/DiscoveryPage'
import { SavedPage } from '../discovery/SavedItems'
import * as Dialog from '@radix-ui/react-dialog'
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import {
  Clock3, Compass, Heart, LayoutDashboard,
  ShieldCheck, Sparkles, Store,
  Tag, UserRound, Volume2, X,
} from 'lucide-react'
import { ui } from '../locales/phrases'
import { changeLocale } from '../locales/i18n'
import { selectedMode } from './config'
import { fixtureGateway } from '../data/fixture'
import { connectedGateway } from '../data/connected'
import MarketProfile from './MarketProfile'
import PartnerOverview from '../partners/PartnerOverview'
import CommunityImpact from '../impact/CommunityImpact'
import MarketHealthReport from '../organizer/MarketHealthReport'
import { BatchFreshness, malaysiaTime } from '../discovery/BatchFreshness'
import { AuthCard } from '../auth/AuthCard'
import { useAuth } from '../auth/context'
import type { DataGateway, DiscoverySnapshot, PersonaRole } from '../data/types'

import { event as impactEvent } from '../impact/gateway'
import { demoPerson } from '../community/gateway'
import { DemoDialog, DemoSplash } from './DemoDialog'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'
import { DiscoverStateProvider } from '../discovery/DiscoverState'
import { MarketsPage } from '../discovery/MarketsPage'
import { RealEnvUnavailable } from './RealEnvUnavailable'
import { realEnvironmentReady } from '../auth/client'
import { useQuery } from '@tanstack/react-query'
import { HawkerLogin } from './HawkerLogin'
import { HawkerSettings } from '../vendor/HawkerSettings'
import './night-theme.css'
import { usePageTransition } from './pageTransition'
import { HeroIntro, shouldShowHeroIntro } from './HeroIntro'
import { FreshPage, DemoAdmin, NearbyConsent } from '../freshness/FreshPage'
import { DemoImage } from '../components/DemoImage'
import { OfferBatchProof } from './OfferBatchProof'
import { BatchPhoto } from '../components/BatchPhoto'
import { foodImage } from '../components/demo-images'
import { VendorPage } from '../vendor/VendorPage'
import { OffersControls, OffersEmpty, ResetOfferFilters } from '../clearance/OffersControls'
import { filterOffers, noOfferFilters, type OfferFilters } from '../clearance/offer-filters'
import { SellingFastSection } from '../clearance/SellingFastSection'
import { SaveHeart } from '../discovery/SaveHeart'

const PrototypePage=lazy(()=>import('../prototype/PrototypePage'))
const PresentationPage=lazy(()=>import('../presentation/PresentationPage'))
const AdvancedPage=lazy(()=>import('../advanced/AdvancedPage'))
const PartnerPage=lazy(()=>import('../partners/PartnerPage'))
const CommercePage=lazy(()=>import('../commerce/CommercePage'))
const PassportPage=lazy(()=>import('../passports/PassportPage'))
const PlanningPage=lazy(()=>import('../planning/PlanningPage'))
const ImpactPage=lazy(()=>import('../impact/ImpactPage'))
const AccountingPage=lazy(()=>import('../accounting/AccountingPage'))
const HandlingPage=lazy(()=>import('../passports/HandlingPage'))
const BatchLifecyclePage=lazy(()=>import('../vendor/BatchLifecyclePage'))
const VoicePage=lazy(()=>import('../voice/VoicePage'))
const EvaluationPage=lazy(()=>import('../voice/EvaluationPage'))
const CommunityPage=lazy(()=>import('../community/CommunityPage'))
const MarketRunPlanner=lazy(()=>import('../planner/MarketRunPlanner'))

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
  const [filters,setFilters]=useState<OfferFilters>(noOfferFilters)
  // "A good deal, / while it lasts.": two lines, the second in the bright orange used on Discover
  const [titleFirst,...titleRest]=t('offersTitle').split(/(?<=,)\s+/)
  const title=titleRest.length?<>{titleFirst}<br/><span className="page-title-accent">{titleRest.join(' ')}</span></>:t('offersTitle')
  return <><PageIntro eyebrow="LESS WASTE. MORE GOOD FOOD." title={title} body="Small batches, evening specials and surplus meals. Reserve while the advisory window is open; pay when you collect."/><NavLink className="button secondary" to="/commerce">Reservations & order history</NavLink><Content gateway={gateway}>{data => { const all=eligibleOffers(data,now), shown=filterOffers(data,all,filters); return <>{all.length>0&&<OffersControls data={data} offers={all} filters={filters} onChange={setFilters}/>}{shown.length ? <div className="clearance-grid">{shown.map(offer => {
    const stall = data.stalls.find(s => s.id === offer.stallId), food=data.menu.find(f=>f.id===offer.foodItemId), batch=data.batches.find(b=>b.id===offer.batchId), discount=offer.originalPriceSen?Math.round((1-offer.priceSen/offer.originalPriceSen)*100):0
    return <article className="clearance-card panel" key={offer.id}><SaveHeart gateway={gateway} stallId={offer.stallId} stallName={stall?.name??''} foodId={offer.foodItemId} foodName={food?.name??offer.title}/><NavLink to={`/stalls/${offer.stallId}`} className="clearance-image">{batch?<BatchPhoto food={food?.name??stall?.specialty??offer.title} number={batch.batchNumber} foodId={batch.foodItemId} batchId={batch.id} photo={batch.photoUrl}/>:<DemoImage image={foodImage(food?.name??stall?.specialty??'')} description={food?.name??stall?.specialty??offer.title}/>}<span className="offer-ribbon">{offer.priceSen===0?'Share a meal':`${discount}% off`}</span></NavLink><div className="clearance-copy"><span className="eyebrow">{stall?.name}</span><h2>{offer.title}</h2><div className="clearance-price"><strong>RM {(offer.priceSen/100).toFixed(2)}</strong><s>RM {(offer.originalPriceSen/100).toFixed(2)}</s></div><OfferBatchProof batch={batch} foodName={food?.name??offer.title}/>{batch&&<><BatchFreshness batch={batch} now={now}/><p className="offer-advisory-disclaimer">Advisory estimate, not a safety guarantee. Check food condition with the hawker.</p></>}<p className="offer-reserve-by"><Clock3 size={14}/> Reserve by {malaysiaTime(offer.endsAt,i18n.language)}</p><NavLink className="button primary" to={`/commerce?offer=${encodeURIComponent(offer.id)}`} onClick={()=>void impactEvent(gateway.mode,gateway.mode==='fixture'?demoPerson():{id:actor?.id??'',name:'',verified:actor?.verified??false,role:'customer'},offer.stallId,'offer-engagement',offer.id)}>Reserve & collect</NavLink><NavLink className="back-link" to={`/stalls/${offer.stallId}`}>View stall & preparation history</NavLink></div></article>
  })}</div> : all.length ? <OffersEmpty><ResetOfferFilters filters={filters} onReset={()=>setFilters(noOfferFilters)}/></OffersEmpty> : <OffersEmpty/>}{gateway.mode==='fixture'&&<SellingFastSection data={data} now={now} gateway={gateway}/>}</>}}</Content></>
}

function PageIntro({ eyebrow, title, body }: { eyebrow: string; title: React.ReactNode; body: string }) {
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

const customerLinks = [
  { to: '/discover', label: 'discover', icon: Compass },
  { to: '/offers', label: 'offers', icon: Tag },
  { to: '/saved', label: 'saved', icon: Heart },
  { to: '/profile', label: 'profile', icon: UserRound },
] as const
const hawkerLinks = [
  { to: '/hawker/dashboard', label: 'dashboard', icon: LayoutDashboard },
  { to: '/hawker/stall', label: 'stall', icon: Store },
  { to: '/hawker/promotions', label: 'promotionsAlerts', icon: Tag },
] as const

// Every page uses the dark night-market theme (night-theme.css). Discover renders its own themed root;
// all other routes get a wrapper with a per-page class (e.g. stall-page, hawker-page) for page-specific tweaks.
const customerPaths = ['/discover', '/markets', '/offers', '/saved', '/profile']
function pageTheme(pathname: string) {
  if (pathname === '/discover') return ''
  const segment = pathname.split('/')[1] || 'home'
  const slug = ({ stalls: 'stall', markets: 'market' } as Record<string, string>)[segment] ?? segment
  return `night-page content-page ${slug}-page`
}

export default function App() {
  const { t } = useTranslation()
  const mode = selectedMode()
  const gateway = mode === 'fixture' ? fixtureGateway : connectedGateway
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const pagePhase = usePageTransition(pathname)
  const [showHero, setShowHero] = useState(() => shouldShowHeroIntro(pathname))
  const finishHero = useCallback(() => { try { sessionStorage.setItem('pasarmalam:hero-shown','yes') } catch { /* optional */ } setShowHero(false) }, [])
  const { actor } = useAuth()
  const role = mode === 'fixture' ? (/^\/(?:hawker|vendor)(?:\/|$)/.test(pathname) && pathname !== '/hawker/login' ? 'hawker' : 'customer') : actor?.roles.includes('vendor') ? 'hawker' : 'customer'
  const links = role === 'customer' ? customerLinks : hawkerLinks
  function setPersona(next: PersonaRole) { localStorage.setItem('pasarmalam:demo:role', next); localStorage.setItem('pasarmalam:demo:community-person', next==='hawker'?'vendor-a':'customer-a') }
  // Customer → hawker goes through the fictional login gate; the hawker persona is only set once it is submitted
  function changeRole(next: PersonaRole) { if (mode !== 'fixture') return; if (next === 'hawker') { navigate('/hawker/login'); return } setPersona('customer'); navigate('/discover') }
  function enterHawker() { setPersona('hawker'); navigate('/hawker/dashboard') }
  // Normal routes need a verified real data environment; without one (e.g. a frontend-only deploy)
  // they show an "open the demo" card. /demo and /sandbox keep their own behaviour.
  const realCheckEnabled = mode === 'connected' && pathname !== '/' && !/^\/sandbox(?:\/|$)/.test(window.location.pathname)
  const realCheck = useQuery({ queryKey: ['real-environment'], queryFn: realEnvironmentReady, enabled: realCheckEnabled, retry: false, staleTime: 60_000 })
  // The root route is the full-screen demo splash, shown without the app shell's banner/header/footer
  if (mode !== 'fixture' && pathname === '/') return <DemoSplash/>
  return <div className="app-shell">{mode === 'fixture' && <div className="prototype-mode-label"><strong>FICTIONAL — DEMO ONLY · REKAAN</strong><span>Prototype · Future integrations are simulated</span><NavLink to="/profile#pd-group-lab">Demo lab</NavLink></div>}{showHero && <HeroIntro onDone={finishHero}/>}{mode === 'connected' && <div className={`mode-banner ${mode}`}><Sparkles size={14}/>{(/^\/sandbox(?:\/|$)/.test(window.location.pathname) ? ui('Connected sandbox · Fictional data · Permissions enforced') : ui('PasarMalam · Community markets'))}</div>}<SiteHeader mode={mode} role={role} links={links} onCustomerRoute={customerPaths.includes(pathname) || /^\/(?:stalls|markets)\//.test(pathname)} onRole={changeRole} hideRoleSwitch={pathname === '/hawker/login'}/><main id="main" className={`main-content ${mode==='fixture'?'prototype-main':''}`}><div className={`${pageTheme(pathname)} page-wrapper ${pagePhase}`}>{realCheckEnabled && realCheck.isPending ? <p className="panel state-panel" role="status">{ui('Checking connection…')}</p> : realCheckEnabled && realCheck.data === false ? <RealEnvUnavailable hawker={/^\/(?:hawker|vendor)(?:\/|$)/.test(pathname)}/> : <DiscoverStateProvider><Routes><Route path="/" element={mode==='fixture'?<Navigate to="/discover" replace/>:<DemoSplash/>}/><Route path="/discover" element={<DiscoveryPage gateway={gateway}/>}/><Route path="/markets" element={<MarketsPage gateway={gateway}/>}/><Route path="/markets/:id" element={<DiscoveryDetail gateway={gateway} kind="market"/>}/><Route path="/stalls/:id" element={<DiscoveryDetail gateway={gateway} kind="stall"/>}/><Route path="/potential" element={<Suspense fallback={<p>Loading prototype…</p>}><PrototypePage/></Suspense>}/><Route path="/presentation" element={<Suspense fallback={<p>Loading…</p>}><PresentationPage/></Suspense>}/><Route path="/advanced" element={<Suspense fallback={<p>Loading…</p>}><AdvancedPage/></Suspense>}/><Route path="/partners" element={mode==='fixture'?<PartnerOverview/>:<Suspense fallback={<p>Loading…</p>}><PartnerPage/></Suspense>}/><Route path="/partners/workspace" element={<Suspense fallback={<p>Loading…</p>}><PartnerPage/></Suspense>}/><Route path="/commerce" element={<Suspense fallback={<p>Loading…</p>}><CommercePage/></Suspense>}/><Route path="/planner" element={<Suspense fallback={<p>Loading…</p>}><MarketRunPlanner gateway={gateway}/></Suspense>}/><Route path="/offers" element={<Offers gateway={gateway}/>}/><Route path="/saved" element={<SavedPage gateway={gateway}/>}/><Route path="/profile" element={<Profile mode={mode}/>}/><Route path="/passports/:id" element={<Suspense fallback={<p>Loading…</p>}><PassportPage mode={mode}/></Suspense>}/><Route path="/impact" element={mode==='fixture'?<CommunityImpact/>:<Suspense fallback={<p>Loading…</p>}><ImpactPage/></Suspense>}/><Route path="/organizer/report" element={<MarketHealthReport/>}/><Route path="/hawker/accounting" element={<Suspense fallback={<p>Loading…</p>}><AccountingPage mode={mode}/></Suspense>}/><Route path="/hawker/batch-lifecycle/:batchId" element={<Suspense fallback={<p>Loading…</p>}><BatchLifecyclePage mode={mode}/></Suspense>}/><Route path="/hawker/handling/:id" element={<Suspense fallback={<p>Loading…</p>}><HandlingPage mode={mode}/></Suspense>}/><Route path="/hawker/voice" element={<Suspense fallback={<p>{ui('Loading…')}</p>}><VoicePage mode={mode}/></Suspense>}/><Route path="/hawker/planning" element={<Suspense fallback={<p>Loading…</p>}><PlanningPage/></Suspense>}/><Route path="/evaluation" element={<Suspense fallback={<p>{ui('Loading…')}</p>}><EvaluationPage/></Suspense>}/><Route path="/vendor" element={<Navigate to="/hawker/dashboard" replace/>}/><Route path="/hawker/login" element={mode==='fixture'?<HawkerLogin onEnter={enterHawker}/>:<Navigate to="/hawker/dashboard" replace/>}/><Route path="/hawker/settings" element={<HawkerSettings/>}/><Route path="/hawker/dashboard" element={<VendorPage mode={mode} view="dashboard"/>}/><Route path="/hawker/stall" element={<VendorPage mode={mode} view="stall"/>}/><Route path="/hawker/batches" element={<Navigate to="/hawker/stall#batches" replace/>}/><Route path="/hawker/promotions" element={<FreshPage mode={mode}/>}/><Route path="/hawker/alerts" element={<Navigate to="/hawker/promotions" replace/>}/><Route path="/community" element={<Suspense fallback={<p>Loading…</p>}><CommunityPage key={mode==='fixture'?'fixture':actor?.id??'guest'}/></Suspense>}/><Route path="/community/:id" element={<Suspense fallback={<p>Loading…</p>}><CommunityPage key={mode==='fixture'?'fixture':actor?.id??'guest'}/></Suspense>}/><Route path="/admin/*" element={<DemoAdmin mode={mode}/>}/><Route path="*" element={<EmptyState/>}/></Routes></DiscoverStateProvider>}</div></main><SiteFooter/><nav className="mobile-nav" aria-label={t('mobileNavigation')}>{links.map(({to,label,icon:Icon}) => <NavLink key={to} to={to} className={({isActive}) => `mobile-link ${isActive?'active':''}`}><Icon size={21}/><span>{t(label)}</span></NavLink>)}</nav></div>
}
