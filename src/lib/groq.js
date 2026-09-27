// Provider-agnostic LLM wrapper.
//
// It talks to any OpenAI-compatible chat endpoint. Default is Groq, but you can
// re-point at OpenRouter / Cerebras / etc. by changing two env vars, with no
// code changes. That's the guard against free-tier model churn: if Groq deletes
// a model overnight, you swap GROQ_MODEL/GROQ_BASE_URL and you're back up.

const BASE_URL = process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1";
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

function apiKey() {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not set. Add it to .env.local.");
  return key;
}

/**
 * Low-level chat call.
 * @param {Array<{role:string, content:string}>} messages
 * @param {{ json?: boolean, temperature?: number }} opts
 * @returns {Promise<string>} the assistant's text content
 */
export async function chat(messages, { json = false, temperature = 0.4 } = {}) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`LLM request failed (${res.status}): ${detail.slice(0, 300)}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "";
}

/**
 * Chat call that must return valid JSON. Groq occasionally wraps JSON in prose
 * or code fences even in JSON mode, so we strip fences and retry once.
 * @template T
 * @returns {Promise<T>}
 */
export async function chatJSON(messages, opts = {}) {
  const clean = (s) => s.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();

  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await chat(messages, { ...opts, json: true });
    try {
      return JSON.parse(clean(raw));
    } catch {
      if (attempt === 1) {
        throw new Error("Model did not return valid JSON after a retry.");
      }
    }
  }
}
