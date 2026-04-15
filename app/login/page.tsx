'use client'

/**
 * PAGE: Client Login
 * ROUTE: /login
 * PURPOSE: Authentication gate — username/password form, redirects to /client/welcome on success
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Shield, ArrowRight, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/auth'

const DEMO_ACCOUNTS = [
  { label: 'Sonatrach — Oil & Gas (Enterprise)', email: 'alpha@mainteligence.demo', password: 'demo123' },
  { label: 'Cevital Industries — Agro-Industrial (Professional)', email: 'beta@mainteligence.demo', password: 'beta2025' },
  { label: 'Lafarge Algérie — Cement (Starter)', email: 'gamma@mainteligence.demo', password: 'gamma2025' },
]

export default function LoginPage() {
  const router = useRouter()
  const { user, loading, login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [busy, setBusy]         = useState(false)

  // Already logged in → redirect
  useEffect(() => {
    if (!loading && user) router.replace('/client/welcome')
  }, [loading, user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    await new Promise(r => setTimeout(r, 600)) // simulate network
    const { ok, error: err } = await login(email, password)
    if (ok) {
      router.push('/client/welcome')
    } else {
      setError(err ?? 'Login failed.')
      setBusy(false)
    }
  }

  function fillDemo(acc: typeof DEMO_ACCOUNTS[0]) {
    setEmail(acc.email)
    setPassword(acc.password)
    setError(null)
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {/* Minimal header */}
      <header className="h-16 border-b border-[#1c1c1f] flex items-center px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/G5GBg0NwHnI0ygSX2aOgv-yHCBfxf9exqvRH4s5vViaYhdSw2A6T.png"
            alt="Mainteligence logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-semibold text-sm text-[#fafafa] whitespace-nowrap">
            Maint<span className="text-[#e8650a]">elligence</span>
          </span>
        </Link>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-mono text-[#3a3a3d]">
          <Shield size={10} className="text-[#10b981]" />
          <span>Secure Client Access</span>
        </div>
      </header>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Card */}
          <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-8">
            {/* Title */}
            <div className="mb-8">
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#e8650a] mb-2">
                Client Platform
              </p>
              <h1 className="text-xl font-semibold text-[#fafafa] tracking-tight">
                Sign in to your workspace
              </h1>
              <p className="text-sm text-[#52525b] mt-1.5 leading-relaxed">
                Access your company's private industrial monitoring platform.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono uppercase tracking-wider text-[#52525b]" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="company@mainteligence.demo"
                  className="w-full bg-[#0d0d0f] border border-[#27272a] rounded-sm px-4 py-3 text-sm text-[#e4e4e7] placeholder:text-[#3a3a3d] font-mono focus:outline-none focus:border-[#e8650a] focus:ring-1 focus:ring-[#e8650a]/30 transition-colors"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-[#52525b]" htmlFor="password">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[10px] font-mono text-[#3a3a3d] hover:text-[#e8650a] transition-colors"
                    onClick={() => alert('Contact your Mainteligence account manager to reset your password.')}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPw ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0d0d0f] border border-[#27272a] rounded-sm px-4 py-3 pr-11 text-sm text-[#e4e4e7] placeholder:text-[#3a3a3d] font-mono focus:outline-none focus:border-[#e8650a] focus:ring-1 focus:ring-[#e8650a]/30 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#3a3a3d] hover:text-[#71717a] transition-colors"
                    aria-label={showPw ? 'Hide password' : 'Show password'}
                  >
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-2.5 bg-red-950/20 border border-red-900/30 rounded-sm px-3 py-2.5">
                  <AlertCircle size={13} className="text-[#ef4444] mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-[#ef4444] font-mono">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={busy}
                className="mt-1 w-full flex items-center justify-center gap-2 bg-[#e8650a] hover:bg-[#d15a08] disabled:opacity-60 text-white text-sm font-medium px-6 py-3 rounded-sm transition-all hover:shadow-[0_0_20px_rgba(232,101,10,0.30)]"
              >
                {busy ? (
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  <>Sign In <ArrowRight size={14} /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-[#1c1c1f]" />
              <span className="text-[10px] font-mono text-[#27272a]">DEMO ACCOUNTS</span>
              <div className="flex-1 h-px bg-[#1c1c1f]" />
            </div>

            {/* Demo quick-fill */}
            <div className="flex flex-col gap-2">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="w-full text-left px-3.5 py-2.5 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm hover:border-[#27272a] transition-colors group"
                >
                  <p className="text-[10px] font-mono text-[#52525b] group-hover:text-[#71717a] transition-colors leading-relaxed">
                    {acc.label}
                  </p>
                  <p className="text-[9px] font-mono text-[#27272a] group-hover:text-[#3a3a3d] mt-0.5 transition-colors">
                    {acc.email}
                  </p>
                </button>
              ))}
            </div>

            {/* Footer note */}
            <p className="text-center text-[10px] font-mono text-[#27272a] mt-6">
              No account?{' '}
              <Link href="/contact" className="text-[#e8650a] hover:underline">
                Request access
              </Link>
              {' '}or{' '}
              <Link href="/" className="text-[#3a3a3d] hover:text-[#52525b] transition-colors">
                return to website
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
