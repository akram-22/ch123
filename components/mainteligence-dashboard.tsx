/**
 * COMPONENT: MainteligenceDashboard
 * PURPOSE: Single shared dashboard used by BOTH Demo (/demo) and Client (/dashboard).
 *          Data and panels are identical. Only the mode label differs.
 *
 * Props:
 *   mode         – 'demo'   → shows "Mode Démonstration" badge (orange)
 *                  'client' → shows clientName label (green, live indicator)
 *   clientName   – Displayed in the header when mode = 'client'
 *   section      – Controlled active panel id (optional; falls back to internal state)
 *   setSection   – Callback to sync active panel (used by Demo guided tour)
 *   sidebarOpen  – Mobile sidebar visibility (optional; internal fallback)
 *   setSidebarOpen – Mobile sidebar toggle
 */
'use client'

import { useState, useEffect, useRef, useMemo, createContext, useContext, Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import Link from 'next/link'
import {
  Activity, AlertTriangle, Bell, CheckCircle2, ChevronDown, ChevronRight,
  Cpu, Database, Download, Filter, Gauge, GitCompare, LayoutDashboard,
  Lightbulb, LogOut, Radio, RefreshCw, Settings, Shield,
  ThermometerSun, TrendingDown, TrendingUp, Vibrate, Wifi,
  Brain, BarChart3, Target, Zap, XCircle, Clock,
  X, ChevronLeft, Wrench, CalendarClock, ClipboardList, ArrowRight,
  Thermometer, TriangleAlert, Info, Eye, FileText,
} from 'lucide-react'

// ── Live data hook ────────────────────────────────────────────────────────────
// Single hook used at the top of each panel. All values are computed
// deterministically from a tick counter — no Math.random() in the render path,
// no layout shifts, no cascading re-renders.

// Base values for deterministic fluctuation — must be declared BEFORE useLiveData.
const MACHINES_BASE = [
  { id: 'GTA-07',  tempBase: 312, tempAmplitude: 4,   vibBase: 0.42, vibAmplitude: 0.03, pressureBase: 14.2  as number | null, pressAmplitude: 0.3, rulBase: 87 },
  { id: 'CMP-K12', tempBase: 428, tempAmplitude: 8,   vibBase: 1.87, vibAmplitude: 0.08, pressureBase: 22.8  as number | null, pressAmplitude: 0.5, rulBase: 34 },
  { id: 'PMP-P04', tempBase: 195, tempAmplitude: 3,   vibBase: 0.61, vibAmplitude: 0.04, pressureBase: 8.7   as number | null, pressAmplitude: 0.2, rulBase: 62 },
  { id: 'EMT-22',  tempBase: 521, tempAmplitude: 12,  vibBase: 3.24, vibAmplitude: 0.12, pressureBase: null,                   pressAmplitude: 0,   rulBase: 11 },
  { id: 'HX-05',   tempBase: 395, tempAmplitude: 7,   vibBase: 1.44, vibAmplitude: 0.07, pressureBase: 19.2  as number | null, pressAmplitude: 0.4, rulBase: 28 },
]

type LiveData = {
  /** Elapsed ticks since mount — monotonically increasing */
  elapsed: number
  /** Seconds since last sync — displayed as "il y a Xs" */
  syncSec: number
  /** KPI: active alert count oscillates between 3 and 4 */
  alertCount: number
  /** KPI: fleet health score oscillates ±1 around 82 */
  healthScore: number
  /** Per-machine live readings keyed by machine id */
  machines: Record<string, { temp: number, vib: number, pression: number | null, rul: number }>
}

// Small deterministic sine-based noise — no Math.random(), no layout shifts
function liveNoise(tick: number, id: string, amplitude: number): number {
  const seed = id.charCodeAt(0) + (id.charCodeAt(1) ?? 0) + (id.charCodeAt(2) ?? 0)
  return Math.sin(tick * 0.4 + seed * 0.7) * amplitude
}

function useLiveData(intervalMs = 4000): LiveData {
  const [tick, setTick] = useState(0)
  const elapsedRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      elapsedRef.current += 1
      setTick(t => t + 1)
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return useMemo(() => {
    const elapsed  = elapsedRef.current
    // sync display: 1 → 2 → … → 5 then reset — always feels fresh
    const syncSec  = (elapsed % 5) + 1
    const alertCount = elapsed % 6 < 3 ? 3 : 4
    const healthScore = 82 + Math.round(Math.sin(tick * 0.5) * 1)

    const machines: LiveData['machines'] = {}
    MACHINES_BASE.forEach(m => {
      const t = liveNoise(tick, m.id, m.tempAmplitude)
      const v = liveNoise(tick, m.id + 'v', m.vibAmplitude)
      const p = m.pressureBase !== null ? liveNoise(tick, m.id + 'p', m.pressAmplitude) : null
      // RUL decreases ~0.01 day per 2.5s tick (~0.004 days/min) — very slow realistic drift
      // Clamped to 0.1 so it never goes negative
      const rulDrift = -(tick * 0.01)
      machines[m.id] = {
        temp:     parseFloat((m.tempBase + t).toFixed(1)),
        vib:      parseFloat((m.vibBase  + v).toFixed(2)),
        pression: p !== null ? parseFloat((m.pressureBase! + p).toFixed(1)) : null,
        rul:      parseFloat(Math.max(0.1, m.rulBase + rulDrift).toFixed(1)),
      }
    })

    return { elapsed, syncSec, alertCount, healthScore, machines }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])
}

// ── Color maps ────────────────────────────────────────────────────────────────

const hC  = { good: '#10b981', warning: '#f59e0b', critical: '#ef4444' }
const hBg = { good: 'rgba(16,185,129,0.1)', warning: 'rgba(245,158,11,0.1)', critical: 'rgba(239,68,68,0.12)' }
const sC  = { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }
const sBg = { critical: 'rgba(239,68,68,0.10)', warning: 'rgba(245,158,11,0.08)', info: 'rgba(59,130,246,0.08)' }
const prC: Record<string, string> = { Immediate: '#ef4444', Urgent: '#f59e0b', Soon: '#e8650a', Planned: '#3b82f6' }
const risqueColor = { 'Critique': '#ef4444', 'Élevé': '#f59e0b', 'Moyen': '#e8650a', 'Faible': '#3b82f6' }
const risqueBg   = { 'Critique': 'rgba(239,68,68,0.10)', 'Élevé': 'rgba(245,158,11,0.08)', 'Moyen': 'rgba(232,101,10,0.08)', 'Faible': 'rgba(59,130,246,0.08)' }
const statutFr   = { good: 'Normal', warning: 'Avertissement', critical: 'Critique' }

// ── Data constants ────────────────────────────────────────────────────────────

export const MACHINES = [
  { id: 'GTA-07', name: 'Turbine GTA-7',           type: 'Turbine à gaz',         location: 'Unité 1 – Station A', rul: 87,  health: 'good'     as const, temp: 312, vibration: 0.42, pressure: 14.2, uptime: 98.4, lastInspection: '2025-12-14', nextMaintenance: '2026-03-15', cycles: 18420,
    models: { lstm: 87, gru: 85, rf: 84, gb: 89, bestModel: 'Gradient Boosting' } },
  { id: 'CMP-K12', name: 'Compresseur K-12',        type: 'Compresseur centrifuge', location: 'Unité 2 – Station B', rul: 34,  health: 'warning'  as const, temp: 428, vibration: 1.87, pressure: 22.8, uptime: 94.1, lastInspection: '2025-11-30', nextMaintenance: '2026-01-20', cycles: 31204,
    models: { lstm: 34, gru: 33, rf: 31, gb: 36, bestModel: 'Gradient Boosting' } },
  { id: 'PMP-P04', name: 'Pompe P-4',               type: 'Pompe centrifuge',       location: 'Unité 1 – Station C', rul: 62,  health: 'good'     as const, temp: 195, vibration: 0.61, pressure: 8.7,  uptime: 99.1, lastInspection: '2026-01-05', nextMaintenance: '2026-04-02', cycles: 9870,
    models: { lstm: 62, gru: 61, rf: 58, gb: 60, bestModel: 'LSTM' } },
  { id: 'EMT-22',  name: 'Moteur EMT-22',            type: 'Moteur électrique',      location: 'Unité 3 – Station D', rul: 11,  health: 'critical' as const, temp: 521, vibration: 3.24, pressure: 0,    uptime: 81.3, lastInspection: '2025-10-22', nextMaintenance: '2026-01-18', cycles: 44015,
    models: { lstm: 11, gru: 10, rf: 9,  gb: 13, bestModel: 'LSTM' } },
  { id: 'HX-05',   name: 'Échangeur thermique HX-5', type: 'Échangeur à plaques',    location: 'Unité 2 – Station E', rul: 28,  health: 'warning'  as const, temp: 395, vibration: 1.44, pressure: 19.2, uptime: 91.7, lastInspection: '2025-12-01', nextMaintenance: '2026-01-25', cycles: 27680,
    models: { lstm: 28, gru: 27, rf: 25, gb: 30, bestModel: 'Gradient Boosting' } },
]

export const ALERTS = [
  { id: 1, severity: 'critical' as const, machine: 'Moteur EMT-22',          message: 'RUL < 15 jours — intervention immédiate requise',           time: 'il y a 2 min' },
  { id: 2, severity: 'warning'  as const, machine: 'Compresseur K-12',        message: 'Seuil de vibration dépassé (1.87g > 1.5g limite)',           time: 'il y a 18 min' },
  { id: 3, severity: 'warning'  as const, machine: 'Échangeur thermique HX-5', message: 'Température en hausse +12°C au-dessus du seuil sur 6h',    time: 'il y a 1h' },
  { id: 4, severity: 'info'     as const, machine: 'Turbine GTA-7',            message: 'Fenêtre de maintenance planifiée confirmée pour le 15 mars', time: 'il y a 3h' },
]

const MODEL_METRICS = {
  lstm: { rmse: 18.6, mae: 13.2, r2: 0.91, label: 'LSTM',               color: '#e8650a', desc: 'LSTM empilé 2 couches · fenêtre 30 cycles · FD001' },
  gru:  { rmse: 19.4, mae: 13.9, r2: 0.90, label: 'GRU',                color: '#a78bfa', desc: 'Gated Recurrent Unit · fenêtre 30 cycles · FD001' },
  rf:   { rmse: 24.1, mae: 17.8, r2: 0.86, label: 'Random Forest',       color: '#3b82f6', desc: '200 arbres · features calculées · stats de cycles' },
  gb:   { rmse: 21.3, mae: 15.4, r2: 0.88, label: 'Gradient Boosting',   color: '#10b981', desc: "Arbres boostés · taux d'apprentissage 0.05" },
}

const AI_INSIGHTS = [
  { severity: 'critical', machine: 'Moteur EMT-22',          insight: 'Dégradation accélérée détectée. Confiance LSTM : 94.2 %, GRU : 93.8 %. Défaillance prédite sous 11 cycles. Intervention immédiate requise.',                         action: 'Planifier le remplacement du palier sous 7 jours.', model: 'LSTM' },
  { severity: 'warning',  machine: 'Compresseur K-12',        insight: 'Enveloppe de vibration à 1.87g — 24.7 % au-dessus du seuil. Gradient Boosting signale un déséquilibre rotor probable. RF confirme la tendance sur 8 cycles.',        action: "Inspecter l'équilibre impulseur et les jeux de paliers.", model: 'Gradient Boosting' },
  { severity: 'warning',  machine: 'Échangeur thermique HX-5', insight: 'Hausse de température de 12 °C en 6 h, au-delà du seuil modèle. Les quatre modèles (LSTM, GRU, RF, GB) prédisent un RUL < 35 jours.',                            action: "Vérifier le circuit de refroidissement et l'efficacité de l'échangeur.", model: 'Ensemble' },
  { severity: 'info',     machine: 'Turbine GTA-7',            insight: 'Actif dans les plages saines. LSTM projette 87 jours RUL, GRU 85 jours. Aucune anomalie sur 9 canaux capteurs. Maintenance planifiée alignée avec la prédiction.', action: 'Aucune action requise. Prochaine inspection le 15 mars.', model: 'LSTM' },
]

const MAINTENANCE_RECS = [
  { machine: 'Moteur EMT-22',          priority: 'Immediate', action: 'Remplacement palier principal',   dueDate: '2026-01-18', cost: '562 800 DZD', model: 'LSTM',             rul: 11 },
  { machine: 'Compresseur K-12',        priority: 'Urgent',    action: 'Inspection rotor et paliers',     dueDate: '2026-01-20', cost: '241 200 DZD', model: 'Gradient Boosting', rul: 34 },
  { machine: 'Échangeur thermique HX-5', priority: 'Soon',     action: 'Entretien circuit refroidissement', dueDate: '2026-01-25', cost: '127 300 DZD', model: 'Random Forest',   rul: 28 },
  { machine: 'Turbine GTA-7',            priority: 'Planned',  action: 'Inspection périodique des aubes', dueDate: '2026-03-15', cost: '321 600 DZD', model: 'LSTM',             rul: 87 },
]

export const SENSE_DEVICES = [
  { id: 'MS-01', machineId: 'GTA-07',  machineName: 'Turbine GTA-7',           lieu: 'Unité 1 – Station A', firmware: 'v2.4.1', statut: 'connecté' as const, capteurs: ['Température', 'Vibration', 'Pression'],  temp: 312, vib: 0.42, pression: 14.2, frequence: 100 },
  { id: 'MS-02', machineId: 'CMP-K12', machineName: 'Compresseur K-12',         lieu: 'Unité 2 – Station B', firmware: 'v2.4.1', statut: 'connecté' as const, capteurs: ['Température', 'Vibration', 'Pression'],  temp: 428, vib: 1.87, pression: 22.8, frequence: 100 },
  { id: 'MS-03', machineId: 'PMP-P04', machineName: 'Pompe P-4',                lieu: 'Unité 1 – Station C', firmware: 'v2.3.9', statut: 'connecté' as const, capteurs: ['Température', 'Vibration', 'Pression'],  temp: 195, vib: 0.61, pression: 8.7,  frequence: 100 },
  { id: 'MS-04', machineId: 'EMT-22',  machineName: 'Moteur EMT-22',            lieu: 'Unité 3 – Station D', firmware: 'v2.4.1', statut: 'connecté' as const, capteurs: ['Température', 'Vibration', 'Courant'],   temp: 521, vib: 3.24, pression: null, frequence: 100 },
  { id: 'MS-05', machineId: 'HX-05',   machineName: 'Échangeur thermique HX-5', lieu: 'Unité 2 – Station E', firmware: 'v2.4.0', statut: 'connecté' as const, capteurs: ['Température', 'Vibration', 'Pression'],  temp: 395, vib: 1.44, pression: 19.2, frequence: 100 },
]

const MACHINE_SENSOR_MAP: Record<string, string> = Object.fromEntries(
  SENSE_DEVICES.map(d => [d.machineId, d.id])
)

// ── Per-machine sensor thresholds (alert engine) ───────────────────────────────
// Calibrated to each machine's baseline so status & alerts are realistic.
// GTA-07 / PMP-P04 stay Normal under normal simulation.
// CMP-K12 / HX-05 sit in Warning territory.
// EMT-22 is persistently Critical on both temp and vibration.
const MACHINE_THRESHOLDS: Record<string, {
  temp: { warn: number, crit: number }
  vib:  { warn: number, crit: number }
  pres: { warn: number, crit: number } | null
}> = {
  'GTA-07':  { temp: { warn: 320, crit: 340 }, vib: { warn: 0.50, crit: 0.65 }, pres: { warn: 15.0, crit: 17.0 } },
  'CMP-K12': { temp: { warn: 420, crit: 460 }, vib: { warn: 1.50, crit: 2.00 }, pres: { warn: 22.0, crit: 25.0 } },
  'PMP-P04': { temp: { warn: 210, crit: 240 }, vib: { warn: 0.80, crit: 1.10 }, pres: { warn: 10.0, crit: 12.0 } },
  'EMT-22':  { temp: { warn: 480, crit: 510 }, vib: { warn: 2.80, crit: 3.10 }, pres: null },
  'HX-05':   { temp: { warn: 385, crit: 415 }, vib: { warn: 1.20, crit: 1.80 }, pres: { warn: 19.5, crit: 22.0 } },
}

/** Consecutive ticks above threshold before an alert fires */
const DEBOUNCE_TRIGGER = 3
/** Consecutive ticks below warning before an active alert resolves */
const DEBOUNCE_RESOLVE = 3

export type LiveAlert = {
  id: string
  severity: 'critical' | 'warning'
  machine: string
  machineId: string
  sensorId: string
  sensorType: 'Température' | 'Vibration' | 'Pression'
  rawValue: number
  formattedValue: string
  thresholdLabel: string
  /** Warning threshold value (formatted) */
  warnThresholdLabel: string
  /** Critical threshold value (formatted) */
  critThresholdLabel: string
  action: string
  timestamp: string
  status: 'active' | 'resolved'
  resolvedLabel?: string
  elapsedWhenTriggered: number
  /** Estimated RUL for the machine at time of alert */
  rul: number
  /** Probable root cause */
  causeProbable: string
  /** AI model confidence % */
  aiConfidence: number
  /** AI model used */
  aiModel: string
  /** Machine location */
  machineLocation: string
  /** Whether alert has been acknowledged */
  acknowledged?: boolean
}

export type AlertEngineState = {
  dynamicAlerts: LiveAlert[]
  totalActive: number
  criticalCount: number
  warningCount: number
  criticalMachineIds: Set<string>
  /** keyed by "${machineId}:temp" | "${machineId}:vib" | "${machineId}:pres" */
  sensorStatus: Record<string, 'normal' | 'warning' | 'critical'>
}

const SENSOR_ACTIONS: Record<string, Record<string, string>> = {
  'Température': {
    warning:  "Inspection planifiée — Vérifier la ventilation et les échangeurs de chaleur",
    critical: "Intervention immédiate — Risque de surchauffe · Arrêt préventif recommandé",
  },
  'Vibration': {
    warning:  "Inspection planifiée — Contrôler les roulements et l'alignement",
    critical: "Intervention immédiate — Déséquilibre critique · Risque de défaillance mécanique",
  },
  'Pression': {
    warning:  "Inspection planifiée — Vérifier le circuit hydraulique et les soupapes",
    critical: "Intervention immédiate — Pression anormale · Contrôler les soupapes de sécurité",
  },
}

// Pre-seeded alerts that reflect known initial machine states.
// These appear immediately on first render — no waiting for ticks.
const PRE_SEEDED_ALERTS: LiveAlert[] = [
  {
    id: 'EMT-22:temp',  severity: 'critical', machine: 'Moteur EMT-22', machineId: 'EMT-22',
    sensorId: 'MS-04', sensorType: 'Température', rawValue: 521, formattedValue: '521.0°C',
    thresholdLabel: 'Seuil critique dépassé : 510.0°C',
    warnThresholdLabel: '480.0°C', critThresholdLabel: '510.0°C',
    action: SENSOR_ACTIONS['Température'].critical, timestamp: '08:42', status: 'active', elapsedWhenTriggered: 0,
    rul: 11, causeProbable: "Dégradation du système de refroidissement — encrassement du circuit d'huile détecté sur 6 cycles consécutifs",
    aiConfidence: 94, aiModel: 'LSTM', machineLocation: 'Unité 3 – Station D',
  },
  {
    id: 'EMT-22:vib',   severity: 'critical', machine: 'Moteur EMT-22', machineId: 'EMT-22',
    sensorId: 'MS-04', sensorType: 'Vibration',   rawValue: 3.24, formattedValue: '3.24g',
    thresholdLabel: 'Seuil critique dépassé : 3.10g',
    warnThresholdLabel: '2.80g', critThresholdLabel: '3.10g',
    action: SENSOR_ACTIONS['Vibration'].critical, timestamp: '08:43', status: 'active', elapsedWhenTriggered: 0,
    rul: 11, causeProbable: 'Défaillance probable du palier principal — déséquilibre rotationnel confirmé par corrélation multi-capteurs',
    aiConfidence: 96, aiModel: 'LSTM', machineLocation: 'Unité 3 – Station D',
  },
  {
    id: 'CMP-K12:vib',  severity: 'warning',  machine: 'Compresseur K-12', machineId: 'CMP-K12',
    sensorId: 'MS-02', sensorType: 'Vibration',   rawValue: 1.87, formattedValue: '1.87g',
    thresholdLabel: "Seuil d'avertissement dépassé : 1.50g",
    warnThresholdLabel: '1.50g', critThresholdLabel: '2.00g',
    action: SENSOR_ACTIONS['Vibration'].warning, timestamp: '08:27', status: 'active', elapsedWhenTriggered: 0,
    rul: 34, causeProbable: 'Déséquilibre du rotor centrifuge — jeux de paliers supérieurs à la tolérance nominale (8 cycles)',
    aiConfidence: 88, aiModel: 'Gradient Boosting', machineLocation: 'Unité 2 – Station B',
  },
  {
    id: 'CMP-K12:temp', severity: 'warning',  machine: 'Compresseur K-12', machineId: 'CMP-K12',
    sensorId: 'MS-02', sensorType: 'Température', rawValue: 428, formattedValue: '428.0°C',
    thresholdLabel: "Seuil d'avertissement dépassé : 420.0°C",
    warnThresholdLabel: '420.0°C', critThresholdLabel: '460.0°C',
    action: SENSOR_ACTIONS['Température'].warning, timestamp: '08:20', status: 'active', elapsedWhenTriggered: 0,
    rul: 34, causeProbable: "Hausse de température liée à l'encrassement du filtre à air — dérive thermique +8°C/h sur 3 derniers cycles",
    aiConfidence: 85, aiModel: 'Random Forest', machineLocation: 'Unité 2 – Station B',
  },
  {
    id: 'HX-05:temp',   severity: 'warning',  machine: 'Échangeur thermique HX-5', machineId: 'HX-05',
    sensorId: 'MS-05', sensorType: 'Température', rawValue: 395, formattedValue: '395.0°C',
    thresholdLabel: "Seuil d'avertissement dépassé : 385.0°C",
    warnThresholdLabel: '385.0°C', critThresholdLabel: '415.0°C',
    action: SENSOR_ACTIONS['Température'].warning, timestamp: '07:45', status: 'active', elapsedWhenTriggered: 0,
    rul: 28, causeProbable: "Encrassement progressif des plaques de l'échangeur — baisse du coefficient d'échange thermique (−12% sur 24h)",
    aiConfidence: 91, aiModel: 'Ensemble (4 modèles)', machineLocation: 'Unité 2 – Station E',
  },
  {
    id: 'CMP-K12:pres',  severity: 'warning', machine: 'Compresseur K-12', machineId: 'CMP-K12',
    sensorId: 'MS-02', sensorType: 'Pression',    rawValue: 22.8, formattedValue: '22.8 bar',
    thresholdLabel: "Seuil d'avertissement dépassé : 22.0 bar",
    warnThresholdLabel: '22.0 bar', critThresholdLabel: '25.0 bar',
    action: SENSOR_ACTIONS['Pression'].warning, timestamp: '08:13', status: 'active', elapsedWhenTriggered: 0,
    rul: 34, causeProbable: 'Pression de refoulement élevée — restriction partielle du circuit hydraulique aval, soupape de régulation à vérifier',
    aiConfidence: 82, aiModel: 'GRU', machineLocation: 'Unité 2 – Station B',
  },
]

function sortAlerts(alerts: LiveAlert[]): LiveAlert[] {
  return [...alerts].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'active' ? -1 : 1
    const sOrd = { critical: 0, warning: 1 } as const
    return sOrd[a.severity] - sOrd[b.severity]
  })
}

