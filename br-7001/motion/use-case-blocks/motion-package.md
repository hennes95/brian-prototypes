# bootstrap
<!-- motion:rules -->
Every animation starts with the user action: finger down for the tap lead (touch dot; a tapped block turns dark 60 ms after touch-down), then the motion plays. The motion is a pure function of time; randomness is seeded (mulberry32, fixed draw order). Page assembly: blocks first, text last. `Total duration` time-scales a whole animation (0 = natural length).

### V1 · physical push
The tapped block grows into the screen (×6.4) and pushes its neighbours away like a wall; the neighbours are pre-simulated at 1/120 s (push velocity, inertia, drag, spin, drift, contact momentum) and fade from `bFade`. Back: blocks fly back from where they are. Enter: text first, blocks after (`inLead`).

### V2 · handoff
The tapped block moves to the student message on the open spring, tilts to −flySpin and fades out while the message rises in; the other blocks fall (gravity, kick, spin, drift, wobble, ripple). Full rules below.

### V3 · the block becomes the message
The tapped block’s label is the prompt sent to the tutor, so it flies up-left and lands exactly on the student text line (left 68 px, line centre 163.6 px).
1. Tap: the block turns dark (tap lead 90 ms).
2. Flight on two springs, Y (up, 0.55 s) and X (left, 0.62 s); different springs bend the path into a slight arc. The tilt reaches 0° at `fStraighten` % of the flight; the block lifts by `fLift` % mid-flight.
3. On the way, fill, border, shadow and icon fade (from `fSurfAt` %, over `fSurfDur` %), and the label crossfades from block style (12 px bold, white on dark) to message style (14 px regular, #3a3a3a) from `fTextAt` % over `fTextDur` %, scaling between the two sizes.
4. Landing: when both springs are at rest the real message text takes over (same position, so no jump). Avatar and “Student - hh:mm” fade in from `fMetaAt` % (rising `fMetaRise` px); Brian follows `fTutorDelay` ms after the flight.
5. The other blocks fall as in V2, with their own values. Back and Enter work as in V2, with their own values.

### V2 rules (developer handoff)

#### Setup (how the animation is built)
- R1: The animation is a pure function of time: `at(tMs) -> Frame`. No per-frame state; scrubbing, replay and tests = sampling `at(t)`.
- R2: ELEMENT CONTRACT – the engine never touches content, size or styling of elements.
  - Output per element index: centre x/y, rotation (deg), scale, opacity.
  - Output for 3 text layers: `intro`, `student` (+ translateY rise), `tutor`: opacity (+ translateY).
  - Any element can be swapped (other cards, any number); pass their rest poses via `Layout` (`rest[]`, `landing`).
- R3: Every animation = user action first (tap lead, `tap` ms), then the animation plays.
  - The tapped block turns dark 60 ms after touch-down and stays dark until it has faded out.
- R4: Layout is the 402 x 874 artboard; scale the whole artboard once (width / 402), never per element.
- R5: Springs
  - Duration springs: stiffness = (2π / (visualDuration·1.2))², damping = 2·ζ·√stiffness, mass 1, ζ = 1 − bounce.
  - Spring value goes 0 → 1 (may overshoot). Time base = visualDuration · 1.6 s (explicit-physics spring: 1.28 s).
  - `ease(p) = p ≥ 1 ? 1 : spring(p · timeBase)`.
- R6: `total` scales the whole motion in time: `f = total / motionEnd`, `at'(t) = at((t − tap) / f)`; `total` 0 = natural length (no scaling).
- R7: Randomness is seeded (mulberry32), fixed draw order. Production may use any new seed per run; parity tests use the seeds below.
- R8: Page assembly = blocks first, text last (Back, Enter). Never fly a block across the whole screen.

#### Animations
##### Open (user taps block i)
- Tapped block: moves to `landing` on the open spring; rotation goes from rest angle to −flySpin and stays (no swing back); scale lift 1 + 0.07·sin(π·t/timeBase); opacity fades 1 → 0 from `move·morphAt` over `move·(1 − morphAt)`; swing arc `arc` px.
- Other blocks fall: release delay = ripple · |j − i| + random(0..start); y = y0 + kick·u + ½·gravity·u²; x drift = dr·drift·q·1.6; rotation = spin·(u − q) (±spinRand %, random sign); q = 0.22·(1 − e^(−u/0.22)); wobble = wobble·sin(18u)·e^(−7u); u in seconds since release; blocks stay opaque and leave the screen (y > 990).
- Text: intro fades out over 450 ms; student message fades in from `move·morphAt` (duration `move·(1 − morphAt)` + 250 ms), rising `rise` px with cubic-bezier(.2,.8,.2,1); tutor message +850 ms (fade 600 ms), dots for `loading` ms, then the reply.
##### Back (user taps "+" in the chat)
- All blocks rise from just below the screen: start x = x0 ± up to 170 px, y = 910–970 + 14·j, tilt up to ±48° · rand; lowest block first; stagger · 1.3 per block; back spring; opacity 1.
- Chat fades out in 450 ms; intro fades in from 0.45 · timeBase.
##### Enter (user opens the AI Tutor tab)
- Blocks start near their own place: x ± (130–280 px), y ± (110–250 px) away from centre (upper above, lower below, middle sideways only), tilt ±(16–46°) · rand; random release delay 0..stagger·3; enter spring; opacity 0 → 1 with cubic-bezier(.25,.1,.25,1) over 350 ms.
- Intro fades in from `textAt` over 450 ms (text last).
##### Desktop hover wiggle (pointer devices; web/desktop only)
- On pointer-enter: ONE random jolt (±5·a px x, ±4·a px y, ±5·a ° rotation, a = wiggle), then it springs back; hovered block fill #ececec.
- Jolt 180 ms cubic-bezier(.2,.9,.3,1.2); after 110 ms return 500 ms cubic-bezier(.2,1.4,.4,1); on pointer-leave return immediately.
- Disabled while an animation runs / after a block was tapped. No hover on touch devices.

#### Acceptance
- R9: Frames sampled at the times in the test vectors match within 0.01 px / 0.01° / 0.01 opacity.
- R10: 60 fps on a mid-range phone; animate transforms and opacity only.
<!-- /motion:rules -->
````json motion:manifest
{"format": "motion-package/1", "id": "ai-tutor-blocks", "title": "AI Tutor · Use-case blocks", "screen": "AI Tutor home screen", "valuesRevision": 1, "artboard": {"w": 402, "h": 874, "statusBar": 40}, "fonts": "Nunito Sans 500 / 700 (Google Fonts); Inter 600 for the status-bar time", "fontLinks": ["https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@500;700&display=swap"], "variants": [{"id": "B", "name": "V1", "about": "physical push"}, {"id": "C", "name": "V2", "about": "handoff: block flies to the message, the others fall"}, {"id": "D", "name": "V3", "about": "block flies into the student message and becomes its text"}], "defaultVariant": "D", "animations": [{"id": "enter", "name": "Enter", "trigger": "open the AI Tutor tab"}, {"id": "open", "name": "Open", "trigger": "tap a block"}, {"id": "focus", "name": "Focus", "trigger": "tap the message field", "variants": ["D"]}, {"id": "blur", "name": "Back out", "trigger": "tap outside the field while typing", "variants": ["D"]}, {"id": "send", "name": "Send", "trigger": "send a typed message", "variants": ["D"]}, {"id": "back", "name": "Back", "trigger": "tap “+” in the chat header"}], "keyframeFormat": "phase: open = block tapped, back = plus button pressed (blocks fly back to the tower), enter = tab entry (blocks fly in); every animation starts with the user action (touch=[x,y,scale,opacity,type] finger down for the tap lead, pressed = tapped block dark) and then the animation plays; frames[].blocks[j]=[centerX,centerY,rotationDeg,scale,opacity] in artboard px (scale = resize the block, not a raster scale); intro = empty-state opacity; chat=[studentMsg,brianMsg,replyShown] 0-1; shake=[dx,dy] whole artboard; V3 frames add morph = {block, surface opacity, chipLabel [opacity, scale], messageLabel [opacity, scale], studentText}", "interactionDefaults": {"pressMs": 150, "note": "one press / tap length for every UI interaction that starts an animation"}, "values": {"tapOpen2": 150, "durOpen2": 1800, "cMove": 420, "cMorphAt": 23, "cRise": 68, "cGravity": 3500, "cKick": -10, "cSpin": 235, "cSpinRand": 55, "cDrift": 310, "cStart": 0, "cWobble": 7, "cFlySpin": 58, "cArc": 0, "cRipple": 70, "loading2": 1800, "moveSpring": {"stiffness": 101, "damping": 15, "mass": 3.4}, "tapBack2": 150, "durBack2": 1200, "staggerBack2": 70, "randBack2": 100, "backSpring2": {"visualDuration": 0.8, "bounce": 0.2}, "tapEnter2": 150, "durEnter2": 1190, "staggerEnter2": 40, "randEnter2": 67, "textEnter2": 190, "enterSpring2": {"visualDuration": 0.25, "bounce": 0.25}, "wiggle2": 40, "durOpen3": 1500, "tapOpen1": 150, "tapOpen3": 150, "tapBack1": 150, "tapBack3": 150, "tapEnter1": 150, "tapEnter3": 150}, "vectors": {"B": {"T": [0, 100, 170, 300, 500, 800, 1200, 1600, 2200], "open": {"duration": 4460, "s": [{"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[201.72, 415.88, 1.15, 1, 1], [180.7, 490.4, 0, 1.01, 1], [201.55, 560.25, 3.84, 1, 1], [221.13, 621.11, -7.07, 1, 1], [199.9, 676.04, -5.61, 1, 1]], "intro": 0.96, "stu": 0, "tut": 0}, {"b": [[208.33, 299.34, 21.62, 1, 1], [180.7, 490.4, 0, 1.61, 1], [207.09, 645.1, 15.77, 1, 1], [230.4, 738.8, -27.04, 1, 1], [194.67, 786.57, -29.06, 1, 1]], "intro": 0.67, "stu": 0, "tut": 0}, {"b": [[218.5, 142.14, 53.12, 1, 1], [180.7, 490.4, 0, 4.69, 0.93], [215.62, 759.56, 34.13, 1, 1], [244.67, 897.55, -57.76, 1, 1], [186.63, 935.68, -65.15, 1, 1]], "intro": 0.22, "stu": 0, "tut": 0}, {"b": [[233.77, -51.17, 100.36, 1, 1], [180.7, 490.4, 0, 6.28, 0.27], [228.41, 900.31, 61.67, 1, 1], [266.07, 1092.78, -103.83, 1, 1], [174.58, 1119.03, -119.28, 1, 1]], "intro": 0, "stu": 0.32, "tut": 0}, {"b": [[254.11, -246.34, 163.35, 1, 0.3], [180.7, 490.4, 0, 6.4, 0], [245.45, 1042.42, 98.39, 1, 0.3], [294.6, 1289.88, -165.27, 1, 0.3], [158.5, 1304.15, -191.45, 1, 0.3]], "intro": 0, "stu": 0.98, "tut": 0}, {"b": [[272.34, -375.32, 219.77, 1, 0], [180.7, 490.4, 0, 6.4, 0], [260.73, 1136.33, 131.29, 1, 0], [320.16, 1420.13, -220.3, 1, 0], [144.1, 1426.49, -256.1, 1, 0]], "intro": 0, "stu": 1, "tut": 0.4}, {"b": [[272.34, -375.32, 219.77, 1, 0], [180.7, 490.4, 0, 6.4, 0], [260.73, 1136.33, 131.29, 1, 0], [320.16, 1420.13, -220.3, 1, 0], [144.1, 1426.49, -256.1, 1, 0]], "intro": 0, "stu": 1, "tut": 1}]}, "back": {"duration": 1410, "s": [{"b": [[272.34, -375.32, 219.77, 1, 0], [180.7, 490.4, 0, 1, 0], [260.73, 1136.33, 131.29, 1, 0], [320.16, 1420.13, -220.3, 1, 0], [144.1, 1426.49, -256.1, 1, 0]], "intro": 0, "stu": 1, "tut": 1}, {"b": [[272.34, -375.32, 219.77, 1, 0], [180.7, 490.4, 0, 1, 0], [260.73, 1136.33, 131.29, 1, 0], [320.16, 1420.13, -220.3, 1, 0], [144.1, 1426.49, -256.1, 1, 0]], "intro": 0, "stu": 1, "tut": 1}, {"b": [[271.2, -362.38, 216.23, 1, 0.04], [180.7, 490.4, 0, 1, 0], [260.73, 1136.33, 131.29, 1, 0], [320.16, 1420.13, -220.3, 1, 0], [144.1, 1426.49, -256.1, 1, 0]], "intro": 0, "stu": 0.96, "tut": 0.96}, {"b": [[242.41, -36.82, 127.12, 1, 0.72], [180.7, 490.4, 0, 1, 0.36], [260.47, 1133.82, 130.74, 1, 0.02], [320.16, 1420.13, -220.3, 1, 0], [144.1, 1426.49, -256.1, 1, 0]], "intro": 0, "stu": 0.67, "tut": 0.67}, {"b": [[211.79, 309.52, 32.32, 1, 1], [180.7, 490.4, 0, 1, 0.98], [225.08, 786.04, 54.52, 1, 0.89], [281.51, 1105.32, -137.08, 1, 0.68], [152.26, 1315.66, -219.45, 1, 0.3]], "intro": 0, "stu": 0.22, "tut": 0.22}, {"b": [[201.76, 422.94, 1.27, 1, 1], [180.7, 490.4, 0, 1, 1], [203.44, 573.3, 7.9, 1, 1], [227.61, 666.28, -21.02, 1, 1], [193.14, 760.62, -35.93, 1, 1]], "intro": 0.56, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [220, 604.38, -4.65, 1, 1], [200.39, 662.2, -3.39, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}]}, "enter": {"duration": 1706.39, "s": [{"b": [[364.32, 7.6, -32.51, 1, 0], [228.66, 75.25, -72.38, 1, 0], [200.7, 546.4, 2, 0.88, 0], [-49.52, 897.57, 53.95, 1, 0], [-69.44, 1068.19, -48.94, 1, 0]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[364.32, 7.6, -32.51, 1, 0], [228.66, 75.25, -72.38, 1, 0], [200.7, 546.4, 2, 0.88, 0], [-49.52, 897.57, 53.95, 1, 0], [-69.44, 1068.19, -48.94, 1, 0]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[364.32, 7.6, -32.51, 1, 0], [228.66, 75.25, -72.38, 1, 0], [200.7, 546.4, 2, 0.88, 0], [-49.52, 897.57, 53.95, 1, 0], [-69.44, 1068.19, -48.94, 1, 0]], "intro": 0.04, "stu": 0, "tut": 0}, {"b": [[364.32, 7.6, -32.51, 1, 0], [228.66, 75.25, -72.38, 1, 0], [200.7, 546.4, 2, 0.88, 0], [-49.52, 897.57, 53.95, 1, 0], [-69.44, 1068.19, -48.94, 1, 0]], "intro": 0.33, "stu": 0, "tut": 0}, {"b": [[364.32, 7.6, -32.51, 1, 0], [228.66, 75.25, -72.38, 1, 0], [200.7, 546.4, 2, 0.88, 0], [-49.52, 897.57, 53.95, 1, 0], [-69.44, 1068.19, -48.94, 1, 0]], "intro": 0.78, "stu": 0, "tut": 0}, {"b": [[338.78, 74.29, -27.75, 1, 0.32], [200.78, 316.57, -30.31, 1, 0.88], [200.7, 546.4, 2, 0.96, 0.92], [119.17, 712.3, 17.64, 1, 0.91], [36.47, 907.38, -30.53, 1, 0.69]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[210.63, 408.98, -3.85, 1, 1], [181.72, 481.57, -1.54, 1, 1], [200.7, 546.4, 2, 1, 1], [214.75, 607.34, -2.93, 1, 1], [191.16, 672.49, -3.66, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[201.07, 433.93, -2.07, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}]}}, "C": {"T": [0, 100, 170, 300, 500, 800, 1200, 1600, 2200], "open": {"duration": 4384.7, "s": [{"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.96, 489.29, -0.2, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 0.97, "stu": 0, "tut": 0}, {"b": [[200.06, 437.99, -6.5, 1, 1], [193.13, 437.71, -9.39, 1.02, 0.94], [183.49, 549.49, -2.54, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 0.74, "stu": 0.03, "tut": 0}, {"b": [[198.65, 501.75, -13.79, 1, 1], [229.37, 284.04, -36.76, 1.04, 0.47], [145.44, 613.25, -10.5, 1, 1], [215.84, 629.44, -16.03, 1, 1], [207.19, 663.37, -8.56, 1, 1]], "intro": 0.4, "stu": 0.3, "tut": 0}, {"b": [[197.74, 751.69, -46.71, 1, 1], [270.82, 108.33, -58, 1.07, 0], [120.95, 863.19, -45.23, 1, 1], [212.67, 823.02, -61.99, 1, 1], [221.05, 800.6, -46.66, 1, 1]], "intro": 0, "stu": 0.7, "tut": 0}, {"b": [[197.38, 1372.94, -98.76, 1, 1], [270.28, 110.6, -58, 1.06, 0], [110.97, 1484.44, -100.27, 1, 1], [211.38, 1369.14, -149.34, 1, 1], [226.7, 1271.59, -140.76, 1, 1]], "intro": 0, "stu": 1, "tut": 0}, {"b": [[197.28, 2323.35, -154.4, 1, 1], [254.61, 177.06, -55.82, 1.03, 0], [108.49, 2434.85, -159.07, 1, 1], [211.06, 2244.42, -244.64, 1, 1], [228.1, 2071.74, -246.19, 1, 1]], "intro": 0, "stu": 1, "tut": 0.28}, {"b": [[197.26, 4366.14, -239.21, 1, 1], [257.5, 164.8, -58, 1, 0], [107.78, 4477.64, -248.7, 1, 1], [210.97, 4174.5, -390.65, 1, 1], [228.5, 3889.12, -408.97, 1, 1]], "intro": 0, "stu": 1, "tut": 1}]}, "back": {"duration": 1350, "s": [{"b": [[96.11, 917.38, -46.69, 1, 1], [96.24, 968.57, -11.31, 1, 1], [269.88, 988.9, 28.25, 1, 1], [237.48, 1007.68, 13.93, 1, 1], [344.06, 1009.95, -41.77, 1, 1]], "intro": 0, "stu": 1, "tut": 1}, {"b": [[96.11, 917.38, -46.69, 1, 1], [96.24, 968.57, -11.31, 1, 1], [269.88, 988.9, 28.25, 1, 1], [237.48, 1007.68, 13.93, 1, 1], [344.06, 1009.95, -41.77, 1, 1]], "intro": 0, "stu": 1, "tut": 1}, {"b": [[96.11, 917.38, -46.69, 1, 1], [96.24, 968.57, -11.31, 1, 1], [269.88, 988.9, 28.25, 1, 1], [237.48, 1007.68, 13.93, 1, 1], [341.71, 1004.2, -41.12, 1, 1]], "intro": 0, "stu": 0.94, "tut": 0.94}, {"b": [[96.11, 917.38, -46.69, 1, 1], [96.24, 968.57, -11.31, 1, 1], [268.19, 978.08, 27.61, 1, 1], [233.56, 918.26, 9.98, 1, 1], [276.81, 844.86, -23.12, 1, 1]], "intro": 0, "stu": 0.52, "tut": 0.52}, {"b": [[124.19, 787.86, -34.69, 1, 1], [139.72, 722.42, -5.49, 1, 1], [220.24, 671.4, 9.42, 1, 1], [222.22, 659.34, -1.46, 1, 1], [208.69, 677.63, -4.22, 1, 1]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[198.9, 443.21, -2.77, 1, 1], [181.28, 487.11, 0.08, 1, 1], [199.69, 539.92, 1.62, 1, 1], [219.44, 596.06, -4.26, 1, 1], [199.11, 654.1, -1.56, 1, 1]], "intro": 0.82, "stu": 0, "tut": 0}, {"b": [[201.05, 433.29, -1.85, 1, 1], [180.83, 489.66, 0.02, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}]}, "enter": {"duration": 1592.79, "s": [{"b": [[11.89, 255.47, -17.87, 1, 0], [-17.7, 332.84, -14.9, 1, 0], [428.85, 546.4, -14.05, 1, 0], [80.7, 751.01, -30.6, 1, 0], [-5.79, 890.58, 10.9, 1, 0]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[11.89, 255.47, -17.87, 1, 0], [-17.7, 332.84, -14.9, 1, 0], [428.85, 546.4, -14.05, 1, 0], [80.7, 751.01, -30.6, 1, 0], [-5.79, 890.58, 10.9, 1, 0]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[11.89, 255.47, -17.87, 1, 0], [-17.7, 332.84, -14.9, 1, 0], [428.85, 546.4, -14.05, 1, 0], [80.7, 751.01, -30.6, 1, 0], [-2.89, 887.31, 10.71, 1, 0.01]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[49.82, 291.52, -14.68, 1, 0.1], [-7.65, 340.81, -14.14, 1, 0.03], [428.51, 546.4, -14.03, 1, 0], [128.64, 699.58, -21.43, 1, 0.19], [98.47, 773.15, 4.38, 1, 0.3]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[181.13, 416.3, -3.65, 1, 0.65], [141.57, 459.33, -2.94, 1, 0.55], [264.87, 546.4, -2.51, 1, 0.47], [212.47, 609.66, -5.38, 1, 0.72], [198.03, 661.01, -1.83, 1, 0.78]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[204.39, 438.4, -1.69, 1, 0.97], [185.57, 494.27, 0.37, 1, 0.95], [194.5, 546.4, 2.44, 1, 0.94], [221.84, 599.6, -3.59, 1, 0.98], [203, 655.41, -2.14, 1, 0.99]], "intro": 0.27, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 0.69, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}]}}, "D": {"T": [0, 100, 170, 300, 500, 800, 1200, 1600, 2200], "open": {"duration": 4641.76, "s": [{"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.41, 487.51, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 0.97, "stu": 0, "tut": 0}, {"b": [[200.14, 437.2, -6.06, 1, 1], [170.79, 393.83, 0, 1.03, 1], [185.52, 548.7, -2.09, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 0.76, "stu": 0, "tut": 0}, {"b": [[198.74, 492.82, -12.71, 1, 1], [153.77, 244.75, 0, 1.05, 1], [147.84, 604.32, -9.34, 1, 1], [216.15, 623.82, -14.85, 1, 1], [205.83, 661.06, -7.21, 1, 1]], "intro": 0.43, "stu": 0, "tut": 0}, {"b": [[197.8, 715.37, -42.76, 1, 1], [142.53, 169.94, 0, 1.03, 1], [122.56, 826.87, -41.06, 1, 1], [212.88, 792.86, -55.36, 1, 1], [220.14, 776.6, -39.98, 1, 1]], "intro": 0, "stu": 0.11, "tut": 0}, {"b": [[197.4, 1271.79, -91.52, 1, 1], [139.9, 162.78, 0, 1, 1], [111.64, 1383.29, -92.61, 1, 1], [211.47, 1277.94, -137.03, 1, 1], [226.32, 1190.33, -127.39, 1, 1]], "intro": 0, "stu": 1, "tut": 0}, {"b": [[197.29, 2125.01, -144.13, 1, 1], [139.75, 163.6, 0, 1, 0], [108.73, 2236.51, -148.21, 1, 1], [211.09, 2059.81, -226.99, 1, 1], [227.96, 1900.86, -226.6, 1, 1]], "intro": 0, "stu": 1, "tut": 0.14}, {"b": [[197.26, 3961.31, -224.56, 1, 1], [139.75, 163.6, 0, 1, 0], [107.82, 4072.81, -233.22, 1, 1], [210.97, 3789.1, -365.41, 1, 1], [228.48, 3523.14, -380.79, 1, 1]], "intro": 0, "stu": 1, "tut": 0.87}]}, "back": {"duration": 1350, "s": [{"b": [[96.11, 917.38, -46.69, 1, 1], [96.24, 968.57, -11.31, 1, 1], [269.88, 988.9, 28.25, 1, 1], [237.48, 1007.68, 13.93, 1, 1], [344.06, 1009.95, -41.77, 1, 1]], "intro": 0, "stu": 1, "tut": 1}, {"b": [[96.11, 917.38, -46.69, 1, 1], [96.24, 968.57, -11.31, 1, 1], [269.88, 988.9, 28.25, 1, 1], [237.48, 1007.68, 13.93, 1, 1], [344.06, 1009.95, -41.77, 1, 1]], "intro": 0, "stu": 1, "tut": 1}, {"b": [[96.11, 917.38, -46.69, 1, 1], [96.24, 968.57, -11.31, 1, 1], [269.88, 988.9, 28.25, 1, 1], [237.48, 1007.68, 13.93, 1, 1], [341.71, 1004.2, -41.12, 1, 1]], "intro": 0, "stu": 0.94, "tut": 0.94}, {"b": [[96.11, 917.38, -46.69, 1, 1], [96.24, 968.57, -11.31, 1, 1], [268.19, 978.08, 27.61, 1, 1], [233.56, 918.26, 9.98, 1, 1], [276.81, 844.86, -23.12, 1, 1]], "intro": 0, "stu": 0.52, "tut": 0.52}, {"b": [[124.19, 787.86, -34.69, 1, 1], [139.72, 722.42, -5.49, 1, 1], [220.24, 671.4, 9.42, 1, 1], [222.22, 659.34, -1.46, 1, 1], [208.69, 677.63, -4.22, 1, 1]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[198.9, 443.21, -2.77, 1, 1], [181.28, 487.11, 0.08, 1, 1], [199.69, 539.92, 1.62, 1, 1], [219.44, 596.06, -4.26, 1, 1], [199.11, 654.1, -1.56, 1, 1]], "intro": 0.82, "stu": 0, "tut": 0}, {"b": [[201.05, 433.29, -1.85, 1, 1], [180.83, 489.66, 0.02, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}]}, "enter": {"duration": 1592.79, "s": [{"b": [[11.89, 255.47, -17.87, 1, 0], [-17.7, 332.84, -14.9, 1, 0], [428.85, 546.4, -14.05, 1, 0], [80.7, 751.01, -30.6, 1, 0], [-5.79, 890.58, 10.9, 1, 0]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[11.89, 255.47, -17.87, 1, 0], [-17.7, 332.84, -14.9, 1, 0], [428.85, 546.4, -14.05, 1, 0], [80.7, 751.01, -30.6, 1, 0], [-5.79, 890.58, 10.9, 1, 0]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[11.89, 255.47, -17.87, 1, 0], [-17.7, 332.84, -14.9, 1, 0], [428.85, 546.4, -14.05, 1, 0], [80.7, 751.01, -30.6, 1, 0], [-2.89, 887.31, 10.71, 1, 0.01]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[49.82, 291.52, -14.68, 1, 0.1], [-7.65, 340.81, -14.14, 1, 0.03], [428.51, 546.4, -14.03, 1, 0], [128.64, 699.58, -21.43, 1, 0.19], [98.47, 773.15, 4.38, 1, 0.3]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[181.13, 416.3, -3.65, 1, 0.65], [141.57, 459.33, -2.94, 1, 0.55], [264.87, 546.4, -2.51, 1, 0.47], [212.47, 609.66, -5.38, 1, 0.72], [198.03, 661.01, -1.83, 1, 0.78]], "intro": 0, "stu": 0, "tut": 0}, {"b": [[204.39, 438.4, -1.69, 1, 0.97], [185.57, 494.27, 0.37, 1, 0.95], [194.5, 546.4, 2.44, 1, 0.94], [221.84, 599.6, -3.59, 1, 0.98], [203, 655.41, -2.14, 1, 0.99]], "intro": 0.27, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 0.69, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}]}, "focus": {"duration": 1270.61, "s": [{"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [179.96, 490.14, -0.62, 1, 1], [196.69, 546.8, 6.1, 1, 1], [231.08, 607.24, -10.91, 1, 1], [190.77, 672.58, -12.21, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[236.65, 475.28, -9.98, 1, 1], [160.79, 551.64, -16.12, 1, 1], [184.67, 632.8, 17.54, 1, 1], [247.82, 717.74, -32.62, 1, 1], [181.64, 807.58, -45.86, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[259.6, 793.28, -43.97, 1, 1], [151.16, 906.39, -72.9, 1, 1], [178.64, 1024.3, 62.38, 1, 1], [256.22, 1145.99, -97, 1, 1], [177.05, 1272.57, -126.55, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[266.21, 1707.28, -100.98, 1, 1], [148.38, 1869.39, -163.28, 1, 1], [176.9, 2036.3, 130.92, 1, 1], [258.64, 2206.99, -194.05, 1, 1], [175.73, 2382.57, -246.57, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[267.28, 3181.27, -160.96, 1, 1], [147.93, 3392.39, -257.43, 1, 1], [176.62, 3608.3, 201.8, 1, 1], [259.03, 3827.99, -293.86, 1, 1], [175.52, 4052.58, -369.48, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[267.48, 6442.28, -251.64, 1, 1], [147.85, 6726.89, -399.58, 1, 1], [176.57, 7016.3, 308.7, 1, 1], [259.1, 7309.49, -444.28, 1, 1], [175.48, 7607.57, -554.61, 1, 1]], "intro": 1, "stu": 0, "tut": 0}]}, "blur": {"duration": 1580, "s": [{"b": [[200.7, 960, -2, 1, 1], [180.7, 972, 0, 1, 1], [200.7, 984, 2, 1, 1], [219.7, 996, -4, 1, 1], [200.7, 1008, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 960, -2, 1, 1], [180.7, 972, 0, 1, 1], [200.7, 984, 2, 1, 1], [219.7, 996, -4, 1, 1], [200.7, 1008, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 960, -2, 1, 1], [180.7, 972, 0, 1, 1], [200.7, 984, 2, 1, 1], [219.7, 996, -4, 1, 1], [200.7, 1008, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 960, -2, 1, 1], [180.7, 972, 0, 1, 1], [200.7, 984, 2, 1, 1], [219.7, 987.68, -4, 1, 1], [200.7, 961.35, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 854.95, -2, 1, 1], [180.7, 797.53, 0, 1, 1], [200.7, 756.86, 2, 1, 1], [219.7, 737.71, -4, 1, 1], [200.7, 740.02, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 465.96, -2, 1, 1], [180.7, 503.56, 0, 1, 1], [200.7, 549.71, 2, 1, 1], [219.7, 600.45, -4, 1, 1], [200.7, 654.79, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 431.72, -2, 1, 1], [180.7, 488.27, 0, 1, 1], [200.7, 545.05, 2, 1, 1], [219.7, 601.1, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 434.9, -2, 1, 1], [180.7, 490.4, 0, 1, 1], [200.7, 546.4, 2, 1, 1], [219.7, 601.9, -4, 1, 1], [200.7, 658, -2, 1, 1]], "intro": 1, "stu": 0, "tut": 0}]}, "send": {"duration": 2320, "s": [{"b": [[200.7, 1100, -2, 1, 0], [180.7, 1100, 0, 1, 0], [200.7, 1100, 2, 1, 0], [219.7, 1100, -4, 1, 0], [200.7, 1100, -2, 1, 0]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 1100, -2, 1, 0], [180.7, 1100, 0, 1, 0], [200.7, 1100, 2, 1, 0], [219.7, 1100, -4, 1, 0], [200.7, 1100, -2, 1, 0]], "intro": 1, "stu": 0, "tut": 0}, {"b": [[200.7, 1100, -2, 1, 0], [180.7, 1100, 0, 1, 0], [200.7, 1100, 2, 1, 0], [219.7, 1100, -4, 1, 0], [200.7, 1100, -2, 1, 0]], "intro": 0.96, "stu": 0, "tut": 0}, {"b": [[200.7, 1100, -2, 1, 0], [180.7, 1100, 0, 1, 0], [200.7, 1100, 2, 1, 0], [219.7, 1100, -4, 1, 0], [200.7, 1100, -2, 1, 0]], "intro": 0.67, "stu": 0, "tut": 0}, {"b": [[200.7, 1100, -2, 1, 0], [180.7, 1100, 0, 1, 0], [200.7, 1100, 2, 1, 0], [219.7, 1100, -4, 1, 0], [200.7, 1100, -2, 1, 0]], "intro": 0.22, "stu": 0, "tut": 0}, {"b": [[200.7, 1100, -2, 1, 0], [180.7, 1100, 0, 1, 0], [200.7, 1100, 2, 1, 0], [219.7, 1100, -4, 1, 0], [200.7, 1100, -2, 1, 0]], "intro": 0, "stu": 0.85, "tut": 0}, {"b": [[200.7, 1100, -2, 1, 0], [180.7, 1100, 0, 1, 0], [200.7, 1100, 2, 1, 0], [219.7, 1100, -4, 1, 0], [200.7, 1100, -2, 1, 0]], "intro": 0, "stu": 1, "tut": 0.13}, {"b": [[200.7, 1100, -2, 1, 0], [180.7, 1100, 0, 1, 0], [200.7, 1100, 2, 1, 0], [219.7, 1100, -4, 1, 0], [200.7, 1100, -2, 1, 0]], "intro": 0, "stu": 1, "tut": 0.8}, {"b": [[200.7, 1100, -2, 1, 0], [180.7, 1100, 0, 1, 0], [200.7, 1100, 2, 1, 0], [219.7, 1100, -4, 1, 0], [200.7, 1100, -2, 1, 0]], "intro": 0, "stu": 1, "tut": 1}]}}}}
````
````html motion:screen-html
  <div id="phone">
    <div id="touch"></div>

    <div id="status">
      <span class="time">9:41</span>
      <svg style="right:17px;top:22px" width="64" height="12" viewBox="0 0 64 12" fill="none" xmlns="http://www.w3.org/2000/svg"><rect opacity="0.35" x="42.5" y="0.5" width="18.89" height="10.33" rx="2.17" stroke="#3A3A3A"/><path opacity="0.4" d="M62.8 3.67V7.67C63.53 7.33 64 6.54 64 5.67C64 4.79 63.53 4.01 62.8 3.67Z" fill="#3A3A3A"/><rect x="43.81" y="2" width="16.28" height="7.33" rx="1.33" fill="#3A3A3A"/><path d="M27.33 8.43C28.58 7.34 30.42 7.34 31.67 8.43C31.73 8.48 31.77 8.57 31.77 8.65C31.77 8.74 31.74 8.82 31.68 8.88L29.72 10.91C29.66 10.97 29.58 11 29.5 11C29.42 11 29.34 10.97 29.28 10.91L27.32 8.88C27.26 8.82 27.23 8.74 27.23 8.65C27.23 8.57 27.27 8.48 27.33 8.43ZM24.71 5.73C27.41 3.17 31.59 3.17 34.29 5.73C34.35 5.79 34.39 5.87 34.39 5.96C34.39 6.05 34.35 6.13 34.29 6.19L33.16 7.36C33.04 7.48 32.86 7.48 32.74 7.37C31.85 6.55 30.7 6.09 29.5 6.09C28.31 6.09 27.15 6.55 26.27 7.37C26.15 7.48 25.96 7.48 25.84 7.36L24.71 6.19C24.65 6.13 24.62 6.05 24.62 5.96C24.62 5.87 24.65 5.79 24.71 5.73ZM22.09 3.04C26.23 -1.01 32.77 -1.01 36.91 3.04C36.97 3.1 37 3.18 37 3.27C37 3.35 36.97 3.44 36.91 3.5L35.77 4.67C35.66 4.79 35.47 4.79 35.35 4.67C33.77 3.14 31.68 2.28 29.5 2.28C27.32 2.28 25.23 3.14 23.65 4.67C23.53 4.79 23.34 4.79 23.23 4.67L22.09 3.5C22.03 3.44 22 3.35 22 3.27C22 3.18 22.03 3.1 22.09 3.04Z" fill="#3A3A3A"/><path d="M1.88 6.67C2.4 6.67 2.82 7.11 2.82 7.67V9.67C2.82 10.22 2.4 10.67 1.88 10.67H0.94C0.42 10.67 0 10.22 0 9.67V7.67C0 7.11 0.42 6.67 0.94 6.67H1.88ZM6.27 4.67C6.79 4.67 7.22 5.11 7.22 5.67V9.67C7.22 10.22 6.79 10.67 6.27 10.67H5.33C4.81 10.67 4.39 10.22 4.39 9.67V5.67C4.39 5.11 4.81 4.67 5.33 4.67H6.27ZM10.67 2.33C11.19 2.33 11.61 2.78 11.61 3.33V9.67C11.61 10.22 11.19 10.67 10.67 10.67H9.73C9.21 10.67 8.78 10.22 8.78 9.67V3.33C8.78 2.78 9.21 2.33 9.73 2.33H10.67ZM15.06 0C15.58 0 16 0.45 16 1V9.67C16 10.22 15.58 10.67 15.06 10.67H14.12C13.6 10.67 13.18 10.22 13.18 9.67V1C13.18 0.45 13.6 0 14.12 0H15.06Z" fill="#3A3A3A"/></svg>
    </div>

    <div id="header">
      <button class="ibtn" aria-label="Menu">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_12323_111)"><path d="M16.94 11.94H3.06" stroke="#3A3A3A" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.17 15.83H3.06" stroke="#3A3A3A" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.94 8.06H3.06" stroke="#3A3A3A" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.94 4.17H3.06" stroke="#3A3A3A" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_12323_111"><rect width="20" height="20" fill="white"/></clipPath></defs></svg>
      </button>
      <h1>AI-Tutor</h1>
      <button class="ibtn" id="newChat" aria-label="New chat">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_12323_127)"><path d="M10 18.06C14.45 18.06 18.06 14.45 18.06 10C18.06 5.55 14.45 1.94 10 1.94C5.55 1.94 1.94 5.55 1.94 10C1.94 14.45 5.55 18.06 10 18.06Z" stroke="#3A3A3A" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.39 10H13.61" stroke="#3A3A3A" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 6.39V13.61" stroke="#3A3A3A" stroke-width="1.33" stroke-linecap="round" stroke-linejoin="round"/></g><defs><clipPath id="clip0_12323_127"><rect width="20" height="20" fill="white"/></clipPath></defs></svg>
      </button>
    </div>

    <div id="intro">
      <img id="illu" alt="" width="88" height="88" style="display:block" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALAAAACwCAYAAACvt+ReAAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAsKADAAQAAAABAAAAsAAAAADQXRd2AAAwbklEQVR4Ae2daaxlRfX2D4ri7G1EUQP2IU7/iAkXP4koffuLgENoxeF944e+7fDBoHSDcQBjuJ0gGr/QoIl5g9q3Q2Li3CSCQ6J9VXBKlGtignMfJHGMckSNfxHlfX6793Nct3rvc/YZ9z70Wck+tXftGlZVPbVq1aradU5qLai1srKypGpYeuCBB9qxOv7zn/90H/nIR3Y2Nja60X8W9w8++CC83Klr/0knnXRgFnnOYx4nzyPTo/IMUAXS5X//+9/LD3vYw85ROssA5f777wfAhaR3rRe96EUtgWhTYTu6vvHwhz988/bbb98ojDAhz8OHDy+feuqpSz/+8Y93K/8l5b+dpJX/3bq6z3ve8zp33XVX59vf/vbmhLKcy2ROmkuuh2D6xS9+8Yok6Q4BYEUNv6yoW8D6+Mc/vvW4xz2u9bSnPS1zuTf97ne/y25//vOft/7617/a225XNxu6bpGUPjwJKQ2v4nG3rl1Kdwufei6jLp1LZbxF7saJBuiHHICRspKau9SYO1IgANZzzz03uwDss571rAy4ZciI/gD4F7/4RQsw33nnndkVQa381nUdGlYy5/zuVV77dPVAC3/PfvazW0996lN7ncv8/Pa3v2397W9/y/j54Q9/aG+7HYCsst8wLpjh7bTTTltVfpcovbY66rmT6KhmdBLuQwLAiZRdiRUDYC+44IIMtABikgSQb7vttgzMgAoSeFA1AM965lHyUwRc8/qSl7ykcsciefj45je/2frWt77VMh95thmYpS7dgtoj8HVy/1Ln6quvXj5y5MiK1JdL7r333mUFdKfqCMA7q6RRmvgUXswlgAdJWQAAGHCRurMggPyJT3wiAqijfPer0dXmW4GTd7iDet/W1XrZy16WXfA8LjFCGMzcJ5SpG9u2bes+5SlP6fLupz/9aUvPSwJrGykrLwM2qzuPMowwd9xxxx7iNInmCsAvfOEL25IkB1XRK7ESafgXvOAFPfUgvpv1vaUygDbR+EhBScjDmpBdI/813sH3e9/73qGkLfGqEtIYfpDMgDmRzsclQ2dHZYEvRi3mA1dddVUWTx3xrLQjHpdADR5zBeB3vvOdByUFVqnoYaUsjUcjojty7wla2qg0mhsSPZQGfc5znpM15jDtQ7pIZACU5kH6l19+eSZ1h0lz3LBIU8rtOnB6LiduJPj/+Mc/jlrUSOkLr3MDYEndpfPPPx+7aPuzn/3sQKnF5IZJF+7m5maRFSG21cB7GpdJH5IJF1BXJaTxpz/96awDkc6HP/zhgfxXTXua4V7zmtdknU8drqv6B/iZeqFO3j355JM7Z5555jekghyoUzLPhR0YnVfg3aXGaqMvppLCjQhYv/SlL2VDpnU33iHxmMDFWT1pIG25IkXJjOSkE+B6CGY4hoj/gQ98IEszxi+6R71BmkHzAl46nUcO1WUGXNe7/Hle7na7y5LO2NN3UrY6qPEAPu+88/bKLLamyskq8Y1vfOOWemI4/NSnPtX6zGc+05OyANZ6HO4w1gc3EvEi0SEAMxMk1AIAzVUlbYOhX+eLeTXh3h3ugx/84HHmRkaTG264IWOT+QgCRlK4WwffjQbwm970pl1abTrgigFUBhh+73//+zMzVnwPSKZhfXCnMLABNH6DCInuCV3a+QbFret97HDUZSTKA4Ah1Ck6tATMPj2u4TdrajSABd5M6rpSIgCQvEhCQPS6172u9drXvrYvoKh0VAxPYpwmLhM1VAmkKQCtMmmrAl7SjmCInY93TSVLX3fWyCejHaoFgoL2AMCivZLC63Xowo2exMnkdFSV06aGANf6+jq3PbKeC5gANAD1rB+gYqLyEH/hhRdmYXqR+9wU5dUneOkreLj00kuz91UmnqUJzfAFHY6RzUQdAlaoqDxBnahloaOxEljgXVWdtXVlhJRNSROITMJZL03fG+D4A35AjrRNpScShcYZRq9N8yp6xgQFzaPu6/LESa7Lg+T1aEK7UG8CfvuUU065U+12TDlutQ6Pu5RtHvq5jZTALFjI8H9EjLdhnspCgpmQtAxzSFsTYRjyfLmC/X7WbpG0GpaHn/3sZ71RAyANY7obNi/Cp9I31rvLg1+RJWXPnj0t+I2kxY9t057cNVICC7y7VRFtV0bUffF7+9vfnr2y/mvQOnwTXEurYaUvQEHPxBwYRxDK5E6Kvj8NMFv3df3Fend5ovR1OHhOwavRUdidvmWicQBG+qpiVl05NJp1MPt5+bVokuEwdbo0KNIMiiAYxBP6JCCyhYPyUX6INBl5UHdImzqRlSZTiQalW+U9aZK2KdZ7riJkvKRtQXiD23FxZV47FJ+ndd84AA+SvlREUSVOq4JGSddmJvg0AAelA3ANBPRKgJ/q6gCbhRTCAjhUqI985CMTAXEqfS+++OIeyzfeeGN2X9QZY2ftRWi12Gi/Hp6ndvuwqaU8QsK59MWmmFGUAvZrukuD5qalytLX4AWwAHLv3r3HgZdy855OwYQUGywS89prrx27SugUUfqSoIUEZUHyl7WFO13CxP7keWqPjQJwLn17tt8oBaZWAxNO2ENxVekLOAAB4Dx48GA2CY0sASysJ5GY0FmNQgqTxjjkEcNpRN6bLH3htzEqRKr7wpylAPeDiIZmiEUCpg1OXMxnUJVFiizgiD8AGCoabouSZEYPsTstqhtRH+Y9dRF1XkCMqsGSLhKU/RajUFEHMO/ujE2VvpS3MQA+44wzdv/mN79puxGiFLCfXQDK0MbkggYAtOmM3WGLXKQdO8q88sZwPAlyg/fjPeYD/8zemazFzmqVgrDwaD2T8KgPJk9i8R+VUt2XpWN3JL8zoGMe5in66X5muq/zbQyABd5VM4WbVhrDJGBF2qQNBiBpaC7I0jZ7yH8AvaUz8UmLC0nH0D0Js1S/Bo+8+B5+IAORe3izSsFuN94xurCxnHd0EoPd5XU6xB+GKH+qfnjByJ0x7VxOn/cFNDPd13k3AsDpqlsqwd72trdlYDPTSAgkBQ1IBVti+H0VFzDQ8IBjEuB1g0cJNogPjxrscjMg6KAQKoWB7SEcdQF+I/Eu9Yvv+907T4chLasi/Toj9ZbGVRozl77w3QgAiw8+s+kRhnoTkhOw0ZhULhO7UQDr9OxGiW2/cVw3uCXYMGmhDtly4XgGr5890bLUtb87gZ+rukUg9Kjnzug6T9P0+8R/5tKX/GsHcCp9qbQoEZmssIyMmmByBQJuLihKIQ+pxOUyAXzvhfBXFfG9ww3rMhSTf5RgVdKwKSyGtToUOymdw+lHfd3lj2FjWv3uU/MXaVg1cWc0oNN0iqQvH6+m4WbxXDuAn/CEJ1xz33339cpaJMEieBli426pXsQKNwAtJUtihn4k/CiAHtTgaZ5+Ji8sC2WEfkra8E0d2GLh8JbaRTq/wxS5VaQvYLY6EdOw8Ih+uj9Ux1ZKeKgVwHxeLvC2YQRCCkQJc8x36y8SGslgqYMLECLw/I6YDLGWVHaZ+cdPhTw5IjwNh5pS1Hi8TwkwADTytARLw1R9Ji0kIzybP+KSNhO6WC782S8BDZtvKn1Jgzypl0Gd0e+JY5L0Xff9rN1aAby0tLT3z3/+c6/MZUNWL4BuBkmtGJZ7JFeU4PghbU00HB99Is2QdEgYLsACP4PAYTBU4d15lrlM0ixVCeNOUbRZHyCN0nGKpC95ecHC+bJVNaUi6atw63VJX/irDcAsXAi8u1xJbiw/l7lIUUCHTkhj+LkoPGlaOnPPlRLgBtAGNY2EZAMcVlXKQGwwkG466UrzGfRMWoCXtJC21tXTeJSXTsOkDt4JOwy5w8EveVn9IF2kPuWmbtmIT7nj4kmR9H3EIx5Ry+TNZa4NwFo23mJ5KJJgVCoV6klSHFZdgGFddF4aDRWBiVyqKtBoXOjagLkfMG0ZMBiG5SWGp5wQaaWWBvypC/ghTwAGeNGJi8ISvohih/NSdBqOtKlvwEp+dCrahvx4F6lu6Qsvx48TkcMp3SN9BeCjTh5JkG6SRi9dXV11kJ5LWEsOS6mo//YC6oYKp+EtqUkT6Z0SNtfXv/71qffAZ5+bMInPhZxWXFSJHTjuDwbkZQDsx7Q/ggWQ/SaPTgMQW2ID4LTumnBaTy0SON+043rKpA6gjAQobSHApdEM2Bhu2HsawUMlui+gBuAmSzgA7eHV76KLdKKDIK1T3mO4KvceYUgnmhDZuO+N4gAINQe+qIthydKXeACTizQZhdj9ViTJATp5+nipmGcTpC/81AJg5btK5qYi9YHGjOv+DjuuS6MBgDIQIOkADUBGygHQIgIA0CR2zNEZoFgPSF/4oB4MJHgflZwH8d3hyIPOQycuAjBh8Wd0pDNFFaJu3RfeoJkDOF24GCTBqDSuKCXRWy0dGeLQV2kMV7AlCw2FBBlkmjtWFcd+r7vuup7+F/3jvSUmjZvq0DFc1XvSg2Knin5lnahq+oQzgFN1hzozoMvS4z0gRqWjnpsifeF35gBWnn0nb1QQlc2kpuxMMxqajd9UviUhhXFD4A8AuEjLeiXPTEoAnlfiiBeJNJC8XGVkMBQtupTFKfMnLfilo5l/wtqcFkFdlsYg/5gHnR2JS550jKqdA97Qm/MTedqD8pzV+5kCOJW+NE5sNCoae2ScLAA2LpvDqBieIeL6k5qYDu+s2zIMW69ELTAwHB8ehl24gE/yq9r45FVGAAqSVMt4o5ykHSVwWdyq/u7k5OX8HHeYMtBh8znCCotQw55G7zwn6c4UwGqk3ZxyaIo6n/1oQADFsI+UHKT3lUkoAx/JZvKRpoAa6W6bpwEJP4Ma1LPyuOHI6Y/iMuJAdKzYufCDl7Rj4j8MWfoSh7oEhNRJFAjDpAdP1IH+kwMb/sYwcacRdmZmNEnfZRWgtxmBholnPVQtHA0eJfQ4DUw6SCQvXMADjcuBdmVkc1eqS5aFH+TPUI5+j8tF+azvp19pDEqr6L35paOPYnpL04RH0hRt6sPN4c0haYJjPs9SAu+NvBZJX7+nkhhCUQNoULv4lxFAZmIHAKvadJFISBQu0mZ4tHpSlI+l2SQko9OHb66ykcThRnHpnJSLtFG1JkHwivRWu7Qnkd64acwEwOn3blQCIDABUoZzKhzgFgEVsLnyolqBFCU+cbhiuk6/ikva2EP7kXXJSZjO+uUzqXd0SGjUOinj4+lPfzomvqU6j1U1bzMB8KBlY8wzEbRIQaSG9diqCxiAOYLbhZyE644FT5MwndHpOIHHowtSDb0/mgjH4Rs1BKEQhQV5ov9DTGzJcxQaNd4oeQ2KM3UA59J3y6addLg0YGnA5eXlkUE4LfBSiagP0CRMZ3QGVreiLk/athBgcx23k3iyiaoGmK+99tqeZYO8ICRz3KxzzHfwrzvBLI6OGsTN1CdxuensoBmh0vrZWB2uSS4AYHcW0myUiWcsC2kx4gBeOgP1gUTDn07CNa7Oan7Jl07tjsI9ViAkcfQH5FX2RpAeIwb8Q/rHqFep0x3OHmr6mcXBJn0XLmoq91DZWpdMR46hEskDozYAKEDjPQh0DNKmYwNmJDQgG5UsfYlPXqRNXkh20iW/L3/5yz3QotvHOP3ydV0QRv85fX2/sLN4N1UApwsXSBsqb97I9tl+lpOqZWIjERTt0zGuF108TMd3Ve4BKB0gEh3DixD4exJKebBO0GmqgBjJ7rRR+0RtFjS4qYumCmAVau6l76RNZ6effnrW1mUS1pPZUTs6nc1pkJGFhlUU+2VM6AfpbLs3ILau7/fRRUrb0uPRSFIY+35tNDUA5z2z7ZIhcUZtFKdRh8siB2SpNS4PO3bsyJJg0xCgMgFon/tAPY1aVzb1kS5peNTwKGJAO19cwOgNT94zHN9zb3A7zVwCswS+lIad5fPUrBCaLGyRvpOYvc+yYsgLgNkUNa5VwLzTkQERko6JoSUZqgX6KpMrdNVRyAsXjgt43RGsuxrQDoNLOZmcmQAxqgLL5XQswMszacEbri0mjlOXOxUAYzoTgFdcqEnZTp3erFxPbIoafRwevKQLqKxTkh5g9rtR0jdIiUsn4YIGqUHeE5IFzn+IE9WJCF6CGPBq580Yb9b3UwFwunAxr9LXw66l5CQbh07BZQCzWGNpOUo+Hi2ISzqx01mtKFOD/D7mS5sxKjDBo/zEZXQwmW/9sctDC8CDlo1dAU13kUoMn0U64yR5n1Tn8GgBbx7mubdaQT5FapClM2FNlLnfsjqAZzLXhI3tE5/EpdI3SgJX0Dy4lkrzwD8dzRIxVUGsVlidSOve5Yz+/tol+vme9PLO0m3CZ0UTBfBHP/rRtgq64sIylJVVnMM00QUMSBik1jjD+qzKZtMZdR3r22pFWTsUSV94BtQsuERiRGJyl3+RwSrcnjoPNDFvE9WBb7755hUl3Hbi8yC9zGt0PXmJYIjvm3bPH51DqY5rtaKsHWwijOWRmrEhsK7wZQzpepnby9GEleqwUfcSsnmeqARWoj3TGb1+EvodkpBVKSSAL57xnwYhtQBwmdTql+e0eOqXJ9YA6gN+o44by1HUDsSjPiOdeeaZHa3M7ZTfHu5RTWxteO5zn9s9++yzb8DFwlT3Cpz5npgETpeNh124oPEZuqkw7pkBVwEEJjp0NlwaapxtglSKdcaiRnel0bAM2/AKz4AlSihm65EngNVPr3S6o7jmN5Wy9qccgDslv4/+qrv9POd/kbUuoLLKxkJFR1K3I7f16le/uivnGr1DWG3oqpVOmlTuF1100dF40uSgT24AJzNkQIAbAVDEEx0CYAAeLuKXAZxGY/gfBTj+BKeIfyQW+qEXHYr4LPODJ1a7uCYFZvhhWyb1kfLbrxx0OP8JeeCXE9bPCs+Ft2xiv//++4/q5ZIm7Dvr/rBzIhKY4SSCF/AU9XoqHLBa0qY1hO0RSUpc9q9S0YAWfyQMz+nfsKKjEQdgOF1cLshgrqLPelKT8m/gOk14Il1JpZb+26P197//fWAHNE9MguCXDkkacdhP66PoGV6clvlJ+XU5ykZB68ZJ+pn0TfyOe2QPsEZb/tAbKbxb7sZxgWboMREJ/IpXvOIL8aRJSwMPtVR0KmUBKRXMO6QwILXt0f+JQUP7XFyGPKSfJTXxuWhQCNunwUB6NCJ5WkoTlk7QTypz+gzpOS0k7YEDB3qdgXzgySMAz5MggAx/SGbcSM6LMqWS3x03PX7V0tfliOlx7/fBv5L0dXiksM5Fu1e8dfPz0VAraqGxJTALFxG8VCrgsZRwqSy1kJSWDEhUgGlwEdZx8aMBiIe+afONpTH+kDef0NAmeKAzcMEHeZAGYUkXwKRfIsAL4OU9IEdKFdlIAdIwRHrw44NUcCE6FxfppXVVlr7rEP4oA1dKpEWndTnS95bO0V/pHZL6EL363iOFX/nKVx5Sne+WOrFPgdf6Rpjiy7ElsIaTg+JvtYhHKhGwAtqiMx4MPozvHuL37NmTzaotxUnXEgNAAmAoSkfyAey4ZUSjAkga0AQAyNeA5R1S2sByuKquAUa68FL18yhATAfyHmDuISQyaVpN8nM/forqNIZ3XdpP6Xe1uf1cT9LsP8i96aabVnTi0RGFq1UKjwVgpK8UeRT6LYTEsZTlBQ3AlRJbCgFWBCvgQU0woJGsfMJCB/C+VRqc4Z5wgCVdfUrzic/kh5QCzNz3I8BjlaUoHOUkf7v9OlBR/En70al3796ddR4ORkzrnHKjnkXatWvX+rve9a490a/q/fnnn39EevCKwu+XBF+rGm+S4cZSIU4++eS2Tmg5jh8AxlWFaPzY8AA/Eo0AwCP5+Ck3EFLHFNOyHy5hHZ5njP4+nYfnIioDr0FL5+LqpwL06ySWtEV524/0y/hwmNSlDmNZ/T6OPvhRV09+8pP3+/2wrqT2/hzAnEewNmz8SYQfF8Cb0oE6YqQNM0jNIhORG5owJuucReEdpsw1KAyeGA4wTZv6AXZaeVuVGJQ+dVMEXuo7BfATn/jEdalsnUFplr3HhCYpvAGIWQfI7cdlwafiPxaA88+qz5JCv/6nP/1pNw1bNHQVcY6q4ElT0ft+fkgOGgrVAWloKuoofmfQ+zm6luCypmz+4Ac/WHZYdO4iMMS43JdJfYcjjX7p8A6AjkvwjbrFpPXlL3/5FmGSgpe8fvWrX40sfc2rpbBcTGrr9p8797zzzltXL3xQZid1yMF06623PjhM+JiiLApZXOl70Xuke9lxs7TQ56h0NiRdeeWVR+Ht3e9+90hp1hlJdvKsPFqoeFCA7rHCM2XypfIenBTIdJRXVl91LC9PbC+ENjbvY0ZL77dttl8FWWoNq9+RJjoeujN6drprql+eRe8s+dTSLJm23vrWt3aU9k4dn9RllCgx+hcl1Qg/rDSockhjJmyoDpTDo4qZ1Ld5LEZMhO65555MkqsOr5lIgkMkMjEAo0489rGPzSqFChtE1n2ZOY9CDO8Q1gRUh2GI8DQoFx0o70zLMtC3SQcQv+ENb9jD0E76VTrkMPlPOyyqFQccUj6WjK0iOd+zzjprQxagTT+P66L7IrwE4Jlv8jlpXOZjfNkF27IPHqXhsf1Cac+P4dGZCfu5z32ur44Y48R724yj35j3W8xBKsu6yrQbgEddu2oelI2rHzECDArjzt4vnfQdPLNdkhEq7eCqt51vectbNtI44zxLNVlT/GukC2/ccccdO8dJa5i4EwUwGQfbYGU+ypY8ByWAuuIVOoXtDAo/4P0tWhY9oJGklw5qxTve8Y47v/vd77YHxJ2b19u2bdvQ/GPiAKtrk8/EAUxLlinzrEydc845raNHj3Y17HT/+c9/7lKPvR7pNur5td6/oGzPVZoTGxaNSIG4/eY3v3lZOnGmI9s/uqeeeuqS/rS89D16qEci/b3ukiTuE2N87mXFyS77K7+27+2q3nzbcyWd272H5IY/UeeK9PznP//Q+973vrXoN6n7IIXXJYX3TCrdfulMBcD9MozvYq8dVQojgZHEoj112CFjeU70+9ies/oTxIlN4kZpvNyOnE38mCyNQkF/PCj15U5JgdVR0lnEGb8GYnvmm3zGT3RACrUCGN7QO+V0mNCNYrJiORhi0qLhflm3B2WT3pd5Ln5mXgN5e3aV8W4k8rQZqB3Aea99lQraRQoPY9e1zRnwsl/CerT06pnbI6fdUPOSfpDCfLkxdUHy8CZUjAzhv9NHhL8XL7u+973vZSzxbZt6cyF7TIrifl3sntu3b8+ksNbnmQw96pnPfOahTqeDJDhhCImnyd//qC7+5xnPeEb717/+daeOwqvuNx/96Ee/RwBe1v3/Uzv877T4qHUSlxZKK2y7dFwnS5xLtr16ZxW2TIDLxnTUDQgb6tVXX92zOePn/a4C/7ZcGuD9kCasPlKfrtG1khS0q9HoMAeQqC46ybupPrK1QHnvViZbbOuTzrRRAKZw7DFWwdfywheWF+CyZJp+SmO7sOLO1JheyOQMPPNZ//XKapXs3OlZ+GCFk86eU0cHkVyhFdLD9pi2G/aKT3XDe+MA7IrNK2BVz5k+662afD2Rft2BdEZ3tiVD0vesWUsc8z0rF/D+61//OiKpuwxwvTOPUYq6YJTiPu41mfV/WsxCCjcWwAaCgHtnt9tdRpXYt29fb4sgCwNs5qGhWDLNGwqd94oTwR4scyGq1iqbmvztoEcg112BO1VpmOY3CynceADnlXBEldOmglAfolTBD0JtkK7XiPO6jnE0vV90Xn0JcwTJ628BGX0qmiFvUAefunXApdemqCNaQVzR81R04drNaC5omat9CB0tS56r93sAqcDb0X1H95uOs7a2di4bSB7qaoPLK/AyOco+QAXEbFavCF6izcQ+S0bQ3Xffvf/YXevY9sH8YVJO4yVwv4JqGH2Q9wLvWQJ0p1/YeX/nRQEsKyr3vSrPksqd6bns+/VeiyrlnPWJOtaFtWfksI5ggMVbJqXmjfVJUZXKOlHD5CbB6/OOtSnQfEMmQg4Q6Y0cVesGNUo21UyNEng7iseGoGyfMvr/MOAlz/yfhTa4nzaJ32XlcQn5hPNDdsn/Gm3p3DnON3mkOe8A7qgMbc3AlyhMk0gfTO5Wg7VlJWiLrxWBZh/8qeGwzQLiyqBW+F0K3871/7busz2+7MQbhZTeTOqLjieej0jtW8KKxISTDpeff9H+2Mc+dlD87xylDI4z7wDOyqEvDGbSIK60Ku69997bJhzL27aYYJvV1x1LAvWKXlUGtQB3DmlxjgYgIJ33vOc9x21UJ0wV0uoYI0GVoGOF0YrgLq2yZuDlGAMWneIEnHpANUItGjWjhwSAZbhvFIBpFJZRARt7ndOvOXxuBm4VUOeA7x0dS7rpVxbDAEBfI++QJaODKqFvGQ9Pa/Krpexldb7sDA592bIFvOZXe8JXdH/Yz8O6cw1gVU5Hjdv+/ve/3ygAP/DAA8s0RNmnQACQK1I/UDscy+Qs4mB5GIdUZ6tcgEuLIUj3PeOkVxZX6Xd5x4JK2Pa6JbgWV7IwWzyHeJhrAA9RzpkGRbIBjlTy9mOiDNQ0Ph+VIqm9cOO9IP3Sa8I7TVwPy+S3Fxs1S/9hadvsdXS606YfRnHnGsCqnLsBivXNUSpgGnHE0w7STaXssHkZ1KxCmgBxCuqoVzpcVVdHS/2lathhw/nkHs0BVlglLFiEOjSO/gs/cw3gYSt0VuEFYKwPmc466TwnDeonPelJG5PmMaanerhCz3cmpj4+wd//ne9850AMO8r9XANYQMn0J51HsX2Uwk8jTpzAlel9MV8mY0hQpFOV8DGu78cB9U9+8pO9+hRrxzh2avNR4u7N/Q8rjxs0ana1AMNK6li6r/OaawCrEFkl/PGPf3R5ancHTeBgEJ0WeygHwMThHxDz5TY2U5+rMWqBhgD1ivKobNIbhp98z8aq4nS0Q/AKWzsE3mGS6Rt23gGcFU6ftG/rW8oZvvQEDgClxEQs/csCLApcABn9FlBz4YcNucySkaZd5XkQqMlXQ/3QduqyvCVtWaiA9hu8xx4n9zvvAO5QFbIlNkaFkHTJJnCpBYINNz7iiXf8xUG6r5myEI5ZOzojh1UD4qLOgBQHcJ7UERcVBMAjvZHiVSiCmskh+bK3mNEgWD+W1MFWlN5xklogPSxd9oY0L5aK5ddm/8MXv/jF9fT9pJ7nHcBZPej7q6VJVci46QjAx03gkLwGb/ybhKK8AB6Xt0eyUefQoUM9SYzOTFoFJqksOUtx4vN3CVWBTGQADNEB6Az9rB8CdyapNfotK8oWALOELL81OoH4vUL3U6O5BjBGcA3ZLemdjQCwJ3AM/56QATiWfSEA5f/4iC2K1OVLk6guEJa4fF3BX44hiQGYd54BDtJiiZb8INQQOgvpWeIDaB+EGPNM78nL//hp3mOYKKnx18QvK6OO3tr5la98JQZtabJ2BA9NrvfrXWfLywk/NH4/cL/yyhSTTeIE4kYA2BM4VAMTQGJYRhKiNhQRpwsB0pQAMWBi4YJ0DF7S4n+MeW/wEhdQo56gAvh/R7C/Wvqn6cdngA5F3uP7eO+FFP0/3sZLX/rSzfjOqoP8Op///OfX4rtp3M81gGOFCMzt+FzHPRM48o06KwCCAFsZIV0BXUqAl2NSIUDojmAdFYmMdDf4YnyA7a81AP+g8zacRuQ9phfvHVaLID+K/rnqsA8/WR12xnfTup9rAEvidagY627TqqSq6aYTOBoa0AGKKCnT9Pq9j/9ATxqXX355L7oncmX6MOH5o0gInRg1oYwsVdPJZ1F4A/j3v//9Rnwv1YGJG6Ph1KwOMT/u5xrASWHayfPMH5nAkSmHskAGTNRtsxdD/ETgI8VRE0yoEvz1WJFe7TB0DqS49Wn7p66FgHlP38dn9Gxo586dnexGP1IdVuVw8QnYAbkzobkG8KMe9agutZQvBrRnUmMlmTCBkxqTfeKeToLS55IkBnoXSUcsBRHURYlYilvKpmEGTeDS8PmG9K5Pec9VB6Rvq91u71dHztoljTeN57kGsDeC0AA65G/7NCqoappFEzhLXku3qmnFcJbidIIojWOYQfdWUQCw04txrBIMM4ETSDedRq46tOW3/slPfnLd/rNw5xrALFW6ki677LI1DWP8W04mCew/K7doAgfgAB4AKQJOFd4MrkFSdlBaBn8+Wm0J7jwA+iByWE/gVN/LirOqq8MRVoPiT/r93AIYoGoV6EheIXxntqH7tq61Sy655KDcmZLyzz77SYd5dErA6/9BHpYpLAjTJoMy5b0oX4cNE7gv5OFmNnGLfM0lgONKjwpDr98ZC6XNPatROsd307oXgJFEvQmc87H5DCvAsITqYQBjzRhVipMv8SFL4uwh//GkrMoEzuoQE7h8tGufccYZfGO3HtOc1f1cAljDV6YmaMJwQBW3psr6giZQK7HSTjvttF3xedr3TOBQF9IJG1KNVTb0z0G22MgjYGXhArL6MKoUR2oC4DIJS7pFvEd+fI/pTtT9+te/3pW7xsMf/vCHLQIEv1nRXAKYz9WpIOlct+Q6WPaMn0mV6tupu1pWvZ5MynTIKIVzAPTlCSnnVTdAZ9vvKFKcjLyYUrQvwpaJMt4jo1YfNNpwJIDnGrWoDuZrLvdCSPe9W5XY+sc//rGk+44q0+WJ7l6Be7fCdeTJFwDoyXwE+hc9Ewf/lr7JytxRt/sxjCrNfaRVJuHwZxmZ4584y8HLyrZSEBdC6iKlWSZmsgWoWIhAAgNewIZKUQTEYykc/0t4LlSHongGZRnvMUWHVXlRl1Z0oTqsya2N5hLA2sSzLuDuvuuuu66XLXintlMeEjh3h1rsapcUoG0LCFR2Rnr2bUvxs3t9/p65AqLfdbjJgb/FjwepJi3p2Hf7hdxevv2kGFKY9+x7iKACxIALcCB5bSVgcSJuwmH5GKlMfIb7Khve0W1vvPHGjFWPAoHv7Nag7Me74zisnpfwkwrHgX1+XYt7Ui25TiBTn7dFUgLbhsC54mR1f4W/t9L9khq/reXWJY7d10mJSwq/JD16u4CY3esUnSUd4Uqj+HJSQ7neQDMoEgDmi4xUnUDSsugAOIskIqoAAIbKpDjvLMmtcgDeso1E/rfTKryH/+Sjzte14raH/OqkuQUwlSapuSYHCdjWlQFZFbufr2F5HpUAvWbZmZTRHwO2/U9IpAf4w+63ZXntxR+pmG4rxH8Q2bpA/CILQRofEKOK2CKB5ESKA36kN1LXFgf8AG+/pWZvi6zCO2EhpcufVJ47qtqVlmmc57lUIVzgXP9a0zJuW35dr8z5/aiuQNolPeL3ayTMedKlMwBXGYKL+KkC2hgPMLJ8jHT1FxlhaM+CWt+Ne4VjGr4fZQJHXP3Z6H7p6h2nU6c71wB2xfUDmcNMw+XsYkmlTH0pGvKnkSdpAlBvvwS8lsZIcUvjKnkb+EW8I+UBOHo56XLl1BF4D/ihbvchAeA6K1HqRof8R5HAAI9hf1gpHMs7Sr6ObwDHNOCJyaLfOWxw94f72m8XAB6zCaRuLAvEIwF4dXW1p68CIuvBtkzgQgAcfTZIwTG5Phbdq2oRwEwSAS9+5JvuNVZ5UZnWJ8LABBJZAHjMShR4sxW4YaUoIGGyZWBa4lkvLWOL8ACbfcAGeFnYQf5YQdxpCAugbTPGhOeVwJgO5ZUFaJesPIejf133hSsAdTEzb/nKCrIMz1GCVS2DActEK5qw+LzINl50U38hTLruJMQdZlm6iCfnH3m3H9sqbckoiquJ6yVF/nX4LQA8Xq1nAC6aBA1K1mBxXACDNPQz8VlCZiUOvZR3AJ0/d4TGlb7OPwLYiyjk1Q/AksKsZjaCFgAerxlGlsDeARaBiHoA2arAcwo0x4vAG6UITjd2GEt4zHMDdqZtjpLnNOIsADxGrWpCcw7RIwirJudVOFbCOLjaxKQpSr90omXgDQCYkyt13REi74CZjkEHuvXWW3uqTJJIbVsnEz6yx8UkrqhWKvppKF1huB0FTEySvBBhwOJeddVVvdy5tzQGyAY3ICPfccgTuJR3VBaWjOGtgLrye1WBf21eCwCPWPXjTODIkhU1L/HGJWAkLNIRP0tbwgNem7QmpT4UpYMawXkSXumzXiwWOGFyZ12LRtRBES0AXFQr1fxG1n/T5NF1Gb6jPuowgBjpy6ZzD/tlO8scZ5DrjlEEYOICYq/0hQ1EtzQNvPC6ADC1MBplAAZ8thKMlkz/WICMKx601z/G4LcGcFGHSWNbvdHWyc26t06mvPG8AHBRrVTw0wSOzfHZzjD2DSC1sJ8CNoCBbjmunlqBjZGCWJLHCVxZQg7b6XQaY3mIvM71dspYkDrupQevKt9LBOY2K1QpD4AZkPBNHOBuCqiH2UJ54YUXZsX66le/2kisLCRwirohnjWkris4V0tbOpc43ITzIQToHYBaQ/Uyw3Wc0dcNaqsP8DGICIt6pLJsDApb1/sFgCdU85rgdJXURn4dIFlJ5SXprhmo9W9AO/g7sLpBndqV4bOMHFbl+FFZmLr9FwCeYgtIcg0ENf/gjqTjipJ6Wjq1F1CqTOActqkTOJpuAeApArgo6QhqHb6yqTC7+L6Ny2cAA15m/1yTBrUnZQ+FCRz1uwBwEcpm5Jfry9kED4nIogGWCzbtQGytRDL7Q85JgNqHmKQrcEVF9kEq0vXpaI2kBYBrbBZtS9wt/bLFP7nzlTITJiZXAAeAAWqb4rhnq6VBbbUDt0hSI2GJQ3qkxTNhyQP/QeSwTZ7AUYYFgAe15BTf62yKQwJxV5J3WdcSWQEcNviwQILpDRdCrYAAXwSgV8rwIwzxuQB13BxPOlYb6BRM0PycJZz8zMMEDpYbadtL6vKEeGRvhaTxPkm83kEpRQU3UJGsAJxTfNgjwf4Fn8HGlxT6cnhTVo9Dtn4o7eU0PXcS0oySmnCoLXSOM88884omfcSZlmEB4LRGanzGlqyTgu4UC+1h2QCESFZ1gAzQZ5999g033XTTPqcjAG8x6WGzvu+++47Lx6BGAiPF1Sl2SnXZcDpNcxcAbliL5LvcjoitTKUYlT3tHDtr0OYbQP2hD31oRerLiqT1OTprbll//r0lX03gGo2RRjM3auPNe7z8wBRA3KYsSEUsFKgIuEzEkI45cQbc/lNOOWUdqSq9uo1/vkqYB6nuoGpoP/CSjt1avueee7qjplM9x/FCLgA8Xv1NNba+/kUn5jP2dkFGXfkdkqQ9MEjSFsR9yHgtANzwpsyl8VGx2dF1CFeWi46Ohd3Ml6/ldeLSwozW8LbXId7spWht27btR/pOba3h7M6cvcVHnTOv8uEyZLWOGNozsTFczBMj9ALADW9n6cA7YFGHem82nNVa2FsAuJZqr54pVgFCa1PPAsAF1bYAcEGlNMWLhQ3xwrUpSdxtCl9N4mMB4Ca1RsKL/75WE7i7k1eLx7wGFgBuMBS0KLECe4sJXHkjLQBcXjdNeJMdXbWYwJU3xQLA5XXThDfLMMGiRROYaSIPCwA3sVXEUz6Ba+t2seLWp40WAO5TOXW+0rZK9kBAiwncsXoo/F0AuLBa6vVk/4M4WMu52J67C6egBhYALqiUur1k891lHhb2X9dEsbvYzFNcL7X5akP7Ncp8nxnQStxffL9wj6+BxXbK4+ukNp+wdTLywLm8/K1rN3ou7o/VwEKFaBAStM93BXakNqzzLZpczGdtTeh6KgXvF/TfGlgA+L910YS7ZZjQCtwtfEgpNzuTjA3sTWCuiTwsANyQVsHuK4mbbZ2Uu6Rn/kh8YYEY0D6LSdyACpr2a52PtqKJ2jVSE1ZCXgf1zGOm9y5W4kLNJLcLACcVMqtHJK5Aer3UhFXy5Mtjn+3AV8f56TpLvHvMYx5zRCB/lSRzh+cF/bcGFlaI/9bFTO90SjqgXOE4KP5QBfBGAsD8GXigRv5LUOCvltuFDlxDtWPrNXg5EioFLywBYIi/4uLoVRHWiCP5HgmeF6QaWAB4xjDIl4lXyRbw+tC+lA0DGHAjoTnURASI96VhT+TnBYBn3Pq5rbeNVC0DLyxtbm5mnPkEyauvvtqcepOPn09odwHg2Tf/MllefPHFW3Jm4sYF4XJGMAD3QdTc51I4M7FtiXwCPywAPOPGlyUh+8oilb4cZ3rppZdm4PW5vhyfGun000/PHvWtXDv6n8j3CzPajFtfH2h29Y3bcblyPq8lsP9c5YILLjgu3MJjaw0sJPDW+pj6k8CbbVC3lHWGWBv4p3jO+AXMgDe1Tvzyl7/Mgutd1/EW7qIGZloDrLzJjPbgZZddJktaddJxqg8S76KLLjo6U4YbntlCAs+4gW6//fYN6cEbSODbbrutUu6oFvxtAKRT1fdXinSCBHr4CVLORhVT/zvBLrP/IxA/avv27S2uMuKo/yuvvLJ1992Z5nFYB05fVRb2RPRfALiGVtfJ578TiH+vRYldX/va13r/GKQ/ZOlxg9S9+eabW9ddd112GjtSWxvb/6/+Nf5/e4EWN63FXogaQSCdFpvwF3S1YYMNPf5fuPgXAnp1gyTvGmEWtLUGFgDeWh+1PAnIq5KwuzWlA9BLurp63tTzN/K/EFhYHUpa5v8DnctEkUYRr08AAAAASUVORK5CYII=">
      <div style="display:flex;flex-direction:column;gap:16px">
        <h2>How can I help?</h2>
        <p>I’m your AI tutor, here to help you learn.</p>
      </div>
    </div>

    <div id="blocks"></div>
    <div id="chat"></div>

    <div id="input">
      <div class="circle"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round"><path d="M8 3.5v9M3.5 8h9"/></svg></div>
      <div id="field">
        <input id="txt" type="text" placeholder="Or ask anything..." autocomplete="off">
        <button id="send" aria-label="Send"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"><path d="M13.6 2.4L2.4 6.6l4.2 1.8 1.8 4.2z"/><path d="M6.6 8.4l7-6"/></svg></button>
      </div>
    </div>

    <div id="tabbar">
      <svg class="line" width="402" height="81" viewBox="0 0 402 81" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M402.38 81.15H-0.38V14.35L-0.01 14.34L401.99 0.4L402.38 0.39V81.15Z" fill="white" stroke="#3A3A3A" stroke-width="0.75"/></svg>
      <div id="tabs">
        <div class="tab" aria-label="Map">
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.08 40.75H12.11C11.98 40.69 12.01 40.72 12.08 40.75Z" fill="#3A3A3A"/><path fill-rule="evenodd" clip-rule="evenodd" d="M42.99 28.76C43.01 28.83 43.01 28.89 43 28.95C42.99 29.07 42.94 29.17 42.84 29.24C42.82 29.27 42.79 29.29 42.76 29.31C42.72 29.33 42.67 29.35 42.62 29.36H42.57H42.54C42.41 29.36 42.29 29.3 42.2 29.2C42.18 29.18 42.16 29.16 42.14 29.13C41.55 28.36 40.95 27.59 40.32 26.84C39.28 25.59 38.2 24.38 37.08 23.21C36.3 22.41 35.51 21.62 34.66 20.89C34.6 20.93 34.54 20.97 34.47 21.02C34.39 21.07 34.31 21.13 34.22 21.19C34.11 21.26 33.97 21.27 33.84 21.22C33.74 21.21 33.65 21.17 33.58 21.1L29.16 25.44L20.94 33.51L12.84 41.49L12.8 41.51C12.71 41.59 12.58 41.63 12.46 41.6H12.4C11.94 41.49 11.52 41.26 11.19 40.93C10.85 40.62 10.61 40.21 10.5 39.76V39.69C10.47 39.56 10.52 39.41 10.63 39.32L15.21 34.81C17.92 32.15 20.63 29.49 23.33 26.83L31.36 18.91C31.32 18.88 31.29 18.85 31.26 18.82L31.26 18.82C31.21 18.78 31.17 18.74 31.13 18.7C31 18.58 30.96 18.4 31.02 18.24C31.02 18.17 31.05 18.1 31.08 18.04C31.16 17.92 31.24 17.81 31.32 17.7L31.32 17.7L31.32 17.7C29.93 16.42 28.52 15.17 27.03 13.99C26.85 13.82 26.85 13.53 27.03 13.35L27.89 12.51C27.93 12.48 27.97 12.45 28.01 12.43C28.15 12.24 28.4 12.18 28.6 12.29C29.52 12.74 30.44 13.19 31.32 13.71C32.16 14.2 32.97 14.75 33.74 15.34C33.94 15.2 34.15 15.06 34.37 14.94C34.51 14.85 34.69 14.85 34.82 14.94C34.88 14.96 34.94 14.99 34.98 15.04L35.03 15.09C35.06 15.06 35.09 15.03 35.12 14.99C35.18 14.92 35.25 14.85 35.31 14.79C35.49 14.6 35.68 14.43 35.88 14.28C35.91 14.26 35.93 14.24 35.96 14.22L35.98 14.21H36C36.1 14.16 36.21 14.15 36.31 14.18C36.35 14.19 36.39 14.2 36.42 14.22C36.81 14.43 37.16 14.7 37.46 15.02C37.63 15.19 37.79 15.37 37.93 15.57C38.05 15.74 38.14 15.93 38.18 16.13C38.18 16.14 38.18 16.14 38.18 16.15C38.19 16.18 38.2 16.22 38.2 16.25C38.19 16.33 38.16 16.41 38.12 16.48C38.1 16.5 38.09 16.52 38.07 16.54L38.05 16.56C37.83 16.84 37.58 17.09 37.3 17.32L37.43 17.43C37.6 17.61 37.6 17.9 37.43 18.07C37.42 18.08 37.41 18.09 37.4 18.09C37.36 18.17 37.32 18.25 37.27 18.33C37.72 18.74 38.15 19.17 38.56 19.63C40.85 22.18 42.61 25.35 42.99 28.76ZM32.02 18.31L32.02 18.31V18.3L32.02 18.31ZM32.02 18.31C32.68 17.34 33.54 16.53 34.53 15.9L36.51 17.82C36.39 18.01 36.26 18.2 36.12 18.37C35.88 18.66 35.63 18.93 35.36 19.18C34.94 19.57 34.49 19.93 34.02 20.26C33.37 19.58 32.71 18.93 32.02 18.31ZM36.22 15.16C36.27 15.2 36.33 15.24 36.39 15.28L36.43 15.32L36.56 15.42C36.64 15.49 36.71 15.56 36.79 15.63C36.86 15.71 36.93 15.78 36.99 15.86C37 15.87 37.03 15.9 37.05 15.92L37.05 15.92L37.05 15.92L37.05 15.92C37.07 15.95 37.08 15.97 37.06 15.94L37.09 15.97L37.1 15.99L37.12 16.01C37.14 16.05 37.17 16.1 37.2 16.15C37.02 16.34 36.84 16.52 36.64 16.68L35.66 15.73C35.83 15.53 36.02 15.34 36.22 15.16ZM37.03 15.9C37.04 15.91 37.05 15.93 37.06 15.94L37.03 15.9ZM28.46 13.23L28.03 13.66C29.35 14.72 30.62 15.85 31.88 16.99C32.21 16.6 32.58 16.24 32.97 15.91C31.55 14.89 30.04 13.99 28.46 13.23ZM24.97 28.3L16.76 36.36L12.4 40.66H12.38H12.36C12.32 40.64 12.28 40.62 12.24 40.6C12.16 40.55 12.08 40.5 12 40.45L11.97 40.41C11.93 40.38 11.89 40.35 11.86 40.31C11.79 40.25 11.73 40.18 11.67 40.11L11.63 40.06C11.61 40.03 11.59 39.99 11.56 39.95C11.54 39.91 11.52 39.88 11.5 39.84L11.48 39.79L19.44 31.96C22.14 29.28 24.85 26.61 27.55 23.95L31.35 20.22C31.33 20.72 31.44 21.23 31.69 21.68L24.97 28.3ZM36.31 21.18L36.52 21.37V21.36C38.39 23.19 40.15 25.14 41.77 27.19C41.67 26.8 41.55 26.42 41.42 26.04C40.45 23.38 38.84 20.99 36.73 19.08C36.65 19.17 36.56 19.27 36.47 19.36C36.46 19.37 36.45 19.38 36.44 19.39C36.45 19.42 36.47 19.44 36.48 19.46C36.57 19.67 36.61 19.89 36.6 20.11C36.59 20.48 36.5 20.85 36.31 21.18Z" fill="#3A3A3A"/><path d="M34.09 17.48C33.39 17.48 33.39 18.53 34.09 18.53C34.79 18.53 34.79 17.48 34.09 17.48Z" fill="#3A3A3A"/></svg>
        </div>
        <div class="tab active" aria-label="AI Tutor">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_12323_165)"><path d="M20.78 0.44L22.33 5.64L27.56 7.19L22.33 8.74L20.78 13.94L19.22 8.74L14 7.19L19.22 5.64L20.78 0.44Z" fill="white" stroke="#3A3A3A" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.22 14.06L8.78 19.26L14 20.81L8.78 22.36L7.22 27.56L5.67 22.36L0.44 20.81L5.67 19.26L7.22 14.06Z" fill="white" stroke="#3A3A3A" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M3.33 0.44L4 2.66L6.22 3.32L4 3.98L3.33 6.2L2.67 3.98L0.44 3.32L2.67 2.66L3.33 0.44Z" fill="white" stroke="#3A3A3A" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M24.67 21.8L25.33 24.02L27.56 24.68L25.33 25.34L24.67 27.56L24 25.34L21.78 24.68L24 24.02L24.67 21.8Z" fill="white" stroke="#3A3A3A" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M20.11 11.95L20.78 14.06L22.33 8.85L27.56 7.3L24.44 6.42C22.44 7.64 20.89 9.63 20.11 11.95Z" fill="#3A3A3A"/><path d="M6.33 25.45L7 27.56L8.56 22.36L13.78 20.81L10.67 19.92C8.67 21.14 7.11 23.13 6.33 25.45Z" fill="#3A3A3A"/></g><defs><clipPath id="clip0_12323_165"><rect width="28" height="28" fill="white"/></clipPath></defs></svg>
        </div>
        <div class="tab" aria-label="Stats">
          <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M10.12 36.27C10.8 34.63 12.39 33.57 14.16 33.57C16.57 33.57 18.53 35.52 18.53 37.94C18.53 39.7 17.47 41.3 15.84 41.98C14.2 42.65 12.32 42.28 11.07 41.03C9.82 39.78 9.45 37.9 10.12 36.27ZM12.95 34.6C11.54 35.11 10.61 36.44 10.61 37.94C10.61 39 11.08 40 11.9 40.68C12.76 40.73 14.18 40.56 15.55 39.2C16.91 37.84 17 36.47 16.88 35.65C15.92 34.51 14.35 34.09 12.95 34.6Z" fill="#3A3A3A"/><path fill-rule="evenodd" clip-rule="evenodd" d="M22.71 36.26C23.39 34.63 24.98 33.57 26.75 33.57C29.16 33.57 31.12 35.52 31.12 37.94C31.12 39.7 30.06 41.3 28.42 41.98C26.79 42.65 24.91 42.28 23.66 41.03C22.41 39.78 22.03 37.9 22.71 36.26ZM29.4 35.58C28.73 34.82 27.76 34.39 26.75 34.39H26.74C25.25 34.39 23.91 35.33 23.41 36.74C22.9 38.15 23.34 39.72 24.49 40.67C25.35 40.72 26.74 40.54 28.08 39.2C29.48 37.79 29.54 36.39 29.4 35.58Z" fill="#3A3A3A"/><path fill-rule="evenodd" clip-rule="evenodd" d="M23.54 23.65C24.94 25.05 25.23 27.21 24.25 28.92C23.67 29.93 22.71 30.67 21.59 30.97C21.22 31.07 20.83 31.12 20.44 31.12C18.47 31.11 16.74 29.78 16.23 27.88C15.72 25.97 16.56 23.95 18.27 22.96C19.98 21.98 22.14 22.26 23.54 23.65ZM17.37 24.96C16.89 25.78 16.77 26.75 17.01 27.67C17.21 28.39 17.63 29.02 18.21 29.49C19.06 29.56 20.5 29.4 21.88 28.02C23.23 26.67 23.33 25.32 23.22 24.5C22.54 23.66 21.53 23.18 20.46 23.18C20.14 23.18 19.83 23.22 19.53 23.3C18.62 23.54 17.84 24.14 17.37 24.96Z" fill="#3A3A3A"/><path fill-rule="evenodd" clip-rule="evenodd" d="M35.65 36.27C36.32 34.63 37.92 33.57 39.69 33.57C42.1 33.57 44.05 35.52 44.06 37.94C44.06 39.7 42.99 41.3 41.36 41.98C39.73 42.65 37.85 42.28 36.6 41.03C35.35 39.78 34.97 37.9 35.65 36.27ZM37.42 40.67C38.28 40.73 39.7 40.56 41.07 39.2C42.44 37.83 42.52 36.46 42.39 35.64C41.53 34.61 40.15 34.16 38.84 34.48C37.54 34.79 36.52 35.82 36.22 37.14C35.92 38.45 36.38 39.82 37.42 40.67Z" fill="#3A3A3A"/><path fill-rule="evenodd" clip-rule="evenodd" d="M35.33 22.83C37.2 23.75 38.15 25.87 37.61 27.88C37.32 29 36.58 29.96 35.58 30.53C33.77 31.58 31.48 31.2 30.1 29.63C28.73 28.06 28.66 25.74 29.93 24.09C31.2 22.43 33.46 21.91 35.33 22.83ZM31.41 23.8C29.86 24.84 29.38 26.9 30.31 28.52C30.53 28.89 30.81 29.22 31.15 29.5C32 29.57 33.45 29.43 34.85 28.03C36.17 26.71 36.29 25.39 36.2 24.57C35.05 23.09 32.96 22.75 31.41 23.8Z" fill="#3A3A3A"/><path fill-rule="evenodd" clip-rule="evenodd" d="M29.41 19.38C28.01 20.45 26.1 20.58 24.57 19.7C23.56 19.12 22.83 18.16 22.53 17.04C22.23 15.92 22.38 14.73 22.97 13.73C23.85 12.19 25.57 11.35 27.32 11.58C29.07 11.81 30.51 13.07 30.97 14.78C31.43 16.48 30.81 18.3 29.41 19.38ZM26.43 12.37C25.28 12.47 24.25 13.13 23.68 14.14C22.79 15.69 23.19 17.66 24.62 18.74C25.48 18.78 26.84 18.57 28.14 17.27C29.56 15.84 29.59 14.41 29.45 13.61C28.71 12.73 27.58 12.26 26.43 12.37Z" fill="#3A3A3A"/></svg>
        </div>
      </div>
    </div>
  </div>
````
````css motion:screen-css
  :root{
    --dark:#3a3a3a; --mono600:#858585; --white:#fff;
    --font:"Nunito Sans","Nunito",system-ui,-apple-system,"Segoe UI",sans-serif;
    --ui:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;
  }
  #phone{position:absolute;inset:0;background:#fff;border:.7px solid var(--dark);overflow:hidden;border-radius:2px;user-select:none;-webkit-user-select:none}

  /* ---------- status bar + header ---------- */
  #status{position:absolute;left:0;top:0;width:100%;height:40px}
  #status .time{position:absolute;left:30px;top:15px;font:600 15px/22px Inter,system-ui,sans-serif}
  #status svg{position:absolute;right:12px;top:22px}
  #header{position:absolute;left:0;top:72px;width:100%;height:38px;display:flex;align-items:center;padding:0 24px}
  #header h1{flex:1;text-align:center;font:700 20px/1.2 var(--font)}
  .ibtn{background:none;border:0;cursor:pointer;width:20px;height:20px;display:flex;align-items:center;justify-content:center;color:var(--dark)}

  /* ---------- intro ---------- */
  #intro{position:absolute;left:69.1px;top:205px;width:263.8px;display:flex;flex-direction:column;align-items:center;gap:16px;text-align:center;transition:opacity .45s ease}
  #intro h2{font:700 20px/1.2 var(--font);color:var(--dark)}
  #intro p{font:500 14px/1.4 var(--font);color:var(--mono600)}
  #intro.hide{opacity:0}

  /* ---------- blocks (tower) ---------- */
  .block{position:absolute;width:calc(231.5px*var(--k,1));height:calc(50px*var(--k,1));left:0;top:0;
    transform:translate(var(--x),var(--y)) rotate(var(--r));
    transition:transform .7s cubic-bezier(.2,.8,.2,1), opacity .45s ease;
    will-change:transform;cursor:pointer}
  .wob{width:100%;height:100%;
    transform:translate(var(--hx,0px),var(--hy,0px)) rotate(var(--hr,0deg));
    transition:transform .18s cubic-bezier(.2,.9,.3,1.2)}
  .wob.rest{transition:transform .5s cubic-bezier(.2,1.4,.4,1)}
  .card{position:relative;width:100%;height:100%;background:var(--white);color:var(--dark);
    border:calc(.75px*var(--k,1)) solid var(--dark);box-shadow:calc(3px*var(--k,1)) calc(3px*var(--k,1)) 0 var(--dark);
    display:flex;align-items:center;gap:calc(10px*var(--k,1));padding:calc(16px*var(--k,1));overflow:hidden;
    font:700 calc(12px*var(--k,1))/1.4 var(--font);
    transition:background .16s ease,color .16s ease,border-color .16s ease,box-shadow .16s ease;
    transform-origin:50% 50%}
  .card .ic{width:calc(17px*var(--k,1));height:calc(17px*var(--k,1));overflow:visible;flex:none;display:flex;transform:rotate(var(--ir,0deg))}
  .card .ic svg{width:100%;height:100%;display:block;overflow:visible}
  .card .tx{flex:1;text-align:left;white-space:nowrap}
  .card i{position:absolute;background:var(--mono600);height:calc(.75px*var(--k,1));display:block;transition:background .16s}
  .card i.a{right:calc(5.5px*var(--k,1));bottom:calc(5px*var(--k,1));width:calc(1.5px*var(--k,1))}
  .card i.b{right:calc(5px*var(--k,1));top:calc(4px*var(--k,1));width:calc(14px*var(--k,1))}
  .card i.c{left:calc(25.75px*var(--k,1));bottom:calc(8px*var(--k,1));width:calc(6px*var(--k,1))}
  @keyframes shake{
    0%,100%{transform:translate(0,0) rotate(0)}
    12%{transform:translate(.9px,-.6px) rotate(.5deg)}
    25%{transform:translate(-.8px,.5px) rotate(-.45deg)}
    38%{transform:translate(.5px,.8px) rotate(.3deg)}
    52%{transform:translate(-.6px,-.7px) rotate(-.55deg)}
    66%{transform:translate(.8px,.3px) rotate(.4deg)}
    80%{transform:translate(-.5px,-.4px) rotate(-.3deg)}
  }
  #phone:not(.opening) .block:hover .card{background:#ececec}

  /* phases */
  #phone.opening .block{pointer-events:none}
  .block.tapped .card,#phone:not(.opening) .block.pressed .card{background:var(--dark);color:#fff;border-color:var(--dark);box-shadow:calc(3px*var(--k,1)) calc(3px*var(--k,1)) 0 var(--dark)}
  .block.tapped .card{animation:none}
  .block.tapped .card i,#phone:not(.opening) .block.pressed .card i{background:#fff}
  .block.tapped .ic [stroke="#3A3A3A"],.block.pressed .ic [stroke="#3A3A3A"]{stroke:#fff}.block.tapped .ic [fill="#3A3A3A"],.block.pressed .ic [fill="#3A3A3A"]{fill:#fff}
  .block.pressed .card{transition:background .06s ease,color .06s ease,border-color .06s ease,box-shadow .06s ease}
  .block.blast .card{animation:none}
  .block.hov .card{background:#ececec}
  #touch{position:absolute;left:0;top:0;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;background:rgba(58,58,58,.16);border:1.5px solid rgba(58,58,58,.45);opacity:0;pointer-events:none;z-index:50}
  #touch.cur{width:14px;height:14px;margin:-7px 0 0 -7px;background:#3A3A3A;border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.25)}
  .block.gone{opacity:0}

  /* ---------- chat ---------- */
  #chat{position:absolute;left:0;top:117px;width:100%;bottom:130px;overflow:hidden;display:flex;flex-direction:column;pointer-events:none}
  .msg{display:flex;gap:12px;padding:12px 24px;opacity:0;transform:translateY(14px);
    transition:opacity .6s ease,transform .7s cubic-bezier(.2,.8,.2,1)}
  .msg.in{opacity:1;transform:none}
  .avatar{width:32px;height:32px;border-radius:50%;border:1px solid #000;background:#fff;flex:none;overflow:hidden;box-shadow:0 4px 4px rgba(0,0,0,.25)}
  .msg.tutor .avatar{background:var(--dark);border-color:var(--dark)}
  .msg .meta{font:700 12px/1.4 var(--font);margin-bottom:8px}
  .msg .body{font:500 14px/1.4 var(--font);position:relative;min-height:20px}
  .dots{display:flex;gap:5px;align-items:center;height:20px;transition:opacity .25s ease}
  .dots i{width:7px;height:7px;border-radius:50%;background:var(--dark);display:block;animation:pulse 1.1s ease-in-out infinite}
  .dots i:nth-child(2){animation-delay:.15s}
  .dots i:nth-child(3){animation-delay:.3s}
  @keyframes pulse{0%,60%,100%{transform:translateY(0);opacity:.28}30%{transform:translateY(-4px);opacity:1}}
  .body .reply{position:absolute;left:0;top:0;opacity:0;transition:opacity .45s ease;color:var(--dark)}
  .msg.done .dots{opacity:0;position:absolute}
  .msg.done .reply{opacity:1;position:static}

  /* ---------- input ---------- */
  #input{position:absolute;left:0;top:731px;width:402px;padding:4px 24px;display:flex;gap:8px;align-items:flex-end}
  .circle{width:32px;height:32px;border-radius:32px;background:var(--dark);display:flex;align-items:center;justify-content:center;flex:none;margin-bottom:4px}
  #field{flex:1;border:.75px solid var(--dark);border-radius:20px;padding:4px 4px 4px 12px;display:flex;align-items:center;gap:8px;background:#fff}
  #field input{flex:1;border:0;outline:0;background:none;font:500 14px/1.4 var(--font);color:var(--dark);padding:4px;min-width:0}
  #field input::placeholder{color:var(--mono600)}
  #send{width:30px;height:30px;border-radius:30px;background:var(--dark);border:0;display:flex;align-items:center;justify-content:center;cursor:pointer;flex:none}

  /* ---------- tabbar ---------- */
  #tabbar{position:absolute;left:0;top:791px;width:402px;height:83px}
  #tabbar .line{position:absolute;left:0;top:3px}
  #tabs{position:absolute;inset:10px 0 0;display:flex;justify-content:center;gap:12px}
  .tab{width:53.5px;height:53.5px;position:relative;display:flex;align-items:center;justify-content:center}
  .tab svg{position:relative;z-index:1;display:block}
  .tab.active::after{content:"";position:absolute;left:4px;bottom:2px;width:46px;height:22px;
    background-image:radial-gradient(var(--dark) .8px,transparent 1px);background-size:4px 4px;opacity:.35;
    -webkit-mask-image:radial-gradient(ellipse at 50% 30%,#000 30%,transparent 75%);mask-image:radial-gradient(ellipse at 50% 30%,#000 30%,transparent 75%)}
  .card .tx2{position:absolute;left:calc(43px*var(--k,1));top:50%;margin-top:calc(-9.8px*var(--k,1));font:500 calc(14px*var(--k,1))/1.4 var(--font);color:var(--dark);white-space:nowrap;opacity:0;transform-origin:0 50%;pointer-events:none}
  .card .tx{transform-origin:0 50%}
  #chat.tl .msg{transition:none}
  @media (prefers-reduced-motion:reduce){
    .card{animation:none}
    .block,.block.tapped.explode{transition-duration:.01s}
  }
  /* V3 Focus / Send: system keyboard stand-in (the real app uses the OS keyboard) + text flying from the field */
  .kbd{position:absolute;left:0;right:0;bottom:0;height:336px;background:#d1d3d9;padding:46px 3px 0;display:flex;flex-direction:column;gap:11px;z-index:6;transform:translateY(336px);visibility:hidden;will-change:transform}
  .kbd .sug{position:absolute;left:0;right:0;top:0;height:44px;display:flex;align-items:center;justify-content:space-around;font:400 16px -apple-system,system-ui,sans-serif;color:#000;border-bottom:.5px solid rgba(0,0,0,.12)}
  .kbd .row{display:flex;gap:6px;justify-content:center}
  .kbd .row i{width:33px;height:42px;border-radius:5px;background:#fff;box-shadow:0 1px 0 rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;font:400 22px -apple-system,system-ui,sans-serif;color:#000;font-style:normal;cursor:pointer}
  .kbd .row i.w{width:46px;background:#acb0ba}.kbd .row i.sp{width:190px}.kbd .row i.go{width:88px;background:#0a84ff;color:#fff;font-size:16px}
  #input{z-index:7;will-change:transform}
  #field.focus{border-width:1.2px}
  #field.focus:not(.has) #txt::placeholder{color:transparent}
  #field.focus:not(.has)::before{content:"";position:absolute;left:16px;top:11.5px;width:1.5px;height:17px;background:#0a84ff;animation:caret 1s steps(2) infinite}
  #field{position:relative}
  @keyframes caret{50%{opacity:0}}
  .flytext{position:absolute;left:0;top:0;font:500 14px/1.4 var(--font);color:var(--dark);white-space:nowrap;pointer-events:none;opacity:0;z-index:8;will-change:transform}
````
````js motion:engine
/* motion:engine — AI Tutor · use-case blocks
 * The motion is a pure function of time: modelFor(variant, animation, runs) -> { dur, motionEnd, tapLead, at(tMs) -> frame }.
 * frame.blocks[j] = { cx, cy, r (deg), s (resize factor), o (opacity) } in artboard px (402 x 874), plus intro / stu / tut / done,
 * touch (finger dot), pressed, and for V3 stuText + morph. Playing = advancing t, scrubbing = setting t, exporting = sampling t.
 * Needs a spring generator with Motion's API: MotionEngine.create({ spring: MotionLib.spring })  (motion's spring()).
 * Variants: B = V1 (physical push), C = V2 (handoff), D = V3 (block flies into the student message).
 * The tweak catalogue (labels, ranges, defaults) lives here; the current values live in the package manifest. */
(function(root){
root.MotionEngine = { id:'ai-tutor-blocks', create(ctx){
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));
  const R = (a,b)=>a+Math.random()*(b-a);
  const SUF = {B:'1',C:'2',D:'3'};
  let V = {};                                               // live values (set by the workbench via setValues)
  const P = (name,vr)=>V[name+SUF[vr]];
  /* ================= TWEAK CATALOGUE ================= */
  const T = (k,label,min,max,step,def,unit,short,what,low,high,look)=>({k,label,min,max,step,def,unit,short,what,low,high,look,hint:what+' Look at: '+look});
  const TEMPL = [
    T('wind','Zoom wind-up (heavy start)',0,100,1,0,' %','Selected block starts slowly, then speeds up',
      'Makes the selected block lazily get going and then accelerate, like something heavy. In A it also delays the neighbours’ take-off.',
      '0 % = starts instantly.','High = noticeable lag before it takes off.','The first ~200 ms after you release the block.'),
    T('shake','Screen thud',0,24,1,0,' px','Short shake of the screen at the explosion',
      'Shakes the whole phone for a split second when the block explodes. Adds impact and weight.',
      '0 = no shake.','High = hard thud.','The instant you release the block.'),
    T('wiggle','Hover wiggle',0,100,1,40,' %','Wiggle when the mouse enters a block',
      'Strength of the one-time random wiggle when the mouse enters a block.',
      '0 = off.','High = big jolt.','Move the mouse onto a block without pressing.'),
    T('inLead','Enter: text first, blocks after',0,1200,10,320,' ms','Head start of text + illustration on tab entry',
      'Tab entry: the headline and illustration fade in first, the blocks start flying this long afterwards.',
      '0 = everything together.','Blocks arrive late, text has time to be read.','The first 600 ms after opening a tab.'),
    T('loading','Loading state length',0,8000,100,2600,' ms','How long Brian’s dots show',
      'How long the “Brian is working” dots show before the placeholder reply appears.',
      'Short wait before the reply.','Long wait. 0 = dots stay forever.','The chat area after the blocks are gone.'),
    T('tapOpen','Tap: press duration',100,800,10,240,' ms','How long the finger is down before the animation plays',
      'Every animation starts with the user action: finger down (touch dot, pressed block), release, then the animation plays.',
      'Quick tap.','Long press.','The first ~300 ms of Open, Back and Enter.'),
    T('tapBack','Tap: press duration',100,800,10,240,' ms','How long the finger is down before the animation plays',
      'Every animation starts with the user action: finger down (touch dot, pressed block), release, then the animation plays.',
      'Quick tap.','Long press.','The first ~300 ms of Open, Back and Enter.'),
    T('tapEnter','Tap: press duration',100,800,10,240,' ms','How long the finger is down before the animation plays',
      'Every animation starts with the user action: finger down (touch dot, pressed block), release, then the animation plays.',
      'Quick tap.','Long press.','The first ~300 ms of Open, Back and Enter.'),
    T('staggerBack','Return / enter stagger',0,300,5,70,' ms','Delay between blocks',
      'Delay between one block and the next one starting to fly.',
      '0 = all at once.','One after another.','The order in which the blocks land.'),
    T('staggerEnter','Return / enter stagger',0,300,5,70,' ms','Delay between blocks',
      'Delay between one block and the next one starting to fly.',
      '0 = all at once.','One after another.','The order in which the blocks land.'),
    T('randBack','Enter randomness',0,100,1,100,' %','How wild the start positions are on tab entry',
      'Tab entry: the upper blocks fly in from a random spot above, the lower ones from below, the middle one just appears. This sets the distance, sideways offset and rotation of those start spots. “+” is not affected: it starts from where the blocks currently are.',
      '0 % = straight from above / below, no rotation.','Far away, wide sideways and strongly rotated.','The first 300 ms after opening a tab.'),
    T('randEnter','Enter randomness',0,100,1,100,' %','How wild the start positions are on tab entry',
      'Tab entry: the upper blocks fly in from a random spot above, the lower ones from below, the middle one just appears. This sets the distance, sideways offset and rotation of those start spots. “+” is not affected: it starts from where the blocks currently are.',
      '0 % = straight from above / below, no rotation.','Far away, wide sideways and strongly rotated.','The first 300 ms after opening a tab.'),
    T('durOpen','Open: total duration',0,3000,10,0,' ms','Stretch or squeeze the whole Open animation',
      'Total length of the motion after the tap. The whole animation is time-scaled to this length (all parts keep their proportions).',
      '0 = natural length from the other tweaks.','Slow motion.','The whole Open animation.'),
    T('durBack','Back: total duration',0,3000,10,0,' ms','Stretch or squeeze the whole Back animation',
      'Total length of the motion after the tap. The whole animation is time-scaled to this length.',
      '0 = natural length from the other tweaks.','Slow motion.','The whole Back animation.'),
    T('durEnter','Enter: total duration',0,3000,10,0,' ms','Stretch or squeeze the whole Enter animation',
      'Total length of the motion. The whole animation is time-scaled to this length.',
      '0 = natural length from the other tweaks.','Slow motion.','The whole Enter animation.'),
    T('textEnter','Enter: text appears after',0,1500,10,560,' ms','When the headline + illustration come in, after the blocks start',
      'Blocks fly in first, the headline and illustration appear after this delay, so the page assembles with the text last.',
      '0 = text right away.','Text comes in when the blocks have nearly landed.','The first second after opening a tab.')
  ];
  const PERK = v => TEMPL.filter(t=> v==='1' ? t.k!=='textEnter' : (t.k!=='wind' && t.k!=='inLead')).map(t=>Object.assign({},t,{k:t.k+v}));
  const CAT = {
    B:[
      T('bKick','Push velocity',0,3000,10,700,' px/s','Launch speed of the neighbours',
        'Speed the neighbours are kicked away with, on top of being pushed by the growing block.',
        'They are only pushed by contact.','They shoot away on their own.','The neighbours during the first 400 ms.'),
      T('bKickRand','Push randomness',0,100,1,40,' %','Per-block variation of launch speed',
        'How much the launch speed differs from block to block.',
        '0 % = all neighbours equally fast.','Some leave early, others linger.','Whether neighbours leave at different times.'),
      T('bInertia','Inertia (lazy take-off)',0,800,10,0,' ms','Neighbours accelerate slowly (heavy feel)',
        'Time the neighbours need to reach their push and spin speed. Like mass: heavy things take time to get going.',
        '0 = instant take-off.','Sluggish — they pick up speed slowly and lumber away.','How each neighbour starts moving once kicked.'),
      T('bSpin','Spin velocity',0,900,5,160,' °/s','How fast neighbours rotate',
        'Rotation speed of the pushed blocks.',
        '0 = no rotation.','Windmill.','The rotation of the neighbours after the kick.'),
      T('bSpinRand','Spin randomness',0,100,1,50,' %','Per-block variation of spin speed',
        'How much the spin speed differs from block to block.',
        '0 % = all spin equally fast.','Some barely turn, some whirl.','Compare the spin of neighbours above and below.'),
      T('bSpinBias','Spin direction',-100,100,1,0,'','Clockwise or counter-clockwise',
        'Chance for a block to turn clockwise vs. counter-clockwise.',
        '−100 = all turn counter-clockwise.','+100 = all turn clockwise. 0 = coin flip per block.','Which way the neighbours turn.'),
      T('bTransfer','Contact momentum',0,200,1,100,' %','How much speed a touched block takes along',
        'When the growing block touches a neighbour: how much of the edge’s speed the neighbour keeps flying with.',
        'Neighbour is pushed but loses speed when the edge slows — feels stuck.','100 % = natural carry-over, 200 % = extra pop.','The moment each neighbour is touched by the growing block.'),
      T('bDrag','Air drag',0,6,.1,.8,' /s','Air resistance on flying blocks',
        'Slows blocks down while they fly.',
        'They keep flying at constant speed.','They slow down and hang in the air — floaty, heavy.','The second half of the flight.'),
      T('bDrift','Sideways drift',0,600,5,80,' px/s','Sideways wandering',
        'Random left/right speed on top of the vertical push.',
        '0 = straight up / down.','Blocks wander sideways.','The horizontal movement of the neighbours.'),
      T('bGap','Clearance',0,40,1,8,' px','Air between growing block and neighbours',
        'Distance kept between the growing block’s edge and the pushed blocks.',
        '0 = touching.','Visible gap.','The edge of the growing block next to a neighbour.'),
      T('bOffset','Kick ↔ zoom offset',-400,800,10,0,' ms','Kick vs. zoom timing',
        'Time gap between the neighbours being kicked and the zoom starting. (Contact pushing always works.)',
        'Negative: neighbours get kicked before the zoom starts.','Positive: zoom starts first, kick comes later.','The first ~300 ms after release.'),
      T('bZoom','Zoom duration',300,1600,10,800,' ms','How long the block takes to explode',
        'Duration of the selected block’s growth. The chat also appears later when this is longer.',
        'Snappy.','Slow, heavy expansion.','How fast the selected block grows and when the chat shows up.'),
      T('bFade','Neighbour fade-out start',0,2000,10,700,' ms','When neighbours start to fade',
        'When the pushed blocks begin to fade away.',
        'They vanish early, maybe while still on screen.','They stay visible longer.','Neighbours near the end of the animation.'),
      ...PERK('1')
    ]
  };
  const NEWT = [
      T('bMove','Morph length (fade timing)',250,1400,10,620,' ms','Time base for fade / text timing',
        'The tapped block turns dark and glides up to where the student message sits.',
        'Snappy.','Slow, floaty.','The tapped block right after the tap.'),
      T('bMorphAt','Morph: fade / text start',10,95,1,55,' %','When the block fades out and the text rises in',
        'Share of the move after which the block fades out while the message text rises in from below, as if the block turned into the text.',
        'Cross-fade starts early, far from the text.','Block arrives at the text first, then swaps.','The last part of the block’s move.'),
      T('bRise','Text rise distance',0,120,1,36,' px','How far below the text starts',
        'The message text starts this far below its final place and rises into it.',
        '0 = only fades.','Long rise from the bottom.','The message text while it appears.'),
      T('bFlySpin','Block tilt in flight',0,60,1,22,' °','How much the tapped block tilts while flying to the message',
        'The tapped block twists out of its rotation mid-flight and straightens as it lands in the message.',
        '0 = flies flat.','Dramatic twist.','The tapped block while it flies up.'),
      T('bArc','Block swing to the left',0,160,1,46,' px','How far the block swings out to the left on its way',
        'The block takes a curved path and swings out to the left before landing at the message.',
        '0 = straight line.','Wide arc.','The tapped block while it flies up.'),
      T('bWobble','Release wobble',0,30,1,8,' °','Little shake of a block when it lets go',
        'Falling blocks twitch for a moment when they come loose, before gravity takes over.',
        '0 = clean drop.','Rattling.','The first 300 ms of each falling block.'),
      T('bGravity','Gravity',400,7000,50,2200,' px/s²','How fast the other blocks fall',
        'Acceleration of the falling blocks.',
        'Floaty fall.','Heavy drop.','The other blocks right after the tap.'),
      T('bKick','Initial push',-400,900,10,-120,' px/s','Start speed downwards',
        'Initial vertical speed of the falling blocks (negative = a small hop up first, like they get released).',
        'They just let go.','They get shoved down.','The first 150 ms of the fall.'),
      T('bSpin','Spin',0,700,5,180,' °/s','How fast the blocks rotate while falling',
        'Rotation speed of the falling blocks.','No tumbling.','Wild tumbling.','The falling blocks.'),
      T('bSpinRand','Spin randomness',0,100,1,60,' %','Per-block variation of spin',
        'Each block gets its own spin speed and direction variation.','All alike.','Very different.','The falling blocks.'),
      T('bDrift','Sideways drift',0,500,5,130,' px/s','Random sideways speed',
        'Each block drifts left or right by a random amount, so they land in random places.','Straight down.','Scattered.','The falling blocks.'),
      T('bStart','Release stagger (random)',0,400,5,90,' ms','Random delay before each block lets go',
        'Each block starts falling after a random delay up to this value.','All together.','Uneven, like they come loose one by one.','The first 400 ms.'),
  ];
  const CDEF = {bStart:0};
  CAT.C = [T('cRipple','Ripple delay per block',0,400,5,110,' ms','Delay before each block lets go (nearest to the tapped block first)',
      'The push travels through the tower: the neighbours next to the selected block get kicked first, the farther ones follow after this delay per step.',
      '0 = everyone is kicked at once.','Slow domino effect.','The order in which the blocks leave.')]
    .concat(NEWT.concat(PERK('2')).map(t=>/^b[A-Z]/.test(t.k)?Object.assign({},t,{k:'c'+t.k.slice(1),def:CDEF[t.k]!==undefined?CDEF[t.k]:t.def}):t));
  /* ---- V3 (D): block flies into the student message ---- */
  const FLYT = [
    T('fStraighten','Tilt reaches 0° at',5,100,1,60,' %','When the tapped block is straight',
      'Share of the flight after which the tapped block has lost its tilt.','Straight right away.','Straightens on landing.','The tapped block in flight.'),
    T('fLift','Lift',0,20,.5,5,' %','Block grows a little mid-flight',
      'The tapped block grows by this much in the middle of the flight (anticipation).','Flat.','Big lift.','The tapped block in flight.'),
    T('fSurfAt','Surface fades from',0,100,1,25,' %','When fill, border, shadow and icon start to go',
      'Share of the flight after which the block surface fades, so only the text is left.','Surface goes right away.','Surface stays until landing.','The tapped block in flight.'),
    T('fSurfDur','Surface fade length',1,100,1,45,' %','How long the surface fade takes',
      'Length of the surface fade, as a share of the flight.','Snap.','Slow dissolve.','The tapped block in flight.'),
    T('fTextAt','Text style change from',0,100,1,35,' %','When the label turns into message text',
      'Share of the flight after which the label crossfades from block style (12 px bold, white) to message style (14 px regular, ink).','Early.','On landing.','The label in flight.'),
    T('fTextDur','Text style change length',1,100,1,30,' %','How long the text crossfade takes',
      'Length of the text crossfade, as a share of the flight.','Snap.','Slow.','The label in flight.'),
    T('fMetaAt','Avatar + name in at',0,150,1,72,' %','When avatar and “Student - 10:32” appear',
      'Share of the flight after which avatar and name fade in around the landing text.','Before landing.','After landing.','The student message.'),
    T('fMetaFade','Avatar + name fade',0,1000,10,240,' ms','Fade length of avatar and name',
      'How long avatar and name take to fade in.','Pop.','Slow.','The student message.'),
    T('fMetaRise','Avatar + name rise',0,60,1,8,' px','How far avatar and name rise while fading in',
      'Avatar and name start this far below and rise into place. The text line itself never moves: the label lands on it.','Only fades.','Long rise.','The student message.'),
    T('fTutorDelay','Brian after landing',0,1500,10,350,' ms','When Brian’s message appears',
      'Delay after the flight before Brian’s message fades in.','Right away.','Late.','The chat after landing.'),
    T('dRipple','Ripple delay per block',0,400,5,70,' ms','Delay before each block lets go (nearest to the tapped block first)',
      'The blocks next to the tapped one fall first, then the ones further away.','All at once.','Slow domino.','The falling blocks.')
  ];
  const D3 = {bGravity:3500,bKick:-10,bSpin:235,bSpinRand:55,bDrift:310,bStart:0,bWobble:7,
              tapOpen3:90,durOpen3:0,loading3:1800,tapBack3:240,durBack3:1200,staggerBack3:70,randBack3:100,
              tapEnter3:240,durEnter3:1190,staggerEnter3:40,randEnter3:67,textEnter3:190,wiggle3:40,shake3:0};
  CAT.D = FLYT.concat(NEWT.filter(t=>t.k in D3).map(t=>Object.assign({},t,{k:'d'+t.k.slice(1),def:D3[t.k]})))
    .concat(PERK('3').map(t=>Object.assign({},t,{def:D3[t.k]!==undefined?D3[t.k]:t.def})));
  /* Back: timing of chat-out, block release and intro-in (were built in: 450 ms, 0 ms, 45 % of the spring, 450 ms) */
  [['B','1'],['C','2'],['D','3']].forEach(([v,s])=>CAT[v].push(
    T('chatOutBack'+s,'Chat fades out',0,1500,10,450,' ms','How long the chat takes to fade out','The chat messages fade out over this time when “+” is tapped.','Quick cut.','Slow fade.','The chat during Back.'),
    T('blocksAtBack'+s,'Blocks start after',0,1500,10,0,' ms','Delay before the blocks rise','The blocks start rising this long after the tap.','Right away.','Late.','The blocks during Back.'),
    T('introAtBack'+s,'Intro fades in from',0,200,1,45,' %','When the intro text comes back','Share of the block spring time after which the headline and illustration fade back in.','Early.','Late.','The intro during Back.'),
    T('introInBack'+s,'Intro fade length',0,1500,10,450,' ms','How long the intro takes to fade in','The headline and illustration fade in over this time.','Quick.','Slow.','The intro during Back.')));
  const ALL = {}; [...CAT.B,...CAT.C,...CAT.D].forEach(t=>ALL[t.k]=t);
  const DEF = {}; Object.values(ALL).forEach(t=>DEF[t.k]=t.def);
  DEF.moveSpring = {visualDuration:.62,bounce:.14}; DEF.backSpring1 = {visualDuration:.55,bounce:0}; DEF.enterSpring1 = {visualDuration:.55,bounce:0}; DEF.backSpring2 = {visualDuration:.8,bounce:.2}; DEF.enterSpring2 = {visualDuration:.8,bounce:.2};
  DEF.flyYSpring = {visualDuration:.55,bounce:.12}; DEF.flyXSpring = {visualDuration:.62,bounce:.06}; DEF.backSpring3 = {visualDuration:.8,bounce:.2}; DEF.enterSpring3 = {visualDuration:.25,bounce:.25};
  let cview = null;
  function setValues(obj){ V = obj; cview = new Proxy(V,{get:(o,k)=>(typeof k==='string'&&/^b[A-Z]/.test(k))?o['c'+k.slice(1)]:o[k]}); }
  setValues(Object.assign({},DEF));
  function springEase(c){            // Motion spring sampled by elapsed ms (0 → 1)
    const o = Object.assign({},c); delete o.type; delete o.mode;
    const g = ctx.spring(Object.assign({keyframes:[0,1]},o));
    return ms => ms<=0 ? 0 : g.next(ms).value;
  }
  const springMs = c => (c.visualDuration||.8)*1000;

  /* ================= BLOCKS ================= */
  const I = {
    plan:"<svg width=\"17\" height=\"17\" viewBox=\"0 0 17 17\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g clip-path=\"url(#clip0_12269_6301)\"><g clip-path=\"url(#clip1_12269_6301)\"><path d=\"M5.21 3.27L5.15 1.49\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M10.98 3.07L10.92 1.29\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M12.32 3.02L3.88 3.31C2.9 3.35 2.13 4.17 2.16 5.15L2.43 12.7C2.46 13.68 3.28 14.45 4.26 14.42L12.7 14.12C13.68 14.09 14.45 13.27 14.42 12.28L14.15 4.73C14.12 3.75 13.3 2.98 12.32 3.02Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M2.21 6.48L14.2 6.07\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M8.27 8.05C7.78 8.07 7.39 8.48 7.41 8.97C7.43 9.46 7.84 9.85 8.33 9.83C8.82 9.81 9.2 9.4 9.19 8.91C9.17 8.42 8.76 8.04 8.27 8.05Z\" fill=\"#3A3A3A\"/><path d=\"M11.44 9.72C11.93 9.7 12.31 9.29 12.29 8.8C12.28 8.31 11.87 7.93 11.38 7.94C10.89 7.96 10.5 8.37 10.52 8.86C10.54 9.35 10.95 9.74 11.44 9.72Z\" fill=\"#3A3A3A\"/><path d=\"M8.36 10.72C7.87 10.73 7.49 11.15 7.5 11.64C7.52 12.13 7.93 12.51 8.42 12.49C8.91 12.48 9.3 12.06 9.28 11.57C9.26 11.09 8.85 10.7 8.36 10.72Z\" fill=\"#3A3A3A\"/><path d=\"M5.25 10.83C4.76 10.84 4.38 11.26 4.39 11.75C4.41 12.23 4.82 12.62 5.31 12.6C5.8 12.59 6.19 12.17 6.17 11.68C6.15 11.19 5.74 10.81 5.25 10.83Z\" fill=\"#3A3A3A\"/><path d=\"M11.47 10.61C10.98 10.63 10.59 11.04 10.61 11.53C10.63 12.02 11.04 12.4 11.53 12.39C12.02 12.37 12.41 11.96 12.39 11.47C12.37 10.98 11.96 10.59 11.47 10.61Z\" fill=\"#3A3A3A\"/></g></g><defs><clipPath id=\"clip0_12269_6301\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0 0.56) rotate(-2)\"/></clipPath><clipPath id=\"clip1_12269_6301\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0 0.56) rotate(-2)\"/></clipPath></defs></svg>",
    dumbbell:"<svg width=\"17\" height=\"17\" viewBox=\"0 0 17 17\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g clip-path=\"url(#clip0_12319_65743)\"><path d=\"M13.38 8.45L14.94 8.51M5.83 8.19L10.72 8.36M1.61 8.04L3.17 8.1\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M4.68 3.03C3.94 3.01 3.32 3.58 3.3 4.32L3.03 11.87C3.01 12.61 3.58 13.22 4.32 13.25C5.06 13.28 5.67 12.7 5.7 11.96L5.96 4.41C5.99 3.68 5.41 3.06 4.68 3.03Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M12.23 3.3C11.49 3.27 10.87 3.85 10.85 4.58L10.59 12.14C10.56 12.87 11.14 13.49 11.87 13.51C12.61 13.54 13.22 12.96 13.25 12.23L13.51 4.68C13.54 3.94 12.96 3.32 12.23 3.3Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g><defs><clipPath id=\"clip0_12319_65743\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0.56) rotate(2)\"/></clipPath></defs></svg>",
    chart:"<svg width=\"17\" height=\"17\" viewBox=\"0 0 17 17\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g clip-path=\"url(#clip0_12319_65756)\"><path d=\"M3.14 8.76L6.25 8.87L6.1 13.31L2.99 13.2C2.5 13.19 2.11 12.77 2.13 12.28L2.22 9.62C2.24 9.13 2.65 8.75 3.14 8.76Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M10.36 5.9L13.47 6.01C13.96 6.03 14.34 6.44 14.32 6.93L14.12 12.7C14.11 13.19 13.69 13.58 13.2 13.56L10.09 13.45L10.36 5.9Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M7.36 2.68L9.58 2.76C10.07 2.78 10.45 3.19 10.44 3.68L10.1 13.45L6.1 13.31L6.44 3.54C6.46 3.05 6.87 2.67 7.36 2.68Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g><defs><clipPath id=\"clip0_12319_65756\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0.56) rotate(2)\"/></clipPath></defs></svg>",
    help:"<svg width=\"18\" height=\"18\" viewBox=\"0 0 18 18\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g clip-path=\"url(#clip0_12269_6340)\"><path d=\"M9.47 15.2C13.01 14.83 15.57 11.66 15.2 8.12C14.83 4.58 11.66 2.01 8.12 2.38C4.58 2.76 2.01 5.93 2.38 9.47C2.76 13.01 5.93 15.57 9.47 15.2Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M6.99 7.42C6.9 6.53 7.54 5.8 8.47 5.7C9.4 5.6 10.17 6.15 10.26 6.99C10.4 8.36 8.76 8.53 8.91 9.94\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M9.09 11.67C9.27 11.65 9.42 11.77 9.44 11.94C9.45 12.11 9.33 12.27 9.16 12.28C8.99 12.3 8.84 12.18 8.82 12.01C8.8 11.84 8.92 11.68 9.09 11.67Z\" fill=\"#3A3A3A\" stroke=\"#3A3A3A\" stroke-width=\"0.89\"/></g><defs><clipPath id=\"clip0_12269_6340\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0 1.67) rotate(-6)\"/></clipPath></defs></svg>",
    file:"<svg width=\"17\" height=\"17\" viewBox=\"0 0 17 17\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><g clip-path=\"url(#clip0_12269_6353)\"><path d=\"M5.32 6.38L7.09 6.31\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M5.41 9.04L11.18 8.84\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M5.5 11.71L11.28 11.5\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M2.88 13.13L2.56 3.8C2.52 2.83 3.29 2 4.27 1.97L9.24 1.79C9.48 1.78 9.7 1.87 9.88 2.03L13.47 5.38C13.64 5.54 13.75 5.77 13.75 6L13.99 12.74C14.02 13.72 13.26 14.55 12.27 14.58L4.72 14.85C3.75 14.88 2.92 14.11 2.88 13.13Z\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M13.66 5.64L10.63 5.75C10.14 5.76 9.73 5.38 9.71 4.89L9.61 1.87\" stroke=\"#3A3A3A\" stroke-width=\"1.33\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></g><defs><clipPath id=\"clip0_12269_6353\"><rect width=\"16\" height=\"16\" fill=\"white\" transform=\"translate(0 0.56) rotate(-2)\"/></clipPath></defs></svg>"
  };
  const DEFS = [
    {label:'Create a study plan',        icon:'plan',    cx:200.7, cy:434.9, r:-2, ir:0 },
    {label:'Practice my hardest topics', icon:'dumbbell',cx:180.7, cy:490.4, r:0, ir:0 },
    {label:'Show my knowledge gaps',     icon:'chart',   cx:200.7, cy:546.4, r:2, ir:0 },
    {label:'Explain a topic',            icon:'help',    cx:219.7, cy:601.9, r:-4, ir:0 },
    {label:'Create a mock exam',         icon:'file',    cx:200.7, cy:658.0, r:-2, ir:0 }
  ];
  const W = 231.5, H = 50;
  const hh = deg => { const r=Math.abs(deg)*Math.PI/180; return W/2*Math.sin(r)+H/2*Math.cos(r); }; // half-height of the rotated block
  /* ---- helpers shared by A and B ---- */
  function bez(x1,y1,x2,y2){
    return x=>{
      if(x<=0) return 0; if(x>=1) return 1;
      let lo=0,hi=1,t=x;
      for(let k=0;k<22;k++){ t=(lo+hi)/2; const cx=3*(1-t)*(1-t)*t*x1+3*(1-t)*t*t*x2+t*t*t; if(cx<x) lo=t; else hi=t; }
      return 3*(1-t)*(1-t)*t*y1+3*(1-t)*t*t*y2+t*t*t;
    };
  }
  const zoomEase = ()=>bez(.4+.45*P('wind','B')/100,0,.2,1);

  /* ================= TIMELINE MODEL =================
     Every animation is a pure function of (variant, clicked block, seed, tweak values) → state at time t.
     Playing = advancing t, scrubbing = setting t, exporting = sampling t. */
  function rng(seed){ let a=seed>>>0; return ()=>{ a=(a+0x6D2B79F5)>>>0; let t=a; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; }; }
  const hash = n => { const x=Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); };
  const bezOpa = bez(.25,.1,.25,1), bezMsg = bez(.2,.8,.2,1);
  const S_END = 6.4;                       // final scale of the selected block

  const lblOff = i => 43 - W/2;   // label left edge, measured in the prototype: 43 px inside the block (same for every block)
  function buildV1(vr,i,seed){
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a);
    const td = DEFS[i], S = S_END, ease = zoomEase();
    const others = DEFS.map((d,j)=>j).filter(j=>j!==i);
    const m = {variant:vr,i,seed,kind:'open',tapped:i};
    let zoomAt, Tz, msgAt, motionEnd, core;

    {
      const VB = vr==='C' ? cview : V;
      Tz = VB.bZoom; const zA = Math.max(0,-VB.bOffset), kickAt = zA+VB.bOffset; zoomAt = zA;
      const ht0 = hh(td.r), pCW = (VB.bSpinBias+100)/200, tau = VB.bInertia/1000;
      const step = 1/120, stepMs = step*1000;
      motionEnd = Math.max(zoomAt+Tz, VB.bFade+500) + 200 + (vr==='C'?4*V.cRipple:0);
      msgAt = zoomAt+Tz*.55;
      const ns = others.map(j=>{
        const d = DEFS[j];
        const kr=RR(-1,1), sd=rnd(), sr=RR(-1,1), dr=RR(-1,1);        // fixed draw order
        return {j,d,rd:(vr==='C'?V.cRipple:0)*Math.abs(j-i),dir:(d.cy<td.cy?-1:1),kr,sd,sr,dr,off:0,v:0,vT:0,ang:0,w:0,wT:0,x:0,vx:0,kicked:false,hh0:hh(d.r),prevNeed:0};
      });
      const N = Math.ceil(motionEnd/stepMs)+2;
      ns.forEach(n=>n.buf=new Float32Array(N*3));
      for(let k=0;k<N;k++){
        if(k===0){ ns.forEach(n=>{ n.buf[0]=n.d.cx; n.buf[1]=n.d.cy; n.buf[2]=n.d.r; }); continue; }   // t=0 is the exact rest pose
        const t=k*stepMs, p=clamp((t-zoomAt)/Tz,0,1), e=ease(p), s=1+(S-1)*e, rot=td.r*(1-e);
        const htGrow = s*hh(rot)-ht0, gapNow = VB.bGap*clamp((s-1)/(S-1),0,1);
        ns.forEach(n=>{
          if(!n.kicked && t>=kickAt+n.rd){
            n.kicked=true;
            n.vT = VB.bKick*(1+n.kr*VB.bKickRand/100);
            n.wT = (n.sd<pCW?1:-1)*VB.bSpin*(1+n.sr*VB.bSpinRand/100);
            n.vx = n.dr*VB.bDrift;
          }
          if(n.kicked){
            const a = tau>0 ? 1-Math.exp(-step/tau) : 1, dg = Math.exp(-VB.bDrag*step);
            n.vT *= dg;
            if(n.v<n.vT) n.v += (n.vT-n.v)*a;
            n.v *= dg;
            n.w += (n.wT-n.w)*a;
            n.off += n.v*step; n.ang += n.w*step; n.x += n.vx*step;
          }
          const need = htGrow + (hh(n.d.r+n.ang)-n.hh0) + gapNow;          // the growing block is a wall
          if(n.off<need){ const edgeV=(need-n.prevNeed)/step; n.off=need; n.v=Math.max(n.v,edgeV*VB.bTransfer/100); }
          n.prevNeed = need;
          n.buf[k*3]=n.d.cx+n.x; n.buf[k*3+1]=n.d.cy+n.dir*n.off; n.buf[k*3+2]=n.d.r+n.ang;
        });
      }
      core = t=>{
        const p=clamp((t-zoomAt)/Tz,0,1), e=ease(p), bl=[];
        bl[i] = {cx:td.cx,cy:td.cy,r:td.r*(1-e),s:1+(S-1)*e,o:1-clamp((t-zoomAt-.4*Tz)/450,0,1)};
        const kf = clamp(t/stepMs,0,N-1.001), k0 = Math.floor(kf), f = kf-k0, o = 1-clamp((t-VB.bFade)/500,0,1);
        ns.forEach(n=>{
          const a=k0*3, b=a+3;
          bl[n.j] = {cx:n.buf[a]+(n.buf[b]-n.buf[a])*f, cy:n.buf[a+1]+(n.buf[b+1]-n.buf[a+1])*f, r:n.buf[a+2]+(n.buf[b+2]-n.buf[a+2])*f, s:1, o};
        });
        return bl;
      };
    }
    const stuAt = msgAt+20, tutAt = msgAt+770, doneAt = P('loading',vr)>0 ? tutAt+P('loading',vr) : Infinity;
    m.motionEnd = motionEnd;
    m.dur = Math.max(motionEnd, isFinite(doneAt) ? doneAt+500 : tutAt+1200);
    m.at = t=>{
      let sh=[0,0]; const tt=t-zoomAt;
      if(tt>=0 && P('shake',vr)>0){ const dec=Math.exp(-tt/140); if(dec>=.02){ const n=Math.floor(tt/16); sh=[(hash(n+seed)*2-1)*P('shake',vr)*dec,(hash(n*1.7+seed+9)*2-1)*P('shake',vr)*dec]; } }
      return {blocks:core(t), intro:1-clamp(t/450,0,1), shake:sh,
              stu:clamp((t-stuAt)/600,0,1), tut:clamp((t-tutAt)/600,0,1), done:t>=doneAt};
    };
    return m;
  }

  function build(vr,i,seed){
    if(vr==='D') return build3(vr,i,seed);
    if(vr!=='C') return buildV1(vr,i,seed);
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a);
    const VB = vr==='C' ? cview : V, td = DEFS[i];
    const m = {variant:vr,i,seed,kind:'open',tapped:i};
    const TX = 69 + W/2 - lblOff(i), TY = 164.8;                       // where the student text sits
    const Tm = VB.bMove, mSp = springEase(V.moveSpring), mD = springMs(V.moveSpring)*1.6, mAt = VB.bMorphAt/100;
    const ease = x => x>=1 ? 1 : mSp(x*mD), lift = x => 1+.07*Math.sin(Math.PI*clamp(x,0,1));
    const fadeD = Tm*(1-mAt), g = VB.bGravity, OFF = 990;
    const ns = DEFS.map((d,j)=>j).filter(j=>j!==i).map(j=>{
      const d = DEFS[j];
      const sd=rnd(), sr=RR(-1,1), dr=RR(-1,1), st=rnd();            // fixed draw order
      const dly = (vr==='C' ? V.cRipple*Math.abs(j-i) : 0) + st*VB.bStart;
      const vy = VB.bKick, vx = dr*VB.bDrift, sg = (sd<.5?1:-1), w = sg*VB.bSpin*(1+sr*VB.bSpinRand/100), ts = .22;
      const need = (OFF-d.cy), tau = (-vy+Math.sqrt(vy*vy+2*g*Math.max(need,0)))/g + .1;
      return {j,d,dly,vy,vx,w,sg,ts,end:dly+tau};
    });
    const fallEnd = Math.max(...ns.map(n=>n.end));
    const msgAt = Tm*mAt, stuAt = msgAt, tutAt = stuAt+850, doneAt = P('loading',vr)>0 ? tutAt+P('loading',vr) : Infinity;
    m.motionEnd = Math.max(mD, fallEnd)+100;
    m.dur = Math.max(m.motionEnd, isFinite(doneAt) ? doneAt+500 : tutAt+1200);
    m.at = t=>{
      const p = ease(clamp(t/mD,0,1)), bl = [];
      const pl = clamp(t/(mD),0,1);
      const pb = Math.sin(Math.PI*clamp(p,0,1));
      bl[i] = {cx:td.cx+(TX-td.cx)*p-VB.bArc*pb, cy:td.cy+(TY-td.cy)*p, r:td.r*(1-clamp(p,0,1))-VB.bFlySpin*clamp(p,0,1), s:lift(pl), o:1-clamp((t-msgAt)/fadeD,0,1)};
      ns.forEach(n=>{
        const u = Math.max(0,(t-n.dly)/1000);
        const q = n.ts*(1-Math.exp(-u/n.ts));        // eased: spin and drift build up instead of starting at full speed
        bl[n.j] = {cx:n.d.cx+n.vx*q*1.6, cy:n.d.cy+n.vy*u+.5*g*u*u, r:n.d.r+n.w*(u-q)+VB.bWobble*n.sg*Math.sin(u*18)*Math.exp(-u*7), s:1, o:1};
      });
      return {blocks:bl, intro:1-clamp(t/450,0,1), shake:[0,0], rise:VB.bRise,
              stu:clamp((t-stuAt)/(fadeD+250),0,1), tut:clamp((t-tutAt)/600,0,1), done:t>=doneAt};
    };
    return m;
  }

  /* ---- BACK ("+" click: blocks fly from where they are back into the tower) and ENTER (tab entry: random start positions) ---- */
  function buildIn(kd,seed,from,variant){
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a);
    const v2 = (kd==='back' && from && from.model.variant!=='B') || (kd==='enter' && variant!=='B');
    const r2 = rng((seed^0x9e3779b9)>>>0), R2 = (a,b)=>a+r2()*(b-a), ph = ((seed>>>0)%1000)/1000*Math.PI*2;
    const vr = kd==='back' ? from.model.variant : variant, Kd = kd==='back'?'Back':'Enter';
    const rr = P('rand'+Kd,vr)/100, spC = V[kd+'Spring'+SUF[vr]], spE = springEase(spC), D = springMs(spC)*1.6, ease = p => p>=1 ? 1 : spE(p*D);
    const st0 = from ? from.model.at(from.t) : null;
    const m = {kind:kd,seed,tapped:-1,i:from?from.model.i:0};
    const items = DEFS.map((d,j)=>{
      const mid = (DEFS.length-1)/2, side = j<mid?-1:(j>mid?1:0);
      const dly = (kd==='enter' ? (v2 ? 0 : Math.abs(j-mid)) : (v2 ? DEFS.length-1-j : j))*(v2?P('stagger'+Kd,vr)*1.3:P('stagger'+Kd,vr)) + (kd==='enter' ? (v2 ? R2(0,1)*P('stagger'+Kd,vr)*3 : RR(0,1)*rr*120) : 0) + (kd==='enter'&&!v2?P('inLead',vr):0);
      const dist = 420+RR(0,1)*300*rr, rot = RR(-1,1)*80*rr, xo = RR(-1,1);     // fixed draw order
      let sx,sy,sr,ss=1,so=0;
      if(kd==='enter' && v2){            // V2: blocks start close to their place, pushed outward (upper ones above, lower ones below), organically tilted
        const hx = (R2(0,1)<.5?-1:1)*(130+R2(0,1)*150), vy = side*(110+R2(0,1)*140) + (side===0?0:0), tl = (R2(0,1)<.5?-1:1)*(16+R2(0,1)*30)*rr;
        sx = d.cx+hx; sy = d.cy+vy; sr = d.r+tl; ss = 1; so = 0; }
      else if(kd==='back' && v2){ sx=d.cx+xo*170; sy=910+RR(0,1)*60+j*14; sr=d.r+rot*.6; ss=1; so=1; }   // V2: rise from just below the screen, random sideways / tilt
      else if(kd==='back'){
        const b = st0.blocks[j];
        if(j===from.model.i || b.s>1.2){ sx=d.cx; sy=d.cy; sr=d.r; ss=1; so=0; }   // the selected block just fades back in at its place
        else { sx=b.cx; sy=b.cy; sr=b.r; ss=b.s; so=b.o; }
      } else if(side===0){ sx=d.cx; sy=d.cy; sr=d.r; ss=.88; so=0; }          // middle block simply appears
      else { sx=d.cx+xo*300*rr; sy=d.cy+side*dist*.7; sr=d.r+rot; }           // upper blocks come from above, lower from below
      return {d,dly:dly+(kd==='back'?(P('blocksAtBack',vr)||0):0),sx,sy,sr,ss,so};
    });
    const introAt = kd==='enter' ? (v2 ? P('textEnter',vr) : 0) : D*((P('introAtBack',vr)??45)/100), stu0 = st0?st0.stu:0, tut0 = st0?st0.tut:0, done0 = st0?st0.done:false, in0 = st0?st0.intro:0;
    const motion = Math.max(...items.map(it=>it.dly+D));
    m.motionEnd = motion+100; m.dur = Math.max(motion+100, introAt+(kd==='back'?(P('introInBack',vr)??450):450)+50, kd==='back'?500:0);
    const kb0 = st0 && st0.kb ? st0.kb : 0;
    m.at = t=>({ kb: kb0 ? kb0*(1-kbEase(t)) : undefined,
      blocks: items.map(it=>{
        const pe = ease((t-it.dly)/D);
        return {cx:it.sx+(it.d.cx-it.sx)*pe, cy:it.sy+(it.d.cy-it.sy)*pe, r:it.sr+(it.d.r-it.sr)*pe, s:it.ss+(1-it.ss)*pe,
                o:it.so+(1-it.so)*bezOpa((t-it.dly)/350)};
      }),
      intro: in0+(1-in0)*clamp((t-introAt)/(kd==='back'?(P('introInBack',vr)??450):450),0,1), shake:[0,0],
      stu: stu0*(1-clamp(t/(kd==='back'?(P('chatOutBack',vr)??450):450),0,1)), tut: tut0*(1-clamp(t/(kd==='back'?(P('chatOutBack',vr)??450):450),0,1)), done: done0
    });
    return m;
  }

  /* ---- timeline state + player ---- */
                  // per variant: last {open:{i,seed}, back:{seed,fromT}, enter:{seed}}
  /* ---- user action first: finger down -> release -> then the animation plays ---- */
  const PLUS_PT = [367,92], TAB_PT = [202,829], PRESS_AT = 60;
  function withTap(m,pt,block,vr,kd){
    const L = P('tap'+({open:'Open',back:'Back',enter:'Enter',focus:'Focus',blur:'Blur',send:'Send'}[kd]),vr), base = m.at;
    m.tapLead = L; m.dur += L; m.motionEnd += L; m.tapPt = pt; m.tapBlock = block;
    m.at = t=>{
      const st = base(Math.max(0,t-L)), age = t-L;
      st.touch = t<L ? {x:pt[0],y:pt[1],s:.7+.3*clamp((t-PRESS_AT+60)/90,0,1),o:clamp(t/PRESS_AT,0,1),cur:0}
                     : {x:pt[0],y:pt[1],s:1+.25*clamp(age/220,0,1),o:1-clamp(age/220,0,1),cur:0};
      st.pressed = block>=0 && t>=PRESS_AT;
      return st;
    };
    return m;
  }
  /* ---- IDLE: cursor sweeps over the tower, each block wiggles once on hover ---- */
  function buildIdle(seed,variant){
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a), a = P('wiggle',variant)/100;
    const m = {kind:'idle',seed,tapped:-1,i:0};
    const GAP = 520, T0 = 260, ez = bez(.4,0,.2,1), spE = springEase({visualDuration:.5,bounce:.4}), spD = 800;
    const items = DEFS.map((d,j)=>({d,e:T0+j*GAP-70,at:T0+j*GAP,hx:RR(-1,1)*5*a,hy:RR(-1,1)*4*a,hr:RR(-1,1)*5*a}));
    const path = [{t:0,x:330,y:330}].concat(items.map(it=>({t:it.at,x:it.d.cx+30,y:it.d.cy})),[{t:T0+DEFS.length*GAP+200,x:340,y:780}]);
    m.motionEnd = path[path.length-1].t; m.dur = m.motionEnd+300;
    m.at = t=>{
      let k = 0; while(k<path.length-2 && t>=path[k+1].t) k++;
      const A = path[k], B = path[k+1], f = ez(clamp((t-A.t)/(B.t-A.t),0,1));
      let hov = -1;
      const blocks = items.map((it,j)=>{
        const dt = t-it.e;
        let w = 0;
        if(dt>=0 && dt<110) w = ez(clamp(dt/70,0,1)); else if(dt>=110) w = (dt-110)>=spD ? 0 : 1-spE(dt-110);
        const nxt = j<items.length-1 ? items[j+1].e : Infinity;
        if(t>=it.e && t<nxt && t<path[path.length-1].t-250) hov = j;
        return {cx:it.d.cx+it.hx*w, cy:it.d.cy+it.hy*w, r:it.d.r+it.hr*w, s:1, o:1};
      });
      return {blocks,intro:1,shake:[0,0],stu:0,tut:0,done:false,hover:hov,
              touch:{x:A.x+(B.x-A.x)*f,y:A.y+(B.y-A.y)*f,s:1,o:1,cur:1}};
    };
    return m;
  }
  function timeScale(m,kd,vr){            // total-duration slider: time-scale the whole motion to a target length (0 = natural)
    const D = P({open:'durOpen',back:'durBack',enter:'durEnter',focus:'durFocus',blur:'durBlur',send:'durSend'}[kd],vr); if(!D || !m || !(m.motionEnd>0)) return m;
    const f = D/m.motionEnd, base = m.at;
    m.at = t=>base(t/f); m.dur *= f; m.motionEnd = D; return m;
  }
  function modelFor(vr,kd,ks){
    const e = ks[vr][kd]; if(!e) return null;
    if(kd==='idle') return buildIdle(e.seed,vr);
    if(kd==='focus' || kd==='blur' || kd==='send'){ if(vr!=='D') return null;
      if(kd==='focus') return withTap(timeScale(buildFocus(vr,e.seed),'focus',vr),FIELD.fieldPt,-1,vr,'focus');
      if(kd==='send') return withTap(timeScale(buildSend(vr,e.seed,e.text),'send',vr),[FIELD.sendPt[0],FIELD.sendPt[1]+KB.inputDy],-1,vr,'send');
      const f = ks[vr].focus || {seed:1}, fm = buildFocus(vr,f.seed);
      return withTap(timeScale(buildBlur(vr,e.seed,{model:fm,t:Math.min(e.fromT,fm.dur)}),'blur',vr),[200,300],-1,vr,'blur'); }
    if(kd==='open') return withTap(timeScale(build(vr,e.i,e.seed),'open',vr),[DEFS[e.i].cx,DEFS[e.i].cy],e.i,vr,'open');
    if(kd==='back'){ const o = ks[vr].open, sd = ks[vr].send; if(e.from==='send' && sd && vr==='D'){ const sm = buildSend(vr,sd.seed,sd.text); return withTap(timeScale(buildIn('back',e.seed,{model:sm,t:Math.min(e.fromT,sm.dur)},vr),'back',vr),PLUS_PT,-1,vr,'back'); } if(!o) return null; const om = build(vr,o.i,o.seed); return withTap(timeScale(buildIn('back',e.seed,{model:om,t:Math.min(e.fromT,om.dur)},vr),'back',vr),PLUS_PT,-1,vr,'back'); }
    return withTap(timeScale(buildIn('enter',e.seed,null,vr),'enter',vr),TAB_PT,-1,vr,'enter');
  }

  /* ================= V3 OPEN: the block IS the message =================
     The label flies up-left and lands exactly on the student text line; on the way the surface fades and the text
     takes the message style. Geometry measured in this screen (artboard px):
       student text line: left 68, top 153.8, line height 19.6  -> line centre 163.6 (phone content box)
       block label: left edge 44 from the block's outer left edge (border + 16 padding + 17 icon + 10 gap, as rendered), centred */
  const FLY = {textLeft:68, textCy:163.6, labelLeft:44, labelDy:0, chipFont:12, msgFont:14};
  function build3(vr,i,seed){
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a), td = DEFS[i];
    const m = {variant:vr,i,seed,kind:'open',tapped:i};
    const TX = FLY.textLeft-FLY.labelLeft+W/2, TY = FLY.textCy-FLY.labelDy;
    const sx = springEase(V.flyXSpring), sy = springEase(V.flyYSpring);
    const bx = springMs(V.flyXSpring)*1.6, by = springMs(V.flyYSpring)*1.6;
    const ex = t => t>=bx ? 1 : sx(t), ey = t => t>=by ? 1 : sy(t);
    const F = Math.max(springMs(V.flyXSpring),springMs(V.flyYSpring)), flightEnd = Math.max(bx,by);   // % tweaks refer to F
    const surfAt = F*V.fSurfAt/100, surfD = Math.max(1,F*V.fSurfDur/100), txtAt = F*V.fTextAt/100, txtD = Math.max(1,F*V.fTextDur/100);
    const metaAt = F*V.fMetaAt/100, tutAt = F+V.fTutorDelay, straight = Math.max(.01,V.fStraighten/100), g = V.dGravity, OFF = 990;
    const ns = DEFS.map((d,j)=>j).filter(j=>j!==i).map(j=>{
      const d = DEFS[j];
      const sd=rnd(), sr=RR(-1,1), dr=RR(-1,1), st=rnd();            // fixed draw order (same as V2)
      const dly = V.dRipple*Math.abs(j-i) + st*V.dStart;
      const vy = V.dKick, vx = dr*V.dDrift, sg = (sd<.5?1:-1), w = sg*V.dSpin*(1+sr*V.dSpinRand/100), ts = .22;
      const tau = (-vy+Math.sqrt(vy*vy+2*g*Math.max(OFF-d.cy,0)))/g + .1;
      return {j,d,dly,vy,vx,w,sg,ts,end:dly+tau};
    });
    const K = FLY.msgFont/FLY.chipFont, doneAt = P('loading',vr)>0 ? tutAt+P('loading',vr) : Infinity;
    m.motionEnd = Math.max(flightEnd, metaAt+V.fMetaFade, ...ns.map(n=>n.end))+100;
    m.dur = Math.max(m.motionEnd, isFinite(doneAt) ? doneAt+500 : tutAt+1200);
    m.at = t=>{
      const pf = clamp(t/F,0,1), landed = t>=flightEnd, bl = [], txe = bezOpa(clamp((t-txtAt)/txtD,0,1));
      bl[i] = {cx:td.cx+(TX-td.cx)*ex(t), cy:td.cy+(TY-td.cy)*ey(t), r:td.r*(1-bezMsg(clamp(pf/straight,0,1))), s:1+V.fLift/100*Math.sin(Math.PI*pf), o:landed?0:1};
      ns.forEach(n=>{
        const u = Math.max(0,(t-n.dly)/1000), q = n.ts*(1-Math.exp(-u/n.ts));
        bl[n.j] = {cx:n.d.cx+n.vx*q*1.6, cy:n.d.cy+n.vy*u+.5*g*u*u, r:n.d.r+n.w*(u-q)+V.dWobble*n.sg*Math.sin(u*18)*Math.exp(-u*7), s:1, o:1};
      });
      return {blocks:bl, intro:1-clamp(t/450,0,1), shake:[0,0], rise:V.fMetaRise,
              stu:clamp((t-metaAt)/Math.max(1,V.fMetaFade),0,1), stuText:landed?1:0, tut:clamp((t-tutAt)/600,0,1), done:t>=doneAt,
              morph:{i, surface:1-bezOpa(clamp((t-surfAt)/surfD,0,1)), chip:1-txe, chipScale:1+(K-1)*txe, msg:txe, msgScale:1/K+(1-1/K)*txe}};
    };
    return m;
  }


  /* ================= V3 FOCUS · BACK OUT · SEND: starting a chat from the message field =================
     Focus: tapping the field brings up the keyboard; all blocks break away (same physics as the untapped blocks in Open).
     Back out: leaving the field without sending; the keyboard goes down and the blocks rise back.
     Send: the typed text lifts out of the field and lands on the student message line (same idea as V3 Open).
     The keyboard is the system's: its slide is fixed (not a dial). Geometry measured in this screen (artboard px). */
  const KB = {h:336, inputDy:-245, curve:{visualDuration:.38,bounce:0}};
  const FIELD = {textLeft:81, textCy:755, sendPt:[358,755], fieldPt:[221,755]};
  const SAMPLE = 'Explain photosynthesis';
  const FS_T = [
    T('durFocus3','Focus: total duration',0,3000,10,0,' ms','Stretch or squeeze the whole Focus animation','Total length after the tap. Time-scales the whole animation.','0 = natural length.','Slow motion.','The whole Focus animation.'),
    T('tapFocus3','Tap: press duration',100,800,10,150,' ms','How long the finger is down','Shared press time for every interaction.','Quick tap.','Long press.','The start of Focus.'),
    T('blocksAtFocus3','Blocks let go after',0,600,10,40,' ms','When the blocks start to break away, after the keyboard starts','The keyboard starts sliding up right after the tap; the blocks let go this much later.','Together with the keyboard.','After the keyboard is up.','The blocks during Focus.'),
    T('gRipple3','Ripple (bottom first)',0,200,5,35,' ms','Delay between blocks, starting at the bottom','The keyboard comes from below, so the lowest block lets go first, then the ones above.','All at once.','Slow domino upwards.','The order in which the blocks leave.'),
    T('gKick3','Initial push',-400,900,10,-60,' px/s','Start speed downwards','Negative = a small hop up first, as if the blocks get released.','They just let go.','Shoved down.','The first 150 ms of the fall.'),
    T('gGravity3','Gravity',400,7000,50,3500,' px/s²','How fast the blocks fall','Acceleration of the falling blocks.','Floaty.','Heavy drop.','The falling blocks.'),
    T('gSpin3','Spin',0,700,5,200,' °/s','How fast the blocks rotate while falling','Each block gets its own speed and direction.','No tumbling.','Wild tumbling.','The falling blocks.'),
    T('gDrift3','Sideways drift',0,500,5,220,' px/s','Random sideways speed','Each block drifts left or right by a random amount.','Straight down.','Scattered.','The falling blocks.'),
    T('durBlur3','Back out: total duration',0,3000,10,0,' ms','Stretch or squeeze the whole Back out animation','Total length after the tap. Time-scales the whole animation.','0 = natural length.','Slow motion.','The whole Back out animation.'),
    T('tapBlur3','Tap: press duration',100,800,10,150,' ms','How long the finger is down','Shared press time for every interaction.','Quick tap.','Long press.','The start of Back out.'),
    T('blocksAtBlur3','Blocks start after',0,800,10,80,' ms','When the blocks start to rise, after the keyboard starts going down','The keyboard goes down right after the tap; the blocks rise this much later.','Together with the keyboard.','After the keyboard is gone.','The blocks during Back out.'),
    T('staggerBlur3','Stagger',0,300,5,45,' ms','Delay between blocks (bottom first)','Delay between one block and the next one starting to rise.','All at once.','One after another.','The order in which the blocks land.'),
    T('durSend3','Send: total duration',0,3000,10,0,' ms','Stretch or squeeze the whole Send animation','Total length after the tap. Time-scales the whole animation.','0 = natural length.','Slow motion.','The whole Send animation.'),
    T('tapSend3','Tap: press duration',100,800,10,150,' ms','How long the finger is down','Shared press time for every interaction.','Quick tap.','Long press.','The start of Send.'),
    T('sMetaAt3','Avatar + name in at',0,150,1,72,' %','When avatar and “Student - 10:32” appear','Share of the flight after which avatar and name fade in around the landing text.','Before landing.','After landing.','The student message.'),
    T('sMetaFade3','Avatar + name fade',0,1000,10,240,' ms','Fade length of avatar and name','How long avatar and name take to fade in.','Pop.','Slow.','The student message.'),
    T('sMetaRise3','Avatar + name rise',0,60,1,8,' px','How far avatar and name rise while fading in','The text line itself never moves: the text lands on it.','Only fades.','Long rise.','The student message.'),
    T('sTutorDelay3','Brian after landing',0,1500,10,350,' ms','When Brian’s message appears','Delay after the flight before Brian’s message fades in.','Right away.','Late.','The chat after landing.')
  ];
  FS_T.forEach(t=>{ CAT.D.push(t); ALL[t.k] = t; DEF[t.k] = t.def; });
  DEF.blurSpring3 = {visualDuration:.6,bounce:.18}; DEF.sendYSpring = {visualDuration:.55,bounce:.12}; DEF.sendXSpring = {visualDuration:.62,bounce:.06};
  ['blurSpring3','sendYSpring','sendXSpring'].concat(FS_T.map(t=>t.k)).forEach(k=>{ if(V[k]===undefined) V[k] = JSON.parse(JSON.stringify(DEF[k])); });   // values set before these existed
  const kbEase = (()=>{ const e = springEase(KB.curve), d = springMs(KB.curve)*1.6; return t=>t>=d ? 1 : e(t); })();
  const KB_END = springMs(KB.curve)*1.6;
  const atRest = d=>({cx:d.cx,cy:d.cy,r:d.r,s:1,o:1}), gone = d=>({cx:d.cx,cy:1100,r:d.r,s:1,o:0});

  function buildFocus(vr,seed){
    const rnd = rng(seed), RR = (a,b)=>a+rnd()*(b-a), g = V.gGravity3, OFF = 990;
    const m = {variant:vr,seed,kind:'focus',tapped:-1,i:0};
    const ns = DEFS.map((d,j)=>{
      const sd=rnd(), sr=RR(-1,1), dr=RR(-1,1);                       // fixed draw order
      const dly = V.blocksAtFocus3 + V.gRipple3*(DEFS.length-1-j);
      const vy = V.gKick3, vx = dr*V.gDrift3, sg = (sd<.5?1:-1), w = sg*V.gSpin3*(1+sr*.55), ts = .22;
      const tau = (-vy+Math.sqrt(vy*vy+2*g*Math.max(OFF-d.cy,0)))/g + .1;
      return {j,d,dly,vy,vx,w,sg,ts,end:dly+tau*1000};
    });
    m.motionEnd = Math.max(KB_END, ...ns.map(n=>n.end))+60; m.dur = m.motionEnd+200;
    m.at = t=>({ blocks: ns.map(n=>{ const u = Math.max(0,(t-n.dly)/1000), q = n.ts*(1-Math.exp(-u/n.ts));
        return {cx:n.d.cx+n.vx*q*1.6, cy:n.d.cy+n.vy*u+.5*g*u*u, r:n.d.r+n.w*(u-q)+7*n.sg*Math.sin(u*18)*Math.exp(-u*7), s:1, o:1}; }),
      intro:1, shake:[0,0], stu:0, tut:0, done:false, kb:kbEase(t), field:0, focus:1 });
    return m;
  }
  function buildBlur(vr,seed,from){
    const st0 = from ? from.model.at(from.t) : null, kb0 = st0 && st0.kb!==undefined ? st0.kb : 1;
    const sp = springEase(V.blurSpring3), D = springMs(V.blurSpring3)*1.6, ease = p=>p>=D ? 1 : sp(p);
    const m = {variant:vr,seed,kind:'blur',tapped:-1,i:0};
    const items = DEFS.map((d,j)=>{ const b0 = st0 ? st0.blocks[j] : gone(d), out = !st0 || b0.cy>900;
      return {d, dly:V.blocksAtBlur3 + V.staggerBlur3*(DEFS.length-1-j), sx:out?d.cx:b0.cx, sy:out?960+j*12:b0.cy, sr:out?d.r:b0.r}; });
    const motion = Math.max(KB_END, ...items.map(it=>it.dly+D));
    m.motionEnd = motion+60; m.dur = m.motionEnd+150;
    m.at = t=>({ blocks: items.map(it=>{ const pe = ease(t-it.dly);
        return {cx:it.sx+(it.d.cx-it.sx)*pe, cy:it.sy+(it.d.cy-it.sy)*pe, r:it.sr+(it.d.r-it.sr)*pe, s:1, o:1}; }),
      intro:1, shake:[0,0], stu:0, tut:0, done:false, kb:kb0*(1-kbEase(t)), field:0, focus:t<60?1:0 });
    return m;
  }
  function buildSend(vr,seed,text){
    const m = {variant:vr,seed,kind:'send',tapped:-1,i:0,text:text||SAMPLE};
    const sx = springEase(V.sendXSpring), sy = springEase(V.sendYSpring), bx = springMs(V.sendXSpring)*1.6, by = springMs(V.sendYSpring)*1.6;
    const ex = t=>t>=bx ? 1 : sx(t), ey = t=>t>=by ? 1 : sy(t);
    const F = Math.max(springMs(V.sendXSpring),springMs(V.sendYSpring)), flightEnd = Math.max(bx,by);
    const x0 = FIELD.textLeft, y0 = FIELD.textCy+KB.inputDy, x1 = FLY.textLeft, y1 = FLY.textCy;
    const metaAt = F*V.sMetaAt3/100, tutAt = F+V.sTutorDelay3;
    m.motionEnd = Math.max(flightEnd, metaAt+V.sMetaFade3)+100; m.dur = Math.max(m.motionEnd, tutAt+1200);
    m.at = t=>{ const landed = t>=flightEnd;
      return {blocks:DEFS.map(gone), intro:1-clamp(t/450,0,1), shake:[0,0], rise:V.sMetaRise3,
        stu:clamp((t-metaAt)/Math.max(1,V.sMetaFade3),0,1), stuText:landed?1:0, tut:clamp((t-tutAt)/600,0,1), done:false,
        kb:1, field:0, focus:1, fly:{x:x0+(x1-x0)*ex(t), cy:y0+(y1-y0)*ey(t), o:landed?0:1, text:m.text}}; };
    return m;
  }

  /* ================= PANEL (which tweaks belong to which animation) ================= */
  const SPR_ALL = {moveSpring:'Open: block morph (spring)', flyYSpring:'Open: flight up (Y spring)', flyXSpring:'Open: flight left (X spring), differs from Y = arc',
    backSpring1:'Back: blocks (spring)', backSpring2:'Back: blocks (spring)', backSpring3:'Back: blocks (spring)',
    enterSpring1:'Enter: blocks (spring)', enterSpring2:'Enter: blocks (spring)', enterSpring3:'Enter: blocks (spring)',
    blurSpring3:'Back out: blocks (spring)', sendYSpring:'Send: text up (Y spring)', sendXSpring:'Send: text left (X spring), differs from Y = arc'};
  const KEYS = {back:['durBack','tapBack','staggerBack','randBack','chatOutBack','blocksAtBack','introAtBack','introInBack'], enter:['durEnter','tapEnter','staggerEnter','inLead','textEnter','randEnter','wiggle'],
    focus:['durFocus','tapFocus','blocksAtFocus','gRipple','gKick','gGravity','gSpin','gDrift'], blur:['durBlur','tapBlur','blocksAtBlur','staggerBlur'],
    send:['durSend','tapSend','sMetaAt','sMetaFade','sMetaRise','sTutorDelay']};
  const labOf = t => t.label + (t.unit.trim()?' ('+t.unit.trim()+')':'');
  function panel(vr,kind){
    const showTw = t => kind==='open'
      ? (vr==='D' ? (/^[fd][A-Z]/.test(t.k) || ['tapOpen3','loading3','durOpen3'].includes(t.k))
                  : (/^[bc][A-Z]/.test(t.k) || ['wind','shake','tapOpen','loading','durOpen'].includes(t.k.slice(0,-1))))
      : (KEYS[kind]||KEYS.enter).includes(t.k.slice(0,-1));
    const showSpr = k => kind==='send' ? (k==='sendYSpring'||k==='sendXSpring') : kind==='open' ? (vr==='C' ? k==='moveSpring' : vr==='D' ? (k==='flyYSpring'||k==='flyXSpring') : false) : k===(kind+'Spring'+SUF[vr]);
    const TW = CAT[vr].filter(showTw).sort((a,b)=>(/^dur/.test(b.k)?1:0)-(/^dur/.test(a.k)?1:0));   // total duration first
    return {tweaks:TW.map(t=>({k:t.k,label:labOf(t),def:t.def,min:t.min,max:t.max,step:t.step,unit:t.unit.trim(),what:t.what,role:roleOf(vr,kind,t.k)})),
            springs:Object.keys(SPR_ALL).filter(showSpr).map(k=>({k,label:SPR_ALL[k],def:DEF[k]}))};
  }

  /* ================= TIMELINE: which dials are "when" dials, as clips (engine ms after the tap, before total-duration scaling) =================
     Each draggable edge maps linearly to one dial: value = (t - base) / per. Locked clips follow from curves / physics. */
  const KN = {open:'Open',back:'Back',enter:'Enter',focus:'Focus',blur:'Blur',send:'Send'};
  const V3ONLY = {focus:1,blur:1,send:1};
  const visMs = c => (c.visualDuration!==undefined ? c.visualDuration : .8)*1000;
  function naturalEnd(vr,kd){                 // motion end without total-duration scaling, after the tap
    const dk = 'dur'+KN[kd]+SUF[vr], keep = V[dk]; V[dk] = 0;
    try{ const K = {[vr]:{open:{seed:1,i:1}, back:{seed:1,fromT:Infinity}, enter:{seed:1}, focus:{seed:1}, blur:{seed:1,fromT:Infinity}, send:{seed:1}}}, m = modelFor(vr,kd,K); return m ? m.motionEnd - m.tapLead : 0; }
    finally{ V[dk] = keep; }
  }
  function timeline(vr,kd){
    const s = SUF[vr];
    if(V3ONLY[kd] && vr!=='D') return {tap:{k:'tap'+KN[kd]+s}, total:{k:'dur'+KN[kd]+s, natural:0}, lanes:[]};
    const end = naturalEnd(vr,kd), L = [], lock = (lane,a,b,note)=>L.push({lane,a,b,note,locked:true});
    if(kd==='focus'){
      lock('Keyboard slides up',0,KB_END,'system');
      L.push({lane:'Blocks break away',a:V.blocksAtFocus3,b:end,note:'physics · bottom first',start:{k:'blocksAtFocus3',base:0,per:1}});
    } else if(kd==='blur'){
      lock('Keyboard goes down',0,KB_END,'system');
      L.push({lane:'Blocks rise',a:V.blocksAtBlur3,b:end,note:'spring · stagger',start:{k:'blocksAtBlur3',base:0,per:1}});
    } else if(kd==='send'){
      const F = Math.max(visMs(V.sendXSpring), visMs(V.sendYSpring)), tut = F+V.sTutorDelay3;
      lock('Text flies up',0,F,'X / Y springs'); lock('Intro fades',0,450,'');
      L.push({lane:'Avatar + name',a:F*V.sMetaAt3/100,b:F*V.sMetaAt3/100+V.sMetaFade3,start:{k:'sMetaAt3',base:0,per:F/100},end:{k:'sMetaFade3',base:F*V.sMetaAt3/100,per:1}});
      L.push({lane:'Brian',a:tut,b:tut+600,start:{k:'sTutorDelay3',base:F,per:1}});
    } else if(kd==='open' && vr==='D'){
      const F = Math.max(visMs(V.flyXSpring), visMs(V.flyYSpring)), tut = F+V.fTutorDelay;
      lock('Flight',0,F,'X / Y springs');
      L.push({lane:'Surface fades',a:F*V.fSurfAt/100,b:F*(V.fSurfAt+V.fSurfDur)/100,start:{k:'fSurfAt',base:0,per:F/100},end:{k:'fSurfDur',base:F*V.fSurfAt/100,per:F/100}});
      L.push({lane:'Text → message',a:F*V.fTextAt/100,b:F*(V.fTextAt+V.fTextDur)/100,start:{k:'fTextAt',base:0,per:F/100},end:{k:'fTextDur',base:F*V.fTextAt/100,per:F/100}});
      L.push({lane:'Avatar + name',a:F*V.fMetaAt/100,b:F*V.fMetaAt/100+V.fMetaFade,start:{k:'fMetaAt',base:0,per:F/100},end:{k:'fMetaFade',base:F*V.fMetaAt/100,per:1}});
      L.push({lane:'Brian',a:tut,b:tut+600,start:{k:'fTutorDelay',base:F,per:1}});
      L.push({lane:'Loading dots',a:tut,b:tut+V.loading3,end:{k:'loading3',base:tut,per:1}});
      lock('Other blocks fall',V.dRipple,end,'physics');
    } else if(kd==='open' && vr==='C'){
      const msgAt = V.cMove*V.cMorphAt/100;
      lock('Block flies',0,springMs(V.moveSpring)*1.6,'open spring');
      L.push({lane:'Student message',a:msgAt,b:msgAt+V.cMove*(1-V.cMorphAt/100)+250,start:{k:'cMorphAt',base:0,per:V.cMove/100}});
      lock('Brian',msgAt+850,msgAt+1450,'+850 ms');
      L.push({lane:'Loading dots',a:msgAt+850,b:msgAt+850+V.loading2,end:{k:'loading2',base:msgAt+850,per:1}});
      lock('Other blocks fall',V.cRipple,end,'physics');
    } else if(kd==='open'){
      const za = Math.max(0,-V.bOffset||0);
      L.push({lane:'Zoom',a:za,b:za+V.bZoom,end:{k:'bZoom',base:za,per:1}});
      lock('Neighbours pushed',0,end,'physics'); lock('Messages',za+V.bZoom*.55,end,'');
    } else if(kd==='enter'){
      if(vr==='B'){ lock('Text + illustration',0,450,''); L.push({lane:'Blocks fly in',a:V.inLead1,b:end,start:{k:'inLead1',base:0,per:1}}); }
      else { lock('Blocks fly in',0,end,'spring · stagger'); L.push({lane:'Text appears',a:V['textEnter'+s],b:V['textEnter'+s]+450,start:{k:'textEnter'+s,base:0,per:1}}); }
    } else {
      const D = springMs(V['backSpring'+s])*1.6, co = V['chatOutBack'+s], ba = V['blocksAtBack'+s], ia = D*V['introAtBack'+s]/100, il = V['introInBack'+s];
      L.push({lane:'Chat fades out',a:0,b:co,end:{k:'chatOutBack'+s,base:0,per:1}});
      L.push({lane:'Blocks rise',a:ba,b:end,note:'spring · stagger',start:{k:'blocksAtBack'+s,base:0,per:1}});
      L.push({lane:'Intro fades in',a:ia,b:ia+il,start:{k:'introAtBack'+s,base:0,per:D/100},end:{k:'introInBack'+s,base:ia,per:1}});
    }
    return {tap:{k:'tap'+KN[kd]+s}, total:{k:'dur'+KN[kd]+s, natural:end}, lanes:L};
  }
  /* roles: duration (timeline end), timing (timeline clips + tap), interaction (out of the way), feel (panel) */
  function roleOf(vr,kd,k){
    if(/^dur/.test(k)) return 'duration';
    if(/^wiggle/.test(k) || /^tap/.test(k)) return 'interaction';   // taps / presses use the package's shared interaction defaults
    const t = timeline(vr,kd), keys = new Set([t.tap.k]); t.lanes.forEach(c=>{ if(c.start) keys.add(c.start.k); if(c.end) keys.add(c.end.k); });
    return keys.has(k) ? 'timing' : 'feel';
  }

  /* ================= TEST VECTORS (fixed seeds, sampled frames) ================= */
  const VEC_T = [0,100,170,300,500,800,1200,1600,2200];
  function vectors(vr,values){
    const keep = V; if(values) setValues(Object.assign({},DEF,values));
    const KS = {}; KS[vr] = {open:{seed:12345,i:1}, back:{seed:777,fromT:Infinity}, enter:{seed:999}, focus:{seed:4242}, blur:{seed:5151,fromT:Infinity}, send:{seed:6262}};
    const rd = v=>Math.round(v*100)/100, out = {T:VEC_T};
    try{ ['open','back','enter'].concat(vr==='D'?['focus','blur','send']:[]).forEach(kd=>{ const m = modelFor(vr,kd,KS);
      out[kd] = {duration:rd(m.dur),s:VEC_T.map(t=>{ const st = m.at(t); return {b:st.blocks.map(b=>[rd(b.cx),rd(b.cy),rd(b.r),rd(b.s),rd(b.o)]),intro:rd(st.intro),stu:rd(st.stu),tut:rd(st.tut)}; })}; }); }
    finally{ setValues(keep); }
    return out;
  }

  /* ================= REFERENCE-CODE PARAMS (V2 handoff: TS + Dart) ================= */
  function refParams(){
  const nf = v=>String(+(+v).toFixed(4));
  const spTS = c=>c.visualDuration!==undefined ? '{ visualDuration: '+nf(c.visualDuration)+', bounce: '+nf(c.bounce||0)+' }' : '{ stiffness: '+nf(c.stiffness)+', damping: '+nf(c.damping)+', mass: '+nf(c.mass)+' }';
  const spDT = c=>c.visualDuration!==undefined ? 'SpringCfg.visual('+nf(c.visualDuration)+', '+nf(c.bounce||0)+')' : 'SpringCfg.physics('+nf(c.stiffness)+', '+nf(c.damping)+', '+nf(c.mass)+')';
  function codeValues(){
    const g = n=>P(n,'C'), c = V;
    return {open:{tap:g('tapOpen'),total:g('durOpen'),move:c.cMove,morphAt:c.cMorphAt/100,rise:c.cRise,gravity:c.cGravity,kick:c.cKick,spin:c.cSpin,spinRand:c.cSpinRand,drift:c.cDrift,start:c.cStart,wobble:c.cWobble,flySpin:c.cFlySpin,arc:c.cArc,ripple:c.cRipple,loading:g('loading'),spring:c.moveSpring},
            back:{tap:g('tapBack'),total:g('durBack'),stagger:g('staggerBack'),rand:g('randBack')/100,spring:c.backSpring2},
            enter:{tap:g('tapEnter'),total:g('durEnter'),stagger:g('staggerEnter'),rand:g('randEnter')/100,textAt:g('textEnter'),spring:c.enterSpring2},
            wiggle:g('wiggle')/100};
  }
    const v = codeValues();
    const ts = '// <<PARAMS\nexport const P = {\n'
      + '  open:  { tap: '+nf(v.open.tap)+', total: '+nf(v.open.total)+', move: '+nf(v.open.move)+', morphAt: '+nf(v.open.morphAt)+', rise: '+nf(v.open.rise)+', gravity: '+nf(v.open.gravity)+', kick: '+nf(v.open.kick)+', spin: '+nf(v.open.spin)+', spinRand: '+nf(v.open.spinRand)+',\n'
      + '           drift: '+nf(v.open.drift)+', start: '+nf(v.open.start)+', wobble: '+nf(v.open.wobble)+', flySpin: '+nf(v.open.flySpin)+', arc: '+nf(v.open.arc)+', ripple: '+nf(v.open.ripple)+', loading: '+nf(v.open.loading)+',\n'
      + '           spring: '+spTS(v.open.spring)+' as Spring },\n'
      + '  back:  { tap: '+nf(v.back.tap)+', total: '+nf(v.back.total)+', stagger: '+nf(v.back.stagger)+', rand: '+nf(v.back.rand)+', spring: '+spTS(v.back.spring)+' as Spring },\n'
      + '  enter: { tap: '+nf(v.enter.tap)+', total: '+nf(v.enter.total)+', stagger: '+nf(v.enter.stagger)+', rand: '+nf(v.enter.rand)+', textAt: '+nf(v.enter.textAt)+', spring: '+spTS(v.enter.spring)+' as Spring },\n'
      + '  wiggle: '+nf(v.wiggle)+',   // desktop hover wiggle strength (0 = off)\n};\n// PARAMS>>';
    const dt = '// <<PARAMS\nclass OpenP {\n  static const tap = '+nf(v.open.tap)+', total = '+nf(v.open.total)+', move = '+nf(v.open.move)+', morphAt = '+nf(v.open.morphAt)+', rise = '+nf(v.open.rise)+', gravity = '+nf(v.open.gravity)+', kick = '+nf(v.open.kick)+',\n'
      + '      spin = '+nf(v.open.spin)+', spinRand = '+nf(v.open.spinRand)+', drift = '+nf(v.open.drift)+', start = '+nf(v.open.start)+', wobble = '+nf(v.open.wobble)+', flySpin = '+nf(v.open.flySpin)+', arc = '+nf(v.open.arc)+', ripple = '+nf(v.open.ripple)+', loading = '+nf(v.open.loading)+';\n'
      + '  static final spring = '+spDT(v.open.spring)+';\n}\n'
      + 'class BackP { static const tap = '+nf(v.back.tap)+', total = '+nf(v.back.total)+', stagger = '+nf(v.back.stagger)+', rand = '+nf(v.back.rand)+'; static final spring = '+spDT(v.back.spring)+'; }\n'
      + 'class EnterP { static const tap = '+nf(v.enter.tap)+', total = '+nf(v.enter.total)+', stagger = '+nf(v.enter.stagger)+', rand = '+nf(v.enter.rand)+', textAt = '+nf(v.enter.textAt)+'; static final spring = '+spDT(v.enter.spring)+'; }\n'
      + 'const wiggleAmount = '+nf(v.wiggle)+';   // desktop hover wiggle strength (0 = off)\n// PARAMS>>';
    const rows = [['Open','total '+nf(v.open.total)+' ms, tap '+nf(v.open.tap)+', move '+nf(v.open.move)+', morphAt '+Math.round(v.open.morphAt*100)+' %, rise '+nf(v.open.rise)+', gravity '+nf(v.open.gravity)+', kick '+nf(v.open.kick)+', spin '+nf(v.open.spin)+' (rand '+nf(v.open.spinRand)+' %), drift '+nf(v.open.drift)+', start '+nf(v.open.start)+', wobble '+nf(v.open.wobble)+', flySpin '+nf(v.open.flySpin)+', arc '+nf(v.open.arc)+', ripple '+nf(v.open.ripple)+', loading '+nf(v.open.loading)],
      ['Open spring',spTS(v.open.spring)],['Back','total '+nf(v.back.total)+' ms, tap '+nf(v.back.tap)+', stagger '+nf(v.back.stagger)+', rand '+Math.round(v.back.rand*100)+' %, spring '+spTS(v.back.spring)],
      ['Enter','total '+nf(v.enter.total)+' ms, tap '+nf(v.enter.tap)+', stagger '+nf(v.enter.stagger)+', rand '+Math.round(v.enter.rand*100)+' %, text at '+nf(v.enter.textAt)+', spring '+spTS(v.enter.spring)],['Hover wiggle (desktop)',Math.round(v.wiggle*100)+' %']];
    const table = '| Animation | Value |\n|---|---|\n'+rows.map(r=>'| '+r[0]+' | '+r[1]+' |').join('\n');
    return {ts, dart:dt, table};
  }

  /* ================= VIEW: binds frames to the screen markup ================= */
  function mount(phone, api){
    const blocksEl = phone.querySelector('#blocks'), intro = phone.querySelector('#intro'), chat = phone.querySelector('#chat');
    blocksEl.innerHTML = ''; chat.innerHTML = '';
    function setPose(el,x,y,r){ el.style.setProperty('--x',x+'px'); el.style.setProperty('--y',y+'px'); el.style.setProperty('--r',r+'deg'); }
    const blocks = DEFS.map((d,i)=>{
      const el = document.createElement('div');
      el.className = 'block';
      setPose(el, d.cx-W/2, d.cy-H/2, d.r);
      el.innerHTML = '<div class="wob rest"><div class="card" style="--ir:'+d.ir+'deg">'
        + '<span class="ic">'+I[d.icon]+'</span><span class="tx">'+d.label+'</span><span class="tx2" aria-hidden="true">'+d.label+'</span><i class="a"></i><i class="b"></i><i class="c"></i></div></div>';
      el.addEventListener('click',()=>{ el.classList.remove('pressed'); api.onBlock(i); });
      return el;
    });
    blocks.forEach(b=>blocksEl.appendChild(b));
    const wobs = blocks.map(b=>b.querySelector('.wob'));
    /* hover wiggle (once on enter) + press state */
    function wob(i,amount){
      const w = wobs[i], a = P('wiggle',api.variant())/100*amount;
      w.classList.remove('rest');
      w.style.setProperty('--hx', (R(-1,1)*5*a)+'px'); w.style.setProperty('--hy', (R(-1,1)*4*a)+'px'); w.style.setProperty('--hr', (R(-1,1)*5*a)+'deg');
    }
    function settle(i){ const w = wobs[i]; w.classList.add('rest'); w.style.setProperty('--hx','0px'); w.style.setProperty('--hy','0px'); w.style.setProperty('--hr','0deg'); }
    blocks.forEach((b,i)=>{
      b.addEventListener('mouseenter',()=>{ if(!HOVER || api.opened()||P('wiggle',api.variant())<=0) return; wob(i,1); setTimeout(()=>settle(i),110); });
      b.addEventListener('mouseleave',()=>settle(i));
      b.addEventListener('pointerdown',()=>{ if(!api.opened()) b.classList.add('pressed'); });
      ['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>{ if(!api.opened()) b.classList.remove('pressed'); }));
    });
    phone.querySelector('#newChat').addEventListener('click',()=>api.onPlus());
    /* V3 field: system keyboard stand-in, flying text, simulated typing (any key types the sample prompt) */
    const inputEl = phone.querySelector('#input'), fieldEl = phone.querySelector('#field'), txt = phone.querySelector('#txt');
    txt.readOnly = true; txt.setAttribute('inputmode','none');
    const kbd = document.createElement('div'); kbd.className = 'kbd'; kbd.setAttribute('aria-hidden','true');
    kbd.innerHTML = '<div class="sug"><span>„Explain“</span><span>the</span><span>I</span></div>' + ['qwertzuiopü','asdfghjklöä'].map(r=>'<div class="row">'+[...r].map(c=>'<i>'+c+'</i>').join('')+'</div>').join('')
      + '<div class="row"><i class="w">⇧</i>'+[...'yxcvbnm'].map(c=>'<i>'+c+'</i>').join('')+'<i class="w">⌫</i></div><div class="row"><i class="w">123</i><i class="w">☺</i><i class="sp"></i><i class="go">↵</i></div>';
    phone.appendChild(kbd);
    const fly = document.createElement('div'); fly.className = 'flytext'; phone.appendChild(fly);
    let typed = '';
    const typeNext = ()=>{ if(typed.length < SAMPLE.length){ typed = SAMPLE.slice(0, typed.length+1); txt.value = typed; fieldEl.classList.toggle('has', !!typed); } };
    fieldEl.addEventListener('click', e=>{ e.stopPropagation(); if(e.target.closest('#send')) return; api.onField && api.onField(); });
    phone.querySelector('#send').addEventListener('click', e=>{ e.stopPropagation(); api.onSend && api.onSend(typed); });
    kbd.addEventListener('click', e=>{ e.stopPropagation(); if(e.target.closest('.go')){ api.onSend && api.onSend(typed); return; } if(phone.classList.contains('kbup')) typeNext(); });
    phone.addEventListener('click', e=>{ if(!phone.classList.contains('kbup') || e.target.closest('#input,.kbd,#header')) return; api.onOutside && api.onOutside(); });
    window.addEventListener('keydown', e=>{ if(!phone.classList.contains('kbup') || e.metaKey || e.ctrlKey || e.altKey) return;
      if(e.key==='Enter'){ e.preventDefault(); api.onSend && api.onSend(typed); } else if(e.key.length===1){ e.preventDefault(); e.stopPropagation(); typeNext(); } }, true);
    const tab = phone.querySelector('.tab.active'); if(tab){ tab.style.cursor='pointer'; tab.addEventListener('click',()=>api.onTab()); }

const HOVER = matchMedia('(hover:hover)').matches;   // touch screens fire mouseenter on tap: no hover wiggle there

  function time(){ const d=new Date(); return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0'); }
  function avatarSvg(kind){
    if(kind==='tutor') return '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="10" width="16" height="13" rx="2.5" transform="rotate(-6 16 16)"/><circle cx="13" cy="16" r="1.3" fill="#fff"/><circle cx="19" cy="15.4" r="1.3" fill="#fff"/><path d="M16 9l-.4-3.2M13 20.4h6"/><circle cx="15.5" cy="5" r="1.2"/></svg>';
    return '<svg viewBox="0 0 32 32" width="32" height="32" fill="none" stroke="#3a3a3a" stroke-width="1.1" stroke-linecap="round"><circle cx="16" cy="13" r="5"/><path d="M8 28c0-5 3.6-8 8-8s8 3 8 8"/><path d="M10.5 9.5c1-3.6 10-3.6 11 0M9 10h14"/></svg>';
  }
  function mkStudent(text){
    const m = document.createElement('div');
    m.className = 'msg student';
    m.innerHTML = '<div class="avatar">'+avatarSvg('student')+'</div><div style="flex:1;min-width:0"><div class="meta">Student - '+time()+'</div><div class="body"></div></div>';
    m.querySelector('.body').textContent = text;
    return m;
  }
  function mkTutor(){
    const m = document.createElement('div');
    m.className = 'msg tutor';
    m.innerHTML = '<div class="avatar">'+avatarSvg('tutor')+'</div><div style="flex:1;min-width:0"><div class="meta">Brian - '+time()+'</div><div class="body"><div class="dots"><i></i><i></i><i></i></div><div class="reply">Placeholder – the streamed answer would appear here.</div></div></div>';
    return m;
  }

    let cs = null, ct = null;
    function placeBlock(el,b){
      if(el._k !== b.s){ el._k = b.s; el.style.setProperty('--k',b.s); }   // only when it changes: --k re-lays out the block's text
      el.style.transform = 'translate('+(b.cx-W*b.s/2)+'px,'+(b.cy-H*b.s/2)+'px) rotate('+b.r+'deg)';
      el.style.opacity = String(b.o);
    }
    function clearMorph(el){ const c = el.querySelector('.card'); c.style.backgroundColor=c.style.borderColor=c.style.boxShadow='';
      el.querySelectorAll('.ic,.tx,.tx2,i').forEach(n=>{ n.style.opacity=''; n.style.transform=''; }); }
    function enter(model){                       // switch the screen into timeline mode for this run
      phone.classList.add('opening');
      wobs.forEach(w=>{ w.style.transition='none'; w.style.setProperty('--hx','0px'); w.style.setProperty('--hy','0px'); w.style.setProperty('--hr','0deg'); });
      intro.classList.add('hide'); intro.style.transition='none';
      chat.classList.add('tl'); chat.innerHTML='';
      if(model.kind==='focus' || model.kind==='blur'){ cs = ct = null; if(model.kind==='focus'){ typed = ''; txt.value = ''; fieldEl.classList.remove('has'); } }
      else { cs = mkStudent(model.kind==='send' ? model.text : DEFS[model.i].label); ct = mkTutor(); chat.appendChild(cs); chat.appendChild(ct); }
      blocks.forEach(b=>{ b.style.transition='none'; b.querySelector('.card').style.transition='none'; b.classList.remove('gone','pressed','tapped'); b.classList.add('blast'); clearMorph(b); });   // frames drive every value: no CSS transitions
    }
    function draw(model, st){
      st.blocks.forEach((b,j)=>placeBlock(blocks[j],b));
      intro.style.opacity = String(st.intro);
      const kb = st.kb || 0;
      kbd.style.transform = 'translateY('+((1-kb)*KB.h)+'px)'; kbd.style.visibility = kb>0.001 ? 'visible' : 'hidden';
      inputEl.style.transform = kb ? 'translateY('+(KB.inputDy*kb)+'px)' : '';
      phone.classList.toggle('kbup', kb>0.5 && model.kind!=='send' && model.kind!=='back');
      fieldEl.classList.toggle('focus', !!st.focus);
      if(model.kind==='send'){ txt.value = st.fly && st.fly.o && t0(st) ? model.text : ''; fieldEl.classList.toggle('has', !!txt.value); }
      if(st.fly && st.fly.o>0 && !t0(st)){ fly.textContent = st.fly.text; fly.style.opacity = '1'; fly.style.transform = 'translate('+st.fly.x+'px,'+(st.fly.cy-9.8)+'px)'; } else fly.style.opacity = '0';
      const tc = phone.querySelector('#touch');
      if(st.touch){ tc.classList.toggle('cur',!!st.touch.cur); tc.style.opacity = String(st.touch.o); tc.style.transform = 'translate('+st.touch.x+'px,'+st.touch.y+'px) scale('+st.touch.s+')'; } else tc.style.opacity = '0';
      blocks.forEach((b,j)=>{ b.classList.toggle('tapped', model.tapped===j && !!st.pressed); b.classList.toggle('hov', st.hover===j); });
      phone.style.transform = (st.shake[0]||st.shake[1]) ? 'translate('+st.shake[0]+'px,'+st.shake[1]+'px)' : '';
      blocks.forEach((b,j)=>{ const mo = st.morph && st.morph.i===j ? st.morph : null; if(!mo){ clearMorph(b); return; }
        const c = b.querySelector('.card'), a = mo.surface, dark = b.classList.contains('tapped') ? '58,58,58' : '255,255,255';
        c.style.backgroundColor = 'rgba('+dark+','+a+')'; c.style.borderColor = 'rgba(58,58,58,'+a+')';
        c.style.boxShadow = 'calc(3px*var(--k,1)) calc(3px*var(--k,1)) 0 rgba(58,58,58,'+a+')';
        b.querySelectorAll('.ic,i').forEach(n=>n.style.opacity=String(a));
        const t1 = b.querySelector('.tx'), t2 = b.querySelector('.tx2');
        t1.style.opacity = String(mo.chip); t1.style.transform = 'scale('+mo.chipScale+')';
        t2.style.opacity = String(mo.msg); t2.style.transform = 'scale('+mo.msgScale+')'; });
      if(cs){
        const set=(el,p,rz)=>{ el.style.opacity=String(p); el.style.transform='translateY('+(rz*(1-bezMsg(p)))+'px)'; };
        const parts = [cs.querySelector('.avatar'), cs.querySelector('.meta')], body = cs.querySelector('.body');
        if(st.stuText!==undefined){ cs.style.opacity='1'; cs.style.transform='none'; parts.forEach(p=>set(p,st.stu,st.rise)); body.style.opacity=String(st.stuText); }
        else { parts.forEach(p=>{ p.style.opacity=''; p.style.transform=''; }); body.style.opacity=''; set(cs,st.stu,st.rise===undefined?14:st.rise); }
        set(ct,st.tut,14); ct.classList.toggle('done',st.done);
      }
    }
    function clearBlock(b){ b.classList.remove('tapped','pressed','explode','blast','gone'); b.style.transform=''; b.style.opacity=''; b.style.transition=''; b.querySelector('.card').style.transition=''; b.style.removeProperty('--k'); clearMorph(b); }
    const t0 = st => st.fly && Math.abs(st.fly.x-FIELD.textLeft)<0.01 && Math.abs(st.fly.cy-(FIELD.textCy+KB.inputDy))<0.01;   // send: text still in the field
    function reset(){                            // instant reset to the home screen
      kbd.style.transform = 'translateY('+KB.h+'px)'; kbd.style.visibility = 'hidden'; inputEl.style.transform = ''; phone.classList.remove('kbup'); fieldEl.classList.remove('focus','has');
      typed = ''; txt.value = ''; fly.style.opacity = '0';
      phone.style.transform=''; intro.style.transition=''; intro.style.opacity=''; chat.classList.remove('tl'); chat.innerHTML=''; cs = ct = null;
      blocks.forEach((b,j)=>{ clearBlock(b); setPose(b,DEFS[j].cx-W/2,DEFS[j].cy-H/2,DEFS[j].r); settle(j); });
      intro.classList.remove('hide'); phone.classList.remove('opening');
      wobs.forEach(w=>w.style.transition='');
    }
    /* layout spec: what the developer needs to rebuild the screen (measured by the workbench) */
    function specTargets(state){
      const q = s=>phone.querySelector(s);
      if(state==='home') return [
        ['Status bar',q('#status')],['Status time',q('#status .time')],['Header',q('#header')],['Menu button',q('#header .ibtn')],['Title',q('#header h1')],
        ['New chat “+” (Back trigger)',q('#newChat')],['Intro (empty state)',q('#intro')],['Illustration',q('#illu')],['Headline',q('#intro h2')],['Subtitle',q('#intro p')],
        ['Block card (inside the block, 0 0 = block top-left)',blocks[0].querySelector('.card')],['Block icon (inside the block)',blocks[0].querySelector('.ic')],['Block label (inside the block)',blocks[0].querySelector('.tx')],
        ['Input bar',q('#input')],['Attach “+”',q('#input .circle')],['Text field',q('#field')],['Field text / placeholder',q('#txt')],['Send button',q('#send')],
        ['Tab bar',q('#tabbar')],['Tab: Map',q('.tab[aria-label="Map"]')],['Tab: AI Tutor (active, Enter trigger)',q('.tab.active')],['Tab: Stats',q('.tab[aria-label="Stats"]')]];
      if(!cs) return [];
      return [['Chat area',chat],['Student message',cs],['Student avatar',cs.querySelector('.avatar')],['Student name + time',cs.querySelector('.meta')],['Student text (prompt)',cs.querySelector('.body')],
        ['Tutor message',ct],['Tutor avatar',ct.querySelector('.avatar')],['Tutor name + time',ct.querySelector('.meta')],['Tutor loading dots',ct.querySelector('.dots')]];
    }
    /* assets the screen code uses (section 1c of the package): file name -> SVG markup or PNG data URI */
    function assets(){
      const svg = (el)=>{ if(!el) return ''; const c = el.cloneNode(true); c.removeAttribute('style'); c.removeAttribute('class');
        if(!c.getAttribute('xmlns')) c.setAttribute('xmlns','http://www.w3.org/2000/svg'); return c.outerHTML; };
      const q = s=>phone.querySelector(s), raw = (str)=>{ const d = document.createElement('div'); d.innerHTML = str; return svg(d.firstElementChild); };
      const out = {'status_icons.svg':svg(q('#status svg')), 'menu.svg':svg(q('#header .ibtn svg')), 'new_chat.svg':svg(q('#newChat svg')),
        'illustration.png':(q('#illu')||{}).src||'', 'attach_plus.svg':svg(q('#input .circle svg')), 'send.svg':svg(q('#send svg')),
        'tabbar_line.svg':svg(q('#tabbar svg.line')), 'tab_map.svg':svg(q('.tab[aria-label="Map"] svg')), 'tab_ai_tutor.svg':svg(q('.tab.active svg')),
        'tab_stats.svg':svg(q('.tab[aria-label="Stats"] svg')), 'avatar_student.svg':raw(avatarSvg('student')), 'avatar_tutor.svg':raw(avatarSvg('tutor'))};
      Object.keys(I).forEach(k=>{ out['block_'+k+'.svg'] = raw(I[k]); });
      return out;
    }
    return {enter, draw, reset, specTargets, assets, blocks};
  }

  function elements(){ return {size:[W,H], blocks:DEFS.map((d,i)=>({index:i,label:d.label,icon:d.icon,rest:{cx:d.cx,cy:d.cy,r:d.r}})),
    textLayers:['intro (headline + illustration + subtitle)','student message (avatar + name, text)','tutor message (avatar + name, dots → reply)'],
    triggers:{open:'tap a block (touch point = block centre)', back:'tap “+” in the header at ['+PLUS_PT+']', enter:'tap the AI Tutor tab at ['+TAB_PT+']'}}; }

  return { id:'ai-tutor-blocks', setValues, values:()=>V, defaults:()=>JSON.parse(JSON.stringify(DEF)), catalogue:()=>CAT,
           panel, timeline, modelFor, vectors, refParams, mount, elements };
}};
})(typeof window!=='undefined' ? window : globalThis);
````
````dart motion:screen-dart
// AI Tutor home screen – layout as code (Flutter). Part of the motion package; the workbench does not read this block.
// Artboard 402 × 874 logical px. Wrap it in FittedBox / Transform.scale(width / 402) ONCE, never per element.
// Static layout is fixed (absolute positions as designed). The motion engine drives only what `frame` carries:
// block poses, intro opacity, student / tutor message opacity + rise, pressed block, and for V3 the morph of the tapped block.
// `frame` mirrors the package engine's frame: modelFor(variant, kind, runs).at(tMs). Pass null for the resting home screen.
// Packages: flutter_svg. Font: Nunito Sans 500 / 700 (google_fonts or bundled), Inter 600 for the status-bar time.
// Assets: the file names in Assets are listed (with their contents) in section 1c of the package; add them to pubspec.yaml.
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class Pose { final double cx, cy, r, s, o; const Pose(this.cx, this.cy, this.r, this.s, this.o); }   // centre px, rotation deg, size factor, opacity
class Morph { final int i; final double surface, chip, chipScale, msg, msgScale;
  const Morph(this.i, this.surface, this.chip, this.chipScale, this.msg, this.msgScale); }
class ScreenFrame {
  final List<Pose> blocks; final double intro, stu, tut, rise; final bool done, pressed; final int hover;
  final double? stuText; final Morph? morph;                    // V3 only
  const ScreenFrame({required this.blocks, this.intro = 1, this.stu = 0, this.tut = 0, this.rise = 14, this.done = false,
      this.pressed = false, this.hover = -1, this.stuText, this.morph});
}

const artW = 402.0, artH = 874.0, blockW = 231.5, blockH = 50.0;
const dark = Color(0xFF3A3A3A), mono600 = Color(0xFF858585), white = Color(0xFFFFFFFF), hoverFill = Color(0xFFECECEC);
const font = 'Nunito Sans';

class Assets {
  static const dir = 'assets/ai_tutor/';
  static const statusIcons = '${dir}status_icons.svg', menu = '${dir}menu.svg', newChat = '${dir}new_chat.svg',
      illustration = '${dir}illustration.png', attach = '${dir}attach_plus.svg', send = '${dir}send.svg',
      tabbarLine = '${dir}tabbar_line.svg', tabMap = '${dir}tab_map.svg', tabAiTutor = '${dir}tab_ai_tutor.svg', tabStats = '${dir}tab_stats.svg',
      avatarStudent = '${dir}avatar_student.svg', avatarTutor = '${dir}avatar_tutor.svg';
  static String blockIcon(String icon) => '${dir}block_$icon.svg';
}

/// The five use-case blocks: label, icon, rest pose (centre + tilt). Index 0 = top.
class BlockDef { final String label, icon; final double cx, cy, r; const BlockDef(this.label, this.icon, this.cx, this.cy, this.r); }
const blocks = [
  BlockDef('Create a study plan', 'plan', 200.7, 434.9, -2), BlockDef('Practice my hardest topics', 'dumbbell', 180.7, 490.4, 0),
  BlockDef('Show my knowledge gaps', 'chart', 200.7, 546.4, 2), BlockDef('Explain a topic', 'help', 219.7, 601.9, -4),
  BlockDef('Create a mock exam', 'file', 200.7, 658.0, -2),
];
final restFrame = ScreenFrame(blocks: [for (final b in blocks) Pose(b.cx, b.cy, b.r, 1, 1)]);
const bezMsg = Cubic(.2, .8, .2, 1);   // message rise easing
double _ease(double p) => p <= 0 ? 0 : (p >= 1 ? 1 : bezMsg.transform(p));
TextStyle _t(FontWeight w, double size, double lh, [Color c = dark]) => TextStyle(fontFamily: font, fontWeight: w, fontSize: size, height: lh / size, color: c);

class AiTutorScreen extends StatelessWidget {
  const AiTutorScreen({super.key, this.frame, this.tapped = -1, this.prompt, this.time = '10:32',
      this.reply = 'Placeholder – the streamed answer would appear here.', this.onTapBlock, this.onNewChat, this.onOpenTab});
  final ScreenFrame? frame; final int tapped; final String? prompt, time, reply;
  final ValueChanged<int>? onTapBlock; final VoidCallback? onNewChat, onOpenTab;

  @override
  Widget build(BuildContext context) {
    final f = frame ?? restFrame;
    final chat = f.stu > 0 || f.tut > 0 || (f.stuText ?? 0) > 0;
    return SizedBox(width: artW, height: artH, child: ColoredBox(color: white, child: Stack(clipBehavior: Clip.hardEdge, children: [
      // status bar
      const Positioned(left: 30, top: 15, child: Text('9:41', style: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600, fontSize: 15, height: 22 / 15, color: dark))),
      Positioned(left: 321, top: 22, child: SvgPicture.asset(Assets.statusIcons, width: 64, height: 12)),
      // header: 24 px side padding, 38 px tall, title centred
      Positioned(left: 0, top: 72, width: artW, height: 38, child: Padding(padding: const EdgeInsets.symmetric(horizontal: 24), child: Row(children: [
        SvgPicture.asset(Assets.menu, width: 20, height: 20),
        Expanded(child: Text('AI-Tutor', textAlign: TextAlign.center, style: _t(FontWeight.w700, 20, 24))),
        GestureDetector(onTap: onNewChat, child: SvgPicture.asset(Assets.newChat, width: 20, height: 20)),
      ]))),
      // intro (empty state)
      Positioned(left: 69.1, top: 205, width: 263.8, child: Opacity(opacity: f.intro, child: Column(children: [
        Image.asset(Assets.illustration, width: 88, height: 88),
        const SizedBox(height: 16),
        Text('How can I help?', textAlign: TextAlign.center, style: _t(FontWeight.w700, 20, 24)),
        const SizedBox(height: 16),
        Text('I’m your AI tutor, here to help you learn.', textAlign: TextAlign.center, style: _t(FontWeight.w500, 14, 19.6, mono600)),
      ]))),
      // chat: top 117, bottom 130
      if (chat) Positioned(left: 0, top: 117, width: artW, height: artH - 117 - 130, child: IgnorePointer(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        _Message(student: true, name: 'Student - $time', body: prompt ?? (tapped >= 0 ? blocks[tapped].label : ''), opacity: f.stu, rise: f.rise, textOpacity: f.stuText),
        _Message(student: false, name: 'Brian - $time', body: reply ?? '', opacity: f.tut, rise: 14, done: f.done),
      ]))),
      // blocks
      for (var i = 0; i < f.blocks.length; i++)
        _Block(i: i, pose: f.blocks[i], pressed: f.pressed && tapped == i, hover: f.hover == i, morph: f.morph?.i == i ? f.morph : null,
            onTap: frame == null && onTapBlock != null ? () => onTapBlock!(i) : null),
      // input bar: top 731, 24 px side padding
      Positioned(left: 0, top: 731, width: artW, child: Padding(padding: const EdgeInsets.fromLTRB(24, 4, 24, 4), child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
        Container(width: 32, height: 32, margin: const EdgeInsets.only(bottom: 4), decoration: const BoxDecoration(color: dark, shape: BoxShape.circle),
            alignment: Alignment.center, child: SvgPicture.asset(Assets.attach, width: 16, height: 16)),
        const SizedBox(width: 8),
        Expanded(child: Container(padding: const EdgeInsets.fromLTRB(12, 4, 4, 4),
          decoration: BoxDecoration(color: white, borderRadius: BorderRadius.circular(20), border: Border.all(color: dark, width: .75)),
          child: Row(children: [
            Expanded(child: Padding(padding: const EdgeInsets.all(4), child: TextField(style: _t(FontWeight.w500, 14, 19.6),
                decoration: InputDecoration.collapsed(hintText: 'Or ask anything...', hintStyle: _t(FontWeight.w500, 14, 19.6, mono600))))),
            const SizedBox(width: 8),
            Container(width: 30, height: 30, decoration: const BoxDecoration(color: dark, shape: BoxShape.circle), alignment: Alignment.center,
                child: SvgPicture.asset(Assets.send, width: 16, height: 16)),
          ]))),
      ]))),
      // tab bar: top 791, 83 tall; slanted top line; tabs 53.5 × 53.5, gap 12, centred, 10 px from the top
      Positioned(left: 0, top: 791, width: artW, height: 83, child: Stack(children: [
        Positioned(left: 0, top: 3, child: SvgPicture.asset(Assets.tabbarLine, width: 402, height: 81)),
        Positioned(left: 0, right: 0, top: 10, child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          _Tab(asset: Assets.tabMap, size: 54), const SizedBox(width: 12),
          GestureDetector(onTap: onOpenTab, child: _Tab(asset: Assets.tabAiTutor, size: 28, active: true)), const SizedBox(width: 12),
          _Tab(asset: Assets.tabStats, size: 54),
        ])),
      ])),
    ])));
  }
}

/* ---------- block (231.5 × 50): white card, 0.75 border, 3/3 hard shadow, icon 17, gap 10, padding 16, label 12/700 ---------- */
class _Block extends StatelessWidget {
  const _Block({required this.i, required this.pose, required this.pressed, required this.hover, this.morph, this.onTap});
  final int i; final Pose pose; final bool pressed, hover; final Morph? morph; final VoidCallback? onTap;
  @override
  Widget build(BuildContext context) {
    final b = blocks[i], a = morph?.surface ?? 1.0;
    final ink = pressed ? white : dark, fill = pressed ? dark : (hover ? hoverFill : white), line = pressed ? white : mono600;
    Widget mark(double? l, double? r, double? t, double? bt, double w) =>
        Positioned(left: l, right: r, top: t, bottom: bt, child: Opacity(opacity: a, child: Container(width: w, height: .75, color: line)));
    return Positioned(left: pose.cx - blockW / 2, top: pose.cy - blockH / 2, width: blockW, height: blockH,
      child: Opacity(opacity: pose.o.clamp(0.0, 1.0), child: Transform(alignment: Alignment.center,
        transform: Matrix4.identity()..rotateZ(pose.r * math.pi / 180)..scale(pose.s),
        child: GestureDetector(onTap: onTap, child: Container(
          decoration: BoxDecoration(color: fill.withOpacity(a), border: Border.all(color: dark.withOpacity(a), width: .75),
              boxShadow: [BoxShadow(color: dark.withOpacity(a), offset: const Offset(3, 3))]),
          child: Stack(clipBehavior: Clip.hardEdge, children: [
            Padding(padding: const EdgeInsets.all(16), child: Row(children: [
              Opacity(opacity: a, child: SvgPicture.asset(Assets.blockIcon(b.icon), width: 17, height: 17,
                  colorFilter: pressed ? const ColorFilter.mode(white, BlendMode.srcIn) : null)),
              const SizedBox(width: 10),
              Expanded(child: Opacity(opacity: morph?.chip ?? 1, child: Transform.scale(scale: morph?.chipScale ?? 1, alignment: Alignment.centerLeft,
                  child: Text(b.label, maxLines: 1, softWrap: false, overflow: TextOverflow.visible, style: _t(FontWeight.w700, 12, 16.8, ink))))),
            ])),
            if (morph != null) Positioned(left: 43, top: 0, bottom: 0, child: Center(child: Opacity(opacity: morph!.msg, child: Transform.scale(
                scale: morph!.msgScale, alignment: Alignment.centerLeft, child: Text(b.label, maxLines: 1, softWrap: false, style: _t(FontWeight.w500, 14, 19.6)))))),
            mark(null, 5.5, null, 5, 1.5), mark(null, 5, 4, null, 14), mark(25.75, null, null, 8, 6),
          ]),
        )))));
  }
}

/* ---------- chat message (student / tutor): padding 12/24, avatar 32, gap 12, name 12/700, 8, text 14/500 ---------- */
class _Message extends StatelessWidget {
  const _Message({required this.student, required this.name, required this.body, required this.opacity, required this.rise, this.textOpacity, this.done = true});
  final bool student, done; final String name, body; final double opacity, rise; final double? textOpacity;
  @override
  Widget build(BuildContext context) {
    final split = textOpacity != null;   // V3: avatar + name fade/rise, the text line appears on landing
    Widget moving(Widget w) => Opacity(opacity: opacity, child: Transform.translate(offset: Offset(0, rise * (1 - _ease(opacity))), child: w));
    final avatar = Container(width: 32, height: 32, decoration: BoxDecoration(shape: BoxShape.circle, color: student ? white : dark,
        border: Border.all(color: student ? Colors.black : dark), boxShadow: const [BoxShadow(color: Color(0x40000000), offset: Offset(0, 4), blurRadius: 4)]),
        child: ClipOval(child: SvgPicture.asset(student ? Assets.avatarStudent : Assets.avatarTutor)));
    final content = Padding(padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12), child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
      split ? moving(avatar) : avatar,
      const SizedBox(width: 12),
      Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        split ? moving(Text(name, style: _t(FontWeight.w700, 12, 16.8))) : Text(name, style: _t(FontWeight.w700, 12, 16.8)),
        const SizedBox(height: 8),
        ConstrainedBox(constraints: const BoxConstraints(minHeight: 20), child: Opacity(opacity: split ? textOpacity! : 1,
            child: !student && !done ? const _Dots() : Text(body, style: _t(FontWeight.w500, 14, 19.6)))),
      ])),
    ]));
    return split ? content : moving(content);
  }
}

