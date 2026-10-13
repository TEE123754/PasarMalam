import { describe,it,expect } from 'vitest'
import { fallback } from './model'
import { intent,questions,readback,matchingVoice,type Review } from './workflow'
import { cp2Workspace } from '../discovery/cp2-fixture'
const w=cp2Workspace({stalls:[],foods:[],batches:[],events:[],requests:{}}),now=new Date('2026-10-08T18:00:00+08:00')
const food=w.foods[0],stall=w.stalls[0]
w.batches.push({id:'b',food_item_id:food.id,batch_number:1,prepared_at:'2026-10-08T17:00:00+08:00',uploaded_at:'2026-10-08T17:01:00+08:00',corrected_prepared_at:null,original_quantity:20,remaining_quantity:20,advisory_deadline:'2026-10-08T19:00:00+08:00',status:'active',handling:{storage:'ambient',note:''},photo:null})
const v:Review={stall:stall.id,food:food.id,batch:'b',action:'create_batch',quantity:10,unit:'pack',price:400,ingredients:['Vegetables'],cooked:'2026-10-08T17:00:00+08:00',priceResolved:true,dateResolved:true}
const h=intent('',w)
describe('CP3 clarification and references',()=>{
 it('parses English batch/stock words and excludes a batch explicitly left unchanged',()=>{
  const x=intent('Update chicken satay batch two to nine remaining sticks. Do not change batch one.',w)
  expect(x).toMatchObject({batchNumber:2,quantity:9,stock:true})
  expect(intent('batch one or batch two tinggal five',w).batchNumber).toBeNull()
  expect(intent('thirty sticks, five for five ringgit',w).bundle).toBe(true)
  expect(intent('24 biji, tiga biji dua ringgit',w).bundle).toBe(true)
 })
 it('resolves only uniquely named owned references and explicit batch numbers',()=>{const x=intent(`${stall.name} ${food.name} batch 1 tinggal sepuluh bungkus`,w);expect(x).toMatchObject({stall:stall.id,dish:food.id,batchNumber:1,stock:true,quantity:10});expect(intent('Foreign batch 9',w).dish).toBeNull()})
 it('requires ID selection for duplicate names',()=>{const duplicate={...w,foods:[food,{...food,id:'duplicate'}]};expect(intent(food.name,duplicate).dish).toBeNull();expect(questions({...v,food:'not-owned'},w,now,h)).not.toHaveLength(0)})
 it('never fabricates batch 2 from kuali kedua or accepts timer edits',()=>{const x=intent('Kuali kedua dah siap',w);expect(x.unsupported).toBe(true);expect(x.batchNumber).toBeNull();expect(questions(v,w,now,x)).not.toHaveLength(0);expect(intent('extend deadline',w).unsupported).toBe(true)})
 it.each(['dua seringgit','two for RM1','2 for RM1'])('requires explicit unit-price clarification for %s',text=>{expect(intent(text,w).bundle).toBe(true);expect(fallback(text,[food],now).draft.price_sen).toBeNull();expect(questions({...v,priceResolved:false},w,now,h)).not.toHaveLength(0)})
 it('remaining stock never implies a newly cooked batch',()=>{expect(fallback(`${food.name} tinggal sepuluh bungkus`,[food],now).draft.action).toBe('update_stock');expect(intent('tinggal dua puluh bungkus',w).quantity).toBe(20)})
 it('blocks missing AM/PM/date and future clocks until reviewed',()=>{expect(fallback(`${food.name} siap pukul 6`,[food],now).draft.cook_time).toBeNull();expect(questions({...v,dateResolved:false},w,now,h)).not.toHaveLength(0);expect(questions({...v,cooked:'2099-01-01T00:00:00Z'},w,now,h)).not.toHaveLength(0)})
 it('menu-only confirmation creates no new time requirement',()=>{expect(questions({...v,action:'update_food',cooked:null,quantity:null,dateResolved:false},w,now,h)).toEqual([])})
 it.each(['foreign','missing'])('blocks %s batch IDs',batch=>expect(questions({...v,action:'update_stock',batch},w,now,h)).not.toHaveLength(0))
 it.each([null,-1,21,1.2])('blocks invalid remaining stock %s',quantity=>expect(questions({...v,action:'update_stock',quantity},w,now,h)).not.toHaveLength(0))
 it('allows zero remaining and rejects closed/unknown batches',()=>{expect(questions({...v,action:'update_stock',quantity:0},w,now,h)).toEqual([]);expect(questions({...v,action:'update_stock'},{...w,batches:w.batches.map(b=>({...b,remaining_quantity:null}))},now,h)).not.toHaveLength(0)})
 it('readback is short, bilingual and does not invent safety',()=>{expect(readback(v,w,'en')).toContain('New batch');expect(readback(v,w,'ms')).toContain('Kelompok baharu');expect(readback({...v,action:'update_stock'},w,'en')).toContain('Original time unchanged');expect(readback(v,w,'en')).not.toContain('safe')})
 it('missing matching voice yields text fallback rather than another language',()=>{expect(matchingVoice([{lang:'en-US'}],'ms')).toBeNull();expect(matchingVoice([{lang:'ms-MY'}],'ms')).toEqual({lang:'ms-MY'})})
})
