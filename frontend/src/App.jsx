import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart,
  Bell,
  ChevronDown,
  CircleHelp,
  CloudSun,
  Compass,
  FileText,
  LayoutDashboard,
  Leaf,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Sprout,
  Sun,
  Tractor,
  TrendingUp,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { FarmMap } from './components/FarmMap'
import { OverviewPage } from './components/OverviewPage'
import { MyFarmsPage } from './components/MyFarmsPage'
import { ProduceLotsPage } from './components/ProduceLotsPage'
import { MarketPage } from './components/MarketPage'
import { SettingsPage } from './components/SettingsPage'
import { firebaseAuth } from './firebase'

const referenceImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-09-07%20183007-1ZZ814lv9Jftsz45jf0tRvpAGec7FV.png'
const defaultOrganizationId = '507f1f77bcf86cd799439011'
const defaultRegionId = '507f1f77bcf86cd799439012'

const accountTypes = [
  { value: 'platform_admin', label: 'Platform Admin', workspace: 'Platform administration' },
  { value: 'farmer', label: 'Farmer', workspace: 'Farmer workspace' },
  { value: 'collection_center_manager', label: 'Collection Center Manager', workspace: 'Collection center workspace' },
  { value: 'quality_inspector', label: 'Quality Inspector', workspace: 'Quality inspection workspace' },
  { value: 'buyer', label: 'Buyer', workspace: 'Buyer workspace' },
  { value: 'logistics_coordinator', label: 'Logistics Coordinator', workspace: 'Logistics workspace' },
]

async function requestAuth(path, payload) {
  const response = await fetch(`/api/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Unable to complete authentication')
  return data
}

async function signInWithGoogle() {
  const result = await signInWithPopup(firebaseAuth, new GoogleAuthProvider())
  const idToken = await result.user.getIdToken()
  return requestAuth('firebase', { idToken })
}

function mapFarm(farm) {
  const points = farm.boundary?.coordinates?.[0] || []
  const closedPoints =
    points.length > 1 && points[0][0] === points.at(-1)[0] && points[0][1] === points.at(-1)[1]
      ? points.slice(0, -1)
      : points
  return {
    id: farm._id || farm.id || String(Math.random()),
    name: farm.farmName || farm.name || 'Agri Parcel',
    location: farm.location?.address || farm.location || 'Location not provided',
    crop: farm.crops?.[0] || farm.crop || 'Grapes',
    area: farm.areaAcres || farm.area || 4.5,
    status: 'Verified',
    points: closedPoints.length ? closedPoints : [[78.96, 20.59], [78.97, 20.59], [78.97, 20.60]],
  }
}

async function requestFarms(path, options, token) {
  const response = await fetch(`/api/farms${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options?.headers || {}) },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Unable to load farms')
  return data
}

