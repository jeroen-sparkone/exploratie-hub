// Stijlkiezer: één sleutelmoment uit de sherry-uitleg (de poniente waait de driehoek in) in zes 2D-animatiestijlen,
// allemaal in VinoVonk-kleuren. ?style=risograph|papercut|toon|watercolor|woodcut|flat
// Kustlijn: coast.json + land.png (uit de kaartdata van de map-explainer-proef, zie tools/coast.py).
const Q = new URLSearchParams(location.search), STYLE = Q.get('style') || 'risograph';
const W = 1080, H = 1920;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
let g = cv.getContext('2d');
for (const f of ['900 40px NotoSerif', '500 40px Grotesk', '700 40px Grotesk', '600 40px Caveat']) await document.fonts.load(f, 'SANLÚCAR é');
const COAST = await fetch('coast.json').then(r => r.json());
const LAND = await new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'land.png'; });

// ---------- VinoVonk ----------
const V = { paper: '#fff8f0', ox: '#8b0018', ox2: '#b01b2a', ink: '#1e1b15', gold: '#C9A227', dark: '#3a0010', muted: '#6b645a' };

// ---------- kaartgeometrie ----------
const MX = 90, MY = 500, MW = 900, MH = Math.round(900 * COAST.size[1] / COAST.size[0]);
const [BW, BS, BE, BN] = COAST.box;
const ll = (lon, lat) => [MX + (lon - BW) / (BE - BW) * MW, MY + (BN - lat) / (BN - BS) * MH];
const TOWN = { s: { ll: [-6.352, 36.778], n: 'SANLÚCAR', side: -1 }, j: { ll: [-6.137, 36.686], n: 'JEREZ', side: 1 }, p: { ll: [-6.233, 36.594], n: 'EL PUERTO', side: 1 } };
for (const k in TOWN) TOWN[k].xy = ll(...TOWN[k].ll);
const ALB = [[-6.21, 36.76], [-6.12, 36.79], [-6.06, 36.74], [-6.11, 36.70], [-6.20, 36.715]];   // schematisch: heuvels ten noorden van Jerez
const coastPts = COAST.polys.map(p => p.map(([u, v]) => [MX + u * MW, MY + v * MH]));
// windlijnen van de oceaan naar Sanlúcar en de driehoek in (schematisch)
const WIND = [0, 1, 2, 3].map(i => { const y0 = MY + 140 + i * 120, pts = [];
  for (let k = 0; k <= 30; k++) { const f = k / 30, x = MX + 30 + f * (TOWN.s.xy[0] + 140 - MX), y = y0 + Math.sin(f * 3.2 + i) * 28 + (TOWN.s.xy[1] + 40 - y0) * f * f * .55; pts.push([x, y]); }
  return pts; });

// ---------- hulpjes ----------
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
let SEED = 7; const rnd = () => (SEED = (SEED * 16807) % 2147483647) / 2147483647;
// ---------- tijdlijn (clip van ±12 s; stills gebruiken T = 99, alles staat dan klaar) ----------
let T = 99;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), eo = v => 1 - Math.pow(1 - clamp(v), 3);
const K = (a, b) => eo((T - a) / (b - a));
const back = v => { v = clamp(v) - 1; return 1 + v * v * (2.7 * v + 1.7); };
const TOWN_T = { s: 1.2, j: 1.6, p: 2.0 };
function winds() { return WIND.map((w, i) => { const k = K(3.6 + i * .25, 5.4 + i * .25), n = Math.max(0, Math.round(k * (w.length - 1)));
  const ww = w.map(([x, y], j) => [x, y + Math.sin(T * 2.2 + j * .35 + i) * 5]); return n >= 3 ? ww.slice(0, n + 1) : null; }).filter(Boolean); }
const windDone = i => K(3.6 + i * .25, 5.4 + i * .25) > .97;
function triPath(x) { const P = [...triPts, triPts[0]], L = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(l); tot += l; }
  let rem = tot * K(2.4, 3.4); x.beginPath(); x.moveTo(...P[0]); for (let i = 1; i < P.length && rem > 0; i++) { const f = Math.min(1, rem / L[i - 1]); x.lineTo(P[i - 1][0] + (P[i][0] - P[i - 1][0]) * f, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * f); rem -= L[i - 1]; } }
const pop = k => back(K(TOWN_T[k], TOWN_T[k] + .45));
const LINES = [[3.4, 7.5, 'Uit het westen waait de poniente, koel en vochtig, van de oceaan.'], [7.6, 13, 'Die vochtige lucht helpt de flor, de gistlaag op fino en manzanilla.']];
const subNow = () => T > 50 ? 'Uit het westen waait de poniente, koel en vochtig.' : (LINES.find(([a, b]) => T >= a && T < b) || [0, 0, ''])[2];
const subA = () => { if (T > 50) return 1; const l = LINES.find(([a, b]) => T >= a - .15 && T < b); return l ? K(l[0] - .15, l[0] + .1) * (1 - K(l[1] - .15, l[1])) : 0; };
function landMask(blur = 0) {           // scherp landmasker op de kaartuitsnede (wit = land)
  const [c, x] = mk(); x.imageSmoothingQuality = 'high'; if (blur) x.filter = `blur(${blur}px)`; x.drawImage(LAND, MX, MY, MW, MH); x.filter = 'none';
  const id = x.getImageData(0, 0, W, H), d = id.data;
  for (let i = 0; i < d.length; i += 4) { const a = d[i] > 127 ? 255 : 0; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = a; }
  x.putImageData(id, 0, 0);
  x.globalCompositeOperation = 'destination-in'; x.fillRect(MX, MY, MW, MH); return c;
}
function fillThrough(mask, fill, ctx = g, op = 'source-over') { const [c, x] = mk(); x.drawImage(mask, 0, 0); x.globalCompositeOperation = 'source-in'; if (typeof fill === 'function') fill(x); else { x.fillStyle = fill; x.fillRect(0, 0, W, H); } ctx.globalCompositeOperation = op; ctx.drawImage(c, 0, 0); ctx.globalCompositeOperation = 'source-over'; }
function poly(x, pts, close = false) { x.beginPath(); pts.forEach(([a, b], i) => i ? x.lineTo(a, b) : x.moveTo(a, b)); if (close) x.closePath(); }
function smoothPoly(x, pts) { x.beginPath(); x.moveTo(...pts[0]); for (let i = 1; i < pts.length - 1; i++) { const m = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; x.quadraticCurveTo(pts[i][0], pts[i][1], m[0], m[1]); } x.lineTo(...pts.at(-1)); }
function wob(pts, amp, seed = 1) { return pts.map(([a, b], i) => [a + Math.sin(i * .37 + seed) * amp + Math.sin(i * 1.7 + seed * 3) * amp * .4, b + Math.cos(i * .41 + seed) * amp + Math.cos(i * 1.3 + seed) * amp * .4]); }
function arrowHead(x, pts, size) { const a = pts.at(-1), b = pts.at(-4), ang = Math.atan2(a[1] - b[1], a[0] - b[0]); x.beginPath(); x.moveTo(a[0] + Math.cos(ang) * size, a[1] + Math.sin(ang) * size); x.lineTo(a[0] + Math.cos(ang + 2.5) * size, a[1] + Math.sin(ang + 2.5) * size); x.lineTo(a[0] + Math.cos(ang - 2.5) * size, a[1] + Math.sin(ang - 2.5) * size); x.closePath(); }
function text(s, x, y, o = {}) { g.save(); g.font = `${o.w || 700} ${o.size || 40}px ${o.f || 'Grotesk'}`; g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic'; g.letterSpacing = (o.sp || 0) + 'px'; g.fillStyle = o.col || V.ink; if (o.rot) { g.translate(x, y); g.rotate(o.rot); g.fillText(s, 0, 0); } else g.fillText(s, x, y); g.restore(); }
const triPts = [TOWN.s.xy, TOWN.j.xy, TOWN.p.xy];
const SUB = 'Uit het westen waait de poniente, koel en vochtig.';

// ======================= 1. RISOGRAPH: twee steunkleuren, oxblood en goud =======================
function risograph() {
  g.fillStyle = '#f4eee2'; g.fillRect(0, 0, W, H);
  const land = landMask(), plates = { ox: mk(), gold: mk() };
  const cov = (k) => plates[k][1];
  // dekkingskaart per plaat (grijswaarde = dekking), daarna gerasterd
  const G = cov('gold'), O = cov('ox');
  fillThrough(land, 'rgb(150,150,150)', G);                                          // land: goud 40 %
  { const [c, x] = mk(); x.fillStyle = 'rgb(70,70,70)'; x.fillRect(MX, MY, MW, MH); x.globalCompositeOperation = 'destination-out'; x.drawImage(land, 0, 0); O.drawImage(c, 0, 0); }   // zee: oxblood 25 %
  { const [c, x] = mk(); x.fillStyle = '#fff'; smoothPoly(x, ALB); x.closePath(); x.fill(); G.globalCompositeOperation = 'destination-out'; G.drawImage(c, 0, 0); G.globalCompositeOperation = 'source-over'; }   // albariza: papier
  O.strokeStyle = '#fff'; O.lineWidth = 5; for (const p of coastPts) { smoothPoly(O, p); O.stroke(); }
  O.lineWidth = 9; O.lineCap = 'round'; for (const w of WIND) { smoothPoly(O, w); O.stroke(); arrowHead(O, w, 26); O.fillStyle = '#fff'; O.fill(); }
  O.setLineDash([16, 12]); O.lineWidth = 5; poly(O, triPts, true); O.stroke(); O.setLineDash([]);
  for (const k in TOWN) { const [x, y] = TOWN[k].xy; for (const P of [O, G]) { P.fillStyle = '#fff'; P.beginPath(); P.arc(x, y, 15, 0, 7); P.fill(); } }
  // titel: oxblood vol + gouden schaduwplaat
  O.font = '900 112px NotoSerif'; O.fillStyle = '#fff'; O.fillText('SHERRY-', 70, 260); O.fillText('DRIEHOEK', 70, 380);
  G.font = '900 112px NotoSerif'; G.fillStyle = 'rgb(200,200,200)'; G.fillText('SHERRY-', 80, 272); G.fillText('DRIEHOEK', 80, 392);
  G.fillStyle = '#fff'; G.fillRect(60, 1520, 960, 150); O.font = '700 40px Grotesk'; O.fillStyle = '#fff'; wrapTo(O, SUB, 100, 1585, 880, 52);
  // rasteren en overdrukken
  screen(G, 'rgb(201,162,39)', 15, 7, [4, -3]); screen(O, 'rgb(139,0,24)', 75, 7, [-3, 2]);
  // labels in oxblood, vol
  for (const k in TOWN) { const t = TOWN[k], [x, y] = t.xy; text(t.n, x + t.side * 28, y - 14, { size: 38, col: V.ox, align: t.side > 0 ? 'left' : 'right', sp: 3 }); }
  text('ALBARIZA', ll(-6.18, 36.80)[0], ll(-6.18, 36.80)[1], { size: 30, col: V.ox, sp: 6 });
  text('PONIENTE', MX + 50, MY + 110, { size: 40, col: V.ox, sp: 8 });
  grain(.05);
}
function screen(P, ink, ang, period, off) {      // halftoon met cosinus-spotfunctie, gedraaid raster, net verschoven (misregistratie)
  const src = P.getImageData(0, 0, W, H).data, [c, x] = mk(); x.fillStyle = ink;
  const a = ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), R = Math.hypot(W, H);
  for (let u = -R; u < R; u += period) for (let v = -R; v < R; v += period) {
    const px = W / 2 + u * ca - v * sa, py = H / 2 + u * sa + v * ca; if (px < 0 || py < 0 || px >= W || py >= H) continue;
    const i = ((py | 0) * W + (px | 0)) * 4, cov = src[i] / 255 * (src[i + 3] / 255); if (cov < .03) continue;
    const r = cov > .88 ? period * .75 : period * .5 * Math.sqrt(cov) * 1.15;
    x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
  }
  g.globalCompositeOperation = 'multiply'; g.globalAlpha = .92; g.drawImage(c, off[0], off[1]); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function wrapTo(x, s, X, Y, max, lh) { const ws = s.split(' '); let line = '', y = Y; for (const w of ws) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > max && line) { x.fillText(line, X, y); line = w; y += lh; } else line = t; } x.fillText(line, X, y); }
