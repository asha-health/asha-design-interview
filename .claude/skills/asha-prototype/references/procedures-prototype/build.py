#!/usr/bin/env python3
"""Build the procedures prototype into one self-contained index.html, the way the design-system library builds its
own preview: the library's head (fonts, Tailwind, Lucide, motion styles), then kit.js, data.js and the clinical
block's tooth chart, then this prototype's data and app.

The library is read from this repo (docs/design-system), so the build always uses the current blocks. The clinical
block is used unchanged except that its tooth chart is exported (window.CL) and its chart data can be set, so the
teeth draw the prototype's own procedures.

Usage:  python3 build.py [--out DIR]     (default DIR: prototypes/procedures-reference at the repo root)
Then:   cd DIR && python3 <this folder>/serve.py 18791   and open http://localhost:18791/
"""
import pathlib, sys
here = pathlib.Path(__file__).resolve().parent
repo = here.parents[4]
lib = repo / "docs/design-system"
out = pathlib.Path(sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else repo / "prototypes/procedures-reference").expanduser()
out.mkdir(parents=True, exist_ok=True)
tpl = (lib / "src/index.html").read_text()
head = tpl[tpl.index('<link rel="preconnect"'):tpl.index("</head>")]
cl = (lib / "blocks/clinical.js").read_text()
assert cl.count("const CHART = {") == 1 and cl.rstrip().endswith("})();"), "the clinical block changed shape; update build.py"
cl = cl.replace("const CHART = {", "let CHART = {", 1)
cl = cl.rstrip()[:-len("})();")] + "window.CL = { chartSVG, symbolLegend, setChart: (c) => { CHART = c; } };\n})();\n"
scripts = [("kit.js", (lib / "src/kit.js").read_text()), ("data.js", (lib / "src/data.js").read_text()), ("clinical.js (tooth chart)", cl),
           ("proto-data.js", (here / "src/proto-data.js").read_text()), ("proto-app.js", (here / "src/proto-app.js").read_text())]
parts = []
for name, js in scripts:
    assert "</script" not in js.lower(), f"{name} contains a closing script tag"
    parts.append(f"<script>\n/* ---- {name} ---- */\n{js}\n</script>")
shell = (here / "src/shell.html").read_text().replace("<!--LIBHEAD-->", head).replace("<!--LIBSHA-->", "this repo")
(out / "index.html").write_text(shell.replace("<!--SCRIPTS-->", "\n".join(parts)))
print(f"built {out / 'index.html'}")
