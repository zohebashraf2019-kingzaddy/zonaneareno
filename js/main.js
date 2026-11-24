/* ==========================================================================
   ZONA NEA LATIN LOUNGE — site behaviour
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const EVENTS = (window.ZONA_EVENTS || []).slice();
  const WEEKLY = window.ZONA_WEEKLY || [];
  // Promotional flyers live in the events calendar, so flyer videos are kept out of the gallery.
  const REELS = (window.ZONA_REELS || []).filter((r) => (r.tag || "").toLowerCase() !== "flyer");
  const MENUS = window.ZONA_MENUS || {};
  const ES = window.ZONA_ES || {};
  const UI_ALL = window.ZONA_UI || {};
  const OPEN_DAYS = [4, 5, 6, 0]; // Thu, Fri, Sat, Sun

  /* ---------------- language ---------------- */
  let lang = store.get("zona-lang") === "es" ? "es" : "en";
  let UI = UI_ALL[lang] || UI_ALL.en;
  const enCache = new Map();
  $$("[data-i18n]").forEach((el) => enCache.set(el, el.innerHTML));
  $$("[data-i18n-ph]").forEach((el) => enCache.set(el, el.getAttribute("placeholder")));
  const enTitle = document.title;

  function applyLang(next, animate) {
    lang = next; UI = UI_ALL[lang] || UI_ALL.en;
    const swap = () => {
      $$("[data-i18n]").forEach((el) => {
        const k = el.dataset.i18n;
        el.innerHTML = lang === "es" && ES[k] != null ? ES[k] : enCache.get(el);
      });
      $$("[data-i18n-ph]").forEach((el) => {
        const k = el.dataset.i18nPh;
        el.setAttribute("placeholder", lang === "es" && ES[k] != null ? ES[k] : enCache.get(el));
      });
      document.documentElement.lang = lang;
      document.title = lang === "es" ? "Zona Nea Latin Lounge · La Casa del Perreo · Reno, NV" : enTitle;
      $$(".lang-switch button").forEach((b) => { b.classList.toggle("on", b.dataset.lang === lang); b.setAttribute("aria-pressed", b.dataset.lang === lang); });
      renderDynamic();
      document.body.classList.remove("lang-swap");
    };
    if (animate) { document.body.classList.add("lang-swap"); setTimeout(swap, 220); } else swap();
  }
  $$(".lang-switch button").forEach((b) => b.addEventListener("click", () => {
    if (b.dataset.lang === lang) return;
    store.set("zona-lang", b.dataset.lang);
    applyLang(b.dataset.lang, true);
  }));

  /* ---------------- dates ---------------- */
  const pad = (n) => String(n).padStart(2, "0");
  const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parseKey = (k) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d); };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const todayKey = keyOf(today);
  const fmtLong = (d) => lang === "es"
    ? `${UI.dowLong[d.getDay()]} ${d.getDate()} de ${UI.months[d.getMonth()].toLowerCase()}`
    : `${UI.dowLong[d.getDay()]}, ${UI.months[d.getMonth()].slice(0, 3)} ${d.getDate()}`;

  const specialsByDate = {};
  EVENTS.forEach((e) => { if (e && e.date) (specialsByDate[e.date] = specialsByDate[e.date] || []).push(Object.assign({ special: true }, e)); });

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

  /* ---------------- age gate ---------------- */
  const gate = $("#ageGate");
  if (store.get("zona-21") !== "yes") {
    gate.hidden = false;
    document.body.classList.add("locked");
    $("#ageYes").addEventListener("click", () => {
      store.set("zona-21", "yes");
      gate.style.transition = "opacity .5s"; gate.style.opacity = "0";
      setTimeout(() => { gate.hidden = true; document.body.classList.remove("locked"); }, 480);
    });
  }

  /* ---------------- nav ---------------- */
  const nav = $("#nav");
  const floatCta = $("#floatCta");
  const requestSec = $("#request");
  let requestInView = false;
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
    floatCta.classList.toggle("show", window.scrollY > window.innerHeight * 0.8 && !requestInView);
  };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((ents) => { requestInView = ents[0].isIntersecting; onScroll(); }, { threshold: 0.05 }).observe(requestSec);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = $("#navToggle"), links = $("#navLinks");
  const closeMenu = () => { links.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); document.body.classList.remove("locked"); };
  toggle.addEventListener("click", () => {
    const open = !links.classList.contains("open");
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
    document.body.classList.toggle("locked", open);
  });
  $$("a", links).forEach((a) => a.addEventListener("click", closeMenu));

  // highlight the section in view
  const navMap = $$("a[href^='#']:not(.btn)", links).filter((a) => a.getAttribute("href") !== "#top");
  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (!en.isIntersecting) return;
      navMap.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
    }), { rootMargin: "-45% 0px -50% 0px" });
    navMap.forEach((a) => { const s = $(a.getAttribute("href")); if (s) spy.observe(s); });
  }

  /* ---------------- ticker: duplicate for a seamless loop ---------------- */
  const track = $("#tickerTrack");
  track.innerHTML += track.innerHTML;

  /* ---------------- reveal on scroll ---------------- */
  const io = "IntersectionObserver" in window ? new IntersectionObserver((ents) => ents.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }) : null;
  const watch = (el) => io ? io.observe(el) : el.classList.add("in");
  $$(".reveal").forEach(watch);

  /* ---------------- dynamic, language-aware blocks ---------------- */
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  const grid = $("#calGrid");

  function renderNext() {
    const next = upcoming(1)[0];
    if (!next) return;
    $("#nextUp").hidden = false;
    $("#nextTitle").textContent = next.title;
    $("#nextDate").textContent = `${fmtLong(parseKey(next.date))}${next.doors ? " · " + next.doors : ""}`;
  }

  function renderWeekend() {
    const el = $("#weekend");
    const nights = upcoming(4);
    if (!nights.length) { el.hidden = true; return; }
    el.innerHTML = `<div class="wk-label"><h3>${UI.nextNights} <span class="foil">Zona Nea</span></h3><span>${UI.tapNight}</span></div>` +
      nights.map((e, i) => {
        const d = parseKey(e.date);
        return `<button class="wk ${e.special ? "special" : ""}" data-ev="${i}">
          ${e.special ? `<span class="wk-badge">${UI.special}</span>` : ""}
          <span class="wk-day">${UI.dowLong[d.getDay()]}</span>
          <div class="wk-date">${UI.months[d.getMonth()].slice(0, 3)} ${d.getDate()}</div>
          <h4>${esc(e.title)}</h4>
          <p>${esc(e.doors || "")}</p>
          ${e.theme ? `<span class="wk-theme">${esc(e.theme)}</span>` : ""}
        </button>`;
      }).join("");
    $$(".wk", el).forEach((b) => b.addEventListener("click", () => openEvent(nights[+b.dataset.ev])));
  }

  function renderMonth() {
    $("#calMonth").textContent = `${UI.months[view.getMonth()]} ${view.getFullYear()}`;
    $("#calDow").innerHTML = UI.dow.map((d) => `<span>${d}</span>`).join("");
    const start = new Date(view); start.setDate(1 - view.getDay());
    const cells = [], map = [];
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
        <div class="up-date"><small>${UI.dow[d.getDay()]}</small><b>${d.getDate()}</b><small>${UI.months[d.getMonth()].slice(0, 3)}</small></div>
        <div class="up-info"><h4>${esc(e.title)}</h4><p>${esc([e.theme, e.doors, djs].filter(Boolean).join(" · "))}</p></div>
        <span class="up-arrow">›</span></button></li>`;
    }).join("") : `<li><p>${UI.noneSoon}</p></li>`;
    $$(".up-item").forEach((b) => b.addEventListener("click", () => openEvent(items[+b.dataset.i])));
  }

  function renderMenus() {
    $$(".menu-card").forEach((card) => {
      const url = MENUS[card.dataset.menu];
      const btn = $(".menu-btn", card), soon = $(".menu-soon", card);
      if (url) { btn.href = url; btn.target = "_blank"; btn.rel = "noopener"; btn.classList.remove("disabled"); soon.hidden = true; }
      else { btn.classList.add("disabled"); btn.setAttribute("aria-disabled", "true"); btn.tabIndex = -1; soon.hidden = false; }
    });
  }

  function renderDynamic() { renderNext(); renderWeekend(); renderMonth(); renderList(); renderMenus(); }

  $("#calPrev").addEventListener("click", () => { view.setMonth(view.getMonth() - 1); renderMonth(); });
  $("#calNext").addEventListener("click", () => { view.setMonth(view.getMonth() + 1); renderMonth(); });
  $$(".seg button").forEach((b) => b.addEventListener("click", () => {
    $$(".seg button").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-selected", x === b); });
    const list = b.dataset.view === "list";
    $("#calMonthView").hidden = list; $("#calListView").hidden = !list;
    $(".cal-nav").style.visibility = list ? "hidden" : "visible";
  }));

  /* ---------------- modals (shared) ---------------- */
  let lastFocus = null;
  function openModal(m) { lastFocus = document.activeElement; m.hidden = false; document.body.classList.add("locked"); const x = $("[data-close]", m); x && x.focus(); }
  function closeModal(m) {
    m.hidden = true; document.body.classList.remove("locked");
    $$("video", m).forEach((v) => v.pause());
    lastFocus && lastFocus.focus && lastFocus.focus({ preventScroll: true });
  }
  $$(".modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target === m || e.target.closest("[data-close]")) closeModal(m); }));
  document.addEventListener("keydown", (e) => {
    const open = $$(".modal").find((m) => !m.hidden);
    if (!open) { if (e.key === "Escape" && links.classList.contains("open")) closeMenu(); return; }
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
      [UI.theme, esc(e.theme)],
      [UI.music, djs || (e.weekly ? UI.residents : "")],
      [UI.sound, esc(e.sound)],
      [UI.doors, esc(e.doors)],
      [UI.specialRow, esc(e.promo)],
      [UI.dress, esc(e.dress)],
      [UI.entry, UI.entryVal],
      [UI.vip, past ? "" : UI.vipVal]
    ].filter((r) => r[1]);
    const reqLabel = (lang === "es" ? ES["cta.request"] : enCache.get($("#formBtn"))) || "Request an Event";
    $("#evBody").innerHTML = `
      ${e.flyer ? `<img class="ev-flyer" src="${esc(e.flyer)}" alt="${esc(e.title)} flyer" />` : ""}
      <div class="ev-body">
        <p class="kicker">${past ? UI.pastNight : e.special ? UI.specialEvent : UI.weeklyNight}</p>
        <h3 id="evTitle">${esc(e.title)}</h3>
        <p class="ev-when">${fmtLong(d)}, ${d.getFullYear()}</p>
        ${e.desc ? `<p>${esc(e.desc)}</p>` : ""}
        <dl class="ev-rows">${rows.map((r) => `<div><dt>${r[0]}</dt><dd>${r[1]}</dd></div>`).join("")}</dl>
        <div class="ev-actions">
          ${past ? `<a class="btn btn-ghost" href="#gallery" data-close>${UI.recap}</a>` :
            `<a class="btn btn-gold" href="https://www.instagram.com/zonaneareno/" target="_blank" rel="noopener">${UI.follow}</a>
             <a class="btn btn-ghost" href="#request" data-close>${reqLabel}</a>`}
        </div>
      </div>`;
    openModal($("#eventModal"));
  }

  /* ---------------- reels ---------------- */
  const reelGrid = $("#reelGrid");
  const canHover = window.matchMedia("(hover: hover)").matches;
  reelGrid.innerHTML = REELS.map((r, i) => `
    <button class="reel reveal" data-i="${i}" aria-label="Play video: ${esc(r.title)}">
      <img src="${esc(r.poster)}" alt="" loading="lazy" />
      ${canHover ? `<video muted loop playsinline preload="none" data-src="${esc(r.src)}"></video>` : ""}
      <span class="reel-play" aria-hidden="true"></span>
      <div class="reel-info">${r.tag ? `<small>${esc(r.tag)}</small>` : ""}<h3>${esc(r.title)}</h3><p>${esc(r.caption || "")}</p></div>
    </button>`).join("");
  $$(".reel", reelGrid).forEach((card) => {
    watch(card);
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
    $(".reel-player").classList.toggle("wide", !!r.wide);
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

  /* ---------------- event inquiry form ---------------- */
  const form = $("#contactForm");
  const CATS = { social: "Social Celebration", corporate: "Corporate Event", rental: "Exclusive Venue Rental" };
  $$("a[data-type]").forEach((a) => a.addEventListener("click", () => {
    const v = CATS[a.dataset.type];
    if (v) { $("#typeSelect").value = v; $("#typeSelect").classList.remove("invalid"); }
    if (a.dataset.type === "rental" && form.elements.venue.value === "Not applicable") form.elements.venue.value = "Not sure yet";
  }));
  form.elements.date.min = todayKey;
  form.elements.altDate.min = todayKey;

  const REQUIRED = ["name", "phone", "email", "category", "date", "startTime", "endTime", "guests", "budget", "message"];
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = $("#formStatus"), btn = $("#formBtn");
    status.className = "form-status"; status.textContent = "";
    let firstBad = null;
    REQUIRED.forEach((n) => {
      const el = form.elements[n];
      const v = el.value.trim();
      const bad = !v || (n === "email" && !/^\S+@\S+\.\S+$/.test(v)) || (n === "phone" && v.replace(/\D/g, "").length < 7) || (n === "guests" && !(+v >= 1));
      el.classList.toggle("invalid", bad);
      if (bad && !firstBad) firstBad = el;
    });
    const ageBox = form.elements.age;
    ageBox.closest(".check").classList.toggle("invalid-box", !ageBox.checked);
    if (firstBad) { status.className = "form-status err"; status.textContent = UI.fillFields; firstBad.focus(); return; }
    if (!ageBox.checked) { status.className = "form-status err"; status.textContent = UI.ageConfirm; return; }

    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    data.services = fd.getAll("services");
    data.lang = lang;
    const label = btn.innerHTML;
    btn.disabled = true; btn.textContent = UI.sending;
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!res.ok) throw new Error("send failed");
      form.reset();
      status.className = "form-status ok";
      status.textContent = UI.sent;
    } catch (err) {
      status.className = "form-status err";
      status.innerHTML = UI.failed;
    } finally {
      btn.disabled = false; btn.innerHTML = label;
    }
  });
  $$("input, select, textarea", form).forEach((el) => el.addEventListener("input", () => {
    el.classList.remove("invalid");
    if (el.name === "age") el.closest(".check").classList.remove("invalid-box");
  }));

  $("#yr").textContent = new Date().getFullYear();
  applyLang(lang, false);
})();
