import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, CircleDot, Compass, ShieldCheck, Tag, TrendingUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { NavLink, useParams } from 'react-router'
import { RoleGate } from '../auth/AuthCard'
import type { AppMode } from '../data/types'
import { freshness } from '../freshness/gateway'
import i18n from '../locales/i18n'
import { BatchPhoto } from '../components/BatchPhoto'
import type { BatchStatus } from './model'
import { elapsedPercent, isClosedBatchStatus, minutesUntil, recordedSales, windowLengthMinutes } from './lifecycle'
import './batch-lifecycle.css'

type StageState = 'complete' | 'current' | 'upcoming' | 'unrecorded'

export default function BatchLifecyclePage({ mode }: { mode: AppMode }) {
  return mode === 'fixture'
    ? <LifecycleView mode={mode}/>
    : <RoleGate required="vendor"><LifecycleView mode={mode}/></RoleGate>
}

function LifecycleView({ mode }: { mode: AppMode }) {
  const { batchId } = useParams()
  const query = useQuery({
    queryKey: ['freshness', mode],
    queryFn: () => freshness(mode),
    refetchInterval: 10_000,
    retry: 1,
  })

  if (query.isPending) return <div className="panel state-panel" role="status">Loading batch timeline…</div>
  if (query.isError || !query.data) return <div className="panel state-panel" role="alert"><h1>Batch timeline unavailable</h1><p>Could not load this batch’s records.</p><button className="button secondary" onClick={() => void query.refetch()}>Retry</button></div>

  const { workspace, state, server_now: serverNow } = query.data
  const batch = workspace.batches.find(item => item.id === batchId)
  if (!batch) return <div className="lifecycle-page"><NavLink className="button secondary" to="/hawker/stall#batches"><ArrowLeft size={16}/> Back to batches</NavLink><section className="lifecycle-missing"><h1>Batch not found</h1><p>No matching batch record was found in this workspace.</p></section></div>

  const food = workspace.foods.find(item => item.id === batch.food_item_id)
  const stall = workspace.stalls.find(item => item.id === food?.stall_id)
  const decision = state.decisions[batch.id]
  const deadline = decision?.deadline ?? batch.advisory_deadline
  const promotions = state.promotions.filter(item => item.batch === batch.id)
  const activePromotion = promotions.some(item => item.state === 'active')
  const approvals = state.audit.filter(item => item.batch === batch.id && item.kind === 'hawker-confirmed-offer').sort((a, b) => Date.parse(a.at) - Date.parse(b.at))
  const listingEvent = workspace.events.find(item => item.batch_id === batch.id && ['listed', 'listing-live', 'listing-published'].includes(item.kind))
    ?? state.audit.find(item => item.batch === batch.id && ['listed', 'listing-live', 'listing-published'].includes(item.kind))
  const listingLiveAt = listingEvent?.at ?? null
  // Only a recorded go-live event proves the customer listing; an active status or promotion alone does not (DESIGN.md)
  const listingRecorded = !!listingLiveAt
  const listingImplied = !listingRecorded && (batch.status === 'active' || promotions.length > 0)
  const closed = isClosedBatchStatus(batch.status)
  const advisoryRecorded = !!deadline
  const advisoryCurrent = !closed && !activePromotion && (decision?.eligible === true || batch.status === 'active')
  const listingStage: StageState = listingRecorded ? 'complete' : listingImplied || batch.status === 'needs-information' ? 'current' : 'unrecorded'
  const advisoryStage: StageState = advisoryCurrent ? 'current' : advisoryRecorded ? 'complete' : batch.status === 'needs-information' ? 'current' : 'unrecorded'
  const clearanceStage: StageState = activePromotion ? 'current' : promotions.length ? 'complete' : 'unrecorded'
  const closedStage: StageState = closed ? 'current' : 'upcoming'
  const preparedAt = batch.corrected_prepared_at ?? batch.prepared_at
  const progress = elapsedPercent(preparedAt, deadline, serverNow)
  const windowMinutes = windowLengthMinutes(preparedAt, deadline)
  const remaining = typeof decision?.remaining === 'number' && Number.isFinite(decision.remaining) ? decision.remaining : minutesUntil(deadline, serverNow)
  const sales = recordedSales(workspace, state, batch.id)
  const statusLabel = labelStatus(batch.status)

  return <div className="lifecycle-page">
    <div className="lifecycle-topline"><NavLink className="lifecycle-back" to="/hawker/stall#batches"><ArrowLeft size={16}/> Back to batches</NavLink><span className="lifecycle-source">{mode === 'fixture' ? 'FICTIONAL DEMO · Stored records only' : 'Connected batch records'}</span></div>
    <header className="lifecycle-intro"><div><p className="lifecycle-eyebrow">BATCH TRACE · {food?.name ?? 'Food'}</p><h1>{food?.name ?? 'Batch lifecycle'} <span>· Batch {batch.batch_number}</span></h1><p>One recorded timeline from preparation through advisory, offer activity, and final status. Missing fields are shown as “Not recorded”.</p></div><span className={`lifecycle-status lifecycle-status-${batch.status}`}>{statusLabel}</span></header>

    <section className="lifecycle-summary" aria-label="Batch summary">
      <div className="lifecycle-summary-heading"><div><h2>One batch, one connected story</h2><p>Preparation · discovery · freshness · clearance · outcome</p></div><span className="lifecycle-batch-id">{batch.id}</span></div>
      <ol className="lifecycle-timeline">
        <StageCard number={1} title="Prepared" state="complete" hint="Batch record">
          <div className="lifecycle-photo"><BatchPhoto food={food?.name ?? 'Food'} number={batch.batch_number} foodId={batch.food_item_id} batchId={batch.id} photo={batch.photo}/></div>
          <Fields>
            <Field label="Dish" value={food?.name ?? 'Not recorded'}/>
            <Field label="Prepared at" value={formatDate(preparedAt)}/>
            {batch.corrected_prepared_at && <Field label="Original time" value={formatDate(batch.prepared_at)}/ >}
            <Field label="Prepared quantity" value={portionCount(batch.original_quantity)}/>
          </Fields>
        </StageCard>

        <StageCard number={2} title="Customer listing" state={listingStage} hint={listingImplied ? `${batch.status === 'active' ? 'Active now' : `Status: ${statusLabel}`} · go-live time not recorded` : batch.status === 'active' ? 'Active now' : `Status: ${statusLabel}`}>
          <Fields>
            <Field label="Batch entered (hawker record)" value={formatDate(batch.uploaded_at)}/>
            <Field label="Listing went live for customers" value={formatDate(listingLiveAt)}/>
            <Field label="Initial quantity" value={portionCount(batch.original_quantity)}/>
            <Field label="Voice-entry confidence" value="Not recorded"/>
          </Fields>
          <p className="lifecycle-small-note">The batch record has an entry time; no separate live/published timestamp or batch-linked confidence is stored.</p>
        </StageCard>

        <StageCard number={3} title="Advisory active" state={advisoryStage} hint={decision?.eligible ? 'Eligible now' : decision ? 'Not eligible now' : 'Advisory state not recorded'}>
          <Fields>
            <Field label="Advisory deadline" value={formatDate(deadline)}/>
            <Field label="Time remaining" value={remaining === null ? 'Not recorded' : minutesLeft(remaining)}/>
            <Field label="Remaining stock" value={portionCount(batch.remaining_quantity)}/>
          </Fields>
          {progress !== null ? <div className="lifecycle-progress-block"><div className="lifecycle-progress-copy"><span>Elapsed vs recorded limit</span><strong>{progress}% · {windowMinutes === null ? 'duration not recorded' : `${durationLabel(windowMinutes)} total`}</strong></div><div className="lifecycle-progress" role="progressbar" aria-label="Elapsed advisory window" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><span style={{ width: `${progress}%` }}/></div><small>Calculated from recorded preparation and deadline times.</small></div> : <p className="lifecycle-small-note">Elapsed-time progress: Not recorded (a valid preparation time and advisory deadline are required).</p>}
          {decision?.reasons?.length ? <ul className="lifecycle-reasons">{decision.reasons.map((reason, index) => <li key={`${reason}-${index}`}>{reason}</li>)}</ul> : null}
        </StageCard>

        <StageCard number={4} title="Clearance offered" state={clearanceStage} hint={activePromotion ? 'Active offer recorded' : promotions.length ? 'Offer history recorded' : 'No offer details recorded'}>
          {promotions.length ? <div className="lifecycle-offers">{promotions.map(promotion => <article className="lifecycle-offer" key={promotion.id}><strong>{promotion.title}</strong><Fields>
            <Field label="Offer price" value={`${formatPrice(promotion.price)}${promotion.bundle > 1 ? ` / ${promotion.bundle}-portion bundle` : ' / portion'}`}/>
            <Field label="Original price" value={`${formatPrice(promotion.original)}${promotion.bundle > 1 ? ` / ${promotion.bundle}-portion bundle` : ' / portion'}`}/>
            <Field label="Offer units" value={portionCount(promotion.units)}/>
            <Field label="Offer status" value={labelStatus(promotion.state)}/>
            <Field label="Offer ends" value={formatDate(promotion.ends)}/>
          </Fields></article>)}</div> : <p className="lifecycle-unrecorded">Not recorded for this batch.</p>}
          <Fields>
            <Field label="AI-suggested price" value="Not recorded"/>
            <Field label="Why this price" value="Not recorded"/>
            <Field label="Hawker approval" value={approvals.length ? `Confirmed · ${approvals.length} approval record${approvals.length === 1 ? '' : 's'}` : 'Not recorded'}/>
            {approvals.length > 0 && <Field label="Latest approval time" value={formatDate(approvals.at(-1)?.at)}/>}
          </Fields>
          <p className="lifecycle-small-note">The stored promotion has a price and status; no AI price rationale is stored.</p>
        </StageCard>

        <StageCard number={5} title="Closed" state={closedStage} hint={closed ? `Final status: ${statusLabel}` : 'Not closed'}>
          <Fields>
            <Field label="Final outcome" value={closed ? statusLabel : 'Not recorded — batch is not closed'}/>
            <Field label="Prepared quantity" value={portionCount(batch.original_quantity)}/>
            <Field label="Direct inventory sales" value={portionCount(sales.inventorySales)}/>
            <Field label="Completed offer orders" value={portionCount(sales.completedOrders)}/>
            <Field label="Reported clearance units" value={portionCount(sales.reportedClearanceUnits)}/>
          </Fields>
          <p className="lifecycle-small-note">Sale sources are kept separate because the workspace has no reconciled batch-level sold-total field.</p>
        </StageCard>
      </ol>
    </section>

    <nav className="lifecycle-connections" aria-label="Connected PasarMalam views">
      <div className="lifecycle-connections-heading"><h2>Connected views</h2><p>Jump to the related customer and hawker workflows.</p></div>
      <div className="lifecycle-connection-grid">
        {stall && <NavLink to={`/stalls/${stall.id}`}><Compass size={18}/><span>Customer discovery</span></NavLink>}
        <NavLink to={`/passports/${batch.id}`}><ShieldCheck size={18}/><span>Freshness passport</span></NavLink>
        <NavLink to="/hawker/promotions"><Tag size={18}/><span>Clearance offers</span></NavLink>
        <NavLink to="/hawker/planning"><TrendingUp size={18}/><span>Planning forecast<small>Stall/session-level, not batch-specific</small></span></NavLink>
      </div>
    </nav>
  </div>
}

