import re, json, subprocess
O = open('source/orig.html').read(); L = O.split('\n')
seg = lambda a,b: '\n'.join(L[a-1:b])
# ---------- package pieces ----------
tx2 = '  .card .tx2{position:absolute;left:calc(43px*var(--k,1));top:50%;margin-top:calc(-9.8px*var(--k,1));font:500 calc(14px*var(--k,1))/1.4 var(--font);color:var(--dark);white-space:nowrap;opacity:0;transform-origin:0 50%;pointer-events:none}\n  .card .tx{transform-origin:0 50%}'
kbcss = """  /* V3 Focus / Send: prototype keyboard (iOS light, German QWERTZ). The real app uses the OS keyboard; this one types for real. */
  .kbd{position:absolute;left:0;right:0;bottom:0;height:336px;background:#353535;border-radius:38px 38px 0 0;box-shadow:inset 0 .5px 0 rgba(255,255,255,.18);padding:51px 6px 0;box-sizing:border-box;display:flex;flex-direction:column;gap:11px;z-index:6;transform:translateY(336px);visibility:hidden;will-change:transform;font-family:-apple-system,"SF Pro Text",system-ui,sans-serif;-webkit-user-select:none;user-select:none;touch-action:manipulation}
  .kbd .sug{position:absolute;left:12px;right:12px;top:8px;height:30px;display:flex;align-items:center;font:400 16.5px -apple-system,system-ui,sans-serif;color:#a3a3a3}
  .kbd .sug span{flex:1;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;padding:0 6px}
  .kbd .sug span+span{border-left:1px solid #474747}
  .kbd .row{display:flex;gap:6px;justify-content:center;height:43px}
  .kbd .row i{position:relative;flex:none;width:calc((100% - 60px) / 11);height:43px;border-radius:9px;background:#5b5b5b;display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:400;color:#fff;font-style:normal;cursor:pointer}
  .kbd.num .row:not(:last-child) i{width:calc((100% - 54px) / 10)}
  .kbd .row i.w{width:45px;font-size:17px}
  .kbd .row:last-child i.w{width:43px}
  .kbd .row i.w svg{width:22px;height:22px}
  .kbd .row .gap{flex:1}
  .kbd .row i.sp{flex:1;width:auto}
  .kbd .row i.sp::after{content:"DE EN";position:absolute;right:6px;bottom:4px;font:500 10px/1 -apple-system,system-ui,sans-serif;letter-spacing:-.2px;color:#8e8e8e;transform:scaleX(.8);transform-origin:100% 100%}
  .kbd .row i.go{width:93px;background:#3478f6}
  .kbd .row i.go svg{width:20px;height:20px}
  .kbd .row i.dn{background:#7a7a7a}.kbd .row i.go.dn{background:#1f5fd6}
  .kbd .row i.pop::after{content:attr(data-c);position:absolute;left:50%;bottom:calc(100% + 3px);transform:translateX(-50%);min-width:48px;height:54px;padding:0 4px;box-sizing:border-box;border-radius:10px;background:#6b6b6b;box-shadow:0 2px 8px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;font-size:34px;font-weight:400;color:#fff;z-index:2}
  .kbd .sys{position:absolute;left:0;right:0;bottom:26px;height:27px;display:flex;justify-content:space-between;padding:0 29px;color:#fff}
  .kbd .sys svg{width:27px;height:27px}
  #input{z-index:7;will-change:transform}
  #field.focus{border-width:1.2px}
  #field.focus:not(.has) #txt::placeholder{color:transparent}
  #field .caret{position:absolute;left:16px;top:11.5px;width:1.5px;height:17px;background:#0a84ff;display:none;animation:caret 1s steps(2) infinite;pointer-events:none}
  #field.focus .caret{display:block}
  #field{position:relative}
  @keyframes caret{50%{opacity:0}}
  .flytext{position:absolute;left:0;top:0;font:500 14px/1.4 var(--font);color:var(--dark);white-space:nowrap;pointer-events:none;opacity:0;z-index:8;will-change:transform}"""
