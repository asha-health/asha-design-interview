#!/usr/bin/env python3
"""Build the calendar prototype into one self-contained index.html, the way the design system builds its own page:
the library's head (fonts, Tailwind, Lucide, motion styles), then kit.js, ../kit-extras.js (a date picker and typed
times) and this prototype's data and app. The library is read from this repo (docs/design-system), so the build always
draws with the current kit.

Usage:  python3 build.py            (writes index.html next to this file)
Then:   open index.html, or  python3 serve.py 18791 .  to save picks to answers.json
"""
import pathlib

here = pathlib.Path(__file__).resolve().parent
lib = here.parents[1] / "docs/design-system"
tpl = (lib / "src/index.html").read_text()
head = tpl[tpl.index('<link rel="preconnect"'):tpl.index("</head>")]
scripts = [("kit.js", (lib / "src/kit.js").read_text()), ("kit-extras.js (date picker, typed times)", (here.parent / "kit-extras.js").read_text()),
           ("proto-data.js", (here / "src/proto-data.js").read_text()), ("proto-app.js", (here / "src/proto-app.js").read_text())]
parts = []
for name, js in scripts:
    assert "</script" not in js.lower(), f"{name} contains a closing script tag"
    parts.append(f"<script>\n/* ---- {name} ---- */\n{js}\n</script>")
shell = (here / "src/shell.html").read_text().replace("<!--LIBHEAD-->", head)
(here / "index.html").write_text(shell.replace("<!--SCRIPTS-->", "\n".join(parts)))
print(f"built {here / 'index.html'}")
