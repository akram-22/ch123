/**
 * PAGE: Product Overview
 * ROUTE: /product
 * PURPOSE: Public product detail page — Mainteligence Sense hardware + software features,
 *          technical specs, architecture diagram, deployment guide
 */
import Link from 'next/link'
import AppNavbar from '@/components/app-navbar'
import {
  Cpu, Wifi, Shield, Server, Database, Activity, Bell,
  Gauge, BarChart3, Layers, ArrowRight, CheckCircle2,
  Zap, Lock, HardDrive, Package, Wrench, Radio
} from 'lucide-react'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 border border-[#27272a] bg-[#111113] rounded-sm px-3.5 py-1.5 mb-5">
      <span className="w-1.5 h-1.5 rounded-full bg-[#e8650a]" />
      <span className="text-[10px] text-[#a1a1aa] font-mono tracking-widest uppercase">{children}</span>
    </div>
  )
}

const softwareFeatures = [
  { icon: <Gauge size={16} />, title: 'RUL Prediction Engine', desc: 'LSTM-based model computes Remaining Useful Life per asset in real time. Outputs a numerical RUL value and confidence interval derived from live sensor sequences.' },
  { icon: <Activity size={16} />, title: 'Live Sensor Monitoring', desc: 'Continuous telemetry ingestion from Mainteligence Sense nodes — temperature, vibration, pressure, speed — streamed at configurable intervals (1s–5min).' },
  { icon: <BarChart3 size={16} />, title: 'Degradation Analytics', desc: 'Interactive degradation curves, trend analysis, and cycle-by-cycle breakdowns. Compare across assets, time windows, or maintenance periods.' },
  { icon: <Bell size={16} />, title: 'Intelligent Alert Engine', desc: 'Rule-based and ML-driven alerts. Configurable thresholds per asset type. Escalation routing via email, SMS, or webhook. Silence windows for planned maintenance.' },
  { icon: <Layers size={16} />, title: 'Fleet Health Heatmap', desc: 'Visual overview of all monitored assets with health index scoring. Instantly identify outliers requiring attention across multi-plant deployments.' },
  { icon: <Database size={16} />, title: 'Historical Data Vault', desc: 'Full time-series archive of all sensor readings and RUL predictions. Export in CSV, Parquet, or via REST API. Retention configurable per compliance requirements.' },
  { icon: <Server size={16} />, title: 'On-Premise Deployment', desc: 'Deploy the entire platform stack on your own infrastructure. No data leaves your network. Compatible with bare metal, VMware, or Kubernetes environments.' },
  { icon: <Lock size={16} />, title: 'Role-Based Access Control', desc: 'Granular permission model: Viewer, Engineer, Manager, Admin. SSO integration via SAML 2.0 / OIDC. Full audit log of all user actions.' },
]