/* loading: 3 dots, 7 px, gap 5, pulse 1.1 s (0.15 s apart) */
class _Dots extends StatefulWidget { const _Dots(); @override State<_Dots> createState() => _DotsState(); }
class _DotsState extends State<_Dots> with SingleTickerProviderStateMixin {
  late final AnimationController c = AnimationController(vsync: this, duration: const Duration(milliseconds: 1100))..repeat();
  @override void dispose() { c.dispose(); super.dispose(); }
  @override
  Widget build(BuildContext context) => SizedBox(height: 20, child: AnimatedBuilder(animation: c, builder: (_, __) => Row(children: [
    for (var k = 0; k < 3; k++) ...[
      if (k > 0) const SizedBox(width: 5),
      Builder(builder: (_) { final p = (c.value - k * .15 / 1.1) % 1.0;
        final q = p < .3 ? p / .3 : (p < .6 ? 1 - (p - .3) / .3 : 0.0);   // 0 → 1 at 30 % → 0 at 60 %
        return Transform.translate(offset: Offset(0, -4 * Curves.easeInOut.transform(q)),
            child: Opacity(opacity: .28 + .72 * q, child: Container(width: 7, height: 7, decoration: const BoxDecoration(color: dark, shape: BoxShape.circle)))); }),
    ],
  ])));
}

