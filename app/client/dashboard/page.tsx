'use client'

/**
 * PAGE: Client Platform Dashboard (Legacy / Auth-Protected)
 * ROUTE: /client/dashboard
 * PURPOSE: Older authenticated dashboard — machine fleet overview, alerts, sensor readings.
 *          Superseded by /dashboard for new unified platform experience.
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LogOut, Building2, Cpu, AlertTriangle, Activity, RefreshCw,
  ChevronRight, Thermometer, Zap, Gauge, BarChart2, FileText,
  User, Shield, Bell, ArrowRight, TrendingDown, CheckCircle2,
  Radio, Wifi, Download, Clock,
} from 'lucide-react'
import {
  useAuth,
  getPlanLabel, getPlanColor,
  getSeverityColor, getStatusColor, getStatusBg,
  formatLastSync,
  type ClientMachine, type ClientAlert,
} from '@/lib/auth'

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

type ClientSection = 'overview' | 'machines' | 'monitoring' | 'ai' | 'reports' | 'account'

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function getRulColor(rul: number) {
  if (rul <= 20) return '#ef4444'
  if (rul <= 45) return '#f59e0b'
  return '#10b981'
}

function getRulBg(rul: number) {
  if (rul <= 20) return 'rgba(239,68,68,0.08)'
  if (rul <= 45) return 'rgba(245,158,11,0.08)'
  return 'rgba(16,185,129,0.08)'
}

function RulBar({ value, max = 120 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100)
  const color = getRulColor(value)
  return (
    <div className="w-full h-1.5 bg-[#1c1c1f] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

function HealthBar({ value }: { value: number }) {
  const color = value >= 80 ? '#10b981' : value >= 55 ? '#f59e0b' : '#ef4444'
  return (
    <div className="w-full h-1.5 bg-[#1c1c1f] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${value}%`, backgroundColor: color }} />
    </div>
  )
}

// mini real-time sparkline
function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <div className="h-8 bg-[#111113] rounded-sm animate-pulse" />
  const W = 120, H = 32
  const min = Math.min(...data) - 2
  const max = Math.max(...data) + 2
  const pts = data.map((v, i) => [
    (i / (data.length - 1)) * W,
    H - 4 - ((v - min) / (max - min || 1)) * (H - 8),
  ])
  const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const area = `M0,${H} ` + pts.map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`).join(' ') + ` L${W},${H} Z`
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: 32 }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#','')})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

// AI model predictions based on sensor state
function deriveAI(m: ClientMachine) {
  const base = m.rul
  const noise = (s: number) => Math.max(0, base + Math.sin(base * s) * 4 - (m.vibration > 1.5 ? 6 : 0))
  const lstm  = parseFloat(noise(0.17).toFixed(1))
  const gru   = parseFloat(noise(0.13).toFixed(1))
  const rf    = parseFloat((noise(0.21) - 3).toFixed(1))
  const gb    = parseFloat((noise(0.09) + 1.5).toFixed(1))
  const ensemble = parseFloat((lstm * 0.35 + gru * 0.30 + rf * 0.20 + gb * 0.15).toFixed(1))
  const status = ensemble < 20 ? 'critical' : ensemble < 50 ? 'warning' : 'normal'
  return { lstm, gru, rf, gb, ensemble, status }
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: ClientSection; label: string; icon: React.ReactNode }[] = [
  { id: 'overview',   label: 'Overview',       icon: <BarChart2 size={14} /> },
  { id: 'machines',   label: 'Machines',        icon: <Cpu size={14} /> },
  { id: 'monitoring', label: 'Live Monitoring', icon: <Activity size={14} /> },
  { id: 'ai',         label: 'AI Insights',     icon: <Zap size={14} /> },
  { id: 'reports',    label: 'Reports',         icon: <FileText size={14} /> },
  { id: 'account',    label: 'Account',         icon: <User size={14} /> },
]

// ─────────────────────────────────────────────────────────────────────────────
// OVERVIEW SECTION
// ─────────────────────────────────────────────────────────────────────────────

function OverviewSection({ machines, alerts, avgHealth, lastSync, planExpiry, plan }: {
  machines: ClientMachine[]
  alerts: ClientAlert[]
  avgHealth: number
  lastSync: string
  planExpiry: string
  plan: string
}) {
  const critical = alerts.filter(a => a.severity === 'critical' && !a.resolved).length
  const warning  = alerts.filter(a => a.severity === 'warning'  && !a.resolved).length

  const kpis = [
    { label: 'Connected Machines', value: machines.length, sub: 'active sensors', icon: <Cpu size={13} />, color: '#3b82f6' },
    { label: 'Active Alerts', value: alerts.filter(a => !a.resolved).length,
      sub: `${critical} critical · ${warning} warning`, icon: <Bell size={13} />,
      color: critical > 0 ? '#ef4444' : warning > 0 ? '#f59e0b' : '#10b981' },
    { label: 'Avg Health Score', value: `${avgHealth}%`, sub: 'fleet average',
      icon: <Activity size={13} />, color: avgHealth >= 80 ? '#10b981' : avgHealth >= 60 ? '#f59e0b' : '#ef4444' },
    { label: 'Last Sync', value: formatLastSync(lastSync), sub: 'sensor data', icon: <RefreshCw size={13} />, color: '#a78bfa' },
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d]">{k.label}</span>
              <span style={{ color: k.color }}>{k.icon}</span>
            </div>
            <p className="text-2xl font-bold font-mono" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[10px] font-mono text-[#3a3a3d] mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Machine quick status */}
      <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm">
        <div className="px-5 py-3.5 border-b border-[#1c1c1f] flex items-center justify-between">
          <p className="text-xs font-semibold text-[#e4e4e7]">Fleet Status</p>
          <span className="text-[9px] font-mono text-[#3a3a3d]">{machines.length} machines</span>
        </div>
        <div className="divide-y divide-[#111113]">
          {machines.map(m => (
            <div key={m.id} className="px-5 py-3 flex items-center gap-4">
              <div className="flex items-center gap-2 w-44 min-w-0">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: getStatusColor(m.status) }} />
                <div className="min-w-0">
                  <p className="text-xs text-[#e4e4e7] truncate">{m.name}</p>
                  <p className="text-[9px] font-mono text-[#3a3a3d]">{m.id}</p>
                </div>
              </div>
              <div className="flex-1">
                <HealthBar value={m.healthScore} />
              </div>
              <span className="text-xs font-mono w-10 text-right" style={{ color: getRulColor(m.rul) }}>{m.rul}d</span>
              <span
                className="text-[9px] font-mono px-2 py-0.5 rounded-sm w-16 text-center flex-shrink-0"
                style={{ color: getStatusColor(m.status), background: getStatusBg(m.status) }}
              >
                {m.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Active alerts */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm">
          <div className="px-5 py-3.5 border-b border-[#1c1c1f] flex items-center gap-2">
            <AlertTriangle size={12} className="text-[#f59e0b]" />
            <p className="text-xs font-semibold text-[#e4e4e7]">Active Alerts</p>
          </div>
          <div className="divide-y divide-[#111113]">
            {alerts.filter(a => !a.resolved).map(a => (
              <div key={a.id} className="px-5 py-3 flex items-start gap-3">
                <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: getSeverityColor(a.severity) }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#e4e4e7] leading-snug">{a.message}</p>
                  <p className="text-[9px] font-mono text-[#3a3a3d] mt-0.5">{a.machineName} · {a.timestamp}</p>
                </div>
                <span
                  className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm flex-shrink-0"
                  style={{ color: getSeverityColor(a.severity), background: `${getSeverityColor(a.severity)}15` }}
                >
                  {a.severity}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MACHINES SECTION
// ─────────────────────────────────────────────────────────────────────────────

function MachinesSection({ machines }: { machines: ClientMachine[] }) {
  const [sel, setSel] = useState(machines[0]?.id ?? '')
  const machine = machines.find(m => m.id === sel) ?? machines[0]

  return (
    <div className="flex flex-col gap-4">
      {/* Machine selector */}
      <div className="flex flex-wrap gap-2">
        {machines.map(m => (
          <button
            key={m.id}
            onClick={() => setSel(m.id)}
            className={cn(
              'px-3.5 py-2 text-xs font-mono rounded-sm border transition-all',
              sel === m.id
                ? 'border-[#e8650a] text-[#e8650a] bg-[#e8650a]/8'
                : 'border-[#1c1c1f] text-[#52525b] hover:border-[#27272a] hover:text-[#71717a]'
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" style={{ backgroundColor: getStatusColor(m.status) }} />
            {m.id}
          </button>
        ))}
      </div>

      {machine && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Identity card */}
          <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-[#e4e4e7]">{machine.name}</p>
                <p className="text-[10px] font-mono text-[#3a3a3d] mt-0.5">{machine.id} · {machine.type}</p>
                <p className="text-[10px] font-mono text-[#3a3a3d]">{machine.location}</p>
              </div>
              <span
                className="text-[9px] font-mono uppercase px-2 py-1 rounded-sm"
                style={{ color: getStatusColor(machine.status), background: getStatusBg(machine.status) }}
              >
                {machine.status}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-[9px] font-mono mb-1.5">
                <span className="text-[#3a3a3d]">Health Score</span>
                <span style={{ color: machine.healthScore >= 80 ? '#10b981' : machine.healthScore >= 55 ? '#f59e0b' : '#ef4444' }}>
                  {machine.healthScore}%
                </span>
              </div>
              <HealthBar value={machine.healthScore} />
            </div>
            <div>
              <div className="flex justify-between text-[9px] font-mono mb-1.5">
                <span className="text-[#3a3a3d]">RUL Estimate</span>
                <span style={{ color: getRulColor(machine.rul) }}>{machine.rul} days</span>
              </div>
              <RulBar value={machine.rul} />
            </div>
            <p className="text-[9px] font-mono text-[#27272a]">Last sync: {machine.lastSync}</p>
          </div>

          {/* Sensor grid */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { label: 'Temperature', value: `${machine.temperature}°C`, icon: <Thermometer size={12} />, warn: machine.temperature > 400 },
              { label: 'Vibration',   value: `${machine.vibration}g`,    icon: <Activity size={12} />,    warn: machine.vibration > 1.0 },
              { label: 'Pressure',    value: machine.pressure !== 0 ? `${machine.pressure} bar` : 'N/A', icon: <Gauge size={12} />, warn: false },
              { label: 'RPM',         value: machine.rpm > 0 ? machine.rpm.toLocaleString() : 'N/A',     icon: <RefreshCw size={12} />, warn: false },
              { label: 'Current',     value: machine.current > 0 ? `${machine.current} A` : 'N/A',       icon: <Zap size={12} />,       warn: false },
              { label: 'RUL',         value: `${machine.rul} days`,      icon: <Clock size={12} />,       warn: machine.rul < 45 },
            ].map(s => (
              <div key={s.label} className="bg-[#0d0d0f] border border-[#1a1a1d] rounded-sm p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-[#3a3a3d]">{s.label}</span>
                  <span style={{ color: s.warn ? '#f59e0b' : '#27272a' }}>{s.icon}</span>
                </div>
                <p className="text-base font-bold font-mono" style={{ color: s.warn ? '#f59e0b' : '#a1a1aa' }}>
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE MONITORING SECTION
// ─────────────────────────────────────────────────────────────────────────────

type SensorHistory = {
  temp: number[]
  vibration: number[]
  health: number[]
  rpm: number[]
}

function MonitoringSection({ machines }: { machines: ClientMachine[] }) {
  const [sel, setSel]         = useState(machines[0]?.id ?? '')
  const [running, setRunning] = useState(false)
  const [tick, setTick]       = useState(0)
  const histRef = useRef<Record<string, SensorHistory>>({})
  const [hist, setHist]       = useState<Record<string, SensorHistory>>({})
  const intervalRef           = useRef<ReturnType<typeof setInterval> | null>(null)

  const machine = machines.find(m => m.id === sel) ?? machines[0]

  // init history
  useEffect(() => {
    machines.forEach(m => {
      histRef.current[m.id] = { temp: [m.temperature], vibration: [m.vibration], health: [m.healthScore], rpm: [m.rpm] }
    })
    setHist({ ...histRef.current })
  }, [machines])

  const tickFn = useCallback(() => {
    setTick(t => {
      machines.forEach(m => {
        const h = histRef.current[m.id]
        if (!h) return
        const jitter = (range: number) => (Math.random() - 0.5) * range
        const next = {
          temp:      [...h.temp.slice(-59),      Math.max(0,  m.temperature  + jitter(12))],
          vibration: [...h.vibration.slice(-59), Math.max(0,  m.vibration    + jitter(0.2))],
          health:    [...h.health.slice(-59),    Math.min(100, Math.max(0, m.healthScore + jitter(3)))],
          rpm:       [...h.rpm.slice(-59),       Math.max(0,  m.rpm          + jitter(40))],
        }
        histRef.current[m.id] = next
      })
      setHist({ ...histRef.current })
      return t + 1
    })
  }, [machines])

  function start()  { if (intervalRef.current) clearInterval(intervalRef.current); intervalRef.current = setInterval(tickFn, 1000); setRunning(true) }
  function stop()   { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false) }
  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])

  const selHist = hist[sel] ?? { temp: [], vibration: [], health: [], rpm: [] }
  const latestTemp = selHist.temp[selHist.temp.length - 1] ?? machine?.temperature ?? 0
  const latestVib  = selHist.vibration[selHist.vibration.length - 1] ?? machine?.vibration ?? 0
  const latestHlt  = selHist.health[selHist.health.length - 1] ?? machine?.healthScore ?? 0
  const latestRpm  = selHist.rpm[selHist.rpm.length - 1] ?? machine?.rpm ?? 0

  return (
    <div className="flex flex-col gap-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex flex-wrap gap-2">
          {machines.map(m => (
            <button key={m.id} onClick={() => setSel(m.id)}
              className={cn(
                'px-3 py-1.5 text-[10px] font-mono rounded-sm border transition-all',
                sel === m.id ? 'border-[#e8650a] text-[#e8650a] bg-[#e8650a]/8' : 'border-[#1c1c1f] text-[#52525b] hover:border-[#27272a]'
              )}
            >
              <span className="w-1.5 h-1.5 rounded-full inline-block mr-1.5" style={{ backgroundColor: getStatusColor(m.status) }} />
              {m.id}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {running && (
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#10b981]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              LIVE · tick {tick}
            </span>
          )}
          <button onClick={running ? stop : start}
            className={cn(
              'px-4 py-2 text-xs font-mono rounded-sm border transition-all',
              running
                ? 'border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/8'
                : 'border-[#e8650a]/40 text-[#e8650a] hover:bg-[#e8650a]/8'
            )}
          >
            {running ? 'Stop Stream' : 'Start Live Stream'}
          </button>
        </div>
      </div>

      {/* Live values */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Temperature', value: `${latestTemp.toFixed(1)}°C`,  data: selHist.temp,      color: latestTemp > 400 ? '#ef4444' : '#f59e0b' },
          { label: 'Vibration',   value: `${latestVib.toFixed(2)}g`,    data: selHist.vibration, color: latestVib  > 1.5 ? '#ef4444' : '#3b82f6' },
          { label: 'Health',      value: `${latestHlt.toFixed(0)}%`,    data: selHist.health,    color: latestHlt  < 55  ? '#ef4444' : latestHlt < 80 ? '#f59e0b' : '#10b981' },
          { label: 'RPM',         value: latestRpm.toFixed(0),          data: selHist.rpm,       color: '#a78bfa' },
        ].map(s => (
          <div key={s.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-4">
            <p className="text-[9px] font-mono uppercase tracking-wider text-[#3a3a3d] mb-2">{s.label}</p>
            <p className="text-xl font-bold font-mono mb-2" style={{ color: s.color }}>{s.value}</p>
            <MiniSparkline data={s.data.length > 1 ? s.data : [s.data[0] ?? 0, s.data[0] ?? 0]} color={s.color} />
          </div>
        ))}
      </div>

      {/* Sensor feed table */}
      <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm">
        <div className="px-5 py-3.5 border-b border-[#1c1c1f]">
          <p className="text-xs font-semibold text-[#e4e4e7]">All Machines — Current Readings</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs font-mono">
            <thead>
              <tr className="border-b border-[#1c1c1f]">
                {['Machine', 'Status', 'Temp (°C)', 'Vibration (g)', 'Pressure (bar)', 'RPM', 'Current (A)', 'Health'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left text-[9px] font-mono uppercase tracking-wider text-[#3a3a3d] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#111113]">
              {machines.map(m => (
                <tr key={m.id} className={cn('transition-colors', sel === m.id ? 'bg-[#e8650a]/4' : 'hover:bg-[#111113]')}>
                  <td className="px-4 py-2.5">
                    <p className="text-[#e4e4e7]">{m.name}</p>
                    <p className="text-[9px] text-[#3a3a3d]">{m.id}</p>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[9px] px-1.5 py-0.5 rounded-sm" style={{ color: getStatusColor(m.status), background: getStatusBg(m.status) }}>
                      {m.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-2.5" style={{ color: m.temperature > 450 ? '#ef4444' : m.temperature > 380 ? '#f59e0b' : '#a1a1aa' }}>{m.temperature}</td>
                  <td className="px-4 py-2.5" style={{ color: m.vibration > 2.0 ? '#ef4444' : m.vibration > 1.2 ? '#f59e0b' : '#a1a1aa' }}>{m.vibration}</td>
                  <td className="px-4 py-2.5 text-[#a1a1aa]">{m.pressure > 0 ? m.pressure : '—'}</td>
                  <td className="px-4 py-2.5 text-[#a1a1aa]">{m.rpm > 0 ? m.rpm.toLocaleString() : '—'}</td>
                  <td className="px-4 py-2.5 text-[#a1a1aa]">{m.current > 0 ? m.current : '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span style={{ color: m.healthScore >= 80 ? '#10b981' : m.healthScore >= 55 ? '#f59e0b' : '#ef4444' }}>{m.healthScore}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI INSIGHTS SECTION
// ─────────────────────────────────────────────────────────────────────────────

function AISection({ machines }: { machines: ClientMachine[] }) {
  const [sel, setSel] = useState(machines[0]?.id ?? '')
  const machine = machines.find(m => m.id === sel) ?? machines[0]

  if (!machine) return null

  const ai = deriveAI(machine)
  const models = [
    { key: 'lstm', label: 'LSTM',           color: '#e8650a', v: ai.lstm },
    { key: 'gru',  label: 'GRU',            color: '#a78bfa', v: ai.gru  },
    { key: 'rf',   label: 'Random Forest',  color: '#3b82f6', v: ai.rf   },
    { key: 'gb',   label: 'Gradient Boost', color: '#10b981', v: ai.gb   },
  ]

  const rec = ai.status === 'critical'
    ? 'Immediate intervention required. Component replacement within 5 working days. Notify maintenance team.'
    : ai.status === 'warning'
    ? 'Schedule preventive maintenance within 2–3 weeks. Inspect bearings, seals, and lubrication system.'
    : 'Operating within normal parameters. Continue standard inspection cycle. Next review at RUL = 40 days.'

  return (
    <div className="flex flex-col gap-4">
      {/* Machine picker */}
      <div className="flex flex-wrap gap-2">
        {machines.map(m => {
          const mAI = deriveAI(m)
          return (
            <button key={m.id} onClick={() => setSel(m.id)}
              className={cn(
                'px-3.5 py-2 text-[10px] font-mono rounded-sm border transition-all',
                sel === m.id ? 'border-[#e8650a] text-[#e8650a] bg-[#e8650a]/8' : 'border-[#1c1c1f] text-[#52525b] hover:border-[#27272a]'
              )}
            >
              {m.id}
              <span className="ml-2 text-[8px]" style={{ color: mAI.status === 'critical' ? '#ef4444' : mAI.status === 'warning' ? '#f59e0b' : '#10b981' }}>
                {mAI.ensemble}d
              </span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ensemble card */}
        <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-5">
          <div className="flex items-center justify-between mb-5">
            <p className="text-xs font-semibold text-[#e4e4e7]">{machine.name}</p>
            <span
              className="text-[8px] font-mono uppercase px-2 py-0.5 rounded-sm border"
              style={{ color: getStatusColor(ai.status as ClientMachine['status']), borderColor: `${getStatusColor(ai.status as ClientMachine['status'])}30`, background: getStatusBg(ai.status as ClientMachine['status']) }}
            >
              {ai.status}
            </span>
          </div>
          <div className="text-center py-3 mb-4 border border-[#1c1c1f] rounded-sm">
            <p className="text-[9px] font-mono text-[#3a3a3d] mb-1 uppercase tracking-widest">Ensemble RUL</p>
            <p className="text-4xl font-bold font-mono" style={{ color: getRulColor(ai.ensemble) }}>{ai.ensemble}d</p>
            <p className="text-[9px] font-mono text-[#3a3a3d] mt-1">LSTM 35% · GRU 30% · RF 20% · GB 15%</p>
          </div>
          {/* Model breakdown */}
          <div className="grid grid-cols-2 gap-2">
            {models.map(mdl => (
              <div key={mdl.key} className="bg-[#0d0d0f] border border-[#1a1a1d] rounded-sm px-3 py-2.5">
                <p className="text-[8px] font-mono uppercase mb-1" style={{ color: mdl.color }}>{mdl.label}</p>
                <p className="text-sm font-bold font-mono" style={{ color: mdl.color }}>{mdl.v}d</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations + risk */}
        <div className="flex flex-col gap-3">
          {/* Risk matrix */}
          <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-5">
            <p className="text-xs font-semibold text-[#e4e4e7] mb-4">Risk Assessment</p>
            {[
              { label: 'Failure Probability (30d)', value: ai.status === 'critical' ? 87 : ai.status === 'warning' ? 42 : 8, color: ai.status === 'critical' ? '#ef4444' : ai.status === 'warning' ? '#f59e0b' : '#10b981' },
              { label: 'Component Wear Rate',       value: Math.round((1 - machine.healthScore / 100) * 100), color: '#a78bfa' },
              { label: 'Anomaly Confidence',        value: machine.healthScore < 50 ? 91 : machine.healthScore < 70 ? 55 : 12, color: '#3b82f6' },
            ].map(r => (
              <div key={r.label} className="mb-3 last:mb-0">
                <div className="flex justify-between text-[9px] font-mono mb-1.5">
                  <span className="text-[#52525b]">{r.label}</span>
                  <span style={{ color: r.color }}>{r.value}%</span>
                </div>
                <div className="w-full h-1 bg-[#1c1c1f] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${r.value}%`, backgroundColor: r.color }} />
                </div>
              </div>
            ))}
          </div>

          {/* Maintenance recommendation */}
          <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-5 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={12} className="text-[#e8650a]" />
              <p className="text-xs font-semibold text-[#e4e4e7]">AI Recommendation</p>
            </div>
            <p className="text-xs text-[#71717a] leading-relaxed">{rec}</p>
            <div className="mt-4 pt-3 border-t border-[#1c1c1f] grid grid-cols-2 gap-2">
              {[
                { label: 'Health Score',  value: `${machine.healthScore}%` },
                { label: 'RUL Estimate', value: `${machine.rul} days` },
                { label: 'Anomaly Flag', value: machine.healthScore < 55 ? 'Detected' : 'Clear' },
                { label: 'Next Service', value: machine.rul <= 20 ? 'Urgent' : machine.rul <= 45 ? '2–3 weeks' : '4+ weeks' },
              ].map(it => (
                <div key={it.label} className="bg-[#0d0d0f] rounded-sm px-2.5 py-2">
                  <p className="text-[8px] font-mono text-[#3a3a3d] mb-0.5">{it.label}</p>
                  <p className="text-[10px] font-mono text-[#a1a1aa]">{it.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// REPORTS SECTION
// ─────────────────────────────────────────────────────────────────────────────

function ReportsSection({ alerts, reports }: { alerts: ClientAlert[]; reports: { id: string; title: string; type: string; date: string; size: string }[] }) {
  const typeColor: Record<string, string> = { monthly: '#3b82f6', alert: '#ef4444', maintenance: '#f59e0b', prediction: '#a78bfa' }

  return (
    <div className="flex flex-col gap-4">
      {/* Report list */}
      <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm">
        <div className="px-5 py-3.5 border-b border-[#1c1c1f] flex items-center justify-between">
          <p className="text-xs font-semibold text-[#e4e4e7]">Available Reports</p>
          <span className="text-[9px] font-mono text-[#3a3a3d]">{reports.length} documents</span>
        </div>
        <div className="divide-y divide-[#111113]">
          {reports.map(r => (
            <div key={r.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-[#111113]/50 transition-colors group">
              <FileText size={13} style={{ color: typeColor[r.type] ?? '#52525b' }} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#e4e4e7] truncate">{r.title}</p>
                <p className="text-[9px] font-mono text-[#3a3a3d] mt-0.5">{r.date} · {r.size}</p>
              </div>
              <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm" style={{ color: typeColor[r.type], background: `${typeColor[r.type]}15` }}>
                {r.type}
              </span>
              <button className="flex items-center gap-1 text-[9px] font-mono text-[#27272a] group-hover:text-[#e8650a] transition-colors">
                <Download size={10} /> Export
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Alert history */}
      <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm">
        <div className="px-5 py-3.5 border-b border-[#1c1c1f]">
          <p className="text-xs font-semibold text-[#e4e4e7]">Alert History</p>
        </div>
        <div className="divide-y divide-[#111113]">
          {alerts.map(a => (
            <div key={a.id} className="px-5 py-3 flex items-start gap-3">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: getSeverityColor(a.severity) }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#e4e4e7] leading-snug">{a.message}</p>
                <p className="text-[9px] font-mono text-[#3a3a3d] mt-0.5">{a.machineName} · {a.timestamp}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm" style={{ color: getSeverityColor(a.severity), background: `${getSeverityColor(a.severity)}15` }}>
                  {a.severity}
                </span>
                <span className="text-[8px] font-mono text-[#3a3a3d]">{a.resolved ? 'Resolved' : 'Open'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNT SECTION
// ─────────────────────────────────────────────────────────────────────────────

function AccountSection({ company, email, logout }: { company: import('@/lib/auth').Company; email: string; logout: () => void }) {
  const planColor = getPlanColor(company.plan)
  const planLabel = getPlanLabel(company.plan)

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      {/* Company profile */}
      <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1">Company Profile</p>
            <h2 className="text-sm font-semibold text-[#e4e4e7]">{company.name}</h2>
            <p className="text-[10px] font-mono text-[#52525b] mt-0.5">{company.industry} · {company.location}</p>
          </div>
          <span className="text-[9px] font-mono px-2.5 py-1 rounded-sm border" style={{ color: planColor, borderColor: `${planColor}30`, background: `${planColor}12` }}>
            {planLabel}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Contact Person', value: company.contact },
            { label: 'Title',          value: company.contactTitle },
            { label: 'Phone',          value: company.phone },
            { label: 'Login Email',    value: email },
            { label: 'Plan',           value: `${planLabel} Plan` },
            { label: 'Plan Expiry',    value: company.planExpiry },
          ].map(f => (
            <div key={f.label} className="bg-[#0d0d0f] border border-[#1a1a1d] rounded-sm px-3.5 py-2.5">
              <p className="text-[8px] font-mono uppercase tracking-wider text-[#3a3a3d] mb-1">{f.label}</p>
              <p className="text-xs font-mono text-[#a1a1aa]">{f.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-5">
        <p className="text-xs font-semibold text-[#e4e4e7] mb-4">Subscription & Billing</p>
        <div className="flex items-center justify-between p-4 bg-[#0d0d0f] border border-[#1a1a1d] rounded-sm mb-3">
          <div>
            <p className="text-sm font-semibold" style={{ color: planColor }}>{planLabel} Plan</p>
            <p className="text-[10px] font-mono text-[#3a3a3d] mt-0.5">Active · expires {company.planExpiry}</p>
          </div>
          <Shield size={20} style={{ color: planColor }} />
        </div>
        <p className="text-[10px] font-mono text-[#27272a] leading-relaxed">
          To upgrade, renew, or modify your subscription, contact your Mainteligence account manager.
        </p>
      </div>

      {/* Sign out */}
      <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-5">
        <p className="text-xs font-semibold text-[#e4e4e7] mb-3">Session</p>
        <p className="text-[10px] font-mono text-[#52525b] mb-4">Signed in as <span className="text-[#a1a1aa]">{email}</span></p>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-xs font-mono text-[#ef4444] border border-[#ef4444]/25 hover:bg-[#ef4444]/8 px-4 py-2.5 rounded-sm transition-colors"
        >
          <LogOut size={12} /> Sign Out
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CLIENT LAYOUT + SHELL
// ─────────────────────────────────────────────────────────────────────────────

export default function ClientDashboardPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [section, setSection] = useState<ClientSection>('overview')

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs font-mono text-[#3a3a3d]">
          <span className="w-4 h-4 border-2 border-[#27272a] border-t-[#e8650a] rounded-full animate-spin" />
          Authenticating...
        </div>
      </div>
    )
  }

  const { company, email } = user

  function handleLogout() {
    logout()
    router.push('/')
  }

  const sectionLabel = NAV_ITEMS.find(n => n.id === section)?.label ?? 'Overview'
  const criticalCount = company.alerts.filter(a => a.severity === 'critical' && !a.resolved).length

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Top bar */}
      <header className="h-14 border-b border-[#1c1c1f] bg-[#09090b]/98 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/G5GBg0NwHnI0ygSX2aOgv-yHCBfxf9exqvRH4s5vViaYhdSw2A6T.png"
            alt="Mainteligence"
            className="w-7 h-7 object-contain"
          />
          <span className="font-semibold text-[13px] text-[#fafafa] whitespace-nowrap hidden sm:block">
            Maint<span className="text-[#e8650a]">elligence</span>
          </span>
        </Link>

        <div className="h-4 w-px bg-[#1c1c1f] hidden sm:block" />
        <div className="flex items-center gap-1.5 hidden sm:flex">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[10px] font-mono text-[#52525b]">Client Portal</span>
        </div>

        <div className="flex-1" />

        {criticalCount > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#ef4444] bg-[#ef4444]/8 border border-[#ef4444]/20 px-2.5 py-1.5 rounded-sm">
            <AlertTriangle size={10} />
            <span>{criticalCount} Critical</span>
          </div>
        )}

        <div className="hidden md:flex items-center gap-1.5">
          <Building2 size={11} className="text-[#3a3a3d]" />
          <span className="text-[11px] font-mono text-[#52525b] max-w-[180px] truncate">{company.name}</span>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-[10px] font-mono text-[#3a3a3d] hover:text-[#ef4444] transition-colors px-2 py-1.5 rounded-sm border border-transparent hover:border-[#ef4444]/20"
        >
          <LogOut size={11} />
          <span className="hidden sm:block">Logout</span>
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-1 min-h-0">
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 border-r border-[#1c1c1f] bg-[#09090b] flex flex-col hidden md:flex">
          {/* Company badge */}
          <div className="px-4 py-4 border-b border-[#1c1c1f]">
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1">Workspace</p>
            <p className="text-xs font-semibold text-[#e4e4e7] leading-tight">{company.name}</p>
            <p className="text-[9px] font-mono mt-0.5" style={{ color: getPlanColor(company.plan) }}>
              {getPlanLabel(company.plan)} Plan
            </p>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-left transition-all text-xs',
                  section === item.id
                    ? 'bg-[#e8650a]/10 text-[#e8650a] border-l-2 border-[#e8650a]'
                    : 'text-[#52525b] hover:text-[#71717a] hover:bg-[#111113]'
                )}
              >
                {item.icon}
                {item.label}
                {item.id === 'overview' && criticalCount > 0 && (
                  <span className="ml-auto text-[8px] font-mono bg-[#ef4444] text-white px-1.5 py-0.5 rounded-full">{criticalCount}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Bottom */}
          <div className="px-4 py-3 border-t border-[#1c1c1f]">
            <p className="text-[9px] font-mono text-[#3a3a3d] leading-relaxed">
              Last sync<br />
              <span className="text-[#27272a]">{formatLastSync(company.lastSync)}</span>
            </p>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#09090b] border-t border-[#1c1c1f] flex">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setSection(item.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-1 py-2.5 text-[9px] font-mono transition-colors',
                section === item.id ? 'text-[#e8650a]' : 'text-[#27272a]'
              )}
            >
              {item.icon}
              <span className="hidden sm:block">{item.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {/* Page header */}
          <div className="px-6 py-5 border-b border-[#111113] flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-[9px] font-mono text-[#3a3a3d] mb-1">
                <span>Client Portal</span>
                <ChevronRight size={9} />
                <span className="text-[#52525b]">{sectionLabel}</span>
              </div>
              <h1 className="text-sm font-semibold text-[#e4e4e7]">{sectionLabel}</h1>
            </div>
            <div className="flex items-center gap-1.5">
              <Radio size={9} className="text-[#10b981] animate-pulse" />
              <span className="text-[9px] font-mono text-[#3a3a3d]">{company.machines.length} machines online</span>
            </div>
          </div>

          <div className="px-6 py-5">
            {section === 'overview' && (
              <OverviewSection
                machines={company.machines}
                alerts={company.alerts}
                avgHealth={company.avgHealthScore}
                lastSync={company.lastSync}
                planExpiry={company.planExpiry}
                plan={company.plan}
              />
            )}
            {section === 'machines' && <MachinesSection machines={company.machines} />}
            {section === 'monitoring' && <MonitoringSection machines={company.machines} />}
            {section === 'ai' && <AISection machines={company.machines} />}
            {section === 'reports' && <ReportsSection alerts={company.alerts} reports={company.reports} />}
            {section === 'account' && <AccountSection company={company} email={email} logout={handleLogout} />}
          </div>
        </main>
      </div>
    </div>
  )
}
