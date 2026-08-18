// Client-side helper for calling the /api/ai proxy route.
// Used by every module's "Live AI Mode" path.

function friendlyError(err) {
  if (err === "missing_api_key") {
    return "No API key configured. Add GEMINI_API_KEY to .env.local and restart the server.";
  }
  if (err === "network_error")
    return "Couldn't reach the AI service. Check your connection and try again.";
  if (err === "empty_response")
    return "The AI returned an empty response. Try again.";
  if (err === "truncated_response")
    return "The AI response was cut off before finishing. Try again with a shorter prompt or higher maxTokens.";
  return typeof err === "string"
    ? err
    : "Something went wrong reaching the AI.";
}

export async function askAI(prompt, { system, maxTokens, json } = {}) {
  let res, data;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, prompt, maxTokens, json }),
    });
    data = await res.json();
  } catch {
    throw new Error(friendlyError("network_error"));
  }
  if (!res.ok || data.error) {
    throw new Error(friendlyError(data.error));
  }
  return data.text;
}

export function extractJson(text) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1)
    throw new Error("The AI response wasn't valid JSON. Try again.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function askAIJson(prompt, opts = {}) {
  // Ask the route to use Gemini's native JSON mode so the model is
  // constrained to emit valid JSON only (no markdown fences, no prose).
  const text = await askAI(prompt, { ...opts, json: true });
  return extractJson(text);
}
