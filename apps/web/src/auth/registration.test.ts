import { describe, expect, it, vi } from 'vitest'
import { publicRegistrationAllowed, registerCustomer, registrationSchema, verifyRegistration } from './registration'

const input = {email:'fictional@example.invalid',password:'fictional-long-password',display_name:'Customer',locale:'ms' as const,accepted:true as const}
const auth = (result: unknown) => ({signUp:vi.fn().mockResolvedValue(result),verifyOtp:vi.fn().mockResolvedValue(result)}) as unknown as Parameters<typeof registerCustomer>[0]
describe('customer onboarding boundaries', () => {
  it('requires an enabled flag, approved production target and public policy', () => {
    const config={data_environment:'production',registration_policy:'public'}
    expect(publicRegistrationAllowed('/profile',true,config)).toBe(true)
    for(const path of ['/sandbox/profile','/demo/profile']) expect(publicRegistrationAllowed(path,true,config)).toBe(false)
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
})
