import type {
  ChainModifiers,
  Entry,
  EntryFieldTypes,
  EntrySkeletonType,
  LocaleCode,
} from "contentful";

/**
 * Fields for Notification content type
 */
export interface TypeNotificationFields {
  title: EntryFieldTypes.Symbol;
  message: EntryFieldTypes.Text;
  type?: EntryFieldTypes.Symbol<"announcment" | "activity-update" | "reminder">;
  timeStamp?: EntryFieldTypes.Date;
  createdAt?: EntryFieldTypes.Date;
}

/**
 * Skeleton definition
 */
export type TypeNotificationSkeleton = EntrySkeletonType<
  TypeNotificationFields,
  "notification"
>;

/**
 * Entry types
 */
export type TypeNotification<
  Modifiers extends ChainModifiers,
  Locales extends LocaleCode = LocaleCode
> = Entry<TypeNotificationSkeleton, Modifiers, Locales>;

export type TypeNotificationWithoutLinkResolutionResponse =
  TypeNotification<"WITHOUT_LINK_RESOLUTION">;

export type TypeNotificationWithoutUnresolvableLinksResponse =
  TypeNotification<"WITHOUT_UNRESOLVABLE_LINKS">;
