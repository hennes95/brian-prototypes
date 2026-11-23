### V3 rules (developer handoff · chosen variant)
Build V3 only. V1 and V2 above are explored alternatives; their values stay in the manifest for the workbench.

#### Setup (how the animation is built)
- R1: Every animation is a pure function of time: `at(tMs) -> Frame`. No per-frame state; scrubbing, replay and tests = sampling `at(t)`.
- R2: ELEMENT CONTRACT – the motion model never touches content, size or styling. Its frame carries only:
  - per block index: centre x/y, rotation (deg), scale, opacity;
  - `intro` opacity; `stu` / `tut` message opacity (+ `rise` px for avatar and name), `stuText` (the student text line), `done` (reply instead of dots);
  - `morph` (Open: the tapped block turning into message text), `kb` (keyboard progress 0..1), `fly` (Send: text in flight), `pressed`.
  - The screen code (`motion:screen-react`, `motion:screen-dart`) takes exactly this frame. The reference ports (`motion:ref-ts`, `motion:ref-dart`) produce it.
- R3: Every animation = user action first (tap lead, `tap` ms), then the motion. A tapped block turns dark 60 ms after touch-down.
- R4: Layout is the 402 x 874 artboard; scale the whole artboard once (width / 402), never per element.
- R5: Springs are Motion's `spring()` (motion.dev): stiffness = (2π / (visualDuration·1.2))², damping = 2·ζ·√stiffness, mass 1, ζ = 1 − bounce;
  sampled by elapsed ms, value snaps to exactly 1 once speed ≤ 0.01/s and distance ≤ 0.005; forced to 1 after visualDuration · 1.6.
- R6: `total` time-scales the whole motion: `f = total / motionEnd`, `at'(t) = at((t − tap) / f)`; `total` 0 = natural length.
- R7: Randomness is seeded (mulberry32), fixed draw order. Production may use a new seed per run; the test vectors use the seeds in R9.
- R8: Page assembly = blocks first, text last. No idle animation: blocks never move on their own (hover wiggle on desktop only).

#### Animations
##### Enter (user opens the AI Tutor tab)
- Blocks start near their own place: x ± (130–280 px), y ± (110–250 px) away from the centre (upper above, lower below, middle sideways only), tilt ±(16–46°) · rand.
- Random release delay 0..stagger·3; enter spring; opacity 0 → 1 with cubic-bezier(.25,.1,.25,1) over 350 ms.
- Intro fades in from `textAt` over 450 ms (text last).
##### Open (user taps block i): the block becomes the message
- The tapped block flies to the student text line (label left edge 68 px, line centre 163.6 px) on two springs: Y (`flyY`) and X (`flyX`); different springs bend the path into a slight arc.
- Tilt reaches 0° at `straighten` % of the flight (cubic-bezier(.2,.8,.2,1)); the block grows by `lift` % mid-flight (sin).
- Surface (fill, border, shadow, icon) fades from `surfAt` % over `surfDur` %; the label crossfades from block style (12 px bold) to message style (14 px medium, #3a3a3a) from `textAt` % over `textDur` %, scaling between the sizes.
- Landing: when both springs are at rest the real message text takes over (same position, no jump). Avatar and "Student - hh:mm" fade in from `metaAt` % over `metaFade` ms, rising `metaRise` px. Brian follows `tutorDelay` ms after the flight (fade 600 ms), dots for `loading` ms, then the reply.
- Other blocks fall: release delay = ripple · |j − i| + random · start; y = y0 + kick·u + ½·gravity·u²; x drift = dr·drift·q·1.6; rotation = spin·(u − q) (±spinRand %, random sign); q = 0.22·(1 − e^(−u/0.22)); wobble = wobble·sign·sin(18u)·e^(−7u).
- Intro fades out over 450 ms.
##### Focus (user taps the message field)
- The keyboard slides up right away (the app uses the OS keyboard and its own animation; the input bar rides on it, 245 px higher when open).
- All blocks break away `blocksAt` ms after the tap, lowest block first (`ripple` ms apart), with the falling physics of Open (`kick`, `gravity`, `spin` ±55 %, `drift`, wobble 7).
- The intro stays.
##### Back out (user leaves the field without sending: tap outside, keyboard swiped down, app switch, call)
- Identical to Back (same values), started from the Focus state: the keyboard goes down, the blocks rise back in, the intro (still visible) stays.
##### Send (user sends a typed message)
- The typed text lifts out of the field (left 81 px, line centre 510 px with the keyboard up) and lands on the student text line on two springs (`sendY`, `sendX`), same idea as Open.
- Landing: the real message text takes over; avatar and name fade in from `metaAt` % over `metaFade` ms (rising `metaRise` px); Brian follows `tutorDelay` ms after the flight.
- The keyboard stays up; the intro fades out over 450 ms. Send with an empty field: nothing animates.
##### Back (user taps "+" in the chat; also after Send)
- All blocks rise from just below the screen: start x = x0 ± up to 170 px, y = 910–970 + 14·j, tilt up to ±48° · rand; lowest block first, stagger · 1.3 per block, starting `blocksAt` ms after the tap; back spring.
- Chat fades out over `chatOut` ms; intro fades in from `introAt` % of the spring time over `introIn` ms; a keyboard that is up goes down.
##### Desktop hover wiggle (pointer devices; web/desktop only)
- On pointer-enter: ONE random jolt (±5·a px x, ±4·a px y, ±5·a ° rotation, a = wiggle), then it springs back; hovered block fill #ececec.
- Jolt 180 ms cubic-bezier(.2,.9,.3,1.2); after 110 ms return 500 ms cubic-bezier(.2,1.4,.4,1); on pointer-leave return immediately.
- Disabled while an animation runs / after a block was tapped. No hover on touch devices.

#### Acceptance
- R9: Test vectors (manifest `vectors.D`): open = block 1, seed 12345; back = seed 777 from the end of open; enter = seed 999; focus = seed 4242; blur (Back out) = seed 5151 from the end of focus; send = text "Explain photosynthesis". Frames sampled at `T` match within 0.01 px / 0.01° / 0.01 opacity (blocks, intro, stu, tut, kb, fly, morph, stuText). The TS reference port passes all of them.
- R10: 60 fps on a mid-range phone; animate transforms and opacity only.