class _Tab extends StatelessWidget {
  const _Tab({required this.asset, required this.size, this.active = false});
  final String asset; final double size; final bool active;
  @override
  Widget build(BuildContext context) => SizedBox(width: 53.5, height: 53.5, child: Stack(alignment: Alignment.center, children: [
    if (active) Positioned(left: 4, bottom: 2, width: 46, height: 22, child: Opacity(opacity: .35, child: CustomPaint(painter: _DotGlow()))),
    SvgPicture.asset(asset, width: size, height: size),
  ]));
}
/// Active tab: 4 px dot grid (0.8 px dots) faded out by an ellipse centred at 50 % / 30 %.
class _DotGlow extends CustomPainter {
  @override
  void paint(Canvas canvas, Size s) {
    final p = Paint()..color = dark;
    for (double y = 2; y < s.height; y += 4) { for (double x = 2; x < s.width; x += 4) {
      final dx = (x - s.width * .5) / (s.width * .5), dy = (y - s.height * .3) / (s.height * .7), d = math.sqrt(dx * dx + dy * dy);
      final m = d <= .3 ? 1.0 : (d >= .75 ? 0.0 : 1 - (d - .3) / .45);
      if (m > 0) canvas.drawCircle(Offset(x, y), .8, p..color = dark.withOpacity(m));
    } }
  }
  @override bool shouldRepaint(covariant CustomPainter old) => false;
}
````
````tsx motion:screen-react
// AI Tutor home screen – layout as code (web / React). Part of the motion package; the workbench does not read this block.
// Artboard 402 × 874 logical px. Render the artboard at its design size and scale it ONCE (width / 402), never per element.
// Static layout is fixed (absolute positions as designed). The motion engine drives only what `frame` carries:
// block poses, intro opacity, student / tutor message opacity + rise, pressed block, and for V3 the morph of the tapped block.
// `frame` is exactly what the package engine returns: modelFor(variant, kind, runs).at(tMs). Pass null for the resting home screen.
// Assets: the file names in ASSETS are listed (with their contents) in section 1c of the package.
import React from 'react';

