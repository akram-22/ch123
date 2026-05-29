/**
 * PAGE: Contact / Get a Demo Request
 * ROUTE: /contact
 * PURPOSE: Public lead-capture form — prospect fills out company details,
 *          use-case selection, and preferred contact method
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import AppNavbar from '@/components/app-navbar'
import { ArrowRight, Mail, Linkedin, CheckCircle2, Cpu, Clock } from 'lucide-react'
import { useI18n } from '@/lib/i18n'

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/myknvzkk'

export default function ContactPage() {
  const { t } = useI18n()
  const ct = t.contact

  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  const inputClass =
    'w-full bg-[#0d0d0f] border border-[#1c1c1f] hover:border-[#27272a] focus:border-[#e8650a]/40 rounded-sm px-3.5 py-2.5 text-sm text-[#a1a1aa] placeholder:text-[#27272a] focus:outline-none transition-colors'
  const labelClass =
    'block text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-1.5'

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const form = e.currentTarget
    const data = new FormData(form)
    // append the selected reason since it's managed by state (not a real input)
    if (reason) data.append('inquiry_type', reason)

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        setSubmitted(true)
      } else {
        const json = await res.json()
        setError(
          json?.errors?.[0]?.message ?? 'Something went wrong. Please try again.'
        )
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <AppNavbar />
      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-6 lg:px-10">

          {/* Header */}
          <div className="max-w-2xl mb-14">
            <div className="inline-flex items-center gap-2 border border-[#27272a] bg-[#111113] rounded-sm px-3.5 py-1.5 mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#e8650a]" />
              <span className="text-[10px] text-[#a1a1aa] font-mono tracking-widest uppercase">
                {ct.tag}
              </span>
            </div>
            <h1 className="text-4xl font-bold text-[#fafafa] tracking-tight mb-4 text-balance">
              {ct.title}
            </h1>
            <p className="text-sm text-[#71717a] leading-relaxed">{ct.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

            {/* ── Form ── */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="border border-[#10b981]/20 bg-[#10b981]/5 rounded-sm p-10 flex flex-col items-center justify-center text-center">
                  <CheckCircle2 size={36} className="text-[#10b981] mb-4" />
                  <h2 className="text-xl font-bold text-[#fafafa] mb-2">{ct.success.title}</h2>
                  <p className="text-sm text-[#71717a] mb-6 max-w-sm">{ct.success.body}</p>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/demo"
                      className="flex items-center gap-2 bg-[#e8650a] text-white text-sm font-semibold px-5 py-2.5 rounded-sm hover:bg-[#d15a08] transition-colors"
                    >
                      {ct.success.tryDemo} <ArrowRight size={13} />
                    </Link>
                    <Link
                      href="/dashboard"
                      className="text-sm border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] px-5 py-2.5 rounded-sm transition-colors"
                    >
                      {ct.success.viewPlatform}
                    </Link>
                  </div>
                </div>
              ) : (
                <form
                  action={FORMSPREE_ENDPOINT}
                  method="POST"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{ct.labels.firstName}</label>
                      <input
                        required
                        type="text"
                        name="first_name"
                        placeholder={ct.placeholders.firstName}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{ct.labels.lastName}</label>
                      <input
                        required
                        type="text"
                        name="last_name"
                        placeholder={ct.placeholders.lastName}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>{ct.labels.email}</label>
                    <input
                      required
                      type="email"
                      name="email"
                      placeholder={ct.placeholders.email}
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>{ct.labels.company}</label>
                      <input
                        required
                        type="text"
                        name="company"
                        placeholder={ct.placeholders.company}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>{ct.labels.role}</label>
                      <input
                        type="text"
                        name="role"
                        placeholder={ct.placeholders.role}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Reason selector — value sent via FormData append */}
                  <div>
                    <label className={labelClass}>{ct.labels.reason}</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ct.reasons.map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setReason(reason === r ? '' : r)}
                          className={`flex items-center gap-2 text-left px-3 py-2.5 rounded-sm border text-xs transition-all ${
                            reason === r
                              ? 'border-[#e8650a]/40 bg-[#e8650a]/8 text-[#fafafa]'
                              : 'border-[#1c1c1f] hover:border-[#27272a] text-[#52525b] hover:text-[#71717a]'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${reason === r ? 'bg-[#e8650a]' : 'bg-[#27272a]'}`} />
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>{ct.labels.message}</label>
                    <textarea
                      rows={4}
                      name="message"
                      placeholder={ct.placeholders.message}
                      className={inputClass + ' resize-none'}
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-[#ef4444] border border-[#ef4444]/20 bg-[#ef4444]/5 rounded-sm px-4 py-3">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-[#e8650a] hover:bg-[#d15a08] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm py-3.5 rounded-sm transition-all hover:shadow-[0_0_24px_rgba(232,101,10,0.30)] group"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <>
                        {ct.labels.submit}
                        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-[#27272a] text-center font-mono">
                    {ct.labels.privacy}
                  </p>
                </form>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="flex flex-col gap-5">

              {/* Response time */}
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock size={14} className="text-[#52525b]" />
                  <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">
                    {ct.sidebar.responseTitle}
                  </p>
                </div>
                <p className="text-2xl font-bold text-[#fafafa] mb-1">{ct.sidebar.responseValue}</p>
                <p className="text-xs text-[#52525b]">{ct.sidebar.responseSubtitle}</p>
                <div className="mt-4 space-y-2.5">
                  {ct.sidebar.rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-[10px] font-mono border-b border-[#111113] pb-2 last:border-b-0">
                      <span className="text-[#3a3a3d]">{row.label}</span>
                      <span className="text-[#71717a]">{row.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct contacts */}
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-4">
                  {ct.sidebar.directTitle}
                </p>
                <div className="space-y-3">
                  <a
                    href="mailto:contact@mainteligence.io"
                    className="flex items-center gap-3 p-3 bg-[#111113] border border-[#1c1c1f] hover:border-[#27272a] rounded-sm transition-colors group"
                  >
                    <Mail size={14} className="text-[#52525b] group-hover:text-[#e8650a] transition-colors" />
                    <div>
                      <p className="text-[9px] font-mono text-[#3a3a3d] uppercase tracking-widest">Email</p>
                      <p className="text-xs text-[#71717a] group-hover:text-[#a1a1aa] transition-colors">
                        contact@mainteligence.io
                      </p>
                    </div>
                  </a>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-[#111113] border border-[#1c1c1f] hover:border-[#27272a] rounded-sm transition-colors group"
                  >
                    <Linkedin size={14} className="text-[#52525b] group-hover:text-[#0077b5] transition-colors" />
                    <div>
                      <p className="text-[9px] font-mono text-[#3a3a3d] uppercase tracking-widest">LinkedIn</p>
                      <p className="text-xs text-[#71717a] group-hover:text-[#a1a1aa] transition-colors">Mainteligence</p>
                    </div>
                  </a>
                </div>
              </div>

              {/* What to expect */}
              <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b] mb-4">
                  {ct.sidebar.expectTitle}
                </p>
                <div className="space-y-3">
                  {ct.sidebar.expectSteps.map((step, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span className="text-[10px] font-mono text-[#e8650a] shrink-0 mt-0.5">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="text-xs text-[#52525b]">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Try demo callout */}
              <div className="border border-[#e8650a]/15 bg-[#e8650a]/5 rounded-sm p-5">
                <Cpu size={14} className="text-[#e8650a] mb-2" />
                <p className="text-xs font-semibold text-[#fafafa] mb-1.5">{ct.sidebar.notReadyTitle}</p>
                <p className="text-[11px] text-[#71717a] mb-3">{ct.sidebar.notReadyBody}</p>
                <Link href="/demo" className="flex items-center gap-1.5 text-xs font-medium text-[#e8650a] hover:text-[#f07520] transition-colors">
                  {ct.sidebar.notReadyCta} <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
