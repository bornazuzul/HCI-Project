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

export const activities = pgTable("activities", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  date: date("date").notNull(),
  time: text("time").notNull(),
  location: text("location").notNull(),
  maxApplicants: integer("max_applicants").notNull(),
  organizerId: uuid("organizer_id"),
  createdAt: timestamp("created_at").defaultNow(),
});
