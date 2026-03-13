import { Client, GatewayIntentBits } from "discord.js";
import { config } from "../config/index.js";
import { handle_message } from "./handler.js";


export function create_bot() {
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent, 
      GatewayIntentBits.DirectMessages,
    ],
  });

  client.once("ready", () => {
    console.log(`\n Bot is online as: ${client.user.tag}`);
    console.log(`Only responding to user ID: ${config.discord.allowed_user_id}`);
    console.log(` Using model: ${config.groq.model}`);
    console.log(`\n Tools loaded: weather, currency, news, search, anime`);
    console.log(`\n Send a message in any server the bot is in, or DM it.`);
  });

  client.on("messageCreate", handle_message);

  client.on("error", (err) => {
    console.error("Discord client error:", err);
  });

  client.login(config.discord.token);

  return client;
}
