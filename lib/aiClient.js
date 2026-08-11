// Client-side helper for calling the /api/ai proxy route.
// Used by every module's "Live AI Mode" path.

function friendlyError(err) {
  if (err === "missing_api_key") {
    return "No API key configured. Add ANTHROPIC_API_KEY to .env.local and restart the server.";
  }
  if (err === "network_error") return "Couldn't reach the AI service. Check your connection and try again.";
  if (err === "empty_response") return "The AI returned an empty response. Try again.";
  return typeof err === "string" ? err : "Something went wrong reaching the AI.";
}

export async function askAI(prompt, { system, maxTokens } = {}) {
  let res, data;
  try {
    res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, prompt, maxTokens }),
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
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("The AI response wasn't valid JSON. Try again.");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function askAIJson(prompt, opts = {}) {
  const text = await askAI(prompt, opts);
  return extractJson(text);
}
