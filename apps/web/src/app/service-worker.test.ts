import { readFileSync } from 'node:fs'
import { runInNewContext } from 'node:vm'
import { describe, expect, it } from 'vitest'
const source=readFileSync(new URL('../../public/app-sw.js',import.meta.url),'utf8')
interface FetchEvent {request:{url:string;method:string;mode:string;headers:Headers};respondWith:(v:Promise<Response>)=>void}
function worker(){
 const handlers:Record<string,(event:FetchEvent)=>void>={},matches:string[]=[]
 runInNewContext(source,{
  importScripts:()=>{},URL,Response,
  self:{location:{origin:'https://market.example'},addEventListener:(key:string,fn:(e:FetchEvent)=>void)=>{handlers[key]=fn}},
  caches:{open:async()=>({match:async(key:string)=>{matches.push(key);return new Response('offline explanation')}})},
  fetch:async()=>{throw new Error('offline')},
 })
 return {handle:handlers.fetch,matches}
}
describe('PWA privacy and offline boundaries',()=>{
 it('never intercepts private/API/third-party or write traffic',()=>{
  const w=worker();let intercepted=0
  for(const [url,method,auth] of [['https://market.example/api/v1/me','GET',false],['https://market.example/private/photo.jpg','GET',false],['https://tiles.example/1/2/3.png','GET',false],['https://market.example/assets/main.js','POST',false],['https://market.example/assets/main.js','GET',true]]){
   const headers=new Headers();if(auth)headers.set('Authorization','Bearer fictional')
   w.handle({request:{url:String(url),method:String(method),mode:'cors',headers},respondWith:()=>{intercepted++}})
  }
  expect(intercepted).toBe(0)
 })
 it('connected offline navigation gets an explanation, never a cached account page',async()=>{
  const w=worker();let response:Promise<Response>|undefined
  w.handle({request:{url:'https://market.example/sandbox/commerce',method:'GET',mode:'navigate',headers:new Headers()},respondWith:v=>{response=v}})
  expect(await (await response!)!.text()).toBe('offline explanation');expect(w.matches).toEqual(['/offline.html'])
 })
 it('only fictional navigation can fall back to the demo shell',async()=>{
  const w=worker();let response:Promise<Response>|undefined
  w.handle({request:{url:'https://market.example/demo/offers',method:'GET',mode:'navigate',headers:new Headers()},respondWith:v=>{response=v}})
  await response;expect(w.matches).toEqual(['/demo/discover'])
 })
})

async function installation(paths:unknown, size=100){
 const handlers:Record<string,(e:{waitUntil:(value:Promise<void>)=>void})=>void>={}
 const stored:string[]=[]
 runInNewContext(source,{
  importScripts:()=>{},URL,Response,
  self:{location:{origin:'https://market.example'},addEventListener:(key:string,fn:typeof handlers[string])=>{handlers[key]=fn}},
  caches:{open:async()=>({addAll:async()=>{},match:async()=>new Response(JSON.stringify(paths)),put:async(path:string)=>{stored.push(path)}})},
  fetch:async()=>new Response('x'.repeat(size)),
 })
 let pending:Promise<void>|undefined
 handlers.install({waitUntil:value=>{pending=value}})
 await pending
 return stored
}
it('preloads lazy route styles and exports without mistaking them for speech assets',async()=>{
 expect(await installation(['/assets/index-123.js','/assets/exports-123.js','/assets/Commerce-123.css'])).toEqual(['/assets/index-123.js','/assets/exports-123.js','/assets/Commerce-123.css'])
})
it('rejects a manifest containing private or speech-runtime paths',async()=>{
 for(const path of ['/api/v1/me','/private/evidence.jpg','/assets/speech.worker-123.js','/assets/ort-123.js']){
  await expect(installation([path])).rejects.toThrow('Invalid public shell manifest')
 }
})
it('rejects oversized assets instead of marking an incomplete shell installed',async()=>{
 await expect(installation(['/assets/index-123.js'],1500001)).rejects.toThrow('Public shell asset too large')
})
