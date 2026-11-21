// Stores pre-order emails from the landing page (preorder/) in Workers KV, one key per address.
// POST / with JSON {email, consent, company}; "company" is a hidden honeypot that people leave empty.
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,24}$/;

function reply(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": origin,
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type",
      vary: "origin",
    },
  });
}

export default {
  async fetch(request, env) {
    const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get("origin") || "";
    const allow = allowed.includes(origin) ? origin : allowed[0] || "";

    if (request.method === "OPTIONS") return reply({}, 204, allow);
    if (request.method !== "POST") return reply({ error: "method" }, 405, allow);
    if (allowed.length && !allowed.includes(origin)) return reply({ error: "origin" }, 403, allow);

    let data;
    try {
      data = await request.json();
    } catch {
      return reply({ error: "json" }, 400, allow);
    }
    if (data.company) return reply({ ok: true }, 200, allow); // bot: pretend success, store nothing
    const email = String(data.email || "").trim().toLowerCase();
    if (!EMAIL.test(email)) return reply({ error: "email" }, 400, allow);
    if (data.consent !== true) return reply({ error: "consent" }, 400, allow);

    const existing = await env.PREORDERS.get(email);
    if (!existing) {
      await env.PREORDERS.put(email, JSON.stringify({ at: new Date().toISOString() }));
    }
    return reply({ ok: true, already: Boolean(existing) }, 200, allow);
  },
};
