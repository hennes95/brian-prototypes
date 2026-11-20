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
print(f"{ticket}: shell {cfg['shell']} + pack -> {out.relative_to(root)}")
