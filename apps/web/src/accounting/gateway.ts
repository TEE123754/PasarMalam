import { connectedRequest } from '../auth/client'
import { fixtureClock } from '../app/clock'
import { DEMO_KEY, readDemo, SaveError } from '../vendor/gateway'
import { emptyFresh, tick } from '../freshness/engine'
import { account, rawDemo, report, recommendation, type AccountingCommand, type Raw } from './model'
export interface View {raw:Raw;report:ReturnType<typeof report>;recommendations:ReturnType<typeof recommendation>[]}
export async function accounting(mode:'fixture'|'connected',eta:number|null):Promise<View>{
 if(!navigator.onLine)throw new Error('Current accounting unavailable offline')
 if(mode==='fixture'){return navigator.locks.request(DEMO_KEY,()=>{const w=readDemo(),now=fixtureClock.now(),next=tick(w,w.freshness??emptyFresh(now),now);next.workspace.freshness=next.state;localStorage.setItem(DEMO_KEY,JSON.stringify(next.workspace));const raw=rawDemo(next.workspace,now);return {raw,report:report(raw),recommendations:raw.batches.map(b=>recommendation(raw,b.id,eta))}})}
 const r=await connectedRequest(`/api/v1/accounting/workspace${eta===null?'':`?eta=${eta}`}`);if(!r.ok)throw new Error('Owned accounting unavailable');return r.json() as Promise<View>
}
export async function saveAccounting(mode:'fixture'|'connected',c:AccountingCommand,key:string){
 if(!navigator.onLine)throw new SaveError('Offline: no movement saved',true)
 if(mode==='fixture')return navigator.locks.request(DEMO_KEY,()=>{const w=readDemo(),now=fixtureClock.now(),t=tick(w,w.freshness??emptyFresh(now),now);t.workspace.freshness=t.state;try{const next=account(t.workspace,c,key,now);localStorage.setItem(DEMO_KEY,JSON.stringify(next));return c.batch}catch(e){throw new SaveError(e instanceof Error?e.message:'Record rejected',true)}})
 const r=await connectedRequest('/api/v1/accounting/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...c,request_id:key})});if(!r.ok)throw new SaveError('Accounting rejected or unavailable; check stock, cutoff and ownership',[400,401,403,404,409,422].includes(r.status));return ((await r.json()) as {id:string}).id
}
