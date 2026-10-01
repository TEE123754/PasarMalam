import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null
export function getAuthClient(): SupabaseClient | null {
  if (client) return client
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined
  if (!url || !key) return null
  if (key.startsWith('sb_secret_')) throw new Error('A publishable key is required')
  if (key.split('.').length === 3) {
    try {
      const payload = JSON.parse(atob(key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as { role?: string }
      if (payload.role !== 'anon') throw new Error('A publishable key is required')
    } catch { throw new Error('A publishable key is required') }
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: false },
  })
  return client
}

export async function connectedRequest(path: string, init?: RequestInit): Promise<Response> {
  const auth = getAuthClient()
  const { data } = auth ? await auth.auth.getSession() : { data: { session: null } }
  const headers = new Headers(init?.headers)
  if (data.session) headers.set('Authorization', `Bearer ${data.session.access_token}`)
  const base = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
  return fetch(`${base}${path}`, { ...init, headers })
}
