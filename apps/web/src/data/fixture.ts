import type { DataGateway, DiscoverySnapshot, ScenarioAdapter, ScenarioResult } from './types'

const sample: Omit<DiscoverySnapshot, 'updatedAt'> = {
  markets: [
    { id: 'seri-pelita', name: 'Seri Pelita', area: 'Petaling Jaya', type: 'night', days: 'Every Friday', hours: '5:00 PM – 10:30 PM', cover: '🌙', stallCount: 18, status: 'open' },
    { id: 'pagi-embun', name: 'Pagi Embun', area: 'Shah Alam', type: 'day', days: 'Every Saturday', hours: '7:00 AM – 12:00 PM', cover: '☀️', stallCount: 12, status: 'upcoming' },
    { id: 'sungai-bintang', name: 'Sungai Bintang', area: 'Kuala Lumpur', type: 'night', days: 'Every Wednesday', hours: '4:30 PM – 10:00 PM', cover: '✨', stallCount: 24, status: 'closed' },
  ],
  stalls: [
    { id: 'bara-senja', marketId: 'seri-pelita', name: 'Bara Senja', category: 'Skewers', specialty: 'Chicken satay', priceSen: 600, rating: 4.8, reviews: 28, image: '🍢', halal: 'declared', open: true },
    { id: 'dapur-embun', marketId: 'pagi-embun', name: 'Dapur Embun', category: 'Rice & noodles', specialty: 'Nasi lemak ayam', priceSen: 750, rating: 4.7, reviews: 19, image: '🍚', halal: 'declared', open: false },
    { id: 'manis-bulan', marketId: 'seri-pelita', name: 'Manis Bulan', category: 'Desserts', specialty: 'Cendol', priceSen: 500, rating: 4.9, reviews: 34, image: '🍧', halal: 'not-declared', open: true },
  ],
  offers: [
    { id: 'satay-offer', stallId: 'bara-senja', title: 'Satay evening offer', priceSen: 450, originalPriceSen: 600, endsAt: '21:00' },
  ],
}

export const fixtureGateway: DataGateway = {
  mode: 'fixture',
  async getPublicConfig() {
    return { api_version: 'v1', supported_locales: ['en', 'ms'], business_integration_mode: 'simulated', capabilities: ['fixture-discovery'] }
  },
  async getDiscovery() {
    return { ...sample, updatedAt: new Date().toISOString() }
  },
}

export const fixtureScenarioAdapter: ScenarioAdapter = {
  mode: 'simulated',
  async run(scenario: string, outcome: ScenarioResult) {
    return { reference: `DEMO-${scenario.toUpperCase().replace(/[^A-Z0-9]/g, '-')}-001`, outcome }
  },
}
