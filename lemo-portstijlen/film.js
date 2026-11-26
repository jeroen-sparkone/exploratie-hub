// Soorten port in de VinoVonk-illustratiestijl (inkt, halftoon, oker/sienna, carousel-typografie). 9:16, 45 s, zonder stem.
// Helpers en eindslide uit ../lemo-sherry-illustratie/film.js. Scènes: TREATMENT.md. Feiten: FACTS.md. Taal: ?lang=en.
const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const PAGE = cv.getContext('2d'); let g = PAGE;
for (const f of ['900 40px NotoSerif', '500 40px Grotesk', '700 40px Grotesk']) await document.fonts.load(f, 'LÁGRIMA é');
const QS = new URLSearchParams(location.search), LANG = QS.get('lang') === 'en' ? 'en' : 'nl';
const IG = QS.get('cta') === 'ig' && LANG === 'nl', KEY = 'PORTGIDS';   // IG-variant: keyword-CTA (Blotato DM-automation, post-specifiek)
const STR = {
  nl: { hook1: 'Ruby of tawny?', fam: 'Twee families', rubyF: 'De ruby-familie', tawnyF: 'De tawny-familie', wr: 'Wit en rosé', open: 'Hoelang open?',
        bottle: 'jong in de fles', wood: 'jaren in hout', ruby: 'jong, fruitig', reserve: 'selectie van het jaar', lbv: '1 oogst · 4–6 jaar', vintage: '1 oogst · 2–3 jaar, dan fles',
        depot: 'depot: decanteren', tawny: 'blend, rijpt in hout', aged: 'blend met dat profiel', colheita: '1 oogst · min. 7 jaar hout',
        ten1: '10 Years Old', ten2: 'is een blend, geen leeftijd', white: 'extra droog → lágrima', rose: 'jong, ijskoud',
        rows: [['Vintage', '1–2 dagen', 2], ['LBV', '4–5 dagen', 5], ['Ruby, reserve', '8–10 dagen', 10], ['Tawny', '3–4 weken', 28], ['Tawny 10–40, Colheita', '1–4 maanden', 120]],
        src: 'IVDP · richtlijn', end1: 'Welke port wanneer?', end2: 'De gids op vinovonk.com', end3: 'Soorten port: ruby, tawny,', end4: 'vintage, LBV, Colheita, wit' },
  en: { hook1: 'Ruby or tawny?', fam: 'Two families', rubyF: 'The ruby family', tawnyF: 'The tawny family', wr: 'White and rosé', open: 'How long open?',
        bottle: 'young in bottle', wood: 'years in wood', ruby: 'young, fruity', reserve: 'pick of the year', lbv: '1 harvest · 4–6 years', vintage: '1 harvest · 2–3 yrs, then bottle',
        depot: 'sediment: decant', tawny: 'blend, aged in wood', aged: 'blend with that profile', colheita: '1 harvest · 7+ years wood',
        ten1: '10 Year Old', ten2: 'is a blend, not an age', white: 'extra dry → lágrima', rose: 'young, ice-cold',
        rows: [['Vintage', '1–2 days', 2], ['LBV', '4–5 days', 5], ['Ruby, reserve', '8–10 days', 10], ['Tawny', '3–4 weeks', 28], ['Tawny 10–40, Colheita', '1–4 months', 120]],
        src: 'IVDP · guidance', end1: 'Which port when?', end2: 'The guide on vinovonk.com', end3: 'Types of port: ruby, tawny,', end4: 'vintage, LBV, Colheita, white' } }[LANG];
