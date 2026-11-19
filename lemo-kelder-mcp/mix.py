"""Geluid voor Kelder als MCP-server: NL-vertelling + score + foley, 100 bpm (één maat = 2,4 s).
Thuis: marimba en kalimba, kamertoon. Cloud: schone elektronische puls en serverzoem. Woodblock per laag van de server.
Muziek ~8 dB onder de stem, ambience ~7 dB eronder, hoge banden laag onder spraak. Master −14 LUFS in mux.sh.
usage (library root): LIB=$PWD .venv/bin/python <project>/mix.py
"""
import json, os, sys
import numpy as np, soundfile as sf, soxr
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click, whoosh, thump

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'events.json'))); FULL = float(D['dur']); EV = D['ev']
CUES = json.load(open(os.path.join(HERE, 'voice', 'cues.json')))
N = int(FULL * SR) + SR; tt = np.arange(N) / SR; rng = np.random.default_rng(5)
BEAT = .6; BAR = 2.4
evs = lambda k: [e for e in EV if e['type'] == k]
one = lambda k, i=0: evs(k)[i]['t']
def env(p): ts, vs = zip(*p); return np.interp(tt, ts, vs)
def st(x): return np.stack([x, np.roll(x, 1531)], 1)
SIL0, CALL2, CARD = one('silence'), one('call', 1), one('card')
cloud = env([(0, 0), (5.0, 0), (6.5, 1), (10.4, 1), (11.4, 0), (22.0, 0), (23.4, 1), (27.4, 1), (28.6, 0), (38.4, 0), (40.4, .6), (FULL, .6)])

mix = np.zeros((N, 2)); music = np.zeros((N, 2))
# ---------------- ambience: kamer thuis, zoem in de cloud ----------------
room = lp(rng.standard_normal(N), 400, 2) * .02 * (1 - cloud * .7)
hum = (np.sin(2 * np.pi * 100 * tt) * .5 + np.sin(2 * np.pi * 200 * tt) * .2 + bp(rng.standard_normal(N), 800, 2400, 1) * .6) * .012 * cloud
gate = env([(0, 1), (SIL0 - .05, 1), (SIL0 + .2, .08), (CALL2 - .02, .08), (CALL2, 1), (FULL, 1)])
mix += st((room + hum) * gate)

# ---------------- score ----------------
ev = []
AM = [57, 60, 64, 67, 69, 72]; F = [53, 57, 60, 65, 69, 72]; C = [48, 55, 60, 64, 67, 72]; G = [55, 59, 62, 67, 71, 74]
PROG = {0: AM, 1: F, 2: C, 3: G}
def bar_chord(b): return PROG[b % 4]
# thuis, maten 1-2: marimba-ostinato in achtsten, zacht
for b in range(0, 2):
    c = bar_chord(b)
    for i, k in enumerate([0, 2, 1, 3, 2, 1, 3, 2]): ev.append((b * BAR + i * BEAT / 2, 'marimba', c[k], .5, .3 + .06 * (i % 2 == 0), -.15, .4))
    ev.append((b * BAR, 'contrabass_pizz', c[0] - 12, .7, .42, 0, .45))