export type Pose = { cx: number; cy: number; r: number; s: number; o: number };   // centre px, rotation deg, size factor, opacity
export type Morph = { i: number; surface: number; chip: number; chipScale: number; msg: number; msgScale: number };
export type ScreenFrame = {
  blocks: Pose[]; intro: number;
  stu: number; tut: number; done: boolean; rise?: number;       // student / tutor message opacity, reply shown, rise px
  stuText?: number; morph?: Morph;                              // V3 only: student text opacity, tapped-block morph
  pressed?: boolean; hover?: number;                            // tapped block dark (index = model.tapped)
};

export const ART = { w: 402, h: 874 };
export const BLOCK = { w: 231.5, h: 50 };
export const C = { dark: '#3a3a3a', mono600: '#858585', white: '#ffffff', hover: '#ececec' };
const FONT = '"Nunito Sans", "Nunito", system-ui, -apple-system, sans-serif';
export const ASSETS = {
  statusIcons: 'assets/ai_tutor/status_icons.svg', menu: 'assets/ai_tutor/menu.svg', newChat: 'assets/ai_tutor/new_chat.svg',
  illustration: 'assets/ai_tutor/illustration.png', attach: 'assets/ai_tutor/attach_plus.svg', send: 'assets/ai_tutor/send.svg',
  tabbarLine: 'assets/ai_tutor/tabbar_line.svg', tabMap: 'assets/ai_tutor/tab_map.svg', tabAiTutor: 'assets/ai_tutor/tab_ai_tutor.svg',
  tabStats: 'assets/ai_tutor/tab_stats.svg', avatarStudent: 'assets/ai_tutor/avatar_student.svg', avatarTutor: 'assets/ai_tutor/avatar_tutor.svg',
  blockIcon: (icon: string) => `assets/ai_tutor/block_${icon}.svg`,
};
type AssetMap = typeof ASSETS;

