/**
 * PAGE: Interactive Product Demo
 * ROUTE: /demo
 * PURPOSE: Wraps the shared MainteligenceDashboard (mode="demo") with the
 *          guided-tour overlay and intro modal. All dashboard UI lives in
 *          components/mainteligence-dashboard.tsx — this file only handles
 *          the demo-specific onboarding layer.
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AppNavbar from '@/components/app-navbar'
import MainteligenceDashboard from '@/components/mainteligence-dashboard'
import {
  Play, Activity, AlertTriangle, CheckCircle2,
  ArrowRight, Brain, Bell, Cpu,
  ChevronRight, X, Wrench, TrendingUp,
  LayoutDashboard, LineChart, BarChart3,
  Rss,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

type DemoTab = 'overview' | 'asset' | 'rul' | 'models' | 'insights' | 'sensor' | 'alerts' | 'maintenance'

// Maps demo's internal tab ids → shared dashboard section ids
const GUIDED_TAB_MAP: Record<DemoTab, string> = {
  overview:    'overview',
  sensor:      'sensors',
  rul:         'analytics',
  models:      'models',
  alerts:      'alerts',
  asset:       'assets',
  insights:    'insights',
  maintenance: 'maintenance',
}

// ─────────────────────────────────────────────────────────────────────────────
// GUIDED DEMO OVERLAY — 5-step sales walkthrough
// ─────────────────────────────────────────────────────────────────────────────

const GUIDED_STEPS = [
  {
    step: 1,
    title: 'Vue d\'ensemble du système',
    subtitle: '5 machines en ligne — 3 anomalies actives dans le parc',
    icon: LayoutDashboard,
    color: '#3b82f6',
    tab: 'overview' as DemoTab,
    target: 'overview-kpis',
    instruction: 'La vue d\'ensemble affiche l\'intégralité du parc en un coup d\'œil — santé de la flotte, alertes actives, RUL moyen et statut des dispositifs. Moteur EMT-22 est déjà en zone critique.',
  },
  {
    step: 2,
    title: 'Flux capteurs — Télémétrie en direct',
    subtitle: 'MS-02 (Compresseur K-12) — vibration et température anormales',
    icon: Rss,
    color: '#f59e0b',
    tab: 'sensor' as DemoTab,
    target: 'machine-cards',
    instruction: 'Le flux capteurs transmet en temps réel les lectures de tous les dispositifs Mainteligence Sense. Sélectionnez MS-02 — sa température et sa vibration sont toutes deux au-dessus des seuils de sécurité.',
  },
  {
    step: 3,
    title: 'Analyse RUL — Prévision de défaillance',
    subtitle: 'Moteur EMT-22 prédit en défaillance dans 11 jours',
    icon: LineChart,
    color: '#ef4444',
    tab: 'rul' as DemoTab,
    target: 'rul-chart',
    instruction: 'L\'analyse RUL affiche la trajectoire de dégradation et la durée de vie résiduelle prévue. Le seuil critique rouge est à 15 jours — le Moteur EMT-22 l\'a dépassé.',
  },
  {
    step: 4,
    title: 'Comparaison des modèles — LSTM vs RF vs GB',
    subtitle: 'Les 4 modèles confirment le statut critique — RUL < 15 jours',
    icon: BarChart3,
    color: '#a78bfa',
    tab: 'models' as DemoTab,
    target: 'model-comparison',
    instruction: 'La comparaison des modèles exécute LSTM, GRU, Random Forest et Gradient Boosting en parallèle. Le meilleur modèle par RMSE est automatiquement sélectionné pour la recommandation de maintenance.',
  },
  {
    step: 5,
    title: 'Alertes — Impact financier',
    subtitle: 'Évitez 1 200 000 DZD de pertes — planifiez la maintenance maintenant',
    icon: Bell,
    color: '#10b981',
    tab: 'alerts' as DemoTab,
    target: 'alerts-panel',
    instruction: 'Chaque événement critique est capturé ici avec son impact financier. Une panne imprévue coûte ~320 000 DZD. Une maintenance planifiée ne coûte que 45 000 DZD — soit 275 000 DZD d\'économie par événement.',
  },
] as const

type GuidedStepConfig = typeof GUIDED_STEPS[number]

function GuidedDemoOverlay({ onClose, onSetSection }: {
  onClose: () => void
  onSetSection: (tab: DemoTab) => void
}) {
  const [step, setStep] = useState(0)
  const current: GuidedStepConfig = GUIDED_STEPS[step]
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
    if (!tag) {
      tag = document.createElement('style')
      tag.id = styleId
      document.head.appendChild(tag)
    }
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

  function advance() {
    if (!isLast) setStep(s => s + 1)
    else onClose()
  }

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
                  DÉMO GUIDÉE
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

        {/* Financial callout on last step */}
        {current.step === 5 && (
          <div className="mx-4 mb-3 border border-[#1c1c1f] rounded-sm overflow-hidden">
            {[
              { label: 'Panne imprévue',     value: '320 000 DZD',   color: '#ef4444' },
              { label: 'Maintenance planif.', value: '45 000 DZD',    color: '#10b981' },
              { label: 'Économie',            value: '275 000 DZD',   color: '#e8650a' },
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
                  width: i === step ? '18px' : '5px',
                  height: '5px',
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
            <button onClick={advance}
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

// ─────────────────────────────────────────────────────────────────────────────
// INTRO MODAL
// ─────────────────────────────────────────────────────────────────────────────

const stateColor = { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' } as const
const stateBg    = { normal: 'rgba(16,185,129,0.1)', warning: 'rgba(245,158,11,0.1)', critical: 'rgba(239,68,68,0.12)' } as const

function IntroModal({ onStartGuided, onSkip }: { onStartGuided: () => void, onSkip: () => void }) {
  const [bootStep, setBootStep] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setBootStep(1), 400)
    const t2 = setTimeout(() => setBootStep(2), 900)
    const t3 = setTimeout(() => setBootStep(3), 1400)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const DEPLOYMENT = [
    { id: 'MS-01', asset: 'Turbine GTA-7',           type: 'Turbine à gaz',         state: 'normal'   as const },
    { id: 'MS-02', asset: 'Compresseur K-12',         type: 'Compresseur centrifuge', state: 'warning'  as const },
    { id: 'MS-03', asset: 'Pompe P-4',                type: 'Pompe centrifuge',       state: 'normal'   as const },
    { id: 'MS-04', asset: 'Moteur EMT-22',            type: 'Moteur électrique',      state: 'critical' as const },
    { id: 'MS-05', asset: 'Échangeur thermique HX-5', type: 'Échangeur à plaques',    state: 'warning'  as const },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-[480px] bg-[#0a0a0c] border border-[#27272a] rounded-sm shadow-2xl flex flex-col"
        style={{ maxHeight: 'calc(100vh - 48px)', boxShadow: '0 0 80px rgba(232,101,10,0.08), 0 30px 60px rgba(0,0,0,0.9)' }}>
        <div className="h-0.5 w-full shrink-0 bg-gradient-to-r from-transparent via-[#e8650a] to-transparent" />

        <div className="px-5 pt-5 pb-4 border-b border-[#1c1c1f] shrink-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
            </span>
            <span className="text-[9px] font-mono uppercase tracking-widest text-[#10b981]">Système actif</span>
            <span className="text-[9px] font-mono text-[#3a3a3d]">· Mainteligence v2.5</span>
          </div>
          <h2 className="text-base font-bold text-[#fafafa] tracking-tight mb-1">
            Bienvenue dans votre espace Mainteligence
          </h2>
          <p className="text-[10px] text-[#52525b] font-mono">
            Plateforme de surveillance industrielle · Environnement de démonstration
          </p>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
          <div className="space-y-2">
            <p className="text-sm text-[#a1a1aa] leading-relaxed">
              Vous explorez la plateforme Mainteligence en tant que client industriel.
            </p>
            <p className="text-sm text-[#a1a1aa] leading-relaxed">Votre déploiement inclut :</p>
            <ul className="space-y-1 pl-1">
              {[
                { icon: <Cpu size={10} />,      text: '5 dispositifs Mainteligence Sense déployés', color: '#e8650a' },
                { icon: <Activity size={10} />, text: '5 machines connectées et surveillées',        color: '#3b82f6' },
                { icon: <Brain size={10} />,    text: 'Surveillance IA en temps réel activée',       color: '#a78bfa' },
                { icon: <Bell size={10} />,     text: 'Détection d\'anomalies en cours',             color: '#ef4444' },
              ].map((item, i) => (
                <li key={i}
                  className={`flex items-center gap-2 text-xs text-[#71717a] transition-all duration-300 ${bootStep > 0 ? 'opacity-100' : 'opacity-0'}`}
                  style={{ transitionDelay: `${i * 100}ms` }}>
                  <span style={{ color: item.color }}>{item.icon}</span>
                  {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className={`border border-[#1c1c1f] rounded-sm overflow-hidden transition-all duration-500 ${bootStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex items-center justify-between px-3 py-2 bg-[#111113] border-b border-[#1c1c1f]">
              <span className="text-[9px] font-mono uppercase tracking-widest text-[#52525b]">Actifs déployés</span>
              <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#10b981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" /> Tous en ligne
              </span>
            </div>
            <div className="divide-y divide-[#111113]">
              {DEPLOYMENT.map((d, i) => (
                <div key={d.id}
                  className={`flex items-center justify-between px-3 py-2 transition-all duration-300 ${bootStep >= 3 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`}
                  style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="flex items-center gap-3">
                    <span className="text-[9px] font-mono text-[#52525b] w-14">{d.id}</span>
                    <div>
                      <p className="text-[10px] font-semibold text-[#e4e4e7]">{d.asset}</p>
                      <p className="text-[8px] font-mono text-[#3a3a3d]">{d.type}</p>
                    </div>
                  </div>
                  <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm"
                    style={{ color: stateColor[d.state], background: stateBg[d.state], border: `1px solid ${stateColor[d.state]}25` }}>
                    {d.state === 'normal' ? 'Normal' : d.state === 'warning' ? 'Avertissement' : 'Critique'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className={`flex items-start gap-3 bg-[#ef4444]/6 border border-[#ef4444]/20 rounded-sm px-4 py-3 transition-all duration-500 ${bootStep >= 3 ? 'opacity-100' : 'opacity-0'}`}>
            <AlertTriangle size={14} className="text-[#ef4444] shrink-0 mt-0.5" />
            <p className="text-[11px] text-[#a1a1aa] leading-relaxed">
              Le système est actif et détecte des anomalies en temps réel.{' '}
              <span className="text-[#ef4444] font-semibold">Moteur EMT-22 en alerte critique</span> — intervention immédiate requise.
            </p>
          </div>
        </div>

        <div className="px-5 pt-3 pb-4 border-t border-[#1c1c1f] shrink-0 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button onClick={onStartGuided}
              className="flex-1 flex items-center justify-center gap-2 bg-[#e8650a] hover:bg-[#d15a08] text-white text-sm font-semibold py-2.5 px-4 rounded-sm transition-all hover:shadow-[0_0_20px_rgba(232,101,10,0.30)]">
              <Play size={12} fill="white" />
              Démarrer la visite guidée
            </button>
            <button onClick={onSkip}
              className="flex-1 flex items-center justify-center gap-2 border border-[#27272a] hover:border-[#3a3a3d] text-[#71717a] hover:text-[#a1a1aa] text-sm font-medium py-2.5 px-4 rounded-sm transition-colors">
              Explorer librement
              <ArrowRight size={12} />
            </button>
          </div>
          <p className="text-[9px] font-mono text-[#27272a] text-center">
            Environnement simulé · Les données sont générées à des fins de démonstration
          </p>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function DemoPage() {
  const [section, setSection]     = useState('overview')
  const [guidedOpen, setGuidedOpen] = useState(false)
  const [introOpen, setIntroOpen]   = useState(true)

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <AppNavbar />

      {introOpen && (
        <IntroModal
          onStartGuided={() => { setIntroOpen(false); setGuidedOpen(true) }}
          onSkip={() => setIntroOpen(false)}
        />
      )}

      {guidedOpen && !introOpen && (
        <GuidedDemoOverlay
          onClose={() => setGuidedOpen(false)}
          onSetSection={(tab) => setSection(GUIDED_TAB_MAP[tab])}
        />
      )}

      {/* Shared dashboard — pixel-identical to the client version */}
      <MainteligenceDashboard
        mode="demo"
        section={section}
        setSection={setSection}
        onResumeGuided={introOpen || guidedOpen ? undefined : () => setGuidedOpen(true)}
      />
    </div>
  )
}
