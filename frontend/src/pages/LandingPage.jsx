import {
  AreaChart,
  Award,
  CheckCircle,
  ChevronRight,
  Compass,
  FileCheck,
  FileText,
  Globe,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Tractor,
  Truck,
  UserCheck,
  Users,
} from 'lucide-react'

export function LandingPage({ onLogin, onRegister, onRoleRegister, session, onGoToDashboard }) {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* 1. Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-card/90 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 md:px-8">
          <a href="#" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-foreground">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm tracking-tight shadow-sm select-none">
              AT
            </div>
            <span className="font-extrabold tracking-tight">AgriTrade</span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home') }} className="hover:text-primary transition">Home</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about') }} className="hover:text-primary transition">About Us</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works') }} className="hover:text-primary transition">How It Works</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }} className="hover:text-primary transition">Features</a>
            <a href="#roles" onClick={(e) => { e.preventDefault(); scrollTo('roles') }} className="hover:text-primary transition">Roles</a>
            <a href="#contact" onClick={(e) => { e.preventDefault(); scrollTo('contact') }} className="hover:text-primary transition">Contact</a>
          </nav>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            {session ? (
              <button
                onClick={onGoToDashboard}
                className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
              >
                Go to Workspace <ChevronRight size={16} />
              </button>
            ) : (
              <>
                <button
                  onClick={onLogin}
                  className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition"
                >
                  Login
                </button>
                <button
                  onClick={onRegister}
                  className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="relative overflow-hidden bg-card border-b border-border py-20 lg:py-28">
        <div className="absolute inset-0 z-0">
          <img
            src="/backgroundimg.jpg"
            alt="Agricultural field with farmer and tractor"
            className="h-full w-full object-cover opacity-25 dark:opacity-15"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-5 md:px-8">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
              Connecting Farmers, Buyers & Agriculture Through Technology.
            </h1>

            <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
              AgriTrade simplifies land registration, polygon boundary mapping, quality inspection and grading,
              transparent crop procurement, and coordinated logistics delivery in one unified digital ecosystem.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onRegister}
                className="flex items-center gap-2 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground shadow-md hover:opacity-90 transition"
              >
                Create an Account <ChevronRight size={18} />
              </button>
              <button
                onClick={() => scrollTo('how-it-works')}
                className="rounded-xl border border-border bg-card px-6 py-3.5 text-base font-semibold text-foreground hover:bg-muted transition"
              >
                Explore How It Works
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-6 sm:grid-cols-4 border-t border-border/80">
              <div>
                <p className="text-2xl font-bold text-primary">100%</p>
                <p className="text-xs text-muted-foreground mt-0.5">GPS Boundary Verified</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">Grade A–D</p>
                <p className="text-xs text-muted-foreground mt-0.5">Certified Inspection</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">Zero</p>
                <p className="text-xs text-muted-foreground mt-0.5">Uninspected Crops Sold</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">Live</p>
                <p className="text-xs text-muted-foreground mt-0.5">Dispatch Tracking</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. About AgriTrade */}
      <section id="about" className="py-20 border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">About AgriTrade</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Unifying the Agricultural Supply Chain in One Connected Digital Platform.
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Traditional agriculture procurement is fragmented by lack of land boundary verification,
                inconsistent quality standards, price manipulation by middlemen, and delayed logistics.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                AgriTrade bridges this gap by directly linking <strong>Farmers</strong>, certified <strong>Quality Inspectors</strong>, <strong>Bulk Buyers</strong>,
                and <strong>Logistics Coordinators</strong>. From the moment a farmer registers their land boundary with GPS polygons to the final delivery handoff,
                every step is recorded, verified, and secured with MongoDB records.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="rounded-xl border border-border bg-card p-4">
                  <h4 className="font-semibold text-foreground text-sm">Empowering Farmers</h4>
                  <p className="text-xs text-muted-foreground mt-1">Accurate land area calculations and fair direct pricing without middlemen.</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-4">
                  <h4 className="font-semibold text-foreground text-sm">Certified Quality</h4>
                  <p className="text-xs text-muted-foreground mt-1">Standardized grading ensures buyers receive exact produce specifications.</p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border bg-card p-3 shadow-lg">
              <img
                src="/backgroundimg.jpg"
                alt="AgriTrade platform ecosystem"
                className="h-80 w-full rounded-xl object-cover"
              />
              <div className="p-4">
                <p className="font-semibold text-sm">Integrated Agricultural Management</p>
                <p className="text-xs text-muted-foreground mt-1">Real-time GPS mapping, quality certification, and fleet delivery tracking.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works (Step-by-step visual cards / timeline) */}
      <section id="how-it-works" className="py-20 border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Step-by-Step Workflow</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How AgriTrade Works</h2>
            <p className="text-sm text-muted-foreground">
              A transparent, 6-step lifecycle connecting land registration to final verified delivery.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: '01',
                title: 'Land Registration',
                desc: 'Farmer marks agricultural land boundaries using interactive map polygon plotting tools. Area in acres is calculated automatically.',
                icon: Compass,
              },
              {
                step: '02',
                title: 'Inspection Request',
                desc: 'Farmer enters crop variety, expected harvest date, and quantity, then submits a quality inspection request.',
                icon: FileCheck,
              },
              {
                step: '03',
                title: 'Quality Inspection & Grading',
                desc: 'Quality Inspector reviews the farm map, evaluates crop health, assigns Grade A, B, C, or D, and submits the inspection report.',
                icon: ShieldCheck,
              },
              {
                step: '04',
                title: 'Buyer Marketplace & Purchase',
                desc: 'Verified buyers browse only certified produce, review farm boundary plots, specify order quantity, and submit purchase orders.',
                icon: ShoppingBag,
              },
              {
                step: '05',
                title: 'Logistics Coordination',
                desc: 'Logistics Coordinator accepts the order, assigns transport vehicles, plans pickup to delivery routes, and dispatches.',
                icon: Truck,
              },
              {
                step: '06',
                title: 'Delivery & Status Sync',
                desc: 'Coordinator marks the order as delivered upon arrival. Updated status synchronizes across Farmer, Buyer, and Admin dashboards.',
                icon: CheckCircle,
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.step} className="relative rounded-2xl border border-border bg-background p-6 shadow-xs hover:border-primary transition">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-extrabold text-primary bg-secondary px-3 py-1 rounded-full">{item.step}</span>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                      <Icon size={20} />
                    </div>
                  </div>
                  <h3 className="font-bold text-base mb-2">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 5. Platform Features */}
      <section id="features" className="py-20 border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Capabilities</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Platform Features</h2>
            <p className="text-sm text-muted-foreground">
              Engineered with modern geospatial tools and real-time MongoDB state synchronization.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Map-Based Land Registration',
                desc: 'Satellite map integration allowing precise marking of agricultural parcels.',
                icon: Globe,
              },
              {
                title: 'Polygon Land Measurement',
                desc: 'Real-time polygon area calculation in acres and hectares based on GPS vertices.',
                icon: Compass,
              },
              {
                title: 'Quality Inspection & Grading',
                desc: 'Rigorous grading workflow (Grade A–D) with moisture, purity, and condition logging.',
                icon: Award,
              },
              {
                title: 'Crop Listing & Procurement',
                desc: 'Buyers browse verified harvest batches with price transparent cataloging.',
                icon: AreaChart,
              },
              {
                title: 'Buyer & Farmer Connectivity',
                desc: 'Direct interaction eliminating unfair middlemen commissions and delays.',
                icon: Users,
              },
              {
                title: 'Logistics & Delivery Tracking',
                desc: 'End-to-end shipment statuses: Ready for Pickup -> Assigned -> Dispatched -> Delivered.',
                icon: Truck,
              },
              {
                title: 'Role-Based Dashboards',
                desc: 'Customized workspaces for Farmer, Inspector, Buyer, Logistics Coordinator, and Admin.',
                icon: UserCheck,
              },
              {
                title: 'End-to-End Order Management',
                desc: 'Automatic inventory deductions to prevent overselling and complete audit history.',
                icon: Package,
              },
            ].map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="rounded-2xl border border-border bg-card p-6 shadow-xs hover:shadow-md transition">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary mb-4">
                    <Icon size={22} />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 6. User Roles Section */}
      <section id="roles" className="py-20 border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">Tailored Workspaces</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Built for Every Agriculture Stakeholder</h2>
            <p className="text-sm text-muted-foreground">
              Select your role to access dedicated tools and role-based workflows.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                role: 'farmer',
                name: 'Farmer',
                desc: 'Register land boundaries via polygon maps, record crop details, request certified quality inspection, and manage farm records.',
                icon: Tractor,
                badge: 'Primary Producer',
              },
              {
                role: 'quality_inspector',
                name: 'Quality Inspector',
                desc: 'Review farmer inspection requests, inspect boundaries on the map, evaluate crop condition, assign quality grades, and submit certified reports.',
                icon: ShieldCheck,
                badge: 'Certification',
              },
              {
                role: 'buyer',
                name: 'Buyer',
                desc: 'Browse certified Grade A–D agricultural produce, view farm polygon plots on the map, place purchase orders, and track deliveries.',
                icon: ShoppingBag,
                badge: 'Procurement',
              },
              {
                role: 'logistics_coordinator',
                name: 'Logistics Coordinator',
                desc: 'Accept buyer shipment orders, coordinate transport vehicles, track transit routes from farm to destination, and confirm handoff.',
                icon: Truck,
                badge: 'Fleet & Delivery',
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.role} className="flex flex-col justify-between rounded-2xl border border-border bg-background p-6 shadow-sm">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-secondary text-primary">
                        <Icon size={24} />
                      </div>
                      <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold text-primary">
                        {item.badge}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">{item.name}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-6">{item.desc}</p>
                  </div>
                  <button
                    onClick={() => onRoleRegister ? onRoleRegister(item.role) : onRegister()}
                    className="w-full rounded-xl border border-primary text-primary hover:bg-primary hover:text-primary-foreground py-2.5 text-xs font-semibold transition"
                  >
                    Register as {item.name}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 7. Call-to-Action Section */}
      <section className="py-20 border-b border-border bg-background">
        <div className="mx-auto max-w-5xl px-5 text-center">
          <div className="rounded-3xl border border-primary/20 bg-secondary/30 p-10 md:p-16 space-y-6">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground">
              Be Part of the Future of Smart Agriculture.
            </h2>
            <p className="mx-auto max-w-2xl text-sm md:text-base text-muted-foreground leading-relaxed">
              Join thousands of farmers, quality inspectors, buyers, and logistics partners operating on a single, transparent, and technology-driven agriculture platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <button
                onClick={onRegister}
                className="rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-md hover:opacity-90 transition"
              >
                Create an Account
              </button>
              <button
                onClick={onLogin}
                className="rounded-xl border border-border bg-card px-8 py-3.5 text-sm font-semibold text-foreground hover:bg-muted transition"
              >
                Login to Your Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer id="contact" className="bg-card py-12 text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 pb-12 border-b border-border">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs tracking-tight select-none">
                  AT
                </div>
                <span className="font-extrabold tracking-tight">AgriTrade</span>
              </div>
              <p className="text-xs leading-relaxed">
                End-to-end agriculture procurement and supply chain management platform connecting farmers, inspectors, buyers, and logistics.
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Platform Navigation</p>
              <ul className="space-y-2 text-xs">
                <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home') }} className="hover:text-primary">Home</a></li>
                <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about') }} className="hover:text-primary">About AgriTrade</a></li>
                <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works') }} className="hover:text-primary">How It Works</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }} className="hover:text-primary">Platform Features</a></li>
                <li><a href="#roles" onClick={(e) => { e.preventDefault(); scrollTo('roles') }} className="hover:text-primary">User Workspaces</a></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Workspaces</p>
              <ul className="space-y-2 text-xs">
                <li><button onClick={() => onRoleRegister ? onRoleRegister('farmer') : onRegister()} className="hover:text-primary">Farmer Portal</button></li>
                <li><button onClick={() => onRoleRegister ? onRoleRegister('quality_inspector') : onRegister()} className="hover:text-primary">Quality Inspector Workbench</button></li>
                <li><button onClick={() => onRoleRegister ? onRoleRegister('buyer') : onRegister()} className="hover:text-primary">Buyer Sourcing Hub</button></li>
                <li><button onClick={() => onRoleRegister ? onRoleRegister('logistics_coordinator') : onRegister()} className="hover:text-primary">Logistics Operations Hub</button></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Contact & Support</p>
              <p className="text-xs">Support: support@agritrade.com</p>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} AgriTrade Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

