import { emptyCommerce, type Commerce, type Order } from './model'
import type { VendorWorkspace } from '../vendor/model'
export function commerceFixture(now:Date,w?:VendorWorkspace):Commerce {
 const s=emptyCommerce(),created=new Date(now.getTime()-86400000).toISOString(),stalls=w?.stalls.map(s=>s.id)??['bara-senja','roti-pelita','kuih-senja','manis-bulan','fictional-archived-stall']
 s.orders=Array.from({length:24},(_,n):Order=>{const live=n>=16&&w?.freshness?.promotions[(n-16)%4],stall=live?live.stall:stalls[n%stalls.length],total=400+(n%4)*100,done=n<12,status=live?(n%2?'accepted':'reserved'):done?'completed':(['cancelled','rejected','failed','expired'] as const)[n%4];return {id:`DEMO-ARCHIVE-${n+1}`,owner:n%2?'shopper-b':'shopper-a',stall,market:w?.stalls.find(s=>s.id===stall)?.market_id??'seri-pelita',batch:live?live.batch:`DEMO-ARCHIVED-BATCH-${n+1}`,offer:live?live.id:`DEMO-ARCHIVED-OFFER-${n+1}`,units:1,total:live?live.price:total,expires:live?new Date(Math.min(now.getTime()+120000,Date.parse(live.ends))).toISOString():created,status,fulfilment:n<8||n>=16&&n%2===0?'delivery':'pickup',payment:n%3?'stall':'future',paid:done,vendorConfirmed:done,customerConfirmed:done,code:`DEMO-ARCHIVE-${n+1}`,courier:n<8||n>=16&&n%2===0?(n%2?'rider-b':'rider-a'):null,delivery:n<8?'arrived':n>=16?'assigned':'cancelled',eta:60,refunded:n<6?total:0,disputed:false,commission:done&&n>=6?Math.floor(total*.03):0,rate:300,created:live?now.toISOString():created}})
 for(const o of s.orders){if(o.status==='completed'){s.ledger.push({id:`collection:${o.id}`,order:o.id,kind:'collection',amount:o.total,at:created});if(o.refunded)s.ledger.push({id:`refund:${o.id}`,order:o.id,kind:'refund',amount:-o.refunded,at:created});if(o.commission)s.ledger.push({id:`commission:${o.id}`,order:o.id,kind:'commission',amount:o.commission,at:created})}s.events.push(`DEMO payment-attempt-${o.id}: ${o.paid?'historical fictional success':o.status==='failed'?'fictional failure':'pending / no payment'}`)}
 for(let n=0;n<8;n++){const status=(['approved','pending','rejected','paused'] as const)[n%4];s.campaigns.push({id:`DEMO-CAMPAIGN-${n}`,owner:'brand-a',stall:'bara-senja',market:'seri-pelita',category:'Skewers',radius:5,start:now.toISOString(),end:new Date(now.getTime()+86400000).toISOString(),budget:1000,spent:n===4?1000:n===0?105:0,status,placement:(['sponsored','banner','native','interstitial'] as const)[n%4],description:`AD-${n%6+1} · Fictional lantern-lit stall artwork; user image pending`,approved:status==='approved',impressions:n===0?80:0,clicks:n===0?5:0})}
 for(let n=0;n<8;n++)s.subscriptions[n===0?'hawker-a':`DEMO-subscriber-${n}`]=(['free','premium','renewal-failed'] as const)[n%3]
 s.advertisers={ 'brand-a':{name:'Farah Lim',business:'Rasa Senja Brands'}, 'hawker-a':{name:'Aiman',business:'Bara Senja Satay'} }
 s.subscriptions['hawker-a']='premium'; s.subscriptions['council-a']='premium'
 s.balance['shopper-a']=100000; s.balance['shopper-b']=75000
 for(const [i,c] of s.campaigns.entries()) {
   c.description='Evening satay, small batches and neighbourhood flavour.'
   c.category=w?.stalls.find(stall=>stall.id===c.stall)?.category??c.category
   if(i<4){c.status='approved';c.approved=true}
 }
 return s
}

