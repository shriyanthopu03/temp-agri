import { useEffect } from 'react'
import { MapContainer, TileLayer, Polygon, useMapEvents } from 'react-leaflet'
import L from 'leaflet'

type Point = [number, number]

function MapClickHandler({ onAdd }: { onAdd: (point: Point) => void }) {
  useMapEvents({ click: (event) => onAdd([event.latlng.lat, event.latlng.lng]) })
  return null
}

export function FarmMap({ points, onAdd }: { points: Point[]; onAdd: (point: Point) => void }) {
  useEffect(() => {
    const icon = L.divIcon({ className: 'farm-marker', html: '<span></span>', iconSize: [14, 14], iconAnchor: [7, 7] })
    void icon
  }, [])
  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={4} scrollWheelZoom className="min-h-[420px] rounded-2xl">
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapClickHandler onAdd={onAdd} />
      {points.length > 2 && <Polygon positions={points} pathOptions={{ color: '#2f6b45', fillColor: '#6ba66f', fillOpacity: 0.3, weight: 3 }} />}
    </MapContainer>
  )
}
