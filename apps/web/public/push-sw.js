/* Notification-only worker: no fetch handler or cache. */
self.addEventListener('push', event => {
 event.waitUntil((async () => {
  let message; try { message=event.data.json(); } catch { return; }
  if (!message || !/^DEMO-[a-f0-9-]+$/.test(message.tag) || !Number.isFinite(message.expires) || message.expires<=Date.now()) return;
  await self.registration.showNotification('PasarMalam · test clearance',{body:'Fictional offer. Check availability and advisory at the stall.',tag:message.tag,renotify:false,data:{url:'/sandbox/offers',expires:message.expires}});
 })());
});
self.addEventListener('notificationclick',event=>{event.notification.close();event.waitUntil(self.clients.openWindow('/sandbox/offers'));});
