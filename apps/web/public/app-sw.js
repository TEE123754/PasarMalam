/* Cache public static shell only; never API/Auth/media/weather/maps or caller data. */
importScripts('/push-sw.js');
const SHELL='pasarmalam-shell-v1';
const STATIC=['/offline.html','/manifest.webmanifest','/app-icon.svg','/offline-assets.json','/demo/discover'];
const assetPath=path=>typeof path==='string'&&/^\/assets\/[^/]+\.(?:js|css)$/.test(path)&&!/^\/assets\/(?:speech\.worker-|ort[-.])/.test(path);
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const c=await caches.open(SHELL);await c.addAll(STATIC);
 const paths=await (await c.match('/offline-assets.json')).json();
 if(!Array.isArray(paths)||paths.length>120||paths.some(path=>!assetPath(path)))throw new Error('Invalid public shell manifest');
 for(const path of paths){
  const response=await fetch(path);if(!response.ok)throw new Error('Public app shell unavailable');
  const size=(await response.clone().arrayBuffer()).byteLength;if(size>1500000)throw new Error('Public shell asset too large');
  await c.put(path,response);
 }
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('pasarmalam-shell-')&&k!==SHELL)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('message',e=>{
 if(e.data?.type==='ACTIVATE_UPDATE')self.skipWaiting();
 if(e.data?.type==='OFFLINE_STATUS'&&e.ports?.[0])e.waitUntil((async()=>{
  try{
   const c=await caches.open(SHELL),manifest=await c.match('/offline-assets.json');
   const paths=manifest?await manifest.json():null;
   const valid=Array.isArray(paths)&&paths.length>0&&paths.length<=120&&paths.every(assetPath);
   const ready=valid&&(await Promise.all([...STATIC,...paths].map(path=>c.match(path)))).every(Boolean);
   e.ports[0].postMessage({type:'OFFLINE_STATUS',ready});
  }catch{e.ports[0].postMessage({type:'OFFLINE_STATUS',ready:false})}
 })());
});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==self.location.origin||r.headers.has('Authorization'))return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).catch(async()=>{const c=await caches.open(SHELL);return await c.match(/^\/demo(?:\/|$)/.test(u.pathname)?'/demo/discover':'/offline.html')||Response.error()}));return}
 if(!STATIC.includes(u.pathname)&&!assetPath(u.pathname))return;
 e.respondWith((async()=>{const c=await caches.open(SHELL),hit=await c.match(r);if(hit)return hit;const response=await fetch(r),length=Number(response.headers.get('Content-Length'));if(response.ok&&response.type==='basic'&&length>0&&length<1500000)await c.put(r,response.clone());return response})());
});
