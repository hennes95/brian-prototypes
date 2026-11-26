L = open('source/orig.html').read().split('\n')
A = lambda a,b: '\n'.join(L[12114+a-1:12114+b])          # app.txt line numbers -> original source (uncut)
def rep(s, old, new, n=1):
    assert s.count(old) == n, (old, s.count(old)); return s.replace(old, new)
head = '''/* motion:engine — AI Tutor · use-case blocks
 * The motion is a pure function of time: modelFor(variant, animation, runs) -> { dur, motionEnd, tapLead, at(tMs) -> frame }.
 * frame.blocks[j] = { cx, cy, r (deg), s (resize factor), o (opacity) } in artboard px (402 x 874), plus intro / stu / tut / done,
 * touch (finger dot), pressed, and for V3 stuText + morph. Playing = advancing t, scrubbing = setting t, exporting = sampling t.
 * Needs a spring generator with Motion's API: MotionEngine.create({ spring: MotionLib.spring })  (motion's spring()).
 * Variants: B = V1 (physical push), C = V2 (handoff), D = V3 (block flies into the student message).
 * The tweak catalogue (labels, ranges, defaults) lives here; the current values live in the package manifest. */
(function(root){
root.MotionEngine = { id:'ai-tutor-blocks', create(ctx){
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const R = (a,b)=>a+Math.random()*(b-a);
  const SUF = {B:'1',C:'2',D:'3'};
  let V = {};                                               // live values (set by the workbench via setValues)
  const P = (name,vr)=>V[name+SUF[vr]];
'''
cat = A(11,147)
cat = rep(cat, "  const P = (name,vr)=>V[name+(vr==='C'?'2':'1')];\n", '')
d3 = '''
  /* ---- V3 (D): block flies into the student message ---- */
  const FLYT = [
    T('fStraighten','Tilt reaches 0° at',5,100,1,60,' %','When the tapped block is straight',
      'Share of the flight after which the tapped block has lost its tilt.','Straight right away.','Straightens on landing.','The tapped block in flight.'),
    T('fLift','Lift',0,20,.5,5,' %','Block grows a little mid-flight',
      'The tapped block grows by this much in the middle of the flight (anticipation).','Flat.','Big lift.','The tapped block in flight.'),
    T('fSurfAt','Surface fades from',0,100,1,25,' %','When fill, border, shadow and icon start to go',
      'Share of the flight after which the block surface fades, so only the text is left.','Surface goes right away.','Surface stays until landing.','The tapped block in flight.'),
    T('fSurfDur','Surface fade length',1,100,1,45,' %','How long the surface fade takes',
      'Length of the surface fade, as a share of the flight.','Snap.','Slow dissolve.','The tapped block in flight.'),
    T('fTextAt','Text style change from',0,100,1,35,' %','When the label turns into message text',
      'Share of the flight after which the label crossfades from block style (12 px bold, white) to message style (14 px regular, ink).','Early.','On landing.','The label in flight.'),
    T('fTextDur','Text style change length',1,100,1,30,' %','How long the text crossfade takes',
      'Length of the text crossfade, as a share of the flight.','Snap.','Slow.','The label in flight.'),
    T('fMetaAt','Avatar + name in at',0,150,1,72,' %','When avatar and “Student - 10:32” appear',
      'Share of the flight after which avatar and name fade in around the landing text.','Before landing.','After landing.','The student message.'),
    T('fMetaFade','Avatar + name fade',0,1000,10,240,' ms','Fade length of avatar and name',
      'How long avatar and name take to fade in.','Pop.','Slow.','The student message.'),
    T('fMetaRise','Avatar + name rise',0,60,1,8,' px','How far avatar and name rise while fading in',
      'Avatar and name start this far below and rise into place. The text line itself never moves: the label lands on it.','Only fades.','Long rise.','The student message.'),
    T('fTutorDelay','Brian after landing',0,1500,10,350,' ms','When Brian’s message appears',
      'Delay after the flight before Brian’s message fades in.','Right away.','Late.','The chat after landing.'),
    T('dRipple','Ripple delay per block',0,400,5,70,' ms','Delay before each block lets go (nearest to the tapped block first)',
      'The blocks next to the tapped one fall first, then the ones further away.','All at once.','Slow domino.','The falling blocks.')
  ];
  const D3 = {bGravity:3500,bKick:-10,bSpin:235,bSpinRand:55,bDrift:310,bStart:0,bWobble:7,
              tapOpen3:90,durOpen3:0,loading3:1800,tapBack3:240,durBack3:1200,staggerBack3:70,randBack3:100,
              tapEnter3:240,durEnter3:1190,staggerEnter3:40,randEnter3:67,textEnter3:190,wiggle3:40,shake3:0};
  CAT.D = FLYT.concat(NEWT.filter(t=>t.k in D3).map(t=>Object.assign({},t,{k:'d'+t.k.slice(1),def:D3[t.k]})))
    .concat(PERK('3').map(t=>Object.assign({},t,{def:D3[t.k]!==undefined?D3[t.k]:t.def})));
  /* Back: timing of chat-out, block release and intro-in (were built in: 450 ms, 0 ms, 45 % of the spring, 450 ms) */
  [['B','1'],['C','2'],['D','3']].forEach(([v,s])=>CAT[v].push(
    T('chatOutBack'+s,'Chat fades out',0,1500,10,450,' ms','How long the chat takes to fade out','The chat messages fade out over this time when “+” is tapped.','Quick cut.','Slow fade.','The chat during Back.'),
    T('blocksAtBack'+s,'Blocks start after',0,1500,10,0,' ms','Delay before the blocks rise','The blocks start rising this long after the tap.','Right away.','Late.','The blocks during Back.'),
    T('introAtBack'+s,'Intro fades in from',0,200,1,45,' %','When the intro text comes back','Share of the block spring time after which the headline and illustration fade back in.','Early.','Late.','The intro during Back.'),
    T('introInBack'+s,'Intro fade length',0,1500,10,450,' ms','How long the intro takes to fade in','The headline and illustration fade in over this time.','Quick.','Slow.','The intro during Back.')));
  const ALL = {}; [...CAT.B,...CAT.C,...CAT.D].forEach(t=>ALL[t.k]=t);
'''
defs = A(149,150) + '''
  DEF.flyYSpring = {visualDuration:.55,bounce:.12}; DEF.flyXSpring = {visualDuration:.62,bounce:.06}; DEF.backSpring3 = {visualDuration:.8,bounce:.2}; DEF.enterSpring3 = {visualDuration:.25,bounce:.25};
  let cview = null;
  function setValues(obj){ V = obj; cview = new Proxy(V,{get:(o,k)=>(typeof k==='string'&&/^b[A-Z]/.test(k))?o['c'+k.slice(1)]:o[k]}); }
  setValues(Object.assign({},DEF));
  function springEase(c){            // Motion spring sampled by elapsed ms (0 → 1)
    const o = Object.assign({},c); delete o.type; delete o.mode;
    const g = ctx.spring(Object.assign({keyframes:[0,1]},o));
    return ms => ms<=0 ? 0 : g.next(ms).value;
  }
  const springMs = c => (c.visualDuration||.8)*1000;
'''
blocks = A(216,232)
bld = A(302,526)
bld = rep(bld, A(321,325), "  const lblOff = i => 43 - W/2;   // label left edge, measured in the prototype: 43 px inside the block (same for every block)")
bld = rep(bld, "    if(vr!=='C') return buildV1(vr,i,seed);", "    if(vr==='D') return build3(vr,i,seed);\n    if(vr==='E') return build4(vr,i,seed);\n    if(vr!=='C') return buildV1(vr,i,seed);")
bld = rep(bld, "function buildIn(kd,seed,from){", "function buildIn(kd,seed,from,variant){")
bld = rep(bld, "(kd==='enter' && variant==='C')", "(kd==='enter' && variant!=='B')")
bld = rep(bld, "from.model.variant==='C'", "from.model.variant!=='B'")
bld = rep(bld, "V[kd+'Spring'+(vr==='C'?2:1)]", "V[kd+'Spring'+SUF[vr]]")
bld = rep(bld, "  const ks = {B:{},C:{}};", "")
bld = rep(bld, "  let kind = 'enter';\n", "")
bld = rep(bld, "function buildIdle(seed){", "function buildIdle(seed,variant){")
bld = rep(bld, "buildIdle(e.seed)", "buildIdle(e.seed,vr)")
bld = rep(bld, "function modelFor(vr,kd){", "function modelFor(vr,kd,ks){")
bld = rep(bld, "buildIn('enter',e.seed,null)", "buildIn('enter',e.seed,null,vr)")
bld = rep(bld, "buildIn('back',e.seed,{model:om,t:Math.min(e.fromT,om.dur)})", "buildIn('back',e.seed,{model:om,t:Math.min(e.fromT,om.dur)},vr)")
# Back: the built-in times become dials (defaults = the old built-in values, so the motion is unchanged)
bld = rep(bld, "      return {d,dly,sx,sy,sr,ss,so};", "      return {d,dly:dly+(kd==='back'?(P('blocksAtBack',vr)||0):0),sx,sy,sr,ss,so};")
bld = rep(bld, ": D*.45, stu0 =", ": D*((P('introAtBack',vr)??45)/100), stu0 =")
bld = rep(bld, "introAt+450+50,", "introAt+(kd==='back'?(P('introInBack',vr)??450):450)+50,")
bld = rep(bld, "clamp((t-introAt)/450,0,1), shake", "clamp((t-introAt)/(kd==='back'?(P('introInBack',vr)??450):450),0,1), shake")
bld = rep(bld, "stu: stu0*(1-clamp(t/450,0,1)), tut: tut0*(1-clamp(t/450,0,1))", "stu: stu0*(1-clamp(t/(kd==='back'?(P('chatOutBack',vr)??450):450),0,1)), tut: tut0*(1-clamp(t/(kd==='back'?(P('chatOutBack',vr)??450):450),0,1))")

