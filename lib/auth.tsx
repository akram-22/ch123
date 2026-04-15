'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface ClientMachine {
  id: string
  name: string
  type: string
  location: string
  status: 'normal' | 'warning' | 'critical'
  rul: number          // days
  healthScore: number  // 0-100
  temperature: number  // °C
  vibration: number    // g
  pressure: number     // bar
  rpm: number
  current: number      // A
  lastSync: string
}

export interface ClientAlert {
  id: string
  machineId: string
  machineName: string
  type: 'temperature' | 'vibration' | 'rul' | 'anomaly'
  severity: 'critical' | 'warning' | 'info'
  message: string
  timestamp: string
  resolved: boolean
}

export interface ClientReport {
  id: string
  title: string
  type: 'monthly' | 'alert' | 'maintenance' | 'prediction'
  date: string
  size: string
}

export interface Company {
  id: string
  name: string
  industry: string
  location: string
  contact: string
  contactTitle: string
  email: string
  phone: string
  plan: 'starter' | 'professional' | 'enterprise'
  planExpiry: string
  machines: ClientMachine[]
  alerts: ClientAlert[]
  reports: ClientReport[]
  lastSync: string
  activeAlerts: number
  avgHealthScore: number
}

export interface AuthUser {
  email: string
  company: Company
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO COMPANY DATA
// ─────────────────────────────────────────────────────────────────────────────

const COMPANIES: Record<string, Company> = {
  'company-alpha': {
    id: 'company-alpha',
    name: 'Sonatrach — Division Mécanique',
    industry: 'Oil & Gas',
    location: 'Hassi Messaoud, Algeria',
    contact: 'Karim Benali',
    contactTitle: 'Maintenance Director',
    email: 'alpha@mainteligence.demo',
    phone: '+213 21 00 11 22',
    plan: 'enterprise',
    planExpiry: '2026-12-31',
    lastSync: new Date(Date.now() - 42_000).toISOString(),
    activeAlerts: 3,
    avgHealthScore: 74,
    machines: [
      {
        id: 'MCH-001', name: 'Turbine GTA-7',    type: 'Gas Turbine',
        location: 'Unit A — Hall 1', status: 'warning',
        rul: 34, healthScore: 63, temperature: 428, vibration: 1.87,
        pressure: 18.4, rpm: 3600, current: 142, lastSync: '2 min ago',
      },
      {
        id: 'MCH-002', name: 'Compressor K-12', type: 'Reciprocating Compressor',
        location: 'Unit A — Hall 2', status: 'critical',
        rul: 11, healthScore: 38, temperature: 521, vibration: 3.24,
        pressure: 24.1, rpm: 1450, current: 211, lastSync: '1 min ago',
      },
      {
        id: 'MCH-003', name: 'Pump P-4 Injection', type: 'Centrifugal Pump',
        location: 'Unit B — Block 3', status: 'normal',
        rul: 62, healthScore: 81, temperature: 195, vibration: 0.61,
        pressure: 8.7,  rpm: 2900, current: 87,  lastSync: '3 min ago',
      },
      {
        id: 'MCH-004', name: 'Motor EMT-22', type: 'Electric Motor',
        location: 'Unit B — Block 3', status: 'normal',
        rul: 87, healthScore: 92, temperature: 312, vibration: 0.42,
        pressure: 0,    rpm: 1480, current: 63,  lastSync: '1 min ago',
      },
      {
        id: 'MCH-005', name: 'Heat Exchanger HX-5', type: 'Shell & Tube HX',
        location: 'Unit C — Utilities', status: 'warning',
        rul: 28, healthScore: 57, temperature: 389, vibration: 0.98,
        pressure: 12.3, rpm: 0,    current: 0,   lastSync: '5 min ago',
      },
    ],
    alerts: [
      { id: 'ALT-001', machineId: 'MCH-002', machineName: 'Compressor K-12', type: 'vibration', severity: 'critical', message: 'Vibration 3.24g exceeds critical threshold (2.5g)', timestamp: '2025-06-15 08:42', resolved: false },
      { id: 'ALT-002', machineId: 'MCH-002', machineName: 'Compressor K-12', type: 'temperature', severity: 'critical', message: 'Temperature 521°C — emergency shutdown imminent', timestamp: '2025-06-15 08:44', resolved: false },
      { id: 'ALT-003', machineId: 'MCH-001', machineName: 'Turbine GTA-7', type: 'rul', severity: 'warning', message: 'RUL forecast 34 days — schedule preventive maintenance', timestamp: '2025-06-14 14:10', resolved: false },
      { id: 'ALT-004', machineId: 'MCH-005', machineName: 'Heat Exchanger HX-5', type: 'anomaly', severity: 'warning', message: 'Anomalous thermal pattern detected in HX-5', timestamp: '2025-06-13 09:30', resolved: true },
      { id: 'ALT-005', machineId: 'MCH-003', machineName: 'Pump P-4 Injection', type: 'vibration', severity: 'info', message: 'Vibration slight increase — monitoring required', timestamp: '2025-06-12 11:15', resolved: true },
    ],
    reports: [
      { id: 'RPT-001', title: 'Monthly Predictive Maintenance Report — May 2025', type: 'monthly', date: '2025-06-01', size: '2.4 MB' },
      { id: 'RPT-002', title: 'Critical Alert Report — Compressor K-12', type: 'alert', date: '2025-06-15', size: '840 KB' },
      { id: 'RPT-003', title: 'RUL Forecast Summary — Q2 2025', type: 'prediction', date: '2025-06-10', size: '1.1 MB' },
      { id: 'RPT-004', title: 'Maintenance Execution Report — April 2025', type: 'maintenance', date: '2025-05-03', size: '680 KB' },
    ],
  },

  'company-beta': {
    id: 'company-beta',
    name: 'Cevital Industries — Maintenance',
    industry: 'Food & Agro-Industrial',
    location: 'Béjaïa, Algeria',
    contact: 'Amina Saidi',
    contactTitle: 'Plant Engineer',
    email: 'beta@mainteligence.demo',
    phone: '+213 34 21 55 88',
    plan: 'professional',
    planExpiry: '2026-06-30',
    lastSync: new Date(Date.now() - 90_000).toISOString(),
    activeAlerts: 1,
    avgHealthScore: 88,
    machines: [
      {
        id: 'CEV-001', name: 'Refinery Line 1 Motor', type: 'Induction Motor',
        location: 'Refinery Block — Line 1', status: 'normal',
        rul: 91, healthScore: 93, temperature: 241, vibration: 0.38,
        pressure: 0,   rpm: 2960, current: 74, lastSync: '4 min ago',
      },
      {
        id: 'CEV-002', name: 'Hydraulic Press HP-3', type: 'Hydraulic Press',
        location: 'Processing Block — Bay 3', status: 'warning',
        rul: 22, healthScore: 61, temperature: 318, vibration: 1.12,
        pressure: 31.5, rpm: 720, current: 98, lastSync: '2 min ago',
      },
      {
        id: 'CEV-003', name: 'Conveyor Drive C-7', type: 'Belt Drive Motor',
        location: 'Packing Hall — Zone 7', status: 'normal',
        rul: 74, healthScore: 86, temperature: 188, vibration: 0.51,
        pressure: 0,    rpm: 1460, current: 42, lastSync: '6 min ago',
      },
      {
        id: 'CEV-004', name: 'Cooling Tower Fan CTF-2', type: 'Axial Fan Motor',
        location: 'Utility Area — Roof', status: 'normal',
        rul: 108, healthScore: 96, temperature: 154, vibration: 0.29,
        pressure: 0,   rpm: 980,  current: 31, lastSync: '3 min ago',
      },
    ],
    alerts: [
      { id: 'ALT-101', machineId: 'CEV-002', machineName: 'Hydraulic Press HP-3', type: 'rul', severity: 'warning', message: 'RUL forecast 22 days — maintenance recommended within 2 weeks', timestamp: '2025-06-15 07:00', resolved: false },
      { id: 'ALT-102', machineId: 'CEV-001', machineName: 'Refinery Line 1 Motor', type: 'vibration', severity: 'info', message: 'Minor vibration trend noted — no action required', timestamp: '2025-06-13 15:20', resolved: true },
    ],
    reports: [
      { id: 'RPT-101', title: 'Monthly Report — May 2025 (Cevital)', type: 'monthly', date: '2025-06-01', size: '1.8 MB' },
      { id: 'RPT-102', title: 'HP-3 Wear Analysis Report', type: 'prediction', date: '2025-06-14', size: '520 KB' },
    ],
  },

  'company-gamma': {
    id: 'company-gamma',
    name: 'Lafarge Algérie — Ciment',
    industry: 'Construction Materials',
    location: 'Oggaz, Mascara, Algeria',
    contact: 'Yacine Boudjema',
    contactTitle: 'Technical Manager',
    email: 'gamma@mainteligence.demo',
    phone: '+213 45 77 33 10',
    plan: 'starter',
    planExpiry: '2025-09-30',
    lastSync: new Date(Date.now() - 180_000).toISOString(),
    activeAlerts: 0,
    avgHealthScore: 91,
    machines: [
      {
        id: 'LAF-001', name: 'Rotary Kiln RK-1', type: 'Rotary Kiln Drive',
        location: 'Kiln Line 1', status: 'normal',
        rul: 120, healthScore: 94, temperature: 274, vibration: 0.44,
        pressure: 0,   rpm: 4,    current: 188, lastSync: '8 min ago',
      },
      {
        id: 'LAF-002', name: 'Ball Mill BM-3', type: 'Grinding Mill Motor',
        location: 'Grinding Station 3', status: 'normal',
        rul: 95, healthScore: 89, temperature: 198, vibration: 0.67,
        pressure: 0,   rpm: 18,   current: 210, lastSync: '5 min ago',
      },
      {
        id: 'LAF-003', name: 'ID Fan IDF-1', type: 'Induced Draft Fan',
        location: 'Kiln Line 1 — Exhaust', status: 'normal',
        rul: 77, healthScore: 90, temperature: 162, vibration: 0.55,
        pressure: -4.2, rpm: 740, current: 56,  lastSync: '4 min ago',
      },
    ],
    alerts: [],
    reports: [
      { id: 'RPT-201', title: 'Quarterly Maintenance Summary — Q1 2025', type: 'monthly', date: '2025-04-01', size: '1.2 MB' },
    ],
  },
}

// ─────────────────────────────────────────────────────────────────────────────
// DEMO CREDENTIALS → company mapping
// ─────────────────────────────────────────────────────────────────────────────

const CREDENTIALS: Record<string, { passwords: string[]; companyId: string }> = {
  // alpha accepts both 'demo123' (public demo) and 'alpha2025' (legacy)
  'alpha@mainteligence.demo':  { passwords: ['demo123', 'alpha2025'], companyId: 'company-alpha' },
  'beta@mainteligence.demo':   { passwords: ['beta2025'],             companyId: 'company-beta'  },
  'gamma@mainteligence.demo':  { passwords: ['gamma2025'],            companyId: 'company-gamma' },
}

const SESSION_KEY = 'maint_session'

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => ({ ok: false }),
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        const { email, companyId } = JSON.parse(raw)
        const company = COMPANIES[companyId]
        if (company) setUser({ email, company })
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const cred = CREDENTIALS[email.toLowerCase().trim()]
    if (!cred) return { ok: false, error: 'No account found with that email address.' }
    if (!cred.passwords.includes(password)) return { ok: false, error: 'Incorrect password.' }
    const company = COMPANIES[cred.companyId]
    if (!company) return { ok: false, error: 'Company data not found.' }
    const authUser: AuthUser = { email, company }
    setUser(authUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email, companyId: cred.companyId }))
    return { ok: true }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem(SESSION_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export function getPlanLabel(plan: Company['plan']): string {
  return { starter: 'Starter', professional: 'Professional', enterprise: 'Enterprise' }[plan]
}

export function getPlanColor(plan: Company['plan']): string {
  return { starter: '#3b82f6', professional: '#a78bfa', enterprise: '#e8650a' }[plan]
}

export function getSeverityColor(s: ClientAlert['severity']): string {
  return { critical: '#ef4444', warning: '#f59e0b', info: '#3b82f6' }[s]
}

export function getStatusColor(s: ClientMachine['status']): string {
  return { normal: '#10b981', warning: '#f59e0b', critical: '#ef4444' }[s]
}

export function getStatusBg(s: ClientMachine['status']): string {
  return { normal: 'rgba(16,185,129,0.08)', warning: 'rgba(245,158,11,0.08)', critical: 'rgba(239,68,68,0.10)' }[s]
}

export function formatLastSync(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  return `${Math.floor(diff / 3600)}h ago`
}
