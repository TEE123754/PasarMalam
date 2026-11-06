import { describe, expect, it } from 'vitest'
import sample from '../../../../contracts/discovery-fixture.json'
import { discoverySchema } from '../data/schemas'
import { filterOffers, noOfferFilters, offerFiltersActive, offerKind, offerOptions } from './offer-filters'

const base = discoverySchema.parse(sample)
// Three offers on three foods, one of each kind, plus a stall and a food with no offer
const [a, b, c] = base.menu.filter((food, index, all) => all.findIndex(other => other.stallId === food.stallId) === index).slice(0, 3)
const offer = (id: string, food: typeof a, priceSen: number, originalPriceSen: number) => ({ id, stallId: food.stallId, foodItemId: food.id, title: `${food.name} deal`, priceSen, originalPriceSen, endsAt: '2026-10-01T21:00:00+08:00' })
const offers = [offer('o1', a, 0, a.priceSen), offer('o2', b, b.priceSen, b.priceSen * 2), offer('o3', c, Math.floor(c.priceSen * .7), c.priceSen)]
const data = { ...base, offers }
const stallName = (food: typeof a) => base.stalls.find(stall => stall.id === food.stallId)!.name

describe('offer kinds', () => {
  it('reads share-a-meal, buy 1 get 1 and percentage offers from the offer and menu price', () => {
    expect(offers.map(item => offerKind(data, item))).toEqual(['free', 'bogo', `pct-${Math.round((1 - offers[2].priceSen / c.priceSen) * 100)}`])
  })
})

describe('offer search and filters', () => {
  it('searches only food and stalls that have an offer', () => {
    expect(filterOffers(data, offers, { ...noOfferFilters, search: a.name }).map(item => item.id)).toContain('o1')
    const stranger = base.menu.find(food => !offers.some(item => item.stallId === food.stallId))
    if (stranger) expect(filterOffers(data, offers, { ...noOfferFilters, search: stranger.name }).filter(item => item.stallId === stranger.stallId)).toHaveLength(0)
    expect(filterOffers(data, offers, { ...noOfferFilters, search: stallName(b) }).map(item => item.id)).toContain('o2')
  })
  it('filters by offer type and market', () => {
    expect(filterOffers(data, offers, { ...noOfferFilters, kind: 'free' }).map(item => item.id)).toEqual(['o1'])
    expect(filterOffers(data, offers, { ...noOfferFilters, kind: 'bogo' }).map(item => item.id)).toEqual(['o2'])
    const market = base.stalls.find(stall => stall.id === a.stallId)!.marketId
    expect(filterOffers(data, offers, { ...noOfferFilters, market }).map(item => item.id)).toContain('o1')
  })
  it('lists only options that lead to an offer', () => {
    const all = offerOptions(data, offers, noOfferFilters)
    expect(all.kinds.map(item => item.id).slice(0, 2)).toEqual(['free', 'bogo'])
    for (const kind of all.kinds) expect(filterOffers(data, offers, { ...noOfferFilters, kind: kind.id }).length).toBeGreaterThan(0)
    for (const market of all.markets) expect(filterOffers(data, offers, { ...noOfferFilters, market: market.id }).length).toBeGreaterThan(0)
    for (const category of all.categories) expect(filterOffers(data, offers, { ...noOfferFilters, category: category.id }).length).toBeGreaterThan(0)
    // narrowing by one filter narrows the others' options, and every remaining option still has results
    const narrowed = { ...noOfferFilters, kind: 'free' }
    const next = offerOptions(data, offers, narrowed)
    for (const market of next.markets) expect(filterOffers(data, offers, { ...narrowed, market: market.id }).length).toBeGreaterThan(0)
  })
  it('knows when a search or filter is active', () => {
    expect(offerFiltersActive(noOfferFilters)).toBe(false)
    expect(offerFiltersActive({ ...noOfferFilters, search: '  ' })).toBe(false)
    expect(offerFiltersActive({ ...noOfferFilters, kind: 'free' })).toBe(true)
  })
})
