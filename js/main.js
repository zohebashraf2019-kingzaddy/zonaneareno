/* ==========================================================================
   ZONANEA — site behaviour
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k, sess) { try { return (sess ? sessionStorage : localStorage).getItem(k); } catch (e) { return null; } },
    set(k, v, sess) { try { (sess ? sessionStorage : localStorage).setItem(k, v); } catch (e) {} }
  };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const EVENTS = (window.ZONA_EVENTS || []).slice();
  const WEEKLY = window.ZONA_WEEKLY || [];
  const REELS = window.ZONA_REELS || [];
  const OPEN_DAYS = [4, 5, 6, 0]; // Thu, Fri, Sat, Sun

  const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const DOW_LONG = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  /* ---------------- dates ---------------- */
  const pad = (n) => String(n).padStart(2, "0");
  const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayKey = keyOf(today);
  const fmtLong = (d) => `${DOW_LONG[d.getDay()]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;

  const specialsByDate = {};
  EVENTS.forEach((e) => { if (e && e.date) (specialsByDate[e.date] = specialsByDate[e.date] || []).push(Object.assign({ special: true }, e)); });

  /** Events for a day: specials first; otherwise the weekly night (only for today & future). */
  function eventsOn(d) {
    const k = keyOf(d);
    if (specialsByDate[k]) return specialsByDate[k];
    if (d >= today) {
      const w = WEEKLY.find((x) => x.day === d.getDay());
      if (w) return [Object.assign({ date: k, weekly: true }, w)];
    }
    return [];
  }

  function upcoming(n) {
    const out = [];
    const d = new Date(today);
    for (let i = 0; i < 400 && out.length < n; i++) {
      eventsOn(d).forEach((e) => out.push(e));
      d.setDate(d.getDate() + 1);
    }
    return out.slice(0, n);
  }

  function startTime(ev) {
    const d = parseKey(ev.date);
    const m = /(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i.exec(ev.doors || "");
    let h = 17, min = 0;
    if (m) { h = (+m[1] % 12) + (m[3].toUpperCase() === "PM" ? 12 : 0); min = +(m[2] || 0); }
    d.setHours(h, min, 0, 0);
    return d;
  }

  /* ---------------- age gate ---------------- */
  const gate = $("#ageGate");
  if (store.get("zona-21") !== "yes") {
    gate.hidden = false;
    document.body.classList.add("locked");
    $("#ageYes").addEventListener("click", () => {
      store.set("zona-21", "yes");
      gate.hidden = true;
      document.body.classList.remove("locked");
    });
  }

  /* ---------------- nav ---------------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  const toggle = $("#navToggle"), links = $("#navLinks");
  toggle.addEventListener("click", () => {
    const open = !links.classList.contains("open");
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
    document.body.classList.toggle("locked", open);
  });
  $$("a", links).forEach((a) => a.addEventListener("click", () => {
    links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("locked");
  }));

  /* ---------------- reveal on scroll ---------------- */
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    $$(".reveal").forEach((el) => io.observe(el));
  } else $$(".reveal").forEach((el) => el.classList.add("in"));

  /* ---------------- hero: next night + countdown ---------------- */
  const next = upcoming(1)[0];
  if (next) {
    $("#nextUp").hidden = false;
    $("#nextTitle").textContent = next.title;
    $("#nextDate").textContent = `${fmtLong(parseKey(next.date))}${next.doors ? " · " + next.doors : ""}`;
    const target = startTime(next);
    const cd = $("#countdown");
    const tick = () => {
      let s = Math.max(0, Math.floor((target - new Date()) / 1000));
      if (s === 0) { cd.innerHTML = `<div><b>LIVE</b><small>Doors open</small></div>`; return; }
      const d = Math.floor(s / 86400); s %= 86400;
      const h = Math.floor(s / 3600); s %= 3600;
      const m = Math.floor(s / 60); s %= 60;
      cd.innerHTML = [["Days", d], ["Hrs", h], ["Min", m], ["Sec", s]].map(([l, v]) => `<div><b>${pad(v)}</b><small>${l}</small></div>`).join("");
    };
    tick(); setInterval(tick, 1000);
  }

  /* ---------------- this weekend strip ---------------- */
  (function renderWeekend() {
    const el = $("#weekend");
    const nights = upcoming(4);
    if (!nights.length) { el.remove(); return; }
    el.innerHTML = `<div class="wk-label"><h3>Next nights at <span class="foil">Zona</span></h3><span>Tap a night for the lineup</span></div>` +
      nights.map((e, i) => {
        const d = parseKey(e.date);
        return `<button class="wk ${e.special ? "special" : ""}" data-ev="${i}">
          <span class="wk-day">${DOW_LONG[d.getDay()]}</span>
          <div class="wk-date">${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}</div>
          <h4>${esc(e.title)}</h4>
          <p>${esc(e.doors || "")}</p>
          ${e.theme ? `<span class="wk-theme">${esc(e.theme)}</span>` : ""}
        </button>`;
      }).join("");
    $$(".wk", el).forEach((b) => b.addEventListener("click", () => openEvent(nights[+b.dataset.ev])));
  })();

  /* ---------------- calendar ---------------- */
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  const grid = $("#calGrid");

  function renderMonth() {
    $("#calMonth").textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;
    const first = new Date(view);
    const start = new Date(first); start.setDate(1 - first.getDay());
    const cells = [];
    const map = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start); d.setDate(start.getDate() + i);
      if (i >= 35 && d.getMonth() !== view.getMonth()) break;
      const evs = eventsOn(d);
      const out = d.getMonth() !== view.getMonth();
      const cls = ["cal-cell", out && "out", keyOf(d) === todayKey && "today", !OPEN_DAYS.includes(d.getDay()) && !evs.length && "closed"].filter(Boolean).join(" ");
      const chips = evs.map((e) => {
        map.push(e);
        const past = parseKey(e.date) < today;
        return `<button class="cal-ev ${e.special ? "special" : ""} ${past ? "past" : ""}" data-i="${map.length - 1}" aria-label="${esc(e.title)}, ${fmtLong(d)}">${esc(e.title)}${e.theme ? `<small>${esc(e.theme)}</small>` : ""}</button>`;
      }).join("");
      cells.push(`<div class="${cls}"><span class="cal-num">${d.getDate()}</span>${chips}</div>`);
    }
    grid.innerHTML = cells.join("");
    $$(".cal-ev", grid).forEach((b) => b.addEventListener("click", () => openEvent(map[+b.dataset.i])));
    // mobile: tapping a whole cell opens its first event
    $$(".cal-cell", grid).forEach((c) => c.addEventListener("click", (ev) => {
      if (ev.target.closest(".cal-ev")) return;
      const b = $(".cal-ev", c); if (b && window.innerWidth <= 880) b.click();
    }));
  }

  function renderList() {
    const items = upcoming(16);
    $("#upList").innerHTML = items.length ? items.map((e, i) => {
      const d = parseKey(e.date);
      const djs = (e.djs || []).map((x) => x.name).join(" · ");
      return `<li><button class="up-item" data-i="${i}">
        <div class="up-date"><small>${DOW[d.getDay()]}</small><b>${d.getDate()}</b><small>${MONTHS[d.getMonth()].slice(0, 3)}</small></div>
        <div class="up-info"><h4>${esc(e.title)}</h4><p>${esc([e.theme, e.doors, djs].filter(Boolean).join(" · "))}</p></div>
        <span class="up-arrow">›</span></button></li>`;
    }).join("") : `<li><p>New nights dropping soon — follow @zonaneareno.</p></li>`;
    $$(".up-item").forEach((b) => b.addEventListener("click", () => openEvent(items[+b.dataset.i])));
  }

  $("#calPrev").addEventListener("click", () => { view.setMonth(view.getMonth() - 1); renderMonth(); });
  $("#calNext").addEventListener("click", () => { view.setMonth(view.getMonth() + 1); renderMonth(); });
  $$(".seg button").forEach((b) => b.addEventListener("click", () => {
    $$(".seg button").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
    const list = b.dataset.view === "list";
    $("#calMonthView").hidden = list; $("#calListView").hidden = !list;
    $(".cal-nav").style.visibility = list ? "hidden" : "visible";
  }));
  renderMonth(); renderList();

  /* ---------------- modals (shared) ---------------- */
  let lastFocus = null;
  function openModal(m) { lastFocus = document.activeElement; m.hidden = false; document.body.classList.add("locked"); const x = $("[data-close]", m); x && x.focus(); }
  function closeModal(m) {
    m.hidden = true; document.body.classList.remove("locked");
    $$("video", m).forEach((v) => v.pause());
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  $$(".modal").forEach((m) => {
    m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) closeModal(m); });
  });
  document.addEventListener("keydown", (e) => {
    const open = $$(".modal").find((m) => !m.hidden);
    if (!open) return;
    if (e.key === "Escape") closeModal(open);
    if (open.id === "reelModal") { if (e.key === "ArrowRight") stepReel(1); if (e.key === "ArrowLeft") stepReel(-1); }
    if (open.id === "lightbox") { if (e.key === "ArrowRight") stepLb(1); if (e.key === "ArrowLeft") stepLb(-1); }
  });

  /* ---------------- event modal ---------------- */
  function openEvent(e) {
    if (!e) return;
    const d = parseKey(e.date);
    const past = d < today;
    const djs = (e.djs || []).map((x) => x.ig ? `<a href="https://www.instagram.com/${esc(x.ig)}/" target="_blank" rel="noopener">${esc(x.name)}</a>` : esc(x.name)).join(" · ");
    const rows = [
      ["Theme", esc(e.theme)],
      ["Music", djs || (e.weekly ? "Resident Zona DJs" : "")],
      ["Sound", esc(e.sound)],
      ["Doors", esc(e.doors)],
      ["Special", esc(e.promo)],
      ["Dress", esc(e.dress)],
      ["Entry", "21+ · Valid ID required"]
    ].filter((r) => r[1]);
    $("#evBody").innerHTML = `
      ${e.flyer ? `<img class="ev-flyer" src="${esc(e.flyer)}" alt="${esc(e.title)} flyer" />` : ""}
      <div class="ev-body">
        <p class="kicker">${past ? "Past night" : e.special ? "Special event" : "Weekly night"}</p>
        <h3 id="evTitle">${esc(e.title)}</h3>
        <p class="ev-when">${fmtLong(d)}, ${d.getFullYear()}</p>
        ${e.desc ? `<p>${esc(e.desc)}</p>` : ""}
        <dl class="ev-rows">${rows.map((r) => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join("")}</dl>
        <div class="ev-actions">
          ${past ? `<a class="btn btn-ghost" href="#reels" data-close>Watch the recap</a>` :
            `<a class="btn btn-gold" href="#contact" data-close data-type="VIP Table / Bottle Service" data-date="${esc(e.date)}">Reserve VIP for this night</a>
             <a class="btn btn-ghost" href="https://www.instagram.com/zonaneareno/" target="_blank" rel="noopener">Follow for updates</a>`}
        </div>
      </div>`;
    $$("[data-type]", $("#evBody")).forEach(bindPrefill);
    openModal($("#eventModal"));
  }

  /* ---------------- reels ---------------- */
  const reelGrid = $("#reelGrid");
  const canHover = window.matchMedia("(hover: hover)").matches;
  reelGrid.innerHTML = REELS.map((r, i) => `
    <button class="reel reveal" data-i="${i}" aria-label="Play reel: ${esc(r.title)}">
      <img src="${esc(r.poster)}" alt="" loading="lazy" />
      ${canHover ? `<video muted loop playsinline preload="none" data-src="${esc(r.src)}"></video>` : ""}
      <span class="reel-play" aria-hidden="true"></span>
      <div class="reel-info">${r.tag ? `<small>${esc(r.tag)}</small>` : ""}<h3>${esc(r.title)}</h3><p>${esc(r.caption || "")}</p></div>
    </button>`).join("");
  $$(".reel", reelGrid).forEach((card) => {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver((ents, o) => ents.forEach((en) => { if (en.isIntersecting) { card.classList.add("in"); o.disconnect(); } }), { threshold: 0.1 }).observe(card);
    } else card.classList.add("in");
    const v = $("video", card);
    if (v) {
      card.addEventListener("mouseenter", () => { if (!v.src) v.src = v.dataset.src; v.play().then(() => card.classList.add("playing")).catch(() => {}); });
      card.addEventListener("mouseleave", () => { v.pause(); card.classList.remove("playing"); });
    }
    card.addEventListener("click", () => openReel(+card.dataset.i));
  });

  let reelIdx = 0;
  const rv = $("#reelVideo");
  function openReel(i) {
    reelIdx = (i + REELS.length) % REELS.length;
    const r = REELS[reelIdx];
    rv.src = r.src; rv.poster = r.poster; rv.muted = false;
    $("#reelTitle").textContent = r.title; $("#reelCaption").textContent = r.caption || "";
    const m = $("#reelModal");
    if (m.hidden) openModal(m);
    rv.play().catch(() => {});
  }
  const stepReel = (d) => openReel(reelIdx + d);
  $("#reelPrev").addEventListener("click", () => stepReel(-1));
  $("#reelNext").addEventListener("click", () => stepReel(1));
  rv.addEventListener("ended", () => stepReel(1));

  /* ---------------- gallery ---------------- */
  const figs = $$("#gallery-grid figure");
  $$("#galFilters .chip").forEach((c) => c.addEventListener("click", () => {
    $$("#galFilters .chip").forEach((x) => x.classList.toggle("on", x === c));
    figs.forEach((f) => f.classList.toggle("hide", c.dataset.f !== "all" && f.dataset.cat !== c.dataset.f));
  }));
  let lbIdx = 0;
  const visibleFigs = () => figs.filter((f) => !f.classList.contains("hide"));
  function openLb(i) {
    const list = visibleFigs();
    lbIdx = (i + list.length) % list.length;
    const img = $("img", list[lbIdx]);
    $("#lbImg").src = img.src; $("#lbImg").alt = img.alt;
    const m = $("#lightbox"); if (m.hidden) openModal(m);
  }
  const stepLb = (d) => openLb(lbIdx + d);
  figs.forEach((f) => f.addEventListener("click", () => openLb(visibleFigs().indexOf(f))));
  $("#lbPrev").addEventListener("click", () => stepLb(-1));
  $("#lbNext").addEventListener("click", () => stepLb(1));

  /* ---------------- contact form ---------------- */
  const form = $("#contactForm");
  function bindPrefill(a) {
    a.addEventListener("click", () => {
      const sel = $("#typeSelect");
      if (a.dataset.type) sel.value = a.dataset.type;
      if (a.dataset.date) form.elements.date.value = a.dataset.date;
      const m = a.closest(".modal"); if (m) closeModal(m);
    });
  }
  $$("a[data-type]").forEach(bindPrefill);
  form.elements.date.min = todayKey;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#formStatus"), btn = $("#formBtn");
    status.className = "form-status"; status.textContent = "";
    let ok = true;
    ["name", "email", "type", "message"].forEach((n) => {
      const el = form.elements[n];
      const bad = !el.value.trim() || (n === "email" && !/^\S+@\S+\.\S+$/.test(el.value));
      el.classList.toggle("invalid", bad); if (bad) ok = false;
    });
    if (!form.elements.age.checked) { ok = false; status.className = "form-status err"; status.textContent = "Please confirm everyone in your party is 21+."; return; }
    if (!ok) { status.className = "form-status err"; status.textContent = "Please fill in the highlighted fields."; return; }

    const data = Object.fromEntries(new FormData(form).entries());
    btn.disabled = true; btn.textContent = "Sending…";
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("send failed");
      form.reset();
      status.className = "form-status ok";
      status.textContent = "¡Gracias! Your request is in — the Zonanea team will reach out soon. 💚";
    } catch (err) {
      status.className = "form-status err";
      status.innerHTML = `We couldn't send that right now. Please email <a href="mailto:zona.nea.nvops@gmail.com">zona.nea.nvops@gmail.com</a> or <a href="https://ig.me/m/zonaneareno" target="_blank" rel="noopener">DM @zonaneareno on Instagram</a> and we'll get you set up.`;
    } finally {
      btn.disabled = false; btn.textContent = "Send Request";
    }
  });
  $$("input, select, textarea", form).forEach((el) => el.addEventListener("input", () => el.classList.remove("invalid")));

  $("#yr").textContent = new Date().getFullYear();
})();
