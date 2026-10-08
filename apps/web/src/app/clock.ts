const scenarioKey = 'pasarmalam:scenario-clock'
const startedKey = 'pasarmalam:scenario-started'

export interface AppClock {
  now(): Date
  setScenario(value: string | null): void
  scenario(): string | null
}

export const systemClock: AppClock = {
  now: () => new Date(),
  setScenario: () => {},
  scenario: () => null,
}

export function closingScenarioTimestamp(date = systemClock.now()): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date)
  const part = (type: string) => parts.find(value => value.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}T20:30:00+08:00`
}

export const fixtureClock: AppClock = {
  now() {
    const value = sessionStorage.getItem(scenarioKey)
    if (!value) return new Date()
    const started = sessionStorage.getItem(startedKey)
    const valid = started !== null && Number.isFinite(Number(started))
    if (!valid) sessionStorage.setItem(startedKey, String(Date.now()))
    const elapsed = valid ? Math.max(0, Date.now() - Number(started)) : 0
    return new Date(Date.parse(value) + elapsed)
  },
  setScenario(value) {
    if (value) { sessionStorage.setItem(scenarioKey, value); sessionStorage.setItem(startedKey, String(Date.now())) }
    else { sessionStorage.removeItem(scenarioKey); sessionStorage.removeItem(startedKey) }
  },
  scenario: () => sessionStorage.getItem(scenarioKey),
}
