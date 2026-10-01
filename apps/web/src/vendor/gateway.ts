import sample from '../../../../contracts/discovery-fixture.json'
import { connectedRequest } from '../auth/client'
import { fixtureClock } from '../app/clock'
import { applyCommand, type Command, type VendorWorkspace } from './model'
import type { AppMode } from '../data/types'

const KEY='pasarmalam:demo:vendor-v1'
export class SaveError extends Error { constructor(message:string, readonly definite:boolean) {super(message)} }
export function readDemo():VendorWorkspace {
  const stored=localStorage.getItem(KEY);if(stored)return JSON.parse(stored) as VendorWorkspace
  const stall=sample.stalls.find(s=>s.id==='bara-senja')!;const now=fixtureClock.now().getTime()
  return {stalls:[{id:stall.id,market_id:stall.marketId,name:stall.name,category:stall.category,specialty:stall.specialty,price_sen:stall.priceSen,halal:stall.halal as 'declared',open:stall.open,lot:'A12',opens:'17:00',closes:'22:00',latitude:3.12,longitude:101.65,photo:null}],foods:sample.menu.filter(f=>f.stallId===stall.id).map(f=>({id:f.id,stall_id:f.stallId,name:f.name,price_sen:f.priceSen,ingredients:f.ingredients,photo:null})),batches:[1,2].map(n=>({id:`satay-batch-${n}`,food_item_id:'bara-senja-dish',batch_number:n,prepared_at:new Date(now-(3-n)*1800000).toISOString(),uploaded_at:new Date(now-(3-n)*1800000+120000).toISOString(),corrected_prepared_at:null,original_quantity:12,remaining_quantity:12,advisory_deadline:new Date(now+3600000).toISOString(),status:'active',handling:{storage:'ambient',note:'Fictional prepared batch'},photo:null})),events:[],requests:{}}
}
export async function workspace(mode:AppMode):Promise<VendorWorkspace> {
  if(mode==='fixture') {const s=readDemo();if(!localStorage.getItem(KEY))localStorage.setItem(KEY,JSON.stringify(s));return s}
  const r=await connectedRequest('/api/v1/vendor/workspace');if(!r.ok)throw new Error('Vendor workspace unavailable. Sign in with your assigned vendor account.');return r.json() as Promise<VendorWorkspace>
}
export async function save(mode:AppMode,command:Command,request:string):Promise<string> {
  if(!navigator.onLine)throw new Error('Offline: draft kept on this device. No batch was saved.')
  if(mode==='fixture') {const run=()=>{try {const next=applyCommand(readDemo(),command,request,fixtureClock.now(),crypto.randomUUID());localStorage.setItem(KEY,JSON.stringify(next.workspace));return next.result}catch(error){throw new SaveError(error instanceof Error?error.message:'Demo save failed',true)}};return navigator.locks ? navigator.locks.request(KEY,run) : Promise.reject(new SaveError('This browser cannot safely coordinate demo writes. Use a browser with Web Locks.',true))}
  const r=await connectedRequest('/api/v1/vendor/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:command.kind,data:command.data,request_id:request})});if(!r.ok)throw new SaveError(r.status===409?'Retry conflicts with a previous save':'Save rejected or service unavailable. Your draft is retained.',[400,401,403,404,409,422].includes(r.status));return ((await r.json()) as {id:string}).id
}
