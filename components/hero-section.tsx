'use client'

/**
 * COMPONENT: HeroSection — Homepage landing hero
 * USED IN: app/page.tsx (Homepage)
 * Full-screen headline, animated tagline, CTA buttons to /demo and /product
 */

import Link from 'next/link'
import { ArrowRight, ChevronDown, Shield, Cpu, Server } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function HeroSection() {
  const { t } = useI18n()
  const h = t.hero

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#09090b] grid-bg">
      {/* Radial orange glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(232,101,10,0.14) 0%, transparent 70%)' }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8650a]/30 to-transparent" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20">
        <div className="max-w-4xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-[#27272a] bg-[#111113] rounded-sm px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8650a] animate-pulse" />
            <span className="text-xs text-[#a1a1aa] font-mono tracking-widest uppercase">{h.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold text-[#fafafa] leading-[1.05] tracking-tight text-balance mb-6">
            {h.title1}{' '}
            <span className="text-[#e8650a]">{h.titleAccent}</span>{' '}
            {h.title2}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-[#a1a1aa] leading-relaxed max-w-2xl mx-auto mb-10 text-pretty">
            {h.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/demo"
              className="flex items-center gap-2 bg-[#e8650a] hover:bg-[#d15a08] text-white font-semibold text-sm px-7 py-3.5 rounded-sm transition-all hover:shadow-[0_0_30px_rgba(232,101,10,0.35)] group"
            >
              {h.cta1}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/demo"
              className="flex items-center gap-2 border border-[#27272a] hover:border-[#52525b] text-[#a1a1aa] hover:text-[#fafafa] font-medium text-sm px-7 py-3.5 rounded-sm transition-all bg-[#111113]/50"
            >
              {h.cta2}
            </Link>
          </div>

          {/* Trust badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 border-t border-[#1c1c1f] pt-8">
            <TrustBadge icon={<Cpu size={14} />} label={h.trust1} />
            <div className="hidden sm:block w-px h-5 bg-[#27272a]" />
            <TrustBadge icon={<Shield size={14} />} label={h.trust2} />
            <div className="hidden sm:block w-px h-5 bg-[#27272a]" />
            <TrustBadge icon={<Server size={14} />} label={h.trust3} />
          </div>
        </div>

        {/* Dashboard preview teaser */}
        <div className="mt-20 relative max-w-5xl mx-auto">
          <div className="absolute -inset-x-4 -inset-y-4 bg-[#e8650a]/5 rounded-lg blur-2xl pointer-events-none" />
          <div className="relative border border-[#27272a] rounded-md overflow-hidden bg-[#0d0d0f] shadow-2xl">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1c1c1f] bg-[#111113]">
              <span className="w-3 h-3 rounded-full bg-[#3a3a3d]" />
              <span className="w-3 h-3 rounded-full bg-[#3a3a3d]" />
              <span className="w-3 h-3 rounded-full bg-[#3a3a3d]" />
              <span className="ml-4 text-xs font-mono text-[#52525b]">{h.dashboardLabel}</span>
              <div className="ml-auto flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-xs text-[#52525b] font-mono">{h.live}</span>
              </div>
            </div>
            <DashboardPreviewHero />
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
        <ChevronDown size={18} className="text-[#52525b]" />
      </div>
    </section>
  )
}

function TrustBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-[#71717a]">
      <span className="text-[#e8650a]">{icon}</span>
      <span className="text-xs font-mono tracking-wider uppercase">{label}</span>
    </div>
  )
}

