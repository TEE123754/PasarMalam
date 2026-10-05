import { heldUnits } from '../vendor/holds'
import { connectedRequest } from '../auth/client'
import { fixtureClock } from '../app/clock'
import { readDemo, DEMO_KEY } from '../vendor/gateway'
import { tick, emptyFresh, publish, dispatch, type FreshState } from './engine'
import type { AppMode } from '../data/types'
import type { VendorWorkspace } from '../vendor/model'
export interface FreshWorkspace {server_now:string;workspace:VendorWorkspace;state:FreshState}
async function demo<T>(fn:(w:VendorWorkspace,s:FreshState,now:Date)=>{workspace:VendorWorkspace;state:FreshState;result:T}):Promise<T> {
 return navigator.locks.request(DEMO_KEY,()=>{const w=readDemo();const now=fixtureClock.now();const s=w.freshness??emptyFresh(now);if(!w.freshness)for(const b of w.batches)if(b.handling.note==='Fictional prepared batch')s.declarations[b.id]={ingredients:['chicken','peanuts'],confirmed:true,ambient:true};const next=fn(w,s,now);next.workspace.freshness=next.state;localStorage.setItem(DEMO_KEY,JSON.stringify(next.workspace));return next.result})
}
export async function freshness(mode:AppMode):Promise<FreshWorkspace> {if(mode==='fixture')return demo((w,s,now)=>{const t=tick(w,s,now);return {...t,result:{server_now:now.toISOString(),...t}}});const r=await connectedRequest('/api/v1/freshness/workspace');if(!r.ok)throw new Error('Advisory workspace unavailable');return r.json()}
export async function freshAction(mode:AppMode,kind:string,data:Record<string,unknown>,request:string=crypto.randomUUID()):Promise<void> {
 if(!navigator.onLine)throw new Error('Offline: no advisory, offer or outcome was saved')
 if(mode==='fixture'){await demo((w,original,now)=>{const t=tick(w,original,now);const s=t.state;w=t.workspace
  if(kind==='confirm'){if(s.requests[request]){if(s.requests[request]!==JSON.stringify(data))throw new Error('Retry conflict');return {workspace:w,state:s,result:undefined}}s.requests[request]=JSON.stringify(data);s.audit.push({at:now.toISOString(),kind:'declaration-confirmed',batch:String(data.batch),details:data});const b=w.batches.find(b=>b.id===data.batch);if(!b)throw new Error('Batch unavailable');b.handling.storage=data.ambient===true?'ambient':'unknown';s.declarations[b.id]={ingredients:Array.isArray(data.ingredients)?data.ingredients as string[]:[],confirmed:data.confirmed===true,ambient:data.ambient===true}}
  else if(kind==='publish') {const next=publish(w,s,now,data as unknown as Parameters<typeof publish>[3],request);return {workspace:w,state:next,result:undefined}}
  else if(kind==='consent'){s.consent=data.enabled===true;s.consentExpires=new Date(now.getTime()+7200000).toISOString()}
  else if(kind==='read'){const a=s.alerts.find(a=>a.id===data.id);if(a)a.read=true}
  else if(kind==='dispatch')return {workspace:w,state:dispatch(w,s,now),result:undefined}
  else if(kind==='outcome'){if(s.requests[request]){if(s.requests[request]!==JSON.stringify(data))throw new Error('Retry conflicts with original report');return {workspace:w,state:s,result:undefined}};const b=w.batches.find(b=>b.id===data.batch),p=s.promotions.find(p=>p.id===data.promotion&&p.batch===b?.id&&p.state==='active');const units=Number(data.units??0),grams=Number(data.grams??0);if(!b||!Number.isInteger(units)||!Number.isInteger(grams)||units<0||grams<0||units>100000||grams>10000000||units===0&&grams===0)throw new Error('Enter reported units or grams');if(units>0){if(!p||!s.decisions[b.id]?.eligible||b.remaining_quantity===null||units>b.remaining_quantity-heldUnits(w,b.id,now)||units>p.units||units%p.bundle)throw new Error('Offer or stock is ineligible');b.remaining_quantity-=units;p.units-=units;if(b.remaining_quantity===0)b.status='sold-out'}if(grams>0)b.status='discarded';s.outcomes.push({batch:b.id,units,grams,at:now.toISOString()});s.requests[request]=JSON.stringify(data);s.audit.push({at:now.toISOString(),kind:'vendor-reported-outcome',batch:b.id,details:data})}
  else if(kind==='weather'){s.weather={id:crypto.randomUUID(),temperature:Number(data.temperature),humidity:Number(data.humidity),observed:now.toISOString(),source:'fixture'}}
  else throw new Error('Unknown action')
  const end=tick(w,s,now);return {...end,result:undefined}
 });return}
 const r=await connectedRequest(`/api/v1/freshness/${kind}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,request_id:request})});if(!r.ok)throw new Error('Action rejected or service unavailable. Retry the same request.');
}

