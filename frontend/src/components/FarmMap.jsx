import { useEffect, useRef, useState } from 'react'
import * as maptilersdk from '@maptiler/sdk'
import * as turf from '@turf/turf'
import '@maptiler/sdk/dist/maptiler-sdk.css'

const DEFAULT_CENTER = [78.9629, 20.5937]
const apiKey = process.env.MAPTILER_API_KEY

export function FarmMap({ points, onAdd, onUndo, onClear, onFinish, onEdit, finished }) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [locationState, setLocationState] = useState('idle')
  const [mapError, setMapError] = useState(false)
  const [marking, setMarking] = useState(false)
  const markingRef = useRef(false)
  const finishedRef = useRef(finished)
  const onAddRef = useRef(onAdd)
  markingRef.current = marking
  finishedRef.current = finished
  onAddRef.current = onAdd
  const [area, setArea] = useState(null)

  useEffect(() => {
    if (!mapContainer.current || !apiKey) return
    maptilersdk.config.apiKey = apiKey
    const map = new maptilersdk.Map({ container: mapContainer.current, style: 'outdoor-v2', center: DEFAULT_CENTER, zoom: 4, navigationControl: true })
    map.on('load', () => setMapError(false))
    map.on('error', () => setMapError(true))
    map.on('click', (event) => { if (markingRef.current && !finishedRef.current) onAddRef.current([event.lngLat.lng, event.lngLat.lat]) })
    mapRef.current = map
    return () => { markersRef.current.forEach((marker) => marker.remove()); map.remove(); mapRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = points.map(([longitude, latitude], index) => {
      const element = document.createElement('div')
      element.className = 'farm-point-marker'
      element.textContent = String(index + 1)
      return new maptilersdk.Marker({ element }).setLngLat([longitude, latitude]).addTo(map)
    })
    const coordinates = points.length >= 3 ? [...points, points[0]] : points
    const data = { type: 'FeatureCollection', features: coordinates.length >= 2 ? [{ type: 'Feature', properties: {}, geometry: { type: coordinates.length >= 3 ? 'Polygon' : 'LineString', coordinates: coordinates.length >= 3 ? [coordinates] : coordinates } }] : [] }
    const source = map.getSource('farm-boundary')
    if (source) source.setData(data)
    else if (map.isStyleLoaded()) {
      map.addSource('farm-boundary', { type: 'geojson', data })
      map.addLayer({ id: 'farm-boundary-fill', type: 'fill', source: 'farm-boundary', paint: { 'fill-color': '#6ba66f', 'fill-opacity': 0.28 } })
      map.addLayer({ id: 'farm-boundary-line', type: 'line', source: 'farm-boundary', paint: { 'line-color': '#2f6b45', 'line-width': 3 } })
    }
    if (points.length >= 3) {
      const sqm = turf.area(turf.polygon([[...points, points[0]]]))
      setArea({ sqm, acres: sqm / 4046.8564224, hectares: sqm / 10000 })
    } else setArea(null)
  }, [points])

  const locateUser = () => {
    if (!navigator.geolocation) { setLocationState('error'); return }
    setLocationState('loading')
    navigator.geolocation.getCurrentPosition(({ coords }) => { mapRef.current?.flyTo({ center: [coords.longitude, coords.latitude], zoom: 14, essential: true }); setLocationState('ready') }, () => setLocationState('error'), { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 })
  }
  const clear = () => { onClear(); setMarking(false) }

  return <div className="relative h-full min-h-[340px] w-full overflow-hidden rounded-2xl">
    {!apiKey ? <div className="flex h-full min-h-[340px] items-center justify-center bg-muted p-6 text-center"><div><p className="font-semibold">MapTiler API key required</p><p className="mt-2 max-w-sm text-sm text-muted-foreground">Set API_KEY in the deployment environment to load the farm map.</p></div></div> : <div ref={mapContainer} className={`h-full min-h-[340px] w-full ${marking ? 'farm-map-marking' : ''}`} />}
    {apiKey && <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2"><button type="button" onClick={() => { setMarking(true); onEdit() }} disabled={marking && !finished} className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-md disabled:opacity-70">{marking && !finished ? 'Marking Farm Boundary…' : 'Mark Farm Boundary'}</button>{marking && <><button type="button" onClick={onUndo} disabled={!points.length} className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold shadow-md disabled:opacity-50">Undo Last Point</button><button type="button" onClick={clear} disabled={!points.length} className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold shadow-md disabled:opacity-50">Clear All</button>{points.length >= 3 && !finished && <button type="button" onClick={() => { setMarking(false); if (area) onFinish(area) }} className="rounded-xl bg-card px-3 py-2 text-sm font-semibold text-primary shadow-md">Finish Farm</button>}{finished && <button type="button" onClick={() => { setMarking(true); onEdit() }} className="rounded-xl bg-card px-3 py-2 text-sm font-semibold text-primary shadow-md">Edit Boundary</button>}</>}</div>}
    {apiKey && <button type="button" onClick={locateUser} disabled={locationState === 'loading'} className="absolute bottom-4 left-4 rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-primary shadow-md">{locationState === 'loading' ? 'Locating…' : 'Use my location'}</button>}
    {area && <div className="absolute bottom-4 right-4 rounded-xl border border-border bg-card px-4 py-3 shadow-md"><p className="text-xs font-semibold text-muted-foreground">Farm area</p><p className="text-lg font-semibold text-primary">{area.acres.toFixed(2)} acres</p><p className="text-xs text-muted-foreground">{area.hectares.toFixed(2)} hectares</p></div>}
    {finished && <div className="absolute right-4 top-4 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-md">Farm Boundary Completed</div>}
    {locationState === 'error' && <p className="absolute bottom-4 right-4 max-w-[220px] rounded-lg bg-card px-3 py-2 text-xs text-destructive shadow-md">Location permission was denied or unavailable.</p>}
    {mapError && <p className="absolute left-4 top-20 rounded-lg bg-card px-3 py-2 text-xs text-destructive shadow-md">MapTiler could not load the map.</p>}
  </div>
}

