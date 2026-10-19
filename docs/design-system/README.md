# Asha design system

The canonical design system for Asha, as of 2026-09-25. It combines Preline's colours, shadcn's sizes and finish,
and Attio's data grid, and it is shown as 93 working blocks of real Asha screens.

- **Open it:** open `index.html` in a browser. It is one self-contained file, so no build or server is needed. It has:
  - Overview, with a thumbnail per group;
  - Foundations: colour, text, size, density and motion, including an Animations On / Reduced switch;
  - Components;
  - the 13 block groups;
  - the Build list of every class recipe.
- **Rules for agents and engineers:** `.claude/skills/asha-ui/references/design-system.md`. The `asha-ui` skill loads
  it by default.

## What's here

| Path | What |
|---|---|
| `index.html` | The built library (generated; don't edit by hand). |
| `dev.html` | The same page loading the source files directly, for editing. |
| `index.html?tables=grid` | "Tables as grids", an experiment: the same page with every hand-made table in a side panel, dialog, popover or page section rebuilt through the data grid (`Grid.fromTable` in `src/kit.js`) in the presentation that fits where it sits: `section` on a page, `panel` in a flyout, dialog or popover, `form` for money tables with four or more number columns. Switch from the top of the sidebar; works on `dev.html` too. |
| `src/kit.js` | Class recipes (`R`), helpers, the Attio grid, the side panel, charts and motion. This is the reference for the matching `asha-ui` primitives. |
| `src/data.js` | Shared invented sample data (patients, providers, chairs, payers, CDT codes). No real people. |
| `src/app.js`, `src/categories.js`, `src/index.html` | Page shell, block groups and page template (styles and motion keyframes). |
| `blocks/<group>.js` | The blocks for one group, one file each. |
| `BLOCKS-GUIDE.md` | How to build or change a block: file shape, look-and-feel rules and the owner's feedback rules. |
| `INVENTORY.md` | The real Asha screens, labels, columns and statuses the blocks use. |
| `ux-principles/README.md` | The UX principles: how we decide what goes on a screen. Read it before designing. |
| `qa/shoot.cjs` | Screenshots every block in every state and flags render failures, spill, cut-off headers, open-sided tables and lists, undrawn icons and console errors. |

## Change it

```bash
python3 docs/design-system/build.py                        # rebuild index.html and dev.html
python3 -m http.server 8797 -d docs/design-system &         # serve dev.html
BLEND_URL=http://localhost:8797/dev.html node docs/design-system/qa/shoot.cjs all   # needs Playwright
```

The screenshots land in `docs/design-system/qa/out/`. Don't commit them.
