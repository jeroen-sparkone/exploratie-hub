"""Storyboard: 9 key shots met nummer, kader, duur en regel eronder. usage: python -I tools/storyboard.py <project>"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
P = sys.argv[1]; SB = os.path.join(P, 'out', 'sb')
SHOTS = [(2.6, '1 · dichtbij · 0–5 s', 'Laptop, kelder.csv, opengesneden kelder', 'Mijn kelderlijst staat op mijn laptop …'),
  (8.5, '2 · pull-out · 5–11 s', 'Cloudbord verschijnt, geen directe lijn', 'Het taalmodel draait in een datacenter …'),
  (14.2, '3 · push · 11–17 s', 'Server bouwt op uit 100 lagen, teller loopt', 'Daartussen staat een MCP-server van honderd regels …'),
  (19.6, '4 · medium · 17–22 s', 'Drie tools poppen op: LIJST, ZOEK, TEL', 'Drie tools, alleen lezen …'),
  (24.0, '5 · breed · 22–28 s', 'Vraag omhoog, toolaanroep omlaag', 'In de toolbeschrijving staat dat het model eerst moet kijken.'),
  (30.9, '6 · inset · 28–34 s', 'Bestand wordt gelezen, twee treffers geel', 'De server leest het bestand bij elke vraag opnieuw.'),
  (36.4, '7 · medium · 34–38 s', 'Na korte stilte: niets gevonden', 'Vindt hij niets, dan zegt hij dat ook …'),
  (42.6, '8 · pull-out · 38–45 s', 'Alles grijs behalve server + gele kaartjes', 'Wat de tool teruggeeft, gaat wel naar de cloud.'),
  (47.0, '9 · eindkaart · 45–49 s', 'SparkOne-huisstijl, sparkone.nl', '(geen stem)')]
F = os.path.join(P, 'fonts', 'Hanken-700.woff2'); FR = os.path.join(P, 'fonts', 'Hanken-500.woff2')
f1, f2 = ImageFont.truetype(F, 30), ImageFont.truetype(FR, 24)
w, h, cap, cols = 420, 747, 120, 3
S = Image.new('RGB', (cols * w + (cols + 1) * 20, 3 * (h + cap) + 4 * 20 + 90), (14, 16, 20)); d = ImageDraw.Draw(S)
d.text((20, 26), 'KELDER ALS MCP-SERVER · STORYBOARD · 9:16 · 49 S', font=ImageFont.truetype(F, 40), fill=(246, 238, 224))
for k, (t, a, b, c) in enumerate(SHOTS):
    x, y = 20 + (k % cols) * (w + 20), 90 + (k // cols) * (h + cap + 20)
    S.paste(Image.open(os.path.join(SB, f't_{t:g}.jpg')).convert('RGB').resize((w, h), Image.LANCZOS), (x, y))
    d.text((x, y + h + 8), a.upper(), font=f1, fill=(255, 195, 107))
    d.text((x, y + h + 44), b, font=f2, fill=(232, 224, 208))
    d.text((x, y + h + 76), '“' + c + '”', font=f2, fill=(170, 170, 170))
out = os.path.join(P, 'STORYBOARD.jpg'); S.save(out, quality=90); print(out, S.size)
