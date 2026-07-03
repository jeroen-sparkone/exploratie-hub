# Exploratie Hub — design

Status: approved (brainstorming), pending implementation plan.

## Aanleiding

Demo van `Innovatie Hub MVP` (https://github.com/TjebbeHB/innovatie-hub-mvp,
live: https://tjebbehb.github.io/innovatie-hub-mvp/#/login) getoond. Die hub
volgt innovatiebudget-projecten binnen de digitale overheid. Doel hier: een
zelfstandige, vergelijkbare demo/pitch-MVP bouwen voor **technologie-exploratie**
in plaats van innovatieprojecten — welke nieuwe technologieën moeten onderzocht
worden, wie onderzoekt ze, wat zijn de uitkomsten, wie doet er iets mee, en hoe
volwassen is de technologie.

Twee aanvullende bronnen zijn meegenomen:
- **Rijksbrede Trendverkenning** (Rijksoverheid, mei 2026) — levert de
  Trendroos-taxonomie en het visuele wiel-ontwerp voor domein-classificatie.
- **Novum Trendexploratie-methode** (SVB-innovatielab) — levert de 5-fase
  funnel voor het "Mijn exploraties"-formulier.

## Doel en scope

- **Type**: demo/pitch-MVP, zoals het origineel. Geen productie-tool.
- **Data**: representatief, handmatig samengesteld. Echte technologieën +
  echte Nederlandse overheidsorganisaties, geen live scraping.
- **Doelgroep**: ambtenaren binnen de Nederlandse digitale overheid — zelfde
  doelgroep als het origineel.
- **Omvang seed-data**: ~8-12 technologieën, elk met 2-5 organisaties die er
  onderzoek naar doen.

## Architectuur

Fork van `tjebbehb/innovatie-hub-mvp`. Zelfde technische keuzes:

- Plain HTML/CSS/JS, geen framework, geen build-stap.
- `js/app.js` (routing, rendering, filters) hergebruikt en aangepast aan het
  nieuwe datamodel; nieuwe view (Technologie-detail) toegevoegd.
- `css/style.css` (Rijksoverheid-stijl, IBM Plex Sans) grotendeels hergebruikt.
- Data hardcoded in `js/data.js`.
- Eigen input van de gebruiker (nieuwe exploraties, interesses) in
  `localStorage` — zelfde beperking als origineel: per-browser, geen
  cross-user sync, geen echte auth (demo-login: elke invoer werkt).
- Hosting: **niet nu**. Alles blijft lokaal (dit is een losstaand git-repo
  zonder remote). GitHub Pages-hosting is een latere, expliciete beslissing.

## Data model

### `Technologie` (nieuwe hoofdentiteit)

| Veld | Betekenis |
|---|---|
| `id` | slug |
| `naam` | technologienaam |
| `domein` | 1 van de 14 Trendroos-sub-domeinen (zie hieronder) |
| `korteBeschrijving` | 1-2 zinnen |
| `trl` | Technology Readiness Level, 1-9 |
| `labels` | trefwoorden voor zoeken/aanbevelingen |

### `Exploratie` (was "project" in origineel, nu gekoppeld aan een Technologie)

| Veld | Betekenis |
|---|---|
| `id` | slug |
| `technologieId` | referentie naar Technologie |
| `org` | organisatie die onderzoekt |
| `typeOrganisatie` | Gemeente, Provincie, Rijksoverheid, Uitvoeringsorganisatie, Waterschap, ... |
| `status` | Onderzoekt / Pilot / Opgeschaald / Gestopt / Niet opgepakt |
| `jaar` | jaar van start |
| `samenvatting` | korte beschrijving van het onderzoek |
| `uitkomst` | bevindingen (kan leeg zijn zolang status = Onderzoekt) |
| `bron` | link naar bronpagina, indien van toepassing |
| `team` | contactpunt/team (generiek, geen persoonsgegevens — zelfde patroon als origineel) |
| `funnel` | optioneel, alleen bij zelf-toegevoegde exploraties — zie hieronder |

Seed-data (de 8-12 technologieën × 2-5 orgs) krijgt **geen** `funnel`-veld:
die diepte (expert-interviews, mini-tests, bronnen per claim) kan niet
gefabriceerd worden zonder de bron-discipline van de Novum-methode te
schenden. `funnel` wordt alleen gevuld wanneer een gebruiker via "Mijn
exploraties" zelf een nieuwe exploratie aanmaakt.

### Trendroos-domeinen (taxonomie voor `Technologie.domein`)

14 sub-domeinen, gegroepeerd in 7 clusters, overgenomen uit de Rijksbrede
Trendverkenning (mei 2026):

| Cluster | Sub-domeinen |
|---|---|
| Demografie en gezondheid | Demografie, Gezondheid |
| Geopolitiek en veiligheid | Geopolitiek, Veiligheid |
| Economie en arbeidsmarkt | Economie, Arbeidsmarkt |
| Technologie en kunstmatige intelligentie | Technologie, Kunstmatige intelligentie |
| Kansengelijkheid en sociale cohesie | Kansengelijkheid, Sociale cohesie |
| Klimaat, energie en fysieke leefomgeving | Klimaat, Energie, Fysieke leefomgeving |
| Rechtsstaat en democratie | Rechtsstaat, Democratie |

Kleurenschema per domein (goedgekeurd in mockup, over te nemen in `js/data.js`):

| Domein | Kleur | Cluster |
|---|---|---|
| Demografie | `#1B3A6B` | Demografie en gezondheid |
| Gezondheid | `#2E86C1` | Demografie en gezondheid |
| Geopolitiek | `#6FCF97` | Geopolitiek en veiligheid |
| Veiligheid | `#8A9A2A` | Geopolitiek en veiligheid |
| Economie | `#2E8B57` | Economie en arbeidsmarkt |
| Arbeidsmarkt | `#1B5E3A` | Economie en arbeidsmarkt |
| Technologie | `#6B4226` | Technologie en kunstmatige intelligentie |
| Kunstmatige intelligentie | `#F5C518` | Technologie en kunstmatige intelligentie |
| Kansengelijkheid | `#F2A93B` | Kansengelijkheid en sociale cohesie |
| Sociale cohesie | `#E8730D` | Kansengelijkheid en sociale cohesie |
| Klimaat | `#D6412F` | Klimaat, energie en fysieke leefomgeving |
| Energie | `#F291B5` | Klimaat, energie en fysieke leefomgeving |
| Fysieke leefomgeving | `#C2186D` | Klimaat, energie en fysieke leefomgeving |
| Rechtsstaat | `#D6146E` | Rechtsstaat en democratie |
| Democratie | `#3B1F6B` | Rechtsstaat en democratie |

Deze zijn benaderingen op basis van het rapport-wiel, geen exacte
huisstijlwaarden — bij implementatie visueel toetsen aan de PDF
(`Downloads/rijksbrede trendverkenning.pdf`, p.3) en zo nodig bijstellen.

## Views

1. **Login/onboarding** — demo-login (elke invoer werkt), interesses kiezen
   (nu: technologie-domeinen i.p.v. NDS-thema's).
2. **Home** — Trendroos-wiel (dubbele ring: buitenboog = 7 clusters,
   binnenring = 14 domeinen, elk met telling) + klikbare clusterlijst eronder
   als toegankelijke tekst-equivalent. Wiel-SVG krijgt `aria-hidden="true"`;
   de lijst gebruikt echte `<button>`-elementen per domein (klikbaar,
   keyboard-navigeerbaar, WCAG-conform) en toont dezelfde data als tekst.
   Filters op org/status/jaar. Aanbevelingen op basis van gekozen interesses.
3. **Technologieën** (was "Innovaties") — grid/lijst van alle technologieën,
   zoeken/filteren (domein, TRL, status-mix, jaar, type organisatie) en
   sorteren.
4. **Technologie-detail** (nieuw, bestond niet in origineel — daar was
   "thema" een filter, geen entiteit met eigen pagina) — TRL, beschrijving,
   tabs: wie onderzoekt dit (orgs + status + uitkomst per org), soortgelijke
   technologieën.
5. **Mijn exploraties** (was "Mijn projecten") — eigen org-onderzoek
   toevoegen via de 5-fase Novum-wizard (zie hieronder), lijst van eigen
   exploraties met voortgang ("Fase 2 van 5"), live "vergelijkbare
   technologieën" tijdens het invullen.
6. **Netwerk** — teams zoeken op org of technologie.
7. **Mijn account** — profiel + technologie-domein-interesses.

## Mijn exploraties: Novum-funnel wizard

Statisch formulier, 5 stappen, **geen AI, geen backend, geen live
bronresearch door de app**. De gebruiker vult zelf in en plakt eigen bronnen;
de app checkt bronnen niet op juistheid. Elke fase toont zijn timebox als
UI-hint (bv. "richtlijn: max. 2 uur") en moet zijn checklist afvinken voordat
de gebruiker doorgaat naar de volgende fase. Voortgang wordt per exploratie
opgeslagen in `localStorage` (`funnel.huidigeFase`, 0-4) zodat een gebruiker
tussentijds kan stoppen en later verder gaan.

Een lopend **Parkeerbord** (vrije lijst met tekstregels) is zichtbaar in elke
fase en wordt getoond bij afronding van elke fase.

### Fase 0 — Trend kiezen (max. 2 uur)
Velden: trendbeschrijving, relevantie voor de organisatie, motivatie keuze,
geraadpleegde bronnen (lijst van `{titel, organisatie, jaar, link}`).
Checklist: trend beschreven / relevantie beschreven / motivatie beschreven /
bronnen vastgelegd.

### Fase 1 — Focus kiezen (max. 2 uur)
Velden: doel exploratie, hoofdvraag, deelvragen (3-5), scope (in/buiten),
aandachtspunten uit portfoliomeeting.
Checklist: doel / onderzoeksvragen / afbakening / trend besproken.

### Fase 2 — Informatie verzamelen (max. 2 uur)
Velden: omschrijving trend, definitie + bronnen, toepassingen (met link per
toepassing), kansen (korte/lange termijn), risico's (korte/lange termijn).
Elke onzekere claim kan gemarkeerd worden als **(niet geverifieerd)**.
Checklist: trend omschreven en gedefinieerd / toepassingen beschreven /
kansen en risico's beschreven.

### Fase 3 — Waarde bepalen (max. 4 uur)
Velden: expert-interviews (min. 2, met naam/rol/uitkomsten), meerwaarde
(organisatie/medewerker/burger), optionele mini-test (opzet, succescriteria,
resultaten, conclusie), bestaande SVB/overheidsinitiatieven, conclusie op
hoofd- en deelvragen.
Checklist: interviews gedaan / meerwaarde beschreven / bestaande initiatieven
onderzocht / conclusie geformuleerd.

Na deze fase kiest de gebruiker de vervolgstatus voor de bijbehorende
`Exploratie` (Pilot / Opgeschaald / Gestopt / Niet opgepakt), gebaseerd op de
conclusie.

### Fase 4 — Delen en inspireren (max. 1 uur)
Velden: resultatenoverzicht, communicatieplan (Communicatie Canvas: titel,
aanleiding, aanpak, resultaat, relevantie, hoe verder, call to action),
interne/externe communicatie, opslaglocatie bestanden, korte reflectie.
Checklist: resultatenoverzicht / communicatieplan / demo gedaan / bestanden
opgeslagen.

Na Fase 4: de exploratie is afgerond, `funnel.huidigeFase = 4`, de
`Exploratie.status` staat op de in Fase 3 gekozen vervolgstatus.

## Buiten scope (MVP)

- Geen backend, geen echte authenticatie.
- Geen AI-ondersteuning in de funnel-wizard (geen live bronresearch,
  fact-checking of chatbot-gedrag — dat blijft aan de gebruiker).
- Geen cross-user data-sync; alles per browser via `localStorage`.
- Geen live TRL-updates of automatische statuswijzigingen.
- Geen hosting/deploy in deze fase — blijft lokaal.

## Open punten voor implementatieplan

- Exacte technologieën + organisaties voor de seed-data (research nodig,
  geen fabricage — moet kloppen zoals origineel deed met digitaleoverheid.nl).
- Exacte kleurwaarden en SVG-opbouw van het Trendroos-wiel overnemen uit het
  goedgekeurde mockup.
- Bestandsstructuur van `js/data.js` (Technologie + Exploratie arrays) en
  `js/app.js` (routing/rendering per nieuwe view) in detail uitwerken.
