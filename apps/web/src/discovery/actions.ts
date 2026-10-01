import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/context'
import { connectedRequest } from '../auth/client'
import type { DataGateway } from '../data/types'

const fixtureKey = 'pasarmalam:fixture-favourites'
async function apiJSON(path: string, init?: RequestInit): Promise<unknown> {
  const response = await connectedRequest(path,{...init,headers:{'Content-Type':'application/json'}})
  if (!response.ok) throw new Error('Request denied or unavailable')
  return response.json()
}
export function useFavourites(gateway: DataGateway) {
  const { actor } = useAuth()
  const cache = useQueryClient()
  const key = ['personal',gateway.mode,actor?.id ?? 'fixture','favourites']
  const allowed = gateway.mode === 'fixture' || !!actor?.roles.includes('customer')
  const query = useQuery({queryKey:key,enabled:allowed,queryFn: async (): Promise<string[]> => {
    if (gateway.mode === 'fixture') {
      try { const parsed: unknown = JSON.parse(localStorage.getItem(fixtureKey) || '[]'); return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [] } catch { return [] }
    }
    const result = await apiJSON('/api/v1/me/favourites')
    if (!Array.isArray(result) || !result.every(value => typeof value === 'string')) throw new Error('Invalid saved list')
    return result
  }})
  return { ids: allowed ? query.data ?? [] : [], allowed, loading:query.isLoading, error:query.isError,
    async save(id: string, saved: boolean) {
      if (!allowed) throw new Error('Sign-in required')
      if (gateway.mode === 'fixture') {
        const current = query.data ?? []
        const next = saved ? [...new Set([...current,id])] : current.filter(value => value !== id)
        localStorage.setItem(fixtureKey,JSON.stringify(next)); cache.setQueryData(key,next)
      } else { await apiJSON('/api/v1/me/favourites',{method:'POST',body:JSON.stringify({stall_id:id,saved})}); await cache.invalidateQueries({queryKey:key}) }
    },
  }
}

export async function checkIn(gateway: DataGateway, marketId: string): Promise<boolean> {
  if (gateway.mode === 'connected') {
    const result = await apiJSON('/api/v1/me/check-ins',{method:'POST',body:JSON.stringify({market_id:marketId})}) as {created:boolean}
    return result.created
  }
  const date = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kuala_Lumpur'}).format(new Date())
  const key = `pasarmalam:fixture-check-ins:${date}`
  let existing: string[] = []
  try { const value: unknown = JSON.parse(localStorage.getItem(key) || '[]'); if (Array.isArray(value)) existing = value.filter((v): v is string => typeof v === 'string') } catch { /* Unavailable local data starts empty. */ }
  if (existing.includes(marketId)) return false
  if (existing.length >= 5) throw new Error('Daily limit')
  localStorage.setItem(key,JSON.stringify([...existing,marketId]))
  return true
}
