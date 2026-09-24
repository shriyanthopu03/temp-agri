import { useState } from 'react'
import {
  Award,
  Bell,
  Check,
  CheckCircle,
  Database,
  Globe,
  Globe2,
  Key,
  Leaf,
  Moon,
  Package,
  Shield,
  ShieldCheck,
  Ship,
  ShoppingBag,
  Sun,
  Truck,
  User,
  UserCheck,
  Users,
  Warehouse,
} from 'lucide-react'

export function SettingsPage({
  session,
  role,
  onRoleChange,
  darkMode,
  setDarkMode,
  accountTypes,
}) {
  const [region, setRegion] = useState('West Agro Region (MH-401)')
  const [landUnit, setLandUnit] = useState('acres')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [currency, setCurrency] = useState('INR (₹)')

  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [marketPriceAlerts, setMarketPriceAlerts] = useState(true)

  const rolesGrid = [
    {
      value: 'farmer',
      label: 'Farmer',
      icon: Leaf,
      tone: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
      description: 'Manage registered land parcels, crop health, harvest batches, and market prices.',
    },
    {
      value: 'logistics_coordinator',
      label: 'Logistics Coordinator',
      icon: Truck,
      tone: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800',
      description: 'Track fleet dispatches, in-transit shipments, vehicle routes, and buyer deliveries.',
    },
    {
      value: 'platform_admin',
      label: 'Platform Admin',
      icon: ShieldCheck,
      tone: 'bg-slate-100 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700',
      description: 'Global system overview, organizational setup, RBAC controls, and audit trails.',
    },
    {
      value: 'collection_center_manager',
      label: 'Collection Center Manager',
      icon: Warehouse,
      tone: 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
      description: 'Manage farmer intake queues, warehouse inventory bins, and dispatch staging.',
    },
    {
      value: 'quality_inspector',
      label: 'Quality Inspector',
      icon: Award,
      tone: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      description: 'Inspect produce batches, measure moisture/purity, and issue quality certificates.',
    },
    {
      value: 'buyer',
      label: 'Buyer',
      icon: ShoppingBag,
      tone: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
      description: 'Browse verified produce lots, submit purchase orders, and execute trade settlements.',
    },
  ]

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Workspace Settings & Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure active role persona, regional organization, notifications, and system connectivity.
        </p>
      </div>

      {/* SECTION 1: Active Workspace Role Switcher */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-bold text-lg text-foreground">Active Workspace Role Persona</h2>
            <p className="text-xs text-muted-foreground">
              Select any role to switch your active workspace permissions and view tailored operations.
            </p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary capitalize">
            Current: {role?.replace('_', ' ')}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rolesGrid.map((r) => {
            const Icon = r.icon
            const isActive = role === r.value
            return (
              <div
                key={r.value}
                onClick={() => onRoleChange(r.value)}
                className={`rounded-2xl border p-4 cursor-pointer transition flex flex-col justify-between ${
                  isActive
                    ? 'border-2 border-primary bg-secondary/60 shadow-md'
                    : 'border-border bg-background hover:bg-muted/60'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl border ${r.tone}`}>
                      <Icon size={20} />
                    </div>
                    {isActive && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-background px-2 py-0.5 rounded-full border border-primary/40">
                        <Check size={12} /> Active Role
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-sm text-foreground">{r.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{r.description}</p>
                </div>

                <div className="mt-4 pt-2 border-t border-border/50 text-right">
                  <span className={`text-xs font-semibold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                    {isActive ? 'Workspace Loaded' : 'Switch Role →'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* SECTION 2: User Profile & Account */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-lg text-foreground border-b border-border pb-3">User Profile & Account Info</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-muted/50 space-y-1">
            <span className="text-muted-foreground">Full Name</span>
            <p className="font-bold text-sm text-foreground">{session?.user?.name || session?.name || 'Workspace User'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/50 space-y-1">
            <span className="text-muted-foreground">Email Address</span>
            <p className="font-bold text-sm text-foreground">{session?.user?.email || session?.email || 'user@agritrade.com'}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/50 space-y-1">
            <span className="text-muted-foreground">Organization ID</span>
            <p className="font-mono text-xs text-foreground font-semibold">
              {session?.user?.organizationId || '507f1f77bcf86cd799439011'}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-muted/50 space-y-1">
            <span className="text-muted-foreground">Region ID</span>
            <p className="font-mono text-xs text-foreground font-semibold">
              {session?.user?.regionId || '507f1f77bcf86cd799439012'}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 3: Regional & Unit Preferences */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-lg text-foreground border-b border-border pb-3">Regional & Measurement Preferences</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <label className="block space-y-1">
            <span className="font-medium text-foreground">Operational Region</span>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
            >
              <option value="West Agro Region (MH-401)">West Agro Region (MH-401)</option>
              <option value="North Grain Belt (PB-102)">North Grain Belt (PB-102)</option>
              <option value="South Spices Hub (KL-301)">South Spices Hub (KL-301)</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-foreground">Land Area Unit</span>
            <select
              value={landUnit}
              onChange={(e) => setLandUnit(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
            >
              <option value="acres">Acres (ac)</option>
              <option value="hectares">Hectares (ha)</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-foreground">Weight Unit</span>
            <select
              value={weightUnit}
              onChange={(e) => setWeightUnit(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
            >
              <option value="kg">Kilograms (kg)</option>
              <option value="tons">Metric Tons</option>
              <option value="quintals">Quintals</option>
            </select>
          </label>

          <label className="block space-y-1">
            <span className="font-medium text-foreground">Market Currency</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full rounded-xl border border-border bg-background p-2.5 text-xs outline-none focus:border-primary"
            >
              <option value="INR (₹)">Indian Rupee (₹)</option>
              <option value="USD ($)">US Dollar ($)</option>
            </select>
          </label>
        </div>
      </section>

      {/* SECTION 4: System Diagnostics */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-lg text-foreground border-b border-border pb-3">System Diagnostics & API Status</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-3">
            <Database size={20} className="text-emerald-700 dark:text-emerald-300" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-emerald-200">Express / MongoDB API</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-400">Connected & Synced</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center gap-3">
            <Globe size={20} className="text-blue-700 dark:text-blue-300" />
            <div>
              <p className="font-bold text-blue-900 dark:text-blue-200">MapTiler GIS Engine</p>
              <p className="text-[10px] text-blue-700 dark:text-blue-400">Outdoor v2 Tile Provider Active</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 flex items-center gap-3">
            <Key size={20} className="text-purple-700 dark:text-purple-300" />
            <div>
              <p className="font-bold text-purple-900 dark:text-purple-200">RBAC Token Auth</p>
              <p className="text-[10px] text-purple-700 dark:text-purple-400">JWT Session Active</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
