// Server-side proxy to the Gemini API. Keeps the API key off the client entirely.
// Requires GEMINI_API_KEY to be set in .env.local (see .env.local.example).

const MODEL = "gemini-2.5-flash";

export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "missing_api_key" }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }

  const { system, prompt, maxTokens, json } = body || {};
  if (!prompt) {
    return Response.json({ error: "missing_prompt" }, { status: 400 });
  }

  try {
    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          systemInstruction: system ? { parts: [{ text: system }] } : undefined,
          generationConfig: {
            maxOutputTokens: maxTokens || 1200,
            // Gemini 2.5 models "think" by default, and thinking tokens are
            // deducted from maxOutputTokens. Left on, the budget can be
            // consumed entirely by invisible reasoning, leaving nothing for
            // the actual answer and triggering MAX_TOKENS with empty text.
            // Turn it off for this proxy since it's just doing direct Q&A /
            // JSON extraction, not tasks that benefit from deep reasoning.
            thinkingConfig: { thinkingBudget: 0 },
            // When the caller wants JSON back (e.g. askAIJson), force Gemini
            // to emit valid JSON only — no markdown fences, no commentary.
            ...(json ? { responseMimeType: "application/json" } : {}),
          },
        }),
      },
    );

    const data = await upstream.json();

    if (!upstream.ok) {
      const message =
        data?.error?.message || `Gemini API error (${upstream.status})`;
      return Response.json({ error: message }, { status: upstream.status });
    }

    const candidate = data.candidates?.[0];

    const text = (candidate?.content?.parts || [])
      .filter((p) => typeof p.text === "string")
      .map((p) => p.text)
      .join("\n")
      .trim();

    // If Gemini cut the response off before finishing (commonly because
    // maxTokens was too low), surface that distinctly from a plain empty
    // response so the caller can react appropriately (e.g. raise maxTokens).
    if (candidate?.finishReason === "MAX_TOKENS") {
      return Response.json({ error: "truncated_response" }, { status: 502 });
    }

    // Gemini can also withhold output entirely due to safety filtering
    // without returning an HTTP error.
    if (
      candidate?.finishReason === "SAFETY" ||
      candidate?.finishReason === "BLOCKLIST"
    ) {
      return Response.json(
        { error: "The AI declined to respond to this prompt." },
        { status: 502 },
      );
    }

    if (!text) {
      return Response.json({ error: "empty_response" }, { status: 502 });
    }

    return Response.json({ text });
  } catch (e) {
    return Response.json({ error: "network_error" }, { status: 502 });
  }
}
