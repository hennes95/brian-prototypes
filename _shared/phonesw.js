/* Phone switcher (Hannes 23.11): in a phone build the workbench chrome is hidden, so touchpoints and variants can't be switched.
   Two-finger tap: touchpoint pills slide in from the top, variant pills from the bottom. Tap a pill to switch.
   Two-finger tap again, or a tap anywhere outside the pills, hides them.
   Works for every ticket: it reads the workbench's own (hidden) buttons, #tpchips button[data-c] and #varpill button[data-v],
   and clicks them, so switching runs through the shell's normal code. Loaded by tools/phone_build.py. */
(function(){
  const css=`
  #psw-top,#psw-bot{position:fixed;left:0;right:0;z-index:2147483000;display:flex;gap:8px;overflow-x:auto;padding:10px 14px;
    scrollbar-width:none;-webkit-overflow-scrolling:touch;transition:transform .28s cubic-bezier(.2,.8,.2,1),opacity .2s;opacity:0;pointer-events:none}
  #psw-top::-webkit-scrollbar,#psw-bot::-webkit-scrollbar{display:none}
  #psw-top{top:0;padding-top:calc(env(safe-area-inset-top,0px) + 10px);transform:translateY(-110%)}
  #psw-bot{bottom:0;padding-bottom:calc(env(safe-area-inset-bottom,0px) + 10px);transform:translateY(110%)}
  body.psw-on #psw-top,body.psw-on #psw-bot{transform:none;opacity:1;pointer-events:auto}
  #psw-top button,#psw-bot button{flex:none;border:1px solid #3a3a3a;background:#fff;color:#3a3a3a;border-radius:999px;padding:8px 14px;
    font:600 14px/1.2 -apple-system,BlinkMacSystemFont,"Nunito Sans",sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.18);white-space:nowrap}
  #psw-top button.on,#psw-bot button.on{background:#3a3a3a;color:#fff}
  #psw-top .lbl,#psw-bot .lbl{flex:none;align-self:center;font:600 11px/1 -apple-system,sans-serif;color:#fff;background:rgba(58,58,58,.85);border-radius:6px;padding:5px 7px;text-transform:uppercase;letter-spacing:.04em}
  #psw-hint{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 90px);transform:translateX(-50%);z-index:2147483001;
    background:rgba(58,58,58,.92);color:#fff;font:500 14px/1.35 -apple-system,sans-serif;padding:10px 14px;border-radius:12px;max-width:80vw;text-align:center;transition:opacity .4s}`;
  const st=document.createElement("style"); st.textContent=css; document.head.appendChild(st);
  const top=document.createElement("div"); top.id="psw-top"; top.setAttribute("aria-label","Touchpoints");
  const bot=document.createElement("div"); bot.id="psw-bot"; bot.setAttribute("aria-label","Variants");
  function src(sel){ return [...document.querySelectorAll(sel)]; }
  function build(){
    const tps=src("#tpchips button[data-c]").filter(b=>!b.classList.contains("nb"));
    const vs=src("#varpill button[data-v]");
    top.innerHTML=(tps.length?'<span class="lbl">Touchpoint</span>':"")+tps.map(b=>`<button data-c="${b.dataset.c}" class="${b.classList.contains("on")?"on":""}">${b.textContent.trim()}</button>`).join("");
    bot.innerHTML=(vs.length>1?'<span class="lbl">Variant</span>':"")+(vs.length>1?vs.map(b=>`<button data-v="${b.dataset.v}" class="${b.classList.contains("on")?"on":""}">${b.textContent.trim()}</button>`).join(""):"");
    top.hidden=!tps.length; bot.hidden=vs.length<2;
  }
  function show(on){ if(on) build(); document.body.classList.toggle("psw-on",on); }
  const isOn=()=>document.body.classList.contains("psw-on");
  function pick(e){ const b=e.target.closest("button"); if(!b) return; e.preventDefault(); e.stopPropagation();
    const real=b.dataset.c?document.querySelector(`#tpchips button[data-c="${b.dataset.c}"]`):document.querySelector(`#varpill button[data-v="${b.dataset.v}"]`);
    if(real) real.click(); setTimeout(build,60); }
  top.addEventListener("click",pick); bot.addEventListener("click",pick);
  /* two-finger tap: two touches down, lifted within 350ms, barely moved (not a pinch or a scroll) */
  let t0=0, start=null, multi=false, moved=false, pendingClose=false;
  document.addEventListener("touchstart",e=>{
    if(e.touches.length===2){ pendingClose=false; multi=true; moved=false; t0=Date.now(); start={}; [...e.touches].forEach(t=>start[t.identifier]=[t.clientX,t.clientY]); }
    else if(e.touches.length===1&&isOn()&&!e.target.closest("#psw-top,#psw-bot")){ e.preventDefault(); e.stopPropagation(); pendingClose=true; }
  },{capture:true,passive:false});
  const far=t=>{ const p=start&&start[t.identifier]; return p&&Math.hypot(t.clientX-p[0],t.clientY-p[1])>24; };
  document.addEventListener("touchmove",e=>{ if(multi&&[...e.touches].some(far)) moved=true; },{capture:true,passive:true});
  document.addEventListener("touchend",e=>{
    if(pendingClose&&!e.touches.length){ pendingClose=false; e.preventDefault(); show(false); return; }
    if(!multi) return; if([...e.changedTouches].some(far)) moved=true;
    if(e.touches.length) return; multi=false;
    if(moved||Date.now()-t0>450) return; e.preventDefault(); show(!isOn());
  },{capture:true,passive:false});
  /* desktop check: Alt+click toggles too */
  document.addEventListener("click",e=>{ if(e.altKey&&document.body.classList.contains("proto")){ e.preventDefault(); show(!isOn()); } },true);
  function init(){ document.body.appendChild(top); document.body.appendChild(bot);
    try{ if(!localStorage.getItem("psw-hint")){ const h=document.createElement("div"); h.id="psw-hint"; h.textContent="Tap with two fingers to switch touchpoint and variant";
      document.body.appendChild(h); setTimeout(()=>{ h.style.opacity="0"; setTimeout(()=>h.remove(),500); },4000); localStorage.setItem("psw-hint","1"); } }catch(_){} }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",init); else init();
})();
