// Sherry-driehoek in de VinoVonk-illustratiestijl (inkt, halftoon, oker/sienna) met carousel-typografie. 9:16, 45 s.
// Stem en ondertitels uit de map-explainer-proef (voice/cues.json). Scènes: zie de tabel in het gesprek / TREATMENT.md.
const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const PAGE = cv.getContext('2d'); let g = PAGE;
for (const f of ['900 40px NotoSerif', '500 40px Grotesk', '700 40px Grotesk']) await document.fonts.load(f, 'SANLÚCAR é');
const COAST = await fetch('coast.json').then(r => r.json());
const LANG = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'nl';
const CUES = await fetch(LANG === 'en' ? 'voice/cues.en.json' : 'voice/cues.json').then(r => r.json());
const STR = {
  nl: { hold: 'houdt water vast', flor: 'flor op de wijn', thick: 'het hele jaar dik', manz2: 'rijpt alleen in Sanlúcar', ha: '6.867 ha', ha2: 'wijngaard in de DO, alle bodems',
        kop1: 'De sherry-driehoek', hook1: 'Manzanilla uit Jerez?', hook2: 'Die bestaat niet.', kop2a: 'Twee winden,', kop2b: 'één witte bodem', end1: 'Lees de hele gids', end2: 'op vinovonk.com', end3: 'Sherry-driehoek en albariza:', end4: 'waar sherry vandaan komt' },
  en: { hold: 'holds water', flor: 'flor on the wine', thick: 'thick all year', manz2: 'ages only in Sanlúcar', ha: '6,867 ha', ha2: 'of vineyard in the DO, all soils',
        kop1: 'The sherry triangle', hook1: 'Manzanilla from Jerez?', hook2: 'No such thing.', kop2a: 'Two winds,', kop2b: 'one white soil', end1: 'Read the full guide', end2: 'on vinovonk.com', end3: 'The sherry triangle:', end4: 'Jerez, Sanlúcar, albariza' } }[LANG];
const LAND = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'land.png'; });
const FULL = 45;

const INK = '#1e1b15', OCH = '#c98a2e', SIE = '#9a4e1c', CRE = '#f3e8d2', WHT = '#fbf7ee', OX = '#8b0018', GOLD = '#C9A227', DARK = '#3a0010', MUTED = '#6b645a', WINE = '#d9a441';

