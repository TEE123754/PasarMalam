import { useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { selectedMode } from '../app/config'
import { getAuthClient, connectedRequest } from './client'
import { AuthContext, type AuthState } from './context'
import type { Actor } from '../data/api-contract'
import { actorSchema } from '../data/schemas'
import { customerProfile } from './registration'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [actor, setActor] = useState<Actor | null>(null)
  const [status, setStatus] = useState<AuthState['status']>('loading')
  const [notice, setNotice] = useState<AuthState['notice']>(null)
  const [recovery, setRecovery] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('type') === 'recovery')
  const queryClient = useQueryClient()
  const currentUser = useRef<string | null>(null)
  const connected = selectedMode() === 'connected'
  const [client] = useState(() => {
    try { return connected ? getAuthClient() : null } catch { return null }
  })

  useEffect(() => {
    if (!client) return
    let alive = true
    void client.auth.getSession().then(({ data, error }) => {
      if (alive) { currentUser.current = data.session?.user.id ?? null; setSession(data.session); if (error) setNotice('expired') }
    })
    const { data } = client.auth.onAuthStateChange((event, next) => {
      if (!alive) return
      currentUser.current = next?.user.id ?? null
      setSession(next)
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      if (event === 'SIGNED_OUT') {
        setRecovery(false)
        setActor(null)
        queryClient.removeQueries({ queryKey: ['discovery', 'connected'] })
        queryClient.removeQueries({ queryKey: ['personal'] })
        queryClient.removeQueries({ queryKey: ['vendor'] })
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
      try {
        const request = { headers: { Authorization: `Bearer ${session.access_token}` }, signal: controller.signal }
        let response = await connectedRequest('/api/v1/me', request)
        if (response.status === 403 && !controller.signal.aborted) {
          const bootstrap = await connectedRequest('/api/v1/me/onboard', {
            ...request, method: 'POST', headers: { ...request.headers, 'Content-Type': 'application/json' },
            body: JSON.stringify(customerProfile(session.user.user_metadata)),
          })
          if (!bootstrap.ok) throw new Error('Profile unavailable')
          response = await connectedRequest('/api/v1/me', request)
        }
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

  return <AuthContext.Provider value={{ actor, status, notice, configured: !!client, recovery: recovery && !!session,
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
      currentUser.current = null
      setActor(null); setSession(null); setNotice(null)
      queryClient.removeQueries({ queryKey: ['discovery', 'connected'] })
      queryClient.removeQueries({ queryKey: ['personal'] })
        queryClient.removeQueries({ queryKey: ['vendor'] })
    },
    async updateProfile(displayName, locale) {
      if (!actor || !client) return false
      const id = actor.id
      try {
        const response = await connectedRequest('/api/v1/me/profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ display_name: displayName, locale }) })
        if (!response.ok) return false
        const identity = actorSchema.parse(await response.json())
        if (identity.id !== id || currentUser.current !== id) return false
        setActor(identity)
        return true
      } catch { return false }
    },
  }}>{children}</AuthContext.Provider>
}
