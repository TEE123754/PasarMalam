import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Bell, Camera, ChevronRight, ClipboardList, Eye, Flame, Globe, Mic, Package, Pencil, Plus, Store, Tag, TrendingUp, UtensilsCrossed } from 'lucide-react'
import { ui } from '../locales/phrases'
import { DemoImage } from '../components/DemoImage'
import { foodImage } from '../components/demo-images'
import { BusinessStatements, AllergenStatement } from '../listings/ListingStatements'
import { PlantStatement } from '../discovery/DiscoveryMetadata'
import type { FreshState } from '../freshness/engine'
import type { VendorBatch, VendorFood, VendorStall } from './model'

export function StallHero() {
  return <header className="stall-ws-hero">
    <span className="eyebrow">{ui('HAWKER WORKSPACE')}</span>
    <h1>{ui('Stall & menu')}</h1>
    <p>{ui('Every preparation gets its own batch number and original photo. New batches await a handling policy; no safety claim or clearance offer is inferred.')}</p>
    <div className="stall-ws-hero-actions"><NavLink className="button primary" to="/hawker/voice"><Mic size={17}/>{ui('Voice & quick entry')}</NavLink><NavLink className="button secondary" to="/profile"><Globe size={17}/>{ui('Language & privacy')}</NavLink></div>
  </header>
}

export function AlertBanner({state}:{state?:FreshState}) {
  const unread=state?.alerts.filter(a=>a.current&&!a.read).length??0, drafts=state?.drafts.filter(d=>d.state==='pending').length??0
  return <NavLink className="stall-ws-alerts" to="/hawker/promotions"><Bell size={18}/><span>{state?ui('{count} unread reminders · {drafts} clearance drafts',{count:unread,drafts}):ui('Visit Alerts to confirm batch ingredients and view advisory windows.')} · {ui('Open alerts')}</span><ChevronRight className="stall-ws-chevron" size={18}/></NavLink>
}

// Size/portion tag from the dish name suffix ("Chicken satay · small")
function portion(name:string) { const m=name.match(/·\s*(small|sharing|large|regular)\s*$/i); return m?m[1][0].toUpperCase()+m[1].slice(1).toLowerCase():'Regular' }

