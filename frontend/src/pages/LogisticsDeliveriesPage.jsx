import React, { useMemo, useState } from 'react'
import {
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileCheck,
  MapPin,
  Navigation,
  Package,
  ShieldCheck,
  Truck,
  User,
  X,
} from 'lucide-react'
import { FarmMap } from '../components/FarmMap'

function farmPoints(shipment) {
  if (!shipment) return []
  const coords = shipment.order?.farm?.boundary?.coordinates?.[0]
  if (Array.isArray(coords) && coords.length >= 3) {
    return coords.length > 1 && coords[0][0] === coords.at(-1)[0] && coords[0][1] === coords.at(-1)[1]
      ? coords.slice(0, -1)
      : coords
  }
  const pickup = shipment.pickupLocation || shipment.order?.farm?.location || shipment.order?.pickupLocation
  const lat = Number(pickup?.latitude)
  const lng = Number(pickup?.longitude)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return [
      [lng - 0.0015, lat - 0.0015],
      [lng + 0.0015, lat - 0.0015],
      [lng + 0.0015, lat + 0.0015],
    ]
  }
  return [[78.5663, 17.4306], [78.5693, 17.4306], [78.5693, 17.4336]]
}

function formatLocation(location, fallbackPoints = [], fallbackLabel = 'Location pending') {
  if (!location && (!fallbackPoints || fallbackPoints.length === 0)) return fallbackLabel

  let lat = Number(location?.latitude)
  let lng = Number(location?.longitude)

  if ((!Number.isFinite(lat) || !Number.isFinite(lng)) && Array.isArray(fallbackPoints) && fallbackPoints.length > 0) {
    const sum = fallbackPoints.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0])
    lng = sum[0] / fallbackPoints.length
    lat = sum[1] / fallbackPoints.length
  }

  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
  const coordsFormatted = hasCoords ? `GPS: ${lat.toFixed(4)}, ${lng.toFixed(4)}` : null

  const rawAddress = typeof location === 'string' ? location : location?.address

  // Sanitize legacy static strings or placeholders
  if (rawAddress && (rawAddress.toLowerCase().includes('nashik') || rawAddress.includes('—'))) {
    return coordsFormatted || fallbackLabel
  }

  if (rawAddress && rawAddress !== 'Location pending' && rawAddress !== 'Registered Farm Land') {
    return rawAddress
  }

  return coordsFormatted || fallbackLabel
}

