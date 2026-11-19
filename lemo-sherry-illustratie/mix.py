"""Geluid voor de sherry-driehoek: NL-vertelling + score + foley op één tijdlijn van 44 s.

96 bpm, één maat = 2,5 s. De cues komen uit events.json (door de pagina geëxporteerd) en voice/cues.json.
Stem gecomprimeerd, muziek ~10 dB eronder (RMS over de gesproken delen), muziek uitgesneden op 300 Hz-4 kHz en geduckt onder elke regel.

usage (library root): LIB=$PWD .venv/bin/python <project>/mix.py
schrijft out/mix-full.wav
"""
import json, os, sys
import numpy as np, soundfile as sf, soxr
LIB = os.environ['LIB']
sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, bp, lp, hp, add, compress, limit, click, whoosh, thump

HERE = os.path.dirname(os.path.abspath(__file__))
D = json.load(open(os.path.join(HERE, 'events.json')))
FULL = float(D['dur']); EV = D['ev']
# MIX_LANG=en: Engelse stem (out/voice_en, voice/cues.en.json) · NOVOICE=1: alleen muziek en geluid, muziek op de voorgrond
VL = os.environ.get('MIX_LANG', 'nl'); NOVOICE = os.environ.get('NOVOICE') == '1'
CUES = json.load(open(os.path.join(HERE, 'voice', 'cues.json' if VL == 'nl' else f'cues.{VL}.json')))
VDIR = os.path.join(HERE, 'out', 'voice' if VL == 'nl' else f'voice_{VL}')
MIX_OUT = os.environ.get('MIX_OUT', 'mix-full.wav')
N = int(FULL * SR) + SR
tt = np.arange(N) / SR
rng = np.random.default_rng(7)
BEAT = 60 / 96; BAR = 4 * BEAT
evs = lambda k: [e for e in EV if e['type'] == k]
one = lambda k: evs(k)[0]['t']


def env_lin(points):
    ts, vs = zip(*points); return np.interp(tt, ts, vs)


def st(x): return np.stack([x, np.roll(x, 1733)], 1)


mix = np.zeros((N, 2)); music = np.zeros((N, 2))
SIL0, SIL1 = one('silence'), one('rule')              # halve maat bijna-stilte vóór de regel

# ---------------- ambience ----------------
# dunne lucht laag bij de grond, dunner als de camera klimt
air = bp(rng.standard_normal(N), 250, 5200, 2) * env_lin([(0, 0), (.5, .018), (4.2, .02), (10, .011), (13, .009), (18.2, .009), (21, .014), (27.6, .014), (SIL0, .004), (SIL1, .012), (31, .012), (36.4, .009), (FULL, .007)])
# zee onder de lage shots en de pull-out
surf = lp(bp(rng.standard_normal(N), 120, 900, 1), 700) * env_lin([(0, 0), (7.5, 0), (9, .012), (12.8, .016), (14, .03), (18.2, .03), (21, .04), (27.6, .04), (SIL0, .015), (SIL1, .03), (31, .03), (32.5, .01), (FULL, .008)])
# poniente: koele, ronde zeewind, langzaam golvend
gust = 1 + .45 * np.sin(2 * np.pi * tt / 3.3) * np.sin(2 * np.pi * tt / 7.1)
poni = bp(rng.standard_normal(N), 220, 1600, 2) * gust * env_lin([(0, 0), (13.4, 0), (15.2, .05), (18.2, .045), (21, .035), (27.6, .03), (SIL0, .008), (SIL1, .02), (31.0, .02), (32.4, .006), (FULL, .004)])
# levante: droog, hoger, korrelig
grit = (rng.random(N) < .004) * rng.standard_normal(N)
leva = (bp(rng.standard_normal(N), 1400, 6500, 2) + bp(grit, 2000, 8000, 1) * 2.5) * env_lin([(0, 0), (31.6, 0), (33.2, .03), (36.4, .028), (40.4, .012), (FULL, .006)])
for x in (air, surf, poni, leva): mix += st(x)

