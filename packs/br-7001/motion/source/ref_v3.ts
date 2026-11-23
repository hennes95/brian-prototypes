/**
 * AI Tutor use-case blocks – motion model (V3, final values). Reference port of the package engine (variant D).
 * Pure functions of time: at(tMs) -> Frame. Framework-agnostic; drive it with requestAnimationFrame / a Ticker
 * and hand the frame to the screen code (motion:screen-react / motion:screen-dart), which takes exactly this shape.
 *
 * Animations (every one starts with the user action: `tap` ms finger down, then the motion):
 *   enter()            user opens the AI Tutor tab: blocks arrive near their place, intro text last
 *   open(i)            user taps block i: it flies into the student message and becomes its text; the others fall
 *   back(from)         user taps "+" in the chat: chat fades, blocks rise back in from below, intro returns
 *   focus()            user taps the message field: keyboard slides up, all blocks break away (bottom first)
 *   backOut(from)      user leaves the field without sending: same as back(), keyboard goes down, intro stays
 *   send(text)         user sends a typed message: the text lifts out of the field and lands on the student message line
 * `from` = the frame on screen when the user acted (e.g. open(...).at(t), focus().at(t), send(...).at(t)).
 *
 * ELEMENT CONTRACT: the model never touches content, size or styling. It outputs poses for N elements (centre, rotation,
 * scale, opacity) plus opacities for intro / student / tutor, the keyboard progress and the flying text.
 * Artboard: 402 x 874 px. Angles in degrees, time in ms. Check against the test vectors in the manifest (±0.01).
 */
export const ART = { w: 402, h: 874 };
export const BLOCK = { w: 231.5, h: 50 };
/** Where the elements rest (block centres + tilt of the tower, top -> bottom). Any number of elements works. */
export const REST = [
  { cx: 200.7, cy: 434.9, r: -2 }, { cx: 180.7, cy: 490.4, r: 0 }, { cx: 200.7, cy: 546.4, r: 2 },
  { cx: 219.7, cy: 601.9, r: -4 }, { cx: 200.7, cy: 658.0, r: -2 },
];
/** Measured geometry (artboard px). */
export const GEO = {
  msgTextLeft: 68, msgTextCy: 163.6,     // student message text line: left edge, line centre
  labelLeft: 44,                         // block label left edge inside the block
  chipFont: 12, msgFont: 14,             // label size in the block / in the message
  fieldTextLeft: 81, fieldTextCy: 755,   // text in the message field (keyboard down)
  kbInputDy: -245,                       // input bar offset when the keyboard is up
  kbSpring: { visualDuration: 0.38, bounce: 0 } as Spring,   // stand-in for the OS keyboard slide (use the real inset in the app)
  offscreen: 990,                        // falling blocks are done below this y
};

/** Final tuned values (V3). Change here only. */
// <<PARAMS
export const P = __PARAMS__;
// PARAMS>>

export type Spring = { visualDuration: number; bounce: number } | { stiffness: number; damping: number; mass: number };
export type Pose = { cx: number; cy: number; r: number; s: number; o: number };
export type Morph = { i: number; surface: number; chip: number; chipScale: number; msg: number; msgScale: number };
export type Frame = {
  blocks: Pose[];          // index = block index (0 = top)
  intro: number;           // headline + illustration + subtitle opacity
  stu: number; tut: number; done: boolean;   // student / tutor message opacity; done = reply shown instead of dots
  rise?: number;           // student avatar + name rise (px): translateY = rise * (1 - bezMsg(stu))
  stuText?: number;        // V3: the student text line itself (0 until the flying label/text lands, then 1)
  morph?: Morph;           // open(): the tapped block turning into message text
  kb?: number;             // focus / backOut / send / back after send: keyboard progress 0..1
  fly?: { x: number; cy: number; o: number; text: string };   // send(): text in flight
  pressed: boolean;        // the tapped block is dark (from 60 ms after touch-down)
};
export type Timeline = { duration: number; motionEnd: number; at: (t: number) => Frame };
type Raw = { duration: number; motionEnd: number; at: (t: number) => Omit<Frame, 'pressed'> };

