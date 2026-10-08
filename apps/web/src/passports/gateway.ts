import type { AppMode } from '../data/types'
import { connectedRequest } from '../auth/client'
import { readDemo, DEMO_KEY, SaveError } from '../vendor/gateway'
import { tick, emptyFresh } from '../freshness/engine'
import { freshness } from '../freshness/gateway'
import { fixtureClock } from '../app/clock'
import { appendRecord, demoPassport, type HandlingData, type HandlingRecord, type Passport } from './model'
export async function passport(mode:AppMode,id:string):Promise<Passport>{
 if(!navigator.onLine)throw new Error('Connect to refresh current batch state. Cached QR is not evidence of eligibility.')
 if(mode==='fixture'){const w=await freshness(mode);const p=demoPassport(w.workspace,id,fixtureClock.now());if(!p)throw new Error('Published batch passport not found');return p}
 const r=await connectedRequest(`/api/v1/passports/${encodeURIComponent(id)}`);if(!r.ok)throw new Error('Published batch passport not found or unavailable');return r.json()
}
export async function history(mode:AppMode,id:string):Promise<HandlingRecord[]>{if(mode==='fixture')return readDemo().handlingRecords?.filter(r=>r.batch_id===id)??[];const r=await connectedRequest(`/api/v1/passports/${encodeURIComponent(id)}/history`);if(!r.ok)throw new Error('Owned batch history unavailable');return r.json()}
export async function saveRecord(mode:AppMode,id:string,data:HandlingData,key:string):Promise<string>{
 if(!navigator.onLine)throw new SaveError('Offline: no handling record saved',true)
 if(mode==='fixture')return navigator.locks.request(DEMO_KEY,()=>{try{const n=appendRecord(readDemo(),id,data,key,fixtureClock.now(),crypto.randomUUID());const current=tick(n.workspace,n.workspace.freshness??emptyFresh(fixtureClock.now()),fixtureClock.now());current.workspace.freshness=current.state;localStorage.setItem(DEMO_KEY,JSON.stringify(current.workspace));return n.result}catch(e){throw new SaveError(e instanceof Error?e.message:'Save failed',true)}})
 const r=await connectedRequest(`/api/v1/passports/${encodeURIComponent(id)}/records`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,request_id:key})});if(!r.ok)throw new SaveError('Record rejected or service unavailable; retry unchanged fields',[400,401,403,404,409,422].includes(r.status));return (await r.json()).id
}
