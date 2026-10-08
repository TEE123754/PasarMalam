import { connectedRequest } from '../auth/client'
import { selectedMode } from '../app/config'
async function call(path:string,body?:unknown){const r=await connectedRequest(`/api/v1/push/${path}`,body===undefined?undefined:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw new Error('Test push unavailable. Check setup, account and coarse nearby consent.');return r.json()}
export async function enableTestPush(){
 if(selectedMode()==='fixture'||!/^\/sandbox(?:\/|$)/.test(location.pathname))throw new Error('Explicit test push is available only in connected sandbox.')
 if(!window.isSecureContext||!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window))throw new Error('Web Push unsupported. Browsing still works.')
 const config=await call('config') as {enabled:boolean;public_key:string}
 if(!config.enabled)throw new Error('Configure private VAPID keys and enrolled-test mode first.')
 if(Notification.permission==='denied')throw new Error('Notification permission denied. Browsing still works; change permission in browser settings if desired.')
 let permissionTimer:ReturnType<typeof setTimeout>|undefined
 let permission:NotificationPermission
 try{permission=await Promise.race([Notification.requestPermission(),new Promise<never>((_,reject)=>{permissionTimer=setTimeout(()=>reject(new Error('Notification permission did not respond. Use a supported browser or keep browsing without notifications.')),30000)})])}finally{clearTimeout(permissionTimer)}
 if(permission!=='granted')throw new Error('No notification permission. Browsing still works.')
 const registration=await navigator.serviceWorker.register('/app-sw.js',{scope:'/'})
 await navigator.serviceWorker.ready
 const key=Uint8Array.from(atob(config.public_key.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0))
 const existing=await registration.pushManager.getSubscription(),subscription=existing??await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key})
 const data=subscription.toJSON()
 try{await call('subscribe',{endpoint:data.endpoint,p256dh:data.keys?.p256dh,auth:data.keys?.auth,consent:true})}catch(error){if(!existing)await subscription.unsubscribe();throw error}
 return 'This test browser enrolled. Provider acceptance does not prove device receipt. Coarse nearby consent must also be enabled in Profile.'
}
export async function revokeTestPush(){await call('revoke',{});const registration=await navigator.serviceWorker.getRegistration('/');await (await registration?.pushManager.getSubscription())?.unsubscribe();return 'Server opt-out saved; browser subscription removed. Already accepted messages cannot be recalled.'}
