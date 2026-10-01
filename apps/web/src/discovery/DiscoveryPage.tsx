import { lazy, Suspense, useEffect, useState } from 'react'
import { NavLink, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Heart, MapPin, Search, Star } from 'lucide-react'
import type { DataGateway, Market, Stall } from '../data/types'
import { fixtureClock, systemClock } from '../app/clock'
import { useSampleMode } from '../app/config'
import { useAuth } from '../auth/context'
import { connectedRequest } from '../auth/client'
import { defaultFilters, dietaryStatus, discover, distanceKm, eligibleOffers, scheduleStatus, type Filters } from './engine'
import { useDiscovery } from './useDiscovery'
import { checkIn, useFavourites } from './actions'
import { coarsePoint, requestDeviceLocation } from './location'

const MarketMap = lazy(() => import('./MarketMap'))
export function useNow(gateway: DataGateway) {
  const clock = gateway.mode === 'fixture' ? fixtureClock : systemClock
  const [now, setNow] = useState(clock.now())
  useEffect(() => { const timer = setInterval(() => { if (document.visibilityState !== 'hidden') setNow(clock.now()) },1000); return () => clearInterval(timer) }, [clock])
  return now
}
function State({ query, gateway }: { query: ReturnType<typeof useDiscovery>; gateway: DataGateway }) {
  const { t } = useTranslation()
  return <div className="panel state-panel" role={query.isError ? 'alert' : 'status'}><h2>{t(query.isError ? 'errorTitle' : 'loading')}</h2>{query.isError && <><p>{t('requestUnavailable')}</p><button className="button secondary" onClick={() => void query.refetch()}>{t('tryAgain')}</button>{gateway.mode === 'connected' && <button className="button primary" onClick={useSampleMode}>{t('openSample')}</button>}</>}</div>
}
function Freshness({ query, gateway }: { query: ReturnType<typeof useDiscovery>; gateway: DataGateway }) {
  const { t } = useTranslation()
  return <p className="small muted" role="status">{t(query.stale ? 'staleResults' : query.live ? 'liveResults' : gateway.mode === 'fixture' ? 'fixtureResults' : 'pollResults')}{query.isFetching ? ` · ${t('refreshing')}` : ''}</p>
}
export function DiscoveryStallCard({ stall, market, now, distance }: { stall: Stall; market?: Market; now: Date; distance?: number }) {
  const { t } = useTranslation()
  return <NavLink className="stall-card card-link" to={`/stalls/${stall.id}`}><div className="food-art" aria-hidden="true">{stall.image}</div><div className="stall-content"><div className="eyebrow">{stall.category}</div><h3>{stall.name}</h3><p className="muted">{stall.specialty} · {market?.name}</p><p className="dietary-label">{t(`diet_${dietaryStatus(stall,now)}`)}</p><p className="small muted">{t(stall.open ? 'vendorOpen' : 'vendorClosed')}{distance !== undefined ? ` · ${distance.toFixed(1)} km` : ''}</p><div className="stall-bottom"><span className="rating"><Star size={14}/>{stall.reviews ? `${stall.rating.toFixed(1)} (${stall.reviews})` : t('noReviews')}</span><span>RM {(stall.priceSen/100).toFixed(2)}</span></div></div></NavLink>
}

