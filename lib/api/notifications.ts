import cms from "@/app/cms";
import { TypeNotificationSkeleton } from "@/app/cms/content-types";

export interface GetNotificationsParams {
  page: number;
  pageSize: number;
  query?: string;
  type?: string;
  days?: number;
}

interface GetNotificationsCountParams {
  query?: string;
  type?: string;
  days?: number;
}

function getDateFilter(days?: number) {
  if (!days) return {};

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  return {
    "fields.createdAt[gte]": fromDate.toISOString(),
  };
}

export async function getNotifications({
  page,
  pageSize,
  query,
  type,
  days,
}: GetNotificationsParams) {
  const skip = (page - 1) * pageSize;

  const data =
    await cms.withoutUnresolvableLinks.getEntries<TypeNotificationSkeleton>({
      content_type: "notification",
      order: ["-fields.createdAt"],
      skip,
      limit: pageSize,
      ...(type && { "fields.type": type }),
      ...(query && { query }),
      ...getDateFilter(days),
    });

  return data.items.map((item) => ({
    id: item.sys.id,
    title: item.fields.title,
    message: item.fields.message,
    type: item.fields.type ?? "announcment",
    createdAt: item.fields.createdAt,
    timeStamp: item.fields.timeStamp,
  }));
}

export async function getNotificationsCount({
  query,
  type,
  days,
}: GetNotificationsCountParams) {
  const data =
    await cms.withoutUnresolvableLinks.getEntries<TypeNotificationSkeleton>({
      content_type: "notification",
      limit: 0,
      ...(type && { "fields.type": type }),
      ...(query && { query }),
      ...getDateFilter(days),
    });

  return data.total;
}
