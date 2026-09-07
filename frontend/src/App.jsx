import { useMemo, useState } from 'react'
import { AreaChart, Bell, ChevronDown, CircleHelp, CloudSun, Compass, FileText, LayoutDashboard, Leaf, MapPin, Menu, Plus, Search, Settings, Sprout, Tractor, TrendingUp, Users, X } from 'lucide-react'
import { FarmMap } from './components/FarmMap'
import { OperationsDashboard } from './components/OperationsDashboard'

const starterFarms = [
  { id: 'f-1', name: 'Green Valley Organics', location: 'Nashik, Maharashtra', crop: 'Grapes', area: 24.8, status: 'Verified', points: [[20.02, 73.78], [20.04, 73.82], [20.01, 73.84], [19.99, 73.81]] },
  { id: 'f-2', name: 'Sunrise Fields', location: 'Pune, Maharashtra', crop: 'Wheat', area: 18.4, status: 'Verified', points: [[18.51, 73.84], [18.53, 73.87], [18.50, 73.89], [18.48, 73.86]] },
  { id: 'f-3', name: 'Riverbend Estate', location: 'Kolhapur, Maharashtra', crop: 'Sugarcane', area: 32.1, status: 'Pending', points: [] },
]

function MetricCard({ label, value, suffix, icon: Icon, tone }) {
  return <div className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{value}<span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span></p></div><div className={`rounded-xl p-3 ${tone}`}><Icon size={20} /></div></div><div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary"><TrendingUp size={13} /> 8.4% <span className="font-normal text-muted-foreground">vs last season</span></div></div>
}

function WorkspacePanel({ active, farms }) {
  if (active === 'Overview') return <OperationsDashboard active={active} />
  const content = {
    'My Farms': ['My Farms', 'Manage registered land parcels, crops, boundaries, and verification status.', `${farms.length} farms registered`, 'Select a farm from the list below or add a new boundary from the overview.'],
    'Produce Lots': ['Produce Lots', 'Follow produce from creation through inspection, storage, dispatch, and delivery.', '24 active lots', 'Lot lifecycle tracking is ready for your connected operations data.'],
    Market: ['Market', 'Review current crop prices and prepare produce for the best available buyer.', '₹12.8L estimated value', 'Market pricing and purchase-order activity will appear here.'],
    Settings: ['Settings', 'Configure your organization, region, notifications, and workspace preferences.', 'Workspace settings', 'Your role and organization-scoped settings are protected by the backend RBAC layer.'],
  }
  const [title, description, metric, detail] = content[active] || content.Overview
  return <section className="rounded-2xl border border-border bg-card p-6 shadow-sm"><div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">AgriTrade workspace</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">{metric}</span></div><div className="mt-6 rounded-xl border border-dashed border-border bg-background p-5"><p className="font-medium">{detail}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Use the navigation to move between workspace areas. Data is scoped to your organization and region.</p></div></section>
}

const referenceImage = 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202026-09-07%20183007-1ZZ814lv9Jftsz45jf0tRvpAGec7FV.png'

function LoginScreen({ onLogin, onSignUp }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (event) => {
    event.preventDefault()
    if (email.trim() && password.trim()) onLogin()
  }

  return <main className="login-page">
    <section className="login-visual" style={{ backgroundImage: `url(${referenceImage})` }} aria-label="AgriTrade farm operations visual">
      <div className="login-visual-shade" />
      <div className="login-stat login-stat-orange"><strong>41%</strong><span>of farmers say accurate land data is the hardest part of planning.</span></div>
      <div className="login-stat login-stat-green"><strong>76%</strong><span>of farm teams say connected operations are their greatest advantage.</span></div>
      <div className="login-brand-mark"><Leaf size={20} /> AgriTrade</div>
    </section>
    <section className="login-panel">
      <div className="login-signup">Don&apos;t have an account? <button type="button" onClick={onSignUp}>Sign up</button></div>
      <div className="login-content">
        <div className="login-heading"><div className="login-icon"><Leaf size={18} /></div><h1>Sign in to <span>AgriTrade</span></h1><p>Welcome back. Please enter your login details<br />to continue to your farm workspace.</p></div>
        <form onSubmit={submit} className="login-form">
          <label>Email Address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email Address" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" required /></label>
          <button className="login-forgot" type="button">Forgot the password?</button>
          <button className="login-submit" type="submit">Login</button>
        </form>
        <div className="login-divider"><span>OR</span></div>
        <button className="google-login" type="button"><span className="google-g">G</span> Sign in with Google</button>
      </div>
    </section>
  </main>
}

