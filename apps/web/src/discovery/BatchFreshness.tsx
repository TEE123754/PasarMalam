import { Clock3, Leaf, ArrowRight, ShieldCheck } from 'lucide-react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { DiscoverySnapshot } from '../data/types'
import { BatchPhoto } from '../components/BatchPhoto'
import { malaysiaTime, countdown } from './batch-time'
export { malaysiaTime, countdown } from './batch-time'
export function BatchFreshness({batch,now,compact=false}:{batch:DiscoverySnapshot['batches'][number];now:Date;compact?:boolean}) {
  const {i18n}=useTranslation(), bm=i18n.language.startsWith('ms')
  const left=Date.parse(batch.deadline)-now.getTime(), total=Date.parse(batch.deadline)-Date.parse(batch.preparedAt)
  return <div className={`freshness-info ${left<=15*60000?'time-short':''} ${compact?'compact':''}`}>
    <span className="prepared-line"><Clock3 size={14}/>{bm?'Disediakan':'Prepared'} {malaysiaTime(batch.correctedPreparedAt??batch.preparedAt,i18n.language)} · #{batch.batchNumber}</span>
    <div className="countdown-line"><strong>{left>0?countdown(batch.deadline,now):bm?'Tempoh tamat':'Window ended'}</strong><span>{bm?'baki tempoh nasihat':'advisory time left'}</span></div>
    {!compact&&<><div className="freshness-track" role="meter" aria-label={bm?'Baki tempoh nasihat':'Advisory window remaining'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(Math.max(0,Math.min(100,left/Math.max(1,total)*100)))}><span style={{width:`${Math.max(0,Math.min(100,left/Math.max(1,total)*100))}%`}}/></div><p>{batch.remaining} {bm?'hidangan tersedia':'portions available'} · {bm?'Nasihat masa simpanan tamat':'Holding-time advisory ends'} {malaysiaTime(batch.deadline,i18n.language)}</p></>}
  </div>
}
export function FreshFoodSection({data,now}:{data:DiscoverySnapshot;now:Date}) {
  const {i18n}=useTranslation(), bm=i18n.language.startsWith('ms')
  const foods=data.menu.filter(f=>data.batches.some(b=>b.foodItemId===f.id&&Date.parse(b.deadline)>now.getTime()&&b.remaining>0))
  const first=foods.filter((f,i)=>foods.findIndex(x=>x.stallId===f.stallId)===i).slice(0,6)
  return <><section className="purpose-strip"><div><ShieldCheck size={24}/><div><strong>{bm?'Kenali setiap kelompok':'Know your batch'}</strong><span>{bm?'Masa memasak, bahan dan jejak penyediaan.':'Cooking times, ingredients and preparation history.'}</span></div></div><div><Leaf size={24}/><div><strong>{bm?'Makanan enak, kurang pembaziran':'Good food. Less waste.'}</strong><span>{bm?'Beli lebihan sebelum tempoh nasihat tamat.':'Catch surplus offers before the advisory window ends.'}</span></div></div><NavLink to="/impact">{bm?'Lihat impak komuniti':'See community impact'}<ArrowRight size={17}/></NavLink></section>
    <section className="fresh-food-section"><div className="section-heading"><div><span className="eyebrow">{bm?'DARI DAPUR KE KOMUNITI':'FROM THE WOK TO YOUR NEIGHBOURHOOD'}</span><h2>{bm?'Disediakan hari ini':'Prepared today'}</h2></div><NavLink to="/offers">{bm?'Tawaran lebihan':'Surplus offers'}<ArrowRight size={17}/></NavLink></div><div className="fresh-food-grid">{first.map(f=>{
      const stall=data.stalls.find(s=>s.id===f.stallId)!, batch=data.batches.filter(b=>b.foodItemId===f.id&&Date.parse(b.deadline)>now.getTime()&&b.remaining>0).sort((a,b)=>Date.parse(b.preparedAt)-Date.parse(a.preparedAt))[0]
      const offer=data.offers.find(o=>o.stallId===f.stallId&&Date.parse(o.endsAt)>now.getTime())
      return <NavLink className="fresh-food-card card-link" to={`/stalls/${f.stallId}`} key={f.id}><div className="fresh-food-photo"><BatchPhoto food={f.name} number={batch.batchNumber} foodId={f.id} batchId={batch.id} photo={batch.photoUrl}/>{offer&&<span className="offer-ribbon"><Leaf size={13}/>{bm?'Tawaran lebihan':'Surplus offer'}</span>}</div><div className="fresh-food-copy"><span className="small muted">{stall.name}</span><h3>{f.name}</h3><strong className="food-price">RM {(f.priceSen/100).toFixed(2)}</strong><BatchFreshness batch={batch} now={now}/></div></NavLink>
    })}</div><p className="advisory-note">{bm?'Tempoh nasihat berdasarkan masa penyediaan, bahan dan keadaan cuaca. Semak keadaan makanan bersama penjaja.':'Advisory windows consider preparation time, ingredients and weather. Check the food’s condition with the hawker.'}</p></section></>
}
