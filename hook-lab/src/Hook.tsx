import React from "react";
import { AbsoluteFill, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { P, eIO, eOut, eOut5, eIn, backIn, lerp } from "./kit";

const SERIF = loadFraunces("normal", { weights: ["800"] }).fontFamily;
const SANS = loadInter("normal", { weights: ["700"] }).fontFamily;

const OXBLOOD = "#8b0018";
const GOLD = "#C9A227";
const PAPER = "#fff8f0";

export type Variant = "origineel" | "mask-reveal" | "count-up" | "impact";

// Startpunt in de ruwe opname. Origineel begint bij "Hé, Jeroen hier van VinoVonk",
// de andere varianten slaan die zin over en beginnen bij "Dit is de jongere versie".
const START_S: Record<Variant, number> = {
  "origineel": 0.48,
  "mask-reveal": 2.4,
  "count-up": 2.4,
  "impact": 2.4,
};

const shadow = "0 4px 24px rgba(0,0,0,.55)";

// Motion Prompt #005 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#005
// Instap-timing ongewijzigd. Uitgang 2 s later dan de demo (1.7 -> 3.7 s) zodat de kop leesbaar blijft.
const MaskReveal: React.FC<{ u: number }> = ({ u }) => {
  const HOLD = 2.0;
  const LY = 1180; // lijn op y onder de kin; schaal 2x t.o.v. demo
  const lg = eIO(P(u, 0.1, 0.5)) * (1 - eIO(P(u, 2.05 + HOLD, 2.3 + HOLD)));
  const up = (1 - eOut5(P(u, 0.35, 1.0))) * 240 + backIn(P(u, 1.7 + HOLD, 2.05 + HOLD), 1.2) * -420; // demo: 150 px voor 1 regel; hier 2 regels, dus verder
  const dn = (1 - eOut5(P(u, 0.55, 1.15))) * -120 + eIn(P(u, 1.75 + HOLD, 2.05 + HOLD)) * 140;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: LY - 340, height: 330, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 20, transform: `translateY(${up}px)`, textAlign: "center", fontFamily: SERIF, fontWeight: 800, fontSize: 132, lineHeight: 1, color: PAPER, textShadow: shadow }}>
          Champagne,<br />maar jonger
        </div>
      </div>
      {lg > 0.005 && (
        <div style={{ position: "absolute", top: LY - 6, left: 540 - 380 * lg, width: 760 * lg, height: 12, borderRadius: 6, background: OXBLOOD }} />
      )}
      <div style={{ position: "absolute", left: 0, right: 0, top: LY + 10, height: 110, overflow: "hidden" }}>
        <div style={{ transform: `translateY(${dn}px)`, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 52, letterSpacing: 6, color: GOLD, textShadow: shadow, paddingTop: 22 }}>
          GIRARDIN · APPOGGIATURE
        </div>
      </div>
    </AbsoluteFill>
  );
};

// Motion Prompt #007 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#007
// Telling, landing, pop en balk volgens spec. Doel 7 i.p.v. 2480; de pijl-chip is weggelaten (stijgen past niet bij het verhaal).
const CountUp: React.FC<{ u: number }> = ({ u }) => {
  const TARGET = 7;
  const a = P(u, 0.1, 0.4) * (1 - P(u, 4.0, 4.4));
  const p = P(u, 0.45, 2.9);
  const v = Math.round(TARGET * (1 - Math.pow(1 - p, 4)));
  const land = u - 2.9;
  const pop = 1 + (land > 0 ? 0.07 * Math.exp(-7 * land) * Math.cos(15 * land) : 0);
  const after = eOut(P(u, 3.1, 3.5));
  return (
    <AbsoluteFill style={{ opacity: a, alignItems: "center", top: 800 }}>
      <div style={{ transform: `scale(${pop})`, fontFamily: SERIF, fontWeight: 800, fontSize: 300, lineHeight: 1, color: land > 0 ? GOLD : PAPER, textShadow: shadow, fontVariantNumeric: "tabular-nums" }}>
        {v}
      </div>
      <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 54, letterSpacing: 5, color: PAPER, textShadow: shadow, marginTop: 10 }}>
        JAAR OP DE GIST?
      </div>
      <div style={{ marginTop: 34, width: 660, height: 24, borderRadius: 12, background: "rgba(255,248,240,.25)" }}>
        <div style={{ width: Math.max(24, 660 * (v / TARGET)), height: 24, borderRadius: 12, background: `linear-gradient(90deg, ${OXBLOOD}, ${GOLD})` }} />
      </div>
      <div style={{ marginTop: 40, opacity: after, transform: `translateY(${(1 - after) * 30}px)`, fontFamily: SERIF, fontWeight: 800, fontSize: 92, color: PAPER, textShadow: shadow }}>
        Deze niet.
      </div>
    </AbsoluteFill>
  );
};

