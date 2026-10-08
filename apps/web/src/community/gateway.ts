import catalog from '../../../../contracts/demo-catalog.json'
const sample=catalog.discovery
import { fixtureClock } from '../app/clock'
import { connectedRequest } from '../auth/client'
import type { AppMode } from '../data/types'
import { applyCommunity,emptyCommunity,people,project,publicCommunity,type Community,type Command,type Person } from './model'
export const COMMUNITY_KEY='pasarmalam:demo:community-v1'
export const stallMarkets=Object.fromEntries(sample.stalls.map(s=>[s.id,s.marketId]))
stallMarkets['c0200000-0000-4000-8000-000000000002']='c0200000-0000-4000-8000-000000000001'
people.find(p=>p.role==='organiser')!.market=stallMarkets['bara-senja']
export function demoPerson(){return people.find(p=>p.id===localStorage.getItem('pasarmalam:demo:community-person'))??people[0]}
export function readCommunity():Community{
 const stored=localStorage.getItem(COMMUNITY_KEY);if(stored)return JSON.parse(stored) as Community
 const s=emptyCommunity(),now=fixtureClock.now();s.operations.stalls=Object.fromEntries(sample.stalls.map(x=>[x.id,true]));s.operations.schedules=sample.markets.flatMap(m=>m.schedules.map((r,i)=>({id:`${m.id}-${i}`,market_id:m.id,weekday:r.weekday,opens_at:r.opens,closes_at:r.closes,closes_next_day:r.nextDay})));s.operations.dietary=sample.stalls.slice(0,2).map(x=>({id:`claim-${x.id}`,stall_id:x.id,status:'declared'}));s.reviews=sample.publicReviews.map((r,i)=>({id:r.id,stall:r.stallId,rating:r.rating,body:['Juicy satay and a lovely smoky flavour. The batch time was easy to check.','Friendly hawker, clear ingredients and quick collection. Will visit again.','A great evening stop. The sharing portion was just right for us.','Good value and freshly prepared. Happy to see the surplus offers.','Easy to find on the map and a welcoming neighbourhood stall.'][i%5],author:catalog.reviews[i].author,photo:'',status:'published'}))
 s.operations.stalls['c0200000-0000-4000-8000-000000000002']=true
 s.reviews.push({id:'kebun-pagi-review',stall:'c0200000-0000-4000-8000-000000000002',rating:5,body:'Fresh morning vegetables and friendly service. Easy to find at lot T01.',author:'customer-b',photo:'',status:'published'})
 s.reports=[0,1,2].map(i=>({id:`seed-report-${i}`,stall:'bara-senja',reporter:people[i].id,category:'handling',incident:new Date(now.getTime()-(i+1)*86400000).toISOString(),body:'Food trays were left uncovered during service; please review storage and handling.',evidence:i===0?['placeholder:sealed container at fictional stall']:[],status:'triaged',created:new Date(now.getTime()-3*86400000).toISOString(),summary:'Handling concern received; organiser review requested.',independent:i<2,blocked:i===2,group:i===2?'group-0':`group-${i}`,replyDue:new Date(now.getTime()+48*3600000).toISOString()}))
 for(let i=3;i<8;i++)s.reports.push({...s.reports[0],id:"seed-report-"+i,stall:sample.stalls[i].id,reporter:i%2?'customer-a':'customer-b',status:['submitted','dismissed','resolved'][i%3],independent:false,blocked:false,group:'historical-'+i,evidence:[]})
 s.events.push({id:'seed-appeal',target:'bara-senja',actor:'vendor-a',kind:'appeal',body:'Please review the stall response and updated handling procedure.',at:now.toISOString()});localStorage.setItem(COMMUNITY_KEY,JSON.stringify(s));return s
}
export async function publicData(mode:AppMode):Promise<ReturnType<typeof publicCommunity>>{if(mode==='fixture')return publicCommunity(readCommunity(),fixtureClock.now());const r=await connectedRequest('/api/v1/community/public');if(!r.ok)throw new Error('Community service unavailable.');return r.json()}
export async function communityWorkspace(mode:AppMode,p:Person){if(mode==='fixture'){const s=readCommunity();return {...project(s,p,stallMarkets),stalls:p.role==='admin'?sample.stalls.map(x=>({id:x.id,name:x.name,published:s.operations.stalls[x.id]!==false})):[],markets:p.role==='admin'?s.operations.schedules:[],dietary:p.role==='admin'?s.operations.dietary:[]}}const r=await connectedRequest('/api/v1/community/workspace');if(!r.ok)throw new Error('Community access unavailable.');return r.json() as Promise<ReturnType<typeof project>&{stalls:{id:string;name:string;published:boolean}[];markets:{id:string;market_id:string;weekday:number;opens_at:string;closes_at:string}[];dietary:{id:string;stall_id:string;status:string}[]}>}
export async function communitySave(mode:AppMode,p:Person,c:Command,request:string){
 if(!navigator.onLine)throw new Error('Offline: no community action saved.')
 if(mode==='fixture')return navigator.locks.request(COMMUNITY_KEY,()=>{const next=applyCommunity(readCommunity(),p,c,request,fixtureClock.now(),crypto.randomUUID(),stallMarkets);localStorage.setItem(COMMUNITY_KEY,JSON.stringify(next.state));return next.id})
 const {kind,...data}=c;const r=await connectedRequest('/api/v1/community/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,data,request_id:request})});if(!r.ok)throw new Error('Action denied or unavailable. Review fields and retry.');return ((await r.json()) as {id:string}).id
}
export async function uploadEvidence(file:File){if(file.size>5242880)throw new Error('Evidence exceeds 5 MB.');const r=await connectedRequest('/api/v1/community/evidence',{method:'POST',headers:{'Content-Type':file.type},body:file});if(!r.ok)throw new Error('Evidence rejected. Use text or a valid image; video needs the server validator.');return ((await r.json()) as {key:string}).key}
export async function evidenceLink(key:string){const r=await connectedRequest('/api/v1/community/evidence-access',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})});if(!r.ok)throw new Error('Private evidence access denied.');return ((await r.json()) as {url:string}).url}
