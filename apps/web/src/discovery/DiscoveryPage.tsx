import { categories } from './classifications'
import { ui } from '../locales/phrases'
import { Availability, Directions } from './DiscoveryMetadata'
import { EditorialBadge } from '../partners/EditorialBadge'
import { connectedAds } from '../commerce/connected'
import { Sponsored } from '../commerce/Sponsored'
import { PublicFlag } from '../community/PublicFlag'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type FormEvent } from 'react'
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
import { PredictedClearanceSection, predictedStall } from '../clearance/PredictedClearance'

import { DemoImage } from '../components/DemoImage'
import { foodImage } from '../components/demo-images'
import { DiscoveryIntro } from './DiscoveryIntro'
import { SlidersHorizontal, ChevronDown, Check, Flame, ListFilter, LocateFixed, MoonStar, RotateCcw, Store, Wallet } from 'lucide-react'
import { StallDetail } from './StallDetail'
import { ValueProps, CategoryChips, PreparedToday, FeaturedStalls, PopularMarkets, StallTile, DiscoverPromos } from './DiscoverSections'
import { SectionTitle } from './SectionTitle'
import { SellingOutSoon } from './SellingOutSoon'
import { useDiscoverState } from './DiscoverState'
import '@fontsource/fraunces/latin-700.css'
import './discovery.css'
// Three rows of the four-column "All stalls" grid
const PAGE_SIZE = 12
export function useNow(gateway: DataGateway) {
  const snapshot=useQuery({queryKey:['discovery',gateway.mode],queryFn:()=>gateway.getDiscovery(),enabled:false})
  const anchor=useMemo(()=>({server:snapshot.data?.server_now?Date.parse(snapshot.data.server_now):Infinity,elapsed:performance.now(),received:snapshot.dataUpdatedAt}),[snapshot.data?.server_now,snapshot.dataUpdatedAt])
  const [elapsed,setElapsed]=useState(0)
  useEffect(()=>{const timer=setInterval(()=>{if(document.visibilityState!=='hidden')setElapsed(performance.now())},1000);return()=>clearInterval(timer)},[])
  return gateway.mode==='fixture'?fixtureClock.now():new Date(Number.isFinite(anchor.server)?anchor.server+Math.max(0,elapsed-anchor.elapsed):8640000000000000)
}
export function DiscoveryState({ query, gateway }: { query: ReturnType<typeof useDiscovery>; gateway: DataGateway }) {
  const { t } = useTranslation()
  return <div className="panel state-panel" role={query.isError ? 'alert' : 'status'}><h2>{t(query.isError ? 'errorTitle' : 'loading')}</h2>{query.isError && <><p>{t('requestUnavailable')}</p><button className="button secondary" onClick={() => void query.refetch()}>{t('tryAgain')}</button>{gateway.mode === 'connected' && <DemoDialog/>}</>}</div>
}
export function Freshness({ query, gateway }: { query: ReturnType<typeof useDiscovery>; gateway: DataGateway }) {
  const { t } = useTranslation()
  return <p className="small muted" role="status">{gateway.mode==='fixture'?ui('Updated just now · Batch windows refresh automatically'):t(query.stale ? 'staleResults' : query.live ? 'liveResults' : 'pollResults')}{query.isFetching ? ` · ${t('refreshing')}` : ''}</p>
}
export function DiscoveryStallCard({ stall, market, now, distance }: { stall: Stall; market?: Market; now: Date; distance?: number }) {
  const { t } = useTranslation()
  return <NavLink className="stall-card card-link" to={`/stalls/${stall.id}`}><div className="food-art"><DemoImage image={foodImage(stall.specialty)} description={`${stall.specialty} from ${stall.name}`}/></div><div className="stall-content"><div className="eyebrow">{stall.category}</div><h3>{stall.name}</h3><PublicFlag stall={stall.id}/><EditorialBadge stall={stall.id}/><p className="muted">{stall.specialty} · {market?.name}</p><p className="dietary-label">{t(`diet_${dietaryStatus(stall,now)}`)}</p><p className="small muted">{t(stall.open ? 'vendorOpen' : 'vendorClosed')}{distance !== undefined ? ` · ${distance.toFixed(1)} km` : ''}</p><Availability at={stall.availabilityConfirmedAt} now={now}/><div className="stall-bottom"><span className="rating"><Star size={14}/>{stall.reviews ? `${stall.rating.toFixed(1)} (${stall.reviews})` : t('noReviews')}</span><span>RM {(stall.priceSen/100).toFixed(2)}</span></div></div></NavLink>
}
export function DiscoveryPage({ gateway }: { gateway: DataGateway }) {
  const { t, i18n } = useTranslation()
  const { filters, setFilters, search, setSearch, areaChoice, setAreaChoice, setGeoExpires, locationMessage, setLocationMessage } = useDiscoverState()
  const [page, setPage] = useState(0)
  // Collapsed by default so search and results lead; the grouped panel opens from "Find your food"
  const [filtersOpen,setFiltersOpen] = useState(false)
  const [mapLookup, setMapLookup] = useState('')
  const now = useNow(gateway)
  const query = useDiscovery(gateway, data => discover(data,filters,now,page,PAGE_SIZE).markets.map(m => m.id))
  const resultsRef = useRef<HTMLDivElement>(null)
  // Rise in from below only when arriving from the landing splash's slide-up, not on every visit
  const [arriving,setArriving] = useState(false)
  useLayoutEffect(() => {
    try { if (sessionStorage.getItem('pasarmalam:arrive-from-landing')) { sessionStorage.removeItem('pasarmalam:arrive-from-landing'); setArriving(true) } } catch { /* optional */ }
  }, [])
  const change = (next: Partial<Filters>) => { setFilters(current => ({...current,...next})); setPage(0) }
  useEffect(() => {
    if (filters.search === search) return
    const timer = setTimeout(() => { setFilters(current => ({...current,search})); setPage(0) },300)
    return () => clearTimeout(timer)
  }, [search,filters.search,setFilters])
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
  const clearancePredictions = new Map((gateway.mode === 'fixture' ? data?.stalls ?? [] : []).map(stall => [stall.id, predictedStall(data!, stall.id, now)]))
  const displayTotal = result?.total ?? 0
  const displayPages = Math.max(1, Math.ceil(displayTotal / PAGE_SIZE))
  const displayStalls = result?.stalls ?? []
  const nearbyLabel = data?.markets.find(m=>m.id===areaChoice)?.area ?? (filters.origin ? ui('your location') : null)
  const filtersApplied = !!(filters.marketKind||filters.plantDiet||filters.maxPriceSen!=null||filters.category||filters.dietary||filters.type||filters.promotion||filters.market)
  // Results already update as you type; the arrow skips the wait and takes you to them
  function submitSearch(event: FormEvent) { event.preventDefault(); setFilters(current => ({...current,search})); setPage(0); resultsRef.current?.scrollIntoView({behavior:'smooth',block:'start'}) }
  return <div className={`discover-dark night-page ${arriving?'arriving':''}`}><DiscoveryIntro data={data} filters={filters}>
      <form className="search-wrap" role="search" onSubmit={submitSearch}><Search size={20}/><label className="sr-only" htmlFor="market-search">{t('findFood')}</label><input id="market-search" value={search} onChange={e => setSearch(e.target.value)} placeholder={ui('Search for food or stalls...')}/><button type="submit" className="button primary hero-search-go" aria-label={ui('Show results')}><ArrowRight size={20}/></button></form>
      <div className="discovery-action-bar">
        <button className="filter-chip" aria-expanded={filtersOpen} aria-controls="discovery-filter-panel" onClick={()=>setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16}/>{ui('Find your food')}<ChevronDown size={15}/>{filtersApplied&&<span className="filter-applied">•</span>}</button>
        <div className="browse-tabs" role="group" aria-label={t('sortResults')}>
          <button className={filters.sort==='rating'?'active':''} aria-pressed={filters.sort==='rating'} onClick={()=>change({sort:'rating'})}><Star size={15}/>{t('bestReviewed')}</button>
          <button className={filters.sort==='popularity'?'active':''} aria-pressed={filters.sort==='popularity'} onClick={()=>change({sort:'popularity'})}>{t('popularity')}</button>
          <button className={filters.sort==='nearest'?'active':''} aria-pressed={filters.sort==='nearest'} onClick={()=>filters.origin?change({sort:'nearest'}):void locate(true)}><MapPin size={15}/>{nearbyLabel?`${ui('Nearby')} (${nearbyLabel})`:ui('Nearby')}</button>
        </div>
        <NavLink className="filter-chip" to="/markets"><MapIcon size={16}/>{ui('Map view')}</NavLink>
      </div>
    </DiscoveryIntro>
    <div id="discovery-filter-panel" hidden={!filtersOpen} className="fs-panel filter-card" role="region" aria-label={t('discoveryFilters')}>
      <section className="fs-section">
        <header className="fs-head"><span className="fs-icon" aria-hidden="true"><MapPin size={18}/></span><div><h3>{ui('Market & location')}</h3><p>{ui('Find markets near you or explore by area.')}</p></div><button type="button" className="fs-locate" onClick={()=>void locate()}><LocateFixed size={15}/>{t('useLocation')}</button></header>
        <div className="fs-grid"><label>{t('chooseMarket')}<select value={filters.market} onChange={e => change({market:e.target.value})}><option value="">{t('anyMarket')}</option>{data?.markets.map(m => <option key={m.id} value={m.id}>{m.name} · {m.area}</option>)}</select></label>
<label>{t('chooseArea')}<select value={areaChoice} onChange={e => {
        const market = data?.markets.find(m => m.id === e.target.value)
        setAreaChoice(e.target.value)
        change({origin:market?.latitude !== null && market?.longitude !== null && market ? {latitude:market.latitude,longitude:market.longitude} : null,bounds:null})
        setGeoExpires(0); setLocationMessage('manualLocation')
      }}><option value="">{t('noArea')}</option>{data?.markets.map(m => <option key={m.id} value={m.id}>{m.area} · {m.name}</option>)}</select></label>
<label>{t('distanceRadius')}<select value={filters.radius} onChange={e => change({radius:Number(e.target.value)})} disabled={!filters.origin}>{[1,5,10,25,50,100].map(km => <option key={km} value={km}>{km} km</option>)}</select></label>
</div>
      </section>
      <section className="fs-section">
        <header className="fs-head"><span className="fs-icon" aria-hidden="true"><MoonStar size={18}/></span><div><h3>{ui('Date & night')}</h3><p>{ui('Choose when you want to visit and what kind of market.')}</p></div></header>
        <div className="fs-grid"><label>{t('marketType')}<select value={filters.type} onChange={e => change({type:e.target.value})}><option value="">{t('allTypes')}</option><option value="night">{t('night')}</option><option value="day">{t('day')}</option></select></label>
<label>{ui('Market classification')}<select value={filters.marketKind??''} onChange={e=>change({marketKind:e.target.value})}><option value="">{ui('All market classifications')}</option><option value="general">{ui('General market')}</option><option value="farmers">{ui('Farmers’ market')}</option></select></label></div>
      </section>
      <section className="fs-section">
        <header className="fs-head"><span className="fs-icon" aria-hidden="true"><Flame size={18}/></span><div><h3>{ui('Food preferences')}</h3><p>{ui('Choose what you’re in the mood for.')}</p></div></header>
        <div className="fs-grid"><label>{t('category')}<select value={filters.category} onChange={e => change({category:e.target.value})}><option value="">{t('allCategories')}</option>{categories.map(c=><option key={c.id} value={c.id}>{ui(c.en)}</option>)}</select></label>
<label>{t('dietary')}<select value={filters.dietary} onChange={e => change({dietary:e.target.value})}><option value="">{t('allDietary')}</option>{(gateway.mode==='fixture'?['declared','non-halal']:['certified','declared','non-halal','not-declared']).map(value => <option key={value} value={value}>{t(`diet_${value}`)}</option>)}</select></label>
<label>{ui('Plant diet')}<select value={filters.plantDiet??''} onChange={e=>change({plantDiet:e.target.value})}><option value="">{ui('Any plant-diet status')}</option><option value="vegetarian">{ui('Vendor-declared vegetarian')}</option><option value="vegan">{ui('Vendor-declared vegan')}</option></select></label></div>
      </section>
      <section className="fs-section">
        <header className="fs-head"><span className="fs-icon" aria-hidden="true"><Wallet size={18}/></span><div><h3>{ui('Budget & offers')}</h3><p>{ui('Set your price range and find special deals.')}</p></div></header>
        <div className="fs-budget"><div className="fs-price"><label><span className="fs-label">{ui('Maximum menu-unit price (RM)')}</span><span className="fs-rm-field"><span aria-hidden="true">RM</span><input placeholder={ui('Enter maximum price')} type="number" min="0" max="1000000" step="0.01" value={filters.maxPriceSen==null?'':(filters.maxPriceSen/100)} onChange={e=>change({maxPriceSen:e.target.value===''?null:Math.round(e.target.valueAsNumber*100)})}/></span></label><div className="fs-quick"><button type="button" className={`fs-pill ${filters.maxPriceSen===500?'active':''}`} aria-pressed={filters.maxPriceSen===500} onClick={()=>change({maxPriceSen:500})}>RM5</button><button type="button" className={`fs-pill ${filters.maxPriceSen===1000?'active':''}`} aria-pressed={filters.maxPriceSen===1000} onClick={()=>change({maxPriceSen:1000})}>RM10</button></div><p className="small muted">{ui('Budget matches one menu item before discounts; bundles and clearance offers are excluded from this price basis.')}</p></div><span className="fs-vrule" aria-hidden="true"/><div className="fs-promo"><span className="fs-promo-title">{t('promotionOnly')}</span><label className="fs-check"><input type="checkbox" checked={filters.promotion} onChange={e => change({promotion:e.target.checked})}/><span>{ui('Show only stalls with current promotions')}</span></label></div></div>
      </section>
      <section className="fs-section">
        <header className="fs-head"><span className="fs-icon" aria-hidden="true"><ListFilter size={18}/></span><div><h3>{ui('Sort results')}</h3><p>{ui('Choose how you want to see the results.')}</p></div></header>
        <div className="fs-sort"><div className="fs-sort-field"><label>{t('sortResults')}<select value={filters.sort} onChange={e => change({sort:e.target.value})}><option value="rating">{t('bestReviewed')}</option><option value="popularity">{t('popularity')}</option><option value="nearest" disabled={!filters.origin}>{t('nearest')}</option></select></label></div><p role="status" className="fs-note"><MapPin size={13}/>{t(locationMessage)}{mapLookup && gateway.mode === 'connected' && filters.origin ? ` · ${t(mapLookup)}` : ''} {t('marketDistance')}</p></div>
      </section>
      <footer className="fs-actions"><button type="button" className="button primary" onClick={()=>resultsRef.current?.scrollIntoView({behavior:'smooth',block:'start'})}><Check size={16}/>{ui('Apply filters')}</button><button type="button" className="fs-reset" onClick={() => {setSearch('');change(defaultFilters);setAreaChoice('');setGeoExpires(0);setLocationMessage('manualLocation')}}><RotateCcw size={15}/>{t('resetFilters')}</button></footer>
    </div>
    <CategoryChips selected={filters.category} onChange={category=>change({category})}/>
    {/* Results follow the search so filtering gives immediate feedback; estimates stay below confirmed offers */}
    {!data || !result || !everything ? <DiscoveryState query={query} gateway={gateway}/> : <>
      <div ref={resultsRef}>
        {filters.bounds&&<p className="map-area-note" role="status"><MapPin size={15} aria-hidden="true"/><span>{ui('Showing stalls in your map area')}</span><button type="button" className="text-button" onClick={()=>change({bounds:null})}>{t('clearBounds')}</button></p>}
        <SellingOutSoon data={data} now={now} gateway={gateway} filters={filters} stallIds={new Set(everything.stalls.map(stall=>stall.id))}/>
      </div>
      <PreparedToday data={data} now={now} gateway={gateway}/>
      <FeaturedStalls data={data} now={now} gateway={gateway}/>
      <section className="from-stalls all-stalls" aria-labelledby="all-stalls-title">
        <div className="section-heading"><SectionTitle Icon={Store} tone="cream" id="all-stalls-title" title={ui('All stalls')} sub={ui('Every stall that matches your search and filters.')}/><span>{t('resultsCount',{count:displayTotal})}</span></div>
        <Sponsored data={data} filters={filters} now={now} campaigns={gateway.mode==='connected'?advertisements.data??[]:undefined}/>
        <div className="stall-tile-grid">{displayStalls.map(stall => <StallTile key={stall.id} stall={stall} market={data.markets.find(m => m.id === stall.marketId)} prediction={clearancePredictions.get(stall.id)} gateway={gateway}/>)}</div>
        {!displayTotal && <div className="panel state-panel"><h2>{t('noMatches')}</h2><p>{t('relaxFilters')}</p></div>}
        <nav className="pagination" aria-label={t('resultPages')}><button className="button secondary" disabled={page === 0} onClick={() => setPage(page-1)}><ArrowLeft size={16}/>{t('previous')}</button><span>{page+1} / {displayPages}</span><button className="button secondary" disabled={page+1 >= displayPages} onClick={() => setPage(page+1)}>{t('next')}<ArrowRight size={16}/></button></nav>
      </section>
      {gateway.mode==='fixture'&&<PredictedClearanceSection variant="discover" data={data} now={now} locale={i18n.language} limit={3} seeMoreTo="/offers"/>}
    </>}
    <DiscoverPromos/>
    {data&&<PopularMarkets data={data} origin={filters.origin}/>}
    <ValueProps/>
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
  if (!data) return <DiscoveryState query={query} gateway={gateway}/>
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
  const selectedStalls = query.data?.stalls.filter(stall => saved.ids.includes(stall.id)) ?? []
  // The run is planned only from stalls the shopper ticks (DESIGN.md: explicit selection, visible count)
  const [picked, setPicked] = useState<string[]>([])
  const runStalls = selectedStalls.filter(stall => picked.includes(stall.id))
  const plannerPath = `/planner?stalls=${encodeURIComponent(runStalls.map(stall => stall.id).join(','))}`
  return <><header className="page-intro"><div className="eyebrow">{t('saved')}</div><h1>{t('savedTitle')}</h1><p>{t('savedBody')}</p></header>{saved.allowed && !saved.loading && !saved.error && selectedStalls.length >= 2 && <div className="saved-plan-run"><div><strong>Plan a market run</strong><span role="status">{runStalls.length} of {selectedStalls.length} saved stalls selected{runStalls.length < 2 ? ' · tick at least 2' : ''}</span></div><div className="saved-plan-actions"><button type="button" className="button secondary" onClick={() => setPicked(runStalls.length === selectedStalls.length ? [] : selectedStalls.map(stall => stall.id))}>{runStalls.length === selectedStalls.length ? 'Clear' : 'Select all'}</button>{runStalls.length >= 2 && <NavLink className="button primary" to={plannerPath}><MapPin size={16}/>Plan run with {runStalls.length} stalls</NavLink>}</div></div>}{!saved.allowed ? <NavLink className="button primary" to="/profile">{t('signInToSave')}</NavLink> : !query.data ? <DiscoveryState query={query} gateway={gateway}/> : saved.error ? <p role="alert">{t('actionFailed')}</p> : saved.loading ? <p>{t('loading')}</p> : <div className="stall-grid">{selectedStalls.map(s => <div className="saved-item" key={s.id}>{selectedStalls.length >= 2 && <label className="saved-pick"><input type="checkbox" checked={picked.includes(s.id)} onChange={event => setPicked(ids => event.target.checked ? [...ids, s.id] : ids.filter(id => id !== s.id))}/><span>Include {s.name} in my run</span></label>}<DiscoveryStallCard stall={s} market={query.data?.markets.find(m => m.id === s.marketId)} now={now}/></div>)}</div>}{saved.allowed && !saved.loading && !saved.error && !saved.ids.length && <div className="panel state-panel"><Heart size={34}/><p>{t('emptySaved')}</p><NavLink className="button primary" to="/discover">{ui('Explore markets')}</NavLink></div>}</>
}