function LoginScreen({ onLogin, onSignUp }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const googleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      onLogin(await signInWithGoogle())
    } catch (authError) {
      setError(authError.message)
    } finally {
      setLoading(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await requestAuth('login', { email, password })
      onLogin(data)
    } catch (authError) {
      setError(authError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section
        className="login-visual"
        style={{ backgroundImage: `url(${referenceImage})` }}
        aria-label="AgriTrade farm operations visual"
      >
        <div className="login-visual-shade" />
        <div className="login-stat login-stat-orange">
          <strong>41%</strong>
          <span>of farmers say accurate land data is the hardest part of planning.</span>
        </div>
        <div className="login-stat login-stat-green">
          <strong>76%</strong>
          <span>of farm teams say connected operations are their greatest advantage.</span>
        </div>
        <div className="login-brand-mark">
          <Leaf size={20} /> AgriTrade
        </div>
      </section>
      <section className="login-panel">
        <div className="login-signup">
          Don&apos;t have an account?{' '}
          <button type="button" onClick={onSignUp}>
            Sign up
          </button>
        </div>
        <div className="login-content">
          <div className="login-heading">
            <div className="login-icon">
              <Leaf size={18} />
            </div>
            <h1>
              Sign in to <span>AgriTrade</span>
            </h1>
            <p>
              Welcome back. Please enter your login details
              <br />
              to continue to your farm workspace.
            </p>
          </div>
          <button className="google-login" type="button" onClick={googleLogin} disabled={loading}>
            <span className="google-g">G</span> {loading ? 'Connecting...' : 'Sign in with Google'}
          </button>
          <div className="login-divider">
            <span>OR</span>
          </div>
          <form onSubmit={submit} className="login-form">
            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email Address"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Password"
                required
              />
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '4px 0 8px' }}>
              <button
                className="login-forgot"
                type="button"
                onClick={() => {
                  setEmail('farmer@agritrade.com')
                  setPassword('Farmer123!')
                }}
              >
                Fill Demo Account
              </button>
              <button className="login-forgot" type="button">
                Forgot the password?
              </button>
            </div>
            {error && (
              <p className="login-error" role="alert">
                {error === 'Invalid credentials'
                  ? 'Invalid email or password. Please check your credentials or click Sign up to create an account.'
                  : error}
              </p>
            )}
            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

function SignUpScreen({ onLogin, onSignUp }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [accountType, setAccountType] = useState('farmer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const canSubmit = name.trim() && email.trim() && password.trim() && password === confirmPassword

  const googleSignUp = async () => {
    setError('')
    setLoading(true)
    try {
      onSignUp(await signInWithGoogle())
    } catch (authError) {
      setError(authError.message)
    } className="login-page"
  }

  const submit = async (event) => {
    event.preventDefault()
    if (!canSubmit) return
    setError('')
    setLoading(true)
    try {
      const data = await requestAuth('register', {
        name,
        email,
        password,
        role: accountType,
        organizationId: defaultOrganizationId,
        regionId: defaultRegionId,
      })
      onSignUp(data)
    } catch (authError) {
      setError(authError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-page">
      <section
        className="login-visual"
        style={{ backgroundImage: `url(${referenceImage})` }}
        aria-label="AgriTrade farm operations visual"
      >
        <div className="login-visual-shade" />
        <div className="login-stat login-stat-orange">
          <strong>41%</strong>
          <span>of farmers say accurate land data is the hardest part of planning.</span>
        </div>
        <div className="login-stat login-stat-green">
          <strong>76%</strong>
          <span>of farm teams say connected operations are their greatest advantage.</span>
        </div>
        <div className="login-brand-mark">
          <Leaf size={20} /> AgriTrade
        </div>
      </section>
      <section className="login-panel">
        <div className="login-signup">
          Already have an account?{' '}
          <button type="button" onClick={onLogin}>
            Login
          </button>
        </div>
        <div className="login-content">
          <div className="login-heading">
            <div className="login-icon">
              <Leaf size={18} />
            </div>
            <h1>
              Create your <span>AgriTrade</span> account
            </h1>
            <p>
              Join your connected farm workspace
              <br />
              and manage every operation in one place.
            </p>
          </div>
          <button className="google-login" type="button" onClick={googleSignUp} disabled={loading}>
            <span className="google-g">G</span> {loading ? 'Connecting...' : 'Sign up with Google'}
          </button>
          <div className="login-divider">
            <span>OR</span>
          </div>
          <form onSubmit={submit} className="login-form">
            <label>
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Full name"
                required
              />
            </label>
            <label>
              Account type
              <select value={accountType} onChange={(event) => setAccountType(event.target.value)} required>
                {accountTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="Email Address"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create a password"
                minLength="8"
                required
              />
            </label>
            <label>
              Confirm password
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm password"
                minLength="8"
                required
              />
            </label>
            {confirmPassword && password !== confirmPassword && <p className="login-error">Passwords do not match.</p>}
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}
            <button className="login-submit" type="submit" disabled={!canSubmit || loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default function App() {
  const [session, setSession] = useState(() => {
    try {
      const googleSession = new URLSearchParams(window.location.hash.slice(1)).get('google-session')
      if (googleSession) {
        const data = JSON.parse(decodeURIComponent(googleSession))
        window.history.replaceState(null, '', window.location.pathname + window.location.search)
        window.localStorage.setItem('agritrade-session', JSON.stringify(data))
        return data
      }
      return JSON.parse(window.localStorage.getItem('agritrade-session') || 'null')
    } catch {
      return null
    }
  })

  const [authMode, setAuthMode] = useState('login')
  const [active, setActive] = useState('Overview')

  // Farms state
  const [farms, setFarms] = useState([
    {
      id: 'f1',
      name: 'Nashik Vineyard Grove',
      location: 'Nashik Agro Belt, Maharashtra',
      crop: 'Organic Grapes',
      area: 6.8,
      status: 'Verified',
      points: [
        [73.7898, 19.9975],
        [73.7925, 19.9975],
        [73.7925, 19.9992],
        [73.7898, 19.9992],
      ],
    },
    {
      id: 'f2',
      name: 'Vidarbha Cotton Estate',
      location: 'Nagpur District, Maharashtra',
      crop: 'Cotton Bales',
      area: 12.4,
      status: 'Verified',
      points: [
        [79.0882, 21.1458],
        [79.092, 21.1458],
        [79.092, 21.1495],
        [79.0882, 21.1495],
      ],
    },
    {
      id: 'f3',
      name: 'Deccan Wheat & Grain Farm',
      location: 'Pune Rural, Maharashtra',
      crop: 'Khapli Wheat',
      area: 8.2,
      status: 'Verified',
      points: [
        [73.8567, 18.5204],
        [73.86, 18.5204],
        [73.86, 18.524],
        [73.8567, 18.524],
      ],
    },
  ])

  const [selectedFarm, setSelectedFarm] = useState(farms[0])
  const [showForm, setShowForm] = useState(false)
  const [points, setPoints] = useState([])
  const [finished, setFinished] = useState(false)
  const [farmArea, setFarmArea] = useState(null)
  const [farmName, setFarmName] = useState('')
  const [crop, setCrop] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [farmError, setFarmError] = useState('')
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem('agritrade-theme') === 'dark')

  // Operational State
  const [lots, setLots] = useState([])
  const [shipments, setShipments] = useState([
    { id: 's1', reference: 'SHP-2026-001', vehicle: 'MH-12-AB-4081', status: 'in_transit', driver: 'Suresh Kumar' },
    { id: 's2', reference: 'SHP-2026-002', vehicle: 'MH-14-GH-9912', status: 'dispatched', driver: 'Ramesh Pawar' },
  ])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [warehouses, setWarehouses] = useState([])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    window.localStorage.setItem('agritrade-theme', darkMode ? 'dark' : 'light')
  }, [darkMode])

  // Sync Farms from Backend API
  useEffect(() => {
    if (!session?.token) return
    let activeRequest = true
    requestFarms('/my-farms', {}, session.token)
      .then((data) => {
        if (!activeRequest) return
        if (data && Array.isArray(data) && data.length > 0) {
          const savedFarms = data.map(mapFarm)
          setFarms(savedFarms)
          setSelectedFarm(savedFarms[0])
        }
      })
      .catch(() => undefined)
    return () => {
      activeRequest = false
    }
  }, [session])

  const saveSession = (data) => {
    setSession(data)
    window.localStorage.setItem('agritrade-session', JSON.stringify(data))
  }

  const logout = () => {
    setSession(null)
    setAccountMenuOpen(false)
    window.localStorage.removeItem('agritrade-session')
  }

  // Active Role Persona Switcher
  const currentRoleValue = session?.user?.role || session?.role || 'farmer'

  const handleRoleChange = (newRole) => {
    const updated = {
      ...session,
      role: newRole,
      user: session?.user ? { ...session.user, role: newRole } : { role: newRole, name: session?.name || 'Workspace User' },
    }
    saveSession(updated)
  }

  const addFarm = async () => {
    if (!farmName.trim() || !crop.trim() || !finished || !farmArea || points.length < 3) return
    try {
      setFarmError('')
      let savedFarm
      if (session?.token) {
        savedFarm = await requestFarms(
          '/',
          {
            method: 'POST',
            body: JSON.stringify({
              farmName: farmName.trim(),
              crops: [crop.trim()],
              coordinates: points,
              location: { address: 'Nashik Belt, MH' },
            }),
          },
          session.token
        )
      } else {
        savedFarm = {
          _id: String(Date.now()),
          farmName: farmName.trim(),
          crops: [crop.trim()],
          boundary: { coordinates: [points] },
          areaAcres: farmArea.acres,
          location: { address: 'Nashik Belt, MH' },
        }
      }
      const next = mapFarm(savedFarm)
      setFarms((current) => [...current, next])
      setSelectedFarm(next)
      setFarmName('')
      setCrop('')
      setPoints([])
      setFarmArea(null)
      setFinished(false)
      setShowForm(false)
    } catch (error) {
      setFarmError(error.message)
    }
  }

  const handleDeleteFarm = (farmId) => {
    setFarms((current) => current.filter((f) => f.id !== farmId))
    if (selectedFarm?.id === farmId) {
      setSelectedFarm(farms.find((f) => f.id !== farmId) || null)
    }
  }

  if (!session) {
    if (authMode === 'signup') return <SignUpScreen onLogin={() => setAuthMode('login')} onSignUp={saveSession} />
    return <LoginScreen onLogin={saveSession} onSignUp={() => setAuthMode('signup')} />
  }

  const account = accountTypes.find((type) => type.value === currentRoleValue) || accountTypes[1]
  const userName = session?.user?.name || session?.name || 'Workspace user'
  const userInitials =
    userName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('') || 'WU'

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard },
    { label: 'My Farms', icon: Leaf },
    { label: 'Produce Lots', icon: Sprout },
    { label: 'Market', icon: AreaChart },
    { label: 'Settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border bg-card transition-transform lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-border px-7">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Leaf size={20} />
          </div>
          <div>
            <p className="font-semibold tracking-tight">AgriTrade</p>
            <p className="text-xs text-muted-foreground">{account.workspace}</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                setActive(label)
                setMenuOpen(false)
              }}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                active === label
                  ? 'bg-secondary text-primary font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={18} />
              {label}
              {label === 'My Farms' && (
                <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{farms.length}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Role Persona Badge in Sidebar */}
        <div className="m-4 rounded-2xl bg-secondary p-4 text-xs space-y-2">
          <p className="font-semibold text-primary">Active Persona: {account.label}</p>
          <p className="text-muted-foreground text-[11px]">
            Switch workspace role anytime in top user menu or Settings page.
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:pl-64">
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b border-border bg-card/80 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
              <span>Workspace</span>
              <span>/</span>
              <span className="font-medium text-foreground">{active}</span>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <Leaf size={18} className="text-primary" />
              <span className="font-semibold">AgriTrade</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="relative rounded-xl p-2.5 text-muted-foreground hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" />
            </button>

            <button
              className="rounded-xl p-2.5 text-muted-foreground hover:bg-muted"
              onClick={() => setDarkMode((dark) => !dark)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="hidden h-7 w-px bg-border sm:block" />

            {/* Profile & Role Switcher Menu */}
            <div className="relative">
              <button
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-muted transition"
                onClick={() => setAccountMenuOpen((open) => !open)}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                  {userInitials}
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold leading-tight">{userName}</p>
                  <p className="text-xs text-primary font-medium">{account.label}</p>
                </div>
                <ChevronDown
                  size={15}
                  className={`hidden text-muted-foreground transition-transform md:block ${
                    accountMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {accountMenuOpen && (
                <div
                  className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl space-y-1"
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-bold text-foreground">{userName}</p>
                    <p className="text-[11px] text-muted-foreground">{session?.user?.email || 'user@agritrade.com'}</p>
                  </div>

                  <p className="px-3 pt-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Switch Workspace Role Persona
                  </p>
                  {accountTypes.map((type) => (
                    <button
                      key={type.value}
                      onClick={() => {
                        handleRoleChange(type.value)
                        setAccountMenuOpen(false)
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs text-left transition ${
                        currentRoleValue === type.value
                          ? 'bg-secondary text-primary font-bold'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <span>{type.label}</span>
                      {currentRoleValue === type.value && <UserCheck size={14} />}
                    </button>
                  ))}

                  <div className="border-t border-border pt-1">
                    <button
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-xs text-destructive hover:bg-destructive/10 transition"
                      onClick={logout}
                      role="menuitem"
                    >
                      <LogOut size={16} /> Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <div className="mx-auto max-w-[1500px] p-5 md:p-8">
          {active === 'Overview' && (
            <OverviewPage
              role={currentRoleValue}
              userName={userName}
              farms={farms}
              selectedFarm={selectedFarm}
              setSelectedFarm={setSelectedFarm}
              setShowForm={setShowForm}
              setActiveTab={setActive}
              lots={lots}
              shipments={shipments}
              purchaseOrders={purchaseOrders}
              warehouses={warehouses}
            />
          )}

          {active === 'My Farms' && (
            <MyFarmsPage
              role={currentRoleValue}
              farms={farms}
              selectedFarm={selectedFarm}
              setSelectedFarm={setSelectedFarm}
              setShowForm={setShowForm}
              onDeleteFarm={handleDeleteFarm}
              points={points}
              setPoints={setPoints}
              finished={finished}
              setFinished={setFinished}
              farmArea={farmArea}
              setFarmArea={setFarmArea}
              farmName={farmName}
              setFarmName={setFarmName}
              crop={crop}
              setCrop={setCrop}
              addFarm={addFarm}
              farmError={farmError}
            />
          )}

          {active === 'Produce Lots' && (
            <ProduceLotsPage
              role={currentRoleValue}
              lots={lots}
              farms={farms}
              session={session}
              onCreateLot={(newLot) => setLots([newLot, ...lots])}
              onInspectLot={() => undefined}
              onWarehouseMove={() => undefined}
              onDispatchShipment={() => undefined}
              onDeliverShipment={() => undefined}
            />
          )}

          {active === 'Market' && (
            <MarketPage
              role={currentRoleValue}
              purchaseOrders={purchaseOrders}
              lots={lots}
              onCreatePO={(newPO) => setPurchaseOrders([newPO, ...purchaseOrders])}
            />
          )}

          {active === 'Settings' && (
            <SettingsPage
              session={session}
              role={currentRoleValue}
              onRoleChange={handleRoleChange}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              accountTypes={accountTypes}
            />
          )}
        </div>
      </main>

      {/* Add New Farm Modal */}
      {showForm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-foreground/30 p-4" role="dialog">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-xl border border-border">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div>
                <h2 className="text-lg font-semibold">Mark & Save Farm Boundary</h2>
                <p className="mt-1 text-sm text-muted-foreground">Click the map to mark at least three boundary points.</p>
              </div>
              <button onClick={() => setShowForm(false)} aria-label="Close">
                <X size={20} />
              </button>
            </div>
            <div className="grid md:grid-cols-[1fr_1.2fr]">
              <div className="flex flex-col gap-4 p-5">
                <label className="text-sm font-medium">
                  Farm Name
                  <input
                    value={farmName}
                    onChange={(event) => setFarmName(event.target.value)}
                    placeholder="e.g. Nashik Mango Grove"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <label className="text-sm font-medium">
                  Primary Crop
                  <input
                    value={crop}
                    onChange={(event) => setCrop(event.target.value)}
                    placeholder="e.g. Organic Grapes"
                    className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </label>
                <div className="rounded-xl bg-secondary p-4 text-sm">
                  <div className="flex items-center gap-2 font-medium text-primary">
                    <Compass size={16} /> Boundary points
                  </div>
                  <p className="mt-2 text-muted-foreground">
                    {points.length} points marked.{' '}
                    {finished && farmArea
                      ? `Calculated area: ${farmArea.acres.toFixed(2)} acres (${farmArea.hectares.toFixed(2)} ha).`
                      : 'Finish the boundary to calculate area.'}
                  </p>
                </div>
                {farmError && <p className="text-xs text-destructive">{farmError}</p>}
                <button
                  disabled={points.length < 3 || !finished || !farmName.trim() || !crop.trim() || !farmArea}
                  onClick={addFarm}
                  className="mt-auto rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90 transition"
                >
                  Save Farm Parcel
                </button>
              </div>

              <div className="min-h-[340px] bg-muted">
                <FarmMap
                  points={points}
                  onAdd={(point) => {
                    setPoints((current) => [...current, point])
                    setFarmArea(null)
                  }}
                  onUndo={() => {
                    setPoints((current) => current.slice(0, -1))
                    setFarmArea(null)
                    setFinished(false)
                  }}
                  onClear={() => {
                    setPoints([])
                    setFarmArea(null)
                    setFinished(false)
                  }}
                  onFinish={(area) => {
                    setFarmArea(area)
                    setFinished(true)
                  }}
                  onEdit={() => {
                    setFinished(false)
                    setFarmArea(null)
                  }}
                  finished={finished}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
