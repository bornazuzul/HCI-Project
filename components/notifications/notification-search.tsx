"use client";

import { useQueryState, parseAsInteger } from "nuqs";

export function NotificationSearch() {
  const [q, setQ] = useQueryState("q", { shallow: false });

  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: false })
  );

  return (
    <input
      value={q ?? ""}
      onChange={(e) => {
        const value = e.target.value;
        setQ(value.length ? value : null);
        setPage(1);
      }}
      placeholder="Search notifications..."
      className="w-full border rounded-lg px-4 py-2"
    />
  );
}
