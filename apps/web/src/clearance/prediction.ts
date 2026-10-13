import planningExample from '../../public/planning-demo.json'
import type { DiscoverySnapshot } from '../data/types'
import type { VendorStall, VendorWorkspace } from '../vendor/model'

export const SAMPLE_FORECAST_BASELINE = planningExample.benchmark.baseline_quantity
export const LIKELY_CLEARANCE_THRESHOLD = 65
const MALAYSIA_TIME_ZONE = 'Asia/Kuala_Lumpur'

export interface ClearancePrediction {
  score: number
  preparedToday: number
  baseline: number
  isSample: boolean
  windowStart: Date
  windowEnd: Date
  minutesUntilWindow: number
}

export function predictClearance(preparedToday: number, baseline: number, now: Date, opens: string | null | undefined, closes: string | null | undefined, isSample = false): ClearancePrediction | null {
  if (!Number.isFinite(preparedToday) || preparedToday <= 0 || !Number.isFinite(baseline) || baseline <= 0 || !Number.isFinite(now.getTime())) return null
  const progress = operatingDayProgress(now, opens, closes)
  const excess = Math.max(0, (preparedToday - baseline) / baseline)
  // A transparent demo score, not a calibrated probability: excess prep volume
  // raises the score, and the stall's operating-day sell-through window adds urgency.
  const aboveBaseline = preparedToday > baseline
  const score = Math.min(95, Math.max(0, Math.round(aboveBaseline ? 65 + excess * 40 + progress * 15 : 25 + progress * 30)))
  const remaining = minutesUntilClosing(now, opens, closes)
  const eta = remaining === null ? 30 : remaining <= 0 ? 0 : Math.max(15, Math.ceil(remaining * (1 - score / 100) / 15) * 15)
  const windowStart = new Date(now.getTime() + eta * 60_000)
  return { score, preparedToday: Math.round(preparedToday), baseline, isSample, windowStart, windowEnd: new Date(windowStart.getTime() + 30 * 60_000), minutesUntilWindow: eta }
}

export function discoveryPrepToday(data: DiscoverySnapshot, stallId: string, now: Date): number {
  const foodIds = new Set((data.menu ?? []).filter(food => food.stallId === stallId).map(food => food.id))
  return (data.batches ?? []).filter(batch => foodIds.has(batch.foodItemId) && isSameMalaysiaDay(batch.correctedPreparedAt ?? batch.preparedAt, now) && Number.isFinite(batch.originalQuantity) && (batch.originalQuantity ?? 0) > 0).reduce((sum, batch) => sum + (batch.originalQuantity ?? 0), 0)
}

export function vendorPrepToday(workspace: VendorWorkspace, stallId: string, now: Date): number {
  const foodIds = new Set(workspace.foods.filter(food => food.stall_id === stallId).map(food => food.id))
  return workspace.batches.filter(batch => batch.status === 'active' && batch.advisory_deadline !== null && Date.parse(batch.advisory_deadline) > now.getTime() && foodIds.has(batch.food_item_id) && isSameMalaysiaDay(batch.corrected_prepared_at ?? batch.prepared_at, now) && Number.isFinite(batch.original_quantity) && (batch.original_quantity ?? 0) > 0).reduce((sum, batch) => sum + (batch.original_quantity ?? 0), 0)
}

export function isTodayInMalaysia(value: string, now: Date): boolean {
  return isSameMalaysiaDay(value, now)
}

export function discoveryStallPrediction(data: DiscoverySnapshot, stallId: string, now: Date): ClearancePrediction | null {
  const stall = data.stalls.find(item => item.id === stallId)
  if (!stall) return null
  const preparedToday = discoveryPrepToday(data, stallId, now)
  return preparedToday > 0
    ? predictClearance(preparedToday, SAMPLE_FORECAST_BASELINE, now, stall.opens, stall.closes)
    : stall.id === 'bara-senja'
      ? predictClearance(planningExample.planned, SAMPLE_FORECAST_BASELINE, now, stall.opens, stall.closes, true)
      : null
}

export function vendorStallPrediction(workspace: VendorWorkspace, stall: VendorStall, now: Date): ClearancePrediction | null {
  const preparedToday = vendorPrepToday(workspace, stall.id, now)
  return preparedToday > 0
    ? predictClearance(preparedToday, SAMPLE_FORECAST_BASELINE, now, stall.opens, stall.closes)
    : stall.id === 'bara-senja'
      ? predictClearance(planningExample.planned, SAMPLE_FORECAST_BASELINE, now, stall.opens, stall.closes, true)
      : null
}

export function hasActiveOfferForBatch(data: DiscoverySnapshot, batchId: string, stallId: string, foodItemId: string, now: Date): boolean {
  return data.offers.some(offer => Date.parse(offer.endsAt) > now.getTime() && offer.stallId === stallId && (offer.batchId ? offer.batchId === batchId : offer.foodItemId ? offer.foodItemId === foodItemId : true))
}

export function formatPredictionWindow(date: Date, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale.startsWith('ms') ? 'ms-MY' : 'en-MY', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: MALAYSIA_TIME_ZONE })
  return `${formatter.format(date)}–${formatter.format(new Date(date.getTime() + 30 * 60_000))}`
}

// Shopper-facing wording for the heuristic score; display only, the score itself is unchanged
export function confidenceLabel(score: number): 'High confidence' | 'Medium confidence' | 'Lower confidence' {
  return score >= 85 ? 'High confidence' : score >= 60 ? 'Medium confidence' : 'Lower confidence'
}

// "8:53 PM – 9:23 PM" for the shopper cards (the hawker nudge keeps formatPredictionWindow)
export function formatSellOutWindow(date: Date, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale.startsWith('ms') ? 'ms-MY' : 'en-MY', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: MALAYSIA_TIME_ZONE })
  const time = (value: Date) => formatter.format(value).replace(/\s*(am|pm|PG|PTG)$/i, (_, period: string) => ` ${period.toUpperCase()}`)
  return `${time(date)} – ${time(new Date(date.getTime() + 30 * 60_000))}`
}

function isSameMalaysiaDay(value: string, now: Date): boolean {
  if (!Number.isFinite(Date.parse(value))) return false
  const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: MALAYSIA_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' })
  return formatter.format(new Date(value)) === formatter.format(now)
}

function localMinute(now: Date): number {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: MALAYSIA_TIME_ZONE, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(now)
  const hour = Number(parts.find(part => part.type === 'hour')?.value), minute = Number(parts.find(part => part.type === 'minute')?.value)
  return hour * 60 + minute
}

function parseClock(value: string | null | undefined): number | null {
  if (!value || !/^\d{2}:\d{2}$/.test(value)) return null
  const [hour, minute] = value.split(':').map(Number)
  return hour <= 24 && minute < 60 ? (hour % 24) * 60 + minute : null
}

function operatingDayProgress(now: Date, opens: string | null | undefined, closes: string | null | undefined): number {
  const start = parseClock(opens), close = parseClock(closes)
  if (start === null || close === null || start === close) return .5
  const end = close <= start ? close + 1440 : close
  let current = localMinute(now)
  if (close <= start && current < start) current += 1440
  const duration = end - start
  return Math.max(0, Math.min(1, (current - start) / duration))
}

function minutesUntilClosing(now: Date, opens: string | null | undefined, closes: string | null | undefined): number | null {
  const start = parseClock(opens), close = parseClock(closes)
  if (start === null || close === null || start === close) return null
  const end = close <= start ? close + 1440 : close
  let current = localMinute(now)
  if (close <= start && current < start) current += 1440
  if (current < start) return end - start
  return Math.max(0, end - current)
}
