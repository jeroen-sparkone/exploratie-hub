# Kompas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "kompas" (priority-framework) classification to every `Exploratie` — a strategic stance (pursue / not now / doesn't fit / not relevant / doing together with / building on another org) that sits alongside the existing process `status`, visible as a badge per organisation and a summary bar per technology.

**Architecture:** Extends the existing static HTML/CSS/JS app (Exploratie Hub) — no new files, no build step, no backend. New constants and a `kompas` field in `js/data.js`; new render helpers and edit UI in `js/app.js`; new CSS rules appended to `css/style.css`.

**Tech Stack:** Plain HTML/CSS/JS (unchanged from the rest of the app).

## Global Constraints

- No framework, no build step, no npm dependencies (matches the rest of the app).
- No automated test suite exists or should exist for this project — verification is manual (`python3 -m http.server` + browser), exactly as the rest of the app.
- Later tasks locate code in `js/app.js` by function name, not line number, since earlier tasks in this plan shift line numbers.
- `kompas` requires an existing `Exploratie` — there is no way to set a kompas position without one.
- Exactly one kompas position per `Exploratie` (no combinations).
- `gekoppeldeOrgs` is only meaningful for `positie: "samen"` or `positie: "doorgaan"` — always `[]` for the other 4 positions.
- Text color on every kompas badge/segment must meet WCAG AA (≥4.5:1) against its background color — the exact color pairs below are pre-verified via the WCAG relative-luminance formula; do not substitute different colors without re-verifying.
- Seed-data `Exploratie` records (the 44 in `EXPLORATIES`) never get a `mine: true` or `funnel` field (existing constraint) — this plan only adds `kompas` to them, nothing else.

---

## File Structure

```
js/data.js      — add KOMPAS_LABELS, KOMPAS_COLORS, KOMPAS_TEXT_COLORS constants; add `kompas` field to all 44 EXPLORATIES entries
js/app.js       — add kompasBadgeHtml(), kompasSummaryHtml(), kompasEditHtml(), saveKompas(); wire into renderMijnExploraties and renderTechnologieDetail; add kompas:null to new-exploration object in renderNieuweExploratie
css/style.css   — new .kompas-* rules
```

---

### Task 1: Kompas constants + seed-data retrofit

**Files:**
- Modify: `js/data.js` — add constants near `STATUS_COLORS`, add `kompas` field to every entry in `EXPLORATIES`

**Interfaces:**
- Produces: `KOMPAS_LABELS` (object: position key → Dutch label), `KOMPAS_COLORS` (object: position key → hex background), `KOMPAS_TEXT_COLORS` (object: position key → hex text color, pre-verified ≥4.5:1 against `KOMPAS_COLORS`) — all consumed by `js/app.js` in Tasks 2-3. Every `EXPLORATIES[n].kompas` is either `null` or `{ positie, gekoppeldeOrgs }`.

- [ ] **Step 1: Add the three kompas constants**

Locate the `STATUS_COLORS` block in `js/data.js` (added by an earlier plan) and add immediately after it:

```javascript
const KOMPAS_LABELS = {
  wel: "Wel doen",
  nogniet: "Nog niet",
  pastniet: "Past niet bij ons",
  nietrelevant: "Niet relevant",
  samen: "Samen doen met",
  doorgaan: "Doorgaan op resultaten van"
};

const KOMPAS_COLORS = {
  wel: "#147638",
  nogniet: "#9F6607",
  pastniet: "#6D727A",
  nietrelevant: "#9CA3AF",
  samen: "#3730A3",
  doorgaan: "#7C3AED"
};

// Tekstkleur per positie voor voldoende contrast (WCAG AA, ≥4.5:1) op KOMPAS_COLORS-achtergrond
const KOMPAS_TEXT_COLORS = {
  wel: "#fff",
  nogniet: "#fff",
  pastniet: "#fff",
  nietrelevant: "#1a1f26",
  samen: "#fff",
  doorgaan: "#fff"
};
```

- [ ] **Step 2: Add `kompas` to every `EXPLORATIES` entry, derived from `status`**

For every one of the 44 entries in the `EXPLORATIES` array, add a `kompas` field using this exact status → position lookup:

| `status` value | `kompas.positie` |
|---|---|
| `"Opgeschaald"` | `"wel"` |
| `"Pilot"` | `"wel"` |
| `"Onderzoekt"` | `"wel"` |
| `"Gestopt"` | `"pastniet"` |
| `"Niet opgepakt"` | `"nogniet"` |

