/**
 * PAGE: Homepage / Marketing Landing
 * ROUTE: /
 * PURPOSE: Public-facing landing page — hero, problem, solution, how-it-works, pricing CTA
 */
import AppNavbar from '@/components/app-navbar'
import HeroSection from '@/components/hero-section'
import ProblemSection from '@/components/problem-section'
import SolutionSection from '@/components/solution-section'
import HowItWorksSection from '@/components/how-it-works-section'
import ProductSection from '@/components/product-section'
import DashboardSection from '@/components/dashboard-section'
import ValueSection from '@/components/value-section'
import BusinessModelSection from '@/components/business-model-section'
import CtaFooter from '@/components/cta-footer'

export default function Home() {
  return (
    <main className="bg-[#09090b] min-h-screen">
      <AppNavbar />
      <HeroSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <ProductSection />
      <DashboardSection />
      <ValueSection />
      <BusinessModelSection />
      <CtaFooter />
    </main>
  )
}
