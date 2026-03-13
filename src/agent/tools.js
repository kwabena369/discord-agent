import { get_weather, weather_schema } from "../tools/weather.js";
import { convert_currency, currency_schema } from "../tools/currency.js";
import { get_news, news_schema } from "../tools/news.js";
import { web_search, search_schema } from "../tools/search.js";
import {
  search_anime,
  get_top_anime,
  anime_search_schema,
  anime_top_schema,
} from "../tools/anime.js";

// All tool schemas sent to Groq so it knows what it can call
export const tool_schemas = [
  weather_schema,
  currency_schema,
  news_schema,
  search_schema,
  anime_search_schema,
  anime_top_schema,
];

// Maps function name → actual JS function
export const tool_executor = {
  get_weather: ({ city }) => get_weather(city),
  convert_currency: ({ amount, from, to }) => convert_currency(amount, from, to),
  get_news: ({ query, count }) => get_news(query, count),
  web_search: ({ query }) => web_search(query),
  search_anime: ({ title }) => search_anime(title),
  get_top_anime: ({ count }) => get_top_anime(count),
};

/**
 * Executes a tool call returned by Groq.
 * @param {object} tool_call - The tool_call object from Groq response
 * @returns {string} The result string to feed back to the LLM
 */
export async function execute_tool(tool_call) {
  const name = tool_call.function.name;
  const args = JSON.parse(tool_call.function.arguments);

  console.log(`Calling tool: ${name}`, args);

  const handler = tool_executor[name];
  if (!handler) {
    return `Error: Unknown tool "${name}"`;
  }

  const result = await handler(args);
  console.log(`Tool result from ${name}:`, result.slice(0, 100) + "...");
  return result;
}
