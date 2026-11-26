/* BR-7144 · Chat History Redesign: ticket pack for the feature workbench shell (see PACK-API.md).
   A component ticket: the stage is one long AI Tutor chat that holds every new component once.
   Each spec section (mode/state) has an anchor in that chat; showing a state scrolls the chat to it and highlights it.
   Nothing here needs the shell to change. (The Chat / Components toggle was removed on 23.11: scrolling the spec shows every component.) */
const PACK={
  id:"BR-7144", title:"Chat History Redesign",
  links:[ /* link hub (Implementation), from pack.json → links */
    {label:"Design", name:"Figma · BR-7144", url:"https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12117-80"},
    {label:"Copies", name:"none yet", url:""},
    {label:"Feature Workbench", name:"Feature Workbench", url:"https://claude.ai/artifact/Skf8xkECCMzwRcfMyD28Bm"},
    {label:"Animation Workbench", name:"none yet", url:""},
    {label:"Prototype", name:"Phone prototype", url:"https://hennes95.github.io/brian-prototypes/br-7144/flow/"},
    {label:"Handoff", name:"added at handover", url:""}],
  protoUrl:"https://hennes95.github.io/brian-prototypes/br-7144/flow/",
  dbDoc:"workbench/br-7144", lsKey:"wb-br7144",
  ui:{sel:{kind:"state",mode:"layout",state:"layout-msgs"},variant:"v1",context:"tutor"},
  protoStartKind:"layout"
};

