#!/usr/bin/env python3
"""Assemble the design blend. Writes blend/dev.html (script tags, for editing) and
../design-system-blend.html (one self-contained file, for sharing)."""
import pathlib, time
here = pathlib.Path(__file__).parent
cats = ["shell", "schedule", "patients", "clinical", "billing", "claims", "revenue", "tasks", "comms", "forms", "settings", "ai", "agents", "agents-today", "states"]
files = ["src/kit.js", "src/data.js", "src/categories.js"] + [f"blocks/{c}.js" for c in cats] + ["src/app.js"]
tpl = (here / "src/index.html").read_text()
v = int(time.time())
(here / "dev.html").write_text(tpl.replace("<!--SCRIPTS-->", "\n".join(f'<script src="{f}?v={v}"></script>' for f in files)))
parts = []
for f in files:
    js = (here / f).read_text()
    assert "</script" not in js.lower(), f"{f} contains a closing script tag"
    parts.append(f"<script>\n/* ---- {f} ---- */\n{js}\n</script>")
# In the experiments folder the shared file sits one level up; in the repo it is index.html next to this script.
out = here.parent / "design-system-blend.html" if here.parent.name == "settings-overhaul" else here / "index.html"
out.write_text(tpl.replace("<!--SCRIPTS-->", "\n".join(parts)))
print("built", len(files), "files")
