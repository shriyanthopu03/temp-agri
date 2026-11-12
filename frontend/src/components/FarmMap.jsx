import { useEffect, useRef, useState, useCallback } from 'react'
import * as maptilersdk from '@maptiler/sdk'
import * as turf from '@turf/turf'
import '@maptiler/sdk/dist/maptiler-sdk.css'
import { Layers, Key, Check, AlertCircle, ExternalLink, X, MapPin } from 'lucide-react'

const DEFAULT_CENTER = [78.9629, 20.5937]

// High-availability Carto Voyager style (used as seamless fallback if MapTiler key returns 403 or network issue)
const CARTO_VOYAGER_STYLE = {
  version: 8,
  sources: {
    'carto-tiles': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>',
      maxzoom: 20,
    },
  },
  layers: [
    {
      id: 'carto-tiles-layer',
      type: 'raster',
      source: 'carto-tiles',
      minzoom: 0,
      maxzoom: 20,
    },
  ],
}

// Available MapTiler Styles
const MAPTILER_STYLES = [
  { id: 'outdoor', label: 'Outdoor Topo', style: maptilersdk.MapStyle.OUTDOOR },
  { id: 'satellite', label: 'Satellite', style: maptilersdk.MapStyle.SATELLITE },
  { id: 'hybrid', label: 'Hybrid', style: maptilersdk.MapStyle.HYBRID },
  { id: 'streets', label: 'Streets', style: maptilersdk.MapStyle.STREETS },
]

const getInitialApiKey = () => {
  if (typeof window !== 'undefined') {
    const stored = window.localStorage.getItem('maptiler_api_key')
    if (stored && stored.trim()) return stored.trim()
  }
  const envKey =
    (typeof process !== 'undefined' && process.env?.MAPTILER_API_KEY) ||
    (import.meta?.env && import.meta.env.VITE_MAPTILER_API_KEY) ||
    ''
  return envKey.trim() || 'fqDiQwYmuIvVrorFowV3'
}

