// Motion Prompt #001-024 · MIT License (c) 2026 Shohei Ohtaki · https://showheyohtaki.github.io/motion-prompt/#001
// Easing-helpers uit de kit van pack "motion", ongewijzigd overgenomen.

export const clamp = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, x: number) => a + (b - a) * x;
export const P = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const eOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const eOut5 = (x: number) => 1 - Math.pow(1 - x, 5);
export const eIn = (x: number) => x * x * x;
export const backIn = (x: number, s = 1.70158) => (s + 1) * x * x * x - s * x * x;
export const spring = (t: number, w = 14, d = 7) => (t <= 0 ? 0 : 1 - Math.exp(-d * t) * Math.cos(w * t));
