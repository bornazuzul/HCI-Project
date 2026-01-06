import cms from "@/app/cms";
import { TypeNotificationSkeleton } from "@/app/cms/content-types";

export async function getNotifications() {
  const data =
    await cms.withoutUnresolvableLinks.getEntries<TypeNotificationSkeleton>({
      content_type: "notification",
      order: ["-fields.createdAt"],
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
