import { categories } from './classifications'
import { ui } from '../locales/phrases'
import { Availability, Directions } from './DiscoveryMetadata'
import { EditorialBadge } from '../partners/EditorialBadge'
import { connectedAds } from '../commerce/connected'
import { Sponsored, sponsored } from '../commerce/Sponsored'
import { PublicFlag } from '../community/PublicFlag'
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { NavLink, useParams } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Heart, Map as MapIcon, MapPin, Search, Star } from 'lucide-react'
import type { DataGateway, Market, Stall } from '../data/types'
import { fixtureClock } from '../app/clock'
import { DemoDialog } from '../app/DemoDialog'
import { useAuth } from '../auth/context'
import { connectedRequest } from '../auth/client'
import { defaultFilters, dietaryStatus, discover, scheduleStatus, type Filters } from './engine'
import { useDiscovery } from './useDiscovery'
import { checkIn, useFavourites } from './actions'
import { coarsePoint, requestDeviceLocation } from './location'

import { DemoImage } from '../components/DemoImage'
import { foodImage } from '../components/demo-images'
import { DiscoveryIntro, DiscoveryCategories } from './DiscoveryIntro'
import { SlidersHorizontal, ChevronDown } from 'lucide-react'
import { StallDetail } from './StallDetail'
import { ValueProps, CategoryChips, PreparedToday, PopularMarkets, StallTile, DiscoverFooter } from './DiscoverSections'
import './discovery.css'
const MarketMap = lazy(() => import('./MarketMap'))
// Two rows of the five-column "From the stalls" grid
const PAGE_SIZE = 10
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
  return <p className="small muted" role="status">{gateway.mode==='fixture'?ui('Updated just now · Batch windows refresh automatically'):t(query.stale ? 'staleResults' : query.live ? 'liveResults' : 'pollResults')}{query.isFetching ? ` · ${t('refreshing')}` : ''}</p>
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
  const [showMap, setShowMap] = useState(true)
  const [filtersOpen,setFiltersOpen] = useState(true)
  const [locationMessage, setLocationMessage] = useState('manualLocation')
  const [geoExpires, setGeoExpires] = useState(0)
  const [mapLookup, setMapLookup] = useState('')
  const [areaChoice, setAreaChoice] = useState('')
  const now = useNow(gateway)
  const query = useDiscovery(gateway, data => discover(data,filters,now,page,PAGE_SIZE).markets.map(m => m.id))
  const mapRef = useRef<HTMLDivElement>(null)
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
  async function locate(nearest = false) {
    setLocationMessage('locating')
    try {
      const point = await requestDeviceLocation(navigator.geolocation)
      change({origin:point,market:'',...(nearest?{sort:'nearest'}:{})})
      setAreaChoice('')
      setGeoExpires(Date.now()+7200000); setLocationMessage('deviceLocation')
    } catch { setLocationMessage('locationDenied') }
  }
  const data = query.data
  const advertisements=useQuery({queryKey:['commerce-ads',gateway.mode],queryFn:connectedAds,enabled:gateway.mode==='connected',refetchInterval:10000})
  const result = data ? discover(data,filters,now,page,PAGE_SIZE) : null
  const everything = data ? discover(data,filters,now,0,10000) : null
  const reviewed = everything?.stalls.filter(s=>s.reviews>0) ?? []
  const averageRating = reviewed.length ? reviewed.reduce((sum,s)=>sum+s.rating,0)/reviewed.length : null
  const nearbyLabel = data?.markets.find(m=>m.id===areaChoice)?.area ?? (filters.origin ? ui('your location') : null)
  const filtersApplied = !!(filters.marketKind||filters.plantDiet||filters.maxPriceSen!=null||filters.category||filters.dietary||filters.type||filters.promotion||filters.market)
  function viewMap() { setShowMap(true); requestAnimationFrame(()=>mapRef.current?.scrollIntoView({behavior:'smooth',block:'center'})) }
  return <div className="discover-dark night-page"><DiscoveryIntro data={data} filters={filters}/><ValueProps/>
    <CategoryChips selected={filters.category} onChange={category=>change({category})}/>
    {data&&<PreparedToday data={data} now={now} gateway={gateway}/>}
    <div className="search-wrap"><Search size={20}/><label className="sr-only" htmlFor="market-search">{t('findFood')}</label><input id="market-search" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('findFood')}/></div>
    <div className="discovery-action-bar">
      <button className="filter-chip" aria-expanded={filtersOpen} aria-controls="discovery-filter-panel" onClick={()=>setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16}/>{ui('Find your food')}<ChevronDown size={15}/>{filtersApplied&&<span className="filter-applied">•</span>}</button>
      <div className="browse-tabs" role="group" aria-label={t('sortResults')}>
        <button className={filters.sort==='rating'?'active':''} aria-pressed={filters.sort==='rating'} onClick={()=>change({sort:'rating'})}><Star size={15}/>{t('bestReviewed')}</button>
        <button className={filters.sort==='popularity'?'active':''} aria-pressed={filters.sort==='popularity'} onClick={()=>change({sort:'popularity'})}>{t('popularity')}</button>
        <button className={filters.sort==='nearest'?'active':''} aria-pressed={filters.sort==='nearest'} onClick={()=>filters.origin?change({sort:'nearest'}):void locate(true)}><MapPin size={15}/>{nearbyLabel?`${ui('Nearby')} (${nearbyLabel})`:ui('Nearby')}</button>
      </div>
      <button className="filter-chip" aria-pressed={showMap} onClick={()=>setShowMap(!showMap)}><MapIcon size={16}/>{ui('Map view')}</button>
    </div>
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
      <label>{t('dietary')}<select value={filters.dietary} onChange={e => change({dietary:e.target.value})}><option value="">{t('allDietary')}</option>{(gateway.mode==='fixture'?['declared','non-halal']:['certified','declared','non-halal','not-declared']).map(value => <option key={value} value={value}>{t(`diet_${value}`)}</option>)}</select></label>
      <label>{ui('Plant diet')}<select value={filters.plantDiet??''} onChange={e=>change({plantDiet:e.target.value})}><option value="">{ui('Any plant-diet status')}</option><option value="vegetarian">{ui('Vendor-declared vegetarian')}</option><option value="vegan">{ui('Vendor-declared vegan')}</option></select></label>
      <div><label>{ui('Maximum menu-unit price (RM)')}<input type="number" min="0" max="1000000" step="0.01" value={filters.maxPriceSen==null?'':(filters.maxPriceSen/100)} onChange={e=>change({maxPriceSen:e.target.value===''?null:Math.round(e.target.valueAsNumber*100)})}/></label><div className="button-row"><button className="button secondary" onClick={()=>change({maxPriceSen:500})}>RM5</button><button className="button secondary" onClick={()=>change({maxPriceSen:1000})}>RM10</button></div></div>
      <p className="small muted">{ui('Budget matches one menu item before discounts; bundles and clearance offers are excluded from this price basis.')}</p>
      <label>{t('sortResults')}<select value={filters.sort} onChange={e => change({sort:e.target.value})}><option value="rating">{t('bestReviewed')}</option><option value="popularity">{t('popularity')}</option><option value="nearest" disabled={!filters.origin}>{t('nearest')}</option></select></label>
      <label>{t('distanceRadius')}<select value={filters.radius} onChange={e => change({radius:Number(e.target.value)})} disabled={!filters.origin}>{[1,5,10,25,50,100].map(km => <option key={km} value={km}>{km} km</option>)}</select></label>
      <label className="choice-row"><span>{t('promotionOnly')}</span><input type="checkbox" checked={filters.promotion} onChange={e => change({promotion:e.target.checked})}/></label>
      <div className="button-row"><button className="button secondary" onClick={()=>void locate()}><MapPin size={16}/>{t('useLocation')}</button><button className="button secondary" onClick={() => {setSearch('');change(defaultFilters);setAreaChoice('');setGeoExpires(0);setLocationMessage('manualLocation')}}>{t('resetFilters')}</button></div>
      <p role="status" className="small muted">{t(locationMessage)}{mapLookup && gateway.mode === 'connected' && filters.origin ? ` · ${t(mapLookup)}` : ''} {t('marketDistance')}</p>
    </section>
    {data&&<DiscoveryCategories data={data} selected={filters.category} onChange={category=>change({category})}/>}
    {!data || !result || !everything ? <State query={query} gateway={gateway}/> : <>
      <section className="markets-explore" aria-labelledby="markets-explore-title">
        <div className="section-heading discovery-results-heading"><h2 id="markets-explore-title">{t('allMarkets')}</h2><span>{ui(filters.origin?'{count} markets nearby':'{count} markets',{count:everything.markets.length})}</span></div>
        <Freshness query={query} gateway={gateway}/>
        <div className="explore-card" ref={mapRef}>
          <div className="explore-panel"><span className="eyebrow">{ui('EXPLORE NEAR YOU')}</span><h3>{ui('Markets on the map')}</h3><p>{ui('Find the best night markets, food stalls and hidden gems near you.')}</p><button className="button primary" onClick={viewMap}>{ui('View map')}<ArrowRight size={16}/></button><p className="explore-stats"><span>{ui('{count} markets',{count:everything.markets.length})}</span><span>{ui('{count} food stalls',{count:everything.stalls.length})}</span>{averageRating!==null&&<span><Star size={13}/>{averageRating.toFixed(1)}</span>}</p></div>
          <div className="explore-map">{showMap ? <Suspense fallback={<p role="status">{t('loading')}</p>}><MarketMap markets={everything.markets} sponsors={new Set(sponsored(data,filters,now,gateway.mode==='fixture'?undefined:advertisements.data??[]).map(c=>c.market))} onBounds={bounds => change({bounds})}/></Suspense> : <p className="explore-map-off">{t('showMap')}</p>}</div>
        </div>
      </section>
      <PopularMarkets data={data} origin={filters.origin}/>
      <section className="from-stalls"><div className="section-heading"><h2>{t('featuredStalls')}</h2><span>{t('resultsCount',{count:result.total})}</span></div><Sponsored data={data} filters={filters} now={now} campaigns={gateway.mode==='connected'?advertisements.data??[]:undefined}/><div className="stall-tile-grid">{result.stalls.map(s => <StallTile key={s.id} stall={s} gateway={gateway}/>)}</div></section>
      {!result.total && <div className="panel state-panel"><h2>{t('noMatches')}</h2><p>{t('relaxFilters')}</p></div>}
      <nav className="pagination" aria-label={t('resultPages')}><button className="button secondary" disabled={result.page === 0} onClick={() => setPage(result.page-1)}><ArrowLeft size={16}/>{t('previous')}</button><span>{result.page+1} / {result.pages}</span><button className="button secondary" disabled={result.page+1 >= result.pages} onClick={() => setPage(result.page+1)}>{t('next')}<ArrowRight size={16}/></button></nav></>}
    <DiscoverFooter/>
  </div>
}

