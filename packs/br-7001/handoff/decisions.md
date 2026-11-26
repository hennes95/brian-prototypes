# BR-7001 · decisions (removed or rejected — don't add back)

- No idle animation: blocks never move on their own; the only wiggle is on hover (desktop). The ticket's "default wiggle" was dropped.
- Desktop shortcuts are ⌘1–3 (one per block in scope), not 1–4 or 1–5.
- Header keeps "AI Tutor" after a block is tapped; it never switches to the thread name (the title switch AI Tutor / ChatGPT lives there). The thread title only shows in the thread list.
- Out of scope: the AI Tutor inside quizzes (this ticket is only the chat in the AI Tutor tab).
- Not specced because it's existing behaviour: AI Tutor turned off in a course (no tab, so no blocks and no tooltip).
- Not specced because the ticket is blocked by it: learning history not available yet (see "Blocked by").
- Not specced: "blocks rest after the animation" ("what isn't described doesn't happen").
- Typing and sending: the input field behaves as today (input field redesign, BR-7147); this ticket only adds the animations.
- Chat history: spec says "chat history elements fade in", not specific UI parts (the chat UI will change).
- Enter: blocks first, then illustration and text (as in the Animation Workbench), not text first as in the first design.
- Sending a typed message has no animation: the message appears as in the app today. The earlier "text flies into the student message" (Send) was removed (Hannes 26.11.).
- Back out (leaving the field without sending) uses the same Back animation as "+ new chat", started from where the blocks are.
- Copy: no new strings needed beyond Copies BR-7001; the thread title is an open question for the dev.
- Block motion: V4 is built (Hannes 26.11.), not V3. V4 = V3 plus a smart stagger: what moves through the stack (the flying block, the keyboard edge) knocks the blocks loose, the rest go as dominoes. V3's fixed orders (Open: nearest first; Focus: bottom first; Back out = Back) were replaced.
- Open questions answered (Hannes 26.11.): the tutor can link activities that open on tap; the thread title is set from the content (e.g. "Study Plan for {topic}"), not a fixed copy from the block label.
