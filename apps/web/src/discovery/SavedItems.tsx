import { useState } from 'react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import * as Dialog from '@radix-ui/react-dialog'
import { Bookmark, Heart, Route, Store } from 'lucide-react'
import type { DataGateway } from '../data/types'
import { ui } from '../locales/phrases'
import { DemoImage } from '../components/DemoImage'
import { foodImage } from '../components/demo-images'
import { savedItems, useFavourites } from './actions'
import { DiscoveryState } from './DiscoveryPage'
import { FoodCard } from './FoodCard'
import { SectionTitle } from './SectionTitle'
import { useDiscovery } from './useDiscovery'
import './SavedItems.css'

// "You have [3] favourites waiting for you tonight": the number alone is coloured, so the sentence is split around it.
// Each language keeps its own word order because the count is a placeholder inside one translated string.
function SavedTitle({ count }: { count: number }) {
  if (count === 0) return <>{ui('You have no favourites yet')}</>
  const MARK = '\u0000'
  const [before, after] = ui(count === 1 ? 'You have {count} favourite waiting for you tonight' : 'You have {count} favourites waiting for you tonight', { count: MARK }).split(MARK)
  return <>{before}<span className="saved-count">{count}</span>{after}</>
}

export function SavedPage({ gateway }: { gateway: DataGateway }) {
  const { t } = useTranslation()
  const query = useDiscovery(gateway, [])
  const saved = useFavourites(gateway)
  // The run is stall-based and kept in this page: two foods from one stall are one stop
  const [run, setRun] = useState<string[]>([])
  const [confirming, setConfirming] = useState<string | null>(null)
  const ready = saved.allowed && !saved.loading && !saved.error && !!query.data
  const items = query.data ? savedItems({ ids: saved.ids, foods: saved.foods }, query.data) : []
  // A stall leaves the run as soon as no saved item uses it
  const runStalls = run.filter(stallId => items.some(item => item.stallId === stallId))
  const plannerPath = `/planner?stalls=${encodeURIComponent(runStalls.join(','))}`

  return <>
    <header className="page-intro"><div className="eyebrow">{t('saved')}</div><h1><SavedTitle count={ready ? items.length : 0}/></h1><p>{t('savedBody')}</p></header>
    {saved.allowed && <div className="saved-plan">
      {runStalls.length
        ? <NavLink className="button primary" to={plannerPath}><Route size={18} aria-hidden="true"/>{ui("Plan tonight's run")}</NavLink>
        : <><button type="button" className="button primary" disabled aria-describedby="saved-plan-hint"><Route size={18} aria-hidden="true"/>{ui("Plan tonight's run")}</button><p id="saved-plan-hint" className="saved-plan-hint">{ui('Add a stall to your run first')}</p></>}
    </div>}
    {!saved.allowed ? <NavLink className="button primary" to="/profile">{t('signInToSave')}</NavLink>
      : !query.data ? <DiscoveryState query={query} gateway={gateway}/>
      : saved.error ? <p role="alert">{t('actionFailed')}</p>
      : saved.loading ? <p>{t('loading')}</p>
      : <section className="discover-dark saved-items" aria-labelledby="saved-items-title">
        <div className="section-heading"><SectionTitle Icon={Bookmark} tone="flame" id="saved-items-title" title={ui('Your saved items')}/></div>
        {items.length === 0
          ? <div className="panel state-panel"><Heart size={34}/><p>{t('emptySaved')}</p><NavLink className="button primary" to="/discover">{ui('Explore markets')}</NavLink></div>
          : <ul className="saved-grid">{items.map(item => {
            const data = query.data!
            const stall = data.stalls.find(entry => entry.id === item.stallId)!
            const food = data.menu.find(entry => entry.id === item.foodId)
            const title = food?.name ?? (stall.specialty || stall.name)
            const inRun = runStalls.includes(stall.id)
            return <li key={`${item.stallId}:${item.foodId ?? ''}`}>
              <FoodCard gateway={gateway} stallId={stall.id} stallName={stall.name} foodId={item.foodId} to={`/stalls/${stall.id}`} title={title} priceSen={food?.priceSen ?? stall.priceSen}
                photo={<DemoImage image={foodImage(food?.name ?? stall.specialty)} photo={food?.photoUrl} description={`${title} from ${stall.name}`} sizes="(max-width: 600px) 100vw, 400px"/>}
                meta={[{ Icon: Store, text: stall.name }]}
                footer={inRun
                  ? <button type="button" className="button saved-run-button remove" onClick={() => setConfirming(stall.id)}>{ui('Cancel it from my run')}</button>
                  : <button type="button" className="button saved-run-button add" onClick={() => setRun(current => [...new Set([...current, stall.id])])}>{ui('Add this to my run')}</button>}/>
            </li>
          })}</ul>}
      </section>}
    <Dialog.Root open={confirming !== null} onOpenChange={open => { if (!open) setConfirming(null) }}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay saved-overlay"/>
        <Dialog.Content className="dialog-content saved-dialog" aria-describedby={undefined}>
          <Dialog.Title>{ui('Are you sure?')}</Dialog.Title>
          <div className="saved-dialog-actions">
            <button type="button" className="button saved-run-button remove" onClick={() => { setRun(current => current.filter(id => id !== confirming)); setConfirming(null) }}>{ui('Yes, remove it')}</button>
            <Dialog.Close className="button secondary saved-keep">{ui('Keep it')}</Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </>
}