// ---------- tijd ----------
let T = 0, SEED = 7; const rnd = () => (SEED = (SEED * 16807) % 2147483647) / 2147483647;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), eo = v => 1 - Math.pow(1 - clamp(v), 3), eio = v => { v = clamp(v); return v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
const K = (a, b) => eo((T - a) / (b - a)), OUT = (a, b) => 1 - K(a, b), win = (a, b, f = .5) => K(a, a + f) * OUT(b - f, b);
const back = v => { v = clamp(v) - 1; return 1 + v * v * (2.7 * v + 1.7); };
const TL = { TOWN: { s: 9.4, j: 10.0, p: 10.9 }, TRI: 11.2, PONI: 13.3, FLOR: 18.4, SAN: 22.6, SIL0: 27.7, RULE: 28.5, LEVA: 31.8, STAT: 36.9, CARD: 40.4 };

// ---------- kaartgeometrie (basiscoördinaten, de camera schaalt de hele kaartlaag) ----------
const MX = 90, MY = 500, MW = 900, MH = Math.round(900 * COAST.size[1] / COAST.size[0]);
const [BW, BS, BE, BN] = COAST.box;
const ll = (lon, lat) => [MX + (lon - BW) / (BE - BW) * MW, MY + (BN - lat) / (BN - BS) * MH];
const TOWN = { s: { ll: [-6.352, 36.778], n: 'Sanlúcar', side: -1 }, j: { ll: [-6.137, 36.686], n: 'Jerez', side: 1 }, p: { ll: [-6.233, 36.594], n: 'El Puerto', side: 1 } };
for (const k in TOWN) TOWN[k].xy = ll(...TOWN[k].ll);
const ALB = [[-6.21, 36.76], [-6.12, 36.79], [-6.06, 36.74], [-6.11, 36.70], [-6.20, 36.715]];
const ALBC = ll(-6.14, 36.745);
const coastPts = COAST.polys.map(p => p.map(([u, v]) => [MX + u * MW, MY + v * MH]));
const triPts = [TOWN.s.xy, TOWN.j.xy, TOWN.p.xy];
const KM = [['22 km', TOWN.s.xy, TOWN.j.xy], ['13 km', TOWN.j.xy, TOWN.p.xy], ['23 km', TOWN.p.xy, TOWN.s.xy]];   // haversine tussen de stadscentra, zie FACTS.md
const WIND = [0, 1, 2, 3].map(i => { const y0 = MY + 140 + i * 120, pts = [];
  for (let k = 0; k <= 30; k++) { const f = k / 30, x = MX + 30 + f * (TOWN.s.xy[0] + 140 - MX), y = y0 + Math.sin(f * 3.2 + i) * 28 + (TOWN.s.xy[1] + 40 - y0) * f * f * .55; pts.push([x, y]); }
  return pts; });
const HEAT = [0, 1, 2, 3].map(i => { const y0 = MY + 230 + i * 110, pts = []; for (let k = 0; k <= 30; k++) { const f = k / 30; pts.push([MX + MW - 20 - f * (MW * .5), y0 + (TOWN.j.xy[1] - 20 - y0) * f * .5]); } return pts; });

// ---------- camera: [t, centrum x, centrum y, schaal] in kaartcoördinaten ----------
const SC = [540, 875];
const CAM = [[0, ALBC[0] - 40, ALBC[1] + 20, 1.8], [7.6, ALBC[0] - 50, ALBC[1] + 26, 1.7], [9.4, 540, 875, 1], [13.0, 540, 875, 1], [16.5, 500, 875, .96], [22.4, 500, 875, .96],
  [24.0, TOWN.s.xy[0] + 40, TOWN.s.xy[1] + 40, 2.0], [31.2, TOWN.s.xy[0] + 30, TOWN.s.xy[1] + 30, 1.9], [32.6, 600, 875, 1.0], [36.4, 600, 875, 1.0], [38.0, 540, 875, .94], [FULL, 540, 875, .92]];
function camAt(t) { let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++; const a = CAM[i], b = CAM[i + 1], f = eio((t - a[0]) / (b[0] - a[0]));
  return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f, Math.exp(Math.log(a[3]) + (Math.log(b[3]) - Math.log(a[3])) * f)]; }
let CX = 540, CY = 875, CS = 1;
const toPage = ([x, y]) => [(x - CX) * CS + SC[0], (y - CY) * CS + SC[1]];

// ---------- hulpjes ----------
function mk() { const c = document.createElement('canvas'); c.width = W; c.height = H; return [c, c.getContext('2d')]; }
let LANDM = null;
function landMask() { if (LANDM) return LANDM; const [c, x] = mk(); x.filter = 'blur(1.5px)'; x.drawImage(LAND, MX, MY, MW, MH); x.filter = 'none';
  const id = x.getImageData(0, 0, W, H), d = id.data; for (let i = 0; i < d.length; i += 4) { const a = d[i] > 127 ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = a; } x.putImageData(id, 0, 0);
  x.globalCompositeOperation = 'destination-in'; x.fillRect(MX, MY, MW, MH); return (LANDM = c); }
let PAPER = null;
function paperTex() { if (!PAPER) { const [c, x] = mk(); x.fillStyle = CRE; x.fillRect(0, 0, W, H); const id = x.getImageData(0, 0, W, H), d = id.data;
    for (let y = 0; y < H; y++) for (let X = 0; X < W; X++) { const i = (y * W + X) * 4, n = Math.sin(X * .013 + y * .007) * 3 + Math.sin(X * .05 - y * .041) * 2 + (rnd() - .5) * 6; d[i] += n; d[i + 1] += n; d[i + 2] += n * .9; } x.putImageData(id, 0, 0); PAPER = c; }
  g.drawImage(PAPER, 0, 0); }
