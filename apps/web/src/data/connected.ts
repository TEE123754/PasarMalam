import type { DataGateway, DiscoverySnapshot, PublicConfig } from './types'

const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

export const connectedGateway: DataGateway = {
  mode: 'connected',
  async getPublicConfig(): Promise<PublicConfig> {
    const response = await fetch(`${baseUrl}/api/v1/config`)
    if (!response.ok) throw new Error('The API configuration is unavailable.')
    return response.json() as Promise<PublicConfig>
  },
  async getDiscovery(): Promise<DiscoverySnapshot> {
    throw new Error('Connected discovery begins in Phase 2. Open the sample demo to browse fictional data.')
  },
}
