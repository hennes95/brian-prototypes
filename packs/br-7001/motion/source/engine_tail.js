
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
__REFPARAMS__
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
    txt.readOnly = true; txt.setAttribute('inputmode','none');
    /* Prototype keyboard: iOS light, German QWERTZ, types for real (taps or a hardware keyboard). The app itself uses the OS keyboard. */
    const kbd = document.createElement('div'); kbd.className = 'kbd'; kbd.setAttribute('aria-hidden','true'); phone.appendChild(kbd);
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
    fieldEl.addEventListener('click', e=>{ e.stopPropagation(); if(e.target.closest('#send')) return; api.onField && api.onField(); });
    phone.querySelector('#send').addEventListener('click', e=>{ e.stopPropagation(); api.onSend && api.onSend(typed); });
    phone.addEventListener('click', e=>{ if(!phone.classList.contains('kbup') || e.target.closest('#input,.kbd,#header')) return; api.onOutside && api.onOutside(); });
    window.addEventListener('keydown', e=>{ if(!phone.classList.contains('kbup') || e.metaKey || e.ctrlKey || e.altKey) return;   // hardware keyboard types too
      if(e.key==='Enter'){ e.preventDefault(); api.onSend && api.onSend(typed); }
      else if(e.key==='Backspace'){ e.preventDefault(); press('del'); }
      else if(e.key.length===1){ e.preventDefault(); e.stopPropagation(); press(null, e.key); } }, true);
    const tab = phone.querySelector('.tab.active'); if(tab){ tab.style.cursor='pointer'; tab.addEventListener('click',()=>api.onTab()); }

const HOVER = matchMedia('(hover:hover)').matches;   // touch screens fire mouseenter on tap: no hover wiggle there

__CHAT__

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
      inputEl.style.transform = kb ? 'translateY('+(KB.inputDy*kb)+'px)' : '';
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
      kbd.style.transform = 'translateY('+KB.h+'px)'; kbd.style.visibility = 'hidden'; inputEl.style.transform = ''; phone.classList.remove('kbup'); fieldEl.classList.remove('focus','has');
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
