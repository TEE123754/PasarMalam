import { seededWorkspace } from '../presentation/seed'
import { connectedRequest } from '../auth/client'
import { fixtureClock } from '../app/clock'
import { applyCommand, type Command, type VendorWorkspace } from './model'
import type { AppMode } from '../data/types'

export const DEMO_KEY='pasarmalam:demo:vendor-v1'
export class SaveError extends Error { constructor(message:string, readonly definite:boolean) {super(message)} }
export function readDemo(fresh=false):VendorWorkspace {
  const stored=fresh?null:localStorage.getItem(DEMO_KEY);if(stored)return JSON.parse(stored) as VendorWorkspace
  return seededWorkspace(fixtureClock.now())
}
export async function workspace(mode:AppMode):Promise<VendorWorkspace> {
  if(mode==='fixture') {const s=readDemo();if(!localStorage.getItem(DEMO_KEY))localStorage.setItem(DEMO_KEY,JSON.stringify(s));return s}
  const r=await connectedRequest('/api/v1/vendor/workspace');if(!r.ok)throw new Error('Vendor workspace unavailable. Sign in with your assigned vendor account.');return r.json() as Promise<VendorWorkspace>
}
export async function save(mode:AppMode,command:Command,request:string):Promise<string> {
  if(!navigator.onLine)throw new Error('Offline: draft kept on this device. No batch was saved.')
  if(mode==='fixture') {const run=()=>{try {const next=applyCommand(readDemo(),command,request,fixtureClock.now(),crypto.randomUUID());localStorage.setItem(DEMO_KEY,JSON.stringify(next.workspace));return next.result}catch(error){throw new SaveError(error instanceof Error?error.message:'Demo save failed',true)}};return navigator.locks ? navigator.locks.request(DEMO_KEY,run) : Promise.reject(new SaveError('This browser cannot safely coordinate demo writes. Use a browser with Web Locks.',true))}
  const r=await connectedRequest('/api/v1/vendor/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:command.kind,data:command.data,request_id:request})});if(!r.ok)throw new SaveError(r.status===409?'Retry conflicts with a previous save':'Save rejected or service unavailable. Your draft is retained.',[400,401,403,404,409,422].includes(r.status));return ((await r.json()) as {id:string}).id
}
