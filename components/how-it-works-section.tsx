'use client'

/**
 * COMPONENT: HowItWorksSection — Homepage 3-step process
 * USED IN: app/page.tsx (Homepage)
 * Steps: Deploy Sense → AI analyzes → Receive predictions + actions
 */

import { useI18n } from '@/lib/i18n'

const STEP_COLORS = ['#e8650a', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b']

export default function HowItWorksSection() {
  const { t } = useI18n()
  const h = t.howItWorks

  return (
    <section id="how-it-works" className="relative bg-[#09090b] py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '80px 100%',
      }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#e8650a] mb-4">{h.tag}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#fafafa] leading-tight text-balance mb-5">
            {h.title1}{' '}
            <span className="text-[#e8650a]">{h.titleAccent}</span>
          </h2>
          <p className="text-[#71717a] text-lg leading-relaxed">{h.subtitle}</p>
        </div>

        <div className="relative">
          <div className="absolute left-[19px] md:left-[39px] top-0 bottom-0 w-px bg-gradient-to-b from-[#e8650a]/30 via-[#27272a] to-transparent hidden md:block" />

          <div className="flex flex-col gap-0">
            {h.steps.map((step, i) => {
              const color = STEP_COLORS[i]
              const num = String(i + 1).padStart(2, '0')
              return (
                <div key={num} className="relative flex gap-6 md:gap-10 group">
                  <div className="relative flex-shrink-0 mt-1">
                    <div
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center bg-[#09090b] z-10 relative transition-colors duration-300"
                      style={{ borderColor: color }}
                    >
                      <span className="text-[10px] font-mono font-bold" style={{ color }}>{num}</span>
                    </div>
                  </div>
                  <div className="pb-12 flex-1 group-last:pb-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-[#e4e4e7]">{step.title}</h3>
                      <span
                        className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm"
                        style={{ color, background: `${color}18`, border: `1px solid ${color}30` }}
                      >
                        {step.tag}
                      </span>
                    </div>
                    <p className="text-sm text-[#71717a] leading-relaxed max-w-lg">{step.description}</p>
                    {i === h.steps.length - 1 && (
                      <div className="mt-6 inline-flex items-center gap-2 text-xs font-mono text-[#e8650a] border border-[#e8650a]/20 bg-[#e8650a]/5 rounded-sm px-4 py-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
                        {h.lastStepNote}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
