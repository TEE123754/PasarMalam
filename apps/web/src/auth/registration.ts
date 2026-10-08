import type { SupabaseClient } from '@supabase/supabase-js'
import { z } from 'zod'

export const registrationSchema = z.object({
  email: z.string().trim().email().max(254), password: z.string().min(12).max(128),
  display_name: z.string().trim().min(2).max(80), locale: z.enum(['en', 'ms']),
  accepted: z.literal(true),
}).strict()
export const tokenSchema = z.string().trim().regex(/^[A-Za-z0-9_-]{32,2048}$/)
export type Registration = z.infer<typeof registrationSchema>
export type RegistrationResult = 'email' | 'verified' | 'expired' | 'failed' | 'disabled'
type Auth = Pick<SupabaseClient['auth'], 'signUp' | 'verifyOtp'>

export function publicRegistrationAllowed(path: string, flag: boolean, config: { data_environment?: string; registration_policy?: string }) {
  return flag && !/^\/(demo|sandbox)(?:\/|$)/.test(path) && config.data_environment === 'production' && config.registration_policy === 'public'
}
export async function registerCustomer(auth: Auth, input: Registration, allowed: boolean): Promise<RegistrationResult> {
  if (!allowed) return 'disabled'
  const value = registrationSchema.parse(input)
  try {
    const { error } = await auth.signUp({ email: value.email, password: value.password, options: { data: { display_name: value.display_name, locale: value.locale } } })
    // Do not enumerate whether an email belongs to an existing account.
    if (error && !['user_already_exists', 'email_exists'].includes(error.code ?? '')) return 'failed'
    return 'email'
  } catch { return 'failed' }
}
export async function verifyRegistration(auth: Auth, hash: string, type: 'invite' | 'signup'): Promise<RegistrationResult> {
  const token = tokenSchema.safeParse(hash)
  if (!token.success) return 'failed'
  try {
    const { data, error } = await auth.verifyOtp({ token_hash: token.data, type })
    if (error) return error.code === 'otp_expired' ? 'expired' : 'failed'
    return data.session ? 'verified' : 'failed'
  } catch { return 'failed' }
}
