# BR-7001 · AI Tutor use cases — handoff

**Source of truth:** `packs/br-7001/handoff/` at commit `f219df7`. The Notion ticket holds a copy of `spec.md` for reading; it is regenerated from here, never edited by hand.

## Read in this order
1. `spec.md` — what the user sees and can do, per state (human-readable).
2. `decisions.md` — what was removed or rejected. Don't add it back.
3. `states.json` — states, transitions and which animation each transition uses.
4. `copies.md` — every UI text with its key, in all languages. Binding.
5. `motion-package.md` — animation values, engine, screen layout (Flutter + React), test vectors. Only for animation work.

## Binding vs. reference
- **Binding:** behaviour, states, transitions, UI texts (copies.md), animation values, layout positions (±0.5 px).
- **Reference only:** prototype markup/CSS. Build with Brian's real components.

## Checks
- Animations: run the test vectors in `motion-package.md`.
- Behaviour: every transition in `states.json` must be reachable in the app.

## Links
[Feature Workbench](https://claude.ai/artifact/M7ybx2SUitMz1F8t5c9cRo) · [Animation Workbench](https://claude.ai/artifact/E61jktbwanbpFAARpqKe4A) · [Phone prototype](https://hennes95.github.io/brian-prototypes/br-7001/motion/use-case-blocks/) · [Notion ticket](https://app.notion.com/p/a315f996117540779c4207b53e44fec6) · [Copies](https://app.notion.com/p/410fca9f403c81948081ca753f5c8f9b)