/* ================= spec ================= */
const FIG = id => "https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=" + id;
const SRC = 'data-src="ticket · 19.11"';
const imp = h => `<div class="imp" ${SRC}>${h}</div>`;
const ai = t => `<span class="ai">${t}</span>`;
/* Spec defaults (used while the artifact database is empty). Ticket text = imported blocks (div.imp), Claude's own additions = span.ai. From the Notion ticket of 19.11.26. */
const DEFAULT = {
 v: 2,
 docs: {
  brief: `<h2>Problem</h2>`+imp(`<ul><li>Chat is one of our most important experiences at Brian, yet compared with Claude or ChatGPT it leaves much to be desired</li><li>1st ticket for this initiative</li><li>Our chat on the student side has a poor use of space</li><li>The avatars of AI and student on the left reduce horizontal space, which is already limited on the phone</li></ul>`)
   +`<h2>Goal</h2>`+imp(`<ul><li>Update Brian with a contemporary chat layout that follows industry best practice and improves UX<ul><li>1. Make the chat layout more space-efficient and easier to read</li><li>2. Improve visibility of content in the chat</li><li>3. Add a design for bigger screens (tablet/desktop) to use the space better</li><li>4. Harmonize &amp; update all icons</li></ul></li></ul>`)
   +`<h2>Out of scope</h2>`+imp(`<ul><li>Teacher chat redesign &amp; AI teaching assistant UI (this ticket is student-side only)</li><li>Improve citations and quotes<ul><li>Open split screen / window in window</li><li>Discern online from material source</li><li>Make it more recognizable</li><li>Potentially pictures instead of citations</li></ul></li><li>Improve analysis/review at the end of AI Dialogs (add animation)</li><li>Refine Brian Student UI (align on a direction with Ralph)</li><li>Scrolling back (top bar and input field fold away) → <a href="https://app.notion.com/p/407fca9f403c8035be80e140aeb3aaa7" target="_blank">BR-7147</a> (R4)</li></ul>`)
   +`<h2>Related tickets</h2><h3>Initiative</h3><ul><li><a href="https://app.notion.com/p/3fdfca9f403c8027ad2ec54768ad785b" target="_blank">BR-6975 FE: Improve the Chat</a> (parent)<ul><li>Batch 1<ul><li>BR-7144 Chat History Redesign (this ticket)</li><li><a href="https://app.notion.com/p/407fca9f403c8035be80e140aeb3aaa7" target="_blank">BR-7147 Redesign Input Field</a></li><li><a href="https://app.notion.com/p/407fca9f403c80f6a71ac61ca32b9280" target="_blank">BR-7148 Add tool calls to loading state</a> · done</li></ul></li><li>Batch 2 (no tickets yet)<ul><li>Thread management</li><li>STT</li><li>S2S in the AI Tutor</li><li>Add dialog UI</li><li>Image support in chat</li></ul></li></ul></li></ul>`,
  rules: "",
  edges: imp(`<ul><li>Error states for messages and assets: reuse the current logic, no new design</li></ul>`),
  data: imp(`<ul><li>Re-render all chat histories with the new UI once this goes live (no new asset types or rules, so nothing more to specify)</li></ul>`), side:"",
  "tp:tutor": `<ul><li>${ai("Light chat with tab bar; date badges shown (prototype default)")}</li></ul>`,
  "tp:dialog": `<ul><li>${ai("Dark chat, opens full screen with ✕, no tab bar; no date badges (badges only in Chatbot and AI Tutor)")}</li></ul>`,
  "tp:chatbot": `<ul><li>Dark, like the AI Dialog<ul><li>Date badges are shown (badges only in Chatbot and AI Tutor)</li></ul></li></ul>`,
  "tp:diary": imp(`<ul><li>How should we handle the Learning Diary chat?<ul><li>Hannes: package it into a separate ticket (chat between humans, here we look at AI chat UX), or use this layout and add a profile icon on top of the teacher messages</li></ul></li></ul>`),
  ds: `<ul><li>${ai(`Chat_TutorMessage · new · light / AI Dialog, icon row (<a href="${FIG("12491-97445")}" target="_blank">Figma</a>)`)}</li><li>${ai(`Chat_StudentMessage · new · asset slot on top, workbook line (<a href="${FIG("12495-97701")}" target="_blank">Figma</a>)`)}</li><li>${ai(`Image, Drawing, Document · new · sent + loading, light + AI Dialog (<a href="${FIG("12495-98454")}" target="_blank">Figma</a>)`)}</li><li>${ai(`Multiple attachments · new · 2, more, more than 4 (<a href="${FIG("12394-112386")}" target="_blank">Figma</a>)`)}</li><li>${ai(`Citation · new · direct / indirect, 1 or 2 (<a href="${FIG("12487-126")}" target="_blank">Figma</a>)`)}</li><li>${ai(`Navigation Top · changed · shorter, Nucleo icons (<a href="${FIG("12532-146458")}" target="_blank">Figma</a>)`)}</li><li>${ai(`Text styles body-md · changed (<a href="${FIG("12770-69595")}" target="_blank">Figma</a>)`)}</li></ul>`,
  questions: imp(`<ul><li>How should we handle the Learning Diary chat? (see touchpoint Learning Diary)</li><li>How should we handle errors: reuse the current state?<ul><li>Hannes: reuse the current state</li></ul></li></ul>`)

 },
 modes: [
  {id:"layout",name:"Message layout",status:"open",figma:FIG("12126-163424"),states:[
   {id:"layout-msgs",name:"Tutor & student messages",kind:"layout",links:{},doc:
    imp(`<ul><li>Remove the user avatar</li><li>Remove the Brian avatar, except while Brian is generating an answer (loading state)</li><li>Remove all timestamps (date badges: see Date badges)</li><li>AI and student are now separated by<ul><li>Right indentation of student messages</li><li>Student messages finishing with a line (like the line in a workbook where students put their answers)</li></ul></li><li>Replace all icons in the chat history and top bar with their Nucleo versions</li></ul>`)+imp(`<ul><li>Mobile: AI message spans the full width, student message is indented on the left (sits on the right)</li></ul>`)
    +`<ul><li>${ai("Icon row under AI messages: only read aloud for now (Figma note)")}</li></ul>`}]},
  {id:"dates",name:"Date badges",status:"open",figma:FIG("12126-163571"),states:[
   {id:"dates-multi",name:"Conversation over several days",kind:"dates",links:{},doc:
    imp(`<ul><li>Show the badge only in Chatbot and AI Tutor</li><li>Only show it when a conversation spans more than 1 day<ul><li>Only the date; reuse the logic from the Learning Diary</li><li>No badge at the start of the conversation</li></ul></li><li>Not shown for the current day if the user hasn't sent a message yet</li></ul>`)}]},
  {id:"assets",name:"Student attachments",status:"open",figma:FIG("12495-98454"),states:[
   {id:"as-image",name:"Image",kind:"asset-image",links:{},doc:
    imp(`<ul><li>Chat assets now contain previews for documents, images and drawings</li><li>Each chat asset has<ul><li>Loading state</li><li>Sent state</li><li>Design for phone, tablet and desktop</li><li>Design for the white and dark chat UI (AI Dialog &amp; Chatbot/Tutor)</li></ul></li></ul>`)
    +`<ul><li>${ai("Attachments sit on top of the student's text, in the same message; text is optional (Figma note)")}</li></ul>`},
   {id:"as-drawing",name:"Canvas",kind:"asset-drawing",links:{},doc:""},
   {id:"as-doc",name:"Document",kind:"asset-doc",links:{},doc:""},
   {id:"as-multi",name:"Several files",kind:"asset-multi",links:{},doc:""},
   {id:"as-loading",name:"Loading",kind:"asset-loading",links:{},doc:""}]},
  {id:"cite",name:"AI Tutor citations",status:"open",figma:FIG("12487-126"),states:[
   {id:"cite-direct",name:"Direct citation",kind:"cite-direct",links:{},doc:
    imp(`<ul><li>Material citation &amp; source<ul><li>Direct citation</li><li>Indirect citation</li></ul></li><li>A web source looks just like the material citation</li></ul>`)},
   {id:"cite-indirect",name:"Indirect citation",kind:"cite-indirect",links:{},doc:""}]},
  {id:"loading",name:"Brian is answering",status:"open",figma:FIG("12532-149445"),states:[
   {id:"loading-brian",name:"Generating an answer",kind:"loading",links:{},doc:
    imp(`<ul><li>The Brian avatar only shows while Brian is generating an answer (loading state)</li></ul>`)}]},
  {id:"bp",name:"Tablet & desktop",status:"open",figma:FIG("12133-165865"),states:[
   {id:"bp-tablet",name:"Tablet",kind:"tablet",links:{},doc:
    imp(`<ul><li>Specific designs and behaviors per form factor for regular messages and all attachments (details in Figma)</li><li>Indentations double compared to mobile</li><li>Width of the chat history is limited to about 14 words (about 840px in Figma)</li><li>AI message is indented on the right</li><li>Asset sizes are the same as on mobile; only text runs the full width</li></ul>`)},
   {id:"bp-desktop",name:"Desktop",kind:"desktop",links:{},doc:
    imp(`<ul><li>Same as tablet (indentation, max width of the chat history, centered)</li></ul>`)}]},
  {id:"icons",name:"Top bar & icons",status:"open",figma:FIG("12532-146458"),states:[
   {id:"icons-top",name:"Top bar",kind:"topbar",links:{},doc:
    imp(`<ul><li>Replace all icons in the chat history and top bar with their Nucleo versions</li></ul>`)
    +`<ul><li>${ai("Top bar gets shorter; title and icons follow the design system (Figma COMPONENT UPDATE)")}</li></ul>`}]}
 ]
};
const VARIANTS=[{id:"v1",name:"Design V1",figma:FIG("12117-83")},{id:"v2-nocap",name:"No attachment subtitles"}];  /* exploration (Hannes 26.11): how much do the name/info lines under attachments add? */
const CONTEXTS=[
 {id:"tutor",name:"AI Tutor",ctx:"tutor",figma:FIG("12126-163424")},
 {id:"dialog",name:"AI Dialog",ctx:"dialog",figma:FIG("12495-101166")},
 {id:"chatbot",name:"Chatbot",ctx:"chatbot"},
 {id:"diary",name:"Learning Diary",ctx:null,note:"Open question"}];
const isDarkCtx=c=>c==="dialog"||c==="chatbot";   /* Chatbot is dark like the AI Dialog, but keeps date badges (Hannes 23.11) */

