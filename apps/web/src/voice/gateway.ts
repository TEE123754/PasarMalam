import { connectedRequest } from '../auth/client'
import { DEMO_KEY, readDemo, save as manualSave } from '../vendor/gateway'
import { applyCommand, batchInput, foodInput, type VendorFood, type NewBatch } from '../vendor/model'
import { tick, emptyFresh } from '../freshness/engine'
import { fixtureClock } from '../app/clock'
import { draftSchema, fallback, redact, type Extraction } from './model'
import type { AppMode } from '../data/types'
export class VoiceSaveError extends Error {constructor(message:string,readonly definite:boolean){super(message)}}
export async function extract(mode:AppMode,text:string,menu:VendorFood[],signal:AbortSignal,externalConsent=false):Promise<Extraction>{
 const transcript=redact(text),body=JSON.stringify({transcript,menu:menu.map(f=>f.name),fictional:mode==='fixture',external_consent:externalConsent});const url='/api/v1/voice/'+(mode==='fixture'?'demo-extract':'extract')
 const timeout=new AbortController(),timer=setTimeout(()=>timeout.abort(),22000);const cancel=()=>timeout.abort();signal.addEventListener('abort',cancel,{once:true});if(signal.aborted)timeout.abort()
 const request={method:'POST',headers:{'Content-Type':'application/json'},body,signal:timeout.signal}
 try {
 const response=mode==='fixture'?await fetch(`${import.meta.env.VITE_API_BASE_URL??'http://127.0.0.1:8000'}${url}`,request):await connectedRequest(url,request)
 if(!response.ok)throw new Error('Extraction unavailable; use quick entry.')
 const data=await response.json() as Extraction;data.draft=draftSchema.parse(data.draft);return data
 }finally{clearTimeout(timer);signal.removeEventListener('abort',cancel)}
}
export async function confirm(mode:AppMode,food:VendorFood,batch:NewBatch|null,text:string,request:string){
 if(!navigator.onLine)throw new Error('Offline: no listing saved; retry while online.')
 food=foodInput.parse(food);if(batch)batch=batchInput.parse(batch);const transcript=redact(text).slice(0,1000)
 if(mode==='fixture')return navigator.locks.request(DEMO_KEY,()=>{
  let w=readDemo();const command={food,batch,transcript},fingerprint=JSON.stringify(command),key=`voice:${request}`,prior=w.requests[key]
  if(prior){if(prior.fingerprint!==fingerprint)throw new Error('Retry conflict');return prior.result}
  w=applyCommand(w,{kind:'food',data:food},request,fixtureClock.now(),food.id).workspace
  if(!batch){const s=w.freshness??emptyFresh(fixtureClock.now());s.audit.push({at:fixtureClock.now().toISOString(),kind:'voice-confirmed',batch:'',details:{transcript,food,action:'menu-update'}});w.freshness=s;w.requests[key]={fingerprint,result:food.id};localStorage.setItem(DEMO_KEY,JSON.stringify(w));return food.id}
  const created=applyCommand(w,{kind:'batch',data:batch},`${request}:batch`,fixtureClock.now(),crypto.randomUUID());w=created.workspace
  const s=w.freshness??emptyFresh(fixtureClock.now());s.declarations[created.result]={ingredients:food.ingredients,confirmed:true,ambient:true};s.audit.push({at:fixtureClock.now().toISOString(),kind:'voice-confirmed',batch:created.result,details:{transcript,food,batch}})
  const next=tick(w,s,fixtureClock.now());next.workspace.freshness=next.state;next.workspace.requests[key]={fingerprint,result:created.result};localStorage.setItem(DEMO_KEY,JSON.stringify(next.workspace));return created.result
 })
 if(!batch)return manualSave(mode,{kind:'food',data:food},request)
 const r=await connectedRequest('/api/v1/voice/confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({food,batch,transcript,confirmed:true,request_id:request})});if(!r.ok)throw new VoiceSaveError('Save rejected or uncertain; retry the same confirmed fields.',[400,401,403,409,422].includes(r.status));return ((await r.json()) as {id:string}).id
}
export const quickEntry=fallback
