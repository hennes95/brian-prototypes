/* motion:engine — AI Tutor · use-case blocks
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
  /* ================= TWEAK CATALOGUE ================= */
  const T = (k,label,min,max,step,def,unit,short,what,low,high,look)=>({k,label,min,max,step,def,unit,short,what,low,high,look,hint:what+' Look at: '+look});
  const TEMPL = [
    T('wind','Zoom wind-up (heavy start)',0,100,1,0,' %','Selected block starts slowly, then speeds up',
      'Makes the selected block lazily get going and then accelerate, like something heavy. In A it also delays the neighbours’ take-off.',
      '0 % = starts instantly.','High = noticeable lag before it takes off.','The first ~200 ms after you release the block.'),
    T('shake','Screen thud',0,24,1,0,' px','Short shake of the screen at the explosion',
      'Shakes the whole phone for a split second when the block explodes. Adds impact and weight.',
      '0 = no shake.','High = hard thud.','The instant you release the block.'),
    T('wiggle','Hover wiggle',0,100,1,40,' %','Wiggle when the mouse enters a block',
      'Strength of the one-time random wiggle when the mouse enters a block.',
      '0 = off.','High = big jolt.','Move the mouse onto a block without pressing.'),
    T('inLead','Enter: text first, blocks after',0,1200,10,320,' ms','Head start of text + illustration on tab entry',
      'Tab entry: the headline and illustration fade in first, the blocks start flying this long afterwards.',
      '0 = everything together.','Blocks arrive late, text has time to be read.','The first 600 ms after opening a tab.'),
    T('loading','Loading state length',0,8000,100,2600,' ms','How long Brian’s dots show',
      'How long the “Brian is working” dots show before the placeholder reply appears.',
      'Short wait before the reply.','Long wait. 0 = dots stay forever.','The chat area after the blocks are gone.'),
    T('tapOpen','Tap: press duration',100,800,10,240,' ms','How long the finger is down before the animation plays',
      'Every animation starts with the user action: finger down (touch dot, pressed block), release, then the animation plays.',
      'Quick tap.','Long press.','The first ~300 ms of Open, Back and Enter.'),
    T('tapBack','Tap: press duration',100,800,10,240,' ms','How long the finger is down before the animation plays',
      'Every animation starts with the user action: finger down (touch dot, pressed block), release, then the animation plays.',
      'Quick tap.','Long press.','The first ~300 ms of Open, Back and Enter.'),
    T('tapEnter','Tap: press duration',100,800,10,240,' ms','How long the finger is down before the animation plays',
      'Every animation starts with the user action: finger down (touch dot, pressed block), release, then the animation plays.',
      'Quick tap.','Long press.','The first ~300 ms of Open, Back and Enter.'),
    T('staggerBack','Return / enter stagger',0,300,5,70,' ms','Delay between blocks',
      'Delay between one block and the next one starting to fly.',
      '0 = all at once.','One after another.','The order in which the blocks land.'),
    T('staggerEnter','Return / enter stagger',0,300,5,70,' ms','Delay between blocks',
      'Delay between one block and the next one starting to fly.',
      '0 = all at once.','One after another.','The order in which the blocks land.'),
    T('randBack','Enter randomness',0,100,1,100,' %','How wild the start positions are on tab entry',
      'Tab entry: the upper blocks fly in from a random spot above, the lower ones from below, the middle one just appears. This sets the distance, sideways offset and rotation of those start spots. “+” is not affected: it starts from where the blocks currently are.',
      '0 % = straight from above / below, no rotation.','Far away, wide sideways and strongly rotated.','The first 300 ms after opening a tab.'),
    T('randEnter','Enter randomness',0,100,1,100,' %','How wild the start positions are on tab entry',
      'Tab entry: the upper blocks fly in from a random spot above, the lower ones from below, the middle one just appears. This sets the distance, sideways offset and rotation of those start spots. “+” is not affected: it starts from where the blocks currently are.',
      '0 % = straight from above / below, no rotation.','Far away, wide sideways and strongly rotated.','The first 300 ms after opening a tab.'),
    T('durOpen','Open: total duration',0,3000,10,0,' ms','Stretch or squeeze the whole Open animation',
      'Total length of the motion after the tap. The whole animation is time-scaled to this length (all parts keep their proportions).',
      '0 = natural length from the other tweaks.','Slow motion.','The whole Open animation.'),
    T('durBack','Back: total duration',0,3000,10,0,' ms','Stretch or squeeze the whole Back animation',
      'Total length of the motion after the tap. The whole animation is time-scaled to this length.',
      '0 = natural length from the other tweaks.','Slow motion.','The whole Back animation.'),
    T('durEnter','Enter: total duration',0,3000,10,0,' ms','Stretch or squeeze the whole Enter animation',
      'Total length of the motion. The whole animation is time-scaled to this length.',
      '0 = natural length from the other tweaks.','Slow motion.','The whole Enter animation.'),
    T('textEnter','Enter: text appears after',0,1500,10,560,' ms','When the headline + illustration come in, after the blocks start',
      'Blocks fly in first, the headline and illustration appear after this delay, so the page assembles with the text last.',
      '0 = text right away.','Text comes in when the blocks have nearly landed.','The first second after opening a tab.')
  ];
  const PERK = v => TEMPL.filter(t=> v==='1' ? t.k!=='textEnter' : (t.k!=='wind' && t.k!=='inLead')).map(t=>Object.assign({},t,{k:t.k+v}));
  const CAT = {
    B:[
      T('bKick','Push velocity',0,3000,10,700,' px/s','Launch speed of the neighbours',
        'Speed the neighbours are kicked away with, on top of being pushed by the growing block.',
        'They are only pushed by contact.','They shoot away on their own.','The neighbours during the first 400 ms.'),
      T('bKickRand','Push randomness',0,100,1,40,' %','Per-block variation of launch speed',
        'How much the launch speed differs from block to block.',
        '0 % = all neighbours equally fast.','Some leave early, others linger.','Whether neighbours leave at different times.'),
      T('bInertia','Inertia (lazy take-off)',0,800,10,0,' ms','Neighbours accelerate slowly (heavy feel)',
        'Time the neighbours need to reach their push and spin speed. Like mass: heavy things take time to get going.',
        '0 = instant take-off.','Sluggish — they pick up speed slowly and lumber away.','How each neighbour starts moving once kicked.'),
      T('bSpin','Spin velocity',0,900,5,160,' °/s','How fast neighbours rotate',
        'Rotation speed of the pushed blocks.',
        '0 = no rotation.','Windmill.','The rotation of the neighbours after the kick.'),
      T('bSpinRand','Spin randomness',0,100,1,50,' %','Per-block variation of spin speed',
        'How much the spin speed differs from block to block.',
        '0 % = all spin equally fast.','Some barely turn, some whirl.','Compare the spin of neighbours above and below.'),
      T('bSpinBias','Spin direction',-100,100,1,0,'','Clockwise or counter-clockwise',
        'Chance for a block to turn clockwise vs. counter-clockwise.',
        '−100 = all turn counter-clockwise.','+100 = all turn clockwise. 0 = coin flip per block.','Which way the neighbours turn.'),
      T('bTransfer','Contact momentum',0,200,1,100,' %','How much speed a touched block takes along',
        'When the growing block touches a neighbour: how much of the edge’s speed the neighbour keeps flying with.',
        'Neighbour is pushed but loses speed when the edge slows — feels stuck.','100 % = natural carry-over, 200 % = extra pop.','The moment each neighbour is touched by the growing block.'),
      T('bDrag','Air drag',0,6,.1,.8,' /s','Air resistance on flying blocks',
        'Slows blocks down while they fly.',
        'They keep flying at constant speed.','They slow down and hang in the air — floaty, heavy.','The second half of the flight.'),
      T('bDrift','Sideways drift',0,600,5,80,' px/s','Sideways wandering',
        'Random left/right speed on top of the vertical push.',
        '0 = straight up / down.','Blocks wander sideways.','The horizontal movement of the neighbours.'),
      T('bGap','Clearance',0,40,1,8,' px','Air between growing block and neighbours',
        'Distance kept between the growing block’s edge and the pushed blocks.',
        '0 = touching.','Visible gap.','The edge of the growing block next to a neighbour.'),
      T('bOffset','Kick ↔ zoom offset',-400,800,10,0,' ms','Kick vs. zoom timing',
        'Time gap between the neighbours being kicked and the zoom starting. (Contact pushing always works.)',
        'Negative: neighbours get kicked before the zoom starts.','Positive: zoom starts first, kick comes later.','The first ~300 ms after release.'),
      T('bZoom','Zoom duration',300,1600,10,800,' ms','How long the block takes to explode',
        'Duration of the selected block’s growth. The chat also appears later when this is longer.',
        'Snappy.','Slow, heavy expansion.','How fast the selected block grows and when the chat shows up.'),
      T('bFade','Neighbour fade-out start',0,2000,10,700,' ms','When neighbours start to fade',
        'When the pushed blocks begin to fade away.',
        'They vanish early, maybe while still on screen.','They stay visible longer.','Neighbours near the end of the animation.'),
      ...PERK('1')
    ]
  };
  const NEWT = [
      T('bMove','Morph length (fade timing)',250,1400,10,620,' ms','Time base for fade / text timing',
        'The tapped block turns dark and glides up to where the student message sits.',
        'Snappy.','Slow, floaty.','The tapped block right after the tap.'),
      T('bMorphAt','Morph: fade / text start',10,95,1,55,' %','When the block fades out and the text rises in',
        'Share of the move after which the block fades out while the message text rises in from below, as if the block turned into the text.',
        'Cross-fade starts early, far from the text.','Block arrives at the text first, then swaps.','The last part of the block’s move.'),
      T('bRise','Text rise distance',0,120,1,36,' px','How far below the text starts',
        'The message text starts this far below its final place and rises into it.',
        '0 = only fades.','Long rise from the bottom.','The message text while it appears.'),
      T('bFlySpin','Block tilt in flight',0,60,1,22,' °','How much the tapped block tilts while flying to the message',
        'The tapped block twists out of its rotation mid-flight and straightens as it lands in the message.',
        '0 = flies flat.','Dramatic twist.','The tapped block while it flies up.'),
      T('bArc','Block swing to the left',0,160,1,46,' px','How far the block swings out to the left on its way',
        'The block takes a curved path and swings out to the left before landing at the message.',
        '0 = straight line.','Wide arc.','The tapped block while it flies up.'),
      T('bWobble','Release wobble',0,30,1,8,' °','Little shake of a block when it lets go',
        'Falling blocks twitch for a moment when they come loose, before gravity takes over.',
        '0 = clean drop.','Rattling.','The first 300 ms of each falling block.'),
      T('bGravity','Gravity',400,7000,50,2200,' px/s²','How fast the other blocks fall',
        'Acceleration of the falling blocks.',
        'Floaty fall.','Heavy drop.','The other blocks right after the tap.'),
      T('bKick','Initial push',-400,900,10,-120,' px/s','Start speed downwards',
        'Initial vertical speed of the falling blocks (negative = a small hop up first, like they get released).',
        'They just let go.','They get shoved down.','The first 150 ms of the fall.'),
      T('bSpin','Spin',0,700,5,180,' °/s','How fast the blocks rotate while falling',
        'Rotation speed of the falling blocks.','No tumbling.','Wild tumbling.','The falling blocks.'),
      T('bSpinRand','Spin randomness',0,100,1,60,' %','Per-block variation of spin',
        'Each block gets its own spin speed and direction variation.','All alike.','Very different.','The falling blocks.'),
      T('bDrift','Sideways drift',0,500,5,130,' px/s','Random sideways speed',
        'Each block drifts left or right by a random amount, so they land in random places.','Straight down.','Scattered.','The falling blocks.'),
      T('bStart','Release stagger (random)',0,400,5,90,' ms','Random delay before each block lets go',
        'Each block starts falling after a random delay up to this value.','All together.','Uneven, like they come loose one by one.','The first 400 ms.'),
  ];
  const CDEF = {bStart:0};
  CAT.C = [T('cRipple','Ripple delay per block',0,400,5,110,' ms','Delay before each block lets go (nearest to the tapped block first)',
      'The push travels through the tower: the neighbours next to the selected block get kicked first, the farther ones follow after this delay per step.',
      '0 = everyone is kicked at once.','Slow domino effect.','The order in which the blocks leave.')]
    .concat(NEWT.concat(PERK('2')).map(t=>/^b[A-Z]/.test(t.k)?Object.assign({},t,{k:'c'+t.k.slice(1),def:CDEF[t.k]!==undefined?CDEF[t.k]:t.def}):t));
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
  const DEF = {}; Object.values(ALL).forEach(t=>DEF[t.k]=t.def);
  DEF.moveSpring = {visualDuration:.62,bounce:.14}; DEF.backSpring1 = {visualDuration:.55,bounce:0}; DEF.enterSpring1 = {visualDuration:.55,bounce:0}; DEF.backSpring2 = {visualDuration:.8,bounce:.2}; DEF.enterSpring2 = {visualDuration:.8,bounce:.2};
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

  /* ================= BLOCKS ================= */
  const I = {
    plan:"<svg width=\"17\" height=\"17\" viewBox=\"0 0 17 17\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g clip-path=\"url(#clip0_12269_6301)\"><g clip-path=\"url(#clip1_12269_6301)\"><path d=\"M5.21 3.27L5.15 1.49\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M10.98 3.07L10.92 1.29\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M12.32 3.02L3.88 3.31C2.9 3.35 2.13 4.17 2.16 5.15L2.43 12.7C2.46 13.68 3.28 14.45 4.26 14.42L12.7 14.12C13.68 14.09 14.45 13.27 14.42 12.28L14.15 4.73C14.12 3.75 13.3 2.98 12.32 3.02Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M2.21 6.48L14.2 6.07\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M8.27 8.05C7.78 8.07 7.39 8.48 7.41 8.97C7.43 9.46 7.84 9.85 8.33 9.83C8.82 9.81 9.2 9.4 9.19 8.91C9.17 8.42 8.76 8.04 8.27 8.05Z\" fill=\"#3A3A3A\"/><path d=\"M11.44 9.72C11.93 9.7 12.31 9.29 12.29 8.8C12.28 8.31 11.87 7.93 11.38 7.94C10.89 7.96 10.5 8.37 10.52 8.86C10.54 9.35 10.95 9.74 11.44 9.72Z\" fill=\"#3A3A3A\"/><path d=\"M8.36 10.72C7.87 10.73 7.49 11.15 7.5 11.64C7.52 12.13 7.93 12.51 8.42 12.49C8.91 12.48 9.3 12.06 9.28 11.57C9.26 11.09 8.85 10.7 8.36 10.72Z\" fill=\"#3A3A3A\"/><path d=\"M5.25 10.83C4.76 10.84 4.38 11.26 4.39 11.75C4.41 12.23 4.82 12.62 5.31 12.6C5.8 12.59 6.19 12.17 6.17 11.68C6.15 11.19 5.74 10.81 5.25 10.83Z\" fill=\"#3A3A3A\"/><path d=\"M11.47 10.61C10.98 10.63 10.59 11.04 10.61 11.53C10.63 12.02 11.04 12.4 11.53 12.39C12.02 12.37 12.41 11.96 12.39 11.47C12.37 10.98 11.96 10.59 11.47 10.61Z\" fill=\"#3A3A3A\"/></g></g><defs><clipPath id=\"clip0_12269_6301\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0 0.56) rotate(-2)\"/></clipPath><clipPath id=\"clip1_12269_6301\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0 0.56) rotate(-2)\"/></clipPath></defs></svg>",
    dumbbell:"<svg width=\"17\" height=\"17\" viewBox=\"0 0 17 17\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g clip-path=\"url(#clip0_12319_65743)\"><path d=\"M13.38 8.45L14.94 8.51M5.83 8.19L10.72 8.36M1.61 8.04L3.17 8.1\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M4.68 3.03C3.94 3.01 3.32 3.58 3.3 4.32L3.03 11.87C3.01 12.61 3.58 13.22 4.32 13.25C5.06 13.28 5.67 12.7 5.7 11.96L5.96 4.41C5.99 3.68 5.41 3.06 4.68 3.03Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M12.23 3.3C11.49 3.27 10.87 3.85 10.85 4.58L10.59 12.14C10.56 12.87 11.14 13.49 11.87 13.51C12.61 13.54 13.22 12.96 13.25 12.23L13.51 4.68C13.54 3.94 12.96 3.32 12.23 3.3Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g><defs><clipPath id=\"clip0_12319_65743\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0.56) rotate(2)\"/></clipPath></defs></svg>",
    chart:"<svg width=\"17\" height=\"17\" viewBox=\"0 0 17 17\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g clip-path=\"url(#clip0_12319_65756)\"><path d=\"M3.14 8.76L6.25 8.87L6.1 13.31L2.99 13.2C2.5 13.19 2.11 12.77 2.13 12.28L2.22 9.62C2.24 9.13 2.65 8.75 3.14 8.76Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M10.36 5.9L13.47 6.01C13.96 6.03 14.34 6.44 14.32 6.93L14.12 12.7C14.11 13.19 13.69 13.58 13.2 13.56L10.09 13.45L10.36 5.9Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M7.36 2.68L9.58 2.76C10.07 2.78 10.45 3.19 10.44 3.68L10.1 13.45L6.1 13.31L6.44 3.54C6.46 3.05 6.87 2.67 7.36 2.68Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g><defs><clipPath id=\"clip0_12319_65756\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0.56) rotate(2)\"/></clipPath></defs></svg>",
    help:"<svg width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g clip-path=\"url(#clip0_12269_6340)\"><path d=\"M9.47 15.2C13.01 14.83 15.57 11.66 15.2 8.12C14.83 4.58 11.66 2.01 8.12 2.38C4.58 2.76 2.01 5.93 2.38 9.47C2.76 13.01 5.93 15.57 9.47 15.2Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M6.99 7.42C6.9 6.53 7.54 5.8 8.47 5.7C9.4 5.6 10.17 6.15 10.26 6.99C10.4 8.36 8.76 8.53 8.91 9.94\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M9.09 11.67C9.27 11.65 9.42 11.77 9.44 11.94C9.45 12.11 9.33 12.27 9.16 12.28C8.99 12.3 8.84 12.18 8.82 12.01C8.8 11.84 8.92 11.68 9.09 11.67Z\" fill=\"#3A3A3A\" stroke=\"#3A3A3A\" stroke-width=\"0.89\"/></g><defs><clipPath id=\"clip0_12269_6340\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0 1.67) rotate(-6)\"/></clipPath></defs></svg>",
    file:"<svg width=\"17\" height=\"17\" viewBox=\"0 0 17 17\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g clip-path=\"url(#clip0_12269_6353)\"><path d=\"M5.32 6.38L7.09 6.31\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M5.41 9.04L11.18 8.84\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M5.5 11.71L11.28 11.5\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M2.88 13.13L2.56 3.8C2.52 2.83 3.29 2 4.27 1.97L9.24 1.79C9.48 1.78 9.7 1.87 9.88 2.03L13.47 5.38C13.64 5.54 13.75 5.77 13.75 6L13.99 12.74C14.02 13.72 13.26 14.55 12.27 14.58L4.72 14.85C3.75 14.88 2.92 14.11 2.88 13.13Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M13.66 5.64L10.63 5.75C10.14 5.76 9.73 5.38 9.71 4.89L9.61 1.87\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g><defs><clipPath id=\"clip0_12269_6353\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0 0.56) rotate(-2)\"/></clipPath></defs></svg>"
  };
  const DEFS = [
    {label:'Create a study plan',        icon:'plan',    cx:200.7, cy:434.9, r:-2, ir:0 },
    {label:'Practice my hardest topics', icon:'dumbbell',cx:180.7, cy:490.4, r:0, ir:0 },
    {label:'Show my knowledge gaps',     icon:'chart',   cx:200.7, cy:546.4, r:2, ir:0 },
    {label:'Explain a topic',            icon:'help',    cx:219.7, cy:601.9, r:-4, ir:0 },
    {label:'Create a mock exam',         icon:'file',    cx:200.7, cy:658.0, r:-2, ir:0 }
  ];
  const W = 231.5, H = 50;
  const hh = deg => { const r=Math.abs(deg)*Math.PI/180; return W/2*Math.sin(r)+H/2*Math.cos(r); }; // half-height of the rotated block
  /* ---- helpers shared by A and B ---- */
  function bez(x1,y1,x2,y2){
    return x=>{
      if(x<=0) return 0; if(x>=1) return 1;
      let lo=0,hi=1,t=x;
      for(let k=0;k<22;k++){ t=(lo+hi)/2; const cx=3*(1-t)*(1-t)*t*x1+3*(1-t)*t*t*x2+t*t*t; if(cx<x) lo=t; else hi=t; }
      return 3*(1-t)*(1-t)*t*y1+3*(1-t)*t*t*y2+t*t*t;
    };
  }
  const zoomEase = ()=>bez(.4+.45*P('wind','B')/100,0,.2,1);

  /* ================= TIMELINE MODEL =================
     Every animation is a pure function of (variant, clicked block, seed, tweak values) → state at time t.
     Playing = advancing t, scrubbing = setting t, exporting = sampling t. */
  function rng(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
  const hash = n => { const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); };
  const bezOpa = bez(.25,.1,.25,1), bezMsg = bez(.2,.8,.2,1);
  const S_END = 6.4;                       // final scale of the selected block

  const lblOff = i => 43 - W/2;   // label left edge, measured in the prototype: 43 px inside the block (same for every block)
  function buildV1(vr,i,seed){
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a);
    const td = DEFS[i], S = S_END, ease = zoomEase();
    const others = DEFS.map((d,j)=>j).filter(j=>j!==i);
    const m = {variant:vr,i,seed,kind:'open',tapped:i};
    let zoomAt, Tz, msgAt, motionEnd, core;

    {
      const VB = vr==='C' ? cview : V;
      Tz = VB.bZoom; const zA = Math.max(0,-VB.bOffset), kickAt = zA+VB.bOffset; zoomAt = zA;
      const ht0 = hh(td.r), pCW = (VB.bSpinBias+100)/200, tau = VB.bInertia/1000;
      const step = 1/120, stepMs = step*1000;
      motionEnd = Math.max(zoomAt+Tz, VB.bFade+500) + 200 + (vr==='C'?4*V.cRipple:0);
      msgAt = zoomAt+Tz*.55;
      const ns = others.map(j=>{
        const d = DEFS[j];
        const kr=RR(-1,1), sd=rnd(), sr=RR(-1,1), dr=RR(-1,1);        // fixed draw order
        return {j,d,rd:(vr==='C'?V.cRipple:0)*Math.abs(j-i),dir:(d.cy<td.cy?-1:1),kr,sd,sr,dr,off:0,v:0,vT:0,ang:0,w:0,wT:0,x:0,vx:0,kicked:false,hh0:hh(d.r),prevNeed:0};
      });
      const N = Math.ceil(motionEnd/stepMs)+2;
      ns.forEach(n=>n.buf=new Float32Array(N*3));
      for(let k=0;k<N;k++){
        if(k===0){ ns.forEach(n=>{ n.buf[0]=n.d.cx; n.buf[1]=n.d.cy; n.buf[2]=n.d.r; }); continue; }   // t=0 is the exact rest pose
        const t=k*stepMs, p=clamp((t-zoomAt)/Tz,0,1), e=ease(p), s=1+(S-1)*e, rot=td.r*(1-e);
        const htGrow = s*hh(rot)-ht0, gapNow = VB.bGap*clamp((s-1)/(S-1),0,1);
        ns.forEach(n=>{
          if(!n.kicked && t>=kickAt+n.rd){
            n.kicked=true;
            n.vT = VB.bKick*(1+n.kr*VB.bKickRand/100);
            n.wT = (n.sd<pCW?1:-1)*VB.bSpin*(1+n.sr*VB.bSpinRand/100);
            n.vx = n.dr*VB.bDrift;
          }
          if(n.kicked){
            const a = tau>0 ? 1-Math.exp(-step/tau) : 1, dg = Math.exp(-VB.bDrag*step);
            n.vT *= dg;
            if(n.v<n.vT) n.v += (n.vT-n.v)*a;
            n.v *= dg;
            n.w += (n.wT-n.w)*a;
            n.off += n.v*step; n.ang += n.w*step; n.x += n.vx*step;
          }
          const need = htGrow + (hh(n.d.r+n.ang)-n.hh0) + gapNow;          // the growing block is a wall
          if(n.off<need){ const edgeV=(need-n.prevNeed)/step; n.off=need; n.v=Math.max(n.v,edgeV*VB.bTransfer/100); }
          n.prevNeed = need;
          n.buf[k*3]=n.d.cx+n.x; n.buf[k*3+1]=n.d.cy+n.dir*n.off; n.buf[k*3+2]=n.d.r+n.ang;
        });
      }
      core = t=>{
        const p=clamp((t-zoomAt)/Tz,0,1), e=ease(p), bl=[];
        bl[i] = {cx:td.cx,cy:td.cy,r:td.r*(1-e),s:1+(S-1)*e,o:1-clamp((t-zoomAt-.4*Tz)/450,0,1)};
        const kf = clamp(t/stepMs,0,N-1.001), k0 = Math.floor(kf), f = kf-k0, o = 1-clamp((t-VB.bFade)/500,0,1);
        ns.forEach(n=>{
          const a=k0*3, b=a+3;
          bl[n.j] = {cx:n.buf[a]+(n.buf[b]-n.buf[a])*f, cy:n.buf[a+1]+(n.buf[b+1]-n.buf[a+1])*f, r:n.buf[a+2]+(n.buf[b+2]-n.buf[a+2])*f, s:1, o};
        });
        return bl;
      };
    }
    const stuAt = msgAt+20, tutAt = msgAt+770, doneAt = P('loading',vr)>0 ? tutAt+P('loading',vr) : Infinity;
    m.motionEnd = motionEnd;
    m.dur = Math.max(motionEnd, isFinite(doneAt) ? doneAt+500 : tutAt+1200);
    m.at = t=>{
      let sh=[0,0]; const tt=t-zoomAt;
      if(tt>=0 && P('shake',vr)>0){ const dec=Math.exp(-tt/140); if(dec>=.02){ const n=Math.floor(tt/16); sh=[(hash(n+seed)*2-1)*P('shake',vr)*dec,(hash(n*1.7+seed+9)*2-1)*P('shake',vr)*dec]; } }
      return {blocks:core(t), intro:1-clamp(t/450,0,1), shake:sh,
              stu:clamp((t-stuAt)/600,0,1), tut:clamp((t-tutAt)/600,0,1), done:t>=doneAt};
    };
    return m;
  }

  function build(vr,i,seed){
    if(vr==='D') return build3(vr,i,seed);
    if(vr!=='C') return buildV1(vr,i,seed);
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a);
    const VB = vr==='C' ? cview : V, td = DEFS[i];
    const m = {variant:vr,i,seed,kind:'open',tapped:i};
    const TX = 69 + W/2 - lblOff(i), TY = 164.8;                       // where the student text sits
    const Tm = VB.bMove, mSp = springEase(V.moveSpring), mD = springMs(V.moveSpring)*1.6, mAt = VB.bMorphAt/100;
    const ease = x => x>=1 ? 1 : mSp(x*mD), lift = x => 1+.07*Math.sin(Math.PI*clamp(x,0,1));
    const fadeD = Tm*(1-mAt), g = VB.bGravity, OFF = 990;
    const ns = DEFS.map((d,j)=>j).filter(j=>j!==i).map(j=>{
      const d = DEFS[j];
      const sd=rnd(), sr=RR(-1,1), dr=RR(-1,1), st=rnd();            // fixed draw order
      const dly = (vr==='C' ? V.cRipple*Math.abs(j-i) : 0) + st*VB.bStart;
      const vy = VB.bKick, vx = dr*VB.bDrift, sg = (sd<.5?1:-1), w = sg*VB.bSpin*(1+sr*VB.bSpinRand/100), ts = .22;
      const need = (OFF-d.cy), tau = (-vy+Math.sqrt(vy*vy+2*g*Math.max(need,0)))/g + .1;
      return {j,d,dly,vy,vx,w,sg,ts,end:dly+tau};
    });
    const fallEnd = Math.max(...ns.map(n=>n.end));
    const msgAt = Tm*mAt, stuAt = msgAt, tutAt = stuAt+850, doneAt = P('loading',vr)>0 ? tutAt+P('loading',vr) : Infinity;
    m.motionEnd = Math.max(mD, fallEnd)+100;
    m.dur = Math.max(m.motionEnd, isFinite(doneAt) ? doneAt+500 : tutAt+1200);
    m.at = t=>{
      const p = ease(clamp(t/mD,0,1)), bl = [];
      const pl = clamp(t/(mD),0,1);
      const pb = Math.sin(Math.PI*clamp(p,0,1));
      bl[i] = {cx:td.cx+(TX-td.cx)*p-VB.bArc*pb, cy:td.cy+(TY-td.cy)*p, r:td.r*(1-clamp(p,0,1))-VB.bFlySpin*clamp(p,0,1), s:lift(pl), o:1-clamp((t-msgAt)/fadeD,0,1)};
      ns.forEach(n=>{
        const u = Math.max(0,(t-n.dly)/1000);
        const q = n.ts*(1-Math.exp(-u/n.ts));        // eased: spin and drift build up instead of starting at full speed
        bl[n.j] = {cx:n.d.cx+n.vx*q*1.6, cy:n.d.cy+n.vy*u+.5*g*u*u, r:n.d.r+n.w*(u-q)+VB.bWobble*n.sg*Math.sin(u*18)*Math.exp(-u*7), s:1, o:1};
      });
      return {blocks:bl, intro:1-clamp(t/450,0,1), shake:[0,0], rise:VB.bRise,
              stu:clamp((t-stuAt)/(fadeD+250),0,1), tut:clamp((t-tutAt)/600,0,1), done:t>=doneAt};
    };
    return m;
  }

  /* ---- BACK ("+" click: blocks fly from where they are back into the tower) and ENTER (tab entry: random start positions) ---- */
  function buildIn(kd,seed,from,variant){
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a);
    const v2 = (kd==='back' && from && from.model.variant!=='B') || (kd==='enter' && variant!=='B');
    const r2 = rng((seed^0x9e3779b9)>>>0), R2 = (a,b)=>a+r2()*(b-a), ph = ((seed>>>0)%1000)/1000*Math.PI*2;
    const vr = kd==='back' ? from.model.variant : variant, Kd = kd==='back'?'Back':'Enter';
    const rr = P('rand'+Kd,vr)/100, spC = V[kd+'Spring'+SUF[vr]], spE = springEase(spC), D = springMs(spC)*1.6, ease = p => p>=1 ? 1 : spE(p*D);
    const st0 = from ? from.model.at(from.t) : null;
    const m = {kind:kd,seed,tapped:-1,i:from?from.model.i:0};
    const items = DEFS.map((d,j)=>{
      const mid = (DEFS.length-1)/2, side = j<mid?-1:(j>mid?1:0);
      const dly = (kd==='enter' ? (v2 ? 0 : Math.abs(j-mid)) : (v2 ? DEFS.length-1-j : j))*(v2?P('stagger'+Kd,vr)*1.3:P('stagger'+Kd,vr)) + (kd==='enter' ? (v2 ? R2(0,1)*P('stagger'+Kd,vr)*3 : RR(0,1)*rr*120) : 0) + (kd==='enter'&&!v2?P('inLead',vr):0);
      const dist = 420+RR(0,1)*300*rr, rot = RR(-1,1)*80*rr, xo = RR(-1,1);     // fixed draw order
      let sx,sy,sr,ss=1,so=0;
      if(kd==='enter' && v2){            // V2: blocks start close to their place, pushed outward (upper ones above, lower ones below), organically tilted
        const hx = (R2(0,1)<.5?-1:1)*(130+R2(0,1)*150), vy = side*(110+R2(0,1)*140) + (side===0?0:0), tl = (R2(0,1)<.5?-1:1)*(16+R2(0,1)*30)*rr;
        sx = d.cx+hx; sy = d.cy+vy; sr = d.r+tl; ss = 1; so = 0; }
      else if(kd==='back' && v2){ sx=d.cx+xo*170; sy=910+RR(0,1)*60+j*14; sr=d.r+rot*.6; ss=1; so=1; }   // V2: rise from just below the screen, random sideways / tilt
      else if(kd==='back'){
        const b = st0.blocks[j];
        if(j===from.model.i || b.s>1.2){ sx=d.cx; sy=d.cy; sr=d.r; ss=1; so=0; }   // the selected block just fades back in at its place
        else { sx=b.cx; sy=b.cy; sr=b.r; ss=b.s; so=b.o; }
      } else if(side===0){ sx=d.cx; sy=d.cy; sr=d.r; ss=.88; so=0; }          // middle block simply appears
      else { sx=d.cx+xo*300*rr; sy=d.cy+side*dist*.7; sr=d.r+rot; }           // upper blocks come from above, lower from below
      return {d,dly:dly+(kd==='back'?(P('blocksAtBack',vr)||0):0),sx,sy,sr,ss,so};
    });
    const introAt = kd==='enter' ? (v2 ? P('textEnter',vr) : 0) : D*((P('introAtBack',vr)??45)/100), stu0 = st0?st0.stu:0, tut0 = st0?st0.tut:0, done0 = st0?st0.done:false, in0 = st0?st0.intro:0;
    const motion = Math.max(...items.map(it=>it.dly+D));
    m.motionEnd = motion+100; m.dur = Math.max(motion+100, introAt+(kd==='back'?(P('introInBack',vr)??450):450)+50, kd==='back'?500:0);
    const kb0 = st0 && st0.kb ? st0.kb : 0;
    m.at = t=>({ kb: kb0 ? kb0*(1-kbEase(t)) : undefined,
      blocks: items.map(it=>{
        const pe = ease((t-it.dly)/D);
        return {cx:it.sx+(it.d.cx-it.sx)*pe, cy:it.sy+(it.d.cy-it.sy)*pe, r:it.sr+(it.d.r-it.sr)*pe, s:it.ss+(1-it.ss)*pe,
                o:it.so+(1-it.so)*bezOpa((t-it.dly)/350)};
      }),
      intro: in0+(1-in0)*clamp((t-introAt)/(kd==='back'?(P('introInBack',vr)??450):450),0,1), shake:[0,0],
      stu: stu0*(1-clamp(t/(kd==='back'?(P('chatOutBack',vr)??450):450),0,1)), tut: tut0*(1-clamp(t/(kd==='back'?(P('chatOutBack',vr)??450):450),0,1)), done: done0
    });
    return m;
  }

  /* ---- timeline state + player ---- */
                  // per variant: last {open:{i,seed}, back:{seed,fromT}, enter:{seed}}
  /* ---- user action first: finger down -> release -> then the animation plays ---- */
  const PLUS_PT = [367,92], TAB_PT = [202,829], PRESS_AT = 60;
  function withTap(m,pt,block,vr,kd){
    const L = P('tap'+({open:'Open',back:'Back',enter:'Enter',focus:'Focus',blur:'Back',send:'Send'}[kd]),vr), base = m.at;
    m.tapLead = L; m.dur += L; m.motionEnd += L; m.tapPt = pt; m.tapBlock = block;
    m.at = t=>{
      const st = base(Math.max(0,t-L)), age = t-L;
      st.touch = t<L ? {x:pt[0],y:pt[1],s:.7+.3*clamp((t-PRESS_AT+60)/90,0,1),o:clamp(t/PRESS_AT,0,1),cur:0}
                     : {x:pt[0],y:pt[1],s:1+.25*clamp(age/220,0,1),o:1-clamp(age/220,0,1),cur:0};
      st.pressed = block>=0 && t>=PRESS_AT;
      return st;
    };
    return m;
  }
  /* ---- IDLE: cursor sweeps over the tower, each block wiggles once on hover ---- */
  function buildIdle(seed,variant){
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a), a = P('wiggle',variant)/100;
    const m = {kind:'idle',seed,tapped:-1,i:0};
    const GAP = 520, T0 = 260, ez = bez(.4,0,.2,1), spE = springEase({visualDuration:.5,bounce:.4}), spD = 800;
    const items = DEFS.map((d,j)=>({d,e:T0+j*GAP-70,at:T0+j*GAP,hx:RR(-1,1)*5*a,hy:RR(-1,1)*4*a,hr:RR(-1,1)*5*a}));
    const path = [{t:0,x:330,y:330}].concat(items.map(it=>({t:it.at,x:it.d.cx+30,y:it.d.cy})),[{t:T0+DEFS.length*GAP+200,x:340,y:780}]);
    m.motionEnd = path[path.length-1].t; m.dur = m.motionEnd+300;
    m.at = t=>{
      let k = 0; while(k<path.length-2 && t>=path[k+1].t) k++;
      const A = path[k], B = path[k+1], f = ez(clamp((t-A.t)/(B.t-A.t),0,1));
      let hov = -1;
      const blocks = items.map((it,j)=>{
        const dt = t-it.e;
        let w = 0;
        if(dt>=0 && dt<110) w = ez(clamp(dt/70,0,1)); else if(dt>=110) w = (dt-110)>=spD ? 0 : 1-spE(dt-110);
        const nxt = j<items.length-1 ? items[j+1].e : Infinity;
        if(t>=it.e && t<nxt && t<path[path.length-1].t-250) hov = j;
        return {cx:it.d.cx+it.hx*w, cy:it.d.cy+it.hy*w, r:it.d.r+it.hr*w, s:1, o:1};
      });
      return {blocks,intro:1,shake:[0,0],stu:0,tut:0,done:false,hover:hov,
              touch:{x:A.x+(B.x-A.x)*f,y:A.y+(B.y-A.y)*f,s:1,o:1,cur:1}};
    };
    return m;
  }
  function timeScale(m,kd,vr){            // total-duration slider: time-scale the whole motion to a target length (0 = natural)
    const D = P({open:'durOpen',back:'durBack',enter:'durEnter',focus:'durFocus',blur:'durBack',send:'durSend'}[kd],vr); if(!D || !m || !(m.motionEnd>0)) return m;
    const f = D/m.motionEnd, base = m.at;
    m.at = t=>base(t/f); m.dur *= f; m.motionEnd = D; return m;
  }
  function modelFor(vr,kd,ks){
    const e = ks[vr][kd]; if(!e) return null;
    if(kd==='idle') return buildIdle(e.seed,vr);
    if(kd==='focus' || kd==='blur' || kd==='send'){ if(vr!=='D') return null;
      if(kd==='focus') return withTap(timeScale(buildFocus(vr,e.seed),'focus',vr),FIELD.fieldPt,-1,vr,'focus');
      if(kd==='send') return withTap(timeScale(buildSend(vr,e.seed,e.text),'send',vr),[FIELD.sendPt[0],FIELD.sendPt[1]+KB.inputDy],-1,vr,'send');
      const f = ks[vr].focus || {seed:1}, fm = buildFocus(vr,f.seed);
      const bm = buildIn('back',e.seed,{model:fm,t:Math.min(e.fromT,fm.dur)},vr); bm.kind = 'blur';   // Back out IS Back, started from the Focus state
      return withTap(timeScale(bm,'blur',vr),[200,300],-1,vr,'blur'); }
    if(kd==='open') return withTap(timeScale(build(vr,e.i,e.seed),'open',vr),[DEFS[e.i].cx,DEFS[e.i].cy],e.i,vr,'open');
    if(kd==='back'){ const o = ks[vr].open, sd = ks[vr].send; if(e.from==='send' && sd && vr==='D'){ const sm = buildSend(vr,sd.seed,sd.text); return withTap(timeScale(buildIn('back',e.seed,{model:sm,t:Math.min(e.fromT,sm.dur)},vr),'back',vr),PLUS_PT,-1,vr,'back'); } if(!o) return null; const om = build(vr,o.i,o.seed); return withTap(timeScale(buildIn('back',e.seed,{model:om,t:Math.min(e.fromT,om.dur)},vr),'back',vr),PLUS_PT,-1,vr,'back'); }
    return withTap(timeScale(buildIn('enter',e.seed,null,vr),'enter',vr),TAB_PT,-1,vr,'enter');
  }

  /* ================= V3 OPEN: the block IS the message =================
     The label flies up-left and lands exactly on the student text line; on the way the surface fades and the text
     takes the message style. Geometry measured in this screen (artboard px):
       student text line: left 68, top 153.8, line height 19.6  -> line centre 163.6 (phone content box)
       block label: left edge 44 from the block's outer left edge (border + 16 padding + 17 icon + 10 gap, as rendered), centred */
  const FLY = {textLeft:68, textCy:163.6, labelLeft:44, labelDy:0, chipFont:12, msgFont:14};
  function build3(vr,i,seed){
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a), td = DEFS[i];
    const m = {variant:vr,i,seed,kind:'open',tapped:i};
    const TX = FLY.textLeft-FLY.labelLeft+W/2, TY = FLY.textCy-FLY.labelDy;
    const sx = springEase(V.flyXSpring), sy = springEase(V.flyYSpring);
    const bx = springMs(V.flyXSpring)*1.6, by = springMs(V.flyYSpring)*1.6;
    const ex = t => t>=bx ? 1 : sx(t), ey = t => t>=by ? 1 : sy(t);
    const F = Math.max(springMs(V.flyXSpring),springMs(V.flyYSpring)), flightEnd = Math.max(bx,by);   // % tweaks refer to F
    const surfAt = F*V.fSurfAt/100, surfD = Math.max(1,F*V.fSurfDur/100), txtAt = F*V.fTextAt/100, txtD = Math.max(1,F*V.fTextDur/100);
    const metaAt = F*V.fMetaAt/100, tutAt = F+V.fTutorDelay, straight = Math.max(.01,V.fStraighten/100), g = V.dGravity, OFF = 990;
    const ns = DEFS.map((d,j)=>j).filter(j=>j!==i).map(j=>{
      const d = DEFS[j];
      const sd=rnd(), sr=RR(-1,1), dr=RR(-1,1), st=rnd();            // fixed draw order (same as V2)
      const dly = V.dRipple*Math.abs(j-i) + st*V.dStart;
      const vy = V.dKick, vx = dr*V.dDrift, sg = (sd<.5?1:-1), w = sg*V.dSpin*(1+sr*V.dSpinRand/100), ts = .22;
      const tau = (-vy+Math.sqrt(vy*vy+2*g*Math.max(OFF-d.cy,0)))/g + .1;
      return {j,d,dly,vy,vx,w,sg,ts,end:dly+tau};
    });
    const K = FLY.msgFont/FLY.chipFont, doneAt = P('loading',vr)>0 ? tutAt+P('loading',vr) : Infinity;
    m.motionEnd = Math.max(flightEnd, metaAt+V.fMetaFade, ...ns.map(n=>n.end))+100;
    m.dur = Math.max(m.motionEnd, isFinite(doneAt) ? doneAt+500 : tutAt+1200);
    m.at = t=>{
      const pf = clamp(t/F,0,1), landed = t>=flightEnd, bl = [], txe = bezOpa(clamp((t-txtAt)/txtD,0,1));
      bl[i] = {cx:td.cx+(TX-td.cx)*ex(t), cy:td.cy+(TY-td.cy)*ey(t), r:td.r*(1-bezMsg(clamp(pf/straight,0,1))), s:1+V.fLift/100*Math.sin(Math.PI*pf), o:landed?0:1};
      ns.forEach(n=>{
        const u = Math.max(0,(t-n.dly)/1000), q = n.ts*(1-Math.exp(-u/n.ts));
        bl[n.j] = {cx:n.d.cx+n.vx*q*1.6, cy:n.d.cy+n.vy*u+.5*g*u*u, r:n.d.r+n.w*(u-q)+V.dWobble*n.sg*Math.sin(u*18)*Math.exp(-u*7), s:1, o:1};
      });
      return {blocks:bl, intro:1-clamp(t/450,0,1), shake:[0,0], rise:V.fMetaRise,
              stu:clamp((t-metaAt)/Math.max(1,V.fMetaFade),0,1), stuText:landed?1:0, tut:clamp((t-tutAt)/600,0,1), done:t>=doneAt,
              morph:{i, surface:1-bezOpa(clamp((t-surfAt)/surfD,0,1)), chip:1-txe, chipScale:1+(K-1)*txe, msg:txe, msgScale:1/K+(1-1/K)*txe}};
    };
    return m;
  }


  /* ================= V3 FOCUS · BACK OUT · SEND: starting a chat from the message field =================
     Focus: tapping the field brings up the keyboard; all blocks break away (same physics as the untapped blocks in Open).
     Back out: leaving the field without sending; the keyboard goes down and the blocks rise back.
     Send: the typed text lifts out of the field and lands on the student message line (same idea as V3 Open).
     The keyboard is the system's: its slide is fixed (not a dial). Geometry measured in this screen (artboard px). */
  const KB = {h:336, inputDy:-245, curve:{visualDuration:.38,bounce:0}};
  const FIELD = {textLeft:81, textCy:755, sendPt:[358,755], fieldPt:[221,755]};
  const SAMPLE = 'Explain photosynthesis';
  const FS_T = [
    T('durFocus3','Focus: total duration',0,3000,10,0,' ms','Stretch or squeeze the whole Focus animation','Total length after the tap. Time-scales the whole animation.','0 = natural length.','Slow motion.','The whole Focus animation.'),
    T('tapFocus3','Tap: press duration',100,800,10,150,' ms','How long the finger is down','Shared press time for every interaction.','Quick tap.','Long press.','The start of Focus.'),
    T('blocksAtFocus3','Blocks let go after',0,600,10,40,' ms','When the blocks start to break away, after the keyboard starts','The keyboard starts sliding up right after the tap; the blocks let go this much later.','Together with the keyboard.','After the keyboard is up.','The blocks during Focus.'),
    T('gRipple3','Ripple (bottom first)',0,200,5,35,' ms','Delay between blocks, starting at the bottom','The keyboard comes from below, so the lowest block lets go first, then the ones above.','All at once.','Slow domino upwards.','The order in which the blocks leave.'),
    T('gKick3','Initial push',-400,900,10,-60,' px/s','Start speed downwards','Negative = a small hop up first, as if the blocks get released.','They just let go.','Shoved down.','The first 150 ms of the fall.'),
    T('gGravity3','Gravity',400,7000,50,3500,' px/s²','How fast the blocks fall','Acceleration of the falling blocks.','Floaty.','Heavy drop.','The falling blocks.'),
    T('gSpin3','Spin',0,700,5,200,' °/s','How fast the blocks rotate while falling','Each block gets its own speed and direction.','No tumbling.','Wild tumbling.','The falling blocks.'),
    T('gDrift3','Sideways drift',0,500,5,220,' px/s','Random sideways speed','Each block drifts left or right by a random amount.','Straight down.','Scattered.','The falling blocks.'),
    T('durSend3','Send: total duration',0,3000,10,0,' ms','Stretch or squeeze the whole Send animation','Total length after the tap. Time-scales the whole animation.','0 = natural length.','Slow motion.','The whole Send animation.'),
    T('tapSend3','Tap: press duration',100,800,10,150,' ms','How long the finger is down','Shared press time for every interaction.','Quick tap.','Long press.','The start of Send.'),
    T('sMetaAt3','Avatar + name in at',0,150,1,72,' %','When avatar and “Student - 10:32” appear','Share of the flight after which avatar and name fade in around the landing text.','Before landing.','After landing.','The student message.'),
    T('sMetaFade3','Avatar + name fade',0,1000,10,240,' ms','Fade length of avatar and name','How long avatar and name take to fade in.','Pop.','Slow.','The student message.'),
    T('sMetaRise3','Avatar + name rise',0,60,1,8,' px','How far avatar and name rise while fading in','The text line itself never moves: the text lands on it.','Only fades.','Long rise.','The student message.'),
    T('sTutorDelay3','Brian after landing',0,1500,10,350,' ms','When Brian’s message appears','Delay after the flight before Brian’s message fades in.','Right away.','Late.','The chat after landing.')
  ];
  FS_T.forEach(t=>{ CAT.D.push(t); ALL[t.k] = t; DEF[t.k] = t.def; });
  DEF.sendYSpring = {visualDuration:.55,bounce:.12}; DEF.sendXSpring = {visualDuration:.62,bounce:.06};
  ['sendYSpring','sendXSpring'].concat(FS_T.map(t=>t.k)).forEach(k=>{ if(V[k]===undefined) V[k] = JSON.parse(JSON.stringify(DEF[k])); });   // values set before these existed
  const kbEase = (()=>{ const e = springEase(KB.curve), d = springMs(KB.curve)*1.6; return t=>t>=d ? 1 : e(t); })();
  const KB_END = springMs(KB.curve)*1.6;
  const atRest = d=>({cx:d.cx,cy:d.cy,r:d.r,s:1,o:1}), gone = d=>({cx:d.cx,cy:1100,r:d.r,s:1,o:0});

  function buildFocus(vr,seed){
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a), g = V.gGravity3, OFF = 990;
    const m = {variant:vr,seed,kind:'focus',tapped:-1,i:0};
    const ns = DEFS.map((d,j)=>{
      const sd=rnd(), sr=RR(-1,1), dr=RR(-1,1);                       // fixed draw order
      const dly = V.blocksAtFocus3 + V.gRipple3*(DEFS.length-1-j);
      const vy = V.gKick3, vx = dr*V.gDrift3, sg = (sd<.5?1:-1), w = sg*V.gSpin3*(1+sr*.55), ts = .22;
      const tau = (-vy+Math.sqrt(vy*vy+2*g*Math.max(OFF-d.cy,0)))/g + .1;
      return {j,d,dly,vy,vx,w,sg,ts,end:dly+tau*1000};
    });
    m.motionEnd = Math.max(KB_END, ...ns.map(n=>n.end))+60; m.dur = m.motionEnd+200;
    m.at = t=>({ blocks: ns.map(n=>{ const u = Math.max(0,(t-n.dly)/1000), q = n.ts*(1-Math.exp(-u/n.ts));
        return {cx:n.d.cx+n.vx*q*1.6, cy:n.d.cy+n.vy*u+.5*g*u*u, r:n.d.r+n.w*(u-q)+7*n.sg*Math.sin(u*18)*Math.exp(-u*7), s:1, o:1}; }),
      intro:1, shake:[0,0], stu:0, tut:0, done:false, kb:kbEase(t), field:0, focus:1 });
    return m;
  }
  function buildSend(vr,seed,text){
    const m = {variant:vr,seed,kind:'send',tapped:-1,i:0,text:text||SAMPLE};
    const sx = springEase(V.sendXSpring), sy = springEase(V.sendYSpring), bx = springMs(V.sendXSpring)*1.6, by = springMs(V.sendYSpring)*1.6;
    const ex = t=>t>=bx ? 1 : sx(t), ey = t=>t>=by ? 1 : sy(t);
    const F = Math.max(springMs(V.sendXSpring),springMs(V.sendYSpring)), flightEnd = Math.max(bx,by);
    const x0 = FIELD.textLeft, y0 = FIELD.textCy+KB.inputDy, x1 = FLY.textLeft, y1 = FLY.textCy;
    const metaAt = F*V.sMetaAt3/100, tutAt = F+V.sTutorDelay3;
    m.motionEnd = Math.max(flightEnd, metaAt+V.sMetaFade3)+100; m.dur = Math.max(m.motionEnd, tutAt+1200);
    m.at = t=>{ const landed = t>=flightEnd;
      return {blocks:DEFS.map(gone), intro:1-clamp(t/450,0,1), shake:[0,0], rise:V.sMetaRise3,
        stu:clamp((t-metaAt)/Math.max(1,V.sMetaFade3),0,1), stuText:landed?1:0, tut:clamp((t-tutAt)/600,0,1), done:false,
        kb:1, field:0, focus:1, fly:{x:x0+(x1-x0)*ex(t), cy:y0+(y1-y0)*ey(t), o:landed?0:1, text:m.text}}; };
    return m;
  }

  /* ================= PANEL (which tweaks belong to which animation) ================= */
  const SPR_ALL = {moveSpring:'Open: block morph (spring)', flyYSpring:'Open: flight up (Y spring)', flyXSpring:'Open: flight left (X spring), differs from Y = arc',
    backSpring1:'Back: blocks (spring)', backSpring2:'Back: blocks (spring)', backSpring3:'Back: blocks (spring)',
    enterSpring1:'Enter: blocks (spring)', enterSpring2:'Enter: blocks (spring)', enterSpring3:'Enter: blocks (spring)',
    sendYSpring:'Send: text up (Y spring)', sendXSpring:'Send: text left (X spring), differs from Y = arc'};
  const KEYS = {back:['durBack','tapBack','staggerBack','randBack','chatOutBack','blocksAtBack','introAtBack','introInBack'], enter:['durEnter','tapEnter','staggerEnter','inLead','textEnter','randEnter','wiggle'],
    focus:['durFocus','tapFocus','blocksAtFocus','gRipple','gKick','gGravity','gSpin','gDrift'], blur:['durBack','tapBack','staggerBack','randBack','blocksAtBack','introAtBack','introInBack'],
    send:['durSend','tapSend','sMetaAt','sMetaFade','sMetaRise','sTutorDelay']};
  const labOf = t => t.label + (t.unit.trim()?' ('+t.unit.trim()+')':'');
  function panel(vr,kind){
    const showTw = t => kind==='open'
      ? (vr==='D' ? (/^[fd][A-Z]/.test(t.k) || ['tapOpen3','loading3','durOpen3'].includes(t.k))
                  : (/^[bc][A-Z]/.test(t.k) || ['wind','shake','tapOpen','loading','durOpen'].includes(t.k.slice(0,-1))))
      : (KEYS[kind]||KEYS.enter).includes(t.k.slice(0,-1));
    const showSpr = k => kind==='blur' ? k===('backSpring'+SUF[vr]) : kind==='send' ? (k==='sendYSpring'||k==='sendXSpring') : kind==='open' ? (vr==='C' ? k==='moveSpring' : vr==='D' ? (k==='flyYSpring'||k==='flyXSpring') : false) : k===(kind+'Spring'+SUF[vr]);
    const TW = CAT[vr].filter(showTw).sort((a,b)=>(/^dur/.test(b.k)?1:0)-(/^dur/.test(a.k)?1:0));   // total duration first
    return {tweaks:TW.map(t=>({k:t.k,label:labOf(t),def:t.def,min:t.min,max:t.max,step:t.step,unit:t.unit.trim(),what:t.what,role:roleOf(vr,kind,t.k)})),
            springs:Object.keys(SPR_ALL).filter(showSpr).map(k=>({k,label:SPR_ALL[k],def:DEF[k]}))};
  }

  /* ================= TIMELINE: which dials are "when" dials, as clips (engine ms after the tap, before total-duration scaling) =================
     Each draggable edge maps linearly to one dial: value = (t - base) / per. Locked clips follow from curves / physics. */
  const KN = {open:'Open',back:'Back',enter:'Enter',focus:'Focus',blur:'Back',send:'Send'};   // Back out uses Back's dials
  const V3ONLY = {focus:1,blur:1,send:1};
  const visMs = c => (c.visualDuration!==undefined ? c.visualDuration : .8)*1000;
  function naturalEnd(vr,kd){                 // motion end without total-duration scaling, after the tap
    const dk = 'dur'+KN[kd]+SUF[vr], keep = V[dk]; V[dk] = 0;
    try{ const K = {[vr]:{open:{seed:1,i:1}, back:{seed:1,fromT:Infinity}, enter:{seed:1}, focus:{seed:1}, blur:{seed:1,fromT:Infinity}, send:{seed:1}}}, m = modelFor(vr,kd,K); return m ? m.motionEnd - m.tapLead : 0; }
    finally{ V[dk] = keep; }
  }
  function timeline(vr,kd){
    const s = SUF[vr];
    if(V3ONLY[kd] && vr!=='D') return {tap:{k:'tap'+KN[kd]+s}, total:{k:'dur'+KN[kd]+s, natural:0}, lanes:[]};
    const end = naturalEnd(vr,kd), L = [], lock = (lane,a,b,note)=>L.push({lane,a,b,note,locked:true});
    if(kd==='focus'){
      lock('Keyboard slides up',0,KB_END,'system');
      L.push({lane:'Blocks break away',a:V.blocksAtFocus3,b:end,note:'physics · bottom first',start:{k:'blocksAtFocus3',base:0,per:1}});
    } else if(kd==='blur'){                     // Back out = the Back animation applied from the Focus state (same dials), plus the keyboard
      const tb = timeline(vr,'back'); tb.lanes = [{lane:'Keyboard goes down',a:0,b:KB_END,note:'system',locked:true}].concat(tb.lanes.filter(l=>!/chat/i.test(l.lane)));
      tb.total = Object.assign({}, tb.total, {natural:end}); return tb;
    } else if(kd==='send'){
      const F = Math.max(visMs(V.sendXSpring), visMs(V.sendYSpring)), tut = F+V.sTutorDelay3;
      lock('Text flies up',0,F,'X / Y springs'); lock('Intro fades',0,450,'');
      L.push({lane:'Avatar + name',a:F*V.sMetaAt3/100,b:F*V.sMetaAt3/100+V.sMetaFade3,start:{k:'sMetaAt3',base:0,per:F/100},end:{k:'sMetaFade3',base:F*V.sMetaAt3/100,per:1}});
      L.push({lane:'Brian',a:tut,b:tut+600,start:{k:'sTutorDelay3',base:F,per:1}});
    } else if(kd==='open' && vr==='D'){
      const F = Math.max(visMs(V.flyXSpring), visMs(V.flyYSpring)), tut = F+V.fTutorDelay;
      lock('Flight',0,F,'X / Y springs');
      L.push({lane:'Surface fades',a:F*V.fSurfAt/100,b:F*(V.fSurfAt+V.fSurfDur)/100,start:{k:'fSurfAt',base:0,per:F/100},end:{k:'fSurfDur',base:F*V.fSurfAt/100,per:F/100}});
      L.push({lane:'Text → message',a:F*V.fTextAt/100,b:F*(V.fTextAt+V.fTextDur)/100,start:{k:'fTextAt',base:0,per:F/100},end:{k:'fTextDur',base:F*V.fTextAt/100,per:F/100}});
      L.push({lane:'Avatar + name',a:F*V.fMetaAt/100,b:F*V.fMetaAt/100+V.fMetaFade,start:{k:'fMetaAt',base:0,per:F/100},end:{k:'fMetaFade',base:F*V.fMetaAt/100,per:1}});
      L.push({lane:'Brian',a:tut,b:tut+600,start:{k:'fTutorDelay',base:F,per:1}});
      L.push({lane:'Loading dots',a:tut,b:tut+V.loading3,end:{k:'loading3',base:tut,per:1}});
      lock('Other blocks fall',V.dRipple,end,'physics');
    } else if(kd==='open' && vr==='C'){
      const msgAt = V.cMove*V.cMorphAt/100;
      lock('Block flies',0,springMs(V.moveSpring)*1.6,'open spring');
      L.push({lane:'Student message',a:msgAt,b:msgAt+V.cMove*(1-V.cMorphAt/100)+250,start:{k:'cMorphAt',base:0,per:V.cMove/100}});
      lock('Brian',msgAt+850,msgAt+1450,'+850 ms');
      L.push({lane:'Loading dots',a:msgAt+850,b:msgAt+850+V.loading2,end:{k:'loading2',base:msgAt+850,per:1}});
      lock('Other blocks fall',V.cRipple,end,'physics');
    } else if(kd==='open'){
      const za = Math.max(0,-V.bOffset||0);
      L.push({lane:'Zoom',a:za,b:za+V.bZoom,end:{k:'bZoom',base:za,per:1}});
      lock('Neighbours pushed',0,end,'physics'); lock('Messages',za+V.bZoom*.55,end,'');
    } else if(kd==='enter'){
      if(vr==='B'){ lock('Text + illustration',0,450,''); L.push({lane:'Blocks fly in',a:V.inLead1,b:end,start:{k:'inLead1',base:0,per:1}}); }
      else { lock('Blocks fly in',0,end,'spring · stagger'); L.push({lane:'Text appears',a:V['textEnter'+s],b:V['textEnter'+s]+450,start:{k:'textEnter'+s,base:0,per:1}}); }
    } else {
      const D = springMs(V['backSpring'+s])*1.6, co = V['chatOutBack'+s], ba = V['blocksAtBack'+s], ia = D*V['introAtBack'+s]/100, il = V['introInBack'+s];
      L.push({lane:'Chat fades out',a:0,b:co,end:{k:'chatOutBack'+s,base:0,per:1}});
      L.push({lane:'Blocks rise',a:ba,b:end,note:'spring · stagger',start:{k:'blocksAtBack'+s,base:0,per:1}});
      L.push({lane:'Intro fades in',a:ia,b:ia+il,start:{k:'introAtBack'+s,base:0,per:D/100},end:{k:'introInBack'+s,base:ia,per:1}});
    }
    return {tap:{k:'tap'+KN[kd]+s}, total:{k:'dur'+KN[kd]+s, natural:end}, lanes:L};
  }
  /* roles: duration (timeline end), timing (timeline clips + tap), interaction (out of the way), feel (panel) */
  function roleOf(vr,kd,k){
    if(/^dur/.test(k)) return 'duration';
    if(/^wiggle/.test(k) || /^tap/.test(k)) return 'interaction';   // taps / presses use the package's shared interaction defaults
    const t = timeline(vr,kd), keys = new Set([t.tap.k]); t.lanes.forEach(c=>{ if(c.start) keys.add(c.start.k); if(c.end) keys.add(c.end.k); });
    return keys.has(k) ? 'timing' : 'feel';
  }

  /* ================= TEST VECTORS (fixed seeds, sampled frames) ================= */
  const VEC_T = [0,100,170,300,500,800,1200,1600,2200];
  function vectors(vr,values){
    const keep = V; if(values) setValues(Object.assign({},DEF,values));
    const KS = {}; KS[vr] = {open:{seed:12345,i:1}, back:{seed:777,fromT:Infinity}, enter:{seed:999}, focus:{seed:4242}, blur:{seed:5151,fromT:Infinity}, send:{seed:6262}};
    const rd = v=>Math.round(v*100)/100, out = {T:VEC_T};
    try{ ['open','back','enter'].concat(vr==='D'?['focus','blur','send']:[]).forEach(kd=>{ const m = modelFor(vr,kd,KS);
      out[kd] = {duration:rd(m.dur),s:VEC_T.map(t=>{ const st = m.at(t); const o = {b:st.blocks.map(b=>[rd(b.cx),rd(b.cy),rd(b.r),rd(b.s),rd(b.o)]),intro:rd(st.intro),stu:rd(st.stu),tut:rd(st.tut)};
        if(st.kb!==undefined) o.kb = rd(st.kb); if(st.fly) o.fly = [rd(st.fly.x),rd(st.fly.cy),rd(st.fly.o)]; if(st.morph) o.m = [rd(st.morph.surface),rd(st.morph.chip),rd(st.morph.chipScale),rd(st.morph.msg),rd(st.morph.msgScale)]; if(st.stuText!==undefined) o.st = rd(st.stuText); return o; })}; }); }
    finally{ setValues(keep); }
    return out;
  }

  /* ================= REFERENCE-CODE PARAMS (V2 handoff: TS + Dart) ================= */
  function refParams(){
  const nf = v=>String(+(+v).toFixed(4));
  const spTS = c=>c.visualDuration!==undefined ? '{ visualDuration: '+nf(c.visualDuration)+', bounce: '+nf(c.bounce||0)+' }' : '{ stiffness: '+nf(c.stiffness)+', damping: '+nf(c.damping)+', mass: '+nf(c.mass)+' }';
  const spDT = c=>c.visualDuration!==undefined ? 'SpringCfg.visual('+nf(c.visualDuration)+', '+nf(c.bounce||0)+')' : 'SpringCfg.physics('+nf(c.stiffness)+', '+nf(c.damping)+', '+nf(c.mass)+')';
  function codeValues(){
    const g = n=>P(n,'C'), c = V;
    return {open:{tap:g('tapOpen'),total:g('durOpen'),move:c.cMove,morphAt:c.cMorphAt/100,rise:c.cRise,gravity:c.cGravity,kick:c.cKick,spin:c.cSpin,spinRand:c.cSpinRand,drift:c.cDrift,start:c.cStart,wobble:c.cWobble,flySpin:c.cFlySpin,arc:c.cArc,ripple:c.cRipple,loading:g('loading'),spring:c.moveSpring},
            back:{tap:g('tapBack'),total:g('durBack'),stagger:g('staggerBack'),rand:g('randBack')/100,spring:c.backSpring2},
            enter:{tap:g('tapEnter'),total:g('durEnter'),stagger:g('staggerEnter'),rand:g('randEnter')/100,textAt:g('textEnter'),spring:c.enterSpring2},
            wiggle:g('wiggle')/100};
  }
    const v = codeValues();
    const ts = '// <<PARAMS\nexport const P = {\n'
      + '  open:  { tap: '+nf(v.open.tap)+', total: '+nf(v.open.total)+', move: '+nf(v.open.move)+', morphAt: '+nf(v.open.morphAt)+', rise: '+nf(v.open.rise)+', gravity: '+nf(v.open.gravity)+', kick: '+nf(v.open.kick)+', spin: '+nf(v.open.spin)+', spinRand: '+nf(v.open.spinRand)+',\n'
      + '           drift: '+nf(v.open.drift)+', start: '+nf(v.open.start)+', wobble: '+nf(v.open.wobble)+', flySpin: '+nf(v.open.flySpin)+', arc: '+nf(v.open.arc)+', ripple: '+nf(v.open.ripple)+', loading: '+nf(v.open.loading)+',\n'
      + '           spring: '+spTS(v.open.spring)+' as Spring },\n'
      + '  back:  { tap: '+nf(v.back.tap)+', total: '+nf(v.back.total)+', stagger: '+nf(v.back.stagger)+', rand: '+nf(v.back.rand)+', spring: '+spTS(v.back.spring)+' as Spring },\n'
      + '  enter: { tap: '+nf(v.enter.tap)+', total: '+nf(v.enter.total)+', stagger: '+nf(v.enter.stagger)+', rand: '+nf(v.enter.rand)+', textAt: '+nf(v.enter.textAt)+', spring: '+spTS(v.enter.spring)+' as Spring },\n'
      + '  wiggle: '+nf(v.wiggle)+',   // desktop hover wiggle strength (0 = off)\n};\n// PARAMS>>';
    const dt = '// <<PARAMS\nclass OpenP {\n  static const tap = '+nf(v.open.tap)+', total = '+nf(v.open.total)+', move = '+nf(v.open.move)+', morphAt = '+nf(v.open.morphAt)+', rise = '+nf(v.open.rise)+', gravity = '+nf(v.open.gravity)+', kick = '+nf(v.open.kick)+',\n'
      + '      spin = '+nf(v.open.spin)+', spinRand = '+nf(v.open.spinRand)+', drift = '+nf(v.open.drift)+', start = '+nf(v.open.start)+', wobble = '+nf(v.open.wobble)+', flySpin = '+nf(v.open.flySpin)+', arc = '+nf(v.open.arc)+', ripple = '+nf(v.open.ripple)+', loading = '+nf(v.open.loading)+';\n'
      + '  static final spring = '+spDT(v.open.spring)+';\n}\n'
      + 'class BackP { static const tap = '+nf(v.back.tap)+', total = '+nf(v.back.total)+', stagger = '+nf(v.back.stagger)+', rand = '+nf(v.back.rand)+'; static final spring = '+spDT(v.back.spring)+'; }\n'
      + 'class EnterP { static const tap = '+nf(v.enter.tap)+', total = '+nf(v.enter.total)+', stagger = '+nf(v.enter.stagger)+', rand = '+nf(v.enter.rand)+', textAt = '+nf(v.enter.textAt)+'; static final spring = '+spDT(v.enter.spring)+'; }\n'
      + 'const wiggleAmount = '+nf(v.wiggle)+';   // desktop hover wiggle strength (0 = off)\n// PARAMS>>';
    const rows = [['Open','total '+nf(v.open.total)+' ms, tap '+nf(v.open.tap)+', move '+nf(v.open.move)+', morphAt '+Math.round(v.open.morphAt*100)+' %, rise '+nf(v.open.rise)+', gravity '+nf(v.open.gravity)+', kick '+nf(v.open.kick)+', spin '+nf(v.open.spin)+' (rand '+nf(v.open.spinRand)+' %), drift '+nf(v.open.drift)+', start '+nf(v.open.start)+', wobble '+nf(v.open.wobble)+', flySpin '+nf(v.open.flySpin)+', arc '+nf(v.open.arc)+', ripple '+nf(v.open.ripple)+', loading '+nf(v.open.loading)],
      ['Open spring',spTS(v.open.spring)],['Back','total '+nf(v.back.total)+' ms, tap '+nf(v.back.tap)+', stagger '+nf(v.back.stagger)+', rand '+Math.round(v.back.rand*100)+' %, spring '+spTS(v.back.spring)],
      ['Enter','total '+nf(v.enter.total)+' ms, tap '+nf(v.enter.tap)+', stagger '+nf(v.enter.stagger)+', rand '+Math.round(v.enter.rand*100)+' %, text at '+nf(v.enter.textAt)+', spring '+spTS(v.enter.spring)],['Hover wiggle (desktop)',Math.round(v.wiggle*100)+' %']];
    const table = '| Animation | Value |\n|---|---|\n'+rows.map(r=>'| '+r[0]+' | '+r[1]+' |').join('\n');
    return {ts, dart:dt, table};
  }

  /* ================= VIEW: binds frames to the screen markup ================= */
  function mount(phone, api){
    const blocksEl = phone.querySelector('#blocks'), intro = phone.querySelector('#intro'), chat = phone.querySelector('#chat');
    blocksEl.innerHTML = ''; chat.innerHTML = '';
    function setPose(el,x,y,r){ el.style.setProperty('--x',x+'px'); el.style.setProperty('--y',y+'px'); el.style.setProperty('--r',r+'deg'); }
    const blocks = DEFS.map((d,i)=>{
      const el = document.createElement('div');
      el.className = 'block';
      setPose(el, d.cx-W/2, d.cy-H/2, d.r);
      el.innerHTML = '<div class="wob rest"><div class="card" style="--ir:'+d.ir+'deg">'
        + '<span class="ic">'+I[d.icon]+'</span><span class="tx">'+d.label+'</span><span class="tx2" aria-hidden="true">'+d.label+'</span><i class="a"></i><i class="b"></i><i class="c"></i></div></div>';
      el.addEventListener('click',()=>{ el.classList.remove('pressed'); api.onBlock(i); });
      return el;
    });
    blocks.forEach(b=>blocksEl.appendChild(b));
    const wobs = blocks.map(b=>b.querySelector('.wob'));
    /* hover wiggle (once on enter) + press state */
    function wob(i,amount){
      const w = wobs[i], a = P('wiggle',api.variant())/100*amount;
      w.classList.remove('rest');
      w.style.setProperty('--hx', (R(-1,1)*5*a)+'px'); w.style.setProperty('--hy', (R(-1,1)*4*a)+'px'); w.style.setProperty('--hr', (R(-1,1)*5*a)+'deg');
    }
    function settle(i){ const w = wobs[i]; w.classList.add('rest'); w.style.setProperty('--hx','0px'); w.style.setProperty('--hy','0px'); w.style.setProperty('--hr','0deg'); }
    blocks.forEach((b,i)=>{
      b.addEventListener('mouseenter',()=>{ if(!HOVER || api.opened()||P('wiggle',api.variant())<=0) return; wob(i,1); setTimeout(()=>settle(i),110); });
      b.addEventListener('mouseleave',()=>settle(i));
      b.addEventListener('pointerdown',()=>{ if(!api.opened()) b.classList.add('pressed'); });
      ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>{ if(!api.opened()) b.classList.remove('pressed'); }));
    });
    phone.querySelector('#newChat').addEventListener('click',()=>api.onPlus());
    /* V3 field: system keyboard stand-in, flying text, simulated typing (any key types the sample prompt) */
    const inputEl = phone.querySelector('#input'), fieldEl = phone.querySelector('#field'), txt = phone.querySelector('#txt');
    /* REAL (phone build on a touch screen): the field is a real input and the OS keyboard opens (same approach as BR-7147);
       the input bar follows the visible area. Otherwise (workbench, desktop): the drawn keyboard, so animations replay and scrub. */
    const REAL = !!api.realKeyboard;
    if(REAL){ txt.readOnly = false; txt.removeAttribute('inputmode'); txt.setAttribute('enterkeyhint','send');
      txt.style.caretColor = 'transparent'; }   // iOS draws its caret where the field was before it moved; the drawn caret follows the field
    else { txt.readOnly = true; txt.setAttribute('inputmode','none'); }
    let realDy = KB.inputDy, lastKb = 0, baseBottom = 0;   // REAL: offset (artboard px) that puts the input bar on top of the OS keyboard
    const inputDy = ()=>REAL ? realDy : KB.inputDy;
    const placeInput = kb=>{ lastKb = kb; inputEl.style.transform = kb ? 'translateY('+(inputDy()*kb)+'px)' : ''; };
    if(REAL && window.visualViewport) visualViewport.addEventListener('resize', ()=>{
      const k = api.scale ? api.scale() : 1, vh = visualViewport.height;
      if(!baseBottom || document.activeElement!==txt) return;
      if(vh < window.screen.height - 120) { realDy = Math.min(0, (vh - baseBottom)/k); placeInput(lastKb); } });
    /* Prototype keyboard: iOS light, German QWERTZ, types for real (taps or a hardware keyboard). The app itself uses the OS keyboard. */
    const kbd = document.createElement('div'); kbd.className = 'kbd'; kbd.setAttribute('aria-hidden','true'); phone.appendChild(kbd); if(REAL) kbd.style.display = 'none';
    const caret = document.createElement('span'); caret.className = 'caret'; fieldEl.appendChild(caret);
    const fly = document.createElement('div'); fly.className = 'flytext'; phone.appendChild(fly);
    const SV = {
      sh:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 4.5 4 12.5h4.5v6h7v-6H20z"/></svg>',
      shOn:'<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"><path d="M12 4.5 4 12.5h4.5v6h7v-6H20z"/></svg>',
      del:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M8.5 5H21v14H8.5L2.5 12z"/><path d="m11.5 9 6 6m0-6-6 6" stroke-linecap="round"/></svg>',
      emo:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9.5" fill="currentColor"/><ellipse cx="9" cy="9.6" rx="1.2" ry="1.6" fill="#5b5b5b"/><ellipse cx="15" cy="9.6" rx="1.2" ry="1.6" fill="#5b5b5b"/><path d="M6.8 12.6h10.4c-.4 3-2.6 5-5.2 5s-4.8-2-5.2-5z" fill="#5b5b5b"/></svg>',
      go:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5m-6.5 6.5L12 5l6.5 6.5"/></svg>',
      globe:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18M5 7.5h14M5 16.5h14"/></svg>',
      mic:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/></svg>'};
    const LAYERS = { abc:[[...'qwertzuiopü'],[...'asdfghjklöä'],['⇧',...'yxcvbnm','⌫'],['123','☺',' ','↵']],
                     num:[[...'1234567890'],['-','/',':',';','(',')','€','&','@','"'],['#+=','.',',','?','!',"'",'⌫'],['ABC','☺',' ','↵']],
                     sym:[[...'[]{}#%^*+='],['_','\\','|','~','<','>','$','£','¥','•'],['123','.',',','?','!',"'",'⌫'],['ABC','☺',' ','↵']] };
    let typed = '', layer = 'abc', shift = true, caps = false;
    const autoShift = ()=>{ shift = typed==='' || /[.!?]\s$/.test(typed); };
    const word = ()=>{ const m = typed.match(/(\S+)$/); return m ? m[1] : ''; };
    function renderKb(){
      const keys = LAYERS[layer], up = layer==='abc' && (shift || caps);
      const key = k=>{
        if(k==='⇧') return '<i class="w sh'+(up?' on':'')+'" data-a="shift">'+(up?SV.shOn:SV.sh)+'</i><span class="gap"></span>';
        if(k==='⌫') return '<span class="gap"></span><i class="w" data-a="del">'+SV.del+'</i>';
        if(k==='123' || k==='ABC' || k==='#+=') return (layer!=='abc' && k!=='ABC' ? '' : '')+'<i class="w" data-a="'+k+'">'+k+'</i>'+(keys[2][0]===k ? '<span class="gap"></span>' : '');
        if(k==='☺') return '<i class="w" data-a="emo">'+SV.emo+'</i>';
        if(k===' ') return '<i class="sp" data-a="space"></i>';
        if(k==='↵') return '<i class="go" data-a="go">'+SV.go+'</i>';
        const c = up ? k.toUpperCase() : k; return '<i data-k="'+c.replace(/"/g,'&quot;')+'" data-c="'+c.replace(/"/g,'&quot;')+'">'+c+'</i>';
      };
      const w = word(), sug = w ? ['„'+w+'“', w.length>2 ? w+'e' : 'die', 'ich'] : ['Ich','Hallo','Ja'];
      kbd.classList.toggle('num', layer!=='abc');
      kbd.innerHTML = '<div class="sug">'+sug.map(x=>'<span>'+x.replace(/</g,'&lt;')+'</span>').join('')+'</div>'
        + keys.map(r=>'<div class="row">'+r.map(key).join('')+'</div>').join('')
        + '<div class="sys"><span>'+SV.globe+'</span><span>'+SV.mic+'</span></div>';
    }
    const measure = document.createElement('canvas').getContext('2d');
    function showText(){
      txt.value = typed; fieldEl.classList.toggle('has', !!typed);
      const cs = getComputedStyle(txt); measure.font = cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;
      const x0 = txt.offsetLeft + parseFloat(cs.paddingLeft||0), wMax = txt.clientWidth - parseFloat(cs.paddingLeft||0) - parseFloat(cs.paddingRight||0);
      caret.style.left = (x0 + Math.min(measure.measureText(typed).width, wMax) + .5)+'px';
      caret.style.animation = 'none'; void caret.offsetWidth; caret.style.animation = '';   // caret stays solid while typing
    }
    function press(a, ch){
      if(ch!==undefined){ typed += ch; if(!caps) shift = false; if(layer!=='abc' && ch===' ') layer = 'abc'; }
      else if(a==='space'){ typed += ' '; if(layer!=='abc') layer = 'abc'; autoShift(); }
      else if(a==='del'){ typed = typed.slice(0,-1); autoShift(); }
      else if(a==='shift'){ if(shift && !caps){ shift = false; } else shift = !shift; }
      else if(a==='123'){ layer = 'num'; } else if(a==='ABC'){ layer = 'abc'; autoShift(); } else if(a==='#+='){ layer = 'sym'; }
      else if(a==='go'){ api.onSend && api.onSend(typed); return; }
      else return;
      if(ch!==undefined && layer==='abc') autoShift(), shift = shift && /[.!?]\s$/.test(typed);
      showText(); renderKb();
    }
    let lastShift = 0, held = null;
    kbd.addEventListener('pointerdown', e=>{ const k = e.target.closest('i'); if(!k) return; e.preventDefault(); e.stopPropagation();
      held = k; k.classList.add('dn'); if(k.dataset.k) k.classList.add('pop');
      if(k.dataset.a==='shift'){ const now = performance.now(); if(now-lastShift<300){ caps = !caps; shift = caps; showText(); renderKb(); lastShift = 0; return; } lastShift = now; }
      if(k.dataset.a==='del'){ press('del'); const rep = setTimeout(function again(){ if(held!==k) return; press('del'); k._rep = setTimeout(again,90); },450); k._rep = rep; } });
    const release = e=>{ const k = held; held = null; if(!k) return; clearTimeout(k._rep); k.classList.remove('dn','pop');
      if(e.type!=='pointerup') return; e.stopPropagation();
      if(k.dataset.k) press(null, k.dataset.k); else if(k.dataset.a && k.dataset.a!=='del') press(k.dataset.a); };
    kbd.addEventListener('pointerup', release); kbd.addEventListener('pointercancel', release); kbd.addEventListener('pointerleave', release);
    kbd.addEventListener('click', e=>e.stopPropagation());
    renderKb();
    fieldEl.addEventListener('click', e=>{ e.stopPropagation(); if(e.target.closest('#send')) return;
      if(REAL){ if(!lastKb) baseBottom = inputEl.getBoundingClientRect().bottom; txt.focus(); } api.onField && api.onField(); });
    const sendBtn = phone.querySelector('#send');
    sendBtn.addEventListener('pointerdown', e=>{ if(REAL) e.preventDefault(); });   // keep the OS keyboard open when tapping send
    sendBtn.addEventListener('click', e=>{ e.stopPropagation(); api.onSend && api.onSend(typed); });
    if(REAL){
      txt.addEventListener('input', ()=>{ typed = txt.value; showText(); });
      txt.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); api.onSend && api.onSend(typed); } });
      txt.addEventListener('blur', ()=>{ if(phone.classList.contains('kbup')) api.onOutside && api.onOutside(); });   // keyboard closed (swipe down, ✓, app switch)
    }
    phone.addEventListener('click', e=>{ if(!phone.classList.contains('kbup') || e.target.closest('#input,.kbd,#header')) return; if(REAL) txt.blur(); api.onOutside && api.onOutside(); });
    window.addEventListener('keydown', e=>{ if(REAL || !phone.classList.contains('kbup') || e.metaKey || e.ctrlKey || e.altKey) return;   // hardware keyboard types too
      if(e.key==='Enter'){ e.preventDefault(); api.onSend && api.onSend(typed); }
      else if(e.key==='Backspace'){ e.preventDefault(); press('del'); }
      else if(e.key.length===1){ e.preventDefault(); e.stopPropagation(); press(null, e.key); } }, true);
    const tab = phone.querySelector('.tab.active'); if(tab){ tab.style.cursor='pointer'; tab.addEventListener('click',()=>api.onTab()); }

