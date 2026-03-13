# 🤖 Discord AI Agent

A personal AI agent running on Discord, powered by Groq (LLaMA 3.3 70B) with 5 real tools.

## Tools
| Tool | API | Cost |
|---|---|---|
| 🌤 Weather | OpenWeatherMap | Free (1000 req/day) |
| 💱 Currency | Frankfurter | Free forever, no key |
| 📰 News | NewsAPI | Free (100 req/day) |
| 🔍 Web Search | Tavily | Free (1000 req/month) |
| 🎌 Anime | Jikan (MAL) | Free forever, no key |

---

## Setup

### 1. Clone and install
```bash
git clone <your-repo>
cd discord-agent
npm install
```

### 2. Create your `.env` file
```bash
cp .env.example .env
```
Then fill in your API keys (see below for where to get each one).

### 3. Get your API keys

| Key | Where to get it |
|---|---|
| `GROQ_API_KEY` | https://console.groq.com |
| `DISCORD_TOKEN` | https://discord.com/developers/applications |
| `ALLOWED_USER_ID` | Discord → Settings → Advanced → Developer Mode → right-click your name → Copy ID |
| `OPENWEATHER_API_KEY` | https://openweathermap.org/api |
| `NEWS_API_KEY` | https://newsapi.org |
| `TAVILY_API_KEY` | https://tavily.com |

### 4. Create your Discord bot

1. Go to https://discord.com/developers/applications
2. Click **New Application** → give it a name
3. Go to **Bot** tab → click **Add Bot**
4. Under **Privileged Gateway Intents**, enable:
   - ✅ Message Content Intent
5. Copy the token → paste into `.env` as `DISCORD_TOKEN`
6. Go to **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Bot Permissions: `Send Messages`, `Read Message History`, `Read Messages/View Channels`
7. Copy the generated URL → open in browser → add bot to your server

### 5. Run it

```bash
# Production
npm start

# Development (auto-restarts on file changes)
npm run dev
```

---

## Usage

Just talk to it naturally in any channel the bot is in, or DM it.

```
What's the weather in Accra?
Convert 1000 GHS to USD
What's the latest news on AI in Africa?
Search for the best budget smartphones 2025
Tell me about Demon Slayer
What anime is trending right now?
```

### Commands
| Command | Action |
|---|---|
| `!clear` | Reset conversation memory for this channel |
| `!help` | Show help message |

---

## Project Structure

```
discord-agent/
├── src/
│   ├── index.js              ← Entry point
│   ├── config/
│   │   └── index.js          ← Env vars loader
│   ├── agent/
│   │   ├── loop.js           ← Core agent loop (the brain)
│   │   └── tools.js          ← Tool registry + executor
│   ├── tools/
│   │   ├── weather.js        ← OpenWeatherMap
│   │   ├── currency.js       ← Frankfurter
│   │   ├── news.js           ← NewsAPI
│   │   ├── search.js         ← Tavily
│   │   └── anime.js          ← Jikan/MAL
│   ├── discord/
│   │   ├── bot.js            ← Discord client setup
│   │   └── handler.js        ← Message routing
│   └── memory/
│       └── store.js          ← Per-channel conversation memory
├── .env.example
├── .gitignore
└── package.json
```

---

## How it works

```
You (Discord message)
        ↓
  handler.js          ← receives message, checks auth
        ↓
  agent/loop.js       ← sends to Groq with tool schemas
        ↓
  Groq decides:
    ├── Call a tool?  → tools.js executes it → result fed back to Groq
    └── Done?         → returns final text response
        ↓
  Discord reply       ← chunked if > 1900 chars
```
