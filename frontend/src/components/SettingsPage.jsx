import { useState } from 'react'
import {
  Award,
  Bell,
  Check,
  CheckCircle,
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
  darkMode,
  setDarkMode,
}) {
  const [region, setRegion] = useState('West Agro Region (MH-401)')
  const [landUnit, setLandUnit] = useState('acres')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [currency, setCurrency] = useState('INR (₹)')

  const [emailAlerts, setEmailAlerts] = useState(true)
  const [smsAlerts, setSmsAlerts] = useState(true)
  const [marketPriceAlerts, setMarketPriceAlerts] = useState(true)

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Workspace Settings & Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure active role persona, regional organization, notifications, and system connectivity.
        </p>
      </div>

      {/* SECTION 1: Active Workspace Role */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-bold text-lg text-foreground">Active Workspace Role</h2>
            <p className="text-xs text-muted-foreground">Your role is managed by your authenticated account.</p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary capitalize">
            Current: {role?.replace('_', ' ')}
          </span>
        </div>

        <div className="rounded-xl bg-muted/50 p-4 text-sm font-semibold capitalize text-primary">{role?.replaceAll('_', ' ')}</div>
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

    </div>
  )
}
