/* BR-6891 · Hidden course material: ticket pack for feature workbench shell 1.0.0 (see workbench/feature/PACK-API.md).
   Screens: Teacher CMS (desktop, 1720×1080, Figma 10500:26471) and Student app (phone, 390×844). */
const PACK={
  id:"BR-6891", title:"Hidden course material",
  protoUrl:"https://claude.ai/artifact/5SGQrfZGKW3Fjw9tUKFWEo",
  dbDoc:"workbench/br-6891-v2", legacyDbDoc:"workbench/br-6891", lsKey:"wb-br6891-v2",
  ui:{sel:{kind:"state",mode:"cm",state:"cm-rest"},variant:"v2",context:"cms"},
  protoStartKind:"cm-rest",
  links:[{"label": "Ticket", "name": "BR-6891 · Hidden course material", "url": "https://app.notion.com/p/3f7fca9f403c80d5a296cd7f343bf5c0"}, {"label": "Design", "name": "Figma · BR-6891", "url": "https://www.figma.com/design/c3ccOGwhciWpL7bF0fpF5G/Teacher-CMS?node-id=10500-25901"}, {"label": "Feature Workbench", "name": "Feature Workbench", "url": "https://claude.ai/artifact/5SGQrfZGKW3Fjw9tUKFWEo"}, {"label": "Handoff", "name": "Handoff", "url": ""}]   /* link hub (Implementation), from pack.json → links */
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
/* logo + avatar cropped from the Figma frame render (1x) */
const IMG_LOGO="data:image/png;base64,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";
const IMG_AVATAR="data:image/png;base64,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";

/* ---------- Teacher CMS: Figma 10500:26471 layout, styled with the Brian Teacher Design System (design-systems/brian-teacher, .ds-teacher) ---------- */
const FI = (d, w=24, vb=24, fill="none", stroke="currentColor", sw=2) => `<svg aria-hidden="true" width="${w}" height="${w}" viewBox="0 0 ${vb} ${vb}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const TI = {
  collapse: FI('<path d="M10 7l-5 5 5 5M5 12h7M14 7h6M15 12h5M14 17h6"/>'),
  /* from the design system (SidebarNavItem): dashboard, directory, help */
  dashboard: `<svg aria-hidden="true" viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8.17 1.5H2.83c-.73 0-1.33.6-1.33 1.33v5.34c0 .73.6 1.33 1.33 1.33h5.34c.73 0 1.33-.6 1.33-1.33V2.83c0-.73-.6-1.33-1.33-1.33zM20.17 1.5h-5.34c-.73 0-1.33.6-1.33 1.33v5.34c0 .73.6 1.33 1.33 1.33h5.34c.73 0 1.33-.6 1.33-1.33V2.83c0-.73-.6-1.33-1.33-1.33zM8.17 13.5H2.83c-.73 0-1.33.6-1.33 1.33v5.34c0 .73.6 1.33 1.33 1.33h5.34c.73 0 1.33-.6 1.33-1.33v-5.34c0-.73-.6-1.33-1.33-1.33zM20.17 13.5h-5.34c-.73 0-1.33.6-1.33 1.33v5.34c0 .73.6 1.33 1.33 1.33h5.34c.73 0 1.33-.6 1.33-1.33v-5.34c0-.73-.6-1.33-1.33-1.33z"/></svg>`,
  library: FI('<path d="M6 3h11a2 2 0 0 1 2 2v13H7a2 2 0 0 0 0 4h12"/><path d="M5 20V5a2 2 0 0 1 1-2M9 8h6M9 12h6"/>', 24, 24, "none", "currentColor", 1.7),
  directory: `<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor"><path d="M10.75 3.36A4.03 4.03 0 0 0 7.73 2c-1.16 0-2.26.5-3.03 1.36a4.06 4.06 0 0 0-.98 3.17l.13 1.05A3.88 3.88 0 0 0 7.73 11c1.96 0 3.62-1.47 3.87-3.42l.13-1.05a4.06 4.06 0 0 0-.98-3.17zM20.25 2.22A3.6 3.6 0 0 0 17.57 1c-1.02 0-2 .44-2.67 1.22a3.6 3.6 0 0 0-.83 2.82l.15 1.06A3.39 3.39 0 0 0 17.57 9c1.68 0 3.12-1.25 3.35-2.9l.15-1.06a3.6 3.6 0 0 0-.82-2.82zM23.99 17.1l-.36-3.58a2 2 0 0 0-1.31-1.69 14.4 14.4 0 0 0-9.11-.12 4.6 4.6 0 0 1 3.68 4.03l.49 2.94c.07.44.07.88.03 1.31h.17c1.68 0 3.37-.26 5.04-.79a1.86 1.86 0 0 0 1.37-2.1zM15.4 19l-.49-2.93a2.9 2.9 0 0 0-2.22-2.42 19.5 19.5 0 0 0-9.94 0A2.9 2.9 0 0 0 .53 16.07L.04 19a2.85 2.85 0 0 0 2.34 3.43c1.77.38 3.56.56 5.35.56 1.78 0 3.57-.18 5.34-.56A2.85 2.85 0 0 0 15.4 19z"/></svg>`,
  help: `<svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor"><path d="M10 0C4.5 0 0 4.5 0 10s4.5 10 10 10 10-4.5 10-10S15.5 0 10 0zm0 16.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm2.03-6.13c-.62.53-.78.71-.78 1.13a1.25 1.25 0 0 1-2.5 0c0-1.62.99-2.47 1.65-3.03.62-.53.78-.71.78-1.13 0-.23 0-.84-1.18-.84-.55.03-1.13.28-1.57.7a1.25 1.25 0 0 1-1.72-1.82 5.06 5.06 0 0 1 3.23-1.38h.01c2.26 0 3.74 1.34 3.74 3.33 0 1.62-.99 2.47-1.65 3.03z"/></svg>`,
  language: FI('<circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.7 3.9 5.8 3.9 9.5s-1.3 6.8-3.9 9.5c-2.6-2.7-3.9-5.8-3.9-9.5s1.3-6.8 3.9-9.5z"/>', 24, 24, "none", "currentColor", 1.7),
  chevron: FI('<path d="M4 6l4 4 4-4"/>', 16, 16),
  sparkle: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M14 4c.5 3.6 2.4 5.5 6 6-3.6.5-5.5 2.4-6 6-.5-3.6-2.4-5.5-6-6 3.6-.5 5.5-2.4 6-6z"/><path d="M6 1.5c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3zM6.5 15c.3 1.9 1.3 2.9 3.2 3.2-1.9.3-2.9 1.3-3.2 3.3-.3-2-1.3-3-3.2-3.3 1.9-.3 2.9-1.3 3.2-3.2z"/></svg>`,
  brain: FI('<path d="M8 3.5a3 3 0 0 0-3 3 3 3 0 0 0-1.5 5.2A3 3 0 0 0 6 16.5a3 3 0 0 0 6 .5V5a2.5 2.5 0 0 0-4-1.5zM16 3.5a3 3 0 0 1 3 3 3 3 0 0 1 1.5 5.2 3 3 0 0 1-2.5 4.8 3 3 0 0 1-6 .5"/><path d="M12 9c-1.5 0-2.5-1-2.5-2.5M12 13c1.5 0 2.5 1 2.5 2.5"/>', 16, 24, "none", "currentColor", 1.8),
  doc: (lock) => `<span class="c-doc"><svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><rect x="1" y="1" width="22" height="22" rx="4" fill="#63c0ff"/><path d="M8 5.5h5.5L17 9v8.5a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1z" fill="none" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/><path d="M13.5 5.5V9H17M9.5 12h5M9.5 15h4" stroke="#fff" stroke-width="1.4" stroke-linecap="round" fill="none"/></svg>${lock||""}</span>`,
  info: `<svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="currentColor"/><rect x="9" y="8.5" width="2" height="6.5" rx="1" fill="#fff"/><circle cx="10" cy="5.8" r="1.25" fill="#fff"/></svg>`,
  arrowDown: FI('<path d="M6 2v8M2.5 6.5L6 10l3.5-3.5"/>', 12, 12, "none", "currentColor", 1.3),
  download: FI('<path d="M8 2v8M4.5 6.5L8 10l3.5-3.5M2.5 10v3.5h11V10"/>', 16, 16, "none", "currentColor", 1.4),
  add: FI('<path d="M8 2.5v11M2.5 8h11"/>', 16, 16, "none", "currentColor", 1.8)
};

