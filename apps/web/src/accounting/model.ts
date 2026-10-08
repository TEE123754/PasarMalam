import type { VendorWorkspace } from '../vendor/model'
import { heldUnits } from '../vendor/holds'
import { closingAt } from '../freshness/engine'
export type Kind='normal'|'clearance'|'giveaway'|'donation'|'discard'|'compost'|'bsf'|'transfer-out'
export interface Movement {id:string;batch:string;kind:Kind;units:number;at:string;source:string;original_total:number|null;total:number|null;bundle:number|null;basis:string|null;refunded:number;disputed:boolean;order_id?:string}
export interface Closing {batch:string;remaining:number|null;at:string;source:string;note:string}
export interface Accounting {movements:Movement[];closings:Closing[];requests:Record<string,{hash:string;result:string}>}
export interface BatchRow {id:string;food:string;dish:string;stall:string;session:string;prepared:number|null;transfer_in:number|null;remaining:number|null;status:string;deadline:string|null;cutoff:string|null;eligible:boolean;held:number}
export interface Raw {now:string;batches:BatchRow[];movements:Movement[];closings:Closing[]}
export const emptyAccounting=():Accounting=>({movements:[],closings:[],requests:{}})
export const sessionDate=(at:string)=>new Date(Date.parse(at)+28800000).toISOString().slice(0,10)
export function monetary(m:Movement){const known=m.original_total!==null&&m.total!==null;const net=known?Math.max(0,m.total!-m.refunded):null;const kept=known?m.total!>0?Math.floor(m.original_total!*net!/m.total!):m.original_total!:null;return {revenue:net,savings:known&&!m.disputed?Math.max(0,kept!-net!):null}}
export function report(raw:Raw){
 const moves=[...new Map(raw.movements.map(m=>[m.id,m])).values()]
 const batches=raw.batches.map(b=>{const rows=moves.filter(m=>m.batch===b.id);const consumed=rows.reduce((n,m)=>n+m.units,0);const difference=b.prepared===null||b.transfer_in===null||b.remaining===null?null:b.prepared+b.transfer_in-consumed-b.remaining;const closing=raw.closings.find(c=>c.batch===b.id);return {...b,consumed,difference,reconciled:difference===0,closing:closing?.remaining??null,closed:!!closing,closing_at:closing?.at??null}})
 const sessions=[...new Set(batches.map(b=>`${b.stall}|${b.session}`))].map(key=>{const bs=batches.filter(b=>`${b.stall}|${b.session}`===key),ids=new Set(bs.map(b=>b.id)),rows=moves.filter(m=>ids.has(m.batch));const sum=(kind:Kind)=>rows.filter(m=>m.kind===kind).reduce((n,m)=>n+m.units,0);const confirmed=rows.filter(m=>m.kind==='clearance'&&m.source==='confirmed-collection'),reported=rows.filter(m=>m.kind==='clearance'&&m.source==='vendor-reported');return {key,stall:bs[0].stall,date:bs[0].session,prepared:bs.some(b=>b.prepared===null)?null:bs.reduce((n,b)=>n+b.prepared!,0),normal:sum('normal'),clearance:sum('clearance'),confirmed_clearance:confirmed.reduce((n,m)=>n+m.units,0),reported_clearance:reported.reduce((n,m)=>n+m.units,0),giveaway:sum('giveaway'),donation:sum('donation'),discard:sum('discard'),compost:sum('compost'),bsf:sum('bsf'),remaining:bs.some(b=>b.remaining===null)?null:bs.reduce((n,b)=>n+b.remaining!,0),closing_leftovers:bs.every(b=>b.closed&&b.closing!==null)?bs.reduce((n,b)=>n+b.closing!,0):null,closed:bs.every(b=>b.closed),reconciled:bs.every(b=>b.reconciled),unknown_batches:bs.filter(b=>b.difference===null).length,unattributed:bs.some(b=>b.difference===null)?null:bs.reduce((n,b)=>n+b.difference!,0),confirmed_revenue:confirmed.reduce((n,m)=>n+(monetary(m).revenue??0),0),confirmed_savings:confirmed.reduce((n,m)=>n+(monetary(m).savings??0),0),reported_revenue:reported.reduce((n,m)=>n+(monetary(m).revenue??0),0),excluded_price_records:confirmed.filter(m=>monetary(m).revenue===null).length,disputed_collections:confirmed.filter(m=>m.disputed).length}})
 return {batches,sessions,movements:moves}
}
export function recommendation(raw:Raw,batch:string,eta:number|null){
 const b=raw.batches.find(x=>x.id===batch),now=Date.parse(raw.now),unheld=b?.remaining===null?null:Math.max(0,(b?.remaining??0)-(b?.held??0)),minutes=b?.cutoff?Math.max(0,Math.floor((Date.parse(b.cutoff)-now)/60000)):0
 const rows=[...new Map(raw.movements.map(m=>[m.id,m])).values()].filter(m=>m.kind==='clearance'&&m.source==='confirmed-collection'&&!m.disputed&&m.refunded===0&&m.original_total!==null&&m.total!==null&&Date.parse(m.at)<=now&&Date.parse(m.at)>=now-1800000&&raw.batches.some(x=>x.id===m.batch&&x.food===b?.food))
 const reconciled=new Set(report(raw).batches.filter(b=>b.reconciled).map(b=>b.id));
 const span=rows.length?Math.max(...rows.map(m=>Date.parse(m.at)))-Math.min(...rows.map(m=>Date.parse(m.at))):0,reliable=rows.length>=3&&span>=300000&&rows.every(m=>reconciled.has(m.batch))&&reconciled.has(batch)
 const rate=reliable?rows.reduce((n,m)=>n+m.units,0)/30:null
 const etaValid=eta!==null&&Number.isInteger(eta)&&eta>=0&&eta<=60,reachable=etaValid&&minutes>eta!+2
 const reason=!b?.eligible||minutes<=0?'Batch is closed or ineligible':unheld===null?'Stock count is unknown':!unheld?'All stock is held or consumed':!etaValid?'Enter collection ETA; travel time is unknown':!reachable?'ETA plus 2-minute uncertainty exceeds the collection cutoff':!reliable?'Too few independent completed sales over at least 5 minutes in the last 30 minutes':'Use completed-sale pace, unheld stock and collection time'
 const suggest=!!b?.eligible&&!!unheld&&reachable&&reliable
 const expected=rate===null||!etaValid?null:Math.ceil(rate*Math.max(0,minutes-(eta??0)-2))
 return {batch,eligible:!!b?.eligible,unheld,minutes,eta,eta_source:etaValid?'shopper-entered':'unknown',uncertainty_minutes:2,fulfilment_buffer_minutes:15,samples:rows.length,reliable,units_per_minute:rate,expected_sales:expected,suggested_discount:suggest&&unheld!>expected!?(minutes<=30?50:25):null,reason,cutoff:b?.cutoff??null,approval_required:true}
}
export function rawDemo(w:VendorWorkspace,now:Date):Raw{
 const s=w.accounting??emptyAccounting()
 return {now:now.toISOString(),batches:w.batches.map(b=>{const f=w.foods.find(f=>f.id===b.food_item_id)!,stall=w.stalls.find(s=>s.id===f.stall_id)!,merged=w.events.some(e=>e.batch_id===b.id&&e.kind==='merged-from');return {id:b.id,food:f.id,dish:f.name,stall:f.stall_id,session:sessionDate(b.prepared_at),prepared:merged?0:b.original_quantity,transfer_in:merged?b.original_quantity:0,remaining:b.status==='merged'?0:b.remaining_quantity,status:b.status,deadline:b.advisory_deadline,cutoff:b.advisory_deadline?new Date(Math.min(Date.parse(b.advisory_deadline)-900000,closingAt(stall.closes,stall.opens,now))).toISOString():null,eligible:!!w.freshness?.decisions[b.id]?.eligible&&b.status==='active'&&stall.open,held:heldUnits(w,b.id,now)}}),movements:s.movements.map(m=>{const o=m.order_id?w.commerce?.orders.find(o=>o.id===m.order_id):null;return {...m,refunded:o?.refunded??0,disputed:o?.disputed??false}}),closings:s.closings}
}
// Integrate existing writers without attributing a hold as stock consumption.
export function capture(before:VendorWorkspace,after:VendorWorkspace,now:Date):VendorWorkspace{
 const w=structuredClone(after);w.accounting??=emptyAccounting();const s=w.accounting
 const add=(m:Movement)=>{if(!s.movements.some(x=>x.id===m.id))s.movements.push(m)}
 const base={at:now.toISOString(),original_total:null,total:null,bundle:null,basis:null,refunded:0,disputed:false}
 for(const o of w.commerce?.orders??[]){if(o.status==='completed'&&!before.commerce?.orders.some(x=>x.id===o.id&&x.status==='completed'))add({...base,id:`order:${o.id}`,batch:o.batch,kind:'clearance',units:o.units,source:'confirmed-collection',...o.accounting,order_id:o.id})}
 for(const e of w.partners?.entries??[]){if(e.kind==='collection'&&e.status==='collected'&&!before.partners?.entries.some(x=>x.id===e.id&&x.status==='collected'))add({...base,id:`partner:${e.id}`,batch:e.batch!,kind:e.route as Kind,units:e.units!,source:'confirmed-partner-collection'})}
 w.events.slice(before.events.length).forEach((e,i)=>{const units=Number(e.details.consumed??e.details.quantity??0),b=w.batches.find(b=>b.id===e.batch_id),f=w.foods.find(f=>f.id===b?.food_item_id);if(['consume','inventory'].includes(e.kind)&&units>0&&!e.details.source)add({...base,id:`event:${before.events.length+i}:${e.batch_id}`,batch:e.batch_id,kind:'normal',units,source:'vendor-reported',original_total:(f?.price_sen??0)*units,total:(f?.price_sen??0)*units,bundle:1,basis:'unit'});if(e.kind==='merged-into'&&b?.remaining_quantity)add({...base,id:`event:${before.events.length+i}:${e.batch_id}`,batch:e.batch_id,kind:'transfer-out',units:b.remaining_quantity,source:'batch-transfer'})})
 const audit=w.freshness?.audit??[];audit.slice(before.freshness?.audit.length??0).forEach((a,i)=>{const d=a.details as {units?:number;promotion?:string};if(a.kind==='vendor-reported-outcome'&&Number(d.units)>0){const p=before.freshness?.promotions.find(p=>p.id===d.promotion),units=Number(d.units),food=before.foods.find(f=>f.id===before.batches.find(b=>b.id===a.batch)?.food_item_id);add({...base,id:`outcome:${(before.freshness?.audit.length??0)+i}:${a.batch}`,batch:a.batch,kind:'clearance',units,source:'vendor-reported',original_total:p&&food?food.price_sen*units:null,total:p?p.price*units/p.bundle:null,bundle:p?.bundle??null,basis:p?.bundle===2?'two-unit-bundle':'unit'})}})
 for(const c of s.closings){if(w.commerce?.orders.some(o=>o.batch===c.batch&&['reserved','accepted','ready'].includes(o.status))||w.partners?.entries.some(e=>e.batch===c.batch&&['requested','accepted','scheduled'].includes(e.status)))throw new Error('Closing count is final; no new stock holds')}
 for(const b of before.batches){if(s.closings.some(c=>c.batch===b.id)){const n=w.batches.find(x=>x.id===b.id);if(n&&(n.remaining_quantity!==b.remaining_quantity||n.status!==b.status&&['active','merged'].includes(n.status)))throw new Error('Closing count is final; create a new batch')}}
 return w
}
export interface AccountingCommand {batch:string;kind:'normal'|'giveaway'|'discard'|'close';units:number|null;note:string}
export function account(w:VendorWorkspace,c:AccountingCommand,key:string,now:Date){
 const next=structuredClone(w);next.accounting??=emptyAccounting();const s=next.accounting,hash=JSON.stringify(c),old=s.requests[key];if(old){if(old.hash!==hash)throw new Error('Retry key conflict');return next}
 const b=next.batches.find(b=>b.id===c.batch),f=next.foods.find(f=>f.id===b?.food_item_id)
 if(!b||!f||!next.stalls.some(st=>st.id===f.stall_id))throw new Error('Owned batch required')
 if(c.note.trim().length<2||c.note.length>250||!['normal','giveaway','discard','close'].includes(c.kind))throw new Error('Enter a note and valid movement')
 if(s.closings.some(x=>x.batch===b.id)||['merged','recalled'].includes(b.status))throw new Error('Batch already closed')
 if(c.kind==='close'){if(c.units!==null||heldUnits(next,b.id,now)>0)throw new Error('Resolve holds before closing');s.closings.push({batch:b.id,remaining:b.remaining_quantity,at:now.toISOString(),source:'vendor-reported',note:c.note});b.status='withdrawn';for(const p of next.freshness?.promotions??[])if(p.batch===b.id&&p.state==='active')p.state='ended'}else{
 if(!Number.isInteger(c.units)||!c.units||c.units<0||c.units>100000||b.remaining_quantity===null||c.units>b.remaining_quantity-heldUnits(next,b.id,now)||['sold-out','discarded'].includes(b.status))throw new Error('Known unheld stock required')
 if(c.kind!=='discard'&&(!next.freshness?.decisions[b.id]?.eligible||b.status!=='active'||!b.advisory_deadline||Date.parse(b.advisory_deadline)<=now.getTime()+900000))throw new Error('Human-consumption window closed')
 b.remaining_quantity-=c.units;if(!b.remaining_quantity)b.status=c.kind==='discard'?'discarded':'sold-out'
 s.movements.push({id:`manual:${key}`,batch:b.id,kind:c.kind,units:c.units,at:now.toISOString(),source:'vendor-reported',original_total:c.kind==='discard'?null:f.price_sen*c.units,total:c.kind==='normal'?f.price_sen*c.units:c.kind==='giveaway'?0:null,bundle:1,basis:'unit',refunded:0,disputed:false})
 }
 s.requests[key]={hash,result:b.id};return next
}
