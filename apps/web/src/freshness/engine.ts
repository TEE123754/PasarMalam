import policy from '../../../../contracts/advisory-policy.json'
import type { VendorWorkspace, VendorBatch } from '../vendor/model'
export interface Weather {temperature:number|null;humidity:number|null;observed:string;source:'fixture'|'open-meteo';id:string}
export interface Decision {weather?:Weather;version:string;deadline:string|null;caps:Record<string,number>;reasons:string[];eligible:boolean;remaining:number}
export interface Notice {id:string;batch:string;threshold:number;current:boolean;read:boolean;at:string}
export interface Draft {id:string;batch:string;state:'pending'|'confirmed';created:string}
export interface Promotion {id:string;batch:string;stall:string;title:string;price:number;original:number;units:number;bundle:number;ends:string;state:'active'|'ended';request:string}
export interface QueueItem {id:string;promotion:string;recipient:string;state:'pending'|'leased'|'delivered-simulated'|'cancelled';expires:string;lease:string|null;token:string|null;attempts:number}
export interface FreshState {declarations:Record<string,{ingredients:string[];confirmed:boolean;ambient:boolean}>;decisions:Record<string,Decision>;weather:Weather;alerts:Notice[];drafts:Draft[];promotions:Promotion[];outbox:QueueItem[];consent:boolean;consentExpires?:string;outcomes:{batch:string;units:number;grams:number;at:string}[];audit:{at:string;kind:string;batch:string;details:unknown}[];requests:Record<string,string>}
export const emptyFresh=(now:Date):FreshState=>({declarations:{},decisions:{},weather:{id:'fixture-weather',temperature:28,humidity:75,observed:now.toISOString(),source:'fixture'},alerts:[],drafts:[],promotions:[],outbox:[],consent:false,outcomes:[],audit:[],requests:{}})
export function decide(b:VendorBatch,ingredients:string[],confirmed:boolean,weather:Weather,now:Date):Decision {
 const prepared=Date.parse(b.corrected_prepared_at??b.prepared_at);const reasons:string[]=[]
 const blocked=!Number.isFinite(prepared)||prepared>now.getTime()||!confirmed||b.handling.storage!=='ambient'
 const risks=ingredients.map(x=>policy.ingredients[x.trim().toLowerCase() as keyof typeof policy.ingredients]??'unknown')
 const unknown=!risks.length||risks.includes('unknown');const risk=unknown?30:Math.min(...risks.map(x=>policy.risk[x as keyof typeof policy.risk]))
 const age=now.getTime()-Date.parse(weather.observed);const valid=Number.isFinite(age)&&age>=-300000&&age<=1800000&&weather.temperature!==null&&Number.isFinite(weather.temperature)&&weather.temperature>=-20&&weather.temperature<=60&&weather.humidity!==null&&Number.isFinite(weather.humidity)&&weather.humidity>=0&&weather.humidity<=100
 const caps={base:policy.base,risk,temperature:valid?policy.temperature.find(x=>weather.temperature!<x.below)!.cap:30,humidity:valid?policy.humidity.find(x=>weather.humidity!<x.below)!.cap:30,uncertainty:unknown||!valid?policy.uncertain:120}
 if(unknown)reasons.push('Unknown ingredient: conservative cap');if(!valid)reasons.push('Missing, invalid or stale weather: conservative cap');if(blocked)reasons.push('Confirm preparation/ingredients and ambient handling before listing')
 let deadline=blocked?b.advisory_deadline:new Date(Math.min(prepared+Math.min(...Object.values(caps))*60000,b.advisory_deadline?Date.parse(b.advisory_deadline):Infinity)).toISOString()
 if(deadline&&!Number.isFinite(Date.parse(deadline)))deadline=null
 const remaining=deadline?Math.max(0,Math.floor((Date.parse(deadline)-now.getTime())/60000)):0
 return {weather,version:policy.version,deadline,caps,reasons,eligible:!blocked&&!!deadline&&Date.parse(deadline)>now.getTime()&&['active','needs-information'].includes(b.status)&&b.remaining_quantity!==0,remaining}
}
export function closingAt(closes:string,opens:string,now:Date):number {const day=new Date(now.getTime()+8*3600000).toISOString().slice(0,10);let close=Date.parse(`${day}T${closes}:00+08:00`);if(closes<=opens&&new Date(now.getTime()+8*3600000).toISOString().slice(11,16)>=opens)close+=86400000;return close}
export function tick(workspace:VendorWorkspace,original:FreshState,now:Date):{workspace:VendorWorkspace;state:FreshState} {
 const w=structuredClone(workspace),s=structuredClone(original);s.audit=s.audit.filter(a=>a.kind!=='voice-confirmed'||Date.parse(a.at)>now.getTime()-30*86400000);if(s.consentExpires&&Date.parse(s.consentExpires)<=now.getTime())s.consent=false
 for(const b of w.batches){const declaration=s.declarations[b.id];const d=decide(b,declaration?.ingredients??[],!!declaration?.confirmed,s.weather,now);const old=b.advisory_deadline;b.advisory_deadline=d.deadline;s.decisions[b.id]=d
  if(old!==d.deadline)s.audit.push({at:now.toISOString(),kind:'deadline-shortened',batch:b.id,details:{old,decision:d,weather:s.weather}})
  if(['active','needs-information','expired'].includes(b.status))b.status=d.eligible?'active':d.deadline&&Date.parse(d.deadline)<=now.getTime()?'expired':'needs-information'
  const food=w.foods.find(f=>f.id===b.food_item_id),stall=w.stalls.find(x=>x.id===food?.stall_id);const close=stall?closingAt(stall.closes,stall.opens,now):Infinity
  const left=d.deadline?Math.min(Date.parse(d.deadline),close)-now.getTime():Infinity
  const threshold=left<=0?0:left<=900000?15:left<=1800000?30:null
  for(const a of s.alerts.filter(a=>a.batch===b.id))a.current=a.threshold===threshold&&['active','expired'].includes(b.status)
  if(threshold!==null&&['active','expired'].includes(b.status)){const id=`${b.id}:${policy.version}:${threshold}`;if(!s.alerts.some(a=>a.id===id))s.alerts.push({id,batch:b.id,threshold,current:true,read:false,at:now.toISOString()});if(threshold===30&&d.eligible&&!s.drafts.some(x=>x.batch===b.id))s.drafts.push({id:`draft:${b.id}`,batch:b.id,state:'pending',created:now.toISOString()})}
 }
 for(const p of s.promotions){const b=w.batches.find(b=>b.id===p.batch),d=s.decisions[p.batch];const food=w.foods.find(f=>f.id===b?.food_item_id),stall=w.stalls.find(x=>x.id===food?.stall_id);const cap=b?.advisory_deadline?Math.min(Date.parse(b.advisory_deadline)-900000,stall?closingAt(stall.closes,stall.opens,now):Infinity):0;p.ends=new Date(Math.min(Date.parse(p.ends),cap)).toISOString();if(!b||b.status!=='active'||!d?.eligible||!b.remaining_quantity||Date.parse(p.ends)<=now.getTime())p.state='ended'}
 for(const q of s.outbox.filter(q=>['pending','leased'].includes(q.state))){const p=s.promotions.find(p=>p.id===q.promotion);if(!s.consent||!p||p.state!=='active'||Date.parse(q.expires)<=now.getTime())q.state='cancelled';else if(q.state==='leased'&&q.lease&&Date.parse(q.lease)<=now.getTime()){q.state='pending';q.token=null}}
 return {workspace:w,state:s}
}
export function publish(w:VendorWorkspace,state:FreshState,now:Date,input:{batch:string;kind:'percentage'|'fixed'|'free'|'bogo';value:number;units:number;title:string},request:string):FreshState {
 const result=tick(w,state,now);const s=result.state;const b=result.workspace.batches.find(b=>b.id===input.batch);const food=w.foods.find(f=>f.id===b?.food_item_id),stall=w.stalls.find(x=>x.id===food?.stall_id)
 const fingerprint=JSON.stringify(input);if(s.requests[request]){if(s.requests[request]!==fingerprint)throw new Error('Retry conflict');return s}
 if(!b||!food||!stall||!s.decisions[b.id]?.eligible||b.status!=='active'||!b.remaining_quantity||!b.advisory_deadline||Date.parse(b.advisory_deadline)-now.getTime()<=900000)throw new Error('Batch is not eligible: more than 15 minutes must remain')
 const end=Math.min(Date.parse(b.advisory_deadline)-900000,closingAt(stall.closes,stall.opens,now));const bundle=input.kind==='bogo'?2:1
 if(end<=now.getTime()||!Number.isInteger(input.units)||input.units<bundle||input.units>b.remaining_quantity||input.units%bundle||!Number.isInteger(input.value)||input.value<0)throw new Error('Check units, bundle size and closing time')
 const price=input.kind==='free'?0:input.kind==='bogo'?food.price_sen:input.kind==='fixed'?input.value:input.value<=100?Math.floor(food.price_sen*(100-input.value)/100):-1
 if(price<0||price>food.price_sen*bundle||!input.title.trim())throw new Error('Invalid discount')
 if(s.promotions.some(p=>p.batch===b.id&&p.state==='active'))throw new Error('An active offer already exists')
 const id=`offer:${request}`;s.promotions.push({id,batch:b.id,stall:stall.id,title:input.title,price,original:food.price_sen*bundle,units:input.units,bundle,ends:new Date(end).toISOString(),state:'active',request});const draft=s.drafts.find(d=>d.batch===b.id);if(draft)draft.state='confirmed';s.requests[request]=fingerprint;s.audit.push({at:now.toISOString(),kind:'hawker-confirmed-offer',batch:b.id,details:input})
 if(s.consent&&s.outbox.filter(q=>q.recipient==='fictional-nearby-shopper'&&q.expires.slice(0,10)===now.toISOString().slice(0,10)).length<3)s.outbox.push({id:`notify:${id}`,promotion:id,recipient:'fictional-nearby-shopper',state:'pending',expires:new Date(end).toISOString(),lease:null,token:null,attempts:0})
 return s
}
export function dispatch(w:VendorWorkspace,state:FreshState,now:Date):FreshState {const s=tick(w,state,now).state;for(const q of s.outbox.filter(q=>q.state==='pending')){const deliveries=s.audit.filter(a=>a.kind==='fake-delivery');if(deliveries.some(a=>now.getTime()-Date.parse(a.at)<1800000)||deliveries.filter(a=>a.at.slice(0,10)===now.toISOString().slice(0,10)).length>=3)continue;q.state='leased';q.token=crypto.randomUUID();q.lease=new Date(now.getTime()+30000).toISOString();q.attempts++;if(s.consent&&Date.parse(q.expires)>now.getTime()){q.state='delivered-simulated';s.audit.push({at:now.toISOString(),kind:'fake-delivery',batch:s.promotions.find(p=>p.id===q.promotion)?.batch??'',details:{id:q.id,attempt:q.attempts}})}}return s}
