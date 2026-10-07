import { useEffect, useState } from 'react'
import {
  AreaChart,
  ArrowUpRight,
  Calculator,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Filter,
  Leaf,
  Plus,
  PlusCircle,
  Search,
  ShoppingBag,
  Sprout,
  Tag,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'

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

  // Modals
  const [showPOModal, setShowPOModal] = useState(false)
  const [showListingModal, setShowListingModal] = useState(false)
  const [showBidModal, setShowBidModal] = useState(false)
  const [showSettlementModal, setShowSettlementModal] = useState(false)
  const [activeListing, setActiveListing] = useState(null)
  const [purchaseQuantity, setPurchaseQuantity] = useState('100')
  const [deliveryAddress, setDeliveryAddress] = useState('Central APMC Buyer Hub, Mumbai')
  const [deliveryLatitude, setDeliveryLatitude] = useState('19.0760')
  const [deliveryLongitude, setDeliveryLongitude] = useState('72.8777')

  // PO Form
  const [poCrop, setPoCrop] = useState('')
  const [poQuantity, setPoQuantity] = useState('')
  const [poUnitPrice, setPoUnitPrice] = useState('')
  const [poBuyer, setPoBuyer] = useState('')

  // Listing Form
  const [listCrop, setListCrop] = useState('')
  const [listQuantity, setListQuantity] = useState('')
  const [listPrice, setListPrice] = useState('')
  const [listGrade, setListGrade] = useState('')

  // Calculator Form
  const [calcQty, setCalcQty] = useState('')
  const [calcPrice, setCalcPrice] = useState('')
  const [calcDeduction, setCalcDeduction] = useState('')
  const [calcBonus, setCalcBonus] = useState('')

  const [listings, setListings] = useState([])
  const [localPOs, setLocalPOs] = useState(purchaseOrders)

  useEffect(() => {
    setLocalPOs(purchaseOrders)
  }, [purchaseOrders])

  const handlePOSubmit = async (e) => {
    e.preventDefault()
    const qty = Number(poQuantity)
    const price = Number(poUnitPrice)
    const newPO = {
      id: String(Date.now()),
      reference: `PO-2026-${Math.floor(100 + Math.random() * 900)}`,
      buyerName: poBuyer,
      crop: poCrop,
      quantity: qty,
      unitPrice: price,
      totalBudget: qty * price * 1000,
      status: 'submitted',
      allocatedLots: [],
    }
    if (onCreatePO) {
      try {
        await onCreatePO(newPO)
      } catch (err) {
        console.error(err)
      }
    }
    setLocalPOs([newPO, ...localPOs])
    setShowPOModal(false)
  }

  const handleListingSubmit = (e) => {
    e.preventDefault()
    const newListingItem = {
      id: String(Date.now()),
      farmerName: 'You (Current Farmer)',
      crop: listCrop,
      quantity: `${listQuantity} kg`,
      grade: listGrade,
      price: `₹${listPrice} / kg`,
      location: 'Your Farm Location',
      verified: true,
    }
    setListings([newListingItem, ...listings])
    setShowListingModal(false)
  }

  const calcNetTotal = Math.max(0, Number(calcQty) * Number(calcPrice) - Number(calcDeduction) + Number(calcBonus))
  const rawSource = (availableBatches && availableBatches.length > 0)
    ? availableBatches
    : (lots || []).filter((batch) => batch.status === 'accepted' || batch.status === 'inspected')

  const marketListings = rawSource
    .filter((batch) => (batch.status === 'accepted' || batch.status === 'inspected') && Number(batch.availableQuantity ?? batch.quantity) > 0)
    .map((batch) => ({
      ...batch,
      id: batch.id || batch._id,
      crop: batch.category || batch.crop || 'Produce Lot',
      farmerName: batch.farmerName || batch.farmer?.name || 'Verified Farmer',
      quantity: `${batch.availableQuantity ?? batch.quantity} ${batch.unit || 'kg'}`,
      availableQuantity: Number(batch.availableQuantity ?? batch.quantity),
      grade: `${batch.qualityGrade || 'Grade A'}${batch.qualityRating ? ` (${batch.qualityRating}/5)` : ''}`,
      price: `₹${batch.marketPrice || 50} / ${batch.unit || 'kg'}`,
      location: batch.farmName || batch.farm?.farmName || 'Nashik Agriculture Belt, MH',
      verified: true,
    }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Agricultural Commodity Market & Trade</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live market pricing, verified farmer produce listings, purchase orders, and payout settlements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(role === 'farmer' || role === 'platform_admin') && (
            <button
              onClick={() => setShowListingModal(true)}
              className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-primary hover:text-primary-foreground transition"
            >
              <Tag size={17} /> List Produce for Sale
            </button>
          )}
          {(role === 'buyer' || role === 'platform_admin') && (
            <button
              onClick={() => setShowPOModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
            >
              <Plus size={18} /> Create Purchase Order
            </button>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        Market pricing will appear here when live commodity data is available.
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
          <ShoppingBag size={17} /> Crop Marketplace & Offers
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition ${
            activeTab === 'orders'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <FileText size={17} /> Buyer Purchase Orders
        </button>
        <button
          onClick={() => setActiveTab('settlements')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition ${
            activeTab === 'settlements'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Calculator size={17} /> Trade Settlements & Payouts
        </button>
      </div>

      {/* TAB 1: Marketplace */}
      {activeTab === 'marketplace' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl bg-card border border-border p-3">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search marketplace by crop or region..."
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs outline-none focus:border-primary"
              />
            </div>
            <span className="text-xs text-muted-foreground font-medium">{marketListings.length} verified listings available</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {marketListings.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">No inspected batches are available for purchase.</div>}
            {marketListings.map((item) => (
              <div key={item.id} className="rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-md transition space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-foreground">{item.crop}</h3>
                    <p className="text-xs text-muted-foreground">{item.farmerName}</p>
                  </div>
                  <span className="text-lg font-bold text-primary">{item.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-xl bg-muted/50 p-2.5">
                    <p className="text-[10px] text-muted-foreground">Available Quantity</p>
                    <p className="font-semibold text-foreground mt-0.5">{item.quantity}</p>
                  </div>
                  <div className="rounded-xl bg-muted/50 p-2.5">
                    <p className="text-[10px] text-muted-foreground">Quality Grade</p>
                    <p className="font-semibold text-primary mt-0.5">{item.grade}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-2">
                  <span>{item.location}</span>
                  {item.verified && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle size={13} /> GPS Verified
                    </span>
                  )}
                </div>

                <button
                  disabled={!item.verified || role !== 'buyer'}
                  onClick={() => {
                    setActiveListing(item)
                    setPurchaseQuantity(String(Math.min(100, item.availableQuantity || 100)))
                    setShowBidModal(true)
                  }}
                  className="w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {role === 'buyer' && item.verified ? 'Purchase inspected batch' : 'Purchase unavailable'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Buyer Purchase Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="font-bold text-base">Active Purchase Orders (POs)</h2>
              <span className="text-xs text-muted-foreground">{localPOs.length} total orders</span>
            </div>

            <div className="divide-y divide-border overflow-x-auto">
              {localPOs.map((po) => (
                <div key={po.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-muted/40 transition text-xs">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-xl bg-secondary text-primary">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">{po.reference}</p>
                      <p className="text-muted-foreground">{po.buyerName}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-6 text-left">
                    <div>
                      <p className="text-muted-foreground text-[10px]">Crop & Volume</p>
                      <p className="font-semibold text-foreground mt-0.5">{po.crop} ({po.quantity} Tons)</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">Agreed Price</p>
                      <p className="font-semibold text-primary mt-0.5">₹{po.unitPrice} / kg</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-[10px]">Total Contract</p>
                      <p className="font-bold text-foreground mt-0.5">₹{(po.totalBudget || 0).toLocaleString('en-IN')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-bold capitalize ${
                        po.status === 'fulfilled'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : po.status === 'approved'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {po.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Trade Settlements */}
      {activeTab === 'settlements' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          {/* Interactive Calculator */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Calculator size={20} className="text-primary" />
              <h2 className="font-bold text-lg">Trade Settlement Payout Calculator</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Accepted Weight (kg)</span>
                <input
                  type="number"
                  value={calcQty}
                  onChange={(e) => setCalcQty(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Agreed Price (₹/kg)</span>
                <input
                  type="number"
                  value={calcPrice}
                  onChange={(e) => setCalcPrice(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Quality Deductions (₹)</span>
                <input
                  type="number"
                  value={calcDeduction}
                  onChange={(e) => setCalcDeduction(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Grade Bonus (₹)</span>
                <input
                  type="number"
                  value={calcBonus}
                  onChange={(e) => setCalcBonus(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 outline-none focus:border-primary"
                />
              </label>
            </div>

            <div className="rounded-xl bg-secondary p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Estimated Net Farmer Payout</p>
                <p className="text-2xl font-bold text-primary">₹{calcNetTotal.toLocaleString('en-IN')}</p>
              </div>
              <button
                onClick={() => alert(`Settlement of ₹${calcNetTotal.toLocaleString('en-IN')} approved & queued for payout.`)}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
              >
                Execute Payout
              </button>
            </div>
          </div>

          {/* History */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
            <h2 className="font-bold text-lg border-b border-border pb-3">Recent Trade Settlement Records</h2>
            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">No settlement records available.</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Purchase Order */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-lg">Create Buyer Purchase Order</h3>
              <button onClick={() => setShowPOModal(false)} className="rounded-lg p-1 hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handlePOSubmit} className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Buyer / Company Name</span>
                <input
                  type="text"
                  value={poBuyer}
                  onChange={(e) => setPoBuyer(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <label className="block space-y-1">
                <span className="font-medium text-foreground">Required Crop</span>
                <input
                  type="text"
                  value={poCrop}
                  onChange={(e) => setPoCrop(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="font-medium text-foreground">Quantity (Metric Tons)</span>
                  <input
                    type="number"
                    value={poQuantity}
                    onChange={(e) => setPoQuantity(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="font-medium text-foreground">Offered Price (₹/kg)</span>
                  <input
                    type="number"
                    value={poUnitPrice}
                    onChange={(e) => setPoUnitPrice(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Issue Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: List Produce */}
      {showListingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-lg">List Farmer Produce for Sale</h3>
              <button onClick={() => setShowListingModal(false)} className="rounded-lg p-1 hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleListingSubmit} className="space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Crop Type</span>
                <input
                  type="text"
                  value={listCrop}
                  onChange={(e) => setListCrop(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1">
                  <span className="font-medium text-foreground">Available Quantity (kg)</span>
                  <input
                    type="number"
                    value={listQuantity}
                    onChange={(e) => setListQuantity(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="block space-y-1">
                  <span className="font-medium text-foreground">Asking Price (₹/kg)</span>
                  <input
                    type="number"
                    value={listPrice}
                    onChange={(e) => setListPrice(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                  />
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowListingModal(false)}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Publish Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Bid / Buy Lot */}
      {showBidModal && activeListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg">Submit Purchase Bid</h3>
                <p className="text-xs text-muted-foreground">{activeListing.crop} • {activeListing.price}</p>
              </div>
              <button onClick={() => setShowBidModal(false)} className="rounded-lg p-1 hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-secondary text-primary font-medium">
                Farmer: {activeListing.farmerName} • Location: {activeListing.location}
              </div>
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Quantity ({activeListing.unit || 'kg'})</span>
                <input
                  type="number"
                  min="1"
                  value={purchaseQuantity}
                  onChange={(event) => setPurchaseQuantity(event.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>
              <label className="block space-y-1">
                <span className="font-medium text-foreground">Delivery address</span>
                <input value={deliveryAddress} onChange={(event) => setDeliveryAddress(event.target.value)} required className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary" />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input type="number" step="any" placeholder="Latitude" value={deliveryLatitude} onChange={(event) => setDeliveryLatitude(event.target.value)} required className="rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary" />
                <input type="number" step="any" placeholder="Longitude" value={deliveryLongitude} onChange={(event) => setDeliveryLongitude(event.target.value)} required className="rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary" />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setShowBidModal(false)}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!onPurchaseBatch) return
                    await onPurchaseBatch(activeListing.id, { quantity: Number(purchaseQuantity), buyerLocation: { address: deliveryAddress, latitude: Number(deliveryLatitude), longitude: Number(deliveryLongitude) } })
                    setShowBidModal(false)
                  }}
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                >
                  Confirm & Submit Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
