"""Fonts (SIL Open Font License 1.1): Barlow Condensed (kaart en ondertitels) en Noto Serif 900 (eindkaart, VinoVonk-huisstijl).
usage (library root): .venv/bin/python -I <project>/tools/fonts.py <project>
"""
import os, re, sys, urllib.request
D = sys.argv[1]; F = os.path.join(D, 'fonts'); os.makedirs(F, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
for w in ('Regular', 'Medium', 'SemiBold'):
    p = os.path.join(F, f'BarlowCondensed-{w}.ttf')
    if not os.path.exists(p):
        open(p, 'wb').write(get(f'https://github.com/google/fonts/raw/main/ofl/barlowcondensed/BarlowCondensed-{w}.ttf'))
p = os.path.join(F, 'NotoSerif-900.woff2')
if not os.path.exists(p):
    css = get('https://fonts.googleapis.com/css2?family=Noto+Serif:wght@900').decode()
    open(p, 'wb').write(get(re.findall(r'url\((https://[^)]+)\)', css)[-1]))
print('fonts ok')
