export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.OPENAI_API_KEY;
  if (!key) return res.status(500).json({ error: "OPENAI_API_KEY is not configured in Vercel." });
  try {
    const origin = new URL(req.headers.origin || `https://${req.headers.host}`);
    const [priceResponse, calendarResponse] = await Promise.all([
      fetch(new URL("/api/price", origin)),
      fetch(new URL("/api/calendar", origin))
    ]);
    const price = await priceResponse.json();
    const calendar = await calendarResponse.json();
    const usablePrice = priceResponse.ok ? price : null;
    const events = calendarResponse.ok && Array.isArray(calendar.events) ? calendar.events.slice(0, 30) : [];
    const input = [
      "Ты аналитический помощник сайта NOTFOMO GOLD AI. Дай краткий, осторожный обзор факторов для XAU/USD на русском языке.",
      "Не выдумывай котировки, события, прогнозы или технические уровни. Если данных недостаточно, прямо скажи об этом и выбери WAIT.",
      "Не давай гарантий и не представляй вывод как персональную инвестиционную рекомендацию.",
      "Структура: SIGNAL (BUY/SELL/WAIT), Контекст, Влияние событий, Риски/что проверить.",
      "Текущая котировка (может быть недоступна): " + JSON.stringify(usablePrice),
      "Экономические события США на ближайшие дни (могут быть недоступны из-за тарифа): " + JSON.stringify(events),
      "Статус календаря: " + (calendarResponse.ok ? "доступен" : (calendar.error || "недоступен"))
    ].join("\n\n");
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-6.2-astra", input, max_output_tokens: 500 })
    });
    const result = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: result.error?.message || "OpenAI API request failed." });
    const text = (result.output || []).flatMap(item => item.content || []).filter(item => item.type === "output_text").map(item => item.text).join("\n");
    const match = text.match(/SIGNAL\s*[:：-]?\s*(BUY|SELL|WAIT)/i);
    return res.status(200).json({ signal: match ? match[1].toUpperCase() : "WAIT", analysis: text || "Недостаточно данных для анализа." });
  } catch (e) {
    return res.status(502).json({ error: "AI analysis request failed.", detail: e.message });
  }
}