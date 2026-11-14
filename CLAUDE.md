# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Experimenteerruimte zonder vast doel of stack. Losse proeven staan in eigen submappen
(o.a. `cutroom-test/`, `hook-lab/`); `OVERDRACHT.md` en `docs/` beschrijven de stand.

## Root-context

De root-routing stuurt "doel/stack nog onbekend, losse verkenning" hierheen. Groeit een proef
uit tot een eigen project, dan krijgt hij een eigen map en een eigen regel in die tabel.

## Pushen met het juiste GitHub-account

Er zijn twee `gh`-accounts (`jeroen-vinovonk` en `jeroen-sparkone`) en er kan er maar een
tegelijk actief zijn. Deze repo hoort bij **`jeroen-sparkone`**. Werkt een parallelle sessie in
een repo van het andere account, dan zet die de actieve account om, ook midden in jouw werk.
`git push` faalt dan met `remote: Repository not found`. Dat leest als een verdwenen repo, maar
het is een account zonder toegang.

Praat daarom hiermee met de remote:

```bash
node ../_shared/pipeline/scripts/gh-git.mjs push
node ../_shared/pipeline/scripts/gh-git.mjs pull --rebase
node ../_shared/pipeline/scripts/gh-git.mjs fetch
```

Het script leidt het juiste account af uit de owner in de remote-URL en geeft dat token eenmalig
mee aan dat ene commando. Het schakelt niets om, dus een parallelle sessie kan er niet tussen komen
en jij zet niemand anders om. Extra argumenten gaan door naar git, `--dry` toont alleen het
voornemen. `gh-push.mjs` bestaat nog als doorgeefluik naar `gh-git.mjs push`.

Pull en fetch staan hier niet voor de volledigheid: op 15-08-2026 ketste een push af omdat de
remote voor lag, en het `git pull` dat erop volgde viel om op precies dezelfde melding. Alleen
push afdekken laat je stranden op het moment dat je het minst zin hebt om dit uit te zoeken.

Voor `gh`-subcommandos zelf (`gh pr create`, API-calls) blijft omschakelen wel nodig:
`gh auth switch --user jeroen-sparkone`.
