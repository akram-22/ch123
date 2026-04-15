'use client'

/**
 * PAGE: IoT Live Demo (Standalone)
 * ROUTE: /iot-demo
 * PURPOSE: Standalone IoT sensor stream demo — Mainteligence Sense device simulation,
 *          real-time telemetry, degradation engine, RTAI scoring (used as embedded reference)
 */

import { useState, useEffect, useRef, useCallback, useId } from 'react'
import Link from 'next/link'
import AppNavbar from '@/components/app-navbar'
import {
  Activity, Cpu, Gauge, Radio,
  ThermometerSun, Zap,
  Play, Square, RefreshCw, Brain, ArrowRight
} from 'lucide-react'

// ── IoT simulation engine ─────────────────────────────────────────────────────

type MachineState = 'normal' | 'warning' | 'critical'

interface SensorReading {
  timestamp: number           // ms epoch
  machineId: string
  temperature: number         // °C
  vibration: number           // g
  pressure: number            // bar
  rpm: number
  current: number             // A
  healthScore: number         // 0–100
  anomalyFlag: boolean
  degradationTrend: number    // 0–1 cumulative
  state: MachineState
  rul: number                 // estimated cycles
}

const MACHINE_IDS = ['SENSE-01', 'SENSE-02', 'SENSE-03']

// Deterministic + time-based noise for realistic sensor variation
function sineNoise(t: number, freq: number, amp: number) {
  return Math.sin(t * freq) * amp
}

function generateReading(machineId: string, tick: number, degradation: number): SensorReading {
  const idx = MACHINE_IDS.indexOf(machineId)
  const seed = idx + 1

  // Temperature: 280–580°C range with degradation drift
  const tempBase = 280 + idx * 40
  const temperature = parseFloat((
    tempBase + degradation * 180 * seed +
    sineNoise(tick, 0.1 + idx * 0.05, 8) +
    sineNoise(tick, 0.3, 3)
  ).toFixed(1))

  // Vibration: 0.2–3.5g range
  const vibration = parseFloat((
    0.25 + degradation * 2.8 * (1 + idx * 0.3) +
    Math.abs(sineNoise(tick, 0.2 + idx * 0.08, 0.4)) +
    (tick % 15 === 0 ? 0.3 : 0)  // occasional spike
  ).toFixed(3))

  // Pressure: 8–28 bar
  const pressure = parseFloat((
    10 + idx * 4 - degradation * 3 +
    sineNoise(tick, 0.07, 0.8)
  ).toFixed(2))

  // RPM: 1800–4200
  const rpm = Math.round(
    2200 + idx * 400 - degradation * 600 +
    sineNoise(tick, 0.05, 80)
  )

  // Current: 12–48A
  const current = parseFloat((
    18 + idx * 6 + degradation * 15 +
    sineNoise(tick, 0.12, 1.5)
  ).toFixed(2))

  // Health score: degrades from 100 → 0
  const healthScore = Math.max(0, Math.round(100 - degradation * 95 - Math.abs(sineNoise(tick, 0.08, 2))))

  // Anomaly: threshold-based
  const anomalyFlag = vibration > 2.0 || temperature > 520 || healthScore < 30

  // State
  const state: MachineState = healthScore > 70 ? 'normal' : healthScore > 35 ? 'warning' : 'critical'

  // RUL: inversely proportional to degradation
  const rul = Math.max(0, Math.round((1 - degradation) * 125 - tick * 0.05))

  return {
    timestamp: Date.now(),
    machineId,
    temperature,
    vibration,
    pressure,
    rpm,
    current,
    healthScore,
    anomalyFlag,
    degradationTrend: parseFloat(degradation.toFixed(4)),
    state,
    rul,
  }
}

const MAX_HISTORY = 60

// ── Chart component ───────────────────────────────────────────────────────────

function LiveSparkline({ data, color, height = 50, threshold }: { data: number[]; color: string; height?: number; threshold?: number }) {
  // useId produces a unique, stable id per component instance — eliminates SVG gradient id collisions
  const uid = useId().replace(/:/g, '')
  const gradId = `sg-${uid}`

  if (data.length < 2) return <div style={{ height }} className="bg-[#111113] rounded-sm animate-pulse" />

  const min = Math.min(...data)
  const max = Math.max(...data)
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
      {thY != null && (
        <line x1={0} y1={thY} x2={W} y2={thY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" opacity="0.5" />
      )}
      <path d={line} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx={norm[norm.length - 1].x} cy={norm[norm.length - 1].y} r="3" fill={color} />
    </svg>
  )
}

