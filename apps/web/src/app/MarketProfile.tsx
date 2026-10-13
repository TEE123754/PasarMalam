import { useState } from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowRight, BarChart3, Bell, Building2, Check, ClipboardList, Clock3, Globe, Heart, Leaf, Lock, Megaphone, Mic, Settings, ShieldCheck, ShoppingBag, Store, TrendingUp, Users, Volume2 } from 'lucide-react'
import { people } from '../community/model'
import { demoPerson } from '../community/gateway'
import { changeLocale } from '../locales/i18n'
import { fixtureClock, closingScenarioTimestamp } from './clock'
import { NearbyConsent } from '../freshness/FreshPage'
import './profile-dashboard.css'

const tools = [
  {to:'/saved',icon:Heart,title:'Saved stalls',body:'Your favourite stops, all in one place.'},
  {to:'/commerce',icon:ShoppingBag,title:'Reservations & orders',body:'Reserve surplus food and collect at the stall.'},
  {to:'/community',icon:Users,title:'Reviews & confidential reports',body:'Share a good meal or raise a hygiene concern.'},
  {to:'/impact',icon:Leaf,title:'Community impact',body:'Meals shared, RM saved and food waste diverted.'},
  {to:'/partners',icon:Building2,title:'Community partners',body:'Market organisers, health agencies and food partners.'},
  {to:'/advanced',icon:Bell,title:'Notifications & insights',body:'Nearby offers, market updates and organiser dashboards.'},
  {to:'/hawker/voice',icon:Mic,title:'Voice listing',body:'Speak in BM, English or Manglish; review and confirm.'},
  {to:'/hawker/dashboard',icon:Store,title:'Hawker workspace',body:'Manage menus, batches, freshness and promotions.'},
  {to:'/hawker/planning',icon:TrendingUp,title:'Demand planning',body:'Weather-aware cooking plans and stock insights.'},
  {to:'/hawker/accounting',icon:BarChart3,title:'Sales & stock',body:'Track collections, savings and session outcomes.'},
  {to:'/commerce?account=brand-a',icon:Megaphone,title:'Advertise your stall',body:'Campaigns, sponsored placements and performance.'},
  {to:'/community?account=organiser-a',icon:ClipboardList,title:'Organiser hub',body:'Redacted concerns, market management and follow-up.'},
]
const hygiene={to:'/community?account=admin-a',title:'Hygiene review',body:'Moderation, independent reports and hawker replies.'}
export default function MarketProfile() {
  const {i18n}=useTranslation(), bm=i18n.language.startsWith('ms')
  const [person,setPerson]=useState(demoPerson), [location,setLocation]=useState(localStorage.getItem('pasarmalam:demo:location-choice')==='yes')
  const read=()=>{if('speechSynthesis' in window){speechSynthesis.cancel();const voice=new SpeechSynthesisUtterance(bm?'Pasar anda, pilihan anda. Terokai makanan dan sokong komuniti tempatan.':'Your market, your way. Explore good food and support your local community.');voice.lang=bm?'ms-MY':'en-MY';speechSynthesis.speak(voice)}}
  function restart() {
    for(const key of Object.keys(localStorage)) if(key.startsWith('pasarmalam:demo:') && !['pasarmalam:demo:experience-version','pasarmalam:demo:role'].includes(key))localStorage.removeItem(key)
    fixtureClock.setScenario(closingScenarioTimestamp());window.location.assign('/demo/discover')
  }
  const initials=person.name.split(' ').map(n=>n[0]).slice(0,2).join('')
  return <div className="profile-dash">
    <header className="pd-card pd-hero">
      <div className="pd-hero-copy"><span className="pd-label">{bm?'KOMUNITI ANDA':'YOUR MARKET COMMUNITY'}</span><h1>{bm?<>Pasar anda,<br/>pilihan anda.</>:<>Your market,<br/>your way.</>}</h1><p>{bm?'Makanan enak. Komuniti mesra. Kurang pembaziran.':'Good food. Good neighbours. A little less waste.'}</p></div>
      <div className="pd-hero-photo" aria-hidden="true"/>
    </header>

    <section className="pd-card pd-welcome" aria-label={bm?'Akaun anda':'Your account'}>
      <div className="pd-avatar" aria-hidden="true">{initials}</div>
      <div className="pd-welcome-copy"><span className="pd-label">{bm?'SELAMAT DATANG KEMBALI':'WELCOME BACK'}</span><h2>{person.name}</h2><p><Check size={14}/>{bm?'Ahli komuniti disahkan':'Verified community member'} · Petaling Jaya, Selangor</p></div>
      <label className="pd-switch"><span>{bm?'Tukar akaun':'Switch account'}</span><select value={person.id} onChange={e=>{const next=people.find(p=>p.id===e.target.value)!;setPerson(next);localStorage.setItem('pasarmalam:demo:community-person',next.id);localStorage.setItem('pasarmalam:demo:role',next.role==='vendor'?'hawker':'customer');window.location.reload()}}>{people.filter(p=>p.verified).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
    </section>

    <nav className="pd-grid" aria-label={bm?'Alat anda':'Your tools'}>{tools.map(({to,icon:Icon,title,body})=><NavLink key={to} className="pd-card pd-tool" to={to}><span className="pd-icon"><Icon size={20}/></span><h3>{title}</h3><p>{body}</p><ArrowRight className="pd-arrow" size={18} aria-hidden="true"/></NavLink>)}</nav>

    <NavLink className="pd-card pd-highlight" to={hygiene.to}><span className="pd-icon"><ShieldCheck size={20}/></span><div><h3>{hygiene.title}</h3><p>{hygiene.body}</p></div><ArrowRight className="pd-arrow" size={18} aria-hidden="true"/></NavLink>

    <section className="pd-card pd-prefs" aria-labelledby="pd-prefs-title">
      <h2 id="pd-prefs-title"><Settings size={19}/>{bm?'Tetapan anda':'Your preferences'}</h2>
      <p className="pd-sub">{bm?'Urus bahasa, privasi dan notifikasi anda.':'Manage your language, privacy and notifications.'}</p>
      <div className="pd-prefs-cols">
        <div className="pd-pref"><h3><Globe size={15}/>{bm?'Bahasa':'Language'}</h3><div className="pd-buttons"><button type="button" className={bm?'':'active'} aria-pressed={!bm} onClick={()=>void changeLocale('en')}>English</button><button type="button" className={bm?'active':''} aria-pressed={bm} onClick={()=>void changeLocale('ms')}>Bahasa Melayu</button><button type="button" onClick={read}><Volume2 size={15}/>{bm?'Baca dengan suara':'Read aloud'}</button></div></div>
        <div className="pd-pref"><h3><Lock size={15}/>{bm?'Privasi':'Privacy'}</h3><label className="pd-check"><input type="checkbox" checked={location} onChange={e=>{setLocation(e.target.checked);localStorage.setItem('pasarmalam:demo:location-choice',e.target.checked?'yes':'no')}}/><span>{bm?'Gunakan lokasi anggaran':'Use approximate location'}</span></label><p className="pd-note">{bm?'Lokasi adalah pilihan anda. Laporan kebersihan merahsiakan identiti anda.':'Location is your choice. Hygiene reports keep your identity private.'}</p><div className="pd-nearby"><NearbyConsent mode="fixture"/></div></div>
      </div>
    </section>

    <section className="pd-card pd-cta"><Clock3 size={24} aria-hidden="true"/><div><h3>{bm?'Terokai satu lagi malam di pasar':'Another evening at the market'}</h3><p>{bm?'Mulakan semula dengan kelompok, tawaran dan cerita komuniti yang lengkap.':'Start afresh with prepared batches, evening offers and community stories.'}</p></div><button type="button" className="button primary" onClick={restart}>{bm?'Mulakan malam baharu':'Start a new evening'}<ArrowRight size={16}/></button></section>
  </div>
}
