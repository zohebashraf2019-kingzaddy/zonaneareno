# Zona Nea Latin Lounge — La Casa del Perreo

Website for **Zona Nea Latin Lounge** · 434 N Virginia St, Reno, NV · 21+ · Thu–Sun.
Static site (HTML/CSS/JS) + one Vercel serverless function for the event inquiry form. No build step.
English / Spanish toggle built in.

## Deploy (Vercel)
1. Import this repo in Vercel → Framework preset: **Other** → Deploy.
2. Event inquiry email — Project → Settings → Environment Variables:
   - `RESEND_API_KEY` — from resend.com
   - `CONTACT_TO_EMAIL` *(optional)* — club inbox; defaults to `zona.nea.nvops@gmail.com` (comma-separate for several)
   - `CONTACT_FROM_EMAIL` *(optional)* — e.g. `Zona Nea Latin Lounge <events@yourdomain.com>` once a domain is verified in Resend
   Until `RESEND_API_KEY` is set, the form tells visitors to email zona.nea.nvops@gmail.com or DM @zonaneareno.

The site takes **event inquiries only** — no table reservations. VIP tables are first come, first served.

## Add a night to the calendar
Edit **`js/data/events.js`** → copy the template at the bottom of `ZONA_EVENTS`, fill in date, title, theme, DJs, doors, flyer. Commit — Vercel redeploys.
- Promotional flyers belong here (they show in the event pop-up), not in the gallery.
- `ZONA_WEEKLY` fills every Thu–Sun that has no special event.
- Put flyers in `assets/img/`.

## Menus (PDF)
Put the PDFs in `assets/menus/` and set the paths in **`js/data/menus.js`**. The "View Menu" buttons switch on automatically.

## Videos
Drop `my-video.mp4` + a cover `my-video.jpg` into `assets/reels/`, then add a line at the top of **`js/data/reels.js`**.
Videos tagged `Flyer` are kept out of the gallery. Keep videos under ~8 MB (720p or 540p H.264).

## Gallery photos
Add the image to `assets/img/` and copy a `<figure>` inside `#gallery-grid` in `index.html`
(`data-cat` = `nights` or `venue`).

## Spanish text
English copy lives in `index.html`; the Spanish for every `data-i18n` key is in **`js/i18n.js`**.

---
Website by [Nexora Digital](https://www.nexoradigital.live)
