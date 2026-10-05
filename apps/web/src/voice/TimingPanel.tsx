import { useEffect, useState } from 'react'
import { ui } from '../locales/phrases'
import { beginTiming, cancelTiming, isTiming, markTimingHidden, selectedTask } from './timing'
import corpus from '../../../../contracts/voice-evaluation.json'
export function TimingPanel({ready,onStart}:{ready:boolean;onStart:()=>void}){
 const task=selectedTask(),[running,setRunning]=useState(isTiming())
 useEffect(()=>{const handler=()=>{if(document.visibilityState==='hidden')markTimingHidden()};document.addEventListener('visibilitychange',handler);return()=>document.removeEventListener('visibilitychange',handler)},[])
 if(!task)return null
 return <section className="panel detail-panel"><h2>{ui('Paired timing')} · {ui(task.mode)}</h2><p>{corpus.samples.find(s=>s.id===task.clip)?.transcript}</p><p>{ui('Load the speech model before starting. The timer includes entry, inference, fixes and confirmed saving. Hidden pages invalidate the run. No background microphone recording.')}</p><button className="button primary" disabled={running||task.mode==='voice'&&!ready} onClick={()=>{beginTiming(task);setRunning(true);onStart()}}>{ui(running?'Timer running until confirmed save':'Begin timed task')}</button><button className="button secondary" onClick={()=>{cancelTiming();setRunning(false)}}>{ui('Cancel timing task')}</button></section>
}