# V3 Focus / Back out / Send (engine_tail.js): press + total-duration maps, model dispatch, Back may start from Send
bld = rep(bld, "P('tap'+({open:'Open',back:'Back',enter:'Enter'}[kd]),vr)", "P('tap'+({open:'Open',back:'Back',enter:'Enter',focus:'Focus',blur:'Back',send:'Send'}[kd]),vr)")
bld = rep(bld, "P({open:'durOpen',back:'durBack',enter:'durEnter'}[kd],vr)", "P({open:'durOpen',back:'durBack',enter:'durEnter',focus:'durFocus',blur:'durBack',send:'durSend'}[kd],vr)")
bld = rep(bld, "    if(kd==='idle') return buildIdle(e.seed,vr);", """    if(kd==='idle') return buildIdle(e.seed,vr);
    if(kd==='focus' || kd==='blur' || kd==='send'){ if(vr!=='D' && vr!=='E') return null;
      if(kd==='focus') return withTap(timeScale(vr==='E' ? buildFocus4(vr,e.seed) : buildFocus(vr,e.seed),'focus',vr),FIELD.fieldPt,-1,vr,'focus');
      if(kd==='blur' && vr==='E') return withTap(timeScale(buildBlur4(vr,e.seed),'blur',vr),[200,300],-1,vr,'blur');
      if(kd==='send') return withTap(timeScale(buildSend(vr,e.seed,e.text),'send',vr),[FIELD.sendPt[0],FIELD.sendPt[1]+KB.inputDy],-1,vr,'send');
      const f = ks[vr].focus || {seed:1}, fm = buildFocus(vr,f.seed);
      const bm = buildIn('back',e.seed,{model:fm,t:Math.min(e.fromT,fm.dur)},vr); bm.kind = 'blur';   // Back out IS Back, started from the Focus state
      return withTap(timeScale(bm,'blur',vr),[200,300],-1,vr,'blur'); }""")
