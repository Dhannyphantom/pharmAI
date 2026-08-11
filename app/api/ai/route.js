// Server-side proxy to the Anthropic API. Keeps the API key off the client entirely.
// Requires ANTHROPIC_API_KEY to be set in .env.local (see .env.local.example).

const MODEL = "claude-sonnet-5";

export async function POST(req) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "missing_api_key" }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const { system, prompt, maxTokens } = body || {};
  if (!prompt) {
    return Response.json({ error: "missing_prompt" }, { status: 400 });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens || 900,
        system: system || undefined,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      const message = data?.error?.message || `Anthropic API error (${upstream.status})`;
      return Response.json({ error: message }, { status: upstream.status });
    }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    if (!text) {
      return Response.json({ error: "empty_response" }, { status: 502 });
    }

    return Response.json({ text });
  } catch (e) {
    return Response.json({ error: "network_error" }, { status: 502 });
  }
}
