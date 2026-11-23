# Feature workbench: pack interface (shell 1.0.0)

A ticket workbench is the shell (`workbench/feature/<version>/`) plus one ticket pack (`packs/<ticket>/`).
`index.html` loads `pack.css` after `shell.css`, then `pack.js` before `shell.js`. Both scripts are classic
scripts and share one global scope, so the pack defines the names below and the shell calls them.

This is the interface of shell 1.0.0: it is the BR-7147 workbench split along its existing seams, unchanged.
It still names the stage after the phone (`phoneHTML`). Desktop support will change that in a later version.

## The pack defines

### Config and data
- `PACK`: `{ id, title, protoUrl, dbDoc, legacyDbDoc?, lsKey, ui:{sel, variant, context}, protoStartKind }`
  - `dbDoc`: the artifact database document that holds the spec (e.g. `workbench/br-7147-v2`)
  - `lsKey`: localStorage key for the offline copy
  - `ui`: the screen, variant and touchpoint the workbench opens on
  - `protoStartKind`: the screen kind `#prototype` starts on
- `DEFAULT`: the spec when the database is empty: `{ v:2, docs:{brief, rules, edges, questions}, modes:[{ id, name, status, figma, states:[{ id, name, kind, doc, links }] }] }`
- `VARIANTS`: `[{ id, name, figma? }]`, shown as the variant switch on the stage
- `CONTEXTS`: `[{ id, name, ctx, figma?, note? }]`, the touchpoint chips in the header and the touchpoint blocks in the spec
- `EL_ORDER`: element ids in the order they get their numbers (#1, #2 …)

### Stage (the prototype)
- `renderStage()`: draws the prototype for `ui.sel` / `ui.variant` / `ui.context` into `#pwrap`
- `phoneHTML(state, live, interactive)`: returns a screen's HTML; the shell renders it off screen to count elements for coverage. Interactive elements carry `data-el` and `data-label`
- `fit()`: scales the prototype into the stage; also handles the native phone view
- `placeBadges()`, `refreshCoverage()`: numbered element badges and their covered state
- `go(stateId)`: show a screen
- `stageEl`: the stage element (`#stage`)
- optional `loadPreviews()`: fetches images the prototype needs (BR-7147: Figma screenshots via the connector)
- optional `migrate(old)`: turns data from `PACK.legacyDbDoc` into the current shape

The pack also wires its own prototype behaviour (clicks, typing) on `#pwrap`.

## The shell provides (the pack may use)
State and helpers: `S`, `ui`, `save()`, `render()`, `$`, `esc`, `uid`, `unwrap`, `flat()`, `find(id)`, `mode(id)`, `curMode()`, `curState()`, `elNum(id)`, `allRefs()`, `covOf(state)`, `findImage(response)`.
UI updates: `renderLeft()`, `renderHeader()`, `renderMinimap()`, `markActive()`, `scrollToSel()`, `placeAiCtl()`, `placeAgtDots()`, `updTpBadges()`.

## Rules
- The shell never contains anything about a ticket. A new exploration or variant only changes the pack.
- Pack CSS is scoped to the prototype's own classes; it must not restyle shell elements.

## Spec markup (shell 1.0.9+)
- `<span class="ai">…</span>`: Claude's own suggestion (blue), accepted or declined one by one.
- `<div class="imp" data-src="ticket · 19.11">…</div>`: text imported from a source Hannes wrote (Notion ticket, backup). One block per section, kept or dropped as a whole. Never blue.
