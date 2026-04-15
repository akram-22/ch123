'use client'

/**
 * PAGE: Client Dashboard (Live Platform)
 * ROUTE: /dashboard
 * PURPOSE: Authenticated client-facing monitoring platform — same UI as Demo
 *          but driven by real/live data; no guided tour or intro modal
 */

import { useState } from 'react'
import Link from 'next/link'
import {
  Activity, AlertTriangle, Bell, CheckCircle2, ChevronRight,
  Cpu, Database, Gauge, LayoutDashboard, LogOut, Settings,
  Shield, TrendingDown, TrendingUp, Wifi, Zap, XCircle,
  Clock, Filter, Download, RefreshCw, ThermometerSun, Vibrate,
  Brain, BarChart3, Lightbulb, GitCompare, Radio, Target, ChevronDown
} from 'lucide-react'
import AppNavbar from '@/components/app-navbar'

// ── Mock data ────────────────────────────────────────────────────────────────

const MACHINES = [
  { id: 'TRB-A12', name: 'Turbine A-12',      type: 'Gas Turbine',           location: 'Unit 1 – Bay A', rul: 87,  health: 'good'     as const, temp: 312, vibration: 0.42, pressure: 14.2, uptime: 98.4, lastInspection: '2025-12-14', nextMaintenance: '2026-03-15', cycles: 18420,
    models: { lstm: 87, gru: 85, rf: 84, gb: 89, bestModel: 'Gradient Boosting' } },
  { id: 'CMP-B07', name: 'Compressor B-7',    type: 'Centrifugal Compressor', location: 'Unit 2 – Bay B', rul: 34,  health: 'warning'  as const, temp: 428, vibration: 1.87, pressure: 22.8, uptime: 94.1, lastInspection: '2025-11-30', nextMaintenance: '2026-01-20', cycles: 31204,
    models: { lstm: 34, gru: 33, rf: 31, gb: 36, bestModel: 'Gradient Boosting' } },
  { id: 'PMP-C03', name: 'Pump C-3',          type: 'Centrifugal Pump',      location: 'Unit 1 – Bay C', rul: 62,  health: 'good'     as const, temp: 195, vibration: 0.61, pressure: 8.7,  uptime: 99.1, lastInspection: '2026-01-05', nextMaintenance: '2026-04-02', cycles: 9870,
    models: { lstm: 62, gru: 61, rf: 58, gb: 60, bestModel: 'LSTM' } },
  { id: 'MTR-D19', name: 'Motor D-19',        type: 'Induction Motor',       location: 'Unit 3 – Bay D', rul: 11,  health: 'critical' as const, temp: 521, vibration: 3.24, pressure: 0,    uptime: 81.3, lastInspection: '2025-10-22', nextMaintenance: '2026-01-18', cycles: 44015,
    models: { lstm: 11, gru: 10, rf: 9,  gb: 13, bestModel: 'LSTM' } },
  { id: 'TRB-E02', name: 'Turbine E-2',       type: 'Steam Turbine',         location: 'Unit 2 – Bay A', rul: 74,  health: 'good'     as const, temp: 288, vibration: 0.38, pressure: 11.4, uptime: 97.8, lastInspection: '2026-01-10', nextMaintenance: '2026-03-28', cycles: 12550,
    models: { lstm: 74, gru: 73, rf: 70, gb: 72, bestModel: 'LSTM' } },
  { id: 'CMP-F11', name: 'Compressor F-11',   type: 'Axial Compressor',      location: 'Unit 3 – Bay B', rul: 28,  health: 'warning'  as const, temp: 395, vibration: 1.44, pressure: 19.2, uptime: 91.7, lastInspection: '2025-12-01', nextMaintenance: '2026-01-25', cycles: 27680,
    models: { lstm: 28, gru: 27, rf: 25, gb: 30, bestModel: 'Gradient Boosting' } },
]

const ALERTS = [
  { id: 1, severity: 'critical' as const, machine: 'Motor D-19',      message: 'RUL < 15 days — schedule immediate maintenance',              time: '2 min ago' },
  { id: 2, severity: 'warning'  as const, machine: 'Compressor B-7',  message: 'Vibration threshold exceeded (1.87g > 1.5g limit)',            time: '18 min ago' },
  { id: 3, severity: 'warning'  as const, machine: 'Compressor F-11', message: 'Temperature trending +12°C above baseline over 6h',            time: '1 hr ago' },
  { id: 4, severity: 'info'     as const, machine: 'Turbine A-12',    message: 'Scheduled maintenance window confirmed for Mar 15',            time: '3 hr ago' },
]

// 4 models: LSTM, GRU, Random Forest, Gradient Boosting
const MODEL_METRICS = {
  lstm: { rmse: 18.6, mae: 13.2, r2: 0.91, label: 'LSTM',               color: '#e8650a', desc: '2-layer stacked LSTM · 30-cycle window · FD001' },
  gru:  { rmse: 19.4, mae: 13.9, r2: 0.90, label: 'GRU',                color: '#a78bfa', desc: 'Gated Recurrent Unit · 30-cycle window · FD001' },
  rf:   { rmse: 24.1, mae: 17.8, r2: 0.86, label: 'Random Forest',       color: '#3b82f6', desc: '200 trees · engineered features · cycle stats' },
  gb:   { rmse: 21.3, mae: 15.4, r2: 0.88, label: 'Gradient Boosting',   color: '#10b981', desc: 'Gradient boosted trees · learning rate 0.05' },
}

const AI_INSIGHTS = [
  { severity: 'critical', machine: 'Motor D-19',      insight: 'Accelerating degradation detected. LSTM confidence: 94.2%, GRU: 93.8%. Predicted failure within 11 cycles. Immediate intervention required.',                                      action: 'Schedule replacement of bearing assembly within 7 days.', model: 'LSTM' },
  { severity: 'warning',  machine: 'Compressor B-7',  insight: 'Vibration envelope widening at 1.87g — 24.7% above baseline. Gradient Boosting flags potential rotor imbalance. RF model confirms trend over last 8 cycles.',                    action: 'Inspect impeller balance and bearing clearances at next window.', model: 'Gradient Boosting' },
  { severity: 'warning',  machine: 'Compressor F-11', insight: 'Temperature rise of 12°C over 6 hours exceeds degradation model threshold. All four models (LSTM, GRU, RF, GB) predict RUL < 35 days.',                                         action: 'Check cooling system and intercooler efficiency.', model: 'Ensemble' },
  { severity: 'info',     machine: 'Turbine A-12',    insight: 'Asset performing within healthy bounds. LSTM projects 87 days RUL, GRU 85 days. No anomalies across 9 sensor channels. Scheduled maintenance aligns with prediction.',            action: 'No action required. Next inspection Mar 15 as planned.', model: 'LSTM' },
]