export function DiscoveryDetail({ gateway, kind }: {gateway:DataGateway;kind:'market'|'stall'}) {
  const {id} = useParams()
  const {t} = useTranslation()
  const now = useNow(gateway)
  const query = useDiscovery(gateway,data => kind === 'market' && id ? [id] : data.markets.filter(m => data.stalls.some(s => s.id === id && s.marketId === m.id)).map(m => m.id))
  const {actor} = useAuth()
  const [message,setMessage] = useState('')
  const [busy,setBusy] = useState(false)
  const data = query.data
  if (!data) return <State query={query} gateway={gateway}/>
  const market = data.markets.find(m => m.id === (kind === 'market' ? id : data.stalls.find(s => s.id === id)?.marketId))
  const stall = kind === 'stall' ? data.stalls.find(s => s.id === id) : null
  if (!market || kind === 'stall' && !stall) return <div className="panel state-panel">{t('noMatches')}</div>
  if (stall) return <StallDetail gateway={gateway} data={data} stall={stall} market={market} now={now}/>
  const action = async (run:() => Promise<unknown>, success:string) => { setBusy(true); try { const result=await run();setMessage(result === false ? 'alreadyCheckedIn' : success); if (kind === 'market') await query.refetch() } catch {setMessage('actionFailed')} finally {setBusy(false)} }
  return <><NavLink className="back-link" to="/discover"><ArrowLeft size={17}/>{t('back')}</NavLink><header className="detail-hero"><div className="detail-symbol"><DemoImage image={market.type==='day'?'day':'night'} description={`${market.name} market scene`}/></div><div><div className="eyebrow">{t('market')}</div><h1>{market.name}</h1><p>{market.area} · {market.hours}</p><p>{t('scheduleOnly')}: {scheduleStatus(market,now)==='closing-soon'?ui('Closing soon'):t(scheduleStatus(market,now))} · {ui(market.kind==='farmers'?'Farmers’ market':'General market')}</p></div></header><Directions latitude={market.latitude} longitude={market.longitude}/><Freshness query={query} gateway={gateway}/>
    {message && <p role="status" className="panel">{t(message)}</p>}
    <><button className="button primary" disabled={busy || gateway.mode === 'connected' && !actor?.roles.includes('customer')} onClick={() => void action(async () => {const created=await checkIn(gateway,market.id);setMessage(created ? 'checkedIn' : 'alreadyCheckedIn');return created},'checkedIn')}>{t('checkIn')}</button><p className="small muted">{t('checkInLimit')}</p><div className="stall-grid">{data.stalls.filter(s => s.marketId === market.id).map(s => <DiscoveryStallCard key={s.id} stall={s} market={market} now={now}/>)}</div></>
  </>
}

export function SavedPage({gateway}:{gateway:DataGateway}) {
  const {t} = useTranslation()
  const query = useDiscovery(gateway,[])
  const saved = useFavourites(gateway)
  const now = useNow(gateway)
  return <><header className="page-intro"><div className="eyebrow">{t('saved')}</div><h1>{t('savedTitle')}</h1><p>{t('savedBody')}</p></header>{!saved.allowed ? <NavLink className="button primary" to="/profile">{t('signInToSave')}</NavLink> : !query.data ? <State query={query} gateway={gateway}/> : saved.error ? <p role="alert">{t('actionFailed')}</p> : saved.loading ? <p>{t('loading')}</p> : <div className="stall-grid">{query.data.stalls.filter(s => saved.ids.includes(s.id)).map(s => <DiscoveryStallCard key={s.id} stall={s} market={query.data?.markets.find(m => m.id === s.marketId)} now={now}/>)}</div>}{saved.allowed && !saved.loading && !saved.error && !saved.ids.length && <div className="panel state-panel"><Heart size={34}/><p>{t('emptySaved')}</p><NavLink className="button primary" to="/discover">{ui('Explore markets')}</NavLink></div>}</>
}
