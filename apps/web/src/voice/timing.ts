import { selectedMode } from '../app/config'
import corpus from '../../../../contracts/voice-evaluation.json'
export type Lane='voice'|'typing'
export type Order='voice-first'|'typing-first'
export interface TimingTask {pair:string;clip:string;mode:Lane;order:Order;device:string;network:string;consented:boolean}
export interface TimingRecord extends TimingTask {seconds:number;cold:boolean;valid:boolean;reason:string}
const key=()=>`pasarmalam:${selectedMode()==='fixture'?'demo':'real'}:evaluation:timing-v1`
let active:{task:TimingTask;start:number;origin:number;hidden:boolean}|null=null
export function timingHistory():TimingRecord[]{try{return JSON.parse(sessionStorage.getItem(key())??'[]') as TimingRecord[]}catch{return []}}
export function selectedTask():TimingTask|null{try{return JSON.parse(sessionStorage.getItem(key()+':task')??'null') as TimingTask|null}catch{return null}}
export function selectTask(task:TimingTask){if(!task.consented||!task.pair.trim()||!task.device.trim()||!task.network.trim()||!corpus.samples.some(s=>s.id===task.clip))throw new Error('Confirm participant consent and task context.');const previous=timingHistory().filter(r=>r.pair===task.pair&&r.valid);if(previous.some(r=>r.mode===task.mode)||!previous.length&&task.mode!==(task.order==='voice-first'?'voice':'typing')||previous.length&&previous[0].order!==task.order)throw new Error('Follow the selected counterbalanced order; use a new pair ID for a repeat.');sessionStorage.setItem(key()+':task',JSON.stringify(task));active=null}
export function beginTiming(task:TimingTask,now=performance.now(),origin=performance.timeOrigin){if(active)throw new Error('A timing task is already running.');active={task,start:now,origin,hidden:false}}
export function isTiming(){return !!active}
export function markTimingHidden(){if(active)active.hidden=true}
export function finishTiming(realVoice:boolean,now=performance.now(),origin=performance.timeOrigin):TimingRecord|null{if(!active)return null;const run=active;active=null;const seconds=(now-run.start)/1000;const valid=origin===run.origin&&!run.hidden&&seconds>0&&seconds<=3600&&(run.task.mode==='typing'||realVoice);const reason=valid?'confirmed':run.hidden?'Page hidden during task':run.task.mode==='voice'&&!realVoice?'Voice or LLM inference missing':'Task clock invalid';const record={...run.task,seconds,cold:false,valid,reason};sessionStorage.setItem(key(),JSON.stringify([...timingHistory(),record].slice(-100)));sessionStorage.removeItem(key()+':task');return record}
export function cancelTiming(){active=null;sessionStorage.removeItem(key()+':task')}
export function pairedTimings(){const rows=timingHistory().filter(r=>r.valid);const pairs=new Set(rows.map(r=>r.pair));return [...pairs].flatMap(pair=>{const p=rows.filter(r=>r.pair===pair);if(p.length!==2||new Set(p.map(r=>r.mode)).size!==2||p[0].order!==p[1].order||p[0].clip!==p[1].clip||p[0].device!==p[1].device||p[0].network!==p[1].network)return [];return p.map(({pair,mode,seconds,order,cold})=>({pair,mode,seconds,order,cold}))})}
