# Asha design exercise

Asha is practice-management software for dental offices: the schedule, patient charts, billing, insurance claims and
the front desk's day. This repo has everything you need to design Asha screens as clickable HTML prototypes, with no
backend and only invented data.

## What's here

| Path | What it is |
|---|---|
| [`EXERCISE.md`](EXERCISE.md) | The exercise. Start here. |
| `docs/design-system/index.html` | Asha's design system: foundations, components and 93 blocks of real Asha screens. Open it in a browser (one self-contained file). |
| `docs/design-system/src/kit.js` | The component library: class recipes (`R`), buttons, menus, the side panel (`Sheet`), the data grid (`Grid`), motion. |
| `docs/design-system/src/data.js` | The shared invented practice: patients, providers, chairs, payers, CDT codes. |
| `docs/design-system/blocks/*.js` | The blocks, one file per area (schedule, patients, clinical, billing, claims, ...). |
| `docs/design-system/BLOCKS-GUIDE.md`, `INVENTORY.md` | How blocks are built, and the real labels and statuses each screen uses. |
| `docs/design-system/ux-principles/README.md` | How we decide what goes on a screen. |
| `prototypes/appointment-flow/` | A starter prototype: the day schedule, clickable appointments, invented check-in and check-out data. |
| `.claude/skills/` | Claude Code skills we use for design work: `asha-ui`, `asha-prototype`, `asha-design-experimentation`. |

## Run it

Python 3 is all you need; the pages load Tailwind, Inter and Lucide from public CDNs.

```bash
open docs/design-system/index.html                    # the design system (or just double-click it)

cd prototypes/appointment-flow
python3 build.py                                      # rebuild index.html after editing src/
python3 serve.py 18791 .                              # http://127.0.0.1:18791/ ; saves picks to answers.json
```

The worked example of a full prototype (question panel, step-by-step walkthroughs, saved picks) lives in the
`asha-prototype` skill:

```bash
python3 .claude/skills/asha-prototype/references/procedures-prototype/build.py
python3 .claude/skills/asha-prototype/references/procedures-prototype/serve.py 18790 prototypes/procedures-reference
```

## Ground rules

- Invent every name and number. Nothing here talks to a real system.
- Draw with the library's own code (kit.js and the blocks), not hand-made lookalikes.
- Commit your work as you go so we can follow how it evolved.
