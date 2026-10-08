import type { Draft } from './model'
import type { VendorWorkspace } from '../vendor/model'
import { number, redact } from './model'
export type Intent={stall:string|null;dish:string|null;batchNumber:number|null;bundle:boolean;unsupported:boolean;stock:boolean;quantity:number|null}
export function intent(text:string,w:VendorWorkspace):Intent {
 const t=redact(text).toLowerCase()
 const stalls=w.stalls.filter(s=>t.includes(s.name.toLowerCase()))
 const foods=w.foods.filter(f=>t.includes(f.name.toLowerCase()))
 const batch=t.match(/(?:batch|kelompok)\s*(\d+|satu|dua|tiga|empat|lima)/)
 const q=t.match(/(?:tinggal|remaining|baki|stok)\s+(dua puluh|\d+|sepuluh|sembilan|lapan|tujuh|enam|lima|empat|tiga|dua|satu|kosong|dua puluh)(?:\s+(bungkus|pack|portion|unit|batang))?/)
 return {stall:stalls.length===1?stalls[0].id:null,dish:foods.length===1?foods[0].id:null,batchNumber:batch?number(batch[1]):null,bundle:/dua seringgit|two for|\d+\s*(?:for|untuk)\s*rm|dua\s*(?:untuk|for)\s*(?:rm|ringgit)/.test(t),unsupported:/kuali kedua|deadline|expiry|extend|padam|delete|safe badge|ignore|system prompt/.test(t),stock:/tinggal|remaining|baki|stok|stock/.test(t),quantity:q?(q[1]==='kosong'?0:number(q[1])):null}
}
export type Review={stall:string;food:string;batch:string;action:Draft['action'];quantity:number|null;unit:Draft['unit'];price:number|null;ingredients:string[];cooked:string|null;priceResolved:boolean;dateResolved:boolean}
export function questions(v:Review,w:VendorWorkspace,now:Date,h:Intent):string[]{
 const out:string[]=[];const food=w.foods.find(f=>f.id===v.food&&f.stall_id===v.stall)
 if(!w.stalls.some(s=>s.id===v.stall))out.push('Choose the exact stall.')
 if(!food)out.push('Choose the exact dish; duplicate names require an ID choice.')
 if(h.unsupported||v.action==='unsupported')out.push('Timer changes and ambiguous second-pan instructions are unsupported. Start a new explicit draft.')
 if(v.action==='update_stock'){
  const b=w.batches.find(b=>b.id===v.batch&&b.food_item_id===food?.id)
  if(!b)out.push('Choose the exact existing batch.')
  if(b&&(!['active','needs-information'].includes(b.status)||b.remaining_quantity===null||b.advisory_deadline&&Date.parse(b.advisory_deadline)<=now.getTime()))out.push('This batch is closed, expired or has unknown stock. Refresh and choose an active batch.')
  if(v.quantity===null||!Number.isInteger(v.quantity)||v.quantity<0||v.quantity>100000||b&&b.remaining_quantity!==null&&v.quantity>b.remaining_quantity)out.push('Enter remaining stock, no greater than the current count.')
  if(!v.unit)out.push('Choose the quantity unit.')
 }else{
  if(v.price===null||!Number.isSafeInteger(v.price)||v.price<0||v.price>100000000||!v.priceResolved)out.push('Confirm the price for ONE listed menu unit; clarify bundle pricing first.')
  if(!v.ingredients.length||v.ingredients.some(x=>!x.trim()||x.length>80)||v.ingredients.length>40)out.push('Review and supply ingredients.')
  if(v.action==='create_batch'){
   if(v.quantity===null||!Number.isInteger(v.quantity)||v.quantity<1||v.quantity>100000||!v.unit)out.push('Confirm quantity and unit for the new batch.')
   if(!v.cooked||!Number.isFinite(Date.parse(v.cooked))||Date.parse(v.cooked)>now.getTime()||!v.dateResolved)out.push('Choose and confirm the preparation date and AM/PM in Malaysia time.')
  }
 }
 return out
}
export function readback(v:Review,w:VendorWorkspace,locale:string):string{
 const stall=w.stalls.find(s=>s.id===v.stall)?.name??'?',food=w.foods.find(f=>f.id===v.food)?.name??'?',b=w.batches.find(b=>b.id===v.batch)
 const time=v.cooked?new Intl.DateTimeFormat(locale==='ms'?'ms-MY':'en-MY',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(v.cooked)):'?'
 return locale==='ms'?`${stall}. ${food}. ${v.action==='update_stock'?`Kelompok ${b?.batch_number??'?'}. Baki ${v.quantity??'?'} ${v.unit??'?'}. Masa asal tidak berubah.`:`${v.action==='update_food'?'Kemas kini menu sahaja':'Kelompok baharu'}. RM ${((v.price??0)/100).toFixed(2)} setiap item. Bahan: ${v.ingredients.join(', ')}. ${v.action==='create_batch'?`${v.quantity??'?'} ${v.unit??'?'}. Disediakan ${time}. Penyimpanan suhu bilik.`:''}`}`:`${stall}. ${food}. ${v.action==='update_stock'?`Batch ${b?.batch_number??'?'}. ${v.quantity??'?'} ${v.unit??'?'} remaining. Original time unchanged.`:`${v.action==='update_food'?'Menu update only':'New batch'}. RM ${((v.price??0)/100).toFixed(2)} per menu unit. Ingredients: ${v.ingredients.join(', ')}. ${v.action==='create_batch'?`${v.quantity??'?'} ${v.unit??'?'}. Prepared ${time}. Ambient handling.`:''}`}`
}
export function matchingVoice(voices:{lang:string}[],locale:string){return voices.find(v=>v.lang.toLowerCase().startsWith(locale==='ms'?'ms':'en'))??null}