const accessCell = (f, hidden, variant) => {
  const btn = `<button class="sa ${hidden?"hid":""}" data-act="sa" data-id="${f.id}" data-el="cm.access" data-label="Student access toggle" aria-pressed="${hidden}" aria-label="${hidden?"Show":"Hide"} ${esc(f.name)} ${hidden?"to":"from"} students">${hidden?IC.eyeOff(16):IC.eye(16)}${hidden?"Hidden":"Visible"}</button>`;
  if (variant === "v1") return btn;
  return `<span class="sa-rest"${hidden?' data-el="cm.rest" data-label="Resting: hidden icon" role="img" aria-label="Hidden from students" title="Hidden from students"':""}>${hidden?IC.eyeOff(16):""}</span>${btn}`;
};

function teacherShell(inner, overlay, tab){
  tab = tab || "Course Materials";
  const nav = (ic, label, on) => `<a class="nav-item ${on?"on":""}" href="#"${on?' aria-current="page"':""}>${ic}<span>${label}</span></a>`;
  return `<div class="t-app ds-teacher">
    <aside class="t-side">
      <nav class="t-nav" aria-label="Main">
        <img class="t-logo" src="${IMG_LOGO}" alt="Brian" width="67" height="60">
        <button class="btn ghost t-collapse" aria-label="Collapse menu">${TI.collapse}</button>
        <div class="t-group">${nav(TI.dashboard,"Courses",true)}${nav(TI.library,"Library")}${nav(TI.directory,"Directory")}</div>
        <div class="nav-sep"></div>
        <div class="t-group">${nav(TI.help,"Help Center")}<a class="nav-item" href="#">${TI.language}<span>English</span>${TI.chevron}</a></div>
      </nav>
      <img class="t-avatar" src="${IMG_AVATAR}" alt="Your profile" width="56" height="56">
    </aside>
    <main class="t-card">
      <header class="t-top"><div class="t-title"><div class="t-school body-md-strong">Georg Büchner Gymnasium</div><h1 class="h1">English Grade 7</h1></div>
        <span class="btn md">${TI.brain}Preview Course in App</span></header>
      <div class="tab-bar t-tabs" role="tablist" aria-label="Course sections">${["Content","Students","Analytics","Course Materials","Settings"].map(t => `<span class="tab ${t===tab?"on":""}">${t}</span>`).join("")}</div>
      ${inner}
    </main>
    <div class="t-ask" aria-label="Ask Brian">${TI.sparkle}</div>
    ${overlay||""}</div>`;
}

