# Asha design exercise

Everything you need to design Asha screens as clickable HTML prototypes, with no backend and only invented data.

| Path | What it is |
|---|---|
| [`EXERCISE.md`](EXERCISE.md) | The exercise. Start here. |
| `docs/design-system/index.html` | Asha's design system: overview and principles, foundations, components (including the calendar). One self-contained file; open it in a browser. |
| `docs/design-system/src/kit.js` | The component library: class recipes (`R`), buttons, menus, the side panel (`Sheet`), the data grid (`Grid`), the `Calendar`, motion. |
| `prototypes/calendar/` | A starter prototype: a full-screen calendar with clickable events. |
| `prototypes/kit-extras.js` | A date picker and typed times ("2pm", "1015"). |
| `.claude/skills/` | Claude Code skills we use for design work: `asha-ui`, `asha-prototype`, `asha-design-experimentation`. |

## Run it

```bash
open docs/design-system/index.html          # the design system

cd prototypes/calendar
python3 build.py                            # rebuild index.html after editing src/
python3 serve.py 18791 .                    # http://127.0.0.1:18791/ ; saves picks to answers.json
```

## Ground rules

- Invent every name and number. Nothing here talks to a real system.
- Draw with the library's own code (kit.js), not hand-made lookalikes.
- Commit your work as you go so we can follow how it evolved.
