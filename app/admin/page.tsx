"use client"

import { useState } from "react"
import Navigation from "@/components/navigation"
import AdminTabs from "@/components/admin/admin-tabs"
import { useApp } from "@/app/providers"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("activities")
  const { user } = useApp()
  const isLoggedIn = !!user
  const userRole = user?.role || null

  // Admin-only page
  if (!isLoggedIn || userRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You need admin privileges to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isLoggedIn={isLoggedIn} userRole={userRole} />

      <main className="pt-20 pb-12">
        <AdminTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </main>
    </div>
  )
}