const CUES = {
  nl: [[0, 4.3, 'Port heeft twee families.'], [4.7, 8.9, 'Ruby blijft jong in de fles. Tawny rijpt jaren in hout.'], [9.3, 14.3, 'Van ruby naar vintage: van eenvoudig naar zeldzaam.'],
       [14.7, 19.5, 'Een oude vintage heeft depot. Die decanteer je.'], [20.1, 24.7, 'Tawny oxideert langzaam in het vat.'], [25.1, 29.7, 'Het getal op een tawny is geen leeftijd.'],
       [30.1, 34.7, 'Wit van extra droog tot lágrima. Rosé jong en ijskoud.'], [35.1, 40.7, 'Voor de feestdagen: kies een tawny.']],
  en: [[0, 4.3, 'Port has two families.'], [4.7, 8.9, 'Ruby stays young in bottle. Tawny ages for years in wood.'], [9.3, 14.3, 'From ruby to vintage: from simple to rare.'],
       [14.7, 19.5, 'An old vintage throws sediment. Decant it.'], [20.1, 24.7, 'Tawny oxidises slowly in the cask.'], [25.1, 29.7, 'The number on a tawny is not its age.'],
       [30.1, 34.7, 'White from extra dry to lágrima. Rosé young and ice-cold.'], [35.1, 40.7, 'For the holidays: pick a tawny.']] }[LANG].map(([t0, t1, text]) => ({ t0, t1, text }));
const FULL = 45;
const INK = '#1e1b15', OCH = '#c98a2e', SIE = '#9a4e1c', CRE = '#f3e8d2', WHT = '#fbf7ee', OX = '#8b0018', GOLD = '#C9A227', DARK = '#3a0010', MUTED = '#6b645a';
// kleur per stijl: een illustratie van de richting, geen meting (FACTS.md)
const COL = { ruby: '#8e0f2a', reserve: '#760c25', lbv: '#5c0a1f', vintage: '#3b0615', tawny: '#a4541f', aged: '#b86d2c', colheita: '#c57d2c', white: '#e6c357', rose: '#e88a9c' };

// ---------- tijd ----------
let T = 0, SEED = 7; const rnd = () => (SEED = (SEED * 16807) % 2147483647) / 2147483647;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), eo = v => 1 - Math.pow(1 - clamp(v), 3);
const K = (a, b) => eo((T - a) / (b - a)), OUT = (a, b) => 1 - K(a, b), win = (a, b, f = .5) => K(a, a + f) * OUT(b - f, b);
const back = v => { v = clamp(v) - 1; return 1 + v * v * (2.7 * v + 1.7); };
const TL = { SPLIT: 4.5, RUBY: 9.0, DEPOT: 14.6, TAWNY: 20.0, TEN: 25.0, WR: 30.0, OPEN: 35.0, CARD: 41.0 };

// ---------- hulpjes (uit de sherry-illustratie) ----------
function mk() { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; }
let PAPER = null;
function paperTex() { if (!PAPER) { const [c, x] = mk(); x.fillStyle = CRE; x.fillRect(0, 0, W, H); const id = x.getImageData(0, 0, W, H), d = id.data;
    for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) { const i = (y * W + X) * 4, n = Math.sin(X * .013 + y * .007) * 3 + Math.sin(X * .05 - y * .041) * 2 + (rnd() - .5) * 6; d[i] += n; d[i + 1] += n; d[i + 2] += n * .9; } x.putImageData(id, 0, 0); PAPER = c; }
  g.drawImage(PAPER, 0, 0); }
function smoothPoly(x, pts) { x.beginPath(); x.moveTo(...pts[0]); for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; x.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } x.lineTo(...pts.at(-1)); }
function wob(pts, amp, seed = 1) { return pts.map(([a, b], i) => [a + Math.sin(i * .37 + seed) * amp + Math.sin(i * 1.7 + seed * 3) * amp * .4, b + Math.cos(i * .41 + seed) * amp + Math.cos(i * 1.3 + seed) * amp * .4]); }
let TX = null;
function text(s, x, y, o = {}) { if ((o.a ?? 1) <= 0) return; g.save(); g.globalAlpha = o.a ?? 1; g.font = `${o.w || 700} ${o.size || 40}px ${o.f || 'Grotesk'}`; g.textAlign = o.align || 'left'; g.letterSpacing = (o.sp || 0) + 'px'; g.fillStyle = o.col || INK; g.fillText(s, x, y);
  if (TX && !o.nobox && (o.a ?? 1) > .5 && g === PAGE) { const w = g.measureText(s).width, x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x; TX.push({ id: o.id || s, text: s, x0, y0: y - o.size * .8, x1: x0 + w, y1: y + o.size * .2 }); } g.restore(); }
