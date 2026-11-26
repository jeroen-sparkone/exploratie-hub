# Kerstfles: tekstanimatie

Versie twee van de kerstfles-video, met de tien bewegingen die Jeroen op 26-11-2026 in de Motion Prompt-galerij koos.
De tekst en de feiten komen uit `contentskills/projects/port-kerstfles` (bron: gids soorten-port en de
IVDP-richtlijn voor hoelang port open goed blijft). Het formaat is 9:16 en 33,2 s, zonder stem, met muziek.
Er zijn twee varianten: `?cta=ig` (Reageer met PORTGIDS) en `?cta=web` (vinovonk.com).

De film is langer dan de 24,8 s van versie één, omdat elke tekst nu de leestijd uit `readcheck` haalt.

## Scènes en bewegingen

| Tijd | Scène | Beweging | Wat er gebeurt |
|---|---|---|---|
| 0–4,2 | Hook "Vintage port is de verkeerde kerstfles" | #023 Glitch | "verkeerde" hapert vijf stappen van 0,14 s; daarna zoomt het beeld weg |
| 3,85–5,25 | Overgang | #020 Zoom through | door de o van "port" de rode vintage-scène in |
| 4,2–8,4 | Vintage, "2 dagen" | #011 Squash & stretch | de 2 valt, stuitert twee keer en blijft staan |
| 8,4–11,8 | Kalender 25-27 dec | #002 Stagger, #003 Burst | de rijen komen gestaffeld op; op "voorbij" barst een ring open |
| 11,8–15,2 | Vintage of oude tawny | #014 Motion trail | een gouden bol met staart loopt van Vintage naar Oude tawny |
| 14,45–15,9 | Overgang | #019 Liquid transition | tawnykleurige vloeistof loopt van boven over het beeld, met de volgende scène erachter |
| 15,2–19,4 | Tawny, "4 maanden" | #007 Count-up | het getal telt op naar 4, met de pijlchip en de balk |
| 19,4–24,2 | Rijpt jaren in hout | #001 Pop-in | een vat-icoon springt in beeld met de badge "7+" |
| 24,2–28,6 | Zo schenk je hem | #001 Pop-in | drie iconen (°C, glas, kaas) springen per regel in beeld |
| 28,6–33,2 | Eindkaart | #001 Pop-in, #015 Particles | de PORTGIDS-chip (of vinovonk.com) springt in, confetti van onderen |

## Afwijkingen van de spec

De duur, de easing en de veerconstanten zijn overgenomen zoals de spec ze geeft. Afstanden zijn met 2 vermenigvuldigd,
omdat een kaart 539 px breed is en dit beeld 1080 px. De deeltjes zijn met 2,6 vermenigvuldigd, zodat ze boven de
onderrand uitkomen. Waar het tijdslot het niet toeliet, is er dit aangepast:

- **#023**: alleen de eerste uitbarsting. De tweede, op 2,9 s, zou in de zoom vallen. De kleurscheiding is goud en
  cyaan in plaats van koraal en cyaan.
- **#020**: de zoom start op 3,85 s, dus pas nadat de hook de leestijd heeft gehaald.
- **#011**: geen zijwaartse drift. Na de tweede stuiter veert de 2 in 0,15 s terug naar 1 en blijft staan, in
  plaats van door te blijven stuiteren.
- **#002**: het verdwijnen is naar het einde van de scène geschoven, in plaats van op 1,78 s.
- **#003**: de stempel "voorbij" vervangt het hartje. De ring is een ellips, zodat hij om het woord past. De vulling
  blijft staan, in plaats van na 1,9 s weg te vagen.
- **#014**: de bol loopt een halve lus van Vintage naar Oude tawny, anderhalf keer zo snel, zodat hij aankomt voordat
  de vloeistof begint.
- **#007**: tellen in 1,45 s in plaats van 2,45 s, met als doel 4. De kleur gaat van inkt naar oxblood in plaats van
  van wit naar geel.
- **#001**: het verdwijnen valt op het einde van de scène.
- **#015**: alleen deeltjes die na de landing van de CTA worden uitgestoten, zodat er geen confetti halverwege de
  vlucht verschijnt.

## Bouwen

```bash
sh build.sh
```

Stappen: events, muziek (`mix.py`), readcheck voor beide varianten, render op 24 fps, en een master op -14 LUFS.
Het resultaat is `kerstfles-ig.mp4` en `kerstfles-web.mp4`.

Licentie van de bewegingen: MIT, (c) 2026 Shohei Ohtaki. De regels staan bovenin `film.js`.
