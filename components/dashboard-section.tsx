/**
 * COMPONENT: DashboardSection — Homepage live dashboard preview
 * USED IN: app/page.tsx (Homepage)
 * Animated mockup of the monitoring dashboard — shows RUL chart, alerts, health scores
 */
'use client'

import { useState } from 'react'

const assets = [
  { id: 'TRB-A12', name: 'Turbine A-12', type: 'Turbine', rul: 87, health: 92, temp: 312, vibration: 0.42, status: 'good' },
  { id: 'CMP-B07', name: 'Compressor B-7', type: 'Compressor', rul: 34, health: 61, temp: 428, vibration: 1.87, status: 'warning' },
  { id: 'PMP-C03', name: 'Pump C-3', type: 'Pump', rul: 62, health: 78, temp: 195, vibration: 0.61, status: 'good' },
  { id: 'MTR-D19', name: 'Motor D-19', type: 'Motor', rul: 11, health: 23, temp: 521, vibration: 3.24, status: 'critical' },
  { id: 'BRG-E04', name: 'Bearing E-4', type: 'Bearing', rul: 44, health: 55, temp: 267, vibration: 1.12, status: 'warning' },
]

const statusMap: Record<string, { color: string; bg: string; label: string }> = {
  good: { color: '#10b981', bg: 'rgba(16,185,129,0.10)', label: 'GOOD' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.10)', label: 'WARNING' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'CRITICAL' },
}

// Deterministic RUL forecast values for each asset
const rulForecasts: Record<string, number[]> = {
  'TRB-A12': [87, 84, 80, 76, 72, 68, 64, 60, 56, 52],
  'CMP-B07': [34, 31, 27, 23, 19, 16, 13, 10, 8, 5],
  'PMP-C03': [62, 60, 57, 54, 51, 48, 45, 42, 39, 36],
  'MTR-D19': [11, 9, 7, 5, 4, 3, 2, 1, 0, 0],
  'BRG-E04': [44, 41, 38, 35, 32, 29, 26, 23, 20, 17],
}

const sensorHistory: Record<string, { temp: number[]; vib: number[] }> = {
  'TRB-A12': { temp: [295, 300, 305, 308, 310, 312, 311], vib: [0.38, 0.40, 0.41, 0.42, 0.42, 0.42, 0.42] },
  'CMP-B07': { temp: [380, 395, 405, 415, 422, 428, 428], vib: [0.90, 1.10, 1.35, 1.55, 1.70, 1.87, 1.87] },
  'PMP-C03': { temp: [190, 192, 193, 194, 195, 195, 195], vib: [0.55, 0.57, 0.59, 0.60, 0.61, 0.61, 0.61] },
  'MTR-D19': { temp: [460, 475, 490, 502, 510, 518, 521], vib: [1.80, 2.10, 2.50, 2.80, 3.00, 3.15, 3.24] },
  'BRG-E04': { temp: [250, 254, 258, 261, 264, 266, 267], vib: [0.80, 0.88, 0.95, 1.02, 1.07, 1.10, 1.12] },
}

