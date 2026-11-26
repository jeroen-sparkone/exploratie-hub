"""Storyboard: 9 key shots met nummer, kader, duur en regel eronder. usage: python -I tools/storyboard.py <project>"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
P = sys.argv[1]; SB = os.path.join(P, 'out', 'sb')
SHOTS = [(2.5, '1 · dichtbij, laag · 0–4 s', 'Langzame push langs de helling bij Pinhão', 'Port groeit niet in Porto.'),
  (8.5, '2 · klim naar de kust · 4–10 s', 'Rivier licht op van zee tot Pinhão, maat 89 km', 'Hij groeit hier, 89 km landinwaarts.'),
  (14.0, '3 · wide, stroomopwaarts · 10–17 s', 'Fontes 1.200 mm tegen Barca d’Alva 380 mm', 'Stroomopwaarts valt de regen weg.'),
  (19.0, '4 · track langs de rivier · 17–26 s', 'Baixo Corgo licht op, met hectares', 'Drie subregio’s, van nat naar heet en droog.'),
  (21.0, '4 · track · 17–26 s', 'Cima Corgo, 20.427 ha wijngaard', '(zelfde regel)'),
  (23.8, '4 · track · 17–26 s', 'Douro Superior, 10.177 ha wijngaard', '(zelfde regel)'),
  (29.0, '5 · duik naar de helling · 26–31 s', 'Schist bij Pinhão', 'Schist, op steile hellingen. Werelderfgoed sinds 2001.'),
  (33.0, '6 · klim, hele regio · 31–38 s', '1756, daarna 43.808 ha wijngaard', 'Hier begint elke fles port.'),
  (40.0, '7 · eindkaart · 38–42 s', 'VinoVonk-rood, gids-URL, geen keyword (niet voor IG)', '(geen stem, alleen muziek)')]
F = os.path.join(P, 'fonts', 'BarlowCondensed-SemiBold.ttf'); FR = os.path.join(P, 'fonts', 'BarlowCondensed-Regular.ttf')
f1, f2 = ImageFont.truetype(F, 30), ImageFont.truetype(FR, 24)
w, h, cap, cols = 420, 747, 120, 3
S = Image.new('RGB', (cols * w + (cols + 1) * 20, 3 * (h + cap) + 4 * 20 + 90), (14, 16, 20)); d = ImageDraw.Draw(S)
d.text((20, 26), 'DOURO · STORYBOARD · 9:16 · ±42 S · 3D MAP EXPLAINER · ZONDER STEM', font=ImageFont.truetype(F, 40), fill=(246, 238, 224))
for k, (t, a, b, c) in enumerate(SHOTS):
    x, y = 20 + (k % cols) * (w + 20), 90 + (k // cols) * (h + cap + 20)
    S.paste(Image.open(os.path.join(SB, f't_{t:g}.jpg')).convert('RGB').resize((w, h), Image.LANCZOS), (x, y))
    d.text((x, y + h + 8), a.upper(), font=f1, fill=(255, 195, 107))
    d.text((x, y + h + 44), b, font=f2, fill=(232, 224, 208))
    d.text((x, y + h + 76), '“' + c + '”', font=f2, fill=(170, 170, 170))
out = os.path.join(P, 'STORYBOARD.jpg'); S.save(out, quality=90); print(out, S.size)
