import { appPath } from '../app/config'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Market } from '../data/types'
import type { Bounds } from './engine'

export default function MarketMap({ markets, onBounds }: { markets: Market[]; onBounds: (bounds: Bounds | null) => void }) {
  const { t } = useTranslation()
  const host = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const pins = useRef<L.LayerGroup | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    if (!host.current) return
    const instance = L.map(host.current, { scrollWheelZoom: false }).setView([3.1,101.6],10)
    map.current = instance
    pins.current = L.layerGroup().addTo(instance)
    const source = import.meta.env.VITE_MAP_TILE_URL || 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'
    if (source === 'disabled') setFailed(true)
    else L.tileLayer(source, {maxZoom:18,attribution: import.meta.env.VITE_MAP_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',crossOrigin:false})
      .on('tileerror', () => setFailed(true)).addTo(instance)
    // No tile prefetch, offline cache or service-worker interception; HTTP cache is browser-managed.
    return () => { instance.remove(); map.current = null; pins.current = null }
  }, [])
  useEffect(() => {
    if (!map.current || !pins.current) return
    pins.current.clearLayers()
    const points: L.LatLngTuple[] = []
    for (const market of markets) {
      if (market.latitude === null || market.longitude === null) continue
      const point: L.LatLngTuple = [market.latitude,market.longitude]
      points.push(point)
      const link = document.createElement('a')
      link.href = appPath(`/markets/${encodeURIComponent(market.id)}`); link.textContent = market.name
      L.marker(point, {title:market.name,alt:market.name,icon:L.divIcon({className:'market-pin',html:market.type === 'night' ? '☾' : '☀',iconSize:[36,36],iconAnchor:[18,18]})}).bindPopup(link).addTo(pins.current)
    }
    // Do not recenter during a map-bound search: the user controls the current viewport.
    if (points.length && !map.current.getContainer().dataset.positioned) {
      map.current.fitBounds(points,{padding:[35,35],maxZoom:13})
      map.current.getContainer().dataset.positioned = 'yes'
    }
  }, [markets])
  return <section className="map-panel panel" aria-label={t('mapView')}>
    <div ref={host} className="market-map" aria-label={t('mapView')}/>
    {failed && <p role="status">{t('tilesUnavailable')}</p>}
    <div className="button-row"><button className="button secondary" onClick={() => {
      const b = map.current?.getBounds(); if (b) onBounds({south:b.getSouth(),west:b.getWest(),north:b.getNorth(),east:b.getEast()})
    }}>{t('searchMap')}</button><button className="button secondary" onClick={() => onBounds(null)}>{t('clearBounds')}</button></div>
    <p className="small muted">{t('mapPrivacy')}</p>
  </section>
}
