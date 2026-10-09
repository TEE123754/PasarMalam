import { connectedRequest } from '../auth/client'
import { DEMO_KEY, readDemo, save as manualSave } from '../vendor/gateway'
import { applyCommand, batchInput, foodInput, type VendorFood, type NewBatch } from '../vendor/model'
import { tick, emptyFresh } from '../freshness/engine'
import { fixtureClock } from '../app/clock'
import { draftSchema, fallback, redact, type Extraction } from './model'
import type { AppMode } from '../data/types'
import { nativeDemoBuild } from '../native/policy'
import { recordRequest, type RequestContext } from './requestMetrics'
export class VoiceSaveError extends Error {constructor(message:string,readonly definite:boolean){super(message)}}
export async function extract(mode:AppMode,text:string,menu:VendorFood[],signal:AbortSignal,externalConsent=false,stalls:{name:string}[]=[],measurementContext?:RequestContext):Promise<Extraction>{
 if(nativeDemoBuild())throw new Error('Packaged demo has no connected extraction service. Use text and quick-entry chips.')
 const transcript=redact(text),body=JSON.stringify({transcript,menu:menu.map(f=>f.name).slice(0,30),stalls:stalls.map(s=>s.name).slice(0,100),fictional:mode==='fixture',external_consent:externalConsent});const url='/api/v1/voice/'+(mode==='fixture'?'demo-extract':'extract')
 const timeout=new AbortController(),timer=setTimeout(()=>timeout.abort(),22000);const cancel=()=>timeout.abort();signal.addEventListener('abort',cancel,{once:true});if(signal.aborted)timeout.abort()
 const request={method:'POST',headers:{'Content-Type':'application/json'},body,signal:timeout.signal}
 const started=performance.now();let failed=true,status:number|null=null,data:Extraction|null=null
 try {
 const response=mode==='fixture'?await fetch(`${import.meta.env.VITE_API_BASE_URL??'http://127.0.0.1:8000'}${url}`,request):await connectedRequest(url,request)
 status=response.status
 if(!response.ok)throw new Error('Extraction unavailable; use quick entry.')
 data=await response.json() as Extraction;data.draft=draftSchema.parse(data.draft);failed=false;return data
 }finally{clearTimeout(timer);signal.removeEventListener('abort',cancel);if(measurementContext)recordRequest(mode,measurementContext,{elapsed:performance.now()-started,failed,cancelled:signal.aborted||timeout.signal.aborted,status,measurement:data?.measurement,model:data?.model})}
}
export async function confirm(mode:AppMode,food:VendorFood,batch:NewBatch|null,text:string,request:string){
 if(!navigator.onLine)throw new Error('Offline: no listing saved; retry while online.')
 food=foodInput.parse(food);delete food.plant_diet;delete food.plant_diet_recorded_at;delete food.allergens;delete food.allergens_recorded_at;if(batch)batch=batchInput.parse(batch);const transcript=redact(text).slice(0,1000)
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

export interface WorkflowCommand {action:'create_batch'|'update_food'|'update_stock';food:VendorFood;batch:NewBatch|null;batch_id:string|null;expected_remaining:number|null;remaining:number|null;unit:'portion'|'unit'|'stick'|'pack';transcript:string;history:{field:string;before:string;after:string}[];confirmed:true;request_id:string}
export async function confirmWorkflow(mode:AppMode,command:WorkflowCommand){
 if(!navigator.onLine)throw new VoiceSaveError('Offline: no listing saved; retry while online.',true)
 const c=structuredClone(command);c.food=foodInput.parse(c.food);delete c.food.allergens;delete c.food.allergens_recorded_at;delete c.food.plant_diet;delete c.food.plant_diet_recorded_at;c.transcript=redact(c.transcript).slice(0,1000)
 if(mode==='connected'){
  const r=await connectedRequest('/api/v1/voice/workflow-confirm',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(c)})
  if(!r.ok)throw new VoiceSaveError('Stock or save rejected; refresh the workspace and review.',[400,401,403,404,409,422,502].includes(r.status))
  return ((await r.json()) as {id:string}).id
 }
 return navigator.locks.request(DEMO_KEY,()=>{
  let w=readDemo();const now=fixtureClock.now(),key=`workflow:${c.request_id}`,fingerprint=JSON.stringify(c),prior=w.requests[key]
  if(prior){if(prior.fingerprint!==fingerprint)throw new VoiceSaveError('Retry conflict',true);return prior.result}
  const food=w.foods.find(f=>f.id===c.food.id&&f.stall_id===c.food.stall_id);if(!food)throw new VoiceSaveError('Exact owned dish required',true)
  let result=food.id
  if(c.action==='update_stock'){
   const b=w.batches.find(b=>b.id===c.batch_id&&b.food_item_id===food.id)
   if(!b||b.remaining_quantity===null||b.remaining_quantity!==c.expected_remaining||c.remaining===null||!Number.isInteger(c.remaining)||c.remaining<0||c.remaining>b.remaining_quantity||!['active','needs-information'].includes(b.status)||b.advisory_deadline&&Date.parse(b.advisory_deadline)<=now.getTime())throw new VoiceSaveError('Stock changed or batch closed; refresh and review.',true)
   result=b.id
   if(c.remaining<b.remaining_quantity)w=applyCommand(w,{kind:'action',data:{batch_id:b.id,action:'consume',quantity:b.remaining_quantity-c.remaining}},c.request_id,now,b.id).workspace
   w.events.push({batch_id:b.id,kind:'voice-stock-confirmed',at:now.toISOString(),details:{remaining:c.remaining,unit:c.unit}})
  }else{
   w=applyCommand(w,{kind:'food',data:c.food},c.request_id,now,food.id).workspace
   if(c.action==='create_batch'){
    if(!c.batch||c.batch.food_item_id!==food.id||c.batch.handling.storage!=='ambient')throw new VoiceSaveError('Exact matching ambient batch required',true)
    const created=applyCommand(w,{kind:'batch',data:c.batch},`${c.request_id}:batch`,now,crypto.randomUUID());w=created.workspace;result=created.result
    const state=w.freshness??emptyFresh(now);state.declarations[result]={ingredients:c.food.ingredients,confirmed:true,ambient:true};const next=tick(w,state,now);w=next.workspace;w.freshness=next.state
   }
  }
  const state=w.freshness??emptyFresh(now);state.audit.push({at:now.toISOString(),kind:'voice-confirmed',batch:c.action==='update_food'?'':result,details:{transcript:c.transcript,history:c.history,action:c.action}});w.freshness=state
  w.requests[key]={fingerprint,result};localStorage.setItem(DEMO_KEY,JSON.stringify(w));return result
 })
}
