import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { ArrowRight, Heart, Star, type LucideIcon } from 'lucide-react'
import type { DataGateway } from '../data/types'
import { ui } from '../locales/phrases'
import { useFavourites } from './actions'
import './FoodCard.css'

// One card anatomy for "Trending tonight", "Freshly made" and "Selling out soon" (each grid lays it out in FoodCard.css):
// photo with badge pill (top-left) + save heart (top-right), name, price, icon meta row,
// then a footer tag and the round arrow that opens the stall.

export type BadgeKind = 'popular' | 'best' | 'fresh' | 'hot' | 'chilled' | 'local' | 'must'
export function CardBadge({ kind, label, Icon }: { kind: BadgeKind; label: string; Icon: LucideIcon }) {
  return <span className={`food-badge ${kind}`}><Icon size={12} aria-hidden="true"/>{label}</span>
}

// Footer tag: a pill with a leading icon; becomes a link when `to` is given (e.g. batch passport)
export function CardTag({ Icon, tone = 'muted', to, label, children }: { Icon: LucideIcon; tone?: 'fresh' | 'clear' | 'muted'; to?: string; label?: string; children: ReactNode }) {
  const body = <><Icon size={13} aria-hidden="true"/><span>{children}</span></>
  return to
    ? <NavLink className={`food-tag ${tone} food-tag-link`} to={to} aria-label={label}>{body}</NavLink>
    : <span className={`food-tag ${tone}`}>{body}</span>
}

type Meta = { Icon: LucideIcon; text: string }
export function FoodCard({ gateway, stallId, stallName, to, title, priceSen, wasPriceSen, rating, photo, badge, meta, tag, note, extra, track, action = 'arrow', size = 'regular' }: {
  gateway: DataGateway; stallId: string; stallName: string; to: string; title: string; priceSen: number; wasPriceSen?: number
  rating?: string; photo: ReactNode; badge?: ReactNode; meta: Meta[]; tag?: ReactNode; note?: ReactNode
  extra?: ReactNode; track?: ReactNode; action?: 'arrow' | 'details'; size?: 'regular' | 'compact'
}) {
  const saved = useFavourites(gateway), isSaved = saved.ids.includes(stallId)
  return <article className={`food-card ${size}`}>
    <div className="food-photo">{photo}{badge && <div className="food-badge-slot">{badge}</div>}</div>
    <button type="button" className="food-save" aria-pressed={isSaved} aria-label={`${ui(isSaved ? 'Unsave' : 'Save')} ${stallName}`} disabled={!saved.allowed || saved.loading} onClick={() => void saved.save(stallId, !isSaved).catch(() => undefined)}><Heart size={16} fill={isSaved ? 'currentColor' : 'none'}/></button>
    <div className="food-body">
      <h3><NavLink className="stretched-link" to={to}>{title}</NavLink></h3>
      <div className="food-price-row"><span className="food-price-stack"><strong className="food-price">RM {(priceSen / 100).toFixed(2)}</strong>{wasPriceSen !== undefined && <s className="food-was">RM {(wasPriceSen / 100).toFixed(2)}</s>}</span>{rating && <span className="food-rating"><Star size={12} aria-hidden="true"/>{rating}</span>}</div>
      <ul className="food-meta">{meta.filter(m => m.text).map(({ Icon, text }) => <li key={text}><Icon size={13} aria-hidden="true"/><span>{text}</span></li>)}</ul>
      {extra}
      {note && <div className="food-note">{note}</div>}
      {action === 'details'
        ? <div className="food-foot"><span className="food-details" aria-hidden="true">{ui('View details')}<ArrowRight size={14}/></span></div>
        : <div className="food-foot">{tag ?? <span/>}<span className="food-go" aria-hidden="true"><ArrowRight size={16}/></span></div>}
    </div>
    {track}
  </article>
}
