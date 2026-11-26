# BR-7001 · AI Tutor use cases — spec

> Generated from the Feature Workbench at commit `767c416`. Same sections as the Notion ticket. Don't edit by hand; change the workbench and export again. Agents start at `HANDOFF.md`.

## Brief

#### Problem

- Students can't use the AI Tutor as an actual tutor as it does not know about their performance in the activities
- Also in the empty state they have to come up with a prompt to ask the AI Tutor themselves (cold start problem)
- In a workshop we realized that especially study plans or practice of hard topics was highly requested from students yet not possible with the Brian chat ("Where should I practice again?", "What are my knowledge gaps?")
- The tutor has no access to the learning history (blocked by the backend ticket)

#### Related

- Coordinate with [FE Chat: Improve AI-Tutor Chat for Students](https://app.notion.com/p/3fdfca9f403c80699f29d4a8a7ba77cd) (renaming/archiving)
- Coordinate with [Ralph Idea: Allow students to dive deeper into their attempts in AI Dialogues](https://app.notion.com/p/3e4fca9f403c80fcaaa0fe1264be7fb2) (feedback deep-dive and Tutor follow-up)
- Blocking:

#### Success Criteria

- More students are using the course AI Tutor
- We see the amount of chats per Student increase (easier to start a chat now)

#### Goal

- Empty state shows use cases as conversation starters ("use-case blocks")
- Tapping a block starts a new thread with that use case's prompt
- Students get onboarded on the new functionality of AI Tutors
  - Why: students who were let down by the old tutor may have abandoned it (like the BWZ Brugg teachers did with flashcards)

#### Scope

- Build 3 blocks: Create a study plan, Show my knowledge gaps, Explain a topic
  - Practice my hardest topics and Create a mock exam are only in the design to show the component
- Desktop: shortcut ⌘1–3 on the blocks

#### Out of scope

- Create a mock exam (own ticket)
  - Waits for exam-style courses/activities (Student: Mock Exam in AI Tutor)
- Practice my hardest topics (Practice Mode ticket)

## Solution

### Global rules

- **R1** Use-case blocks use the block component of the course map activities (with the dots)
- **R2** Tapping a block creates a new thread, named after the use case, and sends its prompt
- **R3** Starting from the message field keeps today's logic (thread name etc.)
- **R4** A tapped block flies into the student message; everything else crumbles away: what moves through the stack (the flying block, the keyboard) knocks the blocks loose, the rest follow one after another

### Empty state ([Figma](https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12115-80))

#### Use-case blocks (`idle-rest`)

- Entering the tab: the blocks fly in from random positions with some spin and settle into the tower, then the illustration and text fade in
  - [Motion: Enter ↗](https://claude.ai/artifact/E61jktbwanbpFAARpqKe4A)
- Use-case blocks under the intro
- Input field and send as in chat
- Desktop: a block wiggles once when the pointer enters it (hover); blocks never animate on their own while idle
  - Desktop: shortcut ⌘1–3 opens a block (one per block in scope); the number shows on the block (mobile/tablet: no number)

#### No activities yet (`idle-none`)

- Course has no activities, or the student hasn't studied yet
- Only "Explain a topic"

#### Awareness tooltip (`idle-tip`)

- In-app tooltip telling students the AI Tutor improved
  - Shown on another tab, pointing at the AI Tutor tab
- The AI Tutor tab icon is highlighted
- Copy (design)
  - **AI Tutor just got an upgrade**
  - It now creates study plans and shows your knowledge gaps.
- Who sees it
  - Students who never used the AI Tutor
  - Students who haven't used it in the last 3 months
- Hides on any tap or on the AI Tutor tab

### Typing ([Figma](https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12783-20761))

#### Field focused (`focus-kb`)

- Tapping the field brings up the keyboard
- All blocks break away while the keyboard slides up
  - A block lets go when the keyboard (top of the input bar) reaches it; the blocks it doesn't reach follow one after another, upwards
  - Same fall as the untapped blocks in Open
  - [Motion: Focus ↗](https://claude.ai/artifact/E61jktbwanbpFAARpqKe4A)
- Intro stays, so the screen doesn't look empty
- Tapping outside or closing the keyboard: blocks come back
  - Each block rises from behind the keyboard as soon as its spot is free, top block first
  - [Motion: Back out ↗](https://claude.ai/artifact/E61jktbwanbpFAARpqKe4A)

#### Typing (`focus-typed`)

- Student types; field and send behave as today (not in scope)
- Sending: the message appears as in the app today (no animation)

### Chat started ([Figma](https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12319-65399))

#### From a block (`chat-block`)

- Tapped block flies up and lands on the student message
  - [Motion: Open ↗](https://claude.ai/artifact/E61jktbwanbpFAARpqKe4A)
- Tapping a use case creates a new thread named after the use case, shown in the thread list
  - The header keeps "AI Tutor" (it doesn't switch to the thread name)
  - Title from the content, e.g. "Study Plan for {topic}" (today's thread naming allows it)
- Other blocks fall away, intro fades
  - Blocks the tapped block flies past let go as it passes them, pushed aside from its path
  - Blocks below it follow one after another, nearest first
- Tutor message shows the typing dots, then streams
- What the tutor does per use case
  - Create a study plan: the tutor suggests the exercises the student struggled with and should repeat
    - Each suggested exercise links to its activity; tapping it opens the activity
  - Show my knowledge gaps: the tutor analyses the learning history and gives the knowledge level per key evaluation rubric (later: competencies)
  - Explain a topic: the tutor asks for a topic, then explains it using course material where possible
- \+ (new chat) goes back to the empty state
  - [Motion: Back ↗](https://claude.ai/artifact/E61jktbwanbpFAARpqKe4A)

#### From the field (`chat-send`)

- The student message appears as in the app today (no animation)
- Intro fades; chat history elements fade in
- Keyboard stays open, as in other chats

## Edge cases & touchpoints

- No activities in the course, or the student hasn't studied anything yet
  - Only show "Explain a topic"
- Loading and error: reuse the existing chat states
- Send with an empty field: send stays disabled, nothing animates
- Keyboard closes without a tap outside (swiped down, app switched, call comes in): blocks come back the same way as tapping outside
- Tablet and web app: same blocks, no shortcut numbers on tablet; ⌘1–3 only with a keyboard

## Side effects

### Effects on existing data

- Tapping a use case creates a new thread named after the use case (title from the content, e.g. "Study Plan for {topic}")
- Starting from the message field keeps today's logic (thread name etc., R3)
- Existing threads don't change

### Notifications, emails & tracking

- Notifications and emails: none
- In-app: the awareness tooltip (see Empty state · Awareness tooltip)
- Tracking: none planned.

## Implementation

- Design: [Figma](https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12115-80)
- Copies: [Copies BR-7001](https://app.notion.com/p/410fca9f403c81948081ca753f5c8f9b)
- Feature Workbench: [Feature Workbench](https://claude.ai/artifact/M7ybx2SUitMz1F8t5c9cRo)
- Animation Workbench: [Animation Workbench](https://claude.ai/artifact/E61jktbwanbpFAARpqKe4A)
- Prototype: [Phone prototype](https://hennes95.github.io/brian-prototypes/br-7001/motion/use-case-blocks/)
- Handoff: [packs/br-7001/handoff](https://github.com/hennes95/brian-prototypes/tree/main/packs/br-7001/handoff)

### Design system changes

- New component: Use-case block (icon + short description); icon mapping in Figma

## Open questions

_none_
