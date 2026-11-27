/* BR-6891 ticket versions (quick fix 27.11., until versioning moves into the shell; retro item).
   One list for all versions. The current version is the workbench root; older ones are frozen copies in v<n>/.
   A frozen page sets window.WB_VERSION before this file loads. */
(function(){
  const VERSIONS = [
    { id:"v2", label:"V2", name:"Student access: 3 states", meta:"Current · started 27.11.", path:"index.html" },
    { id:"v1", label:"V1", name:"Hidden toggle", meta:"Frozen 27.11. · handed over 24.11.", path:"v1/index.html", frozen:true }
  ];
  const curId = window.WB_VERSION || "v2";
  const cur = VERSIONS.find(v => v.id === curId) || VERSIONS[0];
  const root = cur.path.includes("/") ? "../" : "";
  const css = `
.wbv{position:relative;display:inline-flex;align-self:center;flex:0 0 auto;margin-right:auto}
.doc-trow .doc-title{width:auto!important;flex:0 1 auto}
.wbv-chip{display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border:0;border-radius:6px;background:#e6f1fb;color:#0c447c;font:600 12px/18px var(--ui,system-ui);cursor:pointer}
.wbv-chip.frozen{background:#faeeda;color:#633806}
.wbv-chip svg{width:12px;height:12px}
.wbv-menu{position:absolute;z-index:999;top:calc(100% + 6px);left:0;width:300px;padding:4px;background:#fff;border:1px solid #ddd;border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);display:none}
.wbv.open .wbv-menu{display:block}
.wbv-it{display:flex;gap:10px;align-items:flex-start;padding:8px 10px;border-radius:6px;color:inherit;text-decoration:none;font:400 13px/1.4 var(--ui,system-ui)}
.wbv-it:hover{background:#f4f4f2}
.wbv-it.on{background:#e6f1fb}
.wbv-it b{display:block;font-weight:600}
.wbv-it span{color:#6b6b6b;font-size:12px}
.wbv-bar{display:flex;align-items:center;gap:8px;margin-top:4px;padding:8px 12px;border-radius:8px;background:#faeeda;color:#633806;font:500 13px/1.4 var(--ui,system-ui)}
.wbv-bar a{margin-left:auto;color:inherit;font-weight:600}
.wb-frozen [contenteditable="true"]{cursor:default}`;
  const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
  const LOCK = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="7" width="10" height="7" rx="1.5"/><path d="M5.5 7V5a2.5 2.5 0 015 0v2"/></svg>`;
  const CARET = `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>`;
  const href = v => root + v.path;
  function build(){
    const w = document.createElement("div"); w.className = "wbv";
    w.innerHTML = `<button class="wbv-chip ${cur.frozen?"frozen":""}" contenteditable="false" aria-haspopup="menu" aria-expanded="false" title="Ticket versions">${cur.frozen?LOCK:""}${cur.label}${CARET}</button>
      <div class="wbv-menu" role="menu">${VERSIONS.map(v => `<a class="wbv-it ${v.id===cur.id?"on":""}" role="menuitem" href="${href(v)}">${v.frozen?LOCK.replace("<svg",'<svg width="16" height="16"'):'<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 2.5l2.5 2.5L6 12.5H3.5V10z"/></svg>'}<div><b>${v.label} · ${v.name}</b><span>${v.meta}</span></div></a>`).join("")}</div>`;
    const btn = w.querySelector(".wbv-chip");
    btn.addEventListener("click", e => { e.stopPropagation(); const o = w.classList.toggle("open"); btn.setAttribute("aria-expanded", o); });
    document.addEventListener("click", e => { if (!w.contains(e.target)) { w.classList.remove("open"); btn.setAttribute("aria-expanded", "false"); } });
    return w;
  }
  function bar(){
    const b = document.createElement("div"); b.className = "wbv-bar"; b.setAttribute("contenteditable","false");
    const now = VERSIONS[0];
    b.innerHTML = `${LOCK.replace("<svg",'<svg width="16" height="16"')}You're viewing ${cur.label} (frozen). Spec and comments are read-only.<a href="${href(now)}">Back to ${now.label}</a>`;
    return b;
  }
  function place(){
    const head = document.querySelector(".doc-head"); if (!head || head.querySelector(".wbv")) return;
    const t = head.querySelector(".doc-title");
    if (t) t.insertAdjacentElement("afterend", build()); else head.appendChild(build());
    if (cur.frozen) (head.querySelector(".doc-trow") || head.querySelector(".wbv")).insertAdjacentElement("afterend", bar());
  }
  function lock(){
    if (!cur.frozen) return;
    document.querySelectorAll('[contenteditable="true"]').forEach(el => { if (!el.closest(".wbv")) el.setAttribute("contenteditable", "false"); });
    document.querySelectorAll("input.sec-name,.doc-title").forEach(el => { el.readOnly = true; });
  }
  if (cur.frozen) document.documentElement.classList.add("wb-frozen");
  const go = () => { place(); lock(); };
  new MutationObserver(go).observe(document.documentElement, { childList:true, subtree:true });
  if (document.readyState !== "loading") go(); else document.addEventListener("DOMContentLoaded", go);
})();
