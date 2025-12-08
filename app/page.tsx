"use client"

import { useApp } from "@/app/providers"
import Navigation from "@/components/navigation"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import CTASection from "@/components/cta-section"
import StatsSection from "@/components/stats-section"

export default function Home() {
  const { user } = useApp()
  const isLoggedIn = !!user
  const userRole = user?.role || null

  return (
    <div className="min-h-screen bg-background">
      <Navigation isLoggedIn={isLoggedIn} userRole={userRole} />
      <main>
        <HeroSection isLoggedIn={isLoggedIn} />
        <FeaturesSection />
        <StatsSection />
        <CTASection isLoggedIn={isLoggedIn} />
      </main>
    </div>
  )
}
