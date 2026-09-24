import { useState } from 'react'
import {
  AreaChart,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Clock,
  CloudSun,
  FileCheck,
  FileText,
  Filter,
  Globe,
  HardDrive,
  Leaf,
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  Ship,
  ShoppingBag,
  Sprout,
  Tractor,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  Warehouse,
} from 'lucide-react'
import { FarmMap } from './FarmMap'

export function OverviewPage({
  role,
  userName,
  farms,
  selectedFarm,
  setSelectedFarm,
  setShowForm,
  setActiveTab,
  lots,
  shipments,
  purchaseOrders,
  warehouses,
  qualityReports,
}) {
  const [selectedLot, setSelectedLot] = useState(null)

  // Role metadata mapping
  const roleConfig = {
    farmer: {
      badge: 'Farmer Workspace',
      description: 'Overview of your registered land parcels, crop health, and harvest batches.',
      actionBtn: 'Add new farm',
      onAction: () => setShowForm(true),
      metrics: [
        { label: 'Total farm area', value: `${farms.reduce((acc, f) => acc + (f.area || 0), 0).toFixed(1)} ac`, suffix: 'acres', icon: Tractor, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Active farms', value: String(farms.length), suffix: 'registered', icon: Leaf, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'Harvested lots', value: String(lots.length || 18), suffix: 'active', icon: Sprout, tone: 'bg-[#e4eef1] text-[#2e7080]' },
        { label: 'Market value', value: '₹12.8L', suffix: 'estimated', icon: TrendingUp, tone: 'bg-[#eee8f4] text-[#76518e]' },
      ],
    },
    logistics_coordinator: {
      badge: 'Logistics Operations Hub',
      description: 'Track fleet dispatches, in-transit shipments, vehicle routes, and buyer deliveries.',
      actionBtn: 'Create Shipment',
      onAction: () => setActiveTab('Produce Lots'),
      metrics: [
        { label: 'Active shipments', value: String(shipments.filter(s => s.status !== 'delivered').length || 6), suffix: 'in transit', icon: Truck, tone: 'bg-[#e4eef1] text-[#2e7080]' },
        { label: 'Vehicles dispatched', value: '14', suffix: 'on route', icon: Ship, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Intake volume', value: '42.5', suffix: 'tons', icon: Package, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'On-time delivery', value: '98.4%', suffix: 'performance', icon: CheckCircle2, tone: 'bg-[#eee8f4] text-[#76518e]' },
      ],
    },
    platform_admin: {
      badge: 'Platform Administration Control',
      description: 'System-wide monitoring of organizations, user RBAC permissions, audit events, and regional volume.',
      actionBtn: 'Audit System Logs',
      onAction: () => setActiveTab('Settings'),
      metrics: [
        { label: 'Total Users', value: '1,284', suffix: 'active', icon: Users, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Land Parcels', value: String(farms.length + 42), suffix: 'parcels', icon: Globe, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'Enterprise POs', value: String(purchaseOrders.length || 24), suffix: 'orders', icon: FileCheck, tone: 'bg-[#e4eef1] text-[#2e7080]' },
        { label: 'Platform GMV', value: '₹84.6L', suffix: 'total trade', icon: TrendingUp, tone: 'bg-[#eee8f4] text-[#76518e]' },
      ],
    },
    collection_center_manager: {
      badge: 'Collection Center Portal',
      description: 'Manage incoming farmer produce intake, warehouse inventory bins, and dispatch staging.',
      actionBtn: 'Warehouse Bins',
      onAction: () => setActiveTab('Produce Lots'),
      metrics: [
        { label: "Today's Intake", value: '18.4', suffix: 'tons', icon: Warehouse, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Storage capacity', value: '74%', suffix: 'occupied', icon: HardDrive, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'Pending staging', value: String(lots.filter(l => l.status === 'created').length || 8), suffix: 'lots', icon: Clock, tone: 'bg-[#e4eef1] text-[#2e7080]' },
        { label: 'Suppliers active', value: '32', suffix: 'farmers', icon: UserCheck, tone: 'bg-[#eee8f4] text-[#76518e]' },
      ],
    },
    quality_inspector: {
      badge: 'Quality Inspection Workbench',
      description: 'Review produce lots for moisture content, grade certification, lab test records, and acceptance.',
      actionBtn: 'Inspect Pending Lots',
      onAction: () => setActiveTab('Produce Lots'),
      metrics: [
        { label: 'Pending inspection', value: String(lots.filter(l => l.status === 'created').length || 5), suffix: 'lots', icon: Clock, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'Inspected today', value: '12', suffix: 'completed', icon: FileCheck, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Pass Rate', value: '94.2%', suffix: 'accepted', icon: ShieldCheck, tone: 'bg-[#e4eef1] text-[#2e7080]' },
        { label: 'Grade A lots', value: '18', suffix: 'export grade', icon: Award, tone: 'bg-[#eee8f4] text-[#76518e]' },
      ],
    },
    buyer: {
      badge: 'Buyer Sourcing Hub',
      description: 'Discover verified high-grade produce, submit purchase orders, and monitor contract settlements.',
      actionBtn: 'Create Purchase Order',
      onAction: () => setActiveTab('Market'),
      metrics: [
        { label: 'Open Purchase Orders', value: String(purchaseOrders.length || 6), suffix: 'active', icon: ShoppingBag, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Contracted produce', value: '65', suffix: 'tons', icon: Package, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'Available lots', value: String(lots.length || 24), suffix: 'listed', icon: AreaChart, tone: 'bg-[#e4eef1] text-[#2e7080]' },
        { label: 'Total procurement', value: '₹24.5L', suffix: 'spent', icon: TrendingUp, tone: 'bg-[#eee8f4] text-[#76518e]' },
      ],
    },
  }

  const currentRole = roleConfig[role] || roleConfig.farmer

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <CloudSun size={17} /> Thursday, 24 September 2026
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Good morning, {userName}</h1>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">
              {currentRole.badge}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{currentRole.description}</p>
        </div>
        <button
          onClick={currentRole.onAction}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
        >
          <Plus size={18} /> {currentRole.actionBtn}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {currentRole.metrics.map((card, idx) => {
          const Icon = card.icon
          return (
            <div key={idx} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight">
                    {card.value}
                    <span className="ml-1 text-base font-normal text-muted-foreground">{card.suffix}</span>
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${card.tone}`}>
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary">
                <TrendingUp size={13} /> 8.4% <span className="font-normal text-muted-foreground">vs last cycle</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Map & Role Features Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Left Map Card */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-semibold">Regional Operations Map</h2>
              <p className="mt-1 text-sm text-muted-foreground">Registered land parcels & collection centers</p>
            </div>
            <button
              onClick={() => setActiveTab('My Farms')}
              className="flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
            >
              Full Map View <ArrowUpRight size={16} />
            </button>
          </div>
          <div className="h-[420px]">
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

        {/* Right Role-Tailored Card */}
        <section className="rounded-2xl border border-border bg-card shadow-sm flex flex-col">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-semibold">
                {role === 'farmer' && 'Your Registered Farms'}
                {role === 'logistics_coordinator' && 'Active Dispatch Queue'}
                {role === 'platform_admin' && 'System Audit Activity'}
                {role === 'collection_center_manager' && 'Incoming Farmer Intake'}
                {role === 'quality_inspector' && 'Pending Quality Inspections'}
                {role === 'buyer' && 'Open Purchase Requests'}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {role === 'farmer' && 'Select a farm to highlight boundary'}
                {role === 'logistics_coordinator' && 'Vehicles on delivery route'}
                {role === 'platform_admin' && 'Recent RBAC & operational logs'}
                {role === 'collection_center_manager' && 'Farmers queued for warehouse intake'}
                {role === 'quality_inspector' && 'Lots requiring lab verification'}
                {role === 'buyer' && 'Active PO fulfillment tracking'}
              </p>
            </div>
            <button
              onClick={() => setActiveTab(role === 'farmer' ? 'My Farms' : role === 'buyer' ? 'Market' : 'Produce Lots')}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
            >
              <FileText size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[350px]">
            {role === 'farmer' && (
              <div className="flex flex-col">
                {farms.map((farm) => (
                  <button
                    key={farm.id}
                    onClick={() => setSelectedFarm(farm)}
                    className={`flex items-center gap-3 border-b border-border p-4 text-left transition last:border-0 hover:bg-muted ${
                      selectedFarm?.id === farm.id ? 'bg-secondary/60' : ''
                    }`}
                  >
                    <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Leaf size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{farm.name}</p>
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin size={12} /> {farm.location}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{(farm.area || 0).toFixed(1)} ac</p>
                      <p className="mt-1 text-[11px] font-medium text-primary">{farm.status}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {role === 'logistics_coordinator' && (
              <div className="divide-y divide-border">
                {shipments.map((s, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#e4eef1] text-[#2e7080]">
                        <Truck size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{s.reference || `SHP-2026-0${i + 1}`}</p>
                        <p className="text-xs text-muted-foreground">Vehicle: {s.vehicle || 'MH-12-AB-4081'}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary capitalize">
                      {s.status || 'in_transit'}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {role === 'platform_admin' && (
              <div className="divide-y divide-border">
                {[
                  { user: 'Farmer Ramesh', action: 'Registered new parcel (5.4 ac)', time: '10m ago' },
                  { user: 'Inspector Anita', action: 'Certified Lot LOT-2026-004 as Grade A', time: '25m ago' },
                  { user: 'Manager Vikram', action: 'Received 8.2 tons into Bin B-04', time: '1h ago' },
                  { user: 'Logistics Coord', action: 'Dispatched truck MH-14-GH-9912', time: '2h ago' },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 flex items-start gap-3 text-xs">
                    <div className="p-2 rounded-lg bg-secondary text-primary mt-0.5">
                      <ShieldCheck size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{item.user}</p>
                      <p className="text-muted-foreground mt-0.5">{item.action}</p>
                    </div>
                    <span className="text-muted-foreground">{item.time}</span>
                  </div>
                ))}
              </div>
            )}

            {role === 'collection_center_manager' && (
              <div className="divide-y divide-border">
                {lots.slice(0, 5).map((lot, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#e7efe5] text-primary">
                        <Warehouse size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{lot.farmerName || `Farmer #${idx + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{lot.category} • {lot.quantity} {lot.unit || 'kg'}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('Produce Lots')}
                      className="rounded-lg bg-secondary px-3 py-1 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition"
                    >
                      Receive Intake
                    </button>
                  </div>
                ))}
              </div>
            )}

            {role === 'quality_inspector' && (
              <div className="divide-y divide-border">
                {lots.map((lot, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#f7ecd8] text-[#a56a17]">
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{lot.category} Batch #{lot.id?.slice(-4) || idx + 101}</p>
                        <p className="text-xs text-muted-foreground">{lot.quantity} {lot.unit || 'kg'} • Pending Test</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('Produce Lots')}
                      className="rounded-lg bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                    >
                      Grade Lot
                    </button>
                  </div>
                ))}
              </div>
            )}

            {role === 'buyer' && (
              <div className="divide-y divide-border">
                {purchaseOrders.map((po, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#eee8f4] text-[#76518e]">
                        <ShoppingBag size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{po.reference || `PO-2026-10${idx + 1}`}</p>
                        <p className="text-xs text-muted-foreground">{po.crop || 'Organic Grapes'} • {po.quantity || '10'} Tons</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary capitalize">
                      {po.status || 'submitted'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="m-4 rounded-xl border border-dashed border-border p-4 text-center">
            <p className="text-sm font-medium">Quick Workspace Action</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Manage complete operations across all connected modules.
            </p>
            <button
              onClick={() => setActiveTab(role === 'farmer' ? 'My Farms' : 'Produce Lots')}
              className="mt-3 text-xs font-semibold text-primary"
            >
              Open Full Module <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </div>

      {/* Secondary Bottom Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Progress Card */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-semibold">Season Progress & Quality Assurance</h2>
              <p className="mt-1 text-sm text-muted-foreground">September 2026 harvest cycle</p>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">On track</span>
          </div>
          <div className="mt-6 flex items-end gap-2">
            <span className="text-4xl font-semibold">74%</span>
            <span className="mb-1 text-sm text-muted-foreground">completed handoffs</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-[74%] rounded-full bg-primary" />
          </div>
          <div className="mt-4 flex justify-between text-xs text-muted-foreground">
            <span>Planting & Intake</span>
            <span>Quality Inspection</span>
            <span>Warehouse & Dispatch</span>
            <span>Buyer Delivery</span>
          </div>
        </section>

        {/* Market Snapshot Card */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold">Live Market Snapshot</h2>
              <p className="mt-1 text-sm text-muted-foreground">Real-time agricultural commodity prices</p>
            </div>
            <button onClick={() => setActiveTab('Market')} className="text-sm font-semibold text-primary hover:underline">
              Open market
            </button>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <div className="flex size-11 items-center justify-center rounded-xl bg-[#f7ecd8] text-[#a56a17]">
              <TrendingUp size={20} />
            </div>
            <div>
              <p className="text-2xl font-semibold">+12.6%</p>
              <p className="text-xs text-muted-foreground">Average price movement this week</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-sm font-medium">Organic Grapes</p>
              <p className="text-sm font-bold text-primary">₹86 / kg</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
