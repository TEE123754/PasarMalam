import type { AppMode } from '../data/types'
import { nativeDemoBuild } from '../native/policy'

// The URL is the boundary. Demo never authenticates or writes to a real project.
export const selectedMode = (): AppMode => nativeDemoBuild() || /^\/demo(?:\/|$)/.test(window.location.pathname) ? 'fixture' : 'connected'
export const openDemo = () => { localStorage.setItem('pasarmalam:demo:role', 'customer'); localStorage.setItem('pasarmalam:demo:community-person', 'customer-a'); window.location.assign('/demo/discover') }
export const appPath = (path: string) => `${selectedMode() === 'fixture' ? '/demo' : /^\/sandbox(?:\/|$)/.test(window.location.pathname) ? '/sandbox' : ''}${path}`