// DZD costs (approx: $1 ≈ 134 DZD)
const MAINTENANCE_RECS = [
  { machine: 'Motor D-19',      priority: 'Immediate', action: 'Replace main bearing assembly',        dueDate: '2026-01-18', cost: '562 800 DZD', model: 'LSTM',               rul: 11 },
  { machine: 'Compressor B-7',  priority: 'Urgent',    action: 'Inspect rotor balance + bearings',     dueDate: '2026-01-20', cost: '241 200 DZD', model: 'Gradient Boosting',   rul: 34 },
  { machine: 'Compressor F-11', priority: 'Soon',      action: 'Service cooling system & intercooler', dueDate: '2026-01-25', cost: '127 300 DZD', model: 'Random Forest',       rul: 28 },
  { machine: 'Turbine E-2',     priority: 'Planned',   action: 'Routine blade inspection',             dueDate: '2026-03-28', cost: '321 600 DZD', model: 'LSTM',               rul: 74 },
]

// Deterministic generators
function generateRULTrend(seed: number, length = 30): number[] {
  const pts: number[] = []
  let v = 100
  for (let i = 0; i < length; i++) {
    v -= (seed % 3) + 1 + (i % 4 === 0 ? 2 : 0)
    pts.push(Math.max(0, v))
  }
  return pts
}

function generateSensorTrend(base: number, amplitude: number, length = 40): number[] {
  return Array.from({ length }, (_, i) => {
    const wave = Math.sin(i * 0.3) * amplitude * 0.4
    const drift = i * amplitude * 0.01
    return parseFloat((base + wave + drift).toFixed(2))
  })
}

// Per-machine RUL history seeds (actual + model predictions)
const MACHINE_RUL_DATA: Record<string, { actual: number[]; lstm: number[]; gru: number[]; rf: number[]; gb: number[] }> = {}
MACHINES.forEach((m, idx) => {
  const seed = idx + 2
  const actual = generateRULTrend(seed, 60)
  MACHINE_RUL_DATA[m.id] = {
    actual,
    lstm: actual.map((v, i) => Math.max(0, v + Math.sin(i * 0.4) * 2)),
    gru:  actual.map((v, i) => Math.max(0, v - 1 + Math.sin(i * 0.45) * 2.2)),
    rf:   actual.map((v, i) => Math.max(0, v - 4 + Math.sin(i * 0.5) * 3)),
    gb:   actual.map((v, i) => Math.max(0, v + 2 + Math.sin(i * 0.3) * 2.5)),
  }
})

const FLEET_HEALTH_HISTORY = [88, 87, 87, 86, 85, 85, 84, 83, 82, 82, 81, 80]
const COMPRESSOR_VIBE_HISTORY = generateSensorTrend(0.8, 1.0, 60)
const MOTOR_TEMP_HISTORY = generateSensorTrend(390, 130, 60)
const TURBINE_RUL_HISTORY = generateRULTrend(2, 60)

const hC  = { good: '#10b981', warning: '#f59e0b', critical: '#ef4444' }
const hBg = { good: 'rgba(16,185,129,0.1)', warning: 'rgba(245,158,11,0.1)', critical: 'rgba(239,68,68,0.12)' }
const sC  = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }
const sBg = { critical: 'rgba(239,68,68,0.10)', warning: 'rgba(245,158,11,0.08)', info: 'rgba(59,130,246,0.08)' }
const prC: Record<string, string> = { Immediate: '#ef4444', Urgent: '#f59e0b', Soon: '#e8650a', Planned: '#3b82f6' }

// ── Shared machine selector ─────────────────────────────────────────────────

function MachineSelector({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="appearance-none bg-[#111113] border border-[#27272a] text-[11px] font-mono text-[#a1a1aa] px-3 py-1.5 pr-7 rounded-sm cursor-pointer hover:border-[#3a3a3d] focus:outline-none focus:border-[#e8650a]/50 transition-colors"
      >
        {MACHINES.map(m => (
          <option key={m.id} value={m.id}>{m.name}</option>
        ))}
      </select>
      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#52525b] pointer-events-none" />
    </div>
  )
}

// ── UI sub-components ────────────────────────────────────────────────────────

function Sparkline({ data, color, height = 40 }: { data: number[]; color: string; height?: number }) {
  const min = Math.min(...data), max = Math.max(...data)
  const norm = data.map((v) => ((v - min) / (max - min || 1)) * (height - 6))
  const w = 200
  const pts = norm.map((v, i) => `${(i / (data.length - 1)) * w},${height - v - 3}`).join(' ')
  const areaPath = `M0,${height} ` + norm.map((v, i) => `L${(i / (data.length - 1)) * w},${height - v - 3}`).join(' ') + ` L${w},${height} Z`
  const gradId = `grad-${color.replace('#', '')}-sp`
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={(((data.length - 1) / (data.length - 1)) * w)} cy={height - norm[norm.length - 1] - 3} r="2.5" fill={color} />
    </svg>
  )
}

type RULChartData = { actual: number[]; lstm: number[]; gru: number[]; rf: number[]; gb: number[] }

