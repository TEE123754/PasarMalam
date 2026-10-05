import { useEffect, useState } from 'react'
export function PwaStatus(){
 const [offline,setOffline]=useState(!navigator.onLine),[waiting,setWaiting]=useState<ServiceWorker|null>(null)
 useEffect(()=>{
  const status=()=>setOffline(!navigator.onLine)
  window.addEventListener('online',status);window.addEventListener('offline',status)
  let alive=true
  if(import.meta.env.PROD&&'serviceWorker' in navigator&&window.isSecureContext){
   void navigator.serviceWorker.register('/app-sw.js',{scope:'/'}).then(r=>{
    if(alive)setWaiting(r.waiting)
    r.addEventListener('updatefound',()=>{const w=r.installing;w?.addEventListener('statechange',()=>{if(alive&&w.state==='installed'&&navigator.serviceWorker.controller)setWaiting(r.waiting)})})
   }).catch(()=>{/* Browsing still works without worker support. */})
  }
  return()=>{alive=false;window.removeEventListener('online',status);window.removeEventListener('offline',status)}
 },[])
 return <>{offline&&<p className="pwa-status" role="status">Offline / Di luar talian · Connected actions unavailable; no writes queued. Demo information is fictional and may be stale.</p>}{waiting&&<p className="pwa-status" role="status">An app update is ready. Finish or save your current work first. <button type="button" onClick={()=>{navigator.serviceWorker.addEventListener('controllerchange',()=>window.location.reload(),{once:true});waiting.postMessage({type:'ACTIVATE_UPDATE'})}}>Update app</button></p>}</>
}
