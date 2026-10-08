import { afterEach, expect, it, vi } from 'vitest'
import { nativeDemoLink, prepareNativeDemoRoute } from './policy'
import { selectedMode } from '../app/config'
import { localNotificationTest } from './notifications'
import { Recorder } from '../voice/recorder'

const mocks = vi.hoisted(() => ({ native: vi.fn(), check: vi.fn(), request: vi.fn(), schedule: vi.fn() }))
vi.mock('@capacitor/core', () => ({ Capacitor: { isNativePlatform: mocks.native } }))
vi.mock('@capacitor/local-notifications', () => ({ LocalNotifications: { checkPermissions: mocks.check, requestPermissions: mocks.request, schedule: mocks.schedule } }))
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks() })

it('accepts only demo routes from the registered scheme; drops credentials and Auth input', () => {
  expect(nativeDemoLink('pasarmalam-demo://demo/hawker/voice')).toBe('/demo/hawker/voice')
  for (const link of ['https://example.org/demo/discover', 'pasarmalam-demo://demo/sandbox/profile', 'pasarmalam-demo://demo/profile?token=abc', 'pasarmalam-demo://user@demo/profile', 'pasarmalam-demo://demo/profile#token=abc', 'pasarmalam-demo://demo/unknown']) expect(nativeDemoLink(link)).toBeNull()
})
it('forces packaged root and sandbox to fictional mode without connected credentials', () => {
  vi.stubEnv('MODE', 'native-demo')
  vi.stubGlobal('window', { location: { pathname: '/sandbox/profile' } })
  vi.stubGlobal('location', { pathname: '/sandbox/profile' })
  const replaceState = vi.fn(); vi.stubGlobal('history', { replaceState })
  const setItem = vi.fn(); vi.stubGlobal('sessionStorage', { getItem: () => null, setItem })
  expect(selectedMode()).toBe('fixture'); prepareNativeDemoRoute()
  expect(replaceState).toHaveBeenCalledWith(null, '', '/demo/discover')
  expect(setItem.mock.calls[0][1]).toMatch(/T20:30:00\+08:00$/)
})
it('native notification denial does not re-prompt or queue a notification', async () => {
  vi.stubEnv('MODE', 'native-demo'); mocks.native.mockReturnValue(true)
  mocks.check.mockResolvedValue({ display: 'denied' })
  await expect(localNotificationTest()).rejects.toThrow('denied')
  expect(mocks.request).not.toHaveBeenCalled(); expect(mocks.schedule).not.toHaveBeenCalled()
})
it('asks from an explicit test call and queues only a generic local test after permission', async () => {
  vi.stubEnv('MODE', 'native-demo'); mocks.native.mockReturnValue(true)
  mocks.check.mockResolvedValue({ display: 'prompt' }); mocks.request.mockResolvedValue({ display: 'granted' })
  await localNotificationTest()
  expect(mocks.request).toHaveBeenCalledOnce()
  expect(mocks.schedule.mock.calls[0][0].notifications[0]).toMatchObject({ id: 11001, title: 'PasarMalam DEMO device test' })
})
it('web preview never requests native notification permission', async () => {
  vi.stubEnv('MODE', 'native-demo'); mocks.native.mockReturnValue(false)
  await expect(localNotificationTest()).rejects.toThrow('installed')
  expect(mocks.check).not.toHaveBeenCalled()
})
it('backgrounding during pending microphone permission cancels and releases a late grant', async () => {
  const events = new EventTarget(); vi.stubGlobal('window', events)
  const stop = vi.fn(); let grant!: (stream: MediaStream) => void
  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia: () => new Promise<MediaStream>(resolve => { grant = resolve }) } })
  vi.stubGlobal('MediaRecorder', class {})
  const recorder = new Recorder(); const started = recorder.start(() => {})
  events.dispatchEvent(new Event('pasarmalam-pause'))
  grant({ getTracks: () => [{ stop }] } as unknown as MediaStream)
  await expect(started).rejects.toThrow('cancelled'); expect(stop).toHaveBeenCalledOnce()
})