screen_css = '\n'.join([seg(10,14), seg(19,115), tx2, seg(162,162), seg(171,174), kbcss])
screen_html = seg(3361,3412)
tpl = lambda i: re.search(r'<script type="text/plain" id="%s">(.*?)</script>' % i, O, re.S).group(1)
spec = tpl('tpl-spec')
rules_v2 = spec[spec.index('## Setup'):spec.index('## Final values')].strip() + '\n\n' + spec[spec.index('## Acceptance'):spec.index('## Test vectors')].strip()
rules_v2 = re.sub(r'^(#+)', lambda m: '#'*(len(m.group(1))+2), rules_v2, flags=re.M)
rules = '''Every animation starts with the user action: finger down for the tap lead (touch dot; a tapped block turns dark 60 ms after touch-down), then the motion plays. The motion is a pure function of time; randomness is seeded (mulberry32, fixed draw order). Page assembly: blocks first, text last. `Total duration` time-scales a whole animation (0 = natural length). No idle animation: the blocks never move on their own; the only wiggle is on hover (devices with a mouse), once when the pointer enters a block. (`buildIdle` is only a demo of that hover wiggle, not something that autoplays.)

### V1 · physical push
The tapped block grows into the screen (×6.4) and pushes its neighbours away like a wall; the neighbours are pre-simulated at 1/120 s (push velocity, inertia, drag, spin, drift, contact momentum) and fade from `bFade`. Back: blocks fly back from where they are. Enter: text first, blocks after (`inLead`).

### V2 · handoff
The tapped block moves to the student message on the open spring, tilts to −flySpin and fades out while the message rises in; the other blocks fall (gravity, kick, spin, drift, wobble, ripple). Full rules below.

### V3 · the block becomes the message
The tapped block’s label is the prompt sent to the tutor, so it flies up-left and lands exactly on the student text line (left 68 px, line centre 163.6 px).
1. Tap: the block turns dark (tap lead `tap` ms).
2. Flight on two springs, Y (up, 0.55 s) and X (left, 0.62 s); different springs bend the path into a slight arc. The tilt reaches 0° at `fStraighten` % of the flight; the block lifts by `fLift` % mid-flight.
3. On the way, fill, border, shadow and icon fade (from `fSurfAt` %, over `fSurfDur` %), and the label crossfades from block style (12 px bold, white on dark) to message style (14 px regular, #3a3a3a) from `fTextAt` % over `fTextDur` %, scaling between the two sizes.
4. Landing: when both springs are at rest the real message text takes over (same position, so no jump). Avatar and “Student - hh:mm” fade in from `fMetaAt` % (rising `fMetaRise` px); Brian follows `fTutorDelay` ms after the flight.
5. The other blocks fall as in V2, with their own values. Back and Enter work as in V2, with their own values.

''' + open('source/rules_v3.md').read().strip()
manifest = {"format":"motion-package/1","id":"ai-tutor-blocks","title":"AI Tutor · Use-case blocks","screen":"AI Tutor home screen","valuesRevision":1,
  "artboard":{"w":402,"h":874,"statusBar":40},"fonts":"Nunito Sans 500 / 700 (Google Fonts); Inter 600 for the status-bar time",
  "fontLinks":["https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@500;700&display=swap"],
  "variants":[{"id":"B","name":"V1","about":"physical push"},{"id":"C","name":"V2","about":"handoff: block flies to the message, the others fall"},{"id":"D","name":"V3","about":"block flies into the student message and becomes its text"}],
  "defaultVariant":"D",
  "animations":[{"id":"enter","name":"Enter","trigger":"open the AI Tutor tab"},{"id":"open","name":"Open","trigger":"tap a block"},{"id":"focus","name":"Focus","trigger":"tap the message field","variants":["D"]},{"id":"blur","name":"Back out","trigger":"tap outside the field while typing","variants":["D"]},{"id":"back","name":"Back","trigger":"tap “+” in the chat header"}],
  "keyframeFormat":"phase: open = block tapped, back = plus button pressed (blocks fly back to the tower), enter = tab entry (blocks fly in); every animation starts with the user action (touch=[x,y,scale,opacity,type] finger down for the tap lead, pressed = tapped block dark) and then the animation plays; frames[].blocks[j]=[centerX,centerY,rotationDeg,scale,opacity] in artboard px (scale = resize the block, not a raster scale); intro = empty-state opacity; chat=[studentMsg,brianMsg,replyShown] 0-1; shake=[dx,dy] whole artboard; V3 frames add morph = {block, surface opacity, chipLabel [opacity, scale], messageLabel [opacity, scale], studentText}",
  "interactionDefaults":{"pressMs":150,"note":"one press / tap length for every UI interaction that starts an animation"},
  "values":{k:x for k,x in json.load(open('values.json'))['values'].items() if 'Blur' not in k and k!='blurSpring3'}}   # the values saved in the workbench
manifest['vectors'] = json.loads(subprocess.run(['node','vec.js'],input=json.dumps(manifest).encode(),capture_output=True,check=True).stdout)
engine = open('out/motion-engine.js').read()
F = '````'
boot_md = '\n'.join(['# bootstrap','<!-- motion:rules -->', rules, '<!-- /motion:rules -->',
  F+'json motion:manifest', json.dumps(manifest, ensure_ascii=False), F, F+'html motion:screen-html', screen_html, F, F+'css motion:screen-css', screen_css, F,
  F+'js motion:engine', engine.strip(), F, F+'dart motion:screen-dart', open('source/screen.dart').read().strip(), F, F+'tsx motion:screen-react', open('source/screen.tsx').read().strip(), F, F+'ts motion:ref-ts', open('out/ref_v3.out.ts').read().strip(), F, F+'dart motion:ref-dart', open('out/ref_v3.out.dart').read().strip(), F, ''])
