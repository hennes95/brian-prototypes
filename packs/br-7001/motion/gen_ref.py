# Fills the V3 reference ports (TS + Dart) with the saved workbench values (dbdump/tweaks/current.json).
import json
v = json.load(open('values.json'))['values']
sp = lambda s: {'visualDuration': s['visualDuration'], 'bounce': s['bounce']}
P = {
 'enter': {'tap': v['tapEnter3'], 'total': v['durEnter3'], 'stagger': v['staggerEnter3'], 'rand': v['randEnter3']/100, 'textAt': v['textEnter3'], 'spring': sp(v['enterSpring3'])},
 'open': {'tap': v['tapOpen3'], 'total': v['durOpen3'], 'flyX': sp(v['flyXSpring']), 'flyY': sp(v['flyYSpring']), 'straighten': v['fStraighten'], 'lift': v['fLift'],
          'surfAt': v['fSurfAt'], 'surfDur': v['fSurfDur'], 'textAt': v['fTextAt'], 'textDur': v['fTextDur'], 'metaAt': v['fMetaAt'], 'metaFade': v['fMetaFade'],
          'metaRise': v['fMetaRise'], 'tutorDelay': v['fTutorDelay'], 'loading': v['loading3'], 'ripple': v['dRipple'], 'start': v['dStart'], 'kick': v['dKick'],
          'gravity': v['dGravity'], 'spin': v['dSpin'], 'spinRand': v['dSpinRand'], 'drift': v['dDrift'], 'wobble': v['dWobble']},
 'back': {'tap': v['tapBack3'], 'total': v['durBack3'], 'stagger': v['staggerBack3'], 'rand': v['randBack3']/100, 'blocksAt': v['blocksAtBack3'],
          'introAt': v['introAtBack3'], 'introIn': v['introInBack3'], 'chatOut': v['chatOutBack3'], 'spring': sp(v['backSpring3'])},
 'focus': {'tap': v['tapFocus3'], 'total': v['durFocus3'], 'blocksAt': v['blocksAtFocus3'], 'ripple': v['gRipple3'], 'kick': v['gKick3'], 'gravity': v['gGravity3'],
           'spin': v['gSpin3'], 'drift': v['gDrift3']},
 'wiggle': v['wiggle3']/100,
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
