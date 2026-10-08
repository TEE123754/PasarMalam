import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import assets from '../presentation/assets.json'
import { assetImage, demoImages, foodImage } from './demo-images'

describe('Representative artwork boundaries',()=>{
 it('keeps unknown dishes and distinct preparations as placeholders',()=>{
  for(const name of ['Seafood noodles','Chicken rice','Fried rice','Pork satay','Curry puff','Unlisted dish'])expect(foodImage(name)).toBeUndefined()
  expect(foodImage('Pork noodles')).toBe('pork')
  expect(foodImage('Nasi lemak ayam')).toBe('rice')
  expect(foodImage('Popia sayur')).toBe('popia')
 })
 it('does not invent people, agency marks or evidence imagery',()=>{
  for(const id of ['PERSONA-01','PARTNER-01','AD-01','EVIDENCE-01','STALL-30'])expect(assetImage(id)).toBeUndefined()
 })
 it('maps supplied food artwork only onto the actual seeded subject',()=>{
  for(const asset of assets.filter(a=>a.id.startsWith('FOOD-'))){
   const artwork=assetImage(asset.id)
   if(artwork)expect(foodImage(asset.description)).toBe(artwork)
  }
 })
 it('ships bounded responsive WebP files for all twelve originals',()=>{
  expect(Object.keys(demoImages)).toHaveLength(12)
  for(const image of Object.values(demoImages))for(const suffix of ['','-small']){
   const bytes=readFileSync(new URL(`../../public/demo/images/${image.file}${suffix}.webp`,import.meta.url))
   expect(bytes.subarray(0,4).toString()).toBe('RIFF')
   expect(bytes.subarray(8,12).toString()).toBe('WEBP')
   expect(bytes.length).toBeLessThan(250000)
  }
 })
})
