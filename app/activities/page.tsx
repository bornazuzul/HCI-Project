"use client";

import { useState, Suspense } from "react";
import Navigation from "@/components/navigation";
import ActivitiesGrid from "@/components/activities/activities-grid";
import ActivityFilters from "@/components/activities/activity-filters";
import CreateActivityButton from "@/components/activities/create-activity-button";
import { useApp } from "@/app/providers";

export default function ActivitiesPage() {
  const [filters, setFilters] = useState({
    category: "all",
    search: "",
    date: "all",
  });
  const { user } = useApp();
  const isLoggedIn = !!user;
  const userRole = user?.role || null;

  return (
    <div className="min-h-screen bg-background">
      {/* <Navigation isLoggedIn={isLoggedIn} userRole={userRole} /> */}

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

            {isLoggedIn && <CreateActivityButton userRole={userRole} />}
          </div>

          <Suspense fallback={<div>Loading...</div>}>
            {/* Filters and Grid */}
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Sidebar Filters */}
              <div className="lg:col-span-1">
                <ActivityFilters filters={filters} setFilters={setFilters} />
              </div>

              {/* Activities Grid */}
              <div className="lg:col-span-3">
                <ActivitiesGrid filters={filters} isLoggedIn={isLoggedIn} />
              </div>
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