/* ================= icons (Figma exports / Nucleo, copied from the BR-7147 pack) ================= */
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
 fImage:`<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M17.59 11.17a3.6 3.6 0 0 0-5.19 0l-8.13 8.15c.49.61 1.23 1 2.07 1h11.33c1.48 0 2.67-1.19 2.67-2.66v-3.75z"/><circle cx="8.33" cy="9.67" r="1.67"/><path d="M17.67 21.33H6.33a3.67 3.67 0 0 1-3.66-3.66V6.33a3.67 3.67 0 0 1 3.66-3.66h11.34a3.67 3.67 0 0 1 3.66 3.66v11.34a3.67 3.67 0 0 1-3.66 3.66zM6.33 4.67c-.92 0-1.66.74-1.66 1.66v11.34c0 .92.74 1.66 1.66 1.66h11.34c.92 0 1.66-.74 1.66-1.66V6.33c0-.92-.74-1.66-1.66-1.66z"/></svg>`,
 fCamera:`<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path fill-rule="evenodd" d="M8.5 4.5h7l1.5 2.2h2.6A2.4 2.4 0 0 1 22 9.1v8.5a2.4 2.4 0 0 1-2.4 2.4H4.4A2.4 2.4 0 0 1 2 17.6V9.1a2.4 2.4 0 0 1 2.4-2.4H7zM12 17a3.8 3.8 0 1 0 0-7.6 3.8 3.8 0 0 0 0 7.6z"/></svg>`,
 fDoc:`<svg width="24" height="24" viewBox="0 0 24 24" fill="#fff"><path d="M20.65 7.24l-5.21-5.21a2.33 2.33 0 0 0-1.65-.69H6.33a3.67 3.67 0 0 0-3.66 3.67V19a3.67 3.67 0 0 0 3.66 3.67h11.34A3.67 3.67 0 0 0 21.33 19V8.88c0-.62-.24-1.21-.68-1.65zM7.67 8h2.66a1 1 0 0 1 0 2H7.67a1 1 0 0 1 0-2zm8.66 10H7.67a1 1 0 0 1 0-2h8.66a1 1 0 0 1 0 2zm0-4H7.67a1 1 0 0 1 0-2h8.66a1 1 0 0 1 0 2zm2.91-5.33h-3.91c-.73 0-1.33-.6-1.33-1.34v-3.9z"/></svg>`,
 fDraw:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 19c3-5 5 1 8-3s4-1 7-3"/><path fill="#fff" d="M15.5 3.5l3 3-8 8H7.5v-3z"/></svg>`,
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
Object.assign(I,{help:nuc("Help",24),close:nuc("Close",24),back:nuc("ArrowLeft",24),bubble:nuc("ChatCircle",24),flip:nuc("Reload",28),caret:nuc("CaretRight",16)});

/* ================= content: one chat that holds every component ================= */
/* t: tutor message · s: student message · tag: date badge · brian: loading. g = spec kinds this item belongs to (anchor + highlight). */
const CHAT=[
 {t:"t",g:"layout",p:[`Welcome, Alex. Today's oral exercise is on linear functions. <b>Imagine a line that crosses the y-axis at 3 and goes up by 2 for every step to the right. How would you describe it?</b>`,`Take your time and use your own words. You don't need any formulas yet, just tell me what you see.`]},
 {t:"s",g:"asset-image layout",asset:{k:"image"},text:"I sketched the line on paper first. It starts at 3 and goes up by 2 with every step."},
 {t:"t",g:"cite-direct",p:[`Good sketch, Alex. You found the two key parts of a linear function. Let's check them against your workbook.`],cite:{type:"direct",intro:"On page 42 your workbook explains it like this:",q:[["»A linear function has the form y = mx + b. The number m is the slope and b is the y-intercept.«","Workbook Maths 8, p. 42"]]},after:[`Can you write the line as an equation of the form y = mx + b?`]},
 {t:"s",g:"asset-drawing",asset:{k:"drawing"},text:"I drew it into a coordinate system. The line crosses the y-axis at 3."},
 {t:"t",p:[`Exactly. Now tell me: which number is your m, and which one is your b?`]},
 {t:"s",text:"m is 2 and b is 3, so the equation is y = 2x + 3."},
 {t:"t",g:"cite-direct",p:[`Correct. Your workbook also describes what happens to the line for different values of m.`],cite:{type:"direct",intro:"Two sections of your workbook are helpful here:",q:[["»If m is positive, the line goes up from left to right.«","Workbook Maths 8, p. 42"],["»If m is negative, the line goes down from left to right.«","Workbook Maths 8, p. 43"]],between:"and for the opposite case:"},after:[`Can you send me your worksheet on linear functions? Then we can check it together.`]},
 {t:"t",g:"interactive",p:[`Try it yourself: move the slider and watch what m does to the line.`],ia:"slope"},
 {t:"s",g:"asset-doc",asset:{k:"doc"},text:"Here is my worksheet. Can you check my last two equations?"},
 {t:"tag",g:"dates",text:"Today"},
 {t:"t",g:"cite-indirect",p:[`Thanks, Alex. Both equations are correct. In short, the slope tells you how steep the line is, and the y-intercept tells you where it starts.`],cite:{type:"indirect",t:["Your workbook says that the slope m is the change in y for every step to the right in x.","It also says that b is the point where the line meets the y-axis."],src:["Workbook Maths 8, p. 42","Workbook Maths 8, p. 43"]},after:[`Do you want to try another equation?`]},
 {t:"s",g:"asset-multi",asset:{k:"two"}},
 {t:"t",p:[`Nice, two files at once. Both look right to me.`]},
 {t:"s",g:"layout",text:"Can I also send you the four exercises from class?"},
 {t:"t",p:[`Of course, send them over.`]},
 {t:"s",g:"asset-multi",asset:{k:"more",n:4},text:"Here they are."},
 {t:"t",p:[`Thanks, I can see all four exercises.`]},
 {t:"s",g:"asset-multi",asset:{k:"more",n:6},text:"And the two from my homework."},
 {t:"t",p:[`Got all six. Exercise 3 needs another look.`]},
 {t:"s",g:"asset-loading",asset:{k:"image",loading:true},text:"One more photo of exercise 3."},
 {t:"brian",g:"loading"}
];
const CHAT_DIALOG_TITLE="Creating Linear Equations";
const REPLIES=["Good thinking. What happens to the line if b gets bigger?","Nice. Now try a line with a negative slope: what changes?","Exactly. Can you draw it and send me a photo?"];

/* ================= render helpers ================= */
let KIND="layout";      // the state being rendered: decides which elements carry data-el (badges) and which get highlighted
const el=(id,label,group)=>group&&!group.split(" ").includes(KIND)?"":`data-el="${id}" data-label="${esc(label)}"`;
const CAP={image:"line_sketch.jpg",drawing:"Canvas",doc:"Worksheet · 3 pages"};   /* "Drawing" is called "Canvas", no date (Hannes 23.11) */
const LOADCAP={image:"Image · loading…",drawing:"Canvas · loading…",doc:"Document · loading…"};
/* Document preview, rebuilt from the Figma component (Document, 12495:98485): page with the top-right corner cut off,
   a folded triangle in that corner, thin outline and a hard shadow on page and fold. The image is the component's own image fill. */
