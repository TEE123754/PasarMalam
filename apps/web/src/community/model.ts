export type Person={id:string;name:string;verified:boolean;role:'customer'|'vendor'|'organiser'|'admin';market?:string;stall?:string}
export type Review={id:string;stall:string;author:string;rating:number;body:string;photo:string;status:'pending'|'published'|'hidden'}
export type Report={id:string;stall:string;reporter:string;category:string;incident:string;body:string;evidence:string[];status:string;created:string;summary:string;independent:boolean;blocked:boolean;group:string;replyDue:string}
export type Event={id:string;target:string;actor:string;kind:string;body:string;at:string}
export type Flag={stall:string;expires:string;reply:string;reason:string}
export type Community={reviews:Review[];reports:Report[];events:Event[];flags:Flag[];replies:{stall:string;body:string;approved:boolean}[];requests:Record<string,{hash:string;id:string}>;counters:{actor:string;at:string;kind:string}[];operations:{stalls:Record<string,boolean>;schedules:{id:string;market_id:string;weekday:number;opens_at:string;closes_at:string;closes_next_day:boolean}[];dietary:{id:string;stall_id:string;status:string}[]}}
export type Command={kind:string;target?:string;stall?:string;rating?:number;body?:string;photo?:string;category?:string;incident?:string;evidence?:string[];summary?:string;independent?:boolean;blocked?:boolean;group?:string;status?:string;reason?:string;market?:string;published?:boolean;weekday?:number;opens?:string;closes?:string;next_day?:boolean}
export const people:Person[]=[{id:'customer-a',name:'Aina Rahman',verified:true,role:'customer'},{id:'customer-b',name:'Ben Tan',verified:true,role:'customer'},{id:'customer-c',name:'Chong Wei',verified:true,role:'customer'},{id:'unverified',name:'New community visitor',verified:false,role:'customer'},{id:'vendor-a',name:'Aiman · Bara Senja',verified:true,role:'vendor',stall:'bara-senja'},{id:'organiser-a',name:'Farah · Market organiser',verified:true,role:'organiser',market:'taman-connaught'},{id:'admin-a',name:'Nur · Community moderator',verified:true,role:'admin'}]
export function emptyCommunity():Community{return {reviews:[],reports:[],events:[],flags:[],replies:[],requests:{},counters:[],operations:{stalls:{},schedules:[],dietary:[]}}}
export function cleanSummary(value:string){return value.replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,'[redacted]').replace(/(?:\+?6?0[\s-]?)?\d[\d\s-]{8,}\d/g,'[redacted]')}
export function eligibleReports(s:Community,stall:string,now:Date){const rows=s.reports.filter(r=>r.stall===stall&&r.independent&&!r.blocked&&!['dismissed'].includes(r.status)&&Date.parse(r.created)>now.getTime()-14*86400000);const seen=new Set<string>(),groups=new Set<string>();return rows.filter(r=>{if(seen.has(r.reporter)||!r.group||groups.has(r.group))return false;seen.add(r.reporter);groups.add(r.group);return true})}
export function publicCommunity(s:Community,now:Date){return {reviews:s.reviews.filter(r=>r.status==='published'&&s.operations.stalls[r.stall]!==false).map(({id,stall,rating,body,photo})=>({id,stall,rating,body,photo})),flags:s.flags.filter(f=>Date.parse(f.expires)>now.getTime()&&s.operations.stalls[f.stall]!==false&&eligibleReports(s,f.stall,now).length>=3).map(f=>({stall:f.stall,expires:f.expires,reply:s.replies.find(r=>r.stall===f.stall&&r.approved)?.body??''}))}}
export function project(s:Community,p:Person,markets:Record<string,string>){const admin=p.role==='admin';const own=s.reports.filter(r=>admin||r.reporter===p.id);const redacted=s.reports.filter(r=>r.summary&&p.role==='vendor'&&p.stall===r.stall||p.role==='organiser'&&p.market===markets[r.stall]).map(r=>({id:r.id,stall:r.stall,category:r.category,status:r.status,summary:r.summary||'Confidential report pending review.',replyDue:r.replyDue}));const targets=new Set(own.map(r=>r.id));return {reviews:s.reviews.filter(r=>admin||r.author===p.id),reports:own,redacted,events:s.events.filter(e=>admin||targets.has(e.target)).map(({id,target,kind,body,at})=>({id,target,kind,body,at})),flags:admin?s.flags:[],replies:s.replies.filter(r=>admin||r.stall===p.stall)}}
export function applyCommunity(state:Community,p:Person,c:Command,request:string,now:Date,id:string,markets:Record<string,string>):{state:Community;id:string}{
 const s=structuredClone(state),hash=JSON.stringify(c),prior=s.requests[`${p.id}:${request}`];if(prior){if(prior.hash!==hash)throw new Error('Retry conflicts with an earlier action.');return {state:s,id:prior.id}}
 const admin=()=>{if(p.role!=='admin')throw new Error('Moderator access required.')};const customer=()=>{if(p.role!=='customer'||!p.verified)throw new Error('Verified customer account required.')};const vendor=(stall:string)=>{if(p.role!=='vendor'||p.stall!==stall)throw new Error('Stall owner access required.')};const stall=c.stall??'';const report=s.reports.find(r=>r.id===c.target);let result=id;const body=c.body?.trim()??'';const at=now.toISOString();const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).format(now)
 if(!request||!Number.isFinite(now.getTime()))throw new Error('Invalid action context.')
 if(s.counters.filter(x=>x.actor===p.id&&Date.parse(x.at)>now.getTime()-3600000).length>=30)throw new Error('Action rate limit reached.')
 if(c.kind==='review'){
  customer();if(p.stall===stall||!markets[stall]||s.operations.stalls[stall]===false)throw new Error('Self-review or unavailable stall.')
  if(!Number.isInteger(c.rating)||c.rating!<1||c.rating!>5||!body||body.length>1500)throw new Error('Check review fields.')
  if(s.counters.filter(x=>x.actor===p.id&&x.kind==='review'&&new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(x.at))===day).length>=5)throw new Error('Review rate limit reached.')
  const old=s.reviews.find(r=>r.author===p.id&&r.stall===stall);result=old?.id??id;const next:Review={id:result,stall,author:p.id,rating:c.rating!,body,photo:(c.photo??'').slice(0,200),status:'pending'};s.reviews=s.reviews.filter(r=>r.id!==result).concat(next)
 }else if(c.kind==='report'){
  customer();if(!markets[stall]||s.operations.stalls[stall]===false||body.length<10||body.length>2000||!['hygiene','handling','misleading','other','spoiled-food','pests','cross-contamination','unhygienic-handling'].includes(c.category??'')||!c.incident||!Number.isFinite(Date.parse(c.incident))||Date.parse(c.incident)>now.getTime()||(c.evidence?.length??0)>3)throw new Error('Check complaint fields.')
  const minute=new Date(Math.floor(Date.parse(c.incident)/60000)*60000).toISOString();const old=s.reports.find(r=>r.reporter===p.id&&r.stall===stall&&r.incident===minute&&r.status!=='dismissed')
  if(old){old.body=body;old.category=c.category!;old.status='submitted';old.evidence=c.evidence??[];old.independent=false;old.summary='';old.group='';old.replyDue=new Date(now.getTime()+48*3600000).toISOString();result=old.id}
  else{if(s.reports.filter(r=>r.reporter===p.id&&new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(r.created))===day).length>=3)throw new Error('Three new reports per day maximum.');s.reports.push({id,stall,reporter:p.id,category:c.category!,incident:minute,body,evidence:c.evidence??[],status:'submitted',created:at,summary:'',independent:false,blocked:false,group:'',replyDue:new Date(now.getTime()+48*3600000).toISOString()})}
 }else if(c.kind==='followup'){
  if(!report||report.reporter!==p.id||body.length<1||body.length>2000)throw new Error('Reporter access required.');result=report.id
 }else if(c.kind==='triage'){
  if(!report||!(p.role==='admin'||p.role==='organiser'&&p.market===markets[report.stall]))throw new Error('Market moderation access required.')
  if(!c.summary||!c.reason)throw new Error('Approved redacted summary and reason required.');report.summary=cleanSummary(c.summary).slice(0,500);report.status='triaged';if(p.role==='admin'){report.independent=!!c.independent;report.blocked=!!c.blocked;report.group=c.group??''}result=report.id
 }else if(c.kind==='status'){
  admin();if(!report||!['triaged','dismissed','escalated'].includes(c.status??'')||!c.reason)throw new Error('Check moderation decision.');report.status=c.status!;if(c.status==='dismissed')report.independent=false;result=report.id
 }else if(c.kind==='reply'||c.kind==='appeal'){
  vendor(stall);if(!body||body.length>1000)throw new Error('Reply required.');if(c.kind==='reply'){s.replies=s.replies.filter(r=>r.stall!==stall).concat({stall,body,approved:false})}result=stall
 }else if(c.kind==='approve_reply'){
  admin();const reply=s.replies.find(r=>r.stall===stall);if(!reply||!c.reason)throw new Error('Reply and moderation reason required.');reply.body=cleanSummary(reply.body);reply.approved=true;result=stall
 }else if(c.kind==='flag'){
  admin();const eligible=eligibleReports(s,stall,now);if(eligible.length<3||eligible.some(r=>Date.parse(r.replyDue)>now.getTime())||!c.reason)throw new Error('Flag requires three independent reviewed reports and the 48-hour reply opportunity.');const expiry=Math.min(...eligible.map(r=>Date.parse(r.created)+14*86400000));s.flags=s.flags.filter(f=>f.stall!==stall).concat({stall,expires:new Date(expiry).toISOString(),reason:c.reason,reply:''});result=stall
 }else if(c.kind==='remove_flag'){
  admin();if(!c.reason)throw new Error('Moderation reason required.');s.flags=s.flags.filter(f=>f.stall!==stall);result=stall
 }else if(c.kind==='review_status'){
  admin();const review=s.reviews.find(r=>r.id===c.target);if(!review||!['published','hidden'].includes(c.status??'')||!c.reason)throw new Error('Check review decision.');review.status=c.status as Review['status'];result=review.id
 }else if(c.kind==='review_report'){
  customer();if(!s.reviews.some(r=>r.id===c.target&&r.status==='published')||!body)throw new Error('Published review and reason required.');result=c.target!
 }else if(c.kind==='referral'){
  admin();if(!report||!report.summary||!c.reason)throw new Error('Approved redacted summary required.');result=report.id
 }else if(['stall_status','schedule','dietary'].includes(c.kind)){
  admin();if(!c.reason)throw new Error('Moderation reason required.');result=c.target??c.stall??c.market??id
  if(c.kind==='stall_status'){if(!markets[stall]||typeof c.published!=='boolean')throw new Error('Stall unavailable.');s.operations.stalls[stall]=c.published}
  if(c.kind==='schedule'){const row=s.operations.schedules.find(r=>r.market_id===c.market&&r.weekday===c.weekday);if(!row||![c.opens,c.closes].every(t=>typeof t==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t)))throw new Error('Invalid schedule.');row.opens_at=c.opens!;row.closes_at=c.closes!;row.closes_next_day=!!c.next_day}
  if(c.kind==='dietary'){const row=s.operations.dietary.find(r=>r.id===c.target);if(!row||!['declared','non-halal','not-declared'].includes(c.status??''))throw new Error('Certification requires separate evidence review.');row.status=c.status!}
 }else throw new Error('Unsupported community action.')
 const auditBody=c.kind==='referral'&&report?JSON.stringify({mode:'simulated',destination:'fictional-authority',stall:report.stall,category:report.category,incident:report.incident,approved_summary:report.summary}):cleanSummary(c.reason??body)
 s.events.push({id,target:result,actor:p.id,kind:c.kind,body:auditBody,at});s.counters.push({actor:p.id,at,kind:c.kind});s.requests[`${p.id}:${request}`]={hash,id:result};return {state:s,id:result}
}
