import { useState } from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Check, Clock3, Copy, Gift, Heart, Leaf, MapPin, Navigation, ScrollText, Send, ShieldCheck, ShoppingBag, Star, Store, Utensils } from 'lucide-react'
import type { DataGateway, DiscoverySnapshot, Market, Stall } from '../data/types'
import { ui } from '../locales/phrases'
import TelemetryConsent from '../impact/TelemetryConsent'
import { labels as declarationLabels, allergenLabels } from '../listings/ListingStatements'
import { PublicFlag } from '../community/PublicFlag'
import { EditorialBadge } from '../partners/EditorialBadge'
import { DemoImage } from '../components/DemoImage'
import { BatchPhoto } from '../components/BatchPhoto'
import { foodImage } from '../components/demo-images'
import { destination } from './classifications'
import { Availability, PlantStatement } from './DiscoveryMetadata'
import { BatchFreshness, malaysiaTime } from './BatchFreshness'
import { dietaryStatus, distanceKm, eligibleOffers, scheduleStatus } from './engine'
import { useFavourites } from './actions'
import './stall-detail.css'

type Snapshot = DiscoverySnapshot
type Statement = 'yes' | 'no' | 'unknown'

// What each "Declared yes" statement means; "no"/"unknown" get neutral wording instead
const explain: Record<string, string> = {
  pork_free: 'This stall has voluntarily declared that no pork, lard, or pork-derived ingredients are used in any dish.',
  alcohol_free: 'This stall has voluntarily declared that no alcohol is used in cooking or served as a drink.',
  muslim_owned: 'The hawker has self-identified as a Muslim business owner. This is a voluntary statement, not a halal certification.',
}
const halalExplain: Record<string, string> = {
  certified: 'A halal certification claim is on record and has been reviewed. Check the certificate at the stall if it matters to you.',
  declared: 'The hawker declares all food is prepared according to halal guidelines. This is self-declared, not third-party certified.',
  'non-halal': 'The hawker has declared this stall is not halal.',
  'not-declared': 'The hawker has not made a halal statement. Ask at the stall.',
}

function clock12(value: string) {
  const [h, m] = value.split(':').map(Number)
  if (!Number.isFinite(h)) return value
  return `${h % 12 || 12}${m ? `:${String(m).padStart(2, '0')}` : ''}${h < 12 ? 'am' : 'pm'}`
}
function minutesLeft(deadline: string, now: Date) {
  const minutes = Math.max(0, Math.floor((Date.parse(deadline) - now.getTime()) / 60000)), h = Math.floor(minutes / 60)
  return h ? `${h}h ${minutes % 60}m` : `${minutes}m`
}

