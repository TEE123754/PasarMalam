import sample from '../../../../contracts/discovery-fixture.json'
import { discoverySchema } from './schemas'
import { fixtureClock } from '../app/clock'
import type { DataGateway, ScenarioAdapter, ScenarioResult } from './types'

export const fixtureGateway: DataGateway = {
  mode: 'fixture',
  async getPublicConfig() {
    return { api_version: 'v1', supported_locales: ['en', 'ms'], business_integration_mode: 'simulated', capabilities: ['fixture-discovery'] }
  },
  async getDiscovery() {
    const key = `pasarmalam:fixture-anchor:${fixtureClock.scenario() ?? 'current'}`
    let anchor = sessionStorage.getItem(key)
    if (!anchor || !Number.isFinite(Date.parse(anchor))) { anchor = fixtureClock.now().toISOString(); sessionStorage.setItem(key,anchor) }
    const time = Date.parse(anchor)
    const deadline = new Date(time+3600000).toISOString()
    const visits: Record<string,number> = {}
    const cutoff = new Date(Date.now()-29*86400000).toISOString().slice(0,10)
    for (const storageKey of Object.keys(localStorage)) {
      if (!storageKey.startsWith('pasarmalam:fixture-check-ins:') || storageKey.split(':').at(-1)! < cutoff) continue
      try { const ids:unknown = JSON.parse(localStorage.getItem(storageKey) || '[]'); if (Array.isArray(ids)) for (const id of new Set(ids)) if (typeof id === 'string') visits[id]=(visits[id] ?? 0)+1 } catch { /* Ignore malformed sample state. */ }
    }
    return discoverySchema.parse({ ...sample, markets:sample.markets.map(m => ({...m,popularity:m.popularity+(visits[m.id] ?? 0)})), offers:sample.offers.map(offer => ({...offer,endsAt:deadline})),
      batches: [1,2].map(number => ({id:`satay-batch-${number}`,foodItemId:'bara-senja-dish',batchNumber:number,
        preparedAt:new Date(time-(3-number)*1800000).toISOString(),uploadedAt:new Date(time-(3-number)*1800000+120000).toISOString(),remaining:12,deadline})),
      updatedAt: new Date().toISOString() })
  },
}

export const fixtureScenarioAdapter: ScenarioAdapter = {
  mode: 'simulated',
  async run(scenario: string, outcome: ScenarioResult) {
    return { reference: `DEMO-${scenario.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-001`, outcome }
  },
}
