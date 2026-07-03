# Exploratie Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static demo/pitch web app ("Exploratie Hub") that tracks which emerging technologies Dutch public-sector organizations are exploring, based on a fork of `tjebbehb/innovatie-hub-mvp`.

**Architecture:** Plain HTML/CSS/JS, no framework, no build step, no backend — same as the original. All data lives in `js/data.js`; routing/rendering lives in `js/app.js` (hash router, one `render*` function per view). User-created content (new explorations, interests) persists in `localStorage` under the `ehub:` key prefix.

**Tech Stack:** HTML5, vanilla ES6 JS, CSS (no preprocessor), no npm/build tooling. `python3 -m http.server` for local serving.

## Global Constraints

- No framework, no build step, no bundler, no npm dependencies — matches the forked original exactly (spec: "Architectuur").
- All data hardcoded in `js/data.js`. No network calls at runtime.
- `localStorage` key prefix is `ehub:` (renamed from original's `ihub:` — this is a distinct app).
- Seed dataset: 8-12 real technologies, each with 2-5 real Dutch public-sector organizations exploring it (spec: "Omvang seed-data"). No fabricated orgs, outcomes, or sources — mark anything unverified as **(niet geverifieerd)** rather than inventing it, per spec's Novum bron-discipline principle.
- The funnel wizard (5 Novum phases) is a static form — no AI, no live bron-checking, no backend (spec: "Mijn exploraties: Novum-funnel wizard").
- Seed-data `Exploratie` records never get a `funnel` field — only user-created ones do (spec: data model note under `Exploratie`).
- Domain taxonomy is the 15 Trendroos sub-domains grouped into 7 clusters — exact names and colors are fixed in the spec's "Trendroos-domeinen" table and must be copied verbatim.
- Because `js/app.js` and `js/data.js` are edited across multiple tasks, later tasks locate code by **function name**, not by line number (line numbers shift after each edit).
- Every task must be verified by running `python3 -m http.server 8000` from the project root and checking the relevant view in a browser — there is no automated test suite in this codebase (matches the original; do not introduce a test framework).

---

## File Structure

```
index.html          — app shell (script/style tags only, unchanged in shape from original)
css/style.css        — forked from original, extended with wheel + wizard styles
js/data.js            — new schema: DOMAINS, DOMAIN_CLUSTERS, DOMAIN_COLORS, TECHNOLOGIEEN, EXPLORATIES, TEAMS, INTERESSES, USER, STATUS_COLORS
js/app.js             — forked from original: routing table, shell/nav, all render* functions, store helper
```

No new files beyond what the original already has — the wizard is additional `render*` functions inside `js/app.js`, not a separate file, matching the original's single-file-per-concern structure.

---

### Task 1: Baseline copy of the original app

**Files:**
- Create: `index.html`
- Create: `css/style.css`
- Create: `js/app.js`
- Create: `js/data.js`

**Interfaces:**
- Produces: a running copy of `tjebbehb/innovatie-hub-mvp` at commit `main`, unmodified, as the starting point for every later task.

- [ ] **Step 1: Download the four source files from the original repo**

```bash
cd "/Users/jeroenvonk/dev/Claude code/exploratie"
mkdir -p css js
curl -sL https://raw.githubusercontent.com/TjebbeHB/innovatie-hub-mvp/main/index.html -o index.html
curl -sL https://raw.githubusercontent.com/TjebbeHB/innovatie-hub-mvp/main/css/style.css -o css/style.css
curl -sL https://raw.githubusercontent.com/TjebbeHB/innovatie-hub-mvp/main/js/app.js -o js/app.js
curl -sL https://raw.githubusercontent.com/TjebbeHB/innovatie-hub-mvp/main/js/data.js -o js/data.js
```

- [ ] **Step 2: Verify the files downloaded correctly**

Run: `wc -l index.html css/style.css js/app.js js/data.js`
Expected: `js/app.js` is ~936 lines, `js/data.js` is non-trivial (hundreds of KB — it holds 127 seed projects we will replace in Task 3), `index.html` and `css/style.css` are non-empty.

- [ ] **Step 3: Serve locally and verify the original app boots**

```bash
python3 -m http.server 8000 &
sleep 1
curl -s http://localhost:8000/ | grep -o '<title>[^<]*</title>'
```

Expected: prints a `<title>` tag (confirms `index.html` serves). Then open `http://localhost:8000/#/login` in a browser and confirm the "Innovatie Hub" login screen renders with the Rijksoverheid ribbon header. Stop the server (`kill %1` or close the terminal job) once confirmed.

- [ ] **Step 4: Commit**

```bash
git add index.html css/style.css js/app.js js/data.js
git commit -m "Baseline copy of tjebbehb/innovatie-hub-mvp as starting point"
```

---

### Task 2: Research and compile seed dataset

**Files:**
- Create: `docs/superpowers/plans/2026-07-03-seed-data.json` (intermediate research output, consumed by Task 3)

**Interfaces:**
- Produces: a JSON file with 10 `Technologie` objects and 2-5 `Exploratie` objects per technology, matching the shapes below. Task 3 reads this file directly.

This task is research, not coding. Use WebSearch/Perplexity to find real, sourced organizations and outcomes. **Do not invent an organization, outcome, or source.** If a plausible claim can't be verified with a real source, either drop that org/exploration or keep the claim but prefix it with `(niet geverifieerd)` in `samenvatting`/`uitkomst`.

- [ ] **Step 1: Fix the technology list and domain assignment**

Use exactly these 10 technologies (already assigned to a Trendroos sub-domain — this classification is a design decision, not a research question):

```json
[
  {"naam": "Generatieve AI in overheidsdienstverlening", "domein": "Kunstmatige intelligentie"},
  {"naam": "Digital twins voor infrastructuur en waterbeheer", "domein": "Fysieke leefomgeving"},
  {"naam": "Post-quantum cryptografie", "domein": "Veiligheid"},
  {"naam": "Federated learning voor privacyvriendelijke data-analyse", "domein": "Gezondheid"},
  {"naam": "Blockchain/DLT voor registers en identiteit", "domein": "Rechtsstaat"},
  {"naam": "Synthetic data voor beleidsonderzoek", "domein": "Economie"},
  {"naam": "Extended reality (VR/AR) voor training en simulatie", "domein": "Arbeidsmarkt"},
  {"naam": "Slimme energienetten (smart grids)", "domein": "Energie"},
  {"naam": "Sensornetwerken/IoT voor omgevingsmonitoring", "domein": "Klimaat"},
  {"naam": "Uitlegbare AI (explainable AI) voor besluitondersteuning", "domein": "Kansengelijkheid"}
]
```

- [ ] **Step 2: For each technology, research 2-5 real Dutch public-sector organizations exploring it**

For each technology, search for: `<technologie> gemeente OR provincie OR rijksoverheid OR uitvoeringsorganisatie pilot OR onderzoek`. For every organization found, capture:

```json
{
  "id": "kebab-case-slug",
  "technologieNaam": "must match Step 1 naam exactly",
  "org": "volledige organisatienaam",
  "typeOrganisatie": "Gemeente | Provincie | Rijksoverheid | Uitvoeringsorganisatie | Waterschap",
  "status": "Onderzoekt | Pilot | Opgeschaald | Gestopt | Niet opgepakt",
  "jaar": "jjjj",
  "samenvatting": "2-3 zinnen, wat doen ze",
  "uitkomst": "bevindingen, of leeg als status = Onderzoekt",
  "bron": "volledige URL naar de bron",
  "team": "generiek team/afdeling, geen persoonsnamen"
}
```

`status` reflects what the source actually reports (a pilot that's still running = "Pilot", a completed rollout = "Opgeschaald", an explicitly discontinued effort = "Gestopt"). Do not default everything to "Onderzoekt" — vary status honestly based on findings.

- [ ] **Step 3: Assign a TRL (1-9) per technology**

Base the TRL on the overall maturity implied by the gathered explorations (e.g., if most found orgs are still at "Onderzoekt"/"Pilot", TRL 3-5; if several report "Opgeschaald", TRL 6-8). Write one sentence of justification per TRL next to it in the output file.

- [ ] **Step 4: Write `docs/superpowers/plans/2026-07-03-seed-data.json`**

```json
{
  "technologieen": [
    {
      "id": "kebab-slug",
      "naam": "...",
      "domein": "...",
      "korteBeschrijving": "1-2 zinnen",
      "trl": 5,
      "trlJustificatie": "...",
      "labels": ["...", "..."]
    }
  ],
  "exploraties": [
    { "...": "shape from Step 2, plus technologieId referencing a technologieen[].id" }
  ]
}
```

Target: 10 technologies × 2-5 explorations = 20-50 total `Exploratie` records.

- [ ] **Step 5: Verify no fabrication slipped in**

Run: `grep -c '"bron"' docs/superpowers/plans/2026-07-03-seed-data.json` and manually open every URL in `bron` fields to confirm they resolve and actually mention the claimed organization/technology. Any entry that fails this check gets either fixed with a real source or removed.

- [ ] **Step 6: Commit**

```bash
git add docs/superpowers/plans/2026-07-03-seed-data.json
git commit -m "Research and compile seed dataset for Exploratie Hub"
```

---

### Task 3: Rewrite `js/data.js`

**Files:**
- Modify: `js/data.js` (full rewrite — original's `PROJECTS`/`PEOPLE`/`THEMES` content is replaced entirely)

**Interfaces:**
- Consumes: `docs/superpowers/plans/2026-07-03-seed-data.json` (Task 2)
- Produces: `DOMAINS` (array of 15 strings), `DOMAIN_CLUSTERS` (object: domain → cluster name), `DOMAIN_COLORS` (object: domain → hex), `STATUS_COLORS` (object: status → hex), `TECHNOLOGIEEN` (array), `EXPLORATIES` (array), `TEAMS` (array), `INTERESSES` (array of domain names), `USER` (object) — all consumed by `js/app.js` in later tasks.

- [ ] **Step 1: Replace the top of `js/data.js` with the new taxonomy constants**

Find the original's `const THEMES = [...]` and `const THEME_COLORS = {...}` block (near the top of the file) and replace it with:

```javascript
const DOMAINS = [
  "Demografie", "Gezondheid", "Geopolitiek", "Veiligheid", "Economie", "Arbeidsmarkt",
  "Technologie", "Kunstmatige intelligentie", "Kansengelijkheid", "Sociale cohesie",
  "Klimaat", "Energie", "Fysieke leefomgeving", "Rechtsstaat", "Democratie"
];

const DOMAIN_CLUSTERS = {
  "Demografie": "Demografie en gezondheid",
  "Gezondheid": "Demografie en gezondheid",
  "Geopolitiek": "Geopolitiek en veiligheid",
  "Veiligheid": "Geopolitiek en veiligheid",
  "Economie": "Economie en arbeidsmarkt",
  "Arbeidsmarkt": "Economie en arbeidsmarkt",
  "Technologie": "Technologie en kunstmatige intelligentie",
  "Kunstmatige intelligentie": "Technologie en kunstmatige intelligentie",
  "Kansengelijkheid": "Kansengelijkheid en sociale cohesie",
  "Sociale cohesie": "Kansengelijkheid en sociale cohesie",
  "Klimaat": "Klimaat, energie en fysieke leefomgeving",
  "Energie": "Klimaat, energie en fysieke leefomgeving",
  "Fysieke leefomgeving": "Klimaat, energie en fysieke leefomgeving",
  "Rechtsstaat": "Rechtsstaat en democratie",
  "Democratie": "Rechtsstaat en democratie"
};

const DOMAIN_COLORS = {
  "Demografie": "#1B3A6B", "Gezondheid": "#2E86C1", "Geopolitiek": "#6FCF97",
  "Veiligheid": "#8A9A2A", "Economie": "#2E8B57", "Arbeidsmarkt": "#1B5E3A",
  "Technologie": "#6B4226", "Kunstmatige intelligentie": "#F5C518",
  "Kansengelijkheid": "#F2A93B", "Sociale cohesie": "#E8730D", "Klimaat": "#D6412F",
  "Energie": "#F291B5", "Fysieke leefomgeving": "#C2186D", "Rechtsstaat": "#D6146E",
  "Democratie": "#3B1F6B"
};

const STATUS_COLORS = {
  "Onderzoekt": "#3B82F6",
  "Pilot": "#F59E0B",
  "Opgeschaald": "#22C55E",
  "Gestopt": "#EF4444",
  "Niet opgepakt": "#9CA3AF"
};

const INTERESSES = DOMAINS.slice();
```

- [ ] **Step 2: Replace `const PROJECTS = [...]` with `const TECHNOLOGIEEN = [...]` and `const EXPLORATIES = [...]`**

Delete the entire original `PROJECTS` array (127 entries). In its place, write:

```javascript
const TECHNOLOGIEEN = [
  // one object per entry from docs/superpowers/plans/2026-07-03-seed-data.json → technologieen,
  // in this exact shape:
  // { id, naam, domein, korteBeschrijving, trl, labels }
];

const EXPLORATIES = [
  // one object per entry from docs/superpowers/plans/2026-07-03-seed-data.json → exploraties,
  // in this exact shape:
  // { id, technologieId, org, typeOrganisatie, status, jaar, samenvatting, uitkomst, bron, team }
  // (no `funnel` field on seed data — only user-created explorations get one, see Task 9)
];
```

Populate both arrays with the actual content from `docs/superpowers/plans/2026-07-03-seed-data.json` (Task 2's output) — copy every field as researched, do not abbreviate or invent additional entries.

- [ ] **Step 3: Replace `const PEOPLE = [...]` with `const TEAMS = [...]`**

Keep the same object shape as the original's `PEOPLE` (`id, naam, rol, org, afdeling, expertise, betrokkenBij, kleur, email?`), but generate one team entry per unique `org` value found in `EXPLORATIES`, with `betrokkenBij` listing the technology names that org explores and `expertise` set to that org's `typeOrganisatie` plus the relevant `domein` values. Example shape:

```javascript
const TEAMS = [
  { id: "team-org-slug", naam: "Projectteam <Org>", rol: "Exploratieteam", org: "<Org>", afdeling: "-", expertise: ["<domein 1>", "<domein 2>"], betrokkenBij: "<Technologie A>, <Technologie B>", kleur: "#..." }
  // one per unique org in EXPLORATIES
];
```

- [ ] **Step 4: Update `USER` object**

Find the original `const USER = {...}` block and update `naam`, `org`, `rol`, `afdeling`, `expertise`, `interesses` to reflect a demo Exploratie Hub user (keep all other fields — `email`, `tel`, `linkedin`, `initialen`, `voornaam` — in the same shape):

```javascript
const USER = {
  voornaam: "Sam", naam: "Sam de Vries", initialen: "SV",
  org: "Ministerie van Binnenlandse Zaken en Koninkrijksrelaties",
  rol: "Beleidsadviseur digitalisering", afdeling: "Directie Digitale Overheid",
  expertise: "Technologie-exploratie", email: "sam.devries@voorbeeld.overheid.nl",
  tel: "06-00000000", linkedin: "linkedin.com/in/samdevries",
  interesses: ["Kunstmatige intelligentie", "Klimaat"]
};
```

- [ ] **Step 5: Verify the file is syntactically valid**

Run: `node --check js/data.js`
Expected: no output, exit code 0.

- [ ] **Step 6: Commit**

```bash
git add js/data.js
git commit -m "Replace innovatie-project data model with Technologie/Exploratie schema"
```

---

### Task 4: Update routing table and sidebar nav

**Files:**
- Modify: `js/app.js` — function `route()`, the `routes` object, and function `shell()`

**Interfaces:**
- Consumes: `TECHNOLOGIEEN`, `EXPLORATIES` (Task 3)
- Produces: routes `login, onboarding, home, technologieen, technologie, mijn-exploraties, nieuwe-exploratie, netwerk, account`, each mapped to a `render*` function name used by later tasks.

- [ ] **Step 1: Rename the routes object**

Locate the block starting `const routes = {` (originally listing `login/onboarding/home/innovaties/project/mijn-projecten/nieuw-project/netwerk/account`). Replace it with:

```javascript
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
```

(The `route()` function itself, which reads `location.hash` and dispatches via `routes[page]`, needs no changes — it already passes `param` through for dynamic segments like `#/technologie/<id>`.)

- [ ] **Step 2: Rename the sidebar nav items in `shell()`**

Locate `function shell(active, content) {` and replace the `items` array:

```javascript
    const items = [
      ["home", I.home, "Home"],
      ["technologieen", I.bulb, "Technologieën"],
      ["mijn-exploraties", I.folder, "Mijn exploraties"],
      ["netwerk", I.globe, "Netwerk"]
    ];
```

Also replace `<div class="brand">Innovatie Hub</div>` with `<div class="brand">Exploratie Hub</div>` in the same function's template literal.

- [ ] **Step 3: Update the login page branding**

In `renderLogin()`, replace `<h1>Innovatie Hub</h1>` with `<h1>Exploratie Hub</h1>` and the footer line `© 2026 Digicampus — demo met projectdata van digitaleoverheid.nl` with `© 2026 — demo met representatieve technologie-exploratiedata (handmatig samengesteld)`.

- [ ] **Step 4: Rename the `store` localStorage prefix**

Locate the `store` object (near the top of `js/app.js`, the object with `get(k, fb)` / `set(k, v)` methods using `"ihub:" + k`). Replace both occurrences of `"ihub:"` with `"ehub:"`.

- [ ] **Step 5: Verify routing and nav render**

```bash
python3 -m http.server 8000 &
sleep 1
```

Open `http://localhost:8000/#/login`, log in with any input, and confirm: the sidebar shows "Home / Technologieën / Mijn exploraties / Netwerk" and the account/settings items at the bottom, the brand reads "Exploratie Hub". Views will still error at this point (Task 5+ implement them) — that's expected; only the shell/nav/branding is being verified here. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add js/app.js
git commit -m "Update routing table, sidebar nav, and branding for Exploratie Hub"
```

---

### Task 5: Trendroos wheel + accessible domain list on Home

**Files:**
- Modify: `js/app.js` — replace function `pieSvg` with `trendroosWheel`, add function `domainListHtml`, rewrite function `renderHome`

**Interfaces:**
- Consumes: `TECHNOLOGIEEN`, `EXPLORATIES`, `DOMAINS`, `DOMAIN_CLUSTERS`, `DOMAIN_COLORS`, `STATUS_COLORS`, `USER`, `interests()`, `esc()`, `shell()`, helper `cardHtml` (adapted in Task 6 — Home only needs the recommendation row, which Task 6 makes available)
- Produces: `trendroosWheel(counts)` — takes `{domein: count}` and returns wheel SVG markup; `domainListHtml(counts, onClickAttr)` — returns the accessible chip-list markup grouped by cluster.

- [ ] **Step 1: Replace `pieSvg` with `trendroosWheel`**

Locate `function pieSvg(data) {` (originally ~40 lines, single-ring pie for theme counts) and replace the entire function with:

```javascript
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
```

- [ ] **Step 2: Rewrite `renderHome`**

Locate `function renderHome() {` (originally ~70 lines, ending right before `function cardHtml`) and replace the entire function with:

```javascript
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
```

- [ ] **Step 3: Add CSS for the new elements**

Append to `css/style.css`:

```css
.domain-list { margin-top: 18px; }
.domain-cluster { margin-bottom: 12px; }
.domain-cluster-title { font-size: 11.5px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: .02em; }
.domain-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.domain-chip { border: none; border-radius: 14px; color: #fff; font-size: 12px; padding: 5px 11px; cursor: pointer; opacity: .85; }
.domain-chip:hover, .domain-chip.active { opacity: 1; outline: 2px solid #1a1f26; outline-offset: 1px; }
.domain-chip:focus-visible { outline: 2px solid #1a1f26; outline-offset: 1px; }
```

- [ ] **Step 4: Verify Home renders (partial — `technologieCardHtml` doesn't exist yet)**

This step will show a JS error in the console (`technologieCardHtml is not defined`) until Task 6 is done — that's expected and acceptable since Task 6 immediately follows. Verify only that the wheel/filter markup itself is correct by temporarily commenting out the `.hscroll` line, loading `http://localhost:8000/#/home`, and confirming: the wheel renders with 15 colored domain segments + 7 semi-transparent cluster arcs, the domain chip list appears grouped by cluster below it, and changing the org/status/jaar filters updates both the wheel numbers and the chip counts. Then uncomment the `.hscroll` line before committing (leaving the expected error for Task 6 to resolve).

- [ ] **Step 5: Commit**

```bash
git add js/app.js css/style.css
git commit -m "Add Trendroos wheel + accessible domain list to Home"
```

---

### Task 6: Technologieën browse view

**Files:**
- Modify: `js/app.js` — replace function `cardHtml` with `technologieCardHtml`, rewrite function `renderInnovaties` as `renderTechnologieen`

**Interfaces:**
- Consumes: `TECHNOLOGIEEN`, `EXPLORATIES`, `DOMAINS`, `DOMAIN_COLORS`, `STATUS_COLORS`
- Produces: `technologieCardHtml(t)` — used by Task 5 (Home) and Task 8 (Mijn exploraties' "vergelijkbare technologieën").

- [ ] **Step 1: Replace `cardHtml` with `technologieCardHtml`**

Locate `function cardHtml(p, opts = {}) {` (originally ~15 lines) and replace it with:

```javascript
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
```

- [ ] **Step 2: Rewrite `renderInnovaties` as `renderTechnologieen`**

Locate `function renderInnovaties() {` (originally ~90 lines, ending right before `function renderProject`) and replace the entire function (rename it `renderTechnologieen`) with:

```javascript
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
```

- [ ] **Step 3: Wire the `?domein=` query param from Home's chip clicks**

The `route()` function only splits `page/param` on `/`, not `?`. Locate `function route() {` and change the dispatch line `fn(param);` to parse a trailing query string first:

```javascript
    const [pagePart, query] = raw.split("?");
    const [page2, param] = pagePart.split("/");
    // ...use page2/param in place of the original page/param throughout this function...
```

Concretely: rename the existing `const [page, param] = raw.split("/");` line to instead read:

```javascript
    const [pagePart, queryStr] = raw.split("?");
    const [page, param] = pagePart.split("/");
    const domeinParam = queryStr ? new URLSearchParams(queryStr).get("domein") : null;
```

and change the final dispatch line from `fn(param);` to `fn(param, domeinParam);`. This makes `domeinParam` available as `renderTechnologieen`'s second argument, matching the signature defined in Step 2.

- [ ] **Step 4: Verify**

```bash
python3 -m http.server 8000 &
sleep 1
```

Open `http://localhost:8000/#/home`, click a domain chip — confirm it navigates to `#/technologieen?domein=<naam>` and the Technologieën page opens pre-filtered to that domain. Then clear the filter, try search, TRL sort, and grid/list toggle. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add js/app.js
git commit -m "Add Technologieën browse view with domain/org/status/jaar filters"
```

---

### Task 7: Technologie-detail view

**Files:**
- Modify: `js/app.js` — replace function `renderProject` with `renderTechnologieDetail`

**Interfaces:**
- Consumes: `TECHNOLOGIEEN`, `EXPLORATIES`, `DOMAIN_COLORS`, `STATUS_COLORS`, `technologieCardHtml`, `esc`
- Produces: route `#/technologie/:id`, function `renderTechnologieDetail(id)`.

- [ ] **Step 1: Write `renderTechnologieDetail`**

Locate `function renderProject(id) {` (originally the project-detail view with tabs) and replace the entire function with:

```javascript
  function renderTechnologieDetail(id) {
    const t = TECHNOLOGIEEN.find(x => x.id === id);
    if (!t) { location.hash = "#/technologieen"; return; }
    const expls = EXPLORATIES.filter(e => e.technologieId === t.id);
    const similar = TECHNOLOGIEEN.filter(x => x.id !== t.id && (x.domein === t.domein || x.labels.some(l => t.labels.includes(l)))).slice(0, 4);

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
```

- [ ] **Step 2: Add minimal `.tabs` CSS if not already present in the forked stylesheet**

Run: `grep -c '\.tabs' css/style.css`. If the count is `0`, append:

```css
.tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); margin: 18px 0 14px; }
.tabs button { background: none; border: none; padding: 8px 14px; font-size: 13px; cursor: pointer; border-bottom: 2px solid transparent; }
.tabs button.active { border-bottom-color: #1a1f26; font-weight: 600; }
```

- [ ] **Step 3: Verify**

```bash
python3 -m http.server 8000 &
sleep 1
```

Open `http://localhost:8000/#/technologieen`, click a card, confirm the detail page loads with TRL/domain/exploration count, the "Wie onderzoekt dit" tab lists real orgs with status/uitkomst/bron link, and "Soortgelijke technologieën" switches to related cards that are themselves clickable. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add js/app.js css/style.css
git commit -m "Add Technologie-detail view with orgs and similar-technology tabs"
```

---

### Task 8: Mijn exploraties list view

**Files:**
- Modify: `js/app.js` — replace function `renderMijnProjecten` with `renderMijnExploraties`

**Interfaces:**
- Consumes: `store`, `EXPLORATIES`, `TECHNOLOGIEEN`, `STATUS_COLORS`
- Produces: function `allExploraties()` returning `EXPLORATIES.concat(store.get("extraExploraties", []))`; function `renderMijnExploraties()`.

- [ ] **Step 1: Replace `allProjects` with `allExploraties`**

Locate `function allProjects() { return PROJECTS.concat(store.get("extraProjects", [])); }` and replace it with:

```javascript
  function allExploraties() { return EXPLORATIES.concat(store.get("extraExploraties", [])); }
```

Every later reference to `EXPLORATIES` in Tasks 5-7's code that should also include user-added ones must call `allExploraties()` instead — update the following call sites accordingly (search-and-replace `EXPLORATIES.filter` → `allExploraties().filter` and `EXPLORATIES.map` → `allExploraties().map` throughout `js/app.js`, in `renderHome`, `techStats`, `renderTechnologieen`, `renderTechnologieDetail`).

- [ ] **Step 2: Replace `renderMijnProjecten` with `renderMijnExploraties`**

Locate `function renderMijnProjecten() {` (originally ~40 lines) and replace it with:

```javascript
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
            const t = TECHNOLOGIEEN.find(x => x.id === e.technologieId);
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
```

- [ ] **Step 3: Verify**

```bash
python3 -m http.server 8000 &
sleep 1
```

Open `http://localhost:8000/#/mijn-exploraties` — confirm it renders with empty tabs (0 counts, since no user explorations exist yet) and an "empty" message per tab. The "Nieuwe exploratie" button will 404/error until Task 9 — that's expected. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add js/app.js
git commit -m "Add Mijn exploraties list view with status tabs and funnel progress badge"
```

---

### Task 9: Wizard shell + Fase 0 + Fase 1

**Files:**
- Modify: `js/app.js` — replace function `renderNieuwProject` with `renderNieuweExploratie` and a shared wizard-shell helper

**Interfaces:**
- Consumes: `store`, `allExploraties`, `TECHNOLOGIEEN`, `technologieCardHtml`, `bindTechCards`, `esc`
- Produces: function `wizardShell(exploratie, faseIndex, bodyHtml, onNext)` (shared across Tasks 9-11); function `renderNieuweExploratie(param)`; empty-funnel factory `emptyFunnel()`; `allTechnologieen()` (returns `TECHNOLOGIEEN.concat(store.get("extraTechnologieen", []))`, replaces direct `TECHNOLOGIEEN` reads app-wide from this task on) and `saveNieuweTechnologie(t)`.

- [ ] **Step 1: Define the funnel data shape and empty-funnel factory**

Add this near the top of `js/app.js`, next to the `store` object:

```javascript
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
```

- [ ] **Step 2: Write the shared wizard shell**

```javascript
  function wizardShell(expl, bodyHtml, checklistItems, onSaveAndNext, isLastFase) {
    const fase = expl.funnel.huidigeFase;
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
          ${checklistItems.map(([key, label]) => `<label><input type="checkbox" data-check="${esc(key)}"> ${esc(label)}</label>`).join("<br>")}
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
    document.getElementById("wizardNext").onclick = () => onSaveAndNext();
  }
```

- [ ] **Step 3: Replace direct `TECHNOLOGIEEN` reads with `allTechnologieen()` in earlier tasks' functions**

So that a technology created inline during the wizard (Step 4 below) immediately shows up everywhere. In `js/app.js`, replace `TECHNOLOGIEEN` with `allTechnologieen()` in the bodies of: `renderHome` (Task 5), `techStats` and `renderTechnologieen` (Task 6), `renderTechnologieDetail` (Task 7), and `renderMijnExploraties` and `funnelBadge`'s caller (Task 8 — the `TECHNOLOGIEEN.find(x => x.id === e.technologieId)` lookup used to display each exploration's technology name). Do not rename the constant declaration itself (`const TECHNOLOGIEEN = [...]` in `js/data.js` stays as the seed-only array) — only the *usages* inside these five functions change from `TECHNOLOGIEEN` to `allTechnologieen()`.

- [ ] **Step 4: Write `renderNieuweExploratie` (entry point + Fase 0 + Fase 1)**

```javascript
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
```

Note: `location.reload()` after each `location.hash` assignment is used because the hash is unchanged when moving between fases of the *same* exploratie (`#/nieuwe-exploratie/<id>` stays the same string), so the router's `hashchange` listener won't fire on its own — a full reload re-runs `route()` and picks up the new `huidigeFase`. This matches the original's simplicity (no SPA-style manual re-render dispatch existed in the source app either).

- [ ] **Step 5: Add wizard CSS**

Append to `css/style.css`:

```css
.wizard-steps { display: flex; gap: 6px; margin-bottom: 18px; flex-wrap: wrap; }
.wizard-step { flex: 1; min-width: 110px; font-size: 11px; text-align: center; padding: 8px 4px; border-radius: 8px; background: #f1f1f1; color: var(--text-muted); }
.wizard-step.active { background: #1a1f26; color: #fff; font-weight: 600; }
.wizard-step.done { background: #d7f5df; color: #1b5e3a; }
.wizard-checklist, .wizard-parkeerbord { margin-top: 18px; padding-top: 14px; border-top: 1px solid var(--border); }
.wizard-checklist label { display: block; font-size: 13px; margin-bottom: 6px; }
```

- [ ] **Step 6: Verify Fase 0 → Fase 1 flow, including technologie-koppeling**

```bash
python3 -m http.server 8000 &
sleep 1
```

Open `http://localhost:8000/#/mijn-exploraties`, click "Nieuwe exploratie" — confirm a new exploration is created and Fase 0 renders with the 4 text fields + checklist + parkeerbord + technologie-select. Type a trend name matching an existing seed technology's `korteBeschrijving` keyword and confirm the "vergelijkbare technologieën" box updates live. Select that existing technology from the `w-tech-select` dropdown, fill the other fields, check all checklist boxes, click "Opslaan en naar volgende fase" — confirm Fase 1 renders next with the same exploration id in the URL, and check in devtools that `localStorage.getItem("ehub:extraExploraties")` shows a non-empty `technologieId` matching the selected technology.

Repeat with a second new exploration: this time choose "+ Nieuwe technologie aanmaken", confirm the naam/domein/TRL fields appear, fill them, save, and confirm `localStorage.getItem("ehub:extraTechnologieen")` now contains the new technology, and that it immediately appears in `#/technologieen` and on the Home wheel count for its domain (proves `allTechnologieen()` wiring from Step 3). Stop the server.

- [ ] **Step 7: Commit**

```bash
git add js/app.js css/style.css
git commit -m "Add Novum-funnel wizard shell with Fase 0 (trend kiezen, incl. technologie-koppeling) and Fase 1 (focus kiezen)"
```

---

### Task 10: Wizard Fase 2 + Fase 3

**Files:**
- Modify: `js/app.js` — add functions `renderFase2`, `renderFase3`; extend the dispatch in `renderNieuweExploratie` (already wired in Task 9, Step 3)

**Interfaces:**
- Consumes: `wizardShell`, `saveExploratie`, `emptyFunnel` shape (Task 9)
- Produces: `renderFase2(expl)`, `renderFase3(expl)`.

- [ ] **Step 1: Write `renderFase2`**

```javascript
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
```

- [ ] **Step 2: Write `renderFase3`**

```javascript
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
```

- [ ] **Step 3: Verify Fase 2 → Fase 3 → Fase 4 handoff**

```bash
python3 -m http.server 8000 &
sleep 1
```

Continue the exploration created in Task 9's verification (or create a new one): step through Fase 2 (fill fields, confirm textarea round-trips on reload), then Fase 3 (fill meerwaarde fields, pick a vervolgstatus, e.g. "Pilot"), click through to Fase 4. Confirm `#/mijn-exploraties` now shows this exploration with the "Pilot" status color and a "Fase 4 van 5" badge (Task 8's `funnelBadge`). Stop the server.

- [ ] **Step 4: Commit**

```bash
git add js/app.js
git commit -m "Add wizard Fase 2 (informatie verzamelen) and Fase 3 (waarde bepalen)"
```

---

### Task 11: Wizard Fase 4 + afronden

**Files:**
- Modify: `js/app.js` — add function `renderFase4`

**Interfaces:**
- Consumes: `wizardShell`, `saveExploratie` (Task 9)
- Produces: `renderFase4(expl)`; sets `expl.funnel.huidigeFase = 5` on completion (used by `funnelBadge` in Task 8 to show "Funnel afgerond").

- [ ] **Step 1: Write `renderFase4`**

```javascript
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
```

- [ ] **Step 2: Verify full 5-fase flow end to end**

```bash
python3 -m http.server 8000 &
sleep 1
```

Complete Fase 4 for the exploration used in Tasks 9-10's verification. Confirm clicking "Exploratie afronden" shows a toast and returns to `#/mijn-exploraties`, where the card now shows "Funnel afgerond" instead of a fase number. Reload the page and confirm the exploration and its full funnel content persisted (check via `localStorage.getItem("ehub:extraExploraties")` in the browser console — should contain the completed funnel object). Stop the server.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "Add wizard Fase 4 (delen en inspireren) and completion handling"
```

---

### Task 12: Netwerk view adaptation

**Files:**
- Modify: `js/app.js` — update `renderNetwerk` to use `TEAMS` instead of `PEOPLE`

**Interfaces:**
- Consumes: `TEAMS` (Task 3), `esc`, `initials`
- Produces: `renderNetwerk()` unchanged in shape, new data source.

- [ ] **Step 1: Update `renderNetwerk`**

Locate `function renderNetwerk() {` and make two changes: replace every reference to `PEOPLE` with `TEAMS`, and update the page copy. The full function becomes:

```javascript
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
```

(`netState` already exists from the original — no change needed there.)

- [ ] **Step 2: Verify**

```bash
python3 -m http.server 8000 &
sleep 1
```

Open `http://localhost:8000/#/netwerk`, confirm it lists one card per organization from the seed data with expertise chips and "Betrokken bij" text, and that search filters correctly. Stop the server.

- [ ] **Step 3: Commit**

```bash
git add js/app.js
git commit -m "Adapt Netwerk view to Exploratie Hub teams data"
```

---

### Task 13: Account view — domain interests

**Files:**
- Modify: `js/app.js` — update `renderAccount`'s interests section (originally used `THEMES`, now uses `DOMAINS`)

**Interfaces:**
- Consumes: `DOMAINS`, `interests()`, `store`
- Produces: unchanged function name `renderAccount()`.

- [ ] **Step 1: Locate and update the interests-editing block**

Locate `function renderAccount() {`. The original renders account info plus (further down, truncated in earlier inspection but following the same `renderChips`-based pattern used at onboarding) an interests-chips editor calling the existing `renderChips` helper with `THEMES`. Change every `THEMES` reference inside `renderAccount` to `DOMAINS`, and every reference to `interests()`/`store.set("interests", ...)` stays as-is (already generic). Concretely, find the line that calls `renderChips(THEMES, sel, ...)` (or equivalent) inside `renderAccount` and change `THEMES` to `DOMAINS`.

- [ ] **Step 2: Update `renderOnboarding` the same way**

Locate `function renderOnboarding() {` — it uses the same `renderChips(THEMES, ...)` pattern for first-time interest selection. Change `THEMES` to `DOMAINS` there too.

- [ ] **Step 3: Verify**

```bash
python3 -m http.server 8000 &
sleep 1
```

Open `http://localhost:8000/#/account`, confirm the interests editor shows the 15 Trendroos domain names (not the old 6 NDS themes), and toggling one persists (reload the page, confirm selection sticks). Also check `#/onboarding` (log out first via clearing `sessionStorage` in devtools, or open in a private window) shows the same 15 domains. Stop the server.

- [ ] **Step 4: Commit**

```bash
git add js/app.js
git commit -m "Use Trendroos domains for account and onboarding interests"
```

---

### Task 14: Full manual QA pass + README

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: nothing (final verification task)
- Produces: nothing consumed by other tasks — this is the last task.

- [ ] **Step 1: Write `README.md`**

```markdown
# Exploratie Hub — MVP (demo)

Werkende demo van een **Exploratie Hub**: één plek om te zien welke nieuwe
technologieën binnen de Nederlandse digitale overheid onderzocht worden, wie
dat doet, wat de uitkomsten zijn, en hoe volwassen elke technologie is.

Gebaseerd op het MVP-patroon van [Innovatie Hub](https://github.com/TjebbeHB/innovatie-hub-mvp),
met twee aanvullingen:

- **Trendroos-taxonomie** (Rijksbrede Trendverkenning, mei 2026) voor de
  domein-indeling en het wiel op de homepage.
- **Novum Trendexploratie-methode** (5-fase funnel) als wizard voor het
  toevoegen van eigen exploraties.

Data is representatief en handmatig samengesteld (zie
`docs/superpowers/plans/2026-07-03-seed-data.json` voor bronnen), geen live
koppeling.

## Lokaal draaien

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Structuur

```
index.html      — app-schil
css/style.css   — styling
js/data.js      — domeinen, technologieën, exploraties, teams
js/app.js       — routing, views, wizard-logica
```

Alles draait client-side, geen build-stap, geen backend. Eigen exploraties
worden lokaal in de browser bewaard (`localStorage`, prefix `ehub:`).
```

- [ ] **Step 2: Full click-through QA checklist**

```bash
python3 -m http.server 8000 &
sleep 1
```

Walk through, in order, and confirm each works without a console error (check via browser devtools):

- [ ] `#/login` → log in with any input → redirects to `#/home`
- [ ] `#/home` → wheel renders, chip list renders below it, filters (org/status/jaar) update both, clicking a chip navigates to filtered `#/technologieen`
- [ ] `#/technologieen` → search, domain/org/status/jaar filters, TRL/naam/orgs sort, grid/list toggle all work
- [ ] Click a technology card → `#/technologie/:id` → both tabs render real data, "soortgelijke technologieën" cards are clickable
- [ ] `#/mijn-exploraties` → empty state initially, tabs show correct counts
- [ ] Create a new exploration, complete all 5 fases, confirm it appears in `#/mijn-exploraties` with "Funnel afgerond" and the chosen status
- [ ] `#/netwerk` → search works, cards show real seed-data organizations
- [ ] `#/account` → interests editor shows 15 domains, selection persists across reload
- [ ] Resize the browser to a narrow (mobile) width and confirm the sidebar/wheel/wizard don't overflow horizontally

- [ ] **Step 3: Fix any issues found during QA**

If any step fails, fix the specific function responsible (identified by which view broke) and re-run the full checklist from Step 2 before proceeding.

- [ ] **Step 4: Final commit**

```bash
git add README.md
git commit -m "Add README and complete manual QA pass"
```
