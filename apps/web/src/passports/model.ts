import { z } from 'zod'
import type { VendorWorkspace } from '../vendor/model'
export const recordSchema=z.object({kind:z.enum(['storage','temperature']),effective_at:z.string().datetime({offset:true}),storage:z.enum(['ambient','chilled','hot-held','unknown']).nullable(),value:z.number().finite().nullable(),unit:z.enum(['C','F']).nullable(),method:z.string().max(100),source:z.literal('manual'),note:z.string().max(250),supersedes:z.string().nullable()}).strict().superRefine((v,c)=>{
 if(v.kind==='storage'&&(!v.storage||v.value!==null))c.addIssue({code:'custom',message:'Choose storage; temperatures belong in a measurement.'})
 if(v.kind==='temperature'&&(v.storage!==null||v.value===null||!v.unit||v.method.trim().length<2||!Number.isFinite(v.value)||toC(v.value,v.unit)<-100||toC(v.value,v.unit)>300))c.addIssue({code:'custom',message:'Enter measured value, unit and measurement method.'})
 if(v.supersedes&&v.note.trim().length<2)c.addIssue({code:'custom',message:'Supply the correction reason.'})
})
export type HandlingData=z.infer<typeof recordSchema>
export type HandlingRecord={id:string;actor:string;recorded_at:string;data:HandlingData}
export function toC(value:number,unit:'C'|'F'|null){return unit==='F'?(value-32)*5/9:value}
export function handlingGate(w:VendorWorkspace,batch:string){return (w.handlingRecords??[]).some(r=>r.batch_id===batch&&r.data.kind==='storage')}
export function appendRecord(original:VendorWorkspace,batch:string,input:HandlingData,key:string,now:Date,id:string){
 const data=recordSchema.parse(input),w=structuredClone(original),b=w.batches.find(x=>x.id===batch)
 if(!b||!w.foods.some(f=>f.id===b.food_item_id&&w.stalls.some(s=>s.id===f.stall_id)))throw new Error('Owned batch required')
 const fingerprint=JSON.stringify({batch,data}),request=`handling:${key}`,prior=w.requests[request]
 if(prior){if(prior.fingerprint!==fingerprint)throw new Error('Retry conflict');return {workspace:w,result:prior.result}}
 const at=Date.parse(data.effective_at)
 if(at<Date.parse(b.corrected_prepared_at??b.prepared_at)||at>now.getTime())throw new Error('Record time must be between preparation and now')
 const records=w.handlingRecords??=[]
 if(data.supersedes&&(!records.some(r=>r.id===data.supersedes&&r.batch_id===batch&&r.data.kind===data.kind)||records.some(r=>r.data.supersedes===data.supersedes)))throw new Error('Choose an uncorrected original from this batch and record type')
 records.push({id,batch_id:batch,actor:'fictional-hawker',recorded_at:now.toISOString(),data})
 w.events.push({batch_id:batch,kind:'handling-recorded',at:now.toISOString(),details:{record_id:id,kind:data.kind,effective_at:data.effective_at,policy_gate:'review-required'}})
 if(data.kind==='storage'&&['active','needs-information'].includes(b.status))b.status='needs-information'
 w.requests[request]={fingerprint,result:id};return {workspace:w,result:id}
}
export type Passport={photo?:string|null;id:string;stall_id:string;stall:string;dish:string;batch_number:number;prepared_at:string;corrected_prepared_at:string|null;recorded_at:string;server_now:string;deadline:string|null;remaining:number|null;status:string;eligible:boolean;storage_review_required:boolean;policy_approval:string;handling_record_count:number;temperature_record_count:number;cumulative_exposure:null}
export function demoPassport(w:VendorWorkspace,id:string,now:Date):Passport|null{
 const b=w.batches.find(b=>b.id===id),f=w.foods.find(f=>f.id===b?.food_item_id),s=w.stalls.find(s=>s.id===f?.stall_id)
 if(!b||!f||!s)return null
 const records=w.handlingRecords?.filter(r=>r.batch_id===id)??[],blocked=handlingGate(w,id),expired=!!b.advisory_deadline&&Date.parse(b.advisory_deadline)<=now.getTime()
 const status=['sold-out','withdrawn','discarded','merged','recalled'].includes(b.status)?b.status:expired?'expired':blocked?'needs-information':b.status
 return {id,photo:b.photo,stall_id:s.id,stall:s.name,dish:f.name,batch_number:b.batch_number,prepared_at:b.prepared_at,corrected_prepared_at:b.corrected_prepared_at,recorded_at:b.uploaded_at,server_now:now.toISOString(),deadline:b.advisory_deadline,remaining:b.remaining_quantity,status,eligible:status==='active'&&!blocked&&!expired&&!!b.advisory_deadline&&(b.remaining_quantity??0)>0,storage_review_required:blocked,policy_approval:'synthetic-demo-only',handling_record_count:records.length,temperature_record_count:records.filter(r=>r.data.kind==='temperature').length,cumulative_exposure:null}
}
