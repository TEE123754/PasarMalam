/* Cache public static shell only; never API/Auth/media/weather/maps or caller data. */
importScripts('/push-sw.js');
const SHELL='pasarmalam-shell-v1';
const STATIC=['/offline.html','/manifest.webmanifest','/app-icon.svg','/demo/discover'];
self.addEventListener('install',e=>e.waitUntil((async()=>{
 const c=await caches.open(SHELL);await c.addAll(STATIC);
 const html=await (await c.match('/demo/discover')).text();
 const queue=[...html.matchAll(/(?:src|href)="(\/assets\/[^"\s]+\.(?:js|css))"/g)].map(m=>m[1]),seen=new Set();
 while(queue.length&&seen.size<30){
  const path=queue.shift();if(seen.has(path)||/speech|ort|wasm/i.test(path))continue;seen.add(path);
  const response=await fetch(path);if(!response.ok)throw new Error('Public app shell unavailable');
  const text=await response.clone().text();if(text.length>1500000)continue;await c.put(path,response);
  if(path.endsWith('.js'))for(const match of text.matchAll(/["']\.\/([^"'\/]+\.js)["']/g))queue.push('/assets/'+match[1]);
 }
})()));
self.addEventListener('activate',e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k.startsWith('pasarmalam-shell-')&&k!==SHELL)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener('message',e=>{if(e.data?.type==='ACTIVATE_UPDATE')self.skipWaiting()});
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==self.location.origin||r.headers.has('Authorization'))return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).catch(async()=>{const c=await caches.open(SHELL);return await c.match(/^\/demo(?:\/|$)/.test(u.pathname)?'/demo/discover':'/offline.html')||Response.error()}));return}
 if(!STATIC.includes(u.pathname)&&!/^\/assets\/[^/]+\.(?:js|css)$/.test(u.pathname))return;
 if(/speech|ort|wasm/i.test(u.pathname))return;
 e.respondWith((async()=>{const c=await caches.open(SHELL),hit=await c.match(r);if(hit)return hit;const response=await fetch(r),length=Number(response.headers.get('Content-Length'));if(response.ok&&response.type==='basic'&&length>0&&length<1500000)await c.put(r,response.clone());return response})());
});