function SignUpScreen({ onLogin, onSignUp }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const canSubmit = name.trim() && email.trim() && password.trim() && password === confirmPassword

  const submit = (event) => {
    event.preventDefault()
    if (canSubmit) onSignUp()
  }

  return <main className="login-page">
    <section className="login-visual" style={{ backgroundImage: `url(${referenceImage})` }} aria-label="AgriTrade farm operations visual">
      <div className="login-visual-shade" />
      <div className="login-stat login-stat-orange"><strong>41%</strong><span>of farmers say accurate land data is the hardest part of planning.</span></div>
      <div className="login-stat login-stat-green"><strong>76%</strong><span>of farm teams say connected operations are their greatest advantage.</span></div>
      <div className="login-brand-mark"><Leaf size={20} /> AgriTrade</div>
    </section>
    <section className="login-panel">
      <div className="login-signup">Already have an account? <button type="button" onClick={onLogin}>Login</button></div>
      <div className="login-content">
        <div className="login-heading"><div className="login-icon"><Leaf size={18} /></div><h1>Create your <span>AgriTrade</span> account</h1><p>Join your connected farm workspace<br />and manage every operation in one place.</p></div>
        <form onSubmit={submit} className="login-form">
          <label>Full name<input type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="Full name" required /></label>
          <label>Email Address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email Address" required /></label>
          <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a password" minLength="8" required /></label>
          <label>Confirm password<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Confirm password" minLength="8" required /></label>
          {confirmPassword && password !== confirmPassword && <p className="login-error">Passwords do not match.</p>}
          <button className="login-submit" type="submit" disabled={!canSubmit}>Create account</button>
        </form>
        <div className="login-divider"><span>OR</span></div>
        <button className="google-login" type="button"><span className="google-g">G</span> Sign up with Google</button>
      </div>
    </section>
  </main>
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [farms, setFarms] = useState(starterFarms)
  const [active, setActive] = useState('Overview')
  const [selectedFarm, setSelectedFarm] = useState(starterFarms[0])
  const [showForm, setShowForm] = useState(false)
  const [points, setPoints] = useState([])
  const [finished, setFinished] = useState(false)
  const [farmArea, setFarmArea] = useState(null)
  const [farmName, setFarmName] = useState('')
  const [crop, setCrop] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const totalArea = useMemo(() => farms.reduce((total, farm) => total + farm.area, 0), [farms])
  if (!isAuthenticated) {
    if (authMode === 'signup') return <SignUpScreen onLogin={() => setAuthMode('login')} onSignUp={() => setIsAuthenticated(true)} />
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} onSignUp={() => setAuthMode('signup')} />
  }
  const addFarm = () => { if (!farmName.trim() || !crop.trim() || !finished || !farmArea || points.length < 3) return; const next = { id: `f-${Date.now()}`, name: farmName.trim(), location: 'New location', crop: crop.trim(), area: farmArea.acres, status: 'Pending', points: [...points] }; setFarms((current) => [...current, next]); setSelectedFarm(next); setFarmName(''); setCrop(''); setPoints([]); setFarmArea(null); setFinished(false); setShowForm(false) }
  const navItems = [{ label: 'Overview', icon: LayoutDashboard }, { label: 'My Farms', icon: Leaf }, { label: 'Produce Lots', icon: Sprout }, { label: 'Market', icon: AreaChart }, { label: 'Settings', icon: Settings }]
  return <div className="min-h-screen bg-background text-foreground">
    <aside className={`fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-border bg-card transition-transform lg:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex h-20 items-center gap-3 border-b border-border px-7"><div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground"><Leaf size={20} /></div><div><p className="font-semibold tracking-tight">AgriTrade</p><p className="text-xs text-muted-foreground">Farmer workspace</p></div><button className="ml-auto lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={20} /></button></div>
      <nav className="flex flex-1 flex-col gap-1 p-4">{navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setActive(label); setMenuOpen(false) }} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition ${active === label ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}><Icon size={18} />{label}{label === 'My Farms' && <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-xs">{farms.length}</span>}</button>)}</nav>
      <div className="m-4 rounded-2xl bg-primary p-4 text-primary-foreground"><div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-primary-foreground/15"><CircleHelp size={19} /></div><p className="text-sm font-semibold">Need a hand?</p><p className="mt-1 text-xs leading-5 text-primary-foreground/70">Our farm specialists are here to help.</p><button className="mt-4 text-xs font-semibold underline underline-offset-4">Contact support</button></div>
    </aside>
    <main className="lg:pl-64"><header className="flex h-20 items-center justify-between border-b border-border bg-card/80 px-5 backdrop-blur md:px-8"><div className="flex items-center gap-3"><button className="lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu size={22} /></button><div className="hidden items-center gap-2 text-sm text-muted-foreground md:flex"><span>Workspace</span><span>/</span><span className="font-medium text-foreground">{active}</span></div><div className="flex items-center gap-2 md:hidden"><Leaf size={18} className="text-primary" /><span className="font-semibold">AgriTrade</span></div></div><div className="flex items-center gap-3"><button className="hidden rounded-xl p-2.5 text-muted-foreground hover:bg-muted sm:block" aria-label="Search"><Search size={19} /></button><button className="relative rounded-xl p-2.5 text-muted-foreground hover:bg-muted" aria-label="Notifications"><Bell size={19} /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-accent" /></button><div className="hidden h-7 w-px bg-border sm:block" /><button className="flex items-center gap-2"><div className="flex size-9 items-center justify-center rounded-full bg-[#dcebdc] text-sm font-semibold text-primary">RK</div><div className="hidden text-left md:block"><p className="text-sm font-semibold">Rajesh Kumar</p><p className="text-xs text-muted-foreground">Farmer</p></div><ChevronDown size={15} className="hidden text-muted-foreground md:block" /></button></div></header>
      <div className="mx-auto max-w-[1500px] p-5 md:p-8"><WorkspacePanel active={active} farms={farms} /><div className="mt-8 mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-2 flex items-center gap-2 text-sm font-medium text-primary"><CloudSun size={17} /> Thursday, 05 September 2026</p><h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Good morning, Rajesh</h1><p className="mt-2 text-muted-foreground">Here is what is happening across your farms today.</p></div><button onClick={() => setShowForm(true)} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"><Plus size={18} /> Add new farm</button></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total farm area" value={totalArea.toFixed(1)} suffix="acres" icon={Tractor} tone="bg-[#e7efe5] text-primary" /><MetricCard label="Active farms" value={String(farms.length)} suffix="farms" icon={Leaf} tone="bg-[#f7ecd8] text-[#a56a17]" /><MetricCard label="Produce lots" value="18" suffix="active" icon={Sprout} tone="bg-[#e4eef1] text-[#2e7080]" /><MetricCard label="Market value" value="₹12.8L" suffix="estimated" icon={TrendingUp} tone="bg-[#eee8f4] text-[#76518e]" /></div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]"><section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-semibold">Farm locations</h2><p className="mt-1 text-sm text-muted-foreground">Your registered land parcels</p></div><button onClick={() => setActive('My Farms')} className="flex items-center gap-1 text-sm font-semibold text-primary">View all <ChevronDown size={15} className="-rotate-90" /></button></div><div className="h-[420px]"><FarmMap points={selectedFarm?.points || []} onAdd={() => undefined} onUndo={() => undefined} onClear={() => undefined} onFinish={() => undefined} onEdit={() => undefined} finished={false} /></div></section><section className="rounded-2xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="font-semibold">Your farms</h2><p className="mt-1 text-sm text-muted-foreground">Select a farm to view on map</p></div><button onClick={() => setActive('My Farms')} className="rounded-lg p-2 text-muted-foreground hover:bg-muted" aria-label="Farm documents"><FileText size={18} /></button></div><div className="flex flex-col">{farms.map((farm) => <button key={farm.id} onClick={() => setSelectedFarm(farm)} className={`flex items-center gap-3 border-b border-border p-4 text-left transition last:border-0 hover:bg-muted ${selectedFarm?.id === farm.id ? 'bg-secondary/60' : ''}`}><div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary"><Leaf size={18} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{farm.name}</p><p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin size={12} /> {farm.location}</p></div><div className="text-right"><p className="text-sm font-semibold">{farm.area.toFixed(1)} ac</p><p className={`mt-1 text-[11px] font-medium ${farm.status === 'Verified' ? 'text-primary' : 'text-[#a56a17]'}`}>{farm.status}</p></div></button>)}</div><div className="m-4 rounded-xl border border-dashed border-border p-4 text-center"><p className="text-sm font-medium">Map every acre</p><p className="mt-1 text-xs text-muted-foreground">Mark your boundaries to calculate area.</p><button onClick={() => setShowForm(true)} className="mt-3 text-xs font-semibold text-primary">Start mapping <span aria-hidden="true">→</span></button></div></section></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]"><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-start justify-between"><div><h2 className="font-semibold">Season progress</h2><p className="mt-1 text-sm text-muted-foreground">September 2026 cycle</p></div><span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-primary">On track</span></div><div className="mt-6 flex items-end gap-2"><span className="text-4xl font-semibold">68%</span><span className="mb-1 text-sm text-muted-foreground">complete</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full w-[68%] rounded-full bg-primary" /></div><div className="mt-4 flex justify-between text-xs text-muted-foreground"><span>Planting</span><span>Growth</span><span>Harvest</span></div></section><section className="rounded-2xl border border-border bg-card p-5 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Market snapshot</h2><p className="mt-1 text-sm text-muted-foreground">Current crop prices</p></div><button className="text-sm font-semibold text-primary">Open market</button></div><div className="mt-5 flex items-center gap-4"><div className="flex size-11 items-center justify-center rounded-xl bg-[#f7ecd8] text-[#a56a17]"><TrendingUp size={20} /></div><div><p className="text-2xl font-semibold">+12.6%</p><p className="text-xs text-muted-foreground">Average price movement</p></div><div className="ml-auto hidden text-right sm:block"><p className="text-sm font-medium">Grapes</p><p className="text-xs text-primary">₹86 / kg</p></div></div></section></div>
      </div></main>
      {showForm && <div className="fixed inset-0 z-30 flex items-center justify-center bg-foreground/30 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-xl"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="text-lg font-semibold">Add a new farm</h2><p className="mt-1 text-sm text-muted-foreground">Click the map to mark at least three boundary points.</p></div><button onClick={() => setShowForm(false)} aria-label="Close"><X size={20} /></button></div><div className="grid md:grid-cols-[1fr_1.2fr]"><div className="flex flex-col gap-4 p-5"><label className="text-sm font-medium">Farm name<input value={farmName} onChange={(event) => setFarmName(event.target.value)} placeholder="e.g. Mango Grove" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label><label className="text-sm font-medium">Primary crop<input value={crop} onChange={(event) => setCrop(event.target.value)} placeholder="e.g. Grapes" className="mt-2 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary" /></label><div className="rounded-xl bg-secondary p-4 text-sm"><div className="flex items-center gap-2 font-medium text-primary"><Compass size={16} /> Boundary points</div><p className="mt-2 text-muted-foreground">{points.length} points marked. {finished && farmArea ? `Calculated area: ${farmArea.acres.toFixed(2)} acres (${farmArea.hectares.toFixed(2)} ha).` : 'Finish the boundary to calculate area.'}</p></div><button disabled={points.length < 3 || !finished || !farmName.trim() || !crop.trim() || !farmArea} onClick={addFarm} className="mt-auto rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40">Save farm</button></div><div className="min-h-[340px] bg-muted"><FarmMap points={points} onAdd={(point) => { setPoints((current) => [...current, point]); setFarmArea(null) }} onUndo={() => { setPoints((current) => current.slice(0, -1)); setFarmArea(null); setFinished(false) }} onClear={() => { setPoints([]); setFarmArea(null); setFinished(false) }} onFinish={(area) => { setFarmArea(area); setFinished(true) }} onEdit={() => { setFinished(false); setFarmArea(null) }} finished={finished} /></div></div></div></div>}
  </div>
}
