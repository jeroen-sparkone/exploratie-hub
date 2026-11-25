# Videowachtrij: voorstel houden of laten vallen

Stand 21-11-2026. Dit is een voorstel: `video-queue.jsonl` is niet gewijzigd en er is niets gerenderd.

**Uitkomst: 8 houden, 52 laten vallen.**

Bronnen: `video-queue.jsonl`, `articles.jsonl`, `status.jsonl`, de Blotato-dump van 21-11 (IG @vinovonk vanaf 24-07), `cards-pack.md` en de filmbrieven. Alle 54 artikel-URL's geven 200.

Let op: @vinovonk-captions bevatten geen artikellink. "Heeft al een video" is dus vastgesteld door op wijn, producent of onderwerp in de caption te zoeken. Dat is sterk bewijs maar geen harde koppeling.

## Houden (8)

| Volgorde | Item | Waarom | Eerst nog doen |
|---|---|---|---|
| 1 | `champagne-aanbieding-kerst` | Heeft een deadline en nog geen enkele IG-post | Vóór half december live |
| 2 | `echte-champagne-herkennen-namaak` | Past bij champagne kopen rond de feestdagen, alleen een beeldpost in augustus | |
| 3 | `card-champagne-druiven` | Tijdloos, snel te maken, geen eerdere post gevonden | Cijfers 38/32/30 tegen de bron checken |
| 4 | `waarom-ik-geen-scores-geef` | Sterke mening, past bij de videoproef, nog geen video | |
| 5 | `fattoria-la-valentina-tre-bicchieri-geen-importeur` | Sterke haak, alleen een beeldpost | |
| 6 | `arctic-barolo-rivetto-hurtigruten` | Beeldend verhaal, nog geen video | Drie beeldposts gehad, dus een nieuwe invalshoek kiezen |
| 7 | `goede-wijn-kiezen` | Tijdloze gids, geen IG-post gevonden | Staat nu als EN (`how-to-choose-a-good-wine`), omzetten naar de NL-versie |
| 8 | `droge-alcoholvrije-bubbels` | Bewaren voor Dry January, geen video | Inplannen eind december |

## Laten vallen (52)

### Engelse dubbel van een NL-artikel (6)
@vinovonk is een Nederlands account.

`champagne-harvest-2026`, `champagne-purchase-derogation`, `why-i-dont-give-wine-scores`, `ron-gastrobar-alcohol-free-wine-list`, `buy-grower-champagne-2026`, `champagne-deals-netherlands`

### Heeft al een video op IG (20)

- **Tua Rita:** `tua-rita-cellarmasters`, `tua-rita-perlato-del-bosco-vermentino-2025-review`, `tua-rita-lodano-rosso-2024-review`
- **Barbadillo en Sparks 41:** `montse-molina-barbadillo-organic-sherry`, `sabalo-organic-palomino-barbadillo`, `salicornia-manzanilla-en-rama-barbadillo`, `jopo-de-lobo-pedro-ximenez-barbadillo`
- **C. Kloss:** `c-kloss-sparkling-tea-weiss`, `c-kloss-sparkling-tea-rose`, `c-kloss-sparkling-tea-bergkrauter` (die laatste staat gepland voor 21-11)
- **Sparks 42 en Azoren:** `jasper-smit-halfes-wijnimporteur`, `adega-do-vulcao-ameixambar-2023`, `adega-do-vulcao-capelinhos-2024`
- **Aurora:** `aurora-oloroso-bodegas-yuste`, `aurora-amontillado-bodegas-yuste`
- **Overig:** `bedoba-rose-2025-review`, `ron-gastrobar-alcoholvrije-wijnkaart`, `biodynamische-proefkalender`, `grower-champagne-2026-kopen` (reel van 23-10 over hetzelfde onderwerp), `champagne-aoc-grens-economie` (reel van 05-10 over de rellen van 1911)

### Krijgt een talking-head via de videoproef (3)
Een teaser zou die video beconcurreren.

`wijn-bestellen-restaurant`, `fles-meenemen-etentje`, `sherry-export-nederland-daling`

### Pouilly-Fuissé-reeks (9)
Elke fles heeft al een eigen IG-post, flesfoto en DM-funnel volgens het reeksplan. Negen vrijwel gelijke teasers voegen weinig toe.

`chateau-de-lavernette-pouilly-fuisse-jj-de-boissieu-2022`, `domaine-rey-pouilly-fuisse-en-carmentrant-2023`, `verget-pouilly-fuisse-le-haut-de-la-roche-2022`, `domaine-des-trois-dames-pouilly-fuisse-2022`, `deux-roches-pouilly-fuisse-vieilles-vignes-2022`, `creuze-noire-pouilly-fuisse-clos-de-monsieur-noly-2022`, `chateau-de-la-chaize-pouilly-fuisse-2022`, `alexis-pollier-pouilly-fuisse-2022`, `chateau-des-rontets-clos-varambon-2021`

### Nieuws dat voorbij is (3)

`champagne-oogst-2026`, `champagne-inkoop-derogatie`, `champagne-2026-vins-clairs-1959`

### Al een beeldpost, weinig extra waarde als teaser (6)
Dit is de meest subjectieve groep. Wil je er één redden, kies dan hier.

`champagne-co2-voetafdruk-2050`, `veel-druiven-aan-de-druivenplant`, `gallimard-blanc-de-noirs-champagne`, `sherry-regels-fino-14-procent`, `vignamaggio-wijngoed-chianti-classico-polycultuur`, `michele-chiarlo-barolo-cerequio-nizza`

### Kaarten uit september (5)

- `card-torres-bcorp`: nieuws van toen
- `card-jable-lanzarote`: losse quote zonder aanleiding
- `card-nl-oogst-2025`: inmiddels een oogst oud
- `card-champagne-grower`: onderwerp had al een reel
- `card-champagne-rijping`: de 15 en 36 maanden stonden al in drie posts

## Na akkoord

1. De 52 items krijgen de status `dropped` via `video-queue.mjs`. Het logboek is append-only, dus dit blijft zichtbaar en is terug te draaien.
2. De EN-gids wordt vervangen door de NL-versie.
3. Alleen de keepers worden gerenderd, in bovenstaande volgorde. Inplannen blijft een aparte stap met de gewone IG-gates.
