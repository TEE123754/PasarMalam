import { useState } from 'react'
import { CheckCircle2, Clock3, FlaskConical, Hourglass, XCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { fixtureScenarioAdapter } from '../data/fixture'
import type { ScenarioResult } from '../data/types'

const outcomes = [
  { value: 'success', icon: CheckCircle2 },
  { value: 'pending', icon: Hourglass },
  { value: 'rejected', icon: XCircle },
  { value: 'timeout', icon: Clock3 },
] as const

/** Shared controls for future business mocks; no external provider is called. */
export function ScenarioControls() {
  const { t } = useTranslation()
  const [result, setResult] = useState<{ reference: string; outcome: ScenarioResult } | null>(null)
  async function select(outcome: ScenarioResult) {
    setResult(await fixtureScenarioAdapter.run('foundation', outcome))
  }
  return <section className="panel setting-card scenario-card">
    <div className="feature-icon"><FlaskConical size={24} /></div>
    <h2>{t('scenarioTitle')}</h2>
    <p>{t('scenarioBody')}</p>
    <div className="scenario-chips" role="group" aria-label={t('scenarioTitle')}>
      {outcomes.map(({ value, icon: Icon }) => <button key={value}
        className={`button secondary ${result?.outcome === value ? 'selected' : ''}`}
        aria-pressed={result?.outcome === value} onClick={() => void select(value)}>
        <Icon size={18} aria-hidden="true" />{t(`scenario_${value}`)}
      </button>)}
    </div>
    <p role="status" aria-live="polite" className="scenario-result">
      {result ? `${t('simulationLabel')} · ${t(`scenario_${result.outcome}`)} · ${result.reference}` : t('scenarioChoose')}
    </p>
  </section>
}
