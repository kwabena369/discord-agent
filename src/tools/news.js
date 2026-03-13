import { config } from "../config/index.js";

/**
 * Fetches top news headlines by topic or country.
 * @param {string} query - Topic to search e.g. "AI", "Ghana", "tech"
 * @param {number} count - Number of articles to return (max 5)
 */
export async function get_news(query, count = 5) {
  try {
    const url = new URL("https://newsapi.org/v2/everything");
    url.searchParams.set("q", query);
    url.searchParams.set("pageSize", Math.min(count, 5));
    url.searchParams.set("sortBy", "publishedAt");
    url.searchParams.set("language", "en");
    url.searchParams.set("apiKey", config.tools.news_api_key);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.status !== "ok") {
      return `News fetch failed: ${data.message}`;
    }

    if (data.articles.length === 0) {
      return `No news found for "${query}". Try a different topic.`;
    }

    const articles = data.articles.slice(0, count);
    const lines = [`📰 **Top news for "${query}":**\n`];

    for (const [i, article] of articles.entries()) {
      lines.push(
        `**${i + 1}. ${article.title}**\n` +
          `${article.description ?? "No description"}\n` +
          `🔗 ${article.url}\n`
      );
    }

    return lines.join("\n");
  } catch (err) {
    return `News tool error: ${err.message}`;
  }
}

export const news_schema = {
  type: "function",
  function: {
    name: "get_news",
    description:
      "Get the latest news headlines on any topic. Use this when the user asks about news, current events, what is happening, or recent developments on any subject.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            'The topic or keyword to search news for, e.g. "AI Ghana", "crypto", "football", "space"',
        },
        count: {
          type: "number",
          description: "How many articles to return. Default is 5, max is 5.",
        },
      },
      required: ["query"],
    },
  },
};
