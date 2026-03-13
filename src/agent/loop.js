import Groq from "groq-sdk";
import { config } from "../config/index.js";
import { tool_schemas, execute_tool } from "./tools.js";

const groq = new Groq({ apiKey: config.groq.api_key });

const SYSTEM_PROMPT = `You are a sharp, capable personal AI assistant running on Discord. 
Your owner calls you from Discord and you handle tasks for them.

You have access to these tools:
- get_weather: check weather anywhere
- convert_currency: convert between currencies (GHS, USD, EUR, GBP, etc.)
- get_news: get latest news on any topic
- web_search: search the web for anything
- search_anime: search for any anime by name
- get_top_anime: get top currently airing anime

RULES:
- Always use tools when the user's question requires real-time or specific data.
- If you can answer from your own knowledge confidently, do so without calling a tool.
- Be concise and direct. No fluff. Respond like a smart assistant, not a chatbot.
- When returning tool results, present them cleanly — don't just dump raw data.
- You can chain multiple tools in one response if the user's request needs it.`;

/**
 * Runs the agent loop for a single user message.
 * Keeps looping until Groq stops calling tools and gives a final answer.
 *
 * @param {string} user_message - The user's message
 * @param {Array}  history      - Previous messages in this conversation session
 * @returns {string} The final response to send back to Discord
 */
export async function run_agent(user_message, history = []) {
  // Build the full message history
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
    { role: "user", content: user_message },
  ];

  const MAX_ITERATIONS = 5; // Safety cap — prevents infinite loops
  let iterations = 0;

  while (iterations < MAX_ITERATIONS) {
    iterations++;
    console.log(`\n Agent iteration ${iterations}`);

    const response = await groq.chat.completions.create({
      model: config.groq.model,
      messages,
      tools: tool_schemas,
      tool_choice: "auto",
      max_tokens: 1024,
    });

    const choice = response.choices[0];
    const message = choice.message;

    // ── Case 1: Model wants to call one or more tools ──────────────────
    if (choice.finish_reason === "tool_calls" && message.tool_calls?.length) {
      // Add the model's decision to history so it sees what it chose
      messages.push(message);

      // Execute all tool calls (could be parallel in future)
      for (const tool_call of message.tool_calls) {
        const result = await execute_tool(tool_call);

        // Feed the result back as a "tool" role message
        messages.push({
          role: "tool",
          tool_call_id: tool_call.id,
          content: result,
        });
      }

      // Loop continues — Groq will now see the results and decide
      // whether to call more tools or give a final answer
      continue;
    }

    // ── Case 2: Model is done — return the final text answer ──────────
    if (choice.finish_reason === "stop") {
      return message.content ?? "I ran into an issue generating a response.";
    }

    // ── Case 3: Unexpected finish reason ──────────────────────────────
    console.warn(`Unexpected finish_reason: ${choice.finish_reason}`);
    return "Something unexpected happened. Please try again.";
  }

  return "I hit my iteration limit trying to answer that. Please rephrase your question.";
}