open('out/motion-package.md','w').write(boot_md)
for name, txt in [('dart',open('source/screen.dart').read()),('tsx',open('source/screen.tsx').read()),('engine',engine),('html',screen_html),('css',screen_css),('ts',open('out/ref_v3.out.ts').read()),('dart',open('out/ref_v3.out.dart').read())]:
    assert '\n````' not in txt, name
# ---------- shell page ----------
split = re.search(r'<div class="split">.*?</div></div>', L[3428]).group(0)
split = re.sub(r'<div id="tlMenu">.*?</div>', '<div id="tlMenu"><button data-m="both">GIF + Figma keyframes</button><button data-m="gif">GIF only</button><button data-m="fig">Figma keyframes only</button><button data-m="pkg">Motion package (developer handoff)</button><span class="msep"></span><button id="loadPkg">Load a package…</button></div>', split)
shell_css = seg(15,18) + '\n' + seg(117,169) + '''
  #vtabs{align-items:center}
  #vtabsBtns{display:flex;gap:2px}
  .vec{position:fixed;left:12px;top:50px;z-index:3;font:500 11px var(--ui);padding:4px 8px;border-radius:7px;background:#fff;border:1px solid #e2e2e2;color:#555}
  .vec.ok{color:#1d7a3a;border-color:#bfe3c9;background:#f2fbf4}
  .vec.bad{color:#a42a1f;border-color:#f0c4bf;background:#fdf3f2}
  .vec.warn{color:#7a5a00;border-color:#efdca8;background:#fffaf0}
  #wbNote{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:30;max-width:min(560px,calc(100vw - 32px));background:#222;color:#fff;border-radius:9px;padding:8px 12px;font:500 12px/1.4 var(--ui)}
  #tl #tlMenu .msep{height:1px;background:#eee;margin:3px 6px}
  .wb-fail{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:32px;background:#fff;font:500 14px/1.5 var(--ui);color:#333;border:1px solid #ddd}
  #tlMenu{min-width:230px}
  #tl{z-index:2147483600}
  #tlCopy,#wbNote{z-index:2147483601}'''
page = '\n'.join([
  '<title>AI Tutor Motion Workbench</title>',
  '<link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@500;700&display=swap" rel="stylesheet">',
  '<style>', shell_css, '</style>', '<style id="screen-css"></style>', seg(176,3357),
  '<div id="stage"></div>',
  '<div id="vtabs"><div id="vtabsBtns"></div></div><span id="vecBadge" class="vec"></span>',
  '<div id="wbNote" hidden></div>',
  '<div id="tlCopy"><p id="tlCopyMsg"></p><textarea id="tlText" readonly aria-label="Export text"></textarea></div>',
  '<div id="tl">',
  '  <div class="row r1"><div class="chips" id="kindSeg" title="Which animation the timeline shows"></div></div>',
  '  <div class="row r2">',
  '    <button id="tlPlay" aria-label="Play / pause" disabled></button>',
  '    <div class="track"><input id="tlRange" type="range" min="0" max="1000" step="1" value="0" disabled aria-label="Timeline position"><div id="tlTicks"></div></div>',
  '    <span class="time" id="tlTime">Loading…</span>',
  '    <button id="tlRoll" disabled title="Same animation, new random values">Re-roll</button>',
  '    <span class="sep"></span>',
  '    '+split,
  '  </div>','</div>',
  '<input type="file" id="pkgFile" accept=".md,.markdown,.txt,text/markdown" hidden>',
  seg(3886,3887), seg(3888,12114),
  '<script src="./motion-engine.js"></script>',
  '<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>',
  '<script>window.MWB_URL = "https://claude.ai/artifact/E61jktbwanbpFAARpqKe4A"; window.MWB_PHONE_URL = "https://hennes95.github.io/brian-prototypes/br-7001/motion/use-case-blocks/";</script>',
  '<script>window.WB_SWITCH = {current:"motion", ticket:"BR-7001", items:[{id:"feature", name:"Feature", sub:"States & spec", url:"https://claude.ai/artifact/M7ybx2SUitMz1F8t5c9cRo"}, {id:"motion", name:"Animation", sub:"Motion", url:"https://claude.ai/artifact/E61jktbwanbpFAARpqKe4A"}]};</script>',
  '<script>' + open('../../../_shared/wbswitch.js').read() + '</script>',
  '<script>', open('source/shell.js').read(), '</script>',
  '<style>', open('source/ui.css').read(), '</style>',
  '<script>', open('source/ui.js').read(), '</script>'])
open('out/index.html','w').write(page)
print('md', len(boot_md), 'page', len(page))
