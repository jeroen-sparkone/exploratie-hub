"""Geluid voor de kerstfles: geen stem, een lichte kerstscore in D-groot (harp, glockenspiel, gestreken vibrafoon,
cello's, pizzicato), met foley op elke beweging uit events.json. Opbouw afgeleid van ../lemo-portstijlen/mix.py.

usage (library root): LIB=$PWD .venv/bin/python <project>/mix.py   -> schrijft out/mix-full.wav
mux.sh normaliseert daarna naar -14 LUFS.
"""
import json, os, sys
import numpy as np, soundfile as sf
LIB = os.environ['LIB']
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click, whoosh, thump

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'events.json')))
FULL = float(D['dur']); EV = D['ev']
N = int(FULL * SR) + SR
tt = np.arange(N) / SR
rng = np.random.default_rng(11)
BEAT = 60 / 100; BAR = 4 * BEAT
evs = lambda k: [e for e in EV if e['type'] == k]


def env_lin(points):
    ts, vs = zip(*points); return np.interp(tt, ts, vs)


def st(x): return np.stack([x, np.roll(x, 1733)], 1)


fx = np.zeros((N, 2)); music = np.zeros((N, 2))
CARD = evs('card')[0]['t']; POUR = evs('pour')[0]['t']

# ---------------- score ----------------
CH = {'D': [38, 45, 50, 54, 57], 'G': [43, 50, 55, 59, 62], 'Bm': [35, 42, 47, 50, 54], 'A': [45, 52, 57, 61, 64], 'Em': [40, 47, 52, 55, 59]}
PROG = ['D', 'G', 'Bm', 'A', 'D', 'Em', 'G', 'A', 'D', 'G', 'Bm', 'A', 'G', 'A', 'D']
ev = [(0.0, 'vibraphone_bowed', 'A5', 4.0, .26, -.2, .18), (0.0, 'cellos', 'D3', 4.0, .3, 0, .26), (0.05, 'glockenspiel', 'F#6', 1.6, .3, .3, .3)]
for b, ch in enumerate(PROG):
    t0 = b * BAR; c = CH[ch]
    if t0 > FULL - .5: break
    calm = t0 < 3.6 or t0 >= CARD
    # harp-arpeggio in achtsten, glockenspiel-melodie op de eerste tel, pizzicato in kwarten
    for i, k in enumerate([1, 2, 3, 4, 3, 2, 3, 4]): ev.append((t0 + i * BEAT / 2, 'harp', c[k] + 12, 1.1, .26 + .06 * (i == 0), -.25 + .06 * i, .36))
    if not calm:
        for q in range(4): ev.append((t0 + q * BEAT, 'contrabass_pizz', c[0] if q % 2 == 0 else c[1], .5, .42 if q == 0 else .32, -.05, .5))
        ev.append((t0, 'frame_drum', 'large_muted', None, .3, 0, .4))
    ev.append((t0, 'cellos', c[0] + 12, BAR, .22, .1, .22))
    ev.append((t0 + BEAT * 2, 'glockenspiel', c[4] + 24, 1.4, .24, .3, .26))
# eindkaart: harp-rol op D, uitklinken
for i, p in enumerate([38, 50, 57, 62, 66, 69, 74]): ev.append((CARD + i * .03, 'harp', p, 3.0, .48, -.3 + i * .1, .5))
ev += [(CARD, 'vibraphone_bowed', 'D6', FULL - CARD, .24, -.2, .16), (CARD, 'vibraphone_bowed', 'A5', FULL - CARD, .22, .2, .14), (CARD, 'cellos', 'D3', FULL - CARD, .28, 0, .22)]
for e in evs('pin'): ev.append((e['t'], 'glockenspiel', [81, 78, 74][e.get('i', 0) % 3], 1.4, .3, [.2, -.35, .3][e.get('i', 0) % 3], .3))
for e in evs('pop'): ev.append((e['t'], 'glockenspiel', [74, 78, 81, 86, 86][e.get('i', 0) % 5], 1.4, .3, .1, .3))
for e in evs('burst') + evs('stat'): ev += [(e['t'], 'hand_chimes', 'D6', 1.8, .38, -.2, .34), (e['t'] + .05, 'hand_chimes', 'A6', 1.8, .3, .25, .3)]
for e in evs('confetti'):
    for j, p in enumerate([86, 83, 81, 78, 74, 81, 86, 90]): ev.append((e['t'] + j * .09, 'glockenspiel', p, 1.2, .24, -.4 + .1 * j, .26))
