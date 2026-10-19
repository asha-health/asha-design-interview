/* Screenshot every block in a category, in every state, and report problems.
 * Usage: node qa/shoot.cjs <category|all> [--page]   (run `python3 build.py` first)
 * Output: qa/out/<category>/<block>--<state>.png and a summary on stdout.
 * Needs the local server on :8797 serving docs/design-system. */
/* Playwright: uses the repo's copy if installed, else PLAYWRIGHT_PATH. Page: BLEND_URL (default: the local
 * experiments server). In the repo: `python3 -m http.server 8797 -d docs/design-system` and
 * BLEND_URL=http://localhost:8797/dev.html node docs/design-system/qa/shoot.cjs all */
const { chromium } = require(process.env.PLAYWRIGHT_PATH || (() => { try { return require.resolve("playwright"); } catch (_) { return (() => { throw new Error("Install Playwright (npm i -D playwright) or set PLAYWRIGHT_PATH"); })(); } })());
const BLEND_URL = process.env.BLEND_URL || "http://localhost:8797/dev.html";
const fs = require("fs"), path = require("path");
const CATS = ["shell", "schedule", "patients", "clinical", "billing", "claims", "revenue", "tasks", "comms", "forms", "settings", "ai", "states"];
(async () => {
  const want = process.argv[2] || "all", fullPage = process.argv.includes("--page");
  const cats = want === "all" ? CATS : [want];
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  let problems = 0;
  for (const cat of cats) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    const errs = [];
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
    page.on("pageerror", (e) => errs.push("pageerror: " + e.message));
    await page.goto(`${BLEND_URL}#/blocks/${cat}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const out = path.join(__dirname, "out", cat); fs.mkdirSync(out, { recursive: true });
    if (fullPage) await page.screenshot({ path: path.join(out, "_page.png"), fullPage: true });
    const ids = await page.$$eval("[data-block]", (els) => els.map((e) => e.dataset.block));
    const lines = [];
    for (const id of ids) {
      const states = await page.$$eval(`[data-state-switch="${id}"] [data-seg]`, (els) => els.map((e) => e.textContent.trim()));
      const list = states.length ? states : ["default"];
      for (let i = 0; i < list.length; i++) {
        if (states.length) { await page.click(`[data-state-switch="${id}"] [data-seg="${i}"]`); await page.waitForTimeout(250); }
        const canvas = page.locator(`[data-canvas="${id}"]`);
        await canvas.scrollIntoViewIfNeeded();
        const slug = list[i].toLowerCase().replace(/[^a-z0-9]+/g, "-");
        await canvas.screenshot({ path: path.join(out, `${id}--${slug}.png`) });
        const info = await canvas.evaluate((el) => {
          const over = []; const box = el.getBoundingClientRect();
          el.querySelectorAll("*").forEach((n) => { const r = n.getBoundingClientRect(); if (r.width && (r.right > box.right + 1 || r.left < box.left - 1) && !n.closest(".g-wrap,[data-scroll-ok],.bulk,.sheet") && getComputedStyle(n).position !== "fixed") over.push((n.className && n.className.baseVal === undefined ? String(n.className).slice(0, 60) : n.tagName)); });
          const failed = el.textContent.includes("failed:");
          const lucideLeft = el.querySelectorAll("i[data-lucide]").length;
          const cut = [...el.querySelectorAll(".g-table th .truncate")].filter((s) => s.scrollWidth > s.clientWidth + 1).map((s) => s.textContent.trim());
          /* Open-sided tables: a lined table must either touch both edges of the surface it sits on (the canvas,
           * a panel, a card, a popover) or have its own left and right border. Lines that stop inside padding fail. */
          const cs = (n) => getComputedStyle(n), bw = (n, side) => parseFloat(cs(n)[`border${side}Width`]) || 0;
          const open = [];
          /* lined blocks: tables with row lines, and lists or boxes drawn with a top and bottom line but no sides */
          const lined = [...el.querySelectorAll("table")].filter((t) => [...t.querySelectorAll("td,th")].some((c) => bw(c, "Bottom") || bw(c, "Top")));
          el.querySelectorAll("div,ul,ol,section,dl").forEach((n) => {
            if (n.closest("table") || !(bw(n, "Top") && bw(n, "Bottom")) || bw(n, "Left") || bw(n, "Right") || n.offsetWidth < 160 || n.offsetHeight < 40) return;
            if (n.querySelector("table") || cs(n).position === "absolute") return;
            lined.push(n);
          });
          lined.forEach((t) => {
            if (!t.getClientRects().length || t.closest("[inert],[aria-hidden='true']")) return;
            let frame = t;
            /* the frame is the widest of the table and its single-child wrappers (a wrapper may pull out through padding) */
            /* its visible left/right: a scroll box around a wide table clips it */
            let { left: fL, right: fR } = t.getBoundingClientRect();
            for (let n = t; n.parentElement && n.parentElement !== el && n.parentElement.children.length === 1; ) { n = n.parentElement; const b = n.getBoundingClientRect();
              if (cs(n).overflowX !== "visible") { fL = Math.max(fL, b.left); fR = Math.min(fR, b.right); }
              if (b.width > frame.getBoundingClientRect().width + 1) frame = n; if (b.left < fL - 1 || b.right > fR + 1) { fL = Math.min(fL, b.left); fR = Math.max(fR, b.right); } }
            let boxed = false, surface = el;
            for (let n = t; n && n !== el; n = n.parentElement) {
              if (bw(n, "Left") && bw(n, "Right")) { if (n === t || frame.contains(n) || n === frame) boxed = true; else { surface = n; break; } }
              else if ((bw(n, "Left") || bw(n, "Right")) && !frame.contains(n) && n !== frame) { surface = n; break; }
              else if (!frame.contains(n) && n !== frame && (cs(n).boxShadow !== "none" || cs(n).overflow === "hidden") && parseFloat(cs(n).borderTopLeftRadius) > 0) { surface = n; break; }
            }
            const row = t.querySelector("tr"), first = row && row.firstElementChild, last = row && row.lastElementChild;
            if (first && bw(first, "Left") && bw(last, "Right")) boxed = true;
            if (boxed) return;
            /* the edges it should meet: the surface's inside edges, or a divider (a tall bordered region such as a
             * sidebar) that runs alongside the table */
            const fb = frame.getBoundingClientRect(), f = { left: fL, right: fR, top: fb.top, bottom: fb.bottom, height: fb.height }, r = surface.getBoundingClientRect();
            let L = r.left + bw(surface, "Left"), R = r.right - bw(surface, "Right");
            surface.querySelectorAll("*").forEach((n) => {
              if (frame.contains(n) || n.contains(frame)) return;
              const b = n.getBoundingClientRect();
              if (b.height < f.height * 0.5 || b.bottom <= f.top || b.top >= f.bottom) return;
              if (bw(n, "Right") && b.right <= f.left + 1) L = Math.max(L, b.right);
              if (bw(n, "Left") && b.left <= f.left + 1) L = Math.max(L, b.left + bw(n, "Left"));
              if (bw(n, "Left") && b.left >= f.right - 1) R = Math.min(R, b.left);
              if (bw(n, "Right") && b.right >= f.right - 1) R = Math.min(R, b.right - bw(n, "Right"));
            });
            const gapL = Math.round(f.left - L), gapR = Math.round(R - f.right);
            if (gapL > 1 || gapR > 1) open.push(`${t.tagName === "TABLE" ? "" : t.tagName.toLowerCase() + " "}${((t.querySelector("th,td") || t).textContent || "").trim().replace(/\s+/g, " ").slice(0, 18) || "table"} ${gapL}px/${gapR}px`);
          });
          /* v4: patchy columns. In a table with 3+ body rows, a named column where some cells are empty and some aren't
           * (an entry row that only holds an Add prompt is skipped). Every row shows a value, or the column goes. */
          const patchy = [];
          if (document.documentElement.classList.contains("v4")) el.querySelectorAll("table").forEach((t) => {
            if (!t.getClientRects().length || t.closest("[inert],[aria-hidden='true'],.opacity-45")) return;
            const rows = [...(t.tBodies[0] || { rows: [] }).rows].filter((tr) => tr.cells.length > 1 && !tr.querySelector("td[colspan]") && !/^(Add|Pick a)/.test(tr.innerText.trim().split("\n").filter(Boolean).slice(-1)[0] || ""));
            if (rows.length < 3 || !t.tHead) return; const heads = [...t.tHead.rows[0].cells].map((h) => h.textContent.trim());
            heads.forEach((h, ci) => { if (!ci || !h) return; const vals = rows.map((r) => r.cells[ci] && (r.cells[ci].innerText.trim() || r.cells[ci].querySelector("svg,input,button,[data-tip]")));
              const empty = vals.filter((v) => !v).length; if (empty && empty < vals.length) patchy.push(`${h} ${empty}/${vals.length} empty`); }); });
          return { h: Math.round(box.height), over: over.slice(0, 3), overCount: over.length, failed, lucideLeft, cut, open, patchy };
        });
        const flags = [];
        if (info.failed) flags.push("RENDER FAILED");
        if (info.overCount) flags.push(`${info.overCount} elements spill past the canvas (${info.over.join(" | ")})`);
        if (info.cut.length) flags.push(`cut-off headers: ${info.cut.join(", ")}`);
        if (info.open.length) flags.push(`open-sided (inset left/right): ${info.open.join(", ")}`);
        if (info.patchy.length) flags.push(`patchy columns: ${info.patchy.join(", ")}`);
        if (info.lucideLeft) flags.push(`${info.lucideLeft} icons not drawn (bad lucide name?)`);
        if (flags.length) problems++;
        lines.push(`${flags.length ? "✗" : "✓"} ${id} [${list[i]}] ${info.h}px ${flags.join("; ")}`);
      }
    }
    console.log(`\n== ${cat}: ${ids.length} blocks`); console.log(lines.join("\n"));
    if (errs.length) { problems += errs.length; console.log("console errors:\n  " + [...new Set(errs)].join("\n  ")); }
    await page.close();
  }
  await browser.close();
  console.log(`\n${problems ? problems + " problem(s)" : "no problems"}`);
})();