function grain(a) { const id = g.getImageData(0, 0, W, H), d = id.data; for (let i = 0; i < d.length; i += 4) { const n = (rnd() - .5) * 255 * a; d[i] += n; d[i + 1] += n; d[i + 2] += n; } g.putImageData(id, 0, 0); }

// ======================= 2. PAPIERSNIT: gesneden papierlagen =======================
function papercut() {
  g.fillStyle = '#efe3cf'; g.fillRect(0, 0, W, H);
  // zee: diep wijnrood papier met golfsnit
  const sea = mk()[0], sx = sea.getContext('2d'); sx.fillStyle = V.dark; sx.fillRect(MX, MY, MW, MH);
  sx.globalCompositeOperation = 'destination-out'; sx.strokeStyle = '#000'; sx.lineWidth = 3;
  for (let r = 0; r < 14; r++) for (let c = 0; c < 12; c++) { const x = MX + 30 + c * 82 + (r % 2) * 41, y = MY + 40 + r * 60; sx.beginPath(); sx.arc(x, y, 22, Math.PI * 1.1, Math.PI * 1.9); sx.stroke(); }
  paperPiece(sea, 8);
  // land: oxblood papier, met de kustlijn een tikje gewobbeld; albariza en de driehoek als uitsparingen
  const land = landMask(1.5), lc = mk()[0], lx = lc.getContext('2d'); lx.drawImage(land, 0, 0); lx.globalCompositeOperation = 'source-in'; lx.fillStyle = V.ox2; lx.fillRect(0, 0, W, H);
  lx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 26; i++) { const [cx, cy] = ll(-6.205 + (i % 7) * .025 + (Math.floor(i / 7) % 2) * .012, 36.78 - Math.floor(i / 7) * .022); rosette(lx, cx, cy, 15); }
  lx.lineWidth = 7; lx.strokeStyle = '#000'; lx.setLineDash([22, 14]); triPath(lx); lx.stroke(); lx.setLineDash([]);
  for (const k in TOWN) { const [x, y] = TOWN[k].xy, r = 20 * pop(k); if (r > 0) { lx.beginPath(); lx.arc(x, y, r, 0, 7); lx.fill(); } }
  // binnencontour (de klassieke dubbele lijn)
  lx.lineWidth = 3; for (const p of coastPts) { smoothPoly(lx, p.map(([a, b]) => [a + 14, b + 6])); lx.stroke(); }
  paperPiece(lc, 10);
  // de wind: wolkenkrullen in bladgoud, het ene accent
  const wc = mk()[0], wx = wc.getContext('2d'); wx.fillStyle = V.gold;
  for (const w of winds().slice(0, 3)) { for (let k = 4; k < w.length - 2; k += 6) cloudCurl(wx, w[k][0], w[k][1], 22 + k * .7); }
  paperPiece(wc, 6);
  // titelplaat
  const tc = mk()[0], tx = tc.getContext('2d'); tx.translate(0, -60 * (1 - K(0, .8))); tx.globalAlpha = K(0, .5); tx.fillStyle = V.ox; tx.fillRect(60, 200, 960, 260); tx.globalCompositeOperation = 'destination-out'; tx.font = '900 104px NotoSerif'; tx.fillText('SHERRY-', 100, 320); tx.fillText('DRIEHOEK', 100, 430);
  paperPiece(tc, 8);
  for (const k in TOWN) { const t = TOWN[k], [x, y] = t.xy; g.globalAlpha = K(TOWN_T[k] + .2, TOWN_T[k] + .6); text(t.n, x + t.side * 34, y + (k === 'j' ? 18 : -22), { size: 50, col: '#fff3dc', align: t.side > 0 ? 'left' : 'right', sp: 2 }); g.globalAlpha = 1; }
  g.globalAlpha = K(3.8, 4.4); text('PONIENTE', MX + 40, MY + 100, { size: 56, col: '#f6d77a', sp: 6 }); g.globalAlpha = 1;
  caption('#fff8f0', V.dark, V.gold);
}
function paperPiece(c, sh) { g.save(); g.shadowColor = 'rgba(40,10,10,.45)'; g.shadowBlur = sh; g.shadowOffsetX = sh * .5; g.shadowOffsetY = sh * .7; g.drawImage(c, 0, 0); g.restore(); }
function rosette(x, cx, cy, r) { for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; x.beginPath(); x.ellipse(cx + Math.cos(a) * r * .55, cy + Math.sin(a) * r * .55, r * .45, r * .18, a, 0, 7); x.fill(); } }
function cloudCurl(x, cx, cy, r) { x.beginPath(); x.arc(cx, cy, r, Math.PI, Math.PI * 2.2); x.arc(cx + r * 1.1, cy + r * .2, r * .6, Math.PI * 1.1, Math.PI * 2.4); x.lineTo(cx - r, cy + r * .4); x.closePath(); x.fill(); x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.arc(cx, cy + 2, r * .45, Math.PI, Math.PI * 2); x.lineWidth = 4; x.stroke(); x.globalCompositeOperation = 'source-over'; }
function caption(bg, fg, rule) { const s = subNow(), a = subA(); if (!s || a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = bg; g.fillRect(60, 1272, 960, 240); g.fillStyle = rule; g.fillRect(60, 1272, 12, 240); g.font = '700 54px Grotesk'; g.fillStyle = fg; wrapTo(g, s, 104, 1340, 820, 68); g.restore(); }

// ======================= 3. MID-CENTURY TOON: plat, off-register, gebroken inktlijn =======================
function toon() {
  g.fillStyle = '#f2e3c6'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#e8cfa2'; g.fillRect(0, MY - 40, W, MH + 80);                 // één grond, een tint donkerder voor de kaart
  const land = landMask(1), off = [7, 6];
  // vlakken een paar pixels naast de lijn
  { const [c, x] = mk(); x.drawImage(land, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#d9a441'; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'source-atop'; x.fillStyle = '#c38b2a'; x.fillRect(MX + MW * .72, MY, MW, MH);   // één platte schaduwvlak
    g.drawImage(c, off[0], off[1]); }
  g.fillStyle = V.paper; smoothPoly(g, ALB.map(([a, b]) => ll(a, b)).map(([a, b]) => [a + off[0], b + off[1]])); g.closePath(); g.fill();
  // zee: kidney-vormen en stippen
  g.fillStyle = '#b9534f'; for (let i = 0; i < 40; i++) { const x = MX + 40 + (i % 5) * 70 + (Math.floor(i / 5) % 2) * 35, y = MY + 60 + Math.floor(i / 5) * 100; g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill(); }
  // gebroken inktlijn
  g.strokeStyle = V.ink; g.lineCap = 'round';
  for (const p of coastPts) brokenLine(p, 5);
  brokenLine(ALB.map(([a, b]) => ll(a, b)).concat([ll(...ALB[0])]), 3.5);
  // winden: boemerangpijlen in oxblood
  winds().forEach((w, i) => { g.save(); g.translate(off[0], off[1]); g.strokeStyle = V.ox; g.lineWidth = 16; smoothPoly(g, w); g.stroke(); if (windDone(i)) { arrowHead(g, w, 32); g.fillStyle = V.ox; g.fill(); } g.restore(); brokenLine(w, 3); });
  g.setLineDash([18, 12]); g.lineWidth = 5; triPath(g); g.stroke(); g.setLineDash([]);
  for (const k in TOWN) { const t = TOWN[k], [x, y] = t.xy, p = pop(k); if (p <= 0) continue; starburst(x + off[0], y + off[1], 34 * p, 12, V.ox2); g.fillStyle = V.paper; g.beginPath(); g.arc(x, y, 10 * p, 0, 7); g.fill(); g.lineWidth = 3; g.stroke();
    g.globalAlpha = K(TOWN_T[k] + .2, TOWN_T[k] + .6); text(t.n, x + t.side * 44, y + (k === 'j' ? 18 : -24), { size: 50, col: V.ink, align: t.side > 0 ? 'left' : 'right', sp: 1 }); g.globalAlpha = 1; }
  g.globalAlpha = K(2.6, 3.2); sparkle(ll(-6.06, 36.80)[0], ll(-6.06, 36.80)[1], 26 * back(K(2.6, 3.1))); text('ALBARIZA', ll(-6.22, 36.82)[0], ll(-6.22, 36.82)[1], { size: 46, col: V.ink, sp: 3 });
  g.globalAlpha = K(3.8, 4.4); text('poniente', MX + 40, MY + 112, { size: 76, f: 'Caveat', w: 600, col: V.ox }); g.globalAlpha = 1;
  { const dy = -60 * (1 - K(0, .8)); g.globalAlpha = K(0, .5); const jx = Math.round(Math.sin(Math.floor(T * 12) * 1.7) * 1.5);
  text('SHERRY-', 74 + jx, 308 + dy, { f: 'NotoSerif', w: 900, size: 108, col: V.ox2 }); text('SHERRY-', 66, 300 + dy, { f: 'NotoSerif', w: 900, size: 108, col: V.ink });
  text('DRIEHOEK', 74 + jx, 418 + dy, { f: 'NotoSerif', w: 900, size: 108, col: '#d9a441' }); text('DRIEHOEK', 66, 410 + dy, { f: 'NotoSerif', w: 900, size: 108, col: V.ink }); g.globalAlpha = 1; }
  caption(V.paper, V.ink, V.ox); grain(.025);
}
function brokenLine(pts, w) { let k = 0; while (k < pts.length - 2) { const n = 6 + Math.floor(rnd() * 14); const seg = pts.slice(k, Math.min(pts.length, k + n)); g.lineWidth = w * (.7 + rnd() * .7); if (seg.length > 1) { smoothPoly(g, seg); g.stroke(); } k += n + (rnd() < .25 ? 2 : 0); } }
function starburst(x, y, r, n, col) { g.fillStyle = col; g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, rr = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
function sparkle(x, y, r) { g.fillStyle = V.ox; g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2, rr = i % 2 ? r * .18 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }

// ======================= 4. AQUAREL: een reisdagboek dat zichzelf schildert =======================
function watercolor() {
  paperTex('#fbf3e6');
  const land = landMask(3);
  // zee: drie dunne wassingen in grijs-rood, randen donkerder waar ze niet samenvallen
  for (let p = 0; p < 3; p++) { const [c, x] = mk(); x.fillStyle = 'rgba(110,60,70,.16)'; x.beginPath(); const j = () => (rnd() - .5) * 26; x.moveTo(MX + j(), MY + j()); x.lineTo(MX + MW * .62 + j(), MY + j()); x.lineTo(MX + MW * .5 + j(), MY + MH * .5); x.lineTo(MX + MW * .72 + j(), MY + MH + j()); x.lineTo(MX + j(), MY + MH + j()); x.closePath(); x.fill();
    x.globalCompositeOperation = 'destination-out'; x.drawImage(land, 0, 0); g.drawImage(c, (rnd() - .5) * 6, (rnd() - .5) * 6); }
  // land: warme oker-wassing, twee lagen; albariza blijft onbeschilderd papier
  for (let p = 0; p < 2; p++) { const [c, x] = mk(); x.drawImage(land, (rnd() - .5) * 8, (rnd() - .5) * 8); x.globalCompositeOperation = 'source-in'; x.fillStyle = p ? 'rgba(176,27,42,.18)' : 'rgba(201,162,39,.34)'; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = 'destination-out'; x.filter = 'blur(6px)'; x.fillStyle = '#000'; smoothPoly(x, ALB.map(([a, b]) => ll(a, b))); x.closePath(); x.fill(); x.filter = 'none'; g.drawImage(c, 0, 0); }
  // droge kwast: de wind in oxblood, met vliegend wit
  for (const w of winds()) for (let s = 0; s < 3; s++) { g.strokeStyle = `rgba(139,0,24,${.24 + s * .08})`; g.lineWidth = 18 - s * 4; g.lineCap = 'round'; g.setLineDash([60 + s * 20, 8 + s * 6]); smoothPoly(g, wob(w, 3, s + 1)); g.stroke(); } g.setLineDash([]);
  // inkt: alleen randen, tekst en kleine tekens
  g.strokeStyle = 'rgba(30,27,21,.7)'; g.lineWidth = 2.2; for (const p of coastPts) { smoothPoly(g, wob(p, 1.2)); g.stroke(); }
  g.setLineDash([3, 9]); g.lineWidth = 3.5; triPath(g); g.stroke(); g.setLineDash([]);
  for (const k in TOWN) { const t = TOWN[k], [x, y] = t.xy, p = pop(k); if (p <= 0) continue; g.fillStyle = V.ox; g.beginPath(); g.arc(x, y, 11 * p, 0, 7); g.fill();
    g.globalAlpha = K(TOWN_T[k] + .2, TOWN_T[k] + .7); text(t.n === 'EL PUERTO' ? 'El Puerto' : t.n === 'SANLÚCAR' ? 'Sanlúcar' : 'Jerez', x + t.side * 26, y + (k === 'j' ? 22 : -14), { f: 'Caveat', w: 600, size: 72, col: V.ink, align: t.side > 0 ? 'left' : 'right' }); g.globalAlpha = 1; }
  g.globalAlpha = K(2.6, 3.3); text('albariza: wit krijt', ll(-6.24, 36.835)[0], ll(-6.24, 36.835)[1], { f: 'Caveat', w: 600, size: 58, col: V.muted, rot: -.05 });
  g.globalAlpha = K(3.8, 4.4); text('poniente →', MX + 30, MY + 100, { f: 'Caveat', w: 600, size: 78, col: V.ox, rot: -.04 }); g.globalAlpha = 1;
  { const k = K(0, 1.1); g.save(); g.beginPath(); g.rect(0, 0, 70 + 960 * k, 460); g.clip(); text('Sherry-driehoek', 70, 330, { f: 'Caveat', w: 600, size: 140, col: V.ox }); text('twee winden, één witte bodem', 78, 410, { f: 'Caveat', w: 600, size: 58, col: V.muted }); g.restore(); }
  { const s = subNow(), a = subA(); if (s && a > 0) { g.save(); g.globalAlpha = a; g.font = '600 68px Caveat'; g.fillStyle = V.ink; wrapTo(g, s, 90, 1350, 860, 74); g.restore(); } }
}
function paperTex(base) { g.fillStyle = base; g.fillRect(0, 0, W, H); const id = g.getImageData(0, 0, W, H), d = id.data;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, n = Math.sin(x * .013 + y * .007) * 3 + Math.sin(x * .05 - y * .041) * 2 + (rnd() - .5) * 6; d[i] += n; d[i + 1] += n; d[i + 2] += n * .9; } g.putImageData(id, 0, 0);
  g.strokeStyle = 'rgba(120,100,80,.08)'; g.lineWidth = 1; for (let i = 0; i < 1500; i++) { const x = rnd() * W, y = rnd() * H; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 6, y + rnd() * 8 - 4, x + 12, y + rnd() * 6 - 3); g.stroke(); } }

// ======================= 5. HOUTSNEDE: zwart blok, alleen oxblood voor wat telt =======================
function woodcut() {
  g.fillStyle = '#f3ecdf'; g.fillRect(0, 0, W, H);
  const B = [50, 170, 980, 1180];                                       // het blok; onderin de papiermarge voor het onderschrift
  const [blk, bx] = mk(); bx.fillStyle = V.ink; bx.beginPath(); const e = (v) => v + (rnd() - .5) * 6;
  bx.moveTo(e(B[0]), e(B[1])); for (let x = B[0]; x <= B[0] + B[2]; x += 20) bx.lineTo(x, e(B[1])); for (let y = B[1]; y <= B[1] + B[3]; y += 20) bx.lineTo(e(B[0] + B[2]), y);
  for (let x = B[0] + B[2]; x >= B[0]; x -= 20) bx.lineTo(x, e(B[1] + B[3])); for (let y = B[1] + B[3]; y >= B[1]; y -= 20) bx.lineTo(e(B[0]), y); bx.fill();
  // gutsen: zee als horizontale snedes, land als korte zaagsnedes langs de kust, albariza als witte brokken
  const land = landMask(); bx.globalCompositeOperation = 'destination-out';
  const [sc, sx] = mk(); sx.strokeStyle = '#000'; sx.lineCap = 'round';
  for (let y = MY + 10; y < MY + MH; y += 13) { let x = MX; while (x < MX + MW) { const L = 30 + rnd() * 90; sx.lineWidth = 2 + rnd() * 3.5; sx.beginPath(); sx.moveTo(x, y + Math.sin(x * .02) * 4); sx.lineTo(x + L, y + Math.sin((x + L) * .02) * 4); sx.stroke(); x += L + 10 + rnd() * 30; } }
  sx.globalCompositeOperation = 'destination-out'; sx.drawImage(land, 0, 0); bx.drawImage(sc, 0, 0);
  bx.lineWidth = 3; bx.strokeStyle = '#000'; for (const p of coastPts) { smoothPoly(bx, p.map(([a, b]) => [a - 8, b])); bx.stroke(); }
  for (let i = 0; i < 60; i++) { const [cx, cy] = ll(-6.21 + rnd() * .15, 36.70 + rnd() * .09); if (!insideAlb(cx, cy)) continue; bx.beginPath(); bx.ellipse(cx, cy, 8 + rnd() * 10, 4 + rnd() * 5, rnd() * 3, 0, 7); bx.fill(); }
  winds().forEach((w, i) => { bx.lineWidth = 20; smoothPoly(bx, w); bx.stroke(); if (windDone(i)) { arrowHead(bx, w, 32); bx.fill(); } });
  for (const k in TOWN) { const [x, y] = TOWN[k].xy, r = 18 * pop(k); if (r > 0) { bx.beginPath(); bx.arc(x, y, r, 0, 7); bx.fill(); } }
  bx.lineWidth = 5; bx.setLineDash([16, 12]); triPath(bx); bx.stroke(); bx.setLineDash([]);
  { const k = K(0, 1.0); bx.save(); bx.beginPath(); bx.rect(0, 0, 100 + 880 * k, H); bx.clip(); bx.font = '900 112px NotoSerif'; bx.fillText('SHERRY-', 100, 320); bx.fillText('DRIEHOEK', 100, 435); bx.restore(); }
  bx.globalCompositeOperation = 'source-over'; g.drawImage(blk, 0, 0);
  // de kleurplaat: oxblood alleen in de uitgesneden wind (gedrukt op wit, gloeit uit de snede)
  { const [c, x] = mk(); x.strokeStyle = V.ox2; x.lineCap = 'round'; winds().forEach((w, i) => { x.lineWidth = 14; smoothPoly(x, w); x.stroke(); if (windDone(i)) { arrowHead(x, w, 26); x.fillStyle = V.ox2; x.fill(); } }); g.drawImage(c, 2, 2); }
  for (const k in TOWN) { const t = TOWN[k], [x, y] = t.xy; g.globalAlpha = K(TOWN_T[k] + .2, TOWN_T[k] + .6); text(t.n, x + t.side * 34, y + (k === 'j' ? 18 : -24), { size: 50, col: '#f3ecdf', align: t.side > 0 ? 'left' : 'right', sp: 2 }); g.globalAlpha = 1; }
  g.globalAlpha = K(3.8, 4.4); text('PONIENTE', MX + 50, MY + 100, { size: 56, col: '#f3ecdf', sp: 6 }); g.globalAlpha = 1;
  { const s = subNow(), a = subA(); if (s && a > 0) { g.save(); g.globalAlpha = a; g.font = '700 54px Grotesk'; g.fillStyle = V.ink; wrapTo(g, s, 70, 1420, 860, 66); g.restore(); } }
}
function insideAlb(x, y) { const P = ALB.map(([a, b]) => ll(a, b)); let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { if (((P[i][1] > y) !== (P[j][1] > y)) && (x < (P[j][0] - P[i][0]) * (y - P[i][1]) / (P[j][1] - P[i][1]) + P[i][0])) c = !c; } return c; }

// ======================= 6. FLAT EXPLAINER: platte vormen op donker wijnrood =======================
function flat() {
  g.fillStyle = V.dark; g.fillRect(0, 0, W, H);
  // glow-ringen rond de driehoek, hard begrensd
  const cx = (TOWN.s.xy[0] + TOWN.j.xy[0] + TOWN.p.xy[0]) / 3, cy = (TOWN.s.xy[1] + TOWN.j.xy[1] + TOWN.p.xy[1]) / 3;
  for (const [r, c] of [[420, '#4a0616'], [300, '#5a0b1d'], [190, '#6b1226']]) { g.fillStyle = c; g.beginPath(); g.arc(cx, cy, r, 0, 7); g.fill(); }
  // land: één platte vorm met één schaduwstap (sikkel rechtsonder)
  const land = landMask(1);
  fillThrough(land, '#d9c3a0'); { const [c, x] = mk(); x.drawImage(land, -14, -10); x.globalCompositeOperation = 'source-in'; x.fillStyle = '#f3e6d0'; x.fillRect(0, 0, W, H); x.globalCompositeOperation = 'destination-in'; x.drawImage(land, 0, 0); g.drawImage(c, 0, 0); }
  g.fillStyle = V.paper; smoothPoly(g, ALB.map(([a, b]) => ll(a, b))); g.closePath(); g.fill(); g.strokeStyle = '#d9c3a0'; g.lineWidth = 3; g.stroke();
  // sterren-stippen in de zee (oceaan = de grond zelf)
  for (let i = 0; i < 90; i++) { const x = MX + rnd() * MW * .55, y = MY + rnd() * MH; g.fillStyle = ['#7a2a3a', '#a2525c', '#C9A227'][i % 3]; g.beginPath(); g.arc(x, y, 2 + (i % 3), 0, 7); g.fill(); }
  // de wind: goud, want goud betekent hier "kijk"
  g.strokeStyle = V.gold; g.lineCap = 'round'; g.lineWidth = 8; winds().forEach((w, i) => { smoothPoly(g, w); g.stroke(); if (windDone(i)) { arrowHead(g, w, 26); g.fillStyle = V.gold; g.fill(); } });
  g.strokeStyle = V.ox2; g.lineWidth = 6; triPath(g); g.stroke();
  for (const k in TOWN) { const t = TOWN[k], [x, y] = t.xy, p = pop(k); if (p <= 0) continue; g.fillStyle = V.ox2; g.beginPath(); g.arc(x, y, 28 * p, 0, 7); g.fill(); g.fillStyle = V.paper; g.beginPath(); g.arc(x, y, 13 * p, 0, 7); g.fill();
    g.globalAlpha = K(TOWN_T[k] + .2, TOWN_T[k] + .6); text(t.n, x + t.side * 40, y + (k === 'j' ? 18 : -28), { size: 50, col: t.side < 0 ? V.paper : V.ink, align: t.side > 0 ? 'left' : 'right', sp: 2 }); g.globalAlpha = 1; }
  g.globalAlpha = K(2.6, 3.2); text('ALBARIZA', ll(-6.24, 36.84)[0], ll(-6.24, 36.84)[1], { size: 46, col: V.ink, sp: 3 });
  g.globalAlpha = K(3.8, 4.4); text('PONIENTE', MX + 30, MY + 100, { size: 56, col: V.gold, sp: 6 }); g.globalAlpha = 1;
  { const dy = 40 * (1 - K(0, .8)); g.globalAlpha = K(0, .6); text('SHERRY-', 70, 300 + dy, { f: 'NotoSerif', w: 900, size: 110, col: V.paper }); g.globalAlpha = K(.3, .9); text('DRIEHOEK', 70, 415 + dy, { f: 'NotoSerif', w: 900, size: 110, col: V.gold }); g.globalAlpha = 1; }
  caption('#4a0616', V.paper, V.gold);
}


// ======================= 7. WIJNVLEK: de kaart in wijn op papier =======================
function stain() {
  paperTex('#fbf6ee');
  const land = landMask(4);
  // glasringen: onregelmatige, half opgedroogde kringen
  const ring = (x, y, r, a0, a1, al) => { for (let k = 0; k < 6; k++) { g.strokeStyle = `rgba(122,10,30,${al * (.4 + rnd() * .5)})`; g.lineWidth = 6 + rnd() * 8; g.beginPath(); g.arc(x + rnd() * 3, y + rnd() * 3, r + rnd() * 4, a0 + rnd() * .2, a1 - rnd() * .2); g.stroke(); } };
  g.globalAlpha = K(0, .8); ring(820, 330, 150, -.3, 4.6, .22); ring(240, 1180, 170, 1.2, 6.8, .14); g.globalAlpha = 1;
  // land: een wijnvlek met donkerder opgedroogde rand
  { const [c, x] = mk(); x.drawImage(land, 0, 0); x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgba(139,0,24,.30)'; x.fillRect(0, 0, W, H); g.globalAlpha = K(.3, 1.4); g.drawImage(c, 0, 0); g.globalAlpha = 1; }
  g.save(); g.globalAlpha = .55 * K(.3, 1.4); g.filter = 'blur(1.5px)'; g.strokeStyle = '#6a0014'; g.lineWidth = 7; for (const p of coastPts) { smoothPoly(g, wob(p, 2.2)); g.stroke(); } g.restore();
  // albariza: uitgespaard papier, met een zachte natte rand
  g.save(); g.fillStyle = '#fbf6ee'; g.filter = 'blur(3px)'; smoothPoly(g, ALB.map(([a, b]) => ll(a, b))); g.closePath(); g.fill(); g.restore();
  // wind: druppelsporen, wijn met de vinger getrokken
  winds().forEach((w, i) => { g.strokeStyle = 'rgba(139,0,24,.5)'; g.lineCap = 'round'; g.lineWidth = 11; smoothPoly(g, wob(w, 2, i)); g.stroke(); g.lineWidth = 4; g.strokeStyle = 'rgba(90,0,16,.55)'; smoothPoly(g, wob(w, 1, i + 3)); g.stroke();
    if (windDone(i)) { const [x, y] = w.at(-1); g.fillStyle = 'rgba(110,0,20,.75)'; g.beginPath(); g.ellipse(x + 8, y, 16, 12, 0, 0, 7); g.fill(); } });
  g.strokeStyle = 'rgba(30,27,21,.75)'; g.lineWidth = 3; g.setLineDash([4, 10]); triPath(g); g.stroke(); g.setLineDash([]);
  for (const k in TOWN) { const t = TOWN[k], [x, y] = t.xy, p = pop(k); if (p <= 0) continue; g.fillStyle = 'rgba(100,0,18,.85)'; g.beginPath(); g.ellipse(x, y, 16 * p, 14 * p, .4, 0, 7); g.fill(); g.fillStyle = 'rgba(160,30,50,.6)'; g.beginPath(); g.arc(x - 4, y - 4, 6 * p, 0, 7); g.fill();
    g.globalAlpha = K(TOWN_T[k] + .2, TOWN_T[k] + .6); text(t.n, x + t.side * 34, y + (k === 'j' ? 18 : -26), { size: 50, col: V.ink, align: t.side > 0 ? 'left' : 'right', sp: 2 }); g.globalAlpha = 1; }
  g.globalAlpha = K(2.6, 3.2); text('ALBARIZA', ll(-6.24, 36.84)[0], ll(-6.24, 36.84)[1], { size: 46, col: V.ox, sp: 3 });
  g.globalAlpha = K(3.8, 4.4); text('PONIENTE', MX + 30, MY + 100, { size: 56, col: V.ox, sp: 6 }); g.globalAlpha = 1;
  { const a = K(0, .8); g.globalAlpha = a; text('SHERRY-', 70, 300, { f: 'NotoSerif', w: 900, size: 110, col: V.ox }); text('DRIEHOEK', 70, 415, { f: 'NotoSerif', w: 900, size: 110, col: V.ox }); g.globalAlpha = 1; }
  { const s = subNow(), a = subA(); if (s && a > 0) { g.save(); g.globalAlpha = a; g.font = '700 54px Grotesk'; g.fillStyle = V.ink; wrapTo(g, s, 90, 1350, 860, 68); g.restore(); } }
}

// ======================= 8. ETIKET: het hele beeld is een wijnetiket, letterpress + goudfolie =======================
function label() {
  g.fillStyle = '#2b0a10'; g.fillRect(0, 0, W, H);                       // de fles: diep wijnrood glas
  const L = [70, 160, 940, 1210];
  g.save(); g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = 30; g.shadowOffsetY = 12; g.fillStyle = '#f4ead6'; g.fillRect(...L); g.restore();
  { const id = g.getImageData(L[0], L[1], L[2], L[3]), d = id.data; for (let i = 0; i < d.length; i += 4) { const n = (rnd() - .5) * 10; d[i] += n; d[i + 1] += n; d[i + 2] += n; } g.putImageData(id, L[0], L[1]); }
  // dubbele lijst, goud en oxblood
  g.strokeStyle = V.gold; g.lineWidth = 6; g.strokeRect(L[0] + 24, L[1] + 24, L[2] - 48, L[3] - 48); g.strokeStyle = V.ox; g.lineWidth = 2; g.strokeRect(L[0] + 40, L[1] + 40, L[2] - 80, L[3] - 80);
  // titel in letterpress: lichte inslag (lichte rand onder, donkere boven)
  const lp = (str, y, size, col) => { g.save(); g.font = `900 ${size}px NotoSerif`; g.textAlign = 'center'; g.letterSpacing = '4px'; g.fillStyle = 'rgba(255,255,255,.7)'; g.fillText(str, W / 2, y + 2); g.fillStyle = 'rgba(60,20,10,.35)'; g.fillText(str, W / 2, y - 2); g.fillStyle = col; g.fillText(str, W / 2, y); g.restore(); };
  g.globalAlpha = K(0, .8); lp('SHERRY-DRIEHOEK', 300, 68, V.ox);
  g.save(); g.font = '700 34px Grotesk'; g.textAlign = 'center'; g.letterSpacing = '8px'; g.fillStyle = V.gold; g.fillText('MARCO DE JEREZ · ANDALUCÍA', W / 2, 355); g.restore(); g.globalAlpha = 1;
  // medaillon met de kaart als gravure
  const cx = W / 2, cy = 735, rx = 340, ry = 340;
  g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.clip();
  g.fillStyle = '#efe2c8'; g.fillRect(0, 0, W, H);
  const sc = .8, ox = cx - (MX + MW / 2) * sc, oy = cy - (MY + MH / 2) * sc; g.translate(ox, oy); g.scale(sc, sc);
  const land = landMask(1);
  { const [c, x] = mk(); x.strokeStyle = 'rgba(80,40,30,.55)'; x.lineWidth = 1.6; for (let y = MY; y < MY + MH; y += 9) { x.beginPath(); x.moveTo(MX, y); for (let xx = MX; xx < MX + MW; xx += 20) x.lineTo(xx, y + Math.sin(xx * .03 + y) * 1.5); x.stroke(); }
    x.globalCompositeOperation = 'destination-out'; x.drawImage(land, 0, 0); g.drawImage(c, 0, 0); }
  g.strokeStyle = '#4a2a20'; g.lineWidth = 3; for (const p of coastPts) { smoothPoly(g, p); g.stroke(); }
  g.fillStyle = '#fffaf0'; smoothPoly(g, ALB.map(([a, b]) => ll(a, b))); g.closePath(); g.fill(); g.strokeStyle = V.gold; g.lineWidth = 2; g.stroke();
  g.strokeStyle = V.gold; g.lineCap = 'round'; g.lineWidth = 6; winds().forEach((w, i) => { smoothPoly(g, w); g.stroke(); if (windDone(i)) { arrowHead(g, w, 22); g.fillStyle = V.gold; g.fill(); } });
  g.strokeStyle = V.ox; g.lineWidth = 4; g.setLineDash([12, 9]); triPath(g); g.stroke(); g.setLineDash([]);
  for (const k in TOWN) { const [x, y] = TOWN[k].xy, p = pop(k); if (p > 0) starburst(x, y, 20 * p, 5, V.ox); }
  g.restore();
  g.strokeStyle = V.gold; g.lineWidth = 6; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.stroke(); g.strokeStyle = V.ox; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, rx + 14, ry + 14, 0, 0, 7); g.stroke();
  // plaatsnamen in een rij onder het medaillon, groot genoeg voor een telefoon
  const names = [['s', 'SANLÚCAR'], ['j', 'JEREZ'], ['p', 'EL PUERTO']];
  names.forEach(([k, n], i) => { g.globalAlpha = K(TOWN_T[k] + .2, TOWN_T[k] + .6); g.save(); g.font = '700 46px Grotesk'; g.textAlign = 'center'; g.letterSpacing = '3px'; g.fillStyle = V.ink; g.fillText(n, W / 2 + (i - 1) * 300, 1170); g.restore(); g.globalAlpha = 1; });
  g.globalAlpha = K(3.8, 4.4); g.save(); g.font = '700 40px Grotesk'; g.textAlign = 'center'; g.letterSpacing = '6px'; g.fillStyle = V.gold; g.fillText('PONIENTE UIT HET WESTEN', W / 2, 1240); g.restore(); g.globalAlpha = 1;
  { const s = subNow(), a = subA(); if (s && a > 0) { g.save(); g.globalAlpha = a; g.font = '700 50px Grotesk'; g.fillStyle = '#f4ead6'; wrapTo(g, s, 80, 1440, 860, 62); g.restore(); } }
}

// ======================= 9. KRIJT OP HET VAT: zoals de bodega's in Jerez op hun vaten schrijven =======================
function chalk() {
  // zwarte eiken duigen met een ijzeren hoepel
  for (let i = 0; i < 9; i++) { const x = i * 120; g.fillStyle = i % 2 ? '#1d1714' : '#211a16'; g.fillRect(x, 0, 120, H); g.strokeStyle = 'rgba(0,0,0,.6)'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
    g.strokeStyle = 'rgba(255,255,255,.025)'; g.lineWidth = 1; for (let k = 0; k < 14; k++) { g.beginPath(); g.moveTo(x + 10 + k * 7, 0); g.bezierCurveTo(x + 14 + k * 7, H * .3, x + 4 + k * 7, H * .7, x + 10 + k * 7, H); g.stroke(); } }
  for (const y of [120, 1560]) { g.fillStyle = '#3a3633'; g.fillRect(0, y, W, 46); g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(0, y + 4, W, 6); for (let x = 30; x < W; x += 140) { g.fillStyle = '#55504b'; g.beginPath(); g.arc(x, y + 23, 6, 0, 7); g.fill(); } }
  // krijt: elke streek een paar keer met korrel
  const chalkLine = (pts, w, col = 'rgba(245,240,230,', a = .85) => { for (let k = 0; k < 4; k++) { g.strokeStyle = `${col}${a * (.35 + rnd() * .3)})`; g.lineWidth = w * (.6 + rnd() * .6); g.lineCap = 'round'; smoothPoly(g, wob(pts, 1.6, k * 2 + 1)); g.stroke(); } };
  const land = landMask(1);
  { const [c, x] = mk(); for (let i = 0; i < 9000; i++) { const px = MX + rnd() * MW, py = MY + rnd() * MH; x.fillStyle = `rgba(240,235,225,${.08 + rnd() * .1})`; x.fillRect(px, py, 2 + rnd() * 3, 1 + rnd() * 2); } x.globalCompositeOperation = 'destination-in'; x.drawImage(land, 0, 0); g.globalAlpha = K(.3, 1.4); g.drawImage(c, 0, 0); g.globalAlpha = 1; }
  for (const p of coastPts) chalkLine(p, 5);
  { const A = ALB.map(([a, b]) => ll(a, b)); const [c, x] = mk(); x.fillStyle = 'rgba(250,248,240,.55)'; smoothPoly(x, A); x.closePath(); x.fill(); g.globalAlpha = K(2.6, 3.2); g.drawImage(c, 0, 0); g.globalAlpha = 1; }
  winds().forEach((w, i) => { chalkLine(w, 9, 'rgba(214,72,84,', .95); if (windDone(i)) { arrowHead(g, w, 28); g.fillStyle = 'rgba(214,72,84,.85)'; g.fill(); } });
  g.setLineDash([16, 14]); chalkLine([...triPts, triPts[0]].slice(0, 1 + Math.ceil(3 * K(2.4, 3.4))), 4); g.setLineDash([]);
  for (const k in TOWN) { const t = TOWN[k], [x, y] = t.xy, p = pop(k); if (p <= 0) continue; g.fillStyle = 'rgba(245,240,230,.9)'; g.beginPath(); g.arc(x, y, 12 * p, 0, 7); g.fill();
    g.globalAlpha = K(TOWN_T[k] + .2, TOWN_T[k] + .6); text(t.n === 'EL PUERTO' ? 'El Puerto' : t.n === 'SANLÚCAR' ? 'Sanlúcar' : 'Jerez', x + t.side * 30, y + (k === 'j' ? 24 : -16), { f: 'Caveat', w: 600, size: 76, col: 'rgba(245,240,230,.92)', align: t.side > 0 ? 'left' : 'right' }); g.globalAlpha = 1; }
  g.globalAlpha = K(2.6, 3.2); text('albariza', ll(-6.22, 36.84)[0], ll(-6.22, 36.84)[1], { f: 'Caveat', w: 600, size: 62, col: 'rgba(245,240,230,.85)' });
  g.globalAlpha = K(3.8, 4.4); text('poniente →', MX + 30, MY + 100, { f: 'Caveat', w: 600, size: 80, col: 'rgba(214,72,84,.95)' }); g.globalAlpha = 1;
  { const k = K(0, 1.1); g.save(); g.beginPath(); g.rect(0, 0, 70 + 960 * k, 480); g.clip(); text('Sherry-driehoek', 70, 340, { f: 'Caveat', w: 600, size: 150, col: 'rgba(245,240,230,.95)' }); text('MARCO DE JEREZ', 78, 420, { size: 40, col: 'rgba(245,240,230,.6)', sp: 8 }); g.restore(); }
  { const s = subNow(), a = subA(); if (s && a > 0) { g.save(); g.globalAlpha = a; g.font = '600 68px Caveat'; g.fillStyle = 'rgba(245,240,230,.95)'; wrapTo(g, s, 90, 1350, 860, 74); g.restore(); } }
}

// ======================= 10. NEON-WIJNBAR: neonbuizen in oxblood en goud op een donkere muur =======================
function neon() {
  g.fillStyle = '#140a0c'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 60) for (let x = (y / 60) % 2 ? -60 : 0; x < W; x += 120) { g.fillStyle = (Math.floor(x / 120 + y / 60) % 3) ? '#1b0e11' : '#1f1013'; g.fillRect(x + 3, y + 3, 114, 54); }
  const flick = (t0) => { const k = K(t0, t0 + .5); return k < 1 && Math.floor(T * 30) % 3 === 0 ? k * .4 : k; };
  const tube = (draw, col, glow, a = 1) => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.lineCap = 'round'; g.lineJoin = 'round';
    for (const [w, b, al] of [[22, 40, .35], [10, 16, .7], [4, 0, 1]]) { g.shadowColor = glow; g.shadowBlur = b; g.strokeStyle = al < 1 ? glow : col; g.globalAlpha = a * al; g.lineWidth = w; draw(); g.stroke(); } g.restore(); };
  const neonText = (s, x, y, size, col, glow, f = 'Grotesk', w = 700, a = 1, al = 'left') => { if (a <= 0) return; g.save(); g.font = `${w} ${size}px ${f}`; g.textAlign = al; g.globalAlpha = a; g.shadowColor = glow; for (const b of [30, 12]) { g.shadowBlur = b; g.fillStyle = glow; g.fillText(s, x, y); } g.shadowBlur = 4; g.fillStyle = col; g.fillText(s, x, y); g.restore(); };
  const GOLD = '#ffe9a8', GOLDG = '#e0b53a', RED = '#ffd0d6', REDG = '#ff2e4a';
  for (const p of coastPts) tube(() => smoothPoly(g, p), GOLD, GOLDG, flick(.4));
  tube(() => { smoothPoly(g, ALB.map(([a, b]) => ll(a, b))); g.closePath(); }, '#fff7ea', '#ffffff', flick(2.6) * .8);
  winds().forEach((w, i) => tube(() => smoothPoly(g, w), RED, REDG, 1));
  tube(() => triPath(g), GOLD, GOLDG, K(2.4, 2.6));
  for (const k in TOWN) { const t = TOWN[k], [x, y] = t.xy; const a = flick(TOWN_T[k]); tube(() => { g.beginPath(); g.arc(x, y, 14, 0, 7); }, RED, REDG, a);
    neonText(t.n, x + t.side * 36, y + (k === 'j' ? 18 : -26), 50, '#fff3f4', REDG, 'Grotesk', 700, a, t.side > 0 ? 'left' : 'right'); }
  neonText('ALBARIZA', ll(-6.24, 36.84)[0], ll(-6.24, 36.84)[1], 46, '#ffffff', '#ffffff', 'Grotesk', 700, flick(2.6));
  neonText('poniente', MX + 30, MY + 110, 84, '#ffe1e5', REDG, 'Caveat', 600, flick(3.8));
  neonText('Sherry-', 70, 300, 140, '#fff3d0', GOLDG, 'Caveat', 600, flick(0)); neonText('driehoek', 260, 430, 140, '#fff3d0', GOLDG, 'Caveat', 600, flick(.3));
  { const s = subNow(), a = subA(); if (s && a > 0) { g.save(); g.globalAlpha = a * .85; g.fillStyle = '#0c0607'; g.fillRect(60, 1272, 960, 240); g.restore(); g.save(); g.globalAlpha = a; g.font = '700 54px Grotesk'; g.fillStyle = '#fff3f4'; wrapTo(g, s, 100, 1340, 840, 68); g.restore(); } }
}