function courseMaterials(variant, m){
  const files = FILES.concat(m.added ? [NEW_FILE] : []);
  const sel = files.filter(f => m.selected[f.id]);
  const all = sel.length === files.length;
  const colName = variant === "v1" ? "Students" : "Student access";
  const bulk = sel.length ? `<div class="t-bulk" data-el="cm.bulk" data-label="Bulk bar"><b class="body-md-strong">${sel.length} ${sel.length===1?"file":"files"} selected</b><span class="x-sp"></span>
      <button class="btn md" data-act="bulk-hide" data-el="cm.bulkHide" data-label="Hide from students">${IC.eyeOff(16)}Hide from students</button>
      <button class="btn secondary md" data-act="bulk-show" data-el="cm.bulkShow" data-label="Show to students">${IC.eye(16)}Show to students</button>
      <button class="btn secondary md" data-act="bulk-clear">Clear</button></div>` : "";
  const rows = files.map(f => {
    const hidden = !!m.hidden[f.id];
    return `<tr class="${m.selected[f.id]?"sel":""} ${m.hover===f.id?"hov":""}">
      <td class="c-cb"><input type="checkbox" data-act="sel" data-id="${f.id}" ${m.selected[f.id]?"checked":""} aria-label="Select ${esc(f.name)}"></td>
      <td><div class="c-fn">${TI.doc()}<span class="c-tx">${esc(f.name)}</span></div></td>
      <td><span class="c-tx">11.09.2026</span></td><td><span class="c-tx">Klasse 7</span></td><td><span class="c-tx">${esc(f.usedIn)}</span></td>
      <td>${accessCell(f, hidden, variant)}</td>
      <td><button class="btn ghost c-dl" aria-label="Download ${esc(f.name)}">${TI.download}</button></td></tr>`;
  }).join("");
  const tip = m.tip ? `<div class="tooltip bottom c-tip" role="tooltip" data-el="cm.tip" data-label="Tooltip"><p>Brian still uses hidden material, but students can't open it when Brian cites it.</p><p>Use this for solutions or teacher notes.</p></div>` : "";
  return `<div class="t-cm ${variant}">${bulk}
    <div class="t-tablewrap"><table class="table t-table" aria-label="Course materials"><colgroup><col style="width:40px"><col style="width:26%"><col><col><col style="width:20%"><col style="width:15%"><col style="width:96px"></colgroup><thead><tr>
      <th class="c-cb"><input type="checkbox" data-act="sel-all" ${all?"checked":""} aria-label="Select all files"></th>
      <th>Filename</th><th>Uploaded</th><th>Tags</th><th><div class="c-sort">Used In${TI.arrowDown}</div></th>
      <th><div class="c-acc"><span data-el="cm.col" data-label="Column name">${colName}</span><button class="info-icon" data-act="tip" aria-expanded="${!!m.tip}" aria-label="What does hidden mean?" data-el="cm.info" data-label="Info icon">${TI.info}</button>${tip}</div></th>
      <th>Download</th></tr></thead><tbody>${rows}</tbody></table></div>
    <footer class="t-foot"><button class="btn" data-act="add" data-el="cm.add" data-label="Add Course Material">${TI.add}Add Course Material</button></footer></div>`;
}