/** The five use-case blocks: label, icon, rest pose (centre + tilt). Index 0 = top. */
export const BLOCKS = [
  { label: 'Create a study plan', icon: 'plan', cx: 200.7, cy: 434.9, r: -2 },
  { label: 'Practice my hardest topics', icon: 'dumbbell', cx: 180.7, cy: 490.4, r: 0 },
  { label: 'Show my knowledge gaps', icon: 'chart', cx: 200.7, cy: 546.4, r: 2 },
  { label: 'Explain a topic', icon: 'help', cx: 219.7, cy: 601.9, r: -4 },
  { label: 'Create a mock exam', icon: 'file', cx: 200.7, cy: 658.0, r: -2 },
];
const REST: Pose[] = BLOCKS.map((b) => ({ cx: b.cx, cy: b.cy, r: b.r, s: 1, o: 1 }));

// cubic-bezier(.2,.8,.2,1): message rise easing
function bezier(x1: number, y1: number, x2: number, y2: number) {
  return (x: number) => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x;
    for (let k = 0; k < 22; k++) { t = (lo + hi) / 2; const cx = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t; if (cx < x) lo = t; else hi = t; }
    return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t; };
}
const bezMsg = bezier(.2, .8, .2, 1);
const abs = (x: number, y: number, w?: number, h?: number): React.CSSProperties => ({ position: 'absolute', left: x, top: y, width: w, height: h });
const text = (weight: number, size: number, lh: number, color = C.dark): React.CSSProperties => ({ fontFamily: FONT, fontWeight: weight, fontSize: size, lineHeight: lh + 'px', color });
const rgba = (hex: string, a: number) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };

