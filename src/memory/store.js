/**
 * Conversation Memory
 *
 * Stores recent message history per Discord channel so the agent
 * has context across multiple messages in the same conversation.
 *
 * This is in-memory only — it resets when the bot restarts.
 * For persistent memory across restarts, swap Map for a JSON file or SQLite.
 */

const MAX_HISTORY = 10; // Keep last 10 exchanges (user + assistant pairs)

// channel_id → array of {role, content} messages
const sessions = new Map();

/**
 * Get conversation history for a channel.
 * @param {string} channel_id
 * @returns {Array} message history
 */
export function get_history(channel_id) {
  return sessions.get(channel_id) ?? [];
}

/**
 * Append a user or assistant message to history.
 * @param {string} channel_id
 * @param {"user"|"assistant"} role
 * @param {string} content
 */
export function add_to_history(channel_id, role, content) {
  if (!sessions.has(channel_id)) {
    sessions.set(channel_id, []);
  }

  const history = sessions.get(channel_id);
  history.push({ role, content });

  // Trim to max history — remove oldest pairs first
  if (history.length > MAX_HISTORY * 2) {
    history.splice(0, 2); // remove oldest user+assistant pair
  }
}

/**
 * Clear conversation history for a channel.
 * Triggered by the user typing "!clear" or "!reset".
 * @param {string} channel_id
 */
export function clear_history(channel_id) {
  sessions.delete(channel_id);
}
