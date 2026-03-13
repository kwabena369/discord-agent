import { config } from "../config/index.js";

/**
 * @param {string} city 
 */
export async function get_weather(city) {
  try {
    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("q", city);
    url.searchParams.set("appid", config.tools.openweather_api_key);
    url.searchParams.set("units", "metric");

    const res = await fetch(url.toString());
    if (!res.ok) {
      const err = await res.json();
      return `Could not get weather for "${city}". Reason: ${err.message}`;
    }

    const data = await res.json();
    const { name, sys, main, weather, wind } = data;

    return [
      ` ${name}, ${sys.country}`,
      `Condition: ${weather[0].description}`,
      ` Temperature: ${main.temp}°C (feels like ${main.feels_like}°C)`,
      ` Humidity: ${main.humidity}%`,
      ` Wind: ${wind.speed} m/s`,
      `Min/Max today: ${main.temp_min}°C / ${main.temp_max}°C`,
    ].join("\n");
  } catch (err) {
    return `Weather tool error: ${err.message}`;
  }
}

export const weather_schema = {
  type: "function",
  function: {
    name: "get_weather",
    description:
      "Get the current weather for any city in the world. Use this when the user asks about weather, temperature, rain, or climate conditions.",
    parameters: {
      type: "object",
      properties: {
        city: {
          type: "string",
          description:
            'The city name to get weather for. Be specific, e.g. "Accra" or "London, UK".',
        },
      },
      required: ["city"],
    },
  },
};
