import sample from '../../../../contracts/discovery-fixture.json'
import { discoverySchema } from './schemas'
import type { DataGateway, ScenarioAdapter, ScenarioResult } from './types'

export const fixtureGateway: DataGateway = {
  mode: 'fixture',
  async getPublicConfig() {
    return { api_version: 'v1', supported_locales: ['en', 'ms'], business_integration_mode: 'simulated', capabilities: ['fixture-discovery'] }
  },
  async getDiscovery() {
    return discoverySchema.parse({ ...sample, updatedAt: new Date().toISOString() })
  },
}

export const fixtureScenarioAdapter: ScenarioAdapter = {
  mode: 'simulated',
  async run(scenario: string, outcome: ScenarioResult) {
    return { reference: `DEMO-${scenario.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-001`, outcome }
  },
}
