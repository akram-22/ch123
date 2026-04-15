'use client'

/**
 * COMPONENT: AppNavbar — Authenticated top navigation bar
 * USED IN: /dashboard, /demo, /product, /pricing, /contact, /iot-demo
 * Has language switcher, mobile menu, and link to dashboard/login
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogIn, LayoutDashboard } from 'lucide-react'
import { useI18n, type Lang } from '@/lib/i18n'
import { useAuth } from '@/lib/auth'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'ar', label: 'AR' },
]

export default function AppNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { t, lang, setLang } = useI18n()
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: t.nav.product, href: '/product' },
    { label: t.nav.demo, href: '/demo' },
    { label: t.nav.pricing, href: '/pricing' },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href.split('#')[0]) && href.split('#')[0] !== '/'
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || pathname !== '/'
          ? 'bg-[var(--background)]/97 backdrop-blur-md border-b border-[var(--border)]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0 min-w-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/G5GBg0NwHnI0ygSX2aOgv-yHCBfxf9exqvRH4s5vViaYhdSw2A6T.png"
            alt="Mainteligence gear and tools logo"
            className="w-9 h-9 object-contain flex-shrink-0"
          />
          <span className="whitespace-nowrap font-semibold text-base tracking-tight" style={{ color: 'var(--foreground)' }}>
            Maint<span style={{ color: '#e8650a' }}>elligence</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm px-3.5 py-2 rounded-sm transition-all relative ${
                isActive(link.href)
                  ? 'text-[var(--foreground)] bg-[var(--surface-raised)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground-muted)] hover:bg-[var(--surface)]'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-0.5 bg-[#e8650a] rounded-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop right: lang switcher + CTAs */}
        <div className="hidden md:flex items-center gap-3">

          {/* Language switcher */}
          <div className="flex items-center border border-[var(--border)] rounded-sm overflow-hidden">
            {LANGS.map((l, i) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`text-[11px] font-mono px-2.5 py-1.5 transition-colors ${
                  lang === l.code
                    ? 'bg-[#e8650a] text-white'
                    : 'text-[var(--foreground-subtle)] hover:text-[var(--foreground-muted)] bg-transparent'
                } ${i < LANGS.length - 1 ? 'border-r border-[var(--border)]' : ''}`}
                aria-label={`Switch to ${l.code.toUpperCase()}`}
              >
                {l.label}
              </button>
            ))}
          </div>

          <Link
            href="/contact"
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors px-4 py-2"
          >
            {t.nav.contact}
          </Link>

          {/* Login / Portal CTA */}
          {user ? (
            <Link
              href="/client/dashboard"
              className="flex items-center gap-2 text-sm font-medium border border-[#e8650a]/40 text-[#e8650a] hover:bg-[#e8650a]/8 px-4 py-2 rounded-sm transition-all"
            >
              <LayoutDashboard size={13} />
              My Portal
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 text-sm font-medium border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] hover:border-[#52525b] px-4 py-2 rounded-sm transition-all"
            >
              <LogIn size={13} />
              Login
            </Link>
          )}

          <Link
            href="/demo"
            className="text-sm font-medium bg-[#e8650a] hover:bg-[#d15a08] text-white px-5 py-2 rounded-sm transition-all hover:shadow-[0_0_20px_rgba(232,101,10,0.30)]"
          >
            {t.nav.requestDemo}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden transition-colors"
          style={{ color: 'var(--foreground-muted)' }}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[var(--background)]/98 backdrop-blur-md border-b border-[var(--border)] px-6 py-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm py-2.5 px-3 rounded-sm transition-colors ${
                isActive(link.href)
                  ? 'text-[var(--foreground)] bg-[var(--surface-raised)]'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground-muted)]'
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile language switcher + theme toggle */}
          <div className="mt-3 pt-3 border-t border-[var(--border)]">
            <p className="text-[10px] font-mono uppercase tracking-widest text-[var(--foreground-subtle)] mb-2 px-3">Language</p>
            <div className="flex gap-2 px-3">
              {LANGS.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { setLang(l.code); setMobileOpen(false) }}
                  className={`text-xs font-mono px-3 py-1.5 rounded-sm border transition-colors ${
                    lang === l.code
                      ? 'bg-[#e8650a] border-[#e8650a] text-white'
                      : 'border-[var(--border)] text-[var(--foreground-subtle)] hover:text-[var(--foreground-muted)]'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[var(--border)] flex flex-col gap-2">
            <Link
              href="/contact"
              className="text-sm text-[var(--muted-foreground)] py-2.5 px-3 text-center border border-[var(--border)] rounded-sm hover:text-[var(--foreground)] hover:border-[var(--foreground-subtle)] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.contact}
            </Link>

            {/* Login / Portal */}
            {user ? (
              <Link
                href="/client/dashboard"
                className="flex items-center justify-center gap-2 text-sm font-medium border border-[#e8650a]/40 text-[#e8650a] py-2.5 px-3 rounded-sm text-center hover:bg-[#e8650a]/8 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <LayoutDashboard size={13} />
                My Portal
              </Link>
            ) : (
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm font-medium border border-[#27272a] text-[#a1a1aa] py-2.5 px-3 rounded-sm text-center hover:border-[#52525b] hover:text-[#fafafa] transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                <LogIn size={13} />
                Login
              </Link>
            )}

            <Link
              href="/demo"
              className="text-sm font-medium bg-[#e8650a] text-white py-2.5 px-3 rounded-sm text-center"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.requestDemo}
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
