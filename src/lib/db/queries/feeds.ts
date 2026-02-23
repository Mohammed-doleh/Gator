import { db } from "../index";
import { feeds, users } from "../schema";
import type { User } from "../schema";
import type { Feed } from "../schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export function printFeed(feed: Feed, user: User) {
  console.log("Feed:");
  console.log("ID:", feed.id);
  console.log("Name:", feed.name);
  console.log("URL:", feed.url);
  console.log("User:", user.name);
  console.log("Created At:", feed.createdAt);
}
export async function createFeed(
  name: string,
  url: string,
  userId: string
) {
  const [feed] = await db
    .insert(feeds)
    .values({
      name,
      url,
      userId,
    })
    .returning();

  return feed;
}  
export async function getFeedsWithUsers() {
  return await db
    .select({
      feedName: feeds.name,
      url: feeds.url,
      userName: users.name,
    })
    .from(feeds)
    .innerJoin(users, eq(feeds.userId, users.id));
}
export async function getFeedByUrl(url: string) {
  const [feed] = await db
    .select()
    .from(feeds)
    .where(eq(feeds.url, url));

  return feed;
}
export async function markFeedFetched(feedId: string): Promise<void> {
  await db
    .update(feeds)
    .set({
      lastFetchedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(feeds.id, feedId));
}
export async function getNextFeedToFetch() {
  const result = await db
    .select()
    .from(feeds)
    .orderBy(sql`last_fetched_at NULLS FIRST`)
    .limit(1);

  return result[0];
}

