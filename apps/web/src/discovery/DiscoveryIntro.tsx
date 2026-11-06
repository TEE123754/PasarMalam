import type { ReactNode } from 'react'
import { ui } from '../locales/phrases'
import { MapPin } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { DiscoverySnapshot } from '../data/types'
import type { Filters } from './engine'

export function DiscoveryIntro({data,filters,children}:{data?:DiscoverySnapshot;filters:Filters;children:ReactNode}) {
 const {i18n}=useTranslation()
 const bm=i18n.language.startsWith('ms')
 const market=data?.markets.find(m=>m.id===filters.market)
 // The hero has no background of its own: the page-wide night-market photo shows through, and the satay fades into it
 return <header className={`discovery-hero ${filters.type==='day'?'day':'night'}`}><img className="discovery-hero-photo" src="/demo/images/batch-satay-1.webp" alt="" width={960} height={960} fetchPriority="high" decoding="async"/><div className="discovery-hero-copy">{market&&<div className="location-kicker"><MapPin size={16}/><span>{market.name} · {market.area}</span></div>}<span className="hero-tags">{ui('Fresh off the grill')}</span><h1>{ui("Discover tonight's")}<br/><span className="hero-accent">{ui('best bites.')}</span></h1><p>{bm?'Rasa tempatan. Penjaja pilihan. Tawaran sebelum pasar tutup.':'Fresh flavours. Local favourites. A good deal before closing.'}</p>{children}</div></header>
}
