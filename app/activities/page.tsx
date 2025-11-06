"use client";

import { useState } from "react";
import Navigation from "@/components/navigation";
import { useApp } from "@/app/providers";

export default function ActivitiesPage() {
  const { user } = useApp();
  const isLoggedIn = !!user;
  const userRole = user?.role || null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation isLoggedIn={isLoggedIn} userRole={userRole} />

      <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
                Volunteer Activities
              </h1>
              <p className="text-muted-foreground">
                Discover meaningful opportunities to make an impact
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
