"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

interface Filters {
  category: string;
  search: string;
  date: string;
}

interface Activity {
  id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  location: string;
}

interface ActivitiesGridProps {
  activities: Activity[];
  filters: Filters;
  isLoggedIn: boolean;
}

export default function ActivitiesGrid({
  activities,
  filters,
  isLoggedIn,
}: ActivitiesGridProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search);

  // Filter activities based on search term
  const filteredActivities = useMemo(() => {
    if (!searchTerm.trim()) return activities;

    const term = searchTerm.toLowerCase();
    return activities.filter(
      (activity) =>
        activity.title.toLowerCase().includes(term) ||
        activity.description.toLowerCase().includes(term) ||
        activity.location.toLowerCase().includes(term)
    );
  }, [activities, searchTerm]);

  // Category colors mapping
  const categoryColors: Record<string, string> = {
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
          No activities found
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Try adjusting your filters or check back later for new opportunities.
        </p>
        <button
          onClick={() => setSearchTerm("")}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          Clear Search
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Search Bar */}
      <div className="mb-8">
        <div className="relative max-w-2xl">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, description, or location..."
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
              onClick={() => setSearchTerm("")}
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

        {searchTerm && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found{" "}
              <span className="font-semibold text-gray-900">
                {filteredActivities.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {activities.length}
              </span>{" "}
              activities matching "
              <span className="font-medium text-blue-600">{searchTerm}</span>"
            </p>
            <button
              onClick={() => setSearchTerm("")}
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
          </div>
        )}
      </div>

      {/* Activities Grid - Enhanced Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredActivities.map((activity) => {
          const activityDate = new Date(activity.date);
          const formattedDate = activityDate.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
          });

          return (
            <Link
              key={activity.id}
              href={`/activities/${activity.id}`}
              className="group block bg-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-blue-300 overflow-hidden relative"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-4">
                <span
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getCategoryColor(
                    activity.category
                  )}`}
                >
                  {activity.category}
                </span>
                <span className="text-sm text-gray-500 font-medium">
                  {formattedDate}
                </span>
              </div>

              {/* Card Body */}
              <div className="mb-5">
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {activity.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {activity.description}
                </p>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-gray-600">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-400"
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
                  <span className="text-sm font-medium">
                    {activity.location}
                  </span>
                </div>

                <span className="text-blue-600 font-medium text-sm group-hover:text-blue-800 group-hover:translate-x-1 transition-all duration-200">
                  View details →
                </span>
              </div>

              {/* Hover Effect Border */}
              <div className="absolute bottom-0 left-0 w-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:w-full transition-all duration-300"></div>
            </Link>
          );
        })}
      </div>

      {/* No Search Results */}
      {filteredActivities.length === 0 && searchTerm && (
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
            No matching activities
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            We couldn't find any activities matching "{searchTerm}". Try a
            different search term.
          </p>
          <button
            onClick={() => setSearchTerm("")}
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
            Clear Search
          </button>
        </div>
      )}
    </div>
  );
}
