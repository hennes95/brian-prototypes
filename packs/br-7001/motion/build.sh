#!/usr/bin/env bash
# Rebuild the BR-7001 motion package + Animation Workbench from source. Run from this folder. See README.md.
set -euo pipefail
cd "$(dirname "$0")"; mkdir -p out
python3 build_engine.py                     # source/orig.html + source/engine_tail.js -> out/motion-engine.js
python3 gen_ref.py                          # values.json -> out/ref_v3.out.ts + out/ref_v3.out.dart
node --experimental-strip-types --no-warnings check/parity.mjs   # TS port vs engine test vectors (stops on mismatch)
tsc --noEmit --strict --target es2022 --lib es2022,dom out/ref_check.ts && rm -f out/ref_check.ts && echo "Types: OK"
python3 assemble.py                         # -> out/motion-package.md + out/index.html (workbench)
if [ "${1:-}" = "--push-phone" ]; then python3 push_phone.py; fi   # -> br-7001/motion/use-case-blocks/ (phone build)
