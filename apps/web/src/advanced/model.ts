export type Channel='push'|'sms'|'email'
export type Preference={id:string;name:string;cell:[number,number];radius:number;channels:Record<Channel,boolean>;quiet:[number,number]}
export type Message={id:string;recipient:string;channel:Channel;state:'queued'|'sent'|'failed'|'retried'|'suppressed';attempts:number;reason:string;expires:number}
export type Session={date:string;stall:string;sold:number;rain:number;stockout:boolean;estimatedGrams:number;weighedGrams:number;reportedSen:number;campaign:string}
export type Advanced={preferences:Preference[];inbox:Message[];history:Session[]}
export const channels:Channel[]=['push','sms','email']
const median=(a:number[])=>{const v=[...a].sort((x,y)=>x-y);return v.length%2?v[Math.floor(v.length/2)]:(v[v.length/2-1]+v[v.length/2])/2}
const weekday=(d:string)=>new Date(`${d}T12:00:00+08:00`).getUTCDay()
export function forecast(history:Session[],stall:string,date:string,rain:number){
 const samples=history.filter(s=>s.stall===stall&&s.date<date&&weekday(s.date)===weekday(date)&&!s.stockout)
 const excluded=history.filter(s=>s.stall===stall&&s.date<date&&weekday(s.date)===weekday(date)&&s.stockout).length
 if(samples.length<8)return {state:'Insufficient data' as const,samples:samples.length,excluded}
 const baseline=median(samples.map(s=>s.sold)),factor=1-Math.min(.2,Math.max(0,Number.isFinite(rain)?rain:0)/100)
 return {state:'Synthetic forecast' as const,samples:samples.length,excluded,baseline,quantity:Math.round(baseline*factor),factor,range:[Math.floor(Math.min(...samples.map(s=>s.sold))*factor),Math.ceil(Math.max(...samples.map(s=>s.sold))*factor)]}
}
export function backtest(history:Session[],stall:string){
 const rows=history.filter(s=>s.stall===stall).sort((a,b)=>a.date.localeCompare(b.date)),cut=Math.floor(rows.length*.75),train=rows.slice(0,cut),holdout=rows.slice(cut).filter(s=>!s.stockout)
 const pairs=holdout.map(s=>({actual:s.sold,forecast:forecast(train,stall,s.date,s.rain)})).filter(p=>p.forecast.state==='Synthetic forecast')
 return {train:train.length,holdout:holdout.length,scored:pairs.length,baselineMAE:pairs.length?pairs.reduce((v,p)=>v+Math.abs(p.actual-p.forecast.baseline!),0)/pairs.length:null,adjustedMAE:pairs.length?pairs.reduce((v,p)=>v+Math.abs(p.actual-p.forecast.quantity!),0)/pairs.length:null,cutoff:train.at(-1)?.date}
}
export function distance(a:[number,number],b:[number,number]){const rad=Math.PI/180,dlat=(b[0]-a[0])*rad,dlon=(b[1]-a[1])*rad;return 6371*2*Math.asin(Math.sqrt(Math.sin(dlat/2)**2+Math.cos(a[0]*rad)*Math.cos(b[0]*rad)*Math.sin(dlon/2)**2))}
export function eligibility(p:Preference,channel:Channel,now:number,expires:number,origin:[number,number]=[3.15,101.71]){
 if(!p.channels[channel])return 'Opted out'
 if(expires<=now)return 'Expired offer'
 if(distance(p.cell,origin)>p.radius)return 'Outside coarse radius'
 const hour=new Date(now+8*3600000).getUTCHours(),[start,end]=p.quiet
 if(start!==end&&(start<end?hour>=start&&hour<end:hour>=start||hour<end))return 'Quiet hours (Malaysia)'
 return null
}
export function queue(state:Advanced,channel:Channel,event:string,now:number,expires:number){const result=structuredClone(state);for(const p of result.preferences){const id=`${event}:${channel}:${p.id}`;if(result.inbox.some(m=>m.id===id))continue;const reason=eligibility(p,channel,now,expires);result.inbox.push({id,recipient:p.id,channel,state:reason?'suppressed':'queued',reason:reason??'Awaiting simulated dispatch',attempts:0,expires})}return result}
export function dispatch(state:Advanced,now:number,fail:boolean){const result=structuredClone(state);for(const m of result.inbox){if(!['queued','retried'].includes(m.state))continue;const p=result.preferences.find(p=>p.id===m.recipient),reason=p?eligibility(p,m.channel,now,m.expires):'Missing fictional recipient';if(reason){m.state='suppressed';m.reason=reason;continue}if(m.attempts>=3){m.state='suppressed';m.reason='Retry limit';continue}m.attempts++;m.state=fail?'failed':'sent';m.reason=fail?'Scripted provider failure':'Simulated delivery only; no device acknowledgement'}return result}
export function retry(state:Advanced){const result=structuredClone(state);for(const m of result.inbox)if(m.state==='failed'){m.state=m.attempts<3?'retried':'suppressed';m.reason=m.attempts<3?'Retry queued with same event ID':'Retry limit'}return result}
export function aggregate(history:Session[],from:string,to:string,stall:string,campaign:string){const rows=history.filter(s=>s.date>=from&&s.date<=to&&(stall==='all'||s.stall===stall)&&(campaign==='all'||s.campaign===campaign));return {rows,sessions:rows.length,stalls:new Set(rows.map(s=>s.stall)).size,reportedSen:rows.reduce((v,s)=>v+s.reportedSen,0),estimatedKg:rows.reduce((v,s)=>v+s.estimatedGrams,0)/1000,weighedKg:rows.reduce((v,s)=>v+s.weighedGrams,0)/1000}}
export function fixture():Advanced{
 const history:Session[]=[]
 for(let d=0;d<112;d++)for(let n=0;n<6;n++){const date=new Date(Date.UTC(2026,5,1+d)).toISOString().slice(0,10),rain=d%4===0?30:0,sold=Math.round((50+n*8+(d%7)*2)*(rain?.8:1));history.push({date,stall:`demo-stall-${n+1}`,sold,rain,stockout:d%19===0,estimatedGrams:(d%5)*150,weighedGrams:(d%5)*130,reportedSen:sold*350,campaign:d%2?'rainy':'closing'})}
 return {history,inbox:Array.from({length:30},(_,i):Message=>({id:`DEMO-history-${i}`,recipient:['demo-aya','demo-bo','demo-chen','demo-dina'][i%4],channel:channels[i%3],state:(['sent','failed','suppressed','queued','retried'] as const)[i%5],attempts:i%3,reason:'Market update delivered to the in-app inbox',expires:0})),preferences:[{id:'demo-aya',name:'Aya Rahman',cell:[3.15,101.71],radius:1.5,channels:{push:true,sms:false,email:true},quiet:[22,8]},{id:'demo-bo',name:'Bo Tan',cell:[3.16,101.71],radius:1.5,channels:{push:true,sms:true,email:false},quiet:[22,8]},{id:'demo-chen',name:'Chen Wei',cell:[3.2,101.71],radius:1.5,channels:{push:true,sms:true,email:true},quiet:[22,8]},{id:'demo-dina',name:'Dina Aziz',cell:[3.15,101.71],radius:1.5,channels:{push:false,sms:false,email:false},quiet:[22,8]}]}
}
export const scenarios=['notifications','sensors','research','ai','native','dashboards','forecast'] as const
export const readings={hot:Array.from({length:48},(_,i)=>i%13===0?null:i%11===0?52:65),cold:Array.from({length:48},(_,i)=>i%13===0?null:i%11===0?9:4),ambient:Array.from({length:48},(_,i)=>i%13===0?null:i%11===0?34:28)}
export const scripts={BM:{transcript:'Nasi lemak dua puluh bungkus, empat ringgit, masak pukul enam',dish:'Nasi lemak',quantity:20,price:4,ingredients:'rice, coconut milk (tentative)',cook:'18:00',confidence:.82},Tamil:{transcript:'இருபது இட்லி, நான்கு ரிங்கிட்',dish:'Idli',quantity:20,price:4,ingredients:'rice, lentils (tentative)',cook:'18:00',confidence:.72},Mandarin:{transcript:'二十份炒面，每份五令吉',dish:'Fried noodles',quantity:20,price:5,ingredients:'noodles, egg (tentative)',cook:'18:00',confidence:.76},Photo:{transcript:'Image placeholder: tray of curry puffs',dish:'Curry puff',quantity:12,price:2,ingredients:'potato, wheat (tentative)',cook:'unknown — confirm',confidence:.54}}
