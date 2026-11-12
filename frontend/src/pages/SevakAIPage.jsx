import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  Bot,
  User,
  Lightbulb,
  CloudSun,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Copy,
  ChevronRight,
  HelpCircle,
  Leaf,
  ShieldCheck,
  Truck,
  Droplets,
  ThermometerSun,
} from 'lucide-react'

const KNOWLEDGE_RESPONSES = [
  {
    keywords: ['mango', 'mildew', 'powdery', 'fungus'],
    title: 'Powdery Mildew Treatment for Mango Grove',
    response: `**Diagnosis:** Powdery Mildew (*Oidium mangiferae*) typically attacks blossoms and young leaves in cool, dry mornings followed by warm days.

**Action Plan:**
1. **Immediate Spray:** Apply Wettable Sulphur 80% WP @ 2.5–3.0 g per liter of water, or Hexaconazole 5% EC @ 1 ml per liter.
2. **Timing:** Spray during early morning (before 9:00 AM) or late afternoon to avoid flower scorch.
3. **Canopy Management:** Prune crowded inner branches to allow sunlight penetration and airflow.
4. **Follow-up:** Repeat spray in 12–14 days if cloudy weather persists.`,
  },
  {
    keywords: ['fertilizer', 'urea', 'dap', 'dosage', 'npk', 'soil'],
    title: 'Customized NPK & Fertilizer Recommendation',
    response: `**Balanced Nutrition Guide (per acre):**

* **Basal Application (at planting):**
  * DAP (Di-Ammonium Phosphate): 50 kg/acre
  * MOP (Muriate of Potash): 25–30 kg/acre
  * Zinc Sulphate: 5 kg/acre (prevents leaf chlorosis)

* **Top Dressing (30–35 days after sowing):**
  * Urea: 40 kg/acre (split into two doses for optimal uptake)
  * Neem-coated urea is recommended to slow nitrogen leaching.

* **Foliar Micronutrient Boost:** Spray 19:19:19 water-soluble NPK @ 5 g/L during pre-flowering stage.`,
  },
  {
    keywords: ['price', 'mandi', 'rate', 'market', 'trend', 'cost'],
    title: 'Mandi Market Intelligence & Price Outlook',
    response: `**Live Benchmark Rates across Key Hubs:**

* **Alphonso Mango (A-Grade):** ₹3,800 – ₹4,600 / crate (12–14 dozen). Strong export demand.
* **Soybean (Yellow):** ₹4,750 – ₹5,100 / quintal (Moisture < 10%). MSP buffer active.
* **Hybrid Tomatoes:** ₹1,400 – ₹1,850 / crate (25 kg). Higher prices expected next week due to reduced incoming shipments.

**Recommendation:** If your produce passes Grade A quality certification on Rythu Sevak, list batches with a 7–10% premium over local APMC spot rates.`,
  },
  {
    keywords: ['moisture', 'inspection', 'grade', 'quality', 'standard'],
    title: 'Quality Inspection & Grading Criteria',
    response: `**Grade A Export Standards Checklist:**

1. **Moisture Content:** Max 10.0% for oilseeds & pulses; max 12.0% for cereals.
2. **Foreign Matter:** Less than 0.5% (debris, dust, immature kernels).
3. **Uniformity:** > 92% uniform size and color distribution.
4. **Pest & Chemical Residue:** Zero live weevils; pesticide MRL within APEDA/FSSAI limits.

*Tip: Properly dried grains stored in hermetic bags earn certified Grade A faster during inspector evaluation.*`,
  },
  {
    keywords: ['storage', 'temperature', 'cold chain', 'transit', 'logistics', 'vehicle'],
    title: 'Optimal Cold-Chain & Transit Guidelines',
    response: `**Transport Temperature & Handling Matrix:**

* **Fresh Mangoes:** Maintain 12°C to 13°C, Relative Humidity 85–90%. Do not drop below 10°C to prevent chilling injury.
* **Vegetables & Greens:** Maintain 4°C to 6°C, fast-transit vehicle recommended.
* **Grain & Pulses:** Dry ventilated container, ambient temperature, moisture-sealed packaging.

*All Rythu Sevak dispatches include GPS telemetry and digital handoff logging upon delivery.*`,
  },
]

