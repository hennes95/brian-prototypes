/* Add to Home Screen mini tutorial – shared by every pushed prototype.
   Include with: <script src="../../../_shared/a2hs.js" data-name="AI Tutor blocks" defer></script>
   iPhone: Apple allows no one-tap install, so the card guides: 1 Add → 2 Share → then shows 3–5 as pictures
   (Safari's sheet covers the page and the page can't see it). Android/Chrome: one tap opens the install dialog.
   Never shown once the prototype runs from the home screen, after "×", or on desktop. */
(function(){
  var me = document.currentScript, base = me.src.replace(/a2hs\.js.*$/, '');
  var name = me.getAttribute('data-name') || document.title;
  var standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  var KEY = 'a2hs-hidden:' + location.pathname.replace(/[^/]*$/, '');
  function get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  if(standalone || get(KEY)) return;
  var ua = navigator.userAgent, ios = /iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1 && innerWidth <= 600);
  var phone = matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) <= 600;
  if(!phone) return;
  var de = /^de\b/i.test(navigator.language || '');
  var T = de ? {
    title:'Wie eine App öffnen', sub:'Vollbild, ohne Browserleisten. Dauert 10 Sekunden.', add:'Zum Home-Bildschirm',
    s2:'Tippe unten in Safari auf <b>Teilen</b> <span class="i">⬆︎</span> <small>(oder <b>⋯</b> → Teilen)</small>', then:'Dann:',
    s3:'<b>Mehr anzeigen</b>', s4:'<b>Zum Home-Bildschirm</b>', s5:'<b>Hinzufügen</b> oben rechts',
    done:'Fertig? Öffne es jetzt über das Symbol auf deinem Home-Bildschirm.', install:'Installieren', later:'Nicht jetzt'
  } : {
    title:'Open it like an app', sub:'Full screen, no browser bars. Takes 10 seconds.', add:'Add to Home Screen',
    s2:'Tap <b>Share</b> <span class="i">⬆︎</span> in Safari’s bar below <small>(or <b>⋯</b> → Share)</small>', then:'Then:',
    s3:'<b>⌄ More</b> (show more)', s4:'<b>Add to Home Screen</b>', s5:'<b>Add</b> at the top right',
    done:'Done? Now open it from the icon on your home screen.', install:'Install', later:'Not now'
  };
  var css = '.a2hs{position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:2147483646;background:#fff;color:#3a3a3a;border-radius:16px;'
    + 'box-shadow:0 8px 28px rgba(0,0,0,.22),0 0 0 .75px rgba(0,0,0,.08);padding:10px 12px 12px;font:500 13px/1.4 -apple-system,system-ui,sans-serif;max-width:420px;margin:0 auto;-webkit-tap-highlight-color:transparent}'
    + '.a2hs .hd{display:flex;align-items:center;gap:9px}.a2hs .ic{width:30px;height:30px;border-radius:7px;flex:none;background:#3a3a3a center/100% url(' + base + 'icon-180.png)}'
    + '.a2hs .t{font-weight:700;font-size:13.5px}.a2hs .dots{margin-left:auto;display:flex;gap:4px}.a2hs .dots i{width:6px;height:6px;border-radius:3px;background:#ddd;transition:width .2s}.a2hs .dots i.on{background:#3a3a3a;width:14px}'
    + '.a2hs .x{border:0;background:none;color:#aaa;font-size:18px;line-height:1;padding:4px 2px 4px 8px}'
    + '.a2hs p{margin:6px 0 9px;color:#777;font-size:12.5px}.a2hs .go{height:34px;border:0;border-radius:17px;background:#3a3a3a;color:#fff;font:600 13px -apple-system,system-ui,sans-serif;padding:0 16px;box-shadow:0 0 0 3px #fff,0 0 0 5px #0a84ff;animation:a2p 1.6s ease-in-out infinite}'
    + '.a2hs .st{display:flex;align-items:center;gap:8px;margin:5px 0}.a2hs .n{width:20px;height:20px;border-radius:10px;background:#f1f1f1;font-weight:700;font-size:11px;display:flex;align-items:center;justify-content:center;flex:none}'
    + '.a2hs .st.now .n{background:#0a84ff;color:#fff}.a2hs .st span.tx{flex:1;min-width:0}.a2hs small{color:#999;font-size:11px}.a2hs .i{display:inline-block;color:#0a84ff}'
    + '.a2hs .lb{font-size:11px;color:#999;margin:9px 0 2px}.a2hs .st img{height:40px;border-radius:8px;flex:none}'
    + '.a2hs-arrow{position:fixed;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 6px);z-index:2147483646;margin-left:-14px;width:28px;height:44px;animation:a2b 1s ease-in-out infinite}'
    + '@keyframes a2p{50%{box-shadow:0 0 0 3px #fff,0 0 0 8px rgba(10,132,255,.45)}}@keyframes a2b{50%{transform:translateY(8px)}}'
    + '@media (prefers-reduced-motion:reduce){.a2hs .go,.a2hs-arrow{animation:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var card = document.createElement('div'); card.className = 'a2hs'; card.setAttribute('role','dialog'); card.setAttribute('aria-label', T.title);
  var arrow = null, deferred = null;
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred = e; });
  function head(step, total){ var d = ''; for(var i=1;i<=total;i++) d += '<i' + (i===step?' class="on"':'') + '></i>';
    return '<div class="hd"><div class="ic"></div><span class="t">' + (step>1?T.add:T.title) + '</span><span class="dots">' + d + '</span><button class="x" aria-label="' + T.later + '">×</button></div>'; }
  function wire(){ card.querySelector('.x').onclick = function(){ set(KEY,'1'); close(); }; }
  function close(){ card.remove(); if(arrow) arrow.remove(); }
  function step1(){
    card.innerHTML = head(1, ios?3:2) + '<p>' + T.sub + '</p><button class="go">' + (ios ? T.add : T.install) + '</button>'; wire();
    card.querySelector('.go').onclick = function(){
      if(deferred){ deferred.prompt(); deferred.userChoice.then(function(c){ if(c.outcome==='accepted'){ set(KEY,'1'); close(); } }); deferred = null; return; }
      ios ? step2() : step2other(); };
  }
  function step2(){
    card.innerHTML = head(2,3)
      + '<div class="st now"><span class="n">2</span><span class="tx">' + T.s2 + '</span></div>'
            + '<div class="st"><span class="n">3</span><span class="tx">' + T.s3 + '</span><img alt="" src="' + base + 'a2hs-more.png"></div>'
      + '<div class="st"><span class="n">4</span><span class="tx">' + T.s4 + '</span><img alt="" src="' + base + 'a2hs-home.png"></div>'
      + '<div class="st"><span class="n">5</span><span class="tx">' + T.s5 + '</span><img alt="" src="' + base + 'a2hs-add.png"></div>';
    wire();
    arrow = document.createElement('div'); arrow.className = 'a2hs-arrow';
    arrow.innerHTML = '<svg viewBox="0 0 28 44" width="28" height="44" fill="none" stroke="#0a84ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v36M4 29l10 11 10-11"/></svg>';
    document.body.appendChild(arrow);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden && card.isConnected){ if(arrow) arrow.remove(); card.innerHTML = head(3,3) + '<p>' + T.done + '</p>'; wire(); } }, {once:true});
  }
  function step2other(){ card.innerHTML = head(2,2) + '<p>' + (de ? 'Öffne das Browser-Menü <b>⋮</b> und wähle <b>Zum Startbildschirm hinzufügen</b> oder <b>App installieren</b>.' : 'Open the browser menu <b>⋮</b> and choose <b>Add to Home screen</b> or <b>Install app</b>.') + '</p>'; wire(); }
  function show(){ document.body.appendChild(card); step1(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
})();
