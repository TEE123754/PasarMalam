import type { PublicConfigResponse } from './api-contract'
import type { z } from 'zod'
import type { discoverySchema } from './schemas'
export type DiscoverySnapshot = z.infer<typeof discoverySchema>
export type Market = DiscoverySnapshot['markets'][number]
export type Stall = DiscoverySnapshot['stalls'][number]
export type { Offer as DemoOffer, PublicConfigResponse as PublicConfig } from './api-contract'

export type AppMode = 'fixture' | 'connected'
export type PersonaRole = 'customer' | 'hawker'
export type MarketType = 'night' | 'day'
export type ScenarioResult = 'success' | 'pending' | 'rejected' | 'timeout'

export interface DataGateway {
  mode: AppMode
  getPublicConfig(): Promise<PublicConfigResponse>
  getDiscovery(): Promise<DiscoverySnapshot>
}

export interface ScenarioAdapter {
  mode: 'simulated'
  run(scenario: string, outcome: ScenarioResult): Promise<{ reference: string; outcome: ScenarioResult }>
}
