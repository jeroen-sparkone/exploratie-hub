#!/bin/sh
# Eén commando: kerstfles-tekstanimatie (9:16, zonder stem, Motion Prompt-bewegingen)
#   sh build.sh   events, muziek, readcheck, beeld IG (PORTGIDS) en web (vinovonk.com), master op -14 LUFS
set -e
LIB=${LIB:-$HOME/lemo-opuscar}
export LIB
HERE=$(cd "$(dirname "$0")" && pwd)
PY=${PY:-"$LIB/.venv/bin/python"}
SIZE=1080x1920
WORKERS=${WORKERS:-3}
cd "$LIB"
mkdir -p "$HERE/out"
node core/render/events.mjs "$HERE" --size $SIZE
"$PY" "$HERE/mix.py"
for V in "ig:cta=ig" "web:cta=web"; do
  N=${V%%:*}; Q=${V#*:}
  node core/render/readcheck.mjs "$HERE" --size $SIZE --q "$Q" > "$HERE/out/readcheck-$N.txt" && echo "readcheck $N ok" || { grep -v '^OK' "$HERE/out/readcheck-$N.txt"; exit 1; }
  node core/render/video.mjs "$HERE" --q "$Q" --size $SIZE --fps 24 --workers "$WORKERS" --out "$HERE/out/video-$N.mp4"
  sh core/render/mux.sh "$HERE/out/video-$N.mp4" "$HERE/out/mix-full.wav" "$HERE/kerstfles-$N.mp4" 24 0
done
echo "klaar: $HERE/kerstfles-{ig,web}.mp4"
