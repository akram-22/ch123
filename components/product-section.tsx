'use client'

/**
 * COMPONENT: ProductSection — Homepage product feature highlight
 * USED IN: app/page.tsx (Homepage)
 * Hardware (Sense device) and software (AI platform) feature tabs
 */

import { useState } from 'react'
import {
  BarChart2, Bell, Activity, Clock,
  Wifi, Zap, Shield, Layers
} from 'lucide-react'

const softwareFeatures = [
  {
    icon: BarChart2,
    title: 'RUL Prediction',
    description: 'Per-asset Remaining Useful Life forecasts with configurable confidence intervals and lead-time alerts.',
  },
  {
    icon: Activity,
    title: 'Sensor Monitoring',
    description: 'Real-time streaming of vibration, temperature, pressure, and current data at up to 10kHz sampling.',
  },
  {
    icon: Clock,
    title: 'Health Status',
    description: 'Composite health scores per asset, aggregated from multiple sensor streams and degradation models.',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Multi-channel notifications (email, SMS, webhook) with severity tiers and suppression logic.',
  },
]

const hardwareFeatures = [
  {
    icon: Wifi,
    title: 'Mainteligence Sense',
    description: 'Industrial-grade IoT gateway with IP67 protection, operating range -40°C to +85°C. Captures 8 sensor channels simultaneously.',
  },
  {
    icon: Zap,
    title: 'Easy Installation',
    description: 'Clamp-on mounting with magnetic backing. Installed in under 60 minutes. No welding, no electrical overhaul.',
  },
  {
    icon: Shield,
    title: 'Works on Legacy Machines',
    description: 'Compatible with equipment manufactured from the 1980s onward. No PLC integration required.',
  },
  {
    icon: Layers,
    title: 'Edge + Cloud Modes',
    description: 'Process data locally on the device, on-premise server, or in your private cloud. MQTT and REST API support.',
  },
]

