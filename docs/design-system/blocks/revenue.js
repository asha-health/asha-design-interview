/* Revenue intelligence blocks. Sources: routes/practice/revenuereports (RevenueReportsLayout nav, ProductionCollections,
 * ARAging, ProviderScorecard, GoalSettings, DailyHuddle) and routes/practice/reporting (Reports). RI colour rule:
 * dark numbers, grey captions, blue bars only, no green/red values, flags are an orange icon + grey text. */
(() => {

/* ============================================================ numbers (one source, so every block agrees) */
const c2 = (n) => Math.round(n * 100) / 100;
const rnd = (key) => { let h = hash(key); h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h = Math.imul(h ^ (h >>> 16), 0x45d9f3b); h ^= h >>> 16; return ((h >>> 0) % 1000) / 1000; };
/* Grid totals row stays in view while the rows scroll (scoped to this file's grids) */
if (!document.getElementById("ri-grid-style")) { const st = document.createElement("style"); st.id = "ri-grid-style";
  st.textContent = "[data-ri] .g-table tfoot td{position:sticky;bottom:0;z-index:2;background:#fff;box-shadow:inset 0 1px 0 rgb(229 231 235 / .8)}[data-ri] .g-table tfoot td.g-sticky{z-index:4}"; document.head.appendChild(st); }
const HOLIDAYS = ["2026-01-01", "2026-01-19", "2026-02-16", "2026-05-25", "2026-07-03", "2026-09-07"];
const iso = (y, m, d) => `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/* Working days of a month (Mon–Fri, office holidays closed), up to an optional last day */
function workDays(m, upTo = 31) {
  const out = [];
  for (let d = 1; d <= upTo; d++) { const dt = new Date(Date.UTC(2026, m - 1, d)); if (dt.getUTCMonth() !== m - 1) break;
    const w = dt.getUTCDay(), s = iso(2026, m, d); if (w > 0 && w < 6 && !HOLIDAYS.includes(s)) out.push(s); }
  return out;
}
const dayLabel = (s) => `${DOW[new Date(s + "T12:00:00Z").getUTCDay()]}, ${fmtDate(s)}`;
/* One office day of production and collections. Today is only part done (it's late morning). */
function dayRow(s) {
  const sched = Math.round((10400 + rnd(s + "s") * 3600) / 5) * 5;
  const gross = s === TODAY ? Math.round(sched * 0.58) : Math.round(sched * (0.9 + rnd(s + "g") * 0.1));
  const adj = -Math.round(gross * (0.18 + rnd(s + "a") * 0.06));
  const net = gross + adj;
  const ins = Math.round(net * (0.56 + rnd(s + "i") * 0.1)), pt = Math.round(net * (0.29 + rnd(s + "p") * 0.08));
  return { id: s, label: dayLabel(s), sort: s, sched, gross, adj, net, ins, pt, coll: ins + pt };
}
const sumRows = (rows, id, label) => {
  const t = { id, label, sort: id, sched: 0, gross: 0, adj: 0, net: 0, ins: 0, pt: 0, coll: 0 };
  rows.forEach((r) => ["sched", "gross", "adj", "net", "ins", "pt", "coll"].forEach((k) => (t[k] = c2(t[k] + r[k]))));
  return t;
};
const monthRows = (m, upTo) => workDays(m, upTo).map(dayRow);
const monthTotal = (m) => sumRows(monthRows(m, m === 9 ? 25 : 31), iso(2026, m, 1), m === 9 ? "Sep 2026 (to date)" : `${MONTHS[m - 1]} 2026`);
/* Monthly gross production goals (the Goals page owns these) */
const GOALS = [225000, 225000, 240000, 240000, 240000, 245000, 230000, 245000, 245000, 250000, 235000, 210000];
const PERIODS = ["Today", "This week", "This month", "Last month", "YTD", "Custom"];
function periodRows(i) {
  if (i === 0) return [dayRow(TODAY)];
  if (i === 1) return workDays(9).filter((s) => s >= "2026-09-21" && s <= TODAY).map(dayRow);
  if (i === 2) return monthRows(9, 25);
  if (i === 3) return monthRows(8);
  if (i === 4) return Array.from({ length: 9 }, (_, k) => monthTotal(k + 1));
  return workDays(9).filter((s) => s >= "2026-09-14" && s <= TODAY).map(dayRow);
}
/* The same stretch one period earlier, for the grey "vs" line */
function priorRows(i) {
  if (i === 0) return [dayRow("2026-09-18")];
  if (i === 1) return workDays(9).filter((s) => s >= "2026-09-14" && s <= "2026-09-18").map(dayRow);
  if (i === 2) return monthRows(8, 25);
  if (i === 3) return monthRows(7);
  if (i === 5) return workDays(9).filter((s) => s < "2026-09-14").concat(workDays(8).filter((s) => s >= "2026-08-31")).map(dayRow);
  return null;
}
const PRIOR_LABEL = ["last Friday", "last week", "Aug 1–25", "July", "", "the 2 weeks before"];
const PERIOD_SPAN = ["Fri, Sep 25", "Sep 21–25", "Sep 1–25", "Aug 1–31", "Jan 1 – Sep 25", "Sep 14–25"];
function periodGoal(i, rows) {
  const perDay = (m) => GOALS[m - 1] / workDays(m).length;
  if (i === 2) return GOALS[8];
  if (i === 3) return GOALS[7];
  if (i === 4) return GOALS.slice(0, 8).reduce((a, b) => a + b, 0) + perDay(9) * workDays(9, 25).length;
  return Math.round(rows.reduce((a, r) => a + perDay(+r.id.slice(5, 7)), 0));
}
const whole = (n) => money(n, { cents: false });
const pct = (n, d = 1) => `${(n * 100).toFixed(d)}%`;
const change = (a, b) => { if (!b) return ""; const p = ((a - b) / Math.abs(b)) * 100; return `${p >= 0 ? "+" : "−"}${Math.abs(p).toFixed(1)}%`; };

/* ============================================================ local helpers */
/* The dates control on the one-line bar: a button showing the current range, and its menu of ranges.
 * attr names the data attribute each item carries (the RiGrid uses data-act="period"). */
const periodPicker = (periods, on, open, { label, item = 'data-act="period"', toggle = 'data-act="periodmenu"', menuAttr = "" } = {}) => `<div class="relative shrink-0" ${menuAttr}>
  ${button(label || periods[on], { v: "white", s: "sm", icon: "calendar", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400", attrs: `${toggle} aria-haspopup="menu" aria-expanded="${open}"` })}
  ${open ? `<div class="absolute start-0 top-full mt-1 z-30 ${R.menu} !w-52" role="menu"><p class="${R.menuLabel}">Dates</p>${periods.map((p, i) => `<button type="button" role="menuitemradio" aria-checked="${i === on}" class="${R.menuItem}" ${item} data-i="${i}">${p}${i === on ? I("check", "ms-auto !text-blue-600") : ""}</button>`).join("")}</div>` : ""}</div>`;
/* The RI one-line table bar (search · dates · Sort · chips · square + · ⋯), on the kit Grid.
 * Extra options: periods (labels), period (index), onPeriod(i, grid), searchW, sortable:false per column. */
class RiGrid extends Grid {
  /* v2: one toolbar anatomy for every list page here (Revenue, Reports, Tasks, Lists):
   * search · dates · one sort chip · filter chips · + · spacer · extras · ⋯. Every control is 32px.
   * The sort chip is the sort control: "Sort" when nothing is set, "Sorted by Age ↓" when something is; it opens the
   * sort menu, and its × (back to the view's default) shows only when the sort differs from the default.
   * Options: dates (static html for the dates slot), sortMenu: false (fixed order), more: false (no ⋯). */
  v2Toolbar() {
    const o = this.o, chips = [];
    for (const f of o.filters) { const v = this.filters[f.key]; if (v == null) continue; const opt = f.options.find((x) => x.value === v);
      chips.push(condChip(f.label, "is", `${esc(opt ? opt.label : v)}`, `data-act="clear-filter" data-key="${f.key}"`, `Remove ${esc(f.label)} filter`, this.chipClass(`f:${f.key}=${v}`))); }
    const fMenu = this.menu === "filter" ? `<div class="absolute start-0 top-full mt-1 z-30 ${R.menu}" role="menu">${o.filters.map((f) => `<p class="${R.menuLabel}">${f.label} is…</p>${f.options.map((x) => `<button type="button" role="menuitem" class="${R.menuItem}" data-act="pick-filter" data-key="${f.key}" data-v="${esc(x.value)}">${x.tone ? `<span class="${cx(R.dot, TONE_DOT[x.tone])}"></span>` : ""}${esc(x.label)}${this.filters[f.key] === x.value ? I("check", "ms-auto !text-blue-600") : ""}</button>`).join("")}`).join(`<div class="${R.menuSep}"></div>`)}</div>` : "";
    const sMenu = this.menu === "sort" ? `<div class="absolute start-0 top-full mt-1 z-30 ${R.menu}" role="menu"><p class="${R.menuLabel}">Sort by</p>${this.cols.filter((c) => c.sortable !== false).map((c) => `<button type="button" role="menuitem" class="${R.menuItem}" data-act="pick-sort" data-key="${c.key}">${c.icon ? I(c.icon) : ""}${c.label}${this.sort && this.sort.key === c.key ? I(this.sort.dir > 0 ? "arrow-up" : "arrow-down", "ms-auto !text-blue-600") : ""}</button>`).join("")}</div>` : "";
    const isDefault = JSON.stringify(this.sort) === JSON.stringify(this.baseline.sort), col = this.sort && this.cols.find((c) => c.key === this.sort.key);
    const sortCtl = o.sortMenu === false ? "" : `<div class="relative shrink-0" data-menu="${this.instance}">${col
      ? `<span class="${R.chip}" role="group" aria-label="Sort"${chg("One sort control: the chip says what the list is sorted by and opens the sort menu. The × only shows once you change the view's usual sort.")}><button type="button" class="${R.chipBody}" data-act="sortmenu" aria-haspopup="menu" aria-expanded="${this.menu === "sort"}"><span class="${R.chipField}">Sorted by</span><span class="${R.chipValue}">${col.label} ${I(this.sort.dir > 0 ? "arrow-up" : "arrow-down", "size-3.5")}</span></button>${isDefault ? "" : `<button type="button" class="${R.chipX}" data-act="reset-sort" aria-label="Back to the usual sort">${I("x")}</button>`}</span>`
      : button("Sort", { v: "quiet", s: "sm", icon: "arrow-up-down", attrs: `data-act="sortmenu" aria-haspopup="menu" aria-expanded="${this.menu === "sort"}"` })}${sMenu}</div>`;
    const periods = o.periods ? periodPicker(o.periods, o.period, this.menu === "period", { label: o.periodLabel && o.periodLabel(o.period), menuAttr: `data-menu="${this.instance}"` }) : o.dates || "";
    return `<div class="flex items-center gap-2 py-2.5 flex-nowrap min-w-0">
      ${o.search === false ? "" : searchBox(o.searchPlaceholder, { w: o.searchW || "w-44", value: this.q, attrs: 'data-role="search"' })}
      ${o.lead || ""}${periods}${sortCtl}
      ${chips.length ? `<div class="flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none]">${chips.join("")}</div>` : ""}
      ${o.filters.length ? `<div class="relative shrink-0" data-menu="${this.instance}">${iconButton("plus", "Add filter", { v: "white", s: "iconSm", attrs: `data-act="filter" aria-haspopup="menu" aria-expanded="${this.menu === "filter"}"` })}${fMenu}</div>` : ""}
      <div class="ms-auto flex shrink-0 items-center gap-1.5">
        ${this.dirty() ? button("Discard", { v: "quiet", s: "sm", attrs: 'data-act="discard"' }) + button("Save view", { v: "soft", s: "sm", attrs: 'data-act="save"' }) + '<span class="h-5 mx-1 border-s border-gray-200/80"></span>' : ""}
        ${o.toolbarExtra || ""}${o.more === false ? "" : iconButton("ellipsis", "More: columns, saved views, export", { s: "iconSm" })}</div>
    </div>`;
  }
  /* v2 totals row: values written like the cells (each column's fmt), the label after the value in grey; when every
   * total is a sum, "Total" is written once in the first cell and the values stand alone, like a ledger. */
  calcValue(c, rows) {
    if (!V2) return super.calcValue(c, rows);
    const m = this.calc[c.key]; if (!m) return null;
    const vals = rows.map((r) => this.val(r, c)), nums = vals.map((v) => +v || 0);
    const f = c.fmt || (c.kind === "money" ? (v) => money(v) : (v) => (Number.isInteger(v) ? v.toLocaleString("en-US") : (+v).toFixed(1)));
    const filled = vals.filter((v) => (Array.isArray(v) ? v.length : v !== "" && v != null)).length;
    if ((m === "sum" || m === "avg") && !filled) return "<span></span>"; // nothing entered yet: no "$0" total
    let v;
    if (m === "sum") v = f(c2(nums.reduce((a, b) => a + b, 0)));
    else if (m === "avg") v = rows.length ? f(nums.reduce((a, b) => a + b, 0) / rows.length) : "–";
    else if (m === "min") v = rows.length ? f(Math.min(...nums)) : "–";
    else if (m === "max") v = rows.length ? f(Math.max(...nums)) : "–";
    else if (m === "filled") v = filled;
    else if (m === "empty") v = rows.length - filled;
    else { const s = vals.filter(Boolean).sort(); v = s.length ? fmtDate(m === "latest" ? s[s.length - 1] : s[0]) : "–"; }
    return this.v2AllSums() ? `<span class="font-medium text-gray-800 tabular-nums">${v}</span>` : `<span class="font-medium text-gray-700 tabular-nums">${v}</span> <span class="text-gray-400">${CALC_LABEL[m].toLowerCase()}</span>`;
  }
  v2AllSums() { const m = Object.values(this.calc).filter(Boolean); return m.length && m.every((x) => x === "sum"); }
  render() {
    super.render();
    if (!V2 || this.o.foot || !this.v2AllSums()) return;
    const td = this.root.querySelector("tfoot .g-foot > td:first-child"); if (!td) return;
    /* the count follows "Total" only when it fits the first column */
    const count = `${this.visible.length} ${this.o.noun}`, w = this.colWidth(this.cols[0], 0); Grid._ctx.font = "400 13px Inter, ui-sans-serif, system-ui, sans-serif";
    const fits = Grid._ctx.measureText(`Total · ${count}`).width + 36 <= w;
    td.innerHTML = `<span${fits ? "" : ` title="${esc(count)}"`}${chg("The totals row reads like a ledger: “Total” once, then plain amounts written the same way as the cells (no “Sum” on every column, no cents the cells don't show).")}><span class="font-medium text-gray-800">Total</span>${fits ? ` <span class="text-gray-400">· ${esc(count)}</span>` : ""}</span>`;
  }
  toolbar() {
    if (V2) return this.v2Toolbar();
    const o = this.o, chips = [];
    for (const f of o.filters) { const v = this.filters[f.key]; if (v == null) continue; const opt = f.options.find((x) => x.value === v);
      chips.push(`${condChip(f.label, "is", `${esc(opt ? opt.label : v)}`, `data-act="clear-filter" data-key="${f.key}"`, `Remove ${esc(f.label)} filter`)}`); }
    if (this.sort) { const col = this.cols.find((c) => c.key === this.sort.key);
      chips.push(`${condChip("Sorted by", "", `${col.label} ${I(this.sort.dir > 0 ? "arrow-up" : "arrow-down", "size-3.5")}`, `data-act="clear-sort"`, `Remove sort`)}`); }
    const fMenu = this.menu === "filter" ? `<div class="absolute end-0 top-full mt-1 z-30 ${R.menu}" role="menu">${o.filters.map((f) => `<p class="${R.menuLabel}">${f.label} is…</p>${f.options.map((x) => `<button type="button" role="menuitem" class="${R.menuItem}" data-act="pick-filter" data-key="${f.key}" data-v="${esc(x.value)}">${x.tone ? `<span class="${cx(R.dot, TONE_DOT[x.tone])}"></span>` : ""}${esc(x.label)}${this.filters[f.key] === x.value ? I("check", "ms-auto !text-blue-600") : ""}</button>`).join("")}`).join(`<div class="${R.menuSep}"></div>`)}</div>` : "";
    const sMenu = this.menu === "sort" ? `<div class="absolute end-0 top-full mt-1 z-30 ${R.menu}" role="menu"><p class="${R.menuLabel}">Sort by</p>${this.cols.filter((c) => c.sortable !== false).map((c) => `<button type="button" role="menuitem" class="${R.menuItem}" data-act="pick-sort" data-key="${c.key}">${c.icon ? I(c.icon) : ""}${c.label}${this.sort && this.sort.key === c.key ? I(this.sort.dir > 0 ? "arrow-up" : "arrow-down", "ms-auto !text-blue-600") : ""}</button>`).join("")}</div>` : "";
    const periods = o.periods ? periodPicker(o.periods, o.period, this.menu === "period", { label: o.periodLabel && o.periodLabel(o.period), menuAttr: `data-menu="${this.instance}"` }) : "";
    return `<div class="flex items-center gap-2 py-2.5 flex-nowrap min-w-0">
      ${o.search === false ? "" : searchBox(o.searchPlaceholder, { w: o.searchW || "w-44", value: this.q, attrs: 'data-role="search"' })}
      ${o.lead || ""}${periods}
      <div class="relative shrink-0" data-menu="${this.instance}">${button("Sort", { v: "quiet", s: "xs", icon: "arrow-up-down", attrs: `data-act="sortmenu" aria-haspopup="menu" aria-expanded="${this.menu === "sort"}"` })}${sMenu}</div>
      ${chips.length ? `<div class="flex min-w-0 items-center gap-2 overflow-x-auto [scrollbar-width:none]">${chips.join("")}</div>` : ""}
      ${o.filters.length ? `<div class="relative shrink-0" data-menu="${this.instance}">${iconButton("plus", "Add filter", { v: "white", s: "iconXs", attrs: `data-act="filter" aria-haspopup="menu" aria-expanded="${this.menu === "filter"}"` })}${fMenu}</div>` : ""}
      <div class="ms-auto flex shrink-0 items-center gap-1.5">${o.toolbarExtra || ""}${iconButton("ellipsis", "More: columns, saved views, export", { s: "iconSm" })}</div>
    </div>`;
  }
  onClick(e) {
    const t = e.target.closest("[data-act]"), act = t && this.root.contains(t) && t.dataset.act;
    if (act === "filter") { this.menu = this.menu === "filter" ? false : "filter"; return this.render(); }
    if (act === "sortmenu") { this.menu = this.menu === "sort" ? false : "sort"; return this.render(); }
    if (act === "pick-sort") { const k = t.dataset.key, c = this.cols.find((x) => x.key === k);
      this.sort = this.sort && this.sort.key === k ? { key: k, dir: -this.sort.dir } : { key: k, dir: c.num ? -1 : 1 }; this.menu = false; return this.render(); }
    if (act === "periodmenu") { this.menu = this.menu === "period" ? false : "period"; return this.render(); }
    if (act === "period") { this.o.period = +t.dataset.i; this.menu = false; if (this.o.onPeriod) this.o.onPeriod(this.o.period, this); return this.render(); }
    if (act === "reset-sort") { this.sort = this.baseline.sort && { ...this.baseline.sort }; return this.render(); }
    return super.onClick(e);
  }
}
/* v2: the Tasks and Lists pages (blocks/tasks.js) use the same toolbar; the coordinator can move it into the kit Grid */
if (V2) window.v2RiGrid = RiGrid;
/* v2 page frame: one 16px page edge and one 232px side menu on every Revenue, Reports, Tasks and Lists page */
const PG = V2 ? 16 : 24, PX = V2 ? "px-4" : "px-6", NAV_W = V2 ? 232 : 236;
const FRAME_NOTE = "One 16px page edge and one 232px side menu on every Revenue, Reports, Tasks and Lists page, so the content doesn't jump when you switch pages.";
/* v2 hover-only row actions and goal placeholders (scoped to this file's blocks) */
if (V2 && !document.getElementById("ri-v2-style")) { const st = document.createElement("style"); st.id = "ri-v2-style";
  st.textContent = "[data-hd-grid] tr.g-row{cursor:pointer}[data-hd-grid] .hd-act{opacity:0;transition:opacity .12s}[data-hd-grid] tr.g-row:hover .hd-act,[data-hd-grid] tr.g-row:focus-within .hd-act,[data-hd-grid] td[data-active='1'] .hd-act,[data-hd-grid] tr[data-open='1'] .hd-act{opacity:1}"
    + "[data-goals] .gl-ph{opacity:0}[data-goals] td:hover .gl-ph,[data-goals] td[data-active='1'] .gl-ph{opacity:1}"; document.head.appendChild(st); }
/* An (i) after a page title: the description shows on hover and focus instead of taking a line */
const infoTip = (text, note) => `<button type="button" class="ms-1 inline-flex size-5 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 align-middle" data-tip="${esc(text)}" aria-label="${esc(text)}"${chg(note)}>${I("info", "size-3.5")}</button>`;

/* One alert row in its own panel section (round-2 rule: alerts are plain rows) */
const alertSec = (title, text) => psec(title, `<div class="-my-1.5">${infoRow("circle-alert", text, { tone: "needs" })}</div>`);

/* A metric strip that wraps onto more rows (kit metricStrip is one row) */
const metricGrid = (items, cols = 4) => V2
  /* v2: every row's first cell is padded the same, and the last row has no line of its own (the box draws it) */
  ? `<div class="grid border-t border-gray-200/80" style="grid-template-columns:repeat(${cols},minmax(0,1fr))"${chg("Every row of numbers starts at the same left edge (the second row used to sit 20px further left), and the bottom line isn't doubled.")}>${items.map((m, i) => `<div class="py-4 px-5 ${i < items.length - ((items.length % cols) || cols) ? "border-b border-gray-200/80" : ""} ${(i + 1) % cols ? "border-e border-gray-200/80" : ""}">${metric(...m)}</div>`).join("")}</div>`
  : `<div class="grid border-t border-gray-200/80" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${items.map((m, i) => `<div class="py-4 px-5 border-b border-gray-200/80 ${i % cols ? "" : "!ps-0"} ${(i + 1) % cols ? "border-e" : ""}">${metric(...m)}</div>`).join("")}</div>`;

/* Nice axis steps for charts */
const niceMax = (v) => { const p = Math.pow(10, Math.floor(Math.log10(v))); return [1, 1.2, 1.6, 2, 2.4, 3.2, 4, 4.8, 6, 8, 10].find((n) => n * p >= v) * p; };
const kFmt = (v) => (v >= 1000000 ? `$${+(v / 1000000).toFixed(2)}M` : v >= 1000 ? `$${+(v / 1000).toFixed(1)}k` : `$${Math.round(v)}`);
/* Bars plus a line plus a dashed goal, drawn to the kit's Chart look (blue only, grey ticks) */
function comboChart({ bars, line, labels, goal, goals, w = 760, h = 220, barName = "Gross production", lineName = "Net collections", fmt = kFmt, every = 1 }) {
  const pad = { l: 44, r: 12, t: 14, b: 24 }, n = bars.length;
  const top = niceMax(Math.max(...bars, ...line, goal || 0, ...(goals || [])) * 1.08);
  const iw = w - pad.l - pad.r, ih = h - pad.t - pad.b, slot = iw / n, bw = Math.min(34, slot * 0.58);
  const y = (v) => pad.t + ih - (v / top) * ih, cxp = (i) => pad.l + slot * i + slot / 2;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => top * f).map((t) => `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y(t)}" y2="${y(t)}" stroke="#E5E7EB" stroke-width="1"/><text x="${pad.l - 8}" y="${y(t) + 3}" text-anchor="end" font-size="${V2 ? AXIS_PX : 10}" fill="${V2 ? AXIS_INK : "#99A1AF"}">${fmt(t)}</text>`).join("");
  const rects = bars.map((v, i) => `<rect x="${cxp(i) - bw / 2}" y="${y(v)}" width="${bw}" height="${Math.max(1, pad.t + ih - y(v))}" rx="3" fill="#BEDBFF"><title>${esc(labels[i])} · ${barName} ${money(v, { cents: false })}</title></rect>`).join("");
  const d = line.map((v, i) => `${i ? "L" : "M"}${cxp(i).toFixed(1)},${y(v).toFixed(1)}`).join("");
  const dots = line.map((v, i) => `<circle cx="${cxp(i)}" cy="${y(v)}" r="${n > 12 ? 2 : 3}" fill="#fff" stroke="#155DFC" stroke-width="1.75"><title>${esc(labels[i])} · ${lineName} ${money(v, { cents: false })}</title></circle>`).join("");
  const gs = goals ? goals.map((v, i) => `<line x1="${cxp(i) - slot * 0.4}" x2="${cxp(i) + slot * 0.4}" y1="${y(v)}" y2="${y(v)}" stroke="#1447E6" stroke-dasharray="4 3" stroke-width="1.25"><title>${esc(labels[i])} goal ${money(v, { cents: false })}</title></line>`).join("") : "";
  const g = goal ? `<line x1="${pad.l}" x2="${w - pad.r}" y1="${y(goal)}" y2="${y(goal)}" stroke="#1447E6" stroke-dasharray="4 3" stroke-width="1.25"/><text x="${w - pad.r}" y="${y(goal) - 5}" text-anchor="end" font-size="${V2 ? AXIS_PX : 10}" fill="#1447E6">Goal ${fmt(goal)}</text>` : "";
  const lab = labels.map((l, i) => (i % every === 0 ? `<text x="${cxp(i)}" y="${h - 7}" text-anchor="middle" font-size="${V2 ? AXIS_PX : 10}" fill="#6A7282">${esc(l)}</text>` : "")).join("");
  return `<svg viewBox="0 0 ${w} ${h}" class="w-full h-auto" role="img" aria-label="${barName} and ${lineName}">${ticks}${rects}${g}${gs}<path d="${d}" fill="none" stroke="#155DFC" stroke-width="2" stroke-linejoin="round"/>${dots}${lab}</svg>`;
}
const legend = (items) => `<div class="flex flex-wrap items-center gap-x-4 gap-y-1">${items.map(([kind, label]) => `<span class="inline-flex items-center gap-x-1.5 text-xs text-gray-600">${kind === "bar" ? '<span class="size-2.5 rounded-sm bg-blue-200"></span>' : kind === "line" ? '<span class="w-3.5 h-0.5 rounded-full bg-blue-600"></span>' : '<span class="w-3.5 border-t border-dashed border-blue-700"></span>'}${label}</span>`).join("")}</div>`;

/* The grey Revenue Intelligence menu (RevenueReportsLayout) */
const RI_NAV = [["Financial", [["layout-dashboard", "Daily Huddle"], ["receipt", "Daily Reconciliation"], ["activity", "RCM Activity"], ["trending-up", "Production & Collections"], ["wallet", "Collections Summary"], ["circle-minus", "Adjustments"], ["chart-column", "A/R Aging"]]],
  ["Clinical", [["circle-check-big", "Case Acceptance"], ["heart-pulse", "Hygiene Metrics"]]], ["Operations", [["users", "Patient Flow"], ["calendar-check", "Scheduling"], ["user-cog", "Provider Scorecard"]]], ["Settings", [["target", "Goals"]]]];
const riNav = (active) => `<nav class="h-full border-e border-gray-200/80 bg-white p-3"${chg(FRAME_NOTE)} aria-label="Revenue reports">${RI_NAV.map(([g, items], gi) => `<p class="${R.navGroup} ${gi ? "" : "!pt-1"}">${g}</p>${items.map(([ic, l]) => `<a class="${l === active ? R.navItemOn : R.navItem}" ${l === active ? 'aria-current="page"' : ""}>${I(ic)}<span class="truncate">${l}</span></a>`).join("")}`).join("")}</nav>`;
const riActions = () => `${button("Download", { v: "quiet", s: "sm", icon: "download" })}${iconButton("printer", "Print", { s: "iconSm" })}${iconButton("ellipsis", "More", { s: "iconSm" })}`;

/* ============================================================ 1. Production & Collections page */
function pcStrip(i) {
  const rows = periodRows(i), t = sumRows(rows), prior = priorRows(i), p = prior && sumRows(prior), goal = periodGoal(i, rows);
  const vs = (a, b) => (p ? `${change(a, b)} vs ${PRIOR_LABEL[i]}` : PERIOD_SPAN[i]);
  return metricStrip([
    ["Gross production", whole(t.gross), { goal: (t.gross / goal) * 100, sub: `${Math.round((t.gross / goal) * 100)}% of ${whole(goal)} goal` }],
    ["Net production", whole(t.net), { sub: `After ${whole(-t.adj)} adjustments` }],
    ["Net collections", whole(t.coll), { sub: vs(t.coll, p && p.coll) }],
    ["Collection rate", pct(t.coll / t.net), { sub: "of net production" }]
  ], "!border-t-0", V2 ? { gutter: PG } : {});
}
const pcCols = (byMonth) => [
  { key: "label", label: byMonth ? "Month" : "Day", icon: "calendar", w: 168, kind: "text", value: (r) => r.sort, render: (r) => `<span class="font-medium">${esc(r.label)}</span>` },
  { key: "sched", label: "Scheduled", w: 124, num: true, kind: "money", render: (r) => `<span class="text-gray-500">${money(r.sched)}</span>` },
  { key: "gross", label: "Gross production", w: 150, num: true, kind: "money", render: (r) => money(r.gross) },
  { key: "adj", label: "Adjustments", w: 128, num: true, kind: "money", render: (r) => money(r.adj) },
  { key: "net", label: "Net production", w: 150, num: true, kind: "money", render: (r) => `<span class="font-medium">${money(r.net)}</span>` },
  { key: "ins", label: "Insurance coll.", w: 140, num: true, kind: "money", render: (r) => money(r.ins) },
  { key: "pt", label: "Patient coll.", w: 128, num: true, kind: "money", render: (r) => money(r.pt) },
  { key: "coll", label: "Net collections", w: 144, num: true, kind: "money", render: (r) => `<span class="font-medium">${money(r.coll)}</span>` },
  { key: "rate", label: "Collection rate", w: 132, num: true, kind: "num", value: (r) => c2((r.coll / r.net) * 100), render: (r) => pct(r.coll / r.net) }
];
/* v2: what a dentist asks first ("what did we collect?") comes before the detail columns; whole dollars like the strip */
const pcColsV2 = (byMonth) => [
  { key: "label", label: byMonth ? "Month" : "Day", icon: "calendar", w: 132, kind: "text", value: (r) => r.sort, render: (r) => `<span class="font-medium">${esc(r.label)}</span>` },
  { key: "gross", label: "Gross production", w: 112, num: true, kind: "money", fmt: whole, render: (r) => whole(r.gross) },
  { key: "adj", label: "Adjustments", w: 112, num: true, kind: "money", fmt: whole, render: (r) => whole(r.adj) },
  { key: "net", label: "Net production", w: 112, num: true, kind: "money", fmt: whole, render: (r) => `<span class="font-medium">${whole(r.net)}</span>` },
  { key: "coll", label: `<span${chg("Net collections and Collection rate come right after production, so “what did we collect?” is on screen without scrolling sideways. Amounts are whole dollars, like the strip.")}>Net collections</span>`, w: 112, num: true, kind: "money", fmt: whole, render: (r) => `<span class="font-medium">${whole(r.coll)}</span>` },
  { key: "rate", label: "Collection rate", w: 112, num: true, kind: "num", value: (r) => c2((r.coll / r.net) * 100), render: (r) => pct(r.coll / r.net) },
  { key: "sched", label: "Scheduled", w: 112, num: true, kind: "money", fmt: whole, render: (r) => `<span class="text-gray-500">${whole(r.sched)}</span>` },
  { key: "ins", label: "Insurance coll.", w: 112, num: true, kind: "money", fmt: whole, render: (r) => whole(r.ins) },
  { key: "pt", label: "Patient coll.", w: 112, num: true, kind: "money", fmt: whole, render: (r) => whole(r.pt) }
];
const pcLabel = (i) => `${PERIODS[i]} <span class="font-normal text-gray-500">${PERIOD_SPAN[i]}</span>`;
const DOW_FILTER = [{ key: "dow", label: "Day of week", options: ["Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => ({ value: d, label: d })), match: (r, v) => r.label.startsWith(v) }];
/* v2: one chart region, the same on the Charts tab and in the chart block: title and dates left, legend right, the
 * chart, then a grey footnote */
function v2ChartRegion(rows, byMonth, span, { w = 520, h = 250, every = 1, note = "", controls = "", title = `<p class="${R.groupTitle}">Production and collections</p>` } = {}) {
  const labels = rows.map((r) => (byMonth ? MONTHS[+r.id.slice(5, 7) - 1] : String(+r.id.slice(8, 10))));
  const perDay = (m) => GOALS[m - 1] / workDays(m).length;
  const goal = byMonth ? null : Math.round(perDay(+rows[0].id.slice(5, 7)));
  return `<div class="flex items-start justify-between gap-6"><div class="min-w-0 whitespace-nowrap">${title}<p class="${R.caption} mt-0.5">${span}</p></div>
      <div class="flex shrink-0 items-center gap-4 [&>div:first-child]:flex-nowrap ${controls ? "" : "pt-0.5"}">${legend([["bar", "Gross production"], ["line", "Net collections"], ["goal", byMonth ? "Monthly goal" : "Daily goal"]])}${controls ? `<div class="flex items-center gap-2">${controls}</div>` : ""}</div></div>
    <div class="mt-3">${comboChart({ bars: rows.map((r) => r.gross), line: rows.map((r) => r.coll), labels, goal, goals: byMonth ? rows.map((r) => GOALS[+r.id.slice(5, 7) - 1]) : null, w, h, every })}</div>
    ${note ? `<p class="${R.caption} mt-2">${note}</p>` : ""}`;
}
const pcChartNote = (i, rows) => i === 4 ? "Each dash is that month's goal from the Goals page. September's bar is month to date."
  : `One bar per day the office was open.${rows.some((r) => r.id === "2026-09-04") && rows.some((r) => r.id === "2026-09-08") ? " Closed on Labor Day, Sep 7." : ""}${rows.some((r) => r.id === TODAY) ? " Today is still in progress." : ""}`;
function pcChartsV2(i) {
  const rows = periodRows(i), byMonth = i === 4, t = sumRows(rows);
  const PROV = [["Dr. Maya Patel", 0.41], ["Dr. Ethan Brooks", 0.31], ["Sofia Ramirez, RDH", 0.15], ["Jordan Kim, RDH", 0.13]];
  const split = PROV.map(([n, f]) => [n, c2(t.gross * f)]); split[3][1] = c2(t.gross - split.slice(0, 3).reduce((a, x) => a + x[1], 0));
  return `<div class="grid grid-cols-[1fr_256px] gap-8 py-5">
    <div class="min-w-0"${chg("The Charts tab draws the same chart as the chart block: title left, legend right, then a footnote. One chart to learn.")}>${v2ChartRegion(rows, byMonth, `${PERIOD_SPAN[i]} · ${byMonth ? "by month" : "by office day"}`, { every: rows.length > 12 ? 2 : 1, note: pcChartNote(i, rows) })}</div>
    <div class="min-w-0"${chg("Production by provider is one 32px ranked row each, the bar behind the name. The Total and the collection-rate box went: the numbers across the top already say them.")}><p class="${R.groupTitle} mb-3">Gross production by provider</p>
      <ol class="space-y-1">${split.map(([n, v]) => `<li class="flex items-center gap-3 h-8"><div class="relative min-w-0 grow h-full"><span class="absolute inset-y-0 start-0 rounded-md bg-blue-100" style="width:${Math.max(4, (v / split[0][1]) * 100)}%"></span><span class="relative flex h-full items-center px-2.5 text-[13px] text-gray-800"><span class="truncate">${n}</span></span></div><span class="w-16 shrink-0 text-end text-[13px] font-medium tabular-nums text-gray-800">${whole(v)}</span></li>`).join("")}</ol></div>
  </div>`;
}
function pcCharts(i) {
  if (V2) return pcChartsV2(i);
  const rows = periodRows(i), byMonth = i === 4, t = sumRows(rows);
  const labels = rows.map((r) => (byMonth ? MONTHS[+r.id.slice(5, 7) - 1] : String(+r.id.slice(8, 10))));
  const perDay = (m) => GOALS[m - 1] / workDays(m).length;
  const goal = byMonth ? null : Math.round(perDay(+rows[0].id.slice(5, 7)));
  const PROV = [["Dr. Maya Patel", 0.41], ["Dr. Ethan Brooks", 0.31], ["Sofia Ramirez, RDH", 0.15], ["Jordan Kim, RDH", 0.13]];
  const split = PROV.map(([n, f]) => [n, c2(t.gross * f)]); split[3][1] = c2(t.gross - split.slice(0, 3).reduce((a, x) => a + x[1], 0));
  return `<div class="grid grid-cols-[1fr_300px] gap-8 py-5">
    <div class="min-w-0"><p class="${R.groupTitle}">Production and collections</p><p class="${R.caption} mt-0.5 mb-3">${PERIOD_SPAN[i]} · ${byMonth ? "by month" : "by office day"}</p>
      <div class="mb-1">${legend([["bar", "Gross production"], ["line", "Net collections"], ["goal", byMonth ? "Monthly goal" : "Daily goal"]])}</div>
      ${comboChart({ bars: rows.map((r) => r.gross), line: rows.map((r) => r.coll), labels, goal, goals: byMonth ? rows.map((r) => GOALS[+r.id.slice(5, 7) - 1]) : null, w: 520, h: 250, every: rows.length > 12 ? 2 : 1 })}</div>
    <div class="min-w-0 space-y-6">
      <div><p class="${R.groupTitle} mb-3">Gross production by provider</p><div class="space-y-3">${split.map(([n, v]) => `<div><div class="flex items-baseline justify-between gap-3 text-[13px] mb-1"><span class="text-gray-800 truncate">${n}</span><span class="tabular-nums text-gray-800 font-medium">${whole(v)}</span></div>${Chart.meter(v, split[0][1] * 1.1)}</div>`).join("")}</div>
        <p class="${R.caption} mt-3 flex justify-between"><span>Total</span><span class="tabular-nums">${whole(t.gross)}</span></p></div>
      <div class="border-t border-gray-200/80 pt-5"><p class="${R.groupTitle} mb-1">Collection rate</p><p class="flex items-end justify-between gap-3"><span class="${R.numberSm}">${pct(t.coll / t.net)}</span>${rows.length > 1 ? Chart.spark(rows.map((r) => r.coll / r.net), { w: 120, h: 28 }) : ""}</p><p class="${R.caption} mt-1">${whole(t.coll)} collected on ${whole(t.net)} net production</p></div>
    </div></div>`;
}
/* v2: strip, then one toolbar (search · dates · sort · filters | Table/Charts · ⋯), then the grid or the charts */
const PC_VIEW_NOTE = "Table / Charts is a small switch at the end of the toolbar instead of its own tab row (tabs in this library mean subsets with counts), and the “All providers” caption that looked like a filter is gone.";
const pcViewSwitch = (on) => `<span${chg(PC_VIEW_NOTE)}>${segmented(["Table", "Charts"], on, { sm: true, attrs: 'data-pc-view aria-label="Show as"' })}</span>`;
function pcV2Html(state) {
  if (state === "Loading") return `<div class="grid grid-cols-4 border-b border-gray-200/80 -mx-[${PG}px]">${Array.from({ length: 4 }, (_, i) => `<div class="py-4 px-5 ${i ? "border-s border-gray-200/80" : ""} first:ps-[${PG}px] space-y-2.5">${skel("w-24", "h-3")}${skel("w-28", "h-6")}${skel("w-20", "h-2.5")}</div>`).join("")}</div>
    <div class="py-2.5 flex gap-2">${skel("w-44", "h-8")}${skel("w-48", "h-8")}${skel("w-20", "h-8")}<span class="ms-auto">${skel("w-32", "h-8")}</span></div>${gridSkeleton(["Day", "Gross production", "Adjustments", "Net production", "Net collections", "Collection rate"], 8, { gutter: PG })}`;
  return `<div data-pc-strip>${pcStrip(2)}</div>
    <div data-pc-table data-ri ${state === "Charts" ? "hidden" : ""}></div>
    <div data-pc-charts ${state === "Charts" ? "" : "hidden"}></div>`;
}
function pcV2Mount(el, state) {
  const host = el.querySelector("[data-pc-table]"); if (!host) return;
  const charts = el.querySelector("[data-pc-charts]"), strip = el.querySelector("[data-pc-strip]");
  let period = 2, cOpen = false;
  const chartBar = () => `<div class="flex items-center gap-2 py-2.5 border-b border-gray-200/80 -mx-[${PG}px] px-[${PG}px]">${periodPicker(PERIODS, period, cOpen, { label: pcLabel(period), item: "data-cp", toggle: "data-cpm" })}<div class="ms-auto flex items-center gap-1.5">${pcViewSwitch(1)}${iconButton("ellipsis", "More", { s: "iconSm" })}</div></div>`;
  const drawCharts = () => { charts.innerHTML = chartBar() + pcCharts(period); icons(); };
  const g = new RiGrid(host, { gutter: PG,
    columns: pcColsV2(false), rows: periodRows(period), title: "Days", noun: "days", searchPlaceholder: "Search days", searchW: "w-40",
    periods: PERIODS, period, periodLabel: pcLabel, selectable: false, addColumn: false, maxHeight: 396,
    calc: { sched: "sum", gross: "sum", adj: "sum", net: "sum", ins: "sum", pt: "sum", coll: "sum" },
    filters: DOW_FILTER, toolbarExtra: pcViewSwitch(0),
    onPeriod: (i, grid) => { period = i; grid.o.columns = pcColsV2(i === 4); grid.o.noun = i === 4 ? "months" : "days"; grid.o.filters = i === 4 ? [] : DOW_FILTER; grid.setRows(periodRows(i)); grid.sort = null; grid.filters = {}; strip.innerHTML = pcStrip(i); drawCharts(); icons(); }
  });
  drawCharts();
  charts.addEventListener("click", (e) => { if (e.target.closest("[data-cpm]")) { cOpen = !cOpen; return drawCharts(); }
    const b = e.target.closest("[data-cp]"); if (!b) return; cOpen = false; g.o.period = period = +b.dataset.cp; g.o.onPeriod(period, g); g.render(); });
  /* the Table / Charts switch lives in both bars; picking one shows that view with its own bar */
  el.addEventListener("click", (e) => { const s = e.target.closest("[data-pc-view] [data-seg]"); if (!s) return;
    const toCharts = s.dataset.seg === "1"; host.hidden = toCharts; charts.hidden = !toCharts; g.render(); drawCharts(); });
}
defineBlock({
  cat: "revenue", id: "revenue-production-collections", thumb: true,
  title: "Production & Collections",
  note: "A Revenue Intelligence page: the numbers across the top, then Table and Charts tabs, then the one-line bar (search, dates, Sort, chips, +, ⋯) and the grid. The dates, tabs, sort and grid all work, and every total agrees with the rows.",
  where: "Revenue Intelligence › Financial › Production & Collections",
  states: ["Table", "Charts", "Loading"],
  canvas: "bare",
  html: (state) => `${workspaceHeader({ parent: "Revenue Intelligence", title: "Production & Collections", actions: riActions() })}
    <div class="grid grid-cols-[${NAV_W}px_1fr]">
      ${riNav("Production & Collections")}
      <div class="min-w-0 ${PX} pb-5">${V2 ? pcV2Html(state) : state === "Loading"
        ? `<div class="grid grid-cols-4 border-b border-gray-200/80">${Array.from({ length: 4 }, (_, i) => `<div class="py-4 ${i ? "px-5 border-s border-gray-200/80" : "pe-5"} space-y-2.5">${skel("w-24", "h-3")}${skel("w-28", "h-6")}${skel("w-20", "h-2.5")}</div>`).join("")}</div>
          ${tabsWithSlot(["Table", "Charts"], 0, "", "")}
          <div class="py-2.5 flex gap-2">${skel("w-44", "h-8")}${skel("w-96", "h-8")}${skel("w-16", "h-8")}</div>${gridSkeleton(["Day", "Scheduled", "Gross production", "Adjustments", "Net production", "Net collections"], 8, { gutter: 24 })}`
        : `<div data-pc-strip>${pcStrip(2)}</div>
          <div data-pc-tabs>${tabsWithSlot(["Table", "Charts"], state === "Charts" ? 1 : 0, `<span class="${R.caption}">All providers · Bayview Family Dental</span>`, "")}</div>
          <div data-pc-table data-ri ${state === "Charts" ? "hidden" : ""}></div>
          <div data-pc-charts ${state === "Charts" ? "" : "hidden"}></div>`}</div>
    </div>`,
  mount: (el) => {
    if (V2) return pcV2Mount(el);
    const host = el.querySelector("[data-pc-table]"); if (!host) return;
    const charts = el.querySelector("[data-pc-charts]"), strip = el.querySelector("[data-pc-strip]");
    let period = 2;
    let cOpen = false;
    const chartBar = () => `<div class="flex items-center gap-2 py-2.5 border-b border-gray-200/80">${periodPicker(PERIODS, period, cOpen, { label: pcLabel(period), item: "data-cp", toggle: "data-cpm" })}<div class="ms-auto">${iconButton("ellipsis", "More", { s: "iconSm" })}</div></div>`;
    const drawCharts = () => { charts.innerHTML = chartBar() + pcCharts(period); icons(); };
    const g = new RiGrid(host, { gutter: 24,
      columns: pcCols(false), rows: periodRows(period), title: "Days", searchPlaceholder: "Search days", searchW: "w-40",
      periods: PERIODS, period, periodLabel: pcLabel, selectable: false, addColumn: false, maxHeight: 396,
      calc: { sched: "sum", gross: "sum", adj: "sum", net: "sum", ins: "sum", pt: "sum", coll: "sum" },
      filters: DOW_FILTER,
      onPeriod: (i, grid) => { period = i; grid.o.columns = pcCols(i === 4); grid.o.filters = i === 4 ? [] : DOW_FILTER; grid.setRows(periodRows(i)); grid.sort = null; grid.filters = {}; strip.innerHTML = pcStrip(i); drawCharts(); icons(); }
    });
    drawCharts();
    charts.addEventListener("click", (e) => { if (e.target.closest("[data-cpm]")) { cOpen = !cOpen; return drawCharts(); }
      const b = e.target.closest("[data-cp]"); if (!b) return; cOpen = false; g.o.period = period = +b.dataset.cp; g.o.onPeriod(period, g); g.render(); });
    wireTabs(el.querySelector("[data-pc-tabs]"), (i) => { host.hidden = i !== 0; charts.hidden = i !== 1; });
  }
});

/* ============================================================ 2. Metric strip variants */
defineBlock({
  cat: "revenue", id: "revenue-metric-strips", title: "Metric strip variants",
  note: "The numbers across the top of every Revenue Intelligence page: a grey label and a dark number. Add a grey change tag, a blue goal bar, or a grey line under the number. Never a coloured number, never a tile.",
  where: "Revenue Intelligence › every subtab",
  canvas: "white",
  html: () => {
    const sep = monthTotal(9);
    const spec = (label, inner) => `<div><p class="${R.caption} mb-2">${label}</p><div class="${R.box} overflow-hidden [&>div]:!border-y-0 [&>div>div:first-child]:!ps-5">${inner}</div></div>`;
    return `<div class="space-y-9">
      ${spec("Plain · Collections Summary", metricStrip([["Net collections", whole(sep.coll)], ["Insurance", whole(sep.ins)], ["Patient", whole(sep.pt)], ["Card net", whole(c2(sep.pt * 0.64))]]))}
      ${spec("With goal bars · Daily Huddle", metricStrip([["MTD gross production", whole(sep.gross), { goal: (sep.gross / GOALS[8]) * 100, sub: `${Math.round((sep.gross / GOALS[8]) * 100)}% of ${whole(GOALS[8])} goal` }], ["New patients", "31", { goal: (31 / 40) * 100, sub: "31 of 40 goal" }], ["Case acceptance", "66.4%", { goal: (66.4 / 70) * 100, sub: "Goal 70%" }], ["Collection rate", pct(sep.coll / sep.net), { goal: (sep.coll / sep.net) * 100 / 0.98, sub: "Goal 98%" }]]))}
      ${spec("With change tags · Scheduling", metricStrip([["Fill rate", "91.4%", { delta: "+2.1 pts", sub: "vs last month" }], ["Cancel rate", "6.8%", { delta: "−0.9 pts", sub: "vs last month" }], ["No-show rate", "2.3%", { delta: "+0.4 pts", sub: "vs last month" }], ["Open chair hours", "38 hrs", { delta: "−12 hrs", sub: "Next 14 days" }]]))}
      ${spec("Many numbers wrap onto a second row · Case Acceptance and Hygiene Metrics", metricGrid([["Acceptance rate", "66.4%"], ["Diagnosed value", "$286,420"], ["Accepted value", "$190,183"], ["Unscheduled value", "$13,385", { sub: "12 patients" }], ["Re-appointment %", "88.2%"], ["Perio %", "31.5%"], ["Fluoride %", "42.7%"], ["Production / visit", "$158"]], 4))}
    </div>`;
  }
});

/* ============================================================ 3. A/R aging */
const BUCKETS = ["Current (0-30)", "31-60", "61-90", "91-120", "120+"];
const BUCKET_KEYS = ["b0", "b1", "b2", "b3", "b4"];
const daysOut = (s) => Math.round((Date.parse(TODAY) - Date.parse(s)) / 86400000);
const bucketOf = (s) => { const d = daysOut(s); return d <= 30 ? 0 : d <= 60 ? 1 : d <= 90 ? 2 : d <= 120 ? 3 : 4; };
const aged = (charges) => { const b = [0, 0, 0, 0, 0]; charges.forEach(([s, a]) => (b[bucketOf(s)] = c2(b[bucketOf(s)] + a))); return b; };
/* Guarantor A/R: what each family owes, by the date of each charge (AR_CHARGES keeps each family's charges for v4's
 * hover card on the aging lines) */
const AR_CHARGES = new Map();
const GUARANTORS = [
  ["Benjamin Scott", "(831) 555-0173", [["2026-01-09", 1650], ["2026-04-14", 500]], "2026-05-02"],
  ["Lucas Foster", "(408) 555-0165", [["2026-09-10", 1320]], "2026-09-10"],
  ["Daniel Price", "(209) 555-0126", [["2026-06-18", 640], ["2026-08-28", 405]], "2026-07-20"],
  ["Olivia Nguyen", "(650) 555-0101", [["2026-05-21", 400], ["2026-07-09", 220], ["2026-08-14", 120]], "2026-08-14"],
  ["Samuel Park", "(559) 555-0148", [["2026-07-02", 560]], ""],
  ["James Ortiz", "(707) 555-0154", [["2026-07-22", 410]], "2026-06-01"],
  ["Grace Mitchell", "(510) 555-0191", [["2026-08-11", 198.4], ["2026-09-02", 120]], "2026-09-02"],
  ["Zoe Martin", "(916) 555-0135", [["2026-09-15", 212.75]], ""],
  ["Ava Thompson", "(415) 555-0132", [["2026-09-02", 184]], "2026-03-12"],
  ["Ethan Walker", "(925) 555-0187", [["2026-08-25", 95]], "2026-08-25"],
  ["Ruth Alvarez", "(415) 555-0117", [["2026-04-30", 86]], "2026-02-11"],
  ["Emma Rodriguez", "(510) 555-0144", [["2026-08-06", 62.5]], "2026-03-20"],
  ["Mason Reed", "(650) 555-0199", [["2026-05-02", 25]], ""]
].map(([name, phone, ch, last], i) => { const b = aged(ch); AR_CHARGES.set("g" + i, ch); return { id: "g" + i, name, phone, last, ...Object.fromEntries(BUCKET_KEYS.map((k, j) => [k, b[j]])), total: c2(b.reduce((a, x) => a + x, 0)) }; });
/* Insurance A/R: open claims by service date */
const INS_AR = [["Liam Carter", "metlife", "2026-06-30", 1384.5], ["James Ortiz", "cigna", "2026-07-22", 1180], ["Lucas Foster", "metlife", "2026-09-10", 890], ["Benjamin Scott", "aetna", "2026-09-01", 465], ["Ava Thompson", "delta", "2026-09-02", 412], ["Olivia Nguyen", "aetna", "2026-08-14", 318],
  ["Mason Reed", "guardian", "2026-05-02", 235], ["Ethan Walker", "delta", "2026-08-25", 210], ["Emma Rodriguez", "cigna", "2026-09-18", 175], ["Noah Bennett", "delta", "2026-03-18", 80], ["Grace Mitchell", "uc", "2026-09-02", 772.5], ["Chloe Walker", "delta", "2026-02-25", 45], ["Samuel Park", "guardian", "2026-07-02", 1050]]
  .map(([name, payer, svc, amt], i) => { const b = [0, 0, 0, 0, 0]; b[bucketOf(svc)] = amt; return { id: "i" + i, name, payer, svc, days: daysOut(svc), ...Object.fromEntries(BUCKET_KEYS.map((k, j) => [k, b[j]])), total: amt }; });
const CARRIERS = DATA.payers.map((p) => { const rows = INS_AR.filter((r) => r.payer === p.id); const t = { id: p.id, name: p.name, claims: rows.length, total: 0 };
  BUCKET_KEYS.forEach((k) => (t[k] = c2(rows.reduce((a, r) => a + r[k], 0)))); t.total = c2(rows.reduce((a, r) => a + r.total, 0)); return t; }).filter((c) => c.claims);
const colSums = (rows) => BUCKET_KEYS.map((k) => c2(rows.reduce((a, r) => a + r[k], 0)));
const bucketCols = () => BUCKET_KEYS.map((k, j) => ({ key: k, label: BUCKETS[j], w: j ? 112 : 140, num: true, kind: "money", render: (r) => (r[k] ? money(r[k]) : V4 ? `<span class="text-gray-400">${money(0)}</span>` : V2 ? "" : `<span class="text-gray-300">—</span>`) }));
const AR_VIEWS = [
  { label: "Guarantor A/R", rows: GUARANTORS, title: "Guarantors", search: "Search guarantors", cols: () => [
    { key: "name", label: "Guarantor", icon: "user", w: 192, kind: "text", open: true, lead: (r) => avatar(r.name, { size: 5 }), render: (r) => esc(r.name) },
    ...bucketCols(),
    { key: "total", label: "Total", w: 124, num: true, kind: "money", render: (r) => `<span class="font-medium">${money(r.total)}</span>` },
    { key: "last", label: "Last payment", icon: "calendar", w: 142, kind: "date", render: (r) => (r.last ? fmtDate(r.last) : `<span class="text-gray-400">No payments</span>`) }] },
  { label: "Insurance A/R", rows: INS_AR, title: "Open claims", search: "Search patients", cols: () => [
    { key: "name", label: "Patient", icon: "user", w: 184, kind: "text", open: true, lead: (r) => avatar(r.name, { size: 5 }), render: (r) => esc(r.name) },
    { key: "payer", label: "Carrier", icon: "shield", w: 140, kind: "text", value: (r) => DATA.payer(r.payer).short, render: (r) => esc(DATA.payer(r.payer).short) },
    { key: "svc", label: "Service date", icon: "calendar", w: 118, kind: "date", render: (r) => fmtDate(r.svc) },
    ...bucketCols(),
    { key: "total", label: "Total", w: 116, num: true, kind: "money", render: (r) => `<span class="font-medium">${money(r.total)}</span>` }] },
  { label: "Carrier breakdown", rows: CARRIERS, title: "Carriers", search: "Search carriers", cols: () => [
    { key: "name", label: "Carrier", icon: "shield", w: 212, kind: "text", lead: (r) => avatar(r.name, { size: 5, square: true }), render: (r) => esc(r.name) },
    { key: "claims", label: "Claims", w: 84, num: true, kind: "num" },
    ...bucketCols(),
    { key: "total", label: "Total", w: 124, num: true, kind: "money", render: (r) => `<span class="font-medium">${money(r.total)}</span>` }] }
];
/* v2: the oldest money is the darkest blue (it's the part that needs a person); the legend gives each bucket's share
 * only, because the totals row under the grid has the amounts */
const AR_SHADES = ["bg-blue-100", "bg-blue-200", "bg-blue-300", "bg-blue-400", "bg-blue-600"];
const arStackV2 = (rows) => { const s = colSums(rows), t = c2(s.reduce((a, b) => a + b, 0)) || 1;
  return `<p class="${R.groupTitle} mb-2">Aging distribution</p>
    <div class="flex h-3 w-full overflow-hidden rounded-full bg-gray-100 gap-px"${chg("The oldest money (120+ days) is now the darkest blue and Current the palest, so the part that needs a person stands out.")}>${s.map((v, j) => `<div class="${AR_SHADES[j]}" style="width:${(v / t) * 100}%" title="${esc(BUCKETS[j])}"></div>`).join("")}</div>
    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1"${chg("The legend shows each bucket's share only; the dollar amounts were the same as the totals row under the grid.")}>${BUCKETS.map((l, j) => `<span class="inline-flex items-center gap-x-1.5 text-xs text-gray-600"><span class="size-2 rounded-sm ${AR_SHADES[j]}"></span>${esc(l)} <span class="text-gray-400 tabular-nums">· ${Math.round((s[j] / t) * 100)}%</span></span>`).join("")}</div>`; };
const arStack = (rows) => { if (V2) return arStackV2(rows); const s = colSums(rows), t = c2(s.reduce((a, b) => a + b, 0));
  return `<div class="flex items-baseline justify-between gap-4 mb-2"><p class="${R.groupTitle}">Aging distribution</p><p class="${R.caption} tabular-nums">${whole(t)} outstanding</p></div>${Chart.stack(BUCKETS.map((l, j) => ({ label: l, value: s[j], fmt: `${money(s[j], { cents: false })} · ${Math.round((s[j] / t) * 100)}%` })), { h: "h-3" })}`; };
/* ---- v4: record panels opened from Revenue Intelligence rows (one header, facts you type into, one Actions menu) ---- */
/* A claim's status is the first line of its facts: a dot and a word you can change, with how long it's been out */
const V4_CLAIM_ST = [["Sent", "off"], ["With payer", "off"], ["Needs info", "needs"], ["Paid", "on"], ["Denied", "needs"]];
const v4StatusRow = (value, note) => ({ label: "Status", value, type: "select", options: V4_CLAIM_ST.map(([l]) => l),
  html: (row) => `<span class="inline-flex items-center gap-2 min-w-0"><span class="${cx(R.dot, TONE_DOT[(V4_CLAIM_ST.find(([l]) => l === row.value) || [0, "off"])[1]])}"></span>${esc(row.value)}${row.value === value && note ? `<span class="text-gray-500 truncate">· ${note}</span>` : ""}</span>` });
/* The Actions menu for an open insurance claim. Check status and Open claim have their own buttons, so they aren't here. */
const v4ClaimActions = (payerShort, days) => [
  { label: "Claim", items: [{ icon: "phone", label: `Call ${payerShort}`, hint: "Ask for the claim status by phone", suggest: days > 90 ? `No answer from ${payerShort} in ${days} days` : "" },
    { icon: "eye", label: "Preview claim", hint: `The ADA form as ${payerShort} got it` }, { icon: "paperclip", label: "Send additional attachments", hint: "X-rays, perio charts or a narrative" },
    { icon: "send", label: "Resend claim", hint: "Send it again if the payer has no record of it", off: days > 30 ? "" : "Wait 30 days from sending before resending" }, { icon: "scale", label: "Prepare appeal", hint: "Start a letter for a denied line", off: "Nothing on this claim was denied" }] },
  { label: "Balance", items: [{ icon: "user-round", label: "Bill the patient", hint: "Move what's left to the patient's balance" }, { icon: "eraser", label: "Write off", hint: "Write off what the payer won't pay" }] },
  { label: "", items: [{ icon: "ban", label: "Void claim", danger: true }] }];
/* The Actions menu for a guarantor's balance. Send statement and Collect payment have their own buttons. */
const v4GuarantorActions = (r) => { const over90 = c2(r.b3 + r.b4);
  return [
    { label: "Balance", items: [{ icon: "calendar-range", label: "Set up payment plan", hint: "Split the balance into monthly payments", suggest: over90 ? `${money(over90)} of it is over 90 days old` : "" },
      { icon: "book-open", label: "Open ledger", hint: "Every charge and payment for the family" }, { icon: "circle-minus", label: "Add adjustment", hint: "Discount or write off part of the balance" }] },
    { label: "Contact", items: [{ icon: "message-square", label: "Text guarantor", hint: "Open the text thread" }, { icon: "phone", label: "Call guarantor", hint: r.phone },
      { icon: "notebook-pen", label: "Add collection note", hint: "What was said and when to follow up" }] },
    { label: "", items: [{ icon: "landmark", label: "Send to collections", hint: "Hand the balance to the collection agency", danger: true, off: r.b4 ? "" : "Only for balances over 120 days old" }] }];
};
const v4Menu = (groups, note) => `<div data-ri-keep${chg4(note)}>${actionsMenu(groups, { open: V4_OPTS.open })}</div>`;
const V4_PANEL_NOTE = "Click a name: its panel has one header (no bar above it), its facts are a small table you type into (a claim's status is the first line), and everything else is in one Actions menu.";
/* A record's fields with the group name in the grey header band, so they match the Aging grid above them (the claim
 * panel's look): rows as the kit's fieldTable */
const v4RevBand = (band, rows) => sheetTable({ title: band, rows: rows.map((x, i) => ({ id: `f${i}`, ...x })),
  columns: [{ key: "label", label: esc(band), w: 140, render: (x) => `<span class="text-gray-500">${esc(x.label)}</span>` },
    { key: "value", label: "", w: 160, grow: true, edit: (x) => (x.type === "none" ? null : x.type || "text"), options: (x) => x.options, placeholder: (x) => `Add ${x.label.toLowerCase()}`, render: (x) => (x.html ? x.html(x) : esc(x.value)) }] });
function openArSheetV4(r, view) {
  const g = view === 0, over90 = c2((r.b3 || 0) + (r.b4 || 0)), payer = !g && DATA.payer(r.payer);
  /* the aging is the panel's compact grid; what makes up a bucket (each charge and its date, or the claim's service
   * date) opens on hover beside the panel */
  const lines = BUCKETS.map((l, j) => ({ id: `b${j}`, l, j, amt: r[BUCKET_KEYS[j]] || 0 }));
  const peek = (b) => { if (!b.amt) return "";
    if (!g) return peekCard(`${esc(b.l)} days`, [["Service date", fmtDateY(r.svc)], ["Payer", esc(payer.name)], ["Days out", `${r.days} days`], ["Amount", money(b.amt)]]);
    const ch = (AR_CHARGES.get(r.id) || []).filter(([d]) => bucketOf(d) === b.j);
    return peekCard(`${esc(b.l)} days · ${ch.length} ${ch.length === 1 ? "charge" : "charges"}`, ch.map(([d, a]) => [fmtDateY(d), `<span class="tabular-nums">${money(a)}</span>`])); };
  const aging = psec("", `<div data-ri-keep${chg4("The aging is the panel's compact grid with its name in the grey header band, like the facts table under it. Rest the pointer on a bucket to see the charges in it and their dates, in a card beside the panel.")}>${sheetTable({ sheet: false, title: "Aging", rows: lines, foot: ["Total", money(r.total)], peek,
    columns: [{ key: "l", label: "Aging", w: 140, grow: true, render: (b) => `<span class="text-gray-500">${esc(b.l)}</span>` }, { key: "amt", label: "Amount", w: 120, num: true, render: (b) => (b.amt ? money(b.amt) : `<span class="text-gray-400">${money(0)}</span>`) }] })}</div>`);
  Sheet.open({ flush: true, title: esc(r.name), lead: avatar(r.name, { size: 9 }), subtitle: g ? "Guarantor A/R" : `${payer.name} · Service ${fmtDate(r.svc)}`,
    marks: over90 ? recordMark("circle-alert", g ? `${money(over90)} of this balance is over 90 days old` : `No answer from ${payer.short} in ${r.days} days`, true) : "",
    facts: g ? [["Balance", money(r.total)], ["Over 90 days", money(over90)], ["Last payment", r.last ? fmtDate(r.last) : "None"]] : [["Amount", money(r.total)], ["Days out", `${r.days} days`], ["Payer", payer.short]],
    actions: iconButton("external-link", g ? "Open chart" : "Open claim", { s: "iconSm" }),
    body: `${aging}${g ? psec("", `<div data-ri-keep${chg4("Contact facts are a small table you type into: click the phone number to fix it. Its name, Contact, sits in the same grey band as the Aging grid's header.")}>${v4RevBand("Contact", [{ label: "Phone", value: r.phone }, { label: "Last payment", value: r.last ? fmtDate(r.last) : "No payments yet", type: "none" }])}</div>`)
      : psec("", `<div data-ri-keep${chg4("The claim's status is the first line of its facts (a dot and a word you can change), not a separate field among the others. Its name, Claim, sits in the same grey band as the Aging grid's header.")}>${v4RevBand("Claim", [v4StatusRow("With payer", `${r.days} days`), { label: "Payer", value: payer.name, type: "none" }, { label: "Amount", value: money(r.total), type: "none" }])}</div>`)}`,
    footer: g ? `${v4Menu(v4GuarantorActions(r), "Everything else you can do with this balance is in one searchable Actions menu: payment plan, ledger, notes, collections.")}<span class="grow"></span>${button("Send statement", { v: "white", s: "sm", icon: "file-text" })}${button("Collect payment", { v: "solid", s: "sm" })}`
      : `${v4Menu(v4ClaimActions(payer.short, r.days), "Everything else you can do with this claim is in one searchable Actions menu; calling the payer is suggested once it's been out 90 days.")}<span class="grow"></span>${button("Check status", { v: "white", s: "sm", icon: "refresh-cw" })}${button("Open claim", { v: "solid", s: "sm" })}` });
}
function openArSheet(r, view) {
  if (V4) return openArSheetV4(r, view);
  const g = view === 0;
  Sheet.open({ flush: true, title: esc(r.name), lead: avatar(r.name, { size: 9 }), subtitle: g ? "Guarantor A/R" : `${DATA.payer(r.payer).name} · Service ${fmtDate(r.svc)}`,
    actions: iconButton("external-link", g ? "Open chart" : "Open claim", { s: "iconSm" }),
    body: `${psec("Aging", `<div class="${R.tableBox}"><table class="border-separate border-spacing-0 text-sm"><tbody>${BUCKETS.map((l, j) => `<tr><td class="${R.tCell} text-gray-500">${l}</td><td class="${R.tCell} text-end tabular-nums ${r[BUCKET_KEYS[j]] ? "" : "!text-gray-300"}">${r[BUCKET_KEYS[j]] ? money(r[BUCKET_KEYS[j]]) : "—"}</td></tr>`).join("")}</tbody>
        <tfoot><tr><td class="h-9 px-3 text-sm font-semibold text-gray-800">Total</td><td class="h-9 px-3 text-end text-sm font-semibold tabular-nums">${money(r.total)}</td></tr></tfoot></table></div>`)}
      ${g ? psec("Contact", metaGrid([["Phone", `<span class="tabular-nums">${esc(r.phone)}</span>`], ["Last payment", r.last ? fmtDate(r.last) : '<span class="text-gray-400">No payments yet</span>']], 2))
        : psec("Claim", metaGrid([["Days out", `${r.days} days`], ["Status", statusDot("With payer", "off")]], 2))}`,
    footer: g ? `${button("Send statement", { v: "white", s: "sm", icon: "file-text" })}${button("Collect payment", { v: "solid", s: "sm" })}` : `${button("Check status", { v: "white", s: "sm", icon: "refresh-cw" })}${button("Open claim", { v: "solid", s: "sm" })}` });
}
/* v2: the date is said once, by the toolbar's date control; empty buckets are blank */
const AR_NOUNS = ["guarantors", "claims", "carriers"];
function arV2Html(state, { gT, iT, all, over90 }) {
  const head = workspaceHeader({ parent: "Revenue Intelligence", title: "A/R Aging", actions: riActions() });
  if (state === "Loading") return `${head}<div class="${PX} pb-5">
    <div class="grid grid-cols-5 border-b border-gray-200/80 -mx-[${PG}px]">${Array.from({ length: 5 }, (_, i) => `<div class="py-4 px-5 ${i ? "border-s border-gray-200/80" : ""} first:ps-[${PG}px] space-y-2.5">${skel("w-24", "h-3")}${skel("w-28", "h-6")}</div>`).join("")}</div>
    ${tabsWithSlot(AR_VIEWS.map((v) => v.label), 0, "", "", { gutter: PG })}<div class="py-5 space-y-2">${skel("w-32", "h-3.5")}${skel("w-full", "h-3")}</div>${gridSkeleton(["Guarantor", "Current (0-30)", "31-60", "61-90", "91-120", "120+", "Total"], 7, { gutter: PG })}</div>`;
  return `${head}
    <div class="${PX} pb-5">
      <div${chg("The “as of” date is said once, by the date control in the toolbar. It used to appear in the strip, beside the tabs and in the toolbar.")}>${metricStrip([["Total A/R", whole(all)], ["Guarantor", whole(gT), { sub: `${GUARANTORS.length} families` }], ["Insurance", whole(iT), { sub: `${INS_AR.length} open claims` }], ["Over 90 days", whole(over90), { sub: `${Math.round((over90 / all) * 100)}% of total A/R` }], ["Avg days out", `${Math.round(INS_AR.reduce((a, r) => a + r.days, 0) / INS_AR.length)} days`, { sub: "Open insurance claims" }]], "!border-t-0", { gutter: PG })}</div>
      <div data-ar-tabs>${tabsWithSlot(AR_VIEWS.map((v) => [v.label, v.rows.length]), 0, "", "", { gutter: PG })}</div>
      <div class="pt-5 pb-1" data-ar-stack>${arStack(GUARANTORS)}</div>
      ${V4 ? `<div${chg4("An empty aging bucket shows a muted grey $0.00 instead of a blank, so every column reads on every row and the amounts that are there still stand out")}>` : ""}<div data-grid="ar" data-ri${chg("Empty aging buckets are blank instead of a dash, so the amounts that are there stand out (about 60% of the cells were dashes).")}${chg4(V4_PANEL_NOTE)}></div>${V4 ? "</div>" : ""}
    </div>`;
}
function arV2Mount(el, host) {
  let view = 0;
  const g = new RiGrid(host, { gutter: PG, columns: AR_VIEWS[0].cols(), rows: GUARANTORS, title: "Guarantors", noun: AR_NOUNS[0], searchPlaceholder: "Search guarantors", selectable: false, addColumn: false, maxHeight: 360,
    defaultSort: { key: "total", dir: -1 }, calc: { b0: "sum", b1: "sum", b2: "sum", b3: "sum", b4: "sum", total: "sum" },
    filters: [{ key: "oldest", label: "Oldest balance", options: BUCKETS.map((b, j) => ({ value: String(j), label: b })), match: (r, v) => BUCKET_KEYS.map((k) => r[k]).findLastIndex((x) => x > 0) === +v }],
    dates: button("As of Sep 25, 7:00 AM", { v: "white", s: "sm", icon: "calendar", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400" }),
    onOpen: (r) => openArSheet(r, view) });
  wireTabs(el.querySelector("[data-ar-tabs]"), (i) => { view = i; const v = AR_VIEWS[i];
    g.o.columns = v.cols(); g.o.title = v.title; g.o.noun = AR_NOUNS[i]; g.o.searchPlaceholder = v.search; g.setRows(v.rows); g.q = ""; g.filters = {}; g.sort = { key: "total", dir: -1 }; g.render();
    el.querySelector("[data-ar-stack]").innerHTML = arStack(v.rows); icons(); });
}
defineBlock({
  cat: "revenue", id: "revenue-ar-aging", title: "A/R aging",
  note: "What patients and insurance still owe, by age. The blue stacked bar and the grid's totals row are the same numbers. Three views: Guarantor A/R, Insurance A/R and Carrier breakdown. Click a name to open it.",
  where: "Revenue Intelligence › Financial › A/R Aging",
  states: ["Normal", "Loading"],
  canvas: "bare",
  html: (state) => {
    const gT = c2(GUARANTORS.reduce((a, r) => a + r.total, 0)), iT = c2(INS_AR.reduce((a, r) => a + r.total, 0)), all = c2(gT + iT);
    const over90 = c2([...colSums(GUARANTORS), ...colSums(INS_AR)].filter((_, i) => i % 5 >= 3).reduce((a, b) => a + b, 0));
    if (V2) return arV2Html(state, { gT, iT, all, over90 });
    if (state === "Loading") return `${workspaceHeader({ parent: "Revenue Intelligence", title: "A/R Aging", actions: riActions() })}<div class="px-6 pb-5">
      <div class="grid grid-cols-5 border-b border-gray-200/80">${Array.from({ length: 5 }, (_, i) => `<div class="py-4 ${i ? "px-5 border-s border-gray-200/80" : "pe-5"} space-y-2.5">${skel("w-24", "h-3")}${skel("w-28", "h-6")}</div>`).join("")}</div>
      ${tabsWithSlot(AR_VIEWS.map((v) => v.label), 0, "", "")}<div class="py-5 space-y-2">${skel("w-32", "h-3.5")}${skel("w-full", "h-3")}</div>${gridSkeleton(["Guarantor", "Current (0-30)", "31-60", "61-90", "91-120", "120+", "Total"], 7, { gutter: 24 })}</div>`;
    return `${workspaceHeader({ parent: "Revenue Intelligence", title: "A/R Aging", actions: riActions() })}
    <div class="px-6 pb-5">
      ${metricStrip([["Total A/R", whole(all), { sub: `As of ${fmtDateY(TODAY)}` }], ["Guarantor", whole(gT), { sub: `${GUARANTORS.length} families` }], ["Insurance", whole(iT), { sub: `${INS_AR.length} open claims` }], ["Over 90 days", whole(over90), { sub: `${Math.round((over90 / all) * 100)}% of total A/R` }], ["Avg days out", `${Math.round(INS_AR.reduce((a, r) => a + r.days, 0) / INS_AR.length)} days`, { sub: "Open insurance claims" }]], "!border-t-0")}
      <div data-ar-tabs>${tabsWithSlot(AR_VIEWS.map((v) => [v.label, v.rows.length]), 0, `<span class="${R.caption}">Balances as of ${fmtDate(TODAY)}, 7:00 AM</span>`, "")}</div>
      <div class="pt-5 pb-1" data-ar-stack>${arStack(GUARANTORS)}</div>
      <div data-grid="ar" data-ri></div>
    </div>`;
  },
  mount: (el) => {
    const host = el.querySelector('[data-grid="ar"]'); if (!host) return;
    if (V2) return arV2Mount(el, host);
    let view = 0;
    const g = new RiGrid(host, { gutter: 24, columns: AR_VIEWS[0].cols(), rows: GUARANTORS, title: "Guarantors", searchPlaceholder: "Search guarantors", selectable: false, addColumn: false, maxHeight: 360,
      defaultSort: { key: "total", dir: -1 }, calc: { b0: "sum", b1: "sum", b2: "sum", b3: "sum", b4: "sum", total: "sum" },
      filters: [{ key: "oldest", label: "Oldest balance", options: BUCKETS.map((b, j) => ({ value: String(j), label: b })), match: (r, v) => BUCKET_KEYS.map((k) => r[k]).findLastIndex((x) => x > 0) === +v }],
      toolbarExtra: button("As of Sep 25", { v: "white", s: "sm", icon: "calendar" }),
      onOpen: (r) => openArSheet(r, view) });
    wireTabs(el.querySelector("[data-ar-tabs]"), (i) => { view = i; const v = AR_VIEWS[i];
      g.o.columns = v.cols(); g.o.title = v.title; g.o.searchPlaceholder = v.search; g.setRows(v.rows); g.q = ""; g.filters = {}; g.sort = { key: "total", dir: -1 }; g.render();
      el.querySelector("[data-ar-stack]").innerHTML = arStack(v.rows); icons(); });
  }
});

/* ============================================================ 4. Production vs collections chart */
defineBlock({
  cat: "revenue", id: "revenue-production-chart", title: "Production vs collections chart",
  note: "Light blue bars for gross production, a dark blue line for net collections, and a dashed goal line. Blue only. The numbers above the chart are the sums of the bars and the line.",
  where: "Revenue Intelligence › Production & Collections › Charts",
  states: ["Year to date", "This month"],
  canvas: "gray",
  html: (state) => {
    const ytd = state === "Year to date", rows = ytd ? periodRows(4) : periodRows(2), t = sumRows(rows);
    const labels = rows.map((r) => (ytd ? MONTHS[+r.id.slice(5, 7) - 1] : String(+r.id.slice(8, 10))));
    const goalT = ytd ? periodGoal(4, rows) : periodGoal(2, rows);
    if (V2) return `<div class="${R.box} p-5"${chg("The small numbers strip inside the card is gone (on a page the real numbers strip sits right above it), and this is now the same chart region the Charts tab uses: title left, legend and controls right.")}>
      ${v2ChartRegion(rows, ytd, ytd ? "Jan 1 – Sep 25, 2026 · by month · September is month to date" : "Sep 1–25, 2026 · by office day · today is still in progress",
        { w: 980, h: 260, note: ytd ? "Each dash is that month's goal from the Goals page. September's bar is month to date." : "One bar per day the office was open. Closed on Labor Day, Sep 7. Today is still in progress.",
          controls: `${segmented(["Day", "Week", "Month"], ytd ? 2 : 0, { sm: true })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}</div>`;
    return `<div class="${R.box} p-5">
      <div class="flex items-start justify-between gap-6">
        <div><p class="${R.sectionTitle}">Production and collections</p><p class="${R.help}">${ytd ? "Jan 1 – Sep 25, 2026 · by month · September is month to date" : "Sep 1–25, 2026 · by office day · today is still in progress"}</p></div>
        <div class="flex items-center gap-2">${segmented(["Day", "Week", "Month"], ytd ? 2 : 0, { sm: true })}${iconButton("ellipsis", "More", { s: "iconSm" })}</div>
      </div>
      <div class="grid grid-cols-4 mt-4 -mx-5 border-y border-gray-200/80 divide-x divide-gray-200/80">
        ${[["Gross production", whole(t.gross), `${Math.round((t.gross / goalT) * 100)}% of ${whole(goalT)} goal`], ["Net production", whole(t.net), `After ${whole(-t.adj)} adjustments`], ["Net collections", whole(t.coll), `${whole(t.ins)} from insurance`], ["Collection rate", pct(t.coll / t.net), "Net collections ÷ net production"]]
          .map(([l, v, s]) => `<div class="py-3 px-4 first:ps-5"><p class="text-[13px] text-gray-500">${l}</p><p class="${R.numberSm} mt-0.5">${v}</p><p class="${R.caption}">${s}</p></div>`).join("")}
      </div>
      <div class="flex justify-end mt-4 mb-1">${legend([["bar", "Gross production"], ["line", "Net collections"], ["goal", ytd ? "Monthly goal" : "Daily goal"]])}</div>
      ${comboChart({ bars: rows.map((r) => r.gross), line: rows.map((r) => r.coll), labels, goal: ytd ? null : Math.round(GOALS[8] / workDays(9).length), goals: ytd ? rows.map((r) => GOALS[+r.id.slice(5, 7) - 1]) : null, w: 980, h: 260 })}
      <p class="${R.caption} mt-2">${ytd ? "Each dash is that month's goal from the Goals page. September's bar is month to date." : "One bar per day the office was open. Closed on Labor Day, Sep 7. Today is still in progress."}</p>
    </div>`;
  }
});

/* ============================================================ 5. Provider scorecard */
const SCORE_BASE = [
  { id: "pr1", hours: 132, visits: 212, gross: 98340, adj: 20850, diag: 142500, acc: 96900, trend: [88, 91, 86, 94, 97, 98] },
  { id: "pr2", hours: 118, visits: 176, gross: 74280, adj: 17680, diag: 118200, acc: 72100, trend: [70, 76, 73, 71, 78, 74] },
  { id: "pr3", hours: 140, visits: 248, gross: 38440, adj: 8150, diag: 24600, acc: 20170, trend: [35, 36, 38, 37, 36, 38] },
  { id: "pr4", hours: 124, visits: 214, gross: 31030, adj: 6920, diag: 19800, acc: 15050, trend: [27, 29, 28, 31, 30, 31] }
];
const SCORE_PERIODS = ["Last 30 days", "Last 90 days", "Month to date", "Year to date"];
const SCORE_MULT = [1, 2.94, 0.83, 8.6];
const scoreRows = (i) => SCORE_BASE.map((b, k) => { const m = SCORE_MULT[i], wob = 1 + (i ? ((hash(b.id + i) % 7) - 3) / 100 : 0);
  const r = { id: b.id, name: DATA.provider(b.id).name, role: DATA.provider(b.id).role, hours: Math.round(b.hours * m), visits: Math.round(b.visits * m), gross: c2(Math.round(b.gross * m * wob)), adj: c2(Math.round(b.adj * m)), diag: Math.round(b.diag * m), acc: Math.round(b.acc * m * wob), trend: b.trend };
  return Object.assign(r, { perHour: c2(r.gross / r.hours), perVisit: c2(r.gross / r.visits), accRate: r.acc / r.diag, adjRate: r.adj / r.gross }); });
const scoreStrip = (rows) => { const s = (k) => rows.reduce((a, r) => a + r[k], 0);
  return metricStrip([["Gross production", whole(s("gross")), { sub: `${s("visits").toLocaleString("en-US")} visits · ${s("hours").toLocaleString("en-US")} hours` }], ["Production / hour", whole(s("gross") / s("hours")), { sub: "Practice average" }], ["Avg / visit", whole(s("gross") / s("visits"))], ["Case acceptance", pct(s("acc") / s("diag")), { sub: `of ${whole(s("diag"))} diagnosed` }], ["Adjustment rate", pct(s("adj") / s("gross")), { sub: `${whole(s("adj"))} adjusted off` }]], "!border-t-0", V2 ? { gutter: PG } : {}); };
/* v2: whole dollars in every money column (matching the strip), no meter beside case acceptance, full names */
const scoreColsV2 = () => { const c = scoreColsV2Raw(), by = Object.fromEntries(c.map((x) => [x.key, x]));
  /* Trend sits beside the production it charts; Hours and Visits (the inputs, totalled in the strip) go last */
  return [by.name, by.gross, { ...by.trend, label: `<span${chg("Trend sits right after Gross production, the number it charts, so it's on screen. Hours and Visits moved to the end; the strip above already totals them.")}>Trend</span>` }, by.perHour, by.perVisit, by.accRate, by.adjRate, by.hours, by.visits]; };
const scoreColsV2Raw = () => [
  { key: "name", label: `<span${chg("One money format: whole dollars in every column, like the numbers across the top. That frees room for the full provider name and the Trend column.")}>Provider</span>`, icon: "user", w: 196, kind: "text", value: (r) => r.name, lead: (r) => avatar(r.name, { size: 5 }), render: (r) => `<span class="font-medium">${esc(r.name)}</span>` },
  { key: "gross", label: "Gross production", w: 112, num: true, kind: "money", render: (r) => whole(r.gross) },
  { key: "hours", label: "Hours", w: 64, num: true, kind: "num", render: (r) => r.hours.toLocaleString("en-US") },
  { key: "visits", label: "Visits", w: 64, num: true, kind: "num", render: (r) => r.visits.toLocaleString("en-US") },
  { key: "perHour", label: "Production / hour", w: 112, num: true, kind: "money", render: (r) => whole(r.perHour) },
  { key: "perVisit", label: "Avg / visit", w: 92, num: true, kind: "money", render: (r) => whole(r.perVisit) },
  { key: "accRate", label: `<span${chg("Case acceptance is a plain percentage: the small bar beside it had no goal mark, so it said the same thing twice.")}>Case acceptance</span>`, w: 112, num: true, kind: "num", render: (r) => pct(r.accRate, 0) },
  { key: "adjRate", label: "Adjustment rate", w: 112, num: true, kind: "num", render: (r) => pct(r.adjRate) },
  { key: "trend", label: "Trend", icon: "activity", w: 84, kind: "text", sortable: false, value: (r) => r.trend.join(), render: (r) => Chart.spark(r.trend, { w: 58, h: 22 }) }
];
const scoreCols = () => [
  { key: "name", label: "Provider", icon: "user", w: 178, kind: "text", lead: (r) => avatar(r.name, { size: 5 }), render: (r) => `<span class="font-medium">${esc(r.name)}</span>` },
  { key: "gross", label: "Gross production", w: 144, num: true, kind: "money", render: (r) => money(r.gross, { cents: false }) },
  { key: "hours", label: "Hours", w: 66, num: true, kind: "num", render: (r) => r.hours.toLocaleString("en-US") },
  { key: "visits", label: "Visits", w: 64, num: true, kind: "num", render: (r) => r.visits.toLocaleString("en-US") },
  { key: "perHour", label: "Production / hour", w: 142, num: true, kind: "money", render: (r) => money(r.perHour) },
  { key: "perVisit", label: "Avg / visit", w: 92, num: true, kind: "money", render: (r) => money(r.perVisit) },
  { key: "accRate", label: "Case acceptance", w: 142, num: true, kind: "num", render: (r) => `<span class="flex items-center justify-end gap-2"><span class="w-12">${Chart.meter(r.accRate, 1)}</span><span class="w-11 tabular-nums">${pct(r.accRate, 0)}</span></span>` },
  { key: "adjRate", label: "Adjustment rate", w: 132, num: true, kind: "num", render: (r) => pct(r.adjRate) },
  { key: "trend", label: "Trend", icon: "activity", w: 84, kind: "text", sortable: false, value: (r) => r.trend.join(), render: (r) => Chart.spark(r.trend, { w: 58, h: 22 }) }
];
defineBlock({
  cat: "revenue", id: "revenue-provider-scorecard", title: "Provider scorecard",
  note: "Each provider side by side. The practice totals across the top are worked out from the rows (production ÷ hours, accepted ÷ diagnosed), not averaged. Change the dates to see it recalculate.",
  where: "Revenue Intelligence › Operations › Provider Scorecard",
  states: ["Normal", "No provider data"],
  canvas: "bare",
  html: (state) => `${workspaceHeader({ parent: "Revenue Intelligence", title: "Provider Scorecard", actions: riActions() })}
    <div class="${PX} pb-5">${V2 && state === "No provider data"
      ? `${metricStrip([["Gross production", "$0"], ["Production / hour", "—"], ["Avg / visit", "—"], ["Case acceptance", "—"], ["Adjustment rate", "—"]], "!border-t-0", { gutter: PG })}
        <div class="flex items-center gap-2 py-2.5"${chg("The toolbar is the same one every list page uses: search, dates, Sort, all 32px.")}>${searchBox("Search providers", { w: "w-44" })}${periodPicker(SCORE_PERIODS, 2, false)}${button("Sort", { v: "quiet", s: "sm", icon: "arrow-up-down" })}<div class="ms-auto">${iconButton("ellipsis", "More", { s: "iconSm" })}</div></div>
        <div class="border-y border-gray-200/80 ${edgeToEdge(PG)}">${emptyState({ icon: "user-cog", title: "No provider data", body: "No procedures were completed from Sep 1 to Sep 25 at this location. Pick a longer range, or check that providers are set on completed procedures.", action: button("Show last 90 days", { v: "white", s: "sm" }) })}</div>`
      : state === "No provider data"
      ? `${metricStrip([["Gross production", "$0"], ["Production / hour", "—"], ["Avg / visit", "—"], ["Case acceptance", "—"], ["Adjustment rate", "—"]], "!border-t-0")}
        <div class="flex items-center gap-2 py-2.5">${searchBox("Search providers", { w: "w-44" })}${periodPicker(SCORE_PERIODS, 2, false)}${button("Sort", { v: "quiet", s: "xs", icon: "arrow-up-down" })}<div class="ms-auto">${iconButton("ellipsis", "More", { s: "iconSm" })}</div></div>
        <div class="border-y border-gray-200/80 ${edgeToEdge(24)}">${emptyState({ icon: "user-cog", title: "No provider data", body: "No procedures were completed from Sep 1 to Sep 25 at this location. Pick a longer range, or check that providers are set on completed procedures.", action: button("Show last 90 days", { v: "white", s: "sm" }) })}</div>`
      : `<div data-sc-strip>${scoreStrip(scoreRows(0))}</div><div data-grid="score"></div>`}</div>`,
  mount: (el) => {
    const host = el.querySelector('[data-grid="score"]'); if (!host) return;
    new RiGrid(host, { gutter: PG, columns: V2 ? scoreColsV2() : scoreCols(), rows: scoreRows(0), title: "Providers", noun: "providers", searchPlaceholder: "Search providers", periods: SCORE_PERIODS, period: 0, selectable: false, addColumn: false, footer: false, maxHeight: 300,
      filters: [{ key: "role", label: "Role", options: [{ value: "Dentist", label: "Dentist" }, { value: "Hygienist", label: "Hygienist" }] }],
      onPeriod: (i, g) => { g.setRows(scoreRows(i)); el.querySelector("[data-sc-strip]").innerHTML = scoreStrip(scoreRows(i)); } });
  }
});

/* ============================================================ 6. Goals year grid */
const GOAL_ROWS = (blank) => GOALS.map((g, i) => { const m = i + 1, actual = m <= 9 ? monthTotal(m).gross : null;
  return { id: m, month: MONTH_LONG[i], goal: blank ? "" : g, actual, coll: blank ? "" : 98, newPts: blank ? "" : [36, 34, 40, 40, 38, 38, 32, 40, 40, 42, 36, 30][i], accept: blank ? "" : 70, perHour: blank ? "" : 480, adjRate: blank ? "" : 22 }; });
class GoalsGrid extends RiGrid {
  onKey(e) { /* type straight into a cell, like a spreadsheet */
    if (e.target.dataset.role === "grid" && this.active && /^[0-9]$/.test(e.key) && this.cols[this.active.c].edit) { e.preventDefault(); this.startEdit(); const ed = this.root.querySelector('[data-role="edit"]'); if (ed) ed.value = e.key; return; }
    super.onKey(e);
  }
  commit(v) { super.commit(v); this.o.toolbarExtra = `<span class="inline-flex items-center gap-1.5 text-[13px] text-blue-600 me-1">${I("check", "size-3.5")}Saved</span>${this.o.idleExtra}`; this.render(); clearTimeout(this.t); this.t = setTimeout(() => { this.o.toolbarExtra = this.o.idleExtra; this.render(); }, 2200); }
}
/* v4: the goals are typed like a spreadsheet on the kit's sheet editing (click or just type, Enter saves and moves
 * down, Tab moves on). Saves are silent; a goal that can't be right keeps an orange mark until it's fixed. */
class GoalsSheetV4 extends RiGrid {
  /* "$250,000" or "98%" are read as numbers */
  commit(value, move, refocus) { return super.commit(typeof value === "string" ? value.replace(/[$,%\s]/g, "") : value, move, refocus); }
}
const GOAL_RATE_KEYS = ["coll", "accept", "adjRate"];
const goalCheckV4 = (row, key, v) => (v === "" || v == null ? ""
  : GOAL_RATE_KEYS.includes(key) && (v < 0 || v > 100) ? "A rate goal is a percentage from 0 to 100."
  : v < 0 ? "A goal can't be below zero." : key === "newPts" && !Number.isInteger(v) ? "New patients is a whole number." : "");
const goalColsV4 = () => goalColsV2().map((c) => (c.edit ? { ...c, edit: "text", placeholder: () => "Set goal" }
  : c.key === "actual" ? { ...c, label: `<span${chg4("A month that hasn't happened yet says “Not yet” in grey instead of a blank, so the column reads on every row")}>Gross production</span>`, render: (r) => (r.actual == null ? `<span class="text-gray-400">Not yet</span>` : c.render(r)) } : c));
function goalsMountV4(el, state) {
  if (!document.getElementById("ri-v4-style")) { const st = document.createElement("style"); st.id = "ri-v4-style";
    /* an empty goal says "Set goal" only when you point at it or select it, as in v2 */
    st.textContent = "[data-goals] .g-sheet td[data-edit] span.text-gray-400{opacity:0}[data-goals] .g-sheet td[data-edit]:hover span.text-gray-400,[data-goals] .g-sheet td[data-active='1'] span.text-gray-400{opacity:1}"; document.head.appendChild(st); }
  const blank = state === "No goals yet";
  const idle = blank ? button("Copy 2025 goals", { v: "solid", s: "sm", icon: "copy" }) : "";
  new GoalsSheetV4(el.querySelector('[data-grid="goals"]'), { columns: goalColsV4(), rows: GOAL_ROWS(blank), title: "Months", noun: "months", search: false, selectable: false, addColumn: false, maxHeight: 520, sortable: false, sortMenu: false, more: false,
    sheet: true, onCommit: goalCheckV4, calc: { goal: "sum", actual: "sum", newPts: "sum" }, toolbarExtra: idle,
    lead: `<span class="${R.caption} ps-1">${blank ? "No goals for 2026 yet. Click a cell and type a number, or copy last year's goals." : "Click a cell or just start typing. Enter saves and moves down."}</span>` });
}
const goalCell = (v, fmt) => (v === "" || v == null ? `<span class="${V2 ? "gl-ph " : ""}text-gray-400">Set goal</span>` : fmt(v));
/* v2: a grey "101%" after the amount instead of a 56px meter (101% and 85% looked the same) */
const goalColsV2 = () => goalCols().map((c) => c.key === "goal" || c.key === "perHour" ? { ...c, fmt: whole }
  : c.key === "actual" ? { ...c, w: 150, fmt: whole, render: (r) => (r.actual == null ? "" : `<span class="tabular-nums">${whole(r.actual)}</span>${r.goal ? ` <span class="inline-block w-11 text-gray-400 tabular-nums">${Math.round((r.actual / r.goal) * 100)}%</span>` : ""}`) }
  : c.key === "month" ? { ...c, w: 140, label: `<span${chg("Months stay in calendar order: the Sort control and the column sorting are gone.")}>Month</span>` } : c);
const goalCols = () => [
  { key: "month", label: "Month", icon: "calendar", w: 108, kind: "text", sortable: false, value: (r) => r.id, render: (r) => `<span class="font-medium">${r.month}</span>` },
  { key: "goal", label: "Production goal", w: 134, num: true, edit: true, kind: "money", render: (r) => goalCell(r.goal, (v) => money(v, { cents: false })) },
  { key: "actual", label: "Gross production", w: 160, num: true, kind: "money", render: (r) => (r.actual == null ? `<span class="text-gray-300">—</span>` : `<span class="flex items-center justify-end gap-2.5">${r.goal ? `<span class="w-14">${Chart.meter(r.actual, r.goal)}</span>` : ""}<span class="tabular-nums">${money(r.actual, { cents: false })}</span></span>`) },
  { key: "coll", label: "Collection rate", w: 122, num: true, edit: true, kind: "num", render: (r) => goalCell(r.coll, (v) => `${v}%`) },
  { key: "newPts", label: "New patients", w: 120, num: true, edit: true, kind: "num", render: (r) => goalCell(r.newPts, String) },
  { key: "accept", label: "Case acceptance", w: 142, num: true, edit: true, kind: "num", render: (r) => goalCell(r.accept, (v) => `${v}%`) },
  { key: "perHour", label: "Production / hour", w: 144, num: true, edit: true, kind: "money", render: (r) => goalCell(r.perHour, (v) => money(v, { cents: false })) },
  { key: "adjRate", label: "Adjustment rate", w: 132, num: true, edit: true, kind: "num", render: (r) => goalCell(r.adjRate, (v) => `${v}%`) }
];
defineBlock({
  cat: "revenue", id: "revenue-goals-grid", title: "Goals for the year",
  note: "Months down the side, goals across the top. Click a cell and type a number, or press Enter to edit; it saves when you leave the cell. Gross production fills in as the year goes, with a small blue bar toward that month's goal.",
  where: "Revenue Intelligence › Settings › Goals",
  states: ["Normal", "No goals yet"],
  canvas: "bare",
  html: (state) => V2 ? `${workspaceHeader({ parent: "Revenue Intelligence", title: `Goals${infoTip("Daily Huddle, Production & Collections and the Provider Scorecard measure against these.", "The “2026 goals” heading and its description line are gone: the year control says 2026, and the description is on this (i).")}`,
      actions: `${segmented(["2025", "2026", "2027"], 1, { sm: true })}<span${chg("Year and scope sit together in the header. The toolbar's second ⋯ is gone.")}>${button("Practice-wide", { v: "white", s: "sm", icon: "building-2", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400" })}</span>${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    <div class="px-4 pb-5"><div data-grid="goals" data-goals data-ri${chg4("Goals are typed like a spreadsheet: click a cell or just start typing, Enter saves and moves down, Tab moves on. Saves are silent (no “Saved” flash), and a goal that can't be right, like a collection rate over 100%, keeps an orange mark until it's fixed.")}></div></div>`
    : `${workspaceHeader({ parent: "Revenue Intelligence", title: "Goals", actions: `${segmented(["2025", "2026", "2027"], 1, { sm: true })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    <div class="px-4 pb-5">
      <div class="flex items-center justify-between gap-4 pt-5 pb-1">
        <div><h2 class="${R.sectionTitle}">2026 goals</h2><p class="${R.help}">Daily Huddle, Production & Collections and the Provider Scorecard measure against these.</p></div>
        ${state === "No goals yet" ? button("Copy 2025 goals", { v: "white", s: "sm", icon: "copy" }) : ""}
      </div>
      ${state === "No goals yet" ? `<div class="pt-2">${note("No goals set for 2026 yet. Type a number in any cell, or copy last year's goals and adjust them.", "info")}</div>` : ""}
      <div data-grid="goals" data-ri></div>
    </div>`,
  mount: (el, state) => {
    if (V4) return goalsMountV4(el, state);
    if (V2) { const blank = state === "No goals yet";
      const idle = blank ? `<span${chg("With no goals yet, “Copy 2025 goals” is the one solid button. Cells stay empty until you point at one (it says “Set goal”), and the instruction is said once.")}>${button("Copy 2025 goals", { v: "solid", s: "sm", icon: "copy" })}</span>` : "";
      new GoalsGrid(el.querySelector('[data-grid="goals"]'), { columns: goalColsV2(), rows: GOAL_ROWS(blank), title: "Months", noun: "months", search: false, selectable: false, addColumn: false, maxHeight: 520, sortable: false, sortMenu: false, more: false,
        calc: { goal: "sum", actual: "sum", newPts: "sum" }, toolbarExtra: idle, idleExtra: idle,
        lead: `<span class="${R.caption} ps-1">${blank ? "No goals for 2026 yet. Click a cell and type a number, or copy last year's goals." : "Click a cell and type to change a goal."}</span>` });
      return; }
    const idle = button("Practice-wide", { v: "white", s: "sm", icon: "building-2", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400" });
    new GoalsGrid(el.querySelector('[data-grid="goals"]'), { columns: goalCols(), rows: GOAL_ROWS(state === "No goals yet"), title: "Months", search: false, selectable: false, addColumn: false, maxHeight: 520,
      calc: { goal: "sum", actual: "sum", newPts: "sum" }, toolbarExtra: idle, idleExtra: idle,
      lead: `<span class="${R.caption} ps-1">Click a cell and type to change a goal.</span>` });
  }
});

/* ============================================================ 7. Daily huddle */
const TODAYS = [["08:00", "p3", "pr3"], ["09:00", "p1", "pr3"], ["09:30", "p9", "pr1"], ["10:00", "p2", "pr2"], ["10:30", "p10", "pr4"], ["11:00", "p5", "pr1"], ["13:00", "p4", "pr4"], ["14:00", "p6", "pr2"], ["15:00", "p7", "pr3"]];
const t12 = (t) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
const appt = (pid) => TODAYS.find((a) => a[1] === pid);
const HUDDLE = {
  Balances: [["p3", "Collect at check-in", 62.5, "Collect"], ["p1", "Collect at check-in. Card on file.", 184, "Collect"], ["p10", "Collect at check-out", 95, "Collect"], ["p5", "Balance past 90 days. Offer a payment plan.", 740, "Collect", true], ["p6", "Collect at check-in", 25, "Collect"]],
  Claims: [["p2", "MetLife paid the crown at 50%. Appeal the downgrade or bill the patient.", 1384.5, "Open claim", true], ["p5", "Aetna needs the perio chart for the deep cleaning claim", 520, "Attach", true], ["p3", "Cleaning claim from Sep 18 is ready to send", 175, "Send"]],
  Insurance: [["p9", "No insurance on file. Ask for her card at check-in.", null, "Add insurance", true], ["p4", "Benefits not checked for this visit", null, "Verify"], ["p6", "Guardian plan changed on Sep 1. Verify the new plan.", null, "Verify", true]],
  Plans: [["p2", "Crown #31 plan not signed yet", 1250, "Open plan"], ["p5", "Deep cleaning, 2 quadrants accepted but not scheduled", 520, "Schedule"], ["p7", "Exam found #14 decay but no plan was made", null, "Make plan"]],
  Tasks: [["p8", "Lab case for crown #14 is 2 days late. Call Bayview Ceramics.", null, "Open task"], ["p2", "MetLife needs details on crown #30", null, "Open task"]]
};
const HUDDLE_KEYS = Object.keys(HUDDLE);
const huddleRows = (k) => HUDDLE[k].map(([pid, todo, amt, act, needs], i) => { const a = appt(pid); return { id: k + i, pid, time: a ? a[0] : "", prov: a ? a[2] : "pr1", todo, amt, act, needs }; });
const huddleCols = () => [
  { key: "time", label: "Time", icon: "clock", w: 96, kind: "text", render: (r) => (r.time ? `<span class="tabular-nums">${t12(r.time)}</span>` : `<span class="text-gray-400">Mon</span>`) },
  { key: "pid", label: "Patient", icon: "user", w: 184, kind: "text", open: true, value: (r) => DATA.patient(r.pid).name, lead: (r) => avatar(DATA.patient(r.pid).name, { size: 5 }), render: (r) => esc(DATA.patient(r.pid).name) },
  { key: "prov", label: "Provider", icon: "stethoscope", w: 128, kind: "text", value: (r) => DATA.provider(r.prov).short, render: (r) => esc(DATA.provider(r.prov).short) },
  { key: "todo", label: "What to do", icon: "list-checks", w: 390, kind: "text", render: (r) => (r.needs ? flag(esc(r.todo), "!text-gray-800 !text-sm") : esc(r.todo)) },
  { key: "amt", label: "Amount", icon: "banknote", w: 116, num: true, kind: "money", render: (r) => (r.amt == null ? `<span class="text-gray-300">—</span>` : money(r.amt)) },
  { key: "act", label: "", w: 132, kind: "text", sortable: false, render: (r) => button(r.act, { v: "ghost", s: "xs", cls: "!text-blue-600 -my-1" }) }
];
/* v2: the action shows on row hover and focus as a small white button; the whole row opens the patient */
const huddleColsV2 = () => huddleCols().map((c) => c.key !== "act" ? c
  : { ...c, label: `<span class="sr-only">Action</span>`, w: 128, render: (r) => `<span class="hd-act">${button(r.act, { v: "white", s: "xs", cls: "-my-1" })}</span>` });
/* v4: the huddle's patient panel. The row's own action (Collect, Verify…) and Open chart are buttons, so the Actions
 * menu leaves them out; the rest is grouped by what it's about. */
function huddleActionsV4(r, p) {
  const skip = { Collect: "Collect payment", Verify: "Verify insurance", Schedule: "Schedule next visit", "Add insurance": "Add insurance" }[r.act];
  const groups = [
    { label: "Visit", items: [{ icon: "message-square", label: "Text patient", hint: "Open the text thread" }, { icon: "send", label: "Send forms", hint: "Text a link to the forms still to sign" },
      p.payer ? { icon: "shield-check", label: "Verify insurance", hint: `Check ${DATA.payer(p.payer).short} benefits for this visit` } : { icon: "shield-plus", label: "Add insurance", hint: "Enter the plan from the patient's card" },
      { icon: "calendar-plus", label: "Schedule next visit", hint: "Book the next appointment" }] },
    { label: "Balance", items: [{ icon: "credit-card", label: "Collect payment", hint: "Take the balance now", off: p.balance ? "" : "Nothing is due from the patient" },
      { icon: "file-text", label: "Send statement", hint: "Text or email what's owed", off: p.balance ? "" : "Nothing is due from the patient" },
      { icon: "calendar-range", label: "Set up payment plan", hint: "Split the balance into monthly payments", suggest: p.balance >= 500 ? "Part of this balance is past 90 days" : "", off: p.balance ? "" : "Nothing is due from the patient" }] },
    { label: "Huddle", items: [{ icon: "check", label: "Mark done", hint: "Take it off today's list" }, { icon: "user-plus", label: "Assign to a teammate", hint: "Hand it over as a task" }, { icon: "calendar-arrow-up", label: "Bring up tomorrow", hint: "Move it to tomorrow's huddle" }] },
    { label: "", items: [{ icon: "eye-off", label: "Dismiss follow-up", hint: "Don't show it again for this visit", danger: true }] }];
  return groups.map((g) => ({ ...g, items: g.items.filter((it) => it.label !== skip) }));
}
function openHuddleSheetV4(r, p) {
  const payers = ["No insurance", ...DATA.payers.map((x) => x.name)];
  Sheet.open({ flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: `${r.time ? t12(r.time) + " today" : "Next visit Mon"} · ${DATA.provider(r.prov).name}`,
    marks: `<span class="flex items-center gap-2"${chg4("This is the one patient header: her medical alerts are one icon with the count by the name (orange when someone must act first, like Premedicate) and the family balance is a wallet with the amount, so the balance isn't a line in the table below")}>${patientMarks({ alerts: p.alerts, familyBalance: p.balance })}</span>`,
    facts: [["Patient balance", money(p.balance)], ["Insurance est.", money(p.insBalance)], ["Carrier", p.payer ? DATA.payer(p.payer).short : "None"]],
    body: `${r.needs ? alertSec("What to do", esc(r.todo)) : psec("What to do", `<p class="${R.body}">${esc(r.todo)}</p>`)}${psec("Account", `<div data-ri-keep${chg4("The account facts are a small table you type into: pick the carrier from a list or fix the phone number right here. Balances are worked out, so they don't edit.")}>${fieldTable([
      { label: "Insurance est.", value: money(p.insBalance), type: "none" },
      { label: "Carrier", value: p.payer ? DATA.payer(p.payer).name : "No insurance", type: "select", options: payers, html: (row) => (row.value === "No insurance" ? `<span class="text-gray-400">No insurance on file</span>` : esc(row.value)) },
      { label: "Phone", value: p.phone }])}</div>`)}`,
    footer: `${v4Menu(huddleActionsV4(r, p), "The rest of what you can do for this patient is in one searchable Actions menu; the row's own action stays the blue button.")}<span class="grow"></span>${button("Open chart", { v: "white", s: "sm" })}${button(r.act, { v: "solid", s: "sm" })}` });
}
function huddleV2Html(state, { sep, today, counts }) {
  return `<div class="px-4 pb-5">
      ${metricStrip([["Today's scheduled production", whole(today.sched), { sub: `${TODAYS.length} patients · 4 providers` }], ["MTD gross production", whole(sep.gross), { goal: (sep.gross / GOALS[8]) * 100, sub: `${Math.round((sep.gross / GOALS[8]) * 100)}% of ${whole(GOALS[8])} goal` }], ["MTD net production", whole(sep.net), { sub: `${whole(-sep.adj)} adjustments` }], ["MTD net collections", whole(sep.coll), { sub: `${pct(sep.coll / sep.net)} collection rate` }]], "!border-t-0", { gutter: PG })}
      <div data-hd-tabs${chg("The “Follow-ups for today's patients” heading row is gone: the header already says Today, and “Updated 7:02 AM” sits at the end of the tabs.")}>${tabsWithSlot(HUDDLE_KEYS.map((k, i) => [k, counts[i]]), 0, `<span class="${R.caption}">Updated 7:02 AM</span>`, "", { gutter: PG })}</div>
      ${state === "Normal" ? `<div data-grid="huddle" data-hd-grid class="[&_.g-wrap]:!border-t-0"${chg("No more column of blue Collect / Verify links: the whole row opens the patient, and the row's action appears as a small white button when you point at the row.")}${chg4("Click a row: the patient's panel has one header (no bar above it), the account facts are a small table you type into, and everything else is in one Actions menu.")}></div>`
        : `<div class="border-b border-gray-200/80 -mx-[${PG}px]" data-hd-empty${chg("The empty box's bottom line runs edge to edge like the tabs above it.")}>${emptyState({ icon: "wallet", title: "No balances to collect today", body: "None of today's 9 patients owe anything right now. Patients with a balance show here the morning of their visit.", action: button("See tomorrow", { v: "white", s: "sm", iconEnd: "arrow-right" }) })}</div><div data-grid="huddle" data-hd-grid class="[&_.g-wrap]:!border-t-0" hidden></div>`}
    </div>`;
}
defineBlock({
  cat: "revenue", id: "revenue-daily-huddle", title: "Daily huddle",
  note: "The morning meeting page. Month-to-date numbers across the top, then one tab per kind of follow-up, each listing today's patients and exactly what to do. Orange marks only the ones that need a person before the visit.",
  where: "Revenue Intelligence › Financial › Daily Huddle",
  states: ["Normal", "Nothing to collect"],
  canvas: "bare",
  html: (state) => {
    const sep = monthTotal(9), today = dayRow(TODAY), counts = HUDDLE_KEYS.map((k) => (state !== "Normal" && k === "Balances" ? 0 : HUDDLE[k].length));
    return `${workspaceHeader({ parent: "Revenue Intelligence", title: "Daily Huddle", actions: `${segmented(["Yesterday", "Today", "Tomorrow"], 1, { sm: true })}${button("All providers", { v: "white", s: "sm", iconEnd: "chevron-down", cls: "[&_svg]:text-gray-400" })}${iconButton("printer", "Print", { s: "iconSm" })}` })}
    ${V2 ? huddleV2Html(state, { sep, today, counts }) : `<div class="px-6 pb-5">
      ${metricStrip([["Today's scheduled production", whole(today.sched), { sub: `${TODAYS.length} patients · 4 providers` }], ["MTD gross production", whole(sep.gross), { goal: (sep.gross / GOALS[8]) * 100, sub: `${Math.round((sep.gross / GOALS[8]) * 100)}% of ${whole(GOALS[8])} goal` }], ["MTD net production", whole(sep.net), { sub: `${whole(-sep.adj)} adjustments` }], ["MTD net collections", whole(sep.coll), { sub: `${pct(sep.coll / sep.net)} collection rate` }]], "!border-t-0")}
      <div class="flex items-baseline justify-between pt-5"><h2 class="${R.sectionTitle}">Follow-ups for today's patients</h2><span class="${R.caption}">Friday, Sep 25 · updated 7:02 AM</span></div>
      <div data-hd-tabs>${tabsWithSlot(HUDDLE_KEYS.map((k, i) => [k, counts[i]]), 0, "", "")}</div>
      ${state === "Normal" ? `<div data-grid="huddle" class="pt-3"></div>`
        : `<div class="border-b border-gray-200/80" data-hd-empty>${emptyState({ icon: "wallet", title: "No balances to collect today", body: "None of today's 9 patients owe anything right now. Patients with a balance show here the morning of their visit.", action: button("See tomorrow", { v: "white", s: "sm", iconEnd: "arrow-right" }) })}</div><div data-grid="huddle" class="pt-3" hidden></div>`}
    </div>`}`;
  },
  mount: (el) => {
    const host = el.querySelector('[data-grid="huddle"]'), empty = el.querySelector("[data-hd-empty]");
    const g = new (V2 ? RiGrid : Grid)(host, { gutter: PG, columns: V2 ? huddleColsV2() : huddleCols(), rows: huddleRows("Balances"), toolbar: false, selectable: false, addColumn: false, maxHeight: 320, title: "Follow-ups", calc: { amt: "sum" },
      onOpen: (r) => { const p = DATA.patient(r.pid);
        if (V4) return openHuddleSheetV4(r, p);
        Sheet.open({ flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: `${r.time ? t12(r.time) + " today" : "Next visit Mon"} · ${DATA.provider(r.prov).name}`,
          body: `${r.needs ? alertSec("What to do", esc(r.todo)) : psec("What to do", `<p class="${R.body}">${esc(r.todo)}</p>`)}${psec("Account", metaGrid([["Patient balance", `<span class="tabular-nums">${money(p.balance)}</span>`], ["Insurance est.", `<span class="tabular-nums">${money(p.insBalance)}</span>`], ["Carrier", p.payer ? DATA.payer(p.payer).name : '<span class="text-gray-400">No insurance on file</span>'], ["Phone", `<span class="tabular-nums">${esc(p.phone)}</span>`]], 2))}`,
          footer: `${button("Open chart", { v: "white", s: "sm" })}${button(r.act, { v: "solid", s: "sm" })}` }); } });
    if (V2) { g.o.noun = "patients"; g.render();
      /* capture phase: runs before the grid re-renders the row for the active cell */
      host.addEventListener("click", (e) => { const tr = e.target.closest("tbody tr.g-row"); if (!tr || e.target.closest("[data-act],button,input")) return; const b = tr.querySelector('[data-act="open"]'); if (b) b.click(); }, true); }
    wireTabs(el.querySelector("[data-hd-tabs]"), (i) => { const k = HUDDLE_KEYS[i];
      if (empty) { empty.hidden = i === 0; host.hidden = i === 0; }
      g.calc = ["Insurance", "Tasks"].includes(k) ? {} : { amt: "sum" }; g.setRows(huddleRows(k)); g.render(); });
  }
});

/* ============================================================ 8. Reports catalog */
const REPORTS = [["Financial", ["Day Sheet", "Deposit Slip", "Ledger Report", "Payment Analysis", "Patient/Family Balances", "Credit Balances", "Unapplied Credits", "Provider Aging", "Procedure Summary"]],
  ["Insurance", ["Outstanding Claims", "Unsent Claims", "Rejections / Denials", "Payer Performance", "Pre-Authorization", "Pending Eligibility"]],
  ["Scheduling", ["Appointment List", "Scheduled vs Actual Production"]],
  ["Patients/Clinical", ["Patient Directory", "New Patients Seen", "Referral Analysis", "Recare Management", "Medical Alerts & Premedication", "Lab Cases"]], ["Admin", ["Audit Log"]]];
const REPORT_ICON = { Financial: "wallet", Insurance: "shield-check", Scheduling: "calendar-days", "Patients/Clinical": "users", Admin: "scroll-text" };
const OUTSTANDING = [["p2", "metlife", "2026-06-30", "2026-07-01", 2695, 1310.5], ["p13", "cigna", "2026-07-22", "2026-07-23", 320, 256], ["p6", "guardian", "2026-05-02", "2026-05-03", 235, 188], ["p15", "aetna", "2026-09-01", "2026-09-08", 465, 372], ["p1", "delta", "2026-09-02", "2026-09-03", 253, 202.4], ["p5", "aetna", "2026-08-14", "2026-08-17", 520, 416], ["p8", "metlife", "2026-09-10", "2026-09-11", 1545, 772.5], ["p10", "delta", "2026-08-25", "2026-08-26", 240, 192], ["p4", "delta", "2026-03-18", "2026-03-19", 80, 80], ["p12", "delta", "2026-02-25", "2026-02-26", 45, 45], ["p3", "cigna", "2026-09-18", "2026-09-19", 175, 140]]
  .map(([pt, payer, svc, sent, billed, est], i) => ({ id: "o" + i, pt, payer, svc, sent, days: daysOut(sent), billed, est }));
const outCols = () => [
  { key: "pt", label: "Patient", icon: "user", w: 174, kind: "text", open: true, value: (r) => DATA.patient(r.pt).name, render: (r) => esc(DATA.patient(r.pt).name) },
  { key: "payer", label: "Payer", icon: "shield", w: 112, kind: "text", value: (r) => DATA.payer(r.payer).short, render: (r) => esc(DATA.payer(r.payer).short) },
  { key: "svc", label: "Service date", icon: "calendar", w: 130, kind: "date", render: (r) => fmtDate(r.svc) },
  { key: "sent", label: "Sent", icon: "send", w: 80, kind: "date", render: (r) => fmtDate(r.sent) },
  { key: "days", label: "Days out", icon: "hourglass", w: 124, num: true, kind: "num", render: (r) => (r.days > 90 ? `<span class="${R.flag} justify-end w-full">${I("circle-alert")}<span class="text-gray-800 tabular-nums">${r.days}</span></span>` : String(r.days)) },
  { key: "billed", label: "Billed", w: 100, num: true, kind: "money", render: (r) => money(r.billed) },
  { key: "est", label: "Ins. est.", w: 100, num: true, kind: "money", render: (r) => money(r.est) }
];
/* v2: the report opens on its rows. Name in the header, description on an (i), Download in the header, the dates,
 * view switch and the one alert in the grid's toolbar, no selection (a report is read-only output). */
const SENT_PERIODS = ["Last 30 days", "Last 90 days", "Last 12 months", "All time"], SENT_DAYS = [30, 90, 365, Infinity];
/* v2: every column fits at 1440px, and number columns are wide enough for their amounts and totals */
const OUT_W = { pt: 152, payer: 112, svc: 152, sent: 96, days: 124, billed: 100, est: 108 };
const outColsV2 = () => outCols().map((c) => ({ ...c, w: OUT_W[c.key] }));
const reportsAlert = (rows) => { const over = rows.filter((r) => r.days > 90).length;
  return over ? `<span class="me-1"${chg("The “11 claims · $3,974.40 ins. est.” line is gone (the totals row has both). Only the part that needs a person stays, as one orange mark.")}>${alertMark(`${over} over 90 days`, `${over} ${over === 1 ? "claim has" : "claims have"} had no answer from the payer for more than 90 days. Check the status, then call the payer if the claim isn't on file.`)}</span>` : ""; };
const reportsExtra = (rows) => reportsAlert(rows);
function reportsV2Html(state, list, q) {
  const menu = state === "Download menu" ? `<div class="absolute end-0 top-full mt-1 z-30 ${R.menu} !w-64 text-start" role="menu">
      ${[["file-spreadsheet", "Download CSV", "All filtered rows"], ["file-text", "Download PDF", "What you see, as a PDF"], ["printer", "Print", "Open the complete printable report"]].map(([ic, l, d]) => `<button type="button" role="menuitem" class="${R.menuItem} !h-auto py-1.5 !items-start text-start">${I(ic, "mt-0.5")}<span><span class="block">${l}</span><span class="block text-xs text-gray-500">${d}</span></span></button>`).join("")}
      <div class="${R.menuSep}"></div><button type="button" role="menuitem" class="${R.menuItem}">${I("calendar-clock")}Schedule by email…</button></div>` : "";
  const title = `<span${chg("The report's name is in the header. The “Insurance” label, the 24px title and the description line are gone; the description is on the (i).")}>Outstanding Claims</span>${infoTip("Claims sent to a payer and not yet paid, oldest first.", "The report's name is in the header. The “Insurance” label, the 24px title and the description line are gone; the description is on the (i).")}`;
  return `${workspaceHeader({ parent: "Reporting & Analytics", title,
      actions: `<span class="me-2"${chg("Results / Charts / Metrics is a small switch in the header instead of its own row above the grid.")}>${segmented(["Results", "Charts", "Metrics"], 0, { sm: true })}</span><div class="relative"${chg("Download moved into the header. The separate printer button is gone: Print is in the Download menu.")}>${button("Download", { v: "quiet", s: "sm", icon: "download", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400", attrs: `aria-haspopup="menu" aria-expanded="${!!menu}"` })}${menu}</div>${button("Saved views", { v: "quiet", s: "sm", icon: "bookmark", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    <div class="grid grid-cols-[${NAV_W}px_1fr] h-[640px]">
      <nav class="border-e border-gray-200/80 p-3 overflow-y-auto"${chg(FRAME_NOTE)} aria-label="Reports"><div class="mb-1">${searchBox("Search reports", { w: "w-full", value: q })}</div>${list}</nav>
      <div class="min-w-0 ${PX} overflow-hidden"><div data-grid="report" data-ri${chg4("Click a patient: the claim's panel has one header (no bar above it), its facts are a small table with status first, and everything else is in one Actions menu.")}></div></div>
    </div>`;
}
defineBlock({
  cat: "revenue", id: "revenue-reports-catalog", title: "Reports catalog and a report",
  note: "Every report in five groups on the left, the open report on the right with Results, Charts and Metrics, and Download CSV, Download PDF and Print in one menu. Search the list to narrow it.",
  where: "Revenue Cycle › Reporting & Analytics",
  states: ["Report", "Download menu", "No match"],
  canvas: "bare",
  html: (state) => {
    const q = state === "No match" ? "perio chart" : "";
    const list = state === "No match" ? `<div class="px-2 py-8 text-center"><p class="text-sm font-medium text-gray-800">No reports match your search.</p><p class="${R.help} mt-1">Try "claims", "balances" or "aging".</p><div class="mt-3">${button("Clear search", { v: "white", s: "xs" })}</div></div>`
      : REPORTS.map(([g, items]) => `<p class="${R.navGroup} flex items-center gap-1.5">${I(REPORT_ICON[g], "size-3.5 text-gray-400")}${g}</p>${items.map((l) => `<a class="${l === "Outstanding Claims" ? R.navItemOn : R.navItem}" ${l === "Outstanding Claims" ? 'aria-current="page"' : ""}><span class="truncate">${l}</span></a>`).join("")}`).join("");
    const menu = state === "Download menu" ? `<div class="absolute end-0 top-full mt-1 z-30 ${R.menu} !w-64" role="menu">
        ${[["file-spreadsheet", "Download CSV", "All filtered rows"], ["file-text", "Download PDF", "What you see, as a PDF"], ["printer", "Print", "Open the complete printable report"]].map(([ic, l, d]) => `<button type="button" role="menuitem" class="${R.menuItem} !h-auto py-1.5 !items-start text-start">${I(ic, "mt-0.5")}<span><span class="block">${l}</span><span class="block text-xs text-gray-500">${d}</span></span></button>`).join("")}
        <div class="${R.menuSep}"></div><button type="button" role="menuitem" class="${R.menuItem}">${I("calendar-clock")}Schedule by email…</button></div>` : "";
    if (V2) return reportsV2Html(state, list, q);
    const total = OUTSTANDING.reduce((a, r) => a + r.est, 0), over = OUTSTANDING.filter((r) => r.days > 90);
    return `${workspaceHeader({ parent: "Revenue Cycle", title: "Reporting & Analytics", actions: `${button("Saved views", { v: "quiet", s: "sm", icon: "bookmark", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400" })}${iconButton("ellipsis", "More", { s: "iconSm" })}` })}
    <div class="grid grid-cols-[220px_1fr] h-[640px]">
      <nav class="border-e border-gray-200/80 p-3 overflow-y-auto" aria-label="Reports"><div class="mb-1">${searchBox("Search reports", { w: "w-full", value: q })}</div>${list}</nav>
      <div class="min-w-0 px-6 pt-5 overflow-hidden">
        <div class="flex items-start justify-between gap-4">
          <div class="min-w-0"><p class="${R.caption} mb-0.5">Insurance</p><h2 class="${R.pageTitle}">Outstanding Claims</h2><p class="${R.secondary} mt-1">Claims sent to a payer and not yet paid, oldest first.</p></div>
          <div class="flex items-center gap-1.5 shrink-0 pt-4"><div class="relative">${button("Download", { v: "white", s: "sm", icon: "download", iconEnd: "chevron-down", cls: "[&_svg:last-child]:text-gray-400", attrs: `aria-haspopup="menu" aria-expanded="${!!menu}"` })}${menu}</div>${iconButton("printer", "Print", { v: "white", s: "iconSm" })}</div>
        </div>
        <div class="mt-4 flex items-center gap-2">${segmented(["Results", "Charts", "Metrics"], 0, { sm: true })}${dateRangeButton("Sent: last 12 months")}
        <p class="ms-auto flex items-center gap-x-4 text-sm text-gray-500 whitespace-nowrap"><span><span class="font-semibold text-gray-800 tabular-nums">${OUTSTANDING.length}</span> claims</span><span><span class="font-semibold text-gray-800 tabular-nums">${money(total)}</span> ins. est.</span><span>${flag(`${over.length} over 90 days`)}</span></p></div>
        <div data-grid="report" class="mt-1" data-ri></div>
      </div>
    </div>`;
  },
  mount: (el) => new (V2 ? RiGrid : Grid)(el.querySelector('[data-grid="report"]'), Object.assign({ gutter: PG, columns: V2 ? outColsV2() : outCols(), rows: OUTSTANDING, title: "All payers", searchPlaceholder: "Search claims", maxHeight: 400, defaultSort: { key: "days", dir: -1 }, calc: { billed: "sum", est: "sum" },
    filters: [{ key: "payer", label: "Payer", options: DATA.payers.map((p) => ({ value: p.id, label: p.short })) }],
    addColumn: false, bulk: [{ label: "Check status", icon: "refresh-cw" }, { label: "Export", icon: "download" }],
    onOpen: reportOpen }, V2 ? { selectable: false, noun: "claims", maxHeight: 520, periods: SENT_PERIODS, period: 2, periodLabel: (i) => `Sent: ${SENT_PERIODS[i].toLowerCase()}`, toolbarExtra: reportsExtra(OUTSTANDING),
      onPeriod: (i, g) => { const rows = OUTSTANDING.filter((r) => r.days <= SENT_DAYS[i]); g.setRows(rows); g.o.toolbarExtra = reportsExtra(rows); } } : {}))
});
function reportOpen(r) { const p = DATA.patient(r.pt);
      if (V4) return reportOpenV4(r, p);
      Sheet.open({ flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: `${DATA.payer(r.payer).name} · Service ${fmtDate(r.svc)}`, actions: iconButton("external-link", "Open in Claims", { s: "iconSm" }),
        body: `${r.days > 90 ? alertSec("Needs follow-up", `No answer from ${DATA.payer(r.payer).short} yet. Check the claim status, then call the payer if it isn't on file.`) : ""}
          ${psec("Claim", metaGrid([["Sent", fmtDateY(r.sent)], ["Days out", `${r.days} days`], ["Billed", `<span class="tabular-nums">${money(r.billed)}</span>`], ["Ins. est.", `<span class="tabular-nums">${money(r.est)}</span>`]], 2))}`,
        footer: `${button("Check status", { v: "white", s: "sm", icon: "refresh-cw" })}${button("Open claim", { v: "solid", s: "sm" })}` }); }

/* v4: the claim opened from the report: one header, the claim's facts as a table with status first, one Actions menu */
function reportOpenV4(r, p) { const py = DATA.payer(r.payer);
  Sheet.open({ flush: true, title: esc(p.name), lead: avatar(p.name, { size: 9 }), subtitle: `${py.name} · Service ${fmtDate(r.svc)}`, actions: iconButton("external-link", "Open in Claims", { s: "iconSm" }),
    facts: [["Ins. est.", money(r.est)], ["Days out", `${r.days} days`], ["Sent", fmtDate(r.sent)]],
    body: `${r.days > 90 ? alertSec("Needs follow-up", `No answer from ${py.short} yet. Check the claim status, then call the payer if it isn't on file.`) : ""}
      ${psec("Claim", `<div data-ri-keep${chg4("The claim's facts are a small table with its status as the first line (a dot and a word you can change), so status no longer needs a line of its own.")}>${fieldTable([v4StatusRow("With payer", `${r.days} days`), { label: "Sent", value: fmtDateY(r.sent), type: "none" },
        { label: "Billed", value: money(r.billed), type: "none", html: (row) => `<span class="tabular-nums">${row.value}</span>` }, { label: "Ins. est.", value: money(r.est), type: "none", html: (row) => `<span class="tabular-nums">${row.value}</span>` }])}</div>`)}`,
    footer: `${v4Menu(v4ClaimActions(py.short, r.days), "Everything else you can do with this claim is in one searchable Actions menu; calling the payer is suggested once it's been out 90 days.")}<span class="grow"></span>${button("Check status", { v: "white", s: "sm", icon: "refresh-cw" })}${button("Open claim", { v: "solid", s: "sm" })}` }); }

})();
