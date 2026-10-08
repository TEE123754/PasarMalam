import type { Market } from '../data/types'
import type { VendorWorkspace } from '../vendor/model'
import { batchPhoto, demoImages } from '../components/demo-images'
export const cp2Market:Market={id:'c0200000-0000-4000-8000-000000000001',kind:'farmers',name:'Pasar Tani Embun',area:'Petaling Jaya, Selangor',type:'day',hours:'07:00–12:00',days:'Every day',cover:'🌱',stallCount:1,status:'closed',latitude:3.12,longitude:101.61,schedules:Array.from({length:7},(_,weekday)=>({weekday,opens:'07:00',closes:'12:00',nextDay:false})),exceptions:[],popularity:0,version:0}
export function cp2Workspace(w:VendorWorkspace):VendorWorkspace {
 const id='c0200000-0000-4000-8000-000000000002'
 if(w.stalls.some(s=>s.id===id))return w
 const at=w.batches[0]?.uploaded_at??new Date().toISOString()
 w.stalls.push({id,market_id:cp2Market.id,name:'Kebun Pagi',category:'Fresh produce',category_id:'produce',specialty:'Seasonal vegetables',description:'Locally grown vegetables, hand-packed each morning. Find us at lot T01.',declarations:{pork_free:'yes',alcohol_free:'yes',muslim_owned:'no'},declarations_recorded_at:at,price_sen:400,halal:'declared',open:false,lot:'T01',opens:'07:00',closes:'12:00',latitude:3.1201,longitude:101.6101,photo:`/demo/images/${demoImages.produce.file}.webp`,availability_confirmed_at:at})
 w.foods.push({id:'c0200000-0000-4000-8000-000000000003',stall_id:id,name:'Seasonal vegetable portion',category_id:'produce',price_sen:400,ingredients:['Potato'],allergens:{status:'confirmed',contains:[],cross_contact:'possible'},allergens_recorded_at:at,plant_diet:{vegetarian:'yes',vegan:'yes'},plant_diet_recorded_at:at,photo:`/demo/images/${demoImages.produce.file}.webp`})
 const now=Date.parse(w.batches[0]?.prepared_at??at)+20*60000
 w.batches.push({id:'kebun-pagi-batch-1',food_item_id:'c0200000-0000-4000-8000-000000000003',batch_number:1,prepared_at:new Date(now-5*60000).toISOString(),uploaded_at:new Date(now-4*60000).toISOString(),corrected_prepared_at:null,original_quantity:30,remaining_quantity:18,advisory_deadline:new Date(now+25*60000).toISOString(),status:'active',handling:{storage:'ambient',note:'Packed morning vegetables with covered service containers.'},photo:batchPhoto('Seasonal vegetable portion',1,'c0200000-0000-4000-8000-000000000003','kebun-pagi-batch-1')})
 if(w.freshness)w.freshness.declarations['kebun-pagi-batch-1']={ingredients:['potato'],confirmed:true,ambient:true}
 return w
}
