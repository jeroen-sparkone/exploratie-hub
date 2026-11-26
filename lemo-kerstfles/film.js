// Kerstfles: "Vintage port is de verkeerde kerstfles". Tekstanimatie, 9:16, zonder stem.
// Tekst en feiten uit contentskills/projects/port-kerstfles (bron: gids soorten-port, IVDP). Variant: ?cta=ig (PORTGIDS).
// De bewegingen zijn geport uit de Motion Prompt-bibliotheek (keuze van Jeroen, 26-11-2026). Getallen uit de spec;
// afstanden x Z omdat een kaart 539 px breed is en dit beeld 1080. Afwijkingen per element staan in TREATMENT.md.
//
// Motion Prompt #001-024 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#001
// Motion Prompt #001 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#001
// Motion Prompt #002 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#002
// Motion Prompt #003 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#003
// Motion Prompt #007 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#007
// Motion Prompt #011 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#011
// Motion Prompt #014 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#014
// Motion Prompt #015 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#015
// Motion Prompt #019 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#019
// Motion Prompt #020 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#020
// Motion Prompt #023 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#023
const W = 1080, H = 1920, Z = 2;
const cv = document.getElementById('c'); cv.width = W; cv.height = H;
const PAGE = cv.getContext('2d'); let g = PAGE;
for (const f of ['900 40px NotoSerif', '500 40px Grotesk', '700 40px Grotesk']) await document.fonts.load(f, 'Vintage °C');
const QS = new URLSearchParams(location.search), IG = QS.get('cta') === 'ig', KEY = 'PORTGIDS';

// VinoVonk-palet in plaats van het kaartpalet (blauw, koraal, geel, mint)
const INK = '#1e1b15', CRE = '#f3e8d2', WHT = '#fbf7ee', OX = '#8b0018', DARK = '#3a0010', GOLD = '#C9A227', TAW = '#b86d2c', BLUSH = '#f0dccf', MUTED = '#6b645a', ROSE = '#e88a9c';

