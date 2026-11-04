#!/usr/bin/env python3
"""Assemble the design system. Writes index.html (one self-contained file, for sharing) and dev.html (script tags,
for editing)."""
import pathlib, time
here = pathlib.Path(__file__).parent
files = ["src/kit.js", "src/app.js"]
tpl = (here / "src/index.html").read_text()
v = int(time.time())
(here / "dev.html").write_text(tpl.replace("<!--SCRIPTS-->", "\n".join(f'<script src="{f}?v={v}"></script>' for f in files)))
parts = []
for f in files:
    js = (here / f).read_text()
    assert "</script" not in js.lower(), f"{f} contains a closing script tag"
    parts.append(f"<script>\n/* ---- {f} ---- */\n{js}\n</script>")
(here / "index.html").write_text(tpl.replace("<!--SCRIPTS-->", "\n".join(parts)))
print("built", len(files), "files")
