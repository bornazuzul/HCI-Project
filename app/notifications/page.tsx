import { getNotifications } from "@/lib/api/notifications";

interface NotificationsPageProps {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
  }>;
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params = await searchParams;

  const notifications = await getNotifications();

  const query = typeof params.q === "string" ? params.q.toLowerCase() : "";

  const type = typeof params.type === "string" ? params.type : undefined;

  const filtered = notifications.filter((n) => {
    const matchesQuery =
      !query ||
      n.title.toLowerCase().includes(query) ||
      n.message.toLowerCase().includes(query);

    const matchesType = type ? n.type === type : true;

    return matchesQuery && matchesType;
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Notifications</h1>

      {filtered.length === 0 && (
        <p className="text-gray-500">No notifications found.</p>
      )}

      {filtered.map((n) => (
        <div key={n.id} className="border rounded-md p-4 bg-white shadow-sm">
          <h2 className="font-semibold">{n.title}</h2>
          <p className="text-sm text-gray-600">{n.message}</p>
          <span className="text-xs text-gray-400">{n.type}</span>
        </div>
      ))}
    </main>
  );
}