/* ---------- helpers ---------- */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (x: number) => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x;
    for (let k = 0; k < 22; k++) { t = (lo + hi) / 2; const cx = 3*(1-t)*(1-t)*t*x1 + 3*(1-t)*t*t*x2 + t*t*t; if (cx < x) lo = t; else hi = t; }
    return 3*(1-t)*(1-t)*t*y1 + 3*(1-t)*t*t*y2 + t*t*t; };
}
export const bezOpacity = cubicBezier(.25, .1, .25, 1);
export const bezMsg = cubicBezier(.2, .8, .2, 1);

/** Spring 0 -> 1 by elapsed ms. Same maths as Motion's spring() (motion.dev), including its rest snap
 *  (value becomes exactly 1 once speed <= 0.01/s and distance <= 0.005). Returns 0 for ms <= 0. */
export function spring(c: Spring): (ms: number) => number {
  let k: number, d: number, m = 1, timeDefined = false;
  if ('visualDuration' in c) {
    const z = c.bounce < 0 ? 1 / Math.max(1 + c.bounce, .05) : Math.max(1 - c.bounce, .05), root = 2 * Math.PI / (c.visualDuration * 1.2);
    k = root * root; d = 2 * z * Math.sqrt(k); timeDefined = true;
  } else { k = c.stiffness; d = c.damping; m = c.mass; }
  const u = d / (2 * Math.sqrt(k * m)), w = Math.sqrt(k / m) / 1000, g = u * w;   // per ms
  let pos: (t: number) => number, vel: (t: number) => number;
  if (u < 1) {
    const s = w * Math.sqrt(1 - u * u), A = g / s, sinC = g * A + s, cosC = g - A * s;
    pos = (t) => 1 - Math.exp(-g * t) * (A * Math.sin(s * t) + Math.cos(s * t));
    vel = (t) => Math.exp(-g * t) * (sinC * Math.sin(s * t) + cosC * Math.cos(s * t));
  } else if (u === 1) {
    pos = (t) => 1 - Math.exp(-w * t) * (1 + w * t);
    vel = (t) => Math.exp(-w * t) * (w * w * t);
  } else {
    const s = w * Math.sqrt(u * u - 1), a = g - s, b = g + s, cut = s < 1 || timeDefined ? Infinity : 300 / s;
    const C = (x: number, t: number) => Math.exp(t > cut ? (g - x) * cut - g * t : -x * t);
    const X = g / s, S = (1 + X) / 2, F = (1 - X) / 2;
    pos = (t) => 1 - S * C(a, t) - F * C(b, t);
    vel = (t) => a * S * C(a, t) + b * F * C(b, t);
  }
  return (ms) => { if (ms <= 0) return 0; const p = pos(ms); return Math.abs(vel(ms) * 1000) <= .01 && Math.abs(1 - p) <= .005 ? 1 : p; };
}
const visMs = (c: Spring) => ('visualDuration' in c ? c.visualDuration : .8) * 1000;
/** spring that is exactly 1 after 1.6 x its visual duration */
function capped(c: Spring) { const f = spring(c), end = visMs(c) * 1.6; return { at: (t: number) => (t >= end ? 1 : f(t)), end }; }
const KB = capped(GEO.kbSpring);

/** user action first (tap ms), then the motion, optionally time-scaled so the motion lasts `total` ms (0 = natural) */
function withTap(m: Raw, tap: number, total: number, pressBlock: boolean): Timeline {
  const f = total > 0 && m.motionEnd > 0 ? total / m.motionEnd : 1;
  return { duration: m.duration * f + tap, motionEnd: m.motionEnd * f + tap,
    at: (t) => ({ ...m.at(Math.max(0, t - tap) / f), pressed: pressBlock && t >= 60 }) };
}
/** falling block (open: the untapped ones; focus: all of them) */
function faller(d: { cx: number; cy: number; r: number }, dly: number, vy: number, vx: number, w: number, sg: number, wobble: number, g: number) {
  return (t: number): Pose => { const u = Math.max(0, (t - dly) / 1000), q = .22 * (1 - Math.exp(-u / .22));
    return { cx: d.cx + vx * q * 1.6, cy: d.cy + vy * u + .5 * g * u * u, r: d.r + w * (u - q) + wobble * sg * Math.sin(u * 18) * Math.exp(-u * 7), s: 1, o: 1 }; };
}

