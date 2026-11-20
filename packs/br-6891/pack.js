/* BR-6891 · Hidden course material: ticket pack for feature workbench shell 1.0.0 (see workbench/feature/PACK-API.md).
   Screens: Teacher CMS (desktop, 1280×800) and Student app (phone, 390×844). */
const PACK={
  id:"BR-6891", title:"Hidden course material",
  protoUrl:"https://claude.ai/artifact/5SGQrfZGKW3Fjw9tUKFWEo",
  dbDoc:"workbench/br-6891-v2", legacyDbDoc:"workbench/br-6891", lsKey:"wb-br6891-v2",
  ui:{sel:{kind:"state",mode:"cm",state:"cm-rest"},variant:"v2",context:"cms"},
  protoStartKind:"cm-rest"
};

const FIG = id => "https://www.figma.com/design/c3ccOGwhciWpL7bF0fpF5G/Teacher-CMS?node-id=" + id;

const FILES = [
  { id:"b", name:"Access 3 – Unit 6 Student Book.pdf", usedIn:"Introduction to English Grammar" },
  { id:"e", name:"Access 3 – Unit 6 Exercises.pdf", usedIn:"The City of London, Irregular verbs" },
  { id:"s", name:"Access 3 – Unit 6 Solutions.pdf", usedIn:"The City of London, Irregular verbs" },
  { id:"t", name:"Teacher notes – The City of London.docx", usedIn:"The City of London" },
  { id:"i", name:"Irregular verbs list.pdf", usedIn:"Irregular verbs" },
  { id:"v", name:"Unit 6 Vocabulary.pdf", usedIn:"The City of London, Irregular verbs" },
  { id:"k", name:"Test Unit 6 – Answer key.pdf", usedIn:"Unit 6 Check-In" }
];
const NEW_FILE = { id:"n", name:"Access 3 – Unit 7 Solutions.pdf", usedIn:"–" };

