# Overdracht — Exploratie Hub

Dit document is voor wie met de originele **Innovatie Hub MVP** werkt en wil
weten wat hier gebouwd is, waarom, en wat bruikbaar is voor dat project. Geen
implementatiedetail (dat staat in `docs/superpowers/specs/` en `docs/superpowers/plans/`)
— dit is de "waarom" en de open punten.

## Relatie tot Innovatie Hub MVP

Fork van het patroon van [Innovatie Hub](https://github.com/TjebbeHB/innovatie-hub-mvp)
(zelfde architectuur: statisch HTML/CSS/JS, hash-routing, geen build-stap,
geen backend, `localStorage` voor eigen content). Niet als PR terugbouwbaar
op die repo — ander domein (technologie-exploratie i.p.v. innovatiebudget-
projecten) en ander datamodel. Bedoeld als zusje-project: bruikbaar als
referentie voor patronen die daar ook zouden passen.

## Waarom deze versie bestaat

Origineel MVP toont innovatiebudget-projecten. Vraag was: kan hetzelfde
patroon technologie-exploratie ondersteunen — welke technologieën moeten
onderzocht worden, wie doet dat, wat komt eruit, wie pakt het wel/niet op,
hoe volwassen is de technologie (TRL). Dat vereist twee dingen die het
origineel niet had:

1. Een **domein-taxonomie** die past bij hoe de overheid al over trends
   denkt — niet zelf verzonnen categorieën.
2. Een **gestructureerde manier om een exploratie te starten** — niet zomaar
   een vrij tekstveld, maar een methode die al gebruikt wordt.

## Twee externe bronnen als ontwerpinput

- **Rijksbrede Trendverkenning** (mei 2026) — "Trendroos": 15 sub-domeinen
  in 7 clusters. Gebruikt voor domein-indeling overal in de app én het
  wiel op de homepage. Waarom: bestaande, herkenbare rijksbrede taxonomie
  i.p.v. zelf-verzonnen labels — sluit aan bij hoe beleidsmedewerkers al
  categoriseren.
- **Novum Trendexploratie-methode** (SVB innovatielab) — 5-fase funnel
  (Trend kiezen → Focus kiezen → Informatie verzamelen → Waarde bepalen →
  Delen en inspireren). Geïmplementeerd als statische wizard (bewust géén
  AI-assistentie — zie "Buiten scope" hieronder). Waarom: geeft "Mijn
  exploraties" een methodologisch fundament in plaats van een los formulier.

Beide bronnen zijn losstaand van het origineel MVP-project — puur gekozen
omdat ze pasten bij het technologie-exploratie-domein.

## Belangrijkste ontwerpkeuzes (en waarom)

- **Wiel + toegankelijke lijst, niet wiel alleen.** Trendroos-wiel als
  primair visueel overzicht (SVG), met een parallelle chip-lijst met dezelfde
  data eronder. Reden: een wiel is voor kleurenblinden/screenreaders alleen
  niet te lezen — de lijst maakt dezelfde info toegankelijk zonder het
  visuele overzicht te verliezen. Bewuste WCAG-keuze, niet achteraf toegevoegd.
- **Wizard-checklist gate.** Elke Novum-fase heeft een checklist die volledig
  afgevinkt moet zijn voor je door mag naar de volgende fase (en state wordt
  bewaard bij terugkeer). Reden: voorkomt dat mensen fases overslaan zonder
  de bijbehorende denkstap te doen — het is de methode zelf, niet decoratie.
- **Kompas als tweede, aparte as naast `status`.** Het bestaande procesveld
  (Onderzoekt/Pilot/Opgeschaald/Gestopt/Niet opgepakt) beantwoordt "in welke
  fase zit het onderzoek". Kompas beantwoordt een andere vraag: "wat is onze
  houding hierin" (Wel doen/Nog niet/Past niet bij ons/Niet relevant/Samen
  doen met/Doorgaan op resultaten van). Bewust niet samengevoegd met
  `status` — het zijn orthogonale classificaties, een organisatie kan
  "Onderzoekt" staan en tegelijk kiezen voor "Doorgaan op resultaten van
  [andere org]". De twee laatste kompas-posities zijn het enige stukje
  netwerk-signaal in de app: zichtbaar maken wie van wie leert.
- **Alle kleuren op ≥4.5:1 contrast (WCAG AA)**, expliciet herberekend en
  waar nodig aangepast (niet de originele MVP-kleuren aangehouden) — zie
  `docs/superpowers/specs/2026-07-04-kompas-design.md` voor de exacte
  waarden per kompaspositie.
- **Seed-data eerlijk gelabeld.** README zegt expliciet "representatief en
  handmatig samengesteld, geen live koppeling" — bewust geen suggestie van
  een echte databron waar die er niet is.

## Wat is herbruikbaar voor het originele project

- Trendroos-taxonomie + wiel-widget (`js/app.js`: `trendroosWheel()`,
  `domainListHtml()`) — los te trekken als het origineel ooit een
  domein/thema-indeling wil.
- Wizard-gate patroon (checklist-vóór-doorgaan, state-restore per fase) —
  generiek toepasbaar op elk fase-gebaseerd formulier.
- Kompas-patroon (tweede classificatie-as naast een bestaand statusveld,
  met relationele posities die naar andere records verwijzen) — toepasbaar
  overal waar "wat vinden we hiervan" losstaat van "in welke fase zit het".

## Buiten scope (bewust, niet vergeten)

- Geen AI-assistentie in de wizard — Novum-methode is hier bewust puur
  statisch gehouden, niet omdat AI-ondersteuning niet zou passen.
- Geen live databron/API — alles is seed-data + `localStorage`.
- Kompas heeft geen geschiedenis (alleen huidige waarde, geen audit-trail).
- Geen automatische suggestie van `samen`/`doorgaan`-koppelingen — gebruiker
  kiest zelf uit de lijst van andere organisaties.

Volledige scope-afbakening per feature staat in de design-specs
(`docs/superpowers/specs/`).

## Open punten / ideeën voor vervolg

- Trendroos-wiel en kompas-badges zijn nu los gebouwd naast het bestaande
  MVP-patroon — bij samenvoegen met het origineel zou een gedeelde
  component-laag (i.p.v. duplicate CSS/JS) de volgende stap zijn.
  Idee, geen aanbeveling.
- Kompas-relaties (`samen`/`doorgaan`) zijn nu string-referenties naar
  orgnamen. Bij een echte backend zou dit een foreign key naar een
  organisatie-tabel worden.
- 44 exploraties / 10 technologieën is genoeg om de app te demonstreren, niet
  om conclusies aan te verbinden — zie disclaimer in README.

## Waar te beginnen bij lezen

1. `README.md` — wat de app doet, hoe lokaal te draaien.
2. `docs/superpowers/specs/2026-07-03-exploratie-hub-design.md` — volledig
   datamodel, view-lijst, Trendroos/Novum-detail.
3. `docs/superpowers/specs/2026-07-04-kompas-design.md` — kompas-datamodel,
   UI, seed-retrofit-logica.
4. `docs/superpowers/plans/*.md` — implementatiedetail per taak, voor wie
   de code zelf wil overnemen.
