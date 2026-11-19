// Mijn kelder is een MCP-server. 9:16, één tijdlijn (shotlijst in TREATMENT.md), 100 bpm, één maat = 2,4 s.
//   S1 bureau en kelder · S2 pull-out, cloudbord · S3 server bouwt op · S4 drie tools · S5 route vraag/aanroep
//   S6 inset: leest, twee treffers · S7 niets gevonden · S8 focus + context, legenda, eindkaart
import { Iso, tri, clamp, lerp, seg, ss, eo, eio, back, haloText, pin, inset, ring, hatch, cutLine, TAU } from './engine.js';

const Q = new URLSearchParams(location.search);
const W = innerWidth || 1080, H = innerHeight || 1920;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const g = cv.getContext('2d');
for (const f of ['500 40px Hanken', '700 40px Hanken', '500 40px JBMono', '400 40px ISerif']) await document.fonts.load(f, 'KELDER ú');
const CUES = await fetch('voice/cues.json').then(r => r.json());
const VO = Object.fromEntries(CUES.map(c => [c.id, c.t0]));

// ---------- kleuren: SparkOne-huisstijl ----------
const INK = '#16140f', CREAM = '#f4f1ea', PAPER = '#fffdf8';
const ORANGE = '#f0530c', COBALT = '#2540ff', YELLOW = '#ffd23f', WINE = '#7d2433', KRAFT = '#c9a874', STONE = '#b8b2a6', GRAPH = '#5c584f';
const T = { cream: tri('#ece7db', .35, .18), stone: tri(STONE), graph: tri(GRAPH), kraft: tri(KRAFT), orange: tri(ORANGE), cobalt: tri(COBALT), yellow: tri(YELLOW), wine: tri(WINE), soil: tri('#9a7b5c'), sky: tri('#dfe5f5', .3, .12) };
const FONT = 'Hanken', MONO = 'JBMono';
const txt = (s, x, y, o = {}) => haloText(g, s, x, y, { font: `${o.w || 700} ${o.size || 30}px ${o.f || FONT}`, track: o.track ?? 2.5, align: o.align || 'center', color: o.color || INK, haloColor: 'rgba(244,241,234,.95)', hw: o.hw ?? 8, halo: o.halo });

// ---------- tijden (filmseconden) ----------
const TL = {
  S2: 5.0, S3: 10.6, BUILD0: 11.6, BUILD1: 15.2, S4: 16.6, TOOLS: [17.6, 18.3, 19.0], LOCK: 19.2,
  S5: 22.0, Q0: 22.6, Q1: 24.4, CALL0: 25.0, CALL1: 26.8,
  S6: 27.8, INSET0: 28.0, SCAN0: 29.2, SCAN1: 30.6, HIT: 30.7, ANS0: 31.4, ANS1: 33.0,
  SIL0: 33.2, S7: 33.8, CALL2: 33.8, SCAN2: 34.6, EMPTY: 36.0, EMPTY1: 37.6,
  S8: 38.4, DESAT: 38.6, LEG1: 39.2, LEG2: 41.8, CARD: 45.4, END: 49.0 };
export const DUR = TL.END;

// ---------- camera: [t, x, y, z, log k] ----------
const CAM = [
  [0.0, 0.2, -1.2, 2.4, Math.log(118)], [4.6, 0.0, -1.0, 2.2, Math.log(104)],
  [8.2, -6.6, -6.6, 6.2, Math.log(40)], [10.4, -6.8, -6.8, 6.2, Math.log(39)],
  [12.4, -4.2, 1.6, 1.8, Math.log(92)], [16.4, -4.2, 1.6, 2.0, Math.log(86)],
  [21.6, -4.0, 1.4, 2.4, Math.log(80)],
  [23.6, -7.0, -6.0, 6.4, Math.log(40)], [27.4, -7.0, -6.2, 6.4, Math.log(39)],
  [28.8, -4.4, 1.2, 2.2, Math.log(76)], [33.2, -4.4, 1.2, 2.2, Math.log(74)],
  [34.4, -5.6, -2.6, 4.2, Math.log(56)], [38.0, -5.6, -2.8, 4.2, Math.log(55)],
  [40.4, -7.2, -7.2, 5.2, Math.log(34)], [49.0, -7.2, -7.2, 5.2, Math.log(33)]];
