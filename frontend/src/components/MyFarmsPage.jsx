import { useMemo, useState } from 'react'
import {
  CheckCircle,
  Compass,
  FileCheck,
  Filter,
  Globe,
  Info,
  Layers,
  Leaf,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  Sprout,
  Tractor,
  Trash2,
  X,
} from 'lucide-react'
import { FarmMap } from './FarmMap'

export function MyFarmsPage({
  role,
  farms,
  selectedFarm,
  setSelectedFarm,
  setShowForm,
  onDeleteFarm,
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
  const [irrigation, setIrrigation] = useState('Drip Irrigation')
  const [soilType, setSoilType] = useState('Black Cotton Soil')

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
        f.name.toLowerCase().includes(search.toLowerCase()) ||
        f.location.toLowerCase().includes(search.toLowerCase()) ||
        f.crop.toLowerCase().includes(search.toLowerCase())
      const matchesCrop = selectedCropFilter === 'All' || f.crop === selectedCropFilter
      const matchesStatus = selectedStatusFilter === 'All' || f.status === selectedStatusFilter
      return matchesSearch && matchesCrop && matchesStatus
    })
  }, [farms, search, selectedCropFilter, selectedStatusFilter])

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Registered Land Parcels & Farms</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage boundary coordinates, crop varieties, soil types, and verification certificates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus size={18} /> Add New Farm Boundary
          </button>
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
          {['All', 'Verified', 'Saved'].map((status) => (
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
                {selectedFarm.area?.toFixed(2)} acres
              </span>
            )}
          </div>
          <div className="relative flex-1 min-h-[420px]">
            <FarmMap
              points={selectedFarm?.points || []}
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
              <p className="text-xs text-muted-foreground">{filteredFarms.length} land parcels listed</p>
            </div>
            <span className="text-xs font-semibold text-primary bg-secondary px-2.5 py-1 rounded-full">
              GPS Verified
            </span>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[500px] divide-y divide-border">
            {filteredFarms.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Leaf size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold">No farms found</p>
                <p className="text-xs mt-1">Try adjusting your filter search terms or add a new farm boundary.</p>
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
                          <Leaf size={18} />
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
                            farm.status === 'Verified'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {farm.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Sprout size={13} className="text-primary" /> Crop: {farm.crop}
                      </span>
                      <div className="flex items-center gap-2">
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
                <p className="text-xs text-muted-foreground">Parcel Size</p>
                <p className="font-semibold text-primary mt-1">
                  {inspectModalFarm.area?.toFixed(2)} Acres ({((inspectModalFarm.area || 0) * 0.404686).toFixed(2)} Ha)
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-3">
                <p className="text-xs text-muted-foreground">Verification Certificate</p>
                <p className="font-semibold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <CheckCircle size={14} /> Verified GPS Boundary
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
              <p className="font-medium text-foreground mb-1">Regional Agronomy Metadata</p>
              Soil classification: Black Cotton / Alluvial Loam. Primary irrigation source: Automated Drip Lines.
              Satellite survey verification timestamped for current season.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setInspectModalFarm(null)}
                className="rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