S.seed(21)
sc = S.render(ev, dur=FULL + 1, master=False)[:N]
sc = np.stack([hp(sc[:, c], 32, 2) for c in range(2)], 1)
sc = S.room(sc, size=.55, mix=.24)
music += sc

# ---------------- foley aan het beeld ----------------
for e in EV:
    k, t, i = e['type'], e['t'], e.get('i', 0)
    if k == 'word':
        for d in (0, .06): add(fx, hp(click(pitch=1.0, v=1.0), 1500) * .05, t + d, 1, .1)
    elif k == 'glitch':                                   # korte digitale ruis per stap, geen flits in het geluid
        n = int(.09 * SR); x = bp(rng.standard_normal(n), 1800 + 500 * i, 7000, 2) * np.exp(-np.arange(n) / SR / .03)
        add(fx, x * .05, t, 1, [-.3, .3][i % 2])
    elif k == 'zoom': add(fx, lp(whoosh(1.4, 1.0), 3000) * .09, t + .1, 1, 0)
    elif k == 'land': add(fx, thump(.7, 58) * .12, t, 1, 0)
    elif k == 'cut': add(fx, lp(whoosh(.6, 1.0), 2400) * .05, t - .15, 1, 0)
    elif k == 'pin': add(fx, hp(click(pitch=1.5, v=1.0), 2200) * .04, t, 1, [.2, -.35, .3][i % 3])
    elif k == 'burst': add(fx, thump(.9, 50) * .14, t, 1, 0)
    elif k == 'trail': add(fx, bp(whoosh(1.5, 1.0), 300, 3000, 2) * .05, t, 1, -.2)
    elif k == 'pour':                                     # schenken: gefilterde ruis met een klokkend ritme
        n = int(1.6 * SR); x = np.arange(n) / SR
        glug = (.55 + .45 * np.sin(2 * np.pi * 7 * x) ** 2) * np.minimum(1, x / .15) * np.exp(-np.maximum(0, x - 1.1) / .2)
        add(fx, bp(rng.standard_normal(n), 250, 1400, 2) * glug * .06, t, 1, 0)
    elif k == 'count':
        for j in range(5): add(fx, hp(click(pitch=1.0 + .12 * j, v=1.0), 1500) * .045, t + (1 - (1 - j / 4) ** .25) * 1.45, 1, 0)
    elif k == 'pop': add(fx, hp(click(pitch=1.8, v=1.0), 2000) * .05, t, 1, 0)
    elif k == 'card': add(fx, thump(.9, 46) * .14, t, 1, 0)

# muziek voorop, effecten ~7 dB eronder (RMS over de hele film)
mr = np.sqrt((music ** 2).mean()); music *= .16 / mr
fr = np.sqrt((fx ** 2).mean()); fx *= min(1.0, (.16 * 10 ** (-7 / 20)) / max(fr, 1e-9))
mix = music + fx
out = mix[:int(FULL * SR)].copy()
nf = int(1.1 * SR); out[-nf:] *= np.linspace(1, 0, nf)[:, None] ** 1.5
out = np.stack([compress(out[:, 0], thr=.35, ratio=2.0), compress(out[:, 1], thr=.35, ratio=2.0)], 1)
out = np.stack([limit(out[:, 0]), limit(out[:, 1])], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', os.environ.get('MIX_OUT', 'mix-full.wav')), out.astype(np.float32), SR)
print('mix ok', round(FULL, 2), 's ·', ', '.join(sorted({e[1] for e in ev})))