// ======================= F2. ETIKET in VinoVonk-huisstijl: oxblood achtergrond, papieren etiket, brutalistische rand, één middenas =======================
function label2() {
  g.fillStyle = V.ox; g.fillRect(0, 0, W, H);
  const L = { x: 90, y: 240, w: 900, h: 1030 }, CX = L.x + L.w / 2;          // alles centreert op CX
  g.fillStyle = '#000'; g.fillRect(L.x + 12, L.y + 12, L.w, L.h);              // harde schaduw, geen blur
  g.fillStyle = V.paper; g.fillRect(L.x, L.y, L.w, L.h); g.strokeStyle = V.ink; g.lineWidth = 4; g.strokeRect(L.x, L.y, L.w, L.h);
  g.strokeStyle = V.ox; g.lineWidth = 2; g.strokeRect(L.x + 22, L.y + 22, L.w - 44, L.h - 44);
  const ctext = (str, y, font, col, sp = 0, a = 1) => { if (a <= 0) return; g.save(); g.globalAlpha = a; g.font = font; g.textAlign = 'center'; g.letterSpacing = sp + 'px'; g.fillStyle = col; g.fillText(str, CX, y); g.restore(); };
  const ta = K(0, .8);
  ctext('MARCO DE JEREZ', L.y + 110, '700 34px Grotesk', V.gold, 10, ta);                     // eyebrow: de enige plek voor goud
  ctext('SHERRY-DRIEHOEK', L.y + 200, '900 74px NotoSerif', V.ox, 2, ta);
  g.globalAlpha = ta; g.fillStyle = V.ink; g.fillRect(CX - 60, L.y + 232, 120, 4); g.globalAlpha = 1;
  // medaillon: de kaart als gravure, in inkt en oxblood
  const cy = L.y + 530, r = 280;
  g.save(); g.beginPath(); g.arc(CX, cy, r, 0, 7); g.clip(); g.fillStyle = '#f6ecdc'; g.fillRect(CX - r, cy - r, 2 * r, 2 * r);
  const sc = .65, ox = CX - (MX + MW * .56) * sc, oy = cy - (MY + MH / 2) * sc; g.translate(ox, oy); g.scale(sc, sc);
  const land = landMask(1);
  { const [c, x] = mk(); x.strokeStyle = 'rgba(30,27,21,.55)'; x.lineWidth = 1.8; for (let y = MY - 200; y < MY + MH + 200; y += 10) { x.beginPath(); x.moveTo(MX - 200, y); x.lineTo(MX + MW + 200, y); x.stroke(); }
    x.globalCompositeOperation = 'destination-out'; x.drawImage(land, 0, 0); g.drawImage(c, 0, 0); }
  g.strokeStyle = V.ink; g.lineWidth = 3.5; for (const p of coastPts) { smoothPoly(g, p); g.stroke(); }
  g.fillStyle = V.paper; smoothPoly(g, ALB.map(([a, b]) => ll(a, b))); g.closePath(); g.fill(); g.strokeStyle = V.ink; g.lineWidth = 2; g.stroke();
  g.strokeStyle = V.ox; g.lineCap = 'round'; g.lineWidth = 9; winds().forEach((w, i) => { smoothPoly(g, w); g.stroke(); if (windDone(i)) { arrowHead(g, w, 26); g.fillStyle = V.ox; g.fill(); } });
  g.strokeStyle = V.ink; g.lineWidth = 4; g.setLineDash([14, 10]); triPath(g); g.stroke(); g.setLineDash([]);
  for (const k in TOWN) { const [x, y] = TOWN[k].xy, p = pop(k); if (p > 0) { g.fillStyle = V.ox; g.fillRect(x - 13 * p, y - 13 * p, 26 * p, 26 * p); g.strokeStyle = V.ink; g.lineWidth = 3; g.strokeRect(x - 13 * p, y - 13 * p, 26 * p, 26 * p); } }
  g.restore();
  g.strokeStyle = V.ink; g.lineWidth = 4; g.beginPath(); g.arc(CX, cy, r, 0, 7); g.stroke(); g.strokeStyle = V.ox; g.lineWidth = 2; g.beginPath(); g.arc(CX, cy, r + 14, 0, 7); g.stroke();
  // plaatsnamen: drie gelijke kolommen onder het medaillon, elk gecentreerd in zijn kolom
  const col = (L.w - 44) / 3, y0 = cy + r + 80;
  [['s', 'SANLÚCAR'], ['j', 'JEREZ'], ['p', 'EL PUERTO']].forEach(([k, n], i) => { const x = L.x + 22 + col * (i + .5), a = K(TOWN_T[k] + .2, TOWN_T[k] + .6); if (a <= 0) return;
    g.save(); g.globalAlpha = a; g.font = '700 46px Grotesk'; g.textAlign = 'center'; g.letterSpacing = '2px'; g.fillStyle = V.ink; g.fillText(n, x, y0); g.restore(); });
  ctext('POniente'.toUpperCase() + ' · UIT HET WESTEN', y0 + 70, '700 36px Grotesk', V.ox, 5, K(3.8, 4.4));
  // ondertitel: op dezelfde middenas, in een papieren kaart met dezelfde breedte als het etiket
  const s = subNow(), a = subA();
  if (s && a > 0) { g.save(); g.globalAlpha = a; g.font = '700 46px Grotesk'; const lines = wrapLines(s, L.w - 60); const bh = 44 + lines.length * 58, by = 1305;
    g.fillStyle = '#000'; g.fillRect(L.x + 8, by + 8, L.w, bh); g.fillStyle = V.paper; g.fillRect(L.x, by, L.w, bh); g.strokeStyle = V.ink; g.lineWidth = 4; g.strokeRect(L.x, by, L.w, bh);
    g.fillStyle = V.ink; g.textAlign = 'center'; lines.forEach((l, i) => g.fillText(l, CX, by + 62 + i * 58)); g.restore(); }
}
function wrapLines(s, max) { const out = ['']; for (const w of s.split(' ')) { const t = out.at(-1) ? out.at(-1) + ' ' + w : w; if (g.measureText(t).width > max && out.at(-1)) out.push(w); else out[out.length - 1] = t; } return out; }

