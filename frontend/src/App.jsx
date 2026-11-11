import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart,
  Bell,
  ChevronDown,
  CircleHelp,
  CloudSun,
  Compass,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Plus,
  Search,
  Settings,
  Package,
  Sun,
  Tractor,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react'
import { FarmMap } from './components/FarmMap'
import { OverviewPage } from './pages/OverviewPage'
import { MyFarmsPage } from './pages/MyFarmsPage'
import { ProduceLotsPage } from './pages/ProduceLotsPage'
import { MarketPage } from './pages/MarketPage'
import { SettingsPage } from './pages/SettingsPage'
import { LogisticsDeliveriesPage } from './pages/LogisticsDeliveriesPage'
import { LandingPage } from './pages/LandingPage'
import { requestAuth, signInWithGoogle } from './services/authService'
import { requestFarms, mapFarm } from './services/farmService'
import { requestWorkflow } from './services/workflowService'

const referenceImage = '/backgroundimg.jpg'
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



function mapLot(lot) {
  return {
    ...lot,
    id: lot._id || lot.id,
    lotCode: lot.lotCode || `LOT-${String(lot._id || lot.id).slice(-6)}`,
    category: lot.category,
    farmerName: lot.farmer?.name || lot.farmerName || 'Farmer name unavailable',
    farmName: lot.farm?.farmName || lot.farmName || 'Farm name unavailable',
    qualityGrade: lot.qualityGrade || 'Pending Inspection',
  }
}

function LoginScreen({ onLogin, onSignUp, onBackToHome }) {
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
        aria-label="AgriTrade farm operations visual"
      >
        <img src={referenceImage} alt="" className="absolute inset-0 h-full w-full object-fill" />
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(52,55,35,0.08)_0%,transparent_70%,rgba(239,233,215,0.9)_100%),linear-gradient(180deg,rgba(239,233,215,0.16)_0%,transparent_14%,transparent_86%,rgba(239,233,215,0.16)_100%)]" />
        <div className="login-brand-mark z-10 flex items-center gap-2 font-bold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-black shadow-sm select-none">AT</span>
          <span>AgriTrade</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-signup flex items-center justify-between">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition"
            >
              ← Back to Home
            </button>
          )}
          <span>
            Don&apos;t have an account?{' '}
            <button type="button" onClick={onSignUp}>
              Sign up
            </button>
          </span>
        </div>
        <div className="login-content">
          <div className="login-heading">
            <div className="login-icon font-black text-xs select-none">
              AT
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

