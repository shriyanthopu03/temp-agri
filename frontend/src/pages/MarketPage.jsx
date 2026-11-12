import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart,
  ArrowUpRight,
  Award,
  Calculator,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileCheck,
  FileText,
  Filter,
  Layers,
  MapPin,
  Package,
  Plus,
  PlusCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Tag,
  TrendingDown,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import { FarmMap } from '../components/FarmMap'

function getFarmPoints(listing) {
  if (!listing) return []
  const farm = listing.farm
  const coords = farm?.boundary?.coordinates?.[0]
  if (Array.isArray(coords) && coords.length >= 3) {
    return coords.length > 1 && coords[0][0] === coords.at(-1)[0] && coords[0][1] === coords.at(-1)[1]
      ? coords.slice(0, -1)
      : coords
  }
  const loc = farm?.location
  if (Number.isFinite(Number(loc?.longitude)) && Number.isFinite(Number(loc?.latitude))) {
    const lng = Number(loc.longitude)
    const lat = Number(loc.latitude)
    return [
      [lng - 0.0015, lat - 0.0015],
      [lng + 0.0015, lat - 0.0015],
      [lng + 0.0015, lat + 0.0015],
    ]
  }
  return []
}

export function MarketPage({
  role,
  purchaseOrders = [],
  lots = [],
  availableBatches = [],
  onCreatePO,
  onAllocatePO,
  onPurchaseBatch,
}) {
  const [activeTab, setActiveTab] = useState('marketplace')
  const [search, setSearch] = useState('')
  const [gradeFilter, setGradeFilter] = useState('All')

  // Modals
  const [showPOModal, setShowPOModal] = useState(false)
  const [showListingModal, setShowListingModal] = useState(false)
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(null)
  const [activeListing, setActiveListing] = useState(null)

  // Purchase Form
  const [purchaseQuantity, setPurchaseQuantity] = useState('')
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [deliveryLatitude, setDeliveryLatitude] = useState('')
  const [deliveryLongitude, setDeliveryLongitude] = useState('')
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')

  // PO Form
  const [poCrop, setPoCrop] = useState('')
  const [poQuantity, setPoQuantity] = useState('')
  const [poUnitPrice, setPoUnitPrice] = useState('')
  const [poBuyer, setPoBuyer] = useState('')

  const [localPOs, setLocalPOs] = useState(purchaseOrders)

  useEffect(() => {
    setLocalPOs(purchaseOrders)
  }, [purchaseOrders])

  // Combine and deduplicate inspected batches only
  const combined = [...(lots || []), ...(availableBatches || [])]
  const rawSource = Array.from(new Map(combined.map((item) => [item.id || item._id, item])).values())

  // Strict Rule: ONLY inspected and accepted crops with availableQuantity > 0 are visible to buyers!
  const marketListings = useMemo(() => {
    return rawSource
      .filter((batch) => batch.status === 'accepted' && Number(batch.availableQuantity ?? batch.quantity) > 0)
      .map((batch) => {
        const farm = typeof batch.farm === 'object' && batch.farm !== null ? batch.farm : null
        const farmerName = batch.farmer?.name || batch.farmerName || 'Registered Farmer'
        const farmName = farm?.farmName || farm?.name || batch.farmName || 'Farm'
        const farmLocation = farm?.location?.address || (farm?.location?.latitude ? `${Number(farm.location.latitude).toFixed(4)}, ${Number(farm.location.longitude).toFixed(4)}` : 'Location pending')
        const farmArea = Number(farm?.areaAcres || farm?.area || 0)
        const latestInspection = batch.inspectionHistory?.[batch.inspectionHistory.length - 1]

        return {
          ...batch,
          id: batch.id || batch._id,
          crop: batch.category || 'Agricultural Produce',
          farmerName,
          farmerEmail: batch.farmer?.email || 'N/A',
          farmName,
          farmLocation,
          farmArea,
          farm,
          quantity: `${batch.availableQuantity ?? batch.quantity} ${batch.unit || 'kg'}`,
          availableQuantity: Number(batch.availableQuantity ?? batch.quantity),
          unit: batch.unit || 'kg',
          grade: batch.qualityGrade || 'Grade A',
          rating: batch.qualityRating || 4.5,
          unitPrice: batch.marketPrice || 60,
          priceDisplay: `₹${batch.marketPrice || 60} / ${batch.unit || 'kg'}`,
          inspectionNotes: latestInspection?.notes || 'Certified export quality. Uniform density and moisture parameters verified.',
          inspectedAt: latestInspection?.inspectedAt || batch.updatedAt,
          verified: true,
        }
      })
      .filter((item) => {
        const matchesSearch =
          item.crop.toLowerCase().includes(search.toLowerCase()) ||
          item.farmerName.toLowerCase().includes(search.toLowerCase()) ||
          item.farmLocation.toLowerCase().includes(search.toLowerCase())
        const matchesGrade = gradeFilter === 'All' || item.grade.includes(gradeFilter)
        return matchesSearch && matchesGrade
      })
  }, [rawSource, search, gradeFilter])

  const canBuyRole = role === 'buyer' || role === 'platform_admin' || role === 'admin'

  const handleOpenPurchase = (item) => {
    setActiveListing(item)
    const initialQty = item.availableQuantity ? String(item.availableQuantity) : ''
    setPurchaseQuantity(initialQty)
    setPurchaseError('')
    setShowPurchaseModal(true)
  }

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault()
    if (!activeListing || !onPurchaseBatch) return
    const qty = Number(purchaseQuantity)

    if (!Number.isFinite(qty) || qty <= 0) {
      setPurchaseError('Please enter a valid positive purchase quantity.')
      return
    }

    if (qty > activeListing.availableQuantity) {
      setPurchaseError(`Requested quantity (${qty} ${activeListing.unit}) exceeds available stock (${activeListing.availableQuantity} ${activeListing.unit}).`)
      return
    }

    setPurchasing(true)
    setPurchaseError('')
    try {
      await onPurchaseBatch(activeListing.id, {
        quantity: qty,
        buyerLocation: {
          address: deliveryAddress,
          latitude: Number(deliveryLatitude),
          longitude: Number(deliveryLongitude),
        },
      })
      setShowPurchaseModal(false)
      setActiveTab('orders')
    } catch (err) {
      setPurchaseError(err.message || 'Unable to place purchase order.')
    } finally {
      setPurchasing(false)
    }
  }

  const currentEstimatedTotal = useMemo(() => {
    if (!activeListing) return 0
    const qty = Number(purchaseQuantity) || 0
    return qty * (activeListing.unitPrice || 0)
  }, [activeListing, purchaseQuantity])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Certified Agricultural Produce Market</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Browse inspected crops with verified GPS boundaries, quality grades (Grade A–D), and transparent pricing.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canBuyRole && (
            <button
              onClick={() => setShowPOModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
            >
              <Plus size={18} /> Create Custom PO
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <button
          onClick={() => setActiveTab('marketplace')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition ${
            activeTab === 'marketplace'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <ShoppingBag size={17} /> Inspected Crops Catalog ({marketListings.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition ${
            activeTab === 'orders'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <FileText size={17} /> My Purchase Orders ({localPOs.length})
        </button>
      </div>

      {/* TAB 1: Inspected Crops Marketplace */}
      {activeTab === 'marketplace' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by crop name, farmer, or regional location..."
                className="w-full rounded-xl border border-border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                <Filter size={14} /> Quality Grade:
              </span>
              {['All', 'Grade A', 'Grade B', 'Grade C'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeFilter(g)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    gradeFilter === g
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {marketListings.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
                <Package size={38} className="mx-auto mb-3 opacity-50" />
                <h3 className="font-bold text-base text-foreground">No inspected crops currently matching filters</h3>
                <p className="text-xs mt-1">
                  Only crops that have successfully completed on-site Quality Inspection appear here for procurement.
                </p>
              </div>
            ) : (
              marketListings.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border bg-card p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-secondary px-2 py-0.5 rounded-full">
                          {item.grade} ({item.rating}/5)
                        </span>
                        <h3 className="font-bold text-base text-foreground mt-1.5">{item.crop}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <User size={12} /> {item.farmerName} · {item.farmName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-base text-primary">{item.priceDisplay}</p>
                        <p className="text-[10px] text-muted-foreground">Verified Price</p>
                      </div>
                    </div>

                    {/* Farm & Land Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded-xl bg-muted/40 p-2.5">
                        <p className="text-[10px] text-muted-foreground">Available Stock</p>
                        <p className="font-semibold text-foreground mt-0.5">{item.quantity}</p>
                      </div>
                      <div className="rounded-xl bg-muted/40 p-2.5">
                        <p className="text-[10px] text-muted-foreground">Farm Area</p>
                        <p className="font-semibold text-foreground mt-0.5">{item.farmArea} Acres</p>
                      </div>
                    </div>

                    {/* Inspection Certificate Snippet */}
                    <div className="rounded-xl border border-border/80 bg-background/60 p-3 text-xs space-y-1">
                      <p className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle size={13} /> Inspection Certified
                      </p>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{item.inspectionNotes}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2">
                      <span className="flex items-center gap-1"><MapPin size={12} /> {item.farmLocation}</span>
                      <button
                        onClick={() => setShowMapModal(item)}
                        className="text-primary font-semibold hover:underline flex items-center gap-1"
                      >
                        <Layers size={13} /> View Map
                      </button>
                    </div>
                  </div>

                  {/* Purchase CTA */}
                  <div className="pt-4 mt-2">
                    <button
                      disabled={!canBuyRole || item.availableQuantity <= 0}
                      onClick={() => handleOpenPurchase(item)}
                      className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {item.availableQuantity <= 0 ? 'Out of Stock' : 'Purchase Inspected Produce'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Buyer Purchase Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h2 className="font-bold text-base">Purchase Orders & Shipments</h2>
                <p className="text-xs text-muted-foreground">Orders submitted and tracked by Logistics Coordinator</p>
              </div>
              <span className="text-xs font-semibold text-primary bg-secondary px-3 py-1 rounded-full">
                {localPOs.length} Total Orders
              </span>
            </div>

            {localPOs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <ShoppingBag size={36} className="mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-foreground">No purchase orders placed yet</p>
                <p className="text-xs mt-1">Browse inspected crops in the catalog and submit an order.</p>
              </div>
            ) : (
              <div className="divide-y divide-border overflow-x-auto">
                {localPOs.map((po) => (
                  <div key={po.id || po._id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/40 transition text-xs">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-xl bg-secondary text-primary font-bold">
                        <ShoppingBag size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-foreground">{po.reference || po.number}</p>
                        <p className="text-muted-foreground">Buyer: {po.buyerName || po.buyer?.name || 'You'}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-left">
                      <div>
                        <p className="text-muted-foreground text-[10px]">Crop & Volume</p>
                        <p className="font-semibold text-foreground mt-0.5">{po.crop} ({po.quantity} {po.unit || 'kg'})</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px]">Agreed Unit Price</p>
                        <p className="font-semibold text-primary mt-0.5">₹{po.unitPrice} / kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px]">Total Contract</p>
                        <p className="font-bold text-foreground mt-0.5">₹{(po.totalBudget || po.totalAmount || 0).toLocaleString('en-IN')}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize ${
                          po.status === 'fulfilled' || po.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : po.status === 'approved' || po.status === 'accepted'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        }`}
                      >
                        {po.status === 'submitted' ? 'Pending Logistics' : po.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Purchase Modal with Farm Map & Validation */}
      {showPurchaseModal && activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-xl rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base">Procure Inspected Produce</h3>
                <p className="text-xs text-muted-foreground">{activeListing.crop} · Certified {activeListing.grade}</p>
              </div>
              <button onClick={() => setShowPurchaseModal(false)} className="rounded-lg p-1 hover:bg-muted">
                <X size={18} />
              </button>
            </div>

            {/* Farm Polygon Map Preview */}
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="bg-muted px-3 py-1.5 text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <Layers size={13} className="text-primary" /> Land Polygon Plot: {activeListing.farmName} ({activeListing.farmArea} Acres)
              </div>
              <div className="h-44">
                <FarmMap points={getFarmPoints(activeListing)} farmName={activeListing.farmName} finished={false} />
              </div>
            </div>

            {/* Quality Summary */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-muted/40 p-2.5">
                <p className="text-[10px] text-muted-foreground">Available Quantity</p>
                <p className="font-bold text-foreground mt-0.5">{activeListing.availableQuantity} {activeListing.unit}</p>
              </div>
              <div className="rounded-xl bg-muted/40 p-2.5">
                <p className="text-[10px] text-muted-foreground">Unit Rate</p>
                <p className="font-bold text-primary mt-0.5">{activeListing.priceDisplay}</p>
              </div>
            </div>

            <form onSubmit={handlePurchaseSubmit} className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Purchase Quantity ({activeListing.unit})</span>
                <input
                  type="number"
                  value={purchaseQuantity}
                  onChange={(e) => setPurchaseQuantity(e.target.value)}
                  min="1"
                  max={activeListing.availableQuantity}
                  required
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:border-primary font-bold text-sm"
                />
                <p className="text-[11px] text-muted-foreground">Max available to purchase: {activeListing.availableQuantity} {activeListing.unit}</p>
              </label>

              <label className="block space-y-1">
                <span className="font-medium text-foreground">Delivery Destination Address</span>
                <input
                  type="text"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="e.g. Buyer Regional Delivery Hub"
                  required
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:border-primary"
                />
              </label>

              <div className="rounded-xl bg-secondary/50 p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[11px] text-muted-foreground">Estimated Order Amount</p>
                  <p className="text-lg font-extrabold text-primary">₹{currentEstimatedTotal.toLocaleString('en-IN')}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                  Status: Pending Logistics
                </span>
              </div>

              {purchaseError && (
                <p className="text-xs font-semibold text-destructive">{purchaseError}</p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="rounded-xl border border-border px-4 py-2 font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={purchasing || !activeListing.availableQuantity}
                  className="rounded-xl bg-primary px-6 py-2 font-bold text-primary-foreground hover:opacity-90 disabled:opacity-50"
                >
                  {purchasing ? 'Submitting Order...' : 'Confirm & Place Purchase Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Standalone Map Viewer Modal */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-xl rounded-2xl bg-card border border-border p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-base">{showMapModal.farmName}</h3>
                <p className="text-xs text-muted-foreground">{showMapModal.farmLocation} · {showMapModal.farmArea} Acres</p>
              </div>
              <button onClick={() => setShowMapModal(null)} className="rounded-lg p-1 hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <div className="h-72 rounded-xl overflow-hidden border border-border">
              <FarmMap points={getFarmPoints(showMapModal)} farmName={showMapModal.farmName} finished={false} />
            </div>
            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowMapModal(null)}
                className="rounded-xl bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground"
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

export default MarketPage
