# BR-7147 · Explored input field variants

Archived on 23.11.26 (Hannes): explored, no longer shown in the workbench.
Their code and CSS stay in the pack (`VARIANTS_ARCHIVED` in `pack.js`), so any of them renders again once it is put back into `VARIANTS`.
Screenshots in this folder: AI Tutor tab, idle and typing (`<id>-idle-rest.png`, `<id>-t-3.png`).

## Still in the workbench
- **Pill** (`pill-light`, new 23.11)
  - Muted pill: white, dark outline
  - On dark surfaces (Chatbot, Quiz): surface colour with a light outline
- **Pill inverted** (`pill`, was called "Pill" until 23.11)
  - Dark filled pill, white send button
  - [Figma](https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12532-148660)
  - Comments made on "Pill" before 23.11 stay with this one (same id)

## Archived
- **Workbook line** (`open`)
  - Full-width field on the background, dashed "workbook" line under the field and the mic
  - Filled + button on the left
  - [Figma](https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12532-149018)
- **No underline** (`angled`)
  - Like Workbook line, without the dashed line
- **Inverted** (`inv`)
  - Full-width dark block under the chat, angled top edge
  - White + and send buttons
  - [Figma](https://www.figma.com/design/GbI4xt40lr0Jmk3rkgrtM0/Student-App?node-id=12702-194812)

## Why the pill
- Hannes 23.11: the pill will be the final design
- Effects on the spec
  - No line under the field (removed from the spec on 23.11)
  - No angled top line in Focus mode and the Quiz touchpoint (came from Inverted; removed from the spec on 23.11)
  - The tab bar keeps its angled top edge: it shows when the field folds away while scrolling up

## Archived 25.11.2026 (Hannes): "Status quo + white dialog" is the chosen design
- **Pill** (`pill-light`): white field with dark outline on every screen; dark upload dialog.
- **Pill inverted** (`pill`, Figma 12532-148660): dark field on light screens, light field on dark screens; dark upload dialog.
- **Pill status quo** (`pill-sq`): white field with outline on light screens, light inverted field on dark screens; dark upload dialog.
- Kept: **Status quo + white dialog** (`pill-sq-w`): field as Pill status quo, upload dialog white with black outline and dividers, corners like the field (28), light duo-tone icons.
- The CSS for all of them stays in pack.css (classes `v-pill`, `v-pill-light`, `up-white`), so an archived variant can be shown again via the workbench's archived-variants toggle.
