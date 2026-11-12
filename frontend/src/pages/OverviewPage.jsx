import { useEffect, useState } from 'react'
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
  MapPin,
  Package,
  Plus,
  ShieldCheck,
  Ship,
  ShoppingBag,
  Tractor,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  Warehouse,
} from 'lucide-react'
import { FarmMap } from '../components/FarmMap'

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
  onAssignShipment,
  onDispatchShipment,
  session,
}) {
  const [selectedLot, setSelectedLot] = useState(null)
  const [adminStats, setAdminStats] = useState(null)
  const [adminLoading, setAdminLoading] = useState(false)

  const isAdmin = role === 'platform_admin' || role === 'admin'

  useEffect(() => {
    if (!isAdmin || !session?.token) return
    let isSubscribed = true
    setAdminLoading(true)
    fetch('/api/audit/admin-stats', {
      headers: { Authorization: `Bearer ${session.token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isSubscribed && data) setAdminStats(data)
      })
      .catch((err) => console.error('Failed to load admin stats', err))
      .finally(() => {
        if (isSubscribed) setAdminLoading(false)
      })
    return () => {
      isSubscribed = false
    }
  }, [isAdmin, session])

  // Role metadata mapping
  const roleConfig = {
    farmer: {
      badge: 'Farmer Workspace',
      description: 'Overview of your registered farms, crop health, and harvest batches.',
      actionBtn: 'Add new farm',
      onAction: () => setShowForm(true),
      metrics: [
        { label: 'Total farm area', value: `${farms.reduce((acc, f) => acc + (f.area || 0), 0).toFixed(1)} ac`, suffix: 'acres', icon: Tractor, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Active farms', value: String(farms.length), suffix: 'registered', icon: MapPin, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'Harvested lots', value: String(lots.length), suffix: 'active', icon: Package, tone: 'bg-[#e4eef1] text-[#2e7080]' },
      ],
    },
    logistics_coordinator: {
      badge: 'Logistics Operations Hub',
      description: 'Track fleet dispatches, in-transit shipments, vehicle routes, and buyer deliveries.',
      actionBtn: 'Create Shipment',
      onAction: () => setActiveTab('Produce Lots'),
      metrics: [
        { label: 'Active shipments', value: String(shipments.filter(s => s.status !== 'delivered').length), suffix: 'in transit', icon: Truck, tone: 'bg-[#e4eef1] text-[#2e7080]' },
        { label: 'Vehicles dispatched', value: '—', suffix: 'on route', icon: Ship, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Intake volume', value: '—', suffix: 'tons', icon: Package, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'On-time delivery', value: '—', suffix: 'performance', icon: CheckCircle2, tone: 'bg-[#eee8f4] text-[#76518e]' },
      ],
    },
    platform_admin: {
      badge: 'Platform Administration Control',
      description: 'System-wide monitoring of organizations, user RBAC permissions, audit events, and regional volume.',
      actionBtn: 'Audit System Logs',
      onAction: () => setActiveTab('Settings'),
      metrics: [
        { label: 'Total Users', value: '—', suffix: 'active', icon: Users, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Registered Farms', value: String(farms.length), suffix: 'farms', icon: Globe, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'Enterprise POs', value: String(purchaseOrders.length), suffix: 'orders', icon: FileCheck, tone: 'bg-[#e4eef1] text-[#2e7080]' },
        { label: 'Platform GMV', value: '—', suffix: 'total trade', icon: TrendingUp, tone: 'bg-[#eee8f4] text-[#76518e]' },
      ],
    },
    collection_center_manager: {
      badge: 'Collection Center Portal',
      description: 'Manage incoming farmer produce intake, warehouse inventory bins, and dispatch staging.',
      actionBtn: 'Warehouse Bins',
      onAction: () => setActiveTab('Produce Lots'),
      metrics: [
        { label: "Today's Intake", value: '—', suffix: 'tons', icon: Warehouse, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Storage capacity', value: '—', suffix: 'occupied', icon: HardDrive, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'Pending staging', value: String(lots.filter(l => l.status === 'created').length), suffix: 'lots', icon: Clock, tone: 'bg-[#e4eef1] text-[#2e7080]' },
        { label: 'Suppliers active', value: '—', suffix: 'farmers', icon: UserCheck, tone: 'bg-[#eee8f4] text-[#76518e]' },
      ],
    },
    quality_inspector: {
      badge: 'Quality Inspection Workbench',
      description: 'Review produce lots for moisture content, grade certification, lab test records, and acceptance.',
      actionBtn: 'Inspect Pending Lots',
      onAction: () => setActiveTab('Produce Lots'),
      metrics: [
        { label: 'Pending inspection', value: String(lots.filter(l => l.status === 'created').length), suffix: 'lots', icon: Clock, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'Inspected today', value: '—', suffix: 'completed', icon: FileCheck, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Pass Rate', value: '—', suffix: 'accepted', icon: ShieldCheck, tone: 'bg-[#e4eef1] text-[#2e7080]' },
        { label: 'Grade A lots', value: '—', suffix: 'export grade', icon: Award, tone: 'bg-[#eee8f4] text-[#76518e]' },
      ],
    },
    buyer: {
      badge: 'Buyer Sourcing Hub',
      description: 'Discover verified high-grade produce, submit purchase orders, and monitor contract settlements.',
      actionBtn: 'Create Purchase Order',
      onAction: () => setActiveTab('Market'),
      metrics: [
        { label: 'Open Purchase Orders', value: String(purchaseOrders.length), suffix: 'active', icon: ShoppingBag, tone: 'bg-[#e7efe5] text-primary' },
        { label: 'Contracted produce', value: '—', suffix: 'tons', icon: Package, tone: 'bg-[#f7ecd8] text-[#a56a17]' },
        { label: 'Available lots', value: String(lots.length), suffix: 'listed', icon: AreaChart, tone: 'bg-[#e4eef1] text-[#2e7080]' },
        { label: 'Total procurement', value: '—', suffix: 'spent', icon: TrendingUp, tone: 'bg-[#eee8f4] text-[#76518e]' },
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
            <CloudSun size={17} /> {new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(new Date())}
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

      {/* Metrics Row: 11 System Statistics for Platform Admin or 4 Persona Cards for Other Roles */}
      {isAdmin ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
              <Globe size={16} className="text-primary" /> Platform Administration & System-Wide KPIs (Real MongoDB Data)
            </h2>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
              11 Core Operations Metrics
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {/* 1. Total Registered Farmers */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Farmers</span>
                <div className="p-2 rounded-lg bg-[#e7efe5] text-primary"><Tractor size={15} /></div>
              </div>
              <p className="text-2xl font-bold mt-2 text-foreground">{adminStats?.totalFarmers ?? '—'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Registered Farmers</p>
            </div>

            {/* 2. Total Registered Buyers */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Buyers</span>
                <div className="p-2 rounded-lg bg-[#eee8f4] text-[#76518e]"><ShoppingBag size={15} /></div>
              </div>
              <p className="text-2xl font-bold mt-2 text-foreground">{adminStats?.totalBuyers ?? '—'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Wholesale Buyers</p>
            </div>

            {/* 3. Total Registered Quality Inspectors */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Inspectors</span>
                <div className="p-2 rounded-lg bg-[#f7ecd8] text-[#a56a17]"><Award size={15} /></div>
              </div>
              <p className="text-2xl font-bold mt-2 text-foreground">{adminStats?.totalInspectors ?? '—'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Quality Inspectors</p>
            </div>

            {/* 4. Total Registered Logistics Coordinators */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Logistics</span>
                <div className="p-2 rounded-lg bg-[#e4eef1] text-[#2e7080]"><Truck size={15} /></div>
              </div>
              <p className="text-2xl font-bold mt-2 text-foreground">{adminStats?.totalLogistics ?? '—'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Logistics Coordinators</p>
            </div>

            {/* 5. Total Registered Farms */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Farms</span>
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600"><MapPin size={15} /></div>
              </div>
              <p className="text-2xl font-bold mt-2 text-foreground">{adminStats?.totalFarms ?? farms.length}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Registered Farms</p>
            </div>

            {/* 6. Pending Quality Inspection Requests */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pending QI</span>
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600"><Clock size={15} /></div>
              </div>
              <p className="text-2xl font-bold mt-2 text-amber-600 dark:text-amber-400">{adminStats?.pendingInspections ?? '—'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Pending Inspections</p>
            </div>

            {/* 7. Completed Quality Inspections */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Completed QI</span>
                <div className="p-2 rounded-lg bg-green-500/10 text-green-600"><CheckCircle2 size={15} /></div>
              </div>
              <p className="text-2xl font-bold mt-2 text-emerald-600 dark:text-emerald-400">{adminStats?.completedInspections ?? '—'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Completed Inspections</p>
            </div>

            {/* 8. Total Purchase Orders */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Orders</span>
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600"><FileCheck size={15} /></div>
              </div>
              <p className="text-2xl font-bold mt-2 text-foreground">{adminStats?.totalOrders ?? purchaseOrders.length}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Total Purchase Orders</p>
            </div>

            {/* 9. Orders Pending Logistics */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pending Fleet</span>
                <div className="p-2 rounded-lg bg-orange-500/10 text-orange-600"><Package size={15} /></div>
              </div>
              <p className="text-2xl font-bold mt-2 text-orange-600 dark:text-orange-400">{adminStats?.pendingLogistics ?? '—'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Pending Logistics</p>
            </div>

            {/* 10. Orders Accepted by Logistics */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Accepted Fleet</span>
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600"><Ship size={15} /></div>
              </div>
              <p className="text-2xl font-bold mt-2 text-indigo-600 dark:text-indigo-400">{adminStats?.acceptedOrders ?? '—'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Accepted Logistics</p>
            </div>

            {/* 11. Delivered Orders */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Delivered</span>
                <div className="p-2 rounded-lg bg-teal-500/10 text-teal-600"><ShieldCheck size={15} /></div>
              </div>
              <p className="text-2xl font-bold mt-2 text-teal-600 dark:text-teal-400">{adminStats?.deliveredOrders ?? '—'}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Delivered Orders</p>
            </div>
          </div>
        </div>
      ) : (
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
              </div>
            )
          })}
        </div>
      )}

      {/* Map & Role Features Grid */}
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        {/* Left Map Card */}
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border p-5">
            <div>
              <h2 className="font-semibold">Regional Operations Map</h2>
              <p className="mt-1 text-sm text-muted-foreground">Registered farms & collection centers</p>
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
              farms.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center my-auto">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary/30 text-primary mb-3">
                    <MapPin size={24} />
                  </div>
                  <p className="font-semibold text-sm text-foreground">No farm registered in your account</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-xs">
                    Register your agricultural land to mark GPS boundaries and manage harvest lots.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('My Farms')}
                    className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
                  >
                    <Plus size={15} />
                    <span>Add Farm</span>
                  </button>
                </div>
              ) : (
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
                        <MapPin size={18} />
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
              )
            )}

            {role === 'logistics_coordinator' && (
              <div className="divide-y divide-border">
                {shipments.map((s, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-[#e4eef1] text-[#2e7080]">
                        <Truck size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{s.reference || s.shipmentNumber}</p>
                        <p className="text-xs text-muted-foreground">Vehicle: {s.vehicle || 'Unassigned'}</p>
                        <p className="text-[11px] text-muted-foreground">Pickup {s.pickupLocation?.latitude}, {s.pickupLocation?.longitude} → Destination {s.destination?.latitude}, {s.destination?.longitude}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {s.status === 'ready_for_pickup' && <button onClick={() => { const vehicleId = window.prompt('Enter vehicle ID'); if (vehicleId?.trim()) onAssignShipment?.(s.id, vehicleId.trim()) }} className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-semibold text-primary">Assign vehicle</button>}
                      {s.status === 'assigned' && <button onClick={() => onDispatchShipment?.(s.id)} className="rounded-lg bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">Dispatch</button>}
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-primary capitalize">{s.status || 'in_transit'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(role === 'platform_admin' || role === 'admin') && (
              <div className="divide-y divide-border">
                {adminStats?.recentUsers && adminStats.recentUsers.length > 0 ? (
                  adminStats.recentUsers.map((user, idx) => (
                    <div key={idx} className="p-4 flex items-center justify-between hover:bg-muted/50 transition">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                          <Users size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-primary capitalize">
                          {user.role?.replace('_', ' ')}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    {adminLoading ? 'Loading system audit logs...' : 'No registered users found.'}
                  </div>
                )}
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
                        <p className="text-sm font-semibold">{po.reference || po.number}</p>
                        <p className="text-xs text-muted-foreground">{po.crop || 'Crop unavailable'} • {po.quantity || 0} {po.unit || 'kg'}</p>
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
    </div>
  )
}