function wrapLines(s, max, font) { g.save(); g.font = font; const out = ['']; for (const w of s.split(' ')) { const t = out.at(-1) ? out.at(-1) + ' ' + w : w; if (g.measureText(t).width > max && out.at(-1)) out.push(w); else out[out.length - 1] = t; } g.restore(); return out; }
const tagW = (s, size) => { g.save(); g.font = `700 ${size}px Grotesk`; const w = g.measureText(s).width + 28; g.restore(); return w; };
function labelTag(s, x, y, side, a = 1, size = 46, id) { if (a <= 0) return; const w = tagW(s, size), X = side > 0 ? x : side < 0 ? x - w : x - w / 2, h = size * 1.22;
  g.save(); g.globalAlpha = a; g.fillStyle = INK; g.fillRect(X + 5, y - h * .72 + 5, w, h); g.fillStyle = WHT; g.fillRect(X, y - h * .72, w, h); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(X, y - h * .72, w, h); g.restore();
  text(s, X + 14, y + size * .1, { size, a, id: id || s }); }
function inset(a, cx, cy, r, draw, tag) { if (a <= 0) return; const s = back(a); g.save(); g.globalAlpha = clamp(a * 1.5);
  g.fillStyle = INK; g.beginPath(); g.arc(cx + 7, cy + 9, r * s, 0, 7); g.fill(); g.save(); g.beginPath(); g.arc(cx, cy, r * s, 0, 7); g.clip(); g.fillStyle = '#efe0c2'; g.fillRect(cx - r, cy - r, 2 * r, 2 * r); draw(cx, cy, r * s); g.restore();
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r * s, 0, 7); g.stroke(); g.restore(); if (tag) labelTag(tag, cx, cy + r + 56, 0, a, 40, 'inset:' + tag); }
function box(X, Y, w, h, a, dy = 0, bar = OX) { g.save(); g.globalAlpha = a; g.fillStyle = INK; g.fillRect(X + 8, Y + 8 + dy, w, h); g.fillStyle = WHT; g.fillRect(X, Y + dy, w, h);
  g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(X, Y + dy, w, h); if (bar) { g.fillStyle = bar; g.fillRect(X, Y + dy, 14, h); } g.restore(); }

// ---------- tekenstukken ----------
// een wittewijnglas (het glas van de gids), ingeschonken in de kleur van de stijl; landt met een veer
function glass(cx, by, s, col, a, tilt = 0) {
  if (a <= 0) return; const k = back(clamp(a)); g.save(); g.globalAlpha = clamp(a * 1.6); g.translate(cx, by); g.scale(k * s, k * s); g.rotate(tilt);
  const bowl = () => { g.beginPath(); g.moveTo(-58, -330); g.bezierCurveTo(-76, -240, -78, -150, -36, -112); g.quadraticCurveTo(0, -92, 36, -112); g.bezierCurveTo(78, -150, 76, -240, 58, -330); };
  g.fillStyle = INK; g.save(); g.translate(7, 8); bowl(); g.fill(); g.restore();
  g.fillStyle = 'rgba(251,247,238,.85)'; bowl(); g.fill();
  g.save(); bowl(); g.clip(); g.fillStyle = col; g.fillRect(-90, -215, 180, 140);
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(-90, -215, 180, 10); g.restore();
  g.strokeStyle = INK; g.lineWidth = 6; bowl(); g.stroke();
  g.beginPath(); g.moveTo(-74, -215); g.quadraticCurveTo(0, -205, 74, -215); g.lineWidth = 3; g.stroke();
  g.lineWidth = 8; g.beginPath(); g.moveTo(0, -98); g.lineTo(0, -8); g.stroke();
  g.fillStyle = WHT; g.beginPath(); g.ellipse(0, -4, 58, 12, 0, 0, 7); g.fill(); g.lineWidth = 6; g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 5; g.beginPath(); g.moveTo(-44, -300); g.quadraticCurveTo(-58, -240, -48, -170); g.stroke();
  g.restore(); }
