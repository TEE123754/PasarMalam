import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, RotateCcw, Search } from 'lucide-react'
import type { DiscoverySnapshot } from '../data/types'
import { ui } from '../locales/phrases'
import { noOfferFilters, offerFiltersActive, offerOptions, type OfferFilters } from './offer-filters'
import './OffersControls.css'

type Offer = DiscoverySnapshot['offers'][number]

export function offerKindLabel(id: string, pct?: number) {
  return id === 'free' ? ui('Share a meal') : id === 'bogo' ? ui('Buy 1, get 1') : pct ? ui('{pct}% off', { pct }) : ui('Other offer')
}

// Shown only while a search or filter is active
export function ResetOfferFilters({ filters, onReset }: { filters: OfferFilters; onReset: () => void }) {
  const { t } = useTranslation()
  if (!offerFiltersActive(filters)) return null
  return <button type="button" className="button secondary offers-reset" onClick={onReset}><RotateCcw size={16} aria-hidden="true"/>{t('resetFilters')}</button>
}

// Search and three filters. Results follow every keystroke and selection; the page holds the state.
export function OffersControls({ data, offers, filters, onChange }: { data: DiscoverySnapshot; offers: Offer[]; filters: OfferFilters; onChange: (next: OfferFilters) => void }) {
  const { t } = useTranslation()
  const options = offerOptions(data, offers, filters)
  const select = (key: 'category' | 'market' | 'kind', label: string, all: string, items: { id: string; label: string }[]) =>
    <label className={`offers-select ${filters[key] ? 'on' : ''}`}>
      <span className="sr-only">{label}</span>
      <select value={filters[key]} aria-label={label} onChange={event => onChange({ ...filters, [key]: event.target.value })}>
        <option value="">{all}</option>
        {items.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
      </select>
      <ChevronDown size={18} aria-hidden="true"/>
    </label>
  return <div className="discover-dark offers-controls">
    <form className="offers-search" role="search" onSubmit={event => event.preventDefault()}>
      <Search size={20} aria-hidden="true"/>
      <label className="sr-only" htmlFor="offers-search">{ui('Search for food or stalls...')}</label>
      <input id="offers-search" type="search" value={filters.search} autoComplete="off" placeholder={ui('Search for food or stalls...')} onChange={event => onChange({ ...filters, search: event.target.value })}/>
    </form>
    <div className="offers-filters">
      {select('category', ui('Category'), ui('All categories'), options.categories.map(item => ({ id: item.id, label: ui(item.en) })))}
      {select('market', ui('Market'), t('anyMarket'), options.markets.map(item => ({ id: item.id, label: item.name })))}
      {select('kind', ui('Offer type'), ui('All offer types'), options.kinds.map(item => ({ id: item.id, label: offerKindLabel(item.id, item.pct) })))}
      <ResetOfferFilters filters={filters} onReset={() => onChange(noOfferFilters)}/>
    </div>
  </div>
}

// An original drawing: a striped-awning market stall with a magnifying glass, in the page's night-market colours.
function StallArt() {
  return <svg className="offers-empty-art" viewBox="0 0 240 150" width="240" height="150" aria-hidden="true" focusable="false">
    <ellipse cx="112" cy="140" rx="92" ry="7" fill="#000" opacity=".35"/>
    <rect x="46" y="62" width="132" height="76" rx="4" fill="#3a2b17"/>
    <rect x="58" y="92" width="108" height="10" rx="2" fill="#5a4426"/>
    <rect x="58" y="102" width="108" height="36" fill="#26180c"/>
    <circle cx="78" cy="86" r="7" fill="#c83c08"/><circle cx="96" cy="87" r="6" fill="#f5b942"/><circle cx="112" cy="86" r="7" fill="#8fd98a"/>
    <rect x="52" y="62" width="4" height="76" fill="#5a4426"/><rect x="168" y="62" width="4" height="76" fill="#5a4426"/>
    <path d="M38 62 L52 22 H172 L186 62 Z" fill="#f5e3c8"/>
    <path d="M52 22 H77 L72 62 H38 Z M101 22 H126 L128 62 H103 Z M150 22 H172 L186 62 H158 Z" fill="#c83c08"/>
    <path d="M38 62 q9 10 17 0 q9 10 18 0 q9 10 18 0 q9 10 18 0 q9 10 18 0 q9 10 18 0 q9 10 17 0 L186 62 Z" fill="#c83c08" opacity=".9"/>
    <g fill="#f5b942"><circle cx="44" cy="14" r="3"/><circle cx="82" cy="10" r="3"/><circle cx="120" cy="12" r="3"/><circle cx="158" cy="10" r="3"/><circle cx="196" cy="14" r="3"/></g>
    <path d="M44 14 Q82 4 120 12 T196 14" fill="none" stroke="#5a4426" strokeWidth="1.5"/>
    <circle cx="176" cy="96" r="26" fill="#1e1608" fillOpacity=".7" stroke="#ff8a4c" strokeWidth="6"/>
    <path d="M164 86 a16 16 0 0 1 12 -6" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity=".6"/>
    <path d="M196 116 L222 142" stroke="#ff8a4c" strokeWidth="9" strokeLinecap="round"/>
  </svg>
}

// Drawing, the existing "No matching stalls" message, then whatever the page puts under it (the Reset filters button)
export function OffersEmpty({ children }: { children?: ReactNode }) {
  const { t } = useTranslation()
  return <div className="discover-dark offers-empty panel state-panel"><StallArt/><h3>{t('noMatches')}</h3><p>{t('relaxFilters')}</p>{children}</div>
}
