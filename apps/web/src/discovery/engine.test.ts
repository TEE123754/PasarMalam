import { describe, expect, it } from 'vitest'
import sample from '../../../../contracts/discovery-fixture.json'
import { discoverySchema } from '../data/schemas'
import { acceptVersion, defaultFilters, dietaryStatus, discover, distanceKm, eligibleOffers, scheduleStatus } from './engine'
import { coarsePoint, requestDeviceLocation } from './location'
const data = discoverySchema.parse(sample)
const now = new Date('2026-10-01T18:00:00+08:00')
const overnight = {schedules:[{weekday:3,opens:'17:00',closes:'00:30',nextDay:true}],exceptions:[]}

describe('Malaysian schedule boundaries', () => {
  it.each([
    ['2026-09-30T16:59:59+08:00','upcoming'],['2026-09-30T17:00:00+08:00','open'],
    ['2026-09-30T23:59:59+08:00','open'],['2026-10-01T00:00:00+08:00','open'],
    ['2026-10-01T00:29:59+08:00','open'],['2026-10-01T00:30:00+08:00','closed'],
    ['2026-09-30T14:59:59+08:00','closed'],['2026-09-30T15:00:00+08:00','upcoming'],
  ])('%s gives %s', (time,status) => expect(scheduleStatus(overnight,new Date(time))).toBe(status))
  it('cancels a session including its after-midnight continuation', () => {
    expect(scheduleStatus({...overnight,exceptions:[{date:'2026-09-30',cancelled:true,opens:null,closes:null}]},new Date('2026-10-01T00:15:00+08:00'))).toBe('closed')
  })
  it('an exception replaces ordinary hours', () => {
    const market = {...overnight,exceptions:[{date:'2026-09-30',cancelled:false,opens:'10:00',closes:'12:00'}]}
    expect(scheduleStatus(market,new Date('2026-09-30T10:00:00+08:00'))).toBe('open')
    expect(scheduleStatus(market,new Date('2026-09-30T17:00:00+08:00'))).toBe('closed')
  })
  it('has no inferred schedule when records are empty', () => expect(scheduleStatus({schedules:[],exceptions:[]},now)).toBe('closed'))
})
describe('combined discovery and stable ranking', () => {
  it('BM and English dish search return the same stall', () => {
    for (const search of ['sate ayam','chicken satay','SATAY']) expect(discover(data,{...defaultFilters,search},now).stalls.map(s=>s.id)).toEqual(['bara-senja'])
  })
  it('combines type, category, dietary and promotion instead of broadening them', () => {
    expect(discover(data,{...defaultFilters,type:'night',category:'Skewers',dietary:'declared',promotion:true},now).stalls.map(s=>s.id)).toEqual(['bara-senja'])
    expect(discover(data,{...defaultFilters,dietary:'certified',promotion:true},now).total).toBe(0)
  })
  it('never shows a non-halal stall under certified', () => expect(discover(data,{...defaultFilters,dietary:'certified'},now).stalls.map(s=>s.id)).toEqual(['manis-bulan']))
  it('uses distance from a manual area and excludes locations outside the radius', () => {
    expect(distanceKm({latitude:3.107,longitude:101.606},{latitude:3.155,longitude:101.707})).toBeGreaterThan(10)
    const result=discover(data,{...defaultFilters,origin:{latitude:3.107,longitude:101.606},radius:1,sort:'nearest'},now)
    expect(result.stalls.every(s=>s.marketId==='seri-pelita')).toBe(true)
    expect(result.total).toBe(4)
  })
  it('applies map bounds and maps precisely the same page as the list', () => {
    const result=discover(data,{...defaultFilters,bounds:{south:3.14,north:3.17,west:101.7,east:101.72}},now)
    expect(result.markets.map(m=>m.id)).toEqual(['sungai-bintang'])
    expect(result.stalls.every(s=>s.marketId===result.markets[0].id)).toBe(true)
  })
  it('paginates without duplicates and breaks rank ties by stable identity', () => {
    const tied={...data,stalls:data.stalls.map(s=>({...s,rating:4}))}
    const one=discover(tied,defaultFilters,now,0,3),two=discover(tied,defaultFilters,now,1,3)
    expect(new Set([...one.stalls,...two.stalls].map(s=>s.id)).size).toBe(6)
    expect(one.stalls.map(s=>s.id)).toEqual([...data.stalls].sort((a,b)=>a.id.localeCompare(b.id,'en')).slice(0,3).map(s=>s.id))
    expect(discover(tied,defaultFilters,now,999,3).page).toBe(2)
  })
  it('ranks market visits independently of review ratings', () => expect(discover(data,{...defaultFilters,sort:'popularity'},now).stalls[0].marketId).toBe('seri-pelita'))
  it('empty searches have no pins or cards', () => { const result=discover(data,{...defaultFilters,search:'nothing-matches-xyz'},now);expect(result.stalls).toHaveLength(0);expect(result.markets).toHaveLength(0) })
})
describe('dietary and expiry cannot be bypassed', () => {
  const certified = data.stalls.find(s=>s.id==='manis-bulan')!
  it('rejects certificates at the expiry instant', () => expect(dietaryStatus(certified,new Date('2027-10-01T00:00:00Z'))).toBe('expired'))
  it.each(['evidence','reviewedAt','expiresAt'] as const)('requires %s', field => {
    const stall={...certified,claims:certified.claims.map(c=>({...c,[field]:field==='evidence' ? false : null}))}
    expect(dietaryStatus(stall,now)).toBe('expired')
  })
  it('one certified menu item cannot certify a whole stall', () => expect(dietaryStatus({...certified,claims:certified.claims.map(c=>({...c,foodItemId:'single-dish'}))},now)).toBe('expired'))
  it('does not treat a future review timestamp as completed certification', () => expect(dietaryStatus({...certified,claims:certified.claims.map(c=>({...c,reviewedAt:'2027-01-01T00:00:00Z'}))},now)).toBe('expired'))
  it('item and stall conflicts exclude both certified and declared filters', () => expect(dietaryStatus(data.stalls.find(s=>s.id==='wok-bulan')!,now)).toBe('conflict'))
  it('rejects expired and malformed offer times even if an old event arrives', () => {
    expect(eligibleOffers({...data,offers:data.offers.map(o=>({...o,endsAt:now.toISOString()}))},now)).toHaveLength(0)
    expect(eligibleOffers({...data,offers:data.offers.map(o=>({...o,endsAt:'21:00'}))},now)).toHaveLength(0)
  })
})
describe('location and monotonic public invalidation', () => {
  it('coarsens the query origin to approximately 1 km rather than forwarding exact GPS', () => expect(coarsePoint({latitude:3.1071234,longitude:101.6065432})).toEqual({latitude:3.11,longitude:101.61}))
  it('denied geolocation rejects without requiring a location', async () => {
    const geo={getCurrentPosition:(_success:unknown,failure:(error:unknown)=>void)=>failure({code:1})} as unknown as Geolocation
    await expect(requestDeviceLocation(geo)).rejects.toThrow('Location denied')
    expect(discover(data,defaultFilters,now).total).toBe(8)
  })
  it('drops duplicate/out-of-order events and keeps markets independent', () => {
    const seen=new Map<string,number>()
    expect(acceptVersion(seen,'a',12)).toBe(true)
    expect(acceptVersion(seen,'a',11)).toBe(false)
    expect(acceptVersion(seen,'a',12)).toBe(false)
    expect(acceptVersion(seen,'b',1)).toBe(true)
    expect(acceptVersion(seen,'a',NaN)).toBe(false)
  })
})