let docN=0;
function docSVG(loading){
  const id="dpc"+(++docN), page="M0 0H291.1L316.5 24.8L317.1 178.8H0Z";
  return `<svg class="docsvg" viewBox="0 0 321 183" preserveAspectRatio="none" ${loading?'aria-hidden="true"':'role="img" aria-label="Document"'}>
    <defs><clipPath id="${id}"><path d="${page}"/></clipPath></defs>
        <g clip-path="url(#${id})">${loading?`<rect width="321" height="183" fill="#fff"/>`:`<rect width="321" height="183" fill="#fff"/><image href="assets/document.png" width="317.1" height="178.8" preserveAspectRatio="xMidYMid slice"/><rect width="321" height="183" fill="#000" opacity=".03"/>`}</g>
    <path class="dln" d="${page}"/>
    <path class="dsh" d="M294 3.3V27.7H319.2Z"/>
    <path class="dfold" d="M291 .3V24.7H316.2Z"/>
  </svg>`;
}
/* Loading = ink dots (variant B, Hannes 23.11): the surface inside the attachment's own boundary fills with dots;
   frame, line and shadow stay as in the sent state (the document keeps its outline and fold).
   loading===true → B∞, no progress known: density loops. loading=1…4 → B, density follows the upload, then the file snaps in. */
const ink=lv=>`<span class="ink ${typeof lv==="number"?"d"+lv:"inf"}" role="img" aria-label="Uploading"></span>`;
function thumb(k,loading,cls=""){
  const ld=loading!==false&&loading!=null;
  if(k==="image") return `<span class="th th-img ${cls} ${ld?"ld":""}"><span class="ph">${ld?ink(loading):`<img src="assets/photo.png" alt="Photo">`}</span></span>`;
  if(k==="drawing") return `<span class="th th-draw ${cls} ${ld?"ld":""}">${ld?ink(loading):`<img src="assets/drawing.png" alt="Canvas">`}</span>`;
  return `<span class="th th-doc ${cls} ${ld?"ld":""}">${docSVG(ld)}${ld?`<span class="dink">${ink(loading)}</span>`:""}</span>`;
}
function assetHTML(a,g){
  const id=a.loading?"att-loading":a.k==="two"||a.k==="more"?"att-multi":"att-"+a.k;
  const label=a.loading?"Attachment, loading":{image:"Image attachment",drawing:"Canvas attachment",doc:"Document attachment",two:"Two attachments",more:"Several attachments"}[a.k];
  const at=el(id,label,g);
  if(a.k==="two") return `<div class="as as-two" ${at}><div class="col">${thumb("doc",a.loading)}<span class="cap">${a.loading?LOADCAP.doc:CAP.doc}</span></div><div class="col">${thumb("drawing",a.loading)}<span class="cap">${a.loading?LOADCAP.drawing:CAP.drawing}</span></div></div>`;
  if(a.k==="more"){ const n=a.n||4; return `<div class="as as-more" ${at}><div class="stack">${thumb("doc",a.loading,"st")}${thumb("drawing",a.loading,"st")}${thumb("doc",a.loading,"st")}${thumb("image",a.loading,"st last")}${n>4?`<span class="more-n">+${n-4}</span>`:""}</div><span class="cap">${n} attachments</span></div>`; }
  return `<div class="as as-${a.k}" ${at}>${thumb(a.k,a.loading)}<span class="cap">${a.loading?LOADCAP[a.k]:CAP[a.k]}</span></div>`;
}
function citeHTML(c,g){
  if(c.type==="direct"){
    const q=([t,s],i)=>`<div class="cq"><div class="qrow"><i></i><span>${esc(t)}</span></div><a class="src" ${i===0?el("cite-source","Citation source (opens the material)",g):""}>${esc(s)}</a></div>`;
    return `<div class="cite direct"><p>${esc(c.intro)}</p>${q(c.q[0],0)}${c.q[1]?`<p>${esc(c.between)}</p>${q(c.q[1],1)}`:""}</div>`; }
  const sup=["¹","²"];
  return `<div class="cite indirect">${c.t.map((t,i)=>`<p>${esc(t)}${sup[i]}</p>`).join("")}<div class="fns" ${el("cite-foot","Footnote sources",g)}>${c.src.map((s,i)=>`<div class="fn"><span>${i+1}</span><a class="src">${esc(s)}</a></div>`).join("")}</div></div>`;
}
/* AI-created interactive element, card variant A (Hannes 23.11, design file row 3): same language as the attachment
   previews (thin line, hard shadow, body-md title, caption label); ink plus one accent: blue = what you can move. */
