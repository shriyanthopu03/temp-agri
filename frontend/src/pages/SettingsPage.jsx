import { useEffect, useState } from 'react'
import {
  AlertCircle,
  Award,
  Bell,
  Check,
  CheckCircle,
  CreditCard,
  Edit2,
  Moon,
  Package,
  Phone,
  Save,
  Shield,
  ShieldCheck,
  Sun,
  User,
  X,
} from 'lucide-react'
import { updateUserProfile } from '../services/authService'

export function SettingsPage({
  session,
  role,
  darkMode,
  setDarkMode,
  onUpdateUser,
}) {
  const [region, setRegion] = useState('West Agro Region (MH-401)')
  const [landUnit, setLandUnit] = useState('acres')
  const [weightUnit, setWeightUnit] = useState('kg')
  const [currency, setCurrency] = useState('INR (₹)')

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [aadharNumber, setAadharNumber] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name || session.name || '')
      setPhoneNumber(session.user.phoneNumber || session.phoneNumber || '')
      setAadharNumber(session.user.aadharNumber || session.aadharNumber || '')
    }
  }, [session])

  const handleStartEdit = () => {
    setName(session?.user?.name || session?.name || '')
    setPhoneNumber(session?.user?.phoneNumber || session?.phoneNumber || '')
    setAadharNumber(session?.user?.aadharNumber || session?.aadharNumber || '')
    setProfileError('')
    setProfileSuccess('')
    setIsEditingProfile(true)
  }

  const handleCancelEdit = () => {
    setName(session?.user?.name || session?.name || '')
    setPhoneNumber(session?.user?.phoneNumber || session?.phoneNumber || '')
    setAadharNumber(session?.user?.aadharNumber || session?.aadharNumber || '')
    setProfileError('')
    setIsEditingProfile(false)
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')

    if (!name.trim()) {
      setProfileError('Full Name cannot be empty.')
      return
    }

    // Optional validation for phone number if provided
    const cleanPhone = phoneNumber.replace(/[\s-]/g, '')
    if (cleanPhone && !/^\+?[0-9]{10,13}$/.test(cleanPhone)) {
      setProfileError('Please enter a valid phone number (10 digits).')
      return
    }

    // Optional validation for Aadhaar number if provided
    const cleanAadhar = aadharNumber.replace(/[\s-]/g, '')
    if (cleanAadhar && !/^[0-9]{12}$/.test(cleanAadhar)) {
      setProfileError('Aadhaar Card number must be exactly 12 numeric digits.')
      return
    }

    setProfileSaving(true)
    try {
      const response = await updateUserProfile(
        {
          name: name.trim(),
          phoneNumber: phoneNumber.trim(),
          aadharNumber: aadharNumber.trim(),
        },
        session?.token,
      )

      if (onUpdateUser && response.user) {
        onUpdateUser(response.user)
      }

      setProfileSuccess('Profile details updated successfully!')
      setIsEditingProfile(false)
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setProfileSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Workspace Settings & Preferences</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure active role persona, personal credentials, regional preferences, and notification channels.
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

        <div className="rounded-xl bg-muted/50 p-4 text-sm font-semibold capitalize text-primary">
          {role?.replaceAll('_', ' ')}
        </div>
      </section>

      {/* SECTION 2: User Profile & Account */}
      <section className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div>
            <h2 className="font-bold text-lg text-foreground">User Profile & Account Info</h2>
            <p className="text-xs text-muted-foreground">
              Manage your personal identification, phone number, and verified Aadhaar details.
            </p>
          </div>
          {!isEditingProfile ? (
            <button
              type="button"
              onClick={handleStartEdit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition"
            >
              <Edit2 size={13} />
              <span>Edit Details</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted transition"
            >
              <X size={13} />
              <span>Cancel</span>
            </button>
          )}
        </div>

        {profileSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-green-500/10 border border-green-500/20 p-3 text-xs text-green-700 dark:text-green-400">
            <CheckCircle size={15} className="shrink-0" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            <AlertCircle size={15} className="shrink-0" />
            <span>{profileError}</span>
          </div>
        )}

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User size={13} className="text-primary" /> Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                  Email Address <span className="text-[10px] font-normal">(Primary login identifier)</span>
                </label>
                <input
                  type="email"
                  disabled
                  value={session?.user?.email || session?.email || ''}
                  className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-muted-foreground cursor-not-allowed font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Phone size={13} className="text-primary" /> Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] text-muted-foreground">Used for SMS dispatch and pickup notifications.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <CreditCard size={13} className="text-primary" /> Aadhaar Card Number
                </label>
                <input
                  type="text"
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  placeholder="e.g. 1234 5678 9012 (12 digits)"
                  maxLength={14}
                  className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary font-mono"
                />
                <p className="text-[10px] text-muted-foreground">12-digit Indian Aadhaar card number for KYC verification.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Organization ID</label>
                <input
                  type="text"
                  disabled
                  value={session?.user?.organizationId || '507f1f77bcf86cd799439011'}
                  className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-muted-foreground cursor-not-allowed font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Region ID</label>
                <input
                  type="text"
                  disabled
                  value={session?.user?.regionId || '507f1f77bcf86cd799439012'}
                  className="w-full rounded-xl border border-border bg-muted/50 px-3.5 py-2.5 text-xs text-muted-foreground cursor-not-allowed font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={profileSaving}
                className="rounded-xl border border-border px-4 py-2 text-xs font-medium text-foreground hover:bg-muted transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={profileSaving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition disabled:opacity-50"
              >
                {profileSaving ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Save size={13} />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-muted/50 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <User size={13} className="text-primary" /> Full Name
              </span>
              <p className="font-bold text-sm text-foreground">
                {session?.user?.name || session?.name || 'Workspace User'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 space-y-1">
              <span className="text-muted-foreground font-medium">Email Address</span>
              <p className="font-bold text-sm text-foreground">
                {session?.user?.email || session?.email || 'user@agritrade.com'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Phone size={13} className="text-primary" /> Phone Number
              </span>
              {session?.user?.phoneNumber || session?.phoneNumber ? (
                <p className="font-semibold text-sm text-foreground">
                  {session?.user?.phoneNumber || session?.phoneNumber}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic flex items-center justify-between">
                  <span>Not provided</span>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="text-xs font-medium text-primary hover:underline not-italic"
                  >
                    + Add Phone
                  </button>
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <CreditCard size={13} className="text-primary" /> Aadhaar Card Number
              </span>
              {session?.user?.aadharNumber || session?.aadharNumber ? (
                <p className="font-mono font-semibold text-sm text-foreground">
                  {session?.user?.aadharNumber || session?.aadharNumber}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic flex items-center justify-between">
                  <span>Not provided</span>
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="text-xs font-medium text-primary hover:underline not-italic"
                  >
                    + Add Aadhaar
                  </button>
                </p>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 space-y-1">
              <span className="text-muted-foreground font-medium">Organization ID</span>
              <p className="font-mono text-xs text-foreground font-semibold">
                {session?.user?.organizationId || '507f1f77bcf86cd799439011'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 space-y-1">
              <span className="text-muted-foreground font-medium">Region ID</span>
              <p className="font-mono text-xs text-foreground font-semibold">
                {session?.user?.regionId || '507f1f77bcf86cd799439012'}
              </p>
            </div>
          </div>
        )}
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
