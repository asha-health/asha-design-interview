# Asha design system

Preline's colours, shadcn's sizes and finish, and Attio's data grid.

- **Open it:** open `index.html` in a browser. It is one self-contained file. It has the Overview (with the rules every
  screen follows), Foundations (colour, text, size, density and motion) and Components (buttons, fields, tags, menus
  and dialogs, notes and toasts, the data grid and a calendar).
- **Rules for agents:** `.claude/skills/asha-ui/references/design-system.md`.

| Path | What |
|---|---|
| `index.html` | The built library (generated; don't edit by hand). |
| `dev.html` | The same page loading the source files directly, for editing. |
| `src/kit.js` | Class recipes (`R`), helpers, the data grid, the calendar, the side panel, charts and motion. |
| `src/app.js`, `src/index.html` | Page shell and page template (styles and motion keyframes). |

Rebuild with `python3 docs/design-system/build.py`.