/* ---------- ENTER: user opens the AI Tutor tab ---------- */
export function enter(seed = (Math.random() * 2 ** 31) | 0, p = P.enter, L = REST): Timeline {
  const rnd = mulberry32(seed), r2 = mulberry32((seed ^ 0x9e3779b9) >>> 0), R2 = (a: number, b: number) => a + r2() * (b - a);
  const sp = capped(p.spring), D = visMs(p.spring) * 1.6, mid = (L.length - 1) / 2;
  const items = L.map((d, j) => {
    const side = j < mid ? -1 : j > mid ? 1 : 0, dly = R2(0, 1) * p.stagger * 3;
    rnd(); rnd(); rnd();                                         // unused draws, keep the order
    const hx = (R2(0, 1) < .5 ? -1 : 1) * (130 + R2(0, 1) * 150), vy = side * (110 + R2(0, 1) * 140);
    const tilt = (R2(0, 1) < .5 ? -1 : 1) * (16 + R2(0, 1) * 30) * p.rand;
    return { d, dly, sx: d.cx + hx, sy: d.cy + vy, sr: d.r + tilt };
  });
  const motion = Math.max(...items.map((it) => it.dly + D));
  const raw: Raw = { motionEnd: motion + 100, duration: Math.max(motion + 100, p.textAt + 500),
    at: (t) => ({ blocks: items.map((it) => { const e = sp.at(t - it.dly);
        return { cx: it.sx + (it.d.cx - it.sx) * e, cy: it.sy + (it.d.cy - it.sy) * e, r: it.sr + (it.d.r - it.sr) * e, s: 1, o: bezOpacity((t - it.dly) / 350) }; }),
      intro: clamp((t - p.textAt) / 450, 0, 1), stu: 0, tut: 0, done: false }) };
  return withTap(raw, p.tap, p.total, false);
}

/* ---------- OPEN: user taps block i (it flies into the student message and becomes its text) ---------- */
export function open(i: number, seed = (Math.random() * 2 ** 31) | 0, p = P.open, L = REST): Timeline {
  const rnd = mulberry32(seed), RR = (a: number, b: number) => a + rnd() * (b - a), td = L[i];
  const TX = GEO.msgTextLeft - GEO.labelLeft + BLOCK.w / 2, TY = GEO.msgTextCy;
  const fx = capped(p.flyX), fy = capped(p.flyY), F = Math.max(visMs(p.flyX), visMs(p.flyY)), flightEnd = Math.max(fx.end, fy.end);
  const surfAt = F * p.surfAt / 100, surfD = Math.max(1, F * p.surfDur / 100), txtAt = F * p.textAt / 100, txtD = Math.max(1, F * p.textDur / 100);
  const metaAt = F * p.metaAt / 100, tutAt = F + p.tutorDelay, straight = Math.max(.01, p.straighten / 100), g = p.gravity;
  const others = L.map((_, j) => j).filter((j) => j !== i).map((j) => {
    const d = L[j], sd = rnd(), sr = RR(-1, 1), dr = RR(-1, 1), st = rnd();            // draw order matters for parity
    const dly = p.ripple * Math.abs(j - i) + st * p.start, sg = sd < .5 ? 1 : -1, vy = p.kick;
    const tau = (-vy + Math.sqrt(vy * vy + 2 * g * Math.max(GEO.offscreen - d.cy, 0))) / g + .1;
    return { j, end: dly + tau, at: faller(d, dly, vy, dr * p.drift, sg * p.spin * (1 + sr * p.spinRand / 100), sg, p.wobble, g) };
  });
  const K = GEO.msgFont / GEO.chipFont, doneAt = p.loading > 0 ? tutAt + p.loading : Infinity;
  const motionEnd = Math.max(flightEnd, metaAt + p.metaFade, ...others.map((n) => n.end)) + 100;
  const raw: Raw = { motionEnd, duration: Math.max(motionEnd, isFinite(doneAt) ? doneAt + 500 : tutAt + 1200),
    at: (t) => {
      const pf = clamp(t / F, 0, 1), landed = t >= flightEnd, txe = bezOpacity(clamp((t - txtAt) / txtD, 0, 1)), blocks: Pose[] = [];
      blocks[i] = { cx: td.cx + (TX - td.cx) * fx.at(t), cy: td.cy + (TY - td.cy) * fy.at(t), r: td.r * (1 - bezMsg(clamp(pf / straight, 0, 1))),
                    s: 1 + p.lift / 100 * Math.sin(Math.PI * pf), o: landed ? 0 : 1 };
      for (const n of others) blocks[n.j] = n.at(t);
      return { blocks, intro: 1 - clamp(t / 450, 0, 1), rise: p.metaRise, stu: clamp((t - metaAt) / Math.max(1, p.metaFade), 0, 1), stuText: landed ? 1 : 0,
               tut: clamp((t - tutAt) / 600, 0, 1), done: t >= doneAt,
               morph: { i, surface: 1 - bezOpacity(clamp((t - surfAt) / surfD, 0, 1)), chip: 1 - txe, chipScale: 1 + (K - 1) * txe, msg: txe, msgScale: 1 / K + (1 - 1 / K) * txe } };
    } };
  return withTap(raw, p.tap, p.total, true);
}

