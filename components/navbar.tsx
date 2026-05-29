/**
 * COMPONENT: Navbar — Public marketing navigation bar
 * USED IN: Homepage (app/page.tsx) only
 * Distinct from AppNavbar — no auth state, no language switcher
 */
'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Platform', href: '#solution' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Product', href: '#product' },
  { label: 'Pricing', href: '#business-model' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a]'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10 flex items-center justify-between h-16">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5 group">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/8kwBAt3TMcfrzznrtjDZB-U0Xoo396fJCBz5q9GAxESy7SrAtdG6.png"
            alt="Mainteligence gear and tools logo"
            className="w-9 h-9 object-contain"
          />
          <span className="text-[#fafafa] font-semibold text-base tracking-tight">
            Maint<span className="text-[#e8650a]">elligence</span>
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors link-underline"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="#contact"
            className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors px-4 py-2"
          >
            Contact
          </a>
          <a
            href="#demo"
            className="text-sm font-medium bg-[#e8650a] hover:bg-[#d15a08] text-white px-5 py-2 rounded-sm transition-colors"
          >
            Request a Demo
          </a>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-[#a1a1aa] hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#09090b]/98 backdrop-blur-md border-b border-[#27272a] px-6 py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-[#a1a1aa] hover:text-[#fafafa] transition-colors py-1"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#demo"
            className="mt-2 text-sm font-medium bg-[#e8650a] text-white px-5 py-2.5 rounded-sm text-center"
            onClick={() => setMobileOpen(false)}
          >
            Request a Demo
          </a>
        </div>
      )}
    </header>
  )
}