const HOVER = matchMedia('(hover:hover)').matches;   // touch screens fire mouseenter on tap: no hover wiggle there

  function time(){ const d=new Date(); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
  function avatarSvg(kind){
    if(kind==='tutor') return '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="10" width="16" height="13" rx="2.5" transform="rotate(-6 16 16)"/><circle cx="13" cy="16" r="1.3" fill="#fff"/><circle cx="19" cy="15.4" r="1.3" fill="#fff"/><path d="M16 9l-.4-3.2M13 20.4h6"/><circle cx="15.5" cy="5" r="1.2"/></svg>';
    return '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="#3a3a3a" stroke-width="1.1" stroke-linecap="round"><circle cx="16" cy="13" r="5"/><path d="M8 28c0-5 3.6-8 8-8s8 3 8 8"/><path d="M10.5 9.5c1-3.6 10-3.6 11 0M9 10h14"/></svg>';
  }
  function mkStudent(text){
    const m = document.createElement('div');
    m.className = 'msg student';
    m.innerHTML = '<div class="avatar">'+avatarSvg('student')+'</div><div style="flex:1;min-width:0"><div class="meta">Student - '+time()+'</div><div class="body"></div></div>';
    m.querySelector('.body').textContent = text;
    return m;
  }
  function mkTutor(){
    const m = document.createElement('div');
    m.className = 'msg tutor';
    m.innerHTML = '<div class="avatar">'+avatarSvg('tutor')+'</div><div style="flex:1;min-width:0"><div class="meta">Brian - '+time()+'</div><div class="body"><div class="dots"><i></i><i></i><i></i></div><div class="reply">Placeholder – the streamed answer would appear here.</div></div></div>';
    return m;
  }

    let cs = null, ct = null;
    function placeBlock(el,b){
      if(el._k !== b.s){ el._k = b.s; el.style.setProperty('--k',b.s); }   // only when it changes: --k re-lays out the block's text
      el.style.transform = 'translate('+(b.cx-W*b.s/2)+'px,'+(b.cy-H*b.s/2)+'px) rotate('+b.r+'deg)';
      el.style.opacity = String(b.o);
    }
    function clearMorph(el){ const c = el.querySelector('.card'); c.style.backgroundColor=c.style.borderColor=c.style.boxShadow='';
      el.querySelectorAll('.ic,.tx,.tx2,i').forEach(n=>{ n.style.opacity=''; n.style.transform=''; }); }
    function enter(model){                       // switch the screen into timeline mode for this run
      phone.classList.add('opening');
      wobs.forEach(w=>{ w.style.transition='none'; w.style.setProperty('--hx','0px'); w.style.setProperty('--hy','0px'); w.style.setProperty('--hr','0deg'); });
      intro.classList.add('hide'); intro.style.transition='none';
      chat.classList.add('tl'); chat.innerHTML='';
      if(model.kind==='focus' || model.kind==='blur'){ cs = ct = null; if(model.kind==='focus'){ typed = ''; layer = 'abc'; caps = false; shift = true; showText(); renderKb(); } }
      else { cs = mkStudent(model.kind==='send' ? model.text : DEFS[model.i].label); ct = mkTutor(); chat.appendChild(cs); chat.appendChild(ct); }
      blocks.forEach(b=>{ b.style.transition='none'; b.querySelector('.card').style.transition='none'; b.classList.remove('gone','pressed','tapped'); b.classList.add('blast'); clearMorph(b); });   // frames drive every value: no CSS transitions
    }
    function draw(model, st){
      st.blocks.forEach((b,j)=>placeBlock(blocks[j],b));
      intro.style.opacity = String(st.intro);
      const kb = st.kb || 0;
      kbd.style.transform = 'translateY('+((1-kb)*KB.h)+'px)'; kbd.style.visibility = kb>0.001 ? 'visible' : 'hidden';
      placeInput(kb);
      if(REAL && (model.kind==='back' || model.kind==='blur') && document.activeElement===txt) txt.blur();   // the OS keyboard goes down too
      phone.classList.toggle('kbup', kb>0.5 && model.kind!=='send' && model.kind!=='back');
      fieldEl.classList.toggle('focus', !!st.focus);
      if(model.kind==='send'){ txt.value = st.fly && st.fly.o && t0(st) ? model.text : ''; fieldEl.classList.toggle('has', !!txt.value); }
      if(st.fly && st.fly.o>0 && !t0(st)){ fly.textContent = st.fly.text; fly.style.opacity = '1'; fly.style.transform = 'translate('+st.fly.x+'px,'+(st.fly.cy-9.8)+'px)'; } else fly.style.opacity = '0';
      const tc = phone.querySelector('#touch');
      if(st.touch){ tc.classList.toggle('cur',!!st.touch.cur); tc.style.opacity = String(st.touch.o); tc.style.transform = 'translate('+st.touch.x+'px,'+st.touch.y+'px) scale('+st.touch.s+')'; } else tc.style.opacity = '0';
      blocks.forEach((b,j)=>{ b.classList.toggle('tapped', model.tapped===j && !!st.pressed); b.classList.toggle('hov', st.hover===j); });
      phone.style.transform = (st.shake[0]||st.shake[1]) ? 'translate('+st.shake[0]+'px,'+st.shake[1]+'px)' : '';
      blocks.forEach((b,j)=>{ const mo = st.morph && st.morph.i===j ? st.morph : null; if(!mo){ clearMorph(b); return; }
        const c = b.querySelector('.card'), a = mo.surface, dark = b.classList.contains('tapped') ? '58,58,58' : '255,255,255';
        c.style.backgroundColor = 'rgba('+dark+','+a+')'; c.style.borderColor = 'rgba(58,58,58,'+a+')';
        c.style.boxShadow = 'calc(3px*var(--k,1)) calc(3px*var(--k,1)) 0 rgba(58,58,58,'+a+')';
        b.querySelectorAll('.ic,i').forEach(n=>n.style.opacity=String(a));
        const t1 = b.querySelector('.tx'), t2 = b.querySelector('.tx2');
        t1.style.opacity = String(mo.chip); t1.style.transform = 'scale('+mo.chipScale+')';
        t2.style.opacity = String(mo.msg); t2.style.transform = 'scale('+mo.msgScale+')'; });
      if(cs){
        const set=(el,p,rz)=>{ el.style.opacity=String(p); el.style.transform='translateY('+(rz*(1-bezMsg(p)))+'px)'; };
        const parts = [cs.querySelector('.avatar'), cs.querySelector('.meta')], body = cs.querySelector('.body');
        if(st.stuText!==undefined){ cs.style.opacity='1'; cs.style.transform='none'; parts.forEach(p=>set(p,st.stu,st.rise)); body.style.opacity=String(st.stuText); }
        else { parts.forEach(p=>{ p.style.opacity=''; p.style.transform=''; }); body.style.opacity=''; set(cs,st.stu,st.rise===undefined?14:st.rise); }
        set(ct,st.tut,14); ct.classList.toggle('done',st.done);
      }
    }
    function clearBlock(b){ b.classList.remove('tapped','pressed','explode','blast','gone'); b.style.transform=''; b.style.opacity=''; b.style.transition=''; b.querySelector('.card').style.transition=''; b.style.removeProperty('--k'); clearMorph(b); }
    const t0 = st => st.fly && Math.abs(st.fly.x-FIELD.textLeft)<0.01 && Math.abs(st.fly.cy-(FIELD.textCy+KB.inputDy))<0.01;   // send: text still in the field
    function reset(){                            // instant reset to the home screen
      kbd.style.transform = 'translateY('+KB.h+'px)'; kbd.style.visibility = 'hidden'; placeInput(0); phone.classList.remove('kbup'); if(REAL && document.activeElement===txt) txt.blur(); fieldEl.classList.remove('focus','has');
      typed = ''; layer = 'abc'; caps = false; shift = true; showText(); renderKb(); fly.style.opacity = '0';
      phone.style.transform=''; intro.style.transition=''; intro.style.opacity=''; chat.classList.remove('tl'); chat.innerHTML=''; cs = ct = null;
      blocks.forEach((b,j)=>{ clearBlock(b); setPose(b,DEFS[j].cx-W/2,DEFS[j].cy-H/2,DEFS[j].r); settle(j); });
      intro.classList.remove('hide'); phone.classList.remove('opening');
      wobs.forEach(w=>w.style.transition='');
    }
    /* layout spec: what the developer needs to rebuild the screen (measured by the workbench) */
    function specTargets(state){
      const q = s=>phone.querySelector(s);
      if(state==='home') return [
        ['Status bar',q('#status')],['Status time',q('#status .time')],['Header',q('#header')],['Menu button',q('#header .ibtn')],['Title',q('#header h1')],
        ['New chat “+” (Back trigger)',q('#newChat')],['Intro (empty state)',q('#intro')],['Illustration',q('#illu')],['Headline',q('#intro h2')],['Subtitle',q('#intro p')],
        ['Block card (inside the block, 0 0 = block top-left)',blocks[0].querySelector('.card')],['Block icon (inside the block)',blocks[0].querySelector('.ic')],['Block label (inside the block)',blocks[0].querySelector('.tx')],
        ['Input bar',q('#input')],['Attach “+”',q('#input .circle')],['Text field',q('#field')],['Field text / placeholder',q('#txt')],['Send button',q('#send')],
        ['Tab bar',q('#tabbar')],['Tab: Map',q('.tab[aria-label="Map"]')],['Tab: AI Tutor (active, Enter trigger)',q('.tab.active')],['Tab: Stats',q('.tab[aria-label="Stats"]')]];
      if(!cs) return [];
      return [['Chat area',chat],['Student message',cs],['Student avatar',cs.querySelector('.avatar')],['Student name + time',cs.querySelector('.meta')],['Student text (prompt)',cs.querySelector('.body')],
        ['Tutor message',ct],['Tutor avatar',ct.querySelector('.avatar')],['Tutor name + time',ct.querySelector('.meta')],['Tutor loading dots',ct.querySelector('.dots')]];
    }
    /* assets the screen code uses (section 1c of the package): file name -> SVG markup or PNG data URI */
    function assets(){
      const svg = (el)=>{ if(!el) return ''; const c = el.cloneNode(true); c.removeAttribute('style'); c.removeAttribute('class');
        if(!c.getAttribute('xmlns')) c.setAttribute('xmlns','http://www.w3.org/2000/svg'); return c.outerHTML; };
      const q = s=>phone.querySelector(s), raw = (str)=>{ const d = document.createElement('div'); d.innerHTML = str; return svg(d.firstElementChild); };
      const out = {'status_icons.svg':svg(q('#status svg')), 'menu.svg':svg(q('#header .ibtn svg')), 'new_chat.svg':svg(q('#newChat svg')),
        'illustration.png':(q('#illu')||{}).src||'', 'attach_plus.svg':svg(q('#input .circle svg')), 'send.svg':svg(q('#send svg')),
        'tabbar_line.svg':svg(q('#tabbar svg.line')), 'tab_map.svg':svg(q('.tab[aria-label="Map"] svg')), 'tab_ai_tutor.svg':svg(q('.tab.active svg')),
        'tab_stats.svg':svg(q('.tab[aria-label="Stats"] svg')), 'avatar_student.svg':raw(avatarSvg('student')), 'avatar_tutor.svg':raw(avatarSvg('tutor'))};
      Object.keys(I).forEach(k=>{ out['block_'+k+'.svg'] = raw(I[k]); });
      return out;
    }
    return {enter, draw, reset, specTargets, assets, blocks};
  }

  function elements(){ return {size:[W,H], blocks:DEFS.map((d,i)=>({index:i,label:d.label,icon:d.icon,rest:{cx:d.cx,cy:d.cy,r:d.r}})),
    textLayers:['intro (headline + illustration + subtitle)','student message (avatar + name, text)','tutor message (avatar + name, dots → reply)'],
    triggers:{open:'tap a block (touch point = block centre)', back:'tap “+” in the header at ['+PLUS_PT+']', enter:'tap the AI Tutor tab at ['+TAB_PT+']'}}; }

  return { id:'ai-tutor-blocks', setValues, values:()=>V, defaults:()=>JSON.parse(JSON.stringify(DEF)), catalogue:()=>CAT,
           panel, timeline, modelFor, vectors, refParams, mount, elements };
}};
})(typeof window!=='undefined' ? window : globalThis);
