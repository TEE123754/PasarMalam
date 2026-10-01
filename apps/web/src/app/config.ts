import type { AppMode } from '../data/types'

export const configuredMode: AppMode = import.meta.env.VITE_APP_MODE === 'connected' ? 'connected' : 'fixture'
export const selectedMode = (): AppMode =>
  configuredMode === 'connected' && sessionStorage.getItem('pasarmalam:sample') === 'yes' ? 'fixture' : configuredMode

export const useSampleMode = () => {
  sessionStorage.setItem('pasarmalam:sample', 'yes')
  window.location.assign('/discover')
}
