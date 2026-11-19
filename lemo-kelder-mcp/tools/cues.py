"""Ondertitel-cues uit de vertelling: voice/subs.json (starttijden) + out/voice/dur.json (duur) -> voice/cues.json.
Elke cue blijft staan tot vlak voor de volgende regel, nooit korter dan de gesproken regel + 0,6 s of 1,8 s.
usage: python3 tools/cues.py
"""
import json, os, sys
HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
subs = json.load(open(os.path.join(HERE, 'voice', 'subs.json')))
dur = json.load(open(os.path.join(HERE, 'out', 'voice', 'dur.json')))
cues, bad = [], 0
for i, s in enumerate(subs):
    d = dur[s['id']]
    end = subs[i + 1]['t'] - 0.08 if i + 1 < len(subs) else s['t'] + d + 1.0
    need = max(1.8, d + 0.6)
    if end - s['t'] < need - 1e-6 or (i + 1 < len(subs) and s['t'] + d > subs[i + 1]['t'] - 0.3):
        print('TE KORT', s['id'], round(end - s['t'], 2), 'nodig', round(need, 2)); bad += 1
    cues.append({'id': s['id'], 't0': s['t'], 't1': round(end, 3), 'vo_end': round(s['t'] + d, 3), 'text': s['text']})
json.dump(cues, open(os.path.join(HERE, 'voice', 'cues.json'), 'w'), ensure_ascii=False, indent=1)
print('cues', len(cues), 'kortste', round(min(c['t1'] - c['t0'] for c in cues), 2), 's')
sys.exit(1 if bad else 0)
