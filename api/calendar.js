function dateOnly(d) { return d.toISOString().slice(0, 10); }
export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.FMP_API_KEY;
  if (!key) return res.status(500).json({ error: "FMP_API_KEY is not configured in Vercel." });
  const from = dateOnly(new Date());
  const toDate = new Date(); toDate.setUTCDate(toDate.getUTCDate() + 7);
  const to = dateOnly(toDate);
  try {
    const url = new URL("https://financialmodelingprep.com/stable/economic-calendar");
    url.searchParams.set("from", from); url.searchParams.set("to", to);
    url.searchParams.set("country", "US"); url.searchParams.set("apikey", key);
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || !Array.isArray(data)) {
      const message = data?.["Error Message"] || data?.message || "FMP economic calendar request failed.";
      const status = response.status || 502;
      return res.status(status).json({ error: status === 402 ? "FMP economic calendar is not included in the current plan. Upgrade the plan or use another calendar source." : message, providerStatus: status });
    }
    return res.status(200).json({ source: "Financial Modeling Prep", timezone: "UTC", from, to, events: data });
  } catch (e) {
    return res.status(502).json({ error: "Could not reach Financial Modeling Prep.", detail: e.message });
  }
}