const IA_EXP=`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>`;
const IA_HAND=`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V12M11 11.5v-8a1.5 1.5 0 0 1 3 0v8M14 11.5v-6a1.5 1.5 0 0 1 3 0V13M17 9.5a1.5 1.5 0 0 1 3 0V15a7 7 0 0 1-7 7h-1.2a6 6 0 0 1-4.6-2.2L4 16.2a1.6 1.6 0 0 1 2.4-2.1L8 15.5"/></svg>`;
let IA_M=2;
function iaLine(m){ /* graph area 0..6 in x, -2..12 in y → svg 260x150 */ const X=x=>20+x*38, Y=y=>136-(y+2)*9; return `M${X(0)} ${Y(3)}L${X(6)} ${Y(3+6*m)}`; }
function iaHTML(k,g){
  const grid=[1,2,3,4,5,6].map(x=>`<line class="ia-g" x1="${20+x*38}" y1="10" x2="${20+x*38}" y2="140"/>`).join("")+[0,3,6,9,12].map(y=>`<line class="ia-g" x1="20" y1="${136-(y+2)*9}" x2="252" y2="${136-(y+2)*9}"/>`).join("");
  return `<div class="ia" ${el("interactive","Interactive element (created by the AI)",g)}>
   <div class="ia-hd"><div class="ia-tt"><div class="ia-lab">${IA_HAND}Interactive</div><div class="ia-ttl">Slope: what m does to the line</div></div><button class="ia-x" aria-label="Full screen">${IA_EXP}</button></div>
   <svg class="ia-gr" viewBox="0 0 260 150" role="img" aria-label="Graph of y = m·x + 3"><defs><clipPath id="iac"><rect x="20" y="10" width="232" height="130"/></clipPath></defs>${grid}
    <line class="ia-ax" x1="20" y1="8" x2="20" y2="142"/><line class="ia-ax" x1="18" y1="118" x2="254" y2="118"/>
    <path class="ia-ln" clip-path="url(#iac)" d="${iaLine(IA_M)}"/><circle class="ia-pt" cx="20" cy="91" r="3.5"/><text class="ia-t" x="27" y="108">b = 3</text></svg>
   <div class="ia-sl"><div>Slope m: <b class="ia-v">${IA_M}</b> · y = <span class="ia-eq">${IA_M}x + 3</span></div><input type="range" min="0" max="3" step="0.5" value="${IA_M}" aria-label="Slope m"></div>
   <div class="ia-note">Simplified: b stays at 3, only the slope changes.</div></div>`;
}
let spkDone=false;
function tutorHTML(m){
  const g=m.g||"";
  const sp=!spkDone?(spkDone=true,el("speaker","Read aloud (only icon for now)","layout")):"";
  return `<div class="tm" data-g="${g}"><div class="tp">${(m.p||[]).map(x=>`<p>${x}</p>`).join("")}${m.cite?citeHTML(m.cite,g):""}${m.ia?iaHTML(m.ia,g):""}${(m.after||[]).map(x=>`<p>${x}</p>`).join("")}</div><div class="act"><button data-act="speak" ${sp} aria-label="Read aloud">${I.speaker}</button></div></div>`;
}
let wlDone=false;
function studentHTML(m){
  const g=m.g||"";
  const wl=!wlDone&&m.text?(wlDone=true,el("wline","Workbook line (marks the student answer)","layout")):"";
  return `<div class="sm" data-g="${g}">${m.asset?assetHTML(m.asset,g):""}<div class="ans">${m.text?`<div class="tx">${esc(m.text)}</div>`:""}<div class="wl" ${wl}></div></div></div>`;
}
const brianHTML=g=>`<div class="bl" data-g="${g||""}" ${el("brian","Brian avatar + dots (only while generating)","loading")}><img src="assets/brian.png" alt="Brian"><span class="dots"><i></i><i></i><i></i></span></div>`;
function itemHTML(m,dark){
  if(m.t==="t") return tutorHTML(m);
  if(m.t==="s") return studentHTML(m);
  if(m.t==="tag") return ui.context==="dialog"?"":`<div class="tagrow" data-g="${m.g||""}"><span class="tag" ${el("date","Date badge","dates")}>${esc(m.text)}</span></div>`;
  if(m.t==="brian") return brianHTML(m.g);
  return "";
}
const STATUS=`<div class="p-status"><span>9:41</span><svg width="66" height="12" viewBox="0 0 66 12" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx=".7"/><rect x="4.5" y="5" width="3" height="6" rx=".7"/><rect x="9" y="3" width="3" height="8" rx=".7"/><rect x="13.5" y="0" width="3" height="11" rx=".7"/><path d="M28 3.2a9 9 0 0 1 12 0l-1.2 1.3a7.2 7.2 0 0 0-9.6 0zM30.4 5.8a5.4 5.4 0 0 1 7.2 0L36.4 7a3.6 3.6 0 0 0-4.8 0zM34 10.6l-1.4-1.5a2 2 0 0 1 2.8 0z"/><rect x="44" y=".5" width="20" height="11" rx="2.7" fill="none" stroke="currentColor"/><rect x="46" y="2.5" width="16" height="7" rx="1.3"/></svg></div>`;
function topbarHTML(dark){
  return `<div class="tb"><div class="tb-row">${dark?`<button ${el("help","Help","topbar")} aria-label="Help">${I.help}</button>`:`<button ${el("menu","Chat history","topbar")} aria-label="Chat history">${I.menu}</button>`}<span class="t">${!dark?"AI-Tutor":ui.context==="chatbot"?"Maths Chatbot":CHAT_DIALOG_TITLE}</span>${dark?`<button ${el("close","Close","topbar")} aria-label="Close">${I.close}</button>`:`<button data-act="newchat" ${el("newchat","New chat","topbar")} aria-label="New chat">${I.newchat}</button>`}</div></div>`;
}
/* input field and tab bar as drawn in the BR-7144 frames; the field itself is BR-7147's, so it is only a placeholder here */
function composerHTML(){
  return `<div class="ci"><button class="pl" data-act="plus" aria-label="Add attachment">${I.plus("currentColor")}</button><label class="fld"><input type="text" placeholder="Or ask anything..." aria-label="Message" enterkeyhint="send"><button class="snd" data-act="send" aria-label="Send">${I.send}</button></label></div>`;
}
const TABS=`<div class="p-tabs"><svg class="tline" viewBox="0 0 402 12" preserveAspectRatio="none" aria-hidden="true"><line x1="0" y1="11.5" x2="402" y2="0.5" stroke="currentColor" stroke-width=".75"/></svg><button aria-label="Map">${I.tabMap}</button><button class="sel" aria-label="AI Tutor">${I.tabChat}</button><button aria-label="Statistics">${I.tabStats}</button></div>`;

/* ================= phone ================= */
let THREAD=[], WAITING=false;   // what the student adds in the prototype (kept across screens; "new chat" resets)
function phoneHTML(st,live={},interactive=true){
  KIND=st?st.kind:"layout"; spkDone=false; wlDone=false;
  const dark=isDarkCtx(ui.context), tab=!dark;
  const items=interactive&&(THREAD.length||WAITING)?CHAT.filter(m=>m.t!=="brian"):CHAT;   // the scripted "Brian is generating" only ends the scripted chat
  const extra=interactive?THREAD.map(m=>itemHTML(m,dark)).join("")+(WAITING?brianHTML(""):""):"";
  const bp=KIND==="tablet"||KIND==="desktop";
  return `<div class="phone bx ${dark?"dark":""}${ui.variant==="v2-nocap"?" nocap":""}">
    ${STATUS}${topbarHTML(dark)}
    <div class="p-chat"><div class="cx">${items.map(m=>itemHTML(m,dark)).join("")}${extra}</div></div>
    ${composerHTML()}${tab?TABS:`<div class="home"></div>`}
    ${bp?`<div class="ph-note"><b>${KIND==="tablet"?"Tablet":"Desktop"}: spec only</b>Prototypes are phone only for now. See Figma for the ${KIND} layout.</div>`:""}
  </div>`;
}


