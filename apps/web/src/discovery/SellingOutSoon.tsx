import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Clock3, Flame, Leaf, Store, Tag } from 'lucide-react'
import type { DataGateway, DiscoverySnapshot } from '../data/types'
import { ui } from '../locales/phrases'
import { BatchPhoto } from '../components/BatchPhoto'
import { DemoImage } from '../components/DemoImage'
import { foodImage } from '../components/demo-images'
import { predictedCandidates } from '../clearance/PredictedClearance'
import { SellOutPill } from '../clearance/SellOutInfo'
import type { ClearancePrediction } from '../clearance/prediction'
import { malaysiaTime } from './batch-time'
import { eligibleOffers, foodMatches, type Filters } from './engine'
import { CardBadge, FoodCard } from './FoodCard'
import { portionPercent, ratingLabel, timeLeft } from './DiscoverSections'
import { SectionTitle } from './SectionTitle'
import './SellingOutSoon.css'

type Stall = DiscoverySnapshot['stalls'][number]
type Food = NonNullable<DiscoverySnapshot['menu']>[number]
type Batch = DiscoverySnapshot['batches'][number]
export type Item = { key: string; stall: Stall; food?: Food; batch?: Batch; title: string; priceSen: number; wasSen?: number; endsAt?: string; prediction?: ClearancePrediction; order: number }

// Foods, not stalls: live clearance offers first, then (when ticked) one food per stall with an estimated sell-out.
// `stallIds` are the stalls that already passed the page's search and filters; the food itself must pass too.
function sellingOutItems(data: DiscoverySnapshot, now: Date, filters: Filters, stallIds: Set<string>, withEstimates: boolean): Item[] {
  const items: Item[] = []
  const seen = new Set<string>()
  for (const offer of eligibleOffers(data, now)) {
    const stall = data.stalls.find(s => s.id === offer.stallId)
    if (!stall || !stallIds.has(stall.id)) continue
    const food = offer.foodItemId ? data.menu.find(f => f.id === offer.foodItemId) : undefined
    if (food && !foodMatches(data, filters, stall, food)) continue
    const batch = offer.batchId ? data.batches.find(b => b.id === offer.batchId) : undefined
    seen.add(food?.id ?? offer.id)
    items.push({ key: `offer-${offer.id}`, stall, food, batch, title: food?.name ?? offer.title, priceSen: offer.priceSen, wasSen: offer.originalPriceSen > offer.priceSen ? offer.originalPriceSen : undefined, endsAt: offer.endsAt, order: Date.parse(offer.endsAt) })
  }
  items.sort((a, b) => a.order - b.order)
  if (!withEstimates) return items
  return [...items, ...estimateItems(data, now, (stall, food) => stallIds.has(stall.id) && foodMatches(data, filters, stall, food), seen)]
}

// The forecast is per stall, so each stall appears once, with the food from its newest batch; soonest window first
export function estimateItems(data: DiscoverySnapshot, now: Date, accept: (stall: Stall, food: Food) => boolean, seen = new Set<string>()): Item[] {
  const best = new Map<string, Item>()
  for (const { batch, food, stall, prediction } of predictedCandidates(data, now)) {
    if (seen.has(food.id) || !accept(stall, food)) continue
    const current = best.get(stall.id)
    if (current && !(batch && (!current.batch || Date.parse(batch.preparedAt) > Date.parse(current.batch.preparedAt)))) continue
    best.set(stall.id, { key: `estimate-${batch?.id ?? `sample-${stall.id}-${food.id}`}`, stall, food, batch, title: food.name, priceSen: food.priceSen, prediction, order: prediction.windowStart.getTime() })
  }
  const estimates = [...best.values()]
  estimates.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title, 'en'))
  return estimates
}

