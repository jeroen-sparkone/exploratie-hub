# hook-lab

Proef van 22-10-2026: vier openingen (hooks) op dezelfde opname, de Girardin
Appoggiature Brut-talking-head uit `remotion-vinovonk/drafts/raw/girardin-brut-edit.mp4`.
Elke clip duurt 6 seconden.

| Variant | Begint bij | Beweging |
|---|---|---|
| `origineel` | "Hé, Jeroen hier van VinoVonk" | geen, als nulmeting |
| `mask-reveal` | "Dit is de jongere versie" | Motion Prompt #005 |
| `count-up` | idem | Motion Prompt #007, telt naar 7 jaar op de gist |
| `impact` | idem | Motion Prompt #024, het beeld schudt mee |

De bewegingen komen uit de skill `motion-prompt` (`../vendor/motion-prompt`, MIT, met een
symlink vanuit `~/.claude/skills/`). De afwijkingen van de demo staan als commentaar in
`src/Hook.tsx`.

## Draaien

`node_modules` is een symlink naar `../../remotion-vinovonk/node_modules`, dus je hoeft niets
te installeren. `public/girardin.mp4` is een **hardlink** naar de ruwe opname. Een symlink
werkt niet: Remotion neemt die bij het bundelen niet mee, en de render faalt dan met een 404.

```bash
npm run studio
npm run render
```

`out/vergelijking-4-hooks.mp4` zet de vier naast elkaar, zonder geluid.
