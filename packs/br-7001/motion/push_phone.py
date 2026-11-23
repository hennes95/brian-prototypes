# Builds the phone-only prototype into the prototypes repo: fixed loader + app.html with values baked in.
import json, os, shutil, sys
REPO = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../..')); DIR = 'br-7001/motion/use-case-blocks'; out = os.path.join(REPO, DIR); os.makedirs(out, exist_ok=True)
d = json.load(open('values.json')); bake = {'values': d['values'], 'variant': d.get('variant')}
html = open('out/index.html').read()
head = ('<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,viewport-fit=cover">'
        '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default">'
        '<meta name="theme-color" content="#ffffff"><meta name="color-scheme" content="light">'
        '<meta name="apple-mobile-web-app-title" content="BR-7001"><link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">'
        '<link rel="manifest" href="manifest.webmanifest"><script src="../../../_shared/a2hs.js?v=' + str(int(__import__("time").time())) + '" defer></script>'
        '<script>window.MWB_STANDALONE = ' + json.dumps(bake) + ';</script>')
html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>BR-7001 · AI Tutor use cases</title>' + head + '</head><body>' + html + '</body></html>'
open(os.path.join(out, 'app.html'), 'w').write(html)
for f in ['motion-engine.js', 'motion-package.md']: shutil.copy('out/' + f, os.path.join(out, f))
open(os.path.join(out, 'index.html'), 'w').write('''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>BR-7001 · AI Tutor use cases (motion prototype)</title>
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="theme-color" content="#ffffff"><meta name="color-scheme" content="light">
<link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">
<style>html,body{margin:0;background:#fff}</style>
<!-- This page never changes, so a cached copy is harmless. It always opens the newest build (app.html with a fresh query, bypassing the ~10 min GitHub Pages cache). -->
<script>location.replace("app.html?v="+Date.now()+location.hash);</script>
</head><body></body></html>
''')
open(os.path.join(out,'manifest.webmanifest'),'w').write(json.dumps({"name":"BR-7001 · AI Tutor use cases","short_name":"BR-7001","start_url":"./","scope":"./","display":"standalone","background_color":"#ffffff","theme_color":"#ffffff",
  "icons":[{"src":"icon-192.png","sizes":"192x192","type":"image/png"},{"src":"icon-512.png","sizes":"512x512","type":"image/png","purpose":"any maskable"}]},indent=1))
print('variant', bake['variant'], 'values', len(bake['values']))
