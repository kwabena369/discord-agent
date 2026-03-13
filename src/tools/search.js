import { config } from "../config/index.js";

/**
 * Searches the web using Tavily's AI-optimized search API.
 * Returns clean, relevant results — not raw HTML junk.
 * @param {string} query - What to search for
 */
export async function web_search(query) {
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: config.tools.tavily_api_key,
        query,
        search_depth: "basic",
        max_results: 4,
        include_answer: true, // Tavily gives an AI summary too
      }),
    });

    if (!res.ok) {
      return `Search failed with status ${res.status}`;
    }

    const data = await res.json();

    const lines = [`🔍 **Search results for "${query}":**\n`];

    // Tavily's own AI answer — often really useful
    if (data.answer) {
      lines.push(`**Quick answer:** ${data.answer}\n`);
    }

    for (const [i, result] of (data.results ?? []).entries()) {
      lines.push(
        `**${i + 1}. ${result.title}**\n` +
          `${result.content?.slice(0, 200)}...\n` +
          `🔗 ${result.url}\n`
      );
    }

    return lines.join("\n");
  } catch (err) {
    return `Search tool error: ${err.message}`;
  }
}

export const search_schema = {
  type: "function",
  function: {
    name: "web_search",
    description:
      "Search the web for any topic, fact, or real-time information. Use this when the user asks something that requires current or specific information you might not know — prices, events, people, tutorials, anything.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query. Make it specific and clear.",
        },
      },
      required: ["query"],
    },
  },
};
