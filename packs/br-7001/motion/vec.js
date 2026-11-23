global.window = globalThis; require('./source/motionlib.js'); require('./out/motion-engine.js');
const E = MotionEngine.create({ spring: MotionLib.spring });
const m = JSON.parse(require('fs').readFileSync(0, 'utf8')); const out = {};
m.variants.forEach(x => { out[x.id] = E.vectors(x.id, m.values); });
process.stdout.write(JSON.stringify(out));
