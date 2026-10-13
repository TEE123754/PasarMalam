import { Clock3, Sparkles } from 'lucide-react'
import { NavLink } from 'react-router'
import { BatchPhoto } from '../components/BatchPhoto'
import { DemoImage } from '../components/DemoImage'
import { foodImage } from '../components/demo-images'
import type { DiscoverySnapshot } from '../data/types'
import { discoveryStallPrediction, formatPredictionWindow, hasActiveOfferForBatch, LIKELY_CLEARANCE_THRESHOLD, SAMPLE_FORECAST_BASELINE } from './prediction'
import type { ClearancePrediction } from './prediction'
import './predicted-clearance.css'

export function PredictionBadge({ prediction, locale = 'en', compact = false }: { prediction: ClearancePrediction; locale?: string; compact?: boolean }) {
  return <div className={`prediction-badge ${compact ? 'prediction-badge-compact' : ''}`}>
    <span className="prediction-label"><Sparkles size={13}/>Likely to clear</span>
    <strong>~{formatPredictionWindow(prediction.windowStart, locale)} · {prediction.score}% heuristic score · {prediction.isSample ? 'sample prep plan' : 'today’s prep volume'}</strong>
    <small>{prediction.isSample ? `Synthetic planning example: ${prediction.preparedToday} planned portions versus the ${SAMPLE_FORECAST_BASELINE}-portion historical baseline. Not a live prep record.` : `Prediction, not a guarantee. Based on today’s prep versus the sample ${SAMPLE_FORECAST_BASELINE}-portion forecast baseline.`} No markdown is confirmed.</small>
  </div>
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

export function PredictedClearanceSection({ data, now, locale = 'en' }: { data: DiscoverySnapshot; now: Date; locale?: string }) {
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
  return <section className="predicted-clearance-section" aria-labelledby="predicted-clearance-title">
    <div className="predicted-clearance-heading"><div><span className="prediction-kicker"><Sparkles size={14}/>DEMO HEURISTIC · NOT A LIVE OFFER</span><h2 id="predicted-clearance-title">Predicted clearances</h2><p>These items have not been marked down by their hawkers; timing and score are estimates.</p></div></div>
    <div className="predicted-clearance-grid">{candidates.map(({ batch, food, stall, prediction }, index) => <PredictedBatchCard key={batch?.id ?? `sample-${stall.id}-${food.id}-${index}`} batch={batch} foodName={food.name} stallName={stall.name} stallId={stall.id} prediction={prediction} locale={locale}/>)}</div>
  </section>
}

function PredictedBatchCard({ batch, foodName, stallName, stallId, prediction, locale }: { batch?: DiscoverySnapshot['batches'][number]; foodName: string; stallName: string; stallId: string; prediction: ClearancePrediction; locale: string }) {
  return <article className="predicted-clearance-card">
    <NavLink to={`/stalls/${stallId}`} className="predicted-clearance-image">{batch?<BatchPhoto food={foodName} number={batch.batchNumber} foodId={batch.foodItemId} batchId={batch.id} photo={batch.photoUrl}/>:<DemoImage image={foodImage(foodName)} description={`${foodName} at ${stallName} · sample forecast`}/>}<span className="predicted-corner-tag">PREDICTED</span></NavLink>
    <div className="predicted-clearance-copy"><span className="eyebrow">{stallName}</span><h3>{foodName}</h3>{batch?<div className="predicted-batch-meta"><span><Clock3 size={13}/>{batch.remaining} portions recorded remaining</span><span>Batch #{batch.batchNumber}</span></div>:<div className="predicted-batch-meta">Sample planning estimate · no current batch listed</div>}<PredictionBadge prediction={prediction} locale={locale} compact/><p className="predicted-no-offer">No price reduction is live yet; this is not a reservation or a confirmed offer.</p><NavLink className="back-link" to={`/stalls/${stallId}`}>View stall details</NavLink></div>
  </article>
}
