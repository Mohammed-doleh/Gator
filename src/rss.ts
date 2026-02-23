import { XMLParser } from "fast-xml-parser";

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  // 1️⃣ Fetch
  const response = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch feed");
  }

  const xmlText = await response.text();

  // 2️⃣ Parse XML
  const parser = new XMLParser({
    ignoreAttributes: false,
  });

  const parsed = parser.parse(xmlText);

  if (!parsed.rss || !parsed.rss.channel) {
    throw new Error("Invalid RSS feed structure");
  }

  const channel = parsed.rss.channel;

  // 3️⃣ Validate metadata
  if (!channel.title || !channel.link || !channel.description) {
    throw new Error("Missing required channel fields");
  }

  // 4️⃣ Extract items
  let itemsRaw = channel.item;
  let itemsArray: any[] = [];

  if (Array.isArray(itemsRaw)) {
    itemsArray = itemsRaw;
  } else if (itemsRaw) {
    itemsArray = [itemsRaw];
  }

  const items: RSSItem[] = [];

  for (const item of itemsArray) {
    if (!item.title || !item.link || !item.description || !item.pubDate) {
      continue;
    }

    items.push({
      title: item.title,
      link: item.link,
      description: item.description,
      pubDate: item.pubDate,
    });
  }

  // 5️⃣ Assemble result
  return {
    channel: {
      title: channel.title,
      link: channel.link,
      description: channel.description,
      item: items,
    },
  };
}