/* ---------- block (231.5 × 50) ---------- */
function Block({ i, pose, pressed, hover, morph, assets, onTap }: { i: number; pose: Pose; pressed: boolean; hover: boolean; morph?: Morph; assets: AssetMap; onTap?: (i: number) => void }) {
  const b = BLOCKS[i], a = morph ? morph.surface : 1;
  const ink = pressed ? C.white : C.dark, fill = pressed ? C.dark : hover ? C.hover : C.white, line = pressed ? C.white : C.mono600;
  return (
    <div onClick={() => onTap?.(i)} style={{ ...abs(pose.cx - BLOCK.w / 2, pose.cy - BLOCK.h / 2, BLOCK.w, BLOCK.h), opacity: pose.o, cursor: onTap ? 'pointer' : undefined,
      transform: `rotate(${pose.r}deg) scale(${pose.s})`, transformOrigin: '50% 50%', willChange: 'transform, opacity' }}>
      <div style={{ position: 'relative', width: '100%', height: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 10, padding: 16, overflow: 'hidden',
        background: rgba(fill, a), border: `0.75px solid ${rgba(C.dark, a)}`, boxShadow: `3px 3px 0 ${rgba(C.dark, a)}`, ...text(700, 12, 16.8, ink) }}>
        <img src={assets.blockIcon(b.icon)} alt="" width={17} height={17} style={{ flex: 'none', opacity: a, filter: pressed ? 'brightness(0) invert(1)' : undefined }} />
        <span style={{ flex: 1, whiteSpace: 'nowrap', transformOrigin: '0 50%', opacity: morph ? morph.chip : 1, transform: morph ? `scale(${morph.chipScale})` : undefined }}>{b.label}</span>
        {morph && <span aria-hidden style={{ position: 'absolute', left: 43, top: '50%', marginTop: -9.8, whiteSpace: 'nowrap', transformOrigin: '0 50%',
          opacity: morph.msg, transform: `scale(${morph.msgScale})`, ...text(500, 14, 19.6) }}>{b.label}</span>}
        {[{ right: 5.5, bottom: 5, width: 1.5 }, { right: 5, top: 4, width: 14 }, { left: 25.75, bottom: 8, width: 6 }].map((p, k) =>
          <i key={k} style={{ position: 'absolute', height: 0.75, background: line, opacity: a, ...p }} />)}
      </div>
    </div>
  );
}

