import TelemetryConsent from '../impact/TelemetryConsent'
import { categories } from './classifications'
import { ui } from '../locales/phrases'
import { Availability, PlantStatement, Directions } from './DiscoveryMetadata'
import { BusinessStatements, AllergenStatement } from '../listings/ListingStatements'
import { EditorialBadge } from '../partners/EditorialBadge'
import { connectedAds } from '../commerce/connected'
import { Sponsored, sponsored } from '../commerce/Sponsored'
import { PublicFlag } from '../community/PublicFlag'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { NavLink, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Heart, MapPin, Search, Star } from 'lucide-react'
import type { DataGateway, Market, Stall } from '../data/types'
import { fixtureClock } from '../app/clock'
import { DemoDialog } from '../app/DemoDialog'
import { useAuth } from '../auth/context'
import { connectedRequest } from '../auth/client'
import { defaultFilters, dietaryStatus, discover, distanceKm, eligibleOffers, scheduleStatus, type Filters } from './engine'
import { useDiscovery } from './useDiscovery'
import { checkIn, useFavourites } from './actions'
import { coarsePoint, requestDeviceLocation } from './location'

import { DemoImage } from '../components/DemoImage'
import { foodImage } from '../components/demo-images'
import { DiscoveryIntro, DiscoveryCategories } from './DiscoveryIntro'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
const MarketMap = lazy(() => import('./MarketMap'))
export function useNow(gateway: DataGateway) {
  const snapshot=useQuery({queryKey:['discovery',gateway.mode],queryFn:()=>gateway.getDiscovery(),enabled:false})
  const anchor=useMemo(()=>({server:snapshot.data?.server_now?Date.parse(snapshot.data.server_now):Infinity,elapsed:performance.now(),received:snapshot.dataUpdatedAt}),[snapshot.data?.server_now,snapshot.dataUpdatedAt])
  const [elapsed,setElapsed]=useState(0)
  useEffect(()=>{const timer=setInterval(()=>{if(document.visibilityState!=='hidden')setElapsed(performance.now())},1000);return()=>clearInterval(timer)},[])
  return gateway.mode==='fixture'?fixtureClock.now():new Date(Number.isFinite(anchor.server)?anchor.server+Math.max(0,elapsed-anchor.elapsed):8640000000000000)
}
function State({ query, gateway }: { query: ReturnType<typeof useDiscovery>; gateway: DataGateway }) {
  const { t } = useTranslation()
  return <div className="panel state-panel" role={query.isError ? 'alert' : 'status'}><h2>{t(query.isError ? 'errorTitle' : 'loading')}</h2>{query.isError && <><p>{t('requestUnavailable')}</p><button className="button secondary" onClick={() => void query.refetch()}>{t('tryAgain')}</button>{gateway.mode === 'connected' && <DemoDialog/>}</>}</div>
}
function Freshness({ query, gateway }: { query: ReturnType<typeof useDiscovery>; gateway: DataGateway }) {
  const { t } = useTranslation()
  return <p className="small muted" role="status">{t(query.stale ? 'staleResults' : query.live ? 'liveResults' : gateway.mode === 'fixture' ? 'fixtureResults' : 'pollResults')}{query.isFetching ? ` · ${t('refreshing')}` : ''}</p>
}
export function DiscoveryStallCard({ stall, market, now, distance }: { stall: Stall; market?: Market; now: Date; distance?: number }) {
  const { t } = useTranslation()
  return <NavLink className="stall-card card-link" to={`/stalls/${stall.id}`}><div className="food-art"><DemoImage image={foodImage(stall.specialty)} description={`${stall.specialty} from ${stall.name}`}/></div><div className="stall-content"><div className="eyebrow">{stall.category}</div><h3>{stall.name}</h3><PublicFlag stall={stall.id}/><EditorialBadge stall={stall.id}/><p className="muted">{stall.specialty} · {market?.name}</p><p className="dietary-label">{t(`diet_${dietaryStatus(stall,now)}`)}</p><p className="small muted">{t(stall.open ? 'vendorOpen' : 'vendorClosed')}{distance !== undefined ? ` · ${distance.toFixed(1)} km` : ''}</p><Availability at={stall.availabilityConfirmedAt} now={now}/><div className="stall-bottom"><span className="rating"><Star size={14}/>{stall.reviews ? `${stall.rating.toFixed(1)} (${stall.reviews})` : t('noReviews')}</span><span>RM {(stall.priceSen/100).toFixed(2)}</span></div></div></NavLink>
}

