# Feature workbench shell: changelog

## 1.0.1 (20.11.26)
- Comments (Agentation) also work where `agt.js` isn't published next to the page: the shell then loads the copy hosted on GitHub Pages. Needed for Claude artifacts, which can't carry the bundle.
- No other changes.

## 1.0.0 (20.11.26)
- Extracted from the BR-7147 workbench (artifact backup of 19.11.26). No new features.
- Split into the shell (`index.html`, `shell.css`, `shell.js`, `agt.js`) and the BR-7147 pack.
- Ticket specifics moved into the pack's `PACK` config: id, title, prototype link, database keys, start screen, old-data migration.
- Checked against the original in a headless browser: same screens, variants, touchpoints, spec and phone prototype (typing, sending), no errors.
- `agt.js` is the Agentation bundle (npm `agentation`) as it was in the original workbench.