// The horizontal swipe row with its arrows: one click moves by the cards in view, arrows disable at the ends.
// `hideWhenFit` removes them when every card already fits.
export function SellingOutRow({ items, hideWhenFit = false, children }: { items: Item[]; hideWhenFit?: boolean; children: (item: Item) => ReactNode }) {
  const signature = items.map(item => item.key).join('|')
  const track = useRef<HTMLUListElement>(null)
  const [edge, setEdge] = useState({ start: true, end: true })
  const measure = useCallback(() => {
    const node = track.current
    if (node) setEdge({ start: node.scrollLeft <= 2, end: node.scrollLeft + node.clientWidth >= node.scrollWidth - 2 })
  }, [])
  useEffect(() => {
    const node = track.current
    if (!node) return
    node.scrollLeft = 0
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [signature, measure])
  // One click moves by the cards currently in view
  function step(direction: -1 | 1) {
    const node = track.current, first = node?.firstElementChild as HTMLElement | null | undefined
    if (!node || !first) return
    const gap = parseFloat(getComputedStyle(node).columnGap) || 0, width = first.offsetWidth + gap
    const visible = Math.max(1, Math.floor((node.clientWidth + gap) / width + .02))
    node.scrollBy({ left: direction * visible * width, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }
  const showArrows = !(hideWhenFit && edge.start && edge.end)
  return <div className="sellout-row">
    {showArrows && <button type="button" className="sellout-arrow prev" aria-label={ui('Previous foods')} disabled={edge.start} onClick={() => step(-1)}><ChevronLeft size={22} aria-hidden="true"/></button>}
    <ul className="sellout-track" ref={track} onScroll={measure}>{items.map(item => <li className="sellout-item" key={item.key}>{children(item)}</li>)}</ul>
    {showArrows && <button type="button" className="sellout-arrow next" aria-label={ui('Next foods')} disabled={edge.end} onClick={() => step(1)}><ChevronRight size={22} aria-hidden="true"/></button>}
  </div>
}

// One food card: photo, name, stall, price and the time or portion details; estimates carry the orange pill and its "?"
export function SellingOutCard({ item, data, now, gateway }: { item: Item; data: DiscoverySnapshot; now: Date; gateway: DataGateway }) {
  const { i18n } = useTranslation(), bm = i18n.language.startsWith('ms')
  const { stall, food, batch } = item
  const market = data.markets.find(m => m.id === stall.marketId)
  const live = batch && Date.parse(batch.deadline) > now.getTime() && batch.remaining > 0 ? batch : undefined
  const left = live ? Date.parse(live.deadline) - now.getTime() : 0
  const meta = [
    { Icon: Store, text: [stall.name, market?.area].filter(Boolean).join(' · ') },
    ...(item.endsAt ? [{ Icon: Clock3, text: ui('Reserve by {time}', { time: malaysiaTime(item.endsAt, i18n.language) }) }] : []),
    ...(live ? [{ Icon: Leaf, text: `${live.remaining} ${bm ? 'hidangan' : 'portions'} · ${timeLeft(left, bm)} ${bm ? 'lagi' : 'left'}` }] : !item.endsAt && !batch ? [{ Icon: Clock3, text: ui('Sample planning estimate · no current batch listed') }] : []),
  ]
  return <FoodCard gateway={gateway} stallId={stall.id} stallName={stall.name} foodId={food?.id} to={`/stalls/${stall.id}`} title={item.title} priceSen={item.priceSen} rating={ratingLabel(stall)}
    photo={batch ? <BatchPhoto food={item.title} number={batch.batchNumber} foodId={batch.foodItemId} batchId={batch.id} photo={batch.photoUrl}/> : <DemoImage image={foodImage(food?.name ?? stall.specialty)} photo={food?.photoUrl} description={`${item.title} from ${stall.name}`} sizes="(max-width: 600px) 82vw, 320px"/>}
    badge={item.endsAt ? <CardBadge kind="hot" label={ui('Live offer')} Icon={Tag}/> : undefined}
    wasPriceSen={item.wasSen}
    meta={meta}
    note={item.prediction && <SellOutPill prediction={item.prediction} locale={i18n.language}/>}
    track={live ? <div className="food-track" role="meter" aria-label={bm ? 'Baki hidangan' : 'Portions remaining'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={portionPercent(live, now)}><span style={{ transform: `scaleX(${portionPercent(live, now) / 100})` }}/></div> : undefined}/>
}

export function SellingOutSoon({ data, now, gateway, filters, stallIds }: { data: DiscoverySnapshot; now: Date; gateway: DataGateway; filters: Filters; stallIds: Set<string> }) {
  const [withEstimates, setWithEstimates] = useState(false)
  const canEstimate = gateway.mode === 'fixture' // estimates are demo-only, like the rest of the clearance forecast
  const items = useMemo(() => sellingOutItems(data, now, filters, stallIds, canEstimate && withEstimates), [data, now, filters, stallIds, canEstimate, withEstimates])

  return <section className="selling-out" aria-labelledby="selling-out-title">
    <div className="section-heading selling-heading">
      <SectionTitle Icon={Flame} tone="flame" id="selling-out-title" title={ui('Selling out soon')} sub={ui('Foods with a live offer or a likely sell-out tonight.')}/>
      {canEstimate && <label className="sellout-toggle"><input type="checkbox" checked={withEstimates} onChange={event => setWithEstimates(event.target.checked)}/><span className="sellout-toggle-text"><strong>{ui('Show estimated sell-outs')}</strong><small>{ui('Based on usual sales speed • Not a live discount')}</small></span></label>}
    </div>
    {items.length === 0
      ? <p className="sellout-empty" role="status">{canEstimate && !withEstimates ? ui('No live offers match right now. Tick “Show estimated sell-outs” to see likely sell-outs.') : ui('No foods match right now. Try another search or category.')}</p>
      : <SellingOutRow items={items}>{item => <SellingOutCard item={item} data={data} now={now} gateway={gateway}/>}</SellingOutRow>}
  </section>
}
