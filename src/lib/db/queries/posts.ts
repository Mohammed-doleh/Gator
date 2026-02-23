import { db } from "../index";
import { posts } from "../schema";
import { desc, eq } from "drizzle-orm";
import { feedFollows } from "../schema";
import { feeds } from "../schema";
export async function createPost(data: {
  title: string;
  url: string;
  description?: string;
  publishedAt?: Date;
  feedId: string;
}) {
  try {
    const [post] = await db
      .insert(posts)
      .values({
        title: data.title,
        url: data.url,
        description: data.description,
        publishedAt: data.publishedAt,
        feedId: data.feedId,
      })
      .returning();

    return post;
  } catch {
    // Ignore duplicate URL errors
    return null;
  }
}
export async function getPostsForUser(
  userId: string,
  limit: number
) {
  return db
    .select({
      title: posts.title,
      url: posts.url,
      description: posts.description,
      publishedAt: posts.publishedAt,
    })
    .from(posts)
    .innerJoin(feeds, eq(posts.feedId, feeds.id))
    .innerJoin(feedFollows, eq(feeds.id, feedFollows.feedId))
    .where(eq(feedFollows.userId, userId))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}