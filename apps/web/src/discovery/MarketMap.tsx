import { ui } from '../locales/phrases'
import { destination } from './classifications'
import { appPath } from '../app/config'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Market } from '../data/types'
import type { Bounds } from './engine'

export default function MarketMap({ markets, onBounds, sponsors }: { markets: Market[]; onBounds: (bounds: Bounds | null) => void; sponsors?:Set<string> }) {
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
      if (!destination(market.latitude,market.longitude)||market.latitude===null||market.longitude===null) continue
      const point: L.LatLngTuple = [market.latitude,market.longitude]
      points.push(point)
      const link = document.createElement('a')
      const sponsored=sponsors?.has(market.id)??false
      const label=`${market.name} · ${ui(market.kind==='farmers'?'Farmers’ market':'General market')}${sponsored?' · Sponsored':''}`
      link.href = appPath(`/markets/${encodeURIComponent(market.id)}`); link.textContent = label
      L.marker(point, {title:label,alt:label,icon:L.divIcon({className:'market-pin',html:sponsored?'Ad':market.kind==='farmers'?'🌱':market.type === 'night' ? '☾' : '☀',iconSize:[36,36],iconAnchor:[18,18]})}).bindPopup(link).addTo(pins.current)
    }
    // Do not recenter during a map-bound search: the user controls the current viewport.
    if (points.length && !map.current.getContainer().dataset.positioned) {
      map.current.fitBounds(points,{padding:[35,35],maxZoom:13})
      map.current.getContainer().dataset.positioned = 'yes'
    }
  }, [markets,sponsors])
  return <section className="map-panel panel" aria-label={t('mapView')}>
    <div className="map-heading"><div><span className="eyebrow">{ui('FIND YOUR NEXT STOP')}</span><h2>{ui('Markets on the map')}</h2></div><span>{markets.length} {ui('market pins')}</span></div>
    <div ref={host} className="market-map" aria-label={t('mapView')}/>
    {failed && <p role="status">{ui('Explore the market pins while the background map reconnects.')}</p>}
    <div className="map-legend"><span>☾ {t('night')}</span><span>☀ {t('day')}</span><span>🌱 {ui('Farmers’ market')}</span><span>Ad · {ui('Sponsored')}</span></div>
    <div className="button-row"><button className="button secondary" onClick={() => {
      const b = map.current?.getBounds(); if (b) onBounds({south:b.getSouth(),west:b.getWest(),north:b.getNorth(),east:b.getEast()})
    }}>{t('searchMap')}</button><button className="button secondary" onClick={() => onBounds(null)}>{t('clearBounds')}</button></div>
    <p className="small muted">{t('mapPrivacy')}</p>
  </section>
}
