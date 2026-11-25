/* BR-7147 · Redesign Input Field: ticket pack for the feature workbench shell.
   Everything specific to this ticket lives here: config, spec defaults, variants, touchpoints, icons,
   the phone prototype (render, behaviour, stage sizing, element badges) and the v1→v2 data migration.
   The shell (shell.js) loads after this file and calls the functions listed in PACK-API.md. */
const PACK={
  id:"BR-7147", title:"Redesign Input Field",
  protoUrl:"https://hennes95.github.io/brian-prototypes/br-7147/",
  dbDoc:"workbench/br-7147-v2", legacyDbDoc:"workbench/br-7147", lsKey:"wb-br7147-v2",
  ui:{sel:{kind:"state",mode:"idle",state:"idle-rest"},variant:"pill",context:"tutor"},
  protoStartKind:"idle"
};

/* ================= data ================= */
const FIG = id => "https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=" + id;
const p = s => s.split("\n").map(l=>`<p>${l}</p>`).join("");
/* Spec defaults (used while the artifact database is empty). Ticket text = imported blocks (div.imp), Claude's own suggestions = span.ai. Synced from the Notion ticket 23.11.26. */
const DEFAULT = {
 "v": 2,
 "docs": {
  "brief": "<h2>Problem</h2><p>Students and teachers find the chat hard to use.</p><ul><li>Typing is hard: the + and send icons eat horizontal space, and the field wraps after 5 lines (ChatGPT/Claude: 7–8).</li><li>Writing on a phone is cumbersome, so teachers ask for voice input (STT).</li><li>After sending, the field stays open and takes space away from Brian's answer.</li></ul><h2>Goal</h2><p>Bring chat input up to current benchmark standards: as much horizontal space for text as possible, 7 lines before scrolling, and a layout with room for STT (and maybe full S2S) later.</p><div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Better experience for long inputs</li><li>Clickable prototype: <a href=\"https://hennes95.github.io/brian-prototypes/br-7147/\" target=\"_blank\">hennes95.github.io/brian-prototypes/br-7147</a></li></ul></div><h2>Success criteria</h2><div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>1. More room for text<ul><li>One row: field fills the space between + and mic</li><li>Wrapped: text uses full width (same as tutor message)</li></ul></li><li>2. Better support for long text<ul><li>7 lines visible before scrolling (today 5)</li><li>Full screen Focus mode</li></ul></li><li>3. More room for chat history/content<ul><li>Scrolling back in the history hides bottom and top bar</li></ul></li><li>4. Chat input field gets more consistent with Brian's style</li><li>5. Scalability/simplicity and consistency: same input pattern on every chat surface</li><li>6. Layout is ready for STT<ul><li>Mic slot is in the design</li></ul></li></ul></div><p><br></p><h2>In scope</h2><ul><li>All chats in the Student app (AI Tutor, AI Dialogues, chatbots)</li><li>Layout of the field and growth behavior</li><li>Upload (+): Gallery, Camera, Document, Drawing</li></ul><h2>Out of scope</h2><ul><li>STT and full S2S: reserve space only</li><li>Tablet / desktop breakpoints</li><li>Learning Diary input → BR-7144</li></ul><div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Document Viewer → stays unchanged</li><li>Sending / Brian answers → existing loading animation stays</li></ul></div>",
  "ds": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Chat Input · new (<a href=\"https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12670-12814\" target=\"_blank\">Figma</a>)<ul><li>7 states: Idle, Focused, Typing, Typing stacked, Resting filled, Overflow, Full screen</li><li>Theme: Light / Dark (Dark for Chatbot, AI Dialog, Quiz)</li><li>Properties: text, leading/trailing icons (swap + on/off), STT slot (hidden), bottom slot</li></ul></li><li>Tab bar · updated<ul><li>Sits in Chat Input's bottom slot</li></ul></li></ul></div>",
  "rules": "<p><b>R1</b> Up to 7 lines, then the field scrolls. (from ticket)</p><div class=\"imp\" data-src=\"ticket · 19.11\"><p><b>R2</b> When the text gets too long for the inline field and switches to full width, the field stays full width until the next turn or until everything is deleted.</p><p><b>R3</b> Hardware keyboard (tablet with docked keyboard, desktop)</p><ul><li>No on-screen keyboard → no layout shift on focus</li><li>After sending, the field stays focused</li><li>Enter sends, Shift+Enter adds a new line</li></ul><p><b>R4</b> In chats, when scrolling up in the chat history</p><ul><li>Top bar always hides</li><li>Bottom bar and input field hide when the field is not focused or empty</li><li>Scrolling down brings both back into view</li></ul></div>",
  "edges": "",
  "questions": "<ul><li>What is the resting state after sending: single line, or hidden?<ul><li><span class=\"ai\">Suggestion: back to one-row idle</span></li></ul></li><li>Does the Learning Diary chat keep its input open? (→ BR-7144)</li><li>Focus mode: in scope for this ticket, or backlog?<ul><li><span class=\"ai\">Answered in the ticket: in scope, see Focus mode</span></li></ul></li></ul><div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Learning Diary &amp; Discussion Room: touchpoints of this ticket or out of scope (→ BR-7144)?<ul><li>Discussion Room: add + for uploads?</li></ul></li><li>Ask devs: which native pickers can open as a half-height sheet in our app (Gallery, Document, Camera)?</li><li>Page limit when adding documents?<ul><li><span class=\"ai\">Suggestion: keep the current default, 1 page</span></li></ul></li></ul></div>",
  "tp:tutor": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>White, tab bar under the field → same as prototype</li></ul></div>",
  "tp:dialog": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Dark background, opens full screen with ✕, no tab bar</li><li>Dark variant: white line, icons and text</li><li>New input field at the bottom; top bar updated to the new component</li></ul></div>",
  "tp:quiz": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Dark, field sits under the card, above the result panel</li><li>Focused: docks above the keyboard like in chat</li><li>Placeholder: \"Something unclear?\"</li><li>Resting: red result sheet under the field, top edge angled against the field line</li><li>Otherwise like the AI Tutor tab: the sheet hides behind the keyboard like the tab bar</li></ul></div>",
  "tp:discussion": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>White bottom sheet; no + (upload), text only</li><li>Placeholder: \"Post Question\"</li><li>Chat history as is; only the input field and its flow change</li></ul></div>",
  "tp:diary": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>White, no tab bar; field under the day summary and empty state</li><li>Placeholder: \"What went well today?\"</li><li>Chat history as is</li></ul></div>"
 },
 "modes": [
  {
   "id": "idle",
   "name": "Idle / after sending",
   "status": "open",
   "figma": "https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12639-183098",
   "states": [
    {
     "id": "idle-rest",
     "name": "Resting",
     "kind": "idle",
     "doc": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Dashed 0.75 line under the field and the mic (not under +) while the field is empty and not tapped</li><li>Student scrolls up<ul><li>Input field and top bar disappear (R4)</li></ul></li><li>Student taps +<ul><li>Dialog opens without the keyboard</li><li>Files also show in the input field</li><li>Keyboard only pops up once the text input is tapped</li><li>Send becomes active as soon as the first attachment is uploaded</li></ul></li><li>Resting with content<ul><li>Text or files in resting: same layout as focused (icons below the text), without keyboard</li><li>No line under the field once it holds content</li><li>Text spans the full width (+ and mic stay underneath)</li></ul></li></ul></div>",
     "links": {}
    }
   ]
  },
  {
   "id": "typing",
   "name": "Typing",
   "status": "open",
   "figma": "https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12639-183160",
   "states": [
    {
     "id": "t-empty",
     "name": "Empty, focused",
     "kind": "typing-empty",
     "doc": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>As soon as the student taps the text<ul><li>A tab bar below the field disappears behind the keyboard</li><li>The top bar moves out of the screen</li></ul></li><li>While the text fits on one line: + and mic/send stay in one row with the field</li><li>As soon as the text no longer fits between them<ul><li>Field switches to full width (same as the tutor message); + and send move below the text</li><li>Stays that way until sent or all text is deleted (R2)</li></ul></li><li>First character typed: mic turns into the send icon</li><li>Dashed line disappears; no line under the text in any typing state</li><li>Edge cases<ul><li>Tutor still generating: send stays inactive once shown</li><li>Student scrolls up: field stays open, top bar hides</li><li>Tap outside the field (into the history): field switches to resting</li></ul></li></ul></div>",
     "links": {}
    },
    {
     "id": "t-3",
     "name": "3 lines",
     "kind": "typing-3",
     "doc": "",
     "links": {}
    },
    {
     "id": "t-7",
     "name": "7 lines (max)",
     "kind": "typing-7",
     "doc": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Text grows up to 7 lines, then the field becomes scrollable (R1)</li><li>Small scroll indicator next to the edge of the container</li></ul></div>",
     "links": {}
    },
    {
     "id": "t-over",
     "name": "Overflow, scrolling",
     "kind": "typing-overflow",
     "doc": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Files added: miniatures stack on top of the text field, so the field gets taller</li><li>Expand icon top right as soon as text is &gt; 7 lines → Focus mode</li></ul></div>",
     "links": {}
    }
   ]
  },
  {
   "id": "upload",
   "name": "Upload (+)",
   "status": "open",
   "figma": "https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12639-183482",
   "states": [
    {
     "id": "u-sheet",
     "name": "Dialog open",
     "kind": "upload-sheet",
     "doc": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Tap + opens an overlay popup: Gallery, Camera, Document, Drawing</li><li>Each option<ul><li>Opens the system native UI as a half-height (\"medium\") sheet that can be pulled up to full height</li><li>Student picks and confirms</li><li>Attachments get added to the input field</li></ul></li></ul></div>",
     "links": {}
    },
    {
     "id": "u-pick",
     "name": "Native picker (half screen)",
     "kind": "upload-picker",
     "doc": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>System picker opens half screen, so the student stays in the chat context</li><li>File picker: scrolling down grows the sheet to full height</li><li>Top bar slides out to the top</li><li>Tapping a document opens it in preview (full screen); design out of scope</li></ul></div>",
     "links": {}
    },
    {
     "id": "u-att",
     "name": "Attachment added",
     "kind": "upload-attached",
     "doc": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Selected files show as miniatures above the text input</li><li>Documents: after the native file picker, a preview to choose the page to upload</li><li>Removing<ul><li>Each attachment has its own ×; the others stay</li><li>Last one removed: back to the typing state with only the text</li></ul></li></ul></div>",
     "links": {}
    }
   ]
  },
  {
   "id": "send",
   "name": "Sending / Brian answers",
   "status": "open",
   "figma": "",
   "states": [
    {
     "id": "s-wait",
     "name": "Brian is typing",
     "kind": "sending",
     "doc": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Out of scope: the existing loading animation stays</li></ul></div>",
     "links": {}
    }
   ]
  },
  {
   "id": "focus",
   "name": "Focus mode",
   "status": "open",
   "figma": "https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12639-183718",
   "states": [
    {
     "id": "f-tbd",
     "name": "Not designed yet",
     "kind": "placeholder",
     "doc": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Entry<ul><li>Expand icon top right in the field as soon as text is &gt; 7 lines</li><li>Tap opens the input full screen; text, cursor position and keyboard stay</li></ul></li><li>Layout<ul><li>Field grows to just below the status bar; the angled top line stays and the chat peeks above it</li><li>Top bar hidden</li><li>Collapse icon top right (same place as expand)</li><li>Attachments stay on top</li><li>Text fills the rest and scrolls</li><li>+ and send at the bottom, just above the keyboard</li></ul></li><li>Exit<ul><li>Collapse icon: back to the normal field, text kept, scrolled to the end</li><li>Swipe down also closes</li><li>Sending from full screen sends and closes; field goes back to resting</li></ul></li><li>Edge cases<ul><li>Text shortened below 7 lines: stays full screen until collapsed (no jumping)</li><li>Text longer than the space: same as the regular field, up to the angled line, with scroll indicator</li></ul></li></ul></div>",
     "links": {}
    }
   ]
  },
  {
   "id": "voice",
   "name": "Voice (reserved)",
   "status": "open",
   "figma": "",
   "states": [
    {
     "id": "v-res",
     "name": "Reserved space",
     "kind": "reserved",
     "doc": "<div class=\"imp\" data-src=\"ticket · 19.11\"><ul><li>Mic slot is in the design; STT itself is out of scope (success criterion 6)</li></ul></div>",
     "links": {}
    }
   ]
  }
 ]
};
/* Variants shown in the workbench. "pill" keeps its id (comments are stored per variant id) and is now "Pill inverted". */
const VARIANTS=[{id:"pill-light",name:"Pill"},{id:"pill",name:"Pill inverted",figma:FIG("12532-148660")},{id:"pill-sq",name:"Pill status quo"}];  /* status quo (Hannes 24.11): white field with outline on light screens, inverted (light) field on dark screens */
/* Archived 23.11 (Hannes): explored, no longer shown. Code and CSS stay, so they still render if put back into VARIANTS.
   Notes and screenshots: packs/br-7147/archive/VARIANTS.md */
const VARIANTS_ARCHIVED=[{id:"open",name:"Workbook line",figma:FIG("12532-149018")},{id:"angled",name:"No underline"},{id:"inv",name:"Inverted",figma:FIG("12702-194812")}];
const CONTEXTS=[
 {id:"tutor",name:"AI Tutor tab",ctx:"tutor",figma:FIG("12639-183880")},
 {id:"dialog",name:"Chatbot / AI Dialog",ctx:"dialog",figma:FIG("12639-183918")},
 {id:"quiz",name:"AI Tutor (Quiz)",ctx:"quiz",figma:FIG("12720-16346")},
 {id:"discussion",name:"Discussion Room (Quiz)",ctx:"discussion",figma:FIG("12721-16560"),note:"Potentially out of scope"},
 {id:"diary",name:"Learning Diary",ctx:"diary",figma:FIG("12639-183838"),note:"Out of scope (→ BR-7144)"}];
const isDarkCtx=c=>c==="dialog"||c==="quiz";

function migrate(old){ // v1 → v2: carry over any written specs and statuses
  const d=structuredClone(DEFAULT); if(!old||!Array.isArray(old.modes)) return d;
  for(const om of old.modes){ const m=d.modes.find(x=>x.id===om.id); if(!m) continue; m.status=om.status||m.status; if(om.figma) m.figma=om.figma;
    for(const os of om.states||[]){ const s=m.states.find(x=>x.id===os.id); if(s&&os.spec) s.doc=os.spec.split("\n").map(l=>`<p>${esc(l)||"<br>"}</p>`).join(""); } }
  return d;
}

/* ================= icons (exported from Figma: Nucleo + tab bar) ================= */
const I={
 plus:c=>`<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M12 4.33V19.67M4.33 12H19.67" stroke="${c}" stroke-width="1.33" stroke-linecap="round"/></svg>`,
 mic:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"><path d="M16.33 6.67a4.33 4.33 0 0 0-8.66 0v4a4.33 4.33 0 0 0 8.66 0z"/><path d="M20.33 10.67A8.33 8.33 0 0 1 3.67 10.67M12 19v2.67"/></svg>`,
 expand:`<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"><path d="M22.3333 11.6665H28.3333V17.6665"/><path d="M28.3333 11.6665L22.3333 17.6665"/><path d="M11.6667 22.3335V28.3335H17.6667"/><path d="M11.6667 28.3335L17.6667 22.3335"/></svg>`,
 collapse:`<svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"><path d="M28.3333 17.6665H22.3333V11.6665"/><path d="M22.3333 17.6665L28.3333 11.6665"/><path d="M17.6667 28.3335V22.3335H11.6667"/><path d="M17.6667 22.3335L11.6667 28.3335"/></svg>`,
 send:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21.0894 10.5014L5.80142 2.56271C5.19742 2.25071 4.47208 2.32938 3.94809 2.76004C3.42542 3.19204 3.21209 3.89204 3.40409 4.54138L5.31742 11H11.8481C12.4001 11 12.8481 11.448 12.8481 12C12.8481 12.552 12.4001 13 11.8481 13H5.31742L3.40409 19.4587C3.21075 20.1094 3.42542 20.808 3.94809 21.24C4.25742 21.4947 4.63875 21.6267 5.02275 21.6267C5.28808 21.6267 5.55475 21.564 5.80142 21.436L21.0894 13.4974C21.6508 13.2054 22.0001 12.632 22.0001 11.9987C22.0001 11.3654 21.6508 10.7934 21.0894 10.5014Z" fill="currentColor"/></svg>`,
 menu:`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.33" stroke-linecap="round"><path d="M18.33 12.33H1.67M9 17H1.67M18.33 7.67H1.67M18.33 3H1.67"/></svg>`,
 newchat:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.33" stroke-linecap="round"><circle cx="12" cy="12" r="9.67"/><path d="M7.67 12h8.66M12 7.67v8.66"/></svg>`,
 back:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>`,
 bubble:`<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M12 3.5c4.9 0 8.5 3.2 8.5 7.3s-3.6 7.3-8.5 7.3c-1 0-2-.1-2.9-.4L4.5 20l1.2-3.7C4.3 15 3.5 13 3.5 10.8 3.5 6.7 7.1 3.5 12 3.5z"/></svg>`,
 flip:`<svg width="28" height="26" viewBox="0 0 28 26" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M9 2h14v7H9z"/><path d="M8 12h16" stroke-dasharray="2 2"/><path d="M9 15h14l1 9H8z" fill="currentColor"/><path d="M5 8a6 6 0 0 0 0 9" /><path d="M3.5 15.5 5 17l1.5-1.5"/></svg>`,
 clip:`<svg width="64" height="80" viewBox="0 0 64 80" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"><path d="M6 10h52v66H6z"/><path d="M24 6h16v8H24z" fill="#fff"/><path d="M14 26l3 3 5-6M14 40l3 3 5-6M14 54l3 3 5-6"/><path d="M28 27h20M28 41h20M28 55h16M14 66h6"/></svg>`,
 help:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.67"/><path d="M9.53 9.67c0-1.33 1.07-2.33 2.47-2.33s2.47.93 2.47 2.2c0 2.07-2.47 2.07-2.47 4.2"/><circle cx="12" cy="16.8" r=".7" fill="currentColor"/></svg>`,
 close:`<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.33" stroke-linecap="round"><path d="M4 4l12 12M16 4L4 16"/></svg>`,
 speaker:`<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#858585" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"><path d="M4.44 5.11H2c-.74 0-1.33.6-1.33 1.33v3.11c0 .74.6 1.34 1.33 1.34h2.44l4.88 3.12c.3.19.68-.02.68-.37V2.36c0-.35-.39-.56-.68-.37z"/><path d="M12.36 6.75c.7.7.7 1.82 0 2.51M14.1 5.01a4.2 4.2 0 0 1 0 5.98"/></svg>`,
 tabMap:`<svg width="54" height="54" viewBox="0 0 54 54" fill="none"><path fill="currentColor" fill-rule="evenodd" d="M42.99 28.76c.02.06.02.13.01.19a.4.4 0 0 1-.16.29.4.4 0 0 1-.4.12.44.44 0 0 1-.36-.23 72 72 0 0 0-5-5.92c-.78-.8-1.57-1.6-2.42-2.32l-.43.3a.44.44 0 0 1-.64-.12L29.16 25.44l-8.22 8.07-8.1 7.98a.47.47 0 0 1-.38.09 2.47 2.47 0 0 1-1.9-1.84.45.45 0 0 1 .13-.44l4.58-4.5 8.12-7.99 8.03-7.9-.23-.22a.43.43 0 0 1-.1-.46c.07-.13.15-.24.29-.43-1.39-1.28-2.8-2.53-4.29-3.71a.45.45 0 0 1 0-.64l.86-.84c.13-.18.38-.24.59-.14.92.45 1.83.9 2.71 1.42.84.5 1.65 1.04 2.42 1.63.2-.14.41-.27.63-.4a.44.44 0 0 1 .61.1l.05.05.27-.3c.18-.18.37-.35.57-.5a.46.46 0 0 1 .46-.04c.39.21.74.48 1.04.8.17.17.33.35.47.55.12.17.21.36.25.56.01.12-.02.24-.1.33a4 4 0 0 1-.75.79l.12.12c.18.18.18.46 0 .64l-.16.24c.46.4.89.84 1.29 1.3 2.3 2.55 4.05 5.72 4.43 9.13zM34.53 15.9l1.98 1.92c-.36.6-.86 1.13-1.39 1.6-.42.39-.87.75-1.34 1.08a28 28 0 0 0-1.75-1.79 6.6 6.6 0 0 1 2.5-2.81zM28.46 13.23l-.43.43c1.32 1.06 2.6 2.2 3.85 3.34.33-.39.7-.75 1.09-1.08a28 28 0 0 0-4.51-2.69zM24.97 28.3l-8.2 8.06-4.37 4.3a2 2 0 0 1-.92-.86l7.96-7.83 8.11-7.98 3.8-3.73c-.02.5.1 1.01.34 1.46zM36.31 21.18l.2.19a62 62 0 0 1 5.26 5.83 14.6 14.6 0 0 0-5.04-8.12l-.29.32c.1.21.14.44.13.67-.01.39-.11.75-.26 1.11z"/></svg>`,
 tabChat:`<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width=".8" stroke-linejoin="round"><path d="M20.78.44l1.55 5.2 5.23 1.55-5.23 1.55-1.55 5.2-1.56-5.2L14 7.19l5.22-1.55z" fill="var(--b-bg)"/><path d="M7.22 14.06l1.56 5.2L14 20.8l-5.22 1.55-1.56 5.2-1.55-5.2L.44 20.8l5.23-1.55z" fill="var(--b-bg)"/><path d="M3.33.44 4 2.66l2.22.66L4 3.98l-.67 2.22-.66-2.22L.44 3.32l2.23-.66zM24.67 21.8l.66 2.22 2.23.66-2.23.66-.66 2.22-.67-2.22-2.22-.66 2.22-.66z" fill="var(--b-bg)"/><path d="M20.11 11.95l.67 2.1 1.55-5.2 5.23-1.55-3.12-.89c-2 1.22-3.55 3.21-4.33 5.54zM6.33 25.45l.67 2.1 1.56-5.2 5.22-1.55-3.11-.88c-2 1.22-3.56 3.21-4.34 5.53z" fill="currentColor" stroke="none"/></svg>`,
 tabStats:`<svg width="54" height="54" viewBox="0 0 54 54" fill="none" stroke="currentColor" stroke-width="1.1"><circle cx="14.16" cy="37.94" r="3.9"/><circle cx="26.75" cy="37.94" r="3.9"/><circle cx="39.69" cy="37.94" r="3.9"/><circle cx="20.44" cy="26.88" r="3.9"/><circle cx="33.25" cy="26.88" r="3.9"/><circle cx="26.75" cy="15.9" r="3.9"/></svg>`,
 /* upload menu icons: custom duo-tone set from Figma 12880-20891 (Hannes 25.11) */
 fImage:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M19.75 3.25H7.25C6.69772 3.25 6.25 3.69772 6.25 4.25V15.75C6.25 16.3023 6.69772 16.75 7.25 16.75H19.75C20.3023 16.75 20.75 16.3023 20.75 15.75V4.25C20.75 3.69772 20.3023 3.25 19.75 3.25Z" fill="currentColor"/><path d="M20 4.25C20 4.11193 19.8881 4 19.75 4H7.25C7.11193 4 7 4.11193 7 4.25V15.75C7 15.8881 7.11193 16 7.25 16H19.75C19.8881 16 20 15.8881 20 15.75V4.25ZM21.5 15.75C21.5 16.7165 20.7165 17.5 19.75 17.5H7.25C6.2835 17.5 5.5 16.7165 5.5 15.75V4.25C5.5 3.2835 6.2835 2.5 7.25 2.5H19.75C20.7165 2.5 21.5 3.2835 21.5 4.25V15.75Z" fill="currentColor"/><path d="M16.75 6.25H4.25C3.69772 6.25 3.25 6.69772 3.25 7.25V19.75C3.25 20.3023 3.69772 20.75 4.25 20.75H16.75C17.3023 20.75 17.75 20.3023 17.75 19.75V7.25C17.75 6.69772 17.3023 6.25 16.75 6.25Z" fill="var(--ic-bg,#3a3a3a)"/><path d="M17 7.25C17 7.11193 16.8881 7 16.75 7H4.25C4.11193 7 4 7.11193 4 7.25V19.75C4 19.8881 4.11193 20 4.25 20H16.75C16.8881 20 17 19.8881 17 19.75V7.25ZM18.5 19.75C18.5 20.7165 17.7165 21.5 16.75 21.5H4.25C3.2835 21.5 2.5 20.7165 2.5 19.75V7.25C2.5 6.2835 3.2835 5.5 4.25 5.5H16.75C17.7165 5.5 18.5 6.2835 18.5 7.25V19.75Z" fill="currentColor"/><path d="M9.47469 13.2504C9.68215 13.2435 9.88357 13.3234 10.0303 13.4701L12.0001 15.4399L12.9698 14.4701L13.0284 14.4174C13.1703 14.3026 13.3502 14.243 13.5343 14.2514C13.7446 14.261 13.9414 14.3582 14.0762 14.5199L16.5762 17.5199C16.8414 17.8381 16.7986 18.3114 16.4805 18.5766C16.1624 18.8417 15.6891 18.7989 15.4239 18.4809L13.4493 16.1108L12.5303 17.0307C12.2375 17.3236 11.7627 17.3236 11.4698 17.0307L9.53621 15.0971L6.56453 18.4946C6.29175 18.8062 5.81762 18.8376 5.50594 18.5649C5.19434 18.2921 5.1629 17.818 5.43562 17.5063L8.93562 13.5063L8.98933 13.4506C9.12102 13.3283 9.29334 13.2566 9.47469 13.2504Z" fill="currentColor"/><path d="M14.0001 11.1496C14.7733 11.1496 15.4001 10.5228 15.4001 9.74961C15.4001 8.97641 14.7733 8.34961 14.0001 8.34961C13.2269 8.34961 12.6001 8.97641 12.6001 9.74961C12.6001 10.5228 13.2269 11.1496 14.0001 11.1496Z" fill="currentColor"/></svg>`,
 fCamera:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M8 7.75L9.5 4.75H14.5L16 7.75H8Z" fill="currentColor"/><path d="M14.4998 4C14.7839 4 15.0437 4.16095 15.1707 4.41504L16.6707 7.41504C16.7867 7.64745 16.7741 7.92354 16.6375 8.14453C16.5008 8.36547 16.2596 8.5 15.9998 8.5H7.99981C7.73999 8.5 7.4988 8.36547 7.36211 8.14453C7.22553 7.92354 7.21287 7.64745 7.32891 7.41504L8.82891 4.41504C8.95595 4.16095 9.21573 4 9.49981 4H14.4998ZM9.21367 7H14.7859L14.0359 5.5H9.96367L9.21367 7Z" fill="currentColor"/><path d="M21.25 7.75H2.75C2.19772 7.75 1.75 8.19772 1.75 8.75V18.25C1.75 18.8023 2.19772 19.25 2.75 19.25H21.25C21.8023 19.25 22.25 18.8023 22.25 18.25V8.75C22.25 8.19772 21.8023 7.75 21.25 7.75Z" fill="var(--ic-bg,#3a3a3a)"/><path d="M20.8523 8.75C20.8523 8.61193 20.748 8.5 20.6193 8.5H3.38068C3.25202 8.5 3.14773 8.61193 3.14773 8.75V18.25C3.14773 18.3881 3.25202 18.5 3.38068 18.5H20.6193C20.748 18.5 20.8523 18.3881 20.8523 18.25V8.75ZM22.25 18.25C22.25 19.2165 21.5199 20 20.6193 20H3.38068C2.48008 20 1.75 19.2165 1.75 18.25V8.75C1.75 7.7835 2.48008 7 3.38068 7H20.6193C21.5199 7 22.25 7.7835 22.25 8.75V18.25Z" fill="currentColor"/><path d="M11.9998 17.2008C14.0433 17.2008 15.6998 15.5442 15.6998 13.5008C15.6998 11.4573 14.0433 9.80078 11.9998 9.80078C9.95635 9.80078 8.2998 11.4573 8.2998 13.5008C8.2998 15.5442 9.95635 17.2008 11.9998 17.2008Z" fill="var(--ic-bg,#3a3a3a)"/><path d="M14.9502 13.501C14.9502 11.8718 13.6292 10.5509 12 10.5508C10.3708 10.5508 9.0498 11.8717 9.0498 13.501C9.04991 15.1301 10.3708 16.4512 12 16.4512C13.6291 16.4511 14.9501 15.1301 14.9502 13.501ZM16.4502 13.501C16.4501 15.9585 14.4575 17.9511 12 17.9512C9.5424 17.9512 7.54991 15.9586 7.5498 13.501C7.5498 11.0433 9.54233 9.05078 12 9.05078C14.4576 9.05089 16.4502 11.0434 16.4502 13.501Z" fill="currentColor"/><path d="M11.9998 15.2008C12.9387 15.2008 13.6998 14.4397 13.6998 13.5008C13.6998 12.5619 12.9387 11.8008 11.9998 11.8008C11.0609 11.8008 10.2998 12.5619 10.2998 13.5008C10.2998 14.4397 11.0609 15.2008 11.9998 15.2008Z" fill="currentColor"/><path d="M18.8653 9.5C19.2158 9.5 19.5 9.83579 19.5 10.25C19.5 10.6642 19.2158 11 18.8653 11H17.3842C17.0337 11 16.7495 10.6642 16.7495 10.25C16.7495 9.83579 17.0337 9.5 17.3842 9.5H18.8653Z" fill="currentColor"/></svg>`,
 fDoc:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4.75 1.75H14L19.25 7V22.25H4.75V1.75Z" fill="var(--ic-bg,#3a3a3a)"/><path d="M14 1C14.1989 1 14.3896 1.07907 14.5303 1.21973L19.7803 6.46973C19.9209 6.61038 20 6.80109 20 7V22.25C20 22.6642 19.6642 23 19.25 23H4.75C4.33579 23 4 22.6642 4 22.25V1.75C4 1.33579 4.33579 1 4.75 1H14ZM5.5 21.5H18.5V7.31055L13.6895 2.5H5.5V21.5Z" fill="currentColor"/><path d="M14 1.75V7H19.25L14 1.75Z" fill="currentColor"/><path d="M13.7129 1.05696C13.9931 0.940917 14.3158 1.00557 14.5303 1.22005L19.7803 6.47005C19.9948 6.68452 20.0594 7.00719 19.9434 7.28743C19.8273 7.56768 19.5533 7.75032 19.25 7.75032H14C13.5858 7.75032 13.25 7.41453 13.25 7.00032V1.75032C13.25 1.44697 13.4326 1.17304 13.7129 1.05696ZM14.75 6.25032H17.4395L14.75 3.56087V6.25032Z" fill="currentColor"/><path d="M13.25 17.25C13.6642 17.25 14 17.5858 14 18C14 18.4142 13.6642 18.75 13.25 18.75H7.75C7.33579 18.75 7 18.4142 7 18C7 17.5858 7.33579 17.25 7.75 17.25H13.25ZM16.25 14C16.6642 14 17 14.3358 17 14.75C17 15.1642 16.6642 15.5 16.25 15.5H7.75C7.33579 15.5 7 15.1642 7 14.75C7 14.3358 7.33579 14 7.75 14H16.25ZM16.25 10.75C16.6642 10.75 17 11.0858 17 11.5C17 11.9142 16.6642 12.25 16.25 12.25H7.75C7.33579 12.25 7 11.9142 7 11.5C7 11.0858 7.33579 10.75 7.75 10.75H16.25Z" fill="currentColor"/></svg>`,
 fDraw:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5.5 14.5L15 5L19 9L9.5 18.5L5.5 14.5Z" fill="var(--ic-bg,#3a3a3a)"/><path d="M14.5263 4.41809C14.8209 4.17778 15.2556 4.19524 15.5302 4.46984L19.5302 8.46984C19.8231 8.76274 19.8231 9.2375 19.5302 9.53039L10.0302 19.0304C9.73732 19.3233 9.26256 19.3233 8.96967 19.0304L4.96967 15.0304C4.67678 14.7375 4.67678 14.2627 4.96967 13.9698L14.4697 4.46984L14.5263 4.41809ZM6.56049 14.5001L9.49994 17.4396L17.9394 9.00012L14.9999 6.06066L6.56049 14.5001Z" fill="currentColor"/><path d="M15 5L17 3L21 7L19 9L15 5Z" fill="currentColor"/><path d="M16.5263 2.41809C16.8209 2.17778 17.2556 2.19524 17.5302 2.46984L21.5302 6.46984C21.8231 6.76274 21.8231 7.2375 21.5302 7.53039L19.5302 9.53039C19.2373 9.82328 18.7626 9.82328 18.4697 9.53039L14.4697 5.53039C14.1768 5.2375 14.1768 4.76274 14.4697 4.46984L16.4697 2.46984L16.5263 2.41809ZM16.0605 5.00012L18.9999 7.93957L19.9394 7.00012L16.9999 4.06066L16.0605 5.00012Z" fill="currentColor"/><path d="M5.4998 14.5L9.4998 18.5L4.7998 19.2L5.4998 14.5Z" fill="currentColor"/><path d="M5.26495 13.7879C5.53395 13.6991 5.83027 13.7692 6.03057 13.9695L10.0306 17.9695C10.2308 18.1698 10.301 18.4662 10.2122 18.7351C10.1234 19.004 9.89073 19.2002 9.61065 19.242L4.91045 19.9412C4.67548 19.9761 4.43784 19.8982 4.26983 19.7302C4.10188 19.5623 4.02305 19.3245 4.05792 19.0896L4.75811 14.3894L4.78057 14.2869C4.84963 14.0533 5.02954 13.8656 5.26495 13.7879ZM5.69073 18.3084L7.91631 17.9763L6.02178 16.0818L5.69073 18.3084Z" fill="currentColor"/><path d="M13.7498 17.8496C14.6151 17.8496 15.325 18.3354 15.8241 19.084C16.1228 19.5319 16.412 19.6493 16.662 19.6494C16.9583 19.6494 17.4094 19.4852 17.9911 18.9482C18.2954 18.6674 18.7697 18.6869 19.0506 18.9912C19.3316 19.2956 19.313 19.7698 19.0086 20.0508C18.2903 20.7139 17.4906 21.1494 16.662 21.1494C15.7874 21.1493 15.077 20.6673 14.576 19.916C14.2751 19.4646 13.9846 19.3496 13.7498 19.3496C13.4764 19.3496 13.056 19.5044 12.5301 20.0303C12.2373 20.3229 11.7624 20.3229 11.4696 20.0303C11.1767 19.7374 11.1769 19.2626 11.4696 18.9697C12.1437 18.2956 12.9233 17.8496 13.7498 17.8496Z" fill="currentColor"/></svg>`,
 gallery:`<svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="4" width="20" height="18" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M3 18l6-5 5 4 3-2 6 5"/></svg>`,
 camera:`<svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 9h4l2-3h8l2 3h4v12H3z"/><circle cx="13" cy="14" r="4"/></svg>`,
 doc:`<svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M7 3h9l5 5v15H7z"/><path d="M16 3v5h5M10 14h8M10 18h6"/></svg>`,
 draw:`<svg width="26" height="26" viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M4 20c3-6 6 2 9-4s5 0 8-3"/><path d="M17 4l5 5-9 9H8v-5z"/></svg>`
};
/* Nucleo icons (Brian.study Design System, icon board 1054:1793, Outline 16px). Never hand-draw icons. */
const NUC={
 Help:`<path d="M8.00011 14.4444C11.5593 14.4444 14.4446 11.5592 14.4446 7.99999C14.4446 4.44082 11.5593 1.55554 8.00011 1.55554C4.44094 1.55554 1.55566 4.44082 1.55566 7.99999C1.55566 11.5592 4.44094 14.4444 8.00011 14.4444Z" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.35571 6.44444C6.35571 5.55555 7.06682 4.88889 8.00016 4.88889C8.93349 4.88889 9.6446 5.51111 9.6446 6.35555C9.6446 7.73333 8.00016 7.73333 8.00016 9.15555" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.00018 11.9555C8.41747 11.9555 8.75574 11.6173 8.75574 11.2C8.75574 10.7827 8.41747 10.4444 8.00018 10.4444C7.5829 10.4444 7.24463 10.7827 7.24463 11.2C7.24463 11.6173 7.5829 11.9555 8.00018 11.9555Z" fill="#3A3A3A"/>`,
 Close:`<path d="M12.4446 3.55554L3.55566 12.4444" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.55566 3.55554L12.4446 12.4444" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>`,
 ArrowLeft:`<path d="M2.44434 8H13.5554" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.22211 11.7778L2.44434 8.00001L6.22211 4.22223" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>`,
 ChatCircle:`<path d="M12.2222 2.44446H3.77778C2.8 2.44446 2 3.24001 2 4.22224V14.4445L5.33333 11.7778H12.2222C13.2 11.7778 14 10.9822 14 10V4.22224C14 3.24446 13.2044 2.44446 12.2222 2.44446Z" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>`,
 CaretRight:`<path d="M5.77783 2.44446L11.3334 8.00001L5.77783 13.5556" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>`,
 Reload:`<path d="M7.55542 11.3333L9.55542 13.3333L7.55542 15.3333" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/><path d="M4.14211 4C3.09322 5.01333 2.44434 6.43556 2.44434 8C2.44434 11.0667 4.93322 13.5556 7.99989 13.5556C8.53322 13.5556 9.03989 13.4844 9.52878 13.3422" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.44434 4.66666L6.44434 2.66666L8.44434 0.666656" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/><path d="M11.8576 11.9911C12.8976 10.9866 13.5554 9.56443 13.5554 7.99998C13.5554 4.93332 11.0665 2.44443 7.99983 2.44443C7.48427 2.44443 6.98649 2.51554 6.51538 2.64887" stroke="#3A3A3A" stroke-width="1.33333" stroke-linecap="round" stroke-linejoin="round"/>`
};
const nuc=(k,size=24)=>`<svg width="${size}" height="${size}" viewBox="0 0 16 16" fill="none">${NUC[k].replace(/#3A3A3A/g,"currentColor").replace(/stroke-width="[\d.]+"/g,`stroke-width="${(1.33*16/size).toFixed(3)}"`)}</svg>`;
Object.assign(I,{help:nuc("Help",24),close:nuc("Close",24),back:nuc("ArrowLeft",24),bubble:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"><path d="M18.3333 3.66675H5.66667C4.2 3.66675 3 4.86007 3 6.33342V21.6668L8 17.6668H18.3333C19.8 17.6668 21 16.4734 21 15.0001V6.33342C21 4.86675 19.8066 3.66675 18.3333 3.66675Z"/><path d="M7.8 8.25H16.2"/><path d="M7.8 12.45H12.9"/></svg>`,flip:nuc("Reload",28),caret:nuc("CaretRight",16)});
/* Illustration: Learning Diary empty state, clipboard (Figma 12671-14082, slot-visual) */
I.clip=`<svg width="88" height="141" viewBox="0 0 88 141" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_12710_191)"><path d="M87.3383 13.1858H3.94189V139.423H87.3383V13.1858Z" fill="#3A3A3A"/><path d="M87.3381 140.072H3.9417C3.59732 140.072 3.31934 139.782 3.31934 139.423V13.1858C3.31934 12.827 3.59732 12.5374 3.9417 12.5374H87.3381C87.6825 12.5374 87.9605 12.827 87.9605 13.1858V139.423C87.9605 139.782 87.6825 140.072 87.3381 140.072ZM4.56406 138.775H86.7158V13.8343H4.56406V138.775Z" fill="#3A3A3A"/><path d="M84.019 11.4563H0.622559V137.694H84.019V11.4563Z" fill="white"/><path d="M84.0188 138.342H0.622361C0.277988 138.342 0 138.052 0 137.694V11.4563C0 11.0975 0.277988 10.8079 0.622361 10.8079H84.0188C84.3632 10.8079 84.6411 11.0975 84.6411 11.4563V137.694C84.6411 138.052 84.3632 138.342 84.0188 138.342ZM1.24472 137.045H83.3964V12.1048H1.24472V137.045Z" fill="#3A3A3A"/><path d="M70.7336 124.391L71.2563 132.359L5.55158 132.705L4.99561 18.5724L79.9196 18.179L80.4258 122.519L70.7336 124.391Z" fill="white"/><path d="M5.55163 133.353C5.20726 133.353 4.92927 133.064 4.92927 132.709L4.37744 18.5768C4.37744 18.4039 4.43968 18.2396 4.55585 18.1185C4.67203 17.9975 4.82969 17.9283 4.99565 17.9283L79.9197 17.5349C80.264 17.5349 80.542 17.8246 80.542 18.1791L81.0482 122.519C81.0482 122.835 80.8366 123.103 80.5379 123.159L71.3933 124.927L71.8788 132.316C71.8912 132.493 71.829 132.67 71.7128 132.8C71.5966 132.93 71.4306 133.007 71.2605 133.007L5.55163 133.353ZM5.62216 19.2166L6.16984 132.052L70.5925 131.715L70.1154 124.439C70.0947 124.11 70.3104 123.816 70.6216 123.756L79.8035 121.983L79.3014 18.8319L5.62216 19.221V19.2166Z" fill="#3A3A3A"/><path d="M29.8359 27.1973L17.6334 27.8457C16.173 27.9192 15.0569 29.2335 15.1689 30.7552L15.6419 37.1882C15.7456 38.5889 16.8576 39.6697 18.2019 39.687L20.2432 39.7086L18.5172 44.6543L23.7118 39.7475L29.2135 39.8253C30.5537 39.8383 31.6863 38.7877 31.8233 37.4L32.5411 30.1759C32.7029 28.5288 31.425 27.1151 29.8359 27.1973Z" fill="white"/><path d="M18.5173 45.3029C18.397 45.3029 18.2767 45.2683 18.1688 45.1948C17.9323 45.0305 17.8327 44.7149 17.9323 44.4339L19.3554 40.3485L18.1937 40.3355C16.5133 40.3182 15.1483 38.9867 15.0196 37.2358L14.5466 30.8029C14.4803 29.8907 14.7624 29.0131 15.3433 28.3257C15.9241 27.6383 16.7249 27.2406 17.6045 27.1973L29.8069 26.5489C30.7488 26.5013 31.6533 26.8861 32.2964 27.5951C32.9395 28.3041 33.2548 29.2725 33.1594 30.2452L32.4416 37.4692C32.2715 39.1899 30.8981 40.4782 29.2427 40.4782C29.2302 40.4782 29.2178 40.4782 29.2053 40.4782L23.9484 40.4004L18.9364 45.1343C18.8202 45.2467 18.6708 45.3029 18.5173 45.3029ZM29.8692 27.8458L17.6667 28.4943C17.1274 28.5202 16.6336 28.7667 16.2768 29.186C15.92 29.6054 15.7457 30.1458 15.7872 30.7034L16.2602 37.1364C16.339 38.2085 17.1771 39.0256 18.2061 39.0342L20.2475 39.0559C20.4508 39.0559 20.6375 39.1639 20.7537 39.3369C20.8698 39.5098 20.8947 39.7303 20.8283 39.9291L19.9612 42.415L23.297 39.2677C23.4132 39.1553 23.5584 39.0948 23.7244 39.0991L29.2261 39.1769C30.2426 39.1812 31.1014 38.3944 31.2093 37.3309L31.9271 30.1068C31.9852 29.5102 31.7943 28.918 31.4002 28.4813C31.006 28.0447 30.45 27.8112 29.8733 27.8415L29.8692 27.8458Z" fill="#3A3A3A"/><path d="M23.0649 36.9331C22.8657 36.9331 22.6749 36.8336 22.5587 36.6607L21.1646 34.6072C20.9654 34.3132 21.0318 33.9112 21.314 33.7037C21.5961 33.4961 21.982 33.5653 22.1811 33.8593L22.9114 34.9314C23.7453 32.9384 24.683 31.7971 25.6 30.6904L25.9319 30.284C26.1559 30.0116 26.546 29.9771 26.8073 30.2105C27.0687 30.444 27.1019 30.8503 26.8779 31.1227L26.5418 31.5334C25.4962 32.8044 24.5046 34.002 23.654 36.5051C23.5752 36.7342 23.3844 36.8985 23.152 36.9288C23.123 36.9288 23.0939 36.9331 23.0649 36.9331Z" fill="#3A3A3A"/><path d="M39.408 32.0091C39.0636 32.0091 38.7856 31.7195 38.7856 31.365C38.7856 31.0062 39.0595 30.7165 39.4039 30.7122L67.2027 30.5652C67.547 30.5652 67.825 30.8548 67.825 31.2093C67.825 31.5682 67.5512 31.8578 67.2068 31.8621L39.408 32.0091Z" fill="#3A3A3A"/><path d="M39.4285 35.9001C39.0841 35.9001 38.8062 35.6104 38.8062 35.2559C38.8062 34.8971 39.08 34.6074 39.4244 34.6031L58.5101 34.5037C58.8545 34.5037 59.1325 34.7933 59.1325 35.1478C59.1325 35.5066 58.8586 35.7963 58.5143 35.8006L39.4285 35.9001Z" fill="#3A3A3A"/><path d="M29.9399 47.9487L17.7374 48.5972C16.277 48.6707 15.1609 49.9849 15.2729 51.5067L15.7459 57.9396C15.8496 59.3403 16.9616 60.4211 18.3059 60.4384L20.3472 60.46L18.6212 65.4058L23.8158 60.4989L29.3175 60.5768C30.6577 60.5897 31.7904 59.5392 31.9273 58.1515L32.6451 50.9274C32.8069 49.2803 31.529 47.8666 29.9399 47.9487Z" fill="white"/><path d="M18.6169 66.0542C18.4966 66.0542 18.3763 66.0196 18.2684 65.9461C18.0319 65.7818 17.9323 65.4662 18.0319 65.1852L19.455 61.0998L18.2933 61.0869C16.6129 61.0696 15.2479 59.738 15.1192 57.9871L14.6462 51.5542C14.5799 50.642 14.862 49.7644 15.4429 49.077C16.0237 48.3896 16.8245 47.9919 17.7041 47.9487L29.9065 47.3002C30.8484 47.257 31.7529 47.6374 32.396 48.3464C33.0391 49.0554 33.3544 50.0238 33.259 50.9965L32.5412 58.2206C32.3669 59.9542 30.9812 61.2252 29.3049 61.2295L24.0481 61.1517L19.036 65.8856C18.9198 65.998 18.7704 66.0542 18.6169 66.0542ZM29.9688 48.5972L17.7664 49.2456C17.227 49.2716 16.7332 49.518 16.3764 49.9373C16.0196 50.3567 15.8453 50.8971 15.8868 51.4548L16.3598 57.8877C16.4386 58.9598 17.2768 59.7769 18.3057 59.7856L20.3471 59.8072C20.5504 59.8072 20.7371 59.9153 20.8533 60.0882C20.9694 60.2611 20.9943 60.4816 20.9279 60.6805L20.0608 63.1663L23.3966 60.019C23.5128 59.9109 23.658 59.8547 23.824 59.8504L29.3257 59.9282C29.3257 59.9282 29.3423 59.9282 29.3464 59.9282C30.3588 59.9282 31.2011 59.1371 31.3089 58.0822L32.0267 50.8582C32.0848 50.2616 31.894 49.6693 31.4998 49.2327C31.1056 48.796 30.5455 48.5669 29.9729 48.5928L29.9688 48.5972Z" fill="#3A3A3A"/><path d="M23.1684 57.6845C22.9692 57.6845 22.7784 57.5851 22.6622 57.4122L21.2681 55.3587C21.069 55.0647 21.1353 54.6626 21.4175 54.4551C21.6996 54.2476 22.0855 54.3168 22.2846 54.6108L23.0149 55.6829C23.8447 53.6899 24.7865 52.5486 25.6993 51.4419L26.0313 51.0355C26.2553 50.7631 26.6453 50.7285 26.9067 50.962C27.1681 51.1954 27.2013 51.6018 26.9772 51.8742L26.6412 52.2849C25.5956 53.5559 24.604 54.7534 23.7534 57.2522C23.6746 57.4813 23.4837 57.6456 23.2514 57.6759C23.2223 57.6759 23.1933 57.6802 23.1642 57.6802L23.1684 57.6845Z" fill="#3A3A3A"/><path d="M39.5115 52.7604C39.1671 52.7604 38.8892 52.4707 38.8892 52.1162C38.8892 51.7574 39.163 51.4677 39.5074 51.4634L67.3062 51.3164C67.6506 51.3164 67.9285 51.6061 67.9285 51.9606C67.9285 52.3194 67.6547 52.609 67.3103 52.6134L39.5115 52.7604Z" fill="#3A3A3A"/><path d="M39.5281 56.6513C39.1837 56.6513 38.9058 56.3616 38.9058 56.0071C38.9058 55.6483 39.1796 55.3586 39.524 55.3543L58.6097 55.2549C58.9541 55.2549 59.2321 55.5445 59.2321 55.899C59.2321 56.2579 58.9582 56.5475 58.6139 56.5518L39.5281 56.6513Z" fill="#3A3A3A"/><path d="M30.0395 68.7002L17.837 69.3487C16.3766 69.4222 15.2605 70.7364 15.3725 72.2582L15.8455 78.6911C15.9492 80.0918 17.0612 81.1726 18.4055 81.1899L20.4468 81.2115L18.7208 86.1572L23.9154 81.2504L29.4171 81.3282C30.7573 81.3412 31.89 80.2907 32.0269 78.9029L32.7447 71.6789C32.9065 70.0317 31.6286 68.618 30.0395 68.7002Z" fill="white"/><path d="M18.7165 86.8056C18.5962 86.8056 18.4759 86.771 18.368 86.6975C18.1315 86.5332 18.0319 86.2176 18.1315 85.9366L19.5546 81.8512L18.3929 81.8382C16.7125 81.821 15.3475 80.4894 15.2188 78.7385L14.7459 72.3056C14.6795 71.3934 14.9616 70.5158 15.5425 69.8284C16.1233 69.1454 16.9241 68.7433 17.8037 68.7001L30.0062 68.0516C30.9438 68.004 31.8525 68.3845 32.4956 69.0978C33.1429 69.8068 33.454 70.7752 33.3586 71.7479L32.6408 78.972C32.4707 80.6926 31.0974 81.9809 29.4419 81.9809C29.4294 81.9809 29.417 81.9809 29.4045 81.9809L24.1477 81.9031L19.1356 86.637C19.0194 86.7494 18.87 86.8056 18.7165 86.8056ZM30.0684 69.3485L17.866 69.997C17.3266 70.023 16.8328 70.2694 16.476 70.6887C16.1192 71.1081 15.9449 71.6485 15.9864 72.2062L16.4594 78.6391C16.5383 79.7112 17.3764 80.5283 18.4053 80.537L20.4467 80.5586C20.65 80.5586 20.8367 80.6667 20.9529 80.8396C21.069 81.0125 21.0939 81.233 21.0276 81.4319L20.1604 83.9177L23.4963 80.7704C23.6124 80.658 23.7618 80.5975 23.9236 80.6018L29.4253 80.6796C30.4377 80.6796 31.3007 79.8971 31.4085 78.8336L32.1263 71.6096C32.1844 71.013 31.9936 70.4207 31.5953 69.9841C31.2011 69.5474 30.641 69.314 30.0684 69.3442V69.3485Z" fill="#3A3A3A"/><path d="M30.1386 89.4514L17.9362 90.0999C16.4757 90.1734 15.3596 91.4876 15.4716 93.0094L15.9446 99.4423C16.0483 100.843 17.1603 101.924 18.5046 101.941L20.5459 101.963L18.8199 106.908L24.0146 102.002L29.5162 102.079C30.8564 102.092 31.9891 101.042 32.126 99.6541L32.8438 92.4301C33.0056 90.783 31.7277 89.3693 30.1386 89.4514Z" fill="white"/><path d="M18.82 107.557C18.6997 107.557 18.5794 107.522 18.4715 107.449C18.235 107.285 18.1354 106.969 18.235 106.688L19.6581 102.603L18.4964 102.59C16.816 102.572 15.451 101.241 15.3224 99.4898L14.8494 93.0569C14.783 92.1447 15.0651 91.2671 15.646 90.5797C16.2269 89.8967 17.0276 89.4946 17.9072 89.4514L30.1097 88.8029C31.0474 88.7597 31.956 89.1358 32.5991 89.8491C33.2464 90.5581 33.5576 91.5265 33.4621 92.4992L32.7443 99.7233C32.5701 101.457 31.176 102.754 29.5081 102.732L24.2512 102.654L19.2391 107.388C19.1229 107.501 18.9736 107.557 18.82 107.557ZM30.1719 90.0999L17.9695 90.7484C17.4301 90.7743 16.9364 91.0207 16.5795 91.4401C16.2227 91.8594 16.0485 92.3998 16.0899 92.9575L16.5629 99.3904C16.6418 100.463 17.4799 101.28 18.5089 101.288L20.5502 101.31C20.7535 101.31 20.9402 101.418 21.0564 101.591C21.1726 101.764 21.1975 101.984 21.1311 102.183L20.2639 104.669L23.5998 101.522C23.7159 101.414 23.8653 101.357 24.0271 101.353L29.5288 101.431C29.5288 101.431 29.5454 101.431 29.5495 101.431C30.5619 101.431 31.4042 100.64 31.5121 99.585L32.2298 92.3609C32.2879 91.7643 32.0971 91.172 31.6988 90.7354C31.3046 90.2987 30.7445 90.0653 30.1719 90.0955V90.0999Z" fill="#3A3A3A"/><path d="M30.2382 110.203L18.0358 110.851C16.5753 110.925 15.4592 112.239 15.5712 113.761L16.0442 120.194C16.1479 121.594 17.2599 122.675 18.6042 122.692L20.6455 122.714L18.9195 127.66L24.1142 122.753L29.6158 122.831C30.956 122.844 32.0887 121.793 32.2256 120.405L32.9434 113.181C33.1052 111.534 31.8273 110.12 30.2382 110.203Z" fill="white"/><path d="M18.9196 128.308C18.7993 128.308 18.679 128.274 18.5711 128.2C18.3346 128.036 18.235 127.72 18.3346 127.439L19.7578 123.354L18.596 123.341C16.9156 123.324 15.5506 121.992 15.422 120.241L14.949 113.808C14.8826 112.896 15.1647 112.018 15.7456 111.331C16.3265 110.644 17.1272 110.246 18.0068 110.203L30.2093 109.554C31.147 109.507 32.0556 109.887 32.6987 110.6C33.3418 111.309 33.6572 112.278 33.5617 113.251L32.8439 120.475C32.6738 122.195 31.3005 123.484 29.645 123.484H29.6077L24.3508 123.406L19.3387 128.14C19.2225 128.252 19.0732 128.308 18.9196 128.308ZM30.2715 110.851L18.0691 111.5C17.5297 111.526 17.036 111.772 16.6791 112.191C16.3223 112.611 16.1481 113.151 16.1896 113.709L16.6625 120.142C16.7414 121.214 17.5795 122.031 18.6085 122.04L20.6498 122.061C20.8531 122.061 21.0398 122.169 21.156 122.342C21.2722 122.515 21.2971 122.736 21.2307 122.935L20.3635 125.42L23.6994 122.273C23.8156 122.165 23.9649 122.1 24.1267 122.104L29.6284 122.182H29.6492C30.6615 122.182 31.5038 121.391 31.6117 120.336L32.3295 113.112C32.3875 112.516 32.1967 111.923 31.8025 111.487C31.4084 111.05 30.8524 110.821 30.2757 110.847L30.2715 110.851Z" fill="#3A3A3A"/><path d="M71.2566 133.007C71.0989 133.007 70.9454 132.947 70.8251 132.826C70.5803 132.575 70.572 132.164 70.8126 131.909L79.9821 122.07C80.2227 121.815 80.6169 121.806 80.8617 122.057C81.1065 122.308 81.1148 122.718 80.8741 122.973L71.7047 132.813C71.5844 132.943 71.4184 133.012 71.2566 133.012V133.007Z" fill="#3A3A3A"/><path d="M52.9136 5.83627H49.0134C48.2002 5.83627 47.5115 5.26128 47.2708 4.45285C46.6153 2.25234 44.6528 0.648438 42.321 0.648438C39.9892 0.648438 38.0267 2.24802 37.3711 4.45285C37.1305 5.26561 36.4417 5.83627 35.6285 5.83627H31.7284C28.5253 5.83627 25.9321 8.53826 25.9321 11.8758V21.8321H58.7098V11.8758C58.7098 8.53826 56.1166 5.83627 52.9136 5.83627ZM42.321 6.70091C41.5202 6.70091 40.8688 6.02217 40.8688 5.18779C40.8688 4.35341 41.5202 3.67467 42.321 3.67467C43.1217 3.67467 43.7732 4.35341 43.7732 5.18779C43.7732 6.02217 43.1217 6.70091 42.321 6.70091Z" fill="white"/><path d="M58.7096 22.4806H25.9319C25.5876 22.4806 25.3096 22.1909 25.3096 21.8321V11.8758C25.3096 8.18813 28.189 5.18783 31.7282 5.18783H35.6283C36.1511 5.18783 36.6117 4.81604 36.7776 4.25834C37.5327 1.71198 39.7608 0 42.3208 0C44.8808 0 47.1088 1.71198 47.8639 4.25834C48.0299 4.81604 48.4905 5.18783 49.0132 5.18783H52.9134C56.4525 5.18783 59.332 8.18813 59.332 11.8758V21.8321C59.332 22.1909 59.054 22.4806 58.7096 22.4806ZM26.5543 21.1836H58.0873V11.8758C58.0873 8.90145 55.7679 6.48479 52.9134 6.48479H49.0132C47.9428 6.48479 47.0009 5.74552 46.6773 4.64311C46.084 2.64147 44.3331 1.29696 42.3249 1.29696C40.3168 1.29696 38.5659 2.64147 37.9725 4.64311C37.6448 5.74552 36.7071 6.48479 35.6325 6.48479H31.7323C28.8778 6.48479 26.5584 8.90145 26.5584 11.8758V21.1836H26.5543ZM42.3208 7.34943C41.1756 7.34943 40.2462 6.38103 40.2462 5.18783C40.2462 3.99463 41.1756 3.02623 42.3208 3.02623C43.4659 3.02623 44.3953 3.99463 44.3953 5.18783C44.3953 6.38103 43.4659 7.34943 42.3208 7.34943ZM42.3208 4.32319C41.8644 4.32319 41.491 4.71228 41.491 5.18783C41.491 5.66338 41.8644 6.05247 42.3208 6.05247C42.7772 6.05247 43.1506 5.66338 43.1506 5.18783C43.1506 4.71228 42.7772 4.32319 42.3208 4.32319Z" fill="#3A3A3A"/><path d="M53.9382 16.8604H30.7034C30.359 16.8604 30.0811 16.5708 30.0811 16.212C30.0811 15.8531 30.359 15.5635 30.7034 15.5635H53.9382C54.2826 15.5635 54.5606 15.8531 54.5606 16.212C54.5606 16.5708 54.2826 16.8604 53.9382 16.8604Z" fill="#3A3A3A"/></g><defs><clipPath id="clip0_12710_191"><rect width="87.9604" height="140.071" fill="white"/></clipPath></defs></svg>`;

/* ================= phone ================= */
const LONG="I think the line goes up by 2 every step because the slope m is the number in front of x. When x is 0 the line is at 3, so b has to be 3. That means y = 2x + 3. But I'm not sure if it matters which way I count the steps, like left or right. If I go one step left it goes down by 2, so it's the same slope. Is that right? And what happens if the slope is negative, does the line go down then?";
function preset(kind){
  const q={text:"",focused:false,sheet:false,attach:false,typing:false,note:null,reserved:false};
  if(kind==="typing-empty") q.focused=true;
  if(kind==="typing-3"){ q.focused=true; q.text="I think the line goes up by 2 every step because m is the number in front of x, and it starts at 3 so b = 3."; }
  if(kind==="typing-7"){ q.focused=true; q.text=LONG.slice(0,262); }
  if(kind==="typing-overflow"){ q.focused=true; q.text=LONG; }
  if(kind==="focus-mode"){ q.focused=true; q.text=LONG; q.fs=true; }
  if(kind==="upload-sheet"){ q.sheet=true; q.focused=true; }
  if(kind==="upload-picker"){ q.picker=true; }
  if(kind==="upload-attached"){ q.attach=["image","drawing","doc","loading"]; q.focused=true; q.text="Here is my solution from the worksheet."; }
  if(kind==="sending") q.typing=true;
  if(kind==="placeholder") q.note=["Not designed yet","Sketch it in the Figma playground, then spec it here."];
  if(kind==="custom") q.note=["New screen","Write the spec on the right. The screen follows once it's designed."];
  if(kind==="reserved"){ q.reserved=true; q.note=["Out of scope: STT / S2S","The dashed ring marks the space reserved for voice."]; }
  return q;
}
// el(id,label) marks an interactive element; numbers are assigned in DOM order
let PREV={};
async function loadPreviews(){
  if(!DB) return;
  try{ const c=unwrap(await DB.doc("assets/previews").get()); if(c&&c.photo){ PREV=structuredClone(c); renderStage(); return; } }catch(e){}
  let mcp=null; try{ mcp=await window.claude.use("mcp"); }catch(e){} if(!mcp) return;
  const nodes={photo:"12495:98458",drawing:"12495:98473",doc:"12495:98487"}, out={};
  for(const [k,id] of Object.entries(nodes)){
    try{ const r=await mcp.callTool("Figma","get_screenshot",{fileKey:"GbI4xt40lr0Jmk3rkgrtM0",nodeId:id,maxDimension:320,enableBase64Response:true});
      const img=findImage(r&&r.payload!==undefined?r.payload:r); if(img) out[k]=img; }catch(e){ console.warn("preview",k,e); }
  }
  if(Object.keys(out).length){ PREV=out; renderStage(); try{ await DB.doc("assets/previews").set(out); }catch(e){} }
}
/* Attachment visuals from BR-7144 at the small size (Hannes 23.11): photo with a white frame, canvas card, document page with fold;
   thin outline + hard shadow, straight (no tilt). Loading stays as it is. A file the student picked replaces the sample image. */
let attDocN=0;
function attDocSVG(src){ const id="adp"+(++attDocN), page="M0 0H272L316.5 43.4L317.1 178.8H0Z"; /* fold ~75% bigger than BR-7144 at this small size (Hannes 24.11) */
  return `<svg class="docsvg" viewBox="0 0 321 183" preserveAspectRatio="none" role="img" aria-label="Document"><defs><clipPath id="${id}"><path d="${page}"/></clipPath></defs><g clip-path="url(#${id})"><rect width="321" height="183" fill="#fff"/><image href="${src}" width="317.1" height="178.8" preserveAspectRatio="xMidYMid slice"/><rect width="321" height="183" fill="#000" opacity=".03"/></g><path class="dln" d="${page}"/><path class="dsh" d="M275 3.3V46.4H319.2Z"/><path class="dfold" d="M272 .3V43.4H316.2Z"/></svg>`; }
const ATT={
 get image(){ return `<span class="pic"><img src="${PREV.photo||"assets/photo.png"}" alt=""></span>`; },
 get loading(){ return attLoad("image"); },
 get drawing(){ return `<img class="drw" src="${PREV.drawing||"assets/drawing.png"}" alt="">`; },
 get doc(){ return attDocSVG(PREV.doc||"assets/document.png"); }
};
/* Loading (spec u-att edge case, Hannes 24.11): BR-7144 ink dots fill the attachment's own shape (photo frame, canvas card, document page);
   outline + shadow stay, dots get denser as the upload runs, then the file snaps in. "type~" = still uploading; "loading" = endless (spec frame). */
function attInk(lv){ return `<span class="ink ${lv==="inf"?"inf":"prog"}" role="img" aria-label="Uploading"></span>`; }
function attLoad(t,lv="inf"){
  if(t==="doc") return attDocSVG("").replace(/<image[^>]*\/>/,"")+`<span class="dink">${attInk(lv)}</span>`;
  if(t==="drawing") return `<span class="dwl">${attInk(lv)}</span>`;
  return `<span class="pic">${attInk(lv)}</span>`; }
const attBase=t=>t==="loading"?"image":t.replace(/~$/,"");
function attCls(t){ return t==="loading"?"image a-up":t.endsWith("~")?attBase(t)+" a-up":t; }
function attHTML(t){ return t==="loading"?attLoad("image","inf"):t.endsWith("~")?attLoad(attBase(t),"prog"):ATT[t]; }

const el=(id,label)=>`data-el="${id}" data-label="${esc(label)}"`;
function seed(kind){ const p=preset(kind); return {_m:1,text:p.text||"",focused:!!p.focused,menu:!!p.sheet,picker:false||!!p.picker,atts:Array.isArray(p.attach)?[...p.attach]:[],waiting:!!p.typing,thread:[],note:p.note,reserved:!!p.reserved,fs:!!p.fs}; }
function ensureModel(){ if(!ui.live||!ui.live._m){ const st=curState(); ui.live=seed(st?st.kind:"idle"); restoreThread(); } return ui.live; }
let _mctx=null;
function textW(t){ if(!_mctx){ _mctx=document.createElement("canvas").getContext("2d"); } _mctx.font='500 16px "Nunito Sans",system-ui,sans-serif'; return _mctx.measureText(t).width; }
function inlineFieldW(){ const ph=document.querySelector("#pwrap .phone"); const w=ph?ph.clientWidth:402; return w-144; } /* 20+20 padding, 40 +, 40 mic/send, 2x8 gaps, 2x4 text padding */
function fitsInline(text,atts){ if(atts&&atts.length) return false; if(/\n/.test(text||"")) return false; return textW(text||"")<=inlineFieldW()-2; }
/* R2: once the text has switched to the full-width layout it stays there until the message is sent or all text is deleted */
function isInline(M){ return !!M.focused&&!M.fs&&!M.stacked&&fitsInline(M.text,M.atts); }
function updStacked(M){ if(!(M.text||"").trim()&&!(M.atts||[]).length) M.stacked=false; else if(!fitsInline(M.text,M.atts)) M.stacked=true; }
function discBody(extra){
  return `<div class="p-chat d-chat"><div class="d-top"><div class="q-card d-peek"><p>What does <b>m</b> stand for in y = mx + b?</p><div class="q-ans">The point where the line crosses the y-axis</div></div></div>
  <div class="d-sheet"><span class="d-grab"></span><div class="d-h"><b>Discussion room</b>${I.bubble}</div><div class="d-rules">Rules ${I.caret}</div>
  ${extra||`<div class="d-empty oosa" data-oos="Chat history: as is, out of scope"><div class="d-ill"><img src="assets/robot-book.png" alt=""></div><p class="d-e1">Nothing has been discussed yet</p><p>Got a question or an idea? Share it here and explain briefly why you’re asking. That helps others help you.</p></div>`}</div></div>`; }
function diaryBody(extra){
  return `<div class="p-chat y-chat"><img class="y-stats-img" src="assets/diary-stats.png" alt="Time +9 min, Progress +10 %, Points +22">
  <div class="y-act">4 activities <span>${I.caret}</span></div>
  ${extra||`<div class="y-empty oosa" data-oos="Chat history: as is, out of scope">${I.clip}<b>How was your learning day?</b><p>Note down how your learning went. If you record what worked and what didn’t, you’ll see over time what really helps you.</p></div>`}</div>`; }
function phoneHTML(st,live={},interactive=true){
  const M=interactive?ensureModel():seed(st.kind); if(interactive) syncThreadCtx(M);
  const q={text:M.text,focused:M.focused,inline:isInline(M),fs:M.focused&&!!M.fs,sheet:M.menu,picker:M.picker,pickKind:M.pickKind,attach:M.atts.length?M.atts:false,typing:M.waiting,note:M.note,reserved:M.reserved};
  if(!VARIANTS.some(x=>x.id===ui.variant)&&!(VARIANTS_ARCHIVED.some(x=>x.id===ui.variant)&&ui._showArchived)) ui.variant="pill";
  const ctx=ui.context, dark=isDarkCtx(ctx), quiz=ctx==="quiz", disc=ctx==="discussion", diary=ctx==="diary", v=ui.variant, inv=v==="inv", vcls=v==="pill-sq"?(dark?"v-pill":"v-pill v-pill-light"):v==="pill-light"?"v-pill v-pill-light":inv?"v-open v-inv":v==="angled"?"v-open v-angled":"v-"+v;
  const tab=ctx==="tutor"&&!q.focused;
  const hasText=(q.text||"").trim().length>0||!!q.attach, canSend=(q.text||"").trim().length>0||(q.attach&&q.attach.some(t=>t!=="loading"&&!t.endsWith("~"))); /* send shows once the first attachment has finished uploading */
  const ink=dark?"#2f2f2f":"#fff";
  const extra=(M.thread||[]).map(x=>x.who==="s"?`<div class="m-s"><div>${esc(x.text)}${x.atts&&x.atts.length?`<div class="oos" data-oos="In-chat attachments: not part of BR-7147 (→ BR-7144)"><span class="oos-chip">📎 ${x.atts.length} attachment${x.atts.length>1?"s":""}</span></div>`:""}</div><div class="wl"></div></div>`:`<div class="m-t"><p>${esc(x.text)}</p><div class="act"><button ${el("speaker2","Read answer aloud")} aria-label="Read aloud">${I.speaker}</button></div></div>`).join("");
  const typing=q.typing;
  const reply="";
  return `<div class="phone ${dark?"dark":""} ${quiz?"quiz":""} ${disc?"disc":""} ${diary?"diary":""} ${inv?"vinv":""} ${q.focused?"kbdopen":""} ${q.reserved?"reserved":""} ${q.picker?"headhidden":""}">
    <div class="p-status"><span>9:41</span><svg width="66" height="12" viewBox="0 0 66 12" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx=".7"/><rect x="4.5" y="5" width="3" height="6" rx=".7"/><rect x="9" y="3" width="3" height="8" rx=".7"/><rect x="13.5" y="0" width="3" height="11" rx=".7"/><path d="M28 3.2a9 9 0 0 1 12 0l-1.2 1.3a7.2 7.2 0 0 0-9.6 0zM30.4 5.8a5.4 5.4 0 0 1 7.2 0L36.4 7a3.6 3.6 0 0 0-4.8 0zM34 10.6l-1.4-1.5a2 2 0 0 1 2.8 0z"/><rect x="44" y=".5" width="20" height="11" rx="2.7" fill="none" stroke="currentColor"/><rect x="46" y="2.5" width="16" height="7" rx="1.3"/></svg></div>
    ${disc?"":diary?`<div class="p-head d-head"><button ${el("back","Back")} aria-label="Back">${I.back}</button><span class="t">Today, 17.11.2026</span></div>`:`<div class="p-head">${dark?`<button ${el("help","Help")} aria-label="Help">${I.help}</button>`:`<button ${el("menu","Open chat history")} aria-label="Menu">${I.menu}</button>`}<span class="t">${quiz?"Linear Functions":dark?"Creating Linear Equations":"AI-Tutor"}</span>${dark?`<button ${el("close","Close")} aria-label="Close">${I.close}</button>`:`<button ${el("newchat","New chat")} aria-label="New chat">${I.newchat}</button>`}</div>`}
    ${disc?discBody(extra):diary?diaryBody(extra):quiz?`<div class="p-chat q-chat"><div class="q-prog"><span class="q-bar"><i></i></span></div><div class="q-card"><div class="q-q"><p>What does <b>m</b> stand for in y = mx + b?</p><div class="q-ans">The point where the line crosses the y-axis</div></div><div class="q-foot"><span>${I.speaker}</span><span class="q-flip">${I.flip}</span></div></div><div class="q-hint">Tap the card</div><div class="q-wrong">Wrong!</div>${extra}${typing?`<div class="typing"><div class="ava">B</div><div class="dots"><span></span><span></span><span></span></div></div>`:""}</div>`:`<div class="p-chat">
      ${interactive?`<div class="m-t"><p>Welcome back, Alex. Today we continue with <b>linear functions</b>. Ready?</p></div><div class="m-s"><div>Yes, let’s go.</div><div class="wl"></div></div>`:""}
      <div class="m-t"><p>Imagine a line that crosses the y-axis at 3 and goes up by 2 for every step to the right. <b>How would you describe it?</b> Take your time and use your own words.</p><div class="act"><button ${el("speaker","Read message aloud")} aria-label="Read aloud">${I.speaker}</button></div></div>
      <div class="m-s"><div>It starts at 3 on the y-axis, and every time I go one step to the right, it goes up by 2.</div><div class="wl"></div></div>
      <div class="m-t"><p>Good description, Alex. You just named the two key parts of a linear function. <b>Can you write the line as an equation of the form y = mx + b?</b></p></div>
      <div class="tag">Today</div>
      <div class="m-s"><div>y = 2x + 3. So m is 2 because the line goes up by 2, and b is 3 because that's where it crosses the y-axis.</div><div class="wl"></div></div>
      ${extra}
      ${typing?`<div class="typing"><div class="ava">B</div><div class="dots"><span></span><span></span><span></span></div></div>`:reply}
    </div>`}
    ${(()=>{ const plus=`<button class="c-plus" ${el("plus","Add attachment (+)")} aria-label="Add attachment">${I.plus(inv?(dark?"#fff":"#2f2f2f"):(v==="pill"&&!dark?"#fff":ink))}</button>`;
      const right=canSend?`<button class="c-right send ${q.typing?"inactive":""}" ${el("send","Send")} aria-label="Send" ${q.typing?'aria-disabled="true"':""}>${I.send}</button>`:`<button class="c-right" ${el("mic","Voice input (reserved)")} aria-label="Voice input">${I.mic}<span class="resv"></span></button>`;
      const body=`<div class="c-body">${q.attach?`<div class="c-att">${q.attach.map((t,i)=>`<span class="att ${attCls(t).split(" ").map((c,j)=>j?c:"a-"+c).join(" ")}"><span class="acard" data-open="${i}" role="button" aria-label="${(ATT_NAME[attBase(t)]||t)+(attCls(t).includes("a-up")?", uploading":"")}">${attHTML(t)}</span><button class="rm" data-rm="${i}" ${el("att-rm-"+i,"Remove attachment "+(i+1))} aria-label="Remove attachment">${nuc("Close",12)}</button></span>`).join("")}</div>`:""}<textarea rows="1" placeholder="${quiz?"Something unclear?":disc?"Post a question":diary?"What went well today?":"Ask anything"}" aria-label="Message" ${el("field","Text field")} ${interactive?"":"tabindex=-1"}>${esc(q.text)}</textarea></div>`;
      /* spec (Typing): on focus, + and mic move below the text, the field spans the message width and gets a border */
      /* Figma 12596:173965: while the text fits on one line, the field stays in one row between + and mic/send; it underlines what is typed (solid) on a dashed line. Only when it no longer fits do + and send move below. */
      const uline=`<span class="uline" aria-hidden="true"><i style="width:${Math.min(Math.ceil(textW(q.text||""))+4,inlineFieldW()+8)}px"></i></span>`;
      if(q.focused&&q.inline) return `<div class="cmp inline focused-inline ${vcls} ${disc?"noplus":""}">${disc?"":plus}${body.replace(/<\/div>$/,uline+"</div>")}${right}<span class="bar"></span></div>`;
      return (q.focused||hasText)
        ? `<div class="cmp focused ${q.focused?"":"resting"} ${vcls} ${disc?"noplus":""} ${q.fs?"fs":""}"><button class="c-exp" ${el("expand",q.fs?"Collapse (exit full screen)":"Expand to full screen")} aria-label="${q.fs?"Collapse":"Expand"}">${q.fs?I.collapse:I.expand}</button>${body}<div class="c-ctrl">${disc?"<span></span>":plus}${right}</div><span class="bar"></span></div>`
        : `<div class="cmp inline ${vcls} ${disc?"noplus":""} ${tab?"":"notab"} ${hasText?"hastext":""}">${disc?"":plus}${body.replace(/<\/div>$/,uline+"</div>")}${right}<span class="bar"></span></div>`; })()}
    ${tab?`<div class="p-tabs"><svg class="tline" viewBox="0 0 402 12" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="11.5" x2="402" y2="0.5" stroke="currentColor" stroke-width=".75"/></svg><button ${el("tab-map","Tab: Map")} aria-label="Map">${I.tabMap}</button><button class="sel" ${el("tab-chat","Tab: AI Tutor")} aria-label="AI Tutor">${I.tabChat}</button><button ${el("tab-stats","Tab: Statistics")} aria-label="Statistics">${I.tabStats}</button></div>`:""}
    ${quiz&&!q.focused?`<div class="q-result"><button class="q-disc" ${el("q-disc","Open discussion room")}>0 ${I.bubble}</button><button class="q-end" ${el("q-end","End quiz")}>End</button></div>`:""}
    ${q.focused?`<div class="kbd"><div>${"<i></i>".repeat(10)}</div><div>${"<i></i>".repeat(9)}</div><div>${"<i></i>".repeat(7)}</div><div><i></i><i></i><i class="w"></i><i></i></div></div>`:`<div class="home"></div>`}
    ${q.note?`<div class="ph-note"><b>${esc(q.note[0])}</b>${esc(q.note[1])}</div>`:""}
    ${q.sheet?`<div class="up-scrim" data-dim="typing-empty"></div><div class="up-menu" role="menu">
      <button ${el("opt-camera","Upload: Camera")}><span class="ic">${I.fCamera}</span>Camera</button>
      <button ${el("opt-gallery","Upload: Gallery")}><span class="ic">${I.fImage}</span>Gallery</button>
      <button ${el("opt-doc","Upload: Document")}><span class="ic">${I.fDoc}</span>Document</button>
      <button ${el("opt-draw","Upload: Canvas")}><span class="ic">${I.fDraw}</span>Canvas</button></div>`:""}
    ${q.picker?sysSheet(q.pickKind||"gallery",el):""}
    ${interactive?(S.pins||[]).filter(p=>p.state===st.id&&(!p.variant||p.variant===ui.variant)&&(p.ctx||"tutor")===ui.context).map((p,i)=>`<button class="cpin" data-pin="${p.id}" style="left:${p.x}px;top:${p.y}px" title="${esc(p.text)}" aria-label="Comment ${i+1}">${i+1}</button>`).join(""):""}
  </div>`;
}
// default behaviour when an element has no explicit link yet
const DEFAULT_TARGET={plus:"upload-sheet","opt-gallery":"upload-picker","opt-camera":"upload-picker","opt-doc":"upload-picker","opt-draw":"upload-picker","pick-add":"upload-attached","pick-cancel":"upload-sheet",send:"sending",field:"typing-empty","att-remove":"typing-empty"};

/* each touchpoint keeps its own sent messages (Hannes 24.11: test messages from the AI Tutor showed up in the Dialog, Discussion room and Diary) */
let THREADS={};
function syncThreadCtx(M){ const c=ui.context||"tutor"; if(THREADS.diary&&THREADS.diary.length) THREADS.diary=[]; if(M._ctx===undefined){ M._ctx=c; if(THREADS[c]&&!M.thread.length) M.thread=THREADS[c]; return; } if(M._ctx===c) return; THREADS[M._ctx]=M.thread||[]; M.thread=THREADS[c]||[]; M._ctx=c; if(document.body.classList.contains("proto")){ M.text=""; M.atts=[]; M.focused=false; M.fs=false; M.stacked=false; M.waiting=false; M.menu=false; M.picker=false; } }
function saveThread(){ if(!document.body.classList.contains("proto")) return; try{ THREADS[ui.live._ctx||ui.context||"tutor"]=ui.live.thread||[]; localStorage.setItem("proto-br7147",JSON.stringify({threads:THREADS})); }catch(e){} }
function restoreThread(){ if(!document.body.classList.contains("proto")) return; try{ const d=JSON.parse(localStorage.getItem("proto-br7147")||"null"); if(d&&d.threads) THREADS=d.threads; else if(d&&Array.isArray(d.thread)) THREADS={tutor:d.thread}; const c=ui.context||"tutor"; ui.live.thread=THREADS[c]||[]; ui.live._ctx=c; }catch(e){} }
function deriveKind(M){ if(M.picker) return "upload-picker"; if(M.fs&&M.focused) return "focus-mode"; if(M.menu) return "upload-sheet"; if(M.waiting) return "sending"; if(M.atts.length) return "upload-attached";
  if(M.focused){ if(!M.text.trim()) return "typing-empty"; const t=$("#pwrap textarea"); if(t&&t.scrollHeight>22.4*7+18) return "typing-overflow"; return "typing-filled"; } return "idle"; }
function syncSel(){ const want=deriveKind(ui.live); const pick=k=>{ const inMode=curMode().states.find(s=>s.kind===k); return inMode?{m:curMode(),s:inMode}:flat().find(x=>x.s.kind===k); };
  let hit=want==="typing-filled"?(pick("typing-3")||pick("typing-7")):pick(want);
  if(hit&&hit.s.id!==ui.sel.state){ ui.sel={kind:"state",mode:hit.m.id,state:hit.s.id}; renderHeader(); markActive(); if(document.body.classList.contains("attn-proto")) scrollToSel(); placeBadges(); renderMinimap(); } }
function rerenderKeepCaret(keep){ const t=$("#pwrap textarea"); const had=keep||document.activeElement===t; const pos=t?t.selectionStart:0; renderStage(); if(had||ui.live.focused&&!ui.live.menu&&!ui.live.picker){ const n=$("#pwrap textarea"); if(n&&had){ ui.refocusing=true; n.focus(); ui.refocusing=false; n.setSelectionRange(pos,pos); } } }
/* System / existing screens per upload type, taken from Figma "Uploading Documents" (12596:173966). Images are screenshots (system UI, existing canvas and document viewer are out of scope); hotspots in image px. */
const SYS={
  camera:{img:"cam",w:383,h:502,left:13,bottom:6,radius:24,spots:[["pick-cancel","Camera: Back",22,430,52,52],["pick-add","Camera: Shutter",158,420,64,64]]},
  gallery:{img:"gallery",w:402,h:520,spots:[["pick-cancel","Gallery: Back",34,448,52,52],["pick-add","Gallery: Select photo",160,282,96,40],["pick-add","Gallery: Select photo",0,0,402,140]]},
  draw:{img:"canvas",w:402,h:562,spots:[["pick-cancel","Canvas: Close",0,34,56,52],["pick-add","Canvas: Save",280,34,122,52]]},
  doc:{img:"docs",w:401,h:789,spots:[["pick-cancel","Files: Close",288,8,48,44],["pick-next","Files: Pick a file",0,112,401,600]]},
  docsel:{img:"docsel",w:402,h:784,spots:[["pick-back","Document: Close",350,0,52,44],["pick-back","Document: Cancel",10,694,186,46],["pick-add","Document: Attach",206,694,186,46]]},
  edit:{img:"edit",w:402,h:546,spots:[["view-close","Canvas: Close",0,40,56,52],["view-close","Canvas: Save",280,40,122,52]]},
  view:{img:"docview",w:402,h:803,spots:[["view-close","Document viewer: Close",350,16,52,44]]}
};
/* names: not shown in the field (Hannes 24.11: too small to read); used as the accessibility label */
const ATT_NAME={doc:"Rationale Zahlen.pdf",image:"Photo",drawing:"Canvas",loading:"Uploading"};
function sysSheet(kind,el){ const d=SYS[kind]; if(!d) return ""; const L=d.left||0, wPct=d.w/402*100;
  const spots=d.spots.map(([id,label,x,y,w,h],i)=>`<button class="sys-spot" ${el(id,label)} data-spot="${i}" aria-label="${esc(label)}" style="left:${x/d.w*100}%;top:${y/d.h*100}%;width:${w/d.w*100}%;height:${h/d.h*100}%"></button>`).join("");
  return `<div class="up-scrim" data-dim="sys" style="background:rgba(0,0,0,.25)"></div><div class="sys-sheet" style="left:${L/402*100}%;width:${wPct}%;bottom:${d.bottom||0}px;aspect-ratio:${d.w}/${d.h};${d.radius?`border-radius:${d.radius}px;`:""}"><img src="assets/${d.img}.png" alt="" draggable="false">${spots}</div>`; }
/* attachment menu opens to the right of the + button, vertically centred on it; shifted up/down only as far as needed to stay on screen */
function markShortMsgs(){ document.querySelectorAll("#pwrap .m-s>div:first-child").forEach(d=>{ const lh=parseFloat(getComputedStyle(d).lineHeight)||22.4; const short=d.getBoundingClientRect().height/(ui.scale||1)<=lh*1.4; d.parentElement.classList.toggle("short",short); const wl=d.parentElement.querySelector(".wl"); if(wl){ d.style.width=short?"fit-content":""; wl.style.width=short?(d.getBoundingClientRect().width/(ui.scale||1))+"px":""; } }); }
function placeUpMenu(){ const W=document.getElementById("pwrap"); if(!W) return; const um=W.querySelector(".up-menu"), pl=W.querySelector(".c-plus"), ph=W.querySelector(".phone"); if(!um||!pl||!ph) return;
  const s=ui.scale||1, P=ph.getBoundingClientRect(), B=pl.getBoundingClientRect(); const h=um.offsetHeight, phH=P.height/s;
  let top=(B.top+B.height/2-P.top)/s-h/2; top=Math.max(8,Math.min(top,phH-h-8));
  um.style.bottom="auto"; um.style.top=Math.round(top)+"px"; um.style.left=Math.round((B.right-P.left)/s+8)+"px"; um.style.maxWidth=`calc(100% - ${((B.right-P.left)/s+8+12)}px)`; }
function renderStage(){
  const W=document.getElementById("pwrap"); const st=curState(); if(!st){ W.innerHTML=""; return; }
  W.innerHTML=`<svg class="lines" id="lines"></svg>${phoneHTML(st,ui.live,true)}`;
  /* attachment menu sits 8px above the composer, wherever the composer is (fake keyboard in the frame, real keyboard on the phone) */
  placeUpMenu(); markShortMsgs();
  growInput(); fit(); placeBadges(); renderMinimap(); setTimeout(()=>{ try{ placeAgtDots(); updTpBadges(); }catch(e){} },30);
  const ch=$("#pwrap .p-chat"), ph=$("#pwrap .phone");
  if(ch){ ch.scrollTop=ch.scrollHeight;
    /* topover: chat text sits under the top bar, either scrolled or clipped at the top (bottom-aligned chat) */
    const over=()=>{ const f=ch.firstElementChild; return ch.scrollTop>0||(!!f&&f.getBoundingClientRect().top<ch.getBoundingClientRect().top-1); };
    const updOver=()=>ph.classList.toggle("topover",over());
    /* R4: scrolling up hides top bar (and the field when empty/unfocused); scrolling down brings them back right away, not only at the bottom */
    /* R4 = BR-7144 R5, ported 1:1 from BR-7144 wireChat (Hannes 24.11): same thresholds, same lock, toggles classes only (no layout reads while scrolling) */
    let lastTop=ch.scrollTop, hid=false, lockUntil=0;
    const typing=()=>!!$("#pwrap .cmp.focused:not(.resting), #pwrap .cmp.focused-inline")||ui.live.menu||ui.live.picker;
    const setHid=h=>{ if(h===hid) return; hid=h; lockUntil=performance.now()+350;
      const cm=$("#pwrap .cmp"); if(hid&&cm) ph.style.setProperty("--cmpc",(cm.offsetHeight+parseFloat(getComputedStyle(cm).marginTop||0))+"px");
      ph.classList.toggle("headhidden",hid); ph.classList.toggle("cmphidden",hid&&!typing()); };
    ch.addEventListener("scroll",()=>{ updOver(); const now=ch.scrollTop, d=now-lastTop; if(Math.abs(d)<4&&now>0) return; lastTop=now; if(performance.now()<lockUntil) return;
      const atBottom=now>=ch.scrollHeight-ch.clientHeight-12; if(atBottom||d>0) setHid(false); else if(d<0) setHid(true); },{passive:true});
    ch.addEventListener("wheel",e=>{ if(hid&&e.deltaY>0) setHid(false); },{passive:true});
    updOver(); requestAnimationFrame(updOver); setTimeout(updOver,300); }
}
function growInput(){
  const t=$("#pwrap textarea"); if(!t) return;
  const ul=t.closest(".cmp.inline")&&t.parentElement.querySelector(".uline i"); if(ul){ ul.style.width=Math.min(Math.ceil(textW(t.value))+4,inlineFieldW()+8)+"px"; ul.style.display=t.value?"":"none"; }
  if(t.closest(".cmp.focused-inline")) return;
  if(t.closest(".cmp.fs")){ t.style.height=""; t.style.overflowY="auto"; const fc=t.closest(".cmp.fs"), fo=t.scrollHeight>t.clientHeight+2; fc.classList.toggle("over",fo); const fb=fc.querySelector(".bar");
    if(fb&&fo){ const sc=ui.scale||1, vis=t.clientHeight/t.scrollHeight, hh=Math.max(16,t.clientHeight*vis); fb.style.top=((t.getBoundingClientRect().top-fc.getBoundingClientRect().top)/sc)+"px"; fb.style.height=hh+"px"; const pb=()=>{ fb.style.transform=`translateY(${(t.scrollTop/(t.scrollHeight-t.clientHeight||1))*(t.clientHeight-hh)}px)`; }; pb(); t.onscroll=pb; } return; }
  const LH=22.4,PAD=17.6,MAX=7;                    // R1: 7 lines, then scroll
  /* decide "over" with the expand icon's space already reserved; otherwise adding the icon re-wraps the text and it flickers at the 7-line threshold */
  const cmp=$("#pwrap .cmp");
  /* turns on when the text (full width) passes 7 lines; once on, it stays on until the text (with the icon's room) fits 7 lines again, so it can't flicker */
  /* attachments + text scroll together in the regular field (Hannes 24.11): the field keeps its size (attachment row + 7 lines),
     but once it scrolls, the attachments scroll away with the text so the text gets their room */
  const body=t.closest(".c-body"), att=body&&body.querySelector(".c-att");
  cmp?.classList.toggle("attscroll",!!att);
  if(att){ t.style.overflowY="hidden"; t.style.height="auto"; const cs=getComputedStyle(t); const lines=(t.scrollHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom))/LH; const over=lines>MAX+0.5;
    t.style.height=t.scrollHeight+"px"; const cap=att.offsetHeight+LH*MAX+PAD+8; body.style.maxHeight=cap+"px"; const scr=body.scrollHeight>cap+1;
    cmp.classList.toggle("over",over); cmp.classList.toggle("scr",scr);
    const atEnd=document.activeElement!==t||t.selectionEnd>=t.value.length; if(scr&&atEnd) body.scrollTop=body.scrollHeight;
    const bar=cmp.querySelector(".bar"); if(bar&&scr){ const sc=ui.scale||1, OFF=46, vis=body.clientHeight/body.scrollHeight, hh=Math.max(16,(body.clientHeight-OFF)*vis); bar.style.top=((body.getBoundingClientRect().top-cmp.getBoundingClientRect().top)/sc+OFF)+"px"; bar.style.height=hh+"px"; const posBar=()=>{ bar.style.transform=`translateY(${(body.scrollTop/(body.scrollHeight-body.clientHeight||1))*(body.clientHeight-OFF-hh)}px)`; }; posBar(); body.onscroll=posBar; }
    /* iOS Safari doesn't hand a drag on the (focused) text area on to the scroll area around it: scroll it by hand */
    if(!body._tw){ body._tw=1; let y0=null,s0=0; body.addEventListener("touchstart",e=>{ if(!body.closest(".attscroll.scr")||e.target.tagName!=="TEXTAREA"){ y0=null; return; } y0=e.touches[0].clientY; s0=body.scrollTop; },{passive:true});
      body.addEventListener("touchmove",e=>{ if(y0==null) return; const dy=e.touches[0].clientY-y0; if(Math.abs(dy)<3) return; body.scrollTop=s0-dy; e.preventDefault(); },{passive:false});
      body.addEventListener("touchend",()=>{ y0=null; },{passive:true}); }
    return; }
  if(body){ body.style.maxHeight=""; body.onscroll=null; } cmp?.classList.remove("scr");
  t.style.height="auto"; const cs=getComputedStyle(t); const lines=(t.scrollHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom))/LH; const over=lines>MAX+0.5;
  const h=Math.min(t.scrollHeight,LH*MAX+PAD); t.style.height=h+"px"; t.style.overflowY=over?"auto":"hidden";
  cmp?.classList.toggle("over",over); if(over&&document.activeElement!==t) t.scrollTop=t.scrollHeight;
  const bar=$("#pwrap .cmp .bar"); if(bar&&over){ const vis=t.clientHeight/t.scrollHeight, h=Math.max(16,t.clientHeight*vis); bar.style.height=h+"px"; /* track = the text area itself (not the composer), so position maps to the text */ const sc=ui.scale||1; const OFF=46; /* track starts below the expand icon */ const hh=Math.max(16,(t.clientHeight-OFF)*vis); bar.style.top=((t.getBoundingClientRect().top-t.closest(".cmp").getBoundingClientRect().top)/sc+OFF)+"px"; bar.style.height=hh+"px"; const posBar=()=>{ bar.style.transform=`translateY(${(t.scrollTop/(t.scrollHeight-t.clientHeight||1))*(t.clientHeight-OFF-hh)}px)`; }; posBar(); t.onscroll=posBar; }
}
function fit(){
  const st=document.getElementById("stage"), w=document.getElementById("pwrap");
  const nat=document.body.classList.contains("proto")&&innerWidth<=600; document.body.classList.toggle("native",nat); document.body.classList.toggle("ctx-dark",isDarkCtx(ui.context));
  if(nat){ requestAnimationFrame(placeUpMenu); const vv=window.visualViewport; document.documentElement.style.setProperty("--vvh",(vv?vv.height:innerHeight)+"px"); document.documentElement.style.setProperty("--vvtop",(vv?vv.offsetTop:0)+"px"); w.style.transform="none"; ui.scale=1; return; }
  const pv=document.body.classList.contains("proto"), small=pv&&innerWidth<=600;
  const sc=small? Math.min(st.clientWidth/402, st.clientHeight/874) : pv? Math.min((st.clientHeight-40)/894,(st.clientWidth-40)/422,1.4) : Math.max(.3,Math.min((st.clientHeight-48)/874,(st.clientWidth-48)/402,1.2));
  w.style.transform=`translate(-50%,-50%) scale(${sc})`; ui.scale=sc;
}
window.addEventListener("resize",()=>{ fit(); placeAiCtl(); });
if(window.visualViewport){ const vvFit=()=>{ if(document.body.classList.contains("native")) fit(); }; visualViewport.addEventListener("resize",vvFit); visualViewport.addEventListener("scroll",vvFit); }
/* after the keyboard closes iOS can leave the page scrolled: reset it */
document.addEventListener("focusout",()=>{ if(!document.body.classList.contains("native")) return; setTimeout(()=>{ window.scrollTo(0,0); fit(); },120); });

/* numbered badges outside the phone, with leader lines */
function placeBadges(){
  const W=document.getElementById("pwrap"), ph=$(".phone",W); if(!ph) return;
  W.querySelectorAll(".badge").forEach(b=>b.remove());
  const svg=document.getElementById("lines"); svg.innerHTML="";
  const pr=ph.getBoundingClientRect(), sc=ui.scale, PW=402, PH=874;
  const els=[...ph.querySelectorAll("[data-el]")].filter(e=>e.offsetParent!==null);
  const refs=allRefs();
  const used={left:[],right:[],top:[],bottom:[]};
  els.forEach((e,i)=>{
    const n=elNum(e.dataset.el), r=e.getBoundingClientRect();
    const cx=(r.left+r.width/2-pr.left)/sc, cy=(r.top+r.height/2-pr.top)/sc;
    let side = cy<110?"top":cy>PH-90?"bottom":cx>PW/2?"right":"left";
    let bx,by;
    if(side==="left"){ bx=-44; by=cy; } else if(side==="right"){ bx=PW+44; by=cy; } else if(side==="top"){ bx=cx; by=-44; } else { bx=cx; by=PH+44; }
    // nudge to avoid overlapping badges on the same side
    const axis=(side==="left"||side==="right")?"y":"x";
    let pos=axis==="y"?by:bx; while(used[side].some(u=>Math.abs(u-pos)<36)) pos+=36; used[side].push(pos);
    if(axis==="y") by=pos; else bx=pos;
    const b=document.createElement("button");
    b.className="badge"+(refs.has(n)?" cov":"");
    b.textContent=n; b.style.left=bx+"px"; b.style.top=by+"px";
    b.dataset.el=e.dataset.el; b.dataset.label=e.dataset.label; b.setAttribute("aria-label",`#${n} ${e.dataset.label}`);
    W.appendChild(b);
    const L=document.createElementNS("http://www.w3.org/2000/svg","line");
    L.setAttribute("x1",bx+80); L.setAttribute("y1",by+80); L.setAttribute("x2",cx+80); L.setAttribute("y2",cy+80);
    svg.appendChild(L);
  });
  ui.elCount=els.length;
}
function refreshCoverage(){
  const refs=allRefs();
  document.querySelectorAll("#pwrap .badge").forEach(b=>b.classList.toggle("cov",refs.has(+b.textContent)));
  document.querySelectorAll(".sec-cov[data-state]").forEach(c=>{ const f=find(c.dataset.state); if(f){ const v=covOf(f.s); c.textContent=v.n?`${v.c}/${v.n}`:""; } });
  renderLeft();
}
const tip=document.getElementById("tip");
const stageEl=document.getElementById("stage");
stageEl.addEventListener("mouseover",e=>{
  const b=e.target.closest(".badge");
  document.getElementById("pwrap").classList.toggle("hide-b",!!e.target.closest(".phone"));
  if(b){ const st=curState(); const link=st.links?.[b.dataset.el]; const tgt=link&&find(link);
    tip.textContent=`#${b.textContent} ${b.dataset.label}${tgt?` → ${tgt.s.name}`:" · click to create its screen"}`;
    const r=b.getBoundingClientRect(), sr=stageEl.getBoundingClientRect(); tip.style.left=(r.right-sr.left+6)+"px"; tip.style.top=(r.top-sr.top+4)+"px"; tip.style.display="block"; }
  else tip.style.display="none";
});
stageEl.addEventListener("mouseleave",()=>{ document.getElementById("pwrap").classList.remove("hide-b"); tip.style.display="none"; });

/* clicks: badge = jump to / create the element's screen · element = navigate like the app */
const REPLIES=["Nice. Now try a line with a negative slope: what changes?","Good thinking. What happens to the line if b gets bigger?","Exactly. Can you draw it and send me a photo?"];
/* tapping + (or removing an attachment) must not take focus from the text field, so the keyboard stays open */
function inCmp(e){ const c=$("#pwrap .cmp"), p=e.changedTouches?e.changedTouches[0]:(ui.lastTap||e); if(!c||!p) return false; const r=c.getBoundingClientRect(); return p.clientY>=r.top-8&&p.clientY<=r.bottom+8; }
document.getElementById("pwrap").addEventListener("touchend",e=>{ const ta=$("#pwrap textarea"); if(document.activeElement!==ta) return;
  const b=e.target.closest('[data-el="plus"],[data-el="expand"],[data-rm]'); if(b){ e.preventDefault(); b.click(); return; }
  if(e.target.dataset.dim&&inCmp(e)){ e.preventDefault(); const t=e.changedTouches[0]; ui.lastTap={clientX:t.clientX,clientY:t.clientY}; e.target.click(); ui.lastTap=null; } },{passive:false});
document.getElementById("pwrap").addEventListener("mousedown",e=>{ if(document.activeElement!==$("#pwrap textarea")) return; if(e.target.closest('[data-el="plus"],[data-el="expand"],[data-rm]')||(e.target.dataset.dim&&inCmp(e))) e.preventDefault(); });
document.getElementById("pwrap").addEventListener("click",e=>{
  const b=e.target.closest(".badge");
  if(b){ badgeClick(b.dataset.el,b.dataset.label); return; }
  const M=ensureModel(); const ta=$("#pwrap textarea"); if(ta) M.text=ta.value;
  if(e.target.dataset.dim){ if(M.picker){ const back=M.pickKind==="edit"||M.pickKind==="view"; M.picker=false; M.menu=!back; if(back) M.focused=true; rerenderKeepCaret(back); }
    else { const keep=inCmp(e)&&!!M.focused; M.menu=false; if(!keep){ M.focused=false; ta&&ta.blur(); } rerenderKeepCaret(keep); } syncSel(); return; }
  const op=e.target.closest("[data-open]");
  if(op){ const t=M.atts[+op.dataset.open]; if(t==="loading"||t.endsWith("~")) return; M.viewKbd=!!M.focused; ta&&ta.blur(); M.picker=true; M.pickKind=t==="doc"?"view":"edit"; rerenderKeepCaret(); syncSel(); return; }
  const rmb=e.target.closest("[data-rm]");
  if(rmb){ M.atts.splice(+rmb.dataset.rm,1); rerenderKeepCaret(!!M.focused); syncSel(); return; }
  const t=e.target.closest("[data-el]");
  if(!t){ if(e.target.closest(".p-chat")&&M.focused&&!M.menu&&!M.picker){ M.focused=false; rerenderKeepCaret(); syncSel(); } return; }
  if(t.tagName==="TEXTAREA") return;
  const id=t.dataset.el, st=curState(), link=st.links?.[id];
  if(link&&find(link)&&!/^(plus|send|opt-|pick-|att-rm-)/.test(id)){ go(link); return; }
  if(id==="plus"){ M.menu=true; M.menuKbd=!!M.focused; rerenderKeepCaret(M.menuKbd); syncSel(); return; }
  if(id==="expand"){ M.fs=!M.fs; M.focused=true; M.menu=false; rerenderKeepCaret(true); if(!M.fs){ const n=$("#pwrap textarea"); if(n) n.scrollTop=n.scrollHeight; } syncSel(); return; }
  else if(id.startsWith("opt-")){ ta&&ta.blur(); M.menu=false; M.picker=true; M.pickKind={"opt-gallery":"gallery","opt-camera":"camera","opt-doc":"doc","opt-draw":"draw"}[id]; M.pickType={"opt-gallery":"image","opt-camera":"image","opt-doc":"doc","opt-draw":"drawing"}[id]; }
  else if(id==="pick-cancel"){ M.picker=false; M.menu=true; M.focused=!!M.menuKbd; rerenderKeepCaret(M.focused); syncSel(); return; }
  else if(id==="pick-next"){ M.pickKind="docsel"; }
  else if(id==="pick-back"){ M.pickKind="doc"; }
  else if(id==="view-close"){ M.picker=false; M.focused=!!M.viewKbd; rerenderKeepCaret(M.focused); syncSel(); return; }
  else if(id==="pick-add"){ M.picker=false; const up=(M.pickType||"image")+"~"; M.atts.push(up); setTimeout(()=>{ const k=M.atts.indexOf(up); if(k<0) return; M.atts[k]=attBase(up); rerenderKeepCaret(); syncSel(); },1800); M.focused=!!M.menuKbd; rerenderKeepCaret(M.focused); syncSel(); return; }
  else if(id==="send"){ if(M.waiting) return; const txt=M.text.trim(); if(!txt&&!M.atts.some(t=>t!=="loading"&&!t.endsWith("~"))) return;
    /* Learning Diary: chat history out of scope (Hannes 24.11) -> sending only resets the field, the empty state stays */
    if((ui.context||"")==="diary"){ M.text=""; M.atts=[]; M.focused=false; M.fs=false; M.stacked=false; M.thread=[]; saveThread(); try{document.activeElement&&document.activeElement.blur();}catch(e){} rerenderKeepCaret(); syncSel(); return; }
    M.thread.push({who:"s",text:txt,atts:M.atts.map(attBase)}); M.text=""; M.atts=[]; M.focused=false; M.fs=false; M.stacked=false; M.waiting=true; saveThread();
    rerenderKeepCaret(); syncSel(); setTimeout(()=>{ M.waiting=false; M.thread.push({who:"t",text:REPLIES[(M.thread.length/2|0)%REPLIES.length]}); saveThread(); renderStage(); syncSel(); },1400); return; }
  else if(id==="newchat"){ M.thread=[]; M.text=""; M.atts=[]; M.focused=false; saveThread(); }
  else return;
  rerenderKeepCaret(); syncSel();
});
function badgeClick(id,label){
  const m=curMode(), st=curState(); st.links=st.links||{};
  const link=st.links[id];
  if(link&&find(link)){ go(link); return; }
  const kind=DEFAULT_TARGET[id]; const existing=kind&&flat().find(x=>x.s.kind===kind);
  if(existing){ st.links[id]=existing.s.id; save(); go(existing.s.id); return; }
  const ns={id:uid("s-"),name:`After: ${label}`,kind:"custom",doc:"",links:{}};
  m.states.splice(m.states.indexOf(st)+1,0,ns); st.links[id]=ns.id; save(); go(ns.id);
  setTimeout(()=>{ const i=document.querySelector(`.sec-name[data-state="${ns.id}"]`); i?.focus(); i?.select(); },60);
}
document.getElementById("pwrap").addEventListener("focusin",e=>{
  if(e.target.tagName!=="TEXTAREA"||ui.refocusing) return; const M=ensureModel(); if(M.focused&&!M.menu) return;
  M.focused=true; M.menu=false; M.text=e.target.value; renderStage(); const t=$("#pwrap textarea"); t.focus(); t.setSelectionRange(t.value.length,t.value.length); syncSel();
});
document.getElementById("pwrap").addEventListener("input",e=>{
  if(e.target.tagName!=="TEXTAREA") return; const M=ensureModel();
  const before=M.text.trim().length>0, wasInline=isInline(M); M.text=e.target.value; M.focused=true; updStacked(M);
  if(before!==(M.text.trim().length>0)||wasInline!==isInline(M)){ const pos=e.target.selectionStart; renderStage(); const t=$("#pwrap textarea"); t.focus(); t.setSelectionRange(pos,pos); }
  else growInput();
  const k=ui.sel.state; syncSel(); if(ui.sel.state!==k){ /* keep caret after state switch */ const t=$("#pwrap textarea"); if(t&&document.activeElement!==t){ t.focus(); t.setSelectionRange(t.value.length,t.value.length); } }
});
function go(stateId){ const x=find(stateId); if(!x) return; const keep=ui.live&&ui.live.thread; ui.sel={kind:"state",mode:x.m.id,state:x.s.id}; ui.live=seed(x.s.kind); if(keep) ui.live.thread=keep; render(); scrollToSel(); }
function goKind(kind){ const x=flat().find(y=>y.s.kind===kind); if(x) go(x.s.id); }

/* ================= stable element numbers (same number on every screen) ================= */
const EL_ORDER=["menu","close","newchat","speaker","speaker2","field","plus","mic","send","att-rm-0","att-rm-1","att-rm-2","att-rm-3","opt-gallery","opt-camera","opt-doc","opt-draw","pick-cancel","pick-add","pick-next","pick-back","view-close","expand","tab-map","tab-chat","tab-stats"];
