/**
 * PAGE: Pricing Plans
 * ROUTE: /pricing
 * PURPOSE: Public pricing page — Starter, Professional, Enterprise plan comparison with CTA
 */
import Link from 'next/link'
import AppNavbar from '@/components/app-navbar'
import { CheckCircle2, ArrowRight, Minus, Shield, Server, Cpu } from 'lucide-react'

const plans = [
  {
    id: 'demo',
    label: 'Free Demo',
    price: '€0',
    period: '',
    tagline: 'Evaluate the platform with no commitment.',
    badge: null,
    cta: 'Start Free Demo',
    ctaHref: '/demo',
    primary: false,
    features: [
      { text: 'NASA FD001 dataset demo', included: true },
      { text: 'Interactive RUL prediction', included: true },
      { text: 'Model pipeline visualization', included: true },
      { text: 'Dashboard preview (read-only)', included: true },
      { text: 'Up to 2 virtual assets', included: true },
      { text: 'Live sensor monitoring', included: false },
      { text: 'Mainteligence Sense hardware', included: false },
      { text: 'On-premise deployment', included: false },
      { text: 'SLA & dedicated support', included: false },
    ],
  },
  {
    id: 'platform',
    label: 'Platform',
    price: '€890',
    period: '/ month',
    tagline: 'Full software platform for industrial teams.',
    badge: 'Most Popular',
    cta: 'Request a Demo',
    ctaHref: '/contact',
    primary: true,
    features: [
      { text: 'Full Mainteligence Platform access', included: true },
      { text: 'Up to 50 monitored assets', included: true },
      { text: 'LSTM RUL predictions (real-time)', included: true },
      { text: 'Alerts, analytics, dashboards', included: true },
      { text: 'REST API + webhook integrations', included: true },
      { text: 'On-premise deployment included', included: true },
      { text: 'RBAC + SSO (SAML / OIDC)', included: true },
      { text: 'Mainteligence Sense hardware', included: false },
      { text: 'On-site installation service', included: false },
    ],
  },
  {
    id: 'enterprise',
    label: 'Enterprise',
    price: 'Custom',
    period: '',
    tagline: 'Multi-plant deployments with hardware bundled.',
    badge: null,
    cta: 'Contact Sales',
    ctaHref: '/contact',
    primary: false,
    features: [
      { text: 'Everything in Platform', included: true },
      { text: 'Unlimited monitored assets', included: true },
      { text: 'Mainteligence Sense devices included', included: true },
      { text: 'On-site installation & commissioning', included: true },
      { text: 'Custom AI model training on your data', included: true },
      { text: 'Dedicated customer success engineer', included: true },
      { text: 'SLA 99.9% uptime guarantee', included: true },
      { text: 'Air-gapped / classified deployment', included: true },
      { text: 'SCADA / MES integration support', included: true },
    ],
  },
]

const compareRows = [
  { label: 'Monitored assets', demo: '2 (virtual)', platform: 'Up to 50', enterprise: 'Unlimited' },
  { label: 'RUL prediction', demo: 'Simulation only', platform: 'Real-time LSTM', enterprise: 'Real-time LSTM + custom models' },
  { label: 'Sensor monitoring', demo: false, platform: true, enterprise: true },
  { label: 'Alert engine', demo: false, platform: true, enterprise: true },
  { label: 'REST API', demo: false, platform: true, enterprise: true },
  { label: 'On-premise deployment', demo: false, platform: true, enterprise: true },
  { label: 'Mainteligence Sense hardware', demo: false, platform: 'Optional add-on', enterprise: 'Included' },
  { label: 'On-site installation', demo: false, platform: false, enterprise: true },
  { label: 'Custom model training', demo: false, platform: false, enterprise: true },
  { label: 'Dedicated support', demo: false, platform: 'Ticket-based', enterprise: 'Named CSE + SLA' },
  { label: 'SCADA / MES integration', demo: false, platform: false, enterprise: true },
]

