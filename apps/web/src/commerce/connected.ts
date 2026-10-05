import { connectedRequest } from '../auth/client'
import type { Actor, Action, Campaign } from './model'
import type { view } from './gateway'
export interface CommerceView extends ReturnType<typeof view> { actors:Actor[];server_now:string;targets:{id:string;name:string;marketId:string;category:string}[] }
export async function connectedView():Promise<CommerceView>{const r=await connectedRequest('/api/v1/commerce/workspace');if(!r.ok)throw new Error('Commercial sandbox unavailable. Configure the disposable project and sign in with an assigned account.');return r.json() as Promise<CommerceView>}
export class CommerceError extends Error {constructor(message:string,readonly definite:boolean){super(message)}}
export async function connectedCommand(action:Action,key:string){const r=await connectedRequest('/api/v1/commerce/command',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,request_id:key})});if(!r.ok)throw new CommerceError(r.status===409?'Retry key conflict':'Commercial action rejected or unavailable. Stock, role and timing are checked by the server.',[400,401,403,409,422,429].includes(r.status))}
export async function connectedAds():Promise<Campaign[]>{const r=await connectedRequest('/api/v1/commerce/ads');if(!r.ok)throw new Error('Ad previews unavailable');return r.json() as Promise<Campaign[]>}
