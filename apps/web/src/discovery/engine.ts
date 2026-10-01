import type { Market, Stall, DiscoverySnapshot } from '../data/types'

export type Point = { latitude: number; longitude: number }
export type Bounds = { south: number; west: number; north: number; east: number }
export type Filters = { search: string; market: string; type: string; category: string; dietary: string; promotion: boolean; sort: string; radius: number; origin: Point | null; bounds: Bounds | null }
export const defaultFilters: Filters = { search: '', market: '', type: '', category: '', dietary: '', promotion: false, sort: 'rating', radius: 50, origin: null, bounds: null }
const DAY = 86400000
const minutes = (value: string) => Number(value.slice(0, 2)) * 60 + Number(value.slice(3, 5))
const localDate = (time: number) => new Date(time + 8 * 3600000).toISOString().slice(0, 10)

export function scheduleStatus(market: Pick<Market, 'schedules' | 'exceptions'>, now: Date): 'open' | 'upcoming' | 'closed' {
  const at = now.getTime()
  for (let offset = -1; offset <= 1; offset++) {
    const date = localDate(at + offset * DAY)
    const start = Date.parse(`${date}T00:00:00+08:00`)
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
    const exception = market.exceptions.find(e => e.date === date)
    if (exception?.cancelled) continue
    const schedules = exception?.opens && exception.closes
      ? [{ weekday, opens: exception.opens, closes: exception.closes, nextDay: minutes(exception.closes) <= minutes(exception.opens) }]
      : market.schedules.filter(s => s.weekday === weekday)
    for (const s of schedules) {
      const open = start + minutes(s.opens) * 60000
      const close = start + minutes(s.closes) * 60000 + (s.nextDay || minutes(s.closes) <= minutes(s.opens) ? DAY : 0)
      if (at >= open && at < close) return 'open'
    }
  }
  // Opening-soon is the next two hours, including a session starting after midnight.
  for (let offset = 0; offset <= 1; offset++) {
    const date = localDate(at + offset * DAY)
    const weekday = new Date(`${date}T00:00:00Z`).getUTCDay()
    const exception = market.exceptions.find(e => e.date === date)
    if (exception?.cancelled) continue
    const openings = exception?.opens ? [exception.opens] : market.schedules.filter(s => s.weekday === weekday).map(s => s.opens)
    if (openings.some(value => { const delta = Date.parse(`${date}T${value.slice(0, 5)}:00+08:00`) - at; return delta > 0 && delta <= 7200000 })) return 'upcoming'
  }
  return 'closed'
}

export function distanceKm(a: Point, b: Point): number {
  const rad = Math.PI / 180
  const deltaLat = (b.latitude - a.latitude) * rad, deltaLon = (b.longitude - a.longitude) * rad
  const h = Math.sin(deltaLat / 2) ** 2 + Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(deltaLon / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(Math.max(0, 1 - h)))
}

export function dietaryStatus(stall: Stall, now: Date, foodItemId?: string): string {
  const claims = stall.claims.filter(c => !c.foodItemId || !foodItemId || c.foodItemId === foodItemId)
  const values = new Set(claims.map(c => c.status))
  if (values.has('non-halal') && (values.has('certified') || values.has('declared') || stall.halal === 'declared')) return 'conflict'
  if (stall.halal === 'non-halal') return values.has('certified') || values.has('declared') ? 'conflict' : 'non-halal'
  if (values.has('non-halal')) return 'non-halal'
  const certifications = claims.filter(c => c.status === 'certified')
  // A stall-wide certified filter cannot be satisfied by only one certified menu item.
  const certificate = certifications.find(c => (foodItemId || !c.foodItemId) && c.evidence && c.reviewedAt && Date.parse(c.reviewedAt) <= now.getTime() && c.expiresAt && Date.parse(c.expiresAt) > now.getTime())
  if (certificate) return 'certified'
  if (certifications.length) return 'expired'
  return values.has('declared') || stall.halal === 'declared' ? 'declared' : 'not-declared'
}

const aliases: Record<string, string> = { ayam: 'chicken', sate: 'satay', 'nasi': 'rice', mi: 'noodles', mee: 'noodles', pencuci: 'desserts', kuih: 'desserts' }
export const normalizeSearch = (value: string) => value.toLocaleLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).map(word => aliases[word] || word).join(' ').trim()

export function eligibleOffers(data: DiscoverySnapshot, now: Date) {
  return data.offers.filter(o => Number.isFinite(Date.parse(o.endsAt)) && Date.parse(o.endsAt) > now.getTime())
}

export function discover(data: DiscoverySnapshot, filters: Filters, now: Date, page = 0, size = 6) {
  const term = normalizeSearch(filters.search)
  const markets = data.markets.filter(m => {
    if (filters.market && m.id !== filters.market || filters.type && m.type !== filters.type) return false
    if (filters.origin && (m.latitude === null || m.longitude === null || distanceKm(filters.origin, { latitude: m.latitude, longitude: m.longitude }) > filters.radius)) return false
    const b = filters.bounds
    return !b || (m.latitude !== null && m.longitude !== null && m.latitude >= b.south && m.latitude <= b.north && m.longitude >= b.west && m.longitude <= b.east)
  })
  const offers = eligibleOffers(data, now)
  const matched = data.stalls.filter(s => {
    const market = markets.find(m => m.id === s.marketId)
    if (!market || filters.category && s.category !== filters.category || filters.dietary && dietaryStatus(s, now) !== filters.dietary || filters.promotion && !offers.some(o => o.stallId === s.id)) return false
    const haystack = normalizeSearch([s.name, s.specialty, s.category, ...s.aliases, market.name, market.area, ...data.menu.filter(f => f.stallId === s.id).map(f => f.name)].join(' '))
    return !term || term.split(' ').every(word => haystack.includes(word))
  }).sort((a, b) => {
    const ma = markets.find(m => m.id === a.marketId)!, mb = markets.find(m => m.id === b.marketId)!
    const distance = (m: Market) => filters.origin && m.latitude !== null && m.longitude !== null ? distanceKm(filters.origin, { latitude: m.latitude, longitude: m.longitude }) : Infinity
    const rank = filters.sort === 'nearest' ? distance(ma) - distance(mb) : filters.sort === 'popularity' ? mb.popularity - ma.popularity : b.rating - a.rating
    return (Number.isNaN(rank) ? 0 : rank) || a.id.localeCompare(b.id, 'en')
  })
  const pages = Math.max(1, Math.ceil(matched.length / size))
  const index = Math.min(Math.max(0, page), pages - 1)
  const stalls = matched.slice(index * size, (index + 1) * size)
  // The map and card list refer to the same result page.
  return { stalls, markets: markets.filter(m => stalls.some(s => s.marketId === m.id)), total: matched.length, pages, page: index, offers }
}

export function acceptVersion(seen: Map<string, number>, market: string, version: number): boolean {
  if (!Number.isSafeInteger(version) || version <= (seen.get(market) ?? 0)) return false
  seen.set(market, version)
  return true
}
