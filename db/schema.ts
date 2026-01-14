import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  date,
  uuid,
  index,
} from "drizzle-orm/pg-core";

// Pages table
export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  path: text("path").notNull().unique(),
  includeInProd: boolean("include_in_prod").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
});

// Profiles table (legacy, not used by Better Auth)
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const user = pgTable("user", {
  id: text("id").primaryKey(), // Better Auth uses text IDs
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: text("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const activities = pgTable(
  "activities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    date: date("date").notNull(),
    time: text("time").notNull(),
    location: text("location").notNull(),
    maxApplicants: integer("max_applicants").notNull(),
    currentApplicants: integer("current_applicants").default(0),
    // Support both old and new auth systems
    organizerId: uuid("organizer_id"), // Old system (UUID)
    betterAuthOrganizerId: text("better_auth_organizer_id"), // Better Auth (text)
    organizerName: text("organizer_name"),
    organizerEmail: text("organizer_email"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("activities_status_idx").on(table.status),
    index("activities_date_idx").on(table.date),
    index("activities_category_idx").on(table.category),
  ]
);

// Activity applications table
export const activityApplications = pgTable(
  "activity_applications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    activityId: uuid("activity_id")
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    userId: uuid("user_id"), // Old system (UUID)
    betterAuthUserId: text("better_auth_user_id"), // Better Auth (text)
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => [
    index("activity_apps_activity_user_unique").on(
      table.activityId,
      table.userId,
      table.betterAuthUserId
    ),
    index("activity_apps_activity_id_idx").on(table.activityId),
    index("activity_apps_better_auth_user_id_idx").on(table.betterAuthUserId),
  ]
);
