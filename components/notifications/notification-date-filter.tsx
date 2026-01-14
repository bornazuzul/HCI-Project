"use client";

import { useQueryState, parseAsInteger } from "nuqs";

const OPTIONS = [
  { label: "All", value: null },
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last year", value: "365" },
];

export function NotificationDateFilter() {
  const [days, setDays] = useQueryState("days", { shallow: false });
  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  return (
    <div className="flex gap-2 flex-wrap">
      {OPTIONS.map((o) => {
        const active = days === o.value || (!days && !o.value);

        return (
          <button
            key={o.label}
            onClick={() => {
              setDays(o.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-lg text-sm transition ${
              active
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
