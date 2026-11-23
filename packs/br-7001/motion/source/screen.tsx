// AI Tutor home screen – layout as code (web / React). Part of the motion package; the workbench does not read this block.
// Artboard 402 × 874 logical px. Render the artboard at its design size and scale it ONCE (width / 402), never per element.
// Static layout is fixed (absolute positions as designed). The motion engine drives only what `frame` carries:
// block poses, intro opacity, student / tutor message opacity + rise, pressed block, for V3 the morph of the tapped block,
// and for Focus / Back out / Send the keyboard progress (input bar follows it) and the text flying from the field to the student message.
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
  kb?: number;                                                  // Focus / Back out / Send: keyboard progress 0 (down) .. 1 (up); input bar moves by kb * KB.inputDy
  fly?: { x: number; cy: number; o: number; text: string };     // Send: typed text in flight (left edge x, line centre cy), hidden on landing
};

export const ART = { w: 402, h: 874 };
export const BLOCK = { w: 231.5, h: 50 };
/** Keyboard: the real app uses the OS keyboard and its own slide; the input bar sits on top of it (245 px higher when open).
 *  In the app, move the input bar with the keyboard inset; `kb` is the engine's stand-in for that progress (prototype + test vectors). */
export const KB = { h: 336, inputDy: -245 };
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
      {/* input bar: top 731, 24 px side padding; rides on the keyboard */}
      <div style={{ ...abs(0, 731, ART.w), transform: `translateY(${(f.kb ?? 0) * KB.inputDy}px)`, zIndex: 2, padding: '4px 24px', boxSizing: 'border-box', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
        <div style={{ width: 32, height: 32, borderRadius: 16, background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', marginBottom: 4 }}>
          <img src={assets.attach} alt="" width={16} height={16} /></div>
        <div style={{ flex: 1, border: `0.75px solid ${C.dark}`, borderRadius: 20, padding: '4px 4px 4px 12px', display: 'flex', alignItems: 'center', gap: 8, background: C.white }}>
          <input placeholder="Or ask anything..." value={f.fly ? '' : undefined} readOnly={!!f.fly} style={{ flex: 1, minWidth: 0, border: 0, outline: 0, background: 'none', padding: 4, ...text(500, 14, 19.6) }} />
          <button aria-label="Send" style={{ width: 30, height: 30, borderRadius: 15, background: C.dark, border: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none', padding: 0 }}>
            <img src={assets.send} alt="" width={16} height={16} /></button>
        </div>
      </div>
      {/* Send: the typed text flies from the field to the student message line (14 / 500, same style as the message) */}
      {f.fly && f.fly.o > 0 && <span style={{ ...abs(f.fly.x, f.fly.cy - 9.8), ...text(500, 14, 19.6), whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 3 }}>{f.fly.text}</span>}
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
