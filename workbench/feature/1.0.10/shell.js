/* Feature workbench shell 1.0.3: ticket-agnostic. Reads PACK and the pack's functions (see PACK-API.md). */
document.title=PACK.id+" Feature Workbench"; document.getElementById("b-proto").href=PACK.protoUrl;
let S=structuredClone(DEFAULT);
const ui=Object.assign({sb:true,live:{}},structuredClone(PACK.ui));

/* ================= persistence ================= */
let dirty=false,DOC=null,DB=null,saving=false,again=false,tmr=null,lastSaved=null,pendingRemote=null,lastSnap=0;
/* ---- save only what changed (3-way merge) ----
   base = last version known to match the database. On save we read the latest database version and apply only
   the fields this page changed since base, so edits made elsewhere (Claude, another tab) are kept, never overwritten. */
let base=null, needRender=false;
const jeq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const SFIELDS=["doc","name","kind","links"], MFIELDS=["name","figma","status"];
function structOf(ms){ return (ms||[]).map(m=>m.id+":"+(m.states||[]).map(x=>x.id).join(",")).join("|"); }
function mergeById(b=[],l=[],r=[]){ const bIds=new Set(b.map(x=>x.id)), lIds=new Set(l.map(x=>x.id));
  const removed=new Set([...bIds].filter(i=>!lIds.has(i))), added=l.filter(x=>!bIds.has(x.id)), changed=l.filter(x=>bIds.has(x.id)&&!jeq(x,b.find(y=>y.id===x.id)));
  const out=r.filter(x=>!removed.has(x.id)).map(x=>changed.find(c=>c.id===x.id)||x); added.forEach(a=>{ if(!out.some(x=>x.id===a.id)) out.push(a); }); return out; }
function mergeModes(b=[],l=[],r=[]){ const find=(arr,id)=>(arr||[]).find(x=>x.id===id);
  if(structOf(l)===structOf(b)){ /* local kept the structure: start from remote, overlay local field edits */
    const out=structuredClone(r); for(const lm of l){ const bm=find(b,lm.id), om=find(out,lm.id); if(!om) continue;
      for(const f of MFIELDS) if(!jeq(lm[f],bm&&bm[f])) om[f]=structuredClone(lm[f]);
      for(const ls of lm.states||[]){ const bs=find(bm&&bm.states,ls.id), os=find(om.states,ls.id); if(!os) continue; for(const f of SFIELDS) if(!jeq(ls[f],bs&&bs[f])) os[f]=structuredClone(ls[f]); } }
    return out; }
  /* local changed the structure (added/removed/reordered): keep local structure, take remote fields wherever local didn't touch them */
  const out=structuredClone(l); for(const om of out){ const bm=find(b,om.id), rm=find(r,om.id); if(!bm||!rm) continue;
    for(const f of MFIELDS) if(jeq(om[f],bm[f])) om[f]=structuredClone(rm[f]);
    for(const os of om.states||[]){ const bs=find(bm.states,os.id), rs=find(rm.states,os.id); if(!bs||!rs) continue; for(const f of SFIELDS) if(jeq(os[f],bs[f])) os[f]=structuredClone(rs[f]); } }
  return out; }
function merge3(b,l,r){ if(!b) return structuredClone(l); const out=structuredClone(r);
  const keys=new Set([...Object.keys(l||{}),...Object.keys(r||{})]);
  for(const k of keys){
    if(k==="docs"){ const bd=b.docs||{}, ld=l.docs||{}, o=Object.assign({},r.docs||{}); for(const dk of new Set([...Object.keys(ld),...Object.keys(bd)])) if(!jeq(ld[dk],bd[dk])){ if(ld[dk]===undefined) delete o[dk]; else o[dk]=ld[dk]; } out.docs=o; }
    else if(k==="modes") out.modes=mergeModes(b.modes,l.modes,r.modes);
    else if(k==="pins"||k==="docpins"||k==="agt") out[k]=mergeById(b[k],l[k],r[k]);
    else if(k==="seen"){ const o=Object.assign({},r.seen||{}); for(const [sk,sv] of Object.entries(l.seen||{})) if(sv!==(b.seen||{})[sk]) o[sk]=sv; out.seen=o; }   /* 1.0.7 */
    else if(k==="threads"){ const o=Object.assign({},r.threads||{}); for(const [tk,tv] of Object.entries(l.threads||{})) if(!jeq(tv,(b.threads||{})[tk])) o[tk]=tv; out.threads=o; }   /* 1.0.5: merge per thread */
    else if(k==="elnums"){ const o=Object.assign({},r.elnums||{}); for(const [ek,ev] of Object.entries(l.elnums||{})) if(!jeq(ev,(b.elnums||{})[ek])) o[ek]=ev; out.elnums=o; }
    else if(k==="updated") continue;
    else if(!jeq(l[k],b[k])) out[k]=structuredClone(l[k]); }
  return out; }
const syncEl=document.getElementById("sync");
const setSync=t=>syncEl.textContent=t;
function unwrap(s){ if(!s) return null; if(typeof s.data==="function") return s.data(); if(s.exists===false) return null; return s.data!==undefined?s.data:s; }
const valid=d=>d&&d.v===2&&Array.isArray(d.modes)&&d.docs;
async function initDb(){
  let db=null;
  try{ db=window.claude&&window.claude.use?await window.claude.use("db"):null; }catch(e){}
  if(!db){ loadLocal(); setSync("local only"); return; }
  DB=db;
  try{
    DOC=db.doc(PACK.dbDoc);
    const guard=setTimeout(()=>setSync("offline · local"),10000);
    let d=unwrap(await DOC.get());
    if(!valid(d)){ const old=PACK.legacyDbDoc?unwrap(await db.doc(PACK.legacyDbDoc).get()):null; d=typeof migrate==="function"?migrate(old):structuredClone(DEFAULT); S=d; flush(); }
    else S=structuredClone(d);
    base=structuredClone(S);
    try{ await db.doc("history/pre-unified-doc").get().then(async x=>{ if(!unwrap(x)) await db.doc("history/pre-unified-doc").set({at:new Date().toISOString(),data:JSON.parse(JSON.stringify(d))}); }); }catch(e){}
    clearTimeout(guard); render(true); setSync("saved"); loadPreviews();
    try{ DOC.onSnapshot(snap=>{ const r=unwrap(snap); if(!valid(r)||r.updated===lastSaved) return;
      if(saving||tmr) return; /* the next save merges it in */
      S=merge3(base,S,r); base=structuredClone(r);
      const a=document.activeElement; if(a&&a.closest&&a.closest(".ed,.sec-name")){ needRender=true; setSync("Claude updated · click outside to see it"); return; }
      render(true); setSync("saved"); }); }catch(e){}
  }catch(e){ loadLocal(); setSync("offline · local"); }
}
function loadLocal(){ try{ const d=JSON.parse(localStorage.getItem(PACK.lsKey)||"null"); if(valid(d)){ S=structuredClone(d); render(); } }catch(e){} }
function save(){ dirty=true; try{ localStorage.setItem(PACK.lsKey,JSON.stringify(S)); }catch(e){} if(!DOC) return; setSync("editing…"); clearTimeout(tmr); tmr=setTimeout(flush,800); }
async function flush(){ tmr=null; if(!DOC) return; if(saving){ again=true; return; } saving=true; setSync("saving…");
  try{ const snap=structuredClone(S); let remote=null; try{ remote=unwrap(await DOC.get()); }catch(e){}
    const merged=valid(remote)?merge3(base,snap,remote):snap; merged.updated=new Date().toISOString(); lastSaved=merged.updated;
    await DOC.set(JSON.parse(JSON.stringify(merged))); base=structuredClone(merged);
    const fromElsewhere=valid(remote)&&!jeq({...merged,updated:0},{...snap,updated:0});
    S=merge3(snap,S,merged); S.updated=merged.updated; dirty=false; setSync("saved");
    if(fromElsewhere){ const a=document.activeElement; if(a&&a.closest&&a.closest(".ed,.sec-name")) needRender=true; else render(true); }
    if(Date.now()-lastSnap>600000){ lastSnap=Date.now(); try{ await DB.doc("history/"+S.updated.replace(/[^0-9T]/g,"")).set({at:S.updated,data:JSON.parse(JSON.stringify(S))}); }catch(e){} } }catch(e){ setSync("save failed · kept locally"); }
  saving=false; if(again){ again=false; flush(); } }