function uploadDialog(){
  return `<div class="dim"><div class="dlg" role="dialog" aria-label="Add Course Material" style="width:640px">
    <div class="dlg-h"><h2>Add Course Material</h2><button data-act="up-close" aria-label="Close">${IC.close(18)}</button></div>
    <div class="dlg-b">
      <div class="frow"><span class="fi" style="width:32px;height:32px;margin:0">${IC.file(16)}</span><div style="flex:1;display:flex;flex-direction:column"><b style="font-size:14px">${esc(NEW_FILE.name)}</b><span style="font-size:12px;color:#585858">2.4 MB · uploaded</span></div><span style="color:#157ec5">${IC.check(20)}</span></div>
      <div class="callout" data-el="up.callout" data-label="Solutions hint"><span class="lkc">${IC.eyeOff(16)}</span><div style="display:flex;flex-direction:column;gap:6px"><b style="font-size:16px;font-weight:800">This looks like a solutions file</b><span style="font-size:14px;line-height:1.45">Hide it from students? Brian can still use it to check answers, but students can't open it when Brian cites it.</span></div></div>
      <span style="font-size:13px;color:#585858">You can change this anytime in Course Materials.</span>
    </div>
    <div class="dlg-f"><button class="btn secondary" data-act="up-keep" data-el="up.keep" data-label="Keep visible">Keep visible</button><button class="btn preferred" data-act="up-hide" data-el="up.hide" data-label="Hide from students">Hide from students</button></div>
  </div></div>`;
}

/* Edit Knowledge Base: layout from Figma 10500:25996 (dialog over the AI Dialogue Content tab) and 10452:224 (Uploads Table) */
const IMG_BOOK="data:image/png;base64,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";
const KBI = {
  link: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>`,
  info12: `<svg aria-hidden="true" width="12" height="12" viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#63c0ff"/><rect x="9" y="8.5" width="2" height="6.5" rx="1" fill="#fff"/><circle cx="10" cy="5.8" r="1.25" fill="#fff"/></svg>`,
  close24: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>`,
  arrowR: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8h11M9.5 4l4 4-4 4"/></svg>`,
  caretUp: `<svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7.5L6 4.5l3 3"/></svg>`,
  caretDown: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6l4 4 4-4"/></svg>`,
  pen: `<svg aria-hidden="true" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.5 2.5l3 3L5 14H2v-3z"/></svg>`,
  sparkles: `<svg aria-hidden="true" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linejoin="round"><path d="M15 3c.4 2.9 1.6 4.1 4.5 4.5-2.9.4-4.1 1.6-4.5 4.5-.4-2.9-1.6-4.1-4.5-4.5 2.9-.4 4.1-1.6 4.5-4.5zM7 11c.3 2 1.1 2.8 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.2 2.7-1 3-3zM17 15c.2 1.3.8 1.9 2 2-1.2.2-1.8.8-2 2-.2-1.2-.8-1.8-2-2 1.2-.1 1.8-.7 2-2zM5 4c.2 1 .6 1.4 1.5 1.5C5.6 5.6 5.2 6 5 7c-.2-1-.6-1.4-1.5-1.5C4.4 5.4 4.8 5 5 4z"/></svg>`,
  doc: `<svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24"><rect x="1.5" y="1.5" width="21" height="21" rx="4" fill="#63c0ff"/><path d="M8.5 6h5L16.5 9v8.5a.5.5 0 0 1-.5.5H8.5a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5z" fill="none" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/><path d="M13.5 6v3h3M10 12h4.5M10 14.8h3.5" stroke="#fff" stroke-width="1.3" stroke-linecap="round" fill="none"/></svg>`
};
const kbCheck = (on, attrs) => `<input type="checkbox" class="kb-cb" ${on?"checked":""} ${attrs||""}>`;

