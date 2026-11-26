# Fills the V4 reference ports (TS + Dart) with the saved workbench values (dbdump/tweaks/current.json).
import json
import subprocess, re
# final values = V4 (variant E), exactly as the manifest builds them (assemble.py): saved values, V3 values copied to the
# V4 keys where nothing was saved for V4, engine defaults for the rest
vals = {k:x for k,x in json.load(open('values.json'))['values'].items() if 'Blur' not in k and k!='blurSpring3'}
_d3 = lambda k: k.endswith('3') or k in ('flyYSpring','flyXSpring') or bool(re.match(r'^[fd][A-Z][A-Za-z]*$', k))
for _k in [k for k in list(vals) if _d3(k)]: vals.setdefault(_k[:-1]+'4' if _k.endswith('3') else _k+'4', vals[_k])
defs = json.loads(subprocess.run(['node','-e',"global.window=globalThis;require('./source/motionlib.js');require('./out/motion-engine.js');process.stdout.write(JSON.stringify(MotionEngine.create({spring:MotionLib.spring}).defaults()))"],capture_output=True,check=True).stdout)
v = dict(defs, **vals)
json.dump(vals, open('out/values4.json','w'))   # the parity check samples the engine with exactly these
sp = lambda s: {'visualDuration': s['visualDuration'], 'bounce': s['bounce']}
P = {
 'enter': {'tap': v['tapEnter4'], 'total': v['durEnter4'], 'stagger': v['staggerEnter4'], 'rand': v['randEnter4']/100, 'textAt': v['textEnter4'], 'spring': sp(v['enterSpring4'])},
 'open': {'tap': v['tapOpen4'], 'total': v['durOpen4'], 'flyX': sp(v['flyXSpring4']), 'flyY': sp(v['flyYSpring4']), 'straighten': v['fStraighten4'], 'lift': v['fLift4'],
          'surfAt': v['fSurfAt4'], 'surfDur': v['fSurfDur4'], 'textAt': v['fTextAt4'], 'textDur': v['fTextDur4'], 'metaAt': v['fMetaAt4'], 'metaFade': v['fMetaFade4'],
          'metaRise': v['fMetaRise4'], 'tutorDelay': v['fTutorDelay4'], 'loading': v['loading4'], 'ripple': v['dRipple4'], 'start': v['dStart4'], 'kick': v['dKick4'],
          'gravity': v['dGravity4'], 'spin': v['dSpin4'], 'spinRand': v['dSpinRand4'], 'drift': v['dDrift4'], 'wobble': v['dWobble4'],
          'pass': v['wPass4'], 'push': v['wPush4'], 'reach': v['wReach4']},
 'back': {'tap': v['tapBack4'], 'total': v['durBack4'], 'stagger': v['staggerBack4'], 'rand': v['randBack4']/100, 'blocksAt': v['blocksAtBack4'],
          'introAt': v['introAtBack4'], 'introIn': v['introInBack4'], 'chatOut': v['chatOutBack4'], 'spring': sp(v['backSpring4'])},
 'backOut': {'tap': v['tapBack4'], 'total': v['durBack4'], 'stagger': v['staggerBack4'], 'rand': v['randBack4']/100, 'blocksAt': v['blocksAtBack4'],
          'rise': v['wRise4'], 'spring': sp(v['backSpring4'])},
 'focus': {'tap': v['tapFocus4'], 'total': v['durFocus4'], 'blocksAt': v['blocksAtFocus4'], 'ripple': v['gRipple4'], 'kick': v['gKick4'], 'gravity': v['gGravity4'],
           'spin': v['gSpin4'], 'drift': v['gDrift4']},
 'wiggle': v['wiggle4']/100,
}
def ts(o, ind='  '):
    if isinstance(o, dict):
        if 'visualDuration' in o: return '{ visualDuration: %s, bounce: %s } as Spring' % (o['visualDuration'], o['bounce'])
        return '{\n' + ''.join(f"{ind}  {k}: {ts(x, ind+'  ')},\n" for k, x in o.items()) + ind + '}'
    return json.dumps(o)
open('out/ref_v3.out.ts','w').write(open('source/ref_v3.ts').read().replace('__PARAMS__', ts(P, '')))

if __import__('os').path.exists('source/ref_v3.dart'):
    def dt(o):
        if isinstance(o, dict):
            if 'visualDuration' in o: return 'Spring.visual(%s, %s)' % (float(o['visualDuration']), float(o['bounce']))
            return None
        return repr(float(o))
    lines = []
    for k, o in P.items():
        if isinstance(o, dict): lines.append(f"  static const {k} = {k[0].upper()+k[1:]}P(" + ', '.join(f"{a}: {dt(b)}" for a, b in o.items()) + ');')
        else: lines.append(f"  static const {k} = {dt(o)};")
    open('out/ref_v3.out.dart','w').write(open('source/ref_v3.dart').read().replace('  // __PARAMS__', '\n'.join(lines)))
print('ok')
