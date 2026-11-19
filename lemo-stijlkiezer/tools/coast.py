"""Kustlijn van de sherry-driehoek als polygonen, uit het watermasker van de map-explainer-proef.
Bron: ../lemo-sherry-driehoek/assets/wide_water.png (Sentinel-2 cloudless 2016 + AWS Terrain Tiles, zie die CREDITS).
Schrijft coast.json: { box: [W,S,E,N], polys: [[[u,v],...], ...] } met u,v in 0..1 binnen de uitsnede (v = 0 boven).
usage: python -I tools/coast.py <project>
"""
import sys, os, json, math
import numpy as np
from PIL import Image
from scipy import ndimage

P = sys.argv[1]
SRC = os.path.join(P, '..', 'lemo-sherry-driehoek', 'assets')
m = json.load(open(os.path.join(SRC, 'wide_meta.json')))
W0, S0, E0, N0 = m['bbox']
w = np.asarray(Image.open(os.path.join(SRC, 'wide_water.png')).convert('L'), np.float32) / 255
H, Wd = w.shape
# uitsnede (lon/lat), met de mercator-rij van elke breedtegraad
BOX = [-6.78, 36.40, -5.92, 36.98]
z = m['z'] - 1                                           # het masker staat op halve resolutie van de beeldzoom
def merc(lon, lat): n = 2 ** z * 256; return (lon + 180) / 360 * n, (1 - math.asinh(math.tan(math.radians(lat))) / math.pi) / 2 * n
mx0, my0 = merc(W0, N0); mx1, my1 = merc(E0, S0)
def px(lon, lat): x, y = merc(lon, lat); return (x - mx0) / (mx1 - mx0) * Wd, (y - my0) / (my1 - my0) * H
x0, y0 = px(BOX[0], BOX[3]); x1, y1 = px(BOX[2], BOX[1])
crop = w[int(y0):int(y1) + 1, int(x0):int(x1) + 1]
UP = 4
g = ndimage.gaussian_filter(ndimage.zoom(crop, UP, order=1), 2.2)
land = g < .5
# kleine eilandjes en meertjes weg
lab, n = ndimage.label(land); sz = ndimage.sum(land, lab, range(1, n + 1)); land = np.isin(lab, 1 + np.where(sz > 400)[0])
lab, n = ndimage.label(~land); sz = ndimage.sum(~land, lab, range(1, n + 1)); land = ~np.isin(lab, 1 + np.where(sz > 400)[0])
f = land.astype(np.float32); f = ndimage.gaussian_filter(f, 1.2)
Hh, Ww = f.shape

# marching squares op niveau .5 → segmenten → ketens
segs = []
def interp(a, b, va, vb): t = (.5 - va) / (vb - va); return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)
for j in range(Hh - 1):
    for i in range(Ww - 1):
        v = [f[j, i], f[j, i + 1], f[j + 1, i + 1], f[j + 1, i]]
        c = sum((1 << k) for k in range(4) if v[k] > .5)
        if c in (0, 15): continue
        P4 = [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]
        E = {0: (0, 1), 1: (1, 2), 2: (2, 3), 3: (3, 0)}
        pts = {e: interp(P4[a], P4[b], v[a], v[b]) for e, (a, b) in E.items() if (v[a] > .5) != (v[b] > .5)}
        es = list(pts)
        if len(es) == 2: segs.append((pts[es[0]], pts[es[1]]))
        elif len(es) == 4: segs += [(pts[0], pts[1]), (pts[2], pts[3])] if c in (5,) else [(pts[0], pts[3]), (pts[1], pts[2])]
key = lambda p: (round(p[0] * 1000), round(p[1] * 1000))
adj = {}
for a, b in segs: adj.setdefault(key(a), []).append(b); adj.setdefault(key(b), []).append(a)
used = set(); polys = []
for a, b in segs:
    if (key(a), key(b)) in used: continue
    chain = [a, b]; used.add((key(a), key(b))); used.add((key(b), key(a)))
    while True:
        last, prev = chain[-1], chain[-2]; nxt = None
        for c in adj.get(key(last), []):
            if (key(last), key(c)) not in used: nxt = c; break
        if nxt is None: break
        used.add((key(last), key(nxt))); used.add((key(nxt), key(last))); chain.append(nxt)
        if key(nxt) == key(chain[0]): break
    if len(chain) > 40: polys.append(chain[::2])
polys = [[[round(float(x) / (Ww - 1), 4), round(float(y) / (Hh - 1), 4)] for x, y in p] for p in polys]
# land-masker als klein grijsbeeld voor vulling binnen de lijnen
Image.fromarray((f * 255).astype(np.uint8)).save(os.path.join(P, 'land.png'))
json.dump({'box': BOX, 'polys': polys, 'size': [Ww, Hh]}, open(os.path.join(P, 'coast.json'), 'w'))
print('polygonen', len(polys), 'punten', sum(len(p) for p in polys), 'raster', Ww, Hh)