export function DiscoveryPage({ gateway }: { gateway: DataGateway }) {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [locationMessage, setLocationMessage] = useState('manualLocation')
  const [geoExpires, setGeoExpires] = useState(0)
  const [mapLookup, setMapLookup] = useState('')
  const [areaChoice, setAreaChoice] = useState('')
  const now = useNow(gateway)
  const query = useDiscovery(gateway, data => discover(data,filters,now,page).markets.map(m => m.id))
  const change = (next: Partial<Filters>) => { setFilters(current => ({...current,...next})); setPage(0) }
  useEffect(() => {
    if (filters.search === search) return
    const timer = setTimeout(() => { setFilters(current => ({...current,search})); setPage(0) },300)
    return () => clearTimeout(timer)
  }, [search,filters.search])
  useEffect(() => {
    if (!geoExpires) return
    const timer = setTimeout(() => { setFilters(current => ({...current,origin:null})); setGeoExpires(0); setLocationMessage('locationExpired') },Math.max(0,geoExpires-Date.now()))
    return () => clearTimeout(timer)
  }, [geoExpires])
  useEffect(() => {
    if (gateway.mode !== 'connected' || !filters.origin) return
    const controller = new AbortController()
    const b = filters.bounds
    const coarse = coarsePoint(filters.origin)
    const params = new URLSearchParams({lat:String(coarse.latitude),lon:String(coarse.longitude),radius:String(Math.round(filters.radius*1000))})
    if (b) for (const name of ['south','west','north','east'] as const) params.set(name,b[name].toFixed(2))
    void connectedRequest(`/api/v1/discovery/nearby?${params}`,{signal:controller.signal}).then(async response => {
      if (!response.ok) throw new Error('Unavailable')
      await response.json()
      if (!controller.signal.aborted) setMapLookup('geographicConfirmed')
    }).catch(() => { if (!controller.signal.aborted) setMapLookup('geographicUnavailable') })
    return () => controller.abort()
  }, [gateway.mode,filters.origin,filters.bounds,filters.radius])
  async function locate() {
    setLocationMessage('locating')
    try {
      const point = await requestDeviceLocation(navigator.geolocation)
      change({origin:point,market:''})
      setAreaChoice('')
      setGeoExpires(Date.now()+7200000); setLocationMessage('deviceLocation')
    } catch { setLocationMessage('locationDenied') }
  }
  const data = query.data
  const result = data ? discover(data,filters,now,page) : null
  return <><header className="page-intro"><div className="eyebrow">✳ {t('discoverEyebrow')}</div><h1>{t('discoverTitle')}</h1><p>{t('discoverBody')}</p></header>
    <div className="search-wrap"><Search size={20}/><label className="sr-only" htmlFor="market-search">{t('findFood')}</label><input id="market-search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('findFood')}/></div>
    <section className="panel discovery-controls" aria-label={t('discoveryFilters')}>
      <label>{t('chooseMarket')}<select value={filters.market} onChange={e => change({market:e.target.value})}><option value="">{t('anyMarket')}</option>{data?.markets.map(m => <option key={m.id} value={m.id}>{m.name} · {m.area}</option>)}</select></label>
      <label>{t('chooseArea')}<select value={areaChoice} onChange={e => {
        const market = data?.markets.find(m => m.id === e.target.value)
        setAreaChoice(e.target.value)
        change({origin:market?.latitude !== null && market?.longitude !== null && market ? {latitude:market.latitude,longitude:market.longitude} : null,bounds:null})
        setGeoExpires(0); setLocationMessage('manualLocation')
      }}><option value="">{t('noArea')}</option>{data?.markets.map(m => <option key={m.id} value={m.id}>{m.area} · {m.name}</option>)}</select></label>
      <label>{t('marketType')}<select value={filters.type} onChange={e => change({type:e.target.value})}><option value="">{t('allTypes')}</option><option value="night">{t('night')}</option><option value="day">{t('day')}</option></select></label>
      <label>{t('category')}<select value={filters.category} onChange={e => change({category:e.target.value})}><option value="">{t('allCategories')}</option>{[...new Set(data?.stalls.map(s => s.category))].sort().map(c => <option key={c}>{c}</option>)}</select></label>
      <label>{t('dietary')}<select value={filters.dietary} onChange={e => change({dietary:e.target.value})}><option value="">{t('allDietary')}</option>{['certified','declared','non-halal','not-declared'].map(value => <option key={value} value={value}>{t(`diet_${value}`)}</option>)}</select></label>
      <label>{t('sortResults')}<select value={filters.sort} onChange={e => change({sort:e.target.value})}><option value="rating">{t('bestReviewed')}</option><option value="popularity">{t('popularity')}</option><option value="nearest" disabled={!filters.origin}>{t('nearest')}</option></select></label>
      <label>{t('distanceRadius')}<select value={filters.radius} onChange={e => change({radius:Number(e.target.value)})} disabled={!filters.origin}>{[1,5,10,25,50,100].map(km => <option key={km} value={km}>{km} km</option>)}</select></label>
      <label className="choice-row"><span>{t('promotionOnly')}</span><input type="checkbox" checked={filters.promotion} onChange={e => change({promotion:e.target.checked})}/></label>
      <div className="button-row"><button className="button secondary" onClick={locate}><MapPin size={16}/>{t('useLocation')}</button><button className="button secondary" onClick={() => {setSearch('');change(defaultFilters);setAreaChoice('');setGeoExpires(0);setLocationMessage('manualLocation')}}>{t('resetFilters')}</button></div>
      <p role="status" className="small muted">{t(locationMessage)}{mapLookup && gateway.mode === 'connected' && filters.origin ? ` · ${t(mapLookup)}` : ''} {t('marketDistance')}</p>
    </section>
    {!data || !result ? <State query={query} gateway={gateway}/> : <><Freshness query={query} gateway={gateway}/><div className="section-heading"><h2>{t('resultsCount',{count:result.total})}</h2><button className="button secondary" aria-pressed={showMap} onClick={() => setShowMap(!showMap)}>{t(showMap ? 'hideMap' : 'showMap')}</button></div>
      {showMap && <Suspense fallback={<p role="status">{t('loading')}</p>}><MarketMap markets={result.markets} onBounds={bounds => change({bounds})}/></Suspense>}
      <div className="market-grid">{result.markets.map(m => <NavLink className="panel market-summary card-link" key={m.id} to={`/markets/${m.id}`}><span className="eyebrow">{t(m.type)}</span><h3>{m.name}</h3><p>{m.area} · {m.hours}</p><span className={`status-pill ${scheduleStatus(m,now)}`}>{t(scheduleStatus(m,now))}</span><p className="small muted">{t('scheduleOnly')} · {m.days}</p></NavLink>)}</div>
      <div className="stall-grid">{result.stalls.map(s => { const m = data.markets.find(m => m.id === s.marketId); return <DiscoveryStallCard key={s.id} stall={s} market={m} now={now} distance={filters.origin && m?.latitude !== null && m?.longitude !== null && m ? distanceKm(filters.origin,{latitude:m.latitude,longitude:m.longitude}) : undefined}/> })}</div>
      {!result.total && <div className="panel state-panel"><h2>{t('noMatches')}</h2><p>{t('relaxFilters')}</p></div>}
      <nav className="pagination" aria-label={t('resultPages')}><button className="button secondary" disabled={result.page === 0} onClick={() => setPage(result.page-1)}><ArrowLeft size={16}/>{t('previous')}</button><span>{result.page+1} / {result.pages}</span><button className="button secondary" disabled={result.page+1 >= result.pages} onClick={() => setPage(result.page+1)}>{t('next')}<ArrowRight size={16}/></button></nav></>}
  </>
}