for e in evs('pin'): ev.append((e['t'], 'kalimba', 76, 1.2, .45, .25, .45))
# cloud, maten 3-4: vibrafoon-pad en een schone puls (procedureel, zie onder)
ev += [(5.0, 'vibraphone_bowed', 'E5', 5.6, .3, -.25, .2), (5.0, 'vibraphone_bowed', 'A5', 5.6, .26, .25, .16)]
ev.append((one('cross'), 'claves', None, None, .5, .2, .4))
# de opbouw, maten 5-6: woodblock per laag (versnellend), marimba klimt
for i, e in enumerate(evs('layer')): ev.append((e['t'], 'woodblock', None, None, .35 + .015 * i, -.2 + .02 * i, .4)); ev.append((e['t'], 'marimba', [57, 60, 64, 67, 69, 72, 76, 79][min(7, i * 8 // 20)], .4, .3, .1, .3))
for b in range(4, 7):
    c = bar_chord(b)
    ev.append((b * BAR, 'contrabass_pizz', c[0] - 12, .7, .45, 0, .45)); ev.append((b * BAR + BEAT * 2, 'contrabass_pizz', c[1] - 12, .6, .38, 0, .4))
# drie tools, een slot
for e in evs('tool'): ev.append((e['t'], 'glockenspiel', [81, 84, 88][e['i']], 1.2, .4, [-.3, 0, .3][e['i']], .35))
lk = one('lock'); ev += [(lk, 'claves', None, None, .5, 0, .4), (lk + .15, 'claves', None, None, .4, 0, .35)]
for b in range(7, 9):
    c = bar_chord(b)
    for i, k in enumerate([0, 2, 1, 3, 2, 1, 3, 2]): ev.append((b * BAR + i * BEAT / 2, 'marimba', c[k], .5, .3, -.15, .36))
    ev.append((b * BAR, 'contrabass_pizz', c[0] - 12, .7, .42, 0, .45))
# de route, maten 10-12: shaker in achtsten onder de puls
for b in range(9, 12):
    for i in range(8): ev.append((b * BAR + i * BEAT / 2, 'shaker', None, None, .18 + .1 * (i % 2 == 0), .3, .25))
    c = bar_chord(b); ev.append((b * BAR, 'contrabass_pizz', c[0] - 12, .7, .45, 0, .45))
for e in evs('send'): ev.append((e['t'], 'kalimba', 81, 1.0, .42, -.2, .4))
for e in evs('arrive'): ev.append((e['t'], 'kalimba', 76, 1.4, .4, .2, .4))
for e in evs('call'): ev.append((e['t'], 'marimba', 52, .8, .5, 0, .45))
# de inset, maten 12-14: alleen marimba, ijl
for b in range(12, 14):
    c = bar_chord(b)
    for i, k in enumerate([0, 3, 5, 3]): ev.append((b * BAR + i * BEAT, 'marimba', c[k], .6, .28, .1, .32))
for e in evs('hit'): ev.append((e['t'], 'glockenspiel', 88, 1.0, .42, .2, .38))
# niets gevonden: dalend, droog
em = one('empty'); ev += [(em, 'marimba', 64, .6, .45, 0, .4), (em + .3, 'marimba', 60, .6, .42, 0, .38), (em + .6, 'marimba', 57, 1.2, .45, 0, .4), (em, 'woodblock', None, None, .4, -.2, .35)]
# slot: één kalimbanoot per label, dan de akkoordafsluiting op de eindkaart
for i, e in enumerate(evs('legend')): ev.append((e['t'], 'kalimba', [72, 76][i], 1.6, .48, [-.2, .2][i], .45))
for b in range(16, 19):
    c = bar_chord(b)
    for i, k in enumerate([0, 2, 4, 2]): ev.append((b * BAR + i * BEAT, 'marimba', c[k], .7, .26, -.1, .3))
for i, p in enumerate([45, 57, 64, 69, 72, 76]): ev.append((CARD + i * .04, 'marimba', p, 2.4, .42, -.25 + .1 * i, .42))
ev += [(CARD, 'vibraphone_bowed', 'A4', FULL - CARD, .28, -.2, .18), (CARD, 'vibraphone_bowed', 'E5', FULL - CARD, .26, .2, .16), (CARD, 'kalimba', 81, 2.0, .4, .2, .38)]
ev = [e for e in ev if not (SIL0 - .05 <= e[0] < CALL2 - .02)]
S.seed(9)
sc = S.render(ev, dur=FULL + 1, master=False)[:N]
# schone elektronische puls in de cloudshots: sinus-plucks op de achtsten
pulse = np.zeros(N)
for t0 in np.arange(0, FULL, BEAT / 2):
    n = int(.18 * SR); x = np.arange(n) / SR; f = 220 * (2 if int(t0 / (BEAT / 2)) % 4 == 2 else 1)
    i = int(t0 * SR); j = min(N, i + n); pulse[i:j] += (np.sin(2 * np.pi * f * x) * np.exp(-x / .05) * .35)[:j - i]
sc += st(lp(pulse, 2200) * cloud * .55)
sc *= gate[:, None]
sc = np.stack([hp(sc[:, c], 40, 2) for c in range(2)], 1)
sc = S.room(sc, size=.45, mix=.18)
music += sc

# ---------------- foley ----------------
for e in EV:
    k, t = e['type'], e['t']
    if k in ('rise', 'dive'): add(mix, lp(whoosh(1.4, .9), 2400) * .06, t, 1, 0)
    elif k == 'cross': add(mix, hp(click(pitch=.8, v=1.0), 900) * .06, t, 1, .1)
    elif k == 'tool': add(mix, thump(.25, 120 + 30 * e['i']) * .08, t + .05, 1, [-.3, 0, .3][e['i']])
    elif k == 'send': add(mix, lp(whoosh(.9, .8), 3000) * .05, t, 1, -.1)
    elif k == 'call': add(mix, lp(whoosh(.9, .8), 1800) * .05, t, 1, .1)
    elif k == 'inset':
        for d in (0, .3): add(mix, hp(click(pitch=1.3, v=1.0), 1600) * .04, t + d, 1, .2)
    elif k == 'scan':
        n = int(1.3 * SR); x = np.arange(n) / SR
        add(mix, bp(rng.standard_normal(n), 1200, 3500, 1) * np.sin(np.pi * x / 1.3) * .012, t, 1, .1)
    elif k == 'empty': add(mix, thump(.5, 70) * .1, t, 1, 0)
    elif k == 'legend': add(mix, hp(click(pitch=1.0, v=1.0), 1200) * .05, t, 1, 0)
    elif k == 'card': add(mix, thump(.8, 55) * .1, t, 1, 0)

mid = np.stack([bp(music[:, c], 300, 4000, 2) for c in range(2)], 1)
music = music - mid * (1 - 10 ** (-4 / 20))
voice = np.zeros(N); active = np.zeros(N)
for c in CUES:
    x, sr = sf.read(os.path.join(HERE, 'out', 'voice', c['id'] + '.wav'), dtype='float64')
    if x.ndim > 1: x = x.mean(1)
    if sr != SR: x = soxr.resample(x, sr, SR)
    i = int(c['t0'] * SR); j = min(N, i + len(x)); voice[i:j] += x[:j - i]; active[i:j] = 1
voice = compress(hp(voice, 80, 2), thr=.18, ratio=3.0)
duck = np.convolve(active, np.ones(int(.25 * SR)) / int(.25 * SR), 'same'); duck = 1 - .4 * np.clip(duck * 1.4, 0, 1)
music *= duck[:, None]
voice *= .16 / np.sqrt((voice[active > 0] ** 2).mean())
music *= (.16 * 10 ** (-8 / 20)) / np.sqrt((music[active > 0] ** 2).mean())
mix *= min(1.0, (.16 * 10 ** (-7 / 20)) / max(np.sqrt((mix[active > 0] ** 2).mean()), 1e-9))
mix += music + np.stack([voice, voice], 1)
out = mix[:int(FULL * SR)].copy(); nf = int(1.0 * SR); out[-nf:] *= np.linspace(1, 0, nf)[:, None] ** 1.5
out = np.stack([limit(compress(out[:, c], thr=.35, ratio=2.0)) for c in range(2)], 1)
sf.write(os.path.join(HERE, 'out', 'mix-full.wav'), out.astype(np.float32), SR)
print('mix ok', FULL, 's ·', ', '.join(sorted({e[1] for e in ev})))
