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
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          Filter by Category
        </label>
        <select
          value={localCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={handleClearFilters}
            className="w-full px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Tip: </strong>
          Select category filter to see desired activities
        </p>
      </div>
    </div>
  );
}
