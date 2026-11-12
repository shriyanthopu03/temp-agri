import { useMemo, useState } from 'react'
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

function formatLocation(location) {
  if (!location) return 'Location pending'
  if (typeof location === 'string') return location
  if (location.address) return location.address
  if (Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude))) {
    return `${Number(location.latitude).toFixed(4)}, ${Number(location.longitude).toFixed(4)}`
  }
  return 'Location pending'
}

export function LogisticsDeliveriesPage({ shipments = [], onAcceptOrder, onMarkDelivered }) {
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
          <div className="border-b border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-primary uppercase tracking-wider">
                  Order ID: {selectedShipment.reference || selectedShipment.shipmentNumber}
                </span>
                <h2 className="text-lg font-bold text-foreground mt-0.5">{farm?.farmName || 'Registered Farm'}</h2>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={13} /> Pickup: {formatLocation(selectedShipment.pickupLocation || farm?.location)}
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
                  <span className="flex items-center gap-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-3 py-2 text-xs font-bold">
                    <CheckCircle size={15} /> Delivery Completed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Farm Boundary Map */}
          <div className="h-[300px] border-b border-border">
            <FarmMap points={farmPoints(selectedShipment)} farmName={farm?.farmName} finished={false} />
          </div>

          {/* Farmer & Buyer Information Grid */}
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4 border-b border-border bg-muted/20 text-xs">
            <div className="rounded-xl bg-card border border-border p-3">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Farmer Information</p>
              <p className="font-semibold text-foreground mt-1 flex items-center gap-1"><User size={13} /> {farmer}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{selectedShipment.farmer?.email || 'N/A'}</p>
            </div>

            <div className="rounded-xl bg-card border border-border p-3">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Buyer Information</p>
              <p className="font-semibold text-foreground mt-1 flex items-center gap-1"><User size={13} /> {buyer}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{selectedShipment.buyer?.email || 'N/A'}</p>
            </div>

            <div className="rounded-xl bg-card border border-border p-3">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Produce & Volume</p>
              <p className="font-semibold text-foreground mt-1 flex items-center gap-1">
                <Package size={13} /> {batch?.category || selectedShipment.order?.crop || 'Crop'}
              </p>
              <p className="text-[11px] text-primary font-bold mt-0.5">
                {selectedShipment.order?.quantity} {selectedShipment.order?.unit || 'kg'} · Total ₹{(selectedShipment.order?.totalAmount || 0).toLocaleString('en-IN')}
              </p>
            </div>

            <div className="rounded-xl bg-card border border-border p-3">
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Quality Certification</p>
              <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                <ShieldCheck size={13} /> {selectedShipment.qualityGrade || batch?.qualityGrade || 'Pending Inspection'}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Inspected & Approved</p>
            </div>
          </div>

          {/* Delivery Route Details */}
          <div className="p-5 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <p className="font-bold text-foreground text-sm">Logistics Transport & Routing</p>
              {selectedShipment.vehicle && (
                <span className="font-medium text-primary bg-secondary px-2.5 py-1 rounded-md">
                  Assigned Vehicle: {selectedShipment.vehicle}
                </span>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div className="rounded-xl bg-muted/40 p-3 border border-border/60">
                <p className="font-semibold text-muted-foreground flex items-center gap-1">
                  <Navigation size={13} className="text-primary" /> Pickup Origin (Farm)
                </p>
                <p className="font-medium text-foreground mt-1">{formatLocation(selectedShipment.pickupLocation || farm?.location)}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 border border-border/60">
                <p className="font-semibold text-muted-foreground flex items-center gap-1">
                  <MapPin size={13} className="text-emerald-600" /> Destination (Buyer Delivery Hub)
                </p>
                <p className="font-medium text-foreground mt-1">{formatLocation(selectedShipment.destination)}</p>
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

export default LogisticsDeliveriesPage