function poly(x, pts, close = false) { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); if (close) x.closePath(); }
function smoothPoly(x, pts) { x.beginPath(); x.moveTo(...pts[0]); for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; x.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } x.lineTo(...pts.at(-1)); }
function wob(pts, amp, seed = 1) { return pts.map(([a, b], i) => [a + Math.sin(i * .37 + seed) * amp + Math.sin(i * 1.7 + seed * 3) * amp * .4, b + Math.cos(i * .41 + seed) * amp + Math.cos(i * 1.3 + seed) * amp * .4]); }
function arrowHead(x, pts, size) { const a = pts.at(-1), b = pts.at(-4), ang = Math.atan2(a[1] - b[1], a[0] - b[0]); x.beginPath(); x.moveTo(a[0] + Math.cos(ang) * size, a[1] + Math.sin(ang) * size); x.lineTo(a[0] + Math.cos(ang + 2.5) * size, a[1] + Math.sin(ang + 2.5) * size); x.lineTo(a[0] + Math.cos(ang - 2.5) * size, a[1] + Math.sin(ang - 2.5) * size); x.closePath(); }
let TX = null;
function text(s, x, y, o = {}) { if ((o.a ?? 1) <= 0) return; g.save(); g.globalAlpha = o.a ?? 1; g.font = `${o.w || 700} ${o.size || 40}px ${o.f || 'Grotesk'}`; g.textAlign = o.align || 'left'; g.letterSpacing = (o.sp || 0) + 'px'; g.fillStyle = o.col || INK; g.fillText(s, x, y);
  if (TX && !o.nobox && (o.a ?? 1) > .5 && g === PAGE) { const w = g.measureText(s).width, x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x; TX.push({ id: o.id || s, text: s, x0, y0: y - o.size * .8, x1: x0 + w, y1: y + o.size * .2 }); } g.restore(); }
function wrapLines(s, max, font) { g.save(); g.font = font; const out = ['']; for (const w of s.split(' ')) { const t = out.at(-1) ? out.at(-1) + ' ' + w : w; if (g.measureText(t).width > max && out.at(-1)) out.push(w); else out[out.length - 1] = t; } g.restore(); return out; }
function labelTag(s, x, y, side, a = 1, size = 46, id) { if (a <= 0) return; g.save(); g.globalAlpha = a; g.font = `700 ${size}px Grotesk`; const w = g.measureText(s).width + 28, X = side > 0 ? x : x - w, h = size * 1.22;
  g.fillStyle = INK; g.fillRect(X + 5, y - h * .72 + 5, w, h); g.fillStyle = WHT; g.fillRect(X, y - h * .72, w, h); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(X, y - h * .72, w, h); g.restore();
  text(s, X + 14, y + size * .1, { size, a, id: id || s }); }
function screenInk(cov, ink, ang, period, alpha = 1) { const src = cov.getImageData(0, 0, W, H).data; g.save(); g.globalAlpha = alpha; g.fillStyle = ink;
  const a = ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), R = Math.hypot(W, H);
  for (let u = -R; u < R; u += period) for (let v = -R; v < R; v += period) { const px = W / 2 + u * ca - v * sa, py = H / 2 + u * sa + v * ca; if (px < 0 || py < 0 || px >= W || py >= H) continue;
    const i = ((py | 0) * W + (px | 0)) * 4, c = src[i] / 255 * (src[i + 3] / 255); if (c < .03) continue; g.beginPath(); g.arc(px, py, period * .5 * Math.sqrt(c) * 1.1, 0, 7); g.fill(); } g.restore(); }
function insideAlb(x, y) { const P = ALB.map(([a, b]) => ll(a, b)); let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) if (((P[i][1] > y) !== (P[j][1] > y)) && (x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0])) c = !c; return c; }
function triPath(x, k) { const P = [...triPts, triPts[0]], L = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(l); tot += l; }
  let rem = tot * k; x.beginPath(); x.moveTo(...P[0]); for (let i = 1; i < P.length && rem > 0; i++) { const f = Math.min(1, rem / L[i - 1]); x.lineTo(P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f); rem -= L[i - 1]; } }
const grow = (pts, a, b) => { const n = Math.round(K(a, b) * (pts.length - 1)); return n >= 3 ? pts.slice(0, n + 1) : null; };

// ---------- tekenstukken ----------
function puff(x, y, r) { const B = [[-.7, .15, .5], [-.25, -.2, .62], [.3, -.1, .55], [.72, .2, .42], [0, .25, .5]];
  g.save(); g.fillStyle = INK; for (const [u, v, q] of B) { g.beginPath(); g.arc(x + u * r, y + v * r, q * r + 4, 0, 7); g.fill(); }
  g.fillStyle = WHT; for (const [u, v, q] of B) { g.beginPath(); g.arc(x + u * r, y + v * r, q * r, 0, 7); g.fill(); }
  g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.arc(x - .2 * r, y - .1 * r, .3 * r, Math.PI * 1.05, Math.PI * 1.7); g.stroke(); g.restore(); }
