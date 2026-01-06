"use client";

import { Suspense } from "react";
import ActivitiesGrid from "@/components/activities/activities-grid";
import ActivityFilters from "@/components/activities/activity-filters";
import CreateActivityButton from "@/components/activities/create-activity-button";
import { Pagination } from "@/app/_components/Pagination";
import { useApp } from "@/app/providers";

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
}

interface ActivitiesPageClientProps {
  initialActivities: Activity[];
  initialFilters: {
    category: string;
    page: number;
  };
  categories: string[];
  totalPages: number;
  currentPage: number;
}

export default function ActivitiesPageClient({
  initialActivities,
  initialFilters,
  categories,
  totalPages,
  currentPage,
}: ActivitiesPageClientProps) {
  const { user } = useApp();
  const isLoggedIn = !!user;
  const userRole = user?.role || null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Volunteer Activities
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Find meaningful opportunities to make a difference in your
              community
            </p>
          </div>

          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            }
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar - Sticky on desktop */}
              <div className="lg:w-1/4">
                <div className="sticky top-24">
                  <ActivityFilters
                    initialCategory={initialFilters.category}
                    categories={categories}
                  />
                </div>
              </div>

              {/* Main */}
              <div className="lg:w-3/4">
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h2 className="font-semibold text-gray-800">
                        {initialFilters.category === "all"
                          ? "All Activities"
                          : `${initialFilters.category} Activities`}
                      </h2>
                      <p className="text-sm text-gray-600">
                        {totalPages > 1
                          ? `Page ${currentPage} of ${totalPages} • ${initialActivities.length} results`
                          : `${initialActivities.length} results`}
                      </p>
                    </div>
                    {isLoggedIn && <CreateActivityButton userRole={userRole} />}
                  </div>
                </div>

                {/* Activities Grid */}
                <ActivitiesGrid
                  activities={initialActivities}
                  filters={{
                    category: initialFilters.category,
                    search: "",
                    date: "all",
                  }}
                  isLoggedIn={isLoggedIn}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
                    />
                  </div>
                )}
              </div>
            </div>
          </Suspense>
        </div>
      </main>
    </div>
  );
}
