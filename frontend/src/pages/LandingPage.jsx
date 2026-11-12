import React from 'react'
import {
  AreaChart,
  Award,
  Bot,
  CheckCircle,
  ChevronRight,
  Compass,
  FileCheck,
  FileText,
  Globe,
  Leaf,
  LogOut,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tractor,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
} from 'lucide-react'

function LandingPage({ onLogin, onRegister, onRoleRegister, session, onGoToDashboard }) {
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
              RS
            </div>
            <span className="font-extrabold tracking-tight">Rythu Sevak</span>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
            <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home') }} className="hover:text-primary transition">Home</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about') }} className="hover:text-primary transition">About Us</a>
            <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works') }} className="hover:text-primary transition">How It Works</a>
            <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }} className="hover:text-primary transition">Features</a>
            <a href="#sevak-ai" onClick={(e) => { e.preventDefault(); scrollTo('sevak-ai') }} className="hover:text-primary transition flex items-center gap-1.5 font-bold text-primary">
              <Sparkles size={14} /> Sevak AI
            </a>
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
              Rythu Sevak simplifies land registration, polygon boundary mapping, quality inspection and grading,
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

      {/* 3. About Rythu Sevak */}
      <section id="about" className="py-20 border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-5">
              <span className="text-xs font-bold uppercase tracking-widest text-primary">About Rythu Sevak</span>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Unifying the Agricultural Supply Chain in One Connected Digital Platform.
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Traditional agriculture procurement is fragmented by lack of land boundary verification,
                inconsistent quality standards, price manipulation by middlemen, and delayed logistics.
              </p>
              <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                Rythu Sevak bridges this gap by directly linking <strong>Farmers</strong>, certified <strong>Quality Inspectors</strong>, <strong>Bulk Buyers</strong>,
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
                alt="Rythu Sevak platform ecosystem"
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
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">How Rythu Sevak Works</h2>
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
                desc: 'Satellite map integration allowing precise marking of agricultural land & farms.',
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

      {/* Sevak AI Showcase Section */}
      <section id="sevak-ai" className="relative overflow-hidden py-24 border-b border-border bg-gradient-to-b from-card via-card/95 to-background">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
                <Sparkles size={14} />
                <span>Next-Gen Agricultural Intelligence</span>
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Meet <span className="text-primary">Sevak AI</span>: Your Intelligent Farming Copilot
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Trained on regional agronomical knowledge, APMC market data, and weather telemetry, Sevak AI assists farmers, inspectors, buyers, and logistics coordinators with hyper-localized decisions.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  {
                    title: 'Precision Crop Disease Diagnosis',
                    desc: 'Instant remediation protocol and recommended chemical/organic dosages for fungal, bacterial, and pest attacks.',
                    icon: Leaf,
                  },
                  {
                    title: 'APMC Mandi Rate Intelligence',
                    desc: 'Real-time spot prices, price outlooks, and multi-market arbitrage recommendations for optimal harvest timing.',
                    icon: TrendingUp,
                  },
                  {
                    title: 'Soil Nutrition & NPK Calculator',
                    desc: 'Tailored basal and top-dressing fertilization schedules based on your crop stage and soil conditions.',
                    icon: ShieldCheck,
                  },
                ].map((item, idx) => {
                  const ItemIcon = item.icon
                  return (
                    <div key={idx} className="flex gap-4 items-start p-3.5 rounded-2xl border border-border/60 bg-background/60 shadow-xs">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ItemIcon size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={session ? onGoToDashboard : onRegister}
                  className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 transition"
                >
                  <Sparkles size={16} /> Try Sevak AI Copilot <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* AI Mock Chat Preview Card */}
            <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                    <Bot size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                      Sevak AI Copilot
                      <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Active Knowledge Model • 24/7 Agro Advisory</p>
                  </div>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary uppercase tracking-wide">
                  Live
                </span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Farmer Query */}
                <div className="flex gap-2.5 justify-end">
                  <div className="max-w-[85%] rounded-2xl rounded-tr-xs bg-primary px-4 py-3 text-primary-foreground">
                    <p className="font-medium leading-relaxed">
                      White powdery patches on my Alphonso mango blossoms. How should I treat it before it spreads?
                    </p>
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex gap-2.5 items-start">
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary mt-0.5">
                    <Sparkles size={14} />
                  </div>
                  <div className="max-w-[90%] rounded-2xl rounded-tl-xs border border-border bg-background p-4 shadow-xs space-y-2.5 text-muted-foreground">
                    <p className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-amber-500" />
                      Diagnosis: Powdery Mildew (Oidium mangiferae)
                    </p>
                    <p className="leading-relaxed text-[11px]">
                      1. Spray <strong>Wettable Sulphur 80% WP</strong> @ 2.5 g/L or <strong>Hexaconazole 5% EC</strong> @ 1 ml/L early in morning before 9 AM.<br/>
                      2. Prune dense interior canopy for sunlight & airflow.<br/>
                      3. Repeat after 12 days if humidity stays above 75%.
                    </p>
                    <div className="pt-1 border-t border-border/60 flex items-center justify-between text-[10px]">
                      <span className="text-primary font-medium">Confidence: 98% Verified</span>
                      <span className="text-muted-foreground">Safe for Grade-A export</span>
                    </div>
                  </div>
                </div>

                {/* Query chip samples */}
                <div className="flex gap-2 pt-2 overflow-x-auto">
                  <span className="shrink-0 rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground">
                    🌾 Today's APMC Mandi Rates
                  </span>
                  <span className="shrink-0 rounded-full border border-border bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground">
                    🧪 Urea vs DAP Soil Dosage
                  </span>
                </div>
              </div>
            </div>
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
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 pb-12 border-b border-border">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-base font-bold text-foreground">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs tracking-tight select-none">
                  RS
                </div>
                <span className="font-extrabold tracking-tight">Rythu Sevak</span>
              </div>
              <p className="text-xs leading-relaxed">
                End-to-end agriculture procurement and supply chain management platform connecting farmers, inspectors, buyers, and logistics.
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">
                Empowering Indian agriculture through transparent quality grading, polygon farm boundary mapping, and direct buyer access.
              </p>
            </div>

            <div>
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Platform Navigation</p>
              <ul className="space-y-2.5 text-xs">
                <li><a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home') }} className="hover:text-primary transition">Home</a></li>
                <li><a href="#about" onClick={(e) => { e.preventDefault(); scrollTo('about') }} className="hover:text-primary transition">About Rythu Sevak</a></li>
                <li><a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo('how-it-works') }} className="hover:text-primary transition">How It Works</a></li>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }} className="hover:text-primary transition">Platform Features</a></li>
                <li><a href="#sevak-ai" onClick={(e) => { e.preventDefault(); scrollTo('sevak-ai') }} className="hover:text-primary transition flex items-center gap-1 font-semibold text-primary"><Sparkles size={11} /> Sevak AI Copilot</a></li>
                <li><a href="#roles" onClick={(e) => { e.preventDefault(); scrollTo('roles') }} className="hover:text-primary transition">User Workspaces</a></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider mb-3">Contact & Support</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Assistance with farmer registration, GPS farm boundary mapping, harvest inspections, or order dispatch.
              </p>
              <div className="space-y-1.5 text-xs">
                <p><span className="font-semibold text-foreground">Email:</span> support@rythusevak.com</p>
                <p><span className="font-semibold text-foreground">Helpline:</span> +91 1800-425-AGRI (Toll Free)</p>
                <p><span className="font-semibold text-foreground">Hours:</span> Mon – Sat: 6:00 AM – 8:00 PM IST</p>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} Rythu Sevak Platform. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#home" onClick={(e) => { e.preventDefault(); scrollTo('home') }} className="hover:text-primary transition">Back to Top ↑</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export { LandingPage }
export default LandingPage

