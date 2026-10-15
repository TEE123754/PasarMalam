import { useState } from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Award, CakeSlice, Carrot, Clock3, CupSoda, Drumstick, Flame, HandHeart, Heart, LayoutGrid, Leaf, MapPin, Plus, ShieldCheck, Snowflake, Soup, Sparkles, Star, Store, Utensils, ArrowRight, type LucideIcon } from 'lucide-react'
import type { DataGateway, DiscoverySnapshot, Market, Stall } from '../data/types'
import { ui } from '../locales/phrases'
import { categories, categoryId } from './classifications'
import { distanceKm } from './engine'
import { CardBadge, CardTag, FoodCard, type BadgeKind } from './FoodCard'
import { PredictionNote, PredictionPill, PredictionTagText, predictedStall } from '../clearance/PredictedClearance'
import type { ClearancePrediction } from '../clearance/prediction'
import { BatchPhoto } from '../components/BatchPhoto'
import { DemoImage } from '../components/DemoImage'
import { foodImage } from '../components/demo-images'
import { PublicFlag } from '../community/PublicFlag'

export function ValueProps() {
  const {i18n}=useTranslation(), bm=i18n.language.startsWith('ms')
  const items:{Icon:LucideIcon;title:string;body:string}[]=[
    {Icon:ShieldCheck,title:bm?'Kenali makanan anda':'Know your food',body:bm?'Penjaja segar, bersih & dipercayai':'Fresh, clean & trusted vendors'},
    {Icon:Leaf,title:bm?'Makanan enak, kurang pembaziran.':'Good food, less waste.',body:bm?'Makanan sedap di penghujung hari':'Great food at the end of the day'},
    {Icon:HandHeart,title:bm?'Sokong tempatan':'Support local',body:bm?'Pasar kecil. Komuniti besar.':'Small markets. Big communities.'},
  ]
  return <section className="value-props" aria-label={bm?'Kenapa PasarMalam':'Why PasarMalam'}>{items.map(({Icon,title,body})=><div key={title}><Icon size={22} aria-hidden="true"/><div><strong>{title}</strong><span>{body}</span></div></div>)}</section>
}

// Icon per stable category id from contracts/food-categories.json
const categoryIcons:Record<string,LucideIcon>={rice:Soup,skewers:Flame,kuih:CakeSlice,drinks:CupSoda,fried:Drumstick,produce:Carrot}

export function CategoryChips({selected,onChange}:{selected:string;onChange:(category:string)=>void}) {
  const {i18n}=useTranslation()
  const chips=[{id:'',label:i18n.language.startsWith('ms')?'Semua':'All',Icon:LayoutGrid},...categories.map(c=>({id:c.id,label:ui(c.en),Icon:categoryIcons[c.id]??Utensils}))]
  return <div className="category-chips" role="group" aria-label={i18n.language.startsWith('ms')?'Tapis kategori':'Filter by category'}>{chips.map(({id,label,Icon})=><button type="button" key={id||'all'} className={selected===id?'active':''} aria-pressed={selected===id} onClick={()=>onChange(id)}><span className="chip-icon"><Icon size={20} aria-hidden="true"/></span>{label}</button>)}</div>
}

// "17:00"–"23:00" → "5pm–11pm"
function clock12(value:string) {
  const [h,m]=value.split(':').map(Number)
  if(!Number.isFinite(h))return value
  return `${h%12||12}${m?`:${String(m).padStart(2,'0')}`:''}${h<12?'am':'pm'}`
}
function hoursLabel(stall:Stall,market?:Market) { return stall.opens&&stall.closes?`${clock12(stall.opens)}–${clock12(stall.closes)}`:market?.hours??'' }
function timeLeft(ms:number,bm:boolean) {
  const minutes=Math.max(0,Math.floor(ms/60000)), h=Math.floor(minutes/60), m=minutes%60
  return h?`${h}${bm?'j':'h'} ${m}m`:`${m}m`
}

type Badge={kind:BadgeKind;label:string;Icon:LucideIcon}
// Featured dishes, in the order of the reference design; any missing from the snapshot are back-filled
const FEATURED=['Chicken satay','Nasi lemak ayam','Cendol','Pork noodles','Roti john','Fresh lime drink']

