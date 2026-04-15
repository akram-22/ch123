'use client'

/**
 * PAGE: Post-Login Welcome / System Boot Screen
 * ROUTE: /client/welcome
 * PURPOSE: Shown immediately after login — animated system status boot sequence
 *          before redirecting the client into their live dashboard
 */

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import {
  ArrowRight, Wifi, Cpu, Activity, ShieldCheck, CheckCircle2
} from 'lucide-react'

// ─── System status items ───────────────────────────────────────────────────
const STATUS_ITEMS = [
  {
    icon: Wifi,
    label: '5 Mainteligence Sense devices active',
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.18)',
    delay: 0,
  },
  {
    icon: Cpu,
    label: '5 machines connected',
    color: '#e8650a',
    glow: 'rgba(232,101,10,0.18)',
    delay: 120,
  },
  {
    icon: Activity,
    label: 'Real-time monitoring enabled',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.18)',
    delay: 240,
  },
  {
    icon: ShieldCheck,
    label: 'AI prediction system active',
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.18)',
    delay: 360,
  },
]

// ─── Animated pulsing dot ──────────────────────────────────────────────────
function PulseDot({ color }: { color: string }) {
  return (
    <span className="relative flex h-2 w-2 flex-shrink-0">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full h-2 w-2"
        style={{ backgroundColor: color }}
      />
    </span>
  )
}

// ─── Individual status card with staggered fade-in ────────────────────────
function StatusCard({
  item,
  visible,
}: {
  item: typeof STATUS_ITEMS[0]
  visible: boolean
}) {
  const Icon = item.icon
  return (
    <div
      className="flex items-center gap-3 bg-[#111113] border border-[#1c1c1f] rounded-sm px-4 py-3 transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(8px)',
        boxShadow: visible ? `0 0 16px ${item.glow}` : 'none',
      }}
    >
      <div
        className="w-7 h-7 rounded-sm flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${item.color}15`, border: `1px solid ${item.color}25` }}
      >
        <Icon size={13} style={{ color: item.color }} />
      </div>
      <p className="text-xs font-mono text-[#a1a1aa] leading-snug flex-1">{item.label}</p>
      <PulseDot color={item.color} />
    </div>
  )
}

