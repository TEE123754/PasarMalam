import { closingScenarioTimestamp, fixtureClock } from '../app/clock'

export const nativeDemoBuild = () => import.meta.env.MODE === 'native-demo'

// Only this explicitly registered demo scheme is accepted. Never process Auth tokens.
export function nativeDemoLink(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'pasarmalam-demo:' || url.hostname !== 'demo' || url.username || url.password || url.port || url.search || url.hash) return null
    const paths = ['/discover', '/offers', '/saved', '/profile', '/hawker/dashboard', '/hawker/voice', '/hawker/batches', '/hawker/alerts']
    return paths.includes(url.pathname) ? `/demo${url.pathname}` : null
  } catch { return null }
}

export function prepareNativeDemoRoute() {
  if (!nativeDemoBuild()) return
  if (!fixtureClock.scenario()) fixtureClock.setScenario(closingScenarioTimestamp())
  if (!/^\/demo(?:\/|$)/.test(location.pathname)) history.replaceState(null, '', '/demo/discover')
}