So a typical entry gets `kompas: { positie: "wel", gekoppeldeOrgs: [] }` (or `"pastniet"`/`"nogniet"` per its status), added as a new field on the object (position it right after the existing `status` field for readability, but exact placement doesn't matter functionally).

**Exception — these exact 4 entries get a different, hand-picked `kompas` value instead of the table above** (real relational examples, chosen because they explore the same technology in a plausible sequence):

1. `id: "iot-zuidholland-samenmeten"` (Provincie Zuid-Holland, 2019, technologie `sensornetwerken-iot-omgevingsmonitoring`) — builds on RIVM's earlier (2016) national "Samen Meten" sensor platform (`iot-rivm-samenmeten`):
   ```javascript
   kompas: { positie: "doorgaan", gekoppeldeOrgs: ["RIVM"] }
   ```

2. `id: "genai-breda-copilot"` (Gemeente Breda, 2025, technologie `generatieve-ai-overheidsdienstverlening`) — builds on Gemeente Goes's earlier (2024) scaled chatbot "Guus" (`genai-goes-chatbot-guus`):
   ```javascript
   kompas: { positie: "doorgaan", gekoppeldeOrgs: ["Gemeente Goes"] }
   ```

3. `id: "xai-utrecht-rekenkamer-algoritmes"` (Gemeente Utrecht, 2025, technologie `uitlegbare-ai-besluitondersteuning`) — its governance audit draws on SVB's earlier (2024) scaled XAI work (`xai-svb-preventie-handhaving`):
   ```javascript
   kompas: { positie: "doorgaan", gekoppeldeOrgs: ["Sociale Verzekeringsbank (SVB)"] }
   ```

4. `id: "pqc-ncsc-handreiking"` (Nationaal Cyber Security Centrum (NCSC), 2026, technologie `post-quantum-cryptografie`) — natural collaboration between the two national security bodies both still researching PQC (AIVD's `pqc-aivd-handboek`):
   ```javascript
   kompas: { positie: "samen", gekoppeldeOrgs: ["AIVD"] }
   ```

All other 40 entries get `gekoppeldeOrgs: []` per the table in this step.

- [ ] **Step 3: Verify**

Run: `node --check js/data.js`
Expected: no output, exit code 0.

Run: `node -e "
const fs = require('fs');
new Function(fs.readFileSync('js/data.js','utf8') + '; global.__E = EXPLORATIES; global.__K = KOMPAS_LABELS;')();
console.log('total:', global.__E.length);
console.log('with kompas:', global.__E.filter(e => e.kompas).length);
console.log('positions used:', [...new Set(global.__E.map(e => e.kompas && e.kompas.positie))]);
console.log('relational (samen/doorgaan):', global.__E.filter(e => e.kompas && (e.kompas.positie==='samen'||e.kompas.positie==='doorgaan')).map(e => e.id + ' -> ' + e.kompas.gekoppeldeOrgs.join(',')));
"`

Expected output: `total: 44`, `with kompas: 44`, `positions used:` an array containing exactly `wel`, `pastniet`, `nogniet`, `doorgaan`, `samen` (order may vary), and the `relational` line listing exactly the 4 ids from Step 2 with their correct `gekoppeldeOrgs`.

- [ ] **Step 4: Commit**

```bash
git add js/data.js
git commit -m "Add kompas constants and retrofit kompas position onto all 44 seed explorations"
```

---

### Task 2: Kompas badge + edit control on Mijn Exploraties

**Files:**
- Modify: `js/app.js` — add `kompasBadgeHtml`, `kompasEditHtml`, `saveKompas`; modify `renderMijnExploraties`; modify the new-exploration object literal in `renderNieuweExploratie`

**Interfaces:**
- Consumes: `KOMPAS_LABELS`, `KOMPAS_COLORS`, `KOMPAS_TEXT_COLORS` (Task 1), `allExploraties`, `saveExploratie`, `esc`
- Produces: `kompasBadgeHtml(e)` (used by Task 3 too), `kompasEditHtml(e, allExpls)`, `saveKompas(id, positie, gekoppeldeOrgs)`.

- [ ] **Step 1: Add `kompasBadgeHtml`, `kompasEditHtml`, and `saveKompas`**

Locate `function funnelBadge(e) {` in `js/app.js` and add these three functions immediately after it:

```javascript
  function kompasBadgeHtml(e) {
    if (!e.kompas) return "";
    const label = KOMPAS_LABELS[e.kompas.positie];
    const isRelational = e.kompas.positie === "samen" || e.kompas.positie === "doorgaan";
    const suffix = isRelational && e.kompas.gekoppeldeOrgs.length ? ": " + e.kompas.gekoppeldeOrgs.join(", ") : "";
    return `<span class="kompas-badge" style="background:${KOMPAS_COLORS[e.kompas.positie]};color:${KOMPAS_TEXT_COLORS[e.kompas.positie]}">${esc(label + suffix)}</span>`;
  }

  function saveKompas(id, positie, gekoppeldeOrgs) {
    const e = allExploraties().find(x => x.id === id);
    if (!e) return;
    e.kompas = positie ? { positie, gekoppeldeOrgs: (positie === "samen" || positie === "doorgaan") ? gekoppeldeOrgs : [] } : null;
    saveExploratie(e);
  }

  function kompasEditHtml(e, allExpls) {
    const others = [...new Set(allExpls.filter(o => o.technologieId === e.technologieId && o.org !== e.org).map(o => o.org))];
    const cur = e.kompas ? e.kompas.positie : "";
    const curOrgs = e.kompas ? e.kompas.gekoppeldeOrgs : [];
    const options = [["", "— Kies kompaspositie —"], ["wel", "Wel doen"], ["nogniet", "Nog niet"], ["pastniet", "Past niet bij ons"], ["nietrelevant", "Niet relevant"]];
    if (others.length) {
      options.push(["samen", "Samen doen met"]);
      options.push(["doorgaan", "Doorgaan op resultaten van"]);
    }
    return `
      <div class="kompas-edit" data-exploratie-id="${esc(e.id)}">
        <div class="select-wrap"><select class="kompas-select">${options.map(([v, l]) => `<option value="${esc(v)}"${cur === v ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></div>
        ${others.length ? `<div class="kompas-orgs" style="display:${cur === "samen" || cur === "doorgaan" ? "block" : "none"}">
          ${others.map(o => `<label><input type="checkbox" value="${esc(o)}"${curOrgs.includes(o) ? " checked" : ""}> ${esc(o)}</label>`).join("")}
        </div>` : ""}
      </div>`;
  }
```

- [ ] **Step 2: Wire the edit control into `renderMijnExploraties`**

Locate `function renderMijnExploraties() {`. Inside its `update()` function, find this card template (the `document.getElementById("results").innerHTML = list.length ? list.map(e => { ...` block):

```javascript
            const t = allTechnologieen().find(x => x.id === e.technologieId);
            return `<div class="card">
              <h3>${esc(t ? t.naam : e.technologieId)} ${funnelBadge(e)}</h3>
              <div class="org">${esc(e.org)} · <span style="color:${STATUS_COLORS[e.status]}">${esc(e.status)}</span></div>
              <p>${esc(e.samenvatting || "Nog geen samenvatting — werk de exploratie verder uit.")}</p>
              <a href="#/nieuwe-exploratie/${esc(e.id)}">Verder werken ${I.pencil}</a>
            </div>`;
```

Replace it with:

```javascript
            const t = allTechnologieen().find(x => x.id === e.technologieId);
            return `<div class="card">
              <h3>${esc(t ? t.naam : e.technologieId)} ${funnelBadge(e)}</h3>
              <div class="org">${esc(e.org)} · <span style="color:${STATUS_COLORS[e.status]}">${esc(e.status)}</span></div>
              <p>${esc(e.samenvatting || "Nog geen samenvatting — werk de exploratie verder uit.")}</p>
              <div class="kompas-badge-row">${kompasBadgeHtml(e)}</div>
              ${kompasEditHtml(e, allExploraties())}
              <a href="#/nieuwe-exploratie/${esc(e.id)}">Verder werken ${I.pencil}</a>
            </div>`;
```

Then, still inside `update()`, immediately after the `document.getElementById("results").innerHTML = ...` assignment (right before the closing `}` of `update()`), add the event binding:

```javascript
      document.querySelectorAll(".kompas-edit").forEach(container => {
        const id = container.dataset.exploratieId;
        const select = container.querySelector(".kompas-select");
        const orgsDiv = container.querySelector(".kompas-orgs");
        const applyChange = () => {
          const positie = select.value;
          const checked = orgsDiv ? [...orgsDiv.querySelectorAll("input:checked")].map(cb => cb.value) : [];
          saveKompas(id, positie, checked);
          update();
        };
        select.onchange = applyChange;
        if (orgsDiv) orgsDiv.querySelectorAll("input").forEach(cb => { cb.onchange = applyChange; });
      });
```

- [ ] **Step 3: Default `kompas: null` on newly created explorations**

Locate `function renderNieuweExploratie(param) {` and find this object literal:

```javascript
      expl = { id: "expl-" + Date.now(), technologieId: "", org: USER.org, typeOrganisatie: "Rijksoverheid", status: "Onderzoekt", jaar: String(new Date().getFullYear()), samenvatting: "", uitkomst: "", bron: "", team: USER.afdeling, mine: true, funnel: emptyFunnel() };
```

Add `kompas: null` to it:

```javascript
      expl = { id: "expl-" + Date.now(), technologieId: "", org: USER.org, typeOrganisatie: "Rijksoverheid", status: "Onderzoekt", jaar: String(new Date().getFullYear()), samenvatting: "", uitkomst: "", bron: "", team: USER.afdeling, mine: true, funnel: emptyFunnel(), kompas: null };
```

- [ ] **Step 4: Add CSS**

Append to `css/style.css`:

```css
.kompas-badge { display: inline-block; border-radius: 999px; padding: 3px 10px; font-size: 11.5px; font-weight: 600; }
.kompas-badge-row { margin: 8px 0 4px; }
.kompas-edit { margin-top: 8px; }
.kompas-orgs { margin-top: 6px; font-size: 12.5px; }
.kompas-orgs label { display: block; margin-bottom: 4px; }
```

- [ ] **Step 5: Verify**

```bash
python3 -m http.server 8000 &
sleep 1
```

Open `http://localhost:8000/#/mijn-exploraties`, log in, create a new exploration via "Nieuwe exploratie" (fill Fase 0 minimally and select an existing technology so it has a `technologieId`), return to `#/mijn-exploraties`. Confirm the card shows a kompas `<select>` defaulting to "— Kies kompaspositie —". Pick "Wel doen" — confirm a green "Wel doen" badge appears above the select and persists across a page reload (check `localStorage.getItem("ehub:extraExploraties")` shows the `kompas` field). Then pick a technology that has other orgs exploring it (e.g. link your new exploration's `technologieId` to `sensornetwerken-iot-omgevingsmonitoring` by editing it through Fase 0 again, or just verify against one of the 4 seed technologies with multiple orgs), select "Samen doen met", confirm the org checkboxes appear, check one, confirm the badge updates to include the org name. Stop the server.

- [ ] **Step 6: Commit**

```bash
git add js/app.js css/style.css
git commit -m "Add kompas badge and edit control to Mijn exploraties cards"
```

---

### Task 3: Kompas summary bar + badge on Technologie-detail

**Files:**
- Modify: `js/app.js` — add `kompasSummaryHtml`; modify `renderTechnologieDetail`'s `renderOrgsTab`

**Interfaces:**
- Consumes: `KOMPAS_LABELS`, `KOMPAS_COLORS`, `KOMPAS_TEXT_COLORS` (Task 1), `kompasBadgeHtml` (Task 2), `esc`
- Produces: `kompasSummaryHtml(expls)`.

- [ ] **Step 1: Add `kompasSummaryHtml`**

Locate `function kompasEditHtml(e, allExpls) {` (added in Task 2) and add this function immediately after it (before the closing of that section, anywhere at the same nesting level):

```javascript
  function kompasSummaryHtml(expls) {
    const order = ["wel", "nogniet", "pastniet", "nietrelevant", "samen", "doorgaan"];
    const counts = {};
    order.forEach(k => { counts[k] = 0; });
    let unclassified = 0;
    expls.forEach(e => { if (e.kompas) counts[e.kompas.positie]++; else unclassified++; });
    const used = order.filter(k => counts[k] > 0);
    if (!used.length) return unclassified ? `<div class="sub">Nog geen van de ${unclassified} exploraties geclassificeerd op kompaspositie.</div>` : "";
    const segments = used.map(k => `<div class="kompas-segment" style="flex:${counts[k]};background:${KOMPAS_COLORS[k]};color:${KOMPAS_TEXT_COLORS[k]}" title="${esc(KOMPAS_LABELS[k])}: ${counts[k]}">${counts[k]}</div>`).join("");
    const legend = used.map(k => `<span><span class="kompas-dot" style="background:${KOMPAS_COLORS[k]}"></span>${esc(KOMPAS_LABELS[k])} (${counts[k]})</span>`).join("");
    return `
      <div class="kompas-summary">
        <div class="kompas-bar">${segments}</div>
        <div class="kompas-legend">${legend}</div>
        ${unclassified ? `<div class="sub">${unclassified} exploratie${unclassified === 1 ? "" : "s"} nog niet geclassificeerd</div>` : ""}
      </div>`;
  }
```

- [ ] **Step 2: Wire into `renderOrgsTab`**

Locate `function renderOrgsTab() {` inside `renderTechnologieDetail` — its current body:

```javascript
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
```

Replace it with (adds the summary bar above the grid, and a badge per org card):

```javascript
    function renderOrgsTab() {
      if (!expls.length) return `<div class="empty">Nog geen exploraties bekend voor deze technologie.</div>`;
      return `
        ${kompasSummaryHtml(expls)}
        <div class="grid">${expls.map(e => `
        <div class="card">
          <h3>${esc(e.org)}</h3>
          <div class="org">${esc(e.typeOrganisatie)} · ${esc(e.jaar)} · <span style="color:${STATUS_COLORS[e.status]}">${esc(e.status)}</span></div>
          ${kompasBadgeHtml(e)}
          <p>${esc(e.samenvatting)}</p>
          ${e.uitkomst ? `<p><strong>Uitkomst:</strong> ${esc(e.uitkomst)}</p>` : ""}
          ${e.bron ? `<a href="${esc(e.bron)}" target="_blank" rel="noopener">Bron ${I.back}</a>` : ""}
        </div>`).join("")}</div>`;
    }
```

- [ ] **Step 3: Add CSS**

Append to `css/style.css`:

```css
.kompas-summary { margin: 10px 0 16px; }
.kompas-bar { display: flex; border-radius: 8px; overflow: hidden; height: 28px; }
.kompas-segment { display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; min-width: 20px; }
.kompas-legend { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 8px; font-size: 11.5px; color: var(--text-muted); }
.kompas-legend span { display: inline-flex; align-items: center; gap: 5px; }
.kompas-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
```

- [ ] **Step 4: Verify**

```bash
python3 -m http.server 8000 &
sleep 1
```

Open `http://localhost:8000/#/technologie/sensornetwerken-iot-omgevingsmonitoring` (has 5 seed explorations, one of them the "doorgaan" example from Task 1). Confirm: a segmented bar appears above the org grid, showing the distribution of the 5 orgs across kompas positions with correct counts, a legend below it naming each position with its count, and each org's card shows a kompas badge (the Provincie Zuid-Holland card should show "Doorgaan op resultaten van: RIVM"). Cross-check the total count in the bar's segments sums to 5. Then open `http://localhost:8000/#/technologie/federated-learning-privacyvriendelijke-data-analyse` (the seed technology with the fewest explorations, exactly 2) and confirm the summary bar still renders correctly with 2 segments summing to 2. Stop the server.

- [ ] **Step 5: Commit**

```bash
git add js/app.js css/style.css
git commit -m "Add kompas summary bar and badge to Technologie-detail"
```

---

### Task 4: Full manual QA pass

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: everything from Tasks 1-3.
- Produces: nothing — final task.

- [ ] **Step 1: Full click-through QA checklist**

```bash
python3 -m http.server 8000 &
sleep 1
```

Walk through, in order, confirming no console error (check browser devtools) at each step:

- [ ] `#/technologieen` → open a technology with exactly 1 exploration → confirm no JS error from `kompasSummaryHtml` on a 1-item array
- [ ] Open `#/technologie/sensornetwerken-iot-omgevingsmonitoring` → confirm summary bar + per-org badges render (per Task 3's verification)
- [ ] Open `#/technologie/post-quantum-cryptografie` → confirm NCSC's card shows "Samen doen met: AIVD"
- [ ] `#/mijn-exploraties` → create a new exploration and, in Fase 0, choose "+ Nieuwe technologie aanmaken" instead of linking to an existing one (all 10 seed technologies already have 2-6 explorations each, so this is the only way to get a technology with zero *other* orgs exploring it) → back on `#/mijn-exploraties`, confirm this exploration's kompas select only shows 4 options (no "Samen doen met"/"Doorgaan op resultaten van", since `others.length === 0` for a brand-new technology)
- [ ] Set that exploration's kompas to "Past niet bij ons" → confirm badge shows grey/white "Past niet bij ons", reload page, confirm it persisted
- [ ] Resize to mobile width (375px) → confirm the kompas summary bar and badges don't overflow horizontally

- [ ] **Step 2: Fix any issues found**

If any step fails, fix the specific function responsible and re-run the full checklist from Step 1 before proceeding.

- [ ] **Step 3: Update README**

Add a line to the "Wat zit erin" list in `README.md` describing the kompas feature. Locate this line:

```markdown
- **Technologie-detail** — TRL, wie onderzoekt dit, soortgelijke
  technologieën
```

Replace it with:

```markdown
- **Technologie-detail** — TRL, wie onderzoekt dit (incl. kompas-overzicht:
  welke organisaties dit oppakken, nog niet oppakken, niet relevant vinden,
  samen doen of voortbouwen op een andere organisatie), soortgelijke
  technologieën
```

- [ ] **Step 4: Final commit**

```bash
git add README.md
git commit -m "Complete kompas QA pass and update README"
```
