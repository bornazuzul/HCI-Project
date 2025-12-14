import { getActivities } from "@/lib/api/activities";
import ActivitiesPageClient from "./page.client";

export default async function ActivitiesPage() {
  const activities = await getActivities();

  return <ActivitiesPageClient activities={activities} />;
}