// ─── Main welcome page ─────────────────────────────────────────────────────
export default function WelcomePage() {
  const router  = useRouter()
  const { user, loading } = useAuth()

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  // Staggered visibility state for each card
  const [visibleCards, setVisibleCards] = useState<boolean[]>(
    new Array(STATUS_ITEMS.length).fill(false)
  )
  // Header + hero fade-in
  const [heroVisible, setHeroVisible] = useState(false)
  // Button fade-in (after all cards)
  const [btnVisible, setBtnVisible] = useState(false)

  useEffect(() => {
    if (loading || !user) return

    // Hero fades in immediately
    const t0 = setTimeout(() => setHeroVisible(true), 80)

    // Each status card staggers in
    const timers = STATUS_ITEMS.map((item, i) =>
      setTimeout(() => {
        setVisibleCards(prev => {
          const next = [...prev]
          next[i] = true
          return next
        })
      }, 500 + item.delay)
    )

    // Button appears after last card
    const tBtn = setTimeout(() => setBtnVisible(true), 500 + STATUS_ITEMS.length * 120 + 300)

    return () => {
      clearTimeout(t0)
      timers.forEach(clearTimeout)
      clearTimeout(tBtn)
    }
  }, [loading, user])

  if (loading || !user) return null

  return (
    <div
      className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
      style={{ fontFamily: 'var(--font-mono, monospace)' }}
    >
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(232,101,10,0.05) 0%, rgba(59,130,246,0.04) 40%, transparent 70%)',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* ── Content card ───────────────────────────────────────── */}
      <div
        className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8 transition-all duration-700"
        style={{ opacity: heroVisible ? 1 : 0, transform: heroVisible ? 'translateY(0)' : 'translateY(16px)' }}
      >

        {/* Logos row — Sonatrach + Mainteligence */}
        <div className="flex items-center gap-6">
          {/* Sonatrach logo */}
          <div className="flex flex-col items-center">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/JLNPfncQ3f6UlaAWHnQOA-5llTnbCCzzj5xhyOe5H0sOccNCcmcE.png"
              alt="Sonatrach corporate logo"
              className="w-16 h-16 object-contain"
              style={{ filter: 'brightness(1.05) contrast(1.05)' }}
            />
          </div>

          {/* Divider */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-px h-10 bg-[#27272a]" />
            <span className="text-[8px] font-mono text-[#3a3a3d] tracking-widest">×</span>
            <div className="w-px h-10 bg-[#27272a]" />
          </div>

          {/* Mainteligence logo */}
          <div className="flex items-center gap-2">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/G5GBg0NwHnI0ygSX2aOgv-yHCBfxf9exqvRH4s5vViaYhdSw2A6T.png"
              alt="Mainteligence logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-sm font-semibold text-[#fafafa] whitespace-nowrap tracking-tight">
              Maint<span style={{ color: '#e8650a' }}>elligence</span>
            </span>
          </div>
        </div>

        {/* Company name badge */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[9px] font-mono uppercase tracking-[0.25em] text-[#e8650a] border border-[#e8650a]/20 bg-[#e8650a]/6 px-3 py-1 rounded-sm">
            Secure Client Platform
          </span>
          <p className="text-[11px] font-mono text-[#52525b] tracking-widest uppercase mt-1">
            Sonatrach — Mechanical Division
          </p>
        </div>

        {/* Main heading */}
        <div className="text-center flex flex-col gap-3">
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#fafafa] tracking-tight leading-snug text-balance">
            Welcome to your{' '}
            <span style={{ color: '#e8650a' }}>Mainteligence</span>{' '}
            platform
          </h1>
          <p className="text-sm text-[#52525b] leading-relaxed max-w-md text-pretty">
            Monitor your industrial assets in real-time with AI-powered predictive maintenance
          </p>
        </div>

        {/* ── System status panel ──────────────────────────────── */}
        <div className="w-full bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-1 overflow-hidden">
          {/* Panel header */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1c1c1f]">
            <CheckCircle2 size={11} className="text-[#10b981]" />
            <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#52525b]">System Status</span>
            <div className="ml-auto flex items-center gap-1.5">
              <PulseDot color="#10b981" />
              <span className="text-[9px] font-mono text-[#10b981]">All systems operational</span>
            </div>
          </div>

          {/* Status cards */}
          <div className="flex flex-col gap-1.5 p-2">
            {STATUS_ITEMS.map((item, i) => (
              <StatusCard key={item.label} item={item} visible={visibleCards[i]} />
            ))}
          </div>
        </div>

        {/* ── Enter Dashboard CTA ──────────────────────────────── */}
        <div
          className="w-full transition-all duration-500"
          style={{ opacity: btnVisible ? 1 : 0, transform: btnVisible ? 'translateY(0)' : 'translateY(8px)' }}
        >
          <button
            onClick={() => router.push('/client/dashboard')}
            className="w-full flex items-center justify-center gap-2.5 bg-[#e8650a] hover:bg-[#d15a08] text-white font-medium text-sm px-6 py-3.5 rounded-sm transition-all hover:shadow-[0_0_28px_rgba(232,101,10,0.35)] group"
          >
            Enter Dashboard
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <p className="text-center text-[10px] font-mono text-[#27272a] mt-3">
            Logged in as{' '}
            <span className="text-[#3a3a3d]">{user.email}</span>
            {' '}·{' '}
            <button
              onClick={() => router.push('/client/dashboard')}
              className="text-[#3a3a3d] hover:text-[#52525b] transition-colors"
            >
              skip intro
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
