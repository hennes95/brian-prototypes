// AI Tutor use-case blocks – motion model (V3, final values). Port of the TypeScript reference (motion:ref-ts), same numbers.
// Pure functions of time: at(tMs) -> ScreenFrame, the exact frame the screen code (motion:screen-dart) renders.
// Save the screen code as ai_tutor_screen.dart next to this file (or change the import).
//
// Animations (every one starts with the user action: `tap` ms finger down, then the motion):
//   enter()          user opens the AI Tutor tab: blocks arrive near their place, intro text last
//   open(i)          user taps block i: it flies into the student message and becomes its text; the others fall
//   back(from)       user taps "+" in the chat: chat fades, blocks rise back in from below, intro returns
//   focus()          user taps the message field: keyboard slides up, all blocks break away (bottom first)
//   backOut(from)    user leaves the field without sending: same as back(), keyboard goes down, intro stays
//   send(text)       user sends a typed message: the text lifts out of the field and lands on the student message line
// `from` = the frame on screen when the user acted (e.g. open(...).at(t)).
// Artboard 402 x 874 logical px (scale the whole artboard once by width / 402). Angles in degrees, time in ms.
// Check against the test vectors in the manifest (±0.01); the TS port passes them, this file mirrors it line by line.
import 'dart:math' as math;
import 'package:flutter/animation.dart' show Cubic;
import 'ai_tutor_screen.dart' show Pose, Morph, Fly, ScreenFrame;

class Rest { final double cx, cy, r; const Rest(this.cx, this.cy, this.r); }
/// Where the elements rest (tower, top -> bottom). Any number of elements works.
const rest = [Rest(200.7, 434.9, -2), Rest(180.7, 490.4, 0), Rest(200.7, 546.4, 2), Rest(219.7, 601.9, -4), Rest(200.7, 658.0, -2)];
const blockW = 231.5;
/// Measured geometry (artboard px).
class Geo {
  static const msgTextLeft = 68.0, msgTextCy = 163.6;      // student message text line: left edge, line centre
  static const labelLeft = 44.0, chipFont = 12.0, msgFont = 14.0;
  static const fieldTextLeft = 81.0, fieldTextCy = 755.0;  // text in the message field (keyboard down)
  static const kbInputDy = -245.0;                         // input bar offset when the keyboard is up
  static const kbSpring = Spring.visual(0.38, 0);          // stand-in for the OS keyboard slide (use the real inset in the app)
  static const offscreen = 990.0;
}

/// Spring by (visualDuration s, bounce) or explicit physics.
class Spring {
  final double? visualDuration, bounce, stiffness, damping, mass;
  const Spring.visual(double this.visualDuration, double this.bounce) : stiffness = null, damping = null, mass = null;
  const Spring.physics(double this.stiffness, double this.damping, double this.mass) : visualDuration = null, bounce = null;
  double get visMs => (visualDuration ?? .8) * 1000;
}

class EnterP { final double tap, total, stagger, rand, textAt; final Spring spring;
  const EnterP({required this.tap, required this.total, required this.stagger, required this.rand, required this.textAt, required this.spring}); }
class OpenP { final double tap, total, straighten, lift, surfAt, surfDur, textAt, textDur, metaAt, metaFade, metaRise, tutorDelay, loading,
    ripple, start, kick, gravity, spin, spinRand, drift, wobble; final Spring flyX, flyY;
  const OpenP({required this.tap, required this.total, required this.flyX, required this.flyY, required this.straighten, required this.lift,
    required this.surfAt, required this.surfDur, required this.textAt, required this.textDur, required this.metaAt, required this.metaFade,
    required this.metaRise, required this.tutorDelay, required this.loading, required this.ripple, required this.start, required this.kick,
    required this.gravity, required this.spin, required this.spinRand, required this.drift, required this.wobble}); }
class BackP { final double tap, total, stagger, rand, blocksAt, introAt, introIn, chatOut; final Spring spring;
  const BackP({required this.tap, required this.total, required this.stagger, required this.rand, required this.blocksAt, required this.introAt,
    required this.introIn, required this.chatOut, required this.spring}); }
class FocusP { final double tap, total, blocksAt, ripple, kick, gravity, spin, drift;
  const FocusP({required this.tap, required this.total, required this.blocksAt, required this.ripple, required this.kick, required this.gravity,
    required this.spin, required this.drift}); }
