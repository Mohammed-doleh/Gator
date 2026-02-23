import { readConfig, setUser } from "./config";
import {createUser,getUserByName,deleteAllUsers,getUsers,} from "./lib/db/queries/users";
import {createFeed,getFeedsWithUsers,getFeedByUrl,getNextFeedToFetch,markFeedFetched,} from "./lib/db/queries/feeds";
import {createFeedFollow,getFeedFollowsForUser,deleteFeedFollow,} from "./lib/db/queries/feedFollows";
import { fetchFeed } from "./rss";
import { User } from "./lib/db/schema";
import { createPost,getPostsForUser  } from "./lib/db/queries/posts";
export type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

export type CommandHandler = (args: string[]) => Promise<void>;

type Command = {
  name: string;
  handler: CommandHandler;
};

export const commands: Command[] = [
  { name: "register", handler: register },
  { name: "login", handler: login },
  { name: "reset", handler: reset },
  { name: "users", handler: listUsers },
  { name: "agg", handler: handlerAgg },
  { name: "feeds", handler: listFeeds },
  { name: "addfeed", handler: middlewareLoggedIn(handlerAddFeed) },
  { name: "follow", handler: middlewareLoggedIn(handlerFollow) },
  { name: "following", handler: middlewareLoggedIn(handlerFollowing) },
  { name: "unfollow", handler: middlewareLoggedIn(handlerUnfollow) },
  { name: "browse", handler: middlewareLoggedIn(handlerBrowse) },
];

export async function runCommand(args: string[]) {
  const commandName = args[0];
  const commandArgs = args.slice(1);

  const command = commands.find((c) => c.name === commandName);

  if (!command) {
    throw new Error("Unknown command");
  }

  await command.handler(commandArgs);
}

/* ================= REGISTER ================= */

async function register(args: string[]): Promise<void> {
  const name = args[0];
  if (!name) throw new Error("You must provide a username.");

  const existingUser = await getUserByName(name);
  if (existingUser) throw new Error("User already exists.");

  const user = await createUser(name);
  await setUser(name);

  console.log("User created successfully!");
  console.log(user);
}

/* ================= LOGIN ================= */

async function login(args: string[]): Promise<void> {
  const name = args[0];
  if (!name) throw new Error("You must provide a username.");

  const user = await getUserByName(name);
  if (!user) throw new Error("User does not exist.");

  await setUser(name);
  console.log("Logged in successfully!");
}

/* ================= RESET ================= */

async function reset(): Promise<void> {
  await deleteAllUsers();
  console.log("Database reset successfully.");
}

/* ================= USERS ================= */

async function listUsers(): Promise<void> {
  const allUsers = await getUsers();
  const config = readConfig();
  const currentUser = config.currentUserName;

  for (const user of allUsers) {
    if (user.name === currentUser) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  }
}

/* ================= FEEDS ================= */

async function listFeeds(args: string[]): Promise<void> {
  if (args.length > 0) {
    console.error("Usage: feeds");
    process.exit(1);
  }

  const feeds = await getFeedsWithUsers();

  for (const feed of feeds) {
    console.log(`* ${feed.feedName}`);
    console.log(`  URL: ${feed.url}`);
    console.log(`  Created by: ${feed.userName}`);
  }
}

/* ================= AGGREGATOR ================= */

async function handlerAgg(args: string[]): Promise<void> {
  if (args.length !== 1) {
    console.error("Usage: agg <time_between_reqs>");
    process.exit(1);
  }

  const durationStr = args[0];
  const timeBetweenRequests = parseDuration(durationStr);

  console.log(`Collecting feeds every ${durationStr}`);

  await scrapeFeeds().catch(handleError);

  const interval = setInterval(() => {
    scrapeFeeds().catch(handleError);
  }, timeBetweenRequests);

  await new Promise<void>((resolve) => {
    process.on("SIGINT", () => {
      console.log("\nShutting down feed aggregator...");
      clearInterval(interval);
      resolve();
    });
  });
}

async function scrapeFeeds(): Promise<void> {
  const feed = await getNextFeedToFetch();

  if (!feed) {
    console.log("No feeds found.");
    return;
  }

  console.log(`Fetching feed: ${feed.name}`);

  await markFeedFetched(feed.id);

  const rss = await fetchFeed(feed.url);

for (const item of rss.channel.item) {
  const publishedAt = item.pubDate
    ? new Date(item.pubDate)
    : undefined;

  await createPost({
    title: item.title,
    url: item.link,
    description: item.description,
    publishedAt,
    feedId: feed.id,
  });
}for (const item of rss.channel.item) {
  const publishedAt = item.pubDate
    ? new Date(item.pubDate)
    : undefined;

  await createPost({
    title: item.title,
    url: item.link,
    description: item.description,
    publishedAt,
    feedId: feed.id,
  });
}
}

/* ================= MIDDLEWARE ================= */

function middlewareLoggedIn(
  handler: UserCommandHandler
): CommandHandler {
  return async (args: string[]) => {
    const config = readConfig();
    const userName = config.currentUserName;

    if (!userName) {
      console.error("You must be logged in.");
      process.exit(1);
    }

    const user = await getUserByName(userName);
    if (!user) {
      console.error(`User ${userName} not found`);
      process.exit(1);
    }

    await handler("", user, ...args);
  };
}

/* ================= FEED COMMANDS ================= */

async function handlerAddFeed(
  _cmd: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length !== 2) {
    console.error("Usage: addfeed <name> <url>");
    process.exit(1);
  }

  const [name, url] = args;

  const feed = await createFeed(name, url, user.id);
  await createFeedFollow(user.id, feed.id);

  console.log(`${user.name} is now following ${feed.name}`);
}

async function handlerFollow(
  _cmd: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length !== 1) {
    console.error("Usage: follow <url>");
    process.exit(1);
  }

  const feed = await getFeedByUrl(args[0]);
  if (!feed) {
    console.error("Feed not found");
    process.exit(1);
  }

  const follow = await createFeedFollow(user.id, feed.id);
  console.log(`${follow.userName} is now following ${follow.feedName}`);
}

async function handlerFollowing(
  _cmd: string,
  user: User
): Promise<void> {
  const follows = await getFeedFollowsForUser(user.id);

  for (const follow of follows) {
    console.log(`* ${follow.feedName}`);
  }
}

async function handlerUnfollow(
  _cmd: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length !== 1) {
    console.error("Usage: unfollow <url>");
    process.exit(1);
  }

  const feed = await getFeedByUrl(args[0]);
  if (!feed) {
    console.error("Feed not found");
    process.exit(1);
  }

  await deleteFeedFollow(user.id, feed.id);
  console.log(`${user.name} unfollowed ${feed.name}`);
}

/* ================= HELPERS ================= */

function parseDuration(durationStr: string): number {
  const regex = /^(\d+)(ms|s|m|h)$/;
  const match = durationStr.match(regex);

  if (!match) throw new Error("Invalid duration format");

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "ms":
      return value;
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    default:
      throw new Error("Invalid duration unit");
  }
}

function handleError(err: unknown) {
  console.error("Error:", err);
}

async function handlerBrowse(
  _cmd: string,
  user: User,
  ...args: string[]
): Promise<void> {
  const limit = args[0] ? parseInt(args[0]) : 2;

  const posts = await getPostsForUser(user.id, limit);

  for (const post of posts) {
    console.log(`\n${post.title}`);
    console.log(post.url);
    if (post.publishedAt) {
      console.log(`Published: ${post.publishedAt}`);
    }
    if (post.description) {
      console.log(post.description.substring(0, 200));
    }
  }
}