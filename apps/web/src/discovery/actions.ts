import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../auth/context'
import { connectedRequest } from '../auth/client'
import type { DataGateway, DiscoverySnapshot } from '../data/types'

const fixtureKey = 'pasarmalam:fixture-favourites'
// Demo only: the foods a visitor hearted, each with its stall. Saved stalls from before this list existed stay in
// `fixtureKey` and appear with the stall's signature food (its first menu item).
const fixtureFoodsKey = 'pasarmalam:fixture-saved-foods'

export type SavedFood = { foodId: string; stallId: string }
export type SavedState = { ids: string[]; foods: SavedFood[] }
export type SavedItem = { stallId: string; foodId?: string }

async function apiJSON(path: string, init?: RequestInit): Promise<unknown> {
  const response = await connectedRequest(path,{...init,headers:{'Content-Type':'application/json'}})
  if (!response.ok) throw new Error('Request denied or unavailable')
  return response.json()
}

function readList(key: string): unknown[] {
  try { const parsed: unknown = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(parsed) ? parsed : [] } catch { return [] }
}
function readFixture(): SavedState {
  const ids = readList(fixtureKey).filter((v): v is string => typeof v === 'string')
  const foods = readList(fixtureFoodsKey).filter((v): v is SavedFood => !!v && typeof v === 'object' && typeof (v as SavedFood).foodId === 'string' && typeof (v as SavedFood).stallId === 'string')
  return { ids, foods }
}
function writeFixture(state: SavedState) {
  localStorage.setItem(fixtureKey, JSON.stringify(state.ids))
  localStorage.setItem(fixtureFoodsKey, JSON.stringify(state.foods))
}

// The stall's signature food: the first item on its menu
export const signatureFoodId = (data: DiscoverySnapshot | undefined, stallId: string) => data?.menu.find(food => food.stallId === stallId)?.id

// A stall that was saved before foods were tracked has no food entries; it stands for its signature food
const isLegacyStall = (state: SavedState, stallId: string) => state.ids.includes(stallId) && !state.foods.some(food => food.stallId === stallId)

export function isFoodSaved(state: SavedState, foodId: string, stallId: string, signature?: string): boolean {
  return state.foods.some(food => food.foodId === foodId) || isLegacyStall(state, stallId) && signature === foodId
}

// Hearting a food saves the food and its stall; removing a stall's last food removes the stall too
export function applyFoodSave(state: SavedState, foodId: string, stallId: string, saved: boolean, signature?: string): SavedState {
  if (saved) {
    const keepSignature = isLegacyStall(state, stallId) && signature && signature !== foodId ? [{ foodId: signature, stallId }] : []
    const add = state.foods.some(food => food.foodId === foodId) ? [] : [{ foodId, stallId }]
    return { ids: [...new Set([...state.ids, stallId])], foods: [...state.foods, ...keepSignature, ...add] }
  }
  const foods = state.foods.filter(food => food.foodId !== foodId)
  return { ids: foods.some(food => food.stallId === stallId) ? state.ids : state.ids.filter(id => id !== stallId), foods }
}

export function applyStallSave(state: SavedState, stallId: string, saved: boolean): SavedState {
  return saved
    ? { ...state, ids: [...new Set([...state.ids, stallId])] }
    : { ids: state.ids.filter(id => id !== stallId), foods: state.foods.filter(food => food.stallId !== stallId) }
}

// What the Saved page lists: every saved food, and a signature food for each stall saved without one. Stalls gone from the data are skipped.
export function savedItems(state: SavedState, data: DiscoverySnapshot): SavedItem[] {
  return state.ids.flatMap((stallId): SavedItem[] => {
    if (!data.stalls.some(stall => stall.id === stallId)) return []
    const foods = state.foods.filter(food => food.stallId === stallId && data.menu.some(item => item.id === food.foodId))
    if (foods.length) return foods.map(food => ({ stallId, foodId: food.foodId }))
    const signature = signatureFoodId(data, stallId)
    return [signature ? { stallId, foodId: signature } : { stallId }]
  })
}

export function useFavourites(gateway: DataGateway) {
  const { actor } = useAuth()
  const cache = useQueryClient()
  const key = ['personal',gateway.mode,actor?.id ?? 'fixture','favourites']
  const allowed = gateway.mode === 'fixture' || !!actor?.roles.includes('customer')
  const query = useQuery({queryKey:key,enabled:allowed,queryFn: async (): Promise<SavedState> => {
    if (gateway.mode === 'fixture') return readFixture()
    const result = await apiJSON('/api/v1/me/favourites')
    if (!Array.isArray(result) || !result.every(value => typeof value === 'string')) throw new Error('Invalid saved list')
    return { ids: result, foods: [] }
  }})
  const state: SavedState = query.data ?? { ids: [], foods: [] }
  const snapshot = () => cache.getQueryData<DiscoverySnapshot>(['discovery', gateway.mode])
  async function save(id: string, saved: boolean) {
    if (!allowed) throw new Error('Sign-in required')
    if (gateway.mode === 'fixture') {
      const next = applyStallSave(readFixture(), id, saved)
      writeFixture(next); cache.setQueryData(key, next)
    } else { await apiJSON('/api/v1/me/favourites',{method:'POST',body:JSON.stringify({stall_id:id,saved})}); await cache.invalidateQueries({queryKey:key}) }
  }
  return { ids: allowed ? state.ids : [], foods: allowed ? state.foods : [], allowed, loading:query.isLoading, error:query.isError, save,
    // Connected accounts still save stalls only: a food's heart then stands for its stall
    isFoodSaved: (foodId: string, stallId: string) => allowed && (gateway.mode === 'fixture' ? isFoodSaved(state, foodId, stallId, signatureFoodId(snapshot(), stallId)) : state.ids.includes(stallId)),
    async saveFood(foodId: string, stallId: string, saved: boolean) {
      if (gateway.mode !== 'fixture') return save(stallId, saved)
      if (!allowed) throw new Error('Sign-in required')
      const next = applyFoodSave(readFixture(), foodId, stallId, saved, signatureFoodId(snapshot(), stallId))
      writeFixture(next); cache.setQueryData(key, next)
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
