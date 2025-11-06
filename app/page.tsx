"use client";

import { useApp } from "@/app/providers";
import Navigation from "@/components/navigation";
import HeroSection from "@/components/hero-section";

export default function Home() {
  const { user } = useApp();
  const isLoggedIn = !!user;
  const userRole = user?.role || null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation isLoggedIn={isLoggedIn} userRole={userRole} />
      <main>
        <HeroSection isLoggedIn={isLoggedIn} />
      </main>
    </div>
  );
}
