export type AppMode = 'fixture' | 'connected'
export type PersonaRole = 'customer' | 'hawker'
export type MarketType = 'night' | 'day'
export type ScenarioResult = 'success' | 'pending' | 'rejected' | 'timeout'

export interface Market {
  id: string
  name: string
  area: string
  type: MarketType
  hours: string
  days: string
  cover: string
  stallCount: number
  status: 'open' | 'upcoming' | 'closed'
}

export interface Stall {
  id: string
  marketId: string
  name: string
  category: string
  specialty: string
  priceSen: number
  rating: number
  reviews: number
  image: string
  halal: 'declared' | 'non-halal' | 'not-declared'
  open: boolean
}

export interface DemoOffer {
  id: string
  stallId: string
  title: string
  priceSen: number
  originalPriceSen: number
  endsAt: string
}

export interface DiscoverySnapshot {
  markets: Market[]
  stalls: Stall[]
  offers: DemoOffer[]
  updatedAt: string
}

export interface PublicConfig {
  api_version: string
  supported_locales: string[]
  business_integration_mode: 'simulated'
  capabilities: string[]
}

export interface DataGateway {
  mode: AppMode
  getPublicConfig(): Promise<PublicConfig>
  getDiscovery(): Promise<DiscoverySnapshot>
}

export interface ScenarioAdapter {
  mode: 'simulated'
  run(scenario: string, outcome: ScenarioResult): Promise<{ reference: string; outcome: ScenarioResult }>
}
