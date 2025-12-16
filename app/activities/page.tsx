import { Suspense } from "react";
import { notFound } from "next/navigation";
import ActivitiesPageClient from "./page.client";
import {
  getActivitiesPaginated,
  getActivitiesCount,
} from "@/lib/api/activities";
import { loadActivitiesSearchParams } from "@/lib/activities-search-params";
import {
  getApprovedActivitiesPaginated,
  getActivityCounts,
} from "@/lib/api/user-activities";
import { SearchParams } from "nuqs";

interface ActivitiesPageSearchParams {
  searchParams: Promise<SearchParams>;
}

const PAGE_SIZE = 6;

export default async function ActivitiesPage({
  searchParams,
}: ActivitiesPageSearchParams) {
  const { page, category } = await loadActivitiesSearchParams(searchParams);
  // Validate inputs
  const validatedPage = Math.max(1, page);
  const categoryFilter = category?.trim() || undefined;

  const [activities, totalActivities] = await Promise.all([
    getApprovedActivitiesPaginated(validatedPage, PAGE_SIZE, categoryFilter),
    getActivityCounts().then((counts) => counts.approved),
  ]);

  const uiCategory = category === "" ? "all" : category;

  const totalPages = Math.max(1, Math.ceil(totalActivities / PAGE_SIZE));

  if (validatedPage > totalPages) {
    notFound();
  }

  const allCategories = [...new Set(activities.map((a) => a.category))];

  return (
    <ActivitiesPageClient
      initialActivities={activities}
      initialFilters={{
        category: uiCategory,
        page: validatedPage,
      }}
      categories={allCategories}
      totalPages={totalPages}
      currentPage={validatedPage}
    />
  );
}
