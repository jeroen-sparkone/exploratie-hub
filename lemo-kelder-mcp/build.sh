#!/bin/sh
# Eén commando: Kelder als MCP-server (Isometric Infographic, 9:16)
#   sh build.sh            fonts/stem als ze ontbreken, spraakcheck, cues, events, beeld, mix, master, ondertitels, readcheck, poster
#   VOICE=1 sh build.sh    de vertelling opnieuw genereren (edge-tts, online)
#   WORKERS=3 sh build.sh  meer render-workers (standaard 2)
# Nodig: de Lemo-Opuscar-library met de tiers voice en music, en de samplebibliotheken vsco2ce + vcsl.
set -e
LIB=${LIB:-$HOME/lemo-opuscar}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "zet LIB op de library-map"; exit 1; }
HERE=$(cd "$(dirname "$0")" && pwd)
PY=${PY:-"$LIB/.venv/bin/python"}
NAME=kelder-mcp
SIZE=1080x1920
WORKERS=${WORKERS:-2}
cd "$LIB"
mkdir -p "$HERE/out/voice"
[ -f "$HERE/fonts/Hanken-700.woff2" ] || python3 "$HERE/tools/fonts.py" "$HERE"

# vertelling: edge-tts nl-NL-MaartenNeural ("say" = fonetische spelling: cloud → klaud)
if [ "${VOICE:-0}" = "1" ] || [ ! -f "$HERE/out/voice/v9.wav" ]; then "$PY" core/tts/tts_zh.py "$HERE/voice/lines.json" "$HERE/out/voice"; fi
"$PY" core/tts/asr_check.py "$HERE/voice/lines.json" "$HERE/out/voice" --lang nl --model small || echo "! spraakcheck: 'tool' hoort Whisper als 'toel' (Nederlandse uitspraak, nageluisterd)"
python3 "$HERE/tools/cues.py"

node core/render/events.mjs "$HERE" --size $SIZE
node core/render/video.mjs "$HERE" --size $SIZE --fps 24 --workers "$WORKERS" --out "$HERE/out/video.mp4"
"$PY" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix-full.wav" "$HERE/$NAME.mp4" 24 0
"$PY" core/render/srt.py "$HERE/voice/cues.json" "$HERE/subtitles_nl.srt"

node core/render/readcheck.mjs "$HERE" --size $SIZE > "$HERE/out/readcheck.txt" && echo "readcheck ok" || { grep BAD "$HERE/out/readcheck.txt"; exit 1; }
node core/render/still.mjs "$HERE" 42.6 --size $SIZE --q nosubs=1 --out "$HERE/out/poster" > /dev/null
ffmpeg -v error -y -i "$HERE/out/poster/t_42.6.jpg" -q:v 4 "$HERE/poster.jpg"
echo "klaar: $HERE/$NAME.mp4"
