# Builds packs/br-7001 (feature workbench pack) from the BR-7001 motion package's screen code.
#   python3 packs/br-7001/build.py      (from the repo root)
# source/scr.html + source/scr.css = the motion package's `motion:screen-html` / `motion:screen-css` blocks;
# source/snap.json = block rest poses + chat markup, captured from the Animation Workbench once.
# NOTE: the spec texts below are only the defaults for a fresh workbench. Once the workbench was opened,
# the spec lives in the artifact's database; change it there (see Notion > Workbenches > Load a ticket).
import json, re, os
HERE=os.path.dirname(os.path.abspath(__file__))
S=os.path.join(HERE,'source')+'/'
OUT=HERE+'/'
html=open(S+'scr.html').read(); css=open(S+'scr.css').read(); snap=json.load(open(S+'snap.json'))
IDS=['phone','touch','status','header','newChat','intro','illu','blocks','chat','input','field','txt','send','tabbar','tabs']
# ---- markup: ids -> scoped classes
html=html.replace('<div id="phone">','<div class="a7">',1)
for i in IDS[1:]:
    html=re.sub(r'\bid="%s"'%i, 'data-a7="%s"'%i, html)
# put the class onto those elements (data attr selector keeps class lists untouched)
# ---- css: #id -> [data-a7=id], everything scoped under .a7
def scope(sel):
    sel=sel.strip()
    if not sel: return sel
    sel=re.sub(r'#phone\b','.a7',sel)
    for i in IDS[1:]: sel=re.sub(r'#%s\b'%i,'[data-a7="%s"]'%i,sel)
    return sel if sel.startswith('.a7') else '.a7 '+sel
out=[]; i=0; css=re.sub(r'/\*.*?\*/','',css,flags=re.S)
while i<len(css):
    j=css.find('{',i)
    if j<0: break
    head=css[i:j].strip()
    if head.startswith('@keyframes'):
        d=0;k=j
        while True:
            if css[k]=='{': d+=1
            elif css[k]=='}':
                d-=1
                if d==0: break
            k+=1
        out.append(head.replace('@keyframes ','@keyframes a7')+css[j:k+1]); i=k+1; continue
    if head.startswith('@media'):
        d=0;k=j
        while True:
            if css[k]=='{': d+=1
            elif css[k]=='}':
                d-=1
                if d==0: break
            k+=1
        inner=css[j+1:k]; parts=[]
        for m in re.finditer(r'([^{}]+)\{([^{}]*)\}',inner): parts.append(','.join(scope(s) for s in m.group(1).split(','))+'{'+m.group(2)+'}')
        out.append(head+'{'+''.join(parts)+'}'); i=k+1; continue
    k=css.find('}',j)
    body=css[j+1:k]
    body=re.sub(r'animation:(\s*)(pulse|shake)\b',r'animation:\1a7\2',body)
    if head.startswith(':root'): out.append('.a7{'+body+'}')
    else: out.append(','.join(scope(s) for s in head.split(','))+'{'+body+'}')
    i=k+1
