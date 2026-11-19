#!/bin/sh
# Drie testclips (papiersnit, toon, houtsnede): ±12,6 s, 9:16, met de poniente-regels van de sherry-film als stem.
set -e
LIB=${LIB:-$HOME/lemo-opuscar}; HERE=$(cd "$(dirname "$0")/.." && pwd); V="$HERE/../lemo-sherry-driehoek/out/voice"
cd "$LIB"
# stem: v4 op 3,4 s, v5 op 7,6 s, plus een zachte windbed
ffmpeg -v error -y -i "$V/v4.wav" -i "$V/v5.wav" -f lavfi -t 12.6 -i "anoisesrc=color=pink:amplitude=0.02:seed=3" \
  -filter_complex "[0]adelay=3400|3400[a];[1]adelay=7600|7600[b];[2]lowpass=f=900,highpass=f=120,volume=0.35[w];[a][b][w]amix=inputs=3:duration=longest:normalize=0,atrim=0:12.6" -ac 2 -ar 48000 "$HERE/out/clip-audio.wav"
for s in papercut toon woodcut; do
  node core/render/video.mjs "$HERE" --size 1080x1920 --fps 24 --workers 3 --q "style=$s&clip=1" --out "$HERE/out/$s-video.mp4"
  sh core/render/mux.sh "$HERE/out/$s-video.mp4" "$HERE/out/clip-audio.wav" "$HERE/test-$s.mp4" 24 0
done
