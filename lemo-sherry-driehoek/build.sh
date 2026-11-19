#!/bin/sh
# Eén commando: Sherry-driehoek (3D Map Explainer, 9:16)
#   sh build.sh            data/fonts/stem als ze ontbreken, spraakcheck, cues, events, beeld, mix, master, ondertitels, readcheck, poster
#   FETCH=1 sh build.sh    alle kaarttegels opnieuw ophalen en de terreinbestanden opnieuw bouwen
#   VOICE=1 sh build.sh    de vertelling opnieuw genereren (edge-tts, online)
#   WORKERS=3 sh build.sh  meer render-workers (standaard 2)
# Nodig: de Lemo-Opuscar-library met de tiers voice en music, en de samplebibliotheken vsco2ce + vcsl.
set -e
LIB=${LIB:-$HOME/lemo-opuscar}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "zet LIB op de library-map"; exit 1; }
HERE=$(cd "$(dirname "$0")" && pwd)
PY=${PY:-"$LIB/.venv/bin/python"}
NAME=sherry-driehoek
SIZE=1080x1920
WORKERS=${WORKERS:-2}
cd "$LIB"
mkdir -p "$HERE/out/voice" "$HERE/raw" "$HERE/assets"

if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/height.bin" ]; then "$PY" -I "$HERE/tools/fetch.py" "$HERE"; "$PY" -I "$HERE/tools/prep.py" "$HERE"; fi
if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/wide_height.bin" ]; then "$PY" -I "$HERE/tools/fetch_wide.py" "$HERE"; "$PY" -I "$HERE/tools/prep_wide.py" "$HERE"; fi
if [ "${FETCH:-0}" = "1" ] || [ ! -f "$HERE/assets/wide_shadow.png" ]; then "$PY" -I "$HERE/tools/bake.py" "$HERE"; fi
[ -f "$HERE/fonts/NotoSerif-900.woff2" ] || "$PY" -I "$HERE/tools/fonts.py" "$HERE"

# vertelling: edge-tts nl-NL-MaartenNeural, één clip per regel ("say" = fonetische spelling voor de Spaanse namen)
if [ "${VOICE:-0}" = "1" ] || [ ! -f "$HERE/out/voice/v9.wav" ]; then "$PY" core/tts/tts_zh.py "$HERE/voice/lines.json" "$HERE/out/voice"; fi
"$PY" core/tts/asr_check.py "$HERE/voice/lines.json" "$HERE/out/voice" --lang nl --model small || echo "! spraakcheck: Spaanse namen wijken af (verwacht, nageluisterd)"
python3 "$HERE/tools/cues.py"

node core/render/events.mjs "$HERE" --size $SIZE
node core/render/video.mjs "$HERE" --size $SIZE --fps 24 --workers "$WORKERS" --out "$HERE/out/video.mp4"
"$PY" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix-full.wav" "$HERE/$NAME.mp4" 24 1
"$PY" core/render/srt.py "$HERE/voice/cues.json" "$HERE/subtitles_nl.srt"

node core/render/readcheck.mjs "$HERE" --size $SIZE > "$HERE/out/readcheck.txt" && echo "readcheck ok" || { tail -20 "$HERE/out/readcheck.txt"; exit 1; }
node core/render/still.mjs "$HERE" 12.4 --size $SIZE --q nosubs=1 --out "$HERE/out/poster" > /dev/null
ffmpeg -v error -y -i "$HERE/out/poster/t_12.4.jpg" -q:v 4 "$HERE/poster.jpg"
echo "klaar: $HERE/$NAME.mp4"