/* ---------- chat message (student / tutor) ---------- */
function Message({ who, name, body, opacity, rise, textOpacity, done, assets }: { who: 'student' | 'tutor'; name: string; body: string; opacity: number; rise: number; textOpacity?: number; done?: boolean; assets: AssetMap }) {
  const off = (p: number) => `translateY(${rise * (1 - bezMsg(p))}px)`;
  const split = textOpacity !== undefined;                       // V3: avatar + name fade/rise, the text line appears on landing
  return (
    <div style={{ display: 'flex', gap: 12, padding: '12px 24px', opacity: split ? 1 : opacity, transform: split ? undefined : off(opacity) }}>
      <img src={who === 'student' ? assets.avatarStudent : assets.avatarTutor} alt="" width={32} height={32}
        style={{ flex: 'none', borderRadius: 16, border: `1px solid ${who === 'student' ? '#000' : C.dark}`, background: who === 'student' ? C.white : C.dark,
          boxShadow: '0 4px 4px rgba(0,0,0,.25)', boxSizing: 'border-box', ...(split ? { opacity, transform: off(opacity) } : {}) }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...text(700, 12, 16.8), marginBottom: 8, ...(split ? { opacity, transform: off(opacity) } : {}) }}>{name}</div>
        <div style={{ ...text(500, 14, 19.6), minHeight: 20, opacity: split ? textOpacity : 1 }}>
          {who === 'tutor' && !done ? <Dots /> : body}
        </div>
      </div>
    </div>
  );
}
function Dots() {   // loading: 3 dots, 7 px, gap 5, pulse 1.1 s (0.15 s apart)
  return (<div style={{ display: 'flex', gap: 5, alignItems: 'center', height: 20 }}>
    <style>{'@keyframes aitPulse{0%,60%,100%{transform:translateY(0);opacity:.28}30%{transform:translateY(-4px);opacity:1}}'}</style>
    {[0, 1, 2].map((k) => <i key={k} style={{ width: 7, height: 7, borderRadius: 4, background: C.dark, animation: `aitPulse 1.1s ease-in-out ${k * 0.15}s infinite` }} />)}
  </div>);
}

