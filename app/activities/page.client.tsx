"use client";

import { Suspense } from "react";
import ActivitiesGrid from "@/components/activities/activities-grid";
import ActivityFilters from "./activity-filters";
import CreateActivityButton from "@/components/activities/create-activity-button";
import { Pagination } from "@/app/_components/Pagination";
import { useApp } from "@/app/providers";
import { useSearchParams } from "next/navigation";
import { Calendar } from "lucide-react";

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  time: string;
  location: string;
  maxApplicants: number;
  currentApplicants: number;
  organizerId: string;
  betterAuthOrganizerId?: string;
  organizerName: string;
  organizerEmail: string;
  status?: "approved" | "pending" | "rejected" | "deleted";
}

interface ActivitiesPageClientProps {
  initialActivities: Activity[];
  initialFilters: {
    category: string;
    page: number;
    my?: boolean;
    date?: string;
  };
  categories: string[];
  totalPages: number;
  currentPage: number;
  userId?: string;
}

// Helper function to get date filter label
const getDateFilterLabel = (value: string) => {
  const dateOptions = [
    { value: "all", label: "All Dates" },
    { value: "today", label: "Today" },
    { value: "tomorrow", label: "Tomorrow" },
    { value: "this-week", label: "This Week" },
    { value: "next-week", label: "Next Week" },
    { value: "this-month", label: "This Month" },
    { value: "next-month", label: "Next Month" },
    { value: "upcoming", label: "Upcoming" },
    { value: "past", label: "Past Events" },
  ];
  const option = dateOptions.find((opt) => opt.value === value);
  return option ? option.label : value;
};

export default function ActivitiesPageClient({
  initialActivities,
  initialFilters,
  categories,
  totalPages,
  currentPage,
  userId,
}: ActivitiesPageClientProps) {
  const { user } = useApp();
  const isLoggedIn = !!user;
  const userRole = user?.role || null;
  const searchParams = useSearchParams();
  const showMyActivities = searchParams.get("my") === "true";
  const dateFilter = searchParams.get("date") || initialFilters.date || "all";
  const searchQuery = searchParams.get("q") || "";

  const processedActivities = initialActivities.map((activity) => ({
    ...activity,
    organizerId: activity.organizerId || activity.betterAuthOrganizerId || "",
    betterAuthOrganizerId: activity.betterAuthOrganizerId,
    organizerName: activity.organizerName || "Organizer",
    organizerEmail: activity.organizerEmail || "organizer@example.com",
    time: activity.time || "00:00",
    maxApplicants: activity.maxApplicants || 10,
    currentApplicants: activity.currentApplicants || 0,
  }));

  // Get active filters count
  const activeFiltersCount = [
    initialFilters.category !== "all",
    showMyActivities,
    dateFilter !== "all",
    !!searchQuery,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <main className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-left mb-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Volunteer Activities
            </h1>
            <p className="text-base sm:text-mm text-gray-600 max-w-2xl">
              {showMyActivities
                ? "Activities you've organized"
                : "Find meaningful opportunities to make a difference in your community"}
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
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-semibold text-gray-800">
                          {showMyActivities
                            ? "Your Activities"
                            : initialFilters.category === "all"
                              ? "All Activities"
                              : `${initialFilters.category} Activities`}
                        </h2>
                        {activeFiltersCount > 0 && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            {activeFiltersCount} filter
                            {activeFiltersCount !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          {showMyActivities
                            ? `Activities you've organized`
                            : totalPages > 1
                              ? `Page ${currentPage} of ${totalPages} • ${processedActivities.length} results`
                              : `${processedActivities.length} results`}
                        </p>

                        {/* Date filter indicator */}
                        {dateFilter !== "all" && (
                          <div className="flex items-center gap-1 text-sm text-blue-600">
                            <Calendar className="w-3 h-3" />
                            <span>Date: {getDateFilterLabel(dateFilter)}</span>
                          </div>
                        )}

                        {/* Category filter indicator */}
                        {initialFilters.category !== "all" &&
                          !showMyActivities && (
                            <div className="flex items-center gap-1 text-sm text-purple-600">
                              <span className="w-3 h-3 rounded-full bg-purple-100 border border-purple-200"></span>
                              <span>Category: {initialFilters.category}</span>
                            </div>
                          )}
                      </div>

                      {showMyActivities && processedActivities.length === 0 && (
                        <p className="text-sm text-blue-600 mt-1">
                          You haven't created any activities yet.
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      {isLoggedIn && (
                        <CreateActivityButton userRole={userRole} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Activities Grid */}
                <ActivitiesGrid
                  activities={processedActivities}
                  filters={{
                    category: initialFilters.category,
                    search: searchQuery,
                    date: dateFilter,
                    my: showMyActivities,
                  }}
                  isLoggedIn={isLoggedIn}
                  showOrganizerInfo={!showMyActivities}
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
