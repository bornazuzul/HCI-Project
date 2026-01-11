"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityFiltersProps {
  initialCategory: string;
  categories: string[];
}

export default function ActivityFilters({
  initialCategory,
  categories,
}: ActivityFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useApp();

  const currentCategory = searchParams.get("category") || initialCategory;
  const showMyActivities = searchParams.get("my") === "true";

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category === "all") {
      params.delete("category");
    } else {
      params.set("category", category);
    }

    // Remove "my" filter when changing category
    params.delete("my");
    params.set("page", "1");

    router.push(`/activities?${params.toString()}`);
  };

  const handleMyActivitiesToggle = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (showMyActivities) {
      params.delete("my");
    } else {
      params.set("my", "true");
      // Clear category filter when showing my activities
      params.delete("category");
    }

    params.set("page", "1");
    router.push(`/activities?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push("/activities");
  };

  const hasActiveFilters = currentCategory !== "all" || showMyActivities;

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-gray-900 text-lg">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="ml-auto text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear all
          </button>
        )}
      </div>

      {/* My Activities Filter */}
      {user && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-gray-600" />
            <h4 className="font-semibold text-gray-800 text-sm">
              Your Activities
            </h4>
          </div>
          <Button
            onClick={handleMyActivitiesToggle}
            variant={showMyActivities ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-full justify-start gap-2",
              showMyActivities &&
                "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
            )}
          >
            <User className="w-4 h-4" />
            {showMyActivities
              ? "Showing Your Activities"
              : "Show My Activities"}
          </Button>
          {showMyActivities && (
            <p className="text-xs text-gray-500 mt-2">
              Showing only activities you created
            </p>
          )}
        </div>
      )}

      {/* Category Filter */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-gray-600" />
          <h4 className="font-semibold text-gray-800 text-sm">Categories</h4>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange("all")}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              currentCategory === "all"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-400"></div>
              All Categories
            </span>
          </button>

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                currentCategory === category
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50"
              )}
            >
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                {category}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Active Filters:
          </p>
          <div className="flex flex-wrap gap-2">
            {showMyActivities && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                <User className="w-3 h-3" />
                Your Activities
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("my");
                    router.push(`/activities?${params.toString()}`);
                  }}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {currentCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-md">
                {currentCategory}
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.delete("category");
                    router.push(`/activities?${params.toString()}`);
                  }}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
