#!/bin/sh
# Eén commando: Douro (3D Map Explainer, 9:16, zonder stem), NL en EN uit hetzelfde beeld (?lang=en)
#   sh build.sh            data als die ontbreekt, events, muziek, beeld NL en EN, master, readcheck, posters
#   FETCH=1 sh build.sh    alle kaarttegels, de rivier en de landsgrenzen opnieuw ophalen
#   WORKERS=3 sh build.sh  render-workers (standaard 3)
# Nodig: de Lemo-Opuscar-library met de tier music, en de samplebibliotheken vsco2ce + vcsl.
# Let op: fetch.py en fetch_wide.py hergebruiken een mozaïek in raw/ als die er al staat. Verander je een kaartvak,
# gooi dan eerst raw/*_z*.{png,jpg} weg, anders past het oude beeld niet op het nieuwe vak.
set -e
LIB=${LIB:-$HOME/lemo-opuscar}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "zet LIB op de library-map"; exit 1; }
HERE=$(cd "$(dirname "$0")" && pwd)
PY=${PY:-"$LIB/.venv/bin/python"}
SIZE=1080x1920
WORKERS=${WORKERS:-3}
cd "$LIB"
mkdir -p "$HERE/out" "$HERE/raw" "$HERE/assets"

if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/height.bin" ]; then "$PY" -I "$HERE/tools/fetch.py" "$HERE"; "$PY" -I "$HERE/tools/prep.py" "$HERE"; fi
if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/wide_height.bin" ]; then "$PY" -I "$HERE/tools/fetch_wide.py" "$HERE"; "$PY" -I "$HERE/tools/prep_wide.py" "$HERE"; fi
if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/wide_shadow.png" ]; then "$PY" -I "$HERE/tools/bake.py" "$HERE"; fi
[ -f "$HERE/assets/douro.json" ] || { echo "assets/douro.json ontbreekt (rivier uit OpenStreetMap, zie CREDITS)"; exit 1; }
[ -f "$HERE/assets/iberia.json" ] || { echo "assets/iberia.json ontbreekt (Natural Earth, zie CREDITS)"; exit 1; }
[ -f "$HERE/fonts/NotoSerif-900.woff2" ] || "$PY" -I "$HERE/tools/fonts.py" "$HERE"

node core/render/events.mjs "$HERE" --size $SIZE
"$PY" "$HERE/mix.py"
for L in nl en; do
  node core/render/video.mjs "$HERE" --q "lang=$L" --size $SIZE --fps 24 --workers "$WORKERS" --out "$HERE/out/video-$L.mp4"
  sh core/render/mux.sh "$HERE/out/video-$L.mp4" "$HERE/out/mix-full.wav" "$HERE/douro-$L.mp4" 24 0
  node core/render/readcheck.mjs "$HERE" --size $SIZE --q "lang=$L" > "$HERE/out/readcheck-$L.txt" && echo "readcheck $L ok" || { tail -20 "$HERE/out/readcheck-$L.txt"; exit 1; }
  node core/render/still.mjs "$HERE" 33 --size $SIZE --q "lang=$L" --prefix "poster_$L" --out "$HERE/out/poster" > /dev/null
  ffmpeg -v error -y -i "$HERE/out/poster/poster_${L}33.jpg" -q:v 4 "$HERE/poster-$L.jpg"
done
echo "klaar: $HERE/douro-nl.mp4 en $HERE/douro-en.mp4"
