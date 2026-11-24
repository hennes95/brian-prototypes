# Workbenches

Shells for Hannes' feature and animation workbenches, and the packs that load into them.

## Where things live
- **GitHub (this repo):** all code. The one source of truth.
  - `workbench/feature/<version>/`: feature workbench shell. Never contains anything about a ticket.
  - `packs/<ticket>/`: one ticket's prototype (`pack.js`, `pack.css`, `assets/`) and its pinned shell (`pack.json`).
  - `workbench/animation/`: animation workbench shell (not yet extracted).
- **Notion:** skill instructions, and specs after handoff (ticket "Update" sections).
- **Claude artifacts:** the running copy of a ticket's workbench, published from `dist/` and never edited by hand.
  The spec, while it's being written, lives in that artifact's database.
- **GitHub Pages:** hosted prototypes for phones and user tests (`br-7147/` etc.).

## Versions and pinning
- Every shell release is a new folder (`workbench/feature/1.0.0/`, `1.1.0/` …) plus an entry in `CHANGELOG.md`. Old versions stay.
- Each pack pins its shell in `pack.json` (`"shell": "feature@1.0.0"`). A ticket stays on that version.
- When a new shell version exists, Claude asks before upgrading a ticket, and says whether anything would break.

## Build a ticket workbench
```
python3 tools/assemble.py br-7147     # -> dist/br-7147/ (shell version from pack.json + the pack)
```
Publish the contents of `dist/<ticket>/` as the ticket's artifact. `dist/` is not committed.

## Load a ticket
Steps (new ticket, existing workbench, ticket changed, old prototype, animations): Notion > 🧰 Workbenches > "Load a ticket".
- `pack.json` keeps the ticket's `links` (feature / animation artifact, phone prototype, Notion ticket) so the next chat finds the running workbench.
- A pack built by a script keeps it next to it (`build.py`, sources in `source/`), so any chat can rebuild it.

## Pack interface
See `workbench/feature/PACK-API.md`.

## Design systems

Teacher screens in a pack use the Brian Teacher Design System by default (Hannes 24.11): add `"designSystems": ["brian-teacher"]` to `pack.json` and put `ds-teacher` on the root of each teacher screen. Student screens never get it. See `design-systems/README.md`.
