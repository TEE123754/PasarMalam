import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router'
import { defaultFilters, type Filters } from './engine'

// Discover and /markets are two views of one search: the map narrows the stall results, and the
// filters decide which pins show. The state lives here so neither view loses it to the other.
function useSharedDiscoverState() {
  const { pathname } = useLocation()
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [search, setSearch] = useState('')
  const [areaChoice, setAreaChoice] = useState('')
  const [geoExpires, setGeoExpires] = useState(0)
  const [locationMessage, setLocationMessage] = useState('manualLocation')
  // Device location must expire on schedule whichever of the two views is open
  useEffect(() => {
    if (!geoExpires) return
    const timer = setTimeout(() => { setFilters(current => ({...current,origin:null})); setGeoExpires(0); setLocationMessage('locationExpired') },Math.max(0,geoExpires-Date.now()))
    return () => clearTimeout(timer)
  }, [geoExpires])
  // Leaving both views starts a fresh search, as it always has
  const shared = pathname === '/discover' || pathname === '/markets'
  useEffect(() => {
    if (shared) return
    setFilters(defaultFilters); setSearch(''); setAreaChoice(''); setGeoExpires(0); setLocationMessage('manualLocation')
  }, [shared])
  return useMemo(() => ({filters,setFilters,search,setSearch,areaChoice,setAreaChoice,setGeoExpires,locationMessage,setLocationMessage}), [filters,search,areaChoice,locationMessage])
}

const DiscoverStateContext = createContext<ReturnType<typeof useSharedDiscoverState> | null>(null)

export function DiscoverStateProvider({ children }: { children: ReactNode }) {
  return <DiscoverStateContext.Provider value={useSharedDiscoverState()}>{children}</DiscoverStateContext.Provider>
}

export function useDiscoverState() {
  const state = useContext(DiscoverStateContext)
  if (!state) throw new Error('useDiscoverState needs DiscoverStateProvider')
  return state
}