export function FarmMap({
  points = [],
  farmName = '',
  editable = false,
  onAdd,
  onUndo,
  onClear,
  onFinish,
  onEdit,
  finished = false,
  interactive = true,
}) {
  const mapContainer = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [locationState, setLocationState] = useState('idle')
  const [mapReady, setMapReady] = useState(false)
  const [marking, setMarking] = useState(false)
  const markingRef = useRef(false)
  const finishedRef = useRef(finished)
  const onAddRef = useRef(onAdd)
  markingRef.current = marking
  finishedRef.current = finished
  onAddRef.current = onAdd
  const [area, setArea] = useState(null)

  // MapTiler API Key State & Management
  const [apiKey, setApiKey] = useState(getInitialApiKey)
  const [keyModalOpen, setKeyModalOpen] = useState(false)
  const [inputKey, setInputKey] = useState(apiKey === 'fqDiQwYmuIvVrorFowV3' ? '' : apiKey)
  const [hasKeyError, setHasKeyError] = useState(false)
  const [currentStyleId, setCurrentStyleId] = useState('outdoor')
  const [styleMenuOpen, setStyleMenuOpen] = useState(false)

  // Initialize Map with MapTiler SDK
  useEffect(() => {
    if (!mapContainer.current) return

    maptilersdk.config.apiKey = apiKey

    const initialStyleSpec = MAPTILER_STYLES.find((s) => s.id === currentStyleId)?.style || maptilersdk.MapStyle.OUTDOOR

    const map = new maptilersdk.Map({
      container: mapContainer.current,
      style: initialStyleSpec,
      center: DEFAULT_CENTER,
      zoom: 4,
      navigationControl: true,
      interactive: interactive,
    })

    map.on('load', () => {
      setMapReady(true)
    })

    // Listen for MapTiler tile authentication / 403 errors
    map.on('error', (event) => {
      const err = event?.error
      const is403 =
        err?.status === 403 ||
        (typeof err?.message === 'string' && err.message.includes('403')) ||
        event?.status === 403

      if (is403) {
        console.warn('MapTiler key returned 403. Showing key prompt and falling back gracefully.')
        setHasKeyError(true)
        try {
          map.setStyle(CARTO_VOYAGER_STYLE)
        } catch (styleErr) {
          console.error('Failed to apply fallback style:', styleErr)
        }
      }
    })

    map.on('click', (event) => {
      if (editable && markingRef.current && !finishedRef.current && onAddRef.current) {
        onAddRef.current([event.lngLat.lng, event.lngLat.lat])
      }
    })

    mapRef.current = map

    const resizeObserver = new ResizeObserver(() => {
      try {
        map.resize()
      } catch {}
    })
    if (mapContainer.current) {
      resizeObserver.observe(mapContainer.current)
    }

    return () => {
      resizeObserver.disconnect()
      markersRef.current.forEach((marker) => marker.remove())
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [apiKey])

  // Change Map Style (Outdoor, Satellite, Hybrid, Streets)
  const handleStyleChange = (styleItem) => {
    setCurrentStyleId(styleItem.id)
    setStyleMenuOpen(false)
    const map = mapRef.current
    if (!map) return

    try {
      map.setStyle(styleItem.style)
      setHasKeyError(false)
    } catch (err) {
      console.warn('Error setting MapTiler style:', err)
    }
  }

  // Save Custom MapTiler Key
  const handleSaveKey = (e) => {
    e.preventDefault()
    const cleanKey = inputKey.trim()
    if (!cleanKey) return

    if (typeof window !== 'undefined') {
      window.localStorage.setItem('maptiler_api_key', cleanKey)
    }
    maptilersdk.config.apiKey = cleanKey
    setApiKey(cleanKey)
    setHasKeyError(false)
    setKeyModalOpen(false)

    // Re-apply MapTiler style
    const map = mapRef.current
    if (map) {
      const selectedStyle = MAPTILER_STYLES.find((s) => s.id === currentStyleId)?.style || maptilersdk.MapStyle.OUTDOOR
      try {
        map.setStyle(selectedStyle)
      } catch (err) {
        console.warn('Error refreshing style with new key:', err)
      }
    }
  }

  // Sync points, markers, polygon layers, and area
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Update Point Markers
    markersRef.current.forEach((marker) => marker.remove())
    markersRef.current = points.map(([longitude, latitude], index) => {
      const element = document.createElement('div')
      element.className = 'farm-point-marker'
      element.textContent = String(index + 1)
      return new maptilersdk.Marker({ element })
        .setLngLat([longitude, latitude])
        .addTo(map)
    })

    // Farm Name Centroid Label
    if (farmName && points.length) {
      const center = points
        .reduce(
          (sum, [longitude, latitude]) => [sum[0] + longitude, sum[1] + latitude],
          [0, 0],
        )
        .map((value) => value / points.length)

      const label = document.createElement('div')
      label.className = 'farm-name-marker'
      label.textContent = farmName

      markersRef.current.push(
        new maptilersdk.Marker({ element: label, anchor: 'bottom' })
          .setLngLat(center)
          .addTo(map),
      )

      map.flyTo({ center, zoom: 14, essential: true })
    }

    // Prepare Boundary GeoJSON
    const coordinates = points.length >= 3 ? [...points, points[0]] : points
    const data = {
      type: 'FeatureCollection',
      features:
        coordinates.length >= 2
          ? [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: coordinates.length >= 3 ? 'Polygon' : 'LineString',
                  coordinates:
                    coordinates.length >= 3 ? [coordinates] : coordinates,
                },
              },
            ]
          : [],
    }

    const renderLayers = () => {
      if (!map || !map.isStyleLoaded()) return
      const source = map.getSource('farm-boundary')
      if (source) {
        source.setData(data)
      } else {
        map.addSource('farm-boundary', { type: 'geojson', data })
        map.addLayer({
          id: 'farm-boundary-fill',
          type: 'fill',
          source: 'farm-boundary',
          paint: { 'fill-color': '#22c55e', 'fill-opacity': 0.28 },
        })
        map.addLayer({
          id: 'farm-boundary-line',
          type: 'line',
          source: 'farm-boundary',
          paint: { 'line-color': '#15803d', 'line-width': 2.5 },
        })
      }
    }

    if (map.isStyleLoaded()) {
      renderLayers()
    } else {
      map.once('load', renderLayers)
    }

    // Calculate Area
    if (points.length >= 3) {
      try {
        const sqm = turf.area(turf.polygon([[...points, points[0]]]))
        setArea({ sqm, acres: sqm / 4046.8564224, hectares: sqm / 10000 })
      } catch {
        setArea(null)
      }
    } else {
      setArea(null)
    }
  }, [points, farmName, mapReady])

  const locateUser = () => {
    if (!navigator.geolocation) {
      setLocationState('error')
      return
    }
    setLocationState('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        mapRef.current?.flyTo({
          center: [coords.longitude, coords.latitude],
          zoom: 14,
          essential: true,
        })
        setLocationState('ready')
      },
      () => setLocationState('error'),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  const clear = () => {
    if (onClear) onClear()
    setMarking(false)
  }

  return (
    <div className="relative h-full min-h-[340px] w-full overflow-hidden rounded-2xl bg-muted/20">
      <div
        ref={mapContainer}
        className={`h-full min-h-[340px] w-full ${marking ? 'farm-map-marking' : ''}`}
      />

      {/* 403 / Key Notice Banner */}
      {hasKeyError && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex max-w-[92%] items-center gap-2 rounded-xl bg-card/95 px-4 py-2 text-xs shadow-lg backdrop-blur-md border border-amber-500/40 text-foreground">
          <AlertCircle size={15} className="text-amber-500 shrink-0" />
          <span className="truncate">MapTiler Key required or 403 Forbidden. Using fallback tiles.</span>
          <button
            type="button"
            onClick={() => setKeyModalOpen(true)}
            className="shrink-0 rounded-lg bg-primary px-2.5 py-1 font-semibold text-primary-foreground hover:opacity-90 transition text-[11px]"
          >
            Enter Key
          </button>
        </div>
      )}

      {/* Editing Toolbar */}
      {editable && (
        <div className="absolute left-4 top-4 flex max-w-[calc(100%-2rem)] flex-wrap gap-2 z-10">
          <button
            type="button"
            onClick={() => {
              setMarking(true)
              if (onEdit) onEdit()
            }}
            disabled={marking && !finished}
            className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:opacity-90 transition disabled:opacity-70"
          >
            {marking && !finished
              ? 'Click map to place points…'
              : 'Mark Farm Boundary'}
          </button>

          {marking && (
            <>
              <button
                type="button"
                onClick={onUndo}
                disabled={!points.length}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold shadow-md hover:bg-muted transition disabled:opacity-50"
              >
                Undo Last Point
              </button>
              <button
                type="button"
                onClick={clear}
                disabled={!points.length}
                className="rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold shadow-md hover:bg-muted transition disabled:opacity-50"
              >
                Clear All
              </button>
              {points.length >= 3 && !finished && (
                <button
                  type="button"
                  onClick={() => {
                    setMarking(false)
                    if (area && onFinish) onFinish(area)
                  }}
                  className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:opacity-90 transition"
                >
                  Finish Farm
                </button>
              )}
              {finished && (
                <button
                  type="button"
                  onClick={() => {
                    setMarking(true)
                    if (onEdit) onEdit()
                  }}
                  className="rounded-xl bg-card px-3 py-2 text-xs font-semibold text-primary shadow-md hover:bg-muted transition"
                >
                  Edit Boundary
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Map Style Switcher (Outdoor / Satellite / Hybrid / Streets) */}
      <div className="absolute top-4 right-14 z-10">
        <div className="relative">
          <button
            type="button"
            onClick={() => setStyleMenuOpen(!styleMenuOpen)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-card/90 px-3 py-2 text-xs font-semibold shadow-md backdrop-blur-sm hover:bg-card transition"
            title="Change MapTiler Style"
          >
            <Layers size={14} className="text-primary" />
            <span className="capitalize">{currentStyleId}</span>
          </button>

          {styleMenuOpen && (
            <div className="absolute right-0 top-10 z-30 w-36 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl">
              {MAPTILER_STYLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleStyleChange(item)}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium transition hover:bg-muted ${
                    currentStyleId === item.id ? 'text-primary font-bold bg-muted/60' : 'text-foreground'
                  }`}
                >
                  <span>{item.label}</span>
                  {currentStyleId === item.id && <Check size={13} className="text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Geolocation Button */}
      <button
        type="button"
        onClick={locateUser}
        disabled={locationState === 'loading'}
        className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 rounded-xl border border-border bg-card/90 px-3 py-2 text-xs font-semibold text-primary shadow-md backdrop-blur-sm hover:bg-muted transition"
      >
        <MapPin size={13} />
        {locationState === 'loading' ? 'Locating…' : 'Use my location'}
      </button>

      {/* Calculated Area Overlay */}
      {area && (
        <div className="absolute bottom-4 right-4 z-10 rounded-xl border border-border bg-card/95 px-4 py-2.5 shadow-md backdrop-blur-sm text-right">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Farm area
          </p>
          <p className="text-base font-bold text-primary">
            {area.acres.toFixed(2)} acres
          </p>
          <p className="text-[10px] text-muted-foreground">
            {area.hectares.toFixed(2)} hectares
          </p>
        </div>
      )}

      {/* Completed Badge */}
      {finished && (
        <div className="absolute right-4 top-16 z-10 rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold shadow-md">
          Boundary Completed
        </div>
      )}

      {/* Error Notices */}
      {locationState === 'error' && (
        <p className="absolute bottom-16 left-4 z-10 max-w-[220px] rounded-lg bg-card px-3 py-2 text-xs text-destructive shadow-md">
          Location permission was denied or unavailable.
        </p>
      )}

      {/* MapTiler API Key Modal */}
      {keyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Key size={16} />
                </div>
                <h3 className="font-bold text-foreground text-sm">MapTiler API Key</h3>
              </div>
              <button
                type="button"
                onClick={() => setKeyModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              MapTiler powers high-resolution satellite imagery, terrain topology, and outdoor farm boundary mapping.
            </p>

            <form onSubmit={handleSaveKey} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Enter Your MapTiler Key
                </label>
                <input
                  type="text"
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="Paste MapTiler API key here"
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-mono outline-none focus:border-primary"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <a
                  href="https://cloud.maptiler.com/account/keys/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  Get a free key (100k requests/mo) <ExternalLink size={11} />
                </a>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setKeyModalOpen(false)}
                    className="rounded-xl border border-border px-3 py-2 text-xs font-semibold hover:bg-muted transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-md hover:opacity-90 transition"
                  >
                    Save & Apply
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default FarmMap
