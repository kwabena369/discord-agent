export async function convert_currency(amount, from, to) {
  try {
    const from_upper = from.toUpperCase();
    const to_upper = to.toUpperCase();

    const url = `https://open.er-api.com/v6/latest/${from_upper}`;
    const res = await fetch(url);

    if (!res.ok) return `Currency API unreachable. Please try again in a moment.`;

    const data = await res.json();
    if (data.result === "error") return `Currency code "${from_upper}" not supported.`;

    const rate = data.rates[to_upper];
    if (!rate) return `Currency code "${to_upper}" not supported.`;

    const converted = (amount * rate).toFixed(2);
    const rate_display = rate < 0.01 ? rate.toFixed(6) : rate.toFixed(4);

    return (
      `💱 **${amount} ${from_upper} = ${converted} ${to_upper}**\n` +
      `_Rate: 1 ${from_upper} = ${rate_display} ${to_upper}_\n` +
      `_Updated: ${new Date(data.time_last_update_utc).toDateString()}_`
    );
  } catch (err) {
    return `Currency tool error: ${err.message}`;
  }
}


export const currency_schema = {
  type: "function",
  function: {
    name: "convert_currency",
    description:
      "Convert an amount from one currency to another. Use this when the user asks about currency conversion, exchange rates, or 'how much is X in Y currency'. Supports all major currencies including GHS (Ghana Cedi), USD, EUR, GBP, NGN, etc.",
    parameters: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "The amount to convert",
        },
        from: {
          type: "string",
          description: "The source currency code (e.g. USD, GHS, EUR)",
        },
        to: {
          type: "string",
          description: "The target currency code (e.g. USD, GHS, EUR)",
        },
      },
      required: ["amount", "from", "to"],
    },
  },
};