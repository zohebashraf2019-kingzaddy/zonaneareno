/**
 * Vercel serverless function — booking / contact form.
 * Sends the request by email through Resend (https://resend.com, free tier).
 *
 * Set these in Vercel → Project → Settings → Environment Variables:
 *   RESEND_API_KEY     your Resend API key
 *   CONTACT_TO_EMAIL   where bookings should go (the club's email)
 *   CONTACT_FROM_EMAIL optional, e.g. "Zonanea Website <bookings@yourdomain.com>"
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
  if (body.company) return res.status(200).json({ ok: true });

  const clean = (v, max = 2000) => String(v == null ? "" : v).replace(/[<>]/g, "").trim().slice(0, max);
  const data = {
    name: clean(body.name, 120),
    email: clean(body.email, 200),
    phone: clean(body.phone, 40),
    type: clean(body.type, 80),
    date: clean(body.date, 20),
    guests: clean(body.guests, 20),
    message: clean(body.message, 4000)
  };

  if (!data.name || !data.message || !/^\S+@\S+\.\S+$/.test(data.email)) {
    return res.status(400).json({ error: "Missing or invalid fields" });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!key || !to) {
    return res.status(503).json({ error: "Email is not configured yet" });
  }

  const rows = [
    ["Name", data.name], ["Email", data.email], ["Phone", data.phone || "—"],
    ["Request", data.type || "—"], ["Date", data.date || "—"], ["Guests", data.guests || "—"]
  ];
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px">
      <h2 style="color:#0b5e30;margin:0 0 12px">New request — Zonanea website</h2>
      <table style="border-collapse:collapse;width:100%">
        ${rows.map(([k, v]) => `<tr><td style="padding:6px 10px;background:#f4f1e6;font-weight:bold;width:120px">${k}</td><td style="padding:6px 10px;border-bottom:1px solid #eee">${v}</td></tr>`).join("")}
      </table>
      <p style="white-space:pre-wrap;margin-top:16px;padding:12px;background:#fafafa;border-left:3px solid #d9b45a">${data.message}</p>
    </div>`;

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.CONTACT_FROM_EMAIL || "Zonanea Website <onboarding@resend.dev>",
        to: to.split(",").map((s) => s.trim()),
        reply_to: data.email,
        subject: `🍾 ${data.type || "New request"} — ${data.name}${data.date ? " · " + data.date : ""}`,
        html
      })
    });
    if (!r.ok) throw new Error(await r.text());
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("contact send failed", err);
    return res.status(502).json({ error: "Could not send" });
  }
};