export function DiscoveryPage({ gateway }: { gateway: DataGateway }) {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [showMap, setShowMap] = useState(false)
  const [filtersOpen,setFiltersOpen] = useState(false)
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
  const advertisements=useQuery({queryKey:['commerce-ads',gateway.mode],queryFn:connectedAds,enabled:gateway.mode==='connected',refetchInterval:10000})
  const result = data ? discover(data,filters,now,page) : null
  return <><DiscoveryIntro data={data} filters={filters}/>
    <div className="search-wrap"><Search size={20}/><label className="sr-only" htmlFor="market-search">{t('findFood')}</label><input id="market-search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('findFood')}/></div>
    <div className="discovery-action-bar"><button className="button secondary" aria-expanded={filtersOpen} aria-controls="discovery-filter-panel" onClick={()=>setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={18}/>{t('discoveryFilters')}<ChevronDown size={16}/>{(filters.marketKind||filters.plantDiet||filters.maxPriceSen!=null||filters.category||filters.dietary||filters.type||filters.promotion||filters.market)&&<span className="filter-applied">•</span>}</button><div className="browse-tabs" role="group" aria-label={t('sortResults')}><button className={filters.sort==='rating'?'active':''} aria-pressed={filters.sort==='rating'} onClick={()=>change({sort:'rating'})}>{t('bestReviewed')}</button><button className={filters.sort==='popularity'?'active':''} aria-pressed={filters.sort==='popularity'} onClick={()=>change({sort:'popularity'})}>{t('popularity')}</button><button className={filters.sort==='nearest'?'active':''} aria-pressed={filters.sort==='nearest'} disabled={!filters.origin} onClick={()=>change({sort:'nearest'})}>{t('nearest')}</button></div><button className="button secondary" aria-pressed={showMap} onClick={()=>setShowMap(!showMap)}><MapPin size={17}/>{t(showMap?'hideMap':'showMap')}</button></div>
    <section id="discovery-filter-panel" hidden={!filtersOpen} className="panel discovery-controls" aria-label={t('discoveryFilters')}>
      <label>{t('chooseMarket')}<select value={filters.market} onChange={e => change({market:e.target.value})}><option value="">{t('anyMarket')}</option>{data?.markets.map(m => <option key={m.id} value={m.id}>{m.name} · {m.area}</option>)}</select></label>
      <label>{t('chooseArea')}<select value={areaChoice} onChange={e => {
        const market = data?.markets.find(m => m.id === e.target.value)
        setAreaChoice(e.target.value)
        change({origin:market?.latitude !== null && market?.longitude !== null && market ? {latitude:market.latitude,longitude:market.longitude} : null,bounds:null})
        setGeoExpires(0); setLocationMessage('manualLocation')
      }}><option value="">{t('noArea')}</option>{data?.markets.map(m => <option key={m.id} value={m.id}>{m.area} · {m.name}</option>)}</select></label>
      <label>{t('marketType')}<select value={filters.type} onChange={e => change({type:e.target.value})}><option value="">{t('allTypes')}</option><option value="night">{t('night')}</option><option value="day">{t('day')}</option></select></label>
      <label>{ui('Market classification')}<select value={filters.marketKind??''} onChange={e=>change({marketKind:e.target.value})}><option value="">{ui('All market classifications')}</option><option value="general">{ui('General market')}</option><option value="farmers">{ui('Farmers’ market')}</option></select></label>
      <label>{t('category')}<select value={filters.category} onChange={e => change({category:e.target.value})}><option value="">{t('allCategories')}</option>{categories.map(c=><option key={c.id} value={c.id}>{ui(c.en)}</option>)}</select></label>
      <label>{t('dietary')}<select value={filters.dietary} onChange={e => change({dietary:e.target.value})}><option value="">{t('allDietary')}</option>{['certified','declared','non-halal','not-declared'].map(value => <option key={value} value={value}>{t(`diet_${value}`)}</option>)}</select></label>
      <label>{ui('Plant diet')}<select value={filters.plantDiet??''} onChange={e=>change({plantDiet:e.target.value})}><option value="">{ui('Any plant-diet status')}</option><option value="vegetarian">{ui('Vendor-declared vegetarian')}</option><option value="vegan">{ui('Vendor-declared vegan')}</option></select></label>
      <div><label>{ui('Maximum menu-unit price (RM)')}<input type="number" min="0" max="1000000" step="0.01" value={filters.maxPriceSen==null?'':(filters.maxPriceSen/100)} onChange={e=>change({maxPriceSen:e.target.value===''?null:Math.round(e.target.valueAsNumber*100)})}/></label><div className="button-row"><button className="button secondary" onClick={()=>change({maxPriceSen:500})}>RM5</button><button className="button secondary" onClick={()=>change({maxPriceSen:1000})}>RM10</button></div></div>
      <p className="small muted">{ui('Budget matches one menu item before discounts; bundles and clearance offers are excluded from this price basis.')}</p>
      <label>{t('sortResults')}<select value={filters.sort} onChange={e => change({sort:e.target.value})}><option value="rating">{t('bestReviewed')}</option><option value="popularity">{t('popularity')}</option><option value="nearest" disabled={!filters.origin}>{t('nearest')}</option></select></label>
      <label>{t('distanceRadius')}<select value={filters.radius} onChange={e => change({radius:Number(e.target.value)})} disabled={!filters.origin}>{[1,5,10,25,50,100].map(km => <option key={km} value={km}>{km} km</option>)}</select></label>
      <label className="choice-row"><span>{t('promotionOnly')}</span><input type="checkbox" checked={filters.promotion} onChange={e => change({promotion:e.target.checked})}/></label>
      <div className="button-row"><button className="button secondary" onClick={locate}><MapPin size={16}/>{t('useLocation')}</button><button className="button secondary" onClick={() => {setSearch('');change(defaultFilters);setAreaChoice('');setGeoExpires(0);setLocationMessage('manualLocation')}}>{t('resetFilters')}</button></div>
      <p role="status" className="small muted">{t(locationMessage)}{mapLookup && gateway.mode === 'connected' && filters.origin ? ` · ${t(mapLookup)}` : ''} {t('marketDistance')}</p>
    </section>
    {data&&<DiscoveryCategories data={data} selected={filters.category} onChange={category=>change({category})}/>}
    {!data || !result ? <State query={query} gateway={gateway}/> : <><Freshness query={query} gateway={gateway}/><div className="section-heading discovery-results-heading"><h2>{t('allMarkets')}</h2><span>{t('resultsCount',{count:result.total})}</span></div>
      {showMap && <Suspense fallback={<p role="status">{t('loading')}</p>}><MarketMap markets={result.markets} sponsors={new Set(sponsored(data,filters,now,gateway.mode==='fixture'?undefined:advertisements.data??[]).map(c=>c.market))} onBounds={bounds => change({bounds})}/></Suspense>}
      <div className="market-grid">{result.markets.map(m => <NavLink className="panel market-summary card-link" key={m.id} to={`/markets/${m.id}`}><DemoImage image={m.type==='day'?'day':'night'} description={`${m.name} · ${m.type}`}/><div className="market-summary-copy"><span className="eyebrow">{t(m.type)} · {ui(m.kind==='farmers'?'Farmers’ market':'General market')}</span><h3>{m.name}</h3><p><MapPin size={14}/>{m.area}</p><div className="market-card-meta"><span className={`status-pill ${scheduleStatus(m,now)}`}>{scheduleStatus(m,now)==='closing-soon'?ui('Closing soon'):t(scheduleStatus(m,now))}</span><span>{m.hours}</span></div><p className="small muted">{t('scheduleOnly')} · {m.days}</p></div></NavLink>)}</div>
      <div className="section-heading"><h2>{t('featuredStalls')}</h2></div><Sponsored data={data} filters={filters} now={now} campaigns={gateway.mode==='connected'?advertisements.data??[]:undefined}/><div className="stall-grid">{result.stalls.map(s => { const m = data.markets.find(m => m.id === s.marketId); return <DiscoveryStallCard key={s.id} stall={s} market={m} now={now} distance={filters.origin && m?.latitude !== null && m?.longitude !== null && m ? distanceKm(filters.origin,{latitude:m.latitude,longitude:m.longitude}) : undefined}/> })}</div>
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
  return <>{stall&&<TelemetryConsent mode={gateway.mode} stall={stall.id}/>}<NavLink className="back-link" to="/discover"><ArrowLeft size={17}/>{t('back')}</NavLink><header className="detail-hero"><div className="detail-symbol"><DemoImage image={stall?foodImage(stall.specialty):market.type==='day'?'day':'night'} description={stall ? `${stall.name} stall and food` : `${market.name} market scene`}/></div><div><div className="eyebrow">{t(kind === 'stall' ? 'foodStall' : 'market')}</div><h1>{stall?.name ?? market.name}</h1><p>{market.area} · {market.hours}</p><p>{t('scheduleOnly')}: {scheduleStatus(market,now)==='closing-soon'?ui('Closing soon'):t(scheduleStatus(market,now))} · {ui(market.kind==='farmers'?'Farmers’ market':'General market')}</p>{stall && <><p>{stall.description}</p><BusinessStatements value={stall.declarations} at={stall.declarationsRecordedAt}/><p>{t(stall.open ? 'vendorOpen' : 'vendorClosed')}</p><Availability at={stall.availabilityConfirmedAt} now={now}/>{stall.lot&&<p>Lot {stall.lot} · {stall.opens}–{stall.closes}</p>}{stall.latitude!==null&&stall.longitude!==null&&<a className="back-link" href={`https://www.openstreetmap.org/?mlat=${stall.latitude}&mlon=${stall.longitude}#map=18/${stall.latitude}/${stall.longitude}`} target="_blank" rel="noreferrer">Stall location: {stall.latitude.toFixed(5)}, {stall.longitude.toFixed(5)}</a>}<p>{t(`diet_${dietaryStatus(stall,now)}`)}</p></>}</div></header><Directions latitude={stall?.latitude??market.latitude} longitude={stall?.longitude??market.longitude}/>{stall&&stall.latitude==null&&<p className="small muted">{ui("Directions use the market entrance; the stall pin is missing.")}</p>}<Freshness query={query} gateway={gateway}/>
    {message && <p role="status" className="panel">{t(message)}</p>}
    {kind === 'market' ? <><button className="button primary" disabled={busy || gateway.mode === 'connected' && !actor?.roles.includes('customer')} onClick={() => void action(async () => {const created=await checkIn(gateway,market.id);setMessage(created ? 'checkedIn' : 'alreadyCheckedIn');return created},'checkedIn')}>{t('checkIn')}</button><p className="small muted">{t('checkInLimit')}</p><div className="stall-grid">{data.stalls.filter(s => s.marketId === market.id).map(s => <DiscoveryStallCard key={s.id} stall={s} market={market} now={now}/>)}</div></>
      : stall && <><button className="button secondary" disabled={busy || !saved.allowed || saved.loading || saved.error} onClick={() => void action(() => saved.save(stall.id,!saved.ids.includes(stall.id)),'savedUpdated')}><Heart size={18}/>{t(saved.ids.includes(stall.id) ? 'unsaveStall' : 'saveStall')}</button>{!saved.allowed && <p><NavLink to="/profile">{t('signInToSave')}</NavLink></p>}<section className="panel detail-panel"><h2>{t('menu')}</h2>{data.menu.filter(f => f.stallId === stall.id).map(f => {
        const batches = data.batches.filter(b => b.foodItemId === f.id && Date.parse(b.deadline)>now.getTime() && b.remaining>0)
        return <article className="menu-item" key={f.id}><h3>{f.name} · RM {(f.priceSen/100).toFixed(2)}</h3><p>{f.ingredients.join(', ')}</p><PlantStatement value={f.plantDiet} at={f.plantDietRecordedAt}/><AllergenStatement value={f.allergens} at={f.allergensRecordedAt}/><p>{t(`diet_${dietaryStatus(stall,now,f.id)}`)}</p><DemoImage image={foodImage(f.name)} description={`${f.name}, representative dish illustration`}/>{batches.length ? batches.map(b => <div className="batch-detail" key={b.id}><strong>{t('batchNumber',{number:b.batchNumber})}</strong><NavLink className="back-link" to={`/passports/${b.id}`}>{ui('Batch passport')}</NavLink><ImagePlaceholder description={`${f.name}, freshly prepared batch ${b.batchNumber}`}/>{b.correctedPreparedAt&&<p>Earlier preparation correction: {timestamp(b.correctedPreparedAt)}</p>}<p>{t('preparedAt')}: {timestamp(b.preparedAt)}</p><p>{t('uploadedAt')}: {timestamp(b.uploadedAt)}</p><p>{t('advisoryUntil')}: {timestamp(b.deadline)}</p><p>{t('remainingUnits',{count:b.remaining})}</p></div>) : <p className="muted">{t('noActiveBatches')}</p>}</article>
      })}{!data.menu.some(f => f.stallId === stall.id) && <p>{t('emptyMenu')}</p>}</section><section className="panel detail-panel"><h2>{t('offers')}</h2>{eligibleOffers(data,now).filter(o => o.stallId === stall.id).map(o => <p key={o.id}>{o.title} · RM {(o.priceSen/100).toFixed(2)} · {timestamp(o.endsAt)}</p>)}{!eligibleOffers(data,now).some(o => o.stallId === stall.id) && <p>{t('noOffers')}</p>}</section><section className="panel detail-panel"><h2>{t('reviews')}</h2><NavLink className="button secondary" to={`/community/${stall.id}`}>Reviews &amp; confidential reports</NavLink><PublicFlag stall={stall.id}/><EditorialBadge stall={stall.id}/>{data.publicReviews.filter(r => r.stallId === stall.id).map(r => <article key={r.id}><strong>{r.rating}/5</strong><p>{r.body}</p></article>)}{!data.publicReviews.some(r => r.stallId === stall.id) && <p>{t('noReviews')}</p>}</section></>}
  </>
}

export function SavedPage({gateway}:{gateway:DataGateway}) {
  const {t} = useTranslation()
  const query = useDiscovery(gateway,[])
  const saved = useFavourites(gateway)
  const now = useNow(gateway)
  return <><header className="page-intro"><div className="eyebrow">{t('saved')}</div><h1>{t('savedTitle')}</h1><p>{t('savedBody')}</p></header>{!saved.allowed ? <NavLink className="button primary" to="/profile">{t('signInToSave')}</NavLink> : !query.data ? <State query={query} gateway={gateway}/> : saved.error ? <p role="alert">{t('actionFailed')}</p> : saved.loading ? <p>{t('loading')}</p> : <div className="stall-grid">{query.data.stalls.filter(s => saved.ids.includes(s.id)).map(s => <DiscoveryStallCard key={s.id} stall={s} market={query.data?.markets.find(m => m.id === s.marketId)} now={now}/>)}</div>}{saved.allowed && !saved.loading && !saved.error && !saved.ids.length && <p className="panel">{t('emptySaved')}</p>}</>
}
