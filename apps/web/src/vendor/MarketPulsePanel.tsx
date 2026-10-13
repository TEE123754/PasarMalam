import { Activity, ArrowUpRight, ShieldCheck, TrendingDown, TrendingUp, UsersRound } from 'lucide-react'
import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'
import type { VendorStall } from './model'
import { marketPulseAggregates, marketPulseLabel, suggestedPrepReductionPct } from './market-pulse'
import './market-pulse.css'
import '../planning/planning.css'

export function MarketPulsePanel({ stall }: { stall: VendorStall }) {
  const { i18n } = useTranslation()
  const isMalay = i18n.language.startsWith('ms')
  const insights = marketPulseAggregates(stall.category_id)
  const clearance = insights[0]
  const promotion = insights[1]
  const reduction = suggestedPrepReductionPct(clearance)
  const market = marketPulseLabel(stall.market_id)

  return <section className="hawker-card dashboard-section market-pulse" aria-labelledby="market-pulse-title">
    <div className="section-heading market-pulse-heading">
      <h2 id="market-pulse-title"><Activity size={22}/>{isMalay ? 'Nadi pasaran' : 'Market pulse'}</h2>
      <span className="market-pulse-sample">{isMalay ? 'CONTOH REKAAN' : 'FICTIONAL SAMPLE'}</span>
    </div>
    <div className="market-pulse-disclosure"><ShieldCheck size={19}/><p><strong>{isMalay ? 'Tanpa nama & agregat' : 'Anonymized & aggregated'}</strong> {isMalay ? `merentas ${clearance.sample_stall_count} gerai lain di ${market}. Trend kategori sahaja; tiada angka gerai individu.` : `across ${clearance.sample_stall_count} other stalls in ${market}. Category-level trends only; no individual stall figures are shown.`}</p></div>
    <div className="market-pulse-insights">
      <article className="planning-comparison-value market-pulse-insight">
        <span className="market-pulse-category"><TrendingDown size={14}/>{clearance.category}</span>
        <strong>{isMalay ? `Purata masa habis stok turun ${clearance.trend_pct}%` : `Average time to clear fell ${clearance.trend_pct}%`}</strong>
        <small>{isMalay ? `Kira-kira ${clearance.current_value} berbanding ${clearance.previous_value} minit minggu lalu` : `About ${clearance.current_value} vs ${clearance.previous_value} minutes last week`} · {clearance.comparison_window} · n={clearance.sample_stall_count}</small>
      </article>
      <article className="planning-comparison-value market-pulse-insight">
        <span className="market-pulse-category"><TrendingUp size={14}/>{isMalay ? 'Promosi kategori serupa' : 'Similar-category promotions'}</span>
        <strong>{isMalay ? `${promotion.current_value} daripada ${promotion.sample_stall_count} gerai minggu ini` : `${promotion.current_value} of ${promotion.sample_stall_count} stalls ran promotions this week`}</strong>
        <small>{isMalay ? `Meningkat daripada ${promotion.previous_value} minggu lepas (+${promotion.trend_pct}%)` : `Up from ${promotion.previous_value} last week (+${promotion.trend_pct}%)`} · {promotion.comparison_window}</small>
      </article>
    </div>
    <section className="market-pulse-recommendation planning-comparison">
      <div className="planning-comparison-header"><h3>{isMalay ? 'Cadangan untuk gerai anda' : 'A suggestion for your stall'}</h3><span><UsersRound size={14}/>{isMalay ? 'Berdasarkan trend agregat' : 'Derived from category trend'}</span></div>
      <strong>{isMalay ? `Gerai serupa mendapat pusing ganti lebih pantas — pertimbangkan menyediakan ${reduction}% kurang hari ini.` : `Stalls like yours are seeing faster turnover — consider prepping ${reduction}% less today.`}</strong>
      <p>{isMalay ? `Cadangan ringkas: separuh daripada trend pusing ganti ${clearance.trend_pct}% (dibundarkan). Semak ramalan gerai anda dahulu; tiada kuantiti atau kelompok diubah secara automatik.` : `Simple heuristic: half the ${clearance.trend_pct}% clearance-speed trend, rounded. Check your own planning forecast before acting; no batch or quantity changes automatically.`}</p>
      <NavLink className="button secondary" to="/hawker/planning">{isMalay ? 'Semak ramalan saya' : 'Review my planning forecast'}<ArrowUpRight size={16}/></NavLink>
    </section>
    <p className="market-pulse-network"><Activity size={14}/>{isMalay ? 'Semakin ramai penjaja menyertai, semakin berguna trend setempat untuk semua.' : 'The more stalls participate, the more useful these local trends become for every hawker.'}</p>
  </section>
}
