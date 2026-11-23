/* Motion Workbench shell. Holds no animation content: everything about the screen and the motion comes from
   ./motion-package.md (manifest, screen HTML/CSS, engine) and ./motion-engine.js (the same engine block as a file).
   Export "Motion package" writes the same file format back out, with the current values, fresh test vectors and the
   measured screen layout. Load a package (.md) to prime the workbench with another animation. */
(function(){
  const $ = id=>document.getElementById(id);
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const r1 = v=>Math.round(v*10)/10, r2 = v=>Math.round(v*100)/100;
  const newSeed = ()=>(Math.random()*2147483647)|0;
  const FENCE = /^````(\w+) motion:([\w-]+)[ \t]*\n([\s\S]*?)\n````[ \t]*$/gm;
  const PROSE = /<!-- motion:([\w-]+) -->\n([\s\S]*?)\n<!-- \/motion:\1 -->/g;

  let pkg = null, E = null, view = null, V = {}, DEF = {}, engineText = '';
  let variant = null, kind = 'enter', model = null, tNow = 0, playing = false, lastNow = 0, tlMode = false, raf = 0, opened = false;
  let ks = {};
  const STANDALONE = window.MWB_STANDALONE || null;   // pushed phone build: values baked in, no workbench
  const PROTO = !!STANDALONE || location.hash==='#prototype';     // controls-free view for phones / user tests (open via QR or link)
  if(PROTO) document.body.classList.add('proto');

  /* ================= PACKAGE: parse / load ================= */
  function parsePackage(md){
    const blocks = {}, prose = {}; let m;
    FENCE.lastIndex = 0; while((m = FENCE.exec(md))) blocks[m[2]] = m[3];
    PROSE.lastIndex = 0; while((m = PROSE.exec(md))) prose[m[1]] = m[2];
    const miss = ['manifest','screen-html','screen-css','engine'].filter(k=>!(k in blocks));
    if(miss.length) throw new Error('This file is not a motion package (missing: '+miss.join(', ')+').');
    const manifest = JSON.parse(blocks.manifest);
    if(!/^motion-package\//.test(manifest.format||'')) throw new Error('Unknown package format: '+manifest.format);
    return {md, blocks, prose, manifest};
  }
  function loadEngineText(js){
    return new Promise((res,rej)=>{
      const u = URL.createObjectURL(new Blob([js],{type:'text/javascript'})), s = document.createElement('script');
      s.src = u; s.onload = ()=>res(); s.onerror = ()=>rej(new Error('The browser blocked running the engine from this file.'));
      document.head.appendChild(s);
    });
  }
  const LS = ()=>'mwb:'+pkg.manifest.id;

  function start(p){
    if(view){ cancelAnimationFrame(raf); playing = false; }
    pkg = p; const man = p.manifest;
    document.title = (man.title||'Motion')+' · Workbench';
    (man.fontLinks||[]).forEach(href=>{ if(/^https:\/\/fonts\.googleapis\.com\//.test(href) && !document.querySelector('link[href="'+href+'"]')){
      const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; document.head.appendChild(l); } });
    $('screen-css').textContent = p.blocks['screen-css'];
    $('stage').innerHTML = p.blocks['screen-html'];
    $('stage').style.width = man.artboard.w+'px'; $('stage').style.height = man.artboard.h+'px';
    E = window.MotionEngine.create({spring: MotionLib.spring});
    DEF = E.defaults();
    V = Object.assign({}, DEF, JSON.parse(JSON.stringify(man.values||{})));
    variant = man.defaultVariant || man.variants[0].id;
    try{                                      // the viewer's own dial values win, unless the package was re-primed with newer values
      const s = JSON.parse(localStorage.getItem(LS())||'null');
      if(s && (s.rev||0) >= (man.valuesRevision||0)){ if(s.V) Object.assign(V, s.V); if(s.variant && man.variants.some(x=>x.id===s.variant)) variant = s.variant; }
    }catch(e){}
    if(p.remote && p.remote.values){ Object.assign(V, p.remote.values); if(p.remote.variant && man.variants.some(x=>x.id===p.remote.variant)) variant = p.remote.variant; }
    applyInteractionDefaults(man, V);
    E.setValues(V);
    ks = {}; man.variants.forEach(x=>ks[x.id] = {});
    model = null; tNow = 0; tlMode = false; opened = false;
    view = E.mount($('phone'), {
      onBlock: i=>{ if(opened) return; playKind('open',{i},true); },
      onPlus: ()=>{ if(!opened) return;
        if(tlMode && model && model.kind!=='open'){ pause(); hardReset(); updateBar(); return; }
        if(model && model.kind==='send' && ks[variant].send){ playKind('back',{from:'send',fromT:tNow},true); return; }
        if(model && model.kind==='focus'){ playKind('blur',{fromT:tNow},true); return; }
        if(ks[variant].open) playKind('back',{fromT:(tlMode&&kind==='open') ? tNow : Infinity},true); else { hardReset(); updateBar(); } },
      onTab: ()=>playKind('enter',undefined,true),
      onField: ()=>{ if(!E.modelFor(variant,'focus',{[variant]:{focus:{seed:1}}})) return;              // only variants that have Focus
        if(!opened || (model && (model.kind==='blur' || model.kind==='enter'))) playKind('focus',undefined,true); },
      onSend: text=>{ if(opened && model && model.kind==='focus' && text) playKind('send',{text},true); },
      onOutside: ()=>{ if(opened && model && model.kind==='focus') playKind('blur',{fromT:tNow},true); },
      opened: ()=>opened, variant: ()=>variant,
      realKeyboard: REALKB, scale: ()=>protoK });
    buildTabs(); buildChips(); renderPanel(); checkVectors(); fit();
    playKind('enter');
  }

  /* every press / tap that starts an animation uses the package's shared interaction default */
  function applyInteractionDefaults(man, vals){
    const press = man.interactionDefaults && man.interactionDefaults.pressMs; if(!(press>=0) || !E || !E.timeline) return;
    man.variants.forEach(v=>man.animations.forEach(a=>{ const k = E.timeline(v.id, a.id).tap.k; vals[k] = press; man.values[k] = press; }));
  }
  /* phone / test view: the newest values the designer saved (artifact database), live */
  async function remoteValues(){
    try{ const db = window.claude && claude.use ? await Promise.race([claude.use('db'), new Promise(r=>setTimeout(()=>r(null),4000))]) : null; if(!db) return null;
      const doc = db.doc('tweaks/current'), snap = await doc.get(); return {doc, data: snap.exists ? snap.data() : null}; }catch(e){ return null; } }
  async function boot(){
    let md = null;
    try{ const r = await fetch('./motion-package.md',{cache:'no-store'}); if(r.ok) md = await r.text(); }catch(e){}
    if(!md){ fail('No motion package found next to this page (motion-package.md).'); return; }
    let p; try{ p = parsePackage(md); }catch(e){ fail(e.message); return; }
    try{ const r = await fetch('./motion-engine.js',{cache:'no-store'}); engineText = r.ok ? await r.text() : ''; }catch(e){ engineText = ''; }
    if(!window.MotionEngine || engineText.trim()!==p.blocks.engine.trim()){
      try{ await loadEngineText(p.blocks.engine); engineText = p.blocks.engine; }
      catch(e){ if(!window.MotionEngine){ fail(e.message); return; } note('motion-engine.js differs from the package engine; using motion-engine.js.'); }
    }
    if(STANDALONE){ p.remote = STANDALONE; }
    else if(PROTO){ const r = await remoteValues(); if(r){ p.remote = r.data;
        r.doc.onSnapshot(sn=>{ if(!sn.exists || !pkg) return; const d = sn.data(); if(!d || !d.values) return;
          Object.assign(V, JSON.parse(JSON.stringify(d.values))); applyInteractionDefaults(pkg.manifest, V);
          if(d.variant && d.variant!==variant && pkg.manifest.variants.some(x=>x.id===d.variant)){ variant = d.variant; }
          if(model){ model = modelFor(variant,kind); if(tlMode) draw(); } }, ()=>{}); } }
    start(p);
  }
  function fail(msg){ $('stage').innerHTML = '<div class="wb-fail"><b>Can’t start the workbench.</b><br>'+msg+'</div>'; }
  function note(msg){ const n = $('wbNote'); n.textContent = msg; n.hidden = false; clearTimeout(n._t); n._t = setTimeout(()=>{ n.hidden = true; }, 6000); }

  /* ================= TEST VECTORS: does the engine still produce what the package promises? ================= */
  function checkVectors(){
    const b = $('vecBadge'), man = pkg.manifest, ref = man.vectors;
    if(!ref){ b.textContent = 'No test vectors'; b.className = 'vec warn'; b.title = 'Export the package once to add them.'; return; }
    let bad = 0, n = 0;
    Object.keys(ref).forEach(vr=>{ const got = E.vectors(vr, man.values);
      ['open','back','enter'].forEach(kd=>{ const a = ref[vr][kd], g = got[kd]; if(!a) return;
        n++; if(Math.abs(a.duration-g.duration)>.011) bad++;
        a.s.forEach((s,si)=>{ s.b.forEach((bb,j)=>bb.forEach((v,q)=>{ n++; if(Math.abs(v-g.s[si].b[j][q])>.011) bad++; }));
          ['intro','stu','tut'].forEach(k=>{ n++; if(Math.abs(s[k]-g.s[si][k])>.011) bad++; }); }); }); });
    b.textContent = bad ? 'Test vectors: '+bad+' of '+n+' differ' : 'Test vectors ✓';
    b.className = 'vec '+(bad?'bad':'ok');
    b.title = bad ? 'The engine no longer matches the values promised in the package (tolerance 0.01).' : n+' sampled values match the package (tolerance 0.01).';
  }

  /* ================= VARIANT TABS + ANIMATION CHIPS ================= */
  const vName = vr=>(pkg.manifest.variants.find(x=>x.id===vr)||{}).name||vr;
  const aName = kd=>(pkg.manifest.animations.find(x=>x.id===kd)||{}).name||kd;
  function buildTabs(){
    const el = $('vtabsBtns'); el.innerHTML = '';
    pkg.manifest.variants.forEach(x=>{ const b = document.createElement('button'); b.textContent = x.name; b.title = x.about||'';
      b.classList.toggle('on', x.id===variant); b.addEventListener('click',()=>{ if(variant!==x.id) setVariant(x.id); }); el.appendChild(b); });
  }
  function buildChips(){
    const el = $('kindSeg'); el.innerHTML = '';
    pkg.manifest.animations.filter(a=>!a.variants || a.variants.includes(variant)).forEach(a=>{ const b = document.createElement('button'); b.dataset.k = a.id; b.textContent = a.name; b.title = a.trigger||'';
      b.addEventListener('click',()=>gotoKind(a.id)); el.appendChild(b); });
  }
  function setVariant(v){ variant = v; buildTabs(); buildChips(); hardReset(); renderPanel(); save(); playKind('enter'); }

  /* ================= DIALKIT PANEL (one panel per animation) ================= */
  const DK = window.DialKit;
  DK.createDialRoot({position:'top-right',theme:'dark',versions:'menu',defaultOpen:true});
  let dkKit = null, dkFirst = true, LAB = {}, SPR = {}, dkTimer = 0, dkMark = 0;
  const markTotal = ()=>{ document.querySelectorAll('.dialkit-slider-label').forEach(l=>{ const w = l.closest('.dialkit-slider-wrapper'); if(w) w.classList.toggle('dk-total', /total duration/i.test(l.textContent)); }); };
  new MutationObserver(()=>{ if(!dkMark) dkMark = setTimeout(()=>{ dkMark = 0; markTotal(); },60); }).observe(document.body,{childList:true,subtree:true});
  function renderPanel(){
    if(dkKit){ try{ dkKit.destroy(); }catch(e){} dkKit = null; }
    const pn = E.panel(variant, kind); LAB = {}; SPR = {}; const cfg = {};
    const isDur = t=>/^dur/.test(t.k);
    // "Base" (the reference for change markers and reset) = the package's values, not the engine's raw defaults
    const pv = k=>{ const mv = pkg.manifest.values||{}; return JSON.parse(JSON.stringify(k in mv ? mv[k] : DEF[k])); };
    pn.tweaks.forEach(t=>{ t.def = pv(t.k); }); pn.springs.forEach(sp=>{ sp.def = pv(sp.k); });
    pn.tweaks.filter(isDur).forEach(t=>{ LAB[t.label] = t.k; cfg[t.label] = [t.def,t.min,t.max,t.step]; });
    pn.springs.forEach(s=>{ LAB[s.label] = s.k; SPR[s.k] = 1; cfg[s.label] = Object.assign({type:'spring'}, s.def); });
    pn.tweaks.filter(t=>!isDur(t)).forEach(t=>{ LAB[t.label] = t.k; cfg[t.label] = [t.def,t.min,t.max,t.step]; });
    dkFirst = true;
    dkKit = DK.createDialKit(vName(variant)+' · '+aName(kind), cfg, {id:'mwb-'+variant+'-'+kind, persist:false});
    const init = {};
    pn.tweaks.forEach(t=>{ if(V[t.k]!==t.def) init[t.label] = V[t.k]; });
    pn.springs.forEach(s=>{ if(JSON.stringify(V[s.k])!==JSON.stringify(s.def)) init[s.label] = Object.assign({type:'spring'}, V[s.k]); });
    if(Object.keys(init).length){ try{ dkKit.setValues(init); }catch(e){} }
    if(window.__mockAfterPanel) setTimeout(window.__mockAfterPanel, 0);
    dkKit.subscribe(vals=>{
      Object.keys(LAB).forEach(l=>{ const k = LAB[l], v = vals[l]; if(v===undefined) return;
        if(SPR[k]){ const o = Object.assign({},v); delete o.type; V[k] = o; } else V[k] = v; });
      if(dkFirst){ dkFirst = false; return; }
      save(); onTweak();
      clearTimeout(dkTimer); dkTimer = setTimeout(()=>{ if(model){ tNow = 0; play(); } },90);   // every change replays the animation
    });
  }

  /* ================= PERSISTENCE: browser + artifact db (so Claude can read the values) ================= */
  let dbDoc = null, syncT = null;
  (async()=>{ try{ if(window.claude && claude.use){ const db = await claude.use('db'); if(db) dbDoc = db.doc('tweaks/current'); } }catch(e){} })();
  function changedFrom(base){ const o = {}; Object.keys(V).forEach(k=>{ if(JSON.stringify(V[k])!==JSON.stringify(base[k])) o[k] = V[k]; }); return o; }
  function save(){
    try{ localStorage.setItem(LS(), JSON.stringify({V, variant, rev:pkg.manifest.valuesRevision||0})); }catch(e){}
    clearTimeout(syncT);
    syncT = setTimeout(()=>{ try{ if(dbDoc){ const p = dbDoc.set({package:pkg.manifest.id, variant, changedFromPackage:changedFrom(Object.assign({},DEF,pkg.manifest.values)), values:V, updatedAt:new Date().toISOString()}); if(p&&p.catch) p.catch(()=>{}); } }catch(e){} }, 500);
  }

  /* ================= PLAYER ================= */
  const modelFor = (vr,kd)=>E.modelFor(vr,kd,ks);
  function draw(){ if(model) view.draw(model, model.at(tNow)); }
  function enterTimeline(){ cancelAnimationFrame(raf); playing = false; tlMode = true; opened = true; view.enter(model); }
  function hardReset(){ cancelAnimationFrame(raf); playing = false; tlMode = false; opened = false; view.reset(); }
  function loop(now){
    if(!playing) return;
    tNow = Math.min(model.dur, tNow+(now-lastNow)); lastNow = now;
    draw(); updateBar();
    if(tNow>=model.dur){ playing = false; if(['back','enter','blur'].includes(model.kind)) hardReset(); updateBar(); } else raf = requestAnimationFrame(loop);
  }
  function play(){
    if(!model) return;
    if(!tlMode){ tNow = 0; enterTimeline(); }
    if(tNow>=model.dur-1) tNow = 0;
    playing = true; lastNow = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); updateBar();
  }
  function pause(){ playing = false; cancelAnimationFrame(raf); updateBar(); }
  function playKind(kd,extra,real){             // a trigger on the screen: new seed, start playing
    ks[variant][kd] = Object.assign({seed:newSeed()},extra);
    const kc = kind!==kd; kind = kd; model = modelFor(variant,kd); tNow = 0;
    if(kc && !PROTO) renderPanel();
    enterTimeline();
    if(real) tNow = model.tapLead || 0;         // a real finger/mouse already pressed: skip the simulated press (chips and Space keep it)
    draw(); playing = true; lastNow = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); updateBar();
  }
  function gotoKind(kd){                        // chips: replay the stored run, or create a default one
    if(kd==='back' && !ks[variant].open) ks[variant].open = {seed:newSeed(),i:0};
    if(kd==='back' && ks[variant].back) delete ks[variant].back.from;            // chip replays Back from Open
    if(kd==='blur' && !ks[variant].focus) ks[variant].focus = {seed:newSeed()};
    if(!ks[variant][kd]) ks[variant][kd] = kd==='open' ? {seed:newSeed(),i:0} : {seed:newSeed(),fromT:Infinity};
    const m = modelFor(variant,kd); if(!m) return;
    const kc = kind!==kd; kind = kd; model = m; tNow = 0; if(kc) renderPanel(); enterTimeline(); draw(); play();
  }
  function onTweak(){ const m = modelFor(variant,kind); if(!m) return; model = m; tNow = Math.min(tNow,model.dur); if(tlMode) draw(); updateBar(); }

  /* ================= TIMELINE BAR ================= */
  const tlPlay = $('tlPlay'), tlRange = $('tlRange'), tlTime = $('tlTime'), tlRoll = $('tlRoll'), tlExport = $('tlExport'), tlTicks = $('tlTicks');
  const ICON_PLAY = '<svg width="10" height="12" viewBox="0 0 10 12" fill="#222"><path d="M1 1l8 5-8 5z"/></svg>';
  const ICON_PAUSE = '<svg width="10" height="12" viewBox="0 0 10 12" fill="#222"><rect x="1" y="1" width="3" height="10"/><rect x="6" y="1" width="3" height="10"/></svg>';
  let lastPlaying = null;
  function updateBar(){
    if(PROTO) return;                           // phone view: no workbench bar to update
    const on = !!model;
    [tlPlay,tlRange,tlRoll].forEach(e=>e.disabled=!on); tlExport.disabled = false;
    $('kindSeg').querySelectorAll('button').forEach(b=>b.classList.toggle('on', b.dataset.k===kind));
    if(lastPlaying !== playing){ lastPlaying = playing; tlPlay.innerHTML = playing ? ICON_PAUSE : ICON_PLAY; }
    if(!on){ tlTime.textContent = 'Pick an animation'; tlTicks.innerHTML = ''; tlRange.value = 0; return; }
    tlRange.max = Math.round(model.dur); tlRange.value = Math.round(tNow);
    tlTime.textContent = (tNow/1000).toFixed(2)+' / '+(model.dur/1000).toFixed(2)+' s';
    let h = ''; for(let k=0;k<4;k++){ const f = model.motionEnd*k/3/model.dur; h += '<i style="left:calc(7px + (100% - 14px)*'+f+')"></i>'; }
    tlTicks.innerHTML = h;
    if(window.__mockTick) window.__mockTick();
  }
  tlPlay.addEventListener('click',()=>{ if(!model) return; if(playing) pause(); else play(); });
  tlRange.addEventListener('input',()=>{ if(!model) return; if(!tlMode) enterTimeline(); pause(); tNow = parseFloat(tlRange.value); draw(); updateBar(); });
  tlRoll.addEventListener('click',()=>{ if(!model) return; ks[variant][kind].seed = newSeed(); model = modelFor(variant,kind); tNow = 0; enterTimeline(); draw(); play(); });

  /* ================= EXPORT 1: keyframes for GIF / Figma (compact JSON for Claude) ================= */
  function exportJSON(mode){
    const end = model.motionEnd, fr = [];
    for(let k=0;k<4;k++){
      const t = end*k/3, st = model.at(t), f = {t:Math.round(t),blocks:st.blocks.map(b=>[r1(b.cx),r1(b.cy),r1(b.r),r2(b.s),r2(b.o)]),
        intro:r2(st.intro),touch:st.touch?[r1(st.touch.x),r1(st.touch.y),r2(st.touch.s),r2(st.touch.o),st.touch.cur?'cursor':'finger']:null,pressed:!!st.pressed,hover:st.hover===undefined?-1:st.hover,
        chat:[r2(st.stu),r2(st.tut),st.done?1:0],shake:[r1(st.shake[0]),r1(st.shake[1])]};
      if(st.morph) f.morph = {block:st.morph.i,surface:r2(st.morph.surface),chipLabel:[r2(st.morph.chip),r2(st.morph.chipScale)],messageLabel:[r2(st.morph.msg),r2(st.morph.msgScale)],studentText:st.stuText};
      fr.push(JSON.stringify(f));
    }
    const man = pkg.manifest, el = E.elements();
    const head = {kind:'motion-keyframes',package:man.id,packageTitle:man.title,phase:model.kind,variant:vName(variant),variantId:variant,
      clicked:model.kind==='open'?{index:model.i,label:el.blocks[model.i].label}:null,seed:model.seed,
      durationMs:Math.round(model.dur),exportedRangeMs:Math.round(end),changedTweaks:changedFrom(DEF),artboard:[man.artboard.w,man.artboard.h],blockSize:el.size,
      blocks:el.blocks.map(b=>({label:b.label,icon:b.icon,rest:[b.rest.cx,b.rest.cy,b.rest.r]})),
      format:man.keyframeFormat||'frames[].blocks[j]=[centerX,centerY,rotationDeg,scale,opacity] in artboard px'};
    head.deliver = mode==='fig' ? ['figma'] : mode==='gif' ? ['gif'] : ['gif','figma'];
    head.gif = {fps:30,scale:2,range:[0,Math.round(end)],holdEndMs:1000,note:'render deterministically from the package + seed + changedTweaks; also deliver mp4'};
    if(mode==='gif') return JSON.stringify(head);
    return JSON.stringify(head).slice(0,-1)+',"frames":[\n'+fr.join(',\n')+'\n]}';
  }

  /* ================= EXPORT 2: the motion package (developer handoff = workbench primer) ================= */
  const hex = c=>{ const m = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/.exec(c||''); if(!m) return c||'';
    if(m[4]!==undefined && +m[4]===0) return 'none'; const h = '#'+[m[1],m[2],m[3]].map(x=>(+x).toString(16).padStart(2,'0')).join('');
    return m[4]!==undefined && +m[4]<1 ? h+' @'+Math.round(m[4]*100)+'%' : h; };
  function measure(state){
    const phEl = $('phone'), ph = phEl.getBoundingClientRect(), s = ph.width/pkg.manifest.artboard.w;
    return view.specTargets(state).filter(x=>x[1]).map(([name,el])=>{
      const q = el.getBoundingClientRect(), cs = getComputedStyle(el), txt = el.children.length ? '' : (el.value!==undefined && el.placeholder ? el.placeholder : el.textContent.trim());
      const font = txt ? cs.fontWeight+' '+parseFloat(cs.fontSize)+'/'+(cs.lineHeight==='normal'?'normal':parseFloat(cs.lineHeight))+' '+cs.fontFamily.split(',')[0].replace(/["']/g,'') : '';
      const bw = parseFloat(cs.borderTopWidth), blk = el.closest('.block');
      let x, y, w, h;
      if(blk){                       // inside a block: block-local position (unrotated), from the block's outer top-left
        const tr = blk.style.transition, rr = blk.style.getPropertyValue('--r');
        blk.style.transition = 'none'; blk.style.setProperty('--r','0deg');
        const b = blk.getBoundingClientRect(), e = el.getBoundingClientRect();
        x = (e.left-b.left)/s; y = (e.top-b.top)/s; w = e.width/s; h = e.height/s;
        blk.style.setProperty('--r', rr); void blk.offsetWidth; blk.style.transition = tr;
      } else { x = (q.left-ph.left)/s-phEl.clientLeft; y = (q.top-ph.top)/s-phEl.clientTop; w = q.width/s; h = q.height/s; }
      return {name, x:r2(x), y:r2(y), w:r2(w), h:r2(h), font, color:txt?hex(cs.color):'',
        fill:hex(cs.backgroundColor), border:bw?r2(bw)+'px '+hex(cs.borderTopColor):'', radius:cs.borderTopLeftRadius!=='0px'?cs.borderTopLeftRadius:'', shadow:cs.boxShadow!=='none'?cs.boxShadow:'', text:txt.slice(0,60)};
    });
  }
  function measureLayout(){
    const keep = {model, tNow, tlMode, kind, playing}; pause();
    hardReset(); const home = measure('home');
    const tmp = E.modelFor(variant,'open',{[variant]:{open:{seed:1,i:1}}});
    view.enter(tmp); view.draw(tmp, tmp.at(tmp.dur)); const chat = measure('chat');
    hardReset();
    model = keep.model; tNow = keep.tNow; kind = keep.kind;
    if(keep.tlMode && model){ enterTimeline(); draw(); } updateBar();
    return {home, chat};
  }
  const mdTable = (head, rows)=>'| '+head.join(' | ')+' |\n|'+head.map(()=>'---').join('|')+'|\n'+rows.map(r=>'| '+r.map(c=>String(c===undefined?'':c).replace(/\|/g,'\\|').replace(/\n/g,' ')).join(' | ')+' |').join('\n');
  const fmtV = v=>typeof v==='object' && v ? (v.visualDuration!==undefined ? 'spring { visualDuration: '+v.visualDuration+' s, bounce: '+v.bounce+' }' : 'spring { stiffness: '+v.stiffness+', damping: '+v.damping+', mass: '+v.mass+' }') : String(v);
  function packageMarkdown(){
    const man = JSON.parse(JSON.stringify(pkg.manifest)), el = E.elements(), layout = measureLayout();
    man.values = JSON.parse(JSON.stringify(V)); man.layout = layout; man.elements = el;
    man.vectorSeeds = {open:{block:1,seed:12345}, back:{seed:777, from:'open run above, played to the end'}, enter:{seed:999}};
    man.vectors = {}; man.variants.forEach(x=>{ man.vectors[x.id] = E.vectors(x.id, man.values); });
    man.exportedAt = new Date().toISOString();
    const lay = rows=>mdTable(['Element','x','y','w','h','Type','Color','Fill','Border / radius','Content'],
      rows.map(r=>[r.name,r.x,r.y,r.w,r.h,r.font,r.color,r.fill,[r.border,r.radius&&('r '+r.radius)].filter(Boolean).join(', '),r.text]));
    const vals = man.variants.map(x=>'### '+x.name+(x.about?' · '+x.about:'')+'\n\n'+man.animations.map(a=>{ const pn = (E.panelAll||E.panel)(x.id,a.id);
      return '**'+a.name+'** ('+a.trigger+')\n\n'+mdTable(['Tweak','Value','Default','Range','Key'],
        pn.tweaks.map(t=>[t.label, man.values[t.k], t.def, t.min+' … '+t.max, t.k]).concat(pn.springs.map(s=>[s.label, fmtV(man.values[s.k]), fmtV(s.def), '', s.k]))); }).join('\n\n')).join('\n\n');
    const durs = mdTable(['Variant','Open','Back','Enter'], man.variants.map(x=>[x.name].concat(['open','back','enter'].map(k=>man.vectors[x.id][k].duration+' ms'))));
    const assetsMd = ()=>{
      const as = view.assets ? view.assets() : {}, names = Object.keys(as).filter(k=>as[k]);
      const size = (k,d)=>{ if(/\.png$/.test(k)) return 'PNG, '+(d.length/1.37/1024).toFixed(1)+' KB'; const w = /width="([\d.]+)"/.exec(d), h = /height="([\d.]+)"/.exec(d); return 'SVG'+(w&&h?', '+w[1]+' × '+h[1]:''); };
      return 'Save each file as `assets/ai_tutor/<name>` (the paths the code above uses). SVGs are the exact artwork from the screen; the PNG is a base64 data URI to decode into the file.\n\n'
        + mdTable(['File','Format'], names.map(k=>['`'+k+'`', size(k,as[k])])) + '\n\n'
        + names.map(k=>'**'+k+'**\n\n```'+(/\.png$/.test(k)?'text':'svg')+'\n'+as[k]+'\n```').join('\n\n');
    };
    const rp = E.refParams(), sub =(src,txt)=>src.replace(/\/\/ <<PARAMS[\s\S]*?\/\/ PARAMS>>/,()=>txt.trim());
    const F = '````';
    return [
      '# '+man.title+' · motion package',
      '',
      '> One file for the developer and for the Motion Workbench. People read the sections; the workbench loads the blocks tagged `motion:…` (manifest, screen-html, screen-css, engine). Exported '+man.exportedAt.slice(0,16).replace('T',' ')+' UTC · package `'+man.id+'` · format `'+man.format+'`.',
      '',
      '## 1. Screen: '+(man.screen||'layout'),
      '',
      'Artboard '+man.artboard.w+' × '+man.artboard.h+' px; scale the whole artboard once (width / '+man.artboard.w+'), never per element. Fonts: '+(man.fonts||'see screen-css')+'.',
      '',
      ...(pkg.blocks['screen-dart']||pkg.blocks['screen-react'] ? [
        'The screen as code, for Flutter and for the web (React). Both place every element at its designed position on the artboard and take the engine’s frame (`modelFor(variant, kind, runs).at(t)`, section 6) as input, so only the animated parts move; with `frame = null` they show the resting home screen. The asset files they load are in 1c.',
        '',
        ...(pkg.blocks['screen-dart'] ? ['### 1a. Flutter (ai_tutor_screen.dart)', '', F+'dart motion:screen-dart', pkg.blocks['screen-dart'], F, ''] : []),
        ...(pkg.blocks['screen-react'] ? ['### 1b. Web / React (AiTutorScreen.tsx)', '', F+'tsx motion:screen-react', pkg.blocks['screen-react'], F, ''] : []),
        '### 1c. Assets', '', assetsMd(), ''
      ] : [
        'Positions are the element’s top-left in artboard px, measured from the screen markup in section 6.', '',
        '### Home (empty state, blocks at rest)', '', lay(layout.home), '',
        '### Chat (after Open)', '', lay(layout.chat), ''
      ]),
      '## 2. Animated elements (element contract)',
      '',
      'Each block is '+el.size[0]+' × '+el.size[1]+' px. The engine only outputs a pose per block index (centre x/y, rotation, resize factor, opacity) and opacity / offset for the text layers; content and styling stay in the screen.',
      '',
      mdTable(['#','Label','Icon','Rest centre x','Rest centre y','Rotation'], el.blocks.map(b=>[b.index,b.label,b.icon,b.rest.cx,b.rest.cy,b.rest.r+'°'])),
      '',
      'Text layers: '+el.textLayers.join('; ')+'. Triggers: '+Object.entries(el.triggers).map(([k,v])=>k+' = '+v).join('; ')+'.',
      '',
      '## 3. Animations and rules',
      '',
      '<!-- motion:rules -->', (pkg.prose.rules||'').trim(), '<!-- /motion:rules -->',
      '',
      '## 4. Values (current)',
      '', vals, '',
      '## 5. Test vectors',
      '',
      'Sampled with the values above and fixed seeds (Open: block 1, seed 12345 · Back: seed 777 after that Open · Enter: seed 999) at T = '+man.vectors[man.variants[0].id].T.join(', ')+' ms (tap lead included). Each frame: blocks [cx, cy, rotation°, scale, opacity] + intro / student / tutor opacity. Data: `vectors` in the manifest. An implementation matches when every value is within 0.01. Durations:',
      '', durs, '',
      '## 6. Machine-readable blocks',
      '',
      'Keep these four blocks intact: the Motion Workbench loads them. `engine` is plain JS (reference implementation); it needs Motion’s `spring()` generator (`motion` package) passed in as `ctx.spring`.',
      '',
      F+'json motion:manifest', JSON.stringify(man), F, '',
      F+'html motion:screen-html', pkg.blocks['screen-html'], F, '',
      F+'css motion:screen-css', pkg.blocks['screen-css'], F, '',
      F+'js motion:engine', engineText.trim(), F, '',
      '## 7. Reference code (V2 handoff, current V2 values)',
      '',
      'Ported reference implementations of variant V2 for web and Flutter, same maths as the engine. Not read by the workbench.',
      '',
      rp.table, '',
      F+'ts motion:ref-ts', sub(pkg.blocks['ref-ts']||'', rp.ts), F, '',
      F+'dart motion:ref-dart', sub(pkg.blocks['ref-dart']||'', rp.dart), F, ''
    ].join('\n');
  }

  /* ================= EXPORT UI ================= */
  const tlCopy = $('tlCopy'), tlText = $('tlText'), tlCopyMsg = $('tlCopyMsg'), tlMenu = $('tlMenu'), tlExportMenu = $('tlExportMenu');
  const EXP_LABEL = {both:'GIF + Figma',gif:'GIF',fig:'Figma',pkg:'Package'};
  let expKind = 'both';
  try{ const s = localStorage.getItem('mwb-export'); if(EXP_LABEL[s]) expKind = s; }catch(e){}
  async function downloadText(name,text){ try{ const d = window.claude && await window.claude.use('downloads'); if(!d) return false; await d.save({filename:name,data:text}); return true; }catch(e){ return false; } }
  function showCopy(msg, str, ok){
    tlCopyMsg.textContent = msg; tlText.value = str; tlCopy.style.display = 'block'; if(!ok){ tlText.focus(); tlText.select(); }
    clearTimeout(tlCopy._t); tlCopy._t = setTimeout(()=>{ tlCopy.style.display='none'; }, ok?4500:15000);
  }
  async function doExport(){
    if(expKind==='pkg'){
      const str = packageMarkdown(); let ok = false;
      try{ await navigator.clipboard.writeText(str); ok = true; }catch(e){}
      const name = pkg.manifest.id+'.motion.md', dl = await downloadText(name, str);
      showCopy((dl?'Downloaded '+name+(ok?' and copied':''):(ok?'Copied':'Copy this'))+'. Give it to the developer, or to Claude to set up a workbench with it.', str, ok||dl);
      return;
    }
    if(!model) return;
    const str = exportJSON(expKind); let ok = false;
    try{ await navigator.clipboard.writeText(str); ok = true; }catch(e){}
    const what = expKind==='fig' ? 'build the Figma frames' : expKind==='gif' ? 'render the GIF' : 'render the GIF and build the Figma frames';
    showCopy(ok ? 'Copied. Paste it to Claude to '+what+'.' : 'Copy this and paste it to Claude to '+what+'.', str, ok);
  }
  function setExp(m){ expKind = m; $('tlExpLbl').textContent = EXP_LABEL[m]; tlMenu.querySelectorAll('button[data-m]').forEach(b=>b.classList.toggle('on',b.dataset.m===m)); try{ localStorage.setItem('mwb-export',m); }catch(e){} }
  setExp(expKind);
  tlExport.addEventListener('click',doExport);
  tlExportMenu.addEventListener('click',e=>{ e.stopPropagation(); tlCopy.style.display='none'; tlMenu.classList.toggle('open'); });
  tlMenu.addEventListener('click',e=>{ const b = e.target.closest('button'); if(!b) return; tlMenu.classList.remove('open');
    if(b.dataset.m){ setExp(b.dataset.m); doExport(); } else if(b.id==='loadPkg') $('pkgFile').click(); });
  document.addEventListener('click',()=>tlMenu.classList.remove('open'));
  tlCopy.addEventListener('click',()=>clearTimeout(tlCopy._t));

  /* ================= IMPORT: prime the workbench with a package ================= */
  $('pkgFile').addEventListener('change', async e=>{
    const f = e.target.files && e.target.files[0]; e.target.value = ''; if(!f) return;
    try{
      const p = parsePackage(await f.text());
      if(p.blocks.engine.trim()!==engineText.trim()){ await loadEngineText(p.blocks.engine); engineText = p.blocks.engine; }
      start(p); note('Loaded “'+p.manifest.title+'” for this session. To keep it as this workbench, give the file to Claude.');
    }catch(err){ note(err.message+' Give the file to Claude to set up a workbench with it.'); }
  });

  /* ================= FIT ================= */
  /* Phone build on a touch screen: native keyboard, same approach as BR-7147: the page never scrolls, the screen stays pinned
     to the visible area (iOS pans it when the keyboard opens), the scale is fixed (the keyboard must not shrink the screen),
     and the scroll is reset after the keyboard closes. */
  const REALKB = PROTO && matchMedia('(pointer:coarse)').matches;
  let protoK = 0, protoH = 0;
  if(REALKB){ document.documentElement.style.cssText += ';overflow:hidden;height:100%;overscroll-behavior:none';
    document.body.style.cssText += ';overflow:hidden;height:100%;overscroll-behavior:none';
    if(window.visualViewport){ visualViewport.addEventListener('resize', fit); visualViewport.addEventListener('scroll', fit); }
    document.addEventListener('focusout', ()=>setTimeout(()=>{ window.scrollTo(0,0); fit(); },120)); }
  function fit(){
    const tl = $('tl'), tlh = tl.offsetHeight+24; document.body.style.setProperty('--tlh', tlh+'px');
    if(!pkg) return; const a = pkg.manifest.artboard;
    if(PROTO){ // on the home screen iOS draws the real status bar above the page, so the artboard's own status-bar strip is cropped
      const home = navigator.standalone===true || matchMedia('(display-mode: standalone)').matches, sb = home ? (a.statusBar||0) : 0;
      const typing = REALKB && document.activeElement && document.activeElement.tagName==='INPUT';
      if(!typing || !protoK){ protoH = window.innerHeight; protoK = Math.min(window.innerWidth/a.w, protoH/(a.h-sb)); }   // keyboard up: keep the scale
      if(REALKB && (window.scrollY || window.scrollX)) window.scrollTo(0,0);   // iOS scrolls the page to reveal the field: undo it (the field moves itself)
      const k = protoK, vv = window.visualViewport, pan = REALKB && vv ? (vv.pageTop || 0) : 0;
      $('stage').style.transform = 'translateY('+(-sb*k/2+pan)+'px) scale('+k+')'; return; }
    const s = Math.min((window.innerHeight-44-tlh-8)/a.h, ((window.innerWidth<=820?window.innerWidth:window.innerWidth-304)-16)/a.w, 1.6);
    $('stage').style.transform = 'scale('+s+')';
  }
  window.addEventListener('resize', fit);
  document.addEventListener('keydown', e=>{
    if(e.code!=='Space' || e.metaKey || e.ctrlKey || e.altKey || PROTO) return;
    const t = e.target, typing = t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !/^(range|button|checkbox)$/.test(t.type||''));
    if(typing) return; e.preventDefault(); if(pkg) gotoKind(kind);
  });
  window.__mwb = { model:()=>model, V:()=>V, dk:()=>dkKit, LAB:()=>LAB, pkg:()=>pkg, play, pause, gotoKind, setVariant,
    seek:t=>{ if(!model) return; if(!tlMode) enterTimeline(); pause(); tNow = t; draw(); updateBar(); },
    retime:()=>{ save(); onTweak(); clearTimeout(dkTimer); dkTimer = setTimeout(()=>{ if(model){ tNow = 0; play(); } },90); },
    packageMarkdown, exportJSON:m=>exportJSON(m), engine:()=>E, values:()=>V, setRun:(vr,kd,run)=>{ ks[vr][kd] = run; },
    show:(vr,kd,run,t)=>{ if(variant!==vr){ variant = vr; buildTabs(); } ks[vr][kd] = run; const kc = kind!==kd; kind = kd; model = modelFor(vr,kd); if(kc) renderPanel(); pause(); enterTimeline(); tNow = t; draw(); updateBar(); return model.dur; }, modelFor:(vr,kd,K)=>E.modelFor(vr,kd,K), state:()=>({variant,kind,tNow,opened,tlMode})};
  updateBar(); fit(); boot();
})();
