import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

export const registrationSchema = z.object({
  email: z.string().trim().email().max(254), password: z.string().min(12).max(128),
  display_name: z.string().trim().min(2).max(80), locale: z.enum(['en', 'ms']),
  accepted: z.literal(true),
}).strict()
export const tokenSchema = z.string().trim().regex(/^[A-Za-z0-9_-]{32,2048}$/)
export type Registration = z.infer<typeof registrationSchema>
export type RegistrationResult = 'email' | 'signed-in' | 'verified' | 'expired' | 'failed' | 'disabled'
export type ConfirmationType = 'invite' | 'signup' | 'recovery'
type Auth = Pick<SupabaseClient['auth'], 'signUp' | 'verifyOtp'>

export function publicRegistrationAllowed(path: string, flag: boolean, config: { data_environment?: string; registration_policy?: string }) {
  if (!flag || config.registration_policy !== 'public' || /^\/demo(?:\/|$)/.test(path)) return false
  return config.data_environment === (/^\/sandbox(?:\/|$)/.test(path) ? 'disposable-demo' : 'production')
}
export async function registerCustomer(auth: Auth, input: Registration, allowed: boolean, redirectTo?: string): Promise<RegistrationResult> {
  if (!allowed) return 'disabled'
  const value = registrationSchema.parse(input)
  try {
    const { data, error } = await auth.signUp({ email: value.email, password: value.password, options: { ...(redirectTo ? { emailRedirectTo: redirectTo } : {}), data: { display_name: value.display_name, locale: value.locale } } })
    // Do not enumerate whether an email belongs to an existing account.
    if (error && !['user_already_exists', 'email_exists'].includes(error.code ?? '')) return 'failed'
    return !error && data?.session ? 'signed-in' : 'email'
  } catch { return 'failed' }
}
export function confirmationToken(input: string, type: ConfirmationType, providerUrl?: string): string | null {
  const raw = tokenSchema.safeParse(input)
  if (raw.success) return raw.data
  if (!providerUrl || input.length > 2048) return null
  try {
    const link = new URL(input.trim()), provider = new URL(providerUrl)
    if (link.origin !== provider.origin || link.pathname !== '/auth/v1/verify' || link.username || link.password || link.hash) return null
    if (link.searchParams.getAll('type').length !== 1 || link.searchParams.get('type') !== type) return null
    const values = [...link.searchParams.getAll('token'), ...link.searchParams.getAll('token_hash')]
    if (values.length !== 1) return null
    const token = tokenSchema.safeParse(values[0])
    return token.success ? token.data : null
  } catch { return null }
}
export function customerProfile(metadata: Record<string, unknown> = {}) {
  const name = typeof metadata.display_name === 'string' ? metadata.display_name.trim() : ''
  return { display_name: name.length >= 2 && name.length <= 80 ? name : 'Customer', locale: metadata.locale === 'ms' ? 'ms' : 'en', accepted: true as const }
}
export async function verifyRegistration(auth: Auth, hash: string, type: ConfirmationType, providerUrl?: string): Promise<RegistrationResult> {
  const token = confirmationToken(hash, type, providerUrl)
  if (!token) return 'failed'
  try {
    const { data, error } = await auth.verifyOtp({ token_hash: token, type })
    if (error) return error.code === 'otp_expired' ? 'expired' : 'failed'
    return data.session ? 'verified' : 'failed'
  } catch { return 'failed' }
}
