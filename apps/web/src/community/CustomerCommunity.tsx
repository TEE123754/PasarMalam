import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { NavLink, useParams } from 'react-router'
import { MessageSquare, ShieldCheck, Star, ArrowLeft } from 'lucide-react'
import { fixtureClock } from '../app/clock'
import { fixtureGateway } from '../data/fixture'
import { communitySave, communityWorkspace, demoPerson, publicData } from './gateway'
import type { Command } from './model'
import { categories } from '../impact/model'
import CommunityTools from '../impact/CommunityTools'

export default function CustomerCommunity() {
  const {id}=useParams(), cache=useQueryClient(), person=demoPerson()
  const [stall,setStall]=useState(id??'bara-senja'), [tab,setTab]=useState(new URLSearchParams(location.search).get('tab')==='report'?'report':'review')
  const [rating,setRating]=useState(5),[review,setReview]=useState(''),[body,setBody]=useState(''),[category,setCategory]=useState('hygiene')
  const [incident,setIncident]=useState(()=>{const now=fixtureClock.now();return new Date(now.getTime()-now.getTimezoneOffset()*60000-300000).toISOString().slice(0,16)})
  const [message,setMessage]=useState(''),[busy,setBusy]=useState(false),[evidence,setEvidence]=useState<string[]>([])
  const discovery=useQuery({queryKey:['discovery','fixture'],queryFn:()=>fixtureGateway.getDiscovery()})
  const published=useQuery({queryKey:['community-public','fixture'],queryFn:()=>publicData('fixture')})
  const own=useQuery({queryKey:['community','fixture',person.id],queryFn:()=>communityWorkspace('fixture',person)})
  const name=discovery.data?.stalls.find(s=>s.id===stall)?.name??'Bara Senja'
  async function submit(command:Command) {
    setBusy(true);setMessage('')
    try {await communitySave('fixture',person,command,crypto.randomUUID());await Promise.all([cache.invalidateQueries({queryKey:['community']}),cache.invalidateQueries({queryKey:['community-public']}),cache.invalidateQueries({queryKey:['discovery']})]);setMessage(command.kind==='review'?'Review saved. You can follow its publication status below.':'Your private report has been received for review. Your identity is hidden from the public and hawker.');if(command.kind==='review')setReview('');else{setBody('');setEvidence([])}}
    catch(error){setMessage(error instanceof Error?error.message:'Please review the fields and try again.')}
    finally{setBusy(false)}
  }
  return <div className="customer-community"><NavLink className="back-link" to={`/stalls/${stall}`}><ArrowLeft size={16}/>Back to stall</NavLink><header className="page-intro"><span className="eyebrow">GOOD NEIGHBOURS LOOK OUT FOR EACH OTHER</span><h1>Share your market story.</h1><p>Celebrate a good meal, ask a question, or raise a concern in confidence.</p></header>
    <section className="panel community-selector"><label>Choose a stall<select value={stall} onChange={e=>{setStall(e.target.value);setMessage('')}}>{discovery.data?.stalls.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><span><ShieldCheck size={17}/>{person.name} · Verified member</span></section>
    <div className="community-columns"><section className="panel community-compose"><div className="segmented" role="group" aria-label="Contribution type"><button className={tab==='review'?'active':''} onClick={()=>setTab('review')}><MessageSquare size={16}/>Write a review</button><button className={tab==='report'?'active':''} onClick={()=>setTab('report')}><ShieldCheck size={16}/>Private report</button></div>
    <h2>{tab==='review'?`How was ${name}?`:'Tell us what happened'}</h2>{message&&<p className="community-feedback" role="status">{message}</p>}
    {tab==='review'?<form onSubmit={e=>{e.preventDefault();void submit({kind:'review',stall,body:review,rating,photo:''})}}><div className="review-stars" role="group" aria-label="Rating">{[1,2,3,4,5].map(n=><button type="button" key={n} aria-label={`${n} star${n===1?'':'s'}`} aria-pressed={rating===n} onClick={()=>setRating(n)}><Star size={30} fill={n<=rating?'currentColor':'none'}/></button>)}</div><label>Your experience<textarea value={review} minLength={10} maxLength={1500} required placeholder="What did you try? How was the food, value and service?" onChange={e=>setReview(e.target.value)}/></label><p className="small muted">Reviews are checked before publication. You can edit your review later.</p><button className="button primary" disabled={busy}>Submit review</button></form>:<form onSubmit={e=>{e.preventDefault();void submit({kind:'report',stall,category,incident:new Date(incident).toISOString(),body,evidence})}}><p className="privacy-notice"><ShieldCheck size={18}/>Your identity and evidence stay private to authorised moderators. Organisers receive a redacted summary, and the hawker can reply.</p><div className="form-grid"><label>Concern<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c} value={c}>{c.replaceAll('-',' ')}</option>)}</select></label><label>When it happened<input type="datetime-local" required value={incident} onChange={e=>setIncident(e.target.value)}/></label></div><label>What you observed<textarea value={body} minLength={10} maxLength={2000} required placeholder="Describe the food handling, storage or hygiene concern." onChange={e=>setBody(e.target.value)}/></label><label>Optional evidence description<input placeholder="For example: uncovered food tray at the counter" maxLength={300} onBlur={e=>{if(e.target.value.trim())setEvidence([`description:${e.target.value.trim()}`])}}/></label><p className="small muted">Up to three new reports per Malaysia calendar day. Reports are reviewed; they do not create an automatic public accusation.</p><button className="button primary" disabled={busy}>Submit privately</button></form>}
    </section><aside className="panel community-reviews"><span className="eyebrow">FROM YOUR NEIGHBOURS</span><h2>Recent reviews</h2>{published.data?.reviews.filter(r=>r.stall===stall).slice(0,5).map((r,i)=><article className="public-review" key={r.id}><div className="review-person"><span className="review-avatar">{['AR','BT','CW','FL','NA'][i%5]}</span><div><strong>{['Aina','Ben','Chong','Farah','Nur'][i%5]}</strong><span className="rating"><Star size={14} fill="currentColor"/>{r.rating}/5</span></div></div><p>{r.body}</p></article>)}</aside></div>
    <section className="panel community-history"><h2>Your contributions</h2>{own.data?.reviews.filter(r=>r.stall===stall).map(r=><article className="public-review" key={r.id}><span className="status-pill">{r.status==='pending'?'Awaiting review':r.status}</span><p>{r.body}</p><button className="button secondary" onClick={()=>{setTab('review');setReview(r.body);setRating(r.rating)}}>Edit review</button></article>)}{own.data?.reports.filter(r=>r.stall===stall).map(r=><article className="public-review" key={r.id}><strong>Private {r.category} report</strong><span className="status-pill">{r.status}</span><p>{r.body}</p></article>)}<p className="small muted">Your saved reviews and private reports appear here after submission.</p></section>
    <CommunityTools mode="fixture" p={person} stall={stall} reports={own.data?.reports??[]}/>
  </div>
}
