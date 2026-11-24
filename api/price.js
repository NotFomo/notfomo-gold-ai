export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.TWELVE_DATA_API_KEY;
  if (!key) return res.status(500).json({ error: "TWELVE_DATA_API_KEY is not configured in Vercel." });
  try {
    const url = new URL("https://api.twelvedata.com/price");
    url.searchParams.set("symbol", "XAU/USD");
    url.searchParams.set("apikey", key);
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok || data.status === "error" || !data.price) {
      return res.status(response.status || 502).json({ error: data.message || data.code || "Twelve Data did not return a price." });
    }
    return res.status(200).json({ symbol: "XAU/USD", price: data.price, source: "Twelve Data", retrievedAt: new Date().toISOString() });
  } catch (e) {
    return res.status(502).json({ error: "Could not reach Twelve Data.", detail: e.message });
  }
}