function StageCard({ number, title, state, hint, children }: { number: number; title: string; state: StageState; hint: string; children: ReactNode }) {
  const stateLabel = state === 'complete' ? 'Recorded' : state === 'current' ? 'Current stage' : state === 'upcoming' ? 'Not reached' : 'Not recorded'
  return <li className={`lifecycle-stage lifecycle-stage-${state}`}>
    <span className="lifecycle-node" aria-label={`${title}: ${stateLabel}`}>{state === 'complete' ? <Check size={15}/> : state === 'current' ? <CircleDot size={17}/> : number}</span>
    <section className="lifecycle-stage-card"><header><div><p className="lifecycle-stage-state">{stateLabel}</p><h3>{title}</h3></div><span className="lifecycle-stage-hint">{hint}</span></header><div className="lifecycle-stage-body">{children}</div></section>
  </li>
}

function Fields({ children }: { children: ReactNode }) { return <dl className="lifecycle-fields">{children}</dl> }
function Field({ label, value }: { label: string; value: ReactNode }) { return <div><dt>{label}</dt><dd>{value}</dd></div> }

function formatDate(value: string | null | undefined): string {
  if (!value || !Number.isFinite(Date.parse(value))) return 'Not recorded'
  return new Intl.DateTimeFormat(i18n.language === 'ms' ? 'ms-MY' : 'en-MY', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kuala_Lumpur' }).format(new Date(value))
}
function formatPrice(sen: number): string { return new Intl.NumberFormat(i18n.language === 'ms' ? 'ms-MY' : 'en-MY', { style: 'currency', currency: 'MYR' }).format(sen / 100) }
function portionCount(value: number | null | undefined): string { return typeof value === 'number' && Number.isFinite(value) ? `${new Intl.NumberFormat(i18n.language === 'ms' ? 'ms-MY' : 'en-MY').format(value)} portions` : 'Not recorded' }
function minutesLeft(minutes: number): string { return minutes < 60 ? `${minutes}m remaining` : `${Math.floor(minutes / 60)}h ${minutes % 60}m remaining` }
function durationLabel(minutes: number): string { return minutes < 60 ? `${minutes} min` : `${Math.floor(minutes / 60)}h ${minutes % 60}m` }
function labelStatus(status: BatchStatus | string): string { return status.replaceAll('-', ' ').replace(/\b\w/g, letter => letter.toUpperCase()) }
