import { z } from 'zod'
import categories from '../../../../contracts/food-categories.json'
export { categories }
export const categoryIds = ['rice','skewers','kuih','drinks','fried','produce'] as const
export const categorySchema = z.enum(categoryIds).nullable().optional()
export function categoryId(value?:string|null):string|null {
 return categories.find(c=>c.id===value||c.en.toLowerCase()===value?.toLowerCase()||c.aliases.some(a=>a.toLowerCase()===value?.toLowerCase()))?.id??null
}
export const plantDietSchema=z.object({vegetarian:z.enum(['unknown','yes','no']),vegan:z.enum(['unknown','yes','no'])}).strict()
export type PlantDiet=z.infer<typeof plantDietSchema>
export const unknownPlant:PlantDiet={vegetarian:'unknown',vegan:'unknown'}
export function plantStatus(value?:PlantDiet):'unknown'|'conflict'|'vegan'|'vegetarian'|'neither' {
 if(!value)return 'unknown'
 if(value.vegan==='yes'&&value.vegetarian==='no')return 'conflict'
 if(value.vegan==='yes')return 'vegan'
 if(value.vegetarian==='yes')return 'vegetarian'
 if(value.vegetarian==='no')return 'neither'
 return 'unknown'
}
export const AVAILABILITY_MAX_AGE_MINUTES=30
export function availabilityState(at:string|null|undefined,now:Date,maxAgeMinutes=AVAILABILITY_MAX_AGE_MINUTES):'unknown'|'recent'|'stale' {
 const time=Date.parse(at??'');const age=now.getTime()-time
 return !Number.isFinite(time)||age<0?'unknown':age>=Math.max(0,maxAgeMinutes)*60000?'stale':'recent'
}
export function destination(latitude:number|null|undefined,longitude:number|null|undefined):string|null {
 if(typeof latitude!=='number'||typeof longitude!=='number'||!Number.isFinite(latitude)||!Number.isFinite(longitude)||Math.abs(latitude)>90||Math.abs(longitude)>180)return null
 return `${latitude.toFixed(5)},${longitude.toFixed(5)}`
}