export function StallSections({state,stall,foods,batches,now,onEditStall,onAddFood,onEditFood,onNewBatch,onStartPhotoSetup,showPhotoSetup,photoOnboarding,batchList}:{state?:FreshState;stall:VendorStall;foods:VendorFood[];batches:VendorBatch[];now:Date;onEditStall:()=>void;onAddFood:()=>void;onEditFood:(id:string)=>void;onNewBatch:()=>void;onStartPhotoSetup:()=>void;showPhotoSetup:boolean;photoOnboarding:ReactNode;batchList:ReactNode}) {
  const {i18n}=useTranslation()
  const time=(value:string)=>new Date(value).toLocaleTimeString(i18n.language.startsWith('ms')?'ms-MY':'en-MY',{hour:'numeric',minute:'2-digit',timeZone:'Asia/Kuala_Lumpur'})
  const live=(b:VendorBatch)=>['active','needs-information'].includes(b.status)&&(!b.advisory_deadline||Date.parse(b.advisory_deadline)>now.getTime())
  const active=batches.filter(live)
  const offers=state?.promotions.filter(p=>p.state==='active'&&Date.parse(p.ends)>now.getTime()&&active.some(b=>b.id===p.batch))??[]
  const stats=[
    {Icon:Package,value:state?.alerts.filter(a=>a.current&&!a.read).length??0,label:'Unread reminders',to:'/hawker/promotions'},
    {Icon:Bell,value:state?.drafts.filter(d=>d.state==='pending').length??0,label:'Clearance drafts',to:'/hawker/promotions'},
    {Icon:Tag,value:offers.length,label:'Current offers',to:'/hawker/promotions'},
    {Icon:TrendingUp,value:active.length,label:'Active batches',to:'#batches'},
  ]
  const halal=stall.halal==='declared'?ui('Hawker-declared halal, not certified'):stall.halal==='non-halal'?ui('Non-halal'):ui('Halal status not declared')
  const halalTag=stall.halal==='declared'?ui('Halal (declared)'):stall.halal==='non-halal'?ui('Non-halal'):null
  const hours=stall.opens&&stall.closes?`${stall.opens}–${stall.closes}`:''
  const latest=(f:VendorFood)=>batches.find(b=>b.food_item_id===f.id)
  return <>
    <div className="stall-ws-stats">{stats.map(({Icon,value,label,to})=>{const body=<><span className="stall-ws-stat-icon"><Icon size={20}/></span><span className="stall-ws-stat-copy"><strong>{value}</strong><span>{ui(label)}</span></span><ChevronRight className="stall-ws-chevron" size={18}/></>;return to.startsWith('#')?<a key={label} className="stall-ws-stat" href={to} onClick={e=>{e.preventDefault();document.getElementById('batches')?.scrollIntoView({behavior:'smooth',block:'start'})}}>{body}</a>:<NavLink key={label} className="stall-ws-stat" to={to}>{body}</NavLink>})}</div>

    <section className="hawker-card stall-ws-statements">
      <div className="stall-ws-head"><span className="stall-ws-head-icon"><ClipboardList size={20}/></span><div><h2>{ui('Hawker statements')}</h2><p>{ui('Voluntary statements customers see on your stall page.')}</p></div><button type="button" className="stall-ws-link" onClick={onEditStall}>{ui('Edit statements')}<ChevronRight size={16}/></button></div>
      <BusinessStatements value={stall.declarations} at={stall.declarations_recorded_at}/>
    </section>

    <section className="hawker-card stall-ws-status">
      <span className="stall-ws-status-icon"><Flame size={20}/></span>
      <div><strong>{stall.specialty} · {stall.open?ui('Vendor open'):ui('Vendor closed')}{hours&&` · ${hours}`}</strong><span>{halal}</span></div>
      <NavLink className="button secondary" to={`/stalls/${stall.id}`}>{ui('View customer listing')}<ChevronRight size={16}/></NavLink>
    </section>

    <section className="hawker-card stall-ws-yours">
      <div className="stall-ws-yours-photo"><DemoImage image={stall.name.toLowerCase().includes('dapur embun')?'riceStall':stall.category_id==='produce'?'produce':'satayStall'} description={`${stall.name} stall frontage and menu board`}/></div>
      <div className="stall-ws-yours-copy">
        <span className="stall-ws-label"><Store size={15}/>{ui('Your stall')}{stall.lot&&` · Lot ${stall.lot}`}</span>
        <h2>{stall.name}</h2>
        <p className="stall-ws-yours-meta">{stall.specialty} · RM {(stall.price_sen/100).toFixed(2)}</p>
        <p className="stall-ws-yours-meta muted">{stall.open?ui('Open'):ui('Closed')}{hours&&` · ${hours}`}</p>
        {stall.description&&<p className="stall-ws-yours-desc">{stall.description}</p>}
      </div>
      <div className="stall-ws-yours-actions"><button type="button" className="button primary" onClick={onEditStall}><Pencil size={16}/>{ui('Edit stall')}</button><button type="button" className="button secondary" onClick={onAddFood}><Plus size={16}/>{ui('Add food')}</button></div>
    </section>

    <section className="hawker-card stall-ws-menu">
      <div className="stall-ws-head"><span className="stall-ws-head-icon"><UtensilsCrossed size={20}/></span><div><h2>{ui('Menu')}</h2><p>{ui('{count} dishes · ingredients, allergens and plant-diet statements per dish',{count:foods.length})}</p></div><div className="stall-ws-head-actions"><button type="button" className="button secondary" onClick={onNewBatch}><Package size={16}/>{ui('New batch prepared')}</button><button type="button" className="button primary" onClick={onAddFood}><Plus size={16}/>{ui('Add food')}</button></div></div>
      {foods.length?<div className="stall-ws-food-grid">{foods.map(f=>{const b=latest(f);return <article className="stall-ws-food" key={f.id}>
        <div className="stall-ws-food-photo"><DemoImage image={foodImage(f.name)} photo={f.photo} description={`${f.name} dish`}/></div>
        <div className="stall-ws-food-copy">
          <h3>{f.name}</h3>
          <strong className="stall-ws-price">RM {(f.price_sen/100).toFixed(2)}</strong>
          <span className="stall-ws-batch"><Package size={13}/>{b?`${ui('Batch')} #${b.batch_number} · ${time(b.prepared_at)}`:ui('No batch yet')}</span>
          <span className="stall-ws-tags">{halalTag&&<span className={`stall-ws-tag ${stall.halal==='declared'?'halal':''}`}>{halalTag}</span>}<span className="stall-ws-tag">{ui(portion(f.name))}</span></span>
          <details className="stall-ws-details"><summary>{ui('Ingredients & allergens')}</summary><p>{f.ingredients.join(', ')||ui('Ingredients not supplied')}</p><PlantStatement value={f.plant_diet} at={f.plant_diet_recorded_at}/><AllergenStatement value={f.allergens} at={f.allergens_recorded_at}/></details>
        </div>
        <div className="stall-ws-food-actions"><button type="button" className="button secondary" onClick={()=>onEditFood(f.id)}><Pencil size={15}/>{ui('Edit')}</button>{b?<NavLink className="button primary" to={`/passports/${b.id}`}><Eye size={15}/>{ui('View batch')}</NavLink>:<button type="button" className="button primary" onClick={onNewBatch}><Package size={15}/>{ui('New batch')}</button>}</div>
      </article>})}</div>:<div className="stall-ws-empty stall-ws-menu-empty"><p>{ui('Add your first dish before creating a batch.')}</p>{showPhotoSetup&&<button type="button" className="button primary" onClick={onStartPhotoSetup}><Camera size={16}/>{ui('Set up my stall with a photo')}</button>}<button type="button" className="button secondary" onClick={onAddFood}><Plus size={16}/>{ui('Add food manually')}</button></div>}
    </section>

    {photoOnboarding}
    {batchList}
  </>
}
