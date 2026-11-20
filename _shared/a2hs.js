/* Add to Home Screen mini tutorial – shared by every pushed prototype.
   Include with: <script src="../../../_shared/a2hs.js" defer></script>
   iPhone: Apple allows no one-tap install, so the card guides through Safari's steps
   (⋯ → Teilen → Mehr anzeigen → Zum Home-Bildschirm → Hinzufügen). The share sheet covers the page and
   the page can't see it, so all steps show at once, top to bottom. Android/Chrome: one tap opens the install dialog.
   Never shown once the prototype runs from the home screen, after "Not now"/"Done", or on desktop.
   Look: DialKit dark panel (stacked dial containers with hairline dividers). */
(function(){
  var me = document.currentScript, base = me.src.replace(/a2hs\.js.*$/, '');
  var standalone = navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  var KEY = 'a2hs-hidden:' + location.pathname.replace(/[^/]*$/, '');
  function get(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function set(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  if(standalone || get(KEY)) return;
  var ua = navigator.userAgent, ios = /iPhone|iPod/.test(ua);
  var phone = matchMedia('(pointer:coarse)').matches && Math.min(screen.width, screen.height) <= 600;
  if(!phone) return;
  var de = /^de\b/i.test(navigator.language || '');
  var T = de ? {
    title:'Wie eine App öffnen', sub:'Vollbild, ohne Browserleisten. Dauert 10 Sekunden.', cta:'Zum Home-Bildschirm', install:'Installieren', later:'Nicht jetzt',
    s1:'Tippe unten rechts auf <b>⋯</b>', s2:'Tippe auf <b>Teilen</b>', s3:'Tippe auf <b>Mehr anzeigen</b>', s4:'Tippe auf <b>Zum Home-Bildschirm</b>', s5:'Tippe oben rechts auf <b>Hinzufügen</b>',
    back:'Fertig? Öffne es jetzt über das neue Symbol auf deinem Home-Bildschirm.', done:'Fertig',
    android:'Öffne das Browser-Menü <b>⋮</b> und wähle <b>Zum Startbildschirm hinzufügen</b>.'
  } : {
    title:'Open it like an app', sub:'Full screen, no browser bars. Takes 10 seconds.', cta:'Add to Home Screen', install:'Install', later:'Not now',
    s1:'Tap <b>⋯</b> at the bottom right', s2:'Tap <b>Share</b>', s3:'Tap <b>View More</b> (⌄)', s4:'Tap <b>Add to Home Screen</b>', s5:'Tap <b>Add</b> at the top right',
    back:'Done? Now open it from the new icon on your home screen.', done:'Done',
    android:'Open the browser menu <b>⋮</b> and choose <b>Add to Home screen</b>.'
  };
  var F = 'system-ui,-apple-system,"SF Pro Display",sans-serif';
  var css = '.a2hs{position:fixed;left:8px;right:8px;top:calc(env(safe-area-inset-top,0px) + 8px);z-index:2147483646;max-width:420px;margin:0 auto;'
    + 'background:#212121;color:#fff;border:1px solid rgba(255,255,255,.1);border-radius:14px;box-shadow:0 8px 32px rgba(0,0,0,.5);padding:12px;font:500 13px/1.4 ' + F + ';-webkit-tap-highlight-color:transparent}'
    + '.a2hs h3{margin:2px 2px 2px;font:600 15px/20px ' + F + ';letter-spacing:-.01em}'
    + '.a2hs p{margin:0 2px 12px;color:rgba(255,255,255,.6);font-size:13px}'
    + '.a2hs .bt{display:flex;gap:8px}.a2hs button{flex:1;height:36px;border:0;border-radius:8px;font:500 13px ' + F + ';cursor:pointer}'
    + '.a2hs .pri{background:#fff;color:#000}.a2hs .sec{background:rgba(255,255,255,.05);color:rgba(255,255,255,.7)}'
    + '.a2hs ol{list-style:none;margin:0 0 8px;padding:0;border-radius:10px;overflow:hidden}'
    + '.a2hs li{background:rgba(255,255,255,.05);padding:9px 10px;color:rgba(255,255,255,.7)}.a2hs li+li{border-top:1px solid rgba(255,255,255,.08)}'
    + '.a2hs li b{color:#fff;font-weight:600}.a2hs li .n{display:inline-block;width:18px;color:rgba(255,255,255,.4);font-family:"Geist Mono",ui-monospace,monospace;font-size:12px}'
    + '.a2hs li img{display:block;width:100%;border-radius:6px;margin-top:7px}'
    + '.a2hs-arrow{position:fixed;right:calc(15% - 14px);bottom:calc(env(safe-area-inset-bottom,0px) + 4px);z-index:2147483646;width:28px;height:40px;animation:a2b 1s ease-in-out infinite;filter:drop-shadow(0 1px 2px rgba(0,0,0,.25))}'
    + '@keyframes a2b{50%{transform:translateY(7px)}}@media (prefers-reduced-motion:reduce){.a2hs-arrow{animation:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var card = document.createElement('div'); card.className = 'a2hs'; card.setAttribute('role','dialog'); card.setAttribute('aria-label', T.title);
  var arrow = null, deferred = null;
  window.addEventListener('beforeinstallprompt', function(e){ e.preventDefault(); deferred = e; });
  function close(){ set(KEY,'1'); card.remove(); if(arrow) arrow.remove(); }
  function intro(){
    card.innerHTML = '<h3>' + T.title + '</h3><p>' + T.sub + '</p><div class="bt"><button class="sec">' + T.later + '</button><button class="pri">' + (ios ? T.cta : T.install) + '</button></div>';
    card.querySelector('.sec').onclick = close;
    card.querySelector('.pri').onclick = function(){
      if(deferred){ deferred.prompt(); deferred.userChoice.then(function(c){ if(c.outcome==='accepted') close(); }); deferred = null; return; }
      ios ? steps() : other(); };
  }
  function row(n, t, img){ return '<li><span class="n">' + n + '</span>' + t + (img ? '<img alt="" src="' + base + img + '">' : '') + '</li>'; }
  function steps(){
    card.innerHTML = '<ol>' + row(1,T.s1) + row(2,T.s2) + row(3,T.s3,'a2hs-more.png') + row(4,T.s4,'a2hs-home.png') + row(5,T.s5,'a2hs-add.png') + '</ol>'
      + '<div class="bt"><button class="sec">' + T.done + '</button></div>';
    card.querySelector('.sec').onclick = close;
    arrow = document.createElement('div'); arrow.className = 'a2hs-arrow';
    arrow.innerHTML = '<svg viewBox="0 0 28 40" width="28" height="40" fill="none" stroke="#0a84ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3v32M5 26l9 10 9-10"/></svg>';
    document.body.appendChild(arrow);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden && card.isConnected){ if(arrow) arrow.remove();
      card.innerHTML = '<p style="margin-top:2px">' + T.back + '</p><div class="bt"><button class="pri">' + T.done + '</button></div>'; card.querySelector('.pri').onclick = close; } }, {once:true});
  }
  function other(){ card.innerHTML = '<p style="margin-top:2px">' + T.android + '</p><div class="bt"><button class="sec">' + T.done + '</button></div>'; card.querySelector('.sec').onclick = close; }
  function show(){ document.body.appendChild(card); intro(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', show); else show();
})();