pcss='@import url("https://fonts.googleapis.com/css2?family=Nunito+Sans:opsz,wght@6..12,400;6..12,500;6..12,600;6..12,700;6..12,800&display=swap");\n/* BR-7001 · AI Tutor use cases: pack styles (scoped to .a7, the prototype root). Screen styles come from the motion package. */\n'+'\n'.join(out)+'''
.a7{position:relative;width:402px;height:874px;inset:auto;font-family:var(--font);color:var(--dark);text-align:left}
.a7,.a7 *{box-sizing:border-box;margin:0;padding:0}
.a7 .block{transition:none!important}
.a7 .card{border-radius:0;max-height:none}   /* the shell's modal .card style must not reach the blocks (Hannes 20.11: "remove the rounded corners") */
.a7 [data-a7="blocks"] .block .card{cursor:pointer}
/* focus: keyboard up, input sits on it */
.a7 .a7-kb{position:absolute;left:0;right:0;bottom:0;height:336px;background:#d1d3d9;padding:46px 3px 0;display:flex;flex-direction:column;gap:11px;z-index:5}
.a7 .a7-kb .sug{position:absolute;left:0;right:0;top:0;height:44px;display:flex;align-items:center;justify-content:space-around;font:400 16px -apple-system,system-ui,sans-serif;color:#000;border-bottom:.5px solid rgba(0,0,0,.12)}
.a7 .a7-kb .row{display:flex;gap:6px;justify-content:center}
.a7 .a7-kb .row i{width:33px;height:42px;border-radius:5px;background:#fff;box-shadow:0 1px 0 rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font:400 22px -apple-system,system-ui,sans-serif;color:#000;font-style:normal}
.a7 .a7-kb .row i.w{width:46px;background:#acb0ba}.a7 .a7-kb .row i.sp{width:190px}.a7 .a7-kb .row i.go{width:88px;background:#0a84ff;color:#fff;font-size:16px}
.a7.kb [data-a7="input"]{top:486px}
.a7.kb [data-a7="field"]{border-width:1.2px}
.a7.kb [data-a7="tabbar"]{display:none}
.a7 .a7-caret{display:inline-block;width:1.5px;height:17px;background:#0a84ff;vertical-align:-3px;margin-left:1px;animation:a7blink 1s steps(2) infinite}
@keyframes a7blink{50%{opacity:0}}
.a7 .a7-typed{flex:1;font:500 14px/1.4 var(--font);color:var(--dark);padding:4px}
/* awareness tooltip above the AI Tutor tab */
/* awareness tooltip (Figma 12120-160067): over another tab, points at the highlighted AI Tutor tab */
.a7 .a7-tip{position:absolute;left:75px;top:711px;width:252px;min-height:70px;background:var(--dark);color:#fff;border-radius:2px;padding:11px 16px 12px;font:400 12px/1.45 var(--font);z-index:6;text-align:left}
.a7 .a7-tip::after{content:"";position:absolute;left:118px;bottom:-8px;border:8px solid transparent;border-top-color:var(--dark);border-bottom:0}
.a7 .a7-tip b{display:block;font:700 14px/1.4 var(--font);margin-bottom:3px}
.a7.away [data-a7="header"],.a7.away [data-a7="intro"],.a7.away [data-a7="blocks"],.a7.away [data-a7="input"]{visibility:hidden}
.a7 .tab.a7-hl{background:#fff;border:1.2px solid var(--dark);box-shadow:3px 3px 0 var(--dark)}
.a7 .a7-hit{position:absolute;left:0;right:0;top:117px;height:360px;z-index:1}
'''
# ---- blocks: rest poses from the workbench snapshot
blocks=re.findall(r'(<div class="block" style="[^"]*">.*?</div></div></div>)(?=<div class="block"|$)', snap['idle'], flags=re.S)
assert len(blocks)==5, len(blocks)
poses=[re.search(r'style="([^"]*)"',b).group(1) for b in blocks]
labels=[re.sub(r'<[^>]+>','',re.search(r'<span class="tx">(.*?)</span>',b,re.S).group(1)).strip() for b in blocks]
chat=snap['chat']
chat=re.sub(r'(<div class="body"[^>]*>)Create a study plan(</div>)',r'\1__MSG__\2',chat,1)
chat=re.sub(r'Student - \d\d:\d\d','Student - 10:32',chat); chat=re.sub(r'Brian - \d\d:\d\d','Brian - 10:32',chat)
js='''/* BR-7001 · AI Tutor use cases: ticket pack for feature workbench shell 1.0.7 (see workbench/feature/PACK-API.md).
   Screen markup and styles come from the BR-7001 motion package (Animation Workbench), so both workbenches show the same screen.
   Generated by wb2/gen_pack.py from the motion package; the specs below are hand-written. */
const PACK={
  id:"BR-7001", title:"AI Tutor use cases",
  protoUrl:"https://hennes95.github.io/brian-prototypes/br-7001/motion/use-case-blocks/",
  motionUrl:"https://claude.ai/artifact/E61jktbwanbpFAARpqKe4A",
  dbDoc:"workbench/br-7001", lsKey:"wb-br7001",
  ui:{sel:{kind:"state",mode:"idle",state:"idle-rest"},variant:"v5",context:"student"},
  protoStartKind:"idle-rest"
};
const FIG = id => "https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=" + id;
const A7_SCREEN = ''' + json.dumps(html) + ''';
const A7_BLOCKS = ''' + json.dumps(blocks) + ''';
const A7_POSES = ''' + json.dumps(poses) + ''';
const A7_LABELS = ''' + json.dumps(labels) + ''';
const A7_CHAT = ''' + json.dumps(chat) + ''';
const A7_SCOPE = [0,2,3];
const A7_THREADS = ["Create study plan","Practice hard topics","Show knowledge gaps","Explain a topic","Create mock exam"];   /* thread names (Figma dev notice) */                 /* build scope: study plan, knowledge gaps, explain a topic */
const A7_TYPED = "Explain photosynthesis";
const MOTION = (chip, txt) => `<a href="${PACK.motionUrl}" target="_blank" rel="noopener">${txt || "Motion: " + chip} ↗</a>`;   /* ⌥Tab also switches to the Animation Workbench */

/* ================= spec ================= */
const ul = (...items) => `<ul>${items.map(i => Array.isArray(i) ? `<li>${i[0]}<ul>${i.slice(1).map(x=>`<li>${x}</li>`).join("")}</ul></li>` : `<li>${i}</li>`).join("")}</ul>`;
const ai = t => Array.isArray(t) ? t.map(x => `<span class="ai">${x}</span>`) : `<span class="ai">${t}</span>`;
const DOCS = {
  brief: "<h4>Problem</h4>" + ul("Students can't use the AI Tutor as an actual tutor", ["\\"Where should I practice again?\\", \\"What are my knowledge gaps?\\"", "The tutor has no access to the learning history (blocked by the backend ticket)"]) +
    "<h4>Goal</h4>" + ul("Empty state shows use cases as conversation starters (\\"use-case blocks\\")", "Tapping a block starts a new thread with that use case's prompt") +
    "<h4>Scope</h4>" + ul(["Build 3 blocks: Create a study plan, Show my knowledge gaps, Explain a topic", "Practice my hardest topics and Create a mock exam are only in the design to show the component"], "Desktop: shortcut symbols 1–4 on the blocks") +
    "<h4>Out of scope</h4>" + ul("Create a mock exam (own ticket)", "Practice my hardest topics (Practice Mode ticket)"),
  rules: ul("<b>R1</b> Use-case blocks use the block component of the course map activities (with the dots)",
    "<b>R2</b> Tapping a block creates a new thread, named after the use case, and sends its prompt",
    "<b>R3</b> Starting from the message field keeps today's logic (thread name etc.)",
    "<b>R4</b> Whatever starts the chat flies into the student message; everything else crumbles/falls down",
    ai("<b>R5</b> No idle animation: blocks only wiggle on hover (desktop), never on their own")),
  edges: ul(["No activities in the course, or the student hasn't studied anything yet", "Only show \\"Explain a topic\\""],
    "Loading and error: reuse the existing chat states",
    ai("Send with an empty field: send stays disabled, nothing animates"),
    ai("Keyboard closed by the system (e.g. app switch) while focused: blocks come back like \\"back out\\"")),
  ds: ul("New component: Use-case block (icon + short description); icon mapping in Figma"),
  questions: ul("Can the tutor link specific activities that open when tapped? (Jaap)",
    ai("Ticket says \\"default animation pauses when the field is focused\\": replaced by the Typing spec (blocks leave on focus). OK?"),
    ai("Desktop shortcuts: design shows ⌘1–5, ticket says 1–4; with 3 blocks in scope it would be ⌘1–3. Which?"),
    ai("Enter: the design fades text in first, then the blocks; the Animation Workbench builds blocks first, text last. Which order?"),
    ai("Prototype: the header still says AI-Tutor after a block is tapped; the design shows the thread name"),
    ai("Ticket lists an ongoing idle wiggle (\\"default animation\\"): dropped, the only wiggle is on hover (desktop). Update the ticket?"))
};
const STATE_DOCS = {
  "idle-rest": ul(["Entering the tab: illustration and text fade in first, then the blocks fly in from random positions with some spin and settle into the tower", MOTION("Enter")], ai("No idle animation afterwards: the blocks rest"), "Use-case blocks under the intro", "Input field and send as in chat", ["Desktop: a block wiggles once when the pointer enters it (hover)", "Desktop: shortcut ⌘1–5 opens a block; the number shows on the block (mobile/tablet: no number)"]),
  "idle-none": ul("Course has no activities, or the student hasn't studied yet", "Only \\"Explain a topic\\""),
  "idle-tip": ul(["In-app tooltip telling students the AI Tutor improved", "Shown on another tab, pointing at the AI Tutor tab"], "The AI Tutor tab icon is highlighted",
    ["Copy (design)", "<b>AI Tutor just got an upgrade</b>", "It now creates study plans and shows your knowledge gaps."],
    ["Who sees it", "Students who never used the AI Tutor", "Students who haven't used it in the last 3 months"], "Hides on any tap or on the AI Tutor tab"),
  "focus-kb": ul("Tapping the field brings up the keyboard", ["All blocks break away while the keyboard slides up", ai("Same break-away as the untapped blocks in Open"), ai(MOTION("Focus"))], ai("Intro stays, so the screen doesn't look empty"), ai(["Tapping outside or closing the keyboard: blocks come back", MOTION("Back out")])),
  "focus-typed": ul(ai("Student types; send becomes active"), ai("Send → Chat · from the field")),
  "chat-block": ul(["Tapped block flies up and lands on the student message", MOTION("Open")], ["The header shows the new thread's name", "Create study plan · Show knowledge gaps · Explain a topic"], "Other blocks fall away, intro fades", "Tutor message shows the typing dots, then streams", "Thread is named after the use case", ["+ (new chat) goes back to the empty state", MOTION("Back")]),
  "chat-send": ul(ai(["Typed text lifts out of the field and lands on the student message", "Same springs as Open", MOTION("Send")]), ai("Intro fades; avatar, name and tutor dots fade in"), ai("Keyboard stays open, as in other chats"))
};
const MODES = [
  { id:"idle", name:"Empty state", figma:FIG("12115-80"), states:[["idle-rest","Use-case blocks"],["idle-none","No activities yet"],["idle-tip","Awareness tooltip"]] },
  { id:"focus", name:"Typing", figma:"", states:[["focus-kb","Field focused"],["focus-typed","Typing"]] },
  { id:"chat", name:"Chat started", figma:FIG("12319-65399"), states:[["chat-block","From a block"],["chat-send","From the field"]] }
];
const DEFAULT = { v:2, docs:Object.assign({}, DOCS),
  modes: MODES.map(m => ({ id:m.id, name:m.name, status:"open", figma:m.figma, states:m.states.map(([id,name]) => ({ id, name, kind:id, doc:STATE_DOCS[id]||"", links:{} })) })) };
const VARIANTS = [ { id:"v5", name:"Design · 5 blocks" }, { id:"v3", name:"Build scope · 3 blocks" } ];
const CONTEXTS = [ { id:"student", name:"Student · AI Tutor", ctx:"student", figma:FIG("12115-80") } ];
const EL_ORDER = ["a7.block","a7.intro","a7.field","a7.send","a7.tip","a7.kb","a7.student","a7.tutor","a7.plus"];

/* ================= screens ================= */
function a7Blocks(variant, only){
  const idx = only ? only : (variant === "v3" ? A7_SCOPE : [0,1,2,3,4]);
  const slots = idx.length === 5 ? [0,1,2,3,4] : idx.length === 3 ? [1,2,3] : [2];
  return idx.map((b,k) => A7_BLOCKS[b].replace(/^<div class="block" style="[^"]*">/, `<div class="block" data-act="block" data-i="${b}" data-el="a7.block" data-label="Use-case block" style="${A7_POSES[slots[k]]}">`)).join("");
}
const KB = `<div class="a7-kb" data-el="a7.kb" data-label="Keyboard"><div class="sug"><span>„${"Explain"}“</span><span>the</span><span>I</span></div>` +
  ["qwertzuiopü","asdfghjklöä"].map(r => `<div class="row">${[...r].map(c=>`<i>${c}</i>`).join("")}</div>`).join("") +
  `<div class="row"><i class="w">⇧</i>${[..."yxcvbnm"].map(c=>`<i>${c}</i>`).join("")}<i class="w">⌫</i></div><div class="row"><i class="w">123</i><i class="w">☺</i><i class="sp"></i><i class="go">↵</i></div></div>`;
function screen(stateId, variant, m){
  let h = A7_SCREEN, root = "a7";
  const mode = stateId.split("-")[0];
  let blocks = "", chat = "", extra = "";
  if (mode === "idle") blocks = a7Blocks(variant, stateId === "idle-none" ? [3] : null);
  if (stateId === "idle-tip"){ root += " away"; extra = `<div class="a7-tip" data-el="a7.tip" data-label="Awareness tooltip"><b>AI Tutor just got an upgrade</b>It now creates study plans and shows your knowledge gaps.</div>`; }
  if (mode === "focus"){ root += " kb"; extra = KB + `<div class="a7-hit" data-act="blur"></div>`; }
  if (mode === "chat"){ const msg = stateId === "chat-send" ? (m.typed || A7_TYPED) : A7_LABELS[m.block == null ? 0 : m.block];
    chat = A7_CHAT.replace("__MSG__", esc(msg)).replace('class="msg student"','class="msg student" data-el="a7.student" data-label="Student message"').replace('class="msg tutor"','class="msg tutor" data-el="a7.tutor" data-label="Tutor message"');
    if (stateId === "chat-send"){ root += " kb"; extra = KB; } }
  h = h.replace('<div class="a7">', `<div class="${root}">`)
       .replace('<div data-a7="blocks"></div>', `<div data-a7="blocks">${blocks}</div>`)
       .replace('<div data-a7="chat"></div>', `<div data-a7="chat">${chat}</div>`)
       .replace('<div data-a7="intro"', `<div data-a7="intro" data-el="a7.intro" data-label="Intro" ${mode === "chat" ? 'style="opacity:0"' : ""}`)
       .replace('<div data-a7="field">', '<div data-a7="field" data-act="focus" data-el="a7.field" data-label="Input field">')
       .replace('<button data-a7="send"', '<button data-a7="send" data-act="send" data-el="a7.send" data-label="Send"')
       .replace('data-a7="newChat"', 'data-a7="newChat" data-act="plus" data-el="a7.plus" data-label="New chat"');
  if (mode === "focus" && stateId === "focus-typed") h = h.replace(/<input data-a7="txt"[^>]*>/, `<span class="a7-typed">${esc(m.typed || A7_TYPED)}<span class="a7-caret"></span></span>`);
  else if (mode === "focus") h = h.replace(/(<input data-a7="txt"[^>]*>)/, `<span class="a7-typed"><span class="a7-caret"></span></span>`);
  if (stateId === "chat-block") h = h.replace("AI-Tutor</h1>", A7_THREADS[m.block == null ? 0 : m.block] + "</h1>");   /* R2: the thread is named after the use case (design) */
  if (stateId === "idle-tip"){ let n = 0; h = h.replace(/class="tab( active)?"/g, (m0, act) => (++n === 2 ? `class="tab a7-hl${act||""}" data-el="a7.tabhl" data-label="AI Tutor tab (highlighted)"` : m0)); }
  return h.replace(/<\\/div>\\s*$/, extra + "</div>");
}

/* ================= stage ================= */
const stageEl = document.getElementById("stage");
function seed(kind){ return { _m:1, block:0, typed:A7_TYPED }; }
function ensureModel(){ if (!ui.live || !ui.live._m) ui.live = seed(); return ui.live; }
function phoneHTML(st, live, interactive){
  const M = live && live._m ? live : seed(st.kind);
  return `<div class="phone fx" style="width:402px;height:874px">${screen(st.kind, ui.variant, M)}</div>`;
}
function renderStage(){
  const W = document.getElementById("pwrap"); const st = curState(); if (!st){ W.innerHTML = ""; return; }
  const M = ensureModel();
  W.innerHTML = `<svg class="lines" id="lines"></svg>${phoneHTML(st, M, true)}`;
  fit(); placeBadges(); renderMinimap(); setTimeout(() => { try{ placeAgtDots(); updTpBadges(); }catch(e){} }, 30);
}
function fit(){
  const st = document.getElementById("stage"), w = document.getElementById("pwrap"), ph = w && w.querySelector(".phone"); if (!ph) return;
  const pv = document.body.classList.contains("proto");
  const sc = Math.min((st.clientWidth - (pv ? 32 : 64)) / ph.offsetWidth, (st.clientHeight - (pv ? 32 : 112)) / ph.offsetHeight, pv ? 1.4 : 1);
  w.style.transform = `translate(-50%,-50%) scale(${sc})`; ui.scale = sc;
}
window.addEventListener("resize", () => { fit(); try{ placeAiCtl(); }catch(e){} });
function placeBadges(){ ui.elCount = document.querySelectorAll("#pwrap .phone [data-el]").length; }
function refreshCoverage(){
  document.querySelectorAll(".sec-cov[data-state]").forEach(c => { const f = find(c.dataset.state); if (f){ const v = covOf(f.s); c.textContent = v.n ? `${v.c}/${v.n}` : ""; } });
  renderLeft();
}
function go(stateId){ const x = find(stateId); if (!x) return; ui.sel = { kind:"state", mode:x.m.id, state:x.s.id }; ui.live = seed(x.s.kind); render(); scrollToSel(); }
async function loadPreviews(){}

/* ================= prototype behaviour ================= */
function goKeep(stateId, patch){ const x = find(stateId); if (!x) return; Object.assign(ensureModel(), patch || {});
  ui.sel = { kind:"state", mode:x.m.id, state:stateId }; renderStage(); markActive(); renderLeft(); renderHeader(); if (document.body.classList.contains("attn-proto")) scrollToSel(); }
document.getElementById("pwrap").addEventListener("click", e => {
  if (ui.commenting || e.altKey) return;
  const t = e.target.closest("[data-act]"); if (!t) return; e.preventDefault();
  const a = t.dataset.act, cur = ui.sel.state || "";
  if (a === "block" && cur.startsWith("idle")) goKeep("chat-block", { block:+t.dataset.i });
  else if (a === "focus" && cur.startsWith("idle")) goKeep("focus-kb");
  else if (a === "focus" && cur === "focus-kb") goKeep("focus-typed");
  else if (a === "send" && cur === "focus-typed") goKeep("chat-send");
  else if (a === "blur") goKeep("idle-rest");
  else if (a === "plus") goKeep("idle-rest");
});
'''
js += '\n/* ⌥Tab switcher (copy of _shared/wbswitch.js; artifacts cannot load it from GitHub) */\nwindow.WB_SWITCH = {current:"feature", ticket:"BR-7001", items:[{id:"feature", name:"Feature", sub:"States & spec", url:"https://claude.ai/artifact/M7ybx2SUitMz1F8t5c9cRo"}, {id:"motion", name:"Animation", sub:"Motion", url:PACK.motionUrl}]};\n' + open(os.path.join(HERE,'..','..','_shared','wbswitch.js')).read()
open(OUT+'pack.js','w').write(js); open(OUT+'pack.css','w').write(pcss)
open(OUT+'pack.json','w').write(json.dumps({"ticket":"BR-7001","title":"AI Tutor use cases","shell":"feature@1.0.7","notes":"Screen code generated from the BR-7001 motion package (wb2/gen_pack.py). Specs from the Notion ticket; Claude's additions in blue."},indent=2)+'\n')
print('ok', len(js), len(pcss), labels)