/* ---------- the screen ---------- */
export function AiTutorScreen({ frame, tapped = -1, prompt, time = '10:32', reply = 'Placeholder – the streamed answer would appear here.', assets = ASSETS, onTapBlock, onNewChat, onOpenTab }: {
  frame: ScreenFrame | null; tapped?: number; prompt?: string; time?: string; reply?: string; assets?: AssetMap;
  onTapBlock?: (i: number) => void; onNewChat?: () => void; onOpenTab?: () => void;
}) {
  const f = frame ?? { blocks: REST, intro: 1, stu: 0, tut: 0, done: false };
  const [hover, setHover] = React.useState(-1);
  const chat = f.stu > 0 || f.tut > 0 || (f.stuText ?? 0) > 0;
  return (
    <div style={{ position: 'relative', width: ART.w, height: ART.h, background: C.white, overflow: 'hidden', userSelect: 'none' }}>
      {/* status bar */}
      <span style={{ ...abs(30, 15), ...text(600, 15, 22), fontFamily: 'Inter, system-ui, sans-serif' }}>9:41</span>
      <img src={assets.statusIcons} alt="" style={abs(321, 22, 64, 12)} />
      {/* header: 24 px side padding, 38 px tall, title centred */}
      <div style={{ ...abs(0, 72, ART.w, 38), display: 'flex', alignItems: 'center', padding: '0 24px', boxSizing: 'border-box' }}>
        <img src={assets.menu} alt="Menu" width={20} height={20} />
        <h1 style={{ flex: 1, margin: 0, textAlign: 'center', ...text(700, 20, 24) }}>AI-Tutor</h1>
        <img src={assets.newChat} alt="New chat" width={20} height={20} onClick={onNewChat} style={{ cursor: 'pointer' }} />
      </div>
      {/* intro (empty state) */}
      <div style={{ ...abs(69.1, 205, 263.8), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center', opacity: f.intro }}>
        <img src={assets.illustration} alt="" width={88} height={88} style={{ display: 'block' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 style={{ margin: 0, ...text(700, 20, 24) }}>How can I help?</h2>
          <p style={{ margin: 0, ...text(500, 14, 19.6, C.mono600) }}>I’m your AI tutor, here to help you learn.</p>
        </div>
      </div>
      {/* chat: top 117, bottom 130 */}
      {chat && <div style={{ ...abs(0, 117, ART.w, ART.h - 117 - 130), display: 'flex', flexDirection: 'column', overflow: 'hidden', pointerEvents: 'none' }}>
        <Message who="student" name={'Student - ' + time} body={prompt ?? (tapped >= 0 ? BLOCKS[tapped].label : '')} opacity={f.stu} rise={f.rise ?? 14} textOpacity={f.stuText} assets={assets} />
        <Message who="tutor" name={'Brian - ' + time} body={reply} opacity={f.tut} rise={14} done={f.done} assets={assets} />
      </div>}
      {/* blocks */}
      {f.blocks.map((p, i) => <div key={i} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(-1)}>
        <Block i={i} pose={p} pressed={!!f.pressed && tapped === i} hover={frame ? f.hover === i : hover === i} morph={f.morph && f.morph.i === i ? f.morph : undefined}
          assets={assets} onTap={frame ? undefined : onTapBlock} /></div>)}
      {/* input bar: top 731, 24 px side padding */}
      <div style={{ ...abs(0, 731, ART.w), padding: '4px 24px', boxSizing: 'border-box', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', marginBottom: 4 }}>
          <img src={assets.attach} alt="" width={16} height={16} /></div>
        <div style={{ flex: 1, border: `0.75px solid ${C.dark}`, borderRadius: 20, padding: '4px 4px 4px 12px', display: 'flex', alignItems: 'center', gap: 8, background: C.white }}>
          <input placeholder="Or ask anything..." style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'none', padding: 4, ...text(500, 14, 19.6) }} />
          <button aria-label="Send" style={{ width: 30, height: 30, borderRadius: 15, background: C.dark, border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', padding: 0 }}>
            <img src={assets.send} alt="" width={16} height={16} /></button>
        </div>
      </div>
      {/* tab bar: top 791, 83 tall; slanted top line; tabs 53.5 × 53.5, gap 12, centred, 10 px from the top */}
      <div style={abs(0, 791, ART.w, 83)}>
        <img src={assets.tabbarLine} alt="" style={abs(0, 3, 402, 81)} />
        <div style={{ position: 'absolute', inset: '10px 0 0', display: 'flex', justifyContent: 'center', gap: 12 }}>
          {[['Map', assets.tabMap, 54], ['AI Tutor', assets.tabAiTutor, 28], ['Stats', assets.tabStats, 54]].map(([label, src, size], k) =>
            <div key={k} aria-label={label as string} onClick={k === 1 ? onOpenTab : undefined}
              style={{ width: 53.5, height: 53.5, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: k === 1 ? 'pointer' : undefined }}>
              {k === 1 && <span style={{ position: 'absolute', left: 4, bottom: 2, width: 46, height: 22, opacity: .35,                 // active tab: dotted glow
                backgroundImage: `radial-gradient(${C.dark} .8px, transparent 1px)`, backgroundSize: '4px 4px',
                WebkitMaskImage: 'radial-gradient(ellipse at 50% 30%, #000 30%, transparent 75%)', maskImage: 'radial-gradient(ellipse at 50% 30%, #000 30%, transparent 75%)' }} />}
              <img src={src as string} alt="" width={size as number} height={size as number} style={{ position: 'relative', display: 'block' }} />
            </div>)}
        </div>
      </div>
    </div>
  );
}
````
````ts motion:ref-ts
/**
 * AI Tutor use-case blocks – motion model (V2, final values).
 * Pure functions of time: at(tMs) -> poses. Framework-agnostic; drive it with requestAnimationFrame
 * and apply the poses as CSS transforms (see usage at the bottom).
 *
 * ELEMENT CONTRACT: the engine never touches content, size or styling. It only outputs a pose per element index
 * (centre x/y, rotation, scale, opacity) plus opacity/translateY for three text layers (intro, student, tutor).
 * Swap the elements freely (other cards, any N); give the engine their rest poses via `Layout`.
 * Artboard: 402 x 874 px. Angles in degrees, time in ms.
 */
export const ART = { w: 402, h: 874 };
/** Where the elements rest, and where the tapped element lands (centre of its pose, artboard px). */
export type Layout = { rest: { cx: number; cy: number; r: number }[]; landing: { x: number; y: number } };
export const LAYOUT: Layout = {
  rest: [   // block centres + rotation of the tower at rest (top -> bottom); any number of elements works
    { cx: 200.7, cy: 434.9, r: -2 }, { cx: 180.7, cy: 490.4, r: 0 }, { cx: 200.7, cy: 546.4, r: 2 },
    { cx: 219.7, cy: 601.9, r: -4 }, { cx: 200.7, cy: 658.0, r: -2 },
  ],
  landing: { x: 257.5, y: 164.8 },   // next to the student message
};

/** Final tuned values (V2). Change here only. */
// <<PARAMS
export const P = {
  open:  { tap: 170, total: 1800, move: 420, morphAt: 0.23, rise: 68, gravity: 3500, kick: -10, spin: 235, spinRand: 55,
           drift: 310, start: 0, wobble: 7, flySpin: 58, arc: 0, ripple: 70, loading: 1800,
           spring: { stiffness: 101, damping: 15, mass: 3.4 } as Spring },
  back:  { tap: 240, total: 1200, stagger: 70, rand: 1.0, spring: { visualDuration: 0.8, bounce: 0.2 } as Spring },
  enter: { tap: 240, total: 1190, stagger: 95, rand: 0.67, textAt: 190, spring: { visualDuration: 0.25, bounce: 0.25 } as Spring },
  wiggle: 0.4,   // desktop hover wiggle strength (0 = off)
};
// PARAMS>>

export type Spring = { visualDuration: number; bounce: number } | { stiffness: number; damping: number; mass: number };
export type Pose = { cx: number; cy: number; rot: number; scale: number; opacity: number };
export type Frame = {
  blocks: Pose[];            // index = block index (0 = top)
  intro: number;             // headline + illustration + subtitle opacity
  student: number; studentRise: number;  // student message opacity + translateY(px) = rise * (1 - bezMsg(opacity))
  tutor: number; tutorDone: boolean;     // tutor message opacity (translateY 14 px) ; false = dots, true = reply text
  pressed: number;           // index of the tapped (dark) block, -1 = none
};
export type Timeline = { duration: number; at: (t: number) => Frame };

/* ---------- helpers ---------- */
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  return (x: number) => { if (x <= 0) return 0; if (x >= 1) return 1; let lo = 0, hi = 1, t = x;
    for (let k = 0; k < 22; k++) { t = (lo + hi) / 2; const cx = 3*(1-t)*(1-t)*t*x1 + 3*(1-t)*t*t*x2 + t*t*t; if (cx < x) lo = t; else hi = t; }
    return 3*(1-t)*(1-t)*t*y1 + 3*(1-t)*t*t*y2 + t*t*t; };
}
export const bezOpacity = cubicBezier(.25, .1, .25, 1);
export const bezMsg = cubicBezier(.2, .8, .2, 1);

/** Damped spring 0 -> 1 sampled in ms (same maths as Motion's spring()). */
function springSampler(c: Spring) {
  let k: number, d: number, m = 1, baseMs: number;
  if ('visualDuration' in c) {
    const root = (2 * Math.PI) / (c.visualDuration * 1.2), z = c.bounce >= 0 ? 1 - c.bounce : 1 / (1 + c.bounce);
    k = root * root; d = 2 * z * Math.sqrt(k); baseMs = c.visualDuration * 1000 * 1.6;
  } else { k = c.stiffness; d = c.damping; m = c.mass; baseMs = 0.8 * 1000 * 1.6; }
  const w0 = Math.sqrt(k / m), z = d / (2 * Math.sqrt(k * m));
  const x = (ms: number) => { const t = ms / 1000;
    if (z < 1) { const wd = w0 * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t)); }
    if (z === 1) return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
    const s = Math.sqrt(z * z - 1), r1 = -w0 * (z - s), r2 = -w0 * (z + s);
    return 1 - (r2 * Math.exp(r1 * t) - r1 * Math.exp(r2 * t)) / (r2 - r1); };
  /** progress 0..1 over the animation's time base -> eased 0..1 (may overshoot) */
  return { ease: (p: number) => (p >= 1 ? 1 : p <= 0 ? 0 : x(p * baseMs)), baseMs };
}

/** user action first (tapMs), then the animation, optionally time-scaled to `totalMs` */
function withTap(base: Timeline & { motionEnd: number }, tapMs: number, totalMs: number, block = -1): Timeline {
  const f = totalMs > 0 ? totalMs / base.motionEnd : 1;
  return { duration: base.duration * f + tapMs,
    at: (t) => ({ ...base.at(Math.max(0, t - tapMs) / f), pressed: block >= 0 && t >= 60 ? block : -1 }) };  // tapped block turns dark 60 ms after touch-down
}

/* ---------- OPEN: user taps block `i` ---------- */
export function open(i: number, seed = (Math.random() * 2 ** 31) | 0, p = P.open, L: Layout = LAYOUT): Timeline {
  const rnd = mulberry32(seed), RR = (a: number, b: number) => a + rnd() * (b - a);
  const td = L.rest[i], TX = L.landing.x, TY = L.landing.y;   // where the tapped block lands (next to the student message)
  const sp = springSampler(p.spring), mD = sp.baseMs, g = p.gravity, OFF = 990, mAt = p.morphAt;
  const msgAt = p.move * mAt, fadeD = p.move * (1 - mAt), tutAt = msgAt + 850;
  const others = L.rest.map((_, j) => j).filter((j) => j !== i).map((j) => {
    const d = L.rest[j], sd = rnd(), sr = RR(-1, 1), dr = RR(-1, 1), st = rnd();          // draw order matters for parity
    const delay = p.ripple * Math.abs(j - i) + st * p.start, vy = p.kick, sg = sd < .5 ? 1 : -1;
    const w = sg * p.spin * (1 + sr * p.spinRand / 100), vx = dr * p.drift;
    const tau = (-vy + Math.sqrt(vy * vy + 2 * g * Math.max(OFF - d.cy, 0))) / g + .1;
    return { j, d, delay, vy, vx, w, sg, end: delay + tau };
  });
  const motionEnd = Math.max(mD, ...others.map((n) => n.end)) + 100;
  const doneAt = p.loading > 0 ? tutAt + p.loading : Infinity;
  const duration = Math.max(motionEnd, isFinite(doneAt) ? doneAt + 500 : tutAt + 1200);
  const at = (t: number): Frame => {
    const blocks: Pose[] = [], e = sp.ease(clamp(t / mD, 0, 1)), pc = clamp(e, 0, 1), pb = Math.sin(Math.PI * pc);
    blocks[i] = { cx: td.cx + (TX - td.cx) * e - p.arc * pb, cy: td.cy + (TY - td.cy) * e, rot: td.r * (1 - pc) - p.flySpin * pc,
                  scale: 1 + .07 * Math.sin(Math.PI * clamp(t / mD, 0, 1)), opacity: 1 - clamp((t - msgAt) / fadeD, 0, 1) };
    for (const n of others) {
      const u = Math.max(0, (t - n.delay) / 1000), q = .22 * (1 - Math.exp(-u / .22));   // spin + drift ease in
      blocks[n.j] = { cx: n.d.cx + n.vx * q * 1.6, cy: n.d.cy + n.vy * u + .5 * g * u * u,
                      rot: n.d.r + n.w * (u - q) + p.wobble * n.sg * Math.sin(u * 18) * Math.exp(-u * 7), scale: 1, opacity: 1 };
    }
    return { blocks, intro: 1 - clamp(t / 450, 0, 1), student: clamp((t - msgAt) / (fadeD + 250), 0, 1), studentRise: p.rise,
             tutor: clamp((t - tutAt) / 600, 0, 1), tutorDone: t >= doneAt, pressed: -1 };
  };
  return withTap({ duration, motionEnd, at }, p.tap, p.total, i);
}

/* ---------- BACK: user taps "+" while the chat is open (blocks fall back in from below) ---------- */
export function back(seed = (Math.random() * 2 ** 31) | 0, p = P.back, L: Layout = LAYOUT): Timeline {
  const rnd = mulberry32(seed), RR = (a: number, b: number) => a + rnd() * (b - a);
  const sp = springSampler(p.spring), D = sp.baseMs, N = L.rest.length;
  const items = L.rest.map((d, j) => {
    const delay = (N - 1 - j) * p.stagger * 1.3;                                          // lowest block first
    RR(0, 1); const rot = RR(-1, 1) * 80 * p.rand, xo = RR(-1, 1);                        // dist (unused), rot, xo
    return { d, delay, sx: d.cx + xo * 170, sy: 910 + RR(0, 1) * 60 + j * 14, sr: d.r + rot * .6 };
  });
  const introAt = D * .45, motionEnd = Math.max(...items.map((it) => it.delay + D)) + 100;
  const duration = Math.max(motionEnd, introAt + 500, 500);
  const at = (t: number): Frame => ({
    blocks: items.map((it) => { const e = sp.ease((t - it.delay) / D);
      return { cx: it.sx + (it.d.cx - it.sx) * e, cy: it.sy + (it.d.cy - it.sy) * e, rot: it.sr + (it.d.r - it.sr) * e, scale: 1, opacity: 1 }; }),
    intro: clamp((t - introAt) / 450, 0, 1),
    student: 1 - clamp(t / 450, 0, 1), studentRise: 14, tutor: 1 - clamp(t / 450, 0, 1), tutorDone: true, pressed: -1,
  });
  return withTap({ duration, motionEnd, at }, p.tap, p.total);
}

/* ---------- ENTER: user opens the AI Tutor tab (blocks arrive near their place, text last) ---------- */
export function enter(seed = (Math.random() * 2 ** 31) | 0, p = P.enter, L: Layout = LAYOUT): Timeline {
  const rnd = mulberry32(seed), RR = (a: number, b: number) => a + rnd() * (b - a);   // only used to keep parity of the draw order
  const r2 = mulberry32((seed ^ 0x9e3779b9) >>> 0), R2 = (a: number, b: number) => a + r2() * (b - a);
  const sp = springSampler(p.spring), D = sp.baseMs, mid = (L.rest.length - 1) / 2;
  const items = L.rest.map((d, j) => {
    const side = j < mid ? -1 : j > mid ? 1 : 0;
    const delay = R2(0, 1) * p.stagger * 3;
    RR(0, 1); RR(-1, 1); RR(-1, 1);
    const hx = (R2(0, 1) < .5 ? -1 : 1) * (130 + R2(0, 1) * 150), vy = side * (110 + R2(0, 1) * 140);
    const tilt = (R2(0, 1) < .5 ? -1 : 1) * (16 + R2(0, 1) * 30) * p.rand;
    return { d, delay, sx: d.cx + hx, sy: d.cy + vy, sr: d.r + tilt };
  });
  const motionEnd = Math.max(...items.map((it) => it.delay + D)) + 100;
  const duration = Math.max(motionEnd, p.textAt + 500);
  const at = (t: number): Frame => ({
    blocks: items.map((it) => { const e = sp.ease((t - it.delay) / D);
      return { cx: it.sx + (it.d.cx - it.sx) * e, cy: it.sy + (it.d.cy - it.sy) * e, rot: it.sr + (it.d.r - it.sr) * e, scale: 1,
               opacity: bezOpacity((t - it.delay) / 350) }; }),
    intro: clamp((t - p.textAt) / 450, 0, 1), student: 0, studentRise: 14, tutor: 0, tutorDone: false, pressed: -1,
  });
  return withTap({ duration, motionEnd, at }, p.tap, p.total);
}

/* ---------- DESKTOP HOVER WIGGLE (pointer devices only) ----------
 * On pointer-enter: ONE random jolt, then it springs back. The hovered element also gets a light grey fill (#ececec).
 * Jolt: transition to the offset in 180 ms, cubic-bezier(.2,.9,.3,1.2). After 110 ms: return to 0 in 500 ms, cubic-bezier(.2,1.4,.4,1).
 * On pointer-leave: return immediately (same return curve). Not active while an animation runs / after a block was tapped. */
export const WIGGLE = { joltMs: 180, holdMs: 110, settleMs: 500, joltCurve: [.2, .9, .3, 1.2], settleCurve: [.2, 1.4, .4, 1], hoverFill: '#ececec' };
export function wiggleOffset(rnd: () => number = Math.random, amount = P.wiggle) {
  return { dx: (rnd() * 2 - 1) * 5 * amount, dy: (rnd() * 2 - 1) * 4 * amount, rot: (rnd() * 2 - 1) * 5 * amount };   // px, px, deg
}

/* ---------- usage (web) ----------
const tl = open(1);                       // user tapped block 1
const t0 = performance.now();
(function frame(now: number) {
  const t = now - t0, f = tl.at(t);
  f.blocks.forEach((b, j) => { const el = blockEls[j];
    el.style.transform = `translate(${b.cx - BLOCK.w / 2}px, ${b.cy - BLOCK.h / 2}px) rotate(${b.rot}deg) scale(${b.scale})`;
    el.style.opacity = String(b.opacity); el.classList.toggle('pressed', f.pressed === j && t > 60); });
  introEl.style.opacity = String(f.intro);
  studentEl.style.opacity = String(f.student); studentEl.style.transform = `translateY(${f.studentRise * (1 - bezMsg(f.student))}px)`;
  if (t < tl.duration) requestAnimationFrame(frame);
})(t0);
// Note: scale the artboard (402 px wide) with one CSS transform / device-width factor, never per element.
*/

````
````dart motion:ref-dart
// AI Tutor use-case blocks – motion model (V2, final values).
// Pure functions of time: `at(tMs)` -> poses. Port of ai-tutor-blocks.ts (identical numbers; see test-vectors.json).
// ELEMENT CONTRACT: the engine never touches content, size or styling. It only outputs a pose per element index
// (centre x/y, rotation, scale, opacity) plus opacity/translateY for three text layers (intro, student, tutor).
// Swap the elements freely (other cards, any N); give the engine their rest poses via `Layout`.
// Artboard: 402 x 874 logical px (scale the whole artboard once by width / 402). Block: 231.5 x 50.
// Angles in degrees, time in ms. Drive with a Ticker / AnimationController (see AiTutorBlocksView below).
import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/animation.dart' show Cubic;
import 'package:flutter/material.dart';
import 'package:flutter/physics.dart';
import 'package:flutter/scheduler.dart';

const artW = 402.0, artH = 874.0, blockW = 231.5, blockH = 50.0;   // artboard + the default block size (for positioning only)

class Rest { final double cx, cy, r; const Rest(this.cx, this.cy, this.r); }
/// Where the elements rest, and where the tapped element lands (centre of its pose, artboard px).
class Layout { final List<Rest> rest; final double landingX, landingY; const Layout(this.rest, this.landingX, this.landingY); }
const defaultLayout = Layout([   // tower at rest (top -> bottom); any number of elements works
  Rest(200.7, 434.9, -2), Rest(180.7, 490.4, 0), Rest(200.7, 546.4, 2), Rest(219.7, 601.9, -4), Rest(200.7, 658.0, -2),
], 257.5, 164.8);   // landing = next to the student message

/// Spring either by (visualDuration s, bounce) or explicit physics. Same maths as Motion's spring().
class SpringCfg {
  final double stiffness, damping, mass, baseMs;
  const SpringCfg._(this.stiffness, this.damping, this.mass, this.baseMs);
  factory SpringCfg.visual(double visualDuration, double bounce) {
    final z = bounce >= 0 ? 1 - bounce : 1 / (1 + bounce);
    final root = 2 * math.pi / (visualDuration * 1.2), k = root * root;
    return SpringCfg._(k, 2 * z * math.sqrt(k), 1, visualDuration * 1000 * 1.6);
  }
  factory SpringCfg.physics(double stiffness, double damping, double mass) => SpringCfg._(stiffness, damping, mass, 0.8 * 1000 * 1.6);
  /// progress 0..1 over the animation's time base -> eased 0..1 (may overshoot)
  double Function(double) sampler() {
    final sim = SpringSimulation(SpringDescription(mass: mass, stiffness: stiffness, damping: damping), 0, 1, 0);
    return (p) => p >= 1 ? 1 : (p <= 0 ? 0 : sim.x(p * baseMs / 1000));
  }
}

/// Final tuned values (V2). Change here only.
// <<PARAMS
class OpenP {
  static const tap = 170.0, total = 1800.0, move = 420.0, morphAt = 0.23, rise = 68.0, gravity = 3500.0, kick = -10.0,
      spin = 235.0, spinRand = 55.0, drift = 310.0, start = 0.0, wobble = 7.0, flySpin = 58.0, arc = 0.0, ripple = 70.0, loading = 1800.0;
  static final spring = SpringCfg.physics(101, 15, 3.4);
}
class BackP { static const tap = 240.0, total = 1200.0, stagger = 70.0, rand = 1.0; static final spring = SpringCfg.visual(0.8, 0.2); }
class EnterP { static const tap = 240.0, total = 1190.0, stagger = 95.0, rand = 0.67, textAt = 190.0; static final spring = SpringCfg.visual(0.25, 0.25); }
const wiggleAmount = 0.4;   // desktop hover wiggle strength (0 = off)
// PARAMS>>

class Pose { final double cx, cy, rot, scale, opacity; const Pose(this.cx, this.cy, this.rot, this.scale, this.opacity); }
class Frame {
  final List<Pose> blocks;      // index = block index (0 = top)
  final double intro;           // headline + illustration + subtitle opacity
  final double student, studentRise;  // student message opacity; translateY = rise * (1 - bezMsg(opacity))
  final double tutor;           // tutor message opacity (translateY 14)
  final bool tutorDone;         // false = loading dots, true = reply text
  final int pressed;            // tapped (dark) block index, -1 = none
  const Frame(this.blocks, this.intro, this.student, this.studentRise, this.tutor, this.tutorDone, this.pressed);
  Frame withPressed(int p) => Frame(blocks, intro, student, studentRise, tutor, tutorDone, p);
}
class Timeline { final double duration; final Frame Function(double) at; const Timeline(this.duration, this.at); }

double _clamp(double v, double a, double b) => math.max(a, math.min(b, v));
const bezOpacity = Cubic(.25, .1, .25, 1);   // Flutter's Cubic is the same CSS cubic-bezier
const bezMsg = Cubic(.2, .8, .2, 1);
double _bez(Cubic c, double x) => x <= 0 ? 0 : (x >= 1 ? 1 : c.transform(x));

// mulberry32 – 32-bit safe (also on Flutter web, where ints are doubles)
int _imul(int a, int b) { a &= 0xFFFFFFFF; b &= 0xFFFFFFFF; final ah = a >>> 16, al = a & 0xFFFF;
  return ((al * b) + (((ah * b) & 0xFFFF) << 16)) & 0xFFFFFFFF; }
double Function() mulberry32(int seed) {
  var a = seed & 0xFFFFFFFF;
  return () {
    a = (a + 0x6D2B79F5) & 0xFFFFFFFF;
    var t = a;
    t = _imul(t ^ (t >>> 15), t | 1);
    t = (t ^ ((t + _imul(t ^ (t >>> 7), t | 61)) & 0xFFFFFFFF)) & 0xFFFFFFFF;
    return (((t ^ (t >>> 14)) & 0xFFFFFFFF)) / 4294967296.0;
  };
}

/// user action first (tapMs), then the animation, time-scaled so its motion lasts `totalMs`
Timeline _withTap(double duration, double motionEnd, Frame Function(double) base, double tapMs, double totalMs, [int block = -1]) {
  final f = totalMs > 0 ? totalMs / motionEnd : 1.0;
  return Timeline(duration * f + tapMs, (t) => base(math.max(0, t - tapMs) / f).withPressed(block >= 0 && t >= 60 ? block : -1));
}

// ---------- OPEN: user taps block i ----------
Timeline openAnim(int i, {int? seed, Layout layout = defaultLayout}) {
  final rest = layout.rest;
  final rnd = mulberry32(seed ?? math.Random().nextInt(1 << 31));
  double rr(double a, double b) => a + rnd() * (b - a);
  final td = rest[i]; final tx = layout.landingX, ty = layout.landingY;   // where the tapped block lands (next to the student message)
  final sp = OpenP.spring.sampler(), mD = OpenP.spring.baseMs, g = OpenP.gravity, mAt = OpenP.morphAt;
  final msgAt = OpenP.move * mAt, fadeD = OpenP.move * (1 - mAt), tutAt = msgAt + 850;
  final others = <_Fall>[];
  for (var j = 0; j < rest.length; j++) {
    if (j == i) continue;
    final d = rest[j], sd = rnd(), sr = rr(-1, 1), dr = rr(-1, 1), st = rnd();   // draw order matters for parity
    final delay = OpenP.ripple * (j - i).abs() + st * OpenP.start, vy = OpenP.kick, sg = sd < .5 ? 1.0 : -1.0;
    final w = sg * OpenP.spin * (1 + sr * OpenP.spinRand / 100), vx = dr * OpenP.drift;
    final tau = (-vy + math.sqrt(vy * vy + 2 * g * math.max(990 - d.cy, 0))) / g + .1;
    others.add(_Fall(j, d, delay, vy, vx, w, sg, delay + tau));
  }
  final motionEnd = math.max(mD, others.map((n) => n.end).reduce(math.max)) + 100;
  final doneAt = tutAt + OpenP.loading;
  final duration = math.max(motionEnd, doneAt + 500);
  Frame at(double t) {
    final blocks = List<Pose>.filled(rest.length, const Pose(0, 0, 0, 1, 1));
    final e = sp(_clamp(t / mD, 0, 1)), pc = _clamp(e, 0, 1), pb = math.sin(math.pi * pc);
    blocks[i] = Pose(td.cx + (tx - td.cx) * e - OpenP.arc * pb, td.cy + (ty - td.cy) * e, td.r * (1 - pc) - OpenP.flySpin * pc,
        1 + .07 * math.sin(math.pi * _clamp(t / mD, 0, 1)), 1 - _clamp((t - msgAt) / fadeD, 0, 1));
    for (final n in others) {
      final u = math.max(0, (t - n.delay) / 1000), q = .22 * (1 - math.exp(-u / .22));   // spin + drift ease in
      blocks[n.j] = Pose(n.d.cx + n.vx * q * 1.6, n.d.cy + n.vy * u + .5 * g * u * u,
          n.d.r + n.w * (u - q) + OpenP.wobble * n.sg * math.sin(u * 18) * math.exp(-u * 7), 1, 1);
    }
    return Frame(blocks, 1 - _clamp(t / 450, 0, 1), _clamp((t - msgAt) / (fadeD + 250), 0, 1), OpenP.rise,
        _clamp((t - tutAt) / 600, 0, 1), t >= doneAt, -1);
  }
  return _withTap(duration, motionEnd, at, OpenP.tap, OpenP.total, i);
}
class _Fall { final int j; final Rest d; final double delay, vy, vx, w, sg, end; _Fall(this.j, this.d, this.delay, this.vy, this.vx, this.w, this.sg, this.end); }

// ---------- BACK: user taps "+" while the chat is open ----------
Timeline backAnim({int? seed, Layout layout = defaultLayout}) {
  final rest = layout.rest;
  final rnd = mulberry32(seed ?? math.Random().nextInt(1 << 31));
  double rr(double a, double b) => a + rnd() * (b - a);
  final sp = BackP.spring.sampler(), D = BackP.spring.baseMs, n = rest.length;
  final items = <_In>[];
  for (var j = 0; j < n; j++) {
    final d = rest[j], delay = (n - 1 - j) * BackP.stagger * 1.3;       // lowest block first
    rr(0, 1); final rot = rr(-1, 1) * 80 * BackP.rand, xo = rr(-1, 1);   // dist (unused), rot, xo
    items.add(_In(d, delay, d.cx + xo * 170, 910 + rr(0, 1) * 60 + j * 14, d.r + rot * .6));
  }
  final introAt = D * .45, motionEnd = items.map((it) => it.delay + D).reduce(math.max) + 100;
  final duration = math.max(motionEnd, math.max(introAt + 500, 500));
  Frame at(double t) => Frame([
        for (final it in items) () { final e = sp((t - it.delay) / D);
          return Pose(it.sx + (it.d.cx - it.sx) * e, it.sy + (it.d.cy - it.sy) * e, it.sr + (it.d.r - it.sr) * e, 1, 1); }()
      ], _clamp((t - introAt) / 450, 0, 1), 1 - _clamp(t / 450, 0, 1), 14, 1 - _clamp(t / 450, 0, 1), true, -1);
  return _withTap(duration, motionEnd, at, BackP.tap, BackP.total);
}

// ---------- ENTER: user opens the AI Tutor tab (blocks arrive near their place, text last) ----------
Timeline enterAnim({int? seed, Layout layout = defaultLayout}) {
  final rest = layout.rest;
  final s = seed ?? math.Random().nextInt(1 << 31);
  final rnd = mulberry32(s); double rr(double a, double b) => a + rnd() * (b - a);       // kept only for parity of draw order
  final r2 = mulberry32((s ^ 0x9e3779b9) & 0xFFFFFFFF); double r2r(double a, double b) => a + r2() * (b - a);
  final sp = EnterP.spring.sampler(), D = EnterP.spring.baseMs, mid = (rest.length - 1) / 2;
  final items = <_In>[];
  for (var j = 0; j < rest.length; j++) {
    final d = rest[j], side = j < mid ? -1.0 : (j > mid ? 1.0 : 0.0);
    final delay = r2r(0, 1) * EnterP.stagger * 3;
    rr(0, 1); rr(-1, 1); rr(-1, 1);
    final hx = (r2r(0, 1) < .5 ? -1 : 1) * (130 + r2r(0, 1) * 150), vy = side * (110 + r2r(0, 1) * 140);
    final tilt = (r2r(0, 1) < .5 ? -1 : 1) * (16 + r2r(0, 1) * 30) * EnterP.rand;
    items.add(_In(d, delay, d.cx + hx, d.cy + vy, d.r + tilt));
  }
  final motionEnd = items.map((it) => it.delay + D).reduce(math.max) + 100;
  final duration = math.max(motionEnd, EnterP.textAt + 500);
  Frame at(double t) => Frame([
        for (final it in items) () { final e = sp((t - it.delay) / D);
          return Pose(it.sx + (it.d.cx - it.sx) * e, it.sy + (it.d.cy - it.sy) * e, it.sr + (it.d.r - it.sr) * e, 1, _bez(bezOpacity, (t - it.delay) / 350)); }()
      ], _clamp((t - EnterP.textAt) / 450, 0, 1), 0, 14, 0, false, -1);
  return _withTap(duration, motionEnd, at, EnterP.tap, EnterP.total);
}
class _In { final Rest d; final double delay, sx, sy, sr; _In(this.d, this.delay, this.sx, this.sy, this.sr); }

// ---------- DESKTOP HOVER WIGGLE (pointer devices only: web/desktop) ----------
// On pointer-enter: ONE random jolt, then it springs back; the hovered element gets a light grey fill (#ececec).
// Jolt: to the offset in 180 ms, Cubic(.2,.9,.3,1.2). After 110 ms: back to 0 in 500 ms, Cubic(.2,1.4,.4,1). On exit: back immediately.
// Disable while an animation runs / after a block was tapped (`enabled: false`).
class HoverWiggle extends StatefulWidget {
  const HoverWiggle({super.key, required this.child, this.enabled = true, this.amount = wiggleAmount});
  final Widget child; final bool enabled; final double amount;
  @override State<HoverWiggle> createState() => _HoverWiggleState();
}
class _HoverWiggleState extends State<HoverWiggle> {
  final _rnd = math.Random(); Offset _o = Offset.zero; double _rot = 0; bool _jolt = true; Timer? _t;
  void _enter() { if (!widget.enabled || widget.amount <= 0) return; final a = widget.amount;
    setState(() { _jolt = true; _o = Offset((_rnd.nextDouble() * 2 - 1) * 5 * a, (_rnd.nextDouble() * 2 - 1) * 4 * a); _rot = (_rnd.nextDouble() * 2 - 1) * 5 * a; });
    _t?.cancel(); _t = Timer(const Duration(milliseconds: 110), _settle); }
  void _settle() { if (mounted) setState(() { _jolt = false; _o = Offset.zero; _rot = 0; }); }
  @override void dispose() { _t?.cancel(); super.dispose(); }
  @override Widget build(BuildContext c) => MouseRegion(
        onEnter: (_) => _enter(), onExit: (_) { _t?.cancel(); _settle(); },
        child: AnimatedContainer(
          duration: Duration(milliseconds: _jolt ? 180 : 500), curve: _jolt ? const Cubic(.2, .9, .3, 1.2) : const Cubic(.2, 1.4, .4, 1),
          transformAlignment: Alignment.center,
          transform: Matrix4.identity()..translate(_o.dx, _o.dy)..rotateZ(_rot * math.pi / 180), child: widget.child));
}

// ---------- usage ----------
// Wrap the 402 x 874 artboard in FittedBox / Transform.scale(width / 402). Render each block as a widget of 231.5 x 50:
//   Positioned(left: p.cx - blockW / 2, top: p.cy - blockH / 2,
//     child: Opacity(opacity: p.opacity, child: Transform(alignment: Alignment.center,
//       transform: Matrix4.identity()..rotateZ(p.rot * math.pi / 180)..scale(p.scale), child: BlockCard(...))))
// Student message: Opacity(frame.student) + Transform.translate(Offset(0, frame.studentRise * (1 - bezMsg.transform(frame.student)))).
// Tapped block (frame.pressed == index): dark background, white label + icon, stays dark until it has faded out.
class AiTutorTimelineDriver extends StatefulWidget {
  const AiTutorTimelineDriver({super.key, required this.timeline, required this.builder});
  final Timeline timeline;
  final Widget Function(BuildContext, Frame) builder;
  @override State<AiTutorTimelineDriver> createState() => _DriverState();
}
class _DriverState extends State<AiTutorTimelineDriver> with SingleTickerProviderStateMixin {
  late final Ticker _ticker; double _t = 0;
  @override void initState() { super.initState();
    _ticker = createTicker((d) { final t = d.inMicroseconds / 1000; setState(() => _t = math.min(t, widget.timeline.duration));
      if (t >= widget.timeline.duration) _ticker.stop(); })..start(); }
  @override void dispose() { _ticker.dispose(); super.dispose(); }
  @override Widget build(BuildContext c) => widget.builder(c, widget.timeline.at(_t));
}

````