export function DiscoveryDetail({ gateway, kind }: {gateway:DataGateway;kind:'market'|'stall'}) {
  const {id} = useParams()
  const {t,i18n} = useTranslation()
  const now = useNow(gateway)
  const query = useDiscovery(gateway,data => kind === 'market' && id ? [id] : data.markets.filter(m => data.stalls.some(s => s.id === id && s.marketId === m.id)).map(m => m.id))
  const saved = useFavourites(gateway)
  const {actor} = useAuth()
  const [message,setMessage] = useState('')
  const [busy,setBusy] = useState(false)
  const data = query.data
  if (!data) return <State query={query} gateway={gateway}/>
  const market = data.markets.find(m => m.id === (kind === 'market' ? id : data.stalls.find(s => s.id === id)?.marketId))
  const stall = kind === 'stall' ? data.stalls.find(s => s.id === id) : null
  if (!market || kind === 'stall' && !stall) return <div className="panel state-panel">{t('noMatches')}</div>
  const action = async (run:() => Promise<unknown>, success:string) => { setBusy(true); try { const result=await run();setMessage(result === false ? 'alreadyCheckedIn' : success); if (kind === 'market') await query.refetch() } catch {setMessage('actionFailed')} finally {setBusy(false)} }
  const timestamp = (value:string) => new Intl.DateTimeFormat(i18n.language === 'ms' ? 'ms-MY' : 'en-MY',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(value))
  return <><NavLink className="back-link" to="/discover"><ArrowLeft size={17}/>{t('back')}</NavLink><header className="detail-hero"><div className="detail-symbol" aria-hidden="true">{stall?.image ?? market.cover}</div><div><div className="eyebrow">{t(kind === 'stall' ? 'foodStall' : 'market')}</div><h1>{stall?.name ?? market.name}</h1><p>{market.area} · {market.hours}</p><p>{t('scheduleOnly')}: {t(scheduleStatus(market,now))}</p>{stall && <><p>{t(stall.open ? 'vendorOpen' : 'vendorClosed')}</p><p>{t(`diet_${dietaryStatus(stall,now)}`)}</p></>}</div></header><Freshness query={query} gateway={gateway}/>
    {message && <p role="status" className="panel">{t(message)}</p>}
    {kind === 'market' ? <><button className="button primary" disabled={busy || gateway.mode === 'connected' && !actor?.roles.includes('customer')} onClick={() => void action(async () => {const created=await checkIn(gateway,market.id);setMessage(created ? 'checkedIn' : 'alreadyCheckedIn');return created},'checkedIn')}>{t('checkIn')}</button><p className="small muted">{t('checkInLimit')}</p><div className="stall-grid">{data.stalls.filter(s => s.marketId === market.id).map(s => <DiscoveryStallCard key={s.id} stall={s} market={market} now={now}/>)}</div></>
      : stall && <><button className="button secondary" disabled={busy || !saved.allowed || saved.loading || saved.error} onClick={() => void action(() => saved.save(stall.id,!saved.ids.includes(stall.id)),'savedUpdated')}><Heart size={18}/>{t(saved.ids.includes(stall.id) ? 'unsaveStall' : 'saveStall')}</button>{!saved.allowed && <p><NavLink to="/profile">{t('signInToSave')}</NavLink></p>}<section className="panel detail-panel"><h2>{t('menu')}</h2>{data.menu.filter(f => f.stallId === stall.id).map(f => {
        const batches = data.batches.filter(b => b.foodItemId === f.id && Date.parse(b.deadline)>now.getTime() && b.remaining>0)
        return <article className="menu-item" key={f.id}><h3>{f.name} · RM {(f.priceSen/100).toFixed(2)}</h3><p>{f.ingredients.join(', ')}</p><p>{t(`diet_${dietaryStatus(stall,now,f.id)}`)}</p><p className="small muted">{t('photoPending')}</p>{batches.length ? batches.map(b => <div className="batch-detail" key={b.id}><strong>{t('batchNumber',{number:b.batchNumber})}</strong><p>{t('preparedAt')}: {timestamp(b.preparedAt)}</p><p>{t('uploadedAt')}: {timestamp(b.uploadedAt)}</p><p>{t('advisoryUntil')}: {timestamp(b.deadline)}</p><p>{t('remainingUnits',{count:b.remaining})}</p></div>) : <p className="muted">{t('noActiveBatches')}</p>}</article>
      })}{!data.menu.some(f => f.stallId === stall.id) && <p>{t('emptyMenu')}</p>}</section><section className="panel detail-panel"><h2>{t('offers')}</h2>{eligibleOffers(data,now).filter(o => o.stallId === stall.id).map(o => <p key={o.id}>{o.title} · RM {(o.priceSen/100).toFixed(2)} · {timestamp(o.endsAt)}</p>)}{!eligibleOffers(data,now).some(o => o.stallId === stall.id) && <p>{t('noOffers')}</p>}</section><section className="panel detail-panel"><h2>{t('reviews')}</h2>{data.publicReviews.filter(r => r.stallId === stall.id).map(r => <article key={r.id}><strong>{r.rating}/5</strong><p>{r.body}</p></article>)}{!data.publicReviews.some(r => r.stallId === stall.id) && <p>{t('noReviews')}</p>}</section></>}
  </>
}

export function SavedPage({gateway}:{gateway:DataGateway}) {
  const {t} = useTranslation()
  const query = useDiscovery(gateway,[])
  const saved = useFavourites(gateway)
  const now = useNow(gateway)
  return <><header className="page-intro"><div className="eyebrow">{t('saved')}</div><h1>{t('savedTitle')}</h1><p>{t('savedBody')}</p></header>{!saved.allowed ? <NavLink className="button primary" to="/profile">{t('signInToSave')}</NavLink> : !query.data ? <State query={query} gateway={gateway}/> : saved.error ? <p role="alert">{t('actionFailed')}</p> : saved.loading ? <p>{t('loading')}</p> : <div className="stall-grid">{query.data.stalls.filter(s => saved.ids.includes(s.id)).map(s => <DiscoveryStallCard key={s.id} stall={s} market={query.data?.markets.find(m => m.id === s.marketId)} now={now}/>)}</div>}{saved.allowed && !saved.loading && !saved.error && !saved.ids.length && <p className="panel">{t('emptySaved')}</p>}</>
}
