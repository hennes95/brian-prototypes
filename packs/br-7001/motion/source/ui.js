/* Workbench UI layer. Generic: everything about dials and clips comes from the engine
   (panel(...).tweaks[].role and timeline(...)); nothing here knows a dial name. */
(function(){
  const $ = id=>document.getElementById(id);
  const ANIMS = ['open','back','enter'];
  const same = (a,b)=>JSON.stringify(a)===JSON.stringify(b);
  /* ---------- the panel shows only "feel" dials + curves; the engine tags every dial with its role ---------- */
  const create = MotionEngine.create;
  MotionEngine.create = function(ctx){ const E = create(ctx), panel = E.panel;
    E.panelAll = panel;
    E.panel = (vr,kd)=>{ const p = panel(vr,kd); return {tweaks:p.tweaks.filter(t=>t.role==='feel' || t.role==='duration'), springs:p.springs}; };   // duration + curve + feel
    window.__E = E; return E; };
  const E = ()=>window.__E, st = ()=>__mwb.state(), V = ()=>__mwb.V(), DS = ()=>DialKit.DialStore;
  const pkgValue = k=>{ const man = __mwb.pkg().manifest; return k in man.values ? man.values[k] : E().defaults()[k]; };
  const pressMs = ()=>((__mwb.pkg().manifest.interactionDefaults||{}).pressMs);
  const tweakOf = (vr,kd,k)=>E().panelAll(vr,kd).tweaks.find(t=>t.k===k);
  const offPanel = (vr,kd)=>E().panelAll(vr,kd).tweaks.filter(t=>t.role==='timing' || t.role==='interaction').map(t=>t.k);

  /* ---------- versions hold ALL values: DialKit keeps the panel values, we keep the rest per version ---------- */
  const extra = {}, lastActive = {};          // extra[panelId][presetId] = {key: value}
  const pid = (vr,kd)=>'mwb-'+vr+'-'+kd;
  function refOff(vr,kd,k){ const id = pid(vr,kd), act = DS().getActivePresetId(id); const snap = act && extra[id] && extra[id][act];
    return snap && k in snap ? snap[k] : pkgValue(k); }
  function refPanel(id){ const ds = DS(), act = ds.getActivePresetId(id); if(act){ const p = ds.getPresets(id).find(x=>x.id===act); if(p) return p.values; } return ds.baseValues.get(id) || {}; }
  let saving = false;
  /* ---------- versions persist: in the browser and in the artifact database (so they survive reloads and Claude can read them) ---------- */
  const VKEY = ()=>'mwb-versions:'+__mwb.pkg().manifest.id, restored = {};
  let vstore = null, vdoc = null, vT = 0;
  function loadVStore(){ if(vstore) return vstore; try{ vstore = JSON.parse(localStorage.getItem(VKEY())||'null'); }catch(e){} return vstore = vstore || {}; }
  (async()=>{ try{ const db = window.claude && claude.use ? await claude.use('db') : null; if(!db) return; vdoc = db.doc('versions/all');
    const sn = await vdoc.get(); const local = loadVStore();
    if(sn.exists && !Object.keys(local).some(k=>k!=='_at')){ const d = sn.data(); if(d && d.panels){ vstore = Object.assign({}, d.panels, {_at:d.at}); Object.keys(restored).forEach(k=>delete restored[k]); if(window.__mockAfterPanel) window.__mockAfterPanel(); } }
  }catch(e){} })();
  function persistVersions(id){ const ds = DS(), sto = pruneVStore(loadVStore());
    sto[id] = {presets: ds.getPresets(id).map(p=>({id:p.id, name:p.name, values:p.values})), active: ds.getActivePresetId(id)||null, extra: extra[id]||{}};
    sto._at = new Date().toISOString();
    try{ localStorage.setItem(VKEY(), JSON.stringify(sto)); }catch(e){}
    clearTimeout(vT); vT = setTimeout(()=>{ if(!vdoc) return; const panels = JSON.parse(JSON.stringify(sto)), at = panels._at; delete panels._at; const r = vdoc.set({panels, at}); if(r && r.catch) r.catch(()=>{}); }, 600); }
  const knownPanel = id=>{ try{ const m = __mwb.pkg().manifest; return m.variants.some(v=>m.animations.some(a=>pid(v.id,a.id)===id)); }catch(e){ return true; } };
  function pruneVStore(sto){ Object.keys(sto).forEach(k=>{ if(k!=='_at' && !knownPanel(k)) delete sto[k]; }); return sto; }
  function restoreVersions(id){ if(restored[id]) return; restored[id] = 1; const sv = pruneVStore(loadVStore())[id]; const ds = DS();
    if(!sv || !sv.presets || !sv.presets.length || ds.getPresets(id).length) return;
    ds.presets.set(id, sv.presets.map(p=>({id:p.id, name:p.name, values:JSON.parse(JSON.stringify(p.values))})));
    ds.activePreset.set(id, sv.active||null); extra[id] = sv.extra||{}; lastActive[id] = sv.active||null; ds.commit(id); }
  function onStore(){ const s = st(), id = pid(s.variant,s.kind), act = DS().getActivePresetId(id) || null;
    if(!saving && lastActive[id]!==undefined && lastActive[id]!==act){ offPanel(s.variant,s.kind).forEach(k=>{ V()[k] = refOff(s.variant,s.kind,k); }); __mwb.retime(); }
    lastActive[id] = act;
    // versions made from DialKit's own "New version" menu also get the timeline values
    DS().getPresets(id).forEach(p=>{ extra[id] = extra[id] || {}; if(!extra[id][p.id]) extra[id][p.id] = Object.fromEntries(offPanel(s.variant,s.kind).map(k=>[k, JSON.parse(JSON.stringify(V()[k]))])); });
    if(!saving) persistVersions(id);
    setTimeout(()=>{ decorate(); renderTracks(); }, 0); }

  /* ---------- markers: dot left of every changed dial; hover the dot = reset; ⌘R on a hovered dial ---------- */
  const FIELD = {'Bounce':'bounce','Duration':'visualDuration','Stiffness':'stiffness','Damping':'damping','Mass':'mass'};
  let hover = null;
  // panel dots live in their own layer in the panel's left column (DialKit's folders would cover them); elsewhere they sit in the host
  const gutterOf = host=>host.closest('.dialkit-root') ? document.querySelector('.dialkit-root .dialkit-panel-inner') : null;
  function placeDots(){ const inner = document.querySelector('.dialkit-root .dialkit-panel-inner'); if(!inner) return; const ir = inner.getBoundingClientRect();
    inner.querySelectorAll(':scope > .mk-dot').forEach(d=>{ const h = d._host; if(!h || !h.isConnected){ d.remove(); return; }
      const r = h.getBoundingClientRect(); d.style.top = (r.top - ir.top + inner.scrollTop + r.height/2 - inner.clientTop)+'px'; d.style.display = r.height ? '' : 'none'; }); }
  function dot(host, ch, reset){
    const gut = gutterOf(host);
    let d = gut ? host._mkDot : host.querySelector(':scope > .mk-dot');
    if(d && gut && !d.isConnected) d = null;
    if(!d){ d = document.createElement('button'); d.type = 'button'; d.className = 'mk-dot'; d.title = 'Reset (⌘R)'; d._host = host;
      d.addEventListener('pointerdown', e=>{ e.preventDefault(); e.stopPropagation(); d._reset && d._reset(); });
      if(gut){ gut.appendChild(d); host._mkDot = d; if(!gut._mkScroll){ gut._mkScroll = 1; gut.addEventListener('scroll', placeDots, {passive:true}); } } else host.appendChild(d); }
    d._reset = reset; d.hidden = !ch; host.classList.toggle('mk-changed', ch);
    host._mkReset = ch ? reset : null;
    if(!host._mkHover){ host._mkHover = 1; host.addEventListener('mouseenter',()=>hover = host); host.addEventListener('mouseleave',()=>{ if(hover===host) hover = null; }); }
  }
  function countChanges(vr,kd){
    const id = pid(vr,kd); let n = 0;
    // count dials, not sections: a curve counts each of its changed values (bounce, duration, …) separately
    const diff = (a,b)=>{ if(a && b && typeof a==='object' && typeof b==='object'){ let c = 0; new Set([...Object.keys(a),...Object.keys(b)]).forEach(f=>{ if(!same(a[f],b[f])) c++; }); return c; } return same(a,b) ? 0 : 1; };
    try{ const vals = DS().getValues(id), ref = refPanel(id); if(vals) Object.keys(vals).forEach(k=>{ if(k in ref) n += diff(vals[k],ref[k]); }); }catch(e){}
    offPanel(vr,kd).forEach(k=>{ if(!same(V()[k], refOff(vr,kd,k))) n++; });
    return n;
  }
  /* errors from the panel code go to the artifact database (debug/last), so Claude can read what broke in a viewer's browser */
  let errDb = null; (async()=>{ try{ errDb = window.claude && claude.use ? await claude.use('db') : null; }catch(e){} })();
  function report(where, e){ try{ console.error('[mwb] '+where, e); if(errDb) errDb.doc('debug/last').set({where, msg:String(e && e.message || e), stack:String(e && e.stack || '').slice(0,1500), at:new Date().toISOString(), ua:navigator.userAgent}).catch(()=>{}); }catch(_){} }
  window.addEventListener('error', ev=>report('window', ev.error || ev.message));
  window.addEventListener('unhandledrejection', ev=>report('promise', ev.reason));
  function decorate(){ try{ decorate0(); }catch(e){ report('decorate', e); } }
  function decorate0(){
    const kit = __mwb.dk(); if(!kit) return; const id = kit.id, ds = DS(), s = st();
    try{ if(ds.getBaseName(id)!=='Base') ds.renamePreset(id, null, 'Base'); }catch(e){}
    const vals = ds.getValues(id), ref = refPanel(id), norm = x=>String(x||'').replace(/\s+/g,''), keyOf = {};
    Object.keys(vals||{}).forEach(k=>keyOf[norm(k)] = k);
    const setVal = (lab,v)=>kit.setValues({[lab]: v && typeof v==='object' ? Object.assign({type:'spring'}, v) : v});
    document.querySelectorAll('.dialkit-root .dialkit-folder:not(.dialkit-folder-root)').forEach(f=>{   // curves
      const h = f.querySelector('.dialkit-folder-title-row'), lab = h && keyOf[norm(h.textContent)]; if(!lab) return;
      dot(h.parentElement, !same(vals[lab], ref[lab]), ()=>setVal(lab, ref[lab]));
      f.querySelectorAll('.dialkit-slider-wrapper').forEach(w=>{ const fl = FIELD[(w.querySelector('.dialkit-slider-label')||{}).textContent]; if(!fl) return;
        const a = (vals[lab]||{})[fl], b = (ref[lab]||{})[fl];
        dot(w, a!==undefined && b!==undefined && a!==b, ()=>setVal(lab, Object.assign({}, vals[lab], {[fl]: b}))); });
    });
    document.querySelectorAll('.dialkit-root .dialkit-slider-wrapper').forEach(w=>{                        // plain dials
      const raw = (w.querySelector('.dialkit-slider-label')||{}).textContent, lab = keyOf[norm(raw)]; if(!lab || FIELD[(raw||'').trim()] || w.closest('.dialkit-folder:not(.dialkit-folder-root)')) return;
      dot(w, !same(vals[lab], ref[lab]), ()=>setVal(lab, ref[lab]));
    });
    const inner = document.querySelector('.dialkit-root .dialkit-panel-wrapper'); if(!inner) return;
    let foot = inner.querySelector(':scope > .mk-foot');
    if(!foot){ foot = document.createElement('div'); foot.className = 'mk-foot';
      foot.innerHTML = '<button type="button" class="mk-num" title="Reset all changes (⌘R)"><span class="mk-n"></span><svg class="mk-r" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8a5 5 0 1 0 1.6-3.7"/><path d="M3 2.5v3h3"/></svg></button><button type="button" class="mk-save">Save</button>';
      foot.querySelector('.mk-save').addEventListener('click', save);
      const num = foot.querySelector('.mk-num'); num.addEventListener('click', e=>{ e.preventDefault(); e.stopPropagation(); resetAll(); }); num._mkReset = resetAll;
      num.addEventListener('mouseenter',()=>hover = num); num.addEventListener('mouseleave',()=>{ if(hover===num) hover = null; });
      inner.appendChild(foot); }
    const n = countChanges(s.variant,s.kind), num = foot.querySelector('.mk-num');
    num.querySelector('.mk-n').textContent = n; num.setAttribute('aria-label', n+' changes, reset all'); num.hidden = !n; foot.querySelector('.mk-save').disabled = !n;
    document.querySelectorAll('#kindSeg button').forEach(b=>b.classList.toggle('mk-dirty', countChanges(s.variant,b.dataset.k)>0));
    const tn = E().panelAll(s.variant,s.kind).tweaks.filter(t=>t.role==='timing' && !same(V()[t.k], refOff(s.variant,s.kind,t.k))).length, tb = timingBtn.querySelector('.mk-tnum');
    tb.textContent = tn; tb.hidden = !tn;
    placeDots();
  }
  function resetAll(){ try{ resetAll0(); }catch(e){ report('reset', e); } }
  function resetAll0(){ const s = st(), kit = __mwb.dk(); if(!kit) return; const ref = refPanel(kit.id), up = {};
    Object.keys(ref).forEach(l=>{ const v = ref[l]; up[l] = v && typeof v==='object' ? Object.assign({type:'spring'}, v) : v; });
    offPanel(s.variant,s.kind).forEach(k=>{ V()[k] = refOff(s.variant,s.kind,k); });
    kit.setValues(up); __mwb.retime(); setTimeout(()=>{ decorate(); renderTracks(); }, 120); toast('All changes reset'); }
  function save(){ const s = st(), kit = __mwb.dk(), ds = DS(), n = ds.getPresets(kit.id).length + 2;
    const snap = Object.fromEntries(offPanel(s.variant,s.kind).map(k=>[k, JSON.parse(JSON.stringify(V()[k]))]));
    saving = true; let id; try{ id = ds.savePreset(kit.id, 'Save '+n); } finally { saving = false; } extra[kit.id] = extra[kit.id] || {};
    extra[kit.id][id] = snap;
    lastActive[kit.id] = id; persistVersions(kit.id); toast('Saved as “Save '+n+'”'); setTimeout(()=>{ decorate(); renderTracks(); }, 30); }
  window.__mockAfterPanel = ()=>{ const kit = __mwb.dk(); if(kit) restoreVersions(kit.id); if(kit && !kit._mk){ kit._mk = 1; DS().subscribe(kit.id, onStore); } decorate(); renderTracks(); };
  new MutationObserver(()=>{ clearTimeout(window._mkT); window._mkT = setTimeout(decorate, 80); }).observe(document.body,{childList:true,subtree:true});

  /* ---------- timeline, built from engine.timeline(variant, animation) ---------- */
  const tl = $('tl'), r1 = tl.querySelector('.r1'), r2 = tl.querySelector('.r2');
  const tracks = document.createElement('div'); tracks.className = 'mk-tracks'; tl.appendChild(tracks);
  const ctr = document.createElement('div'); ctr.className = 'mk-ctr'; ctr.append($('tlPlay'), $('tlTime'));
  const sp = document.createElement('span'); sp.style.flex = '1';
  const inter = document.createElement('button'); inter.type = 'button'; inter.className = 'mk-set'; inter.title = 'Settings'; inter.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>';
  const timingBtn = document.createElement('button'); timingBtn.type = 'button'; timingBtn.className = 'mk-btn mk-timing'; timingBtn.innerHTML = 'Timing<span class="mk-tnum" hidden></span>';
  timingBtn.title = 'Show the timing of the sub-animations';
  $('tlRoll').style.display = 'none'; $('vtabs').appendChild(inter); r1.append(ctr, sp, timingBtn, tl.querySelector('.split')); r2.style.display = 'none';
  let timingOpen = false; try{ timingOpen = localStorage.getItem('mwb-timing-open')==='1'; }catch(e){}
  function setTiming(o){ timingOpen = o; tracks.hidden = !o; timingBtn.classList.toggle('on', o); try{ localStorage.setItem('mwb-timing-open', o?'1':'0'); }catch(e){}
    renderTracks(); setTimeout(()=>window.dispatchEvent(new Event('resize')),0); }
  timingBtn.addEventListener('click', ()=>setTiming(!timingOpen)); tracks.hidden = !timingOpen; timingBtn.classList.toggle('on', timingOpen);
  let pxPerMs = .2;
  const snapTo = (t,v)=>{ if(!t) return v; const q = Math.round(v/t.step)*t.step; return Math.min(t.max, Math.max(t.min, +q.toFixed(4))); };
  function renderTracks(){ try{ renderTracks0(); }catch(e){ report('tracks', e); } }
  function renderTracks0(){
    const m = __mwb.model(); if(!m || !timingOpen){ tracks.innerHTML = ''; const hg = tl.offsetHeight; if(hg!==renderTracks._h){ renderTracks._h = hg; setTimeout(()=>window.dispatchEvent(new Event('resize')),0); } return; }
    const s = st(), vr = s.variant, kd = s.kind, T = E().timeline(vr,kd), tap = V()[T.tap.k], tot = V()[T.total.k];
    const f = tot>0 ? tot/T.total.natural : 1, S = t=>tap+t*f, U = x=>(x-tap)/f, endAt = tap + T.total.natural*f;
    const clips = T.lanes.map(c=>Object.assign({},c,{a:S(c.a),b:S(c.b)}));
    const lanes = [...new Set(clips.map(c=>c.lane))];
    const laneW = Math.max(200, tracks.clientWidth - 168); pxPerMs = laneW / m.dur;
    const step = m.dur > 3000 ? 500 : 250; let ticks = '';
    for(let t=0;t<=m.dur;t+=100){ const big = t%step===0; ticks += '<i class="'+(big?'big':'')+'" style="left:'+(t*pxPerMs)+'px">'+(big?'<b>'+(t===0?'0':String(+(t/1000).toFixed(2)))+'s</b>':'')+'</i>'; }
    const exp = [0,1,2,3].map(k=>'<em style="left:'+((m.motionEnd*k/3)*pxPerMs)+'px" title="Export frame '+(k+1)+'"></em>').join('');
    tracks.innerHTML = '<div class="mk-ruler"><div class="mk-lab"></div><div class="mk-scale">'+'<div class="mk-press" style="width:'+(tap*pxPerMs)+'px" title="Press: '+tap+' ms (shared interaction default)"></div>'+ticks+exp+'</div></div>'
      + lanes.map(l=>'<div class="mk-lane"><div class="mk-lab">'+l+'</div><div class="mk-row" data-lane="'+l+'"></div></div>').join('') + '<div class="mk-head"></div>';
    clips.forEach(c=>{
      const row = tracks.querySelector('.mk-row[data-lane="'+c.lane+'"]'), el = document.createElement('div');
      const edges = [c.start,c.end].filter(Boolean), keys = edges.map(e=>e.k), ch = keys.some(k=>!same(V()[k], refOff(vr,kd,k)));
      el.className = 'mk-clip'+(c.locked?' locked':''); el.style.left = (c.a*pxPerMs)+'px'; el.style.width = Math.max(4,(c.b-c.a)*pxPerMs)+'px';
      el.title = c.locked ? c.lane+': follows from the curve / physics' : c.lane+': drag the edges';
      el.innerHTML = '<span>'+(c.note||'')+'</span>';
      ['start','end'].forEach(side=>{ const e = c[side]; if(!e) return; const h = document.createElement('b'); h.className = 'h '+(side==='start'?'l':'r'); el.appendChild(h);
        drag(h, side==='start'?c.a:c.b, t=>{ const tw = tweakOf(vr,kd,e.k); V()[e.k] = snapTo(tw, e.raw ? t : (U(t)-e.base)/e.per); }); });
      dot(el, ch, ()=>{ keys.forEach(k=>{ V()[k] = refOff(vr,kd,k); }); __mwb.retime(); setTimeout(renderTracks,120); });
      row.appendChild(el);
    });
    const sc = tracks.querySelector('.mk-scale'), scrub = e=>{ const r = sc.getBoundingClientRect(); __mwb.seek(Math.max(0,Math.min(m.dur,(e.clientX-r.left)/pxPerMs))); };
    sc.addEventListener('pointerdown', e=>{ if(e.target.closest('.mk-end')) return; sc.setPointerCapture(e.pointerId); scrub(e); const mv = ev=>scrub(ev), up = ()=>{ sc.removeEventListener('pointermove',mv); sc.removeEventListener('pointerup',up); }; sc.addEventListener('pointermove',mv); sc.addEventListener('pointerup',up); });
    window.__mockTick();
    const hgt = tl.offsetHeight; if(hgt!==renderTracks._h){ renderTracks._h = hgt; setTimeout(()=>window.dispatchEvent(new Event('resize')),0); }
    decorate();
  }
  function drag(handle, t0, apply){
    handle.addEventListener('pointerdown', e=>{ if(e.target.classList.contains('mk-dot')) return; e.preventDefault(); e.stopPropagation();
      const x0 = e.clientX; handle.setPointerCapture(e.pointerId); __mwb.pause();
      const clip = handle.closest('.mk-clip'), L0 = clip ? clip.offsetLeft : handle.offsetLeft, W0 = clip ? clip.offsetWidth : 0, left = handle.classList.contains('l');
      const mv = ev=>{ const dx = ev.clientX-x0; apply(Math.max(0, t0 + dx/pxPerMs));
        if(clip){ if(left){ clip.style.left = (L0+dx)+'px'; clip.style.width = Math.max(4,W0-dx)+'px'; } else clip.style.width = Math.max(4,W0+dx)+'px'; } else handle.style.left = (L0+dx)+'px';
        cancelAnimationFrame(drag.r); drag.r = requestAnimationFrame(()=>__mwb.seek(st().tNow)); };
      const up = ()=>{ handle.removeEventListener('pointermove',mv); handle.removeEventListener('pointerup',up); __mwb.retime(); setTimeout(renderTracks,120); };
      handle.addEventListener('pointermove',mv); handle.addEventListener('pointerup',up); });
  }
  window.__mockTick = ()=>{ const h = tracks.querySelector('.mk-head'); if(h && __mwb.model()) h.style.left = (168 + st().tNow*pxPerMs)+'px'; };
  $('kindSeg').addEventListener('click',()=>setTimeout(renderTracks,30));
  new ResizeObserver(()=>renderTracks()).observe(tracks);

  /* ---------- interaction popover: every "interaction" dial of this variant ---------- */
  const pop = document.createElement('div'); pop.className = 'mk-pop'; pop.hidden = true; document.body.appendChild(pop);
  function renderPop(){ const vr = st().variant, seen = {}, rows = [];
    ANIMS.forEach(kd=>E().panelAll(vr,kd).tweaks.filter(t=>t.role==='interaction' && !/^tap/.test(t.k) && !seen[t.k]).forEach(t=>{ seen[t.k] = kd; rows.push(t); }));
    pop.innerHTML = '<div class="mk-pop-t">Settings</div><div class="mk-pop-s">Interaction · '+((window.__mwb.pkg().manifest.variants.find(x=>x.id===vr)||{}).name||vr)+'</div>' + (rows.length ? rows.map(t=>'<label class="mk-prow" data-k="'+t.k+'"><span>'+t.label+'</span><output>'+V()[t.k]+'</output><input type="range" min="'+t.min+'" max="'+t.max+'" step="'+t.step+'" value="'+V()[t.k]+'"></label>').join('') : '<p>No interaction dials.</p>') + '<p>Press / tap: <b>'+pressMs()+' ms</b>, the shared default for every interaction (set in the package).</p>';
    pop.querySelectorAll('.mk-prow').forEach(r=>{ const k = r.dataset.k, inp = r.querySelector('input');
      const fill = ()=>inp.style.setProperty('--p', ((inp.value-inp.min)/(inp.max-inp.min)*100)+'%'); fill(); inp.addEventListener('input', fill);
      const mark = ()=>dot(r, !same(V()[k], refOff(vr,seen[k],k)), ()=>{ V()[k] = refOff(vr,seen[k],k); renderPop(); decorate(); });
      inp.addEventListener('input',()=>{ V()[k] = +inp.value; r.querySelector('output').textContent = inp.value; mark(); decorate(); }); mark(); }); }
  function addRoll(){ const b = document.createElement('button'); b.type = 'button'; b.className = 'mk-roll'; b.textContent = 'New random values'; b.title = 'Same animation, new random values (stagger order, drift)';
    b.addEventListener('click', ()=>{ const r = $('tlRoll'); r.disabled = false; r.click(); }); const d = document.createElement('div'); d.className = 'mk-pop-s'; d.textContent = 'Randomness'; pop.append(d, b); }
  inter.addEventListener('click', e=>{ e.stopPropagation(); renderPop(); addRoll(); const r = inter.getBoundingClientRect(); pop.style.left = r.left+'px'; pop.style.top = (r.bottom + 8)+'px'; pop.style.right = 'auto'; pop.style.bottom = 'auto'; pop.hidden = !pop.hidden; });
  document.addEventListener('click', e=>{ if(!pop.hidden && !pop.contains(e.target) && !inter.contains(e.target)) pop.hidden = true; });

  /* ---------- focus mode, shortcuts ---------- */
  const fb = document.createElement('button'); fb.type = 'button'; fb.className = 'mk-focus'; fb.innerHTML = 'Focus <kbd>⌘.</kbd>'; $('vtabs').appendChild(fb);
  const focus = ()=>{ document.body.classList.toggle('mk-focus-on'); fb.classList.toggle('on', document.body.classList.contains('mk-focus-on')); setTimeout(()=>window.dispatchEvent(new Event('resize')),20); };
  fb.addEventListener('click', focus);
  document.addEventListener('keydown', e=>{
    if((e.metaKey||e.ctrlKey) && e.key==='.'){ e.preventDefault(); focus(); }
    if((e.metaKey||e.ctrlKey) && (e.key==='r'||e.key==='R') && hover && hover._mkReset){ e.preventDefault(); hover._mkReset(); }
  });
  let tt = 0; function toast(msg){ let t = document.querySelector('.mk-toast'); if(!t){ t = document.createElement('div'); t.className = 'mk-toast'; document.body.appendChild(t); }
    t.textContent = msg; t.hidden = false; clearTimeout(tt); tt = setTimeout(()=>t.hidden = true, 2200); }
})();

