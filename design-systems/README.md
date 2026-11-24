# Design systems for workbench screens

Each workbench screen belongs to one side of the product, and each side has its own design system:

- **Teacher side** (Teacher CMS, web app): `brian-teacher/ds.css`
  - Copied from the claude.ai artifact "Brian Teacher Design System" (slug `46c23e88-bce3-4c8d-b0ca-b6d200e35427`).
  - Default for every teacher screen in a pack (Hannes 24.11).
  - Everything is scoped to `.ds-teacher`: put that class on the root of a teacher screen only.
- **Student side** (mobile app): brian-mobile-design-kit (GitHub brian-study/brian-mobile-design-kit) is the style reference. Not wired in here yet.

A pack opts in through `pack.json`:

```json
"designSystems": ["brian-teacher"]
```

`tools/assemble.py` then puts the design system's `ds.css` in front of the pack's `pack.css` in `dist/`. A pack with only student screens leaves it out.

When the artifact changes, copy the new values into `ds.css` and note the date here.

- 24.11.26: first copy (tokens, Button, Checkbox, Table, TabBar, SidebarNavItem, Tooltip, Badge).
