import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Capacitor } from '@capacitor/core'
import { App as NativeApp } from '@capacitor/app'
import type { PluginListenerHandle } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { nativeDemoBuild, nativeDemoLink } from './policy'
import { clearLocalNotificationTest, localNotificationTest, TEST_NOTIFICATION_ID } from './notifications'

export function NativeRuntime() {
  const navigate = useNavigate()
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (!nativeDemoBuild() || !Capacitor.isNativePlatform()) return
    let disposed = false
    const handles: PluginListenerHandle[] = []
    async function track(promise: Promise<PluginListenerHandle>) {
      const handle = await promise
      if (disposed) await handle.remove(); else handles.push(handle)
    }
    const link = (url: string) => { const path = nativeDemoLink(url); if (!disposed && path) navigate(path.slice(5)) }
    void Promise.all([
      track(NativeApp.addListener('appUrlOpen', event => link(event.url))),
      track(NativeApp.addListener('appStateChange', event => { if (!event.isActive) window.dispatchEvent(new Event('pasarmalam-pause')) })),
      track(NativeApp.addListener('backButton', event => {
        if (document.querySelector('[role="dialog"]')) { document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); return }
        if (event.canGoBack) history.back()
        else if (location.pathname !== '/demo/discover') navigate('/discover', { replace: true })
        else if (window.confirm('Close PasarMalam demo?')) void NativeApp.exitApp()
      })),
      track(LocalNotifications.addListener('localNotificationActionPerformed', event => {
        if (event.notification.id === TEST_NOTIFICATION_ID && !disposed) navigate('/hawker/alerts')
      })),
    ]).catch(() => { if (!disposed) setNotice('Device navigation unavailable. Use the app navigation buttons.') })
    void NativeApp.getLaunchUrl().then(event => { if (event) link(event.url) }).catch(() => {})
    return () => { disposed = true; for (const handle of handles) void handle.remove() }
  }, [navigate])
  if (!nativeDemoBuild()) return null
  async function test() {
    setBusy(true)
    try { setNotice(await localNotificationTest()) }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Device test unavailable; use in-app alerts.') }
    finally { setBusy(false) }
  }
  return <details className="panel native-test-panel"><summary>Local native demo · device checks / Semakan peranti</summary>
    <p>Fictional data on this device. Voice entry can use microphone permission when you start recording; typing and quick-entry chips remain available. Image selection uses the system picker.</p>
    <p>Maps and speech model downloads require internet. No real account is connected in this package.</p>
    <div className="button-row"><button className="button secondary" disabled={busy || !Capacitor.isNativePlatform()} onClick={() => void test()}>Request optional local notification test</button>
      <button className="button secondary" disabled={busy} onClick={() => void clearLocalNotificationTest().then(() => setNotice('Local test cleared.')).catch(() => setNotice('Clear failed; use device notification settings.'))}>Clear local test</button></div>
    <p role="status">{notice}</p>
  </details>
}