const hardwareSpecs = [
  { label: 'MCU', value: 'ARM Cortex-M7 @ 480 MHz' },
  { label: 'Connectivity', value: 'Wi-Fi 802.11b/g/n · Ethernet · RS-485' },
  { label: 'Sensors integrated', value: 'Accelerometer (3-axis), Thermistor, Pressure, RPM' },
  { label: 'Sampling rate', value: 'Up to 25,600 Hz (vibration)' },
  { label: 'Edge compute', value: 'On-device FFT, anomaly pre-filter' },
  { label: 'Power supply', value: '24V DC industrial (PoE option)' },
  { label: 'Enclosure rating', value: 'IP67 · ATEX Zone 2 compliant' },
  { label: 'Operating temp.', value: '-40°C to +85°C' },
  { label: 'Mounting', value: 'Magnetic, screw, DIN rail adapter' },
  { label: 'Install time', value: '< 15 minutes per machine' },
]

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <AppNavbar />
      <div className="pt-24 pb-20">
        {/* Hero */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-20">
          <div className="text-center max-w-3xl mx-auto">
            <SectionLabel>Mainteligence Product</SectionLabel>
            <h1 className="text-4xl md:text-5xl font-bold text-[#fafafa] tracking-tight mb-5 text-balance">
              One Platform. Two Products.<br />
              <span className="text-[#e8650a]">Infinite Insight.</span>
            </h1>
            <p className="text-base text-[#71717a] leading-relaxed mb-8 text-pretty">
              The Mainteligence Platform combines an AI software layer with purpose-built industrial IoT hardware.
              Together, they close the loop from raw machine data to maintenance decision — on-premise, at industrial scale.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/demo" className="flex items-center gap-2 bg-[#e8650a] hover:bg-[#d15a08] text-white font-semibold text-sm px-6 py-3 rounded-sm transition-all hover:shadow-[0_0_24px_rgba(232,101,10,0.30)]">
                Try the Demo <ArrowRight size={14} />
              </Link>
              <Link href="/contact" className="text-sm border border-[#27272a] hover:border-[#52525b] text-[#a1a1aa] hover:text-[#fafafa] px-6 py-3 rounded-sm transition-colors">
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>

        {/* Software Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-20">
          <div className="flex items-start justify-between flex-col lg:flex-row gap-10 mb-10">
            <div className="max-w-xl">
              <SectionLabel>Software</SectionLabel>
              <h2 className="text-3xl font-bold text-[#fafafa] tracking-tight mb-4">
                Mainteligence Platform
              </h2>
              <p className="text-sm text-[#71717a] leading-relaxed mb-5">
                A production-grade predictive maintenance software platform. Ingest sensor data from any source, run LSTM-based RUL inference, surface insights on a real-time dashboard. Built for multi-plant industrial deployments with on-premise-first architecture.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                {['On-premise', 'REST API', 'Multi-plant', 'SCADA-ready'].map((b) => (
                  <span key={b} className="px-2.5 py-1 bg-[#111113] border border-[#27272a] rounded-sm text-[#71717a]">{b}</span>
                ))}
              </div>
            </div>
            <Link href="/dashboard" className="shrink-0 flex items-center gap-2 border border-[#e8650a]/30 bg-[#e8650a]/8 hover:bg-[#e8650a]/12 text-[#e8650a] text-sm font-medium px-5 py-3 rounded-sm transition-colors">
              <Activity size={15} /> View Live Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {softwareFeatures.map((f) => (
              <div key={f.title} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5 hover:border-[#27272a] transition-colors group">
                <div className="w-8 h-8 rounded-sm bg-[#e8650a]/10 border border-[#e8650a]/15 flex items-center justify-center text-[#e8650a] mb-4 group-hover:bg-[#e8650a]/15 transition-colors">
                  {f.icon}
                </div>
                <p className="text-xs font-semibold text-[#e4e4e7] mb-2">{f.title}</p>
                <p className="text-[11px] text-[#52525b] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-20">
          <div className="h-px bg-gradient-to-r from-transparent via-[#27272a] to-transparent" />
        </div>

        {/* Hardware Section */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-20">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-12 items-start">
            <div>
              <SectionLabel>Hardware</SectionLabel>
              <h2 className="text-3xl font-bold text-[#fafafa] tracking-tight mb-4">
                Mainteligence Sense
              </h2>
              <p className="text-sm text-[#71717a] leading-relaxed mb-6">
                An industrial-grade IoT gateway engineered to retrofit on existing machinery with zero downtime. No PLC integration required. Mount it, connect it, and your machine is online within 15 minutes. Works where Wi-Fi is unavailable via RS-485 or Ethernet backbone.
              </p>

              {/* Key capabilities */}
              <div className="space-y-3 mb-8">
                {[
                  { icon: <Wrench size={14} />, title: 'Zero-Downtime Retrofit', desc: 'Mounts externally on any machine — no rewiring, no production stop, no PLC access required.' },
                  { icon: <Radio size={14} />, title: 'Multi-Protocol Connectivity', desc: 'Wi-Fi, Ethernet, RS-485. Configurable uplink intervals. Operates in Faraday-shielded environments.' },
                  { icon: <Zap size={14} />, title: 'Edge Pre-Processing', desc: 'On-device FFT and anomaly pre-filter reduce bandwidth by 80% before sending data to the platform.' },
                  { icon: <Shield size={14} />, title: 'Industrial Certifications', desc: 'IP67 dust/water resistance, ATEX Zone 2, CE marked. Rated for -40°C to +85°C operating range.' },
                  { icon: <HardDrive size={14} />, title: 'Local Buffer Storage', desc: '8 GB onboard flash stores 30+ days of data. Continues recording during network outages.' },
                  { icon: <Package size={14} />, title: 'Plug-and-Play Provisioning', desc: 'QR-code device registration. Auto-discovery on the platform. No field IT expertise required.' },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3 p-3 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm">
                    <div className="w-7 h-7 shrink-0 rounded-sm bg-[#111113] border border-[#27272a] flex items-center justify-center text-[#52525b] mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#e4e4e7] mb-0.5">{item.title}</p>
                      <p className="text-[11px] text-[#52525b] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Spec table + device visual */}
            <div className="flex flex-col gap-4">

              {/* Real device photo */}
              <div className="relative rounded-sm overflow-hidden border border-[#1c1c1f] group">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/DCLCcDznSBPoFG83sOysp-QHna3GaKSKuDbu9ym1NU5IktDi6o4V.jpg"
                  alt="Mainteligence Sense IoT device mounted on industrial machinery with PWR, WIFI, and DATA indicator LEDs"
                  className="w-full h-64 object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay gradient for text legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b]/90 via-[#09090b]/20 to-transparent" />
                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 px-5 py-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-[#e8650a] mb-1">Hardware</p>
                      <p className="text-base font-bold text-[#fafafa] tracking-tight">Mainteligence Sense</p>
                      <p className="text-xs text-[#a1a1aa] mt-0.5">Industrial IoT gateway for real-time machine monitoring</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {[
                        { dot: '#10b981', label: 'PWR' },
                        { dot: '#3b82f6', label: 'WIFI' },
                        { dot: '#e8650a', label: 'DATA' },
                      ].map((led) => (
                        <div key={led.label} className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: led.dot, boxShadow: `0 0 5px ${led.dot}` }}
                          />
                          <span className="text-[9px] font-mono text-[#52525b]">{led.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Corner badge */}
                <div className="absolute top-3 right-3 bg-[#09090b]/80 backdrop-blur-sm border border-[#27272a] rounded-sm px-2.5 py-1">
                  <span className="text-[9px] font-mono text-[#52525b]">MS-100 · IP67 · ATEX Z2</span>
                </div>
              </div>

              {/* Device mockup */}
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-[#18181b] border border-[#27272a] rounded-sm flex items-center justify-center">
                    <Cpu size={18} className="text-[#e8650a]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#fafafa]">Mainteligence Sense</p>
                    <p className="text-[10px] font-mono text-[#52525b]">Model MS-100 · Rev 2.1</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-[#10b981]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />Online
                  </div>
                </div>

                {/* LED indicators */}
                <div className="flex gap-3 mb-6 p-3 bg-[#111113] rounded-sm border border-[#1c1c1f]">
                  {[
                    { label: 'PWR', color: '#10b981' }, { label: 'NET', color: '#3b82f6' },
                    { label: 'SNS', color: '#10b981' }, { label: 'ALT', color: '#3a3a3d' },
                  ].map((led) => (
                    <div key={led.label} className="flex flex-col items-center gap-1">
                      <div className="w-3 h-3 rounded-full" style={{ background: led.color, boxShadow: led.color !== '#3a3a3d' ? `0 0 6px ${led.color}` : 'none' }} />
                      <span className="text-[8px] font-mono text-[#3a3a3d]">{led.label}</span>
                    </div>
                  ))}
                  <div className="ml-auto text-[10px] font-mono text-[#52525b] self-center">SENSE-ID: 0x4A2F</div>
                </div>

                {/* Live readings */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    { label: 'Vibration', value: '0.42g', color: '#3b82f6' },
                    { label: 'Temperature', value: '312°C', color: '#f59e0b' },
                    { label: 'Pressure', value: '14.2 bar', color: '#10b981' },
                    { label: 'RPM', value: '2388', color: '#e8650a' },
                  ].map((r) => (
                    <div key={r.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-2.5">
                      <p className="text-[9px] font-mono text-[#3a3a3d] uppercase mb-1">{r.label}</p>
                      <p className="text-base font-bold font-mono" style={{ color: r.color }}>{r.value}</p>
                    </div>
                  ))}
                </div>
                <div className="text-[10px] font-mono text-[#3a3a3d] text-center">Last sync: 00:00:02 ago · 5-sec interval</div>
              </div>

              {/* Spec sheet */}
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-4">Technical Specifications</p>
                <div className="space-y-2">
                  {hardwareSpecs.map((s) => (
                    <div key={s.label} className="flex items-start justify-between gap-4 py-1.5 border-b border-[#111113]">
                      <span className="text-[10px] font-mono text-[#3a3a3d] shrink-0">{s.label}</span>
                      <span className="text-[11px] font-mono text-[#71717a] text-right">{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* On-premise callout */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 mb-16">
          <div className="border border-[#27272a] bg-[#0d0d0f] rounded-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8650a]/20 to-transparent" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lock size={14} className="text-[#e8650a]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#e8650a]">Data Security</span>
                </div>
                <h3 className="text-xl font-bold text-[#fafafa] mb-3">On-Premise First Architecture</h3>
                <p className="text-sm text-[#71717a] leading-relaxed">
                  Your operational data never leaves your network. The full Mainteligence platform — AI inference engine, database, dashboard — runs on your own servers. No cloud dependency. No data egress. Compliance-ready by design.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Data residency', value: 'Your infrastructure' },
                  { label: 'Cloud dependency', value: 'None required' },
                  { label: 'Network mode', value: 'Air-gap compatible' },
                  { label: 'Deployment', value: 'Docker / K8s / Bare metal' },
                ].map((item) => (
                  <div key={item.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-3">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1">{item.label}</p>
                    <p className="text-xs font-semibold text-[#a1a1aa]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/demo" className="flex items-center gap-2 bg-[#e8650a] hover:bg-[#d15a08] text-white font-semibold text-sm px-7 py-3.5 rounded-sm transition-all hover:shadow-[0_0_24px_rgba(232,101,10,0.30)]">
            Try the Live Demo <ArrowRight size={14} />
          </Link>
          <Link href="/pricing" className="text-sm border border-[#27272a] hover:border-[#52525b] text-[#a1a1aa] hover:text-[#fafafa] px-7 py-3.5 rounded-sm transition-colors">
            View Pricing
          </Link>
        </div>
      </div>
    </div>
  )
}
