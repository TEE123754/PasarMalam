import type { Point } from './engine'
export const coarsePoint = (point: Point): Point => ({latitude: Math.round(point.latitude*100)/100,longitude:Math.round(point.longitude*100)/100})
export function requestDeviceLocation(geolocation: Geolocation | undefined): Promise<Point> {
  return new Promise((resolve,reject) => {
    if (!geolocation) {reject(new Error('Location unavailable'));return}
    geolocation.getCurrentPosition(position => resolve({latitude:position.coords.latitude,longitude:position.coords.longitude}),
      () => reject(new Error('Location denied')), {enableHighAccuracy:false,timeout:10000,maximumAge:60000})
  })
}
