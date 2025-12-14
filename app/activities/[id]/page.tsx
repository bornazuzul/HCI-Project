import { getActivityById } from "@/lib/api/activities";

export default async function ActivityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  console.log("params.id", id, typeof id);
  const activity = await getActivityById(id);

  console.log(activity);

  return (
    <main className="pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">{activity.title}</h1>
        <p className="mb-4">{activity.description}</p>

        <ul className="text-sm space-y-1">
          <li>
            <strong>Category:</strong> {activity.category}
          </li>
          <li>
            <strong>Date:</strong> {activity.date}
          </li>
          <li>
            <strong>Time:</strong> {activity.time}
          </li>
          <li>
            <strong>Location:</strong> {activity.location}
          </li>
          <li>
            <strong>Max Applicants:</strong> {activity.maxApplicants}
          </li>
        </ul>
      </div>
    </main>
  );
}