export function StallDetail({ gateway, data, stall, market, now }: { gateway: DataGateway; data: Snapshot; stall: Stall; market: Market; now: Date }) {
  const { t, i18n } = useTranslation()
  const saved = useFavourites(gateway), isSaved = saved.ids.includes(stall.id)
  const [statementsOpen, setStatementsOpen] = useState(true)
  const [explained, setExplained] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const timestamp = (value: string) => new Intl.DateTimeFormat(i18n.language === 'ms' ? 'ms-MY' : 'en-MY', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(value))

  const halal = dietaryStatus(stall, now)
  const point = destination(stall.latitude ?? market.latitude, stall.longitude ?? market.longitude)
  const menu = data.menu.filter(f => f.stallId === stall.id)
  const liveBatches = (foodId: string) => data.batches.filter(b => b.foodItemId === foodId && Date.parse(b.deadline) > now.getTime() && b.remaining > 0)
  const offers = eligibleOffers(data, now).filter(o => o.stallId === stall.id)
  const reviews = data.publicReviews.filter(r => r.stallId === stall.id)
  const hours = stall.opens && stall.closes ? `${clock12(stall.opens)} – ${clock12(stall.closes)}` : market.hours
  const initials = stall.name.split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase()
  // Only claim what the data supports
  const verified = stall.claims.some(c => c.status === 'certified' && c.evidence && c.reviewedAt)
  const badges = [
    halal === 'certified' ? { Icon: ShieldCheck, label: ui('Halal certified') } : halal === 'declared' ? { Icon: ShieldCheck, label: ui('Halal (hawker-declared)') } : null,
    menu.some(f => liveBatches(f.id).length) ? { Icon: Leaf, label: ui('Freshly prepared today') } : null,
    stall.reviews > 0 && stall.rating >= 4 ? { Icon: Star, label: ui('Local favourite') } : null,
  ].filter(b => b !== null)

  // Real nearby stalls: same market first, then the closest by coordinates
  const here = stall.latitude !== null && stall.longitude !== null ? { latitude: stall.latitude, longitude: stall.longitude } : market.latitude !== null && market.longitude !== null ? { latitude: market.latitude, longitude: market.longitude } : null
  // Within one market, only show metres when both stalls have their own pins (no market-entrance fallback)
  const nearby = data.stalls.filter(s => s.id !== stall.id).map(s => {
    const m = data.markets.find(x => x.id === s.marketId), sameMarket = s.marketId === stall.marketId
    const lat = sameMarket ? s.latitude : s.latitude ?? m?.latitude, lon = sameMarket ? s.longitude : s.longitude ?? m?.longitude
    const from = sameMarket ? (stall.latitude !== null && stall.longitude !== null ? { latitude: stall.latitude, longitude: stall.longitude } : null) : here
    return { s, m, km: from && lat != null && lon != null ? distanceKm(from, { latitude: lat, longitude: lon }) : null }
  }).sort((a, b) => Number(b.s.marketId === stall.marketId) - Number(a.s.marketId === stall.marketId) || (a.km ?? Infinity) - (b.km ?? Infinity)).slice(0, 4)

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) { await navigator.share({ title: stall.name, text: `${stall.name} · ${market.name}`, url }); return }
      await navigator.clipboard.writeText(url); setMessage('Stall link copied')
    } catch (error) { if ((error as Error).name !== 'AbortError') setMessage('Sharing unavailable — copy the address bar link') }
  }
  const toggleSave = () => void saved.save(stall.id, !isSaved).catch(() => setMessage('actionFailed'))
  const saveButton = (extra = '') => <button type="button" className={`stall-save ${extra}`} aria-pressed={isSaved} aria-label={`${t(isSaved ? 'unsaveStall' : 'saveStall')}: ${stall.name}`} disabled={!saved.allowed || saved.loading} onClick={toggleSave}><Heart size={16} fill={isSaved ? 'currentColor' : 'none'} /></button>

  return <div className="stall-detail">
    <TelemetryConsent mode={gateway.mode} stall={stall.id} />
    <NavLink className="back-link" to="/discover"><ArrowLeft size={17} />{t('back')}</NavLink>

    {/* Hero */}
    <header className="stall-hero">
      <div className="stall-hero-copy">
        <div className="stall-logo" aria-hidden="true"><Store size={22} /><span>{initials}</span></div>
        <div>
          <span className="eyebrow">{t('foodStall')}</span>
          <h1>{stall.name}</h1>
          <p className="stall-meta"><span><Clock3 size={14} />{hours}</span>{stall.lot && <span><MapPin size={14} />Lot {stall.lot}</span>}<span>{market.name} · {market.area}</span></p>
          <p className="stall-status"><span className={`status-dot ${stall.open ? 'open' : ''}`} />{t(stall.open ? 'vendorOpen' : 'vendorClosed')} · {t('scheduleOnly')}: {scheduleStatus(market, now) === 'closing-soon' ? ui('Closing soon') : t(scheduleStatus(market, now))}</p>
          <Availability at={stall.availabilityConfirmedAt} now={now} />
          {stall.description && <p className="stall-description">{stall.description}</p>}
          {badges.length > 0 && <ul className="stall-badges">{badges.map(({ Icon, label }) => <li key={label}><Icon size={14} aria-hidden="true" />{label}</li>)}</ul>}
          <PublicFlag stall={stall.id} /><EditorialBadge stall={stall.id} />
        </div>
      </div>
      <div className="stall-hero-art">
        <DemoImage image={foodImage(stall.specialty)} description={`${stall.specialty} from ${stall.name}`} priority />
        <span className="stall-hero-tagline" aria-hidden="true">{ui('Authentic Malaysian Flavours')}</span>
        {saveButton('on-photo')}
      </div>
    </header>

    {/* Actions */}
    <div className="stall-actions">
      <button type="button" className={statementsOpen ? 'active' : ''} aria-expanded={statementsOpen} aria-controls="hawker-statements" onClick={() => setStatementsOpen(!statementsOpen)}><ScrollText size={16} />{ui('Hawker statements')}</button>
      {point ? <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(point)}`} target="_blank" rel="noopener noreferrer"><Navigation size={16} />{ui('Directions in Google Maps')}</a> : <button type="button" disabled><Navigation size={16} />{ui('Directions in Google Maps')}</button>}
      <button type="button" disabled={!point} onClick={() => point && void navigator.clipboard.writeText(point).then(() => setMessage('Destination copied')).catch(() => setMessage('Copy unavailable — select the destination below'))}><Copy size={16} />{ui('Copy destination')}</button>
      <button type="button" onClick={() => void share()}><Send size={16} />{ui('Send to friend')}</button>
    </div>
    <p className="stall-actions-note">{point ? <>{ui('Only the destination is shared. Choose your starting point in the maps app.')} <span>{point}</span></> : ui('Directions unavailable — destination coordinates missing')}</p>
    {message && <p role="status" className="stall-message">{t(message, { defaultValue: ui(message) })}</p>}

    {/* Hawker statements */}
    <section id="hawker-statements" className="sd-card statements-card" hidden={!statementsOpen} aria-labelledby="statements-title">
      <div className="statements-photo"><DemoImage image={market.type === 'day' ? 'day' : 'night'} description={`${market.name} market scene`} /></div>
      <div className="statements-body">
        <div className="statements-head"><h2 id="statements-title">{ui('Hawker statements')}</h2>{verified && <span className="verified-badge"><Check size={14} />{ui('Verified claim')}</span>}</div>
        <ul className="statement-pills">
          {[['halal', t(`diet_${halal}`), halal === 'certified' || halal === 'declared' ? 'yes' : halal === 'non-halal' ? 'no' : 'unknown', halalExplain[halal]] as const,
            ...Object.entries(stall.declarations ?? { pork_free: 'unknown', alcohol_free: 'unknown', muslim_owned: 'unknown' }).map(([key, value]) => [key, ui(declarationLabels[key as keyof typeof declarationLabels]), value as Statement,
              value === 'yes' ? explain[key] : value === 'no' ? 'The hawker has declared this does not apply.' : 'The hawker has not made this statement. Ask at the stall.'] as const),
          ].map(([key, label, value, text]) => <li key={key} className={explained === key ? 'open' : ''}>
            <button type="button" className={`statement-pill ${value}`} aria-expanded={explained === key} aria-controls={`explain-${key}`} onClick={() => setExplained(explained === key ? null : key)}>
              <span className="statement-label">{label}</span>
              <span className="statement-value">{key === 'halal' ? ui(halal === 'certified' ? 'Certified ✓' : halal === 'declared' ? 'Declared ✓' : halal === 'non-halal' ? 'Not halal' : 'Not declared') : ui(value === 'yes' ? 'Declared ✓' : value === 'no' ? 'Declared no' : 'Not declared')}</span>
            </button>
            <p id={`explain-${key}`} className="statement-explain" role="note">{ui(text)}</p>
          </li>)}
        </ul>
        <p className="statements-disclaimer">{ui('These voluntary statements are not halal certification. No identity is inferred.')}</p>
        {stall.declarationsRecordedAt && <p className="statements-disclaimer">{ui('Recorded by the hawker')}: {timestamp(stall.declarationsRecordedAt)}</p>}
        <div className="statements-location">
          {stall.latitude !== null && stall.longitude !== null
            ? <><span><MapPin size={15} />{ui('Stall location')}: {stall.latitude.toFixed(5)}, {stall.longitude.toFixed(5)}</span><a className="button secondary" href={`https://www.openstreetmap.org/?mlat=${stall.latitude}&mlon=${stall.longitude}#map=18/${stall.latitude}/${stall.longitude}`} target="_blank" rel="noreferrer">{ui('View on map')}</a></>
            : <span className="muted">{ui('Directions use the market entrance; the stall pin is missing.')}</span>}
        </div>
      </div>
    </section>

    {/* Menu and batches */}
    <section className="stall-section" aria-labelledby="menu-title">
      <div className="stall-section-head"><div><h2 id="menu-title"><Utensils size={20} />{ui('Menu and batches')}</h2><p>{ui('Freshly prepared. Authentic flavours. Great value.')}</p></div></div>
      {menu.length ? <div className="menu-grid">{menu.map(f => {
        const batches = liveBatches(f.id), batch = batches[0]
        const offer = offers.find(o => o.foodItemId === f.id)
        return <article className="menu-card" key={f.id}>
          <div className="menu-photo">{batch ? <BatchPhoto food={f.name} number={batch.batchNumber} foodId={f.id} batchId={batch.id} photo={batch.photoUrl} /> : <DemoImage image={foodImage(f.name)} photo={f.photoUrl} description={`${f.name}, menu photo`} />}
            {f.name.toLowerCase() === stall.specialty.toLowerCase() && <span className="menu-badge"><Star size={12} />{ui('Popular')}</span>}
            {saveButton('on-card')}
          </div>
          <div className="menu-copy">
            <h3>{f.name}</h3>
            <strong className="menu-price">RM {(f.priceSen / 100).toFixed(2)}</strong>
            <p className="menu-meta"><span><Star size={12} />{stall.reviews ? `${ui('Stall')} ${stall.rating.toFixed(1)} (${stall.reviews})` : t('noReviews')}</span><span><Clock3 size={12} />{batch ? `${ui('Batch')} #${batch.batchNumber} · ${minutesLeft(batch.deadline, now)} ${ui('left')}` : ui('No batch right now')}</span></p>
            <p className="menu-desc">{f.ingredients.join(', ')}</p>
            <p className="menu-allergens">{f.allergens?.status === 'confirmed' ? `${ui('Allergens')}: ${f.allergens.contains.length ? f.allergens.contains.map(c => ui(allergenLabels[c])).join(', ') : ui('none listed (not an allergen-free claim)')}` : ui('Allergens not confirmed — ask the hawker')}</p>
            <details className="menu-details"><summary>{ui('Batch & dietary details')}</summary>
              <PlantStatement value={f.plantDiet} at={f.plantDietRecordedAt} />
              <p className="small">{t(`diet_${dietaryStatus(stall, now, f.id)}`)}</p>
              <p className="small">{ui(f.allergens?.cross_contact === 'possible' ? 'Cross-contact possible. Ask the hawker before ordering.' : 'Cross-contact is unknown. This list may be incomplete; ask the hawker before ordering.')}</p>
              {batches.length ? batches.map(b => <div className="batch-detail" key={b.id}><NavLink className="back-link" to={`/passports/${b.id}`}>{t('batchNumber', { number: b.batchNumber })} · {ui('Batch passport')}</NavLink><BatchFreshness batch={b} now={now} compact />{b.correctedPreparedAt && <p className="small">Earlier preparation correction: {timestamp(b.correctedPreparedAt)}</p>}<p className="small">{t('preparedAt')}: {timestamp(b.preparedAt)}</p><p className="small">{t('uploadedAt')}: {timestamp(b.uploadedAt)}</p><p className="small">{t('advisoryUntil')}: {timestamp(b.deadline)}</p><p className="small">{t('remainingUnits', { count: b.remaining })}</p></div>) : <p className="small">{t('noActiveBatches')}</p>}
            </details>
          </div>
          {offer ? <NavLink className="button primary menu-order" to={`/commerce?offer=${encodeURIComponent(offer.id)}`}><ShoppingBag size={16} />{ui('Order')}</NavLink> : <span className="menu-order-at-stall">{ui('Order at the stall')}</span>}
        </article>
      })}</div> : <p className="stall-empty">{t('emptyMenu')}</p>}
    </section>

    {nearby.length > 0 && <section className="stall-section" aria-labelledby="nearby-title">
      <div className="stall-section-head"><div><h2 id="nearby-title"><MapPin size={20} />{ui('You might also like')}</h2><p>{ui('Similar dishes from nearby stalls')}</p></div></div>
      <div className="menu-grid">{nearby.map(({ s, m, km }) => {
        const dish = data.menu.find(f => f.stallId === s.id && f.name.toLowerCase() === s.specialty.toLowerCase())
        return <article className="menu-card" key={s.id}>
          <div className="menu-photo"><DemoImage image={foodImage(s.specialty)} photo={dish?.photoUrl} description={`${s.specialty} from ${s.name}`} /><span className="menu-badge nearby">{ui('Nearby stall')}</span></div>
          <div className="menu-copy">
            <h3><NavLink className="stretched-link" to={`/stalls/${s.id}`}>{dish?.name ?? s.specialty}</NavLink></h3>
            <span className="menu-stall">{s.name}</span>
            <span className="menu-distance">{s.marketId === stall.marketId ? `${ui('Same market')}${km !== null ? ` · ~${Math.max(10, Math.round(km * 1000 / 10) * 10)} m` : ''}` : km !== null ? `~${km < 1 ? `${Math.round(km * 1000 / 50) * 50} m` : `${km.toFixed(1)} km`} ${ui('away')}` : m?.name}</span>
            <strong className="menu-price">RM {((dish?.priceSen ?? s.priceSen) / 100).toFixed(2)}</strong>
          </div>
        </article>
      })}</div>
    </section>}

    {/* Special offers */}
    <section className="sd-card offers-card" aria-labelledby="offers-title">
      <div className="stall-section-head"><div><h2 id="offers-title"><Gift size={20} />{ui('Special offers')}</h2><p>{ui('Grab the best deals before they’re gone!')}</p></div><NavLink className="section-link" to="/offers">{ui('View all offers')}<ArrowRight size={15} /></NavLink></div>
      {offers.length ? <div className="offer-row">{offers.slice(0, 3).map(o => {
        const off = o.originalPriceSen ? Math.round((1 - o.priceSen / o.originalPriceSen) * 100) : 0
        return <article className="offer-tile" key={o.id}>
          <strong className="offer-discount">{o.priceSen === 0 ? ui('FREE') : `${off}% ${ui('OFF')}`}</strong>
          <div className="offer-tile-copy"><h3>{o.title}</h3><p>{ui('Valid until')} {malaysiaTime(o.endsAt, i18n.language)} · RM {(o.priceSen / 100).toFixed(2)} <s>RM {(o.originalPriceSen / 100).toFixed(2)}</s></p></div>
          <NavLink className="button primary" to={`/commerce?offer=${encodeURIComponent(o.id)}`}>{ui('Claim')}</NavLink>
        </article>
      })}</div> : <p className="stall-empty">{t('noOffers')}. {ui('Surplus deals usually appear near closing time.')}</p>}
    </section>

    {/* Reviews */}
    <section className="stall-section" aria-labelledby="reviews-title">
      <div className="stall-section-head"><div><h2 id="reviews-title"><Star size={20} />{ui('Reviews')}</h2><p>{ui('What food lovers say about this stall')}</p></div><NavLink className="section-link" to={`/community/${stall.id}`}>{ui('View all reviews')}<ArrowRight size={15} /></NavLink></div>
      {reviews.length ? <div className="review-grid">{reviews.slice(0, 4).map(r => <article className="review-card" key={r.id}>
        <span className="review-stars" aria-label={`${r.rating} / 5`}>{[1, 2, 3, 4, 5].map(n => <Star key={n} size={14} fill={n <= r.rating ? 'currentColor' : 'none'} />)}</span>
        <strong>{r.rating}/5</strong>
        <p>{r.body}</p>
        <span className="review-author">{ui('Community member')}</span>
      </article>)}</div> : <p className="stall-empty">{t('noReviews')}</p>}
      <div className="review-actions"><NavLink className="button primary" to={`/community/${stall.id}?tab=review`}>{ui('Write a review')}</NavLink><NavLink className="button secondary" to={`/community/${stall.id}?tab=report`}>{ui('Report a hygiene concern')}</NavLink></div>
    </section>
  </div>
}
