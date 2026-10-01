import { workspace } from '../vendor/gateway'
import sample from '../../../../contracts/discovery-fixture.json'
import { discoverySchema } from './schemas'
import { fixtureClock } from '../app/clock'
import type { DataGateway, ScenarioAdapter, ScenarioResult } from './types'

export const fixtureGateway: DataGateway = {
  mode: 'fixture',
  async getPublicConfig() {
    return { api_version: 'v1', supported_locales: ['en', 'ms'], business_integration_mode: 'simulated', capabilities: ['fixture-discovery'] }
  },
  async getDiscovery() {
    const key = `pasarmalam:fixture-anchor:${fixtureClock.scenario() ?? 'current'}`
    let anchor = sessionStorage.getItem(key)
    if (!anchor || !Number.isFinite(Date.parse(anchor))) { anchor = fixtureClock.now().toISOString(); sessionStorage.setItem(key,anchor) }
    const time = Date.parse(anchor)
    const deadline = new Date(time+3600000).toISOString()
    const visits: Record<string,number> = {}
    const cutoff = new Date(Date.now()-29*86400000).toISOString().slice(0,10)
    for (const storageKey of Object.keys(localStorage)) {
      if (!storageKey.startsWith('pasarmalam:fixture-check-ins:') || storageKey.split(':').at(-1)! < cutoff) continue
      try { const ids:unknown = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(ids)) for (const id of new Set(ids)) if (typeof id === 'string') visits[id]=(visits[id] ?? 0)+1 } catch { /* Ignore malformed sample state. */ }
    }
    const vendor=await workspace('fixture')
    const ownedIds=new Set(vendor.stalls.map(s=>s.id))
    const active=vendor.batches.filter(b=>b.status==='active'&&b.advisory_deadline&&Date.parse(b.advisory_deadline)>fixtureClock.now().getTime()&&b.remaining_quantity!==null&&b.remaining_quantity>0)
    return discoverySchema.parse({ ...sample,
      markets:sample.markets.map(m => ({...m,popularity:m.popularity+(visits[m.id] ?? 0)})),
      stalls:[...sample.stalls.filter(s=>!ownedIds.has(s.id)),...vendor.stalls.map(s=>({...sample.stalls.find(x=>x.id===s.id),id:s.id,marketId:s.market_id,name:s.name,category:s.category,specialty:s.specialty,priceSen:s.price_sen,halal:s.halal,open:s.open,rating:sample.stalls.find(x=>x.id===s.id)?.rating??0,reviews:sample.stalls.find(x=>x.id===s.id)?.reviews??0,image:'🍴',photoUrl:s.photo,lot:s.lot,opens:s.opens,closes:s.closes,latitude:s.latitude,longitude:s.longitude}))],
      offers:sample.offers.filter(o=>!ownedIds.has(o.stallId)||active.some(b=>vendor.foods.some(f=>f.id===b.food_item_id&&f.stall_id===o.stallId))).map(offer=>({...offer,endsAt:deadline})),
      menu:[...sample.menu.filter(f=>!ownedIds.has(f.stallId)),...vendor.foods.map(f=>({id:f.id,stallId:f.stall_id,name:f.name,priceSen:f.price_sen,ingredients:f.ingredients,photoUrl:f.photo}))],
      batches:active.map(b=>({id:b.id,foodItemId:b.food_item_id,batchNumber:b.batch_number,preparedAt:b.prepared_at,uploadedAt:b.uploaded_at,remaining:b.remaining_quantity,deadline:b.advisory_deadline,photoUrl:b.photo,correctedPreparedAt:b.corrected_prepared_at})),
      updatedAt: new Date().toISOString() })
  },
}

export const fixtureScenarioAdapter: ScenarioAdapter = {
  mode: 'simulated',
  async run(scenario: string, outcome: ScenarioResult) {
    return { reference: `DEMO-${scenario.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-001`, outcome }
  },
}
