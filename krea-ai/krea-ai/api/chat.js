// Vercel serverless function. Your API key lives in an environment variable, never in the page.
const SYSTEM = "You are a friendly, helpful AI assistant. Answer clearly and concisely. Use Markdown (short lists, **bold**, fenced code blocks) when it helps.";
const hits = new Map(); // best-effort per-IP limit (resets when the function restarts)
const LIMIT = 30, WINDOW = 60 * 60 * 1000;

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "POST only." });
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });

  const ip = (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter(t => now - t < WINDOW);
  if (recent.length >= LIMIT) return res.status(429).json({ error: "Hourly message limit reached. Please try again later." });
  recent.push(now); hits.set(ip, recent);

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const msgs = Array.isArray(body && body.messages) ? body.messages.slice(-20) : [];
  const clean = msgs
    .filter(m => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
  if (!clean.length || clean[clean.length - 1].role !== "user") return res.status(400).json({ error: "Invalid request." });
  while (clean[0].role !== "user") clean.shift();
  const nowText = typeof body.now === "string" ? body.now.slice(0, 200) : "";

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || "claude-sonnet-5-5",
        max_tokens: 1024,
        system: SYSTEM + " " + nowText,
        messages: clean
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: (data.error && data.error.message) || "The AI service returned an error." });
    const text = (data.content || []).filter(b => b.type === "text").map(b => b.text).join("\n");
    return res.status(200).json({ text: text || "(No response.)" });
  } catch (e) {
    return res.status(502).json({ error: "Could not reach the AI service." });
  }
};
