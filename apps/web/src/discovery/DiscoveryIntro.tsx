import { categories, categoryId } from './classifications'
import { ui } from '../locales/phrases'
import { ArrowUpRight, MapPin, UtensilsCrossed } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { NavLink } from 'react-router'
import { DemoImage } from '../components/DemoImage'
import { foodImage } from '../components/demo-images'
import type { DiscoverySnapshot } from '../data/types'
import type { Filters } from './engine'

export function DiscoveryIntro({data,filters}:{data?:DiscoverySnapshot;filters:Filters}) {
 const {i18n,t}=useTranslation()
 const bm=i18n.language.startsWith('ms')
 const market=data?.markets.find(m=>m.id===filters.market)
 return <header className="discovery-hero"><div className="discovery-hero-copy"><span className="eyebrow">{t('discoverEyebrow')}</span><h1>{t('discoverTitle').replace(/\.$/,'')}<span>.</span></h1><p>{t('discoverBody')}</p><div className="discovery-hero-details"><div className="location-kicker"><MapPin size={16}/><span>{market?`${market.name} · ${market.area}`:bm?'Pasar tempatan · Malaysia':'Local markets · Malaysia'}</span></div><NavLink className="hero-offer-link" to="/offers">{t('browseOffers')}<ArrowUpRight size={17}/></NavLink></div></div><DemoImage image={filters.type==='day'?'day':'night'} description={bm?'Suasana pasar tempatan':'Local market scene'} priority className="discovery-hero-art"/></header>
}

export function DiscoveryCategories({data,selected,onChange}:{data:DiscoverySnapshot;selected:string;onChange:(category:string)=>void}) {
 const {i18n}=useTranslation()
 // Stable taxonomy remains visible even when a category currently has no stalls.
 return <section className="discovery-categories" aria-label={i18n.language.startsWith('ms')?'Kategori makanan':'Food categories'}><div className="section-heading"><h2>{i18n.language.startsWith('ms')?'Anda teringin apa?':'What are you craving?'}</h2><button className="text-button" onClick={()=>onChange('')}>{i18n.language.startsWith('ms')?'Semua kategori':'All categories'}</button></div><div className="category-strip">{categories.map(c=>{const category=c.id;const representative=data.stalls.find(s=>categoryId(s.categoryId??s.category)===category&&foodImage(s.specialty)),image=foodImage(representative?.specialty??'');return <button type="button" className={`category-tile ${selected===category?'selected':''}`} key={category} aria-pressed={selected===category} onClick={()=>onChange(selected===category?'':category)}>{image?<DemoImage image={image} description={ui(c.en)}/>:<div className="category-icon" aria-hidden="true"><UtensilsCrossed size={34}/></div>}<span>{ui(c.en)}</span></button>})}</div></section>
}
