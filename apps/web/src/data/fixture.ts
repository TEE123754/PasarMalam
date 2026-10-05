import { available } from '../commerce/model'
import { freshness } from '../freshness/gateway'
import catalog from '../../../../contracts/demo-catalog.json'
const sample=catalog.discovery
import { discoverySchema } from './schemas'
import { fixtureClock } from '../app/clock'
import type { DataGateway, ScenarioAdapter, ScenarioResult } from './types'
import { readCommunity } from '../community/gateway'
import { publicCommunity } from '../community/model'

export const fixtureGateway: DataGateway = {
  mode: 'fixture',
  async getPublicConfig() {
    return { api_version: 'v1', supported_locales: ['en', 'ms'], business_integration_mode: 'simulated', capabilities: ['fixture-discovery'] }
  },
  async getDiscovery() {
    const key = `pasarmalam:fixture-anchor:${fixtureClock.scenario() ?? 'current'}`
    let anchor = sessionStorage.getItem(key)
    if (!anchor || !Number.isFinite(Date.parse(anchor))) { anchor = fixtureClock.now().toISOString(); sessionStorage.setItem(key,anchor) }
    const visits: Record<string,number> = {}
    const cutoff = new Date(Date.now()-29*86400000).toISOString().slice(0,10)
    for (const storageKey of Object.keys(localStorage)) {
      if (!storageKey.startsWith('pasarmalam:fixture-check-ins:') || storageKey.split(':').at(-1)! < cutoff) continue
      try { const ids:unknown = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(ids)) for (const id of new Set(ids)) if (typeof id === 'string') visits[id]=(visits[id] ?? 0)+1 } catch { /* Ignore malformed sample state. */ }
    }
    const fresh=await freshness('fixture')
    const community=readCommunity(),visible=publicCommunity(community,fixtureClock.now())
    const vendor=fresh.workspace
    const ownedIds=new Set(vendor.stalls.map(s=>s.id))
    const active=vendor.batches.filter(b=>b.status==='active'&&b.advisory_deadline&&Date.parse(b.advisory_deadline)>fixtureClock.now().getTime()&&b.remaining_quantity!==null&&available(vendor,b.id)>0)
    const parsed=discoverySchema.parse({ ...sample,
      markets:sample.markets.map(m => ({...m,popularity:m.popularity+(visits[m.id] ?? 0)})),
      stalls:[...sample.stalls.filter(s=>!ownedIds.has(s.id)),...vendor.stalls.map(s=>({...sample.stalls.find(x=>x.id===s.id),id:s.id,marketId:s.market_id,name:s.name,category:s.category,specialty:s.specialty,priceSen:s.price_sen,halal:s.halal,open:s.open,rating:sample.stalls.find(x=>x.id===s.id)?.rating??0,reviews:sample.stalls.find(x=>x.id===s.id)?.reviews??0,image:'🍴',photoUrl:s.photo,lot:s.lot,opens:s.opens,closes:s.closes,latitude:s.latitude,longitude:s.longitude}))],
      offers:[...fresh.state.promotions.filter(p=>p.state==='active'&&Date.parse(p.ends)>fixtureClock.now().getTime()).map(p=>({id:p.id,stallId:p.stall,title:p.title,priceSen:p.price,originalPriceSen:p.original,endsAt:p.ends})),...sample.offers.filter(o=>!ownedIds.has(o.stallId))].filter(o=>!ownedIds.has(o.stallId)||active.some(b=>vendor.foods.some(f=>f.id===b.food_item_id&&f.stall_id===o.stallId))),
      menu:[...sample.menu.filter(f=>!ownedIds.has(f.stallId)),...vendor.foods.map(f=>({id:f.id,stallId:f.stall_id,name:f.name,priceSen:f.price_sen,ingredients:f.ingredients,photoUrl:f.photo}))],
      batches:active.map(b=>({id:b.id,foodItemId:b.food_item_id,batchNumber:b.batch_number,preparedAt:b.prepared_at,uploadedAt:b.uploaded_at,remaining:available(vendor,b.id),deadline:b.advisory_deadline,photoUrl:b.photo,correctedPreparedAt:b.corrected_prepared_at})),
      publicReviews:visible.reviews.map(r=>({id:r.id,stallId:r.stall,rating:r.rating,body:r.body})),
      server_now:fixtureClock.now().toISOString(), updatedAt: new Date().toISOString() })
    return {...parsed,stalls:parsed.stalls.filter(s=>community.operations.stalls[s.id]!==false).map(s=>{const reviews=visible.reviews.filter(r=>r.stall===s.id);return {...s,reviews:reviews.length,rating:reviews.length?reviews.reduce((a,r)=>a+r.rating,0)/reviews.length:0}}),markets:parsed.markets.map(m=>({...m,schedules:community.operations.schedules.filter(r=>r.market_id===m.id).map(r=>({weekday:r.weekday,opens:r.opens_at,closes:r.closes_at,nextDay:r.closes_next_day}))}))}
  },
}

export const fixtureScenarioAdapter: ScenarioAdapter = {
  mode: 'simulated',
  async run(scenario: string, outcome: ScenarioResult) {
    return { reference: `DEMO-${scenario.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-001`, outcome }
  },
}
