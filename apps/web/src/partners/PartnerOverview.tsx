import { NavLink } from 'react-router'
import { Building2, HandHeart, Leaf, Newspaper, ShieldCheck, Truck, ArrowUpRight } from 'lucide-react'
import { directory } from './model'
import { partnerWorld } from './gateway'
const organisations=[
  {id:'media',Icon:Newspaper,tag:'FOOD DISCOVERY',account:'editor',work:'Food trails, stall features and creator collaborations'},
  {id:'health',Icon:ShieldCheck,tag:'HEALTH & HYGIENE',account:'officer',work:'Confidential referrals, case follow-up and inspection checklists'},
  {id:'council',Icon:Building2,tag:'MARKET MANAGEMENT',account:'council',work:'Stall permits, market capacity and community dashboards'},
  {id:'charity',Icon:HandHeart,tag:'SURPLUS FOOD',account:'charity',work:'Meal sharing and timely collection before the advisory cutoff'},
  {id:'compost',Icon:Leaf,tag:'CIRCULAR ECONOMY',account:'compost',work:'Separate non-consumption collection and waste-diversion records'},
  {id:'delivery-demo',Icon:Truck,tag:'LOCAL COLLECTION',account:'delivery-demo',work:'Market pickups, order handovers and collection updates'},
]
export default function PartnerOverview(){
  const world=partnerWorld(), records=world.partners!.entries
  return <div className="partner-overview"><header className="page-intro"><span className="eyebrow">A STRONGER MARKET, TOGETHER</span><h1>Your community, connected.</h1><p>Food discovery, local councils, health teams and surplus partners working around one market community.</p><NavLink className="button secondary" to="/partners/workspace">Open partnership workspace<ArrowUpRight size={17}/></NavLink></header>
    <div className="partner-summary"><div><strong>{directory.length}</strong><span>Community organisations</span></div><div><strong>{records.filter(r=>r.kind==='permit'&&r.status==='approved').length}</strong><span>Approved stall permits</span></div><div><strong>{records.filter(r=>r.kind==='collection'&&r.status==='collected').length}</strong><span>Completed collections</span></div><div><strong>{records.filter(r=>r.kind==='case'&&r.status==='resolved').length}</strong><span>Resolved hygiene cases</span></div></div>
    <div className="partner-card-grid">{organisations.map(({id,Icon,tag,account,work})=>{const org=directory.find(o=>o.id===id)!;return <article className="panel partner-card" key={id}><span className="tool-icon"><Icon size={26}/></span><span className="eyebrow">{tag}</span><h2>{org.name}</h2><p>{work}</p><span className="partner-connected"><span className="status-dot"/>Workspace connected</span><NavLink className="button secondary" to={`/partners/workspace?account=${account}`}>View workspace<ArrowUpRight size={16}/></NavLink></article>})}</div>
    <section className="panel partner-flow"><h2>How a hygiene concern is handled</h2><ol><li><strong>Customer submits privately</strong><span>Verified accounts and confidential evidence.</span></li><li><strong>Organiser reviews</strong><span>Redacted summaries and a hawker right of reply.</span></li><li><strong>Health team follows up</strong><span>Reviewed referral, case tracking and an inspection checklist.</span></li></ol><NavLink className="button primary" to="/community">Reviews & confidential reports</NavLink></section>
    <section className="panel"><h2>Recent community activity</h2><div className="partner-activity">{records.filter(r=>['case','collection','permit','collaboration'].includes(r.kind)).slice(-6).map(r=><article key={r.id}><span className="status-pill open">{r.status}</span><div><strong>{directory.find(o=>o.id===r.org)?.name}</strong><p>{r.body}</p></div></article>)}</div></section>
  </div>
}
