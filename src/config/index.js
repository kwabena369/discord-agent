import "dotenv/config";

function require_env(key) {
  const value = process.env[key];
  if (!value) {
    console.error(`❌ Missing required environment variable: ${key}`);
    console.error(`   Copy .env.example to .env and fill in your keys.`);
    process.exit(1);
  }
  return value;
}

export const config = {
  groq: {
    api_key: require_env("GROQ_API_KEY"),
    model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  },
  discord: {
    token: require_env("DISCORD_TOKEN"),
    allowed_user_id: require_env("ALLOWED_USER_ID"),
  },
  tools: {
    openweather_api_key: require_env("OPENWEATHER_API_KEY"),
    news_api_key: require_env("NEWS_API_KEY"),
    tavily_api_key: require_env("TAVILY_API_KEY"),
  },
};
