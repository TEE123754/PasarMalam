import { describe, expect, it, vi } from 'vitest'
import { confirmationToken, customerProfile, publicRegistrationAllowed, registerCustomer, registrationSchema, verifyRegistration } from './registration'

const input = {email:'fictional@example.invalid',password:'fictional-long-password',display_name:'Customer',locale:'ms' as const,accepted:true as const}
const auth = (result: unknown) => ({signUp:vi.fn().mockResolvedValue(result),verifyOtp:vi.fn().mockResolvedValue(result)}) as unknown as Parameters<typeof registerCustomer>[0]
describe('customer onboarding boundaries', () => {
  it('requires an enabled flag and public policy with a matching data target', () => {
    const config={data_environment:'production',registration_policy:'public'}
    expect(publicRegistrationAllowed('/profile',true,config)).toBe(true)
    for(const path of ['/sandbox/profile','/demo/profile']) expect(publicRegistrationAllowed(path,true,config)).toBe(false)
    expect(publicRegistrationAllowed('/sandbox/profile',true,{...config,data_environment:'disposable-demo'})).toBe(true)
    expect(publicRegistrationAllowed('/demo/profile',true,{...config,data_environment:'disposable-demo'})).toBe(false)
    expect(publicRegistrationAllowed('/profile',false,config)).toBe(false)
    expect(publicRegistrationAllowed('/profile',true,{...config,data_environment:'disposable-demo'})).toBe(false)
    expect(publicRegistrationAllowed('/profile',true,{...config,registration_policy:'invite-only'})).toBe(false)
  })
  it('does not call Auth when registration is disabled', async () => {
    const service=auth({error:null})
    expect(await registerCustomer(service,input,false)).toBe('disabled');expect(service.signUp).not.toHaveBeenCalled()
  })
  it('validates email, name, password, consent and disallows role selection', () => {
    for(const change of [{email:'invalid'},{display_name:' '},{password:'short'},{accepted:false},{role:'vendor'}]) expect(registrationSchema.safeParse({...input,...change}).success).toBe(false)
  })
  it('does not enumerate duplicate email or grant browser-selected roles', async () => {
    const service=auth({error:{code:'user_already_exists'}})
    expect(await registerCustomer(service,input,true)).toBe('email')
    expect(service.signUp).toHaveBeenCalledWith({email:input.email,password:input.password,options:{data:{display_name:'Customer',locale:'ms'}}})
  })
  it('handles expired invitations, bad verification and provider failure', async () => {
    const hash='fictional-confirmation-token-for-tests-only'
    expect(await verifyRegistration(auth({error:{code:'otp_expired'}}),hash,'invite')).toBe('expired')
    expect(await verifyRegistration(auth({error:null,data:{session:null}}),hash,'signup')).toBe('failed')
    expect(await verifyRegistration(auth({error:null,data:{session:{}}}),hash,'invite')).toBe('verified')
    const service=auth({});expect(await verifyRegistration(service,'bad','invite')).toBe('failed');expect(service.verifyOtp).not.toHaveBeenCalled()
    const failure=auth({error:{code:'service_unavailable'}});expect(await registerCustomer(failure,input,true)).toBe('failed')
  })
  it('sends signup confirmation back to the account page', async () => {
    const service=auth({error:null})
    await registerCustomer(service,input,true,'http://127.0.0.1:5174/sandbox/profile')
    expect(service.signUp).toHaveBeenCalledWith({email:input.email,password:input.password,options:{emailRedirectTo:'http://127.0.0.1:5174/sandbox/profile',data:{display_name:input.display_name,locale:'ms'}}})
  })
  it('recognises an immediate authenticated signup without claiming an email was sent', async () => {
    expect(await registerCustomer(auth({error:null,data:{session:{}}}),input,true)).toBe('signed-in')
  })
  it('uses metadata only for bounded display fields, never requested permissions', () => {
    expect(customerProfile({display_name:' Market customer ',locale:'ms',role:'admin',roles:['vendor']})).toEqual({display_name:'Market customer',locale:'ms',accepted:true})
    expect(customerProfile({display_name:'x'.repeat(81),locale:'admin'})).toEqual({display_name:'Customer',locale:'en',accepted:true})
  })
  it('accepts the original invitation link only from the configured Auth provider', async () => {
    const provider='https://fictional.supabase.co', hash='fictional-confirmation-token-for-tests-only'
    const link=`${provider}/auth/v1/verify?token=${hash}&type=invite&redirect_to=http%3A%2F%2Flocalhost%3A5174`
    const service=auth({error:null,data:{session:{}}})
    expect(await verifyRegistration(service,link,'invite',provider)).toBe('verified')
    expect(service.verifyOtp).toHaveBeenCalledWith({token_hash:hash,type:'invite'})
    expect(confirmationToken(link.replace('token=','token_hash='),'invite',provider)).toBe(hash)
    for(const invalid of [link.replace('fictional.supabase.co','other.supabase.co'),link.replace('/verify','/recover'),link.replace('type=invite','type=recovery'),link+`&token_hash=${hash}`,link+'&type=invite',link+'#access_token=private',link.replace('https://fictional','https://user:password@fictional')]) {
      expect(await verifyRegistration(service,invalid,'invite',provider)).toBe('failed')
    }
    expect(service.verifyOtp).toHaveBeenCalledTimes(1)
    expect(confirmationToken(link,'invite')).toBeNull()
  })
  it('supports an explicitly selected recovery link without accepting it as an invitation', async () => {
    const provider='https://fictional.supabase.co', hash='fictional-confirmation-token-for-tests-only'
    const link=`${provider}/auth/v1/verify?token=${hash}&type=recovery`
    const service=auth({error:null,data:{session:{}}})
    expect(await verifyRegistration(service,link,'invite',provider)).toBe('failed')
    expect(service.verifyOtp).not.toHaveBeenCalled()
    expect(await verifyRegistration(service,link,'recovery',provider)).toBe('verified')
    expect(service.verifyOtp).toHaveBeenCalledWith({token_hash:hash,type:'recovery'})
  })
})