bld = rep(bld, "    if(kd==='back'){ const o = ks[vr].open; if(!o) return null; const om = build(vr,o.i,o.seed);", "    if(kd==='back'){ const o = ks[vr].open, sd = ks[vr].send; if(e.from==='send' && sd && (vr==='D'||vr==='E')){ const sm = buildSend(vr,sd.seed,sd.text); return withTap(timeScale(buildIn('back',e.seed,{model:sm,t:Math.min(e.fromT,sm.dur)},vr),'back',vr),PLUS_PT,-1,vr,'back'); } if(!o) return null; const om = build(vr,o.i,o.seed);")
bld = rep(bld, "    m.at = t=>({\n      blocks: items.map(it=>{", "    const kb0 = st0 && st0.kb ? st0.kb : 0;\n    m.at = t=>({ kb: kb0 ? kb0*(1-kbEase(t)) : undefined,\n      blocks: items.map(it=>{")

import re
left = re.findall(r'.{30}\bvariant\b.{20}', bld)
print('variant refs:', left)
chatsrc = A(272,289)
refp = A(654,663) + '\n    const v = codeValues();\n' + A(674,690)
tail = open('source/engine_tail.js').read().replace('__REFPARAMS__', refp).replace('__CHAT__', chatsrc)
out = head + cat + d3 + defs + '\n' + blocks + '\n' + bld + '\n' + tail
open('out/motion-engine.js','w').write(out)
print(len(out))
