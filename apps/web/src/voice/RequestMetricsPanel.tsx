import { useEffect, useState } from 'react'
import { selectedMode } from '../app/config'
import { download } from '../commerce/exports'
import { ui } from '../locales/phrases'
import { REQUEST_METRICS_CHANGED, requestReport } from './requestMetrics'

export function RequestMetricsPanel() {
  const mode = selectedMode()
  const [report, setReport] = useState(() => requestReport(mode))
  useEffect(() => {
    const refresh = () => setReport(requestReport(mode))
    window.addEventListener(REQUEST_METRICS_CHANGED, refresh)
    return () => window.removeEventListener(REQUEST_METRICS_CHANGED, refresh)
  }, [mode])
  return <section className="panel detail-panel">
    <h2>{ui('AI request measurements')}</h2>
    <p>{ui('Request times, failures, retries and available token counts are recorded in this tab. No audio, transcript, password or account details are included.')}</p>
    <p role="status">{ui('Attempts')}: {report.summary.attempts} · {ui('Failed')}: {report.summary.failed} · {ui('Confirmed updates')}: {report.summary.confirmed_updates}</p>
    <p>{ui('Median request time')}: {report.summary.median_ms === null ? ui('Not measured') : `${Math.round(report.summary.median_ms)} ms`} · P90: {report.summary.p90_ms === null ? ui('Not measured') : `${Math.round(report.summary.p90_ms)} ms`}</p>
    <p>{ui('Operating cost remains unknown until dated billing or free-allowance evidence is added. Request time is separate from live task time.')}</p>
    {!report.available && <p role="alert">{ui('Private browser storage is unavailable. Request records could not be retained.')}</p>}
    {report.dropped_attempts > 0 && <p role="alert">{ui('Older attempts exceeded the 500-record limit. This export is an incomplete session.')}</p>}
    <button className="button secondary" disabled={!report.available || !report.summary.attempts} onClick={() => download(JSON.stringify(requestReport(mode), null, 2), 'pasarmalam-private-request-measurements.json', 'application/json')}>{ui('Download private request measurements')}</button>
  </section>
}
