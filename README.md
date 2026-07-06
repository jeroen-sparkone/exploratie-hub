# Exploratie Hub — MVP (demo)

[![Live demo](https://img.shields.io/badge/demo-live-2ea44f)](https://jeroen-sparkone.github.io/exploratie-hub/)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![No build step](https://img.shields.io/badge/build-none-lightgrey)](#lokaal-draaien)
![Vanilla JS](https://img.shields.io/badge/stack-vanilla%20JS-yellow)

Werkende demo van een **Exploratie Hub**: één plek om te zien welke nieuwe
technologieën binnen de Nederlandse digitale overheid onderzocht worden, wie
dat doet, wat de uitkomsten zijn, en hoe volwassen elke technologie is.

**Live demo:** https://jeroen-sparkone.github.io/exploratie-hub/ — log in met
willekeurige invoer (demo-login).

Gebaseerd op het MVP-patroon van [Innovatie Hub](https://github.com/TjebbeHB/innovatie-hub-mvp),
met twee aanvullingen:

- **Trendroos-taxonomie** (Rijksbrede Trendverkenning, mei 2026) voor de
  domein-indeling (15 sub-domeinen, 7 clusters) en het wiel op de homepage.
- **Novum Trendexploratie-methode** (5-fase funnel) als wizard voor het
  toevoegen van eigen exploraties.

Data is representatief en handmatig samengesteld (zie
`docs/superpowers/plans/2026-07-03-seed-data.json` voor bronnen), geen live
koppeling.

## Lokaal draaien

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Log in met willekeurige invoer (demo-login).

## Structuur

```
index.html      — app-schil
css/style.css   — styling
js/data.js      — domeinen, technologieën, exploraties, teams
js/app.js       — routing, views, wizard-logica
```

Alles draait client-side, geen build-stap, geen backend. Eigen exploraties
en nieuw aangemaakte technologieën worden lokaal in de browser bewaard
(`localStorage`, prefix `ehub:`).

## Wat zit erin

- **Home** — Trendroos-wiel + toegankelijke domein-lijst, filters op
  organisatie/status/jaar, aanbevelingen op interesses
- **Technologieën** — alle technologieën, zoeken/filteren/sorteren,
  raster-/lijstweergave
- **Technologie-detail** — TRL, wie onderzoekt dit (incl. kompas-overzicht:
  welke organisaties dit oppakken, nog niet oppakken, niet relevant vinden,
  samen doen of voortbouwen op een andere organisatie), soortgelijke
  technologieën
- **Mijn exploraties** — eigen exploraties beheren, 5-fase Novum-wizard
  (Trend kiezen → Focus kiezen → Informatie verzamelen → Waarde bepalen →
  Delen en inspireren), inclusief koppelen aan bestaande technologie of
  aanmaken van een nieuwe
- **Netwerk** — teams zoeken op naam, organisatie, rol of expertise
- **Mijn account** — profiel + domein-interesses

## Screenshot

> Voeg een screenshot of GIF toe (bijv. het Trendroos-wiel op de homepage) en
> verwijs er hier naar: `![Exploratie Hub](docs/screenshot.png)`. Dit verhoogt
> de aandacht op de repo-pagina flink.

## Licentie

Uitgebracht onder de [MIT-licentie](LICENSE). Vrij te gebruiken, aan te passen
en te forken.
