/**
 * Anime tool powered by Jikan — the unofficial MyAnimeList API.
 * Completely free, no API key needed.
 * Rate limited to ~60 requests per minute — more than enough.
 */

/**
 * Search for anime by title.
 * @param {string} title - Anime title to search
 */
export async function search_anime(title) {
  try {
    const url = `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(title)}&limit=3&sfw=true`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      return `No anime found for "${title}". Try a different title.`;
    }

    const lines = [`🎌 **Anime results for "${title}":**\n`];

    for (const anime of data.data) {
      lines.push(
        `**${anime.title}** (${anime.title_english ?? "No English title"})\n` +
          `⭐ Score: ${anime.score ?? "N/A"} | 📺 Episodes: ${anime.episodes ?? "?"} | Status: ${anime.status}\n` +
          `🎭 Genres: ${anime.genres?.map((g) => g.name).join(", ") || "N/A"}\n` +
          `📖 ${anime.synopsis?.slice(0, 200) ?? "No synopsis"}...\n` +
          `🔗 ${anime.url}\n`
      );
    }

    return lines.join("\n");
  } catch (err) {
    return `Anime search error: ${err.message}`;
  }
}

/**
 * Get top ranked anime of all time.
 * @param {number} count - How many to return
 */
export async function get_top_anime(count = 5) {
  try {
    const url = `https://api.jikan.moe/v4/top/anime?limit=${Math.min(count, 10)}&filter=airing`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.data || data.data.length === 0) {
      return "Could not fetch top anime right now. Try again in a moment.";
    }

    const lines = [`🏆 **Top Anime Currently Airing:**\n`];
    for (const [i, anime] of data.data.entries()) {
      lines.push(
        `**${i + 1}. ${anime.title}** — ⭐ ${anime.score ?? "N/A"}\n` +
          `${anime.synopsis?.slice(0, 120) ?? ""}...\n`
      );
    }

    return lines.join("\n");
  } catch (err) {
    return `Top anime error: ${err.message}`;
  }
}

export const anime_search_schema = {
  type: "function",
  function: {
    name: "search_anime",
    description:
      "Search for information about a specific anime — synopsis, score, episodes, genres. Use when the user asks about a specific anime title.",
    parameters: {
      type: "object",
      properties: {
        title: {
          type: "string",
          description: "The anime title to search for",
        },
      },
      required: ["title"],
    },
  },
};

export const anime_top_schema = {
  type: "function",
  function: {
    name: "get_top_anime",
    description:
      "Get the currently top-ranked or best airing anime. Use when the user asks for anime recommendations, what to watch, or what anime is popular right now.",
    parameters: {
      type: "object",
      properties: {
        count: {
          type: "number",
          description: "How many anime to return. Default 5, max 10.",
        },
      },
      required: [],
    },
  },
};
