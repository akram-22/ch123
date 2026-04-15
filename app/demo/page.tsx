'use client'

/**
 * PAGE: Interactive Product Demo
 * ROUTE: /demo
 * PURPOSE: Full simulated Mainteligence platform — guided walkthrough, live IoT stream,
 *          AI predictions, sensor feed, RUL analytics, alerts, maintenance planner
 */

import { useState, useEffect, useRef, useCallback, useId, type ReactNode } from 'react'
import Link from 'next/link'
import AppNavbar from '@/components/app-navbar'
import {
  Play, RotateCcw, Database, Cpu, Layers, TrendingDown,
  Activity, AlertTriangle, CheckCircle2,
  ArrowRight, Brain, GitCompare, Target, Radio,
  Square, RefreshCw, ThermometerSun, Zap, Gauge,
  ChevronRight, X, Wrench, TrendingUp,
  LayoutDashboard, LineChart, BarChart3, Lightbulb,
  Rss, Bell, ClipboardList, ChevronLeft,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// SHARED TYPES (declared early so GUIDED_STEPS can reference them)
// ─────────────────────────────────────────────────────────────────────────────

type DemoTab = 'overview' | 'asset' | 'rul' | 'models' | 'insights' | 'sensor' | 'alerts' | 'maintenance'

// ─────────────────────────────────────────────────────────────────────────────
// GUIDED DEMO — 4-STEP SALES WALKTHROUGH
// ─────────────────────────────────────────────────────────────────────────────

// Each step declares which sidebar section to activate and which data-guided zone to spotlight
const GUIDED_STEPS = [
  {
    step: 1,
    title: 'System Overview',
    subtitle: 'Your plant is online — 3 active anomalies across the fleet',
    icon: LayoutDashboard,
    color: '#3b82f6',
    tab: 'overview' as DemoTab,
    target: 'overview-kpis',
    instruction: 'The Overview shows your entire plant at a glance — fleet health, active alerts, average RUL, and device status. SENSE-03 is already in the critical zone.',
  },
  {
    step: 2,
    title: 'Sensor Feed — Live Telemetry',
    subtitle: 'SENSE-02 (Motor B-07) — abnormal vibration & temperature detected',
    icon: Rss,
    color: '#f59e0b',
    tab: 'sensor' as DemoTab,
    target: 'machine-cards',
    instruction: 'The Sensor Feed streams live readings from all Mainteligence Sense devices. Select SENSE-02 — its temperature and vibration are both above safe thresholds.',
  },
  {
    step: 3,
    title: 'RUL Analytics — Failure Forecast',
    subtitle: 'Compressor A-01 predicted to fail within 5–6 days',
    icon: LineChart,
    color: '#ef4444',
    tab: 'rul' as DemoTab,
    target: 'rul-chart',
    instruction: 'The RUL Analytics section shows the degradation trajectory and remaining useful life forecast. The red critical threshold is at 15 days — Motor B-07 has crossed it.',
  },
  {
    step: 4,
    title: 'Model Comparison — LSTM vs RF vs XGBoost',
    subtitle: 'All 4 models confirm critical status — ensemble RUL < 20 days',
    icon: BarChart3,
    color: '#a78bfa',
    tab: 'models' as DemoTab,
    target: 'model-comparison',
    instruction: 'The Model Comparison section runs LSTM, GRU, Random Forest, and XGBoost in parallel. The best model by RMSE is automatically selected for the maintenance recommendation.',
  },
  {
    step: 5,
    title: 'Alerts — Business Impact',
    subtitle: 'Prevent 275,000 DZD in losses — schedule maintenance now',
    icon: Bell,
    color: '#10b981',
    tab: 'alerts' as DemoTab,
    target: 'alerts-panel',
    instruction: 'Every critical event is captured here with financial impact. An unplanned breakdown costs ~320 000 DZD. Planned maintenance costs only 45 000 DZD — a 275 000 DZD saving per event.',
  },
] as const

type GuidedStepConfig = typeof GUIDED_STEPS[number]

interface GuidedDemoOverlayProps {
  onClose: () => void
  onSetSection: (tab: DemoTab) => void
}

function GuidedDemoOverlay({ onClose, onSetSection }: GuidedDemoOverlayProps) {
  const [step, setStep] = useState(0)
  const current: GuidedStepConfig = GUIDED_STEPS[step]
  const Icon = current.icon
  const isLast = step === GUIDED_STEPS.length - 1

  // Switch section and scroll to highlighted zone whenever step changes
  useEffect(() => {
    onSetSection(current.tab)
    // Small delay to allow tab content to mount before scrolling
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-guided="${current.target}"]`)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 150)
    return () => clearTimeout(t)
  }, [step, current.tab, current.target, onSetSection])

  // Inject highlight ring via a <style> tag that targets [data-guided]
  useEffect(() => {
    const styleId = 'guided-highlight-style'
    let tag = document.getElementById(styleId) as HTMLStyleElement | null
    if (!tag) {
      tag = document.createElement('style')
      tag.id = styleId
      document.head.appendChild(tag)
    }
    tag.textContent = `
      [data-guided="${current.target}"] {
        outline: 2px solid ${current.color} !important;
        outline-offset: 4px;
        box-shadow: 0 0 0 6px ${current.color}15, 0 0 28px ${current.color}25 !important;
        border-radius: 2px;
        transition: outline 0.35s ease, box-shadow 0.35s ease;
      }
    `
    return () => {
      if (tag) tag.textContent = ''
    }
  }, [current.target, current.color])

  function advance() {
    if (!isLast) setStep(s => s + 1)
    else onClose()
  }

  return (
    <>
      {/* Very subtle dim — dashboard stays fully visible, pointer-events-none so panel is still clickable */}
      <div className="fixed inset-0 z-[105] pointer-events-none bg-[#09090b]/35" />

      {/* Fixed side panel — bottom-right, floats above everything */}
      <div
        className="fixed bottom-6 right-6 z-[110] w-80 bg-[#0d0d0f] border rounded-sm shadow-2xl overflow-hidden"
        style={{
          borderColor: current.color + '40',
          boxShadow: `0 0 40px ${current.color}20, 0 20px 40px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${current.color}, transparent)` }} />

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c1c1f]">
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0"
              style={{ background: `${current.color}18`, border: `1px solid ${current.color}35` }}
            >
              <Icon size={13} style={{ color: current.color }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[8px] font-mono text-[#52525b]">STEP {current.step} / {GUIDED_STEPS.length}</span>
                <span
                  className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm"
                  style={{ color: current.color, background: `${current.color}12`, border: `1px solid ${current.color}25` }}
                >
                  GUIDED DEMO
                </span>
              </div>
              <p className="text-xs font-bold text-[#fafafa] leading-tight">{current.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#52525b] hover:text-[#a1a1aa] transition-colors shrink-0 ml-2">
            <X size={14} />
          </button>
        </div>

        {/* Subtitle */}
        <div className="px-4 py-2.5 border-b border-[#111113]" style={{ background: `${current.color}08` }}>
          <p className="text-[10px] font-mono leading-relaxed" style={{ color: current.color }}>{current.subtitle}</p>
        </div>

        {/* Instruction — points to real dashboard element */}
        <div className="px-4 py-4">
          <div className="flex gap-2.5">
            <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: `${current.color}18`, border: `1px solid ${current.color}30` }}>
              <ArrowRight size={9} style={{ color: current.color }} />
            </div>
            <p className="text-[11px] text-[#71717a] leading-relaxed">{current.instruction}</p>
          </div>
        </div>

        {/* Financial callout on step 4 */}
        {current.step === 4 && (
          <div className="mx-4 mb-3 border border-[#1c1c1f] rounded-sm overflow-hidden">
            {[
              { label: 'Unplanned breakdown', value: '320 000 DZD', color: '#ef4444' },
              { label: 'Planned maintenance',  value: '45 000 DZD',  color: '#10b981' },
              { label: 'Savings',              value: '275 000 DZD', color: '#e8650a' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-3 py-2 border-b border-[#111113] last:border-0">
                <span className="text-[9px] font-mono text-[#3a3a3d]">{row.label}</span>
                <span className="text-[10px] font-bold font-mono" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* CTA row on step 4 */}
        {current.step === 4 && (
          <div className="flex gap-2 px-4 pb-3">
            <Link href="/contact" className="flex-1 flex items-center justify-center gap-1.5 bg-[#e8650a] hover:bg-[#d15a08] text-white text-[10px] font-semibold py-2 rounded-sm transition-all">
              <Wrench size={10} /> Maintenance
            </Link>
            <Link href="/contact" className="flex-1 flex items-center justify-center gap-1.5 border border-[#27272a] hover:border-[#52525b] text-[#71717a] hover:text-[#fafafa] text-[10px] font-medium py-2 rounded-sm transition-colors">
              <TrendingUp size={10} /> Deploy
            </Link>
          </div>
        )}

        {/* Step dots + nav */}
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-1.5">
            {GUIDED_STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === step ? '18px' : '5px',
                  height: '5px',
                  background: i === step ? current.color : i < step ? `${current.color}55` : '#27272a',
                }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                className="text-[10px] font-mono text-[#52525b] hover:text-[#a1a1aa] px-2.5 py-1.5 border border-[#1c1c1f] rounded-sm transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={advance}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-white px-3 py-1.5 rounded-sm transition-all"
              style={{ background: current.color }}
            >
              {isLast ? <><CheckCircle2 size={11} /> Done</> : <>Next <ChevronRight size={11} /></>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// AI PREDICTION — Industrial degradation simulation
// ─────────────────────────────────────────────────────────────────────────────

const SENSOR_LABELS = [
  { id: 's2',  name: 'T2  — Fan Inlet Temp',      unit: '°R',  baseVal: 489.05, noise: 0.4,  degradeFactor:  0.3  },
  { id: 's3',  name: 'T24 — LPC Outlet Temp',     unit: '°R',  baseVal: 605.1,  noise: 0.5,  degradeFactor:  1.8  },
  { id: 's4',  name: 'T30 — HPC Outlet Temp',     unit: '°R',  baseVal: 1590.0, noise: 3.0,  degradeFactor:  12.0 },
  { id: 's7',  name: 'T50 — HPT Outlet Temp',     unit: '°R',  baseVal: 1408.0, noise: 2.5,  degradeFactor:  18.0 },
  { id: 's8',  name: 'P2  — Fan Inlet Pres.',     unit: 'psia',baseVal: 14.62,  noise: 0.02, degradeFactor:  0.0  },
  { id: 's11', name: 'P15 — Bypass Duct Pres.',   unit: 'psia',baseVal: 21.61,  noise: 0.05, degradeFactor: -0.05 },
  { id: 's12', name: 'Nf  — Fan Speed',           unit: 'rpm', baseVal: 2388.0, noise: 5.0,  degradeFactor: -6.0  },
  { id: 's13', name: 'Nc  — Core Speed',          unit: 'rpm', baseVal: 9046.0, noise: 8.0,  degradeFactor: -14.0 },
  { id: 's15', name: 'Ps30 — HPC Outlet Pres.',   unit: 'psia',baseVal: 47.21,  noise: 0.1,  degradeFactor: -0.3  },
]

type Trajectory = { cycle: number; rul: number; sensors: Record<string, number> }[]
type Predictions = { cycle: number; actual: number; lstm: number; rf: number; xgb: number; confidence: number }[]

function simulateEngine(engineId: number, maxCycles = 125): Trajectory {
  const totalCycles = 80 + ((engineId * 17) % 45) + 10
  const result: Trajectory = []
  for (let c = 1; c <= Math.min(totalCycles, maxCycles); c++) {
    const deg = Math.max(0, (c - 10) / totalCycles)
    const rul = Math.max(0, totalCycles - c)
    const sensors: Record<string, number> = {}
    SENSOR_LABELS.forEach((s, idx) => {
      const wave = Math.sin(c * 0.15 + idx * 0.8) * s.noise
      const drift = deg * s.degradeFactor * (1 + ((c * idx * 7) % 10) / 100)
      sensors[s.id] = parseFloat((s.baseVal + wave + drift).toFixed(3))
    })
    result.push({ cycle: c, rul, sensors })
  }
  return result
}

function runAllModels(traj: Trajectory, windowSize = 30): Predictions {
  const results: Predictions = []
  for (let i = windowSize; i < traj.length; i++) {
    const actual = traj[i].rul
    const seqMid = traj[Math.max(0, i - 15)]
    const trend = (traj[i].rul - seqMid.rul) / 15
    const lstm = Math.max(0, actual + (Math.sin(i * 0.4) * 4) - (trend > -3 ? 2 : -1))
    const rf   = Math.max(0, actual - 4 + (Math.sin(i * 0.55 + 1) * 5.5) + ((i % 7 === 0) ? -3 : 0))
    const xgb  = Math.max(0, actual + 2 + (Math.sin(i * 0.3 + 0.5) * 3) - (i / traj.length > 0.6 ? 3 : 0))
    const confidence = Math.max(0.72, Math.min(0.98, 0.95 - Math.abs(lstm - actual) / 200))
    results.push({ cycle: traj[i].cycle, actual, lstm: parseFloat(lstm.toFixed(1)), rf: parseFloat(rf.toFixed(1)), xgb: parseFloat(xgb.toFixed(1)), confidence: parseFloat(confidence.toFixed(3)) })
  }
  return results
}

function computeMetrics(preds: Predictions, model: 'lstm' | 'rf' | 'xgb') {
  if (!preds.length) return { rmse: 0, mae: 0, r2: 0 }
  const errors = preds.map(p => p[model] - p.actual)
  const mae = errors.reduce((s, e) => s + Math.abs(e), 0) / errors.length
  const rmse = Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / errors.length)
  const mean = preds.reduce((s, p) => s + p.actual, 0) / preds.length
  const ssTot = preds.reduce((s, p) => s + (p.actual - mean) ** 2, 0)
  const ssRes = preds.reduce((s, p) => s + (p.actual - p[model]) ** 2, 0)
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot
  return { rmse: parseFloat(rmse.toFixed(1)), mae: parseFloat(mae.toFixed(1)), r2: parseFloat(Math.max(0, r2).toFixed(3)) }
}

const PRESETS = [
  { id: 1, label: 'Compressor A-01', desc: 'Healthy — gradual wear',             engineId: 1,  maxCycles: 125 },
  { id: 2, label: 'Motor B-07',      desc: 'Rapid degradation — early failure',  engineId: 14, maxCycles: 100 },
  { id: 3, label: 'Pump C-14',       desc: 'Late-stage — critical failure zone', engineId: 32, maxCycles: 110 },
]

const MODEL_COLORS = { lstm: '#e8650a', rf: '#3b82f6', xgb: '#10b981', actual: '#71717a' } as const

// AI chart components
function RULComparisonChart({ data, displayCount }: { data: Predictions; displayCount: number }) {
  const visible = data.slice(0, displayCount)
  if (!visible.length) return (
    <div className="h-40 flex items-center justify-center text-[11px] font-mono text-[#3a3a3d]">Run inference to see predictions</div>
  )
  const W = 700, H = 160, PAD = 8
  const maxCycle = visible[visible.length - 1].cycle
  const firstCycle = visible[0].cycle
  const maxRUL = Math.max(...visible.flatMap(d => [d.actual, d.lstm, d.rf, d.xgb]), 1)
  const toX = (c: number) => PAD + ((c - firstCycle) / (maxCycle - firstCycle + 0.1)) * (W - PAD * 2)
  const toY = (r: number) => H - PAD - (r / maxRUL) * (H - PAD * 2)
  const pathOf = (key: 'actual' | 'lstm' | 'rf' | 'xgb') =>
    visible.map((d, i) => `${i === 0 ? 'M' : 'L'}${toX(d.cycle)},${toY(d[key])}`).join(' ')
  const critY = toY(15)
  const series = [
    { key: 'actual' as const, dash: '',    lw: 1.5 },
    { key: 'lstm'   as const, dash: '',    lw: 2   },
    { key: 'rf'     as const, dash: '5 2', lw: 1.5 },
    { key: 'xgb'   as const, dash: '2 2', lw: 1.5 },
  ]
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H + 20}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      {[0.25, 0.5, 0.75, 1].map(t => (
        <g key={t}>
          <line x1={PAD} y1={H - PAD - t * (H - PAD * 2)} x2={W - PAD} y2={H - PAD - t * (H - PAD * 2)} stroke="#1c1c1f" strokeWidth="1" />
          <text x={PAD + 2} y={H - PAD - t * (H - PAD * 2) - 3} fill="#3a3a3d" fontSize="8" fontFamily="monospace">{Math.round(t * maxRUL)}</text>
        </g>
      ))}
      <line x1={PAD} y1={critY} x2={W - PAD} y2={critY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
      <text x={PAD + 4} y={critY - 4} fill="#ef4444" fontSize="7.5" fontFamily="monospace">CRITICAL (15d)</text>
      {series.map(s => (
        <path key={s.key} d={pathOf(s.key)} fill="none" stroke={MODEL_COLORS[s.key]} strokeWidth={s.lw} strokeDasharray={s.dash} strokeLinejoin="round" />
      ))}
      {visible.length > 0 && series.map(s => {
        const last = visible[visible.length - 1]
        return <circle key={s.key} cx={toX(last.cycle)} cy={toY(last[s.key])} r={s.key === 'actual' ? 2.5 : 3.5} fill={MODEL_COLORS[s.key]} />
      })}
      {[visible[0], visible[Math.floor(visible.length / 4)], visible[Math.floor(visible.length / 2)], visible[Math.floor(visible.length * 3 / 4)], visible[visible.length - 1]].filter(Boolean).map((d) => (
        <text key={d.cycle} x={toX(d.cycle)} y={H + 15} fill="#3a3a3d" fontSize="8" fontFamily="monospace" textAnchor="middle">C{d.cycle}</text>
      ))}
    </svg>
  )
}

function SensorChart({ data, sensorId, color }: { data: Trajectory; sensorId: string; color: string }) {
  const vals = data.map(d => d.sensors[sensorId])
  if (!vals.length) return null
  const min = Math.min(...vals), max = Math.max(...vals)
  const W = 300, H = 56
  const norm = vals.map((v, i) => ({ x: (i / (vals.length - 1)) * W, y: H - ((v - min) / (max - min || 1)) * (H - 8) - 4 }))
  const line = norm.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `M0,${H} ` + norm.map(p => `L${p.x},${p.y}`).join(' ') + ` L${W},${H} Z`
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-14 overflow-visible">
      <defs>
        <linearGradient id={`sg-${sensorId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${sensorId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={norm[norm.length - 1].x} cy={norm[norm.length - 1].y} r="3" fill={color} />
    </svg>
  )
}

function ModelPipeline({ active }: { active: number }) {
  const steps = [
    {
      step: 1, title: 'Sequence Preparation', icon: <Database size={15} />, color: '#3b82f6',
      desc: 'Raw sensor readings from 9 CMAPSS channels are windowed into 30-cycle sequences. Each window captures temporal degradation context for the LSTM layer.',
      detail: ['Window size: 30 cycles', 'Overlap: 1-cycle stride', 'LSTM input shape: (batch, 30, 9)', 'RF/XGB: 54 statistical features'],
    },
    {
      step: 2, title: 'Normalization', icon: <Layers size={15} />, color: '#8b5cf6',
      desc: 'Min-max normalization applied per-sensor. Prevents dominant sensors from biasing LSTM gradient updates. RF and XGBoost receive z-score normalized feature vectors.',
      detail: ['LSTM: min-max [0, 1] per sensor', 'RF/XGB: z-score normalization', 'Scaler fitted on FD001 training split', 'No data leakage'],
    },
    {
      step: 3, title: 'Model Inference (×3)', icon: <Cpu size={15} />, color: '#e8650a',
      desc: 'Three models run inference in parallel. LSTM processes the full temporal sequence. RF and XGBoost process the feature vector. Each model outputs an independent RUL estimate.',
      detail: ['LSTM: 2-layer (64→32 units), Dense(1)', 'RF: 200 trees, max_depth=10', 'XGB: lr=0.05, 500 rounds, early stopping', 'Outputs: 3 independent RUL values'],
    },
    {
      step: 4, title: 'RUL Output + Ensemble', icon: <TrendingDown size={15} />, color: '#10b981',
      desc: 'Individual model outputs are clipped to [0, 125]. A weighted ensemble score is computed. The best-performing model per asset type is surfaced as the recommended prediction.',
      detail: ['Output clipping: [0, 125] cycles', 'Ensemble: weighted avg (LSTM 50%, XGB 30%, RF 20%)', 'Best model by lowest RMSE', 'Health: <15d = critical'],
    },
  ]
  return (
    <div className="space-y-3">
      {steps.map((s, i) => (
        <div key={s.step} className={`border rounded-sm transition-all duration-300 ${active >= s.step ? 'bg-[#0d0d0f]' : 'border-[#1c1c1f] bg-[#09090b] opacity-40'}`}
          style={{ borderColor: active >= s.step ? `${s.color}28` : undefined }}>
          <div className="flex items-start gap-4 p-4">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div className={`w-8 h-8 rounded-sm flex items-center justify-center ${active >= s.step ? 'opacity-100' : 'opacity-30'}`}
                style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                <span style={{ color: active >= s.step ? s.color : '#52525b' }}>{s.icon}</span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-px h-6 transition-all ${active > s.step ? '' : 'opacity-20'}`}
                  style={{ background: active > s.step ? s.color : '#27272a' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[9px] font-mono uppercase tracking-widest" style={{ color: s.color }}>Step {s.step}</span>
                {active >= s.step && <span className="text-[9px] font-mono text-[#10b981] bg-[#10b981]/10 px-1.5 py-0.5 rounded-sm border border-[#10b981]/20">Done</span>}
              </div>
              <p className="text-sm font-semibold text-[#e4e4e7] mb-1">{s.title}</p>
              <p className="text-xs text-[#71717a] leading-relaxed mb-3">{s.desc}</p>
              {active >= s.step && (
                <div className="grid grid-cols-2 gap-1.5">
                  {s.detail.map((d) => (
                    <div key={d} className="flex items-start gap-1.5 text-[10px] font-mono text-[#52525b]">
                      <span style={{ color: s.color }} className="mt-0.5 shrink-0">·</span>{d}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// IOT MONITORING — live sensor simulation
// ─────────────────────────────────────────────────────────────────────────────

type MachineState = 'normal' | 'warning' | 'critical'

interface SensorReading {
  timestamp: number
  machineId: string
  temperature: number
  vibration: number
  pressure: number
  rpm: number
  current: number
  healthScore: number
  anomalyFlag: boolean
  degradationTrend: number
  state: MachineState
  rul: number
}

const MACHINE_IDS = ['SENSE-01', 'SENSE-02', 'SENSE-03', 'SENSE-04', 'SENSE-05']

function sineNoise(t: number, freq: number, amp: number) {
  return Math.sin(t * freq) * amp
}

function generateReading(machineId: string, tick: number, degradation: number): SensorReading {
  const idx = MACHINE_IDS.indexOf(machineId)
  const seed = idx + 1
  const temperature = parseFloat((280 + idx * 40 + degradation * 180 * seed + sineNoise(tick, 0.1 + idx * 0.05, 8) + sineNoise(tick, 0.3, 3)).toFixed(1))
  const vibration = parseFloat((0.25 + degradation * 2.8 * (1 + idx * 0.3) + Math.abs(sineNoise(tick, 0.2 + idx * 0.08, 0.4)) + (tick % 15 === 0 ? 0.3 : 0)).toFixed(3))
  const pressure = parseFloat((10 + idx * 4 - degradation * 3 + sineNoise(tick, 0.07, 0.8)).toFixed(2))
  const rpm = Math.round(2200 + idx * 400 - degradation * 600 + sineNoise(tick, 0.05, 80))
  const current = parseFloat((18 + idx * 6 + degradation * 15 + sineNoise(tick, 0.12, 1.5)).toFixed(2))
  const healthScore = Math.max(0, Math.round(100 - degradation * 95 - Math.abs(sineNoise(tick, 0.08, 2))))
  const anomalyFlag = vibration > 2.0 || temperature > 520 || healthScore < 30
  const state: MachineState = healthScore > 70 ? 'normal' : healthScore > 35 ? 'warning' : 'critical'
  const rul = Math.max(0, Math.round((1 - degradation) * 125 - tick * 0.05))
  return { timestamp: Date.now(), machineId, temperature, vibration, pressure, rpm, current, healthScore, anomalyFlag, degradationTrend: parseFloat(degradation.toFixed(4)), state, rul }
}

const MAX_HISTORY = 60
const stateColor: Record<MachineState, string> = { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' }
const stateBg: Record<MachineState, string>    = { normal: 'rgba(16,185,129,0.08)', warning: 'rgba(245,158,11,0.08)', critical: 'rgba(239,68,68,0.10)' }

function LiveSparkline({ data, color, height = 50, threshold }: { data: number[]; color: string; height?: number; threshold?: number }) {
  const uid = useId().replace(/:/g, '')
  const gradId = `sg-${uid}`
  if (data.length < 2) return <div style={{ height }} className="bg-[#111113] rounded-sm animate-pulse" />
  const min = Math.min(...data), max = Math.max(...data)
  const range = max - min || 1
  const W = 400
  const norm = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: height - 4 - ((v - min) / range) * (height - 8),
  }))
  const line = norm.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `M0,${height} ` + norm.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${W},${height} Z`
  const thY = threshold != null ? height - 4 - ((threshold - min) / range) * (height - 8) : null
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gradId})`} />
      {thY != null && <line x1={0} y1={thY} x2={W} y2={thY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={norm[norm.length - 1].x} cy={norm[norm.length - 1].y} r="3" fill={color} />
    </svg>
  )
}

function HealthGauge({ value }: { value: number }) {
  const color = value > 70 ? '#10b981' : value > 35 ? '#f59e0b' : '#ef4444'
  const r = 38, cx = 48, cy = 48
  const circumference = Math.PI * r
  const dash = (value / 100) * circumference
  return (
    <svg width="96" height="60" viewBox="0 0 96 60">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#1c1c1f" strokeWidth="7" strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`} style={{ transition: 'stroke-dasharray 0.4s ease' }} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill="#fafafa" fontSize="16" fontWeight="700" fontFamily="monospace">{value}</text>
      <text x={cx} y={cx + 8} textAnchor="middle" fill="#52525b" fontSize="7" fontFamily="monospace">HEALTH</text>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: AI PREDICTION
// ─────────────────────────────────────────────────────────────────────────────

function AIPredictionTab() {
  const [selected, setSelected] = useState(PRESETS[0])
  const [running, setRunning]   = useState(false)
  const [pipelineStep, setPipelineStep] = useState(0)
  const [trajectory, setTrajectory]     = useState<Trajectory>([])
  const [predictions, setPredictions]   = useState<Predictions>([])
  const [displayCount, setDisplayCount] = useState(0)
  const [activeSensor, setActiveSensor] = useState('s4')
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function reset() {
    if (timerRef.current)    clearTimeout(timerRef.current)
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false); setPipelineStep(0); setTrajectory([])
    setPredictions([]); setDisplayCount(0)
  }

  function runInference() {
    reset(); setRunning(true)
    timerRef.current = setTimeout(() => {
      setPipelineStep(1)
      const traj = simulateEngine(selected.engineId, selected.maxCycles)
      setTrajectory(traj)
      timerRef.current = setTimeout(() => {
        setPipelineStep(2)
        timerRef.current = setTimeout(() => {
          setPipelineStep(3)
          const preds = runAllModels(traj)
          let shown = 0

          intervalRef.current = setInterval(() => {
            shown = Math.min(shown + Math.ceil(preds.length / 20), preds.length)
            setDisplayCount(shown)
            if (shown >= preds.length) {
              clearInterval(intervalRef.current!)
              setTimeout(() => { setPipelineStep(4); setPredictions(preds); setRunning(false) }, 400)
            }
          }, 60)
        }, 900)
      }, 700)
    }, 500)
  }

  // Auto-run inference on mount and on preset change
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { runInference() }, [selected.id])

  const lastPred = predictions[predictions.length - 1]
  const healthStatus = lastPred ? (lastPred.lstm > 60 ? 'good' : lastPred.lstm > 20 ? 'warning' : 'critical') : null
  const healthColor  = { good: '#10b981', warning: '#f59e0b', critical: '#ef4444' }
  const metrics = { lstm: computeMetrics(predictions, 'lstm'), rf: computeMetrics(predictions, 'rf'), xgb: computeMetrics(predictions, 'xgb') }
  const bestModel = predictions.length ? (['lstm', 'rf', 'xgb'] as const).reduce((a, b) => metrics[a].rmse < metrics[b].rmse ? a : b) : null
  const sensorColors: Record<string, string> = { s2: '#3b82f6', s3: '#8b5cf6', s4: '#e8650a', s7: '#ef4444', s8: '#10b981', s11: '#f59e0b', s12: '#06b6d4', s13: '#ec4899', s15: '#a3e635' }

  return (
    <div className="flex flex-col gap-5">
      {/* Status bar — always-running indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm px-5 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span className="text-[#10b981] uppercase tracking-widest">AI Models: Running</span>
          </div>
          <span className="text-[#27272a]">|</span>
          <span className="text-[10px] font-mono text-[#52525b]">
            {running ? <span className="text-[#e8650a]">Computing predictions...</span> : pipelineStep >= 4 ? <span className="text-[#10b981]">Predictions ready</span> : 'Initializing...'}
          </span>
          <span className="text-[10px] font-mono text-[#3a3a3d]">Mainteligence continuously analyzes sensor data in real time.</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] shrink-0">Asset:</p>
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map(p => (
              <button key={p.id} onClick={() => setSelected(p)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border text-left transition-all ${selected.id === p.id ? 'border-[#e8650a]/30 bg-[#e8650a]/8 text-[#fafafa]' : 'border-[#1c1c1f] text-[#71717a] hover:border-[#27272a] hover:bg-[#111113]'}`}>
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${selected.id === p.id ? 'bg-[#e8650a] animate-pulse' : 'bg-[#27272a]'}`} />
                <div>
                  <p className="text-xs font-semibold leading-tight">{p.label}</p>
                  <p className="text-[9px] font-mono text-[#52525b] hidden sm:block">{p.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* LEFT: Pipeline + dataset */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={13} className="text-[#e8650a]" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">Business Context</p>
            </div>
            <div className="space-y-2.5">
              {/* Risk badge */}
              {[
                { label: 'Machine',          value: selected.label },
                { label: 'Risk Level',       value: selected.id === 3 ? 'CRITICAL' : selected.id === 2 ? 'HIGH' : 'LOW',
                  color: selected.id === 3 ? '#ef4444' : selected.id === 2 ? '#f59e0b' : '#10b981' },
                { label: 'Est. Repair Cost', value: selected.id === 3 ? '320 000 DZD' : selected.id === 2 ? '185 000 DZD' : '45 000 DZD' },
                { label: 'Downtime Risk',    value: selected.id === 3 ? '3–5 days' : selected.id === 2 ? '1–2 days' : 'Minimal' },
                { label: 'Recommended',      value: selected.id === 3 ? 'Immediate stop' : selected.id === 2 ? 'Plan within 2 wks' : 'Normal ops' },
                { label: 'Sensors Active',   value: '9 channels' },
                { label: 'Monitoring',       value: 'Mainteligence Sense' },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between text-[10px] font-mono border-b border-[#111113] pb-1.5 last:border-0 last:pb-0">
                  <span className="text-[#3a3a3d]">{row.label}</span>
                  <span style={{ color: (row as { color?: string }).color ?? '#71717a' }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
            <div className="flex items-center gap-2 mb-4">
              <Brain size={13} className="text-[#e8650a]" />
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">Model Pipeline</p>
            </div>
            <ModelPipeline active={pipelineStep} />
          </div>
        </div>

        {/* CENTRE + RIGHT: Charts + Results */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* RUL Prediction Chart */}
          <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold text-[#e4e4e7]">RUL Prediction — {selected.label}</p>
                <p className="text-[10px] font-mono text-[#52525b] mt-0.5">Actual vs LSTM vs Random Forest vs XGBoost</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                {(['actual', 'lstm', 'rf', 'xgb'] as const).map(k => (
                  <div key={k} className="flex items-center gap-1.5">
                    <svg width="16" height="6"><line x1="0" y1="3" x2="16" y2="3" stroke={MODEL_COLORS[k]} strokeWidth="2" strokeDasharray={k === 'rf' ? '4 2' : k === 'xgb' ? '2 2' : ''} /></svg>
                    <span className="text-[9px] font-mono uppercase" style={{ color: MODEL_COLORS[k] }}>{k === 'actual' ? 'Ground Truth' : k}</span>
                  </div>
                ))}
              </div>
            </div>
            <RULComparisonChart data={predictions.length ? predictions : []} displayCount={displayCount || predictions.length} />
          </div>

          {/* Model result cards */}
          {lastPred && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(['lstm', 'rf', 'xgb'] as const).map(key => {
                const m = metrics[key]
                const label = key === 'lstm' ? 'LSTM' : key === 'rf' ? 'Random Forest' : 'XGBoost'
                const isBest = bestModel === key
                return (
                  <div key={key} className={`bg-[#0d0d0f] border rounded-sm p-4 relative ${isBest ? 'border-[#e8650a]/40' : 'border-[#1c1c1f]'}`}>
                    {isBest && (
                      <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[8px] font-mono text-[#e8650a] bg-[#e8650a]/10 border border-[#e8650a]/20 px-1.5 py-0.5 rounded-sm">
                        <Target size={8} />Best
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 rounded-full" style={{ background: MODEL_COLORS[key] }} />
                      <p className="text-xs font-semibold text-[#fafafa]">{label}</p>
                    </div>
                    <p className="text-2xl font-bold font-mono mb-1" style={{ color: MODEL_COLORS[key] }}>{lastPred[key]}d</p>
                    <p className="text-[10px] font-mono text-[#52525b] mb-3">Predicted RUL</p>
                    <div className="space-y-1.5 border-t border-[#1c1c1f] pt-3">
                      {[
                        { label: 'RMSE', value: m.rmse, hint: 'cycles' },
                        { label: 'MAE',  value: m.mae,  hint: 'cycles' },
                        { label: 'R²',   value: m.r2,   hint: '' },
                      ].map(s => (
                        <div key={s.label} className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-[#3a3a3d]">{s.label}</span>
                          <span style={{ color: MODEL_COLORS[key] }}>{s.value} <span className="text-[#27272a]">{s.hint}</span></span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Health + Recommendation */}
          {lastPred && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-3">Health Status</p>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-sm flex items-center justify-center"
                    style={{ background: `${healthColor[healthStatus!]}15`, border: `1px solid ${healthColor[healthStatus!]}30` }}>
                    {healthStatus === 'good'
                      ? <CheckCircle2 size={18} style={{ color: healthColor[healthStatus] }} />
                      : <AlertTriangle size={18} style={{ color: healthColor[healthStatus!] }} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold capitalize" style={{ color: healthColor[healthStatus!] }}>{healthStatus}</p>
                    <p className="text-[10px] font-mono text-[#52525b]">LSTM prediction basis</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {[
                    { label: 'Best Model RUL', value: `${lastPred[bestModel!]}d` },
                    { label: 'Actual RUL',      value: `${lastPred.actual}d` },
                    { label: 'Confidence',      value: `${(lastPred.confidence * 100).toFixed(1)}%` },
                    { label: 'Failure Risk',    value: lastPred.lstm < 15 ? 'Imminent' : lastPred.lstm < 40 ? 'High' : 'Low' },
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between text-[10px] font-mono py-1 border-b border-[#111113]">
                      <span className="text-[#3a3a3d]">{r.label}</span>
                      <span className="text-[#a1a1aa]">{r.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-3">AI Maintenance Recommendation</p>
                <div className="text-xs text-[#71717a] leading-relaxed space-y-2">
                  {lastPred.lstm < 15 ? (
                    <p className="text-[#ef4444]">Immediate intervention required. Schedule replacement within 7 days. All models agree on critical RUL.</p>
                  ) : lastPred.lstm < 40 ? (
                    <p className="text-[#f59e0b]">Plan maintenance within 2–3 weeks. LSTM and XGBoost both flag accelerating degradation. Prepare parts in advance.</p>
                  ) : (
                    <p className="text-[#10b981]">Asset is healthy. Continue normal operation. Schedule next inspection at RUL = 40 days per protocol.</p>
                  )}
                  <div className="border-t border-[#1c1c1f] pt-2 space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#3a3a3d]">Recommended model</span>
                      <span className="uppercase font-semibold" style={{ color: MODEL_COLORS[bestModel!] }}>{bestModel}</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#3a3a3d]">Lowest RMSE</span>
                      <span className="text-[#a1a1aa]">{bestModel ? metrics[bestModel].rmse : '—'} cycles</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sensor degradation traces */}
          {trajectory.length > 0 && (
            <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs font-semibold text-[#e4e4e7]">Sensor Degradation Traces</p>
                <div className="flex flex-wrap gap-1.5 ml-2">
                  {SENSOR_LABELS.map(s => (
                    <button key={s.id} onClick={() => setActiveSensor(s.id)}
                      className={`text-[9px] font-mono px-2 py-0.5 rounded-sm border transition-all ${activeSensor === s.id ? 'border-[#e8650a]/40 bg-[#e8650a]/10 text-[#e8650a]' : 'border-[#1c1c1f] text-[#3a3a3d] hover:text-[#52525b]'}`}>
                      {s.id.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              {SENSOR_LABELS.filter(s => s.id === activeSensor).map(s => (
                <div key={s.id}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-mono text-[#a1a1aa]">{s.name}</p>
                    <span className="text-[10px] font-mono text-[#52525b]">{s.unit}</span>
                  </div>
                  <SensorChart data={trajectory} sensorId={s.id} color={sensorColors[s.id]} />
                  <div className="flex justify-between text-[9px] font-mono text-[#3a3a3d] mt-1">
                    <span>Cycle 1</span><span>Cycle {trajectory.length}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Model comparison bars */}
          {lastPred && (
            <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <GitCompare size={14} className="text-[#e8650a]" />
                <p className="text-xs font-semibold text-[#e4e4e7]">Model Performance Comparison</p>
              </div>
              <div className="space-y-3">
                {(['lstm', 'rf', 'xgb'] as const).map(key => {
                  const m = metrics[key]
                  const label = key === 'lstm' ? 'LSTM' : key === 'rf' ? 'Random Forest' : 'XGBoost'
                  const maxRmse = Math.max(metrics.lstm.rmse, metrics.rf.rmse, metrics.xgb.rmse)
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span style={{ color: MODEL_COLORS[key] }}>{label}</span>
                        <div className="flex gap-4">
                          <span className="text-[#52525b]">RMSE: <span style={{ color: MODEL_COLORS[key] }}>{m.rmse}</span></span>
                          <span className="text-[#52525b]">MAE: <span style={{ color: MODEL_COLORS[key] }}>{m.mae}</span></span>
                          <span className="text-[#52525b]">R²: <span style={{ color: MODEL_COLORS[key] }}>{m.r2}</span></span>
                        </div>
                      </div>
                      <div className="h-2 bg-[#1c1c1f] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${(1 - m.rmse / (maxRmse + 1)) * 100}%`, background: MODEL_COLORS[key] }} />
                      </div>
                    </div>
                  )
                })}
              </div>
              <p className="text-[9px] font-mono text-[#3a3a3d] mt-3">Bar length indicates relative accuracy — longer = lower RMSE = better</p>
            </div>
          )}

          {/* Pipeline bridge callout */}
          <div className="border border-[#27272a] bg-[#0d0d0f] rounded-sm p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8650a]/15 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 shrink-0 rounded-sm bg-[#e8650a]/10 border border-[#e8650a]/20 flex items-center justify-center">
                <ArrowRight size={14} className="text-[#e8650a]" />
              </div>
              <p className="text-xs text-[#71717a] leading-relaxed">
                These predictions are powered by the same models that process live sensor streams from <strong className="text-[#a1a1aa]">Mainteligence Sense</strong> devices.
                Switch to the <button onClick={() => {}} className="text-[#e8650a] underline underline-offset-2">IoT Monitoring</button> tab to see the real-time data pipeline in action.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// REAL-TIME AI INFERENCE ENGINE
// Derives 4 model predictions from a live SensorReading each tick.
// ─────────────────────────────────────────────────────────────────────────────

interface RTAIPred {
  tick: number
  lstm: number
  gru: number
  rf: number
  gb: number
  ensemble: number
  status: MachineState
}

/** Simulate 4 independent model outputs from live sensor state */
function computeRTML(r: SensorReading, tick: number, hist: SensorReading[]): RTAIPred {
  // Base estimate from physics-inspired degradation model
  const base = r.rul
  // Temporal drift from recent history (slope proxy)
  const slope = hist.length >= 5
    ? (r.healthScore - hist[hist.length - 5].healthScore) / 5
    : 0

  // LSTM — good at capturing temporal trends, slight overshoot on rapid degradation
  const lstm = Math.max(0, parseFloat((
    base + Math.sin(tick * 0.17) * 3.5 + slope * 1.2 - (r.anomalyFlag ? 4 : 0)
  ).toFixed(1)))

  // GRU — similar to LSTM but slightly more conservative
  const gru = Math.max(0, parseFloat((
    base + Math.sin(tick * 0.13 + 0.9) * 2.8 + slope * 0.9 - (r.anomalyFlag ? 3 : 0)
  ).toFixed(1)))

  // Random Forest — feature-based, more stable but lags on spikes
  const rf = Math.max(0, parseFloat((
    base - 3 + Math.sin(tick * 0.21 + 1.5) * 4.2 + (r.vibration > 1.5 ? -5 : 0) + (r.temperature > 450 ? -4 : 0)
  ).toFixed(1)))

  // Gradient Boosting — best at non-linear thresholds
  const gb = Math.max(0, parseFloat((
    base + 1.5 + Math.sin(tick * 0.09 + 2.1) * 3.0 - (r.degradationTrend > 0.5 ? (r.degradationTrend - 0.5) * 12 : 0)
  ).toFixed(1)))

  // Weighted ensemble: LSTM 35%, GRU 30%, RF 20%, GB 15%
  const ensemble = Math.max(0, parseFloat((lstm * 0.35 + gru * 0.30 + rf * 0.20 + gb * 0.15).toFixed(1)))

  const status: MachineState = ensemble < 20 ? 'critical' : ensemble < 50 ? 'warning' : 'normal'

  return { tick, lstm, gru, rf, gb, ensemble, status }
}

const MAX_RTAI_HISTORY = 50
const RT_MODEL_COLORS = { lstm: '#e8650a', gru: '#a78bfa', rf: '#3b82f6', gb: '#10b981' } as const

/** Compact sparkline for real-time model output */
function RTModelSparkline({ history, modelKey, color }: {
  history: RTAIPred[]
  modelKey: keyof Pick<RTAIPred, 'lstm' | 'gru' | 'rf' | 'gb' | 'ensemble'>
  color: string
}) {
  const vals = history.map(h => h[modelKey] as number)
  if (vals.length < 2) return <div className="h-10 bg-[#111113] rounded-sm animate-pulse" />
  const W = 300, H = 40
  const min = Math.max(0, Math.min(...vals) - 5)
  const max = Math.max(...vals) + 5
  const norm = vals.map((v, i) => ({
    x: (i / (vals.length - 1)) * W,
    y: H - 4 - ((v - min) / (max - min || 1)) * (H - 8),
  }))
  const line = norm.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = `M0,${H} ` + norm.map(p => `L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ') + ` L${W},${H} Z`
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ height: '40px', overflow: 'visible' }}>
      <defs>
        <linearGradient id={`rtg-${modelKey}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#rtg-${modelKey})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={norm[norm.length - 1].x} cy={norm[norm.length - 1].y} r="2.5" fill={color} />
    </svg>
  )
}

/** Multi-line ensemble RUL chart over time */
function RTEnsembleChart({ history }: { history: RTAIPred[] }) {
  const uid = useId().replace(/:/g, '')
  if (history.length < 2) {
    return (
      <div className="h-28 flex items-center justify-center text-[10px] font-mono text-[#3a3a3d]">
        Start stream to see real-time predictions
      </div>
    )
  }
  const W = 600, H = 112, L = 36, B = 18, T = 6, R = 8
  const plotW = W - L - R, plotH = H - T - B
  const allVals = history.flatMap(h => [h.lstm, h.gru, h.rf, h.gb])
  const yMin = Math.max(0, Math.floor(Math.min(...allVals) / 10) * 10)
  const yMax = Math.ceil(Math.max(...allVals) / 10) * 10
  const n = history.length
  const toX = (i: number) => L + (i / (n - 1)) * plotW
  const toY = (v: number) => T + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(t => yMin + t * (yMax - yMin))
  const series = [
    { key: 'lstm' as const, color: RT_MODEL_COLORS.lstm, dash: '' },
    { key: 'gru'  as const, color: RT_MODEL_COLORS.gru,  dash: '5 3' },
    { key: 'rf'   as const, color: RT_MODEL_COLORS.rf,   dash: '3 2' },
    { key: 'gb'   as const, color: RT_MODEL_COLORS.gb,   dash: '3 2' },
  ]
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
      {/* grid + Y labels */}
      {yTicks.map(v => (
        <g key={v}>
          <line x1={L} y1={toY(v)} x2={L + plotW} y2={toY(v)} stroke="#1c1c1f" strokeWidth="1" />
          <text x={L - 4} y={toY(v) + 3} textAnchor="end" fill="#3a3a3d" fontSize="8" fontFamily="monospace">{v}</text>
        </g>
      ))}
      {/* Critical threshold at 20d */}
      {yMin < 20 && yMax > 10 && (
        <line x1={L} y1={toY(20)} x2={L + plotW} y2={toY(20)} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
      )}
      {/* X labels — first and last tick */}
      {[0, n - 1].map(i => (
        <text key={i} x={toX(i)} y={T + plotH + 13} textAnchor="middle" fill="#3a3a3d" fontSize="8" fontFamily="monospace">
          T{history[i].tick}
        </text>
      ))}
      {/* Axes */}
      <line x1={L} y1={T} x2={L} y2={T + plotH} stroke="#27272a" strokeWidth="1" />
      <line x1={L} y1={T + plotH} x2={L + plotW} y2={T + plotH} stroke="#27272a" strokeWidth="1" />
      {/* Y axis label */}
      <text x={10} y={T + plotH / 2} textAnchor="middle" fill="#52525b" fontSize="8" fontFamily="monospace"
        transform={`rotate(-90, 10, ${T + plotH / 2})`}>RUL (d)</text>
      {/* Series */}
      {series.map(s => {
        const path = history.map((h, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(h[s.key]).toFixed(1)}`).join(' ')
        return <path key={s.key} d={path} fill="none" stroke={s.color} strokeWidth="1.5" strokeDasharray={s.dash} strokeLinejoin="round" />
      })}
      {/* End dots */}
      {series.map(s => {
        const last = history[history.length - 1]
        return <circle key={`dot-${s.key}`} cx={toX(n - 1)} cy={toY(last[s.key])} r="2.5" fill={s.color} stroke="#09090b" strokeWidth="1" />
      })}
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB: IOT MONITORING
// ─────────────────────────────────────────────────────────────────────────────

function IoTMonitoringTab({ onSwitchToAI }: { onSwitchToAI: () => void }) {
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState(0)
  const [selectedMachine, setSelectedMachine] = useState(MACHINE_IDS[0])
  const degradationRef = useRef<Record<string, number>>({ 'SENSE-01': 0.05, 'SENSE-02': 0.28, 'SENSE-03': 0.62, 'SENSE-04': 0.10, 'SENSE-05': 0.45 })
  const historyRef = useRef<Record<string, SensorReading[]>>({ 'SENSE-01': [], 'SENSE-02': [], 'SENSE-03': [], 'SENSE-04': [], 'SENSE-05': [] })
  const rtaiHistRef = useRef<Record<string, RTAIPred[]>>({ 'SENSE-01': [], 'SENSE-02': [], 'SENSE-03': [], 'SENSE-04': [], 'SENSE-05': [] })
  const [readings, setReadings] = useState<Record<string, SensorReading>>({})
  const [history, setHistory] = useState<Record<string, SensorReading[]>>({ 'SENSE-01': [], 'SENSE-02': [], 'SENSE-03': [], 'SENSE-04': [], 'SENSE-05': [] })
  const [rtaiHistory, setRtaiHistory] = useState<Record<string, RTAIPred[]>>({ 'SENSE-01': [], 'SENSE-02': [], 'SENSE-03': [], 'SENSE-04': [], 'SENSE-05': [] })
  const [eventLog, setEventLog] = useState<{ time: string; machine: string; event: string; severity: MachineState }[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Dynamic alert event state
  const [alertToast, setAlertToast] = useState(false)
  const [alertTriggered, setAlertTriggered] = useState(false)
  const [businessPanelOpen, setBusinessPanelOpen] = useState(false)
  // Forced override for SENSE-01 after the dynamic alert fires
  const [forcedCritical, setForcedCritical] = useState<string | null>(null)

  const tick_fn = useCallback(() => {
    setTick(t => {
      const nextTick = t + 1
      const newReadings: Record<string, SensorReading> = {}
      MACHINE_IDS.forEach(id => {
        degradationRef.current[id] = Math.min(0.97, degradationRef.current[id] + 0.0015)
        const r = generateReading(id, nextTick, degradationRef.current[id])
        newReadings[id] = r
        historyRef.current[id] = [...historyRef.current[id].slice(-(MAX_HISTORY - 1)), r]
        // Compute real-time AI predictions from live sensor state
        const pred = computeRTML(r, nextTick, historyRef.current[id])
        rtaiHistRef.current[id] = [...rtaiHistRef.current[id].slice(-(MAX_RTAI_HISTORY - 1)), pred]
      })
      setReadings({ ...newReadings })
      setHistory({ ...historyRef.current })
      setRtaiHistory({ ...rtaiHistRef.current })
      MACHINE_IDS.forEach(id => {
        const r = newReadings[id]
        if (r.state === 'critical' && nextTick % 8 === 0) {
          const now = new Date()
          const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
          setEventLog(prev => [{ time, machine: id, event: r.temperature > 520 ? `Temperature exceeded threshold (${r.temperature}°C)` : r.vibration > 2.5 ? `Vibration spike detected (${r.vibration}g)` : `Health score critical (${r.healthScore}%)`, severity: 'critical' as MachineState }, ...prev].slice(0, 12))
        } else if (r.state === 'warning' && nextTick % 12 === 0) {
          const now = new Date()
          const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
          setEventLog(prev => [{ time, machine: id, event: `Degradation trend increasing (${(r.degradationTrend * 100).toFixed(1)}%)`, severity: 'warning' as MachineState }, ...prev].slice(0, 12))
        }
      })
      return nextTick
    })
  }, [])

  function startStream() { if (intervalRef.current) clearInterval(intervalRef.current); intervalRef.current = setInterval(tick_fn, 800); setRunning(true) }
  function stopStream()  { if (intervalRef.current) clearInterval(intervalRef.current); setRunning(false) }
  function resetStream() {
    stopStream(); setTick(0)
    degradationRef.current = { 'SENSE-01': 0.05, 'SENSE-02': 0.28, 'SENSE-03': 0.62, 'SENSE-04': 0.10, 'SENSE-05': 0.45 }
    historyRef.current     = { 'SENSE-01': [], 'SENSE-02': [], 'SENSE-03': [], 'SENSE-04': [], 'SENSE-05': [] }
    rtaiHistRef.current    = { 'SENSE-01': [], 'SENSE-02': [], 'SENSE-03': [], 'SENSE-04': [], 'SENSE-05': [] }
    setReadings({})
    setHistory({ 'SENSE-01': [], 'SENSE-02': [], 'SENSE-03': [], 'SENSE-04': [], 'SENSE-05': [] })
    setRtaiHistory({ 'SENSE-01': [], 'SENSE-02': [], 'SENSE-03': [], 'SENSE-04': [], 'SENSE-05': [] })
    setEventLog([])
  }
  // Auto-start stream on mount
  useEffect(() => { startStream(); return () => { if (intervalRef.current) clearInterval(intervalRef.current) } }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Dynamic alert: fires 5 seconds after mount (wow effect)
  useEffect(() => {
    const t = setTimeout(() => {
      if (alertTriggered) return
      setAlertTriggered(true)
      setForcedCritical('SENSE-01')
      setAlertToast(true)
      const now = new Date()
      const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
      setEventLog(prev => [
        { time, machine: 'SENSE-01', event: 'CRITICAL — New anomaly detected. RUL dropped: 8d → 3d. Failure risk increased.', severity: 'critical' as MachineState },
        ...prev,
      ].slice(0, 12))
      // Auto-hide toast after 4s, then show business panel
      setTimeout(() => {
        setAlertToast(false)
        setBusinessPanelOpen(true)
      }, 4000)
    }, 5000)
    return () => clearTimeout(t)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Live "last update" timestamp counter
  const [lastUpdateMs, setLastUpdateMs] = useState(0)
  useEffect(() => {
    const t = setInterval(() => setLastUpdateMs(ms => ms + 0.1), 100)
    return () => clearInterval(t)
  }, [])
  useEffect(() => { setLastUpdateMs(0) }, [tick])

  const sel = readings[selectedMachine]
  const selHistory = history[selectedMachine] ?? []
  const selRtai = rtaiHistory[selectedMachine] ?? []
  const latestRtai = selRtai[selRtai.length - 1] ?? null

  return (
    <div className="flex flex-col gap-5">

      {/* TOAST NOTIFICATION — dynamic alert wow effect */}
      {alertToast && (
        <div
          className="fixed top-20 right-4 z-[150] w-80 bg-[#0d0d0f] border border-[#ef4444]/50 rounded-sm shadow-2xl overflow-hidden"
          style={{ animation: 'slideInRight 0.4s ease', boxShadow: '0 0 30px rgba(239,68,68,0.20), 0 8px 32px rgba(0,0,0,0.8)' }}
        >
          <div className="h-0.5 w-full bg-[#ef4444]" />
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-sm bg-[#ef4444]/15 border border-[#ef4444]/30 flex items-center justify-center shrink-0">
                <AlertTriangle size={15} className="text-[#ef4444]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#ef4444] font-bold">New Anomaly Detected</span>
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ef4444] opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#ef4444]" />
                  </span>
                </div>
                <p className="text-xs font-semibold text-[#fafafa] mb-0.5">Motor D-19 — SENSE-01</p>
                <p className="text-[10px] text-[#71717a] leading-relaxed">Status escalated to CRITICAL. RUL: 8 days → 3 days. Immediate action required.</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-[#1c1c1f] flex items-center justify-between">
              <span className="text-[9px] font-mono text-[#3a3a3d]">AI Prediction updated</span>
              <button onClick={() => { setAlertToast(false); setBusinessPanelOpen(true) }}
                className="text-[9px] font-mono text-[#ef4444] hover:text-[#f87171] underline underline-offset-2 transition-colors">
                View Impact
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BUSINESS IMPACT PANEL — shown after dynamic alert */}
      {businessPanelOpen && (
        <div className="bg-[#0d0d0f] border border-[#ef4444]/40 rounded-sm overflow-hidden"
          style={{ boxShadow: '0 0 40px rgba(239,68,68,0.08)' }}>
          <div className="h-0.5 w-full bg-gradient-to-r from-[#ef4444] via-[#e8650a] to-transparent" />
          <div className="p-5">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-sm bg-[#ef4444]/12 border border-[#ef4444]/25 flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle size={17} className="text-[#ef4444]" />
                </div>
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-[#ef4444] mb-1">Critical Failure Risk Detected</p>
                  <h3 className="text-base font-bold text-[#fafafa]">Motor D-19 — Immediate Action Required</h3>
                  <p className="text-[10px] font-mono text-[#52525b] mt-0.5">SENSE-01 · Induction Motor · Unit 1 — Block A</p>
                </div>
              </div>
              <button onClick={() => setBusinessPanelOpen(false)}
                className="text-[#3a3a3d] hover:text-[#71717a] transition-colors shrink-0 mt-1">
                <X size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              {/* Predicted failure */}
              <div className="bg-[#111113] border border-[#ef4444]/20 rounded-sm p-4">
                <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2">Predicted Failure</p>
                <p className="text-2xl font-bold font-mono text-[#ef4444]">3 days</p>
                <p className="text-[9px] font-mono text-[#52525b] mt-1">All 4 AI models agree</p>
              </div>
              {/* Downtime cost */}
              <div className="bg-[#111113] border border-[#ef4444]/20 rounded-sm p-4">
                <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2">Est. Downtime Cost</p>
                <p className="text-2xl font-bold font-mono text-[#ef4444]">320,000 DZD</p>
                <p className="text-[9px] font-mono text-[#52525b] mt-1">If no action taken</p>
              </div>
              {/* Savings */}
              <div className="bg-[#111113] border border-[#10b981]/20 rounded-sm p-4">
                <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2">Savings if Planned</p>
                <p className="text-2xl font-bold font-mono text-[#10b981]">275,000 DZD</p>
                <p className="text-[9px] font-mono text-[#52525b] mt-1">By acting now</p>
              </div>
            </div>

            {/* Consequence */}
            <div className="flex items-start gap-2.5 bg-[#ef4444]/6 border border-[#ef4444]/15 rounded-sm px-4 py-3 mb-4">
              <AlertTriangle size={12} className="text-[#ef4444] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                <span className="text-[#ef4444] font-semibold">Production interruption likely</span> if no action is taken within 72 hours.
                Motor D-19 drives the primary production line — its failure halts the entire Unit 1 output.
              </p>
            </div>

            {/* Recommended actions */}
            <div className="mb-4">
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2.5">Recommended Actions</p>
              <div className="flex flex-col gap-2">
                {[
                  { priority: '01', action: 'Inspect bearing assembly and lubrication system immediately', urgency: 'Now', color: '#ef4444' },
                  { priority: '02', action: 'Schedule bearing replacement — order parts within 24 hours',  urgency: 'Today',    color: '#f59e0b' },
                  { priority: '03', action: 'Plan full motor overhaul during next scheduled downtime',    urgency: 'This week', color: '#3b82f6' },
                ].map(item => (
                  <div key={item.priority} className="flex items-center gap-3 bg-[#111113] border border-[#1c1c1f] rounded-sm px-3 py-2.5">
                    <span className="text-[9px] font-mono font-bold w-4 shrink-0" style={{ color: item.color }}>{item.priority}</span>
                    <span className="text-[11px] text-[#71717a] flex-1">{item.action}</span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-sm shrink-0"
                      style={{ color: item.color, background: `${item.color}12`, border: `1px solid ${item.color}25` }}>{item.urgency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Value message */}
            <div className="flex items-start gap-3 bg-[#e8650a]/6 border border-[#e8650a]/20 rounded-sm px-4 py-3">
              <Brain size={13} className="text-[#e8650a] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                <span className="text-[#e8650a] font-semibold">Mainteligence detected this issue early</span>, giving you a 3-day window to act.
                Unplanned failures cost 7x more than planned maintenance. This alert alone justifies your entire deployment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* LIVE STATUS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0a0a0c] border border-[#10b981]/20 rounded-sm px-5 py-3"
        style={{ boxShadow: '0 0 20px rgba(16,185,129,0.05)' }}>
        <div className="flex flex-wrap items-center gap-4">
          {/* LIVE pill */}
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
            </span>
            <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-widest">Live Data Stream</span>
            <span className="text-[10px] font-mono text-[#3a3a3d]">— Mainteligence Sense Connected</span>
          </div>
          <span className="text-[#1c1c1f]">|</span>
          {/* Sensors live */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b]">
            <Radio size={9} className="text-[#e8650a]" />
            <span>Sensors: <span className="text-[#e8650a]">Live Streaming</span></span>
          </div>
          <span className="text-[#1c1c1f]">|</span>
          {/* AI running */}
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b]">
            <Brain size={9} className="text-[#a78bfa]" />
            <span>AI Models: <span className="text-[#a78bfa]">Running</span></span>
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-[10px] font-mono text-[#52525b]">
            Last update: <span className="text-[#71717a]">{lastUpdateMs.toFixed(1)}s ago</span>
          </div>
          <div className="text-[9px] font-mono text-[#3a3a3d] border border-[#1c1c1f] px-2 py-1 rounded-sm">
            {MACHINE_IDS.length} devices · Tick #{tick}
          </div>
        </div>
      </div>

      {/* Machine selector cards */}
      {(() => {
        const ASSET_META: Record<string, { name: string; type: string; trend: (r: SensorReading | undefined, hist: SensorReading[]) => string; aiRul: (r: SensorReading | undefined) => number | null }> = {
          'SENSE-01': {
            name: 'Motor D-19', type: 'Induction Motor',
            trend: (r, hist) => !r ? 'stable' : hist.length > 5 && hist[hist.length - 1].healthScore < hist[hist.length - 5].healthScore - 2 ? 'degrading' : 'stable',
            aiRul: (r) => r ? Math.max(0, r.rul + Math.round(Math.sin(Date.now() / 3000) * 2)) : null,
          },
          'SENSE-02': {
            name: 'Motor E-04', type: 'Induction Motor',
            trend: (r, hist) => !r ? 'degrading' : r.state === 'critical' ? 'critical' : hist.length > 5 && hist[hist.length - 1].healthScore < hist[hist.length - 5].healthScore - 1 ? 'degrading' : 'stable',
            aiRul: (r) => r ? Math.max(0, r.rul + Math.round(Math.sin(Date.now() / 2800) * 1.5)) : null,
          },
          'SENSE-03': {
            name: 'Compressor F-11', type: 'Rotary Compressor',
            trend: () => 'critical',
            aiRul: (r) => r ? Math.max(0, r.rul + Math.round(Math.sin(Date.now() / 2500) * 1)) : null,
          },
          'SENSE-04': {
            name: 'Compressor G-02', type: 'Rotary Compressor',
            trend: (r, hist) => !r ? 'stable' : hist.length > 5 && hist[hist.length - 1].healthScore < hist[hist.length - 5].healthScore - 1 ? 'degrading' : 'stable',
            aiRul: (r) => r ? Math.max(0, r.rul + Math.round(Math.sin(Date.now() / 3200) * 2)) : null,
          },
          'SENSE-05': {
            name: 'Pump H-08', type: 'Centrifugal Pump',
            trend: (r) => !r ? 'degrading' : r.state === 'warning' ? 'degrading' : 'stable',
            aiRul: (r) => r ? Math.max(0, r.rul + Math.round(Math.sin(Date.now() / 2900) * 1.5)) : null,
          },
        }
        // Per-device static enrichment data
        const DEVICE_ENRICHMENT: Record<string, {
          tempNormal: number; vibNormal: number
          recommendedAction: string; failureCost: string | null
        }> = {
          'SENSE-01': { tempNormal: 290, vibNormal: 0.4, recommendedAction: forcedCritical === 'SENSE-01' ? 'Immediate inspection — bearing failure imminent' : 'Monitor closely — schedule inspection within 7 days', failureCost: forcedCritical === 'SENSE-01' ? '320,000 DZD' : null },
          'SENSE-02': { tempNormal: 340, vibNormal: 0.5, recommendedAction: 'Schedule bearing replacement within 48 hours', failureCost: '320,000 DZD' },
          'SENSE-03': { tempNormal: 310, vibNormal: 0.3, recommendedAction: 'Immediate shutdown — seal failure imminent', failureCost: '280,000 DZD' },
          'SENSE-04': { tempNormal: 315, vibNormal: 0.45, recommendedAction: 'No action required — schedule next inspection at 40 days RUL', failureCost: null },
          'SENSE-05': { tempNormal: 360, vibNormal: 0.6, recommendedAction: 'Inspect belt and impeller within 7 days', failureCost: '90,000 DZD' },
        }

        return (
          <div data-guided="machine-cards" className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {MACHINE_IDS.map(id => {
              const r = readings[id]
              const enrich = DEVICE_ENRICHMENT[id]
              const meta = ASSET_META[id]
              // Force SENSE-01 to critical after dynamic alert fires
              const baseSt: MachineState = r?.state ?? (id === 'SENSE-03' ? 'critical' : (id === 'SENSE-02' || id === 'SENSE-05') ? 'warning' : 'normal')
              const st: MachineState = (forcedCritical === id && baseSt !== 'critical') ? 'critical' : baseSt
              const isForcedCritical = forcedCritical === id && baseSt !== 'critical'

              const trend = meta.trend(r, history[id] ?? [])
              const displayTrend = (forcedCritical === id) ? 'critical' : trend
              const aiRul = isForcedCritical ? 3 : meta.aiRul(r)
              const trendColor = displayTrend === 'critical' ? '#ef4444' : displayTrend === 'degrading' ? '#f59e0b' : '#10b981'
              const trendLabel = displayTrend === 'critical' ? 'Critical' : displayTrend === 'degrading' ? 'Degrading' : 'Stable'

              const tempVal = r?.temperature ?? (id === 'SENSE-01' ? 294 : id === 'SENSE-02' ? 428 : id === 'SENSE-03' ? 571 : id === 'SENSE-04' ? 318 : 381)
              const vibVal  = r?.vibration  ?? (id === 'SENSE-01' ? 0.31 : id === 'SENSE-02' ? 1.87 : id === 'SENSE-03' ? 2.93 : id === 'SENSE-04' ? 0.52 : 1.24)
              const healthVal = r?.healthScore ?? (id === 'SENSE-01' ? (isForcedCritical ? 27 : 94) : id === 'SENSE-02' ? 62 : id === 'SENSE-03' ? 22 : id === 'SENSE-04' ? 81 : 49)

              const tempAbnormal = tempVal > enrich.tempNormal * 1.3
              const tempLabel = tempAbnormal ? `${tempVal}°C (ABNORMAL ↑)` : `${tempVal}°C (NORMAL)`
              const vibAbnormal = vibVal > enrich.vibNormal * 2.5
              const vibElevated = vibVal > enrich.vibNormal * 1.5
              const vibLabel = vibAbnormal ? 'High vibration — possible bearing wear'
                             : vibElevated ? 'Elevated vibration — monitor closely'
                             : 'Normal vibration — no issues'

              const riskLevel = st === 'critical' ? 'HIGH' : st === 'warning' ? 'MEDIUM' : 'LOW'
              const riskColor = st === 'critical' ? '#ef4444' : st === 'warning' ? '#f59e0b' : '#10b981'

              const aiText = aiRul !== null
                ? (aiRul <= 5  ? `Failure risk detected — RUL: ${aiRul} days`
                :  aiRul <= 20 ? `Medium risk — maintenance needed — RUL: ${aiRul} days`
                :                `Low risk — no immediate action required`)
                : 'Awaiting data...'

              const isSelected = selectedMachine === id
              const isHighlighted = isForcedCritical // pulsing glow on dynamic-alert card

              return (
                <button key={id} onClick={() => setSelectedMachine(id)}
                  className="text-left rounded-sm border transition-all duration-300 overflow-hidden bg-[#0d0d0f]"
                  style={{
                    borderColor: isSelected ? '#e8650a66' : st === 'critical' ? '#ef444430' : st === 'warning' ? '#f59e0b25' : '#1c1c1f',
                    boxShadow: isHighlighted ? '0 0 0 2px #ef4444, 0 0 28px rgba(239,68,68,0.25)' : 'none',
                  }}>
                  {/* Top color accent */}
                  <div className="h-0.5 w-full" style={{ background: stateColor[st] + (st === 'critical' ? 'cc' : '60') }} />

                  <div className="p-3">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0"
                          style={{ background: stateColor[st] + '18', border: `1px solid ${stateColor[st]}30` }}>
                          <Cpu size={11} style={{ color: stateColor[st] }} />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-[#e4e4e7] leading-none">{id}</p>
                          <p className="text-[7px] font-mono text-[#3a3a3d]">Sense</p>
                        </div>
                      </div>
                      {/* Status badge */}
                      <div className="flex items-center gap-1">
                        <span className="relative flex h-1.5 w-1.5 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: stateColor[st] }} />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: stateColor[st] }} />
                        </span>
                        <span className="text-[8px] font-mono font-bold uppercase tracking-widest" style={{ color: stateColor[st] }}>{st}</span>
                      </div>
                    </div>

                    {/* Linked asset */}
                    <div className="mb-2 px-2 py-1 bg-[#111113] border border-[#1c1c1f] rounded-sm">
                      <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Asset</p>
                      <p className="text-[9px] font-mono text-[#a1a1aa] font-semibold truncate">{meta.name}</p>
                    </div>

                    {/* Health bar */}
                    <div className="mb-2.5">
                      <div className="flex justify-between text-[8px] font-mono mb-1">
                        <span className="text-[#3a3a3d]">Health</span>
                        <span style={{ color: stateColor[st] }} className="font-bold">{healthVal}%</span>
                      </div>
                      <div className="h-2 bg-[#1a1a1d] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${healthVal}%`, background: `linear-gradient(90deg, ${stateColor[st]}aa, ${stateColor[st]})` }} />
                      </div>
                    </div>

                    {/* Temperature interpretation */}
                    <div className="mb-1.5 bg-[#111113] rounded-sm px-2 py-1.5 border border-[#1a1a1d]">
                      <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Temperature</p>
                      <p className="text-[9px] font-mono font-semibold" style={{ color: tempAbnormal ? '#ef4444' : '#f59e0b' }}>{tempLabel}</p>
                    </div>

                    {/* Vibration meaning */}
                    <div className="mb-2 bg-[#111113] rounded-sm px-2 py-1.5 border border-[#1a1a1d]">
                      <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Vibration ({vibVal}g)</p>
                      <p className="text-[8px] font-mono leading-snug" style={{ color: vibAbnormal ? '#ef4444' : vibElevated ? '#f59e0b' : '#10b981' }}>{vibLabel}</p>
                    </div>

                    {/* Trend + RUL */}
                    <div className="flex items-center justify-between mb-2 px-0.5">
                      <div className="flex items-center gap-1">
                        <TrendingDown size={8} style={{ color: trendColor }} />
                        <span className="text-[8px] font-mono" style={{ color: trendColor }}>{trendLabel}</span>
                      </div>
                      <span className="text-[8px] font-mono text-[#52525b]">RUL: <span className="font-bold" style={{ color: stateColor[st] }}>{aiRul ?? '—'}d</span></span>
                    </div>

                    {/* AI prediction + risk */}
                    <div className="mb-2 rounded-sm px-2 py-1.5 border"
                      style={{ background: `${riskColor}08`, borderColor: `${riskColor}25` }}>
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1">
                          <Brain size={8} style={{ color: riskColor }} />
                          <span className="text-[7px] font-mono uppercase text-[#3a3a3d]">AI Prediction</span>
                        </div>
                        <span className="text-[7px] font-mono font-bold uppercase px-1 rounded-sm"
                          style={{ color: riskColor, background: `${riskColor}15` }}>
                          {riskLevel} RISK
                        </span>
                      </div>
                      <p className="text-[8px] font-mono leading-snug" style={{ color: riskColor }}>{aiText}</p>
                    </div>

                    {/* Recommended action */}
                    <div className="mb-2 rounded-sm px-2 py-1.5 bg-[#111113] border border-[#1c1c1f]">
                      <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Recommended Action</p>
                      <p className="text-[8px] font-mono text-[#71717a] leading-snug">{enrich.recommendedAction}</p>
                    </div>

                    {/* Financial impact — only for warning/critical */}
                    {enrich.failureCost && (
                      <div className="rounded-sm px-2 py-1.5 border"
                        style={{ background: '#ef444408', borderColor: '#ef444420' }}>
                        <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Est. Failure Cost</p>
                        <p className="text-[10px] font-bold font-mono text-[#ef4444]">{enrich.failureCost}</p>
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        )
      })()}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* LEFT: KPIs + AI box + event log */}
        <div className="flex flex-col gap-4">
          <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-[#e4e4e7]">{selectedMachine} — Live Readings</p>
              {running && <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#10b981]"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />STREAMING</span>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <ThermometerSun size={13} />, label: 'Temperature', value: sel ? `${sel.temperature}°C` : '—', color: sel?.temperature && sel.temperature > 500 ? '#ef4444' : '#f59e0b' },
                { icon: <Activity size={13} />,       label: 'Vibration',   value: sel ? `${sel.vibration}g` : '—',   color: sel?.vibration && sel.vibration > 2.0 ? '#ef4444' : '#3b82f6' },
                { icon: <Gauge size={13} />,          label: 'Pressure',    value: sel ? `${sel.pressure} bar` : '—', color: '#10b981' },
                { icon: <RefreshCw size={13} />,      label: 'RPM',         value: sel ? `${sel.rpm}` : '—',          color: '#8b5cf6' },
                { icon: <Zap size={13} />,            label: 'Current',     value: sel ? `${sel.current}A` : '—',     color: '#f59e0b' },
                { icon: <Radio size={13} />,          label: 'Degradation', value: sel ? `${(sel.degradationTrend * 100).toFixed(1)}%` : '—', color: sel?.degradationTrend && sel.degradationTrend > 0.6 ? '#ef4444' : '#e8650a' },
              ].map(item => (
                <div key={item.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-2.5">
                  <div className="flex items-center gap-1 mb-1 text-[#52525b]">{item.icon}<span className="text-[8px] font-mono uppercase tracking-widest">{item.label}</span></div>
                  <p className="text-sm font-bold font-mono" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Real-time AI Prediction Panel ── */}
          <div data-guided="rtai-panel" className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={13} className="text-[#e8650a]" />
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">Real-time AI</p>
              </div>
              {latestRtai && (
                <span
                  className="text-[8px] font-mono uppercase px-2 py-0.5 rounded-sm border"
                  style={{
                    color: stateColor[latestRtai.status],
                    borderColor: stateColor[latestRtai.status] + '35',
                    background: stateBg[latestRtai.status],
                  }}
                >
                  {latestRtai.status === 'critical' ? 'Critical' : latestRtai.status === 'warning' ? 'Warning' : 'Normal'}
                </span>
              )}
            </div>

            {/* Ensemble RUL big number */}
            <div className="text-center py-1">
              <p className="text-[9px] font-mono text-[#3a3a3d] uppercase tracking-widest mb-1">Ensemble RUL</p>
              <p
                className="text-3xl font-bold font-mono leading-none"
                style={{ color: latestRtai ? stateColor[latestRtai.status] : '#3a3a3d' }}
              >
                {latestRtai ? `${latestRtai.ensemble}d` : '—'}
              </p>
              {latestRtai && (
                <p className="text-[9px] font-mono text-[#3a3a3d] mt-1">
                  LSTM 35% · GRU 30% · RF 20% · GB 15%
                </p>
              )}
            </div>

            {/* 4 model cards */}
            <div className="grid grid-cols-2 gap-1.5">
              {([ 
                { key: 'lstm' as const, label: 'LSTM',             color: RT_MODEL_COLORS.lstm },
                { key: 'gru'  as const, label: 'GRU',              color: RT_MODEL_COLORS.gru  },
                { key: 'rf'   as const, label: 'Random Forest',    color: RT_MODEL_COLORS.rf   },
                { key: 'gb'   as const, label: 'Gradient Boost',   color: RT_MODEL_COLORS.gb   },
              ] as const).map(m => (
                <div key={m.key} className="bg-[#111113] border border-[#1a1a1d] rounded-sm p-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8px] font-mono uppercase" style={{ color: m.color }}>{m.label}</span>
                    <span className="text-[10px] font-bold font-mono" style={{ color: latestRtai ? m.color : '#3a3a3d' }}>
                      {latestRtai ? `${latestRtai[m.key]}d` : '—'}
                    </span>
                  </div>
                  <RTModelSparkline history={selRtai} modelKey={m.key} color={m.color} />
                </div>
              ))}
            </div>

            {/* Anomaly + recommendation */}
            {latestRtai && (
              <div className="border-t border-[#1c1c1f] pt-3 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#3a3a3d]">Anomaly Flag</span>
                  <span style={{ color: sel?.anomalyFlag ? '#ef4444' : '#10b981' }}>
                    {sel?.anomalyFlag ? 'DETECTED' : 'CLEAR'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-[#3a3a3d]">Risk Level</span>
                  <span className="font-bold uppercase px-1.5 py-0.5 rounded-sm text-[8px]"
                    style={{ color: stateColor[latestRtai.status], background: stateBg[latestRtai.status] }}>
                    {latestRtai.status === 'critical' ? 'HIGH' : latestRtai.status === 'warning' ? 'MEDIUM' : 'LOW'}
                  </span>
                </div>
                <p className="text-[10px] text-[#52525b] leading-relaxed pt-1 border-t border-[#111113]">
                  {latestRtai.status === 'critical'
                    ? 'Failure risk detected — RUL critical. Immediate intervention required within 72 hours.'
                    : latestRtai.status === 'warning'
                    ? 'Failure risk detected — schedule maintenance within 2–3 weeks. Accelerating wear detected.'
                    : 'Low risk — no immediate action required. Next inspection at RUL = 40 days.'}
                </p>
              </div>
            )}

            {!sel && (
              <p className="text-[10px] font-mono text-[#3a3a3d] text-center py-2">
                Start stream to activate real-time AI predictions.
              </p>
            )}
          </div>

          <div data-guided="event-log" className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-[#e4e4e7]">Event Log</p>
              {running && <span className="text-[9px] font-mono text-[#52525b] bg-[#18181b] px-2 py-0.5 border border-[#27272a] rounded-sm">LIVE</span>}
            </div>
            {eventLog.length === 0 ? (
              <p className="text-[10px] font-mono text-[#3a3a3d]">Monitoring active — no events detected yet.</p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
                {eventLog.map((e, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-sm" style={{ background: stateBg[e.severity] }}>
                    <span className="text-[8px] font-mono text-[#3a3a3d] shrink-0 mt-0.5">{e.time}</span>
                    <div>
                      <span className="text-[9px] font-mono uppercase font-semibold" style={{ color: stateColor[e.severity] }}>{e.machine} </span>
                      <span className="text-[9px] font-mono text-[#52525b]">{e.event}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

          {/* RIGHT: Live charts */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* ── Real-time AI RUL predictions chart ── */}
          <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-[#e4e4e7]">Live RUL Predictions — {selectedMachine}</p>
                <p className="text-[10px] font-mono text-[#52525b] mt-0.5">4 model outputs updated every 0.8 s</p>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-end">
                {([
                  { key: 'lstm', label: 'LSTM',  dash: '',    color: RT_MODEL_COLORS.lstm },
                  { key: 'gru',  label: 'GRU',   dash: '5 3', color: RT_MODEL_COLORS.gru  },
                  { key: 'rf',   label: 'RF',    dash: '3 2', color: RT_MODEL_COLORS.rf   },
                  { key: 'gb',   label: 'GB',    dash: '3 2', color: RT_MODEL_COLORS.gb   },
                ] as const).map(s => (
                  <div key={s.key} className="flex items-center gap-1">
                    <svg width="14" height="6">
                      <line x1="0" y1="3" x2="14" y2="3" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} />
                    </svg>
                    <span className="text-[9px] font-mono" style={{ color: s.color }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <RTEnsembleChart history={selRtai} />
          </div>

          <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#e4e4e7]">Health Score Evolution — {selectedMachine}</p>
              <span className="text-[10px] font-mono text-[#52525b]">Last {MAX_HISTORY} readings · 0.8s interval</span>
            </div>
            <LiveSparkline data={selHistory.map(r => r.healthScore)} color={sel ? stateColor[sel.state] : '#10b981'} height={70} threshold={35} />
            <div className="flex justify-between text-[9px] font-mono text-[#3a3a3d] mt-1.5">
              <span>-{MAX_HISTORY * 0.8}s</span>
              <span className="text-[#ef4444]">— critical threshold (35)</span>
              <span>now</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: 'Temperature (°C)', key: 'temperature' as keyof SensorReading, color: '#f59e0b', threshold: 500 },
              { label: 'Vibration (g)',    key: 'vibration'   as keyof SensorReading, color: '#3b82f6', threshold: 2.0 },
              { label: 'Pressure (bar)',   key: 'pressure'    as keyof SensorReading, color: '#10b981', threshold: undefined },
              { label: 'Current Draw (A)', key: 'current'     as keyof SensorReading, color: '#8b5cf6', threshold: undefined },
            ].map(channel => (
              <div key={String(channel.key)} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-mono text-[#52525b]">{channel.label}</p>
                  <span className="text-xs font-bold font-mono" style={{ color: channel.color }}>
                    {sel ? String(sel[channel.key]) : '—'}
                  </span>
                </div>
                <LiveSparkline data={selHistory.map(r => r[channel.key] as number)} color={channel.color} height={44} threshold={channel.threshold} />
              </div>
            ))}
          </div>

          <div data-guided="fleet-health" className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold text-[#e4e4e7]">Fleet Health Overview</p>
              <span className="text-[9px] font-mono text-[#52525b]">All {MACHINE_IDS.length} Sense devices</span>
            </div>
            <div className="flex flex-col gap-3">
              {MACHINE_IDS.map(id => {
                const r = readings[id]
                const health = r?.healthScore ?? (id === 'SENSE-01' ? 94 : id === 'SENSE-02' ? 72 : 38)
                const st: MachineState = r?.state ?? (id === 'SENSE-01' ? 'normal' : id === 'SENSE-02' ? 'warning' : 'critical')
                return (
                  <div key={id} className="flex items-center gap-4">
                    <span className="text-[10px] font-mono text-[#71717a] w-20 shrink-0">{id}</span>
                    <div className="flex-1 h-3 bg-[#1c1c1f] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${health}%`, background: stateColor[st] }} />
                    </div>
                    <span className="text-[10px] font-mono w-8 text-right shrink-0" style={{ color: stateColor[st] }}>{health}%</span>
                    <span className="text-[9px] font-mono uppercase w-14 shrink-0" style={{ color: stateColor[st] }}>{st}</span>
                    <span className="text-[10px] font-mono text-[#52525b] w-12 shrink-0">RUL: {r?.rul ?? '—'}d</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#e4e4e7]">Degradation Trend — {selectedMachine}</p>
              <span className="text-[10px] font-mono text-[#52525b]">Cumulative degradation index</span>
            </div>
            <LiveSparkline data={selHistory.map(r => r.degradationTrend * 100)} color="#e8650a" height={56} />
            <p className="text-[9px] font-mono text-[#3a3a3d] mt-1.5">Higher values indicate accelerating wear — triggers maintenance at 60%</p>
          </div>

          {/* Bridge callout */}
          <div className="border border-[#27272a] bg-[#0d0d0f] rounded-sm p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8650a]/15 to-transparent" />
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 shrink-0 rounded-sm bg-[#e8650a]/10 border border-[#e8650a]/20 flex items-center justify-center">
                <Brain size={14} className="text-[#e8650a]" />
              </div>
              <p className="text-xs text-[#71717a] leading-relaxed">
                Sensor data from Mainteligence Sense feeds directly into the ML inference pipeline.{' '}
                <button onClick={onSwitchToAI} className="text-[#e8650a] underline underline-offset-2 hover:text-[#d15a08] transition-colors">
                  Switch to AI Prediction
                </button>{' '}
                to see how LSTM and ensemble models forecast Remaining Useful Life from this telemetry.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION COMPONENTS — Overview, RUL, Models, Insights, Alerts, Maintenance
// ─────────────────────────────────────────────────────────────────────────────

function OverviewSection() {
  return (
    <div className="flex flex-col gap-5">
      {/* KPI row */}
      <div data-guided="overview-kpis" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Machines Online',   value: '5 / 5',  sub: 'All Sense devices active',    color: '#10b981', icon: <Cpu size={15} /> },
          { label: 'Active Alerts',     value: '3',      sub: '2 critical · 1 warning',       color: '#ef4444', icon: <Bell size={15} /> },
          { label: 'Avg. Fleet Health', value: '68%',    sub: 'Down 4% from last week',       color: '#f59e0b', icon: <Activity size={15} /> },
          { label: 'Avg. RUL',          value: '47 days',sub: 'Motor B-07 critical at 5d',   color: '#3b82f6', icon: <LineChart size={15} /> },
        ].map(k => (
          <div key={k.label} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">{k.label}</p>
              <div className="w-7 h-7 rounded-sm flex items-center justify-center"
                style={{ background: `${k.color}18`, border: `1px solid ${k.color}25` }}>
                <span style={{ color: k.color }}>{k.icon}</span>
              </div>
            </div>
            <p className="text-2xl font-bold font-mono mb-1" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[10px] font-mono text-[#3a3a3d]">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Fleet status table */}
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-[#e4e4e7]">Asset Fleet Status</p>
          <span className="text-[9px] font-mono text-[#52525b] bg-[#111113] border border-[#1c1c1f] px-2 py-0.5 rounded-sm">5 Mainteligence Sense devices</span>
        </div>
        <div className="space-y-0 divide-y divide-[#111113]">
          {[
            { id: 'SENSE-01', name: 'Motor D-19',       health: 94, rul: 112, state: 'normal'   as const, temp: '294°C', vib: '0.31g' },
            { id: 'SENSE-02', name: 'Motor E-04',        health: 62, rul: 5,   state: 'warning'  as const, temp: '428°C', vib: '1.87g' },
            { id: 'SENSE-03', name: 'Compressor F-11',   health: 22, rul: 3,   state: 'critical' as const, temp: '571°C', vib: '2.93g' },
            { id: 'SENSE-04', name: 'Compressor G-02',   health: 81, rul: 78,  state: 'normal'   as const, temp: '318°C', vib: '0.52g' },
            { id: 'SENSE-05', name: 'Pump H-08',         health: 49, rul: 24,  state: 'warning'  as const, temp: '381°C', vib: '1.24g' },
          ].map(m => (
            <div key={m.id} className="flex items-center gap-4 py-3">
              <div className="w-20 shrink-0">
                <p className="text-[10px] font-mono text-[#71717a]">{m.id}</p>
                <p className="text-[9px] font-mono text-[#3a3a3d]">{m.name}</p>
              </div>
              <div className="flex-1">
                <div className="h-2 bg-[#1c1c1f] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${m.health}%`, background: stateColor[m.state] }} />
                </div>
              </div>
              <span className="text-[10px] font-mono w-8 text-right shrink-0" style={{ color: stateColor[m.state] }}>{m.health}%</span>
              <span className="text-[9px] font-mono w-16 shrink-0 text-[#52525b]">RUL: <span style={{ color: stateColor[m.state] }}>{m.rul}d</span></span>
              <span className="text-[9px] font-mono w-14 shrink-0 text-[#52525b]">{m.temp}</span>
              <span className="text-[9px] font-mono w-12 shrink-0 text-[#52525b]">{m.vib}</span>
              <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm shrink-0"
                style={{ color: stateColor[m.state], background: stateBg[m.state] }}>{m.state}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'AI Model Accuracy', value: '94.2%', sub: 'Ensemble RMSE: 11.3 cycles', color: '#e8650a' },
          { label: 'Alerts This Week',  value: '17',    sub: '12 critical · 5 warning',    color: '#ef4444' },
          { label: 'Est. Savings',      value: '1.2M DZD', sub: 'Vs unplanned breakdowns', color: '#10b981' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4 flex items-center gap-4">
            <div>
              <p className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest mb-1">{s.label}</p>
              <p className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] font-mono text-[#3a3a3d] mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AssetMonitorSection() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
        <p className="text-xs font-semibold text-[#e4e4e7] mb-4">Asset Register — All Machines</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { id: 'SENSE-01', name: 'Motor D-19',      type: 'Induction Motor',     location: 'Unit 1 — Block A', health: 94, rul: 112, state: 'normal'   as const, instDate: '2023-04-12', lastMaint: '2024-11-08' },
            { id: 'SENSE-02', name: 'Motor E-04',      type: 'Induction Motor',     location: 'Unit 2 — Block B', health: 62, rul: 5,   state: 'warning'  as const, instDate: '2022-09-01', lastMaint: '2024-08-20' },
            { id: 'SENSE-03', name: 'Compressor F-11', type: 'Rotary Compressor',   location: 'Unit 3 — Block C', health: 22, rul: 3,   state: 'critical' as const, instDate: '2021-06-17', lastMaint: '2024-06-03' },
            { id: 'SENSE-04', name: 'Compressor G-02', type: 'Rotary Compressor',   location: 'Unit 1 — Block D', health: 81, rul: 78,  state: 'normal'   as const, instDate: '2023-11-30', lastMaint: '2025-01-14' },
            { id: 'SENSE-05', name: 'Pump H-08',       type: 'Centrifugal Pump',    location: 'Unit 2 — Block E', health: 49, rul: 24,  state: 'warning'  as const, instDate: '2022-02-28', lastMaint: '2024-10-01' },
          ].map(m => (
            <div key={m.id} className="border border-[#1c1c1f] rounded-sm p-4 bg-[#111113]"
              style={{ borderColor: m.state === 'critical' ? '#ef444430' : m.state === 'warning' ? '#f59e0b20' : '#1c1c1f' }}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-semibold text-[#e4e4e7]">{m.name}</p>
                  <p className="text-[9px] font-mono text-[#3a3a3d]">{m.id} · {m.type}</p>
                </div>
                <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm"
                  style={{ color: stateColor[m.state], background: stateBg[m.state] }}>{m.state}</span>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-[9px] font-mono text-[#52525b] mb-1">
                  <span>Health</span><span style={{ color: stateColor[m.state] }}>{m.health}%</span>
                </div>
                <div className="h-1.5 bg-[#1c1c1f] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${m.health}%`, background: stateColor[m.state] }} />
                </div>
              </div>
              <div className="space-y-1">
                {[
                  ['Location', m.location],
                  ['RUL', `${m.rul} days`],
                  ['Installed', m.instDate],
                  ['Last Maint.', m.lastMaint],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-[9px] font-mono">
                    <span className="text-[#3a3a3d]">{k}</span>
                    <span className="text-[#71717a]">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function RULAnalyticsSection() {
  return (
    <div data-guided="rul-chart" className="flex flex-col gap-5">
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-[#e4e4e7]">RUL Prediction — Full Fleet</p>
            <p className="text-[10px] font-mono text-[#52525b] mt-0.5">Remaining Useful Life per asset · AI ensemble forecast</p>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { name: 'Compressor A-01', rul: 112, max: 125, state: 'normal'   as const },
            { name: 'Motor B-07',      rul: 5,   max: 125, state: 'critical' as const },
            { name: 'Pump C-14',       rul: 3,   max: 125, state: 'critical' as const },
            { name: 'Turbine D-02',    rul: 78,  max: 125, state: 'normal'   as const },
            { name: 'Fan Unit E-09',   rul: 24,  max: 125, state: 'warning'  as const },
          ].map(m => (
            <div key={m.name}>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                <span className="text-[#71717a]">{m.name}</span>
                <div className="flex items-center gap-3">
                  <span style={{ color: stateColor[m.state] }} className="font-bold">{m.rul}d</span>
                  <span className="text-[8px] uppercase px-1.5 py-0.5 rounded-sm"
                    style={{ color: stateColor[m.state], background: stateBg[m.state] }}>
                    {m.state === 'critical' ? 'CRITICAL' : m.state === 'warning' ? 'WARNING' : 'HEALTHY'}
                  </span>
                </div>
              </div>
              <div className="h-3 bg-[#1c1c1f] rounded-sm overflow-hidden">
                <div className="h-full rounded-sm transition-all duration-700"
                  style={{ width: `${(m.rul / m.max) * 100}%`, background: stateColor[m.state] }} />
              </div>
              {/* Threshold markers */}
              <div className="relative h-0">
                <div className="absolute top-0 h-3 w-px bg-[#ef4444]/50" style={{ left: `${(15 / m.max) * 100}%`, marginTop: '-12px' }} />
                <div className="absolute top-0 h-3 w-px bg-[#f59e0b]/50" style={{ left: `${(40 / m.max) * 100}%`, marginTop: '-12px' }} />
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[#111113]">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#ef4444]">
            <div className="w-px h-3 bg-[#ef4444]/50" /> Critical (15d)
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#f59e0b]">
            <div className="w-px h-3 bg-[#f59e0b]/50" /> Warning (40d)
          </div>
        </div>
      </div>

      {/* RUL history table */}
      <AIPredictionTab />
    </div>
  )
}

function ModelComparisonSection() {
  return (
    <div data-guided="model-comparison" className="flex flex-col gap-5">
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <GitCompare size={14} className="text-[#a78bfa]" />
          <p className="text-xs font-semibold text-[#e4e4e7]">AI Model Performance — Comparison Matrix</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {[
            { key: 'LSTM',      color: '#e8650a', rmse: 11.3, mae: 8.7, r2: 0.941, speed: '12ms' },
            { key: 'GRU',       color: '#a78bfa', rmse: 12.1, mae: 9.2, r2: 0.936, speed: '10ms' },
            { key: 'Random Forest', color: '#3b82f6', rmse: 14.8, mae: 11.4, r2: 0.918, speed: '3ms'  },
            { key: 'XGBoost',   color: '#10b981', rmse: 13.2, mae: 10.1, r2: 0.928, speed: '5ms'  },
          ].map(m => {
            const isBest = m.rmse === 11.3
            return (
              <div key={m.key} className={`border rounded-sm p-4 relative ${isBest ? 'border-[#e8650a]/40' : 'border-[#1c1c1f]'}`}>
                {isBest && (
                  <div className="absolute -top-2.5 left-3 flex items-center gap-1 text-[8px] font-mono text-[#e8650a] bg-[#0d0d0f] border border-[#e8650a]/25 px-1.5 py-0.5 rounded-sm">
                    <Target size={8} /> Best Model
                  </div>
                )}
                <div className="flex items-center gap-2 mb-3 mt-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: m.color }} />
                  <p className="text-xs font-semibold text-[#fafafa]">{m.key}</p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'RMSE', value: `${m.rmse}`, unit: 'cycles' },
                    { label: 'MAE',  value: `${m.mae}`,  unit: 'cycles' },
                    { label: 'R²',   value: `${m.r2}`,   unit: '' },
                    { label: 'Inf. Speed', value: m.speed, unit: '' },
                  ].map(s => (
                    <div key={s.label} className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-[#3a3a3d]">{s.label}</span>
                      <span style={{ color: m.color }}>{s.value} <span className="text-[#27272a]">{s.unit}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        <div className="space-y-3">
          {[
            { key: 'LSTM',   color: '#e8650a', rmse: 11.3, max: 15 },
            { key: 'GRU',    color: '#a78bfa', rmse: 12.1, max: 15 },
            { key: 'RF',     color: '#3b82f6', rmse: 14.8, max: 15 },
            { key: 'XGBoost',color: '#10b981', rmse: 13.2, max: 15 },
          ].map(m => (
            <div key={m.key}>
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span style={{ color: m.color }}>{m.key}</span>
                <span className="text-[#52525b]">RMSE: <span style={{ color: m.color }}>{m.rmse}</span></span>
              </div>
              <div className="h-2 bg-[#1c1c1f] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${(1 - m.rmse / m.max) * 100}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] font-mono text-[#3a3a3d] mt-3">Bar length = relative accuracy — longer bar = lower RMSE = better prediction</p>
      </div>
    </div>
  )
}

function AIInsightsSection() {
  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { machine: 'Motor E-04',       rul: 5,  risk: 'CRITICAL', action: 'Immediate shutdown and bearing replacement within 5 days. All 4 models agree.', color: '#ef4444', cost: '320 000 DZD', save: '275 000 DZD' },
          { machine: 'Compressor F-11', rul: 3,  risk: 'CRITICAL', action: 'Seal failure imminent. Schedule emergency intervention. Order spare parts now.', color: '#ef4444', cost: '280 000 DZD', save: '235 000 DZD' },
          { machine: 'Pump H-08',       rul: 24, risk: 'WARNING',  action: 'Schedule maintenance within 2 weeks. Belt wear detected by vibration sensors.', color: '#f59e0b', cost: '90 000 DZD',  save: '60 000 DZD'  },
          { machine: 'Compressor G-02', rul: 78, risk: 'HEALTHY',  action: 'Normal operation. Next planned inspection at RUL = 40 days per protocol.', color: '#10b981', cost: '45 000 DZD',  save: '—' },
        ].map(item => (
          <div key={item.machine} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4"
            style={{ borderColor: item.risk === 'CRITICAL' ? '#ef444425' : item.risk === 'WARNING' ? '#f59e0b20' : '#1c1c1f' }}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[#e4e4e7]">{item.machine}</p>
              <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm"
                style={{ color: item.color, background: `${item.color}15`, border: `1px solid ${item.color}25` }}>
                {item.risk}
              </span>
            </div>
            <div className="flex items-end gap-2 mb-3">
              <p className="text-3xl font-bold font-mono" style={{ color: item.color }}>{item.rul}</p>
              <p className="text-sm text-[#52525b] mb-1 font-mono">days RUL</p>
            </div>
            <p className="text-[11px] text-[#71717a] leading-relaxed mb-3 border-l-2 pl-2.5"
              style={{ borderColor: item.color + '60' }}>{item.action}</p>
            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#111113]">
              <div>
                <p className="text-[8px] font-mono text-[#3a3a3d]">Est. breakdown cost</p>
                <p className="text-[11px] font-bold font-mono text-[#ef4444]">{item.cost}</p>
              </div>
              <div>
                <p className="text-[8px] font-mono text-[#3a3a3d]">Savings if planned</p>
                <p className="text-[11px] font-bold font-mono text-[#10b981]">{item.save}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertsSection() {
  const alerts = [
    { id: 'ALT-001', time: '14:27:03', machine: 'SENSE-03 · Compressor F-11', event: 'Temperature exceeded threshold (571°C)', severity: 'critical' as const, rul: '3d',  cost: '280 000 DZD' },
    { id: 'ALT-002', time: '14:19:47', machine: 'SENSE-02 · Motor E-04',      event: 'Vibration spike detected (2.93g)',        severity: 'critical' as const, rul: '5d',  cost: '320 000 DZD' },
    { id: 'ALT-003', time: '14:08:12', machine: 'SENSE-05 · Pump H-08',       event: 'Degradation trend increasing (61.3%)',   severity: 'warning'  as const, rul: '24d', cost: '90 000 DZD'  },
    { id: 'ALT-004', time: '13:55:30', machine: 'SENSE-03 · Compressor F-11', event: 'Health score critical (22%)',             severity: 'critical' as const, rul: '3d',  cost: '280 000 DZD' },
    { id: 'ALT-005', time: '13:41:09', machine: 'SENSE-02 · Motor E-04',      event: 'Anomaly flag raised — multi-sensor',     severity: 'critical' as const, rul: '5d',  cost: '320 000 DZD' },
    { id: 'ALT-006', time: '12:30:55', machine: 'SENSE-05 · Pump H-08',       event: 'Pressure drop below lower bound',         severity: 'warning'  as const, rul: '24d', cost: '90 000 DZD'  },
  ]
  return (
    <div data-guided="alerts-panel" className="flex flex-col gap-5">
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold text-[#e4e4e7]">Active Alerts</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#ef4444]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" /> 4 Critical
            </span>
            <span className="text-[9px] font-mono text-[#f59e0b]">2 Warning</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {alerts.map(a => (
            <div key={a.id} className="flex items-start gap-3 p-3 rounded-sm border"
              style={{ background: stateBg[a.severity], borderColor: stateColor[a.severity] + '25' }}>
              <div className="shrink-0 mt-0.5">
                <AlertTriangle size={13} style={{ color: stateColor[a.severity] }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="text-[10px] font-mono font-semibold" style={{ color: stateColor[a.severity] }}>{a.machine}</p>
                  <span className="text-[8px] font-mono text-[#3a3a3d]">{a.time}</span>
                </div>
                <p className="text-[10px] text-[#71717a]">{a.event}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[9px] font-mono text-[#ef4444] font-bold">{a.cost}</p>
                <p className="text-[8px] font-mono text-[#3a3a3d]">RUL: {a.rul}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Financial summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Exposure',   value: '1 380 000 DZD', color: '#ef4444', sub: 'If no action taken' },
          { label: 'Planned Maint.',   value: '180 000 DZD',   color: '#3b82f6', sub: 'Total intervention cost' },
          { label: 'Net Savings',      value: '1 200 000 DZD', color: '#10b981', sub: 'With Mainteligence' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
            <p className="text-[9px] font-mono text-[#3a3a3d] uppercase tracking-widest mb-1">{s.label}</p>
            <p className="text-lg font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[9px] font-mono text-[#3a3a3d] mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MaintenanceSection() {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
        <p className="text-xs font-semibold text-[#e4e4e7] mb-4">Maintenance Schedule</p>
        <div className="flex flex-col gap-3">
          {[
            { id: 'WO-0041', machine: 'Compressor F-11', priority: 'URGENT', date: 'Today',      type: 'Seal replacement',          tech: 'Team B', parts: 'In stock', duration: '4h' },
            { id: 'WO-0042', machine: 'Motor E-04',     priority: 'HIGH',   date: 'Tomorrow',   type: 'Bearing replacement',       tech: 'Team A', parts: 'On order', duration: '6h' },
            { id: 'WO-0043', machine: 'Pump H-08',      priority: 'MEDIUM', date: 'In 7 days',  type: 'Seal & impeller service',   tech: 'Team C', parts: 'In stock', duration: '3h' },
            { id: 'WO-0044', machine: 'Compressor G-02',priority: 'LOW',    date: 'In 45 days', type: 'Scheduled inspection',      tech: 'Team A', parts: 'N/A',      duration: '2h' },
          ].map(w => {
            const pColor = w.priority === 'URGENT' ? '#ef4444' : w.priority === 'HIGH' ? '#f59e0b' : w.priority === 'MEDIUM' ? '#3b82f6' : '#10b981'
            return (
              <div key={w.id} className="flex items-center gap-4 p-4 border border-[#1c1c1f] rounded-sm bg-[#111113]">
                <div className="w-20 shrink-0">
                  <p className="text-[9px] font-mono text-[#52525b]">{w.id}</p>
                  <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm"
                    style={{ color: pColor, background: `${pColor}15` }}>{w.priority}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#e4e4e7]">{w.machine}</p>
                  <p className="text-[9px] font-mono text-[#52525b]">{w.type}</p>
                </div>
                <div className="hidden md:grid grid-cols-3 gap-6 shrink-0">
                  {[['Date', w.date], ['Tech', w.tech], ['Est.', w.duration]].map(([k, v]) => (
                    <div key={k}>
                      <p className="text-[8px] font-mono text-[#3a3a3d]">{k}</p>
                      <p className="text-[10px] font-mono text-[#71717a]">{v}</p>
                    </div>
                  ))}
                </div>
                <div className="shrink-0">
                  <span className="text-[8px] font-mono px-2 py-1 border border-[#27272a] rounded-sm text-[#52525b]">
                    Parts: {w.parts}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="flex gap-3">
        <Link href="/contact"
          className="flex items-center gap-2 bg-[#e8650a] hover:bg-[#d15a08] text-white text-xs font-semibold px-5 py-2.5 rounded-sm transition-all hover:shadow-[0_0_20px_rgba(232,101,10,0.30)]">
          <Wrench size={13} /> Request Full Deployment
        </Link>
        <Link href="/contact"
          className="flex items-center gap-2 border border-[#27272a] hover:border-[#52525b] text-[#a1a1aa] hover:text-[#fafafa] text-xs font-medium px-5 py-2.5 rounded-sm transition-colors">
          <ClipboardList size={13} /> Schedule a Demo Call
        </Link>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// INTRO MODAL — onboarding before the guided demo
// ─────────────────────────────────────────────────────────────────────────────

interface IntroModalProps {
  onStartGuided: () => void
  onSkip: () => void
}

function IntroModal({ onStartGuided, onSkip }: IntroModalProps) {
  const [bootStep, setBootStep] = useState(0)

  // Simulate a 3-step "system boot" sequence on mount
  useEffect(() => {
    const t1 = setTimeout(() => setBootStep(1), 400)
    const t2 = setTimeout(() => setBootStep(2), 900)
    const t3 = setTimeout(() => setBootStep(3), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const DEPLOYMENT = [
    { id: 'SENSE-01', asset: 'Motor D-19',       type: 'Induction Motor',     state: 'normal'   as const },
    { id: 'SENSE-02', asset: 'Motor E-04',        type: 'Induction Motor',     state: 'warning'  as const },
    { id: 'SENSE-03', asset: 'Compressor F-11',   type: 'Rotary Compressor',   state: 'critical' as const },
    { id: 'SENSE-04', asset: 'Compressor G-02',   type: 'Rotary Compressor',   state: 'normal'   as const },
    { id: 'SENSE-05', asset: 'Pump H-08',         type: 'Centrifugal Pump',    state: 'warning'  as const },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm" />

      {/* Modal — max-h so it never overflows the viewport; inner body scrolls */}
      <div
        className="relative w-full max-w-[480px] bg-[#0a0a0c] border border-[#27272a] rounded-sm shadow-2xl flex flex-col"
        style={{
          maxHeight: 'calc(100vh - 48px)',
          boxShadow: '0 0 80px rgba(232,101,10,0.08), 0 30px 60px rgba(0,0,0,0.9)',
        }}
      >
        {/* Top accent line */}
        <div className="h-0.5 w-full shrink-0 bg-gradient-to-r from-transparent via-[#e8650a] to-transparent" />

        {/* Header — fixed, never scrolls */}
        <div className="px-5 pt-5 pb-4 border-b border-[#1c1c1f] shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#10b981]">System Active</span>
            <span className="text-[9px] font-mono text-[#3a3a3d]">· Mainteligence v2.4</span>
          </div>
          <h2 className="text-base font-bold text-[#fafafa] tracking-tight mb-1">
            Welcome to your Mainteligence workspace
          </h2>
          <p className="text-[10px] text-[#52525b] font-mono">
            Industrial AI Monitoring Platform · Demo Environment
          </p>
        </div>

        {/* Body — scrollable if content overflows */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          {/* Context paragraph */}
          <div className="space-y-2">
            <p className="text-sm text-[#a1a1aa] leading-relaxed">
              You are an industrial company using Mainteligence.
            </p>
            <p className="text-sm text-[#a1a1aa] leading-relaxed">
              Your deployment includes:
            </p>
            <ul className="space-y-1 pl-1">
              {[
                { icon: <Cpu size={10} />, text: '5 Mainteligence Sense devices deployed', color: '#e8650a' },
                { icon: <Activity size={10} />, text: '5 machines connected and monitored',  color: '#3b82f6' },
                { icon: <Brain size={10} />, text: 'Real-time AI monitoring enabled',         color: '#a78bfa' },
                { icon: <Bell size={10} />, text: 'Anomaly detection actively running',       color: '#ef4444' },
              ].map((item, i) => (
                <li key={i} className={`flex items-center gap-2 text-xs text-[#71717a] transition-all duration-300 ${bootStep > 0 ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Device deployment table */}
          <div className={`border border-[#1c1c1f] rounded-sm overflow-hidden transition-all duration-500 ${bootStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-between px-3 py-2 bg-[#111113] border-b border-[#1c1c1f]">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#52525b]">Deployed Assets</span>
              <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#10b981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" /> All devices online
              </span>
            </div>
            <div className="divide-y divide-[#111113]">
              {DEPLOYMENT.map((d, i) => (
                <div key={d.id}
                  className={`flex items-center justify-between px-3 py-2 transition-all duration-300 ${bootStep >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
                  style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-[#52525b] w-20">{d.id}</span>
                    <div>
                      <p className="text-[10px] font-semibold text-[#e4e4e7]">{d.asset}</p>
                      <p className="text-[8px] font-mono text-[#3a3a3d]">{d.type}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm"
                    style={{ color: stateColor[d.state], background: stateBg[d.state], border: `1px solid ${stateColor[d.state]}25` }}>
                    {d.state}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Anomaly callout */}
          <div className={`flex items-start gap-3 bg-[#ef4444]/6 border border-[#ef4444]/20 rounded-sm px-4 py-3 transition-all duration-500 ${bootStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            <AlertTriangle size={14} className="text-[#ef4444] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
              Your system is now live and actively detecting anomalies.{' '}
              <span className="text-[#ef4444] font-semibold">2 critical alerts</span> require immediate attention.
            </p>
          </div>
        </div>

        {/* Footer — always visible, never scrolls away */}
        <div className="px-5 pt-3 pb-4 border-t border-[#1c1c1f] shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onStartGuided}
              className="flex-1 flex items-center justify-center gap-2 bg-[#e8650a] hover:bg-[#d15a08] text-white text-sm font-semibold py-2.5 px-4 rounded-sm transition-all hover:shadow-[0_0_20px_rgba(232,101,10,0.30)]"
            >
              <Play size={12} fill="white" />
              Start Guided Demo
            </button>
            <button
              onClick={onSkip}
              className="flex-1 flex items-center justify-center gap-2 border border-[#27272a] hover:border-[#3a3a3d] text-[#71717a] hover:text-[#a1a1aa] text-sm font-medium py-2.5 px-4 rounded-sm transition-colors"
            >
              Explore Platform
              <ArrowRight size={12} />
            </button>
          </div>
          <p className="text-[9px] font-mono text-[#27272a] text-center">
            Simulated environment · Data is generated for demonstration purposes
          </p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// UNIFIED DEMO PAGE — full SaaS platform shell with sidebar
// ─────────────────────────────────────────────────────────────────────────────

const SIDEBAR_ITEMS: { id: DemoTab; label: string; icon: ReactNode; badge?: string; badgeColor?: string }[] = [
  { id: 'overview',     label: 'Overview',         icon: <LayoutDashboard size={15} /> },
  { id: 'asset',        label: 'Asset Monitor',     icon: <Cpu size={15} /> },
  { id: 'rul',          label: 'RUL Analytics',     icon: <LineChart size={15} />,    badge: '2 CRITICAL', badgeColor: '#ef4444' },
  { id: 'models',       label: 'Model Comparison',  icon: <BarChart3 size={15} /> },
  { id: 'insights',     label: 'AI Insights',       icon: <Lightbulb size={15} />,    badge: 'NEW',        badgeColor: '#e8650a' },
  { id: 'sensor',       label: 'Sensor Feed',       icon: <Rss size={15} />,          badge: 'LIVE',       badgeColor: '#10b981' },
  { id: 'alerts',       label: 'Alerts',            icon: <Bell size={15} />,         badge: '6',          badgeColor: '#ef4444' },
  { id: 'maintenance',  label: 'Maintenance',       icon: <ClipboardList size={15} /> },
]

export default function DemoPage() {
  const [section, setSection] = useState<DemoTab>('overview')
  const [guidedOpen, setGuidedOpen] = useState(false)
  const [introOpen, setIntroOpen] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleStartGuided() {
    setIntroOpen(false)
    setGuidedOpen(true)
  }

  function handleSkip() {
    setIntroOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <AppNavbar />

      {/* Intro modal — shown on first load */}
      {introOpen && (
        <IntroModal onStartGuided={handleStartGuided} onSkip={handleSkip} />
      )}

      {/* Guided demo overlay — floats on top of the real dashboard */}
      {guidedOpen && !introOpen && (
        <GuidedDemoOverlay
          onClose={() => setGuidedOpen(false)}
          onSetSection={(s) => setSection(s)}
        />
      )}

      <div className="flex flex-1 pt-16 min-h-0">

        {/* ── Sidebar ── */}
        <aside className={`
          fixed top-16 left-0 bottom-0 z-40 w-56 bg-[#0a0a0c] border-r border-[#1c1c1f] flex flex-col
          transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:flex lg:z-auto
        `}>
          {/* Sidebar header */}
          <div className="px-4 py-4 border-b border-[#1c1c1f]">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e8650a] animate-pulse" />
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#e8650a]">Demo Mode</span>
            </div>
            <p className="text-[10px] font-mono text-[#52525b] leading-tight">Simulated Industrial Plant</p>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-3 px-2">
            {SIDEBAR_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => { setSection(item.id); setSidebarOpen(false) }}
                className={`
                  w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-sm mb-0.5 text-left transition-all
                  ${section === item.id
                    ? 'bg-[#e8650a]/10 border border-[#e8650a]/20 text-[#fafafa]'
                    : 'text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#111113] border border-transparent'}
                `}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span style={{ color: section === item.id ? '#e8650a' : '#3a3a3d' }}>{item.icon}</span>
                  <span className="text-[11px] font-medium truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[8px] font-mono px-1 py-0.5 rounded-sm shrink-0"
                    style={{ color: item.badgeColor, background: `${item.badgeColor}18`, border: `1px solid ${item.badgeColor}30` }}>
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar footer CTA */}
          <div className="px-3 py-4 border-t border-[#1c1c1f]">
            <Link href="/contact"
              className="flex items-center justify-center gap-1.5 w-full bg-[#e8650a] hover:bg-[#d15a08] text-white text-[10px] font-semibold py-2 rounded-sm transition-all">
              <ArrowRight size={11} /> Request Deployment
            </Link>
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-[#09090b]/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Main content ── */}
        <main className="flex-1 min-w-0 flex flex-col">

          {/* Top bar */}
          <div className="border-b border-[#1c1c1f] bg-[#0a0a0c] px-4 lg:px-6 py-3 flex items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              {/* Mobile menu toggle */}
              <button onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-[#52525b] hover:text-[#a1a1aa] transition-colors">
                {sidebarOpen ? <ChevronLeft size={18} /> : <LayoutDashboard size={18} />}
              </button>
              <div>
                <p className="text-xs font-semibold text-[#fafafa]">
                  {SIDEBAR_ITEMS.find(s => s.id === section)?.label ?? 'Dashboard'}
                </p>
                <p className="text-[9px] font-mono text-[#3a3a3d]">Mainteligence · Demo Environment</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* DEMO MODE badge */}
              <div className="hidden sm:flex items-center gap-1.5 border border-[#e8650a]/25 bg-[#e8650a]/8 px-2.5 py-1.5 rounded-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e8650a] animate-pulse" />
                <span className="text-[9px] font-mono uppercase tracking-widest text-[#e8650a]">Demo Mode — Simulated Data</span>
              </div>
              <button
                onClick={() => { setIntroOpen(false); setGuidedOpen(true) }}
                className="flex items-center gap-1.5 bg-[#e8650a] hover:bg-[#d15a08] text-white text-[10px] font-semibold px-3 py-1.5 rounded-sm transition-all hover:shadow-[0_0_16px_rgba(232,101,10,0.35)]"
              >
                <Play size={10} fill="white" /> Start Guided Demo
              </button>
            </div>
          </div>

          {/* Section content */}
          <div className="flex-1 overflow-y-auto p-4 lg:p-6">
            {section === 'overview'    && <OverviewSection />}
            {section === 'asset'       && <AssetMonitorSection />}
            {section === 'rul'         && <RULAnalyticsSection />}
            {section === 'models'      && <ModelComparisonSection />}
            {section === 'insights'    && <AIInsightsSection />}
            {section === 'sensor'      && <IoTMonitoringTab onSwitchToAI={() => setSection('rul')} />}
            {section === 'alerts'      && <AlertsSection />}
            {section === 'maintenance' && <MaintenanceSection />}
          </div>
        </main>
      </div>
    </div>
  )
}
