import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { offlineReady } from './offline-status'
export function PwaStatus(){
 const [offline,setOffline]=useState(!navigator.onLine),[waiting,setWaiting]=useState<ServiceWorker|null>(null)
 const [readiness,setReadiness]=useState<'preparing'|'ready'|'unconfirmed'|'unsupported'>('preparing')
 const { i18n }=useTranslation()
 const bm=i18n.language.startsWith('ms')
 useEffect(()=>{
  const status=()=>setOffline(!navigator.onLine)
  window.addEventListener('online',status);window.addEventListener('offline',status)
  let alive=true
  const check=()=>{const worker=navigator.serviceWorker?.controller;if(worker)void offlineReady(worker).then(ready=>{if(alive)setReadiness(ready?'ready':'unconfirmed')})}
  if(import.meta.env.PROD&&'serviceWorker' in navigator&&window.isSecureContext){
   navigator.serviceWorker.addEventListener('controllerchange',check)
   void navigator.serviceWorker.register('/app-sw.js',{scope:'/'}).then(r=>{
    if(alive)setWaiting(r.waiting)
    check()
    r.addEventListener('updatefound',()=>{const w=r.installing;w?.addEventListener('statechange',()=>{if(alive&&w.state==='installed'&&navigator.serviceWorker.controller)setWaiting(r.waiting)})})
   }).catch(()=>{if(alive)setReadiness('unconfirmed')})
  }else{
   // Development previews do not install a worker; production requires a secure supported browser.
   queueMicrotask(()=>{if(alive)setReadiness('unsupported')})
  }
  const setupTimer=setTimeout(()=>{if(alive)setReadiness(state=>state==='preparing'?'unconfirmed':state)},15000)
  return()=>{alive=false;clearTimeout(setupTimer);window.removeEventListener('online',status);window.removeEventListener('offline',status);navigator.serviceWorker?.removeEventListener('controllerchange',check)}
 },[])
 const messages={
  preparing:bm?'Menyediakan pelayaran luar talian…':'Preparing offline browsing…',
  ready:bm?'Pelayaran luar talian sedia. Peta dan tindakan akaun menggunakan sambungan internet.':'Offline browsing ready. Maps and account actions use your internet connection.',
  unconfirmed:bm?'Kesediaan luar talian belum dapat disahkan. Kekalkan internet untuk memuat semula; pelayaran masih tersedia.':'Offline readiness could not be confirmed. Keep internet access for reloads; browsing remains available.',
  unsupported:bm?'Muat semula luar talian tidak tersedia dalam pelayar ini. Gunakan pelayar yang disokong dan sambungan selamat.':'Offline reload is unavailable in this browser. Use a supported browser and secure connection.',
 }
 return <>{offline&&<p className="pwa-status" role="status">{messages[readiness]}</p>}{offline&&<p className="pwa-status" role="status">Offline / Di luar talian · Connected actions unavailable; no writes queued. Saved information may need a refresh.</p>}{waiting&&<p className="pwa-status" role="status">{bm?'Kemas kini tersedia. Selesaikan atau simpan kerja anda dahulu.':'An app update is ready. Finish or save your current work first.'} <button type="button" onClick={()=>{navigator.serviceWorker.addEventListener('controllerchange',()=>window.location.reload(),{once:true});waiting.postMessage({type:'ACTIVATE_UPDATE'})}}>{bm?'Kemas kini':'Update app'}</button></p>}</>
}
