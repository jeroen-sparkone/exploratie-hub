# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Status

Nieuwe, lege map — experimenteerruimte, nog geen vast doel of stack.

## Root-context

Deze map valt onder `~/dev/Claude code/` (zie root-CLAUDE.md daar). Routing-tabel
in die root wijst naar specifieke sub-projecten (vinovonk-astro, sparkone-astro,
crm-vinovonk, etc.) — deze map (`exploratie`) staat daar nog niet in, dus werk
hier blijft losstaand tot doel/stack bekend is.

Zodra hier een concreet project ontstaat: update dit bestand met build/lint/test-
commando's en architectuuroverzicht, en overweeg een regel toe te voegen aan de
routing-tabel in de root-CLAUDE.md.

## Pushen met het juiste GitHub-account

Er zijn twee `gh`-accounts (`jeroen-vinovonk` en `jeroen-sparkone`) en er kan er maar een
tegelijk actief zijn. Deze repo hoort bij **`jeroen-sparkone`**. Werkt een parallelle sessie in
een repo van het andere account, dan zet die de actieve account om, ook midden in jouw werk.
`git push` faalt dan met `remote: Repository not found`. Dat leest als een verdwenen repo, maar
het is een account zonder toegang.

Push daarom hiermee:

```bash
node ../_shared/pipeline/scripts/gh-push.mjs
```

Het script leidt het juiste account af uit de owner in de remote-URL en geeft dat token eenmalig
mee aan die ene push. Het schakelt niets om, dus een parallelle sessie kan er niet tussen komen en
jij zet niemand anders om. Extra argumenten gaan door naar `git push`, `--dry` toont alleen het
voornemen.

Voor `gh`-subcommandos zelf (`gh pr create`, API-calls) blijft omschakelen wel nodig:
`gh auth switch --user jeroen-sparkone`.
