/* ⌥Tab workbench switcher (like ⌘Tab on the Mac): hold Option, press Tab to move, let go to switch.
   No space on screen; only visible while switching. Inlined into each workbench (artifacts can't load it from GitHub).
   Config before this script: window.WB_SWITCH = { current:"feature"|"motion", ticket:"BR-7001",
     items:[{id:"feature", name:"Feature", sub:"States & spec", url}, {id:"motion", name:"Animation", sub:"Motion", url}] }
   Order = left to right (Feature left, Animation right). An item without url shows as "not set up yet". */
(function(){
  var C = window.WB_SWITCH; if(!C || !C.items || C.items.length < 2) return;
  var items = C.items, cur = Math.max(0, items.findIndex(function(x){ return x.id === C.current; })), sel = cur, box = null;
  var css = '.wbsw{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;pointer-events:none}'
    + '.wbsw .p{display:flex;gap:10px;padding:12px;border-radius:18px;background:rgba(33,33,33,.92);-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,.1);box-shadow:0 16px 48px rgba(0,0,0,.45);font:500 13px/1.3 system-ui,-apple-system,"SF Pro Display",sans-serif;color:#fff}'
    + '.wbsw .it{width:150px;padding:14px 12px 12px;border-radius:12px;display:flex;flex-direction:column;gap:3px;border:1px solid transparent}'
    + '.wbsw .it.on{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.18)}'
    + '.wbsw .it .t{font-size:10.5px;font-weight:600;letter-spacing:.06em;color:rgba(255,255,255,.45);text-transform:uppercase}'
    + '.wbsw .it b{font-size:15px;font-weight:600;letter-spacing:-.01em}.wbsw .it span{color:rgba(255,255,255,.55);font-size:12px}'
    + '.wbsw .it.off{opacity:.4}.wbsw .it .here{color:#4d8dff}';
  function render(){
    if(!box){ var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
      box = document.createElement('div'); box.className = 'wbsw'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','Switch workbench'); document.body.appendChild(box); }
    box.innerHTML = '<div class="p">' + items.map(function(x,i){
      return '<div class="it' + (i===sel?' on':'') + (x.url||i===cur?'':' off') + '"><span class="t">' + (C.ticket||'') + '</span><b>' + x.name + '</b><span' + (i===cur?' class="here">You are here':'>' + (x.url ? x.sub : 'Not set up yet')) + '</span></div>';
    }).join('') + '</div>';
    box.hidden = false;
  }
  function go(){
    var x = items[sel]; if(box) box.hidden = true; if(sel === cur || !x.url) return;
    var w = null; try{ w = window.open(x.url, '_top'); }catch(e){}
    if(!w){ try{ window.open(x.url, '_blank', 'noopener'); }catch(e){} }
  }
  var open = false;
  window.addEventListener('keydown', function(e){
    if(e.key === 'Tab' && e.altKey && !e.metaKey && !e.ctrlKey){ e.preventDefault(); e.stopPropagation();
      if(!open){ open = true; sel = cur; }
      sel = (sel + (e.shiftKey ? items.length - 1 : 1)) % items.length; render(); return; }
    if(open && e.key === 'Escape'){ open = false; sel = cur; if(box) box.hidden = true; }
  }, true);
  window.addEventListener('keyup', function(e){ if(open && (e.key === 'Alt' || !e.altKey)){ open = false; go(); } }, true);
  window.addEventListener('blur', function(){ if(open){ open = false; if(box) box.hidden = true; } });
})();
