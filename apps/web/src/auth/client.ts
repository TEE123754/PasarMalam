import { selectedMode } from '../app/config'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null
export function getAuthClient(): SupabaseClient | null {
  if (selectedMode() === 'fixture') return null
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
    auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: /^\/(?:sandbox\/)?profile\/?$/.test(window.location.pathname) },
  })
  return client
}

const apiBase = () => (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')

// Read-only probe with the same rule connectedRequest enforces, so the shell can show a friendly
// "open the demo" card instead of letting every page fail with the environment error.
export async function realEnvironmentReady(): Promise<boolean> {
  try {
    const config = await fetch(`${apiBase()}/api/v1/config`)
    const metadata: unknown = config.ok ? await config.json() : null
    return !!metadata && typeof metadata === 'object' && 'data_environment' in metadata && metadata.data_environment === 'production'
  } catch { return false }
}

export async function connectedRequest(path: string, init?: RequestInit, onUploadProgress?: (fraction:number)=>void): Promise<Response> {
  if (selectedMode() === 'fixture') throw new Error('Demo cannot call real services')
  const auth = getAuthClient()
  const { data } = auth ? await auth.auth.getSession() : { data: { session: null } }
  const headers = new Headers(init?.headers)
  if (data.session) headers.set('Authorization', `Bearer ${data.session.access_token}`)
  const base = apiBase()
  if (!/^\/sandbox(?:\/|$)/.test(window.location.pathname)) {
    const config = await fetch(`${base}/api/v1/config`)
    const metadata: unknown = config.ok ? await config.json() : null
    if (!metadata || typeof metadata !== 'object' || !('data_environment' in metadata) || metadata.data_environment !== 'production') throw new Error('Real data environment is not configured. Demo data cannot enter the real app.')
  }
  if(onUploadProgress && init?.body instanceof Blob) {
    const uploadBody=init.body
    return new Promise<Response>((resolve,reject)=>{
      const xhr=new XMLHttpRequest();xhr.open(init.method||'POST',`${base}${path}`);xhr.timeout=30000
      headers.forEach((value,key)=>xhr.setRequestHeader(key,value))
      xhr.upload.onprogress=e=>{if(e.lengthComputable)onUploadProgress(e.loaded/e.total)}
      xhr.onload=()=>resolve(new Response(xhr.responseText,{status:xhr.status,headers:{'Content-Type':xhr.getResponseHeader('Content-Type')||'application/json'}}))
      xhr.onerror=()=>reject(new Error('Photo transfer failed'));xhr.ontimeout=()=>reject(new Error('Photo transfer timed out'))
      xhr.send(uploadBody)
    })
  }
  return fetch(`${base}${path}`, { ...init, headers })
}