# ---------------- score: D-mineur, plucked strings, cello spiccato, harp, vibrafoon, framedrum ----------------
ev = []
CH = {'Dm': [38, 45, 50, 53, 57], 'Bb': [34, 41, 46, 50, 53], 'C': [36, 43, 48, 52, 55], 'F': [41, 48, 53, 57, 60], 'Gm': [43, 50, 55, 58, 62]}
# maat 1-2: de grond. Lage cello-pedaal, gestreken vibrafoon in de hoogte, één pluck op "witte grond"
ev += [(0.0, 'cellos', 'D2', 5.2, .34, 0, .3), (0.1, 'vibraphone_bowed', 'A5', 5.0, .32, -.3, .24), (0.4, 'contrabass_pizz', 'D2', 1.4, .5, 0, .5),
       (2.5, 'vibraphone_bowed', 'F5', 3.0, .26, .3, .18)]
# maat 3-5: de klim, plucked pulse in kwartnoten
for b, ch in [(3, 'Dm'), (4, 'Bb'), (5, 'F')]:
    t0 = (b - 1) * BAR; c = CH[ch]
    for q in range(4): ev.append((t0 + q * BEAT, 'contrabass_pizz', c[0] if q % 2 == 0 else c[1], .5, .5 if q == 0 else .38, -.05, .55))
    ev.append((t0, 'frame_drum', 'large_muted', None, .36, 0, .45))
for e in evs('pin'): ev.append((e['t'], 'glockenspiel', [81, 77, 74][e['i']], 1.6, .34, [.2, -.35, .1][e['i']], .34))
for e in evs('ignite'):
    if e['i'] == 0: ev += [(e['t'], 'contrabass', 'D2', 2.0, .44, 0, .36), (e['t'], 'frame_drum', 'large', None, .5, 0, .6)]
    ev.append((e['t'] + .5, 'hand_chimes', [69, 74, 77][e['i']], 1.6, .36, -.3 + .3 * e['i'], .36))
# maat 6-8: de poniente. Cello spiccato, de beweging begint
for b, ch in [(6, 'Dm'), (7, 'Bb'), (8, 'C')]:
    t0 = (b - 1) * BAR; c = CH[ch]
    for i, k in enumerate([2, 3, 2, 1, 2, 3, 2, 3]): ev.append((t0 + i * BEAT / 2, 'cellos_spic', c[k] + 12, .25, .3 + .08 * (i % 2 == 0), .25, .45))
    for q in range(4): ev.append((t0 + q * BEAT, 'contrabass_pizz', c[0] if q % 2 == 0 else c[1], .5, .44 if q == 0 else .34, -.05, .5))
    ev.append((t0, 'frame_drum', 'large_muted', None, .4, 0, .5))
# maat 8-11: Sanlúcar. Harp-arpeggio's en gestreken vibrafoon, lucht en licht
for b, ch in [(9, 'F'), (10, 'Dm'), (11, 'Bb')]:
    t0 = (b - 1) * BAR; c = CH[ch]
    for i, k in enumerate([1, 2, 3, 4, 3, 2, 3, 4]): ev.append((t0 + i * BEAT / 2, 'harp', c[k] + 12, 1.2, .32 + .05 * (i == 0), -.2 + .05 * i, .38))
    ev.append((t0, 'contrabass', c[0], 2.4, .36, 0, .28))
