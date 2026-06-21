export default {
  async fetch(request, env) {

    // ── CORS preflight ────────────────────────────────────────────────────────
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "https://ardneb.github.io",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // ── Only allow POST ───────────────────────────────────────────────────────
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response("Invalid JSON body", { status: 400 });
    }

    // ── Forward to Anthropic ──────────────────────────────────────────────────
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });

    const data = await anthropicRes.json();

    // ── Return with CORS headers ──────────────────────────────────────────────
    return new Response(JSON.stringify(data), {
      status: anthropicRes.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "https://ardneb.github.io",
      },
    });
  },
};
