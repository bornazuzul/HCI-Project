import { getActivityById } from "@/lib/api/activities";
import Link from "next/link";
import { notFound } from "next/navigation";
import ActivityPageClient from "./page.client";

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

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const activity = await getActivityById(id);

  if (!activity) {
    notFound();
  }

  // Pass the activity data to the client component
  return <ActivityPageClient initialActivity={activity} />;
}
