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

// export const activities = pgTable("activities", {
//   id: uuid("id").defaultRandom().primaryKey(),
//   title: text("title").notNull(),
//   description: text("description").notNull(),
//   category: text("category").notNull(),
//   date: date("date").notNull(),
//   time: text("time").notNull(),
//   location: text("location").notNull(),
//   maxApplicants: integer("max_applicants").notNull(),
//   organizerId: uuid("organizer_id"),
//   createdAt: timestamp("created_at").defaultNow(),
// });

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  maxApplicants: integer("max_applicants").notNull(),
  organizerId: uuid("organizer_id").references(() => profiles.id, {
    onDelete: "set null",
  }), // Foreign key
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").notNull(),
  organizerName: text("organizer_name"),
  organizerEmail: text("organizer_email"),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").default("user"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Create a new schema for activity applicants
export const activityApplicants = pgTable("activity_applicants", {
  id: uuid("id").defaultRandom().primaryKey(),
  activityId: uuid("activity_id")
    .notNull()
    .references(() => activities.id),
  userId: uuid("user_id").notNull(),
  status: text("status").default("pending").notNull(), // pending, approved, rejected
  appliedAt: timestamp("applied_at").defaultNow(),
});