function SignUpScreen({ onLogin, onSignUp, onBackToHome, initialRole = 'farmer' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState(initialRole || 'farmer')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialRole) setRole(initialRole)
  }, [initialRole])

  const googleSignUp = async () => {
    setError('')
    setLoading(true)
    try {
      onSignUp(await signInWithGoogle())
    } catch (authError) {
      setError(authError.message)
    } finally {
      setLoading(false)
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('Please enter your full name')
      return
    }
    if (!email.trim()) {
      setError('Please enter a valid email address')
      return
    }
    if (!password) {
      setError('Please create a password')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter confirmation password.')
      return
    }

    setLoading(true)
    try {
      const data = await requestAuth('register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        organizationId: defaultOrganizationId,
        regionId: defaultRegionId,
      })
      onSignUp(data)
    } catch (authError) {
      setError(authError.message || 'Registration failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const roleOptions = [
    { value: 'farmer', label: 'Farmer', desc: 'Register land parcels & crops' },
    { value: 'quality_inspector', label: 'Quality Inspector', desc: 'Inspect plots & grade harvest' },
    { value: 'buyer', label: 'Buyer', desc: 'Procure certified Grade crops' },
    { value: 'logistics_coordinator', label: 'Logistics', desc: 'Fleet dispatch & deliveries' },
  ]

  return (
    <main className="login-page">
      <section
        className="login-visual"
        aria-label="AgriTrade farm operations visual"
      >
        <img src={referenceImage} alt="" className="absolute inset-0 h-full w-full object-fill" />
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(52,55,35,0.08)_0%,transparent_70%,rgba(239,233,215,0.9)_100%),linear-gradient(180deg,rgba(239,233,215,0.16)_0%,transparent_14%,transparent_86%,rgba(239,233,215,0.16)_100%)]" />
        <div className="login-brand-mark z-10 flex items-center gap-2 font-bold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-black shadow-sm select-none">AT</span>
          <span>AgriTrade</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-signup flex items-center justify-between">
          {onBackToHome && (
            <button
              type="button"
              onClick={onBackToHome}
              className="text-xs font-semibold text-muted-foreground hover:text-primary transition"
            >
              ← Back to Home
            </button>
          )}
          <span>
            Already have an account?{' '}
            <button type="button" onClick={onLogin}>
              Login
            </button>
          </span>
        </div>
        <div className="login-content">
          <div className="login-heading">
            <div className="login-icon font-black text-xs select-none">
              AT
            </div>
            <h1>
              Create your <span>AgriTrade</span> account
            </h1>
            <p>
              Select your role and start managing your agricultural workspace.
            </p>
          </div>
          <button className="google-login" type="button" onClick={googleSignUp} disabled={loading}>
            <span className="google-g">G</span> {loading ? 'Connecting...' : 'Sign up with Google'}
          </button>
          <div className="login-divider">
            <span>OR REGISTER WITH EMAIL</span>
          </div>
          <form onSubmit={submit} className="login-form">
            <label>
              Full name
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Ramesh Patil"
                required
              />
            </label>
            <label>
              Email Address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@company.com"
                required
              />
            </label>

            {/* Public Role Selector (Farmer, Quality Inspector, Buyer, Logistics Coordinator) */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-muted-foreground block">Select Workspace Role</span>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRole(opt.value)}
                    className={`rounded-xl border p-2.5 text-left transition ${
                      role === opt.value
                        ? 'border-primary bg-primary/10 text-primary font-semibold'
                        : 'border-border bg-card/60 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <p className="text-xs font-bold leading-tight">{opt.label}</p>
                    <p className="text-[10px] opacity-80 mt-0.5 leading-snug">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Create password (min 8 characters)"
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
                placeholder="Confirm your password"
                minLength="8"
                required
              />
            </label>
            {confirmPassword && password !== confirmPassword && (
              <p className="login-error" role="alert">Passwords do not match.</p>
            )}
            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}
            <button className="login-submit" type="submit" disabled={loading}>
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

  const [authMode, setAuthMode] = useState(() => {
    try {
      const hash = window.location.hash.toLowerCase()
      if (hash.includes('signup') || hash.includes('register')) return 'signup'
      if (hash.includes('login')) return 'login'
      const search = new URLSearchParams(window.location.search)
      if (search.get('mode') === 'signup' || search.get('mode') === 'register') return 'signup'
      if (search.get('mode') === 'login') return 'login'
    } catch {
      // fallback
    }
    return 'landing'
  })
  const [preselectedRole, setPreselectedRole] = useState('farmer')
  const [active, setActive] = useState('Home')

  // Farms state
  const [farms, setFarms] = useState([])

  const [selectedFarm, setSelectedFarm] = useState(farms[0])
  const [showForm, setShowForm] = useState(false)
  const [points, setPoints] = useState([])
  const [finished, setFinished] = useState(false)
  const [farmArea, setFarmArea] = useState(null)
  const [farmName, setFarmName] = useState('')
  const [crop, setCrop] = useState('')
  const [cropHealth, setCropHealth] = useState('Healthy')
  const [expectedQuantity, setExpectedQuantity] = useState('1500')
  const [expectedHarvestDate, setExpectedHarvestDate] = useState(() => new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0])
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024
    }
    return true
  })
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [farmError, setFarmError] = useState('')
  const [darkMode, setDarkMode] = useState(() => window.localStorage.getItem('agritrade-theme') === 'dark')

  // Operational State
  const [lots, setLots] = useState([])
  const [shipments, setShipments] = useState([])
  const [purchaseOrders, setPurchaseOrders] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [availableBatches, setAvailableBatches] = useState([])

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

  useEffect(() => {
    if (!session?.token) return
    let activeRequest = true
    const loadWorkflow = async () => {
      try {
        const lotPath = currentRoleValue === 'buyer' ? '/available-batches' : '/lots'
        const lotData = await (lotPath === '/lots' ? fetch(`/api/lots`, { headers: { Authorization: `Bearer ${session.token}` } }).then((response) => response.json()) : requestWorkflow(lotPath, {}, session.token))
        if (activeRequest && Array.isArray(lotData) && lotData.length > 0) {
          const mappedLots = lotData.map(mapLot)
          setLots(mappedLots)
          const acceptedOnly = mappedLots.filter((lot) => lot.status === 'accepted')
          if (acceptedOnly.length > 0 || currentRoleValue === 'buyer') {
            setAvailableBatches(acceptedOnly.length > 0 ? acceptedOnly : mappedLots)
          }
        }
      } catch { /* dashboards retain their existing empty/demo state when the API is unavailable */ }
      if (['admin', 'platform_admin', 'buyer', 'farmer', 'logistics_coordinator'].includes(currentRoleValue)) {
        try {
          const orders = await requestWorkflow('/orders', {}, session.token)
        if (activeRequest) setPurchaseOrders(Array.isArray(orders) ? orders.map((order) => ({ ...order, id: order._id, reference: order.number, buyerName: order.buyer?.name, crop: order.crop, totalBudget: order.totalAmount })) : [])
        } catch { /* role-specific order access is enforced by the API */ }
      }
      if (currentRoleValue === 'logistics_coordinator' || currentRoleValue === 'admin' || currentRoleValue === 'platform_admin') {
        try {
          const shipmentData = await requestWorkflow('/shipments', {}, session.token)
          if (activeRequest) setShipments(Array.isArray(shipmentData) ? shipmentData.map((shipment) => ({ ...shipment, id: shipment._id, reference: shipment.shipmentNumber })) : [])
        } catch { /* leave the current dashboard state intact */ }
      }
    }
    loadWorkflow()
    return () => { activeRequest = false }
  }, [session, currentRoleValue])

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
              location: { address: 'Nashik Belt, Maharashtra, India' },
              cropHealth,
              expectedQuantity: Number(expectedQuantity) || 1500,
              expectedHarvestDate,
            }),
          },
          session.token
        )
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

  const handleDeleteFarm = async (farmId) => {
    if (!session?.token) {
      setFarmError('You must be signed in to delete a farm.')
      return
    }
    try {
      setFarmError('')
      await requestFarms(`/${farmId}`, { method: 'DELETE' }, session.token)
      const remaining = farms.filter((farm) => farm.id !== farmId)
      setFarms(remaining)
      if (selectedFarm?.id === farmId) setSelectedFarm(remaining[0] || null)
    } catch (error) {
      setFarmError(error.message)
    }
  }

  useEffect(() => {
    const isBuyer = currentRoleValue === 'buyer'
    const isQualityInspector = currentRoleValue === 'quality_inspector'
    const isLogisticsCoordinator = currentRoleValue === 'logistics_coordinator'
    const isFarmer = currentRoleValue === 'farmer'
    const canAccessFarms = !isBuyer && !isQualityInspector

    if (
      (isBuyer && active !== 'Market' && active !== 'Settings') ||
      (isQualityInspector && active !== 'Produce Lots' && active !== 'Settings') ||
      (isLogisticsCoordinator && active !== 'Deliveries' && active !== 'Settings') ||
      (isFarmer && active === 'Market') ||
      (!canAccessFarms && active === 'My Farms')
    ) {
      setActive(
        isBuyer
          ? 'Market'
          : isQualityInspector
            ? 'Produce Lots'
            : isLogisticsCoordinator
              ? 'Deliveries'
              : isFarmer && active === 'Market'
                ? 'My Farms'
                : 'Home',
      )
    }
  }, [active, currentRoleValue])

  const handleUpdateUser = (updatedUser) => {
    setSession((current) => {
      if (!current) return current
      const updated = {
        ...current,
        user: {
          ...current.user,
          ...updatedUser,
        },
      }
      try {
        window.localStorage.setItem('agritrade-session', JSON.stringify(updated))
      } catch {
        /* storage not available */
      }
      return updated
    })
  }

  if (!session) {
    if (authMode === 'landing') {
      return (
        <LandingPage
          onLogin={() => setAuthMode('login')}
          onRegister={() => {
            setPreselectedRole('farmer')
            setAuthMode('signup')
          }}
          onRoleRegister={(role) => {
            setPreselectedRole(role)
            setAuthMode('signup')
          }}
          onGoToDashboard={() => setAuthMode('login')}
        />
      )
    }
    if (authMode === 'signup') {
      return (
        <SignUpScreen
          initialRole={preselectedRole}
          onLogin={() => setAuthMode('login')}
          onBackToHome={() => setAuthMode('landing')}
          onSignUp={saveSession}
        />
      )
    }
    return (
      <LoginScreen
        onLogin={saveSession}
        onBackToHome={() => setAuthMode('landing')}
        onSignUp={() => setAuthMode('signup')}
      />
    )
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
  const isBuyerWorkspace = currentRoleValue === 'buyer'
  const isQualityInspectionWorkspace = currentRoleValue === 'quality_inspector'
  const isLogisticsWorkspace = currentRoleValue === 'logistics_coordinator'
  const isFarmerWorkspace = currentRoleValue === 'farmer'
  const canAccessMyFarms = !isBuyerWorkspace && currentRoleValue !== 'quality_inspector'

  const navItems = isBuyerWorkspace
    ? [
        { label: 'Market', icon: AreaChart },
        { label: 'Settings', icon: Settings },
      ]
    : isQualityInspectionWorkspace
      ? [
          { label: 'Produce Lots', icon: Package },
          { label: 'Settings', icon: Settings },
        ]
      : isLogisticsWorkspace
        ? [
            { label: 'Deliveries', icon: Tractor },
            { label: 'Settings', icon: Settings },
          ]
        : isFarmerWorkspace
          ? [
              { label: 'Home', icon: Home },
              { label: 'My Farms', icon: MapPin },
              { label: 'Produce Lots', icon: Package },
              { label: 'Settings', icon: Settings },
            ]
    : [
        { label: 'Home', icon: Home },
        ...(canAccessMyFarms ? [{ label: 'My Farms', icon: MapPin }] : []),
        { label: 'Produce Lots', icon: Package },
        { label: 'Market', icon: AreaChart },
        { label: 'Settings', icon: Settings },
      ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-border bg-card transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-border px-6">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xs tracking-tight shadow-sm select-none">
            AT
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold tracking-tight truncate">AgriTrade</p>
            <p className="text-xs text-muted-foreground truncate">{account.workspace}</p>
          </div>
          <button
            type="button"
            className="flex items-center justify-center rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            onClick={() => setSidebarOpen(false)}
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-4">
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                setActive(label)
                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                  setSidebarOpen(false)
                }
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

        {/* Authenticated role badge */}
        <div className="m-4 rounded-2xl bg-secondary p-4 text-xs space-y-2">
          <p className="font-semibold text-primary">Role: {account.label}</p>
          <p className="text-muted-foreground text-[11px]">Managed by your authenticated account.</p>
        </div>
      </aside>

      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-xs lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <main className={`transition-[padding] duration-300 ease-in-out ${sidebarOpen ? 'lg:pl-64' : 'pl-0'}`}>
        {/* Top Header */}
        <header className="flex h-20 items-center justify-between border-b border-border bg-card/80 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? 'Collapse left navigation' : 'Expand left navigation'}
              title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <Menu size={20} />
            </button>
            <div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex">
              <span>Workspace</span>
              <span>/</span>
              <span className="font-medium text-foreground">{active}</span>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-[10px] font-black select-none">AT</span>
              <span className="font-bold">AgriTrade</span>
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

            {/* Profile Menu & Logout */}
            <div className="relative flex items-center gap-1.5">
              <button
                type="button"
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

              {/* Logout button beside username after down toggle */}
              <button
                type="button"
                onClick={logout}
                title="Log out"
                className="flex items-center gap-1.5 rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive hover:text-destructive-foreground transition shadow-xs"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Log out</span>
              </button>

              {/* Dropdown Menu below username when toggle is clicked */}
              {accountMenuOpen && (
                <div
                  className="absolute right-0 top-12 z-30 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl space-y-1"
                  role="menu"
                >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-bold text-foreground">{userName}</p>
                    <p className="text-[11px] text-muted-foreground">{session?.user?.email || 'user@agritrade.com'}</p>
                    <span className="mt-1 inline-block rounded-md bg-secondary px-2 py-0.5 text-[10px] font-semibold text-primary capitalize">
                      {account.label}
                    </span>
                  </div>

                  {/* Settings Button below user name in dropdown */}
                  <div className="pt-1">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-semibold text-foreground hover:bg-muted transition"
                      onClick={() => {
                        setActive('Settings')
                        setAccountMenuOpen(false)
                      }}
                      role="menuitem"
                    >
                      <Settings size={15} className="text-primary" />
                      <span>Settings</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <div className="mx-auto max-w-[1500px] p-5 md:p-8">
          {(active === 'Home' || active === 'Overview') && !isBuyerWorkspace && !isQualityInspectionWorkspace && !isLogisticsWorkspace && (
            <OverviewPage
              role={currentRoleValue}
              userName={userName}
              session={session}
              farms={farms}
              selectedFarm={selectedFarm}
              setSelectedFarm={setSelectedFarm}
              setShowForm={setShowForm}
              setActiveTab={setActive}
              lots={lots}
              shipments={shipments}
              purchaseOrders={purchaseOrders}
              warehouses={warehouses}
              onAssignShipment={async (shipmentId, vehicleId) => {
                const saved = await requestWorkflow(`/shipments/${shipmentId}/assign`, { method: 'PUT', body: JSON.stringify({ vehicleId }) }, session.token)
                setShipments((current) => current.map((shipment) => shipment.id === shipmentId ? { ...shipment, ...saved } : shipment))
              }}
              onDispatchShipment={async (shipmentId) => {
                const saved = await requestWorkflow(`/shipments/${shipmentId}/dispatch`, { method: 'PUT', body: JSON.stringify({}) }, session.token)
                setShipments((current) => current.map((shipment) => shipment.id === shipmentId ? { ...shipment, ...saved } : shipment))
              }}
            />
          )}

          {active === 'My Farms' && canAccessMyFarms && (
            <MyFarmsPage
              role={currentRoleValue}
              farms={farms}
              selectedFarm={selectedFarm}
              setSelectedFarm={setSelectedFarm}
              setShowForm={setShowForm}
              onDeleteFarm={handleDeleteFarm}
              onRequestInspection={async (farmId, inspectionData) => {
                if (!session?.token) return
                const res = await fetch(`/api/farms/${farmId}/request-inspection`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${session.token}`,
                  },
                  body: JSON.stringify(inspectionData),
                })
                const saved = await res.json()
                if (!res.ok) throw new Error(saved.message || 'Failed to submit inspection request')
                setFarms((current) =>
                  current.map((f) => (f.id === farmId || f._id === farmId) ? { ...f, inspectionStatus: 'pending' } : f)
                )
                if (saved.lot) {
                  const mapped = mapLot(saved.lot)
                  setLots((current) => [mapped, ...current])
                }
                return saved
              }}
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

          {active === 'Produce Lots' && !isBuyerWorkspace && (
            <ProduceLotsPage
              role={currentRoleValue}
              lots={lots}
              farms={farms}
              session={session}
              onCreateLot={async (newLot) => {
                if (!session?.token) return setLots([newLot, ...lots])
                const response = await fetch('/api/lots', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` }, body: JSON.stringify({ category: newLot.category, quantity: newLot.quantity, unit: newLot.unit, farmer: session.user.id, farm: farms[0]?.id }) })
                const saved = await response.json()
                if (!response.ok) throw new Error(saved.message || 'Unable to create harvest batch')
                const mappedLot = mapLot(saved)
                setLots((current) => [mappedLot, ...current])
                return mappedLot
              }}
              onInspectLot={async (lotId, inspection) => {
                const targetLot = lots.find((l) => l.id === lotId || l._id === lotId)
                const saved = await requestWorkflow('/inspections', { method: 'POST', body: JSON.stringify({ batchId: lotId, category: targetLot?.category || inspection.category, grade: inspection.grade ? inspection.grade.replace('Grade ', '') : 'A', rating: inspection.rating || 4.5, measuredQuantity: inspection.measuredQuantity, remarks: inspection.notes, accepted: inspection.accepted }) }, session.token)
                const mapped = mapLot(saved)
                setLots((current) => current.map((lot) => (lot.id === lotId || lot._id === lotId) ? mapped : lot))
                setAvailableBatches((current) => [mapped, ...current.filter((l) => l.id !== lotId && l._id !== lotId)])
                return mapped
              }}
              onWarehouseMove={() => undefined}
              onDispatchShipment={() => undefined}
              onDeliverShipment={() => undefined}
            />
          )}

          {active === 'Deliveries' && isLogisticsWorkspace && (
            <LogisticsDeliveriesPage
              shipments={shipments}
              onAcceptOrder={async (shipmentId, assignment) => {
                const saved = await requestWorkflow(
                  `/shipments/${shipmentId}/accept`,
                  {
                    method: 'PUT',
                    body: JSON.stringify(assignment),
                  },
                  session.token
                )
                const mapped = { ...saved, id: saved._id, reference: saved.shipmentNumber }
                setShipments((current) =>
                  current.map((s) => (s.id === shipmentId || s._id === shipmentId) ? mapped : s)
                )
                return mapped
              }}
              onMarkDelivered={async (shipmentId) => {
                const saved = await requestWorkflow(`/shipments/${shipmentId}/status`, { method: 'PUT', body: JSON.stringify({ status: 'delivered' }) }, session.token)
                setShipments((current) => current.map((shipment) => (shipment.id === shipmentId || shipment._id === shipmentId) ? { ...shipment, ...saved } : shipment))
                setLots((current) => current.map((lot) => (lot.id === saved.lot || lot._id === saved.lot) ? { ...lot, status: 'delivered' } : lot))
              }}
            />
          )}

          {active === 'Market' && !isQualityInspectionWorkspace && !isFarmerWorkspace && (
            <MarketPage
              role={currentRoleValue}
              purchaseOrders={purchaseOrders}
              lots={lots}
              availableBatches={availableBatches}
              onCreatePO={(newPO) => setPurchaseOrders([newPO, ...purchaseOrders])}
              onPurchaseBatch={async (batchId, order) => {
                const saved = await requestWorkflow('/orders', { method: 'POST', body: JSON.stringify({ batchId, quantity: order.quantity, buyerLocation: order.buyerLocation }) }, session.token)
                const mappedPO = { ...saved, id: saved._id, reference: saved.number, crop: saved.crop, totalBudget: saved.totalAmount }
                setPurchaseOrders((current) => [mappedPO, ...current])
                if (saved.shipment) {
                  const newShipment = typeof saved.shipment === 'object' ? { ...saved.shipment, id: saved.shipment._id, reference: saved.shipment.shipmentNumber, order: saved } : null
                  if (newShipment) setShipments((current) => [newShipment, ...current])
                }
                // Refresh shipments list for logistics
                try {
                  const updatedShipments = await requestWorkflow('/shipments', {}, session.token)
                  if (Array.isArray(updatedShipments)) {
                    setShipments(updatedShipments.map((s) => ({ ...s, id: s._id, reference: s.shipmentNumber })))
                  }
                } catch { /* retain existing state */ }
                setAvailableBatches((current) => current.map((b) => b.id === batchId ? { ...b, availableQuantity: Math.max(0, (b.availableQuantity || b.quantity) - order.quantity) } : b).filter((b) => (b.availableQuantity ?? 1) > 0))
              }}
            />
          )}

          {active === 'Settings' && (
            <SettingsPage
              session={session}
              role={currentRoleValue}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              onUpdateUser={handleUpdateUser}
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
              <div className="flex flex-col gap-3 p-5 overflow-y-auto max-h-[80vh]">
                <label className="text-xs font-semibold text-foreground">
                  Farm Name
                  <input
                    value={farmName}
                    onChange={(event) => setFarmName(event.target.value)}
                    placeholder="e.g. Nashik Mango Grove"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </label>
                <label className="text-xs font-semibold text-foreground">
                  Primary Crop
                  <input
                    value={crop}
                    onChange={(event) => setCrop(event.target.value)}
                    placeholder="e.g. Organic Alphonso Mangoes"
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
                  />
                </label>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label className="font-semibold text-foreground">
                    Crop Health
                    <select
                      value={cropHealth}
                      onChange={(e) => setCropHealth(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary"
                    >
                      <option value="Excellent">Excellent</option>
                      <option value="Healthy">Healthy</option>
                      <option value="Good">Good</option>
                      <option value="Moderate">Moderate</option>
                    </select>
                  </label>
                  <label className="font-semibold text-foreground">
                    Expected Yield (kg)
                    <input
                      type="number"
                      value={expectedQuantity}
                      onChange={(e) => setExpectedQuantity(e.target.value)}
                      placeholder="1500"
                      className="mt-1 w-full rounded-xl border border-border bg-background px-2.5 py-2 text-xs outline-none focus:border-primary"
                    />
                  </label>
                </div>

                <label className="text-xs font-semibold text-foreground">
                  Expected Harvesting Date
                  <input
                    type="date"
                    value={expectedHarvestDate}
                    onChange={(e) => setExpectedHarvestDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs outline-none focus:border-primary"
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
                  editable={['farmer', 'admin'].includes(currentRoleValue)}
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
