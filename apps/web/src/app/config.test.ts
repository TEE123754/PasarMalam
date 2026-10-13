import { afterEach, describe, expect, it, vi } from 'vitest'
import { appPath, selectedMode, openDemo } from './config'
import { connectedRequest, getAuthClient } from '../auth/client'
afterEach(()=>vi.unstubAllGlobals())
describe('demo and real workspace boundary',()=>{
 it.each(['/demo','/demo/discover','/demo/hawker/batches'])('isolates %s as demo',pathname=>{vi.stubGlobal('window',{location:{pathname}});expect(selectedMode()).toBe('fixture');expect(appPath('/markets/m')).toBe('/demo/markets/m');expect(getAuthClient()).toBeNull()})
 it.each(['/discover','/demo-other','/demonstration'])('does not treat %s as demo',pathname=>{vi.stubGlobal('window',{location:{pathname}});expect(selectedMode()).toBe('connected')})
 it('uses a full navigation instead of a sticky sample-mode flag',()=>{const assign=vi.fn(),store=new Map<string,string>([['pasarmalam:demo:role','hawker']]);vi.stubGlobal('window',{location:{pathname:'/discover',assign}});vi.stubGlobal('localStorage',{setItem:(k:string,v:string)=>store.set(k,v),getItem:(k:string)=>store.get(k)??null});openDemo();expect(assign).toHaveBeenCalledWith('/demo/discover');expect(store.get('pasarmalam:demo:role')).toBe('customer')})
 it('rejects real API writes in demo before authentication or a network call',async()=>{vi.stubGlobal('window',{location:{pathname:'/demo/discover'}});const fetch=vi.fn();vi.stubGlobal('fetch',fetch);await expect(connectedRequest('/api/v1/vendor/command',{method:'POST'})).rejects.toThrow('Demo cannot call real services');expect(fetch).not.toHaveBeenCalled()})
 it('keeps technical sandbox map links in its labelled workspace',()=>{vi.stubGlobal('window',{location:{pathname:'/sandbox/discover'}});expect(appPath('/markets/m')).toBe('/sandbox/markets/m')})
})
