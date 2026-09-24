import { useMemo, useState } from 'react'
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
  onCreatePO,
  onAllocatePO,
}) {
  const [activeTab, setActiveTab] = useState('marketplace')
  const [search, setSearch] = useState('')

  // Modals
  const [showPOModal, setShowPOModal] = useState(false)
  const [showListingModal, setShowListingModal] = useState(false)
  const [showBidModal, setShowBidModal] = useState(false)
  const [showSettlementModal, setShowSettlementModal] = useState(false)
  const [activeListing, setActiveListing] = useState(null)

  // PO Form
  const [poCrop, setPoCrop] = useState('Organic Grapes')
  const [poQuantity, setPoQuantity] = useState('10')
  const [poUnitPrice, setPoUnitPrice] = useState('85')
  const [poBuyer, setPoBuyer] = useState('Apex Agro Exports Pvt Ltd')

  // Listing Form
  const [listCrop, setListCrop] = useState('Alphonso Mangoes')
  const [listQuantity, setListQuantity] = useState('1500')
  const [listPrice, setListPrice] = useState('110')
  const [listGrade, setListGrade] = useState('Grade A Export')

  // Calculator Form
  const [calcQty, setCalcQty] = useState('1000')
  const [calcPrice, setCalcPrice] = useState('85')
  const [calcDeduction, setCalcDeduction] = useState('1500')
  const [calcBonus, setCalcBonus] = useState('2000')

  // Live Commodity Prices Data
  const commodities = [
    { name: 'Organic Grapes', price: '₹86.00', unit: 'per kg', change: '+12.6%', trend: 'up', volume: '140 Tons' },
    { name: 'Khapli Wheat', price: '₹28.50', unit: 'per kg', change: '+4.2%', trend: 'up', volume: '320 Tons' },
    { name: 'Cotton Bales', price: '₹62.00', unit: 'per kg', change: '-1.5%', trend: 'down', volume: '95 Tons' },
    { name: 'Basmati Rice', price: '₹44.00', unit: 'per kg', change: '+2.8%', trend: 'up', volume: '510 Tons' },
    { name: 'Alphonso Mango', price: '₹110.00', unit: 'per kg', change: '+18.4%', trend: 'up', volume: '60 Tons' },
    { name: 'Sugarcane', price: '₹3,150', unit: 'per ton', change: '+0.8%', trend: 'up', volume: '1,200 Tons' },
  ]

  // Default Market Listings
  const [listings, setListings] = useState([
    {
      id: 'm1',
      farmerName: 'Ramesh Patel',
      crop: 'Organic Grapes',
      quantity: '1,200 kg',
      grade: 'Grade A (Export)',
      price: '₹85 / kg',
      location: 'Nashik Agro Hub',
      verified: true,
    },
    {
      id: 'm2',
      farmerName: 'Anita Deshmukh',
      crop: 'Khapli Wheat',
      quantity: '3,500 kg',
      grade: 'Grade A Premium',
      price: '₹28 / kg',
      location: 'Pune Regional Center',
      verified: true,
    },
    {
      id: 'm3',
      farmerName: 'Suresh Patil',
      crop: 'Cotton Bales',
      quantity: '2,000 kg',
      grade: 'Grade B Commercial',
      price: '₹60 / kg',
      location: 'Nagpur Collection Hub',
      verified: false,
    },
  ])

  // Default POs
  const defaultPOList = useMemo(() => {
    if (purchaseOrders && purchaseOrders.length > 0) return purchaseOrders
    return [
      {
        id: 'po1',
        reference: 'PO-2026-101',
        buyerName: 'Apex Fresh Supermarkets',
        crop: 'Organic Grapes',
        quantity: 10,
        unitPrice: 86,
        totalBudget: 860000,
        status: 'approved',
        allocatedLots: ['LOT-2026-001'],
      },
      {
        id: 'po2',
        reference: 'PO-2026-102',
        buyerName: 'Global Organic Trade Co',
        crop: 'Alphonso Mangoes',
        quantity: 5,
        unitPrice: 110,
        totalBudget: 550000,
        status: 'submitted',
        allocatedLots: [],
      },
      {
        id: 'po3',
        reference: 'PO-2026-103',
        buyerName: 'Reliance Fresh Logistics',
        crop: 'Khapli Wheat',
        quantity: 25,
        unitPrice: 28,
        totalBudget: 700000,
        status: 'fulfilled',
        allocatedLots: ['LOT-2026-003'],
      },
    ]
  }, [purchaseOrders])

  const [localPOs, setLocalPOs] = useState(defaultPOList)

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

      {/* Live Commodity Price Ticker */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {commodities.map((item) => (
          <div key={item.name} className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground truncate">{item.name}</span>
              <span
                className={`flex items-center gap-0.5 text-[11px] font-bold ${
                  item.trend === 'up' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {item.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {item.change}
              </span>
            </div>
            <p className="mt-2 text-xl font-bold tracking-tight text-foreground">{item.price}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{item.unit} • Vol: {item.volume}</p>
          </div>
        ))}
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
            <span className="text-xs text-muted-foreground font-medium">{listings.length} verified listings available</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => (
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
                  onClick={() => {
                    setActiveListing(item)
                    setShowBidModal(true)
                  }}
                  className="w-full rounded-xl bg-primary py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-90 transition"
                >
                  Place Purchase Bid / Buy Lot
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
              {[
                { farmer: 'Ramesh Patel', crop: 'Grapes (1.2 Tons)', net: '₹1,01,500', status: 'Settled', date: '2026-09-22' },
                { farmer: 'Anita Deshmukh', crop: 'Khapli Wheat (3.5 Tons)', net: '₹98,000', status: 'Settled', date: '2026-09-21' },
                { farmer: 'Vikram Singh', crop: 'Basmati Rice (5 Tons)', net: '₹2,10,000', status: 'Pending Approval', date: '2026-09-23' },
              ].map((s, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-foreground">{s.farmer}</p>
                    <p className="text-muted-foreground">{s.crop} • {s.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">{s.net}</p>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{s.status}</span>
                  </div>
                </div>
              ))}
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
                <span className="font-medium text-foreground">Bid Price Offer (₹/kg)</span>
                <input
                  type="number"
                  defaultValue="85"
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
                />
              </label>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setShowBidModal(false)}
                  className="rounded-xl border border-border bg-background px-4 py-2 text-xs font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert(`Purchase Bid for ${activeListing.crop} submitted successfully!`)
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