/* esc() comes from the shell */
const SV = (d, w=16, sw=1.8) => `<svg aria-hidden="true" width="${w}" height="${w}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const IC = {
  eye: w => SV('<path d="M2.5 12C3.5 9.5 7 5 12 5s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7z"/><circle cx="12" cy="12" r="3"/>', w),
  eyeOff: w => SV('<path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c5 0 8.5 4.5 9.5 7a13 13 0 0 1-3 4.2M6.6 6.6C4.5 8 3.1 10.1 2.5 12c1 2.5 4.5 7 9.5 7 1.8 0 3.4-.6 4.8-1.5"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/>', w),
  lock: (w, sw=2.4) => SV('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>', w, sw),
  file: w => SV('<path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>', w, 2),
  dl: w => SV('<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>', w),
  plus: w => SV('<path d="M12 5v14M5 12h14"/>', w, 2.4),
  close: w => SV('<path d="M6 6l12 12M18 6L6 18"/>', w, 2.2),
  link: w => SV('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>', w, 2),
  back: w => SV('<path d="M15 5l-7 7 7 7"/>', w, 2),
  check: w => SV('<path d="M5 12.5l4.5 4.5L19 7.5"/>', w, 2.2),
  courses: w => SV('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', w, 1.6),
  library: w => SV('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>', w, 1.6),
  people: w => SV('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M17 14.5c2.3 0 4 1.5 4.6 4"/>', w, 1.6),
  help: w => SV('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7M12 17h.01"/>', w, 1.6)
};


/* ---------- screens ---------- */
const accessCell = (f, hidden, variant) => {
  const btn = `<button class="sa ${hidden?"hid":""}" data-act="sa" data-id="${f.id}" data-el="cm.access" data-label="Student access toggle" aria-pressed="${hidden}" aria-label="${hidden?"Show":"Hide"} ${esc(f.name)} ${hidden?"to":"from"} students">${hidden?IC.eyeOff(14):IC.eye(14)}${hidden?"Hidden":"Visible"}</button>`;
  if (variant === "v1") return btn;
  return `<span class="sa-rest"${hidden?' data-el="cm.rest" data-label="Resting: Hidden as text"':""}>${hidden?"Hidden":""}</span>${btn}`;
};

function teacherShell(inner, overlay){
  return `<div class="t-app">
    <nav class="t-nav" aria-label="Main"><div class="t-logo" aria-hidden="true">B</div>
      <a class="on" href="#">${IC.courses(20)}Courses</a><a href="#">${IC.library(20)}Library</a><a href="#">${IC.people(20)}Directory</a><hr><a href="#">${IC.help(20)}Help Center</a></nav>
    <main class="t-card">
      <div class="t-top"><div><div class="t-school">Georg Büchner Gymnasium</div><h1 class="t-h1">English Grade 7</h1></div><span class="t-btn">Preview Course in App</span></div>
      <div class="t-tabs"><span>Content</span><span>Students</span><span>Analytics</span><span class="on">Course Materials</span><span>Settings</span></div>
      ${inner}
    </main>${overlay||""}</div>`;
}

function courseMaterials(variant, m){
  const files = FILES.concat(m.added ? [NEW_FILE] : []);
  const sel = files.filter(f => m.selected[f.id]);
  const all = sel.length === files.length;
  const colName = variant === "v1" ? "Students" : "Student access";
  const bulk = sel.length ? `<div class="t-bulk" data-el="cm.bulk" data-label="Bulk bar"><b>${sel.length} ${sel.length===1?"file":"files"} selected</b><span class="x-sp"></span>
      <button data-act="bulk-hide" data-el="cm.bulkHide" data-label="Hide from students">${IC.eyeOff(15)}Hide from students</button>
      <button data-act="bulk-show" data-el="cm.bulkShow" data-label="Show to students">${IC.eye(15)}Show to students</button>
      <button class="lnk" data-act="bulk-clear">Clear</button></div>` : "";
  const rows = files.map(f => {
    const hidden = !!m.hidden[f.id];
    return `<tr class="${m.selected[f.id]?"sel":""} ${m.hover===f.id?"hov":""}">
      <td style="width:32px"><input type="checkbox" data-act="sel" data-id="${f.id}" ${m.selected[f.id]?"checked":""} aria-label="Select ${esc(f.name)}"></td>
      <td class="fn"><span class="fi">${IC.file(14)}${hidden?`<span class="lk" data-el="cm.lock" data-label="Lock badge (hidden only)">${IC.lock(8,3)}</span>`:""}</span>${esc(f.name)}</td>
      <td>11.09.2026</td><td>Klasse 7</td><td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(f.usedIn)}</td>
      <td style="width:170px">${accessCell(f, hidden, variant)}</td>
      <td style="width:72px"><button class="x-ib" aria-label="Download ${esc(f.name)}">${IC.dl(16)}</button></td></tr>`;
  }).join("");
  const tip = m.tip ? `<div class="tip" role="tooltip" data-el="cm.tip" data-label="Tooltip"><span>Brian still uses hidden material, but students can't open it when Brian cites it.</span><i>Use this for solutions or teacher notes.</i></div>` : "";
  return `<div class="${variant}" style="display:flex;flex-direction:column;gap:18px;flex:1">${bulk}
    <table><thead><tr>
      <th style="width:32px"><input type="checkbox" data-act="sel-all" ${all?"checked":""} aria-label="Select all files"></th>
      <th>Filename</th><th>Uploaded</th><th>Tags</th><th>Used in</th>
      <th><span data-el="cm.col" data-label="Column name">${colName}</span><button class="info" data-act="tip" aria-expanded="${!!m.tip}" aria-label="What does hidden mean?" data-el="cm.info" data-label="Info icon">i</button>${tip}</th>
      <th>Download</th></tr></thead><tbody>${rows}</tbody></table>
    <div class="t-foot"><button class="t-btn" data-act="add" data-el="cm.add" data-label="Add Course Material">${IC.plus(14)}Add Course Material</button></div></div>`;
}

