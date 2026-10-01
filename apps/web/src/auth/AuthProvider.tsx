import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { selectedMode } from '../app/config'
import { getAuthClient } from './client'
import { AuthContext, type AuthState } from './context'
import type { Actor } from '../data/api-contract'
import { actorSchema } from '../data/schemas'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [actor, setActor] = useState<Actor | null>(null)
  const [status, setStatus] = useState<AuthState['status']>('loading')
  const [notice, setNotice] = useState<AuthState['notice']>(null)
  const queryClient = useQueryClient()
  const connected = selectedMode() === 'connected'
  const [client] = useState(() => {
    try { return connected ? getAuthClient() : null } catch { return null }
  })

  useEffect(() => {
    if (!client) return
    let alive = true
    void client.auth.getSession().then(({ data, error }) => {
      if (alive) { setSession(data.session); if (error) setNotice('expired') }
    })
    const { data } = client.auth.onAuthStateChange((event, next) => {
      if (!alive) return
      setSession(next)
      if (event === 'SIGNED_OUT') {
        setActor(null)
        queryClient.removeQueries({ queryKey: ['discovery', 'connected'] })
        queryClient.removeQueries({ queryKey: ['personal'] })
      }
    })
    return () => { alive = false; data.subscription.unsubscribe() }
  }, [client, queryClient])

  useEffect(() => {
    const controller = new AbortController()
    async function loadIdentity() {
      if (!client || !session) { setActor(null); setStatus('ready'); return }
      setActor(null)
      setStatus('loading')
      const base = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
      try {
        const response = await fetch(`${base}/api/v1/me`, {
          headers: { Authorization: `Bearer ${session.access_token}` }, signal: controller.signal,
        })
        if (controller.signal.aborted) return
        if (response.status === 401) {
          setNotice('expired'); setActor(null)
          await client.auth.signOut({ scope: 'local' })
        } else if (!response.ok) { setActor(null); setNotice('unavailable') }
        else {
          const identity = actorSchema.parse(await response.json())
          if (!controller.signal.aborted) { setActor(identity); setNotice(null) }
        }
        if (!controller.signal.aborted) setStatus('ready')
      } catch {
        if (!controller.signal.aborted) { setStatus('unavailable'); setActor(null); setNotice('unavailable') }
      }
    }
    void loadIdentity()
    return () => controller.abort()
  }, [client, session])

  // Fail closed if refresh fails or the browser wakes after token expiry.
  useEffect(() => {
    if (!session?.expires_at || !client) return
    const expiresAt = session.expires_at * 1000
    const expire = () => {
      if (Date.now() >= expiresAt) {
        setActor(null); setNotice('expired')
        void client.auth.signOut({ scope: 'local' })
      }
    }
    const timer = window.setTimeout(expire, Math.max(0, expiresAt - Date.now()))
    window.addEventListener('focus', expire)
    return () => { clearTimeout(timer); window.removeEventListener('focus', expire) }
  }, [client, session])

  return <AuthContext.Provider value={{ actor, status, notice, configured: !!client,
    async signIn(email, password) {
      if (!client) return false
      const { error } = await client.auth.signInWithPassword({ email, password })
      if (error) return false
      setNotice(null)
      return true
    },
    async signOut() {
      if (!client) return
      const { error } = await client.auth.signOut({ scope: 'local' })
      if (error) { setNotice('unavailable'); return }
      setActor(null); setSession(null); setNotice(null)
      queryClient.removeQueries({ queryKey: ['discovery', 'connected'] })
      queryClient.removeQueries({ queryKey: ['personal'] })
    },
  }}>{children}</AuthContext.Provider>
}
