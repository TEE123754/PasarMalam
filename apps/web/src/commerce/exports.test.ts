import { describe, it, expect } from 'vitest'
import { csv, receiptHTML } from './exports'
import { commerceFixture } from './fixture'
import { actors, council, project, sweep } from './model'
const now=new Date('2026-10-01T12:30:00Z')
describe('fictional commerce fixtures and exports',()=>{
 it('safely escapes CSV quotes and formula-like values',()=>{expect(csv([['plain','"quoted"','=SUM(A1)',' +cmd']])).toBe('"plain","""quoted""","\'=SUM(A1)","\' +cmd"')})
 it('watermarks HTML and escapes untrusted identifiers',()=>{const o=commerceFixture(now).orders[0];const html=receiptHTML({...o,id:'<script>alert(1)</script>'});expect(html).toContain('FICTIONAL — NOT PROOF OF PAYMENT');expect(html).not.toContain('<script>');expect(html).toContain('&lt;script&gt;');expect(html).toContain('DEMO-ARCHIVED-BATCH')})
 it('seeds distinct campaign outcomes without active stock holds',()=>{const s=commerceFixture(now);expect(new Set(s.campaigns.map(c=>c.status))).toEqual(new Set(['approved','pending','rejected','paused']));expect(s.orders.every(o=>!['reserved','accepted','ready'].includes(o.status)&&o.batch.startsWith('DEMO-ARCHIVED'))).toBe(true)})
 it('shows only assigned council aggregates with small-group suppression elsewhere',()=>{const w={stalls:[],foods:[],batches:[],events:[],requests:{},commerce:commerceFixture(now)};expect(council(w,actors[7])[0].kg).toBe(.9);expect(council(w,actors[8])[0].collected).toBeNull();expect(project(w,actors[0]).orders).toHaveLength(12);expect(project(w,actors[0]).orders.every(o=>o.owner===actors[0].id)).toBe(true);expect(sweep(w,now).commerce!.orders).toHaveLength(24)})
})
