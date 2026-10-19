#!/usr/bin/env python3
"""Build the appointment-flow prototype into one self-contained index.html, the way the design-system library builds
its own page: the library's head (fonts, Tailwind, Lucide, motion styles), then kit.js, data.js and every block file,
then this prototype's data and app.

The library is read from this repo (docs/design-system), so the build always draws with the current blocks. The blocks
are used unchanged, except that the schedule block also exports its day grid, cards and today's appointment panel as
window.SCHED, so this page can draw the real schedule.

Usage:  python3 build.py            (writes index.html next to this file)
Then:   open index.html, or  python3 serve.py 18792  to save picks to answers.json
"""
import pathlib

here = pathlib.Path(__file__).resolve().parent
lib = here.parents[1] / "docs/design-system"
cats = ["shell", "schedule", "patients", "clinical", "billing", "claims", "revenue", "tasks", "comms", "forms", "settings", "ai", "agents", "agents-today", "states"]

tpl = (lib / "src/index.html").read_text()
head = tpl[tpl.index('<link rel="preconnect"'):tpl.index("</head>")]

blocks = []
for c in cats:
    js = (lib / f"blocks/{c}.js").read_text()
    if c == "schedule":
        assert js.rstrip().endswith("})();"), "the schedule block changed shape; update build.py"
        js = js.rstrip()[:-len("})();")] + (
            "window.SCHED = { dayGrid, schedBar, apptCard, DAY, busyDay, OPS, ST, CHIP, ptName, ptAge, mins, clock, range,"
            " openApptSheet, v4ApptSheet };\n})();\n")
    blocks.append((f"blocks/{c}.js", js))

scripts = [("kit.js", (lib / "src/kit.js").read_text()), ("data.js", (lib / "src/data.js").read_text()), *blocks,
           ("proto-data.js", (here / "src/proto-data.js").read_text()), ("proto-app.js", (here / "src/proto-app.js").read_text())]
parts = []
for name, js in scripts:
    assert "</script" not in js.lower(), f"{name} contains a closing script tag"
    parts.append(f"<script>\n/* ---- {name} ---- */\n{js}\n</script>")
shell = (here / "src/shell.html").read_text().replace("<!--LIBHEAD-->", head)
(here / "index.html").write_text(shell.replace("<!--SCRIPTS-->", "\n".join(parts)))
print(f"built {here / 'index.html'}")