function barrels(x, y, s) { const bar = (bx, by) => { g.fillStyle = '#b5652a'; g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.ellipse(bx, by, 13 * s, 10 * s, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(bx, by, 6 * s, 4.5 * s, 0, 0, 7); g.stroke(); };
  bar(x - 13 * s, y); bar(x + 13 * s, y); bar(x, y - 17 * s); }

// de kaartlaag, in basiscoördinaten
function drawMap() {
  const land = landMask();
  g.fillStyle = '#efe0c2'; g.fillRect(0, 0, W, H);
  { const [c, x] = mk(); const gr = x.createLinearGradient(MX, 0, MX + MW * .6, 0); gr.addColorStop(0, 'rgb(18,18,18)'); gr.addColorStop(1, 'rgb(95,95,95)'); x.fillStyle = gr; x.fillRect(MX - 300, MY - 300, MW + 600, MH + 600);
    x.globalCompositeOperation = 'destination-out'; x.drawImage(land, 0, 0); screenInk(x, 'rgb(154,78,28)', 30, 9, K(.4, 1.4)); }
  { const [c, x] = mk(); x.drawImage(land, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = WHT; x.fillRect(0, 0, W, H); g.save(); g.globalAlpha = K(.2, 1.0); g.drawImage(c, 0, 0); g.restore(); }
  { const [c, x] = mk(); x.strokeStyle = 'rgba(30,27,21,.55)'; x.lineWidth = 2; for (let k = -MH; k < MW; k += 9) { x.beginPath(); x.moveTo(MX + k, MY + MH); x.lineTo(MX + k + MH * .6, MY); x.stroke(); }
    x.globalCompositeOperation = 'destination-in'; x.drawImage(land, 0, 0); x.globalCompositeOperation = 'destination-out'; x.drawImage(land, 26, 0); g.drawImage(c, 0, 0); }
  g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round';
  { const kc = K(0, 1.6); for (const p of coastPts) { const n = Math.max(2, Math.round(p.length * kc)); if (kc <= 0) break; for (const [w, o] of [[7, 0], [2.5, 3]]) { g.lineWidth = w; smoothPoly(g, wob(p, .8, o).slice(0, n)); g.stroke(); } } }
  // albariza
  { const A = ALB.map(([a, b]) => ll(a, b)); g.fillStyle = '#ffffff'; smoothPoly(g, A); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    SEED = 21; for (let i = 0; i < 60; i++) { const [cx, cy] = ll(-6.20 + rnd() * .13, 36.71 + rnd() * .07); if (!insideAlb(cx, cy)) continue; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 9, cy - 4); g.stroke(); } }
  // driehoek
  const kt = K(TL.TRI, TL.TRI + 1.3); if (kt > 0) { g.strokeStyle = INK; g.lineWidth = 3; g.setLineDash([12, 9]); triPath(g, kt); g.stroke(); g.setLineDash([]); }
  // poniente: stippellijnen en drijvende rook, alleen boven zee
  const pa = OUT(36.4, 37.2) * .7 + .3 * (T < 36.4 ? 1 : 0) + (T >= 37.2 ? .3 : 0);
  WIND.forEach((W0, i) => { const w = grow(W0, TL.PONI + i * .25, TL.PONI + 2.0 + i * .25); if (!w) return; g.save(); g.globalAlpha = T > TL.LEVA ? .45 + .55 * OUT(TL.LEVA, TL.LEVA + 1) : 1;
    g.strokeStyle = INK; g.lineWidth = 3; g.setLineDash([2, 10]); smoothPoly(g, w); g.stroke(); g.setLineDash([]); if (w.length === W0.length) { arrowHead(g, w, 22); g.fillStyle = INK; g.fill(); }
    for (let j = 0; j < 2; j++) { const f = ((j / 2 + T * .06 + i * .17) % 1) * .5, idx = Math.floor(f * (W0.length - 1)); if (idx < 2 || idx > w.length - 2) continue; puff(w[idx][0], w[idx][1], 36); } g.restore(); });
  // levante: hittegolven in sienna uit het oosten
  HEAT.forEach((H0, i) => { const w = grow(H0, TL.LEVA + i * .2, TL.LEVA + 1.8 + i * .2); if (!w) return; const ww = w.map(([x, y], j) => [x, y + Math.sin(j * .9 - T * 6 + i) * 9]);
    g.strokeStyle = SIE; g.lineWidth = 9; g.lineCap = 'round'; smoothPoly(g, ww); g.stroke(); g.strokeStyle = INK; g.lineWidth = 2.5; smoothPoly(g, ww); g.stroke(); if (w.length === H0.length) { arrowHead(g, ww, 22); g.fillStyle = SIE; g.fill(); } });
  // steden: vaatjes ploffen neer
  for (const k in TOWN) { const [x, y] = TOWN[k].xy, p = back(K(TL.TOWN[k], TL.TOWN[k] + .45)); if (p <= 0) continue; barrels(x, y - 60 * (1 - K(TL.TOWN[k], TL.TOWN[k] + .35)), 1.3 * Math.min(p, 1.08)); }
}
// gescheurde papierrand, vast in kaartcoördinaten
SEED = 3; const TORN = []; { const cx = MX + MW / 2, cy = MY + MH / 2; for (let i = 0; i < 90; i++) { const a = i / 90 * Math.PI * 2, rx = MW * .53, ry = MH * .56; const j = 1 + (rnd() - .5) * .05 + Math.sin(i * 1.7) * .015; TORN.push([cx + Math.cos(a) * rx * j * Math.min(1, 1.18 / Math.max(Math.abs(Math.cos(a)), .85)), cy + Math.sin(a) * ry * j]); } }

// inzet: cirkel met een doorsnede (frame in het frame)
function inset(a, cx, cy, r, draw, tag) { if (a <= 0) return; const s = back(a); g.save(); g.globalAlpha = clamp(a * 1.5);
  g.fillStyle = INK; g.beginPath(); g.arc(cx + 7, cy + 9, r * s, 0, 7); g.fill(); g.save(); g.beginPath(); g.arc(cx, cy, r * s, 0, 7); g.clip(); g.fillStyle = '#efe0c2'; g.fillRect(cx - r, cy - r, 2 * r, 2 * r); draw(cx, cy, r * s); g.restore();
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.arc(cx, cy, r * s, 0, 7); g.stroke(); g.restore(); if (tag) labelTag(tag, cx - r * .9, cy + r + 52, 1, a, 44, 'inset:' + tag); }
function soilSection(cx, cy, r) {   // albariza: krijtlagen die water vasthouden, wortels die erin zoeken
  g.fillStyle = '#8a5a35'; g.fillRect(cx - r, cy - r, 2 * r, r * .45);
  for (let i = 0; i < 5; i++) { const y = cy - r * .55 + i * r * .32; g.fillStyle = i % 2 ? '#f6f1e6' : '#ffffff'; g.fillRect(cx - r, y, 2 * r, r * .32); g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - r, y); for (let x = cx - r; x < cx + r; x += 20) g.lineTo(x, y + Math.sin(x * .05 + i) * 3); g.stroke(); }
  SEED = 40; for (let i = 0; i < 26; i++) { const x = cx - r * .8 + rnd() * r * 1.6, y = cy - r * .4 + rnd() * r * 1.2, d = 6 + rnd() * 5; g.fillStyle = '#d8c3a0'; g.beginPath(); g.ellipse(x, y, d * .7, d, 0, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 1.5; g.stroke(); }
  g.strokeStyle = INK; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, cy - r * .6); g.bezierCurveTo(cx - 10, cy - r * .2, cx + 20, cy + r * .1, cx - 6, cy + r * .6); g.stroke();
  g.lineWidth = 2.5; for (const [dx, dy] of [[-60, .1], [50, .25], [-40, .45]]) { g.beginPath(); g.moveTo(cx, cy + dy * r); g.quadraticCurveTo(cx + dx * .5, cy + dy * r + 20, cx + dx, cy + dy * r + 40); g.stroke(); }
  g.fillStyle = '#4f6b2e'; for (const [dx, dy] of [[-30, -.78], [10, -.86], [36, -.76]]) { g.beginPath(); g.ellipse(cx + dx, cy + dy * r, 22, 12, dx * .02, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = 2; g.stroke(); } }
function barrelSection(cx, cy, r, thick) {   // een vat in doorsnede: wijn met een witte florlaag erop
  g.fillStyle = '#7a3f18'; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  for (let i = -3; i <= 3; i++) { g.strokeStyle = 'rgba(30,27,21,.6)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx + i * r * .3, cy - r); g.lineTo(cx + i * r * .3, cy + r); g.stroke(); }
  const top = cy - r * .15, wineTop = top + r * .1;
  g.fillStyle = WINE; g.fillRect(cx - r * .82, wineTop, r * 1.64, r * .85);
  const fl = 10 + thick * 46; g.fillStyle = WHT; g.beginPath(); g.moveTo(cx - r * .82, wineTop); for (let x = -r * .82; x <= r * .82; x += 14) g.lineTo(cx + x, wineTop - fl + Math.sin(x * .1 + T * 2) * 5); g.lineTo(cx + r * .82, wineTop); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
  SEED = 50; for (let i = 0; i < 18 + thick * 22; i++) { const x = cx - r * .75 + rnd() * r * 1.5, y = wineTop - rnd() * fl * .8; g.strokeStyle = INK; g.lineWidth = 1.5; g.beginPath(); g.arc(x, y, 3 + rnd() * 3, 0, 7); g.stroke(); }
  g.strokeStyle = '#2a2622'; g.lineWidth = 12; for (const y of [cy - r * .7, cy + r * .7]) { g.beginPath(); g.moveTo(cx - r, y); g.lineTo(cx + r, y); g.stroke(); }
  g.fillStyle = 'rgba(30,27,21,.35)'; g.fillRect(cx - r * .82, wineTop + r * .55, r * 1.64, r * .3); }

// ---------- het beeld ----------
function frame(t) {
  T = t; SEED = 7; g = PAGE; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  [CX, CY, CS] = camAt(t);
  paperTex();
  // achtergrondvlakken
  const blob = (pts, col, a = 1) => { g.save(); g.globalAlpha = a; g.fillStyle = col; smoothPoly(g, wob(pts, 10, pts.length)); g.closePath(); g.fill(); g.restore(); };
  g.save(); g.translate(-120 * (1 - K(0, .9)), 0); blob([[0, 520], [380, 470], [520, 640], [300, 900], [0, 960]], OCH, .85); g.restore();
  g.save(); g.translate(120 * (1 - K(.1, 1.0)), 0); blob([[1080, 560], [760, 600], [700, 820], [900, 1060], [1080, 1080]], SIE, .75); g.restore();
  blob([[120, 1180], [560, 1120], [980, 1210], [900, 1330], [160, 1340]], OCH, .5 * K(.2, 1));
  g.save(); g.strokeStyle = SIE; g.lineWidth = 6; g.globalAlpha = .5; for (const r of [250, 215]) { g.beginPath(); g.arc(1040, 1300, r, Math.PI * .95, Math.PI * 1.55); g.stroke(); } g.restore();
  // kaartlaag tekenen, door de camera en de gescheurde rand op de pagina zetten
  const [mc, mg] = mk(); g = mg; drawMap(); g = PAGE;
  { // het papier is een vast venster op de pagina; alleen de kaart erin zoomt
    const [c, x] = mk(); x.fillStyle = '#000'; poly(x, TORN, true); x.fill(); x.globalCompositeOperation = 'source-in'; x.setTransform(CS, 0, 0, CS, SC[0] - CX * CS, SC[1] - CY * CS); x.drawImage(mc, 0, 0);
    const ka = K(0, .7); g.save(); g.globalAlpha = ka; g.translate(0, 40 * (1 - ka));
    g.save(); g.translate(8, 10); g.fillStyle = 'rgba(30,27,21,.9)'; poly(g, TORN, true); g.fill(); g.restore();
    g.drawImage(c, 0, 0); g.strokeStyle = INK; g.lineWidth = 3; poly(g, TORN, true); g.stroke(); g.restore(); }
  // labels op de pagina (niet mee-geschaald, dus altijd even groot en leesbaar)
  const vis = ([x, y]) => x > 70 && x < W - 70 && y > 520 && y < 1270;
  for (const k in TOWN) { const t0 = TL.TOWN[k], p = toPage(TOWN[k].xy); const a = K(t0 + .2, t0 + .6) * OUT(TL.CARD - .4, TL.CARD); if (!vis(p)) continue;
    const big = k === 's' && T > TL.SAN && T < TL.LEVA ? 52 : 46; labelTag(TOWN[k].n, p[0] + TOWN[k].side * 40, p[1] + (k === 'p' ? 66 : k === 'j' ? -26 : -38), TOWN[k].side, a, big, 'town:' + k); }
  KM.forEach(([s, A, B], i) => { const m = toPage([(A[0] + B[0]) / 2, (A[1] + B[1]) / 2]); const a = win(TL.TRI + .4 + i * .4, 14.6 + .3 * i); if (vis(m)) labelTag(s, m[0] + (i === 1 ? 18 : -30), m[1] + (i === 0 ? -14 : 40), i === 1 ? 1 : -1, a, 40, 'km' + i); });
  { const p = toPage(ll(-6.21, 36.845)); labelTag('albariza', p[0], p[1], 1, win(1.0, 12.8), 50, 'alb'); }
  { const p = toPage([MX + 20, MY + 70]); if (vis(p)) labelTag('poniente', p[0], p[1], 1, win(TL.PONI + .6, 22.4) + win(36.9, TL.CARD), 50, 'poni'); }
  { const p = toPage([MX + MW - 30, MY + 180]); labelTag('levante', p[0], p[1], -1, win(TL.LEVA + .6, TL.CARD), 50, 'leva'); }
  // inzetten
  inset(win(3.4, 8.7, .6), 790, 1080, 190, soilSection, STR.hold);
  inset(win(TL.FLOR, TL.RULE + .1, .6), 830, 1085, 170, (x, y, r) => barrelSection(x, y, r, T < TL.SAN ? .25 : .25 + .75 * K(TL.SAN + .6, TL.SAN + 3.5)), T < TL.SAN ? STR.flor : STR.thick);
  // de regel: manzanilla rijpt alleen in Sanlúcar
  { const a = win(TL.RULE, 32.0, .4); if (a > 0) { g.save(); g.globalAlpha = a; const X = 90, Y = 1010, w = 560, h = 200, dy = -30 * (1 - K(TL.RULE, TL.RULE + .4));
      g.fillStyle = INK; g.fillRect(X + 8, Y + 8 + dy, w, h); g.fillStyle = WHT; g.fillRect(X, Y + dy, w, h); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(X, Y + dy, w, h); g.fillStyle = OX; g.fillRect(X, Y + dy, 14, h); g.restore();
      text('Manzanilla', X + 44, Y + 92 + dy, { f: 'NotoSerif', w: 900, size: 70, col: OX, a, id: 'manz' }); text(STR.manz2, X + 46, Y + 158 + dy, { size: 44, col: INK, a, id: 'manz2' }); } }
  // het getal
  { const a = win(TL.STAT - .3, TL.CARD, .4); if (a > 0) { g.save(); g.globalAlpha = a; const X = 90, Y = 980, w = 600, h = 250, dy = -30 * (1 - K(TL.STAT, TL.STAT + .4));
      g.fillStyle = INK; g.fillRect(X + 8, Y + 8 + dy, w, h); g.fillStyle = WHT; g.fillRect(X, Y + dy, w, h); g.strokeStyle = INK; g.lineWidth = 4; g.strokeRect(X, Y + dy, w, h); g.restore();
      text(STR.ha, X + 36, Y + 108 + dy, { f: 'NotoSerif', w: 900, size: 92, col: OX, a, id: 'ha' }); text(STR.ha2, X + 38, Y + 168 + dy, { size: 38, col: INK, a, id: 'ha2' }); text('Consejo Regulador, 2025', X + 38, Y + 218 + dy, { size: 32, w: 500, col: MUTED, a, id: 'ha3' }); } }
  // kop (carousel-typografie): oxblood eyebrow op licht, Noto Serif in zinvorm
  const H0 = 4.3, H1 = 4.8; { const hk = OUT(H0, H1);   // hook-titel staat vanaf frame 0, dan neemt de vaste kop het over
    text(STR.hook1, 70, 322, { f: 'NotoSerif', w: 900, size: 74, col: INK, a: hk, id: 'hook1' }); text(STR.hook2, 70, 402, { f: 'NotoSerif', w: 900, size: 74, col: OX, a: hk, id: 'hook2' }); }
  { const k = K(0, .8), kt = K(H1 - .1, H1 + .5), dy = 24 * (1 - kt), late = K(36.7, 37.3), a1 = k * OUT(TL.CARD - .4, TL.CARD);
    text('VINOVONK', 72, 268 + dy, { size: 30, col: OX, sp: 6, a: a1 * kt, id: 'eyebrow' });
    text(STR.kop1, 70, 356 + dy, { f: 'NotoSerif', w: 900, size: 84, col: INK, a: a1 * kt * (1 - late), id: 'kop1' });
    text(STR.kop2a, 70, 356, { f: 'NotoSerif', w: 900, size: 84, col: INK, a: late * OUT(TL.CARD - .4, TL.CARD), id: 'kop2a' }); text(STR.kop2b, 70, 446, { f: 'NotoSerif', w: 900, size: 84, col: OX, a: late * OUT(TL.CARD - .4, TL.CARD), id: 'kop2b' }); }
  // ondertitel, in de veilige zone
  { const c = CUES.find(c => !c.nosub && T >= c.t0 - .12 && T < c.t1 + .12); if (c && T < TL.CARD - .2) { const a = K(c.t0 - .12, c.t0 + .08) * OUT(c.t1 - .08, c.t1 + .12), font = '500 48px Grotesk', L = wrapLines(c.text, 900, font);
      L.forEach((s, i) => text(s, 72, 1395 + i * 62, { w: 500, size: 48, col: INK, a, id: 'sub' + i, nobox: true })); } }
  text('@vinovonk', 72, 1505, { size: 26, w: 500, col: MUTED, a: OUT(TL.CARD - .4, TL.CARD), id: 'handle' });
  // eindkaart: de donkere carousel-slide
  { const a = K(TL.CARD, TL.CARD + .6); if (a > 0) { g.save(); g.globalAlpha = a; g.fillStyle = DARK; g.fillRect(0, 0, W, H); g.restore();
      const k2 = K(TL.CARD + .4, TL.CARD + 1.0), dy = 20 * (1 - k2);
      text('VINOVONK', 72, 640 + dy, { size: 32, col: GOLD, sp: 6, a: k2, id: 'end-eyebrow' });
      text(STR.end1, 70, 760 + dy, { f: 'NotoSerif', w: 900, size: 88, col: WHT, a: k2, id: 'end1' }); text(STR.end2, 70, 860 + dy, { f: 'NotoSerif', w: 900, size: 88, col: WHT, a: k2, id: 'end2' });
      text(STR.end3, 72, 960 + dy, { size: 40, w: 500, col: '#e9dccb', a: K(TL.CARD + .8, TL.CARD + 1.3), id: 'end3' }); text(STR.end4, 72, 1012 + dy, { size: 40, w: 500, col: '#e9dccb', a: K(TL.CARD + .8, TL.CARD + 1.3), id: 'end4' });
      text('@vinovonk', 72, 1440, { size: 30, w: 500, col: '#c9b9a4', a: k2, id: 'end-handle' }); } }
}

window.DUR = FULL;
window.render = t => frame(t);
window.TEXTS = t => { TX = []; frame(t); const r = TX; TX = null; return r; };
window.EV = [
  { t: 0, type: 'air' }, { t: 1.0, type: 'word' }, { t: 8.6, type: 'rise' },
  ...['s', 'j', 'p'].map((k, i) => ({ t: TL.TOWN[k], type: 'pin', i })), ...[0, 1, 2].map(i => ({ t: TL.TRI + i * .43, type: 'ignite', i })),
  { t: 12.8, type: 'whoosh' }, { t: TL.PONI, type: 'poniente' }, { t: TL.SAN, type: 'dive' }, { t: TL.SAN + .6, type: 'ring' },
  { t: TL.SIL0, type: 'silence' }, { t: TL.RULE, type: 'rule' }, { t: 31.0, type: 'orbit' }, { t: TL.LEVA, type: 'levante' },
  { t: 36.4, type: 'rise' }, { t: TL.STAT, type: 'stat' }, { t: TL.CARD, type: 'card' }];
window.render(0);
window.READY = true;