/* ================= helpers ================= */
const $=(s,el=document)=>el.querySelector(s);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const mode=id=>S.modes.find(m=>m.id===id);
const curMode=()=>mode(ui.sel.mode)||S.modes[0];
const curState=()=>{ const m=curMode(); return m&&(m.states.find(s=>s.id===ui.sel.state)||m.states[0]); };
const uid=x=>x+Math.random().toString(36).slice(2,7);
const flat=()=>S.modes.flatMap(m=>m.states.map(s=>({m,s})));
const find=id=>flat().find(x=>x.s.id===id);
const STAT={open:"○",rework:"⚠",done:"✓"};
const textOf=html=>{ const d=document.createElement("div"); d.innerHTML=html||""; d.querySelectorAll("mark.ask").forEach(m=>m.remove()); return d.textContent; };
/* pull an image out of a connector (Figma) response */
function findImage(o,depth=0){ if(!o||depth>6) return null; if(typeof o==="string"){ return /^iVBOR|^\/9j\//.test(o)?"data:image/"+(o.startsWith("/9j/")?"jpeg":"png")+";base64,"+o:null; }
  if(Array.isArray(o)){ for(const x of o){ const r=findImage(x,depth+1); if(r) return r; } return null; }
  if(typeof o==="object"){ if(o.type==="image"&&o.data) return `data:${o.mimeType||"image/png"};base64,${o.data}`; for(const k in o){ const r=findImage(o[k],depth+1); if(r) return r; } } return null; }


/* ================= stable element numbers ================= */
function elNum(id){ S.elnums=S.elnums||{}; if(!S.elnums[id]){ let i=EL_ORDER.indexOf(id); const used=new Set(Object.values(S.elnums)); let n=i>=0?i+1:Math.max(EL_ORDER.length,...used)+1; while(used.has(n)&&S.elnums[id]!==n) n++; S.elnums[id]=n; } return S.elnums[id]; }
const allRefs=()=>{ let t=textOf(S.docs.brief)+" "+textOf(S.docs.rules)+" "+textOf(S.docs.edges||"")+" "+textOf(S.docs.questions); for(const {s} of flat()) t+=" "+textOf(s.doc); return new Set((t.match(/#\d+/g)||[]).map(x=>+x.slice(1))); };
/* ================= coverage for every screen ================= */
const covCache={};
function countFor(st){
  const key=st.id+"|"+ui.variant+"|"+ui.context+"|"+st.kind;
  if(covCache[key]) return covCache[key];
  const box=document.getElementById("measure"); box.innerHTML=phoneHTML(st,{},false);
  const ids=[...box.querySelectorAll("[data-el]")].filter(e=>e.offsetParent!==null).map(e=>e.dataset.el); box.innerHTML="";
  return covCache[key]=ids;
}
function covOf(st){ const nums=countFor(st).map(elNum), r=allRefs(); const c=nums.filter(n=>r.has(n)).length; return {c,n:nums.length,r,nums}; }

/* ================= comments for Claude on the screen ================= */
const cbtn=document.getElementById("cbtn");
cbtn.addEventListener("click",e=>{ e.stopPropagation(); ui.commenting=!ui.commenting; cbtn.classList.toggle("on",ui.commenting); stageEl.classList.toggle("commenting",ui.commenting); document.body.classList.toggle("commenting",ui.commenting); cbtn.textContent=ui.commenting?"Click the screen…":"💬 Comment"; });
function endCommenting(){ ui.commenting=false; cbtn.classList.remove("on"); stageEl.classList.remove("commenting"); document.body.classList.remove("commenting"); cbtn.textContent="💬 Comment"; document.querySelector(".cpop")?.remove(); }
function popAt(cx,cy,html){ document.querySelector(".cpop")?.remove(); const sr=stageEl.getBoundingClientRect(); const d=document.createElement("div"); d.className="cpop";
  d.style.left=Math.max(8,Math.min(cx-sr.left+10,sr.width-252))+"px"; d.style.top=Math.max(8,Math.min(cy-sr.top-10,sr.height-130))+"px"; d.innerHTML=html; stageEl.appendChild(d); return d; }
stageEl.addEventListener("click",e=>{
  if(e.target.closest(".cpop")) return;
  const pin=e.target.closest(".cpin");
  if(pin){ e.stopPropagation(); e.preventDefault(); const p=(S.pins||[]).find(x=>x.id===pin.dataset.pin); if(!p) return;
    const d=popAt(e.clientX,e.clientY,`<div>${esc(p.text)}</div><div class="row"><span>for Claude · ${esc(curState().name)}${p.target&&(p.target.label||p.target.text)?" · "+esc((p.target.label||p.target.text).slice(0,40)):""}</span><button data-del="${p.id}">Delete</button></div>`);
    d.querySelector("[data-del]").addEventListener("click",()=>{ S.pins=S.pins.filter(x=>x.id!==p.id); save(); d.remove(); renderStage(); }); return; }
  const ph=e.target.closest(".phone");
  if(!ph||!(ui.commenting||(e.altKey&&!window.USE_AGT))){ if(!e.target.closest(".cpop")) document.querySelector(".cpop")?.remove(); return; }
  e.stopPropagation(); e.preventDefault();
  const r=ph.getBoundingClientRect(); const x=Math.round((e.clientX-r.left)/ui.scale), y=Math.round((e.clientY-r.top)/ui.scale);
  const hit=document.elementsFromPoint(e.clientX,e.clientY).find(n=>ph.contains(n)&&n!==ph&&!n.closest(".cpop"));
  const elNode=hit&&hit.closest("[data-el]"); const txtNode=hit&&hit.closest("p,li,b,span,button,textarea,.q-card,.m-s,.m-t,.tag")||hit;
  const target={el:elNode?elNode.dataset.el:null,label:elNode?elNode.dataset.label:null,cls:hit?String((hit.getAttribute&&hit.getAttribute("class"))||hit.tagName).slice(0,60):null,text:txtNode?((txtNode.value||txtNode.textContent||"").trim().replace(/\s+/g," ").slice(0,80)):null};
  const where=target.label||target.text||"";
  const d=popAt(e.clientX,e.clientY,`<textarea placeholder="Comment for Claude… Enter to save"></textarea><div class="row"><span>${esc(curState().name)}${where?" · "+esc(where.slice(0,40)):""}</span><button data-cancel>Cancel</button></div>`);
  const t=d.querySelector("textarea"); t.focus();
  d.querySelector("[data-cancel]").addEventListener("click",endCommenting);
  t.addEventListener("keydown",k=>{ if(k.key==="Escape"){ k.preventDefault(); endCommenting(); }
    if(k.key==="Enter"&&!k.shiftKey){ k.preventDefault(); const v=t.value.trim(); if(v){ S.pins=S.pins||[]; S.pins.push({id:uid("c-"),state:curState().id,variant:ui.variant,ctx:ui.context,target,x,y,text:v,at:new Date().toISOString()}); save(); } endCommenting(); renderStage(); } });
},true);

/* ================= comment pins in the spec ================= */
/* stored in S.docpins: anchored to the block (bullet/paragraph) that was clicked, via the start of its text, so pins follow edits */
function docPop(cx,cy,html){ document.querySelector(".cpop")?.remove(); const d=document.createElement("div"); d.className="cpop fixed"; d.style.left=Math.max(8,Math.min(cx+10,innerWidth-252))+"px"; d.style.top=Math.max(8,Math.min(cy-10,innerHeight-130))+"px"; d.innerHTML=html; document.body.appendChild(d); return d; }
function blockAt(el,sec){ let b=el&&el.closest&&el.closest("li,p,h1,h2,h3,h4,div"); if(b&&!sec.contains(b)) b=null; return b; }
function renderDocPins(){ document.querySelectorAll(".dpin").forEach(n=>n.remove()); (S.docpins||[]).forEach((p,i)=>{ const sec=document.querySelector(`.dsec[data-sec="${CSS.escape(p.sec)}"]`); if(!sec) return;
  let top=p.y; const blocks=[...sec.querySelectorAll(".ed li,.ed p,.ed h2,.ed h3,.ed div")]; const b=p.anchor&&blocks.find(n=>n.textContent.trim().startsWith(p.anchor));
  if(b){ const sr=sec.getBoundingClientRect(), br=b.getBoundingClientRect(); top=br.top-sr.top+p.dy; }
  const btn=document.createElement("button"); btn.className="cpin dpin"; btn.dataset.dpin=p.id; btn.style.left=p.dx+"px"; btn.style.top=top+"px"; btn.title=p.text; btn.textContent=i+1; sec.appendChild(btn); }); }
{ const _rd=renderDoc; renderDoc=function(...a){ const r=_rd.apply(this,a); requestAnimationFrame(renderDocPins); return r; }; }
let dpinT=null; document.addEventListener("input",e=>{ if(e.target.closest&&e.target.closest(".ed")){ clearTimeout(dpinT); dpinT=setTimeout(renderDocPins,300); } });
document.addEventListener("mousedown",e=>{ if((ui.commenting||(e.altKey&&!window.USE_AGT))&&e.target.closest&&e.target.closest("#edscroll .dsec")&&!e.target.closest(".dpin")) e.preventDefault(); },true);
document.addEventListener("click",e=>{
  const dp=e.target.closest&&e.target.closest(".dpin");
  if(dp){ e.preventDefault(); e.stopPropagation(); const p=(S.docpins||[]).find(x=>x.id===dp.dataset.dpin); if(!p) return;
    const d=docPop(e.clientX,e.clientY,`<div>${esc(p.text)}</div><div class="row"><span>for Claude · spec</span><button data-del>Delete</button></div>`);
    d.querySelector("[data-del]").addEventListener("click",()=>{ S.docpins=S.docpins.filter(x=>x.id!==p.id); save(); d.remove(); renderDocPins(); }); return; }
  const sec=e.target.closest&&e.target.closest("#edscroll .dsec");
  if(!sec||!(ui.commenting||(e.altKey&&!window.USE_AGT))){ if(!(e.target.closest&&e.target.closest(".cpop"))&&!(e.target.closest&&e.target.closest(".phone"))) document.querySelector(".cpop.fixed")?.remove(); return; }
  e.preventDefault(); e.stopPropagation();
  const sr=sec.getBoundingClientRect(), b=blockAt(e.target,sec); const dx=Math.round(e.clientX-sr.left), y=Math.round(e.clientY-sr.top);
  const anchor=b?b.textContent.trim().slice(0,40):""; const dy=b?Math.round(e.clientY-b.getBoundingClientRect().top):0;
  const d=docPop(e.clientX,e.clientY,`<textarea placeholder="Comment for Claude… Enter to save"></textarea><div class="row"><span>spec</span><button data-cancel>Cancel</button></div>`);
  const t=d.querySelector("textarea"); t.focus();
  d.querySelector("[data-cancel]").addEventListener("click",()=>{ d.remove(); endCommenting(); });
  t.addEventListener("keydown",k=>{ if(k.key==="Escape"){ k.preventDefault(); d.remove(); endCommenting(); }
    if(k.key==="Enter"&&!k.shiftKey){ k.preventDefault(); const v=t.value.trim(); if(v){ S.docpins=S.docpins||[]; S.docpins.push({id:uid("d-"),sec:sec.dataset.sec,anchor,dx,dy,y,text:v,at:new Date().toISOString()}); save(); } d.remove(); endCommenting(); renderDocPins(); } });
},true);

/* ================= global comment / addition counters ================= */
/* the jump highlight is temporary: remove the class when it ends so it never gets saved into the spec */
document.addEventListener("animationend",e=>{ if(e.target.classList&&e.target.classList.contains("flash")) e.target.classList.remove("flash"); },true);
/* 1.0.4: the yellow counter also switches the comment layer (Agentation) on, otherwise its markers stay hidden */
function agtActive(){ const g=document.querySelector('[data-feedback-toolbar] [class*="toggleGlyph"]'); return !!g&&g.getAttribute("data-active")==="true"; }
function agtShow(){ if(!window.USE_AGT||agtActive()) return; document.dispatchEvent(new KeyboardEvent("keydown",{key:"F",code:"KeyF",ctrlKey:true,shiftKey:true,bubbles:true,cancelable:true})); }
let cntCi=-1, cntAi=-1;
function allComments(){ const scr=(S.pins||[]).map(p=>({kind:"screen",p})), doc=(S.docpins||[]).map(p=>({kind:"doc",p})), agt=(S.agt||[]).filter(a=>a.status!=="resolved").map(p=>({kind:"agt",p})); return [...doc,...scr,...agt]; }
function updateCounters(){ const c=$("#cntC"), a=$("#cntA"); if(!c||!a) return; const nc=allComments().length+document.querySelectorAll("#edscroll mark.ask").length+thWaiting(), na=document.querySelectorAll("#edscroll span.ai,#edscroll .ed .imp").length;
  c.textContent=nc; c.hidden=!nc; const nu=thUnread().length; a.textContent=nu||na; a.hidden=!na; a.classList.toggle("out",!nu); a.classList.toggle("unread",!!nu); a.title=nu?`${nu} unread proposal${nu>1?"s":""}: click for the next one`:`${na} open proposal${na>1?"s":""} (all read): click to step through`; try{ updTpBadges(); placeAgtDots(); }catch(e){} }
/* comments per touchpoint: yellow number on each chip + yellow dots on the phone, anchored to the commented element */
function tpComments(ctx){ return [...(S.agt||[]).filter(a=>a.status!=="resolved"&&a.where==="phone"&&(a.ctx||"tutor")===ctx).map(p=>({kind:"agt",p})),...(S.pins||[]).filter(p=>(p.ctx||"tutor")===ctx).map(p=>({kind:"screen",p}))]; }
function updTpBadges(){ const box=document.getElementById("tpchips"); if(!box) return; box.querySelectorAll("button[data-c]").forEach(b=>{ const t=CONTEXTS.find(c=>c.id===b.dataset.c); const n=t&&t.ctx?tpComments(t.ctx).length:0; let i=b.querySelector(".cb"); if(!n){ if(i) i.remove(); return; } if(!i){ i=document.createElement("i"); i.className="cb"; b.appendChild(i); } i.textContent=n; i.title=n+" open comment"+(n>1?"s":"")+" on this touchpoint"; }); }
/* 1.0.3: Agentation draws its own (yellow) markers, so the shell no longer draws dots on the screen */
function placeAgtDots(){ const L0=document.getElementById("agtdots"); if(L0) L0.remove(); }
function placeAgtDotsOld(){ let L=document.getElementById("agtdots"); if(!L){ L=document.createElement("div"); L.id="agtdots"; document.body.appendChild(L); } L.innerHTML=""; if(document.body.classList.contains("proto")||document.body.classList.contains("native")) return;
  const ph=document.querySelector("#pwrap .phone"); if(!ph) return; const pr=ph.getBoundingClientRect(); let un=0;
  (S.agt||[]).filter(a=>a.status!=="resolved"&&a.where==="phone"&&(a.ctx||"tutor")===ui.context&&(!a.state||a.state===(ui.sel&&ui.sel.state))).forEach((a,i)=>{
    let el=null; try{ el=document.querySelector(a.elementPath); }catch(e){} let x=null,y=null,miss=false;
    if(el){ const r=el.getBoundingClientRect(); if(r.width||r.height){ x=Math.min(r.right,pr.right-6)-2; y=Math.max(r.top,pr.top+6)+2; } }
    if(x==null){ x=pr.left+16+un*24; y=pr.top+64; un++; miss=true; }
    const b=document.createElement("button"); b.className="agtdot"+(miss?" miss":""); b.textContent=i+1; b.style.left=x+"px"; b.style.top=y+"px"; b.dataset.id=a.id; b.title=miss?"Element not visible in this variant/state":"Comment "+(i+1); L.appendChild(b); }); }
function flashDots(){ document.querySelectorAll("#agtdots .agtdot").forEach(d=>{ d.classList.remove("flash"); void d.offsetWidth; d.classList.add("flash"); }); }
function closeAgtPop(){ const p=document.getElementById("agtpop"); if(p) p.remove(); }
document.addEventListener("click",e=>{ const d=e.target.closest&&e.target.closest(".agtdot"); if(d){ e.stopPropagation(); closeAgtPop(); const a=(S.agt||[]).find(x=>x.id===d.dataset.id); if(!a) return; const pop=document.createElement("div"); pop.id="agtpop";
    const vn=(VARIANTS.find(v=>v.id===a.variant)||{}).name;
    pop.innerHTML=`<div class="m">${esc(a.element||"element")}${a.variant&&a.variant!==ui.variant?` · placed in variant "${esc(vn||a.variant)}"`:""}</div><p>${esc(a.comment||"")}</p><button data-done="${esc(a.id)}">Mark as done</button>`;
    document.body.appendChild(pop); const r=d.getBoundingClientRect(); pop.style.left=Math.min(Math.max(8,r.left-270),window.innerWidth-276)+"px"; pop.style.top=Math.min(r.bottom+8,window.innerHeight-pop.offsetHeight-8)+"px"; return; }
  const dn=e.target.closest&&e.target.closest("#agtpop button[data-done]"); if(dn){ const a=(S.agt||[]).find(x=>x.id===dn.dataset.done); if(a){ a.status="resolved"; save(); updateCounters(); } closeAgtPop(); return; }
  if(!(e.target.closest&&e.target.closest("#agtpop"))) closeAgtPop(); },true);
document.addEventListener("keydown",e=>{ if(e.key==="Escape") closeAgtPop(); });
window.addEventListener("resize",()=>{ try{ placeAgtDots(); }catch(e){} });
document.addEventListener("scroll",e=>{ if(e.target&&e.target.closest&&e.target.closest("#pwrap")) requestAnimationFrame(()=>{ try{ placeAgtDots(); }catch(x){} }); },true);
function gotoTpComments(t){ const c=tpComments(t.ctx)[0]; ui.context=t.ctx; if(c&&c.kind==="agt"&&c.p.variant) ui.variant=c.p.variant; else if(c&&c.p.variant) ui.variant=c.p.variant; try{ sc.value=ui.context; sv.value=ui.variant; }catch(e){} const st=c&&c.p.state; if(st&&ui.sel.state!==st&&find(st)) go(st); else renderStage(); renderLeft&&renderLeft(); setTimeout(flashDots,200); }
document.addEventListener("click",e=>{
  if(e.target.closest&&e.target.closest("#cntC")){ agtShow(); const tps=CONTEXTS.filter(t=>t.ctx&&tpComments(t.ctx).length); const docs=(S.docpins||[]); const asks=[...document.querySelectorAll("#edscroll mark.ask")]; const n=tps.length+docs.length+asks.length; if(!n) return; cntCi=(cntCi+1)%n;
    if(cntCi<tps.length) gotoTpComments(tps[cntCi]);
    else if(cntCi<tps.length+docs.length){ const p=docs[cntCi-tps.length]; const b=document.querySelector(`.dpin[data-dpin="${p.id}"]`); if(b){ b.scrollIntoView({block:"center",behavior:"smooth"}); b.classList.remove("flash"); void b.offsetWidth; b.classList.add("flash"); } }
    else { const m=asks[cntCi-tps.length-docs.length]; m.scrollIntoView({block:"center",behavior:"smooth"}); m.classList.add("flash"); }
    return; }
  if(e.target.closest&&e.target.closest("#cntA")){ const un=thUnread(); const ai=un.length?un:[...document.querySelectorAll("#edscroll span.ai,#edscroll .ed .imp")]; if(!ai.length) return; cntAi=un.length?0:(cntAi+1)%ai.length; const sp=ai[cntAi]; sp.scrollIntoView({block:"center",behavior:"smooth"}); sp.classList.remove("flash"); void sp.offsetWidth; sp.classList.add("flash"); setTimeout(()=>openThread(sp),350); return; }
},true);
{ const _rd2=renderDoc; renderDoc=function(...a){ const r=_rd2.apply(this,a); requestAnimationFrame(updateCounters); return r; }; }
{ const _rs=renderStage; renderStage=function(...a){ const r=_rs.apply(this,a); updateCounters(); return r; }; }
/* comments per variant + surface: Agentation keeps markers per URL hash, so the hash follows the variant and the touchpoint (not in #prototype) */
function syncAgtHash(){ if(location.hash==="#prototype") return; const h="#"+String(ui.variant||"v")+"-"+String(ui.context||"all"); if(location.hash!==h){ try{ location.replace(h); }catch(e){} } }
{ const _rs2=renderStage; renderStage=function(...a){ const r=_rs2.apply(this,a); syncAgtHash(); return r; }; }
{ const _sv=save; save=function(...a){ const r=_sv.apply(this,a); requestAnimationFrame(updateCounters); return r; }; }
document.addEventListener("input",e=>{ if(e.target.closest&&e.target.closest(".ed")) requestAnimationFrame(updateCounters); });

/* ================= minimap + overview ================= */
function renderMinimap(){
  const mm=document.getElementById("minimap");
  mm.innerHTML=S.modes.map(m=>`<div class="mm-row">${m.states.map(s=>`<span class="mm-cell ${s.id===ui.sel.state?"cur":""}"></span>`).join("")}</div>`).join("")+`<span class="mm-lbl">All screens</span>`;
}
document.getElementById("minimap").addEventListener("click",()=>{ renderOverview(); stageEl.classList.add("ov"); });
function renderOverview(){
  const O=document.getElementById("overview");
  O.innerHTML=`<div class="ov-top"><h3>All screens</h3><span class="tid">${flat().length} screens · ${esc((VARIANTS.find(v=>v.id===ui.variant)||{}).name||ui.variant)} variant</span><span class="sp"></span><button class="hbtn" id="ov-close">Back to screen (Esc)</button></div>`+
    S.modes.map(m=>`<div class="ov-mode"><h4><span class="stat ${m.status}">${STAT[m.status]}</span>${esc(m.name)}</h4><div class="ov-row">${m.states.map(s=>`<button class="ov-item ${s.id===ui.sel.state?"cur":""}" data-go="${s.id}"><div class="ov-thumb">${phoneHTML(s,{},false)}</div><span class="ov-name">${esc(s.name)} · ${covOf(s).c}/${covOf(s).n}</span><span class="ov-dots">${(()=>{ const v=covOf(s); return v.nums.map(n=>`<i class="${v.r.has(n)?"f":""}">${n}</i>`).join(""); })()}</span></button>`).join("")}</div></div>`).join("");
}
document.getElementById("overview").addEventListener("click",e=>{
  if(e.target.id==="ov-close"){ stageEl.classList.remove("ov"); return; }
  const g=e.target.closest("[data-go]"); if(g){ stageEl.classList.remove("ov"); go(g.dataset.go); }
});

/* ================= sidebar ================= */
function renderLeft(){
  const L=document.getElementById("left"), k=ui.sel.kind;
  let h=`<div class="sec">Ticket</div>
   <button class="navi ${k==="brief"?"on":""}" data-nav="brief">Brief</button>
   <button class="navi ${k==="rules"?"on":""}" data-nav="rules">Global rules</button>
   <button class="navi ${k==="questions"?"on":""}" data-nav="questions">Open questions</button>
   <div class="sec" style="margin-top:8px">Screens</div>`;
  for(const m of S.modes){
    h+=`<div class="mode"><div class="mrow"><button class="stat ${m.status}" data-stat="${m.id}" title="Status: ${m.status} · click to change" aria-label="Status ${m.status}">${STAT[m.status]}</button>
      <button class="mname" data-ren="${m.id}" title="Double-click to rename">${esc(m.name)}</button><button class="x" data-delm="${m.id}" aria-label="Delete mode">×</button></div>`;
    for(const s of m.states){
      const on=k==="state"&&ui.sel.state===s.id; const t=textOf(s.doc).trim();
      const refs=(t.match(/#\d+/g)||[]).length;
      h+=`<button class="state ${on?"on":""}" data-st="${m.id}|${s.id}"><span class="dot ${t?"has":""}"></span>${esc(s.name)}${(()=>{ const v=covOf(s); return `<span class="cov ${v.n&&v.c===v.n?"full":""}">${v.c}/${v.n}</span>`; })()}</button>`;
    }
    h+=`<button class="add" data-adds="${m.id}">+ screen</button></div>`;
  }
  h+=`<button class="addm" id="addm">+ mode</button>`;
  L.innerHTML=h;
}
document.getElementById("left").addEventListener("click",e=>{
  const t=e.target.closest("button"); if(!t) return;
  if(t.dataset.nav){ ui.sel={...ui.sel,kind:t.dataset.nav}; renderLeft(); scrollToSel(); }
  else if(t.dataset.st){ go(t.dataset.st.split("|")[1]); }
  else if(t.dataset.stat){ const m=mode(t.dataset.stat); m.status={open:"rework",rework:"done",done:"open"}[m.status]; save(); renderLeft(); }
  else if(t.dataset.adds){ const m=mode(t.dataset.adds); const s={id:uid("s-"),name:"New screen",kind:"custom",doc:"",links:{}}; m.states.push(s); save(); go(s.id); setTimeout(()=>{ const i=document.querySelector(`.sec-name[data-state="${s.id}"]`); i?.focus(); i?.select(); },60); }
  else if(t.dataset.delm){ if(t.dataset.arm){ S.modes=S.modes.filter(m=>m.id!==t.dataset.delm); ui.sel={kind:"brief"}; save(); render(); } else { t.dataset.arm=1; t.textContent="Sure?"; t.style.visibility="visible"; } }
  else if(t.id==="addm"){ const m={id:uid("m-"),name:"New mode",status:"open",figma:"",states:[{id:uid("s-"),name:"Default",kind:"custom",doc:"",links:{}}]}; S.modes.push(m); save(); go(m.states[0].id); }
});
document.getElementById("left").addEventListener("dblclick",e=>{
  const t=e.target.closest("[data-ren]"); if(!t) return; const m=mode(t.dataset.ren);
  const inp=document.createElement("input"); inp.value=m.name; inp.style.cssText="flex:1;font:inherit;font-weight:600;border:1px solid var(--line);border-radius:5px;padding:1px 4px;background:var(--bg);color:var(--ink)";
  t.replaceWith(inp); inp.focus(); inp.select();
  inp.addEventListener("blur",()=>{ m.name=inp.value.trim()||m.name; save(); renderLeft(); });
  inp.addEventListener("keydown",k=>{ if(k.key==="Enter") inp.blur(); if(k.key==="Escape"){ inp.value=m.name; inp.blur(); } });
});
document.getElementById("tog-sb").addEventListener("click",()=>{ ui.sb=!ui.sb; ui.autoSb=false; document.getElementById("main").classList.toggle("nosb",!ui.sb); setTimeout(()=>{ fit(); placeBadges(); },220); });

/* ================= one continuous spec document, synced with the phone ================= */
const PH_STATE="Trigger · Shows · Behavior (#n for elements, R1 for rules) · Edge cases · Copy";
let lastEd=null, docSig="", progScroll=0;
const structSig=()=>JSON.stringify(S.modes.map(m=>[m.id,m.states.map(s=>s.id)]));
function renderDoc(force){
  const sig=structSig(); if(!force&&sig===docSig&&$("#edscroll")) { syncNames(); return; }
  const keep=$("#edscroll")?.scrollTop||0; docSig=sig;
  const D=document.getElementById("doc");
  const blk=(key,title,html,ph,grp,tag="h3")=>`<section class="dsec" data-sec="${key}" data-grp="${grp}"><${tag} class="sec-h">${title}</${tag}><div class="ed" contenteditable="true" data-key="${key}" data-ph="${esc(ph)}" spellcheck="true">${html||""}</div></section>`;
  let h=`<div class="doc-head"><div class="crumb">${esc(PACK.id)}</div><div class="doc-trow"><div class="doc-title">${esc(PACK.title)}</div><button class="hbtn" id="b-ticket" contenteditable="false">Preview</button></div></div>
    <nav class="jump" id="jump"><button data-jump="brief">Brief</button><button data-jump="solution">Solution</button><button data-jump="edges">Edge cases & touchpoints</button><button data-jump="ds">Design system changes</button><button data-jump="questions">Open questions</button></nav>
    <div class="tools"><button data-cmd="h2" title="Heading">H</button><button data-cmd="ol" title="Numbered list">1.</button><button data-cmd="ul" title="Bullet list">•</button><button data-cmd="indent" title="Indent (Tab)">→</button><button data-cmd="outdent" title="Outdent (Shift+Tab)">←</button><button data-cmd="bold" title="Bold"><b>B</b></button>
      <span class="sp"></span><button class="cnt cy" id="cntC" title="Your comments for Claude (screen + spec): click to go to the next one">0</button><button class="cnt cb" id="cntA" title="Claude's additions (blue) to accept or decline: click to go to the next one">0</button></div>
    <div class="edscroll" id="edscroll">`;
  h+=`<h2 class="grp-h" data-grp-h="brief">Brief</h2>`+blk("brief","Problem, goal & scope",S.docs.brief,"Problem · Goal · Success criteria · In scope · Out of scope","brief");
  h+=`<h2 class="grp-h" data-grp-h="solution">Solution</h2>`+blk("rules","Global rules",S.docs.rules,"Behavior that holds on every screen. One rule per line with an ID: R1, R2 …","solution");
  for(const m of S.modes){
    h+=`<div class="mode-h" data-mode="${m.id}" data-grp="solution">${(()=>{ const n=m.states.length, f=m.states.filter(x=>textOf(x.doc).trim()).length; const cls=f===0?"none":f===n?"all":"some"; return `<span class="mdot ${cls}" data-mdot="${m.id}" title="${f} of ${n} screens specced"></span>`; })()}<input class="mode-name" data-mname="${m.id}" value="${esc(m.name)}" aria-label="Mode name">${m.figma?` <a href="${esc(m.figma)}" target="_blank" rel="noopener">Figma ↗</a>`:""}<button class="mx" data-delm="${m.id}" title="Delete mode">Delete mode</button></div>`;
    for(const st of m.states){ const v=covOf(st);
      h+=`<section class="dsec" data-sec="state:${st.id}" data-grp="solution"><h3 class="sec-h"><input class="sec-name" data-state="${st.id}" value="${esc(st.name)}" aria-label="Screen name"><span class="sec-cov" data-state="${st.id}">${v.n?`${v.c}/${v.n}`:""}</span></h3><div class="ed" contenteditable="true" data-state="${st.id}" data-ph="${PH_STATE}" spellcheck="true">${st.doc||""}</div></section>`; }
    h+=`<button class="addscr" data-adds="${m.id}">+ screen</button>`;
  }
  h+=`<button class="addmode" data-addm="1">+ mode</button>`;
  h+=`<h2 class="grp-h" data-grp-h="edges">Edge cases & touchpoints</h2>`+blk("edges","Across screens",S.docs.edges,"Effects on existing data · Edge cases across screens · Side effects (emails, notifications, tracking). Write “none” if checked.","edges")
    +`<h3 class="tp-group">Touchpoints</h3>`+CONTEXTS.map(t=>`<section class="dsec tp-sec" data-sec="tp:${t.id}" data-grp="edges"><h3 class="sec-h">${esc(t.name)}${t.figma?` <a class="tp-fig" href="${t.figma}" target="_blank" rel="noopener">Figma ↗</a>`:""}${t.note?` <span class="tp-nb">${esc(t.note)}</span>`:""}</h3><div class="ed" contenteditable="true" data-key="tp:${t.id}" data-ph="What differs here: background, what sits below the field, placement, copy. Only the screens that differ." spellcheck="true">${S.docs["tp:"+t.id]||""}</div></section>`).join("");
  h+=`<h2 class="grp-h" data-grp-h="ds">Design system changes</h2>`+blk("ds","Components",S.docs.ds,"One line per component: name · new or changed · what changed · Figma link","ds");
  h+=`<h2 class="grp-h" data-grp-h="questions">Open questions</h2>`+blk("questions","Undecided",S.docs.questions,"What is unclear? Which decisions are still open?","questions");
  h+=`<div style="height:40vh"></div></div>`;
  D.innerHTML=`<div class="resizer" id="resizer" title="Drag to resize"></div>`+h; $("#edscroll").scrollTop=keep;
  updateCovMeta(); updateAcc(); markActive(); markEmpty(); placeAiCtl();
}
function markModes(){ document.querySelectorAll("[data-mdot]").forEach(d=>{ const m=mode(d.dataset.mdot); if(!m) return; const n=m.states.length, f=m.states.filter(x=>textOf(x.doc).trim()).length; d.className="mdot "+(f===0?"none":f===n?"all":"some"); d.title=`${f} of ${n} screens specced`; }); }
function markEmpty(){ markModes(); document.querySelectorAll("#edscroll .dsec").forEach(sec=>{ const ed=sec.querySelector(".ed"); sec.classList.toggle("empty",!textOf(ed.innerHTML).trim()); }); }
function placeAiCtl(){ const sc=$("#edscroll"); if(!sc) return; sc.querySelectorAll(".aictl").forEach(x=>x.remove()); const so=sc.getBoundingClientRect();
  sc.querySelectorAll(".ed span.ai,.ed .imp").forEach((sp,i)=>{ const rs=sp.getClientRects(); const r=rs[0]; if(!r) return; const edEl=sp.closest(".ed")||sp, col=edEl.getBoundingClientRect(), colRight=col.right-parseFloat(getComputedStyle(edEl).paddingRight||0); const c=document.createElement("div"); c.className="aictl"; const roomRight=colRight-so.left+16+96<=sc.clientWidth;
    if(roomRight){ c.style.top=(r.top-so.top+sc.scrollTop-2)+"px"; c.style.left=(colRight-so.left+16)+"px"; }
    else { const rl=rs[rs.length-1], fits=rl.right-so.left+16<=sc.clientWidth-100; c.style.top=(fits?rl.top-so.top+sc.scrollTop-1:rl.bottom-so.top+sc.scrollTop+2)+"px"; c.style.left=(fits?rl.right-so.left+16:colRight-so.left-96)+"px"; } /* 1.0.5: no room after the last line: under it, right-aligned */ /* narrow pane: no margin, fall back to after the last line */
    const imp=sp.classList.contains("imp"); if(imp){ c.classList.add("impc"); c.style.top=(r.top-so.top+sc.scrollTop+2)+"px"; c.style.left=(r.left-so.left+sc.scrollLeft)+"px"; } c.dataset.p=sp.dataset.p||""; const tt=sp.dataset.p&&thAll()[sp.dataset.p]; if(tt&&tt.msgs&&tt.msgs.length) c.classList.add("has"); c.innerHTML=`${imp?`<span class="src" title="Imported from a source you wrote: keep it as your text or drop it">From ${esc(sp.dataset.src||"source")}</span>`:""}<button class="ok" title="${imp?"Keep: make it your text":"Accept: make it your text"}" aria-label="Accept">✓</button><button class="no" title="${imp?"Drop this block":"Decline: remove it"}">✕</button>${thBtn(sp)}`; c._sp=sp; sc.appendChild(c); }); thIds(sc); thDots(sc);  }
function syncNames(){ document.querySelectorAll(".sec-name").forEach(i=>{ const f=find(i.dataset.state); if(f&&document.activeElement!==i&&i.value!==f.s.name) i.value=f.s.name; }); markActive(); }
function markActive(){ const key=ui.sel.kind==="state"?"state:"+ui.sel.state:ui.sel.kind; let grp=null; document.querySelectorAll(".dsec").forEach(x=>{ const on=x.dataset.sec===key; x.classList.toggle("cur",on); if(on) grp=x.dataset.grp; }); if(ui.sel.kind==="state") grp="solution"; document.querySelectorAll("#jump button").forEach(b=>{ const on=b.dataset.jump===grp; b.classList.toggle("on",on); if(on){ const nav=b.parentElement, l=b.offsetLeft-nav.offsetLeft, r=l+b.offsetWidth; if(l<nav.scrollLeft||r>nav.scrollLeft+nav.clientWidth) nav.scrollTo({left:Math.max(0,l-40),behavior:"smooth"}); } }); }
function scrollToSel(){ const key=ui.sel.kind==="state"?"state:"+ui.sel.state:ui.sel.kind; const sec=document.querySelector(`.dsec[data-sec="${CSS.escape(key)}"]`), sc=$("#edscroll"); if(!sec||!sc) return;
  progScroll=Date.now(); const room=sc.clientHeight-112, rel=sec.offsetTop-sc.offsetTop; const top=sec.offsetHeight<=room? Math.min(rel-(sc.clientHeight-sec.offsetHeight)/2+sc.clientHeight*0.2, rel-56) : rel-56; sc.scrollTo({top:Math.max(0,top),behavior:"smooth"}); markActive(); }
/* doc -> prototype sync only for scrolling the user does in the doc; scrolls caused by the prototype (it jumps the doc to the current state) must never reset the prototype's model */
let userDocScroll=0; ["wheel","touchmove","keydown","pointerdown"].forEach(ev=>document.addEventListener(ev,e=>{ if(e.target.closest&&e.target.closest("#edscroll")) userDocScroll=Date.now(); },{passive:true,capture:true}));
function onDocScroll(){ if(Date.now()-progScroll<700) return; if(Date.now()-userDocScroll>1200) return; if(document.body.classList.contains("attn-proto")) return; const sc=$("#edscroll"); if(!sc) return;
  const ae=document.activeElement&&document.activeElement.closest&&document.activeElement.closest(".dsec"); if(ae){ const r=ae.getBoundingClientRect(), sr=sc.getBoundingClientRect(); if(r.bottom>sr.top+40&&r.top<sr.bottom-40) return; } const sr0=sc.getBoundingClientRect(); const top=sr0.top+sc.clientHeight/2;
  let cur=null; for(const sec of sc.querySelectorAll(".dsec")){ if(sec.getBoundingClientRect().top<=top) cur=sec; else break; } if(!cur) return;
  const key=cur.dataset.sec;
  if(key.startsWith("state:")){ const id=key.slice(6); if(ui.sel.kind!=="state"||ui.sel.state!==id){ const f=find(id); if(!f) return; ui.sel={kind:"state",mode:f.m.id,state:id}; ui.live={}; renderStage(); renderLeft(); renderHeader(); markActive(); } }
  else if(ui.sel.kind!==key){ ui.sel={...ui.sel,kind:key}; renderLeft(); markActive(); } }
function updateCovMeta(){ const c=$("#covmeta"); if(!c) return; const refs=allRefs(); const all=new Set(); for(const {s} of flat()) countFor(s).forEach(id=>all.add(elNum(id))); const n=[...all].filter(x=>refs.has(x)).length; c.textContent=`${n} of ${all.size} elements specced`; }
const docEl=document.getElementById("doc");
function edSave(ed){
  ed=ed||lastEd; if(!ed) return;
  const emptyNow=(ed.innerHTML==="<br>"||ed.innerHTML==="<p><br></p>"||ed.innerHTML==="<p></p>");
  let target;
  const val=emptyNow?"":ed.innerHTML;
  if(ed.dataset.state){ const f=find(ed.dataset.state); if(!f) return; f.s.doc=val; target=()=>f.s.doc; }
  else { S.docs[ed.dataset.key]=val; target=()=>S.docs[ed.dataset.key]; }
  if(target()!==val){ setSync("⚠ not saved: reload the page"); syncEl.style.color="#e03131"; return; }
  refreshCoverage(); updateCovMeta(); updateAcc(); markEmpty(); clearTimeout(ui._aiT); ui._aiT=setTimeout(placeAiCtl,250); save();
}
function caretToEnd(node){ const r=document.createRange(); r.selectNodeContents(node); r.collapse(false); const s=getSelection(); s.removeAllRanges(); s.addRange(r); }
function inAsk(){ const s=getSelection(); const n=s.anchorNode; if(!n) return null; const e=n.nodeType===3?n.parentElement:n; return e&&e.closest?e.closest("mark.ask"):null; }
function curEd(){ const s=getSelection(); const n=s.anchorNode; const e=n&&(n.nodeType===3?n.parentElement:n); const ed=e&&e.closest?e.closest(".ed"):null; if(ed) return ed;
  return lastEd || document.querySelector(`.ed[data-state="${CSS.escape(ui.sel.state||"")}"]`); }
function insertAsk(){
  const ed=curEd(); if(!ed) return; const s=getSelection();
  if(!s.anchorNode||!ed.contains(s.anchorNode)){ ed.focus(); caretToEnd(ed); }
  const open=inAsk(); if(open){ exitAsk(open); return; }
  const r=getSelection().getRangeAt(0); r.collapse(false);
  const m=document.createElement("mark"); m.className="ask"; m.textContent="​"; r.insertNode(m);
  const r2=document.createRange(); r2.setStart(m.firstChild,1); r2.collapse(true); s.removeAllRanges(); s.addRange(r2); lastEd=ed;
}
function exitAsk(m){ const ed=m.closest(".ed"); const t=document.createTextNode(" "); m.after(t); const r=document.createRange(); r.setStart(t,1); r.collapse(true); const s=getSelection(); s.removeAllRanges(); s.addRange(r); edSave(ed); }
function updateAcc(){ const b=$("#acc"); if(b) b.style.display=$("#edscroll span.ai,#edscroll .ed .imp")?"":"none"; }
function depth(node){ let d=0; while(node&&!(node.classList&&node.classList.contains("ed"))){ if(node.tagName==="LI") d++; node=node.parentNode; } return d; }
function exec(cmd){
  const ed=curEd(); if(!ed) return; if(document.activeElement!==ed) ed.focus();
  if(cmd==="h2") document.execCommand("formatBlock",false,"h2");
  if(cmd==="ol") document.execCommand("insertOrderedList");
  if(cmd==="ul") document.execCommand("insertUnorderedList");
  if(cmd==="bold") document.execCommand("bold");
  if(cmd==="indent"){ const s=getSelection(); if(depth(s.anchorNode)<4) document.execCommand("indent"); }
  if(cmd==="outdent") document.execCommand("outdent");
  if(cmd==="ask"){ insertAsk(); return; }
  cleanSpans(ed);
  if(cmd==="accept"){ document.querySelectorAll("#edscroll .ed").forEach(x=>{ if(x.querySelector("span.ai,.imp")){ x.querySelectorAll("span.ai,.imp").forEach(sp=>sp.replaceWith(...sp.childNodes)); edSave(x); } }); placeAiCtl(); return; }
  edSave(ed);
}
docEl.addEventListener("click",e=>{ const b=e.target.closest("[data-cmd]"); if(b){ e.preventDefault(); exec(b.dataset.cmd); return; }
  const j=e.target.closest("[data-jump]"); if(j){ const hd=document.querySelector(`[data-grp-h="${j.dataset.jump}"]`), sc=$("#edscroll"); if(hd&&sc){ progScroll=Date.now(); sc.scrollTo({top:Math.max(0,hd.offsetTop-sc.offsetTop-56),behavior:"smooth"}); const first=document.querySelector(`.dsec[data-grp="${j.dataset.jump}"]`); if(first&&j.dataset.jump!=="solution"){ ui.sel={...ui.sel,kind:first.dataset.sec}; } markActive(); document.querySelectorAll("#jump button").forEach(x=>x.classList.toggle("on",x===j)); } return; }
  const st=e.target.closest("[data-mstat]"); if(st){ const m=mode(st.dataset.mstat); m.status={open:"rework",rework:"done",done:"open"}[m.status]; save(); st.className="stat "+m.status; st.textContent=STAT[m.status]; st.title="Status: "+m.status+" · click to change"; return; }
  const ad=e.target.closest("[data-adds]"); if(ad){ const m=mode(ad.dataset.adds); const ns={id:uid("s-"),name:"New screen",kind:"custom",doc:"",links:{}}; m.states.push(ns); save(); go(ns.id); setTimeout(()=>{ const i=document.querySelector(`.sec-name[data-state="${ns.id}"]`); i?.focus(); i?.select(); },80); return; }
  if(e.target.closest("[data-addm]")){ const m={id:uid("m-"),name:"New mode",status:"open",figma:"",states:[{id:uid("s-"),name:"Default",kind:"custom",doc:"",links:{}}]}; S.modes.push(m); save(); go(m.states[0].id); setTimeout(()=>{ const i=document.querySelector(`.mode-name[data-mname="${m.id}"]`); i?.focus(); i?.select(); },80); return; }
  const dm=e.target.closest("[data-delm]"); if(dm){ const m=mode(dm.dataset.delm); if(!m) return; if(m.states.some(x=>textOf(x.doc).trim())){ dm.textContent="Has specs: delete its screens first"; return; } if(!dm.dataset.arm){ dm.dataset.arm=1; dm.textContent="Click again to delete"; return; } S.modes=S.modes.filter(x=>x!==m); save(); const f=flat()[0]; if(f) go(f.s.id); else render(true); return; }
  const ctl=e.target.closest(".aictl button"); if(ctl){ const sp=ctl.parentElement._sp, ed=sp&&sp.closest(".ed"); if(!ed) return;
    if(ctl.classList.contains("rp")){ openThread(sp); return; }
    thClose(); thDone(sp, ctl.classList.contains("ok") ? "accepted" : "declined");
    if(ctl.classList.contains("ok")) sp.replaceWith(...sp.childNodes);
    else { const li=sp.closest("li"); sp.remove(); if(li&&!textOf(li.innerHTML).trim()) li.remove(); }
    edSave(ed); placeAiCtl(); return; }
});
docEl.addEventListener("mousedown",e=>{ if(e.target.closest("[data-cmd]")) e.preventDefault(); });
function cleanSpans(ed){ const sl=getSelection(); const an=sl.anchorNode, ao=sl.anchorOffset; let hit=false;
  ed.querySelectorAll('span[style]:not(.ai),font').forEach(sp=>{ hit=true; sp.replaceWith(...sp.childNodes); });
  if(hit&&an&&ed.contains(an)){ try{ const r=document.createRange(); r.setStart(an,Math.min(ao,an.nodeType===3?an.length:an.childNodes.length)); r.collapse(true); sl.removeAllRanges(); sl.addRange(r); }catch(_){} } }
function wrapBare(ed){ let changed=false; [...ed.childNodes].forEach(n=>{ if((n.nodeType===3&&n.textContent.trim())||(n.nodeType===1&&/^(SPAN|B|I|A|MARK|STRONG|EM)$/.test(n.tagName))){ const p=document.createElement("p"); n.before(p); p.appendChild(n); while(p.nextSibling&&(p.nextSibling.nodeType===3||/^(SPAN|B|I|A|MARK|STRONG|EM)$/.test(p.nextSibling.tagName||""))) p.appendChild(p.nextSibling); if(p.nextSibling&&p.nextSibling.tagName==="BR") p.nextSibling.remove(); changed=true; } }); return changed; }
docEl.addEventListener("focusin",e=>{ const ed=e.target.closest(".ed"); if(ed){ try{ document.execCommand("defaultParagraphSeparator",false,"p"); }catch(_){} if(wrapBare(ed)) edSave(ed); if(!ed.firstChild){ ed.innerHTML="<p><br></p>"; const r=document.createRange(); r.setStart(ed.firstChild,0); r.collapse(true); const sl=getSelection(); sl.removeAllRanges(); sl.addRange(r); } lastEd=ed; progScroll=Date.now();
  if(ed.dataset.state&&ui.sel.state!==ed.dataset.state){ const f=find(ed.dataset.state); if(f){ ui.sel={kind:"state",mode:f.m.id,state:f.s.id}; ui.live={}; renderStage(); renderLeft(); renderHeader(); markActive(); } } } });
docEl.addEventListener("scroll",e=>{ if(e.target.id==="edscroll") requestAnimationFrame(onDocScroll); },true);
docEl.addEventListener("input",e=>{
  if(e.target.classList.contains("mode-name")){ const m=mode(e.target.dataset.mname); if(m&&e.target.value.trim()){ m.name=e.target.value; save(); } return; }
  if(e.target.classList.contains("sec-name")){ const f=find(e.target.dataset.state); if(f&&e.target.value!==""){ f.s.name=e.target.value; save(); renderLeft(); } return; }
  const ed=e.target.closest(".ed"); if(ed) edSave(ed);
});
docEl.addEventListener("keydown",e=>{
  const ed=e.target.closest&&e.target.closest(".ed"); if(!ed) return;
  if(e.key==="Enter"||e.key==="Escape"){ const m=inAsk(); if(m){ e.preventDefault(); e.stopPropagation(); exitAsk(m); return; } }
  if(e.key==="Tab"){ e.preventDefault(); const s=getSelection();
    if(depth(s.anchorNode)===0){ if(!e.shiftKey) document.execCommand("insertOrderedList"); }
    else exec(e.shiftKey?"outdent":"indent"); edSave(ed); return; }
  if(e.key==="Backspace"){ const s=getSelection(); if(s.isCollapsed&&s.anchorNode){ const el=s.anchorNode.nodeType===3?s.anchorNode.parentElement:s.anchorNode; const li=el.closest("li");
    if(li&&ed.contains(li)){ const r=document.createRange(); r.setStart(li,0); r.setEnd(s.anchorNode,s.anchorOffset);
      if(r.toString().replace(/\u200b/g,"")===""&&!r.cloneContents().querySelector("img,br+*")){ e.preventDefault();
        if(depth(li)>1) document.execCommand("outdent"); else document.execCommand(li.parentElement.tagName==="OL"?"insertOrderedList":"insertUnorderedList");
        cleanSpans(ed); edSave(ed); return; } } } }
  if(e.key===" "){
    const s=getSelection(); if(!s.isCollapsed) return; const n=s.anchorNode; if(n.nodeType!==3) return;
    const before=n.textContent.slice(0,s.anchorOffset); const block=n.parentElement.closest("p,div,h1,h2,h3,li");
    if(block&&block.tagName==="LI") return;
    const map={"1.":"ol","-":"ul","*":"ul","#":"h2","##":"h3"};
    if(map[before]&&(!n.previousSibling)){ e.preventDefault();
      const r=document.createRange(); r.setStart(n,0); r.setEnd(n,s.anchorOffset); s.removeAllRanges(); s.addRange(r); document.execCommand("delete");
      const c=map[before]; if(c==="ol") document.execCommand("insertOrderedList"); else if(c==="ul") document.execCommand("insertUnorderedList"); else document.execCommand("formatBlock",false,c);
      edSave(ed); }
  }
});
docEl.addEventListener("paste",e=>{ const ed=e.target.closest&&e.target.closest(".ed"); if(ed){ e.preventDefault(); const t=(e.clipboardData||window.clipboardData).getData("text/plain").trim();
  if(/^https:\/\/(www\.)?figma\.com\/\S+$/.test(t)){ const nid=(t.match(/node-id=([\d-]+)/)||[])[1]; document.execCommand("insertHTML",false,`<a class="fig" href="${esc(t)}" target="_blank" rel="noopener" contenteditable="false">Figma${nid?" "+nid:""} ↗</a>&nbsp;`); edSave(ed); return; }
  document.execCommand("insertText",false,t); } });
docEl.addEventListener("click",e=>{ const a=e.target.closest("a.fig"); if(a){ e.preventDefault(); window.open(a.href,"_blank","noopener"); } });
/* Option+C removed: comments for Claude are placed with 💬 Comment / Option+click, in the spec and on the screen */

/* attention: clicks in the prototype switch the doc to highlight mode; reading/typing in the doc switches back */
document.getElementById("stage").addEventListener("pointerdown",()=>document.body.classList.add("attn-proto"),true);
docEl.addEventListener("pointerdown",()=>document.body.classList.remove("attn-proto"),true);
docEl.addEventListener("wheel",()=>document.body.classList.remove("attn-proto"),{passive:true,capture:true});
docEl.addEventListener("focusin",()=>document.body.classList.remove("attn-proto"));
/* clicking a screen heading shows that screen in the prototype, like clicking its text */
docEl.addEventListener("focusin",e=>{ const inp=e.target.closest&&e.target.closest(".sec-name"); if(!inp||ui.sel.state===inp.dataset.state) return; const f=find(inp.dataset.state); if(f){ ui.sel={kind:"state",mode:f.m.id,state:f.s.id}; ui.live={}; renderStage(); renderLeft(); renderHeader(); markActive(); } });
/* resize the spec pane */
let userSb=true; try{ const w=+localStorage.getItem("wb-docw"); if(w>=33&&w<=67) document.getElementById("main").style.setProperty("--docw",w+"%"); }catch(e){}
function applyDocW(pct){ const main=document.getElementById("main"); pct=Math.max(33.3,Math.min(66.7,pct)); main.style.setProperty("--docw",pct.toFixed(1)+"%");
  try{ localStorage.setItem("wb-docw",pct.toFixed(1)); }catch(e){} }
docEl.addEventListener("pointerdown",e=>{ if(e.target.id!=="resizer") return; e.preventDefault(); const main=document.getElementById("main"); main.classList.add("dragging"); e.target.setPointerCapture(e.pointerId);
  const mv=ev=>{ applyDocW((innerWidth-ev.clientX)/innerWidth*100); fit(); };
  const up=()=>{ main.classList.remove("dragging"); e.target.removeEventListener("pointermove",mv); e.target.removeEventListener("pointerup",up); setTimeout(()=>{ fit(); placeBadges(); },60); };
  e.target.addEventListener("pointermove",mv); e.target.addEventListener("pointerup",up); });

/* delete a screen by deleting its heading: Backspace in an empty heading merges its text into the section above */
docEl.addEventListener("keydown",e=>{
  const inp=e.target.closest&&e.target.closest(".sec-name"); if(!inp) return;
  if(e.key==="Enter"){ e.preventDefault(); document.querySelector(`.ed[data-state="${CSS.escape(inp.dataset.state)}"]`)?.focus(); return; }
  if(e.key!=="Backspace"||inp.value!=="") return;
  e.preventDefault();
  const f=find(inp.dataset.state); if(!f) return; const m=f.m, i=m.states.indexOf(f.s);
  if(m.states.length<2){ inp.placeholder="Last screen of this mode: delete the mode in the sidebar"; return; }
  if(!inp.dataset.arm){ inp.dataset.arm=1; inp.placeholder="Backspace again deletes this screen (its text moves up)"; return; }
  const prev=m.states[i-1]||m.states[i+1];
  if(textOf(f.s.doc).trim()) prev.doc=(prev.doc||"")+`<p><b>From “${esc(f.s.name||"deleted screen")}”:</b></p>`+f.s.doc;
  for(const st of flat()) for(const k in (st.s.links||{})) if(st.s.links[k]===f.s.id) delete st.s.links[k];
  m.states.splice(i,1); save(); go(prev.id);
  setTimeout(()=>{ const ed=document.querySelector(`.ed[data-state="${CSS.escape(prev.id)}"]`); if(ed){ ed.focus(); caretToEnd(ed); } },80);
});
docEl.addEventListener("focusout",e=>{ const inp=e.target.closest&&e.target.closest(".sec-name"); if(inp){ delete inp.dataset.arm; if(inp.value===""){ const f=find(inp.dataset.state); if(f){ inp.value=f.s.name||"Untitled screen"; } inp.placeholder=""; } } });

/* ================= header ================= */
const tpc=document.getElementById("tpchips"), vp=document.getElementById("varpill");
tpc.innerHTML=CONTEXTS.map(c=>`<button data-c="${c.id}" class="${c.ctx?"":"nb"}" title="${c.ctx?"Show in the prototype · jump to its spec":esc(c.note||"")+" · jump to its spec"}">${c.name}</button>`).join("");
const sc={ set value(x){ tpc.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.c===x)); }, addEventListener(){} };
tpc.addEventListener("click",e=>{ const b=e.target.closest("button[data-c]"); if(!b) return; const t=CONTEXTS.find(c=>c.id===b.dataset.c); if(t.ctx&&t.ctx!==ui.context){ ui.context=t.ctx; sc.value=ui.context; renderStage(); renderLeft(); updateCovMeta(); } setTimeout(flashDots,200); const sec=document.querySelector(`.dsec[data-sec="tp:${t.id}"]`), scr=$("#edscroll"); if(sec&&scr){ progScroll=Date.now(); scr.scrollTo({top:Math.max(0,sec.offsetTop-scr.offsetTop-40),behavior:"smooth"}); } });
const sv={ set value(x){ vp.querySelectorAll("button").forEach(b=>b.classList.toggle("on",b.dataset.v===x)); }, addEventListener(){} };
vp.innerHTML=VARIANTS.map(v=>`<button data-v="${v.id}" title="Design direction">${v.name.replace(/ \(.*\)/,"")}</button>`).join("");
vp.addEventListener("click",e=>{ const b=e.target.closest("button[data-v]"); if(!b) return; ui.variant=b.dataset.v; sv.value=ui.variant; renderStage(); renderHeader(); renderLeft(); updateCovMeta(); });
sc.value=ui.context;
function renderHeader(){ try{ sv.value=ui.variant; sc.value=ui.context; }catch(e){} }
/* touchpoints in the spec: working in a touchpoint's block shows it in the phone */
function tpFocus(e){ const sec=e.target.closest&&e.target.closest('.dsec[data-sec^="tp:"]'); if(!sec) return; const t=CONTEXTS.find(c=>"tp:"+c.id===sec.dataset.sec); if(!t||!t.ctx||t.ctx===ui.context) return; ui.context=t.ctx; sc.value=t.ctx; renderStage(); renderLeft(); updateCovMeta(); }
docEl.addEventListener("click",tpFocus); docEl.addEventListener("focusin",tpFocus);

/* ================= ticket draft (HTML → markdown) ================= */
function md(html){
  const d=document.createElement("div"); d.innerHTML=html||"";
  const walk=(n,lvl,ord)=>{ let o=""; n.childNodes.forEach(c=>{
    if(c.nodeType===3){ o+=c.textContent; return; }
    const t=c.tagName;
    if(t==="MARK"&&c.classList.contains("ask")) return;
    if(t==="A"){ o+=`[${c.textContent.replace(" ↗","")}](${c.getAttribute("href")})`; return; }
    if(t==="H1"||t==="H2") o+=`\n### ${c.textContent}\n`; else if(t==="H3") o+=`\n#### ${c.textContent}\n`;
    else if(t==="P"||t==="DIV") o+=walk(c,lvl)+"\n";
    else if(t==="B"||t==="STRONG") o+=`**${c.textContent}**`;
    else if(t==="BR") o+="\n";
    else if(t==="OL"||t==="UL"){ let i=1; c.childNodes.forEach(li=>{ if(li.tagName!=="LI"){ if(li.tagName==="OL"||li.tagName==="UL") o+=walk({childNodes:[li]},lvl+1); return; }
        const own=[...li.childNodes].filter(x=>!(x.tagName==="OL"||x.tagName==="UL")); const sub=[...li.childNodes].filter(x=>x.tagName==="OL"||x.tagName==="UL");
        o+=`${"   ".repeat(lvl)}${t==="OL"?(i++)+".":"-"} ${walk({childNodes:own},lvl).trim()}\n`; sub.forEach(sl=>o+=walk({childNodes:[sl]},lvl+1)); }); }
    else o+=walk(c,lvl);
  }); return o; };
  return walk(d,0).replace(/\n{3,}/g,"\n\n").trim();
}
function ticketMd(){
  let o=`# Problem, goal & scope\n${md(S.docs.brief)}\n\n# Proposed solution\n## Global rules\n${md(S.docs.rules)}\n`;
  for(const m of S.modes){ o+=`\n## ${m.name}${m.figma?` ([Figma](${m.figma}))`:""}\n`; for(const s of m.states) o+=`\n### ${s.name}\n${md(s.doc)||"_no spec yet_"}\n`; }
  o+=`\n# Edge cases & touchpoints\n${md(S.docs.edges||"")||"_none yet_"}\n\n## Touchpoints\n${CONTEXTS.map(t=>`### ${t.name}${t.note?` (${t.note})`:""}\nFigma: ${t.figma||"–"}\n${md(S.docs["tp:"+t.id]||"")||"_not specced yet_"}`).join("\n\n")}\n\n# Design system changes\n${md(S.docs.ds||"")||"_none_"}\n\n# Open questions\n${md(S.docs.questions)}\n`; return o;
}
const modal=document.getElementById("modal"), card=document.getElementById("mcard");
document.addEventListener("click",e=>{ if(!(e.target.closest&&e.target.closest("#b-ticket"))) return;
  card.innerHTML=`<h2>Ticket preview</h2><p class="meta">Assembled from the workbench: Brief → Global rules → Specs per screen → Open questions.</p><pre class="md">${esc(ticketMd())}</pre><div class="row-end"><button class="hbtn" id="cp">Copy markdown</button><button class="hbtn pri" id="cl">Close</button></div>`;
  modal.classList.add("show");
});
card.addEventListener("click",async e=>{ if(e.target.id==="cl") modal.classList.remove("show"); if(e.target.id==="cp"){ try{ await navigator.clipboard.writeText(ticketMd()); e.target.textContent="Copied"; }catch(err){ e.target.textContent="Copy blocked: select the text"; } } });
modal.addEventListener("click",e=>{ if(e.target===modal) modal.classList.remove("show"); });
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ modal.classList.remove("show"); stageEl.classList.remove("ov"); } });

/* ================= render ================= */
function applyRoute(){ const pv=location.hash==="#prototype"; document.body.classList.toggle("proto",pv);
  if(pv&&ui._protoStart!==true){ ui._protoStart=true; const f=flat().find(x=>x.s.kind===PACK.protoStartKind); if(f){ ui.sel={kind:"state",mode:f.m.id,state:f.s.id}; ui.live={}; } }
  setTimeout(()=>{ fit(); },30); }
window.addEventListener("hashchange",()=>{ applyRoute(); render(); });
const qrBtn=document.getElementById("b-qr"), qrPop=document.getElementById("qr-pop"); let qrDone=false;
qrBtn.addEventListener("click",e=>{ e.stopPropagation(); const open=qrPop.hidden; qrPop.hidden=!open; qrBtn.setAttribute("aria-expanded",open);
  if(open&&!qrDone){ const url=document.getElementById("b-proto").href; document.getElementById("qr-url").textContent=url;
    try{ new QRCode(document.getElementById("qr"),{text:url,width:180,height:180,colorDark:"#3a3a3a",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.M}); qrDone=true; }catch(err){ document.getElementById("qr").textContent="QR could not load. Use Copy link."; } } });
document.addEventListener("click",e=>{ if(!qrPop.hidden&&!e.target.closest("#split")){ qrPop.hidden=true; qrBtn.setAttribute("aria-expanded","false"); } });
document.getElementById("qr-copy").addEventListener("click",async e=>{ try{ await navigator.clipboard.writeText(document.getElementById("b-proto").href); e.target.textContent="Copied"; }catch(err){ e.target.textContent="Copy blocked: select the link above"; } });
function render(force){ renderLeft(); renderStage(); renderDoc(force); renderHeader(); renderLeft(); }
applyRoute();
render();
document.addEventListener("focusout",e=>{ if(needRender&&e.target.closest&&e.target.closest(".ed,.sec-name")){ setTimeout(()=>{ if(needRender&&!tmr&&!saving&&!(document.activeElement&&document.activeElement.closest&&document.activeElement.closest(".ed,.sec-name"))){ needRender=false; render(true); setSync("saved"); } },900); } });
document.fonts?.ready?.then(()=>{ fit(); placeBadges(); renderLeft(); updateCovMeta(); });
initDb();

/* ---- (second script of the original file) ---- */
/* Figma link hover preview: live screenshot of the linked node (cached for 5 min), click opens Figma */
(function(){
  const cache={}, inflight={}; let cur=null, showT=null, hideT=null;
  const card=document.createElement("div"); card.id="figcard"; document.body.appendChild(card);
  const parse=h=>{ try{ const u=new URL(h); if(!/(^|\.)figma\.com$/.test(u.hostname)) return null; const fk=(u.pathname.match(/\/(?:design|file)\/([^/]+)/)||[])[1]; const nid=(u.searchParams.get("node-id")||"").replace("-",":"); return fk&&nid?{fk,nid}:null; }catch(e){ return null; } };
  function getImg(k){ const key=k.fk+"|"+k.nid, c=cache[key]; if(c&&Date.now()-c.t<300000) return Promise.resolve(c.img); if(inflight[key]) return inflight[key];
    return inflight[key]=(async()=>{ const st="assets/fp/"+k.nid.replace(":","-")+".png"; if(await new Promise(ok=>{ const im=new Image(); im.onload=()=>ok(true); im.onerror=()=>ok(false); im.src=st; })){ cache[key]={img:st,t:Date.now()}; return st; }
      let mcp=null; try{ mcp=await window.claude.use("mcp"); }catch(e){} if(!mcp) return null;
      const r=await mcp.callTool("Figma","get_screenshot",{fileKey:k.fk,nodeId:k.nid,maxDimension:480,enableBase64Response:true});
      const img=findImage(r&&r.payload!==undefined?r.payload:r); if(img) cache[key]={img,t:Date.now()}; return img; })().catch(()=>null).finally(()=>{ delete inflight[key]; }); }
  function place(a){ const r=a.getBoundingClientRect(), h=card.offsetHeight||200, w=340; let x=Math.min(Math.max(8,r.left),innerWidth-w-8), y=r.bottom+6; if(y+h>innerHeight-8) y=Math.max(8,r.top-h-6); card.style.left=x+"px"; card.style.top=y+"px"; }
  const cap=a=>{ const t=((a.parentElement&&a.parentElement.textContent)||"").replace(a.textContent,"").trim(); return (t||"Figma").slice(0,40); };
  const body=(inner,cap)=>`<div class="fp-img">${inner}</div><div class="fp-cap"><span>${cap}</span><b>Click to open in Figma ↗</b></div>`;
  function show(a,k){ cur=a; card.dataset.href=a.href; card.innerHTML=body("Loading preview…",esc(cap(a))); card.classList.add("show"); place(a);
    getImg(k).then(img=>{ if(cur!==a) return; card.innerHTML=body(img?`<img src="${img}" alt="">`:"Preview not available",esc(cap(a))); place(a); }); }
  function hide(){ cur=null; card.classList.remove("show"); }
  document.addEventListener("mouseover",e=>{ if(document.body.classList.contains("proto")||document.body.classList.contains("native")) return;
    if(card.contains(e.target)){ clearTimeout(hideT); return; }
    const a=e.target.closest&&e.target.closest('a[href*="figma.com"]'); if(!a){ return; } const k=parse(a.href); if(!k) return;
    clearTimeout(hideT); clearTimeout(showT); if(cur===a) return; showT=setTimeout(()=>show(a,k),250); });
  document.addEventListener("mouseout",e=>{ const a=e.target.closest&&e.target.closest('a[href*="figma.com"]'); if(a||card.contains(e.target)){ clearTimeout(showT); clearTimeout(hideT); hideT=setTimeout(hide,200); } });
  card.addEventListener("click",()=>{ if(card.dataset.href) window.open(card.dataset.href,"_blank","noopener"); hide(); });
  addEventListener("scroll",hide,true);
})();
/* Shortcut "c": toggle Agentation comment mode (not while typing, not with modifiers) */
addEventListener("keydown",e=>{
  if(e.key!=="c"&&e.key!=="C") return;
  if(e.metaKey||e.ctrlKey||e.altKey||e.repeat||e.isComposing) return;
  if(document.body.classList.contains("proto")||document.body.classList.contains("native")) return;
  const isTxt=n=>n&&n.nodeType===1&&(n.tagName==="INPUT"||n.tagName==="TEXTAREA"||n.tagName==="SELECT"||n.isContentEditable||n.getAttribute&&n.getAttribute("role")==="textbox");
  if((e.composedPath?e.composedPath():[e.target]).some(isTxt)) return;
  let a=document.activeElement; while(a){ if(isTxt(a)) return; a=a.shadowRoot&&a.shadowRoot.activeElement; }
  e.preventDefault(); e.stopImmediatePropagation();
  document.dispatchEvent(new KeyboardEvent("keydown",{key:"F",code:"KeyF",ctrlKey:true,shiftKey:true,bubbles:true,cancelable:true}));
},true);
/* Agentation (npm "agentation", bundled in agt.js): visual comments on any element.
   Every note is mirrored into S.agt so Claude can read it from the database. */
window.USE_AGT=true;
(function(){
  const pick=a=>({id:a.id,comment:a.comment,element:a.element,elementPath:a.elementPath,selectedText:a.selectedText||null,nearbyText:(a.nearbyText||"").slice(0,200)||null,attributes:a.attributes||null,isMultiSelect:!!a.isMultiSelect,
    where:(()=>{ try{ const n=document.querySelector(a.elementPath); if(n&&n.closest(".phone")) return "phone"; if(n&&n.closest("#edscroll")) return "spec"; }catch(e){} return a.x!=null&&document.getElementById("pwrap")&&(()=>{const r=document.getElementById("pwrap").getBoundingClientRect(); return a.x>=r.left&&a.x<=r.right?"phone":"page";})(); })(),
    ctx:ui.context,state:ui.sel&&ui.sel.state||null,variant:ui.variant,at:new Date(a.timestamp||Date.now()).toISOString(),status:"pending"});
  const up=(fn)=>{ S.agt=S.agt||[]; fn(); save(); try{ updateCounters(); }catch(e){} };
  addEventListener("agt:add",e=>up(()=>{ S.agt=S.agt.filter(x=>x.id!==e.detail.id); S.agt.push(pick(e.detail)); }));
  addEventListener("agt:update",e=>up(()=>{ const i=S.agt.findIndex(x=>x.id===e.detail.id); if(i>-1) S.agt[i]={...S.agt[i],comment:e.detail.comment}; else S.agt.push(pick(e.detail)); }));
  addEventListener("agt:delete",e=>up(()=>{ S.agt=S.agt.filter(x=>x.id!==e.detail.id); }));
  addEventListener("agt:clear",e=>up(()=>{ const ids=new Set((e.detail||[]).map(a=>a.id)); S.agt=S.agt.filter(x=>!ids.has(x.id)); }));
  addEventListener("agt:submit",e=>up(()=>{ (e.detail.list||[]).forEach(a=>{ if(!S.agt.find(x=>x.id===a.id)) S.agt.push(pick(a)); }); }));
})();

/* ===== 1.0.5: threads on Claude's proposals =====
   Each blue proposal (span.ai) gets an id (data-p). ↩ (or the blue counter) opens a popover anchored BELOW the proposal,
   full column width: messages, the revised proposal with its previous versions, Accept / Decline and the only input.
   Decline takes the input as an optional reason. Stored in S.threads[id] = {msgs:[{w:"h"|"c",t,at}], prev:[old texts], status}.
   A reply from Hannes sets wait=true (yellow, counts in the yellow counter) until Claude answers (Claude writes msgs w:"c", revises the span, wait=false). */
function thAll(){ S.threads=S.threads||{}; return S.threads; }
function thWaiting(){ const T=thAll(); return [...document.querySelectorAll("#edscroll span.ai[data-p],#edscroll .ed .imp[data-p]")].filter(sp=>T[sp.dataset.p]&&T[sp.dataset.p].wait).length; }
function thIds(sc){ let changed=new Set(); sc.querySelectorAll(".ed span.ai,.ed .imp").forEach(sp=>{ if(!sp.dataset.p){ sp.dataset.p=uid("p-"); changed.add(sp.closest(".ed")); } }); changed.forEach(ed=>{ if(ed){ const f=ed.dataset.state?find(ed.dataset.state):null; if(f) f.s.doc=ed.innerHTML; else if(ed.dataset.key) S.docs[ed.dataset.key]=ed.innerHTML; } }); if(changed.size) save(); }
function thBtn(sp){ const t=sp.dataset.p&&thAll()[sp.dataset.p], n=t?t.msgs.length:0; return `<button class="rp${n?(t.wait?" wait":(thIsUnread(sp)?" yours":" seen")):""}" title="${n?(t.wait?"Waiting for Claude":"Claude answered: your turn"):"Reply"}">${n?`<svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 2.5h8v5.5H5L2.5 10V2.5z"/></svg>${n}`:"↩"}</button>`; }
function thDone(sp,status){ const t=sp&&sp.dataset.p&&thAll()[sp.dataset.p]; if(t){ t.status=status; t.wait=false; t.text=sp.textContent; t.at=new Date().toISOString(); } }
function thClose(){ document.querySelectorAll(".aictl.cur").forEach(x=>x.classList.remove("cur")); document.querySelectorAll(".thpop").forEach(x=>x.remove()); document.querySelectorAll("span.ai.thcur,.imp.thcur").forEach(x=>x.classList.remove("thcur")); }
const thEsc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function openThread(sp){
  const sc=$("#edscroll"); if(!sc||!sp||!sp.isConnected) return; thIds(sc); thClose();
  const all=[...sc.querySelectorAll(".ed span.ai,.ed .imp")], i=all.indexOf(sp), id=sp.dataset.p, T=thAll(), t=T[id]||{msgs:[],prev:[]};
  sp.classList.add("thcur"); thSeen(sp); sc.querySelectorAll(".aictl").forEach(c=>c.classList.toggle("cur",c._sp===sp));
  const ed=sp.closest(".ed"), so=sc.getBoundingClientRect(), col=ed.getBoundingClientRect(), rs=sp.getClientRects(), last=rs[rs.length-1];
  const pop=document.createElement("div"); pop.className="thpop"; pop.setAttribute("role","dialog"); pop.setAttribute("aria-label","Thread on this proposal");
  pop.style.top=(last.bottom-so.top+sc.scrollTop+8)+"px"; pop.style.left=(col.left-so.left)+"px"; pop.style.width=Math.min(col.width,560)+"px";
  pop.style.setProperty("--ax",Math.max(14,Math.min((rs[0].left-col.left)+12,Math.min(col.width,560)-24))+"px");
  const msgs=(t.msgs||[]).map(m=>`<div class="m"><span class="who${m.w==="c"?" c":""}">${m.w==="c"?"Claude":"You"}</span>${thEsc(m.t)}</div>`).join("");
  const prev=(t.prev&&t.prev.length)?`<div class="m prop"><span class="who">Revised proposal</span>${thEsc(sp.textContent)}${t.prev.map(x=>`<s>${thEsc(x)}</s>`).join("")}</div>`:"";
  pop.innerHTML=`<div class="ph"><span>Proposal ${i+1} of ${all.length}</span><span class="sp"></span><button data-th="up" title="Previous proposal">↑</button><button data-th="down" title="Next proposal">↓</button><button data-th="x" title="Close (Esc)">✕</button></div>`
    +(msgs||prev?`<div class="msgs">${msgs}${prev}</div>`:"")
    +`<div class="act"><button data-th="ok" class="acc">✓ Accept</button><button data-th="no">✕ Decline</button></div>`
    +`<form class="inp"><textarea rows="1" placeholder="Reply, or why you decline (optional)… (Shift+Enter: new line)" aria-label="Reply"></textarea><button type="submit">Send</button></form>`;
  sc.appendChild(pop);
  const inp=pop.querySelector("textarea");
  const grow=()=>{ inp.style.height="auto"; const lh=parseFloat(getComputedStyle(inp).lineHeight)||19.5, max=lh*7+16; inp.style.height=Math.min(inp.scrollHeight+2,max)+"px"; inp.style.overflowY=inp.scrollHeight+2>max?"auto":"hidden"; };
  inp.addEventListener("input",grow);
  inp.addEventListener("keydown",e=>{ if(e.key==="Enter"&&!e.shiftKey&&!e.isComposing){ e.preventDefault(); pop.querySelector("form").requestSubmit(); } });
  const step=d=>{ const a=[...sc.querySelectorAll(".ed span.ai,.ed .imp")]; if(!a.length){ thClose(); return; } const j=(a.indexOf(sp)+d+a.length)%a.length; a[j].scrollIntoView({block:"center",behavior:"smooth"}); setTimeout(()=>openThread(a[j]),250); };
  const finish=ok=>{ const why=inp.value.trim(); if(why){ T[id]=T[id]||{msgs:[],prev:[]}; T[id].msgs.push({w:"h",t:why,at:new Date().toISOString(),why:!ok}); }
    thDone(sp, ok?"accepted":"declined"); const ed2=sp.closest(".ed");
    if(ok) sp.replaceWith(...sp.childNodes); else { const li=sp.closest("li"); sp.remove(); if(li&&!textOf(li.innerHTML).trim()) li.remove(); }
    edSave(ed2); placeAiCtl(); updateCounters(); const a=[...sc.querySelectorAll(".ed span.ai,.ed .imp")]; thClose(); if(a.length){ const nx=a[Math.min(i,a.length-1)]; nx.scrollIntoView({block:"center",behavior:"smooth"}); setTimeout(()=>openThread(nx),250); } };
  pop.addEventListener("click",e=>{ const b=e.target.closest("[data-th]"); if(!b) return; e.preventDefault(); const k=b.dataset.th;
    if(k==="x") thClose(); else if(k==="up") step(-1); else if(k==="down") step(1); else if(k==="ok") finish(true); else if(k==="no") finish(false); });
  pop.querySelector("form").addEventListener("submit",e=>{ e.preventDefault(); const v=inp.value.trim(); if(!v) return; T[id]=T[id]||{msgs:[],prev:[]}; T[id].msgs.push({w:"h",t:v,at:new Date().toISOString()}); T[id].wait=true; T[id].text=sp.textContent; save(); placeAiCtl(); updateCounters(); openThread(sp); });
  pop.addEventListener("keydown",e=>{ if(e.key==="Escape"){ e.preventDefault(); thClose(); } else e.stopPropagation(); });
  const r=pop.getBoundingClientRect(); if(r.bottom>innerHeight-12) sc.scrollBy({top:r.bottom-innerHeight+24,behavior:"smooth"});
  setTimeout(()=>inp.focus({preventScroll:true}),60);
}
document.addEventListener("keydown",e=>{ if(e.key==="Escape"&&document.querySelector(".thpop")) thClose(); });
document.addEventListener("pointerdown",e=>{ const p=document.querySelector(".thpop"); if(p&&!p.contains(e.target)&&!(e.target.closest&&e.target.closest(".aictl,#cntA"))) thClose(); },true);

/* 1.0.6: controls only for the proposal under the pointer (or with its thread open) */
/* 1.0.8: a short grace period, so the pointer can travel from the proposal to its controls without them disappearing */
let hovT=null;
document.addEventListener("pointerover",e=>{ const sc=$("#edscroll"); if(!sc) return; const sp=e.target.closest&&e.target.closest("#edscroll span.ai,#edscroll .ed .imp"), ctl=e.target.closest&&e.target.closest(".aictl");
  const target=sp||(ctl&&ctl._sp)||null; clearTimeout(hovT);
  const apply=()=>sc.querySelectorAll(".aictl").forEach(c=>c.classList.toggle("hov",!!target&&c._sp===target));
  if(target) apply(); else hovT=setTimeout(apply,450); });

/* ===== 1.0.7: read / unread (direction A) =====
   S.seen[id] = when Hannes last looked at a proposal (opened its thread or hovered it ~1 s).
   Unread = never seen, or Claude wrote in its thread after that. Unread proposals get a blue dot in the margin;
   the blue counter shows the unread count (filled + red dot) and jumps to the next unread one; all read = outlined, shows the open count. */
function thSeenAll(){ S.seen=S.seen||{}; return S.seen; }
function thLastClaude(id){ const t=thAll()[id]; if(!t||!t.msgs) return ""; const c=t.msgs.filter(m=>m.w==="c"); return c.length?c[c.length-1].at||"":""; }
function thIsUnread(sp){ const id=sp&&sp.dataset.p; if(!id) return true; const seen=thSeenAll()[id]; if(!seen) return true; const lc=thLastClaude(id); return !!lc&&lc>seen; }
function thUnread(){ return [...document.querySelectorAll("#edscroll .ed span.ai,#edscroll .ed .imp")].filter(thIsUnread); }
function thSeen(sp){ const id=sp&&sp.dataset.p; if(!id||!thIsUnread(sp)) return; thSeenAll()[id]=new Date().toISOString(); save(); const sc=$("#edscroll"); if(sc){ thDots(sc); sc.querySelectorAll(".aictl").forEach(c=>{ if(c._sp===sp){ const b=c.querySelector(".rp.yours"); if(b){ b.classList.remove("yours"); b.classList.add("seen"); } } }); } updateCounters(); }
function thDots(sc){ sc.querySelectorAll(".undot").forEach(x=>x.remove()); const so=sc.getBoundingClientRect();
  thUnread().forEach(sp=>{ const r=sp.getClientRects()[0]; if(!r) return; const ed=sp.closest(".ed"), lr=(ed||sp).getBoundingClientRect(); const d=document.createElement("i"); d.className="undot"; d.title="Not looked at yet";
    d.style.top=(r.top-so.top+sc.scrollTop+r.height/2-3.5)+"px"; d.style.left=(lr.left-so.left-16)+"px"; sc.appendChild(d); }); }
let thHoverT=null;
document.addEventListener("pointerover",e=>{ const sp=e.target.closest&&e.target.closest("#edscroll span.ai,#edscroll .ed .imp"); clearTimeout(thHoverT); if(sp&&thIsUnread(sp)) thHoverT=setTimeout(()=>thSeen(sp),1000); });