class SendP { final double tap, total, metaAt, metaFade, metaRise, tutorDelay; final Spring flyX, flyY;
  const SendP({required this.tap, required this.total, required this.flyX, required this.flyY, required this.metaAt, required this.metaFade,
    required this.metaRise, required this.tutorDelay}); }

/// Final tuned values (V3). Change here only.
// <<PARAMS
class P {
  // __PARAMS__
}
// PARAMS>>

class Timeline { final double duration, motionEnd; final ScreenFrame Function(double t) at; const Timeline(this.duration, this.motionEnd, this.at); }

/* ---------- helpers ---------- */
double _clamp(double v, double a, double b) => math.max(a, math.min(b, v));
const _bezOpacity = Cubic(.25, .1, .25, 1), _bezMsg = Cubic(.2, .8, .2, 1);   // Flutter's Cubic = CSS cubic-bezier
double bezOpacity(double x) => x <= 0 ? 0 : (x >= 1 ? 1 : _bezOpacity.transform(x));
double bezMsg(double x) => x <= 0 ? 0 : (x >= 1 ? 1 : _bezMsg.transform(x));

// mulberry32 – 32-bit safe (also on Flutter web, where ints are doubles)
int _imul(int a, int b) { a &= 0xFFFFFFFF; b &= 0xFFFFFFFF; final ah = a >>> 16, al = a & 0xFFFF;
  return ((al * b) + (((ah * b) & 0xFFFF) << 16)) & 0xFFFFFFFF; }
