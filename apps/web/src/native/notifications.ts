import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { nativeDemoBuild } from './policy'

export const TEST_NOTIFICATION_ID = 11001
export async function localNotificationTest() {
  if (!nativeDemoBuild() || !Capacitor.isNativePlatform()) throw new Error('Use the installed demo app for this optional device test.')
  let permission = await LocalNotifications.checkPermissions()
  if (permission.display === 'denied') throw new Error('Notifications denied. Use the in-app alerts; permission can be changed in device settings.')
  if (permission.display !== 'granted') permission = await LocalNotifications.requestPermissions()
  if (permission.display !== 'granted') throw new Error('Notifications declined. In-app alerts remain available.')
  await LocalNotifications.schedule({ notifications: [{
    id: TEST_NOTIFICATION_ID, title: 'PasarMalam DEMO device test',
    body: 'A local test notification. Open the app to check current listings.',
    extra: { path: '/demo/hawker/alerts' },
  }] })
  return 'Local test submitted to the device. Confirm actual receipt yourself; this is not remote push or a food timer.'
}

export async function clearLocalNotificationTest() {
  if (!Capacitor.isNativePlatform()) return
  await LocalNotifications.cancel({ notifications: [{ id: TEST_NOTIFICATION_ID }] })
  await LocalNotifications.removeDeliveredNotificationsById({ ids: [TEST_NOTIFICATION_ID] })
}