/* ---------- BACK: user taps "+" in the chat (also BACK OUT, see below) ----------
 * Blocks rise in from just below the screen (lowest first), chat fades out, intro fades back in, keyboard (if up) goes down. */
export function back(from: Frame, seed = (Math.random() * 2 ** 31) | 0, p = P.back, L = REST): Timeline {
  const rnd = mulberry32(seed), RR = (a: number, b: number) => a + rnd() * (b - a);
  const sp = capped(p.spring), D = visMs(p.spring) * 1.6, N = L.length;
  const items = L.map((d, j) => {
    const dly = (N - 1 - j) * p.stagger * 1.3 + p.blocksAt;
    RR(0, 1); const rot = RR(-1, 1) * 80 * p.rand, xo = RR(-1, 1);                      // first draw unused, keep the order
    return { d, dly, sx: d.cx + xo * 170, sy: 910 + RR(0, 1) * 60 + j * 14, sr: d.r + rot * .6 };
  });
  const introAt = D * p.introAt / 100, motion = Math.max(...items.map((it) => it.dly + D)), kb0 = from.kb ?? 0;
  const raw: Raw = { motionEnd: motion + 100, duration: Math.max(motion + 100, introAt + p.introIn + 50, 500),
    at: (t) => ({ ...(kb0 ? { kb: kb0 * (1 - KB.at(t)) } : {}),
      blocks: items.map((it) => { const e = sp.at(t - it.dly);
        return { cx: it.sx + (it.d.cx - it.sx) * e, cy: it.sy + (it.d.cy - it.sy) * e, r: it.sr + (it.d.r - it.sr) * e, s: 1, o: 1 }; }),
      intro: from.intro + (1 - from.intro) * clamp((t - introAt) / p.introIn, 0, 1),
      stu: from.stu * (1 - clamp(t / p.chatOut, 0, 1)), tut: from.tut * (1 - clamp(t / p.chatOut, 0, 1)), done: from.done }) };
  return withTap(raw, p.tap, p.total, false);
}
/** BACK OUT: leaving the field without sending (tap outside, keyboard swiped down, app switch). Identical to back(), started
 *  from the Focus state: blocks rise back in, keyboard goes down, the intro (still visible) stays. */
export const backOut = (from: Frame, seed?: number) => back(from, seed);

/* ---------- FOCUS: user taps the message field ----------
 * Keyboard slides up right away; the blocks let go `blocksAt` ms later, lowest block first (`ripple` ms apart), and fall. */
