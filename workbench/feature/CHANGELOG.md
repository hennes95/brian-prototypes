# Feature workbench shell: changelog

## 1.0.10 (23.11.26)
- Imported blocks are handled like Claude's suggestions: same ✓ ✕ ↩ controls in the margin, threads, read / unread, one shared counter (inbox).
- Differences: the grey bar stays, the controls of imported blocks are always visible (not only on hover) and start with a "From …" label.
- Removes 1.0.9's separate Keep / Drop bar and grey counter.

## 1.0.9 (23.11.26)
- Imported blocks: text Claude brings in from a source Hannes wrote (e.g. the Notion ticket) is wrapped in `<div class="imp" data-src="ticket · 19.11">`.
  Shown as normal text with a grey bar in the margin and a "From …" label; one ✓ Keep (becomes plain text) / ✕ Drop per block.
- Blue (`span.ai`) stays for Claude's own suggestions only.
- Grey counter in the toolbar: number of imported blocks left; click steps through them.

## 1.0.8 (23.11.26)
- Controls stay visible for ~0.45 s after the pointer leaves the proposal, so you can reach ↩ / the thread count.
- The thread count's outline follows the controls' shape (no speech-bubble corner).

## 1.0.7 (23.11.26)
- Read / unread for Claude's proposals: unread ones get a blue dot in the margin. A proposal counts as read once its thread was opened or it was hovered for ~1 s; it becomes unread again when Claude answers in its thread. Stored in `S.seen`.
- Blue counter works like an inbox: filled with a red dot = unread count, jumps to the next unread proposal; all read = outlined, shows the open count.
- Thread bubbles: filled = Claude answered and you haven't looked, outlined = read.

## 1.0.6 (23.11.26)
- Thread input grows up to 7 lines before it scrolls (Enter sends, Shift+Enter new line).
- ✓ ✕ ↩ only show for the proposal under the pointer or with its thread open; a proposal with messages keeps just its count.

## 1.0.5 (23.11.26)
- Threads on Claude's proposals: ↩ next to ✓ ✕ (or the blue counter) opens a popover anchored below the proposal with messages, revised version, Accept / Decline and one input (reply, or an optional reason when declining). Replies waiting for Claude count in the yellow counter. Stored in `S.threads`.
- The blue counter now opens the next proposal's thread; ↑ ↓ in the popover step through all open proposals.

## 1.0.4 (20.11.26)
- Clicking the yellow comment counter also turns the comment layer (Agentation) on, so its markers are visible when it jumps to a comment. Already on: unchanged.

## 1.0.3 (20.11.26)
- Comment markers and highlight in yellow (Agentation colour setting forced to yellow on load).
- The shell no longer draws its own yellow dots on the screen; Agentation's markers replace them. Touchpoint chips keep their comment counts.
- Comments are shown per variant + surface: the URL hash follows the variant and touchpoint (e.g. `#v2-cms`), and Agentation keeps markers per hash.
  Applies to the jsdelivr build used in Claude artifacts; a local `agt.js` bundle keeps one list for the page.

## 1.0.2 (20.11.26)
- Comments in Claude artifacts: 1.0.1's GitHub Pages fallback is blocked there (artifacts only allow scripts from a few CDNs).
  Without a local `agt.js` the shell now loads agentation 3.1.2 (with React 19.3.0) from jsdelivr and mounts it with the same glue the bundle had.
- An import map makes react-dom/client and agentation share one React.

## 1.0.1 (20.11.26)
- Comments (Agentation) also work where `agt.js` isn't published next to the page: the shell then loads the copy hosted on GitHub Pages. Needed for Claude artifacts, which can't carry the bundle.
- No other changes.

## 1.0.0 (20.11.26)
- Extracted from the BR-7147 workbench (artifact backup of 19.11.26). No new features.
- Split into the shell (`index.html`, `shell.css`, `shell.js`, `agt.js`) and the BR-7147 pack.
- Ticket specifics moved into the pack's `PACK` config: id, title, prototype link, database keys, start screen, old-data migration.
- Checked against the original in a headless browser: same screens, variants, touchpoints, spec and phone prototype (typing, sending), no errors.
- `agt.js` is the Agentation bundle (npm `agentation`) as it was in the original workbench.
