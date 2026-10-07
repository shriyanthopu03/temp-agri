import { useMemo, useState } from 'react'
import { CheckCircle, MapPin, Package, Truck } from 'lucide-react'
import { FarmMap } from './FarmMap'

function farmPoints(shipment) {
  if (!shipment) return []
  const coords = shipment.order?.farm?.boundary?.coordinates?.[0]
  if (Array.isArray(coords) && coords.length >= 3) {
    return coords.length > 1 && coords[0][0] === coords.at(-1)[0] && coords[0][1] === coords.at(-1)[1]
      ? coords.slice(0, -1)
      : coords
  }
  const pickup = shipment.pickupLocation || shipment.order?.farm?.location
  if (Number.isFinite(Number(pickup?.longitude)) && Number.isFinite(Number(pickup?.latitude))) {
    const lng = Number(pickup.longitude)
    const lat = Number(pickup.latitude)
    return [
      [lng - 0.0015, lat - 0.0015],
      [lng + 0.0015, lat - 0.0015],
      [lng + 0.0015, lat + 0.0015],
    ]
  }
  return []
}

export function LogisticsDeliveriesPage({ shipments = [], onMarkDelivered }) {
  const [selectedId, setSelectedId] = useState(shipments[0]?.id)
  const selectedShipment = useMemo(
    () => shipments.find((shipment) => shipment.id === selectedId) || shipments[0],
    [selectedId, shipments],
  )

  if (!shipments.length) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <Truck size={36} className="mx-auto mb-3 text-muted-foreground" />
        <h1 className="text-xl font-semibold">No buyer deliveries yet</h1>
        <p className="mt-2 text-sm text-muted-foreground">Shipments created from buyer purchases will appear here.</p>
      </section>
    )
  }

  const farm = selectedShipment.order?.farm
  const batch = selectedShipment.order?.batch
  const buyer = selectedShipment.buyer?.name || selectedShipment.order?.buyer?.name || 'Buyer'
  const canMarkDelivered = selectedShipment.status !== 'delivered'

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Logistics workspace</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Buyer deliveries</h1>
        <p className="mt-1 text-sm text-muted-foreground">Review purchased farm produce, pickup locations, and delivery status.</p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <section className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-4">
            <h2 className="font-semibold">Shipment queue</h2>
            <p className="mt-1 text-xs text-muted-foreground">{shipments.length} buyer shipment(s)</p>
          </div>
          <div className="divide-y divide-border">
            {shipments.map((shipment) => (
              <button
                type="button"
                key={shipment.id}
                onClick={() => setSelectedId(shipment.id)}
                className={`w-full p-4 text-left transition hover:bg-muted/50 ${selectedShipment.id === shipment.id ? 'bg-secondary/60' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{shipment.reference || shipment.shipmentNumber}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{shipment.order?.farm?.farmName || 'Farm location pending'}</p>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold capitalize text-primary">
                    {shipment.status?.replaceAll('_', ' ')}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Buyer: {shipment.buyer?.name || 'Buyer'}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="border-b border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{farm?.farmName || 'Purchased farm'}</h2>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin size={14} /> {shipmentAddress(selectedShipment)}
                </p>
              </div>
              {canMarkDelivered && (
                <button
                  type="button"
                  onClick={() => onMarkDelivered?.(selectedShipment.id)}
                  className="flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <CheckCircle size={16} /> Mark as delivered
                </button>
              )}
            </div>
          </div>
          <div className="h-[360px]">
            <FarmMap points={farmPoints(selectedShipment)} farmName={farm?.farmName} finished={false} />
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
            <Detail label="Buyer" value={buyer} />
            <Detail label="Farmer" value={selectedShipment.farmer?.name || 'Farmer'} />
            <Detail label="Produce" value={`${batch?.category || 'Produce'} · ${selectedShipment.order?.quantity || '—'} ${selectedShipment.order?.unit || 'kg'}`} icon={<Package size={14} />} />
            <Detail label="Quality grade" value={selectedShipment.qualityGrade || batch?.qualityGrade || 'Inspected'} />
          </div>
          <div className="border-t border-border p-5 text-sm">
            <p className="font-semibold">Delivery route</p>
            <p className="mt-2 text-muted-foreground">Pickup: {formatLocation(selectedShipment.pickupLocation)}</p>
            <p className="mt-1 text-muted-foreground">Destination: {formatLocation(selectedShipment.destination)}</p>
          </div>
        </section>
      </div>
    </div>
  )
}

function Detail({ label, value, icon }) {
  return <div className="rounded-xl bg-muted/50 p-3"><p className="text-[10px] text-muted-foreground">{label}</p><p className="mt-1 flex items-center gap-1 text-sm font-semibold">{icon}{value}</p></div>
}

function formatLocation(location) {
  if (!location) return 'Not available'
  return location.address || `${location.latitude ?? '—'}, ${location.longitude ?? '—'}`
}

function shipmentAddress(shipment) {
  return formatLocation(shipment.order?.farm?.location || shipment.pickupLocation)
}