/* shell hook: this pack fetches nothing (assets are committed files). Defined so older shells don't throw after loading. */
function loadPreviews(){}

/* ================= stage ================= */
const anchorOf=(ch,kind)=>[...ch.querySelectorAll("[data-g]")].filter(n=>n.dataset.g.split(" ").includes(kind));
function renderStage(){
  const W=document.getElementById("pwrap"); const st=curState(); if(!st){ W.innerHTML=""; return; }
  const proto=document.body.classList.contains("proto");
  W.innerHTML=`<svg class="lines" id="lines"></svg>${phoneHTML(st,ui.live,true)}`;
  markShortMsgs(); fit(); wireChat(st.kind,proto);
  placeBadges(); renderMinimap(); setTimeout(()=>{ try{ placeAgtDots(); updTpBadges(); }catch(e){} },30);
}
function wireChat(kind,proto){
  const ch=$("#pwrap .p-chat"), ph=$("#pwrap .phone"); if(!ch) return;
  /* show the state's part of the chat: scroll it into the middle and highlight it (workbench only) */
  const ci=$("#pwrap .ci"); if(ci&&ph) ph.style.setProperty("--ci-h",ci.offsetHeight+"px");   /* the field floats over the chat (no container fill) */
  const hits=anchorOf(ch,kind);
  if(proto||THREAD.length||WAITING){ ch.scrollTop=ch.scrollHeight; }
  else if(kind==="scroll"){ ch.scrollTop=Math.max(0,ch.scrollHeight*0.35); }
  else if(hits.length){ const a=hits[0]; ch.scrollTop=Math.max(0,a.offsetTop-Math.max(16,(ch.clientHeight-a.offsetHeight)/2)); }
  else ch.scrollTop=ch.scrollHeight;
  /* scrolling back: top bar out to the top, input field (and tab bar) out to the bottom; scrolling down brings them back */
  let lastTop=ch.scrollTop, hid=false, lockUntil=0;
  const typing=()=>document.activeElement&&document.activeElement.closest&&!!document.activeElement.closest("#pwrap .fld");
  const setHid=h=>{ if(h===hid) return; hid=h; lockUntil=performance.now()+350; ph.classList.toggle("headhidden",hid); ph.classList.toggle("cmphidden",hid&&!typing()); };
  ch.addEventListener("scroll",()=>{ const now=ch.scrollTop, d=now-lastTop; if(Math.abs(d)<4&&now>0) return; lastTop=now; if(performance.now()<lockUntil) return;
    const atBottom=now>=ch.scrollHeight-ch.clientHeight-12; if(atBottom||d>0) setHid(false); else if(d<0) setHid(true); });
  ch.addEventListener("wheel",e=>{ if(hid&&e.deltaY>0) setHid(false); },{passive:true});
  if(kind==="scroll"&&!proto&&!THREAD.length){ hid=false; setHid(true); }
}
function markShortMsgs(){ document.querySelectorAll("#pwrap .sm .tx").forEach(d=>{ const lh=parseFloat(getComputedStyle(d).lineHeight)||22.4; d.closest(".sm").classList.toggle("short",d.getBoundingClientRect().height/(ui.scale||1)<=lh*1.4); }); }
function fit(){
  const st=document.getElementById("stage"), w=document.getElementById("pwrap");
  const nat=document.body.classList.contains("proto")&&innerWidth<=600; document.body.classList.toggle("native",nat); document.body.classList.toggle("ctx-dark",isDarkCtx(ui.context));
  if(nat){ const vv=window.visualViewport; document.documentElement.style.setProperty("--vvh",(vv?vv.height:innerHeight)+"px"); document.documentElement.style.setProperty("--vvtop",(vv?vv.offsetTop:0)+"px"); w.style.transform="none"; ui.scale=1; return; }
  const pv=document.body.classList.contains("proto");
  const sc=pv? Math.min((st.clientHeight-40)/894,(st.clientWidth-40)/422,1.4) : Math.max(.3,Math.min((st.clientHeight-48)/874,(st.clientWidth-48)/402,1.2));
  w.style.transform=`translate(-50%,-50%) scale(${sc})`; ui.scale=sc;
}
window.addEventListener("resize",()=>{ fit(); try{ placeBadges(); placeAiCtl(); }catch(e){} });
if(window.visualViewport){ const vvFit=()=>{ if(document.body.classList.contains("native")) fit(); }; visualViewport.addEventListener("resize",vvFit); visualViewport.addEventListener("scroll",vvFit); }
document.addEventListener("focusout",()=>{ if(!document.body.classList.contains("native")) return; setTimeout(()=>{ window.scrollTo(0,0); fit(); },120); });