// een vat (voor de tawny-tak en het splitsbeeld)
function cask(cx, cy, s, a, wine = '#7a2a16') {
  if (a <= 0) return; g.save(); g.globalAlpha = clamp(a * 1.5); g.translate(cx, cy); g.scale(back(a) * s, back(a) * s);
  const shape = () => { g.beginPath(); g.moveTo(-120, -90); g.quadraticCurveTo(0, -120, 120, -90); g.quadraticCurveTo(150, 0, 120, 90); g.quadraticCurveTo(0, 120, -120, 90); g.quadraticCurveTo(-150, 0, -120, -90); g.closePath(); };
  g.fillStyle = INK; g.save(); g.translate(8, 9); shape(); g.fill(); g.restore();
  g.fillStyle = '#b5652a'; shape(); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; shape(); g.stroke();
  g.lineWidth = 3; for (const x of [-70, -25, 25, 70]) { g.beginPath(); g.moveTo(x, -105 + Math.abs(x) * .12); g.quadraticCurveTo(x * 1.12, 0, x, 105 - Math.abs(x) * .12); g.stroke(); }
  g.strokeStyle = '#2a2622'; g.lineWidth = 12; for (const y of [-58, 58]) { g.beginPath(); g.moveTo(-136, y); g.quadraticCurveTo(0, y * 1.25, 136, y); g.stroke(); }
  g.fillStyle = wine; g.strokeStyle = INK; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, 16, 11, 0, 0, 7); g.fill(); g.stroke(); g.restore(); }
// een fles, staand
function bottle(cx, by, s, a, col = '#2b3a22') {
  if (a <= 0) return; g.save(); g.globalAlpha = clamp(a * 1.5); g.translate(cx, by); g.scale(back(a) * s, back(a) * s);
  const shape = () => { g.beginPath(); g.moveTo(-58, 0); g.lineTo(-58, -230); g.quadraticCurveTo(-58, -290, -20, -320); g.lineTo(-20, -420); g.lineTo(20, -420); g.lineTo(20, -320); g.quadraticCurveTo(58, -290, 58, -230); g.lineTo(58, 0); g.closePath(); };
  g.fillStyle = INK; g.save(); g.translate(7, 8); shape(); g.fill(); g.restore();
  g.fillStyle = col; shape(); g.fill(); g.strokeStyle = INK; g.lineWidth = 6; shape(); g.stroke();
  g.fillStyle = WHT; g.fillRect(-46, -190, 92, 110); g.strokeRect(-46, -190, 92, 110); g.fillStyle = OX; g.fillRect(-46, -190, 92, 18);
  g.fillStyle = '#5a1a10'; g.fillRect(-22, -436, 44, 24); g.strokeRect(-22, -436, 44, 24); g.restore(); }
// inzet: de bodem van een oude vintage, met depot
function depotSection(cx, cy, r) { g.fillStyle = '#2a0a10'; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  g.fillStyle = '#4a0f1c'; g.fillRect(cx - r, cy - r, 2 * r, r * 1.2);
  SEED = 61; for (let i = 0; i < 70; i++) { const x = cx - r * .9 + rnd() * r * 1.8, y = cy + r * .25 + rnd() * r * .55, d = 3 + rnd() * 6; g.fillStyle = i % 3 ? '#5b3a22' : '#7a5230'; g.beginPath(); g.ellipse(x, y, d, d * .6, rnd(), 0, 7); g.fill(); }
  g.strokeStyle = INK; g.lineWidth = 10; g.beginPath(); g.moveTo(cx - r, cy + r * .82); g.quadraticCurveTo(cx, cy + r * .6, cx + r, cy + r * .82); g.stroke(); }
