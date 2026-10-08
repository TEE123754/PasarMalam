import { useState } from 'react'
import { ui } from '../locales/phrases'
import i18n from '../locales/i18n'
import { availabilityState, destination, plantStatus, type PlantDiet } from './classifications'
const time=(at:string)=>new Intl.DateTimeFormat(i18n.language.startsWith('ms')?'ms-MY':'en-MY',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Kuala_Lumpur'}).format(new Date(at))
export function Availability({at,now}:{at?:string|null;now:Date}) {
 const state=availabilityState(at,now)
 return <p className={`small availability-${state}`}>{ui(state==='unknown'?'Availability not confirmed':state==='stale'?'Availability confirmation is stale — check with the hawker':'Recently confirmed by the hawker')}{at&&Number.isFinite(Date.parse(at))&&` · ${time(at)}`}</p>
}
export function PlantStatement({value,at}:{value?:PlantDiet;at?:string|null}) {
 const state=plantStatus(value)
 const label=state==='vegan'?'Vendor-declared vegan':state==='vegetarian'?'Vendor-declared vegetarian':state==='conflict'?'Conflicting plant-diet declarations — ask the hawker':state==='neither'?'Declared not vegetarian':'Vegetarian / vegan status unknown'
 return <p className="small">{ui(label)}{at&&` · ${time(at)}`}</p>
}
export function Directions({latitude,longitude}:{latitude?:number|null;longitude?:number|null}) {
 const point=destination(latitude,longitude),[message,setMessage]=useState('')
 if(!point)return <p className="small muted">{ui('Directions unavailable — destination coordinates missing')}</p>
 return <div className="destination-actions"><div className="button-row"><a className="button secondary" href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(point)}`} target="_blank" rel="noopener noreferrer">{ui('Directions in Google Maps')}</a><button className="button secondary" onClick={()=>{void navigator.clipboard.writeText(point).then(()=>setMessage('Destination copied')).catch(()=>setMessage('Copy unavailable — select the destination below'))}}>{ui('Copy destination')}</button></div><p className="small muted">{ui('Only the destination is shared. Choose your starting point in the maps app.')} <span>{point}</span></p>{message&&<p role="status">{ui(message)}</p>}</div>
}