function uploadDialog(){
  return `<div class="dim"><div class="dlg" role="dialog" aria-label="Add Course Material" style="width:640px">
    <div class="dlg-h"><h2>Add Course Material</h2><button data-act="up-close" aria-label="Close">${IC.close(18)}</button></div>
    <div class="dlg-b">
      <div class="frow"><span class="fi" style="width:32px;height:32px;margin:0">${IC.file(16)}</span><div style="flex:1;display:flex;flex-direction:column"><b style="font-size:14px">${esc(NEW_FILE.name)}</b><span style="font-size:12px;color:#585858">2.4 MB · uploaded</span></div><span style="color:#157ec5">${IC.check(20)}</span></div>
      <div class="callout" data-el="up.callout" data-label="Solutions hint"><span class="lkc">${IC.lock(16,2.2)}</span><div style="display:flex;flex-direction:column;gap:6px"><b style="font-size:16px;font-weight:800">This looks like a solutions file</b><span style="font-size:14px;line-height:1.45">Hide it from students? Brian can still use it to check answers, but students can't open it when Brian cites it.</span></div></div>
      <span style="font-size:13px;color:#585858">You can change this anytime in Course Materials.</span>
    </div>
    <div class="dlg-f"><button class="t-btn sec" data-act="up-keep" data-el="up.keep" data-label="Keep visible">Keep visible</button><button class="t-btn" data-act="up-hide" data-el="up.hide" data-label="Hide from students">Hide from students</button></div>
  </div></div>`;
}

function kbDialog(m){
  const files = FILES;
  const sync = m.kbSync;
  const custom = m.kbCustom;
  const n = sync ? files.length : files.filter(f => custom[f.id]).length;
  const rows = files.map(f => {
    const hidden = !!m.hidden[f.id]; const on = sync || !!custom[f.id];
    return `<div class="kb-row ${sync?"off":""}"><input type="checkbox" ${on?"checked":""} ${sync?"disabled":""} data-act="kb-pick" data-id="${f.id}" aria-label="${esc(f.name)}">
      <span class="fi" style="margin:0;width:22px;height:22px">${IC.file(12)}${hidden?`<span class="lk">${IC.lock(7,3)}</span>`:""}</span>
      <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f.name)}</span>
      ${hidden?`<span class="tag"${f.id==="s"?' data-el="kb.tag" data-label="Hidden tag"':""}>Hidden from students</span>`:""}</div>`;
  }).join("");
  return `<div class="dim"><div class="dlg" role="dialog" aria-label="Edit Knowledge Base" style="width:1016px">
    <div class="dlg-h"><h2>Edit Knowledge Base</h2><button data-act="kb-close" aria-label="Close">${IC.close(18)}</button></div>
    <div class="kb">
      <div class="kb-up"><div class="kb-tabs"><span class="on">Drag &amp; Drop</span><span>Copy &amp; Paste</span><span>Video</span><span>Website</span></div>
        <div class="kb-drop">Drag &amp; Drop<div>or <span>browse for a file</span></div></div></div>
      <div class="kb-list">
        <div class="kb-head">
          <div style="display:flex;align-items:center;gap:8px">${IC.link(16)}<b style="font-size:14px;flex:1">Sync with course materials</b>
            <button class="sw ${sync?"on":""}" role="switch" aria-checked="${sync}" aria-label="Sync with course materials" data-act="kb-sync" data-el="kb.toggle" data-label="Sync toggle"></button></div>
          <span style="font-size:14px;color:#585858;line-height:1.45" data-el="kb.copy" data-label="Sync description">${sync?"All course materials are added and removed automatically, including material that is hidden from students.":"Choose the documents this activity uses. Your selection won't change when the course materials change."}</span>
          <div style="display:flex;align-items:center;gap:12px;font-size:14px;font-weight:600;${sync?"color:#949494":""}"><input type="checkbox" ${sync||n===files.length?"checked":""} ${sync?"disabled":""} aria-label="Select all"><span style="flex:1">Select all</span><span style="font-size:12px;color:#949494">${n} selected</span></div>
        </div>
        <div style="padding:8px 0;overflow:auto">${rows}</div>
      </div>
    </div>
    <div class="dlg-f"><button class="t-btn" ${m.kbDirty?"":'disabled style="background:#c8e9ff"'} data-act="kb-close">Apply Changes</button></div>
  </div></div>`;
}