/* ---------- preview on a phone: QR code + link to the controls-free view (#prototype) ---------- */
(function(){
  const $ = id=>document.getElementById(id);
  const pv = document.createElement('button'); pv.type = 'button'; pv.className = 'mk-prev'; pv.textContent = 'Preview on phone'; $('vtabs').appendChild(pv); { const st_ = document.querySelector('.mk-set'); if(st_) $('vtabs').appendChild(st_); }
  const modal = document.createElement('div'); modal.className = 'mk-modal'; modal.hidden = true; document.body.appendChild(modal);
  const qr = document.createElement('div'); qr.className = 'mk-qr'; qr.setAttribute('role','dialog'); qr.setAttribute('aria-modal','true'); qr.setAttribute('aria-label','Preview on phone'); modal.appendChild(qr);
  const link = window.MWB_PHONE_URL || ((window.MWB_URL || '') + '#prototype');
  const closeQr = ()=>{ modal.hidden = true; };
  pv.addEventListener('click', e=>{ e.stopPropagation();
    if(!qr._done){
      qr.innerHTML = '<div class="mk-qr-h"><span>Preview on phone</span><button type="button" class="mk-x" aria-label="Close"><svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M3 3l8 8M11 3l-8 8"/></svg></button></div>'
        + '<div id="mkQrCode"></div><p>Scan with your phone camera. It opens the last pushed version; ask Claude to push your latest values.</p>'
        + '<div class="mk-qr-link"><code>'+link+'</code><button type="button" class="mk-copy">Copy link</button></div>';
      try{ new QRCode(qr.querySelector('#mkQrCode'), {text:link, width:184, height:184, colorDark:'#000000', colorLight:'#ffffff', correctLevel:QRCode.CorrectLevel.M}); }
      catch(err){ qr.querySelector('#mkQrCode').textContent = 'The QR code could not load. Use Copy link.'; }
      qr.querySelector('.mk-x').addEventListener('click', closeQr);
      const b = qr.querySelector('.mk-copy');
      b.addEventListener('click', ()=>{ const done = ()=>{ b.textContent = 'Copied'; setTimeout(()=>b.textContent = 'Copy link', 1600); };
        try{ navigator.clipboard.writeText(link).then(done, ()=>{ const r = document.createRange(); r.selectNodeContents(qr.querySelector('code')); getSelection().removeAllRanges(); getSelection().addRange(r); }); }catch(err){} });
      qr._done = 1; }
    modal.hidden = false; });
  modal.addEventListener('click', e=>{ if(e.target===modal) closeQr(); });
  document.addEventListener('keydown', e=>{ if(e.key==='Escape' && !modal.hidden){ e.preventDefault(); closeQr(); } });
})();

