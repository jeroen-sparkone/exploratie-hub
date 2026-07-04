# Kompas (prioriteitkader) — design

Status: approved (brainstorming), pending implementation plan.

## Aanleiding

Naast het bestaande procesmatige `status`-veld op een `Exploratie` (Onderzoekt/
Pilot/Opgeschaald/Gestopt/Niet opgepakt — waar zit het onderzoek qua fase)
wil de gebruiker een tweede, strategische classificatie: welke houding heeft
een organisatie tegenover een technologie. Dit "kompas" maakt ook zichtbaar
of een organisatie dit alleen doet, samen met anderen, of voortbouwt op
resultaten van een andere organisatie — een netwerk-signaal dat er nu nog
niet is.

## Scope

- Nieuw veld op `Exploratie`, naast (niet in plaats van) `status`.
- Vereist een bestaande `Exploratie` — geen losse classificatie zonder
  onderzoek.
- Geldt voor zowel seed-data (44 bestaande exploraties) als eigen,
  wizard-aangemaakte exploraties.
- Eén kompaspositie per Exploratie (geen combinaties).

## Data model

Nieuw veld `kompas` op elke `Exploratie`:

```
kompas: {
  positie: "wel" | "nogniet" | "pastniet" | "nietrelevant" | "samen" | "doorgaan",
  gekoppeldeOrgs: string[]   // orgnamen; alleen relevant bij positie "samen" of "doorgaan"
}
```

De 6 posities:

| Waarde | Label | Betekenis |
|---|---|---|
| `wel` | Wel doen | Organisatie pakt dit zelfstandig op |
| `nogniet` | Nog niet | Relevant, maar nu geen prioriteit |
| `pastniet` | Past niet bij ons | Bewust afgewogen, past niet bij de organisatie |
| `nietrelevant` | Niet relevant | Geen raakvlak met het mandaat/de opgave |
| `samen` | Samen doen met | Wordt samen met genoemde org(s) opgepakt |
| `doorgaan` | Doorgaan op resultaten van | Bouwt voort op onderzoek van genoemde org(s) |

`gekoppeldeOrgs` bevat alleen namen van andere organisaties die dezelfde
technologie al onderzoeken (d.w.z. er bestaat al een `Exploratie` met
dezelfde `technologieId` en een andere `org`). Meerdere orgs mogen
gekoppeld worden. Bij de andere 4 posities blijft dit een lege array.

Exploraties zonder ingestelde kompas-positie (bijvoorbeeld direct na het
aanmaken via de wizard) hebben `kompas: null` totdat de gebruiker een
positie kiest.

## UI

### Mijn exploraties — kaart

Elke kaart krijgt een kompas-badge (kleur + label, zelfde stijl als de
bestaande status-badge) en een bewerk-control (select) om de positie te
wijzigen. Bij het kiezen van `samen` of `doorgaan` verschijnt een
multi-select met de andere organisaties die dezelfde technologie
onderzoeken (afgeleid uit de overige `Exploratie`-records met hetzelfde
`technologieId`). Dit staat los van de 5-fase Novum-wizard — de kompaspositie
is op elk moment instelbaar/wijzigbaar, ongeacht in welke fase de exploratie
zit.

Als er voor een technologie geen andere organisatie is die haar al
onderzoekt (deze Exploratie is de enige), zijn `samen` en `doorgaan` niet
zinvol te kiezen — er is niets om aan te koppelen. In dat geval worden deze
twee opties in de select niet getoond (alleen de overige 4).

Kleuren per positie (badge-achtergrond, tekstkleur volgt bestaande
contrast-regel ≥4.5:1):

| Positie | Kleur |
|---|---|
| Wel doen | `#147638` (groen, zelfde als status "Opgeschaald") |
| Nog niet | `#9F6607` (amber, zelfde als status "Pilot") |
| Past niet bij ons | `#6D727A` (grijs, zelfde als status "Niet opgepakt") |
| Niet relevant | `#9CA3AF` (lichtgrijs) |
| Samen doen met | `#3730A3` (indigo) |
| Doorgaan op resultaten van | `#7C3AED` (paars) |

### Technologie-detail — "Wie onderzoekt dit"-tab

Bovenaan de tab komt een samenvattende segmentbalk: 6 aaneengesloten
segmenten (één per kompaspositie), breedte naar rato van het aantal
exploraties in die positie voor déze technologie, met het aantal per
segment. Exploraties zonder kompas (`null`) tellen niet mee in de balk en
worden apart vermeld ("X exploraties nog niet geclassificeerd"). Elke
org-kaart in de lijst daaronder krijgt dezelfde badge als op de Mijn
exploraties-kaart; bij `samen`/`doorgaan` staan de gekoppelde orgnamen
in de badge zelf (bijv. "Samen doen met: Gemeente Utrecht, Gemeente
Amsterdam").

## Seed-data retrofit

Alle 44 bestaande `EXPLORATIES` krijgen een afgeleide kompas-positie,
gebaseerd op hun huidige `status`:

| Bestaande status | Afgeleide kompas-positie |
|---|---|
| Opgeschaald | `wel` |
| Pilot | `wel` |
| Onderzoekt | `wel` |
| Gestopt | `pastniet` |
| Niet opgepakt | `nogniet` |

Deze afleiding is een redelijke default, geen letterlijke bronclaim
(hetzelfde niveau van "representatief, handmatig samengesteld" als de rest
van de seed-data — zie `README.md`). Op 3-5 plausibele plekken waar
meerdere organisaties al dezelfde technologie onderzoeken, wordt een van de
twee relationele posities (`samen` of `doorgaan`) toegekend in plaats van de
tabel-default, met de andere org(s) als `gekoppeldeOrgs` — gekozen op basis
van een plausibele aanwijzing (bijvoorbeeld een latere `jaar`-waarde bij
dezelfde technologie, wat een "doorgaan op"-relatie aannemelijk maakt).

## Buiten scope

- Kompaspositie instellen zonder bestaande `Exploratie`.
- Meerdere kompasposities tegelijk per Exploratie.
- Automatische afleiding/suggestie van `samen`/`doorgaan`-koppelingen in de
  UI (gebruiker kiest zelf uit de lijst van andere orgs).
- Kompas-geschiedenis (wijzigingen worden niet gelogd, alleen de huidige
  waarde wordt bewaard).

## Open punten voor implementatieplan

- Exacte 3-5 seed-records die `samen`/`doorgaan` krijgen (bepalen tijdens
  implementatie, op basis van de huidige 44 records en hun `jaar`/
  `technologieId`).
- Exacte HTML/CSS voor de segmentbalk en badge, in lijn met bestaande
  patronen (`status-tabs`, `.label-chip`, `.domain-chip`).