function student(m){
  const hidChip = `<button class="chip hid" data-act="st-hid" aria-expanded="${!!m.stPop}" aria-label="Teacher material, can't be opened" data-el="st.chipHidden" data-label="Hidden citation chip">${IC.lock(12)}Teacher material</button>`;
  const visChip = `<button class="chip vis" data-act="st-vis" data-el="st.chipVisible" data-label="Visible citation chip">${IC.file(12)}Irregular verbs list, p. 2</button>`;
  const pop = m.stPop ? `<div class="pop" role="status" data-el="st.pop" data-label="Private note">${IC.lock(16,2.2)}<span>Your teacher keeps this material private. Brian can use it to help you, but you can't open it.</span></div>` : "";
  const pdf = m.stPdf ? `<div class="pdf"><div class="pdf-sheet"><header><span>Irregular verbs list.pdf · p. 2</span><button class="x-ib" data-act="st-pdf-close" aria-label="Close">${IC.close(18)}</button></header>
      <div class="pdf-page"><b style="color:#3a3a3a;font-size:14px">Irregular verbs</b><span>be – was/were – been</span><span>do – did – done</span><mark>go – went – gone</mark><span>have – had – had</span><span>see – saw – seen</span></div></div></div>` : "";
  return `<div class="s-app" style="position:relative">
    <div class="s-top"><button class="x-ib" aria-label="Back">${IC.back(20)}</button><div style="display:flex;flex-direction:column"><b style="font-size:16px;font-weight:800">AI Tutor</b><span style="font-size:12px;color:#585858">English Grade 7</span></div></div>
    <div class="s-chat">
      <div class="s-me">What's the past tense of "go"? Is it "goed"?</div>
      <div>Good guess, but "go" is irregular, so it doesn't take -ed. You'll find it in your list of irregular verbs ${visChip}.</div>
      <div class="s-me">Can you check exercise 4b? I wrote "She goed home after school."</div>
      <div style="display:flex;flex-direction:column;gap:10px"><div>Almost! The sentence structure is right, only the verb needs another look ${hidChip}. Which form did you find for "go" in the list?</div>${pop}</div>
    </div>
    <div class="s-in"><span>Ask anything</span></div>${pdf}</div>`;
}


/* ================= spec defaults ================= */
const ul = (...items) => `<ul>${items.map(i => Array.isArray(i) ? `<li>${i[0]}<ul>${i.slice(1).map(x=>`<li>${x}</li>`).join("")}</ul></li>` : `<li>${i}</li>`).join("")}</ul>`;
const DOCS = {
    brief: "<h4>Problem</h4>" + ul("Teachers upload solutions and teacher notes as course material", ["Brian cites them, and students can open the cited PDF", "So solutions leak through the citation"]) +
      "<h4>Goal</h4>" + ul("Brian uses all course material", "Teachers choose per file whether students can open it") +
      "<h4>Out of scope</h4>" + ul("Splitting or redacting solution sections of a document (later idea)"),
    rules: ul("<b>R1</b> \"Hidden from students\" only controls what students can open, never what Brian uses",
      "<b>R2</b> New material is visible by default",
      ["<b>R3</b> Hidden files: the server sends no PDF link and no quote to the app", "Follow-up ticket (Student + Backend)"],
      "<b>R4</b> Lock badge on a file icon means hidden, nothing else"),
    edges: ul(["Existing data", "\"Available to AI Tutor\" unchecked → hidden", "Checked → visible"],
      "Course AI Tutor uses all course material",
      ["Quiz source material students can't see", "Stays in the knowledge base, treated like hidden"]),
    ds: ul("Uploads Table: new column \"Student access\" with hover toggle (V2)", "Citation chip: new hidden state (Student app)"),
    questions: ul("Column name: \"Student access\" or \"Visible to students\"?", "Hover toggle: does it also need a keyboard path beyond focus (e.g. row menu)?", "Solutions detection: file name only, or also content?")
  };
