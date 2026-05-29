/**
 * COMPONENT: CtaFooter — Homepage bottom call-to-action + site footer
 * USED IN: app/page.tsx (Homepage)
 * Final CTA block with nav links, social links, and copyright
 */
'use client'

import Link from 'next/link'
import { ArrowRight, Mail, Linkedin } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

export default function CtaFooter() {
  const { t } = useI18n()
  const c = t.cta

  return (
    <>
      {/* Final CTA */}
      <section id="demo" className="relative bg-[#09090b] py-28 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 50%, rgba(232,101,10,0.10) 0%, transparent 70%)' }}
        />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#e8650a]/20 to-transparent" />

        <div className="relative max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <div className="inline-flex items-center gap-2 border border-[#27272a] bg-[#111113] rounded-sm px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-[#e8650a] animate-pulse" />
            <span className="text-xs text-[#a1a1aa] font-mono tracking-widest uppercase">{c.tag}</span>
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-[#fafafa] leading-tight text-balance mb-6">
            {c.title1}{' '}
            <span className="text-[#e8650a]">{c.titleAccent}</span>
          </h2>

          <p className="text-lg text-[#71717a] leading-relaxed mb-12 max-w-2xl mx-auto text-pretty">
            {c.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/demo"
              className="flex items-center gap-2 bg-[#e8650a] hover:bg-[#d15a08] text-white font-semibold text-sm px-8 py-4 rounded-sm transition-all hover:shadow-[0_0_40px_rgba(232,101,10,0.40)] group"
            >
              {c.btn1}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 border border-[#27272a] hover:border-[#52525b] text-[#a1a1aa] hover:text-[#fafafa] font-medium text-sm px-8 py-4 rounded-sm transition-all bg-[#111113]/50"
            >
              {c.btn2}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-[#09090b] border-t border-[#1c1c1f]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Brand */}
            <div>
              <Link href="/" className="flex items-center gap-2.5 mb-3 group">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/G5GBg0NwHnI0ygSX2aOgv-yHCBfxf9exqvRH4s5vViaYhdSw2A6T.png"
                  alt="Mainteligence gear and tools logo"
                  className="w-8 h-8 object-contain flex-shrink-0"
                />
                <span className="whitespace-nowrap font-semibold text-sm tracking-tight" style={{ color: 'var(--foreground)' }}>
                  Maint<span style={{ color: '#e8650a' }}>elligence</span>
                </span>
              </Link>
              <p className="text-xs text-[#52525b] max-w-xs leading-relaxed">{c.copyright}</p>
            </div>

            {/* Links */}
            <div className="flex flex-col sm:flex-row gap-8">
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-3">{c.footerLinks.platform}</p>
                <ul className="space-y-2">
                  {c.footerLinks.platformLinks.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors link-underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-3">{c.footerLinks.company}</p>
                <ul className="space-y-2">
                  {c.footerLinks.companyLinks.map((l) => (
                    <li key={l.href + l.label}>
                      <Link href={l.href} className="text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors link-underline">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-3">Contact</p>
                <ul className="space-y-2">
                  <li>
                    <a href="mailto:contact@mainteligence.io" className="flex items-center gap-2 text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors">
                      <Mail size={12} />
                      contact@mainteligence.io
                    </a>
                  </li>
                  <li>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-[#52525b] hover:text-[#a1a1aa] transition-colors">
                      <Linkedin size={12} />
                      LinkedIn
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[#1c1c1f] flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] font-mono text-[#3a3a3d]">
              &copy; {new Date().getFullYear()} Mainteligence. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {['Privacy Policy', 'Terms of Service'].map((l) => (
                <a key={l} href="#" className="text-[10px] font-mono text-[#3a3a3d] hover:text-[#52525b] transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