/* ---------- scrubber in the DialKit style + play always restarts (no pause: scrubbing is the pause) ---------- */
(function(){
  const $ = id=>document.getElementById(id), tl = $('tl'), r1 = tl.querySelector('.r1');
  const old = $('tlPlay'), play = old.cloneNode(false); play.id = 'mkPlay'; play.disabled = false;
  play.title = 'Play from the start (Space)'; play.setAttribute('aria-label','Play from the start');
  play.innerHTML = '<svg width="10" height="12" viewBox="0 0 10 12" fill="#000" aria-hidden="true"><path d="M1 1l8 5-8 5z"/></svg>';
  old.replaceWith(play); play.addEventListener('click', ()=>__mwb.gotoKind(__mwb.state().kind));
  $('tlTime').style.display = 'none';
  const sc = document.createElement('div'); sc.className = 'mk-scrub'; sc.tabIndex = 0; sc.setAttribute('role','slider'); sc.setAttribute('aria-label','Timeline');
  sc.innerHTML = '<div class="f"></div><div class="t"></div><div class="h"></div><span class="l">Timeline</span><span class="v"></span>';
  const ctr = r1.querySelector('.mk-ctr'), spacer = ctr.nextElementSibling; ctr.after(sc);
  if(spacer && spacer.tagName==='SPAN' && !spacer.className) spacer.remove();
  function upd(){ const m = __mwb.model(); if(!m) return; const t = __mwb.state().tNow, p = Math.max(0, Math.min(1, t/m.dur));
    sc.querySelector('.f').style.width = (p*100)+'%'; sc.querySelector('.h').style.left = (p*100)+'%';
    sc.querySelector('.v').textContent = (t/1000).toFixed(2)+' / '+(m.dur/1000).toFixed(2)+' s';
    const key = m.dur+'|'+m.motionEnd; if(sc._k!==key){ sc._k = key; sc.querySelector('.t').innerHTML = [0,1,2,3].map(k=>'<i style="left:'+(m.motionEnd*k/3/m.dur*100)+'%" title="Export frame '+(k+1)+'"></i>').join(''); }
    sc.setAttribute('aria-valuemin','0'); sc.setAttribute('aria-valuemax', Math.round(m.dur)); sc.setAttribute('aria-valuenow', Math.round(t)); }
  const prev = window.__mockTick; window.__mockTick = ()=>{ if(prev) prev(); upd(); };
  const seekAt = e=>{ const r = sc.getBoundingClientRect(), m = __mwb.model(); if(!m) return; __mwb.seek(Math.max(0, Math.min(1, (e.clientX-r.left)/r.width))*m.dur); };
  sc.addEventListener('pointerdown', e=>{ e.preventDefault(); sc.focus(); sc.setPointerCapture(e.pointerId); sc.classList.add('drag'); seekAt(e);
    const mv = ev=>seekAt(ev), up = ()=>{ sc.classList.remove('drag'); sc.removeEventListener('pointermove',mv); sc.removeEventListener('pointerup',up); };
    sc.addEventListener('pointermove',mv); sc.addEventListener('pointerup',up); });
  sc.addEventListener('keydown', e=>{ const m = __mwb.model(); if(!m) return; const d = e.key==='ArrowRight' ? 1 : e.key==='ArrowLeft' ? -1 : 0; if(!d) return;
    e.preventDefault(); __mwb.seek(Math.max(0, Math.min(m.dur, __mwb.state().tNow + d*(e.shiftKey ? 100 : 1000/60)))); });
  setInterval(()=>{ if(!sc._k) upd(); }, 300);
})();
