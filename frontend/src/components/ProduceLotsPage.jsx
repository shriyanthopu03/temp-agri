import { useMemo, useState } from 'react'
import {
  Award,
  Box,
  Check,
  CheckCircle2,
  Clock,
  FileCheck,
  FileText,
  Filter,
  Layers,
  Leaf,
  MapPin,
  Package,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Ship,
  Sprout,
  Truck,
  User,
  Warehouse,
  X,
} from 'lucide-react'

export function ProduceLotsPage({
  role,
  lots = [],
  farms = [],
  session,
  onCreateLot,
  onInspectLot,
  onWarehouseMove,
  onDispatchShipment,
  onDeliverShipment,
}) {
  const [search, setSearch] = useState('')
  const [selectedStatusTab, setSelectedStatusTab] = useState('all')

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showInspectModal, setShowInspectModal] = useState(false)
  const [showWarehouseModal, setShowWarehouseModal] = useState(false)
  const [showDispatchModal, setShowDispatchModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const [activeLot, setActiveLot] = useState(null)

  // New Lot Form
  const [newCategory, setNewCategory] = useState('Organic Grapes')
  const [newQuantity, setNewQuantity] = useState('500')
  const [newUnit, setNewUnit] = useState('kg')
  const [newFarmer, setNewFarmer] = useState(session?.user?.name || 'Farmer Ramesh')
  const [newFarm, setNewFarm] = useState(farms[0]?.name || 'Green Acres Parcel A')

  // Quality Form
  const [inspectGrade, setInspectGrade] = useState('Grade A')
  const [inspectMoisture, setInspectMoisture] = useState('12.4%')
  const [inspectPurity, setInspectPurity] = useState('99.1%')
  const [inspectNotes, setInspectNotes] = useState('Certified premium quality. Passed lab analysis.')
  const [inspectAccepted, setInspectAccepted] = useState(true)

  // Warehouse Form
  const [warehouseLocation, setWarehouseLocation] = useState('Central Warehouse Hub #1')
  const [warehouseBin, setWarehouseBin] = useState('Bin-A12')

  // Dispatch Form
  const [vehicleId, setVehicleId] = useState('MH-12-AB-4081')
  const [driverName, setDriverName] = useState('Suresh Kumar')
  const [destination, setDestination] = useState('Apex Supermarket Central Depot')

  // Seed default lots if empty
  const defaultLotsList = useMemo(() => {
    if (lots && lots.length > 0) return lots
    return [
      {
        id: '65f1a10001',
        lotCode: 'LOT-2026-001',
        category: 'Organic Grapes',
        quantity: 1200,
        unit: 'kg',
        farmerName: 'Ramesh Patel',
        farmName: 'Vineyard Parcel 1',
        status: 'accepted',
        qualityGrade: 'Grade A (Export Quality)',
        createdAt: '2026-09-20',
        moisture: '11.8%',
        purity: '99.4%',
      },
      {
        id: '65f1a10002',
        lotCode: 'LOT-2026-002',
        category: 'Cotton Bales',
        quantity: 3500,
        unit: 'kg',
        farmerName: 'Suresh Patil',
        farmName: 'Cotton Fields B',
        status: 'created',
        qualityGrade: 'Pending Inspection',
        createdAt: '2026-09-22',
      },
      {
        id: '65f1a10003',
        lotCode: 'LOT-2026-003',
        category: 'Khabli Wheat',
        quantity: 2400,
        unit: 'kg',
        farmerName: 'Anita Deshmukh',
        farmName: 'Golden Fields',
        status: 'stored',
        qualityGrade: 'Grade A',
        warehouseBin: 'Bin B-04',
        createdAt: '2026-09-18',
      },
      {
        id: '65f1a10004',
        lotCode: 'LOT-2026-004',
        category: 'Basmati Rice',
        quantity: 5000,
        unit: 'kg',
        farmerName: 'Vikram Singh',
        farmName: 'River Delta Farm',
        status: 'dispatched',
        qualityGrade: 'Grade A',
        vehicle: 'MH-14-GH-9912',
        createdAt: '2026-09-15',
      },
      {
        id: '65f1a10005',
        lotCode: 'LOT-2026-005',
        category: 'Alphonso Mangoes',
        quantity: 800,
        unit: 'kg',
        farmerName: 'Ramesh Patel',
        farmName: 'Mango Grove Parcel',
        status: 'delivered',
        qualityGrade: 'Grade A (Premium)',
        deliveredAt: '2026-09-23',
        createdAt: '2026-09-14',
      },
    ]
  }, [lots])

  const [localLots, setLocalLots] = useState(defaultLotsList)

  // Filter lots
  const filteredLots = useMemo(() => {
    return localLots.filter((lot) => {
      const lotIdStr = (lot.lotCode || lot.id || '').toLowerCase()
      const farmerStr = (lot.farmerName || '').toLowerCase()
      const catStr = (lot.category || '').toLowerCase()
      const searchLower = search.toLowerCase()

      const matchesSearch = lotIdStr.includes(searchLower) || farmerStr.includes(searchLower) || catStr.includes(searchLower)
      const matchesStatus = selectedStatusTab === 'all' || lot.status === selectedStatusTab
      return matchesSearch && matchesStatus
    })
  }, [localLots, search, selectedStatusTab])

  // Count summaries
  const countCreated = localLots.filter((l) => l.status === 'created').length
  const countInspected = localLots.filter((l) => l.status === 'accepted' || l.status === 'inspected').length
  const countStored = localLots.filter((l) => l.status === 'stored').length
  const countDispatched = localLots.filter((l) => l.status === 'dispatched' || l.status === 'in_transit').length
  const countDelivered = localLots.filter((l) => l.status === 'delivered').length

  // Handlers
  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    const newLot = {
      id: String(Date.now()),
      lotCode: `LOT-2026-${Math.floor(100 + Math.random() * 900)}`,
      category: newCategory,
      quantity: Number(newQuantity),
      unit: newUnit,
      farmerName: newFarmer,
      farmName: newFarm,
      status: 'created',
      qualityGrade: 'Pending Inspection',
      createdAt: new Date().toISOString().split('T')[0],
    }
    if (onCreateLot) {
      try {
        await onCreateLot(newLot)
      } catch (err) {
        console.error(err)
      }
    }
    setLocalLots([newLot, ...localLots])
    setShowCreateModal(false)
  }

  const handleInspectSubmit = async (e) => {
    e.preventDefault()
    if (!activeLot) return
    const updatedStatus = inspectAccepted ? 'accepted' : 'rejected'
    const updatedGrade = inspectAccepted ? inspectGrade : 'Rejected'
    const updatedLots = localLots.map((l) =>
      l.id === activeLot.id
        ? {
            ...l,
            status: updatedStatus,
            qualityGrade: updatedGrade,
            moisture: inspectMoisture,
            purity: inspectPurity,
            notes: inspectNotes,
          }
        : l
    )
    if (onInspectLot) {
      try {
        await onInspectLot(activeLot.id, { grade: inspectGrade, accepted: inspectAccepted, notes: inspectNotes })
      } catch (err) {
        console.error(err)
      }
    }
    setLocalLots(updatedLots)
    setShowInspectModal(false)
  }

  const handleWarehouseSubmit = async (e) => {
    e.preventDefault()
    if (!activeLot) return
    const updatedLots = localLots.map((l) =>
      l.id === activeLot.id
        ? {
            ...l,
            status: 'stored',
            warehouseLocation,
            warehouseBin,
          }
        : l
    )
    if (onWarehouseMove) {
      try {
        await onWarehouseMove(activeLot.id, { warehouseLocation, warehouseBin })
      } catch (err) {
        console.error(err)
      }
    }
    setLocalLots(updatedLots)
    setShowWarehouseModal(false)
  }

  const handleDispatchSubmit = async (e) => {
    e.preventDefault()
    if (!activeLot) return
    const updatedLots = localLots.map((l) =>
      l.id === activeLot.id
        ? {
            ...l,
            status: 'dispatched',
            vehicle: vehicleId,
            driverName,
            destination,
          }
        : l
    )
    if (onDispatchShipment) {
      try {
        await onDispatchShipment(activeLot.id, { vehicleId, driverName, destination })
      } catch (err) {
        console.error(err)
      }
    }
    setLocalLots(updatedLots)
    setShowDispatchModal(false)
  }

  const handleMarkDelivered = (lotId) => {
    const updatedLots = localLots.map((l) =>
      l.id === lotId
        ? {
            ...l,
            status: 'delivered',
            deliveredAt: new Date().toISOString().split('T')[0],
          }
        : l
    )
    if (onDeliverShipment) onDeliverShipment(lotId)
    setLocalLots(updatedLots)
    if (activeLot?.id === lotId) {
      setActiveLot({ ...activeLot, status: 'delivered', deliveredAt: new Date().toISOString().split('T')[0] })
    }
  }

  // Timeline Step Helper
  const getTimelineStep = (status) => {
    switch (status) {
      case 'created':
        return 1
      case 'accepted':
      case 'inspected':
        return 2
      case 'stored':
        return 3
      case 'dispatched':
      case 'in_transit':
        return 4
      case 'delivered':
        return 5
      default:
        return 1
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Produce Lots Lifecycle & Tracking</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Follow batch creation, quality inspection, warehouse intake, dispatch, and final delivery.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus size={18} /> Register Harvest Batch Lot
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Pending Inspection</p>
          <p className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">{countCreated}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Awaiting Quality Check</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Quality Certified</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{countInspected}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Grade A/B Accepted</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">In Warehouse Storage</p>
          <p className="mt-1 text-2xl font-bold text-blue-600 dark:text-blue-400">{countStored}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Assigned Bins</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Dispatched Fleet</p>
          <p className="mt-1 text-2xl font-bold text-purple-600 dark:text-purple-400">{countDispatched}</p>
          <p className="text-[11px] text-muted-foreground mt-1">In Transit</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground font-medium">Delivered to Buyer</p>
          <p className="mt-1 text-2xl font-bold text-primary">{countDelivered}</p>
          <p className="text-[11px] text-muted-foreground mt-1">Completed Handoffs</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lot code, crop category, or farmer name..."
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Lots' },
            { id: 'created', label: 'Created' },
            { id: 'accepted', label: 'Inspected' },
            { id: 'stored', label: 'Warehouse' },
            { id: 'dispatched', label: 'Dispatched' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatusTab(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                selectedStatusTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Produce Lots Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLots.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <Sprout size={36} className="mx-auto mb-2 opacity-50" />
            <p className="text-base font-semibold text-foreground">No produce lots found</p>
            <p className="text-xs mt-1">Register a new harvest batch or change search filters.</p>
          </div>
        ) : (
          filteredLots.map((lot) => {
            const currentStep = getTimelineStep(lot.status)
            return (
              <div
                key={lot.id}
                className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-secondary text-primary">
                        <Package size={18} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{lot.lotCode || `LOT-${lot.id}`}</p>
                        <p className="text-xs text-muted-foreground">{lot.category}</p>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${
                        lot.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : lot.status === 'dispatched'
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                          : lot.status === 'stored'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : lot.status === 'accepted'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {lot.status?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Quantity & Grade Info */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-xl bg-muted/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Quantity</p>
                      <p className="font-bold text-foreground mt-0.5">
                        {lot.quantity} {lot.unit || 'kg'}
                      </p>
                    </div>
                    <div className="rounded-xl bg-muted/50 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Quality Grade</p>
                      <p className="font-semibold text-primary mt-0.5 truncate">{lot.qualityGrade || 'Pending'}</p>
                    </div>
                  </div>

                  {/* Farmer & Location details */}
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    <p className="flex items-center gap-1.5">
                      <User size={13} className="text-primary" /> Farmer: <span className="font-medium text-foreground">{lot.farmerName}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Leaf size={13} className="text-primary" /> Parcel: <span className="font-medium text-foreground">{lot.farmName}</span>
                    </p>
                  </div>

                  {/* Visual Timeline Bar */}
                  <div className="mt-4 border-t border-border/60 pt-3">
                    <p className="text-[10px] font-semibold text-muted-foreground mb-2">Lifecycle Stage</p>
                    <div className="flex items-center justify-between text-[10px]">
                      {['Created', 'Inspected', 'Stored', 'Dispatched', 'Delivered'].map((stepName, i) => {
                        const stepNum = i + 1
                        const isDone = currentStep >= stepNum
                        return (
                          <div key={stepName} className="flex flex-col items-center gap-1">
                            <div
                              className={`size-5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                isDone ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {isDone ? <Check size={10} /> : stepNum}
                            </div>
                            <span className={isDone ? 'font-semibold text-primary' : 'text-muted-foreground'}>{stepName}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 border-t border-border pt-3 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      setActiveLot(lot)
                      setShowDetailModal(true)
                    }}
                    className="flex-1 rounded-xl bg-background border border-border py-2 text-xs font-semibold text-foreground hover:bg-muted transition text-center"
                  >
                    View Timeline
                  </button>

                  {/* Role Specific Quick Action */}
                  {(role === 'quality_inspector' || role === 'platform_admin') && lot.status === 'created' && (
                    <button
                      onClick={() => {
                        setActiveLot(lot)
                        setShowInspectModal(true)
                      }}
                      className="rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
                    >
                      Grade Lot
                    </button>
                  )}

                  {(role === 'collection_center_manager' || role === 'platform_admin') && (lot.status === 'accepted' || lot.status === 'created') && (
                    <button
                      onClick={() => {
                        setActiveLot(lot)
                        setShowWarehouseModal(true)
                      }}
                      className="rounded-xl bg-blue-600 text-white px-3 py-2 text-xs font-semibold hover:bg-blue-700 transition"
                    >
                      Store in Bin
                    </button>
                  )}

                  {(role === 'logistics_coordinator' || role === 'platform_admin') && (lot.status === 'stored' || lot.status === 'accepted') && (
                    <button
                      onClick={() => {
                        setActiveLot(lot)
                        setShowDispatchModal(true)
                      }}
                      className="rounded-xl bg-purple-600 text-white px-3 py-2 text-xs font-semibold hover:bg-purple-700 transition"
                    >
                      Dispatch Fleet
                    </button>
                  )}

                  {lot.status === 'dispatched' && (
                    <button
                      onClick={() => handleMarkDelivered(lot.id)}
                      className="rounded-xl bg-emerald-600 text-white px-3 py-2 text-xs font-semibold hover:bg-emerald-700 transition"
                    >
                      Confirm Delivery
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal 1: Register New Lot */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-lg">Register Harvest Produce Lot</h3>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-1 hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Crop Category</span>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  required
                  placeholder="e.g. Organic Grapes, Basmati Rice"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="font-medium text-foreground">Quantity</span>
                  <input
                    type="number"
                    value={newQuantity}
                    onChange={(e) => setNewQuantity(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="font-medium text-foreground">Unit</span>
                  <select
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  >
                    <option value="kg">Kilograms (kg)</option>
                    <option value="Tons">Metric Tons</option>
                    <option value="Quintals">Quintals</option>
                  </select>
                </label>
              </div>

              <label className="block space-y-1">
                <span className="font-medium text-foreground">Farmer Name</span>
                <input
                  type="text"
                  value={newFarmer}
                  onChange={(e) => setNewFarmer(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-medium text-foreground">Farm Land Parcel</span>
                <input
                  type="text"
                  value={newFarm}
                  onChange={(e) => setNewFarm(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Create Batch Lot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Quality Inspection */}
      {showInspectModal && activeLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg">Quality Inspection Workbench</h3>
                <p className="text-xs text-muted-foreground">{activeLot.lotCode} • {activeLot.category}</p>
              </div>
              <button onClick={() => setShowInspectModal(false)} className="rounded-lg p-1 hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleInspectSubmit} className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Quality Grade Classification</span>
                <select
                  value={inspectGrade}
                  onChange={(e) => setInspectGrade(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                >
                  <option value="Grade A (Export Quality)">Grade A (Export Quality)</option>
                  <option value="Grade A">Grade A (Standard)</option>
                  <option value="Grade B">Grade B (Commercial)</option>
                  <option value="Grade C">Grade C (Processing)</option>
                </select>
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="font-medium text-foreground">Moisture Content</span>
                  <input
                    type="text"
                    value={inspectMoisture}
                    onChange={(e) => setInspectMoisture(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="font-medium text-foreground">Purity Index</span>
                  <input
                    type="text"
                    value={inspectPurity}
                    onChange={(e) => setInspectPurity(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none"
                  />
                </label>
              </div>

              <label className="block space-y-1">
                <span className="font-medium text-foreground">Inspector Notes</span>
                <textarea
                  value={inspectNotes}
                  onChange={(e) => setInspectNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <div className="flex items-center gap-3 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={inspectAccepted}
                    onChange={(e) => setInspectAccepted(e.target.checked)}
                    className="size-4 accent-primary"
                  />
                  <span>Approve & Accept Lot</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowInspectModal(false)}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Save Inspection Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Warehouse Bin Placement */}
      {showWarehouseModal && activeLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg">Warehouse Storage Intake</h3>
                <p className="text-xs text-muted-foreground">{activeLot.lotCode} • {activeLot.quantity} {activeLot.unit}</p>
              </div>
              <button onClick={() => setShowWarehouseModal(false)} className="rounded-lg p-1 hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleWarehouseSubmit} className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Select Collection Warehouse</span>
                <select
                  value={warehouseLocation}
                  onChange={(e) => setWarehouseLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                >
                  <option value="Central Warehouse Hub #1">Central Warehouse Hub #1</option>
                  <option value="North Cold Storage Facility">North Cold Storage Facility</option>
                  <option value="West Agro Logistics Terminal">West Agro Logistics Terminal</option>
                </select>
              </label>

              <label className="block space-y-1">
                <span className="font-medium text-foreground">Assign Storage Bin</span>
                <input
                  type="text"
                  value={warehouseBin}
                  onChange={(e) => setWarehouseBin(e.target.value)}
                  required
                  placeholder="e.g. Bin A-12"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowWarehouseModal(false)}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 text-white px-5 py-2 text-xs font-semibold hover:bg-blue-700"
                >
                  Confirm Bin Storage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Dispatch Fleet Shipment */}
      {showDispatchModal && activeLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg">Dispatch Fleet Shipment</h3>
                <p className="text-xs text-muted-foreground">{activeLot.lotCode} • {activeLot.category}</p>
              </div>
              <button onClick={() => setShowDispatchModal(false)} className="rounded-lg p-1 hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleDispatchSubmit} className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Vehicle Number</span>
                <input
                  type="text"
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  required
                  placeholder="MH-12-AB-4081"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-medium text-foreground">Driver Name</span>
                <input
                  type="text"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  required
                  placeholder="Driver Full Name"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-medium text-foreground">Destination Delivery Point</span>
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  required
                  placeholder="Buyer Warehouse / Outlet"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 text-white px-5 py-2 text-xs font-semibold hover:bg-purple-700"
                >
                  Dispatch Truck Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Detailed Lot Timeline */}
      {showDetailModal && activeLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-secondary text-primary">
                  <QrCode size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{activeLot.lotCode || `LOT-${activeLot.id}`}</h3>
                  <p className="text-xs text-muted-foreground">{activeLot.category} • {activeLot.quantity} {activeLot.unit}</p>
                </div>
              </div>
              <button onClick={() => setShowDetailModal(null)} className="rounded-lg p-1.5 hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-muted/60">
                <p className="text-muted-foreground">Farmer Source</p>
                <p className="font-semibold text-foreground mt-0.5">{activeLot.farmerName}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/60">
                <p className="text-muted-foreground">Farm Parcel</p>
                <p className="font-semibold text-foreground mt-0.5">{activeLot.farmName}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/60">
                <p className="text-muted-foreground">Certified Grade</p>
                <p className="font-semibold text-primary mt-0.5">{activeLot.qualityGrade || 'Pending'}</p>
              </div>
              <div className="p-3 rounded-xl bg-muted/60">
                <p className="text-muted-foreground">Status</p>
                <p className="font-bold text-foreground capitalize mt-0.5">{activeLot.status}</p>
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-3">
              <p className="text-xs font-bold text-foreground">Complete Lifecycle History Logs</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
                  <span className="flex items-center gap-2 font-medium">
                    <Sprout size={14} className="text-primary" /> Batch Created
                  </span>
                  <span className="text-muted-foreground">{activeLot.createdAt || '2026-09-20'}</span>
                </div>
                {activeLot.qualityGrade && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-2 font-medium">
                      <ShieldCheck size={14} /> Quality Certified: {activeLot.qualityGrade}
                    </span>
                    <span className="text-xs">Moisture: {activeLot.moisture || '12%'}</span>
                  </div>
                )}
                {activeLot.warehouseBin && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300">
                    <span className="flex items-center gap-2 font-medium">
                      <Warehouse size={14} /> Warehouse Storage: {activeLot.warehouseBin}
                    </span>
                    <span className="text-xs">{activeLot.warehouseLocation || 'Central Hub'}</span>
                  </div>
                )}
                {activeLot.vehicle && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300">
                    <span className="flex items-center gap-2 font-medium">
                      <Truck size={14} /> Dispatched Vehicle: {activeLot.vehicle}
                    </span>
                    <span className="text-xs">{activeLot.driverName || 'In Transit'}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDetailModal(false)}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Close Traceability Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
