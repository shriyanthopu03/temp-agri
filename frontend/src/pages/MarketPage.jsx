import React, { useEffect, useMemo, useState } from 'react'
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

function MarketPage({
  role,
  purchaseOrders = [],
  lots = [],
  availableBatches = [],
  farms = [],
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

  // Custom PO Form State
  const [poFarmerName, setPoFarmerName] = useState('')
  const [poFarmerEmail, setPoFarmerEmail] = useState('')
  const [poFarmName, setPoFarmName] = useState('')
  const [poSelectedFarmId, setPoSelectedFarmId] = useState('')
  const [poPickupAddress, setPoPickupAddress] = useState('')
  const [poPickupLat, setPoPickupLat] = useState('')
  const [poPickupLng, setPoPickupLng] = useState('')
  const [poCrop, setPoCrop] = useState('')
  const [poQualityGrade, setPoQualityGrade] = useState('Grade A')
  const [poQuantity, setPoQuantity] = useState('')
  const [poUnit, setPoUnit] = useState('kg')
  const [poUnitPrice, setPoUnitPrice] = useState('')
  const [poBuyerDeliveryAddress, setPoBuyerDeliveryAddress] = useState('')
  const [poBuyerLat, setPoBuyerLat] = useState('19.0760')
  const [poBuyerLng, setPoBuyerLng] = useState('72.8777')
  const [poNotes, setPoNotes] = useState('')
  const [poSelectedLotId, setPoSelectedLotId] = useState('')
  const [poSubmitting, setPoSubmitting] = useState(false)
  const [poError, setPoError] = useState('')

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
        const farmPoints = getFarmPoints(batch)
        let coordStr = ''
        if (farmPoints.length > 0) {
          const sum = farmPoints.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0])
          coordStr = `GPS: ${(sum[1] / farmPoints.length).toFixed(4)}, ${(sum[0] / farmPoints.length).toFixed(4)}`
        } else if (farm?.location?.latitude && farm?.location?.longitude) {
          coordStr = `GPS: ${Number(farm.location.latitude).toFixed(4)}, ${Number(farm.location.longitude).toFixed(4)}`
        }

        const rawAddr = farm?.location?.address || ''
        const farmLocation = (rawAddr && !rawAddr.toLowerCase().includes('nashik') && rawAddr !== 'Location pending')
          ? rawAddr
          : (coordStr || 'GPS Coordinates Registered')
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

  const poCalculatedTotal = useMemo(() => {
    const qty = Number(poQuantity) || 0
    const price = Number(poUnitPrice) || 0
    return qty * price
  }, [poQuantity, poUnitPrice])

  const handleSelectFarm = (farmId) => {
    setPoSelectedFarmId(farmId)
    if (!farmId) return
    const chosen = (farms || []).find((f) => (f.id || f._id) === farmId)
    if (chosen) {
      setPoFarmName(chosen.farmName || chosen.name || '')
      if (chosen.farmer?.name || chosen.farmerName) {
        setPoFarmerName(chosen.farmer?.name || chosen.farmerName || '')
      }
      if (chosen.farmer?.email) {
        setPoFarmerEmail(chosen.farmer?.email || '')
      }
      if (chosen.location?.address) {
        setPoPickupAddress(chosen.location.address)
      } else if (chosen.location?.latitude && chosen.location?.longitude) {
        setPoPickupAddress(`GPS: ${chosen.location.latitude}, ${chosen.location.longitude}`)
      }
      if (chosen.location?.latitude) {
        setPoPickupLat(String(chosen.location.latitude))
      }
      if (chosen.location?.longitude) {
        setPoPickupLng(String(chosen.location.longitude))
      }
      if (chosen.crops?.length && !poCrop) {
        setPoCrop(chosen.crops[0])
      }
    }
  }

  const handleSelectLot = (lotId) => {
    setPoSelectedLotId(lotId)
    if (!lotId) return
    const chosen = combined.find((b) => (b.id || b._id) === lotId)
    if (chosen) {
      if (chosen.category || chosen.crop) {
        setPoCrop(chosen.category || chosen.crop)
      }
      if (chosen.qualityGrade) {
        setPoQualityGrade(chosen.qualityGrade)
      }
      if (chosen.unit) {
        setPoUnit(chosen.unit)
      }
      if (chosen.marketPrice || chosen.unitPrice) {
        setPoUnitPrice(String(chosen.marketPrice || chosen.unitPrice))
      }
      if (chosen.availableQuantity || chosen.quantity) {
        setPoQuantity(String(chosen.availableQuantity || chosen.quantity))
      }
      if (chosen.farm) {
        const farmObj = typeof chosen.farm === 'object' ? chosen.farm : (farms || []).find((f) => (f.id || f._id) === chosen.farm)
        if (farmObj) {
          setPoSelectedFarmId(farmObj.id || farmObj._id || '')
          setPoFarmName(farmObj.farmName || farmObj.name || '')
          if (farmObj.location?.address) {
            setPoPickupAddress(farmObj.location.address)
          } else if (farmObj.location?.latitude && farmObj.location?.longitude) {
            setPoPickupAddress(`GPS: ${farmObj.location.latitude}, ${farmObj.location.longitude}`)
          }
          if (farmObj.location?.latitude) setPoPickupLat(String(farmObj.location.latitude))
          if (farmObj.location?.longitude) setPoPickupLng(String(farmObj.location.longitude))
        }
      }
      if (chosen.farmer) {
        const farmerObj = typeof chosen.farmer === 'object' ? chosen.farmer : null
        if (farmerObj?.name) setPoFarmerName(farmerObj.name)
        if (farmerObj?.email) setPoFarmerEmail(farmerObj.email)
      }
    }
  }

  const handleCustomPOSubmit = async (e) => {
    e.preventDefault()
    setPoError('')

    const qty = Number(poQuantity)
    const price = Number(poUnitPrice)

    if (!poCrop?.trim()) {
      setPoError('Please enter the produce crop or variety name.')
      return
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      setPoError('Please enter a valid positive quantity.')
      return
    }
    if (!Number.isFinite(price) || price <= 0) {
      setPoError('Please enter a valid positive unit price.')
      return
    }
    if (!poFarmerName?.trim() && !poFarmName?.trim()) {
      setPoError('Please specify the farmer name or farm plot name.')
      return
    }
    if (!poPickupAddress?.trim() && (!poPickupLat || !poPickupLng)) {
      setPoError('Please provide the farmer pickup location address or GPS coordinates.')
      return
    }
    if (!poBuyerDeliveryAddress?.trim()) {
      setPoError('Please enter the buyer delivery destination address.')
      return
    }

    setPoSubmitting(true)
    try {
      const payload = {
        isCustomPO: true,
        batchId: poSelectedLotId || undefined,
        crop: poCrop.trim(),
        quantity: qty,
        unit: poUnit || 'kg',
        unitPrice: price,
        qualityGrade: poQualityGrade || 'Grade A',
        farmerName: poFarmerName.trim(),
        farmerEmail: poFarmerEmail.trim(),
        farmName: poFarmName.trim(),
        farmId: poSelectedFarmId || undefined,
        pickupLocation: {
          address: poPickupAddress.trim() || `GPS: ${poPickupLat || 17.4321}, ${poPickupLng || 78.5678}`,
          latitude: Number(poPickupLat) || 17.4321,
          longitude: Number(poPickupLng) || 78.5678,
        },
        buyerLocation: {
          address: poBuyerDeliveryAddress.trim(),
          latitude: Number(poBuyerLat) || 19.0760,
          longitude: Number(poBuyerLng) || 72.8777,
        },
        notes: poNotes.trim(),
      }

      if (onCreatePO) {
        await onCreatePO(payload)
      }

      setShowPOModal(false)
      setActiveTab('orders')
      // Reset form
      setPoCrop('')
      setPoQuantity('')
      setPoUnitPrice('')
      setPoFarmerName('')
      setPoFarmerEmail('')
      setPoFarmName('')
      setPoSelectedFarmId('')
      setPoPickupAddress('')
      setPoPickupLat('')
      setPoPickupLng('')
      setPoBuyerDeliveryAddress('')
      setPoBuyerLat('19.0760')
      setPoBuyerLng('72.8777')
      setPoNotes('')
      setPoSelectedLotId('')
    } catch (err) {
      setPoError(err.message || 'Failed to submit Custom Purchase Order.')
    } finally {
      setPoSubmitting(false)
    }
  }

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
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Farmer: <span className="font-semibold text-foreground">{po.supplier?.name || po.supplierName || po.farmerName || 'Registered Producer'}</span>
                          {(po.farm?.farmName || po.farmName) ? ` · ${po.farm?.farmName || po.farmName}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                      <div>
                        <p className="text-muted-foreground text-[10px]">Crop & Volume</p>
                        <p className="font-semibold text-foreground mt-0.5">{po.crop} ({po.quantity} {po.unit || 'kg'})</p>
                        {(po.qualityGrade || po.batch?.qualityGrade) && (
                          <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-muted font-medium text-foreground">
                            {po.qualityGrade || po.batch?.qualityGrade}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px]">Agreed Unit Price</p>
                        <p className="font-semibold text-primary mt-0.5">₹{po.unitPrice} / {po.unit || 'kg'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px]">Total Contract</p>
                        <p className="font-bold text-foreground mt-0.5">₹{(po.totalBudget || po.totalAmount || 0).toLocaleString('en-IN')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px]">Locations</p>
                        <p className="text-[11px] text-foreground truncate max-w-[150px]" title={po.pickupLocation?.address || 'Pickup'}>
                          <span className="text-muted-foreground">From:</span> {po.pickupLocation?.address || 'Farm Plot'}
                        </p>
                        <p className="text-[11px] text-foreground truncate max-w-[150px]" title={po.buyerLocation?.address || 'Destination'}>
                          <span className="text-muted-foreground">To:</span> {po.buyerLocation?.address || 'Buyer Logistics Hub'}
                        </p>
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

      {/* Custom Purchase Order Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="w-full max-w-3xl my-6 rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto text-card-foreground">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-border pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <PlusCircle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Create Custom Purchase Order</h3>
                  <p className="text-xs text-muted-foreground">
                    Direct procurement contract specifying farmer details, farm pickup location, lot specifications, and buyer delivery destination.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPOModal(false)
                  setPoError('')
                }}
                className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Auto-fill helpers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-muted/40 p-3.5 rounded-xl border border-border/60 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Auto-fill from Registered Farm (Optional)
                </label>
                <select
                  value={poSelectedFarmId}
                  onChange={(e) => handleSelectFarm(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-2 text-foreground text-xs outline-none focus:border-primary"
                >
                  <option value="">-- Choose Existing Farm or enter manually --</option>
                  {(farms || []).map((f) => (
                    <option key={f.id || f._id} value={f.id || f._id}>
                      {f.farmName || f.name} ({f.farmer?.name || f.farmerName || 'Farmer'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  Auto-fill from Registered Lot (Optional)
                </label>
                <select
                  value={poSelectedLotId}
                  onChange={(e) => handleSelectLot(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background p-2 text-foreground text-xs outline-none focus:border-primary"
                >
                  <option value="">-- Choose Existing Lot or enter manually --</option>
                  {combined.map((b) => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.category || b.crop} - {b.qualityGrade || 'Grade A'} ({b.availableQuantity ?? b.quantity} {b.unit || 'kg'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <form onSubmit={handleCustomPOSubmit} className="space-y-5 text-xs">
              {/* SECTION 1: Farmer & Farm Details */}
              <div className="space-y-3 rounded-xl border border-border/80 p-4 bg-muted/20">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm border-b border-border/60 pb-2">
                  <User size={16} className="text-primary" />
                  <span>1. Farmer & Farm Plot Details</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="block space-y-1">
                    <span className="font-semibold text-foreground">Farmer Name *</span>
                    <input
                      type="text"
                      value={poFarmerName}
                      onChange={(e) => setPoFarmerName(e.target.value)}
                      placeholder="e.g. Ramesh Patel"
                      required
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-foreground">Farmer Email / Contact</span>
                    <input
                      type="text"
                      value={poFarmerEmail}
                      onChange={(e) => setPoFarmerEmail(e.target.value)}
                      placeholder="e.g. ramesh@patelfarms.in"
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-foreground">Farm Plot Name *</span>
                    <input
                      type="text"
                      value={poFarmName}
                      onChange={(e) => setPoFarmName(e.target.value)}
                      placeholder="e.g. Green Valley Plot A"
                      required
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground"
                    />
                  </label>
                </div>
              </div>

              {/* SECTION 2: Farmer Location / Pickup Point */}
              <div className="space-y-3 rounded-xl border border-border/80 p-4 bg-muted/20">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm border-b border-border/60 pb-2">
                  <MapPin size={16} className="text-primary" />
                  <span>2. Farmer Pickup Location (Origin)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="block space-y-1 md:col-span-3">
                    <span className="font-semibold text-foreground">Farmer Pickup Address / Landmark *</span>
                    <input
                      type="text"
                      value={poPickupAddress}
                      onChange={(e) => setPoPickupAddress(e.target.value)}
                      placeholder="e.g. Survey 42, Anand Field Station, Anand, Gujarat"
                      required
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-foreground">Pickup Latitude (GPS)</span>
                    <input
                      type="number"
                      step="any"
                      value={poPickupLat}
                      onChange={(e) => setPoPickupLat(e.target.value)}
                      placeholder="e.g. 20.0053"
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground font-mono"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-foreground">Pickup Longitude (GPS)</span>
                    <input
                      type="number"
                      step="any"
                      value={poPickupLng}
                      onChange={(e) => setPoPickupLng(e.target.value)}
                      placeholder="e.g. 73.8567"
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground font-mono"
                    />
                  </label>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setPoPickupLat('20.0053')
                        setPoPickupLng('73.8567')
                        if (!poPickupAddress) setPoPickupAddress('GPS: 20.0053, 73.8567')
                      }}
                      className="w-full rounded-lg border border-border bg-secondary/80 py-2.5 px-3 text-[11px] font-semibold text-secondary-foreground hover:bg-secondary transition"
                    >
                      Fill Default Farm GPS
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 3: Produce Lot & Pricing */}
              <div className="space-y-3 rounded-xl border border-border/80 p-4 bg-muted/20">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm border-b border-border/60 pb-2">
                  <Package size={16} className="text-primary" />
                  <span>3. Produce Lot & Pricing Specifications</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <label className="block space-y-1 md:col-span-2">
                    <span className="font-semibold text-foreground">Crop / Variety *</span>
                    <input
                      type="text"
                      value={poCrop}
                      onChange={(e) => setPoCrop(e.target.value)}
                      placeholder="e.g. Organic Wheat, Basmati Rice"
                      required
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-foreground">Quality Grade</span>
                    <select
                      value={poQualityGrade}
                      onChange={(e) => setPoQualityGrade(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground"
                    >
                      <option value="Grade A">Grade A (Premium)</option>
                      <option value="Grade B">Grade B (Standard)</option>
                      <option value="Grade C">Grade C (Commercial)</option>
                      <option value="Grade D">Grade D (Industrial)</option>
                    </select>
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-foreground">Quantity *</span>
                    <input
                      type="number"
                      min="1"
                      value={poQuantity}
                      onChange={(e) => setPoQuantity(e.target.value)}
                      placeholder="e.g. 500"
                      required
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground font-bold"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-foreground">Unit</span>
                    <select
                      value={poUnit}
                      onChange={(e) => setPoUnit(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground font-semibold"
                    >
                      <option value="kg">kg</option>
                      <option value="quintals">quintals</option>
                      <option value="tons">tons</option>
                      <option value="bags">bags</option>
                      <option value="crates">crates</option>
                    </select>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <label className="block space-y-1">
                    <span className="font-semibold text-foreground">Agreed Unit Price (₹ per {poUnit}) *</span>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground font-semibold">₹</span>
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={poUnitPrice}
                        onChange={(e) => setPoUnitPrice(e.target.value)}
                        placeholder="e.g. 45"
                        required
                        className="w-full rounded-lg border border-border bg-background py-2.5 pl-8 pr-3 outline-none focus:border-primary text-foreground font-bold text-sm"
                      />
                    </div>
                  </label>

                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Calculated Contract Value</p>
                      <p className="text-lg font-black text-primary">₹{poCalculatedTotal.toLocaleString('en-IN')}</p>
                    </div>
                    <span className="rounded-full bg-primary/20 text-primary px-2.5 py-1 text-[11px] font-bold">
                      {poQuantity || 0} {poUnit} × ₹{poUnitPrice || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 4: Buyer Location / Delivery Destination */}
              <div className="space-y-3 rounded-xl border border-border/80 p-4 bg-muted/20">
                <div className="flex items-center gap-2 font-bold text-foreground text-sm border-b border-border/60 pb-2">
                  <MapPin size={16} className="text-primary" />
                  <span>4. Buyer Delivery Destination</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label className="block space-y-1 md:col-span-3">
                    <span className="font-semibold text-foreground">Buyer Delivery Destination Address *</span>
                    <input
                      type="text"
                      value={poBuyerDeliveryAddress}
                      onChange={(e) => setPoBuyerDeliveryAddress(e.target.value)}
                      placeholder="e.g. Apex Agri Processing Hub, Sector 19, APMC Market, Vashi, Navi Mumbai"
                      required
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-foreground">Destination Latitude (GPS)</span>
                    <input
                      type="number"
                      step="any"
                      value={poBuyerLat}
                      onChange={(e) => setPoBuyerLat(e.target.value)}
                      placeholder="e.g. 19.0760"
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground font-mono"
                    />
                  </label>

                  <label className="block space-y-1">
                    <span className="font-semibold text-foreground">Destination Longitude (GPS)</span>
                    <input
                      type="number"
                      step="any"
                      value={poBuyerLng}
                      onChange={(e) => setPoBuyerLng(e.target.value)}
                      placeholder="e.g. 72.8777"
                      className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground font-mono"
                    />
                  </label>

                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => {
                        setPoBuyerLat('19.0760')
                        setPoBuyerLng('72.8777')
                        if (!poBuyerDeliveryAddress) setPoBuyerDeliveryAddress('Apex Logistics Distribution Center, APMC Hub')
                      }}
                      className="w-full rounded-lg border border-border bg-secondary/80 py-2.5 px-3 text-[11px] font-semibold text-secondary-foreground hover:bg-secondary transition"
                    >
                      Fill Default Buyer Hub
                    </button>
                  </div>
                </div>
              </div>

              {/* SECTION 5: Logistics & Handling Notes */}
              <label className="block space-y-1">
                <span className="font-semibold text-foreground">Special Instructions / Logistics Notes</span>
                <textarea
                  rows="2"
                  value={poNotes}
                  onChange={(e) => setPoNotes(e.target.value)}
                  placeholder="e.g. Produce must be moisture checked under 12%, dispatch via covered dry container truck."
                  className="w-full rounded-lg border border-border bg-background p-2.5 outline-none focus:border-primary text-foreground resize-none"
                />
              </label>

              {/* Order Status Note & Error */}
              <div className="rounded-xl bg-secondary/60 p-3.5 flex items-center justify-between text-xs">
                <div>
                  <p className="text-[11px] text-muted-foreground">Order Lifecycle Routing</p>
                  <p className="font-semibold text-foreground mt-0.5">
                    Order saved to PurchaseOrders collection · Auto-links to Logistics Hub for dispatch
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 font-bold text-primary">
                  Status: Pending Logistics
                </span>
              </div>

              {poError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive font-semibold text-xs">
                  {poError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end items-center gap-3 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowPOModal(false)
                    setPoError('')
                  }}
                  className="rounded-xl border border-border px-5 py-2.5 font-semibold text-foreground hover:bg-muted transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={poSubmitting}
                  className="rounded-xl bg-primary px-7 py-2.5 font-bold text-primary-foreground hover:opacity-90 transition disabled:opacity-50 shadow-sm flex items-center gap-2"
                >
                  {poSubmitting ? 'Submitting Order...' : 'Create & Issue Custom PO'}
                </button>
              </div>
            </form>
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
              <div className="h-52 relative">
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
          <div className="w-full max-w-2xl rounded-2xl bg-card border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-bold text-lg text-foreground">{showMapModal.farmName}</h3>
                <p className="text-xs text-muted-foreground">{showMapModal.farmLocation} · {showMapModal.farmArea} Acres</p>
              </div>
              <button onClick={() => setShowMapModal(null)} className="rounded-lg p-1.5 hover:bg-muted text-muted-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="h-96 md:h-[400px] rounded-xl overflow-hidden border border-border relative bg-muted/20">
              <FarmMap points={getFarmPoints(showMapModal)} farmName={showMapModal.farmName} finished={false} interactive={true} />
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowMapModal(null)}
                className="rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
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

export { MarketPage }
export default MarketPage