export function focus(seed = (Math.random() * 2 ** 31) | 0, p = P.focus, L = REST): Timeline {
  const rnd = mulberry32(seed), RR = (a: number, b: number) => a + rnd() * (b - a), g = p.gravity, N = L.length;
  const ns = L.map((d, j) => {
    const sd = rnd(), sr = RR(-1, 1), dr = RR(-1, 1), dly = p.blocksAt + p.ripple * (N - 1 - j), sg = sd < .5 ? 1 : -1, vy = p.kick;
    const tau = (-vy + Math.sqrt(vy * vy + 2 * g * Math.max(GEO.offscreen - d.cy, 0))) / g + .1;
    return { end: dly + tau * 1000, at: faller(d, dly, vy, dr * p.drift, sg * p.spin * (1 + sr * .55), sg, 7, g) };
  });
  const motionEnd = Math.max(KB.end, ...ns.map((n) => n.end)) + 60;
  const raw: Raw = { motionEnd, duration: motionEnd + 200,
    at: (t) => ({ blocks: ns.map((n) => n.at(t)), intro: 1, stu: 0, tut: 0, done: false, kb: KB.at(t) }) };
  return withTap(raw, p.tap, p.total, false);
}

/* ---------- SEND: user sends a typed message (keyboard stays up) ----------
 * The text lifts out of the field and lands on the student message line on two springs (Y up, X left: slight arc). */
export function send(text: string, p = P.send, L = REST): Timeline {
  const fx = capped(p.flyX), fy = capped(p.flyY), F = Math.max(visMs(p.flyX), visMs(p.flyY)), flightEnd = Math.max(fx.end, fy.end);
  const x0 = GEO.fieldTextLeft, y0 = GEO.fieldTextCy + GEO.kbInputDy, x1 = GEO.msgTextLeft, y1 = GEO.msgTextCy;
  const metaAt = F * p.metaAt / 100, tutAt = F + p.tutorDelay, motionEnd = Math.max(flightEnd, metaAt + p.metaFade) + 100;
  const raw: Raw = { motionEnd, duration: Math.max(motionEnd, tutAt + 1200),
    at: (t) => { const landed = t >= flightEnd;
      return { blocks: L.map((d) => ({ cx: d.cx, cy: 1100, r: d.r, s: 1, o: 0 })), intro: 1 - clamp(t / 450, 0, 1), rise: p.metaRise,
        stu: clamp((t - metaAt) / Math.max(1, p.metaFade), 0, 1), stuText: landed ? 1 : 0, tut: clamp((t - tutAt) / 600, 0, 1), done: false, kb: 1,
        fly: { x: x0 + (x1 - x0) * fx.at(t), cy: y0 + (y1 - y0) * fy.at(t), o: landed ? 0 : 1, text } }; } };
  return withTap(raw, p.tap, p.total, false);
}

/* ---------- DESKTOP HOVER WIGGLE (pointer devices only; never on its own) ----------
 * On pointer-enter: ONE random jolt, then it springs back. The hovered element also gets a light grey fill (#ececec).
 * Jolt: transition to the offset in 180 ms, cubic-bezier(.2,.9,.3,1.2). After 110 ms: return to 0 in 500 ms, cubic-bezier(.2,1.4,.4,1).
 * On pointer-leave: return immediately (same return curve). Not active while an animation runs / after a block was tapped. */
export const WIGGLE = { joltMs: 180, holdMs: 110, settleMs: 500, joltCurve: [.2, .9, .3, 1.2], settleCurve: [.2, 1.4, .4, 1], hoverFill: '#ececec' };
export function wiggleOffset(rnd: () => number = Math.random, amount = P.wiggle) {
  return { dx: (rnd() * 2 - 1) * 5 * amount, dy: (rnd() * 2 - 1) * 4 * amount, rot: (rnd() * 2 - 1) * 5 * amount };   // px, px, deg
}

/* ---------- usage (web) ----------
let tl = open(1), t0 = performance.now();                  // user tapped block 1
(function tick(now: number) { const t = now - t0; setFrame(tl.at(t)); if (t < tl.duration) requestAnimationFrame(tick); })(t0);
// "+" later: tl = back(tl.at(now - t0)); t0 = now; ...    // back starts from what is on screen
// Field: tl = focus(); ... leave without sending: tl = backOut(tl.at(t)); ... send: tl = send(text); then "+": tl = back(tl.at(t))
// <AiTutorScreen frame={frame} tapped={1} prompt={text} />  // the screen code renders the frame
*/
