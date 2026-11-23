#!/usr/bin/env python3
"""Export a ticket's handoff package: packs/<ticket>/handoff/
   python3 tools/export_handoff.py br-7001 <workbench-db.json> [<copies.md>]
<workbench-db.json> = the artifact database document (workbench/<ticket>), read by Claude with ArtifactData.
<copies.md> = the ticket's Copies page from Notion ("Copies BR-xxxx", all keys and languages), fetched by Claude and saved as markdown.
Writes HANDOFF.md, spec.md, states.json, decisions.draft.md, copies.md (+ copies the motion package if pack.json names one).
decisions.draft.md lists every declined proposal and resolved thread: Claude turns it into decisions.md
(one line per thing removed or rejected) and deletes the draft. It also prints contradictions it can spot
(e.g. the same setting with two values) so they get fixed in the workbench before handoff."""
import json, re, html, sys, os, shutil, subprocess
tk, dbp = sys.argv[1], sys.argv[2]; cp = sys.argv[3] if len(sys.argv) > 3 else None
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
pk = os.path.join(root, 'packs', tk); out = os.path.join(pk, 'handoff'); os.makedirs(out, exist_ok=True)
P = json.load(open(os.path.join(pk, 'pack.json'))); D = json.load(open(dbp))
commit = subprocess.run(['git','-C',root,'rev-parse','--short','HEAD'],capture_output=True,text=True).stdout.strip()

def md(h):
    if h and 'class="imp"' in h: print('CHECK: imported block not kept or dropped yet (grey bar in the workbench)')
    h = re.sub(r'<div class="imp"[^>]*>(.*?)</div>', r'\1', h or '', flags=re.S)
    h = re.sub(r'<span class="ai"[^>]*>(.*?)</span>', r'\1 *(open proposal)*', h or '', flags=re.S)
    h = re.sub(r'<a [^>]*href="([^"]+)"[^>]*>(.*?)</a>', r'[\2](\1)', h)
    h = re.sub(r'</?b>', '**', h); h = re.sub(r'<h4>(.*?)</h4>', r'\n\n#### \1\n\n', h)
    o = []; dep = 0
    for t in re.split(r'(<ul>|</ul>|<ol>|</ol>|<li>|</li>)', h):
        if t in ('<ul>','<ol>'): dep += 1
        elif t in ('</ul>','</ol>'): dep -= 1
        elif t == '<li>': o.append('\n' + '  '*max(dep-1,0) + '- ')
        elif t == '</li>': pass
        elif t.strip(): o.append(html.unescape(re.sub(r'<[^>]+>', '', t)).strip() if not t.strip().startswith('####') else t)
    s = ''.join(o); s = re.sub(r'([^\n])\n\n####', r'\1\n\n####', s)
    return re.sub(r'\n{3,}', '\n\n', s).strip()

t = P.get('title', tk); L = P.get('links', {})
spec = [f"# {P['ticket']} · {t} — spec", "", f"> Exported from the Feature Workbench at commit `{commit}`. For people; agents start at `HANDOFF.md`.", ""]
for k, n in [('brief','Brief'),('rules','Rules'),('edges','Edge cases'),('ds','Design system changes'),('questions','Open questions')]:
    if D['docs'].get(k): spec += ['## '+n, '', md(D['docs'][k]), '']
spec += ['## States', '']
for m in D['modes']:
    spec += ['### '+m['name'], '']
    for s in m['states']: spec += [f"#### {s['name']} (`{s['id']}`)", '', md(s.get('doc','')) or '_(no spec)_', '']
open(os.path.join(out,'spec.md'),'w').write('\n'.join(spec))

st = {"ticket":P['ticket'], "source":f"packs/{tk} @ {commit}", "states":[{"id":s['id'],"mode":m['name'],"name":s['name'],"figma":m.get('figma') or None} for m in D['modes'] for s in m['states']],
      "transitions":P.get('transitions',[]), "notes":P.get('stateNotes',{})}
open(os.path.join(out,'states.json'),'w').write(json.dumps(st, indent=2)+'\n')

dr = ["# decisions.draft (Claude: turn into decisions.md, one line per thing removed or rejected, then delete this file)", ""]
for pid, th in (D.get('threads') or {}).items():
    if th.get('status') in ('declined','resolved','revised') or any(x.get('why') for x in th.get('msgs',[])):
        dr.append(f"- [{th.get('status','?')}] {th.get('text','')}")
        for x in th.get('msgs',[]): dr.append(f"    - {'Hannes' if x['w']=='h' else 'Claude'}{' (why)' if x.get('why') else ''}: {x['t']}")
open(os.path.join(out,'decisions.draft.md'),'w').write('\n'.join(dr)+'\n')

if cp:
    open(os.path.join(out,'copies.md'),'w').write(f"# {P['ticket']} · copies\n\n> Copy of the Notion Copies page{(' (' + P['links']['copies'] + ')') if P.get('links',{}).get('copies') else ''} at export. Use these keys and texts; never write UI text yourself.\n\n" + open(cp).read().strip() + "\n")
else: print("CHECK: no copies.md: pass the ticket's Copies page (Notion) as 3rd argument, or confirm the ticket has no UI text")
mp = P.get('motionPackage')
if mp and os.path.exists(os.path.join(root, mp)): shutil.copy(os.path.join(root, mp), os.path.join(out, 'motion-package.md'))
links = ' · '.join(f"[{n}]({L[k]})" for k, n in [('feature','Feature Workbench'),('animation','Animation Workbench'),('phone','Phone prototype'),('notion','Notion ticket'),('copies','Copies')] if L.get(k))
read = ["1. `spec.md` — what the user sees and can do, per state (human-readable).", "2. `decisions.md` — what was removed or rejected. Don't add it back.", "3. `states.json` — states, transitions and which animation each transition uses."]
if cp: read.append("4. `copies.md` — every UI text with its key, in all languages. Binding.")
if mp: read.append(f"{len(read)+1}. `motion-package.md` — animation values, engine, screen layout (Flutter + React), test vectors. Only for animation work.")
open(os.path.join(out,'HANDOFF.md'),'w').write(f"""# {P['ticket']} · {t} — handoff

**Source of truth:** `packs/{tk}/handoff/` at commit `{commit}`. The Notion ticket holds a copy of `spec.md` for reading; it is regenerated from here, never edited by hand.

## Read in this order
{chr(10).join(read)}

## Binding vs. reference
- **Binding:** behaviour, states, transitions{', UI texts (copies.md)' if cp else ''}{', animation values, layout positions (±0.5 px)' if mp else ''}.
- **Reference only:** prototype markup/CSS. Build with Brian's real components.

## Checks
{'- Animations: run the test vectors in `motion-package.md`.' + chr(10) if mp else ''}- Behaviour: every transition in `states.json` must be reachable in the app.

## Links
{links}
""")
# contradictions: numbers that appear with different values next to the same keyword
txt = open(os.path.join(out,'spec.md')).read()
for kw in ['shortcut','stagger','duration','blocks']:
    vals = sorted(set(re.findall(kw + r'[^\n]{0,40}?(⌘?\d+\s*[–-]\s*\d+)', txt, flags=re.I)))
    if len(vals) > 1: print(f"CHECK: '{kw}' appears with different values: {vals}")
print('handoff ->', os.path.relpath(out, root), sorted(os.listdir(out)))
