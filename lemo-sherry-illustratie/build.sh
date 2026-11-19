#!/bin/sh
# Eén commando: Sherry-driehoek in de VinoVonk-illustratiestijl (9:16, 45 s), vier versies:
#   sherry-driehoek-illustratie.mp4          NL-stem + score
#   sherry-driehoek-illustratie-muziek.mp4   NL-tekst, zonder stem (muziek en geluid)
#   sherry-triangle-illustration-en.mp4      EN-stem + score
#   sherry-triangle-illustration-en-music.mp4 EN-tekst, zonder stem
#   sh build.sh            alles
#   VOICE=1 sh build.sh    de Engelse stem opnieuw genereren (edge-tts en-GB-RyanNeural, online)
#   WORKERS=3 sh build.sh  meer render-workers (standaard 2)
# NL-stem en cues komen uit ../lemo-sherry-driehoek. Taal van het beeld: ?lang=en (film.js).
# Nodig: de Lemo-Opuscar-library met de tiers voice en music, en de samplebibliotheken vsco2ce + vcsl.
set -e
LIB=${LIB:-$HOME/lemo-opuscar}
export LIB
[ -f "$LIB/core/render/video.mjs" ] || { echo "zet LIB op de library-map"; exit 1; }
HERE=$(cd "$(dirname "$0")" && pwd)
PY=${PY:-"$LIB/.venv/bin/python"}
SIZE=1080x1920
WORKERS=${WORKERS:-2}
cd "$LIB"
if [ "${VOICE:-0}" = "1" ] || [ ! -f "$HERE/out/voice_en/v9.wav" ]; then "$PY" core/tts/tts_zh.py "$HERE/voice/lines.en.json" "$HERE/out/voice_en"; fi
python3 "$HERE/tools/cues.py" en
node core/render/events.mjs "$HERE" --size $SIZE
for L in nl en; do
  node core/render/readcheck.mjs "$HERE" --q "lang=$L" --size $SIZE > "$HERE/out/readcheck-$L.txt" && echo "readcheck $L ok" || { grep BAD "$HERE/out/readcheck-$L.txt"; exit 1; }
  node core/render/video.mjs "$HERE" --q "lang=$L" --size $SIZE --fps 24 --workers "$WORKERS" --out "$HERE/out/video-$L.mp4"
done
MIX_LANG=nl "$PY" "$HERE/mix.py"; MIX_LANG=en MIX_OUT=mix-en.wav "$PY" "$HERE/mix.py"; NOVOICE=1 MIX_OUT=mix-music.wav "$PY" "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video-nl.mp4" "$HERE/out/mix-full.wav"  "$HERE/sherry-driehoek-illustratie.mp4" 24 0
sh core/render/mux.sh "$HERE/out/video-nl.mp4" "$HERE/out/mix-music.wav" "$HERE/sherry-driehoek-illustratie-muziek.mp4" 24 0
sh core/render/mux.sh "$HERE/out/video-en.mp4" "$HERE/out/mix-en.wav"    "$HERE/sherry-triangle-illustration-en.mp4" 24 0
sh core/render/mux.sh "$HERE/out/video-en.mp4" "$HERE/out/mix-music.wav" "$HERE/sherry-triangle-illustration-en-music.mp4" 24 0
"$PY" core/render/srt.py "$HERE/voice/cues.json" "$HERE/subtitles_nl.srt"
"$PY" core/render/srt.py "$HERE/voice/cues.en.json" "$HERE/subtitles_en.srt"
for L in nl en; do
  node core/render/still.mjs "$HERE" 20.5 --q "lang=$L" --size $SIZE --out "$HERE/out/poster-$L" > /dev/null
  ffmpeg -v error -y -i "$HERE/out/poster-$L/t_20.5.jpg" -q:v 4 "$HERE/poster-$L.jpg"
done
echo "klaar: vier versies in $HERE"
