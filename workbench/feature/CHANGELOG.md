# Feature workbench shell: changelog

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