function buildInitialEngineState(): AlertEngineState {
  const active  = PRE_SEEDED_ALERTS.filter(a => a.status === 'active')
  const crit    = active.filter(a => a.severity === 'critical')
  const warn    = active.filter(a => a.severity === 'warning')
  const sensorStatus: Record<string, 'normal' | 'warning' | 'critical'> = {}
  active.forEach(a => {
    const k = a.sensorType === 'Température' ? 'temp' : a.sensorType === 'Vibration' ? 'vib' : 'pres'
    sensorStatus[`${a.machineId}:${k}`] = a.severity
  })
  return {
    dynamicAlerts: sortAlerts(PRE_SEEDED_ALERTS),
    totalActive: active.length, criticalCount: crit.length, warningCount: warn.length,
    criticalMachineIds: new Set(crit.map(a => a.machineId)),
    sensorStatus,
  }
}

/**
 * useAlertEngine — single source of truth for threshold-driven alerts.
 * Debounces spurious spikes (DEBOUNCE_TRIGGER consecutive ticks before firing,
 * DEBOUNCE_RESOLVE ticks at normal before resolving).
 */
function useAlertEngine(): AlertEngineState {
  const live = useLiveData()

  const consecAboveRef = useRef<Record<string, number>>({})
  const consecBelowRef = useRef<Record<string, number>>({})
  const alertMapRef    = useRef<Map<string, LiveAlert>>(new Map())
  const seedDoneRef    = useRef(false)

  // Pre-seed on very first access — safe to mutate refs during render
  if (!seedDoneRef.current) {
    seedDoneRef.current = true
    PRE_SEEDED_ALERTS.forEach(a => {
      alertMapRef.current.set(a.id, { ...a })
      consecAboveRef.current[a.id] = DEBOUNCE_TRIGGER + 5  // already triggered
    })
  }

  const [state, setState] = useState<AlertEngineState>(buildInitialEngineState)

  useEffect(() => {
    const { machines, elapsed } = live
    if (elapsed === 0) return

    const newSensorStatus: Record<string, 'normal' | 'warning' | 'critical'> = {}
    let changed = false

    MACHINES_BASE.forEach(mb => {
      const mData  = machines[mb.id]
      if (!mData) return
      const thresh = MACHINE_THRESHOLDS[mb.id]
      if (!thresh) return
      const machine  = MACHINES.find(m => m.id === mb.id)!
      const sensorId = MACHINE_SENSOR_MAP[mb.id] ?? '—'

      type Ch = {
        key: string; sensorType: LiveAlert['sensorType']
        value: number; warn: number; crit: number
        format: (v: number) => string
      }

      const channels: Ch[] = [
        {
          key: `${mb.id}:temp`, sensorType: 'Température',
          value: mData.temp, warn: thresh.temp.warn, crit: thresh.temp.crit,
          format: (v) => `${v.toFixed(1)}°C`,
        },
        {
          key: `${mb.id}:vib`, sensorType: 'Vibration',
          value: mData.vib, warn: thresh.vib.warn, crit: thresh.vib.crit,
          format: (v) => `${v.toFixed(2)}g`,
        },
        ...(thresh.pres && mData.pression !== null
          ? [{
              key: `${mb.id}:pres`, sensorType: 'Pression' as const,
              value: mData.pression as number, warn: thresh.pres.warn, crit: thresh.pres.crit,
              format: (v: number) => `${v.toFixed(1)} bar`,
            } as Ch]
          : []),
      ]

      channels.forEach(ch => {
        const { key, value, warn, crit, sensorType, format } = ch
        const isAboveCrit = value >= crit
        const isAboveWarn = value >= warn
        const level: 'critical' | 'warning' | 'normal' = isAboveCrit ? 'critical' : isAboveWarn ? 'warning' : 'normal'

        newSensorStatus[key] = level

        if (level !== 'normal') {
          consecAboveRef.current[key] = (consecAboveRef.current[key] ?? 0) + 1
          consecBelowRef.current[key] = 0
        } else {
          consecAboveRef.current[key] = 0
          consecBelowRef.current[key] = (consecBelowRef.current[key] ?? 0) + 1
        }

        const consecAbove = consecAboveRef.current[key] ?? 0
        const consecBelow = consecBelowRef.current[key] ?? 0
        const existing    = alertMapRef.current.get(key)

        if (consecAbove >= DEBOUNCE_TRIGGER) {
          const severity: LiveAlert['severity'] = isAboveCrit ? 'critical' : 'warning'
          const thresholdLabel = isAboveCrit
            ? `Seuil critique dépassé : ${format(crit)}`
            : `Seuil d'avertissement dépassé : ${format(warn)}`
          const action = SENSOR_ACTIONS[sensorType][severity === 'critical' ? 'critical' : 'warning']
          const machineData = MACHINES.find(m => m.id === mb.id)

          if (!existing || existing.status === 'resolved') {
            alertMapRef.current.set(key, {
              id: key, severity, machine: machine.name, machineId: mb.id, sensorId, sensorType,
              rawValue: value, formattedValue: format(value), thresholdLabel,
              warnThresholdLabel: format(warn), critThresholdLabel: format(crit),
              action,
              timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              status: 'active', elapsedWhenTriggered: elapsed,
              rul: machineData?.rul ?? 50,
              causeProbable: `Valeur anormale détectée sur ${sensorType} — ${severity === 'critical' ? 'seuil critique dépassé' : "seuil d'avertissement dépassé"} sur ${DEBOUNCE_TRIGGER}+ cycles consécutifs`,
              aiConfidence: severity === 'critical' ? 92 : 84,
              aiModel: machineData?.models?.bestModel ?? 'LSTM',
              machineLocation: machineData?.location ?? '—',
            })
            changed = true
          } else if (existing.status === 'active') {
            const newSeverity: LiveAlert['severity'] = isAboveCrit ? 'critical' : 'warning'
            if (existing.severity !== newSeverity) {
              // Severity escalated or de-escalated → update
              alertMapRef.current.set(key, { ...existing, severity: newSeverity, rawValue: value, formattedValue: format(value), thresholdLabel, action })
              changed = true
            } else {
              // Value changed but severity same — silent update (no re-render needed)
              existing.rawValue = value
              existing.formattedValue = format(value)
            }
          }
        } else if (consecBelow >= DEBOUNCE_RESOLVE && existing?.status === 'active') {
          alertMapRef.current.set(key, {
            ...existing, status: 'resolved',
            resolvedLabel: 'Retour à la normale — Stabilisé',
          })
          changed = true
        }
      })
    })

    // Always update sensorStatus so charts color correctly every tick.
    // Rebuild full state only when alert map actually changed (avoid object churn).
    if (changed) {
      const all    = [...alertMapRef.current.values()]
      const active = all.filter(a => a.status === 'active')
      const crit   = active.filter(a => a.severity === 'critical')
      const warn   = active.filter(a => a.severity === 'warning')
      setState({
        dynamicAlerts: sortAlerts(all),
        totalActive: active.length,
        criticalCount: crit.length,
        warningCount:  warn.length,
        criticalMachineIds: new Set(crit.map(a => a.machineId)),
        sensorStatus: newSensorStatus,
      })
    } else {
      // sensorStatus may have changed (values drifting) even without alert state change
      setState(prev => ({ ...prev, sensorStatus: newSensorStatus }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.elapsed])

  return state
}

// ── Alert engine context ───────────────────────────────────────────────────────

const AlertEngineContext = createContext<AlertEngineState>(buildInitialEngineState())

function useAlertsCtx(): AlertEngineState { return useContext(AlertEngineContext) }

const EQUIPEMENTS_CRITIQUES = [
  { id: 'EMT-22',  nom: 'Moteur EMT-22',            type: 'Moteur électrique',      statut: 'critique'      as const, rul: 11, risque: 'Élevé'    as const, action: 'Arrêt immédiat et remplacement du palier',   lieu: 'Unité 3 – Station D', temp: 521, vib: 3.24 },
  { id: 'HX-05',   nom: 'Échangeur thermique HX-5', type: 'Échangeur à plaques',    statut: 'avertissement' as const, rul: 28, risque: 'Élevé'    as const, action: 'Vérifier le circuit de refroidissement',      lieu: 'Unité 2 – Station E', temp: 395, vib: 1.44 },
  { id: 'CMP-K12', nom: 'Compresseur K-12',          type: 'Compresseur centrifuge', statut: 'avertissement' as const, rul: 34, risque: 'Moyen'    as const, action: "Inspecter l'équilibre du rotor",              lieu: 'Unité 2 – Station B', temp: 428, vib: 1.87 },
]

const AI_PREDICTIONS_FR = [
  { machine: 'Moteur EMT-22',          modele: 'LSTM',                 confiance: 94, datePrevu: '2026-01-29', rul: 11, risque: 'Critique' as const },
  { machine: 'Échangeur thermique HX-5', modele: 'Ensemble (4 modèles)', confiance: 91, datePrevu: '2026-02-22', rul: 28, risque: 'Élevé'   as const },
  { machine: 'Compresseur K-12',        modele: 'Gradient Boosting',    confiance: 88, datePrevu: '2026-03-03', rul: 34, risque: 'Moyen'    as const },
  { machine: 'Pompe P-4',               modele: 'LSTM',                 confiance: 85, datePrevu: '2026-03-23', rul: 62, risque: 'Faible'   as const },
  { machine: 'Turbine GTA-7',           modele: 'Gradient Boosting',    confiance: 91, datePrevu: '2026-04-27', rul: 87, risque: 'Faible'   as const },
]

// Icon components referenced by value — JSX instantiated at render time, not module scope
const ACTIONS_RECOMMANDEES = [
  { priorite: 'Immédiate', machine: 'Moteur EMT-22',           action: 'Planifier remplacement du palier principal',           type: 'Remplacement', cout: '562 800 DZD', delai: "Aujourd'hui",  IconComp: Zap,           color: '#ef4444' },
  { priorite: 'Urgent',    machine: 'Compresseur K-12',         action: 'Inspecter équilibrage rotor et jeux de paliers',       type: 'Inspection',   cout: '241 200 DZD', delai: 'Dans 48h',     IconComp: AlertTriangle, color: '#f59e0b' },
  { priorite: 'Proche',    machine: 'Échangeur thermique HX-5', action: "Entretenir circuit de refroidissement et échangeur",   type: 'Maintenance',  cout: '127 300 DZD', delai: 'Cette semaine', IconComp: RefreshCw,    color: '#e8650a' },
  { priorite: 'Planifié',  machine: 'Turbine GTA-7',            action: 'Inspection périodique des aubes et des paliers',       type: 'Inspection',   cout: '321 600 DZD', delai: '15 mars 2026', IconComp: CheckCircle2,  color: '#3b82f6' },
]

// ── Utility generators ────────────────────────────────────────────────────────

function generateRULTrend(seed: number, length = 30): number[] {
  const safeSeed = isFinite(seed) ? seed : 2
  const pts: number[] = []
  let v = 100
  for (let i = 0; i < Math.max(length, 2); i++) {
    v -= (safeSeed % 3) + 1 + (i % 4 === 0 ? 2 : 0)
    pts.push(Math.max(0, v))
  }
  return pts
}

function generateSensorTrend(base: number, amplitude: number, length = 40): number[] {
  const safeBase = isFinite(base) ? base : 0
  const safeAmp  = isFinite(amplitude) ? amplitude : 1
  return Array.from({ length: Math.max(length, 2) }, (_, i) => {
    const wave  = Math.sin(i * 0.3) * safeAmp * 0.4
    const drift = i * safeAmp * 0.01
    return parseFloat((safeBase + wave + drift).toFixed(2))
  })
}

const MACHINE_RUL_DATA: Record<string, { actual: number[], lstm: number[], gru: number[], rf: number[], gb: number[] }> = {}
MACHINES.forEach((m, idx) => {
  const seed = idx + 2
  const actual = generateRULTrend(seed, 60)
  MACHINE_RUL_DATA[m.id] = {
    actual,
    lstm: actual.map((v, i) => Math.max(0, v + Math.sin(i * 0.4) * 2)),
    gru:  actual.map((v, i) => Math.max(0, v - 1 + Math.sin(i * 0.45) * 2.2)),
    rf:   actual.map((v, i) => Math.max(0, v - 4 + Math.sin(i * 0.5) * 3)),
    gb:   actual.map((v, i) => Math.max(0, v + 2 + Math.sin(i * 0.3) * 2.5)),
  }
})

const FLEET_STATUS_DATA = MACHINES.map(m => ({
  nom: m.name, id: m.id, rul: m.rul, health: m.health, lieu: m.location,
  sante: m.health === 'good' ? Math.floor(85 + m.rul * 0.1) : m.health === 'warning' ? Math.floor(45 + m.rul * 0.5) : Math.floor(15 + m.rul * 1.5),
  temp: m.temp, vib: m.vibration,
}))

const FLEET_HEALTH_HISTORY = [88, 87, 87, 86, 85, 85, 84, 83, 82, 82, 81, 80]
const COMPRESSOR_VIBE_HISTORY = generateSensorTrend(0.8, 1.0, 60)
const MOTOR_TEMP_HISTORY      = generateSensorTrend(390, 130, 60)
const TURBINE_RUL_HISTORY     = generateRULTrend(2, 60)

// ── UI sub-components ─────────────────────────────────────────────────────────

type ThresholdConfig = {
  warning: number   // value at which warning threshold line is drawn
  critical: number  // value at which critical threshold line is drawn
  /** true if "higher = worse" (temp, vib, pressure); false if "lower = worse" (RUL) */
  highIsBad?: boolean
}

/**
 * ThresholdChart — replaces Sparkline.
 * Draws a time-series line with:
 *   - Yellow dashed "Seuil avertissement" line
 *   - Red dashed "Seuil critique" line
 *   - Animated live dot at the last point
 *   - Line color reflects current status (green / yellow / red)
 *   - "Données en temps réel" badge
 */
function ThresholdChart({
  data: rawData, color, height = 60,
  thresholds, unit = '',
}: {
  data: number[]
  color: string
  height?: number
  thresholds?: ThresholdConfig
  unit?: string
}) {
  // ── Safety: strip NaN/Infinity, ensure at least 2 points so all math is valid ──
  const data = rawData.filter(v => typeof v === 'number' && isFinite(v))
  if (data.length < 2) {
    // Return a flat placeholder so nothing crashes while data is loading
    return (
      <svg width="100%" viewBox={`0 0 300 ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <line x1="0" y1={height / 2} x2="300" y2={height / 2} stroke={color} strokeWidth="1" strokeOpacity="0.3" strokeDasharray="4 3" />
      </svg>
    )
  }

  const W = 300
  // Leave vertical padding for threshold labels (top) and x-axis (bottom)
  const TOP = 16, BOTTOM = 4, LEFT = 0, RIGHT = 0
  const plotH = height - TOP - BOTTOM
  const plotW = W - LEFT - RIGHT
  const n = data.length

  // Extend Y range to always show both thresholds even if data is below them
  const allVals = [...data]
  if (thresholds) { allVals.push(thresholds.warning, thresholds.critical) }
  const rawMin = Math.min(...allVals)
  const rawMax = Math.max(...allVals)
  // Guard against identical min/max (flat line) so division is always safe
  const yMin = isFinite(rawMin) ? rawMin * 0.92 : 0
  const yMax = isFinite(rawMax) ? rawMax * 1.08 : 1
  const yRange = yMax - yMin || 1

  const toX = (i: number) => LEFT + (i / Math.max(n - 1, 1)) * plotW
  const toY = (v: number) => {
    const val = isFinite(v) ? v : yMin
    return TOP + plotH - ((val - yMin) / yRange) * plotH
  }

  // Build polyline points
  const pts = data.map((v, i) => `${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
  // Area fill path
  const areaPath =
    `M${toX(0).toFixed(1)},${(TOP + plotH).toFixed(1)} ` +
    data.map((v, i) => `L${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ') +
    ` L${toX(n - 1).toFixed(1)},${(TOP + plotH).toFixed(1)} Z`

  // Live dot — last point
  const lastX = toX(n - 1)
  const lastY = toY(data[n - 1])

  // Determine line/dot color from thresholds
  let activeColor = color
  if (thresholds) {
    const latest = data[n - 1]
    const highIsBad = thresholds.highIsBad !== false // default true
    if (highIsBad) {
      if (latest >= thresholds.critical) activeColor = '#ef4444'
      else if (latest >= thresholds.warning) activeColor = '#f59e0b'
      else activeColor = '#10b981'
    } else {
      // lower is worse (RUL)
      if (latest <= thresholds.critical) activeColor = '#ef4444'
      else if (latest <= thresholds.warning) activeColor = '#f59e0b'
      else activeColor = '#10b981'
    }
  }

  const gradId = `tchg-${activeColor.replace('#', '')}-${unit}`

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={activeColor} stopOpacity="0.12" />
          <stop offset="100%" stopColor={activeColor} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Threshold lines — warning (yellow dashed) */}
      {thresholds && (() => {
        const wY = toY(thresholds.warning)
        const cY = toY(thresholds.critical)
        return (
          <>
            {/* Warning line */}
            <line x1={LEFT} y1={wY} x2={W} y2={wY} stroke="#f59e0b" strokeWidth="1" strokeDasharray="5 3" />
            <text x={W - 2} y={wY - 2} textAnchor="end" fill="#f59e0b" fontSize="7" fontFamily="monospace" opacity="0.85">
              Avert. {thresholds.warning}{unit}
            </text>
            {/* Critical line */}
            <line x1={LEFT} y1={cY} x2={W} y2={cY} stroke="#ef4444" strokeWidth="1" strokeDasharray="5 3" />
            <text x={W - 2} y={cY - 2} textAnchor="end" fill="#ef4444" fontSize="7" fontFamily="monospace" opacity="0.85">
              Critique {thresholds.critical}{unit}
            </text>
          </>
        )
      })()}

      {/* Main data line */}
      <polyline points={pts} fill="none" stroke={activeColor} strokeWidth="1.5"
        strokeLinejoin="round" strokeLinecap="round"
        style={{ transition: 'stroke 0.7s ease' }} />

      {/* Live dot — outer ring + inner fill + animated pulse ring */}
      <circle cx={lastX} cy={lastY} r="5" fill={activeColor} opacity="0.15" />
      <circle cx={lastX} cy={lastY} r="3" fill={activeColor} stroke="#09090b" strokeWidth="1.5" />
    </svg>
  )
}

// Keep Sparkline as a thin wrapper around ThresholdChart for backward compat in Overview sparklines
function Sparkline({ data, color, height = 40 }: { data: number[], color: string, height?: number }) {
  return <ThresholdChart data={data} color={color} height={height} />
}

type RULChartData = { actual: number[], lstm: number[], gru: number[], rf: number[], gb: number[] }

function RULMultiLineChart({ data: rawData, height = 130 }: { data: RULChartData, height?: number }) {
  // Ensure every series has at least 2 valid points
  const safeSeries = (arr: number[]) => {
    const clean = (arr ?? []).filter(v => typeof v === 'number' && isFinite(v))
    return clean.length >= 2 ? clean : [0, 0]
  }
  const data: RULChartData = {
    actual: safeSeries(rawData.actual),
    lstm:   safeSeries(rawData.lstm),
    gru:    safeSeries(rawData.gru),
    rf:     safeSeries(rawData.rf),
    gb:     safeSeries(rawData.gb),
  }

  const LEFT = 38, BOTTOM = 22, RIGHT = 8, TOP = 8
  const W = 600, H = height
  const plotW = W - LEFT - RIGHT
  const plotH = H - TOP - BOTTOM
  const allVals = [...data.actual, ...data.lstm, ...data.gru, ...data.rf, ...data.gb].filter(isFinite)
  const rawMin = Math.min(...allVals)
  const rawMax = Math.max(...allVals)
  const yMin = Math.max(0, Math.floor((isFinite(rawMin) ? rawMin : 0) / 10) * 10)
  const yMax = Math.ceil((isFinite(rawMax) ? rawMax : 100) / 10) * 10
  const n = data.actual.length
  const toX = (i: number) => LEFT + (i / Math.max(n - 1, 1)) * plotW
  const toY = (v: number) => TOP + plotH - ((v - yMin) / (yMax - yMin || 1)) * plotH
  const line = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
  const yTicks = Array.from({ length: 5 }, (_, i) => yMin + ((yMax - yMin) / 4) * i)
  const xTicks = Array.from({ length: Math.floor((n - 1) / 10) + 1 }, (_, i) => i * 10).filter(v => v < n)
  const series = [
    { key: 'actual', color: '#3b82f6', dash: '',    label: 'RUL Réel',          width: 2 },
    { key: 'lstm',   color: '#e8650a', dash: '6 3', label: 'LSTM',              width: 1.5 },
    { key: 'gru',    color: '#a78bfa', dash: '6 3', label: 'GRU',               width: 1.5 },
    { key: 'rf',     color: '#71717a', dash: '3 2', label: 'Random Forest',     width: 1.5 },
    { key: 'gb',     color: '#10b981', dash: '3 2', label: 'Gradient Boosting', width: 1.5 },
  ]
  return (
    <div className="flex flex-col gap-3">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
        {yTicks.map(val => (
          <g key={val}>
            <line x1={LEFT} y1={toY(val)} x2={LEFT + plotW} y2={toY(val)} stroke="#1c1c1f" strokeWidth="1" />
            <text x={LEFT - 5} y={toY(val) + 3} textAnchor="end" fill="#3a3a3d" fontSize="9" fontFamily="monospace">{val}</text>
          </g>
        ))}
        {xTicks.map(idx => (
          <g key={idx}>
            <line x1={toX(idx)} y1={TOP} x2={toX(idx)} y2={TOP + plotH} stroke="#1c1c1f" strokeWidth="1" strokeDasharray="2 3" />
            <text x={toX(idx)} y={TOP + plotH + 14} textAnchor="middle" fill="#3a3a3d" fontSize="9" fontFamily="monospace">{idx}</text>
          </g>
        ))}
        <line x1={LEFT} y1={TOP} x2={LEFT} y2={TOP + plotH} stroke="#27272a" strokeWidth="1" />
        <line x1={LEFT} y1={TOP + plotH} x2={LEFT + plotW} y2={TOP + plotH} stroke="#27272a" strokeWidth="1" />
        <text x={10} y={TOP + plotH / 2} textAnchor="middle" fill="#52525b" fontSize="9" fontFamily="monospace" transform={`rotate(-90, 10, ${TOP + plotH / 2})`}>RUL (jours)</text>
        <text x={LEFT + plotW / 2} y={H - 2} textAnchor="middle" fill="#52525b" fontSize="9" fontFamily="monospace">Cycle opérationnel</text>
        {series.map(s => (
          <path key={s.key} d={line(data[s.key as keyof RULChartData])} fill="none" stroke={s.color} strokeWidth={s.width} strokeDasharray={s.dash} strokeLinejoin="round" strokeLinecap="round" />
        ))}
        {series.map(s => {
          const arr = data[s.key as keyof RULChartData]
          const lastV = arr[arr.length - 1]
          return <circle key={`dot-${s.key}`} cx={toX(arr.length - 1)} cy={toY(lastV)} r="3" fill={s.color} stroke="#09090b" strokeWidth="1" />
        })}
      </svg>
      <div className="flex items-center gap-5 flex-wrap pl-9">
        {series.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <svg width="20" height="8"><line x1="0" y1="4" x2="20" y2="4" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} /></svg>
            <span className="text-[10px] font-mono" style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ModelComparisonChart({ data: rawData }: { data: RULChartData }) {
  const safeSeries = (arr: number[]) => {
    const clean = (arr ?? []).filter(v => typeof v === 'number' && isFinite(v))
    return clean.length >= 2 ? clean : [0, 0]
  }
  const data: RULChartData = {
    actual: safeSeries(rawData.actual),
    lstm:   safeSeries(rawData.lstm),
    gru:    safeSeries(rawData.gru),
    rf:     safeSeries(rawData.rf),
    gb:     safeSeries(rawData.gb),
  }

  const W = 600, H = 110
  const allVals = [...data.actual, ...data.lstm, ...data.gru, ...data.rf, ...data.gb].filter(isFinite)
  const rawMin = Math.min(...allVals), rawMax = Math.max(...allVals)
  const min = isFinite(rawMin) ? rawMin : 0
  const max = isFinite(rawMax) ? rawMax : 100
  const toX = (i: number) => (i / Math.max(data.actual.length - 1, 1)) * W
  const toY = (v: number) => H - 8 - ((v - min) / (max - min || 1)) * (H - 16)
  const line = (arr: number[]) => arr.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
  const series = [
    { key: 'actual', color: '#3b82f6', dash: '',    label: 'RUL Réel', width: 2 },
    { key: 'lstm',   color: '#e8650a', dash: '5 3', label: 'LSTM',     width: 1.5 },
    { key: 'gru',    color: '#a78bfa', dash: '5 3', label: 'GRU',      width: 1.5 },
    { key: 'rf',     color: '#71717a', dash: '3 2', label: 'RF',       width: 1.5 },
    { key: 'gb',     color: '#10b981', dash: '3 2', label: 'GB',       width: 1.5 },
  ]
  return (
    <div className="flex flex-col gap-2">
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="overflow-visible">
        {[0.25, 0.5, 0.75, 1].map(t => (
          <line key={t} x1={0} y1={H - 8 - t * (H - 16)} x2={W} y2={H - 8 - t * (H - 16)} stroke="#1c1c1f" strokeWidth="1" />
        ))}
        {series.map(s => (
          <path key={s.key} d={line(data[s.key as keyof RULChartData])} fill="none" stroke={s.color} strokeWidth={s.width} strokeDasharray={s.dash} strokeLinejoin="round" />
        ))}
      </svg>
      <div className="flex items-center gap-4 flex-wrap">
        {series.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <svg width="18" height="6"><line x1="0" y1="3" x2="18" y2="3" stroke={s.color} strokeWidth="2" strokeDasharray={s.dash} /></svg>
            <span className="text-[10px] font-mono" style={{ color: s.color }}>{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RULGauge({ value, max = 125 }: { value: number, max?: number }) {
  const pct = Math.min(value / max, 1)
  const color = value > 60 ? '#10b981' : value > 25 ? '#f59e0b' : '#ef4444'
  const r = 44, cx = 56, cy = 56
  const circumference = Math.PI * r
  const dash = pct * circumference
  return (
    <svg width="112" height="68" viewBox="0 0 112 68">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#1c1c1f" strokeWidth="8" strokeLinecap="round" />
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
        strokeDasharray={`${dash} ${circumference}`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      <text x={cx} y={cy - 6} textAnchor="middle" fill="#fafafa" fontSize="18" fontWeight="700" fontFamily="monospace">{value}</text>
      <text x={cx} y={cy + 8}  textAnchor="middle" fill="#52525b" fontSize="8"  fontFamily="monospace">JOURS RUL</text>
    </svg>
  )
}

function KPICard({ label, value, delta, positive, icon, subtext, accent }: {
  label: string; value: string; delta: string; positive: boolean
  icon: React.ReactNode; subtext?: string; accent?: string
}) {
  const borderColor = accent ? `${accent}30` : '#1c1c1f'
  const iconBg = accent ? `${accent}12` : 'transparent'
  return (
    <div className="bg-[#0d0d0f] border rounded-sm p-4 flex flex-col gap-2 relative overflow-hidden min-h-[100px]" style={{ borderColor }}>
      {accent && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: accent }} />}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-0.5 flex-1 min-w-0">
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#52525b]">{label}</p>
          {subtext && <p className="text-[9px] font-mono text-[#3a3a3d] leading-tight">{subtext}</p>}
        </div>
        <div className="w-8 h-8 rounded-sm flex items-center justify-center shrink-0 ml-2" style={{ background: iconBg }}>
          <span style={{ color: accent ?? '#3a3a3d' }}>{icon}</span>
        </div>
      </div>
      <p className="text-2xl font-bold text-[#fafafa] tracking-tight font-mono tabular-nums transition-[color] duration-700">{value}</p>
      <div className="flex items-center gap-1">
        {positive ? <TrendingUp size={10} className="text-[#10b981]" /> : <TrendingDown size={10} className="text-[#ef4444]" />}
        <p className={`text-[10px] font-mono ${positive ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>{delta}</p>
      </div>
    </div>
  )
}

function MachineSelector({ value, onChange }: { value: string, onChange: (id: string) => void }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        className="appearance-none bg-[#111113] border border-[#27272a] text-[11px] font-mono text-[#a1a1aa] px-3 py-1.5 pr-7 rounded-sm cursor-pointer hover:border-[#3a3a3d] focus:outline-none focus:border-[#e8650a]/50 transition-colors">
        {MACHINES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#52525b] pointer-events-none" />
    </div>
  )
}

function SectionTitle({ icon, title, subtitle, badge }: { icon: React.ReactNode, title: string, subtitle?: string, badge?: string }) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-2.5">
        <div className="w-7 h-7 rounded-sm bg-[#18181b] border border-[#27272a] flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[#e8650a]">{icon}</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-[#e4e4e7]">{title}</p>
          {subtitle && <p className="text-[10px] font-mono text-[#52525b] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {badge && (
        <span className="text-[9px] font-mono uppercase tracking-widest text-[#52525b] bg-[#18181b] border border-[#27272a] px-2 py-1 rounded-sm">{badge}</span>
      )}
    </div>
  )
}

// ── Panels ────────────────────────────────────────────────────────────────────

function OverviewPanel({ onNavigateSense }: { onNavigateSense?: () => void }) {
  const live = useLiveData()
  const eng  = useAlertsCtx()

  return (
    <div className="flex flex-col gap-6">

      {/* Live data indicator banner — fixed height, no layout shift */}
      <div className="flex items-center gap-3 bg-[#10b981]/6 border border-[#10b981]/20 rounded-sm px-4 py-2.5 min-h-[38px]">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
        </span>
        <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-widest">Données en temps réel actives</span>
        <span className="text-[10px] font-mono text-[#3a3a3d] hidden sm:block">— Flux en direct · Latence 0.8s · 5 dispositifs Mainteligence Sense connectés</span>
        <span className="ml-auto text-[9px] font-mono text-[#52525b] shrink-0 w-36 text-right tabular-nums">
          Mise à jour il y a {live.syncSec}s
        </span>
      </div>

      {/* KPI cards — fixed heights, tabular-nums to prevent width jitter */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <KPICard label="Machines connectées" subtext="Machines surveillées en temps réel" value="5" delta="Parc complet en ligne" positive icon={<Cpu size={15} />} accent="#10b981" />
        <KPICard
          label="Alertes actives"
          subtext={eng.criticalCount > 0 ? `${eng.criticalCount} critique${eng.criticalCount > 1 ? 's' : ''} — intervention requise` : 'Aucune alerte critique active'}
          value={String(eng.totalActive)}
          delta={eng.criticalCount > 0 ? `${eng.criticalCount} critique · ${eng.warningCount} avertissement` : `${eng.warningCount} avertissement`}
          positive={false}
          icon={<AlertTriangle size={15} />}
          accent="#ef4444"
        />
        <KPICard label="Score de santé moyen" subtext="État global du parc industriel" value={`${live.healthScore}%`} delta={live.healthScore < 82 ? '↓ légère dégradation' : 'Stable — dans les normes'} positive={live.healthScore >= 82} icon={<Gauge size={15} />} accent="#f59e0b" />
        <KPICard label="Latence flux en direct" subtext="Flux en direct actif — TLS 1.3" value="0.8s" delta={`Synchro il y a ${live.syncSec}s`} positive icon={<Wifi size={15} />} accent="#3b82f6" />
      </div>

      {/* Mainteligence Sense banner */}
      <div className="bg-[#0d0d0f] border border-[#3b82f6]/25 rounded-sm overflow-hidden" style={{ boxShadow: '0 0 24px rgba(59,130,246,0.04)' }}>
        <div className="h-0.5 w-full bg-gradient-to-r from-[#3b82f6] via-[#6366f1] to-transparent" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-sm bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center shrink-0">
                <Radio size={16} className="text-[#3b82f6]" />
              </div>
              <div>
                <p className="text-[9px] font-mono uppercase tracking-widest text-[#3b82f6] mb-0.5">Dispositif IoT</p>
                <p className="text-sm font-bold text-[#fafafa]">Mainteligence Sense</p>
                <p className="text-[10px] font-mono text-[#52525b] mt-0.5">Acquisition de données industrielles en temps réel</p>
              </div>
            </div>
            <button
              onClick={onNavigateSense}
              className="shrink-0 flex items-center gap-1.5 text-[10px] font-mono text-[#3b82f6] border border-[#3b82f6]/25 bg-[#3b82f6]/8 px-3 py-1.5 rounded-sm hover:bg-[#3b82f6]/15 transition-colors">
              <Cpu size={10} />
              Voir les détails du dispositif
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-3 py-2.5">
              <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1.5">Statut</p>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]" />
                </span>
                <span className="text-[11px] font-bold font-mono text-[#10b981]">Connecté</span>
              </div>
            </div>
            <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-3 py-2.5">
              <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1.5">Capteurs actifs</p>
              <p className="text-[11px] font-bold font-mono text-[#fafafa]">
                {SENSE_DEVICES.filter(d => d.statut === 'connecté').length}
                <span className="text-[#52525b] font-normal"> / {SENSE_DEVICES.length}</span>
              </p>
            </div>
            <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-3 py-2.5">
              <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1.5">Transmission</p>
              <div className="flex items-center gap-1.5 mb-0.5">
                {/* Blinking live indicator */}
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]" />
                </span>
                <p className="text-[11px] font-bold font-mono text-[#10b981]">Active</p>
              </div>
              <p className="text-[8px] font-mono text-[#3a3a3d]">Mise à jour en continu</p>
            </div>
            <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-3 py-2.5">
              <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1.5">Dernière mise à jour</p>
              <p className="text-[11px] font-bold font-mono text-[#a1a1aa] tabular-nums">il y a {live.syncSec}s</p>
            </div>
          </div>
        </div>
      </div>

      {/* Critical equipment */}
      <div className="bg-[#0d0d0f] border border-[#ef4444]/30 rounded-sm overflow-hidden" style={{ boxShadow: '0 0 30px rgba(239,68,68,0.06)' }}>
        <div className="h-0.5 w-full bg-gradient-to-r from-[#ef4444] via-[#e8650a] to-transparent" />
        <div className="p-4">
          <SectionTitle icon={<AlertTriangle size={13} />} title="Equipements critiques" subtitle="Machines nécessitant une intervention immédiate ou planifiée" badge="LIVE" />
          <div className="flex flex-col gap-3">
            {EQUIPEMENTS_CRITIQUES.map((eq) => {
              const isCrit = eq.statut === 'critique'
              const borderCol = isCrit ? '#ef444430' : '#f59e0b25'
              const bgCol = isCrit ? 'rgba(239,68,68,0.05)' : 'rgba(245,158,11,0.04)'
              const labelCol = isCrit ? '#ef4444' : '#f59e0b'
              const statutLabel = isCrit ? 'Critique' : 'Avertissement'
              return (
                <div key={eq.id} className="rounded-sm border p-3.5" style={{ background: bgCol, borderColor: borderCol }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[9px] font-mono text-[#3a3a3d] uppercase tracking-widest">{eq.id}</span>
                        <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm font-bold" style={{ color: labelCol, background: `${labelCol}15`, border: `1px solid ${labelCol}30` }}>{statutLabel}</span>
                      </div>
                      <p className="text-sm font-semibold text-[#fafafa]">{eq.nom}</p>
                      <p className="text-[10px] font-mono text-[#52525b]">{eq.type} · {eq.lieu}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[8px] font-mono text-[#3a3a3d] uppercase mb-0.5">RUL</p>
                        <p className="text-xl font-bold font-mono" style={{ color: labelCol }}>{eq.rul}j</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-mono text-[#3a3a3d] uppercase mb-0.5">Risque</p>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-sm" style={{ color: risqueColor[eq.risque], background: risqueBg[eq.risque] }}>{eq.risque}</span>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-2.5 py-2">
                      <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Température</p>
                      <p className="text-[11px] font-bold font-mono" style={{ color: eq.temp > 450 ? '#ef4444' : '#f59e0b' }}>{eq.temp}°C</p>
                    </div>
                    <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-2.5 py-2">
                      <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Vibration</p>
                      <p className="text-[11px] font-bold font-mono" style={{ color: eq.vib > 2.0 ? '#ef4444' : '#f59e0b' }}>{eq.vib}g</p>
                    </div>
                    <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-2.5 py-2">
                      <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Durée de vie restante</p>
                      <p className="text-[11px] font-bold font-mono" style={{ color: labelCol }}>{eq.rul} jours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[#111113] border border-[#1c1c1f] rounded-sm px-3 py-2">
                    <ChevronRight size={10} style={{ color: labelCol }} className="shrink-0" />
                    <p className="text-[10px] font-mono text-[#71717a]">
                      <span className="text-[#a1a1aa] font-semibold">Action recommandée :</span> {eq.action}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Fleet status + Active alerts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
          <SectionTitle icon={<Activity size={13} />} title="Statut du parc industriel" subtitle="Durée de vie restante (RUL) — Santé — Statut de chaque équipement" badge="5 ACTIFS" />
          <div className="flex flex-col gap-2">
            {FLEET_STATUS_DATA.map((m) => {
              const bar = hC[m.health]
              const liveM = live.machines[m.id]
              // Use live RUL if available, clamped 0–100 for the bar
              const liveRul = liveM ? liveM.rul : m.rul
              const pct = Math.min(Math.max(liveRul, 0), 100)
              return (
                <div key={m.id} className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3 mb-1.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-[11px] font-semibold text-[#e4e4e7] truncate">{m.nom}</p>
                        <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm shrink-0" style={{ color: hC[m.health], background: hBg[m.health] }}>{statutFr[m.health]}</span>
                        {MACHINE_SENSOR_MAP[m.id] && (
                          <span className="flex items-center gap-1 text-[8px] font-mono px-1.5 py-0.5 rounded-sm shrink-0 text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20">
                            <Radio size={7} />{MACHINE_SENSOR_MAP[m.id]}
                          </span>
                        )}
                      </div>
                      <p className="text-[9px] font-mono text-[#3a3a3d]">{m.id} · {m.lieu}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[7px] font-mono text-[#3a3a3d] uppercase">Santé</p>
                        <p className="text-[11px] font-bold font-mono tabular-nums" style={{ color: hC[m.health] }}>{m.sante}%</p>
                      </div>
                      <div className="text-right w-16">
                        <p className="text-[7px] font-mono text-[#3a3a3d] uppercase">RUL</p>
                        <p className="text-[11px] font-bold font-mono tabular-nums" style={{ color: hC[m.health] }}>{liveRul.toFixed(1)}j</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-[#1a1a1d] rounded-full overflow-hidden">
                      {/* transition-[width] gives smooth slow movement without colour flash */}
                      <div className="h-full rounded-full transition-[width] duration-[2000ms] ease-in-out" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${bar}88, ${bar})` }} />
                    </div>
                    <span className="text-[9px] font-mono text-[#3a3a3d] w-12 text-right tabular-nums">{pct.toFixed(0)}%</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
          <SectionTitle
            icon={<Bell size={13} />}
            title="Alertes actives"
            subtitle="Notifications en temps réel"
            badge={`${eng.totalActive} ACTIVES`}
          />
          <div className="flex flex-col gap-2">
            {/* Show top 4 active alerts from the engine; fall back to static list if engine is empty */}
            {(eng.dynamicAlerts.filter(a => a.status === 'active').slice(0, 4)).map((a) => (
              <div key={a.id} className="p-2.5 rounded-sm border" style={{ background: sBg[a.severity], borderColor: `${sC[a.severity]}20` }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="relative flex h-1.5 w-1.5 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: sC[a.severity] }} />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: sC[a.severity] }} />
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider font-bold" style={{ color: sC[a.severity] }}>
                    {a.severity === 'critical' ? 'Critique' : 'Avertissement'}
                  </span>
                  <span className="ml-auto text-[9px] font-mono text-[#3a3a3d]">{a.timestamp}</span>
                </div>
                <p className="text-[11px] font-semibold text-[#a1a1aa]">{a.machine}</p>
                <p className="text-[10px] text-[#52525b] leading-relaxed mt-0.5">
                  {a.sensorType} · {a.thresholdLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
        <SectionTitle icon={<Brain size={13} />} title="Prédictions IA — Défaillances prévues" subtitle="Basé sur 4 modèles : LSTM, GRU, Random Forest, Gradient Boosting" />
        <div className="overflow-x-auto">
          <table className="w-full text-[10px] font-mono border-collapse">
            <thead>
              <tr className="border-b border-[#1c1c1f]">
                {['Machine', 'Date de défaillance prévue', 'RUL (jours)', 'Modèle utilisé', 'Confiance', 'Niveau de risque'].map(h => (
                  <th key={h} className="text-left text-[9px] uppercase tracking-widest text-[#3a3a3d] pb-2 pr-4 font-normal">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AI_PREDICTIONS_FR.map((p, i) => (
                <tr key={i} className="border-b border-[#111113] hover:bg-[#111113] transition-colors">
                  <td className="py-2.5 pr-4"><p className="text-[11px] font-semibold text-[#e4e4e7]">{p.machine}</p></td>
                  <td className="py-2.5 pr-4 text-[#71717a]">{p.datePrevu}</td>
                  <td className="py-2.5 pr-4"><span className="font-bold" style={{ color: p.rul < 15 ? '#ef4444' : p.rul < 40 ? '#f59e0b' : '#10b981' }}>{p.rul}j</span></td>
                  <td className="py-2.5 pr-4 text-[#52525b]">{p.modele}</td>
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-[#1a1a1d] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#e8650a]" style={{ width: `${p.confiance}%` }} />
                      </div>
                      <span className="text-[#a1a1aa] font-bold">{p.confiance}%</span>
                    </div>
                  </td>
                  <td className="py-2.5">
                    <span className="text-[9px] font-mono uppercase px-2 py-1 rounded-sm font-bold" style={{ color: risqueColor[p.risque], background: risqueBg[p.risque], border: `1px solid ${risqueColor[p.risque]}25` }}>{p.risque}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommended actions */}
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
        <SectionTitle icon={<Lightbulb size={13} />} title="Actions recommandées" subtitle="Générées par les modèles IA — classées par priorité" />
        <div className="flex flex-col gap-2">
          {ACTIONS_RECOMMANDEES.map((a, i) => {
            const AI = a.IconComp
            return (
            <div key={i} className="flex items-center gap-4 bg-[#111113] border border-[#1c1c1f] rounded-sm px-4 py-3 hover:border-[#27272a] transition-colors">
              <div className="w-6 h-6 rounded-sm flex items-center justify-center shrink-0" style={{ background: `${a.color}15`, border: `1px solid ${a.color}30` }}>
                <span style={{ color: a.color }}><AI size={12} /></span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-semibold text-[#a1a1aa] truncate">{a.action}</p>
                <p className="text-[9px] font-mono text-[#3a3a3d]">{a.machine} · {a.type}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right hidden md:block">
                  <p className="text-[8px] font-mono text-[#3a3a3d] uppercase">Coût estimé</p>
                  <p className="text-[10px] font-mono text-[#71717a]">{a.cout}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] font-mono text-[#3a3a3d] uppercase">Délai</p>
                  <p className="text-[10px] font-mono font-semibold" style={{ color: a.color }}>{a.delai}</p>
                </div>
                <span className="text-[8px] font-mono uppercase px-2 py-1 rounded-sm font-bold shrink-0" style={{ color: a.color, background: `${a.color}12`, border: `1px solid ${a.color}25` }}>{a.priorite}</span>
              </div>
            </div>
            )
          })}
        </div>
      </div>

      {/* Trend sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {[
          { label: 'Vibration — Compresseur K-12',  sousTitre: 'Seuil dépassé : 1.87g',       value: '1.87g',    data: COMPRESSOR_VIBE_HISTORY,        color: '#f59e0b' },
          { label: 'Température — Moteur EMT-22',  sousTitre: 'Dérive +130°C vs référence',   value: '521°C',    data: MOTOR_TEMP_HISTORY,             color: '#ef4444' },
          { label: 'RUL moyen du parc',             sousTitre: 'Tendance sur 30 cycles',       value: '58 jours', data: TURBINE_RUL_HISTORY.slice(-30), color: '#e8650a' },
        ].map((s) => (
          <div key={s.label} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
            <div className="flex items-center justify-between mb-0.5">
              <p className="text-[11px] font-semibold text-[#a1a1aa] truncate">{s.label}</p>
              <span className="text-xs font-mono font-bold ml-2 shrink-0" style={{ color: s.color }}>{s.value}</span>
            </div>
            <p className="text-[9px] font-mono text-[#3a3a3d] mb-3">{s.sousTitre}</p>
            {/* Fixed height prevents layout shifts when data updates */}
            <div style={{ height: 44, flexShrink: 0 }}>
              <Sparkline data={s.data} color={s.color} height={44} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AssetsPanel() {
  const [selected, setSelected] = useState<typeof MACHINES[0] | null>(null)
  return (
    <div className="flex flex-col xl:flex-row gap-4 h-full">
      <div className="flex-1 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1c1c1f]">
          <p className="text-xs font-semibold text-[#e4e4e7]">Registre des actifs</p>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b] hover:text-[#a1a1aa] transition-colors border border-[#27272a] px-2 py-1 rounded-sm"><Filter size={10} /> Filtrer</button>
            <button className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b] hover:text-[#a1a1aa] transition-colors border border-[#27272a] px-2 py-1 rounded-sm"><Download size={10} /> Exporter</button>
          </div>
        </div>
        <div className="grid text-[10px] font-mono uppercase tracking-widest text-[#3a3a3d] px-4 py-2 border-b border-[#111113]"
          style={{ gridTemplateColumns: '1.6fr 1.2fr 0.7fr 0.7fr 0.7fr 0.7fr 1fr 0.9fr' }}>
          {['Actif ID', 'Type', 'RUL', 'Temp', 'Vibration', 'Disponib.', 'Meilleur modèle', 'Statut'].map(h => <span key={h}>{h}</span>)}
        </div>
        {MACHINES.map((m) => (
          <button key={m.id} onClick={() => setSelected(selected?.id === m.id ? null : m)}
            className={`w-full grid px-4 py-3 border-b border-[#0d0d0f] text-left transition-all hover:bg-[#111113] ${selected?.id === m.id ? 'bg-[#111113] border-l-2 border-l-[#e8650a]' : ''}`}
            style={{ gridTemplateColumns: '1.6fr 1.2fr 0.7fr 0.7fr 0.7fr 0.7fr 1fr 0.9fr' }}>
            <div>
              <p className="text-xs font-medium text-[#e4e4e7]">{m.name}</p>
              <p className="text-[10px] font-mono text-[#3a3a3d]">{m.id}</p>
            </div>
            <span className="text-[11px] text-[#71717a] self-center">{m.type}</span>
            <div className="flex items-center gap-1.5 self-center">
              <div className="h-1 w-10 bg-[#1c1c1f] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(m.rul, 100)}%`, background: hC[m.health] }} />
              </div>
              <span className="text-[11px] font-mono text-[#a1a1aa]">{m.rul}j</span>
            </div>
            <span className="text-[11px] font-mono text-[#71717a] self-center">{m.temp}°C</span>
            <span className="text-[11px] font-mono text-[#71717a] self-center">{m.vibration}g</span>
            <span className="text-[11px] font-mono self-center" style={{ color: m.uptime > 95 ? '#10b981' : m.uptime > 88 ? '#f59e0b' : '#ef4444' }}>{m.uptime}%</span>
            <span className="text-[10px] font-mono self-center text-[#52525b] truncate">{m.models.bestModel}</span>
            <span className="inline-flex items-center self-center text-[9px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-sm w-fit"
              style={{ color: hC[m.health], background: hBg[m.health] }}>{statutFr[m.health]}</span>
          </button>
        ))}
      </div>
      {selected && (
        <div className="w-full xl:w-72 shrink-0 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4 flex flex-col gap-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-[#fafafa]">{selected.name}</p>
              <p className="text-[10px] font-mono text-[#52525b]">{selected.id} · {selected.location}</p>
            </div>
            <span className="text-[9px] font-mono uppercase px-2 py-1 rounded-sm" style={{ color: hC[selected.health], background: hBg[selected.health] }}>{statutFr[selected.health]}</span>
          </div>
          <div className="flex justify-center"><RULGauge value={selected.rul} /></div>
          <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2">Prédictions modèles</p>
            {[
              { label: 'LSTM',              val: selected.models.lstm, color: '#e8650a' },
              { label: 'GRU',               val: selected.models.gru,  color: '#a78bfa' },
              { label: 'Random Forest',     val: selected.models.rf,   color: '#3b82f6' },
              { label: 'Gradient Boosting', val: selected.models.gb,   color: '#10b981' },
            ].map(mm => (
              <div key={mm.label} className="flex items-center justify-between text-[10px] font-mono py-1">
                <span style={{ color: mm.color }}>{mm.label}</span>
                <span className="text-[#a1a1aa]">{mm.val}j</span>
              </div>
            ))}
            <div className="mt-2 pt-2 border-t border-[#1c1c1f] flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#3a3a3d]">Recommandé</span>
              <span className="text-[#e8650a] font-semibold">{selected.models.bestModel}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Température',  value: `${selected.temp}°C`,   icon: <ThermometerSun size={12} /> },
              { label: 'Vibration',    value: `${selected.vibration}g`, icon: <Vibrate size={12} /> },
              { label: 'Pression',     value: selected.pressure ? `${selected.pressure} bar` : '—', icon: <Gauge size={12} /> },
              { label: 'Disponib.',    value: `${selected.uptime}%`,  icon: <Activity size={12} /> },
              { label: 'Cycles',       value: selected.cycles.toLocaleString(), icon: <RefreshCw size={12} /> },
              { label: 'Type',         value: selected.type,          icon: <Cpu size={12} /> },
            ].map((d) => (
              <div key={d.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-2.5">
                <div className="flex items-center gap-1 mb-1 text-[#52525b]">{d.icon}<span className="text-[9px] font-mono uppercase tracking-widest">{d.label}</span></div>
                <p className="text-xs font-semibold text-[#a1a1aa] truncate">{d.value}</p>
              </div>
            ))}
          </div>
          {MACHINE_SENSOR_MAP[selected.id] && (
            <div className="border border-[#3b82f6]/20 bg-[#3b82f6]/5 rounded-sm p-3">
              <div className="flex items-center gap-2 mb-1">
                <Radio size={11} className="text-[#3b82f6]" />
                <p className="text-[9px] font-mono text-[#3b82f6] uppercase tracking-widest">Capteur associé</p>
              </div>
              <p className="text-[11px] font-bold font-mono text-[#fafafa]">{MACHINE_SENSOR_MAP[selected.id]}</p>
              <p className="text-[9px] font-mono text-[#52525b] mt-0.5">Mainteligence Sense · 100 Hz · TLS 1.3</p>
            </div>
          )}
          <div className="border-t border-[#1c1c1f] pt-3 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#3a3a3d]">Dernière inspection</span>
              <span className="text-[#71717a]">{selected.lastInspection}</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#3a3a3d]">Prochaine maintenance</span>
              <span className={selected.health === 'critical' ? 'text-[#ef4444] font-semibold' : 'text-[#71717a]'}>{selected.nextMaintenance}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const FALLBACK_RUL_DATA = { actual: [0, 0], lstm: [0, 0], gru: [0, 0], rf: [0, 0], gb: [0, 0] }

function AnalyticsPanel() {
  const [machineId, setMachineId] = useState(MACHINES[0].id)
  const machine = MACHINES.find(m => m.id === machineId) ?? MACHINES[0]
  const chartData = MACHINE_RUL_DATA[machineId] ?? FALLBACK_RUL_DATA
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-[#e4e4e7]">Courbe de dégradation RUL — {machine.name}</p>
            <p className="text-[10px] font-mono text-[#52525b] mt-0.5">Réel vs prédit · fenêtre 60 cycles · 4 modèles</p>
          </div>
          <MachineSelector value={machineId} onChange={setMachineId} />
        </div>
        <div style={{ height: 148, flexShrink: 0 }}>
          <RULMultiLineChart data={chartData} height={110} />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#0d0d0f] border rounded-sm p-5" style={{ borderColor: `${hC[machine.health]}25` }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs font-semibold text-[#e4e4e7]">{machine.name}</p>
              <p className="text-[10px] font-mono text-[#3a3a3d]">{machine.id} · {machine.type}</p>
            </div>
            <span className="text-[9px] font-mono uppercase px-2 py-1 rounded-sm" style={{ color: hC[machine.health], background: hBg[machine.health] }}>{statutFr[machine.health]}</span>
          </div>
          <div className="flex items-center gap-6">
            <RULGauge value={machine.rul} />
            <div className="flex flex-col gap-1.5 flex-1">
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1">Prédictions modèles</p>
              {[
                { label: 'LSTM',             v: machine.models.lstm, c: '#e8650a' },
                { label: 'GRU',              v: machine.models.gru,  c: '#a78bfa' },
                { label: 'Random Forest',    v: machine.models.rf,   c: '#3b82f6' },
                { label: 'Gradient Boost',   v: machine.models.gb,   c: '#10b981' },
              ].map(x => (
                <div key={x.label} className="flex items-center justify-between bg-[#111113] rounded-sm px-2.5 py-1.5">
                  <span className="text-[10px] font-mono" style={{ color: x.c }}>{x.label}</span>
                  <span className="text-xs font-bold text-[#fafafa] font-mono">{x.v}j</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
          <p className="text-xs font-semibold text-[#e4e4e7] mb-4">Lectures capteurs en direct</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Température',     value: `${machine.temp}°C`,       warn: machine.temp > 400,      critical: machine.temp > 500 },
              { label: 'Vibration',       value: `${machine.vibration}g`,   warn: machine.vibration > 1.0, critical: machine.vibration > 2.5 },
              { label: 'Pression',        value: machine.pressure > 0 ? `${machine.pressure} bar` : '—', warn: false, critical: false },
              { label: 'Cycles',          value: machine.cycles.toLocaleString(), warn: false, critical: false },
              { label: 'Disponibilité',   value: `${machine.uptime}%`,      warn: machine.uptime < 90,     critical: machine.uptime < 85 },
              { label: 'Prochain entret.', value: machine.nextMaintenance,  warn: false, critical: machine.health === 'critical' },
            ].map(stat => {
              const color = stat.critical ? '#ef4444' : stat.warn ? '#f59e0b' : '#a1a1aa'
              return (
                <div key={stat.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-2.5">
                  <p className="text-[9px] font-mono text-[#3a3a3d] uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-xs font-bold font-mono" style={{ color }}>{stat.value}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function ModelsPanel() {
  const [machineId, setMachineId] = useState(MACHINES[0].id)
  const machine = MACHINES.find(m => m.id === machineId) ?? MACHINES[0]
  const chartData = MACHINE_RUL_DATA[machineId] ?? FALLBACK_RUL_DATA
  const models = Object.values(MODEL_METRICS)
  const best = models.reduce((a, b) => a.rmse < b.rmse ? a : b)
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
        <div className="flex items-center gap-2 mb-1">
          <GitCompare size={15} className="text-[#e8650a]" />
          <p className="text-xs font-semibold text-[#e4e4e7]">Comparaison de modèles — Jeu de test NASA FD001</p>
        </div>
        <p className="text-[10px] font-mono text-[#52525b]">Évalué sur 100 moteurs de test. 4 modèles : LSTM, GRU, Random Forest, Gradient Boosting. Métriques : RMSE, MAE, R².</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {Object.entries(MODEL_METRICS).map(([key, m]) => (
          <div key={key} className={`bg-[#0d0d0f] border rounded-sm p-4 relative overflow-hidden transition-all ${m.label === best.label ? 'border-[#e8650a]/40' : 'border-[#1c1c1f]'}`}>
            {m.label === best.label && (
              <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-mono text-[#e8650a] bg-[#e8650a]/10 border border-[#e8650a]/20 px-2 py-0.5 rounded-sm">
                <Target size={9} /> Meilleur
              </div>
            )}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-sm flex items-center justify-center" style={{ background: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                <Brain size={13} style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-xs font-bold text-[#fafafa]">{m.label}</p>
                <p className="text-[9px] font-mono text-[#3a3a3d] leading-tight">{m.desc}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 mb-3">
              {[{ label: 'RMSE', value: m.rmse.toFixed(1) }, { label: 'MAE', value: m.mae.toFixed(1) }, { label: 'R²', value: m.r2.toFixed(2) }].map(s => (
                <div key={s.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm p-2 text-center">
                  <p className="text-[9px] font-mono text-[#3a3a3d] mb-0.5">{s.label}</p>
                  <p className="text-sm font-bold font-mono" style={{ color: m.color }}>{s.value}</p>
                </div>
              ))}
            </div>
            <div className="h-1.5 bg-[#1c1c1f] rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${(best.rmse / m.rmse) * 100}%`, background: m.color }} />
            </div>
            <p className="text-[9px] font-mono text-[#3a3a3d] mt-1">
              {m.label === best.label ? 'Référence' : `+${((m.rmse / best.rmse - 1) * 100).toFixed(0)}% RMSE vs meilleur`}
            </p>
          </div>
        ))}
      </div>
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-5">
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-[#e4e4e7]">Superposition RUL — {machine.name}</p>
            <p className="text-[10px] font-mono text-[#52525b] mt-0.5">4 modèles vs RUL réel · fenêtre 60 cycles</p>
          </div>
          <MachineSelector value={machineId} onChange={setMachineId} />
        </div>
        <ModelComparisonChart data={chartData} />
      </div>
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-[#1c1c1f]">
          <p className="text-xs font-semibold text-[#e4e4e7]">Recommandation par actif</p>
        </div>
        <div className="grid text-[10px] font-mono uppercase tracking-widest text-[#3a3a3d] px-4 py-2 border-b border-[#111113]"
          style={{ gridTemplateColumns: '1.4fr 0.7fr 0.7fr 0.7fr 0.7fr 1fr' }}>
          {['Actif', 'LSTM', 'GRU', 'RF', 'GB', 'Recommandé'].map(h => <span key={h}>{h}</span>)}
        </div>
        {MACHINES.map(m => (
          <div key={m.id} className="grid px-4 py-2.5 border-b border-[#0d0d0f] text-[11px] font-mono hover:bg-[#111113] transition-colors"
            style={{ gridTemplateColumns: '1.4fr 0.7fr 0.7fr 0.7fr 0.7fr 1fr' }}>
            <span className="text-[#a1a1aa]">{m.name}</span>
            <span style={{ color: MODEL_METRICS.lstm.color }}>{m.models.lstm}j</span>
            <span style={{ color: MODEL_METRICS.gru.color }}>{m.models.gru}j</span>
            <span style={{ color: MODEL_METRICS.rf.color }}>{m.models.rf}j</span>
            <span style={{ color: MODEL_METRICS.gb.color }}>{m.models.gb}j</span>
            <span className="font-semibold" style={{ color: m.models.bestModel === 'LSTM' ? MODEL_METRICS.lstm.color : m.models.bestModel === 'GRU' ? MODEL_METRICS.gru.color : m.models.bestModel === 'Random Forest' ? MODEL_METRICS.rf.color : MODEL_METRICS.gb.color }}>{m.models.bestModel}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function InsightsPanel() {
  const severityOrder = ['critical', 'warning', 'info'] as const
  const sorted = [...AI_INSIGHTS].sort((a, b) => severityOrder.indexOf(a.severity as any) - severityOrder.indexOf(b.severity as any))
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 mb-1">
        <Brain size={15} className="text-[#e8650a]" />
        <p className="text-xs font-semibold text-[#e4e4e7]">Insights IA — Générés par la plateforme Mainteligence</p>
        <span className="ml-auto text-[9px] font-mono text-[#10b981] bg-[#10b981]/10 px-2 py-0.5 rounded-sm border border-[#10b981]/20">LIVE</span>
      </div>
      {sorted.map((ins, i) => (
        <div key={i} className="bg-[#0d0d0f] border rounded-sm p-5" style={{ borderColor: `${sC[ins.severity as keyof typeof sC]}25` }}>
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: sC[ins.severity as keyof typeof sC] }} />
              <span className="text-[10px] font-mono uppercase tracking-wider font-semibold" style={{ color: sC[ins.severity as keyof typeof sC] }}>
                {ins.severity === 'critical' ? 'Critique' : ins.severity === 'warning' ? 'Avertissement' : 'Info'}
              </span>
              <span className="text-xs font-semibold text-[#e4e4e7]">{ins.machine}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 text-[9px] font-mono text-[#52525b] bg-[#111113] border border-[#1c1c1f] px-2 py-0.5 rounded-sm">
              <Brain size={9} />{ins.model}
            </div>
          </div>
          <p className="text-xs text-[#a1a1aa] leading-relaxed mb-3">{ins.insight}</p>
          <div className="flex items-start gap-2 bg-[#111113] border border-[#1c1c1f] rounded-sm p-3">
            <Lightbulb size={12} className="text-[#e8650a] mt-0.5 shrink-0" />
            <p className="text-[11px] text-[#71717a]"><span className="text-[#a1a1aa] font-medium">Action recommandée :</span> {ins.action}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Alert drawer / fiche détaillée ───────────────────────────────────────────

function AlertDrawer({ alert, onClose, onNavigateMachine }: {
  alert: LiveAlert
  onClose: () => void
  onNavigateMachine: (id: string) => void
}) {
  const isResolved = alert.status === 'resolved'
  const isAcked    = alert.acknowledged
  const severityColor  = isResolved ? '#10b981' : sC[alert.severity]
  const severityBg     = isResolved ? 'rgba(16,185,129,0.08)' : sBg[alert.severity]
  const machine = MACHINES.find(m => m.id === alert.machineId)

  // Mini live chart for the affected sensor
  const live = useLiveData()
  const mData = live.machines[alert.machineId]
  const rawCurrent = alert.sensorType === 'Température' ? mData?.temp ?? alert.rawValue
    : alert.sensorType === 'Vibration' ? mData?.vib ?? alert.rawValue
    : mData?.pression ?? alert.rawValue
  const thresh = MACHINE_THRESHOLDS[alert.machineId]
  const threshConfig: ThresholdConfig | undefined = alert.sensorType === 'Température'
    ? { warning: thresh?.temp.warn ?? 0, critical: thresh?.temp.crit ?? 0, highIsBad: true }
    : alert.sensorType === 'Vibration'
    ? { warning: thresh?.vib.warn ?? 0, critical: thresh?.vib.crit ?? 0, highIsBad: true }
    : thresh?.pres
    ? { warning: thresh.pres.warn, critical: thresh.pres.crit, highIsBad: true }
    : undefined

  // Build a short trend from base
  const trendData = useMemo(() => {
    const base = alert.rawValue
    const amp  = alert.sensorType === 'Vibration' ? 0.15 : alert.sensorType === 'Pression' ? 0.8 : 12
    return generateSensorTrend(base, amp, 30)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert.id])

  const SIcon = alert.sensorType === 'Température' ? Thermometer
    : alert.sensorType === 'Vibration' ? Vibrate : Gauge

  return (
    <div className="fixed inset-0 z-50 flex justify-end" style={{ backdropFilter: 'blur(2px)', background: 'rgba(0,0,0,0.55)' }}>
      <div className="w-full max-w-lg h-full bg-[#09090b] border-l border-[#1c1c1f] flex flex-col overflow-hidden"
        style={{ boxShadow: '-8px 0 40px rgba(0,0,0,0.6)' }}>

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1c1c1f] shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              {!isResolved && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                  style={{ background: severityColor }} />
              )}
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: severityColor }} />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: severityColor }}>
              {isResolved ? 'Retour à la normale' : alert.severity === 'critical' ? 'Alerte Critique' : 'Avertissement'}
            </span>
            <span className="text-[9px] font-mono bg-[#18181b] border border-[#27272a] text-[#52525b] px-1.5 py-0.5 rounded-sm">
              {alert.sensorId}
            </span>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-sm text-[#52525b] hover:text-[#a1a1aa] hover:bg-[#18181b] transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Drawer body — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">

          {/* Machine identity */}
          <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-3.5">
            <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2">Machine concernée</p>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[#fafafa]">{alert.machine}</p>
                <p className="text-[10px] font-mono text-[#52525b] mt-0.5">{alert.machineLocation}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[8px] font-mono uppercase text-[#3a3a3d] mb-1">RUL estimé</p>
                <p className="text-base font-bold font-mono tabular-nums"
                  style={{ color: alert.rul < 15 ? '#ef4444' : alert.rul < 35 ? '#f59e0b' : '#10b981' }}>
                  {alert.rul} j
                </p>
              </div>
            </div>
            {machine && (
              <div className="flex items-center gap-4 mt-2.5 pt-2.5 border-t border-[#1c1c1f]">
                <div>
                  <p className="text-[8px] font-mono text-[#3a3a3d] uppercase mb-0.5">Type</p>
                  <p className="text-[10px] font-mono text-[#71717a]">{machine.type}</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono text-[#3a3a3d] uppercase mb-0.5">Cycles</p>
                  <p className="text-[10px] font-mono text-[#71717a] tabular-nums">{machine.cycles.toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-[8px] font-mono text-[#3a3a3d] uppercase mb-0.5">Disponibilité</p>
                  <p className="text-[10px] font-mono text-[#71717a]">{machine.uptime}%</p>
                </div>
              </div>
            )}
          </div>

          {/* Sensor reading + thresholds */}
          <div className="bg-[#0d0d0f] border rounded-sm p-3.5" style={{ borderColor: `${severityColor}25`, background: severityBg }}>
            <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2.5">Lecture capteur</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-sm flex items-center justify-center shrink-0"
                style={{ background: `${severityColor}18`, border: `1px solid ${severityColor}35` }}>
                <SIcon size={16} style={{ color: severityColor }} />
              </div>
              <div>
                <p className="text-[10px] font-mono text-[#52525b]">
                  {alert.sensorType} · Capteur {alert.sensorId}
                </p>
                <p className="text-xl font-bold font-mono tabular-nums leading-none mt-0.5" style={{ color: severityColor }}>
                  {rawCurrent != null && isFinite(rawCurrent)
                    ? alert.sensorType === 'Température' ? `${rawCurrent.toFixed(1)}°C`
                    : alert.sensorType === 'Vibration'  ? `${rawCurrent.toFixed(2)}g`
                    : `${rawCurrent.toFixed(1)} bar`
                    : alert.formattedValue}
                </p>
              </div>
            </div>
            {/* Threshold table */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Normal', value: '<', threshold: alert.warnThresholdLabel, color: '#10b981' },
                { label: 'Avertissement', value: '>', threshold: alert.warnThresholdLabel, color: '#f59e0b' },
                { label: 'Critique', value: '>', threshold: alert.critThresholdLabel, color: '#ef4444' },
              ].map(t => (
                <div key={t.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-2.5 py-2 text-center">
                  <p className="text-[8px] font-mono uppercase mb-1" style={{ color: t.color }}>{t.label}</p>
                  <p className="text-[11px] font-mono font-bold tabular-nums text-[#a1a1aa]">{t.threshold}</p>
                </div>
              ))}
            </div>
            <p className="text-[9px] font-mono text-[#52525b] mt-2">{alert.thresholdLabel}</p>
          </div>

          {/* Mini live chart */}
          <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-3.5">
            <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2">
              Tendance capteur — {alert.sensorType}
            </p>
            <div className="h-16">
              <ThresholdChart
                data={trendData}
                color={severityColor}
                height={64}
                thresholds={threshConfig}
                unit={alert.sensorType === 'Température' ? '°C' : alert.sensorType === 'Vibration' ? 'g' : 'bar'}
              />
            </div>
          </div>

          {/* Cause probable */}
          <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-3.5">
            <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2">Cause probable</p>
            <p className="text-[11px] font-mono leading-relaxed text-[#71717a]">{alert.causeProbable}</p>
          </div>

          {/* AI confidence */}
          <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-3.5">
            <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2.5">Diagnostic IA</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-[#52525b]">Modèle : {alert.aiModel}</span>
              <span className="text-[10px] font-mono font-bold" style={{ color: alert.aiConfidence >= 90 ? '#10b981' : '#f59e0b' }}>
                {alert.aiConfidence}% confiance
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#18181b] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${alert.aiConfidence}%`, background: alert.aiConfidence >= 90 ? '#10b981' : '#f59e0b' }} />
            </div>
          </div>

          {/* Recommended action */}
          <div className="rounded-sm p-3.5" style={{ background: `${severityColor}0a`, border: `1px solid ${severityColor}22` }}>
            <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1.5">Action recommandée</p>
            <p className="text-[11px] font-mono leading-relaxed" style={{ color: severityColor }}>{alert.action}</p>
          </div>

          {/* Timestamp */}
          <p className="text-[9px] font-mono text-[#3a3a3d] text-center">
            Alerte déclenchée à {alert.timestamp}
            {isAcked && ' · Acquittée'}
          </p>
        </div>

        {/* Drawer footer — action buttons */}
        <div className="px-5 py-4 border-t border-[#1c1c1f] shrink-0 flex flex-col gap-2">
          <button
            onClick={() => { onNavigateMachine(alert.machineId); onClose() }}
            className="w-full flex items-center justify-center gap-2 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#a1a1aa] hover:text-[#fafafa] text-xs font-medium py-2.5 rounded-sm transition-colors">
            <Eye size={13} /> Voir la machine
          </button>
          <div className="grid grid-cols-2 gap-2">
            <button className="flex items-center justify-center gap-1.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#71717a] hover:text-[#a1a1aa] text-[11px] font-mono py-2 rounded-sm transition-colors">
              <CalendarClock size={12} /> Planifier maintenance
            </button>
            <button className="flex items-center justify-center gap-1.5 bg-[#18181b] hover:bg-[#27272a] border border-[#27272a] text-[#71717a] hover:text-[#a1a1aa] text-[11px] font-mono py-2 rounded-sm transition-colors">
              <ClipboardList size={12} /> Ordre de travail
            </button>
          </div>
          {!isResolved && !isAcked && (
            <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-sm text-xs font-semibold transition-all"
              style={{ background: `${severityColor}18`, border: `1px solid ${severityColor}35`, color: severityColor }}>
              <CheckCircle2 size={13} /> Marquer comme traité
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main AlertsPanel ──────────────────────────────────────────────────────────

type AlertFilter = 'all' | 'critical' | 'warning' | 'resolved'
type AlertFilterItem = { key: AlertFilter, label: string, count?: number }

function AlertsPanel({ onNavigateSensors }: { onNavigateSensors?: () => void }) {
  const eng = useAlertsCtx()
  const [filter, setFilter] = useState<AlertFilter>('all')
  const [selectedAlert, setSelectedAlert] = useState<LiveAlert | null>(null)

  const filters: AlertFilterItem[] = [
    { key: 'all',      label: 'Toutes',              count: eng.dynamicAlerts.length },
    { key: 'critical', label: 'Critiques',            count: eng.criticalCount },
    { key: 'warning',  label: 'Avertissements',       count: eng.warningCount },
    { key: 'resolved', label: 'Retour à la normale',  count: eng.dynamicAlerts.filter(a => a.status === 'resolved').length },
  ]

  const displayed = eng.dynamicAlerts.filter(a => {
    if (filter === 'all')      return true
    if (filter === 'resolved') return a.status === 'resolved'
    return a.status === 'active' && a.severity === filter
  })

  // Sensor icon by type
  const SensorIcon = (type: LiveAlert['sensorType']) =>
    type === 'Température' ? Thermometer : type === 'Vibration' ? Vibrate : Gauge

  return (
    <div className="flex flex-col gap-4 relative">
      {/* Drawer overlay */}
      {selectedAlert && (
        <AlertDrawer
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onNavigateMachine={(id) => {
            // Navigate to sensors panel with the machine pre-selected
            onNavigateSensors?.()
          }}
        />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs font-semibold text-[#e4e4e7]">Gestion des alertes</p>
          <p className="text-[10px] font-mono text-[#52525b] mt-0.5">
            {eng.totalActive} active{eng.totalActive !== 1 ? 's' : ''} · {eng.criticalCount} critique{eng.criticalCount !== 1 ? 's' : ''} · {eng.warningCount} avertissement{eng.warningCount !== 1 ? 's' : ''}
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-mono text-[#52525b] bg-[#0d0d0f] border border-[#1c1c1f] px-2.5 py-1.5 rounded-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e8650a] animate-pulse" />
          Surveillance en temps réel
        </span>
      </div>

      {/* KPI summary row */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Total actives',    value: eng.totalActive,   color: '#ef4444',  bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.18)' },
          { label: 'Critiques',        value: eng.criticalCount, color: '#ef4444',  bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.18)' },
          { label: 'Avertissements',   value: eng.warningCount,  color: '#f59e0b',  bg: 'rgba(245,158,11,0.06)',  border: 'rgba(245,158,11,0.18)' },
          { label: 'Résolues',         value: eng.dynamicAlerts.filter(a => a.status === 'resolved').length, color: '#10b981', bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.18)' },
        ].map(k => (
          <div key={k.label} className="rounded-sm px-3 py-2.5 flex flex-col"
            style={{ background: k.bg, border: `1px solid ${k.border}` }}>
            <p className="text-[8px] font-mono uppercase tracking-widest mb-1.5" style={{ color: `${k.color}99` }}>{k.label}</p>
            <p className="text-2xl font-bold font-mono tabular-nums leading-none" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 border-b border-[#1c1c1f] pb-3">
        {filters.map(f => {
          const isActive = filter === f.key
          const dotColor = f.key === 'critical' ? '#ef4444' : f.key === 'warning' ? '#f59e0b' : f.key === 'resolved' ? '#10b981' : '#71717a'
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-1.5 rounded-sm border transition-all"
              style={{
                color:       isActive ? '#fafafa'  : '#52525b',
                background:  isActive ? '#18181b'  : 'transparent',
                borderColor: isActive ? '#27272a'  : '#1c1c1f',
              }}>
              {f.key !== 'all' && (
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
              )}
              {f.label}
              {f.count != null && f.count > 0 && (
                <span className="ml-0.5 text-[8px] px-1.5 py-0.5 rounded-sm tabular-nums"
                  style={{ background: isActive ? '#27272a' : '#111113', color: isActive ? '#a1a1aa' : '#3a3a3d' }}>
                  {f.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Alert list */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#3a3a3d]">
          <CheckCircle2 size={28} className="text-[#27272a]" />
          <p className="text-xs font-mono">Aucune alerte dans cette catégorie</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {displayed.map((a) => {
            const isResolved    = a.status === 'resolved'
            const borderColor   = isResolved ? '#1c1c1f' : `${sC[a.severity]}30`
            const bg            = isResolved ? '#0d0d0f' : sBg[a.severity]
            const severityColor = isResolved ? '#10b981' : sC[a.severity]
            const SI = SensorIcon(a.sensorType)

            return (
              <button
                key={a.id}
                onClick={() => setSelectedAlert(a)}
                className="text-left rounded-sm border p-4 transition-all hover:brightness-110 group w-full"
                style={{ borderColor, background: bg }}>

                {/* Row 1 — severity + machine + sensor + timestamp */}
                <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                  {/* Animated status dot */}
                  <span className="relative flex h-2 w-2 shrink-0">
                    {!isResolved && (
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50"
                        style={{ background: severityColor }} />
                    )}
                    <span className="relative inline-flex rounded-full h-2 w-2"
                      style={{ background: severityColor }} />
                  </span>

                  {/* Severity badge */}
                  <span className="text-[9px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm"
                    style={{ color: severityColor, background: `${severityColor}15`, border: `1px solid ${severityColor}25` }}>
                    {isResolved ? 'Retour à la normale' : a.severity === 'critical' ? 'Critique' : 'Avertissement'}
                  </span>

                  {/* Sensor type with icon */}
                  <span className="flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-[#18181b] border border-[#27272a] text-[#52525b]">
                    <SI size={10} /> {a.sensorType}
                  </span>

                  {/* Machine name */}
                  <span className="text-xs font-semibold text-[#e4e4e7]">{a.machine}</span>

                  {/* Sensor id */}
                  <span className="text-[9px] font-mono text-[#3a3a3d]">{a.sensorId}</span>

                  {/* Timestamp — right aligned */}
                  <span className="ml-auto flex items-center gap-1 text-[9px] font-mono text-[#3a3a3d] shrink-0">
                    <Clock size={9} /> {a.timestamp}
                  </span>
                </div>

                {/* Row 2 — current value + thresholds + RUL */}
                <div className="grid grid-cols-4 gap-2 mb-2.5">
                  <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-2 py-1.5 col-span-1">
                    <p className="text-[7px] font-mono uppercase text-[#3a3a3d] mb-0.5">Valeur actuelle</p>
                    <p className="text-sm font-bold font-mono tabular-nums" style={{ color: severityColor }}>
                      {a.formattedValue}
                    </p>
                  </div>
                  <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-2 py-1.5 col-span-1">
                    <p className="text-[7px] font-mono uppercase text-[#3a3a3d] mb-0.5">Seuil avert.</p>
                    <p className="text-sm font-bold font-mono tabular-nums text-[#f59e0b]">
                      {a.warnThresholdLabel}
                    </p>
                  </div>
                  <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-2 py-1.5 col-span-1">
                    <p className="text-[7px] font-mono uppercase text-[#3a3a3d] mb-0.5">Seuil critique</p>
                    <p className="text-sm font-bold font-mono tabular-nums text-[#ef4444]">
                      {a.critThresholdLabel}
                    </p>
                  </div>
                  <div className="bg-[#111113] border border-[#1c1c1f] rounded-sm px-2 py-1.5 col-span-1">
                    <p className="text-[7px] font-mono uppercase text-[#3a3a3d] mb-0.5">RUL estimé</p>
                    <p className="text-sm font-bold font-mono tabular-nums"
                      style={{ color: a.rul < 15 ? '#ef4444' : a.rul < 35 ? '#f59e0b' : '#10b981' }}>
                      {a.rul} j
                    </p>
                  </div>
                </div>

                {/* Row 3 — threshold breach label */}
                <p className="text-[10px] font-mono text-[#71717a] mb-2">
                  <span className="text-[#52525b]">Capteur {a.sensorId} ·</span> {a.thresholdLabel}
                </p>

                {/* Row 4 — action + AI confidence */}
                {!isResolved && (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-1.5 flex-1 min-w-0 bg-[#111113] border border-[#1c1c1f] rounded-sm px-2.5 py-2">
                      <ArrowRight size={10} className="mt-0.5 shrink-0" style={{ color: severityColor }} />
                      <p className="text-[10px] font-mono text-[#52525b] line-clamp-2">{a.action}</p>
                    </div>
                    <div className="shrink-0 text-right bg-[#111113] border border-[#1c1c1f] rounded-sm px-2.5 py-2">
                      <p className="text-[7px] font-mono uppercase text-[#3a3a3d] mb-0.5">IA · {a.aiModel}</p>
                      <p className="text-sm font-bold font-mono tabular-nums"
                        style={{ color: a.aiConfidence >= 90 ? '#10b981' : '#f59e0b' }}>
                        {a.aiConfidence}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Resolved note */}
                {isResolved && a.resolvedLabel && (
                  <p className="text-[10px] font-mono text-[#10b981] flex items-center gap-1.5">
                    <CheckCircle2 size={10} /> {a.resolvedLabel}
                  </p>
                )}

                {/* Action buttons row (visible on hover via group) */}
                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#1c1c1f] opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex items-center gap-1.5 text-[9px] font-mono px-2.5 py-1.5 rounded-sm bg-[#111113] border border-[#1c1c1f] text-[#52525b] hover:text-[#a1a1aa] hover:border-[#27272a] transition-colors"
                    onClick={e => { e.stopPropagation(); setSelectedAlert(a) }}>
                    <Eye size={10} /> Voir la machine
                  </button>
                  <button className="flex items-center gap-1.5 text-[9px] font-mono px-2.5 py-1.5 rounded-sm bg-[#111113] border border-[#1c1c1f] text-[#52525b] hover:text-[#a1a1aa] hover:border-[#27272a] transition-colors"
                    onClick={e => e.stopPropagation()}>
                    <CalendarClock size={10} /> Planifier maintenance
                  </button>
                  <button className="flex items-center gap-1.5 text-[9px] font-mono px-2.5 py-1.5 rounded-sm bg-[#111113] border border-[#1c1c1f] text-[#52525b] hover:text-[#a1a1aa] hover:border-[#27272a] transition-colors"
                    onClick={e => e.stopPropagation()}>
                    <ClipboardList size={10} /> Ordre de travail
                  </button>
                  {!isResolved && (
                    <button className="flex items-center gap-1.5 text-[9px] font-mono px-2.5 py-1.5 rounded-sm border transition-colors ml-auto"
                      style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)', color: '#10b981' }}
                      onClick={e => e.stopPropagation()}>
                      <CheckCircle2 size={10} /> Marquer traité
                    </button>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

function SensorsPanel() {
  const [machineId, setMachineId] = useState(MACHINES[0].id)
  const live = useLiveData()
  const eng  = useAlertsCtx()

  const machine  = MACHINES.find(m => m.id === machineId)!
  const liveM    = live.machines[machineId] ?? { temp: machine.temp, vib: machine.vibration, pression: machine.pressure, rul: machine.rul }
  const sensorId = MACHINE_SENSOR_MAP[machine.id]
  // Per-machine thresholds from alert engine — same values as the alert engine uses
  const mThresh  = MACHINE_THRESHOLDS[machineId] ?? { temp: { warn: 380, crit: 480 }, vib: { warn: 0.6, crit: 0.8 }, pres: { warn: 22, crit: 25 } }

  // Rolling history refs — one set per machine selection.
  // Initialise synchronously so the live-tick effect never sees an empty array.
  const m0 = MACHINES[0]
  const tempHistRef  = useRef<number[]>(generateSensorTrend(m0.temp, 20, 40))
  const vibHistRef   = useRef<number[]>(generateSensorTrend(m0.vibration, 0.5, 40))
  const rulHistRef   = useRef<number[]>([...(MACHINE_RUL_DATA[m0.id]?.actual.slice(-40) ?? generateSensorTrend(m0.rul, 5, 40))])
  const presHistRef  = useRef<number[]>(generateSensorTrend(m0.pressure || 8, 1.5, 40))
  const prevMachineRef = useRef(m0.id)   // ← starts with real id, not ''

  // Snapshot of history arrays for rendering — only updated when elapsed ticks
  const [snapshots, setSnapshots] = useState<{
    temp: number[]; vib: number[]; rul: number[]; pres: number[]
  }>(() => ({
    temp: [...tempHistRef.current],
    vib:  [...vibHistRef.current],
    rul:  [...rulHistRef.current],
    pres: [...presHistRef.current],
  }))

  // Reset history when machine changes (inside effect — no render-time mutation)
  useEffect(() => {
    if (prevMachineRef.current === machineId) return
    prevMachineRef.current = machineId
    const m = MACHINES.find(mx => mx.id === machineId) ?? MACHINES[0]
    tempHistRef.current = generateSensorTrend(m.temp || 100, 20, 40)
    vibHistRef.current  = generateSensorTrend(m.vibration || 0.5, 0.5, 40)
    rulHistRef.current  = [...(MACHINE_RUL_DATA[machineId]?.actual.slice(-40) ?? generateSensorTrend(m.rul || 50, 5, 40))]
    presHistRef.current = generateSensorTrend(m.pressure || 8, 1.5, 40)
    setSnapshots({
      temp: [...tempHistRef.current],
      vib:  [...vibHistRef.current],
      rul:  [...rulHistRef.current],
      pres: [...presHistRef.current],
    })
  }, [machineId])

  // Append new live point on each elapsed tick and publish stable snapshots.
  // Guard removed — prevMachineRef is always initialised now.
  useEffect(() => {
    const push = (arr: number[], val: number) => {
      const safe = isFinite(val) ? val : arr[arr.length - 1] ?? 0
      arr.push(safe)
      if (arr.length > 40) arr.shift()
    }
    push(tempHistRef.current, liveM.temp)
    push(vibHistRef.current,  liveM.vib)
    push(rulHistRef.current,  liveM.rul)
    push(presHistRef.current, liveM.pression ?? machine.pressure ?? 8)
    setSnapshots({
      temp: [...tempHistRef.current],
      vib:  [...vibHistRef.current],
      rul:  [...rulHistRef.current],
      pres: [...presHistRef.current],
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live.elapsed])

  // Sensor threshold configs — per-machine values, consistent with the alert engine
  const SENSOR_THRESHOLDS = {
    temp:  { warning: mThresh.temp.warn, critical: mThresh.temp.crit, highIsBad: true  as const, unit: '°C'  },
    vib:   { warning: mThresh.vib.warn,  critical: mThresh.vib.crit,  highIsBad: true  as const, unit: 'g'   },
    rul:   { warning: 30,                critical: 15,                 highIsBad: false as const, unit: 'j'   },
    pres:  {
      warning:  mThresh.pres?.warn  ?? 22,
      critical: mThresh.pres?.crit  ?? 25,
      highIsBad: true as const, unit: 'bar',
    },
  }

  // Status derived from alert engine (3 states: normal / warning / critical)
  const getEngineStatus = (key: string): 'normal' | 'warning' | 'critical' =>
    eng.sensorStatus[key] ?? 'normal'

  const engStatusColor = (st: 'normal' | 'warning' | 'critical') =>
    st === 'critical' ? '#ef4444' : st === 'warning' ? '#f59e0b' : '#10b981'

  const tempEngSt = getEngineStatus(`${machineId}:temp`)
  const vibEngSt  = getEngineStatus(`${machineId}:vib`)
  const presEngSt = getEngineStatus(`${machineId}:pres`)

  // For RUL use chart logic (not in alert engine)
  const rulSt: 'normal' | 'warning' | 'critical' =
    liveM.rul <= 15 ? 'critical' : liveM.rul <= 30 ? 'warning' : 'normal'

  type SensorCard = {
    label: string; color: string; data: number[]
    current: string; threshold: string
    thresholds: ThresholdConfig; unit: string
    engineKey: string | null
    engStatus: 'normal' | 'warning' | 'critical'
  }

  const sensorCards: SensorCard[] = [
    {
      label: 'Température',  color: engStatusColor(tempEngSt), data: snapshots.temp,
      current: `${liveM.temp.toFixed(1)}°C`,
      threshold: `Avert. ${SENSOR_THRESHOLDS.temp.warning}°C · Critique ${SENSOR_THRESHOLDS.temp.critical}°C`,
      thresholds: SENSOR_THRESHOLDS.temp, unit: '°C',
      engineKey: `${machineId}:temp`, engStatus: tempEngSt,
    },
    {
      label: 'Vibration',    color: engStatusColor(vibEngSt),  data: snapshots.vib,
      current: `${liveM.vib.toFixed(2)}g`,
      threshold: `Avert. ${SENSOR_THRESHOLDS.vib.warning}g · Critique ${SENSOR_THRESHOLDS.vib.critical}g`,
      thresholds: SENSOR_THRESHOLDS.vib, unit: 'g',
      engineKey: `${machineId}:vib`, engStatus: vibEngSt,
    },
    {
      label: 'Tendance RUL', color: engStatusColor(rulSt),     data: snapshots.rul,
      current: `${liveM.rul.toFixed(1)}j`,
      threshold: `Avert. < ${SENSOR_THRESHOLDS.rul.warning}j · Critique < ${SENSOR_THRESHOLDS.rul.critical}j`,
      thresholds: SENSOR_THRESHOLDS.rul, unit: 'j',
      engineKey: null, engStatus: rulSt,
    },
    {
      label: 'Pression',     color: liveM.pression !== null ? engStatusColor(presEngSt) : '#3b82f6', data: snapshots.pres,
      current: liveM.pression !== null ? `${liveM.pression.toFixed(1)} bar` : '—',
      threshold: `Avert. ${SENSOR_THRESHOLDS.pres.warning} bar · Critique ${SENSOR_THRESHOLDS.pres.critical} bar`,
      thresholds: SENSOR_THRESHOLDS.pres, unit: 'bar',
      engineKey: `${machineId}:pres`, engStatus: liveM.pression !== null ? presEngSt : 'normal',
    },
  ]

  return (
    <div className="flex flex-col gap-5">
      {/* Header — fixed height, no layout shift */}
      <div className="flex items-start justify-between gap-4 flex-wrap min-h-[44px]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
            </span>
            <p className="text-xs font-semibold text-[#e4e4e7]">Données en temps réel — Mainteligence Sense</p>
            <span className="text-[9px] font-mono text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 px-2 py-0.5 rounded-sm">LIVE</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-[10px] font-mono text-[#52525b]">{machine.id} · {machine.location}</p>
            {sensorId && (
              <span className="flex items-center gap-1 text-[8px] font-mono px-1.5 py-0.5 rounded-sm text-[#3b82f6] bg-[#3b82f6]/10 border border-[#3b82f6]/20">
                <Radio size={7} /> Source : {sensorId}
              </span>
            )}
            <span className="text-[9px] font-mono text-[#52525b] tabular-nums">· mise à jour il y a {live.syncSec}s</span>
          </div>
        </div>
        <MachineSelector value={machineId} onChange={setMachineId} />
      </div>

      {/* Legend — always visible, stable layout */}
      <div className="flex items-center gap-5 text-[9px] font-mono">
        <div className="flex items-center gap-1.5">
          <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 3" /></svg>
          <span className="text-[#f59e0b]">Seuil avertissement</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="6"><line x1="0" y1="3" x2="20" y2="3" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="5 3" /></svg>
          <span className="text-[#ef4444]">Seuil critique</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#10b981]" />
          </span>
          <span className="text-[#10b981]">Données en temps réel</span>
        </div>
      </div>

      {/* Sensor cards — fixed chart area (76px) prevents any resize during live updates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ minHeight: 400 }}>
        {sensorCards.map(s => {
          const statusColor = s.color
          const statusLabel =
            s.engStatus === 'critical' ? 'SEUIL CRITIQUE'
            : s.engStatus === 'warning' ? 'AVERTISSEMENT'
            : 'Normal'
          const borderColor =
            s.engStatus === 'critical' ? '#ef444430'
            : s.engStatus === 'warning' ? '#f59e0b25'
            : '#1c1c1f'

          return (
            <div key={s.label} className="bg-[#0d0d0f] border rounded-sm p-4 flex flex-col"
              style={{ borderColor, transition: 'border-color 0.7s ease' }}>
              {/* Row 1: label + 3-state status badge */}
              <div className="flex items-center justify-between h-5 mb-1">
                <p className="text-[10px] font-mono text-[#52525b]">{s.label}</p>
                <span
                  className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm shrink-0 font-bold"
                  style={{
                    color: statusColor,
                    background: `${statusColor}12`,
                    border: `1px solid ${statusColor}25`,
                    transition: 'color 0.7s ease, background 0.7s ease, border-color 0.7s ease',
                  }}>
                  {statusLabel}
                </span>
              </div>
              {/* Row 2: machine name + live value */}
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-[#e4e4e7] truncate">{machine.name}</p>
                <p className="text-base font-bold font-mono tabular-nums shrink-0 ml-2 transition-[color] duration-700" style={{ color: statusColor }}>
                  {s.current}
                </p>
              </div>
              {/* Row 3: threshold info + statut actuel */}
              <div className="flex items-center gap-3 mb-2">
                <p className="text-[8px] font-mono text-[#3a3a3d] flex-1 truncate">{s.threshold}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[8px] font-mono text-[#3a3a3d]">Statut :</span>
                  <span className="text-[8px] font-mono font-semibold" style={{ color: statusColor, transition: 'color 0.7s ease' }}>
                    {s.engStatus === 'critical' ? 'Critique' : s.engStatus === 'warning' ? 'Avertissement' : 'Normal'}
                  </span>
                </div>
              </div>
              {/* Chart area — FIXED height to prevent layout shifts */}
              <div style={{ height: 76, flexShrink: 0 }}>
                <ThresholdChart data={s.data} color={statusColor} height={76} thresholds={s.thresholds} unit={s.unit} />
              </div>
              {sensorId && <p className="text-[8px] font-mono text-[#27272a] mt-2">Source : {sensorId}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SensePanel() {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const live = useLiveData()
  const connectedCount = SENSE_DEVICES.filter(d => d.statut === 'connecté').length
  const sensorTypeColor: Record<string, string> = { 'Température': '#ef4444', 'Vibration': '#f59e0b', 'Pression': '#3b82f6', 'Courant': '#a78bfa' }

  return (
    <div className="flex flex-col gap-5">
      {/* Live banner — fixed height */}
      <div className="flex items-center gap-3 bg-[#10b981]/6 border border-[#10b981]/20 rounded-sm px-4 py-2.5 min-h-[38px]">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
        </span>
        <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-widest">Données en temps réel actives</span>
        <span className="text-[10px] font-mono text-[#3a3a3d] hidden sm:block">— Transmission active · {SENSE_DEVICES.length} capteurs en ligne</span>
        <span className="ml-auto text-[9px] font-mono text-[#52525b] shrink-0 tabular-nums w-28 text-right">Mise à jour il y a {live.syncSec}s</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Dispositifs connectés', value: `${connectedCount} / ${SENSE_DEVICES.length}`, color: '#10b981', sub: 'Tous en ligne' },
          { label: 'Canaux de capteurs',    value: '14',                                           color: '#3b82f6', sub: 'Temp, Vib, Pression, Courant' },
          { label: "Fréquence d'acquisition", value: '100 Hz',                                    color: '#e8650a', sub: 'Par dispositif' },
          { label: 'Dernière synchro',      value: `il y a ${live.syncSec}s`,                     color: '#10b981', sub: 'Transmission active' },
        ].map(k => (
          <div key={k.label} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
            <div className="h-0.5 w-8 mb-3 rounded-full" style={{ background: k.color }} />
            <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1.5">{k.label}</p>
            <p className="text-xl font-bold font-mono mb-0.5 tabular-nums" style={{ color: k.color }}>{k.value}</p>
            <p className="text-[9px] font-mono text-[#52525b]">{k.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
        <SectionTitle icon={<Radio size={13} />} title="Vue globale des dispositifs Mainteligence Sense" subtitle="Chaque dispositif est attaché à une machine du parc — données en temps réel" badge={`${connectedCount} ACTIFS`} />
        <div className="flex flex-col gap-2">
          {SENSE_DEVICES.map((d) => {
            const machine = MACHINES.find(m => m.id === d.machineId)
            const isSelected = selectedDevice === d.id
            const liveM = live.machines[d.machineId] ?? { temp: d.temp, vib: d.vib, pression: d.pression, rul: 0 }
            return (
              <button key={d.id} onClick={() => setSelectedDevice(isSelected ? null : d.id)}
                className="text-left rounded-sm border transition-colors duration-300"
                style={{ borderColor: isSelected ? '#3b82f650' : '#1c1c1f', background: isSelected ? 'rgba(59,130,246,0.04)' : '#111113' }}>
                <div className="px-4 py-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-sm bg-[#3b82f6]/10 border border-[#3b82f6]/20 flex items-center justify-center shrink-0">
                        <Radio size={13} className="text-[#3b82f6]" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="text-[11px] font-bold font-mono text-[#fafafa]">{d.id}</p>
                          <span className="flex items-center gap-1 text-[8px] font-mono px-1.5 py-0.5 rounded-sm text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20">
                            <span className="w-1 h-1 rounded-full bg-[#10b981] animate-pulse" /> Connecté
                          </span>
                          <span className="text-[8px] font-mono text-[#52525b]">fw {d.firmware}</span>
                        </div>
                        <p className="text-[10px] font-mono text-[#52525b]">
                          Attaché à : <span className="text-[#a1a1aa] font-semibold">{d.machineName}</span> · {d.lieu}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-right hidden md:block">
                        <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Température</p>
                        <p className="text-[11px] font-bold font-mono tabular-nums transition-[color] duration-700" style={{ color: liveM.temp > 450 ? '#ef4444' : '#f59e0b' }}>{liveM.temp.toFixed(1)}°C</p>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Vibration</p>
                        <p className="text-[11px] font-bold font-mono tabular-nums transition-[color] duration-700" style={{ color: liveM.vib > 2.0 ? '#ef4444' : liveM.vib > 1.0 ? '#f59e0b' : '#10b981' }}>{liveM.vib.toFixed(2)}g</p>
                      </div>
                      {/* Always render pression column (stable width) — show — when no sensor */}
                      <div className="text-right hidden md:block w-16">
                        <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Pression</p>
                        <p className="text-[11px] font-bold font-mono tabular-nums text-[#3b82f6]">
                          {liveM.pression !== null && liveM.pression !== undefined ? `${liveM.pression.toFixed(1)} bar` : '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[7px] font-mono text-[#3a3a3d] uppercase mb-0.5">Synchro</p>
                        <p className="text-[10px] font-mono text-[#10b981] tabular-nums">il y a {live.syncSec}s</p>
                      </div>
                      <ChevronRight size={12} className="text-[#3a3a3d] shrink-0" style={{ transform: isSelected ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </div>
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-[#1c1c1f]">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-3">
                          <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2">Machine associée</p>
                          {machine && (
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-sm flex items-center justify-center shrink-0" style={{ background: hBg[machine.health], border: `1px solid ${hC[machine.health]}30` }}>
                                <Cpu size={12} style={{ color: hC[machine.health] }} />
                              </div>
                              <div>
                                <p className="text-[11px] font-semibold text-[#e4e4e7]">{machine.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[8px] font-mono uppercase px-1.5 py-0.5 rounded-sm" style={{ color: hC[machine.health], background: hBg[machine.health] }}>{statutFr[machine.health]}</span>
                                  <span className="text-[9px] font-mono text-[#3a3a3d]">RUL : {machine.rul}j</span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="md:col-span-2 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-3">
                          <p className="text-[8px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-2">Canaux de capteurs actifs</p>
                          <div className="flex flex-wrap gap-1.5">
                            {d.capteurs.map(c => (
                              <span key={c} className="text-[9px] font-mono px-2 py-0.5 rounded-sm"
                                style={{ color: sensorTypeColor[c] ?? '#a1a1aa', background: `${sensorTypeColor[c] ?? '#a1a1aa'}12`, border: `1px solid ${sensorTypeColor[c] ?? '#a1a1aa'}25` }}>
                                {c}
                              </span>
                            ))}
                          </div>
                          <p className="text-[8px] font-mono text-[#3a3a3d] mt-2">Source : Mainteligence Sense · {d.frequence} Hz</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-4">
        <SectionTitle icon={<ThermometerSun size={13} />} title="Données en temps réel — Mainteligence Sense" subtitle="Toutes les lectures actives par type de capteur — source : dispositifs MS-01 à MS-05" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { label: 'Température', color: '#ef4444', thresh: '480°C', icon: <ThermometerSun size={12} className="text-[#ef4444]" />, getValue: (d: typeof SENSE_DEVICES[0]) => { const t = live.machines[d.machineId]?.temp ?? d.temp; return { val: `${t.toFixed(1)}°C`, warn: t > 480 ? '#ef4444' : t > 380 ? '#f59e0b' : '#10b981' } } },
            { label: 'Vibration',   color: '#f59e0b', thresh: '1.5g',  icon: <Vibrate size={12} className="text-[#f59e0b]" />,        getValue: (d: typeof SENSE_DEVICES[0]) => { const v = live.machines[d.machineId]?.vib  ?? d.vib;  return { val: `${v.toFixed(2)}g`,   warn: v > 2.0 ? '#ef4444' : v > 1.0 ? '#f59e0b' : '#10b981' } } },
            { label: 'Pression',    color: '#3b82f6', thresh: '25 bar', icon: <Gauge size={12} className="text-[#3b82f6]" />,          getValue: (d: typeof SENSE_DEVICES[0]) => { const p = live.machines[d.machineId]?.pression; return { val: p !== null && p !== undefined ? `${p.toFixed(1)} bar` : '—', warn: p === null || p === undefined ? '#3a3a3d' : p > 22 ? '#f59e0b' : '#3b82f6' } } },
          ].map(col => (
            <div key={col.label} className="bg-[#111113] border border-[#1c1c1f] rounded-sm overflow-hidden">
              <div className="h-0.5" style={{ background: col.color }} />
              <div className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  {col.icon}
                  <p className="text-[10px] font-semibold text-[#a1a1aa]">{col.label}</p>
                  <span className="ml-auto text-[8px] font-mono text-[#52525b]">Seuil : {col.thresh}</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  {SENSE_DEVICES.map(d => {
                    const { val, warn } = col.getValue(d)
                    return (
                      <div key={d.id} className="flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-[#52525b] w-10 shrink-0">{d.id}</span>
                          <span className="text-[#3a3a3d] truncate text-[9px]">{d.machineName}</span>
                        </div>
                        <span className="font-bold shrink-0 tabular-nums transition-[color] duration-700" style={{ color: warn }}>{val}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[9px] font-mono text-[#27272a] mt-3 text-center">Source : Mainteligence Sense MS-01 à MS-05 — Acquisition à 100 Hz — Transmission chiffrée TLS 1.3</p>
      </div>
    </div>
  )
}

function MaintenancePanel() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#e4e4e7]">Recommandations de maintenance</p>
          <p className="text-[10px] font-mono text-[#52525b] mt-0.5">Générées par IA — LSTM / GRU / RF / Gradient Boosting · Coûts en DZD</p>
        </div>
        <button className="flex items-center gap-1.5 text-[10px] font-mono text-[#52525b] hover:text-[#a1a1aa] border border-[#27272a] px-2 py-1 rounded-sm transition-colors"><Download size={10} /> Exporter</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Actions immédiates', value: '1',             color: '#ef4444' },
          { label: 'Coût total estimé',  value: '1 252 900 DZD', color: '#e8650a' },
          { label: 'Actifs concernés',   value: '4',             color: '#f59e0b' },
          { label: 'Délai moyen',        value: '18 jours',      color: '#3b82f6' },
        ].map(k => (
          <div key={k.label} className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm p-3">
            <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1">{k.label}</p>
            <p className="text-sm font-bold font-mono" style={{ color: k.color }}>{k.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm overflow-hidden">
        <div className="grid text-[10px] font-mono uppercase tracking-widest text-[#3a3a3d] px-4 py-2 border-b border-[#111113]"
          style={{ gridTemplateColumns: '1.3fr 1.8fr 0.5fr 0.7fr 1fr 0.8fr' }}>
          {['Machine', 'Action', 'RUL', 'Échéance', 'Coût estimé (DZD)', 'Priorité'].map(h => <span key={h}>{h}</span>)}
        </div>
        {MAINTENANCE_RECS.map((r, i) => (
          <div key={i} className="grid px-4 py-3 border-b border-[#0d0d0f] hover:bg-[#111113] transition-colors items-center"
            style={{ gridTemplateColumns: '1.3fr 1.8fr 0.5fr 0.7fr 1fr 0.8fr' }}>
            <span className="text-xs font-medium text-[#e4e4e7]">{r.machine}</span>
            <span className="text-[11px] text-[#71717a]">{r.action}</span>
            <span className="text-[11px] font-mono" style={{ color: r.rul < 20 ? '#ef4444' : r.rul < 40 ? '#f59e0b' : '#10b981' }}>{r.rul}j</span>
            <span className="text-[11px] font-mono text-[#71717a]">{r.dueDate}</span>
            <span className="text-[11px] font-mono text-[#a1a1aa]">{r.cost}</span>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-sm w-fit" style={{ color: prC[r.priority], background: `${prC[r.priority]}15` }}>{r.priority}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsPanel() {
  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <p className="text-xs font-semibold text-[#e4e4e7]">Paramètres de la plateforme</p>
      {[
        { label: 'Modèles de prédiction actifs',    value: 'LSTM, GRU, Random Forest, Gradient Boosting' },
        { label: 'Seuil critique RUL',              value: '15 jours' },
        { label: "Mode d'alerte",                   value: 'Email + Webhook' },
        { label: 'Politique de rétention des données', value: '24 mois' },
        { label: 'Mode de déploiement',             value: 'On-Premise (Air-Gapped)' },
        { label: 'Devise',                          value: 'Dinar Algérien (DZD)' },
        { label: 'Version de la plateforme',        value: 'Mainteligence Platform v2.5.0' },
      ].map(s => (
        <div key={s.label} className="flex items-center justify-between p-3 bg-[#0d0d0f] border border-[#1c1c1f] rounded-sm">
          <span className="text-xs text-[#71717a]">{s.label}</span>
          <span className="text-xs font-mono font-semibold text-[#a1a1aa]">{s.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────

// Icon components are rendered at call-site — no module-level JSX
const SIDEBAR_ITEMS = [
  { id: 'overview',    label: "Vue d'ensemble",       IconComp: LayoutDashboard },
  { id: 'assets',      label: "Parc d'actifs",        IconComp: Cpu },
  { id: 'analytics',   label: 'Analyse RUL',          IconComp: Activity },
  { id: 'models',      label: 'Comparaison IA',       IconComp: GitCompare },
  { id: 'insights',    label: 'Insights IA',          IconComp: Brain },
  { id: 'alerts',      label: 'Alertes',              IconComp: Bell, badge: 3 },
  { id: 'sensors',     label: 'Capteurs en direct',   IconComp: Wifi },
  { id: 'sense',       label: 'Mainteligence Sense',  IconComp: Radio },
  { id: 'maintenance', label: 'Maintenance',          IconComp: Zap },
  { id: 'settings',    label: 'Paramètres',           IconComp: Settings },
]

function DashboardSidebar({ active, setActive, mode }: { active: string, setActive: (s: string) => void, mode: 'demo' | 'client' }) {
  // sticky top-16 keeps sidebar pinned below the navbar during page scroll
  return (
    <aside className="w-56 shrink-0 bg-[#0d0d0f] border-r border-[#1c1c1f] flex flex-col sticky top-16 self-start min-h-[calc(100vh-64px)]">
      <div className="px-4 py-5 border-b border-[#1c1c1f]">
        <p className="text-[9px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-0.5">Espace de travail</p>
        <p className="text-xs font-semibold text-[#a1a1aa]">Usine Industrielle Alpha</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
          <span className="text-[10px] font-mono text-[#52525b]">5 actifs en ligne</span>
        </div>
      </div>
      {/* overflow: visible — no inner scrollbar on sidebar nav */}
      <nav className="flex-1 px-2 py-4 flex flex-col gap-0.5">
        {SIDEBAR_ITEMS.map((item) => {
          const I = item.IconComp
          return (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-sm text-left transition-all ${
              active === item.id ? 'bg-[#18181b] text-[#fafafa]' : 'text-[#71717a] hover:text-[#a1a1aa] hover:bg-[#111113]'
            }`}>
            <span className={active === item.id ? 'text-[#e8650a]' : ''}><I size={15} /></span>
            <span className="text-xs font-medium">{item.label}</span>
            {item.badge && (
              <span className="ml-auto text-[9px] font-mono bg-[#ef4444]/15 text-[#ef4444] px-1.5 py-0.5 rounded-sm">{item.badge}</span>
            )}
          </button>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-[#1c1c1f] space-y-2">
        {mode === 'demo' ? (
          <Link href="/contact" className="flex items-center gap-2 text-xs text-[#e8650a]/70 hover:text-[#e8650a] transition-colors">
            <Radio size={13} /> Demander un déploiement
          </Link>
        ) : (
          <Link href="/iot-demo" className="flex items-center gap-2 text-xs text-[#e8650a]/70 hover:text-[#e8650a] transition-colors">
            <Radio size={13} /> Démo IoT en direct
          </Link>
        )}
        <Link href="/" className="flex items-center gap-2 text-xs text-[#3a3a3d] hover:text-[#71717a] transition-colors">
          <LogOut size={13} /> Retour au site
        </Link>
      </div>
    </aside>
  )
}

// ── Error Boundary ────────────────────────────────────────────────────────────

interface EBState { hasError: boolean; message: string }

class DashboardErrorBoundary extends Component<{ children: ReactNode }, EBState> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error: Error): EBState {
    return { hasError: true, message: error?.message ?? 'Erreur inconnue' }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Surface to console so devs can investigate without the screen going blank
    console.error('[Mainteligence] Dashboard render error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center flex-1 min-h-[60vh] gap-6 p-8">
          <div className="w-14 h-14 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </div>
          <div className="text-center max-w-md">
            <p className="text-sm font-semibold text-[#fafafa] mb-2">Une erreur est survenue dans le tableau de bord</p>
            <p className="text-[11px] font-mono text-[#52525b] mb-1">{this.state.message}</p>
            <p className="text-[10px] font-mono text-[#3a3a3d]">Consultez la console pour plus de détails.</p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, message: '' })}
            className="text-[11px] font-mono text-[#e8650a] border border-[#e8650a]/30 bg-[#e8650a]/8 px-4 py-2 rounded-sm hover:bg-[#e8650a]/15 transition-colors">
            Réessayer
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// ── Props & main export ───────────────────────────────────────────────────────

export interface MainteligenceDashboardProps {
  /** 'demo' shows orange "Mode Démonstration" badge; 'client' shows green live indicator + clientName */
  mode: 'demo' | 'client'
  /** Shown in the header bar when mode = 'client'. Ignored in demo mode. */
  clientName?: string
  /** Controlled active panel. If omitted, component manages its own state. */
  section?: string
  /** Called when the user clicks a sidebar item. Use to sync guided-tour state. */
  setSection?: (s: string) => void
  /**
   * Demo mode only — when provided, the mode bar renders a "Reprendre la visite guidée" button.
   * Pass undefined to hide the button (e.g. while the overlay is already open).
   */
  onResumeGuided?: () => void
}

/** Inner implementation — wrapped in ErrorBoundary + AlertEngineContext.Provider below */
function MainteligenceDashboardInner({
  mode,
  clientName = 'Sonatrach — Division Mécanique',
  section: sectionProp,
  setSection: setSectionProp,
  onResumeGuided,
}: MainteligenceDashboardProps) {
  // Allow fully controlled or fully uncontrolled usage
  const [internalSection, setInternalSection] = useState('overview')
  const active    = sectionProp    ?? internalSection
  const setActive = setSectionProp ?? setInternalSection

  // Single live-data hook for the outer shell (mode bar + breadcrumb)
  const rootLive = useLiveData()

  // Alert engine — single instance at the root, shared via context
  const alertEngineState = useAlertEngine()

  const totalMachines = MACHINES.length
  // Use live engine count — real debounced threshold-driven value (not oscillating mock)
  const activeAlerts  = alertEngineState.totalActive
  const avgHealth     = rootLive.healthScore

  // Memoized so panel components are NOT remounted on every root re-render
  // (rootLive ticks every 4s — without useMemo every tick would remount all panels)
  const panelMap = useMemo<Record<string, React.ReactNode>>(() => ({
    overview:    <OverviewPanel onNavigateSense={() => setActive('sense')} />,
    assets:      <AssetsPanel />,
    analytics:   <AnalyticsPanel />,
    models:      <ModelsPanel />,
    insights:    <InsightsPanel />,
    alerts:      <AlertsPanel onNavigateSensors={() => setActive('sensors')} />,
    sensors:     <SensorsPanel />,
    sense:       <SensePanel />,
    maintenance: <MaintenancePanel />,
    settings:    <SettingsPanel />,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [/* intentionally stable — panels own their own live data */])

  const currentLabel = SIDEBAR_ITEMS.find(s => s.id === active)?.label ?? 'Tableau de bord'

  return (
    <AlertEngineContext.Provider value={alertEngineState}>
    <div className="pt-16 flex flex-1">
      <DashboardSidebar active={active} setActive={setActive} mode={mode} />

      <main className="flex-1 bg-[#09090b]" style={{ scrollbarGutter: 'stable' }}>

        {/* ── Mode indicator bar ── */}
        {/* top-16 = 64px navbar height — sticky relative to page scroll now */}
        {mode === 'demo' ? (
          <div className="sticky top-16 z-20 bg-[#e8650a]/8 border-b border-[#e8650a]/20 px-6 py-2 flex items-center justify-between gap-4"
            style={{ boxShadow: '0 0 20px rgba(232,101,10,0.05)' }}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e8650a] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e8650a]" />
              </span>
              <span className="text-[10px] font-mono font-bold text-[#e8650a] uppercase tracking-widest shrink-0">Mode Démonstration</span>
              <span className="text-[10px] font-mono text-[#3a3a3d] hidden sm:block">— Données simulées · Fonctionnalités identiques à la version client</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-mono text-[#52525b] hidden md:block">{totalMachines} machines</span>
              <span className="text-[#1c1c1f] hidden md:block">|</span>
              <span className="text-[10px] font-mono text-[#52525b] hidden md:block">{activeAlerts} alertes actives</span>
              {onResumeGuided && (
                <>
                  <span className="text-[#1c1c1f] hidden md:block">|</span>
                  <button
                    onClick={onResumeGuided}
                    className="flex items-center gap-1.5 bg-[#e8650a] hover:bg-[#d15a08] text-white text-[10px] font-semibold px-3 py-1.5 rounded-sm transition-all hover:shadow-[0_0_16px_rgba(232,101,10,0.35)]"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="white"><polygon points="2,1 9,5 2,9" /></svg>
                    Visite guidée
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="sticky top-16 z-20 bg-[#10b981]/8 border-b border-[#10b981]/20 px-6 py-2 flex items-center justify-between"
            style={{ boxShadow: '0 0 20px rgba(16,185,129,0.05)' }}>
            <div className="flex items-center gap-3 min-w-0">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]" />
              </span>
              <span className="text-[10px] font-mono font-bold text-[#10b981] uppercase tracking-widest shrink-0">Système actif</span>
              <span className="text-[10px] font-mono text-[#52525b] truncate hidden sm:block">— {clientName}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[10px] font-mono text-[#52525b] hidden md:block">{totalMachines} machines</span>
              <span className="text-[#1c1c1f] hidden md:block">|</span>
              <span className="text-[10px] font-mono text-[#52525b] hidden md:block">{activeAlerts} alertes actives</span>
              <span className="text-[#1c1c1f] hidden md:block">|</span>
              <span className="text-[10px] font-mono text-[#52525b]">
                Santé : <span style={{ color: avgHealth > 70 ? '#10b981' : avgHealth > 40 ? '#f59e0b' : '#ef4444' }}>{avgHealth}%</span>
              </span>
            </div>
          </div>
        )}

        {/* ── Breadcrumb / welcome bar ── */}
        {/* top-[98px] = 64px navbar + 34px mode bar */}
        <div className="sticky top-[98px] z-10 bg-[#09090b]/97 backdrop-blur-sm border-b border-[#1c1c1f] px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-[#3a3a3d] mb-1">
                {mode === 'demo' ? 'Environnement de démonstration' : 'Bienvenue'}
              </p>
              <p className="text-sm font-semibold text-[#fafafa]">
                {mode === 'demo' ? 'Mode Démonstration — Mainteligence Platform' : clientName}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {mode === 'client' && (
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-[#10b981]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />En direct
                </span>
              )}
              <span className="text-[10px] font-mono text-[#3a3a3d] tabular-nums">Dernière mise à jour : il y a {rootLive.syncSec}s</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#52525b] uppercase tracking-widest">Mainteligence Plateforme</span>
            <span className="text-[#27272a]">/</span>
            <span className="text-[10px] font-mono text-[#a1a1aa] capitalize">{currentLabel}</span>
          </div>
        </div>

        {/* ── Panel content ── */}
        <div className="p-6">
          {panelMap[active] ?? panelMap['overview']}
        </div>
      </main>
    </div>
    </AlertEngineContext.Provider>
  )
}

/** Public default export — wraps the dashboard in an error boundary so any
 *  uncaught render error shows a recovery UI instead of a blank screen. */
export default function MainteligenceDashboard(props: MainteligenceDashboardProps) {
  return (
    <DashboardErrorBoundary>
      <MainteligenceDashboardInner {...props} />
    </DashboardErrorBoundary>
  )
}
