/**
 * PAGE: Client Dashboard (Live Platform)
 * ROUTE: /dashboard
 * PURPOSE: Authenticated client-facing monitoring platform.
 *          Uses the shared MainteligenceDashboard component with mode="client".
 *          Data and UI are identical to the Demo — only the mode label differs.
 */
'use client'

import AppNavbar from '@/components/app-navbar'
import MainteligenceDashboard from '@/components/mainteligence-dashboard'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <AppNavbar />
      <MainteligenceDashboard
        mode="client"
        clientName="Sonatrach — Division Mécanique"
      />
    </div>
  )
}
