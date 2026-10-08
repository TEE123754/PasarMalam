import { NavLink } from 'react-router'
import { Leaf, Mic, MapPin, Clock3 } from 'lucide-react'
import { DemoDialog } from './DemoDialog'
export default function LandingPage() {
  return <div className="landing-market"><header className="landing-hero"><span className="eyebrow">MADE FOR MALAYSIA'S MARKET COMMUNITIES</span><h1>Good food.<br/>Good neighbours.<br/><span>Less waste.</span></h1><p>Discover pasar malam and pasar pagi, meet local hawkers, and make the most of every freshly prepared batch.</p><div className="button-row"><DemoDialog/><NavLink className="button secondary" to="/discover">Explore markets</NavLink></div></header><div className="landing-features">{[{Icon:MapPin,title:'Find your market',body:'Discover markets and food stalls on the map.'},{Icon:Clock3,title:'Know your batch',body:'See preparation times and advisory countdowns.'},{Icon:Leaf,title:'Save a meal',body:'Reserve surplus food before its advisory window ends.'},{Icon:Mic,title:'Just say it',body:'List food by voice in BM, English or Manglish.'}].map(({Icon,title,body})=><article className="panel" key={title}><Icon size={26}/><h2>{title}</h2><p>{body}</p></article>)}</div></div>
}