// Motion Prompt #024 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#024
// Val, landing, squash en schud volgens spec; het hele beeld (de video) schudt mee.
// Eén val i.p.v. twee, uitgang 1.5 s later. Achtergrondblokjes en stofwolkjes weggelaten: die horen bij de demo-scène.
const IMPACT = { tI: 0.62, HOLD: 1.5 };
export const shake = (u: number) => {
  const tau = u - IMPACT.tI;
  if (tau <= 0 || tau >= 1.1) return { dx: 0, dy: 0, rot: 0 };
  const e = Math.exp(-5 * tau), ph = 2 * Math.PI * 5 * tau;
  // amplitude 2x, want het frame is 2x zo breed als de demo
  return { dx: 30 * e * Math.sin(ph), dy: 22 * e * Math.cos(ph * 1.3), rot: 0.02 * e * Math.sin(ph + 0.6) };
};
const Impact: React.FC<{ u: number }> = ({ u }) => {
  const SW = 760, SH = 230, floor = 1060;
  const tau = u - IMPACT.tI;
  let y = u < 0.3 ? -SH - 40 : u < IMPACT.tI ? lerp(-SH - 40, floor - SH, eIn(P(u, 0.3, IMPACT.tI))) : floor - SH;
  y -= 1300 * backIn(P(u, 1.85 + IMPACT.HOLD, 2.2 + IMPACT.HOLD), 1.6);
  const sq = tau > 0 && tau < 0.3 ? 1 - 0.22 * Math.sin((tau / 0.3) * Math.PI) : u < IMPACT.tI && u > 0.3 ? 1.12 : 1;
  const lines = tau > 0 && tau < 0.55 ? eOut(tau / 0.55) : null;
  return (
    <AbsoluteFill>
      {lines !== null && lines < 0.97 && (
        <svg width={1080} height={1920} style={{ position: "absolute" }}>
          {Array.from({ length: 6 }).map((_, i) => {
            const s = i % 2 ? 1 : -1, j = Math.floor(i / 2), ang = -0.12 - j * 0.34;
            const r0 = 420 + 92 * lines, r1 = r0 + 64;
            return (
              <line key={i} x1={540 + s * Math.cos(ang) * r0} y1={floor - 8 + Math.sin(ang) * r0}
                x2={540 + s * Math.cos(ang) * r1} y2={floor - 8 + Math.sin(ang) * r1}
                stroke={PAPER} strokeWidth={14 * (1 - lines)} strokeLinecap="round" />
            );
          })}
        </svg>
      )}
      <div style={{ position: "absolute", left: 540 - SW / 2, top: y, width: SW, height: SH, transformOrigin: "50% 100%", transform: `scale(${2 - sq}, ${sq})`, background: OXBLOOD, borderRadius: 36, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 20px 60px rgba(0,0,0,.45)" }}>
        <span style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 150, color: PAPER, letterSpacing: 4 }}>JONGER</span>
      </div>
    </AbsoluteFill>
  );
};

export const Hook: React.FC<{ variant: Variant }> = ({ variant }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const u = frame / fps;
  const s = variant === "impact" ? shake(u) : { dx: 0, dy: 0, rot: 0 };
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ transform: `translate(${s.dx}px, ${s.dy}px) rotate(${s.rot}rad) scale(${variant === "impact" ? 1.04 : 1})` }}>
        <OffthreadVideo src={staticFile("girardin.mp4")} trimBefore={Math.round(START_S[variant] * fps)} />
      </AbsoluteFill>
      {variant === "mask-reveal" && <MaskReveal u={u} />}
      {variant === "count-up" && <CountUp u={u} />}
      {variant === "impact" && <Impact u={u} />}
      <div style={{ position: "absolute", left: 30, top: 30, fontFamily: SANS, fontWeight: 700, fontSize: 30, color: "#fff", background: "rgba(0,0,0,.55)", padding: "6px 14px", borderRadius: 8 }}>
        TEST · {variant}
      </div>
    </AbsoluteFill>
  );
};
