/* ==========================================================================
   ZONA NEA LATIN LOUNGE — EVENTS CALENDAR DATA
   --------------------------------------------------------------------------
   HOW TO ADD A NIGHT:
   Copy one block inside ZONA_EVENTS, paste it, change the details, save,
   commit to GitHub — Vercel redeploys automatically.

   date      "YYYY-MM-DD" (required)
   title     Name of the night (required)
   theme     Short theme tag shown on the calendar (e.g. "Caribbean", "Jungle")
   djs       List of DJs. Use { name, ig } — ig is their Instagram handle
   doors     Time text, e.g. "5PM – 5AM"
   flyer     Path to a flyer image in assets/img/ (optional)
   dress     Dress code / costume note (optional)
   sound     Music styles for the night (optional)
   promo     Drink / bottle special (optional)
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
    desc: "La maldición se apodera de Zona Nea. Una noche de misterio, música y perreo intenso hasta el amanecer."
  },
  {
    date: "2026-11-19",
    title: "Jueves Bebiembre",
    theme: "La Casa del Perreo",
    djs: [{ name: "DJ La Firma" }, { name: "Santi", ig: "alotlikesanti" }],
    doors: "4PM – 4AM",
    flyer: "assets/img/jueves-bebiembre.jpg",
    desc: "¿Ya tienes planes para este fincho? Donde el perreo no para y la rumba se prende."
  },
  {
    date: "2026-11-20",
    title: "Que Onda Perdida",
    theme: "La Casa del Perreo",
    djs: [{ name: "DJ Leo", ig: "djleo1994" }],
    doors: "4PM – 4AM",
    flyer: "assets/img/que-onda-perdida.jpg",
    desc: "La rumba se prende y la noche se pone buena."
  },
  {
    date: "2026-11-21",
    title: "OhNana",
    theme: "La Casa del Perreo",
    djs: [{ name: "DJ Young B", ig: "youngb_22official" }],
    doors: "4PM – 4AM",
    flyer: "assets/img/ohnana.jpg",
    desc: "Full house, crazy mixes and energy at an all-time high."
  },
  {
    date: "2026-11-22",
    title: "TQM",
    theme: "La Casa del Perreo",
    djs: [{ name: "DJ La Firma" }, { name: "Santi", ig: "alotlikesanti" }],
    doors: "4PM – 4AM",
    flyer: "assets/img/tqm.jpg",
    desc: "Porque lo que pasa en ZONA… se queda en ZONA."
  },
  {
    date: "2026-11-25",
    title: "Thanksgiving Eve Party",
    theme: "Wednesday Before Thanksgiving",
    djs: [{ name: "DJ La Firma" }],
    doors: "4PM – 4AM",
    flyer: "assets/img/thanksgiving-eve.jpg",
    promo: "$50 USD off every bottle",
    desc: "The day before Thanksgiving — everyone's favorite night to go out. Zona Nea is bringing the best pre-Thanksgiving party in Reno. $50 USD descuento en todas las botellas. VIP tables are first come, first served.",
    featured: true
  },
  {
    date: "2026-12-03",
    title: "Caribbean Vibes",
    theme: "Caribbean & Latin Night",
    djs: [{ name: "DJ Young B", ig: "youngb_22official" }, { name: "DJ D-Rav" }, { name: "DJ La Firma" }, { name: "DJ Carl" }, { name: "Wett" }],
    doors: "9PM – 2AM",
    flyer: "assets/img/caribbean-vibes.jpg",
    sound: "Reggaetón · Dancehall · Afrobeats · Hip-Hop · R&B · Reggae · Dembow",
    desc: "Caribbean Vibes is taking over Thursdays! Bring your crew, bring the vibes, and let's make Thursday the new Friday. One love. 🇯🇲🇨🇴🇵🇦",
    featured: true
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
  { day: 4, title: "Jueves Latino", theme: "Latin Hits", doors: "4PM – 4AM", desc: "Reggaetón, salsa & bachata to kick off the weekend." },
  { day: 5, title: "Viernes de Perreo", theme: "Reggaetón", doors: "4PM – 4AM", desc: "La Casa del Perreo at full volume." },
  { day: 6, title: "Jungle Saturdays", theme: "Jungle Night", doors: "4PM – 4AM", dress: "Best jungle outfit 🌴🐆", desc: "Reno's wildest jungle night. Come dressed in your best jungle look.", djs: [{ name: "Deni", ig: "deni_cl_23" }, { name: "Santi", ig: "alotlikesanti" }] },
  { day: 0, title: "Domingo Bellako", theme: "Reggaetón", doors: "4PM – 4AM", desc: "Close the weekend the right way." }
];
