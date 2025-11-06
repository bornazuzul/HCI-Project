"use client";

import { useState } from "react";
import Navigation from "@/components/navigation";
import { useApp } from "@/app/providers";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("activities");
  const { user } = useApp();
  const isLoggedIn = !!user;
  const userRole = user?.role || null;

  // Admin-only page
  if (!isLoggedIn || userRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation isLoggedIn={isLoggedIn} userRole={userRole} />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Admin page
              </h1>
              <p className="text-muted-foreground">
                Control all activities on app
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
