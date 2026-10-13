import { ArrowLeft, Clock3, MapPin, Route as RouteIcon } from 'lucide-react'
import { NavLink, useSearchParams } from 'react-router'
import type { DataGateway, Stall } from '../data/types'
import { useTranslation } from 'react-i18next'
import { useDiscovery } from '../discovery/useDiscovery'
import { useNow } from '../discovery/DiscoveryPage'
import { eligibleOffers } from '../discovery/engine'
import type { DiscoverySnapshot } from '../data/types'
import { planRoute, type PlannedStop } from './route'
import './market-run.css'

type ActiveWindow = { minutes: number; item: string; kind: 'offer' | 'advisory' }
type PlannerStop = Stall & { urgencyMinutes: number | null; urgencyItem: string | null; urgencyKind: ActiveWindow['kind'] | null }

export default function MarketRunPlanner({ gateway }: { gateway: DataGateway }) {
  const [params] = useSearchParams()
  const { t } = useTranslation()
  const now = useNow(gateway)
  const query = useDiscovery(gateway)
  const requestedIds = [...new Set((params.get('stalls') ?? '').split(',').map(id => id.trim()).filter(Boolean))]
  const busy = query.isPending || !query.data

  if (busy) return <div className="panel state-panel" role="status">{t('loading')}</div>
  if (query.isError) return <section className="market-run-empty" role="alert"><h1>Planner unavailable</h1><p>Could not load saved market data. Please try again.</p><button className="button secondary" onClick={() => void query.refetch()}>Retry</button></section>

  const selected = query.data.stalls.filter(stall => requestedIds.includes(stall.id))
  if (selected.length < 2) return <main className="market-run-page"><header className="market-run-heading"><p className="market-run-eyebrow">CUSTOMER · VISIT PLANNER</p><h1>Market Run Planner</h1><p>Choose at least two saved stalls to build a suggested visit order.</p></header><section className="market-run-empty"><p>{selected.length ? 'Only one selected stall was found.' : 'No selected stalls were found in this plan.'}</p><NavLink className="button primary" to="/saved">Choose saved stalls</NavLink></section></main>

  const planned = planRoute(selected.map(stall => enrichStop(stall, query.data!, now.getTime())))
  const totalKm = planned.slice(1).reduce((sum, entry) => sum + (entry.distanceFromPreviousKm ?? 0), 0)
  const knownLegs = planned.slice(1).filter(entry => entry.distanceFromPreviousKm !== null).length

  return <main className="market-run-page">
    <NavLink to="/saved" className="market-run-back"><ArrowLeft size={16}/> Back to saved stalls</NavLink>
    <header className="market-run-heading"><p className="market-run-eyebrow">CUSTOMER · VISIT PLANNER</p><h1>Market Run Planner</h1><p>Your stops are ordered to favour short clearance/advisory windows, then reduce the distance between stalls.</p></header>
    <section className="market-run-summary"><div><RouteIcon size={19}/><strong>{planned.length} planned stops</strong></div><span>{knownLegs === planned.length - 1 ? `About ${totalKm.toFixed(1)} km between stops` : 'Some stall locations are not recorded'}</span><small>Approximate straight-line distance from stall coordinates, not a mapped walking route.</small></section>
    <ol className="market-run-stops" aria-label="Suggested market run order">{planned.map((entry, index) => <PlannerStopCard key={entry.stop.id} entry={entry} index={index} total={planned.length}/>)}</ol>
    <p className="market-run-footnote">Suggested order only. Advisory countdowns are estimates, not food-safety guarantees; check food condition with the hawker.</p>
  </main>
}

function enrichStop(stall: Stall, data: DiscoverySnapshot, now: number): PlannerStop {
  const activeOffers = eligibleOffers(data, new Date(now)).filter(offer => offer.stallId === stall.id)
  const activeBatches = (data.batches ?? []).filter(batch => {
    const food = data.menu?.find(item => item.id === batch.foodItemId)
    return food?.stallId === stall.id && batch.remaining > 0 && Date.parse(batch.deadline) > now
  })
  const windows: ActiveWindow[] = []
  for (const offer of activeOffers) {
    const batch = activeBatches.find(candidate => offer.batchId ? candidate.id === offer.batchId : offer.foodItemId ? candidate.foodItemId === offer.foodItemId : true)
    const offerEnds = Date.parse(offer.endsAt)
    const batchDeadline = batch ? Date.parse(batch.deadline) : Number.POSITIVE_INFINITY
    const expiry = Math.min(offerEnds, batchDeadline)
    const minutes = Math.max(0, Math.ceil((expiry - now) / 60_000))
    windows.push({ minutes, item: offer.title, kind: 'offer' })
  }
  if (!windows.length && activeBatches.length) {
    const batch = activeBatches.sort((a, b) => Date.parse(a.deadline) - Date.parse(b.deadline))[0]
    const food = data.menu?.find(item => item.id === batch.foodItemId)
    windows.push({ minutes: Math.max(0, Math.ceil((Date.parse(batch.deadline) - now) / 60_000)), item: food?.name ?? stall.specialty, kind: 'advisory' })
  }
  const urgent = windows.sort((a, b) => a.minutes - b.minutes)[0]
  return { ...stall, urgencyMinutes: urgent?.minutes ?? null, urgencyItem: urgent?.item ?? null, urgencyKind: urgent?.kind ?? null }
}

function PlannerStopCard({ entry, index, total }: { entry: PlannedStop<PlannerStop>; index: number; total: number }) {
  const { stop, distanceFromPreviousKm } = entry
  return <li className={`market-run-stop ${stop.urgencyMinutes !== null ? 'has-urgency' : ''}`}>
    <span className="market-run-node" aria-hidden="true">{index + 1}</span>
    <article className="market-run-card">
      <div className="market-run-stop-header"><span className="market-run-stop-number">STOP {index + 1} OF {total}</span>{stop.urgencyMinutes !== null && <span className="market-run-urgent"><Clock3 size={13}/>{stop.urgencyMinutes} min left</span>}</div>
      <h2>{stop.name}</h2>
      <p className="market-run-specialty">{stop.specialty}</p>
      {stop.urgencyMinutes !== null && <p className="market-run-grab">Grab the <strong>{stop.urgencyItem}</strong> before it clears <span>(~{stop.urgencyMinutes} min left)</span></p>}
      {stop.urgencyMinutes === null && <p className="market-run-no-urgency">No active clearance offer or advisory countdown recorded.</p>}
      <div className="market-run-stop-meta"><span><MapPin size={14}/>{stop.lot ? `Lot ${stop.lot}` : 'Market stall'}</span>{index > 0 && <span>{distanceFromPreviousKm === null ? 'Distance not recorded' : `~${distanceFromPreviousKm.toFixed(2)} km from previous stop`}</span>}</div>
    </article>
  </li>
}
