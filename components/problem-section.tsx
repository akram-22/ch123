/**
 * COMPONENT: ProblemSection — Homepage pain-point block
 * USED IN: app/page.tsx (Homepage)
 * Four problem cards: unplanned downtime, reactive maintenance, poor visibility, cost
 */
'use client'

import { AlertTriangle, DollarSign, Eye, Wifi } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const ICONS = [AlertTriangle, DollarSign, Eye, Wifi]

export default function ProblemSection() {
  const { t } = useI18n()
  const p = t.problem

  return (
    <section id="problem" className="relative bg-[#09090b] py-28 overflow-hidden">
      <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-[#e8650a]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-3xl mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#e8650a] mb-4">{p.tag}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#fafafa] leading-tight text-balance mb-5">
            {p.title1}{' '}
            <span className="text-[#e8650a]">{p.titleAccent}</span>{' '}
            {p.title2}
          </h2>
          <p className="text-[#71717a] text-lg leading-relaxed text-pretty">{p.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#1c1c1f] rounded-sm overflow-hidden border border-[#1c1c1f]">
          {p.cards.map((card, i) => {
            const Icon = ICONS[i]
            return (
              <div key={card.title} className="bg-[#09090b] hover:bg-[#0d0d0f] transition-colors p-8 group">
                <div className="flex items-start gap-5 mb-6">
                  <div className="flex-shrink-0 w-10 h-10 rounded-sm bg-[#1c1c1f] border border-[#27272a] flex items-center justify-center group-hover:border-[#e8650a]/30 transition-colors">
                    <Icon size={18} className="text-[#e8650a]" />
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-[#fafafa]">{card.stat}</span>
                    <span className="text-xs text-[#52525b] font-mono ml-2">{card.statLabel}</span>
                  </div>
                </div>
                <h3 className="text-base font-semibold text-[#e4e4e7] mb-3">{card.title}</h3>
                <p className="text-sm text-[#71717a] leading-relaxed">{card.description}</p>
                <div className="mt-6 h-px w-0 group-hover:w-12 bg-[#e8650a] transition-all duration-500" />
              </div>
            )
          })}
        </div>

        <div className="mt-14 border border-[#1c1c1f] bg-[#111113] rounded-sm p-6 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#e8650a] mt-1 md:mt-0" />
          <p className="text-[#a1a1aa] text-sm leading-relaxed">
            <strong className="text-[#fafafa]">{p.calloutBold}</strong>{' '}{p.callout}
          </p>
        </div>
      </div>
    </section>
  )
}
