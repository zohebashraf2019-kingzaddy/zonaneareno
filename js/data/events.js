/* ==========================================================================
   ZONANEA — EVENTS CALENDAR DATA
   --------------------------------------------------------------------------
   HOW TO ADD A NIGHT:
   Copy one block inside ZONA_EVENTS, paste it, change the details, save,
   commit to GitHub — Vercel redeploys automatically.

   date      "YYYY-MM-DD" (required)
   title     Name of the night (required)
   theme     Short theme tag shown on the calendar (e.g. "Halloween", "Jungle")
   djs       List of DJs. Use { name, ig } — ig is their Instagram handle
   doors     Time text, e.g. "5PM – 5AM"
   flyer     Path to a flyer image in assets/img/ (optional)
   dress     Dress code / costume note (optional)
   desc      One or two lines about the night
   featured  true = highlighted as the big "This Weekend" card
   ========================================================================== */

window.ZONA_EVENTS = [
  {
    date: "2026-10-10",
    title: "La Maldición del Faraón",
    theme: "Egyptian Night",
    djs: [{ name: "DJ Acme", ig: "itsdjacme" }, { name: "DJ Disco Lazer", ig: "djdiscolazer" }],
    doors: "4PM – 6AM",
    flyer: "assets/img/faraon.jpg",
    desc: "La maldición se apodera de Zonanea. Una noche de misterio, música y perreo intenso hasta el amanecer."
  },
  {
    date: "2026-10-22",
    title: "Noche de Tentaciones",
    theme: "Halloween Week",
    djs: [{ name: "Santi", ig: "alotlikesanti" }],
    doors: "Doors 5PM",
    desc: "Halloween week kicks off. Come tempted, leave legendary."
  },
  {
    date: "2026-10-23",
    title: "Las Brujas También Perrean",
    theme: "Halloween Week",
    djs: [{ name: "Deni", ig: "deni_cl_23" }],
    doors: "Doors 5PM",
    dress: "Brujas welcome",
    desc: "Witches night out — the coven hits the dance floor."
  },
  {
    date: "2026-10-24",
    title: "Perreo Paranormal",
    theme: "Halloween Week",
    djs: [{ name: "DJ Papichulo", ig: "dj_papichulo" }, { name: "DJ Johan Ortiz", ig: "djohan_ortiz1" }],
    doors: "Doors 5PM",
    desc: "Reno Zombie Crawl weekend. Dressed to impress… or scare."
  },
  {
    date: "2026-10-25",
    title: "La Cura",
    theme: "Halloween Week",
    djs: [{ name: "Santi", ig: "alotlikesanti" }],
    doors: "Doors 5PM",
    desc: "The Sunday cure for the whole weekend."
  },
  {
    date: "2026-10-31",
    title: "Halloween Bellako",
    theme: "Halloween",
    djs: [{ name: "DJ Dennis" }, { name: "DJ La Firma" }],
    doors: "One night only",
    flyer: "assets/img/halloween-bellako.jpg",
    dress: "Costumes on",
    desc: "Reno showed up and showed out. One for the books — until next Halloween."
  }

  /* ---- ADD NEW NIGHTS BELOW (copy this template) ----
  ,{
    date: "2026-11-14",
    title: "Name of the night",
    theme: "Theme",
    djs: [{ name: "DJ Name", ig: "instagram_handle" }],
    doors: "Doors 5PM – 5AM",
    flyer: "assets/img/your-flyer.jpg",
    dress: "Dress code",
    desc: "Short description.",
    featured: true
  }
  */
];

/* --------------------------------------------------------------------------
   WEEKLY NIGHTS — fill every open night (Thu–Sun) that doesn't have a
   special event above. Day numbers: 0 = Sun, 4 = Thu, 5 = Fri, 6 = Sat.
   Delete or rename any of these as the real weekly lineup is confirmed.
   -------------------------------------------------------------------------- */
window.ZONA_WEEKLY = [
  { day: 4, title: "Jueves Latino", theme: "Latin Hits", doors: "Doors 5PM", desc: "Reggaetón, salsa & bachata to kick off the weekend." },
  { day: 5, title: "Viernes de Perreo", theme: "Reggaetón", doors: "Doors 5PM – 5AM", desc: "La Casa del Perreo at full volume." },
  { day: 6, title: "Jungle Saturdays", theme: "Jungle Night", doors: "Doors 4PM – 5AM", dress: "Best jungle outfit 🌴🐆", desc: "Reno's wildest jungle night. Come dressed in your best jungle look.", djs: [{ name: "Deni", ig: "deni_cl_23" }, { name: "Santi", ig: "alotlikesanti" }] },
  { day: 0, title: "Domingo Bellako", theme: "Reggaetón", doors: "Doors 5PM", desc: "Close the weekend the right way." }
];