/* background: AI Dialogue, Content tab, Manual mode (Figma 10500:25996) */
function dialogueContent(){
  const label = (t, info=true) => `<div class="ac-label">${esc(t)}${info?KBI.info12:""}</div>`;
  return `<div class="ac">
    <div class="ac-bar"><div class="ac-crumbs"><span>Content</span>${KBI.arrowR}<span>Creating Linear Functions</span><span class="ac-copy">${KBI.link}Copy link for students</span></div>
      <span class="ac-active">Active${KBI.caretUp}</span></div>
    <div class="ac-main">
      <div class="ac-left">
        <div class="ac-seg"><span>Chatbot</span><span class="on">Manual</span></div>
        <div class="ac-panel">
          <div class="ac-group">${label("Instructions for learners")}<div class="ac-field">This is your check-in on rational numbers. You'll check whether you can read numbers off a number line, mark them on it, and put them in order by size. You'll also show whether you can add and subtract in your head and explain how you worked things out.</div></div>
          <div class="ac-group">${label("Internal Instruction for Chatbot")}<div class="ac-field ac-clip"><b>Type and goal</b><br>Conduct a short, fully spoken A1 conversation for the first English lesson. The learner practices greeting, introducing themselves, and asking simple questions in conversation rather than through a long list of quiz questions.<br><br><b>Language framework</b><br>In your English utterances, use only the 20 words and phrases from the practice context.</div></div>
          <div class="ac-group">${label("When does the dialog end?")}<div class="ac-field">The exercise only ends once the learner has said, in a short conversation, the greeting, the introduction, a simple question, and the farewell, each one themselves in English. German answers do not count toward any of these requirements.</div></div>
          <div class="ac-group">${label("Knowledge Base")}<div class="ac-kb"><span class="ac-kbic">${KBI.link}<i>31</i></span><span class="ac-kbtx">All course materials</span><span class="ac-edit">Edit</span></div></div>
          <div class="ac-group">${label("Evaluation Schema")}<div class="ac-row"><span class="ac-btn">${KBI.pen}Adapt Evaluation Rubrics</span><span class="ac-select">German${KBI.caretDown}</span></div></div>
        </div>
      </div>
      <div class="ac-right"><div class="ac-prevh">Student Preview</div><div class="ac-prev">${KBI.sparkles}<span>Complete the creation to preview the AI Dialogue</span></div></div>
    </div></div>`;
}

