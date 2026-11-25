// AI Tutor home screen – layout as code (Flutter). Part of the motion package; the workbench does not read this block.
// Artboard 402 × 874 logical px. Wrap it in FittedBox / Transform.scale(width / 402) ONCE, never per element.
// Static layout is fixed (absolute positions as designed). The motion engine drives only what `frame` carries:
// block poses, intro opacity, student / tutor message opacity + rise, pressed block, for V3 the morph of the tapped block,
// and for Focus / Back out the keyboard progress (input bar follows it).
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
  final double kb;                                              // Focus / Back out: keyboard progress 0..1
  const ScreenFrame({required this.blocks, this.intro = 1, this.stu = 0, this.tut = 0, this.rise = 14, this.done = false,
      this.pressed = false, this.hover = -1, this.stuText, this.morph, this.kb = 0});
}

const artW = 402.0, artH = 874.0, blockW = 231.5, blockH = 50.0;
/// Keyboard: the app uses the OS keyboard and its own slide; the input bar sits on top of it (245 px higher when open).
/// In the app, move the input bar with MediaQuery.viewInsetsOf(context).bottom; `kb` is the engine's stand-in for that progress.
const kbH = 336.0, kbInputDy = -245.0;
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
      Positioned(left: 0, top: 731, width: artW, child: Transform.translate(offset: Offset(0, f.kb * kbInputDy), child: Padding(padding: const EdgeInsets.fromLTRB(24, 4, 24, 4), child: Row(crossAxisAlignment: CrossAxisAlignment.end, children: [
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
      ])))),
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
