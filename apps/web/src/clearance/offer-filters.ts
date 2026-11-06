import type { DiscoverySnapshot } from '../data/types'
import { categories, categoryId } from '../discovery/classifications'
import { normalizeSearch } from '../discovery/engine'

// Search and filters for the Offers page. Everything is derived from the offers the page already lists,
// so a search never reaches a stall without an offer and an option never leads to an empty list.
type Offer = DiscoverySnapshot['offers'][number]
export type OfferFilters = { search: string; category: string; market: string; kind: string }
export const noOfferFilters: OfferFilters = { search: '', category: '', market: '', kind: '' }
export const offerFiltersActive = (filters: OfferFilters) => Boolean(filters.search.trim() || filters.category || filters.market || filters.kind)

// "free" is a share-a-meal offer, "bogo" pays for one and takes two, anything else is a percentage off the menu price
export function offerKind(data: DiscoverySnapshot, offer: Offer): string {
  if (offer.priceSen === 0) return 'free'
  const food = data.menu.find(item => item.id === offer.foodItemId)
  if (food && offer.originalPriceSen === food.priceSen * 2 && offer.priceSen === food.priceSen) return 'bogo'
  const pct = offer.originalPriceSen ? Math.round((1 - offer.priceSen / offer.originalPriceSen) * 100) : 0
  return pct > 0 ? `pct-${pct}` : 'other'
}

function offerCategory(data: DiscoverySnapshot, offer: Offer): string | null {
  const stall = data.stalls.find(item => item.id === offer.stallId)
  const food = data.menu.find(item => item.id === offer.foodItemId)
  return categoryId(food?.categoryId ?? stall?.categoryId ?? stall?.category) ?? null
}

type Facet = 'category' | 'market' | 'kind'
// `skip` leaves one filter out, so that filter's own options reflect the others
export function offerMatches(data: DiscoverySnapshot, offer: Offer, filters: OfferFilters, skip?: Facet): boolean {
  const stall = data.stalls.find(item => item.id === offer.stallId)
  const term = normalizeSearch(filters.search)
  if (term) {
    const food = data.menu.find(item => item.id === offer.foodItemId)
    if (!normalizeSearch(`${food?.name ?? offer.title} ${stall?.name ?? ''}`).includes(term)) return false
  }
  if (skip !== 'category' && filters.category && offerCategory(data, offer) !== (categoryId(filters.category) ?? filters.category)) return false
  if (skip !== 'market' && filters.market && stall?.marketId !== filters.market) return false
  if (skip !== 'kind' && filters.kind && offerKind(data, offer) !== filters.kind) return false
  return true
}

export const filterOffers = (data: DiscoverySnapshot, offers: Offer[], filters: OfferFilters) => offers.filter(offer => offerMatches(data, offer, filters))

export type OfferOption = { id: string; label: string }
export type OfferKindLabel = { id: string; pct?: number }
const kindRank = (id: string) => id === 'free' ? 0 : id === 'bogo' ? 1 : id.startsWith('pct-') ? 2 : 3

// Options come from the offers left once the other filters and the search are applied. The chosen value always stays listed.
export function offerOptions(data: DiscoverySnapshot, offers: Offer[], filters: OfferFilters) {
  const left = (skip: Facet) => offers.filter(offer => offerMatches(data, offer, filters, skip))
  const categoryIds = new Set(left('category').map(offer => offerCategory(data, offer)).filter((id): id is string => !!id))
  if (filters.category) categoryIds.add(categoryId(filters.category) ?? filters.category)
  const marketIds = new Set(left('market').map(offer => data.stalls.find(stall => stall.id === offer.stallId)?.marketId).filter((id): id is string => !!id))
  if (filters.market) marketIds.add(filters.market)
  const kindIds = new Set(left('kind').map(offer => offerKind(data, offer)))
  if (filters.kind) kindIds.add(filters.kind)
  return {
    categories: categories.filter(item => categoryIds.has(item.id)).map(item => ({ id: item.id, en: item.en })),
    markets: [...marketIds].flatMap(id => { const market = data.markets.find(item => item.id === id); return market ? [{ id, name: market.name }] : [] }).sort((a, b) => a.name.localeCompare(b.name, 'en')),
    kinds: [...kindIds].map((id): OfferKindLabel => ({ id, pct: id.startsWith('pct-') ? Number(id.slice(4)) : undefined }))
      .sort((a, b) => kindRank(a.id) - kindRank(b.id) || (b.pct ?? 0) - (a.pct ?? 0)),
  }
}
