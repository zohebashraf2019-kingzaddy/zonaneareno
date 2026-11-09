# Zonanea Latin Lounge — La Casa del Perreo

Website for **Zonanea Latin Lounge** · 434 N Virginia St, Reno, NV · 21+ · Thu–Sun.
Static site (HTML/CSS/JS) + one Vercel serverless function for the booking form. No build step.

## Deploy (Vercel)
1. Import this repo in Vercel → Framework preset: **Other** → Deploy.
2. Booking form email — Project → Settings → Environment Variables:
   - `RESEND_API_KEY` — from resend.com
   - `CONTACT_TO_EMAIL` — club inbox (comma-separate for several)
   - `CONTACT_FROM_EMAIL` *(optional)* — e.g. `Zonanea <bookings@zonanea.com>` once a domain is verified in Resend
   Until these are set, the form tells visitors to DM @zonaneareno on Instagram.

## Add a night to the calendar
Edit **`js/data/events.js`** → copy the template at the bottom of `ZONA_EVENTS`, fill in date, title, theme, DJs, doors, flyer. Commit — Vercel redeploys.
- `featured`/special nights show in gold on the calendar.
- `ZONA_WEEKLY` fills every Thu–Sun that has no special event (edit/delete as the weekly lineup changes).
- Put flyers in `assets/img/`.

## Add a reel
Drop `my-reel.mp4` + a cover `my-reel.jpg` into `assets/reels/`, then add a line at the top of **`js/data/reels.js`**.
Tip: keep reels under ~8 MB (720p or 540p H.264).

## Add gallery photos
Add the image to `assets/img/` and copy a `<figure>` inside `#gallery-grid` in `index.html`
(`data-cat` = `nights`, `themes` or `venue`).

---
Website by [Nexora Digital](https://www.nexoradigital.live)
