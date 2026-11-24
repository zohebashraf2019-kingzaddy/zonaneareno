/**
 * Vercel serverless function — event inquiry form.
 * Sends the inquiry by email through Resend (https://resend.com, free tier).
 *
 * Set these in Vercel → Project → Settings → Environment Variables:
 *   RESEND_API_KEY     your Resend API key
 *   CONTACT_TO_EMAIL   optional — where inquiries go (defaults to zona.nea.nvops@gmail.com)
 *   CONTACT_FROM_EMAIL optional, e.g. "Zona Nea Latin Lounge <events@yourdomain.com>"
 *                      (defaults to Resend's onboarding sender until a domain is verified)
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body = req.body;
  if (typeof body === "string") { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};

  // honeypot — bots fill hidden fields
  if (body.website_url) return res.status(200).json({ ok: true });

  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clean = (v, max = 200) => String(v == null ? "" : v).trim().slice(0, max);
  const CATEGORIES = ["Social Celebration", "Corporate Event", "Exclusive Venue Rental"];
  const services = (Array.isArray(body.services) ? body.services : body.services ? [body.services] : [])
    .map((s) => clean(s, 60)).filter(Boolean).slice(0, 10);

  const data = {
    name: clean(body.name, 120),
    organization: clean(body.organization, 160),
    phone: clean(body.phone, 40),
    email: clean(body.email, 200),
    category: clean(body.category, 60),
    date: clean(body.date, 20),
    altDate: clean(body.altDate, 20),
    startTime: clean(body.startTime, 10),
    endTime: clean(body.endTime, 10),
    guests: clean(body.guests, 10),
    venue: clean(body.venue, 40),
    budget: clean(body.budget, 40),
    message: clean(body.message, 4000),
    lang: body.lang === "es" ? "Spanish" : "English"
  };

  const missing = !data.name || !data.phone || !data.date || !data.startTime || !data.endTime || !data.guests || !data.budget || !data.message;
  if (missing || !CATEGORIES.includes(data.category) || !/^\S+@\S+\.\S+$/.test(data.email) || !body.age) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL || "zona.nea.nvops@gmail.com";
  if (!key || !to) {
    return res.status(503).json({ error: "Email is not configured yet" });
  }

  const to12 = (t) => {
    const m = /^(\d{1,2}):(\d{2})/.exec(t); if (!m) return t;
    const h = +m[1]; return `${(h % 12) || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
  };
  const rows = [
    ["Category", data.category],
    ["Name", data.name],
    ["Company / Org.", data.organization || "—"],
    ["Phone", data.phone],
    ["Email", data.email],
    ["Preferred date", data.date],
    ["Alternative date", data.altDate || "—"],
    ["Time", `${to12(data.startTime)} – ${to12(data.endTime)}`],
    ["Guests", data.guests],
    ["Venue", data.venue || "—"],
    ["Budget", data.budget],
    ["Services", services.length ? services.join(", ") : "—"],
    ["Age confirmed", "Yes"],
    ["Site language", data.lang]
  ];
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;color:#0B0B0B">
      <h2 style="color:#102E25;margin:0 0 4px">New event inquiry — Zona Nea Latin Lounge</h2>
      <p style="margin:0 0 14px;color:#666;font-size:13px">Inquiry only — not a confirmed reservation. Reply to this email to reach the guest.</p>
      <table style="border-collapse:collapse;width:100%">
        ${rows.map(([k, v]) => `<tr><td style="padding:7px 10px;background:#F3EADF;font-weight:bold;width:150px">${esc(k)}</td><td style="padding:7px 10px;border-bottom:1px solid #eee">${esc(v)}</td></tr>`).join("")}
      </table>
      <p style="white-space:pre-wrap;margin-top:16px;padding:12px;background:#fafafa;border-left:3px solid #D4AF37">${esc(data.message)}</p>
    </div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Zona Nea Website <onboarding@resend.dev>",
        to: to.split(",").map((s) => s.trim()),
        reply_to: data.email,
        subject: `Event Inquiry · ${data.category} — ${data.name} · ${data.date}`,
        html
      })
    });
    if (!r.ok) throw new Error(await r.text());
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("inquiry send failed", err);
    return res.status(502).json({ error: "Could not send" });
  }
};
