/**
 * Professor AI — Cloudflare Worker backend (hidden-key proxy)
 * ------------------------------------------------------------
 * This little server sits between the website and the Claude API. It holds
 * your Anthropic API key as a server-side SECRET, so visitors to the site
 * never see it and never need their own key.
 *
 * Deploy: see worker/README.md for click-by-click instructions.
 *
 * Required secret (set in the Cloudflare dashboard, NOT in this file):
 *   ANTHROPIC_API_KEY = sk-ant-...
 */

// Only requests coming from your live website are accepted (stops other
// websites from quietly using your key). Update this if your site URL changes.
const ALLOWED_ORIGIN = "https://amiralidaemi30000-dotcom.github.io";

// Guardrails so the key can't be abused for giant/expensive requests.
const ALLOWED_MODELS = new Set(["claude-sonnet-4-6"]);
const MAX_TOKENS_CAP = 16000;

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Vary": "Origin",
    };

    // Browser preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ error: { message: "Method not allowed" } }, 405, cors);
    }

    // Origin lock — reject calls from anywhere except the allowed site.
    const origin = request.headers.get("Origin") || "";
    if (origin && origin !== ALLOWED_ORIGIN) {
      return json({ error: { message: "Forbidden origin" } }, 403, cors);
    }

    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: { message: "Server is missing ANTHROPIC_API_KEY secret." } }, 500, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: { message: "Invalid JSON body" } }, 400, cors);
    }

    // Build the upstream request with guardrails applied.
    const model = ALLOWED_MODELS.has(body.model) ? body.model : "claude-sonnet-4-6";
    const max_tokens = Math.min(MAX_TOKENS_CAP, Math.max(1, Number(body.max_tokens) || 16000));

    const payload = {
      model,
      max_tokens,
      system: body.system,
      messages: body.messages,
    };
    if (body.output_config) payload.output_config = body.output_config;

    let upstream;
    try {
      upstream = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      return json({ error: { message: "Upstream request failed: " + (e && e.message) } }, 502, cors);
    }

    // Pass Anthropic's JSON response straight back to the browser.
    const text = await upstream.text();
    return new Response(text, {
      status: upstream.status,
      headers: { ...cors, "content-type": "application/json" },
    });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "content-type": "application/json" },
  });
}
