import { afterEach, describe, expect, it, vi } from 'vitest'
import { seededWorkspace } from './seed'
import { tick } from '../freshness/engine'
import { fixtureClock } from '../app/clock'
import { countdown } from '../discovery/batch-time'
import { applyCommunity, emptyCommunity, people, project, publicCommunity } from '../community/model'

const now = new Date('2026-10-09T20:30:00+08:00')
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals()})
describe('Complete market experience',()=>{
  it('populates every stall and menu with traceable declarations, locations and an active batch',()=>{
    const w=seededWorkspace(now)
    for(const s of w.stalls){expect(s.latitude).not.toBeNull();expect(s.longitude).not.toBeNull();expect(s.halal).not.toBe('not-declared');expect(Object.values(s.declarations!)).not.toContain('unknown');expect(s.declarations_recorded_at).toBeTruthy();expect(s.availability_confirmed_at).toBeTruthy();expect(s.name).not.toMatch(/DEMO|fictional/i)}
    for(const f of w.foods){expect(f.allergens?.status).toBe('confirmed');expect(f.ingredients.length).toBeGreaterThan(0);expect(f.plant_diet?.vegetarian).not.toBe('unknown');expect(w.batches.some(b=>b.food_item_id===f.id&&b.status==='active')).toBe(true)}
    expect(w.freshness?.promotions.length).toBeGreaterThan(0)
    for(const p of w.freshness!.promotions){const b=w.batches.find(b=>b.id===p.batch)!;expect(Date.parse(b.prepared_at)).toBeLessThan(now.getTime());expect(Date.parse(p.ends)).toBeLessThan(Date.parse(b.advisory_deadline!));expect(p.title).not.toMatch(/DEMO|fictional/i)}
  })
  it('advances the evening clock and countdown without extending the batch deadline',()=>{
    vi.useFakeTimers();vi.setSystemTime(now)
    const values=new Map<string,string>()
    vi.stubGlobal('sessionStorage',{getItem:(key:string)=>values.get(key)??null,setItem:(key:string,value:string)=>values.set(key,value),removeItem:(key:string)=>values.delete(key)})
    fixtureClock.setScenario(now.toISOString())
    const w=seededWorkspace(fixtureClock.now()), b=w.batches[0], deadline=b.advisory_deadline!
    const first=countdown(deadline,fixtureClock.now())
    vi.advanceTimersByTime(61000)
    expect(fixtureClock.now().getTime()).toBe(now.getTime()+61000)
    expect(countdown(deadline,fixtureClock.now())).not.toBe(first)
    const next=tick(w,w.freshness!,fixtureClock.now())
    expect(next.workspace.batches[0].advisory_deadline).toBe(deadline)
    vi.advanceTimersByTime(61*60000)
    const ended=tick(next.workspace,next.state,fixtureClock.now())
    expect(ended.state.promotions.every(p=>p.state==='ended')).toBe(true)
    expect(ended.workspace.batches.some(b=>b.status==='active')).toBe(false)
  })
  it('accepts a customer review and complaint while keeping reports private until reviewed',()=>{
    const person=people[0], markets={'bara-senja':'seri-pelita'}, s=emptyCommunity()
    s.operations.stalls['bara-senja']=true
    const review=applyCommunity(s,person,{kind:'review',stall:'bara-senja',rating:5,body:'Juicy satay, friendly service and clear preparation times.'},'review-request',now,'review-1',markets).state
    const report=applyCommunity(review,person,{kind:'report',stall:'bara-senja',category:'handling',incident:new Date(now.getTime()-300000).toISOString(),body:'The serving tray was left uncovered during service.',evidence:['description:uncovered serving tray']},'report-request',now,'report-1',markets).state
    expect(project(report,person,markets).reports).toHaveLength(1)
    expect(publicCommunity(report,now).flags).toHaveLength(0)
    expect(publicCommunity(report,now).reviews).toHaveLength(0)
    const moderator=people.find(p=>p.role==='admin')!
    const approved=applyCommunity(report,moderator,{kind:'review_status',target:'review-1',status:'published',reason:'Reviewed community feedback'},'publish-request',now,'approval',markets).state
    expect(publicCommunity(approved,now).reviews).toHaveLength(1)
    expect(JSON.stringify(publicCommunity(approved,now))).not.toContain('uncovered serving tray')
  })
})
