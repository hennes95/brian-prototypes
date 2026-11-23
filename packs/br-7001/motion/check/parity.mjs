// Parity: TS reference port (out/ref_v3.out.ts) vs the package engine's test vectors (variant D, values.json). Exit 1 on mismatch.
import { createRequire } from 'module'; import { copyFileSync } from 'fs'; import { dirname, join } from 'path'; import { fileURLToPath } from 'url';
const here = join(dirname(fileURLToPath(import.meta.url)), '..'), require = createRequire(import.meta.url);
globalThis.window = globalThis; require(join(here, 'source/motionlib.js')); require(join(here, 'out/motion-engine.js'));
const E = MotionEngine.create({ spring: MotionLib.spring }), v = require(join(here, 'values.json')).values, ref = E.vectors('D', v);
copyFileSync(join(here, 'out/ref_v3.out.ts'), join(here, 'out/ref_check.ts'));
const R = await import(join(here, 'out/ref_check.ts'));
const o = R.open(1, 12345), f = R.focus(4242);
const tl = { open: o, back: R.back(o.at(o.duration), 777), enter: R.enter(999), focus: f, blur: R.backOut(f.at(f.duration), 5151), send: R.send('Explain photosynthesis') };
let bad = 0, n = 0; const rd = x => Math.round(x * 100) / 100;
const cmp = (k, si, name, a, b) => { n++; if (Math.abs(a - b) > 0.011) { bad++; if (bad < 25) console.log('MISMATCH', k, ref.T[si], name, a, b); } };
for (const k of Object.keys(tl)) {
  cmp(k, 0, 'duration', ref[k].duration, rd(tl[k].duration));
  ref[k].s.forEach((s, si) => { const g = tl[k].at(ref.T[si]);
    s.b.forEach((b, j) => { const p = g.blocks[j]; [p.cx, p.cy, p.r, p.s, p.o].forEach((x, q) => cmp(k, si, 'b' + j + '.' + q, b[q], rd(x))); });
    ['intro', 'stu', 'tut'].forEach(x => cmp(k, si, x, s[x], rd(g[x])));
    if (s.kb !== undefined) cmp(k, si, 'kb', s.kb, rd(g.kb ?? 0));
    if (s.fly) [g.fly.x, g.fly.cy, g.fly.o].forEach((x, q) => cmp(k, si, 'fly' + q, s.fly[q], rd(x)));
    if (s.m) { const m = g.morph; [m.surface, m.chip, m.chipScale, m.msg, m.msgScale].forEach((x, q) => cmp(k, si, 'm' + q, s.m[q], rd(x))); }
    if (s.st !== undefined) cmp(k, si, 'stuText', s.st, rd(g.stuText));
  });
}
console.log(bad ? 'PARITY FAIL ' + bad + '/' + n : 'Parity: PASS (' + n + ' values)'); if (bad) process.exit(1);
