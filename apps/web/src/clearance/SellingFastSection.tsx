import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import type { DataGateway, DiscoverySnapshot } from '../data/types'
import { ui } from '../locales/phrases'
import { SectionTitle } from '../discovery/SectionTitle'
import { estimateItems, SellingOutCard, SellingOutRow } from '../discovery/SellingOutSoon'
import './OffersControls.css'

// "See what's selling fast tonight": the Discover estimate cards in one swipe row. It does not follow the Offers search or filters.
export function SellingFastSection({ data, now, gateway }: { data: DiscoverySnapshot; now: Date; gateway: DataGateway }) {
  const items = useMemo(() => estimateItems(data, now, () => true), [data, now])
  if (!items.length) return null
  return <section className="discover-dark selling-out selling-fast" aria-labelledby="selling-fast-title">
    <div className="section-heading selling-heading">
      <SectionTitle Icon={Flame} tone="flame" id="selling-fast-title" title={ui('See what’s selling fast tonight')} sub={ui('Estimates only. Not discounted and not a booking.')}/>
    </div>
    <SellingOutRow items={items} hideWhenFit>{item => <SellingOutCard item={item} data={data} now={now} gateway={gateway}/>}</SellingOutRow>
  </section>
}