function DashboardPreviewHero() {
  const machines = [
    { name: 'Turbine A-12', rul: 87, health: 'good', temp: '312°C', vibration: '0.42g' },
    { name: 'Compressor B-7', rul: 34, health: 'warning', temp: '428°C', vibration: '1.87g' },
    { name: 'Pump C-3', rul: 62, health: 'good', temp: '195°C', vibration: '0.61g' },
    { name: 'Motor D-19', rul: 11, health: 'critical', temp: '521°C', vibration: '3.24g' },
  ]

  const healthColor: Record<string, string> = { good: '#10b981', warning: '#f59e0b', critical: '#ef4444' }
  const healthBg: Record<string, string> = { good: 'rgba(16,185,129,0.1)', warning: 'rgba(245,158,11,0.1)', critical: 'rgba(239,68,68,0.12)' }

  return (
    <div className="p-4 md:p-6 scan-line">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <KPICard label="Machines Monitored" value="48" delta="+3 this week" positive />
        <KPICard label="Active Alerts" value="3" delta="2 critical" positive={false} />
        <KPICard label="Avg. RUL (days)" value="58" delta="+12 vs last cycle" positive />
        <KPICard label="Downtime Prevented" value="94%" delta="vs baseline" positive />
      </div>

      <div className="border border-[#1c1c1f] rounded-sm overflow-hidden">
        <div className="grid grid-cols-5 gap-2 px-4 py-2 border-b border-[#1c1c1f] bg-[#0d0d0f]">
          {['Asset', 'RUL (days)', 'Temp', 'Vibration', 'Status'].map((h) => (
            <span key={h} className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">{h}</span>
          ))}
        </div>
        {machines.map((m, i) => (
          <div
            key={m.name}
            className={`grid grid-cols-5 gap-2 px-4 py-3 border-b border-[#1a1a1d] ${i === machines.length - 1 ? 'border-b-0' : ''} ${m.health === 'critical' ? 'bg-red-950/10' : ''}`}
          >
            <span className="text-xs text-[#e4e4e7] font-medium truncate">{m.name}</span>
            <div className="flex items-center gap-2">
              <div className="h-1.5 flex-1 bg-[#1c1c1f] rounded-full overflow-hidden max-w-[60px]">
                <div className="h-full rounded-full transition-all" style={{ width: `${m.rul}%`, background: healthColor[m.health] }} />
              </div>
              <span className="text-xs font-mono text-[#a1a1aa]">{m.rul}</span>
            </div>
            <span className="text-xs font-mono text-[#71717a]">{m.temp}</span>
            <span className="text-xs font-mono text-[#71717a]">{m.vibration}</span>
            <span className="inline-flex items-center text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm w-fit"
              style={{ color: healthColor[m.health], background: healthBg[m.health] }}>
              {m.health}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <SparklineCard label="Vibration — Compressor B-7" color="#f59e0b" data={[0.4, 0.6, 0.9, 1.1, 1.4, 1.6, 1.87]} />
        <SparklineCard label="Temperature — Motor D-19" color="#ef4444" data={[380, 410, 440, 468, 490, 510, 521]} />
        <SparklineCard label="RUL Forecast — Avg Fleet" color="#e8650a" data={[72, 70, 67, 64, 62, 60, 58]} />
      </div>
    </div>
  )
}

function KPICard({ label, value, delta, positive }: { label: string; value: string; delta: string; positive: boolean }) {
  return (
    <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-3">
      <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-1">{label}</p>
      <p className="text-xl font-bold text-[#fafafa]">{value}</p>
      <p className={`text-[10px] mt-0.5 ${positive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{delta}</p>
    </div>
  )
}

function SparklineCard({ label, color, data }: { label: string; color: string; data: number[] }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const norm = data.map((v) => ((v - min) / (max - min || 1)) * 32)
  const w = 80; const h = 36
  const pts = norm.map((v, i) => `${(i / (data.length - 1)) * w},${h - v - 2}`).join(' ')
  return (
    <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-3">
      <p className="text-[10px] font-mono text-[#52525b] mb-2 truncate">{label}</p>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-9">
        <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={w} cy={h - norm[norm.length - 1] - 2} r="2.5" fill={color} />
      </svg>
      <p className="text-xs font-mono mt-1" style={{ color }}>{data[data.length - 1]}</p>
    </div>
  )
}