const STATE_DOCS = {
    "cm-rest": ul("Column \"Student access\" (#1) with info icon (#2)", ["Hidden files", "Show \"Hidden\" as text only (#3)", "Lock badge on the file icon (#4)"], "Visible files show nothing in the column"),
    "cm-hover": ul(["Row hover or keyboard focus in the row", "Toggle appears in the column (#5)", "Visible file: \"Visible\" with eye icon"], "Click toggles the state, row stays hovered"),
    "cm-hover-h": ul(["Hidden file on hover", "Toggle shows \"Hidden\" with crossed-out eye", "Light grey, not dark (Hannes 20.11)"], "Click → visible, lock badge disappears"),
    "cm-tip": ul("Tooltip on the info icon (#6)", ["Copy", "\"Brian still uses hidden material, but students can't open it when Brian cites it.\"", "\"Use this for solutions or teacher notes.\""]),
    "cm-bulk": ul(["One or more rows selected", "Bulk bar above the table (#7)", "\"Hide from students\" (#8) / \"Show to students\" (#9) / Clear"], "After the action the selection clears"),
    "up-detect": ul(["Uploaded file name looks like solutions", "\"Lösung\", \"Solution\", \"Answer key\", \"Musterlösung\""], ["Ask once (#10)", "\"Keep visible\" (#11) / \"Hide from students\" (#12)"], "Can be changed anytime in Course Materials"),
    "kb-sync": ul(["Toggle on (#13)", "List read-only, all files ticked"], "Description (#14): \"All course materials are added and removed automatically, including material that is hidden from students.\"", "Hidden files keep the lock and a \"Hidden from students\" tag (#15)"),
    "kb-custom": ul("Toggle off: list active, as in the 18.11 spec", "Hidden tag stays visible so the teacher knows students can't open those files"),
    "st-vis": ul(["Visible citation chip (#16)", "Tap opens the PDF at the cited page", "Quote highlighted"]),
    "st-hid": ul(["Hidden citation: grey chip \"Teacher material\" with lock (#17)", "No file name, no page"], ["Tap shows a note (#18)", "\"Your teacher keeps this material private. Brian can use it to help you, but you can't open it.\""], "Follow-up ticket (Student + Backend)")
  };
const MODES = [
  { id:"cm", name:"Course Materials", ctx:"cms", device:"desktop", figma:FIG("10491-24801"), states:[["cm-rest","Resting"],["cm-hover","Row hover (visible file)"],["cm-hover-h","Row hover (hidden file)"],["cm-tip","Info tooltip"],["cm-bulk","Rows selected"]] },
  { id:"up", name:"Upload", ctx:"cms", device:"desktop", figma:"", states:[["up-detect","Solutions detected"]] },
  { id:"kb", name:"Edit Knowledge Base", ctx:"kb", device:"desktop", figma:FIG("10442-5055"), states:[["kb-sync","Synced (toggle on)"],["kb-custom","Custom selection"]] },
  { id:"st", name:"Student · AI Tutor", ctx:"student", device:"phone", figma:"", states:[["st-vis","Visible citation opened"],["st-hid","Hidden citation tapped"]] }
];
const DEFAULT = { v:2, docs:Object.assign({}, DOCS),
  modes: MODES.map(m => ({ id:m.id, name:m.name, status:"open", figma:m.figma, states:m.states.map(([id,name]) => ({ id, name, kind:id, doc:STATE_DOCS[id]||"", links:{} })) })) };