export default function DashboardSection() {
  const [selectedAsset, setSelectedAsset] = useState(assets[0])

  const forecast = rulForecasts[selectedAsset.id]
  const sensor = sensorHistory[selectedAsset.id]
  const st = statusMap[selectedAsset.status]

  return (
    <section id="dashboard" className="relative bg-[#09090b] py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-[#e8650a] mb-4">
            Platform Preview
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#fafafa] leading-tight text-balance mb-5">
            Built for Engineers,{' '}
            <span className="text-[#e8650a]">Not Data Scientists</span>
          </h2>
          <p className="text-[#71717a] text-lg leading-relaxed">
            Every metric, every alert, and every forecast — in one industrial-grade interface.
          </p>
        </div>

        {/* Dashboard shell */}
        <div className="border border-[#27272a] rounded-sm overflow-hidden bg-[#0a0a0c] orange-glow">
          {/* Topbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#1c1c1f] bg-[#0d0d0f]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#3a3a3d]" />
                <span className="w-3 h-3 rounded-full bg-[#3a3a3d]" />
                <span className="w-3 h-3 rounded-full bg-[#3a3a3d]" />
              </div>
              <span className="text-xs font-mono text-[#52525b] ml-2">Mainteligence — Fleet Dashboard</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
              <span className="text-xs font-mono text-[#52525b]">3 ALERTS ACTIVE</span>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row">
            {/* Sidebar: asset list */}
            <div className="lg:w-52 border-r border-[#1c1c1f] flex-shrink-0">
              <div className="px-3 py-3 border-b border-[#1c1c1f]">
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#52525b]">Assets (5)</p>
              </div>
              {assets.map((a) => {
                const s = statusMap[a.status]
                return (
                  <button
                    key={a.id}
                    onClick={() => setSelectedAsset(a)}
                    className={`w-full text-left px-3 py-3 border-b border-[#1a1a1d] transition-colors ${
                      selectedAsset.id === a.id
                        ? 'bg-[#e8650a]/10 border-l-2 border-l-[#e8650a]'
                        : 'hover:bg-[#111113]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.color }} />
                      <span className="text-xs font-mono text-[#a1a1aa] truncate">{a.id}</span>
                    </div>
                    <p className="text-xs text-[#e4e4e7] truncate pl-3.5">{a.name}</p>
                  </button>
                )
              })}
            </div>

            {/* Main content */}
            <div className="flex-1 p-5">
              {/* Asset header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-[#fafafa]">{selectedAsset.name}</h3>
                  <p className="text-xs text-[#52525b] font-mono">{selectedAsset.type} · {selectedAsset.id}</p>
                </div>
                <span
                  className="text-[10px] font-mono tracking-widest px-3 py-1 rounded-sm"
                  style={{ color: st.color, background: st.bg, border: `1px solid ${st.color}30` }}
                >
                  {st.label}
                </span>
              </div>

              {/* KPI row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                <SmallKPI label="RUL (days)" value={String(selectedAsset.rul)} accent={selectedAsset.rul < 20 ? '#ef4444' : selectedAsset.rul < 45 ? '#f59e0b' : '#10b981'} />
                <SmallKPI label="Health Score" value={`${selectedAsset.health}%`} accent={selectedAsset.health < 40 ? '#ef4444' : selectedAsset.health < 70 ? '#f59e0b' : '#10b981'} />
                <SmallKPI label="Temperature" value={`${selectedAsset.temp}°C`} accent="#a1a1aa" />
                <SmallKPI label="Vibration" value={`${selectedAsset.vibration}g`} accent="#a1a1aa" />
              </div>

              {/* Charts row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* RUL Forecast chart */}
                <div className="border border-[#1c1c1f] rounded-sm p-4 bg-[#0d0d0f]">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-3">RUL Forecast (10-day)</p>
                  <div className="flex items-end gap-1.5 h-20">
                    {forecast.map((v, i) => {
                      const pct = (v / 100) * 100
                      const color = v > 50 ? '#10b981' : v > 20 ? '#f59e0b' : '#ef4444'
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-sm transition-all"
                            style={{ height: `${Math.max(pct, 4)}%`, background: `${color}50`, border: `1px solid ${color}40` }}
                          />
                          <span className="text-[8px] font-mono text-[#3a3a3d]">+{i}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Sensor trend chart */}
                <div className="border border-[#1c1c1f] rounded-sm p-4 bg-[#0d0d0f]">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-3">Sensor Trend (7-day)</p>
                  <div className="relative h-20">
                    <SensorLine data={sensor.temp} color="#e8650a" label="Temp" />
                    <SensorLine data={sensor.vib.map(v => v * 100)} color="#3b82f6" label="Vib ×100" />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <LegendDot color="#e8650a" label="Temperature" />
                    <LegendDot color="#3b82f6" label="Vibration ×100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function SmallKPI({ label, value, accent }: { label: string, value: string, accent: string }) {
  return (
    <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-3">
      <p className="text-[9px] font-mono uppercase tracking-widest text-[#52525b] mb-1.5">{label}</p>
      <p className="text-lg font-bold font-mono" style={{ color: accent }}>{value}</p>
    </div>
  )
}

function SensorLine({ data, color }: { data: number[], color: string, label: string }) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const h = 70
  const w = 100
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 6) - 3
    return `${x},${y}`
  }).join(' ')

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className="absolute inset-0 w-full h-full"
    >
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.8}
      />
    </svg>
  )
}

function LegendDot({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-2 h-0.5 rounded-full" style={{ background: color }} />
      <span className="text-[9px] font-mono text-[#52525b]">{label}</span>
    </div>
  )
}
