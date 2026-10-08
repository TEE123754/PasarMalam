import { emptyAccounting } from './model'
import { emptyFresh, tick } from '../freshness/engine'
import { DEMO_KEY, readDemo } from '../vendor/gateway'
import { fixtureClock } from '../app/clock'
import { selectedMode } from '../app/config'
export async function seedAccountingScenario(){
 if(selectedMode()!=='fixture')throw new Error('Fictional demo only')
 return navigator.locks.request(DEMO_KEY,()=>{
 const w=readDemo(),now=fixtureClock.now(),template=w.stalls[0];if(!template)throw new Error('No demo stall')
 const id='cp5-fictional-rice-batch';if(w.batches.some(b=>b.id===id))throw new Error('Existing fictional CP5 scenario preserved')
 const stall={...template,id:'cp5-fictional-stall',name:'Fictional accounting stall'};w.stalls.push(stall)
 const food={...w.foods[0],id:'cp5-fictional-rice',stall_id:stall.id,name:'Fictional reconciliation rice',price_sen:500,ingredients:['rice'],photo:null};w.foods.push(food)
 w.batches.push({id,food_item_id:food.id,batch_number:1,prepared_at:new Date(now.getTime()-1200000).toISOString(),uploaded_at:now.toISOString(),corrected_prepared_at:null,original_quantity:30,remaining_quantity:16,advisory_deadline:null,status:'needs-information',handling:{storage:'ambient',note:'CP5 fictional accounting scenario'},photo:null})
 w.accounting??=emptyAccounting();const at=(mins:number)=>new Date(now.getTime()-mins*60000).toISOString()
 const add=(key:string,kind:'normal'|'clearance'|'donation'|'giveaway'|'discard',units:number,source:string,mins:number,original_total:number|null,total:number|null)=>w.accounting!.movements.push({id:`cp5-example:${key}`,batch:id,kind,units,source,at:at(mins),original_total,total,bundle:kind==='clearance'?2:1,basis:kind==='clearance'?'two-unit-bundle':'unit',refunded:0,disputed:false})
 add('normal','normal',4,'vendor-reported',18,2000,2000)
 for(const [index,mins] of [16,12,8].entries())add(`collection-${index}`,'clearance',2,'confirmed-collection',mins,1000,500)
 add('donation','donation',2,'confirmed-partner-collection',7,null,null);add('giveaway','giveaway',1,'vendor-reported',6,500,0);add('discard','discard',1,'vendor-reported',5,null,null)
 w.freshness??=emptyFresh(now);w.freshness.weather={id:'cp5-fictional-weather',temperature:28,humidity:75,observed:now.toISOString(),source:'fixture'};w.freshness.declarations[id]={ingredients:['rice'],confirmed:true,ambient:true};const t=tick(w,w.freshness,now);t.workspace.freshness=t.state;localStorage.setItem(DEMO_KEY,JSON.stringify(t.workspace));return id
 })
}
