import { describe, expect, it } from 'vitest'
import { fallback, number, redact, canConfirm, draftSchema } from './model'
import { evaluate, distance } from './evaluation'
import corpus from '../../../../contracts/voice-evaluation.json'
const now=new Date('2026-10-01T12:00:00Z'),menu=[{name:'Chicken satay'}]
const sentence='Satay ayam dua puluh batang RM 6.00, bahan ayam, kacang. Siap pukul 6 petang.'
describe('untrusted multilingual listing drafts',()=>{
 it.each([['dua puluh',20],['dua belas',12],['ten',10],['sebelas',11],['twenty four',24],['dua puluh lima belas',null],['-2',null]])('parses %s without guessing',(text,n)=>expect(number(text as string)).toBe(n))
 it('extracts BM forms as a labelled fallback with immutable time context',()=>{const r=fallback(sentence,menu,now);expect(r.source).toBe('quick-entry');expect(r.draft.quantity).toBe(20);expect(r.draft.price_sen).toBe(600);expect(r.draft.cook_time).toBe('2026-10-01T18:00:00+08:00');expect(r.draft.confidence).toBeLessThan(1);expect(r.draft.ingredients).toEqual(['ayam','kacang'])})
 it('requires explicit final confirmation',()=>{const d=fallback(sentence,menu,now).draft;expect(canConfirm(d,now,false,1)).toBe(false);expect(canConfirm(d,now,true,1)).toBe(true);expect(canConfirm(d,now,true,2)).toBe(false)})
 it('preserves missing price, quantity and time as null',()=>{const d=fallback('Chicken satay',menu,now).draft;expect([d.quantity,d.price_sen,d.cook_time]).toEqual([null,null,null]);expect(canConfirm(d,now,true,1)).toBe(false)})
 it('blocks ambiguous AM/PM, conflicting quantity and future time',()=>{expect(fallback('Chicken satay at 6',menu,now).draft.cook_time).toBeNull();expect(fallback('Chicken satay 5 sticks 10 sticks',menu,now).draft.quantity).toBeNull();expect(fallback('Chicken satay at 11 pm',menu,now).draft.cook_time).toBeNull()})
 it('blocks instructions about safety windows',()=>expect(fallback('Chicken satay extend deadline',menu,now).draft.action).toBe('unsupported'))
 it('rejects extra fields including model-provided deadlines',()=>expect(draftSchema.safeParse({...fallback(sentence,menu,now).draft,deadline:'2099'}).success).toBe(false))
 it('does not enable fractional stock confirmation and supports menu-only fixes',()=>{const d=fallback(sentence,menu,now).draft;expect(canConfirm({...d,quantity:1.5},now,true,1)).toBe(false);expect(canConfirm({...d,action:'update_food',quantity:null,unit:null,cook_time:null},now,true,1)).toBe(true)})
 it('labels scripted samples honestly',()=>expect(fallback(sentence,menu,now,'scripted-example').source).toBe('scripted-example'))
 it('redacts email, phone and identity patterns before transmission',()=>{const r=redact('name@example.com 0123456789 901010-14-1234');expect(r).not.toContain('@');expect(r).not.toContain('0123456789');expect(r).not.toContain('901010')})
})
describe('measured evaluation only',()=>{
 it('computes WER edit distance including deletions',()=>expect(distance(['satay','ayam'],['satay'])).toBe(1))
 it('rejects scripted results and duplicate clip IDs',()=>{const value={device:'test',network:'offline',model:'synthetic-test',results:[{id:corpus.samples[0].id,recognized:'',draft:null,corrected:false,source:'scripted-example'}],timings:[]};expect(()=>evaluate(value)).toThrow();value.results[0].source='real-inference';value.results.push({...value.results[0]});expect(()=>evaluate(value)).toThrow('Duplicate')})
 it('returns no timing claim without complete pairs',()=>{const r=evaluate({device:'test',network:'offline',model:'test',results:[],timings:[{pair:'p',mode:'voice',seconds:10,order:'voice-first',cold:true}]});expect(r.timing.pairedCount).toBe(0);expect(r.timing.voiceMedian).toBeNull()})
 it('counts invalid JSON as incorrect instead of dropping it',()=>{const r=evaluate({device:'test',network:'offline',model:'test',results:[{id:corpus.samples[0].id,recognized:'satay',draft:{invalid:true},corrected:true,source:'real-inference'}],timings:[]});expect(r.groups.BM.clips).toBe(1);expect(r.groups.BM.jsonValidity).toBe(0);expect(r.groups.BM.criticalAccuracy).toBe(0)})
})
