import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import * as turf from '@turf/turf'
import '@maptiler/sdk/dist/maptiler-sdk.css'

const DEFAULT_CENTER = [78.9629, 20.5937]

// High-availability Carto Voyager style (free raster tiles, zero API key required, reliable for agricultural mapping)
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

// Fallback OpenStreetMap standard raster style
const OSM_STYLE = {
  version: 8,
  sources: {
    'osm-tiles': {
      type: 'raster',
      tiles: [
        'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
        'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: 'osm-tiles-layer',
      type: 'raster',
      source: 'osm-tiles',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
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

  // Determine map style based on available API key
  const userKey =
    (typeof process !== 'undefined' && process.env?.MAPTILER_API_KEY) ||
    (import.meta?.env && import.meta.env.VITE_MAPTILER_API_KEY) ||
    ''

  // Only use MapTiler cloud if a genuine custom key is provided (ignore known deprecated demo key)
  const hasValidCustomKey =
    Boolean(userKey) &&
    userKey !== 'fqDiQwYmuIvVrorFowV3' &&
    userKey.trim().length > 6

  const resolvedInitialStyle = hasValidCustomKey
    ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${userKey}`
    : CARTO_VOYAGER_STYLE

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: resolvedInitialStyle,
      center: DEFAULT_CENTER,
      zoom: 4,
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')

    map.on('load', () => {
      setMapReady(true)
    })

    // If external MapTiler style fails with 403 or network issue, fallback gracefully to CARTO/OSM
    map.on('error', (e) => {
      if (
        hasValidCustomKey &&
        (e?.error?.status === 403 ||
          (typeof e?.error?.message === 'string' && e.error.message.includes('403')))
      ) {
        console.warn('MapTiler key returned 403. Falling back to built-in Carto/OSM tiles.')
        try {
          map.setStyle(CARTO_VOYAGER_STYLE)
        } catch {
          map.setStyle(OSM_STYLE)
        }
      }
    })

    map.on('click', (event) => {
      if (editable && markingRef.current && !finishedRef.current && onAddRef.current) {
        onAddRef.current([event.lngLat.lng, event.lngLat.lat])
      }
    })

    mapRef.current = map

    return () => {
      markersRef.current.forEach((marker) => marker.remove())
      map.remove()
      mapRef.current = null
      setMapReady(false)
    }
  }, [])

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
      return new maplibregl.Marker({ element })
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
        new maplibregl.Marker({ element: label, anchor: 'bottom' })
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

      {/* Geolocation Button */}
      <button
        type="button"
        onClick={locateUser}
        disabled={locationState === 'loading'}
        className="absolute bottom-4 left-4 z-10 rounded-xl border border-border bg-card px-3 py-2 text-xs font-semibold text-primary shadow-md hover:bg-muted transition"
      >
        {locationState === 'loading' ? 'Locating…' : 'Use my location'}
      </button>

      {/* Calculated Area Overlay */}
      {area && (
        <div className="absolute bottom-4 right-4 z-10 rounded-xl border border-border bg-card px-4 py-2.5 shadow-md text-right">
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
        <div className="absolute right-4 top-4 z-10 rounded-xl bg-emerald-600 text-white px-3 py-1.5 text-xs font-semibold shadow-md">
          Boundary Completed
        </div>
      )}

      {/* Error Notices */}
      {locationState === 'error' && (
        <p className="absolute bottom-16 left-4 z-10 max-w-[220px] rounded-lg bg-card px-3 py-2 text-xs text-destructive shadow-md">
          Location permission was denied or unavailable.
        </p>
      )}
    </div>
  )
}

export default FarmMap