// ---------- kit (Motion Prompt, pack motion) ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, x) => a + (b - a) * x;
const P = (t, a, b) => clamp((t - a) / (b - a));
const eIOs = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const eOut = x => 1 - Math.pow(1 - x, 3);
const eOut5 = x => 1 - Math.pow(1 - x, 5);
const eIn = x => x * x * x;
const smooth = x => x * x * (3 - 2 * x);
const mod = (a, n) => ((a % n) + n) % n;
const backOut = (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
const backIn = (x, s = 1.70158) => (s + 1) * x * x * x - s * x * x;
const spring = (t, w = 14, d = 7) => t <= 0 ? 0 : 1 - Math.exp(-d * t) * Math.cos(w * t);
function rand(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function mix(a, b, t) { const A = hex(a), B = hex(b); return `rgb(${Math.round(lerp(A[0], B[0], t))},${Math.round(lerp(A[1], B[1], t))},${Math.round(lerp(A[2], B[2], t))})`; }
function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
function rr(k, x, y, w, h, r) { k.beginPath(); k.roundRect(x, y, w, h, r); }
const G0 = mkCanvas(W, H), GK0 = G0.getContext('2d', { willReadFrequently: true });
const G1 = mkCanvas(W, H), GK1 = G1.getContext('2d', { willReadFrequently: true });
function goo(draw, blur, paint) {
  GK0.setTransform(1, 0, 0, 1, 0, 0); GK0.clearRect(0, 0, W, H); GK0.fillStyle = '#fff'; draw(GK0);
  GK1.setTransform(1, 0, 0, 1, 0, 0); GK1.globalCompositeOperation = 'source-over'; GK1.clearRect(0, 0, W, H);
  GK1.filter = `blur(${blur}px)`; GK1.drawImage(G0, 0, 0); GK1.filter = 'none';
  const im = GK1.getImageData(0, 0, W, H), d = im.data;
  for (let i = 3; i < d.length; i += 4) { const a = d[i]; d[i] = a < 112 ? 0 : a > 144 ? 255 : (a - 112) * 8; }
  GK1.putImageData(im, 0, 0);
  GK1.globalCompositeOperation = 'source-atop'; paint(GK1); GK1.globalCompositeOperation = 'source-over';
  return G1;
}

// ---------- tijdlijn ----------
// scènes (s): hook, vintage, kalender, keuze, tawny, hout, schenken, einde. Lengtes volgen de leestijd (readcheck).
const B = [0, 4.2, 8.4, 11.8, 15.2, 19.4, 24.2, 28.6, 33.2], FULL = B.at(-1);
const ZOOM = 3.85;          // #020: zoomt van de hook door de o van "port" de vintage-scène in (1,4 s)
const LIQ = B[4] - 1.1;     // #019: tawny loopt van boven over de keuze heen; laag 2 is de tawny-scène zelf
const K = (t, a, b) => eOut(P(t, a, b));

// ---------- tekst (met kaders voor readcheck) ----------
let TX = null, NOTX = false;
function font(o) { return `${o.w || 700} ${o.size || 40}px ${o.f || 'Grotesk'}`; }
function measure(s, o) { g.save(); g.font = font(o); g.letterSpacing = (o.sp || 0) + 'px'; const w = g.measureText(s).width; g.restore(); return w; }
function text(s, x, y, o = {}) {
  const a = o.a ?? 1; if (a <= 0) return; g.save(); g.globalAlpha = a; g.font = font(o); g.textAlign = o.align || 'left'; g.letterSpacing = (o.sp || 0) + 'px'; g.fillStyle = o.col || INK; g.fillText(s, x, y);
  if (TX && !NOTX && a > .5 && g === PAGE) { const w = g.measureText(s).width, x0 = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x; TX.push({ id: o.id || s, text: s, x0, y0: y - (o.size || 40) * .8, x1: x0 + w, y1: y + (o.size || 40) * .2 }); }
  g.restore();
}
function field(col) { g.fillStyle = col; g.fillRect(0, 0, W, H); }
const rise = (l, t0, d = .4) => ({ a: K(l, t0, t0 + d), dy: 24 * (1 - K(l, t0, t0 + d)) });

// ---------- 1. hook: #023 glitch op "verkeerde", vanaf frame 0 leesbaar ----------
const HL = [['Vintage port', INK], ['is de', INK], ['verkeerde', OX], ['kerstfles', INK]], HS = 132, HY = [600, 750, 900, 1050];
const GL = (() => { const R = rand(231), st = []; for (let s = 0; s < 12; s++) { const sl = [], n = 2 + Math.floor(R() * 3); for (let i = 0; i < n; i++) sl.push({ y: Math.floor(40 + R() * 110), h: 10 + Math.floor(R() * 26), dx: Math.round((R() < .5 ? -1 : 1) * (18 + R() * 46)) }); const bars = []; for (let i = 0; i < 3; i++) bars.push({ x: 30 + R() * 420, y: 30 + R() * 150, w: 30 + R() * 90, h: 5 + R() * 7, c: i }); st.push({ sl, bars, rgb: 7 + Math.round(R() * 9) }); } return st; })();
const TMP = mkCanvas(W, H), TK = TMP.getContext('2d'), GLC = mkCanvas(W, H), GKc = GLC.getContext('2d'), GLT = mkCanvas(W, H), GT = GLT.getContext('2d');
function glitchWord(l, s, x, y, size, col, id) {
  const step = .14; let si = -1;
  if (l >= .55 && l < .55 + step * 5) si = Math.floor((l - .55) / step);   // eerste uitbarsting van de spec; de tweede (2,9 s) valt in de zoom
  if (si < 0) return text(s, x, y, { f: 'NotoSerif', w: 900, size, col, id });
  const S = GL[si], band = { y: y - size * .82, h: size * 1.05 }, ky = v => band.y + v / 208 * band.h;
  TK.setTransform(1, 0, 0, 1, 0, 0); TK.clearRect(0, 0, W, H); TK.font = `900 ${size}px NotoSerif`; TK.fillStyle = col; TK.fillText(s, x, y);
  const tint = c => { GT.setTransform(1, 0, 0, 1, 0, 0); GT.globalCompositeOperation = 'source-over'; GT.clearRect(0, 0, W, H); GT.drawImage(TMP, 0, 0); GT.globalCompositeOperation = 'source-in'; GT.fillStyle = c; GT.fillRect(0, 0, W, H); GT.globalCompositeOperation = 'source-over'; return GLT; };
  GKc.setTransform(1, 0, 0, 1, 0, 0); GKc.clearRect(0, 0, W, H);
  GKc.drawImage(tint(GOLD), -S.rgb * Z, 2 * Z); GKc.drawImage(tint('#22D3EE'), S.rgb * Z, -2 * Z); GKc.drawImage(TMP, 0, 0);
  g.drawImage(GLC, 0, 0);
  for (const sl of S.sl) { const yy = ky(sl.y), hh = sl.h / 208 * band.h; g.fillStyle = CRE; g.fillRect(0, yy, W, hh); g.drawImage(GLC, 0, yy, W, hh, sl.dx * Z, yy, W, hh); }
  for (const b of S.bars) { g.fillStyle = [OX, '#22D3EE', GOLD][b.c]; g.fillRect(x + b.x * 1.3, ky(b.y), b.w * Z, b.h * Z); }
  if (TX && !NOTX) TX.push({ id, text: s, x0: x, y0: y - size * .8, x1: x + measure(s, { f: 'NotoSerif', w: 900, size }), y1: y + size * .2 });
}
function sHook(l) {
  field(CRE);
  text('PORT · DECEMBER', 72, 330, { size: 30, col: OX, sp: 6, id: 'h-eyebrow' });
  HL.forEach(([s, col], i) => i === 2 ? glitchWord(l, s, 66, HY[i], HS, col, 'h2') : text(s, 66, HY[i], { f: 'NotoSerif', w: 900, size: HS, col, id: 'h' + i }));
  g.save(); g.fillStyle = OX; g.fillRect(72, 1150, 120 * K(l, .2, .7), 6); g.restore();
  text('Zo kies je wel goed', 72, 1240, { size: 46, w: 500, col: MUTED, a: K(l, .3, .7), id: 'h-foot' });
}
function oHole() { g.save(); g.font = `900 ${HS}px NotoSerif`; const x0 = 66 + g.measureText('Vintage p').width, ow = g.measureText('o').width; g.restore(); return { x: x0 + ow / 2, y: HY[0] - HS * .245, r: HS * .135 }; }

// ---------- 2. vintage: #011 squash & stretch op de "2" ----------
function sVintage(l) {
  field(OX);
  const r = rise(l, .2); text('Vintage, fles open', 72, 380 + r.dy, { size: 40, col: CRE, sp: 2, a: r.a, id: 'v-kick' });
  // twee stuiters van 1,175 s (spec), vanaf de top vallend; daarna veert hij in 0,15 s terug naar 1 en blijft staan
  const T = 1.175, c = .1, floor = 1060, Hgt = 92 * Z, t0 = .9 - .5 * T, end = t0 + 2.5 * T, X = 300;
  let sy = 1, yb = floor, q = -1;
  if (l < end) { q = mod(l - t0, T) / T;
    if (q < c || q > 1 - c) { const d = (q < c ? q : 1 - q) / c; sy = lerp(.52, 1.28, d * d); }
    else { const qq = (q - c) / (1 - 2 * c), sp = Math.abs(2 * qq - 1); yb = floor - Hgt * (1 - sp * sp); sy = 1 + .28 * Math.pow(sp, 3); } }
  else sy = lerp(.52, 1, eOut(P(l, end, end + .15)));
  if (l < t0 + .5 * T) { yb = floor - Hgt; sy = 1 + .28; }   // hangt boven voor de eerste val
  const sx = 1 / sy, hg = (floor - yb) / Hgt;
  g.save(); g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(X, floor + 18, 150 * (1 - hg * .55) * Math.max(1, sx), 14 * (1 - hg * .5), 0, 0, 7); g.fill(); g.restore();
  const dq = q < .5 ? q : q - 1;   // de kleine spatjes bij elke landing
  if (q >= 0 && Math.abs(dq) < .16 && dq > -.02) { const t = (dq + .02) / .18; g.save(); g.strokeStyle = GOLD; g.lineWidth = 5 * Z * (1 - t); g.lineCap = 'round';
    [-1, 1].forEach(s => { g.beginPath(); g.moveTo(X + s * (50 + 28 * t) * Z * 1.6, floor - 6 * Z - 10 * Z * t); g.lineTo(X + s * (62 + 40 * t) * Z * 1.6, floor - 12 * Z - 20 * Z * t); if (t < .97) g.stroke(); }); g.restore(); }
  g.save(); g.translate(X, yb); g.scale(sx, sy); g.font = '900 480px NotoSerif'; g.textAlign = 'center'; g.fillStyle = GOLD; g.fillText('2', 0, 0); g.restore();
  if (TX && !NOTX) TX.push({ id: 'v-num', text: '2', x0: X - 170, y0: Math.max(0, yb - 420 * sy), x1: X + 170, y1: yb });
  const r2 = rise(l, 1.0); text('dagen', 72, 1290 + r2.dy, { f: 'NotoSerif', w: 900, size: 170, col: WHT, a: r2.a, id: 'v-title' });
  text('IVDP: 1 tot 2 dagen open', 76, 1375, { size: 40, w: 500, col: '#f1cfc8', a: K(l, 1.2, 1.6), id: 'v-note' });
}

// ---------- 3. kalender: #002 stagger voor de rijen, #003 burst op "voorbij" ----------
const ROWS = [['25 dec', 'fles open'], ['26 dec', 'nog goed'], ['27 dec', 'voorbij']];
function sKalender(l, len) {
  field(CRE);
  text('KERST', 72, 360, { size: 30, col: OX, sp: 6, id: 'k-kick' });
  const r = rise(l, .05); text('Vintage na openen', 70, 470 + r.dy, { f: 'NotoSerif', w: 900, size: 92, col: INK, a: r.a, id: 'k-title' });
  const RH = 170, X0 = 72, RW = 936, base0 = 760;
  ROWS.forEach(([d, s], i) => {
    const t0 = .15 + i * .12, gr = backOut(P(l, t0, t0 + .5), 2.6) * (1 - eIn(P(l, len - .3 + i * .045, len - .04 + i * .045)));
    if (gr <= .001) return;
    const base = base0 + i * (RH + 40), hh = RH * gr;
    g.save(); g.fillStyle = i === 2 ? WHT : '#fff'; rr(g, X0, base - hh, RW, hh, [24, 24, 6, 6]); g.fill(); g.strokeStyle = INK; g.lineWidth = 3; g.stroke(); g.restore();
    const dot = spring(l - t0 - .34, 16, 7) * (1 - eIn(P(l, len - .38 + i * .045, len - .18 + i * .045)));
    if (dot > .01) { g.save(); g.fillStyle = i === 2 ? OX : GOLD; g.beginPath(); g.arc(X0 + 54, base - RH / 2, 13 * Z * dot, 0, 7); g.fill(); g.restore(); }
    if (gr > .85) { text(d, X0 + 100, base - RH / 2 + 20, { size: 54, w: 700, col: INK, id: 'k-d' + i });
      if (i < 2) text(s, X0 + 330, base - RH / 2 + 20, { size: 54, w: 500, col: INK, id: 'k-s' + i }); }
  });
  // burst (#003): de stempel "voorbij" trekt zich samen (0,3-0,5 s voor de trigger), kleurt bij de trigger en veert terug
  const base = base0 + 2 * (RH + 40), BX = X0 + 330 + 130, BY = base - RH / 2, TRIG = 1.5, tt = l - TRIG, out = P(l, len - .3, len - .1);
  if (l > .5 && out < 1) {
    const ant = eIOs(P(l, TRIG - .2, TRIG)), sc = (tt < 0 ? 1 - .3 * ant : .7 + .3 * spring(tt, 16, 6.5)) * (1 - out);
    if (tt > 0 && tt < .75) { const q = eOut5(Math.min(1, tt / .6)), fade = 1 - P(tt, .3, .72), S = 1.7 * Z;
      g.save(); g.strokeStyle = GOLD; g.lineWidth = Math.max(.1, 16 * S * (1 - q)); g.beginPath(); g.ellipse(BX, BY, (44 + 46 * q) * S * 1.6, (44 + 46 * q) * S * .8, 0, 0, 7); if (q < .98) g.stroke();
      g.lineCap = 'round';
      for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, r1 = (64 + 66 * q) * S, len2 = 36 * S * (1 - P(tt, .22, .7));
        if (len2 > .5) { g.strokeStyle = i % 2 ? TAW : GOLD; g.lineWidth = 9 * S * .7; g.beginPath(); g.moveTo(BX + Math.cos(a) * (r1 - len2) * 1.6, BY + Math.sin(a) * (r1 - len2) * .82); g.lineTo(BX + Math.cos(a) * r1 * 1.6, BY + Math.sin(a) * r1 * .82); g.stroke(); }
        const a2 = a + Math.PI / 10, r2 = (58 + 92 * q) * S; g.fillStyle = i % 2 ? OX : GOLD; g.globalAlpha = fade; g.beginPath(); g.arc(BX + Math.cos(a2) * r2 * 1.45, BY + Math.sin(a2) * r2 * .78, 8 * S * (1 - q * .4), 0, 7); g.fill(); g.globalAlpha = 1; }
      g.restore(); }
    g.save(); g.translate(BX, BY); g.scale(sc, sc); g.font = '700 58px Grotesk'; const w = g.measureText('voorbij').width + 60;
    rr(g, -w / 2, -48, w, 96, 48); g.lineWidth = 6; g.strokeStyle = OX; g.stroke(); if (tt >= 0) { g.fillStyle = OX; g.fill(); }
    g.fillStyle = tt >= 0 ? WHT : OX; g.textAlign = 'center'; g.fillText('voorbij', 0, 20); g.restore();
    if (TX && !NOTX && sc > .6) TX.push({ id: 'k-s2', text: 'voorbij', x0: BX - 150, y0: BY - 48, x1: BX + 150, y1: BY + 48 });
  }
}

// ---------- 4. keuze: #014 motion trail van Vintage naar Oude tawny ----------
function sKeuze(l) {
  field(DARK);
  const a = K(l, 0, .3), dy = 24 * (1 - a);
  text('Vintage', 72, 720 + dy, { f: 'NotoSerif', w: 900, size: 160, col: CRE, a, id: 'c-top' });
  g.save(); g.globalAlpha = a; g.fillStyle = GOLD; g.fillRect(72, 868, 380, 3); g.fillRect(628, 868, 380, 3); g.restore();
  text('of', 540, 884, { size: 52, w: 700, col: GOLD, a, align: 'center', id: 'c-of' });
  text('Oude tawny', 1008, 1100 + dy, { f: 'NotoSerif', w: 900, size: 150, col: TAW, a, align: 'right', id: 'c-bot' });
  // spec: 15 kopieën, 0,105 rad uit elkaar, straal 22→6, alfa 0,9(1−i/15)+0,05; anderhalf keer zo snel om voor de vloeistof aan te komen
  const A0 = -Math.PI / 2, th = A0 + clamp((l - .35) / 1.5) * Math.PI, pt = a => [540 + 400 * Math.sin(a), 900 + 160 * Math.sin(a) - 130 * Math.sin(2 * a)];
  if (l > .35) { const N = 15;
    for (let i = N; i >= 1; i--) { const aa = th - i * .105 * 1.5; if (aa < A0) continue; const [x, y] = pt(aa), f = i / N;
      g.save(); g.globalAlpha = .9 * (1 - f) + .05; g.fillStyle = f < .5 ? mix(GOLD, CRE, f * 2) : mix(CRE, TAW, (f - .5) * 2); g.beginPath(); g.arc(x, y, lerp(22, 6, f) * Z, 0, 7); g.fill(); g.restore(); }
    const [x, y] = pt(th); g.save(); g.fillStyle = GOLD; g.beginPath(); g.arc(x, y, 25 * Z, 0, 7); g.fill(); g.fillStyle = DARK; g.beginPath(); g.arc(x, y, 11 * Z, 0, 7); g.fill(); g.restore(); }
  const u = K(l, 1.85, 2.25); if (u > 0) { g.save(); g.fillStyle = GOLD; g.fillRect(1008 - 760 * u, 1140, 760 * u, 8); g.restore(); }
}

// ---------- 5. tawny: #007 count-up naar 4 ----------
function sTawny(l) {
  field(BLUSH);
  text('Tawny of Colheita, open', 72, 380, { size: 40, col: OX, sp: 2, a: K(l, .1, .4), id: 't-kick' });
  const TARGET = 4, a = P(l, .1, .4), p = P(l, .45, 1.9), v = Math.round(TARGET * (1 - Math.pow(1 - p, 4)));   // 2,45 s in de spec, hier 1,45 s
  const land = l - 1.9, pop = 1 + (land > 0 ? .07 * Math.exp(-7 * land) * Math.cos(15 * land) : 0), X = 600, Y = 1000;
  g.save(); g.globalAlpha = a; g.translate(X, Y); g.scale(pop, pop); g.font = '900 600px NotoSerif'; g.textAlign = 'center'; g.fillStyle = land > 0 ? OX : INK; g.fillText(String(v), 0, 0); g.restore();
  if (TX && !NOTX && a > .5) TX.push({ id: 't-num', text: '4', x0: X - 180, y0: Y - 440, x1: X + 180, y1: Y });
  const speed = p < 1 ? Math.pow(1 - p, 3) : 0, ar = spring(l - .35, 14, 7), bob = speed * 6 * Z * Math.sin(l * 30);
  if (ar > .01) { g.save(); g.translate(250, Y - 220 + bob); g.scale(ar, ar); g.fillStyle = GOLD; g.beginPath(); g.arc(0, 0, 34 * Z, 0, 7); g.fill();
    g.strokeStyle = DARK; g.lineWidth = 8 * Z; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath(); g.moveTo(0, 15 * Z); g.lineTo(0, -14 * Z); g.moveTo(-13 * Z, -1 * Z); g.lineTo(0, -15 * Z); g.lineTo(13 * Z, -1 * Z); g.stroke(); g.restore(); }
  const bw = 330 * Z, bx = 540 - bw / 2, by = Y + 60;
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(30,27,21,.14)'; rr(g, bx, by, bw, 12 * Z, 6 * Z); g.fill();
  const gr = g.createLinearGradient(bx, 0, bx + bw, 0); gr.addColorStop(0, TAW); gr.addColorStop(1, OX); g.fillStyle = gr; rr(g, bx, by, Math.max(12 * Z, bw * (v / TARGET)), 12 * Z, 6 * Z); g.fill(); g.restore();
  const r = rise(l, .9); text('maanden', 72, 1270 + r.dy, { f: 'NotoSerif', w: 900, size: 170, col: INK, a: r.a, id: 't-title' });
  text('IVDP: 1 tot 4 maanden open', 76, 1360, { size: 40, w: 500, col: MUTED, a: K(l, 1.0, 1.4), id: 't-note' });
}

// ---------- 6. hout: #001 pop-in van een vat met badge "7+" ----------
function popIcon(l, X, Y, S, col, draw, badge, outAt) {
  const out = backIn(P(l, outAt, outAt + .26), 2.2), sc = spring(l - .28, 15, 6.5) * (1 - out), rot = (1 - spring(l - .28, 11, 6)) * -.35;
  g.save(); g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(X, Y + S * .67, S * .53 * clamp(sc), S * .07 * clamp(sc), 0, 0, 7); g.fill(); g.restore();
  if (sc <= .002) return;
  g.save(); g.translate(X, Y); g.rotate(rot); g.scale(sc, sc); g.fillStyle = col; rr(g, -S / 2, -S / 2, S, S, S * .26); g.fill();
  g.fillStyle = 'rgba(255,255,255,.16)'; rr(g, -S / 2, -S / 2, S, S / 2, [S * .26, S * .26, 0, 0]); g.fill(); draw(S); g.restore();
  if (badge) { const bs = spring(l - .62, 17, 7) * (1 - out), R = S * .215; if (bs > .002) { g.save(); g.translate(X + S * .45 * sc, Y - S * .45 * sc); g.scale(bs, bs); g.fillStyle = GOLD; g.beginPath(); g.arc(0, 0, R, 0, 7); g.fill(); g.strokeStyle = INK; g.lineWidth = R * .2; g.stroke();
    g.font = `700 ${R * 1.05}px Grotesk`; g.fillStyle = INK; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(badge, 0, R * .06); g.restore(); } }
}
const cask = S => { g.strokeStyle = WHT; g.lineWidth = S * .05; g.lineCap = 'round'; g.beginPath(); g.ellipse(0, 0, S * .26, S * .33, 0, 0, 7); g.stroke();
  for (const y of [-.16, .16]) { g.beginPath(); g.moveTo(-S * .245, y * S); g.lineTo(S * .245, y * S); g.stroke(); } g.beginPath(); g.moveTo(0, -S * .33); g.lineTo(0, S * .33); g.stroke(); };
function sHout(l, len) {
  field(INK);
  text('WAAROM', 72, 360, { size: 30, col: GOLD, sp: 6, id: 'w-kick' });
  [['Rijpt jaren in', WHT], ['hout.', GOLD], ['Open gaat hij', WHT], ['tot in januari mee.', WHT]].forEach(([s, col], i) => { const r = rise(l, .05 + i * .1);
    text(s, 66, 540 + i * 118 + r.dy, { f: 'NotoSerif', w: 900, size: 94, col, a: r.a, id: 'w' + i }); });
  text('Colheita: minstens 7 jaar in vat', 72, 1180, { size: 40, w: 500, col: '#d9cdb8', a: K(l, .9, 1.3), id: 'w-foot' });
  popIcon(l - .6, 850, 1340, 190, TAW, cask, '7+', len - .6 - .3);
}

// ---------- 7. schenken: #001 pop-in per regel ----------
const SERVE = [['Koel: 10 tot 14 °C', OX, S => { g.fillStyle = WHT; g.font = `700 ${S * .36}px Grotesk`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('°C', 0, S * .02); }],
  ['In een wittewijnglas', TAW, S => { g.strokeStyle = WHT; g.lineWidth = S * .05; g.lineCap = 'round'; g.beginPath(); g.moveTo(-S * .16, -S * .3); g.quadraticCurveTo(-S * .2, S * .02, 0, S * .05); g.quadraticCurveTo(S * .2, S * .02, S * .16, -S * .3); g.moveTo(0, S * .05); g.lineTo(0, S * .28); g.moveTo(-S * .13, S * .28); g.lineTo(S * .13, S * .28); g.stroke(); }],
  ['Bij harde, zoute kaas', GOLD, S => { g.fillStyle = WHT; g.beginPath(); g.moveTo(-S * .28, S * .2); g.lineTo(S * .28, S * .2); g.lineTo(S * .28, -S * .02); g.lineTo(-S * .28, S * .2); g.closePath(); g.moveTo(-S * .28, S * .2); g.lineTo(S * .28, -S * .02); g.lineTo(S * .1, -S * .22); g.closePath(); g.fill(); }]];
function sSchenken(l, len) {
  field(CRE);
  text('OUDE TAWNY', 72, 360, { size: 30, col: OX, sp: 6, id: 's-kick' });
  const r = rise(l, .05); text('Zo schenk je hem', 70, 470 + r.dy, { f: 'NotoSerif', w: 900, size: 96, col: INK, a: r.a, id: 's-title' });
  SERVE.forEach(([s, col, draw], i) => { const t0 = .3 + i * .5, Y = 700 + i * 230;
    popIcon(l - t0 + .28, 150, Y, 150, col, draw, null, len - t0 + .28 - .3);
    const a = K(l, t0 + .1, t0 + .45) * (1 - P(l, len - .3, len - .1)); text(s, 270, Y + 20 + 16 * (1 - a), { size: 56, w: 700, col: INK, a, id: 's' + i }); });
}

// ---------- 8. einde: #001 pop-in voor PORTGIDS, #015 deeltjes ----------
const PARTS = (() => { const R = rand(15), a = [], PAL = [GOLD, WHT, TAW, ROSE]; for (let i = 0; i < 84; i++) { const n = R() < .5 ? 2 : 3; a.push({ T: 4.7 / n, ph: R() * 4.7, vx: (R() - .5) * 2 * 190, vy: -(250 + R() * 150), sz: 5 + R() * 6, col: PAL[i % 4], kind: i % 3, spin: (R() - .5) * 9 }); } return a; })();
function particles(l, from) {
  const PZ = 2.6, X = W / 2, Y = H - 20, G = 470 * PZ;
  for (const p of PARTS) { const t = mod(l + p.ph, p.T), life = Math.min(p.T, 1.5); if (t > life || l - t < from) continue;   // geen deeltjes van vóór de start
    const x = X + p.vx * PZ * t, y = Y + p.vy * PZ * t + .5 * G * t * t, a = Math.min(1, t / .06) * (1 - smooth(P(t, life * .7, life))), sc = lerp(1.15, .7, t / life) * PZ;
    g.save(); g.globalAlpha = a; g.fillStyle = p.col; g.translate(x, y); g.rotate(t * p.spin); g.scale(sc, sc);
    if (p.kind === 0) { g.beginPath(); g.arc(0, 0, p.sz, 0, 7); g.fill(); } else if (p.kind === 1) g.fillRect(-p.sz, -p.sz, p.sz * 2, p.sz * 2);
    else { g.beginPath(); g.moveTo(0, -p.sz * 1.3); g.lineTo(p.sz * 1.2, p.sz); g.lineTo(-p.sz * 1.2, p.sz); g.closePath(); g.fill(); } g.restore(); }
}
function sEinde(l) {
  field(OX);
  particles(l, .9);
  const k2 = K(l, .1, .6), dy = 20 * (1 - k2);
  text('VINOVONK', 72, 600 + dy, { size: 32, col: GOLD, sp: 6, a: k2, id: 'e-eyebrow' });
  text('Welke port wanneer?', 70, 720 + dy, { f: 'NotoSerif', w: 900, size: 88, col: WHT, a: k2, id: 'e1' });
  if (IG) { const kk = K(l, .4, .8);
    text('Reageer met', 70, 850 + dy, { f: 'NotoSerif', w: 900, size: 70, col: WHT, a: kk, id: 'e-ig1' });
    const sc = spring(l - .9, 15, 6.5), rot = (1 - spring(l - .9, 11, 6)) * -.35;
    if (sc > .002) { g.save(); g.font = '900 96px NotoSerif'; const kw = g.measureText(KEY).width; g.translate(70 + (kw + 48) / 2, 960); g.rotate(rot); g.scale(sc, sc);
      g.fillStyle = GOLD; rr(g, -(kw + 48) / 2, -66, kw + 48, 132, 18); g.fill(); g.fillStyle = DARK; g.textAlign = 'center'; g.fillText(KEY, 0, 34); g.restore();
      if (TX && !NOTX && sc > .9) TX.push({ id: 'e-key', text: KEY, x0: 70, y0: 894, x1: 70 + kw + 48, y1: 1026 }); }
    text('dan stuur ik je de hele gids.', 72, 1110, { size: 44, w: 500, col: '#f1cfc8', a: K(l, 1.1, 1.5), id: 'e-ig3' }); }
  else { text('De hele gids staat op', 70, 850 + dy, { f: 'NotoSerif', w: 900, size: 70, col: WHT, a: K(l, .4, .8), id: 'e-w1' });
    const sc = spring(l - .9, 15, 6.5), rot = (1 - spring(l - .9, 11, 6)) * -.35;
    if (sc > .002) { g.save(); g.font = '900 88px NotoSerif'; const kw = g.measureText('vinovonk.com').width; g.translate(70 + (kw + 48) / 2, 960); g.rotate(rot); g.scale(sc, sc);
      g.fillStyle = GOLD; rr(g, -(kw + 48) / 2, -62, kw + 48, 124, 18); g.fill(); g.fillStyle = DARK; g.textAlign = 'center'; g.fillText('vinovonk.com', 0, 30); g.restore();
      if (TX && !NOTX && sc > .9) TX.push({ id: 'e-url', text: 'vinovonk.com', x0: 70, y0: 898, x1: 70 + kw + 48, y1: 1022 }); } }
  text('Minder drinken. Beter kiezen.', 72, 1330, { size: 40, w: 500, col: '#f1cfc8', a: K(l, .6, 1.0), id: 'e-strip' });
  text('@vinovonk', 72, 1420, { size: 34, w: 500, col: '#e9c9c2', a: k2, id: 'e-handle' });
}

const SC = [sHook, sVintage, sKalender, sKeuze, sTawny, sHout, sSchenken, sEinde];
const at = (i, t) => SC[i](t - B[i], B[i + 1] - B[i]);
const idx = t => Math.max(0, B.findIndex((b, i) => t >= b && t < B[i + 1]) === -1 ? 7 : B.findIndex((b, i) => t >= b && t < B[i + 1]));

// ---------- het frame ----------
function frame(t) {
  g = PAGE; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  // #020 zoom through: p = 0,8·eIn + 0,2·eOut, schaal = Smax^p rond het gat van de o
  if (t >= ZOOM && t < ZOOM + 1.4) {
    const u = t - ZOOM + .25, po = oHole(), Smax = Math.hypot(Math.max(po.x, W - po.x), Math.max(po.y, H - po.y)) / po.r * 1.08;
    const p = eIn(P(u, .25, 1.2)) * .8 + eOut(P(u, 1.2, 1.65)) * .2;
    if (p < 1) { NOTX = true; const s = Math.pow(Smax, p), Zm = (sc) => { g.translate(po.x, po.y); g.scale(sc, sc); g.translate(-po.x, -po.y); };
      g.save(); Zm(s); at(0, Math.min(t, B[1] - .001));
      g.save(); g.beginPath(); g.arc(po.x, po.y, po.r, 0, 7); g.clip(); g.fillStyle = OX; g.fillRect(-W, -H, 3 * W, 3 * H); Zm(1 / Smax); SC[1](Math.max(0, t - B[1]), B[2] - B[1]); g.restore(); g.restore(); NOTX = false; return; }
  }
  // #019 liquid: laag 1 effen tawny 0,35-1,5 s, laag 2 de volgende scène 0,7-1,8 s, allebei quadratic in-out
  if (t >= LIQ + .35 && t < LIQ + 1.8) {
    const u = t - LIQ, p1 = eIOs(P(u, .35, 1.5)), p2 = eIOs(P(u, .7, 1.8)), XS = W / 539;
    const DR = [0, 1].map(s => { const R = rand(190 + s * 7), a = []; for (let i = 0; i < 7; i++) a.push({ x: (36 + i * 78 + (R() - .5) * 30) * XS, len: (30 + R() * 80) * Z, wd: (15 + R() * 12) * Z, ph: R() * 6 }); return a; });
    const shape = (k, p, set, uu) => { const base = lerp(-110 * Z, H + 130 * Z, p), amp = Math.sin(Math.PI * clamp(p * 1.1));
      k.beginPath(); k.moveTo(-20, -40); for (let x = -20; x <= W + 20; x += 10) k.lineTo(x, base + amp * Z * (13 * Math.sin(x / XS * .021 + uu * 3 + set) + 8 * Math.sin(x / XS * .05 + uu * 4.3))); k.lineTo(W + 20, -40); k.closePath(); k.fill();
      for (const d of DR[set]) { const L = d.len * (.25 + amp * .9), y0 = base - 20 * Z; k.beginPath(); k.roundRect(d.x - d.wd, y0, d.wd * 2, L + 20 * Z, d.wd); k.fill(); k.beginPath(); k.arc(d.x, y0 + L + 18 * Z, d.wd * 1.25, 0, 7); k.fill(); } };
    NOTX = true; at(3, Math.min(t, B[4] - .001));
    if (p1 > 0 && p2 < 1) g.drawImage(goo(k => shape(k, p1, 0, u), 7 * Z, k => { k.fillStyle = TAW; k.fillRect(0, 0, W, H); }), 0, 0);
    if (p2 > 0) g.drawImage(goo(k => shape(k, p2, 1, u + 1), 7 * Z, k => { const keep = g; g = k; SC[4](Math.max(0, t - B[4]), B[5] - B[4]); g = keep; }), 0, 0);
    NOTX = false; return;
  }
  at(idx(t), t);
}

window.DUR = FULL;
window.render = t => frame(t);
window.TEXTS = t => { TX = []; frame(t); const r = TX; TX = null; return r; };
window.EV = [
  { t: 0, type: 'word' }, ...[0, 1, 2, 3, 4].map(i => ({ t: .55 + i * .14, type: 'glitch', i })), { t: ZOOM, type: 'zoom' },
  ...[0, 1, 2].map(i => ({ t: B[1] + .9 - .5 * 1.175 + (i + .5) * 1.175, type: 'land', i })).filter(e => e.t < B[1] + .9 + 2 * 1.175 + .1),
  { t: B[2], type: 'cut' }, ...[0, 1, 2].map(i => ({ t: B[2] + .15 + i * .12, type: 'pin', i })), { t: B[2] + 1.5, type: 'burst' },
  { t: B[3], type: 'cut' }, { t: B[3] + .35, type: 'trail' }, { t: B[3] + 1.85, type: 'pin', i: 2 },
  { t: LIQ + .35, type: 'pour' }, { t: B[4] + .45, type: 'count' }, { t: B[4] + 1.9, type: 'stat' },
  { t: B[5], type: 'cut' }, { t: B[5] + .6 + .28, type: 'pop', i: 0 }, { t: B[5] + .6 + .62, type: 'pin', i: 1 },
  { t: B[6], type: 'cut' }, ...[0, 1, 2].map(i => ({ t: B[6] + .3 + i * .5, type: 'pop', i: i + 1 })),
  { t: B[7], type: 'card' }, { t: B[7] + .9, type: 'pop', i: 4 }, { t: B[7] + .9, type: 'confetti' }];
window.render(0);
window.READY = true;
