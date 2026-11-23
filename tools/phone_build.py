#!/usr/bin/env python3
"""Phone build of a ticket's feature workbench: the assembled workbench opened in prototype mode, for GitHub Pages.

    python3 tools/assemble.py br-7144
    python3 tools/phone_build.py br-7144            -> br-7144/flow/

Writes <ticket>/flow/ with
  index.html   fixed loader: always opens the newest app.html (bypasses the ~10 min GitHub Pages cache)
  app.html     dist/<ticket>/index.html with: #prototype as the start route, viewport maximum-scale=1,
               ticket icons, the Add to Home Screen tutorial, the two-finger switcher (_shared/phonesw.js), comment tools hidden, ?v=<build> on every local file
  shell/pack files and assets from dist/<ticket>/ (agt.js left out: no comments on the phone)
Icons: node _shared/make_icon.js <ticket>/flow <number> BR Flow (run once; kept between builds).
"""
import re, shutil, sys, time, json
from pathlib import Path

root = Path(__file__).resolve().parent.parent
ticket = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
src = root / "dist" / ticket
if not src.is_dir():
    sys.exit(f"run tools/assemble.py {ticket} first")
cfg = json.loads((root / "packs" / ticket / "pack.json").read_text())
out = root / ticket / "flow"
out.mkdir(parents=True, exist_ok=True)
v = time.strftime("%Y%m%d%H%M%S")

for f in src.iterdir():
    if f.name in ("index.html", "agt.js"):
        continue
    dst = out / f.name
    if dst.is_dir():
        shutil.rmtree(dst)
    (shutil.copytree if f.is_dir() else shutil.copy2)(f, dst)

title = f'{cfg["ticket"]} · {cfg["title"]} (prototype)'
html = (src / "index.html").read_text()
html = re.sub(r'<meta name="viewport"[^>]*>', '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">', html)
html = re.sub(r"<title>.*?</title>", f"<title>{title}</title>", html)
head = (f'<link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">'
        f'<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default">'
        f'<meta name="apple-mobile-web-app-title" content="{cfg["ticket"]}"><meta name="theme-color" content="#ffffff"><meta name="color-scheme" content="light">'
        '<style>.cbtn,#agt-root{display:none!important}</style>'
        '<script>if(location.hash!=="#prototype"&&location.hash!=="#tutorial")history.replaceState(null,"",location.pathname+location.search+"#prototype");</script>')
html = html.replace("</title>", "</title>" + head, 1)
for name in ("shell.css", "pack.css", "pack.js", "shell.js"):
    html = html.replace(f'"{name}"', f'"{name}?v={v}"')
html = re.sub(r"<script>\s*/\* Agentation.*?</script>", "", html, flags=re.S)  # no comment toolbar on the phone
html = html.replace("</body>", f'<script src="../../_shared/a2hs.js?v={v}" defer></script>\n<script src="../../_shared/phonesw.js?v={v}" defer></script>\n</body>')
(out / "app.html").write_text(html)
(out / "index.html").write_text(f"""<!DOCTYPE html>
<html lang="en"><head><link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">
<title>{title}</title>
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-title" content="{cfg["ticket"]}">
<meta name="theme-color" content="#ffffff"><meta name="color-scheme" content="light">
<style>html,body{{margin:0;background:#fff}}</style>
<!-- This page never changes, so a cached copy is harmless. It always opens the newest build (app.html with a fresh query, bypassing the ~10 min GitHub Pages cache). -->
<script>location.replace("app.html?v="+Date.now()+(location.hash||"#prototype"));</script>
</head><body></body></html>
""")
print(f"{ticket}: phone build {v} -> {out.relative_to(root)}")