function HealthGauge({ value }: { value: number }) {
  const color = value > 70 ? '#10b981' : value > 35 ? '#f59e0b' : '#ef4444'
  const r = 38, cx = 48, cy = 48
  const pct = value / 100
  const circumference = Math.PI * r
  const dash = pct * circumference
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

const stateColor: Record<MachineState, string> = { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' }
const stateBg:    Record<MachineState, string> = { normal: 'rgba(16,185,129,0.08)', warning: 'rgba(245,158,11,0.08)', critical: 'rgba(239,68,68,0.10)' }

// ── IoT Demo Page ─────────────────────────────────────────────────────────────

export default function IoTDemoPage() {
  const [running, setRunning] = useState(false)
  const [tick, setTick] = useState(0)
  const [selectedMachine, setSelectedMachine] = useState(MACHINE_IDS[0])

  // Degradation states per machine (increases over time)
  const degradationRef = useRef<Record<string, number>>({
    'SENSE-01': 0.05,
    'SENSE-02': 0.28,
    'SENSE-03': 0.62,
  })

  // History buffers
  const historyRef = useRef<Record<string, SensorReading[]>>({
    'SENSE-01': [],
    'SENSE-02': [],
    'SENSE-03': [],
  })

  // Latest readings state (triggers re-render)
  const [readings, setReadings] = useState<Record<string, SensorReading>>({})
  const [history, setHistory] = useState<Record<string, SensorReading[]>>({
    'SENSE-01': [], 'SENSE-02': [], 'SENSE-03': [],
  })
  const [eventLog, setEventLog] = useState<{ time: string; machine: string; event: string; severity: MachineState }[]>([])

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const tick_fn = useCallback(() => {
    setTick(t => {
      const nextTick = t + 1
      const newReadings: Record<string, SensorReading> = {}

      MACHINE_IDS.forEach(id => {
        // Slowly increase degradation every tick
        degradationRef.current[id] = Math.min(0.97, degradationRef.current[id] + 0.0015)
        const r = generateReading(id, nextTick, degradationRef.current[id])
        newReadings[id] = r
        historyRef.current[id] = [...historyRef.current[id].slice(-(MAX_HISTORY - 1)), r]
      })

      setReadings({ ...newReadings })
      setHistory({ ...historyRef.current })

      // Event detection
      MACHINE_IDS.forEach(id => {
        const r = newReadings[id]
        if (r.state === 'critical' && nextTick % 8 === 0) {
          const now = new Date()
          const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
          setEventLog(prev => [{
            time, machine: id,
            event: r.temperature > 520 ? `Temperature exceeded threshold (${r.temperature}°C)` : r.vibration > 2.5 ? `Vibration spike detected (${r.vibration}g)` : `Health score critical (${r.healthScore}%)`,
            severity: 'critical' as MachineState,
          }, ...prev].slice(0, 12))
        } else if (r.state === 'warning' && nextTick % 12 === 0) {
          const now = new Date()
          const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
          setEventLog(prev => [{
            time, machine: id,
            event: `Degradation trend increasing (${(r.degradationTrend * 100).toFixed(1)}%)`,
            severity: 'warning' as MachineState,
          }, ...prev].slice(0, 12))
        }
      })

      return nextTick
    })
  }, [])

  function startStream() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(tick_fn, 800)
    setRunning(true)
  }

  function stopStream() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setRunning(false)
  }

  function resetStream() {
    stopStream()
    setTick(0)
    degradationRef.current = { 'SENSE-01': 0.05, 'SENSE-02': 0.28, 'SENSE-03': 0.62 }
    historyRef.current = { 'SENSE-01': [], 'SENSE-02': [], 'SENSE-03': [] }
    setReadings({})
    setHistory({ 'SENSE-01': [], 'SENSE-02': [], 'SENSE-03': [] })
    setEventLog([])
  }

  useEffect(() => { return () => { if (intervalRef.current) clearInterval(intervalRef.current) } }, [])

  const sel = readings[selectedMachine]
  const selHistory = history[selectedMachine] ?? []

  return (
    <div className="min-h-screen bg-[#09090b]">
      <AppNavbar />
      <div className="pt-16">

        {/* Header */}
        <div className="border-b border-[#1c1c1f]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#e8650a] border border-[#e8650a]/20 bg-[#e8650a]/8 px-2.5 py-1 rounded-sm">
                    <Radio size={10} className={running ? 'animate-pulse' : ''} />
                    {running ? 'Live Stream' : 'IoT Simulation'}
                  </span>
                  <span className="text-[10px] font-mono text-[#52525b]">Mainteligence Sense · 3 Devices</span>
                </div>
                <h1 className="text-3xl font-bold text-[#fafafa] tracking-tight mb-2">Live IoT Monitoring Demo</h1>
                <p className="text-sm text-[#71717a] leading-relaxed max-w-2xl">
                  A real-time simulation of the Mainteligence Sense IoT pipeline. Three virtual sensors stream continuous telemetry — temperature, vibration, pressure, RPM, current — while the AI engine computes health scores, detects anomalies, and escalates failure risk as degradation progresses.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={resetStream} className="flex items-center gap-2 text-xs text-[#71717a] hover:text-[#a1a1aa] border border-[#27272a] px-4 py-2.5 rounded-sm transition-colors">
                  <RefreshCw size={13} /> Reset
                </button>
                {running ? (
                  <button onClick={stopStream} className="flex items-center gap-2 text-sm font-semibold bg-[#18181b] hover:bg-[#1c1c1f] border border-[#27272a] text-[#a1a1aa] px-6 py-2.5 rounded-sm transition-colors">
                    <Square size={13} fill="currentColor" /> Stop Stream
                  </button>
                ) : (
                  <button onClick={startStream} className="flex items-center gap-2 text-sm font-semibold bg-[#e8650a] hover:bg-[#d15a08] text-white px-6 py-2.5 rounded-sm transition-all hover:shadow-[0_0_24px_rgba(232,101,10,0.30)]">
                    <Play size={14} fill="white" /> Start Live Stream
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-8">

          {/* Machine selector cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {MACHINE_IDS.map(id => {
              const r = readings[id]
              const st: MachineState = r?.state ?? 'normal'
              return (
                <button key={id} onClick={() => setSelectedMachine(id)}
                  className={`text-left p-4 rounded-sm border transition-all ${selectedMachine === id ? 'border-[#e8650a]/40 bg-[#e8650a]/6' : 'border-[#1c1c1f] bg-[#0d0d0f] hover:border-[#27272a]'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-sm bg-[#111113] border border-[#1c1c1f] flex items-center justify-center">
                        <Cpu size={13} className="text-[#52525b]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#e4e4e7]">{id}</p>
                        <p className="text-[9px] font-mono text-[#3a3a3d]">Mainteligence Sense</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: stateColor[st], boxShadow: running ? `0 0 5px ${stateColor[st]}` : 'none' }} />
                      <span className="text-[9px] font-mono uppercase" style={{ color: stateColor[st] }}>{st}</span>
                    </div>
                  </div>
                  <div className="flex justify-center mb-2">
                    <HealthGauge value={r?.healthScore ?? (id === 'SENSE-01' ? 94 : id === 'SENSE-02' ? 72 : 38)} />
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                    <div><span className="text-[#3a3a3d]">Temp: </span><span style={{ color: stateColor[st] }}>{r?.temperature ?? '—'}°C</span></div>
                    <div><span className="text-[#3a3a3d]">Vibe: </span><span style={{ color: stateColor[st] }}>{r?.vibration ?? '—'}g</span></div>
                    <div><span className="text-[#3a3a3d]">RUL: </span><span className="text-[#a1a1aa]">{r?.rul ?? '—'}d</span></div>
                    <div><span className="text-[#3a3a3d]">Anomaly: </span><span style={{ color: r?.anomalyFlag ? '#ef4444' : '#10b981' }}>{r?.anomalyFlag ? 'YES' : 'NO'}</span></div>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

            {/* LEFT: Selected machine detail */}
            <div className="flex flex-col gap-5">

              {/* Live KPIs */}
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-[#e4e4e7]">{selectedMachine} — Live Readings</p>
                  {running && <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#10b981]"><span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />STREAMING</span>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: <ThermometerSun size={13} />, label: 'Temperature',  value: sel ? `${sel.temperature}°C` : '—', color: sel?.temperature && sel.temperature > 500 ? '#ef4444' : '#f59e0b' },
                    { icon: <Activity size={13} />,       label: 'Vibration',    value: sel ? `${sel.vibration}g` : '—',    color: sel?.vibration && sel.vibration > 2.0 ? '#ef4444' : '#3b82f6' },
                    { icon: <Gauge size={13} />,          label: 'Pressure',     value: sel ? `${sel.pressure} bar` : '—',  color: '#10b981' },
                    { icon: <RefreshCw size={13} />,      label: 'RPM',          value: sel ? `${sel.rpm}` : '—',           color: '#8b5cf6' },
                    { icon: <Zap size={13} />,            label: 'Current',      value: sel ? `${sel.current}A` : '—',      color: '#f59e0b' },
                    { icon: <Radio size={13} />,          label: 'Degradation',  value: sel ? `${(sel.degradationTrend * 100).toFixed(1)}%` : '—', color: sel?.degradationTrend && sel.degradationTrend > 0.6 ? '#ef4444' : '#e8650a' },
                  ].map((item) => (
                    <div key={item.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-2.5">
                      <div className="flex items-center gap-1 mb-1 text-[#52525b]">{item.icon}<span className="text-[8px] font-mono uppercase tracking-widest">{item.label}</span></div>
                      <p className="text-sm font-bold font-mono" style={{ color: item.color }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Prediction box */}
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Brain size={13} className="text-[#e8650a]" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">AI Prediction</p>
                </div>
                {sel ? (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#3a3a3d]">Estimated RUL</span>
                      <span className="text-lg font-bold font-mono" style={{ color: sel.rul < 20 ? '#ef4444' : sel.rul < 50 ? '#f59e0b' : '#10b981' }}>{sel.rul}d</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#3a3a3d]">Failure Risk</span>
                      <span className="text-xs font-semibold font-mono" style={{ color: sel.state === 'critical' ? '#ef4444' : sel.state === 'warning' ? '#f59e0b' : '#10b981' }}>
                        {sel.state === 'critical' ? 'Imminent' : sel.state === 'warning' ? 'High' : 'Low'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#3a3a3d]">Anomaly Flag</span>
                      <span className="text-xs font-semibold font-mono" style={{ color: sel.anomalyFlag ? '#ef4444' : '#10b981' }}>{sel.anomalyFlag ? 'DETECTED' : 'CLEAR'}</span>
                    </div>
                    <div className="pt-2 border-t border-[#1c1c1f]">
                      <p className="text-[10px] font-mono text-[#3a3a3d] mb-1.5">Maintenance Recommendation</p>
                      <p className="text-[11px] text-[#71717a] leading-relaxed">
                        {sel.state === 'critical'
                          ? 'Critical condition. Immediate inspection required. Plan maintenance within 5 days to avoid unplanned failure.'
                          : sel.state === 'warning'
                          ? 'Monitor closely. Schedule preventive maintenance within 2–3 weeks. Verify vibration isolators and thermal management.'
                          : 'Asset operating normally. Continue current maintenance schedule. Next inspection recommended in 4 weeks.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-[11px] font-mono text-[#3a3a3d]">Start stream to activate AI predictions.</p>
                )}
              </div>

              {/* Event log */}
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-[#e4e4e7]">Event Log</p>
                  {running && <span className="text-[9px] font-mono text-[#52525b] bg-[#18181b] px-2 py-0.5 border border-[#27272a] rounded-sm">LIVE</span>}
                </div>
                {eventLog.length === 0 ? (
                  <p className="text-[10px] font-mono text-[#3a3a3d]">No events yet. Start stream to begin monitoring.</p>
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

            {/* CENTRE + RIGHT: Live charts */}
            <div className="xl:col-span-2 flex flex-col gap-5">

              {/* Health score trend */}
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#e4e4e7]">Health Score Evolution — {selectedMachine}</p>
                  <span className="text-[10px] font-mono text-[#52525b]">Last {MAX_HISTORY} readings · updates every 0.8s</span>
                </div>
                <LiveSparkline
                  data={selHistory.map(r => r.healthScore)}
                  color={sel ? stateColor[sel.state] : '#10b981'}
                  height={70}
                  threshold={35}
                />
                <div className="flex justify-between text-[9px] font-mono text-[#3a3a3d] mt-1.5">
                  <span>-{MAX_HISTORY * 0.8}s</span>
                  <span className="text-[#ef4444]">— critical threshold (35)</span>
                  <span>now</span>
                </div>
              </div>

              {/* Multi-sensor grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Temperature (°C)',       key: 'temperature' as keyof SensorReading, color: '#f59e0b', threshold: 500 },
                  { label: 'Vibration (g)',           key: 'vibration'   as keyof SensorReading, color: '#3b82f6', threshold: 2.0 },
                  { label: 'Pressure (bar)',          key: 'pressure'    as keyof SensorReading, color: '#10b981', threshold: undefined },
                  { label: 'Current Draw (A)',        key: 'current'     as keyof SensorReading, color: '#8b5cf6', threshold: undefined },
                ].map(channel => (
                  <div key={channel.key} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-mono text-[#52525b]">{channel.label}</p>
                      <span className="text-xs font-bold font-mono" style={{ color: channel.color }}>
                        {sel ? String(sel[channel.key]) : '—'}
                      </span>
                    </div>
                    <LiveSparkline
                      data={selHistory.map(r => r[channel.key] as number)}
                      color={channel.color}
                      height={44}
                      threshold={channel.threshold}
                    />
                  </div>
                ))}
              </div>

              {/* All-machine fleet view */}
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold text-[#e4e4e7]">Fleet Health Overview</p>
                  <span className="text-[9px] font-mono text-[#52525b]">All 3 Sense devices</span>
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
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${health}%`, background: stateColor[st] }} />
                        </div>
                        <span className="text-[10px] font-mono w-8 text-right shrink-0" style={{ color: stateColor[st] }}>{health}%</span>
                        <span className="text-[9px] font-mono uppercase w-14 shrink-0" style={{ color: stateColor[st] }}>{st}</span>
                        <span className="text-[10px] font-mono text-[#52525b] w-12 shrink-0">RUL: {r?.rul ?? '—'}d</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Degradation trend chart */}
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-[#e4e4e7]">Degradation Trend — {selectedMachine}</p>
                  <span className="text-[10px] font-mono text-[#52525b]">Cumulative degradation index</span>
                </div>
                <LiveSparkline
                  data={selHistory.map(r => r.degradationTrend * 100)}
                  color="#e8650a"
                  height={56}
                />
                <p className="text-[9px] font-mono text-[#3a3a3d] mt-1.5">Higher values indicate accelerating wear — triggers maintenance recommendations at 60%</p>
              </div>

              {/* What is Mainteligence Sense */}
              <div className="border border-[#27272a] bg-[#0d0d0f] rounded-sm p-5 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8650a]/15 to-transparent" />
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 shrink-0 rounded-sm bg-[#e8650a]/10 border border-[#e8650a]/20 flex items-center justify-center">
                    <Radio size={18} className="text-[#e8650a]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#fafafa] mb-1">This is Mainteligence Sense in Action</p>
                    <p className="text-xs text-[#71717a] leading-relaxed mb-3">
                      In a real deployment, this stream comes from physical Mainteligence Sense devices mounted on your industrial equipment — no existing IoT infrastructure required. Each device captures vibration, temperature, pressure, RPM, and current at up to 25,600 Hz and transmits processed data to the platform over Wi-Fi, Ethernet, or RS-485.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link href="/product" className="flex items-center gap-1.5 text-[10px] font-mono text-[#e8650a] border border-[#e8650a]/20 bg-[#e8650a]/8 px-3 py-1.5 rounded-sm hover:bg-[#e8650a]/15 transition-colors">
                        View Hardware Specs <ArrowRight size={10} />
                      </Link>
                      <Link href="/demo" className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b] border border-[#27272a] px-3 py-1.5 rounded-sm hover:text-[#a1a1aa] hover:border-[#52525b] transition-colors">
                        LSTM / ML Demo <ArrowRight size={10} />
                      </Link>
                      <Link href="/contact" className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b] border border-[#27272a] px-3 py-1.5 rounded-sm hover:text-[#a1a1aa] hover:border-[#52525b] transition-colors">
                        Request a Pilot <ArrowRight size={10} />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