// inzet: het vat in doorsnede, lucht door het hout, de wijn verkleurt naar amber
function oxSection(cx, cy, r) { g.fillStyle = '#7a3f18'; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  for (let i = -3; i <= 3; i++) { g.strokeStyle = 'rgba(30,27,21,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + i * r * .3, cy - r); g.lineTo(cx + i * r * .3, cy + r); g.stroke(); }
  const k = K(TL.TAWNY + .8, TL.TAWNY + 4.0), mix = (a, b) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(',')})`; };
  g.fillStyle = mix(COL.ruby, COL.aged); g.fillRect(cx - r * .82, cy - r * .25, r * 1.64, r * 1.0);
  g.strokeStyle = '#2a2622'; g.lineWidth = 12; for (const y of [cy - r * .7, cy + r * .7]) { g.beginPath(); g.moveTo(cx - r, y); g.lineTo(cx + r, y); g.stroke(); }
  g.strokeStyle = WHT; g.lineWidth = 4; for (let i = 0; i < 3; i++) { const x = cx - r * .5 + i * r * .5, y0 = cy - r * .9 + ((T * 40 + i * 30) % 60); g.beginPath(); g.moveTo(x, y0); g.lineTo(x, y0 + 26); g.stroke(); g.beginPath(); g.moveTo(x - 8, y0 + 16); g.lineTo(x, y0 + 28); g.lineTo(x + 8, y0 + 16); g.stroke(); } }

// ---------- het beeld ----------
function frame(t) {
  T = t; SEED = 7; g = PAGE; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  paperTex();
  // achtergrondvlakken (zoals de sherry-illustratie), vanaf frame 0 aanwezig
  const blob = (pts, col, a = 1) => { g.save(); g.globalAlpha = a; g.fillStyle = col; smoothPoly(g, wob(pts, 10, pts.length)); g.closePath(); g.fill(); g.restore(); };
  blob([[0, 560], [360, 520], [500, 690], [300, 940], [0, 990]], OCH, .55); blob([[1080, 600], [780, 640], [720, 860], [900, 1090], [1080, 1110]], SIE, .45);
  blob([[120, 1190], [560, 1130], [980, 1220], [900, 1330], [160, 1340]], OCH, .35);

  const S1 = OUT(TL.SPLIT - .3, TL.SPLIT + .2), S2 = win(TL.SPLIT, TL.RUBY + .1, .5), S3 = win(TL.RUBY, TL.TAWNY + .1, .5), S4 = win(TL.TAWNY, TL.WR + .1, .5),
    S5 = win(TL.WR, TL.OPEN + .1, .5), S6 = win(TL.OPEN, TL.CARD + .1, .5);
  // 1: de hook. Een glas ruby en een glas tawny naast elkaar, vanaf frame 0
  glass(370, 1150, 1.15, COL.ruby, S1); glass(710, 1150, 1.15, COL.aged, S1);
  labelTag('ruby', 370, 1220, 0, S1, 46, 'h:ruby'); labelTag('tawny', 710, 1220, 0, S1, 46, 'h:tawny');
  // 2: twee families. Fles links, vat rechts, elk met zijn glas
  bottle(290, 1000, .9, K(TL.SPLIT + .1, TL.SPLIT + .6) * S2); cask(790, 840, .95, K(TL.SPLIT + .5, TL.SPLIT + 1.0) * S2);
  glass(420, 1170, .6, COL.ruby, K(TL.SPLIT + .9, TL.SPLIT + 1.3) * S2); glass(910, 1170, .6, COL.aged, K(TL.SPLIT + 1.3, TL.SPLIT + 1.7) * S2);
  labelTag('ruby', 290, 1240, 0, K(TL.SPLIT + .6, TL.SPLIT + 1.0) * S2, 46, 's:ruby'); labelTag(STR.bottle, 290, 1300, 0, K(TL.SPLIT + .8, TL.SPLIT + 1.2) * S2, 34, 's:bottle');
  labelTag('tawny', 790, 1240, 0, K(TL.SPLIT + 1.0, TL.SPLIT + 1.4) * S2, 46, 's:tawny'); labelTag(STR.wood, 790, 1300, 0, K(TL.SPLIT + 1.2, TL.SPLIT + 1.6) * S2, 34, 's:wood');
  // 3: de ruby-tak, van eenvoudig naar hoog
  const RUBY = [['Ruby', COL.ruby, STR.ruby], ['Reserve', COL.reserve, STR.reserve], ['LBV', COL.lbv, STR.lbv], ['Vintage', COL.vintage, STR.vintage]];
  const dep = K(TL.DEPOT, TL.DEPOT + .6);
  RUBY.forEach(([n, c, sub], i) => { const t0 = TL.RUBY + .3 + i * .7, x = 160 + i * 253, a = K(t0, t0 + .5) * S3, up = i === 3 ? 0 : dep;
    glass(x, 1010 - (i === 3 ? 0 : 0), .62, c, a * (1 - up * .55)); labelTag(n, x, 1075, 0, a * (1 - up * .55), 40, 'r:' + n);
    const sw = wrapLines(sub, 230, '500 28px Grotesk'); sw.forEach((s, j) => text(s, x, 1128 + j * 34, { size: 28, w: 500, align: 'center', col: MUTED, a: K(t0 + .3, t0 + .7) * S3 * (1 - dep), id: 'rs:' + n + j })); });
  // pijl van eenvoudig naar zeldzaam
  { const a = K(TL.RUBY + 3.6, TL.RUBY + 4.2) * S3 * (1 - dep); g.save(); g.globalAlpha = a; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(120, 640); g.lineTo(120 + 840 * K(TL.RUBY + 3.6, TL.RUBY + 4.6), 640); g.stroke();
    g.beginPath(); g.moveTo(960, 640); g.lineTo(936, 626); g.lineTo(936, 654); g.closePath(); g.fillStyle = INK; g.globalAlpha = a * K(TL.RUBY + 4.4, TL.RUBY + 4.6); g.fill(); g.restore(); }
  inset(win(TL.DEPOT, TL.TAWNY + .1, .6) * S3, 400, 900, 200, depotSection, STR.depot);
  // 4: de tawny-tak
  const TAW = [['Tawny', COL.tawny, STR.tawny], ['10 · 20 · 30 · 40', COL.aged, STR.aged], ['Colheita', COL.colheita, STR.colheita]];
    TAW.forEach(([n, c, sub], i) => { const t0 = TL.TAWNY + .6 + i * .6, x = 210 + i * 330, a = K(t0, t0 + .5) * S4;
    glass(x, 1060, .62, c, a); labelTag(n, x, 1125, 0, a, 38, 't:' + n);
    const sw = wrapLines(sub, 300, '500 28px Grotesk'); sw.forEach((s, j) => text(s, x, 1178 + j * 34, { size: 28, w: 500, align: 'center', col: MUTED, a: K(t0 + .3, t0 + .7) * S4, id: 'ts:' + n + j })); });
  inset(win(TL.TAWNY + .3, TL.TEN + .2, .6) * S4, 540, 700, 150, oxSection, null);
  { const a = win(TL.TEN, TL.WR + .1, .4); if (a > 0) { const X = 110, Y = 560, dy = -30 * (1 - K(TL.TEN, TL.TEN + .4)); box(X, Y, 860, 230, a, dy);
      text(STR.ten1, X + 44, Y + 104 + dy, { f: 'NotoSerif', w: 900, size: 76, col: OX, a, id: 'ten1' }); text(STR.ten2, X + 46, Y + 172 + dy, { size: 44, col: INK, a, id: 'ten2' }); } }
  // 5: wit en rosé
  glass(370, 1100, .95, COL.white, K(TL.WR + .3, TL.WR + .8) * S5); glass(710, 1100, .95, COL.rose, K(TL.WR + 1.0, TL.WR + 1.5) * S5);
  labelTag(LANG === 'en' ? 'white' : 'wit', 370, 1170, 0, K(TL.WR + .6, TL.WR + 1.0) * S5, 46, 'w:wit'); labelTag(LANG === 'en' ? 'rosé' : 'rosé', 710, 1170, 0, K(TL.WR + 1.3, TL.WR + 1.7) * S5, 46, 'w:rose');
  text(STR.white, 370, 1238, { size: 30, w: 500, align: 'center', col: MUTED, a: K(TL.WR + .9, TL.WR + 1.3) * S5, id: 'w:sub' }); text(STR.rose, 710, 1238, { size: 30, w: 500, align: 'center', col: MUTED, a: K(TL.WR + 1.6, TL.WR + 2.0) * S5, id: 'r:sub' });
  // 6: hoelang open, als balken (logaritmisch, van 1 dag tot 4 maanden)
  if (S6 > 0) { const X = 80, Y = 540, w = 920, h = 720; box(X, Y, w, h, S6, 0, null);
    const rowCol = [COL.vintage, COL.lbv, COL.ruby, COL.tawny, COL.colheita];
    STR.rows.forEach(([n, v, d], i) => { const t0 = TL.OPEN + .5 + i * .45, a = K(t0, t0 + .4) * S6, y = Y + 90 + i * 124, L = (w - 90) * Math.log(1 + d) / Math.log(121) * K(t0 + .1, t0 + .9);
      text(n, X + 44, y, { size: 34, w: 700, col: INK, a, id: 'o:' + n });
      g.save(); g.globalAlpha = a; g.fillStyle = INK; g.fillRect(X + 48, y + 18, L, 42); g.fillStyle = rowCol[i]; g.fillRect(X + 44, y + 14, L, 42); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(X + 44, y + 14, L, 42); g.restore();
      g.save(); g.font = '700 32px Grotesk'; const vw = g.measureText(v).width; g.restore(); const inside = X + 44 + L + 16 + vw > X + w - 30;
      text(v, inside ? X + 44 + L - 16 : X + 44 + L + 16, y + 48, { size: 32, w: 700, col: inside ? WHT : INK, a: K(t0 + .7, t0 + 1.0) * S6, id: 'ov:' + n, align: inside ? 'right' : 'left' }); });
    text(STR.src, X + 44, Y + h - 30, { size: 26, w: 500, col: MUTED, a: K(TL.OPEN + 3.0, TL.OPEN + 3.4) * S6, id: 'o:src' }); }

  // kop (carousel-typografie): oxblood eyebrow, Noto Serif in zinvorm; de hook staat vanaf frame 0
  const kops = [[0, TL.SPLIT, STR.hook1, OX], [TL.SPLIT, TL.RUBY, STR.fam, INK], [TL.RUBY, TL.TAWNY, STR.rubyF, INK], [TL.TAWNY, TL.WR, STR.tawnyF, INK], [TL.WR, TL.OPEN, STR.wr, INK], [TL.OPEN, TL.CARD, STR.open, INK]];
  text('VINOVONK', 72, 286, { size: 30, col: OX, sp: 6, a: OUT(TL.CARD - .4, TL.CARD), id: 'eyebrow' });
  kops.forEach(([a0, a1, s, col], i) => { const a = (i === 0 ? 1 : K(a0, a0 + .4)) * OUT(a1 - .3, a1), dy = i === 0 ? 0 : 20 * (1 - K(a0, a0 + .4));
    text(s, 70, (i === 0 ? 400 : 380) + dy, { f: 'NotoSerif', w: 900, size: i === 0 ? 106 : 84, col, a, id: 'kop' + i }); });
  // de vertellende regel, in de veilige zone
  { const c = CUES.find(c => T >= c.t0 - .12 && T < c.t1 + .12); if (c && T < TL.CARD - .2) { const a = (c.t0 === 0 ? 1 : K(c.t0 - .12, c.t0 + .08)) * OUT(c.t1 - .08, c.t1 + .12), L = wrapLines(c.text, 900, '500 48px Grotesk');
      L.forEach((s, i) => text(s, 72, 1395 + i * 62, { w: 500, size: 48, col: INK, a, id: 'sub' + i, nobox: true })); } }
  // eindkaart: de donkere carousel-slide
  { const a = K(TL.CARD, TL.CARD + .6); if (a > 0) { g.save(); g.globalAlpha = a; g.fillStyle = DARK; g.fillRect(0, 0, W, H); g.restore();
      const k2 = K(TL.CARD + .4, TL.CARD + 1.0), dy = 20 * (1 - k2);
      text('VINOVONK', 72, 640 + dy, { size: 32, col: GOLD, sp: 6, a: k2, id: 'end-eyebrow' });
      text(STR.end1, 70, 760 + dy, { f: 'NotoSerif', w: 900, size: 84, col: WHT, a: k2, id: 'end1' });
      if (IG) { const kk = K(TL.CARD + .5, TL.CARD + .9);
        text('Reageer met', 70, 870 + dy, { f: 'NotoSerif', w: 900, size: 64, col: WHT, a: kk, id: 'ig1' });
        g.save(); g.font = '900 84px NotoSerif'; const kw = g.measureText(KEY).width; g.restore();
        g.save(); g.globalAlpha = kk; g.fillStyle = GOLD; g.fillRect(58, 900 + dy, kw + 40, 110); g.restore();
        text(KEY, 78, 985 + dy, { f: 'NotoSerif', w: 900, size: 84, col: DARK, a: kk, id: 'ig2' });
        text('dan stuur ik je de hele gids.', 72, 1080 + dy, { size: 40, w: 500, col: '#e9dccb', a: K(TL.CARD + .7, TL.CARD + 1.1), id: 'ig3' }); }
      else { text(STR.end2, 70, 860 + dy, { f: 'NotoSerif', w: 900, size: 64, col: WHT, a: k2, id: 'end2' });
        text(STR.end3, 72, 960 + dy, { size: 40, w: 500, col: '#e9dccb', a: K(TL.CARD + .5, TL.CARD + .9), id: 'end3' }); text(STR.end4, 72, 1012 + dy, { size: 40, w: 500, col: '#e9dccb', a: K(TL.CARD + .5, TL.CARD + .9), id: 'end4' }); }
      text('@vinovonk', 72, 1440, { size: 30, w: 500, col: '#c9b9a4', a: k2, id: 'end-handle' }); } }
}

window.DUR = FULL;
window.render = t => frame(t);
window.TEXTS = t => { TX = []; frame(t); const r = TX; TX = null; return r; };
window.EV = [
  { t: 0, type: 'word' }, { t: TL.SPLIT, type: 'whoosh' }, { t: TL.SPLIT + .1, type: 'pin', i: 0 }, { t: TL.SPLIT + .5, type: 'pin', i: 1 },
  { t: TL.RUBY, type: 'whoosh' }, ...[0, 1, 2, 3].map(i => ({ t: TL.RUBY + .3 + i * .7, type: 'ignite', i })), { t: TL.DEPOT, type: 'dive' },
  { t: TL.TAWNY, type: 'whoosh' }, ...[0, 1, 2].map(i => ({ t: TL.TAWNY + .6 + i * .6, type: 'ignite', i: i + 1 })), { t: TL.TEN, type: 'stat' },
  { t: TL.WR, type: 'whoosh' }, { t: TL.WR + .3, type: 'pin', i: 1 }, { t: TL.WR + 1.0, type: 'pin', i: 2 },
  { t: TL.OPEN, type: 'rise' }, { t: TL.OPEN + .5, type: 'stat' }, { t: TL.CARD, type: 'card' }];
window.render(0);
window.READY = true;
