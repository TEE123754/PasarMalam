import { sponsorSlots, type Campaign } from './model'
import { discover, distanceKm, eligibleOffers, type Filters } from '../discovery/engine'
import type { DiscoverySnapshot } from '../data/types'
export function placements(data:DiscoverySnapshot,filters:Filters,now:Date,placement:Campaign['placement'],all:Campaign[]) {
 const campaigns=all.filter(c=>c.placement===placement)
 const eligible=discover(data,filters,now,0,10000).stalls.filter(s=>eligibleOffers(data,now).some(o=>o.stallId===s.id)&&data.batches.some(b=>data.menu.some(f=>f.id===b.foodItemId&&f.stallId===s.id)&&b.remaining>0&&Date.parse(b.deadline)>now.getTime()))
 return sponsorSlots(campaigns.map(c=>({...c,placement:'sponsored'})),eligible,now).filter(c=>{const market=data.markets.find(m=>m.id===c.market);return filters.origin?!!market&&market.latitude!==null&&market.longitude!==null&&distanceKm(filters.origin,{latitude:market.latitude,longitude:market.longitude})<=c.radius:filters.market===c.market}).map(c=>({...c,placement}))
}
export const sponsored=(data:DiscoverySnapshot,filters:Filters,now:Date,all:Campaign[]=[])=>placements(data,filters,now,'sponsored',all)
