import { afterEach, expect, it, vi } from 'vitest'
import { enableTestPush } from './push'
vi.mock('../app/config',()=>({selectedMode:()=> 'connected'}))
vi.mock('../auth/client',()=>({connectedRequest:vi.fn(async()=>({ok:true,json:async()=>({enabled:true,public_key:'test'})}))}))
afterEach(()=>{vi.useRealTimers();vi.unstubAllGlobals()})
it('releases the flow when a browser never answers its permission request',async()=>{
 vi.useFakeTimers()
 const notification={permission:'default',requestPermission:()=>new Promise(()=>{})}
 const subscribe=vi.fn()
 vi.stubGlobal('window',{isSecureContext:true,PushManager:class {},Notification:notification})
 vi.stubGlobal('Notification',notification)
 vi.stubGlobal('navigator',{serviceWorker:{register:subscribe}})
 vi.stubGlobal('location',{pathname:'/sandbox/advanced'})
 const result=expect(enableTestPush()).rejects.toThrow('Notification permission did not respond')
 await vi.advanceTimersByTimeAsync(30000)
 await result
 expect(subscribe).not.toHaveBeenCalled()
})
it('preserves browsing when notifications have been denied',async()=>{
 const notification={permission:'denied',requestPermission:vi.fn()}
 vi.stubGlobal('window',{isSecureContext:true,PushManager:class {},Notification:notification})
 vi.stubGlobal('Notification',notification)
 vi.stubGlobal('navigator',{serviceWorker:{}})
 vi.stubGlobal('location',{pathname:'/sandbox/advanced'})
 await expect(enableTestPush()).rejects.toThrow('Notification permission denied')
 expect(notification.requestPermission).not.toHaveBeenCalled()
})
