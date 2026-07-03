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

  function allProjects() { return PROJECTS.concat(store.get("extraProjects", [])); }
  function getProject(id) { return allProjects().find(p => p.id === id); }
  function person(id) { return PEOPLE.find(p => p.id === id) || PEOPLE[0]; }
  function initials(n) { return n.split(" ").filter(Boolean).map(w => w[0]).slice(0, 2).join("").toUpperCase(); }
  function interests() { return store.get("interests", USER.interesses); }

  function parseDate(d) { // "DD-MM-JJJJ" -> sorteerbaar
    if (!d || d === "-") return 0;
    const [dd, mm, yy] = d.split("-").map(Number);
    return (yy || 0) * 10000 + (mm || 0) * 100 + (dd || 0);
  }

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

  /* Thema-iconen voor projectafbeeldingen */
  const THEME_ICONS = {
    "Data": '<svg class="icon" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><ellipse cx="12" cy="5.5" rx="7.5" ry="2.8"/><path d="M4.5 5.5v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6"/><path d="M4.5 11.5v6c0 1.5 3.4 2.8 7.5 2.8s7.5-1.3 7.5-2.8v-6"/></svg>',
    "AI": '<svg class="icon" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><rect x="6" y="7" width="12" height="11" rx="2.5"/><circle cx="9.7" cy="12" r="1.2" fill="#fff"/><circle cx="14.3" cy="12" r="1.2" fill="#fff"/><path d="M9.5 15.3h5M12 7V4.4M12 4.4a1.3 1.3 0 1 0-.1 0zM6 10.5H3.8M18 10.5h2.2"/></svg>',
    "Cloud": '<svg class="icon" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><path d="M7 18a4.5 4.5 0 0 1-.4-9A6 6 0 0 1 18.2 10 3.8 3.8 0 0 1 17.5 18z"/></svg>',
    "Digitale weerbaarheid": '<svg class="icon" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><path d="M12 3 5 5.5v5c0 4.6 3 8.4 7 10 4-1.6 7-5.4 7-10v-5z"/><path d="m9.3 12 2 2 3.6-4"/></svg>',
    "Digitaal vakmanschap": '<svg class="icon" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><path d="m8 9-4 3 4 3M16 9l4 3-4 3M13.5 6l-3 12"/></svg>',
    "Burgergericht": '<svg class="icon" width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.6"><circle cx="9" cy="8.5" r="3"/><path d="M3.5 19c0-3 2.5-4.8 5.5-4.8s5.5 1.8 5.5 4.8"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M16 14.6c2.6.2 4.5 1.9 4.5 4.4"/></svg>'
  };

  function thumbStyle(theme) {
    const c = THEME_COLORS[theme] || "#888";
    return `background: linear-gradient(135deg, ${c}cc, ${c});`;
  }

  function tagHtml(theme) {
    return `<span class="tag" style="background:${THEME_COLORS[theme] || "#888"}">${esc(theme)}</span>`;
  }

  function statusDot(status) {
    return `<span class="status-dot" style="background:${STATUS_COLORS[status] || "#999"}" title="${esc(status)}"></span>`;
  }

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
    const orgs = [...new Set(EXPLORATIES.map(e => e.org))].sort();
    const statuses = Object.keys(STATUS_COLORS);
    const jaren = [...new Set(EXPLORATIES.map(e => e.jaar))].sort().reverse();

    const my = interests();
    const rec = TECHNOLOGIEEN.filter(t => t.labels.some(l => my.includes(l)) || my.includes(t.domein)).slice(0, 10);
    const recList = rec.length ? rec : TECHNOLOGIEEN.slice(0, 8);

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
      const filtered = EXPLORATIES.filter(e =>
        (!fOrg.value || e.org === fOrg.value) &&
        (!fStatus.value || e.status === fStatus.value) &&
        (!fJaar.value || e.jaar === fJaar.value)
      );
      const techIds = new Set(filtered.map(e => e.technologieId));
      const c = {};
      TECHNOLOGIEEN.forEach(t => { if (techIds.has(t.id)) c[t.domein] = (c[t.domein] || 0) + 1; });
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
    const expls = EXPLORATIES.filter(e => e.technologieId === t.id);
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

  /* ---------- Innovaties (alle projecten) ---------- */

  const techState = { q: "", domein: "", org: "", status: "", jaar: "", filterOpen: false, sort: "naam", view: "grid" };

  function renderTechnologieen(param, initialDomein) {
    const orgs = [...new Set(EXPLORATIES.map(e => e.org))].sort();
    const jaren = [...new Set(EXPLORATIES.map(e => e.jaar))].sort().reverse();
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

      let list = TECHNOLOGIEEN.filter(t => {
        const matchesQ = !techState.q || (t.naam + " " + t.korteBeschrijving).toLowerCase().includes(techState.q.toLowerCase());
        const matchesDomein = !techState.domein || t.domein === techState.domein;
        const explsForTech = EXPLORATIES.filter(e => e.technologieId === t.id);
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

  function renderProject(id) {
    const p = getProject(id);
    if (!p) { shell("innovaties", `<div class="empty">Project niet gevonden. <a href="#/innovaties">Terug naar overzicht</a></div>`); return; }
    const c = person(p.contactId);
    const similar = allProjects().filter(o => o.id !== p.id && (o.theme === p.theme || o.labels.some(l => p.labels.includes(l)))).slice(0, 8);

    const tabs = [
      ["info", "Projectinformatie"],
      ["probleem", "Probleem- & doelstelling"],
      ["lessen", "Geleerde lessen"],
      ["contact", "Contactpersoon"],
      ["bieb", "Bibliotheek"],
      ["soortgelijk", "Soortgelijke projecten"]
    ];

    const tabContent = {
      info: `
        <div class="two-col">
          <div class="card content-card">
            <h3>Projectbeschrijving</h3>
            <p>${esc(p.beschrijving)}</p>
            ${p.context ? `<h3>Broncontext</h3><p>${esc(p.context)}</p>` : ""}
          </div>
          <div style="display:flex;flex-direction:column;gap:20px">
            <div class="card content-card">
              <h3>GDI-bouwblokken</h3>
              <div>${p.gdi && p.gdi.length
                ? p.gdi.map((g, i) => `<span class="gdi-chip" style="background:${["#fce7f3", "#dcfce7", "#e0e7ff", "#f1f5f9", "#fef3c7", "#e0f2fe"][i % 6]}">${esc(g)}</span>`).join("")
                : `<p style="font-size:13px;color:var(--text-muted)">Geen GDI-bouwblokken herkend in de projectbeschrijving.</p>`}</div>
            </div>
            <div class="card content-card">
              <h3>Labels</h3>
              <div>${p.labels.map(l => `<span class="label-chip">${esc(l)}</span>`).join("")}</div>
            </div>
          </div>
        </div>`,
      probleem: `
        <div class="two-col">
          <div class="card content-card"><h3>Probleemstelling</h3><p>${esc(p.probleem) || `Er is geen aparte probleemstelling gepubliceerd op digitaleoverheid.nl. Zie de projectbeschrijving of de bronpagina.`}</p></div>
          <div class="card content-card"><h3>Doelstelling</h3><p>${esc(p.doel) || `Er is geen aparte doelstelling gepubliceerd op digitaleoverheid.nl. Zie de projectbeschrijving of de bronpagina.`}</p></div>
        </div>`,
      lessen: `
        <div class="card content-card">
          <h3>Geleerde lessen</h3>
          ${p.lessen && p.lessen.length ? `<ul>${p.lessen.map(l => `<li>${esc(l)}</li>`).join("")}</ul>` : `<p>Er zijn geen geleerde lessen gepubliceerd voor dit project. Raadpleeg de bronpagina op digitaleoverheid.nl voor actuele informatie.</p>`}
        </div>`,
      contact: `
        <div class="contact-grid">
          <div class="card contact-card">
            <span class="avatar" style="width:74px;height:74px;font-size:22px;background:${c.kleur}">${initials(c.naam)}</span>
            <div class="info">
              <div class="name">${esc(c.naam)}</div>
              <div class="k">Organisatie</div><div class="v">${esc(c.org)}</div>
              <div class="k">Afdeling</div><div class="v">${esc(c.afdeling)}</div>
              <div class="k">Rol/functie</div><div class="v">${esc(c.rol)}</div>
              <div class="k">Betrokken bij</div><div class="v">${esc(c.betrokkenBij)}</div>
            </div>
          </div>
          <div class="card socials">
            <h3>Contact</h3>
            ${c.email ? `<div class="row"><span class="ic">${I.mail}</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>` : ""}
            ${c.tel ? `<div class="row"><span class="ic">${I.phone}</span><span>${esc(c.tel)}</span></div>` : ""}
            ${p.bron ? `<div class="row"><span class="ic">${I.linkIc}</span><a href="${esc(p.bron)}" target="_blank" rel="noopener">Projectpagina op digitaleoverheid.nl</a></div>` : ""}
            ${!c.email && !c.tel ? `<p style="font-size:12.5px;color:var(--text-muted);margin-top:8px">Er zijn geen persoonlijke contactgegevens gepubliceerd; neem contact op via de projectpagina of de regievoerende organisatie.</p>` : ""}
          </div>
        </div>`,
      bieb: `
        <div class="file-list">
          ${p.files.map(f => `
            <div class="card file-row">
              ${f.type === "link" ? I.linkIc : I.file}
              <span class="fname">${esc(f.naam)}${f.type !== "link" ? ` (${esc(f.type)}, ${esc(f.grootte)}, ${esc(f.datum)})` : ` (${esc(f.datum)})`}</span>
              ${f.url
                ? `<a href="${esc(f.url)}" target="_blank" rel="noopener">Openen</a>`
                : `<a href="#" onclick="IH.toast('Voorbeeldbestand — downloads zijn niet beschikbaar in deze demo');return false;">${f.actie === "download" ? I.download + " Download" : "Openen"}</a>`}
            </div>`).join("")}
        </div>`,
      soortgelijk: similar.length
        ? `<div class="hscroll">${similar.map(o => cardHtml(o, { labels: true })).join("")}</div>`
        : `<div class="empty">Geen soortgelijke projecten gevonden.</div>`
    };

    shell("innovaties", `
      <div class="detail-top">
        <button class="icon-btn" onclick="history.back()" aria-label="Terug">${I.back}</button>
        <button class="icon-btn" id="shareBtn" aria-label="Delen">${I.share}</button>
      </div>
      <div class="detail-head">
        <div class="thumb" style="${thumbStyle(p.theme)}">${THEME_ICONS[p.theme] || ""}${tagHtml(p.theme)}</div>
        <div class="detail-meta">
          <h1>${esc(p.title)}</h1>
          <div class="meta-grid">
            <div class="meta-item"><div class="k">Project status</div><div class="v">${statusDot(p.status)}${esc(p.status)}</div></div>
            <div class="meta-item"><div class="k">Jaar innovatiebudget</div><div class="v">${esc(p.jaar || "-")}</div></div>
            <div class="meta-item"><div class="k">Projectfase</div><div class="v">${esc(p.fase)}</div></div>
            <div class="meta-item"><div class="k">Type organisatie</div><div class="v">${esc(p.typeOrganisatie || "-")}</div></div>
            <div class="meta-item"><div class="k">Regievoerder</div><div class="v">${esc(p.org)}</div></div>
            <div class="meta-item"><div class="k">Plaats</div><div class="v">${esc(p.plaats || "-")}</div></div>
            <div class="meta-item"><div class="k">Partnerorganisaties</div><div class="v">${esc((p.partners || []).join(", ") || "-")}</div></div>
            <div class="meta-item"><div class="k">Bron</div><div class="v">${p.bron ? `<a href="${esc(p.bron)}" target="_blank" rel="noopener">digitaleoverheid.nl</a>` : "-"}</div></div>
          </div>
        </div>
      </div>
      <div class="tabs" id="tabs">
        ${tabs.map(([tid, lbl], i) => `<button data-t="${tid}" class="${i === 0 ? "active" : ""}">${lbl}</button>`).join("")}
      </div>
      <div id="tabBody">${tabContent.info}</div>
    `);

    document.getElementById("tabs").addEventListener("click", e => {
      const b = e.target.closest("button[data-t]"); if (!b) return;
      document.querySelectorAll("#tabs button").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      document.getElementById("tabBody").innerHTML = tabContent[b.dataset.t];
      bindCards();
    });
    document.getElementById("shareBtn").onclick = () => {
      const url = location.href;
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => toast("Link gekopieerd naar klembord"));
      else toast("Kopieer de link uit de adresbalk om te delen");
    };
    bindCards();
  }

  /* ---------- Mijn projecten ---------- */

  const mijnState = { tab: "Alle", q: "" };

  function renderMijnProjecten() {
    const mine = allProjects().filter(p => p.mine);
    const tabs = ["Alle", "Afgerond", "Lopend", "Gestopt", "On hold", "Concept"];
    const count = t => t === "Alle" ? mine.length : mine.filter(p => p.status === t).length;

    shell("mijn-projecten", `
      <div class="page-head">
        <div>
          <h1 class="page-title">Mijn projecten</h1>
          <div class="page-sub">Beheer, bekijk en werk verder aan je projecten</div>
        </div>
        <a class="btn btn-primary" href="#/nieuw-project">Nieuw project ${I.plus}</a>
      </div>
      <div class="toolbar">
        <div class="searchbox">${I.search}<input id="q" placeholder="Zoeken" value="${esc(mijnState.q)}"></div>
      </div>
      <div class="status-tabs" id="stabs">
        ${tabs.map(t => `<button data-t="${t}" class="${mijnState.tab === t ? "active" : ""}">${t === "Alle" ? "Alle projecten" : t} (${count(t)})</button>`).join("")}
      </div>
      <div id="results" class="grid"></div>
    `);

    function update() {
      let list = mine.filter(p =>
        (mijnState.tab === "Alle" || p.status === mijnState.tab) &&
        (!mijnState.q || (p.title + " " + p.org + " " + p.kort).toLowerCase().includes(mijnState.q.toLowerCase()))
      );
      document.getElementById("results").innerHTML = list.length
        ? list.map(p => cardHtml(p, { labels: true })).join("")
        : `<div class="empty">Geen projecten in deze categorie.</div>`;
      bindCards();
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

  /* ---------- Nieuw project ---------- */

  function renderNieuwProject() {
    const fases = ["Idee", "Proof of concept", "Pilot", "Implementatie", "Opgeschaald"];
    const statuses = Object.keys(STATUS_COLORS);

    shell("mijn-projecten", `
      <a href="#/mijn-projecten" style="display:inline-flex;align-items:center;gap:6px;font-size:13px;margin-bottom:14px">${I.back} Terug naar projecten</a>
      <div class="np-layout">
        <form class="card np-form" id="npForm">
          <h1>Nieuw project aanmaken</h1>
          <div class="sub">Vul hieronder de gegevens in om een nieuw innovatieproject toe te voegen</div>

          <div class="np-section">
            <button type="button" class="sec-head">Projectinformatie <span>⌃</span></button>
            <div class="sec-body">
              <div class="row2">
                <div class="field"><label class="req" for="npTitel">Titel</label><input type="text" id="npTitel" placeholder="Voer projecttitel in"></div>
                <div class="field"><label class="req" for="npThema">Thema</label>
                  <div class="select-wrap"><select id="npThema"><option value="">Kies een thema</option>${THEMES.map(t => `<option>${esc(t)}</option>`).join("")}</select></div>
                </div>
              </div>
              <div class="field">
                <label>Afbeelding</label>
                <div class="upload-zone">
                  <button type="button" class="btn btn-ghost" onclick="IH.toast('Uploaden is nog niet beschikbaar in deze MVP')">Uploaden ${I.upload}</button>
                  <strong>Kies een bestand of sleep het hiernaartoe</strong>
                  JPEG, PNG, SVG en WebP-afbeeldingen
                </div>
              </div>
              <div class="field"><label class="req" for="npOms">Omschrijving</label><textarea id="npOms" placeholder="Voer projectomschrijving in"></textarea></div>
            </div>
          </div>

          <div class="np-section">
            <button type="button" class="sec-head">Projectdetails <span>⌃</span></button>
            <div class="sec-body">
              <div class="row2">
                <div class="field"><label class="req" for="npStatus">Projectstatus</label>
                  <div class="select-wrap"><select id="npStatus">${statuses.map(s => `<option>${esc(s)}</option>`).join("")}</select></div>
                </div>
                <div class="field"><label class="req" for="npFase">Projectfase</label>
                  <div class="select-wrap"><select id="npFase">${fases.map(f => `<option>${esc(f)}</option>`).join("")}</select></div>
                </div>
              </div>
              <div class="row2">
                <div class="field"><label class="req" for="npStart">Startdatum</label><input type="date" id="npStart"></div>
                <div class="field"><label for="npEind">Einddatum</label><input type="date" id="npEind"></div>
              </div>
            </div>
          </div>

          <div class="np-section">
            <button type="button" class="sec-head">Contactpersoon <span>⌃</span></button>
            <div class="sec-body">
              <div class="radio-row">
                <label><input type="radio" name="cp" checked> Ik ben de contactpersoon</label>
                <label><input type="radio" name="cp"> Selecteer een persoon</label>
                <label><input type="radio" name="cp"> Handmatig invoeren</label>
              </div>
              <div class="me-card">
                <span class="avatar">${USER.initialen}</span>
                <div>
                  <div class="nm">${esc(USER.naam)}</div>
                  <div class="sub2">${esc(USER.rol)}<br>${esc(USER.org)}</div>
                  <div class="contacts"><span>${I.mail} ${esc(USER.email)}</span><span>${I.phone} ${esc(USER.tel)}</span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="np-section">
            <button type="button" class="sec-head">Organisaties <span>⌃</span></button>
            <div class="sec-body">
              <div class="field"><label class="req" for="npOrg">Projectorganisatie</label><input type="text" id="npOrg" placeholder="Voer organisatienaam in"></div>
              <div class="field"><label for="npPartners">Partnerorganisaties</label><input type="text" id="npPartners" placeholder="Voer partnerorganisaties in (gescheiden door komma's)"></div>
            </div>
          </div>

          <div class="np-section collapsed">
            <button type="button" class="sec-head">Projectinhoud <span>⌄</span></button>
            <div class="sec-body">
              <div class="field"><label for="npProbleem">Probleemstelling</label><textarea id="npProbleem" placeholder="Welk probleem lost dit project op?"></textarea></div>
              <div class="field"><label for="npDoel">Doelstelling</label><textarea id="npDoel" placeholder="Wat is het doel van het project?"></textarea></div>
            </div>
          </div>

          <div class="np-section collapsed">
            <button type="button" class="sec-head">GDI-bouwblokken <span>⌄</span></button>
            <div class="sec-body">
              <div class="chip-cloud" style="justify-content:flex-start" id="npGdi">
                ${GDI_BOUWBLOKKEN.map(g => `<button type="button" class="chip" data-v="${esc(g)}">+ ${esc(g)}</button>`).join("")}
              </div>
            </div>
          </div>

          <div class="np-section collapsed">
            <button type="button" class="sec-head">Labels <span>⌄</span></button>
            <div class="sec-body">
              <div class="chip-cloud" style="justify-content:flex-start" id="npLabels">
                ${INTERESSES.slice(0, 20).map(l => `<button type="button" class="chip" data-v="${esc(l)}">+ ${esc(l)}</button>`).join("")}
              </div>
            </div>
          </div>

          <div class="np-section collapsed">
            <button type="button" class="sec-head">Bestand toevoegen <span>⌄</span></button>
            <div class="sec-body">
              <div class="upload-zone">Bestanden uploaden is nog niet beschikbaar in deze MVP.</div>
            </div>
          </div>

          <div class="np-actions">
            <button type="submit" class="btn btn-primary" data-mode="delen">Project delen</button>
            <button type="submit" class="btn btn-outline" data-mode="concept">Opslaan als concept</button>
          </div>
        </form>

        <aside class="card np-aside">
          <h3>Vergelijkbare projecten</h3>
          <div class="sub">Ontdek of er al vergelijkbare projecten bestaan</div>
          <div id="similarBox"><p style="font-size:12.5px;color:var(--text-muted)">Er zijn nog geen vergelijkbare projecten gevonden…</p></div>
        </aside>
      </div>
    `);

    // Inklapbare secties
    document.querySelectorAll(".np-section .sec-head").forEach(h => {
      h.addEventListener("click", () => {
        const sec = h.parentElement;
        sec.classList.toggle("collapsed");
        h.querySelector("span").textContent = sec.classList.contains("collapsed") ? "⌄" : "⌃";
      });
    });

    // Chip-selectie
    const selGdi = new Set(), selLabels = new Set();
    function chipToggle(containerId, set) {
      document.getElementById(containerId).addEventListener("click", e => {
        const b = e.target.closest(".chip"); if (!b) return;
        const v = b.dataset.v;
        set.has(v) ? set.delete(v) : set.add(v);
        b.classList.toggle("selected", set.has(v));
        b.textContent = (set.has(v) ? "✓ " : "+ ") + v;
      });
    }
    chipToggle("npGdi", selGdi);
    chipToggle("npLabels", selLabels);

    // Vergelijkbare projecten (live op titel/omschrijving/thema)
    const titelEl = document.getElementById("npTitel"), omsEl = document.getElementById("npOms"), themaEl = document.getElementById("npThema");
    function updateSimilar() {
      const words = (titelEl.value + " " + omsEl.value).toLowerCase().split(/\W+/).filter(w => w.length > 3);
      const theme = themaEl.value;
      const scored = allProjects().map(p => {
        const hay = (p.title + " " + p.kort).toLowerCase();
        let score = words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0);
        if (theme && p.theme === theme) score += 1;
        return { p, score };
      }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
      document.getElementById("similarBox").innerHTML = scored.length
        ? scored.map(({ p }) => `
            <div class="mini" onclick="location.hash='#/project/${esc(p.id)}'">
              <div class="sw" style="${thumbStyle(p.theme)}"></div>
              <div><h4>${esc(p.title)}</h4><p>${esc(p.org)} · ${esc(p.theme)}</p></div>
            </div>`).join("")
        : `<p style="font-size:12.5px;color:var(--text-muted)">Er zijn nog geen vergelijkbare projecten gevonden…</p>`;
    }
    titelEl.addEventListener("input", updateSimilar);
    omsEl.addEventListener("input", updateSimilar);
    themaEl.addEventListener("change", updateSimilar);

    // Opslaan
    let mode = "delen";
    document.querySelectorAll(".np-actions .btn").forEach(b => b.addEventListener("click", () => { mode = b.dataset.mode; }));
    document.getElementById("npForm").onsubmit = e => {
      e.preventDefault();
      const titel = titelEl.value.trim(), thema = themaEl.value, oms = omsEl.value.trim(), org = document.getElementById("npOrg").value.trim();
      if (!titel || !thema || !oms || !org) { toast("Vul de verplichte velden in (titel, thema, omschrijving, organisatie)"); return; }
      const fmt = iso => iso ? iso.split("-").reverse().join("-") : "-";
      const nieuw = {
        id: "eigen-" + Date.now(),
        title: titel, org, theme: thema,
        status: mode === "concept" ? "Concept" : document.getElementById("npStatus").value,
        fase: document.getElementById("npFase").value,
        start: fmt(document.getElementById("npStart").value), eind: fmt(document.getElementById("npEind").value),
        gepubliceerd: new Date().toLocaleDateString("nl-NL"), bijgewerkt: new Date().toLocaleDateString("nl-NL"),
        partners: document.getElementById("npPartners").value.split(",").map(s => s.trim()).filter(Boolean),
        kort: oms.slice(0, 220), beschrijving: oms,
        probleem: document.getElementById("npProbleem").value.trim() || "Nog niet ingevuld.",
        doel: document.getElementById("npDoel").value.trim() || "Nog niet ingevuld.",
        lessen: [], gdi: [...selGdi], labels: [...selLabels],
        contactId: "tdv", files: [], mine: true, eigen: true
      };
      const extra = store.get("extraProjects", []);
      extra.push(nieuw);
      store.set("extraProjects", extra);
      toast(mode === "concept" ? "Project opgeslagen als concept" : "Project gedeeld op de Innovatie Hub");
      nav("#/mijn-projecten");
    };
  }

  /* ---------- Netwerk ---------- */

  const netState = { q: "" };

  function renderNetwerk() {
    shell("netwerk", `
      <div class="page-head">
        <div>
          <h1 class="page-title">Netwerk</h1>
          <div class="page-sub">Vind de projectteams achter de innovatieprojecten en leg contact via de regievoerende organisatie</div>
        </div>
      </div>
      <div class="toolbar">
        <div class="searchbox">${I.search}<input id="q" placeholder="Zoek op naam, organisatie, rol/functie of expertise" value="${esc(netState.q)}"></div>
      </div>
      <div class="result-bar"><span id="count"></span></div>
      <div class="people-grid" id="results"></div>
    `);

    function update() {
      const q = netState.q.toLowerCase();
      const list = PEOPLE.filter(p => !q || [p.naam, p.org, p.rol, ...(p.expertise || [])].join(" ").toLowerCase().includes(q));
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
            <div style="margin-top:9px">${p.email ? `<a href="mailto:${esc(p.email)}" style="font-size:12.5px">${esc(p.email)}</a>` : `<span style="font-size:12.5px;color:var(--text-muted)">Betrokken bij: ${esc(p.betrokkenBij)}</span>`}</div>
          </div>
        </div>`).join("") : `<div class="empty">Geen personen gevonden.</div>`;
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