// Predicted clearances exist only for demo seed data; their pill stacks under any other badge in the slot
function clearanceFor(data:DiscoverySnapshot,stallId:string,now:Date,gateway:DataGateway) { return gateway.mode==='fixture'?predictedStall(data,stallId,now):null }
const ratingLabel=(stall:Stall)=>stall.reviews?`${stall.rating.toFixed(1)} (${stall.reviews})`:undefined
// Newest still-open batch of a dish
function liveBatchOf(data:DiscoverySnapshot,now:Date) {
  return (foodId:string)=>data.batches.filter(b=>b.foodItemId===foodId&&Date.parse(b.deadline)>now.getTime()&&b.remaining>0).sort((a,b)=>Date.parse(b.preparedAt)-Date.parse(a.preparedAt))[0]
}
function preparedPicks(data:DiscoverySnapshot,now:Date) {
  const liveBatch=liveBatchOf(data,now)
  // Dishes stay listed after their batch window closes (shown as "no batch right now") so the grid is never blank
  const featured=FEATURED.map(name=>data.menu.find(f=>f.name.toLowerCase()===name.toLowerCase())).filter(f=>f!==undefined)
  const backfill=data.menu.filter(f=>liveBatch(f.id))
  return [...featured,...backfill].filter((f,i,all)=>all.findIndex(x=>x.stallId===f.stallId)===i&&data.stalls.some(s=>s.id===f.stallId)).slice(0,6)
}

