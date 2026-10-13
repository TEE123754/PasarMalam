import type { AppMode } from '../data/types'
import { nativeDemoBuild } from '../native/policy'

// The URL is the boundary. Demo never authenticates or writes to a real project.
export const selectedMode = (): AppMode => nativeDemoBuild() || /^\/demo(?:\/|$)/.test(window.location.pathname) ? 'fixture' : 'connected'
// Enters the demo with a fresh persona; defaults to the customer Discover page
export const openDemo = (path = '/demo/discover', role: 'customer' | 'hawker' = 'customer') => { localStorage.setItem('pasarmalam:demo:role', role); localStorage.setItem('pasarmalam:demo:community-person', role === 'hawker' ? 'vendor-a' : 'customer-a'); window.location.assign(path) }
export const appPath = (path: string) => `${selectedMode() === 'fixture' ? '/demo' : /^\/sandbox(?:\/|$)/.test(window.location.pathname) ? '/sandbox' : ''}${path}`
