/**
 * COMPONENT: BusinessModelSection — Homepage pricing tiers overview
 * USED IN: app/page.tsx (Homepage)
 * Pilot, Subscription, Enterprise tier cards — links to /pricing for full detail
 */
import { FlaskConical, RefreshCw, Package } from 'lucide-react'

const tiers = [
  {
    icon: FlaskConical,
    label: 'Free Demo',
    tag: 'Start here',
    tagColor: '#10b981',
    title: 'Proof of Value on Real Data',
    description:
      'We run a live RUL prediction demonstration using the NASA CMAPSS turbofan engine degradation dataset. No installation, no commitment — see the AI output before you buy.',
    features: [
      'Live NASA dataset demo',
      'RUL model walkthrough',
      'Architecture overview',
      'No installation required',
    ],
    cta: 'Request Free Demo',
    ctaHref: '#demo',
    highlight: false,
  },
  {
    icon: RefreshCw,
    label: 'Platform Subscription',
    tag: 'Most popular',
    tagColor: '#e8650a',
    title: 'Full Predictive Maintenance Platform',
    description:
      'Annual or multi-year subscription to the Mainteligence software platform. Includes dashboard, AI models, alert management, API access, and dedicated industrial support.',
    features: [
      'Unlimited asset monitoring',
      'RUL & anomaly detection models',
      'On-premise or private cloud',
      'SLA-backed support',
      'Model retraining service',
    ],
    cta: 'Get Pricing',
    ctaHref: '#demo',
    highlight: true,
  },
  {
    icon: Package,
    label: 'Hardware + Services',
    tag: 'Optional',
    tagColor: '#3b82f6',
    title: 'Mainteligence Sense + Installation',
    description:
      'Optional add-on for facilities without existing IoT infrastructure. Includes the Sense gateway devices, professional installation, and initial sensor calibration by our field team.',
    features: [
      'Sense device units',
      'On-site installation',
      'Sensor calibration',
      'Integration testing',
    ],
    cta: 'Enquire About Hardware',
    ctaHref: '#contact',
    highlight: false,
  },
]

const socialProofItems = [
  {
    quote:
      'Designed for industrial environments where 99.9% uptime is not a target — it is the baseline. Every component of Mainteligence is engineered for the conditions your machines operate in.',
    attribution: 'Engineering Team, Mainteligence',
    stat: 'IP67 rated · ATEX certified · -40°C to +85°C',
  },
  {
    quote:
      'Our AI models are trained on the NASA CMAPSS turbofan engine degradation dataset — the gold standard benchmark for predictive maintenance research, used by aerospace and defense engineers worldwide.',
    attribution: 'AI Research Team, Mainteligence',
    stat: 'NASA CMAPSS · Real-world validated · Peer-reviewed methods',
  },
  {
    quote:
      'Mainteligence is architected for enterprise-scale: multi-site deployment, role-based access control, encrypted data at rest and in transit, and full audit logging to meet ISO 27001 requirements.',
    attribution: 'Infrastructure Team, Mainteligence',
    stat: 'ISO 27001 aligned · RBAC · End-to-end encryption',
  },
]

export default function BusinessModelSection() {
  return (
    <>
      {/* Business Model */}
      <section id="business-model" className="relative bg-[#09090b] py-28 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-mono uppercase tracking-widest text-[#e8650a] mb-4">
              How We Work Together
            </p>
            <h2 className="text-4xl md:text-5xl font-bold text-[#fafafa] leading-tight text-balance mb-5">
              Simple, Transparent{' '}
              <span className="text-[#e8650a]">Engagement Model</span>
            </h2>
            <p className="text-[#71717a] text-lg leading-relaxed">
              From first contact to full deployment — a model built around your pace and
              your infrastructure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map(({ icon: Icon, label, tag, tagColor, title, description, features, cta, ctaHref, highlight }) => (
              <div
                key={label}
                className={`relative flex flex-col rounded-sm p-6 border transition-all ${
                  highlight
                    ? 'border-[#e8650a]/40 bg-[#0f0c0a]'
                    : 'border-[#1c1c1f] bg-[#0d0d0f] hover:border-[#27272a]'
                }`}
              >
                {/* Top accent line for highlighted */}
                {highlight && (
                  <div className="absolute top-0 left-6 right-6 h-px bg-[#e8650a]" />
                )}

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-9 h-9 rounded-sm border border-[#27272a] bg-[#111113] flex items-center justify-center">
                    <Icon size={16} className="text-[#e8650a]" />
                  </div>
                  <span
                    className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-sm"
                    style={{ color: tagColor, background: `${tagColor}18`, border: `1px solid ${tagColor}30` }}
                  >
                    {tag}
                  </span>
                </div>

                <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-2">{label}</p>
                <h3 className="text-base font-semibold text-[#e4e4e7] mb-3">{title}</h3>
                <p className="text-xs text-[#71717a] leading-relaxed mb-5 flex-1">{description}</p>

                {/* Feature list */}
                <ul className="space-y-2 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-xs text-[#a1a1aa]">
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: tagColor }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <a
                  href={ctaHref}
                  className={`block text-center text-xs font-semibold px-4 py-2.5 rounded-sm transition-all ${
                    highlight
                      ? 'bg-[#e8650a] hover:bg-[#d15a08] text-white'
                      : 'border border-[#27272a] hover:border-[#52525b] text-[#a1a1aa] hover:text-[#fafafa]'
                  }`}
                >
                  {cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section id="social-proof" className="relative bg-[#0d0d0f] py-20 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
          <div className="max-w-xl mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-[#e8650a] mb-4">
              Built to Last
            </p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#fafafa] leading-tight text-balance">
              Industrial-Grade From the Ground Up
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {socialProofItems.map(({ quote, attribution, stat }) => (
              <div
                key={attribution}
                className="border border-[#1c1c1f] bg-[#09090b] rounded-sm p-6 flex flex-col gap-5 hover:border-[#27272a] transition-colors"
              >
                {/* Quote mark */}
                <div className="text-[#e8650a]/30 text-4xl font-serif leading-none select-none">&ldquo;</div>
                <p className="text-sm text-[#a1a1aa] leading-relaxed flex-1">{quote}</p>
                <div className="border-t border-[#1c1c1f] pt-4">
                  <p className="text-xs font-semibold text-[#71717a] mb-2">{attribution}</p>
                  <p className="text-[10px] font-mono text-[#e8650a]/70 tracking-wide">{stat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
