import { ArrowRight, Clock3, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router'
import { BatchPhoto } from '../components/BatchPhoto'
import { DemoImage } from '../components/DemoImage'
import { foodImage } from '../components/demo-images'
import type { DiscoverySnapshot } from '../data/types'
import { confidenceLabel, discoveryStallPrediction, formatPredictionWindow, formatSellOutWindow, hasActiveOfferForBatch, LIKELY_CLEARANCE_THRESHOLD } from './prediction'
import type { ClearancePrediction } from './prediction'
import './predicted-clearance.css'

const estimateDisclaimer = (prediction: ClearancePrediction) => prediction.isSample
  ? 'This is a sample estimate based on a demo prep plan and usual sales speed. Prices haven’t dropped yet.'
  : 'This is an estimate based on today’s stock and usual sales speed. Prices haven’t dropped yet.'

export function PredictionBadge({ prediction, locale = 'en', compact = false }: { prediction: ClearancePrediction; locale?: string; compact?: boolean }) {
  return <div className={`prediction-badge ${compact ? 'prediction-badge-compact' : ''}`}>
    <span className="prediction-label"><Sparkles size={13}/>Likely to sell out soon</span>
    <strong>Estimated sell-out: {formatSellOutWindow(prediction.windowStart, locale)} · {confidenceLabel(prediction.score)}</strong>
    <small>{estimateDisclaimer(prediction)}</small>
  </div>
}

// Card badge-slot variant: same dashed orange signature, sized to sit with the other badge pills
export function PredictionPill({ prediction }: { prediction: ClearancePrediction }) {
  return <span className="prediction-pill" title={`${confidenceLabel(prediction.score)} estimate, not a live offer`}><Sparkles size={12} aria-hidden="true"/>Estimated</span>
}

// Card footer tag + disclaimer that accompany the pill
export function PredictionTagText({ prediction, locale = 'en' }: { prediction: ClearancePrediction; locale?: string }) {
  return <>Estimated sell-out: {formatSellOutWindow(prediction.windowStart, locale)}</>
}
export function PredictionNote({ prediction }: { prediction: ClearancePrediction }) {
  return <p className="prediction-note"><strong>Likely to sell out soon · {confidenceLabel(prediction.score)}.</strong> {estimateDisclaimer(prediction)}</p>
}

export function HawkerPredictionNudge({ prediction, locale = 'en' }: { prediction: ClearancePrediction; locale?: string }) {
  return <aside className="hawker-prediction-nudge"><strong>{prediction.isSample ? 'The sample prep plan suggests' : 'Your prep volume today suggests'} a <span className="hawker-prediction-score">{prediction.score}% heuristic likelihood score</span> for a clearance around <span className="hawker-prediction-window">{formatPredictionWindow(prediction.windowStart, locale)}</span> — consider an early promo.</strong><p>{prediction.isSample ? 'Synthetic planned prep' : 'Today’s recorded prep'}: {prediction.preparedToday} portions · sample planning baseline: {prediction.baseline} portions. This is a prediction, not a guarantee or an automatic markdown.</p><NavLink className="button secondary" to="/hawker/promotions">Review promotion options</NavLink></aside>
}

export function predictedStall(data: DiscoverySnapshot, stallId: string, now: Date): ClearancePrediction | null {
  const prediction = discoveryStallPrediction(data, stallId, now)
  const hasUnmarkedBatch = (data.batches ?? []).some(batch => {
    const food = data.menu?.find(item => item.id === batch.foodItemId)
    return food?.stallId === stallId && !hasActiveOfferForBatch(data, batch.id, stallId, batch.foodItemId, now)
  })
  return prediction && prediction.score >= LIKELY_CLEARANCE_THRESHOLD && (prediction.isSample || hasUnmarkedBatch) ? prediction : null
}

// `limit` trims to a single preview row; `seeMoreTo` adds the heading's "See more" link to the full list
export function PredictedClearanceSection({ data, now, locale = 'en', limit, seeMoreTo }: { data: DiscoverySnapshot; now: Date; locale?: string; limit?: number; seeMoreTo?: string }) {
  type Candidate = { batch?: DiscoverySnapshot['batches'][number]; food: NonNullable<DiscoverySnapshot['menu']>[number]; stall: DiscoverySnapshot['stalls'][number]; prediction: ClearancePrediction }
  const candidates: Candidate[] = (data.batches ?? []).flatMap(batch => {
    const food = data.menu?.find(item => item.id === batch.foodItemId)
    const stall = data.stalls.find(item => item.id === food?.stallId)
    if (!food || !stall || hasActiveOfferForBatch(data, batch.id, stall.id, batch.foodItemId, now)) return []
    const prediction = predictedStall(data, stall.id, now)
    return prediction ? [{ batch, food, stall, prediction }] : []
  })
  if (!candidates.some(candidate => candidate.stall.id === 'bara-senja')) {
    const stall = data.stalls.find(item => item.id === 'bara-senja')
    const food = data.menu?.find(item => item.stallId === stall?.id)
    const prediction = stall ? predictedStall(data, stall.id, now) : null
    if (stall && food && prediction?.isSample) candidates.push({ batch: undefined, food, stall, prediction })
  }
  if (!candidates.length) return null
  // A limited preview leads with one card per stall so a single stall's batches don't fill the row
  const firstPerStall = candidates.filter((c, i) => candidates.findIndex(x => x.stall.id === c.stall.id) === i)
  const shown = limit === undefined ? candidates : [...firstPerStall, ...candidates.filter(c => !firstPerStall.includes(c))].slice(0, limit)
  return <section className="predicted-clearance-section" aria-labelledby="predicted-clearance-title">
    <div className="predicted-clearance-heading"><div><span className="prediction-kicker"><Sparkles size={14}/>DEMO HEURISTIC · NOT A LIVE OFFER</span><h2 id="predicted-clearance-title">Predicted clearances</h2><p>These items have not been marked down by their hawkers; timing and score are estimates.</p></div>{seeMoreTo && candidates.length > (limit ?? Infinity) && <NavLink className="predicted-see-more" to={seeMoreTo}>See more<ArrowRight size={15}/></NavLink>}</div>
    <div className="predicted-clearance-grid">{shown.map(({ batch, food, stall, prediction }, index) => <PredictedBatchCard key={batch?.id ?? `sample-${stall.id}-${food.id}-${index}`} batch={batch} foodName={food.name} stallName={stall.name} stallId={stall.id} prediction={prediction} locale={locale}/>)}</div>
  </section>
}

function PredictedBatchCard({ batch, foodName, stallName, stallId, prediction, locale }: { batch?: DiscoverySnapshot['batches'][number]; foodName: string; stallName: string; stallId: string; prediction: ClearancePrediction; locale: string }) {
  return <article className="predicted-clearance-card">
    <NavLink to={`/stalls/${stallId}`} className="predicted-clearance-image">{batch?<BatchPhoto food={foodName} number={batch.batchNumber} foodId={batch.foodItemId} batchId={batch.id} photo={batch.photoUrl}/>:<DemoImage image={foodImage(foodName)} description={`${foodName} at ${stallName} · sample forecast`}/>}<span className="predicted-corner-tag">ESTIMATED</span></NavLink>
    <div className="predicted-clearance-copy"><span className="eyebrow">{stallName}</span><h3>{foodName}</h3>{batch?<div className="predicted-batch-meta"><span><Clock3 size={13}/>~{batch.remaining} portions left</span><span>Batch #{batch.batchNumber}</span></div>:<div className="predicted-batch-meta">Sample planning estimate · no current batch listed</div>}<PredictionBadge prediction={prediction} locale={locale} compact/><p className="predicted-no-offer">No discount yet. This is an estimate, not a booking.</p><NavLink className="back-link" to={`/stalls/${stallId}`}>View stall details</NavLink></div>
  </article>
}