function camAt(t) {
  let i = 0; while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const a = CAM[i], b = CAM[i + 1], f = eio(seg(t, a[0], b[0]));
  return { x: lerp(a[1], b[1], f), y: lerp(a[2], b[2], f), z: lerp(a[3], b[3], f), k: Math.exp(lerp(a[4], b[4], f)) };
}

// ---------- de wereld ----------
const BOT = []; for (let lv = 0; lv < 4; lv++) for (let i = 0; i < 7; i++) BOT.push([-5.2 + i * 1.65, 5.2 - lv * .1, -3.55 + lv * .72]);
const SERVER = { x: -6.2, y: 1.6, w: 2.2, d: 2.2, h: 2.2 };
const SV_TOP = [SERVER.x + 1.1, SERVER.y + 1.1, SERVER.h];
const LAPTOP = [-.3, -2.4, 3.6], FILE = [1.8, -1.55, 2.45], CLOUD = [-14, -14, 13];
const RACK_FRONT = [-12.2, -11.4, 15.2];
const bez = (a, b, c, d, u) => [0, 1, 2].map(k => (1 - u) ** 3 * a[k] + 3 * (1 - u) ** 2 * u * b[k] + 3 * (1 - u) * u * u * c[k] + u ** 3 * d[k]);
const ROUTE_Q = u => bez(LAPTOP, [-1, -4, 9], [-8, -10, 16], RACK_FRONT, u);               // vraag: laptop → cloud
const ROUTE_C = u => bez(RACK_FRONT, [-10, -8, 16], [-7, 0, 9], [SV_TOP[0], SV_TOP[1], SV_TOP[2] + .6], u);   // aanroep: cloud → server
const pts = (fn, a = 0, b = 1, n = 60) => [...Array(n + 1)].map((_, i) => fn(lerp(a, b, i / n)));

function world(iso, t) {
  // thuisbord: vloerplaat, kelder eronder (opengesneden), bureau, laptop, bestand, server
  iso.box(-7, -7, -.5, 14, 14, .5, T.cream);
  iso.box(-7, -7, -4.4, 14, 14, .4, T.soil);
  iso.box(-7, -7, -4.0, .4, 14, 3.5, T.stone); iso.box(-6.6, -7, -4.0, 13.6, .4, 3.5, T.stone);
  for (let lv = 0; lv < 4; lv++) iso.box(-6.6, 4.2, -3.9 + lv * .72, 13, 1.6, .08, T.kraft, { bias: -.2 });
  for (const [x, y, z] of BOT) iso.cyl(x, y, z, .28, 1.35, T.wine, { axis: 'y', n: 14 });
  iso.box(-2.6, -3.2, 0, 5.4, 3.4, 2.0, T.stone);
  iso.box(-1.7, -2.6, 2.0, 2.6, 1.8, .14, T.graph);
  iso.box(-1.7, -2.75, 2.14, 2.6, .12, 1.7, T.graph, { faceColor: [null, '#34323a'] });
  iso.box(1.2, -2.25, 2.0, 1.2, 1.4, .45, T.kraft);
  iso.text3('CSV', 1.35, -1.0, 2.46, { plane: 'xy', size: .36, font: MONO, weight: 500, face: INK, tri: T.kraft });
  // server: 100 lagen, bouwen op 11.6 → 15.2
  iso.keep = true;
  const n = Math.floor(100 * clamp(seg(t, TL.BUILD0, TL.BUILD1)) ** 1.5 + .0001), lh = SERVER.h / 100;
  for (let i = 0; i < n; i++) iso.box(SERVER.x, SERVER.y, i * lh, SERVER.w, SERVER.d, lh, i % 10 === 9 ? tri('#cc4108') : T.orange, { bias: i * 1e-4 });
  // drie tools
  TL.TOOLS.forEach((t0, i) => { const p = back(seg(t, t0, t0 + .35), 2.2); if (p <= 0) return;
    const s = .55 * p; iso.box(SERVER.x + .2 + i * .7, SERVER.y + .8, SERVER.h, s, s, s, [T.yellow, T.cobalt, tri('#ffffff', 0, .25)][i] === T.cobalt ? T.orange : tri(['#ffe27a', '#ffd23f', '#f5b72a'][i])); });
  iso.keep = false;
  // lokale kabel laptop ↔ server
  if (t > TL.BUILD1) iso.line3([[-2.6, -1.4, .02], [-4.6, -1.4, .02], [-4.6, 2.7, .02], [SERVER.x + 2.2, 2.7, .02]], INK, 2, { dash: [6, 6], a: ss(seg(t, TL.BUILD1, TL.BUILD1 + .6)) });
  // cloudbord
  const [cx, cy, cz] = CLOUD;
  for (const [dx, dy, dz, r] of [[-2, 2, -1.4, 2.2], [1.5, 2.5, -1.6, 1.8], [2.6, -1, -1.3, 2.0], [-1, -2.2, -1.5, 1.7], [0, 0, -2.2, 2.4]]) iso.sphere(cx + dx, cy + dy, cz + dz, r, T.sky);
  iso.box(cx - 5, cy - 5, cz - .6, 10, 10, .6, T.sky);
  for (let i = 0; i < 3; i++) iso.box(cx - 3.2 + i * 2.2, cx - 1.2, cz, 1.6, 2.6, 3.6, T.cobalt, { decal: (I, b) => {
    for (let r = 0; r < 6; r++) I.line3([[b.x + 1.6, b.y + .3, b.z + .5 + r * .5], [b.x + 1.6, b.y + 1.4, b.z + .5 + r * .5]], '#9fb0ff', 2, { now: true }); } });
}

