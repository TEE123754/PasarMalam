/** Ask the controlling worker to verify all public shell assets, with a bounded wait. */
export function offlineReady(worker: ServiceWorker): Promise<boolean> {
 return new Promise(resolve => {
  const channel = new MessageChannel()
  const finish = (ready: boolean) => {
   clearTimeout(timer)
   channel.port1.close()
   channel.port2.close()
   resolve(ready)
  }
  const timer = setTimeout(() => finish(false), 8000)
  channel.port1.onmessage = event => finish(event.data?.type === 'OFFLINE_STATUS' && event.data.ready === true)
  try { worker.postMessage({type: 'OFFLINE_STATUS'}, [channel.port2]) } catch { finish(false) }
 })
}
