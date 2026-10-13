import { Activity, ArrowDownToLine, CheckCircle2, CircleDollarSign, Leaf, MapPinned, UsersRound } from 'lucide-react'
import { fixtureClock } from '../app/clock'
import { buildDemoMarketHealthReport, percentChange } from './market-health'
import './market-health-report.css'

function Sparkline({ values, label, positive = true }: { values: number[]; label: string; positive?: boolean }) {
  const width = 160, height = 38, padding = 4
  const low = Math.min(...values), span = Math.max(...values) - low || 1
  const points = values.map((value, index) => ({
    x: padding + index * (width - padding * 2) / Math.max(1, values.length - 1),
    y: height - padding - (value - low) * (height - padding * 2) / span,
  }))
  const line = points.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(' ')
  const last = points[points.length - 1]
  return <svg className={`organizer-sparkline ${positive ? 'positive' : ''}`} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={label}>
    <path className="sparkline-baseline" d={`M${padding},${height - padding} L${width - padding},${height - padding}`}/>
    <path className="sparkline-line" d={line}/>
    <circle className="sparkline-point" cx={last.x} cy={last.y} r="3"/>
  </svg>
}

export default function MarketHealthReport() {
  const report = buildDemoMarketHealthReport(fixtureClock.now())
  const date = new Intl.DateTimeFormat('en-MY', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kuala_Lumpur' }).format(report.generatedAt)
  const currency = (sen: number) => new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(sen / 100)
  const divertedChange = percentChange(report.divertedTrendKg)
  const recoveryChange = percentChange(report.recoveryTrendRm)
  const coverage = report.scheduledSessions ? Math.round(report.reportingSessions / report.scheduledSessions * 100) : 0

  return <main className="organizer-report-page" aria-labelledby="market-health-title">
    <header className="organizer-report-header">
      <div className="organizer-report-brand"><span className="organizer-report-mark"><MapPinned size={18}/></span><span>PASARMALAM <small>MARKET OPERATIONS</small></span></div>
      <div className="organizer-report-head-row"><div><span className="organizer-report-eyebrow">COUNCIL & MARKET ORGANIZER BRIEF</span><h1 id="market-health-title">Market Health Report</h1><p className="organizer-report-marketline">{report.marketName} <span>·</span> generated {date}</p></div><button type="button" className="organizer-report-export" onClick={() => window.print()}><ArrowDownToLine size={16}/>Export summary</button></div>
      <div className="organizer-report-disclosure"><UsersRound size={18}/><p><strong>Aggregated, anonymized data across {report.participatingStalls} participating stalls.</strong><span> Market-level indicators only; individual hawker names and stall-level figures are not shown.</span></p><span className="organizer-report-watermark">FICTIONAL · DEMO ONLY</span></div>
    </header>

    <section className="organizer-report-metrics" aria-label="Market-wide headline metrics">
      <article className="organizer-metric-tile organizer-metric-trend"><div className="organizer-metric-label"><Leaf size={16}/>Estimated food diverted</div><strong className="organizer-metric-value">{report.foodDivertedKg.toFixed(1)} <small>kg</small></strong><p>Meal reuse (weighed + estimated), compost and BSF collection across the four-week pilot.</p><div className="organizer-metric-spark"><Sparkline values={report.divertedTrendKg} label={`Illustrative monthly food diversion trend from ${report.divertedTrendKg[0]} to ${report.foodDivertedKg} kilograms`}/><span className="organizer-trend-positive">+{divertedChange}% <small>May–Oct</small></span></div></article>
      <article className="organizer-metric-tile organizer-metric-trend"><div className="organizer-metric-label"><CircleDollarSign size={16}/>Net clearance recovery</div><strong className="organizer-metric-value">{currency(report.netRecoverySen)}</strong><p>Estimated clearance receipts after refunds, commissions and incremental costs.</p><div className="organizer-metric-spark"><Sparkline values={report.recoveryTrendRm} label={`Illustrative monthly net clearance recovery trend, latest ${currency(report.netRecoverySen)}`}/><span className="organizer-trend-positive">+{recoveryChange}% <small>May–Oct</small></span></div></article>
      <article className="organizer-metric-tile"><div className="organizer-metric-label"><UsersRound size={16}/>Active hawkers onboarded</div><strong className="organizer-metric-value">{report.participatingStalls}</strong><p>Distinct stalls with at least one participating session; names withheld.</p><div className="organizer-metric-foot"><span className="organizer-metric-dot"/>Four-week pilot sample</div></article>
      <article className="organizer-metric-tile"><div className="organizer-metric-label"><Activity size={16}/>Average customer visits / week</div><strong className="organizer-metric-value">{report.customerVisitsPerWeek.toLocaleString('en-MY')} <small>/ week</small></strong><p>Illustrative footfall estimate for the market; not a verified counter reading.</p><div className="organizer-metric-foot"><span className="organizer-metric-dot"/>Synthetic demo estimate</div></article>
      <article className="organizer-metric-tile"><div className="organizer-metric-label"><CheckCircle2 size={16}/>Reporting participation</div><strong className="organizer-metric-value">{report.reportingSessions}<small> / {report.scheduledSessions}</small></strong><p>Participating stall-sessions recorded in the pilot period.</p><div className="organizer-metric-foot"><span className="organizer-metric-dot"/>{coverage}% of scheduled sessions</div></article>
    </section>

    <section className="organizer-report-period" aria-label="Report period and methodology"><div><span>REFERENCE PERIOD</span><strong>Four-week pilot · {report.reportingSessions} participating sessions</strong></div><div><span>MONTHLY TREND</span><strong>Illustrative sample series · May–October</strong></div><div><span>DATA HANDLING</span><strong>Market-level aggregates; no stall-level breakdown</strong></div></section>
    <footer className="organizer-report-footer"><span>Prepared for local council and market organizers · {report.marketName}</span><span>Waste figures extend the existing Impact page collection calculation. Visit counts and monthly trend history are clearly labeled synthetic demo estimates.</span></footer>
  </main>
}
