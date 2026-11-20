// Home-screen icon + favicon showing the ticket number, so prototypes are easy to tell apart.
// Usage: node _shared/make_icon.js <out dir> <big text> [small top] [small bottom]
//   e.g. node _shared/make_icon.js br-7147 7147 BR Flow
//        node _shared/make_icon.js ai-tutor-blocks/motion/use-case-blocks AI "AI Tutor" Motion
// Writes icon-180.png (apple-touch-icon), icon-192.png, icon-512.png, favicon-32.png into <out dir>.
const { chromium } = require('playwright'); const path = require('path');
const [out, big, top = '', bottom = ''] = process.argv.slice(2);
const svg = s => `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#3a3a3a"/>
  ${top ? `<text x="50" y="27" text-anchor="middle" font-family="Inter Display, Inter, sans-serif" font-weight="600" font-size="12" fill="rgba(255,255,255,.6)" letter-spacing=".04em">${top}</text>` : ''}
  <text x="50" y="${bottom||top ? 63 : 66}" text-anchor="middle" font-family="Inter Display, Inter, sans-serif" font-weight="700" font-size="${big.length > 4 ? 28 : 34}" fill="#fff" letter-spacing="-.02em">${big}</text>
  ${bottom ? `<text x="50" y="84" text-anchor="middle" font-family="Inter Display, Inter, sans-serif" font-weight="600" font-size="10.5" fill="rgba(255,255,255,.5)" letter-spacing=".08em">${bottom.toUpperCase()}</text>` : ''}
</svg>`;
(async () => { const b = await chromium.launch();
  for (const [s, f] of [[180,'icon-180.png'],[192,'icon-192.png'],[512,'icon-512.png'],[32,'favicon-32.png']]) {
    const p = await b.newPage({ viewport: { width: s, height: s } }); await p.setContent(`<body style="margin:0">${svg(s)}</body>`);
    await p.screenshot({ path: path.join(out, f) }); await p.close(); }
  await b.close(); console.log('icons ->', out); })();