const VARIANTS = [ { id:"v1", name:"Toggle always" }, { id:"v2", name:"Hover only" } ];
const CONTEXTS = [
  { id:"cms", name:"Course Materials", ctx:"cms", figma:FIG("10491-24801") },
  { id:"kb", name:"AI Dialogue · Knowledge Base", ctx:"kb", figma:FIG("10442-5055") },
  { id:"student", name:"Student · AI Tutor / Chatbot", ctx:"student" }
];
const EL_ORDER = ["cm.col","cm.info","cm.rest","cm.lock","cm.access","cm.tip","cm.bulk","cm.bulkHide","cm.bulkShow","up.callout","up.keep","up.hide","kb.toggle","kb.copy","kb.tag","st.chipVisible","st.chipHidden","st.pop","cm.add"];
const DEVICES = { desktop:{ w:1280, h:800 }, phone:{ w:390, h:844 } };
const META = id => MODES.find(m => m.id === id) || MODES[0];

/* data from the first BR-6891 workbench (its own format, 20.11.26 morning) */
function migrate(old){
  const d = structuredClone(DEFAULT); if (!old || !old.docs) return d;
  Object.assign(d.docs, old.docs);
  for (const m of d.modes){ if (old.modeStatus && old.modeStatus[m.id]) m.status = old.modeStatus[m.id];
    for (const s of m.states){ const o = old.states && old.states[s.id]; if (o && typeof o.doc === "string") s.doc = o.doc; } }
  if (old.elnums) d.elnums = Object.assign({}, old.elnums);
  return d;
}

/* ================= prototype model ================= */
function preset(stateId, m){
    const base = { hidden: m.hidden || { s:true, t:true, k:true }, added: !!m.added, selected:{}, tip:false, hover:null,
      kbSync: true, kbCustom: { b:true, e:true, i:true, v:true, s:true }, kbDirty:false, stPop:false, stPdf:false };
    if (stateId === "cm-hover") base.hover = "e";
    if (stateId === "cm-hover-h") base.hover = "s";
    if (stateId === "cm-tip") base.tip = true;
    if (stateId === "cm-bulk") base.selected = { b:true, v:true };
    if (stateId === "kb-custom") base.kbSync = false;
    if (stateId === "st-hid") base.stPop = true;
    if (stateId === "st-vis") base.stPdf = true;
    return base;
}
const KEEP = { hidden:null, added:false };      /* teacher choices survive switching screens */
function seed(kind){ const m = preset(kind, { hidden:KEEP.hidden, added:KEEP.added }); m._m = 1; return m; }
function ensureModel(){ if (!ui.live || !ui.live._m){ const st = curState(); ui.live = seed(st ? st.kind : "cm-rest"); } return ui.live; }
function screen(stateId, variant, m){
    const mode = stateId.split("-")[0];
    if (mode === "cm") return teacherShell(courseMaterials(variant, m));
    if (mode === "up") return teacherShell(courseMaterials(variant, m), uploadDialog());
    if (mode === "kb") return teacherShell(courseMaterials(variant, m), kbDialog(m));
    if (mode === "st") return student(m);
    return `<div style="height:100%;display:flex;align-items:center;justify-content:center;font:600 16px Nunito,sans-serif;color:#858585">New screen · spec it on the right</div>`;
}

