/**
 * COMPONENT: SolutionSection — Homepage solution overview
 * USED IN: app/page.tsx (Homepage)
 * Four pillars: AI engine, Sense hardware, analytics, security
 */
'use client'

import { BrainCircuit, Radio, BarChart3, Lock } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const ICONS = [BrainCircuit, Radio, BarChart3, Lock]

export default function SolutionSection() {
  const { t } = useI18n()
  const s = t.solution

  return (
    <section id="solution" className="relative bg-[#0d0d0f] py-28 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
      <div
        className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 60% at 100% 50%, rgba(232,101,10,0.08) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#e8650a] mb-4">{s.tag}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#fafafa] leading-tight text-balance mb-5">
            {s.title} <span className="text-[#e8650a]">{s.titleAccent}</span>
          </h2>
          <p className="text-[#71717a] text-lg leading-relaxed text-pretty">{s.subtitle}</p>
          <div className="mt-6 inline-flex items-center gap-3 border border-[#27272a] rounded-sm px-4 py-2.5 bg-[#111113]">
            <span className="text-xs font-mono text-[#a1a1aa] tracking-wide">&ldquo;{s.quote}&rdquo;</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {s.pillars.map((pillar, i) => {
            const Icon = ICONS[i]
            return (
              <div key={pillar.title} className="group relative border border-[#1c1c1f] bg-[#09090b] hover:border-[#e8650a]/30 rounded-sm p-6 transition-all duration-300 hover:bg-[#0f0f11]">
                <div className="w-10 h-10 rounded-sm border border-[#27272a] bg-[#111113] flex items-center justify-center mb-5 group-hover:border-[#e8650a]/40 transition-colors">
                  <Icon size={18} className="text-[#e8650a]" />
                </div>
                <h3 className="text-sm font-semibold text-[#e4e4e7] mb-3">{pillar.title}</h3>
                <p className="text-xs text-[#71717a] leading-relaxed">{pillar.description}</p>
                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-[#e8650a]/0 group-hover:border-[#e8650a]/40 transition-colors rounded-tr-sm" />
              </div>
            )
          })}
        </div>

        <div className="mt-20 flex items-center gap-4">
          <div className="flex-1 h-px bg-[#1c1c1f]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] px-4">{s.archLabel}</span>
          <div className="flex-1 h-px bg-[#1c1c1f]" />
        </div>

        <div className="mt-10 flex flex-col md:flex-row items-center justify-center gap-0">
          {s.archSteps.map((step, i) => (
            <div key={step.label} className="flex flex-col md:flex-row items-center">
              <div className="flex flex-col items-center text-center px-5 py-4 min-w-[120px]">
                <div className="w-9 h-9 rounded-full border border-[#27272a] bg-[#111113] flex items-center justify-center mb-3">
                  <span className="text-xs font-mono text-[#e8650a]">{String(i + 1).padStart(2, '0')}</span>
                </div>
                <span className="text-xs font-medium text-[#a1a1aa] leading-tight">{step.label}</span>
                <span className="text-[10px] text-[#52525b] mt-1 font-mono">{step.sub}</span>
              </div>
              {i < s.archSteps.length - 1 && (
                <div className="hidden md:flex items-center">
                  <div className="w-8 h-px bg-[#27272a]" />
                  <svg width="6" height="10" viewBox="0 0 6 10" fill="none" className="flex-shrink-0">
                    <path d="M1 1L5 5L1 9" stroke="#3a3a3d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
