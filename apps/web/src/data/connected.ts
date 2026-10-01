import type { DataGateway, DiscoverySnapshot, PublicConfig } from './types'
import { connectedRequest } from '../auth/client'
import { discoverySchema } from './schemas'

const baseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

export const connectedGateway: DataGateway = {
  mode: 'connected',
  async getPublicConfig(): Promise<PublicConfig> {
    const response = await fetch(`${baseUrl}/api/v1/config`)
    if (!response.ok) throw new Error('The API configuration is unavailable.')
    return response.json() as Promise<PublicConfig>
  },
  async getDiscovery(): Promise<DiscoverySnapshot> {
    const response = await connectedRequest('/api/v1/discovery')
    if (!response.ok) throw new Error('Connected discovery is unavailable')
    return discoverySchema.parse(await response.json())
  },
}