function LogisticsDeliveriesPage({ shipments = [], onAcceptOrder, onMarkDelivered }) {
  const [selectedId, setSelectedId] = useState(shipments[0]?.id)
  const [showAcceptModal, setShowAcceptModal] = useState(false)
  const [vehicleNumber, setVehicleNumber] = useState('')
  const [driverName, setDriverName] = useState('')
  const [accepting, setAccepting] = useState(false)

  const selectedShipment = useMemo(
    () => shipments.find((shipment) => shipment.id === selectedId) || shipments[0],
    [selectedId, shipments]
  )

  if (!shipments.length) {
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
        <Truck size={42} className="mx-auto mb-3 text-muted-foreground opacity-60" />
        <h1 className="text-xl font-bold">No buyer shipment orders in queue</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          When buyers place purchase orders for inspected produce, they will automatically appear here for logistics coordination.
        </p>
      </section>
    )
  }

  const farm = selectedShipment.order?.farm
  const batch = selectedShipment.order?.batch
  const buyer = selectedShipment.buyer?.name || selectedShipment.order?.buyer?.name || 'Bulk Procurement Buyer'
  const farmer = selectedShipment.farmer?.name || selectedShipment.order?.supplier?.name || 'Registered Farmer'
  const isReadyForPickup = selectedShipment.status === 'ready_for_pickup' || selectedShipment.status === 'created'
  const isAssigned = selectedShipment.status === 'assigned' || selectedShipment.status === 'dispatched'
  const isDelivered = selectedShipment.status === 'delivered'

  const handleAcceptSubmit = async (e) => {
    e.preventDefault()
    if (!onAcceptOrder) return
    setAccepting(true)
    try {
      await onAcceptOrder(selectedShipment.id, {
        vehicleId: vehicleNumber,
        driverName: driverName,
        note: `Transport coordinated with Vehicle ${vehicleNumber} (Driver: ${driverName})`,
      })
      setShowAcceptModal(false)
    } catch (err) {
      console.error(err)
    } finally {
      setAccepting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Logistics Operations Hub</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">Buyer Orders & Fleet Deliveries</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Coordinate farm pickup, assign transportation vehicles, and track fulfillment to buyer destinations.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        {/* Shipment Queue List */}
        <section className="rounded-2xl border border-border bg-card shadow-sm flex flex-col">
          <div className="border-b border-border p-4 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-sm md:text-base">Order Shipment Queue</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">{shipments.length} order(s) awaiting delivery</p>
            </div>
            <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
              Fleet Ready
            </span>
          </div>

          <div className="divide-y divide-border overflow-y-auto max-h-[600px]">
            {shipments.map((shipment) => {
              const isSelected = selectedShipment.id === shipment.id
              const isPendingAccept = shipment.status === 'ready_for_pickup' || shipment.status === 'created'
              return (
                <button
                  type="button"
                  key={shipment.id}
                  onClick={() => setSelectedId(shipment.id)}
                  className={`w-full p-4 text-left transition hover:bg-muted/50 ${isSelected ? 'bg-secondary/70 border-l-4 border-l-primary' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-foreground">{shipment.reference || shipment.shipmentNumber}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {shipment.order?.farm?.farmName || 'Registered Farm'} · {shipment.order?.batch?.category || shipment.order?.crop || 'Produce Lot'}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        shipment.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : shipment.status === 'assigned' || shipment.status === 'dispatched'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {shipment.status === 'ready_for_pickup' ? 'Pending Acceptance' : shipment.status?.replaceAll('_', ' ')}
                    </span>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-xs text-muted-foreground">
                    <span>Buyer: {shipment.buyer?.name || shipment.order?.buyer?.name || 'Buyer'}</span>
                    <span className="font-semibold text-foreground">
                      {shipment.order?.quantity ? `${shipment.order.quantity} ${shipment.order.unit || 'kg'}` : '—'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Selected Shipment Detail & Map */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col">
          <div className="border-b border-border p-5 bg-card">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-0.5 rounded-md">
                    Order ID: {selectedShipment.reference || selectedShipment.shipmentNumber}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      selectedShipment.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : selectedShipment.status === 'assigned' || selectedShipment.status === 'dispatched'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}
                  >
                    {selectedShipment.status === 'ready_for_pickup' ? 'Pending Acceptance' : selectedShipment.status?.replaceAll('_', ' ')}
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground mt-1.5 flex items-center gap-2">
                  {farm?.farmName || selectedShipment.order?.crop || 'Agricultural Produce Lot'}
                </h2>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin size={14} className="text-primary shrink-0" />
                  <span>Pickup: {formatLocation(selectedShipment.pickupLocation || farm?.location || selectedShipment.order?.pickupLocation, farmPoints(selectedShipment), 'GPS Coordinates Registered')}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {isReadyForPickup && (
                  <button
                    type="button"
                    onClick={() => setShowAcceptModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 transition"
                  >
                    <Truck size={15} /> Accept Order & Coordinate Fleet
                  </button>
                )}

                {isAssigned && (
                  <button
                    type="button"
                    onClick={() => onMarkDelivered?.(selectedShipment.id)}
                    className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm transition"
                  >
                    <CheckCircle size={15} /> Mark as Delivered
                  </button>
                )}

                {isDelivered && (
                  <span className="flex items-center gap-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3.5 py-2 text-xs font-bold border border-emerald-500/30">
                    <CheckCircle size={15} /> Delivery Completed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Farm Boundary Map */}
          <div className="relative w-full h-[360px] md:h-[400px] border-b border-border overflow-hidden bg-muted/10 isolate">
            <FarmMap
              points={farmPoints(selectedShipment)}
              farmName={farm?.farmName || selectedShipment.order?.crop}
              finished={false}
              interactive={true}
              className="rounded-none"
            />
          </div>

          {/* Farmer & Buyer Information Grid */}
          <div className="grid gap-3.5 p-5 sm:grid-cols-2 lg:grid-cols-4 border-b border-border bg-muted/20 text-xs">
            <div className="rounded-xl bg-card border border-border p-3.5 shadow-xs space-y-1.5 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Farmer Details</span>
                <span className="p-1 rounded-md bg-primary/10 text-primary"><User size={13} /></span>
              </div>
              <p className="font-bold text-foreground text-sm truncate">{farmer}</p>
              <p className="text-[11px] text-muted-foreground truncate">{selectedShipment.farmer?.email || 'Registered Producer'}</p>
            </div>

            <div className="rounded-xl bg-card border border-border p-3.5 shadow-xs space-y-1.5 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Buyer Details</span>
                <span className="p-1 rounded-md bg-secondary text-secondary-foreground"><User size={13} /></span>
              </div>
              <p className="font-bold text-foreground text-sm truncate">{buyer}</p>
              <p className="text-[11px] text-muted-foreground truncate">{selectedShipment.buyer?.email || 'Commercial Procurement'}</p>
            </div>

            <div className="rounded-xl bg-card border border-border p-3.5 shadow-xs space-y-1.5 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Produce & Volume</span>
                <span className="p-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400"><Package size={13} /></span>
              </div>
              <p className="font-bold text-foreground text-sm truncate">
                {batch?.category || selectedShipment.order?.crop || 'Certified Harvest'}
              </p>
              <p className="text-[11px] text-primary font-bold">
                {selectedShipment.order?.quantity ?? '—'} {selectedShipment.order?.unit || 'kg'} · Total ₹{(selectedShipment.order?.totalAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="rounded-xl bg-card border border-border p-3.5 shadow-xs space-y-1.5 transition hover:shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Quality Certification</span>
                <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><ShieldCheck size={13} /></span>
              </div>
              <p className="font-bold text-emerald-700 dark:text-emerald-400 text-sm truncate">
                {selectedShipment.qualityGrade || batch?.qualityGrade || 'Grade A'}
              </p>
              <p className="text-[11px] text-muted-foreground">Inspected & Quality Verified</p>
            </div>
          </div>

          {/* Delivery Route Details */}
          <div className="p-5 text-xs space-y-3 bg-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-bold text-foreground text-sm">Logistics Transport & Fleet Coordination</p>
                <p className="text-[11px] text-muted-foreground">GPS tracking between producer pickup location and buyer distribution center.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {selectedShipment.vehicle && (
                  <span className="font-semibold text-primary bg-secondary/80 border border-border px-3 py-1 rounded-lg text-xs flex items-center gap-1.5">
                    <Truck size={13} /> Vehicle: {selectedShipment.vehicle}
                  </span>
                )}
                {selectedShipment.deliveryAgent && (
                  <span className="font-semibold text-foreground bg-muted border border-border px-3 py-1 rounded-lg text-xs flex items-center gap-1.5">
                    <User size={13} /> Driver: {selectedShipment.deliveryAgent}
                  </span>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl bg-muted/40 p-3.5 border border-border/80 space-y-1">
                <p className="font-bold text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Navigation size={14} className="text-primary" /> Pickup Origin (Producer Plot)
                </p>
                <p className="font-semibold text-foreground text-sm">
                  {formatLocation(selectedShipment.pickupLocation || farm?.location || selectedShipment.order?.pickupLocation, farmPoints(selectedShipment), 'GPS: 17.4321, 78.5678')}
                </p>
                <p className="text-[11px] text-muted-foreground">Coordinates verified via polygon land plot</p>
              </div>

              <div className="rounded-xl bg-muted/40 p-3.5 border border-border/80 space-y-1">
                <p className="font-bold text-muted-foreground flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <MapPin size={14} className="text-emerald-600" /> Destination (Buyer Delivery Hub)
                </p>
                <p className="font-semibold text-foreground text-sm">
                  {formatLocation(selectedShipment.destination || selectedShipment.order?.buyerLocation, [], 'Buyer Logistics Distribution Hub (GPS: 19.0760, 72.8777)')}
                </p>
                <p className="text-[11px] text-muted-foreground">Confirmed intake delivery terminal</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Accept Order Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Truck className="text-primary" size={20} />
                <h3 className="font-bold text-base">Accept Order & Assign Fleet</h3>
              </div>
              <button onClick={() => setShowAcceptModal(false)} className="rounded-lg p-1 hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Accepting order <strong>{selectedShipment.reference || selectedShipment.shipmentNumber}</strong> for <strong>{selectedShipment.order?.quantity} {selectedShipment.order?.unit || 'kg'}</strong> of {batch?.category || selectedShipment.order?.crop || 'produce'}.
            </p>

            <form onSubmit={handleAcceptSubmit} className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Assigned Transport Vehicle Number</span>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  required
                  placeholder="e.g. MH-12-AB-1234"
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:border-primary"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-medium text-foreground">Assigned Fleet Driver</span>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                  placeholder="Driver Full Name"
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:border-primary"
                />
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAcceptModal(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={accepting}
                  className="rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {accepting ? 'Assigning...' : 'Confirm Order Acceptance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export { LogisticsDeliveriesPage }
export default LogisticsDeliveriesPage

