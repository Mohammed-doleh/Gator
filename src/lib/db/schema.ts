import { pgTable, uuid, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { feeds } from "./schema"; // adjust if needed
//
// USERS TABLE
//
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),

  name: text("name").notNull().unique(),
});

//
// FEEDS TABLE
//
export const feeds = pgTable("feeds", {
  id: uuid("id").defaultRandom().primaryKey(),

  createdAt: timestamp("created_at")
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull(),

  name: text("name").notNull(),

  url: text("url").notNull().unique(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
    lastFetchedAt: timestamp("last_fetched_at", { withTimezone: true }),
});

//
// FEED FOLLOWS TABLE (Many-to-Many)
//
export const feedFollows = pgTable(
  "feed_follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    createdAt: timestamp("created_at")
      .notNull()
      .defaultNow(),

    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    feedId: uuid("feed_id")
      .notNull()
      .references(() => feeds.id, { onDelete: "cascade" }),
  },
  (table) => ({
    userFeedUnique: uniqueIndex("user_feed_unique")
      .on(table.userId, table.feedId),
  })
);
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),

  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),

  title: text("title").notNull(),

  url: text("url").notNull().unique(),

  description: text("description"),

  publishedAt: timestamp("published_at", { withTimezone: true }),

  feedId: uuid("feed_id")
    .references(() => feeds.id)
    .notNull(),
});
//
// TYPES
//
export type User = typeof users.$inferSelect;
export type Feed = typeof feeds.$inferSelect;
export type FeedFollow = typeof feedFollows.$inferSelect;