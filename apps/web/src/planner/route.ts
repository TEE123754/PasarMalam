export interface PlannerStopInput {
  id: string
  latitude: number | null | undefined
  longitude: number | null | undefined
  urgencyMinutes: number | null
}

export interface PlannedStop<T extends PlannerStopInput> {
  stop: T
  distanceFromPreviousKm: number | null
  score: number
}

const EARTH_RADIUS_KM = 6371.0088
const DISTANCE_WEIGHT = 1
const URGENCY_WEIGHT_KM = 4

export function distanceKm(a: Pick<PlannerStopInput, 'latitude' | 'longitude'>, b: Pick<PlannerStopInput, 'latitude' | 'longitude'>): number | null {
  if (![a.latitude, a.longitude, b.latitude, b.longitude].every(value => typeof value === 'number' && Number.isFinite(value))) return null
  const radians = (degrees: number) => degrees * Math.PI / 180
  const lat1 = radians(a.latitude!), lat2 = radians(b.latitude!)
  const dLat = lat2 - lat1, dLon = radians(b.longitude! - a.longitude!)
  const haversine = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, haversine)))
}

/**
 * Begin at the shopper's chosen start stall when given; otherwise at the most
 * urgent selected stall when one has an active countdown. Then use a greedy route:
 * score = added straight-line distance (km) - inverse-time urgency bonus (km).
 * The bonus is 4/sqrt(minutes + 1), so a small detour can advance a short window.
 */
export function planRoute<T extends PlannerStopInput>(stops: T[], startId?: string): PlannedStop<T>[] {
  if (stops.length < 2) return stops.map(stop => ({ stop, distanceFromPreviousKm: null, score: 0 }))
  const remaining = [...stops]
  const firstUrgentIndex = remaining.reduce((best, stop, index) => {
    const minutes = stop.urgencyMinutes
    if (minutes === null || !Number.isFinite(minutes) || minutes < 0) return best
    if (best < 0 || minutes < remaining[best].urgencyMinutes!) return index
    return best
  }, -1)
  const chosenIndex = startId ? remaining.findIndex(stop => stop.id === startId) : -1
  const firstIndex = chosenIndex >= 0 ? chosenIndex : firstUrgentIndex >= 0 ? firstUrgentIndex : 0
  const first = remaining.splice(firstIndex, 1)[0]
  const result: PlannedStop<T>[] = [{ stop: first, distanceFromPreviousKm: null, score: first.urgencyMinutes === null ? 0 : -urgencyBonus(first.urgencyMinutes) }]
  let previous: T = first

  while (remaining.length) {
    let selectedIndex = 0
    let selectedDistance: number | null = null
    let selectedScore = Number.POSITIVE_INFINITY
    remaining.forEach((candidate, index) => {
      const distance = distanceKm(previous, candidate)
      const score = (distance ?? 0) * DISTANCE_WEIGHT - (candidate.urgencyMinutes === null ? 0 : urgencyBonus(candidate.urgencyMinutes))
      if (score < selectedScore) {
        selectedIndex = index
        selectedDistance = distance
        selectedScore = score
      }
    })
    const [selected] = remaining.splice(selectedIndex, 1)
    result.push({ stop: selected, distanceFromPreviousKm: selectedDistance, score: selectedScore })
    previous = selected
  }
  return result
}

function urgencyBonus(minutes: number): number {
  return URGENCY_WEIGHT_KM / Math.sqrt(Math.max(0, minutes) + 1)
}