// gele en kobalt kaartjes langs een route (billboards)
function card(iso, p, col, draw) {
  iso.bill(p[0], p[1], p[2], (G, I, k) => { const s = 150 / k; G.scale(s, s); k *= s; const w = 1.5, h = .95;
    G.fillStyle = 'rgba(22,20,15,.18)'; G.fillRect(-w / 2 + .1, -h / 2 + .12, w, h);
    G.fillStyle = col; G.fillRect(-w / 2, -h / 2, w, h); G.lineWidth = 2 / k; G.strokeStyle = INK; G.strokeRect(-w / 2, -h / 2, w, h); draw && draw(G, w, h, k); }, { bias: 50, layer: 3, cull: false });
}
const bottleIcon = (G, x, y, s) => { G.fillStyle = WINE; G.fillRect(x - s * .16, y - s * .2, s * .32, s * .62); G.fillRect(x - s * .06, y - s * .45, s * .12, s * .28); };

// ---------- ondertitels: kaartlabel onderin ----------
function wrap(s, max, size) { g.font = `500 ${size}px ${FONT}`; const out = ['']; for (const w of s.split(' ')) { const tr = out.at(-1) ? out.at(-1) + ' ' + w : w; if (g.measureText(tr).width > max && out.at(-1)) out.push(w); else out[out.length - 1] = tr; } return out; }
function subtitle(t) {
  const c = CUES.find(c => t >= c.t0 - .1 && t < c.t1 + .1); if (!c || t > TL.CARD) return;
  const a = ss(seg(t, c.t0 - .1, c.t0 + .15)) * (1 - ss(seg(t, c.t1 - .1, c.t1 + .1)));
  const size = 40, L = wrap(c.text, W - 260, size), lh = 52, bw = Math.max(...L.map(s => { g.font = `500 ${size}px ${FONT}`; return g.measureText(s).width; })) + 120, bh = 40 + L.length * lh;
  const X = W / 2 - bw / 2, Y = H - 430 - bh;
  g.save(); g.globalAlpha = a; const b = eo(seg(t, c.t0 - .1, c.t0 + .25));
  g.fillStyle = 'rgba(22,20,15,.12)'; g.fillRect(X + 6, Y + 8, bw, bh); g.fillStyle = PAPER; g.fillRect(X, Y, bw, bh);
  g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.rect(X, Y, bw * b, bh); g.stroke();
  // iso-kubusje als legendachip
  const cx = X + 44, cy = Y + bh / 2, s = 13; const f = (p, c) => { g.beginPath(); p.forEach(([u, v], i) => i ? g.lineTo(cx + u * s, cy + v * s) : g.moveTo(cx + u * s, cy + v * s)); g.closePath(); g.fillStyle = c; g.fill(); };
  f([[0, -1], [.87, -.5], [0, 0], [-.87, -.5]], tri(ORANGE)[0]); f([[-.87, -.5], [0, 0], [0, 1], [-.87, .5]], tri(ORANGE)[1]); f([[0, 0], [.87, -.5], [.87, .5], [0, 1]], tri(ORANGE)[2]);
  g.save(); g.beginPath(); g.rect(X + 70, Y, (bw - 70) * eo(seg(t, c.t0, c.t0 + .45)), bh); g.clip();
  L.forEach((s, i) => haloText(g, s, X + 80, Y + 20 + lh * (i + .75), { font: `500 ${size}px ${FONT}`, align: 'left', halo: false, color: INK, track: .3, nobox: true }));
  g.restore(); g.restore();
}

