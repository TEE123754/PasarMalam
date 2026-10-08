import { NavLink } from 'react-router'
import * as Dialog from '@radix-ui/react-dialog'
import { readWorld } from './gateway'
import { type Campaign } from './model'
import { type Filters } from '../discovery/engine'
import { placements } from './placements'
import { DemoImage } from '../components/DemoImage'
import { foodImage } from '../components/demo-images'
import type { DiscoverySnapshot } from '../data/types'
export const sponsored=(data:DiscoverySnapshot,filters:Filters,now:Date,all=readWorld().commerce?.campaigns??[])=>placements(data,filters,now,'sponsored',all)
export function Sponsored({data,filters,now,campaigns}:{data:DiscoverySnapshot;filters:Filters;now:Date;campaigns?:Campaign[]}) {
  const all=campaigns??readWorld().commerce?.campaigns??[], slots=sponsored(data,filters,now,all)
  const banners=placements(data,filters,now,'banner',all).slice(0,1), native=placements(data,filters,now,'native',all).slice(0,1), interstitial=placements(data,filters,now,'interstitial',all).slice(0,1)
  const content=(c:Campaign)=>{const stall=data.stalls.find(s=>s.id===c.stall);return <aside className="panel sponsored-row" key={c.id} aria-label="Sponsored advertisement"><DemoImage image={foodImage(stall?.specialty??'')} description={c.description}/><div><span className="eyebrow">Sponsored · {c.placement}</span><h3>{stall?.name}</h3><span className="small muted">{c.description}</span></div><NavLink className="button secondary" to={`/stalls/${c.stall}`}>View stall</NavLink></aside>}
  return <>{slots.length>0&&<section aria-label="Sponsored results">{slots.slice(0,2).map(content)}</section>}{[...banners,...native].map(content)}{interstitial.map(c=><Dialog.Root key={c.id}><Dialog.Trigger className="button secondary">View sponsor offer</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="dialog-overlay"/><Dialog.Content className="dialog-content"><Dialog.Title>Sponsored offer</Dialog.Title><Dialog.Description>From a market sponsor. You can close this offer at any time.</Dialog.Description>{content(c)}<Dialog.Close className="button secondary">Close offer</Dialog.Close></Dialog.Content></Dialog.Portal></Dialog.Root>)}</>
}