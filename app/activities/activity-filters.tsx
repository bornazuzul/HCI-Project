"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { Calendar, Filter, User, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

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
  const searchQuery = searchParams.get("q");
  const dateFilter = searchParams.get("date") || "all";

  const hasActiveFilters =
    currentCategory !== "all" ||
    showMyActivities ||
    !!searchQuery ||
    dateFilter !== "all";

  // Date options
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

  const updateParams = (updater: (p: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);
    params.set("page", "1");
    router.push(`/activities?${params.toString()}`);
  };

  const handleClearFilters = () => {
    router.push("/activities");
  };

  // Format date for display
  const getDateFilterLabel = (value: string) => {
    const option = dateOptions.find((opt) => opt.value === value);
    return option ? option.label : value;
  };

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

      {/* My Activities */}
      {/* {user && (
        <div className="mb-6">
          <Button
            onClick={() =>
              updateParams((p) => {
                showMyActivities ? p.delete("my") : p.set("my", "true");
                p.delete("category");
              })
            }
            variant={showMyActivities ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-full justify-start gap-2",
              showMyActivities &&
                "bg-gradient-to-r from-blue-600 to-indigo-600 text-white",
            )}
          >
            <User className="w-4 h-4" />
            {showMyActivities ? "Your Activities" : "Show My Activities"}
          </Button>
        </div>
      )} */}

      {/* Date Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-5 h-5 text-gray-800 font-semibold" />{" "}
          <label className="text-base font-semibold text-gray-800">
            Date
          </label>{" "}
        </div>
        <div className="space-y-2">
          {dateOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                if (option.value === "all") {
                  updateParams((p) => p.delete("date"));
                } else {
                  updateParams((p) => p.set("date", option.value));
                }
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                dateFilter === option.value
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 border border-transparent",
              )}
            >
              <div className="flex items-center justify-between">
                <span>{option.label}</span>
                {dateFilter === option.value && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-5 h-5 text-gray-800 font-semibold" />
          <label className="text-base font-semibold text-gray-800">
            Category
          </label>{" "}
        </div>
        <button
          onClick={() => updateParams((p) => p.delete("category"))}
          className={cn(
            "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            currentCategory === "all"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-gray-600 hover:bg-gray-50 border border-transparent",
          )}
        >
          <div className="flex items-center justify-between">
            <span>All Categories</span>
            {currentCategory === "all" && (
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            )}
          </div>
        </button>

        {categories.map((category) => (
          <button
            key={category}
            onClick={() => updateParams((p) => p.set("category", category))}
            className={cn(
              "w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              currentCategory === category
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-600 hover:bg-gray-50 border border-transparent",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="capitalize">{category}</span>
              {currentCategory === category && (
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Active Filters:
          </p>

          <div className="flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                <Search className="w-3 h-3" />"{searchQuery}"
                <button
                  onClick={() => updateParams((p) => p.delete("q"))}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {showMyActivities && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                <User className="w-3 h-3" />
                My Activities
                <button
                  onClick={() => updateParams((p) => p.delete("my"))}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {dateFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                <Calendar className="w-3 h-3" />
                {getDateFilterLabel(dateFilter)}
                <button
                  onClick={() => updateParams((p) => p.delete("date"))}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {currentCategory !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-md">
                <Filter className="w-3 h-3" />
                {currentCategory}
                <button
                  onClick={() => updateParams((p) => p.delete("category"))}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
