import {
  getNotifications,
  getNotificationsCount,
} from "@/lib/api/notifications";
import { Pagination } from "../_components/Pagination";
import { NotificationSearch } from "@/components/notifications/notification-search";
import { NotificationTypeFilter } from "@/components/notifications/notification-type-filter";
import { NotificationDateFilter } from "@/components/notifications/notification-date-filter";
import { formatNotificationDate } from "@/lib/utils";

const PAGE_SIZE = 12;

interface NotificationsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    page?: string;
    days?: string;
  }>;
}

const NOTIFICATION_TYPE_STYLES: Record<
  string,
  { label: string; className: string }
> = {
  announcment: {
    label: "Announcement",
    className: "bg-blue-100 text-blue-700",
  },
  "activity-update": {
    label: "Activity update",
    className: "bg-green-100 text-green-700",
  },
  reminder: {
    label: "Reminder",
    className: "bg-yellow-100 text-yellow-800",
  },
};

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  const params = await searchParams;

  const query = params.q;
  const type = params.type;
  const page = Number(params.page) > 0 ? Number(params.page) : 1;
  const days = params.days ? Number(params.days) : undefined;

  const [notifications, total] = await Promise.all([
    getNotifications({
      page,
      pageSize: PAGE_SIZE,
      query,
      type,
      days,
    }),
    getNotificationsCount({
      query,
      type,
      days,
    }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Notifications</h1>

      <div className="space-y-4">
        <NotificationSearch />
        <NotificationTypeFilter />
        <NotificationDateFilter />
      </div>

      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications found.</p>
      )}

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="border rounded-lg p-4 bg-white hover:shadow transition"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">
                  {formatNotificationDate(n.createdAt || n.timeStamp)}
                </p>
                <h2 className="font-semibold">{n.title}</h2>
              </div>

              <span
                className={`text-xs px-2 py-1 rounded font-medium whitespace-nowrap ${
                  NOTIFICATION_TYPE_STYLES[n.type]?.className ??
                  "bg-gray-100 text-gray-600"
                }`}
              >
                {NOTIFICATION_TYPE_STYLES[n.type]?.label ?? n.type}
              </span>
            </div>

            <p className="text-sm text-gray-600 mt-1">{n.message}</p>
          </div>
        ))}
      </div>

      <Pagination currentPage={page} totalPages={totalPages} className="pt-4" />
    </main>
  );
}
