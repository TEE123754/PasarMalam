import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

export function PinPicker({latitude,longitude,onPick}:{latitude:number;longitude:number;onPick:(lat:number,lon:number)=>void}) {
  const container=useRef<HTMLDivElement>(null);const pick=useRef(onPick)
  useEffect(()=>{pick.current=onPick},[onPick])
  useEffect(()=>{let dispose:(()=>void)|undefined;let cancelled=false
    void import('leaflet').then(L=>{if(cancelled||!container.current)return;const map=L.map(container.current).setView([latitude,longitude],17);const url=import.meta.env.VITE_MAP_TILE_URL||'https://tile.openstreetmap.org/{z}/{x}/{y}.png';if(url!=='disabled')L.tileLayer(url,{attribution:'© OpenStreetMap contributors',maxZoom:19}).addTo(map);const pin=L.circleMarker([latitude,longitude],{radius:9,color:'#b64b22',fillOpacity:.8}).addTo(map);map.on('click',e=>{pin.setLatLng(e.latlng);pick.current(Number(e.latlng.lat.toFixed(6)),Number(e.latlng.lng.toFixed(6)))});dispose=()=>map.remove()})
    return()=>{cancelled=true;dispose?.()}
  },[latitude,longitude])
  return <div><p className="small muted">Tap the map to place your stall. Coordinates can also be entered below.</p><div ref={container} style={{height:220,borderRadius:12}} aria-label="Stall pin placement map"/></div>
}
