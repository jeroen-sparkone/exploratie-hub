"""Fonts (SIL Open Font License 1.1), via de Google Fonts CSS API: Hanken Grotesk, JetBrains Mono, Instrument Serif.
usage: python3 tools/fonts.py <project>"""
import os, re, sys, urllib.request
D = sys.argv[1]; F = os.path.join(D, 'fonts'); os.makedirs(F, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120 Safari/537.36'}
get = lambda u: urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60).read()
for fam, w, out in [('Hanken+Grotesk', 500, 'Hanken-500'), ('Hanken+Grotesk', 700, 'Hanken-700'), ('JetBrains+Mono', 500, 'JBMono-500'), ('Instrument+Serif', 400, 'InstrumentSerif-400')]:
    p = os.path.join(F, out + '.woff2')
    if os.path.exists(p): continue
    css = get(f'https://fonts.googleapis.com/css2?family={fam}:wght@{w}').decode()
    open(p, 'wb').write(get(re.findall(r'url\((https://[^)]+)\)', css)[-1]))
print('fonts ok')