// ---------- het beeld ----------
const iso = new Iso(g, W, H);
export function render(t) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = CREAM; g.fillRect(0, 0, W, H);
  // dot-lattice op de grond
  iso.cam = camAt(t); const k = iso.cam.k;
  g.fillStyle = 'rgba(22,20,15,.10)';
  for (let i = -24; i <= 24; i++) for (let j = -24; j <= 24; j++) { const [x, y] = iso.P(i * 2 - 7, j * 2 - 7, -6); if (x > -10 && x < W + 10 && y > -10 && y < H + 10) g.fillRect(x - 1.2, y - 1.2, 2.4, 2.4); }
  // schaduw onder het thuisbord
  { const [x, y] = iso.P(0, 0, -6); g.save(); g.filter = `blur(${Math.max(4, k * .4)}px)`; g.fillStyle = 'rgba(22,20,15,.12)'; g.beginPath(); g.ellipse(x, y, 13 * k * .87, 7 * k * .5, 0, 0, TAU); g.fill(); g.restore(); }

  iso.desat = .92 * ss(seg(t, TL.DESAT, TL.DESAT + 1.2));
  // focus + context: wat thuis blijft (server, bestand) en wat weggaat (kaartjes in de cloud) houden kleur
  iso.keep = false; world(iso, t);

  // route en kaartjes
  const qa = ss(seg(t, TL.S2 + 1, TL.S2 + 2)) * (1 - ss(seg(t, TL.S3, TL.S3 + .6)));
  if (qa > 0) { // geen directe lijn: bestand → cloud, met een kruis
    const a = FILE, b = RACK_FRONT, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    iso.line3([a, b], INK, 2, { dash: [7, 7], a: qa, layer: 2 });
    iso.bill(...m, (G, I, kk) => { G.strokeStyle = '#b23607'; G.lineWidth = 6 / kk; G.lineCap = 'round'; G.globalAlpha = qa; G.beginPath(); G.moveTo(-.6, -.6); G.lineTo(.6, .6); G.moveTo(.6, -.6); G.lineTo(-.6, .6); G.stroke(); }, { layer: 3, cull: false });
  }
  const rA = ss(seg(t, TL.Q0 - .6, TL.Q0)) * (t < TL.S8 + 1 ? 1 : .5);
  if (t > TL.Q0 - .6) iso.line3(pts(ROUTE_Q, 0, eo(seg(t, TL.Q0 - .6, TL.Q0 + .3))), INK, 2.2, { dash: [8, 7], a: rA, layer: 2 });
  if (t > TL.CALL0 - .5) iso.line3(pts(ROUTE_C, 0, eo(seg(t, TL.CALL0 - .5, TL.CALL0 + .3))), COBALT, 2.2, { dash: [8, 7], a: rA, layer: 2 });
  iso.keep = true;
  const qtext = (G, w, h, kk) => { G.fillStyle = INK; G.font = `700 ${.25}px ${FONT}`; G.textAlign = 'center'; G.textBaseline = 'middle'; G.fillText('WAT MOET', 0, -.13); G.fillText('ER OPEN?', 0, .2); };
  if (t > TL.Q0 && t < TL.Q1 + .8) card(iso, ROUTE_Q(eio(seg(t, TL.Q0, TL.Q1))), YELLOW, qtext);
  const ctext = (G) => { G.fillStyle = PAPER; G.font = `500 ${.3}px ${MONO}`; G.textAlign = 'center'; G.textBaseline = 'middle'; G.fillText('zoek()', 0, 0); };
  if (t > TL.CALL0 && t < TL.CALL1 + .6) card(iso, ROUTE_C(eio(seg(t, TL.CALL0, TL.CALL1))), COBALT, ctext);
  if (t > TL.CALL2 && t < TL.SCAN2 + .2) card(iso, ROUTE_C(eio(seg(t, TL.CALL2, TL.SCAN2))), COBALT, ctext);
  const atext = (G) => { bottleIcon(G, -.3, .05, .7); bottleIcon(G, .3, .05, .7); };
  if (t > TL.ANS0 && t < TL.ANS1) { const u = 1 - eio(seg(t, TL.ANS0, TL.ANS1)); card(iso, ROUTE_C(u), YELLOW, atext); }
  const etext = (G) => { G.fillStyle = INK; G.font = `500 ${.24}px ${MONO}`; G.textAlign = 'center'; G.textBaseline = 'middle'; G.fillText('niets', 0, -.14); G.fillText('gevonden', 0, .18); };
  if (t > TL.EMPTY) { const u = 1 - eio(seg(t, TL.EMPTY, TL.EMPTY1)), p = ROUTE_C(u), f = ss(seg(t, TL.EMPTY1 - .4, TL.EMPTY1 + .4)); card(iso, [p[0], p[1], p[2] + .4 * f], PAPER, etext); }
  if (t > TL.S8) { iso.box(1.2, -2.25, 2.0, 1.2, 1.4, .45, T.kraft); }
  if (t > TL.Q1 + .8) card(iso, [RACK_FRONT[0] - 4.2, RACK_FRONT[1] + 4.2, RACK_FRONT[2] + .4], YELLOW, qtext);
  if (t > TL.ANS1) card(iso, [RACK_FRONT[0] + 4.2, RACK_FRONT[1] - 4.2, RACK_FRONT[2] + .4], YELLOW, atext);
  iso.keep = false;
  iso.flush();

  // hatching op de snijvlakken van de vloerplaat
  const face = (pp) => pp.map(p => iso.P(...p));
  hatch(g, face([[-7, 7, -.5], [7, 7, -.5], [7, 7, 0], [-7, 7, 0]]), { sp: 6, fill: '#ece7db' });
  hatch(g, face([[7, -7, -.5], [7, 7, -.5], [7, 7, 0], [7, -7, 0]]), { sp: 6, fill: '#e3ddd0' });

  // ---------- labels ----------
  const A = (a0, a1, d = .9) => seg(t, a0, a0 + d) * (1 - ss(seg(t, a1 - .3, a1)));
  pin(iso, FILE[0], FILE[1], FILE[2] + .1, { title: 'KELDER.CSV', a: A(1.0, TL.S2 + 1.2), dir: 1, up: 150, len: 50, ts: 34 });
    pin(iso, -7, -7, 0, { title: 'MIJN LAPTOP', a: A(6.8, TL.S3), dir: -1, up: 110, len: 40, ts: 30 });
  pin(iso, CLOUD[0] - 2, CLOUD[1] + 1, CLOUD[2] + 3.6, { title: 'CLAUDE · IN DE CLOUD', a: A(7.2, TL.S3), dir: 1, up: 120, len: 40, ts: 30, dot: COBALT });
  // de opbouw: teller naast de server
  const bn = Math.floor(100 * clamp(seg(t, TL.BUILD0, TL.BUILD1)) ** 1.5 + .0001);
  pin(iso, SERVER.x + 2.2, SERVER.y + 2.2, Math.max(.3, SERVER.h * bn / 100), { title: 'MCP-SERVER', num: String(bn), counting: bn < 100, unit: 'REGELS CODE', a: A(TL.BUILD0, TL.TOOLS[0]), dir: 1, up: 170, len: 60, ts: 32, ns: 72, dot: ORANGE });
  ['LIJST', 'ZOEK', 'TEL'].forEach((s, i) => pin(iso, SERVER.x + .48 + i * .7, SERVER.y + 1.08, SERVER.h + .55, { title: s, a: A(TL.TOOLS[i] + .1, TL.S5), dir: i === 0 ? -1 : 1, up: [260, 360, 200][i], len: 30, ts: 34 }));
  { const a = A(TL.LOCK, TL.S5 + 1.0); if (a > 0) { const [, y] = iso.P(SERVER.x + 1.1, SERVER.y + 2.2, .9); g.save(); g.globalAlpha = a;
    txt('ALLEEN LEZEN', 80, y + 130, { size: 32, align: 'left', color: INK }); txt('geen tool die schrijft', 80, y + 172, { size: 26, w: 500, f: MONO, align: 'left', track: 0 }); g.restore(); } }

  // S6/S7: inset, het bestand wordt opnieuw gelezen
  const ia = seg(t, TL.INSET0, TL.INSET0 + 1.1) * (1 - ss(seg(t, TL.S8 - .4, TL.S8)));
  if (ia > 0) {
    const [ax, ay] = iso.P(FILE[0] + .6, FILE[1] + .7, FILE[2]), R = 250, cx = W / 2 + 150, cy = 560;
    inset(iso, ax, ay, cx, cy, R, ia, (G, x, y, r) => {
      G.fillStyle = PAPER; G.fillRect(x - r, y - r, 2 * r, 2 * r);
      const rows = 9, rh = 34, y0 = y - rows * rh / 2;
      const scanA = seg(t, TL.SCAN0, TL.SCAN1), scanB = seg(t, TL.SCAN2, TL.EMPTY - .2), sc = t < TL.S7 ? scanA : scanB, sy = y0 + sc * rows * rh;
      for (let i = 0; i < rows; i++) {
        const ry = y0 + i * rh, hit = t < TL.S7 && (i === 2 || i === 6) && t > TL.HIT && sy > ry;
        if (hit) { G.fillStyle = YELLOW; G.fillRect(x - r * .8, ry + 4, r * 1.6, rh - 8); }
        bottleIcon(G, x - r * .62, ry + rh / 2 + 2, 26);
        G.fillStyle = 'rgba(22,20,15,.55)'; G.fillRect(x - r * .5, ry + rh / 2 - 3, r * (.55 + .35 * ((i * 37) % 10) / 10), 6);
      }
      if (sc > 0 && sc < 1) { G.fillStyle = COBALT; G.fillRect(x - r, sy - 2, 2 * r, 4); }
      G.fillStyle = INK; G.font = `500 24px ${MONO}`; G.textAlign = 'center'; G.fillText('kelder.csv', x, y - r + 52);
    });
    const la = ss(seg(t, TL.SCAN0, TL.SCAN0 + .4)) * (1 - ss(seg(t, TL.S8 - .4, TL.S8)));
    if (la > 0) { g.globalAlpha = la; txt('LEEST OPNIEUW, BIJ ELKE AANROEP', cx, cy + R + 64, { size: 28 }); g.globalAlpha = 1; }
  }

  // S8: legenda
  if (t > TL.LEG1) {
    const X = 80, Y = 860;
    const row = (t0, col, a1, b1, dy) => { const a = ss(seg(t, t0, t0 + .5)); if (a <= 0) return; g.save(); g.globalAlpha = a;
      g.fillStyle = col; g.fillRect(X, Y + dy - 26, 44, 44); g.strokeStyle = INK; g.lineWidth = 2.5; g.strokeRect(X, Y + dy - 26, 44, 44);
      txt(a1, X + 68, Y + dy, { size: 36, align: 'left' }); txt(b1, X + 68, Y + dy + 44, { size: 30, w: 500, align: 'left', track: .5 }); g.restore(); };
    row(TL.LEG1, ORANGE, 'BLIJFT THUIS', 'het bestand en de server', 0);
    row(TL.LEG2, YELLOW, 'GAAT NAAR DE CLOUD', 'je vraag en wat de tool teruggeeft', 130);
  }
  // eindkaart
  if (t > TL.CARD) {
    const a = ss(seg(t, TL.CARD, TL.CARD + .5)), e = eo(seg(t, TL.CARD, TL.CARD + .7));
    g.save(); g.globalAlpha = a * .9; g.fillStyle = CREAM; g.fillRect(0, 0, W, H); g.restore();
    const X = 90, Y = H * .34, BW = (W - 180) * e;
    g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(22,20,15,1)'; g.fillRect(X + 10, Y + 10, BW, 400); g.fillStyle = PAPER; g.fillRect(X, Y, BW, 400); g.strokeStyle = INK; g.lineWidth = 3; g.strokeRect(X, Y, BW, 400);
    g.fillStyle = ORANGE; g.fillRect(X, Y, BW, 14); g.restore();
    if (e > .7) { const k2 = ss(seg(t, TL.CARD + .5, TL.CARD + 1.0));
      g.globalAlpha = k2;
      txt('ZO GEBRUIK IK AI · DEEL 7', X + 50, Y + 80, { size: 26, color: '#b23607', align: 'left', halo: false, track: 3 });
      haloText(g, 'Mijn kelder is', X + 48, Y + 175, { font: `400 84px ISerif`, halo: false, color: INK });
      haloText(g, 'een MCP-server', X + 48, Y + 265, { font: `400 84px ISerif`, halo: false, color: INK });
      txt('Lees het op sparkone.nl', X + 50, Y + 345, { size: 32, w: 500, align: 'left', halo: false, color: COBALT, track: .5 });
      g.globalAlpha = 1; }
  }
  if (!Q.has('nosubs')) subtitle(t);
  // fade-in
  if (t < .5) { g.fillStyle = `rgba(244,241,234,${1 - ss(t / .5)})`; g.fillRect(0, 0, W, H); }
}

