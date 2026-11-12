import React, { useMemo, useState } from 'react'
import {
  Calendar,
  CheckCircle,
  Clock,
  Compass,
  FileCheck,
  Filter,
  Globe,
  Info,
  Layers,
  MapPin,
  Package,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Tractor,
  Trash2,
  X,
} from 'lucide-react'
import { FarmMap } from '../components/FarmMap'

function MyFarmsPage({
  role,
  farms,
  selectedFarm,
  setSelectedFarm,
  setShowForm,
  onDeleteFarm,
  onRequestInspection,
  points,
  setPoints,
  finished,
  setFinished,
  farmArea,
  setFarmArea,
  farmName,
  setFarmName,
  crop,
  setCrop,
  addFarm,
  farmError,
}) {
  const [search, setSearch] = useState('')
  const [selectedCropFilter, setSelectedCropFilter] = useState('All')
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All')
  const [inspectModalFarm, setInspectModalFarm] = useState(null)
  const [requestInspectionFarm, setRequestInspectionFarm] = useState(null)
  const [reqCrop, setReqCrop] = useState('')
  const [reqQty, setReqQty] = useState('')
  const [reqHealth, setReqHealth] = useState('Healthy')
  const [reqLoading, setReqLoading] = useState(false)
  const [reqSuccess, setReqSuccess] = useState('')

  // Extract unique crop types
  const cropList = useMemo(() => {
    const crops = new Set(['All'])
    farms.forEach((f) => {
      if (f.crop) crops.add(f.crop)
    })
    return Array.from(crops)
  }, [farms])

  // Filter farms
  const filteredFarms = useMemo(() => {
    return farms.filter((f) => {
      const matchesSearch =
        (f.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (f.location || '').toLowerCase().includes(search.toLowerCase()) ||
        (f.crop || '').toLowerCase().includes(search.toLowerCase())
      const matchesCrop = selectedCropFilter === 'All' || f.crop === selectedCropFilter
      const matchesStatus =
        selectedStatusFilter === 'All' ||
        (selectedStatusFilter === 'Inspected' && f.inspectionStatus === 'inspected') ||
        (selectedStatusFilter === 'Pending' && f.inspectionStatus === 'pending') ||
        f.status === selectedStatusFilter
      return matchesSearch && matchesCrop && matchesStatus
    })
  }, [farms, search, selectedCropFilter, selectedStatusFilter])

  const handleOpenRequestModal = (farm) => {
    setRequestInspectionFarm(farm)
    setReqCrop(farm.crop || '')
    setReqQty(farm.expectedQuantity ? String(farm.expectedQuantity) : '')
    setReqHealth(farm.cropHealth || 'Healthy')
    setReqSuccess('')
  }

  const handleSubmitInspectionRequest = async (e) => {
    e.preventDefault()
    if (!requestInspectionFarm || !onRequestInspection) return
    setReqLoading(true)
    try {
      await onRequestInspection(requestInspectionFarm.id, {
        crop: reqCrop,
        quantity: Number(reqQty),
        cropHealth: reqHealth,
      })
      setReqSuccess('Quality inspection request submitted successfully! Inspector will review your land boundary and harvest batch.')
      setTimeout(() => {
        setRequestInspectionFarm(null)
        setReqSuccess('')
      }, 1800)
    } catch (err) {
      console.error(err)
    } finally {
      setReqLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Registered Farms & Land</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Mark GPS boundaries, manage crops, and submit requests for certified Quality Inspection.
          </p>
          {farmError && <p className="mt-2 text-sm font-medium text-destructive">{farmError}</p>}
        </div>
        <div className="flex items-center gap-3">
          {['farmer', 'admin', 'platform_admin'].includes(role) && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <Plus size={18} /> Register New Farm
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search farms by name, location, or crop..."
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Filter size={14} /> Crop:
          </span>
          {cropList.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCropFilter(c)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedCropFilter === c
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              {c}
            </button>
          ))}
          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />
          {['All', 'Pending', 'Inspected'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatusFilter(status)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                selectedStatusFilter === status
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Map + Farm List Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Left Interactive Map */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm flex flex-col min-h-[480px]">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              <h2 className="font-semibold text-sm md:text-base">
                {selectedFarm ? `Selected Boundary: ${selectedFarm.name}` : 'Select a Farm Boundary'}
              </h2>
            </div>
            {selectedFarm && (
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
                {(selectedFarm.area || 0).toFixed(2)} acres
              </span>
            )}
          </div>
          <div className="relative flex-1 min-h-[420px]">
            <FarmMap
              points={selectedFarm?.points || []}
              farmName={selectedFarm?.name}
              onAdd={() => undefined}
              onUndo={() => undefined}
              onClear={() => undefined}
              onFinish={() => undefined}
              onEdit={() => undefined}
              finished={false}
            />
          </div>
        </section>

        {/* Right Farm List */}
        <section className="rounded-2xl border border-border bg-card shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-border p-4">
            <div>
              <h2 className="font-semibold text-sm md:text-base">Farm Directory</h2>
              <p className="text-xs text-muted-foreground">{filteredFarms.length} farm(s) listed</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-secondary px-2.5 py-1 rounded-full">
              GPS Verified
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-border">
            {filteredFarms.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MapPin size={32} className="mx-auto mb-2 opacity-50 text-primary" />
                <p className="text-sm font-semibold">No farms found</p>
                <p className="text-xs mt-1">Add a new farm boundary using the polygon drawing tool.</p>
              </div>
            ) : (
              filteredFarms.map((farm) => {
                const isSelected = selectedFarm?.id === farm.id
                return (
                  <div
                    key={farm.id}
                    onClick={() => setSelectedFarm(farm)}
                    className={`p-4 transition cursor-pointer hover:bg-muted/60 ${
                      isSelected ? 'bg-secondary/70 border-l-4 border-l-primary' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary font-bold">
                          <MapPin size={18} />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-foreground">{farm.name}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin size={12} /> {farm.location}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{(farm.area || 0).toFixed(2)} ac</p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                            farm.inspectionStatus === 'inspected'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : farm.inspectionStatus === 'pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {farm.inspectionStatus === 'inspected'
                            ? 'Inspected'
                            : farm.inspectionStatus === 'pending'
                            ? 'Inspection Pending'
                            : 'Uninspected'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Package size={13} className="text-primary" /> Crop: {farm.crop}
                      </span>
                      <div className="flex items-center gap-2">
                        {role === 'farmer' && farm.inspectionStatus !== 'inspected' && farm.inspectionStatus !== 'pending' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenRequestModal(farm)
                            }}
                            className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
                          >
                            <FileCheck size={12} /> Request Inspection
                          </button>
                        )}
                        {farm.inspectionStatus === 'pending' && (
                          <span className="flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                            <Clock size={12} /> Pending Review
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setInspectModalFarm(farm)
                          }}
                          className="rounded-lg bg-background border border-border px-2.5 py-1 font-semibold text-foreground hover:bg-muted transition"
                        >
                          Details
                        </button>
                        {onDeleteFarm && role === 'farmer' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDeleteFarm(farm.id)
                            }}
                            className="rounded-lg p-1 text-destructive hover:bg-destructive/10 transition"
                            title="Delete farm"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </div>

      {/* Request Inspection Modal */}
      {requestInspectionFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="text-primary" size={20} />
                <h3 className="font-bold text-base">Request Quality Inspection</h3>
              </div>
              <button onClick={() => setRequestInspectionFarm(null)} className="rounded-lg p-1 hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Submit your registered farm <strong>{requestInspectionFarm.name}</strong> ({(requestInspectionFarm.area || 0).toFixed(2)} acres) for on-site quality evaluation.
            </p>

            <form onSubmit={handleSubmitInspectionRequest} className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Crop Harvest Variety</span>
                <input
                  type="text"
                  value={reqCrop}
                  onChange={(e) => setReqCrop(e.target.value)}
                  required
                  placeholder="e.g. Alphonso Mangoes, Soybean"
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:border-primary"
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1">
                  <span className="font-medium text-foreground">Expected Quantity (kg)</span>
                  <input
                    type="number"
                    value={reqQty}
                    onChange={(e) => setReqQty(e.target.value)}
                    required
                    min="1"
                    className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:border-primary"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="font-medium text-foreground">Crop Health Condition</span>
                  <select
                    value={reqHealth}
                    onChange={(e) => setReqHealth(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:border-primary"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Good">Good</option>
                    <option value="Moderate">Moderate</option>
                  </select>
                </label>
              </div>

              {reqSuccess && <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{reqSuccess}</p>}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setRequestInspectionFarm(null)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reqLoading}
                  className="rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {reqLoading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Farm Detail Inspection Modal */}
      {inspectModalFarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-secondary text-primary">
                  <Tractor size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{inspectModalFarm.name}</h3>
                  <p className="text-xs text-muted-foreground">{inspectModalFarm.location}</p>
                </div>
              </div>
              <button onClick={() => setInspectModalFarm(null)} className="rounded-lg p-1.5 hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Primary Crop</p>
                <p className="font-semibold text-foreground mt-1">{inspectModalFarm.crop}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Farm Area</p>
                <p className="font-semibold text-primary mt-1">
                  {(inspectModalFarm.area || 0).toFixed(2)} Acres ({((inspectModalFarm.area || 0) * 0.404686).toFixed(2)} Ha)
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Inspection Status</p>
                <p className="font-semibold mt-1">
                  {inspectModalFarm.inspectionStatus === 'inspected' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle size={14} /> Certified Inspected
                    </span>
                  ) : inspectModalFarm.inspectionStatus === 'pending' ? (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock size={14} /> Pending Quality Check
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Not Yet Requested</span>
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Boundary Points</p>
                <p className="font-semibold text-foreground mt-1">
                  {inspectModalFarm.points?.length || 4} GPS Polygon Vertices
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-border p-4 text-xs leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Agronomy & Land Record</p>
              Expected yield: ~{inspectModalFarm.expectedQuantity || 0} kg.
              GPS boundary vertices verified via map plotting API.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {role === 'farmer' && inspectModalFarm.inspectionStatus !== 'inspected' && inspectModalFarm.inspectionStatus !== 'pending' && (
                <button
                  onClick={() => {
                    const f = inspectModalFarm
                    setInspectModalFarm(null)
                    handleOpenRequestModal(f)
                  }}
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Request Quality Inspection
                </button>
              )}
              <button
                onClick={() => setInspectModalFarm(null)}
                className="rounded-xl border border-border px-5 py-2 text-xs font-semibold hover:bg-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { MyFarmsPage }
export default MyFarmsPage

