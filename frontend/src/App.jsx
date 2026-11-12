import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart,
  ArrowLeft,
  Award,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  CloudSun,
  Compass,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  MapPin,
  Maximize2,
  Menu,
  Minimize2,
  Moon,
  Plus,
  Search,
  Settings,
  ShoppingBag,
  Sparkles,
  Package,
  Sun,
  Tractor,
  TrendingUp,
  Truck,
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
import { SevakAIPage } from './pages/SevakAIPage'
import { LogisticsDeliveriesPage } from './pages/LogisticsDeliveriesPage'
import { LandingPage } from './pages/LandingPage'
import { requestAuth, signInWithGoogle } from './services/authService'
import { requestFarms, mapFarm } from './services/farmService'
import { requestWorkflow } from './services/workflowService'
import { apiRequest, isTokenExpired } from './services/api'

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
    lotCode: lot.lotCode || (lot._id || lot.id ? `LOT-${String(lot._id || lot.id).slice(-6)}` : 'LOT-PENDING'),
    category: lot.category,
    farmerName: lot.farmer?.name || lot.farmerName || 'Farmer name unavailable',
    farmName: lot.farm?.farmName || lot.farm?.name || lot.farmName || 'Farm unassigned',
    qualityGrade: lot.qualityGrade || 'Pending Inspection',
    cropHealth: lot.cropHealth || 'Healthy',
    expectedHarvestDate: lot.harvestDate
      ? new Date(lot.harvestDate).toISOString().split('T')[0]
      : lot.expectedHarvestDate || '',
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
        aria-label="Rythu Sevak farm operations visual"
      >
        <img src={referenceImage} alt="" className="absolute inset-0 h-full w-full object-fill" />
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(52,55,35,0.08)_0%,transparent_70%,rgba(239,233,215,0.9)_100%),linear-gradient(180deg,rgba(239,233,215,0.16)_0%,transparent_14%,transparent_86%,rgba(239,233,215,0.16)_100%)]" />
        <div className="login-brand-mark z-10 flex items-center gap-2 font-bold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-black shadow-sm select-none">RS</span>
          <span>Rythu Sevak</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-top-bar">
          {onBackToHome ? (
            <button
              type="button"
              onClick={onBackToHome}
              className="login-back-button"
            >
              <ArrowLeft size={14} /> Back to Home
            </button>
          ) : <div />}
          <div className="login-signup">
            <span>Don&apos;t have an account?</span>
            <button type="button" onClick={onSignUp}>
              Sign up
            </button>
          </div>
        </div>
        <div className="login-content">
          <div className="login-heading">
            <div className="login-icon font-black text-xs select-none">
              RS
            </div>
            <h1>
              Sign in to <span>Rythu Sevak</span>
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
    { value: 'farmer', label: 'Farmer', desc: 'Register farms & crops' },
    { value: 'quality_inspector', label: 'Quality Inspector', desc: 'Inspect plots & grade harvest' },
    { value: 'buyer', label: 'Buyer', desc: 'Procure certified Grade crops' },
    { value: 'logistics_coordinator', label: 'Logistics', desc: 'Fleet dispatch & deliveries' },
  ]

  return (
    <main className="login-page">
      <section
        className="login-visual"
        aria-label="Rythu Sevak farm operations visual"
      >
        <img src={referenceImage} alt="" className="absolute inset-0 h-full w-full object-fill" />
        <div className="absolute inset-0 z-[1] bg-[linear-gradient(90deg,rgba(52,55,35,0.08)_0%,transparent_70%,rgba(239,233,215,0.9)_100%),linear-gradient(180deg,rgba(239,233,215,0.16)_0%,transparent_14%,transparent_86%,rgba(239,233,215,0.16)_100%)]" />
        <div className="login-brand-mark z-10 flex items-center gap-2 font-bold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-black shadow-sm select-none">RS</span>
          <span>Rythu Sevak</span>
        </div>
      </section>
      <section className="login-panel">
        <div className="login-top-bar">
          {onBackToHome ? (
            <button
              type="button"
              onClick={onBackToHome}
              className="login-back-button"
            >
              <ArrowLeft size={14} /> Back to Home
            </button>
          ) : <div />}
          <div className="login-signup">
            <span>Already have an account?</span>
            <button type="button" onClick={onLogin}>
              Login
            </button>
          </div>
        </div>
        <div className="login-content">
          <div className="login-heading">
            <div className="login-icon font-black text-xs select-none">
              RS
            </div>
            <h1>
              Create your <span>Rythu Sevak</span> account
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
        if (!isTokenExpired(data?.token)) {
          window.localStorage.setItem('agritrade-session', JSON.stringify(data))
          return data
        }
      }
      const saved = JSON.parse(window.localStorage.getItem('agritrade-session') || 'null')
      if (saved?.token && isTokenExpired(saved.token)) {
        window.localStorage.removeItem('agritrade-session')
        return null
      }
      return saved
    } catch {
      return null
    }
  })

  useEffect(() => {
    const handleAuthExpired = (e) => {
      setSession(null)
      window.localStorage.removeItem('agritrade-session')
      setAuthMode('login')
      setFarmError(e?.detail || 'Your session has expired. Please sign in again.')
    }
    window.addEventListener('auth:expired', handleAuthExpired)
    return () => window.removeEventListener('auth:expired', handleAuthExpired)
  }, [])

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
  const [modalFullscreen, setModalFullscreen] = useState(false)
  const [points, setPoints] = useState([])
  const [finished, setFinished] = useState(false)
  const [farmArea, setFarmArea] = useState(null)
  const [farmName, setFarmName] = useState('')
  const [crop, setCrop] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 1024
    }
    return true
  })
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
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
        const lotData = await (lotPath === '/lots'
          ? apiRequest('/api/lots', {}, session.token)
          : requestWorkflow(lotPath, {}, session.token))
        if (activeRequest && Array.isArray(lotData)) {
          const mappedLots = lotData.map(mapLot)
          setLots(mappedLots)
          const acceptedOnly = mappedLots.filter((lot) => lot.status === 'accepted')
          if (acceptedOnly.length > 0 || currentRoleValue === 'buyer') {
            setAvailableBatches(acceptedOnly.length > 0 ? acceptedOnly : mappedLots)
          } else {
            setAvailableBatches([])
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

  // Notifications loader & state synchronization
  useEffect(() => {
    if (!session?.token) return
    let activeRequest = true

    const loadNotifications = async () => {
      try {
        const data = await apiRequest('/api/notifications', {}, session.token)
        if (activeRequest && Array.isArray(data) && data.length > 0) {
          setNotifications(data.map((n) => ({ ...n, id: n._id || n.id })))
          return
        }
      } catch {
        /* fallback to role-contextual notifications below */
      }

      if (activeRequest) {
        const role = currentRoleValue
        const defaultNotifs = [
          {
            id: 'notif-1',
            type: 'inspection',
            title: role === 'quality_inspector' ? 'Inspection Request Pending' : 'Quality Grade Certified',
            message:
              role === 'quality_inspector'
                ? 'Farmer Ramesh Patil submitted an on-site quality inspection request for 15.0 acres.'
                : 'Produce lot LOT-402910 has been certified Grade A by Quality Inspector.',
            createdAt: '10m ago',
            readAt: null,
            targetTab: 'Produce Lots',
          },
          {
            id: 'notif-2',
            type: 'order',
            title: role === 'buyer' ? 'Order Confirmed' : 'Purchase Order Placed',
            message:
              role === 'buyer'
                ? 'Your order for 1,200 kg Organic Alphonso Mangoes is confirmed.'
                : 'Buyer BigBasket placed a procurement order for 1,200 kg produce.',
            createdAt: '45m ago',
            readAt: null,
            targetTab: role === 'buyer' ? 'Market' : 'Produce Lots',
          },
          {
            id: 'notif-3',
            type: 'shipment',
            title: role === 'logistics_coordinator' ? 'New Dispatch Assigned' : 'Shipment Dispatched',
            message:
              role === 'logistics_coordinator'
                ? 'Fleet vehicle assigned for regional hub to terminal distribution route.'
                : 'Shipment is now in transit with GPS route monitoring.',
            createdAt: '2h ago',
            readAt: '2026-11-11',
            targetTab: 'Deliveries',
          },
          {
            id: 'notif-4',
            type: 'farm',
            title: 'Farm Boundary Synced',
            message: 'GPS farm boundary verified and encrypted on MongoDB Atlas.',
            createdAt: '1d ago',
            readAt: '2026-11-10',
            targetTab: 'My Farms',
          },
        ]
        setNotifications(defaultNotifs)
      }
    }

    loadNotifications()
    return () => {
      activeRequest = false
    }
  }, [session, currentRoleValue])

  const unreadNotificationsCount = notifications.filter((n) => !n.readAt).length

  const handleMarkAsRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
    )
    if (session?.token) {
      try {
        await apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' }, session.token)
      } catch {
        /* state updated locally */
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
    )
    if (session?.token) {
      try {
        await apiRequest('/api/notifications/read-all', { method: 'PATCH' }, session.token)
      } catch {
        /* state updated locally */
      }
    }
  }

  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif.id)
    if (notif.targetTab) {
      setActive(notif.targetTab)
      setNotificationsOpen(false)
    }
  }

  const addFarm = async () => {
    if (!farmName.trim() || !crop.trim() || !finished || !farmArea || points.length < 3) return
    try {
      setFarmError('')
      const pts = points || []
      const sum = pts.reduce((acc, p) => [acc[0] + p[0], acc[1] + p[1]], [0, 0])
      const centerLng = pts.length ? Number((sum[0] / pts.length).toFixed(4)) : null
      const centerLat = pts.length ? Number((sum[1] / pts.length).toFixed(4)) : null
      const locationAddress = centerLat && centerLng ? `Plot GPS: ${centerLat}, ${centerLng}` : 'Registered Farm Land'
      const locObj = { address: locationAddress, latitude: centerLat, longitude: centerLng }

      let savedFarm
      if (session?.token) {
        savedFarm = await requestFarms(
          '',
          {
            method: 'POST',
            body: JSON.stringify({
              farmName: farmName.trim(),
              crops: [crop.trim()],
              coordinates: points,
              location: locObj,
            }),
          },
          session.token
        )
      }
      const fallbackFarm = {
        _id: `local-farm-${Date.now()}`,
        farmName: farmName.trim(),
        crops: [crop.trim()],
        location: locObj,
        areaAcres: farmArea,
        boundary: { type: 'Polygon', coordinates: [points] },
        inspectionStatus: 'not_requested',
        cropHealth: 'Healthy',
        status: 'Active',
      }
      const next = mapFarm(savedFarm || fallbackFarm)
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
      (isBuyer && active !== 'Market' && active !== 'Settings' && active !== 'Sevak AI') ||
      (isQualityInspector && active !== 'Produce Lots' && active !== 'Settings' && active !== 'Sevak AI') ||
      (isLogisticsCoordinator && active !== 'Deliveries' && active !== 'Settings' && active !== 'Sevak AI') ||
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
        { label: 'Sevak AI', icon: Sparkles },
      ]
    : isQualityInspectionWorkspace
      ? [
          { label: 'Produce Lots', icon: Package },
          { label: 'Sevak AI', icon: Sparkles },
        ]
      : isLogisticsWorkspace
        ? [
            { label: 'Deliveries', icon: Tractor },
            { label: 'Sevak AI', icon: Sparkles },
          ]
        : isFarmerWorkspace
          ? [
              { label: 'Home', icon: Home },
              { label: 'My Farms', icon: MapPin },
              { label: 'Produce Lots', icon: Package },
              { label: 'Sevak AI', icon: Sparkles },
            ]
    : [
        { label: 'Home', icon: Home },
        ...(canAccessMyFarms ? [{ label: 'My Farms', icon: MapPin }] : []),
        { label: 'Produce Lots', icon: Package },
        { label: 'Market', icon: AreaChart },
        { label: 'Sevak AI', icon: Sparkles },
      ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex flex-col border-r border-border bg-card transition-all duration-300 ease-in-out ${
          sidebarOpen
            ? 'w-64 translate-x-0'
            : 'w-16 md:w-20 translate-x-0'
        }`}
      >
        <div
          className={`flex h-20 items-center border-b border-border transition-all duration-300 ${
            sidebarOpen ? 'justify-between px-5' : 'justify-center px-2'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xs tracking-tight shadow-sm select-none cursor-pointer"
              onClick={() => setSidebarOpen((open) => !open)}
              title={sidebarOpen ? 'Collapse sidebar to icons' : 'Expand sidebar'}
            >
              RS
            </div>
            {sidebarOpen && (
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="font-semibold tracking-tight truncate text-sm">Rythu Sevak</p>
                <p className="text-xs text-muted-foreground truncate">{account.workspace}</p>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button
              type="button"
              className="flex items-center justify-center rounded-xl p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition shrink-0"
              onClick={() => setSidebarOpen(false)}
              aria-label="Collapse sidebar"
              title="Collapse sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <nav
          className={`flex flex-1 flex-col gap-2 transition-all duration-300 ${
            sidebarOpen ? 'p-4' : 'items-center py-4 px-1.5'
          }`}
        >
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => {
                setActive(label)
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  setSidebarOpen(false)
                }
              }}
              title={label}
              className={`group relative flex items-center rounded-xl transition ${
                sidebarOpen
                  ? 'w-full gap-3 px-4 py-3 text-left text-sm font-medium'
                  : 'size-11 justify-center p-0'
              } ${
                active === label
                  ? 'bg-secondary text-primary font-bold shadow-xs'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon size={sidebarOpen ? 18 : 20} className="shrink-0" />
              {sidebarOpen && (
                <>
                  <span className="truncate">{label}</span>
                  {label === 'Sevak AI' && (
                    <span className="ml-auto rounded-full bg-primary/15 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Copilot
                    </span>
                  )}
                  {label === 'My Farms' && farms.length > 0 && (
                    <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">
                      {farms.length}
                    </span>
                  )}
                </>
              )}
              {!sidebarOpen && label === 'My Farms' && farms.length > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-xs">
                  {farms.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Authenticated role badge */}
        <div
          className={`transition-all duration-300 ${
            sidebarOpen
              ? 'm-4 rounded-2xl bg-secondary p-4 text-xs space-y-1'
              : 'mb-4 flex justify-center'
          }`}
        >
          {sidebarOpen ? (
            <>
              <p className="font-semibold text-primary">Role: {account.label}</p>
              <p className="text-muted-foreground text-[11px]">Managed by your authenticated account.</p>
            </>
          ) : (
            <div
              className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary font-bold text-xs uppercase shadow-xs select-none"
              title={`Role: ${account.label}`}
            >
              {account.label?.[0] || 'R'}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Backdrop Overlay when expanded on small screens */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-xs md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <main
        className={`transition-[padding] duration-300 ease-in-out ${
          sidebarOpen ? 'md:pl-64 pl-16' : 'md:pl-20 pl-16'
        }`}
      >
        {/* Top Header */}
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-border bg-card/95 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center justify-center rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-label={sidebarOpen ? 'Collapse sidebar to icons' : 'Expand sidebar'}
              title={sidebarOpen ? 'Collapse sidebar to icons' : 'Expand sidebar'}
            >
              <Menu size={20} />
            </button>
            <div className="hidden items-center text-sm md:flex">
              <span className="font-semibold text-foreground text-base tracking-tight">{active}</span>
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground text-[10px] font-black select-none">RS</span>
              <span className="font-bold">Rythu Sevak</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Center */}
            <div className="relative">
              <button
                type="button"
                className={`relative rounded-xl p-2.5 transition ${
                  notificationsOpen
                    ? 'bg-secondary text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                onClick={() => setNotificationsOpen((open) => !open)}
                aria-label="Notifications"
                aria-expanded={notificationsOpen}
                title="Notifications"
              >
                <Bell size={19} />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground ring-2 ring-card animate-pulse">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Panel */}
              {notificationsOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setNotificationsOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 top-12 z-50 w-80 sm:w-96 rounded-2xl border border-border bg-card shadow-2xl overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150"
                    role="region"
                    aria-label="Notification Center"
                  >
                  {/* Panel Header */}
                  <div className="flex items-center justify-between border-b border-border px-4 py-3 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">Notifications</span>
                      {unreadNotificationsCount > 0 && (
                        <span className="rounded-full bg-primary/15 text-primary text-[10px] font-bold px-2 py-0.5">
                          {unreadNotificationsCount} new
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadNotificationsCount > 0 && (
                        <button
                          type="button"
                          onClick={handleMarkAllAsRead}
                          className="text-[11px] font-medium text-primary hover:underline"
                        >
                          Mark all as read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setNotificationsOpen(false)}
                        className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                        aria-label="Close notifications"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Notifications List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground text-xs space-y-1">
                        <CheckCircle2 size={32} className="mx-auto text-primary/50 mb-2" />
                        <p className="font-semibold text-foreground">You're all caught up!</p>
                        <p>No new notifications at this time.</p>
                      </div>
                    ) : (
                      notifications.map((notif) => {
                        const isUnread = !notif.readAt
                        return (
                          <div
                            key={notif.id}
                            onClick={() => handleNotificationClick(notif)}
                            className={`flex items-start gap-3 p-3.5 text-xs cursor-pointer transition hover:bg-muted/50 ${
                              isUnread ? 'bg-primary/5' : ''
                            }`}
                          >
                            <div className="mt-0.5 shrink-0 rounded-lg bg-secondary p-2 text-primary">
                              {notif.type === 'inspection' ? (
                                <Award size={15} />
                              ) : notif.type === 'order' ? (
                                <ShoppingBag size={15} />
                              ) : notif.type === 'shipment' ? (
                                <Truck size={15} />
                              ) : (
                                <MapPin size={15} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0 space-y-0.5">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`text-xs truncate ${isUnread ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
                                  {notif.title}
                                </p>
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {notif.createdAt}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                                {notif.message}
                              </p>
                            </div>
                            {isUnread && (
                              <span className="mt-1.5 size-2 rounded-full bg-primary shrink-0" />
                            )}
                          </div>
                        )
                      })
                    )}
                  </div>

                  {/* Panel Footer */}
                  <div className="border-t border-border px-4 py-2.5 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Live Supply Chain Alerts</span>
                    <button
                      type="button"
                      onClick={() => {
                        setActive('Settings')
                        setNotificationsOpen(false)
                      }}
                      className="font-medium text-primary hover:underline"
                    >
                      Preferences
                    </button>
                  </div>
                </div>
              </>
            )}
            </div>

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
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setAccountMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div
                    className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl space-y-1"
                    role="menu"
                  >
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-xs font-bold text-foreground">{userName}</p>
                    <p className="text-[11px] text-muted-foreground">{session?.user?.email || 'user@rythusevak.com'}</p>
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
              </>
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
                const saved = await apiRequest(`/api/farms/${farmId}/request-inspection`, {
                  method: 'POST',
                  body: JSON.stringify(inspectionData),
                }, session.token)
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
                const targetFarmObj = farms.find((f) => f.name === newLot.farmName || f.id === newLot.farmId || f._id === newLot.farmId) || farms[0]
                const saved = await apiRequest('/api/lots', {
                  method: 'POST',
                  body: JSON.stringify({
                    category: newLot.category,
                    quantity: newLot.quantity,
                    unit: newLot.unit,
                    farmer: session.user.id || session.user._id,
                    farm: targetFarmObj?.id || targetFarmObj?._id,
                    cropHealth: newLot.cropHealth,
                    expectedHarvestDate: newLot.expectedHarvestDate,
                    harvestDate: newLot.expectedHarvestDate,
                  }),
                }, session.token)
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
              farms={farms}
              onCreatePO={async (newPOData) => {
                if (!session?.token) {
                  const fallbackPO = {
                    ...newPOData,
                    id: `local-po-${Date.now()}`,
                    reference: `ORD-${Date.now()}`,
                    totalBudget: newPOData.quantity * (newPOData.unitPrice || 0),
                    status: 'submitted',
                  }
                  setPurchaseOrders([fallbackPO, ...purchaseOrders])
                  return fallbackPO
                }
                const saved = await requestWorkflow('/orders', {
                  method: 'POST',
                  body: JSON.stringify(newPOData),
                }, session.token)
                const mappedPO = {
                  ...saved,
                  id: saved._id,
                  reference: saved.number,
                  crop: saved.crop,
                  totalBudget: saved.totalAmount,
                }
                setPurchaseOrders((current) => [mappedPO, ...current])
                if (saved.shipment) {
                  const newShipment = typeof saved.shipment === 'object'
                    ? { ...saved.shipment, id: saved.shipment._id, reference: saved.shipment.shipmentNumber, order: saved }
                    : null
                  if (newShipment) setShipments((current) => [newShipment, ...current])
                }
                try {
                  const updatedShipments = await requestWorkflow('/shipments', {}, session.token)
                  if (Array.isArray(updatedShipments)) {
                    setShipments(updatedShipments.map((s) => ({ ...s, id: s._id, reference: s.shipmentNumber })))
                  }
                } catch { /* retain existing state */ }
                return mappedPO
              }}
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

          {active === 'Sevak AI' && (
            <SevakAIPage role={currentRoleValue} userName={userName} />
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
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-xs transition-all duration-300 ${
            modalFullscreen ? 'p-0' : 'p-3 sm:p-5 lg:p-7'
          }`}
          role="dialog"
          aria-modal="true"
        >
          <div
            className={`flex flex-col overflow-hidden bg-card border border-border shadow-2xl transition-all duration-300 ${
              modalFullscreen
                ? 'w-screen h-screen rounded-none border-0'
                : 'w-full max-w-6xl xl:max-w-7xl h-[88vh] max-h-[92vh] rounded-3xl'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-card/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                  <Compass size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-foreground md:text-lg">
                    Mark & Save Farm Boundary
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Click points directly on the map to define your farm boundary polygon. Zoom in for precision.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setModalFullscreen(!modalFullscreen)}
                  className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                  title={modalFullscreen ? 'Exit Fullscreen' : 'Maximize Map Window'}
                  aria-label={modalFullscreen ? 'Exit Fullscreen' : 'Maximize Map Window'}
                >
                  {modalFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false)
                    setModalFullscreen(false)
                  }}
                  className="rounded-xl p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                  aria-label="Close"
                  title="Close Modal"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body: Left Controls + Right Map */}
            <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] flex-1 min-h-0 overflow-hidden">
              {/* Left Column: Form Controls */}
              <div className="flex flex-col gap-4 p-6 overflow-y-auto border-r border-border bg-card">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Farm Name
                  </label>
                  <input
                    value={farmName}
                    onChange={(event) => setFarmName(event.target.value)}
                    placeholder="e.g. Green Valley Farm"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-foreground">
                    Primary Crop
                  </label>
                  <input
                    value={crop}
                    onChange={(event) => setCrop(event.target.value)}
                    placeholder="e.g. Organic Alphonso Mangoes"
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs font-medium outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Boundary Points & Acreage Card */}
                <div className="rounded-2xl border border-border bg-secondary/50 p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold text-primary">
                    <span className="flex items-center gap-1.5">
                      <Compass size={15} /> Boundary Points
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold">
                      {points.length} {points.length === 1 ? 'Point' : 'Points'}
                    </span>
                  </div>

                  {finished && farmArea ? (
                    <div className="rounded-xl bg-card p-3 border border-border space-y-1">
                      <p className="text-[10px] font-semibold uppercase text-muted-foreground tracking-wider">
                        Calculated Farm Area
                      </p>
                      <p className="text-lg font-bold text-primary">
                        {farmArea.acres.toFixed(2)} acres
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {farmArea.hectares.toFixed(2)} hectares ({Math.round(farmArea.sqm).toLocaleString()} m²)
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground leading-relaxed text-[11px]">
                      {points.length === 0
                        ? 'Click "Mark Farm Boundary" on the map, then click at least 3 points around your farm boundary.'
                        : points.length < 3
                        ? `Mark at least ${3 - points.length} more point${3 - points.length > 1 ? 's' : ''} to form a closed polygon.`
                        : 'Click "Finish Farm" on the map toolbar to calculate total area.'}
                    </p>
                  )}
                </div>

                {farmError && (
                  <p className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                    {farmError}
                  </p>
                )}

                <div className="mt-auto pt-4 space-y-2">
                  <button
                    type="button"
                    disabled={points.length < 3 || !finished || !farmName.trim() || !crop.trim() || !farmArea}
                    onClick={addFarm}
                    className="w-full rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground shadow-md disabled:cursor-not-allowed disabled:opacity-40 hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    Save Farm
                  </button>
                  <p className="text-center text-[10px] text-muted-foreground">
                    Requires 3+ boundary points & finished polygon to save.
                  </p>
                </div>
              </div>

              {/* Right Column: Expansive Map */}
              <div className="h-full min-h-[420px] lg:min-h-[580px] w-full relative bg-muted/20">
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