// ======================= G2. KRIJT in VinoVonk-stijl: papieren pagina, wijnrood krijtbord met brutalistische rand =======================
function chalk2() {
  g.fillStyle = V.paper; g.fillRect(0, 0, W, H);
  const B = { x: 60, y: 470, w: 960, h: 860 };
  g.fillStyle = '#000'; g.fillRect(B.x + 12, B.y + 12, B.w, B.h);
  g.fillStyle = V.dark; g.fillRect(B.x, B.y, B.w, B.h);
  { const id = g.getImageData(B.x, B.y, B.w, B.h), d = id.data; for (let i = 0; i < d.length; i += 4) { const n = (rnd() - .5) * 8; d[i] += n; d[i + 1] += n * .6; d[i + 2] += n * .6; } g.putImageData(id, B.x, B.y); }   // bordkorrel
  g.save(); g.globalAlpha = .06; g.fillStyle = '#fff'; for (let i = 0; i < 7; i++) { g.beginPath(); g.ellipse(B.x + 120 + i * 130, B.y + 200 + (i % 3) * 230, 130, 40, -.3, 0, 7); g.fill(); } g.restore();   // vage veegsporen
  g.strokeStyle = V.ink; g.lineWidth = 4; g.strokeRect(B.x, B.y, B.w, B.h);
  g.save(); g.beginPath(); g.rect(B.x + 4, B.y + 4, B.w - 8, B.h - 8); g.clip();
  const sc = .92, ox = B.x + B.w / 2 - (MX + MW / 2) * sc, oy = B.y + B.h / 2 + 20 - (MY + MH / 2) * sc; g.translate(ox, oy); g.scale(sc, sc);
  const CR = 'rgba(255,248,240,', GD = 'rgba(214,176,58,';
  const chalkLine = (pts, w, col = CR, a = .9) => { for (let k = 0; k < 4; k++) { g.strokeStyle = `${col}${a * (.35 + rnd() * .3)})`; g.lineWidth = w * (.6 + rnd() * .6); g.lineCap = 'round'; smoothPoly(g, wob(pts, 1.6, k * 2 + 1)); g.stroke(); } };
  const land = landMask(1);
  { const [c, x] = mk(); for (let i = 0; i < 9000; i++) { const px = MX + rnd() * MW, py = MY + rnd() * MH; x.fillStyle = `rgba(255,248,240,${.07 + rnd() * .09})`; x.fillRect(px, py, 2 + rnd() * 3, 1 + rnd() * 2); } x.globalCompositeOperation = 'destination-in'; x.drawImage(land, 0, 0); g.globalAlpha = K(.3, 1.4); g.drawImage(c, 0, 0); g.globalAlpha = 1; }
  for (const p of coastPts) chalkLine(p, 5);
  { const [c, x] = mk(); x.fillStyle = 'rgba(255,248,240,.6)'; smoothPoly(x, ALB.map(([a, b]) => ll(a, b))); x.closePath(); x.fill(); g.globalAlpha = K(2.6, 3.2); g.drawImage(c, 0, 0); g.globalAlpha = 1; }
  winds().forEach((w, i) => { chalkLine(w, 10, GD, .95); if (windDone(i)) { arrowHead(g, w, 28); g.fillStyle = 'rgba(214,176,58,.9)'; g.fill(); } });
  g.setLineDash([16, 14]); chalkLine([...triPts, triPts[0]].slice(0, 1 + Math.ceil(3 * K(2.4, 3.4))), 4); g.setLineDash([]);
  for (const k in TOWN) { const t = TOWN[k], [x, y] = t.xy, p = pop(k); if (p <= 0) continue; g.fillStyle = 'rgba(255,248,240,.92)'; g.beginPath(); g.arc(x, y, 12 * p, 0, 7); g.fill();
    g.globalAlpha = K(TOWN_T[k] + .2, TOWN_T[k] + .6); text(t.n === 'EL PUERTO' ? 'El Puerto' : t.n === 'SANLÚCAR' ? 'Sanlúcar' : 'Jerez', x + t.side * 30, y + (k === 'j' ? 26 : -16), { f: 'Caveat', w: 600, size: 78, col: 'rgba(255,248,240,.95)', align: t.side > 0 ? 'left' : 'right' }); g.globalAlpha = 1; }
  g.globalAlpha = K(2.6, 3.2); text('albariza', ll(-6.22, 36.84)[0], ll(-6.22, 36.84)[1], { f: 'Caveat', w: 600, size: 64, col: 'rgba(255,248,240,.85)' });
  g.globalAlpha = K(3.8, 4.4); text('poniente →', MX + 30, MY + 100, { f: 'Caveat', w: 600, size: 84, col: 'rgba(214,176,58,.98)' }); g.globalAlpha = 1;
  g.restore();
  // titel en ondertitel in de huisstijl, op dezelfde linkermarge als het bord
  { const k = K(0, .8), dy = 30 * (1 - k); g.globalAlpha = k; text('MARCO DE JEREZ', B.x, 250 + dy, { size: 34, col: V.gold, sp: 10 }); text('SHERRY-', B.x - 4, 350 + dy, { f: 'NotoSerif', w: 900, size: 104, col: V.ox }); text('DRIEHOEK', B.x - 4, 440 + dy, { f: 'NotoSerif', w: 900, size: 104, col: V.ox }); g.globalAlpha = 1; }
  { const s = subNow(), a = subA(); if (s && a > 0) { g.save(); g.globalAlpha = a; g.font = '700 50px Grotesk'; g.fillStyle = V.ink; wrapTo(g, s, B.x, 1405, B.w - 60, 60); g.restore(); } }
}

