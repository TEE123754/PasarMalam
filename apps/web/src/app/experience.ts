import { closingScenarioTimestamp, fixtureClock } from './clock'
import { selectedMode } from './config'

// Upgrade only browser-local fixtures, leaving connected records and credentials untouched.
const version = 'complete-market-v2'
export function prepareMarketExperience() {
  if (selectedMode() !== 'fixture') return
  if (localStorage.getItem('pasarmalam:demo:experience-version') !== version) {
    for (const key of ['pasarmalam:demo:vendor-v1', 'pasarmalam:demo:community-v1']) localStorage.removeItem(key)
    for (const key of Object.keys(sessionStorage)) if (key.startsWith('pasarmalam:fixture-anchor:')) sessionStorage.removeItem(key)
    localStorage.setItem('pasarmalam:demo:experience-version', version)
    localStorage.setItem('pasarmalam:fixture-favourites', JSON.stringify(['bara-senja','dapur-embun','manis-bulan']))
    localStorage.setItem('pasarmalam:demo:community-person', 'customer-a')
    fixtureClock.setScenario(closingScenarioTimestamp())
  } else if (!fixtureClock.scenario()) {
    localStorage.removeItem('pasarmalam:demo:vendor-v1')
    fixtureClock.setScenario(closingScenarioTimestamp())
  }
}
