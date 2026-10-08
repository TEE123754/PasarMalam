import type { Market } from '../data/types'
import type { VendorWorkspace } from '../vendor/model'
export const cp2Market:Market={id:'c0200000-0000-4000-8000-000000000001',kind:'farmers',name:'DEMO Pasar Tani Embun',area:'Petaling Jaya · fictional',type:'day',hours:'07:00–12:00',days:'Daily · fictional schedule',cover:'🌱',stallCount:1,status:'closed',latitude:3.12,longitude:101.61,schedules:Array.from({length:7},(_,weekday)=>({weekday,opens:'07:00',closes:'12:00',nextDay:false})),exceptions:[],popularity:0,version:0}
export function cp2Workspace(w:VendorWorkspace):VendorWorkspace {
 const id='c0200000-0000-4000-8000-000000000002'
 if(w.stalls.some(s=>s.id===id))return w
 w.stalls.push({id,market_id:cp2Market.id,name:'DEMO Kebun Pagi',category:'Fresh produce',category_id:'produce',specialty:'Seasonal vegetables',description:'Fictional farmers’ stall. Vendor-declared plant dishes; check ingredients and availability.',price_sen:400,halal:'not-declared',open:false,lot:'T01',opens:'07:00',closes:'12:00',latitude:3.1201,longitude:101.6101,photo:null,availability_confirmed_at:null})
 w.foods.push({id:'c0200000-0000-4000-8000-000000000003',stall_id:id,name:'DEMO vegetable portion',category_id:'produce',price_sen:400,ingredients:['Vegetables'],plant_diet:{vegetarian:'yes',vegan:'yes'},photo:null})
 return w
}
