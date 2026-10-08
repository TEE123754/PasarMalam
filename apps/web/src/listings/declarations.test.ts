import { describe, expect, it } from 'vitest'
import { applyCommand, stallInput, type VendorWorkspace } from '../vendor/model'
import { dietaryStatus } from '../discovery/engine'
import { discoverySchema } from '../data/schemas'
import { allergensSchema, declarationsSchema, unknownDeclarations } from './declarations'

const now = new Date('2026-10-08T12:00:00Z')
const stall = { id:'s', market_id:'m', name:'Fictional stall', category:'Rice', specialty:'Rice', price_sen:500, halal:'not-declared' as const, open:true, lot:'A1', opens:'17:00', closes:'22:00', latitude:3, longitude:101, photo:null }
const seed: VendorWorkspace = { stalls:[stall], foods:[{ id:'f', stall_id:'s', name:'Rice', ingredients:['rice'], price_sen:500, photo:null, allergens:{ status:'confirmed', contains:['peanuts'], cross_contact:'possible' }, allergens_recorded_at:now.toISOString() }], batches:[], events:[], requests:{} }
describe('explicit listing statements', () => {
  it('rejects inferred identity, invalid statements and overly long descriptions', () => {
    expect(declarationsSchema.safeParse({ ...unknownDeclarations, inferred_religion:'Muslim' }).success).toBe(false)
    expect(declarationsSchema.safeParse({ ...unknownDeclarations, pork_free:true }).success).toBe(false)
    expect(stallInput.safeParse({ ...stall, description:'x'.repeat(1001) }).success).toBe(false)
  })
  it('rejects unconfirmed, duplicate and unsupported allergen claims', () => {
    for (const value of [{status:'unknown',contains:['milk'],cross_contact:'unknown'}, {status:'confirmed',contains:['milk','milk'],cross_contact:'possible'}, {status:'confirmed',contains:['allergen-free'],cross_contact:'unknown'}]) expect(allergensSchema.safeParse(value).success).toBe(false)
  })
  it('clears confirmation on changed ingredients from an old or voice client', () => {
    const data = { ...seed.foods[0], ingredients:['rice','milk'] }; delete data.allergens; delete data.allergens_recorded_at
    const result = applyCommand(seed, {kind:'food',data}, 'r', now, 'f').workspace.foods[0]
    expect(result.allergens?.status).toBe('unknown'); expect(result.allergens_recorded_at).toBeNull()
    expect(seed.foods[0].allergens?.status).toBe('confirmed')
  })
  it('preserves declarations for old clients and sets the confirmation clock itself', () => {
    const saved = applyCommand(seed, {kind:'stall',data:{...stall,description:'Small batches',declarations:{...unknownDeclarations,pork_free:'yes'},declarations_recorded_at:'2000-01-01T00:00:00Z'}}, 'r', now, 's').workspace
    const updated = applyCommand(saved, {kind:'stall',data:{...stall,specialty:'Noodles'}}, 'r2', now, 's').workspace
    expect(updated.stalls[0].description).toBe('Small batches'); expect(updated.stalls[0].declarations?.pork_free).toBe('yes'); expect(updated.stalls[0].declarations_recorded_at).toBe(now.toISOString())
  })
  it('keeps a repeated confirmation idempotent without changing the clock', () => {
    const command = {kind:'food' as const,data:{...seed.foods[0],ingredients:['rice','milk'],allergens:{status:'confirmed' as const,contains:['milk' as const],cross_contact:'unknown' as const}}}
    const first = applyCommand(seed, command, 'r', now, 'f')
    const retry = applyCommand(first.workspace, command, 'r', new Date(now.getTime()+60000), 'f')
    expect(retry.workspace.foods[0]).toEqual(first.workspace.foods[0])
  })
  it('never upgrades business statements to a halal certificate', () => {
    const data = discoverySchema.parse({ markets:[], stalls:[{id:'s',marketId:'m',name:'Fictional',category:'Rice',specialty:'Rice',priceSen:500,rating:0,reviews:0,image:'',halal:'not-declared',open:true,declarations:{pork_free:'yes',alcohol_free:'yes',muslim_owned:'yes'}}],offers:[],updatedAt:now.toISOString() })
    expect(dietaryStatus(data.stalls[0],now)).toBe('not-declared')
  })
})