/* ================= stage ================= */
const stageEl = document.getElementById("stage");
function stateMode(st){ const x = find(st.id); return META(x ? x.m.id : "cm"); }
function phoneHTML(st, live, interactive){
  const M = live && live._m ? live : seed(st.kind); const meta = stateMode(st), dev = DEVICES[meta.device];
  return `<div class="phone fx dev-${meta.device}" style="width:${dev.w}px;height:${dev.h}px">${screen(st.kind, ui.variant, M)}</div>`;
}
let lastSelState = null;
function syncContext(){
  const want = META(curMode().id).ctx;
  if (ui.sel.state !== lastSelState){ lastSelState = ui.sel.state; if (ui.context !== want){ ui.context = want; try{ renderHeader(); }catch(e){} } return; }
  if (ui.context !== want){ const m = S.modes.find(x => META(x.id).ctx === ui.context); if (!m) return;
    ui.sel = { kind:"state", mode:m.id, state:m.states[0].id }; lastSelState = ui.sel.state; ui.live = seed(m.states[0].kind);
    try{ markActive(); renderLeft(); scrollToSel(); }catch(e){} }
}
function renderStage(){
  const W = document.getElementById("pwrap"); const st = curState(); if (!st){ W.innerHTML = ""; return; }
  syncContext(); const M = ensureModel();
  W.innerHTML = `<svg class="lines" id="lines"></svg>${phoneHTML(curState(), M, true)}`;
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
const api = {
  get model(){ return ensureModel(); },
  set(patch, stateId){
    Object.assign(ui.live, patch);
    if (patch.hidden) KEEP.hidden = Object.assign({}, patch.hidden);
    if (patch.added) KEEP.added = true;
    if (stateId && stateId !== ui.sel.state){ const x = find(stateId);
      if (x){ ui.sel = { kind:"state", mode:x.m.id, state:stateId }; lastSelState = stateId; renderStage(); markActive(); renderLeft(); renderHeader();
        if (document.body.classList.contains("attn-proto")) scrollToSel(); return; } }
    renderStage();
  },
  go(id){ go(id); }
};
function act(t){
    const a = t.dataset.act, m = api.model, id = t.dataset.id;
    const h = Object.assign({}, m.hidden), s = Object.assign({}, m.selected);
    if (a === "sa"){ h[id] = !h[id]; api.set({ hidden:h }); }
    else if (a === "sel"){ s[id] = !s[id]; const any = Object.values(s).some(Boolean); api.set({ selected:s }, any ? "cm-bulk" : "cm-rest"); }
    else if (a === "sel-all"){ const files = FILES.concat(m.added?[NEW_FILE]:[]); const all = files.every(f => s[f.id]); const n = {}; if (!all) files.forEach(f => n[f.id] = true); api.set({ selected:n }, all ? "cm-rest" : "cm-bulk"); }
    else if (a === "bulk-hide" || a === "bulk-show"){ Object.keys(s).forEach(k => { if (s[k]) h[k] = a === "bulk-hide"; }); api.set({ hidden:h, selected:{} }, "cm-rest"); }
    else if (a === "bulk-clear"){ api.set({ selected:{} }, "cm-rest"); }
    else if (a === "tip"){ api.set({ tip: !m.tip }, m.tip ? "cm-rest" : "cm-tip"); }
    else if (a === "add"){ api.go("up-detect"); }
    else if (a === "up-keep" || a === "up-hide"){ h.n = a === "up-hide"; api.set({ hidden:h, added:true }, "cm-rest"); }
    else if (a === "up-close" || a === "kb-close"){ api.go("cm-rest"); }
    else if (a === "kb-sync"){ api.set({ kbSync: !m.kbSync, kbDirty:true }, m.kbSync ? "kb-custom" : "kb-sync"); }
    else if (a === "kb-pick"){ const c = Object.assign({}, m.kbCustom); c[id] = !c[id]; api.set({ kbCustom:c, kbDirty:true }); }
    else if (a === "st-hid"){ api.set({ stPop: !m.stPop, stPdf:false }, "st-hid"); }
    else if (a === "st-vis"){ api.set({ stPdf:true, stPop:false }, "st-vis"); }
    else if (a === "st-pdf-close"){ api.set({ stPdf:false }); }
}
document.getElementById("pwrap").addEventListener("click", e => {
  if (ui.commenting || e.altKey) return;
  const t = e.target.closest("[data-act]"); if (!t) return;
  if (t.tagName !== "INPUT") e.preventDefault();
  ensureModel(); act(t);
});
