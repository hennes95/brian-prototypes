# BR-7001 · motion package + Animation Workbench (source)

Everything needed to rebuild the BR-7001 motion package, the Animation Workbench artifact and the phone prototype.

| Path | What |
|---|---|
| `values.json` | Values saved in the Animation Workbench (artifact db `tweaks/current`). Refresh before a build (see 1). |
| `source/orig.html` | Original workbench source; engine catalogue + screen markup are cut from it by line numbers. |
| `source/engine_tail.js` | V3 additions to the engine (Focus, Back out, Send, vectors, mount). |
| `source/shell.js`, `ui.js`, `ui.css` | Workbench shell (timeline, panel, dark UI). |
| `source/screen.tsx`, `screen.dart` | Screen layout as code (React / Flutter), part of the package. |
| `source/ref_v3.ts`, `ref_v3.dart` | Reference ports of the motion model (V3); `__PARAMS__` is filled from `values.json`. |
| `source/rules_v3.md` | Developer rules (V3) in the package. |
| `check/parity.mjs` | TS port vs engine test vectors (must pass, ±0.01). |

## Build
1. Refresh values: read the artifact db doc `tweaks/current` (ArtifactData get) and save it as `values.json`.
2. `./build.sh` (add `--push-phone` to also write the phone build to `br-7001/motion/use-case-blocks/`). It stops if parity fails.
3. Publish `out/index.html` (+ `out/motion-engine.js` as `motion-engine.js`) to the Animation Workbench artifact; read its published `motion-engine.js` first if the tool asks.
4. Commit + push (`out/` is not committed; the package lives in `br-7001/motion/use-case-blocks/motion-package.md`).

## When an animation is added or changed
Update in the same round: engine (`source/engine_tail.js`), rules (`source/rules_v3.md`), reference ports (`source/ref_v3.*`), screen code if the frame changes, then `./build.sh`. Handoff is then only an export.
