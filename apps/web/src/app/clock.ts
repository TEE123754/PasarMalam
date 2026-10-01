const scenarioKey = 'pasarmalam:scenario-clock'

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
    return value ? new Date(value) : new Date()
  },
  setScenario(value) {
    if (value) sessionStorage.setItem(scenarioKey, value)
    else sessionStorage.removeItem(scenarioKey)
  },
  scenario: () => sessionStorage.getItem(scenarioKey),
}