export function events() {
  return [
    { t: 0, type: 'room' }, { t: 1.0, type: 'pin' }, { t: TL.S2, type: 'rise' }, { t: TL.S2 + 1.2, type: 'cross' },
    { t: TL.S3, type: 'dive' }, ...[...Array(20)].map((_, i) => ({ t: +(TL.BUILD0 + (TL.BUILD1 - TL.BUILD0) * Math.pow((i + 1) / 20, 1 / 1.5)).toFixed(3), type: 'layer', i })),
    ...TL.TOOLS.map((t, i) => ({ t, type: 'tool', i })), { t: TL.LOCK, type: 'lock' },
    { t: TL.S5 + .4, type: 'rise' }, { t: TL.Q0, type: 'send' }, { t: TL.Q1, type: 'arrive' }, { t: TL.CALL0, type: 'call' }, { t: TL.CALL1, type: 'arrive' },
    { t: TL.INSET0, type: 'inset' }, { t: TL.SCAN0, type: 'scan' }, { t: TL.HIT, type: 'hit' }, { t: TL.HIT + .45, type: 'hit' }, { t: TL.ANS0, type: 'send' },
    { t: TL.SIL0, type: 'silence' }, { t: TL.CALL2, type: 'call' }, { t: TL.SCAN2, type: 'scan' }, { t: TL.EMPTY, type: 'empty' },
    { t: TL.S8, type: 'rise' }, { t: TL.LEG1, type: 'legend' }, { t: TL.LEG2, type: 'legend' }, { t: TL.CARD, type: 'card' }];
}

window.DUR = DUR; window.EV = events();
window.render = t => render(t);
window.TEXTS = t => { globalThis.__TX = []; render(t); const r = globalThis.__TX; globalThis.__TX = null; return r; };
window.READY = true;
