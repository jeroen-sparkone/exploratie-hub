"""Storyboard: 9 key shots met nummer, kader, duur en regel eronder. usage: python -I tools/storyboard.py <project>"""
import sys, os
from PIL import Image, ImageDraw, ImageFont
P = sys.argv[1]; SB = os.path.join(P, 'out', 'sb')
SHOTS = [(0.0, '1 · hook · 0–4,5 s', 'Ruby en tawny naast elkaar, kop vanaf frame 0', 'Port heeft twee families.'),
  (7.0, '2 · twee families · 4,5–9 s', 'Fles links, vat rechts, elk met zijn glas', 'Ruby blijft jong in de fles. Tawny rijpt jaren in hout.'),
  (12.6, '3 · ruby-tak · 9–14,5 s', 'Ruby, reserve, LBV, vintage; pijl eenvoudig → zeldzaam', 'Van ruby naar vintage: van eenvoudig naar zeldzaam.'),
  (17.0, '3 · inzet · 14,5–20 s', 'Bodem van een oude vintage: depot', 'Een oude vintage heeft depot. Die decanteer je.'),
  (22.6, '4 · tawny-tak · 20–25 s', 'Vat in doorsnede, de wijn kleurt naar amber; drie glazen', 'Tawny oxideert langzaam in het vat.'),
  (27.0, '4 · kader · 25–30 s', '10 Years Old is een blend, geen leeftijd', 'Het getal op een tawny is geen leeftijd.'),
  (32.5, '5 · wit en rosé · 30–35 s', 'Twee glazen, met de zoetheidsband van wit', 'Wit van extra droog tot lágrima. Rosé jong en ijskoud.'),
  (39.0, '6 · grafiek · 35–41 s', 'Hoelang open, logaritmisch, bron IVDP', 'Voor de feestdagen: kies een tawny.'),
  (43.0, '7 · eindslide · 41–45 s', 'Donkere carousel-slide, gids-URL, geen keyword', '(geen stem, alleen muziek)')]
F = os.path.join(P, '..', 'lemo-douro', 'fonts', 'BarlowCondensed-SemiBold.ttf'); FR = os.path.join(P, '..', 'lemo-douro', 'fonts', 'BarlowCondensed-Regular.ttf')
f1, f2 = ImageFont.truetype(F, 30), ImageFont.truetype(FR, 24)
w, h, cap, cols = 420, 747, 120, 3
S = Image.new('RGB', (cols * w + (cols + 1) * 20, 3 * (h + cap) + 4 * 20 + 90), (14, 16, 20)); d = ImageDraw.Draw(S)
d.text((20, 26), 'SOORTEN PORT · STORYBOARD · 9:16 · 45 S · VINOVONK-ILLUSTRATIE · ZONDER STEM', font=ImageFont.truetype(F, 40), fill=(246, 238, 224))
for k, (t, a, b, c) in enumerate(SHOTS):
    x, y = 20 + (k % cols) * (w + 20), 90 + (k // cols) * (h + cap + 20)
    S.paste(Image.open(os.path.join(SB, f't_{t:g}.jpg')).convert('RGB').resize((w, h), Image.LANCZOS), (x, y))
    d.text((x, y + h + 8), a.upper(), font=f1, fill=(255, 195, 107))
    d.text((x, y + h + 44), b, font=f2, fill=(232, 224, 208))
    d.text((x, y + h + 76), '“' + c + '”', font=f2, fill=(170, 170, 170))
out = os.path.join(P, 'STORYBOARD.jpg'); S.save(out, quality=90); print(out, S.size)
