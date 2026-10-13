import { describe,it,expect } from 'vitest'
import { chooseDish,conflicts,fixturePhoto,prototypePlan,type PlanningReport } from './model'
describe('CP8 human review boundary',()=>{
 it('flags conflicting dish without preferring a source',()=>{expect(conflicts({dish:'Nasi lemak'},fixturePhoto)).toEqual(['dish']);expect(conflicts({dish:' chicken SATAY '},fixturePhoto)).toEqual([])})
 it('requires explicit confirmation',()=>{expect(()=>chooseDish({dish:'Nasi lemak'},fixturePhoto,'photo',false)).toThrow('Human confirmation')})
 it('keeps human source choice and never adds a safety field',()=>{expect(chooseDish({dish:'Nasi lemak'},fixturePhoto,'speech',true)).toEqual({dish:'Nasi lemak',source:'speech',confirmed:true});expect(chooseDish({dish:null},fixturePhoto,'photo',true).dish).toBe('Chicken satay')})
 it('unknown source needs manual input',()=>{expect(()=>chooseDish({dish:null},{...fixturePhoto,dish:null},'photo',true)).toThrow('manually')})
})


describe('fictional planned-quantity exploration',()=>{
 const report={quantity:30,likely_unsold:0,source:'synthetic',recommendation:'sample',benchmark:{holdout:8}} as PlanningReport
 it('changes leftovers without rewriting a prediction or frozen benchmark',()=>{const next=prototypePlan(report,50);expect(next.likely_unsold).toBe(20);expect(next.quantity).toBe(30);expect(next.benchmark).toEqual(report.benchmark);expect(report.likely_unsold).toBe(0);expect(next.source).toContain('FICTIONAL')})
 it('does not invent leftovers when plan or prediction is unknown',()=>{expect(prototypePlan(report,null).likely_unsold).toBeNull();expect(prototypePlan({...report,quantity:null},50).likely_unsold).toBeNull();expect(prototypePlan(report,10).likely_unsold).toBe(0)})
 it('rejects fractional, negative, nonfinite and excessive plans',()=>{for(const value of [1.5,-1,NaN,Infinity,100001])expect(()=>prototypePlan(report,value)).toThrow('whole')})
})
