import { afterEach, expect, it, vi } from 'vitest'
import { Recorder } from './recorder'
afterEach(()=>vi.unstubAllGlobals())
it('stops a microphone granted after cancellation',async()=>{
 const stop=vi.fn();let resolve!:(stream:MediaStream)=>void
 vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:()=>new Promise<MediaStream>(r=>resolve=r)}})
 vi.stubGlobal('MediaRecorder',class {})
 const recorder=new Recorder(),started=recorder.start(()=>{});recorder.cancel()
 resolve({getTracks:()=>[{stop}]} as unknown as MediaStream)
 await expect(started).rejects.toThrow('cancelled');expect(stop).toHaveBeenCalledOnce()
})
it('does not create a recorder if permission is denied',async()=>{
 const record=vi.fn();vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:()=>Promise.reject(new Error('denied'))}});vi.stubGlobal('MediaRecorder',record)
 await expect(new Recorder().start(()=>{})).rejects.toThrow('denied');expect(record).not.toHaveBeenCalled()
})
it('detaches late audio callbacks when cancelled',async()=>{
 const stop=vi.fn(),done=vi.fn()
 const holder: {current?: {ondataavailable:unknown;onstop:unknown;onerror:unknown;state:string;stop:()=>void;start:()=>void}}={}
 vi.stubGlobal('navigator',{mediaDevices:{getUserMedia:async()=>({getTracks:()=>[{stop}]})}})
 vi.stubGlobal('MediaRecorder',class {ondataavailable=null;onstop=null;onerror=null;state='recording';constructor(){holder.current=this}start(){}stop(){this.state='inactive'}})
 const recorder=new Recorder();await recorder.start(done);recorder.cancel()
 expect(holder.current!.ondataavailable).toBeNull();expect(holder.current!.onstop).toBeNull();expect(holder.current!.onerror).toBeNull();expect(stop).toHaveBeenCalledOnce();expect(done).not.toHaveBeenCalled()
})
