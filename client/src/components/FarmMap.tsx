import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

type Point = [number, number]

const DEFAULT_CENTER: [number, number] = [78.9629, 20.5937]
const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined

export function FarmMap({ points, onAdd }: { points: Point[]; onAdd: (point: Point) => void }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])
  const [locationState, setLocationState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    if (!mapContainer.current || !token) return
    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/outdoors-v12',
      center: DEFAULT_CENTER,
      zoom: 4,
      attributionControl: true,
    })
    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.on('load', () => setMapError(false))
    map.on('error', () => setMapError(true))
    map.on('click', (event) => onAdd([event.lngLat.lng, event.lngLat.lat]))
    mapRef.current = map
    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      map.remove()
      mapRef.current = null
    }
  }, [onAdd, token])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = points.map(([longitude, latitude]) => new mapboxgl.Marker({ color: '#2f6b45' }).setLngLat([longitude, latitude]).addTo(map))
    const source = map.getSource('farm-boundary') as mapboxgl.GeoJSONSource | undefined
    const coordinates = points.length > 2 ? [...points, points[0]] : []
    const data = { type: 'Feature' as const, properties: {}, geometry: { type: 'Polygon' as const, coordinates: coordinates.length ? [coordinates] : [] } }
    if (source) source.setData(data)
    else if (map.isStyleLoaded()) {
      map.addSource('farm-boundary', { type: 'geojson', data })
      map.addLayer({ id: 'farm-boundary-fill', type: 'fill', source: 'farm-boundary', paint: { 'fill-color': '#6ba66f', 'fill-opacity': 0.28 } })
      map.addLayer({ id: 'farm-boundary-line', type: 'line', source: 'farm-boundary', paint: { 'line-color': '#2f6b45', 'line-width': 3 } })
    }
  }, [points])

  const locateUser = () => {
    if (!navigator.geolocation) { setLocationState('error'); return }
    setLocationState('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { mapRef.current?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14, essential: true }); setLocationState('ready') },
      () => setLocationState('error'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  return <div className="relative h-full min-h-[340px] w-full overflow-hidden rounded-2xl">
    {!token ? <div className="flex h-full min-h-[340px] items-center justify-center bg-muted p-6 text-center"><div><p className="font-semibold">Mapbox token required</p><p className="mt-2 max-w-sm text-sm text-muted-foreground">Set VITE_MAPBOX_ACCESS_TOKEN in the environment to load the farm map.</p></div></div> : <div ref={mapContainer} className="h-full min-h-[340px] w-full" />}
    {token && <button type="button" onClick={locateUser} disabled={locationState === 'loading'} className="absolute bottom-4 left-4 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-primary shadow-md transition hover:bg-secondary disabled:opacity-60">{locationState === 'loading' ? 'Locating…' : 'Use my location'}</button>}
    {locationState === 'error' && <p className="absolute bottom-4 right-4 max-w-[220px] rounded-lg bg-card px-3 py-2 text-xs text-destructive shadow-md">Location permission was denied or unavailable.</p>}
    {mapError && <p className="absolute left-4 top-4 rounded-lg bg-card px-3 py-2 text-xs text-destructive shadow-md">Mapbox could not load the map.</p>}
  </div>
}