function kbDialog(m){
  const files = FILES;
  const sync = m.kbSync;
  const custom = m.kbCustom;
  const n = sync ? files.length : files.filter(f => custom[f.id]).length;
  const rows = files.map(f => {
    const hidden = !!m.hidden[f.id]; const on = sync || !!custom[f.id];
    return `<div class="kb-row">${kbCheck(on, `${sync?"disabled":""} data-act="kb-pick" data-id="${f.id}" aria-label="${esc(f.name)}"`)}
      <span class="kb-doc">${KBI.doc}</span><span class="kb-name">${esc(f.name)}</span>
      ${hidden?`<span class="kb-hid" role="img" aria-label="Hidden from students" title="Hidden from students"${f.id==="s"?' data-el="kb.tag" data-label="Hidden icon"':""}>${IC.eyeOff(16)}</span>`:""}</div>`;
  }).join("");
  return `<div class="dim"><div class="dlg kbd" role="dialog" aria-label="Edit Knowledge Base">
    <div class="kbd-h"><h2>Edit Knowledge Base</h2><button data-act="kb-close" aria-label="Close">${KBI.close24}</button></div>
    <div class="kbd-b">
      <div class="kb-up"><div class="kb-seg"><span class="on">Drag &amp; Drop</span><span>Copy &amp; Paste</span><span>Video</span><span>Website</span></div>
        <div class="kb-drop"><img src="${IMG_BOOK}" alt="" width="80" height="105"><div class="kb-dropt"><p class="kb-dropb">Drag &amp; Drop<br>or <span>browse for a file</span></p><p>(.tiff, .md, .webp, .heif, .pages, .pdf, .key, .svg, .jpeg, .tif, .ods, .heic, .xls, .htm, .ppt, .pptx, .xlsx, .odt, .png, .txt, .numbers, .odp, .jpe, .html, .jpg, .doc, .rtf, .docx, .bmp)</p></div></div></div>
      <div class="kb-list ${sync?"sync":""}">
        <div class="kb-head">
          <div class="kb-title">${KBI.link}<b>Sync with course materials</b>${KBI.info12}<span class="x-sp"></span>
            <button class="sw ${sync?"on":""}" role="switch" aria-checked="${sync}" aria-label="Sync with course materials" data-act="kb-sync" data-el="kb.toggle" data-label="Sync toggle"></button></div>
          <p class="kb-desc" data-el="kb.copy" data-label="Sync description">${sync?"All course materials are added and removed automatically, including material that is hidden from students.":"Choose the documents this activity uses. Your selection won't change when the course materials change."}</p>
        </div>
        <div class="kb-all">${kbCheck(sync||n===files.length, `${sync?"disabled":""} aria-label="Select all"`)}<b>Select all</b><span class="x-sp"></span><span class="kb-n">${n} selected</span></div>
        <div class="kb-rows">${rows}</div>
      </div>
    </div>
    <div class="kbd-f"><button class="btn" ${m.kbDirty?"":"disabled"} data-act="kb-close">Apply Changes</button></div>
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
      ["<b>R4</b> Teacher side: hidden material is marked only with the crossed-out eye icon", "Everywhere a file is listed (Course Materials, Edit Knowledge Base)", "No lock badge, no tag, no text at rest"],
      "<b>R4</b> Lock badge on a file icon means hidden, nothing else"),
    edges: ul(["Existing data", "\"Available to AI Tutor\" unchecked → hidden", "Checked → visible"],
      "Course AI Tutor uses all course material",
      ["Quiz source material students can't see", "Stays in the knowledge base, treated like hidden"]),
    ds: ul("Uploads Table: new column \"Student access\" with hover toggle (V2)", "Citation chip: new hidden state (Student app)"),
    questions: ul("Column name: \"Student access\" or \"Visible to students\"?", "Hover toggle: does it also need a keyboard path beyond focus (e.g. row menu)?", "Solutions detection: file name only, or also content?")
  };
const STATE_DOCS = {
    "cm-rest": ul("Column \"Student access\" with info icon", ["Hidden files", "Show only the crossed-out eye icon, no text", "No lock badge on the file icon (Hannes 24.11)"], "Visible files show nothing in the column"),
    "cm-hover": ul(["Row hover or keyboard focus in the row", "Toggle appears in the column", "Visible file: \"Visible\" with eye icon"], "Click toggles the state, row stays hovered"),
    "cm-hover-h": ul(["Hidden file on hover", "Toggle shows \"Hidden\" with crossed-out eye", "Light grey, not dark (Hannes 20.11)"], "Click → visible"),
    "cm-tip": ul("Tooltip on the info icon", ["Copy", "\"Brian still uses hidden material, but students can't open it when Brian cites it.\"", "\"Use this for solutions or teacher notes.\""]),
    "cm-bulk": ul(["One or more rows selected", "Bulk bar above the table", "\"Hide from students\" / \"Show to students\" / Clear"], "After the action the selection clears"),
    "up-detect": ul(["Uploaded file name looks like solutions", "\"Lösung\", \"Solution\", \"Answer key\", \"Musterlösung\""], ["Ask once", "\"Keep visible\" / \"Hide from students\""], "Can be changed anytime in Course Materials"),
    "kb-sync": ul(["Toggle on", "List read-only, all files ticked"], "Description: \"All course materials are added and removed automatically, including material that is hidden from students.\"", "Hidden files show only the crossed-out eye icon, as in Course Materials (Hannes 24.11)"),
    "kb-custom": ul("Toggle off: list active, as in the 18.11 spec", "Crossed-out eye stays visible so the teacher knows students can't open those files"),
    "st-vis": ul(["Visible citation chip", "Tap opens the PDF at the cited page", "Quote highlighted"]),
    "st-hid": ul(["Hidden citation: grey chip \"Teacher material\" with lock", "No file name, no page"], ["Tap shows a note", "\"Your teacher keeps this material private. Brian can use it to help you, but you can't open it.\""], "Follow-up ticket (Student + Backend)")
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
const EL_ORDER = ["cm.col","cm.info","cm.rest","cm.access","cm.tip","cm.bulk","cm.bulkHide","cm.bulkShow","up.callout","up.keep","up.hide","kb.toggle","kb.copy","kb.tag","st.chipVisible","st.chipHidden","st.pop","cm.add"];
const DEVICES = { desktop:{ w:1720, h:1080 }, phone:{ w:390, h:844 } };
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
    if (mode === "kb") return teacherShell(dialogueContent(), kbDialog(m), "Content");
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