// ======================= I. VINOVONK-ILLUSTRATIE: de hero komt tot leven (inkt, halftoon, oker/sienna) + carousel-typografie =======================
function illu() {
  const INK = '#1e1b15', OCH = '#c98a2e', SIE = '#9a4e1c', CRE = '#f3e8d2', WHT = '#fbf7ee';
  paperTex(CRE);
  // gescheurde oker- en siennavlakken achter de kaart, zoals in de hero
  const blob = (pts, col, a = 1) => { g.save(); g.globalAlpha = a; g.fillStyle = col; smoothPoly(g, wob(pts, 10, pts.length)); g.closePath(); g.fill(); g.restore(); };
  g.save(); g.translate(-120 * (1 - K(0, .9)), 0); blob([[0, 520], [380, 470], [520, 640], [300, 900], [0, 960]], OCH, .85); g.restore();
  g.save(); g.translate(120 * (1 - K(.1, 1.0)), 0); blob([[1080, 560], [760, 600], [700, 820], [900, 1060], [1080, 1080]], SIE, .75); g.restore();
  blob([[120, 1180], [560, 1120], [980, 1210], [900, 1330], [160, 1340]], OCH, .55);
  // sierring van Moorse tegels in sienna, half achter de kaart
  g.save(); g.strokeStyle = SIE; g.lineWidth = 6; g.globalAlpha = .55; for (const r of [250, 215]) { g.beginPath(); g.arc(1040, 1300, r, Math.PI * .95, Math.PI * 1.55); g.stroke(); }
  for (let a = .95; a < 1.55; a += .06) { const x = 1040 + Math.cos(a * Math.PI) * 232, y = 1300 + Math.sin(a * Math.PI) * 232; g.beginPath(); g.arc(x, y, 9, 0, 7); g.stroke(); } g.restore();
  const MAP = mk(), mg = MAP[1], G0 = g; g = mg;      // kaartlaag apart, straks met een gescheurde rand op de pagina
  g.fillStyle = '#efe0c2'; g.fillRect(0, 0, W, H);
  const land = landMask(1.5);
  // zee: crème met siennakleurige halftoon die dichter wordt naar de kust
  { const [c, x] = mk(); const gr = x.createLinearGradient(MX, 0, MX + MW * .6, 0); gr.addColorStop(0, 'rgb(18,18,18)'); gr.addColorStop(1, 'rgb(95,95,95)'); x.fillStyle = gr; x.fillRect(MX, MY, MW, MH); x.globalCompositeOperation = 'destination-out'; x.drawImage(land, 0, 0);
    g.save(); g.globalAlpha = K(.9, 1.9); screenInk(x, 'rgb(154,78,28)', 30, 9); g.restore(); }
  // land: warm wit met inktarcering langs de kust (schaduwkant)
  g.save(); g.globalAlpha = K(.6, 1.4); fillThrough(land, WHT); g.restore();
  { const [c, x] = mk(); x.strokeStyle = 'rgba(30,27,21,.55)'; x.lineWidth = 2; for (let k = -MH; k < MW; k += 9) { x.beginPath(); x.moveTo(MX + k, MY + MH); x.lineTo(MX + k + MH * .6, MY); x.stroke(); }
    x.globalCompositeOperation = 'destination-in'; x.drawImage(land, 0, 0); x.globalCompositeOperation = 'destination-out'; const sh = landMask(0); x.drawImage(sh, 26, 0); g.drawImage(c, 0, 0); }
  // inktkust, dik en met variatie
  g.strokeStyle = INK; g.lineCap = 'round'; g.lineJoin = 'round'; { const kc = K(.4, 1.8); for (const p of coastPts) { const n = Math.max(2, Math.round(p.length * kc)); if (kc <= 0) break; for (const [w, o] of [[7, 0], [2.5, 3]]) { g.lineWidth = w; smoothPoly(g, wob(p, .8, o).slice(0, n)); g.stroke(); } } }
  // albariza: heldere krijtheuvels met korte inktstreepjes
  { const A = ALB.map(([a, b]) => ll(a, b)); g.fillStyle = '#ffffff'; smoothPoly(g, A); g.closePath(); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke();
    for (let i = 0; i < 40; i++) { const [cx, cy] = ll(-6.20 + rnd() * .13, 36.71 + rnd() * .07); if (!insideAlb(cx, cy)) continue; g.lineWidth = 1.6; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 10, cy - 4); g.stroke(); } }
  // de poniente als rookwolken uit zee (zoals de rook in de hero): witte krullen met inktrand
  const puff = (x, y, r) => { const B = [[-.7, .15, .5], [-.25, -.2, .62], [.3, -.1, .55], [.72, .2, .42], [0, .25, .5]];
    g.save(); g.fillStyle = INK; for (const [u, v, q] of B) { g.beginPath(); g.arc(x + u * r, y + v * r, q * r + 4, 0, 7); g.fill(); }
    g.fillStyle = WHT; for (const [u, v, q] of B) { g.beginPath(); g.arc(x + u * r, y + v * r, q * r, 0, 7); g.fill(); }
    g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.arc(x - .2 * r, y - .1 * r, .3 * r, Math.PI * 1.05, Math.PI * 1.7); g.stroke(); g.restore(); };
  winds().forEach((w, i) => { g.strokeStyle = INK; g.lineWidth = 3; g.setLineDash([2, 10]); smoothPoly(g, w); g.stroke(); g.setLineDash([]); for (let j = 0; j < 2; j++) { const f = ((j / 2 + T * .06 + i * .17) % 1) * .5, idx = Math.floor(f * (WIND[i].length - 1)); if (idx < 2 || idx > w.length - 2) continue; puff(w[idx][0], w[idx][1], 36); } if (windDone(i)) { arrowHead(g, w, 22); g.fillStyle = INK; g.fill(); } });
  // steden: kleine stapels vaten, in inkt en sienna
  const barrels = (x, y, s) => { const bar = (bx, by) => { g.fillStyle = '#b5652a'; g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.ellipse(bx, by, 13 * s, 10 * s, 0, 0, 7); g.fill(); g.stroke(); g.beginPath(); g.ellipse(bx, by, 6 * s, 4.5 * s, 0, 0, 7); g.stroke(); };
    bar(x - 13 * s, y); bar(x + 13 * s, y); bar(x, y - 17 * s); };
  for (const k in TOWN) { const t = TOWN[k], [x, y] = t.xy, p = pop(k); if (p <= 0) continue; barrels(x, y - 60 * (1 - K(TOWN_T[k], TOWN_T[k] + .35)), 1.3 * Math.min(p, 1.08));
    g.globalAlpha = K(TOWN_T[k] + .2, TOWN_T[k] + .6); labelTag(t.n === 'EL PUERTO' ? 'El Puerto' : t.n === 'SANLÚCAR' ? 'Sanlúcar' : 'Jerez', x + t.side * 40, y + (k === 'p' ? 66 : k === 'j' ? -26 : -38), t.side); g.globalAlpha = 1; }
  g.strokeStyle = INK; g.lineWidth = 3; g.setLineDash([12, 9]); triPath(g); g.stroke(); g.setLineDash([]);
  g = G0;
  { const torn = []; const cx = MX + MW / 2, cy = MY + MH / 2; for (let i = 0; i < 90; i++) { const a = i / 90 * Math.PI * 2, rx = MW * .53, ry = MH * .56; const j = 1 + (rnd() - .5) * .05 + Math.sin(i * 1.7) * .015; torn.push([cx + Math.cos(a) * rx * j * Math.min(1, 1.18 / Math.max(Math.abs(Math.cos(a)), .85)), cy + Math.sin(a) * ry * j]); }
    const [c, x] = mk(); x.fillStyle = '#000'; poly(x, torn, true); x.fill(); x.globalCompositeOperation = 'source-in'; x.drawImage(MAP[0], 0, 0);
    const ka = K(0, .7), cxm = MX + MW / 2, cym = MY + MH / 2; g.save(); g.globalAlpha = ka; g.translate(cxm, cym + 50 * (1 - ka)); g.rotate((Math.sin(T * .8) * .25 - 2 * (1 - ka)) * Math.PI / 180); g.translate(-cxm, -cym);
    g.save(); g.fillStyle = 'rgba(30,27,21,.9)'; g.translate(8, 10); poly(g, torn, true); g.fill(); g.restore(); g.drawImage(c, 0, 0); g.strokeStyle = INK; g.lineWidth = 3; poly(g, torn, true); g.stroke(); g.restore(); }
  g.globalAlpha = K(2.6, 3.2); labelTag('albariza', ll(-6.21, 36.845)[0], ll(-6.21, 36.845)[1], 1); g.globalAlpha = K(3.8, 4.4); labelTag('poniente', MX + 20, MY + 70, 1); g.globalAlpha = 1;
  // typografie van de carousels: gouden eyebrow, Noto Serif in zinvorm, Space Grotesk, @vinovonk in de voet
  { const k = K(0, .8), dy = 24 * (1 - k); g.globalAlpha = k;
    text('VINOVONK', 72, 268 + dy, { size: 30, col: V.ox, sp: 6 });
    text('Twee winden,', 70, 356 + dy, { f: 'NotoSerif', w: 900, size: 84, col: INK }); text('één witte bodem', 70, 446 + dy, { f: 'NotoSerif', w: 900, size: 84, col: V.ox }); g.globalAlpha = 1; }
  { const s = subNow(), a = subA(); if (s && a > 0) { g.save(); g.globalAlpha = a; g.font = '500 48px Grotesk'; g.fillStyle = INK; wrapTo(g, s, 72, 1395, 900, 62); g.restore(); } }
  text('@vinovonk', 72, 1505, { size: 26, col: V.muted, w: 500 });
}
function labelTag(s, x, y, side) { g.save(); g.font = '700 46px Grotesk'; const w = g.measureText(s).width + 28, X = side > 0 ? x : x - w;
  g.fillStyle = '#1e1b15'; g.fillRect(X + 5, y - 40 + 5, w, 56); g.fillStyle = '#fbf7ee'; g.fillRect(X, y - 40, w, 56); g.strokeStyle = '#1e1b15'; g.lineWidth = 3; g.strokeRect(X, y - 40, w, 56);
  g.fillStyle = '#1e1b15'; g.fillText(s, X + 14, y + 4); g.restore(); }
function screenInk(P, ink, ang, period) {     // halftoon op het hoofdcanvas (zonder misregistratie), voor illustratieschaduw
  const src = P.getImageData(0, 0, W, H).data; g.save(); g.fillStyle = ink;
  const a = ang * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a), R = Math.hypot(W, H);
  for (let u = -R; u < R; u += period) for (let v = -R; v < R; v += period) { const px = W / 2 + u * ca - v * sa, py = H / 2 + u * sa + v * ca; if (px < 0 || py < 0 || px >= W || py >= H) continue;
    const i = ((py | 0) * W + (px | 0)) * 4, cov = src[i] / 255 * (src[i + 3] / 255); if (cov < .03) continue; g.beginPath(); g.arc(px, py, period * .5 * Math.sqrt(cov) * 1.1, 0, 7); g.fill(); }
  g.restore(); }

const R = { risograph, papercut, toon, watercolor, woodcut, flat, stain, label, chalk, neon, label2, chalk2, illu };
window.DUR = Q.has('clip') ? 12.6 : 1; window.EV = [];
window.render = t => { T = Q.has('clip') ? t : 99; SEED = 7; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g = cv.getContext("2d"); (R[STYLE] || risograph)(); };
window.render(0);
window.READY = true;