export default function ProductSection() {
  const [activeTab, setActiveTab] = useState<'software' | 'hardware'>('software')

  return (
    <section id="product" className="relative bg-[#0d0d0f] py-28 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="max-w-3xl mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-[#e8650a] mb-4">
            The Product
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#fafafa] leading-tight text-balance mb-5">
            Software + Hardware,{' '}
            <span className="text-[#e8650a]">Unified</span>
          </h2>
          <p className="text-[#71717a] text-lg leading-relaxed text-pretty">
            Mainteligence is the only predictive maintenance solution that ships both a purpose-built
            industrial AI platform and the IoT hardware to power it — out of the box.
          </p>
        </div>

        {/* Tab toggle */}
        <div className="flex items-center gap-1 bg-[#111113] border border-[#1c1c1f] rounded-sm p-1 w-fit mb-10">
          {(['software', 'hardware'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-sm text-sm font-medium transition-all duration-200 capitalize ${
                activeTab === tab
                  ? 'bg-[#e8650a] text-white shadow-sm'
                  : 'text-[#71717a] hover:text-[#a1a1aa]'
              }`}
            >
              {tab === 'software' ? 'Platform Software' : 'Sense Hardware'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Feature list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(activeTab === 'software' ? softwareFeatures : hardwareFeatures).map(
              ({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-[#09090b] border border-[#1c1c1f] hover:border-[#27272a] rounded-sm p-5 group transition-all"
                >
                  <div className="w-9 h-9 rounded-sm bg-[#111113] border border-[#27272a] flex items-center justify-center mb-4 group-hover:border-[#e8650a]/30 transition-colors">
                    <Icon size={16} className="text-[#e8650a]" />
                  </div>
                  <h3 className="text-sm font-semibold text-[#e4e4e7] mb-2">{title}</h3>
                  <p className="text-xs text-[#71717a] leading-relaxed">{description}</p>
                </div>
              )
            )}
          </div>

          {/* Visual panel */}
          <div className="border border-[#1c1c1f] rounded-sm overflow-hidden bg-[#09090b] relative">
            {activeTab === 'software' ? <SoftwareVisual /> : <HardwareVisual />}
          </div>
        </div>
      </div>
    </section>
  )
}

function SoftwareVisual() {
  return (
    <div className="p-6">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-mono text-[#52525b] uppercase tracking-widest mb-1">Fleet Health Overview</p>
          <p className="text-lg font-bold text-[#fafafa]">48 Assets Monitored</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#10b981]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          Live
        </div>
      </div>

      {/* Health distribution bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#52525b] font-mono">Health Distribution</span>
          <span className="text-xs text-[#52525b] font-mono">48 assets</span>
        </div>
        <div className="flex h-3 rounded-sm overflow-hidden gap-0.5">
          <div className="bg-[#10b981] transition-all" style={{ width: '62%' }} />
          <div className="bg-[#f59e0b] transition-all" style={{ width: '25%' }} />
          <div className="bg-[#ef4444] transition-all" style={{ width: '13%' }} />
        </div>
        <div className="flex gap-4 mt-2">
          <span className="text-[10px] font-mono text-[#10b981]">Good (30)</span>
          <span className="text-[10px] font-mono text-[#f59e0b]">Warning (12)</span>
          <span className="text-[10px] font-mono text-[#ef4444]">Critical (6)</span>
        </div>
      </div>

      {/* RUL chart */}
      <div className="border border-[#1c1c1f] rounded-sm p-4 mb-4">
        <p className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest mb-3">RUL Forecast — Next 30 Days</p>
        <div className="flex items-end gap-2 h-16">
          {[88, 82, 75, 69, 63, 57, 51, 46, 41, 36, 30, 24].map((v, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm transition-all"
              style={{
                height: `${(v / 100) * 100}%`,
                background: v > 60
                  ? 'rgba(16,185,129,0.4)'
                  : v > 30
                  ? 'rgba(245,158,11,0.4)'
                  : 'rgba(239,68,68,0.4)',
                border: `1px solid ${v > 60 ? '#10b981' : v > 30 ? '#f59e0b' : '#ef4444'}40`,
              }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-[#52525b] font-mono">Today</span>
          <span className="text-[9px] text-[#52525b] font-mono">+30d</span>
        </div>
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {[
          { asset: 'Motor D-19', msg: 'Critical: RUL below 15 days', color: '#ef4444' },
          { asset: 'Compressor B-7', msg: 'Warning: High vibration detected', color: '#f59e0b' },
          { asset: 'Bearing E-4', msg: 'Warning: Thermal anomaly (+12°C)', color: '#f59e0b' },
        ].map((a) => (
          <div key={a.asset} className="flex items-center gap-3 border border-[#1c1c1f] rounded-sm px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: a.color }} />
            <span className="text-xs font-mono font-medium text-[#a1a1aa] mr-2 flex-shrink-0">{a.asset}</span>
            <span className="text-xs text-[#52525b] truncate">{a.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function HardwareVisual() {
  const specs = [
    { label: 'Protection Rating', value: 'IP67' },
    { label: 'Operating Temp', value: '-40°C to +85°C' },
    { label: 'Sensor Channels', value: '8 simultaneous' },
    { label: 'Sampling Rate', value: 'Up to 10kHz' },
    { label: 'Connectivity', value: 'Wi-Fi / 4G LTE / LoRa' },
    { label: 'Power', value: 'PoE or Battery (24h+)' },
    { label: 'Install Time', value: '< 60 minutes' },
    { label: 'Certifications', value: 'ATEX / CE / FCC' },
  ]

  return (
    <div className="p-6">
      {/* Device illustration */}
      <div className="relative bg-[#111113] border border-[#1c1c1f] rounded-sm p-8 mb-6 flex flex-col items-center">
        <div className="w-32 h-24 rounded-md bg-[#1c1c1f] border-2 border-[#27272a] flex flex-col items-center justify-center relative mb-4">
          {/* LED indicators */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
          </div>
          {/* Logo on device */}
          <div className="w-6 h-6 rounded-sm bg-[#e8650a]/20 border border-[#e8650a]/30 flex items-center justify-center mb-2">
            <span className="text-[8px] font-mono font-bold text-[#e8650a]">M</span>
          </div>
          <span className="text-[9px] font-mono text-[#52525b] tracking-widest">SENSE</span>
          {/* Port indicators */}
          <div className="absolute bottom-3 flex gap-2">
            <span className="w-3 h-1.5 rounded-sm bg-[#27272a]" />
            <span className="w-3 h-1.5 rounded-sm bg-[#27272a]" />
            <span className="w-3 h-1.5 rounded-sm bg-[#27272a]" />
          </div>
        </div>
        <p className="text-sm font-semibold text-[#e4e4e7]">Mainteligence Sense</p>
        <p className="text-xs text-[#52525b] font-mono mt-1">Industrial IoT Gateway — Gen 2</p>
      </div>

      {/* Spec table */}
      <div className="grid grid-cols-2 gap-px bg-[#1c1c1f] rounded-sm overflow-hidden border border-[#1c1c1f]">
        {specs.map(({ label, value }) => (
          <div key={label} className="bg-[#09090b] px-4 py-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-1">{label}</p>
            <p className="text-xs font-medium text-[#a1a1aa]">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
