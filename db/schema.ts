import {
  pgTable,
  serial,
  text,
  boolean,
  integer,
  timestamp,
  date,
  uuid,
} from "drizzle-orm/pg-core";

export const pages = pgTable("pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().unique(),
  path: text("path").notNull().unique(),
  includeInProd: boolean("include_in_prod").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  maxApplicants: integer("max_applicants").notNull(),
  currentApplicants: integer("current_applicants").default(0),
  organizerId: uuid("organizer_id").references(() => profiles.id),
  organizerName: text("organizer_name"),
  organizerEmail: text("organizer_email"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activityApplications = pgTable("activity_applications", {
  id: uuid("id").defaultRandom().primaryKey(),
  activityId: uuid("activity_id").references(() => activities.id),
  userId: uuid("user_id").references(() => profiles.id),
  createdAt: timestamp("created_at").defaultNow(),
});
