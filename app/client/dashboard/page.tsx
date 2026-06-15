
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LogOut, Building2, AlertTriangle,
  Play, Activity, CheckCircle2, ArrowRight,
  Brain, Bell, Cpu, ChevronRight, X, Wrench,
  TrendingUp, LayoutDashboard, LineChart, BarChart3, Rss,
} from 'lucide-react'
import { useAuth } from '@/lib/auth'
import MainteligenceDashboard from '@/components/mainteligence-dashboard'

type GuidedTab = 'overview' | 'asset' | 'rul' | 'models' | 'insights' | 'sensor' | 'alerts' | 'maintenance'

const TAB_MAP: Record<GuidedTab, string> = {
  overview: 'overview', sensor: 'sensors', rul: 'analytics',
  models: 'models', alerts: 'alerts', asset: 'assets',
  insights: 'insights', maintenance: 'maintenance',
}

const GUIDED_STEPS = [
  {
    step: 1, title: "Vue d'ensemble du système",
    subtitle: '5 machines en ligne — 3 anomalies actives dans le parc',
    icon: LayoutDashboard, color: '#3b82f6', tab: 'overview' as GuidedTab, target: 'overview-kpis',
    instruction: "La vue d'ensemble affiche l'intégralité du parc en un coup d'œil — santé de la flotte, alertes actives, RUL moyen et statut des dispositifs.",
  },
  {
    step: 2, title: 'Flux capteurs — Télémétrie en direct',
    subtitle: 'MS-02 (Compresseur K-12) — vibration et température anormales',
    icon: Rss, color: '#f59e0b', tab: 'sensor' as GuidedTab, target: 'machine-cards',
    instruction: 'Le flux capteurs transmet en temps réel les lectures de tous vos dispositifs Mainteligence Sense.',
  },
  {
    step: 3, title: 'Analyse RUL — Prévision de défaillance',
    subtitle: 'Moteur EMT-22 prédit en défaillance dans 11 jours',
    icon: LineChart, color: '#ef4444', tab: 'rul' as GuidedTab, target: 'rul-chart',
    instruction: "L'analyse RUL affiche la trajectoire de dégradation et la durée de vie résiduelle prévue de chaque machine.",
  },
  {
    step: 4, title: 'Comparaison des modèles — LSTM vs RF vs GB',
    subtitle: 'Les 4 modèles confirment le statut critique — RUL < 15 jours',
    icon: BarChart3, color: '#a78bfa', tab: 'models' as GuidedTab, target: 'model-comparison',
    instruction: 'La comparaison des modèles exécute LSTM, GRU, Random Forest et Gradient Boosting en parallèle pour la meilleure précision.',
  },
  {
    step: 5, title: 'Alertes — Impact financier',
    subtitle: 'Évitez 1 200 000 DZD de pertes — planifiez la maintenance maintenant',
    icon: Bell, color: '#10b981', tab: 'alerts' as GuidedTab, target: 'alerts-panel',
    instruction: 'Chaque événement critique est capturé ici avec son impact financier estimé.',
  },
] as const

type StepConfig = typeof GUIDED_STEPS[number]