double Function() mulberry32(int seed) {
  var a = seed & 0xFFFFFFFF;
  return () {
    a = (a + 0x6D2B79F5) & 0xFFFFFFFF;
    var t = a;
    t = _imul(t ^ (t >>> 15), t | 1);
    t = (t ^ ((t + _imul(t ^ (t >>> 7), t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF;
    return ((t ^ (t >>> 14)) & 0xFFFFFFFF) / 4294967296.0;
  };
}
int _randomSeed() => math.Random().nextInt(1 << 31);

/// Spring 0 -> 1 by elapsed ms. Same maths as Motion's spring() (motion.dev), including its rest snap
/// (value becomes exactly 1 once speed <= 0.01/s and distance <= 0.005). Returns 0 for ms <= 0.
double Function(double) spring(Spring c) {
  double k, d, m = 1; var timeDefined = false;
  if (c.visualDuration != null) {
    final b = c.bounce!, z = b < 0 ? 1 / math.max(1 + b, .05) : math.max(1 - b, .05), root = 2 * math.pi / (c.visualDuration! * 1.2);
    k = root * root; d = 2 * z * math.sqrt(k); timeDefined = true;
  } else { k = c.stiffness!; d = c.damping!; m = c.mass!; }
  final u = d / (2 * math.sqrt(k * m)), w = math.sqrt(k / m) / 1000, g = u * w;   // per ms
  late double Function(double) pos, vel;
  if (u < 1) {
    final s = w * math.sqrt(1 - u * u), A = g / s, sinC = g * A + s, cosC = g - A * s;
    pos = (t) => 1 - math.exp(-g * t) * (A * math.sin(s * t) + math.cos(s * t));
    vel = (t) => math.exp(-g * t) * (sinC * math.sin(s * t) + cosC * math.cos(s * t));
  } else if (u == 1) {
    pos = (t) => 1 - math.exp(-w * t) * (1 + w * t);
    vel = (t) => math.exp(-w * t) * (w * w * t);
  } else {
    final s = w * math.sqrt(u * u - 1), a = g - s, b = g + s, cut = s < 1 || timeDefined ? double.infinity : 300 / s;
    double C(double x, double t) => math.exp(t > cut ? (g - x) * cut - g * t : -x * t);
    final X = g / s, S = (1 + X) / 2, F = (1 - X) / 2;
    pos = (t) => 1 - S * C(a, t) - F * C(b, t);
    vel = (t) => a * S * C(a, t) + b * F * C(b, t);
  }
  return (ms) { if (ms <= 0) return 0.0; final p = pos(ms); return (vel(ms) * 1000).abs() <= .01 && (1 - p).abs() <= .005 ? 1.0 : p; };
}
/// spring that is exactly 1 after 1.6 x its visual duration
class _Capped { final double Function(double) f; final double end; _Capped(Spring c) : f = spring(c), end = c.visMs * 1.6;
  double at(double t) => t >= end ? 1.0 : f(t); }
final _kb = _Capped(Geo.kbSpring);

/// Raw frame without `pressed`; withTap adds it.
typedef _Raw = ScreenFrame Function(double t, bool pressed);
/// user action first (tap ms), then the motion, optionally time-scaled so the motion lasts `total` ms (0 = natural)
Timeline _withTap(double duration, double motionEnd, _Raw at, double tap, double total, bool pressBlock) {
  final f = total > 0 && motionEnd > 0 ? total / motionEnd : 1.0;
  return Timeline(duration * f + tap, motionEnd * f + tap, (t) => at(math.max(0, t - tap) / f, pressBlock && t >= 60));
}
/// falling block (open: the untapped ones; focus: all of them)
Pose Function(double) _faller(Rest d, double dly, double vy, double vx, double w, double sg, double wobble, double g) => (t) {
  final u = math.max(0.0, (t - dly) / 1000), q = .22 * (1 - math.exp(-u / .22));
  return Pose(d.cx + vx * q * 1.6, d.cy + vy * u + .5 * g * u * u, d.r + w * (u - q) + wobble * sg * math.sin(u * 18) * math.exp(-u * 7), 1, 1);
};
double _tau(double vy, double g, double cy) => (-vy + math.sqrt(vy * vy + 2 * g * math.max(Geo.offscreen - cy, 0))) / g + .1;
double _max(Iterable<double> xs) => xs.reduce(math.max);

/* ---------- ENTER: user opens the AI Tutor tab ---------- */
Timeline enter({int? seed, EnterP p = P.enter, List<Rest> L = rest}) {
  final s0 = seed ?? _randomSeed(), rnd = mulberry32(s0), r2 = mulberry32((s0 ^ 0x9e3779b9) & 0xFFFFFFFF);
  double R2(double a, double b) => a + r2() * (b - a);
  final sp = _Capped(p.spring), D = p.spring.visMs * 1.6, mid = (L.length - 1) / 2;
  final items = <({Rest d, double dly, double sx, double sy, double sr})>[];
  for (var j = 0; j < L.length; j++) {
    final d = L[j], side = j < mid ? -1 : (j > mid ? 1 : 0), dly = R2(0, 1) * p.stagger * 3;
    rnd(); rnd(); rnd();                                             // unused draws, keep the order
    final hx = (R2(0, 1) < .5 ? -1 : 1) * (130 + R2(0, 1) * 150), vy = side * (110 + R2(0, 1) * 140);
    final tilt = (R2(0, 1) < .5 ? -1 : 1) * (16 + R2(0, 1) * 30) * p.rand;
    items.add((d: d, dly: dly, sx: d.cx + hx, sy: d.cy + vy, sr: d.r + tilt));
  }
  final motion = _max(items.map((it) => it.dly + D));
  return _withTap(math.max(motion + 100, p.textAt + 500), motion + 100, (t, pressed) => ScreenFrame(
    blocks: [for (final it in items) () { final e = sp.at(t - it.dly);
      return Pose(it.sx + (it.d.cx - it.sx) * e, it.sy + (it.d.cy - it.sy) * e, it.sr + (it.d.r - it.sr) * e, 1, bezOpacity((t - it.dly) / 350)); }()],
    intro: _clamp((t - p.textAt) / 450, 0, 1), stu: 0, tut: 0, done: false, pressed: pressed), p.tap, p.total, false);
}

/* ---------- OPEN: user taps block i (it flies into the student message and becomes its text) ---------- */
Timeline open(int i, {int? seed, OpenP p = P.open, List<Rest> L = rest}) {
  final rnd = mulberry32(seed ?? _randomSeed()); double rr(double a, double b) => a + rnd() * (b - a);
  final td = L[i], tx = Geo.msgTextLeft - Geo.labelLeft + blockW / 2, ty = Geo.msgTextCy;
  final fx = _Capped(p.flyX), fy = _Capped(p.flyY), F = math.max(p.flyX.visMs, p.flyY.visMs), flightEnd = math.max(fx.end, fy.end);
  final surfAt = F * p.surfAt / 100, surfD = math.max(1.0, F * p.surfDur / 100), txtAt = F * p.textAt / 100, txtD = math.max(1.0, F * p.textDur / 100);
  final metaAt = F * p.metaAt / 100, tutAt = F + p.tutorDelay, straight = math.max(.01, p.straighten / 100), g = p.gravity;
  final others = <({int j, double end, Pose Function(double) at})>[];
  for (var j = 0; j < L.length; j++) { if (j == i) continue;
    final d = L[j], sd = rnd(), sr = rr(-1, 1), dr = rr(-1, 1), st = rnd();            // draw order matters for parity
    final dly = p.ripple * (j - i).abs() + st * p.start, sg = sd < .5 ? 1.0 : -1.0, vy = p.kick;
    others.add((j: j, end: dly + _tau(vy, g, d.cy), at: _faller(d, dly, vy, dr * p.drift, sg * p.spin * (1 + sr * p.spinRand / 100), sg, p.wobble, g)));
  }
  final K = Geo.msgFont / Geo.chipFont, doneAt = p.loading > 0 ? tutAt + p.loading : double.infinity;
  final motionEnd = _max([flightEnd, metaAt + p.metaFade, ...others.map((n) => n.end)]) + 100;
  return _withTap(math.max(motionEnd, doneAt.isFinite ? doneAt + 500 : tutAt + 1200), motionEnd, (t, pressed) {
    final pf = _clamp(t / F, 0, 1), landed = t >= flightEnd, txe = bezOpacity(_clamp((t - txtAt) / txtD, 0, 1));
    final blocks = List<Pose>.filled(L.length, const Pose(0, 0, 0, 1, 1));
    blocks[i] = Pose(td.cx + (tx - td.cx) * fx.at(t), td.cy + (ty - td.cy) * fy.at(t), td.r * (1 - bezMsg(_clamp(pf / straight, 0, 1))),
        1 + p.lift / 100 * math.sin(math.pi * pf), landed ? 0.0 : 1.0);
    for (final n in others) { blocks[n.j] = n.at(t); }
    return ScreenFrame(blocks: blocks, intro: 1 - _clamp(t / 450, 0, 1), rise: p.metaRise, stu: _clamp((t - metaAt) / math.max(1, p.metaFade), 0, 1),
        stuText: landed ? 1.0 : 0.0, tut: _clamp((t - tutAt) / 600, 0, 1), done: t >= doneAt, pressed: pressed,
        morph: Morph(i, 1 - bezOpacity(_clamp((t - surfAt) / surfD, 0, 1)), 1 - txe, 1 + (K - 1) * txe, txe, 1 / K + (1 - 1 / K) * txe));
  }, p.tap, p.total, true);
}

/* ---------- BACK: user taps "+" in the chat (also BACK OUT) ----------
   Blocks rise in from just below the screen (lowest first), chat fades out, intro fades back in, keyboard (if up) goes down. */
Timeline back(ScreenFrame from, {int? seed, BackP p = P.back, List<Rest> L = rest}) {
  final rnd = mulberry32(seed ?? _randomSeed()); double rr(double a, double b) => a + rnd() * (b - a);
  final sp = _Capped(p.spring), D = p.spring.visMs * 1.6, N = L.length;
  final items = <({Rest d, double dly, double sx, double sy, double sr})>[];
  for (var j = 0; j < N; j++) {
    final d = L[j], dly = (N - 1 - j) * p.stagger * 1.3 + p.blocksAt;
    rr(0, 1); final rot = rr(-1, 1) * 80 * p.rand, xo = rr(-1, 1);                    // first draw unused, keep the order
    items.add((d: d, dly: dly, sx: d.cx + xo * 170, sy: 910 + rr(0, 1) * 60 + j * 14, sr: d.r + rot * .6));
  }
  final introAt = D * p.introAt / 100, motion = _max(items.map((it) => it.dly + D)), kb0 = from.kb;
  return _withTap(math.max(math.max(motion + 100, introAt + p.introIn + 50), 500), motion + 100, (t, pressed) => ScreenFrame(
    kb: kb0 > 0 ? kb0 * (1 - _kb.at(t)) : 0.0,
    blocks: [for (final it in items) () { final e = sp.at(t - it.dly);
      return Pose(it.sx + (it.d.cx - it.sx) * e, it.sy + (it.d.cy - it.sy) * e, it.sr + (it.d.r - it.sr) * e, 1, 1); }()],
    intro: from.intro + (1 - from.intro) * _clamp((t - introAt) / p.introIn, 0, 1),
    stu: from.stu * (1 - _clamp(t / p.chatOut, 0, 1)), tut: from.tut * (1 - _clamp(t / p.chatOut, 0, 1)), done: from.done, pressed: pressed),
    p.tap, p.total, false);
}
/// BACK OUT: leaving the field without sending (tap outside, keyboard swiped down, app switch). Identical to back(),
/// started from the Focus state: blocks rise back in, keyboard goes down, the intro (still visible) stays.
Timeline backOut(ScreenFrame from, {int? seed}) => back(from, seed: seed);

/* ---------- FOCUS: user taps the message field ----------
   Keyboard slides up right away; the blocks let go `blocksAt` ms later, lowest block first (`ripple` ms apart), and fall. */
Timeline focus({int? seed, FocusP p = P.focus, List<Rest> L = rest}) {
  final rnd = mulberry32(seed ?? _randomSeed()); double rr(double a, double b) => a + rnd() * (b - a);
  final g = p.gravity, N = L.length;
  final ns = <({double end, Pose Function(double) at})>[];
  for (var j = 0; j < N; j++) {
    final d = L[j], sd = rnd(), sr = rr(-1, 1), dr = rr(-1, 1), dly = p.blocksAt + p.ripple * (N - 1 - j), sg = sd < .5 ? 1.0 : -1.0, vy = p.kick;
    ns.add((end: dly + _tau(vy, g, d.cy) * 1000, at: _faller(d, dly, vy, dr * p.drift, sg * p.spin * (1 + sr * .55), sg, 7, g)));
  }
  final motionEnd = _max([_kb.end, ...ns.map((n) => n.end)]) + 60;
  return _withTap(motionEnd + 200, motionEnd, (t, pressed) => ScreenFrame(blocks: [for (final n in ns) n.at(t)], intro: 1, stu: 0, tut: 0, done: false,
      kb: _kb.at(t), pressed: pressed), p.tap, p.total, false);
}

/* ---------- SEND: user sends a typed message (keyboard stays up) ----------
   The text lifts out of the field and lands on the student message line on two springs (Y up, X left: slight arc). */
Timeline send(String text, {SendP p = P.send, List<Rest> L = rest}) {
  final fx = _Capped(p.flyX), fy = _Capped(p.flyY), F = math.max(p.flyX.visMs, p.flyY.visMs), flightEnd = math.max(fx.end, fy.end);
  const x0 = Geo.fieldTextLeft, y0 = Geo.fieldTextCy + Geo.kbInputDy, x1 = Geo.msgTextLeft, y1 = Geo.msgTextCy;
  final metaAt = F * p.metaAt / 100, tutAt = F + p.tutorDelay, motionEnd = math.max(flightEnd, metaAt + p.metaFade) + 100;
  return _withTap(math.max(motionEnd, tutAt + 1200), motionEnd, (t, pressed) { final landed = t >= flightEnd;
    return ScreenFrame(blocks: [for (final d in L) Pose(d.cx, 1100, d.r, 1, 0)], intro: 1 - _clamp(t / 450, 0, 1), rise: p.metaRise,
        stu: _clamp((t - metaAt) / math.max(1, p.metaFade), 0, 1), stuText: landed ? 1.0 : 0.0, tut: _clamp((t - tutAt) / 600, 0, 1), done: false, kb: 1,
        fly: Fly(x0 + (x1 - x0) * fx.at(t), y0 + (y1 - y0) * fy.at(t), landed ? 0.0 : 1.0, text), pressed: pressed); }, p.tap, p.total, false);
}

/* ---------- DESKTOP HOVER WIGGLE (pointer devices only; never on its own) ----------
   On pointer-enter: ONE random jolt, then it springs back; hovered element fill #ececec.
   Jolt 180 ms Cubic(.2,.9,.3,1.2); after 110 ms return in 500 ms Cubic(.2,1.4,.4,1). On pointer-leave return immediately.
   Not active while an animation runs / after a block was tapped. */
({double dx, double dy, double rot}) wiggleOffset([double Function()? rnd, double amount = P.wiggle]) {
  final r = rnd ?? math.Random().nextDouble;
  return (dx: (r() * 2 - 1) * 5 * amount, dy: (r() * 2 - 1) * 4 * amount, rot: (r() * 2 - 1) * 5 * amount);   // px, px, deg
}

/* ---------- usage (Flutter) ----------
   final ticker = createTicker((elapsed) => setState(() => frame = tl.at(elapsed.inMicroseconds / 1000)));
   tl = open(1); ticker.start();                       // user tapped block 1
   // "+" later: tl = back(frame); restart the ticker  // back starts from what is on screen
   // AiTutorScreen(frame: frame, tapped: 1, prompt: text)
*/
