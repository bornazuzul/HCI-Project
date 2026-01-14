"use client";

import { useQueryState, parseAsInteger } from "nuqs";

const TYPES = [
  { label: "All", value: null },
  { label: "Announcements", value: "announcment" },
  { label: "Activity updates", value: "activity-update" },
  { label: "Reminders", value: "reminder" },
];

export function NotificationTypeFilter() {
  const [type, setType] = useQueryState("type", { shallow: false });

  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  return (
    <div className="flex gap-2 flex-wrap">
      {TYPES.map((t) => {
        const active = type === t.value || (!type && !t.value);

        return (
          <button
            key={t.label}
            onClick={() => {
              setType(t.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              active
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