ev += [(20.0, 'vibraphone_bowed', 'C5', 5.0, .26, -.2, .16), (25.0, 'vibraphone_bowed', 'D5', 2.6, .26, .2, .16)]
ring = one('ring'); ev += [(ring, 'frame_drum', 'large', None, .52, 0, .6), (ring, 'hand_chimes', 'A5', 2.2, .4, .2, .4)]
# maat 12: de stilte, dan de regel op de eerste tel na de stilte
ev += [(SIL1, 'contrabass', 'D1', 3.0, .46, 0, .42), (SIL1, 'hand_chimes', 'D6', 2.4, .46, .25, .46), (SIL1, 'vibraphone_bowed', 'A4', 3.0, .3, -.2, .2)]
# maat 13-15: de levante. Lager, droger, meer trom
for b, ch in [(13, 'Gm'), (14, 'Dm'), (15, 'Bb')]:
    t0 = (b - 1) * BAR; c = CH[ch]
    for i, k in enumerate([0, 1, 0, 2, 0, 1, 0, 1]): ev.append((t0 + i * BEAT / 2, 'cellos_spic', c[k], .22, .3 + .08 * (i % 2 == 0), -.2, .42))
    for q in range(4): ev.append((t0 + q * BEAT, 'frame_drum', 'large_muted' if q else 'large', None, .44 if q == 0 else .3, 0, .45))
# maat 15-16: de klim en het getal. Hoorn-swell onder 6.867
stat = one('stat'); ev += [(stat - .3, 'horn', 'F3', 2.6, .4, -.1, .32), (stat - .3, 'horn', 'A3', 2.6, .36, .1, .28), (stat, 'glockenspiel', 'A5', 1.5, .32, .3, .3)]
# eindkaart: rustende D, uitklinken
card = one('card')
for i, p in enumerate([38, 50, 57, 62, 64, 69, 74]): ev.append((card + i * .03, 'harp', p, 3.0, .5, -.3 + i * .1, .5))
ev += [(card, 'vibraphone_bowed', 'D5', FULL - card, .28, -.2, .18), (card, 'vibraphone_bowed', 'A5', FULL - card, .26, .2, .14), (card, 'cellos', 'D2', FULL - card, .3, 0, .24)]
# de stilte geldt ook voor de score: wat over de stilte heen zou klinken, eruit
ev = [e for e in ev if not (SIL0 - .05 <= e[0] < SIL1 - .02)]
S.seed(11)
sc = S.render(ev, dur=FULL + 1, master=False)[:N]
f0 = 36.71
drone = np.sin(2 * np.pi * f0 * tt) + .45 * np.sin(4 * np.pi * f0 * tt) + .22 * np.sin(6 * np.pi * f0 * tt)
drone *= env_lin([(0, 0), (1.0, .022), (12, .028), (18.2, .026), (SIL0 - .2, .024), (SIL0 + .1, .006), (SIL1, .03), (36.4, .03), (stat, .04), (FULL, .012)])
sc += st(drone)
gate = env_lin([(0, 1), (SIL0 - .1, 1), (SIL0 + .25, .12), (SIL1 - .05, .12), (SIL1, 1), (FULL, 1)])
sc *= gate[:, None]
sc = np.stack([hp(sc[:, c], 32, 2) for c in range(2)], 1)
sc = S.room(sc, size=.55, mix=.22)
music += sc

