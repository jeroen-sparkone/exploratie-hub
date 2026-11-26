#!/bin/sh
# Eén commando: Soorten port (VinoVonk-illustratiestijl, 9:16, zonder stem)
#   sh build.sh            events, muziek, beeld NL, EN en IG (PORTGIDS), master, readcheck
#   WORKERS=3 sh build.sh  render-workers (standaard 3)
# Nodig: de Lemo-Opuscar-library met de tier music, en de samplebibliotheken vsco2ce + vcsl.
# Taal en CTA via de querystring van film.js: ?lang=en, ?cta=ig (alleen NL).
set -e
LIB=${LIB:-$HOME/lemo-opuscar}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "zet LIB op de library-map"; exit 1; }
HERE=$(cd "$(dirname "$0")" && pwd)
PY=${PY:-"$LIB/.venv/bin/python"}
SIZE=1080x1920
WORKERS=${WORKERS:-3}
cd "$LIB"
mkdir -p "$HERE/out"
node core/render/events.mjs "$HERE" --size $SIZE
"$PY" "$HERE/mix.py"
for V in "nl:lang=nl" "en:lang=en" "ig:lang=nl&cta=ig"; do
  N=${V%%:*}; Q=${V#*:}
  node core/render/readcheck.mjs "$HERE" --size $SIZE --q "$Q" > "$HERE/out/readcheck-$N.txt" && echo "readcheck $N ok" || { tail -20 "$HERE/out/readcheck-$N.txt"; exit 1; }
  node core/render/video.mjs "$HERE" --q "$Q" --size $SIZE --fps 24 --workers "$WORKERS" --out "$HERE/out/video-$N.mp4"
  sh core/render/mux.sh "$HERE/out/video-$N.mp4" "$HERE/out/mix-full.wav" "$HERE/soorten-port-$N.mp4" 24 0
done
echo "klaar: $HERE/soorten-port-{nl,en,ig}.mp4"