function GuidedOverlay({ onClose, onSetSection }: {
  onClose: () => void
  onSetSection: (tab: GuidedTab) => void
}) {
  const [step, setStep] = useState(0)
  const current: StepConfig = GUIDED_STEPS[step]
  const Icon = current.icon
  const isLast = step === GUIDED_STEPS.length - 1

  useEffect(() => {
    onSetSection(current.tab)
    const t = setTimeout(() => {
      const el = document.querySelector(`[data-guided="${current.target}"]`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
    return () => clearTimeout(t)
  }, [step, current.tab, current.target, onSetSection])

  useEffect(() => {
    const styleId = 'guided-highlight-style'
    let tag = document.getElementById(styleId) as HTMLStyleElement | null
    if (!tag) { tag = document.createElement('style'); tag.id = styleId; document.head.appendChild(tag) }
    tag.textContent = `
      [data-guided="${current.target}"] {
        outline: 2px solid ${current.color} !important;
        outline-offset: 4px;
        box-shadow: 0 0 0 6px ${current.color}15, 0 0 28px ${current.color}25 !important;
        border-radius: 2px;
        transition: outline 0.35s ease, box-shadow 0.35s ease;
      }
    `
    return () => { if (tag) tag.textContent = '' }
  }, [current.target, current.color])

  return (
    <>
      <div className="fixed inset-0 z-[105] pointer-events-none bg-[#09090b]/35" />
      <div
        className="fixed bottom-6 right-6 z-[110] w-80 bg-[#0d0d0f] border rounded-sm shadow-2xl overflow-hidden"
        style={{ borderColor: current.color + '40', boxShadow: `0 0 40px ${current.color}20, 0 20px 40px rgba(0,0,0,0.8)` }}
      >
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${current.color}, transparent)` }} />
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c1c1f]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0"
              style={{ background: `${current.color}18`, border: `1px solid ${current.color}35` }}>
              <Icon size={13} style={{ color: current.color }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[8px] font-mono text-[#52525b]">ÉTAPE {current.step} / {GUIDED_STEPS.length}</span>
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-sm"
                  style={{ color: current.color, background: `${current.color}12`, border: `1px solid ${current.color}25` }}>
                  VISITE GUIDÉE
                </span>
              </div>
              <p className="text-xs font-bold text-[#fafafa] leading-tight">{current.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#52525b] hover:text-[#a1a1aa] transition-colors shrink-0 ml-2">
            <X size={14} />
          </button>
        </div>
        <div className="px-4 py-2.5 border-b border-[#111113]" style={{ background: `${current.color}08` }}>
          <p className="text-[10px] font-mono leading-relaxed" style={{ color: current.color }}>{current.subtitle}</p>
        </div>
        <div className="px-4 py-4">
          <div className="flex gap-2.5">
            <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
              style={{ background: `${current.color}18`, border: `1px solid ${current.color}30` }}>
              <ArrowRight size={9} style={{ color: current.color }} />
            </div>
            <p className="text-[11px] text-[#71717a] leading-relaxed">{current.instruction}</p>
          </div>
        </div>
        {current.step === 5 && (
          <div className="mx-4 mb-3 border border-[#1c1c1f] rounded-sm overflow-hidden">
            {[
              { label: 'Panne imprévue',     value: '320 000 DZD', color: '#ef4444' },
              { label: 'Maintenance planif.', value: '45 000 DZD',  color: '#10b981' },
              { label: 'Économie',            value: '275 000 DZD', color: '#e8650a' },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between px-3 py-2 border-b border-[#111113] last:border-0">
                <span className="text-[9px] font-mono text-[#3a3a3d]">{row.label}</span>
                <span className="text-[10px] font-bold font-mono" style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
        )}
        {current.step === 5 && (
          <div className="flex gap-2 px-4 pb-3">
            <Link href="/contact"
              className="flex-1 flex items-center justify-center gap-1.5 bg-[#e8650a] hover:bg-[#d15a08] text-white text-[10px] font-semibold py-2 rounded-sm transition-all">
              <Wrench size={10} /> Maintenance
            </Link>
            <Link href="/contact"
              className="flex-1 flex items-center justify-center gap-1.5 border border-[#27272a] hover:border-[#52525b] text-[#71717a] hover:text-[#fafafa] text-[10px] font-medium py-2 rounded-sm transition-colors">
              <TrendingUp size={10} /> Déployer
            </Link>
          </div>
        )}
        <div className="flex items-center justify-between px-4 pb-4">
          <div className="flex items-center gap-1.5">
            {GUIDED_STEPS.map((_, i) => (
              <button key={i} onClick={() => setStep(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === step ? '18px' : '5px', height: '5px',
                  background: i === step ? current.color : i < step ? `${current.color}55` : '#27272a',
                }} />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                className="text-[10px] font-mono text-[#52525b] hover:text-[#a1a1aa] px-2.5 py-1.5 border border-[#1c1c1f] rounded-sm transition-colors">
                Précédent
              </button>
            )}
            <button onClick={() => isLast ? onClose() : setStep(s => s + 1)}
              className="flex items-center gap-1.5 text-[10px] font-semibold text-white px-3 py-1.5 rounded-sm transition-all"
              style={{ background: current.color }}>
              {isLast ? <><CheckCircle2 size={11} /> Terminer</> : <>Suivant <ChevronRight size={11} /></>}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function IntroModal({ companyName, machineCount, criticalCount, onStartGuided, onSkip }: {
  companyName: string
  machineCount: number
  criticalCount: number
  onStartGuided: () => void
  onSkip: () => void
}) {
  const [bootStep, setBootStep] = useState(0)
  useEffect(() => {
    const t1 = setTimeout(() => setBootStep(1), 400)
    const t2 = setTimeout(() => setBootStep(2), 900)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-[440px] bg-[#0a0a0c] border border-[#27272a] rounded-sm shadow-2xl"
        style={{ boxShadow: '0 0 80px rgba(232,101,10,0.08), 0 30px 60px rgba(0,0,0,0.9)' }}>
        <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-[#e8650a] to-transparent" />
        <div className="px-5 pt-5 pb-4 border-b border-[#1c1c1f]">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#10b981]">Système actif</span>
          </div>
          <h2 className="text-base font-bold text-[#fafafa] tracking-tight mb-1">Bienvenue, {companyName}</h2>
          <p className="text-[10px] text-[#52525b] font-mono">Plateforme de surveillance industrielle · Espace Client</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <ul className="space-y-1.5">
            {[
              { icon: <Cpu size={10} />,      text: `${machineCount} machines connectées et surveillées`, color: '#3b82f6' },
              { icon: <Activity size={10} />, text: 'Surveillance IA en temps réel activée',              color: '#a78bfa' },
              { icon: <Brain size={10} />,    text: 'Modèles prédictifs LSTM, GRU, RF, GB actifs',        color: '#e8650a' },
              { icon: <Bell size={10} />,     text: "Détection d'anomalies en cours",                     color: '#ef4444' },
            ].map((item, i) => (
              <li key={i}
                className={`flex items-center gap-2 text-xs text-[#71717a] transition-all duration-300 ${bootStep > 0 ? 'opacity-100' : 'opacity-0'}`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                <span style={{ color: item.color }}>{item.icon}</span>
                {item.text}
              </li>
            ))}
          </ul>
          {criticalCount > 0 && (
            <div className={`flex items-start gap-3 bg-[#ef4444]/6 border border-[#ef4444]/20 rounded-sm px-4 py-3 transition-all duration-500 ${bootStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              <AlertTriangle size={14} className="text-[#ef4444] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
                <span className="text-[#ef4444] font-semibold">{criticalCount} alerte{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''}</span> — intervention immédiate requise.
              </p>
            </div>
          )}
        </div>
        <div className="px-5 pt-2 pb-5 space-y-2.5">
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={onStartGuided}
              className="flex-1 flex items-center justify-center gap-2 bg-[#e8650a] hover:bg-[#d15a08] text-white text-sm font-semibold py-2.5 px-4 rounded-sm transition-all hover:shadow-[0_0_20px_rgba(232,101,10,0.30)]">
              <Play size={12} fill="white" /> Visite guidée
            </button>
            <button onClick={onSkip}
              className="flex-1 flex items-center justify-center gap-2 border border-[#27272a] hover:border-[#3a3a3d] text-[#71717a] hover:text-[#a1a1aa] text-sm font-medium py-2.5 px-4 rounded-sm transition-colors">
              Explorer librement <ArrowRight size={12} />
            </button>
          </div>
          <p className="text-[9px] font-mono text-[#27272a] text-center">Espace sécurisé · {companyName}</p>
        </div>
      </div>
    </div>
  )
}

export default function ClientDashboardPage() {
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [section, setSection]     = useState('overview')
  const [introOpen, setIntroOpen] = useState(true)
  const [guidedOpen, setGuidedOpen] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [loading, user, router])

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
        <div className="flex items-center gap-3 text-xs font-mono text-[#3a3a3d]">
          <span className="w-4 h-4 border-2 border-[#27272a] border-t-[#e8650a] rounded-full animate-spin" />
          Authentification...
        </div>
      </div>
    )
  }

  const { company } = user
  const criticalCount = company.alerts.filter(a => a.severity === 'critical' && !a.resolved).length

  function handleLogout() { logout(); router.push('/') }

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      {introOpen && (
        <IntroModal
          companyName={company.name}
          machineCount={company.machines.length}
          criticalCount={criticalCount}
          onStartGuided={() => { setIntroOpen(false); setGuidedOpen(true) }}
          onSkip={() => setIntroOpen(false)}
        />
      )}
      {guidedOpen && !introOpen && (
        <GuidedOverlay
          onClose={() => setGuidedOpen(false)}
          onSetSection={(tab) => setSection(TAB_MAP[tab])}
        />
      )}
      <header className="h-14 border-b border-[#1c1c1f] bg-[#09090b]/98 backdrop-blur-md flex items-center px-6 gap-4 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/api-attachments/G5GBg0NwHnI0ygSX2aOgv-yHCBfxf9exqvRH4s5vViaYhdSw2A6T.png"
            alt="Mainteligence" className="w-7 h-7 object-contain" />
          <span className="font-semibold text-[13px] text-[#fafafa] whitespace-nowrap hidden sm:block">
            Maint<span className="text-[#e8650a]">elligence</span>
          </span>
        </Link>
        <div className="h-4 w-px bg-[#1c1c1f] hidden sm:block" />
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
          <span className="text-[10px] font-mono text-[#52525b]">Espace Client</span>
        </div>
        <div className="flex-1" />
        {criticalCount > 0 && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#ef4444] bg-[#ef4444]/8 border border-[#ef4444]/20 px-2.5 py-1.5 rounded-sm">
            <AlertTriangle size={10} />
            <span>{criticalCount} Critique{criticalCount > 1 ? 's' : ''}</span>
          </div>
        )}
        {!introOpen && !guidedOpen && (
          <button onClick={() => setGuidedOpen(true)}
            className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b] hover:text-[#e8650a] border border-[#1c1c1f] hover:border-[#e8650a]/30 px-2.5 py-1.5 rounded-sm transition-colors">
            <Play size={9} /> Visite guidée
          </button>
        )}
        <div className="hidden md:flex items-center gap-1.5">
          <Building2 size={11} className="text-[#3a3a3d]" />
          <span className="text-[11px] font-mono text-[#52525b] max-w-[180px] truncate">{company.name}</span>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 text-[10px] font-mono text-[#3a3a3d] hover:text-[#ef4444] transition-colors px-2 py-1.5 rounded-sm border border-transparent hover:border-[#ef4444]/20">
          <LogOut size={11} />
          <span className="hidden sm:block">Déconnexion</span>
        </button>
      </header>
      <MainteligenceDashboard
        mode="client"
        section={section}
        setSection={setSection}
        onResumeGuided={introOpen || guidedOpen ? undefined : () => setGuidedOpen(true)}
      />
    </div>
  )
}
