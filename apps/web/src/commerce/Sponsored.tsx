import { NavLink } from 'react-router'
import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { ImagePlaceholder } from '../components/ImagePlaceholder'
import { readWorld } from './gateway'
import { sponsorSlots, type Campaign } from './model'
import { discover, distanceKm, eligibleOffers, type Filters } from '../discovery/engine'
import type { DiscoverySnapshot } from '../data/types'
function placements(data:DiscoverySnapshot,filters:Filters,now:Date,placement:Campaign['placement'],all:Campaign[]) {
 const campaigns=all.filter(c=>c.placement===placement)
 const eligible=discover(data,filters,now,0,10000).stalls.filter(s=>eligibleOffers(data,now).some(o=>o.stallId===s.id)&&data.batches.some(b=>data.menu.some(f=>f.id===b.foodItemId&&f.stallId===s.id)&&b.remaining>0&&Date.parse(b.deadline)>now.getTime()))
 return sponsorSlots(campaigns.map(c=>({...c,placement:'sponsored'})),eligible,now).filter(c=>{const market=data.markets.find(m=>m.id===c.market);return filters.origin?!!market&&market.latitude!==null&&market.longitude!==null&&distanceKm(filters.origin,{latitude:market.latitude,longitude:market.longitude})<=c.radius:filters.market===c.market}).map(c=>({...c,placement}))
}
export const sponsored=(data:DiscoverySnapshot,filters:Filters,now:Date,all=readWorld().commerce?.campaigns??[])=>placements(data,filters,now,'sponsored',all)
export function Sponsored({data,filters,now,campaigns}:{data:DiscoverySnapshot;filters:Filters;now:Date;campaigns?:Campaign[]}) {
 const [,refresh]=useState(0)
 useEffect(()=>{const timer=setInterval(()=>refresh(n=>n+1),3000);return()=>clearInterval(timer)},[])
 const all=campaigns??readWorld().commerce?.campaigns??[],slots=sponsored(data,filters,now,all),banners=placements(data,filters,now,'banner',all).slice(0,1),native=placements(data,filters,now,'native',all).slice(0,1),interstitial=placements(data,filters,now,'interstitial',all).slice(0,1)
 const content=(c:Campaign)=><><strong>DEMO sponsored · {c.placement}</strong><ImagePlaceholder description={c.description}/><NavLink className="button secondary" to={`/stalls/${c.stall}`}>DEMO advertisement · {data.stalls.find(s=>s.id===c.stall)?.name}</NavLink></>
 return <>{slots.length>0&&<section className="panel setting-card" aria-label="DEMO sponsored results"><h2>DEMO sponsored · maximum 2 slots</h2><p>Paid placements match your current filters and active clearance availability. Organic ordering is preserved.</p>{slots.map(c=><NavLink className="button secondary" key={c.id} to={`/stalls/${c.stall}`}>DEMO sponsored · {data.stalls.find(s=>s.id===c.stall)?.name}</NavLink>)}</section>}{[...banners,...native].map(c=><aside className="panel setting-card" key={c.id} aria-label={`DEMO ${c.placement} advertisement`}>{content(c)}</aside>)}{interstitial.map(c=><Dialog.Root key={c.id}><Dialog.Trigger className="button secondary">Optional DEMO advertisement preview</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Title>DEMO advertisement</Dialog.Title><Dialog.Description>Optional fictional advertisement. Close anytime; browsing and reservations are never blocked.</Dialog.Description>{content(c)}<Dialog.Close className="button secondary">Close advertisement</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>)}</>
}
