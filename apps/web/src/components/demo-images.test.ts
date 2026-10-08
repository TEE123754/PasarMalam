import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import assets from '../presentation/assets.json'
import { assetImage, batchDishes, batchImage, batchPhoto, demoImages, foodImage } from './demo-images'
import catalog from '../../../../contracts/demo-catalog.json'
import { seededWorkspace, withFixturePhotos } from '../presentation/seed'

describe('Representative artwork boundaries',()=>{
 it('keeps unknown dishes separate while filling every seeded menu subject',()=>{
  for(const name of ['Seafood noodles','Chicken rice','Pork satay','Unlisted dish'])expect(foodImage(name)).toBeUndefined()
  for(const food of catalog.discovery.menu)expect(foodImage(food.name),food.name).toBeDefined()
  expect(foodImage('Pork noodles')).toBe('pork')
  expect(foodImage('Nasi lemak ayam')).toBe('rice')
  expect(foodImage('Popia sayur')).toBe('popia')
 })
 it('fills context slots with sample photos without creating agency seals or certificates',()=>{
  expect(assetImage('PERSONA-01')).toBe('customerPortrait')
  expect(assetImage('PARTNER-01')).toBe('community')
  expect(assetImage('AD-01')).toBe('satayStall')
  expect(assetImage('EVIDENCE-01')).toBe('community')
  expect(assetImage('STALL-30')).toBe('riceStall')
 })
 it('maps supplied food artwork only onto the actual seeded subject',()=>{
  for(const asset of assets.filter(a=>a.id.startsWith('FOOD-'))){
   const artwork=assetImage(asset.id)
   if(artwork)expect(foodImage(asset.description)).toBe(artwork)
  }
 })
 it('ships bounded responsive WebP files for original and generated assets',()=>{
  expect(new Set(Object.values(demoImages).map(image=>image.file)).size).toBe(63)
  for(const image of Object.values(demoImages))for(const suffix of ['','-small']){
   const bytes=readFileSync(new URL(`../../public/demo/images/${image.file}${suffix}.webp`,import.meta.url))
   expect(bytes.subarray(0,4).toString()).toBe('RIFF')
   expect(bytes.subarray(8,12).toString()).toBe('WEBP')
   expect(bytes.length).toBeLessThan(250000)
  }
 })
 it('uses independent image files for three batch views of every dish',()=>{
  for(const dish of batchDishes){
   const photos=[1,2,3].map(n=>readFileSync(new URL(`../../public/demo/images/batch-${dish}-${n}.webp`,import.meta.url)).toString('base64'))
   expect(new Set(photos).size,dish).toBe(3)
  }
  expect(batchImage('Chicken satay',1)).not.toBe(batchImage('Chicken satay',2))
  expect(batchImage('Chicken satay · small',1)).not.toBe(batchImage('Chicken satay',1))
  expect(batchPhoto('Chicken satay',1,'food','batch-a')).toBe(batchPhoto('Chicken satay',1,'food','batch-a'))
 })
 it('upgrades sample photos without changing actions, timestamps or uploaded photographs',()=>{
  const w=seededWorkspace(new Date('2026-10-09T12:30:00Z')),b=w.batches[0]
  b.photo='/demo/images/pm-05-chicken-satay.webp'
  const before={prepared:b.prepared_at,uploaded:b.uploaded_at,deadline:b.advisory_deadline,status:b.status,quantity:b.remaining_quantity}
  const userPhoto='data:image/jpeg;base64,user-upload';w.batches[1].photo=userPhoto
  withFixturePhotos(w)
  expect(b.photo).toContain('/demo/images/batch-satay-1.webp')
  expect(w.batches[1].photo).toBe(userPhoto)
  expect({prepared:b.prepared_at,uploaded:b.uploaded_at,deadline:b.advisory_deadline,status:b.status,quantity:b.remaining_quantity}).toEqual(before)
 })
})
