import { createContext, useContext } from 'react'
import type { Actor } from '../data/api-contract'

export interface AuthState {
  actor: Actor | null
  status: 'loading' | 'ready' | 'unavailable'
  notice: 'expired' | 'unavailable' | null
  configured: boolean
  recovery: boolean
  signIn(email: string, password: string): Promise<boolean>
  signOut(): Promise<void>
  updateProfile(displayName: string, locale: 'en' | 'ms'): Promise<boolean>
}
export const AuthContext = createContext<AuthState | null>(null)
export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) throw new Error('Auth provider is missing')
  return value
}