# ---------------- foley aan het beeld ----------------
for e in EV:
    k, t = e['type'], e['t']
    if k == 'word':
        for d in (0, .06): add(mix, hp(click(pitch=1.0, v=1.0), 1500) * .06, t + d, 1, .1)
    elif k == 'pin': add(mix, hp(click(pitch=1.5, v=1.0), 2200) * .05, t, 1, [.2, -.35, .1][e['i']])
    elif k == 'ignite':
        add(mix, thump(.8, 52) * (.2 if e['i'] == 0 else .1), t, 1, 0)
        n = int(1.4 * SR); x = np.arange(n) / SR
        buzz = bp(np.sin(2 * np.pi * 110 * x) + .5 * np.sin(2 * np.pi * 220.7 * x) + .3 * rng.standard_normal(n), 150, 2400, 1) * np.exp(-x / .5) * np.minimum(1, x / .05)
        add(mix, buzz * .025, t, 1, -.2 + .2 * e['i'])
        for i in range(4): add(mix, hp(click(pitch=1.2 + .08 * i, v=1.0), 1800) * .035, t + .5 + i * .08, 1, .2)
    elif k == 'poniente':
        n = int(2.2 * SR); x = np.arange(n) / SR
        sh = bp(rng.standard_normal(n) + .4 * np.sin(2 * np.pi * 180 * x), 400, 3000, 1) * np.sin(np.pi * np.clip(x / 2.2, 0, 1)) ** 2
        add(mix, sh * .035, t, 1, -.4)
    elif k == 'levante':
        n = int(2.2 * SR); x = np.arange(n) / SR
        sh = bp(rng.standard_normal(n), 1800, 7000, 1) * np.sin(np.pi * np.clip(x / 2.2, 0, 1)) ** 2
        add(mix, sh * .035, t, 1, .4)
    elif k == 'ring':
        for d in (0, .8): add(mix, hp(click(pitch=1.1, v=1.0), 1500) * .05, t + d, 1, -.1)
    elif k in ('rise', 'whoosh', 'dive', 'orbit'): add(mix, lp(whoosh(1.6, 1.0), 2200) * .07, t, 1, 0)
    elif k == 'stat':
        for i in range(4): add(mix, hp(click(pitch=1.0 + .1 * i, v=1.0), 1500) * .045, t + i * .12, 1, 0)
    elif k == 'card': add(mix, thump(.9, 46) * .14, t, 1, 0)
mix *= np.clip(gate * 1.6, .3, 1)[:, None] ** .5            # ook ambience zakt in de stilte, minder diep

# stemband uit de muziek, dan ducken onder elke regel
if not NOVOICE:
    mid = np.stack([bp(music[:, c], 300, 4000, 2) for c in range(2)], 1)
    music = music - mid * (1 - 10 ** (-4 / 20))

# ---------------- vertelling ----------------
voice = np.zeros(N); active = np.zeros(N)
for c in ([] if NOVOICE else CUES):
    x, sr = sf.read(os.path.join(VDIR, c['id'] + '.wav'), dtype='float64')
    if x.ndim > 1: x = x.mean(1)
    if sr != SR: x = soxr.resample(x, sr, SR)
    i = int(c['t0'] * SR); j = min(N, i + len(x)); voice[i:j] += x[:j - i]; active[i:j] = 1
if NOVOICE:   # geen stem: muziek draagt, geluidseffecten ~7 dB eronder
    act = np.ones(N, bool)
    mr = np.sqrt((music[act] ** 2).mean()); music *= .16 / mr
    fx_r = np.sqrt((mix[act] ** 2).mean()); mix *= min(1.0, (.16 * 10 ** (-7 / 20)) / max(fx_r, 1e-9))
else:
    voice = hp(voice, 80, 2)
    voice = compress(voice, thr=.18, ratio=3.0)
    duck = np.convolve(active, np.ones(int(.25 * SR)) / int(.25 * SR), 'same')
    duck = 1 - .45 * np.clip(duck * 1.4, 0, 1)
    music = music * duck[:, None]
    vr = np.sqrt((voice[active > 0] ** 2).mean())
    voice *= .16 / vr
    mr = np.sqrt((music[active > 0] ** 2).mean())
    music *= (.16 * 10 ** (-10 / 20)) / mr
    fx_r = np.sqrt((mix[active > 0] ** 2).mean())
    mix *= min(1.0, (.16 * 10 ** (-12 / 20)) / max(fx_r, 1e-9))
mix += music + np.stack([voice, voice], 1)

out = mix[:int(FULL * SR)].copy()
nf = int(1.1 * SR); out[-nf:] *= np.linspace(1, 0, nf)[:, None] ** 1.5
out = np.stack([compress(out[:, 0], thr=.35, ratio=2.0), compress(out[:, 1], thr=.35, ratio=2.0)], 1)
out = np.stack([limit(out[:, 0]), limit(out[:, 1])], 1)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', MIX_OUT), out.astype(np.float32), SR)
used = sorted({e[1] for e in ev})
print('mix ok', round(FULL, 2), 's ·', ', '.join(used))
