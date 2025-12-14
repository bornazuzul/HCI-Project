"use client";

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
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No activities available.
      </div>
    );
  }

  // Optional: client-side filtering
  const filteredActivities = activities.filter((activity) => {
    if (filters.category !== "all" && activity.category !== filters.category) {
      return false;
    }

    if (
      filters.search &&
      !activity.title.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {filteredActivities.map((activity) => (
        <Link
          key={activity.id}
          href={`/activities/${activity.id}`}
          className="border rounded-lg p-4 hover:shadow transition"
        >
          <h2 className="font-semibold text-lg">{activity.title}</h2>
          <p className="text-sm text-muted-foreground">
            {activity.description}
          </p>
          <p className="text-xs mt-2">{activity.location}</p>
        </Link>
      ))}
    </div>
  );
}
