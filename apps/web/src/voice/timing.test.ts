import { beforeEach, afterEach, expect, it, vi } from 'vitest'
import { beginTiming, cancelTiming, finishTiming, markTimingHidden, pairedTimings, selectTask, type TimingTask } from './timing'
beforeEach(()=>{const data=new Map<string,string>();vi.stubGlobal('sessionStorage',{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v),removeItem:(k:string)=>data.delete(k)});vi.stubGlobal('window',{location:{pathname:'/demo/evaluation'}});cancelTiming()})
afterEach(()=>vi.unstubAllGlobals())
const task:TimingTask={pair:'test-only',clip:'bm-01',mode:'voice',order:'voice-first',device:'test',network:'test',consented:true}
it('includes corrections and saving, but rejects scripted/fallback voice duration',()=>{selectTask(task);beginTiming(task,1000,1);expect(finishTiming(false,8000,1)?.valid).toBe(false);expect(pairedTimings()).toEqual([])})
it('invalidates hidden pages and reset clocks',()=>{selectTask(task);beginTiming(task,1000,1);markTimingHidden();expect(finishTiming(true,8000,1)?.valid).toBe(false);beginTiming(task,1000,1);expect(finishTiming(true,8000,2)?.valid).toBe(false)})
it('requires consent and counterbalanced ordering',()=>{expect(()=>selectTask({...task,consented:false})).toThrow('consent');expect(()=>selectTask({...task,mode:'typing'})).toThrow('order')})
it('pairs only matching contexts and records actual elapsed durations',()=>{selectTask(task);beginTiming(task,1000,1);finishTiming(true,9000,1);const typing={...task,mode:'typing' as const};selectTask(typing);beginTiming(typing,10000,1);finishTiming(false,22000,1);expect(pairedTimings().map(r=>r.seconds)).toEqual([8,12]);expect(()=>selectTask(task)).toThrow('new pair')})
it('excludes a voice/typing pair recorded on different devices',()=>{selectTask(task);beginTiming(task,1000,1);finishTiming(true,9000,1);const typing={...task,mode:'typing' as const,device:'different'};selectTask(typing);beginTiming(typing,10000,1);finishTiming(false,22000,1);expect(pairedTimings()).toEqual([])})
it('cancellation produces no completed duration',()=>{selectTask(task);beginTiming(task,1000,1);cancelTiming();expect(finishTiming(true,9000,1)).toBeNull()})
