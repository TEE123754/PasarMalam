import { useEffect, useState } from 'react'
import { useAuth } from '../auth/context'
import { demoPerson } from '../community/gateway'
import { event } from './gateway'
import type { AppMode } from '../data/types'
import { ui } from '../locales/phrases'
export default function TelemetryConsent({mode,stall}:{mode:AppMode;stall:string}){const auth=useAuth(),[consent,setConsent]=useState(localStorage.getItem('pasarmalam:analytics-consent')==='yes');useEffect(()=>{if(!consent)return;const p=mode==='fixture'?demoPerson():{id:auth.actor?.id??'',name:'',verified:auth.actor?.verified??false,role:'customer' as const};void event(mode,p,stall,'stall-view')},[consent,mode,stall,auth.actor?.id,auth.actor?.verified]);return <label className="choice-row"><input type="checkbox" checked={consent} onChange={e=>{localStorage.setItem('pasarmalam:analytics-consent',e.target.checked?'yes':'no');setConsent(e.target.checked)}}/>{ui('Opt in to coarse stall/offer engagement counts. No GPS, report text or voice transcript is collected. Turn off to stop future events.')}</label>}
