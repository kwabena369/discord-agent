import { config } from "../config/index.js";
import { run_agent } from "../agent/loop.js";
import { get_history, add_to_history, clear_history } from "../memory/store.js";

const MAX_DISCORD_LENGTH = 1900; // Discord limit is 2000, leave buffer for safety

/**
 * @param {string} text
 * @returns {string[]}
 */
function chunk_message(text) {
  const chunks = [];
  let current = "";

  for (const line of text.split("\n")) {
    if ((current + "\n" + line).length > MAX_DISCORD_LENGTH) {
      if (current) chunks.push(current.trim());
      current = line;
    } else {
      current += (current ? "\n" : "") + line;
    }
  }

  if (current) chunks.push(current.trim());
  return chunks;
}

/**
 * @param {import("discord.js").Message} message
 */
export async function handle_message(message) {
  if (message.author.bot) return;

  if (message.author.id !== config.discord.allowed_user_id) return;

  const content = message.content.trim();

  if (content === "!clear" || content === "!reset") {
    clear_history(message.channelId);
    await message.reply("Conversation history cleared.");
    return;
  }

  if (content === "!help") {
    await message.reply(
      "** Agent Commands:**\n" +
        "Just type naturally — I'll figure out which tools to use.\n\n" +
        "**Examples:**\n" +
        "• `What's the weather in Accra?`\n" +
        "• `Convert 500 GHS to USD`\n" +
        "• `What's the latest news on AI?`\n" +
        "• `Search for best laptops under $500`\n" +
        "• `Tell me about Attack on Titan`\n" +
        "• `What anime should I watch right now?`\n\n" +
        "**Utility:**\n" +
        "• `!clear` — Reset conversation memory\n" +
        "• `!help` — Show this message"
    );
    return;
  }

  await message.channel.sendTyping();

  try {
    const history = get_history(message.channelId);

    console.log(`\nMessage from ${message.author.username}: ${content}`);

    const response = await run_agent(content, history);

    add_to_history(message.channelId, "user", content);
    add_to_history(message.channelId, "assistant", response);

    const chunks = chunk_message(response);
    for (const chunk of chunks) {
      await message.reply(chunk);
    }
  } catch (err) {
    console.error(" Agent error:", err);
    await message.reply(
      " Something went wrong on my end. Check the console for details."
    );
  }
}
