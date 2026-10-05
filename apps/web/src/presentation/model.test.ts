import { describe,expect,it } from 'vitest'
import catalog from '../../../../contracts/demo-catalog.json'
import assets from './assets.json'
import { seededWorkspace } from './seed'
import { pilotTotals } from './model'
import { commerceFixture } from '../commerce/fixture'
import { tick } from '../freshness/engine'
import { available } from '../commerce/model'
const now=new Date(catalog.anchor)
describe('Full Phase 11 fixture invariants',()=>{
 it('seeds unique linked inventory and 12 deterministic eligible offers',()=>{const w=seededWorkspace(now);expect(w.stalls).toHaveLength(30);expect(w.foods).toHaveLength(90);expect(w.batches).toHaveLength(150);expect(new Set(w.batches.map(b=>`${b.food_item_id}:${b.batch_number}`)).size).toBe(150);expect(w.freshness?.promotions).toHaveLength(12);for(const p of w.freshness!.promotions){const b=w.batches.find(b=>b.id===p.batch)!;expect(Date.parse(p.ends)).toBeLessThanOrEqual(Date.parse(b.advisory_deadline!)-900000);expect(p.units).toBeLessThanOrEqual(b.remaining_quantity!)}expect(seededWorkspace(now)).toEqual(w)})
 it('keeps reservations within stock and offer caps; expires them before reuse',()=>{const w=seededWorkspace(now);w.commerce=commerceFixture(now,w);const active=w.commerce.orders.filter(o=>['reserved','accepted'].includes(o.status));expect(active).toHaveLength(8);for(const p of w.freshness!.promotions){const holds=active.filter(o=>o.offer===p.id).reduce((n,o)=>n+o.units,0);expect(holds).toBeLessThanOrEqual(p.units);expect(available(w,p.batch)).toBeGreaterThanOrEqual(0)}expect(w.commerce.orders).toHaveLength(24);expect(w.commerce.campaigns).toHaveLength(8);expect(w.commerce.orders.filter(o=>o.refunded>0)).toHaveLength(6)})
 it('does not reopen expired food when synthetic clocks advance',()=>{const w=seededWorkspace(now),later=new Date(now.getTime()+61*60000),s=tick(w,w.freshness!,later);expect(s.state.promotions.every(p=>p.state==='ended')).toBe(true);expect(s.workspace.batches.filter(b=>b.status==='active')).toHaveLength(0)})
 it('uses 39 weekly stall-nights and excludes absence from every numerator',()=>{expect(catalog.pilot).toHaveLength(40);expect(new Set(catalog.pilot.map(r=>r.market)).size).toBe(1);expect(new Set(catalog.pilot.map(r=>r.stall)).size).toBe(10);expect([1,2,3,4].reduce((v,n)=>v+pilotTotals(n).sessions,0)).toBe(39);const week=pilotTotals(2);expect(week.sessions).toBe(9);expect(week.perNight).toBe(week.net/9);expect(week.net).toBe(week.gross-week.refunds-week.commission-week.incremental);expect(pilotTotals(1).humanKg).toBe(0);expect(week.humanKg).not.toBe(week.humanKg+week.compostKg+week.bsfKg)})
 it('reserves 100 separate mapped image slots without claiming supplied files',()=>{expect(assets).toHaveLength(100);expect(new Set(assets.map(a=>a.id)).size).toBe(100);expect(new Set(assets.map(a=>a.originalFilename)).size).toBe(100);expect(assets.every(a=>a.status==='awaiting-user-image'&&a.method==='described-placeholder'&&a.alt&&a.prompt)).toBe(true)})
})
