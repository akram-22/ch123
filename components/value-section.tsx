/**
 * COMPONENT: ValueSection — Homepage ROI / business value block
 * USED IN: app/page.tsx (Homepage)
 * Shows savings stats: downtime reduction %, maintenance cost saved, RUL accuracy
 */
'use client'

import { TrendingDown, Clock, Wrench, Server, Database } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const ICONS = [TrendingDown, Clock, Wrench, Database, Server]

export default function ValueSection() {
  const { t } = useI18n()
  const v = t.value

  return (
    <section id="value" className="relative bg-[#0d0d0f] py-28 overflow-hidden">
      <div
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 50% at 0% 50%, rgba(232,101,10,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="max-w-2xl mb-16">
          <p className="text-xs font-mono uppercase tracking-widest text-[#e8650a] mb-4">{v.tag}</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#fafafa] leading-tight text-balance">
            {v.title1}{' '}
            <span className="text-[#e8650a]">{v.titleAccent}</span>
          </h2>
        </div>

        <div className="space-y-4">
          {v.items.map((item, i) => {
            const Icon = ICONS[i]
            return (
              <div
                key={item.label}
                className="group flex flex-col md:flex-row md:items-center gap-5 border border-[#1c1c1f] hover:border-[#27272a] bg-[#09090b] hover:bg-[#0d0d0f] rounded-sm px-6 py-5 transition-all"
              >
                <div className="flex-shrink-0 md:w-44 flex items-center gap-4">
                  <div className="w-9 h-9 rounded-sm border border-[#27272a] bg-[#111113] flex items-center justify-center group-hover:border-[#e8650a]/30 transition-colors">
                    <Icon size={16} className="text-[#e8650a]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#fafafa] leading-none">{item.metric}</p>
                    <span className="text-[9px] font-mono text-[#52525b] uppercase tracking-widest">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <div className="hidden md:block w-px h-10 bg-[#1c1c1f] group-hover:bg-[#27272a] transition-colors" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[#e4e4e7] mb-1">{item.label}</p>
                  <p className="text-xs text-[#71717a] leading-relaxed">{item.description}</p>
                </div>
                <div className="hidden md:block h-px w-0 group-hover:w-8 bg-[#e8650a] transition-all duration-500 flex-shrink-0" />
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-start md:items-center gap-6 border border-[#e8650a]/20 bg-[#e8650a]/5 rounded-sm px-6 py-5">
          <Server size={24} className="text-[#e8650a] flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-[#fafafa] mb-1">{v.onPremiseTitle}</p>
            <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-2xl">{v.onPremiseDesc}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
