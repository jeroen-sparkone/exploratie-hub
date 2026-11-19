# Mijn kelder is een MCP-server: wat thuis blijft

Proef met Lemo-Opuscar, stijl **Isometric Infographic** (`styles/iso-infographic`).
Bron: `sparkone-astro/src/content/blog/nl/kelder-mcp-server.md` ("Zo gebruik ik AI", deel 7). Feiten: `FACTS.md`.

- Formaat 1080×1920 (9:16, IG @jeroenvonk / LinkedIn persoonlijk), 24 fps, ~45 s
- Pillar: **crossover** (AI met wijn). Taal NL, stem edge-tts `nl-NL-MaartenNeural`, ondertitels ingebrand + `subtitles_nl.srt`
- Storyboard eerst, net als bij de sherry-proef

## 1. Drie structuren

1. **Een route heen en terug**: je vraag gaat naar de cloud, de toolaanroep komt terug, het antwoord gaat weer omhoog. Eerlijk en helder, maar dat is de "follow the route"-grammatica van de demo.
2. **Twee borden boven elkaar**: thuis onderin, de cloud erboven. Wat over de streep tussen de twee gaat, is het verhaal.
3. **Van het bestand naar de hele infographic**: open dichtbij op één bestand, bouw de server op uit zijn honderd regels, en eindig op een legenda die zegt wat waar blijft.

**Keuze: 2 met het slot van 3.** Twee borden maken de grens zichtbaar, en die grens is precies de kanttekening van het artikel: het bestand blijft thuis, het gesprek niet. Het slot is de legenda alleen, de borden grijs. Dat ligt ver van de demo (die eindigt op een kop koffie in een hand).

## 2. Logline en boog

Honderd regels code laten Claude je kelderlijst lezen zonder dat het bestand je laptop verlaat. Wat wél vertrekt, is het gesprek.

- **Opzet**: het bestand op de laptop, en een cloud die er niet bij kan.
- **Draai**: de server bouwt zich op, het model roept hem aan, alleen de treffers gaan omhoog. Ook "niets gevonden" krijgt een eigen antwoord.
- **Slot**: focus + context. Alles grijs, behalve wat thuis blijft (oranje) en wat weggaat (kobalt).

## 3. Benchmark

Isometrische uitleg in de stijl van een systeemkaart, en de kalme diepte van puzzelgames met platte drietonige architectuur.

- **Leren**: één bord per idee, een lijn vóór elke beweging, getallen die uit iconen bestaan, één kleur die "dit" betekent.
- **Niet overnemen**: hun gebouwen, figuren, iconen, kleuren of muziek.

## 4. Kleur en type (SparkOne-huisstijl in de grammatica van de stijl)

- Grond: newsprint-cream `#f4f1ea`, inkt `#16140f`.
- **Oranje `#f0530c` = de MCP-server en wat thuis blijft** (het onderwerp, gereserveerd).
- **Kobalt `#2540ff` = de cloud en het model.**
- **Geel `#ffd23f` = je vraag en het antwoord dat over de grens gaat.**
- Wijnrood `#7d2433` = de flessen in de kelder; kraft `#c9a874` = het bestand; steengrijs = meubels.
- Type: Hanken Grotesk (labels, ondertitels), JetBrains Mono (bestands- en toolnamen), Instrument Serif (eindkaart).

## 5. Shotlijst

| # | Tijd | Kader | Camera | Wat | Waarom |
|---|---|---|---|---|---|
| 1 | 0-5 | dichtbij | lichte push op het bureau | laptop, kelder.csv als stapel papier, onder de vloer een opengesneden kelder met flessen; pin KELDER.CSV | haak: het bestand en wat het beschrijft, in één beeld |
| 2 | 5-11 | breed | log pull-out omhoog | het cloudbord verschijnt boven, een stippellijn tussen de twee met een kruis: geen directe toegang | de grens wordt zichtbaar |
| 3 | 11-17 | medium | push naar de vloer naast het bureau | de server bouwt zich op uit 100 platte lagen, teller loopt mee | het getal is gebouwd, niet gezegd |
| 4 | 17-22 | medium | lichte drift | drie tool-blokjes poppen op de server: LIJST, ZOEK, TEL; pin ALLEEN LEZEN | de drie tools, en dat er geen schrijftool is |
| 5 | 22-28 | breed | volgt het gele kaartje | de vraag gaat omhoog naar de cloud, een kobalt toolaanroep komt naar beneden naar de server | oorzaak en gevolg langs één route |
| 6 | 28-34 | dichtbij | push in, cutaway | de server gaat open, een lijn leest het bestand opnieuw, een geel kaartje met twee flessen gaat omhoog | alleen de treffers vertrekken |
| 7 | 34-38 | medium | korte hold | tweede aanroep, terug komt een kaartje met "niets gevonden" | het lege antwoord is een antwoord |
| 8 | 38-45 | heel breed | pull-out tot de hele infographic | alles grijs behalve oranje en kobalt; legenda BLIJFT THUIS / GAAT NAAR DE CLOUD; eindkaart SparkOne | het slot en de kanttekening |

Signatuurshot: **3**, de server die uit zijn honderd regels opgebouwd wordt.

## 6. Voice-over (concept, gaat door de keten)

Zie `VO.txt`. Negen korte regels, ±85 woorden.

## 7. Cue map en geluid

Tempo 100 bpm (één maat = 2,4 s). Marimba en kalimba voor het thuisbord, een schone elektronische puls voor de cloud, woodblock per laag van de server (versnellend: kwartnoten → achtsten → zestienden), een glockenspielnoot per tool, een korte stilte vóór het lege antwoord, één kalimbanoot per label in de slot-pull-out. Ambience: kamer met toetsenbord thuis, zachte serverzoem in de cloud, gecrossfaded. Muziek ~8 dB onder de stem, −14 LUFS.

## 8. Ondertitels en titels

Ondertitel als kaartlabel: lichte kaart met inktrand en een klein iso-kubusje als legendachip, Hanken Grotesk 40 px, onderin gecentreerd boven de IG-interface. Plaatsnamen en tools als label-pins met halo in de grondkleur.
