// Vercel serverless function: proxies ZenQuotes server-side (its free tier sends no
// CORS headers, so the browser can't call it directly) and caches the response at
// the edge so many visitors share a small number of upstream requests.
export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const upstream = await fetch("https://zenquotes.io/api/quotes");
    if (!upstream.ok) {
      return res.status(502).json({ error: "Upstream quotes service unavailable" });
    }

    const data = await upstream.json();
    const quotes = Array.isArray(data)
      ? data
          .filter((entry) => entry && entry.q && entry.a)
          .map((entry) => ({ quote: entry.q, author: entry.a }))
      : [];

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json({ quotes });
  } catch (err) {
    return res.status(502).json({ error: "Failed to fetch quotes" });
  }
}
