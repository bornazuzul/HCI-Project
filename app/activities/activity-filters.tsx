"use client";

import { useQueryState, parseAsString } from "nuqs";
import { useEffect, useState } from "react";

interface ActivityFiltersProps {
  initialCategory: string;
  categories: string[];
}

export default function ActivityFilters({
  initialCategory,
  categories,
}: ActivityFiltersProps) {
  const [category, setCategory] = useQueryState(
    "category",
    parseAsString.withDefault("").withOptions({ shallow: false })
  );

  const [search, setSearch] = useState("");
  const [localCategory, setLocalCategory] = useState(initialCategory);

  // Sync local state with URL when it changes
  useEffect(() => {
    setLocalCategory(category || "all");
  }, [category]);

  const handleCategoryChange = (value: string) => {
    const newCategory = value === "all" ? null : value;
    setCategory(newCategory);
  };

  const handleClearFilters = () => {
    setCategory(null);
    setSearch("");
  };

  const hasActiveFilters = category || search;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Filters</h3>
        <p className="text-sm text-gray-500">Refine your search</p>
      </div>

      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium mb-3 text-gray-700">
          Category
        </label>
        <div className="space-y-2">
          <button
            onClick={() => handleCategoryChange("all")}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
              localCategory === "all"
                ? "bg-blue-50 border border-blue-200 text-blue-700"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">All Categories</span>
              {localCategory === "all" && (
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                localCategory === cat
                  ? "bg-blue-50 border border-blue-200 text-blue-700"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{cat}</span>
                {localCategory === cat && (
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search Filter */}
      <div>
        <label className="block text-sm font-medium mb-3 text-gray-700">
          Quick Search
        </label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activities..."
            className="w-full px-4 py-3 pl-11 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
          />
          <div className="absolute left-3 top-3.5 text-gray-400">
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Active Filters & Clear Button */}
      {hasActiveFilters && (
        <div className="pt-6 border-t border-gray-200">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              Active Filters
            </h4>
            <div className="flex flex-wrap gap-2">
              {category && category !== "all" && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                  {category}
                  <button
                    onClick={() => setCategory(null)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {search && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                  Search: "{search}"
                  <button
                    onClick={() => setSearch("")}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleClearFilters}
            className="w-full px-4 py-3 text-sm font-medium bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
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

      {/* Help Text */}
      <div className="pt-6 border-t border-gray-200">
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
          <div className="text-blue-500 mt-0.5">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">Filter Tips</p>
            <p className="text-xs text-blue-600 mt-1">
              Category filters update the URL and trigger server reload. Search
              works on current page only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
