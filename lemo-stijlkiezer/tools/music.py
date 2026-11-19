"""Muziek voor de testclips (zonder stem): 96 bpm, D-mineur, op de beweging van de tijdlijn in styles.js.
0-1 s titel · 1,2/1,6/2,0 steden · 2,4-3,4 driehoek · 3,6-5,9 wind · daarna rustig doorstromen · slotakkoord 11,2.
Plucked strings en harp voor de grond, glockenspiel per stad, cello spiccato onder de wind, framedrum op de downbeats,
een zachte windbed. Samples CC0 (Versilian). usage: LIB=$PWD .venv/bin/python <project>/tools/music.py <project>
"""
import os, sys
import numpy as np, soundfile as sf
LIB = os.environ['LIB']; sys.path.insert(0, LIB)
from core.audio import sampler as S
from core.audio.sfx import SR, bp, lp, hp, add, whoosh, thump

P = sys.argv[1]; DUR = 12.6; N = int(DUR * SR) + SR; tt = np.arange(N) / SR; rng = np.random.default_rng(4)
BEAT = 60 / 96; BAR = 4 * BEAT
CH = {'Dm': [38, 45, 50, 53, 57], 'Bb': [34, 41, 46, 50, 53], 'F': [41, 48, 53, 57, 60], 'C': [36, 43, 48, 52, 55]}
ev = []
# titel: gestreken vibrafoon + lage cello, één pluck
ev += [(0.0, 'cellos', 'D2', 3.4, .32, 0, .3), (0.05, 'vibraphone_bowed', 'A5', 3.2, .3, -.3, .22), (0.15, 'contrabass_pizz', 'D2', 1.2, .5, 0, .5)]
# steden: één glockenspielnoot per pin, oplopend
for t, p, pan in [(1.2, 74, -.35), (1.6, 77, .2), (2.0, 81, .1)]: ev.append((t, 'glockenspiel', p, 1.4, .38, pan, .36))
# driehoek: harp-arpeggio dat meeloopt met de lijn, framedrum als hij sluit
for i, p in enumerate([62, 65, 69, 74, 77]): ev.append((2.4 + i * .2, 'harp', p, 1.2, .34, -.2 + .1 * i, .36))
ev.append((3.4, 'frame_drum', 'large', None, .5, 0, .55))
# wind: pizzicato-puls in kwartnoten + cello spiccato in achtsten, vier maten
for b, ch in enumerate(['Dm', 'Bb', 'F', 'C']):
    t0 = 3.4 + b * BAR; c = CH[ch]
    if t0 > DUR - 1.5: break
    for q in range(4): ev.append((t0 + q * BEAT, 'contrabass_pizz', c[0] if q % 2 == 0 else c[1], .5, .48 if q == 0 else .36, -.05, .5))
    for i, k in enumerate([2, 3, 2, 1, 2, 3, 2, 3]): ev.append((t0 + i * BEAT / 2, 'cellos_spic', c[k] + 12, .25, .28 + .08 * (i % 2 == 0), .25, .42))
    ev.append((t0, 'frame_drum', 'large_muted', None, .38, 0, .45))
    if b >= 1: ev.append((t0, 'harp', c[3] + 12, 1.4, .3, -.25, .3))
# slotakkoord, laat uitklinken
for i, p in enumerate([38, 50, 57, 62, 65, 69]): ev.append((11.2 + i * .03, 'harp', p, 1.4, .46, -.3 + i * .1, .46))
ev += [(11.2, 'vibraphone_bowed', 'D5', 1.4, .28, .2, .2)]
S.seed(5)
mus = S.render(ev, dur=DUR + 1, master=False)[:N]
mus = np.stack([hp(mus[:, c], 32, 2) for c in range(2)], 1)
mus = S.room(mus, size=.5, mix=.2)
# windbed: zwelt aan met de windlijnen
env = np.interp(tt, [0, 3.4, 4.6, 9.5, DUR], [.004, .004, .022, .016, .004])
gust = 1 + .4 * np.sin(2 * np.pi * tt / 3.1)
wind = bp(rng.standard_normal(N), 220, 1500, 2) * env * gust
mix = mus + np.stack([wind, np.roll(wind, 1733)], 1)
add(mix, lp(whoosh(1.6, .9), 2200) * .05, 3.5, 1, -.3)
add(mix, thump(.6, 50) * .06, 11.2, 1, 0)
out = mix[:int(DUR * SR)]; nf = int(.9 * SR); out[-nf:] *= np.linspace(1, 0, nf)[:, None] ** 1.5
sf.write(os.path.join(P, 'out', 'clip-music.wav'), (out / max(1e-6, np.abs(out).max()) * .8).astype(np.float32), SR)
print('muziek ok', DUR, 's')
