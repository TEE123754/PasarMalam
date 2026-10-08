import { useState } from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { Bell, Building2, Heart, Leaf, Mic, Settings, ShieldCheck, Store, Tag, Users, Volume2, TrendingUp, BookOpen } from 'lucide-react'
import { people } from '../community/model'
import { demoPerson } from '../community/gateway'
import { changeLocale } from '../locales/i18n'
import { fixtureClock, closingScenarioTimestamp } from './clock'
import { NearbyConsent } from '../freshness/FreshPage'

const tools = [
  {to:'/saved',icon:Heart,title:'Saved stalls',body:'Your favourite stops, all in one place.'},
  {to:'/commerce',icon:Tag,title:'Reservations & orders',body:'Reserve surplus food and collect at the stall.'},
  {to:'/community',icon:Users,title:'Reviews & confidential reports',body:'Share a good meal or raise a hygiene concern.'},
  {to:'/impact',icon:Leaf,title:'Community impact',body:'Meals shared, RM saved and food waste diverted.'},
  {to:'/partners',icon:Building2,title:'Community partners',body:'Market organisers, health agencies and food partners.'},
  {to:'/advanced',icon:Bell,title:'Notifications & insights',body:'Nearby offers, market updates and organiser dashboards.'},
  {to:'/hawker/voice',icon:Mic,title:'Voice listing',body:'Speak in BM, English or Manglish; review and confirm.'},
  {to:'/hawker/dashboard',icon:Store,title:'Hawker workspace',body:'Manage menus, batches, freshness and promotions.'},
  {to:'/hawker/planning',icon:TrendingUp,title:'Demand planning',body:'Weather-aware cooking plans and stock insights.'},
  {to:'/hawker/accounting',icon:BookOpen,title:'Sales & stock',body:'Track collections, savings and session outcomes.'},
  {to:'/commerce?account=brand-a',icon:Tag,title:'Advertise your stall',body:'Campaigns, sponsored placements and performance.'},
  {to:'/community?account=organiser-a',icon:Users,title:'Organiser hub',body:'Redacted concerns, market management and follow-up.'},
  {to:'/community?account=admin-a',icon:ShieldCheck,title:'Hygiene review',body:'Moderation, independent reports and hawker replies.'},
]
export default function MarketProfile() {
  const {i18n}=useTranslation(), bm=i18n.language.startsWith('ms')
  const [person,setPerson]=useState(demoPerson), [location,setLocation]=useState(localStorage.getItem('pasarmalam:demo:location-choice')==='yes')
  const read=()=>{if('speechSynthesis' in window){speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance(bm?'Pasar anda, pilihan anda. Terokai makanan dan sokong komuniti tempatan.':'Your market, your way. Explore good food and support your local community.');voice.lang=bm?'ms-MY':'en-MY';speechSynthesis.speak(voice)}}
  function restart() {
    for(const key of Object.keys(localStorage)) if(key.startsWith('pasarmalam:demo:') && !['pasarmalam:demo:experience-version','pasarmalam:demo:role'].includes(key))localStorage.removeItem(key)
    fixtureClock.setScenario(closingScenarioTimestamp());window.location.assign('/demo/discover')
  }
  return <div className="market-profile"><header className="page-intro"><span className="eyebrow">{bm?'KOMUNITI ANDA':'YOUR MARKET COMMUNITY'}</span><h1>{bm?'Pasar anda, pilihan anda.':'Your market, your way.'}</h1><p>{bm?'Makanan enak. Komuniti mesra. Kurang pembaziran.':'Good food. Good neighbours. A little less waste.'}</p></header>
    <section className="profile-identity panel"><div className="profile-avatar" aria-hidden="true">{person.name.split(' ').map(n=>n[0]).slice(0,2).join('')}</div><div><span className="eyebrow">{bm?'SELAMAT DATANG KEMBALI':'WELCOME BACK'}</span><h2>{person.name}</h2><p><ShieldCheck size={15}/>{bm?'Ahli komuniti disahkan':'Verified community member'} · Petaling Jaya, Selangor</p></div><label>{bm?'Tukar akaun':'Switch account'}<select value={person.id} onChange={e=>{const next=people.find(p=>p.id===e.target.value)!;setPerson(next);localStorage.setItem('pasarmalam:demo:community-person',next.id);localStorage.setItem('pasarmalam:demo:role',next.role==='vendor'?'hawker':'customer');window.location.reload()}}>{people.filter(p=>p.verified).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label></section>
    <div className="profile-tool-grid">{tools.map(({to,icon:Icon,title,body})=><NavLink key={to} className="profile-tool panel card-link" to={to}><span className="tool-icon"><Icon size={23}/></span><h3>{title}</h3><p>{body}</p><span className="tool-arrow" aria-hidden="true">↗</span></NavLink>)}</div>
    <section className="panel profile-preferences"><h2><Settings size={23}/>{bm?'Tetapan anda':'Your preferences'}</h2><div className="settings-grid"><div><h3>{bm?'Bahasa':'Language'}</h3><div className="segmented"><button className={bm?'':'active'} onClick={()=>void changeLocale('en')}>English</button><button className={bm?'active':''} onClick={()=>void changeLocale('ms')}>Bahasa Melayu</button></div><button className="button secondary" onClick={read}><Volume2 size={17}/>{bm?'Baca dengan suara':'Read aloud'}</button></div><div><h3>{bm?'Privasi':'Privacy'}</h3><label className="choice-row"><span>{bm?'Gunakan lokasi anggaran':'Use approximate location'}</span><input type="checkbox" checked={location} onChange={e=>{setLocation(e.target.checked);localStorage.setItem('pasarmalam:demo:location-choice',e.target.checked?'yes':'no')}}/></label><p className="small muted">{bm?'Lokasi adalah pilihan anda. Laporan kebersihan merahsiakan identiti anda daripada orang awam.':'Location is your choice. Hygiene reports keep your identity private from the public.'}</p><NearbyConsent mode="fixture"/></div></div></section>
    <section className="panel new-evening"><div><h3>{bm?'Terokai satu lagi malam di pasar':'Another evening at the market'}</h3><p>{bm?'Mulakan semula dengan kelompok, tawaran dan cerita komuniti yang lengkap.':'Start afresh with prepared batches, evening offers and community stories.'}</p></div><button className="button secondary" onClick={restart}>{bm?'Mulakan malam baharu':'Start a new evening'}</button></section>
  </div>
}
