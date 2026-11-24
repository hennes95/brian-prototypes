#!/usr/bin/env python3
"""Assemble a ticket workbench: the pinned shell version plus the ticket's pack, in one folder.

    python3 tools/assemble.py br-7147          -> dist/br-7147/

The output is what gets published as the ticket's Claude artifact. Nothing in it is edited by hand:
change the shell in workbench/feature/<version>/ or the ticket in packs/<ticket>/, then assemble again.
"""
import json, shutil, sys
from pathlib import Path

root = Path(__file__).resolve().parent.parent
ticket = sys.argv[1] if len(sys.argv) > 1 else sys.exit(__doc__)
pack = root / "packs" / ticket
cfg = json.loads((pack / "pack.json").read_text())
kind, version = cfg["shell"].split("@")
shell = root / "workbench" / kind / version
if not shell.is_dir():
    sys.exit(f"shell {cfg['shell']} not found at {shell}")

out = root / "dist" / ticket
if out.exists():
    shutil.rmtree(out)
shutil.copytree(shell, out)
for f in pack.iterdir():
    if f.name == "pack.json":
        continue
    dst = out / f.name
    if dst.exists():
        sys.exit(f"pack file {f.name} would overwrite a shell file")
    (shutil.copytree if f.is_dir() else shutil.copy2)(f, dst)
# design systems (design-systems/<name>/ds.css) go in front of pack.css, in the order listed
ds = cfg.get("designSystems", [])
if ds:
    css = "".join((root / "design-systems" / n / "ds.css").read_text() + "\n" for n in ds)
    pc = out / "pack.css"
    pack_css = pc.read_text() if pc.exists() else ""
    imports = [l for l in pack_css.splitlines() if l.startswith("@import")]
    rest = "\n".join(l for l in pack_css.splitlines() if not l.startswith("@import"))
    # @import rules must come first in the file
    ds_imports = [l for l in css.splitlines() if l.startswith("@import")]
    ds_rest = "\n".join(l for l in css.splitlines() if not l.startswith("@import"))
    pc.write_text("\n".join(ds_imports + imports) + "\n" + ds_rest + "\n" + rest)
print(f"{ticket}: shell {cfg['shell']} + pack{' + ' + ', '.join(ds) if ds else ''} -> {out.relative_to(root)}")
