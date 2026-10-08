import { categoryId } from '../discovery/classifications'
import catalog from '../../../../contracts/demo-catalog.json'
import type { VendorWorkspace, VendorBatch } from '../vendor/model'
import { emptyFresh, publish, tick } from '../freshness/engine'
import { foodImage, demoImages } from '../components/demo-images'
import type { Allergens } from '../listings/declarations'

export const marketName = (name: string) => name.replace(/^DEMO\s+/i, '').replace(/\s*\([^)]*(?:demo|fictional)[^)]*\)/gi, '').replace(/\s*·\s*fictional.*$/i, '')
export const recipe = (name: string): string[] => {
  const value = name.toLowerCase()
  if (/pork|babi/.test(value)) return ['pork', 'noodles', 'egg']
  if (/satay|sate/.test(value)) return ['chicken', 'peanuts', 'sugar']
  if (/nasi|rice/.test(value)) return ['rice', 'chicken', 'egg', 'peanuts']
  if (/cendol|kuih|talam/.test(value)) return ['flour', 'coconut', 'sugar']
  if (/limau|lime|drink/.test(value)) return ['sugar']
  if (/roti|bread/.test(value)) return ['flour', 'egg', 'milk']
  if (/pisang|banana/.test(value)) return ['flour', 'sugar']
  return ['flour', 'potato']
}
export function menuAllergens(ingredients: string[]): Allergens {
  const codes: Allergens['contains'] = []
  if (ingredients.includes('peanuts')) codes.push('peanuts')
  if (ingredients.includes('egg')) codes.push('eggs')
  if (ingredients.includes('milk')) codes.push('milk')
  if (ingredients.includes('flour') || ingredients.includes('noodles')) codes.push('wheat')
  return {status: 'confirmed', contains: codes, cross_contact: 'possible'}
}
export function dishPhoto(name: string): string | null {
  const image = foodImage(name)
  return image ? `/demo/images/${demoImages[image].file}.webp` : null
}

export function seededWorkspace(now: Date): VendorWorkspace {
  const data = catalog.discovery, at = now.toISOString()
  const w: VendorWorkspace = {
    stalls: data.stalls.map((s, index) => {
      const market = data.markets.find(m => m.id === s.marketId)!
      return {
        id:s.id, market_id:s.marketId, name:marketName(s.name), category:s.category,
        category_id:categoryId(s.category) as VendorWorkspace['stalls'][number]['category_id'], specialty:marketName(s.specialty),
        description:`${marketName(s.specialty)} made in small batches at ${marketName(market.name)}. Find us at lot ${s.lot || `A${index + 1}`}; our menu includes ingredients, preparation times and portions available.`,
        declarations:{pork_free:s.halal==='non-halal'?'no':'yes', alcohol_free:'yes', muslim_owned:index % 3 === 0 ? 'yes' : 'no'},
        declarations_recorded_at:at, availability_confirmed_at:at,
        price_sen:s.priceSen, halal:s.halal==='non-halal'?'non-halal':'declared', open:true,
        lot:s.lot || `A${String(index + 1).padStart(2,'0')}`,
        opens:market.type==='night'?'17:00':'07:00', closes:market.type==='night'?'23:00':'14:00',
        latitude:(market.latitude ?? 3.1)+(index % 4)*0.00015,
        longitude:(market.longitude ?? 101.6)+(index % 3)*0.00015,
        photo:dishPhoto(s.specialty),
      }
    }),
    foods:data.menu.map(f => {
      const ingredients = recipe(f.name), plant = !ingredients.some(x => ['chicken','pork','egg','milk'].includes(x))
      return {id:f.id, stall_id:f.stallId, name:marketName(f.name), category_id:categoryId(data.stalls.find(s=>s.id===f.stallId)?.category) as VendorWorkspace['foods'][number]['category_id'],
        price_sen:f.priceSen, ingredients, allergens:menuAllergens(ingredients), allergens_recorded_at:at,
        plant_diet:{vegetarian:plant?'yes':'no', vegan:plant?'yes':'no'}, plant_diet_recorded_at:at, photo:dishPhoto(f.name)}
    }),
    batches:catalog.batches.map((b,i): VendorBatch => {
      const position=i % 5, age=position<3?[20,40,12][position]:b.ageMinutes
      return {id:i<2?`satay-batch-${i+1}`:b.id, food_item_id:b.food, batch_number:b.number,
        prepared_at:new Date(now.getTime()-age*60000).toISOString(),
        uploaded_at:new Date(now.getTime()-age*60000+60000).toISOString(), corrected_prepared_at:null,
        original_quantity:20, remaining_quantity:position<3?20:b.quantity,
        advisory_deadline:new Date(now.getTime()+(60-age)*60000).toISOString(),
        status:position<3?'active':b.status as VendorBatch['status'],
        handling:{storage:'ambient',note:'Covered service tray; separate utensils and small-batch preparation.'},
        photo:dishPhoto(data.menu.find(f=>f.id===b.food)?.name ?? ''),
      }
    }), events:[], requests:{},
  }
  const state=emptyFresh(now)
  w.handlingRecords=w.batches.filter(b=>b.status==='active').map((b,i)=>({id:`temperature-${b.id}`,batch_id:b.id,actor:'hawker',recorded_at:b.uploaded_at,data:{kind:'temperature',effective_at:b.uploaded_at,storage:null,value:28+(i%3),unit:'C',method:'Probe thermometer',source:'manual',note:'Batch service temperature recorded by the hawker.',supersedes:null}}))
  for (const b of w.batches) {
    state.declarations[b.id]={ingredients:w.foods.find(f=>f.id===b.food_item_id)!.ingredients,confirmed:true,ambient:true}
    w.events.push({batch_id:b.id,kind:'preparation-recorded',at:b.uploaded_at,details:{original_prepared_at:b.prepared_at}})
  }
  const next=tick(w,state,now); next.workspace.freshness=next.state
  const eligible=next.workspace.batches.filter(b=>b.status==='active'&&next.state.decisions[b.id]?.eligible&&Date.parse(b.advisory_deadline??'')>now.getTime()+15*60000&&next.workspace.stalls.find(s=>s.id===next.workspace.foods.find(f=>f.id===b.food_item_id)?.stall_id)?.opens==='17:00')
  for(const [i,b] of eligible.slice(0,12).entries()) {
    const food=w.foods.find(f=>f.id===b.food_item_id)!
    next.workspace.freshness=publish(next.workspace,next.workspace.freshness!,now,{batch:b.id,kind:i%3===0?'free':i%3===1?'bogo':'percentage',value:i%3===2?30:0,units:4,title:`${i%3===0?'Share a meal':i%3===1?'Buy 1, get 1':'30% evening offer'} · ${food.name}`},`DEMO-seed-offer-${i+1}`)
  }
  next.workspace.freshness.outcomes=next.workspace.stalls.slice(0,10).map((s,i)=>({batch:next.workspace.batches[i*5+4].id,units:2,grams:100+i*20,at:new Date(now.getTime()-86400000).toISOString()}))
  return next.workspace
}
