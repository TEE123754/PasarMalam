import { lazy, Suspense, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Star } from 'lucide-react'
import { connectedAds } from '../commerce/connected'
import { sponsored } from '../commerce/Sponsored'
import type { DataGateway } from '../data/types'
import { ui } from '../locales/phrases'
import { useDiscoverState } from './DiscoverState'
import { DiscoveryState, Freshness, useNow } from './DiscoveryPage'
import { discover } from './engine'
import { useDiscovery } from './useDiscovery'
import './MarketsPage.css'

const MarketMap = lazy(() => import('./MarketMap'))

// "Markets to explore": the map, its legend and its controls. Pins follow the Discover filters, and
// "Search this map area" narrows the Discover results through the shared state.
export function MarketsPage({ gateway }: { gateway: DataGateway }) {
  const { t } = useTranslation()
  const { filters, setFilters } = useDiscoverState()
  const now = useNow(gateway)
  const query = useDiscovery(gateway, data => discover(data,filters,now,0,10000).markets.map(m => m.id))
  const advertisements = useQuery({queryKey:['commerce-ads',gateway.mode],queryFn:connectedAds,enabled:gateway.mode==='connected',refetchInterval:10000})
  const mapRef = useRef<HTMLDivElement>(null)
  const data = query.data
  const everything = data ? discover(data,filters,now,0,10000) : null
  const reviewed = everything?.stalls.filter(s=>s.reviews>0) ?? []
  const averageRating = reviewed.length ? reviewed.reduce((sum,s)=>sum+s.rating,0)/reviewed.length : null
  const viewMap = () => mapRef.current?.scrollIntoView({behavior:'smooth',block:'center'})
  return <>
    <NavLink className="back-link" to="/discover"><ArrowLeft size={17}/>{t('back')}</NavLink>
    <header className="page-intro"><h1>{t('allMarkets')}</h1><p>{ui(filters.origin?'{count} markets nearby':'{count} markets',{count:everything?.markets.length ?? 0})}</p></header>
    {!data || !everything ? <DiscoveryState query={query} gateway={gateway}/> : <section className="markets-explore" aria-label={t('allMarkets')}>
      <Freshness query={query} gateway={gateway}/>
      <div className="explore-card" ref={mapRef}>
        <div className="explore-panel"><span className="eyebrow">{ui('EXPLORE NEAR YOU')}</span><h2>{ui('Markets on the map')}</h2><p>{ui('Find the best night markets, food stalls and hidden gems near you.')}</p><button className="button primary" onClick={viewMap}>{ui('View map')}<ArrowRight size={16}/></button><p className="explore-stats"><span>{ui('{count} markets',{count:everything.markets.length})}</span><span>{ui('{count} food stalls',{count:everything.stalls.length})}</span>{averageRating!==null&&<span><Star size={13}/>{averageRating.toFixed(1)}</span>}</p></div>
        <div className="explore-map"><Suspense fallback={<p role="status">{t('loading')}</p>}><MarketMap markets={everything.markets} sponsors={new Set(sponsored(data,filters,now,gateway.mode==='fixture'?undefined:advertisements.data??[]).map(c=>c.market))} onBounds={bounds => setFilters(current => ({...current,bounds}))}/></Suspense></div>
      </div>
      {/* The results now live on another page, so a map-area search has to say where they went */}
      {filters.bounds && <p className="map-area-result" role="status"><span>{ui('{count} food stalls',{count:everything.stalls.length})}</span><NavLink className="button secondary" to="/discover">{ui('See these stalls')}<ArrowRight size={16}/></NavLink></p>}
    </section>}
  </>
}
