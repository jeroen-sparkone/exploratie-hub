"""Geluid voor de Douro-film: geen stem, de score draagt, foley op het beeld. Eén tijdlijn van 42 s.

96 bpm, één maat = 2,5 s. De cues komen uit events.json (door de pagina geëxporteerd, zie index.html: EVF).
Muziek op de voorgrond, geluidseffecten ongeveer 7 dB eronder; mux.sh normaliseert daarna naar -14 LUFS.

usage (library root): LIB=$PWD .venv/bin/python <project>/mix.py
schrijft out/mix-full.wav
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
rng = np.random.default_rng(5)
BEAT = 60 / 96; BAR = 4 * BEAT
evs = lambda k: [e for e in EV if e['type'] == k]


def env_lin(points):
    ts, vs = zip(*points); return np.interp(tt, ts, vs)


def st(x): return np.stack([x, np.roll(x, 1733)], 1)


fx = np.zeros((N, 2)); music = np.zeros((N, 2))
STAT = [e['t'] for e in evs('stat')]; CARD = evs('card')[0]['t']

# ---------------- ambience: wind in het dal, dunner als de camera klimt ----------------
gust = 1 + .5 * np.sin(2 * np.pi * tt / 3.7) * np.sin(2 * np.pi * tt / 8.3)
wind = bp(rng.standard_normal(N), 180, 2400, 2) * gust * env_lin([(0, 0), (.6, .03), (4.2, .034), (7, .016), (10, .01), (17, .01), (26.5, .012), (28.5, .03), (31, .026), (33, .01), (CARD, .008), (FULL, .004)])
air = bp(rng.standard_normal(N), 400, 6000, 2) * env_lin([(0, 0), (1, .006), (8, .012), (26, .012), (31, .008), (36, .012), (FULL, .005)])
for x in (wind, air): fx += st(x)

# ---------------- score: A-mineur, strijkers, harp, glockenspiel, hoorn, framedrum ----------------
ev = []
CH = {'Am': [45, 52, 57, 60, 64], 'F': [41, 48, 53, 57, 60], 'C': [36, 43, 48, 52, 55], 'G': [43, 50, 55, 59, 62], 'Dm': [38, 45, 50, 53, 57], 'E': [40, 47, 52, 56, 59]}
bar = lambda b: (b - 1) * BAR
# maat 1-2: de helling. Lage cellopedaal, gestreken vibrafoon in de hoogte
ev += [(0.0, 'cellos', 'A2', 5.2, .34, 0, .3), (0.1, 'vibraphone_bowed', 'E5', 5.0, .3, -.3, .22), (1.0, 'hand_chimes', 'A5', 2.0, .34, .2, .32),
       (2.5, 'vibraphone_bowed', 'C6', 2.8, .22, .3, .16)]
# maat 2-4: de klim naar de kust, pizzicato in kwarten
for b, ch in [(2, 'Am'), (3, 'F'), (4, 'C')]:
    c = CH[ch]
    for q in range(4): ev.append((bar(b) + q * BEAT, 'contrabass_pizz', c[0] if q % 2 == 0 else c[1], .5, .5 if q == 0 else .38, -.05, .55))
    ev.append((bar(b), 'frame_drum', 'large_muted', None, .36, 0, .45))
# maat 5-7: de regen. Harp-arpeggio's als druppels, valt west → oost weg (dunner per maat)
for b, ch, dens in [(5, 'Am', 8), (6, 'F', 6), (7, 'G', 4)]:
    c = CH[ch]
    for i, k in enumerate([1, 2, 3, 4, 3, 2, 3, 4][:dens]): ev.append((bar(b) + i * BEAT / 2, 'harp', c[k] + 12, 1.2, .32 + .05 * (i == 0), -.25 + .07 * i, .38))
    ev.append((bar(b), 'contrabass', c[0], 2.4, .34, 0, .28))
# maat 8-11: de drie subregio's. Cello spiccato in achtsten, pizzicato eronder
for b, ch in [(8, 'Am'), (9, 'F'), (10, 'C'), (11, 'G')]:
    c = CH[ch]
    for i, k in enumerate([2, 3, 2, 1, 2, 3, 2, 3]): ev.append((bar(b) + i * BEAT / 2, 'cellos_spic', c[k] + 12, .25, .3 + .08 * (i % 2 == 0), .25, .45))
    for q in range(4): ev.append((bar(b) + q * BEAT, 'contrabass_pizz', c[0] if q % 2 == 0 else c[1], .5, .44 if q == 0 else .34, -.05, .5))
    ev.append((bar(b), 'frame_drum', 'large_muted', None, .4, 0, .5))
# maat 11-12: schist. Terug naar de pedaal
ev += [(26.6, 'cellos', 'E2', 4.6, .32, 0, .28), (26.8, 'vibraphone_bowed', 'B4', 4.2, .26, -.2, .18), (27.6, 'hand_chimes', 'E6', 2.0, .34, .25, .32)]
# maat 13-15: de regio. Hoornen onder 1756, harp en trom vol
ev += [(STAT[0] - .3, 'horn', 'A3', 3.2, .42, -.1, .34), (STAT[0] - .3, 'horn', 'C4', 3.2, .38, .1, .3), (STAT[0], 'glockenspiel', 'E6', 1.6, .34, .3, .3),
       (STAT[0], 'frame_drum', 'large', None, .52, 0, .6)]
for b, ch in [(14, 'F'), (15, 'G')]:
    c = CH[ch]
    for i, k in enumerate([1, 2, 3, 4, 3, 2, 3, 4]): ev.append((bar(b) + i * BEAT / 2, 'harp', c[k] + 12, 1.2, .34, -.2 + .05 * i, .4))
    ev.append((bar(b), 'contrabass', c[0], 2.4, .38, 0, .3))
if len(STAT) > 1: ev += [(STAT[1], 'glockenspiel', 'A5', 1.6, .32, -.2, .3), (STAT[1] - .2, 'horn', 'E3', 2.6, .36, 0, .28)]
# eindkaart: harp-rol op A, uitklinken
for i, p in enumerate([45, 57, 64, 69, 72, 76, 81]): ev.append((CARD + i * .03, 'harp', p, 3.0, .5, -.3 + i * .1, .5))
ev += [(CARD, 'vibraphone_bowed', 'A5', FULL - CARD, .26, -.2, .18), (CARD, 'vibraphone_bowed', 'E5', FULL - CARD, .24, .2, .14), (CARD, 'cellos', 'A2', FULL - CARD, .3, 0, .24)]
# klokjes op de pins en het oplichten
for e in evs('pin'): ev.append((e['t'], 'glockenspiel', [81, 76, 72][e.get('i', 0) % 3], 1.6, .32, [.2, -.35, .3][e.get('i', 0) % 3], .32))
for e in evs('ignite'): ev.append((e['t'] + .4, 'hand_chimes', [69, 72, 74, 76, 81][e.get('i', 0) % 5], 1.6, .34, -.3 + .15 * e.get('i', 0), .34))
S.seed(13)
sc = S.render(ev, dur=FULL + 1, master=False)[:N]
f0 = 55.0
drone = np.sin(2 * np.pi * f0 * tt) + .45 * np.sin(4 * np.pi * f0 * tt) + .22 * np.sin(6 * np.pi * f0 * tt)
drone *= env_lin([(0, 0), (1.0, .02), (10, .024), (17, .024), (26.6, .016), (31, .028), (CARD, .032), (FULL, .012)])
sc += st(drone)
sc = np.stack([hp(sc[:, c], 32, 2) for c in range(2)], 1)
sc = S.room(sc, size=.55, mix=.24)
music += sc

# ---------------- foley aan het beeld ----------------
for e in EV:
    k, t, i = e['type'], e['t'], e.get('i', 0)
    if k == 'word':
        for d in (0, .06): add(fx, hp(click(pitch=1.0, v=1.0), 1500) * .06, t + d, 1, .1)
    elif k == 'pin':
        add(fx, hp(click(pitch=1.5, v=1.0), 2200) * .05, t, 1, [.2, -.35, .3][i % 3])
        if i in (1, 2):                                    # regenpins: een druppel
            n = int(.35 * SR); x = np.arange(n) / SR
            add(fx, np.sin(2 * np.pi * (900 - 500 * x / .35) * x) * np.exp(-x / .06) * .05, t + .05, 1, [-.3, .3][i - 1])
    elif k == 'ignite':
        add(fx, thump(.8, 52) * (.16 if i in (0, 2) else .09), t, 1, 0)
        for j in range(3): add(fx, hp(click(pitch=1.2 + .08 * j, v=1.0), 1800) * .03, t + .4 + j * .08, 1, .2)
    elif k in ('rise', 'whoosh', 'dive'): add(fx, lp(whoosh(1.6, 1.0), 2200) * .07, t, 1, 0)
    elif k == 'stat':
        for j in range(4): add(fx, hp(click(pitch=1.0 + .1 * j, v=1.0), 1500) * .045, t + j * .12, 1, 0)
    elif k == 'card': add(fx, thump(.9, 46) * .14, t, 1, 0)

# geen stem: de muziek draagt, effecten en lucht ~7 dB eronder (RMS over de hele film)
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
