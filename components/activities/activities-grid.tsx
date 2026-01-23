"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { User, Calendar } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

interface Filters {
  category: string;
  search: string;
  date: string;
  my?: boolean;
}

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

interface ActivitiesGridProps {
  activities: Activity[];
  filters: Filters;
  isLoggedIn: boolean;
  showOrganizerInfo?: boolean;
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

export default function ActivitiesGrid({
  activities,
  filters,
  isLoggedIn,
  showOrganizerInfo = true,
}: ActivitiesGridProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchFromUrl = searchParams.get("q") ?? filters.search;
  const [searchTerm, setSearchTerm] = useState(searchFromUrl);
  const dateFilter = searchParams.get("date") || filters.date || "all";

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (!searchTerm.trim()) {
        params.delete("q");
      } else {
        params.set("q", searchTerm);
      }

      params.set("page", "1");
      router.push(`/activities?${params.toString()}`);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const filteredActivities = useMemo(() => {
    // Filter by status (only approved for non-"My Activities" view)
    let filtered = activities;

    if (!filters.my) {
      filtered = filtered.filter(
        (activity) =>
          activity.status === "approved" || activity.status === undefined,
      );
    }

    // Apply search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (activity) =>
          activity.title.toLowerCase().includes(term) ||
          activity.description.toLowerCase().includes(term) ||
          activity.location.toLowerCase().includes(term) ||
          activity.organizerName.toLowerCase().includes(term),
      );
    }

    return filtered;
  }, [activities, searchTerm, filters.my]);

  // Category colors mapping
  const categoryColors: Record<string, string> = {
    sports: "bg-orange-100 text-orange-800 border-orange-200",
    education: "bg-purple-100 text-purple-800 border-purple-200",
    community: "bg-blue-100 text-blue-800 border-blue-200",
    environment: "bg-emerald-100 text-emerald-800 border-emerald-200",
    health: "bg-red-100 text-red-800 border-red-200",
    other: "bg-gray-100 text-gray-800 border-gray-200",
    Environment: "bg-emerald-100 text-emerald-800 border-emerald-200",
    Community: "bg-blue-100 text-blue-800 border-blue-200",
    Education: "bg-purple-100 text-purple-800 border-purple-200",
    Health: "bg-red-100 text-red-800 border-red-200",
    Animals: "bg-amber-100 text-amber-800 border-amber-200",
    Default: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || categoryColors["Default"];
  };

  const updateSearchParam = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (!value.trim()) {
      params.delete("q");
    } else {
      params.set("q", value);
    }

    params.set("page", "1");
    router.push(`/activities?${params.toString()}`);
  };

  const clearSearch = () => {
    setSearchTerm("");
    updateSearchParam("");
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {filters.my ? "No activities created yet" : "No activities found"}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {filters.my
            ? "You haven't created any activities yet. Create your first activity to get started!"
            : dateFilter !== "all"
              ? `No activities found for "${getDateFilterLabel(
                  dateFilter,
                )}". Try a different date filter.`
              : "Try adjusting your filters or check back later for new opportunities."}
        </p>
        {filters.my ? (
          <Link
            href="/activities/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Your First Activity
          </Link>
        ) : (
          <button
            onClick={() => router.push("/activities")}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Clear All Filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Search Bar with Date Filter Info */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="relative flex-1 max-w-2xl">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
              }}
              placeholder="Search by title, description, location, or organizer..."
              className="w-full px-5 py-4 pl-12 border border-gray-300 rounded-xl focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 text-lg bg-white shadow-sm"
            />
            <div className="absolute left-4 top-4 text-gray-400">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Date Filter Indicator */}
          {dateFilter !== "all" && (
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">
                {getDateFilterLabel(dateFilter)}
              </span>
              <button
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("date");
                  params.set("page", "1");
                  router.push(`/activities?${params.toString()}`);
                }}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>

        {(searchTerm || dateFilter !== "all") && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-gray-600">
              Found{" "}
              <span className="font-semibold text-gray-900">
                {filteredActivities.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {activities.length}
              </span>{" "}
              activities
              {searchTerm && (
                <>
                  {" "}
                  matching "
                  <span className="font-medium text-blue-600">
                    {searchTerm}
                  </span>
                  "
                </>
              )}
              {dateFilter !== "all" && searchTerm && " and "}
              {dateFilter !== "all" && (
                <>
                  {" "}
                  for{" "}
                  <span className="font-medium text-blue-600">
                    {getDateFilterLabel(dateFilter)}
                  </span>
                </>
              )}
            </p>

            <div className="flex gap-2">
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                >
                  Clear search
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}

              {(searchTerm || dateFilter !== "all") && (
                <button
                  onClick={() => router.push("/activities")}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
                >
                  Clear all filters
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Activities Grid - Enhanced Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => {
          const activityDate = new Date(activity.date);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const isPastActivity = activityDate < today;
          const daysUntil = Math.ceil(
            (activityDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
          );

          const formattedDate = activityDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          // available spots
          const availableSpots =
            activity.maxApplicants - activity.currentApplicants;
          const isFull = availableSpots <= 0;

          return (
            <Link
              key={activity.id}
              href={`/activities/${activity.id}`}
              className={`
          group block bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300
          border-2
          ${
            activity.status === "pending"
              ? "border-yellow-400"
              : activity.status === "rejected"
                ? "border-red-400"
                : activity.status === "approved"
                  ? ""
                  : "border-gray-200"
          }
          hover:border-blue-300
          overflow-hidden relative
          flex flex-col h-full /* FIX: Added for footer positioning */
        `}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getCategoryColor(
                      activity.category,
                    )}`}
                  >
                    {activity.category}
                  </span>

                  {/* Date urgency indicator */}
                  {!isPastActivity && daysUntil <= 7 && (
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        daysUntil === 0
                          ? "bg-red-100 text-red-800"
                          : daysUntil === 1
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {daysUntil === 0
                        ? "Today"
                        : daysUntil === 1
                          ? "Tomorrow"
                          : `${daysUntil}d`}
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-sm text-gray-500 font-medium">
                    {formattedDate}
                  </span>
                  <span className="text-xs text-gray-400">{activity.time}</span>
                </div>
              </div>

              {/* Card Body - FIX: Added flex-1 to grow and push footer down */}
              <div className="mb-5 flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {activity.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {activity.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="pt-4">
                {/* Capacity Indicator */}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Available spots</span>
                    <span
                      className={isFull ? "text-red-600 font-semibold" : ""}
                    >
                      {availableSpots} / {activity.maxApplicants}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        isFull
                          ? "bg-red-500"
                          : "bg-gradient-to-r from-green-500 to-blue-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          (activity.currentApplicants /
                            activity.maxApplicants) *
                            100,
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row border-t border-gray-200 items-start sm:items-center justify-between gap-3">
                  {/* Location - with proper line breaking */}
                  <div className="flex items-start text-gray-700 w-full sm:w-auto min-w-0">
                    <svg
                      className="w-5 h-5 font-semibold text-gray-500 shrink-0 mt-0.5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm font-semibold text-gray-800 break-words min-w-0">
                      {activity.location}
                    </span>
                  </div>

                  {/* Organizer Info */}
                  {showOrganizerInfo && (
                    <div className="flex items-center text-gray-700 shrink-0 bg-gray-50 px-3 py-1.5 rounded-lg">
                      <User className="w-4 h-4 text-gray-500 mr-1.5" />
                      <span className="text-sm font-medium text-gray-800 truncate max-w-[140px] sm:max-w-[160px]">
                        {activity.organizerName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Status indicator */}
              {activity.status && activity.status !== "approved" && (
                <div
                  className={`absolute -top-2 -right-2 px-2 py-1 text-xs font-semibold rounded-full ${
                    activity.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {activity.status === "pending" ? "Pending" : "Rejected"}
                </div>
              )}

              {/* Hover Effect Border */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300"></div>
            </Link>
          );
        })}
      </div>

      {/* No Search Results */}
      {filteredActivities.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <svg
              className="w-10 h-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No activities found
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {searchTerm
              ? `We couldn't find any activities matching "${searchTerm}".`
              : dateFilter !== "all"
                ? `No activities found for "${getDateFilterLabel(dateFilter)}".`
                : "Try adjusting your filters or check back later for new opportunities."}
          </p>
          <button
            onClick={() => router.push("/activities")}
            className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
