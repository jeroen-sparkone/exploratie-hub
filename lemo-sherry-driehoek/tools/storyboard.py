"""Storyboard: 9 key shots met nummer, kader, duur en regel eronder. usage: python -I tools/storyboard.py <project>"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
P = sys.argv[1]; SB = os.path.join(P, 'out', 'sb')
SHOTS = [(2.2, '1 · dichtbij, laag · 0–4 s', 'Trage track over albariza ten noorden van Jerez', 'Deze witte grond maakt sherry mogelijk.'),
  (7.0, '2 · klim · 4–13 s', 'Kraan omhoog, de kust komt in beeld', 'Albariza: kalkrijke mergel die water vasthoudt …'),
  (12.2, '2 · breed · 4–13 s', 'Drie pins, driehoek met gemeten km', 'Die grond ligt tussen Jerez, Sanlúcar en El Puerto.'),
  (15.8, '3 · pull-out west · 13–18 s', 'Poniente stroomt uit de oceaan (amber)', 'Uit het westen waait de poniente …'),
  (24.0, '4 · push-in · 18–31 s', 'Sanlúcar aan de monding, ringpuls', 'In Sanlúcar, aan de riviermonding …'),
  (29.6, '4 · medium · 18–31 s', 'Na halve maat stilte: de regel', 'Alleen in Sanlúcar mag manzanilla rijpen.'),
  (34.2, '5 · orbit oost · 31–36 s', 'Levante uit het binnenland (teal)', 'Uit het oosten komt de levante: heet en droog.'),
  (37.8, '6 · klim · 36–39 s', 'Hele driehoek, getal blijft staan', 'Twee winden, één witte bodem.'),
  (41.5, '7 · eindkaart · 39–44 s', 'Huisstijl VinoVonk, CTA', '(geen stem)')]
F = os.path.join(P, 'fonts', 'BarlowCondensed-SemiBold.ttf'); FR = os.path.join(P, 'fonts', 'BarlowCondensed-Regular.ttf')
f1, f2 = ImageFont.truetype(F, 30), ImageFont.truetype(FR, 24)
w, h, cap, cols = 420, 747, 120, 3
S = Image.new('RGB', (cols * w + (cols + 1) * 20, 3 * (h + cap) + 4 * 20 + 90), (14, 16, 20)); d = ImageDraw.Draw(S)
d.text((20, 26), 'SHERRY-DRIEHOEK · STORYBOARD · 9:16 · ±44 S · 3D MAP EXPLAINER', font=ImageFont.truetype(F, 40), fill=(246, 238, 224))
for k, (t, a, b, c) in enumerate(SHOTS):
    x, y = 20 + (k % cols) * (w + 20), 90 + (k // cols) * (h + cap + 20)
    S.paste(Image.open(os.path.join(SB, f't_{t:g}.jpg')).convert('RGB').resize((w, h), Image.LANCZOS), (x, y))
    d.text((x, y + h + 8), a.upper(), font=f1, fill=(255, 195, 107))
    d.text((x, y + h + 44), b, font=f2, fill=(232, 224, 208))
    d.text((x, y + h + 76), '“' + c + '”', font=f2, fill=(170, 170, 170))
out = os.path.join(P, 'STORYBOARD.jpg'); S.save(out, quality=90); print(out, S.size)