function CheckCell({ value }: { value: boolean | string }) {
  if (value === false) return <Minus size={14} className="text-[#27272a] mx-auto" />
  if (value === true) return <CheckCircle2 size={14} className="text-[#10b981] mx-auto" />
  return <span className="text-[11px] font-mono text-[#71717a]">{value}</span>
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#09090b]">
      <AppNavbar />
      <div className="pt-24 pb-20">
        {/* Header */}
        <div className="max-w-4xl mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-[#27272a] bg-[#111113] rounded-sm px-3.5 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8650a]" />
            <span className="text-[10px] text-[#a1a1aa] font-mono tracking-widest uppercase">Pricing</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#fafafa] tracking-tight mb-5 text-balance">
            Transparent Industrial Pricing
          </h1>
          <p className="text-base text-[#71717a] leading-relaxed text-pretty">
            Start with a free demo. Deploy on your infrastructure. Scale to any facility size without surprise fees.
            Hardware is optional — the platform works with any IoT source.
          </p>
        </div>

        {/* Plans */}
        <div className="max-w-6xl mx-auto px-6 lg:px-10 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-sm border transition-colors ${
                  plan.primary
                    ? 'border-[#e8650a]/40 bg-[#0d0d0f]'
                    : 'border-[#1c1c1f] bg-[#0d0d0f] hover:border-[#27272a]'
                }`}
              >
                {plan.primary && (
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8650a]/50 to-transparent" />
                )}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-[9px] font-mono uppercase tracking-widest bg-[#e8650a] text-white px-3 py-1 rounded-sm">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-6 flex-1">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-3">{plan.label}</p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-3xl font-bold tracking-tight ${plan.primary ? 'text-[#fafafa]' : 'text-[#e4e4e7]'}`}>{plan.price}</span>
                    {plan.period && <span className="text-sm text-[#52525b] mb-1 font-mono">{plan.period}</span>}
                  </div>
                  <p className="text-xs text-[#52525b] mb-6">{plan.tagline}</p>

                  <div className="space-y-2.5">
                    {plan.features.map((f) => (
                      <div key={f.text} className="flex items-start gap-2.5">
                        {f.included
                          ? <CheckCircle2 size={13} className="text-[#10b981] mt-0.5 shrink-0" />
                          : <Minus size={13} className="text-[#27272a] mt-0.5 shrink-0" />}
                        <span className={`text-xs ${f.included ? 'text-[#a1a1aa]' : 'text-[#3a3a3d]'}`}>{f.text}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={plan.ctaHref}
                    className={`w-full flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-sm transition-all ${
                      plan.primary
                        ? 'bg-[#e8650a] hover:bg-[#d15a08] text-white hover:shadow-[0_0_20px_rgba(232,101,10,0.30)]'
                        : 'border border-[#27272a] hover:border-[#52525b] text-[#a1a1aa] hover:text-[#fafafa]'
                    }`}
                  >
                    {plan.cta} <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Comparison table */}
        <div className="max-w-6xl mx-auto px-6 lg:px-10 mb-16">
          <h2 className="text-lg font-semibold text-[#e4e4e7] mb-6">Full Feature Comparison</h2>
          <div className="border border-[#1c1c1f] rounded-sm overflow-hidden">
            {/* Header */}
            <div className="grid bg-[#111113] border-b border-[#1c1c1f]" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}>
              <div className="p-4 text-[10px] font-mono uppercase tracking-widest text-[#3a3a3d]">Feature</div>
              {['Free Demo', 'Platform', 'Enterprise'].map((h) => (
                <div key={h} className="p-4 text-center">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">{h}</p>
                </div>
              ))}
            </div>
            {compareRows.map((row, i) => (
              <div
                key={row.label}
                className={`grid border-b border-[#1c1c1f] last:border-b-0 ${i % 2 === 0 ? 'bg-[#09090b]' : 'bg-[#0d0d0f]'}`}
                style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr' }}
              >
                <div className="p-3.5 text-xs text-[#71717a]">{row.label}</div>
                <div className="p-3.5 flex items-center justify-center"><CheckCell value={row.demo} /></div>
                <div className="p-3.5 flex items-center justify-center"><CheckCell value={row.platform} /></div>
                <div className="p-3.5 flex items-center justify-center"><CheckCell value={row.enterprise} /></div>
              </div>
            ))}
          </div>
        </div>

        {/* Hardware add-on */}
        <div className="max-w-6xl mx-auto px-6 lg:px-10 mb-16">
          <div className="border border-[#1c1c1f] bg-[#0d0d0f] rounded-sm p-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Cpu size={14} className="text-[#e8650a]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#e8650a]">Hardware Add-On</span>
                </div>
                <h3 className="text-xl font-bold text-[#fafafa] mb-2">Mainteligence Sense Device</h3>
                <p className="text-sm text-[#71717a] max-w-xl">
                  Available as an optional hardware add-on for Platform customers, or bundled in Enterprise. Industrial IoT gateway with integrated vibration, temperature, and pressure sensors. IP67 rated. Installs in under 15 minutes.
                </p>
              </div>
              <div className="shrink-0 text-center">
                <p className="text-2xl font-bold text-[#fafafa]">€490</p>
                <p className="text-[10px] font-mono text-[#52525b]">per unit · one-time</p>
                <p className="text-[10px] font-mono text-[#52525b] mt-0.5">+ installation service available</p>
                <Link href="/contact" className="mt-3 inline-flex items-center gap-2 text-xs bg-[#111113] border border-[#27272a] hover:border-[#52525b] text-[#a1a1aa] hover:text-[#fafafa] px-4 py-2 rounded-sm transition-colors">
                  Get a Quote <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Trust row */}
        <div className="max-w-6xl mx-auto px-6 lg:px-10 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: <Shield size={18} />, title: 'On-Premise First', desc: 'All tiers support on-premise deployment. Your data never leaves your network.' },
              { icon: <Server size={18} />, title: 'No Vendor Lock-In', desc: 'Open REST API. Export all your data at any time in standard formats.' },
              { icon: <Cpu size={18} />, title: 'Works Without IoT', desc: 'Already have sensors or a SCADA system? Connect directly — Sense hardware is optional.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm">
                <div className="w-9 h-9 shrink-0 rounded-sm bg-[#e8650a]/10 border border-[#e8650a]/15 flex items-center justify-center text-[#e8650a]">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#e4e4e7] mb-1">{item.title}</p>
                  <p className="text-[11px] text-[#52525b] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-[#fafafa] mb-4">Not sure which plan fits your facility?</h2>
          <p className="text-sm text-[#71717a] mb-7">Talk to our team. We scope every deployment individually — size, existing infrastructure, connectivity, and compliance requirements.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="flex items-center gap-2 bg-[#e8650a] hover:bg-[#d15a08] text-white font-semibold text-sm px-7 py-3.5 rounded-sm transition-all hover:shadow-[0_0_24px_rgba(232,101,10,0.30)]">
              Talk to Sales <ArrowRight size={14} />
            </Link>
            <Link href="/demo" className="text-sm border border-[#27272a] hover:border-[#52525b] text-[#a1a1aa] hover:text-[#fafafa] px-7 py-3.5 rounded-sm transition-colors">
              Try Free Demo First
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
