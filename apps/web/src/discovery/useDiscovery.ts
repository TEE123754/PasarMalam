import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAuthClient } from '../auth/client'
import type { DataGateway, DiscoverySnapshot } from '../data/types'
import { acceptVersion } from './engine'

export function useDiscovery(gateway: DataGateway, visibleMarkets?: string[] | ((data: DiscoverySnapshot) => string[])) {
  const cache = useQueryClient()
  const [visible, setVisible] = useState(document.visibilityState !== 'hidden')
  const [live, setLive] = useState(false)
  const query = useQuery({ queryKey: ['discovery', gateway.mode], queryFn: () => gateway.getDiscovery(),
    refetchInterval: visible ? 60000 : false, refetchIntervalInBackground: false,
    refetchOnWindowFocus: true })
  const selected = typeof visibleMarkets === 'function' ? query.data ? visibleMarkets(query.data) : [] : visibleMarkets
  const ids = (selected ?? query.data?.markets.map(m => m.id) ?? []).slice().sort().join(',')
  useEffect(() => {
    const change = () => { const active = document.visibilityState !== 'hidden'; setVisible(active); if (active) void cache.invalidateQueries({queryKey:['discovery',gateway.mode]}) }
    document.addEventListener('visibilitychange', change)
    return () => document.removeEventListener('visibilitychange', change)
  }, [cache, gateway.mode])
  useEffect(() => {
    if (gateway.mode !== 'connected' || !visible || !ids) return
    let client: ReturnType<typeof getAuthClient>
    try { client = getAuthClient() } catch { return }
    if (!client) return
    const seen = new Map<string, number>()
    const channels = ids.split(',').map(id => client.channel(`discovery:${id}:${crypto.randomUUID()}`)
      .on('postgres_changes', {event:'*',schema:'public',table:'discovery_versions',filter:`market_id=eq.${id}`}, event => {
        const row = event.new as {market_id?: string; version?: number}
        if (row.market_id === id && acceptVersion(seen,id,Number(row.version))) void cache.invalidateQueries({queryKey:['discovery','connected']})
      }).subscribe(status => {
        setLive(status === 'SUBSCRIBED')
        if (status === 'SUBSCRIBED') void cache.invalidateQueries({queryKey:['discovery','connected']})
      }))
    return () => { setLive(false); channels.forEach(channel => void client.removeChannel(channel)) }
  }, [cache, gateway.mode, ids, visible])
  return { ...query, live, stale: query.isError || !!query.data && Date.now() - Date.parse(query.data.updatedAt) > 90000 }
}