/* numbered badges outside the phone, only for elements of the current section that are in view */
function placeBadges(){
  const W=document.getElementById("pwrap"), ph=W&&$(".phone",W); if(!W) return; W.querySelectorAll(".badge").forEach(b=>b.remove());
  const svg=document.getElementById("lines"); if(!ph||!svg){ ui.elCount=0; return; } svg.innerHTML="";
  const pr=ph.getBoundingClientRect(), sc=ui.scale||1, PW=402, PH=874, ch=$(".p-chat",ph), cr=ch?ch.getBoundingClientRect():pr;
  const els=[...ph.querySelectorAll("[data-el]")].filter(e=>{ if(e.offsetParent===null) return false; const r=e.getBoundingClientRect(); if(!e.closest(".p-chat")) return true; return r.bottom>cr.top+4&&r.top<cr.bottom-4; });
  const refs=allRefs(), used={left:[],right:[],top:[],bottom:[]};
  els.forEach(e=>{
    const n=elNum(e.dataset.el), r=e.getBoundingClientRect();
    const cx=(r.left+r.width/2-pr.left)/sc, cy=(r.top+r.height/2-pr.top)/sc;
    const side=cy<110?"top":cy>PH-90?"bottom":cx>PW/2?"right":"left";
    let bx,by; if(side==="left"){ bx=-44; by=cy; } else if(side==="right"){ bx=PW+44; by=cy; } else if(side==="top"){ bx=cx; by=-44; } else { bx=cx; by=PH+44; }
    const axis=(side==="left"||side==="right")?"y":"x"; let pos=axis==="y"?by:bx; while(used[side].some(u=>Math.abs(u-pos)<36)) pos+=36; used[side].push(pos); if(axis==="y") by=pos; else bx=pos;
    const b=document.createElement("button"); b.className="badge"+(refs.has(n)?" cov":""); b.textContent=n; b.style.left=bx+"px"; b.style.top=by+"px";
    b.dataset.el=e.dataset.el; b.dataset.label=e.dataset.label; b.setAttribute("aria-label",`#${n} ${e.dataset.label}`); W.appendChild(b);
    const L=document.createElementNS("http://www.w3.org/2000/svg","line"); L.setAttribute("x1",bx+80); L.setAttribute("y1",by+80); L.setAttribute("x2",cx+80); L.setAttribute("y2",cy+80); svg.appendChild(L);
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
  const b=e.target.closest(".badge"); document.getElementById("pwrap").classList.toggle("hide-b",!!e.target.closest(".phone"));
  if(b){ tip.textContent=`#${b.textContent} ${b.dataset.label}`; const r=b.getBoundingClientRect(), sr=stageEl.getBoundingClientRect(); tip.style.left=(r.right-sr.left+6)+"px"; tip.style.top=(r.top-sr.top+4)+"px"; tip.style.display="block"; }
  else tip.style.display="none";
});
stageEl.addEventListener("mouseleave",()=>{ document.getElementById("pwrap").classList.remove("hide-b"); tip.style.display="none"; });

/* ================= behaviour ================= */
function send(){
  const inp=$("#pwrap .fld input"); const txt=(inp&&inp.value||"").trim(); if(!txt||WAITING) return;
  THREAD.push({t:"s",text:txt}); WAITING=true; renderStage(); syncSel("loading");
  setTimeout(()=>{ WAITING=false; THREAD.push({t:"t",p:[esc(REPLIES[THREAD.filter(x=>x.t==="t").length%REPLIES.length])]}); renderStage(); },1500);
}
function addPhoto(){ /* stands in for the upload flow (BR-7147): image loading (B: dots get denser with the upload) → sent */
  if(WAITING) return; const m={t:"s",asset:{k:"image",loading:1},text:"Here is my next sketch."}; THREAD.push(m); renderStage(); syncSel("asset-loading");
  const iv=setInterval(()=>{ if(m.asset.loading<4){ m.asset.loading++; const d=[...document.querySelectorAll("#pwrap .ink")].pop(); if(d) d.className="ink d"+m.asset.loading; return; }
    clearInterval(iv); m.asset.loading=false; WAITING=true; renderStage(); syncSel("loading");
    setTimeout(()=>{ WAITING=false; THREAD.push({t:"t",p:["Got it. That line looks right: it crosses the y-axis at 3."]}); renderStage(); },1500); },550);
}
function syncSel(kind){ if(document.body.classList.contains("proto")) return; const x=flat().find(y=>y.s.kind===kind); if(x&&x.s.id!==ui.sel.state){ ui.sel={kind:"state",mode:x.m.id,state:x.s.id}; renderHeader(); markActive(); renderLeft(); } }
const pw=document.getElementById("pwrap");
pw.addEventListener("click",e=>{
  if(e.target.closest(".badge")){ const id=e.target.closest(".badge").dataset.el; const it=document.querySelector(`#pwrap [data-el="${id}"]`); it&&it.scrollIntoView({block:"center",behavior:"smooth"}); return; }
  if(e.target.closest(".ia input, .ia-x")) return;
  const att=e.target.closest(".as"); if(att&&!att.querySelector(".ld")){ openViewer(att,e.target); return; }
  const a=e.target.closest("[data-act]");
  if(a){ const k=a.dataset.act; if(k==="send"){ e.preventDefault(); send(); } else if(k==="plus") addPhoto(); else if(k==="newchat"){ THREAD=[]; WAITING=false; renderStage(); } return; }
  /* workbench: clicking a component jumps to its spec section */
  if(document.body.classList.contains("proto")) return;
  const g=e.target.closest("[data-g]"); if(!g||!g.dataset.g) return; const k=g.dataset.g.split(" ")[0]; const x=flat().find(y=>y.s.kind===k); if(x&&x.s.id!==ui.sel.state) go(x.s.id);
});
pw.addEventListener("input",e=>{ const r=e.target.closest(".ia input[type=range]"); if(!r) return; IA_M=+r.value; const c=r.closest(".ia");
  c.querySelector(".ia-ln").setAttribute("d",iaLine(IA_M)); c.querySelector(".ia-v").textContent=IA_M; c.querySelector(".ia-eq").textContent=(IA_M===0?"":IA_M+"x + ")+"3"; });
pw.addEventListener("keydown",e=>{ if(e.key==="Enter"&&e.target.matches(".fld input")){ e.preventDefault(); send(); } });
function go(stateId){ const x=find(stateId); if(!x) return; ui.sel={kind:"state",mode:x.m.id,state:x.s.id}; ui.live={}; render(); scrollToSel(); }

/* ================= attachment viewer (variant D, Hannes 23.11) =================
   Tap an attachment: the viewer opens on it. Today's viewer plus ‹ › and "2 of 6 files" in the header (only with several files).
   R5: scrolling down / zooming in folds the header away, scrolling back up / zooming out / one tap brings it back.
   Swipe left/right: next / previous file. Swipe down on the top bar closes, only from the start position (top, not zoomed). */
const VW_SRC={doc:{name:"Worksheet.pdf",kind:"doc",pages:3},doc2:{name:"Exercise_4.pdf",kind:"doc",pages:2},image:{name:"line_sketch.jpg",kind:"image",pages:1},image2:{name:"exercise_4.jpg",kind:"image",pages:1},drawing:{name:"Canvas",kind:"drawing",pages:1}};
function viewerFiles(as,tapped){
  if(as.classList.contains("as-two")){ const cols=[...as.querySelectorAll(".col")]; return {files:[VW_SRC.doc,VW_SRC.drawing],start:Math.max(0,cols.findIndex(c=>c.contains(tapped)))}; }
  if(as.classList.contains("as-more")){ const n=parseInt((as.querySelector(".cap")||{}).textContent)||4; const pool=[VW_SRC.doc,VW_SRC.drawing,VW_SRC.doc2,VW_SRC.image,VW_SRC.image2,{...VW_SRC.drawing,name:"Canvas 2"}];
    return {files:Array.from({length:n},(_,k)=>pool[k%pool.length]),start:0}; }
  const k=as.classList.contains("as-doc")?"doc":as.classList.contains("as-drawing")?"drawing":"image"; return {files:[VW_SRC[k]],start:0};
}
let VW=null;
function openViewer(as,tapped){ const {files,start}=viewerFiles(as,tapped); VW={files,i:start,eng:false,zoom:false}; drawViewer(); }
function closeViewer(){ const v=$("#pwrap .vw"); if(!v) return; v.classList.add("out"); setTimeout(()=>{ v.remove(); VW=null; },220); }
function vwPage(f){ return `<div class="vw-page"><img src="assets/document.png" alt=""><div class="vw-lines"><i style="width:92%"></i><i style="width:85%"></i><i style="width:96%"></i><i style="width:60%"></i><i style="width:88%"></i><i style="width:74%"></i></div><div class="vw-lines"><i style="width:90%"></i><i style="width:80%"></i><i style="width:52%"></i></div></div>`; }
function drawViewer(dir){
  const ph=$("#pwrap .phone"); if(!ph||!VW) return; let v=ph.querySelector(".vw");
  if(!v){ v=document.createElement("div"); v.className="vw"; ph.appendChild(v); wireViewer(v); }
  const f=VW.files[VW.i], n=VW.files.length, many=n>1;
  v.innerHTML=`<div class="vw-hd">${STATUS}<div class="vw-row">
      <div class="vw-nav">${many?`<button data-vw="prev" aria-label="Previous file" ${VW.i===0?"disabled":""}>${VI.l}</button><button data-vw="next" aria-label="Next file" ${VW.i===n-1?"disabled":""}>${VI.r}</button>`:""}</div>
      <div class="vw-t"><div class="vw-n">${esc(f.name)}</div>${many?`<div class="vw-s">${VW.i+1} of ${n} files</div>`:""}</div>
      <div class="vw-x"><button data-vw="close" aria-label="Close">${VI.x}</button></div></div></div>
    <div class="vw-body ${VW.zoom?"zoom":""}"><div class="vw-in ${dir?"from-"+dir:""}">${f.kind==="doc"?Array.from({length:f.pages},()=>vwPage(f)).join(""):`<div class="vw-media"><img src="assets/${f.kind==="drawing"?"drawing":"photo"}.png" alt=""></div>`}</div></div>
    ${f.kind==="doc"?`<div class="vw-pill"><b class="vw-p">1</b><span> / ${f.pages}</span></div>`:""}`;
  v.classList.toggle("eng",VW.eng);
}
const VI={l:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 4l-8 8 8 8"/></svg>`,
  r:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4l8 8-8 8"/></svg>`,
  x:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M5 5l14 14M19 5L5 19"/></svg>`};
function vwSet(eng){ if(!VW||VW.eng===eng) return; VW.eng=eng; const v=$("#pwrap .vw"); v&&v.classList.toggle("eng",eng); }
function vwGo(d){ if(!VW) return; const k=VW.i+d; if(k<0||k>=VW.files.length) return; VW.i=k; VW.zoom=false; VW.eng=false; drawViewer(d>0?"r":"l"); }
function wireViewer(v){
  let sx=0,sy=0,st=0,fromHd=false,drag=false,moved=false,lastTap=0,lastTop=0;
  v.addEventListener("click",e=>{ const b=e.target.closest("[data-vw]"); if(!b) return; e.stopPropagation(); const k=b.dataset.vw; if(k==="close") closeViewer(); else vwGo(k==="next"?1:-1); });
  v.addEventListener("scroll",e=>{ const b=e.target; if(!b.classList||!b.classList.contains("vw-body")||!VW) return; const t=b.scrollTop, d=t-lastTop; lastTop=t;
    const pages=b.querySelectorAll(".vw-page"); if(pages.length){ let p=1; pages.forEach((pg,k)=>{ if(pg.offsetTop-b.clientHeight/2<=t) p=k+1; }); const el=v.querySelector(".vw-p"); if(el) el.textContent=p; }
    if(d>6&&t>20) vwSet(true); else if((d<-6||t<10)&&!VW.zoom) vwSet(false); },true);
  v.addEventListener("pointerdown",e=>{ if(e.target.closest("button")) return; sx=e.clientX; sy=e.clientY; moved=false; const b=v.querySelector(".vw-body");
    fromHd=!!e.target.closest(".vw-hd"); st=b?b.scrollTop:0; drag=fromHd&&st<5&&!VW.zoom; if(drag) v.setPointerCapture(e.pointerId); });
  v.addEventListener("pointermove",e=>{ const dx=e.clientX-sx, dy=e.clientY-sy; if(Math.abs(dx)>6||Math.abs(dy)>6) moved=true;
    if(drag&&dy>0){ v.style.transition="none"; v.style.transform=`translateY(${dy/(ui.scale||1)}px) scale(${Math.max(.85,1-dy/2000)})`; v.style.borderRadius="24px"; } });
  v.addEventListener("pointerup",e=>{ const dx=e.clientX-sx, dy=e.clientY-sy;
    if(drag){ drag=false; v.style.transition=""; if(dy>110){ closeViewer(); return; } v.style.transform=""; v.style.borderRadius=""; if(moved) return; }
    if(e.target.closest("button")) return;
    if(!VW.zoom&&Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5){ vwGo(dx<0?1:-1); return; }
    if(!moved&&e.target.closest(".vw-body")){ const now=Date.now();
      if(now-lastTap<300){ VW.zoom=!VW.zoom; v.querySelector(".vw-body").classList.toggle("zoom",VW.zoom); vwSet(VW.zoom); lastTap=0; return; }
      lastTap=now; setTimeout(()=>{ if(lastTap===now&&VW) vwSet(!VW.eng); },310); } });
}

/* ================= stable element numbers ================= */
const EL_ORDER=["menu","help","close","newchat","speaker","wline","att-image","att-drawing","att-doc","att-multi","att-loading","cite-source","cite-foot","interactive","date","brian"];