const QUICK_PROMPTS = [
  'How to cure powdery mildew on Alphonso mango trees?',
  'What is the recommended fertilizer dosage for 5 acres of soybean?',
  'What are the current tomato and mango mandi price trends?',
  'What are the moisture standards for Grade A certification?',
  'What is the best cold-chain temperature for transporting fresh fruit?',
]

export function SevakAIPage({ role = 'farmer', userName = 'Farmer' }) {
  const [messages, setMessages] = useState(() => [
    {
      id: 'welcome',
      sender: 'ai',
      text: `Namaste **${userName}**! 🙏 I am **Sevak AI**, your dedicated agro intelligence copilot. 

Ask me anything about:
* **Crop disease identification & treatment**
* **NPK and organic fertilizer dosages**
* **Real-time mandi rates & price predictions**
* **Harvest timing, moisture standards & cold storage**

How can I help your agricultural operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ])

  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [copiedId, setCopiedId] = useState(null)
  const chatBottomRef = useRef(null)

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = (userQuery) => {
    const query = (userQuery || input).trim()
    if (!query) return

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    setTimeout(() => {
      const lower = query.toLowerCase()
      const match = KNOWLEDGE_RESPONSES.find((item) =>
        item.keywords.some((kw) => lower.includes(kw))
      )

      let replyText = ''
      if (match) {
        replyText = match.response
      } else {
        replyText = `**Agronomic Guidance for:** "${query}"

1. **Immediate Assessment:** Based on your registered region (*Nashik Agricultural Belt*), current soil moisture and relative humidity levels are optimal for steady crop development.
2. **Preventative Measures:** Ensure proper drainage around field boundaries to prevent root-rot during heavy dew periods.
3. **Quality Certification:** Make sure crops are inspected on the Rythu Sevak platform prior to batch harvesting to lock in verified Grade A pricing on the buyer marketplace.

*Feel free to ask about specific crops, chemical formulations, or mandi rate forecasts!*`
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ])
      setIsTyping(false)
    }, 700)
  }

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleResetChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: `Chat refreshed. Ask me any question regarding your crops, pest management, market rates, or quality certifications!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ])
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Top Banner */}
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md">
            <Sparkles size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Sevak AI</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Agro Copilot Active
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              Your 24/7 intelligent agricultural advisor for crop health, fertilizer dosages, mandi prices, and quality standards.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="inline-flex items-center gap-1.5 self-start md:self-auto rounded-xl border border-border px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition"
        >
          <RotateCcw size={14} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Main Grid: Chat on Left, Agro Intelligence Widgets on Right */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Chat Window */}
        <section className="flex flex-col rounded-3xl border border-border bg-card shadow-sm overflow-hidden min-h-[580px] max-h-[720px]">
          {/* Quick Prompts Bar */}
          <div className="border-b border-border/70 bg-muted/40 p-3.5 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-muted-foreground shrink-0 flex items-center gap-1">
              <Lightbulb size={13} className="text-amber-500" /> Suggestions:
            </span>
            {QUICK_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                className="shrink-0 text-[11px] font-medium px-3 py-1 rounded-full border border-border/80 bg-background hover:border-primary hover:text-primary transition shadow-2xs truncate max-w-[280px]"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m) => {
              const isAi = m.sender === 'ai'
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isAi ? '' : 'flex-row-reverse'}`}
                >
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-xl font-bold text-xs select-none shadow-xs ${
                      isAi
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-primary'
                    }`}
                  >
                    {isAi ? <Bot size={16} /> : <User size={16} />}
                  </div>

                  <div className={`group relative max-w-[85%] sm:max-w-[78%] space-y-1.5`}>
                    <div
                      className={`rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                        isAi
                          ? 'border border-border/80 bg-background text-foreground'
                          : 'bg-primary text-primary-foreground font-medium'
                      }`}
                    >
                      {m.text}
                    </div>

                    <div
                      className={`flex items-center gap-2 text-[10px] text-muted-foreground px-1 ${
                        isAi ? 'justify-start' : 'justify-end'
                      }`}
                    >
                      <span>{m.timestamp}</span>
                      {isAi && (
                        <button
                          type="button"
                          onClick={() => handleCopy(m.id, m.text)}
                          className="opacity-0 group-hover:opacity-100 transition hover:text-foreground flex items-center gap-0.5"
                          title="Copy text"
                        >
                          {copiedId === m.id ? (
                            <span className="text-emerald-600 flex items-center gap-0.5">
                              <CheckCircle2 size={11} /> Copied
                            </span>
                          ) : (
                            <Copy size={11} />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {isTyping && (
              <div className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Bot size={16} />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl border border-border/80 bg-background px-4 py-3 text-xs text-muted-foreground">
                  <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                  <span className="size-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                  <span className="size-2 rounded-full bg-primary animate-bounce" />
                  <span className="ml-1 text-[11px] font-medium">Sevak AI is analyzing agronomic data...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            className="border-t border-border bg-card p-3 sm:p-4 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sevak AI (e.g. fertilizer mix, mandi rates, disease spray)..."
              className="flex-1 rounded-2xl border border-border bg-background py-3 px-4 text-xs sm:text-sm text-foreground outline-none transition focus:border-primary shadow-inner"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="inline-flex items-center justify-center size-11 rounded-2xl bg-primary text-primary-foreground shadow-md hover:opacity-90 disabled:opacity-40 transition"
              title="Send Message"
            >
              <Send size={18} />
            </button>
          </form>
        </section>

        {/* Right Agro Intelligence Widgets */}
        <aside className="space-y-4 flex flex-col">
          {/* Micro-Climate Card */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <CloudSun size={16} className="text-amber-500" /> Regional Agro Weather
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Spraying Ideal
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-2xl bg-muted/50">
                <p className="text-muted-foreground text-[10px]">Avg Temperature</p>
                <p className="font-extrabold text-foreground text-lg mt-0.5">28.4°C</p>
                <p className="text-[10px] text-muted-foreground">Optimal leaf growth</p>
              </div>
              <div className="p-3 rounded-2xl bg-muted/50">
                <p className="text-muted-foreground text-[10px]">Relative Humidity</p>
                <p className="font-extrabold text-foreground text-lg mt-0.5">62%</p>
                <p className="text-[10px] text-muted-foreground">Low fungal risk</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Dew levels are standard. Ideal window for prophylactic micronutrient foliar application before 10 AM.
            </p>
          </div>

          {/* Mandi Benchmark Snapshot */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <TrendingUp size={16} className="text-primary" /> Key Mandi Spot Rates
              </span>
              <span className="text-[10px] font-semibold text-muted-foreground">APMC Realtime</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
                <div>
                  <p className="font-semibold text-foreground">Alphonso Mango</p>
                  <p className="text-[10px] text-muted-foreground">Grade A (Crate)</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400">₹4,250</p>
                  <p className="text-[10px] text-emerald-600">+4.2%</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
                <div>
                  <p className="font-semibold text-foreground">Yellow Soybean</p>
                  <p className="text-[10px] text-muted-foreground">Clean dry (Qtl)</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-foreground">₹4,890</p>
                  <p className="text-[10px] text-muted-foreground">Stable</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40">
                <div>
                  <p className="font-semibold text-foreground">Hybrid Tomato</p>
                  <p className="text-[10px] text-muted-foreground">25 kg crate</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-emerald-600 dark:text-emerald-400">₹1,720</p>
                  <p className="text-[10px] text-emerald-600">+8.5%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pest Alert Notification */}
          <div className="rounded-3xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs space-y-2">
            <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold">
              <AlertTriangle size={15} />
              <span>Regional Pest Surveillance</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Early stem borer activity reported in neighboring clusters. Inspect your leaf nodes and spray Neem Oil (10,000 ppm) @ 2 ml/L as organic defense.
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

