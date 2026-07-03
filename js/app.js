/* ============================================================
   Exploratie Hub — applicatie (SPA met hash-routing)
   ============================================================ */

(function () {
  "use strict";

  const app = document.getElementById("app");

  /* ---------- Hulpfuncties ---------- */

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const store = {
    get(k, fb) { try { const v = localStorage.getItem("ehub:" + k); return v ? JSON.parse(v) : fb; } catch { return fb; } },
    set(k, v) { try { localStorage.setItem("ehub:" + k, JSON.stringify(v)); } catch { } }
  };

  function emptyFunnel() {
    return {
      huidigeFase: 0,
      fase0: { trend: "", relevantie: "", motivatie: "", bronnen: [], checklist: { trendBeschreven: false, relevantieBeschreven: false, motivatieBeschreven: false, bronnenVastgelegd: false } },
      fase1: { doel: "", hoofdvraag: "", deelvragen: [], inScope: [], buitenScope: [], aandachtspunten: "", checklist: { doelBeschreven: false, onderzoeksvragenGemaakt: false, afgebakend: false, trendBesproken: false } },
      fase2: { omschrijving: "", definitie: "", definitieBronnen: [], toepassingen: [], kansenKort: [], kansenLang: [], risicosKort: [], risicosLang: [], checklist: { omschrevenGedefinieerd: false, toepassingenBeschreven: false, kansenRisicos: false } },
      fase3: { interviews: [], meerwaarde: { organisatie: "", medewerker: "", burger: "" }, miniTest: { opzet: "", resultaten: "", conclusie: "" }, bestaandeInitiatieven: "", conclusieHoofdvraag: "", conclusieDeelvragen: [], checklist: { interviewsGedaan: false, meerwaardeBeschreven: false, initiatievenOnderzocht: false, conclusieGeformuleerd: false } },
      fase4: { resultatenoverzicht: "", canvas: { titel: "", aanleiding: "", aanpak: "", resultaat: "", relevantie: "", hoeVerder: "", callToAction: "" }, interneCommunicatie: "", externeCommunicatie: "", opslagBestanden: "", reflectie: "", checklist: { resultatenoverzicht: false, communicatieplan: false, demoGedaan: false, bestandenOpgeslagen: false } },
      parkeerbord: []
    };
  }

  const FASE_TITELS = ["Trend kiezen", "Focus kiezen", "Informatie verzamelen", "Waarde bepalen", "Delen en inspireren"];
  const FASE_TIMEBOXES = ["max. 2 uur", "max. 2 uur", "max. 2 uur", "max. 4 uur", "max. 1 uur"];

  function saveExploratie(e) {
    const extra = store.get("extraExploraties", []);
    const idx = extra.findIndex(x => x.id === e.id);
    if (idx === -1) extra.push(e); else extra[idx] = e;
    store.set("extraExploraties", extra);
  }

  function allTechnologieen() { return TECHNOLOGIEEN.concat(store.get("extraTechnologieen", [])); }

  function saveNieuweTechnologie(t) {
    const extra = store.get("extraTechnologieen", []);
    extra.push(t);
    store.set("extraTechnologieen", extra);
  }

  function wizardShell(expl, bodyHtml, checklistItems, onSaveAndNext, isLastFase) {
    const fase = expl.funnel.huidigeFase;
    const checklist = expl.funnel["fase" + fase].checklist;
    shell("mijn-exploraties", `
      <a href="#/mijn-exploraties" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin-bottom:14px">${I.back} Terug naar mijn exploraties</a>
      <div class="wizard-steps">
        ${FASE_TITELS.map((t, i) => `<div class="wizard-step${i === fase ? " active" : ""}${i < fase ? " done" : ""}">Fase ${i}<br>${esc(t)}</div>`).join("")}
      </div>
      <div class="card np-form">
        <h1>Fase ${fase}: ${esc(FASE_TITELS[fase])}</h1>
        <div class="sub">Richtlijn: ${esc(FASE_TIMEBOXES[fase])}</div>
        <div id="wizardBody">${bodyHtml}</div>
        <div class="wizard-checklist">
          <h3>Checklist</h3>
          ${checklistItems.map(([key, label]) => `<label><input type="checkbox" data-check="${esc(key)}"${checklist[key] ? " checked" : ""}> ${esc(label)}</label>`).join("<br>")}
        </div>
        <div class="wizard-parkeerbord">
          <h3>Parkeerbord</h3>
          <ul id="parkeerbordList">${expl.funnel.parkeerbord.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
          <div class="row2"><input type="text" id="parkeerbordInput" placeholder="Zijpad of idee voor later"><button type="button" class="btn btn-ghost" id="parkeerbordAdd">Toevoegen</button></div>
        </div>
        <button class="btn btn-primary" id="wizardNext" style="margin-top:16px">${isLastFase ? "Exploratie afronden" : "Opslaan en naar volgende fase"}</button>
      </div>
    `);
    document.getElementById("parkeerbordAdd").onclick = () => {
      const input = document.getElementById("parkeerbordInput");
      if (!input.value.trim()) return;
      expl.funnel.parkeerbord.push(input.value.trim());
      saveExploratie(expl);
      document.getElementById("parkeerbordList").innerHTML = expl.funnel.parkeerbord.map(p => `<li>${esc(p)}</li>`).join("");
      input.value = "";
    };
    document.getElementById("wizardNext").onclick = () => {
      const boxes = [...document.querySelectorAll("[data-check]")];
      if (!boxes.every(cb => cb.checked)) {
        toast("Vink eerst de hele checklist af voordat je doorgaat naar de volgende fase");
        return;
      }
      onSaveAndNext();
    };
  }

  function allExploraties() { return EXPLORATIES.concat(store.get("extraExploraties", [])); }
  function initials(n) { return n.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase(); }
  function interests() { return store.get("interests", USER.interesses); }

  function toast(msg) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove("show"), 2600);
  }

  /* ---------- Iconen ---------- */

  const I = {
    home: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    bulb: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.5 1 2.5h6c0-1 .3-1.9 1-2.5A6 6 0 0 0 12 3z"/></svg>',
    folder: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6z"/></svg>',
    globe: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
    user: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6 8-6s8 2 8 6"/></svg>',
    gear: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34h.01a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"/></svg>',
    search: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    filter: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16l-6.5 8v5L10 20v-7z"/></svg>',
    grid: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    listIc: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 5-7 7 7 7"/></svg>',
    share: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="12" r="2.5"/><circle cx="17" cy="5.5" r="2.5"/><circle cx="17" cy="18.5" r="2.5"/><path d="m8.3 10.8 6.4-4M8.3 13.2l6.4 4"/></svg>',
    download: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 21h16"/></svg>',
    file: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v4h4"/></svg>',
    linkIc: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1.5 1.5"/><path d="M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7L12.5 19"/></svg>',
    mail: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>',
    phone: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
    linkedin: '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5A2.49 2.49 0 1 1 0 3.5a2.49 2.49 0 0 1 4.98 0zM.4 8.4h4.6V24H.4zM8.6 8.4h4.4v2.1h.1c.6-1.2 2.1-2.4 4.3-2.4 4.6 0 5.5 3 5.5 7V24h-4.6v-7.9c0-1.9 0-4.3-2.6-4.3s-3 2-3 4.1V24H8.6z"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 5v14M5 12h14"/></svg>',
    reset: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/></svg>',
    pencil: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.8 2.8 0 0 1 4 4L8 20l-5 1 1-5z"/></svg>',
    upload: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 16V4m0 0 4 4m-4-4-4 4M4 20h16"/></svg>',
    eye: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="3"/></svg>',
    logo: '<svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 16h6M10 19h4M12 4.5a5.5 5.5 0 0 0-3.7 9.6c.6.6 1 1.3 1 2h5.4c0-.7.4-1.4 1-2A5.5 5.5 0 0 0 12 4.5z"/><path d="M17.5 3.5a5.5 5.5 0 0 1 2.8 7.7" opacity=".5"/><path d="M6.5 3.5a5.5 5.5 0 0 0-2.8 7.7" opacity=".5"/></svg>',
    lion: '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.5 1.4 1.6 2.2 3 2.5-.6 1-.6 2 0 3-1.2.4-2 1.2-2.3 2.4h2.8c1.5 0 2.5 1 2.5 2.5v5.1c0 2-1.3 3.5-3.3 3.5H9.3C7.3 21 6 19.5 6 17.5v-5.1C6 10.9 7 10 8.5 10h2.8C11 8.8 10.2 8 9 7.6c.6-1 .6-2 0-3 1.4-.3 2.5-1.1 3-2.6z"/></svg>'
  };


  /* ---------- Router ---------- */

  const routes = {
    "login": renderLogin,
    "onboarding": renderOnboarding,
    "home": renderHome,
    "technologieen": renderTechnologieen,
    "technologie": renderTechnologieDetail,
    "mijn-exploraties": renderMijnExploraties,
    "nieuwe-exploratie": renderNieuweExploratie,
    "netwerk": renderNetwerk,
    "account": renderAccount
  };

  function nav(hash) { location.hash = hash; }

  function route() {
    const raw = location.hash.replace(/^#\/?/, "") || "login";
    const [pagePart, queryStr] = raw.split("?");
    const [page, param] = pagePart.split("/");
    const domeinParam = queryStr ? new URLSearchParams(queryStr).get("domein") : null;
    const loggedIn = sessionStorage.getItem("ehub:loggedin") === "1";
    if (!loggedIn && page !== "login") { location.hash = "#/login"; return; }
    if (loggedIn && (page === "login" || page === "")) { location.hash = "#/home"; return; }
    const fn = routes[page] || renderHome;
    window.scrollTo(0, 0);
    fn(param, domeinParam);
  }

  window.addEventListener("hashchange", route);

  /* ---------- Schil (sidebar) ---------- */

  function shell(active, content) {
    const items = [
      ["home", I.home, "Home"],
      ["technologieen", I.bulb, "Technologieën"],
      ["mijn-exploraties", I.folder, "Mijn exploraties"],
      ["netwerk", I.globe, "Netwerk"]
    ];
    const bottom = [
      ["account", I.user, "Mijn account"],
      ["instellingen", I.gear, "Instellingen"]
    ];
    const link = ([id, ic, lbl]) => {
      const cls = "nav-item" + (active === id ? " active" : "");
      if (id === "instellingen") return `<button class="${cls}" onclick="IH.toast('Instellingen zijn nog niet beschikbaar in deze MVP')">${ic}<span>${lbl}</span></button>`;
      return `<a class="${cls}" href="#/${id}">${ic}<span>${lbl}</span></a>`;
    };
    app.innerHTML = `
      <div class="app">
        <aside class="sidebar">
          <div class="brand">Exploratie Hub</div>
          <nav>${items.map(link).join("")}</nav>
          <nav class="nav-bottom">${bottom.map(link).join("")}</nav>
        </aside>
        <main class="main">${content}</main>
      </div>`;
  }

  /* ---------- Login ---------- */

  function renderLogin() {
    app.innerHTML = `
      <div class="auth-page">
        <div class="ro-header"><div class="ro-ribbon">${I.lion}<span>Rijksoverheid</span></div></div>
        <div class="auth-body">
          <div class="auth-card">
            <div class="auth-logo">${I.logo}</div>
            <h1>Exploratie Hub</h1>
            <div class="auth-sub">Log in op je account</div>
            <form id="loginForm">
              <div class="field">
                <label for="email">E-mailadres</label>
                <input type="text" id="email" placeholder="Vul je e-mailadres in" autocomplete="off">
              </div>
              <div class="field">
                <label for="pw">Wachtwoord</label>
                <div class="pw-wrap">
                  <input type="password" id="pw" placeholder="Vul je wachtwoord in" autocomplete="off">
                  <button type="button" class="pw-toggle" id="pwToggle" aria-label="Toon wachtwoord">${I.eye}</button>
                </div>
              </div>
              <div class="auth-links"><a href="#" onclick="IH.toast('Wachtwoord herstellen is nog niet beschikbaar in deze MVP');return false;">Wachtwoord vergeten?</a></div>
              <button class="btn btn-primary" type="submit">Inloggen</button>
            </form>
            <div class="auth-alt">Nog geen account? <a href="#" onclick="IH.toast('Registreren is nog niet beschikbaar in deze MVP');return false;">Registreer</a></div>
          </div>
        </div>
        <div class="auth-footer">© 2026 — demo met representatieve technologie-exploratiedata (handmatig samengesteld)</div>
      </div>`;
    document.getElementById("pwToggle").onclick = () => {
      const pw = document.getElementById("pw");
      pw.type = pw.type === "password" ? "text" : "password";
    };
    document.getElementById("loginForm").onsubmit = e => {
      e.preventDefault();
      sessionStorage.setItem("ehub:loggedin", "1");
      nav(store.get("onboarded", false) ? "#/home" : "#/onboarding");
    };
  }

  /* ---------- Onboarding ---------- */

  function renderOnboarding() {
    const sel = new Set(interests());
    app.innerHTML = `
      <div class="auth-page">
        <div class="auth-body">
          <div class="auth-card wide">
            <div class="onb-top">
              <button class="icon-btn" onclick="history.back()">${I.back}</button>
              <a href="#/home" id="skip">Sla voor nu over</a>
            </div>
            <h1>Welkom bij de Exploratie Hub</h1>
            <div class="auth-sub">Selecteer hier de thema's en technologieën die aansluiten bij jouw interesses</div>
            <div class="chip-cloud" id="chips">
              ${INTERESSES.slice(0, 18).map(i => `<button type="button" class="chip ${sel.has(i) ? "selected" : ""}" data-i="${esc(i)}">${sel.has(i) ? "✓" : "+"} ${esc(i)}</button>`).join("")}
            </div>
            <button class="toon-meer" id="toonMeer">Toon meer</button>
            <button class="btn btn-primary" id="verder">Ga verder</button>
          </div>
        </div>
        <div class="auth-footer">© 2026 — demo met representatieve technologie-exploratiedata (handmatig samengesteld)</div>
      </div>`;

    let expanded = false;
    const chipsEl = document.getElementById("chips");

    function renderChips() {
      const list = expanded ? INTERESSES : INTERESSES.slice(0, 18);
      chipsEl.innerHTML = list.map(i => `<button type="button" class="chip ${sel.has(i) ? "selected" : ""}" data-i="${esc(i)}">${sel.has(i) ? "✓" : "+"} ${esc(i)}</button>`).join("");
    }
    chipsEl.addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      const v = b.dataset.i;
      sel.has(v) ? sel.delete(v) : sel.add(v);
      renderChips();
    });
    document.getElementById("toonMeer").onclick = e => {
      expanded = !expanded;
      e.target.textContent = expanded ? "Toon minder" : "Toon meer";
      renderChips();
    };
    document.getElementById("verder").onclick = () => {
      store.set("interests", [...sel]);
      store.set("onboarded", true);
      nav("#/home");
    };
    document.getElementById("skip").onclick = () => store.set("onboarded", true);
  }

  /* ---------- Home (dashboard) ---------- */

  function polarPoint(cx, cy, r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }
  function wheelArcPath(cx, cy, rOuter, rInner, startDeg, endDeg) {
    const [x1, y1] = polarPoint(cx, cy, rOuter, startDeg);
    const [x2, y2] = polarPoint(cx, cy, rOuter, endDeg);
    const [x3, y3] = polarPoint(cx, cy, rInner, endDeg);
    const [x4, y4] = polarPoint(cx, cy, rInner, startDeg);
    const large = endDeg - startDeg > 180 ? 1 : 0;
    return `M${x1.toFixed(1)},${y1.toFixed(1)} A${rOuter},${rOuter} 0 ${large} 1 ${x2.toFixed(1)},${y2.toFixed(1)} L${x3.toFixed(1)},${y3.toFixed(1)} A${rInner},${rInner} 0 ${large} 0 ${x4.toFixed(1)},${y4.toFixed(1)} Z`;
  }

  function trendroosWheel(counts) {
    // counts: { domein: number }
    const cx = 170, cy = 170;
    const rInnerOuter = 145, rInnerInner = 70;   // domain ring
    const rOuterOuter = 163, rOuterInner = 149;  // cluster ring
    const step = 360 / DOMAINS.length;
    let start = 0, domainSegs = "", clusterSegs = "", labels = "";
    const clusters = [];
    DOMAINS.forEach(d => {
      const end = start + step;
      const color = DOMAIN_COLORS[d];
      const n = counts[d] || 0;
      domainSegs += `<path d="${wheelArcPath(cx, cy, rInnerOuter, rInnerInner, start, end)}" fill="${color}" stroke="#fff" stroke-width="1.5"><title>${esc(d)}: ${n}</title></path>`;
      if (n) {
        const [nx, ny] = polarPoint(cx, cy, (rInnerOuter + rInnerInner) / 2, (start + end) / 2);
        labels += `<text x="${nx.toFixed(1)}" y="${ny.toFixed(1)}" font-size="10" font-weight="700" text-anchor="middle" fill="#fff">${n}</text>`;
      }
      let cl = clusters.find(c => c.name === DOMAIN_CLUSTERS[d]);
      if (!cl) { cl = { name: DOMAIN_CLUSTERS[d], start, color }; clusters.push(cl); }
      cl.end = end;
      start = end;
    });
    clusters.forEach(cl => {
      clusterSegs += `<path d="${wheelArcPath(cx, cy, rOuterOuter, rOuterInner, cl.start + 2, cl.end - 2)}" fill="${cl.color}" opacity="0.55"><title>${esc(cl.name)}</title></path>`;
    });
    return `<svg viewBox="0 0 340 340" width="100%" style="max-width:320px;display:block;margin:0 auto" aria-hidden="true">${domainSegs}${clusterSegs}${labels}</svg>`;
  }

  function domainListHtml(counts, activeDomain) {
    const byCluster = {};
    DOMAINS.forEach(d => { (byCluster[DOMAIN_CLUSTERS[d]] = byCluster[DOMAIN_CLUSTERS[d]] || []).push(d); });
    return `<div class="domain-list">${Object.entries(byCluster).map(([cluster, domains]) => `
      <div class="domain-cluster">
        <div class="domain-cluster-title">${esc(cluster)}</div>
        <div class="domain-chips">${domains.map(d => `
          <button type="button" class="domain-chip${activeDomain === d ? " active" : ""}" style="background:${DOMAIN_COLORS[d]}" data-domain="${esc(d)}">${esc(d)} · ${counts[d] || 0}</button>
        `).join("")}</div>
      </div>`).join("")}</div>`;
  }

  function renderHome() {
    const orgs = [...new Set(allExploraties().map(e => e.org))].sort();
    const statuses = Object.keys(STATUS_COLORS);
    const jaren = [...new Set(allExploraties().map(e => e.jaar))].sort().reverse();

    const my = interests();
    const rec = allTechnologieen().filter(t => t.labels.some(l => my.includes(l)) || my.includes(t.domein)).slice(0, 10);
    const recList = rec.length ? rec : allTechnologieen().slice(0, 8);

    shell("home", `
      <h1 class="page-title" style="margin-bottom:22px">Welkom ${esc(USER.voornaam)}</h1>
      <div class="demo-banner">Technologie- en exploratiedata is representatief en handmatig samengesteld op basis van publieke bronnen — geen live koppeling. Domeinindeling volgt de Rijksbrede Trendverkenning (mei 2026).</div>

      <div class="card dash-card">
        <div class="head">
          <div>
            <h2>Technologieën per Trendroos-domein</h2>
            <div class="sub">Op basis van de 15 sub-domeinen uit de Rijksbrede Trendverkenning, gegroepeerd in 7 clusters</div>
          </div>
          <a href="#/technologieen">Bekijk alle technologieën</a>
        </div>
        <div class="dash-body">
          <div class="pie-wrap" id="wheel"></div>
          <div class="dash-filters">
            <div class="select-wrap"><select id="fOrg"><option value="">Filter op organisatie</option>${orgs.map(o => `<option>${esc(o)}</option>`).join("")}</select></div>
            <div class="select-wrap"><select id="fStatus"><option value="">Filter op status</option>${statuses.map(s => `<option>${esc(s)}</option>`).join("")}</select></div>
            <div class="select-wrap"><select id="fJaar"><option value="">Filter op jaar</option>${jaren.map(j => `<option>${esc(j)}</option>`).join("")}</select></div>
            <button class="reset" id="fReset">Reset filters ${I.reset}</button>
          </div>
        </div>
        <div id="domainListWrap"></div>
      </div>

      <div class="section-head">
        <h2>Gebaseerd op jouw interesses</h2>
        <a href="#/account">Wijzig interesses ${I.pencil}</a>
      </div>
      <div class="hscroll">${recList.map(t => technologieCardHtml(t)).join("")}</div>
    `);

    const fOrg = document.getElementById("fOrg"), fStatus = document.getElementById("fStatus"), fJaar = document.getElementById("fJaar");
    let activeDomain = "";

    function counts() {
      const filtered = allExploraties().filter(e =>
        (!fOrg.value || e.org === fOrg.value) &&
        (!fStatus.value || e.status === fStatus.value) &&
        (!fJaar.value || e.jaar === fJaar.value)
      );
      const techIds = new Set(filtered.map(e => e.technologieId));
      const c = {};
      allTechnologieen().forEach(t => { if (techIds.has(t.id)) c[t.domein] = (c[t.domein] || 0) + 1; });
      return c;
    }

    function update() {
      const c = counts();
      document.getElementById("wheel").innerHTML = trendroosWheel(c);
      document.getElementById("domainListWrap").innerHTML = domainListHtml(c, activeDomain);
      document.getElementById("domainListWrap").querySelectorAll(".domain-chip").forEach(btn => {
        btn.onclick = () => { location.hash = `#/technologieen?domein=${encodeURIComponent(btn.dataset.domain)}`; };
      });
    }

    fOrg.onchange = update; fStatus.onchange = update; fJaar.onchange = update;
    document.getElementById("fReset").onclick = () => { fOrg.value = ""; fStatus.value = ""; fJaar.value = ""; update(); };
    update();
  }

  /* ---------- Projectkaart ---------- */

  function techStats(t) {
    const expls = allExploraties().filter(e => e.technologieId === t.id);
    const orgCount = new Set(expls.map(e => e.org)).size;
    const statuses = [...new Set(expls.map(e => e.status))];
    return { explCount: expls.length, orgCount, statuses };
  }

  function technologieCardHtml(t) {
    const stats = techStats(t);
    return `
      <div class="card pcard" data-id="${esc(t.id)}" role="link" tabindex="0" aria-label="${esc(t.naam)}">
        <div class="thumb" style="background:${DOMAIN_COLORS[t.domein]}"><span class="tag">${esc(t.domein)}</span></div>
        <div class="body">
          <h3>TRL ${t.trl} · ${esc(t.naam)}</h3>
          <div class="org">${stats.orgCount} organisatie${stats.orgCount === 1 ? "" : "s"} onderzoekt dit</div>
          <p>${esc(t.korteBeschrijving)}</p>
          <div class="labels-block">
            ${t.labels.slice(0, 4).map(l => `<span class="label-chip">${esc(l)}</span>`).join("")}
          </div>
        </div>
      </div>`;
  }

  function bindTechCards() {
    document.querySelectorAll(".pcard[data-id]").forEach(el => {
      el.onclick = () => { location.hash = `#/technologie/${el.dataset.id}`; };
      el.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); } };
    });
  }

  /* ---------- Technologieën (browse) ---------- */

  const techState = { q: "", domein: "", org: "", status: "", jaar: "", filterOpen: false, sort: "naam", view: "grid" };

  function renderTechnologieen(param, initialDomein) {
    const orgs = [...new Set(allExploraties().map(e => e.org))].sort();
    const jaren = [...new Set(allExploraties().map(e => e.jaar))].sort().reverse();
    if (initialDomein) techState.domein = initialDomein;

    shell("technologieen", `
      <div class="page-head">
        <div>
          <h1 class="page-title">Technologieën</h1>
          <div class="page-sub">Alle technologieën in de Exploratie Hub, geclassificeerd naar Trendroos-domein</div>
        </div>
      </div>
      <div class="toolbar">
        <div class="searchbox">${I.search}<input id="q" placeholder="Zoeken" value="${esc(techState.q)}"></div>
        <button class="btn btn-ghost" id="filterBtn">${I.filter} Filter</button>
        <div class="select-wrap">
          <select id="sort">
            <option value="naam">Sorteer op: naam</option>
            <option value="trl">Sorteer op: TRL</option>
            <option value="orgs">Sorteer op: aantal organisaties</option>
          </select>
        </div>
      </div>
      <div class="filter-panel ${techState.filterOpen ? "open" : ""}" id="filterPanel">
        <div class="select-wrap"><select id="pDomein"><option value="">Alle domeinen</option>${DOMAINS.map(d => `<option>${esc(d)}</option>`).join("")}</select></div>
        <div class="select-wrap"><select id="pOrg"><option value="">Alle organisaties</option>${orgs.map(o => `<option>${esc(o)}</option>`).join("")}</select></div>
        <div class="select-wrap"><select id="pStatus"><option value="">Alle statussen</option>${Object.keys(STATUS_COLORS).map(s => `<option>${esc(s)}</option>`).join("")}</select></div>
        <div class="select-wrap"><select id="pJaar"><option value="">Alle jaren</option>${jaren.map(j => `<option>${esc(j)}</option>`).join("")}</select></div>
      </div>
      <div class="result-bar">
        <span id="count"></span>
        <div class="view-toggle">
          <button id="vGrid" title="Rasterweergave">${I.grid}</button>
          <button id="vList" title="Lijstweergave">${I.listIc}</button>
        </div>
      </div>
      <div id="results" class="${techState.view === "grid" ? "grid" : "list"}"></div>
    `);

    const els = ["q", "pDomein", "pOrg", "pStatus", "pJaar", "sort"].reduce((o, id) => (o[id] = document.getElementById(id), o), {});
    els.pDomein.value = techState.domein; els.pOrg.value = techState.org;
    els.pStatus.value = techState.status; els.pJaar.value = techState.jaar; els.sort.value = techState.sort;

    function update() {
      techState.q = els.q.value; techState.domein = els.pDomein.value; techState.org = els.pOrg.value;
      techState.status = els.pStatus.value; techState.jaar = els.pJaar.value; techState.sort = els.sort.value;

      let list = allTechnologieen().filter(t => {
        const matchesQ = !techState.q || (t.naam + " " + t.korteBeschrijving).toLowerCase().includes(techState.q.toLowerCase());
        const matchesDomein = !techState.domein || t.domein === techState.domein;
        const explsForTech = allExploraties().filter(e => e.technologieId === t.id);
        const matchesOrg = !techState.org || explsForTech.some(e => e.org === techState.org);
        const matchesStatus = !techState.status || explsForTech.some(e => e.status === techState.status);
        const matchesJaar = !techState.jaar || explsForTech.some(e => e.jaar === techState.jaar);
        return matchesQ && matchesDomein && matchesOrg && matchesStatus && matchesJaar;
      });

      if (techState.sort === "trl") list.sort((a, b) => b.trl - a.trl);
      else if (techState.sort === "orgs") list.sort((a, b) => techStats(b).orgCount - techStats(a).orgCount);
      else list.sort((a, b) => a.naam.localeCompare(b.naam));

      document.getElementById("count").textContent = `${list.length} ${list.length === 1 ? "technologie" : "technologieën"}`;
      document.getElementById("results").innerHTML = list.length
        ? list.map(technologieCardHtml).join("")
        : `<div class="empty">Geen technologieën gevonden.</div>`;
      bindTechCards();
    }

    els.q.oninput = update; els.pDomein.onchange = update; els.pOrg.onchange = update;
    els.pStatus.onchange = update; els.pJaar.onchange = update; els.sort.onchange = update;
    document.getElementById("filterBtn").onclick = () => { techState.filterOpen = !techState.filterOpen; document.getElementById("filterPanel").classList.toggle("open", techState.filterOpen); };
    document.getElementById("vGrid").onclick = () => { techState.view = "grid"; document.getElementById("results").className = "grid"; };
    document.getElementById("vList").onclick = () => { techState.view = "list"; document.getElementById("results").className = "list"; };
    update();
  }

  /* ---------- Projectdetail ---------- */

  function renderTechnologieDetail(id) {
    const t = allTechnologieen().find(x => x.id === id);
    if (!t) { location.hash = "#/technologieen"; return; }
    const expls = allExploraties().filter(e => e.technologieId === t.id);
    const similar = allTechnologieen().filter(x => x.id !== t.id && (x.domein === t.domein || x.labels.some(l => t.labels.includes(l)))).slice(0, 4);

    shell("technologieen", `
      <a href="#/technologieen" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin-bottom:14px">${I.back} Terug naar technologieën</a>
      <div class="page-head">
        <div>
          <h1 class="page-title">${esc(t.naam)}</h1>
          <div class="page-sub">${esc(t.domein)} · TRL ${t.trl} · ${expls.length} exploratie${expls.length === 1 ? "" : "s"}</div>
        </div>
      </div>
      <p>${esc(t.korteBeschrijving)}</p>
      <div class="labels-block">${t.labels.map(l => `<span class="label-chip">${esc(l)}</span>`).join("")}</div>

      <div class="tabs" id="tabs">
        <button data-tab="orgs" class="active">Wie onderzoekt dit</button>
        <button data-tab="similar">Soortgelijke technologieën</button>
      </div>
      <div id="tabBody"></div>
    `);

    function renderOrgsTab() {
      return expls.length ? `<div class="grid">${expls.map(e => `
        <div class="card">
          <h3>${esc(e.org)}</h3>
          <div class="org">${esc(e.typeOrganisatie)} · ${esc(e.jaar)} · <span style="color:${STATUS_COLORS[e.status]}">${esc(e.status)}</span></div>
          <p>${esc(e.samenvatting)}</p>
          ${e.uitkomst ? `<p><strong>Uitkomst:</strong> ${esc(e.uitkomst)}</p>` : ""}
          ${e.bron ? `<a href="${esc(e.bron)}" target="_blank" rel="noopener">Bron ${I.back}</a>` : ""}
        </div>`).join("")}</div>` : `<div class="empty">Nog geen exploraties bekend voor deze technologie.</div>`;
    }
    function renderSimilarTab() {
      return similar.length ? `<div class="hscroll">${similar.map(technologieCardHtml).join("")}</div>` : `<div class="empty">Geen soortgelijke technologieën gevonden.</div>`;
    }

    function showTab(tab) {
      document.getElementById("tabBody").innerHTML = tab === "orgs" ? renderOrgsTab() : renderSimilarTab();
      bindTechCards();
      document.querySelectorAll("#tabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
    }
    document.getElementById("tabs").addEventListener("click", e => {
      const b = e.target.closest("button[data-tab]"); if (!b) return;
      showTab(b.dataset.tab);
    });
    showTab("orgs");
  }

  /* ---------- Mijn projecten ---------- */

  const mijnState = { q: "", tab: "Alle" };

  function funnelBadge(e) {
    if (!e.funnel) return "";
    const fase = e.funnel.huidigeFase;
    return fase >= 5 ? `<span class="label-chip">Funnel afgerond</span>` : `<span class="label-chip">Fase ${fase} van 5</span>`;
  }

  function renderMijnExploraties() {
    const mine = allExploraties().filter(e => e.mine);
    const tabs = ["Alle", "Onderzoekt", "Pilot", "Opgeschaald", "Gestopt", "Niet opgepakt"];
    const count = t => t === "Alle" ? mine.length : mine.filter(e => e.status === t).length;

    shell("mijn-exploraties", `
      <div class="page-head">
        <div>
          <h1 class="page-title">Mijn exploraties</h1>
          <div class="page-sub">Beheer je eigen technologie-exploraties, stap voor stap volgens de Novum-methode</div>
        </div>
        <a class="btn btn-primary" href="#/nieuwe-exploratie">Nieuwe exploratie ${I.plus}</a>
      </div>
      <div class="toolbar">
        <div class="searchbox">${I.search}<input id="q" placeholder="Zoeken" value="${esc(mijnState.q)}"></div>
      </div>
      <div class="status-tabs" id="stabs">
        ${tabs.map(t => `<button data-t="${esc(t)}" class="${mijnState.tab === t ? "active" : ""}">${t === "Alle" ? "Alle exploraties" : t} (${count(t)})</button>`).join("")}
      </div>
      <div id="results" class="grid"></div>
    `);

    function update() {
      let list = mine.filter(e =>
        (mijnState.tab === "Alle" || e.status === mijnState.tab) &&
        (!mijnState.q || (e.samenvatting + " " + e.org).toLowerCase().includes(mijnState.q.toLowerCase()))
      );
      document.getElementById("results").innerHTML = list.length
        ? list.map(e => {
            const t = allTechnologieen().find(x => x.id === e.technologieId);
            return `<div class="card">
              <h3>${esc(t ? t.naam : e.technologieId)} ${funnelBadge(e)}</h3>
              <div class="org">${esc(e.org)} · <span style="color:${STATUS_COLORS[e.status]}">${esc(e.status)}</span></div>
              <p>${esc(e.samenvatting || "Nog geen samenvatting — werk de exploratie verder uit.")}</p>
              <a href="#/nieuwe-exploratie/${esc(e.id)}">Verder werken ${I.pencil}</a>
            </div>`;
          }).join("")
        : `<div class="empty">Geen exploraties in deze categorie.</div>`;
    }
    document.getElementById("stabs").addEventListener("click", e => {
      const b = e.target.closest("button[data-t]"); if (!b) return;
      mijnState.tab = b.dataset.t;
      document.querySelectorAll("#stabs button").forEach(x => x.classList.toggle("active", x === b));
      update();
    });
    document.getElementById("q").oninput = e => { mijnState.q = e.target.value; update(); };
    update();
  }

  /* ---------- Nieuwe exploratie (Novum-funnel) ---------- */

  function renderNieuweExploratie(param) {
    let expl = param ? allExploraties().find(x => x.id === param) : null;
    if (!expl) {
      expl = { id: "expl-" + Date.now(), technologieId: "", org: USER.org, typeOrganisatie: "Rijksoverheid", status: "Onderzoekt", jaar: String(new Date().getFullYear()), samenvatting: "", uitkomst: "", bron: "", team: USER.afdeling, mine: true, funnel: emptyFunnel() };
      saveExploratie(expl);
      location.hash = "#/nieuwe-exploratie/" + expl.id;
      return;
    }
    const fase = expl.funnel.huidigeFase;
    if (fase === 0) return renderFase0(expl);
    if (fase === 1) return renderFase1(expl);
    if (fase === 2) return renderFase2(expl);
    if (fase === 3) return renderFase3(expl);
    return renderFase4(expl);
  }

  function renderFase0(expl) {
    const f = expl.funnel.fase0;
    const existing = allTechnologieen();
    const body = `
      <div class="field"><label class="req">Wat is de trend of technologie?</label><textarea id="w-trend">${esc(f.trend)}</textarea></div>
      <div class="field"><label class="req">Waarom is het relevant voor de organisatie?</label><textarea id="w-relevantie">${esc(f.relevantie)}</textarea></div>
      <div class="field"><label class="req">Waarom heb je deze trend gekozen, en wie heeft er wat aan?</label><textarea id="w-motivatie">${esc(f.motivatie)}</textarea></div>
      <div class="field"><label>Geraadpleegde bronnen (titel — organisatie — jaar — link, één per regel)</label><textarea id="w-bronnen">${esc(f.bronnen.map(b => `${b.titel} — ${b.organisatie} — ${b.jaar} — ${b.link}`).join("\n"))}</textarea></div>
      <div id="similarBox" class="hscroll"></div>
      <div class="field">
        <label class="req">Aan welke technologie in de hub koppel je deze exploratie?</label>
        <div class="select-wrap"><select id="w-tech-select">
          <option value="">— Kies een bestaande technologie —</option>
          ${existing.map(t => `<option value="${esc(t.id)}"${expl.technologieId === t.id ? " selected" : ""}>${esc(t.naam)}</option>`).join("")}
          <option value="__new__">+ Nieuwe technologie aanmaken</option>
        </select></div>
      </div>
      <div id="newTechFields" style="display:none">
        <div class="row2">
          <div class="field"><label class="req">Naam nieuwe technologie</label><input type="text" id="w-newtech-naam"></div>
          <div class="field"><label class="req">Domein</label>
            <div class="select-wrap"><select id="w-newtech-domein">${DOMAINS.map(d => `<option>${esc(d)}</option>`).join("")}</select></div>
          </div>
        </div>
        <div class="field"><label class="req">TRL (1-9)</label><input type="number" id="w-newtech-trl" min="1" max="9" value="1"></div>
      </div>
    `;
    wizardShell(expl, body, [
      ["trendBeschreven", "Trend beschreven"],
      ["relevantieBeschreven", "Relevantie beschreven"],
      ["motivatieBeschreven", "Waarom gekozen beschreven"],
      ["bronnenVastgelegd", "Geraadpleegde bronnen beschreven"]
    ], () => {
      f.trend = document.getElementById("w-trend").value;
      f.relevantie = document.getElementById("w-relevantie").value;
      f.motivatie = document.getElementById("w-motivatie").value;
      f.bronnen = document.getElementById("w-bronnen").value.split("\n").filter(Boolean).map(line => {
        const [titel, organisatie, jaar, link] = line.split("—").map(s => (s || "").trim());
        return { titel, organisatie, jaar, link };
      });
      document.querySelectorAll("[data-check]").forEach(cb => { f.checklist[cb.dataset.check] = cb.checked; });

      const techChoice = document.getElementById("w-tech-select").value;
      if (techChoice === "__new__") {
        const naam = document.getElementById("w-newtech-naam").value.trim() || f.trend.slice(0, 60);
        const nieuweTech = {
          id: "tech-" + naam.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now(),
          naam, domein: document.getElementById("w-newtech-domein").value,
          korteBeschrijving: f.trend.slice(0, 160), trl: Number(document.getElementById("w-newtech-trl").value) || 1,
          labels: []
        };
        saveNieuweTechnologie(nieuweTech);
        expl.technologieId = nieuweTech.id;
      } else if (techChoice) {
        expl.technologieId = techChoice;
      }

      expl.samenvatting = f.trend.slice(0, 160);
      expl.funnel.huidigeFase = 1;
      saveExploratie(expl);
      location.hash = "#/nieuwe-exploratie/" + expl.id;
      location.reload();
    }, false);

    function updateSimilarTech() {
      const words = document.getElementById("w-trend").value.toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const scored = existing.map(t => ({ t, score: words.reduce((s, w) => s + ((t.naam + " " + t.korteBeschrijving).toLowerCase().includes(w) ? 1 : 0), 0) }))
        .filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
      document.getElementById("similarBox").innerHTML = scored.length
        ? `<p class="sub">Vergelijkbare technologieën in de hub — kies er één hierboven, of maak een nieuwe aan:</p>` + scored.map(({ t }) => technologieCardHtml(t)).join("")
        : `<p style="font-size:12.5px;color:var(--text-muted)">Nog geen vergelijkbare technologieën gevonden…</p>`;
      bindTechCards();
    }
    document.getElementById("w-trend").addEventListener("input", updateSimilarTech);
    document.getElementById("w-tech-select").addEventListener("change", e => {
      document.getElementById("newTechFields").style.display = e.target.value === "__new__" ? "block" : "none";
    });
    updateSimilarTech();
  }

  function renderFase1(expl) {
    const f = expl.funnel.fase1;
    const body = `
      <div class="field"><label class="req">Doel exploratie</label><textarea id="w-doel">${esc(f.doel)}</textarea></div>
      <div class="field"><label class="req">Hoofdvraag</label><input type="text" id="w-hoofdvraag" value="${esc(f.hoofdvraag)}"></div>
      <div class="field"><label>Deelvragen (één per regel, 3-5)</label><textarea id="w-deelvragen">${esc(f.deelvragen.join("\n"))}</textarea></div>
      <div class="row2">
        <div class="field"><label>In scope (één per regel)</label><textarea id="w-inscope">${esc(f.inScope.join("\n"))}</textarea></div>
        <div class="field"><label>Buiten scope (één per regel)</label><textarea id="w-buitenscope">${esc(f.buitenScope.join("\n"))}</textarea></div>
      </div>
      <div class="field"><label>Aandachtspunten en afspraken (portfoliomeeting)</label><textarea id="w-aandachtspunten">${esc(f.aandachtspunten)}</textarea></div>
    `;
    wizardShell(expl, body, [
      ["doelBeschreven", "Doel exploratie beschreven"],
      ["onderzoeksvragenGemaakt", "Onderzoeksvragen gemaakt"],
      ["afgebakend", "Onderzoek afgebakend"],
      ["trendBesproken", "Trend besproken"]
    ], () => {
      f.doel = document.getElementById("w-doel").value;
      f.hoofdvraag = document.getElementById("w-hoofdvraag").value;
      f.deelvragen = document.getElementById("w-deelvragen").value.split("\n").filter(Boolean);
      f.inScope = document.getElementById("w-inscope").value.split("\n").filter(Boolean);
      f.buitenScope = document.getElementById("w-buitenscope").value.split("\n").filter(Boolean);
      f.aandachtspunten = document.getElementById("w-aandachtspunten").value;
      document.querySelectorAll("[data-check]").forEach(cb => { f.checklist[cb.dataset.check] = cb.checked; });
      expl.funnel.huidigeFase = 2;
      saveExploratie(expl);
      location.hash = "#/nieuwe-exploratie/" + expl.id;
      location.reload();
    }, false);
  }

  function renderFase2(expl) {
    const f = expl.funnel.fase2;
    const body = `
      <div class="field"><label class="req">Omschrijving trend</label><textarea id="w-omschrijving">${esc(f.omschrijving)}</textarea></div>
      <div class="field"><label class="req">Definitie trend</label><textarea id="w-definitie">${esc(f.definitie)}</textarea></div>
      <div class="field"><label>Bronnen bij de definitie (titel — organisatie — jaar — link, één per regel)</label><textarea id="w-defbronnen">${esc(f.definitieBronnen.map(b => `${b.titel} — ${b.organisatie} — ${b.jaar} — ${b.link}`).join("\n"))}</textarea></div>
      <div class="field"><label>Toepassingen (beschrijving — link, één per regel; markeer onzekere claims met (niet geverifieerd))</label><textarea id="w-toepassingen">${esc(f.toepassingen.map(t => `${t.beschrijving} — ${t.link}`).join("\n"))}</textarea></div>
      <div class="row2">
        <div class="field"><label>Kansen — korte termijn (één per regel)</label><textarea id="w-kansen-kort">${esc(f.kansenKort.join("\n"))}</textarea></div>
        <div class="field"><label>Kansen — lange termijn (één per regel)</label><textarea id="w-kansen-lang">${esc(f.kansenLang.join("\n"))}</textarea></div>
      </div>
      <div class="row2">
        <div class="field"><label>Risico's — korte termijn (één per regel)</label><textarea id="w-risicos-kort">${esc(f.risicosKort.join("\n"))}</textarea></div>
        <div class="field"><label>Risico's — lange termijn (één per regel)</label><textarea id="w-risicos-lang">${esc(f.risicosLang.join("\n"))}</textarea></div>
      </div>
    `;
    wizardShell(expl, body, [
      ["omschrevenGedefinieerd", "Trend omschreven en gedefinieerd"],
      ["toepassingenBeschreven", "Toepassingen van de trend beschreven"],
      ["kansenRisicos", "Kansen en risico's beschreven"]
    ], () => {
      f.omschrijving = document.getElementById("w-omschrijving").value;
      f.definitie = document.getElementById("w-definitie").value;
      f.definitieBronnen = document.getElementById("w-defbronnen").value.split("\n").filter(Boolean).map(line => {
        const [titel, organisatie, jaar, link] = line.split("—").map(s => (s || "").trim());
        return { titel, organisatie, jaar, link };
      });
      f.toepassingen = document.getElementById("w-toepassingen").value.split("\n").filter(Boolean).map(line => {
        const [beschrijving, link] = line.split("—").map(s => (s || "").trim());
        return { beschrijving, link };
      });
      f.kansenKort = document.getElementById("w-kansen-kort").value.split("\n").filter(Boolean);
      f.kansenLang = document.getElementById("w-kansen-lang").value.split("\n").filter(Boolean);
      f.risicosKort = document.getElementById("w-risicos-kort").value.split("\n").filter(Boolean);
      f.risicosLang = document.getElementById("w-risicos-lang").value.split("\n").filter(Boolean);
      document.querySelectorAll("[data-check]").forEach(cb => { f.checklist[cb.dataset.check] = cb.checked; });
      expl.funnel.huidigeFase = 3;
      saveExploratie(expl);
      location.hash = "#/nieuwe-exploratie/" + expl.id;
      location.reload();
    }, false);
  }

  function renderFase3(expl) {
    const f = expl.funnel.fase3;
    const body = `
      <div class="field"><label>Expert-interviews (naam — rol/organisatie — belangrijkste uitkomsten, één per regel, minimaal 2)</label><textarea id="w-interviews">${esc(f.interviews.map(i => `${i.naam} — ${i.rolOrganisatie} — ${i.uitkomsten}`).join("\n"))}</textarea></div>
      <div class="field"><label class="req">Meerwaarde voor de organisatie</label><textarea id="w-mw-org">${esc(f.meerwaarde.organisatie)}</textarea></div>
      <div class="field"><label class="req">Meerwaarde voor de medewerker</label><textarea id="w-mw-medewerker">${esc(f.meerwaarde.medewerker)}</textarea></div>
      <div class="field"><label class="req">Meerwaarde voor de burger</label><textarea id="w-mw-burger">${esc(f.meerwaarde.burger)}</textarea></div>
      <div class="field"><label>Mini-test — opzet en succescriteria</label><textarea id="w-test-opzet">${esc(f.miniTest.opzet)}</textarea></div>
      <div class="field"><label>Mini-test — resultaten</label><textarea id="w-test-resultaten">${esc(f.miniTest.resultaten)}</textarea></div>
      <div class="field"><label>Mini-test — conclusie en aanbeveling</label><textarea id="w-test-conclusie">${esc(f.miniTest.conclusie)}</textarea></div>
      <div class="field"><label>Bestaande initiatieven en ervaringen in de organisatie</label><textarea id="w-bestaande">${esc(f.bestaandeInitiatieven)}</textarea></div>
      <div class="field"><label class="req">Conclusie op de hoofdvraag</label><textarea id="w-conclusie-hoofd">${esc(f.conclusieHoofdvraag)}</textarea></div>
      <div class="field"><label>Conclusie per deelvraag (één per regel)</label><textarea id="w-conclusie-deel">${esc(f.conclusieDeelvragen.join("\n"))}</textarea></div>
      <div class="field"><label class="req">Vervolgstatus voor deze exploratie</label>
        <div class="select-wrap"><select id="w-status">${["Pilot", "Opgeschaald", "Gestopt", "Niet opgepakt"].map(s => `<option${expl.status === s ? " selected" : ""}>${esc(s)}</option>`).join("")}</select></div>
      </div>
    `;
    wizardShell(expl, body, [
      ["interviewsGedaan", "Expert interviews gedaan"],
      ["meerwaardeBeschreven", "Meerwaarde beschreven"],
      ["initiatievenOnderzocht", "Bestaande initiatieven en ervaringen onderzocht"],
      ["conclusieGeformuleerd", "Conclusie exploratie geformuleerd"]
    ], () => {
      f.interviews = document.getElementById("w-interviews").value.split("\n").filter(Boolean).map(line => {
        const [naam, rolOrganisatie, uitkomsten] = line.split("—").map(s => (s || "").trim());
        return { naam, rolOrganisatie, uitkomsten };
      });
      f.meerwaarde.organisatie = document.getElementById("w-mw-org").value;
      f.meerwaarde.medewerker = document.getElementById("w-mw-medewerker").value;
      f.meerwaarde.burger = document.getElementById("w-mw-burger").value;
      f.miniTest.opzet = document.getElementById("w-test-opzet").value;
      f.miniTest.resultaten = document.getElementById("w-test-resultaten").value;
      f.miniTest.conclusie = document.getElementById("w-test-conclusie").value;
      f.bestaandeInitiatieven = document.getElementById("w-bestaande").value;
      f.conclusieHoofdvraag = document.getElementById("w-conclusie-hoofd").value;
      f.conclusieDeelvragen = document.getElementById("w-conclusie-deel").value.split("\n").filter(Boolean);
      document.querySelectorAll("[data-check]").forEach(cb => { f.checklist[cb.dataset.check] = cb.checked; });
      expl.status = document.getElementById("w-status").value;
      expl.uitkomst = f.conclusieHoofdvraag;
      expl.funnel.huidigeFase = 4;
      saveExploratie(expl);
      location.hash = "#/nieuwe-exploratie/" + expl.id;
      location.reload();
    }, false);
  }

  function renderFase4(expl) {
    const f = expl.funnel.fase4;
    const body = `
      <div class="field"><label class="req">Overzicht van resultaten</label><textarea id="w-overzicht">${esc(f.resultatenoverzicht)}</textarea></div>
      <h3>Communicatieplan (Communicatie Canvas)</h3>
      <div class="field"><label>Titel (pakkend, nieuwsgierig makend)</label><input type="text" id="w-c-titel" value="${esc(f.canvas.titel)}"></div>
      <div class="field"><label>Aanleiding (probleem, waarom belangrijk, opdrachtgever)</label><textarea id="w-c-aanleiding">${esc(f.canvas.aanleiding)}</textarea></div>
      <div class="field"><label>Aanpak (stappen, wat uniek/vernieuwend, team)</label><textarea id="w-c-aanpak">${esc(f.canvas.aanpak)}</textarea></div>
      <div class="field"><label>Resultaat (concreet resultaat, opbrengst, geleerd)</label><textarea id="w-c-resultaat">${esc(f.canvas.resultaat)}</textarea></div>
      <div class="field"><label>Relevantie (wie heeft baat, doelgroep, wat kunnen anderen leren)</label><textarea id="w-c-relevantie">${esc(f.canvas.relevantie)}</textarea></div>
      <div class="field"><label>Hoe verder (vervolgstappen, waar meer info)</label><textarea id="w-c-hoeverder">${esc(f.canvas.hoeVerder)}</textarea></div>
      <div class="field"><label>Call to action</label><input type="text" id="w-c-cta" value="${esc(f.canvas.callToAction)}"></div>
      <div class="field"><label>Interne communicatie (wat, kanalen)</label><textarea id="w-intern">${esc(f.interneCommunicatie)}</textarea></div>
      <div class="field"><label>Externe communicatie (wat, kanalen)</label><textarea id="w-extern">${esc(f.externeCommunicatie)}</textarea></div>
      <div class="field"><label>Opslaan van bestanden (waar, links)</label><textarea id="w-opslag">${esc(f.opslagBestanden)}</textarea></div>
      <div class="field"><label class="req">Reflectie — wat heb je geleerd?</label><textarea id="w-reflectie">${esc(f.reflectie)}</textarea></div>
    `;
    wizardShell(expl, body, [
      ["resultatenoverzicht", "Overzicht van resultaten gemaakt"],
      ["communicatieplan", "Communicatieplan opgesteld"],
      ["demoGedaan", "Demo gedaan aan het team"],
      ["bestandenOpgeslagen", "Bestanden opgeslagen"]
    ], () => {
      f.resultatenoverzicht = document.getElementById("w-overzicht").value;
      f.canvas.titel = document.getElementById("w-c-titel").value;
      f.canvas.aanleiding = document.getElementById("w-c-aanleiding").value;
      f.canvas.aanpak = document.getElementById("w-c-aanpak").value;
      f.canvas.resultaat = document.getElementById("w-c-resultaat").value;
      f.canvas.relevantie = document.getElementById("w-c-relevantie").value;
      f.canvas.hoeVerder = document.getElementById("w-c-hoeverder").value;
      f.canvas.callToAction = document.getElementById("w-c-cta").value;
      f.interneCommunicatie = document.getElementById("w-intern").value;
      f.externeCommunicatie = document.getElementById("w-extern").value;
      f.opslagBestanden = document.getElementById("w-opslag").value;
      f.reflectie = document.getElementById("w-reflectie").value;
      document.querySelectorAll("[data-check]").forEach(cb => { f.checklist[cb.dataset.check] = cb.checked; });
      expl.funnel.huidigeFase = 5;
      saveExploratie(expl);
      toast("Exploratie afgerond — bekijk 'm terug bij Mijn exploraties");
      location.hash = "#/mijn-exploraties";
    }, true);
  }

  /* ---------- Netwerk ---------- */

  const netState = { q: "" };

  function renderNetwerk() {
    shell("netwerk", `
      <div class="page-head">
        <div>
          <h1 class="page-title">Netwerk</h1>
          <div class="page-sub">Vind de teams achter technologie-exploraties en leg contact via de organisatie</div>
        </div>
      </div>
      <div class="toolbar">
        <div class="searchbox">${I.search}<input id="q" placeholder="Zoek op naam, organisatie, rol of expertise" value="${esc(netState.q)}"></div>
      </div>
      <div class="result-bar"><span id="count"></span></div>
      <div class="people-grid" id="results"></div>
    `);

    function update() {
      const q = netState.q.toLowerCase();
      const list = TEAMS.filter(p => !q || [p.naam, p.org, p.rol, ...(p.expertise || [])].join(" ").toLowerCase().includes(q));
      document.getElementById("count").textContent = `${list.length} ${list.length === 1 ? "resultaat" : "resultaten"}`;
      document.getElementById("results").innerHTML = list.length ? list.map(p => `
        <div class="card person-card">
          <span class="avatar" style="width:46px;height:46px;background:${p.kleur}">${initials(p.naam)}</span>
          <div>
            <h3>${esc(p.naam)}</h3>
            <div class="rol">${esc(p.rol)}</div>
            <div class="meta">Organisatie: <strong>${esc(p.org)}</strong></div>
            <div class="exp"><span class="meta">Expertise:</span>
              ${p.expertise.slice(0, 3).map(x => `<span class="label-chip">${esc(x)}</span>`).join("")}
              ${p.expertise.length > 3 ? `<span class="meta">+${p.expertise.length - 3}</span>` : ""}
            </div>
            <div style="margin-top:9px"><span style="font-size:12.5px;color:var(--text-muted)">Betrokken bij: ${esc(p.betrokkenBij)}</span></div>
          </div>
        </div>`).join("") : `<div class="empty">Geen teams gevonden.</div>`;
    }
    document.getElementById("q").oninput = e => { netState.q = e.target.value; update(); };
    update();
  }

  /* ---------- Mijn account ---------- */

  function renderAccount() {
    const sel = new Set(interests());
    shell("account", `
      <div class="page-head">
        <div>
          <h1 class="page-title">Mijn account</h1>
          <div class="page-sub">Beheer je account en interesses</div>
        </div>
      </div>
      <div class="card account-card">
        <span class="avatar">${USER.initialen}</span>
        <div class="account-cols">
          <div class="kv">
            <h3>Accountinformatie</h3>
            <div class="k">Voor- en achternaam</div><div class="v">${esc(USER.naam)}</div>
            <div class="k">Organisatie</div><div class="v">${esc(USER.org)}</div>
            <div class="k">Rol/functie</div><div class="v">${esc(USER.rol)}</div>
            <div class="k">Afdeling</div><div class="v">${esc(USER.afdeling)}</div>
            <div class="k">Expertise</div><div class="v">${esc(USER.expertise)}</div>
          </div>
          <div>
            <h3>Socials</h3>
            <div class="socials" style="padding:0;border:none;box-shadow:none">
              <div class="row"><span class="ic">${I.mail}</span><a href="mailto:${esc(USER.email)}">${esc(USER.email)}</a></div>
              <div class="row"><span class="ic">${I.phone}</span><span>${esc(USER.tel)}</span></div>
              <div class="row"><span class="ic">${I.linkedin}</span><span>${esc(USER.linkedin)}</span></div>
            </div>
            <button class="btn btn-primary" style="margin-top:14px" onclick="IH.toast('Gegevens wijzigen is nog niet beschikbaar in deze MVP')">Wijzig gegevens</button>
          </div>
        </div>
      </div>
      <div class="card interests-card">
        <h3>Interesses</h3>
        <div class="chip-cloud" id="chips">
          ${INTERESSES.map(i => `<button type="button" class="chip ${sel.has(i) ? "selected" : ""}" data-i="${esc(i)}">${sel.has(i) ? "✓" : "+"} ${esc(i)}</button>`).join("")}
        </div>
        <div class="actions"><button class="btn btn-primary" id="save">Opslaan</button></div>
      </div>
    `);
    document.getElementById("chips").addEventListener("click", e => {
      const b = e.target.closest(".chip"); if (!b) return;
      const v = b.dataset.i;
      sel.has(v) ? sel.delete(v) : sel.add(v);
      b.classList.toggle("selected", sel.has(v));
      b.textContent = (sel.has(v) ? "✓ " : "+ ") + v;
    });
    document.getElementById("save").onclick = () => {
      store.set("interests", [...sel]);
      toast("Interesses opgeslagen");
    };
  }

  /* ---------- Publieke API + start ---------- */

  window.IH = { toast, nav };
  route();
})();