export function PreparedToday({data,now,gateway}:{data:DiscoverySnapshot;now:Date;gateway:DataGateway}) {
  const {i18n}=useTranslation(), bm=i18n.language.startsWith('ms')
  const liveBatch=liveBatchOf(data,now)
  const picks=preparedPicks(data,now)
  const stallOf=(f:typeof picks[number])=>data.stalls.find(s=>s.id===f.stallId)!
  // No sales data exists: "Best Seller" = most-reviewed stall shown, "Popular" = stalls in the two most-visited markets
  const bestSeller=[...picks].map(stallOf).filter(s=>s.reviews>0).sort((a,b)=>b.reviews-a.reviews)[0]?.id
  const busiest=new Set([...data.markets].sort((a,b)=>b.popularity-a.popularity).slice(0,2).map(m=>m.id))
  return <section className="prepared-today"><div className="section-heading"><h2>{bm?'Disediakan hari ini':'Prepared today'}</h2><NavLink to="/offers">{bm?'Lihat lagi':'See more'}<ArrowRight size={15}/></NavLink></div><div className="dish-grid">{picks.map(f=>{
    const stall=stallOf(f), market=data.markets.find(m=>m.id===stall.marketId), batch=liveBatch(f.id)
    const offer=data.offers.find(o=>o.stallId===f.stallId&&Date.parse(o.endsAt)>now.getTime())
    const prediction=clearanceFor(data,stall.id,now,gateway)
    const left=batch?Date.parse(batch.deadline)-now.getTime():0
    // Portions remaining when the starting quantity is known, otherwise advisory time remaining
    const share=!batch?0:batch.originalQuantity?batch.remaining/batch.originalQuantity:left/Math.max(1,Date.parse(batch.deadline)-Date.parse(batch.preparedAt))
    const pct=Math.round(Math.max(0,Math.min(1,share))*100)
    const badge:Badge|null=categoryId(f.categoryId??stall.categoryId??stall.category)==='drinks'?{kind:'chilled',label:bm?'Sejuk':'Chilled',Icon:Snowflake}
      :stall.id===bestSeller?{kind:'best',label:bm?'Paling laris':'Best Seller',Icon:Award}
      :busiest.has(stall.marketId)?{kind:'popular',label:bm?'Popular':'Popular',Icon:Star}
      :batch&&now.getTime()-Date.parse(batch.correctedPreparedAt??batch.preparedAt)<3600000?{kind:'fresh',label:bm?'Segar':'Fresh',Icon:Leaf}
      :offer?{kind:'hot',label:bm?'Tawaran panas':'Hot Sale',Icon:Flame}:null
    return <FoodCard key={f.id} gateway={gateway} stallId={stall.id} stallName={stall.name} to={`/stalls/${f.stallId}`} title={f.name} priceSen={f.priceSen} rating={ratingLabel(stall)}
      photo={batch?<BatchPhoto food={f.name} number={batch.batchNumber} foodId={f.id} batchId={batch.id} photo={batch.photoUrl}/>:<DemoImage image={foodImage(f.name)} photo={f.photoUrl} description={`${f.name}, menu photo`}/>}
      badge={(badge||prediction)&&<>{badge&&<CardBadge {...badge}/>}{prediction&&<PredictionPill prediction={prediction}/>}</>}
      meta={[{Icon:Clock3,text:`${batch?`${bm?'Hari ini':'Today'} · `:''}${hoursLabel(stall,market)}`},{Icon:MapPin,text:[stall.name,market?.area].filter(Boolean).join(' · ')}]}
      note={prediction&&<PredictionNote prediction={prediction}/>}
      tag={batch
        ?<CardTag Icon={Leaf} tone="fresh" to={`/passports/${batch.id}`} label={bm?`Lihat butiran kelompok ${batch.batchNumber}`:`View batch details for batch ${batch.batchNumber}`}>{batch.remaining} {bm?'hidangan':'portions'} · {timeLeft(left,bm)} {bm?'lagi':'left'}</CardTag>
        :prediction?<CardTag Icon={Clock3} tone="clear"><PredictionTagText prediction={prediction} locale={i18n.language}/></CardTag>
        :<CardTag Icon={Clock3}>{bm?'Tiada kelompok dijual sekarang':'No batch on sale right now'}</CardTag>}
      track={<div className="food-track" role="meter" aria-label={bm?'Baki hidangan':'Portions remaining'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><span style={{transform:`scaleX(${pct/100})`}}/></div>}/>
  })}</div><p className="advisory-note">{bm?'Tempoh nasihat berdasarkan masa penyediaan, bahan dan keadaan cuaca. Semak keadaan makanan bersama penjaja.':'Advisory windows consider preparation time, ingredients and weather. Check the food’s condition with the hawker.'}</p></section>
}

// Spotlight row: four stalls not already in "Prepared today", each with one signature dish.
// No sales data exists, so badges are derived: most reviews → Bestseller, highest rating → Local favourite,
// busiest market → Popular, otherwise the editorial "Must try".
export function FeaturedStalls({data,now,gateway}:{data:DiscoverySnapshot;now:Date;gateway:DataGateway}) {
  const {i18n}=useTranslation(), bm=i18n.language.startsWith('ms')
  const shown=new Set(preparedPicks(data,now).map(f=>f.stallId))
  const withDish=data.stalls.flatMap(stall=>{const dish=data.menu.find(f=>f.stallId===stall.id);return dish?[{stall,dish}]:[]})
  const ranked=[...withDish].sort((a,b)=>b.stall.reviews*b.stall.rating-a.stall.reviews*a.stall.rating)
  const picks=[...ranked.filter(x=>!shown.has(x.stall.id)),...ranked.filter(x=>shown.has(x.stall.id))].slice(0,4)
  if(!picks.length)return null
  const mostReviewed=[...picks].sort((a,b)=>b.stall.reviews-a.stall.reviews)[0].stall.id
  const topRated=picks.filter(x=>x.stall.reviews>0&&x.stall.id!==mostReviewed).sort((a,b)=>b.stall.rating-a.stall.rating)[0]?.stall.id
  const busiest=[...data.markets].sort((a,b)=>b.popularity-a.popularity)[0]?.id
  return <section className="featured-stalls" aria-labelledby="featured-stalls-title"><div className="section-heading"><div><h2 id="featured-stalls-title">{bm?'Gerai pilihan':'Featured stalls'}</h2><p className="section-sub">{bm?'Pilihan utama daripada penjaja tempatan.':'Top picks from local hawkers, handpicked for you.'}</p></div></div><div className="featured-grid">{picks.map(({stall,dish})=>{
    const market=data.markets.find(m=>m.id===stall.marketId), prediction=clearanceFor(data,stall.id,now,gateway)
    const badge:Badge=stall.id===mostReviewed&&stall.reviews>0?{kind:'best',label:bm?'Paling laris':'Bestseller',Icon:Award}
      :stall.id===topRated?{kind:'local',label:bm?'Kegemaran tempatan':'Local favourite',Icon:Heart}
      :stall.marketId===busiest?{kind:'popular',label:'Popular',Icon:Star}
      :{kind:'must',label:bm?'Wajib cuba':'Must try',Icon:Sparkles}
    return <FoodCard key={stall.id} gateway={gateway} stallId={stall.id} stallName={stall.name} to={`/stalls/${stall.id}`} title={dish.name} priceSen={dish.priceSen} rating={ratingLabel(stall)} action="details"
      photo={<DemoImage image={foodImage(dish.name)} photo={dish.photoUrl} description={`${dish.name} from ${stall.name}`}/>}
      badge={<><CardBadge {...badge}/>{prediction&&<PredictionPill prediction={prediction}/>}</>}
      meta={[{Icon:Store,text:stall.name},{Icon:MapPin,text:market?`${market.name} · ${market.area}`:''}]}
      note={prediction&&<PredictionNote prediction={prediction}/>}/>
  })}</div></section>
}

// Reference markets first, then the most-visited remaining markets
const FEATURED_MARKETS=['Seri Pelita','Pagi Embun','Bintang Mutiara','Pasar Tanjung']

export function PopularMarkets({data,origin}:{data:DiscoverySnapshot;origin:{latitude:number;longitude:number}|null}) {
  const {i18n}=useTranslation(), bm=i18n.language.startsWith('ms')
  const [all,setAll]=useState(false)
  const named=FEATURED_MARKETS.map(n=>data.markets.find(m=>m.name.startsWith(n))).filter(m=>m!==undefined)
  const ranked=[...named,...[...data.markets].sort((a,b)=>b.popularity-a.popularity)].filter((m,i,list)=>list.findIndex(x=>x.id===m.id)===i)
  const shown=all?ranked:ranked.slice(0,4)
  return <section className="popular-markets"><div className="section-heading"><h2>{bm?'Pasar malam popular':'Popular night markets'}</h2><button className="text-button" aria-expanded={all} onClick={()=>setAll(!all)}>{all?bm?'Tunjuk kurang':'Show fewer':bm?'Lihat semua':'See all'}<Plus size={15} className={all?'see-all-open':undefined}/></button></div><div className="popular-market-grid">{shown.map(m=>{
    const rated=data.stalls.filter(s=>s.marketId===m.id&&s.reviews>0), rating=rated.length?rated.reduce((n,s)=>n+s.rating,0)/rated.length:null
    const km=origin&&m.latitude!==null&&m.longitude!==null?distanceKm(origin,{latitude:m.latitude,longitude:m.longitude}):null
    return <NavLink className="popular-market" key={m.id} to={`/markets/${m.id}`}><DemoImage image={m.type==='day'?'day':'night'} description={`${m.name} · ${m.type}`}/><div className="popular-market-copy"><h3>{m.name}</h3><span className="popular-market-kind">{ui(m.kind==='farmers'?'Farmers’ market':'General market')}</span><div className="popular-market-foot"><span className="distance-badge"><MapPin size={12} aria-hidden="true"/>{km!==null?`${km.toFixed(1)} km`:m.area}</span>{rating!==null&&<span className="popular-market-rating"><Star size={13} aria-hidden="true"/>{rating.toFixed(1)}</span>}</div></div></NavLink>
  })}</div></section>
}

// Results-grid card ("From the stalls"): compact size of the shared card
export function StallTile({stall,market,prediction,gateway}:{stall:Stall;market?:Market;prediction?:ClearancePrediction|null;gateway:DataGateway}) {
  const {t,i18n}=useTranslation()
  return <FoodCard size="compact" gateway={gateway} stallId={stall.id} stallName={stall.name} to={`/stalls/${stall.id}`} title={stall.name} priceSen={stall.priceSen} rating={ratingLabel(stall)}
    photo={<DemoImage image={foodImage(stall.specialty)} description={`${stall.specialty} from ${stall.name}`}/>}
    badge={prediction&&<PredictionPill prediction={prediction}/>}
    meta={[{Icon:Utensils,text:stall.specialty||stall.category},{Icon:MapPin,text:market?.name??''}]}
    extra={<PublicFlag stall={stall.id}/>}
    note={prediction&&<PredictionNote prediction={prediction}/>}
    tag={prediction?<CardTag Icon={Clock3} tone="clear"><PredictionTagText prediction={prediction} locale={i18n.language}/></CardTag>
      :stall.open?<CardTag Icon={Leaf} tone="fresh">{t('vendorOpen')}</CardTag>:<CardTag Icon={Clock3}>{t('vendorClosed')}</CardTag>}/>
}

export function DiscoverFooter() {
  const {t}=useTranslation()
  return <footer className="discover-footer"><div className="discover-footer-brand"><span className="brand-mark"><img src="/brand/pasarmalam-mark.png" alt="" width="45" height="45"/></span><div><strong>Pasar<span>Malam</span></strong><small>{t('tagline')}</small></div></div><span>{ui('Community markets · Basic tier free')}</span></footer>
}
