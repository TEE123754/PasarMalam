import { describe, expect, it } from 'vitest'
import sample from '../../../../contracts/discovery-fixture.json'
import { discoverySchema } from '../data/schemas'
import { applyCommand, type VendorWorkspace } from '../vendor/model'
import { categoryId, plantStatus, availabilityState, destination } from './classifications'
import { cp2Market, cp2Workspace } from './cp2-fixture'
import { defaultFilters, discover, scheduleStatus } from './engine'
import { sponsored } from '../commerce/placements'
import type { Campaign } from '../commerce/model'
const now=new Date('2026-10-08T11:45:00+08:00')
const base=discoverySchema.parse(sample),stall={...base.stalls[0],id:'s',marketId:cp2Market.id,category:'Fresh produce',categoryId:'produce' as const}
const menu=[{...base.menu[0],id:'cheap',stallId:'s',categoryId:'produce' as const,priceSen:400,plantDiet:{vegetarian:'no' as const,vegan:'no' as const}},{...base.menu[0],id:'vegan',stallId:'s',categoryId:'produce' as const,priceSen:1000,plantDiet:{vegetarian:'yes' as const,vegan:'yes' as const}}]
const data={...base,markets:[cp2Market],stalls:[stall],menu,offers:[{...base.offers[0],stallId:'s',priceSen:0,endsAt:'2026-10-08T12:30:00+08:00'}]}
describe('CP2 combined discovery',()=>{
 it('keeps market kind independent of day/night and old general defaults',()=>{
  expect(discover(data,{...defaultFilters,marketKind:'farmers',type:'day'},now).total).toBe(1)
  expect(discover(data,{...defaultFilters,marketKind:'farmers',type:'night'},now).total).toBe(0)
  expect(discover(base,{...defaultFilters,marketKind:'general'},now).total).toBe(base.stalls.length)
 })
 it('matches diet, category and budget on one menu item, ignoring discounted bundles',()=>{
  const filters={...defaultFilters,category:'produce',plantDiet:'vegan',maxPriceSen:500}
  expect(discover(data,filters,now).total).toBe(0)
  const result=discover(data,{...filters,maxPriceSen:1000,origin:{latitude:3.12,longitude:101.61},radius:1},now)
  expect(result.stalls.map(s=>s.id)).toEqual(['s'])
  expect(result.markets.map(m=>m.id)).toEqual([cp2Market.id])
 })
 it.each([0,399,400,1000])('uses inclusive unit price %s',price=>expect(discover(data,{...defaultFilters,maxPriceSen:price},now).total).toBe(price>=400?1:0))
 it.each([-1,NaN,Infinity,1.5])('rejects invalid price %s',price=>expect(discover(data,{...defaultFilters,maxPriceSen:price},now).total).toBe(0))
 it('includes vegan under vegetarian, excluding unknown/conflicting declarations',()=>{
  expect(discover(data,{...defaultFilters,plantDiet:'vegetarian'},now).total).toBe(1)
  const conflicting={...data,menu:data.menu.map(f=>({...f,plantDiet:{vegetarian:'no' as const,vegan:'yes' as const}}))}
  expect(discover(conflicting,{...defaultFilters,plantDiet:'vegan'},now).total).toBe(0)
  expect(plantStatus()).toBe('unknown');expect(plantStatus({vegetarian:'no',vegan:'yes'})).toBe('conflict')
 })
 it('preserves legacy category aliases and excludes missing menu under budget',()=>{
  expect(categoryId('Skewers')).toBe('skewers');expect(categoryId('Bread')).toBe('kuih');expect(categoryId('Rice and noodles')).toBe('rice')
  expect(discover({...data,menu:[]},{...defaultFilters,maxPriceSen:1000},now).total).toBe(0)
 })
 it('sponsored placements cannot bypass combined menu filters',()=>{
  const campaign={id:'ad',owner:'o',stall:'s',market:cp2Market.id,category:stall.category,radius:1,start:'2026-10-08T07:00:00+08:00',end:'2026-10-08T12:30:00+08:00',budget:100,spent:0,status:'approved',placement:'sponsored',description:'Fictional',approved:true,impressions:0,clicks:0} as Campaign
  const active={...data,batches:[{...base.batches[0],foodItemId:'vegan',remaining:10,deadline:'2026-10-08T12:30:00+08:00'}]}
  const filters={...defaultFilters,market:cp2Market.id,category:'produce',plantDiet:'vegan',maxPriceSen:500}
  expect(sponsored(active,filters,now,[campaign])).toHaveLength(0)
  expect(sponsored(active,{...filters,maxPriceSen:1000},now,[campaign])).toHaveLength(1)
 })
})
describe('CP2 timing and destination contracts',()=>{
 it('marks exact final 30 minutes, close exclusive, cancellation and overlapping sessions',()=>{
  expect(scheduleStatus(cp2Market,new Date('2026-10-08T11:29:59+08:00'))).toBe('open')
  expect(scheduleStatus(cp2Market,new Date('2026-10-08T11:30:00+08:00'))).toBe('closing-soon')
  expect(scheduleStatus(cp2Market,new Date('2026-10-08T12:00:00+08:00'))).toBe('closed')
  expect(scheduleStatus({...cp2Market,exceptions:[{date:'2026-10-08',cancelled:true,opens:null,closes:null}]},now)).toBe('closed')
  expect(scheduleStatus({...cp2Market,schedules:[...cp2Market.schedules,{weekday:4,opens:'11:00',closes:'14:00',nextDay:false}]},now)).toBe('open')
 })
 it('uses a configurable independent age and treats future/missing clocks as unknown',()=>{
  expect(availabilityState('2026-10-08T11:15:00+08:00',now)).toBe('stale')
  expect(availabilityState('2026-10-08T11:15:01+08:00',now)).toBe('recent')
  expect(availabilityState('2026-10-08T11:15:00+08:00',now,60)).toBe('recent')
  expect(availabilityState(now.toISOString(),now)).toBe('recent');expect(availabilityState(null,now)).toBe('unknown')
  expect(availabilityState('2026-10-08T12:00:00+08:00',now)).toBe('unknown')
 })
 it('validates missing, non-finite and out-of-range destinations, preserving zero',()=>{
  expect(destination(0,0)).toBe('0.00000,0.00000');expect(destination(null,100)).toBeNull()
  expect(destination(91,100)).toBeNull();expect(destination(1,181)).toBeNull();expect(destination(NaN,100)).toBeNull()
 })
 it('upgrades old fixture once without replacing edits',()=>{
  const w=cp2Workspace({stalls:[],foods:[],batches:[],events:[],requests:{}})
  w.stalls[0].name='Edited';expect(cp2Workspace(w).stalls).toHaveLength(1);expect(w.stalls[0].name).toBe('Edited')
 })
 it('confirmation retries keep timestamps; ordinary edits and ingredient changes do not reconfirm',()=>{
  let w:VendorWorkspace=cp2Workspace({stalls:[],foods:[],batches:[],events:[],requests:{}})
  const command={kind:'stall' as const,data:{...w.stalls[0],confirm_availability:true}}
  w=applyCommand(w,command,'confirm',now,'unused').workspace
  const at=w.stalls[0].availability_confirmed_at
  w=applyCommand(w,command,'confirm',new Date(now.getTime()+60000),'unused').workspace
  expect(w.stalls[0].availability_confirmed_at).toBe(at)
  w=applyCommand(w,{kind:'stall',data:{...w.stalls[0],description:'Edited'}},'edit',new Date(now.getTime()+60000),'unused').workspace
  expect(w.stalls[0].availability_confirmed_at).toBe(at)
  const food={...w.foods[0],ingredients:['Different ingredient']};delete food.plant_diet
  w=applyCommand(w,{kind:'food',data:food},'food',now,'unused').workspace
  expect(w.foods[0].plant_diet).toEqual({vegetarian:'unknown',vegan:'unknown'})
 })
})