function RULMultiLineChart({ data, height = 130 }: { data: RULChartData; height?: number }) {
  // Layout constants — left margin for Y-axis labels, bottom margin for X-axis labels
  const LEFT = 38, BOTTOM = 22, RIGHT = 8, TOP = 8
  const W = 600, H = height
  const plotW = W - LEFT - RIGHT
  const plotH = H - TOP - BOTTOM

  const allVals = [...data.actual, ...data.lstm, ...data.gru, ...data.rf, ...data.gb]
  const rawMin = Math.min(...allVals)
  const rawMax = Math.max(...allVals)
  // Round to nice boundaries
  const yMin = Math.max(0, Math.floor(rawMin / 10) * 10)
  const yMax = Math.ceil(rawMax / 10) * 10
  const n = data.actual.length

  const toX = (i: number) => LEFT + (i / (n - 1)) * plotW
  const toY = (v: number) => TOP + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH
  const line = (arr: number[]) =>
    arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')

  // Y-axis ticks: 5 evenly spaced
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) / 4) * i)
  // X-axis ticks: every 10 cycles
  const xStep = 10
  const xTicks = Array.from({ length: Math.floor((n - 1) / xStep) + 1 }, (_, i) => i * xStep).filter(v => v < n)

  const series = [
    { key: 'actual', color: '#3b82f6', dash: '',    label: 'Actual RUL',     width: 2 },
    { key: 'lstm',   color: '#e8650a', dash: '6 3', label: 'LSTM',           width: 1.5 },
    { key: 'gru',    color: '#a78bfa', dash: '6 3', label: 'GRU',            width: 1.5 },
    { key: 'rf',     color: '#71717a', dash: '3 2', label: 'Random Forest',  width: 1.5 },
    { key: 'gb',     color: '#10b981', dash: '3 2', label: 'Gradient Boost', width: 1.5 },
  ]

  return (
    <div className="flex flex-col gap-3">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
        {/* Y grid lines + labels */}
        {yTicks.map((val) => {
          const y = toY(val)
          return (
            <g key={val}>
              <line x1={LEFT} y1={y} x2={LEFT + plotW} y2={y} stroke="#1c1c1f" strokeWidth="1" />
              <text x={LEFT - 5} y={y + 3} textAnchor="end" fill="#3a3a3d" fontSize="9" fontFamily="monospace">
                {val}
              </text>
            </g>
          )
        })}

        {/* X grid lines + labels */}
        {xTicks.map((idx) => {
          const x = toX(idx)
          return (
            <g key={idx}>
              <line x1={x} y1={TOP} x2={x} y2={TOP + plotH} stroke="#1c1c1f" strokeWidth="1" strokeDasharray="2 3" />
              <text x={x} y={TOP + plotH + 14} textAnchor="middle" fill="#3a3a3d" fontSize="9" fontFamily="monospace">
                {idx}
              </text>
            </g>
          )
        })}

        {/* Axis baselines */}
        <line x1={LEFT} y1={TOP} x2={LEFT} y2={TOP + plotH} stroke="#27272a" strokeWidth="1" />
        <line x1={LEFT} y1={TOP + plotH} x2={LEFT + plotW} y2={TOP + plotH} stroke="#27272a" strokeWidth="1" />

        {/* Axis titles */}
        <text
          x={10} y={TOP + plotH / 2}
          textAnchor="middle" fill="#52525b" fontSize="9" fontFamily="monospace"
          transform={`rotate(-90, 10, ${TOP + plotH / 2})`}
        >
          RUL (days)
        </text>
        <text x={LEFT + plotW / 2} y={H - 2} textAnchor="middle" fill="#52525b" fontSize="9" fontFamily="monospace">
          Operational Cycle
        </text>

        {/* Data lines */}
        {series.map(s => (
          <path key={s.key}
            d={line(data[s.key as keyof RULChartData])}
            fill="none" stroke={s.color} strokeWidth={s.width}
            strokeDasharray={s.dash} strokeLinejoin="round" strokeLinecap="round"
          />
        ))}

        {/* End-point dots */}
        {series.map(s => {
          const arr = data[s.key as keyof RULChartData]
          const lastV = arr[arr.length - 1]
          return (
            <circle key={`dot-${s.key}`}
              cx={toX(arr.length - 1)} cy={toY(lastV)} r="3"
              fill={s.color} stroke="#09090b" strokeWidth="1"
            />
          )
        })}
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-5 flex-wrap pl-9">
        {series.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <svg width="20" height="8">
              <line x1="0" y1="4" x2="20" y2="4" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} />
            </svg>
            <span className="text-[10px] font-mono" style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModelComparisonChart({ data }: { data: RULChartData }) {
  const W = 600, H = 110
  const allVals = [...data.actual, ...data.lstm, ...data.gru, ...data.rf, ...data.gb]
  const min = Math.min(...allVals), max = Math.max(...allVals)
  const toX = (i: number) => (i / (data.actual.length - 1)) * W
  const toY = (v: number) => H - 8 - ((v - min) / (max - min || 1)) * (H - 16)
  const line = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
  const series = [
    { key: 'actual', color: '#3b82f6', dash: '',    label: 'Actual RUL', width: 2 },
    { key: 'lstm',   color: '#e8650a', dash: '5 3', label: 'LSTM',       width: 1.5 },
    { key: 'gru',    color: '#a78bfa', dash: '5 3', label: 'GRU',        width: 1.5 },
    { key: 'rf',     color: '#71717a', dash: '3 2', label: 'RF',         width: 1.5 },
    { key: 'gb',     color: '#10b981', dash: '3 2', label: 'GB',         width: 1.5 },
  ]
  return (
    <div className="flex flex-col gap-2">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
        {[0.25, 0.5, 0.75, 1].map(t => (
          <line key={t} x1={0} y1={H - 8 - t * (H - 16)} x2={W} y2={H - 8 - t * (H - 16)} stroke="#1c1c1f" strokeWidth="1" />
        ))}
        {series.map(s => (
          <path key={s.key} d={line(data[s.key as keyof RULChartData])}
            fill="none" stroke={s.color} strokeWidth={s.width}
            strokeDasharray={s.dash} strokeLinejoin="round" />
        ))}
      </svg>
      <div className="flex items-center gap-4 flex-wrap">
        {series.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} /></svg>
            <span className="text-[10px] font-mono" style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RULGauge({ value, max = 125 }: { value: number; max?: number }) {
  const pct = Math.min(value / max, 1)
  const color = value > 60 ? '#10b981' : value > 25 ? '#f59e0b' : '#ef4444'
  const r = 44, cx = 56, cy = 56
  const circumference = Math.PI * r
  const dash = pct * circumference
  return (
    <svg width="112" height="68" viewBox="0 0 112 68">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#1c1c1f" strokeWidth="8" strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#fafafa" fontSize="18" fontWeight="700" fontFamily="monospace">{value}</text>
      <text x={cx} y={cy + 8}  textAnchor="middle" fill="#52525b" fontSize="8"  fontFamily="monospace">DAYS RUL</text>
    </svg>
  )
}

function KPICard({ label, value, delta, positive, icon }: { label: string; value: string; delta: string; positive: boolean; icon: React.ReactNode }) {
  return (
    <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
      <div className="flex items-start justify-between mb-2">
        <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">{label}</p>
        <span className="text-[#27272a]">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-[#fafafa] tracking-tight">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        {positive ? <TrendingUp size={10} className="text-[#10b981]" /> : <TrendingDown size={10} className="text-[#ef4444]" />}
        <p className={`text-[10px] font-mono ${positive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{delta}</p>
      </div>
    </div>
  )
}

// ── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar({ active, setActive }: { active: string; setActive: (s: string) => void }) {
  const items = [
    { id: 'overview',    label: 'Overview',         icon: <LayoutDashboard size={15} /> },
    { id: 'assets',      label: 'Asset Monitor',    icon: <Cpu size={15} /> },
    { id: 'analytics',   label: 'RUL Analytics',    icon: <Activity size={15} /> },
    { id: 'models',      label: 'Model Comparison', icon: <GitCompare size={15} /> },
    { id: 'insights',    label: 'AI Insights',      icon: <Brain size={15} /> },
    { id: 'alerts',      label: 'Alerts',           icon: <Bell size={15} />, badge: 3 },
    { id: 'sensors',     label: 'Sensor Feed',      icon: <Wifi size={15} /> },
    { id: 'maintenance', label: 'Maintenance',      icon: <Zap size={15} /> },
    { id: 'settings',    label: 'Settings',         icon: <Settings size={15} /> },
  ]
  return (
    <aside className="w-56 shrink-0 bg-[#0d0d0f] border-r border-[#1c1c1f] flex flex-col">
      <div className="px-4 py-5 border-b border-[#1c1c1f]">
        <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-0.5">Workspace</p>
        <p className="text-xs font-semibold text-[#a1a1aa]">Industrial Plant Alpha</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[10px] font-mono text-[#52525b]">48 assets online</span>
        </div>
      </div>
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5 overflow-y-auto">
        {items.map((item) => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-left transition-all ${
              active === item.id ? 'bg-[#18181b] text-[#fafafa]' : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#111113]'
            }`}>
            <span className={active === item.id ? 'text-[#e8650a]' : ''}>{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[9px] font-mono bg-[#ef4444]/15 text-[#ef4444] px-1.5 py-0.5 rounded-sm">{item.badge}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="px-4 py-4 border-t border-[#1c1c1f] space-y-2">
        <Link href="/iot-demo" className="flex items-center gap-2 text-xs text-[#e8650a]/70 hover:text-[#e8650a] transition-colors">
          <Radio size={13} /> Live IoT Demo
        </Link>
        <Link href="/" className="flex items-center gap-2 text-xs text-[#3a3a3d] hover:text-[#71717a] transition-colors">
          <LogOut size={13} /> Back to Website
        </Link>
      </div>
    </aside>
  )
}

// ── Panels ────────────────────────────────────────────────────────────────────

function OverviewPanel() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KPICard label="Machines Monitored" value="48"  delta="+3 this week"      positive icon={<Cpu size={16} />} />
        <KPICard label="Active Alerts"       value="3"   delta="1 new critical"    positive={false} icon={<AlertTriangle size={16} />} />
        <KPICard label="Avg. RUL (days)"     value="58"  delta="+12 vs last cycle" positive icon={<Gauge size={16} />} />
        <KPICard label="Downtime Prevented"  value="94%" delta="+2.1% this quarter" positive icon={<Shield size={16} />} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-[#e4e4e7]">Fleet Health Index</p>
              <p className="text-[10px] font-mono text-[#52525b] mt-0.5">Rolling 12-month average — 48 assets</p>
            </div>
            <span className="text-[10px] font-mono bg-[#18181b] border border-[#27272a] px-2 py-1 rounded-sm text-[#71717a]">12 MO</span>
          </div>
          <div className="flex items-end gap-1 h-28">
            {FLEET_HEALTH_HISTORY.map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-sm"
                  style={{ height: `${(v / 100) * 96}px`, background: v > 85 ? '#10b981' : v > 75 ? '#f59e0b' : '#ef4444', opacity: i === FLEET_HEALTH_HISTORY.length - 1 ? 1 : 0.4 }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'].map((m) => (
              <span key={m} className="text-[9px] font-mono text-[#3a3a3d]">{m}</span>
            ))}
          </div>
        </div>
        <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold text-[#e4e4e7]">Active Alerts</p>
            <span className="text-[9px] font-mono text-[#52525b] bg-[#18181b] px-2 py-1 border border-[#27272a] rounded-sm">LIVE</span>
          </div>
          <div className="flex flex-col gap-2">
            {ALERTS.slice(0, 3).map((a) => (
              <div key={a.id} className="p-2.5 rounded-sm border" style={{ background: sBg[a.severity], borderColor: `${sC[a.severity]}20` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: sC[a.severity] }} />
                  <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color: sC[a.severity] }}>{a.severity}</span>
                  <span className="ml-auto text-[9px] font-mono text-[#3a3a3d]">{a.time}</span>
                </div>
                <p className="text-[11px] font-medium text-[#a1a1aa]">{a.machine}</p>
                <p className="text-[10px] text-[#52525b] leading-relaxed mt-0.5">{a.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Vibration — Compressor B-7', value: '1.87g',   data: COMPRESSOR_VIBE_HISTORY, color: '#f59e0b' },
          { label: 'Temperature — Motor D-19',   value: '521°C',   data: MOTOR_TEMP_HISTORY,      color: '#ef4444' },
          { label: 'RUL Trend — Fleet Average',  value: '58 days', data: TURBINE_RUL_HISTORY.slice(-30), color: '#e8650a' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono text-[#52525b] truncate">{s.label}</p>
              <span className="text-xs font-mono font-bold ml-2 shrink-0" style={{ color: s.color }}>{s.value}</span>
            </div>
            <Sparkline data={s.data} color={s.color} height={44} />
          </div>
        ))}
      </div>
    </div>
  )
}

function AssetsPanel() {
  const [selected, setSelected] = useState<typeof MACHINES[0] | null>(null)
  return (
    <div className="flex flex-col xl:flex-row gap-4 h-full">
      <div className="flex-1 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c1c1f]">
          <p className="text-xs font-semibold text-[#e4e4e7]">Asset Registry</p>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b] hover:text-[#a1a1aa] transition-colors border border-[#27272a] px-2 py-1 rounded-sm"><Filter size={10} /> Filter</button>
            <button className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b] hover:text-[#a1a1aa] transition-colors border border-[#27272a] px-2 py-1 rounded-sm"><Download size={10} /> Export</button>
          </div>
        </div>
        <div className="grid text-[10px] font-mono uppercase tracking-widest text-[#3a3a3d] px-4 py-2 border-b border-[#111113]"
          style={{ gridTemplateColumns: '1.6fr 1.2fr 0.7fr 0.7fr 0.7fr 0.7fr 1fr 0.9fr' }}>
          {['Asset ID', 'Type', 'RUL', 'Temp', 'Vibration', 'Uptime', 'Best Model', 'Status'].map(h => <span key={h}>{h}</span>)}
        </div>
        {MACHINES.map((m) => (
          <button key={m.id} onClick={() => setSelected(selected?.id === m.id ? null : m)}
            className={`w-full grid px-4 py-3 border-b border-[#0d0d0f] text-left transition-all hover:bg-[#111113] ${selected?.id === m.id ? 'bg-[#111113] border-l-2 border-l-[#e8650a]' : ''}`}
            style={{ gridTemplateColumns: '1.6fr 1.2fr 0.7fr 0.7fr 0.7fr 0.7fr 1fr 0.9fr' }}>
            <div>
              <p className="text-xs font-medium text-[#e4e4e7]">{m.name}</p>
              <p className="text-[10px] font-mono text-[#3a3a3d]">{m.id}</p>
            </div>
            <span className="text-[11px] text-[#71717a] self-center">{m.type}</span>
            <div className="flex items-center gap-1.5 self-center">
              <div className="h-1 w-10 bg-[#1c1c1f] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(m.rul, 100)}%`, background: hC[m.health] }} />
              </div>
              <span className="text-[11px] font-mono text-[#a1a1aa]">{m.rul}d</span>
            </div>
            <span className="text-[11px] font-mono text-[#71717a] self-center">{m.temp}°C</span>
            <span className="text-[11px] font-mono text-[#71717a] self-center">{m.vibration}g</span>
            <span className="text-[11px] font-mono self-center" style={{ color: m.uptime > 95 ? '#10b981' : m.uptime > 88 ? '#f59e0b' : '#ef4444' }}>{m.uptime}%</span>
            <span className="text-[10px] font-mono self-center text-[#52525b] truncate">{m.models.bestModel}</span>
            <span className="inline-flex items-center self-center text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm w-fit"
              style={{ color: hC[m.health], background: hBg[m.health] }}>{m.health}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="w-full xl:w-72 shrink-0 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-[#fafafa]">{selected.name}</p>
              <p className="text-[10px] font-mono text-[#52525b]">{selected.id} · {selected.location}</p>
            </div>
            <span className="text-[9px] font-mono uppercase px-2 py-1 rounded-sm" style={{ color: hC[selected.health], background: hBg[selected.health] }}>{selected.health}</span>
          </div>
          <div className="flex justify-center"><RULGauge value={selected.rul} /></div>
          {/* Per-model RUL — 4 models */}
          <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2">Model Predictions</p>
            {[
              { label: 'LSTM',              val: selected.models.lstm, color: '#e8650a' },
              { label: 'GRU',               val: selected.models.gru,  color: '#a78bfa' },
              { label: 'Random Forest',     val: selected.models.rf,   color: '#3b82f6' },
              { label: 'Gradient Boosting', val: selected.models.gb,   color: '#10b981' },
            ].map(mm => (
              <div key={mm.label} className="flex items-center justify-between text-[10px] font-mono py-1">
                <span style={{ color: mm.color }}>{mm.label}</span>
                <span className="text-[#a1a1aa]">{mm.val}d</span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-[#1c1c1f] flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#3a3a3d]">Recommended</span>
              <span className="text-[#e8650a] font-semibold">{selected.models.bestModel}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Temperature', value: `${selected.temp}°C`,  icon: <ThermometerSun size={12} /> },
              { label: 'Vibration',   value: `${selected.vibration}g`, icon: <Vibrate size={12} /> },
              { label: 'Pressure',    value: selected.pressure ? `${selected.pressure} bar` : '—', icon: <Gauge size={12} /> },
              { label: 'Uptime',      value: `${selected.uptime}%`, icon: <Activity size={12} /> },
              { label: 'Cycles',      value: selected.cycles.toLocaleString(), icon: <RefreshCw size={12} /> },
              { label: 'Type',        value: selected.type, icon: <Cpu size={12} /> },
            ].map((d) => (
              <div key={d.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-2.5">
                <div className="flex items-center gap-1 mb-1 text-[#52525b]">{d.icon}<span className="text-[9px] font-mono uppercase tracking-widest">{d.label}</span></div>
                <p className="text-xs font-semibold text-[#a1a1aa] truncate">{d.value}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-[#1c1c1f] pt-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#3a3a3d]">Last Inspection</span>
              <span className="text-[#71717a]">{selected.lastInspection}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#3a3a3d]">Next Maintenance</span>
              <span className={selected.health === 'critical' ? 'text-[#ef4444] font-semibold' : 'text-[#71717a]'}>{selected.nextMaintenance}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AnalyticsPanel() {
  const [machineId, setMachineId] = useState(MACHINES[0].id)
  const machine = MACHINES.find(m => m.id === machineId)!
  const chartData = MACHINE_RUL_DATA[machineId]

  return (
    <div className="flex flex-col gap-5">
      {/* RUL chart with machine selector */}
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-[#e4e4e7]">RUL Degradation Curve — {machine.name}</p>
            <p className="text-[10px] font-mono text-[#52525b] mt-0.5">Actual vs predicted · 60-cycle window · All 4 models</p>
          </div>
          <MachineSelector value={machineId} onChange={setMachineId} />
        </div>
        <RULMultiLineChart data={chartData} height={110} />
      </div>

      {/* Selected machine detail — single machine only */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* RUL gauge + model predictions */}
        <div className="bg-[#0d0d0f] border rounded-sm p-5" style={{ borderColor: `${hC[machine.health]}25` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-[#e4e4e7]">{machine.name}</p>
              <p className="text-[10px] font-mono text-[#3a3a3d]">{machine.id} · {machine.type}</p>
            </div>
            <span className="text-[9px] font-mono uppercase px-2 py-1 rounded-sm" style={{ color: hC[machine.health], background: hBg[machine.health] }}>
              {machine.health}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <RULGauge value={machine.rul} />
            <div className="flex flex-col gap-1.5 flex-1">
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1">Model Predictions</p>
              {[
                { label: 'LSTM',             v: machine.models.lstm, c: '#e8650a' },
                { label: 'GRU',              v: machine.models.gru,  c: '#a78bfa' },
                { label: 'Random Forest',    v: machine.models.rf,   c: '#3b82f6' },
                { label: 'Gradient Boost',   v: machine.models.gb,   c: '#10b981' },
              ].map(x => (
                <div key={x.label} className="flex items-center justify-between bg-[#111113] rounded-sm px-2.5 py-1.5">
                  <span className="text-[10px] font-mono" style={{ color: x.c }}>{x.label}</span>
                  <span className="text-xs font-bold text-[#fafafa] font-mono">{x.v}d</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Machine live stats */}
        <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
          <p className="text-xs font-semibold text-[#e4e4e7] mb-4">Live Sensor Readings</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Temperature',  value: `${machine.temp}°C`,         warn: machine.temp > 400,  critical: machine.temp > 500 },
              { label: 'Vibration',    value: `${machine.vibration}g`,     warn: machine.vibration > 1.0, critical: machine.vibration > 2.5 },
              { label: 'Pressure',     value: machine.pressure > 0 ? `${machine.pressure} bar` : 'N/A', warn: false, critical: false },
              { label: 'Cycles',       value: machine.cycles.toLocaleString(), warn: false, critical: false },
              { label: 'Uptime',       value: `${machine.uptime}%`,        warn: machine.uptime < 90, critical: machine.uptime < 85 },
              { label: 'Next Service', value: machine.nextMaintenance,     warn: false, critical: machine.health === 'critical' },
            ].map(stat => {
              const color = stat.critical ? '#ef4444' : stat.warn ? '#f59e0b' : '#a1a1aa'
              return (
                <div key={stat.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-2.5">
                  <p className="text-[9px] font-mono text-[#3a3a3d] uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-xs font-bold font-mono" style={{ color }}>{stat.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function ModelsPanel() {
  const [machineId, setMachineId] = useState(MACHINES[0].id)
  const machine = MACHINES.find(m => m.id === machineId)!
  const chartData = MACHINE_RUL_DATA[machineId]
  const models = Object.values(MODEL_METRICS)
  const best = models.reduce((a, b) => a.rmse < b.rmse ? a : b)

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
        <div className="flex items-center gap-2 mb-1">
          <GitCompare size={15} className="text-[#e8650a]" />
          <p className="text-xs font-semibold text-[#e4e4e7]">Model Comparison — NASA FD001 Test Set</p>
        </div>
        <p className="text-[10px] font-mono text-[#52525b]">Evaluated on 100 test engines. 4 models: LSTM, GRU, Random Forest, Gradient Boosting. Metrics: RMSE, MAE, R².</p>
      </div>

      {/* Metric cards — 4 models */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {Object.entries(MODEL_METRICS).map(([key, m]) => (
          <div key={key} className={`bg-[#0d0d0f] border rounded-sm p-4 relative overflow-hidden transition-all ${m.label === best.label ? 'border-[#e8650a]/40' : 'border-[#1c1c1f]'}`}>
            {m.label === best.label && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-mono text-[#e8650a] bg-[#e8650a]/10 border border-[#e8650a]/20 px-2 py-0.5 rounded-sm">
                <Target size={9} /> Best
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-sm flex items-center justify-center" style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                <Brain size={13} style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#fafafa]">{m.label}</p>
                <p className="text-[9px] font-mono text-[#3a3a3d] leading-tight">{m.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {[
                { label: 'RMSE', value: m.rmse.toFixed(1) },
                { label: 'MAE',  value: m.mae.toFixed(1) },
                { label: 'R²',   value: m.r2.toFixed(2) },
              ].map(s => (
                <div key={s.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-2 text-center">
                  <p className="text-[9px] font-mono text-[#3a3a3d] mb-0.5">{s.label}</p>
                  <p className="text-sm font-bold font-mono" style={{ color: m.color }}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-[#1c1c1f] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(best.rmse / m.rmse) * 100}%`, background: m.color }} />
            </div>
            <p className="text-[9px] font-mono text-[#3a3a3d] mt-1">
              {m.label === best.label ? 'Baseline' : `+${((m.rmse / best.rmse - 1) * 100).toFixed(0)}% RMSE vs best`}
            </p>
          </div>
        ))}
      </div>

      {/* Machine-switched comparison chart */}
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-[#e4e4e7]">RUL Prediction Overlay — {machine.name}</p>
            <p className="text-[10px] font-mono text-[#52525b] mt-0.5">All 4 models vs actual ground-truth RUL · 60-cycle window</p>
          </div>
          <MachineSelector value={machineId} onChange={setMachineId} />
        </div>
        <ModelComparisonChart data={chartData} />
      </div>

      {/* Per-asset recommendation table — 4 model columns */}
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1c1c1f]">
          <p className="text-xs font-semibold text-[#e4e4e7]">Per-Asset Model Recommendation</p>
        </div>
        <div className="grid text-[10px] font-mono uppercase tracking-widest text-[#3a3a3d] px-4 py-2 border-b border-[#111113]"
          style={{ gridTemplateColumns: '1.4fr 0.7fr 0.7fr 0.7fr 0.7fr 1fr' }}>
          {['Asset', 'LSTM', 'GRU', 'RF', 'GB', 'Recommended'].map(h => <span key={h}>{h}</span>)}
        </div>
        {MACHINES.map(m => (
          <div key={m.id} className="grid px-4 py-2.5 border-b border-[#0d0d0f] text-[11px] font-mono hover:bg-[#111113] transition-colors"
            style={{ gridTemplateColumns: '1.4fr 0.7fr 0.7fr 0.7fr 0.7fr 1fr' }}>
            <span className="text-[#a1a1aa]">{m.name}</span>
            <span style={{ color: MODEL_METRICS.lstm.color }}>{m.models.lstm}d</span>
            <span style={{ color: MODEL_METRICS.gru.color }}>{m.models.gru}d</span>
            <span style={{ color: MODEL_METRICS.rf.color }}>{m.models.rf}d</span>
            <span style={{ color: MODEL_METRICS.gb.color }}>{m.models.gb}d</span>
            <span className="font-semibold" style={{
              color: m.models.bestModel === 'LSTM' ? MODEL_METRICS.lstm.color
                : m.models.bestModel === 'GRU' ? MODEL_METRICS.gru.color
                : m.models.bestModel === 'Random Forest' ? MODEL_METRICS.rf.color
                : MODEL_METRICS.gb.color
            }}>{m.models.bestModel}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InsightsPanel() {
  const severityOrder = ['critical', 'warning', 'info'] as const
  const sorted = [...AI_INSIGHTS].sort((a, b) => severityOrder.indexOf(a.severity as any) - severityOrder.indexOf(b.severity as any))
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <Brain size={15} className="text-[#e8650a]" />
        <p className="text-xs font-semibold text-[#e4e4e7]">AI Insights — Generated by Mainteligence Platform</p>
        <span className="ml-auto text-[9px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-sm border border-[#10b981]/20">LIVE</span>
      </div>
      {sorted.map((ins, i) => (
        <div key={i} className="bg-[#0d0d0f] border rounded-sm p-5" style={{ borderColor: `${sC[ins.severity as keyof typeof sC]}25` }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sC[ins.severity as keyof typeof sC] }} />
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color: sC[ins.severity as keyof typeof sC] }}>{ins.severity}</span>
              <span className="text-xs font-semibold text-[#e4e4e7]">{ins.machine}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-[9px] font-mono text-[#52525b] bg-[#111113] border border-[#1c1c1f] px-2 py-0.5 rounded-sm">
              <Brain size={9} />{ins.model}
            </div>
          </div>
          <p className="text-xs text-[#a1a1aa] leading-relaxed mb-3">{ins.insight}</p>
          <div className="flex items-start gap-2 bg-[#111113] border border-[#1c1c1f] rounded-sm p-3">
            <Lightbulb size={12} className="text-[#e8650a] mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#71717a]"><span className="text-[#a1a1aa] font-medium">Recommended action:</span> {ins.action}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function AlertsPanel() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-[#e4e4e7]">Alert Log</p>
        <button className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b] hover:text-[#a1a1aa] border border-[#27272a] px-2 py-1 rounded-sm transition-colors"><Filter size={10} /> Filter</button>
      </div>
      {ALERTS.map((a) => (
        <div key={a.id} className="bg-[#0d0d0f] border rounded-sm p-4" style={{ borderColor: `${sC[a.severity]}20` }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2 h-2 rounded-full" style={{ background: sC[a.severity] }} />
            <span className="text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color: sC[a.severity] }}>{a.severity}</span>
            <span className="text-xs font-medium text-[#a1a1aa]">{a.machine}</span>
            <span className="ml-auto text-[10px] font-mono text-[#3a3a3d]">{a.time}</span>
          </div>
          <p className="text-xs text-[#71717a]">{a.message}</p>
        </div>
      ))}
    </div>
  )
}

function SensorsPanel() {
  const [machineId, setMachineId] = useState(MACHINES[0].id)
  const machine = MACHINES.find(m => m.id === machineId)!
  const chartData = MACHINE_RUL_DATA[machineId]

  const sensorCards = [
    { label: 'Temperature',  color: machine.temp > 450 ? '#ef4444' : '#f59e0b', data: generateSensorTrend(machine.temp, 20, 40),       current: `${machine.temp}°C`,   threshold: '480°C', exceeded: machine.temp > 480 },
    { label: 'Vibration',    color: machine.vibration > 1.5 ? '#ef4444' : '#f59e0b', data: generateSensorTrend(machine.vibration, 0.5, 40), current: `${machine.vibration}g`, threshold: '1.5g', exceeded: machine.vibration > 1.5 },
    { label: 'RUL Trend',    color: machine.health === 'critical' ? '#ef4444' : machine.health === 'warning' ? '#f59e0b' : '#10b981', data: chartData.actual, current: `${machine.rul}d`, threshold: '15d', exceeded: machine.rul < 15 },
    { label: 'Pressure',     color: '#3b82f6', data: generateSensorTrend(machine.pressure || 8, 1.5, 40), current: `${machine.pressure || 0} bar`, threshold: '25 bar', exceeded: false },
  ]

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#e4e4e7]">Live Sensor Feed — {machine.name}</p>
          <p className="text-[10px] font-mono text-[#52525b] mt-0.5">{machine.id} · {machine.location}</p>
        </div>
        <MachineSelector value={machineId} onChange={setMachineId} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sensorCards.map(s => (
          <div key={s.label} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] font-mono text-[#52525b]">{s.label}</p>
              {s.exceeded && <span className="text-[9px] font-mono text-[#ef4444] bg-[#ef4444]/10 px-1.5 py-0.5 rounded-sm">THRESHOLD EXCEEDED</span>}
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#e4e4e7]">{machine.name}</p>
              <div className="text-right">
                <p className="text-sm font-bold font-mono" style={{ color: s.exceeded ? '#ef4444' : s.color }}>{s.current}</p>
                <p className="text-[9px] font-mono text-[#3a3a3d]">threshold: {s.threshold}</p>
              </div>
            </div>
            <Sparkline data={s.data} color={s.color} height={50} />
          </div>
        ))}
      </div>
    </div>
  )
}

function MaintenancePanel() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#e4e4e7]">Maintenance Recommendations</p>
          <p className="text-[10px] font-mono text-[#52525b] mt-0.5">AI-generated based on LSTM / GRU / RF / Gradient Boosting outputs · Costs in DZD</p>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b] hover:text-[#a1a1aa] border border-[#27272a] px-2 py-1 rounded-sm transition-colors"><Download size={10} /> Export</button>
      </div>
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Immediate Actions', value: '1',            color: '#ef4444' },
          { label: 'Total Est. Cost',   value: '1 252 900 DZD', color: '#e8650a' },
          { label: 'Assets Affected',   value: '4',            color: '#f59e0b' },
          { label: 'Avg Lead Time',     value: '18 days',      color: '#3b82f6' },
        ].map(k => (
          <div key={k.label} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1">{k.label}</p>
            <p className="text-sm font-bold font-mono" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>
      {/* Table */}
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm overflow-hidden">
        <div className="grid text-[10px] font-mono uppercase tracking-widest text-[#3a3a3d] px-4 py-2 border-b border-[#111113]"
          style={{ gridTemplateColumns: '1.3fr 1.8fr 0.5fr 0.7fr 1fr 0.8fr' }}>
          {['Machine', 'Action', 'RUL', 'Due Date', 'Est. Cost (DZD)', 'Priority'].map(h => <span key={h}>{h}</span>)}
        </div>
        {MAINTENANCE_RECS.map((r, i) => (
          <div key={i} className="grid px-4 py-3 border-b border-[#0d0d0f] hover:bg-[#111113] transition-colors items-center"
            style={{ gridTemplateColumns: '1.3fr 1.8fr 0.5fr 0.7fr 1fr 0.8fr' }}>
            <span className="text-xs font-medium text-[#e4e4e7]">{r.machine}</span>
            <span className="text-[11px] text-[#71717a]">{r.action}</span>
            <span className="text-[11px] font-mono" style={{ color: r.rul < 20 ? '#ef4444' : r.rul < 40 ? '#f59e0b' : '#10b981' }}>{r.rul}d</span>
            <span className="text-[11px] font-mono text-[#71717a]">{r.dueDate}</span>
            <span className="text-[11px] font-mono text-[#a1a1aa]">{r.cost}</span>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm w-fit" style={{ color: prC[r.priority], background: `${prC[r.priority]}15` }}>{r.priority}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsPanel() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <p className="text-xs font-semibold text-[#e4e4e7]">Platform Settings</p>
      {[
        { label: 'Active Prediction Models', value: 'LSTM, GRU, Random Forest, Gradient Boosting' },
        { label: 'RUL Critical Threshold',   value: '15 days' },
        { label: 'Alert Notification Mode',  value: 'Email + Webhook' },
        { label: 'Data Retention Policy',    value: '24 months' },
        { label: 'Deployment Mode',          value: 'On-Premise (Air-Gapped)' },
        { label: 'Currency',                 value: 'Algerian Dinar (DZD)' },
        { label: 'Platform Version',         value: 'Mainteligence Platform v2.5.0' },
      ].map(s => (
        <div key={s.label} className="flex items-center justify-between p-3 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm">
          <span className="text-xs text-[#71717a]">{s.label}</span>
          <span className="text-xs font-mono font-semibold text-[#a1a1aa]">{s.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [active, setActive] = useState('overview')

  // Client personalization - would come from auth context in production
  const clientName = 'Sonatrach — Mechanical Division'
  const totalMachines = MACHINES.length
  const activeAlerts = ALERTS.filter(a => a.severity !== 'info').length
  const avgHealth = Math.round(MACHINES.reduce((sum, m) => sum + (m.health === 'good' ? 95 : m.health === 'warning' ? 60 : 30), 0) / MACHINES.length)

  const panelMap: Record<string, React.ReactNode> = {
    overview:    <OverviewPanel />,
    assets:      <AssetsPanel />,
    analytics:   <AnalyticsPanel />,
    models:      <ModelsPanel />,
    insights:    <InsightsPanel />,
    alerts:      <AlertsPanel />,
    sensors:     <SensorsPanel />,
    maintenance: <MaintenancePanel />,
    settings:    <SettingsPanel />,
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <AppNavbar />
      
      <div className="pt-16 flex flex-1 h-[calc(100vh-64px)]">
        <Sidebar active={active} setActive={setActive} />
        
        <main className="flex-1 overflow-y-auto bg-[#09090b]">
          {/* MODE INDICATOR - Platform is LIVE */}
          <div className="sticky top-0 z-20 bg-[#10b981]/8 border-b border-[#10b981]/20 px-6 py-2 flex items-center justify-between"
            style={{ boxShadow: '0 0 20px rgba(16,185,129,0.05)' }}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
                </span>
                <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-widest">Live System</span>
              </div>
              <span className="text-[10px] font-mono text-[#3a3a3d]">— All devices connected</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono text-[#52525b]">{totalMachines} machines</span>
              <span className="text-[#1c1c1f]">|</span>
              <span className="text-[10px] font-mono text-[#52525b]">{activeAlerts} active alerts</span>
              <span className="text-[#1c1c1f]">|</span>
              <span className="text-[10px] font-mono text-[#52525b]">System health: <span style={{ color: avgHealth > 70 ? '#10b981' : avgHealth > 40 ? '#f59e0b' : '#ef4444' }}>{avgHealth}%</span></span>
            </div>
          </div>

          {/* CLIENT WELCOME + BREADCRUMB */}
          <div className="sticky top-[42px] z-10 bg-[#09090b]/97 backdrop-blur-sm border-b border-[#1c1c1f] px-6 py-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1">Welcome back</p>
                <p className="text-sm font-semibold text-[#fafafa]">{clientName}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#10b981]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />Live
                </span>
                <span className="text-[10px] font-mono text-[#3a3a3d]">Last update: 0.8s ago</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest">Mainteligence Platform</span>
              <span className="text-[#27272a]">/</span>
              <span className="text-[10px] font-mono text-[#a1a1aa] capitalize">{active}</span>
            </div>
          </div>

          <div className="p-6">
            {panelMap[active]}
          </div>
        </main>
      </div>
    </div>
  )
}
