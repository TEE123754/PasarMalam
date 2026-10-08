import { afterEach, expect, it, vi } from 'vitest'
import { offlineReady } from './offline-status'
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals()})
it('does not advertise offline readiness when a worker never responds',async()=>{
 vi.useFakeTimers()
 const result=offlineReady({postMessage:vi.fn()} as unknown as ServiceWorker)
 await vi.advanceTimersByTimeAsync(8000)
 expect(await result).toBe(false)
})
it('requires an explicit positive cache acknowledgement and closes both ports',async()=>{
 const close=vi.fn()
 let receive:((event:{data:unknown})=>void)|null=null
 vi.stubGlobal('MessageChannel',class {
  port1={set onmessage(fn:typeof receive){receive=fn},close}
  port2={close}
 })
 const result=offlineReady({postMessage:()=>{receive?.({data:{type:'OFFLINE_STATUS',ready:true}})}} as unknown as ServiceWorker)
 expect(await result).toBe(true)
 expect(close).toHaveBeenCalledTimes(2)
})
it('fails closed if worker messaging throws',async()=>{
 expect(await offlineReady({postMessage:()=>{throw new Error('Unavailable')}} as unknown as ServiceWorker)).toBe(false)
})
